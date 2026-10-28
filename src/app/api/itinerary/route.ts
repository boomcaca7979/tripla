import { buildSystemPrompt, buildUserMessage } from "../../../lib/itinerary-engine";
import { extractJsonObject, isIntlSupportedCurrencyCode, normalizeItinerary } from "../../../lib/itinerary-normalizer";
import { generateId } from "../../../lib/utils";

// gpt-oss-120b 生成完整 itinerary JSON 常规 7-8s，输出波动会逼近/超过
// Vercel 默认 10s 函数上限（连接被杀 → 浏览器 "Failed to fetch"）。
export const maxDuration = 60;

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
// llama-3.3-70b-versatile 于 2026-08 起对 Developer 层下线（Groq 404 model_not_found），
// 换成 Groq 当前文档主推的同级别模型。
const GROQ_MODEL = "openai/gpt-oss-120b";

/**
 * /api/itinerary — AI 行程生成。
 *
 * 数据完整性边界（P4 修复）：
 *  · 生产环境**禁止静默返回 mock itinerary** —— 没有 key、Groq 出错或响应
 *    不可解析时，一律返回明确的错误状态（503/502 + machine-readable code），
 *    由前端呈现真实的错误态，绝不把开发兜底模板伪装成 AI 结果；
 *  · 不打印任何 secret（含 key 前缀）。
 */
export async function POST(request: Request): Promise<Response> {
  // 坏 JSON 体若不接住会变成裸 500（Next 未处理异常），而不是我们的错误信封。
  const body = await request.json().catch(() => null);
  if (body === null || typeof body !== "object") {
    return Response.json(
      { error: { code: "INVALID_INPUT", message: "Request body must be a valid JSON object." } },
      { status: 400 },
    );
  }
  const { input, weather, exchangeRate } = body;

  if (!input) {
    return Response.json(
      { error: { code: "MISSING_INPUT", message: "Missing input" } },
      { status: 400 },
    );
  }

  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    console.error("[itinerary] GROQ_API_KEY is not configured or empty");
    return Response.json(
      {
        error: {
          code: "AI_NOT_CONFIGURED",
          message: "The AI planner is temporarily unavailable. Please try again later.",
        },
      },
      { status: 503 },
    );
  }

  // weather 必须是 WeatherDay[]：/api/weather 的 `daily` 是并行数组对象，
  // 客户端曾直接把它传上来，buildUserMessage 的 .map() 抛 TypeError → 裸 500。
  // 非数组一律按"无天气"处理（提示词省略天气行，不编造）。
  const weatherList = Array.isArray(weather) ? weather : [];

  const userMessage = buildUserMessage(input, weatherList, exchangeRate ?? null);

  console.log("[itinerary] Request payload (redacted):", {
    model: GROQ_MODEL,
    destination: input.destination?.city,
    dates: `${input.departureDate} → ${input.returnDate}`,
    travelStyle: input.travelStyle,
    budgetLevel: input.budgetLevel,
    interests: input.interests,
    groupSize: input.groupSize,
    messageLength: userMessage.length,
  });

  let text = "";
  try {
    const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(30_000),
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      console.error(`[itinerary] Groq error ${response.status}: ${errBody.slice(0, 500)}`);
      return Response.json(
        {
          error: {
            code: "AI_UPSTREAM_ERROR",
            message: "The AI planner could not be reached. Please try again later.",
          },
        },
        { status: 502 },
      );
    }

    const data = await response.json();
    text = data.choices?.[0]?.message?.content ?? "";

    // ── 模型输出 → 契约对象 ────────────────────────────────────────────
    // 2026-10-28 线上实测：模型 200 返回的 JSON 是它自创的结构（destination 是
    // 字符串、活动用 type/startTime/endTime/location、缺 dayNumber…），前端 zod
    // 校验必然失败。这里先有界地取出 JSON，再按 ItinerarySchema 规范化：
    //   · input 只取客户端请求（唯一可信来源），不复用模型回显；
    //   · 字段改名的做显式映射，值非法的整体失败，缺必需字段的活动丢弃；
    //   · 失败一律 502 + error 信封，绝不 200 带一个不合契约的对象。
    const extracted = extractJsonObject(text);
    if (!extracted.ok) {
      console.error(`[itinerary] Model output was not usable JSON (${extracted.message}) len=${text.length}`);
      return invalidPlanResponse();
    }

    const normalized = normalizeItinerary(extracted.value, input, {
      id: generateId(),
      createdAt: new Date().toISOString(),
      fallbackCurrency: await resolveDestinationCurrency(input),
    });
    if (!normalized.ok) {
      // 只记诊断码与结构位置（不含用户内容 / 不含密钥）。
      console.error(`[itinerary] Rejected output: ${normalized.code} — ${normalized.message}`);
      // 请求本身不合法（缺目的地/日期、返程早于出发）→ 400（客户端问题）；
      // 其余（模型输出不可用）→ 502。两者的信封与前端既有处理一致。
      if (normalized.code === "INVALID_REQUEST") {
        return Response.json(
          {
            error: {
              code: "INVALID_INPUT",
              message: "The planning request is incomplete (destination or dates missing).",
            },
          },
          { status: 400 },
        );
      }
      return invalidPlanResponse();
    }

    console.log("[itinerary] Normalized plan:", normalized.stats);
    return Response.json(normalized.itinerary);
  } catch (err: unknown) {
    if (err instanceof SyntaxError) {
      console.error("[itinerary] JSON parse error. Response length:", text.length);
    } else {
      const message = err instanceof Error ? err.message : String(err ?? "Unknown error");
      console.error("[itinerary] Unexpected error:", message);
    }
    return Response.json(
      {
        error: {
          code: "AI_UPSTREAM_ERROR",
          message: "The AI planner could not generate a plan. Please try again later.",
        },
      },
      { status: 502 },
    );
  }
}

/**
 * 模型输出不可用时的统一响应。
 *
 * 走的是前端**既有**错误处理路径（非 2xx + `{ error: { code, message } }`），
 * 因此不需要任何 UI 改动；message 只给用户看，具体原因写服务端日志。
 */
function invalidPlanResponse(): Response {
  return Response.json(
    {
      error: {
        code: "AI_OUTPUT_INVALID",
        message: "The AI planner returned a plan we could not use. Please try again.",
      },
    },
    { status: 502 },
  );
}

/**
 * 目的地**本币**（模型给的代码不被运行时支持时的兜底来源）。
 *
 * 只用于"模型没给出可用币种"这一种情况：返回值最终仍要在
 * `normalizeItinerary` 里再过一次 `isIntlSupportedCurrencyCode`。
 * 注意运行时不提供 `Intl.supportedValuesOf` 时那道检查只剩形状校验 —— 这里返回的是
 * **数据集里的可信值**（大写 ISO），所以降级时应当被接受，不该退到 USD。
 * 城市不在 205 目的地数据集里时返回 undefined（不猜）。
 */
async function resolveDestinationCurrency(input: unknown): Promise<string | undefined> {
  const city = (input as { destination?: { city?: unknown } } | null)?.destination?.city;
  if (typeof city !== "string" || !city.trim()) return undefined;
  try {
    const { DESTINATIONS } = await import("../../../data/destinations");
    const match = DESTINATIONS.find((d) => d.city.toLowerCase() === city.trim().toLowerCase());
    if (!match) return undefined;
    // 注意：`currency` 是目的地本币的展示串（如 "JPY ¥"），`budgetCurrency` 是
    // **预算口径**的币种（Tokyo 的预算是 USD 口径）。行程费用要的是本币，
    // 所以优先取 `currency` 的第一段，运行时不可识别时才退回 `budgetCurrency`。
    const local = match.currency.trim().split(/\s+/)[0] ?? "";
    return isIntlSupportedCurrencyCode(local) ? local : match.budgetCurrency;
  } catch {
    return undefined;
  }
}

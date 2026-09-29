import { buildSystemPrompt, buildUserMessage } from "../../../lib/itinerary-engine";
import type { Itinerary } from "../../../types/itinerary";
import { generateId } from "../../../lib/utils";

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
  const body = await request.json();
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

  const userMessage = buildUserMessage(input, weather ?? [], exchangeRate ?? null);

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

    // 剥离可能的 markdown code fences
    text = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

    const json = JSON.parse(text) as Itinerary;
    json.id = generateId();
    json.createdAt = new Date().toISOString();

    return Response.json(json);
  } catch (err: unknown) {
    if (err instanceof SyntaxError) {
      console.error("[itinerary] JSON parse error. Raw text:", text.slice(0, 500));
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

/**
 * /api/currency — 参考汇率（供 /plan 的汇率组件与 AI 行程提示词使用）。
 *
 * 数据诚信（2026-10-28，依据实测证据）：
 *   此前 `EXCHANGE_RATE_API_KEY` 缺失时会返回写死的 MOCK_RATES，并把
 *   `lastUpdated` 伪造成"刚刚"。该响应在**生产环境实际生效**
 *   （`x-mock-data: true`，USD→JPY 恒为 150），导致两个用户可见后果：
 *     1) /plan 的汇率组件把模拟值渲染成 "Updated <当前时间>"；
 *     2) useItinerary 把它写进 AI 提示词的 `Currency:` 行，行程费用按
 *        错误汇率生成后展示给用户。
 *   现已彻底移除模拟值：未配置 key 时按"服务不可用"返回 503，由调用方
 *   既有错误/空态承接。不返回编造汇率，也不以任何固定汇率冒充实时数据。
 */

export async function GET(request: Request): Promise<Response> {
  const sp = new URL(request.url).searchParams;
  const from = (sp.get("from") ?? "USD").toUpperCase();
  const to = (sp.get("to") ?? "USD").toUpperCase();
  const key = process.env.EXCHANGE_RATE_API_KEY;

  // ── No API key: 明确的"不可用"，绝不返回模拟汇率 ────────────────
  // 诊断信息留在 message 里供日志/服务端消费；UI 侧由 getExchangeRate 映射到
  // 既有空态，不把技术细节当成用户文案，也不降级成任何固定汇率。
  if (!key) {
    return Response.json(
      {
        data: null,
        error: {
          code: "CURRENCY_NOT_CONFIGURED",
          message: "EXCHANGE_RATE_API_KEY is not configured; live rates are unavailable.",
        },
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  // ── Real API call ─────────────────────────────────────────────────
  const url = `https://v6.exchangerate-api.com/v6/${key}/pair/${from}/${to}`;

  let res: Response;
  try {
    res = await fetch(url);
  } catch (err) {
    console.error("[currency] Network error fetching exchange rate:", err);
    return Response.json(
      { data: null, error: { code: "CURRENCY_NETWORK_ERROR", message: err instanceof Error ? err.message : "Network error" } },
      { status: 502 },
    );
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[currency] Upstream returned ${res.status}: ${body.slice(0, 500)}`);
    return Response.json(
      { data: null, error: { code: "CURRENCY_UPSTREAM_ERROR", message: `Upstream ${res.status}: ${body.slice(0, 200)}` } },
      { status: 502 },
    );
  }

  const data = await res.json();
  if (data.result !== "success") {
    console.error("[currency] API returned error:", data["error-type"], JSON.stringify(data).slice(0, 300));
    return Response.json(
      { data: null, error: { code: "CURRENCY_API_ERROR", message: String(data["error-type"] ?? "Unknown API error") } },
      { status: 400 },
    );
  }

  return Response.json(
    { data: { base: from, target: to, rate: data.conversion_rate, lastUpdated: new Date().toISOString() }, error: null },
    { headers: { "Cache-Control": "s-maxage=21600" } },
  );
}

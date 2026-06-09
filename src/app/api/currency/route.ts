// ── Mock exchange rates for demo / no-API-key mode ────────────────────

const MOCK_RATES: Record<string, number> = {
  "USD-TWD": 30.0,
  "USD-JPY": 150.0,
  "USD-EUR": 0.92,
  "USD-GBP": 0.79,
  "USD-KRW": 1350.0,
  "USD-CNY": 7.25,
  "USD-HKD": 7.82,
  "USD-SGD": 1.35,
  "USD-THB": 36.0,
  "USD-AUD": 1.55,
  "USD-AED": 3.67,
  "USD-MYR": 4.72,
  "USD-PHP": 58.0,
  "USD-VND": 25000.0,
  "USD-IDR": 16000.0,
  "USD-INR": 83.0,
  "USD-BRL": 5.0,
  "USD-MXN": 17.0,
  "USD-TRY": 32.0,
  "USD-NZD": 1.68,
  "USD-CAD": 1.37,
  "USD-CHF": 0.88,
  "USD-SEK": 10.8,
  "USD-NOK": 10.6,
  "USD-DKK": 6.88,
  "USD-IEK": 1.0, // IEK not real; fallback
};

function getMockRate(from: string, to: string): number | null {
  if (from === to) return 1;
  const direct = MOCK_RATES[`${from}-${to}`];
  if (direct !== undefined) return direct;
  // Try reverse
  const reverse = MOCK_RATES[`${to}-${from}`];
  if (reverse !== undefined) return 1 / reverse;
  // Try via USD
  const fromUsd = MOCK_RATES[`USD-${from}`];
  const toUsd = MOCK_RATES[`USD-${to}`];
  if (fromUsd !== undefined && toUsd !== undefined) return toUsd / fromUsd;
  return null;
}

export async function GET(request: Request): Promise<Response> {
  const sp = new URL(request.url).searchParams;
  const from = (sp.get("from") ?? "USD").toUpperCase();
  const to = (sp.get("to") ?? "USD").toUpperCase();
  const key = process.env.EXCHANGE_RATE_API_KEY;

  // ── No API key: return mock data ──────────────────────────────────
  if (!key) {
    const mockRate = getMockRate(from, to);
    if (mockRate === null) {
      return Response.json(
        { data: null, error: { code: "MOCK_RATE_UNAVAILABLE", message: `No mock rate for ${from}→${to}` } },
        { status: 404 },
      );
    }
    return Response.json(
      { data: { base: from, target: to, rate: mockRate, lastUpdated: new Date().toISOString(), mock: true }, error: null },
      { headers: { "Cache-Control": "s-maxage=21600", "X-Mock-Data": "true" } },
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

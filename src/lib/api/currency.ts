import type { CurrencyInfo, ExchangeRate } from "@/types/currency";
import type { ApiResponse } from "@/types/common";
import { cache, CACHE_TTL } from "../cache";

// ─── Built-in country → currency map ────────────────────────────────────────

const COUNTRY_CURRENCY_MAP: Record<string, CurrencyInfo> = {
  JP: { code: "JPY", name: "Japanese Yen", symbol: "¥", country: "Japan" },
  US: { code: "USD", name: "US Dollar", symbol: "$", country: "USA" },
  GB: { code: "GBP", name: "British Pound", symbol: "£", country: "UK" },
  AU: {
    code: "AUD",
    name: "Australian Dollar",
    symbol: "A$",
    country: "Australia",
  },
  SG: {
    code: "SGD",
    name: "Singapore Dollar",
    symbol: "S$",
    country: "Singapore",
  },
  TH: {
    code: "THB",
    name: "Thai Baht",
    symbol: "฿",
    country: "Thailand",
  },
  CN: { code: "CNY", name: "Chinese Yuan", symbol: "¥", country: "China" },
  KR: {
    code: "KRW",
    name: "South Korean Won",
    symbol: "₩",
    country: "South Korea",
  },
  TW: {
    code: "TWD",
    name: "New Taiwan Dollar",
    symbol: "NT$",
    country: "Taiwan",
  },
  HK: {
    code: "HKD",
    name: "Hong Kong Dollar",
    symbol: "HK$",
    country: "Hong Kong",
  },
  AE: {
    code: "AED",
    name: "UAE Dirham",
    symbol: "د.إ",
    country: "UAE",
  },
  FR: { code: "EUR", name: "Euro", symbol: "€", country: "France" },
  DE: { code: "EUR", name: "Euro", symbol: "€", country: "Germany" },
  MY: {
    code: "MYR",
    name: "Malaysian Ringgit",
    symbol: "RM",
    country: "Malaysia",
  },
  NL: {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    country: "Netherlands",
  },
  CA: { code: "CAD", name: "Canadian Dollar", symbol: "C$", country: "Canada" },
  IT: { code: "EUR", name: "Euro", symbol: "€", country: "Italy" },
  ES: { code: "EUR", name: "Euro", symbol: "€", country: "Spain" },
  CH: { code: "CHF", name: "Swiss Franc", symbol: "CHF", country: "Switzerland" },
  SE: { code: "SEK", name: "Swedish Krona", symbol: "kr", country: "Sweden" },
  NO: { code: "NOK", name: "Norwegian Krone", symbol: "kr", country: "Norway" },
  DK: { code: "DKK", name: "Danish Krone", symbol: "kr", country: "Denmark" },
  IE: { code: "EUR", name: "Euro", symbol: "€", country: "Ireland" },
  NZ: { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", country: "New Zealand" },
  IN: { code: "INR", name: "Indian Rupee", symbol: "₹", country: "India" },
  BR: { code: "BRL", name: "Brazilian Real", symbol: "R$", country: "Brazil" },
  MX: { code: "MXN", name: "Mexican Peso", symbol: "MX$", country: "Mexico" },
  TR: { code: "TRY", name: "Turkish Lira", symbol: "₺", country: "Turkey" },
  VN: { code: "VND", name: "Vietnamese Dong", symbol: "₫", country: "Vietnam" },
  PH: { code: "PHP", name: "Philippine Peso", symbol: "₱", country: "Philippines" },
  ID: { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", country: "Indonesia" },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function okResponse<T>(data: T): ApiResponse<T> {
  return { data, error: null, loading: false };
}

function errorResponse(
  message: string,
  code = "CURRENCY_ERROR"
): ApiResponse<never> {
  return { data: null, error: { code, message }, loading: false };
}

// ─── Exchange rate ──────────────────────────────────────────────────────────

/**
 * Fetch the latest exchange rate from one currency to another.
 *
 * Delegates to the Next.js `/api/currency?from=&to=` route. Results are
 * cached under `fx_<from>_<to>` with a `CACHE_TTL.CURRENCY` (6-hour) TTL.
 */
export async function getExchangeRate(
  from: string,
  to: string
): Promise<ApiResponse<ExchangeRate>> {
  const cacheKey = `fx_${from}_${to}`;

  const cached = cache.get<ExchangeRate>(cacheKey);
  if (cached !== null) return okResponse(cached);

  const query = new URLSearchParams({ from, to });

  try {
    const res = await fetch(`/api/currency?${query}`);

    if (!res.ok) {
      // 503 = 汇率服务未配置（见 /api/currency）。message 置空是有意的：
      // CurrencyWidget 会回落到它既有的兜底文案（"Unable to load exchange
      // rate."），因此不新增任何可见文案，也不把 HTTP 状态码展示给用户。
      if (res.status === 503) return errorResponse("", "CURRENCY_NOT_CONFIGURED");
      return errorResponse(`Currency API returned ${res.status}`, "API_ERROR");
    }

    const body: ApiResponse<ExchangeRate> = await res.json();

    if (body.error !== null) {
      return errorResponse(body.error?.message ?? String(body.error), body.error?.code ?? "CURRENCY_ERROR");
    }

    if (body.data === null) {
      return errorResponse("No exchange rate data returned", "NO_DATA");
    }

    // 防御：任何带 mock 标记的响应都不得进入缓存、换算或展示。
    // 即便将来有人重新引入模拟数据源，这条守卫仍然把模拟值挡在业务之外。
    if (body.data.mock === true) {
      return errorResponse("", "CURRENCY_MOCK_DATA");
    }

    cache.set(cacheKey, body.data, CACHE_TTL.CURRENCY);
    return okResponse(body.data);
  } catch (err) {
    return errorResponse(
      err instanceof Error ? err.message : "Failed to get exchange rate"
    );
  }
}

// ─── Country → currency lookup ──────────────────────────────────────────────

/**
 * Look up the currency used in a given country (ISO 3166-1 alpha-2 code).
 *
 * Returns `null` when the country code is not in the built-in map.
 */
export function getCurrencyByCountryCode(
  countryCode: string
): CurrencyInfo | null {
  return COUNTRY_CURRENCY_MAP[countryCode.toUpperCase()] ?? null;
}

// ─── Currency formatting ────────────────────────────────────────────────────

/**
 * Format a numeric amount with the appropriate currency symbol and locale.
 *
 * Zero-decimal currencies (JPY, KRW, etc.) automatically omit fractional
 * digits via `Intl.NumberFormat`'s default behaviour for those locales.
 *
 * @example formatCurrency(1234.5, "JPY")       → "¥1,235"
 * @example formatCurrency(1234.5, "USD")       → "$1,234.50"
 * @example formatCurrency(1234.5, "EUR", "de") → "1.234,50 €"
 */
export function formatCurrency(
  amount: number,
  currencyCode: string,
  locale?: string
): string {
  return new Intl.NumberFormat(locale ?? "en-US", {
    style: "currency",
    currency: currencyCode,
    // Intl.NumberFormat handles zero-decimal currencies (JPY, KRW, …)
    // automatically — no need for manual minimumFractionDigits logic.
  }).format(amount);
}

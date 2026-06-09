/**
 * Currency and foreign-exchange type definitions.
 *
 * @module types/currency
 */

/** An exchange rate between two currencies at a point in time. */
export interface ExchangeRate {
  /** 3-letter ISO 4217 base currency code (e.g. "USD"). */
  base: string;
  /** 3-letter ISO 4217 target currency code (e.g. "JPY"). */
  target: string;
  /** Conversion rate (1 base = rate target). */
  rate: number;
  /** ISO 8601 timestamp of when the rate was last updated. */
  lastUpdated: string;
  /** True when the rate comes from mock data (no API key configured). */
  mock?: boolean;
}

/** Metadata about a single currency. */
export interface CurrencyInfo {
  /** 3-letter ISO 4217 currency code (e.g. "JPY"). */
  code: string;
  /** Full currency name (e.g. "Japanese Yen"). */
  name: string;
  /** Currency symbol (e.g. "¥"). */
  symbol: string;
  /** Country or territory where the currency is used. */
  country: string;
}

/** The result of converting an amount from one currency to another. */
export interface CurrencyConversion {
  /** Source currency information. */
  from: CurrencyInfo;
  /** Target currency information. */
  to: CurrencyInfo;
  /** Original amount in the source currency. */
  amount: number;
  /** Converted amount in the target currency. */
  convertedAmount: number;
  /** The exchange rate used for the conversion. */
  rate: number;
  /** ISO 8601 timestamp of when the rate was last updated. */
  lastUpdated: string;
}

"use client";

import { useEffect, useMemo } from "react";
import { useCurrency } from "@/hooks/useCurrency";
import { useTravelStore } from "@/store/travel";
import { getCurrencyByCountryCode } from "@/lib/api/currency";
import Skeleton from "@/components/ui/Skeleton";
import CurrencyConverter from "./CurrencyConverter";
import type { CurrencyInfo } from "@/types/currency";

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Map a currency code to a country code so we can look up CurrencyInfo
 * via `getCurrencyByCountryCode`.
 */
const CURRENCY_TO_COUNTRY: Record<string, string> = {
  USD: "US",
  EUR: "FR",
  GBP: "GB",
  JPY: "JP",
  CNY: "CN",
  KRW: "KR",
  TWD: "TW",
  HKD: "HK",
  SGD: "SG",
  THB: "TH",
  AUD: "AU",
  AED: "AE",
  MYR: "MY",
  CAD: "CA",
  CHF: "CH",
  SEK: "SE",
  NOK: "NO",
  DKK: "DK",
  NZD: "NZ",
  INR: "IN",
  BRL: "BR",
  MXN: "MX",
  TRY: "TR",
  VND: "VN",
  PHP: "PH",
  IDR: "ID",
};

function findCurrencyInfo(currencyCode: string): CurrencyInfo | null {
  const country = CURRENCY_TO_COUNTRY[currencyCode];
  if (!country) return null;
  return getCurrencyByCountryCode(country);
}

// ── Props ────────────────────────────────────────────────────────────

interface CurrencyWidgetProps {
  destinationCountryCode: string;
  originCountryCode?: string;
}

// ── Component ────────────────────────────────────────────────────────

export default function CurrencyWidget({
  destinationCountryCode,
  originCountryCode,
}: CurrencyWidgetProps) {
  const preferredCurrency = useTravelStore((s) => s.preferredCurrency);
  const { rate, loading, error, fetchRate } = useCurrency();

  const targetInfo = useMemo(
    () => getCurrencyByCountryCode(destinationCountryCode),
    [destinationCountryCode],
  );

  const baseInfo = useMemo(() => {
    // Prefer origin country currency over store's preferredCurrency
    if (originCountryCode) {
      const originInfo = getCurrencyByCountryCode(originCountryCode);
      if (originInfo) return originInfo;
    }
    return findCurrencyInfo(preferredCurrency);
  }, [originCountryCode, preferredCurrency]);

  // ── Fetch rate when both currencies are known ────────────────────
  useEffect(() => {
    if (targetInfo && baseInfo && targetInfo.code !== baseInfo.code) {
      fetchRate(baseInfo.code, targetInfo.code);
    }
  }, [baseInfo?.code, targetInfo?.code, fetchRate]);

  // ── Missing currency map ─────────────────────────────────────────
  if (!targetInfo) {
    return (
      <p className="text-sm text-gray-500">
        Currency information not available for this destination.
      </p>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton variant="rect" height={38} />
        <Skeleton variant="text" width="60%" height={14} />
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────
  if (error) {
    return (
      <p className="text-sm text-red-600">
        {error.message || "Unable to load exchange rate."}
      </p>
    );
  }

  // ── No rate data yet ─────────────────────────────────────────────
  if (!rate) {
    return (
      <p className="text-sm text-gray-500">
        Exchange rate unavailable for {baseInfo?.code ?? preferredCurrency} →{" "}
        {targetInfo.code}.
      </p>
    );
  }

  // ── Converter ────────────────────────────────────────────────────
  return (
    <CurrencyConverter
      rate={rate}
      baseCurrencyInfo={baseInfo ?? { code: preferredCurrency, name: preferredCurrency, symbol: "", country: "" }}
      targetCurrencyInfo={targetInfo}
    />
  );
}

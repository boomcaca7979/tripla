"use client";

import { useState, useCallback, useMemo } from "react";
import type { ExchangeRate, CurrencyInfo } from "@/types/currency";

// ── Props ────────────────────────────────────────────────────────────

interface CurrencyConverterProps {
  rate: ExchangeRate;
  baseCurrencyInfo: CurrencyInfo;
  targetCurrencyInfo: CurrencyInfo;
}

// ── Helpers ──────────────────────────────────────────────────────────

/** Format ISO datetime to a user-friendly string. */
function formatUpdated(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// ── Component ────────────────────────────────────────────────────────

export default function CurrencyConverter({
  rate,
  baseCurrencyInfo,
  targetCurrencyInfo,
}: CurrencyConverterProps) {
  const [baseAmount, setBaseAmount] = useState("1");
  const [targetAmount, setTargetAmount] = useState(
    rate.rate.toFixed(2),
  );

  const [focused, setFocused] = useState<"base" | "target" | null>(null);

  const handleBaseChange = useCallback(
    (value: string) => {
      setBaseAmount(value);
      const num = parseFloat(value);
      setTargetAmount(Number.isNaN(num) ? "" : (num * rate.rate).toFixed(2));
    },
    [rate.rate],
  );

  const handleTargetChange = useCallback(
    (value: string) => {
      setTargetAmount(value);
      const num = parseFloat(value);
      setBaseAmount(Number.isNaN(num) ? "" : (num / rate.rate).toFixed(2));
    },
    [rate.rate],
  );

  return (
    <div className="space-y-3">
      {/* ── Input row ────────────────────────────────────────────── */}
      <div className="flex items-end gap-2">
        {/* Base currency input */}
        <div className="flex-1">
          <label
            htmlFor="currency-base"
            className="mb-1 block text-xs font-medium text-gray-500"
          >
            {baseCurrencyInfo.code} — {baseCurrencyInfo.name}
          </label>
          <div className="flex items-center rounded-lg border border-gray-300 bg-white transition-colors hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500">
            <span className="shrink-0 pl-3 text-sm text-gray-400">
              {baseCurrencyInfo.symbol}
            </span>
            <input
              id="currency-base"
              type="number"
              min={0}
              step="any"
              value={baseAmount}
              onFocus={() => setFocused("base")}
              onChange={(e) => handleBaseChange(e.target.value)}
              className="w-full min-w-0 rounded-lg border-0 bg-transparent py-2 pr-3 pl-1.5 text-sm text-gray-900 outline-none ring-0 focus:outline-none focus:ring-0"
              aria-label={`Amount in ${baseCurrencyInfo.code}`}
            />
          </div>
        </div>

        <span className="mb-2 text-sm text-gray-400" aria-hidden="true">
          →
        </span>

        {/* Target currency input */}
        <div className="flex-1">
          <label
            htmlFor="currency-target"
            className="mb-1 block text-xs font-medium text-gray-500"
          >
            {targetCurrencyInfo.code} — {targetCurrencyInfo.name}
          </label>
          <div className="flex items-center rounded-lg border border-gray-300 bg-white transition-colors hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500">
            <span className="shrink-0 pl-3 text-sm text-gray-400">
              {targetCurrencyInfo.symbol}
            </span>
            <input
              id="currency-target"
              type="number"
              min={0}
              step="any"
              value={targetAmount}
              onFocus={() => setFocused("target")}
              onChange={(e) => handleTargetChange(e.target.value)}
              className="w-full min-w-0 rounded-lg border-0 bg-transparent py-2 pr-3 pl-1.5 text-sm text-gray-900 outline-none ring-0 focus:outline-none focus:ring-0"
              aria-label={`Amount in ${targetCurrencyInfo.code}`}
            />
          </div>
        </div>
      </div>

      {/* ── Rate info ────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <span className="font-medium">
          1 {rate.base} = {rate.rate} {rate.target}
        </span>
        <span className="mx-1.5">·</span>
        <span>Updated {formatUpdated(rate.lastUpdated)}</span>
        {rate.mock && (
          <span className="ml-1 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
            Demo rate
          </span>
        )}
      </div>
    </div>
  );
}

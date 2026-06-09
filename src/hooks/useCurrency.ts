import { useState, useCallback } from "react";
import { getExchangeRate } from "../lib/api/currency";
import { useTravelStore } from "../store/travel";
import type { ExchangeRate } from "../types/currency";
import type { AppError } from "../types/common";

export function useCurrency() {
  const [rate, setRate] = useState<ExchangeRate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const fetchRate = useCallback(async (from: string, to: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await getExchangeRate(from, to);
      if (res.error !== null || !res.data) {
        setError(
          res.error ?? {
            code: "CURRENCY_ERROR",
            message: "Failed to fetch exchange rate",
          },
        );
        setLoading(false);
        return;
      }

      setRate(res.data);
    } catch (err) {
      setError({
        code: "UNEXPECTED_ERROR",
        message:
          err instanceof Error ? err.message : "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const convert = useCallback(
    (amount: number, rate: ExchangeRate): number => {
      // Multiply by the exchange rate and round to 2 decimal places
      return Math.round(rate.rate * amount * 100) / 100;
    },
    [],
  );

  return { rate, loading, error, convert, fetchRate };
}

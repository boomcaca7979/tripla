import { useState, useCallback, useRef } from "react";
import { generateItinerary } from "@/lib/itinerary-engine";
import { toWeatherDays } from "@/lib/api/weather";
import type { Itinerary, TravelPlanInput } from "@/types/itinerary";
import type { WeatherDay } from "@/types/weather";
import type { AppError } from "@/types/common";

// ── City → preferred target currency ────────────────────────────────
// Used to pick the right rate when normalising the itinerary budget.
// Falls back to USD when the destination is unknown.

const CITY_CURRENCY: Record<string, string> = {
  tokyo: "JPY",
  osaka: "JPY",
  kyoto: "JPY",
  bangkok: "THB",
  phuket: "THB",
  chiangmai: "THB",
  paris: "EUR",
  rome: "EUR",
  barcelona: "EUR",
  madrid: "EUR",
  amsterdam: "EUR",
  berlin: "EUR",
  frankfurt: "EUR",
  london: "GBP",
  edinburgh: "GBP",
  "new york": "USD",
  "los angeles": "USD",
  "san francisco": "USD",
  chicago: "USD",
  singapore: "SGD",
  dubai: "AED",
  sydney: "AUD",
  melbourne: "AUD",
  istanbul: "TRY",
  taipei: "TWD",
  hongkong: "HKD",
  seoul: "KRW",
  beijing: "CNY",
  shanghai: "CNY",
};

function currencyForCity(city: string): string {
  if (!city) return "USD";
  return CITY_CURRENCY[city.toLowerCase().trim()] ?? "USD";
}

// ── Types ────────────────────────────────────────────────────────────

export interface GenerationStep {
  label: string;
  status: "pending" | "running" | "done" | "error";
}

const INITIAL_STEPS: GenerationStep[] = [
  { label: "Analyzing travel preferences", status: "pending" },
  { label: "Fetching weather data", status: "pending" },
  { label: "Generating itinerary", status: "pending" },
  { label: "Finalizing recommendations", status: "pending" },
];

// ── Hook ─────────────────────────────────────────────────────────────

export function useItinerary() {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [progress, setProgress] = useState<GenerationStep[]>(INITIAL_STEPS);
  const controllerRef = useRef<AbortController | null>(null);

  const advanceStep = useCallback((index: number, status: GenerationStep["status"]) => {
    setProgress((prev) =>
      prev.map((s, i) => (i === index ? { ...s, status } : s)),
    );
  }, []);

  const generate = useCallback(async (input: TravelPlanInput) => {
    // Cancel any in-flight generation
    controllerRef.current?.abort();

    setLoading(true);
    setError(null);
    setItinerary(null);
    setProgress(INITIAL_STEPS);

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      advanceStep(0, "running");

      // Simulate step 0 completing quickly
      await new Promise((r) => setTimeout(r, 200));
      advanceStep(0, "done");
      advanceStep(1, "running");

      // Simulate step 1 completing
      await new Promise((r) => setTimeout(r, 200));
      advanceStep(1, "done");
      advanceStep(2, "running");

      // Fetch weather data via the geocoding API to get coordinates
      let weatherData: WeatherDay[] = [];
      try {
        const geoRes = await fetch(`/api/geocoding?q=${encodeURIComponent(input.destination.city)}&count=1`);
        const geo = await geoRes.json();
        if (geo.length > 0) {
          const { latitude, longitude, timezone } = geo[0];
          const weatherRes = await fetch(
            `/api/weather?latitude=${latitude}&longitude=${longitude}&startDate=${input.departureDate}&endDate=${input.returnDate}&timezone=${timezone}`,
          );
          // /api/weather 返回 Open-Meteo 原始结构：`daily` 是**并行数组对象**
          // （{ time: [...], temperature_2m_max: [...] }），不是 WeatherDay[]。
          // 此前直接把它当数组传给 /api/itinerary，服务端 buildUserMessage 对它
          // 调 .map() 抛 TypeError → 裸 500（2026-10-28 生产实测）。
          weatherData = toWeatherDays((await weatherRes.json()).daily);
        }
      } catch {
        // Proceed without weather
      }

      advanceStep(2, "done");
      advanceStep(3, "running");

      // Call itinerary generation API
      const targetCurrency = currencyForCity(input.destination.city);
      const rateRes = await fetch(
        `/api/currency?from=${encodeURIComponent("USD")}&to=${encodeURIComponent(targetCurrency)}`,
      );
      const rateData = await rateRes.json().catch(() => null);

      // 只有"真实且未标记 mock"的汇率才允许进入 AI 提示词。服务不可用、
      // 返回错误体或带 mock 标记时一律传 null —— buildUserMessage 会省略
      // Currency 行，AI 不会按编造汇率换算行程费用。
      const liveRate =
        rateData?.data && rateData.data.mock !== true ? rateData.data : null;

      const result = await generateItinerary(
        input,
        weatherData,
        liveRate,
      );

      if (result.error !== null) {
        setError(result.error);
        advanceStep(3, "error");
        return;
      }

      if (!result.data) {
        setError({ code: "NO_DATA", message: "No itinerary data returned." });
        advanceStep(3, "error");
        return;
      }

      setItinerary(result.data);
      advanceStep(3, "done");
    } catch (err) {
      console.error("Full error object:", err);
      if (err instanceof DOMException && err.name === "AbortError") return;

      setError({
        code: "GENERATION_ERROR",
        message: err instanceof Error ? err.message : String(err ?? "Itinerary generation failed"),
      });
      setProgress((prev) =>
        prev.map((s) => (s.status === "running" ? { ...s, status: "error" as const } : s)),
      );
    } finally {
      setLoading(false);
    }
  }, [advanceStep]);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    setItinerary(null);
    setLoading(false);
    setError(null);
    setProgress(INITIAL_STEPS);
  }, []);

  return { itinerary, loading, error, progress, generate, reset };
}

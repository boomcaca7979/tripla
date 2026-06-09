import { useState, useCallback, useRef } from "react";
import { generateItinerary } from "@/lib/itinerary-engine";
import type { Itinerary, TravelPlanInput } from "@/types/itinerary";
import type { WeatherDay } from "@/types/weather";
import type { AppError } from "@/types/common";

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
          weatherData = (await weatherRes.json()).daily ?? [];
        }
      } catch {
        // Proceed without weather
      }

      advanceStep(2, "done");
      advanceStep(3, "running");

      // Call itinerary generation API
      const rateRes = await fetch(
        `/api/currency?from=${encodeURIComponent("USD")}&to=${encodeURIComponent("JPY")}`,
      );
      const rateData = await rateRes.json().catch(() => null);

      const result = await generateItinerary(
        input,
        weatherData,
        rateData?.data ?? null,
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

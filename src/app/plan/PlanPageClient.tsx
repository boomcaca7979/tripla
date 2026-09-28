"use client";

import { useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useItinerary } from "@/hooks/useItinerary";
import { useFlightSearch } from "@/hooks/useFlightSearch";
import { useWeather } from "@/hooks/useWeather";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import FlightList from "@/components/flight/FlightList";
import ItineraryTimeline from "@/components/itinerary/ItineraryTimeline";
import WeatherPanel from "@/components/weather/WeatherPanel";
import CurrencyWidget from "@/components/currency/CurrencyWidget";
import type { Airport } from "@/types/flight";
import type {
  TravelPlanInput,
  TravelStyle,
  BudgetLevel,
  TravelInterest,
} from "@/types/itinerary";

// ── Helpers ──────────────────────────────────────────────────────────

const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  Japan: "JP",
  USA: "US",
  "United States": "US",
  UK: "GB",
  "United Kingdom": "GB",
  France: "FR",
  Germany: "DE",
  China: "CN",
  "South Korea": "KR",
  Taiwan: "TW",
  "Hong Kong": "HK",
  Singapore: "SG",
  Thailand: "TH",
  Australia: "AU",
  UAE: "AE",
  Malaysia: "MY",
  Netherlands: "NL",
  Canada: "CA",
  Italy: "IT",
  Spain: "ES",
  Switzerland: "CH",
  Sweden: "SE",
  Norway: "NO",
  Denmark: "DK",
  Ireland: "IE",
  "New Zealand": "NZ",
  India: "IN",
  Brazil: "BR",
  Mexico: "MX",
  Turkey: "TR",
  Vietnam: "VN",
  Philippines: "PH",
  Indonesia: "ID",
};

function countryNameToCode(name: string): string {
  return COUNTRY_NAME_TO_CODE[name.trim()] ?? "US";
}

// ── Component ────────────────────────────────────────────────────────

export default function PlanPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 无参数时立即替换到正式规划入口（/trips/new）—— 不停留在死胡同页（P5）。
  useEffect(() => {
    const departureDate = searchParams.get("departureDate");
    const returnDate = searchParams.get("returnDate");
    const destinationRaw = searchParams.get("destination");
    let hasDestination = false;
    try {
      hasDestination = Boolean(destinationRaw && JSON.parse(destinationRaw));
    } catch {
      hasDestination = false;
    }
    if (!hasDestination || !departureDate || !returnDate) {
      router.replace("/trips/new");
    }
  }, [searchParams, router]);

  // ── Parse URL params ─────────────────────────────────────────────
  const originRaw = searchParams.get("origin") ?? "null";
  const destinationRaw = searchParams.get("destination") ?? "null";
  const departureDate = searchParams.get("departureDate") ?? "";
  const returnDate = searchParams.get("returnDate") ?? "";
  const travelStyleParam = searchParams.get("travelStyle") ?? "relaxed";
  const budgetLevelParam = searchParams.get("budgetLevel") ?? "mid-range";
  const interestsParam = searchParams.get("interests") ?? "";
  const groupSizeParam = searchParams.get("groupSize") ?? "1";

  const origin = useMemo<Airport | null>(() => {
    try {
      return JSON.parse(originRaw) as Airport;
    } catch {
      return null;
    }
  }, [originRaw]);

  const destination = useMemo<Airport | null>(() => {
    try {
      return JSON.parse(destinationRaw) as Airport;
    } catch {
      return null;
    }
  }, [destinationRaw]);

  const interests = useMemo(
    () =>
      interestsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [interestsParam],
  );

  const groupSize = useMemo(
    () => Math.max(1, parseInt(groupSizeParam, 10) || 1),
    [groupSizeParam],
  );

  const destinationCountryCode = useMemo(
    () => (destination && destination.country ? countryNameToCode(destination.country) : ""),
    [destination],
  );

  const originCountryCode = useMemo(
    () => (origin && origin.country ? countryNameToCode(origin.country) : ""),
    [origin],
  );

  // ── Build TravelPlanInput ────────────────────────────────────────
  const travelPlanInput = useMemo<TravelPlanInput | null>(() => {
    if (!origin || !destination || !departureDate || !returnDate) return null;
    return {
      origin,
      destination,
      departureDate,
      returnDate,
      travelStyle: travelStyleParam as TravelStyle,
      budgetLevel: budgetLevelParam as BudgetLevel,
      interests: interests as TravelInterest[],
      groupSize,
    };
  }, [
    origin,
    destination,
    departureDate,
    returnDate,
    travelStyleParam,
    budgetLevelParam,
    interests,
    groupSize,
  ]);

  // ── Hooks ─────────────────────────────────────────────────────────
  const flightSearch = useFlightSearch();
  const weather = useWeather();
  const itinerary = useItinerary();

  // ── Trigger fetches on mount / param change ──────────────────────
  useEffect(() => {
    if (!travelPlanInput || !origin || !destination) return;

    itinerary.generate(travelPlanInput);

    flightSearch.search({
      depIata: origin.iata,
      arrIata: destination.iata,
      date: departureDate,
    });

    weather.fetchForDestination(
      destination.city,
      departureDate,
      returnDate,
    );
    // Run once per unique set of search params
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departureDate, destinationRaw, originRaw]);

  // ── Retry handlers ───────────────────────────────────────────────
  const handleFlightRetry = useCallback(() => {
    if (!origin || !destination) return;
    flightSearch.search({
      depIata: origin.iata,
      arrIata: destination.iata,
      date: departureDate,
    });
  }, [origin, destination, departureDate, flightSearch.search]);

  const handleWeatherRetry = useCallback(() => {
    if (!destination) return;
    weather.fetchForDestination(
      destination.city,
      departureDate,
      returnDate,
    );
  }, [destination, departureDate, returnDate, weather.fetchForDestination]);

  // ── Empty state → 统一规划入口（P5） ────────────────────────────────
  // 无参数进入 /plan 不再是死胡同：直接进入正式 trip planner（/trips/new）。
  // 带参数的 /plan 完全不受影响（保留原有 in-page 工具作为深链承接）。
  if (!travelPlanInput) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <h1 className="text-2xl font-semibold text-gray-700">Opening your trip planner…</h1>
        <p className="mt-1 text-sm text-gray-400">
          Taking you to the trip planner. If nothing happens, continue manually.
        </p>
        <Link
          href="/trips/new"
          className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-md border border-gray-300 px-5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400"
        >
          Open the trip planner
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    );
  }

  // ── Layout ────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Main column */}
        <div className="flex-1 space-y-8">
          <ErrorBoundary>
            <FlightList
              flights={flightSearch.flights}
              loading={flightSearch.loading}
              error={flightSearch.error}
              onRetry={handleFlightRetry}
            />
          </ErrorBoundary>

          <ErrorBoundary>
            <ItineraryTimeline
              itinerary={itinerary.itinerary}
              loading={itinerary.loading}
              progress={itinerary.progress}
              flights={flightSearch.flights}
            />
          </ErrorBoundary>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:w-80">
          <ErrorBoundary>
            <WeatherPanel
              forecast={weather.forecast}
              scores={weather.scores}
              overallScore={weather.overallScore}
              loading={weather.loading}
              error={weather.error}
              onRetry={handleWeatherRetry}
            />
          </ErrorBoundary>

          <ErrorBoundary>
            <CurrencyWidget
              destinationCountryCode={destinationCountryCode}
              originCountryCode={originCountryCode}
            />
          </ErrorBoundary>
        </aside>
      </div>
    </div>
  );
}

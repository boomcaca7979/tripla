"use client";

import { useEffect, useMemo, useCallback } from "react";
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

  // ── Empty state ───────────────────────────────────────────────────
  if (!travelPlanInput) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <p className="text-lg font-medium text-gray-500">
          No search parameters found.
        </p>
        <p className="text-sm text-gray-400">
          Go back to the homepage and search for a trip.
        </p>
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
            />
          </ErrorBoundary>
        </aside>
      </div>
    </div>
  );
}

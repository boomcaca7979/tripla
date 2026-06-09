"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { decodeShareData } from "@/lib/share";
import ItineraryTimeline from "@/components/itinerary/ItineraryTimeline";
import type { GenerationStep } from "@/components/itinerary/ItineraryTimeline";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import FlightList from "@/components/flight/FlightList";

// ── Component ────────────────────────────────────────────────────────

export default function SharePageClient() {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get("data");

  if (!dataParam) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <div className="text-5xl">🔗</div>
        <h1 className="text-2xl font-bold text-gray-900">
          Invalid Share Link
        </h1>
        <p className="text-sm text-gray-500">
          This share link is missing itinerary data.
        </p>
        <Link
          href="/"
          className="mt-4 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Plan your own trip
        </Link>
      </div>
    );
  }

  const shared = decodeShareData(decodeURIComponent(dataParam));

  if (!shared || !shared.itinerary) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <div className="text-5xl">😕</div>
        <h1 className="text-2xl font-bold text-gray-900">
          Could Not Load Itinerary
        </h1>
        <p className="text-sm text-gray-500">
          The shared data may be corrupted or expired.
        </p>
        <Link
          href="/"
          className="mt-4 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Plan your own trip
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Shared badge */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        Shared itinerary
      </div>

      {/* Flights */}
      {shared.flights && shared.flights.length > 0 && (
        <ErrorBoundary>
          <div className="mb-8">
            <FlightList
              flights={shared.flights}
              loading={false}
              error={null}
              onRetry={() => {}}
            />
          </div>
        </ErrorBoundary>
      )}

      {/* Itinerary */}
      <ErrorBoundary>
        <ItineraryTimeline
          itinerary={shared.itinerary}
          loading={false}
          progress={[] as GenerationStep[]}
          flights={shared.flights}
        />
      </ErrorBoundary>

      {/* CTA */}
      <div className="mt-12 rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900">
          Plan your own trip with AI
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Create personalized itineraries with real-time flight data, weather
          scoring, and AI recommendations.
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-blue-700"
        >
          Get Started
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

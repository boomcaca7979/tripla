"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import WeatherScore from "@/components/weather/WeatherScore";
import { useTravelStore } from "@/store/travel";
import { buildHotelSearchUrl } from "@/lib/affiliate";
import type { TravelInterest } from "@/types/itinerary";
import {
  DESTINATIONS,
  type Destination,
  type Region,
} from "@/data/destinations";

// ── Filter options ─────────────────────────────────────────────────────

const REGION_FILTERS: Region[] = ["Asia", "Europe", "Americas", "Oceania"];

const INTEREST_FILTERS: TravelInterest[] = [
  "food",
  "beaches",
  "history",
  "shopping",
];

const INTEREST_LABELS: Record<TravelInterest, string> = {
  museums: "Museums",
  nature: "Nature",
  food: "Foodie",
  shopping: "Shopping",
  nightlife: "Nightlife",
  history: "History",
  sports: "Sports",
  beaches: "Beaches",
};

const PAGE_SIZE = 9;

/** Hotel affiliate 链接的默认日期（今天起 7 晚）。模块级 helper，避免渲染期直接调用 new Date()。 */
function defaultHotelDates() {
  const checkIn = new Date().toISOString().slice(0, 10);
  const checkOut = new Date(Date.now() + 7 * 86400000)
    .toISOString()
    .slice(0, 10);
  return { checkIn, checkOut };
}

// ── Component ──────────────────────────────────────────────────────────

export default function DestinationsClient() {
  const router = useRouter();
  const setSearchParams = useTravelStore((s) => s.setSearchParams);

  const [query, setQuery] = useState("");
  const [activeRegions, setActiveRegions] = useState<Region[]>([]);
  const [activeInterests, setActiveInterests] = useState<TravelInterest[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // ── Filter logic ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DESTINATIONS.filter((d) => {
      if (q) {
        const hay = `${d.city} ${d.country}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (activeRegions.length > 0 && !activeRegions.includes(d.region)) {
        return false;
      }
      if (activeInterests.length > 0) {
        const hasInterest = activeInterests.some((i) =>
          d.interests.includes(i),
        );
        if (!hasInterest) return false;
      }
      return true;
    });
  }, [query, activeRegions, activeInterests]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // ── Handlers ──────────────────────────────────────────────────────────
  const toggleRegion = useCallback((region: Region) => {
    setActiveRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region],
    );
    setVisibleCount(PAGE_SIZE);
  }, []);

  const toggleInterest = useCallback((interest: TravelInterest) => {
    setActiveInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
    setVisibleCount(PAGE_SIZE);
  }, []);

  const handlePlanTrip = useCallback(
    (d: Destination) => {
      setSearchParams({
        destination: d.airport,
        travelStyle: d.travelStyle,
        interests: d.interests,
      });
      router.push("/?to=" + encodeURIComponent(d.city) + "#hero-search");
    },
    [router, setSearchParams],
  );

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white pt-24">
      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Explore Destinations
        </h1>
        <p className="mt-3 max-w-2xl text-base text-gray-500 sm:text-lg">
          Discover your next adventure from our curated collection of cities
          worldwide
        </p>

        {/* ── Search + filters ──────────────────────────────────────── */}
        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          {/* Search input */}
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
              placeholder="Search cities or countries…"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-colors hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Region filters */}
          <div className="mt-4">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Region
            </span>
            <div className="flex flex-wrap gap-2">
              {REGION_FILTERS.map((region) => {
                const active = activeRegions.includes(region);
                return (
                  <button
                    key={region}
                    type="button"
                    onClick={() => toggleRegion(region)}
                    className={[
                      "inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm transition-all",
                      active
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50",
                    ].join(" ")}
                  >
                    {region}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interest filters */}
          <div className="mt-4">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Interests
            </span>
            <div className="flex flex-wrap gap-2">
              {INTEREST_FILTERS.map((interest) => {
                const active = activeInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={[
                      "inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm transition-all",
                      active
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50",
                    ].join(" ")}
                  >
                    {INTEREST_LABELS[interest]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Result count ──────────────────────────────────────────── */}
        <div className="mt-6 text-sm text-gray-500">
          Showing {visible.length} of {filtered.length} destinations
        </div>

        {/* ── Destination grid ──────────────────────────────────────── */}
        {visible.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
            <div className="text-4xl">🗺️</div>
            <h3 className="mt-3 text-lg font-semibold text-gray-900">
              No destinations match your filters
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or clearing the filters.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((d) => (
              <DestinationCard
                key={d.id}
                destination={d}
                onPlan={() => handlePlanTrip(d)}
              />
            ))}
          </div>
        )}

        {/* ── Load more ─────────────────────────────────────────────── */}
        {hasMore && (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-8 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Load More
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 5v14" />
                <path d="M5 12l7 7 7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Card component ─────────────────────────────────────────────────────

function DestinationCard({
  destination,
  onPlan,
}: {
  destination: Destination;
  onPlan: () => void;
}) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
      {/* Hero image / gradient */}
      <div className={`relative h-48 overflow-hidden bg-gradient-to-br ${destination.gradient}`}>
        {destination.image ? (
          <Image
            src={destination.image}
            alt={destination.city}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : null}
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Region badge */}
        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
            {destination.region}
          </span>
        </div>

        {/* Weather score */}
        <div className="absolute right-4 top-4 rounded-full bg-white/90 p-1 shadow-sm backdrop-blur-sm">
          <WeatherScore score={destination.weatherScore} size="sm" />
        </div>

        {/* City + country on image bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-2xl font-bold text-white">{destination.city}</h3>
          <p className="text-sm text-white/80">{destination.country}</p>
        </div>

        {/* Plan trip overlay — always visible on mobile, hover on desktop */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-100 sm:opacity-0 transition-opacity duration-300 sm:group-hover:opacity-100">
          <button
            type="button"
            onClick={onPlan}
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-gray-900 shadow-lg transition-transform hover:scale-105"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
            Plan Trip
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm leading-relaxed text-gray-600">
          {destination.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700">
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4" />
              <path d="M8 2v4" />
              <path d="M3 10h18" />
            </svg>
            {destination.bestMonths}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-700">
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 1v22" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            {destination.currency}
          </span>
        </div>

        {/* Book Hotel affiliate link + View guide 内链 (Phase 9 Step 8) */}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
          <Link
            href={`/destinations/${destination.slug}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            View guide →
          </Link>
          <a
            href={buildHotelSearchUrl({
              city: destination.city,
              ...defaultHotelDates(),
            })}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
          >
            Book Hotel
          </a>
        </div>
      </div>
    </div>
  );
}

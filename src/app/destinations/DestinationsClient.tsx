"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import WeatherScore from "@/components/weather/WeatherScore";
import { useTravelStore } from "@/store/travel";
import type { Airport } from "@/types/flight";
import type { WeatherScore as WeatherScoreType } from "@/types/weather";
import type { TravelStyle, TravelInterest } from "@/types/itinerary";

// ── Types ──────────────────────────────────────────────────────────────

type Region = "Asia" | "Europe" | "Americas" | "Oceania";

interface Destination {
  id: string;
  city: string;
  country: string;
  region: Region;
  description: string;
  bestMonths: string;
  currency: string;
  /** Hex gradient used as fallback background (e.g. "from-rose-500 to-red-600"). */
  gradient: string;
  /** Optional local image under /public; null falls back to gradient. */
  image: string | null;
  weatherScore: WeatherScoreType;
  airport: Airport;
  travelStyle: TravelStyle;
  interests: TravelInterest[];
}

// ── Mock data ──────────────────────────────────────────────────────────

const DESTINATIONS: Destination[] = [
  {
    id: "tokyo",
    city: "Tokyo",
    country: "Japan",
    region: "Asia",
    description: "Neon-lit streets meet ancient temples.",
    bestMonths: "Mar-May",
    currency: "JPY ¥",
    gradient: "from-rose-500 to-pink-700",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    weatherScore: {
      overall: 86,
      label: "Excellent",
      breakdown: { temperature: 88, precipitation: 80, wind: 85, sunshine: 90 },
      recommendation: "Mild and mostly sunny — ideal for sightseeing.",
    },
    airport: {
      iata: "NRT",
      icao: "RJAA",
      name: "Narita International Airport",
      city: "Tokyo",
      country: "Japan",
      timezone: "Asia/Tokyo",
      latitude: 35.7647,
      longitude: 140.3864,
    },
    travelStyle: "foodie",
    interests: ["food", "shopping", "history"],
  },
  {
    id: "paris",
    city: "Paris",
    country: "France",
    region: "Europe",
    description: "Romance, art and café culture on the Seine.",
    bestMonths: "Apr-Jun",
    currency: "EUR €",
    gradient: "from-indigo-500 to-pink-600",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
    weatherScore: {
      overall: 78,
      label: "Good",
      breakdown: { temperature: 76, precipitation: 72, wind: 80, sunshine: 84 },
      recommendation: "Pleasant spring weather — perfect for long walks.",
    },
    airport: {
      iata: "CDG",
      icao: "LFPG",
      name: "Charles de Gaulle Airport",
      city: "Paris",
      country: "France",
      timezone: "Europe/Paris",
      latitude: 49.0097,
      longitude: 2.5479,
    },
    travelStyle: "cultural",
    interests: ["museums", "food", "history"],
  },
  {
    id: "newyork",
    city: "New York",
    country: "USA",
    region: "Americas",
    description: "The city that never sleeps — a concrete jungle of dreams.",
    bestMonths: "Sep-Oct",
    currency: "USD $",
    gradient: "from-amber-500 to-red-600",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
    weatherScore: {
      overall: 74,
      label: "Good",
      breakdown: { temperature: 72, precipitation: 70, wind: 78, sunshine: 76 },
      recommendation: "Cool autumn days — great for walking the boroughs.",
    },
    airport: {
      iata: "JFK",
      icao: "KJFK",
      name: "John F. Kennedy International Airport",
      city: "New York",
      country: "USA",
      timezone: "America/New_York",
      latitude: 40.6413,
      longitude: -73.7781,
    },
    travelStyle: "active",
    interests: ["museums", "food", "nightlife"],
  },
  {
    id: "bangkok",
    city: "Bangkok",
    country: "Thailand",
    region: "Asia",
    description: "Temple spires, floating markets and fiery street food.",
    bestMonths: "Nov-Feb",
    currency: "THB ฿",
    gradient: "from-orange-500 to-yellow-600",
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80",
    weatherScore: {
      overall: 81,
      label: "Excellent",
      breakdown: { temperature: 85, precipitation: 78, wind: 76, sunshine: 86 },
      recommendation: "Dry, warm and sunny — a great time to explore the city.",
    },
    airport: {
      iata: "BKK",
      icao: "VTBS",
      name: "Suvarnabhumi Airport",
      city: "Bangkok",
      country: "Thailand",
      timezone: "Asia/Bangkok",
      latitude: 13.69,
      longitude: 100.7501,
    },
    travelStyle: "foodie",
    interests: ["food", "history", "shopping"],
  },
  {
    id: "london",
    city: "London",
    country: "United Kingdom",
    region: "Europe",
    description: "Royal palaces, world-class theatre and timeless pubs.",
    bestMonths: "May-Sep",
    currency: "GBP £",
    gradient: "from-slate-700 to-blue-900",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
    weatherScore: {
      overall: 68,
      label: "Good",
      breakdown: { temperature: 65, precipitation: 60, wind: 70, sunshine: 78 },
      recommendation: "Mild with passing showers — pack a light jacket.",
    },
    airport: {
      iata: "LHR",
      icao: "EGLL",
      name: "London Heathrow Airport",
      city: "London",
      country: "United Kingdom",
      timezone: "Europe/London",
      latitude: 51.47,
      longitude: -0.4543,
    },
    travelStyle: "cultural",
    interests: ["museums", "history", "nightlife"],
  },
  {
    id: "sydney",
    city: "Sydney",
    country: "Australia",
    region: "Oceania",
    description: "Harbour city with iconic opera house and sunny beaches.",
    bestMonths: "Sep-Nov",
    currency: "AUD A$",
    gradient: "from-sky-500 to-cyan-700",
    image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80",
    weatherScore: {
      overall: 89,
      label: "Excellent",
      breakdown: { temperature: 90, precipitation: 85, wind: 86, sunshine: 95 },
      recommendation: "Sunny and warm — ideal for the harbour and the surf.",
    },
    airport: {
      iata: "SYD",
      icao: "YSSY",
      name: "Sydney Kingsford Smith Airport",
      city: "Sydney",
      country: "Australia",
      timezone: "Australia/Sydney",
      latitude: -33.9399,
      longitude: 151.1753,
    },
    travelStyle: "active",
    interests: ["beaches", "nature", "food"],
  },
  {
    id: "dubai",
    city: "Dubai",
    country: "UAE",
    region: "Asia",
    description: "Futuristic skyline rising out of the desert sand.",
    bestMonths: "Nov-Mar",
    currency: "AED د.إ",
    gradient: "from-amber-400 to-orange-700",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
    weatherScore: {
      overall: 82,
      label: "Excellent",
      breakdown: { temperature: 84, precipitation: 92, wind: 78, sunshine: 74 },
      recommendation: "Sunny and dry — great for desert and beach days.",
    },
    airport: {
      iata: "DXB",
      icao: "OMDB",
      name: "Dubai International Airport",
      city: "Dubai",
      country: "UAE",
      timezone: "Asia/Dubai",
      latitude: 25.2532,
      longitude: 55.3657,
    },
    travelStyle: "active",
    interests: ["shopping", "food", "nightlife"],
  },
  {
    id: "rome",
    city: "Rome",
    country: "Italy",
    region: "Europe",
    description: "Where every cobblestone whispers ancient history.",
    bestMonths: "Apr-Jun",
    currency: "EUR €",
    gradient: "from-amber-600 to-rose-700",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
    weatherScore: {
      overall: 80,
      label: "Excellent",
      breakdown: { temperature: 82, precipitation: 74, wind: 80, sunshine: 84 },
      recommendation: "Warm Mediterranean days — perfect for piazzas and gelato.",
    },
    airport: {
      iata: "FCO",
      icao: "LIRF",
      name: "Leonardo da Vinci–Fiumicino Airport",
      city: "Rome",
      country: "Italy",
      timezone: "Europe/Rome",
      latitude: 41.8003,
      longitude: 12.2389,
    },
    travelStyle: "cultural",
    interests: ["history", "food", "museums"],
  },
  {
    id: "barcelona",
    city: "Barcelona",
    country: "Spain",
    region: "Europe",
    description: "Gaudí dreams meet Mediterranean sea breeze.",
    bestMonths: "May-Jun",
    currency: "EUR €",
    gradient: "from-pink-500 to-orange-500",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80",
    weatherScore: {
      overall: 85,
      label: "Excellent",
      breakdown: { temperature: 86, precipitation: 80, wind: 82, sunshine: 92 },
      recommendation: "Sunny and warm — perfect for beaches and architecture.",
    },
    airport: {
      iata: "BCN",
      icao: "LEBL",
      name: "Barcelona–El Prat Airport",
      city: "Barcelona",
      country: "Spain",
      timezone: "Europe/Madrid",
      latitude: 41.2974,
      longitude: 2.0833,
    },
    travelStyle: "active",
    interests: ["beaches", "history", "nightlife"],
  },
  {
    id: "singapore",
    city: "Singapore",
    country: "Singapore",
    region: "Asia",
    description: "A futuristic garden city with world-class hawker food.",
    bestMonths: "Feb-Apr",
    currency: "SGD S$",
    gradient: "from-emerald-500 to-teal-700",
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80",
    weatherScore: {
      overall: 75,
      label: "Good",
      breakdown: { temperature: 78, precipitation: 65, wind: 78, sunshine: 80 },
      recommendation: "Warm with brief tropical showers — carry an umbrella.",
    },
    airport: {
      iata: "SIN",
      icao: "WSSS",
      name: "Singapore Changi Airport",
      city: "Singapore",
      country: "Singapore",
      timezone: "Asia/Singapore",
      latitude: 1.3644,
      longitude: 103.9915,
    },
    travelStyle: "foodie",
    interests: ["food", "shopping", "nature"],
  },
  {
    id: "istanbul",
    city: "Istanbul",
    country: "Turkey",
    region: "Europe",
    description: "Where East meets West across the Bosphorus.",
    bestMonths: "Apr-May",
    currency: "TRY ₺",
    gradient: "from-red-500 to-rose-700",
    image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80",
    weatherScore: {
      overall: 76,
      label: "Good",
      breakdown: { temperature: 75, precipitation: 70, wind: 80, sunshine: 80 },
      recommendation: "Pleasant spring weather for the bazaars and mosques.",
    },
    airport: {
      iata: "IST",
      icao: "LTFM",
      name: "Istanbul Airport",
      city: "Istanbul",
      country: "Turkey",
      timezone: "Europe/Istanbul",
      latitude: 41.2753,
      longitude: 28.7519,
    },
    travelStyle: "cultural",
    interests: ["history", "food", "shopping"],
  },
  {
    id: "seoul",
    city: "Seoul",
    country: "South Korea",
    region: "Asia",
    description: "K-pop, palaces and an electric street food scene.",
    bestMonths: "Mar-May",
    currency: "KRW ₩",
    gradient: "from-violet-500 to-fuchsia-700",
    image: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80",
    weatherScore: {
      overall: 79,
      label: "Good",
      breakdown: { temperature: 80, precipitation: 74, wind: 78, sunshine: 84 },
      recommendation: "Mild and sunny — perfect for exploring the city.",
    },
    airport: {
      iata: "ICN",
      icao: "RKSI",
      name: "Incheon International Airport",
      city: "Seoul",
      country: "South Korea",
      timezone: "Asia/Seoul",
      latitude: 37.4602,
      longitude: 126.4407,
    },
    travelStyle: "active",
    interests: ["food", "shopping", "history"],
  },
];

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
      </div>
    </div>
  );
}

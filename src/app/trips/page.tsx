"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTravelStore } from "@/store/travel";
import type { Airport } from "@/types/flight";
import type { TravelStyle, TravelInterest } from "@/types/itinerary";

// ── Types ──────────────────────────────────────────────────────────────

interface Author {
  /** "ai" = tripla AI, otherwise treated as a community author. */
  kind: "ai" | "user";
  name: string;
  avatarColor: string;
  initials: string;
}

interface Activity {
  time: string;
  name: string;
  emoji: string;
}

interface TripDay {
  day: number;
  theme: string;
  activities: Activity[];
}

interface Restaurant {
  name: string;
  cuisine: string;
  emoji: string;
}

interface Trip {
  id: string;
  title: string;
  /** Optional cover image under /public; null falls back to gradient. */
  coverImage: string | null;
  /** Fallback gradient when no cover image. */
  gradient: string;
  author: Author;
  days: number;
  estimatedCost: number;
  currency: string;
  tags: string[];
  excerpt: string;
  weatherTip: string;
  fullDays: TripDay[];
  restaurants: Restaurant[];
  city: string;
  country: string;
  airport: Airport;
  travelStyle: TravelStyle;
  interests: TravelInterest[];
}

// ── Mock data ──────────────────────────────────────────────────────────

const TRIPS: Trip[] = [
  {
    id: "tokyo-3d-foodie",
    title: "Tokyo 3-Day Foodie Adventure",
    coverImage: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    gradient: "from-rose-500 to-pink-700",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 800,
    currency: "USD",
    tags: ["Foodie", "Shopping", "Culture"],
    excerpt:
      "Three days of sushi, ramen and Shibuya neon — a tightly packed taste of Tokyo at a relaxed pace.",
    weatherTip:
      "Aim for March–May or October–November for mild temperatures and clear skies. Summer is humid; winter is dry and cool.",
    fullDays: [
      {
        day: 1,
        theme: "Tsukiji & Shibuya",
        activities: [
          { time: "08:00", name: "Sushi breakfast at Tsukiji Outer Market", emoji: "🍣" },
          { time: "11:00", name: "Meiji Shrine & Yoyogi Park stroll", emoji: "⛩️" },
          { time: "14:00", name: "Harajuku Takeshita Street shopping", emoji: "🛍️" },
          { time: "19:00", name: "Shibuya Crossing & ramen dinner", emoji: "🍜" },
        ],
      },
      {
        day: 2,
        theme: "Asakusa & Akihabara",
        activities: [
          { time: "09:00", name: "Senso-ji Temple & Nakamise-dori", emoji: "🏯" },
          { time: "13:00", name: "Akihabara electronics & anime", emoji: "🤖" },
          { time: "17:00", name: "Ueno Park museum visit", emoji: "🖼️" },
          { time: "20:00", name: "Izakaya hopping in Shinjuku", emoji: "🍶" },
        ],
      },
      {
        day: 3,
        theme: "Shinjuku & Ginza",
        activities: [
          { time: "10:00", name: "Shinjuku Gyoen gardens", emoji: "🌸" },
          { time: "13:00", name: "Depachika (underground food hall) lunch", emoji: "🍱" },
          { time: "16:00", name: "Ginza boutique window-shopping", emoji: "💎" },
          { time: "20:00", name: "Robot Restaurant show & farewell dinner", emoji: "🤖" },
        ],
      },
    ],
    restaurants: [
      { name: "Sushi Dai", cuisine: "Sushi · $$$", emoji: "🍣" },
      { name: "Ichiran Shibuya", cuisine: "Tonkotsu ramen · $", emoji: "🍜" },
      { name: "Omoide Yokocho", cuisine: "Yakitori alley · $$", emoji: "🏮" },
    ],
    city: "Tokyo",
    country: "Japan",
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
    id: "paris-weekend",
    title: "Paris Romantic Weekend",
    coverImage: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
    gradient: "from-indigo-500 to-pink-600",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 2,
    estimatedCost: 600,
    currency: "USD",
    tags: ["Culture", "Foodie", "Couples"],
    excerpt:
      "Two art-filled days along the Seine — Louvre mornings, café afternoons, a sunset cruise, and one unforgettable dinner.",
    weatherTip:
      "April–June or September–October is ideal. Pack a light jacket even in summer — Parisian evenings cool off fast.",
    fullDays: [
      {
        day: 1,
        theme: "Louvre & Latin Quarter",
        activities: [
          { time: "09:00", name: "Louvre Museum (Mona Lisa & Venus de Milo)", emoji: "🖼️" },
          { time: "13:00", name: "Café de Flore lunch in Saint-Germain", emoji: "☕" },
          { time: "16:00", name: "Walk the Jardin du Luxembourg", emoji: "🌳" },
          { time: "20:00", name: "Seine River sunset cruise", emoji: "🌊" },
        ],
      },
      {
        day: 2,
        theme: "Montmartre & Eiffel",
        activities: [
          { time: "09:00", name: "Sacré-Cœur & Montmartre artists", emoji: "🎨" },
          { time: "13:00", name: "Eiffel Tower & Champ de Mars picnic", emoji: "🗼" },
          { time: "17:00", name: "Le Marais vintage boutiques", emoji: "🛍️" },
          { time: "20:30", name: "Le Marais wine bar dinner", emoji: "🍷" },
        ],
      },
    ],
    restaurants: [
      { name: "Café de Flore", cuisine: "Classic Parisian café · $$$", emoji: "☕" },
      { name: "Le Comptoir du Relais", cuisine: "Bistro · $$", emoji: "🥖" },
      { name: "Du Pain et des Idées", cuisine: "Bakery · $", emoji: "🥐" },
    ],
    city: "Paris",
    country: "France",
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
    id: "nyc-explorer",
    title: "New York City Explorer",
    coverImage: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
    gradient: "from-amber-500 to-red-600",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 900,
    currency: "USD",
    tags: ["Active", "Culture", "Foodie"],
    excerpt:
      "Midtown icons, Brooklyn mornings and a Broadway night — three full days of the city that never sleeps.",
    weatherTip:
      "September–October has the best weather. Winter is cold but festive; summer is hot and crowded.",
    fullDays: [
      {
        day: 1,
        theme: "Midtown Manhattan",
        activities: [
          { time: "09:00", name: "Times Square & Bryant Park", emoji: "🌃" },
          { time: "12:00", name: "Top of the Rock observation deck", emoji: "🏙️" },
          { time: "15:00", name: "MoMA or Grand Central tour", emoji: "🎨" },
          { time: "19:30", name: "Broadway show", emoji: "🎭" },
        ],
      },
      {
        day: 2,
        theme: "Central Park & Museums",
        activities: [
          { time: "08:00", name: "Central Park bike ride", emoji: "🌳" },
          { time: "12:00", name: "Metropolitan Museum of Art", emoji: "🏛️" },
          { time: "17:00", name: "Hell's Kitchen dinner", emoji: "🍽️" },
          { time: "21:00", name: "Rooftop bar in Midtown", emoji: "🍸" },
        ],
      },
      {
        day: 3,
        theme: "Brooklyn & Downtown",
        activities: [
          { time: "07:00", name: "Brooklyn Bridge walk at sunrise", emoji: "🌉" },
          { time: "11:00", name: "DUMBO & Brooklyn Flea", emoji: "🛍️" },
          { time: "15:00", name: "9/11 Memorial & One World Observatory", emoji: "🕊️" },
          { time: "20:00", name: "Greenwich Village jazz club", emoji: "🎷" },
        ],
      },
    ],
    restaurants: [
      { name: "Joe's Pizza", cuisine: "Classic NYC slice · $", emoji: "🍕" },
      { name: "Katz's Delicatessen", cuisine: "Pastrami · $$", emoji: "🥪" },
      { name: "Le Bernardin", cuisine: "French seafood · $$$$", emoji: "🦞" },
    ],
    city: "New York",
    country: "USA",
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
    id: "bangkok-nightlife",
    title: "Bangkok Night Market Journey",
    coverImage: null,
    gradient: "from-orange-500 to-yellow-600",
    author: { kind: "user", name: "Lalita S.", avatarColor: "from-orange-500 to-yellow-500", initials: "LS" },
    days: 3,
    estimatedCost: 450,
    currency: "USD",
    tags: ["Foodie", "Nightlife", "Budget"],
    excerpt:
      "Street food from dusk to dawn — Chinatown skewers, floating markets, and a rooftop bar to cap it all off.",
    weatherTip:
      "November–February is cool and dry. Avoid March–May (very hot) and the heavy September rains.",
    fullDays: [
      {
        day: 1,
        theme: "Chinatown & Yaowarat",
        activities: [
          { time: "17:00", name: "Wat Pho temple visit at golden hour", emoji: "🛕" },
          { time: "19:30", name: "Yaowarat street food crawl", emoji: "🥢" },
          { time: "22:00", name: "T&K Seafood dinner", emoji: "🦐" },
        ],
      },
      {
        day: 2,
        theme: "Floating Market & Maeklong",
        activities: [
          { time: "07:00", name: "Damnoen Saduak floating market", emoji: "🛶" },
          { time: "11:00", name: "Maeklong Railway Market", emoji: "🚂" },
          { time: "16:00", name: "Chatuchak weekend market (if Sat/Sun)", emoji: "🛍️" },
          { time: "21:00", name: "Khao San Road night scene", emoji: "🎒" },
        ],
      },
      {
        day: 3,
        theme: "Rooftops & Riverside",
        activities: [
          { time: "10:00", name: "Jim Thompson House silk museum", emoji: "🏛️" },
          { time: "14:00", name: "Asiatique the Riverfront shopping", emoji: "🛒" },
          { time: "19:00", name: "Vertigo rooftop dinner", emoji: "🌃" },
          { time: "22:00", name: "Riverside bar on the Chao Phraya", emoji: "🍹" },
        ],
      },
    ],
    restaurants: [
      { name: "Jay Fai", cuisine: "Legendary street crab omelette · $$$", emoji: "🦀" },
      { name: "T&K Seafood", cuisine: "Chinatown seafood · $$", emoji: "🦐" },
      { name: "Gaggan Anand", cuisine: "Progressive Indian · $$$$", emoji: "🍛" },
    ],
    city: "Bangkok",
    country: "Thailand",
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
    interests: ["food", "nightlife", "shopping"],
  },
  {
    id: "london-cultural",
    title: "London Cultural Walk",
    coverImage: null,
    gradient: "from-slate-700 to-blue-900",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 2,
    estimatedCost: 550,
    currency: "USD",
    tags: ["History", "Museums", "Slow Travel"],
    excerpt:
      "Seven centuries of London on foot — Tower, Borough Market, the South Bank, and a free museum afternoon.",
    weatherTip:
      "May–September is the mildest. Always carry a light rain jacket — London weather is famously changeable.",
    fullDays: [
      {
        day: 1,
        theme: "The City & the South Bank",
        activities: [
          { time: "08:30", name: "Tower of London & Crown Jewels", emoji: "🏰" },
          { time: "11:00", name: "Walk across Tower Bridge", emoji: "🌉" },
          { time: "13:00", name: "Borough Market lunch", emoji: "🧀" },
          { time: "16:00", name: "Tate Modern on the South Bank", emoji: "🖼️" },
          { time: "19:30", name: "West End theatre show", emoji: "🎭" },
        ],
      },
      {
        day: 2,
        theme: "Westminster & Covent Garden",
        activities: [
          { time: "09:00", name: "Westminster Abbey & Big Ben", emoji: "🏛️" },
          { time: "12:00", name: "St. Paul's Cathedral", emoji: "⛪" },
          { time: "15:00", name: "British Museum (free)", emoji: "🏺" },
          { time: "19:00", name: "Covent Garden dinner & street performers", emoji: "🍷" },
        ],
      },
    ],
    restaurants: [
      { name: "Borough Market stalls", cuisine: "Street food · $", emoji: "🧀" },
      { name: "The Wolseley", cuisine: "Grand European brasserie · $$$", emoji: "🥐" },
      { name: "Sketch", cuisine: "Afternoon tea · $$$$", emoji: "🫖" },
    ],
    city: "London",
    country: "United Kingdom",
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
    interests: ["history", "museums", "food"],
  },
  {
    id: "sydney-nature",
    title: "Sydney Nature Adventure",
    coverImage: null,
    gradient: "from-sky-500 to-cyan-700",
    author: { kind: "user", name: "Olivia P.", avatarColor: "from-sky-500 to-cyan-500", initials: "OP" },
    days: 3,
    estimatedCost: 700,
    currency: "USD",
    tags: ["Adventure", "Nature", "Beaches"],
    excerpt:
      "Coastal walks, hidden harbour coves and a sunrise kayak — three days of outdoor Sydney beyond the Opera House.",
    weatherTip:
      "September–November is spring perfection. February is the hottest month; June–August is mild but shorter days.",
    fullDays: [
      {
        day: 1,
        theme: "Bondi to Coogee",
        activities: [
          { time: "07:00", name: "Bondi to Coogee coastal walk", emoji: "🌊" },
          { time: "10:30", name: "Bronte Baths ocean swim", emoji: "🏊" },
          { time: "13:00", name: "Lunch at Coogee Pavilion", emoji: "🥗" },
          { time: "16:00", name: "Tamarama beach sunset", emoji: "🌅" },
        ],
      },
      {
        day: 2,
        theme: "Harbour & North Head",
        activities: [
          { time: "06:30", name: "Sunrise kayak from Mosman", emoji: "🛶" },
          { time: "10:00", name: "Taronga Zoo", emoji: "🦘" },
          { time: "14:00", name: "Manly beach & Corso", emoji: "🏖️" },
          { time: "19:00", name: "Harbour dinner cruise", emoji: "⛵" },
        ],
      },
      {
        day: 3,
        theme: "Blue Mountains Day Trip",
        activities: [
          { time: "07:00", name: "Drive to Blue Mountains", emoji: "🚗" },
          { time: "09:30", name: "Three Sisters lookout", emoji: "🏔️" },
          { time: "12:00", name: "Scenic World rides", emoji: "🚞" },
          { time: "16:00", name: "Leura village coffee & return", emoji: "☕" },
        ],
      },
    ],
    restaurants: [
      { name: "Quay Restaurant", cuisine: "Modern Australian · $$$$", emoji: "🍽️" },
      { name: "Bondi Icebergs Club", cuisine: "Italian with a view · $$$", emoji: "🍝" },
      { name: "Mr. Wong", cuisine: "Cantonese · $$$", emoji: "🥟" },
    ],
    city: "Sydney",
    country: "Australia",
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
    interests: ["nature", "beaches", "food"],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────

function todayPlusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ── Component ──────────────────────────────────────────────────────────

export default function TripsPage() {
  const router = useRouter();
  const setSearchParams = useTravelStore((s) => s.setSearchParams);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);

  const handleUseTrip = useCallback(
    (t: Trip) => {
      setSearchParams({
        destination: t.airport,
        travelStyle: t.travelStyle,
        interests: t.interests,
      });
      setActiveTrip(null);
      const dep = todayPlusDays(14);
      const ret = todayPlusDays(14 + t.days);
      router.push(
        `/?to=${encodeURIComponent(t.city)}&departureDate=${dep}&returnDate=${ret}#hero-search`,
      );
    },
    [router, setSearchParams],
  );

  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* ── Header ───────────────────────────────────────────────── */}
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Curated Trips
        </h1>
        <p className="mt-3 max-w-2xl text-base text-gray-500 sm:text-lg">
          Ready-made itineraries crafted by AI and experienced travelers — just
          pick one and go
        </p>

        {/* ── Grid ─────────────────────────────────────────────────── */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TRIPS.map((t) => (
            <TripCard
              key={t.id}
              trip={t}
              onPreview={() => setActiveTrip(t)}
              onUse={() => handleUseTrip(t)}
            />
          ))}
        </div>
      </div>

      {/* ── Modal ─────────────────────────────────────────────────── */}
      {activeTrip && (
        <TripModal
          trip={activeTrip}
          onClose={() => setActiveTrip(null)}
          onUse={() => handleUseTrip(activeTrip)}
        />
      )}
    </div>
  );
}

// ── Card component ─────────────────────────────────────────────────────

function TripCard({
  trip,
  onPreview,
  onUse,
}: {
  trip: Trip;
  onPreview: () => void;
  onUse: () => void;
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
      {/* Cover */}
      <div className={`relative h-44 overflow-hidden bg-gradient-to-br ${trip.gradient}`}>
        {trip.coverImage ? (
          <Image
            src={trip.coverImage}
            alt={trip.title}
            fill
            unoptimized
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Days badge */}
        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
            {trip.days} {trip.days === 1 ? "day" : "days"}
          </span>
        </div>

        {/* Cost badge */}
        <div className="absolute right-4 top-4">
          <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-gray-900 shadow-sm backdrop-blur-sm">
            ${trip.estimatedCost} est.
          </span>
        </div>

        {/* City / country */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3
            onClick={onPreview}
            className="cursor-pointer text-xl font-bold leading-snug text-white transition-colors hover:text-blue-100"
          >
            {trip.title}
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        {/* Author + cost */}
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${trip.author.avatarColor} text-[10px] font-bold text-white`}
            aria-hidden="true"
          >
            {trip.author.initials}
          </div>
          <p className="text-sm font-medium text-gray-700">
            {trip.author.name}
          </p>
        </div>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {trip.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Excerpt */}
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-600">
          {trip.excerpt}
        </p>

        {/* Footer actions */}
        <div className="mt-auto flex items-center gap-2 pt-5">
          <button
            type="button"
            onClick={onUse}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Use This Trip
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
          </button>
          <button
            type="button"
            onClick={onPreview}
            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Preview
          </button>
        </div>
      </div>
    </article>
  );
}

// ── Modal component ────────────────────────────────────────────────────

function TripModal({
  trip,
  onClose,
  onUse,
}: {
  trip: Trip;
  onClose: () => void;
  onUse: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Hero cover */}
        <div className={`relative h-44 overflow-hidden bg-gradient-to-br ${trip.gradient}`}>
          {trip.coverImage ? (
            <Image
              src={trip.coverImage}
              alt={trip.title}
              fill
              unoptimized
              sizes="(min-width: 768px) 600px, 100vw"
              className="object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30"
            aria-label="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>

          {/* Meta badges */}
          <div className="absolute left-6 bottom-6 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
              {trip.days} {trip.days === 1 ? "day" : "days"}
            </span>
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
              ${trip.estimatedCost} {trip.currency} est.
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Title */}
          <h2 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
            {trip.title}
          </h2>

          {/* Author row */}
          <div className="mt-3 flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${trip.author.avatarColor} text-xs font-bold text-white`}
              aria-hidden="true"
            >
              {trip.author.initials}
            </div>
            <p className="text-sm font-medium text-gray-700">
              {trip.author.name}
            </p>
            <div className="ml-auto flex flex-wrap gap-1.5">
              {trip.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Excerpt */}
          <p className="mt-5 text-sm leading-relaxed text-gray-600">
            {trip.excerpt}
          </p>

          {/* Weather tip */}
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-sky-100 bg-sky-50 p-3.5">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-sky-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                Weather tip
              </p>
              <p className="mt-0.5 text-sm text-sky-900">{trip.weatherTip}</p>
            </div>
          </div>

          {/* Day-by-day */}
          <div className="mt-6 space-y-5">
            {trip.fullDays.map((day) => (
              <div key={day.day}>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    Day {day.day}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {day.theme}
                  </span>
                </div>
                <ul className="ml-1 mt-2 space-y-1.5 border-l-2 border-gray-100 pl-4">
                  {day.activities.map((act, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-gray-700"
                    >
                      <span className="w-12 flex-shrink-0 text-xs font-medium text-gray-400">
                        {act.time}
                      </span>
                      <span aria-hidden="true">{act.emoji}</span>
                      <span>{act.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Restaurants */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900">
              Restaurant picks
            </h3>
            <ul className="mt-3 space-y-2">
              {trip.restaurants.map((r) => (
                <li
                  key={r.name}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3"
                >
                  <span className="text-xl" aria-hidden="true">
                    {r.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {r.name}
                    </p>
                    <p className="text-xs text-gray-500">{r.cuisine}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="sticky bottom-0 border-t border-gray-100 bg-white p-5">
          <button
            type="button"
            onClick={onUse}
            className="w-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Use This Trip — Plan {trip.city}
          </button>
          <p className="mt-2 text-center text-xs text-gray-400">
            Auto-fills destination, dates and interests
          </p>
        </div>
      </div>
    </div>
  );
}

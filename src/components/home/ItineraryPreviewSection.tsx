"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Airport } from "@/types/flight";
import type {
  TravelStyle,
  BudgetLevel,
  TravelInterest,
} from "@/types/itinerary";
import { useTravelStore } from "@/store/travel";

// ── Mock Itinerary Data ──────────────────────────────────────────────

interface ItineraryActivity {
  name: string;
  emoji: string;
  timeOfDay: "morning" | "afternoon" | "evening";
}

interface ItineraryDay {
  dayNumber: number;
  theme: string;
  activities: ItineraryActivity[];
}

interface ItineraryPreview {
  id: string;
  city: string;
  country: string;
  title: string;
  days: number;
  emoji: string;
  imageGradient: string;
  estimatedCost: number;
  currency: string;
  dayTags: string[];
  activityEmojis: string[];
  fullItinerary: ItineraryDay[];
  preset: {
    destination: Airport;
    travelStyle: TravelStyle;
    budgetLevel: BudgetLevel;
    interests: TravelInterest[];
  };
}

const ITINERARY_PREVIEWS: ItineraryPreview[] = [
  {
    id: "tokyo-foodie",
    city: "Tokyo",
    country: "Japan",
    title: "Tokyo 3-Day Foodie Trip",
    days: 3,
    emoji: "🗼",
    imageGradient: "from-rose-500/80 via-pink-600/70 to-red-700/80",
    estimatedCost: 800,
    currency: "USD",
    dayTags: ["Day 1", "Day 2", "Day 3"],
    activityEmojis: ["🍣", "⛩️", "🛍️"],
    fullItinerary: [
      {
        dayNumber: 1,
        theme: "Tsukiji & Shibuya",
        activities: [
          { name: "Tsukiji Outer Market — fresh sushi breakfast", emoji: "🍣", timeOfDay: "morning" },
          { name: "Meiji Shrine & Yoyogi Park", emoji: "⛩️", timeOfDay: "afternoon" },
          { name: "Shibuya Crossing & ramen alley", emoji: "🍜", timeOfDay: "evening" },
        ],
      },
      {
        dayNumber: 2,
        theme: "Akihabara & Asakusa",
        activities: [
          { name: "Senso-ji Temple & Nakamise-dori", emoji: "🏯", timeOfDay: "morning" },
          { name: "Akihabara electronics & anime shops", emoji: "🛍️", timeOfDay: "afternoon" },
          { name: "Izakaya hopping in Shinjuku", emoji: "🍶", timeOfDay: "evening" },
        ],
      },
      {
        dayNumber: 3,
        theme: "Harajuku & Shinjuku",
        activities: [
          { name: "Harajuku crepes & Takeshita Street", emoji: "🧁", timeOfDay: "morning" },
          { name: "Shinjuku Gyoen National Garden", emoji: "🌸", timeOfDay: "afternoon" },
          { name: "Robot Restaurant show & dinner", emoji: "🤖", timeOfDay: "evening" },
        ],
      },
    ],
    preset: {
      destination: {
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
      budgetLevel: "mid-range",
      interests: ["food", "shopping", "history"],
    },
  },
  {
    id: "paris-weekend",
    city: "Paris",
    country: "France",
    title: "Paris Weekend Getaway",
    days: 2,
    emoji: "🗼",
    imageGradient: "from-indigo-500/80 via-purple-600/70 to-pink-600/80",
    estimatedCost: 600,
    currency: "USD",
    dayTags: ["Day 1", "Day 2"],
    activityEmojis: ["🖼️", "☕", "🌊"],
    fullItinerary: [
      {
        dayNumber: 1,
        theme: "Art & Café Culture",
        activities: [
          { name: "Louvre Museum — Mona Lisa & Venus de Milo", emoji: "🖼️", timeOfDay: "morning" },
          { name: "Café de Flore — coffee & people-watching", emoji: "☕", timeOfDay: "afternoon" },
          { name: "Seine River sunset cruise", emoji: "🌊", timeOfDay: "evening" },
        ],
      },
      {
        dayNumber: 2,
        theme: "Montmartre & Eiffel",
        activities: [
          { name: "Sacré-Cœur & Montmartre artists", emoji: "🎨", timeOfDay: "morning" },
          { name: "Eiffel Tower & Champ de Mars picnic", emoji: "🗼", timeOfDay: "afternoon" },
          { name: "Le Marais dinner & wine bar", emoji: "🍷", timeOfDay: "evening" },
        ],
      },
    ],
    preset: {
      destination: {
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
      budgetLevel: "mid-range",
      interests: ["museums", "food", "history"],
    },
  },
  {
    id: "nyc-explorer",
    city: "New York",
    country: "USA",
    emoji: "🗽",
    title: "New York City Explorer",
    days: 3,
    imageGradient: "from-amber-500/80 via-orange-600/70 to-red-600/80",
    estimatedCost: 900,
    currency: "USD",
    dayTags: ["Day 1", "Day 2", "Day 3"],
    activityEmojis: ["🌃", "🌳", "🎭"],
    fullItinerary: [
      {
        dayNumber: 1,
        theme: "Midtown Manhattan",
        activities: [
          { name: "Times Square & Broadway morning walk", emoji: "🌃", timeOfDay: "morning" },
          { name: "Top of the Rock observation deck", emoji: "🏙️", timeOfDay: "afternoon" },
          { name: "Broadway show — The Lion King", emoji: "🎭", timeOfDay: "evening" },
        ],
      },
      {
        dayNumber: 2,
        theme: "Central Park & Museums",
        activities: [
          { name: "Central Park bike ride & Bethesda Fountain", emoji: "🌳", timeOfDay: "morning" },
          { name: "Metropolitan Museum of Art", emoji: "🏛️", timeOfDay: "afternoon" },
          { name: "Dinner in Hell's Kitchen", emoji: "🍽️", timeOfDay: "evening" },
        ],
      },
      {
        dayNumber: 3,
        theme: "Brooklyn & Downtown",
        activities: [
          { name: "Brooklyn Bridge walk at sunrise", emoji: "🌉", timeOfDay: "morning" },
          { name: "DUMBO & Brooklyn Flea Market", emoji: "🛍️", timeOfDay: "afternoon" },
          { name: "Jazz club in Greenwich Village", emoji: "🎷", timeOfDay: "evening" },
        ],
      },
    ],
    preset: {
      destination: {
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
      budgetLevel: "mid-range",
      interests: ["museums", "food", "nightlife"],
    },
  },
];

// ── Modal Component ──────────────────────────────────────────────────

function ItineraryModal({
  itinerary,
  onClose,
  onUseTemplate,
}: {
  itinerary: ItineraryPreview;
  onClose: () => void;
  onUseTemplate: (itinerary: ItineraryPreview) => void;
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
      <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header with gradient */}
        <div
          className={`bg-gradient-to-r ${itinerary.imageGradient} relative px-6 pb-6 pt-8`}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-1.5 text-white transition-colors hover:bg-white/30"
            aria-label="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
          <div className="text-4xl mb-2">{itinerary.emoji}</div>
          <h2 className="text-xl font-bold text-white">{itinerary.title}</h2>
          <p className="mt-1 text-sm text-white/80">
            {itinerary.days} days · {itinerary.country} · ~${itinerary.estimatedCost} {itinerary.currency}
          </p>
        </div>

        {/* Day-by-day itinerary */}
        <div className="px-6 py-5 space-y-5">
          {itinerary.fullItinerary.map((day) => (
            <div key={day.dayNumber}>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  Day {day.dayNumber}
                </span>
                <span className="text-sm font-medium text-gray-600">{day.theme}</span>
              </div>
              <div className="ml-1 space-y-2 border-l-2 border-gray-100 pl-4">
                {day.activities.map((act, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-base leading-6">{act.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{act.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{act.timeOfDay}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer with CTA */}
        <div className="border-t border-gray-100 px-6 py-4">
          <button
            onClick={() => onUseTemplate(itinerary)}
            className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Plan with this template
          </button>
          <p className="mt-2 text-center text-xs text-gray-400">
            Auto-fills destination and preferences — just pick your dates
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Card Component ───────────────────────────────────────────────────

function ItineraryCard({
  itinerary,
  onClick,
}: {
  itinerary: ItineraryPreview;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:shadow-xl"
    >
      {/* Background with gradient */}
      <div className={`bg-gradient-to-br ${itinerary.imageGradient} relative h-80 sm:h-96`}>
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        {/* Bottom gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
              {itinerary.country}
            </span>
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
              {itinerary.days} days
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white">{itinerary.city}</h3>
          <p className="mt-1 text-sm text-white/80">{itinerary.title}</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-lg font-bold text-white">${itinerary.estimatedCost}</span>
            <span className="text-xs text-white/60">est.</span>
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-white/5 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────

export default function ItineraryPreviewSection() {
  const [selectedItinerary, setSelectedItinerary] =
    useState<ItineraryPreview | null>(null);
  const setSearchParams = useTravelStore((s) => s.setSearchParams);
  const [templateApplied, setTemplateApplied] = useState<string | null>(null);

  const handleUseTemplate = useCallback(
    (itinerary: ItineraryPreview) => {
      setSearchParams({
        destination: itinerary.preset.destination,
        travelStyle: itinerary.preset.travelStyle,
        budgetLevel: itinerary.preset.budgetLevel,
        interests: itinerary.preset.interests,
      });
      setSelectedItinerary(null);
      setTemplateApplied(itinerary.id);
      // Scroll to the search form
      setTimeout(() => {
        document
          .getElementById("hero-search")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    },
    [setSearchParams],
  );

  // Clear templateApplied after a short time
  useEffect(() => {
    if (templateApplied) {
      const timer = setTimeout(() => setTemplateApplied(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [templateApplied]);

  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
          Popular Destinations
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-gray-500">
          Preview real itineraries — see what tripla can create for you
        </p>

        {templateApplied && (
          <div className="mx-auto mt-4 max-w-md rounded-lg bg-green-50 px-4 py-2 text-center text-sm text-green-700">
            Template applied! Select your dates and click Plan My Trip
          </div>
        )}

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {ITINERARY_PREVIEWS.map((itinerary) => (
            <ItineraryCard
              key={itinerary.id}
              itinerary={itinerary}
              onClick={() => setSelectedItinerary(itinerary)}
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedItinerary && (
        <ItineraryModal
          itinerary={selectedItinerary}
          onClose={() => setSelectedItinerary(null)}
          onUseTemplate={handleUseTemplate}
        />
      )}
    </section>
  );
}

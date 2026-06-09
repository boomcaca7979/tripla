"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTravelStore } from "@/store/travel";
import type { Airport } from "@/types/flight";
import type { TravelStyle, TravelInterest } from "@/types/itinerary";

// ── Types ──────────────────────────────────────────────────────────────

interface Author {
  name: string;
  avatarColor: string;
  initials: string;
}

interface GuidePlace {
  name: string;
  description: string;
  emoji: string;
}

interface Guide {
  id: string;
  title: string;
  /** Optional cover image under /public; null falls back to gradient. */
  coverImage: string | null;
  /** Fallback gradient when no cover image. */
  gradient: string;
  author: Author;
  publishedAt: string;
  readTime: string;
  tags: string[];
  excerpt: string;
  /** Full body split into paragraphs. */
  paragraphs: string[];
  /** Recommended restaurants / spots. */
  places: GuidePlace[];
  city: string;
  country: string;
  airport: Airport;
  travelStyle: TravelStyle;
  interests: TravelInterest[];
}

// ── Mock data ──────────────────────────────────────────────────────────

const GUIDES: Guide[] = [
  {
    id: "tokyo-foodie",
    title: "Tokyo Foodie Guide: 3 Days of Culinary Heaven",
    coverImage: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    gradient: "from-rose-500 to-pink-700",
    author: {
      name: "Aiko Tanaka",
      avatarColor: "from-pink-500 to-rose-500",
      initials: "AT",
    },
    publishedAt: "May 12, 2026",
    readTime: "8 min read",
    tags: ["Foodie", "Solo", "Budget"],
    excerpt:
      "From tsukiji sushi breakfasts to hidden ramen alleys, here's exactly how to eat your way through Tokyo without breaking the bank.",
    paragraphs: [
      "Tokyo is a paradise for food lovers, but the sheer volume of options can be overwhelming. This guide distills three days into a curated culinary journey through the city's most iconic neighborhoods.",
      "Start your morning at Tsukiji Outer Market before the tourists arrive — the freshest sushi breakfast you will ever eat is waiting at Sushi Dai or Daiwa Sushi. Pair it with a warm cup of matcha from a nearby vendor.",
      "By afternoon, head to Shimokitazawa for vintage shops and a casual lunch of yakitori. As the sun sets, make your way to Shinjuku's Omoide Yokocho for grilled skewers and an Asahi beer — the perfect end to a Tokyo day.",
    ],
    places: [
      { name: "Sushi Dai", description: "Legendary breakfast counter, arrive by 7am.", emoji: "🍣" },
      { name: "Ichiran Ramen", description: "Solo-booth tonkotsu ramen, 24/7.", emoji: "🍜" },
      { name: "Tsukiji Outer Market", description: "Fresh seafood, street snacks, kitchen tools.", emoji: "🐟" },
      { name: "Omoide Yokocho", description: "Lantern-lit alley of yakitori stalls.", emoji: "🏮" },
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
    id: "paris-shopping",
    title: "Paris Shopping Map: From Champs-Élysées to Hidden Marais Boutiques",
    coverImage: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
    gradient: "from-indigo-500 to-pink-600",
    author: {
      name: "Camille Dubois",
      avatarColor: "from-indigo-500 to-purple-500",
      initials: "CD",
    },
    publishedAt: "Apr 28, 2026",
    readTime: "6 min read",
    tags: ["Shopping", "Luxury", "Couples"],
    excerpt:
      "A neighbourhood-by-neighbourhood map of Paris shopping — luxury flagships, vintage treasures, and the best pâtisseries to refuel between stores.",
    paragraphs: [
      "Paris is best explored on a shopping quest, one arrondissement at a time. Start in the 8th with the grand boulevards: Avenue Montaigne for haute couture, Rue du Faubourg Saint-Honoré for heritage maisons.",
      "Cross the river into the Marais for something edgier. The 3rd and 4th arrondissements are packed with concept stores, vintage shops, and the flagship Merci — a café-meets-boutique in a former factory.",
      "End your day on Rue de Rivoli with a stop at Le Marais' oldest chocolate shop. Bring an empty suitcase: you'll need it.",
    ],
    places: [
      { name: "Le Bon Marché", description: "Left-bank department store, gourmet food hall.", emoji: "🛍️" },
      { name: "Merci", description: "Concept store in a converted factory, with café.", emoji: "☕" },
      { name: "Champs-Élysées", description: "Iconic luxury shopping avenue.", emoji: "💎" },
      { name: "Shakespeare & Co.", description: "Beloved English-language bookshop by Notre-Dame.", emoji: "📚" },
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
    interests: ["shopping", "food", "museums"],
  },
  {
    id: "newyork-weekend",
    title: "New York Weekend Explorer: 48 Hours Like a Local",
    coverImage: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
    gradient: "from-amber-500 to-red-600",
    author: {
      name: "Marcus Hill",
      avatarColor: "from-amber-500 to-orange-500",
      initials: "MH",
    },
    publishedAt: "Mar 16, 2026",
    readTime: "10 min read",
    tags: ["Active", "Weekend", "Urban"],
    excerpt:
      "Skip the tourist traps. This local-tested itinerary covers Brooklyn breakfasts, secret Midtown rooftops, and a jazz bar you'll brag about for years.",
    paragraphs: [
      "Forget everything you've read about Times Square — this weekend is for seeing New York the way New Yorkers do. Start Saturday morning in Williamsburg with a coffee at Devoción and a walk along Bedford Avenue.",
      "By afternoon, take the L train back into Manhattan and walk the High Line north to Chelsea. Detour into the Vessel and Hudson Yards for a taste of new New York, then settle into a jazz bar in the West Village for the night.",
      "Sunday belongs to Brooklyn. Walk the bridge at sunrise, brunch in DUMBO, and spend the afternoon at the Brooklyn Flea. Cap it all with a sunset ferry ride back to Manhattan — best $2.75 you'll ever spend.",
    ],
    places: [
      { name: "Devoción", description: "Skylit coffee roaster in Williamsburg.", emoji: "☕" },
      { name: "The High Line", description: "Elevated park on old rail tracks.", emoji: "🌿" },
      { name: "Smalls Jazz Club", description: "Intimate basement jazz in the Village.", emoji: "🎷" },
      { name: "Brooklyn Bridge", description: "Walk it at sunrise for empty views.", emoji: "🌉" },
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
    title: "Bangkok Night Markets: A Street Food Survival Guide",
    coverImage: null,
    gradient: "from-orange-500 to-yellow-600",
    author: {
      name: "Lalita Suwannarat",
      avatarColor: "from-orange-500 to-yellow-500",
      initials: "LS",
    },
    publishedAt: "Feb 4, 2026",
    readTime: "7 min read",
    tags: ["Foodie", "Nightlife", "Budget"],
    excerpt:
      "Pad thai, mango sticky rice, and a tattooed auntie grilling skewers — Bangkok's night markets are an education in Thai street food.",
    paragraphs: [
      "Bangkok comes alive after sunset. The night markets are not just for food — they are theatre. Start at Chinatown's Yaowarat, where every corner smells of char-grilled seafood and bird's nest soup.",
      "Move on to Ratchada Rot Fai for the more hipster crowd: vintage vinyl, craft beer, and the city's best boat noodles. For something more local, Chatuchak's Friday night market is open-air and overwhelming in the best way.",
      "Pro tip: bring small bills, follow the queues (a long line is a good sign), and don't trust a menu that has pictures of every dish. Real food doesn't need photography.",
    ],
    places: [
      { name: "Yaowarat (Chinatown)", description: "Bangkok's most intense street food scene.", emoji: "🥢" },
      { name: "Ratchada Rot Fai", description: "Vintage market with craft beer and skewers.", emoji: "🍢" },
      { name: "Chatuchak Friday Market", description: "Massive open-air weekend bazaar.", emoji: "🛍️" },
      { name: "Jay Fai", description: "Michelin-starred street food legend.", emoji: "🦀" },
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
    id: "london-culture",
    title: "London on Foot: A Cultural Walk Through Seven Centuries",
    coverImage: null,
    gradient: "from-slate-700 to-blue-900",
    author: {
      name: "James Whitmore",
      avatarColor: "from-slate-500 to-blue-500",
      initials: "JW",
    },
    publishedAt: "Jan 22, 2026",
    readTime: "9 min read",
    tags: ["History", "Museums", "Slow Travel"],
    excerpt:
      "Tower of London at dawn, Borough Market for lunch, a free museum in the afternoon, and a West End show at night — a perfect literary London day.",
    paragraphs: [
      "London rewards the walker. This route strings together seven centuries of history into a single, very walkable day. Start at the Tower of London as the gates open — the Crown Jewels are quieter before the crowds arrive.",
      "Walk across Tower Bridge and into Borough Market for lunch. Sample cheese at Neal's Yard Dairy, oysters from the Cornish stalls, and finish with a flat white from Monmouth Coffee.",
      "Afternoon is for the South Bank: the Tate Modern is free, the view from the Millennium Bridge is priceless. Cross into the City, detour to St. Paul's, then end with a West End show in Covent Garden.",
    ],
    places: [
      { name: "Tower of London", description: "Crown Jewels and Yeoman Warder tours.", emoji: "🏰" },
      { name: "Borough Market", description: "London's most famous food market.", emoji: "🧀" },
      { name: "Tate Modern", description: "Free modern art on the Thames.", emoji: "🖼️" },
      { name: "West End Theatre", description: "Book a matinee for half-price tickets.", emoji: "🎭" },
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
    id: "sydney-outdoor",
    title: "Sydney Outdoors: Coastal Walks and Secret Beaches",
    coverImage: null,
    gradient: "from-sky-500 to-cyan-700",
    author: {
      name: "Olivia Park",
      avatarColor: "from-sky-500 to-cyan-500",
      initials: "OP",
    },
    publishedAt: "Dec 10, 2025",
    readTime: "11 min read",
    tags: ["Adventure", "Nature", "Active"],
    excerpt:
      "Bondi to Coogee, hidden harbour coves, and a sunrise kayak on the harbour — a Sydney itinerary built for the outdoors.",
    paragraphs: [
      "Sydney is one of the world's great outdoor cities, but most visitors never leave the Opera House plaza. This guide is for the rest of us — the ones who came for the surf and stayed for the harbour walks.",
      "Start with the Bondi to Coogee coastal walk. Six kilometres, two hours, endless ocean views. Detour to the Bronte Baths for a swim and Tamarama for a coffee at the corner kiosk.",
      "Day two belongs to the harbour. Kayak from Mosman at sunrise, past the Opera House and into the quiet bays. End the day with fish and chips on a hidden beach only the locals know about.",
    ],
    places: [
      { name: "Bondi to Coogee Walk", description: "Iconic 6km coastal track.", emoji: "🌊" },
      { name: "Sydney Harbour Kayak", description: "Sunrise paddle past the Opera House.", emoji: "🛶" },
      { name: "Bronte Baths", description: "Ocean pool carved into the cliffs.", emoji: "🏊" },
      { name: "Watsons Bay", description: "Hidden harbour beach, fish & chips.", emoji: "🐟" },
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

// ── Component ──────────────────────────────────────────────────────────

export default function GuidesPage() {
  const router = useRouter();
  const setSearchParams = useTravelStore((s) => s.setSearchParams);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [activeGuide, setActiveGuide] = useState<Guide | null>(null);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleUseGuide = useCallback(
    (g: Guide) => {
      setSearchParams({
        destination: g.airport,
        travelStyle: g.travelStyle,
        interests: g.interests,
      });
      setActiveGuide(null);
      router.push("/?to=" + encodeURIComponent(g.city) + "#hero-search");
    },
    [router, setSearchParams],
  );

  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* ── Header ───────────────────────────────────────────────── */}
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Travel Guides
        </h1>
        <p className="mt-3 max-w-2xl text-base text-gray-500 sm:text-lg">
          Curated insights and local tips from experienced travelers
        </p>

        {/* ── Grid ─────────────────────────────────────────────────── */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDES.map((g) => (
            <GuideCard
              key={g.id}
              guide={g}
              isFavorite={favorites.has(g.id)}
              onToggleFavorite={() => toggleFavorite(g.id)}
              onOpen={() => setActiveGuide(g)}
            />
          ))}
        </div>
      </div>

      {/* ── Modal ─────────────────────────────────────────────────── */}
      {activeGuide && (
        <GuideModal
          guide={activeGuide}
          isFavorite={favorites.has(activeGuide.id)}
          onToggleFavorite={() => toggleFavorite(activeGuide.id)}
          onClose={() => setActiveGuide(null)}
          onUseGuide={() => handleUseGuide(activeGuide)}
        />
      )}
    </div>
  );
}

// ── Card component ─────────────────────────────────────────────────────

function GuideCard({
  guide,
  isFavorite,
  onToggleFavorite,
  onOpen,
}: {
  guide: Guide;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpen: () => void;
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
      {/* Cover */}
      <div className={`relative h-44 overflow-hidden bg-gradient-to-br ${guide.gradient}`}>
        {guide.coverImage ? (
          <Image
            src={guide.coverImage}
            alt={guide.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Tags */}
        <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
          {guide.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        {/* Author row */}
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${guide.author.avatarColor} text-xs font-bold text-white`}
            aria-hidden="true"
          >
            {guide.author.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">
              {guide.author.name}
            </p>
            <p className="text-xs text-gray-500">
              {guide.publishedAt} · {guide.readTime}
            </p>
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={onOpen}
          className="mt-4 cursor-pointer text-lg font-bold leading-snug text-gray-900 transition-colors hover:text-blue-600"
        >
          {guide.title}
        </h3>

        {/* Excerpt */}
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">
          {guide.excerpt}
        </p>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onToggleFavorite}
            className={[
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              isFavorite
                ? "bg-rose-50 text-rose-600"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100",
            ].join(" ")}
            aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill={isFavorite ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {isFavorite ? "Saved" : "Save"}
          </button>

          <button
            type="button"
            onClick={onOpen}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
          >
            Read more
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
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
        </div>
      </div>
    </article>
  );
}

// ── Modal component ────────────────────────────────────────────────────

function GuideModal({
  guide,
  isFavorite,
  onToggleFavorite,
  onClose,
  onUseGuide,
}: {
  guide: Guide;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClose: () => void;
  onUseGuide: () => void;
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
        <div className={`relative h-48 overflow-hidden bg-gradient-to-br ${guide.gradient}`}>
          {guide.coverImage ? (
            <Image
              src={guide.coverImage}
              alt={guide.title}
              fill
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

          {/* Tags */}
          <div className="absolute left-6 bottom-6 flex flex-wrap gap-1.5">
            {guide.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Title */}
          <h2 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
            {guide.title}
          </h2>

          {/* Author + meta */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${guide.author.avatarColor} text-sm font-bold text-white`}
                aria-hidden="true"
              >
                {guide.author.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {guide.author.name}
                </p>
                <p className="text-xs text-gray-500">
                  {guide.publishedAt} · {guide.readTime}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggleFavorite}
              className={[
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                isFavorite
                  ? "bg-rose-50 text-rose-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200",
              ].join(" ")}
              aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill={isFavorite ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {isFavorite ? "Saved" : "Save"}
            </button>
          </div>

          {/* Body paragraphs */}
          <div className="mt-6 space-y-4 text-base leading-relaxed text-gray-700">
            {guide.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {/* Places */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900">
              Recommended spots
            </h3>
            <ul className="mt-3 space-y-2">
              {guide.places.map((place) => (
                <li
                  key={place.name}
                  className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3"
                >
                  <span className="text-xl" aria-hidden="true">
                    {place.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {place.name}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {place.description}
                    </p>
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
            onClick={onUseGuide}
            className="w-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Use This Guide — Plan {guide.city}
          </button>
          <p className="mt-2 text-center text-xs text-gray-400">
            Auto-fills destination and interests — just pick your dates
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useTravelStore } from "@/store/travel";
import type { Trip } from "@/data/trips";
import { TRIPS } from "@/data/trips";
import type { TravelStyle } from "@/types/itinerary";

// ── Filter options（仅使用已有 travelStyle 数据，不新增分类）─────────────

const STYLE_FILTERS: { value: TravelStyle | "all"; label: string }[] = [
  { value: "all", label: "All styles" },
  { value: "foodie", label: "Foodie" },
  { value: "cultural", label: "Cultural" },
  { value: "active", label: "Active" },
  { value: "adventure", label: "Adventure" },
  { value: "relaxed", label: "Relaxed" },
];

// ── Helpers ────────────────────────────────────────────────────────────

function todayPlusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function capitalizeStyle(s: TravelStyle): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Component ──────────────────────────────────────────────────────────

export default function TripsHubClient() {
  const router = useRouter();
  const setSearchParams = useTravelStore((s) => s.setSearchParams);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [activeStyle, setActiveStyle] = useState<TravelStyle | "all">("all");

  const filteredTrips = useMemo(() => {
    if (activeStyle === "all") return TRIPS;
    return TRIPS.filter((t) => t.travelStyle === activeStyle);
  }, [activeStyle]);

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
    <>
      {/* ── Style filter ──────────────────────────────────────────────── */}
      <div className="mt-8 flex flex-wrap gap-2">
        {STYLE_FILTERS.map((f) => {
          const isActive = activeStyle === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setActiveStyle(f.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
              aria-pressed={isActive}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* ── Result count ──────────────────────────────────────────────── */}
      <p className="mt-4 text-sm text-gray-500">
        {filteredTrips.length} {filteredTrips.length === 1 ? "trip" : "trips"}
        {activeStyle !== "all" && ` · ${capitalizeStyle(activeStyle)} style`}
      </p>

      {/* ── Grid ──────────────────────────────────────────────────────── */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTrips.map((t) => (
          <TripCard
            key={t.id}
            trip={t}
            onPreview={() => setActiveTrip(t)}
            onUse={() => handleUseTrip(t)}
          />
        ))}
      </div>

      {/* ── Modal ─────────────────────────────────────────────────────── */}
      {activeTrip && (
        <TripModal
          trip={activeTrip}
          onClose={() => setActiveTrip(null)}
          onUse={() => handleUseTrip(activeTrip)}
        />
      )}
    </>
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

        {/* SEO 链接到详情页（不依赖 JS，可被爬虫抓取） */}
        <Link
          href={`/trips/${trip.slug}`}
          className="mt-2 text-center text-xs font-medium text-blue-700 hover:underline"
        >
          View full itinerary →
        </Link>
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

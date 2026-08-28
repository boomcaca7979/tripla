import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES, getGuidesForCity } from "@/data/guides";
import { TRIPS } from "@/data/trips";

export const metadata: Metadata = {
  title: "Travel Guides 2026",
  description:
    "Original travel guides for 2026: where to go each month, event weekend planning, and city-by-city itineraries — every guide plugs straight into the AI itinerary planner.",
  alternates: {
    canonical: "/guides",
  },
};

export default function GuidesPage() {
  // 覆盖的 city（去重），用于 hub 底部的 Trip 内链。
  const coveredCities = Array.from(
    new Set(GUIDES.map((g) => g.city.toLowerCase())),
  );
  const hubTrips = TRIPS.filter((t) =>
    coveredCities.includes(t.city.toLowerCase()),
  ).slice(0, 6);

  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* ── Header ───────────────────────────────────────────────── */}
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Travel Guides
        </h1>
        <p className="mt-3 max-w-2xl text-base text-gray-500 sm:text-lg">
          Original, up-to-date planning guides for 2026 — seasonal where-to-go
          round-ups, event weekend playbooks, and deep city guides.
        </p>

        {/* ── Grid ─────────────────────────────────────────────────── */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDES.map((g) => (
            <GuideCard key={g.slug} slug={g.slug} />
          ))}
        </div>

        {/* ── Hub → Trips 内链 ────────────────────────────────────── */}
        {hubTrips.length > 0 && (
          <section className="mb-16 mt-16">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Turn a guide into a trip
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {hubTrips.map((t) => (
                <Link
                  key={t.slug}
                  href={`/trips/${t.slug}`}
                  className="group block rounded-2xl border border-gray-100 overflow-hidden transition hover:shadow-md"
                >
                  <div
                    className={`h-24 bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white`}
                  >
                    <span className="text-lg font-bold">{t.city}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">
                      {t.title}
                    </h3>
                    <div className="mt-1 text-sm text-gray-500">
                      {t.days} days · {t.budget.toLocaleString()} {t.currency}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ── Card component ─────────────────────────────────────────────────────

function GuideCard({ slug }: { slug: string }) {
  const guide = GUIDES.find((g) => g.slug === slug);
  if (!guide) return null;
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
    >
      {/* Cover */}
      <div className={`relative h-44 overflow-hidden bg-gradient-to-br ${guide.gradient}`}>
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
        <span className="absolute bottom-4 left-4 text-sm font-medium text-white/90">
          {guide.city}
        </span>
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
              Updated {guide.updatedAt} · {guide.readTime}
            </p>
          </div>
        </div>

        {/* Title */}
        <h2 className="mt-4 text-lg font-bold leading-snug text-gray-900 transition-colors group-hover:text-blue-600">
          {guide.title}
        </h2>

        {/* Excerpt */}
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">
          {guide.excerpt}
        </p>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-xs text-gray-500">
            {getGuidesForCity(guide.city).length > 1
              ? `${getGuidesForCity(guide.city).length} guides for ${guide.city}`
              : guide.country}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700">
            Read guide
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
          </span>
        </div>
      </div>
    </Link>
  );
}

import Link from "next/link";
import { DESTINATIONS } from "@/data/destinations";
import { TRIPS } from "@/data/trips";
import { GUIDES } from "@/data/guides";
import { AI_PAGES } from "@/data/ai-pages";

// Server-rendered content hub below the hero: popular destinations, trending
// trips, latest guides, planning ideas, and the AI planner CTA. Pure links
// into the data-driven pages — no client state, no layout changes above.

const POPULAR_DESTINATION_SLUGS = [
  "tokyo",
  "paris",
  "london",
  "rome",
  "barcelona",
  "seoul",
  "bangkok",
  "singapore",
  "bali",
  "dubai",
  "newyork",
  "taipei",
];

const TRENDING_TRIP_SLUGS = [
  "tokyo-3d-foodie",
  "paris-weekend",
  "japan-7d-golden-route",
  "rome-3d-classics",
  "bali-5d-island",
  "seoul-3d-classic",
];

const PLANNING_IDEAS = [
  "ai-travel-planner",
  "ai-weekend-trip-planner",
  "ai-budget-travel-planner",
  "ai-food-trip-planner",
  "ai-trip-planner-for-couples",
  "ai-multi-city-trip-planner",
];

const TRENDING_DESTINATION_SLUGS = [
  "kyoto",
  "lisbon",
  "busan",
  "copenhagen",
  "florence",
  "hanoi",
  "seville",
  "budapest",
];

const WEEKEND_TRIP_SLUGS = [
  "paris-weekend",
  "singapore-2d-highlights",
  "taipei-3d-night-markets",
  "hong-kong-3d-highlights",
  "prague-2d-fairytale-weekend",
  "venice-2d-canals",
];

const FAMILY_TRIP_SLUGS = [
  "tokyo-family-4d",
  "singapore-3d-family",
  "paris-family-4d",
  "orlando-5d-theme-parks",
  "bali-family-6d",
  "nyc-family-4d",
];

const COUPLES_TRIP_SLUGS = [
  "bali-honeymoon-7d",
  "venice-2d-canals",
  "paris-weekend",
  "amalfi-coast-4d-coast",
  "santorini-3d-caldera",
  "italy-couples-10d",
];

const BUDGET_TRIP_SLUGS = [
  "tokyo-budget-4d",
  "bangkok-budget-4d",
  "hanoi-3d-street-food",
  "japan-budget-4d",
  "ho-chi-minh-3d",
  "kuala-lumpur-3d",
];

function SectionHeading({
  title,
  subtitle,
  href,
  linkLabel,
}: {
  title: string;
  subtitle: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">{title}</h2>
        <p className="mt-2 text-gray-600">{subtitle}</p>
      </div>
      <Link
        href={href}
        className="inline-flex items-center rounded-full border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
      >
        {linkLabel} →
      </Link>
    </div>
  );
}

export default function ContentHubSections() {
  const popularDestinations = POPULAR_DESTINATION_SLUGS.map((slug) =>
    DESTINATIONS.find((d) => d.slug === slug),
  ).filter((d): d is NonNullable<typeof d> => Boolean(d));

  const trendingDestinations = TRENDING_DESTINATION_SLUGS.map((slug) =>
    DESTINATIONS.find((d) => d.slug === slug),
  ).filter((d): d is NonNullable<typeof d> => Boolean(d));

  const trendingTrips = TRENDING_TRIP_SLUGS.map((slug) =>
    TRIPS.find((t) => t.slug === slug),
  ).filter((t): t is NonNullable<typeof t> => Boolean(t));

  const latestGuides = [...GUIDES]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6);

  const planningIdeas = PLANNING_IDEAS.map((slug) =>
    AI_PAGES.find((p) => p.slug === slug),
  ).filter((p): p is NonNullable<typeof p> => Boolean(p));

  const weekendTrips = WEEKEND_TRIP_SLUGS.map((slug) =>
    TRIPS.find((t) => t.slug === slug),
  ).filter((t): t is NonNullable<typeof t> => Boolean(t));

  const familyTrips = FAMILY_TRIP_SLUGS.map((slug) =>
    TRIPS.find((t) => t.slug === slug),
  ).filter((t): t is NonNullable<typeof t> => Boolean(t));

  const couplesTrips = COUPLES_TRIP_SLUGS.map((slug) =>
    TRIPS.find((t) => t.slug === slug),
  ).filter((t): t is NonNullable<typeof t> => Boolean(t));

  const budgetTrips = BUDGET_TRIP_SLUGS.map((slug) =>
    TRIPS.find((t) => t.slug === slug),
  ).filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <>
      {/* ════════════ Trending Destinations ════════════ */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Trending Destinations"
            subtitle="The cities our travelers are generating itineraries for this season."
            href="/destinations"
            linkLabel="Explore all destinations"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {trendingDestinations.map((d) => (
              <Link
                key={d.slug}
                href={`/destinations/${d.slug}`}
                className="group block overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:shadow-md"
              >
                <div
                  className={`flex h-20 items-center justify-center bg-gradient-to-br ${d.gradient}`}
                >
                  <span className="text-lg font-bold text-white">{d.city}</span>
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-500">{d.country}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-snug text-gray-600 group-hover:text-blue-700">
                    {d.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ Popular Destinations ════════════ */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Popular Destinations"
            subtitle="Field-tested city guides with budgets, best seasons, and honest itineraries."
            href="/destinations"
            linkLabel="Explore all destinations"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {popularDestinations.map((d) => (
              <Link
                key={d.slug}
                href={`/destinations/${d.slug}`}
                className="group block overflow-hidden rounded-2xl border border-gray-100 transition hover:shadow-md"
              >
                <div
                  className={`flex h-28 items-center justify-center bg-gradient-to-br ${d.gradient}`}
                >
                  <span className="text-xl font-bold text-white">{d.city}</span>
                </div>
                <div className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {d.country}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm leading-snug text-gray-700 group-hover:text-blue-700">
                    {d.description}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    ~{d.budgetPerDay} {d.budgetCurrency}/day · {d.recommendedDays} days
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ Trending Trips ════════════ */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Trending Trips"
            subtitle="Day-by-day itineraries with times, budgets and restaurants — ready to generate in your own dates."
            href="/trips"
            linkLabel="Browse all trips"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trendingTrips.map((t) => (
              <Link
                key={t.slug}
                href={`/trips/${t.slug}`}
                className="group block overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:shadow-md"
              >
                <div
                  className={`flex h-24 items-center justify-center bg-gradient-to-br ${t.gradient}`}
                >
                  <span className="px-4 text-center text-lg font-bold text-white">
                    {t.title}
                  </span>
                </div>
                <div className="p-4">
                  <p className="line-clamp-2 text-sm leading-snug text-gray-700 group-hover:text-blue-700">
                    {t.excerpt}
                  </p>
                  <p className="mt-3 text-xs text-gray-500">
                    {t.days} days · ~{t.budget} {t.currency} · {t.tags.slice(0, 2).join(" · ")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ Latest Travel Guides ════════════ */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Latest Travel Guides"
            subtitle="Budgets, itineraries, food guides and honest season advice from our editors."
            href="/guides"
            linkLabel="Browse all guides"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestGuides.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="group block overflow-hidden rounded-2xl border border-gray-100 transition hover:shadow-md"
              >
                <div
                  className={`flex h-20 items-center justify-center bg-gradient-to-br ${g.gradient} px-4 text-center text-sm font-bold text-white`}
                >
                  {g.seoTitle}
                </div>
                <div className="p-4">
                  <p className="line-clamp-2 text-sm leading-snug text-gray-700 group-hover:text-blue-700">
                    {g.excerpt}
                  </p>
                  <p className="mt-3 text-xs text-gray-500">
                    {g.city} · {g.readTime}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ Travel Planning Ideas ════════════ */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Travel Planning Ideas"
            subtitle="Pick the planning style that fits your trip — each page explains how to generate the right itinerary."
            href="/destinations"
            linkLabel="Start from a destination"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {planningIdeas.map((p) => (
              <Link
                key={p.slug}
                href={`/${p.slug}`}
                className="group block rounded-2xl border border-gray-100 bg-white p-5 transition hover:shadow-md"
              >
                <p className="font-semibold text-gray-900 group-hover:text-blue-700">
                  {p.seoTitle}
                </p>
                <p className="mt-2 line-clamp-2 text-sm leading-snug text-gray-600">
                  {p.subtitle}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ Best Weekend Trips ════════════ */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Best Weekend Trips"
            subtitle="48-hour itineraries that end rested instead of needing a holiday."
            href="/trips"
            linkLabel="Browse all trips"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {weekendTrips.map((t) => (
              <Link
                key={t.slug}
                href={`/trips/${t.slug}`}
                className="group block overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:shadow-md"
              >
                <div className={`flex h-16 items-center justify-center bg-gradient-to-br ${t.gradient} px-4 text-center text-sm font-bold text-white`}>
                  {t.title}
                </div>
                <div className="p-4">
                  <p className="line-clamp-2 text-sm leading-snug text-gray-700 group-hover:text-blue-700">
                    {t.excerpt}
                  </p>
                  <p className="mt-3 text-xs text-gray-500">{t.days} days · ~{t.budget} {t.currency}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ Family · Couples · Budget ════════════ */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl space-y-14 px-4 sm:px-6 lg:px-8">
          <div>
            <SectionHeading
              title="Family Travel Ideas"
              subtitle="Kid-paced itineraries: one anchor per day, pools built in."
              href="/trips"
              linkLabel="All family-friendly trips"
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {familyTrips.map((t) => (
                <Link
                  key={t.slug}
                  href={`/trips/${t.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:shadow-md"
                >
                  <div className={`flex h-16 items-center justify-center bg-gradient-to-br ${t.gradient} px-4 text-center text-sm font-bold text-white`}>
                    {t.title}
                  </div>
                  <div className="p-4">
                    <p className="line-clamp-2 text-sm leading-snug text-gray-700 group-hover:text-blue-700">{t.excerpt}</p>
                    <p className="mt-3 text-xs text-gray-500">{t.days} days · ~{t.budget} {t.currency}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <SectionHeading
              title="Couples Travel Ideas"
              subtitle="Romance itineraries: slow days, one splurge, the sunset claimed early."
              href="/trips"
              linkLabel="All couples-friendly trips"
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {couplesTrips.map((t) => (
                <Link
                  key={t.slug}
                  href={`/trips/${t.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:shadow-md"
                >
                  <div className={`flex h-16 items-center justify-center bg-gradient-to-br ${t.gradient} px-4 text-center text-sm font-bold text-white`}>
                    {t.title}
                  </div>
                  <div className="p-4">
                    <p className="line-clamp-2 text-sm leading-snug text-gray-700 group-hover:text-blue-700">{t.excerpt}</p>
                    <p className="mt-3 text-xs text-gray-500">{t.days} days · ~{t.budget} {t.currency}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <SectionHeading
              title="Budget Travel Ideas"
              subtitle="Honest budgets: the cities where the best experiences cost the least."
              href="/trips"
              linkLabel="All budget trips"
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {budgetTrips.map((t) => (
                <Link
                  key={t.slug}
                  href={`/trips/${t.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:shadow-md"
                >
                  <div className={`flex h-16 items-center justify-center bg-gradient-to-br ${t.gradient} px-4 text-center text-sm font-bold text-white`}>
                    {t.title}
                  </div>
                  <div className="p-4">
                    <p className="line-clamp-2 text-sm leading-snug text-gray-700 group-hover:text-blue-700">{t.excerpt}</p>
                    <p className="mt-3 text-xs text-gray-500">{t.days} days · ~{t.budget} {t.currency}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ AI Trip Planner CTA ════════════ */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white sm:p-12">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Let the AI plan the days you&apos;re keeping
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-blue-100">
              Destination, dates, travel style, interests and budget — one form, one
              day-by-day itinerary with places, times and costs. Refine it until
              it&apos;s yours.
            </p>
            <Link
              href="/?to=Tokyo#hero-search"
              className="mt-8 inline-flex items-center rounded-full bg-white px-8 py-4 font-semibold text-blue-700 shadow-md transition hover:bg-blue-50"
            >
              Open the AI Trip Planner →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

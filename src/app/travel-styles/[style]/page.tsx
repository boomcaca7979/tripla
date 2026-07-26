import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  TRAVEL_STYLES,
  getTravelStyleBySlug,
  getTravelStyleSlugs,
  type TravelStyleMeta,
} from "@/data/travel-styles";
import { TRIPS, type Trip } from "@/data/trips";
import { DESTINATIONS, type Destination } from "@/data/destinations";
import type { TravelStyle } from "@/types/itinerary";

// ── Static params ─────────────────────────────────────────────────────

export const dynamicParams = false;

export function generateStaticParams() {
  return getTravelStyleSlugs().map((style) => ({ style }));
}

// ── Metadata (Phase 8.1) ──────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ style: string }>;
}): Promise<Metadata> {
  const { style } = await params;
  const meta = getTravelStyleBySlug(style);
  if (!meta) return { title: "Travel style not found" };

  const title = `${meta.label} Travel Trips & Itineraries`;
  const description = meta.metaDescription;
  return {
    title,
    description,
    alternates: { canonical: `/travel-styles/${meta.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://www.utripla.xyz/travel-styles/${meta.slug}`,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

// ── JSON-LD (Phase 8.1) ───────────────────────────────────────────────

function buildCollectionPageJsonLd(meta: TravelStyleMeta, tripCount: number) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${meta.label} Travel Trips & Itineraries`,
    description: meta.metaDescription,
    url: `https://www.utripla.xyz/travel-styles/${meta.slug}`,
    numberOfItems: tripCount,
  };
}

function buildItemListJsonLd(meta: TravelStyleMeta, trips: Trip[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${meta.label} Travel Trips`,
    numberOfItems: trips.length,
    itemListElement: trips.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://www.utripla.xyz/trips/${t.slug}`,
      name: t.title,
    })),
  };
}

function buildBreadcrumbJsonLd(meta: TravelStyleMeta) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.utripla.xyz/" },
      {
        "@type": "ListItem",
        position: 2,
        name: "Travel Styles",
        item: "https://www.utripla.xyz/trips",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: meta.label,
        item: `https://www.utripla.xyz/travel-styles/${meta.slug}`,
      },
    ],
  };
}

// ── Page ──────────────────────────────────────────────────────────────

export default async function TravelStylePage({
  params,
}: {
  params: Promise<{ style: string }>;
}) {
  const { style } = await params;
  const meta = getTravelStyleBySlug(style);
  if (!meta) notFound();

  // Phase 8.1: 动态过滤 TRIPS,不手写 trip 数据。
  const matchedTrips = TRIPS.filter((t) => t.travelStyle === meta.slug);

  // Phase 8.1: 从匹配 trips 的 city 去重生成 popular destinations。
  const matchedCityNames = Array.from(
    new Set(matchedTrips.map((t) => t.city)),
  );
  const popularDestinations = matchedCityNames
    .map((city) =>
      DESTINATIONS.find((d) => d.city.toLowerCase() === city.toLowerCase()),
    )
    .filter((d): d is Destination => d !== undefined)
    .slice(0, 6);

  const planHref = `/?travelStyle=${meta.slug}#hero-search`;

  return (
    <article className="min-h-screen bg-white pt-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildCollectionPageJsonLd(meta, matchedTrips.length)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildItemListJsonLd(meta, matchedTrips)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(meta)) }}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/trips" className="hover:text-gray-900">Trips</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{meta.label}</span>
        </nav>

        {/* Hero */}
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            {meta.label} Travel Trips &amp; Itineraries
          </h1>
          <p className="mt-3 max-w-2xl text-base text-gray-500 sm:text-lg">
            {matchedTrips.length} ready-to-use {meta.label.toLowerCase()} trip
            {matchedTrips.length === 1 ? "" : "s"} curated by tripla AI —
            each with day-by-day activities, budget estimates, and travel tips.
          </p>

          {/* Quick links to other styles (Phase 8.5 内链) */}
          <div className="mt-6 flex flex-wrap gap-2">
            {TRAVEL_STYLES.filter((s) => s.slug !== meta.slug).map((s) => (
              <Link
                key={s.slug}
                href={`/travel-styles/${s.slug}`}
                className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                {s.label}
              </Link>
            ))}
          </div>
        </header>

        {/* Section 1: What is {Style} Travel? */}
        <section className="mb-10">
          <h2 className="mb-3 text-2xl font-bold text-gray-900">
            What is {meta.label} travel?
          </h2>
          <p className="text-gray-700 leading-relaxed">{meta.overview}</p>
        </section>

        {/* Section 2: Recommended {Style} Trips */}
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            Recommended {meta.label} trips
          </h2>
          {matchedTrips.length === 0 ? (
            <p className="text-gray-500">No {meta.label.toLowerCase()} trips available yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {matchedTrips.map((t) => (
                <Link
                  key={t.slug}
                  href={`/trips/${t.slug}`}
                  className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700">
                    {t.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {t.city}, {t.country}
                  </p>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-xs text-gray-500">Duration</dt>
                      <dd className="font-semibold text-gray-900">{t.days} days</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">Budget</dt>
                      <dd className="font-semibold text-gray-900">
                        {t.budget.toLocaleString()} {t.currency}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-auto pt-4 text-sm font-semibold text-blue-700 group-hover:underline">
                    View itinerary →
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Section 3: Popular destinations for {Style} */}
        {popularDestinations.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Popular destinations for {meta.label} travel
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {popularDestinations.map((d) => (
                <Link
                  key={d.slug}
                  href={`/destinations/${d.slug}`}
                  className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700">
                    {d.city}
                  </h3>
                  <p className="mt-0.5 text-sm text-gray-500">{d.country}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                    {d.description}
                  </p>
                  <div className="mt-auto pt-3 text-sm font-semibold text-blue-700 group-hover:underline">
                    View destination →
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Section 4: AI planner CTA */}
        <section className="mb-16 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white">
          <h2 className="text-2xl font-bold">
            Plan your own {meta.label.toLowerCase()} trip
          </h2>
          <p className="mt-2 text-blue-100">
            Let tripla AI craft a personalized {meta.label.toLowerCase()} itinerary
            based on your dates, interests, and budget.
          </p>
          <Link
            href={planHref}
            className="mt-5 inline-flex items-center rounded-full bg-white px-6 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            Start planning →
          </Link>
        </section>
      </div>
    </article>
  );
}

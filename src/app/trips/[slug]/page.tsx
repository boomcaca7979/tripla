import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTripBySlug, getTripSlugs, TRIPS, type Trip } from "@/data/trips";
import { DESTINATIONS } from "@/data/destinations";

// ── Static params ─────────────────────────────────────────────────────

// 仅允许 generateStaticParams 返回的 slug 被渲染；
// 其他 slug 在路由层直接 404，避免 notFound() 被静默吞掉返回 200。
export const dynamicParams = false;

export function generateStaticParams() {
  return getTripSlugs().map((slug) => ({ slug }));
}

// ── Per-page metadata ─────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const trip = getTripBySlug(slug);
  if (!trip) return { title: "Trip not found" };
  // layout.tsx 的 title.template = "%s | tripla"，会自动追加站点名，这里不要重复。
  // Phase 6.4: title 目标 50-60 chars（含 " | tripla"），description 目标 140-160 chars。
  // 仅组合已有真实字段，不生成 AI 文案。
  const title = buildTripTitle(trip);
  const description = buildTripMetaDescription(trip);
  return {
    title,
    description,
    alternates: {
      canonical: `/trips/${trip.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      images: trip.coverImage ? [{ url: trip.coverImage }] : undefined,
    },
    twitter: {
      card: trip.coverImage ? "summary_large_image" : "summary",
      title,
      description,
    },
  };
}

/**
 * Phase 6.4: 构造 50-60 char 的 title（含 " | tripla" 9 字符模板）。
 * 按行程标题长度自适应选择后缀，全部来自真实字段。
 */
function buildTripTitle(trip: Trip): string {
  const style = capitalize(trip.travelStyle);
  const candidates = [
    `${trip.title} · ${trip.days}-Day ${style} Plan`,
    `${trip.title} · ${trip.days}-Day ${style} Trip`,
    `${trip.title} · ${trip.days}-Day ${style} Trip Plan`,
    `${trip.title} · ${trip.days}-Day ${style} ${trip.country} Plan`,
    `${trip.title} · ${trip.days}-Day ${style} ${trip.country} Trip Plan`,
  ];
  let chosen = candidates[0];
  for (const c of candidates) {
    if (c.length <= 51) {
      chosen = c;
      if (c.length >= 41) break;
    }
  }
  return chosen;
}

/**
 * Phase 6.4: 构造 140-160 char 的 meta description。
 * 组合 trip.description + 行程基础信息（天数/风格/城市/国家/预算），
 * 全部来自真实字段，不做 AI 文案填充。超长时按省略号截断。
 */
function buildTripMetaDescription(trip: Trip): string {
  const suffix = ` ${trip.days}-day ${trip.travelStyle} itinerary in ${trip.city}, ${trip.country}.`;
  const base = `${trip.description}${suffix}`;
  if (base.length >= 140 && base.length <= 160) return base;
  if (base.length > 160) {
    const maxDesc = 160 - suffix.length - 1;
    return trip.description.slice(0, Math.max(0, maxDesc)).trimEnd() + "…" + suffix;
  }
  // 仍偏短则追加预算信息（仍是真实字段）；若仍超 160 则按省略号截断。
  const withBudget = `${base} Total budget: ${trip.budget} ${trip.currency}.`;
  if (withBudget.length <= 160) return withBudget;
  return withBudget.slice(0, 159).trimEnd() + "…";
}

// ── JSON-LD structured data ───────────────────────────────────────────

function buildItineraryJsonLd(trip: Trip) {
  return {
    "@context": "https://schema.org",
    "@type": "Trip",
    name: trip.title,
    description: trip.description,
    url: `https://www.utripla.xyz/trips/${trip.slug}`,
    image: trip.coverImage ?? undefined,
    // Phase 9 Step 6: mainEntityOfPage 强化为 WebPage 实体。
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.utripla.xyz/trips/${trip.slug}`,
    },
    offers: {
      "@type": "Offer",
      price: trip.budget,
      priceCurrency: trip.currency,
    },
    itinerary: trip.itinerary.map((d) => ({
      "@type": "ItemList",
      name: `Day ${d.day}: ${d.theme}`,
      itemListElement: d.activities.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${a.time} — ${a.name}`,
      })),
    })),
  };
}

function buildBreadcrumbJsonLd(trip: Trip) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.utripla.xyz/" },
      { "@type": "ListItem", position: 2, name: "Trips", item: "https://www.utripla.xyz/trips" },
      {
        "@type": "ListItem",
        position: 3,
        name: trip.title,
        item: `https://www.utripla.xyz/trips/${trip.slug}`,
      },
    ],
  };
}

/**
 * Related trips ItemList schema（Phase 3 Step 4）。
 * 只描述真实存在的 trip URL，不生成 rating/review/fake data。
 */
function buildRelatedTripsItemListJsonLd(current: Trip, related: Trip[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Trips related to ${current.title}`,
    itemListElement: related.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://www.utripla.xyz/trips/${t.slug}`,
      name: t.title,
    })),
  };
}

// ── Page ──────────────────────────────────────────────────────────────

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const trip = getTripBySlug(slug);
  if (!trip) notFound();

  const planHref =
    `/?to=${encodeURIComponent(trip.city)}&days=${trip.days}#hero-search`;

  // ── Related data (Phase 3 Step 2) ────────────────────────────────────
  // 同 city 的 trip 优先；不足时用同 country 补；仍不足用任意其他 trip 补；最多 3。
  const sameCityTrips = TRIPS.filter(
    (t) => t.slug !== trip.slug && t.city.toLowerCase() === trip.city.toLowerCase(),
  );
  const sameCountryTrips = TRIPS.filter(
    (t) => t.slug !== trip.slug &&
      t.city.toLowerCase() !== trip.city.toLowerCase() &&
      t.country === trip.country,
  );
  const otherTrips = TRIPS.filter(
    (t) => t.slug !== trip.slug && t.country !== trip.country,
  );
  const relatedTrips = [
    ...sameCityTrips,
    ...sameCountryTrips,
    ...otherTrips,
  ].slice(0, 3);

  // Related destinations：同 country 优先，再同 region，再任意；最多 3。
  const matchedDestination = DESTINATIONS.find(
    (d) => d.city.toLowerCase() === trip.city.toLowerCase(),
  );
  const sameCountryDests = DESTINATIONS.filter(
    (d) => d.slug !== matchedDestination?.slug && d.country === trip.country,
  );
  const sameRegionDests = DESTINATIONS.filter(
    (d) => d.slug !== matchedDestination?.slug &&
      d.country !== trip.country &&
      matchedDestination && d.region === matchedDestination.region,
  );
  const otherDests = DESTINATIONS.filter(
    (d) => d.slug !== matchedDestination?.slug &&
      (!matchedDestination || d.region !== matchedDestination.region),
  );
  const relatedDestinations = [
    ...sameCountryDests,
    ...sameRegionDests,
    ...otherDests,
  ].slice(0, 3);

  return (
    <article className="min-h-screen bg-white pt-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildItineraryJsonLd(trip)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(trip)) }}
      />
      {relatedTrips.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildRelatedTripsItemListJsonLd(trip, relatedTrips)),
          }}
        />
      )}

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/trips" className="hover:text-gray-900">Trips</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{trip.city}</span>
        </nav>

        {/* Hero */}
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            {trip.title}
          </h1>
          <p className="mt-4 text-lg text-gray-600">{trip.description}</p>

          {/* Meta grid */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MetaCard label="Days" value={`${trip.days} days`} />
            <MetaCard
              label="Budget"
              value={`${trip.budget.toLocaleString()} ${trip.currency}`}
            />
            <MetaCard label="Style" value={capitalize(trip.travelStyle)} />
            <MetaCard label="Destination" value={trip.city} />
          </div>

          {/* Tags */}
          <div className="mt-6 flex flex-wrap gap-2">
            {trip.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
              >
                {t}
              </span>
            ))}
          </div>

          {/* Destination link (Phase 3 Step 2) + Budget guide (Phase 5 Step 4) */}
          {matchedDestination && (
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <Link
                href={`/destinations/${matchedDestination.slug}`}
                className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 font-medium text-blue-700 transition hover:bg-blue-100"
              >
                📍 {trip.city} travel guide
              </Link>
              <Link
                href={`/travel-budget/${matchedDestination.slug}`}
                className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 font-medium text-emerald-700 transition hover:bg-emerald-100"
              >
                💰 Travel budget for {trip.city}
              </Link>
              <Link
                href={`/best-time-to-visit/${matchedDestination.slug}`}
                className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-4 py-2 font-medium text-amber-700 transition hover:bg-amber-100"
              >
                🗓️ Best time to visit {trip.city}
              </Link>
            </div>
          )}

          {/* Phase 9 Step 3: Travel Style + Region 内链（仅当真实匹配时渲染） */}
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <Link
              href={`/travel-styles/${trip.travelStyle}`}
              className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-4 py-2 font-medium text-purple-700 transition hover:bg-purple-100"
            >
              ✨ Explore {capitalize(trip.travelStyle)} trips
            </Link>
            {matchedDestination && (
              <Link
                href={`/regions/${matchedDestination.region.toLowerCase()}`}
                className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-100"
              >
                🌍 Explore {matchedDestination.region} trips
              </Link>
            )}
          </div>
        </header>

        {/* Trip overview / highlights */}
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Trip overview</h2>
          <ul className="grid gap-3 sm:grid-cols-3">
            {trip.highlights.map((h, i) => (
              <li
                key={i}
                className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-800"
              >
                <span className="mr-2 text-blue-600" aria-hidden="true">✓</span>
                {h}
              </li>
            ))}
          </ul>
        </section>

        {/* Best season */}
        <section className="mb-10 rounded-2xl bg-amber-50 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-800">
            Best time to visit
          </h2>
          <p className="mt-2 text-amber-900">{trip.bestSeason}</p>
        </section>

        {/* Daily itinerary */}
        <section className="mb-10">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Day-by-day itinerary</h2>
          <ol className="space-y-6">
            {trip.itinerary.map((d) => (
              <li
                key={d.day}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-baseline justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Day {d.day} · {d.theme}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {d.activities.map((a, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-0.5 text-xl">{a.emoji}</span>
                      <div>
                        <span className="mr-2 font-mono text-xs text-gray-500">{a.time}</span>
                        <span className="text-gray-800">{a.name}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>

        {/* Budget */}
        <section className="mb-10 rounded-2xl border border-gray-100 p-6">
          <h2 className="mb-3 text-2xl font-bold text-gray-900">Budget</h2>
          <p className="text-gray-700">
            Estimated total cost:{" "}
            <span className="font-semibold">
              {trip.budget.toLocaleString()} {trip.currency}
            </span>{" "}
            for {trip.days} {trip.days === 1 ? "day" : "days"}.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Includes accommodation, local transport, food, and activities. International flights not included.
          </p>
        </section>

        {/* Travel tips (best season restated as actionable tips) */}
        <section className="mb-10">
          <h2 className="mb-3 text-2xl font-bold text-gray-900">Travel tips</h2>
          <ul className="list-disc space-y-2 pl-6 text-gray-700">
            <li>{trip.bestSeason}</li>
            <li>Carry local currency for small eateries and street food; cards are widely accepted in cities.</li>
            <li>Book popular restaurants in advance during peak season.</li>
            <li>Use public transit where possible — most stops in {trip.city} are tourist-friendly.</li>
          </ul>
        </section>

        {/* Restaurants */}
        {trip.restaurants.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Recommended restaurants</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {trip.restaurants.map((r) => (
                <div
                  key={r.name}
                  className="rounded-xl border border-gray-100 p-4"
                >
                  <div className="text-2xl">{r.emoji}</div>
                  <div className="mt-2 font-semibold text-gray-900">{r.name}</div>
                  <div className="text-sm text-gray-500">{r.cuisine}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="mb-10 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white">
          <h2 className="text-2xl font-bold">Want to customize this trip?</h2>
          <p className="mt-2 text-blue-100">
            Use this as a starting point and let tripla AI tailor every detail to your dates and interests.
          </p>
          <Link
            href={planHref}
            className="mt-5 inline-flex items-center rounded-full bg-white px-6 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            Customize this trip →
          </Link>
        </section>

        {/* Related trips (Phase 3 Step 2: 同 city 优先，最多 3) */}
        {relatedTrips.length > 0 && (
          <section className="mb-16">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Related trips</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {relatedTrips.map((t) => (
                <Link
                  key={t.slug}
                  href={`/trips/${t.slug}`}
                  className="group block rounded-2xl border border-gray-100 overflow-hidden transition hover:shadow-md"
                >
                  <div
                    className={`h-28 bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white`}
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

        {/* Related destinations (Phase 3 Step 2) */}
        {relatedDestinations.length > 0 && (
          <section className="mb-16">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Related destinations</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {relatedDestinations.map((d) => (
                <Link
                  key={d.slug}
                  href={`/destinations/${d.slug}`}
                  className="group block rounded-2xl border border-gray-100 overflow-hidden transition hover:shadow-md"
                >
                  <div
                    className={`h-28 bg-gradient-to-br ${d.gradient} flex items-center justify-center text-white`}
                  >
                    <span className="text-lg font-bold">{d.city}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">
                      {d.city}
                    </h3>
                    <div className="mt-1 text-sm text-gray-500">{d.country}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

// ── Sub-components ────────────────────────────────────────────────────

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

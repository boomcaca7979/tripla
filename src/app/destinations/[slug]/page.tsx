import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  DESTINATIONS,
  getDestinationBySlug,
  getDestinationSlugs,
  type Destination,
} from "@/data/destinations";
import { TRIPS } from "@/data/trips";
import { getGuidesForCity } from "@/data/guides";
import WeatherScore from "@/components/weather/WeatherScore";
import { buildHotelSearchUrl } from "@/lib/affiliate";

// ── Static params ─────────────────────────────────────────────────────

export const dynamicParams = false;

export function generateStaticParams() {
  return getDestinationSlugs().map((slug) => ({ slug }));
}

// ── Per-page metadata ─────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dest = getDestinationBySlug(slug);
  if (!dest) return { title: "Destination not found" };
  // layout.tsx 的 title.template = "%s | tripla"，自动追加站点名。
  // Phase 6.4: title 目标 50-60 chars（含 " | tripla"），description 目标 140-160 chars。
  // 仅组合已有真实字段，不生成 AI 文案。
  const title = buildDestinationTitle(dest);
  const description = buildDestinationMetaDescription(dest);
  return {
    title,
    description,
    alternates: {
      canonical: `/destinations/${dest.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      images: dest.image ? [{ url: dest.image }] : undefined,
    },
    twitter: {
      card: dest.image ? "summary_large_image" : "summary",
      title,
      description,
    },
  };
}

/**
 * Phase 6.4: 构造 50-60 char 的 title（含 " | tripla" 9 字符模板）。
 * 根据 country 长度自适应后缀，避免过长或过短。
 */
function buildDestinationTitle(dest: Destination): string {
  const base = `${dest.city} Travel Guide`;
  if (dest.city === dest.country) {
    return `${base} · Top Highlights & Tips`;
  }
  if (dest.country.length > 12) {
    return `${base} · ${dest.country} Highlights`;
  }
  return `${base} · ${dest.country} Highlights & Tips`;
}

/**
 * Phase 6.4: 构造 140-160 char 的 meta description。
 * 以 dest.longDescription 为基础，按需截断并追加 bestMonths/recommendedDays/budget 等真实字段。
 * 截断仅使用 … 省略号，不篡改原意。
 */
function buildDestinationMetaDescription(dest: Destination): string {
  const suffix = ` Best time: ${dest.bestMonths}. Stay: ${dest.recommendedDays} days. Budget: ${dest.budgetPerDay} ${dest.budgetCurrency}/day.`;
  const maxPrefix = 160 - suffix.length;
  let prefix = dest.longDescription;
  if (prefix.length > maxPrefix) {
    prefix = prefix.slice(0, Math.max(0, maxPrefix - 1)).trimEnd() + "…";
  }
  return prefix + suffix;
}

// ── JSON-LD structured data ───────────────────────────────────────────

function buildTouristDestinationJsonLd(dest: Destination) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: dest.city,
    description: dest.longDescription,
    url: `https://www.utripla.xyz/destinations/${dest.slug}`,
    image: dest.image ?? undefined,
    // Phase 9 Step 6: mainEntityOfPage 强化为 WebPage 实体。
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.utripla.xyz/destinations/${dest.slug}`,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: dest.city,
      addressCountry: dest.country,
    },
    touristType: dest.travelStyle,
  };
}

function buildBreadcrumbJsonLd(dest: Destination) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.utripla.xyz/" },
      { "@type": "ListItem", position: 2, name: "Destinations", item: "https://www.utripla.xyz/destinations" },
      {
        "@type": "ListItem",
        position: 3,
        name: dest.city,
        item: `https://www.utripla.xyz/destinations/${dest.slug}`,
      },
    ],
  };
}

/**
 * Popular trip templates ItemList schema（Phase 3 Step 4）。
 * 只描述真实存在的 trip URL，不生成 rating/review/fake data。
 */
function buildPopularTripsItemListJsonLd(dest: Destination, trips: typeof TRIPS) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Popular trip templates in ${dest.city}`,
    itemListElement: trips.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://www.utripla.xyz/trips/${t.slug}`,
      name: t.title,
    })),
  };
}

/**
 * Phase 8.3/9 Step 5: FAQPage schema。
 * 仅基于 dest 已有字段构造问答,不生成无数据来源的问题。
 * 答案组合 bestSeason / bestMonths / recommendedDays / budgetPerDay / budgetCurrency。
 */
function buildFaqJsonLd(dest: Destination) {
  const faqs: { question: string; answer: string }[] = [];

  // Q1: best time to visit (组合 bestSeason + bestMonths)
  faqs.push({
    question: `What is the best time to visit ${dest.city}?`,
    answer: `The best months to visit ${dest.city} are ${dest.bestMonths}. ${dest.bestSeason} Plan your trip around these months for the most favorable weather and crowd levels.`,
  });

  // Q2: how many days (组合 recommendedDays + bestMonths)
  faqs.push({
    question: `How many days do you need in ${dest.city}?`,
    answer: `We recommend staying ${dest.recommendedDays} ${dest.recommendedDays === 1 ? "day" : "days"} in ${dest.city} to cover the main attractions at a relaxed pace. Visiting during ${dest.bestMonths} gives you the best weather for that duration.`,
  });

  // Q3: daily cost (组合 budgetPerDay + budgetCurrency + recommendedDays)
  const totalBudget = dest.budgetPerDay * dest.recommendedDays;
  faqs.push({
    question: `How much does ${dest.city} cost per day?`,
    answer: `Estimated daily cost in ${dest.city} is ${dest.budgetPerDay.toLocaleString()} ${dest.budgetCurrency}, covering accommodation, food, local transport, and activities. For the recommended ${dest.recommendedDays}-day stay, plan around ${totalBudget.toLocaleString()} ${dest.budgetCurrency} per person. International flights are not included.`,
  });

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

/** Hotel affiliate 链接的默认日期（今天起 7 晚）。模块级 helper，避免渲染期直接调用 new Date()。 */
function defaultHotelDates() {
  const checkIn = new Date().toISOString().slice(0, 10);
  const checkOut = new Date(Date.now() + 7 * 86400000)
    .toISOString()
    .slice(0, 10);
  return { checkIn, checkOut };
}

// ── Page ──────────────────────────────────────────────────────────────

export default async function DestinationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dest = getDestinationBySlug(slug);
  if (!dest) notFound();

  const planHref = `/?to=${encodeURIComponent(dest.city)}#hero-search`;

  // Phase 3 Step 3: Popular trip templates（同 city 优先，最多 5 个）
  const popularTrips = TRIPS.filter(
    (t) => t.city.toLowerCase() === dest.city.toLowerCase(),
  ).slice(0, 5);

  // Destination → Guide 内链（同 city 的 guide，最多 4）。
  const cityGuides = getGuidesForCity(dest.city).slice(0, 4);

  const totalBudget = dest.budgetPerDay * dest.recommendedDays;

  return (
    <article className="min-h-screen bg-white pt-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildTouristDestinationJsonLd(dest)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(dest)) }}
      />
      {popularTrips.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildPopularTripsItemListJsonLd(dest, popularTrips)),
          }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd(dest)) }}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/destinations" className="hover:text-gray-900">Destinations</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{dest.city}</span>
        </nav>

        {/* Hero */}
        <header className="mb-10">
          <div className={`relative h-64 sm:h-80 overflow-hidden rounded-2xl bg-gradient-to-br ${dest.gradient}`}>
            {dest.image ? (
              <Image
                src={dest.image}
                alt={`${dest.city}, ${dest.country}`}
                fill
                unoptimized
                sizes="(min-width: 1024px) 800px, 100vw"
                className="object-cover"
                priority
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                {dest.region}
              </span>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                {dest.city}
              </h1>
              <p className="mt-1 text-lg text-white/80">{dest.country}</p>
            </div>
            <div className="absolute right-4 top-4 rounded-full bg-white/90 p-1.5 shadow-sm backdrop-blur-sm">
              <WeatherScore score={dest.weatherScore} size="sm" />
            </div>
          </div>

          <p className="mt-6 text-lg text-gray-600">{dest.longDescription}</p>

          {/* Meta grid */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MetaCard label="Best season" value={dest.bestMonths} />
            <MetaCard label="Currency" value={dest.currency} />
            <MetaCard label="Timezone" value={dest.timezone} />
            <MetaCard label="Airport" value={dest.airport.iata} />
          </div>

          {/* Quick facts (Phase 5 Step 2) */}
          <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">
              Quick facts
            </h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-gray-500">Country</dt>
                <dd className="font-medium text-gray-900">{dest.country}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Region</dt>
                <dd className="font-medium text-gray-900">{dest.region}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Currency</dt>
                <dd className="font-medium text-gray-900">{dest.currency}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Timezone</dt>
                <dd className="font-medium text-gray-900">{dest.timezone}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Airport</dt>
                <dd className="font-medium text-gray-900">
                  {dest.airport.iata} · {dest.airport.city}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Travel style</dt>
                <dd className="font-medium text-gray-900">{capitalize(dest.travelStyle)}</dd>
              </div>
            </dl>
          </div>

          {/* Related guides (Phase 5 Step 4: 内链网状结构) */}
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link
              href={`/best-time-to-visit/${dest.slug}`}
              className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 font-medium text-emerald-700 transition hover:bg-emerald-100"
            >
              🗓️ Best time to visit {dest.city}
            </Link>
            <Link
              href={`/travel-budget/${dest.slug}`}
              className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 font-medium text-blue-700 transition hover:bg-blue-100"
            >
              💰 Travel budget for {dest.city}
            </Link>
          </div>

          {/* Phase 8.5: Travel Style + Region 内链 */}
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <Link
              href={`/travel-styles/${dest.travelStyle}`}
              className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-4 py-2 font-medium text-purple-700 transition hover:bg-purple-100"
            >
              ✨ {capitalize(dest.travelStyle)} travel trips
            </Link>
            <Link
              href={`/regions/${dest.region.toLowerCase()}`}
              className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-100"
            >
              🌍 More destinations in {dest.region}
            </Link>
          </div>
        </header>

        {/* Travel interests */}
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Travel interests in {dest.city}</h2>
          <p className="mb-4 text-gray-700">
            {dest.city} is a {dest.travelStyle} destination offering {dest.interests.length} main types of experiences:
          </p>
          <div className="flex flex-wrap gap-2">
            {dest.interests.map((i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
              >
                {capitalize(i)}
              </span>
            ))}
          </div>
        </section>

        {/* Best time to visit */}
        <section className="mb-10 rounded-2xl bg-amber-50 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-800">
            Best time to visit
          </h2>
          <p className="mt-2 text-amber-900">{dest.bestSeason}</p>
          <p className="mt-2 text-sm text-amber-700">
            Current weather: {dest.weatherScore.label} ({dest.weatherScore.overall}/100) — {dest.weatherScore.recommendation}
          </p>
        </section>

        {/* Recommended duration */}
        <section className="mb-10">
          <h2 className="mb-3 text-2xl font-bold text-gray-900">Recommended duration</h2>
          <p className="text-gray-700">
            We recommend staying{" "}
            <span className="font-semibold">
              {dest.recommendedDays} {dest.recommendedDays === 1 ? "day" : "days"}
            </span>{" "}
            in {dest.city} to cover the main attractions at a relaxed pace.
          </p>
        </section>

        {/* Budget information */}
        <section className="mb-10 rounded-2xl border border-gray-100 p-6">
          <h2 className="mb-3 text-2xl font-bold text-gray-900">Budget information</h2>
          <p className="text-gray-700">
            Estimated daily cost:{" "}
            <span className="font-semibold">
              {dest.budgetPerDay.toLocaleString()} {dest.budgetCurrency}
            </span>
          </p>
          <p className="mt-2 text-gray-700">
            Total for {dest.recommendedDays} days:{" "}
            <span className="font-semibold">
              {totalBudget.toLocaleString()} {dest.budgetCurrency}
            </span>
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Includes accommodation, local transport, food, and activities. International flights not included.
          </p>
        </section>

        {/* Top highlights */}
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Top highlights</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {dest.highlights.map((h, i) => (
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

        {/* City guides (Destination → Guide 内链) */}
        {cityGuides.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              {dest.city} travel guides
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {cityGuides.map((g) => (
                <Link
                  key={g.slug}
                  href={`/guides/${g.slug}`}
                  className="group block rounded-2xl border border-gray-100 overflow-hidden transition hover:shadow-md"
                >
                  <div
                    className={`h-24 bg-gradient-to-br ${g.gradient} flex items-end p-4`}
                  >
                    <span className="text-sm font-semibold text-white/90">
                      {g.readTime} · Updated {g.updatedAt}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">
                      {g.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                      {g.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Popular trip templates (Phase 3 Step 3: 最多 5 个) */}
        {popularTrips.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Popular trip templates in {dest.city}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {popularTrips.map((t) => (
                <Link
                  key={t.slug}
                  href={`/trips/${t.slug}`}
                  className="group block rounded-2xl border border-gray-100 overflow-hidden transition hover:shadow-md"
                >
                  <div
                    className={`h-28 bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white`}
                  >
                    <span className="text-lg font-bold">{t.days} days</span>
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

        {/* AI planner CTA */}
        <section className="mb-10 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white">
          <h2 className="text-2xl font-bold">Plan your trip to {dest.city}</h2>
          <p className="mt-2 text-blue-100">
            Let tripla AI craft a personalized itinerary based on your dates, interests, and budget.
          </p>
          <Link
            href={planHref}
            className="mt-5 inline-flex items-center rounded-full bg-white px-6 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            Plan a trip to {dest.city} →
          </Link>
        </section>

        {/* Hotel affiliate CTA */}
        <section className="mb-16 rounded-2xl border border-gray-100 p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-900">Need a hotel in {dest.city}?</h2>
          <a
            href={buildHotelSearchUrl({
              city: dest.city,
              ...defaultHotelDates(),
            })}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="mt-3 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-5 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
          >
            Search hotels in {dest.city}
          </a>
        </section>

        {/* Related destinations */}
        <RelatedDestinations current={dest} />
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

function RelatedDestinations({ current }: { current: Destination }) {
  const related = DESTINATIONS.filter(
    (d) => d.slug !== current.slug && d.region === current.region,
  )
    .slice(0, 3)
    .concat(
      DESTINATIONS.filter(
        (d) => d.slug !== current.slug && d.region !== current.region,
      ).slice(0, Math.max(0, 3 - DESTINATIONS.filter(
        (d) => d.slug !== current.slug && d.region === current.region,
      ).length)),
    )
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="mb-4 text-2xl font-bold text-gray-900">Other destinations</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {related.map((d) => (
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
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDestinationBySlug } from "@/data/destinations";
import { DESTINATIONS, type Destination } from "@/data/destinations";
import { TRIPS } from "@/data/trips";
import {
  getClimateZone,
  getHemisphere,
  getMonthName,
  getMonthRecommendation,
  getMonthlyClimateNote,
} from "@/lib/climate-pattern";

// ── Static params ─────────────────────────────────────────────────────

export const dynamicParams = false;

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ slug: d.slug }));
}

// ── Metadata ──────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dest = getDestinationBySlug(slug);
  if (!dest) return { title: "Destination not found" };
  // Phase 6.4: title 目标 50-60 chars（含 " | tripla"），description 目标 140-160 chars。
  // 仅组合已有真实字段，不生成 AI 文案。
  const title = `Best Time To Visit ${dest.city} · ${dest.bestMonths} Travel Guide`;
  const description = buildBestTimeMetaDescription(dest);
  return {
    title,
    description,
    alternates: { canonical: `/best-time-to-visit/${dest.slug}` },
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
 * Phase 6.4: 构造 140-160 char 的 meta description。
 * 组合 dest.bestSeason（真实季节说明）+ 天气数据，按需截断。
 */
function buildBestTimeMetaDescription(dest: Destination): string {
  const suffix = ` Plan your trip to ${dest.city}, ${dest.country}.`;
  const weatherPrefix = `Weather: ${dest.weatherScore.label}. `;
  const maxSeason = 160 - suffix.length - weatherPrefix.length;
  let season = dest.bestSeason;
  if (season.length > maxSeason) {
    season = season.slice(0, Math.max(0, maxSeason - 1)).trimEnd() + "…";
  }
  return season + " " + weatherPrefix + suffix.trim();
}

// ── JSON-LD ───────────────────────────────────────────────────────────

function buildArticleJsonLd(dest: Destination) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Best Time To Visit ${dest.city}`,
    description: `Monthly climate patterns and seasonal travel advice for ${dest.city}, ${dest.country}.`,
    url: `https://www.utripla.xyz/best-time-to-visit/${dest.slug}`,
    // Phase 9 Step 6: mainEntityOfPage 强化为 WebPage 实体。
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.utripla.xyz/best-time-to-visit/${dest.slug}`,
    },
    author: {
      "@type": "Organization",
      name: "tripla",
      url: "https://www.utripla.xyz",
    },
    publisher: {
      "@type": "Organization",
      name: "tripla",
      url: "https://www.utripla.xyz",
    },
    // Phase 7.5/8.4: 使用 dest.publishedAt / updatedAt (YYYY-MM-DD)。
    datePublished: dest.publishedAt,
    dateModified: dest.updatedAt,
    about: {
      "@type": "TouristDestination",
      name: dest.city,
      address: {
        "@type": "PostalAddress",
        addressLocality: dest.city,
        addressCountry: dest.country,
      },
    },
  };
}

function buildBreadcrumbJsonLd(dest: Destination) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.utripla.xyz/" },
      {
        "@type": "ListItem",
        position: 2,
        name: "Best Time To Visit",
        item: "https://www.utripla.xyz/destinations",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: dest.city,
        item: `https://www.utripla.xyz/best-time-to-visit/${dest.slug}`,
      },
    ],
  };
}

/**
 * Phase 8.3/9 Step 5: FAQPage schema for best-time-to-visit。
 * 答案仅来自 dest.bestSeason / bestMonths / weatherScore 真实字段。
 */
function buildFaqJsonLd(dest: Destination) {
  const faqs: { question: string; answer: string }[] = [];

  faqs.push({
    question: `What are the best months to visit ${dest.city}?`,
    answer: `The best months to visit ${dest.city} are ${dest.bestMonths}. ${dest.bestSeason} These months offer the most reliable weather for sightseeing, outdoor activities, and local events.`,
  });

  faqs.push({
    question: `What is the current weather like in ${dest.city}?`,
    answer: `Current weather in ${dest.city} is rated ${dest.weatherScore.label} with a score of ${dest.weatherScore.overall}/100. ${dest.weatherScore.recommendation} Temperature, precipitation, wind, and sunshine are all considered in this rating.`,
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

// ── Page ──────────────────────────────────────────────────────────────

export default async function BestTimeToVisitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dest = getDestinationBySlug(slug);
  if (!dest) notFound();

  const planHref = `/?to=${encodeURIComponent(dest.city)}#hero-search`;
  const zone = getClimateZone(dest);
  const hemisphere = getHemisphere(dest);

  const months = Array.from({ length: 12 }, (_, i) => i);
  const bestMonths = months.filter((m) => getMonthRecommendation(dest, m) === "best");
  const worstMonths = months.filter((m) => getMonthRecommendation(dest, m) === "avoid");
  const goodMonths = months.filter((m) => getMonthRecommendation(dest, m) === "good");

  const relatedTrips = TRIPS.filter(
    (t) => t.city.toLowerCase() === dest.city.toLowerCase(),
  ).slice(0, 3);

  return (
    <article className="min-h-screen bg-white pt-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildArticleJsonLd(dest)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(dest)) }}
      />
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
          <span className="text-gray-900">Best time to visit {dest.city}</span>
        </nav>

        {/* Hero */}
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Best Time To Visit {dest.city}
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            A month-by-month guide to weather, crowds, and travel conditions in {dest.city}, {dest.country}.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
              Climate zone: {zone}
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
              Hemisphere: {hemisphere}
            </span>
            <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700">
              Current weather: {dest.weatherScore.label} ({dest.weatherScore.overall}/100)
            </span>
          </div>

          {/* Related guides (Phase 5 Step 4) */}
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link
              href={`/destinations/${dest.slug}`}
              className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 font-medium text-blue-700 transition hover:bg-blue-100"
            >
              📍 {dest.city} travel guide
            </Link>
            <Link
              href={`/travel-budget/${dest.slug}`}
              className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 font-medium text-emerald-700 transition hover:bg-emerald-100"
            >
              💰 Travel budget for {dest.city}
            </Link>
          </div>
        </header>

        {/* City overview */}
        <section className="mb-10">
          <h2 className="mb-3 text-2xl font-bold text-gray-900">About {dest.city}</h2>
          <p className="text-gray-700">{dest.longDescription}</p>
          <p className="mt-4">
            <Link
              href={`/destinations/${dest.slug}`}
              className="font-semibold text-blue-700 underline-offset-2 hover:underline"
            >
              View full {dest.city} travel guide →
            </Link>
          </p>
        </section>

        {/* Monthly weather information */}
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Monthly weather guide</h2>
          <p className="mb-4 text-sm text-gray-500">
            The table below shows general climate patterns derived from {dest.city}&apos;s latitude and climate zone.
            These are not real-time forecasts — for current conditions, use the AI planner which pulls live data from Open-Meteo.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="py-2 pr-4 font-semibold text-gray-900">Month</th>
                  <th className="py-2 pr-4 font-semibold text-gray-900">Temperature</th>
                  <th className="py-2 pr-4 font-semibold text-gray-900">Precipitation</th>
                  <th className="py-2 pr-4 font-semibold text-gray-900">Notes</th>
                  <th className="py-2 font-semibold text-gray-900">Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {months.map((m) => {
                  const note = getMonthlyClimateNote(dest, m);
                  const rec = getMonthRecommendation(dest, m);
                  return (
                    <tr key={m} className="border-b border-gray-100">
                      <td className="py-2 pr-4 font-medium text-gray-900">{getMonthName(m)}</td>
                      <td className="py-2 pr-4 text-gray-700">{note.tempLevel}</td>
                      <td className="py-2 pr-4 text-gray-700">{note.precipTendency}</td>
                      <td className="py-2 pr-4 text-gray-600">{note.note}</td>
                      <td className="py-2">
                        <RecommendationBadge level={rec} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Best months recommendation */}
        <section className="mb-10 rounded-2xl bg-emerald-50 p-6">
          <h2 className="mb-3 text-2xl font-bold text-emerald-900">
            Best months to visit
          </h2>
          <div className="flex flex-wrap gap-2">
            {bestMonths.length > 0 ? (
              bestMonths.map((m) => (
                <span
                  key={m}
                  className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800"
                >
                  {getMonthName(m)}
                </span>
              ))
            ) : (
              <span className="text-emerald-800">See seasonal notes below.</span>
            )}
          </div>
          <p className="mt-4 text-emerald-900">
            {dest.bestSeason}
          </p>
          <p className="mt-2 text-sm text-emerald-700">
            Current live conditions: {dest.weatherScore.recommendation}
          </p>
        </section>

        {/* Good (shoulder) months */}
        {goodMonths.length > 0 && (
          <section className="mb-10 rounded-2xl bg-blue-50 p-6">
            <h2 className="mb-3 text-xl font-bold text-blue-900">
              Shoulder season (also good)
            </h2>
            <div className="flex flex-wrap gap-2">
              {goodMonths.map((m) => (
                <span
                  key={m}
                  className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                >
                  {getMonthName(m)}
                </span>
              ))}
            </div>
            <p className="mt-3 text-sm text-blue-700">
              Shoulder months offer fewer crowds and lower prices while weather remains acceptable.
            </p>
          </section>
        )}

        {/* Worst months */}
        {worstMonths.length > 0 && (
          <section className="mb-10 rounded-2xl bg-rose-50 p-6">
            <h2 className="mb-3 text-2xl font-bold text-rose-900">
              Months to avoid
            </h2>
            <div className="flex flex-wrap gap-2">
              {worstMonths.map((m) => (
                <span
                  key={m}
                  className="rounded-full bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-800"
                >
                  {getMonthName(m)}
                </span>
              ))}
            </div>
            <p className="mt-3 text-sm text-rose-700">
              These months typically bring challenging weather (extreme heat, heavy rain, or cold).
              If you must travel during this period, plan indoor activities and check forecasts closer to your date.
            </p>
          </section>
        )}

        {/* Related trips */}
        {relatedTrips.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Popular trips in {dest.city}
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {relatedTrips.map((t) => (
                <Link
                  key={t.slug}
                  href={`/trips/${t.slug}`}
                  className="group block rounded-2xl border border-gray-100 overflow-hidden transition hover:shadow-md"
                >
                  <div
                    className={`h-24 bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white`}
                  >
                    <span className="font-bold">{t.days} days</span>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">
                      {t.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* AI planner CTA */}
        <section className="mb-16 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white">
          <h2 className="text-2xl font-bold">Plan your trip to {dest.city}</h2>
          <p className="mt-2 text-blue-100">
            Get a personalized itinerary with live weather forecasts and budget estimates.
          </p>
          <Link
            href={planHref}
            className="mt-5 inline-flex items-center rounded-full bg-white px-6 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            Plan a trip to {dest.city} →
          </Link>
        </section>
      </div>
    </article>
  );
}

// ── Sub-components ────────────────────────────────────────────────────

function RecommendationBadge({ level }: { level: "best" | "good" | "avoid" }) {
  if (level === "best") {
    return (
      <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
        Best
      </span>
    );
  }
  if (level === "good") {
    return (
      <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
        Good
      </span>
    );
  }
  return (
    <span className="inline-block rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800">
      Avoid
    </span>
  );
}

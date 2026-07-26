import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  DESTINATIONS,
  getDestinationBySlug,
  type Destination,
} from "@/data/destinations";
import { TRIPS } from "@/data/trips";

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
  const title = `${dest.city} Travel Budget Guide · ${dest.budgetPerDay} ${dest.budgetCurrency}/day Trip`;
  const description = buildTravelBudgetMetaDescription(dest);
  return {
    title,
    description,
    alternates: { canonical: `/travel-budget/${dest.slug}` },
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
 * 组合预算数据 + bestSeason，按需截断。
 */
function buildTravelBudgetMetaDescription(dest: Destination): string {
  const total = dest.budgetPerDay * dest.recommendedDays;
  const prefix = `Daily cost in ${dest.city}: ${dest.budgetPerDay} ${dest.budgetCurrency}. Total for ${dest.recommendedDays} days: ${total} ${dest.budgetCurrency}. `;
  const remaining = 160 - prefix.length;
  let season = dest.bestSeason;
  if (season.length > remaining) {
    season = season.slice(0, Math.max(0, remaining - 1)).trimEnd() + "…";
  }
  return prefix + season;
}

// ── JSON-LD ───────────────────────────────────────────────────────────

function buildArticleJsonLd(dest: Destination, dailyBudget: number, currency: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Travel Budget for ${dest.city}`,
    description: `Estimated daily and total trip costs for visiting ${dest.city}, ${dest.country}.`,
    url: `https://www.utripla.xyz/travel-budget/${dest.slug}`,
    // Phase 9 Step 6: mainEntityOfPage 强化为 WebPage 实体。
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.utripla.xyz/travel-budget/${dest.slug}`,
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
    mentions: {
      "@type": "Offer",
      price: dailyBudget,
      priceCurrency: currency,
      description: "Estimated daily budget",
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
        name: "Travel Budget",
        item: "https://www.utripla.xyz/destinations",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: dest.city,
        item: `https://www.utripla.xyz/travel-budget/${dest.slug}`,
      },
    ],
  };
}

/**
 * Phase 8.3/9 Step 5: FAQPage schema for travel-budget。
 * 答案仅来自 dest.budgetPerDay / budgetCurrency / recommendedDays 真实字段。
 */
function buildFaqJsonLd(dest: Destination) {
  const faqs: { question: string; answer: string }[] = [];
  const total = dest.budgetPerDay * dest.recommendedDays;

  faqs.push({
    question: `How much does it cost to visit ${dest.city} per day?`,
    answer: `Estimated daily cost in ${dest.city} is ${dest.budgetPerDay.toLocaleString()} ${dest.budgetCurrency}, covering accommodation, food, local transport, and activities. The breakdown is approximately 40% accommodation, 25% food, 15% transport, and 20% activities. International flights are not included.`,
  });

  faqs.push({
    question: `What is the total budget for ${dest.recommendedDays} days in ${dest.city}?`,
    answer: `For the recommended ${dest.recommendedDays}-day stay in ${dest.city}, the estimated total is ${total.toLocaleString()} ${dest.budgetCurrency} per person. This covers ${dest.recommendedDays} ${dest.recommendedDays === 1 ? "day" : "days"} of accommodation, meals, local transport, and activities at the daily rate of ${dest.budgetPerDay.toLocaleString()} ${dest.budgetCurrency}.`,
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

// ── Budget breakdown helpers ──────────────────────────────────────────
// 基于 destination.budgetPerDay 拆分为 4 类。比例为旅行预算通用估算
//（住宿 40% / 餐饮 25% / 交通 15% / 活动 20%），明确标注为 estimated。

const BREAKDOWN_RATIOS = {
  accommodation: 0.4,
  food: 0.25,
  transportation: 0.15,
  activities: 0.2,
} as const;

function breakdownAmount(daily: number, ratio: number): number {
  return Math.round(daily * ratio);
}

// ── Page ──────────────────────────────────────────────────────────────

export default async function TravelBudgetPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dest = getDestinationBySlug(slug);
  if (!dest) notFound();

  const planHref = `/?to=${encodeURIComponent(dest.city)}#hero-search`;

  const dailyBudget = dest.budgetPerDay;
  const currency = dest.budgetCurrency;

  const accommodation = breakdownAmount(dailyBudget, BREAKDOWN_RATIOS.accommodation);
  const food = breakdownAmount(dailyBudget, BREAKDOWN_RATIOS.food);
  const transportation = breakdownAmount(dailyBudget, BREAKDOWN_RATIOS.transportation);
  const activities = breakdownAmount(dailyBudget, BREAKDOWN_RATIOS.activities);

  // 多个行程时长参考：3 / 5 / 7 / 14 天
  const durations = [3, 5, 7, 14];

  const relatedTrips = TRIPS.filter(
    (t) => t.city.toLowerCase() === dest.city.toLowerCase(),
  ).slice(0, 3);

  return (
    <article className="min-h-screen bg-white pt-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildArticleJsonLd(dest, dailyBudget, currency)),
        }}
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
          <span className="text-gray-900">Travel budget: {dest.city}</span>
        </nav>

        {/* Hero */}
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Travel Budget for {dest.city}
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            How much does a trip to {dest.city}, {dest.country} cost?
            Here&apos;s an estimated daily budget and total trip cost for different durations.
          </p>

          {/* Related guides (Phase 5 Step 4) */}
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link
              href={`/destinations/${dest.slug}`}
              className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 font-medium text-blue-700 transition hover:bg-blue-100"
            >
              📍 {dest.city} travel guide
            </Link>
            <Link
              href={`/best-time-to-visit/${dest.slug}`}
              className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-4 py-2 font-medium text-amber-700 transition hover:bg-amber-100"
            >
              🗓️ Best time to visit {dest.city}
            </Link>
          </div>
        </header>

        {/* Average daily budget */}
        <section className="mb-10 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-center text-white">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-50">
            Average daily budget
          </h2>
          <div className="mt-2 text-5xl font-extrabold">
            {dailyBudget.toLocaleString()}{" "}
            <span className="text-2xl font-semibold">{currency}</span>
          </div>
          <p className="mt-3 text-sm text-emerald-50">
            Estimated cost per person per day, including accommodation, food, local transport, and activities.
            International flights not included.
          </p>
        </section>

        {/* Budget breakdown */}
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Daily budget breakdown</h2>
          <p className="mb-4 text-sm text-gray-500">
            The split below uses common traveler ratios (40% / 25% / 15% / 20%) applied to the daily estimate.
            Actual spend varies by travel style and season.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <BudgetCard
              label="Accommodation"
              amount={accommodation}
              currency={currency}
              icon="🏨"
              note="Hostels to mid-range hotels"
            />
            <BudgetCard
              label="Food"
              amount={food}
              currency={currency}
              icon="🍜"
              note="Local eateries and casual dining"
            />
            <BudgetCard
              label="Transportation"
              amount={transportation}
              currency={currency}
              icon="🚇"
              note="Public transit and local taxis"
            />
            <BudgetCard
              label="Activities"
              amount={activities}
              currency={currency}
              icon="🎟️"
              note="Attractions, museums, tours"
            />
          </div>
        </section>

        {/* Trip duration calculator */}
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Trip duration calculator</h2>
          <p className="mb-4 text-sm text-gray-500">
            Total estimated cost based on the daily budget above. Use as a reference for planning.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="py-2 pr-4 font-semibold text-gray-900">Duration</th>
                  <th className="py-2 pr-4 font-semibold text-gray-900">Daily budget</th>
                  <th className="py-2 pr-4 font-semibold text-gray-900">Estimated total</th>
                </tr>
              </thead>
              <tbody>
                {durations.map((d) => (
                  <tr key={d} className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-medium text-gray-900">
                      {d} {d === 1 ? "day" : "days"}
                    </td>
                    <td className="py-2 pr-4 text-gray-700">
                      {dailyBudget.toLocaleString()} {currency}
                    </td>
                    <td className="py-2 pr-4 font-semibold text-gray-900">
                      {(dailyBudget * d).toLocaleString()} {currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            Calculated from destination.budgetPerDay. Recommended stay in {dest.city}: {dest.recommendedDays} days.
          </p>
        </section>

        {/* Cost-saving tips */}
        <section className="mb-10 rounded-2xl border border-gray-100 p-6">
          <h2 className="mb-3 text-2xl font-bold text-gray-900">Money-saving tips</h2>
          <ul className="list-disc space-y-2 pl-6 text-gray-700">
            <li>Travel in shoulder season for lower accommodation rates.</li>
            <li>Use public transit passes instead of single tickets.</li>
            <li>Eat where locals eat — street food and hawker centres are often the best value.</li>
            <li>Book attractions online in advance for combo discounts.</li>
            <li>Carry {dest.currency} in cash for small vendors that don&apos;t accept cards.</li>
          </ul>
        </section>

        {/* Related trips */}
        {relatedTrips.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Sample trips in {dest.city}
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
                    <div className="mt-1 text-xs text-gray-500">
                      {t.budget.toLocaleString()} {t.currency}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* AI planner CTA */}
        <section className="mb-16 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white">
          <h2 className="text-2xl font-bold">Get a personalized budget</h2>
          <p className="mt-2 text-blue-100">
            Let tripla AI build an itinerary with real-time cost estimates for your dates and interests.
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

function BudgetCard({
  label,
  amount,
  currency,
  icon,
  note,
}: {
  label: string;
  amount: number;
  currency: string;
  icon: string;
  note: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {label}
        </span>
      </div>
      <div className="mt-2 text-xl font-bold text-gray-900">
        {amount.toLocaleString()} <span className="text-sm font-medium">{currency}</span>
      </div>
      <div className="mt-1 text-xs text-gray-500">{note}</div>
    </div>
  );
}

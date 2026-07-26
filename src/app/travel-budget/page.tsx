import type { Metadata } from "next";
import Link from "next/link";
import { DESTINATIONS } from "@/data/destinations";

// ── Metadata（Phase 7.2）──────────────────────────────────────────────
const TB_TITLE = "Travel Budget Guide · Daily Costs for Top Destinations";
const TB_DESCRIPTION =
  "Plan your trip budget with daily cost estimates for 12 destinations — Tokyo, Paris, Bangkok, Dubai, and more. See accommodation, food, transport, and activity breakdowns per city.";

export const metadata: Metadata = {
  title: TB_TITLE,
  description: TB_DESCRIPTION,
  alternates: { canonical: "/travel-budget" },
  openGraph: {
    title: TB_TITLE,
    description: TB_DESCRIPTION,
    type: "website",
    url: "https://www.utripla.xyz/travel-budget",
  },
  twitter: {
    card: "summary",
    title: TB_TITLE,
    description: TB_DESCRIPTION,
  },
};

// ── JSON-LD（Phase 7.3）────────────────────────────────────────────────

function buildCollectionPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TB_TITLE,
    description: TB_DESCRIPTION,
    url: "https://www.utripla.xyz/travel-budget",
  };
}

function buildItemListJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "UTripla Travel Budget Guides",
    numberOfItems: DESTINATIONS.length,
    itemListElement: DESTINATIONS.map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://www.utripla.xyz/travel-budget/${d.slug}`,
      name: `Travel budget for ${d.city}`,
    })),
  };
}

function buildBreadcrumbJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.utripla.xyz/" },
      {
        "@type": "ListItem",
        position: 2,
        name: "Travel Budget",
        item: "https://www.utripla.xyz/travel-budget",
      },
    ],
  };
}

// ── Page ──────────────────────────────────────────────────────────────

export default function TravelBudgetHubPage() {
  return (
    <div className="min-h-screen bg-white pt-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildCollectionPageJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildItemListJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd()) }}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Travel Budget Guide — Daily Costs by Destination
          </h1>
          <p className="mt-3 max-w-2xl text-base text-gray-500 sm:text-lg">
            Estimate your trip budget with daily cost breakdowns for {DESTINATIONS.length} top
            destinations worldwide. Each guide covers accommodation, food, transport, and activities.
          </p>
        </header>

        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Travel Budget</span>
        </nav>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DESTINATIONS.map((d) => {
            const total = d.budgetPerDay * d.recommendedDays;
            return (
              <Link
                key={d.slug}
                href={`/travel-budget/${d.slug}`}
                className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700">
                      {d.city}
                    </h2>
                    <p className="mt-0.5 text-sm text-gray-500">{d.country}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-extrabold text-emerald-700">
                      {d.budgetPerDay.toLocaleString()}
                    </div>
                    <div className="text-xs font-semibold text-gray-500">
                      {d.budgetCurrency}/day
                    </div>
                  </div>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-xs text-gray-500">Recommended days</dt>
                    <dd className="font-semibold text-gray-900">{d.recommendedDays} days</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Estimated total</dt>
                    <dd className="font-semibold text-gray-900">
                      {total.toLocaleString()} {d.budgetCurrency}
                    </dd>
                  </div>
                </dl>
                <div className="mt-auto pt-4 text-sm font-semibold text-emerald-700 group-hover:underline">
                  View full budget guide →
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { DESTINATIONS } from "@/data/destinations";

// ── Metadata（Phase 7.2）──────────────────────────────────────────────
const BT_TITLE = "Best Time To Visit · Worldwide Travel Weather Guide";
const BT_DESCRIPTION =
  "Find the best time to visit 12 top destinations — Tokyo, Paris, Bangkok, Sydney, and more. Monthly climate patterns, peak season tips, and weather recommendations for each city.";

export const metadata: Metadata = {
  title: BT_TITLE,
  description: BT_DESCRIPTION,
  alternates: { canonical: "/best-time-to-visit" },
  openGraph: {
    title: BT_TITLE,
    description: BT_DESCRIPTION,
    type: "website",
    url: "https://www.utripla.xyz/best-time-to-visit",
  },
  twitter: {
    card: "summary",
    title: BT_TITLE,
    description: BT_DESCRIPTION,
  },
};

// ── JSON-LD（Phase 7.3）────────────────────────────────────────────────

function buildCollectionPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: BT_TITLE,
    description: BT_DESCRIPTION,
    url: "https://www.utripla.xyz/best-time-to-visit",
  };
}

function buildItemListJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Best Time To Visit — Destination Weather Guides",
    numberOfItems: DESTINATIONS.length,
    itemListElement: DESTINATIONS.map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://www.utripla.xyz/best-time-to-visit/${d.slug}`,
      name: `Best time to visit ${d.city}`,
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
        name: "Best Time To Visit",
        item: "https://www.utripla.xyz/best-time-to-visit",
      },
    ],
  };
}

// ── Page ──────────────────────────────────────────────────────────────

export default function BestTimeToVisitHubPage() {
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
            Best Time To Visit — Worldwide Guide
          </h1>
          <p className="mt-3 max-w-2xl text-base text-gray-500 sm:text-lg">
            Discover the optimal months to visit {DESTINATIONS.length} top travel
            destinations. Each guide includes monthly climate patterns, peak
            season tips, and weather-based recommendations.
          </p>
        </header>

        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Best Time To Visit</span>
        </nav>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DESTINATIONS.map((d) => (
            <Link
              key={d.slug}
              href={`/best-time-to-visit/${d.slug}`}
              className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-700">
                    {d.city}
                  </h2>
                  <p className="mt-0.5 text-sm text-gray-500">{d.country}</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  {d.bestMonths}
                </span>
              </div>
              <p className="mt-3 line-clamp-3 text-sm text-gray-600">
                {d.bestSeason}
              </p>
              <div className="mt-auto pt-4 text-sm font-semibold text-blue-700 group-hover:underline">
                View monthly guide →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

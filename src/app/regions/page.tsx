import type { Metadata } from "next";
import Link from "next/link";
import { DESTINATIONS, type Region } from "@/data/destinations";

// ── Metadata (Step 2) ─────────────────────────────────────────────────

const RG_TITLE = "Travel Regions Guide | Explore Destinations Worldwide";
const RG_DESCRIPTION =
  "Browse travel destinations by region — Asia, Europe, the Americas, and Oceania. Each region guide covers top cities, best season, daily budget, and ready-to-use trip templates.";

export const metadata: Metadata = {
  title: RG_TITLE,
  description: RG_DESCRIPTION,
  alternates: { canonical: "/regions" },
  openGraph: {
    title: RG_TITLE,
    description: RG_DESCRIPTION,
    type: "website",
    url: "https://www.utripla.xyz/regions",
  },
  twitter: {
    card: "summary",
    title: RG_TITLE,
    description: RG_DESCRIPTION,
  },
};

// ── Helpers ────────────────────────────────────────────────────────────

const ALL_REGIONS: Region[] = ["Asia", "Europe", "Americas", "Oceania"];

function regionOverview(region: Region, destCount: number): string {
  const countries = Array.from(
    new Set(
      DESTINATIONS.filter((d) => d.region === region).map((d) => d.country),
    ),
  );
  return `${region} covers ${destCount} destinations across ${countries.length} ${countries.length === 1 ? "country" : "countries"}: ${countries.join(", ")}. Use these guides to plan trips by season, budget, and travel style.`;
}

function regionLabel(region: Region): string {
  if (region === "Americas") return "the Americas";
  return region;
}

// ── JSON-LD (Step 2) ──────────────────────────────────────────────────

function buildCollectionPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: RG_TITLE,
    description: RG_DESCRIPTION,
    url: "https://www.utripla.xyz/regions",
  };
}

function buildItemListJsonLd() {
  const usedRegions = ALL_REGIONS.filter((r) =>
    DESTINATIONS.some((d) => d.region === r),
  );
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "UTripla Travel Regions",
    numberOfItems: usedRegions.length,
    itemListElement: usedRegions.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://www.utripla.xyz/regions/${r.toLowerCase()}`,
      name: `${r} Travel Guide`,
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
        name: "Regions",
        item: "https://www.utripla.xyz/regions",
      },
    ],
  };
}

// ── Page ──────────────────────────────────────────────────────────────

export default function RegionsHubPage() {
  const usedRegions = ALL_REGIONS.filter((r) =>
    DESTINATIONS.some((d) => d.region === r),
  );

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
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Regions</span>
        </nav>

        {/* Hero */}
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Travel Regions Guide
          </h1>
          <p className="mt-3 max-w-2xl text-base text-gray-500 sm:text-lg">
            Explore travel destinations by region. UTripla covers{" "}
            {DESTINATIONS.length} cities across {usedRegions.length} regions
            worldwide — each with best season, daily budget, recommended days,
            and ready-to-use trip templates.
          </p>
        </header>

        {/* Region overview */}
        <section className="mb-10">
          <h2 className="mb-3 text-2xl font-bold text-gray-900">
            Browse by region
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Pick a region to see all destinations, related trips, and seasonal
            recommendations. Each region page aggregates real destination data —
            no placeholders, only cities covered by tripla&apos;s travel guides.
          </p>
        </section>

        {/* Region cards */}
        <section className="mb-16">
          <div className="grid gap-6 sm:grid-cols-2">
            {usedRegions.map((r) => {
              const destCount = DESTINATIONS.filter((d) => d.region === r).length;
              return (
                <Link
                  key={r}
                  href={`/regions/${r.toLowerCase()}`}
                  className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700">
                      {r}
                    </h3>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                      {destCount} {destCount === 1 ? "destination" : "destinations"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-gray-600">
                    {regionOverview(r, destCount)}
                  </p>
                  <div className="mt-auto pt-4 text-sm font-semibold text-blue-700 group-hover:underline">
                    Explore {regionLabel(r)} →
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Cross-link to Destinations hub */}
        <section className="mb-16 rounded-2xl border border-gray-100 p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Browse all destinations
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            See every city covered by tripla — filter by region, weather, and budget.
          </p>
          <Link
            href="/destinations"
            className="mt-3 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-5 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
          >
            View all destinations →
          </Link>
        </section>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { TRAVEL_STYLES } from "@/data/travel-styles";
import { TRIPS } from "@/data/trips";

// ── Metadata (Step 1) ─────────────────────────────────────────────────

const TS_TITLE = "Travel Styles Guide | Find Your Perfect Trip Experience";
const TS_DESCRIPTION =
  "Explore foodie, cultural, active, adventure, and relaxed travel styles. Find curated trip templates matched to how you love to travel — from street food crawls to mountain treks.";

export const metadata: Metadata = {
  title: TS_TITLE,
  description: TS_DESCRIPTION,
  alternates: { canonical: "/travel-styles" },
  openGraph: {
    title: TS_TITLE,
    description: TS_DESCRIPTION,
    type: "website",
    url: "https://www.utripla.xyz/travel-styles",
  },
  twitter: {
    card: "summary",
    title: TS_TITLE,
    description: TS_DESCRIPTION,
  },
};

// ── JSON-LD (Step 1) ──────────────────────────────────────────────────

function buildCollectionPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TS_TITLE,
    description: TS_DESCRIPTION,
    url: "https://www.utripla.xyz/travel-styles",
  };
}

function buildItemListJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "UTripla Travel Styles",
    numberOfItems: TRAVEL_STYLES.length,
    itemListElement: TRAVEL_STYLES.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://www.utripla.xyz/travel-styles/${s.slug}`,
      name: `${s.label} Travel Trips`,
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
        name: "Travel Styles",
        item: "https://www.utripla.xyz/travel-styles",
      },
    ],
  };
}

// ── Page ──────────────────────────────────────────────────────────────

export default function TravelStylesHubPage() {
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
          <span className="text-gray-900">Travel Styles</span>
        </nav>

        {/* Hero */}
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Travel Styles Guide
          </h1>
          <p className="mt-3 max-w-2xl text-base text-gray-500 sm:text-lg">
            Find your perfect trip experience. UTripla curates trip templates
            across {TRAVEL_STYLES.length} distinct travel styles — from foodie
            adventures to cultural deep dives — so you can plan a trip that
            matches how you love to travel.
          </p>
        </header>

        {/* Travel style overview */}
        <section className="mb-10">
          <h2 className="mb-3 text-2xl font-bold text-gray-900">
            What is a travel style?
          </h2>
          <p className="text-gray-700 leading-relaxed">
            A travel style describes the overall pace and focus of a trip.
            Choosing a style helps tripla AI craft itineraries that match your
            interests — whether that means eating your way through a city,
            trekking volcanic trails, or simply slowing down. Browse the{" "}
            {TRAVEL_STYLES.length} styles below to find trips curated for each
            approach.
          </p>
        </section>

        {/* 5 个 style 卡片 */}
        <section className="mb-16">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            Browse by travel style
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TRAVEL_STYLES.map((s) => {
              const tripCount = TRIPS.filter((t) => t.travelStyle === s.slug).length;
              return (
                <Link
                  key={s.slug}
                  href={`/travel-styles/${s.slug}`}
                  className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700">
                    {s.label} Travel
                  </h3>
                  <p className="mt-2 line-clamp-4 text-sm text-gray-600">
                    {s.overview}
                  </p>
                  <div className="mt-auto pt-4 text-sm text-gray-500">
                    {tripCount} {tripCount === 1 ? "trip" : "trips"} available
                  </div>
                  <div className="mt-1 text-sm font-semibold text-blue-700 group-hover:underline">
                    Explore {s.label.toLowerCase()} trips →
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Cross-link to Trips hub */}
        <section className="mb-16 rounded-2xl border border-gray-100 p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Looking for all trip templates?
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Browse all {TRIPS.length} ready-to-use itineraries across every style.
          </p>
          <Link
            href="/trips"
            className="mt-3 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-5 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
          >
            View all trips →
          </Link>
        </section>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import TripsHubClient from "./TripsHubClient";
import { TRIPS } from "@/data/trips";

// ── Metadata（Phase 7.2）──────────────────────────────────────────────
// title 目标 50-60 chars（含 " | tripla"），description 目标 140-160 chars。
const TRIPS_TITLE = "Travel Itinerary Templates · Ready-to-Use Trip Plans";
const TRIPS_DESCRIPTION =
  "Browse ready-to-use travel itinerary templates for Tokyo, Paris, New York, and more. Each plan includes day-by-day activities, budget estimates, and travel tips.";

export const metadata: Metadata = {
  title: TRIPS_TITLE,
  description: TRIPS_DESCRIPTION,
  alternates: { canonical: "/trips" },
  openGraph: {
    title: TRIPS_TITLE,
    description: TRIPS_DESCRIPTION,
    type: "website",
    url: "https://www.utripla.xyz/trips",
  },
  twitter: {
    card: "summary",
    title: TRIPS_TITLE,
    description: TRIPS_DESCRIPTION,
  },
};

// ── JSON-LD（Phase 7.3）────────────────────────────────────────────────

function buildCollectionPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TRIPS_TITLE,
    description: TRIPS_DESCRIPTION,
    url: "https://www.utripla.xyz/trips",
  };
}

function buildItemListJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "UTripla Trip Templates",
    numberOfItems: TRIPS.length,
    itemListElement: TRIPS.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://www.utripla.xyz/trips/${t.slug}`,
      name: t.title,
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
        name: "Trips",
        item: "https://www.utripla.xyz/trips",
      },
    ],
  };
}

// ── Page ──────────────────────────────────────────────────────────────

export default function TripsPage() {
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
        {/* ── Hero ───────────────────────────────────────────────────── */}
        <header>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Travel Itinerary Templates
          </h1>
          <p className="mt-3 max-w-2xl text-base text-gray-500 sm:text-lg">
            UTripla provides ready-to-execute travel plan templates —
            each curated with day-by-day activities, budget estimates, and travel
            tips. Pick a template, customize it, and go.
          </p>
        </header>

        {/* ── Client grid (filter + cards + modal) ──────────────────── */}
        <TripsHubClient />
      </div>
    </div>
  );
}

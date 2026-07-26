import type { Metadata } from "next";
import DestinationsClient from "./DestinationsClient";
import { DESTINATIONS } from "@/data/destinations";

// ── Metadata（Phase 7.2）──────────────────────────────────────────────
const DEST_TITLE = "Travel Destinations Guide · Explore Top Cities Worldwide";
const DEST_DESCRIPTION =
  "Explore curated travel destinations worldwide — Tokyo, Paris, New York, Bangkok, and more. Each guide covers best season, budget, recommended days, and top highlights.";

export const metadata: Metadata = {
  title: DEST_TITLE,
  description: DEST_DESCRIPTION,
  alternates: { canonical: "/destinations" },
  openGraph: {
    title: DEST_TITLE,
    description: DEST_DESCRIPTION,
    type: "website",
    url: "https://www.utripla.xyz/destinations",
  },
  twitter: {
    card: "summary",
    title: DEST_TITLE,
    description: DEST_DESCRIPTION,
  },
};

// ── JSON-LD（Phase 7.3）────────────────────────────────────────────────

function buildCollectionPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: DEST_TITLE,
    description: DEST_DESCRIPTION,
    url: "https://www.utripla.xyz/destinations",
  };
}

function buildItemListJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "UTripla Travel Destinations",
    numberOfItems: DESTINATIONS.length,
    itemListElement: DESTINATIONS.map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://www.utripla.xyz/destinations/${d.slug}`,
      name: `${d.city}, ${d.country}`,
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
        name: "Destinations",
        item: "https://www.utripla.xyz/destinations",
      },
    ],
  };
}

// ── Page ──────────────────────────────────────────────────────────────

export default function DestinationsPage() {
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
      <DestinationsClient />
    </div>
  );
}

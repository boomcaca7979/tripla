import type { Metadata } from "next";
import WorldAtlas, { type AtlasNode } from "@/components/atlas/WorldAtlas";
import { DESTINATIONS } from "@/data/destinations";
import { getClimateRecord } from "@/data/climate/nasa-canonical";
import {
  monthNormals,
  nodeEmphasisFor,
  projectWorldPoint,
  vibesForInterests,
} from "@/lib/inner-state";

// ── Metadata（保留既有 SEO 结构；文案对齐 World Atlas 定位） ────────────────
const DEST_TITLE = "UTRIPLA World Atlas · Explore 145 destinations by month";
const DEST_DESCRIPTION =
  "Drag through twelve months and watch the world rearrange itself — every UTRIPLA destination ranked for that month by NASA POWER climate data. Tap a destination to preview it.";

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

// ── JSON-LD（CollectionPage / ItemList / BreadcrumbList 全部保留） ─────────

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

// ── Page：145 节点 server 装配（canonical 权威 + 真实坐标投影） ─────────────

export default function DestinationsAtlasPage() {
  const nodes: AtlasNode[] = DESTINATIONS.map((d) => {
    const record = getClimateRecord(d.slug);
    const proj = projectWorldPoint(d.airport.latitude, d.airport.longitude);
    const normals = monthNormals(record);
    return {
      slug: d.slug,
      city: d.city,
      country: d.country,
      region: d.region,
      x: proj.x,
      y: proj.y,
      hero: d.image,
      vibes: vibesForInterests(d.interests as string[]),
      tiers: record.months.map((m) => nodeEmphasisFor(m.tier)),
      months: normals.map((n) => ({
        h: n.tempHighC,
        l: n.tempLowC,
        p: n.precipMm,
        rd: n.precipDaysGe1mm,
      })),
      budget: `${d.budgetPerDay.toLocaleString()} ${d.budgetCurrency}`,
    };
  });

  return (
    <>
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
      <WorldAtlas nodes={nodes} />
    </>
  );
}

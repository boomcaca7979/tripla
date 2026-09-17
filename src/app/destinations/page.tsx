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
import { canonicalWindowLabel } from "@/components/besttime/besttime-state";
import { FEATURED_DESTINATIONS } from "@/data/featured-destinations";

// ── Metadata（保留既有 SEO 结构；文案随 destination 数量动态） ───────────────
const DESTINATIONS_COUNT = DESTINATIONS.length;
const DEST_TITLE = `UTRIPLA World Atlas · Explore ${DESTINATIONS_COUNT} destinations on a night globe`;
const DEST_DESCRIPTION =
  `A glowing night earth with ${DESTINATIONS_COUNT} destinations. Drag to spin the globe, hover a city for its best months and typical budget, then open its full travel guide. Every month is ranked from NASA POWER climate data.`;

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
      // 真实坐标（3D 地球使用；与 2D 投影同源，均为 airport 经纬度）
      lat: d.airport.latitude,
      lon: d.airport.longitude,
      hero: d.image,
      vibes: vibesForInterests(d.interests as string[]),
      tiers: record.months.map((m) => nodeEmphasisFor(m.tier)),
      months: normals.map((n) => ({
        h: n.tempHighC,
        l: n.tempLowC,
        p: n.precipMm,
        rd: n.precipDaysGe1mm,
      })),
      // 显式 en-US：不依赖浏览器 locale（否则 zh 环境可能出现中文数字/单位）
      budget: `${d.budgetPerDay.toLocaleString("en-US")} ${d.budgetCurrency}/day`,
      bestTime: canonicalWindowLabel(record.bestMonthsBaseline),
      // 重要目的地（站点精选，见 src/data/featured-destinations.ts）：节点更大一级 +
      // 地球上的常驻城市标签。未入选的目的地不删除，只是视觉层级低一级。
      major: FEATURED_DESTINATIONS.has(d.slug),
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

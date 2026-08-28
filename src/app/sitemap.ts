import type { MetadataRoute } from "next";
import { TRIPS } from "@/data/trips";
import { DESTINATIONS, type Region } from "@/data/destinations";
import { TRAVEL_STYLES } from "@/data/travel-styles";
import { GUIDES } from "@/data/guides";
import { AI_PAGES } from "@/data/ai-pages";

const SITE_URL = "https://www.utripla.xyz";

export function generateSitemapEntries(): MetadataRoute.Sitemap {
  // Phase 7.4/9 Step 7: 6 个 Hub 页面 priority 0.8
  const hubRoutes = [
    { path: "/trips", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/destinations", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/best-time-to-visit", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/travel-budget", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/travel-styles", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/regions", priority: 0.8, changeFrequency: "weekly" as const },
  ];

  // 其他静态页面
  const staticRoutes = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/guides", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/pricing", priority: 0.8, changeFrequency: "monthly" as const },
  ];

  const hubEntries: MetadataRoute.Sitemap = hubRoutes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Phase 8.6: Travel Style landing 页 priority 0.7
  const travelStyleEntries: MetadataRoute.Sitemap = TRAVEL_STYLES.map((s) => ({
    url: `${SITE_URL}/travel-styles/${s.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Phase 8.6: Region landing 页 priority 0.7
  // 仅生成真实存在 destination 的 region
  const ALL_REGIONS: Region[] = ["Asia", "Europe", "Americas", "Oceania"];
  const usedRegions = new Set(DESTINATIONS.map((d) => d.region));
  const regionEntries: MetadataRoute.Sitemap = ALL_REGIONS.filter((r) =>
    usedRegions.has(r),
  ).map((r) => ({
    url: `${SITE_URL}/regions/${r.toLowerCase()}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // 详情页 priority 0.6-0.7
  const tripEntries: MetadataRoute.Sitemap = TRIPS.map((t) => ({
    url: `${SITE_URL}/trips/${t.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const destinationEntries: MetadataRoute.Sitemap = DESTINATIONS.map((d) => ({
    url: `${SITE_URL}/destinations/${d.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const bestTimeEntries: MetadataRoute.Sitemap = DESTINATIONS.map((d) => ({
    url: `${SITE_URL}/best-time-to-visit/${d.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const travelBudgetEntries: MetadataRoute.Sitemap = DESTINATIONS.map((d) => ({
    url: `${SITE_URL}/travel-budget/${d.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Guide 详情页（SEO 内容页）priority 0.7，随 updatedAt 声明 lastModified。
  const guideEntries: MetadataRoute.Sitemap = GUIDES.map((g) => ({
    url: `${SITE_URL}/guides/${g.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
    lastModified: new Date(g.updatedAt),
  }));

  // Phase 2: AI Travel SEO 落地页 priority 0.8，随 updatedAt 声明 lastModified。
  const aiPageEntries: MetadataRoute.Sitemap = AI_PAGES.map((p) => ({
    url: `${SITE_URL}/${p.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
    lastModified: new Date(p.updatedAt),
  }));

  return [
    ...staticEntries,
    ...hubEntries,
    ...travelStyleEntries,
    ...regionEntries,
    ...tripEntries,
    ...destinationEntries,
    ...bestTimeEntries,
    ...travelBudgetEntries,
    ...guideEntries,
    ...aiPageEntries,
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  return generateSitemapEntries();
}

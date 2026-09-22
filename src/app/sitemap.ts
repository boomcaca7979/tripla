import type { MetadataRoute } from "next";
import { TRIPS } from "@/data/trips";
import { DESTINATIONS } from "@/data/destinations";
import { TRAVEL_STYLES } from "@/data/travel-styles";
import { GUIDES } from "@/data/guides";
import { AI_PAGES } from "@/data/ai-pages";

const SITE_URL = "https://www.utripla.xyz";

export function generateSitemapEntries(): MetadataRoute.Sitemap {
  // Hub 页面 priority 0.8
  // 已移除 Regions 与 Best Time to Visit 两个栏目入口（不再作为公开导航/收录目标），
  // 其旧 URL 由 next.config.ts 的 301 兜底，避免已收录地址 404。
  // /trips 也已移出：它现在是登录后的个人工作台（匿名抓取者只看到空壳），
  // 已改为 noindex；其下的预制 Trip 详情页 /trips/<slug> 仍是内容页，继续收录。
  const hubRoutes = [
    { path: "/destinations", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/travel-budget", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/travel-styles", priority: 0.8, changeFrequency: "weekly" as const },
  ];

  // 其他静态页面
  const staticRoutes = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/guides", priority: 0.7, changeFrequency: "monthly" as const },
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
    ...tripEntries,
    ...destinationEntries,
    ...travelBudgetEntries,
    ...guideEntries,
    ...aiPageEntries,
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  return generateSitemapEntries();
}

/**
 * guides-hub — /guides Discovery Hub 的**派生数据层**。
 *
 * 原则：
 *   · 一切维度都从 `GUIDES` + `DESTINATIONS` 现有真实数据**派生**，不复制内容、
 *     不假造分类 / featured / 统计；
 *   · `FEATURED_GUIDE_SLUGS` 是唯一的显式人工选择（独立常量，不改 310 篇数据）；
 *   · Region 经 guide.city → destination.city 精确同名匹配派生；匹配不到归入
 *     "Global & other"（如 Global / Europe / Germany 这类国家级 / 洲级 guide）；
 *   · Travel style 用受控词表映射 tags（只在真实命中时展示分类）；
 *   · Season 由 tags 关键词 + event departureDate 月份派生，映射不可靠时返回 null；
 *   · Trip length 由 `itinerary.days` 真实天数分桶（1–3 / 4–7 / 8+）。
 *
 * 纯函数 + 模块级缓存，Server Component 安全。
 */

import { DESTINATIONS } from "@/data/destinations";
import { GUIDES, type Guide } from "@/data/guides";

export interface GuideHubCard {
  slug: string;
  title: string;
  city: string;
  country: string;
  excerpt: string;
  readTime: string;
  updatedAt: string;
  tags: string[];
  /** itinerary 的真实天数（天数骨架数量） */
  days: number;
  season: SeasonKey | null;
  styles: string[];
  /** 经 destination 派生的 region；未匹配为 "Global & other" */
  region: string;
  /** guide.city 对应 destination 的真实图片（可能为 null → gradient fallback） */
  image: string | null;
  gradient: string;
  /** event guide（planner 带 departureDate） */
  event: boolean;
}

export type SeasonKey = "Spring" | "Summer" | "Autumn" | "Winter";
export type DaysBucket = "1-3" | "4-7" | "8+";

export const DAYS_BUCKETS: ReadonlyArray<{ key: DaysBucket; label: string; min: number; max: number }> = [
  { key: "1-3", label: "1–3 days", min: 1, max: 3 },
  { key: "4-7", label: "4–7 days", min: 4, max: 7 },
  { key: "8+", label: "8+ days", min: 8, max: 999 },
];

/**
 * Featured：明确的人工选择（真实存在的 slug，覆盖不同城市 / 内容类型）。
 * 维护方式：直接编辑这个数组 —— 不根据数量 / 日期 / slug 排序伪装。
 */
export const FEATURED_GUIDE_SLUGS = [
  "best-time-to-visit-tokyo",
  "paris-4-day-itinerary",
  "f1-monza-2026-travel-guide",
  "kyoto-autumn-travel-2026",
] as const;

/** 受控 Travel style 词表 → tags 关键词映射（只展示真实命中的分类）。 */
const STYLE_TAXONOMY: ReadonlyArray<{ key: string; label: string; tags: readonly string[] }> = [
  { key: "food", label: "Food & Drink", tags: ["food", "foodie", "street food", "restaurants", "cuisine", "sushi", "dining", "coffee"] },
  { key: "culture", label: "Culture & History", tags: ["culture", "history", "temples", "museums", "art", "heritage", "architecture", "shrine"] },
  { key: "itineraries", label: "Itineraries", tags: ["itinerary", "3 days", "2 days", "4 days", "5 days", "7 days", "day trip", "10 days"] },
  { key: "city-break", label: "City Breaks", tags: ["city break", "weekend", "city guide", "48 hours"] },
  { key: "nature", label: "Nature & Outdoors", tags: ["nature", "hiking", "autumn foliage", "fall foliage", "aurora", "beaches", "islands", "outdoors", "parks", "diving"] },
  { key: "events", label: "Nightlife & Events", tags: ["nightlife", "events", "f1", "festival", "festivals", "concerts", "formula 1", "grand prix"] },
  { key: "solo", label: "Solo Travel", tags: ["solo travel", "solo", "safety"] },
  { key: "budget", label: "Budget", tags: ["budget", "cheap", "affordable", "money", "cost"] },
  { key: "planning", label: "Trip Planning", tags: ["trip planning", "travel guide", "planning", "tips", "visa"] },
];

const SEASON_TAGS: ReadonlyArray<{ season: SeasonKey; tags: readonly string[] }> = [
  { season: "Winter", tags: ["winter travel", "christmas markets", "ski", "aurora", "snow", "december travel", "january travel", "february travel", "new year"] },
  { season: "Autumn", tags: ["autumn foliage", "fall foliage", "october travel", "november travel", "autumn", "september travel"] },
  { season: "Spring", tags: ["spring travel", "cherry blossom", "spring", "april travel", "march travel", "may travel"] },
  { season: "Summer", tags: ["summer travel", "summer", "beaches", "july travel", "august travel", "june travel"] },
];

// ── city → destination 索引（真实数据派生，不复制） ──────────────────────

const destinationByCity = new Map(DESTINATIONS.map((d) => [d.city.toLowerCase(), d]));

/** guide.city → destination 真实图片（无对应 destination / 无图返回 null）。 */
export function destinationImageForCity(city: string): string | null {
  return destinationByCity.get(city.toLowerCase())?.image ?? null;
}

/** guide.city → destination region；未匹配返回 "Global & other"。 */
export function regionForCity(city: string): string {
  return destinationByCity.get(city.toLowerCase())?.region ?? "Global & other";
}

// ── 派生逻辑 ─────────────────────────────────────────────────────────────

function itineraryDays(guide: Guide): number {
  return guide.itinerary.days.length;
}

function seasonForGuide(guide: Guide): SeasonKey | null {
  if (guide.planner.departureDate) {
    const month = Number(guide.planner.departureDate.slice(5, 7));
    if (month >= 3 && month <= 5) return "Spring";
    if (month >= 6 && month <= 8) return "Summer";
    if (month >= 9 && month <= 11) return "Autumn";
    if (month === 12 || month <= 2) return "Winter";
  }
  const tags = guide.tags.map((t) => t.toLowerCase());
  for (const { season, tags: keywords } of SEASON_TAGS) {
    if (tags.some((t) => keywords.some((k) => t.includes(k)))) return season;
  }
  return null;
}

function stylesForGuide(guide: Guide): string[] {
  const tags = guide.tags.map((t) => t.toLowerCase());
  return STYLE_TAXONOMY.filter(({ tags: keywords }) =>
    tags.some((t) => keywords.some((k) => t.includes(k))),
  ).map(({ key }) => key);
}

function toHubCard(guide: Guide): GuideHubCard {
  return {
    slug: guide.slug,
    title: guide.title,
    city: guide.city,
    country: guide.country,
    excerpt: guide.excerpt,
    readTime: guide.readTime,
    updatedAt: guide.updatedAt,
    tags: guide.tags,
    days: itineraryDays(guide),
    season: seasonForGuide(guide),
    styles: stylesForGuide(guide),
    region: regionForCity(guide.city),
    image: destinationImageForCity(guide.city),
    gradient: guide.gradient,
    event: Boolean(guide.planner.departureDate),
  };
}

function daysBucketOf(days: number): DaysBucket {
  const bucket = DAYS_BUCKETS.find((b) => days >= b.min && days <= b.max);
  return bucket?.key ?? "8+";
}

// ── Hub 构建（模块级缓存一次） ───────────────────────────────────────────

export interface HubCity {
  city: string;
  count: number;
  image: string | null;
  gradient: string;
  region: string;
  /**
   * 该 city 是否在 `destinations.ts` 中有精确同名 destination。
   * "Explore by destination" 只展示 `destination === true` 的城市；
   * Global / Europe 这类洲级 guide city 为 false（guide 本身不会被删除，
   * 仍可在 Featured / Region / Season / Duration / Browse all / Search 中找到）。
   */
  destination: boolean;
}

export interface HubRegion {
  region: string;
  count: number;
}

export interface HubStyle {
  key: string;
  label: string;
  count: number;
}

export interface HubSeason {
  season: SeasonKey;
  count: number;
}

export interface GuideHub {
  cards: GuideHubCard[];
  featured: GuideHubCard[];
  cities: HubCity[];
  regions: HubRegion[];
  styles: HubStyle[];
  seasons: HubSeason[];
  daysBuckets: Array<{ key: DaysBucket; label: string; count: number }>;
}

const hub: GuideHub = (() => {
  const cards = GUIDES.map(toHubCard);
  const bySlug = new Map(cards.map((c) => [c.slug, c]));
  const featured = FEATURED_GUIDE_SLUGS.map((s) => bySlug.get(s)).filter(
    (c): c is GuideHubCard => Boolean(c),
  );

  const cityCounts = new Map<string, { count: number; gradient: string }>();
  for (const c of cards) {
    const entry = cityCounts.get(c.city) ?? { count: 0, gradient: c.gradient };
    entry.count += 1;
    cityCounts.set(c.city, entry);
  }
  const cities: HubCity[] = [...cityCounts.entries()]
    .map(([city, { count, gradient }]) => ({
      city,
      count,
      image: destinationImageForCity(city),
      gradient,
      region: regionForCity(city),
      destination: destinationByCity.has(city.toLowerCase()),
    }))
    .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));

  const regionCounts = new Map<string, number>();
  for (const c of cards) regionCounts.set(c.region, (regionCounts.get(c.region) ?? 0) + 1);
  const regions: HubRegion[] = [...regionCounts.entries()]
    .map(([region, count]) => ({ region, count }))
    .sort((a, b) => b.count - a.count || a.region.localeCompare(b.region));

  const styles: HubStyle[] = STYLE_TAXONOMY.map(({ key, label }) => ({
    key,
    label,
    count: cards.filter((c) => c.styles.includes(key)).length,
  }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count);

  const seasons: HubSeason[] = (["Spring", "Summer", "Autumn", "Winter"] as SeasonKey[])
    .map((season) => ({ season, count: cards.filter((c) => c.season === season).length }))
    .filter((s) => s.count > 0);

  const daysBuckets = DAYS_BUCKETS.map((b) => ({
    key: b.key,
    label: b.label,
    count: cards.filter((c) => daysBucketOf(c.days) === b.key).length,
  })).filter((b) => b.count > 0);

  return { cards, featured, cities, regions, styles, seasons, daysBuckets };
})();

export function getGuideHub(): GuideHub {
  return hub;
}

export { daysBucketOf };

/** 供搜索使用的轻量 stub 列表。 */
export function getGuideSearchDocs(): Array<{
  slug: string;
  title: string;
  city: string;
  country: string;
  tags: string[];
}> {
  return GUIDES.map((g) => ({
    slug: g.slug,
    title: g.title,
    city: g.city,
    country: g.country,
    tags: g.tags,
  }));
}

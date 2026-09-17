/**
 * trips-hub — /trips Discovery Hub 的**派生数据层**。
 *
 * 原则（与 guides-hub 一致）：
 *   · 一切维度从 `TRIPS` + `DESTINATIONS` 现有真实数据**派生**，不复制内容、
 *     不假造分类 / featured / 统计；
 *   · `FEATURED_TRIP_SLUGS` 是唯一的显式人工选择（独立常量，不改 280 条数据），
 *     覆盖不同城市 / 天数桶 / travel style；
 *   · Region 经 trip.city → destination.city 精确同名匹配派生（100% 命中）；
 *   · Duration 由 `trip.days` 真实天数分桶（1–3 / 4–7 / 8+）；
 *   · Travel style / interest 直接使用 `trip.travelStyle` / `trip.interests` 受控枚举；
 *   · 图片：`trip.coverImage` → `destination.image` → gradient（不下载新图片）。
 *
 * 本轮**不做** Season / Event / Route discovery —— 数据中不存在结构化
 * season / event / route 字段，硬做只能产出假分类。
 *
 * 纯函数 + 模块级缓存，Server Component 安全。
 */

import { DESTINATIONS } from "@/data/destinations";
import { TRIPS, type Trip } from "@/data/trips";
import type { TravelInterest, TravelStyle } from "@/types/itinerary";
import { DAYS_BUCKETS, daysBucketOf, destinationImageForCity, regionForCity, type DaysBucket } from "@/lib/guides-hub";

export { DAYS_BUCKETS, daysBucketOf };

export interface TripHubCard {
  slug: string;
  title: string;
  city: string;
  country: string;
  /** 真实天数（trip.days，与 itinerary 长度一致） */
  days: number;
  daysBucket: DaysBucket;
  travelStyle: TravelStyle;
  interests: TravelInterest[];
  tags: string[];
  /** city → destination.region 派生 */
  region: string;
  /** coverImage ?? destination.image（都可能为 null → gradient fallback） */
  image: string | null;
  gradient: string;
  currency: string;
  budget: number;
  /** itinerary 真实天数条目数 */
  dayCount: number;
  activityCount: number;
  airportIata: string;
  /** 匹配到的 destination slug（用于 /destinations/<slug> 内链） */
  destinationSlug: string | null;
  /** 逐日 theme，用于卡片上的 journey progression 摘要 */
  dayThemes: string[];
}

/**
 * Featured：明确的人工选择（真实存在的 slug）。
 * 覆盖：不同城市、不同天数桶（1–3 / 4–7 / 8+）、不同 travel style。
 * 维护方式：直接编辑这个数组 —— 不根据数量 / 顺序 / slug 排序伪装。
 */
export const FEATURED_TRIP_SLUGS = [
  "tokyo-5d-classic",
  "paris-3d-classic",
  "bangkok-food-3d",
  "queenstown-4d-adventure",
  "italy-7d-classics",
  "california-road-trip-10d",
] as const;

/** 受控 travel style → 展示标签（只使用数据中真实存在的 5 个枚举值）。 */
export const TRAVEL_STYLE_LABELS: Record<TravelStyle, string> = {
  foodie: "Foodie",
  cultural: "Cultural",
  active: "Active",
  adventure: "Adventure",
  relaxed: "Relaxed",
};

/** 受控 interest → 展示标签（只使用数据中真实存在的 8 个枚举值）。 */
export const INTEREST_LABELS: Record<TravelInterest, string> = {
  food: "Food",
  history: "History",
  nature: "Nature",
  museums: "Museums",
  beaches: "Beaches",
  shopping: "Shopping",
  nightlife: "Nightlife",
  sports: "Sports",
};

// ── city → destination 索引 ──────────────────────────────────────────────

const destinationByCity = new Map(DESTINATIONS.map((d) => [d.city.toLowerCase(), d]));

/** trip.city → destination slug（未匹配返回 null）。 */
export function destinationSlugForCity(city: string): string | null {
  return destinationByCity.get(city.toLowerCase())?.slug ?? null;
}

// ── 派生 ─────────────────────────────────────────────────────────────────

function toHubCard(trip: Trip): TripHubCard {
  return {
    slug: trip.slug,
    title: trip.title,
    city: trip.city,
    country: trip.country,
    days: trip.days,
    daysBucket: daysBucketOf(trip.days),
    travelStyle: trip.travelStyle,
    interests: trip.interests,
    tags: trip.tags,
    region: regionForCity(trip.city),
    image: trip.coverImage ?? destinationImageForCity(trip.city),
    gradient: trip.gradient,
    currency: trip.currency,
    budget: trip.budget,
    dayCount: trip.itinerary.length,
    activityCount: trip.itinerary.reduce((n, d) => n + d.activities.length, 0),
    airportIata: trip.airport.iata,
    destinationSlug: destinationSlugForCity(trip.city),
    dayThemes: trip.itinerary.map((d) => d.theme),
  };
}

export interface HubTripCity {
  city: string;
  count: number;
  image: string | null;
  gradient: string;
  region: string;
  destinationSlug: string | null;
}

export interface HubTripRegion {
  region: string;
  count: number;
}

export interface HubTripStyle {
  key: TravelStyle;
  label: string;
  count: number;
}

export interface HubTripInterest {
  key: TravelInterest;
  label: string;
  count: number;
}

export interface TripHub {
  cards: TripHubCard[];
  featured: TripHubCard[];
  cities: HubTripCity[];
  regions: HubTripRegion[];
  styles: HubTripStyle[];
  interests: HubTripInterest[];
  daysBuckets: Array<{ key: DaysBucket; label: string; count: number }>;
}

const hub: TripHub = (() => {
  const cards = TRIPS.map(toHubCard);
  const bySlug = new Map(cards.map((c) => [c.slug, c]));
  const featured = FEATURED_TRIP_SLUGS.map((s) => bySlug.get(s)).filter(
    (c): c is TripHubCard => Boolean(c),
  );

  const cityCounts = new Map<string, { count: number; gradient: string }>();
  for (const c of cards) {
    const entry = cityCounts.get(c.city) ?? { count: 0, gradient: c.gradient };
    entry.count += 1;
    cityCounts.set(c.city, entry);
  }
  const cities: HubTripCity[] = [...cityCounts.entries()]
    .map(([city, { count, gradient }]) => ({
      city,
      count,
      image: destinationImageForCity(city),
      gradient,
      region: regionForCity(city),
      destinationSlug: destinationSlugForCity(city),
    }))
    .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));

  const regionCounts = new Map<string, number>();
  for (const c of cards) regionCounts.set(c.region, (regionCounts.get(c.region) ?? 0) + 1);
  const regions: HubTripRegion[] = [...regionCounts.entries()]
    .map(([region, count]) => ({ region, count }))
    .sort((a, b) => b.count - a.count || a.region.localeCompare(b.region));

  const styleCounts = new Map<TravelStyle, number>();
  for (const c of cards) styleCounts.set(c.travelStyle, (styleCounts.get(c.travelStyle) ?? 0) + 1);
  const styles: HubTripStyle[] = (Object.keys(TRAVEL_STYLE_LABELS) as TravelStyle[])
    .map((key) => ({ key, label: TRAVEL_STYLE_LABELS[key], count: styleCounts.get(key) ?? 0 }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count);

  const interestCounts = new Map<TravelInterest, number>();
  for (const c of cards) {
    for (const i of c.interests) interestCounts.set(i, (interestCounts.get(i) ?? 0) + 1);
  }
  const interests: HubTripInterest[] = (Object.keys(INTEREST_LABELS) as TravelInterest[])
    .map((key) => ({ key, label: INTEREST_LABELS[key], count: interestCounts.get(key) ?? 0 }))
    .filter((i) => i.count > 0)
    .sort((a, b) => b.count - a.count);

  const daysBuckets = DAYS_BUCKETS.map((b) => ({
    key: b.key,
    label: b.label,
    count: cards.filter((c) => c.daysBucket === b.key).length,
  })).filter((b) => b.count > 0);

  return { cards, featured, cities, regions, styles, interests, daysBuckets };
})();

export function getTripHub(): TripHub {
  return hub;
}

// ── 过滤（query 只作浏览过滤；canonical 恒为 /trips）─────────────────────

export interface TripFilters {
  q: string | null;
  city: string | null;
  region: string | null;
  days: string | null;
  style: string | null;
  interest: string | null;
}

export function filterTripCards(cards: readonly TripHubCard[], f: TripFilters): TripHubCard[] {
  return cards.filter((c) => {
    if (f.city && c.city.toLowerCase() !== f.city.toLowerCase()) return false;
    if (f.region && c.region.toLowerCase() !== f.region.toLowerCase()) return false;
    if (f.style && c.travelStyle !== f.style) return false;
    if (f.interest && !c.interests.includes(f.interest as TravelInterest)) return false;
    if (f.days && c.daysBucket !== f.days) return false;
    if (f.q) {
      const hay =
        `${c.title} ${c.city} ${c.country} ${c.travelStyle} ${c.interests.join(" ")} ${c.tags.join(" ")}`.toLowerCase();
      if (!hay.includes(f.q)) return false;
    }
    return true;
  });
}

/** 供搜索使用的轻量 stub 列表（只包含匹配所需字段，不含完整 itinerary）。 */
export function getTripSearchDocs(): Array<{
  slug: string;
  title: string;
  city: string;
  country: string;
  days: number;
  travelStyle: string;
  interests: string[];
  tags: string[];
}> {
  return TRIPS.map((t) => ({
    slug: t.slug,
    title: t.title,
    city: t.city,
    country: t.country,
    days: t.days,
    travelStyle: t.travelStyle,
    interests: t.interests,
    tags: t.tags,
  }));
}

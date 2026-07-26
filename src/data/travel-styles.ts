import type { TravelStyle } from "@/types/itinerary";

/**
 * Phase 8.1: Travel Style 元数据。
 * 仅包含 style 级别的描述（不重复 trip 数据）。
 * trips 通过 TRIPS.filter((t) => t.travelStyle === style) 动态获取。
 */
export interface TravelStyleMeta {
  /** URL slug, 同 TravelStyle 值。 */
  slug: TravelStyle;
  /** 显示名称。 */
  label: string;
  /** "What is {Style} Travel?" 段落简介。 */
  overview: string;
  /** Hub 页面 description（不超过 160 chars）。 */
  metaDescription: string;
}

export const TRAVEL_STYLES: TravelStyleMeta[] = [
  {
    slug: "foodie",
    label: "Foodie",
    overview:
      "Foodie travel focuses on a destination's culinary identity — street food, local markets, family-run eateries, and chef-led tasting menus. These trips prioritize ingredient stories, regional specialties, and hands-on experiences like market walks or cooking classes, alongside classic sights.",
    metaDescription:
      "Browse foodie travel itineraries focused on street food, local markets, and regional cuisine. Day-by-day plans for Tokyo, Bangkok, Osaka, and more culinary destinations.",
  },
  {
    slug: "cultural",
    label: "Cultural",
    overview:
      "Cultural travel centers on history, art, and heritage — museums, temples, palaces, and traditional neighborhoods. These trips balance iconic landmarks with slower-paced exploration of local customs, performing arts, and architecture.",
    metaDescription:
      "Browse cultural travel itineraries covering museums, temples, palaces, and historic neighborhoods. Day-by-day plans for Paris, Rome, London, Istanbul, and more cultural cities.",
  },
  {
    slug: "active",
    label: "Active",
    overview:
      "Active travel emphasizes movement and the outdoors — hiking, cycling, water sports, and city walks. These trips pair physical activity with sightseeing, from coastal trails to sunrise bike rides and harbour kayaking.",
    metaDescription:
      "Browse active travel itineraries with hiking, cycling, water sports, and city walks. Day-by-day plans for New York, Sydney, Dubai, and more active destinations.",
  },
  {
    slug: "adventure",
    label: "Adventure",
    overview:
      "Adventure travel targets thrills and the unfamiliar — desert safaris, volcanic hikes, jungle treks, and road trips. These trips mix high-energy activities with cultural stops and natural landmarks.",
    metaDescription:
      "Browse adventure travel itineraries featuring desert safaris, volcanic hikes, and road trips. Day-by-day plans for adventure-focused destinations worldwide.",
  },
  {
    slug: "relaxed",
    label: "Relaxed",
    overview:
      "Relaxed travel favors a slower pace — beaches, spa days, scenic drives, and unhurried meals. These trips leave room for spontaneity, with fewer fixed activities and more time to enjoy each setting.",
    metaDescription:
      "Browse relaxed travel itineraries with beaches, spa days, and scenic drives. Day-by-day plans for laid-back destinations with a slower, flexible pace.",
  },
];

/** 返回所有 travel style slug。 */
export function getTravelStyleSlugs(): TravelStyle[] {
  return TRAVEL_STYLES.map((s) => s.slug);
}

/** 按 slug 查找 travel style 元数据。 */
export function getTravelStyleBySlug(slug: string): TravelStyleMeta | null {
  return TRAVEL_STYLES.find((s) => s.slug === slug) ?? null;
}

import type { TravelStyle, TravelInterest } from "@/types/itinerary";
import { REFRESHED_GUIDES } from "./guides/refreshed";
import { SEPTEMBER_WAVE_GUIDES } from "./guides/september-wave";
import { AUTUMN_WAVE_GUIDES } from "./guides/autumn-wave";
import { WINTER_SEASONAL_GUIDES } from "./guides/winter-seasonal";
import { F1_WAVE_GUIDES } from "./guides/f1-wave";
import { FESTIVAL_WAVE_GUIDES } from "./guides/festival-wave";
import { QUESTIONS_CORE_GUIDES } from "./guides/questions-core";
import { QUESTIONS_EXTENDED_GUIDES } from "./guides/questions-extended";
import { NEW_CITIES_GUIDES } from "./guides/new-cities";
import { QUESTIONS_2027_GUIDES } from "./guides/questions-2027";
import { WHERE_2027_GUIDES } from "./guides/where-2027";
import { EVENTS_2027_GUIDES } from "./guides/events-2027";

// ── Types ──────────────────────────────────────────────────────────────

/** 正文章节：H2 标题 + 段落数组 + 可选要点列表。 */
export interface GuideSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

/** 行程骨架：天数 + 主题 + 说明（区别于 trip 的完整活动表，guide 用叙述式）。 */
export interface GuideItineraryDay {
  day: number;
  theme: string;
  description: string;
}

/** 实用规划信息块（最佳时间/交通/住宿/门票等）。 */
export interface GuidePracticalBlock {
  heading: string;
  items: string[];
}

export interface GuideFaqItem {
  question: string;
  answer: string;
}

/** 指向 UTripla 规划器的 CTA 预填参数（SearchBar 深链接支持）。 */
export interface GuidePlannerCta {
  /** 城市名，映射为 ?to= 参数。 */
  destination: string;
  travelStyle?: TravelStyle;
  interests?: TravelInterest[];
  /** 事件类 guide 的官方日期（YYYY-MM-DD），映射为 ?departureDate= / ?returnDate=。 */
  departureDate?: string;
  returnDate?: string;
  /** CTA 按钮文案。 */
  label: string;
}

export interface Guide {
  /** URL slug：/guides/<slug>。 */
  slug: string;
  /** 页面 H1。 */
  title: string;
  /** metadata title（不含 " | tripla" 模板后缀，目标 ≤52 字符）。 */
  seoTitle: string;
  /** meta description，目标 140-160 字符。 */
  metaDescription: string;
  /** 列表页卡片摘要。 */
  excerpt: string;
  coverImage: string | null;
  gradient: string;
  author: {
    name: string;
    initials: string;
    avatarColor: string;
    role: string;
  };
  /** 首发日期 YYYY-MM-DD。 */
  publishedAt: string;
  /** 最后更新日期 YYYY-MM-DD（Article schema dateModified + 页面可见）。 */
  updatedAt: string;
  readTime: string;
  tags: string[];
  /** 主要关联城市/国家（用于 Destination → Guide 反向内链）。 */
  city: string;
  country: string;
  /** 有用信息引言（2-3 段）。 */
  introduction: string[];
  /** 正文章节（3-6 个）。 */
  sections: GuideSection[];
  /** 行程章节。 */
  itinerary: {
    heading: string;
    intro: string;
    days: GuideItineraryDay[];
  };
  /** 实用规划信息。 */
  practicalInfo: GuidePracticalBlock[];
  /** 常见问题（页面可见 + FAQPage schema，二者必须一致）。 */
  faq: GuideFaqItem[];
  /** 相关目的地 slug（/destinations/<slug>）。 */
  relatedDestinationSlugs: string[];
  /** 相关行程 slug（/trips/<slug>）。 */
  relatedTripSlugs: string[];
  /** 相关 guide slug（Guide → Guide 内链）。 */
  relatedGuideSlugs: string[];
  /** 指向规划器的预填 CTA。 */
  planner: GuidePlannerCta;
}

// ── Registry ───────────────────────────────────────────────────────────

export const GUIDES: Guide[] = [
  ...SEPTEMBER_WAVE_GUIDES,
  ...AUTUMN_WAVE_GUIDES,
  ...REFRESHED_GUIDES,
  ...WINTER_SEASONAL_GUIDES,
  ...F1_WAVE_GUIDES,
  ...FESTIVAL_WAVE_GUIDES,
  ...QUESTIONS_CORE_GUIDES,
  ...QUESTIONS_EXTENDED_GUIDES,
  ...NEW_CITIES_GUIDES,
  ...QUESTIONS_2027_GUIDES,
  ...WHERE_2027_GUIDES,
  ...EVENTS_2027_GUIDES,
];

/** 返回所有 guide 的 slug。 */
export function getGuideSlugs(): string[] {
  return GUIDES.map((g) => g.slug);
}

/** 根据 slug 获取单个 guide，未找到返回 null。 */
export function getGuideBySlug(slug: string): Guide | null {
  return GUIDES.find((g) => g.slug === slug) ?? null;
}

/** 根据城市名（大小写不敏感）查找关联 guide，用于 Destination → Guide 内链。 */
export function getGuidesForCity(city: string): Guide[] {
  return GUIDES.filter(
    (g) => g.city.toLowerCase() === city.toLowerCase(),
  );
}

/** 构建指向首页规划器（hero-search）的深链接，带预填参数。 */
export function buildPlannerHref(cta: GuidePlannerCta): string {
  const params = new URLSearchParams();
  params.set("to", cta.destination);
  if (cta.travelStyle) params.set("travelStyle", cta.travelStyle);
  if (cta.interests && cta.interests.length > 0)
    params.set("interests", cta.interests.join(","));
  if (cta.departureDate) params.set("departureDate", cta.departureDate);
  if (cta.returnDate) params.set("returnDate", cta.returnDate);
  return `/?${params.toString()}#hero-search`;
}

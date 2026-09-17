/**
 * guide-detail — `/guides/<slug>` 的**派生数据层**（纯函数，Server Component 安全）。
 *
 * 原则：
 *   · 一切展示项都从 `GUIDES` / `DESTINATIONS` / `TRIPS` 现有真实字段派生；
 *     没有真实数据就不产出该字段（不补默认值、不猜、不造）。
 *   · 不复制 guide 正文内容，只为页面提供"可规划"的结构化元信息。
 *   · 全量 330 篇共用同一套规则 —— 不存在按 slug 的特判。
 */

import { DESTINATIONS, type Destination } from "@/data/destinations";
import { GUIDES, type Guide } from "@/data/guides";
import { TRIPS, type Trip } from "@/data/trips";

// ── destination 解析 ──────────────────────────────────────────────────

const destinationByCity = new Map(DESTINATIONS.map((d) => [d.city.toLowerCase(), d]));

/**
 * guide → destination：**只用 `guide.city` 精确同名匹配**（与 `getGuidesForCity`
 * 严格同一约定，保证 Guide ↔ Destination 双向一致）。
 *
 * 不用 `relatedDestinationSlugs` 兜底：那会让 city = "Global" / "Europe"
 * 这类洲级 round-up 被错误地归属到某一个具体目的地（例如把 "Where to travel in
 * January 2027" 标成 Rovaniemi）。这类 guide 的 destination 就是 null ——
 * 不显示 destination 图、不显示 destination 内链，相关目的地仍走
 * "Related destinations"（显式真实关联）。
 */
export function resolveGuideDestination(guide: Guide): Destination | null {
  return destinationByCity.get(guide.city.toLowerCase()) ?? null;
}

// ── travel intent（kind）─────────────────────────────────────────────

const STYLE_LABEL: Record<string, string> = {
  relaxed: "Slow travel",
  active: "Active",
  cultural: "Culture",
  foodie: "Food",
  adventure: "Adventure",
};

/** travelStyle 原始值 → 英文展示词（未知值原样返回，不猜测）。 */
export function styleLabel(style: string | undefined): string | null {
  if (!style) return null;
  return STYLE_LABEL[style] ?? style;
}

/**
 * guide 的类型定位（Hero eyebrow）：完全由已有真实字段判定。
 *   event  → 有 planner.departureDate（事件 / 赛事 / 节庆）
 *   itinerary / comparison / budget → 由 tags 判定
 *   其余 → travelStyle
 */
export function guideKind(guide: Guide): string {
  if (guide.planner.departureDate) return "Event guide";
  const tags = guide.tags.map((t) => t.toLowerCase());
  if (tags.includes("itinerary")) return "Itinerary";
  if (tags.includes("comparison")) return "Comparison";
  if (tags.some((t) => t.includes("budget") || t.includes("cost"))) return "Budget guide";
  const label = styleLabel(guide.planner.travelStyle);
  return label ? `${label} guide` : "Guide";
}

// ── Quick facts（decision strip）──────────────────────────────────────

export interface QuickFact {
  label: string;
  value: string;
}

/**
 * 决策条：只放真实存在、且对"要不要读 / 这趟怎么安排"有决策价值的少数几项。
 * 字段缺失即不产出 —— 绝不补占位符。
 */
export function guideQuickFacts(guide: Guide, destination: Destination | null): QuickFact[] {
  const facts: QuickFact[] = [];

  facts.push({
    label: "Destination",
    value: destination
      ? `${destination.city}, ${destination.country}`
      : `${guide.city}, ${guide.country}`,
  });

  const days = guide.itinerary.days.length;
  if (days > 0) {
    facts.push({ label: "Duration", value: `${days} ${days === 1 ? "day" : "days"}` });
  }

  if (guide.planner.departureDate) {
    facts.push({
      label: "Dates",
      value: guide.planner.returnDate
        ? `${guide.planner.departureDate} → ${guide.planner.returnDate}`
        : guide.planner.departureDate,
    });
  } else if (destination?.bestMonths) {
    facts.push({ label: "Best time", value: destination.bestMonths });
  }

  // travelStyle 与 interests 可能重叠（foodie + food）→ 去重后再展示，最多 3 项。
  const style = styleLabel(guide.planner.travelStyle);
  const interests = guide.planner.interests?.length
    ? guide.planner.interests
    : destination?.interests ?? [];
  const intentParts: string[] = [];
  const seenIntent = new Set<string>();
  for (const part of [style, ...interests.map(capitalize)]) {
    if (!part) continue;
    const key = part.toLowerCase();
    if (seenIntent.has(key)) continue;
    seenIntent.add(key);
    intentParts.push(part);
    if (intentParts.length === 3) break;
  }
  if (intentParts.length > 0) {
    facts.push({ label: "Style", value: intentParts.join(" · ") });
  }

  if (destination?.budgetPerDay) {
    facts.push({
      label: "Daily budget",
      value: `${destination.budgetPerDay.toLocaleString("en-US")} ${destination.budgetCurrency}`,
    });
  }

  return facts;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── 章节目录（"what this guide covers"，由真实 heading 派生）────────────

export interface GuideTocEntry {
  index: number;
  heading: string;
  /** 页面内锚点 id（与 InnerSection 的 id 一一对应）。 */
  id: string;
}

export const ITINERARY_ANCHOR = "guide-itinerary";

/** 正文 H2 + 行程章节的真实标题，用于页面顶部可扫描目录。 */
export function guideToc(guide: Guide): GuideTocEntry[] {
  const entries = guide.sections.map((s, i) => ({
    index: i + 1,
    heading: s.heading,
    id: `guide-section-${i + 1}`,
  }));
  if (guide.itinerary.days.length > 0) {
    entries.push({
      index: entries.length + 1,
      heading: guide.itinerary.heading,
      id: ITINERARY_ANCHOR,
    });
  }
  return entries;
}

// ── 关联 guides（可解释的规则排序）────────────────────────────────────

/** 太泛化、对"相关"无判别力的 tag（不参与相似度计分）。 */
const GENERIC_TAGS = new Set([
  "itinerary",
  "travel guide",
  "trip planning",
  "trip length",
  "comparison",
  "tips",
  "guide",
  "planning",
]);

const destinationRegionByCity = new Map(DESTINATIONS.map((d) => [d.city.toLowerCase(), d.region]));

function meaningfulTags(guide: Guide): Set<string> {
  const out = new Set<string>();
  for (const t of guide.tags) {
    const k = t.toLowerCase();
    if (!GENERIC_TAGS.has(k)) out.add(k);
  }
  return out;
}

/**
 * 关联 guide 排序（明确、可解释、无随机）：
 *   1. 数据显式声明的 relatedGuideSlugs（人工关联，最高优先）
 *   2. 同一城市
 *   3. 共享有意义的 tag 数量
 *   4. 同一 region（经 destination.city → region 派生）
 * 只对"存在真实关联"的 guide 给分；0 分不收录。
 */
export function relatedGuidesFor(guide: Guide, limit = 6): Guide[] {
  const selfTags = meaningfulTags(guide);
  const selfRegion = destinationRegionByCity.get(guide.city.toLowerCase()) ?? null;
  const explicitOrder = new Map(guide.relatedGuideSlugs.map((s, i) => [s, i]));

  const scored: Array<{ guide: Guide; score: number }> = [];

  for (const other of GUIDES) {
    if (other.slug === guide.slug) continue;

    let score = 0;
    const explicitIndex = explicitOrder.get(other.slug);
    if (explicitIndex !== undefined) score += 1000 - explicitIndex;

    if (other.city.toLowerCase() === guide.city.toLowerCase()) score += 100;

    let shared = 0;
    for (const t of meaningfulTags(other)) if (selfTags.has(t)) shared += 1;
    if (shared > 0) score += 50 + shared * 5;

    if (selfRegion) {
      const otherRegion = destinationRegionByCity.get(other.city.toLowerCase());
      if (otherRegion && otherRegion === selfRegion) score += 20;
    }

    if (score > 0) scored.push({ guide: other, score });
  }

  scored.sort((a, b) => b.score - a.score || a.guide.slug.localeCompare(b.guide.slug));
  return scored.slice(0, limit).map((s) => s.guide);
}

// ── 关联 trips（只取真实 TRIPS）────────────────────────────────────────

/** 显式声明的 relatedTripSlugs 优先，不足时用同城市真实 TRIPS 补齐。 */
export function relatedTripsFor(guide: Guide, limit = 3): Trip[] {
  const bySlug = new Map(TRIPS.map((t) => [t.slug, t]));
  const picked: Trip[] = [];
  const seen = new Set<string>();

  for (const slug of guide.relatedTripSlugs) {
    const t = bySlug.get(slug);
    if (t && !seen.has(t.slug)) {
      picked.push(t);
      seen.add(t.slug);
    }
    if (picked.length >= limit) return picked;
  }

  for (const t of TRIPS) {
    if (picked.length >= limit) break;
    if (seen.has(t.slug)) continue;
    if (t.city.toLowerCase() === guide.city.toLowerCase()) {
      picked.push(t);
      seen.add(t.slug);
    }
  }

  return picked;
}

// ── destination 侧内链（只产出确实存在的路由）──────────────────────────

export interface DestinationLink {
  href: string;
  label: string;
  /** mono 微标签（Destination / Timing / Budget）。 */
  meta: string;
}

/**
 * Guide → Destination 生态的真实内链。全部为 SSG 已生成的目的地路由，
 * 不存在死链接。
 */
export function destinationLinks(destination: Destination | null): DestinationLink[] {
  if (!destination) return [];
  return [
    {
      href: `/destinations/${destination.slug}`,
      label: `Explore ${destination.city}`,
      meta: "Destination",
    },
    {
      href: `/best-time-to-visit/${destination.slug}`,
      label: `Best time to visit ${destination.city}`,
      meta: "Timing",
    },
    {
      href: `/travel-budget/${destination.slug}`,
      label: `${destination.city} travel costs`,
      meta: "Budget",
    },
  ];
}

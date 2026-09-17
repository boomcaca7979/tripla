/**
 * home-data — 首页发现层的 **server-only 数据装配层**。
 *
 * 职责：把三份既有真实数据源装配成首页唯一的视图模型（HomePlace[]），供
 * 首屏状态句、发现层筛选、目的地 Preview、"Before you go" 共用：
 *
 *   1. src/data/destinations.ts        —— 城市 / 国家 / 描述 / 亮点 / 预算 / 兴趣 / 机场
 *   2. src/data/climate/nasa-canonical —— NASA POWER canonical 月值 + bestMonthsBaseline
 *   3. REFERENCE_FX（下方常量）         —— 固定参考汇率，仅用于把当地货币日预算折算成
 *                                          USD 以支撑 "$/day" 档位筛选
 *
 * 数据诚信：
 *   · 不生成任何新事实：所有字段直接来自上述来源。
 *   · 本模块只允许被 Server Component 引用（会带入 canonical climate 数据集）。
 *   · FX 是**固定参考汇率**（附来源与取数日期），只用于档位分桶，不用于对外报价。
 */

import { DESTINATIONS, getDestinationBySlug } from "@/data/destinations";
import { getClimateRecord } from "@/data/climate/nasa-canonical";
import { canonicalWindowLabel } from "@/components/besttime/besttime-state";
import {
  FEATURED_DESTINATION_SLUGS,
  FEATURED_DESTINATIONS,
} from "@/data/featured-destinations";
import type { HomeMonth, HomePlace } from "./home-discovery";

// ── 参考汇率（units per 1 USD） ────────────────────────────────────────
// 来源：open.er-api.com（exchangerate-api 免费端点），取数时间 2026-09-14 UTC。
// 用途：只把 destinations 的当地货币日预算折算为 USD，用于首页 $ 档位筛选；
// 页面上的金额一律同时标注当地货币原值，不把折算值当作报价。

const REFERENCE_FX_RETRIEVED = "2026-09-14";
const REFERENCE_FX_SOURCE = "open.er-api.com (exchangerate-api free endpoint)";

const REFERENCE_FX: Record<string, number> = {
  USD: 1,
  EUR: 0.862246,
  GBP: 0.739483,
  CHF: 0.816582,
  AUD: 1.397572,
  NZD: 1.720892,
  CAD: 1.386311,
  SGD: 1.267062,
  CNY: 6.715584,
  MOP: 8.078086,
};

export const FX_PROVENANCE = `Reference rates (${REFERENCE_FX_RETRIEVED}, ${REFERENCE_FX_SOURCE})`;

/** 当地货币 → USD 日预算。缺失汇率时**原值返回**（调用方不得据此改口径）。 */
export function usdPerDay(amount: number, currency: string): number {
  const rate = REFERENCE_FX[currency];
  if (!rate || !Number.isFinite(rate) || rate <= 0) return amount;
  return amount / rate;
}

// ── 编辑排序（唯一真相源：src/data/featured-destinations.ts） ────────────
// 同一份名单也被 /destinations 地球用于"重要目的地"（major）判定。

function phraseOf(description: string): string {
  const s = description.replace(/\s+/g, " ").trim();
  const firstSentence = s.split(/(?<=[.!?])\s/)[0] ?? s;
  return firstSentence.length <= 96 ? firstSentence : `${firstSentence.slice(0, 93).trimEnd()}…`;
}

// ── 装配 ──────────────────────────────────────────────────────────────

function monthsOf(slug: string): HomeMonth[] {
  const rec = getClimateRecord(slug);
  const windowSet = new Set(rec.bestMonthsBaseline);
  return rec.months.map((m) => ({
    index: m.monthIndex,
    tier: m.tier,
    inWindow: windowSet.has(m.monthIndex),
    tempMeanC: m.tempMeanC,
    tempHighC: m.tempHighC,
    tempLowC: m.tempLowC,
    precipMm: m.precipMm,
    precipDays: m.precipDaysGe1mm,
    daylightHours: m.daylightHours,
  }));
}

function toHomePlace(slug: string): HomePlace | null {
  const d = getDestinationBySlug(slug);
  if (!d) return null;
  const bestMonths = [...getClimateRecord(slug).bestMonthsBaseline].sort((a, b) => a - b);
  return {
    slug: d.slug,
    city: d.city,
    country: d.country,
    region: d.region,
    phrase: phraseOf(d.description),
    gradient: d.gradient,
    image: d.image,
    bestMonths,
    bestMonthsLabel: canonicalWindowLabel(bestMonths),
    budgetPerDay: d.budgetPerDay,
    budgetCurrency: d.budgetCurrency,
    budgetUsdPerDay: usdPerDay(d.budgetPerDay, d.budgetCurrency),
    recommendedDays: d.recommendedDays,
    iata: d.airport.iata,
    airportName: d.airport.name,
    timezone: d.timezone,
    latitude: d.airport.latitude,
    longitude: d.airport.longitude,
    travelStyle: d.travelStyle,
    interests: d.interests as unknown as string[],
    months: monthsOf(slug),
    highlights: d.highlights ?? [],
  };
}

/**
 * 首页数据集：精选城市排前，其余按数据顺序（与既有 SSR 默认视图一致）。
 * 任何 destination 缺少 canonical 记录时，getClimateRecord 直接抛错 → build FAIL。
 */
export function buildHomePlaces(): HomePlace[] {
  const ordered = [
    ...FEATURED_DESTINATION_SLUGS.map((s) => getDestinationBySlug(s)).filter((d): d is NonNullable<typeof d> => Boolean(d)),
    ...DESTINATIONS.filter((d) => !FEATURED_DESTINATIONS.has(d.slug)),
  ];
  return ordered
    .map((d) => toHomePlace(d.slug))
    .filter((p): p is HomePlace => Boolean(p));
}

// ── 城市索引（供 From / To 城市名搜索；不要求用户知道机场代码） ─────────

export interface CityIndexEntry {
  city: string;
  country: string;
  /** 主机场 IATA（仅作为候选项信息展示）。 */
  iata: string;
  icao: string;
  airportName: string;
  timezone: string;
  latitude: number;
  longitude: number;
}

export function buildCityIndex(): CityIndexEntry[] {
  return DESTINATIONS.map((d) => ({
    city: d.city,
    country: d.country,
    iata: d.airport.iata,
    icao: d.airport.icao,
    airportName: d.airport.name,
    timezone: d.airport.timezone,
    latitude: d.airport.latitude,
    longitude: d.airport.longitude,
  }));
}

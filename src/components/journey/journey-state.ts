import type { Trip, TripDay } from "@/data/trips";

/**
 * Trip Journey State — 展示层纯函数（无 directive，server 与 client 共用）。
 *
 * 设计原则（Trip Design Contract §5「内容质量」/ §10「状态」）：
 *   本文件**不新建任何内容**，只把 Trip 的真实字段重新组织成"旅程"视角的读数：
 *     · legs   ← trip.itinerary（每日行程 = 旅程的一段 leg，theme 即该段经过的地点/区域）
 *     · stops  ← trip.itinerary[].activities（沿途每一个已排定的停靠点）
 *     · pace   ← 由"停靠点 ÷ 天数"的真实密度派生（不是文案，是可复核的读数）
 *     · hours  ← 每日首个/末个活动的真实时间
 *   禁止：编造出发地、编造交通方式、编造与数据无关的建议文案。
 */

/** 旅程的一段（= 一天），字段全部来自 trip.itinerary。 */
export interface JourneyLeg {
  /** 第几天（真实字段 d.day） */
  day: number;
  /** 该段经过的地点/区域名（真实字段 d.theme） */
  place: string;
  /** 该段安排了多少个停靠点（真实数据 d.activities.length） */
  stops: number;
  /** 当日首个活动时间（真实字段，无活动时为 ""） */
  startTime: string;
  /** 当日末个活动时间（真实字段，无活动时为 ""） */
  endTime: string;
  /** 当日首个活动名（真实字段，用于站点副标签） */
  anchor: string;
}

/** 把 trip.itinerary 映射为旅程 leg 序列。 */
export function deriveLegs(trip: Trip): JourneyLeg[] {
  return trip.itinerary.map((d: TripDay) => {
    const acts = d.activities;
    return {
      day: d.day,
      place: d.theme,
      stops: acts.length,
      startTime: acts.length > 0 ? acts[0].time : "",
      endTime: acts.length > 0 ? acts[acts.length - 1].time : "",
      anchor: acts.length > 0 ? acts[0].name : "",
    };
  });
}

/** 沿途停靠点总数（= 全部已排定活动数）。 */
export function deriveStopCount(trip: Trip): number {
  return trip.itinerary.reduce((sum, d) => sum + d.activities.length, 0);
}

/** 每日平均停靠点密度。 */
export function deriveDensity(trip: Trip): number {
  const days = trip.itinerary.length;
  if (days === 0) return 0;
  return deriveStopCount(trip) / days;
}

/**
 * 旅程节奏读数：由真实密度派生，而非文案。
 * 阈值在真实语料上校准（280 trips：1.0–4.3 停靠点/日）。
 */
export function derivePace(trip: Trip): string {
  const density = deriveDensity(trip);
  if (density === 0) return "Unlisted";
  if (density < 2) return "Light";
  if (density < 3.5) return "Relaxed";
  if (density < 4.5) return "Balanced";
  return "Full";
}

/** 当日时间跨度读数（如 "08:00 – 19:00"；无活动返回 ""）。 */
export function legHours(leg: JourneyLeg): string {
  if (!leg.startTime || !leg.endTime) return "";
  return `${leg.startTime} – ${leg.endTime}`;
}

/** 首字母大写（travelStyle / interests 枚举展示）。 */
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** 天数 → 展示标签（"3 days" / "1 day"）。 */
export function daysLabel(days: number): string {
  return `${days} ${days === 1 ? "day" : "days"}`;
}

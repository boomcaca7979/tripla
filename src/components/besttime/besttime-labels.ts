import type { Season } from "@/lib/visual-state";

/**
 * besttime-labels — Best-time 的**叶子常量层**（零运行时依赖）。
 *
 * 为什么要单独拆出来：MonthSelector / VerdictTag 是 client component，
 * 若它们从 `besttime-state.ts` 取值，打包器会把整条链路
 * （climate-pattern → destinations 数据）拖进客户端 bundle。
 * 因此把"只含类型 + 常量"的部分放在这里：client 只拿到几百字节，
 * 而服务端综合逻辑留在 besttime-state.ts。
 *
 * 本文件不得 import 任何有运行时副作用的模块（仅允许 `import type`）。
 */

// ── 决策档位（Best / Good / Mixed / Avoid）─────────────────────────────

export type Verdict = "best" | "good" | "mixed" | "avoid";

export const VERDICT_LABEL: Record<Verdict, string> = {
  best: "Best",
  good: "Good",
  mixed: "Mixed",
  avoid: "Avoid",
};

export const VERDICT_MEANING: Record<Verdict, string> = {
  best: "Favourable month (R1–R7) inside the canonical best-time window",
  good: "Workable month (R1–R7) — a viable alternative outside the stated window",
  mixed: "Transitional month — workable with a flexible plan",
  avoid: "Challenging month (R1–R7) — least favourable climate pattern",
};

export const VERDICT_ORDER: Verdict[] = ["best", "good", "mixed", "avoid"];

// ── 单月行（表格 / 选择器共用，可安全跨 server→client 序列化）───────────

export interface MonthRow {
  index: number;
  /** 完整月名（display 用） */
  name: string;
  /** 3 字母缩写（column / mono 用） */
  short: string;
  season: Season;
  seasonName: string;
  /** NASA POWER canonical：月均温（°C，1991–2020 月均） */
  tempMeanC: number;
  /** NASA POWER canonical：月均日最高温（°C） */
  tempHighC: number;
  /** NASA POWER canonical：月均日最低温（°C） */
  tempLowC: number;
  /** NASA POWER canonical：月降水总量（mm，1991–2020 月均） */
  precipMm: number;
  /** NASA-derived：月均降水 ≥1 mm 天数 */
  precipDaysGe1mm: number;
  /** NASA POWER canonical：月均日照时数——当前合法 null */
  sunshineHours: number | null;
  /** 天文计算：月均白昼小时数（非 NASA 数据） */
  daylightHours: number;
  /** 确定性分桶：温度档位（由 tempMeanC 推导，阈值见 besttime-state） */
  tempLevel: string;
  /** 确定性分桶：降水倾向（由 precipMm 推导） */
  precipTendency: string;
  /** canonical 数值拼装的数据行说明（零模板叙事） */
  note: string;
  /** R1–R7 tier 映射：Favourable→best / Workable→good / Challenging→avoid */
  derived: "best" | "good" | "avoid";
  /** canonical bestMonthsBaseline 窗口内 */
  inWindow: boolean;
  verdict: Verdict;
}

// ── 季节氛围色（装饰用途，不承载文本）─────────────────────────────────

export const SEASON_TINT: Record<Season, string> = {
  spring: "104, 132, 92", // moss
  summer: "190, 134, 62", // amber
  autumn: "164, 96, 58", // rust（与品牌 terracotta 同族）
  winter: "92, 116, 140", // slate
};

export function seasonTint(season: Season | null): string {
  return season ? SEASON_TINT[season] : "164, 81, 59";
}

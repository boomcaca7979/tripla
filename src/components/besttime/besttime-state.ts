import type { Season } from "@/lib/visual-state";
import {
  getHemisphere,
  getMonthName,
  getSeasonMonths,
  type ClimateZone,
  type Hemisphere,
} from "@/lib/climate-pattern";
import {
  getClimateRecord,
  type CanonicalClimateRecord,
} from "@/data/climate/nasa-canonical";
import { SEASON_LABEL } from "@/components/destination/place-state";
import type { Destination } from "@/data/destinations";
import type { MonthRow, Verdict } from "./besttime-labels";

// 叶子常量层（零运行时依赖）：类型与档位标签在此再导出，
// 使服务端保持"单点导入"，而 client component 只引叶子层、不进这条数据链。
export {
  SEASON_TINT,
  VERDICT_LABEL,
  VERDICT_MEANING,
  VERDICT_ORDER,
  seasonTint,
} from "./besttime-labels";
export type { MonthRow, Verdict } from "./besttime-labels";

/**
 * Best-time State — 展示层纯函数（无 directive，server 与 client 共用）。
 *
 * NASA POWER PRIMARY MIGRATION 后的数据边界：本文件的**唯一气候权威**是
 * production canonical dataset（src/data/climate/nasa-power-canonical-v1.json，
 * NASA POWER 145 anchors / 1991–2020 / UTC，v8.7 freeze 验证）。旧的
 * 纬度→气候带→定性模板（lib/climate-pattern 的 getClimateZone /
 * getMonthlyClimateNote / getMonthRecommendation）已从气候权威中移除。
 *
 * 数值→定性档位的映射（tempLevel / precipTendency / zone）是**确定性分桶**，
 * 阈值固定写在下方常量，不做任何随机或内容生成。
 */

// ── 数值 → 定性档位（确定性分桶；阈值固定，全数据域覆盖）────────────────

/**
 * 温度档位：以月均温（tempMeanC，月平均日均值）分桶。
 * 覆盖 canonical 全域 [-14.42, 35.61] °C。
 */
const TEMP_BUCKETS: { min: number; level: "Cold" | "Cool" | "Mild" | "Warm" | "Hot" }[] = [
  { min: 25, level: "Hot" },
  { min: 18, level: "Warm" },
  { min: 10, level: "Mild" },
  { min: 0, level: "Cool" },
  { min: -Infinity, level: "Cold" },
];

/**
 * 降水倾向：以月降水总量（precipMm，1991–2020 月均）分桶。
 * 覆盖 canonical 全域 [0.5, 793.1] mm。
 */
const PRECIP_BUCKETS: { min: number; level: "Dry" | "Low" | "Moderate" | "High" }[] = [
  { min: 200, level: "High" },
  { min: 100, level: "Moderate" },
  { min: 40, level: "Low" },
  { min: -Infinity, level: "Dry" },
];

function tempLevelFor(tempMeanC: number): "Cold" | "Cool" | "Mild" | "Warm" | "Hot" {
  return TEMP_BUCKETS.find((b) => tempMeanC >= b.min)!.level;
}

function precipTendencyFor(precipMm: number): "Dry" | "Low" | "Moderate" | "High" {
  return PRECIP_BUCKETS.find((b) => precipMm >= b.min)!.level;
}

/**
 * 气候带（显示级）：由 canonical 年值确定性推导——
 *   年降水 < 250 mm → Desert（干旱判据优先于温度）
 *   否则按年均温：≥ 24 Tropical / ≥ 16 Subtropical / ≥ 5 Temperate / 其余 Continental。
 * （取代旧的纬度带分类： authority 现在是 NASA POWER 实测月值。）
 */
function climateZoneFor(rec: CanonicalClimateRecord): ClimateZone {
  const annualPrecip = rec.months.reduce((s, m) => s + m.precipMm, 0);
  if (annualPrecip < 250) return "Desert";
  const annualMean = rec.months.reduce((s, m) => s + m.tempMeanC, 0) / rec.months.length;
  if (annualMean >= 24) return "Tropical";
  if (annualMean >= 16) return "Subtropical";
  if (annualMean >= 5) return "Temperate";
  return "Continental";
}

/** R1–R7 tier → 展示层 derived 档位（唯一映射，不做内容判断）。 */
function tierToDerived(tier: "Favourable" | "Workable" | "Challenging"): "best" | "good" | "avoid" {
  switch (tier) {
    case "Favourable":
      return "best";
    case "Challenging":
      return "avoid";
    default:
      return "good";
  }
}

// ── canonical Best Months 窗口标签 ──────────────────────────────────────

/**
 * 把 canonical bestMonthsBaseline（月 index 集合）转成连续区间标签：
 * [4..8] → "May – September"；[11] → "December"；[0, 10, 11] → "January, November – December"。
 * 纯名称展开，不新增信息。
 */
export function canonicalWindowLabel(baseline: number[]): string {
  const sorted = [...baseline].sort((a, b) => a - b);
  if (sorted.length === 0) return "";
  const runs: number[][] = [];
  for (const m of sorted) {
    const last = runs[runs.length - 1];
    if (last && m === last[last.length - 1] + 1) last.push(m);
    else runs.push([m]);
  }
  return runs
    .map((run) =>
      run.length === 1
        ? getMonthName(run[0])
        : `${getMonthName(run[0])} – ${getMonthName(run[run.length - 1])}`,
    )
    .join(", ");
}

// ── 月份 → 季节（由真实半球推出，非新数据） ─────────────────────────────

const SEASON_ORDER: Season[] = ["spring", "summer", "autumn", "winter"];

/** 月份所属季节：直接把 getSeasonMonths 反向映射，不新建季节系统。 */
export function seasonForMonth(dest: Destination, monthIndex: number): Season {
  for (const s of SEASON_ORDER) {
    if (getSeasonMonths(dest, s).includes(monthIndex)) return s;
  }
  return "winter";
}

export function seasonLabel(season: Season): string {
  return SEASON_LABEL[season];
}

/** 某季节覆盖的月份（已按月份序排序）。 */
export function seasonMonths(dest: Destination, season: Season): number[] {
  return [...getSeasonMonths(dest, season)].sort((a, b) => a - b);
}

// ── 决策合成：canonical tier × canonical Best Months ────────────────────

/**
 * 决策合成规则（页面 legend 明示）：
 *   avoid  → R1–R7 tier = Challenging
 *   best   → 落在 canonical bestMonthsBaseline 窗口内（且非挑战月）；
 *            baseline 语义：Favourable 月集合，无则 Workable 低降水月
 *            （ok-workable-fallback），再无则 []（no-favourable-month）
 *   good   → tier = Workable 且不在窗口内（可行替代档期）
 *   mixed  → 其余过渡月
 */
export function verdictFor(
  inWindow: boolean,
  derived: "best" | "good" | "avoid",
): Verdict {
  if (derived === "avoid") return "avoid";
  if (inWindow) return "best";
  if (derived === "best") return "good";
  return "mixed";
}

/** 数值格式化（固定小数位 → 确定性输出）。 */
const f1 = (n: number) => n.toFixed(1);

/** 单月数据行 note：完全由 canonical 数值拼装（确定性、零模板叙事）。 */
function monthNote(m: {
  tempHighC: number;
  tempLowC: number;
  precipMm: number;
  precipDaysGe1mm: number;
}): string {
  return `Avg high ${f1(m.tempHighC)}°C / avg low ${f1(m.tempLowC)}°C · ${f1(
    m.precipMm,
  )} mm precipitation over ${f1(m.precipDaysGe1mm)} days with ≥1 mm rain.`;
}

/** 12 个月完整行（canonical 数据驱动；缺失记录会抛异常 → build FAIL）。 */
export function buildMonthRows(dest: Destination): MonthRow[] {
  const rec = getClimateRecord(dest.slug);
  const windowMonths = new Set(rec.bestMonthsBaseline);
  if (rec.months.length !== 12) {
    throw new Error(
      `[nasa-canonical] ${dest.slug}: expected 12 month records, got ${rec.months.length}`,
    );
  }
  return rec.months.map((m, i) => {
    if (m.monthIndex !== i) {
      throw new Error(`[nasa-canonical] ${dest.slug}: month index out of order at ${m.monthIndex}`);
    }
    const derived = tierToDerived(m.tier);
    const inWindow = windowMonths.has(m.monthIndex);
    const season = seasonForMonth(dest, m.monthIndex);
    const full = getMonthName(m.monthIndex);
    return {
      index: m.monthIndex,
      name: full,
      short: full.slice(0, 3),
      season,
      seasonName: SEASON_LABEL[season],
      tempLevel: tempLevelFor(m.tempMeanC),
      precipTendency: precipTendencyFor(m.precipMm),
      note: monthNote(m),
      derived,
      inWindow,
      verdict: verdictFor(inWindow, derived),
      tempMeanC: m.tempMeanC,
      tempHighC: m.tempHighC,
      tempLowC: m.tempLowC,
      precipMm: m.precipMm,
      precipDaysGe1mm: m.precipDaysGe1mm,
      daylightHours: m.daylightHours,
      sunshineHours: m.sunshineHours,
    };
  });
}

/** canonical Best Months 窗口（bestMonthsBaseline；空数组 = no-favourable-month 合法状态）。 */
export function windowMonths(dest: Destination): number[] {
  return [...getClimateRecord(dest.slug).bestMonthsBaseline].sort((a, b) => a - b);
}

// ── 首屏读数：季节 / 气候带 / 窗口内的气候特征 ──────────────────────────

export interface WindowSummary {
  months: number[];
  label: string;
  count: number;
  seasons: Season[];
  dominantSeason: Season | null;
  /** 窗口内出现过的温度等级（按 冷→热 排序，去重） */
  tempLevels: string[];
  /** 窗口内出现过的降水倾向（按 干→湿 排序，去重） */
  precipTendencies: string[];
  /** 窗口内被判为挑战月的月份 */
  challenging: number[];
}

const TEMP_ORDER = ["Cold", "Cool", "Mild", "Warm", "Hot"];
const PRECIP_ORDER = ["Dry", "Low", "Moderate", "High"];

export function summarizeWindow(dest: Destination, rows: MonthRow[]): WindowSummary {
  const months = windowMonths(dest);
  const inWin = rows.filter((r) => r.inWindow);
  const seasonCount = new Map<Season, number>();
  for (const r of inWin) seasonCount.set(r.season, (seasonCount.get(r.season) ?? 0) + 1);
  let dominantSeason: Season | null = null;
  let max = 0;
  for (const s of SEASON_ORDER) {
    const c = seasonCount.get(s) ?? 0;
    if (c > max) {
      max = c;
      dominantSeason = s;
    }
  }
  return {
    months,
    label: canonicalWindowLabel(months),
    count: months.length,
    seasons: SEASON_ORDER.filter((s) => (seasonCount.get(s) ?? 0) > 0),
    dominantSeason,
    tempLevels: [...new Set(inWin.map((r) => r.tempLevel))].sort(
      (a, b) => TEMP_ORDER.indexOf(a) - TEMP_ORDER.indexOf(b),
    ),
    precipTendencies: [...new Set(inWin.map((r) => r.precipTendency))].sort(
      (a, b) => PRECIP_ORDER.indexOf(a) - PRECIP_ORDER.indexOf(b),
    ),
    challenging: inWin.filter((r) => r.verdict === "avoid").map((r) => r.index),
  };
}

// ── 季节叙述（canonical 数据 × 半球季节交集） ───────────────────────────

export interface SeasonSummary {
  season: Season;
  label: string;
  months: number[];
  monthNames: string;
  tempLevels: string[];
  precipTendencies: string[];
  inWindowCount: number;
  character: string;
}

export function summarizeSeasons(dest: Destination, rows: MonthRow[]): SeasonSummary[] {
  return SEASON_ORDER.map((season) => {
    const months = seasonMonths(dest, season);
    const seasonRows = rows.filter((r) => r.season === season);
    return {
      season,
      label: SEASON_LABEL[season],
      months,
      monthNames: months.map((m) => getMonthName(m).slice(0, 3)).join(" · "),
      tempLevels: [...new Set(seasonRows.map((r) => r.tempLevel))].sort(
        (a, b) => TEMP_ORDER.indexOf(a) - TEMP_ORDER.indexOf(b),
      ),
      precipTendencies: [...new Set(seasonRows.map((r) => r.precipTendency))].sort(
        (a, b) => PRECIP_ORDER.indexOf(a) - PRECIP_ORDER.indexOf(b),
      ),
      inWindowCount: seasonRows.filter((r) => r.inWindow).length,
      character: seasonRows[0]?.note ?? "",
    };
  });
}

// ── 汇总读数 ────────────────────────────────────────────────────────────

export interface DecisionReadout {
  window: WindowSummary;
  zone: ClimateZone;
  hemisphere: Hemisphere;
  /** R1–R7 判定为挑战月的全部月份 */
  avoidMonths: number[];
  /** Workable（可行替代）月份 */
  alternativeMonths: number[];
}

export function buildDecisionReadout(
  dest: Destination,
  rows: MonthRow[],
): DecisionReadout {
  return {
    window: summarizeWindow(dest, rows),
    zone: climateZoneFor(getClimateRecord(dest.slug)),
    hemisphere: getHemisphere(dest),
    avoidMonths: rows.filter((r) => r.verdict === "avoid").map((r) => r.index),
    alternativeMonths: rows
      .filter((r) => r.verdict === "good")
      .map((r) => r.index),
  };
}

/** 首屏/选择器默认月份：canonical Best Months 首月（确定性）。 */
export function defaultMonth(dest: Destination): number {
  const months = windowMonths(dest);
  return months.length > 0 ? months[0] : 0;
}

// （季节氛围色 / 档位标签 / MonthRow 形状 → 叶子层 besttime-labels.ts 并在此再导出）

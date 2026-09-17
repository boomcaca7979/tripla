/**
 * home-discovery — 首页发现层的**纯函数 / 类型**层（无任何数据导入，server 与
 * client 共用）。
 *
 * 职责边界：
 *   · 定义首页发现层的视图模型类型（HomePlace / HomeMonth）。
 *   · 定义 Budget 档位、Mood 分类、月份筛选的**确定性谓词**。
 *   · 由真实字段（canonical tier / 月法线 / USD 日预算）派生状态句与读数。
 *
 * 数据诚信：
 *   · 本文件不做任何数值生成，只对上游真实字段做确定性分桶与聚合（唯一阈值
 *     写在下方便量里）。
 *   · Crowds 读数是**气候适宜度派生信号**（canonical R-tier × best-month 窗口），
 *     不是游客量数据；展示层以 SEASON_SIGNAL_BASIS 明示其依据。
 */

// ── View model（由 lib/home-data.ts 在 server 端装配） ─────────────────

import type { MoodId as VisualMoodId } from "./visual-state";

export type ClimateTier = "Favourable" | "Workable" | "Challenging";

export interface HomeMonth {
  /** 0-11 */
  index: number;
  tier: ClimateTier;
  /** 是否落在 canonical bestMonthsBaseline 窗口内 */
  inWindow: boolean;
  tempMeanC: number;
  tempHighC: number;
  tempLowC: number;
  precipMm: number;
  precipDays: number;
  daylightHours: number;
}

export interface HomePlace {
  slug: string;
  city: string;
  country: string;
  region: string;
  /** 一行短描述（真实 description 首句）。 */
  phrase: string;
  gradient: string;
  image: string | null;
  /** canonical Best Months 窗口（月 index 集合）。 */
  bestMonths: number[];
  /** 窗口的可读标签，如 "March – May, October – November"。 */
  bestMonthsLabel: string;
  /** 当地货币计的每日预算（数据原值，不做换算）。 */
  budgetPerDay: number;
  budgetCurrency: string;
  /** 以固定参考汇率折算的每日预算（USD），仅用于 $ 档位筛选。 */
  budgetUsdPerDay: number;
  recommendedDays: number;
  /** 主机场 IATA（只作为信息展示，不作为输入要求）。 */
  iata: string;
  airportName: string;
  /** IANA 时区（选择该城市后首屏时间随之锚定）。 */
  timezone: string;
  /** 坐标（用于该城市的实时天气读数 / 用户坐标邻近判定）。 */
  latitude: number;
  longitude: number;
  travelStyle: string;
  interests: string[];
  months: HomeMonth[];
  highlights: string[];
}

// ── Budget 档位（USD/天；阈值固定，全数据域覆盖） ──────────────────────

export type BudgetTier = "any" | "economy" | "mid" | "premium";

export interface BudgetTierDef {
  id: BudgetTier;
  label: string;
  /** 档位价格区间标签（UI 用，必须与下方阈值一致）。 */
  range: string;
  min: number;
  max: number;
}

export const BUDGET_TIERS: BudgetTierDef[] = [
  { id: "any", label: "Any budget", range: "all price levels", min: 0, max: Infinity },
  { id: "economy", label: "Economy", range: "under $100/day", min: 0, max: 100 },
  { id: "mid", label: "Mid-range", range: "$100–250/day", min: 100, max: 250 },
  { id: "premium", label: "Premium", range: "$250+/day", min: 250, max: Infinity },
];

/** 预算口径说明（首页 Budget 控件与 "Already know where?" 表单共用同一句）。 */
export const BUDGET_NOTE = "Typical daily spend, excluding long-haul airfare.";

export function budgetTierDef(id: BudgetTier): BudgetTierDef {
  return BUDGET_TIERS.find((t) => t.id === id) ?? BUDGET_TIERS[0];
}

/** 档位命中：min ≤ usd < max（premium 为开区间上界）。 */
export function matchesBudget(place: HomePlace, tier: BudgetTier): boolean {
  if (tier === "any") return true;
  const def = budgetTierDef(tier);
  return place.budgetUsdPerDay >= def.min && place.budgetUsdPerDay < def.max;
}

// ── Mood（Vibe）分类 —— 首页发现层的唯一分类来源 ───────────────────────
// MoodId 的唯一定义仍在 lib/visual-state.ts（环境 accent 同源），此处只再导出，
// 避免出现第二份枚举产生漂移。

export type MoodId = VisualMoodId;

export interface MoodDef {
  id: MoodId;
  label: string;
  hint: string;
  interests: string[];
}

export const MOODS: MoodDef[] = [
  { id: "all", label: "Everywhere", hint: "the full atlas", interests: [] },
  { id: "food", label: "Food first", hint: "eat your way through", interests: ["food"] },
  { id: "culture", label: "Old streets", hint: "history & museums", interests: ["history", "museums"] },
  { id: "nature", label: "Green escape", hint: "nature", interests: ["nature"] },
  { id: "beaches", label: "Barefoot", hint: "beaches", interests: ["beaches"] },
  { id: "night", label: "After dark", hint: "nightlife", interests: ["nightlife"] },
  { id: "shopping", label: "Browsing", hint: "shops & markets", interests: ["shopping"] },
  { id: "active", label: "Moving", hint: "sports & action", interests: ["sports"] },
];

export function moodDef(id: MoodId): MoodDef {
  return MOODS.find((m) => m.id === id) ?? MOODS[0];
}

/** Mood 命中：无 interests 的档位（Everywhere）全量命中。 */
export function matchesMood(place: HomePlace, mood: MoodId): boolean {
  const def = moodDef(mood);
  if (def.interests.length === 0) return true;
  return place.interests.some((i) => def.interests.includes(i));
}

/** 地点的真实 interests → 命中的 mood 标签（用于 Preview 的 "Also reads as"）。 */
export function vibesForPlace(place: HomePlace): string[] {
  return MOODS.filter(
    (m) => m.interests.length > 0 && place.interests.some((i) => m.interests.includes(i)),
  ).map((m) => m.label);
}

// ── 月份：canonical tier × best-month 窗口（无新算法） ──────────────────

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const MONTH_SHORT = MONTH_NAMES.map((m) => m.slice(0, 3));

export function monthName(index: number): string {
  return MONTH_NAMES[((index % 12) + 12) % 12];
}

export function monthOf(place: HomePlace, index: number): HomeMonth | null {
  return place.months.find((m) => m.index === ((index % 12) + 12) % 12) ?? null;
}

/** 月份命中：落在 best-month 窗口内，或该月 canonical tier 为 Favourable。 */
export function matchesMonth(place: HomePlace, month: number | null): boolean {
  if (month === null) return true;
  const m = monthOf(place, month);
  if (!m) return false;
  return m.inWindow || m.tier === "Favourable";
}

// ── 组合筛选（AND；mood/month/budget 任一为"全部"时该维度不参与） ──────

export interface DiscoveryFilters {
  mood: MoodId;
  month: number | null;
  budget: BudgetTier;
}

export function filterPlaces(places: HomePlace[], filters: DiscoveryFilters): HomePlace[] {
  return places.filter(
    (p) =>
      matchesMood(p, filters.mood) &&
      matchesMonth(p, filters.month) &&
      matchesBudget(p, filters.budget),
  );
}

/** 筛选条件句（状态反馈行使用；只描述用户实际设置的条件）。 */
export function describeFilters(filters: DiscoveryFilters, fallbackMonth: number): string {
  const parts: string[] = [];
  parts.push(filters.month === null ? `${monthName(fallbackMonth)} (current month)` : monthName(filters.month));
  parts.push(filters.budget === "any" ? "any budget" : `${budgetTierDef(filters.budget).label} (${budgetTierDef(filters.budget).range})`);
  if (filters.mood !== "all") parts.push(moodDef(filters.mood).label.toLowerCase());
  return parts.join(" · ");
}

// ── 派生读数：天气气质 / 季节信号（确定性分桶，阈值固定） ─────────────

const TEMP_WORDS: { min: number; word: string }[] = [
  { min: 25, word: "Hot" },
  { min: 18, word: "Warm" },
  { min: 10, word: "Mild" },
  { min: 0, word: "Cool" },
  { min: -Infinity, word: "Cold" },
];

/** 月均温 → 气质词（canonical 全域 [-14.4, 35.6] °C）。 */
export function tempWord(tempMeanC: number): string {
  return TEMP_WORDS.find((b) => tempMeanC >= b.min)!.word;
}

/** 月降水总量 → "Rainy season" 判定（阈值固定 200 mm，与 besttime 分桶一致）。 */
export function isRainyMonth(precipMm: number): boolean {
  return precipMm >= 200;
}

/** 单地单月的天气读数：气温气质（降水极高时以雨季优先）。 */
export function weatherPhraseFor(month: HomeMonth | null): string | null {
  if (!month) return null;
  if (isRainyMonth(month.precipMm)) return "Rainy season";
  return `${tempWord(month.tempMeanC)} weather`;
}

export type SeasonSignal = "Peak season" | "Shoulder season" | "Quiet month";

/**
 * 拥挤度派生信号（**不是**游客量数据）：
 *   落在 best-month 窗口（canonical Favourable 集合）→ Peak season
 *   canonical tier = Workable（可行替代档期）→ Shoulder season
 *   其余（Challenging）→ Quiet month
 */
export function seasonSignalFor(month: HomeMonth | null): SeasonSignal | null {
  if (!month) return null;
  if (month.inWindow) return "Peak season";
  if (month.tier === "Workable") return "Shoulder season";
  return "Quiet month";
}

export const SEASON_SIGNAL_BASIS =
  "Season signal derives from NASA POWER climate tiers, not visitor counts.";

/** 多地的众数聚合（确定性：票数相同按给定顺序取先出现者）。 */
function modeOf<T>(values: T[], order: T[]): T | null {
  if (values.length === 0) return null;
  const counts = new Map<T, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best: T | null = null;
  let bestCount = -1;
  for (const candidate of order) {
    const c = counts.get(candidate) ?? 0;
    if (c > bestCount) {
      bestCount = c;
      best = candidate;
    }
  }
  return best;
}

const TEMP_WORD_ORDER = ["Hot", "Warm", "Mild", "Cool", "Cold"];
const SIGNAL_ORDER: SeasonSignal[] = ["Peak season", "Shoulder season", "Quiet month"];

export interface ClimateReadout {
  weather: string | null;
  season: SeasonSignal | null;
}

/**
 * 集合级读数：对当前筛选出的目的地，在给定月份上取**众数**。
 * 集合为空 → 返回 null（调用方负责回退，不编造）。
 */
export function readoutForSet(places: HomePlace[], month: number | null): ClimateReadout {
  if (month === null || places.length === 0) return { weather: null, season: null };
  const months = places
    .map((p) => monthOf(p, month))
    .filter((m): m is HomeMonth => Boolean(m));
  if (months.length === 0) return { weather: null, season: null };
  const rainyShare = months.filter((m) => isRainyMonth(m.precipMm)).length / months.length;
  const tempPhrase = modeOf(
    months.map((m) => tempWord(m.tempMeanC)),
    TEMP_WORD_ORDER,
  );
  return {
    weather: rainyShare >= 0.5 ? "Rainy season" : tempPhrase ? `${tempPhrase} weather` : null,
    season: modeOf(months.map((m) => seasonSignalFor(m)!), SIGNAL_ORDER),
  };
}

// ── 首屏状态句（第三层文字：只由用户当前选择派生） ─────────────────────

export interface StatusLineInput {
  /** 已选目的地（未选为 null）。 */
  city: string | null;
  /** 已选目的地的当地时间标签（未选为 null）。 */
  localTime: string | null;
  /** 已选月份；null = 未筛选。 */
  month: number | null;
  /** 未筛选月份时代入的当前月份（上下文，不构成筛选）。 */
  fallbackMonth: number;
  /** 集合级读数（来自当前筛选结果）。 */
  readout: ClimateReadout;
  mood: MoodId;
  budget: BudgetTier;
  /** 当前筛选命中的目的地数量。 */
  matchCount: number;
}

/**
 * 首屏第三层状态行：单一字符串，全部片段都来自用户当前的选择。
 * 例：`Kyoto · 06:20 AM local · September · Mild weather · Peak season`
 *     `September · Warm weather · Shoulder season · Food first · Mid-range`
 */
export function buildStatusLine(input: StatusLineInput): string {
  const parts: string[] = [];
  if (input.city && input.localTime) {
    parts.push(`${input.city} · ${input.localTime} local`);
  }
  parts.push(monthName(input.month ?? input.fallbackMonth));
  if (input.readout.weather) parts.push(input.readout.weather);
  if (input.readout.season) parts.push(input.readout.season);
  if (input.mood !== "all") parts.push(moodDef(input.mood).label);
  if (input.budget !== "any") parts.push(budgetTierDef(input.budget).label);
  if (input.matchCount === 0) parts.push("no places match");
  return parts.join(" · ");
}

// ── 展示格式化（真实字段，不做换算推断） ───────────────────────────────

export function bestMonthsShort(place: HomePlace): string {
  if (place.bestMonths.length === 0) return "Year-round";
  return place.bestMonths.map((m) => MONTH_SHORT[m]).join(" · ");
}

/** 日预算读数：当地货币原值 + 折算 USD（仅供参考汇率）。 */
export function budgetLabel(place: HomePlace): string {
  const local = `${Math.round(place.budgetPerDay)} ${place.budgetCurrency}/day`;
  if (place.budgetCurrency === "USD") return `$${Math.round(place.budgetUsdPerDay)}/day`;
  return `≈ $${Math.round(place.budgetUsdPerDay)}/day (${local})`;
}

/** 单月气候读数（真实 canonical 月法线）。 */
export function monthClimateLabel(month: HomeMonth | null): string | null {
  if (!month) return null;
  const f = (n: number) => n.toFixed(1);
  return `Avg high ${f(month.tempHighC)}°C / low ${f(month.tempLowC)}°C · ${f(month.precipMm)} mm over ${f(month.precipDays)} rain days`;
}

// ── 集合级聚合（"Before you go" 未选城市时的真实读数；无编造） ─────────

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** 集合中最常出现的 best-month（计数降序，同票按月序）。 */
export function aggregateBestMonths(places: HomePlace[], limit = 3): string | null {
  const counts = new Map<number, number>();
  for (const p of places) {
    for (const m of p.bestMonths) counts.set(m, (counts.get(m) ?? 0) + 1);
  }
  if (counts.size === 0) return null;
  return [...counts.entries()]
    .sort((a, b) => (b[1] === a[1] ? a[0] - b[0] : b[1] - a[1]))
    .slice(0, limit)
    .map(([m, c]) => `${MONTH_SHORT[m]} (${c})`)
    .join(" · ");
}

/** 集合日预算中位数（USD，已按参考汇率折算）。 */
export function medianBudgetUsd(places: HomePlace[]): number | null {
  return median(places.map((p) => p.budgetUsdPerDay));
}

/** 集合推荐停留天数区间（min–max，真实 recommendedDays）。 */
export function stayRange(places: HomePlace[]): string | null {
  if (places.length === 0) return null;
  const days = places.map((p) => p.recommendedDays).filter((d) => Number.isFinite(d));
  if (days.length === 0) return null;
  const min = Math.min(...days);
  const max = Math.max(...days);
  return min === max ? `${min} days` : `${min}–${max} days`;
}

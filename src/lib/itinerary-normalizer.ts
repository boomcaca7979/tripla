import type { Activity, Itinerary, ItineraryDay, TravelInterest } from "@/types/itinerary";
import { ItinerarySchema, TravelPlanInputSchema } from "./schemas";

/**
 * itinerary-normalizer — 把**真实模型输出**收敛到既有 `ItinerarySchema` 契约。
 *
 * 为什么必须有这一层（2026-10-28 线上实测）：
 *   `/api/itinerary` 返回 200，但模型给出的结构是它自己发明的：
 *     input.destination 是字符串 "Tokyo, Japan (NRT)"（契约要机场对象）
 *     缺 departureDate / returnDate / budgetLevel / groupSize / dayNumber
 *     活动用 type / startTime / endTime / location（契约要 category / timeOfDay / duration / address）
 *   前端 `generateItinerary` 用 zod 校验 → 必然 `ITINERARY_PARSE_ERROR`，
 *   用户点了「Plan My Trip」只会看到错误。只加一句"请遵守 JSON"并不能保证模型照做，
 *   所以规范化的责任放在服务端：**输入可信、输出可验**。
 *
 * 三条不可越过的边界：
 *  1. `input` 一律由**客户端请求**（经 `TravelPlanInputSchema` 校验）组装，
 *     不复用模型回显 —— 模型把目的地写成字符串或改错日期时，契约仍然正确。
 *  2. 值**非法**（日期不存在、时刻写成 25:99、费用为负/非数字）→ 整体失败，
 *     绝不"修正"成看似合理的数据。
 *  3. 活动**缺**必需字段（name/description/category/duration/timeOfDay/费用）→
 *     丢弃该条活动；一天的活动被丢光就丢掉这一天；全丢光 → 明确失败。
 *     丢弃是对"没有内容"的诚实处理，编造才是错的。
 *
 * 本模块是纯函数（无 IO、无网络），因此可以直接用线上响应的脱敏副本做回归测试。
 */

/** 一次行程最多接受的天数（防御异常输出导致的内存/渲染放大）。 */
const MAX_DAYS = 30;
/** `ItineraryDaySchema.activities` 的上限。 */
const MAX_ACTIVITIES_PER_DAY = 6;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export type NormalizeFailureCode =
  | "INVALID_REQUEST"
  | "NOT_AN_OBJECT"
  | "NO_DAYS"
  | "INVALID_DAY"
  | "INVALID_ACTIVITY"
  | "MISSING_SUMMARY"
  | "SCHEMA_MISMATCH";

export interface NormalizeStats {
  daysIn: number;
  daysOut: number;
  activitiesIn: number;
  activitiesOut: number;
  droppedActivities: number;
  /** 日期落在行程区间之外而被丢弃的天数（不改标成别的日期）。 */
  droppedDays: number;
  /** 字段改名（type→category、startTime/endTime→timeOfDay/duration 等）的次数。 */
  remappedFields: number;
}

export type NormalizeResult =
  | { ok: true; itinerary: Itinerary; stats: NormalizeStats }
  | { ok: false; code: NormalizeFailureCode; message: string };

// ── 基础校验 ──────────────────────────────────────────────────────────

/** `YYYY-MM-DD` 且是真实存在的日历日（不依赖解析器的宽松行为）。 */
export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const m = ISO_DATE.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}

/** "08:30" / "8:30" / "08:30:00" → 当天分钟数（0..1439）；非法 → null。 */
export function parseClock(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const m = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

const TIME_OF_DAY_BY_HOUR: Array<[number, Activity["timeOfDay"]]> = [
  [12 * 60, "morning"],
  [17 * 60, "afternoon"],
  [21 * 60, "evening"],
  [24 * 60, "night"],
];

/** 由当天分钟数推导时段（12 点前 morning，17 点前 afternoon，21 点前 evening，其余 night）。 */
export function deriveTimeOfDay(minutes: number): Activity["timeOfDay"] {
  for (const [limit, value] of TIME_OF_DAY_BY_HOUR) {
    if (minutes < limit) return value;
  }
  return "night";
}

const TIME_OF_DAY_VALUES: ReadonlySet<string> = new Set(["morning", "afternoon", "evening", "night"]);

/**
 * 模型常用的类别词 → 契约枚举。
 * 只做**同义映射**，不做"猜一个最像的"：映射不到就返回 null，由调用方丢弃该条。
 */
const CATEGORY_ALIASES: Record<string, TravelInterest> = {
  // food
  food: "food",
  dining: "food",
  meal: "food",
  meals: "food",
  breakfast: "food",
  lunch: "food",
  dinner: "food",
  brunch: "food",
  cafe: "food",
  coffee: "food",
  restaurant: "food",
  bar: "nightlife",
  // museums
  museum: "museums",
  museums: "museums",
  gallery: "museums",
  art: "museums",
  exhibition: "museums",
  // history
  history: "history",
  historic: "history",
  historical: "history",
  heritage: "history",
  temple: "history",
  shrine: "history",
  castle: "history",
  monument: "history",
  landmark: "history",
  architecture: "history",
  // nature
  nature: "nature",
  park: "nature",
  garden: "nature",
  outdoor: "nature",
  outdoors: "nature",
  hike: "nature",
  hiking: "nature",
  viewpoint: "nature",
  mountain: "nature",
  lake: "nature",
  // shopping
  shopping: "shopping",
  shop: "shopping",
  market: "shopping",
  boutique: "shopping",
  mall: "shopping",
  bazaar: "shopping",
  souk: "shopping",
  // nightlife
  nightlife: "nightlife",
  night: "nightlife",
  club: "nightlife",
  pub: "nightlife",
  // sports
  sport: "sports",
  sports: "sports",
  adventure: "sports",
  activity: "sports",
  kayak: "sports",
  surf: "sports",
  ski: "sports",
  cycling: "sports",
  // beaches
  beach: "beaches",
  beaches: "beaches",
  coast: "beaches",
  seaside: "beaches",
  snorkel: "beaches",
  dive: "beaches",
  diving: "beaches",
};

const INTEREST_VALUES: ReadonlySet<string> = new Set([
  "museums",
  "nature",
  "food",
  "shopping",
  "nightlife",
  "history",
  "sports",
  "beaches",
]);

/**
 * 语义含糊的类别词：只有在名称/描述也给不出关键词时才采用。
 * 例："cultural" + "Senso-ji Temple" 应判为 history，而不是笼统的 museums。
 */
const WEAK_CATEGORY_ALIASES: Record<string, TravelInterest> = {
  culture: "museums",
  cultural: "museums",
  sightseeing: "history",
  activity: "sports",
  adventure: "sports",
  entertainment: "nightlife",
  relaxation: "nature",
};

/** 名称/描述里的关键词兜底（仅在类别字段缺失或无法映射时使用，仍属证据推导）。 */
const CATEGORY_KEYWORDS: Array<[RegExp, TravelInterest]> = [
  [/\b(museum|gallery|exhibition)\b/i, "museums"],
  [/\b(temple|shrine|castle|palace|heritage|historic|monument|ruins)\b/i, "history"],
  // 餐饮排在购物之前：菜市场（Tsukiji Outer Market）多半是"吃"的场景，
  // 若先命中 shopping 会把早餐归成购物。
  [/\b(breakfast|lunch|dinner|brunch|cafe|coffee|restaurant|ramen|sushi|food|izakaya)\b/i, "food"],
  [/\b(park|garden|trail|hike|mountain|lake|viewpoint|forest)\b/i, "nature"],
  [/\b(beach|coast|snorkel|diving|surf)\b/i, "beaches"],
  [/\b(shop|boutique|mall|souvenir|stall)\b/i, "shopping"],
  [/\b(bar|pub|club|nightlife|nightcap)\b/i, "nightlife"],
  [/\b(kayak|cycling|ski|climb|sport|dive)\b/i, "sports"],
];

/**
 * 解析活动类别：契约枚举 → 别名表 → 名称/描述关键词。
 * 三步都失败返回 null（调用方丢弃该活动，不猜）。
 */
export function mapCategory(rawType: unknown, name: string, description: string): TravelInterest | null {
  let weak: TravelInterest | null = null;
  if (typeof rawType === "string") {
    const key = rawType.trim().toLowerCase();
    if (INTEREST_VALUES.has(key)) return key as TravelInterest;
    const alias = CATEGORY_ALIASES[key];
    if (alias) return alias;
    weak = WEAK_CATEGORY_ALIASES[key] ?? null;
  }
  const haystack = `${name} ${description}`;
  for (const [re, value] of CATEGORY_KEYWORDS) {
    if (re.test(haystack)) return value;
  }
  return weak;
}

/**
 * 读取"金额"类字段。
 * @returns `undefined` = 字段缺失；`null` = 存在但非法（负数/非数字/NaN）；
 *          否则为合法的非负数。
 */
export function readAmount(value: unknown): number | undefined | null {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "number") {
    return Number.isFinite(value) && value >= 0 ? value : null;
  }
  // 只接受"纯数字串"（"1200" / "12.5"）：带单位、货币符号、区间的一律判非法，
  // 不做启发式截取，避免把 "about 1200" 强行读成 1200。
  if (typeof value === "string" && /^\d+(\.\d+)?$/.test(value.trim())) {
    const n = Number(value.trim());
    return Number.isFinite(n) && n >= 0 ? n : null;
  }
  return null;
}

/**
 * 当前 JavaScript 运行时（ICU/CLDR）支持的货币代码集合。
 * 取不到时返回空集合，`isIntlSupportedCurrencyCode` 会退化成形状校验。
 *
 * 注意：这是**运行时能力**的快照，不是 ISO 4217 的完整清单 —— ICU 版本不同，
 * 集合可能略多或略少（例如个别历史/稀有代码）。不要把它当成"唯一合法币种表"。
 */
const INTL_CURRENCY_CODES: ReadonlySet<string> = (() => {
  const supportedValuesOf = (
    Intl as unknown as { supportedValuesOf?: (key: string) => string[] }
  ).supportedValuesOf;
  if (typeof supportedValuesOf !== "function") return new Set<string>();
  try {
    return new Set(supportedValuesOf.call(Intl, "currency"));
  } catch {
    return new Set<string>();
  }
})();

/**
 * 当前运行时是否有权威币种集合（即 `Intl.supportedValuesOf` 可用）。
 *
 * 为 `false` 时 `isIntlSupportedCurrencyCode` 只剩形状校验，**分不清 "USD" 与
 * "YEN"/"AAA"**，调用方不得据此采信模型给的币种（见 `normalizeItinerary`）。
 */
export function hasRuntimeCurrencyList(): boolean {
  return INTL_CURRENCY_CODES.size > 0;
}

/**
 * 该 3 位代码是否是**当前运行时支持**的货币代码（形状 + 运行时集合两道）。
 *
 * 为什么需要它：只检查 `^[A-Z]{3}$` 会把 "YEN"、"AAA" 这类词放过去（线上模型确实
 * 写过 "yen"）；而 `Intl.NumberFormat` 也**不**校验成员资格（ECMA-402 只要求三段
 * 字母，任何 well-formed 代码都能构造成功）。
 *
 * 契约边界：判定的是"运行时是否支持"，不是"ISO 4217 是否收录"。
 * 因此对被判为不支持的代码，调用方必须**回退到可信来源**（目的地本币 → USD）。
 *
 * ⚠️ 降级行为（运行时不提供 `Intl.supportedValuesOf`，`INTL_CURRENCY_CODES` 为空）：
 * 本函数退化为**纯形状校验**，此时 "YEN"、"AAA"、"ZZZ" 一律返回 `true`，
 * 只有 "yen"（小写）、"¥"、"" 这类会被拒绝。它**不能**再被描述为"能拒绝所有
 * 未受支持的币种"—— 是否可用权威集合必须先用 `hasRuntimeCurrencyList()` 判断。
 */
export function isIntlSupportedCurrencyCode(value: unknown): value is string {
  if (typeof value !== "string" || !/^[A-Z]{3}$/.test(value)) return false;
  if (INTL_CURRENCY_CODES.size === 0) return true;
  return INTL_CURRENCY_CODES.has(value);
}

/**
 * 从模型文本里取出 JSON 对象（有界、可测）。
 * 依次尝试：原文 → 去 Markdown 围栏 → 首个 `{` 到末个 `}`。
 */
export function extractJsonObject(text: unknown): { ok: true; value: unknown } | { ok: false; message: string } {
  if (typeof text !== "string" || !text.trim()) {
    return { ok: false, message: "Model returned an empty response." };
  }
  const candidates: string[] = [];
  const trimmed = text.trim();
  candidates.push(trimmed);
  const unfenced = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  if (unfenced !== trimmed) candidates.push(unfenced);
  const first = unfenced.indexOf("{");
  const last = unfenced.lastIndexOf("}");
  if (first !== -1 && last > first) candidates.push(unfenced.slice(first, last + 1));

  for (const candidate of candidates) {
    try {
      const parsed: unknown = JSON.parse(candidate);
      // 只要对象：数组/标量都不是一份行程（避免 `[1,2,3]` 这类"能解析但不是契约"的值混进来）。
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return { ok: true, value: parsed };
      }
    } catch {
      // 换下一个候选
    }
  }
  return { ok: false, message: "Model response was not valid JSON." };
}

// ── 日期推算 ──────────────────────────────────────────────────────────

/** 由可信的出发/返程日期生成逐日列表（UTC 算术，不受时区/DST 影响）。 */
export function tripDates(departureDate: string, returnDate: string): string[] {
  const start = Date.parse(`${departureDate}T00:00:00Z`);
  const end = Date.parse(`${returnDate}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return [];
  const out: string[] = [];
  for (let t = start; t <= end && out.length < MAX_DAYS; t += 86_400_000) {
    out.push(new Date(t).toISOString().slice(0, 10));
  }
  return out;
}

// ── 主流程 ────────────────────────────────────────────────────────────

interface NormalizeContext {
  /** 服务端生成，模型给的 id 一律不采信。 */
  id: string;
  createdAt: string;
  /** 目的地计价币种（模型给的代码非法时使用）。 */
  fallbackCurrency?: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function cleanText(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const s = value.trim();
  return s ? s.slice(0, max) : undefined;
}

function cleanStringList(value: unknown, max: number, cap: number): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const item of value) {
    const text = cleanText(item, max);
    if (text) out.push(text);
    if (out.length >= cap) break;
  }
  return out;
}

/**
 * 把模型输出规范化成契约对象。
 *
 * @param raw   `extractJsonObject` 得到的模型 JSON（不可信）
 * @param requestInput 客户端请求里的 `input`（**唯一**可信来源）
 */
export function normalizeItinerary(
  raw: unknown,
  requestInput: unknown,
  ctx: NormalizeContext,
): NormalizeResult {
  // ① 可信输入：必要时去掉可选的 tripItems 再校验一次（它只影响提示词，
  //    不参与返回契约；个别条目 kind 不合 schema 时不该让整次规划失败）。
  let parsedInput = TravelPlanInputSchema.safeParse(requestInput);
  const requestRecord = asRecord(requestInput);
  if (!parsedInput.success && requestRecord && "tripItems" in requestRecord) {
    const rest = { ...requestRecord };
    delete rest.tripItems;
    parsedInput = TravelPlanInputSchema.safeParse(rest);
  }
  if (!parsedInput.success) {
    return {
      ok: false,
      code: "INVALID_REQUEST",
      message: "The planning request is incomplete (destination or dates missing).",
    };
  }
  const input = parsedInput.data;

  // ② 模型输出必须是对象，且带非空 days
  const root = asRecord(raw);
  if (!root) {
    return { ok: false, code: "NOT_AN_OBJECT", message: "Model response is not a JSON object." };
  }
  const rawDays = Array.isArray(root.days) ? root.days : [];
  if (rawDays.length === 0) {
    return { ok: false, code: "NO_DAYS", message: "Model response contains no itinerary days." };
  }

  const dates = tripDates(input.departureDate, input.returnDate);
  if (dates.length === 0) {
    // 返程早于出发（或日期无法解析）：这是**请求**的问题，不是模型的问题，
    // 不该报成"模型没给行程"。路由层据此返回 400。
    return {
      ok: false,
      code: "INVALID_REQUEST",
      message: "The request has an invalid date range (return date must not be before departure).",
    };
  }

  const stats: NormalizeStats = {
    daysIn: rawDays.length,
    daysOut: 0,
    activitiesIn: 0,
    activitiesOut: 0,
    droppedActivities: 0,
    droppedDays: 0,
    remappedFields: 0,
  };

  const days: ItineraryDay[] = [];
  /** 已占用的日期：模型重复给同一天时只保留第一条（重复会让同一日期出现两遍）。 */
  const usedDates = new Set<string>();

  for (let i = 0; i < Math.min(rawDays.length, dates.length); i++) {
    const rawDay = asRecord(rawDays[i]);
    if (!rawDay) {
      return { ok: false, code: "INVALID_DAY", message: `days[${i}] is not an object.` };
    }

    // 日期：模型给了就必须是真实的日历日，并且落在这段行程里；落在区间外的
    // 一天**不**改标成别的日期（那会给用户看一个"挪过位置"的行程），直接丢弃。
    // 只有模型完全没给日期时，才用可信请求推算出的第 i 天。
    const modelDate = rawDay.date;
    let date: string;
    if (modelDate === undefined || modelDate === null || modelDate === "") {
      date = dates[i];
      stats.remappedFields++;
    } else {
      if (!isIsoDate(modelDate)) {
        return { ok: false, code: "INVALID_DAY", message: `days[${i}].date is not a valid YYYY-MM-DD date.` };
      }
      if (!dates.includes(modelDate)) {
        stats.droppedDays++;
        continue;
      }
      date = modelDate;
    }

    // 同一天出现两次（模型常见笔误）：保留第一条，避免行程里出现两个 "Nov 15"。
    if (usedDates.has(date)) {
      stats.droppedDays++;
      continue;
    }
    usedDates.add(date);

    const rawActivities = Array.isArray(rawDay.activities) ? rawDay.activities : [];
    stats.activitiesIn += rawActivities.length;

    const activities: Activity[] = [];
    /** 当日内已用 id：`DayCard` 用 `key={activity.id}`，重复 id 会让 React 复用错节点。 */
    const usedIds = new Set<string>();
    for (let j = 0; j < rawActivities.length && j < MAX_ACTIVITIES_PER_DAY; j++) {
      const rawActivity = asRecord(rawActivities[j]);
      if (!rawActivity) {
        stats.droppedActivities++;
        continue;
      }

      const name = cleanText(rawActivity.name, 120);
      const description = cleanText(rawActivity.description, 600);
      if (!name || !description) {
        stats.droppedActivities++;
        continue;
      }

      // 时长：优先 duration；否则由 startTime/endTime 推导（两处都非法 → 整体失败）。
      let duration: number | null = null;
      if (rawActivity.duration !== undefined && rawActivity.duration !== null) {
        const d = Number(rawActivity.duration);
        if (!Number.isFinite(d) || d <= 0) {
          return {
            ok: false,
            code: "INVALID_ACTIVITY",
            message: `days[${i}].activities[${j}].duration must be a positive number of minutes.`,
          };
        }
        duration = Math.round(d);
      } else if (rawActivity.startTime !== undefined || rawActivity.endTime !== undefined) {
        const start = parseClock(rawActivity.startTime);
        const end = parseClock(rawActivity.endTime);
        if (start === null || end === null || end === start) {
          return {
            ok: false,
            code: "INVALID_ACTIVITY",
            message: `days[${i}].activities[${j}] has an invalid startTime/endTime pair.`,
          };
        }
        // 跨午夜（23:00 → 00:30）按"次日结束"计算；wrap 后仍超过 6 小时，
        // 更可能是把时间写反了（10:00 → 09:00），此时明确失败而不是编一个 23 小时的活动。
        if (end < start) {
          const wrapped = end + 24 * 60 - start;
          if (wrapped > 360) {
            return {
              ok: false,
              code: "INVALID_ACTIVITY",
              message: `days[${i}].activities[${j}] spans more than 6 hours across midnight.`,
            };
          }
          duration = wrapped;
        } else {
          duration = end - start;
        }
        stats.remappedFields++;
      }
      if (duration === null) {
        stats.droppedActivities++;
        continue;
      }

      // 时段：优先契约字段；否则由 startTime 推导。
      let timeOfDay: Activity["timeOfDay"] | null = null;
      if (typeof rawActivity.timeOfDay === "string" && TIME_OF_DAY_VALUES.has(rawActivity.timeOfDay)) {
        timeOfDay = rawActivity.timeOfDay as Activity["timeOfDay"];
      } else if (rawActivity.startTime !== undefined) {
        const start = parseClock(rawActivity.startTime);
        if (start === null) {
          return {
            ok: false,
            code: "INVALID_ACTIVITY",
            message: `days[${i}].activities[${j}].startTime is not a valid HH:MM time.`,
          };
        }
        timeOfDay = deriveTimeOfDay(start);
        stats.remappedFields++;
      }
      if (timeOfDay === null) {
        stats.droppedActivities++;
        continue;
      }

      const category = mapCategory(rawActivity.category ?? rawActivity.type, name, description);
      if (!category) {
        stats.droppedActivities++;
        continue;
      }
      if (rawActivity.category === undefined && rawActivity.type !== undefined) stats.remappedFields++;

      const cost = readAmount(rawActivity.estimatedCost);
      if (cost === null) {
        return {
          ok: false,
          code: "INVALID_ACTIVITY",
          message: `days[${i}].activities[${j}].estimatedCost must be a non-negative number.`,
        };
      }
      if (cost === undefined) {
        // 契约要求费用，模型又没给：不编 0（会被读成"免费"），直接丢弃该条。
        stats.droppedActivities++;
        continue;
      }

      const address = cleanText(rawActivity.address ?? rawActivity.location, 160);
      if (address && rawActivity.address === undefined) stats.remappedFields++;
      const tip = cleanText(rawActivity.tip, 240);
      // id 只作内部标识/React key：模型缺失或重复时改用确定性的日内序号。
      let id = cleanText(rawActivity.id, 60);
      if (!id || usedIds.has(id)) {
        let n = j + 1;
        let candidate = `d${i + 1}a${n}`;
        while (usedIds.has(candidate)) candidate = `d${i + 1}a${++n}`;
        if (id) stats.remappedFields++;
        id = candidate;
      }
      usedIds.add(id);

      activities.push({
        id,
        name,
        description,
        duration,
        estimatedCost: cost,
        category,
        timeOfDay,
        ...(address ? { address } : {}),
        ...(tip ? { tip } : {}),
      });
    }

    if (activities.length === 0) continue; // 一天的活动全被丢弃 → 丢弃这一天

    const dailyCost = readAmount(rawDay.estimatedDailyCost);
    if (dailyCost === null) {
      return {
        ok: false,
        code: "INVALID_DAY",
        message: `days[${i}].estimatedDailyCost must be a non-negative number.`,
      };
    }

    const rawMeals = asRecord(rawDay.meals);
    const meals: ItineraryDay["meals"] = {};
    for (const key of ["breakfast", "lunch", "dinner"] as const) {
      const meal = cleanText(rawMeals?.[key], 120);
      if (meal) meals[key] = meal;
    }

    const notes = cleanText(rawDay.notes, 600);

    days.push({
      date,
      // 序号在排序后统一重排（模型给的天序不一定按日期）。
      dayNumber: 0,
      weather: null,
      activities,
      meals,
      estimatedDailyCost:
        dailyCost ?? activities.reduce((sum, activity) => sum + activity.estimatedCost, 0),
      ...(notes ? { notes } : {}),
    });
  }

  if (days.length === 0) {
    return { ok: false, code: "NO_DAYS", message: "Model response produced no usable itinerary days." };
  }

  // 按日期排序后重排 dayNumber：天数语义只由日期决定，不由模型给的顺序决定。
  days.sort((a, b) => a.date.localeCompare(b.date));
  days.forEach((day, index) => {
    day.dayNumber = index + 1;
  });

  const summary = cleanText(root.summary, 1200);
  if (!summary) {
    return { ok: false, code: "MISSING_SUMMARY", message: "Model response is missing a summary." };
  }

  // 币种：只有**能证明**模型值受运行时支持时才沿用（不擅自改写模型的业务输出）；
  // 否则（"yen"、"¥"、"YEN" 或运行时不认识的代码）回退到目的地本币，最后才是 USD。
  //
  // 降级语义：运行时没有 `Intl.supportedValuesOf` 时只剩形状校验，无法区分
  // "USD" 与 "YEN"/"AAA"（模型确实写过 "yen"，转大写后正好是形状合法的 "YEN"）。
  // 因此降级时**一律不采信模型值**，只走可信来源 —— 宁可用目的地本币，也不把
  // 一个不存在的币种写进用户计划（`ItinerarySchema` 只要求 3 位，挡不住）。
  const trustedFallback =
    typeof ctx.fallbackCurrency === "string" ? ctx.fallbackCurrency.trim().toUpperCase() : undefined;
  const destinationCurrency = isIntlSupportedCurrencyCode(trustedFallback) ? trustedFallback : undefined;
  const modelCurrency = typeof root.currency === "string" ? root.currency.trim().toUpperCase() : "";
  const currency =
    hasRuntimeCurrencyList() && isIntlSupportedCurrencyCode(modelCurrency)
      ? modelCurrency
      : destinationCurrency ?? "USD";

  const total = readAmount(root.totalEstimatedCost);
  if (total === null) {
    return {
      ok: false,
      code: "INVALID_DAY",
      message: "totalEstimatedCost must be a non-negative number.",
    };
  }

  const candidate: Itinerary = {
    id: ctx.id,
    createdAt: ctx.createdAt,
    input,
    days,
    totalEstimatedCost: total ?? days.reduce((sum, day) => sum + day.estimatedDailyCost, 0),
    currency,
    summary,
    packingList: cleanStringList(root.packingList, 120, 20),
    importantNotes: cleanStringList(root.importantNotes, 240, 10),
  };

  stats.daysOut = days.length;
  stats.activitiesOut = activitiesCount(days);

  // ③ 最后一道门：交付给前端的对象必须能被前端同一份 schema 接受。
  const validated = ItinerarySchema.safeParse(candidate);
  if (!validated.success) {
    const first = validated.error.issues
      .slice(0, 3)
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("; ");
    return { ok: false, code: "SCHEMA_MISMATCH", message: `Normalized itinerary failed contract: ${first}` };
  }

  return { ok: true, itinerary: validated.data, stats };
}

function activitiesCount(days: ItineraryDay[]): number {
  return days.reduce((sum, day) => sum + day.activities.length, 0);
}

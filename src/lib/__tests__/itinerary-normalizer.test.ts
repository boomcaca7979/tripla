/**
 * itinerary-normalizer — 针对**线上真实故障结构**的回归测试。
 *
 * 夹具说明：`productionShapedOutput()` 是 2026-10-28 线上 `/api/itinerary` 实际
 * 返回结构的脱敏副本（真值已替换，字段形状保持一致）。它是**模拟模型响应**，
 * 仅用于验证本地规范化逻辑，**不能作为真实 AI 服务已通过的证据**。
 */

import { describe, expect, it, vi } from "vitest";
import type { TravelPlanInput } from "@/types/itinerary";
import { ItinerarySchema } from "@/lib/schemas";
import {
  deriveTimeOfDay,
  extractJsonObject,
  isIntlSupportedCurrencyCode,
  isIsoDate,
  mapCategory,
  normalizeItinerary,
  parseClock,
  readAmount,
  tripDates,
} from "@/lib/itinerary-normalizer";

// ── 夹具：可信请求（客户端的 input） ──────────────────────────────────

const DESTINATION = {
  iata: "NRT",
  icao: "RJAA",
  name: "Narita International Airport",
  city: "Tokyo",
  country: "Japan",
  timezone: "Asia/Tokyo",
  latitude: 35.7647,
  longitude: 140.3864,
};

function requestInput(overrides: Partial<TravelPlanInput> = {}): TravelPlanInput {
  return {
    destination: DESTINATION,
    departureDate: "2026-11-15",
    returnDate: "2026-11-18",
    travelStyle: "cultural",
    budgetLevel: "mid-range",
    interests: ["museums", "food"],
    groupSize: 2,
    ...overrides,
  };
}

const CTX = { id: "itin-normalized-1", createdAt: "2026-10-28T06:00:00.000Z", fallbackCurrency: "JPY" };

// ── 夹具：线上观察到的模型输出（脱敏 · 模拟） ─────────────────────────

function productionShapedOutput() {
  return {
    id: "mvrplqlh7m8e1og99dy",
    createdAt: "2026-10-28T06:04:13.925Z",
    // 线上真实故障点 1：destination 是字符串，不是机场对象
    input: {
      destination: "Tokyo, Japan (NRT)",
      travelDates: { start: "2026-11-15", end: "2026-11-18" },
      travelers: 2,
      travelStyle: "cultural",
      budget: "mid-range",
      interests: ["museums", "food"],
    },
    // 真实故障点 3/4：缺 dayNumber，活动用 type/startTime/endTime/location
    days: [
      {
        date: "2026-11-15",
        weatherCode: 0,
        activities: [
          {
            name: "Breakfast at Tsukiji Outer Market",
            type: "food",
            startTime: "08:30",
            endTime: "09:30",
            location: "Tsukiji, Chuo-ku",
            estimatedCost: 1000,
            description: "Sample fresh sushi and grilled seafood at the stalls.",
          },
          {
            name: "Senso-ji Temple visit",
            type: "cultural",
            startTime: "10:00",
            endTime: "11:30",
            location: "Asakusa, Taito-ku",
            estimatedCost: 0,
            description: "Tokyo's oldest Buddhist temple and Nakamise street.",
          },
        ],
      },
      {
        date: "2026-11-16",
        activities: [
          {
            name: "Tokyo National Museum",
            type: "museum",
            startTime: "14:00",
            endTime: "16:00",
            location: "Ueno Park, Taito-ku",
            estimatedCost: 620,
            description: "Japanese art and archaeology in Ueno Park.",
          },
        ],
      },
      {
        date: "2026-11-17",
        activities: [
          {
            name: "Shibuya Sky observation deck",
            type: "viewpoint",
            startTime: "17:30",
            endTime: "19:00",
            location: "Shibuya Scramble Square",
            estimatedCost: 2500,
            description: "Open-air rooftop deck above Shibuya Crossing.",
          },
        ],
      },
    ],
    totalEstimatedCost: 4120,
    currency: "JPY",
    summary: "Three days balancing market food, museums and a rooftop sunset.",
    packingList: ["Passport", "IC card"],
    importantNotes: ["Suica works on trains and buses."],
  };
}

// ── 基础工具 ──────────────────────────────────────────────────────────

describe("itinerary-normalizer — 基础校验", () => {
  it("isIsoDate 只接受真实存在的 YYYY-MM-DD", () => {
    expect(isIsoDate("2026-11-15")).toBe(true);
    expect(isIsoDate("2026-02-31")).toBe(false);
    expect(isIsoDate("2026-11-1")).toBe(false);
    expect(isIsoDate("")).toBe(false);
    expect(isIsoDate(20261115)).toBe(false);
  });

  it("parseClock 接受 HH:MM / H:MM / HH:MM:SS，拒绝越界与乱码", () => {
    expect(parseClock("08:30")).toBe(510);
    expect(parseClock("8:30")).toBe(510);
    expect(parseClock("08:30:00")).toBe(510);
    expect(parseClock("25:99")).toBeNull();
    expect(parseClock("morning")).toBeNull();
    expect(parseClock(830)).toBeNull();
  });

  it("deriveTimeOfDay 按小时落区间", () => {
    expect(deriveTimeOfDay(0)).toBe("morning");
    expect(deriveTimeOfDay(11 * 60 + 59)).toBe("morning");
    expect(deriveTimeOfDay(12 * 60)).toBe("afternoon");
    expect(deriveTimeOfDay(17 * 60)).toBe("evening");
    expect(deriveTimeOfDay(21 * 60)).toBe("night");
  });

  it("mapCategory：契约枚举 → 别名 → 关键词，都失败则 null", () => {
    expect(mapCategory("museums", "", "")).toBe("museums");
    expect(mapCategory("cultural", "", "")).toBe("museums");
    expect(mapCategory("viewpoint", "", "")).toBe("nature");
    expect(mapCategory("Breakfast", "", "")).toBe("food");
    expect(mapCategory(undefined, "Tsukiji Outer Market", "fresh sushi")).toBe("food");
    expect(mapCategory(undefined, "Rooftop bar", "nightcap")).toBe("nightlife");
    expect(mapCategory("quantum", "", "")).toBeNull();
    expect(mapCategory(undefined, "???", "???")).toBeNull();
  });

  it("isIntlSupportedCurrencyCode 只接受运行时支持的三字母货币代码", () => {
    expect(isIntlSupportedCurrencyCode("JPY")).toBe(true);
    expect(isIntlSupportedCurrencyCode("USD")).toBe(true);
    expect(isIntlSupportedCurrencyCode("EUR")).toBe(true);
    expect(isIntlSupportedCurrencyCode("XPF")).toBe(true);
    expect(isIntlSupportedCurrencyCode("YEN")).toBe(false); // 3 个大写字母，但不在运行时集合里
    expect(isIntlSupportedCurrencyCode("AAA")).toBe(false); // 任意三字母也不该通过
    expect(isIntlSupportedCurrencyCode("yen")).toBe(false);
    expect(isIntlSupportedCurrencyCode("¥")).toBe(false);
    expect(isIntlSupportedCurrencyCode("")).toBe(false);
    expect(isIntlSupportedCurrencyCode(undefined)).toBe(false);
  });

  it("readAmount 只接受数字与纯数字串", () => {    expect(readAmount(1200)).toBe(1200);
    expect(readAmount("1200")).toBe(1200);
    expect(readAmount("12.5")).toBe(12.5);
    expect(readAmount(undefined)).toBeUndefined();
    expect(readAmount("")).toBeUndefined();
    expect(readAmount(-5)).toBeNull();
    expect(readAmount("about 1200")).toBeNull();
    expect(readAmount("¥1,200")).toBeNull();
    expect(readAmount(Number.NaN)).toBeNull();
  });

  it("tripDates 按 UTC 逐日展开，跨月也正确", () => {
    expect(tripDates("2026-11-15", "2026-11-18")).toEqual([
      "2026-11-15",
      "2026-11-16",
      "2026-11-17",
      "2026-11-18",
    ]);
    expect(tripDates("2026-12-31", "2027-01-02")).toEqual(["2026-12-31", "2027-01-01", "2027-01-02"]);
    expect(tripDates("2026-11-18", "2026-11-15")).toEqual([]);
  });
});

// ── JSON 提取 ─────────────────────────────────────────────────────────

describe("extractJsonObject", () => {
  it("直接 JSON", () => {
    const r = extractJsonObject('{"a":1}');
    expect(r.ok && (r.value as { a: number }).a).toBe(1);
  });

  it("Markdown 围栏", () => {
    const r = extractJsonObject('```json\n{"a":2}\n```');
    expect(r.ok && (r.value as { a: number }).a).toBe(2);
  });

  it("前后带散文（有界截取首个 { 到末个 }）", () => {
    const r = extractJsonObject('Here is your plan:\n{"a":3}\nEnjoy!');
    expect(r.ok && (r.value as { a: number }).a).toBe(3);
  });

  it("空响应 / 非 JSON / 数组都判失败", () => {
    expect(extractJsonObject("").ok).toBe(false);
    expect(extractJsonObject("not json at all").ok).toBe(false);
    expect(extractJsonObject("[1,2,3]").ok).toBe(false);
    expect(extractJsonObject(null).ok).toBe(false);
  });
});

// ── 线上结构 → 契约 ───────────────────────────────────────────────────

describe("normalizeItinerary — 线上真实结构", () => {
  it("把线上观察到的结构规范化为通过 ItinerarySchema 的对象", () => {
    const result = normalizeItinerary(productionShapedOutput(), requestInput(), CTX);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.message);

    const parsed = ItinerarySchema.safeParse(result.itinerary);
    expect(parsed.success).toBe(true);

    const plan = result.itinerary;
    // input 来自可信请求，而不是模型回显的字符串
    expect(plan.input.destination.city).toBe("Tokyo");
    expect(plan.input.destination.iata).toBe("NRT");
    expect(plan.input.departureDate).toBe("2026-11-15");
    expect(plan.input.returnDate).toBe("2026-11-18");
    expect(plan.input.budgetLevel).toBe("mid-range");
    expect(plan.input.groupSize).toBe(2);
    expect(plan.input.travelStyle).toBe("cultural");
    expect(plan.input.interests).toEqual(["museums", "food"]);

    // dayNumber 由顺序补齐
    expect(plan.days.map((d) => d.dayNumber)).toEqual([1, 2, 3]);

    // 活动字段改名映射
    const first = plan.days[0].activities[0];
    expect(first.category).toBe("food");
    expect(first.timeOfDay).toBe("morning");
    expect(first.duration).toBe(60); // 08:30 → 09:30
    expect(first.address).toBe("Tsukiji, Chuo-ku");
    expect(first.estimatedCost).toBe(1000);

    const second = plan.days[0].activities[1];
    expect(second.category).toBe("history"); // "cultural" + "Temple" → history（关键词优先于含糊别名）
    expect(second.timeOfDay).toBe("morning");
    expect(second.duration).toBe(90);

    const sunset = plan.days[2].activities[0];
    expect(sunset.timeOfDay).toBe("evening"); // 17:30
    expect(sunset.category).toBe("nature"); // "viewpoint"

    // 统计：3 天全部保留，字段改名的确有发生
    expect(result.stats.daysIn).toBe(3);
    expect(result.stats.daysOut).toBe(3);
    expect(result.stats.droppedActivities).toBe(0);
    expect(result.stats.remappedFields).toBeGreaterThan(0);
  });

  it("模型把 destination 写成字符串时，最终 input 仍由可信请求组装", () => {
    const raw = productionShapedOutput();
    raw.input.destination = "Somewhere else entirely";
    raw.input.travelDates = { start: "2020-01-01", end: "2020-01-02" };

    const result = normalizeItinerary(raw, requestInput(), CTX);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.message);
    expect(result.itinerary.input.destination.city).toBe("Tokyo");
    expect(result.itinerary.input.departureDate).toBe("2026-11-15");
  });

  it("完整契约结构（模型照做时）原样通过，零丢弃", () => {
    const contractShaped = {
      days: [
        {
          date: "2026-11-15",
          dayNumber: 1,
          weather: null,
          activities: [
            {
              id: "a1",
              name: "Senso-ji Temple",
              description: "Oldest temple in Tokyo.",
              duration: 90,
              estimatedCost: 0,
              category: "history",
              timeOfDay: "morning",
              address: "2-3-1 Asakusa",
              tip: "Go before 9am",
            },
          ],
          meals: { breakfast: "Onigiri", dinner: "Ramen" },
          estimatedDailyCost: 1500,
          notes: "Keep day 1 local.",
        },
      ],
      totalEstimatedCost: 1500,
      currency: "JPY",
      summary: "A compact Tokyo day.",
      packingList: ["Passport"],
      importantNotes: ["No tipping."],
    };

    const result = normalizeItinerary(contractShaped, requestInput(), CTX);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.message);
    expect(result.stats.droppedActivities).toBe(0);
    expect(result.itinerary.days[0].meals).toEqual({ breakfast: "Onigiri", dinner: "Ramen" });
    expect(result.itinerary.days[0].notes).toBe("Keep day 1 local.");
    expect(result.itinerary.days[0].activities[0].tip).toBe("Go before 9am");
  });
});

// ── 缺失与非法：不得伪造，也不得静默成功 ──────────────────────────────

describe("normalizeItinerary — 缺字段与非法值", () => {
  function withDays(days: unknown[]) {
    return { ...productionShapedOutput(), days };
  }

  it("活动缺 name → 丢弃该条，其余保留（不编名字）", () => {
    const raw = withDays([
      {
        date: "2026-11-15",
        activities: [
          { type: "food", startTime: "08:00", endTime: "09:00", estimatedCost: 500, description: "x" },
          {
            name: "Kept",
            type: "museum",
            startTime: "10:00",
            endTime: "11:00",
            estimatedCost: 500,
            description: "kept",
          },
        ],
      },
    ]);
    const result = normalizeItinerary(raw, requestInput(), CTX);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.message);
    expect(result.itinerary.days[0].activities).toHaveLength(1);
    expect(result.itinerary.days[0].activities[0].name).toBe("Kept");
    expect(result.stats.droppedActivities).toBe(1);
  });

  it("活动缺 estimatedCost → 丢弃（不写 0 假装免费）", () => {
    const raw = withDays([
      {
        date: "2026-11-15",
        activities: [{ name: "No cost", type: "museum", startTime: "10:00", endTime: "11:00", description: "d" }],
      },
    ]);
    const result = normalizeItinerary(raw, requestInput(), CTX);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("NO_DAYS"); // 唯一一条被丢弃 → 没有可用的天
  });

  it("某天活动全被丢弃 → 丢弃该天；全部丢弃 → NO_DAYS 明确失败", () => {
    const raw = withDays([
      { date: "2026-11-15", activities: [{ name: "", description: "" }] },
      { date: "2026-11-16", activities: [] },
    ]);
    const result = normalizeItinerary(raw, requestInput(), CTX);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("NO_DAYS");
  });

  it("日期非法（2026-02-31）→ INVALID_DAY", () => {
    const raw = withDays([
      {
        date: "2026-02-31",
        activities: [{ name: "A", type: "museum", startTime: "10:00", endTime: "11:00", estimatedCost: 0, description: "d" }],
      },
    ]);
    const result = normalizeItinerary(raw, requestInput(), CTX);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("INVALID_DAY");
  });

  it("startTime/endTime 非法 → INVALID_ACTIVITY", () => {
    const raw = withDays([
      {
        date: "2026-11-15",
        activities: [{ name: "A", type: "museum", startTime: "25:99", endTime: "11:00", estimatedCost: 0, description: "d" }],
      },
    ]);
    const result = normalizeItinerary(raw, requestInput(), CTX);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("INVALID_ACTIVITY");
  });

  it("费用为负 / 带单位 → INVALID_ACTIVITY", () => {
    const negative = withDays([
      {
        date: "2026-11-15",
        activities: [{ name: "A", type: "museum", startTime: "10:00", endTime: "11:00", estimatedCost: -10, description: "d" }],
      },
    ]);
    const r1 = normalizeItinerary(negative, requestInput(), CTX);
    expect(r1.ok).toBe(false);
    if (!r1.ok) expect(r1.code).toBe("INVALID_ACTIVITY");

    const withUnit = withDays([
      {
        date: "2026-11-15",
        activities: [{ name: "A", type: "museum", startTime: "10:00", endTime: "11:00", estimatedCost: "¥1,200", description: "d" }],
      },
    ]);
    const r2 = normalizeItinerary(withUnit, requestInput(), CTX);
    expect(r2.ok).toBe(false);
    if (!r2.ok) expect(r2.code).toBe("INVALID_ACTIVITY");
  });

  it("没有 days / 不是对象 / 缺 summary → 各自明确失败", () => {
    const noDays = { ...productionShapedOutput(), days: [] };
    const r1 = normalizeItinerary(noDays, requestInput(), CTX);
    expect(r1.ok).toBe(false);
    if (!r1.ok) expect(r1.code).toBe("NO_DAYS");

    const notObject = normalizeItinerary("nope", requestInput(), CTX);
    expect(notObject.ok).toBe(false);
    if (!notObject.ok) expect(notObject.code).toBe("NOT_AN_OBJECT");

    const noSummary = { ...productionShapedOutput(), summary: "   " };
    const r3 = normalizeItinerary(noSummary, requestInput(), CTX);
    expect(r3.ok).toBe(false);
    if (!r3.ok) expect(r3.code).toBe("MISSING_SUMMARY");
  });

  it("请求缺少目的地/日期 → INVALID_REQUEST（不进入规范化）", () => {
    const r = normalizeItinerary(productionShapedOutput(), { destination: { city: "Tokyo" } }, CTX);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("INVALID_REQUEST");
  });

  it("日期落在行程区间之外的一天被丢弃（不改标成别的日期）", () => {
    const raw = {
      ...productionShapedOutput(),
      days: [
        ...productionShapedOutput().days,
        {
          date: "2026-11-19",
          activities: [
            { name: "Extra", type: "museum", startTime: "10:00", endTime: "11:00", estimatedCost: 0, description: "d" },
          ],
        },
      ],
    };
    const result = normalizeItinerary(raw, requestInput(), CTX);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.message);
    expect(result.itinerary.days).toHaveLength(3);
    expect(result.itinerary.days.map((d) => d.date)).toEqual(["2026-11-15", "2026-11-16", "2026-11-17"]);
    expect(result.stats.droppedDays).toBe(1);
  });

  it("天序乱序时按日期排序，并重排 dayNumber", () => {
    const source = productionShapedOutput().days;
    const raw = { ...productionShapedOutput(), days: [source[2], source[0], source[1]] };
    const result = normalizeItinerary(raw, requestInput(), CTX);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.message);
    expect(result.itinerary.days.map((d) => d.date)).toEqual(["2026-11-15", "2026-11-16", "2026-11-17"]);
    expect(result.itinerary.days.map((d) => d.dayNumber)).toEqual([1, 2, 3]);
  });

  it("同一日期出现两次 → 只保留第一条（行程里不该有两个 Nov 15）", () => {
    const raw = {
      ...productionShapedOutput(),
      days: [
        { date: "2026-11-15", activities: [{ name: "First", type: "museum", startTime: "10:00", endTime: "11:00", estimatedCost: 0, description: "d" }] },
        { date: "2026-11-15", activities: [{ name: "Duplicate", type: "museum", startTime: "14:00", endTime: "15:00", estimatedCost: 0, description: "d" }] },
        { date: "2026-11-16", activities: [{ name: "Next day", type: "museum", startTime: "10:00", endTime: "11:00", estimatedCost: 0, description: "d" }] },
      ],
    };
    const result = normalizeItinerary(raw, requestInput(), CTX);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.message);
    expect(result.itinerary.days.map((d) => d.date)).toEqual(["2026-11-15", "2026-11-16"]);
    expect(result.itinerary.days[0].activities.map((a) => a.name)).toEqual(["First"]);
    expect(result.stats.droppedDays).toBe(1);
  });

  it("跨午夜时段按次日结束计算（23:00 → 00:30 = 90 分钟）", () => {
    const raw = {
      ...productionShapedOutput(),
      days: [
        {
          date: "2026-11-15",
          activities: [
            { name: "Golden Gai bar crawl", type: "bar", startTime: "23:00", endTime: "00:30", estimatedCost: 3000, description: "Late-night izakaya hopping." },
          ],
        },
      ],
    };
    const result = normalizeItinerary(raw, requestInput(), CTX);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.message);
    const activity = result.itinerary.days[0].activities[0];
    expect(activity.duration).toBe(90);
    expect(activity.timeOfDay).toBe("night");
  });

  it("跨午夜但时长离谱（10:00 → 09:00）→ INVALID_ACTIVITY，不编出 23 小时活动", () => {
    const raw = {
      ...productionShapedOutput(),
      days: [
        {
          date: "2026-11-15",
          activities: [
            { name: "Reversed pair", type: "museum", startTime: "10:00", endTime: "09:00", estimatedCost: 0, description: "d" },
          ],
        },
      ],
    };
    const result = normalizeItinerary(raw, requestInput(), CTX);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("INVALID_ACTIVITY");
  });

  it("同一天内活动 id 重复 → 去重（DayCard 用 id 作 React key）", () => {
    const raw = {
      ...productionShapedOutput(),
      days: [
        {
          date: "2026-11-15",
          activities: [
            { id: "a1", name: "A", type: "museum", startTime: "10:00", endTime: "11:00", estimatedCost: 0, description: "d" },
            { id: "a1", name: "B", type: "museum", startTime: "14:00", endTime: "15:00", estimatedCost: 0, description: "d" },
          ],
        },
      ],
    };
    const result = normalizeItinerary(raw, requestInput(), CTX);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.message);
    const ids = result.itinerary.days[0].activities.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("返程早于出发 → INVALID_REQUEST（请求问题，不是模型问题）", () => {
    const result = normalizeItinerary(
      productionShapedOutput(),
      requestInput({ departureDate: "2026-11-18", returnDate: "2026-11-15" }),
      CTX,
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("INVALID_REQUEST");
  });

  it("币种：模型给受支持代码就沿用（不擅自改写），不支持才回退目的地本币", () => {
    const usd = normalizeItinerary(
      { ...productionShapedOutput(), currency: "USD" },
      requestInput(),
      CTX, // fallbackCurrency = JPY
    );
    expect(usd.ok).toBe(true);
    if (!usd.ok) throw new Error(usd.message);
    expect(usd.itinerary.currency).toBe("USD");

    const bogus = normalizeItinerary({ ...productionShapedOutput(), currency: "yen" }, requestInput(), CTX);
    expect(bogus.ok).toBe(true);
    if (!bogus.ok) throw new Error(bogus.message);
    expect(bogus.itinerary.currency).toBe("JPY");

    // 形状合法但运行时集合里没有（"AAA"）：同样不得透传模型值
    const unknownCode = normalizeItinerary(
      { ...productionShapedOutput(), currency: "AAA" },
      requestInput(),
      CTX,
    );
    expect(unknownCode.ok).toBe(true);
    if (!unknownCode.ok) throw new Error(unknownCode.message);
    expect(unknownCode.itinerary.currency).toBe("JPY");

    const noFallback = normalizeItinerary(
      { ...productionShapedOutput(), currency: "yen" },
      requestInput(),
      { id: "x", createdAt: "2026-10-28T00:00:00.000Z" },
    );
    expect(noFallback.ok).toBe(true);
    if (!noFallback.ok) throw new Error(noFallback.message);
    expect(noFallback.itinerary.currency).toBe("USD");
  });
});

// ── 降级分支：运行时没有 Intl.supportedValuesOf ────────────────────────
//
// 这里必须**真的**让 `Intl.supportedValuesOf` 消失后再 import 模块，否则测到的
// 仍是当前运行时那 162 条 ICU 集合，等于没测降级分支。`vi.resetModules()` 负责
// 让模块级常量（INTL_CURRENCY_CODES）在删除 API 之后重新求值。

describe("降级分支：运行时缺少 Intl.supportedValuesOf", () => {
  const intl = Intl as unknown as { supportedValuesOf?: (key: string) => string[] };

  /** 删除 API → 重新求值模块 → 断言确实进了降级分支 → 立刻恢复 API（不影响其他用例）。 */
  async function loadDegradedModule() {
    const saved = intl.supportedValuesOf;
    expect(typeof saved).toBe("function"); // 前提：当前运行时本就有该 API
    delete intl.supportedValuesOf;
    try {
      vi.resetModules();
      const mod = await import("@/lib/itinerary-normalizer");
      // 降级指纹：形状合法但运行时集合里没有的 "AAA" 会被放过；正常模式下它是 false。
      expect(mod.hasRuntimeCurrencyList()).toBe(false);
      expect(mod.isIntlSupportedCurrencyCode("AAA")).toBe(true);
      return mod;
    } finally {
      intl.supportedValuesOf = saved; // 模块内的集合已求值为空，恢复全局不会影响它
    }
  }

  it("只做形状校验：YEN / AAA 会被放过（这是限制，不是能力）", async () => {
    const { isIntlSupportedCurrencyCode, hasRuntimeCurrencyList } = await loadDegradedModule();
    expect(hasRuntimeCurrencyList()).toBe(false);

    // 合法且常用的代码仍然通过
    expect(isIntlSupportedCurrencyCode("USD")).toBe(true);
    expect(isIntlSupportedCurrencyCode("JPY")).toBe(true);
    expect(isIntlSupportedCurrencyCode("EUR")).toBe(true);

    // ⚠️ 已知限制：分不清真币种与三字母垃圾
    expect(isIntlSupportedCurrencyCode("YEN")).toBe(true);
    expect(isIntlSupportedCurrencyCode("AAA")).toBe(true);

    // 形状不合法的一律拒绝
    expect(isIntlSupportedCurrencyCode("yen")).toBe(false);
    expect(isIntlSupportedCurrencyCode("usd")).toBe(false);
    expect(isIntlSupportedCurrencyCode("¥")).toBe(false);
    expect(isIntlSupportedCurrencyCode("")).toBe(false);
    expect(isIntlSupportedCurrencyCode(undefined)).toBe(false);
  });

  it("降级时不采信模型币种：yen / YEN / AAA / USD 一律落到目的地本币", async () => {
    const { normalizeItinerary } = await loadDegradedModule();

    for (const currency of ["yen", "YEN", "AAA", "USD"]) {
      const result = normalizeItinerary(
        { ...productionShapedOutput(), currency },
        requestInput(),
        CTX, // fallbackCurrency = JPY
      );
      expect(result.ok, `currency=${currency} 应能规范化`).toBe(true);
      if (!result.ok) throw new Error(result.message);
      // 关键断言：绝不出现 "YEN" / "AAA"
      expect(result.itinerary.currency, `currency=${currency}`).toBe("JPY");
    }
  });

  it("降级 + 无目的地上下文 → USD（不猜模型值）", async () => {
    const { normalizeItinerary } = await loadDegradedModule();
    const result = normalizeItinerary(
      { ...productionShapedOutput(), currency: "AAA" },
      requestInput(),
      { id: "x", createdAt: "2026-10-28T00:00:00.000Z" },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.message);
    expect(result.itinerary.currency).toBe("USD");
  });

  it("目的地本币大小写不敏感：小写 jpy 仍回退到 JPY，不误退 USD", async () => {
    const { normalizeItinerary } = await loadDegradedModule();
    const result = normalizeItinerary(
      { ...productionShapedOutput(), currency: "yen" },
      requestInput(),
      { id: "x", createdAt: "2026-10-28T00:00:00.000Z", fallbackCurrency: "jpy" },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.message);
    expect(result.itinerary.currency).toBe("JPY");
  });
});

/**
 * 分享载荷 — 解码与「必要字段」门禁测试。
 *
 * 这组测试钉住两件容易被拆散的事：
 *
 *  1. **向后兼容**：`z1.` 压缩格式与更早的无前缀 base64 格式都必须仍能解码
 *     （老分享链接不作废）。
 *  2. **门禁同源**：缺 input / 目的地 / 日期，或日期不是真实日历日时，
 *     `/share` 的展示判据与 `savePageItinerary` 的保存判据必须给出**同一个**
 *     结论 —— 否则会出现"页面能看、点保存才失败"，或反过来的更糟情况：
 *     展示了 `Invalid Date — Invalid Date` 之后还能存出一条无日期的 Trip。
 *
 * 这里不测组件渲染（仓库没有 jsdom/RTL 设施），而是测组件实际调用的那个判据。
 */

import { describe, expect, it } from "vitest";
import type { Itinerary } from "@/types/itinerary";
import { decodeShareData, encodeShareData } from "@/lib/share";
import {
  isDisplayableItinerary,
  isValidIsoDate,
  tripInputIssue,
} from "@/lib/itinerary-input";

// ── 夹具 ──────────────────────────────────────────────────────────────

function validItinerary(): Itinerary {
  return {
    id: "share-fixture-1",
    createdAt: "2026-10-28T00:00:00.000Z",
    input: {
      destination: {
        iata: "NRT",
        icao: "RJAA",
        name: "Narita International Airport",
        city: "Tokyo",
        country: "Japan",
        timezone: "Asia/Tokyo",
        latitude: 35.7647,
        longitude: 140.3864,
      },
      departureDate: "2026-11-15",
      returnDate: "2026-11-18",
      travelStyle: "cultural",
      budgetLevel: "mid-range",
      interests: ["museums", "food"],
      groupSize: 1,
    },
    days: [
      {
        date: "2026-11-15",
        dayNumber: 1,
        weather: null,
        activities: [
          {
            id: "a1",
            name: "Senso-ji Temple",
            description: "Tokyo's oldest temple.",
            duration: 90,
            estimatedCost: 0,
            category: "history",
            timeOfDay: "morning",
          },
        ],
        meals: {},
        estimatedDailyCost: 0,
      },
    ],
    totalEstimatedCost: 0,
    currency: "JPY",
    summary: "A short Tokyo plan used by the share-payload tests.",
    packingList: ["Passport"],
    importantNotes: ["Tipping is not customary in Japan."],
  };
}

/** 旧格式：无前缀 base64（`decodeShareData` 的向后兼容分支）。 */
function legacyPayload(itinerary: Itinerary): string {
  const json = JSON.stringify({ itinerary });
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function withInput(patch: Record<string, unknown>): Itinerary {
  const base = validItinerary();
  return { ...base, input: { ...base.input, ...patch } } as unknown as Itinerary;
}

// ── 日期合法性 ────────────────────────────────────────────────────────

describe("isValidIsoDate", () => {
  it("接受真实存在的 YYYY-MM-DD", () => {
    expect(isValidIsoDate("2026-11-15")).toBe(true);
    expect(isValidIsoDate("2028-02-29")).toBe(true); // 闰年
  });

  it("拒绝被宽松解析成别的日子的字符串（2026-02-31 不能滚到 3 月）", () => {
    expect(isValidIsoDate("2026-02-31")).toBe(false);
    expect(isValidIsoDate("2027-02-29")).toBe(false);
    expect(isValidIsoDate("2026-13-01")).toBe(false);
    expect(isValidIsoDate("2026-00-10")).toBe(false);
  });

  it("拒绝非 ISO 形状与空值", () => {
    expect(isValidIsoDate("2026-11-1")).toBe(false);
    expect(isValidIsoDate("15/11/2026")).toBe(false);
    expect(isValidIsoDate("tomorrow")).toBe(false);
    expect(isValidIsoDate("")).toBe(false);
    expect(isValidIsoDate(null)).toBe(false);
    expect(isValidIsoDate(20261115)).toBe(false);
  });
});

// ── 必要字段门禁 ──────────────────────────────────────────────────────

describe("tripInputIssue — 与 savePageItinerary 共用的必要字段规则", () => {
  it("有效行程 → 无问题", () => {
    expect(tripInputIssue(validItinerary())).toBeNull();
    expect(isDisplayableItinerary(validItinerary())).toBe(true);
  });

  it("缺 input（整个对象没有）→ MISSING_INPUT", () => {
    const broken = { ...validItinerary(), input: undefined } as unknown as Itinerary;
    expect(tripInputIssue(broken)?.code).toBe("MISSING_INPUT");
    expect(isDisplayableItinerary(broken)).toBe(false);
  });

  it("null / undefined 载荷 → MISSING_INPUT（不抛异常）", () => {
    expect(tripInputIssue(null)?.code).toBe("MISSING_INPUT");
    expect(tripInputIssue(undefined)?.code).toBe("MISSING_INPUT");
  });

  it("缺 destination → MISSING_DESTINATION", () => {
    const broken = { ...validItinerary(), input: { ...validItinerary().input, destination: undefined } } as unknown as Itinerary;
    expect(tripInputIssue(broken)?.code).toBe("MISSING_DESTINATION");
    expect(isDisplayableItinerary(broken)).toBe(false);
  });

  it("destination 存在但 city/name 都为空 → MISSING_DESTINATION（否则保存时会 toLowerCase 抛错）", () => {
    const broken = withInput({ destination: { city: "   ", name: "" } });
    expect(tripInputIssue(broken)?.code).toBe("MISSING_DESTINATION");
  });

  it("缺出发日期 → MISSING_DATES", () => {
    const broken = withInput({ departureDate: "" });
    expect(tripInputIssue(broken)?.code).toBe("MISSING_DATES");
    expect(isDisplayableItinerary(broken)).toBe(false);
  });

  it("缺返程日期 → MISSING_DATES", () => {
    const broken = withInput({ returnDate: "" });
    expect(tripInputIssue(broken)?.code).toBe("MISSING_DATES");
    expect(isDisplayableItinerary(broken)).toBe(false);
  });

  it("日期字段整个不存在 → MISSING_DATES", () => {
    const broken = withInput({ departureDate: undefined, returnDate: undefined });
    expect(tripInputIssue(broken)?.code).toBe("MISSING_DATES");
  });

  it("无效日期字符串 → INVALID_DATE（出发/返程分别检查）", () => {
    expect(tripInputIssue(withInput({ departureDate: "2026-02-31" }))?.code).toBe("INVALID_DATE");
    expect(tripInputIssue(withInput({ returnDate: "not-a-date" }))?.code).toBe("INVALID_DATE");
    expect(tripInputIssue(withInput({ departureDate: "2026-11-1" }))?.code).toBe("INVALID_DATE");
  });

  it("展示判据与保存判据同源：坏载荷一律 false / 非 null，好载荷一律 true / null", () => {
    const samples: Array<Itinerary | null> = [
      validItinerary(),
      null,
      { ...validItinerary(), input: undefined } as unknown as Itinerary,
      withInput({ departureDate: "" }),
      withInput({ returnDate: "" }),
      withInput({ departureDate: "2026-02-31" }),
      withInput({ destination: undefined }),
    ];
    for (const sample of samples) {
      expect(isDisplayableItinerary(sample)).toBe(tripInputIssue(sample) === null);
    }
  });
});

// ── 解码兼容性 ────────────────────────────────────────────────────────

describe("decodeShareData — 两种既有格式都要能读", () => {
  it("旧格式（无前缀 base64）仍可解码，且通过门禁", async () => {
    const decoded = await decodeShareData(legacyPayload(validItinerary()));
    expect(decoded).not.toBeNull();
    expect(decoded?.itinerary.input.departureDate).toBe("2026-11-15");
    expect(decoded?.itinerary.days).toHaveLength(1);
    expect(isDisplayableItinerary(decoded?.itinerary)).toBe(true);
  });

  it("新格式（z1. 压缩）编解码往返一致，且通过门禁", async () => {
    const encoded = await encodeShareData({ itinerary: validItinerary() });
    // 有 CompressionStream 的运行时必须真的用上前缀（否则说明退化成了旧格式）
    expect(encoded.startsWith("z1.")).toBe(true);
    const decoded = await decodeShareData(encoded);
    expect(decoded?.itinerary.id).toBe("share-fixture-1");
    expect(decoded?.itinerary.input.returnDate).toBe("2026-11-18");
    expect(isDisplayableItinerary(decoded?.itinerary)).toBe(true);
  });

  it("旧格式里缺日期的载荷：能解码，但门禁必须拦下（不再进展示层）", async () => {
    const broken = withInput({ departureDate: "", returnDate: "" });
    const decoded = await decodeShareData(legacyPayload(broken));
    expect(decoded).not.toBeNull();
    expect(tripInputIssue(decoded?.itinerary)?.code).toBe("MISSING_DATES");
    expect(isDisplayableItinerary(decoded?.itinerary)).toBe(false);
  });

  it("压缩载荷里缺日期的载荷：能解码，但门禁必须拦下", async () => {
    const broken = withInput({ departureDate: "2026-02-31" });
    const encoded = await encodeShareData({ itinerary: broken });
    const decoded = await decodeShareData(encoded);
    expect(decoded).not.toBeNull();
    expect(tripInputIssue(decoded?.itinerary)?.code).toBe("INVALID_DATE");
  });

  it("损坏的 data 参数 → null（走既有 'Could Not Load Itinerary'，不抛异常）", async () => {
    await expect(decodeShareData("!!!not-a-payload!!!")).resolves.toBeNull();
    await expect(decodeShareData("z1.%%%%")).resolves.toBeNull();
  });
});

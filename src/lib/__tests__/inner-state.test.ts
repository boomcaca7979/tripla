import { describe, expect, it } from "vitest";
import { getClimateRecord } from "@/data/climate/nasa-canonical";
import {
  bucketGuideSection,
  displayVerdictForDerived,
  displayVerdictForTier,
  interestToVibe,
  projectRegionPoints,
  regionTintFor,
  tripMonthWindow,
  verdictForMonth,
  VIBE_ORDER,
  type RegionPointInput,
} from "../inner-state";
import type { CanonicalClimateRecord, ClimateMonth } from "@/data/climate/nasa-canonical";

// ── 测试基座：确定性合成 canonical record（12 个月，tier 逐月固定） ────────

function makeMonth(i: number, tier: ClimateMonth["tier"]): ClimateMonth {
  return {
    monthIndex: i,
    tempMeanC: 10 + i,
    tempHighC: 15 + i,
    tempLowC: 5 + i,
    precipMm: 40 + i * 5,
    precipDaysGe1mm: 3 + (i % 5),
    sunshineHours: null,
    daylightHours: 12,
    ruleId: "R1",
    tier,
  };
}

/** 固定模式：0-2 Favourable / 3-8 Workable / 9-11 Challenging */
function makeRecord(): CanonicalClimateRecord {
  return {
    destinationId: "test-destination",
    city: "Test City",
    country: "Test Country",
    region: "Asia",
    anchor: { type: "city", latitude: 35.68, longitude: 139.76, elevationM: 40 },
    grid: { latitude: 35.68, longitude: 139.76, elevationM: 40, resolution: "0.5" },
    sourceFamily: "NASA POWER",
    periodStart: 1991,
    periodEnd: 2020,
    dailyBoundary: "UTC",
    methodologyVersion: "v8.7",
    ruleVersion: "v8.7",
    months: [
      makeMonth(0, "Favourable"),
      makeMonth(1, "Favourable"),
      makeMonth(2, "Favourable"),
      makeMonth(3, "Workable"),
      makeMonth(4, "Workable"),
      makeMonth(5, "Workable"),
      makeMonth(6, "Workable"),
      makeMonth(7, "Workable"),
      makeMonth(8, "Workable"),
      makeMonth(9, "Challenging"),
      makeMonth(10, "Challenging"),
      makeMonth(11, "Challenging"),
    ],
    bestMonthsBaseline: [0, 1, 2],
    recommendationStatus: "ok",
    selection: { reason: "test", ruleVersion: "v8.7" },
    fieldProvenance: {},
  };
}

// ── displayVerdictForTier / displayVerdictForDerived ─────────────────────

describe("displayVerdictForTier", () => {
  it("Favourable → good", () => {
    expect(displayVerdictForTier("Favourable")).toBe("good");
  });

  it("Workable → workable", () => {
    expect(displayVerdictForTier("Workable")).toBe("workable");
  });

  it("Challenging → challenging", () => {
    expect(displayVerdictForTier("Challenging")).toBe("challenging");
  });

  it("未知 tier → null（不猜）", () => {
    expect(displayVerdictForTier("Excellent")).toBeNull();
    expect(displayVerdictForTier("")).toBeNull();
  });
});

describe("displayVerdictForDerived", () => {
  it("best/good/avoid 三态全覆盖", () => {
    expect(displayVerdictForDerived("best")).toBe("good");
    expect(displayVerdictForDerived("good")).toBe("workable");
    expect(displayVerdictForDerived("avoid")).toBe("challenging");
  });
});

// ── verdictForMonth ──────────────────────────────────────────────────────

describe("verdictForMonth", () => {
  const rec = makeRecord();

  it("0 = January → Favourable 映射为 good", () => {
    expect(verdictForMonth(rec, 0)).toBe("good");
  });

  it("11 = December → Challenging 映射为 challenging", () => {
    expect(verdictForMonth(rec, 11)).toBe("challenging");
  });

  it("中间月 → Workable 映射为 workable", () => {
    expect(verdictForMonth(rec, 5)).toBe("workable");
  });

  it("无效月份（-1 / 12 / 非整数 / NaN）→ null", () => {
    expect(verdictForMonth(rec, -1)).toBeNull();
    expect(verdictForMonth(rec, 12)).toBeNull();
    expect(verdictForMonth(rec, 1.5)).toBeNull();
    expect(verdictForMonth(rec, Number.NaN)).toBeNull();
  });

  it("canonical 真实记录：返回值恒等于该月 tier 的映射（tokyo 全年扫描）", () => {
    const tokyo = getClimateRecord("tokyo");
    for (let m = 0; m < 12; m += 1) {
      const month = tokyo.months.find((x) => x.monthIndex === m);
      expect(month).toBeDefined();
      expect(verdictForMonth(tokyo, m)).toBe(displayVerdictForTier(month!.tier));
    }
    expect(verdictForMonth(tokyo, 12)).toBeNull();
  });
});

// ── regionTintFor ────────────────────────────────────────────────────────

describe("regionTintFor", () => {
  it("四个 region 全部命中且互不相同", () => {
    const tints = ["Asia", "Europe", "Americas", "Oceania"].map(regionTintFor);
    expect(new Set(tints).size).toBe(4);
    for (const t of tints) {
      expect(t).toMatch(/^\d{1,3}, \d{1,3}, \d{1,3}$/);
    }
  });

  it("相同输入恒返回相同输出（确定性）", () => {
    expect(regionTintFor("Asia")).toBe(regionTintFor("Asia"));
  });

  it("未知 region → 默认 tint（确定性降级）", () => {
    expect(regionTintFor("Antarctica")).toBe(regionTintFor("nonexistent"));
  });
});

// ── projectRegionPoints ──────────────────────────────────────────────────

const point = (slug: string, lat: number, lon: number): RegionPointInput => ({
  slug,
  city: slug,
  country: "Test",
  airport: { latitude: lat, longitude: lon },
});

describe("projectRegionPoints", () => {
  it("确定性：相同输入两次调用输出完全一致", () => {
    const input = [point("a", 35.68, 139.76), point("b", 34.69, 135.5), point("c", 37.57, 126.98)];
    const r1 = projectRegionPoints(input);
    const r2 = projectRegionPoints(input);
    expect(r1).toEqual(r2);
  });

  it("输出 0..1 归一化坐标且北在上（y 随纬度增而减）", () => {
    const r = projectRegionPoints([point("south", 10, 0), point("north", 50, 0)]);
    const north = r.points.find((p) => p.slug === "north")!;
    const south = r.points.find((p) => p.slug === "south")!;
    for (const p of r.points) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(1);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(1);
    }
    expect(north.y).toBeLessThan(south.y);
  });

  it("bbox 反映真实输入坐标（投影不虚构地理）", () => {
    const r = projectRegionPoints([point("a", 10, 100), point("b", 20, 110)]);
    expect(r.bbox.minLat).toBe(10);
    expect(r.bbox.maxLat).toBe(20);
    expect(r.bbox.minLon).toBe(100);
    expect(r.bbox.maxLon).toBe(110);
  });

  it("重复坐标：确定性环形展开，偏移后仍可复现且位置互异", () => {
    const dup = () => [point("x1", 35.68, 139.76), point("x2", 35.68, 139.76), point("x3", 35.68, 139.76)];
    const r1 = projectRegionPoints(dup());
    const r2 = projectRegionPoints(dup());
    expect(r1).toEqual(r2);
    const xs = new Set(r1.points.map((p) => `${p.x.toFixed(4)},${p.y.toFixed(4)}`));
    expect(xs.size).toBe(3); // 三个重合点被展开为三个互异位置
  });

  it("单点输入：退化 bbox 不产生除零，坐标居中", () => {
    const r = projectRegionPoints([point("only", 35.68, 139.76)]);
    expect(r.points).toHaveLength(1);
    const p = r.points[0];
    expect(p.x).toBeGreaterThan(0.3);
    expect(p.x).toBeLessThan(0.7);
    expect(p.y).toBeGreaterThan(0.3);
    expect(p.y).toBeLessThan(0.7);
  });

  it("非法坐标被过滤，空输入返回空结果", () => {
    const r = projectRegionPoints([
      point("bad", Number.NaN, 100),
      point("bad2", 35, Number.NaN),
    ]);
    expect(r.points).toHaveLength(0);
    expect(projectRegionPoints([]).points).toHaveLength(0);
  });
});

// ── tripMonthWindow ──────────────────────────────────────────────────────

describe("tripMonthWindow", () => {
  const rec = makeRecord();

  it("1 月出发 7 天 → 只跨 January，verdict 来自 canonical tier", () => {
    const w = tripMonthWindow({ days: 7 }, 0, rec);
    expect(w.departureMonth).toBe(0);
    expect(w.months).toEqual([0]);
    expect(w.verdicts).toEqual(["good"]);
  });

  it("跨月行程：12 月出发 45 天 → December + January", () => {
    const w = tripMonthWindow({ days: 45 }, 11, rec);
    expect(w.months).toEqual([11, 0]);
    expect(w.verdicts).toEqual(["challenging", "good"]);
  });

  it("无出发月（模板行程）→ 空窗口，不猜默认月份", () => {
    const w = tripMonthWindow({ days: 7 }, null, rec);
    expect(w.departureMonth).toBeNull();
    expect(w.months).toEqual([]);
    expect(w.verdicts).toEqual([]);
  });

  it("非法出发月 / 非法天数 → 空窗口", () => {
    expect(tripMonthWindow({ days: 7 }, 12, rec).months).toEqual([]);
    expect(tripMonthWindow({ days: 7 }, -1, rec).months).toEqual([]);
    expect(tripMonthWindow({ days: 0 }, 3, rec).months).toEqual([]);
    expect(tripMonthWindow({ days: Number.NaN }, 3, rec).months).toEqual([]);
  });
});

// ── interestToVibe ───────────────────────────────────────────────────────

describe("interestToVibe", () => {
  it("已知兴趣映射到固定 vibe（大小写不敏感）", () => {
    expect(interestToVibe("food")).toBe("FOOD");
    expect(interestToVibe("Food")).toBe("FOOD");
    expect(interestToVibe("nightlife")).toBe("NIGHT");
    expect(interestToVibe("museums")).toBe("DESIGN");
    expect(interestToVibe("beaches")).toBe("NATURE");
    expect(interestToVibe("shopping")).toBe("SHOPPING");
    expect(interestToVibe("wellness")).toBe("SLOW");
    expect(interestToVibe("history")).toBe("HISTORY");
    expect(interestToVibe("surf")).toBe("SPORTS");
  });

  it("VIBE_ORDER 覆盖全部 vibe 且无重复", () => {
    expect(new Set(VIBE_ORDER).size).toBe(VIBE_ORDER.length);
  });

  it("未知兴趣 → null（不硬造档位）", () => {
    expect(interestToVibe("quantum-archaeology")).toBeNull();
  });

  it("空/空白输入 → null", () => {
    expect(interestToVibe("")).toBeNull();
    expect(interestToVibe("   ")).toBeNull();
  });
});

// ── bucketGuideSection ───────────────────────────────────────────────────

describe("bucketGuideSection", () => {
  it("六类标题命中对应模块", () => {
    expect(bucketGuideSection("When to go")).toBe("WHEN");
    expect(bucketGuideSection("Getting around")).toBe("MOVE");
    expect(bucketGuideSection("What to eat and drink")).toBe("EAT");
    expect(bucketGuideSection("Where to stay")).toBe("STAY");
    expect(bucketGuideSection("Don't miss")).toBe("DONT_MISS");
    expect(bucketGuideSection("Good to know")).toBe("GOOD_TO_KNOW");
  });

  it("匹配大小写不敏感", () => {
    expect(bucketGuideSection("BEST TIME TO VISIT")).toBe("WHEN");
  });

  it("未知标题 → NOTES（保守降级）", () => {
    expect(bucketGuideSection("Quantum entanglement in transit")).toBe("NOTES");
  });

  it("空标题 → NOTES", () => {
    expect(bucketGuideSection("")).toBe("NOTES");
    expect(bucketGuideSection("   ")).toBe("NOTES");
  });

  it("分桶确定性：相同标题恒返回相同模块", () => {
    expect(bucketGuideSection("Practical tips")).toBe(bucketGuideSection("Practical tips"));
  });
});

// ── STEP 3: Destination Explore ──────────────────────────────────────────

import {
  filterByVibe,
  formatLatLon,
  hemisphereForLatitude,
  haversineKm,
  monthNormals,
  nearbyDestinations,
  seasonForLatitudeMonth,
  vibesForInterests,
  itemMatchesVibe,
} from "../inner-state";

describe("haversineKm / nearbyDestinations", () => {
  it("东京→京都被近于 东京→巴黎（真实量级 sanity）", () => {
    const tokyoKyoto = haversineKm(35.68, 139.76, 35.0, 135.76);
    const tokyoParis = haversineKm(35.68, 139.76, 48.86, 2.35);
    expect(tokyoKyoto).toBeGreaterThan(300);
    expect(tokyoKyoto).toBeLessThan(450);
    expect(tokyoParis).toBeGreaterThan(9000);
  });

  it("邻近排序确定性：相同输入两次调用输出一致，且排除自身", () => {
    const candidates: RegionPointInput[] = [
      point("kyoto", 35.0, 135.76),
      point("osaka", 34.69, 135.5),
      point("sapporo", 43.06, 141.35),
      point("tokyo", 35.68, 139.76), // 自身
    ];
    const r1 = nearbyDestinations({ slug: "tokyo", airport: { latitude: 35.68, longitude: 139.76 } }, candidates, 3);
    const r2 = nearbyDestinations({ slug: "tokyo", airport: { latitude: 35.68, longitude: 139.76 } }, candidates, 3);
    expect(r1).toEqual(r2);
    expect(r1.some((d) => d.slug === "tokyo")).toBe(false);
    expect(r1.map((d) => d.slug)).toEqual(["kyoto", "osaka", "sapporo"]);
  });

  it("count 截断与非法坐标过滤", () => {
    const candidates: RegionPointInput[] = [
      point("a", 36, 140),
      point("bad", Number.NaN, 100),
      point("b", 37, 141),
    ];
    const r = nearbyDestinations({ slug: "tokyo", airport: { latitude: 35.68, longitude: 139.76 } }, candidates, 1);
    expect(r).toHaveLength(1);
    expect(r[0].slug).toBe("a");
  });
});

describe("vibesForInterests / itemMatchesVibe / filterByVibe", () => {
  it("兴趣集合映射为去重、固定顺序的 vibe 集合", () => {
    expect(vibesForInterests(["food", "nightlife", "food"])).toEqual(["FOOD", "NIGHT"]);
    const ordered = vibesForInterests(["history", "nature", "food"]);
    expect(ordered.indexOf("FOOD")).toBeLessThan(ordered.indexOf("NATURE"));
    expect(ordered.indexOf("NATURE")).toBeLessThan(ordered.indexOf("HISTORY"));
  });

  it("vibe null → 全部命中；未知 tag 不命中", () => {
    expect(itemMatchesVibe(["anything"], null)).toBe(true);
    expect(itemMatchesVibe(["food"], "FOOD")).toBe(true);
    expect(itemMatchesVibe(["quantum"], "FOOD")).toBe(false);
  });

  it("filterByVibe 保序过滤；null 返回原数组", () => {
    const items = [
      { id: 1, tags: ["food"] },
      { id: 2, tags: ["nature"] },
      { id: 3, tags: ["food", "nightlife"] },
    ];
    expect(filterByVibe(items, (x) => x.tags, "FOOD").map((x) => x.id)).toEqual([1, 3]);
    expect(filterByVibe(items, (x) => x.tags, null)).toEqual(items);
    // 空 vibe 结果 → 空数组（调用方负责回退全部，禁止空白页）
    expect(filterByVibe(items, (x) => x.tags, "SPORTS")).toEqual([]);
  });
});

describe("NOW 读数：monthNormals / hemisphere / season / 坐标格式化", () => {
  it("monthNormals 只投影 canonical 四个展示字段", () => {
    const rec = makeRecord();
    const normals = monthNormals(rec);
    expect(normals).toHaveLength(12);
    expect(normals[0]).toEqual({ monthIndex: 0, tempHighC: 15, tempLowC: 5, precipMm: 40, precipDaysGe1mm: 3, daylightHours: 12 });
    expect(Object.keys(normals[0]).sort()).toEqual(["daylightHours", "monthIndex", "precipDaysGe1mm", "precipMm", "tempHighC", "tempLowC"]);
  });

  it("半球由纬度推导；季节随半球翻转（0=January）", () => {
    expect(hemisphereForLatitude(35.68)).toBe("north");
    expect(hemisphereForLatitude(-33.87)).toBe("south");
    expect(seasonForLatitudeMonth(0, "north")).toBe("winter");
    expect(seasonForLatitudeMonth(0, "south")).toBe("summer");
    expect(seasonForLatitudeMonth(6, "north")).toBe("summer");
    expect(seasonForLatitudeMonth(6, "south")).toBe("winter");
  });

  it("非法月份 → null", () => {
    expect(seasonForLatitudeMonth(-1, "north")).toBeNull();
    expect(seasonForLatitudeMonth(12, "north")).toBeNull();
    expect(seasonForLatitudeMonth(1.5, "north")).toBeNull();
  });

  it("坐标读数方向与位数确定性", () => {
    expect(formatLatLon(35.68, 139.76)).toBe("35.68°N · 139.76°E");
    expect(formatLatLon(-33.87, -46.5)).toBe("33.87°S · 46.50°W");
  });
});

// ── 2.0 INTERACTIVE REBUILD: vibe tint / deterministic crop ─────────────

import { cropForHighlight, vibeTintFor } from "../inner-state";

describe("vibeTintFor", () => {
  it("每个 vibe 有独立 tint，null → 品牌 accent", () => {
    const tints = VIBE_ORDER.map((v) => vibeTintFor(v));
    expect(new Set(tints).size).toBe(VIBE_ORDER.length);
    expect(vibeTintFor(null)).toBe("164, 81, 59");
  });
  it("确定性：相同 vibe 恒返回相同 tint", () => {
    expect(vibeTintFor("FOOD")).toBe(vibeTintFor("FOOD"));
  });
});

describe("cropForHighlight", () => {
  it("确定性：相同 index 恒产生相同取景", () => {
    expect(cropForHighlight(2)).toEqual(cropForHighlight(2));
  });
  it("不同章节产生不同取景（同一张图的不同真实裁切）", () => {
    const crops = [0, 1, 2, 3, 4].map(cropForHighlight);
    expect(new Set(crops.map((c) => c.position)).size).toBe(5);
  });
  it("取景参数在合法范围内（position 百分比、scale ≥1）", () => {
    for (let i = 0; i < 12; i += 1) {
      const c = cropForHighlight(i);
      expect(c.position).toMatch(/^\d+% \d+%$/);
      expect(c.scale).toBeGreaterThanOrEqual(1);
      expect(c.scale).toBeLessThanOrEqual(1.3);
    }
  });
  it("超界/负数 index 仍确定性规范化", () => {
    expect(cropForHighlight(5)).toEqual(cropForHighlight(0));
    expect(cropForHighlight(-1)).toEqual(cropForHighlight(4));
  });
});

// ── 3.0: LENS waypoints ─────────────────────────────────────────────────

import { lensWaypointFor } from "../inner-state";

describe("lensWaypointFor", () => {
  it("确定性：相同 index 恒返回相同锚点", () => {
    expect(lensWaypointFor(2)).toEqual(lensWaypointFor(2));
  });
  it("5 个锚点互不相同且在画面内（0..100）", () => {
    const pts = [0, 1, 2, 3, 4].map(lensWaypointFor);
    expect(new Set(pts.map((p) => `${p.x},${p.y}`)).size).toBe(5);
    for (const p of pts) {
      expect(p.x).toBeGreaterThan(0);
      expect(p.x).toBeLessThan(100);
      expect(p.y).toBeGreaterThan(0);
      expect(p.y).toBeLessThan(100);
    }
  });
  it("锚点彼此相距足够远（拖 10–20% 明显换景）", () => {
    const pts = [0, 1, 2, 3, 4].map(lensWaypointFor);
    for (let i = 0; i < pts.length; i += 1) {
      for (let j = i + 1; j < pts.length; j += 1) {
        const dist = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        expect(dist).toBeGreaterThan(20);
      }
    }
  });
  it("超界/负数 index 确定性规范化", () => {
    expect(lensWaypointFor(5)).toEqual(lensWaypointFor(0));
    expect(lensWaypointFor(-3)).toEqual(lensWaypointFor(2));
  });
});

// ── 3.0 WORLD: placeLightFor / formatHour / monthRainDrops ─────────────

import { formatHour, monthRainDrops, placeLightFor } from "../inner-state";

describe("placeLightFor", () => {
  it("四段日光确定性映射", () => {
    expect(placeLightFor(0).dayPart).toBe("night");
    expect(placeLightFor(6).dayPart).toBe("dawn");
    expect(placeLightFor(12).dayPart).toBe("day");
    expect(placeLightFor(19).dayPart).toBe("dusk");
    expect(placeLightFor(23).dayPart).toBe("night");
  });
  it("夜晚城市灯光强于白天；照片滤镜随光照变化", () => {
    expect(placeLightFor(23).glowAlpha).toBeGreaterThan(placeLightFor(12).glowAlpha);
    expect(placeLightFor(12).photoFilter).not.toBe(placeLightFor(23).photoFilter);
    expect(placeLightFor(23).isNight).toBe(true);
  });
  it("非法小时规范化（24→0，-2→22）", () => {
    expect(placeLightFor(24).dayPart).toBe("night");
    expect(placeLightFor(-2).dayPart).toBe("night");
  });
});

describe("formatHour / monthRainDrops", () => {
  it("浮点小时格式化确定性与进位", () => {
    expect(formatHour(21.5)).toBe("21:30");
    expect(formatHour(9.0833)).toBe("09:05");
    expect(formatHour(23.99)).toBe("23:59");
    expect(formatHour(23.999)).toBe("00:00"); // 真实进位
  });
  it("雨滴密度来自 canonical precipMm（上限 56，非法/0 → 0）", () => {
    expect(monthRainDrops(59.5)).toBe(17);
    expect(monthRainDrops(200)).toBe(56);
    expect(monthRainDrops(0)).toBe(0);
    expect(monthRainDrops(Number.NaN)).toBe(0);
  });
});

// ── ATLAS CORE: world projection / node emphasis ────────────────────────

import { nodeEmphasisFor, projectWorldPoint, WORLD_BOUNDS } from "../inner-state";

describe("projectWorldPoint", () => {
  it("确定性：相同坐标恒产生相同投影", () => {
    expect(projectWorldPoint(35.68, 139.76)).toEqual(projectWorldPoint(35.68, 139.76));
  });
  it("输出 0..1 且北在上（纬度越高 y 越小）", () => {
    const tokyo = projectWorldPoint(35.68, 139.76);
    const sydney = projectWorldPoint(-33.87, 151.21);
    const london = projectWorldPoint(51.5, -0.12);
    for (const p of [tokyo, sydney, london]) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(1);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(1);
    }
    expect(london.y).toBeLessThan(tokyo.y);
    expect(tokyo.y).toBeLessThan(sydney.y);
  });
  it("东京（139.76E）在纽约（-74W）右侧，横跨世界", () => {
    const tokyo = projectWorldPoint(35.68, 139.76);
    const ny = projectWorldPoint(40.71, -74.0);
    expect(tokyo.x).toBeGreaterThan(ny.x);
  });
  it("固定边界：不随点集缩放（对比 projectRegionPoints 的关键差异）", () => {
    const a = projectWorldPoint(0, 0);
    const b = projectWorldPoint(0, 0);
    expect(a).toEqual(b);
    expect(WORLD_BOUNDS.latTop).toBe(78);
  });
  it("超界纬度被钳制（不产生越界坐标）", () => {
    const p = projectWorldPoint(89, 200);
    expect(p.y).toBeGreaterThanOrEqual(0);
    expect(p.x).toBeLessThanOrEqual(1);
  });
});

describe("nodeEmphasisFor", () => {
  it("三档 tier → 三级节点状态", () => {
    expect(nodeEmphasisFor("Favourable")).toBe("dominant");
    expect(nodeEmphasisFor("Workable")).toBe("secondary");
    expect(nodeEmphasisFor("Challenging")).toBe("quiet");
  });
  it("空值 → quiet（不猜）", () => {
    expect(nodeEmphasisFor(undefined)).toBe("quiet");
    expect(nodeEmphasisFor(null)).toBe("quiet");
  });
});

// ── ATLAS VIBE LENS: combined node state ────────────────────────────────

import { nodeVisualState, vibeNodeState } from "../inner-state";

describe("vibeNodeState / nodeVisualState", () => {
  it("lens = null → neutral（世界完整）", () => {
    expect(vibeNodeState(null, ["FOOD"])).toBe("neutral");
    expect(vibeNodeState(null, [])).toBe("neutral");
  });
  it("命中/未命中判定", () => {
    expect(vibeNodeState("FOOD", ["FOOD", "NIGHT"])).toBe("match");
    expect(vibeNodeState("FOOD", ["NATURE"])).toBe("other");
  });
  it("match 获得光环与尺寸；other 退隐但不消失；neutral 居中", () => {
    const m = nodeVisualState("secondary", "FOOD", ["FOOD"], false);
    const o = nodeVisualState("secondary", "FOOD", ["NATURE"], false);
    const n = nodeVisualState("secondary", null, [], false);
    expect(m.halo).toBeGreaterThan(0);
    expect(m.scale).toBeGreaterThan(n.scale);
    expect(o.opacity).toBeLessThan(n.opacity);
    expect(o.opacity).toBeGreaterThan(0); // 退隐但不消失
    expect(m.opacity).toBeGreaterThanOrEqual(0.95);
  });
  it("tier 决定基准尺寸权重（dominant > secondary > quiet）", () => {
    const d = nodeVisualState("dominant", null, [], false);
    const s = nodeVisualState("secondary", null, [], false);
    const q = nodeVisualState("quiet", null, [], false);
    expect(d.scale).toBeGreaterThan(s.scale);
    expect(s.scale).toBeGreaterThan(q.scale);
  });
  it("selected 优先：即使 other 也保持可见", () => {
    const sel = nodeVisualState("secondary", "FOOD", ["NATURE"], true);
    expect(sel.opacity).toBe(1);
    expect(sel.scale).toBeGreaterThan(nodeVisualState("secondary", "FOOD", ["NATURE"], false).scale);
  });
  it("组合确定性：month tier × vibe × selection 相同输入恒等", () => {
    expect(nodeVisualState("dominant", "FOOD", ["FOOD"], true)).toEqual(
      nodeVisualState("dominant", "FOOD", ["FOOD"], true),
    );
  });
});

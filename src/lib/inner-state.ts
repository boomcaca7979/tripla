import type { CanonicalClimateRecord } from "@/data/climate/nasa-canonical";

/**
 * inner-state — Inner Experience SPEC v1 的**纯函数适配层**（叶子常量层）。
 *
 * 硬性契约：
 *   · 纯函数 / 确定性 —— 无 React、无 browser API、无 Date.now、无 Math.random、
 *     无 network。相同输入恒产生相同输出（SSG 首帧一致性 + #418 防护的前提）。
 *   · 只做**确定性推导与展示投影**，不产生任何新"事实"：
 *     verdict 映射是 NASA R-tier 的改标签，投影是真实 airport 坐标的等距圆柱投影，
 *     比例尺是**固定常量**（文档化），不引入新算法、新评分、新数据源。
 *   · `import type` 只取类型 —— 本文件不得把 nasa-canonical / destinations 数据
 *     拖进客户端 bundle（与 besttime-labels.ts 的叶子层策略一致）。
 */

// ── Region tints（§1.3：确定性、server-side、无随机） ─────────────────────

export type RegionName = "Asia" | "Europe" | "Americas" | "Oceania" | "Africa";

/**
 * Region → 暖调泥土色 RGB 三元组（供 `--ut-region-rgb` 覆写）。
 * 取值刻意避开交互 accent（terracotta 164,81,59）与 verdict 三色，
 * 且仅作氛围底色（不承载文本）。
 */
export const REGION_TINTS: Record<RegionName, string> = {
  Asia: "92, 116, 140",      // slate
  Europe: "104, 132, 92",    // moss
  Americas: "140, 112, 92",  // clay
  Oceania: "146, 118, 76",   // ochre-earth
  Africa: "118, 106, 88",    // dry savanna earth
};

export const REGION_TINT_DEFAULT = "140, 112, 92";

/** Region → tint RGB 三元组。未知 region 恒返回默认值（确定性降级，不抛异常）。 */
export function regionTintFor(region: string): string {
  return (REGION_TINTS as Record<string, string>)[region] ?? REGION_TINT_DEFAULT;
}

// ── Verdict（§1.1：NASA tier → 展示档位；唯一映射，不做内容判断） ─────────

export type NasaTier = "Favourable" | "Workable" | "Challenging";
export type DisplayVerdict = "good" | "workable" | "challenging";

/** NASA R-tier → 展示档位。未知/非法 tier 返回 null（调用方决定降级，不猜）。 */
export function displayVerdictForTier(tier: string): DisplayVerdict | null {
  switch (tier) {
    case "Favourable":
      return "good";
    case "Workable":
      return "workable";
    case "Challenging":
      return "challenging";
    default:
      return null;
  }
}

/**
 * 单月展示档位：canonical record 的第 monthIndex 月的 tier 映射。
 * monthIndex 必须 0..11（0 = January）；越界/缺月返回 null。
 * 只读 canonical tier —— 不重算、不改写、不合成新推荐。
 */
export function verdictForMonth(
  record: Pick<CanonicalClimateRecord, "months">,
  monthIndex: number,
): DisplayVerdict | null {
  if (!Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) return null;
  const month = record.months.find((m) => m.monthIndex === monthIndex);
  if (!month) return null;
  return displayVerdictForTier(month.tier);
}

/** MonthRow.derived（besttime 侧已做 tier→derived 映射）→ 展示档位。 */
export function displayVerdictForDerived(
  derived: "best" | "good" | "avoid",
): DisplayVerdict {
  switch (derived) {
    case "best":
      return "good";
    case "avoid":
      return "challenging";
    default:
      return "workable";
  }
}

// ── 地理投影（RegionMiniMap 数据基座；真实 airport 坐标 → SVG 平面坐标） ──

export interface RegionPointInput {
  slug: string;
  city?: string;
  country?: string;
  airport: { latitude: number; longitude: number };
}

export interface ProjectedPoint {
  slug: string;
  city: string;
  country: string;
  /** 原始真实坐标（回传，供读数/验证） */
  latitude: number;
  longitude: number;
  /** 0..1 归一化平面坐标（viewport 无关；调用方乘以画布尺寸） */
  x: number;
  y: number;
}

export interface ProjectedRegion {
  points: ProjectedPoint[];
  /** 数据真实包围盒（经投影裁剪后） */
  bbox: { minLat: number; maxLat: number; minLon: number; maxLon: number };
}

const LAT_CLAMP = 85;       // 等距圆柱投影极地变形过大，裁剪显示域
const MIN_SPAN_DEG = 4;      // 单点/极小 bbox 时保底跨度，避免除零与点重叠
const PAD_RATIO = 0.08;      // 包围盒四周留白比例
const DUPLICATE_OFFSET_DEG = 0.8; // 重复坐标的确定性环形偏移步长（度）

/**
 * 一组目的地的等距圆柱投影（equirectangular）。
 *  · 输入必须是真实 airport.latitude/longitude —— 本函数不虚构坐标。
 *  · 输出 0..1 归一化坐标 + 数据真实 bbox（调用方映射到画布）。
 *  · 完全重合的坐标（同一城市多记录/数据重合）按**确定性**环形偏移展开：
 *    第 k 个重复点偏移 = (k * 72°) 方向 × DUPLICATE_OFFSET_DEG —— 固定步长、
 *    固定顺序（按输入序），无随机数。
 *  · 输入顺序即输出顺序（不稳定排序会破坏确定性 —— 这里不排序）。
 */
export function projectRegionPoints(destinations: RegionPointInput[]): ProjectedRegion {
  const valid = destinations.filter(
    (d) =>
      Number.isFinite(d.airport?.latitude) &&
      Number.isFinite(d.airport?.longitude),
  );

  if (valid.length === 0) {
    return {
      points: [],
      bbox: { minLat: 0, maxLat: 0, minLon: 0, maxLon: 0 },
    };
  }

  // 重复坐标的确定性展开：同坐标点得到互不相同的稳定偏移
  const seen = new Map<string, number>();
  const placed = valid.map((d) => {
    const lat0 = clamp(d.airport.latitude, -LAT_CLAMP, LAT_CLAMP);
    const lon0 = d.airport.longitude;
    const key = `${lat0.toFixed(4)},${lon0.toFixed(4)}`;
    const k = seen.get(key) ?? 0;
    seen.set(key, k + 1);
    if (k === 0) return { ...d, lat: lat0, lon: lon0 };
    const angle = (k * 72 * Math.PI) / 180; // 固定 72° 步进环（黄金角近似，确定性）
    const lat = clamp(lat0 + DUPLICATE_OFFSET_DEG * Math.sin(angle), -LAT_CLAMP, LAT_CLAMP);
    const lon = lon0 + DUPLICATE_OFFSET_DEG * Math.cos(angle);
    return { ...d, lat, lon };
  });

  const minLat = Math.min(...placed.map((p) => p.lat));
  const maxLat = Math.max(...placed.map((p) => p.lat));
  const minLon = Math.min(...placed.map((p) => p.lon));
  const maxLon = Math.max(...placed.map((p) => p.lon));

  const latSpan = Math.max(maxLat - minLat, MIN_SPAN_DEG);
  const lonSpan = Math.max(maxLon - minLon, MIN_SPAN_DEG);
  // 保底跨度造成的居中扩展（小 bbox / 单点 → 点群居中）
  const latMid = (minLat + maxLat) / 2;
  const lonMid = (minLon + maxLon) / 2;
  const lo0 = latMid - latSpan / 2;
  const lo1 = lonMid - lonSpan / 2;

  const padLat = latSpan * PAD_RATIO;
  const padLon = lonSpan * PAD_RATIO;

  const project = (lat: number, lon: number) => ({
    x: (lon - (lo1 - padLon)) / (lonSpan + padLon * 2),
    y: 1 - (lat - (lo0 - padLat)) / (latSpan + padLat * 2), // 北在上
  });

  return {
    points: placed.map((p) => {
      const { x, y } = project(p.lat, p.lon);
      return {
        slug: p.slug,
        city: p.city ?? p.slug,
        country: p.country ?? "",
        latitude: p.airport.latitude,
        longitude: p.airport.longitude,
        x: clamp(x, 0, 1),
        y: clamp(y, 0, 1),
      };
    }),
    bbox: { minLat, maxLat, minLon, maxLon },
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

// ── Trip 气候窗口（WeatherWindow 数据基座；只读 canonical tier） ───────────

export interface TripWindowInput {
  days: number;
}

export interface TripMonthWindow {
  /** 出发月 0..11；无出发信息时为 null（模板行程没有固定日期） */
  departureMonth: number | null;
  /** 逐"自然日"落到的月份（去重、按时间序） */
  months: number[];
  /** 与 months 一一对齐的展示档位（来自 canonical tier） */
  verdicts: (DisplayVerdict | null)[];
}

/** 展示用日历月长（固定常量，非真实历法 —— 语义是"跨了哪些月"，不是天数换算） */
const CALENDAR_MONTH_DAYS = 30;

/**
 * 行程月份窗口：出发月 + 天数 → 跨越的月份及其 canonical tier 档位。
 *  · departureMonth 非法（非整数/越界）→ 视为"无固定出发月"，返回空窗口
 *    （模板行程的正确状态，不猜默认月份）。
 *  · days ≤ 0 → 空窗口。
 *  · verdicts 只映射 canonical tier，绝不生成新推荐。
 */
export function tripMonthWindow(
  trip: TripWindowInput,
  departureMonth: number | null,
  record: Pick<CanonicalClimateRecord, "months">,
): TripMonthWindow {
  const valid =
    Number.isInteger(departureMonth) &&
    departureMonth !== null &&
    departureMonth >= 0 &&
    departureMonth <= 11 &&
    Number.isFinite(trip.days) &&
    trip.days > 0;

  if (!valid || departureMonth === null) {
    return { departureMonth: null, months: [], verdicts: [] };
  }

  const months: number[] = [];
  for (let day = 0; day < trip.days; day += 1) {
    const m = (departureMonth + Math.floor(day / CALENDAR_MONTH_DAYS)) % 12;
    if (months[months.length - 1] !== m) months.push(m);
  }

  return {
    departureMonth,
    months,
    verdicts: months.map((m) => verdictForMonth(record, m)),
  };
}

// ── Vibe（Destination "PICK YOUR VIBE" 数据基座；真实 interests → 展示档） ──

export type Vibe =
  | "FOOD"
  | "NIGHT"
  | "DESIGN"
  | "NATURE"
  | "SHOPPING"
  | "SLOW"
  | "HISTORY"
  | "SPORTS";

/** Vibe 展示顺序（固定，全组件一致）。 */
export const VIBE_ORDER: Vibe[] = [
  "FOOD",
  "NIGHT",
  "DESIGN",
  "NATURE",
  "SHOPPING",
  "SLOW",
  "HISTORY",
  "SPORTS",
];

/** 兴趣关键词 → Vibe（大小写不敏感；表驱动，确定性，首个命中生效）。 */
const VIBE_KEYWORDS: ReadonlyArray<readonly [Vibe, readonly string[]]> = [
  ["FOOD", ["food", "cuisine", "streetfood", "street food", "restaurant", "dining", "gastronomy", "coffee"]],
  ["NIGHT", ["nightlife", "night", "bars", "club", "live music"]],
  ["DESIGN", ["museums", "museum", "art", "design", "architecture", "galleries", "gallery"]],
  ["NATURE", ["nature", "beaches", "beach", "parks", "hiking", "outdoors", "wildlife", "gardens", "islands"]],
  ["SHOPPING", ["shopping", "markets", "fashion", "bazaars"]],
  ["SLOW", ["relaxed", "slow", "wellness", "spa", "tranquil", "onsen"]],
  ["HISTORY", ["history", "historical", "heritage", "temples", "culture", "cultural", "archaeology"]],
  ["SPORTS", ["sports", "sport", "adventure", "active", "surf", "diving", "ski"]],
];

/**
 * 兴趣 key → Vibe。未知兴趣返回 null（调用方按"无 vibe"处理，不硬造档位）。
 * 确定性：命中同一关键词集合的第一条规则；无随机、无区域设置依赖。
 */
export function interestToVibe(key: string): Vibe | null {
  const normalized = key.trim().toLowerCase();
  if (!normalized) return null;
  for (const [vibe, keywords] of VIBE_KEYWORDS) {
    if (keywords.includes(normalized)) return vibe;
  }
  return null;
}

// ── Guide 模块分桶（FieldGuideModules 数据基座；真实 headings → 固定模块） ──

export type GuideModule =
  | "WHEN"
  | "MOVE"
  | "EAT"
  | "STAY"
  | "DONT_MISS"
  | "GOOD_TO_KNOW"
  | "NOTES";

export const GUIDE_MODULE_ORDER: GuideModule[] = [
  "WHEN",
  "MOVE",
  "EAT",
  "STAY",
  "DONT_MISS",
  "GOOD_TO_KNOW",
  "NOTES",
];

/**
 * 标题关键词 → 模块（大小写不敏感的子串匹配；表驱动，**首个命中**的桶优先于
 * 关键词出现顺序 —— 桶顺序即优先级，固定不可变）。未命中 → NOTES（保守降级，
 * 绝不硬塞进语义不符的模块）。
 */
const MODULE_KEYWORDS: ReadonlyArray<readonly [GuideModule, readonly string[]]> = [
  ["WHEN", ["when", "best time", "season", "weather", "climate", "month", "month to visit"]],
  ["MOVE", ["move", "getting there", "getting around", "getting around", "transport", "flight", "train", "bus", "metro", "subway", "ferry", "airport", "arrival", "how to get"]],
  ["EAT", ["eat", "food", "drink", "restaurant", "cuisine", "dining", "street food", "cafe", "coffee"]],
  ["STAY", ["stay", "hotel", "accommodat", "sleep", "neighbourhood", "neighborhood", "where to stay"]],
  ["DONT_MISS", ["don't miss", "dont miss", "highlights", "attraction", "must", "itinerary", "things to", "see and do", "sights"]],
  ["GOOD_TO_KNOW", ["good to know", "tips", "practical", "budget", "money", "cost", "safety", "etiquette", "visa", "sim", "language", "phrase", "packing", "what to pack"]],
];

export function bucketGuideSection(heading: string): GuideModule {
  const normalized = heading.trim().toLowerCase();
  if (!normalized) return "NOTES";
  for (const [mod, keywords] of MODULE_KEYWORDS) {
    for (const kw of keywords) {
      if (normalized.includes(kw)) return mod;
    }
  }
  return "NOTES";
}

// ── Destination Explore（STEP 3：邻近投影 / vibe 过滤 / 月份法线 / 状态读数） ──

/**
 * 两点大圆距离（km，Haversine）。只用于真实 airport 坐标的邻近排序，
 * 不产生任何新"地理事实"。
 */
export function haversineKm(
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

/**
 * 邻近目的地（真实坐标，确定性）：按大圆距离升序，距离相同按 slug 字典序
 * tie-break（保证全数据域输出顺序稳定），排除自身，取前 count 个。
 * 泛型保留输入元素类型（调用方传入完整 Destination 时原样返回）。
 */
export function nearbyDestinations<T extends RegionPointInput>(
  target: { slug: string; airport: { latitude: number; longitude: number } },
  candidates: T[],
  count: number,
): T[] {
  return candidates
    .filter((d) => d.slug !== target.slug && Number.isFinite(d.airport?.latitude) && Number.isFinite(d.airport?.longitude))
    .map((d) => ({
      d,
      km: haversineKm(target.airport.latitude, target.airport.longitude, d.airport.latitude, d.airport.longitude),
    }))
    .sort((x, y) => (x.km === y.km ? x.d.slug.localeCompare(y.d.slug) : x.km - y.km))
    .slice(0, Math.max(0, count))
    .map((x) => x.d);
}

/** 兴趣集合 → 去重后的 Vibe 集合（按 VIBE_ORDER 固定顺序输出）。 */
export function vibesForInterests(interests: string[]): Vibe[] {
  const set = new Set<Vibe>();
  for (const key of interests) {
    const v = interestToVibe(key);
    if (v) set.add(v);
  }
  return VIBE_ORDER.filter((v) => set.has(v));
}

/**
 * 条目（guide tags / trip interests / destination interests）是否命中 vibe。
 * vibe = null → 全部命中（"ALL" 状态）。未知 tag 不命中，不硬造映射。
 */
export function itemMatchesVibe(tags: string[], vibe: Vibe | null): boolean {
  if (vibe === null) return true;
  return tags.some((t) => interestToVibe(t) === vibe);
}

/**
 * 保序过滤（deterministic，不重排）：vibe = null 返回原数组；
 * 过滤后为空时调用方负责回退展示全部（禁止空白页）。
 */
export function filterByVibe<T>(items: T[], getTags: (item: T) => string[], vibe: Vibe | null): T[] {
  if (vibe === null) return items;
  return items.filter((item) => itemMatchesVibe(getTags(item), vibe));
}

// ── NOW 读数（真实数据源：Intl 时间 + 纬度半球季节 + NASA 月度法线） ────────

export interface MonthNormal {
  monthIndex: number;
  tempHighC: number;
  tempLowC: number;
  precipMm: number;
  precipDaysGe1mm: number;
  daylightHours: number;
}

/** canonical record → 12 个月展示法线（只读，不重算）。 */
export function monthNormals(record: Pick<CanonicalClimateRecord, "months">): MonthNormal[] {
  return record.months.map((m) => ({
    monthIndex: m.monthIndex,
    tempHighC: m.tempHighC,
    tempLowC: m.tempLowC,
    precipMm: m.precipMm,
    precipDaysGe1mm: m.precipDaysGe1mm,
    daylightHours: m.daylightHours,
  }));
}

export type Hemisphere = "north" | "south";

/** 半球由真实机场纬度推导（赤道按北半球处理；季节差异在 ±10° 内本就微弱）。 */
export function hemisphereForLatitude(latitude: number): Hemisphere {
  return latitude >= 0 ? "north" : "south";
}

export type ExploreSeason = "winter" | "spring" | "summer" | "autumn";

/** 气象季节（北半球基准；南半球翻转）。monthIndex 0..11，非法 → null。 */
export function seasonForLatitudeMonth(monthIndex: number, hemisphere: Hemisphere): ExploreSeason | null {
  if (!Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) return null;
  const north: ExploreSeason[] = [
    "winter", "winter", "spring", "spring", "spring", "summer",
    "summer", "summer", "autumn", "autumn", "autumn", "winter",
  ];
  const season = north[monthIndex];
  if (hemisphere === "north") return season;
  const flipped: Record<ExploreSeason, ExploreSeason> = {
    winter: "summer", spring: "autumn", summer: "winter", autumn: "spring",
  };
  return flipped[season];
}

/** 坐标仪器读数（mono 展示；不改数值，只定方向与位数）。 */
export function formatLatLon(latitude: number, longitude: number): string {
  const lat = `${Math.abs(latitude).toFixed(2)}°${latitude >= 0 ? "N" : "S"}`;
  const lon = `${Math.abs(longitude).toFixed(2)}°${longitude >= 0 ? "E" : "W"}`;
  return `${lat} · ${lon}`;
}

// ── Interactive Place Experience（2.0 INTERACTIVE REBUILD：视觉状态映射） ──

/**
 * Vibe → 氛围 tint（RGB 三元组）。
 * 这是 vibe 的**视觉身份**（场景 accent 变化的数据源），与 SEASON_TINT 同族的
 * 暖调编辑色；null（ALL）→ 品牌 accent。纯映射，无新数据语义。
 */
const VIBE_TINTS: Record<Vibe, string> = {
  FOOD: "190, 134, 62",     // amber
  NIGHT: "92, 116, 140",    // slate
  DESIGN: "164, 96, 58",    // rust
  NATURE: "104, 132, 92",   // moss
  SHOPPING: "146, 118, 76", // ochre
  SLOW: "150, 138, 118",    // sand
  HISTORY: "124, 92, 90",   // clay-rose
  SPORTS: "110, 124, 130",  // storm
};

export function vibeTintFor(vibe: Vibe | null): string {
  return vibe ? VIBE_TINTS[vibe] : "164, 81, 59";
}

export interface ImageCrop {
  /** CSS object-position 值（同一张真实图的不同取景，不伪造多张照片） */
  position: string;
  /** CSS scale（1 = 原始构图） */
  scale: number;
}

/**
 * highlight 序号 → 确定性取景。
 * Destination 只有一张真实 image；探索板用它对每个章节做**不同的真实裁切**
 * （平移 + 缩放），绝不冒充多张照片。公式固定：横向 8% 步进扫过画面，
 * 纵向三档循环，scale 三档循环 —— 相同输入恒产生相同取景。
 */
export function cropForHighlight(index: number): ImageCrop {
  const i = ((index % 5) + 5) % 5; // 规范化输入（负数/超界仍确定性）
  const x = 8 + i * 21; // 8 / 29 / 50 / 71 / 92 %
  const y = [42, 58, 35][i % 3];
  const scale = [1.06, 1.14, 1.22][i % 3];
  return { position: `${x}% ${y}%`, scale };
}

/**
 * LENS waypoint：章节 i 的**确定性视觉锚点**（透镜中心，画面百分比坐标）。
 * 硬性语义：这是构图落点，**不是地理坐标**——highlights 是纯名称字符串，
 * 本函数绝不赋予其地理意义。5 点环形分布，保证自由拖动 10–20% 仍明显换景。
 */
export function lensWaypointFor(index: number): { x: number; y: number } {
  const i = ((index % 5) + 5) % 5;
  const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2; // 从正上方开始，72° 步进
  return {
    x: Math.round(50 + 30 * Math.cos(angle)),
    y: Math.round(48 + 22 * Math.sin(angle)),
  };
}

// ── World（3.0 INTERACTIVE TRAVEL WORLD：光层 / 雨密度，确定性派生） ──────

export type DayPart = "night" | "dawn" | "day" | "dusk";

export interface PlaceLight {
  dayPart: DayPart;
  isNight: boolean;
  /** 街景层滤镜（hour 驱动的光照模拟；时间是真实的，光照是其视觉推论） */
  photoFilter: string;
  /** 城市灯光强度（夜高昼低） */
  glowAlpha: number;
  /** 天空改写街景的压暗程度 */
  overlayAlpha: number;
}

/**
 * 当地时刻 → 光照状态（确定性；hour 0..24，非法值规范化）。
 * 夜 21–5 / 晨 5–8 / 昼 8–17 / 暮 17–21。
 */
export function placeLightFor(hour: number): PlaceLight {
  const h = ((hour % 24) + 24) % 24;
  if (h < 5 || h >= 21) {
    return {
      dayPart: "night",
      isNight: true,
      photoFilter: "brightness(0.52) saturate(1.15) contrast(1.06)",
      glowAlpha: 0.5,
      overlayAlpha: 0.42,
    };
  }
  if (h < 8) {
    return {
      dayPart: "dawn",
      isNight: false,
      photoFilter: "brightness(0.84) saturate(1.06)",
      glowAlpha: 0.18,
      overlayAlpha: 0.18,
    };
  }
  if (h < 17) {
    return {
      dayPart: "day",
      isNight: false,
      photoFilter: "brightness(1) saturate(1)",
      glowAlpha: 0,
      overlayAlpha: 0.08,
    };
  }
  return {
    dayPart: "dusk",
    isNight: false,
    photoFilter: "brightness(0.74) saturate(1.12) sepia(0.1)",
    glowAlpha: 0.3,
    overlayAlpha: 0.26,
  };
}

/** 浮点小时 → HH:MM（确定性）。 */
export function formatHour(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  const mm2 = mm === 60 ? 0 : mm;
  const hh2 = mm === 60 ? (hh + 1) % 24 : hh;
  return `${String(hh2).padStart(2, "0")}:${String(mm2).padStart(2, "0")}`;
}

/**
 * canonical 月降水（mm）→ 雨滴数量（视觉密度；上限 56，非模拟天气数据，
 * 只是 canonical 数值的视觉密度投影）。
 */
export function monthRainDrops(precipMm: number): number {
  if (!Number.isFinite(precipMm) || precipMm <= 0) return 0;
  return Math.min(56, Math.round(precipMm / 3.5));
}

// ── World Atlas（STEP 1：固定全域投影 + 节点状态映射） ─────────────────────

/** 世界投影固定边界（覆盖全部 145 个真实目的地，含新西兰/冰岛级纬度余量） */
export const WORLD_BOUNDS = { latTop: 78, latBottom: -62 } as const;

/**
 * 真实坐标 → 世界画布 0..1 归一化坐标（equirectangular、**固定边界**——
 * 与 projectRegionPoints 的 bbox 自适应不同：世界不能随点集缩放）。
 * 北在上。经度不折叠（145 城无跨反子午线问题，东京以西连续）。
 */
export function projectWorldPoint(latitude: number, longitude: number): { x: number; y: number } {
  const lat = Math.min(WORLD_BOUNDS.latTop, Math.max(WORLD_BOUNDS.latBottom, latitude));
  const lon = Math.min(180, Math.max(-180, longitude));
  return {
    x: (lon + 180) / 360,
    y: 1 - (lat - WORLD_BOUNDS.latBottom) / (WORLD_BOUNDS.latTop - WORLD_BOUNDS.latBottom),
  };
}

export type NodeTier = "dominant" | "secondary" | "quiet";

/** NASA tier → 节点状态（视觉权重映射；非交通灯三色，是"世界层级"）。 */
export function nodeEmphasisFor(tier: "Favourable" | "Workable" | "Challenging" | undefined | null): NodeTier {
  switch (tier) {
    case "Favourable":
      return "dominant";
    case "Workable":
      return "secondary";
    case "Challenging":
      return "quiet";
    default:
      return "quiet";
  }
}

// ── ATLAS VIBE LENS（STEP 2A：世界透镜状态，纯函数） ─────────────────────

export type VibeNodeState = "match" | "other" | "neutral";

/**
 * 节点在当前 VIBE LENS 下的状态：
 *   neutral — lens = ALL（世界完整，无强调）
 *   match   — 节点真实 interests 命中当前 vibe（获得 presence）
 *   other   — 未命中（退隐但不消失——世界必须完整）
 */
export function vibeNodeState(vibe: Vibe | null, nodeVibes: Vibe[]): VibeNodeState {
  if (!vibe) return "neutral";
  return nodeVibes.includes(vibe) ? "match" : "other";
}

export interface NodeVisualState {
  /** 尺寸倍率（基于 tier 基准尺寸） */
  scale: number;
  /** 透明度（other 退隐但不消失） */
  opacity: number;
  /** 光环强度（match 获得存在感；0 = 无） */
  halo: number;
}

/**
 * 组合节点视觉状态：month tier（基础权重）× vibe lens（presence）× selection。
 * 确定性纯函数——同一输入恒产生同一视觉。
 * 规则：
 *   · tier 决定基准尺寸权重（dominant 1.0 / secondary 0.72 / quiet 0.45）
 *   · vibe match → scale ×1.25 + halo；other → opacity 退至 0.28（不消失）
 *   · selected → scale ×1.35（选择优先于一切）
 */
export function nodeVisualState(
  tier: NodeTier,
  vibe: Vibe | null,
  nodeVibes: Vibe[],
  selected: boolean,
): NodeVisualState {
  const base = tier === "dominant" ? 1 : tier === "secondary" ? 0.72 : 0.45;
  const state = vibeNodeState(vibe, nodeVibes);
  let scale = base;
  let opacity = tier === "quiet" ? 0.45 : 0.85;
  let halo = 0;
  if (state === "match") {
    scale *= 1.25;
    opacity = Math.max(opacity, 0.95);
    halo = 0.85;
  } else if (state === "other") {
    opacity = Math.min(opacity, 0.28);
    halo = 0;
  }
  if (selected) {
    scale *= 1.35;
    opacity = 1;
  }
  return { scale, opacity, halo };
}

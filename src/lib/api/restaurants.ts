/**
 * restaurants — Destination 页 Food 模块的餐厅数据层（provider-agnostic）。
 *
 * 数据诚信规则：
 *   · 只映射 provider 真实返回的字段；provider 没有的（rating / price_level /
 *     图片）一律不生成、不推导、不显示。
 *   · 现任 provider = Geoapify Places API（OpenStreetMap 数据源，免费档不返回
 *     rating / price_level / photos）→ 这些字段在结果中自然缺省，UI 不渲染。
 *   · 未来替换 Google Places / Foursquare 时只需新增 provider，组件零改动。
 */

import { serverFetchJson } from "./proxy-fetch";

/** Utripla 统一餐厅模型（只含 provider 真实返回的字段）。 */
export interface Restaurant {
  /** Provider place id（去重 / 追踪键）。 */
  id: string;
  /** 餐厅名：优先英文官方名，provider 只回本地语言时如实显示本地名。 */
  name: string;
  /** 菜系/类别（provider categories 推出的真实值，如 Noodle / Japanese）。 */
  cuisine?: string;
  /** 地址（provider address_line2：街道 + 区域 + 邮编 + 国家）。 */
  address?: string;
  lat: number;
  lon: number;
  /** Provider 返回的官网才存在。 */
  website?: string;
  /** Provider 真实评分才存在（Geoapify/OSM 源不返回）。 */
  rating?: number;
  ratingCount?: number;
  /** Provider 真实 price level 才存在（Geoapify/OSM 源不返回）。 */
  priceLevel?: string;
  /** Provider 真实照片 URL 才存在（Geoapify Places 不返回 → 不显示图片）。 */
  imageUrl?: string;
  /** 合规地图深链（腾讯地图 URI API，白名单供应商）。 */
  mapUrl: string;
  /** 数据来源标注（合规 attribution）。 */
  source: string;
}

export type RestaurantsResult =
  | { available: true; restaurants: Restaurant[] }
  | {
      available: false;
      reason:
        | "not-configured"
        | "invalid-params"
        | "auth-error"
        | "rate-limited"
        | "upstream-error"
        | "no-results";
    };

/** 城市中心搜索坐标（真实坐标，非内容数据）。未收录城市 → Food 走诚实空态。 */
export interface CityCenter {
  lat: number;
  lon: number;
  /** 坐标事实来源（如 "wikidata"）。 */
  source: string;
  /** 人工核验日期（ISO）。 */
  verifiedAt: string;
}

const CITY_CENTERS: Record<string, CityCenter> = {
  bangkok: { lat: 13.7563, lon: 100.5018, source: "wikidata", verifiedAt: "2026-09-16" },
  paris: { lat: 48.8566, lon: 2.3522, source: "wikidata", verifiedAt: "2026-09-16" },
  tokyo: { lat: 35.6812, lon: 139.7671, source: "wikidata", verifiedAt: "2026-09-16" },
  amsterdam: { lat: 52.3667, lon: 4.8945, source: "wikidata", verifiedAt: "2026-09-16" },
  barcelona: { lat: 41.387, lon: 2.17, source: "wikidata", verifiedAt: "2026-09-16" },
  dubai: { lat: 25.1975, lon: 55.2762, source: "wikidata", verifiedAt: "2026-09-16" },
  "hong-kong": { lat: 22.2819, lon: 114.1582, source: "wikidata", verifiedAt: "2026-09-16" },
  lisbon: { lat: 38.7102, lon: -9.139, source: "wikidata", verifiedAt: "2026-09-16" },
  london: { lat: 51.508, lon: -0.1281, source: "wikidata", verifiedAt: "2026-09-16" },
  madrid: { lat: 40.4203, lon: -3.7005, source: "wikidata", verifiedAt: "2026-09-16" },
  newyork: { lat: 40.7128, lon: -74.006, source: "wikidata", verifiedAt: "2026-09-16" },
  rome: { lat: 41.9028, lon: 12.4964, source: "wikidata", verifiedAt: "2026-09-16" },
  seoul: { lat: 37.5665, lon: 126.978, source: "wikidata", verifiedAt: "2026-09-16" },
  singapore: { lat: 1.2903, lon: 103.852, source: "wikidata", verifiedAt: "2026-09-16" },
  vienna: { lat: 48.202, lon: 16.3687, source: "wikidata", verifiedAt: "2026-09-16" },
  osaka: { lat: 34.7024, lon: 135.4959, source: "wikidata", verifiedAt: "2026-09-16" },
  venice: { lat: 45.4396, lon: 12.3306, source: "wikidata", verifiedAt: "2026-09-16" },
  budapest: { lat: 47.4979, lon: 19.0525, source: "wikidata", verifiedAt: "2026-09-16" },
  sydney: { lat: -33.8688, lon: 151.2093, source: "wikidata", verifiedAt: "2026-09-16" },
  istanbul: { lat: 41.0138, lon: 28.9497, source: "wikidata", verifiedAt: "2026-09-16" },
  milan: { lat: 45.4648, lon: 9.1875, source: "wikidata", verifiedAt: "2026-09-16" },
  prague: { lat: 50.081, lon: 14.426, source: "wikidata", verifiedAt: "2026-09-16" },
  austin: { lat: 30.2672, lon: -97.7431, source: "wikidata", verifiedAt: "2026-09-16" },
  munich: { lat: 48.1398, lon: 11.5654, source: "wikidata", verifiedAt: "2026-09-16" },
  "las-vegas": { lat: 36.1716, lon: -115.1398, source: "wikidata", verifiedAt: "2026-09-16" },
  "mexico-city": { lat: 19.433, lon: -99.1385, source: "wikidata", verifiedAt: "2026-09-16" },
  kyoto: { lat: 35.0116, lon: 135.7681, source: "wikidata", verifiedAt: "2026-09-16" },
  rovaniemi: { lat: 66.5017, lon: 25.731, source: "wikidata", verifiedAt: "2026-09-16" },
  antalya: { lat: 36.8887, lon: 30.7072, source: "wikidata", verifiedAt: "2026-09-16" },
  baku: { lat: 40.37, lon: 49.84, source: "wikidata", verifiedAt: "2026-09-16" },
  "abu-dhabi": { lat: 24.475, lon: 54.365, source: "wikidata", verifiedAt: "2026-09-16" },
  cologne: { lat: 50.94, lon: 6.955, source: "wikidata", verifiedAt: "2026-09-16" },
  bali: { lat: -8.69, lon: 115.17, source: "wikidata", verifiedAt: "2026-09-16" },
  boston: { lat: 42.3554, lon: -71.0605, source: "wikidata", verifiedAt: "2026-09-16" },
  "san-francisco": { lat: 37.7749, lon: -122.4194, source: "wikidata", verifiedAt: "2026-09-16" },
  beijing: { lat: 39.9042, lon: 116.4074, source: "wikidata", verifiedAt: "2026-09-16" },
  shanghai: { lat: 31.2304, lon: 121.4737, source: "wikidata", verifiedAt: "2026-09-16" },
  guangzhou: { lat: 23.1291, lon: 113.2647, source: "wikidata", verifiedAt: "2026-09-16" },
  chengdu: { lat: 30.6598, lon: 104.0633, source: "wikidata", verifiedAt: "2026-09-16" },
  xian: { lat: 34.27, lon: 108.945, source: "wikidata", verifiedAt: "2026-09-16" },
  hangzhou: { lat: 30.2795, lon: 120.162, source: "wikidata", verifiedAt: "2026-09-16" },
  chongqing: { lat: 29.5607, lon: 106.573, source: "wikidata", verifiedAt: "2026-09-16" },
  macau: { lat: 22.1955, lon: 113.5415, source: "wikidata", verifiedAt: "2026-09-16" },
  zurich: { lat: 47.3705, lon: 8.5395, source: "wikidata", verifiedAt: "2026-09-16" },
  "los-angeles": { lat: 34.0522, lon: -118.2437, source: "wikidata", verifiedAt: "2026-09-16" },
  vancouver: { lat: 49.2827, lon: -123.1207, source: "wikidata", verifiedAt: "2026-09-16" },
  melbourne: { lat: -37.8136, lon: 144.9631, source: "wikidata", verifiedAt: "2026-09-16" },
  auckland: { lat: -36.8459, lon: 174.7654, source: "wikidata", verifiedAt: "2026-09-16" },
  taipei: { lat: 25.0478, lon: 121.517, source: "wikidata", verifiedAt: "2026-09-16" },
  busan: { lat: 35.1661, lon: 129.0565, source: "wikidata", verifiedAt: "2026-09-16" },
  hanoi: { lat: 21.023, lon: 105.842, source: "wikidata", verifiedAt: "2026-09-16" },
  "ho-chi-minh-city": { lat: 10.7769, lon: 106.703, source: "wikidata", verifiedAt: "2026-09-16" },
  "kuala-lumpur": { lat: 3.15, lon: 101.695, source: "wikidata", verifiedAt: "2026-09-16" },
  cebu: { lat: 10.3057, lon: 123.9016, source: "wikidata", verifiedAt: "2026-09-16" },
  florence: { lat: 43.7715, lon: 11.2542, source: "wikidata", verifiedAt: "2026-09-16" },
  athens: { lat: 37.9755, lon: 23.7348, source: "wikidata", verifiedAt: "2026-09-16" },
  edinburgh: { lat: 55.9533, lon: -3.1883, source: "wikidata", verifiedAt: "2026-09-16" },
  copenhagen: { lat: 55.6759, lon: 12.5655, source: "wikidata", verifiedAt: "2026-09-16" },
  seville: { lat: 37.3885, lon: -5.997, source: "wikidata", verifiedAt: "2026-09-16" },
  toronto: { lat: 43.6532, lon: -79.3832, source: "wikidata", verifiedAt: "2026-09-16" },
  manila: { lat: 14.5995, lon: 120.9842, source: "wikidata", verifiedAt: "2026-09-16" },
  jakarta: { lat: -6.196, lon: 106.831, source: "wikidata", verifiedAt: "2026-09-16" },
  yogyakarta: { lat: -7.7956, lon: 110.3695, source: "wikidata", verifiedAt: "2026-09-16" },
  "chiang-mai": { lat: 18.7877, lon: 98.9857, source: "wikidata", verifiedAt: "2026-09-16" },
  phuket: { lat: 7.8843, lon: 98.3915, source: "wikidata", verifiedAt: "2026-09-16" },
  "koh-samui": { lat: 9.533, lon: 100.068, source: "wikidata", verifiedAt: "2026-09-16" },
  "da-nang": { lat: 16.0613, lon: 108.2266, source: "wikidata", verifiedAt: "2026-09-16" },
  "nha-trang": { lat: 12.242, lon: 109.193, source: "wikidata", verifiedAt: "2026-09-16" },
  "phu-quoc": { lat: 10.0289, lon: 103.953, source: "wikidata", verifiedAt: "2026-09-16" },
  "siem-reap": { lat: 13.3633, lon: 103.858, source: "wikidata", verifiedAt: "2026-09-16" },
  "phnom-penh": { lat: 11.553, lon: 104.922, source: "wikidata", verifiedAt: "2026-09-16" },
  jeju: { lat: 33.4996, lon: 126.5312, source: "wikidata", verifiedAt: "2026-09-16" },
  fukuoka: { lat: 33.5895, lon: 130.3815, source: "wikidata", verifiedAt: "2026-09-16" },
  sapporo: { lat: 43.062, lon: 141.354, source: "wikidata", verifiedAt: "2026-09-16" },
  nagoya: { lat: 35.17, lon: 136.906, source: "wikidata", verifiedAt: "2026-09-16" },
  hiroshima: { lat: 34.391, lon: 132.462, source: "wikidata", verifiedAt: "2026-09-16" },
  nagasaki: { lat: 32.75, lon: 129.87, source: "wikidata", verifiedAt: "2026-09-16" },
  kanazawa: { lat: 36.5655, lon: 136.6595, source: "wikidata", verifiedAt: "2026-09-16" },
  kobe: { lat: 34.6925, lon: 135.1955, source: "wikidata", verifiedAt: "2026-09-16" },
  berlin: { lat: 52.52, lon: 13.405, source: "wikidata", verifiedAt: "2026-09-16" },
  frankfurt: { lat: 50.112, lon: 8.68, source: "wikidata", verifiedAt: "2026-09-16" },
  naples: { lat: 40.85, lon: 14.254, source: "wikidata", verifiedAt: "2026-09-16" },
  "amalfi-coast": { lat: 40.634, lon: 14.606, source: "wikidata", verifiedAt: "2026-09-16" },
  bologna: { lat: 44.487, lon: 11.339, source: "wikidata", verifiedAt: "2026-09-16" },
  turin: { lat: 45.066, lon: 7.694, source: "wikidata", verifiedAt: "2026-09-16" },
  valencia: { lat: 39.4695, lon: -0.3765, source: "wikidata", verifiedAt: "2026-09-16" },
  malaga: { lat: 36.7212, lon: -4.4212, source: "wikidata", verifiedAt: "2026-09-16" },
  granada: { lat: 37.171, lon: -3.592, source: "wikidata", verifiedAt: "2026-09-16" },
  porto: { lat: 41.141, lon: -8.606, source: "wikidata", verifiedAt: "2026-09-16" },
  brussels: { lat: 50.8495, lon: 4.357, source: "wikidata", verifiedAt: "2026-09-16" },
  stockholm: { lat: 59.3285, lon: 18.078, source: "wikidata", verifiedAt: "2026-09-16" },
  oslo: { lat: 59.911, lon: 10.752, source: "wikidata", verifiedAt: "2026-09-16" },
  reykjavik: { lat: 64.1466, lon: -21.939, source: "wikidata", verifiedAt: "2026-09-16" },
  dublin: { lat: 53.349, lon: -6.26, source: "wikidata", verifiedAt: "2026-09-16" },
  dubrovnik: { lat: 42.6395, lon: 18.1125, source: "wikidata", verifiedAt: "2026-09-16" },
  santorini: { lat: 36.417, lon: 25.43, source: "wikidata", verifiedAt: "2026-09-16" },
  miami: { lat: 25.774, lon: -80.194, source: "wikidata", verifiedAt: "2026-09-16" },
  orlando: { lat: 28.54, lon: -81.38, source: "wikidata", verifiedAt: "2026-09-16" },
  chicago: { lat: 41.879, lon: -87.632, source: "wikidata", verifiedAt: "2026-09-16" },
  "washington-dc": { lat: 38.893, lon: -77.028, source: "wikidata", verifiedAt: "2026-09-16" },
  seattle: { lat: 47.612, lon: -122.335, source: "wikidata", verifiedAt: "2026-09-16" },
  "san-diego": { lat: 32.716, lon: -117.158, source: "wikidata", verifiedAt: "2026-09-16" },
  "new-orleans": { lat: 29.95, lon: -90.08, source: "wikidata", verifiedAt: "2026-09-16" },
  cancun: { lat: 21.16, lon: -86.825, source: "wikidata", verifiedAt: "2026-09-16" },
  montreal: { lat: 45.507, lon: -73.567, source: "wikidata", verifiedAt: "2026-09-16" },
  "quebec-city": { lat: 46.807, lon: -71.222, source: "wikidata", verifiedAt: "2026-09-16" },
  brisbane: { lat: -27.469, lon: 153.028, source: "wikidata", verifiedAt: "2026-09-16" },
  "gold-coast": { lat: -28.006, lon: 153.417, source: "wikidata", verifiedAt: "2026-09-16" },
  perth: { lat: -31.953, lon: 115.86, source: "wikidata", verifiedAt: "2026-09-16" },
  queenstown: { lat: -45.032, lon: 168.656, source: "wikidata", verifiedAt: "2026-09-16" },
  wellington: { lat: -41.287, lon: 174.776, source: "wikidata", verifiedAt: "2026-09-16" },
  ubud: { lat: -8.497, lon: 115.26, source: "wikidata", verifiedAt: "2026-09-16" },
  lombok: { lat: -8.485, lon: 116.04, source: "wikidata", verifiedAt: "2026-09-16" },
  "luang-prabang": { lat: 19.89, lon: 102.144, source: "wikidata", verifiedAt: "2026-09-16" },
  kathmandu: { lat: 27.706, lon: 85.313, source: "wikidata", verifiedAt: "2026-09-16" },
  colombo: { lat: 6.928, lon: 79.856, source: "wikidata", verifiedAt: "2026-09-16" },
  male: { lat: 4.174, lon: 73.507, source: "wikidata", verifiedAt: "2026-09-16" },
  mumbai: { lat: 18.955, lon: 72.833, source: "wikidata", verifiedAt: "2026-09-16" },
  jaipur: { lat: 26.919, lon: 75.81, source: "wikidata", verifiedAt: "2026-09-16" },
  goa: { lat: 15.498, lon: 73.827, source: "wikidata", verifiedAt: "2026-09-16" },
  penang: { lat: 5.416, lon: 100.331, source: "wikidata", verifiedAt: "2026-09-16" },
  pattaya: { lat: 12.93, lon: 100.883, source: "wikidata", verifiedAt: "2026-09-16" },
  yangon: { lat: 16.785, lon: 96.156, source: "wikidata", verifiedAt: "2026-09-16" },
  warsaw: { lat: 52.23, lon: 21.016, source: "wikidata", verifiedAt: "2026-09-16" },
  krakow: { lat: 50.058, lon: 19.94, source: "wikidata", verifiedAt: "2026-09-16" },
  tallinn: { lat: 59.437, lon: 24.749, source: "wikidata", verifiedAt: "2026-09-16" },
  zagreb: { lat: 45.81, lon: 15.979, source: "wikidata", verifiedAt: "2026-09-16" },
  split: { lat: 43.505, lon: 16.442, source: "wikidata", verifiedAt: "2026-09-16" },
  geneva: { lat: 46.2005, lon: 6.1445, source: "wikidata", verifiedAt: "2026-09-16" },
  lyon: { lat: 45.754, lon: 4.84, source: "wikidata", verifiedAt: "2026-09-16" },
  nice: { lat: 43.701, lon: 7.265, source: "wikidata", verifiedAt: "2026-09-16" },
  cordoba: { lat: 37.882, lon: -4.784, source: "wikidata", verifiedAt: "2026-09-16" },
  "san-sebastian": { lat: 43.317, lon: -1.982, source: "wikidata", verifiedAt: "2026-09-16" },
  philadelphia: { lat: 39.948, lon: -75.155, source: "wikidata", verifiedAt: "2026-09-16" },
  denver: { lat: 39.74, lon: -104.995, source: "wikidata", verifiedAt: "2026-09-16" },
  nashville: { lat: 36.164, lon: -86.782, source: "wikidata", verifiedAt: "2026-09-16" },
  honolulu: { lat: 21.307, lon: -157.858, source: "wikidata", verifiedAt: "2026-09-16" },
  banff: { lat: 51.176, lon: -115.565, source: "wikidata", verifiedAt: "2026-09-16" },
  tulum: { lat: 20.211, lon: -87.462, source: "wikidata", verifiedAt: "2026-09-16" },
  lima: { lat: -12.05, lon: -77.04, source: "wikidata", verifiedAt: "2026-09-16" },
  "buenos-aires": { lat: -34.608, lon: -58.379, source: "wikidata", verifiedAt: "2026-09-16" },
  adelaide: { lat: -34.928, lon: 138.599, source: "wikidata", verifiedAt: "2026-09-16" },
  cairns: { lat: -16.918, lon: 145.776, source: "wikidata", verifiedAt: "2026-09-16" },
  christchurch: { lat: -43.531, lon: 172.633, source: "wikidata", verifiedAt: "2026-09-16" },
  rotorua: { lat: -38.137, lon: 176.248, source: "wikidata", verifiedAt: "2026-09-16" },
  "cape-town": { lat: -33.919, lon: 18.423, source: "wikidata", verifiedAt: "2026-09-16" },
  cairo: { lat: 30.044, lon: 31.239, source: "wikidata", verifiedAt: "2026-09-16" },
  nairobi: { lat: -1.284, lon: 36.82, source: "wikidata", verifiedAt: "2026-09-16" },
  doha: { lat: 25.3, lon: 51.528, source: "wikidata", verifiedAt: "2026-09-16" },
  "rio-de-janeiro": { lat: -22.911, lon: -43.2, source: "wikidata", verifiedAt: "2026-09-16" },
  cusco: { lat: -13.521, lon: -71.97, source: "wikidata", verifiedAt: "2026-09-16" },
  bogota: { lat: 4.612, lon: -74.07, source: "wikidata", verifiedAt: "2026-09-16" },
  santiago: { lat: -33.448, lon: -70.669, source: "wikidata", verifiedAt: "2026-09-16" },
  havana: { lat: 23.14, lon: -82.366, source: "wikidata", verifiedAt: "2026-09-16" },
  nadi: { lat: -17.779, lon: 177.426, source: "wikidata", verifiedAt: "2026-09-16" },
};

export function getCityCenter(slug: string): CityCenter | null {
  return CITY_CENTERS[slug] ?? null;
}

interface GeoapifyPlaceProperties {
  place_id?: string;
  name?: string;
  name_international?: Record<string, string>;
  categories?: string[];
  address_line1?: string;
  address_line2?: string;
  website?: string;
  opening_hours?: string;
  rating?: number;
  rating_count?: number;
  price_level?: string;
  lat?: number;
  lon?: number;
  datasource?: {
    sourcename?: string;
    attribution?: string;
    raw?: Record<string, unknown>;
  };
  catering?: { cuisine?: string };
}

interface GeoapifyPlacesResponse {
  features?: { properties?: GeoapifyPlaceProperties }[];
  error?: string;
  statusCode?: number;
}

/** OSM/Geoapify 通用评分/价格字段兜底（provider 若开始返回即自动展示）。 */
function optionalRating(p: GeoapifyPlaceProperties): { rating?: number; ratingCount?: number } {
  if (typeof p.rating === "number" && p.rating > 0) {
    return {
      rating: p.rating,
      ratingCount: typeof p.rating_count === "number" ? p.rating_count : undefined,
    };
  }
  return {};
}

function optionalPriceLevel(p: GeoapifyPlaceProperties): string | undefined {
  // Geoapify 免费档不返回 price_level；若未来返回（如 1..4 / free）如实透传。
  return typeof p.price_level === "string" && p.price_level.length > 0
    ? p.price_level
    : undefined;
}

function extractCuisine(p: GeoapifyPlaceProperties): string | undefined {
  const fromCategory = (p.categories ?? []).find(
    (c) => c.startsWith("catering.restaurant.") || c.startsWith("catering.cafe."),
  );
  const suffix = fromCategory?.split(".")[2];
  const cuisine = p.catering?.cuisine ?? suffix;
  if (!cuisine) return undefined;
  // OSM cuisine 可能是 "asian;curry;oriental" 分号列表 → 分词、首字母大写、忠实展示。
  return cuisine
    .split(";")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" · ");
}

function toRestaurant(p: GeoapifyPlaceProperties): Restaurant | null {
  if (!p.place_id || !p.name || typeof p.lat !== "number" || typeof p.lon !== "number") {
    return null;
  }
  // 名称：英文国际名 → OSM name:en → provider 原始名（真实数据，不做翻译）。
  const raw = p.datasource?.raw as Record<string, unknown> | undefined;
  const englishName =
    p.name_international?.en ?? (typeof raw?.["name:en"] === "string" ? (raw?.["name:en"] as string) : undefined);
  const website =
    p.website ??
    (typeof raw?.["website"] === "string" ? (raw["website"] as string) : undefined) ??
    (typeof raw?.["contact:website"] === "string" ? (raw["contact:website"] as string) : undefined);
  return {
    id: p.place_id,
    name: englishName ?? p.name,
    cuisine: extractCuisine(p),
    address: p.address_line2 ?? p.address_line1,
    lat: p.lat,
    lon: p.lon,
    website: website || undefined,
    ...optionalRating(p),
    priceLevel: optionalPriceLevel(p),
    // Geoapify Places 不返回照片 → imageUrl 恒缺省，UI 不显示图片。
    mapUrl: `https://apis.map.qq.com/uri/v1/marker?marker=lat:${p.lat},lng:${p.lon};title:${encodeURIComponent(englishName ?? p.name)}`,
    source: p.datasource?.attribution ?? "© OpenStreetMap contributors",
  };
}

/** 内存缓存：key → { at, result }。TTL 24h；不落盘、不跨日期复用。 */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; result: RestaurantsResult }>();

export interface SearchRestaurantsParams {
  slug: string;
  lat: number;
  lon: number;
  /** 搜索半径（米），200–20000。 */
  radius?: number;
  /** 返回数量，1–12（UI 只展示前 6）。 */
  limit?: number;
}

export async function searchRestaurants(
  params: SearchRestaurantsParams,
): Promise<RestaurantsResult> {
  const { slug, lat, lon } = params;
  const radius = params.radius ?? 2000;
  const limit = params.limit ?? 6;
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    Math.abs(lat) > 90 ||
    Math.abs(lon) > 180 ||
    radius < 200 ||
    radius > 20000 ||
    limit < 1 ||
    limit > 12
  ) {
    return { available: false, reason: "invalid-params" };
  }

  const key = `restaurant|geo|${slug}|${lat.toFixed(5)}|${lon.toFixed(5)}|${radius}|catering.restaurant|${limit}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.result;

  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) {
    return { available: false, reason: "not-configured" };
  }

  const qs = new URLSearchParams({
    categories: "catering.restaurant",
    filter: `circle:${lon},${lat},${radius}`,
    limit: String(limit),
    apiKey,
  });

  let result: RestaurantsResult;
  try {
    const { status, json } = await serverFetchJson(
      `https://api.geoapify.com/v2/places?${qs.toString()}`,
      { timeoutMs: 12_000 },
    );
    if (status === 401 || status === 403) {
      result = { available: false, reason: "auth-error" };
    } else if (status === 429) {
      result = { available: false, reason: "rate-limited" };
    } else if (status !== 200) {
      result = { available: false, reason: "upstream-error" };
    } else {
      const payload = json as GeoapifyPlacesResponse;
      const restaurants = (payload.features ?? [])
        .map((f) => toRestaurant(f.properties ?? {}))
        .filter((r): r is Restaurant => r !== null)
        .slice(0, limit);
      result =
        restaurants.length > 0
          ? { available: true, restaurants }
          : { available: false, reason: "no-results" };
    }
  } catch {
    result = { available: false, reason: "upstream-error" };
  }

  // 空结果/上游错误短缓存（10 分钟），避免每次刷新都打上游；成功结果 24h。
  cache.set(key, { at: Date.now(), result });
  if (!result.available) {
    setTimeout(() => cache.delete(key), 10 * 60 * 1000).unref?.();
  }
  return result;
}

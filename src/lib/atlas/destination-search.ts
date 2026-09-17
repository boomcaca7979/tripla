/**
 * destination-search — 站内目的地搜索（**完全派生自正式 destination 数据**）。
 *
 * 设计约定（用户明确要求）：
 *   · 不接任何 geocoding / places API（Google Places / Mapbox Search 等）——
 *     零网络请求、零新增依赖、结果与 UTRIPLA destination 系统永远一致；
 *   · 不复制城市清单：索引从组件传入的 GeoJSON（源头是 src/data/destinations.ts）**派生**，
 *     destination 数据增减，索引自动跟随（145 → 300 → 1000+ 都不用改这里）；
 *   · 匹配优先级：城市名 > 国家名 > slug（> region），支持无变音符输入
 *     （"cancun" 能命中 "Cancún"）。
 *
 * 性质：纯函数、同步、内存内 —— 145 条是免费的，5000 条也只是几毫秒的线性扫描。
 */

/** 搜索文档：从 destination GeoJSON feature 派生。 */
export interface DestinationSearchDoc {
  slug: string;
  city: string;
  country: string;
  region: string;
  /** GeoJSON 顺序 [lon, lat]，定位相机时直接用 */
  lon: number;
  lat: number;
  major: boolean;
}

interface SearchFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    slug: string;
    city: string;
    country: string;
    region?: string;
    major?: boolean;
  };
}

/** 变音符折叠 + 小写："Cancún" → "cancun" */
function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/** 从 destination GeoJSON features 派生搜索索引（数据变化时重算， useMemo 持有）。 */
export function buildDestinationSearchIndex(features: readonly SearchFeature[]): DestinationSearchDoc[] {
  return features.map((f) => ({
    slug: f.properties.slug,
    city: f.properties.city,
    country: f.properties.country,
    region: f.properties.region ?? "",
    lon: f.geometry.coordinates[0],
    lat: f.geometry.coordinates[1],
    major: Boolean(f.properties.major),
  }));
}

/**
 * 搜索：城市名 > 国家名 > slug（region 兜底）。
 * 返回按相关度排序的前 `limit` 条；空 query 返回 []。
 */
export function searchDestinations(
  index: readonly DestinationSearchDoc[],
  query: string,
  limit = 8,
): DestinationSearchDoc[] {
  const q = normalize(query);
  if (!q) return [];

  const scored: Array<{ doc: DestinationSearchDoc; score: number }> = [];
  for (const doc of index) {
    const city = normalize(doc.city);
    const country = normalize(doc.country);
    const slug = normalize(doc.slug);
    const region = normalize(doc.region);

    let score = 0;
    if (city === q) score = 120;
    else if (city.startsWith(q)) score = 100;
    else if (new RegExp(`\\b${escapeRegExp(q)}`).test(city)) score = 92;
    else if (city.includes(q)) score = 80;
    else if (country.startsWith(q)) score = 60;
    else if (country.includes(q)) score = 50;
    else if (slug.includes(q)) score = 40;
    else if (region && region.includes(q)) score = 30;
    if (score > 0) scored.push({ doc, score });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.doc.city.localeCompare(b.doc.city))
    .slice(0, limit)
    .map((s) => s.doc);
}

/** 仅用于正则转义（query 里可能出现 "(" 这类字符）。 */
function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * region-labels — 地球上的**地区标签锚点**（lon/lat）。
 *
 * 这不是"数据推导"，而是地图制图惯例：每个大洲取一个用于标注的地理参考点
 * （避开高纬度极区与密集城市带），让标签落在大陆内部而不是海洋上。
 * 与 destination 数据无关 —— 地区标签不参与任何筛选或统计。
 *
 * 说明：项目 destination 数据的 `region` 字段只有 4 个值（Asia / Europe /
 * Americas / Oceania），无法直接给出「North America / South America / Africa」，
 * 因此这里使用独立的大洲标注锚点，而不是把 destination.region 硬映射成 6 个大洲。
 */

export interface RegionLabelAnchor {
  id: string;
  /** 显示名（英文，页面上是小型大写标签） */
  label: string;
  lat: number;
  lon: number;
}

export const REGION_LABEL_ANCHORS: readonly RegionLabelAnchor[] = [
  { id: "north-america", label: "North America", lat: 44, lon: -101 },
  { id: "south-america", label: "South America", lat: -13, lon: -60 },
  { id: "europe", label: "Europe", lat: 50, lon: 15 },
  { id: "africa", label: "Africa", lat: 4, lon: 20 },
  { id: "asia", label: "Asia", lat: 42, lon: 88 },
  { id: "oceania", label: "Oceania", lat: -25, lon: 139 },
];

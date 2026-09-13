import type { Destination } from "@/data/destinations";

// ── Climate pattern helpers ─────────────────────────────────────────────
// NASA POWER PRIMARY MIGRATION 后的本模块职责边界：
//
//   本文件**不再是气候权威**。Best-time 的气候数据权威是
//   src/data/climate/nasa-power-canonical-v1.json（NASA POWER 145 anchors /
//   1991–2020 / UTC）。旧的纬度→气候带→定性模板函数
//   （getClimateZone / getMonthlyClimateNote / getMonthRecommendation）
//   已在 migration 中从生产链路移除。
//
//   保留的只有**地理 / 日历辅助函数**（半球、季节月份、月名）——它们由
//   机场纬度的符号与日历推导，不构成任何气候数据断言。

export type Hemisphere = "Northern" | "Southern";
export type ClimateZone =
  | "Tropical"
  | "Subtropical"
  | "Temperate"
  | "Continental"
  | "Desert";

const HEMISPHERE_SEASONS: Record<Hemisphere, Record<"spring" | "summer" | "autumn" | "winter", number[]>> = {
  Northern: {
    spring: [2, 3, 4], // Mar-May (index 0-11)
    summer: [5, 6, 7], // Jun-Aug
    autumn: [8, 9, 10], // Sep-Nov
    winter: [11, 0, 1], // Dec-Feb
  },
  Southern: {
    spring: [8, 9, 10],
    summer: [11, 0, 1],
    autumn: [2, 3, 4],
    winter: [5, 6, 7],
  },
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * 根据 airport.latitude 派生半球。北纬为 Northern，南纬为 Southern。
 * （地理事实，非气候数据。）
 */
export function getHemisphere(dest: Destination): Hemisphere {
  return dest.airport.latitude >= 0 ? "Northern" : "Southern";
}

/**
 * 返回某半球某季节包含的月份 index（0-11）。
 */
export function getSeasonMonths(
  dest: Destination,
  season: "spring" | "summer" | "autumn" | "winter",
): number[] {
  const h = getHemisphere(dest);
  return [...HEMISPHERE_SEASONS[h][season]];
}

export function getMonthName(monthIndex: number): string {
  return MONTH_NAMES[monthIndex] ?? "";
}

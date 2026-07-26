import { DESTINATIONS, type Destination } from "@/data/destinations";

// ── Climate pattern helpers ─────────────────────────────────────────────
// 项目无历史月度气候数据（Open-Meteo API 仅提供未来 7-16 天 forecast）。
// 这里基于机场纬度 + 半球派生"气候带"通用模式，明确标注为 general pattern，
// 非精确实测数据。配合 destination.bestSeason 的具体月份建议使用。

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
 */
export function getHemisphere(dest: Destination): Hemisphere {
  return dest.airport.latitude >= 0 ? "Northern" : "Southern";
}

/**
 * 根据机场纬度派生气候带（粗略分类，非精确）。
 * 参考 Köppen 气候分类的简化版：
 *   |lat| < 23.5  → Tropical
 *   23.5 ≤ |lat| < 35 → Subtropical
 *   35 ≤ |lat| < 50 → Temperate
 *   |lat| ≥ 50 → Continental
 * Dubai (25.25) 单独判为 Desert（已知地理事实）。
 */
export function getClimateZone(dest: Destination): ClimateZone {
  const lat = Math.abs(dest.airport.latitude);
  if (dest.city.toLowerCase() === "dubai") return "Desert";
  if (lat < 23.5) return "Tropical";
  if (lat < 35) return "Subtropical";
  if (lat < 50) return "Temperate";
  return "Continental";
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

/**
 * 基于气候带 + 半球，给出每月的"温度等级"与"降水倾向"通用说明。
 * 这是气候带级别的概括描述，明确标注为 general pattern，
 * 不声称是实测数据。具体月份建议以 destination.bestSeason 为准。
 */
export function getMonthlyClimateNote(dest: Destination, monthIndex: number): {
  tempLevel: "Cold" | "Cool" | "Mild" | "Warm" | "Hot";
  precipTendency: "Dry" | "Low" | "Moderate" | "High";
  note: string;
} {
  const zone = getClimateZone(dest);
  const hemi = getHemisphere(dest);
  const seasons = HEMISPHERE_SEASONS[hemi];
  const isSummer = seasons.summer.includes(monthIndex);
  const isWinter = seasons.winter.includes(monthIndex);
  const isShoulder = seasons.spring.includes(monthIndex) || seasons.autumn.includes(monthIndex);

  let tempLevel: "Cold" | "Cool" | "Mild" | "Warm" | "Hot" = "Mild";
  let precipTendency: "Dry" | "Low" | "Moderate" | "High" = "Moderate";
  let note = "";

  switch (zone) {
    case "Tropical":
      // 热带：全年 warm/hot，分干湿季
      tempLevel = isWinter ? "Warm" : "Hot";
      // 简化：北半球热带夏季湿，冬季干；南半球反之
      precipTendency = isSummer ? "High" : isWinter ? "Dry" : "Moderate";
      note = precipTendency === "High"
        ? "Wet season — expect heavy showers and high humidity."
        : precipTendency === "Dry"
          ? "Dry season — sunny and comfortable."
          : "Shoulder season — transitional weather.";
      break;
    case "Subtropical":
      tempLevel = isSummer ? "Hot" : isWinter ? "Cool" : "Mild";
      precipTendency = isSummer ? "High" : isWinter ? "Low" : "Moderate";
      note = isSummer
        ? "Hot and humid with occasional rain."
        : isWinter
          ? "Cool and relatively dry."
          : "Pleasant shoulder season — great for sightseeing.";
      break;
    case "Temperate":
      tempLevel = isSummer ? "Warm" : isWinter ? "Cold" : "Mild";
      precipTendency = "Moderate";
      note = isSummer
        ? "Warm summer — peak tourist season."
        : isWinter
          ? "Cold winter — fewer crowds, lower prices."
          : "Mild shoulder season — ideal for exploring.";
      break;
    case "Continental":
      tempLevel = isSummer ? "Warm" : isWinter ? "Cold" : "Cool";
      precipTendency = isSummer ? "Moderate" : "Low";
      note = isSummer
        ? "Brief warm summer — long daylight hours."
        : isWinter
          ? "Cold and snowy — winter sports season."
          : "Cool and crisp — fall foliage or spring blooms.";
      break;
    case "Desert":
      tempLevel = isSummer ? "Hot" : isWinter ? "Mild" : "Warm";
      precipTendency = "Dry";
      note = isSummer
        ? "Extreme heat — indoor activities recommended during daytime."
        : isWinter
          ? "Mild and sunny — peak season for desert exploration."
          : "Warm and dry — pleasant for outdoor activities.";
      break;
  }

  return { tempLevel, precipTendency, note };
}

export function getMonthName(monthIndex: number): string {
  return MONTH_NAMES[monthIndex] ?? "";
}

/**
 * 根据 destination.bestSeason 与每月气候 note，判断该月属于
 * "best" / "good" / "avoid" 三档。
 * best: climate note 含 "sunny" / "comfortable" / "pleasant" / "peak" / "ideal"
 * avoid: 含 "extreme" / "wet season" / "heavy showers" / "snowy" / "hot and humid"
 */
export function getMonthRecommendation(
  dest: Destination,
  monthIndex: number,
): "best" | "good" | "avoid" {
  const { note } = getMonthlyClimateNote(dest, monthIndex);
  const lower = note.toLowerCase();
  if (
    lower.includes("extreme") ||
    lower.includes("wet season") ||
    lower.includes("heavy showers") ||
    lower.includes("snowy") ||
    lower.includes("hot and humid")
  ) {
    return "avoid";
  }
  if (
    lower.includes("sunny") ||
    lower.includes("comfortable") ||
    lower.includes("pleasant") ||
    lower.includes("peak") ||
    lower.includes("ideal") ||
    lower.includes("dry season")
  ) {
    return "best";
  }
  return "good";
}

// ── Convenience: list all destinations that have a slug ─────────────────

export const BEST_TIME_SLUGS = DESTINATIONS.map((d) => d.slug);

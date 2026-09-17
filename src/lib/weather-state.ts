/**
 * weather-state — 天气状态的**唯一标准化层**（client 与 server 共用、纯函数、零数据导入）。
 *
 * 目标：图标 / 文字 / 环境氛围三者必须来自**同一个**标准化状态，任何一处都不得
 * 自行决定"现在是什么天气"。
 *
 *   WMO weather code（Open-Meteo，项目既有天气源的编码口径）
 *     → normalizeWmoCode()
 *     → NormalizedWeather { id, label, glyph, bucket }
 *         · label / glyph 用于首屏天气读数（文字与图标同源）
 *         · bucket → lib/visual-state.ts 的 WeatherId，驱动天空/降水/星点（既有环境管线）
 *
 * 未知即未知：没有映射（含数据缺失、请求失败）时返回 null，
 * 调用方必须显示 "Weather" 通用状态，**不得**默认成晴天。
 */

import type { WeatherId } from "./visual-state";

// ── 标准化状态 ────────────────────────────────────────────────────────

export type WeatherStateId =
  | "clear"
  | "mostly-clear"
  | "partly-cloudy"
  | "overcast"
  | "fog"
  | "drizzle"
  | "rain"
  | "heavy-rain"
  | "freezing-rain"
  | "snow"
  | "heavy-snow"
  | "sleet"
  | "showers"
  | "heavy-showers"
  | "snow-showers"
  | "thunderstorm"
  | "thunderstorm-hail";

export interface NormalizedWeather {
  id: WeatherStateId;
  /** 展示文字（英文，与图标同源）。 */
  label: string;
  /** 展示图标（沿用既有 mono glyph 语言）。 */
  glyph: string;
  /** 环境氛围分档（既有 WeatherId 体系，不改动视觉管线）。 */
  bucket: WeatherId;
}

/**
 * 全部标准化状态表。
 * glyph 与既有 ut-wx-glyph 语言一致：○ 晴 / ◌ 云 / ╱ 雨 / ∗ 雪 / ⚡ 雷 / ≡ 雾 / · 未知。
 */
export const WEATHER_STATES: Record<WeatherStateId, NormalizedWeather> = {
  clear: { id: "clear", label: "Clear", glyph: "○", bucket: "clear" },
  "mostly-clear": { id: "mostly-clear", label: "Mostly clear", glyph: "○", bucket: "clear" },
  "partly-cloudy": { id: "partly-cloudy", label: "Partly cloudy", glyph: "◌", bucket: "cloudy" },
  overcast: { id: "overcast", label: "Overcast", glyph: "◌", bucket: "cloudy" },
  fog: { id: "fog", label: "Fog", glyph: "≡", bucket: "cloudy" },
  drizzle: { id: "drizzle", label: "Drizzle", glyph: "╱", bucket: "rain" },
  rain: { id: "rain", label: "Rain", glyph: "╱", bucket: "rain" },
  "heavy-rain": { id: "heavy-rain", label: "Heavy rain", glyph: "╱", bucket: "rain" },
  "freezing-rain": { id: "freezing-rain", label: "Freezing rain", glyph: "╱", bucket: "rain" },
  showers: { id: "showers", label: "Showers", glyph: "╱", bucket: "rain" },
  "heavy-showers": { id: "heavy-showers", label: "Heavy showers", glyph: "╱", bucket: "rain" },
  snow: { id: "snow", label: "Snow", glyph: "∗", bucket: "snow" },
  "heavy-snow": { id: "heavy-snow", label: "Heavy snow", glyph: "∗", bucket: "snow" },
  sleet: { id: "sleet", label: "Sleet", glyph: "∗", bucket: "snow" },
  "snow-showers": { id: "snow-showers", label: "Snow showers", glyph: "∗", bucket: "snow" },
  thunderstorm: { id: "thunderstorm", label: "Thunderstorm", glyph: "⚡", bucket: "storm" },
  "thunderstorm-hail": { id: "thunderstorm-hail", label: "Thunderstorm with hail", glyph: "⚡", bucket: "storm" },
};

/**
 * 未知天气的展示口径：中性 glyph + 明确"无读数"，不进入任何氛围分档。
 * （用 null 表示"未知"，不造一个假的"晴天"状态对象。）
 *
 * 说明：外层读数标题已经写明 "Weather" / "Weather · <city>"，所以这里的**取值**
 * 用 "Unavailable"，避免出现 "Weather · Weather" 这种重复；关键约束是不出现
 * Sunny/Clear 这类断言。
 */
export const UNKNOWN_WEATHER_VALUE = "Unavailable";
export const UNKNOWN_WEATHER_GLYPH = "·";

/** 展示取值：未知 → "Unavailable"。 */
export function weatherLabel(w: NormalizedWeather | null): string {
  return w?.label ?? UNKNOWN_WEATHER_VALUE;
}

/** 展示图标：未知 → 中性 glyph（绝不是太阳）。 */
export function weatherGlyph(w: NormalizedWeather | null): string {
  return w?.glyph ?? UNKNOWN_WEATHER_GLYPH;
}

// ── WMO weather code → 标准化状态（Open-Meteo 口径） ───────────────────

/**
 * WMO 4677 / Open-Meteo weather_code 映射表。
 * 未列出的 code 一律返回 null（未知），不做近似猜测。
 */
const WMO_MAP: Record<number, WeatherStateId> = {
  0: "clear",
  1: "mostly-clear",
  2: "partly-cloudy",
  3: "overcast",
  45: "fog",
  48: "fog", // depositing rime fog
  51: "drizzle",
  53: "drizzle",
  55: "drizzle",
  56: "freezing-rain", // freezing drizzle
  57: "freezing-rain",
  61: "rain", // slight rain
  63: "rain",
  65: "heavy-rain",
  66: "freezing-rain",
  67: "freezing-rain",
  71: "snow", // slight snow
  73: "snow",
  75: "heavy-snow",
  77: "sleet", // snow grains
  80: "showers", // slight rain showers
  81: "showers",
  82: "heavy-showers",
  85: "snow-showers",
  86: "snow-showers",
  95: "thunderstorm",
  96: "thunderstorm-hail",
  99: "thunderstorm-hail",
};

/** WMO code → 标准化状态；未知 code 返回 null（不猜）。 */
export function normalizeWmoCode(code: number | null | undefined): NormalizedWeather | null {
  if (code === null || code === undefined || !Number.isFinite(code)) return null;
  const id = WMO_MAP[code];
  return id ? WEATHER_STATES[id] : null;
}

/** 标准化状态 → 环境分档（视觉管线仍用既有 WeatherId）。 */
export function weatherIdFor(w: NormalizedWeather | null): WeatherId | null {
  return w ? w.bucket : null;
}

// ── 真实天气读取（复用项目既有 /api/weather，不新建第二套天气系统） ──────

export interface CurrentWeatherReading {
  /** 标准化状态；null = 未知（调用方显示 "Weather"）。 */
  condition: NormalizedWeather | null;
  /** 是否白昼（数据源提供时）。 */
  isDay: boolean | null;
  /** 气温（数据源提供时，摄氏度）。 */
  temperatureC: number | null;
}

/**
 * 读取指定坐标的**当前**天气。
 * · 复用既有 /api/weather 路由（current=1 分支，Open-Meteo weather_code）。
 * · 任何失败 / 数据缺失 → 返回全 null，绝不回退到伪造天气。
 * · 不抛异常：调用方无需 try/catch。
 */
export async function fetchCurrentWeather(
  latitude: number,
  longitude: number,
  timeZone: string,
  signal?: AbortSignal,
): Promise<CurrentWeatherReading> {
  const empty: CurrentWeatherReading = { condition: null, isDay: null, temperatureC: null };
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return empty;
  try {
    const qs = new URLSearchParams({
      lat: String(latitude),
      lon: String(longitude),
      tz: timeZone || "UTC",
      current: "1",
    });
    const res = await fetch(`/api/weather?${qs.toString()}`, { signal });
    if (!res.ok) return empty;
    const data: unknown = await res.json();
    const current = (data as { current?: Record<string, unknown> })?.current;
    if (!current) return empty; // 例如路由回退到 mock：没有 current → 视为未知
    const code = current.weather_code;
    const condition = normalizeWmoCode(typeof code === "number" ? code : null);
    return {
      condition,
      isDay: typeof current.is_day === "number" ? current.is_day === 1 : null,
      temperatureC: typeof current.temperature_2m === "number" ? current.temperature_2m : null,
    };
  } catch {
    return empty;
  }
}

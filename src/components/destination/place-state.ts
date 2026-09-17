import type { Season, WeatherId } from "@/lib/visual-state";

/**
 * Destination Place State — 展示层纯函数/常量（无 directive，server 与 client 共用）。
 *
 * 时间与天气的“真值”一律来自 src/lib/visual-state.ts（单一真相源），
 * 本文件只负责把它们变成可读的仪器读数，不新建任何时间/天气系统。
 */

export const SEASON_LABEL: Record<Season, string> = {
  spring: "Spring",
  summer: "Summer",
  autumn: "Autumn",
  winter: "Winter",
};

export const WEATHER_LABEL: Record<WeatherId, string> = {
  clear: "Clear",
  cloudy: "Cloudy",
  rain: "Rain",
  snow: "Snow",
  storm: "Storm",
};

/**
 * 目的地当地时间读数（24 小时制，如 "14:32"）。
 * 使用 Intl + 目的地 IANA timeZone 直接格式化，避免手写取模造成的进位漂移。
 * 仅在 hydration 之后的 effect 中调用 —— 不参与 SSR 渲染。
 */
export function localTimeLabel(timeZone: string, date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  };
  try {
    return new Intl.DateTimeFormat("en-GB", { ...options, timeZone }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-GB", options).format(date);
  }
}

/** 首字母大写（travelStyle / interests 等枚举值展示用）。 */
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

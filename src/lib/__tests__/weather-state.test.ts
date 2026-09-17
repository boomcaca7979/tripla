import { describe, expect, it } from "vitest";
import {
  WEATHER_STATES,
  UNKNOWN_WEATHER_VALUE,
  normalizeWmoCode,
  weatherGlyph,
  weatherIdFor,
  weatherLabel,
} from "@/lib/weather-state";

describe("normalizeWmoCode — WMO code → 标准化天气状态", () => {
  it("覆盖需求要求的最小状态集（含图标与文字一一对应）", () => {
    // Clear / Sunny
    expect(normalizeWmoCode(0)?.label).toBe("Clear");
    expect(normalizeWmoCode(0)?.glyph).toBe("○");
    // Partly cloudy
    expect(normalizeWmoCode(2)?.label).toBe("Partly cloudy");
    // Cloudy / Overcast
    expect(normalizeWmoCode(3)?.label).toBe("Overcast");
    // Rain
    expect(normalizeWmoCode(63)?.label).toBe("Rain");
    // Heavy rain
    expect(normalizeWmoCode(65)?.label).toBe("Heavy rain");
    // Thunderstorm
    expect(normalizeWmoCode(95)?.label).toBe("Thunderstorm");
    // Snow / Heavy snow
    expect(normalizeWmoCode(73)?.label).toBe("Snow");
    expect(normalizeWmoCode(75)?.label).toBe("Heavy snow");
    // Fog / Mist
    expect(normalizeWmoCode(45)?.label).toBe("Fog");
    expect(normalizeWmoCode(48)?.label).toBe("Fog");
  });

  it("每一个状态都有自己的 glyph，且同分档内图标与文字同源", () => {
    for (const state of Object.values(WEATHER_STATES)) {
      expect(state.glyph.length).toBeGreaterThan(0);
      expect(weatherIdFor(state)).toBe(state.bucket);
      expect(weatherGlyph(state)).toBe(state.glyph);
      expect(weatherLabel(state)).toBe(state.label);
    }
  });

  it("不同天气的图标不全是同一个（不是永远太阳）", () => {
    const glyphs = new Set(Object.values(WEATHER_STATES).map((s) => s.glyph));
    expect(glyphs.size).toBeGreaterThanOrEqual(5);
    expect(glyphs.has("○")).toBe(true); // 晴
    expect(glyphs.has("◌")).toBe(true); // 云
    expect(glyphs.has("╱")).toBe(true); // 雨
    expect(glyphs.has("∗")).toBe(true); // 雪
    expect(glyphs.has("⚡")).toBe(true); // 雷
    expect(glyphs.has("≡")).toBe(true); // 雾
  });

  it("未知 code / 缺失数据 → null（显示 Unavailable，绝不默认成晴天）", () => {
    expect(normalizeWmoCode(null)).toBeNull();
    expect(normalizeWmoCode(undefined)).toBeNull();
    expect(normalizeWmoCode(Number.NaN)).toBeNull();
    expect(normalizeWmoCode(1234)).toBeNull();
    expect(weatherLabel(null)).toBe(UNKNOWN_WEATHER_VALUE);
    expect(weatherGlyph(null)).not.toBe("○");
    expect(weatherIdFor(null)).toBeNull();
  });

  it("氛围分档映射到既有 WeatherId（视觉管线不变）", () => {
    expect(normalizeWmoCode(1)?.["bucket"]).toBe("clear");
    expect(normalizeWmoCode(45)?.["bucket"]).toBe("cloudy");
    expect(normalizeWmoCode(61)?.["bucket"]).toBe("rain");
    expect(normalizeWmoCode(71)?.["bucket"]).toBe("snow");
    expect(normalizeWmoCode(99)?.["bucket"]).toBe("storm");
  });
});

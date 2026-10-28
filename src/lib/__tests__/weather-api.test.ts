/**
 * toWeatherDays — Open-Meteo `daily` 并行数组对象 → WeatherDay[]。
 *
 * 背景：/api/weather 返回的 `daily` 是 `{ time: [...], temperature_2m_max: [...] }`
 * 这样的**对象**；useItinerary 曾直接把它当 WeatherDay[] 传给 /api/itinerary，
 * 服务端 .map() 抛 TypeError → 裸 500（2026-10-28 生产实测）。
 */

import { describe, expect, it } from "vitest";
import { toWeatherDays } from "@/lib/api/weather";

const RAW_DAILY = {
  time: ["2026-11-15", "2026-11-16"],
  temperature_2m_max: [16.2, 17.1],
  temperature_2m_min: [11.4, 12.0],
  precipitation_sum: [0, 0.2],
  wind_speed_10m_max: [9.7, 18.8],
  weather_code: [45, 3],
  uv_index_max: [3.1, 2.8],
  sunrise: ["2026-11-15T06:00:00", "2026-11-16T06:00:00"],
  sunset: ["2026-11-15T16:30:00", "2026-11-16T16:30:00"],
};

describe("toWeatherDays", () => {
  it("并行数组对象 → 按日期逐位压缩成 WeatherDay[]", () => {
    const days = toWeatherDays(RAW_DAILY);
    expect(days).toHaveLength(2);
    expect(days[0]).toEqual({
      date: "2026-11-15",
      temperatureMax: 16.2,
      temperatureMin: 11.4,
      precipitationSum: 0,
      windSpeedMax: 9.7,
      weatherCode: 45,
      uvIndexMax: 3.1,
      sunriseISO: "2026-11-15T06:00:00",
      sunsetISO: "2026-11-15T16:30:00",
    });
    expect(days[1].weatherCode).toBe(3);
  });

  it("缺任一数组字段 → 其余字段 undefined，不抛异常", () => {
    const days = toWeatherDays({ time: ["2026-11-15"] });
    expect(days).toHaveLength(1);
    expect(days[0].date).toBe("2026-11-15");
    expect(days[0].temperatureMax).toBeUndefined();
  });

  it("time 里的非字符串项被过滤（不产出垃圾日期）", () => {
    const days = toWeatherDays({ ...RAW_DAILY, time: ["2026-11-15", null, 42] });
    expect(days.map((d) => d.date)).toEqual(["2026-11-15"]);
  });

  it("非对象输入（null / undefined / 数组）→ 空数组，不抛异常", () => {
    expect(toWeatherDays(null)).toEqual([]);
    expect(toWeatherDays(undefined)).toEqual([]);
    expect(toWeatherDays(["2026-11-15"])).toEqual([]);
    expect(toWeatherDays("daily")).toEqual([]);
  });

  it("空对象 → 空数组", () => {
    expect(toWeatherDays({})).toEqual([]);
  });
});

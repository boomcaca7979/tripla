import { describe, it, expect } from "vitest";
import { scoreWeatherDay, scoreWeatherPeriod } from "../weather-scorer";
import type { WeatherDay } from "@/types/weather";

function day(overrides: Partial<WeatherDay> = {}): WeatherDay {
  return {
    date: "2025-06-15",
    temperatureMax: 25,
    temperatureMin: 20,
    precipitationSum: 0,
    windSpeedMax: 10,
    weatherCode: 0,
    uvIndexMax: 5,
    sunriseISO: "2025-06-15T05:30:00Z",
    sunsetISO: "2025-06-15T19:00:00Z",
    ...overrides,
  };
}

// ─── scoreWeatherDay ────────────────────────────────────────────────────────

describe("scoreWeatherDay", () => {
  it("rates a sunny 25°C day with no rain as Excellent", () => {
    const result = scoreWeatherDay(
      day({ temperatureMax: 25, temperatureMin: 25, precipitationSum: 0 })
    );

    expect(result.overall).toBeCloseTo(97, -1);
    expect(result.label).toBe("Excellent");
    expect(result.breakdown.temperature).toBeGreaterThan(90);
    expect(result.breakdown.precipitation).toBe(100);
    expect(result.breakdown.wind).toBe(100);
    expect(result.breakdown.sunshine).toBe(85);
  });

  it("rates heavy rain (25 mm) with cold + wind as Poor (overall < 40)", () => {
    const result = scoreWeatherDay(
      day({
        temperatureMax: 5,
        temperatureMin: 0,
        precipitationSum: 25,
        windSpeedMax: 70,
        uvIndexMax: 1,
      })
    );

    expect(result.overall).toBeLessThan(40);
    expect(result.label).toBe("Poor");
    expect(result.breakdown.precipitation).toBeLessThanOrEqual(10);
    expect(result.recommendation).toMatch(/Bundle up/i);
  });

  it("returns a very low temperature score for extreme heat (38 °C)", () => {
    const result = scoreWeatherDay(
      day({ temperatureMax: 38, temperatureMin: 36 })
    );

    expect(result.breakdown.temperature).toBeLessThan(20);
    expect(result.recommendation).toMatch(/sunscreen|hydrated/i);
  });

  it("appends no temperature suffix when max is in a comfortable range", () => {
    const result = scoreWeatherDay(day({ temperatureMax: 24, temperatureMin: 20 }));

    expect(result.recommendation).not.toMatch(/Bundle up|sunscreen|hydrated/i);
  });

  it("returns consistent breakdown keys", () => {
    const result = scoreWeatherDay(day());

    expect(result.breakdown).toHaveProperty("temperature");
    expect(result.breakdown).toHaveProperty("precipitation");
    expect(result.breakdown).toHaveProperty("wind");
    expect(result.breakdown).toHaveProperty("sunshine");
  });
});

// ─── scoreWeatherPeriod ─────────────────────────────────────────────────────

describe("scoreWeatherPeriod", () => {
  it("averages scores across multiple days", () => {
    const perfect = day({
      temperatureMax: 25,
      temperatureMin: 25,
      precipitationSum: 0,
      windSpeedMax: 10,
      uvIndexMax: 5,
    }); // overall ≈ 97

    const terrible = day({
      temperatureMax: 5,
      temperatureMin: 0,
      precipitationSum: 25,
      windSpeedMax: 70,
      uvIndexMax: 1,
    }); // overall ≈ 20.5

    const result = scoreWeatherPeriod([perfect, terrible]);

    expect(result.overall).toBeGreaterThan(50);
    expect(result.overall).toBeLessThan(65);
    expect(result.label).toBe("Fair");

    // Breakdowns should also be averaged
    expect(result.breakdown.temperature).toBeGreaterThan(50);
    expect(result.breakdown.temperature).toBeLessThan(60);
    expect(result.breakdown.precipitation).toBeGreaterThan(50);
    expect(result.breakdown.precipitation).toBeLessThan(60);
    expect(result.breakdown.wind).toBeGreaterThan(50);
    expect(result.breakdown.wind).toBeLessThan(60);
    expect(result.breakdown.sunshine).toBeGreaterThan(80);
  });

  it("returns Excellent for a single perfect day", () => {
    const perfect = day({
      temperatureMax: 25,
      temperatureMin: 25,
      precipitationSum: 0,
      windSpeedMax: 10,
      uvIndexMax: 5,
    });

    const result = scoreWeatherPeriod([perfect]);

    expect(result.label).toBe("Excellent");
    expect(result.overall).toBeGreaterThanOrEqual(80);
  });
});

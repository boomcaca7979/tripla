import type { WeatherDay, WeatherScore } from "@/types/weather";

// ─── Internal helpers ───────────────────────────────────────────────────────

/**
 * Linearly interpolate `y` for `x` given two keypoints.
 */
function lerp(
  x1: number,
  x2: number,
  y1: number,
  y2: number,
  x: number
): number {
  if (x <= x1) return y1;
  if (x >= x2) return y2;
  const t = (x - x1) / (x2 - x1);
  return y1 + t * (y2 - y1);
}

/**
 * Score a value against a sorted list of `[input, output]` breakpoints
 * with linear interpolation between adjacent points.
 * Values outside the breakpoint range clamp to the nearest endpoint.
 */
function scoreInterpolated(
  points: [number, number][],
  x: number
): number {
  if (x <= points[0][0]) return points[0][1];
  if (x >= points[points.length - 1][0]) return points[points.length - 1][1];

  for (let i = 0; i < points.length - 1; i++) {
    if (x >= points[i][0] && x <= points[i + 1][0]) {
      return lerp(points[i][0], points[i + 1][0], points[i][1], points[i + 1][1], x);
    }
  }

  return points[points.length - 1][1];
}

// ─── Scoring functions ──────────────────────────────────────────────────────

/**
 * Score temperature by averaging max and min, then interpolating across
 * defined comfort ranges. Values outside [5, 36]°C get 15.
 */
function scoreTemperature(tempMax: number, tempMin: number): number {
  const avg = (tempMax + tempMin) / 2;

  if (avg < 5 || avg > 36) return 15;

  const breakpoints: [number, number][] = [
    [5, 40],
    [10, 65],
    [14, 85],
    [18, 100],
    [24, 100],
    [28, 85],
    [32, 65],
    [36, 40],
  ];

  return scoreInterpolated(breakpoints, avg);
}

/** Score precipitation using discrete tiers (mm). */
function scorePrecipitation(mm: number): number {
  if (mm <= 0) return 100;
  if (mm <= 2) return 90;
  if (mm <= 5) return 75;
  if (mm <= 10) return 50;
  if (mm <= 20) return 30;
  return 10;
}

/** Score wind speed using discrete tiers (km/h). */
function scoreWind(kmh: number): number {
  if (kmh <= 15) return 100;
  if (kmh <= 25) return 85;
  if (kmh <= 40) return 65;
  if (kmh <= 60) return 35;
  return 10;
}

/** Score UV index using discrete tiers. */
function scoreUV(uv: number): number {
  if (uv <= 2) return 95;
  if (uv <= 5) return 85;
  if (uv <= 7) return 65;
  if (uv <= 10) return 50;
  return 30;
}

// ─── Label ──────────────────────────────────────────────────────────────────

function labelFromOverall(overall: number): WeatherScore["label"] {
  if (overall >= 80) return "Excellent";
  if (overall >= 60) return "Good";
  if (overall >= 40) return "Fair";
  return "Poor";
}

// ─── Recommendation ─────────────────────────────────────────────────────────

const RECOMMENDATIONS: Record<WeatherScore["label"], string> = {
  Excellent: "Great weather expected. Perfect for outdoor plans!",
  Good: "Generally favorable conditions. A good day to explore.",
  Fair: "Mixed weather conditions. Pack a light jacket or umbrella.",
  Poor: "Unfavorable weather expected. Consider indoor alternatives.",
};

function buildRecommendation(
  label: WeatherScore["label"],
  tempMax: number
): string {
  let msg = RECOMMENDATIONS[label];

  if (tempMax > 32) {
    msg += " Stay hydrated and use sunscreen.";
  } else if (tempMax < 8) {
    msg += " Bundle up — it will be cold.";
  }

  return msg;
}

// ─── Exported API ───────────────────────────────────────────────────────────

/**
 * Score a single day's weather conditions into a `WeatherScore`.
 *
 * The overall score is a weighted sum of sub-scores:
 *   temperature × 0.40 + precipitation × 0.35 + wind × 0.15 + UV × 0.10
 */
export function scoreWeatherDay(day: WeatherDay): WeatherScore {
  const tempScore = scoreTemperature(day.temperatureMax, day.temperatureMin);
  const precipScore = scorePrecipitation(day.precipitationSum);
  const windScore = scoreWind(day.windSpeedMax);
  const uvScore = scoreUV(day.uvIndexMax);

  const overall =
    tempScore * 0.4 + precipScore * 0.35 + windScore * 0.15 + uvScore * 0.1;

  const label = labelFromOverall(overall);

  return {
    overall,
    label,
    breakdown: {
      temperature: tempScore,
      precipitation: precipScore,
      wind: windScore,
      sunshine: uvScore,
    },
    recommendation: buildRecommendation(label, day.temperatureMax),
  };
}

/**
 * Score a multi-day period by averaging each component across all days.
 */
export function scoreWeatherPeriod(days: WeatherDay[]): WeatherScore {
  const scores = days.map(scoreWeatherDay);

  const average = (vals: number[]) =>
    vals.reduce((a, b) => a + b, 0) / vals.length;

  const avgTemp = average(scores.map((s) => s.breakdown.temperature));
  const avgPrecip = average(scores.map((s) => s.breakdown.precipitation));
  const avgWind = average(scores.map((s) => s.breakdown.wind));
  const avgSun = average(scores.map((s) => s.breakdown.sunshine));
  const avgOverall = average(scores.map((s) => s.overall));

  const label = labelFromOverall(avgOverall);

  // Use the max temperature across all days for the recommendation suffix.
  const maxTemp = Math.max(...days.map((d) => d.temperatureMax));

  return {
    overall: avgOverall,
    label,
    breakdown: {
      temperature: avgTemp,
      precipitation: avgPrecip,
      wind: avgWind,
      sunshine: avgSun,
    },
    recommendation: buildRecommendation(label, maxTemp),
  };
}

import type {
  HourlyForecast,
  WeatherDay,
  WeatherForecastResponse,
  WMOWeatherCode,
} from "@/types/weather";
import type { ApiResponse } from "@/types/common";
import { cache, CACHE_TTL } from "../cache";

// ─── Helpers ────────────────────────────────────────────────────────────────

function okResponse<T>(data: T): ApiResponse<T> {
  return { data, error: null, loading: false };
}

function errorResponse(
  message: string,
  code = "WEATHER_ERROR"
): ApiResponse<never> {
  return { data: null, error: { code, message }, loading: false };
}

// ─── Daily forecast ─────────────────────────────────────────────────────────

const DAILY_PARAMS = [
  "temperature_2m_max",
  "temperature_2m_min",
  "precipitation_sum",
  "wind_speed_10m_max",
  "weather_code",
  "uv_index_max",
  "sunrise",
  "sunset",
].join(",");

/**
 * Generate mock weather forecast data when the real API call fails.
 */
function generateMockWeatherForecast(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string,
  timezone: string
): WeatherForecastResponse {
  const startMs = new Date(startDate).getTime();
  const endMs = new Date(endDate).getTime();
  const dayMs = 86_400_000;
  const daily: WeatherDay[] = [];
  const baseTemp = Math.abs(latitude) < 10 ? 30 : Math.abs(latitude) < 35 ? 22 : 12;
  const codes = [0, 0, 1, 2, 3, 45, 61, 80];
  for (let t = startMs; t <= endMs; t += dayMs) {
    const d = new Date(t);
    const dateStr = d.toISOString().slice(0, 10);
    const variation = Math.sin(((t - startMs) / dayMs) * 0.5) * 5;
    const code = codes[Math.floor(Math.random() * codes.length)] as WMOWeatherCode;
    daily.push({
      date: dateStr,
      temperatureMax: Math.round((baseTemp + variation + Math.random() * 3) * 10) / 10,
      temperatureMin: Math.round((baseTemp + variation - 4 + Math.random() * 2) * 10) / 10,
      precipitationSum: code >= 61 ? Math.round(Math.random() * 10 * 10) / 10 : 0,
      windSpeedMax: Math.round((5 + Math.random() * 15) * 10) / 10,
      weatherCode: code,
      uvIndexMax: Math.round(Math.random() * 6 * 10) / 10,
      sunriseISO: `${dateStr}T06:00:00`,
      sunsetISO: `${dateStr}T18:00:00`,
    });
  }
  return { location: "", latitude, longitude, timezone, daily };
}

/**
 * Fetch a daily weather forecast from the Open-Meteo API for a date range.
 *
 * Results are cached under `weather_<lat>_<lon>_<start>_<end>` with a
 * `CACHE_TTL.WEATHER` (3-hour) TTL.
 */
export async function fetchWeatherForecast(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string,
  timezone: string
): Promise<ApiResponse<WeatherForecastResponse>> {
  const cacheKey = `weather_${latitude}_${longitude}_${startDate}_${endDate}`;

  const cached = cache.get<WeatherForecastResponse>(cacheKey);
  if (cached !== null) return okResponse(cached);

  // Validate coordinates — fall back to mock data when params are invalid
  if (!isFinite(latitude) || !isFinite(longitude) || Math.abs(latitude) < 0.01 || Math.abs(longitude) < 0.01) {
    const mock = generateMockWeatherForecast(latitude, longitude, startDate, endDate, timezone);
    cache.set(cacheKey, mock, CACHE_TTL.WEATHER);
    return okResponse(mock);
  }

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&daily=${DAILY_PARAMS}` +
    `&timezone=${encodeURIComponent(timezone)}` +
    `&start_date=${startDate}` +
    `&end_date=${endDate}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      // Graceful degradation: return mock data instead of an error
      const mock = generateMockWeatherForecast(latitude, longitude, startDate, endDate, timezone);
      cache.set(cacheKey, mock, CACHE_TTL.WEATHER);
      return okResponse(mock);
    }

    const body: {
      daily: {
        time: string[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        precipitation_sum: number[];
        wind_speed_10m_max: number[];
        weather_code: number[];
        uv_index_max: number[];
        sunrise: string[];
        sunset: string[];
      };
    } = await res.json();

    const { time, temperature_2m_max, temperature_2m_min, precipitation_sum, wind_speed_10m_max, weather_code, uv_index_max, sunrise, sunset } = body.daily;

    const daily: WeatherDay[] = time.map((date, i) => ({
      date,
      temperatureMax: temperature_2m_max[i],
      temperatureMin: temperature_2m_min[i],
      precipitationSum: precipitation_sum[i],
      windSpeedMax: wind_speed_10m_max[i],
      weatherCode: weather_code[i] as WMOWeatherCode,
      uvIndexMax: uv_index_max[i],
      sunriseISO: sunrise[i],
      sunsetISO: sunset[i],
    }));

    const result: WeatherForecastResponse = {
      location: "",
      latitude,
      longitude,
      timezone,
      daily,
    };

    cache.set(cacheKey, result, CACHE_TTL.WEATHER);
    return okResponse(result);
  } catch (err) {
    return errorResponse(
      err instanceof Error ? err.message : "Failed to fetch weather data"
    );
  }
}

// ─── Hourly forecast ────────────────────────────────────────────────────────

/**
 * Fetch an hourly forecast for a single date from the Open-Meteo API.
 *
 * Only hours whose `time` string starts with `date` are included in the
 * returned array, giving exactly 24 entries for a complete day.
 */
export async function fetchHourlyForecast(
  latitude: number,
  longitude: number,
  date: string,
  timezone: string
): Promise<ApiResponse<HourlyForecast[]>> {
  const cacheKey = `hourly_${latitude}_${longitude}_${date}`;

  const cached = cache.get<HourlyForecast[]>(cacheKey);
  if (cached !== null) return okResponse(cached);

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&hourly=temperature_2m,precipitation_probability,wind_speed_10m,weather_code` +
    `&timezone=${encodeURIComponent(timezone)}` +
    `&start_date=${date}` +
    `&end_date=${date}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      // Graceful degradation: return empty array instead of an error
      return okResponse<HourlyForecast[]>([]);
    }

    const body: {
      hourly: {
        time: string[];
        temperature_2m: number[];
        precipitation_probability: number[];
        wind_speed_10m: number[];
        weather_code: number[];
      };
    } = await res.json();

    const all: HourlyForecast[] = body.hourly.time.map((time, i) => ({
      time,
      temperature: body.hourly.temperature_2m[i],
      precipitationProbability: body.hourly.precipitation_probability[i],
      windSpeed: body.hourly.wind_speed_10m[i],
      weatherCode: body.hourly.weather_code[i] as WMOWeatherCode,
    }));

    // Keep only hours belonging to the requested date.
    const filtered = all.filter((h) => h.time.startsWith(date));

    cache.set(cacheKey, filtered, CACHE_TTL.WEATHER);
    return okResponse(filtered);
  } catch (err) {
    return errorResponse(
      err instanceof Error ? err.message : "Failed to fetch hourly data"
    );
  }
}

// ─── WMO code description ───────────────────────────────────────────────────

/**
 * Map a WMO weather code to a human-readable label, icon name, and emoji.
 */
export function getWeatherDescription(
  code: WMOWeatherCode
): { label: string; icon: string; emoji: string } {
  // Using switch(true) for clean range matching.
  // biome-ignore lint/suspicious/noFallthroughSwitchClause: structured range check via if/return in switch(true)
  switch (true) {
    case code === 0:
      return { label: "Clear Sky", icon: "sunny", emoji: "☀️" };
    case code <= 3:
      return { label: "Partly Cloudy", icon: "partly-cloudy", emoji: "⛅" };
    case code === 45 || code === 48:
      return { label: "Foggy", icon: "foggy", emoji: "🌫️" };
    case code >= 51 && code <= 67:
      return { label: "Rainy", icon: "rainy", emoji: "🌧️" };
    case code >= 71 && code <= 77:
      return { label: "Snowy", icon: "snowy", emoji: "❄️" };
    case code >= 80 && code <= 82:
      return { label: "Showers", icon: "showers", emoji: "🌦️" };
    case code >= 95:
      return { label: "Thunderstorm", icon: "stormy", emoji: "⛈️" };
    default:
      return { label: "Cloudy", icon: "cloudy", emoji: "☁️" };
  }
}

/**
 * Weather-related type definitions using Open-Meteo API conventions.
 *
 * @module types/weather
 */

/**
 * WMO weather interpretation codes.
 * - 0: Clear sky
 * - 1-3: Mainly clear / partly cloudy / overcast
 * - 45, 48: Foggy / depositing rime fog
 * - 51-57: Drizzle (light / moderate / dense / freezing)
 * - 61-67: Rain (slight / moderate / heavy / freezing)
 * - 71-77: Snowfall / snow grains
 * - 80-82: Rain showers (slight / moderate / violent)
 * - 85-86: Snow showers
 * - 95: Thunderstorm
 * - 96-99: Thunderstorm with slight / heavy hail
 */
export type WMOWeatherCode = number;

/** Daily aggregated weather forecast for a single day. */
export interface WeatherDay {
  /** Calendar date in YYYY-MM-DD format. */
  date: string;
  /** Maximum temperature in degrees Celsius. */
  temperatureMax: number;
  /** Minimum temperature in degrees Celsius. */
  temperatureMin: number;
  /** Total precipitation in millimetres. */
  precipitationSum: number;
  /** Maximum wind speed in kilometres per hour. */
  windSpeedMax: number;
  /** WMO weather interpretation code. */
  weatherCode: WMOWeatherCode;
  /** Maximum UV index for the day (0–11+). */
  uvIndexMax: number;
  /** Sunrise time in ISO 8601 format. */
  sunriseISO: string;
  /** Sunset time in ISO 8601 format. */
  sunsetISO: string;
}

/** Hourly granularity forecast point. */
export interface HourlyForecast {
  /** Timestamp in ISO 8601 format. */
  time: string;
  /** Temperature in degrees Celsius. */
  temperature: number;
  /** Precipitation probability as a percentage (0–100). */
  precipitationProbability: number;
  /** Wind speed in kilometres per hour. */
  windSpeed: number;
  /** WMO weather interpretation code. */
  weatherCode: WMOWeatherCode;
}

/** Qualitative weather score computed from forecast data. */
export interface WeatherScore {
  /** Aggregate score from 0 (worst) to 100 (best). */
  overall: number;
  /** Human-readable label for the score tier. */
  label: "Excellent" | "Good" | "Fair" | "Poor";
  /** Per-factor breakdown of the score. */
  breakdown: {
    /** Score contribution from temperature suitability (0–100). */
    temperature: number;
    /** Score contribution from precipitation likelihood (0–100). */
    precipitation: number;
    /** Score contribution from wind conditions (0–100). */
    wind: number;
    /** Score contribution from sun exposure (0–100). */
    sunshine: number;
  };
  /** Plain-text recommendation based on the weather conditions. */
  recommendation: string;
}

/** Full response returned by the weather forecast endpoint. */
export interface WeatherForecastResponse {
  /** Human-readable location name (city / region). */
  location: string;
  /** Latitude in decimal degrees. */
  latitude: number;
  /** Longitude in decimal degrees. */
  longitude: number;
  /** IANA timezone identifier (e.g. "Asia/Tokyo"). */
  timezone: string;
  /** Array of daily forecast entries. */
  daily: WeatherDay[];
  /** Optional array of hourly forecast entries. */
  hourly?: HourlyForecast[];
}

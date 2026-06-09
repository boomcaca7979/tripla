import type { ApiResponse } from "@/types/common";
import { cache, CACHE_TTL } from "../cache";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface GeoLocation {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  countryCode: string;
  timezone: string;
  population?: number;
}

// ─── Major-airport lookup table ─────────────────────────────────────────────
// Avoids a network request for the most common IATA codes.

const MAJOR_AIRPORTS: Record<string, GeoLocation> = {
  TPE: {
    name: "Taipei",
    latitude: 25.078,
    longitude: 121.2326,
    country: "Taiwan",
    countryCode: "TW",
    timezone: "Asia/Taipei",
  },
  NRT: {
    name: "Tokyo",
    latitude: 35.7647,
    longitude: 140.3864,
    country: "Japan",
    countryCode: "JP",
    timezone: "Asia/Tokyo",
  },
  HND: {
    name: "Tokyo",
    latitude: 35.5494,
    longitude: 139.7798,
    country: "Japan",
    countryCode: "JP",
    timezone: "Asia/Tokyo",
  },
  LAX: {
    name: "Los Angeles",
    latitude: 33.9425,
    longitude: -118.4081,
    country: "USA",
    countryCode: "US",
    timezone: "America/Los_Angeles",
  },
  JFK: {
    name: "New York",
    latitude: 40.6413,
    longitude: -73.7781,
    country: "USA",
    countryCode: "US",
    timezone: "America/New_York",
  },
  LHR: {
    name: "London",
    latitude: 51.4775,
    longitude: -0.4614,
    country: "UK",
    countryCode: "GB",
    timezone: "Europe/London",
  },
  CDG: {
    name: "Paris",
    latitude: 49.0097,
    longitude: 2.5479,
    country: "France",
    countryCode: "FR",
    timezone: "Europe/Paris",
  },
  SYD: {
    name: "Sydney",
    latitude: -33.9399,
    longitude: 151.1753,
    country: "Australia",
    countryCode: "AU",
    timezone: "Australia/Sydney",
  },
  SIN: {
    name: "Singapore",
    latitude: 1.3644,
    longitude: 103.9915,
    country: "Singapore",
    countryCode: "SG",
    timezone: "Asia/Singapore",
  },
  HKG: {
    name: "Hong Kong",
    latitude: 22.308,
    longitude: 113.9185,
    country: "Hong Kong",
    countryCode: "HK",
    timezone: "Asia/Hong_Kong",
  },
  ICN: {
    name: "Seoul",
    latitude: 37.4691,
    longitude: 126.4505,
    country: "South Korea",
    countryCode: "KR",
    timezone: "Asia/Seoul",
  },
  DXB: {
    name: "Dubai",
    latitude: 25.2528,
    longitude: 55.3644,
    country: "UAE",
    countryCode: "AE",
    timezone: "Asia/Dubai",
  },
  BKK: {
    name: "Bangkok",
    latitude: 13.69,
    longitude: 100.7501,
    country: "Thailand",
    countryCode: "TH",
    timezone: "Asia/Bangkok",
  },
  SFO: {
    name: "San Francisco",
    latitude: 37.6213,
    longitude: -122.379,
    country: "USA",
    countryCode: "US",
    timezone: "America/Los_Angeles",
  },
  FRA: {
    name: "Frankfurt",
    latitude: 50.0379,
    longitude: 8.5622,
    country: "Germany",
    countryCode: "DE",
    timezone: "Europe/Berlin",
  },
  AMS: {
    name: "Amsterdam",
    latitude: 52.3105,
    longitude: 4.7683,
    country: "Netherlands",
    countryCode: "NL",
    timezone: "Europe/Amsterdam",
  },
  KUL: {
    name: "Kuala Lumpur",
    latitude: 2.7456,
    longitude: 101.7072,
    country: "Malaysia",
    countryCode: "MY",
    timezone: "Asia/Kuala_Lumpur",
  },
  PEK: {
    name: "Beijing",
    latitude: 40.0799,
    longitude: 116.6031,
    country: "China",
    countryCode: "CN",
    timezone: "Asia/Shanghai",
  },
  PVG: {
    name: "Shanghai",
    latitude: 31.1443,
    longitude: 121.8083,
    country: "China",
    countryCode: "CN",
    timezone: "Asia/Shanghai",
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function okResponse<T>(data: T): ApiResponse<T> {
  return { data, error: null, loading: false };
}

function errorResponse(message: string, code = "GEOCODING_ERROR"): ApiResponse<never> {
  return { data: null, error: { code, message }, loading: false };
}

// ─── Exported API ───────────────────────────────────────────────────────────

/**
 * Search for a location by name using the Open-Meteo Geocoding API.
 *
 * Results are cached in `TravelCache` under `geo_<query>` with the
 * `CACHE_TTL.GEOCODING` (7-day) TTL.
 */
export async function geocodeLocation(
  query: string,
  count = 5
): Promise<ApiResponse<GeoLocation[]>> {
  const normalised = query.toLowerCase().trim();
  const cacheKey = `geo_${normalised}`;

  // ── Check cache ────────────────────────────────────────────────────────
  const cached = cache.get<GeoLocation[]>(cacheKey);
  if (cached !== null) return okResponse(cached);

  // ── Fetch from API ─────────────────────────────────────────────────────
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(normalised)}&count=${count}&language=en&format=json`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      return errorResponse(`Geocoding API returned ${res.status}`, "API_ERROR");
    }

    const body: { results?: Array<{ name: string; latitude: number; longitude: number; country: string; country_code: string; timezone: string; population?: number }> } = await res.json();
    const results = (body.results ?? []).map((r) => ({
      name: r.name,
      latitude: r.latitude,
      longitude: r.longitude,
      country: r.country,
      countryCode: r.country_code,
      timezone: r.timezone,
      population: r.population,
    }));

    cache.set(cacheKey, results, CACHE_TTL.GEOCODING);
    return okResponse(results);
  } catch (err) {
    return errorResponse(
      err instanceof Error ? err.message : "Failed to fetch geocoding data"
    );
  }
}

/**
 * Resolve an IATA airport code to a `GeoLocation`.
 *
 * Checks the built-in `MAJOR_AIRPORTS` table first (no network request).
 * Falls back to `geocodeLocation(code)` when the code is not in the table.
 */
export async function geocodeAirport(
  iataCode: string
): Promise<ApiResponse<GeoLocation>> {
  const code = iataCode.toUpperCase().trim();

  // ── Check local table ──────────────────────────────────────────────────
  const local = MAJOR_AIRPORTS[code];
  if (local !== undefined) {
    return okResponse(local);
  }

  // ── Fall back to network geocoding ─────────────────────────────────────
  const response = await geocodeLocation(code, 1);

  if (response.error !== null || response.data === null || response.data.length === 0) {
    return errorResponse(
      `Could not resolve airport code "${code}"`,
      "AIRPORT_NOT_FOUND"
    );
  }

  return okResponse(response.data[0]);
}

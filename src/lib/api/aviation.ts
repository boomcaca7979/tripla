import type { Airport, FlightLeg, FlightSearchParams } from "@/types/flight";
import type { ApiResponse } from "@/types/common";
import { cache, CACHE_TTL } from "../cache";

// ─── Helpers ────────────────────────────────────────────────────────────────

function okResponse<T>(data: T): ApiResponse<T> {
  return { data, error: null, loading: false };
}

function errorResponse(
  message: string,
  code = "AVIATION_ERROR"
): ApiResponse<never> {
  return { data: null, error: { code, message }, loading: false };
}

// ─── Flight search ──────────────────────────────────────────────────────────

/**
 * Search for flights between two airports on a given date.
 *
 * Delegates to the Next.js `/api/flights` route (which proxies the
 * aviationstack API). Results are cached under `flight_<dep>_<arr>_<date>`
 * with a `CACHE_TTL.FLIGHT` (1-hour) TTL.
 */
export async function searchFlights(
  params: FlightSearchParams
): Promise<ApiResponse<FlightLeg[]>> {
  const { depIata, arrIata, date } = params;
  const cacheKey = `flight_${depIata}_${arrIata}_${date}`;

  const cached = cache.get<FlightLeg[]>(cacheKey);
  if (cached !== null) return okResponse(cached);

  const query = new URLSearchParams({
    depIata,
    arrIata,
    date,
  });

  try {
    const res = await fetch(`/api/flights?${query}`);

    if (!res.ok) {
      return errorResponse(`Flights API returned ${res.status}`, "API_ERROR");
    }

    const body: ApiResponse<FlightLeg[]> = await res.json();

    if (body.error !== null) {
      return errorResponse(body.error?.message ?? String(body.error), body.error?.code ?? "AVIATION_ERROR");
    }

    if (body.data === null) {
      return okResponse([]);
    }

    cache.set(cacheKey, body.data, CACHE_TTL.FLIGHT);
    return okResponse(body.data);
  } catch (err) {
    return errorResponse(
      err instanceof Error ? err.message : "Failed to search flights"
    );
  }
}

// ─── Flight status ──────────────────────────────────────────────────────────

/**
 * Get the current status of a specific flight on a given date.
 *
 * Delegates to `/api/flights?flightNumber=&date=`. Results are cached
 * under the same `flight_` key namespace for consistency.
 */
export async function getFlightStatus(
  flightNumber: string,
  date: string
): Promise<ApiResponse<FlightLeg>> {
  const cacheKey = `flight_status_${flightNumber}_${date}`;

  const cached = cache.get<FlightLeg>(cacheKey);
  if (cached !== null) return okResponse(cached);

  const query = new URLSearchParams({ flightNumber, date });

  try {
    const res = await fetch(`/api/flights?${query}`);

    if (!res.ok) {
      return errorResponse(`Flight status API returned ${res.status}`, "API_ERROR");
    }

    const body: ApiResponse<FlightLeg[]> = await res.json();

    if (body.error !== null) {
      return errorResponse(body.error?.message ?? String(body.error), body.error?.code ?? "AVIATION_ERROR");
    }

    if (body.data === null || body.data.length === 0) {
      return errorResponse(
        `Flight ${flightNumber} on ${date} not found`,
        "FLIGHT_NOT_FOUND"
      );
    }

    const leg = body.data[0];
    cache.set(cacheKey, leg, CACHE_TTL.FLIGHT);
    return okResponse(leg);
  } catch (err) {
    return errorResponse(
      err instanceof Error ? err.message : "Failed to get flight status"
    );
  }
}

// ─── Airport search ─────────────────────────────────────────────────────────

/**
 * Search for airports by query string.
 *
 * Delegates to the Next.js `/api/geocoding?q=&type=airport` route and maps
 * the `GeoLocation`-shaped response into the `Airport` type.
 * Missing fields (ICAO code, city) are filled with `""`.
 */
export async function searchAirports(
  query: string
): Promise<ApiResponse<Airport[]>> {
  const params = new URLSearchParams({ q: query, type: "airport" });

  try {
    const res = await fetch(`/api/geocoding?${params}`);

    if (!res.ok) {
      return errorResponse(`Airport search API returned ${res.status}`, "API_ERROR");
    }

    const body: ApiResponse<
      Array<{
        name: string;
        latitude: number;
        longitude: number;
        country: string;
        countryCode: string;
        timezone: string;
      }>
    > = await res.json();

    if (body.error !== null) {
      return errorResponse(body.error?.message ?? String(body.error), body.error?.code ?? "AVIATION_ERROR");
    }

    if (body.data === null) {
      return okResponse([]);
    }

    const airports: Airport[] = body.data.map((loc) => ({
      iata: "",
      icao: "",
      name: loc.name,
      city: loc.name,
      country: loc.country,
      timezone: loc.timezone,
      latitude: loc.latitude,
      longitude: loc.longitude,
    }));

    return okResponse(airports);
  } catch (err) {
    return errorResponse(
      err instanceof Error ? err.message : "Failed to search airports"
    );
  }
}

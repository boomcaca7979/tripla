import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from "vitest";
import { geocodeAirport, geocodeLocation } from "../geocoding";
import { cache } from "../../cache";

// ─── geocodeAirport ─────────────────────────────────────────────

describe("geocodeAirport", () => {
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    cache.clear();
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns local data for NRT without any network call", async () => {
    const result = await geocodeAirport("NRT");

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.error).toBeNull();
    expect(result.data).not.toBeNull();
    expect(result.data!.name).toBe("Tokyo");
    expect(result.data!.country).toBe("Japan");
    expect(result.data!.countryCode).toBe("JP");
    expect(result.data!.timezone).toBe("Asia/Tokyo");
  });

  it("returns local data for HND (also Tokyo) without network", async () => {
    const result = await geocodeAirport("HND");

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.data!.name).toBe("Tokyo");
    expect(result.data!.latitude).toBeCloseTo(35.5494, 2);
  });

  it("falls back to network fetch for an unknown IATA code", async () => {
    const mockGeoResult = {
      name: "Fallback City",
      latitude: 10.0,
      longitude: 20.0,
      country: "Fallback",
      country_code: "FB",
      timezone: "Fallback/Fallback",
    };

    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ results: [mockGeoResult] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await geocodeAirport("XYZ");

    // Should have made a network call
    expect(fetchSpy).toHaveBeenCalledOnce();
    // URL should be a geocoding endpoint mentioning "xyz"
    const url = fetchSpy.mock.calls[0][0] as string;
    expect(url).toContain("xyz");

    expect(result.error).toBeNull();
    expect(result.data).not.toBeNull();
    expect(result.data!.name).toBe("Fallback City");
    expect(result.data!.country).toBe("Fallback");
  });

  it("handles lowercase IATA input (normalises to uppercase)", async () => {
    const result = await geocodeAirport("lhr");

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.data!.name).toBe("London");
    expect(result.data!.country).toBe("UK");
  });

  it("returns AIRPORT_NOT_FOUND when fallback geocoding fails", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(null, { status: 502 }),
    );

    const result = await geocodeAirport("XYZ");

    expect(result.error).not.toBeNull();
    expect(result.error!.code).toBe("AIRPORT_NOT_FOUND");
  });
});

// ─── geocodeLocation ────────────────────────────────────────────

describe("geocodeLocation", () => {
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    cache.clear();
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("caches results so the second call skips the network", async () => {
    const mockResults = {
      results: [
        {
          name: "Paris",
          latitude: 48.8566,
          longitude: 2.3522,
          country: "France",
          country_code: "FR",
          timezone: "Europe/Paris",
        },
      ],
    };

    // First call — no cached data → fetch
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify(mockResults), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const first = await geocodeLocation("Paris");
    expect(first.error).toBeNull();
    expect(first.data).toHaveLength(1);
    expect(first.data![0].name).toBe("Paris");
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // Second call — should hit the cache → no fetch
    const second = await geocodeLocation("Paris");
    expect(second.error).toBeNull();
    expect(second.data).toHaveLength(1);
    expect(second.data![0].name).toBe("Paris");
    expect(fetchSpy).toHaveBeenCalledTimes(1); // still 1, not 2
  });
});

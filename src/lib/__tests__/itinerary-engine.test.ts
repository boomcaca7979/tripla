import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  buildSystemPrompt,
  buildUserMessage,
  generateItinerary,
} from "../itinerary-engine";
import type { TravelPlanInput } from "@/types/itinerary";
import type { WeatherDay } from "@/types/weather";
import type { ExchangeRate } from "@/types/currency";

// ─── Factory helpers ─────────────────────────────────────────────

function sampleInput(overrides: Partial<TravelPlanInput> = {}): TravelPlanInput {
  return {
    origin: {
      iata: "TPE",
      icao: "RCTP",
      name: "Taipei Taoyuan International Airport",
      city: "Taipei",
      country: "Taiwan",
      timezone: "Asia/Taipei",
      latitude: 25.078,
      longitude: 121.2326,
    },
    destination: {
      iata: "NRT",
      icao: "RJAA",
      name: "Narita International Airport",
      city: "Tokyo",
      country: "Japan",
      timezone: "Asia/Tokyo",
      latitude: 35.7647,
      longitude: 140.3864,
    },
    departureDate: "2025-06-15",
    returnDate: "2025-06-18",
    travelStyle: "cultural",
    budgetLevel: "mid-range",
    interests: ["museums", "food"],
    groupSize: 2,
    ...overrides,
  };
}

function sampleWeather(): WeatherDay[] {
  return [
    {
      date: "2025-06-15",
      temperatureMax: 28,
      temperatureMin: 22,
      precipitationSum: 2,
      windSpeedMax: 12,
      weatherCode: 2,
      uvIndexMax: 6,
      sunriseISO: "2025-06-15T04:30:00Z",
      sunsetISO: "2025-06-15T19:00:00Z",
    },
    {
      date: "2025-06-16",
      temperatureMax: 30,
      temperatureMin: 24,
      precipitationSum: 0,
      windSpeedMax: 8,
      weatherCode: 0,
      uvIndexMax: 8,
      sunriseISO: "2025-06-16T04:30:00Z",
      sunsetISO: "2025-06-16T19:00:00Z",
    },
  ];
}

function sampleRate(): ExchangeRate {
  return {
    base: "USD",
    target: "JPY",
    rate: 149.5,
    lastUpdated: "2025-06-08T10:00:00Z",
  };
}

// ─── buildSystemPrompt ──────────────────────────────────────────

describe("buildSystemPrompt", () => {
  it("returns a string containing the JSON interface shape", () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain("day-by-day travel itinerary");
    expect(prompt).toContain("single valid JSON object");
    expect(prompt).toContain("TravelPlanInput");
    expect(prompt).toContain("ItineraryDay");
    expect(prompt).toContain("packingList");
    expect(prompt).toContain("importantNotes");
  });
});

// ─── buildUserMessage ───────────────────────────────────────────

describe("buildUserMessage", () => {
  it("includes the destination city, country, and IATA code", () => {
    const msg = buildUserMessage(sampleInput(), sampleWeather(), null);
    expect(msg).toContain("Tokyo");
    expect(msg).toContain("Japan");
    expect(msg).toContain("NRT");
  });

  it("includes the travel dates", () => {
    const msg = buildUserMessage(sampleInput(), sampleWeather(), null);
    expect(msg).toContain("2025-06-15");
    expect(msg).toContain("2025-06-18");
  });

  it("reports the correct trip duration in days", () => {
    // 2025-06-15 → 2025-06-18 = 3 days
    const msg = buildUserMessage(sampleInput(), sampleWeather(), null);
    expect(msg).toContain("3-day");
  });

  it("handles same-day travel (duration = 1)", () => {
    const input = sampleInput({
      departureDate: "2025-06-15",
      returnDate: "2025-06-15",
    });
    const msg = buildUserMessage(input, sampleWeather(), null);
    expect(msg).toContain("1-day");
  });

  it("includes weather lines with temperature and code", () => {
    const msg = buildUserMessage(sampleInput(), sampleWeather(), null);
    expect(msg).toContain("2025-06-15: 28°C / 22°C, code 2");
    expect(msg).toContain("2025-06-16: 30°C / 24°C, code 0");
  });

  it("includes the exchange rate line when provided", () => {
    const msg = buildUserMessage(sampleInput(), sampleWeather(), sampleRate());
    expect(msg).toContain("Currency: 1 USD = 149.5 JPY");
  });

  it("omits the exchange rate line when null", () => {
    const msg = buildUserMessage(sampleInput(), sampleWeather(), null);
    expect(msg).not.toContain("Currency:");
  });

  it("includes travel style, budget, and interests", () => {
    const msg = buildUserMessage(sampleInput(), sampleWeather(), null);
    expect(msg).toContain("cultural");
    expect(msg).toContain("mid-range");
    expect(msg).toContain("museums");
    expect(msg).toContain("food");
  });

  it("includes the group size", () => {
    const msg = buildUserMessage(sampleInput(), sampleWeather(), null);
    expect(msg).toContain("2 traveler");
  });
});

// ─── generateItinerary ──────────────────────────────────────────

describe("generateItinerary", () => {
  beforeEach(() => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new DOMException("The operation was aborted", "AbortError"),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns ITINERARY_PARSE_ERROR when API returns invalid JSON", async () => {
    vi.mocked(fetch).mockReset();
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await generateItinerary(sampleInput(), sampleWeather(), null);

    expect(result.error).not.toBeNull();
    expect(result.error!.code).toBe("ITINERARY_PARSE_ERROR");
    expect(result.data).toBeNull();
  });

  it("returns API_ERROR on non-200 status", async () => {
    vi.mocked(fetch).mockReset();
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(null, { status: 502, statusText: "Bad Gateway" }),
    );

    const result = await generateItinerary(sampleInput(), sampleWeather(), sampleRate());

    expect(result.error).not.toBeNull();
    expect(result.error!.code).toBe("API_ERROR");
    expect(result.error!.message).toContain("502");
  });

  it("returns TIMEOUT on AbortSignal timeout", async () => {
    vi.mocked(fetch).mockReset();
    vi.mocked(fetch).mockRejectedValueOnce(
      new DOMException("The operation was aborted", "TimeoutError"),
    );

    const result = await generateItinerary(sampleInput(), sampleWeather(), null);

    expect(result.error).not.toBeNull();
    expect(result.error!.code).toBe("TIMEOUT");
  });

  it("returns generic error on network failure", async () => {
    vi.mocked(fetch).mockReset();
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError("Failed to fetch"));

    const result = await generateItinerary(sampleInput(), sampleWeather(), null);

    expect(result.error).not.toBeNull();
    expect(result.error!.message).toContain("Failed to fetch");
  });
});

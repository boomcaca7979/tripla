import type { Itinerary, TravelPlanInput } from "@/types/itinerary";
import type { WeatherDay } from "@/types/weather";
import type { ExchangeRate } from "@/types/currency";
import type { ApiResponse } from "@/types/common";
import { ItinerarySchema } from "./schemas";

// ─── Helpers ────────────────────────────────────────────────────────────────

function okResponse<T>(data: T): ApiResponse<T> {
  return { data, error: null, loading: false };
}

function errorResponse(
  message: string,
  code = "ITINERARY_ERROR"
): ApiResponse<never> {
  return { data: null, error: { code, message }, loading: false };
}

// ─── System prompt ──────────────────────────────────────────────────────────

/**
 * Returns the system prompt for the AI travel planner.
 *
 * The prompt instructs the model to respond with a single valid JSON object
 * matching the `Itinerary` interface — no markdown, no commentary.
 */
export function buildSystemPrompt(): string {
  return [
    "You are a professional travel planner with deep local knowledge.",
    "Your task is to create a detailed, day-by-day travel itinerary.",
    "CRITICAL: Respond ONLY with a single valid JSON object. No markdown code fences, no explanation text, no comments.",
    "The JSON must exactly match this TypeScript interface:",
    "{ id: string, createdAt: string, input: TravelPlanInput, days: ItineraryDay[], totalEstimatedCost: number, currency: string, summary: string, packingList: string[], importantNotes: string[] }",
    "Rules:",
    "- Each day must have 3-5 activities",
    "- Match activities to the specified travelStyle and interests",
    "- Schedule indoor activities (museums, restaurants, spas) on days with weatherCode >= 61 (rain/snow/storm)",
    "- estimatedCost for each activity must be in the destination currency",
    "- packingList should have 8-12 practical items",
    "- importantNotes should have 2-4 items covering visa, customs, tipping, transport",
    "- summary should be 2-3 engaging sentences",
  ].join("\n");
}

// ─── User message ───────────────────────────────────────────────────────────

/**
 * Build the user-facing message that provides trip context and weather data
 * to the AI model.
 */
export function buildUserMessage(
  input: TravelPlanInput,
  weatherData: WeatherDay[],
  exchangeRate: ExchangeRate | null
): string {
  const duration = Math.max(
    1,
    Math.ceil(
      (new Date(input.returnDate).getTime() - new Date(input.departureDate).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  const weatherLines = weatherData
    .map(
      (d) =>
        `${d.date}: ${d.temperatureMax}°C / ${d.temperatureMin}°C, code ${d.weatherCode}`
    )
    .join("\n");

  const exchangeLine =
    exchangeRate !== null
      ? `Currency: 1 ${exchangeRate.base} = ${exchangeRate.rate} ${exchangeRate.target}`
      : "";

  return [
    `Create a ${duration}-day itinerary for ${input.groupSize} traveler(s).`,
    `Destination: ${input.destination.city}, ${input.destination.country} (${input.destination.iata})`,
    `Travel dates: ${input.departureDate} to ${input.returnDate}`,
    `Travel style: ${input.travelStyle} | Budget: ${input.budgetLevel} | Interests: ${input.interests.join(", ")}`,
    "",
    "Weather forecast:",
    weatherLines,
    "",
    exchangeLine,
    "",
    "Generate the JSON itinerary now.",
  ]
    .filter((line) => line !== "")
    .join("\n");
}

// ─── Generate itinerary ─────────────────────────────────────────────────────

/**
 * Generate a complete travel itinerary by calling the `/api/itinerary`
 * endpoint.
 *
 * The request includes the user's travel plan input, weather data, and an
 * optional exchange rate. The response is validated against `ItinerarySchema`
 * before being returned.
 *
 * @param input - User-provided travel plan details.
 * @param weatherData - Daily weather forecasts for the trip period.
 * @param exchangeRate - Current exchange rate (nullable).
 * @returns `ApiResponse` containing the validated `Itinerary`, or an error.
 */
export async function generateItinerary(
  input: TravelPlanInput,
  weatherData: WeatherDay[],
  exchangeRate: ExchangeRate | null
): Promise<ApiResponse<Itinerary>> {
  try {
    const res = await fetch("/api/itinerary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(30_000),
      body: JSON.stringify({ input, weather: weatherData, exchangeRate }),
    });

    if (!res.ok) {
      let detail = `Itinerary API returned ${res.status}`;
      try {
        const errJson = await res.json();
        if (errJson?.message) detail += `: ${errJson.message}`;
        else if (errJson?.error) detail += `: ${typeof errJson.error === "string" ? errJson.error : JSON.stringify(errJson.error)}`;
      } catch {
        // ignore parse error for error response
      }
      return errorResponse(detail, "API_ERROR");
    }

    const json: unknown = await res.json();

    const result = ItinerarySchema.safeParse(json);

    if (!result.success) {
      const message = `Itinerary validation failed: ${result.error?.message ?? "Validation failed"}`;
      return {
        data: null,
        error: { code: "ITINERARY_PARSE_ERROR", message },
        loading: false,
      };
    }

    return okResponse(result.data as unknown as Itinerary);
  } catch (err) {
    if (err instanceof DOMException && err.name === "TimeoutError") {
      return errorResponse("Itinerary generation timed out", "TIMEOUT");
    }

    return errorResponse(
      err instanceof Error ? err.message : String(err ?? "Failed to generate itinerary")
    );
  }
}

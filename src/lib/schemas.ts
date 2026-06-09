import { z } from "zod";

// ─── Flight schemas ─────────────────────────────────────────────────────────

/** IATA 3-letter airport code (e.g. "NRT", "JFK"). */
const IataCode = z.string().length(3);

/** WMO weather interpretation code (numeric). */
const WmoCode = z.number().int().min(0).max(99);

/** ISO 8601 date string in YYYY-MM-DD format. */
const DateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

/** ISO 8601 datetime string. */
const DateTimeString = z.string().datetime();

/**
 * @schema AirportSchema
 * Validates airport information including IATA / ICAO codes.
 */
export const AirportSchema = z.object({
  iata: IataCode,
  icao: z.string().length(4),
  name: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  timezone: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
});
export type AirportType = z.infer<typeof AirportSchema>;

/**
 * @schema AirlineSchema
 * Validates basic airline identifying information.
 */
export const AirlineSchema = z.object({
  name: z.string().min(1),
  iata: z.string().length(2),
  icao: z.string().length(3),
});
export type AirlineType = z.infer<typeof AirlineSchema>;

/**
 * @schema FlightStatusSchema
 * Validates that the status is one of the recognised operational states.
 */
export const FlightStatusSchema = z.enum([
  "scheduled",
  "active",
  "landed",
  "cancelled",
  "incident",
  "diverted",
  "unknown",
]);

/**
 * @schema FlightLegSchema
 * Validates a single flight leg including departure / arrival details.
 */
export const FlightLegSchema = z.object({
  flightNumber: z.string().min(1),
  airline: AirlineSchema,
  departure: z.object({
    airport: AirportSchema,
    scheduledTime: DateTimeString,
    actualTime: DateTimeString.nullable(),
    terminal: z.string().nullable(),
    gate: z.string().nullable(),
  }),
  arrival: z.object({
    airport: AirportSchema,
    scheduledTime: DateTimeString,
    actualTime: DateTimeString.nullable(),
    terminal: z.string().nullable(),
    gate: z.string().nullable(),
  }),
  status: FlightStatusSchema,
  duration: z.number().int().positive(),
  aircraft: z.string().nullable(),
});
export type FlightLegType = z.infer<typeof FlightLegSchema>;

// ─── Weather schemas ────────────────────────────────────────────────────────

/**
 * @schema WeatherDaySchema
 * Validates a single day's aggregated weather forecast.
 */
export const WeatherDaySchema = z.object({
  date: DateString,
  temperatureMax: z.number(),
  temperatureMin: z.number(),
  precipitationSum: z.number().min(0),
  windSpeedMax: z.number().min(0),
  weatherCode: WmoCode,
  uvIndexMax: z.number().min(0),
  sunriseISO: DateTimeString,
  sunsetISO: DateTimeString,
});
export type WeatherDayType = z.infer<typeof WeatherDaySchema>;

/**
 * @schema HourlyForecastSchema
 * Validates a single hourly forecast point.
 */
export const HourlyForecastSchema = z.object({
  time: DateTimeString,
  temperature: z.number(),
  precipitationProbability: z.number().min(0).max(100),
  windSpeed: z.number().min(0),
  weatherCode: WmoCode,
});
export type HourlyForecastType = z.infer<typeof HourlyForecastSchema>;

/**
 * @schema WeatherScoreSchema
 * Validates the qualitative weather score.
 */
export const WeatherScoreSchema = z.object({
  overall: z.number().min(0).max(100),
  label: z.enum(["Excellent", "Good", "Fair", "Poor"]),
  breakdown: z.object({
    temperature: z.number().min(0).max(100),
    precipitation: z.number().min(0).max(100),
    wind: z.number().min(0).max(100),
    sunshine: z.number().min(0).max(100),
  }),
  recommendation: z.string().min(1),
});
export type WeatherScoreType = z.infer<typeof WeatherScoreSchema>;

/**
 * @schema WeatherForecastResponseSchema
 * Validates the full weather forecast response payload.
 */
export const WeatherForecastResponseSchema = z.object({
  location: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string().min(1),
  daily: z.array(WeatherDaySchema),
  hourly: z.array(HourlyForecastSchema).optional(),
});
export type WeatherForecastResponseType = z.infer<typeof WeatherForecastResponseSchema>;

// ─── Currency schemas ───────────────────────────────────────────────────────

/**
 * @schema ExchangeRateSchema
 * Validates an exchange rate between two currencies.
 */
export const ExchangeRateSchema = z.object({
  base: z.string().length(3),
  target: z.string().length(3),
  rate: z.number().positive(),
  lastUpdated: DateTimeString,
});
export type ExchangeRateType = z.infer<typeof ExchangeRateSchema>;

/**
 * @schema CurrencyInfoSchema
 * Validates metadata about a single currency.
 */
export const CurrencyInfoSchema = z.object({
  code: z.string().length(3),
  name: z.string().min(1),
  symbol: z.string().min(1),
  country: z.string().min(1),
});
export type CurrencyInfoType = z.infer<typeof CurrencyInfoSchema>;

// ─── Itinerary schemas ──────────────────────────────────────────────────────

/**
 * @schema TravelPlanInputSchema
 * Validates the user-provided inputs used to generate an itinerary.
 */
export const TravelPlanInputSchema = z.object({
  origin: AirportSchema,
  destination: AirportSchema,
  departureDate: DateString,
  returnDate: DateString,
  travelStyle: z.enum(["relaxed", "active", "cultural", "foodie", "adventure"]),
  budgetLevel: z.enum(["budget", "mid-range", "luxury"]),
  interests: z.array(
    z.enum([
      "museums",
      "nature",
      "food",
      "shopping",
      "nightlife",
      "history",
      "sports",
      "beaches",
    ]),
  ),
  groupSize: z.number().positive().int(),
});
export type TravelPlanInputType = z.infer<typeof TravelPlanInputSchema>;

/**
 * @schema ActivitySchema
 * Validates a single scheduled activity within a day.
 */
export const ActivitySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  duration: z.number().int().positive(),
  estimatedCost: z.number().min(0),
  category: z.enum([
    "museums",
    "nature",
    "food",
    "shopping",
    "nightlife",
    "history",
    "sports",
    "beaches",
  ]),
  timeOfDay: z.enum(["morning", "afternoon", "evening", "night"]),
  address: z.string().optional(),
  tip: z.string().optional(),
});
export type ActivityType = z.infer<typeof ActivitySchema>;

/**
 * @schema ItineraryDaySchema
 * Validates a single day within the generated itinerary.
 */
export const ItineraryDaySchema = z.object({
  date: DateString,
  dayNumber: z.number().int().positive(),
  weather: WeatherDaySchema.nullable(),
  activities: z.array(ActivitySchema).min(1).max(6),
  meals: z.object({
    breakfast: z.string().optional(),
    lunch: z.string().optional(),
    dinner: z.string().optional(),
  }),
  estimatedDailyCost: z.number().min(0),
  notes: z.string().optional(),
});
export type ItineraryDayType = z.infer<typeof ItineraryDaySchema>;

/**
 * @schema ItinerarySchema
 * Validates a complete generated travel itinerary.
 */
export const ItinerarySchema = z.object({
  id: z.string().min(1),
  createdAt: DateTimeString,
  input: TravelPlanInputSchema,
  days: z.array(ItineraryDaySchema),
  totalEstimatedCost: z.number().min(0),
  currency: z.string().length(3),
  summary: z.string().min(1),
  packingList: z.array(z.string()),
  importantNotes: z.array(z.string()),
});
export type ItineraryType = z.infer<typeof ItinerarySchema>;

// ─── Generic helpers ────────────────────────────────────────────────────────

/**
 * Generic Zod schema factory for standardised API response envelopes.
 *
 * @param dataSchema - The schema to validate the `data` payload against.
 * @returns A Zod object schema matching the {@link ApiResponse} interface.
 */
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema.nullable(),
    error: z
      .object({
        code: z.string(),
        message: z.string(),
        statusCode: z.number().optional(),
      })
      .nullable(),
    loading: z.boolean(),
  });

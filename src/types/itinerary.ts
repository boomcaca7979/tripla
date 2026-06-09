import type { Airport } from "./flight";
import type { WeatherDay } from "./weather";

/**
 * Itinerary-related type definitions for trip planning.
 *
 * @module types/itinerary
 */

/** Broad pacing / style preference for the trip. */
export type TravelStyle = "relaxed" | "active" | "cultural" | "foodie" | "adventure";

/** Rough budget tier for the overall trip. */
export type BudgetLevel = "budget" | "mid-range" | "luxury";

/** Specific categories of activities a traveller is interested in. */
export type TravelInterest =
  | "museums"
  | "nature"
  | "food"
  | "shopping"
  | "nightlife"
  | "history"
  | "sports"
  | "beaches";

/** User-provided inputs used to generate a travel itinerary. */
export interface TravelPlanInput {
  /** Departure airport. */
  origin: Airport;
  /** Destination airport. */
  destination: Airport;
  /** Departure date in YYYY-MM-DD format. */
  departureDate: string;
  /** Return date in YYYY-MM-DD format. */
  returnDate: string;
  /** Preferred travel pacing and focus. */
  travelStyle: TravelStyle;
  /** Budget tier for estimating costs and accommodation. */
  budgetLevel: BudgetLevel;
  /** List of interest categories the traveller wants to explore. */
  interests: TravelInterest[];
  /** Number of people travelling together. */
  groupSize: number;
}

/** A single scheduled activity or attraction within a day. */
export interface Activity {
  /** Unique identifier for the activity. */
  id: string;
  /** Short display name of the activity. */
  name: string;
  /** Longer description of what the activity involves. */
  description: string;
  /** Estimated duration in minutes. */
  duration: number;
  /** Estimated cost in the destination currency. */
  estimatedCost: number;
  /** The interest category this activity belongs to. */
  category: TravelInterest;
  /** Preferred part of the day for this activity. */
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  /** Physical address or location, if applicable. */
  address?: string;
  /** Insider tip or note for this activity. */
  tip?: string;
}

/** A single day within the generated itinerary. */
export interface ItineraryDay {
  /** Calendar date in YYYY-MM-DD format. */
  date: string;
  /** Sequential day number (1-based). */
  dayNumber: number;
  /** Weather forecast for the day, or null if unavailable. */
  weather: WeatherDay | null;
  /** Scheduled activities for the day. */
  activities: Activity[];
  /** Optional meal suggestions keyed by meal time. */
  meals: {
    /** Breakfast suggestion. */
    breakfast?: string;
    /** Lunch suggestion. */
    lunch?: string;
    /** Dinner suggestion. */
    dinner?: string;
  };
  /** Total estimated cost for this day in the destination currency. */
  estimatedDailyCost: number;
  /** Free-form notes for the day. */
  notes?: string;
}

/** A complete generated travel itinerary. */
export interface Itinerary {
  /** Unique identifier for this itinerary. */
  id: string;
  /** ISO 8601 timestamp of when the itinerary was created. */
  createdAt: string;
  /** The user inputs that generated this itinerary. */
  input: TravelPlanInput;
  /** Array of planned days. */
  days: ItineraryDay[];
  /** Sum of estimated costs across all days. */
  totalEstimatedCost: number;
  /** 3-letter ISO currency code used for cost estimates (e.g. "JPY"). */
  currency: string;
  /** One-paragraph plain-text summary of the trip. */
  summary: string;
  /** Suggested items the traveller should pack. */
  packingList: string[];
  /** Important practical notes (e.g. visa requirements, local customs). */
  importantNotes: string[];
}

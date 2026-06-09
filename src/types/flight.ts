import type { AppError } from "./common";

/**
 * Airport information with IATA/ICAO codes and geographic metadata.
 *
 * @module types/flight
 */

/** Represents an airport with its identifying codes and location data. */
export interface Airport {
  /** 3-letter IATA code, e.g. "NRT". */
  iata: string;
  /** 4-letter ICAO code, e.g. "RJAA". */
  icao: string;
  /** Full airport name, e.g. "Narita International Airport". */
  name: string;
  /** City where the airport is located. */
  city: string;
  /** Country where the airport is located. */
  country: string;
  /** IANA timezone identifier, e.g. "Asia/Tokyo". */
  timezone: string;
  /** Latitude in decimal degrees. */
  latitude: number;
  /** Longitude in decimal degrees. */
  longitude: number;
}

/** Airline identifying information. */
export interface Airline {
  /** Full airline name. */
  name: string;
  /** 2-letter IATA code, e.g. "JL". */
  iata: string;
  /** 3-letter ICAO code, e.g. "JAL". */
  icao: string;
}

/**
 * The operational status of a flight.
 * - `scheduled`: flight is planned but not yet active
 * - `active`: flight is currently in the air
 * - `landed`: flight has arrived at its destination
 * - `cancelled`: flight has been cancelled
 * - `incident`: flight experienced an incident
 * - `diverted`: flight was redirected to another airport
 * - `unknown`: status could not be determined
 */
export type FlightStatus =
  | "scheduled"
  | "active"
  | "landed"
  | "cancelled"
  | "incident"
  | "diverted"
  | "unknown";

/** A single leg of a flight, including departure/arrival details. */
export interface FlightLeg {
  /** Flight number assigned by the airline (e.g. "JL5"). */
  flightNumber: string;
  /** Operating airline information. */
  airline: Airline;
  /** Departure airport, scheduled / actual times, terminal and gate details. */
  departure: {
    airport: Airport;
    /** Scheduled departure time in ISO 8601 format. */
    scheduledTime: string;
    /** Actual departure time in ISO 8601 format, or null if not yet departed. */
    actualTime: string | null;
    /** Departure terminal, or null if unknown. */
    terminal: string | null;
    /** Departure gate, or null if unknown. */
    gate: string | null;
  };
  /** Arrival airport, scheduled / actual times, terminal and gate details. */
  arrival: {
    airport: Airport;
    /** Scheduled arrival time in ISO 8601 format. */
    scheduledTime: string;
    /** Actual arrival time in ISO 8601 format, or null if not yet arrived. */
    actualTime: string | null;
    /** Arrival terminal, or null if unknown. */
    terminal: string | null;
    /** Arrival gate, or null if unknown. */
    gate: string | null;
  };
  /** Current operational status of this flight leg. */
  status: FlightStatus;
  /** Scheduled duration of the leg in minutes. */
  duration: number;
  /** Aircraft type/model string (e.g. "B777-300ER"), or null if unknown. */
  aircraft: string | null;
}

/** Parameters used when searching for flights. */
export interface FlightSearchParams {
  /** Departure airport IATA code. */
  depIata: string;
  /** Arrival airport IATA code. */
  arrIata: string;
  /** Travel date in YYYY-MM-DD format. */
  date: string;
}

import type { Itinerary } from "@/types/itinerary";
import type { FlightLeg } from "@/types/flight";

// ── Types ────────────────────────────────────────────────────────────

export interface SharedData {
  itinerary: Itinerary;
  flights?: FlightLeg[];
}

// ── Constants ────────────────────────────────────────────────────────

const SITE_URL = "https://www.utripla.xyz";

// ── Encoding / Decoding ──────────────────────────────────────────────

/**
 * Encode an itinerary (and optional flights) into a URL-safe base64 string.
 * We strip verbose fields to keep the payload compact.
 */
function stripItinerary(itinerary: Itinerary): Itinerary {
  return {
    ...itinerary,
    days: itinerary.days.map((day) => ({
      ...day,
      weather: null, // weather data is time-sensitive, skip it
      activities: day.activities.map((act) => ({
        ...act,
        description: act.description, // keep description, it's useful
      })),
    })),
  };
}

function stripFlights(flights: FlightLeg[]): FlightLeg[] {
  // Only keep essential flight info for display
  return flights.map((f) => ({
    ...f,
    departure: {
      ...f.departure,
      actualTime: null,
    },
    arrival: {
      ...f.arrival,
      actualTime: null,
    },
  }));
}

export function encodeShareData(data: SharedData): string {
  const stripped: SharedData = {
    itinerary: stripItinerary(data.itinerary),
    flights: data.flights ? stripFlights(data.flights) : undefined,
  };

  const json = JSON.stringify(stripped);
  // btoa only handles Latin-1; use TextEncoder for full Unicode support
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decodeShareData(encoded: string): SharedData | null {
  try {
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as SharedData;
  } catch {
    return null;
  }
}

export function createShareableLink(
  itinerary: Itinerary,
  flights?: FlightLeg[],
): string {
  const data = encodeShareData({ itinerary, flights });
  return `${SITE_URL}/share?data=${encodeURIComponent(data)}`;
}

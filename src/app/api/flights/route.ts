import type { FlightLeg, FlightStatus } from "@/types/flight";

/** Minimal type for the Aviationstack API raw response item. */
interface AviationstackRawFlight {
  flight?: { iata?: string; icao?: string };
  airline?: { name?: string; iata?: string; icao?: string };
  departure?: {
    iata?: string; icao?: string; airport?: string; timezone?: string;
    scheduled?: string; actual?: string | null;
    terminal?: string | null; gate?: string | null;
  };
  arrival?: {
    iata?: string; icao?: string; airport?: string; timezone?: string;
    scheduled?: string; actual?: string | null;
    terminal?: string | null; gate?: string | null;
  };
  flight_status?: string;
  aircraft?: { iata?: string };
}

// ── Mock flight data ──────────────────────────────────────────────────

function buildMockFlights(depIata: string, arrIata: string, date: string): FlightLeg[] {
  const airports: Record<string, { iata: string; icao: string; name: string; city: string; country: string; timezone: string; latitude: number; longitude: number }> = {
    NRT: { iata: "NRT", icao: "RJAA", name: "Narita International Airport", city: "Tokyo", country: "Japan", timezone: "Asia/Tokyo", latitude: 35.7647, longitude: 140.3864 },
    TPE: { iata: "TPE", icao: "RCTP", name: "Taiwan Taoyuan International Airport", city: "Taipei", country: "Taiwan", timezone: "Asia/Taipei", latitude: 25.0777, longitude: 121.2328 },
    ICN: { iata: "ICN", icao: "RKSI", name: "Incheon International Airport", city: "Seoul", country: "South Korea", timezone: "Asia/Seoul", latitude: 37.4602, longitude: 126.4407 },
    BKK: { iata: "BKK", icao: "VTBS", name: "Suvarnabhumi Airport", city: "Bangkok", country: "Thailand", timezone: "Asia/Bangkok", latitude: 13.6900, longitude: 100.7501 },
    SIN: { iata: "SIN", icao: "WSSS", name: "Changi Airport", city: "Singapore", country: "Singapore", timezone: "Asia/Singapore", latitude: 1.3644, longitude: 103.9915 },
    HKG: { iata: "HKG", icao: "VHHH", name: "Hong Kong International Airport", city: "Hong Kong", country: "China", timezone: "Asia/Hong_Kong", latitude: 22.3080, longitude: 113.9185 },
    CAN: { iata: "CAN", icao: "ZGGG", name: "Guangzhou Baiyun International Airport", city: "Guangzhou", country: "China", timezone: "Asia/Shanghai", latitude: 23.3925, longitude: 113.2988 },
    PVG: { iata: "PVG", icao: "ZSPD", name: "Shanghai Pudong International Airport", city: "Shanghai", country: "China", timezone: "Asia/Shanghai", latitude: 31.1443, longitude: 121.8083 },
    KIX: { iata: "KIX", icao: "RJBB", name: "Kansai International Airport", city: "Osaka", country: "Japan", timezone: "Asia/Tokyo", latitude: 34.4346, longitude: 135.2440 },
    JFK: { iata: "JFK", icao: "KJFK", name: "John F. Kennedy International Airport", city: "New York", country: "USA", timezone: "America/New_York", latitude: 40.6413, longitude: -73.7781 },
    LHR: { iata: "LHR", icao: "EGLL", name: "Heathrow Airport", city: "London", country: "UK", timezone: "Europe/London", latitude: 51.4700, longitude: -0.4543 },
  };

  const dep = airports[depIata] ?? { iata: depIata, icao: "XXXX", name: `${depIata} Airport`, city: depIata, country: "Unknown", timezone: "UTC", latitude: 0, longitude: 0 };
  const arr = airports[arrIata] ?? { iata: arrIata, icao: "YYYY", name: `${arrIata} Airport`, city: arrIata, country: "Unknown", timezone: "UTC", latitude: 0, longitude: 0 };

  return [
    {
      flightNumber: `${depIata}${arrIata}1`,
      airline: { name: "Demo Airways", iata: "DA", icao: "DMO" },
      departure: {
        airport: dep,
        scheduledTime: `${date}T08:00:00Z`,
        actualTime: null,
        terminal: "T1",
        gate: null,
      },
      arrival: {
        airport: arr,
        scheduledTime: `${date}T12:00:00Z`,
        actualTime: null,
        terminal: null,
        gate: null,
      },
      status: "scheduled" as FlightStatus,
      duration: 240,
      aircraft: "Boeing 777",
    },
    {
      flightNumber: `${depIata}${arrIata}2`,
      airline: { name: "Sky Connect", iata: "SC", icao: "SKC" },
      departure: {
        airport: dep,
        scheduledTime: `${date}T14:30:00Z`,
        actualTime: null,
        terminal: "T2",
        gate: "B12",
      },
      arrival: {
        airport: arr,
        scheduledTime: `${date}T18:45:00Z`,
        actualTime: null,
        terminal: "T1",
        gate: null,
      },
      status: "scheduled" as FlightStatus,
      duration: 255,
      aircraft: "Airbus A350",
    },
    {
      flightNumber: `${depIata}${arrIata}3`,
      airline: { name: "Pacific Air", iata: "PA", icao: "PCA" },
      departure: {
        airport: dep,
        scheduledTime: `${date}T20:00:00Z`,
        actualTime: null,
        terminal: null,
        gate: null,
      },
      arrival: {
        airport: arr,
        scheduledTime: `${date}T23:30:00Z`,
        actualTime: null,
        terminal: null,
        gate: null,
      },
      status: "scheduled" as FlightStatus,
      duration: 210,
      aircraft: null,
    },
  ];
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const depIata = searchParams.get("depIata");
  const arrIata = searchParams.get("arrIata");
  const date = searchParams.get("date");

  if (!depIata || !arrIata || !date)
    return Response.json({ error: "Missing params" }, { status: 400 });

  const key = process.env.AVIATIONSTACK_API_KEY?.trim();

  // ── No API key: return mock data ──────────────────────────────────
  if (!key) {
    console.log("[flights] No AVIATIONSTACK_API_KEY, returning mock data");
    return Response.json(buildMockFlights(depIata, arrIata, date), {
      headers: { "Cache-Control": "s-maxage=3600", "X-Mock-Data": "true" },
    });
  }

  // ── Try real API ──────────────────────────────────────────────────
  try {
    // ⚠️ 注意：Aviationstack 免费版必须用 HTTP（不是 HTTPS）
    const url = `http://api.aviationstack.com/v1/flights?access_key=${key}&dep_iata=${depIata}&arr_iata=${arrIata}&flight_date=${date}&limit=20`;

    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error(`[flights] Upstream ${res.status}: ${errBody.slice(0, 300)}`);
      console.log("[flights] Falling back to mock data");
      return Response.json(buildMockFlights(depIata, arrIata, date), {
        headers: { "Cache-Control": "s-maxage=3600", "X-Mock-Data": "true" },
      });
    }

    const json = await res.json();

    // Aviationstack sometimes returns { error: { ... } } instead of data
    if (json.error || !json.data) {
      console.error("[flights] API error:", JSON.stringify(json.error ?? json).slice(0, 300));
      console.log("[flights] Falling back to mock data");
      return Response.json(buildMockFlights(depIata, arrIata, date), {
        headers: { "Cache-Control": "s-maxage=3600", "X-Mock-Data": "true" },
      });
    }

    const raw: AviationstackRawFlight[] = json.data ?? [];

    if (raw.length === 0) {
      console.log("[flights] No results from upstream, returning mock data");
      return Response.json(buildMockFlights(depIata, arrIata, date), {
        headers: { "Cache-Control": "s-maxage=3600", "X-Mock-Data": "true" },
      });
    }

    // 映射为 FlightLeg 格式
    const flights: FlightLeg[] = raw.map((f) => ({
      flightNumber: f.flight?.iata ?? "",
      airline: {
        name: f.airline?.name ?? "",
        iata: f.airline?.iata ?? "",
        icao: f.airline?.icao ?? "",
      },
      departure: {
        airport: {
          iata: f.departure?.iata ?? depIata,
          icao: f.departure?.icao ?? "",
          name: f.departure?.airport ?? "",
          city: "",
          country: "",
          timezone: f.departure?.timezone ?? "",
          latitude: 0,
          longitude: 0,
        },
        scheduledTime: f.departure?.scheduled ?? "",
        actualTime: f.departure?.actual ?? null,
        terminal: f.departure?.terminal ?? null,
        gate: f.departure?.gate ?? null,
      },
      arrival: {
        airport: {
          iata: f.arrival?.iata ?? arrIata,
          icao: f.arrival?.icao ?? "",
          name: f.arrival?.airport ?? "",
          city: "",
          country: "",
          timezone: f.arrival?.timezone ?? "",
          latitude: 0,
          longitude: 0,
        },
        scheduledTime: f.arrival?.scheduled ?? "",
        actualTime: f.arrival?.actual ?? null,
        terminal: f.arrival?.terminal ?? null,
        gate: f.arrival?.gate ?? null,
      },
      status: (f.flight_status ?? "unknown") as FlightStatus,
      duration:
        Math.round(
          (new Date(f.arrival?.scheduled ?? "").getTime() -
            new Date(f.departure?.scheduled ?? "").getTime()) /
            60000,
        ) || 0,
      aircraft: f.aircraft?.iata ?? null,
    }));

    return Response.json(flights, {
      headers: {
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=1800",
      },
    });
  } catch (err) {
    console.error("[flights] Fetch error:", err instanceof Error ? err.message : err);
    console.log("[flights] Falling back to mock data");
    return Response.json(buildMockFlights(depIata, arrIata, date), {
      headers: { "Cache-Control": "s-maxage=3600", "X-Mock-Data": "true" },
    });
  }
}

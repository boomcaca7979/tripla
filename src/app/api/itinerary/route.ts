import { buildSystemPrompt, buildUserMessage } from "../../../lib/itinerary-engine";
import type { Itinerary } from "../../../types/itinerary";
import { generateId } from "../../../lib/utils";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export async function POST(request: Request): Promise<Response> {
  const body = await request.json();
  const { input, weather, exchangeRate } = body;

  if (!input) {
    return Response.json(
      { error: { code: "MISSING_INPUT", message: "Missing input" } },
      { status: 400 },
    );
  }

  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    console.error("[itinerary] GROQ_API_KEY is not configured or empty");
    // Fallback: return mock itinerary so the page doesn't break
    return Response.json(buildMockItinerary(input));
  }

  console.log("[itinerary] Request payload (redacted):", {
    model: GROQ_MODEL,
    destination: input.destination?.city,
    dates: `${input.departureDate} → ${input.returnDate}`,
    travelStyle: input.travelStyle,
    budgetLevel: input.budgetLevel,
    interests: input.interests,
    groupSize: input.groupSize,
    messageLength: buildUserMessage(input, weather ?? [], exchangeRate ?? null).length,
  });

  const userMessage = buildUserMessage(input, weather ?? [], exchangeRate ?? null);

  console.log("[itinerary] Request:", {
    model: GROQ_MODEL,
    destination: input.destination?.city,
    dates: `${input.departureDate} → ${input.returnDate}`,
    apiKeyPrefix: apiKey.slice(0, 6) + "...",
    messageLength: userMessage.length,
  });

  let text = "";
  try {
    const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(30_000),
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    console.log("[itinerary] Groq response status:", response.status);

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      console.error(`[itinerary] Groq error ${response.status}: ${errBody.slice(0, 500)}`);
      console.warn("[itinerary] Falling back to mock itinerary due to Groq error");
      return Response.json(buildMockItinerary(input));
    }

    const data = await response.json();
    text = data.choices?.[0]?.message?.content ?? "";

    console.log("[itinerary] Groq response preview:", text.slice(0, 200));

    // 剥离可能的 markdown code fences
    text = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

    const json = JSON.parse(text);
    json.id = generateId();
    json.createdAt = new Date().toISOString();

    return Response.json(json);
  } catch (err: unknown) {
    if (err instanceof SyntaxError) {
      console.error("[itinerary] JSON parse error. Raw text:", text.slice(0, 500));
    } else {
      const message = err instanceof Error ? err.message : String(err ?? "Unknown error");
      console.error("[itinerary] Unexpected error:", message);
    }
    console.warn("[itinerary] Falling back to mock itinerary");
    return Response.json(buildMockItinerary(input));
  }
}

/**
 * Build a mock itinerary to serve when the Groq API is unavailable.
 * Prevents the UI from crashing with a white-screen error.
 */
function fillAirport(a: Itinerary["input"]["origin"]): Itinerary["input"]["origin"] {
  return {
    iata: a.iata ?? "NRT",
    icao: a.icao ?? "RJAA",
    name: a.name ?? a.city ?? "Unknown",
    city: a.city ?? "Unknown",
    country: a.country ?? "Unknown",
    timezone: a.timezone ?? "Asia/Tokyo",
    latitude: a.latitude ?? 35.772,
    longitude: a.longitude ?? 140.393,
  };
}


function buildMockItinerary(input: Itinerary["input"]): Itinerary {
  const safeInput = { ...input, origin: fillAirport(input.origin), destination: fillAirport(input.destination) };
  const destination = safeInput.destination;
  const days: Itinerary["days"] = [
    {
      date: input.departureDate,
      dayNumber: 1,
      weather: null,
      activities: [
        {
          id: "mock-act-1-1",
          name: "Arrival & City Orientation",
          description: `Arrive in ${destination.city} and check into your accommodation. Take a relaxing stroll through the city center to get your bearings.`,
          duration: 120,
          estimatedCost: 0,
          category: "history",
          timeOfDay: "afternoon",
        },
        {
          id: "mock-act-1-2",
          name: "Welcome Dinner",
          description: "Enjoy a delicious welcome dinner at a popular local restaurant featuring authentic regional cuisine.",
          duration: 90,
          estimatedCost: 40,
          category: "food",
          timeOfDay: "evening",
          tip: "Try the local specialty dish!",
        },
      ],
      meals: { breakfast: "Hotel breakfast", lunch: "Café near your hotel", dinner: "Local restaurant" },
      estimatedDailyCost: 120,
      notes: "Take it easy on your first day — settle in and enjoy the local atmosphere.",
    },
    {
      date: input.returnDate,
      dayNumber: 2,
      weather: null,
      activities: [
        {
          id: "mock-act-2-1",
          name: "Cultural Morning",
          description: `Visit a top-rated museum or cultural landmark in ${destination.city} to learn about the local heritage.`,
          duration: 180,
          estimatedCost: 25,
          category: "museums",
          timeOfDay: "morning",
        },
        {
          id: "mock-act-2-2",
          name: "Departure",
          description: "Head to the airport for your return flight. Allow plenty of time for check-in and security.",
          duration: 60,
          estimatedCost: 0,
          category: "history",
          timeOfDay: "afternoon",
        },
      ],
      meals: { breakfast: "Hotel breakfast", lunch: "Airport food court", dinner: "In-flight meal" },
      estimatedDailyCost: 80,
    },
  ];

  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    input: safeInput,
    days,
    totalEstimatedCost: 200,
    currency: "USD",
    summary: `A 2-day getaway to ${destination.city}, ${destination.country}. Perfect for a quick exploration of the city's highlights, local cuisine, and cultural attractions.`,
    packingList: [
      "Passport", "Phone charger", "Comfortable shoes", "Light jacket",
      "Sunscreen", "Travel adapter", "Toiletries", "Reusable water bottle",
      "Camera", "Umbrella",
    ],
    importantNotes: [
      "Check visa requirements before travel",
      "Notify your bank of international travel",
      "Save local emergency numbers in your phone",
      "Consider travel insurance for peace of mind",
    ],
  };
}

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

/**
 * 统一的"不可用"响应：永远不返回编造的航班。
 *
 * 约定（与 hooks/useFlightSearch.ts 的 !res.ok 分支对齐）：
 *   body = { message: string, code: string }，HTTP 状态区分原因——
 *     503 NOT_CONFIGURED     provider 未配置
 *     502 PROVIDER_ERROR     provider 失败 / 超时 / malformed
 * 成功（含真实空结果）才返回 FlightLeg[]。
 */
function unavailable(message: string, code: string, status: number): Response {
  return Response.json({ message, code }, { status });
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const depIata = searchParams.get("depIata");
  const arrIata = searchParams.get("arrIata");
  const date = searchParams.get("date");

  if (!depIata || !arrIata || !date)
    return Response.json(
      { message: "Missing params", code: "MISSING_PARAMS" },
      { status: 400 },
    );

  const key = process.env.AVIATIONSTACK_API_KEY?.trim();

  // ── 情况 B：provider 未配置 → 明确不可用（绝不返回 mock） ────────────
  if (!key) {
    console.error("[flights] AVIATIONSTACK_API_KEY is not configured");
    return unavailable("Flight search is not configured", "NOT_CONFIGURED", 503);
  }

  // ── 情况 A/C/D/E：真实调用 ─────────────────────────────────────────
  try {
    // ⚠️ 注意：Aviationstack 免费版必须用 HTTP（不是 HTTPS）
    const url = `http://api.aviationstack.com/v1/flights?access_key=${key}&dep_iata=${depIata}&arr_iata=${arrIata}&flight_date=${date}&limit=20`;

    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });

    // 情况 C：provider 返回非 2xx
    if (!res.ok) {
      console.error(`[flights] Upstream ${res.status}`);
      return unavailable(
        "Flight search is temporarily unavailable",
        "PROVIDER_ERROR",
        502,
      );
    }

    const json: unknown = await res.json();

    // 情况 E：provider 返回错误对象 / malformed
    if (
      typeof json !== "object" ||
      json === null ||
      "error" in json ||
      !("data" in json) ||
      !Array.isArray(json.data)
    ) {
      const reason =
        typeof json === "object" && json !== null && "error" in json
          ? JSON.stringify((json as { error: unknown }).error).slice(0, 300)
          : "malformed response";
      console.error(`[flights] API error: ${reason}`);
      return unavailable(
        "Flight search is temporarily unavailable",
        "PROVIDER_ERROR",
        502,
      );
    }

    const raw = json.data as AviationstackRawFlight[];

    // 情况 D：真实空结果 → 如实返回空数组（UI 显示真实的 No flights found）
    if (raw.length === 0) {
      return Response.json([], {
        headers: { "Cache-Control": "s-maxage=600" },
      });
    }

    // 情况 A：真实结果
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
    // 情况 C：超时 / 网络失败（只记录原因，不暴露 provider 细节）
    console.error("[flights] Fetch error:", err instanceof Error ? err.message : err);
    return unavailable(
      "Flight search is temporarily unavailable",
      "PROVIDER_ERROR",
      502,
    );
  }
}

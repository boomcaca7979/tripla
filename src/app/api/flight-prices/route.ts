import { MARKER } from "@/lib/affiliate";

/**
 * /api/flight-prices — Destination 页站内航班价格结果。
 *
 * 资质与数据语义（Travelpayouts 官方政策，硬约束）：
 *   · Aviasales Flight Search API 需要 ≥50,000 MAU —— 本项目不申请、不调用。
 *   · 使用 Aviasales Data API v3 `prices_for_dates`（缓存/近期价格数据，
 *     Travelpayouts partner 可用）。token = TRAVELPAYOUTS_API_TOKEN（env，
 *     server-only，经 X-Access-Token header 认证）。
 *   · 未配置 token → 诚实返回 "token-not-configured"；401/403/429/5xx →
 *     真实错误态；绝不 fallback 成假航班/估算价格。
 *   · 价格 = Data API 缓存价格（非实时报价）；UI 标注
 *     "Prices from recent Aviasales search data"。
 *   · provider 没返回的字段一律缺省（不补算、不造默认值）。
 *   · Book = provider 返回的 aviasales deep link（/search/...?t=…）拼
 *     www.aviasales.com + marker=（affiliate attribution），点击后由
 *     Aviasales/供应商完成付款。
 */

interface V3PriceItem {
  flight_number?: string;
  link?: string;
  origin_airport?: string;
  destination_airport?: string;
  origin?: string;
  destination?: string;
  departure_at?: string;
  return_at?: string;
  airline?: string;
  price?: number;
  gate?: string;
  transfers?: number;
  return_transfers?: number;
  duration?: number;
  duration_to?: number;
  duration_back?: number;
}

export interface FlightPriceOffer {
  airline?: string;
  flightNumber?: string;
  originAirport?: string;
  destinationAirport?: string;
  departureAt?: string;
  returnAt?: string;
  /** 总时长（分钟；provider duration 字段，缺省不显示）。 */
  durationMinutes?: number;
  /** 中转次数（provider transfers，缺省不显示）。 */
  transfers?: number;
  returnTransfers?: number;
  price: { amount: number; currency: string };
  /** Aviasales deep link + marker 归因（点击 → Aviasales/供应商付款）。 */
  bookUrl: string;
}

/** server 内存短缓存（Data API 本身是缓存数据；key 含日期，绝不跨日期复用）。 */
interface CacheEntry {
  expires: number;
  body: unknown;
}
const cache = new Map<string, CacheEntry>();
const TTL_MS = 30 * 60_000;

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const origin = (searchParams.get("origin") ?? "").toUpperCase();
  const destination = (searchParams.get("destination") ?? "").toUpperCase();
  const departDate = searchParams.get("departDate") ?? "";
  const returnDate = searchParams.get("returnDate") ?? "";

  if (!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(destination) || origin === destination) {
    return Response.json({ error: "Invalid origin/destination" }, { status: 400 });
  }

  const token = process.env.TRAVELPAYOUTS_API_TOKEN?.trim();
  if (!token) {
    return Response.json({ available: false, reason: "token-not-configured" });
  }

  const cacheKey = `flight_v3_${origin}_${destination}_${departDate}_${returnDate}`;
  const hit = cache.get(cacheKey);
  if (hit && hit.expires > Date.now()) {
    return Response.json(hit.body, { headers: { "Cache-Control": "public, s-maxage=1800" } });
  }

  let body: {
    available: boolean;
    reason?: string;
    /** 实际返回的价格类型（round-trip 无缓存时降级 one-way，UI 如实标注）。 */
    tripType?: "round-trip" | "one-way";
    flights?: FlightPriceOffer[];
  };

  const queryOnce = async (
    oneWay: boolean,
  ): Promise<FlightPriceOffer[] | "auth" | "rate" | "error"> => {
    const qs = new URLSearchParams({
      origin,
      destination,
      departure_at: departDate,
      one_way: String(oneWay),
      limit: "8",
      sorting: "price",
      currency: "usd",
    });
    if (!oneWay && returnDate) qs.set("return_at", returnDate);
    const res = await fetch(
      `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${qs.toString()}`,
      {
        headers: { "X-Access-Token": token, Accept: "application/json" },
        signal: AbortSignal.timeout(12_000),
        cache: "no-store",
      },
    );
    if (res.status === 401 || res.status === 403) return "auth";
    if (res.status === 429) return "rate";
    if (!res.ok) return "error";
    const payload = (await res.json()) as { data?: V3PriceItem[] };
    const raw = Array.isArray(payload.data) ? payload.data : [];
    return raw
      .filter((p) => typeof p.price === "number" && p.price > 0)
      .slice(0, 8)
      .flatMap((p): FlightPriceOffer[] => {
        // provider deep link（相对路径 /search/...?t=…）→ aviasales.com + marker 归因
        if (!(p.link && p.link.startsWith("/search/"))) return [];
        const u = new URL(`https://www.aviasales.com${p.link}`);
        if (MARKER) u.searchParams.set("marker", MARKER);
        return [
          {
            airline: typeof p.airline === "string" ? p.airline : undefined,
            flightNumber: p.flight_number !== undefined ? String(p.flight_number) : undefined,
            originAirport: typeof p.origin_airport === "string" ? p.origin_airport : undefined,
            destinationAirport:
              typeof p.destination_airport === "string" ? p.destination_airport : undefined,
            departureAt: typeof p.departure_at === "string" ? p.departure_at : undefined,
            returnAt: typeof p.return_at === "string" ? p.return_at : undefined,
            durationMinutes: typeof p.duration === "number" ? p.duration : undefined,
            transfers: typeof p.transfers === "number" ? p.transfers : undefined,
            returnTransfers:
              typeof p.return_transfers === "number" ? p.return_transfers : undefined,
            price: { amount: p.price as number, currency: "USD" },
            bookUrl: u.toString(),
          },
        ];
      });
  };

  try {
    const wantRound = Boolean(returnDate);
    let flights = wantRound ? await queryOnce(false) : await queryOnce(true);
    let tripType: "round-trip" | "one-way" = wantRound ? "round-trip" : "one-way";
    if (Array.isArray(flights) && flights.length === 0 && wantRound) {
      // 该日期对无 round-trip 缓存 → 降级同出发日 one-way（真实数据，UI 如实标注）
      flights = await queryOnce(true);
      tripType = "one-way";
    }
    if (flights === "auth") {
      body = { available: false, reason: "auth-error" };
    } else if (flights === "rate") {
      body = { available: false, reason: "rate-limited" };
    } else if (flights === "error") {
      body = { available: false, reason: "upstream-error" };
    } else {
      body =
        flights.length > 0
          ? { available: true, tripType, flights }
          : { available: false, reason: "no-results" };
    }
  } catch {
    body = { available: false, reason: "upstream-error" };
  }

  cache.set(cacheKey, { expires: Date.now() + TTL_MS, body });
  return Response.json(body, { headers: { "Cache-Control": "public, s-maxage=1800" } });
}

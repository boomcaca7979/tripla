import { buildWinkBookingUrl } from "@/lib/affiliate";

/**
 * hotels — 统一 Hotel provider（当前实现：WinkHotelProvider / Wink Booking Engine API）。
 *
 * 核心链路（本轮定稿）：Attraction 真实坐标 → Wink search/geo → distanceInMeters
 * → 按距离从近到远 → 最近 6 家。不再使用城市池排序冒充"附近酒店"。
 *
 * 官方接口（academy.wink.travel/api/booking-engine/，免费层 REST /api/public/**）：
 *   · POST /api/public/{me}/search/geo — location [lon,lat] + searchFilters.radiusInMeters
 *   · 分页 0-based；size 上限 20。
 *
 * 实测行为（2026-09-16 联调，以真实 response 为准）：
 *   · /api/public/** 匿名可调；401/403 时回退 OAuth2 client credentials Bearer 重试一次。
 *   · 价格 = lowestPrice.price.userSpecifiedCurrencyTotal，绑定请求日期
 *     （price.startDate/endDate），是入住区间 stay total；pricingType 实际为 null。
 *   · 部分酒店对所选日期真实无价（三级 available 任一 false）→ 过滤，不补足。
 *   · 图片 = Cloudinary identifier → res.cloudinary.com/traveliko/image/upload/<id>.jpg。
 *
 * 缓存（server 内存）：key = wink|geo|slug|lat|lon|radius|checkIn|checkOut|adults|currency，
 * 相同景点+相同日期复用；日期进 key，绝不跨日期复用价格。TTL 6h + in-flight 去重。
 *
 * 诚信边界：失败/空结果一律真实返回，绝不 mock；无价酒店不补足 6 家。
 */

const WINK_API = "https://api.wink.travel";
const WINK_TIMEOUT_MS = 15_000;
const GEO_TTL_MS = 6 * 3600_000;

/** 每房间成人数（与 Booking URL rc=a2 一致）。 */
export const WINK_ADULTS = 2;

/** Attraction 周边搜索半径（合理城市范围，米）。 */
export const WINK_RADIUS_METERS = 5000;

/** 每个 Attraction 展示的最近酒店数。 */
export const WINK_NEARBY_COUNT = 6;

export interface HotelOffer {
  /** Wink hotelIdentifier（UUID，真实主键）。 */
  id: string;
  name: string;
  /** 首张官方图片（Cloudinary）；provider 没给则缺省。 */
  image?: string;
  /** 官方星级（1–6）；0/缺省不展示。 */
  starRating?: number;
  /** 官方聚合客评分；0/缺省不展示（联调时多数为 0）。 */
  guestRating?: number;
  /** 官方评论数；0/缺省不展示。 */
  reviewCount?: number;
  /** Wink search/geo 返回的距搜索点真实距离（米）。 */
  distanceInMeters?: number;
  /** 所选入住区间真实 stay total（userSpecifiedCurrency）；无真实价格则缺省。 */
  price?: { amount: number; currency: string };
  /** 直接进入该酒店 Booking Engine 页（含 Utripla client-id 归因）；无 urlName 则缺省。 */
  bookingUrl?: string;
}

export interface NearbyHotelsResult {
  available: boolean;
  /** 无供给/无坐标/上游失败时的真实原因（仅 server 日志与调试，不进 UI 文案）。 */
  reason?: "no-coordinates" | "upstream-error" | "empty";
  attraction?: string;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  /** 本批酒店（offset 起的最近一批，距离升序）。 */
  hotels?: HotelOffer[];
  /** 可售酒店总数（全量，供 Refresh 判断是否还有下一批）。 */
  total?: number;
  /** 本批起始偏移。 */
  offset?: number;
}

interface CacheEntry<T> {
  expires: number;
  data: T;
}

interface GeoCachePayload {
  attraction: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  /** 距离升序全量可售酒店（分页在此之上切片）。 */
  offers: HotelOffer[];
}

type GeoCacheValue =
  | { kind: "ok"; payload: GeoCachePayload }
  | { kind: "fail"; result: NearbyHotelsResult };

const geoCache = new Map<string, CacheEntry<GeoCacheValue>>();
const inFlight = new Map<string, Promise<GeoCacheValue>>();

function managingEntityId(): string | undefined {
  const id = process.env.WINK_ENTITY_ID?.trim();
  return id ? id : undefined;
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const ms = new Date(`${checkOut}T00:00:00Z`).getTime() - new Date(`${checkIn}T00:00:00Z`).getTime();
  return Math.max(1, Math.round(ms / 86400000));
}

async function winkFetch(
  path: string,
  init?: RequestInit,
  retryWithAuth = true,
): Promise<Response> {
  const res = await fetch(`${WINK_API}${path}`, {
    ...init,
    headers: {
      "Wink-Version": "2.0",
      Accept: "application/json",
      ...init?.headers,
    },
    signal: AbortSignal.timeout(WINK_TIMEOUT_MS),
    cache: "no-store",
  });
  // 实测 /api/public/** 匿名即可；若端点要求 OAuth（401/403），用 client credentials
  // 换 Bearer token 重试一次（token 只在 server 内存，short-lived）。
  if ((res.status === 401 || res.status === 403) && retryWithAuth) {
    const clientId = process.env.WINK_CLIENT_ID?.trim();
    const clientSecret = process.env.WINK_CLIENT_SECRET?.trim();
    if (clientId && clientSecret) {
      const tokenRes = await fetch("https://iam.wink.travel/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        },
        body: "grant_type=client_credentials",
        signal: AbortSignal.timeout(WINK_TIMEOUT_MS),
        cache: "no-store",
      });
      if (tokenRes.ok) {
        const token = (await tokenRes.json() as { access_token?: string }).access_token;
        if (token) {
          return winkFetch(
            path,
            { ...init, headers: { ...init?.headers, Authorization: `Bearer ${token}` } },
            false,
          );
        }
      }
    }
  }
  return res;
}

interface WinkSearchItem {
  available?: boolean;
  distanceInMeters?: number;
  hotel?: {
    available?: boolean;
    hotelIdentifier?: string;
    name?: string;
    urlName?: string;
    starRating?: number;
    aggregateReviewRating?: number;
    totalReviews?: number;
    images?: Array<{ type?: string; source?: string; identifier?: string }>;
  };
  lowestPrice?: {
    available?: boolean;
    price?: {
      available?: boolean;
      userSpecifiedCurrencyTotal?: { amount?: number; currency?: string };
    };
  };
}

/**
 * Attraction 周边真实酒店：Wink search/geo → distanceInMeters 排序 → 按
 * offset 分页取最近批次（默认第一批 = 最近 6 家）。
 * 结果不足 6 家时返回实际数量，不用远处酒店/其他城市补足。
 */
export async function searchHotelsNearPoint(params: {
  slug: string;
  attraction: string;
  lat: number;
  lon: number;
  radiusMeters?: number;
  checkIn: string;
  checkOut: string;
  /** 分页偏移（Refresh 请求下一批时递增 WINK_NEARBY_COUNT）。 */
  offset?: number;
}): Promise<NearbyHotelsResult> {
  const { slug, attraction, lat, lon, checkIn, checkOut } = params;
  const radiusMeters = params.radiusMeters ?? WINK_RADIUS_METERS;
  const offset = Math.max(0, Math.floor(params.offset ?? 0));
  const me = managingEntityId();
  if (!me) return { available: false, reason: "upstream-error" };

  const cacheKey = [
    "wink",
    "geo",
    slug,
    lat.toFixed(4),
    lon.toFixed(4),
    radiusMeters,
    checkIn,
    checkOut,
    WINK_ADULTS,
    "USD",
  ].join("|");
  const hit = geoCache.get(cacheKey);
  if (hit && hit.expires > Date.now()) {
    return hit.data.kind === "ok"
      ? paginate(hit.data.payload, offset)
      : hit.data.result;
  }
  const pending = inFlight.get(cacheKey);
  if (pending) {
    const payload = await pending;
    return payload.kind === "ok" ? paginate(payload.payload, offset) : payload.result;
  }

  const task = (async (): Promise<GeoCacheValue> => {
    const body = {
      location: { type: "POINT", coordinates: [lon, lat] },
      searchFilters: { radiusInMeters: radiusMeters },
      page: 0,
      size: 20,
      userSession: {
        currency: "USD",
        language: "en",
        itinerary: {
          startDate: checkIn,
          endDate: checkOut,
          room: { adults: WINK_ADULTS, children: [], quantity: 1 },
        },
      },
    };

    let res: Response;
    try {
      res = await winkFetch(`/api/public/${me}/search/geo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      return { kind: "fail", result: { available: false, reason: "upstream-error", attraction } };
    }
    if (!res.ok) {
      return { kind: "fail", result: { available: false, reason: "upstream-error", attraction } };
    }

    let payload: { content?: WinkSearchItem[] };
    try {
      payload = (await res.json()) as { content?: WinkSearchItem[] };
    } catch {
      return { kind: "fail", result: { available: false, reason: "upstream-error", attraction } };
    }
    const content = Array.isArray(payload.content) ? payload.content : [];
    if (content.length === 0) {
      return {
        kind: "fail",
        result: { available: false, reason: "empty", attraction, checkIn, checkOut },
      };
    }

    const nights = nightsBetween(checkIn, checkOut);
    const offers: HotelOffer[] = [];
    for (const item of content) {
      const h = item.hotel;
      if (!h?.hotelIdentifier || !h.name) continue;
      // 真实可售：三级 available 任一明确 false 即视为不可售。
      const bookable =
        item.available !== false &&
        h.available !== false &&
        item.lowestPrice?.available !== false;
      if (!bookable) continue;

      const img = (h.images ?? []).find(
        (i) => i.type === "IMAGE" && i.source === "CLOUDINARY" && i.identifier,
      );
      const total = item.lowestPrice?.price?.userSpecifiedCurrencyTotal;
      const price =
        total && typeof total.amount === "number" && total.amount > 0 && total.currency
          ? { amount: total.amount, currency: total.currency }
          : undefined;

      offers.push({
        id: h.hotelIdentifier,
        name: h.name,
        image: img?.identifier
          ? `https://res.cloudinary.com/traveliko/image/upload/${img.identifier}.jpg`
          : undefined,
        starRating: typeof h.starRating === "number" && h.starRating > 0 ? h.starRating : undefined,
        guestRating:
          typeof h.aggregateReviewRating === "number" && h.aggregateReviewRating > 0
            ? h.aggregateReviewRating
            : undefined,
        reviewCount:
          typeof h.totalReviews === "number" && h.totalReviews > 0 ? h.totalReviews : undefined,
        distanceInMeters:
          typeof item.distanceInMeters === "number" ? item.distanceInMeters : undefined,
        price,
        bookingUrl: h.urlName
          ? buildWinkBookingUrl({
              hotelUrlName: h.urlName,
              checkIn,
              checkOut,
              adults: WINK_ADULTS,
            })
          : undefined,
      });
    }

    // 按距离从近到远（Wink distanceInMeters）；无距离值排最后。全量入缓存，
    // 分页切片在缓存之上做（同景点同日期的 Refresh 共用一次上游请求）。
    offers.sort((a, b) => {
      const da = a.distanceInMeters ?? Number.POSITIVE_INFINITY;
      const db = b.distanceInMeters ?? Number.POSITIVE_INFINITY;
      return da - db;
    });
    const geoPayload: GeoCachePayload = { attraction, checkIn, checkOut, nights, offers };
    const value: GeoCacheValue =
      offers.length > 0 ? { kind: "ok", payload: geoPayload } : { kind: "fail", result: { available: false, reason: "empty", attraction, checkIn, checkOut } };
    geoCache.set(cacheKey, { expires: Date.now() + GEO_TTL_MS, data: value });
    return value;
  })();

  inFlight.set(cacheKey, task);
  try {
    const value = await task;
    return value.kind === "ok" ? paginate(value.payload, offset) : value.result;
  } finally {
    inFlight.delete(cacheKey);
  }
}

/** 从全量缓存切片出本批结果（offset 越界 → 空 hotels 但 total 真实）。 */
function paginate(payload: GeoCachePayload, offset: number): NearbyHotelsResult {
  const hotels = payload.offers.slice(offset, offset + WINK_NEARBY_COUNT);
  return {
    available: hotels.length > 0,
    reason: hotels.length > 0 ? undefined : "empty",
    attraction: payload.attraction,
    checkIn: payload.checkIn,
    checkOut: payload.checkOut,
    nights: payload.nights,
    hotels,
    total: payload.offers.length,
    offset,
  };
}

/** route 入参校验：YYYY-MM-DD 且 checkOut > checkIn。 */
export function isValidStayDates(checkIn?: string | null, checkOut?: string | null): boolean {
  if (!checkIn || !checkOut) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut)) return false;
  return new Date(`${checkOut}T00:00:00Z`).getTime() > new Date(`${checkIn}T00:00:00Z`).getTime();
}

/** route 入参校验：合法 WGS84 坐标。 */
export function isValidLatLng(lat?: string | null, lon?: string | null): boolean {
  if (!lat || !lon) return false;
  const la = Number(lat);
  const lo = Number(lon);
  if (!Number.isFinite(la) || !Number.isFinite(lo)) return false;
  return la >= -90 && la <= 90 && lo >= -180 && lo <= 180;
}

import { getDestinationSlugs } from "@/data/destinations";
import {
  isValidLatLng,
  isValidStayDates,
  searchHotelsNearPoint,
  type NearbyHotelsResult,
} from "@/lib/api/hotels";

/**
 * /api/hotels — Attraction 周边真实酒店（Wink search/geo + distanceInMeters）。
 *
 * 额度保护：server-side 请求 + 6h 内存缓存/景点（key = geo|lat|lon|radius|dates|
 * adults|currency，日期进 key 绝不跨日期复用价格）；客户端进入视口才调用。
 * 无坐标 / 无结果 / 上游失败 → { available:false }，客户端渲染诚实空态 —— 绝不 mock。
 *
 * 缓存分级：只有真实供给才长缓存；上游失败**绝不**进 CDN（否则一次抖动会被
 * 锁死数小时，表现为"某个景点酒店区整片空白"）。
 */
function hotelsCacheControl(result: NearbyHotelsResult): string {
  if (result.available && (result.hotels?.length ?? 0) > 0) {
    return "public, s-maxage=21600, stale-while-revalidate=3600";
  }
  switch (result.reason) {
    case "empty":
    case "no-coordinates":
      return "public, s-maxage=600, stale-while-revalidate=120";
    default:
      return "no-store";
  }
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const name = searchParams.get("name");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  if (!slug || !name || !lat || !lon) {
    return Response.json({ error: "Missing slug/name/lat/lon" }, { status: 400 });
  }

  // slug 白名单 = 真实目的地数据集，防注入/防遍历。
  if (!getDestinationSlugs().includes(slug)) {
    return Response.json({ error: "Unknown destination" }, { status: 404 });
  }
  if (!isValidLatLng(lat, lon)) {
    return Response.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  // 入住日期：客户端透传（与页面 Suggested city stay 语义一致）；缺省/非法 →
  // 服务端同一规则兜底（今天起 1 夜）。日期进缓存 key，绝不跨日期复用价格。
  const now = new Date();
  const fallbackIn = now.toISOString().slice(0, 10);
  const fallbackOut = new Date(now.getTime() + 86400000).toISOString().slice(0, 10);
  const qIn = searchParams.get("checkIn");
  const qOut = searchParams.get("checkOut");
  const checkIn = isValidStayDates(qIn, qOut) ? (qIn as string) : fallbackIn;
  const checkOut = isValidStayDates(qIn, qOut) ? (qOut as string) : fallbackOut;

  // 分页偏移（Refresh 下一批）：非负整数，缺省 0。
  const rawOffset = Number(searchParams.get("offset") ?? "0");
  const offset = Number.isInteger(rawOffset) && rawOffset > 0 ? Math.min(rawOffset, 200) : 0;

  const result = await searchHotelsNearPoint({
    slug,
    attraction: name,
    lat: Number(lat),
    lon: Number(lon),
    checkIn,
    checkOut,
    offset,
  });
  return Response.json(result, {
    headers: { "Cache-Control": hotelsCacheControl(result) },
  });
}

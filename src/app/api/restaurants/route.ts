import { NextResponse } from "next/server";
import { searchRestaurants } from "@/lib/api/restaurants";

/**
 * GET /api/restaurants — 真实餐厅搜索（server-side key，客户端不直连 Geoapify）。
 *
 * 参数（全部严格校验）：
 *   slug    城市标识（1–80 字符）
 *   lat     纬度（-90..90）
 *   lon     经度（-180..180）
 *   radius  搜索半径米数（200..20000，默认 2000）
 *   limit   数量（1..12，默认 6）
 *
 * 缓存：server 端 24h（key = restaurant|geo|slug|lat|lon|radius|category|limit）。
 * 错误语义：not-configured / invalid-params / auth-error / rate-limited /
 * upstream-error / no-results —— 绝不 mock、绝不补造数据。
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = (url.searchParams.get("slug") ?? "").trim();
  const lat = Number(url.searchParams.get("lat"));
  const lon = Number(url.searchParams.get("lon"));
  const radius = url.searchParams.get("radius");
  const limit = url.searchParams.get("limit");

  if (slug.length === 0 || slug.length > 80) {
    return NextResponse.json({ available: false, reason: "invalid-params" }, { status: 400 });
  }

  const result = await searchRestaurants({
    slug,
    lat,
    lon,
    radius: radius === null ? undefined : Number(radius),
    limit: limit === null ? undefined : Number(limit),
  });

  return NextResponse.json(result, {
    status: result.available ? 200 : result.reason === "invalid-params" ? 400 : 200,
    headers: { "Cache-Control": "no-store" },
  });
}

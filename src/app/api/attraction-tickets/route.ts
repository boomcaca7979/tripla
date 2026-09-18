import { getDestinationBySlug, getDestinationSlugs } from "@/data/destinations";
import { searchAttractionTickets, viatorCacheControl } from "@/lib/api/viator";

/**
 * /api/attraction-tickets — 单个 Attraction 的可预订门票/体验（Viator）。
 *
 * 入参：slug（白名单）+ name（attraction 真实名）。返回 provider 真实产品；
 * 无 key / 无结果 / 上游失败 → { available:false }，客户端渲染诚实空态。
 * 缓存分级见 `viatorCacheControl`（失败态不得被 CDN 长缓存）。
 */

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const name = searchParams.get("name");
  if (!slug || !name) {
    return Response.json({ error: "Missing slug/name" }, { status: 400 });
  }
  if (!getDestinationSlugs().includes(slug)) {
    return Response.json({ error: "Unknown destination" }, { status: 404 });
  }
  const dest = getDestinationBySlug(slug);
  if (!dest) {
    return Response.json({ error: "Unknown destination" }, { status: 404 });
  }
  if (name.length > 120) {
    return Response.json({ error: "Invalid name" }, { status: 400 });
  }

  const result = await searchAttractionTickets({ attraction: name, city: dest.city, limit: 4 });
  return Response.json(result, {
    headers: { "Cache-Control": viatorCacheControl(result) },
  });
}

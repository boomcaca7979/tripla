import { getDestinationBySlug, getDestinationSlugs } from "@/data/destinations";
import { searchCityExperiences, viatorCacheControl } from "@/lib/api/viator";

/**
 * /api/experiences — Destination 页可预订体验（Viator Basic Affiliate）。
 *
 * 额度保护：server-side 请求 + 24h 内存缓存/城市（见 viator.ts）；客户端
 * 进入视口才调用本接口，首屏不发请求。无 key / 无结果 → { available:false }，
 * 客户端渲染简洁空态 —— 绝不返回 mock 数据。
 *
 * 缓存分级见 `viatorCacheControl`：曾经对所有结果统一下发 s-maxage=86400，
 * 导致一次上游抖动把失败态锁死 24 小时（"某城市整天空白"）。
 */

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  if (!slug) {
    return Response.json({ error: "Missing slug" }, { status: 400 });
  }

  // slug 白名单 = 真实目的地数据集，防注入/防遍历。
  if (!getDestinationSlugs().includes(slug)) {
    return Response.json({ error: "Unknown destination" }, { status: 404 });
  }

  const dest = getDestinationBySlug(slug);
  if (!dest) {
    return Response.json({ error: "Unknown destination" }, { status: 404 });
  }

  const result = await searchCityExperiences(dest.city);
  return Response.json(result, {
    headers: { "Cache-Control": viatorCacheControl(result) },
  });
}

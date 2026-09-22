import type { NextConfig } from "next";
import { DESTINATIONS } from "./src/data/destinations";

/** 转义城市名中的正则特殊字符（如 "Bali (Denpasar)"）。 */
function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 城市名 → 连字符 slug（"New York" → "new-york"）。
 *  先做 Unicode NFD 分解去掉变音符号，否则 "Bogotá" 会退化成 "bogot"
 *  （á 被当作分隔符丢弃），推导出用户永远不会输入的错误别名。 */
function hyphenatedSlug(city: string): string {
  return city
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Destination slug 容错（canonical 不动）。
 *
 * 数据里的 slug 并不总是"城市名连字符化"：`city: "New York"` 的 slug 是
 * `newyork`，而用户/外链更常写成 `/destinations/new-york`（以前的 404）。
 * 这里按**数据本身**推导城市名的连字符形式，只为与 canonical 不同的组合
 * 生成 301 —— 不硬编码任何单一城市。
 *
 * 两条硬约束（防遮蔽与防环）：
 *   · alias === 某个真实 canonical slug → 跳过（绝不把真页面 301 掉）；
 *   · alias 重复 → 只保留第一条。
 */
const CANONICAL_DESTINATION_SLUGS = new Set(DESTINATIONS.map((d) => d.slug));

function buildDestinationSlugAliases() {
  const seen = new Set<string>();
  const out: { source: string; destination: string; statusCode: 301 }[] = [];
  for (const d of DESTINATIONS) {
    const alias = hyphenatedSlug(d.city);
    if (!alias || alias === d.slug) continue; // 无变化 → 不生成自环
    if (CANONICAL_DESTINATION_SLUGS.has(alias)) continue; // 不遮蔽真实页面
    if (seen.has(alias)) continue; // 别名冲突 → 首条优先
    seen.add(alias);
    out.push({
      source: `/destinations/${alias}`,
      destination: `/destinations/${d.slug}`,
      statusCode: 301,
    });
  }
  return out;
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
    ],
  },
  async redirects() {
    return [
      // 移除用户系统与 SaaS 残留后，将旧入口 301 到首页，避免已收录 URL 404。
      // /login 与 /signup 已恢复为真实认证页（WorkBuddy Cloud auth），不再重定向。
      { source: "/forgot-password", destination: "/", statusCode: 301 },
      { source: "/reset-password", destination: "/", statusCode: 301 },
      { source: "/pricing", destination: "/", statusCode: 301 },
      // ── 已下线栏目：Regions 与 Best Time to Visit ──────────────────────
      // 这两个栏目已从前端导航（Header/Footer）、sitemap 与站内链接中完整移除。
      // 它们此前是公开收录页面，因此这里保留 301 兜底 —— 不产生 404，也不留下
      // 只能靠孤儿页吃收录的 thin content。
      //   · /regions*            → /destinations（区域维度由 Destination 发现层承担）
      //   · /best-time-to-visit* → 对应城市的 /destinations/<slug>（气候/月份数据
      //     仍保留在 Destination 页面内部，只是不再有独立栏目包装）
      { source: "/regions", destination: "/destinations", statusCode: 301 },
      { source: "/regions/:region", destination: "/destinations", statusCode: 301 },
      { source: "/best-time-to-visit", destination: "/destinations", statusCode: 301 },
      {
        source: "/best-time-to-visit/:slug",
        destination: "/destinations/:slug",
        statusCode: 301,
      },
      // 城市唯一页规则：/guides?city=<城市> 308 → /destinations/<slug>。
      // config 级 redirect 保证爬虫/直链拿到真 308（页面级流式跳转仅作兜底）。
      ...DESTINATIONS.map((d) => ({
        source: "/guides",
        has: [{ type: "query" as const, key: "city", value: escapeRegex(d.city) }],
        destination: `/destinations/${d.slug}`,
        statusCode: 308 as const,
      })),
      // Destination slug 容错：连字符写法 301 → canonical slug（如
      // /destinations/new-york → /destinations/newyork）。canonical、sitemap、
      // 页面输出与 Destination Detail 设计均不变；alias 与真 slug 冲突时不生成。
      ...buildDestinationSlugAliases(),
    ];
  },
};

export default nextConfig;

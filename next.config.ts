import type { NextConfig } from "next";
import { DESTINATIONS } from "./src/data/destinations";

/** 转义城市名中的正则特殊字符（如 "Bali (Denpasar)"）。 */
function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      // 移除用户系统与 SaaS 残留后，将旧入口 301 到首页，避免已收录 URL 404
      { source: "/login", destination: "/", statusCode: 301 },
      { source: "/signup", destination: "/", statusCode: 301 },
      { source: "/forgot-password", destination: "/", statusCode: 301 },
      { source: "/reset-password", destination: "/", statusCode: 301 },
      { source: "/pricing", destination: "/", statusCode: 301 },
      // 城市唯一页规则：/guides?city=<城市> 308 → /destinations/<slug>。
      // config 级 redirect 保证爬虫/直链拿到真 308（页面级流式跳转仅作兜底）。
      ...DESTINATIONS.map((d) => ({
        source: "/guides",
        has: [{ type: "query" as const, key: "city", value: escapeRegex(d.city) }],
        destination: `/destinations/${d.slug}`,
        statusCode: 308 as const,
      })),
    ];
  },
};

export default nextConfig;

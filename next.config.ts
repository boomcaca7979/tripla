import type { NextConfig } from "next";

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
    ];
  },
};

export default nextConfig;

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/plan", "/api/"],
      },
    ],
    sitemap: "https://travel-planner-two-livid.vercel.app/sitemap.xml",
  };
}

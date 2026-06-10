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
    sitemap: "https://www.utripla.xyz/sitemap.xml",
  };
}

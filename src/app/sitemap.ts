import type { MetadataRoute } from "next";

const SITE_URL = "https://travel-planner-two-livid.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/destinations", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/guides", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/trips", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/pricing", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/login", priority: 0.5, changeFrequency: "yearly" as const },
    { path: "/signup", priority: 0.5, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  return routes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}

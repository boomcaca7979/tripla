import { NextResponse } from "next/server";
import { generateSitemapEntries } from "@/app/sitemap";

export function GET() {
  const entries = generateSitemapEntries();
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];
  for (const e of entries) {
    lines.push("<url>");
    lines.push(`<loc>${e.url}</loc>`);
    if (e.changeFrequency) {
      lines.push(`<changefreq>${e.changeFrequency}</changefreq>`);
    }
    if (e.priority !== undefined) {
      lines.push(`<priority>${e.priority}</priority>`);
    }
    lines.push("</url>");
  }
  lines.push("</urlset>");
  const xml = lines.join("\n");

  return new NextResponse(xml, {
    headers: {
      "content-type": "application/xml",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}

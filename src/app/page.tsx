import type { Metadata } from "next";
import HomeEnvironment from "@/components/home/HomeEnvironment";
import HomeHero from "@/components/home/HomeHero";
import DiscoveryStage, { type DiscoveryPlace } from "@/components/home/DiscoveryStage";
import RoutesStage from "@/components/home/RoutesStage";
import GuidesStage from "@/components/home/GuidesStage";
import PlanLater from "@/components/home/PlanLater";
import { DESTINATIONS } from "@/data/destinations";

const SITE_URL = "https://www.utripla.xyz";

const HOME_TITLE = "tripla — Interactive Travel Discovery";
const HOME_DESCRIPTION = `Wander a living atlas of ${DESTINATIONS.length} destinations, stolen routes and field notes. No account, no search box in your face — open it and see what pulls you in.`;

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
};

/**
 * Home JSON-LD — WebSite。
 * 纯 SSR：由 Server Component 直接序列化，不进入客户端 bundle，无 hydration 成本。
 * 只写代码/站点已有的真实信息（品牌名 tripla、站点 URL、页面 description）；
 * 不制造 rating / review / author / organization 等无来源字段。
 */
function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "tripla",
    url: `${SITE_URL}/`,
    description: HOME_DESCRIPTION,
  };
}

// 编辑排序：精选城市排前，其余按数据顺序（SSR 默认视图使用）
const FEATURED_ORDER = [
  "tokyo", "kyoto", "paris", "lisbon", "rome", "barcelona", "seoul",
  "bangkok", "singapore", "bali", "newyork", "marrakech", "copenhagen",
  "hanoi", "florence", "mexico-city",
];

function phraseOf(description: string): string {
  const s = description.replace(/\s+/g, " ").trim();
  const firstSentence = s.split(/(?<=[.!?])\s/)[0] ?? s;
  return firstSentence.length <= 96 ? firstSentence : `${firstSentence.slice(0, 93).trimEnd()}…`;
}

export default function Home() {
  const bySlug = new Map(DESTINATIONS.map((d) => [d.slug, d]));
  const ordered = [
    ...FEATURED_ORDER.map((s) => bySlug.get(s)).filter((d): d is NonNullable<typeof d> => Boolean(d)),
    ...DESTINATIONS.filter((d) => !FEATURED_ORDER.includes(d.slug)),
  ];

  const places: DiscoveryPlace[] = ordered.map((d) => ({
    slug: d.slug,
    city: d.city,
    country: d.country,
    region: d.region,
    phrase: phraseOf(d.description),
    gradient: d.gradient,
    image: d.image,
    bestSeason: d.bestSeason ?? d.bestMonths,
    interests: d.interests as unknown as string[],
  }));

  return (
    <HomeEnvironment>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildWebSiteJsonLd()) }}
      />
      <HomeHero />
      <PlanLater />
      <DiscoveryStage places={places} />
      <RoutesStage />
      <GuidesStage />
    </HomeEnvironment>
  );
}

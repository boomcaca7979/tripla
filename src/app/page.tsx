import type { Metadata } from "next";
import HomeEnvironment from "@/components/home/HomeEnvironment";
import HomeHero from "@/components/home/HomeHero";
import PlanLater from "@/components/home/PlanLater";
import DiscoveryStage from "@/components/home/DiscoveryStage";
import GuidesStage from "@/components/home/GuidesStage";
import RoutesStage from "@/components/home/RoutesStage";
import PlanStage from "@/components/home/PlanStage";
import { buildCityIndex, buildHomePlaces } from "@/lib/home-data";
import { DESTINATIONS } from "@/data/destinations";

const SITE_URL = "https://www.utripla.xyz";

const HOME_TITLE = "tripla — Interactive Travel Discovery";
const HOME_DESCRIPTION = `Wander a living atlas of ${DESTINATIONS.length} destinations, stolen routes and field notes. No sign-up wall, no search box in your face — open it and see what pulls you in.`;

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
function buildWebSiteJsonLd(count: number) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "tripla",
    url: `${SITE_URL}/`,
    description:
      `Wander a living atlas of ${count} destinations — filter by month, mood and budget.`,
  };
}

/**
 * 首页信息顺序（本轮整理后的逻辑：发现 → 了解 → 比较 → 决定 → 规划）：
 *
 *   HomeHero          第一屏：发现目的地（条件 → 结果，状态跟随选择）
 *   PlanLater         Already know where?：已经知道去哪 → 直接进入规划
 *   DiscoveryStage    What are you in the mood for?：月份 / mood / budget 发现目的地
 *                     （内含 Destination preview：快速判断一个地方是否值得去）
 *   GuidesStage       Read before you go.：决定前必须知道的六件事（+ 次级文章索引）
 *   RoutesStage       Steal a route.：可直接参考/使用的完整旅行方案
 *   PlanStage         Plan your trip：Discover → Compare → Understand → Plan
 *
 * 数据集（145 目的地 + canonical 月值 + 城市索引）在此一次装配，作为 props 下发；
 * 客户端不再导入气候/目的地数据集。
 */
export default function Home() {
  const places = buildHomePlaces();
  const cityIndex = buildCityIndex();
  // 首屏确定性月份：SSG 构建时与客户端首次 render 一致；客户端 hydration 后再校正。
  const initialMonth = new Date().getMonth();

  return (
    <HomeEnvironment places={places} initialMonth={initialMonth}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildWebSiteJsonLd(places.length)) }}
      />
      <HomeHero />
      <PlanLater cityIndex={cityIndex} />
      <DiscoveryStage />
      <GuidesStage />
      <RoutesStage />
      <PlanStage />
    </HomeEnvironment>
  );
}

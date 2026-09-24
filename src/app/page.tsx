import type { Metadata } from "next";
import HomeEnvironment from "@/components/home/HomeEnvironment";
import HomeHero from "@/components/home/HomeHero";
import PlanLater from "@/components/home/PlanLater";
import ExploreStage from "@/components/home/sections/ExploreStage";
import UnderstandStage from "@/components/home/sections/UnderstandStage";
import CompareStage from "@/components/home/sections/CompareStage";
import TravelStage from "@/components/home/sections/TravelStage";
import { buildCityIndex, buildHomeIndex, buildHomePlaces } from "@/lib/home-data";
import { buildHomeSectionImages } from "@/lib/home-postcards";
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
 * description 与 Hero 的产品叙事同源（Explore → Understand → Compare → Travel），
 * 不描述已下线的能力。
 */
function buildWebSiteJsonLd(count: number) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "tripla",
    url: `${SITE_URL}/`,
    description:
      `Wander a living atlas of ${count} destinations — explore places, understand them, compare them, then continue into travel.`,
  };
}

/**
 * 首页信息顺序（本轮重构后的逻辑：发现 → 看懂 → 比较 → 出发）：
 *
 *   HomeHero        第一屏：发现目的地（世界地图 + 目的地读数 + 直接规划入口）
 *   PlanLater       Already know where?：已经知道去哪 → 直接进入规划
 *                   （承载 #ready 与 #hero-search 两个锚点，站内 60+ 深链依赖后者）
 *   ExploreStage    Explore the world through places.：真实目的地大图 + 真实 Destination UI
 *   UnderstandStage Understand a place before you go.：天气 / 季节 / 降雨 / 当地时间 + 邻近小地图
 *   CompareStage    Compare destinations.：三块目的地并置 + 年度气候曲线（与地球页同语言）
 *   TravelStage     From discovery to travel.：Flights / Hotels / Experiences 真实服务入口
 *
 * 四段共同遵守：图片 = 真实目的地照片（该项目图集已目检）；读数 = 真实数据
 * （canonical 气候 / 真实坐标 / 实时天气 / 真实服务），不虚构任何功能。
 *
 * 数据集按消费方拆成三份，在此一次装配后作为 props 下发（2026-09-24 payload 收缩）：
 *   · places      —— 首页交互面 6 城（Explore/Understand/Compare 可切换展示的），
 *                    含 canonical 月值；全量 205 城月值不再下发（其消费方已删除）。
 *   · placeIndex  —— 全量目的地的轻量身份（邻近计算 / 计数），无月值。
 *   · cityIndex   —— SearchBar 的城市/机场索引（PlanLater）。
 * 四段的图片同样在此由 server 端装配（图集数据不进 client bundle）。
 * 客户端不再导入气候/目的地数据集。数量一律动态（当前 205），不要把数字写死。
 */
export default function Home() {
  const places = buildHomePlaces();
  const placeIndex = buildHomeIndex();
  const cityIndex = buildCityIndex();
  const images = buildHomeSectionImages();
  // 首屏确定性月份：SSG 构建时与客户端首次 render 一致；客户端 hydration 后再校正。
  const initialMonth = new Date().getMonth();

  return (
    <HomeEnvironment places={places} placeIndex={placeIndex} initialMonth={initialMonth}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildWebSiteJsonLd(placeIndex.length)) }}
      />
      <HomeHero />
      <PlanLater cityIndex={cityIndex} />
      <ExploreStage hero={images.explore} />
      <UnderstandStage hero={images.understand} />
      <CompareStage cards={images.compare} />
      <TravelStage card={images.travel} />
    </HomeEnvironment>
  );
}

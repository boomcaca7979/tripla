import type { Metadata } from "next";
import TripsWorkspace from "@/components/trips/workspace/TripsWorkspace";

/**
 * /trips — Personal Travel Workspace（个人旅行工作台）。
 *
 * 产品定位（相对站点其余部分）：
 *   Destinations = 发现目的地 · Guides = 了解目的地 · Trips = 组织自己的旅行
 *   Discover → Save → Compare → Organize → Plan → Travel → Track
 *
 * 与旧 /trips Hub（预制 280-trip 内容列表）的区别：本页是用户自己的工作台，
 * 全部状态为 mock / local state（localStorage 持久化），不要求本阶段接入真实后端。
 * 预制 Trip 的 Detail 页（/trips/[slug]）不受影响，仍走既有 Journey Experience。
 *
 * 视觉：沿用 /trips 既有"暗底世界"（.ut-world + data-ut-page="trips" 的
 * ENV_DARK_TOKENS 墨色修复，见 globals.css），版式语言借 /guides 内页
 * （display 衬线标题 + 等宽 eyebrow + editorial 阅读宽度）。
 */

export const metadata: Metadata = {
  // 导航标签为 Account；本页是个人工作台（默认视图 My trips）。
  // 匿名抓取者只看到空壳 → noindex，但保留 follow，站内链接仍可爬。
  title: "Account",
  description:
    "Your personal travel workspace — collect places, shortlist hotels, sketch routes, split expenses and get every trip ready to go.",
  alternates: {
    canonical: "/trips",
  },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Account · tripla",
    description:
      "Your personal travel workspace — collect places, shortlist hotels, sketch routes, split expenses and get every trip ready to go.",
    type: "website",
    url: "https://www.utripla.xyz/trips",
  },
  twitter: {
    card: "summary",
    title: "Account · tripla",
    description:
      "Your personal travel workspace — collect places, shortlist hotels, sketch routes, split expenses and get every trip ready to go.",
  },
};

export default function TripsPage() {
  return (
    <div className="ut-world min-h-screen" data-ut-page="trips">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "tripla Account — Personal Travel Workspace",
            description:
              "Plan the journeys you're actually taking — places, stays, routes, expenses and checklists in one workspace.",
            url: "https://www.utripla.xyz/trips",
          }),
        }}
      />
      <TripsWorkspace />
    </div>
  );
}

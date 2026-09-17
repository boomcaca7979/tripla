import Eyebrow from "@/components/ui/Eyebrow";
import SearchBar from "@/components/search/SearchBar";
import type { CityIndexEntry } from "@/components/search/AirportAutocomplete";
import { BUDGET_NOTE } from "@/lib/home-discovery";

/**
 * PlanLater — "Already know where?" 层（另一类用户：已经知道要去哪，直接进入规划）。
 *
 * 保留既有结构、视觉方向与全部字段（From / To / Dates / Travelers / Travel style /
 * Budget / Interests），本轮修正三点：
 *   1. From / To 用**城市名**搜索（机场代码只出现在候选项里），由 cityIndex 提供
 *      145 个目的地的真实城市索引；
 *   2. Budget 档位带明确价格区间 + "不含长途机票"的口径说明；
 *   3. 文案说明这些字段会一起进入规划参数（点击后写入 /plan）。
 *
 * 宽度（本轮）：外层沿用首页主内容宽度（--ut-container-max，1280px），表单卡片不再
 * 单独收窄到 max-w-3xl —— 与首页其他区块形成统一宽度体系；引导文案仍保持可读行宽。
 *
 * 保留 `#hero-search` 锚点：60 个 AI 落地页与攻略页的 planner 深链依赖它。
 */
export default function PlanLater({ cityIndex }: { cityIndex: CityIndexEntry[] }) {
  return (
    <section
      id="ready"
      className="scroll-mt-20 border-t"
      style={{ borderTopColor: "rgba(var(--ut-accent-rgb), 0.16)" }}
    >
      <div className="mx-auto max-w-[var(--ut-container-max)] px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow dot>When you&apos;re ready</Eyebrow>
          <h2 className="mt-3 font-display text-h1 text-ut-ink">Already know where?</h2>
          <p className="mx-auto mt-3 max-w-[58ch] text-body text-ut-text-2">
            Then skip the browsing. Type city names — no airport codes needed — add your
            dates, travellers, travel style, budget and interests, and we&apos;ll sketch
            the route, check the weather window and hand you a plan you can bend.
          </p>
        </div>

        {/* 表单与首页其他主内容区同宽（--ut-container-max），不再是 max-w-3xl 的窄卡 */}
        <div id="hero-search" className="mt-10 w-full scroll-mt-24">
          <SearchBar
            cityIndex={cityIndex}
            copy={{
              fromPlaceholder: "City name — e.g. Tokyo",
              toPlaceholder: "City name — e.g. Paris",
              budgetLabels: {
                budget: "Economy — under $100/day",
                "mid-range": "Mid-range — $100–250/day",
                luxury: "Premium — $250+/day",
              },
              budgetNote: BUDGET_NOTE,
              errorOriginDest: "Choose both an origin and a destination city.",
              errorDates: "Pick your departure and return dates.",
            }}
          />
        </div>
      </div>
    </section>
  );
}

import Eyebrow from "@/components/ui/Eyebrow";
import DecisionSignals, { type Signal } from "./DecisionSignals";
import { seasonLabel, type WindowSummary } from "./besttime-state";
import type { Destination } from "@/data/destinations";

/**
 * ClimateHero — Best-time 的「Decision First」首屏。
 *
 * CONTRACT：
 *   §4  首屏顺序被固定为：Breadcrumb（由 page 渲染）→ Decision eyebrow →
 *       Instrument Serif H1 → destination context → **best-month signal** →
 *       compact climate / season readout。没有大图 hero、没有营销 CTA、
 *       没有"探索 / 开始规划"之类与决策无关的转化入口。
 *   §5  这不是 Destination 的 Place Hero，也不是 Guide 的 Editorial Hero：
 *       它不卖目的地，只回答"什么时候去"。因此刻意**没有图片**——
 *       一张漂亮的照片会让页面读起来像 marketing，而不是 decision support。
 *   §10 Environment Depth = 2：季节氛围只体现为一条季节色 hairline
 *       （rgba(var(--ut-season-rgb), …)，装饰性），不写 --ut-accent。
 *   §26 全页唯一 Primary CTA 不在此处（置于文末），首屏只有信息。
 *
 * 数据诚实（核心约束）：
 *   · H1 之后的 context 行 = 真实字段（country / region）+ 派生（climate zone / hemisphere）。
 *   · best-month signal = canonical bestMonthsBaseline（R1–R7 派生窗口）。
 *   · 支撑句 = 真实 dest.bestSeason（原文引用，不改写、不润色）。
 *   · climate score = 真实 dest.weatherScore（label + overall + recommendation）。
 *   页面内没有任何 °C / mm / 日照小时 / 客流数字——因为项目不存在这些数据。
 */

export default function ClimateHero({
  dest,
  window: win,
  zone,
  hemisphere,
  signals,
}: {
  dest: Destination;
  window: WindowSummary;
  zone: string;
  hemisphere: string;
  signals: Signal[];
}) {
  const seasonSupport =
    win.seasons.length > 0
      ? win.seasons.map((s) => seasonLabel(s)).join(" / ")
      : "—";

  return (
    <header data-ut-hero="">
      {/* Decision eyebrow：先声明这是什么类型的页面 */}
      <Eyebrow>
        When to go · {dest.country}
      </Eyebrow>

      {/* Instrument Serif H1（句首大写，禁止 uppercase） */}
      <h1 className="mt-3 max-w-[22ch] font-display text-display-lg leading-[var(--ut-text-display-lg--lh)] text-ut-ink">
        Best time to visit {dest.city}
      </h1>

      {/* Destination context（真实 country/region + 派生 climate zone/hemisphere） */}
      <p className="mt-4 font-mono text-label uppercase tracking-[0.16em] text-ut-muted">
        {dest.country} · {dest.region} · {zone} climate · {hemisphere} hemisphere
      </p>

      {/* Best-month signal（真实窗口）+ 真实气候评级 */}
      <div
        className="mt-8 grid gap-x-12 gap-y-8 border-t pt-7 lg:grid-cols-12"
        style={{ borderTopColor: "rgba(var(--ut-season-rgb), 0.45)" }}
      >
        <div className="lg:col-span-7">
          <Eyebrow>Recommended window</Eyebrow>
          <p className="mt-3 max-w-[26ch] font-display text-h1 leading-[var(--ut-text-h1--lh)] text-ut-ink">
            {win.label}
          </p>
          <p className="mt-4 max-w-[58ch] text-body leading-[1.6] text-ut-text-2">
            {dest.bestSeason}
          </p>
          <p className="mt-4 font-mono text-label uppercase tracking-[0.16em] text-ut-subtle">
            {win.count} {win.count === 1 ? "month" : "months"} · {seasonSupport}
          </p>
        </div>

        <div className="lg:col-span-5">
          <Eyebrow>Climate score</Eyebrow>
          <p className="mt-3 font-mono text-h3 leading-[1.3] text-ut-ink">
            {dest.weatherScore.label}
            <span className="text-ut-muted"> · {dest.weatherScore.overall}/100</span>
          </p>
          <p className="mt-3 max-w-[46ch] text-body-sm leading-[1.6] text-ut-text-2">
            {dest.weatherScore.recommendation}
          </p>
        </div>
      </div>

      {/* Compact climate / season readout（首屏最后一层：仪器读数） */}
      <div className="mt-8">
        <DecisionSignals signals={signals} />
      </div>
    </header>
  );
}

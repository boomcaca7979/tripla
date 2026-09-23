"use client";

import { useHomeState } from "./HomeEnvironment";
import { timeLabel } from "@/lib/visual-state";

/**
 * HomeStatusLine — 首屏第三层文字（唯一的状态行）。
 *
 * 只显示**用户当前真实产生的状态**，其余一律不编造：
 *   · 已选目的地      → "Kyoto · 06:20 AM local"
 *   · 拖动时间轴预览  → 追加 " · Preview"（TimeDock 的真实交互反馈）
 *   · 未选目的地      → **不渲染**（没有真实状态可报，就不留占位、不显示集合级读数）
 *
 * 为什么删掉了其余片段（2026-09-23 首页下半部分重构之后）：
 *   旧行由 `buildStatusLine` 拼出 month / mood / budget 片段与"按条件筛选出的集合
 *   天气·季节众数"。这些取值的唯一来源是已删除的发现层（DiscoveryStage）控件；控件
 *   不存在后它们恒为默认（mood=all / month=null / budget=any），继续显示就是**假状态**
 *   —— "September · Warm weather · Shoulder season" 会被读成对全世界 205 个目的地
 *   的断言，而它实际只是"没有任何筛选时全量集合的众数"。
 *   天气 / 季节 / 降雨 / 预算改由下面四段各自用真实数据表达：
 *   Explore（单地当月 canonical + 实时当地时间）、Understand（destination information）、
 *   Compare（三地并置）。
 *
 * 时间真值仍来自 lib/visual-state.ts 的 timeLabel（与 TimeDock 同一来源），不新建系统。
 */
export default function HomeStatusLine() {
  const { destination, hour, hourOverride } = useHomeState();

  // 没有"已选目的地"就没有可播报的真实状态：整行不渲染（而不是显示默认读数）
  if (!destination?.label) return null;

  return (
    <p
      suppressHydrationWarning
      aria-live="polite"
      className="ut-t-data"
      style={{ color: "var(--ut-hero-soft)" }}
    >
      {destination.label} · {timeLabel(hour)} local
      {hourOverride === null ? "" : " · Preview"}
    </p>
  );
}

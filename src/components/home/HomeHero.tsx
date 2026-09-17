"use client";

import Link from "next/link";
import Eyebrow from "@/components/ui/Eyebrow";
import TimeDock from "./TimeDock";
import HomeStatusLine from "./HomeStatusLine";
import { useHomeState } from "./HomeEnvironment";
import { moonShadowShiftFor } from "@/lib/visual-state";
import { weatherGlyph, weatherLabel } from "@/lib/weather-state";

/**
 * HomeHero — 一个有状态、有天气、有星月的环境中的空间场景。
 *
 * 页面级环境层（sky / veil / haze）由 HomeEnvironment 提供；
 * 本组件只负责 hero 本地的天体（星/日/月/云/降水/暗角）与内容构图。
 *
 * 内容构图（本轮修正）：
 *   四层文字（eyebrow / H1 / 说明 / 状态行）作为**一个整体文案组**在首屏
 *   视觉区水平居中（父容器 flex-col + items-center + 每层 text-center）；
 *   乐器带仍占据面板下方的整宽布局（未改）。
 *
 * 文字层级纪律：只有 H1 是 display 级视觉重点；说明与状态行均为文本级。
 *
 * 天气读数（本轮修正）：
 *   右上"天气"不再是"可点选的假氛围"，也不再默认成太阳——它只显示
 *   HomeEnvironment 解析出的**标准化实时天气状态**（图标与文字同源）：
 *   地点 = 已选目的地 ?? 用户所在地；未知时显示通用 "Weather"。
 *
 * 指针/滚动变量由 HomeEnvironment 统一写入；本组件零高频 effect。
 */

// 确定性星点（伪随机但每次渲染一致，避免水合位移）
function StarField() {
  const stars = useMemoStars();
  return (
    <svg className="ut-stars" aria-hidden="true" viewBox="0 0 100 60" preserveAspectRatio="none">
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="#ffffff"
          className={i % 5 === 0 ? "ut-star-twinkle" : undefined}
        />
      ))}
    </svg>
  );
}

function useMemoStars() {
  // 简单 LCG 确定性散点
  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  return Array.from({ length: 42 }, () => ({
    x: Math.round(rand() * 1000) / 10,
    y: Math.round(rand() * 550) / 10,
    r: Math.round((0.12 + rand() * 0.22) * 100) / 100,
  }));
}

export default function HomeHero() {
  const { focus, condition, visual, cycleMoonPhase } = useHomeState();
  const { sun, moon } = visual.bodies;

  const placeLabel = focus?.label ?? null;
  const known = condition !== null;

  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col overflow-clip">
      {/* ── Z0.5 hero 本地天体（页面级天空之上） ────────────────── */}
      <div aria-hidden="true" className="absolute inset-0 z-0">
        <div className="ut-stars-layer">
          <StarField />
        </div>
        {/* 日/月锚定右半空间，与居中的文案组形成构图关系；小屏自动右移出文字带 */}
        <div
          suppressHydrationWarning
          className="ut-body ut-sun"
          style={{
            left: `${58 + sun.x * 30}%`,
            top: `${64 - sun.y * 48}%`,
            opacity: sun.opacity,
          }}
        />
        <button
          type="button"
          onClick={cycleMoonPhase}
          className="ut-body ut-moon cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70"
          style={{
            left: `${58 + moon.x * 30}%`,
            top: `${64 - moon.y * 48}%`,
            opacity: moon.opacity * visual.moon.opacityMul,
            width: `${Math.round(44 * visual.moon.sizeMul)}px`,
            height: `${Math.round(44 * visual.moon.sizeMul)}px`,
            "--ut-moon-shift": moonShadowShiftFor(visual.moon.phase),
            filter: `blur(0.5px) drop-shadow(0 0 ${Math.round(16 * visual.moon.glowMul)}px rgba(235, 238, 250, ${(0.55 * visual.moon.glowMul).toFixed(2)}))`,
          } as React.CSSProperties}
          title={`Moon: ${visual.moon.label} — click to cycle`}
          aria-label={`Moon phase: ${visual.moon.label}. Click to cycle phases.`}
        />
        <div className="ut-cloud ut-cloud-a" />
        <div className="ut-cloud ut-cloud-b" />

        {/* 降水暗示层（雨/雪） */}
        {visual.precip !== "none" && (
          <div className={`ut-precip ut-precip-${visual.precip}`} />
        )}

        {/* hero 本地暗角 */}
        <div className="ut-sky-vignette" />
      </div>

      {/* ── Z2 内容：居中的文案组 + 整宽乐器带 ───────────────────── */}
      <div className="relative z-10 mx-auto flex w-full max-w-[var(--ut-container-max)] flex-1 flex-col items-center justify-center px-4 pb-10 pt-24 text-center md:px-6 md:pt-20">
        <Eyebrow dot className="ut-hero-eyebrow">
          Interactive travel discovery
        </Eyebrow>

        {/* L1：核心探索文案 */}
        <h1 className="ut-hero-h1 mx-auto mt-6 font-display" style={{ color: "var(--ut-hero-accent)" }}>
          Where do you want to{" "}
          <em className="italic">disappear</em> to?
        </h1>

        {/* L2：这一片区域是做什么的（一句，解释"怎么用"，不抢 H1） */}
        <p
          className="mx-auto mt-6 max-w-[46ch] text-balance text-body-lg leading-snug"
          style={{ color: "var(--ut-hero-soft)" }}
        >
          Set a month, a mood and a budget — the atlas answers with places that
          fit, right now.
        </p>

        {/* L3：只由当前选择派生的状态行 */}
        <div className="mt-4">
          <HomeStatusLine />
        </div>
      </div>

      {/* 乐器带：外层为环境的连续下沉，内层为独立乐器面板（文字永不赌天空颜色） */}
      <div className="ut-instrument relative z-10">
        <div className="mx-auto w-full max-w-[var(--ut-container-max)] px-4 py-5 md:px-6">
          <div className="ut-inst-panel rounded-ut-lg">
            <div className="flex flex-col gap-6 px-5 py-5 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
              <TimeDock />

              {/*
                天气读数（不可点击的实况显示）：
                · 地点名（Local time 同源）：已选目的地 ?? 用户所在地 ?? 不显示
                · 图标与文字来自同一个标准化 weather state（condition）
                · 未知 → "Weather" + 中性 glyph，绝不显示太阳
              */}
              <div role="status" aria-live="polite" className="md:pb-0.5">
                <span className="ut-inst-label">
                  {placeLabel ? `Weather · ${placeLabel}` : "Weather"}
                </span>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                  <span
                    className="ut-wx-btn"
                    data-ut-weather-state={condition?.id ?? "unknown"}
                    data-active={known ? "true" : "false"}
                    title={known ? weatherLabel(condition) : "Weather unavailable for this location"}
                  >
                    <span className="ut-wx-glyph" aria-hidden="true">{weatherGlyph(condition)}</span>
                    {weatherLabel(condition)}
                    <span className="ut-wx-underline" aria-hidden="true" />
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 md:pb-0.5">
                <Link
                  href="#discover"
                  className="inline-flex min-h-[44px] items-center rounded-ut-sm bg-ut-accent px-5 py-2.5 text-body-sm font-medium text-ut-on-accent transition-[background-color,transform] duration-[var(--ut-dur-fast)] ease-ut-out hover:-translate-y-px hover:bg-ut-accent-strong focus-visible:outline-2 focus-visible:outline-ut-accent"
                >
                  Start exploring
                </Link>
                <Link
                  href="#ready"
                  className="inline-flex min-h-[44px] items-center rounded-ut-sm border border-ut-border-strong px-5 py-2.5 text-body-sm font-medium text-ut-text transition-[border-color,color,transform] duration-[var(--ut-dur-fast)] ease-ut-out hover:-translate-y-px hover:border-ut-accent-line hover:text-ut-accent focus-visible:outline-2 focus-visible:outline-ut-accent"
                >
                  I already know where
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部融合带：hero 沉入内容世界（envDeep），任何状态无硬切 */}
      <div aria-hidden="true" className="ut-hero-blend" />

      <p className="sr-only" aria-live="off">
        {placeLabel
          ? `Readings for ${placeLabel}${focus?.kind === "user" ? " (your location)" : ""}: ${Math.floor(visual.hour)}:${String(Math.round((visual.hour % 1) * 60)).padStart(2, "0")} local,`
          : `Readings for your local time:`}{" "}
        {weatherLabel(condition)}, {visual.season}, {visual.moon.label}
      </p>
    </section>
  );
}

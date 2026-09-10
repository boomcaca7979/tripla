"use client";

import Link from "next/link";
import Eyebrow from "@/components/ui/Eyebrow";
import TimeDock from "./TimeDock";
import TimeGreeting from "./TimeGreeting";
import { useHomeState } from "./HomeEnvironment";
import { moonShadowShiftFor, type WeatherId } from "@/lib/visual-state";

/**
 * HomeHero — 一个有状态、有天气、有星月的环境中的空间场景。
 *
 * 页面级环境层（sky / veil / haze）由 HomeEnvironment 提供；
 * 本组件只负责 hero 本地的天体（星/日/月/云/降水/暗角）与内容构图：
 *
 *   eyebrow → display 级 H1（空间锚点）
 *   → 状态感知文案（ambient line）+ greeting
 *   → 底部 instrument zone（TimeDock + 静默天气控件 + 低重量 CTA）
 *   → 底部融合带（envDeep，消灭硬切）
 *
 * 指针/滚动变量由 HomeEnvironment 统一写入；本组件零高频 effect。
 */

const WEATHER_OPTIONS: { id: WeatherId; label: string; glyph: string }[] = [
  { id: "clear", label: "Clear", glyph: "○" },
  { id: "cloudy", label: "Cloudy", glyph: "◌" },
  { id: "rain", label: "Rain", glyph: "╱" },
  { id: "snow", label: "Snow", glyph: "∗" },
  { id: "storm", label: "Storm", glyph: "⚡" },
];

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
  const { destination, visual, weather, setWeather, moonPhase, cycleMoonPhase } = useHomeState();
  const { sun, moon } = visual.bodies;

  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col overflow-clip">
      {/* ── Z0.5 hero 本地天体（页面级天空之上） ────────────────── */}
      <div aria-hidden="true" className="absolute inset-0 z-0">
        <div className="ut-stars-layer">
          <StarField />
        </div>
        {/* 日/月锚定右半空间，与左侧 display 排版形成构图关系；小屏自动右移出文字带 */}
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

      {/* ── Z2 内容：文字区 + 乐器带 ─────────────────────────────── */}
      <div className="relative z-10 mx-auto flex w-full max-w-[var(--ut-container-max)] flex-1 flex-col justify-center px-4 pb-10 pt-24 md:px-6 md:pt-20">
        <Eyebrow dot className="ut-hero-eyebrow">
          Interactive travel discovery
        </Eyebrow>

        <h1 className="ut-hero-h1 mt-6 font-display" style={{ color: "var(--ut-hero-accent)" }}>
          Where do you want to{" "}
          <em className="italic">disappear</em> to?
        </h1>

        <p suppressHydrationWarning className="ut-hero-ambient mt-6 max-w-[46ch] font-display italic" style={{ color: "var(--ut-hero-soft)" }}>
          {visual.ambientLine}
        </p>

        <div className="mt-5">
          <TimeGreeting />
        </div>
      </div>

      {/* 乐器带：外层为环境的连续下沉，内层为独立乐器面板（文字永不赌天空颜色） */}
      <div className="ut-instrument relative z-10">
        <div className="mx-auto w-full max-w-[var(--ut-container-max)] px-4 py-5 md:px-6">
          <div className="ut-inst-panel rounded-ut-lg">
            <div className="flex flex-col gap-6 px-5 py-5 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
              <TimeDock />

              <div role="group" aria-label="Weather atmosphere" className="md:pb-0.5">
                <span className="ut-inst-label">Weather · {destination.label}</span>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                  {WEATHER_OPTIONS.map((w) => {
                    const active = w.id === weather;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setWeather(w.id)}
                        aria-pressed={active}
                        title={w.label}
                        className="ut-wx-btn focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ut-accent"
                      >
                        <span className="ut-wx-glyph" aria-hidden="true">{w.glyph}</span>
                        {w.label}
                        <span className="ut-wx-underline" aria-hidden="true" />
                      </button>
                    );
                  })}
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
        Now in {destination.label}: {Math.floor(visual.hour)}:{String(Math.round((visual.hour % 1) * 60)).padStart(2, "0")} local, {visual.weather}, {visual.season}, {visual.moon.label}
      </p>
    </section>
  );
}

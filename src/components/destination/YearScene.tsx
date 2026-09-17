"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Eyebrow from "@/components/ui/Eyebrow";
import { SEASON_TINT, type MonthRow } from "@/components/besttime/besttime-labels";
import { formatHour, monthRainDrops } from "@/lib/inner-state";

/**
 * YearScene — Destination 3.0 SCENE 3 "THE YEAR"（TIME AS PLACE STATE）。
 *
 * 暗色沉浸时间场：拖动月份（连续 scrub）→ 整个场景跟着变：
 *   ① 巨型月份（display 级，白）
 *   ② 雨——雨滴密度 = canonical 当月 precipMm（真实数据投影；January 小雨、
 *      September 大雨肉眼可见）
 *   ③ 场景 tint = 季节色 × tier 深度（Favourable 亮 / Challenging 沉）
 *   ④ 轨迹选中列 + 读数（temp/rain/rain days/daylight）
 * 全部确定性派生自 canonical，无随机。
 *
 * 手势：轨迹带 pointer capture 连续 scrub（桌面+移动），键盘 ←→/Home/End。
 */

export default function YearScene({
  city,
  rows,
  initialMonth,
  goStatement,
  guideHref,
}: {
  city: string;
  rows: MonthRow[];
  initialMonth: number;
  goStatement: string;
  guideHref: string;
}) {
  const [monthIndex, setMonthIndex] = useState(initialMonth);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);

  // 拖拽中 window 级收尾（丢 up 兜底）
  useEffect(() => {
    if (!dragging) return;
    const end = () => setDragging(false);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [dragging]);

  const row = rows.find((r) => r.index === monthIndex) ?? rows[0];
  const seasonTint = SEASON_TINT[row?.season ?? "winter"];
  const tierAlpha = row?.derived === "best" ? 0.16 : row?.derived === "avoid" ? 0.3 : 0.22;
  const dropCount = monthRainDrops(row?.precipMm ?? 0);

  const scrubTo = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const idx = Math.max(0, Math.min(rows.length - 1, Math.floor(((clientX - rect.left) / rect.width) * rows.length)));
    const r = rows[idx];
    if (r && r.index !== monthIndex) setMonthIndex(r.index);
  };
  const onTrackDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    setDragging(true);
    scrubTo(e.clientX);
  };
  const onTrackMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragging) scrubTo(e.clientX);
  };
  const onTrackUp = () => setDragging(false);

  return (
    <section aria-labelledby="when-heading" className="relative mt-16 overflow-hidden md:mt-24">
      {/* 暗色时间场 */}
      <div className="absolute inset-0 bg-ut-surface" />
      {/* 季节 × tier 氛围（确定性派生） */}
      <div
        aria-hidden="true"
        className="absolute inset-0 transition-colors duration-700 ease-ut-out motion-reduce:transition-none"
        style={{
          background: `radial-gradient(ellipse 90% 70% at ${((monthIndex + 0.5) / 12) * 100}% 0%, rgba(${seasonTint}, ${tierAlpha}) 0%, transparent 70%)`,
        }}
      />
      {/* 雨层：密度 = canonical precipMm */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {Array.from({ length: dropCount }, (_, i) => (
          <span
            key={i}
            className="ut-rain-drop"
            style={{
              left: `${(i * 37 + 11) % 100}%`,
              height: `${14 + (i % 4) * 9}px`,
              animationDuration: `${0.9 + (i % 5) * 0.14}s`,
              animationDelay: `${(i % 9) * 0.3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 md:px-6 md:py-28">
        <Eyebrow className="mb-3">When to go</Eyebrow>
        <h2
          id="when-heading"
          className="font-display text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.05] text-ut-ink"
        >
          {goStatement}
          <span className="ml-3 font-mono text-micro uppercase tracking-[0.16em] text-ut-muted">
            drag the year — {city} changes
          </span>
        </h2>

        {/* 巨型月份 + 读数（TIME AS PLACE STATE） */}
        <div aria-live="polite" className="mt-10 grid gap-x-12 gap-y-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="font-display text-[clamp(3rem,7vw,5.5rem)] leading-none text-ut-ink">
              {row?.name ?? "—"}
            </p>
            <p className="mt-4 font-mono text-label uppercase tracking-[0.18em] text-ut-text-2">
              {row?.seasonName} ·{" "}
              {row?.inWindow ? "In recommended window" : "Outside window"}
            </p>
            <p
              className={[
                "mt-3 font-mono text-body-sm uppercase tracking-[0.18em]",
                row?.derived === "avoid"
                  ? "text-ut-verdict-challenging"
                  : row?.derived === "best"
                    ? "text-ut-verdict-good"
                    : "text-ut-verdict-workable",
              ].join(" ")}
            >
              {row?.derived === "avoid"
                ? "Challenging"
                : row?.derived === "best"
                  ? "Favourable"
                  : "Workable"}{" "}
              (R-tier)
            </p>
            <p className="mt-5 font-mono text-body-lg tabular-nums text-ut-ink">
              {row ? `${row.tempHighC.toFixed(1)}° / ${row.tempLowC.toFixed(1)}°C` : "—"}
            </p>
            <p className="mt-1 font-mono text-label tabular-nums text-ut-muted">
              {row ? `${row.precipMm.toFixed(0)} mm rain · ${row.precipDaysGe1mm.toFixed(0)} rain days · ${row.daylightHours.toFixed(1)} h daylight` : "—"}
            </p>
          </div>

          {/* 时间轨迹 = scrub 表面（12 月，暗色仪器带） */}
          <div className="lg:col-span-7">
            <div
              ref={trackRef}
              role="slider"
              tabIndex={0}
              aria-label={`Scrub the year of ${city} — 12 months`}
              aria-valuemin={1}
              aria-valuemax={12}
              aria-valuenow={monthIndex + 1}
              aria-valuetext={row?.name}
              onPointerDown={onTrackDown}
              onPointerMove={onTrackMove}
              onPointerUp={onTrackUp}
              onPointerCancel={onTrackUp}
              onKeyDown={(e) => {
                const map: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1 };
                if (e.key === "Home") { e.preventDefault(); setMonthIndex(0); }
                else if (e.key === "End") { e.preventDefault(); setMonthIndex(rows.length - 1); }
                else if (map[e.key]) {
                  e.preventDefault();
                  setMonthIndex((m) => Math.max(0, Math.min(rows.length - 1, m + map[e.key])));
                }
              }}
              className="relative flex min-h-[44px] cursor-ew-resize items-end gap-1 sm:gap-2"
            >
              {rows.map((r) => {
                const active = r.index === monthIndex;
                const tMax = 36;
                const tMin = -12;
                const h = Math.max(
                  6,
                  Math.min(100, ((r.tempMeanC - tMin) / (tMax - tMin)) * 100),
                );
                return (
                  <div
                    key={r.index}
                    aria-hidden="true"
                    className={[
                      "relative flex-1 rounded-ut-sm transition-colors duration-300 motion-reduce:transition-none",
                      active ? "bg-ut-accent/10" : "bg-transparent",
                    ].join(" ")}
                    style={{ height: 120 }}
                  >
                    {/* 温度柱（canonical tempMeanC） */}
                    <div
                      className={[
                        "absolute inset-x-1 rounded-ut-sm transition-colors duration-300 motion-reduce:transition-none",
                        active ? "bg-ut-accent" : r.derived === "avoid" ? "bg-ut-verdict-challenging/70" : "bg-ut-border-strong",
                      ].join(" ")}
                      style={{ bottom: 18, height: `${h}%` }}
                    />
                    {/* verdict strip */}
                    <div
                      className={[
                        "absolute inset-x-0 top-2 h-1.5 rounded-ut-sm",
                        r.derived === "avoid"
                          ? "bg-ut-verdict-challenging"
                          : r.derived === "best"
                            ? "bg-ut-verdict-good"
                            : "bg-ut-verdict-workable",
                      ].join(" ")}
                    />
                    {/* 月份缩写 */}
                    <span
                      className={[
                        "absolute inset-x-0 bottom-0 text-center font-mono text-[0.5625rem] uppercase tracking-wide transition-colors duration-300",
                        active ? "text-ut-ink" : "text-ut-muted",
                      ].join(" ")}
                    >
                      {r.short}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 font-mono text-micro uppercase tracking-[0.16em] text-ut-muted">
              ● verdict (R1–R7) · bars = mean temperature · drag anywhere on the track
            </p>
            <p suppressHydrationWarning className="mt-2 font-mono text-micro tabular-nums text-ut-subtle">
              NOW {formatHour(new Date().getHours())} · VIEWING {row?.name.toUpperCase()}
            </p>
          </div>
        </div>

        <a
          href={guideHref}
          className="mt-10 inline-flex min-h-[44px] items-center font-mono text-label uppercase tracking-[0.16em] text-ut-accent underline decoration-ut-accent/40 underline-offset-4 transition-colors duration-[var(--ut-dur-fast)] hover:text-ut-accent-strong motion-reduce:transition-none"
        >
          Full monthly guide →
        </a>
      </div>
    </section>
  );
}

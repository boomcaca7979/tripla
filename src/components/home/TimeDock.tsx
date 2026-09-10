"use client";

import { useCallback, useRef, useState } from "react";
import { useHomeState } from "./HomeEnvironment";
import { timeLabel } from "@/lib/visual-state";

/**
 * TimeDock — 目的地当地时间滑条（quiet instrument）。
 * LIVE = 目的地真实当地时间（Intl 计算）；拖动 = PREVIEW 世界状态；
 * Reset 回 LIVE。驱动 sky/accent/H1/greeting/haze 全站。
 */
export default function TimeDock() {
  const { destination, hour, hourOverride, setHourOverride } = useHomeState();
  const [dragging, setDragging] = useState(false);
  const draggingRef = useRef(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const pct = (hour / 24) * 100;
  const manual = hourOverride !== null;

  const posToHour = useCallback((clientX: number): number => {
    const el = trackRef.current;
    if (!el) return hour;
    const r = el.getBoundingClientRect();
    if (r.width === 0) return hour;
    return Math.min(23.983, Math.max(0, ((clientX - r.left) / r.width) * 24));
  }, [hour]);

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    setDragging(true);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* noop */ }
    setHourOverride(posToHour(e.clientX));
  };
  const onPointerMove = (e: React.PointerEvent) => {
    // 用 ref 判定拖动态，规避 state 异步更新导致的快速拖动丢帧
    if (!draggingRef.current) return;
    setHourOverride(posToHour(e.clientX));
  };
  const endDrag = () => {
    draggingRef.current = false;
    setDragging(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const cur = hourOverride ?? hour;
    let next: number | null = null;
    switch (e.key) {
      case "ArrowRight": case "ArrowUp": next = Math.min(23.983, (Math.floor(cur) + 1) % 24); break;
      case "ArrowLeft": case "ArrowDown": next = Math.max(0, (Math.ceil(cur) - 1 + 24) % 24); break;
      case "Home": next = 0; break;
      case "End": next = 23.983; break;
      default: return;
    }
    e.preventDefault();
    setHourOverride(next);
  };

  return (
    <div className="w-full max-w-sm md:min-w-[300px]">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="ut-inst-label">
          Local time · {destination.label}
        </span>
        <span className="flex items-center gap-1.5 font-mono text-micro">
          {manual ? (
              <>
                <button
                  type="button"
                  onClick={() => setHourOverride(null)}
                  className="rounded-ut-sm text-ut-text-2 underline-offset-2 transition-colors duration-[var(--ut-dur-fast)] hover:text-ut-text hover:underline focus-visible:outline-2 focus-visible:outline-ut-accent"
                >
                  Reset to live
                </button>
                <span aria-hidden="true" className="text-ut-subtle">·</span>
                <span className="uppercase tracking-wider text-ut-text-2">Preview</span>
              </>
            ) : (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 ut-chip-pulse" aria-hidden="true" />
                <span className="uppercase tracking-wider text-emerald-200">Live</span>
              </>
            )}
        </span>
      </div>

      <div
        ref={trackRef}
        suppressHydrationWarning
        role="slider"
        tabIndex={0}
        aria-label={`Time of day in ${destination.label} — preview the world at a different hour`}
        aria-valuemin={0}
        aria-valuemax={24}
        aria-valuenow={Math.round(hour * 10) / 10}
        aria-valuetext={`${timeLabel(hour)} in ${destination.label}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        className="ut-time-track group relative h-1 cursor-pointer rounded-ut-pill opacity-90 transition-[height] duration-[var(--ut-dur-fast)] ease-ut-out hover:h-2 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ut-accent"
      >
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-200 ease-out"
          style={{ left: `${pct}%`, transitionProperty: dragging ? "none" : undefined }}
        >
          <div
            className={[
              "rounded-full border border-white/70 bg-white/95",
              "transition-[width,height] duration-200",
              dragging ? "h-4 w-4" : "h-2.5 w-2.5",
            ].join(" ")}
            style={{
              boxShadow: `0 1px 6px rgba(0,0,0,.4)`,
            }}
          />
        </div>
      </div>

      <p suppressHydrationWarning aria-live="polite" className="mt-1.5 font-mono text-micro text-ut-text-2">
        {manual ? "Preview · " : ""}{timeLabel(hour)} · {destination.label}
      </p>
    </div>
  );
}

"use client";

import { useHomeState } from "./HomeEnvironment";
import { greetingFor, timeLabel } from "@/lib/visual-state";

/**
 * TimeGreeting — 目的地当地时间的活状态行。
 * "Good evening. · 18:42 in Tokyo · Autumn"；
 * 拖动 TimeDock 进入 PREVIEW 时同步变化。SSR 输出目的地真实当地状态。
 */
export default function TimeGreeting() {
  const { destination, hour, hourOverride, season } = useHomeState();
  const live = hourOverride === null;
  const seasonLabel =
    season === "spring" ? "Spring" : season === "summer" ? "Summer" : season === "autumn" ? "Autumn" : "Winter";

  return (
    <p suppressHydrationWarning className="font-mono text-label tracking-wide" style={{ color: "var(--ut-hero-soft)" }}>
      {greetingFor(hour)}{" "}
      <span aria-hidden="true" className="ut-hero-soft">·</span>{" "}
      {timeLabel(hour)} in {destination.label}{" "}
      <span aria-hidden="true" className="ut-hero-soft">·</span>{" "}
      {seasonLabel}
      {live ? "" : " · Preview"}
    </p>
  );
}

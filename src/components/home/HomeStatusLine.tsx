"use client";

import { useMemo } from "react";
import { useHomeState } from "./HomeEnvironment";
import { timeLabel } from "@/lib/visual-state";
import {
  buildStatusLine,
  filterPlaces,
  readoutForSet,
} from "@/lib/home-discovery";

/**
 * HomeStatusLine — 首屏第三层文字（唯一的状态行）。
 *
 * 只由**用户当前的选择**派生，不再是与操作无关的时间氛围句：
 *   未选城市 / 未筛选      → "September · Mild weather · Shoulder season"
 *   选了月份 / mood / 预算  → "September · Mild weather · Peak season · Food first · Mid-range"
 *   选了城市              → "Kyoto · 06:20 AM local · September · Mild weather · Peak season"
 *
 * 天气气质与季节信号来自当前筛选集合的 canonical 月值众数（lib/home-discovery.ts），
 * 不生成任何新事实；未筛选月份时不推断单地气候，只报集合读数。
 */
export default function HomeStatusLine() {
  const {
    destination, hour, hourOverride, month, currentMonth, mood, budget, places,
  } = useHomeState();

  // 与发现层使用完全相同的筛选谓词 → 状态行与结果永远一致。
  const filters = useMemo(() => ({ mood, month, budget }), [mood, month, budget]);
  const matched = useMemo(() => filterPlaces(places, filters), [places, filters]);
  // 读数按"有效月份"计算：用户选了月份就用它，否则用当前月（行内已标出月份名，
  // 不构成筛选条件）。集合为空时回退到全量，避免首屏出现空读数。
  const readout = useMemo(
    () => readoutForSet(matched.length > 0 ? matched : places, month ?? currentMonth),
    [matched, places, month, currentMonth],
  );

  const line = buildStatusLine({
    city: destination?.label ?? null,
    localTime: destination ? timeLabel(hour) : null,
    month,
    fallbackMonth: currentMonth,
    readout,
    mood,
    budget,
    matchCount: matched.length,
  });

  return (
    <p
      suppressHydrationWarning
      aria-live="polite"
      className="font-mono text-label tracking-wide"
      style={{ color: "var(--ut-hero-soft)" }}
    >
      {line}
      {hourOverride === null ? "" : " · Preview"}
    </p>
  );
}

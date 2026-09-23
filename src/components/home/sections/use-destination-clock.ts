"use client";

import { useEffect, useState } from "react";
import { localTimeLabel } from "@/components/destination/place-state";

/**
 * useDestinationClock — 目的地当地时刻读数（首页四段共用）。
 *
 * 时间真值来源 = place-state 的 localTimeLabel（Intl + IANA timeZone），
 * 与 Destination 详情页 PlaceWorld 使用同一实现，不新建第二套时间系统。
 *
 * 首帧纪律（与 hero 相同的确定性策略）：
 *   · SSR 与客户端首次 render 一律返回 null（调用方显示占位 "--:--"）——
 *     两侧输出完全一致，无 #418 hydration 风险，也不预置一个假时刻。
 *   · 真实时刻在 hydration 之后的定时器里写入；每 30s 与页面同一拍。
 *   · effect 体内不做同步 setState（react-hooks/set-state-in-effect 为 error 级）。
 */
export function useDestinationClock(timeZone: string | null): string | null {
  const [clock, setClock] = useState<{ tz: string; label: string } | null>(null);

  useEffect(() => {
    if (!timeZone) return;
    let cancelled = false;
    const tick = () => {
      if (!cancelled) setClock({ tz: timeZone, label: localTimeLabel(timeZone, new Date()) });
    };
    const t0 = setTimeout(tick, 0);
    const id = setInterval(tick, 30_000);
    return () => {
      cancelled = true;
      clearTimeout(t0);
      clearInterval(id);
    };
  }, [timeZone]);

  // 只认当前时区的读数：切城市时不显示上一个城市的时刻
  return clock && timeZone && clock.tz === timeZone ? clock.label : null;
}

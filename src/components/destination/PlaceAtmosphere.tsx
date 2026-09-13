"use client";

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import {
  accentFor,
  deriveWeatherFor,
  destinationLocalHour,
  seasonFromDate,
  type Season,
  type WeatherId,
} from "@/lib/visual-state";

/**
 * PlaceAtmosphere — Destination 的“Contained Atmospheric Place Band”状态层。
 *
 * CONTRACT：
 *   §9  Environment Depth = 2。它只写入**氛围层**变量，不产生天空 / 月亮 /
 *       Mood / envDeep —— 用户应感到“我到了这里”，而不是“我进入了 Home”。
 *   §10 状态只改变外观与含义（大气色、天气处理），绝不改变结构、顺序或内容可见性。
 *   §23 / §40 CTA 与 UI accent 恒为品牌 terracotta，因此本组件**绝不写
 *       --ut-accent**。季节/时段/天气只影响 --ut-place-* 这一族私有变量。
 *   §40 首帧确定性：SSR 与客户端首次 render 均“未同步” → 不写入任何变量，
 *       与静态 HTML 完全一致；真实状态在 hydration 后的 effect 中写入。
 *
 * 变量（供 server 渲染的 band 直接以 var() 消费，无需任何 re-render）：
 *   --ut-place-accent / --ut-place-accent-rgb / --ut-place-glow
 */

const TINT_VARS: CSSProperties = {};

export default function PlaceAtmosphere({
  destinationId,
  timeZone,
  children,
}: {
  destinationId: string;
  timeZone: string;
  children: ReactNode;
}) {
  const [state, setState] = useState<{
    hour: number;
    season: Season;
    weather: WeatherId;
  } | null>(null);

  useEffect(() => {
    const sync = () => {
      const now = new Date();
      const season = seasonFromDate(now);
      setState({
        hour: destinationLocalHour(timeZone, now),
        season,
        weather: deriveWeatherFor(destinationId, now, season),
      });
    };
    // 异步初始化，避免 effect 内同步 setState 造成级联渲染。
    const t0 = setTimeout(sync, 0);
    const id = setInterval(sync, 60_000);
    return () => {
      clearTimeout(t0);
      clearInterval(id);
    };
  }, [destinationId, timeZone]);

  const vars = useMemo<CSSProperties>(() => {
    if (!state) return TINT_VARS;
    const acc = accentFor(state.hour, state.season, "all", state.weather);
    return {
      "--ut-place-accent": acc.accent,
      "--ut-place-accent-rgb": acc.accentRgb,
      "--ut-place-glow": String(acc.glowAlpha),
    } as CSSProperties;
  }, [state]);

  return (
    <div
      style={vars}
      data-ut-place-season={state?.season}
      data-ut-place-weather={state?.weather}
    >
      {children}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import PlaceReadout from "./PlaceReadout";
import { SEASON_LABEL, WEATHER_LABEL, localTimeLabel } from "./place-state";
import {
  deriveWeatherFor,
  seasonFromDate,
  type Season,
  type WeatherId,
} from "@/lib/visual-state";

/**
 * LocalStateReadout — 目的地当地状态的三格仪器读数（Local time / Season / Weather）。
 *
 * CONTRACT §11 / §40：
 *   必须显示**目的地当地时间**（基于 destination timezone），不是访客设备时间。
 *   SSR 与客户端首次 render 一律输出占位符 "—"（两侧完全相同 → 无 #418）；
 *   真实值只在 hydration 后的 effect 内写入，并每 60s 同步一次。
 *   值域用 tabular-nums 固定字宽，替换时不产生 layout shift。
 *
 * 天气复用项目既有的 deterministic weather（deriveWeatherFor）——
 * 不引入 API、不增加网络依赖、不新建 client system。
 */

const PENDING = "—";

export default function LocalStateReadout({
  destinationId,
  timeZone,
}: {
  destinationId: string;
  timeZone: string;
}) {
  const [snapshot, setSnapshot] = useState<{
    time: string;
    season: Season;
    weather: WeatherId;
  } | null>(null);

  useEffect(() => {
    const sync = () => {
      const now = new Date();
      const season = seasonFromDate(now);
      setSnapshot({
        time: localTimeLabel(timeZone, now),
        season,
        weather: deriveWeatherFor(destinationId, now, season),
      });
    };
    const t0 = setTimeout(sync, 0);
    const id = setInterval(sync, 60_000);
    return () => {
      clearTimeout(t0);
      clearInterval(id);
    };
  }, [destinationId, timeZone]);

  return (
    <>
      <PlaceReadout
        label="Local time"
        value={snapshot ? snapshot.time : PENDING}
      />
      <PlaceReadout
        label="Season"
        value={snapshot ? SEASON_LABEL[snapshot.season] : PENDING}
      />
      <PlaceReadout
        label="Weather"
        value={snapshot ? WEATHER_LABEL[snapshot.weather] : PENDING}
      />
    </>
  );
}

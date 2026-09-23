"use client";

import { useMemo, useState } from "react";
import Eyebrow from "@/components/ui/Eyebrow";
import RegionMiniMap, { type MapPoint } from "@/components/destination/RegionMiniMap";
import { useHomeState } from "../HomeEnvironment";
import { PhotoLayer, QuietLink, ReadoutRow } from "./parts";
import { useDestinationClock } from "./use-destination-clock";
import {
  NEIGHBOUR_MAX,
  NEIGHBOUR_RADIUS_KM,
  UNDERSTAND_SLUG,
  type Postcard,
} from "@/lib/home-sections";
import {
  SEASON_SIGNAL_BASIS,
  budgetLabel,
  monthName,
  monthOf,
  seasonSignalFor,
  weatherPhraseFor,
} from "@/lib/home-discovery";
import {
  haversineKm,
  hemisphereForLatitude,
  nearbyDestinations,
  projectRegionPoints,
  seasonForLatitudeMonth,
  vibesForInterests,
} from "@/lib/inner-state";
import { SEASON_LABEL } from "@/components/destination/place-state";
import { weatherGlyph, weatherLabel } from "@/lib/weather-state";

/**
 * UnderstandStage — 首页第 2 段：**Understand a place before you go.**
 *
 * 与第 1 段（照片主导）刻意相反：这一段由**数据主导**。展示的全部是 Tripla 已经
 * 存在的能力，一项虚构都没有：
 *   · 天气   —— 已选目的地被锚定时用共享状态里的**实时**天气（/api/weather 同源），
 *                未锚定时退回到该月 canonical 气候法线的派生词（并标明依据）。
 *   · 季节   —— 由真实机场纬度推出的半球感知季节（seasonForLatitudeMonth）。
 *   · 降雨   —— canonical 月降水（mm + 雨日），不是编造的百分比。
 *   · 当地时间 —— place-state 的 localTimeLabel（与 Destination 详情页同一实现）。
 *   · 小地图 —— 复用 src/components/destination/RegionMiniMap.tsx（纯 hairline 经纬网 +
 *                真实坐标点，无地图服务、无 key、无 tile）。
 *
 * 构图：桌面端照片在右、数据在左（与第 1 段镜像）；移动端照片在前、数据在后。
 */

export default function UnderstandStage({ hero }: { hero: Postcard | null }) {
  const { places, currentMonth, focus, condition } = useHomeState();
  const [mapSlug, setMapSlug] = useState<string>(UNDERSTAND_SLUG);

  const active = useMemo(
    () => places.find((p) => p.slug === UNDERSTAND_SLUG) ?? null,
    [places],
  );

  const month = active ? monthOf(active, currentMonth) : null;
  const season = active
    ? seasonForLatitudeMonth(currentMonth, hemisphereForLatitude(active.latitude))
    : null;
  const clock = useDestinationClock(active?.timezone ?? null);

  /** 实时天气只在"当前读数锚定到这座城市"时可用（HomeEnvironment 的共享状态）。 */
  const liveWeather = active && focus?.id === active.slug ? condition : null;
  const monthWeather = month ? weatherPhraseFor(month) : null;
  const monthSignal = month ? seasonSignalFor(month) : null;

  /**
   * 邻近小地图：真实大圆距离 ≤ NEIGHBOUR_RADIUS_KM 的目的地 + 自身，
   * 经 inner-state 的等距圆柱投影得到确定性的平面坐标（无地图服务）。
   */
  const map = useMemo(() => {
    if (!active) return null;
    const target = {
      slug: active.slug,
      city: active.city,
      country: active.country,
      airport: { latitude: active.latitude, longitude: active.longitude },
    };
    const within = places
      .filter(
        (p) =>
          p.slug !== active.slug &&
          haversineKm(active.latitude, active.longitude, p.latitude, p.longitude) <=
            NEIGHBOUR_RADIUS_KM,
      )
      .map((p) => ({
        slug: p.slug,
        city: p.city,
        country: p.country,
        airport: { latitude: p.latitude, longitude: p.longitude },
      }));

    const inputs = [target, ...nearbyDestinations(target, within, NEIGHBOUR_MAX)];
    const projected = projectRegionPoints(inputs);
    if (projected.points.length === 0) return null;

    const bySlug = new Map(places.map((p) => [p.slug, p]));
    const points: MapPoint[] = projected.points.map((pp) => ({
      slug: pp.slug,
      city: pp.city,
      country: pp.country,
      latitude: pp.latitude,
      longitude: pp.longitude,
      x: pp.x,
      y: pp.y,
      isSelf: pp.slug === active.slug,
      vibes: vibesForInterests(bySlug.get(pp.slug)?.interests ?? []),
    }));
    return { points };
  }, [active, places]);

  return (
    <section id="understand" className="scroll-mt-20">
      <div className="mx-auto max-w-[var(--ut-container-max)] px-4 pb-16 md:px-6 md:pb-24">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          {/* ── 照片列（桌面在右，与第 1 段镜像） ─────────────────────── */}
          <div className="relative flex min-h-[54svh] overflow-hidden rounded-ut-lg lg:order-2 lg:col-span-5 lg:min-h-[72svh]">
            {hero && (
              <PhotoLayer
                card={hero}
                sizes="(max-width: 1024px) 100vw, 40vw"
                creditClassName="top-3 right-3"
              />
            )}

            <div className="relative flex w-full flex-col justify-between gap-8 p-5 md:p-7">
              <div>
                <Eyebrow dot className="ut-t-micro-photo">
                  02 · Understand
                </Eyebrow>
                <h2 className="ut-t-section mt-3 max-w-[14ch] text-white">
                  Understand a place before you go.
                </h2>
              </div>

              {/* 叠加在照片上的 Destination information UI（读数全部真实） */}
              {active && (
                <div className="ut-inst-panel max-w-[22rem] rounded-ut-md p-4">
                  <p className="ut-t-panel text-ut-ink">{active.city}</p>
                  <p className="ut-t-micro mt-2 text-ut-subtle">
                    {active.country} · {monthName(currentMonth)}
                  </p>
                  <div className="ut-t-data mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-ut-ink">
                    <span>
                      {month
                        ? `${Math.round(month.tempHighC)}° / ${Math.round(month.tempLowC)}°C`
                        : "—"}
                    </span>
                    <span className="text-ut-muted">{season ? SEASON_LABEL[season] : "—"}</span>
                    <span className="text-ut-muted">{clock ?? "--:--"} local</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── 数据列（桌面在左） ─────────────────────────────────── */}
          <div className="lg:order-1 lg:col-span-7">
            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <Eyebrow className="ut-t-micro">Destination information</Eyebrow>
                <div className="mt-3">
                  <ReadoutRow
                    label="Weather"
                    value={
                      liveWeather
                        ? `${weatherGlyph(liveWeather)} ${weatherLabel(liveWeather)}`
                        : (monthWeather ?? "—")
                    }
                    hint={
                      liveWeather
                        ? "Live now"
                        : `${monthName(currentMonth)} normal · NASA POWER`
                    }
                  />
                  <ReadoutRow
                    label="Season"
                    value={season ? SEASON_LABEL[season] : "—"}
                    hint={monthSignal ?? undefined}
                  />
                  <ReadoutRow
                    label="Rain"
                    value={
                      month
                        ? `${Math.round(month.precipMm)} mm · ${Math.round(month.precipDays)} rain days`
                        : "—"
                    }
                  />
                  <ReadoutRow label="Best months" value={active?.bestMonthsLabel ?? "—"} />
                  <ReadoutRow
                    label="Typical day"
                    value={active ? budgetLabel(active) : "—"}
                  />
                  <ReadoutRow
                    label="Ideal stay"
                    value={active ? `${active.recommendedDays} days` : "—"}
                  />
                </div>
                <p className="ut-t-micro mt-3 text-ut-subtle">
                  {SEASON_SIGNAL_BASIS}
                </p>
              </div>

              <div>
                <Eyebrow className="ut-t-micro">
                  Nearby · within {NEIGHBOUR_RADIUS_KM.toLocaleString("en-US")} km
                </Eyebrow>
                <div className="mt-3">
                  {map && (
                    <RegionMiniMap
                      points={map.points}
                      selectedSlug={mapSlug}
                      onSelect={setMapSlug}
                      activeVibe={null}
                      label={
                        active
                          ? `Destinations within ${NEIGHBOUR_RADIUS_KM} km of ${active.city}`
                          : "Nearby destinations"
                      }
                    />
                  )}
                </div>
              </div>
            </div>

            {active && (
              <div className="mt-4">
                <QuietLink href={`/destinations/${active.slug}`}>
                  Open {active.city} →
                </QuietLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

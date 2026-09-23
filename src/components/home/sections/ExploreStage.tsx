"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import Eyebrow from "@/components/ui/Eyebrow";
import { useHomeState } from "../HomeEnvironment";
import { PANEL_CLASS, PhotoLayer, QuietLink, ReadoutRow } from "./parts";
import { useDestinationClock } from "./use-destination-clock";
import type { Postcard } from "@/lib/home-sections";
import { EXPLORE_SELECTOR_SLUGS, EXPLORE_SLUG } from "@/lib/home-sections";
import {
  budgetLabel,
  monthName,
  monthOf,
  type HomePlace,
} from "@/lib/home-discovery";
import { hemisphereForLatitude, seasonForLatitudeMonth } from "@/lib/inner-state";
import { destinationContextFrom } from "@/lib/visual-state";
import { SEASON_LABEL } from "@/components/destination/place-state";

/**
 * ExploreStage — 首页第 1 段：**Explore the world through places.**
 *
 * 这一段要回答的问题只有一个：Tripla 从世界地图开始，让用户发现真实目的地。
 * 因此它由三样东西组成，全部是真实的：
 *   1. 一张真实目的地大图（项目图集里已目检的照片，server 端装配）；
 *   2. 一块**真实 Destination UI**：选中城市的当前月气候法线（NASA canonical）、
 *      半球感知的季节、当地实时时刻、canonical best months 窗口、日预算、建议停留；
 *   3. 一列真实候选目的地（hairline 行，非卡片）—— 点选即写入 HomeEnvironment 的
 *      目的地选择，首屏的 Local time / Weather 读数随之跟随（同一份状态）。
 *
 * 锚点纪律：本段承载 `id="discover"` —— HomeHero 的 "Start exploring" 依赖它。
 *
 * 没有任何解释性长文，也没有虚构功能：不显示实时天气以外的任何"实时"数字。
 */

export default function ExploreStage({ hero }: { hero: Postcard | null }) {
  const { places, currentMonth, selectDestination } = useHomeState();
  const [activeSlug, setActiveSlug] = useState<string>(EXPLORE_SLUG);

  const active = useMemo(
    () => places.find((p) => p.slug === activeSlug) ?? null,
    [places, activeSlug],
  );

  const candidates = useMemo(
    () =>
      EXPLORE_SELECTOR_SLUGS.map((slug) => places.find((p) => p.slug === slug)).filter(
        (p): p is HomePlace => Boolean(p),
      ),
    [places],
  );

  const clock = useDestinationClock(active?.timezone ?? null);

  const onPick = useCallback(
    (place: HomePlace) => {
      setActiveSlug(place.slug);
      // 与发现层同一份状态：首屏 Local time / Weather 随之锚定到这座城市
      selectDestination(
        destinationContextFrom({
          slug: place.slug,
          city: place.city,
          timezone: place.timezone,
          latitude: place.latitude,
          longitude: place.longitude,
        }),
      );
    },
    [selectDestination],
  );

  const month = active ? monthOf(active, currentMonth) : null;
  const season = active
    ? seasonForLatitudeMonth(currentMonth, hemisphereForLatitude(active.latitude))
    : null;

  return (
    <section id="discover" className="scroll-mt-20">
      <div className="mx-auto max-w-[var(--ut-container-max)] px-4 pb-16 pt-14 md:px-6 md:pb-24 md:pt-20">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          {/* ── 主视觉：真实目的地大图（照片主导，标题压在照片上） ────────── */}
          <div className="relative flex min-h-[56svh] overflow-hidden rounded-ut-lg lg:col-span-7 lg:min-h-[74svh]">
            {hero && <PhotoLayer card={hero} sizes="(max-width: 1024px) 100vw, 58vw" />}

            <div className="relative flex w-full flex-col justify-between gap-8 p-5 md:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Eyebrow dot className="ut-t-micro-photo">
                    01 · Explore
                  </Eyebrow>
                  <h2 className="ut-t-section mt-3 max-w-[15ch] text-white">
                    Explore the world through places.
                  </h2>
                </div>
                <Link
                  href="/destinations"
                  className="inline-flex shrink-0 items-center gap-2 rounded-ut-pill border border-white/25 bg-black/35 px-4 py-2 ut-t-control text-white/85 backdrop-blur-sm transition-colors duration-[var(--ut-dur-fast)] hover:border-white/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
                >
                  World atlas · {places.length}
                </Link>
              </div>

              {hero && (
                <p className="ut-t-support max-w-[44ch] text-white/75">
                  {hero.alt}
                </p>
              )}
            </div>
          </div>

          {/* ── 真实 Destination UI + 候选目的地（hairline 行） ─────────── */}
          <div className="lg:col-span-5">
            {active && (
              <div className={`${PANEL_CLASS} p-5 md:p-6`}>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="ut-t-panel text-ut-ink">
                    {active.city}
                  </h3>
                  <span className="ut-t-micro text-ut-muted">
                    {active.iata} · {monthName(currentMonth)}
                  </span>
                </div>
                <p className="ut-t-micro mt-2 text-ut-subtle">
                  {active.country} · {active.region}
                </p>

                {/* 当前月真实气候法线（canonical，与 /destinations 同源） */}
                <div className="mt-5 flex items-end gap-3">
                  <span className="ut-t-figure text-ut-ink">
                    {month ? `${Math.round(month.tempHighC)}°` : "—"}
                  </span>
                  <span className="ut-t-data pb-1.5 text-ut-muted">
                    {month ? `/ ${Math.round(month.tempLowC)}°C` : ""} · {monthName(currentMonth)}{" "}
                    average
                  </span>
                </div>

                <div className="mt-5">
                  <ReadoutRow label="Season" value={season ? SEASON_LABEL[season] : "—"} />
                  <ReadoutRow
                    label="Local time"
                    value={clock ?? "--:--"}
                    hint={active.timezone}
                  />
                  <ReadoutRow label="Best months" value={active.bestMonthsLabel} />
                  <ReadoutRow label="Typical day" value={budgetLabel(active)} />
                  <ReadoutRow label="Ideal stay" value={`${active.recommendedDays} days`} />
                </div>
              </div>
            )}

            <ul className="mt-6 divide-y divide-ut-border border-y border-ut-border">
              {candidates.map((p, i) => {
                const isActive = p.slug === activeSlug;
                return (
                  <li key={p.slug}>
                    <button
                      type="button"
                      onClick={() => onPick(p)}
                      aria-pressed={isActive}
                      aria-label={`Show ${p.city} on this page and in the hero readout`}
                      className="group flex w-full items-baseline gap-4 py-3.5 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ut-accent"
                    >
                      <span className="ut-t-micro w-6 shrink-0 text-ut-subtle">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={[
                            "ut-t-row block transition-colors duration-[var(--ut-dur-fast)]",
                            isActive ? "text-ut-accent" : "text-ut-ink group-hover:text-ut-accent",
                          ].join(" ")}
                        >
                          {p.city}
                        </span>
                        <span className="ut-t-micro mt-1.5 block text-ut-muted">
                          {p.country} · {p.bestMonthsLabel || p.region}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4">
              <QuietLink href="/destinations">Open the world atlas →</QuietLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

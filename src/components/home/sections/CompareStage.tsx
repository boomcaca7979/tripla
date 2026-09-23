"use client";

import { useMemo } from "react";
import Eyebrow from "@/components/ui/Eyebrow";
import { useHomeState } from "../HomeEnvironment";
import { PhotoLayer, QuietLink, SCRIM_READOUT } from "./parts";
import { COMPARE_LIMIT_NOTE, COMPARE_SLUGS, type Postcard } from "@/lib/home-sections";
import {
  monthName,
  monthOf,
  seasonSignalFor,
  weatherPhraseFor,
  type HomeMonth,
  type HomePlace,
} from "@/lib/home-discovery";

/**
 * CompareStage — 首页第 3 段：**Compare destinations.**
 *
 * 表达的是 Tripla 已有的**比较**能力，而不是一张 SaaS 表格：
 *   1. 三张真实目的地大图并置（图片本身就是比较的主体）；
 *   2. 每张图上叠加该城当月的真实读数：Weather / Season / Climate；
 *   3. 下方一条年度气候曲线带 —— 与 /destinations 的 CompareTray 同一套视觉语言
 *      （12 个月日高温折线 + 当月标线 + NASA POWER 注脚），数据同源（canonical 月值）。
 *
 * 上限口径：最多 3 个目的地 —— 与 /destinations 比对上一致
 * （真相源 src/components/destination/vibe-store.ts 的 COMPARE_MAX = 3）。
 * 这里不复制一套限制逻辑，只在文案上如实说明，并把"可交互的比较"交给地球页。
 *
 * 移动端重排（不是缩小桌面版）：三块由**并排**改为**纵向堆叠**，且读数从"压在图上"
 * 改为"落在图下"（用同一份 DOM 的 grid 同格叠放实现，见下方 md:row-start-1）。
 */

/** 曲线配色：沿用 /destinations CompareTray 的城市色序（同一套视觉语言）。 */
const CITY_COLORS = ["#f5f3ec", "#ffd9a0", "#8fb4c9"];
const MONTHS_SHORT = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

/** 曲线区几何（固定标尺 −10..40 °C，与 CompareTray 同口径；高度刻意收紧以减少空档）。 */
const X0 = 30;
const DX = 60;
const Y_TOP = 20;
const Y_BOTTOM = 126;
const VIEW_H = 158;

function tempY(c: number): number {
  const clamped = Math.max(-10, Math.min(40, c));
  return Y_BOTTOM - ((clamped + 10) / 50) * (Y_BOTTOM - Y_TOP);
}

interface CompareItem {
  place: HomePlace;
  card: Postcard | null;
  month: HomeMonth | null;
}

export default function CompareStage({ cards }: { cards: Postcard[] }) {
  const { places, currentMonth } = useHomeState();

  const items = useMemo<CompareItem[]>(
    () =>
      COMPARE_SLUGS.map((slug) => {
        const place = places.find((p) => p.slug === slug) ?? null;
        return place
          ? {
              place,
              card: cards.find((c) => c.slug === slug) ?? null,
              month: monthOf(place, currentMonth),
            }
          : null;
      }).filter((x): x is CompareItem => Boolean(x)),
    [places, cards, currentMonth],
  );

  return (
    <section id="compare" className="scroll-mt-20">
      <div className="mx-auto max-w-[var(--ut-container-max)] px-4 pb-16 md:px-6 md:pb-24">
        {/* ── 段头（横向一行，与第 1/2 段的"标题压在照片上"刻意不同） ───── */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow dot>03 · Compare</Eyebrow>
            <h2 className="ut-t-section mt-3 max-w-[22ch] text-ut-ink">
              Compare destinations.
            </h2>
          </div>
          <p className="ut-t-micro max-w-[42ch] text-ut-muted">
            {COMPARE_LIMIT_NOTE}
          </p>
        </div>

        {/* ── 三块并置（移动端纵向堆叠 + 读数落到图下） ─────────────── */}
        <ol className="mt-8 grid gap-4 md:grid-cols-3 md:gap-5">
          {items.map((item) => {
            const m = item.month;
            return (
              <li key={item.place.slug} className="grid md:grid-rows-1">
                <div className="relative min-h-[36svh] overflow-hidden rounded-ut-lg md:col-start-1 md:row-start-1 md:min-h-[62svh]">
                  {item.card && (
                    <PhotoLayer
                      card={item.card}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      creditClassName="top-3 right-3"
                      scrim={SCRIM_READOUT}
                    />
                  )}
                </div>

                {/* 同一格叠放：桌面 = 压在图上；移动端 = 落在图下 */}
                <div className="relative z-10 flex flex-col justify-end gap-3 px-1 pt-3 md:col-start-1 md:row-start-1 md:self-end md:px-5 md:pb-5">
                  <div>
                    <h3 className="ut-t-panel text-white">
                      {item.place.city}
                    </h3>
                    <p className="ut-t-micro mt-2 text-white/70">
                      {item.place.country} · {item.place.region}
                    </p>
                  </div>

                  <dl className="space-y-1.5">
                    <CompareLine
                      label="Weather"
                      value={m ? (weatherPhraseFor(m) ?? "—") : "—"}
                    />
                    <CompareLine
                      label="Season"
                      value={m ? (seasonSignalFor(m) ?? "—") : "—"}
                    />
                    <CompareLine
                      label="Climate"
                      value={
                        m
                          ? `${Math.round(m.tempHighC)}° / ${Math.round(m.tempLowC)}°C · ${Math.round(m.precipMm)} mm · ${Math.round(m.precipDays)} rain days`
                          : "—"
                      }
                    />
                  </dl>

                  <p className="ut-t-micro text-white/50">
                    {monthName(currentMonth)} · NASA POWER
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        {/* ── 年度气候曲线带（与地球页 CompareTray 同一语言 / 同一数据） ── */}
        <div className="ut-inst-panel mt-6 rounded-ut-lg px-5 py-5 md:px-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <Eyebrow>Daily high, twelve months</Eyebrow>
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {items.map((item, i) => (
                <li
                  key={item.place.slug}
                  className="ut-t-micro flex items-center gap-2 text-ut-text-2"
                >
                  <span
                    aria-hidden="true"
                    className="inline-block h-0.5 w-5 rounded-full"
                    style={{ background: CITY_COLORS[i % CITY_COLORS.length] }}
                  />
                  {item.place.city}
                </li>
              ))}
            </ul>
          </div>

          <svg
            viewBox={`0 0 720 ${VIEW_H}`}
            className="mt-4 block h-auto w-full"
            role="img"
            aria-label={`Daily high temperatures across twelve months for ${items
              .map((i) => i.place.city)
              .join(", ")}`}
          >
            {/* 月份网格 */}
            {MONTHS_SHORT.map((_, i) => (
              <line
                key={i}
                x1={X0 + i * DX}
                y1={Y_TOP - 4}
                x2={X0 + i * DX}
                y2={Y_BOTTOM + 6}
                stroke="rgba(245,242,236,0.09)"
                strokeWidth="1"
              />
            ))}
            {/* 0 °C 基线 */}
            <line
              x1={X0 - 10}
              y1={tempY(0)}
              x2={X0 + 11 * DX + 10}
              y2={tempY(0)}
              stroke="rgba(245,242,236,0.2)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            {/* 当月标线 */}
            <line
              x1={X0 + currentMonth * DX}
              y1={Y_TOP - 8}
              x2={X0 + currentMonth * DX}
              y2={Y_BOTTOM + 8}
              stroke="rgba(var(--ut-accent-rgb), 0.85)"
              strokeWidth="1.5"
            />
            {/* 每城日高温折线（真实 canonical 月值） */}
            {items.map((item, i) => (
              <polyline
                key={item.place.slug}
                fill="none"
                stroke={CITY_COLORS[i % CITY_COLORS.length]}
                strokeWidth="1.75"
                strokeLinejoin="round"
                points={item.place.months
                  .map((mm, mi) => `${X0 + mi * DX},${tempY(mm.tempHighC)}`)
                  .join(" ")}
              />
            ))}
            {/* 当月各城温度点 */}
            {items.map((item, i) => {
              const m = item.month;
              if (!m) return null;
              return (
                <circle
                  key={item.place.slug}
                  cx={X0 + currentMonth * DX}
                  cy={tempY(m.tempHighC)}
                  r="3"
                  fill={CITY_COLORS[i % CITY_COLORS.length]}
                />
              );
            })}
            {/* 月份刻度 */}
            {MONTHS_SHORT.map((label, i) => (
              <text
                key={i}
                x={X0 + i * DX}
                y={Y_BOTTOM + 22}
                textAnchor="middle"
                fontSize="11"
                fill="rgba(245,242,236,0.45)"
                fontFamily="var(--ut-font-mono)"
              >
                {label}
              </text>
            ))}
          </svg>

          <p className="ut-t-micro mt-3 text-ut-subtle">
            Curves = daily high (°C) · marker = {monthName(currentMonth).toUpperCase()} · NASA
            POWER
          </p>
        </div>

        <div className="mt-4">
          <QuietLink href="/destinations">Compare in the world atlas →</QuietLink>
        </div>
      </div>
    </section>
  );
}

/** 读数行（照片上使用；深色遮罩之上永远是浅色文字）。 */
function CompareLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-t border-white/15 pt-1.5">
      <dt className="ut-t-micro shrink-0 text-white/60">
        {label}
      </dt>
      <dd className="ut-t-data text-right text-white/90">{value}</dd>
    </div>
  );
}

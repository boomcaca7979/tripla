"use client";

import { useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Eyebrow from "@/components/ui/Eyebrow";
import { useHomeState } from "./HomeEnvironment";
import DestinationPreview from "./DestinationPreview";
import {
  BUDGET_NOTE,
  BUDGET_TIERS,
  MONTH_SHORT,
  MOODS,
  describeFilters,
  filterPlaces,
  moodDef,
  type HomePlace,
} from "@/lib/home-discovery";
import { destinationContextFrom } from "@/lib/visual-state";

/**
 * DiscoveryStage — 首页发现层：条件 → 结果。
 *
 * 三个控件都是**真实状态**，共同经 filterPlaces()（lib/home-discovery.ts）作用于
 * canonical 数据装配出的数据集，并写回 HomeEnvironment：
 *
 *   Month  → 命中 canonical best-month 窗口或 Favourable 月
 *   Mood   → 命中 destination.interests（真实 tags）
 *   Budget → 命中按固定参考汇率折算的 USD 日预算档位
 *
 * 结果可见变化 = 计数行 + 编辑对象网格 + 首屏状态句（HomeStatusLine 用同一组
 * 谓词，二者永不脱节）。145 个城市默认全量（Everywhere / 不限月份 / 不限预算）。
 *
 * 布局保持 Editorial Spatial Objects（1 primary + 2 medium + 3 文字对象）；
 * 点击对象上的 Preview → 选中该城市（首屏 Local time / Weather 随之跟随）并展开
 * 目的地 Preview；城市标题仍是通往详情页的常规链接（内链不变）。
 */

const FEATURED_LIMIT = 6;

const CHIP_BASE =
  "min-h-[44px] shrink-0 rounded-ut-pill border px-4 py-2 text-body-sm font-medium transition-[background-color,border-color,color] duration-[var(--ut-dur-med)] ease-ut-out focus-visible:outline-2 focus-visible:outline-ut-accent";
const CHIP_ON = "border-transparent bg-ut-accent text-ut-inverse";
const CHIP_OFF = "border-ut-border bg-transparent text-ut-text-2 hover:border-ut-border-strong hover:text-ut-text";

/** 环境 veil：把目的地渐变/图像压进同一环境（多用途于 primary/medium 对象） */
function EnvVeil() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{ background: "rgba(var(--ut-env-deep-rgb), 0.26)", mixBlendMode: "multiply" }}
    />
  );
}

/** 对象上的 Preview 触发条（与对象 Link 同级，故链接语义不被破坏） */
function PreviewButton({
  place,
  onPreview,
  selected,
  className = "",
}: {
  place: HomePlace;
  onPreview: (place: HomePlace) => void;
  selected: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onPreview(place)}
      aria-pressed={selected}
      aria-label={`Preview ${place.city}`}
      className={[
        "inline-flex min-h-[32px] items-center rounded-ut-pill border px-3",
        "font-mono text-micro uppercase tracking-[0.14em]",
        "transition-[background-color,border-color,color] duration-[var(--ut-dur-fast)] ease-ut-out",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ut-accent",
        className,
      ].join(" ")}
    >
      Preview
    </button>
  );
}

function TileObject({
  place,
  size,
  onPreview,
  selected,
}: {
  place: HomePlace;
  size: "primary" | "medium";
  onPreview: (place: HomePlace) => void;
  selected: boolean;
}) {
  const primary = size === "primary";
  return (
    <div
      className={[
        "group/tile relative",
        primary ? "lg:col-span-7 lg:row-span-2" : "lg:col-span-5",
      ].join(" ")}
    >
      <Link
        href={`/destinations/${place.slug}`}
        className={[
          "group relative flex h-full flex-col justify-between overflow-hidden rounded-ut-lg",
          "transition-[transform,box-shadow] duration-[var(--ut-dur-med)] ease-ut-out",
          "hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ut-accent",
          primary ? "min-h-[320px] lg:min-h-full" : "min-h-[196px]",
          place.gradient,
        ].join(" ")}
        style={
          primary
            ? { boxShadow: "0 0 44px rgba(var(--ut-accent-rgb), 0.2)" }
            : undefined
        }
      >
        {place.image && (
          <Image
            src={place.image}
            alt=""
            fill
            sizes={primary ? "(max-width: 1024px) 100vw, 58vw" : "(max-width: 1024px) 100vw, 42vw"}
            className="object-cover opacity-55 transition-opacity duration-[var(--ut-dur-med)] group-hover:opacity-45"
          />
        )}

        {/* 环境统一层：目的地渐变沉入环境，不再与状态色争抢 */}
        <EnvVeil />

        {/* 文字区底部渐变遮罩：图像上保持可读 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5"
          style={{ background: "linear-gradient(180deg, rgba(var(--ut-env-deep-rgb), 0) 0%, rgba(var(--ut-env-deep-rgb), 0.72) 100%)" }}
        />

        {/* Primary 的状态耦合层：atmosphere overlay + accent stripe */}
        {primary && (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 transition-colors duration-1000"
              style={{ background: "rgba(var(--ut-accent-rgb), 0.16)", mixBlendMode: "soft-light" }}
            />
            <div
              aria-hidden="true"
              className="absolute bottom-0 left-0 right-0 h-1 transition-colors duration-1000"
              style={{ background: "var(--ut-accent)" }}
            />
          </>
        )}

        <div className="relative flex items-start justify-between gap-2 p-5">
          <span className="font-mono text-micro uppercase tracking-[0.18em] text-white/70">
            {place.region} · {place.country}
          </span>
        </div>

        <div className="relative p-5 pt-0">
          <h3 className={`font-display text-white ${primary ? "text-display-lg" : "text-h2"}`}>
            {place.city}
          </h3>
          <p className={`mt-1.5 line-clamp-2 text-body-sm leading-snug text-white/85 ${primary ? "max-w-[44ch]" : ""}`}>
            {place.phrase}
          </p>
          <p className="mt-3 font-mono text-micro uppercase tracking-[0.14em] text-white/60">
            {place.bestMonthsLabel || place.region}
          </p>
        </div>
      </Link>

      <div className="absolute right-4 top-3.5 z-10">
        <PreviewButton
          place={place}
          onPreview={onPreview}
          selected={selected}
          className={[
            "backdrop-blur-sm",
            selected
              ? "border-white bg-white text-black"
              : "border-white/30 bg-black/35 text-white/85 hover:border-white/70 hover:text-white",
          ].join(" ")}
        />
      </div>
    </div>
  );
}

/** 文字对象：无底色、无边框圆角，hairline 顶部 + 索引号，编辑索引感 */
function TextObject({
  place,
  index,
  onPreview,
  selected,
}: {
  place: HomePlace;
  index: number;
  onPreview: (place: HomePlace) => void;
  selected: boolean;
}) {
  return (
    <div className="relative">
      <Link
        href={`/destinations/${place.slug}`}
        className="group flex flex-col border-t pt-4 pb-2 transition-colors duration-[var(--ut-dur-med)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ut-accent"
        style={{ borderTopColor: "rgba(var(--ut-accent-rgb), 0.22)" }}
      >
        <span className="flex items-baseline justify-between font-mono text-micro uppercase tracking-[0.16em] text-ut-subtle">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span>{place.region}</span>
        </span>
        <h3 className="mt-2.5 font-display text-h2 leading-snug text-ut-ink transition-colors duration-[var(--ut-dur-fast)] group-hover:text-ut-accent">
          {place.city}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-body-sm leading-snug text-ut-text-2">
          {place.phrase}
        </p>
        <p className="mt-3 font-mono text-micro uppercase tracking-[0.14em] text-ut-subtle">
          {place.bestMonthsLabel || place.region}
        </p>
      </Link>
      <div className="mt-3">
        <PreviewButton
          place={place}
          onPreview={onPreview}
          selected={selected}
          className={
            selected
              ? "border-transparent bg-ut-accent text-ut-inverse"
              : "border-ut-border bg-transparent text-ut-text-2 hover:border-ut-border-strong hover:text-ut-text"
          }
        />
      </div>
    </div>
  );
}

/** 控制组外壳：明确的组标签，让用户知道自己在调整什么 */
function ControlGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-mono text-micro uppercase tracking-[0.18em] text-ut-ink">
          {label}
        </span>
        {hint && <span className="text-body-sm text-ut-subtle">{hint}</span>}
      </div>
      <div
        className="-mx-4 mt-2.5 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-wrap md:px-0"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="flex gap-2 md:flex-wrap">{children}</div>
      </div>
    </div>
  );
}

export default function DiscoveryStage() {
  const {
    places, mood, setMood, month, setMonth, budget, setBudget,
    destination, selectDestination, currentMonth,
  } = useHomeState();
  const previewRef = useRef<HTMLDivElement>(null);

  const filters = useMemo(() => ({ mood, month, budget }), [mood, month, budget]);
  const filtered = useMemo(() => filterPlaces(places, filters), [places, filters]);
  const featured = filtered.slice(0, FEATURED_LIMIT);

  const selectedPlace = useMemo(
    () => (destination ? places.find((p) => p.slug === destination.id) ?? null : null),
    [destination, places],
  );

  // 点击 Preview：写入发现层选择（首屏状态句与 Local time / Weather 一并跟随），
  // 并把 Preview 面板滚入视野（只在用户交互时发生，不在首屏自动滚动）。
  const onPreview = useCallback(
    (place: HomePlace) => {
      selectDestination(
        destinationContextFrom({
          slug: place.slug,
          city: place.city,
          timezone: place.timezone,
          latitude: place.latitude,
          longitude: place.longitude,
        }),
      );
      requestAnimationFrame(() => {
        previewRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    },
    [selectDestination],
  );

  const isSelected = useCallback(
    (place: HomePlace) => destination?.id === place.slug,
    [destination],
  );

  const total = places.length;
  const activeMood = moodDef(mood);

  return (
    <section id="discover" className="scroll-mt-20">
      <div className="mx-auto max-w-[var(--ut-container-max)] px-4 py-20 md:px-6 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow dot>Discovery</Eyebrow>
            <h2 className="mt-3 font-display text-h1 text-ut-ink">
              What are you in the mood for?
            </h2>
          </div>
        </div>

        {/* ── 控件一：月份（canonical best-month 窗口 / Favourable 月） ── */}
        <ControlGroup label="Month" hint="when you can travel — leave it open to see everything">
          <button
            type="button"
            onClick={() => setMonth(null)}
            aria-pressed={month === null}
            className={[CHIP_BASE, month === null ? CHIP_ON : CHIP_OFF].join(" ")}
          >
            Any month
          </button>
          {MONTH_SHORT.map((m, i) => (
            <button
              key={m}
              type="button"
              onClick={() => setMonth(i)}
              aria-pressed={month === i}
              title={i === currentMonth ? "Current month" : undefined}
              className={[CHIP_BASE, month === i ? CHIP_ON : CHIP_OFF].join(" ")}
            >
              {m}
            </button>
          ))}
        </ControlGroup>

        {/* ── 控件二：Mood（真实 interests 命中） ───────────────────── */}
        <ControlGroup label="Mood" hint="what you want out of the days">
          {MOODS.map((m) => {
            const active = m.id === mood;
            const count =
              m.interests.length === 0
                ? total
                : places.filter((p) => p.interests.some((i) => m.interests.includes(i))).length;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMood(m.id)}
                aria-pressed={active}
                title={`${m.label} — ${m.hint}`}
                className={[CHIP_BASE, active ? CHIP_ON : CHIP_OFF].join(" ")}
              >
                {m.label}
                <span className={`ml-1.5 font-mono text-micro ${active ? "opacity-70" : "text-ut-subtle"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </ControlGroup>

        {/* ── 控件三：Budget（USD 档位；折算口径见脚注） ────────────── */}
        <ControlGroup label="Budget" hint="typical day, before flights">
          {BUDGET_TIERS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setBudget(t.id)}
              aria-pressed={budget === t.id}
              className={[CHIP_BASE, budget === t.id ? CHIP_ON : CHIP_OFF].join(" ")}
            >
              {t.label}
              {t.id !== "any" && (
                <span className={`ml-1.5 font-mono text-micro ${budget === t.id ? "opacity-70" : "text-ut-subtle"}`}>
                  {t.range}
                </span>
              )}
            </button>
          ))}
        </ControlGroup>
        <p className="mt-2 font-mono text-micro uppercase tracking-[0.14em] text-ut-subtle">
          {BUDGET_NOTE}
        </p>

        {/* 状态反馈行：只描述用户实际设置的条件 + 真实命中数 */}
        <p aria-live="polite" className="mt-6 font-mono text-label tracking-wide text-ut-muted">
          {filtered.length} of {total} destinations — {describeFilters(filters, currentMonth)}
          {mood === "all" ? "" : ` · ${activeMood.hint}`}
        </p>

        {/* ── 目的地 Preview（点击对象 Preview 后展开） ─────────────── */}
        <div ref={previewRef} className="scroll-mt-24">
          <DestinationPreview
            place={selectedPlace}
            month={month ?? currentMonth}
            monthIsSelected={month !== null}
            onClear={() => selectDestination(null)}
          />
        </div>

        {/* Editorial Spatial Objects — 1 primary + 2 medium + 3 text objects */}
        {featured.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6">
            {featured[0] && (
              <TileObject place={featured[0]} size="primary" onPreview={onPreview} selected={isSelected(featured[0])} />
            )}
            {featured[1] && (
              <TileObject place={featured[1]} size="medium" onPreview={onPreview} selected={isSelected(featured[1])} />
            )}
            {featured[2] && (
              <TileObject place={featured[2]} size="medium" onPreview={onPreview} selected={isSelected(featured[2])} />
            )}
            {featured.slice(3, 6).map((p, i) => (
              <div key={p.slug} className="lg:col-span-4">
                <TextObject place={p} index={i} onPreview={onPreview} selected={isSelected(p)} />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-10 text-body-lg text-ut-muted">
            No destination matches those conditions yet — widen the month, mood or budget
            and the atlas comes back.
          </p>
        )}

        <div className="mt-12">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 text-body-sm font-medium text-ut-accent underline-offset-4 transition-colors duration-[var(--ut-dur-fast)] hover:text-ut-accent-strong hover:underline focus-visible:outline-2 focus-visible:outline-ut-accent"
          >
            Browse the full atlas →
          </Link>
        </div>
      </div>
    </section>
  );
}

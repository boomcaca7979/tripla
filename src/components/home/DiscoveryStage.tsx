"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import Eyebrow from "@/components/ui/Eyebrow";
import { useHomeState } from "./HomeEnvironment";
import type { MoodId } from "@/lib/visual-state";

/**
 * DiscoveryStage — Mood 是状态交互，不是 WHERE 子句。
 * 选择 mood → 内容集合 + accent/glow 环境（经 HomeEnvironment 管线）同时变化。
 *
 * Editorial Spatial Objects（非卡片墙）：
 *   1 个 primary 大对象（7 列，横跨两行）
 * + 2 个 medium 对象（5 列纵叠）
 * + 3 个无底色文字对象（4 列，hairline 顶部，编辑索引感）
 *
 * 目的地渐变/图像统一叠加环境 veil（envDeep multiply）——
 * Environment 是底层，Destination 是对象，不再一块城市一张彩色网页。
 */

export interface DiscoveryPlace {
  slug: string;
  city: string;
  country: string;
  region: string;
  phrase: string;
  gradient: string;
  image: string | null;
  bestSeason: string;
  interests: string[];
}

interface MoodDef {
  id: MoodId;
  label: string;
  hint: string;
  interests: string[];
}

const MOODS: MoodDef[] = [
  { id: "all", label: "Everywhere", hint: "the full atlas", interests: [] },
  { id: "food", label: "Food first", hint: "eat your way through", interests: ["food"] },
  { id: "culture", label: "Old streets", hint: "history & museums", interests: ["history", "museums"] },
  { id: "nature", label: "Green escape", hint: "nature", interests: ["nature"] },
  { id: "beaches", label: "Barefoot", hint: "beaches", interests: ["beaches"] },
  { id: "night", label: "After dark", hint: "nightlife", interests: ["nightlife"] },
  { id: "shopping", label: "Browsing", hint: "shops & markets", interests: ["shopping"] },
  { id: "active", label: "Moving", hint: "sports & action", interests: ["sports"] },
];

const FEATURED_LIMIT = 6;

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

function TileObject({
  place,
  size,
}: {
  place: DiscoveryPlace;
  size: "primary" | "medium";
}) {
  const primary = size === "primary";
  return (
    <Link
      href={`/destinations/${place.slug}`}
      className={[
        "group relative flex flex-col justify-between overflow-hidden rounded-ut-lg",
        "transition-[transform,box-shadow] duration-[var(--ut-dur-med)] ease-ut-out",
        "hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ut-accent",
        primary ? "min-h-[320px] lg:col-span-7 lg:row-span-2 lg:min-h-full" : "min-h-[196px] lg:col-span-5",
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
          {place.bestSeason}
        </p>
      </div>
    </Link>
  );
}

/** 文字对象：无底色、无边框圆角，hairline 顶部 + 索引号，编辑索引感 */
function TextObject({ place, index }: { place: DiscoveryPlace; index: number }) {
  return (
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
        {place.bestSeason}
      </p>
    </Link>
  );
}

export default function DiscoveryStage({ places }: { places: DiscoveryPlace[] }) {
  const { mood, setMood } = useHomeState();
  const activeMood = MOODS.find((m) => m.id === mood) ?? MOODS[0];

  const filtered = useMemo(() => {
    if (activeMood.interests.length === 0) return places;
    return places.filter((p) => p.interests.some((i) => activeMood.interests.includes(i)));
  }, [activeMood, places]);

  const featured = filtered.slice(0, FEATURED_LIMIT);

  return (
    <section id="discover" className="scroll-mt-20">
      <div className="mx-auto max-w-[var(--ut-container-max)] px-4 py-20 md:px-6 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow dot>Discovery</Eyebrow>
            <h2 className="mt-3 font-display text-h1 text-ut-ink">
              What are you in the mood for?
            </h2>
            <p className="mt-3 max-w-[54ch] text-body-sm text-ut-muted">
              A mood changes the atlas — and the light it&apos;s seen in.
            </p>
          </div>
        </div>

        {/* Mood chips — 状态切换（内容 + 环境） */}
        <div
          role="group"
          aria-label="Change the atlas mood"
          className="-mx-4 mt-8 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-wrap md:px-0"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="flex gap-2 md:flex-wrap">
            {MOODS.map((m) => {
              const active = m.id === mood;
              const count =
                m.interests.length === 0
                  ? places.length
                  : places.filter((p) => p.interests.some((i) => m.interests.includes(i))).length;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMood(m.id)}
                  aria-pressed={active}
                  className={[
                    "min-h-[44px] shrink-0 rounded-ut-pill border px-4 py-2 text-body-sm font-medium",
                    "transition-[background-color,border-color,color] duration-[var(--ut-dur-med)] ease-ut-out",
                    "focus-visible:outline-2 focus-visible:outline-ut-accent",
                    active
                      ? "border-transparent bg-ut-accent text-ut-inverse"
                      : "border-ut-border bg-transparent text-ut-text-2 hover:border-ut-border-strong hover:text-ut-text",
                  ].join(" ")}
                  title={`${m.label} — ${m.hint}`}
                >
                  {m.label}
                  <span className={`ml-1.5 font-mono text-micro ${active ? "opacity-70" : "text-ut-subtle"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 状态反馈行 */}
        <p aria-live="polite" className="mt-5 font-mono text-label tracking-wide text-ut-muted">
          {mood === "all"
            ? `${filtered.length} places in the atlas — start anywhere.`
            : `${filtered.length} places lean ${activeMood.hint}.`}
        </p>

        {/* Editorial Spatial Objects — 1 primary + 2 medium + 3 text objects */}
        {featured.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6">
            {featured[0] && <TileObject place={featured[0]} size="primary" />}
            {featured[1] && <TileObject place={featured[1]} size="medium" />}
            {featured[2] && <TileObject place={featured[2]} size="medium" />}
            {featured.slice(3, 6).map((p, i) => (
              <div key={p.slug} className="lg:col-span-4">
                <TextObject place={p} index={i} />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-10 text-body-lg text-ut-muted">
            Nothing in the atlas matches that mood yet — try another.
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

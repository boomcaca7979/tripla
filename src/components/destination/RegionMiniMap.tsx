"use client";

import { formatLatLon, type Vibe } from "@/lib/inner-state";

/**
 * RegionMiniMap — 编辑式地理仪器（Inner Experience SPEC v1 §C.1 / §B.3）。
 *
 * 硬约束：
 *   · 无任何地图服务 / tile / 库 —— 纸面 + hairline 经纬网 + 真实坐标点。
 *     点位来自 server 端 projectRegionPoints()（真实 airport 坐标的等距圆柱投影）。
 *   · 点 = HTML button（44px 命中区，keyboard 可达），视觉圆点只是按钮内部的
 *     aria-hidden 装饰 —— SVG 圆点不可聚焦，因此可访问语义放在 button 层。
 *   · hover = preview（放大/变色），click/focus = commit（onSelect）；
 *     颜色不是唯一状态信息（选中点有 accent 环 + 坐标读数同步 + aria-pressed）。
 *   · vibe 命中的目的地（真实 interests 映射）点色变化 —— 这是 vibe 的真实
 *     地图效应；未命中不隐藏（地图永远完整）。
 */

export interface MapPoint {
  slug: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  /** 0..1 投影坐标（inner-state.projectRegionPoints 输出） */
  x: number;
  y: number;
  isSelf: boolean;
  /** 该目的地真实 interests 映射出的 vibe 集合（vibe 高亮用） */
  vibes: Vibe[];
}

export default function RegionMiniMap({
  points,
  selectedSlug,
  onSelect,
  activeVibe,
  label,
}: {
  points: MapPoint[];
  selectedSlug: string;
  onSelect: (slug: string) => void;
  activeVibe: Vibe | null;
  label: string;
}) {
  const selected = points.find((p) => p.slug === selectedSlug) ?? points.find((p) => p.isSelf) ?? points[0];

  return (
    <div>
      <div
        role="group"
        aria-label={label}
        className="relative aspect-[4/3] w-full overflow-hidden rounded-ut-md border border-ut-border bg-ut-surface"
      >
        {/* 经纬网：hairline 网格（仪器感；坐标读数承载真实地理） */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to right, var(--ut-data-line) 0 1px, transparent 1px 16.666%), " +
              "repeating-linear-gradient(to bottom, var(--ut-data-line) 0 1px, transparent 1px 20%)",
            opacity: 0.35,
          }}
        />

        {points.map((p) => {
          const isSelected = p.slug === selected?.slug;
          const vibeHit = activeVibe !== null && p.vibes.includes(activeVibe);
          return (
            <button
              key={p.slug}
              type="button"
              aria-label={`${p.city} — ${formatLatLon(p.latitude, p.longitude)}${p.isSelf ? " (this destination)" : ""}`}
              aria-pressed={isSelected}
              onClick={() => onSelect(p.slug)}
              className="group absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(var(--ut-accent-rgb),0.7)]"
              style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
            >
              <span
                aria-hidden="true"
                className={[
                  "relative flex items-center justify-center rounded-full transition-all duration-[var(--ut-dur-fast)] ease-ut-out motion-reduce:transition-none",
                  p.isSelf ? "h-3.5 w-3.5" : "h-2.5 w-2.5 group-hover:h-3.5 group-hover:w-3.5",
                  isSelected ? "bg-ut-accent ring-2 ring-[rgba(var(--ut-accent-rgb),0.4)] ring-offset-1 ring-offset-ut-surface" : vibeHit ? "bg-ut-verdict-good" : "bg-ut-text-2 group-hover:bg-ut-ink",
                ].join(" ")}
              />
              <span
                aria-hidden="true"
                className={[
                  "pointer-events-none absolute whitespace-nowrap font-mono text-[0.5625rem] uppercase tracking-[0.1em] transition-colors duration-[var(--ut-dur-fast)] motion-reduce:transition-none",
                  // 靠近底边的点标签放上方；靠近右缘的标签右对齐，避免截断
                  p.y > 0.82 ? "bottom-full mb-0.5" : "top-full mt-0.5",
                  p.x > 0.85 ? "right-0" : p.x < 0.15 ? "left-0" : "left-1/2 -translate-x-1/2",
                  isSelected ? "text-ut-ink" : "text-ut-muted group-hover:text-ut-text",
                ].join(" ")}
              >
                {p.city}
              </span>
            </button>
          );
        })}
      </div>

      {/* 坐标读数（aria-live：选择变化同步播报） */}
      <div aria-live="polite" className="mt-3 flex flex-wrap items-baseline justify-between gap-2 border-t border-ut-border pt-3">
        <p className="font-mono text-label uppercase tracking-[0.16em] text-ut-text">
          {selected ? selected.city : "—"}
          {selected?.isSelf ? " · this city" : ""}
        </p>
        <p className="font-mono text-label tabular-nums tracking-[0.12em] text-ut-muted">
          {selected ? formatLatLon(selected.latitude, selected.longitude) : PENDING}
        </p>
      </div>
      {activeVibe !== null && (
        <p className="mt-2 font-mono text-micro uppercase tracking-[0.14em] text-ut-verdict-good">
          ● {activeVibe} match
        </p>
      )}
    </div>
  );
}

const PENDING = "— · —";

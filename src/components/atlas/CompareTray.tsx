"use client";

import { useMemo, useState } from "react";
import { useAtlasStore } from "@/components/destination/vibe-store";
import type { AtlasNode } from "@/components/atlas/WorldAtlas";

/**
 * CompareTray — Destination 3.0 STEP 2B（对比探索，非表格）。
 *
 * 视觉主体 = 年度气候曲线叠加（temperature 高温曲线 × 城市），当前月份
 * 以垂直标线同步；每城在当前月的 tier 以色点标注。不是 table/grid。
 *
 * 纪律：
 *   · 最多 3 城（atlas-store 限制）；clear 不清除 month/vibe/view。
 *   · 世界保持可见：tray 贴底部，展开面板 ≤45svh。
 *   · 曲线数据 = node.months（NASA canonical），零伪造。
 */

const CITY_COLORS = ["#f5f3ec", "#ffd9a0", "#8fb4c9"];
const MONTHS_SHORT = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export default function CompareTray({
  nodes,
  month,
}: {
  nodes: AtlasNode[];
  month: number;
}) {
  const compare = useAtlasStore((s) => s.compare);
  const removeFromCompare = useAtlasStore((s) => s.removeFromCompare);
  const clearCompare = useAtlasStore((s) => s.clearCompare);
  const [open, setOpen] = useState(false);

  const compared = useMemo(
    () =>
      compare
        .map((slug) => nodes.find((n) => n.slug === slug))
        .filter((n): n is AtlasNode => Boolean(n)),
    [compare, nodes],
  );

  if (compared.length === 0) return null;

  return (
    <div className="absolute bottom-24 left-3 z-30 md:left-6" data-ut-compare="">
      {/* tray（收起态） */}
      <div className="flex items-center gap-2 rounded-ut-pill border border-white/15 bg-black/40 px-3 py-1.5 backdrop-blur-sm">
        {compared.map((n, i) => (
          <span
            key={n.slug}
            className="flex items-center gap-1.5 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-white/85"
          >
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: CITY_COLORS[i % CITY_COLORS.length] }}
            />
            {n.city}
            <button
              type="button"
              aria-label={`Remove ${n.city} from compare`}
              onClick={() => removeFromCompare(n.slug)}
              className="ml-0.5 text-white/40 transition-colors hover:text-white"
            >
              ✕
            </button>
          </span>
        ))}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="min-h-[36px] rounded-ut-pill border border-white/25 px-3 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-white/85 transition-colors hover:border-white/60"
        >
          {open ? "Hide" : `Compare ${compared.length}`}
        </button>
        <button
          type="button"
          onClick={clearCompare}
          className="min-h-[36px] px-2 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-white/45 transition-colors hover:text-white"
        >
          Clear
        </button>
      </div>

      {/* 展开面板：年度曲线叠加（当前月标线同步） */}
      {open && (
        <div className="mt-2 w-[min(92vw,26rem)] overflow-hidden rounded-ut-md border border-white/12 bg-[#0c1018]/95 shadow-[var(--ut-shadow-2)] backdrop-blur-sm">
          {/* 曲线区：temperature 高温曲线 × 城 */}
          <svg viewBox="0 0 260 120" className="block w-full">
            {/* 月份网格 */}
            {MONTHS_SHORT.map((_, i) => (
              <line
                key={i}
                x1={14 + i * 21}
                y1={8}
                x2={14 + i * 21}
                y2={92}
                stroke="rgba(245,243,236,0.08)"
                strokeWidth="1"
              />
            ))}
            {/* 当前月标线 */}
            <line
              x1={14 + month * 21}
              y1={6}
              x2={14 + month * 21}
              y2={94}
              stroke="rgba(164, 81, 59, 0.8)"
              strokeWidth="1.5"
            />
            {/* 0°C 基线 */}
            <line x1={10} y1={tempY(0)} x2={250} y2={tempY(0)} stroke="rgba(245,243,236,0.2)" strokeWidth="1" strokeDasharray="3 3" />
            {/* 每城高温曲线 */}
            {compared.map((n, i) => (
              <polyline
                key={n.slug}
                fill="none"
                stroke={CITY_COLORS[i % CITY_COLORS.length]}
                strokeWidth="1.75"
                strokeLinejoin="round"
                points={n.months
                  .map((m, mi) => `${14 + mi * 21},${tempY(m.h)}`)
                  .join(" ")}
              />
            ))}
            {/* 当前月各城温度点 */}
            {compared.map((n, i) => (
              <circle
                key={n.slug}
                cx={14 + month * 21}
                cy={tempY(n.months[month].h)}
                r="2.5"
                fill={CITY_COLORS[i % CITY_COLORS.length]}
              />
            ))}
            {/* 月份刻度 */}
            {MONTHS_SHORT.map((m, i) => (
              <text
                key={i}
                x={14 + i * 21}
                y={116}
                textAnchor="middle"
                fontSize="7"
                fill="rgba(245,243,236,0.45)"
                fontFamily="var(--ut-font-mono)"
              >
                {m}
              </text>
            ))}
          </svg>

          {/* 当前月读数（每城一行：tier / 温度 / 雨） */}
          <div className="divide-y divide-white/8 border-t border-white/10">
            {compared.map((n, i) => {
              const m = n.months[month];
              return (
                <div key={n.slug} className="flex items-baseline justify-between gap-3 px-4 py-2.5">
                  <span className="flex items-center gap-2 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-white/85">
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: CITY_COLORS[i % CITY_COLORS.length] }}
                    />
                    {n.city}
                  </span>
                  <span className="font-mono text-[0.625rem] tabular-nums text-white/70">
                    {m.h.toFixed(0)}° / {m.l.toFixed(0)}°C · {m.p.toFixed(0)} mm · {m.rd.toFixed(0)} rd
                  </span>
                </div>
              );
            })}
          </div>
          <p className="px-4 py-2 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-white/40">
            Curves = daily high (°C) · marker = {["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"][month]} · NASA POWER
          </p>
        </div>
      )}
    </div>
  );
}

function tempY(c: number): number {
  // 固定标尺 −10..40 °C → y 92..8（视觉投影，语义不变）
  const clamped = Math.max(-10, Math.min(40, c));
  return 92 - ((clamped + 10) / 50) * 84;
}

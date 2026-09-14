"use client";

import Image from "next/image";
import Link from "next/link";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import {
  nodeVisualState,
  REGION_TINTS,
  VIBE_ORDER,
  type NodeTier,
  type Vibe,
} from "@/lib/inner-state";
import { useAtlasStore } from "@/components/destination/vibe-store";
import CompareTray from "./CompareTray";

/**
 * WorldAtlas — /destinations 3.0 "ATLAS CORE"（WORLD ATLAS FIRST）。
 *
 * 主产品职责：EXPLORE WHERE TO GO。整页 = 一个可拖拽/可缩放/可换季的世界。
 *
 * 交互模型：
 *   PAN        拖拽世界（pointer capture；transform 走 ref + rAF，无 state cascade）
 *   ZOOM       滚轮 / ± 按钮（1–4×，中心缩放）
 *   MONTH      底部 12 月拖轨（连续 scrub + 吸附），绑定 NASA canonical tier
 *   NODE       hover=聚焦+城市名；click=Preview（不导航）
 *   PREVIEW    就地浮出（地图保持可见）→ OPEN DESTINATION
 *   STATE      月份与视图存 sessionStorage——从 Detail 返回时世界保持原样
 *
 * 数据诚信：节点位置 = 真实坐标投影；tier = NASA canonical；无随机、无装饰
 * 伪状态、无"当前天气"声称（这是 travel suitability / climate state）。
 */

export interface AtlasMonthDatum {
  h: number;
  l: number;
  p: number;
  rd: number;
}

export interface AtlasNode {
  slug: string;
  city: string;
  country: string;
  region: string;
  x: number;
  y: number;
  hero: string | null;
  vibes: Vibe[];
  tiers: NodeTier[];
  months: AtlasMonthDatum[];
  budget: string;
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const K_MIN = 1;
const K_MAX = 4;
const STORE_KEY = "utlas:v1";

const TIER_WORD: Record<NodeTier, string> = {
  dominant: "Favourable",
  secondary: "Workable",
  quiet: "Challenging",
};

export default function WorldAtlas({ nodes }: { nodes: AtlasNode[] }) {
  const [month, setMonth] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [scrubbing, setScrubbing] = useState(false);
  const vibe = useAtlasStore((st) => st.vibe);
  const setVibe = useAtlasStore((st) => st.setVibe);
  const compare = useAtlasStore((st) => st.compare);
  const addToCompare = useAtlasStore((st) => st.addToCompare);
  const compareResult: "exists" | "full" | "ready" = useAtlasStore((st) => {
    if (selected === null) return "ready";
    if (st.compare.includes(selected)) return "exists";
    return st.compare.length >= 3 ? "full" : "ready";
  });
  const viewRef = useRef({ x: 0, y: 0, k: 1 });
  const restoredRef = useRef(false);
  const worldRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragStart = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const monthTrackRef = useRef<HTMLDivElement | null>(null);


  // ── 持久化（恢复完成前不写入，避免把默认态覆盖回存档） ──
  const persist = useCallback(() => {
    if (!restoredRef.current) return;
    const vp = viewportRef.current;
    if (!vp || vp.clientWidth === 0) return;
    try {
      sessionStorage.setItem(
        STORE_KEY,
        JSON.stringify({
          month,
          vibe: useAtlasStore.getState().vibe,
          compare: useAtlasStore.getState().compare,
          view: {
            nx: viewRef.current.x / vp.clientWidth,
            ny: viewRef.current.y / vp.clientHeight,
            k: viewRef.current.k,
          },
        }),
      );
    } catch {
      /* ignore */
    }
  }, [month]);

  useEffect(() => {
    persist();
  }, [month, zoom, vibe, compare, persist]);

  // ── 视图变换（imperative：pan/zoom 不触发 state cascade） ──
  const applyView = useCallback(() => {
    const el = worldRef.current;
    if (!el) return;
    const { x, y, k } = viewRef.current;
    el.style.transform = `translate(${x}px, ${y}px) scale(${k})`;
    el.style.setProperty("--k", String(k));
  }, []);

  // 每次渲染后重应用视图（防 React 重渲染/元素替换清除 imperative transform）
  useEffect(() => {
    applyView();
  });

  const clampView = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const { k } = viewRef.current;
    const minX = Math.min(0, vp.clientWidth * (1 - k));
    const minY = Math.min(0, vp.clientHeight * (1 - k));
    viewRef.current.x = Math.max(minX, Math.min(0, viewRef.current.x));
    viewRef.current.y = Math.max(minY, Math.min(0, viewRef.current.y));
  }, []);

  const zoomTo = useCallback(
    (factor: number) => {
      const vp = viewportRef.current;
      if (!vp) return;
      const k = Math.max(K_MIN, Math.min(K_MAX, viewRef.current.k * factor));
      const ratio = k / viewRef.current.k;
      viewRef.current.x = vp.clientWidth / 2 - (vp.clientWidth / 2 - viewRef.current.x) * ratio;
      viewRef.current.y = vp.clientHeight / 2 - (vp.clientHeight / 2 - viewRef.current.y) * ratio;
      viewRef.current.k = k;
      clampView();
      applyView();
      setZoom(k);
      persist();
    },
    [applyView, clampView, persist],
  );

  // ── 恢复状态（从 Detail 返回时月份/视图保持原样；延迟 setState 避免渲染级联） ──
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const raw = sessionStorage.getItem(STORE_KEY);
        const vw = viewportRef.current?.clientWidth ?? 0;
        const vh = viewportRef.current?.clientHeight ?? 0;
        if (!raw) {
          // 无存档：移动端默认放大，让世界带填满屏幕
          if (vw > 0 && vw < 640) {
            viewRef.current = { x: -((vw * 1.8 - vw) / 2), y: -((vh * 1.8 - vh) / 2), k: 1.8 };
            setZoom(1.8);
            applyView();
          }
          restoredRef.current = true;
          return;
        }
        const saved = JSON.parse(raw) as {
          month?: number;
          vibe?: Vibe | null;
          compare?: string[];
          view?: { nx: number; ny: number; k: number };
        };
        if (typeof saved.month === "number" && saved.month >= 0 && saved.month <= 11) setMonth(saved.month);
        if (saved.vibe !== undefined) setVibe((saved.vibe as Vibe | null) ?? null);
        if (Array.isArray(saved.compare)) useAtlasStore.setState({ compare: saved.compare.filter((x) => typeof x === "string") });
        if (saved.view && isFinite(saved.view.k) && saved.view.k >= K_MIN && saved.view.k <= K_MAX) {
          // 归一化 pan 还原（跨视口/跨设备可用）；跨视口恢复后立即夹紧边界
          viewRef.current = {
            x: saved.view.nx * vw,
            y: saved.view.ny * vh,
            k: saved.view.k,
          };
          setZoom(saved.view.k);
          clampView();
          applyView();
        }
        restoredRef.current = true;
      } catch {
        /* 私有模式等场景：静默忽略 */
      }
    }, 0);
    return () => clearTimeout(t);
  }, [applyView, setVibe]);
  // restoredRef 在 restore 完成后才允许持久化（见上方 persist 守卫）

  // ── PAN（拖拽世界） ──
  const onMapDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = { x: event.clientX, y: event.clientY, vx: viewRef.current.x, vy: viewRef.current.y };
    setDragging(true);
  };
  const onMapMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    viewRef.current.x = dragStart.current.vx + (event.clientX - dragStart.current.x);
    viewRef.current.y = dragStart.current.vy + (event.clientY - dragStart.current.y);
    clampView();
    applyView();
  };
  const onMapUp = () => {
    if (!dragging) return;
    setDragging(false);
    clampView();
    applyView();
    persist();
  };

  const onWheel = useCallback(
    (event: ReactWheelEvent<HTMLDivElement>) => {
      zoomTo(event.deltaY < 0 ? 1.18 : 1 / 1.18);
    },
    [zoomTo],
  );

  // ── MONTH SCRUB（连续 + 吸附） ──
  const scrubMonth = useCallback(
    (clientX: number) => {
      const rect = monthTrackRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0) return;
      const idx = Math.max(0, Math.min(11, Math.floor(((clientX - rect.left) / rect.width) * 12)));
      setMonth(idx);
    },
    [],
  );
  const onMonthDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setScrubbing(true);
    scrubMonth(e.clientX);
  };
  const onMonthMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (scrubbing) scrubMonth(e.clientX);
  };
  const onMonthUp = () => setScrubbing(false);

  // 拖拽中 window 级收尾（丢 up 兜底）
  useEffect(() => {
    if (!dragging) return;
    const end = () => setDragging(false);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [dragging]);

  // PREVIEW 以 Escape 关闭（dialog 模式；无焦点陷阱 —— 地图交互仍可用）
  useEffect(() => {
    if (selected === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  // ── VIBE LENS 轴（只提供数据中真实存在的玩法） ──
  const allVibes = useMemo(
    () => VIBE_ORDER.filter((v) => nodes.some((n) => n.vibes.includes(v))),
    [nodes],
  );

  // ── 世界状态统计（环境信息） ──
  const counts = useMemo(() => {
    const c = { dominant: 0, secondary: 0, quiet: 0 };
    for (const n of nodes) c[n.tiers[month]] += 1;
    return c;
  }, [nodes, month]);

  // ── 区域氛围场（真实成员坐标的质心 + 半径，确定性） ──
  const regionFields = useMemo(() => {
    const regions = ["Asia", "Europe", "Americas", "Oceania"];
    return regions.map((region) => {
      const members = nodes.filter((n) => n.region === region);
      const cx = members.reduce((s, n) => s + n.x, 0) / members.length;
      const cy = members.reduce((s, n) => s + n.y, 0) / members.length;
      const radius = Math.max(...members.map((n) => Math.hypot(n.x - cx, n.y - cy)));
      return { region, cx, cy, radius: Math.min(0.46, radius * 1.25) };
    });
  }, [nodes]);

  const selectedNode = nodes.find((n) => n.slug === selected) ?? null;
  const selectedDatum = selectedNode?.months[month];
  const selectedTier = selectedNode?.tiers[month] ?? "quiet";

  return (
    <div className="relative h-[calc(100svh-4rem)] overflow-hidden bg-[#070a12] text-[#f5f3ec]">
      {/* 顶部环境行（极简 chrome） */}
      <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex items-start justify-between px-4 md:px-8">
        <div>
          <p className="font-mono text-micro uppercase tracking-[0.22em] text-white/50">
            Utripla World Atlas
          </p>
          <p className="mt-1 font-display text-[1.75rem] leading-none text-white">
            {MONTHS[month].charAt(0) + MONTHS[month].slice(1).toLowerCase()}
          </p>
        </div>
        <p className="text-right font-mono text-micro uppercase leading-[1.9] tracking-[0.16em] text-white/60">
          <span className="text-white/90">{counts.dominant} favourable</span>
          <br />
          {counts.secondary} workable
          <br />
          {counts.quiet} challenging
        </p>
      </div>

      {/* 世界视口 */}
      <div
        ref={viewportRef}
        onWheel={onWheel}
        onPointerDown={onMapDown}
        onPointerMove={onMapMove}
        onPointerUp={onMapUp}
        onPointerCancel={onMapUp}
        className={[
          "absolute inset-0",
          dragging ? "cursor-grabbing" : "cursor-grab",
        ].join(" ")}
      >
        <div ref={worldRef} className="absolute inset-0 will-change-transform">
          {/* 世界带（保持纬度相对间距） */}
          <div className="absolute inset-x-0 top-1/2 h-[min(100%,42vw)] -translate-y-1/2">
            {/* 经纬网 */}
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.13]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to right, rgba(245,243,236,0.5) 0 1px, transparent 1px calc(100%/24)), repeating-linear-gradient(to bottom, rgba(245,243,236,0.5) 0 1px, transparent 1px calc(100%/12))",
              }}
            />
            {/* 区域氛围场（真实成员质心） */}
            {regionFields.map((f) => (
              <div
                key={f.region}
                aria-hidden="true"
                className="absolute rounded-full"
                style={{
                  left: `${(f.cx - f.radius) * 100}%`,
                  top: `${(f.cy - f.radius) * 100}%`,
                  width: `${f.radius * 200}%`,
                  height: `${f.radius * 200}%`,
                  background: `radial-gradient(circle, rgba(${REGION_TINTS[f.region as keyof typeof REGION_TINTS] ?? "164, 81, 59"}, 0.13) 0%, transparent 70%)`,
                }}
              />
            ))}

            {/* 145 DESTINATION NODES */}
            {nodes.map((node) => (
              <AtlasNodeButton
                key={node.slug}
                node={node}
                month={month}
                vibe={vibe}
                selected={selected === node.slug}
                onHover={setHovered}
                onSelect={setSelected}
              />
            ))}

            {/* hover 城市名（跟随节点） */}
            {hovered &&
              nodes
                .filter((n) => n.slug === hovered)
                .map((n) => (
                  <span
                    key={n.slug}
                    className="pointer-events-none absolute z-10 -translate-x-1/2 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-white"
                    style={{ left: `${n.x * 100}%`, top: `calc(${n.y * 100}% + 14px)` }}
                  >
                    {n.city}
                  </span>
                ))}
          </div>
        </div>

        {/* 缩放控制（唯一 chrome 按钮） */}
        <div className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2">
          <button
            type="button"
            onClick={() => zoomTo(1.35)}
            aria-label="Zoom in"
            className="flex h-11 w-11 items-center justify-center rounded-ut-pill border border-white/20 bg-black/30 font-mono text-body-sm text-white/85 backdrop-blur-sm transition-colors duration-[var(--ut-dur-fast)] hover:border-white/60 motion-reduce:transition-none"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => zoomTo(1 / 1.35)}
            aria-label="Zoom out"
            className="flex h-11 w-11 items-center justify-center rounded-ut-pill border border-white/20 bg-black/30 font-mono text-body-sm text-white/85 backdrop-blur-sm transition-colors duration-[var(--ut-dur-fast)] hover:border-white/60 motion-reduce:transition-none"
          >
            −
          </button>
        </div>
      </div>

      {/* COMPARE TRAY（≤3 城 · 年度曲线） */}
      <CompareTray nodes={nodes} month={month} />

      {/* MONTH SCRUB — 世界时间轴（VIBE LENS 同区，构成 WHERE×WHEN×WHAT 控制台） */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-5 md:px-8">
        <div className="mx-auto max-w-3xl">
          {allVibes.length > 0 && (
            <div
              role="radiogroup"
              aria-label="World lens — how do you want to travel?"
              className="mb-2 flex flex-wrap gap-x-4 gap-y-0.5"
            >
              <VibeLensChip
                label="All"
                selected={vibe === null}
                onSelect={() => setVibe(null)}
              />
              {allVibes.map((v) => (
                <VibeLensChip
                  key={v}
                  label={v}
                  selected={vibe === v}
                  onSelect={() => setVibe(v)}
                />
              ))}
            </div>
          )}
          <div
            ref={monthTrackRef}
            role="slider"
            tabIndex={0}
            aria-label="Scrub the world by month"
            aria-valuemin={1}
            aria-valuemax={12}
            aria-valuenow={month + 1}
            aria-valuetext={MONTHS[month]}
            onPointerDown={onMonthDown}
            onPointerMove={onMonthMove}
            onPointerUp={onMonthUp}
            onPointerCancel={onMonthUp}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") { e.preventDefault(); setMonth((m) => Math.max(0, m - 1)); }
              if (e.key === "ArrowRight") { e.preventDefault(); setMonth((m) => Math.min(11, m + 1)); }
              if (e.key === "Home") { e.preventDefault(); setMonth(0); }
              if (e.key === "End") { e.preventDefault(); setMonth(11); }
            }}
            className="relative flex min-h-[44px] cursor-ew-resize items-end gap-1 rounded-ut-pill border border-white/12 bg-black/35 px-3 py-1.5 backdrop-blur-sm"
          >
            {MONTHS.map((m, i) => {
              const active = i === month;
              return (
                <span
                  key={m}
                  aria-hidden="true"
                  className={[
                    "relative flex-1 pb-1 text-center font-mono text-[0.5625rem] uppercase tracking-[0.08em] transition-colors duration-200",
                    active ? "text-white" : "text-white/45",
                  ].join(" ")}
                >
                  {m}
                  {active && (
                    <span className="absolute inset-x-1 bottom-0 h-[2px] rounded-full bg-ut-accent" />
                  )}
                </span>
              );
            })}
          </div>
          <p className="mt-2 text-center font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-white/40">
            drag the month — the world rearranges itself
          </p>
        </div>
      </div>

      {/* PREVIEW — 从世界浮出的地点 */}
      {selectedNode && selectedDatum && (
        <div
          role="dialog"
          aria-label={`${selectedNode.city} preview`}
          className="absolute inset-x-3 bottom-24 z-30 md:inset-x-auto md:bottom-auto md:right-8 md:top-24 md:w-[22rem]"
        >
          <div className="overflow-hidden rounded-ut-md border border-white/12 bg-[#0c1018]/95 shadow-[var(--ut-shadow-2)] backdrop-blur-sm">
            {selectedNode.hero ? (
              <div className="relative h-36 w-full">
                <Image
                  src={selectedNode.hero}
                  alt={`${selectedNode.city}, ${selectedNode.country}`}
                  fill
                  sizes="22rem"
                  className="object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(12,16,24,0.85), transparent 70%)" }}
                />
              </div>
            ) : (
              <div
                className="flex h-16 items-end p-4"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(164, 81, 59, 0.35), rgba(12, 16, 24, 0.4))",
                }}
              >
                <p className="font-mono text-micro uppercase tracking-[0.18em] text-white/60">
                  {selectedNode.region}
                </p>
              </div>
            )}
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-h2 leading-none text-white">{selectedNode.city}</p>
                  <p className="mt-1.5 font-mono text-label uppercase tracking-[0.16em] text-white/60">
                    {selectedNode.country} · {MONTHS[month]}
                    {vibe && (
                      <span className="ml-2 text-ut-verdict-good" aria-hidden="true">
                        · {vibe} mode
                      </span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label="Close preview"
                  className="flex h-11 w-11 items-center justify-center font-mono text-white/60 transition-colors hover:text-white"
                >
                  ✕
                </button>
              </div>
              <p
                className={[
                  "mt-4 font-mono text-label uppercase tracking-[0.18em]",
                  selectedTier === "dominant"
                    ? "text-ut-verdict-good"
                    : selectedTier === "secondary"
                      ? "text-ut-verdict-workable"
                      : "text-ut-verdict-challenging",
                ].join(" ")}
              >
                {TIER_WORD[selectedTier]} · {MONTHS[month]}
              </p>
              <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-white/10 pt-4 font-mono text-body-sm tabular-nums text-white/90">
                <div>
                  <dt className="text-[0.5625rem] uppercase tracking-[0.14em] text-white/45">High / Low</dt>
                  <dd className="mt-1">{selectedDatum.h.toFixed(0)}° / {selectedDatum.l.toFixed(0)}°</dd>
                </div>
                <div>
                  <dt className="text-[0.5625rem] uppercase tracking-[0.14em] text-white/45">Rain</dt>
                  <dd className="mt-1">{selectedDatum.p.toFixed(0)} mm</dd>
                </div>
                <div>
                  <dt className="text-[0.5625rem] uppercase tracking-[0.14em] text-white/45">Rain days</dt>
                  <dd className="mt-1">{selectedDatum.rd.toFixed(0)}</dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={() => addToCompare(selectedNode.slug)}
                disabled={compareResult !== "ready"}
                className={[
                  "mt-4 flex min-h-[44px] w-full items-center justify-center rounded-ut-pill border font-mono text-label uppercase tracking-[0.14em] transition-colors duration-[var(--ut-dur-fast)] motion-reduce:transition-none",
                  compareResult !== "ready"
                    ? "border-white/15 text-white/40"
                    : "border-white/30 text-white/90 hover:border-white/70",
                ].join(" ")}
              >
                {compareResult === "exists"
                  ? "In compare ✓"
                  : compareResult === "full"
                    ? "Compare full (3)"
                    : "+ Add to compare"}
              </button>
              <div className="mt-5 flex items-center justify-between gap-3">
                <p className="font-mono text-micro uppercase tracking-[0.14em] text-white/50">
                  {selectedNode.budget} / day
                </p>
                <Link
                  href={`/destinations/${selectedNode.slug}`}
                  className="inline-flex min-h-[44px] items-center rounded-ut-pill bg-ut-accent px-5 font-mono text-label uppercase tracking-[0.14em] text-white transition-colors duration-[var(--ut-dur-fast)] hover:bg-ut-accent-strong motion-reduce:transition-none"
                >
                  Open destination
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const AtlasNodeButton = memo(function AtlasNodeButton({
  node,
  month,
  vibe,
  selected,
  onHover,
  onSelect,
}: {
  node: AtlasNode;
  month: number;
  vibe: Vibe | null;
  selected: boolean;
  onHover: (slug: string | null) => void;
  onSelect: (slug: string) => void;
}) {
  const tier = node.tiers[month];
  const vs = nodeVisualState(tier, vibe, node.vibes, selected);
  const size = 14 * vs.scale;
  const isMatch = vibe !== null && vs.halo > 0;
  return (
    <button
      type="button"
      aria-label={`${node.city}, ${node.country} — ${TIER_WORD[tier]} in ${MONTHS[month]}${isMatch ? ` · ${vibe} match` : ""}`}
      aria-pressed={selected}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.slug);
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseEnter={() => onHover(node.slug)}
      onMouseLeave={() => onHover(null)}
      className="absolute z-[5] flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
      style={{
        left: `${node.x * 100}%`,
        top: `${node.y * 100}%`,
      }}
    >
      <span
        aria-hidden="true"
        className="block rounded-full transition-[width,height,opacity,box-shadow] duration-300 ease-ut-out motion-reduce:transition-none"
        style={{
          width: `calc(${size}px / var(--k, 1))`,
          height: `calc(${size}px / var(--k, 1))`,
          background: vs.halo > 0 ? "#ffffff" : tier === "quiet" ? "rgba(245,243,236,0.3)" : "rgba(245,243,236,0.8)",
          opacity: vs.opacity,
          boxShadow:
            vs.halo > 0
              ? `0 0 calc(${8 + vs.halo * 16}px / var(--k, 1)) calc(${vs.halo * 3}px / var(--k, 1)) rgba(255, 214, 150, ${vs.halo * 0.6})`
              : "none",
        }}
      />
    </button>
  );
});


function VibeLensChip({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={[
        "min-h-[44px] border-b pb-0.5 font-mono text-[0.625rem] uppercase tracking-[0.18em] transition-colors duration-[var(--ut-dur-fast)] motion-reduce:transition-none",
        selected
          ? "border-ut-accent text-white"
          : "border-transparent text-white/45 hover:border-white/40 hover:text-white/80",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

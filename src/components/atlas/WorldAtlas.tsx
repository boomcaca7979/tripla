"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import CompareTray from "./CompareTray";
import DestinationSearchBox from "./DestinationSearchBox";
import GlobePreview from "./GlobePreview";
import type { DestinationSearchDoc } from "@/lib/atlas/destination-search";
import { COMPARE_MAX, useAtlasStore } from "@/components/destination/vibe-store";
import { trackEvent } from "@/lib/analytics";
import { VIBE_ORDER, type NodeTier, type Vibe } from "@/lib/inner-state";
import type { EarthHover, EarthNode, EarthSceneHandle } from "./globe/earth";

/**
 * Globe 引擎走 **dynamic import（ssr:false）**：maplibre-gl 全量运行时不进 /destinations
 * 的首屏客户端 bundle —— 页面布局 / 搜索 / 控件 / sr-only 链接先于地图引擎 hydration 与
 * 挂载；引擎 chunk 在浏览器空闲时加载，容器位置由 GlobePreview（纯 CSS 球面）先行占位。
 */
const MapLibreGlobeSurface = dynamic(() => import("./MapLibreGlobeSurface"), {
  ssr: false,
  loading: () => <GlobePreview visible />,
});

/**
 * WorldAtlas — /destinations 的"夜晚地球"（4.1 · GLOBE-FIRST）。
 *
 * 视觉层级（本轮重排）：
 *   1 导航栏（站点 Header，浮在地球上方）
 *   2 巨大的夜晚地球（占满整个剩余视口，可出血；尺寸由 globe/earth.ts 反推相机距离）
 *   3 地球空间标签（大洲常驻 + 重要城市常驻 + hover/选中城市）
 *   4 发光目的地节点（两档层级 + 深度衰减）
 *   5 极少量必要交互（左上一句标题 / 底部一条细控件 / 右上列表切换）
 *
 * 已删除的目录式 UI：底部筛选卡片、底部大面板、常驻 CompareTray 面板、常驻信息条。
 * Compare 功能未删除：它只在用户真的把目的地加入对比后才出现（CompareTray 空即不渲染），
 * 入口在列表视图行内与触摸钉住卡上。
 *
 * 产品定义不变：夜晚地球 → 145 真实节点 → hover 小卡 → 点击进入 /destinations/<slug>/。
 * SEO/无障碍不变：145 个 destination 链接始终存在于 DOM（地图视图 sr-only）。
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
  lat: number;
  lon: number;
  hero: string | null;
  vibes: Vibe[];
  tiers: NodeTier[];
  months: AtlasMonthDatum[];
  budget: string;
  bestTime: string;
  /** 站点精选（major destination）：节点更大一级 + 常驻城市标签 */
  major: boolean;
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** canonical tier → 节点亮度权重（真实适宜度，不是装饰） */
const EMPHASIS: Record<NodeTier, number> = { dominant: 1, secondary: 0.55, quiet: 0.22 };

const STORE_KEY = "utlas:globe:v1";

export default function WorldAtlas({ nodes }: { nodes: AtlasNode[] }) {
  const router = useRouter();
  // 首屏用确定性值（避免 SSR/客户端月份不一致导致 hydration 差异），挂载后校正为当前月
  const [month, setMonth] = useState(0);
  const [view, setView] = useState<"map" | "list">("map");
  const [hover, setHover] = useState<EarthHover | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [pinnedByTouch, setPinnedByTouch] = useState(false);
  const [globeFailed, setGlobeFailed] = useState<string | null>(null);
  const [scrubbing, setScrubbing] = useState(false);
  const [shellW, setShellW] = useState(1280);

  const vibe = useAtlasStore((s) => s.vibe);
  const setVibe = useAtlasStore((s) => s.setVibe);
  const compare = useAtlasStore((s) => s.compare);
  const addToCompare = useAtlasStore((s) => s.addToCompare);
  const removeFromCompare = useAtlasStore((s) => s.removeFromCompare);

  const shellRef = useRef<HTMLDivElement>(null);
  const globeHandle = useRef<EarthSceneHandle | null>(null);
  const monthTrackRef = useRef<HTMLDivElement>(null);
  const restoredRef = useRef(false);

  const coarse = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches,
    [],
  );

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setShellW(el.clientWidth));
    ro.observe(el);
    setShellW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // ── 节点：重要度（精选优先）+ 月份亮度 + vibe 可见性 ──────────────────
  const earthNodes = useMemo<EarthNode[]>(() => {
    // 数组顺序 = 标签优先级：精选目的地排前面（引擎按顺序做去重叠）
    const ordered = [...nodes].sort((a, b) => Number(b.major) - Number(a.major));
    return ordered.map((n) => ({
      slug: n.slug,
      city: n.city,
      country: n.country,
      lat: n.lat,
      lon: n.lon,
      emphasis: EMPHASIS[n.tiers[month]],
      visible: vibe === null || n.vibes.includes(vibe),
      importance: n.major ? 1 : 0,
    }));
  }, [nodes, month, vibe]);

  const bySlug = useMemo(() => new Map(nodes.map((n) => [n.slug, n])), [nodes]);

  // ── 目的地搜索（索引派生自当前 destination dataset，数量动态） ──────────
  const searchDocs = useMemo<DestinationSearchDoc[]>(
    () => nodes.map((n) => ({ slug: n.slug, city: n.city, country: n.country, region: n.region, lon: n.lon, lat: n.lat, major: n.major })),
    [nodes],
  );

  /** 搜索选择 = 平滑 flyTo 到该目的地 + 钉住 selected preview（复用既有钉住卡） */
  const onSearchSelect = useCallback((doc: DestinationSearchDoc) => {
    setPinned(doc.slug);
    setPinnedByTouch(true);
    globeHandle.current?.flyTo(doc.lon, doc.lat);
  }, []);

  const onSearchClear = useCallback(() => {
    setPinned(null);
    // 相机保持不动 —— 用户继续探索当前视角
  }, []);
  const hoveredNode = hover ? bySlug.get(hover.slug) ?? null : null;
  const pinnedNode = pinned ? bySlug.get(pinned) ?? null : null;
  const cardNode = hoveredNode ?? pinnedNode;

  const allVibes = useMemo(
    () => VIBE_ORDER.filter((v) => nodes.some((n) => n.vibes.includes(v))),
    [nodes],
  );

  // ── 持久化（月 / vibe / 对比清单） ────────────────────────────────────
  useEffect(() => {
    if (!restoredRef.current) return;
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify({ month, vibe, compare }));
    } catch {
      /* 私有模式：忽略 */
    }
  }, [month, vibe, compare]);

  useEffect(() => {
    const t = setTimeout(() => {
      let restored = false;
      try {
        const raw = sessionStorage.getItem(STORE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as { month?: number; vibe?: Vibe | null; compare?: string[] };
          if (typeof saved.month === "number" && saved.month >= 0 && saved.month <= 11) {
            setMonth(saved.month);
            restored = true;
          }
          if (saved.vibe !== undefined) setVibe((saved.vibe as Vibe | null) ?? null);
          if (Array.isArray(saved.compare)) {
            useAtlasStore.setState({
              compare: saved.compare.filter((s) => typeof s === "string").slice(0, COMPARE_MAX),
            });
          }
        }
      } catch {
        /* ignore */
      }
      // 没有历史选择时，默认落在"当前月份"（真实日历，不是写死的 January）
      if (!restored) setMonth(new Date().getMonth());
      restoredRef.current = true;
    }, 0);
    return () => clearTimeout(t);
  }, [setVibe]);

  // ── 交互回调 ─────────────────────────────────────────────────────────
  const openDestination = useCallback(
    (slug: string) => {
      trackEvent({ name: "atlas_destination_select", destination: slug, source: "atlas" });
      router.push(`/destinations/${slug}`);
    },
    [router],
  );

  const onNodeClick = useCallback(
    (slug: string, isTouch: boolean) => {
      // 桌面：点击节点 = 直接进入目的地内容页
      if (!isTouch) {
        openDestination(slug);
        return;
      }
      // 触摸：第一次 tap → 钉住小卡（Explore / Compare）；再 tap 同一个点 → 进入
      setPinnedByTouch(true);
      setPinned((cur) => {
        if (cur === slug) {
          openDestination(slug);
          return cur;
        }
        return slug;
      });
    },
    [openDestination],
  );

  const toggleCompare = useCallback(
    (slug: string) => {
      if (compare.includes(slug)) removeFromCompare(slug);
      else addToCompare(slug);
    },
    [compare, addToCompare, removeFromCompare],
  );

  // ── 月份拖轨（细控件，不是面板） ─────────────────────────────────────
  const scrubMonth = useCallback((clientX: number) => {
    const rect = monthTrackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const idx = Math.max(0, Math.min(11, Math.floor(((clientX - rect.left) / rect.width) * 12)));
    setMonth(idx);
  }, []);
  const onMonthDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setScrubbing(true);
    scrubMonth(e.clientX);
  };
  const onMonthMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (scrubbing) scrubMonth(e.clientX);
  };
  const onMonthUp = () => setScrubbing(false);

  useEffect(() => {
    if (!pinned) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPinned(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pinned]);

  const dockedCard = Boolean(pinned && (coarse || pinnedByTouch));
  const cardStyle: React.CSSProperties =
    dockedCard || !hover
      ? {}
      : {
          left: hover.x > shellW - 240 ? undefined : Math.round(hover.x + 18),
          right: hover.x > shellW - 240 ? Math.round(shellW - hover.x + 18) : undefined,
          top: Math.round(Math.max(72, hover.y - 34)),
        };

  const microBtn =
    "inline-flex h-7 min-w-[28px] items-center justify-center rounded-ut-sm border border-white/12 px-2 font-mono text-micro uppercase tracking-[0.14em] text-white/55 transition-colors duration-[var(--ut-dur-fast)] hover:border-white/35 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ut-accent";

  return (
    <div
      ref={shellRef}
      data-atlas-shell=""
      className="ut-deep-space relative h-[calc(100svh-4rem)] min-h-[520px] overflow-hidden text-[#eef4ff]"
    >
      {/* ── 地球（占满整个视口；WebGL 失败则降级为列表） ── */}
      {!globeFailed && view === "map" && (
        <div className="absolute inset-0">
          {/* 正式引擎：MapLibre Globe（map-test 已验证实现；契约见 EarthGlobe.tsx 的替换边界注释） */}
          <MapLibreGlobeSurface
            nodes={earthNodes}
            selectedSlug={pinned}
            onHover={setHover}
            onNodeClick={onNodeClick}
            onFailure={(reason) => {
              setGlobeFailed(reason);
              setView("list");
            }}
            onHandle={(h) => {
              globeHandle.current = h;
            }}
            basemapId="openfreemap-liberty"
            className="h-full w-full"
          />
        </div>
      )}

      {/* ── 顶部：页面文档结构用 sr-only h1（视觉不做 Hero 标题）+ 右上切换与搜索 ──
          Stage 4：左上是**页面级轻量导航**（Collections → /guides, /trips），
          让地球 Hub 有通往 Guides / Trips 的内容入口。它是同一行 chrome 里的两个
          文字链接（不是面板、不是卡片、不加控件），md 以下隐藏（移动端改用
          列表视图顶部的内容级入口），因此不改变"地球是唯一主角"的视觉层级。 */}
      <div className="pointer-events-none absolute inset-x-0 top-6 z-20 flex items-start justify-between gap-3 px-4 md:px-8">
        <h1 className="sr-only">Destinations — global destination discovery map</h1>
        <nav
          aria-label="Related collections"
          className="pointer-events-auto hidden flex-col gap-1.5 md:flex"
        >
          <span className="font-mono text-micro uppercase tracking-[0.18em] text-white/35">
            Collections
          </span>
          <span className="flex flex-wrap items-center gap-x-3">
            <Link
              href="/guides"
              className="font-mono text-micro uppercase tracking-[0.14em] text-white/60 underline decoration-white/20 underline-offset-4 transition-colors duration-[var(--ut-dur-fast)] hover:text-white focus-visible:outline-2 focus-visible:outline-ut-accent"
            >
              Travel guides
            </Link>
            <span aria-hidden="true" className="font-mono text-micro text-white/20">
              ·
            </span>
            <Link
              href="/trips"
              className="font-mono text-micro uppercase tracking-[0.14em] text-white/60 underline decoration-white/20 underline-offset-4 transition-colors duration-[var(--ut-dur-fast)] hover:text-white focus-visible:outline-2 focus-visible:outline-ut-accent"
            >
              Ready-made trips
            </Link>
          </span>
        </nav>
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={() => setView((v) => (v === "map" ? "list" : "map"))}
            aria-pressed={view === "list"}
            className={microBtn}
          >
            {view === "map" ? "List" : "Map"}
          </button>
          <DestinationSearchBox docs={searchDocs} onSelect={onSearchSelect} onClear={onSearchClear} />
        </div>
      </div>

      {/* ── Hover / 触摸 小提示卡：轻，不是 dashboard ── */}
      {cardNode && (
        <div
          data-atlas-card=""
          className={[
            "absolute z-30 w-[196px] max-w-[calc(100vw-2rem)] rounded-ut-md",
            "border border-white/10 bg-[#080d18]/80 p-2.5 backdrop-blur-md",
            dockedCard ? "bottom-24 left-1/2 -translate-x-1/2" : "",
          ].join(" ")}
          style={cardStyle}
        >
          <p className="font-display text-body-lg leading-none text-white">{cardNode.city}</p>
          <p className="mt-1 font-mono text-micro uppercase tracking-[0.16em] text-white/45">
            {cardNode.country}
          </p>
          <dl className="mt-2 space-y-0.5 font-mono text-micro leading-[1.5] text-white/60">
            <div className="flex gap-2">
              <dt className="shrink-0 text-white/35">Best</dt>
              <dd className="truncate">{cardNode.bestTime || "Year-round"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0 text-white/35">Budget</dt>
              <dd>{cardNode.budget}</dd>
            </div>
          </dl>
          {cardNode.vibes.length > 0 && (
            <p className="mt-1.5 font-mono text-micro uppercase tracking-[0.14em] text-white/35">
              {cardNode.vibes.slice(0, 4).join(" · ")}
            </p>
          )}
          {dockedCard && (
            <div className="mt-2.5 flex items-center gap-1.5">
              <Link
                href={`/destinations/${cardNode.slug}`}
                onClick={() => trackEvent({ name: "atlas_destination_select", destination: cardNode.slug, source: "atlas" })}
                className="inline-flex min-h-[32px] flex-1 items-center justify-center rounded-ut-sm bg-white/90 px-2 text-body-sm font-medium text-[#080d18]"
              >
                Explore
              </Link>
              <button
                type="button"
                onClick={() => toggleCompare(cardNode.slug)}
                aria-pressed={compare.includes(cardNode.slug)}
                className="min-h-[32px] rounded-ut-sm border border-white/20 px-2 font-mono text-micro uppercase tracking-[0.12em] text-white/65"
              >
                {compare.includes(cardNode.slug) ? "In" : "Compare"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── 底部：一条细控件（月份 / vibe / 缩放），不是面板 ── */}
      <div className="absolute inset-x-0 bottom-3 z-20 flex items-end justify-between gap-4 px-4 md:px-8">
        <div className="flex items-center gap-3">
          <span className="font-mono text-micro uppercase tracking-[0.2em] text-white/45">
            {MONTHS[month]}
          </span>
          <div
            ref={monthTrackRef}
            role="slider"
            aria-label="Month"
            aria-valuemin={1}
            aria-valuemax={12}
            aria-valuenow={month + 1}
            aria-valuetext={MONTHS_LONG[month]}
            tabIndex={0}
            onPointerDown={onMonthDown}
            onPointerMove={onMonthMove}
            onPointerUp={onMonthUp}
            onPointerCancel={onMonthUp}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") setMonth((m) => Math.max(0, m - 1));
              if (e.key === "ArrowRight") setMonth((m) => Math.min(11, m + 1));
            }}
            className="relative h-[3px] w-[104px] cursor-pointer rounded-ut-pill bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ut-accent md:w-[132px]"
          >
            <span
              aria-hidden="true"
              className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/85"
              style={{ left: `${((month + 0.5) / 12) * 100}%` }}
            />
          </div>
          <span className="hidden font-mono text-micro text-white/30 sm:inline">
            {MONTHS_LONG[month]}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="atlas-vibe">
            Vibe filter
          </label>
          <select
            id="atlas-vibe"
            value={vibe ?? ""}
            onChange={(e) => setVibe((e.target.value || null) as Vibe | null)}
            className="h-7 rounded-ut-sm border border-white/12 bg-transparent px-1.5 font-mono text-micro uppercase tracking-[0.14em] text-white/55 transition-colors hover:border-white/35 hover:text-white focus-visible:outline-2 focus-visible:outline-ut-accent"
          >
            <option value="">All vibes</option>
            {allVibes.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => globeHandle.current?.zoomBy(0.85)} aria-label="Zoom in" className={microBtn}>
            +
          </button>
          <button type="button" onClick={() => globeHandle.current?.zoomBy(1.18)} aria-label="Zoom out" className={microBtn}>
            −
          </button>
          <button type="button" onClick={() => globeHandle.current?.resetView()} className={microBtn}>
            Reset
          </button>
        </div>
      </div>

      {globeFailed && (
        <p className="absolute inset-x-0 bottom-12 z-20 px-4 text-center font-mono text-micro uppercase tracking-[0.14em] text-white/45 md:px-8">
          3D globe unavailable{globeFailed ? ` (${globeFailed})` : ""} — showing the full
          destination list.
        </p>
      )}

      {/*
        145 个目的地链接：**始终存在于 DOM**
        · 地图视图下视觉隐藏（sr-only）但保留语义 —— 键盘可达 / 读屏可读 / 爬虫可索引；
        · 列表视图下作为正式浏览方式，也是 WebGL 不可用时的降级界面。
        这不是 cloaking：内容对键盘与读屏用户完全可用，只是视觉上让位给地球。
      */}
      <section
        aria-label="All destinations"
        className={
          view === "list"
            ? "ut-deep-space absolute inset-0 z-10 overflow-y-auto px-4 pb-20 pt-24 md:px-8"
            : "sr-only"
        }
      >
        {view === "list" && (
          <h2 className="font-display text-h2 text-white">All {nodes.length} destinations</h2>
        )}
        {/* Stage 4：列表视图里的内容级入口（移动端在 md 以下没有顶部 Collections，
            这里补上；地图视图下本 section 为 sr-only，链接仍在 DOM 中可被爬取）。 */}
        {view === "list" && (
          <p className="mt-3 font-mono text-micro uppercase tracking-[0.14em] text-white/45">
            <Link
              href="/guides"
              className="underline decoration-white/20 underline-offset-4 transition-colors hover:text-white"
            >
              Travel guides
            </Link>
            <span aria-hidden="true" className="mx-2 text-white/20">
              ·
            </span>
            <Link
              href="/trips"
              className="underline decoration-white/20 underline-offset-4 transition-colors hover:text-white"
            >
              Ready-made trips
            </Link>
          </p>
        )}
        <ul className={view === "list" ? "mt-6 divide-y divide-white/10 border-y border-white/10" : ""}>
          {nodes.map((n) => (
            <li key={n.slug} className={view === "list" ? "flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3" : ""}>
              <Link
                href={`/destinations/${n.slug}`}
                onClick={() => trackEvent({ name: "atlas_destination_select", destination: n.slug, source: "atlas" })}
                className={view === "list" ? "font-display text-h3 text-white transition-colors hover:text-ut-accent" : ""}
              >
                {n.city}, {n.country}
              </Link>
              {view === "list" && (
                <>
                  <span className="font-mono text-micro uppercase tracking-[0.14em] text-white/40">
                    {n.bestTime || "Year-round"}
                  </span>
                  <span className="font-mono text-micro uppercase tracking-[0.14em] text-white/30">
                    {n.budget}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleCompare(n.slug)}
                    aria-pressed={compare.includes(n.slug)}
                    className="ml-auto min-h-[32px] rounded-ut-pill border border-white/20 px-3 font-mono text-micro uppercase tracking-[0.14em] text-white/55 transition-colors hover:border-white/50 hover:text-white focus-visible:outline-2 focus-visible:outline-ut-accent"
                  >
                    {compare.includes(n.slug) ? "In compare" : "Compare"}
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Compare 只在用户真的加入对比后出现（空即不渲染），不再是常驻视觉组成 */}
      <CompareTray nodes={nodes} month={month} />
    </div>
  );
}

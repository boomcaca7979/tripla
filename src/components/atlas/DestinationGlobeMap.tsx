"use client";

/**
 * DestinationGlobeMap — /destinations 的 **MapLibre globe 引擎验证件**。
 *
 * 分层（本轮核心架构约定）：
 *   · **Map Engine**  = `@/lib/atlas/map-engine`（MapLibre 初始化 / WebGL 降级阶梯 /
 *                       globe 投影 / 深空外观 / 尺寸反解 / hover 门控 / 诊断）。移植自 OSIRIS。
 *   · **Basemap Provider** = `@/lib/atlas/basemap`（只吃一份 StyleSpecification）。
 *                       本轮只注册占位 provider，**不连任何外部底图**。
 *   · **UTRIPLA 业务** = 本文件（节点 GeoJSON / hover 卡 / click 路由 / 无障碍链接层）。
 *
 * 数据：节点**完全由 props 的 FeatureCollection 驱动** —— 本文件里没有写死的数量、
 * 没有逐 destination 的 React 组件、没有逐 destination 的请求。往 props 里多塞数据
 * 就多出节点，目标是一路吃到 1000+ 都不用改本文件。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { GeoJSONSource, Map as MlMap, MapOptions } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  applyBasemapLayerPolicy,
  attachMapDiagnostics,
  applyDeepSpaceLook,
  createGlobeMap,
  createHoverGate,
  fitGlobeToViewport,
  pickPointFeature,
  HOME_CENTER,
  MAPLIBRE_VERSION,
} from "@/lib/atlas/map-engine";
import { loadBasemapStyle, resolveBasemapProvider } from "@/lib/atlas/basemap";
import GlobeControls from "./GlobeControls";
import DestinationSearchBox from "./DestinationSearchBox";
import {
  buildDestinationSearchIndex,
   type DestinationSearchDoc,
} from "@/lib/atlas/destination-search";
export interface GlobeDestinationProperties {
  slug: string;
  city: string;
  country: string;
  region: string;
  bestTime: string;
  budget: string;
  major: boolean;
  vibes: string[];
}

export interface GlobeFeatureCollection {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: { type: "Point"; coordinates: [number, number] };
    properties: GlobeDestinationProperties;
  }>;
}

export interface DestinationGlobeMapProps {
  destinations: GlobeFeatureCollection;
  /** 底图 provider id；缺省为占位 provider（无外部底图）。 */
  basemapId?: string;
  /** 底图凭证；由**页面**从环境变量读出后传入。组件与 provider 都不读 env。 */
  basemapCredential?: string;
  /** 地球直径 / 容器高。>1 表示上下出血（"巨大地球"）。 */
  globeFraction?: number;
}

interface HoverState extends GlobeDestinationProperties {
  x: number;
  y: number;
}

const SOURCE_ID = "utripla-destinations";
const LAYER_GLOW = "utripla-destinations-glow";
const LAYER_DOTS = "utripla-destinations-dots";
const LAYER_HOVER = "utripla-destinations-hover";
const LAYER_SELECTED = "utripla-destinations-selected";

/** `setData` 的入参类型（避免依赖全局 GeoJSON 命名空间的可见性）。 */
type SourceData = Parameters<GeoJSONSource["setData"]>[0];

export default function DestinationGlobeMap({
  destinations,
  basemapId,
  basemapCredential,
  globeFraction = 1.22,
}: DestinationGlobeMapProps) {
  const router = useRouter();
  const shellRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const userMovedRef = useRef(false);
  const featuresRef = useRef(destinations.features);
  // ref 只在 effect 里写（React 禁止在 render 期间改 ref）
  useEffect(() => { featuresRef.current = destinations.features; }, [destinations.features]);

  const [mapInstance, setMapInstance] = useState<MlMap | null>(null);
  const [hover, setHover] = useState<HoverState | null>(null);
  const [shellW, setShellW] = useState(1280);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  /** 底图状态：ok = 真实底图在线加载成功；degraded = 已降级为占位球面（见 basemap.ts） */
  const [basemapDegraded, setBasemapDegraded] = useState(false);
  const [basemapNote, setBasemapNote] = useState<string | null>(null);

  /** 搜索定位选中的目的地（带坐标，供卡片跟随投影） */
  const [selected, setSelected] = useState<(GlobeDestinationProperties & { lon: number; lat: number }) | null>(null);
  const [selPos, setSelPos] = useState<{ x: number; y: number } | null>(null);

  const selectedRef = useRef<(GlobeDestinationProperties & { lon: number; lat: number }) | null>(null);
  useEffect(() => { selectedRef.current = selected; }, [selected]);

  // 索引从**当前 destination dataset** 派生（145 → 1000+ 自动跟随，无第二套数据）
  const searchIndex = useMemo(
    () => buildDestinationSearchIndex(destinations.features),
    [destinations.features],
  );
  const provider = useMemo(() => resolveBasemapProvider(basemapId), [basemapId]);

  // ── 引擎：只创建一次（style 先在运行时在线取回，失败则降级为占位球面） ──
  useEffect(() => {
    const container = containerRef.current;
    const shell = shellRef.current;
    if (!container || !shell || mapRef.current) return;

    let disposed = false;

    const boot = async () => {
      const loaded = await loadBasemapStyle(provider, { credential: basemapCredential });
      if (disposed) return;
      setBasemapDegraded(loaded.degraded);
      setBasemapNote(loaded.reason ?? null);
      if (loaded.degraded) {
        // 降级原因必须可见可查，但不能中断 globe / 节点 / 链接层
        console.warn("[utripla/globe] basemap degraded:", loaded.reason);
      }

      const map = createGlobeMap({
        container,
        // provider 层是 maplibre-free 的（见 basemap.ts 头注释），在此与引擎类型对接
        style: loaded.style as unknown as MapOptions["style"],
        center: HOME_CENTER,
        zoom: 1.2,
      });
      if (!map) { setStatus("failed"); return; }
      mapRef.current = map;
      registerMap(map);
    };

    const registerMap = (map: MlMap) => {
      const onLoad = () => {
      if (disposed) return;
      applyDeepSpaceLook(map);

      // 供应商自有调色（浅色样式 → 深空科技黑），在节点加入前执行
      provider.restyle?.(map);

      // 底图图层策略：provider 声明要隐藏的前缀（道路/POI/楼宇…），引擎执行。
      // 只压底图噪音 —— 水系/海岸/边界/地名保留，"真实地图可辨认，但不喧宾夺主"。
      const hiddenLayers = applyBasemapLayerPolicy(map, provider.hideLayerPrefixes);
      if (hiddenLayers > 0 && process.env.NODE_ENV === "development") {
        console.info(`[utripla/globe] basemap policy: hid ${hiddenLayers} layers`);
      }

      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: { type: "FeatureCollection", features: featuresRef.current } as unknown as SourceData,
      });

      // 柔光晕：大半径 + 低不透明度 + blur；普通目的地比 major 弱一档
      map.addLayer({
        id: LAYER_GLOW,
        type: "circle",
        source: SOURCE_ID,
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"],
            0, ["case", ["get", "major"], 9, 6.5],
            6, ["case", ["get", "major"], 16, 11]],
          "circle-color": ["case", ["get", "major"], "#ffd9a0", "#cfe0f5"],
          "circle-opacity": ["case", ["get", "major"], 0.26, 0.16],
          "circle-blur": 1,
        },
      });

      // 节点本体：两档层级（major 更大更亮），避免密集处糊成一片
      map.addLayer({
        id: LAYER_DOTS,
        type: "circle",
        source: SOURCE_ID,
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"],
            0, ["case", ["get", "major"], 4.2, 2.6],
            6, ["case", ["get", "major"], 7.5, 4.4]],
          "circle-color": ["case", ["get", "major"], "#ffeccd", "#e8f0fb"],
          "circle-opacity": ["case", ["get", "major"], 0.98, 0.72],
          "circle-stroke-width": 0.6,
          "circle-stroke-color": "#0a1018",
          "circle-stroke-opacity": 0.5,
        },
      });

      // hover 高亮环：切 filter，不重建图层
      map.addLayer({
        id: LAYER_HOVER,
        type: "circle",
        source: SOURCE_ID,
        filter: ["==", ["get", "slug"], ""],
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 0, 12, 6, 22],
          "circle-color": "#ffd9a0",
          "circle-opacity": 0.18,
          "circle-blur": 1,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#ffeccd",
          "circle-stroke-opacity": 0.8,
        },
      });

      // selected 高亮环（搜索定位后）：比 hover 更明显，持续到清除/换目标
      map.addLayer({
        id: LAYER_SELECTED,
        type: "circle",
        source: SOURCE_ID,
        filter: ["==", ["get", "slug"], ""],
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 0, 20, 6, 34],
          "circle-color": "#ffce8a",
          "circle-opacity": 0.16,
          "circle-blur": 1,
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#ffdfae",
          "circle-stroke-opacity": 0.95,
        },
      });

      // 巨大地球：反解 zoom，使直径 ≈ globeFraction × 容器高
      fitGlobeToViewport(map, globeFraction);

      // ── hover（门控照搬 OSIRIS：rAF + 100ms 限流，相机运动中跳过） ──
      const gate = createHoverGate();
      const setHighlight = (slug: string) =>
        map.setFilter(LAYER_HOVER, ["==", ["get", "slug"], slug]);

      // 注意：用的是**地图级** mousemove + 自建拾取，而不是图层级事件 /
      // queryRenderedFeatures —— 后者在 globe 投影下对边缘瓦片不可靠（见 pickDestination）。
      map.on("mousemove", (e) => {
        if (map.isMoving()) return;
        const point = { x: e.point.x, y: e.point.y };
        gate(() => {
          const hit = pickPointFeature(map, featuresRef.current, point)?.properties ?? null;
          map.getCanvas().style.cursor = hit ? "pointer" : "";
          setHighlight(hit?.slug ?? "");
          setHover(hit ? { ...hit, x: point.x, y: point.y } : null);
        });
      });

      map.on("mouseout", () => {
        map.getCanvas().style.cursor = "";
        setHighlight("");
        setHover(null);
      });

      // ── click：命中 UTRIPLA 节点 → 走既有 destination route ──
      map.on("click", (e) => {
        const hit = pickPointFeature(map, featuresRef.current, { x: e.point.x, y: e.point.y })?.properties ?? null;
        if (hit?.slug) router.push(`/destinations/${hit.slug}`);
      });

      // 用户动过视角后不再自动重设尺寸（避免"追移动目标"）
      map.on("dragstart", () => { userMovedRef.current = true; });

      // selected 节点的卡片跟随：仅当选中态存在时每帧投影一次（单次 project，很便宜）
      map.on("move", () => {
        const sel = selectedRef.current;
        if (!sel) return;
        const p = map.project([sel.lon, sel.lat]);
        setSelPos({ x: p.x, y: p.y });
      });

      // 开发期把地图实例挂到 window（照搬 OSIRIS 的 `__osirisMap` 做法）：
      // 交互验证时可以 map.project([lon,lat]) 拿到节点精确屏幕坐标，
      // 用真实鼠标事件去打，而不是靠网格盲扫。生产构建不会执行这段。
      if (process.env.NODE_ENV === "development") {
        (window as unknown as { __utriplaGlobe?: MlMap }).__utriplaGlobe = map;
      }

      const stopDiagnostics = attachMapDiagnostics(map, shell, () => ({
        engine: `MapLibre GL JS ${MAPLIBRE_VERSION}`,
        basemap: provider.id,
        nodes: featuresRef.current.length,
        globeHeightRatio: globeFraction,
      }));

      const ro = new ResizeObserver(() => {
        setShellW(container.clientWidth);
        if (!userMovedRef.current) fitGlobeToViewport(map, globeFraction);
        else map.resize();
      });
      ro.observe(container);

      setStatus("ready");
      setMapInstance(map);
      cleanupRef.current = () => {
        ro.disconnect();
        stopDiagnostics();
      };
    };

    // 瓦片级错误计数：key 失效 / 网络不通时给用户一个可见信号，而不是静默花屏
    let mapErrors = 0;
    map.on("error", (e) => {
      mapErrors += 1;
      console.error("[utripla/globe] map error:", e);
      if (mapErrors === 8) {
        setBasemapNote((n) => n ?? "Map tiles keep failing — check token / network");
      }
    });
    map.on("load", onLoad);
  };

    void boot();

    return () => {
      disposed = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
      const m = mapRef.current;
      mapRef.current = null;
      if (m) { try { m.remove(); } catch { /* 已移除 */ } }
    };
    // 引擎只创建一次；provider 与数据变化走下面的 setData / props
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // destinations 变化 → 只 setData，不重建地图（未来增量数据无需改代码）
  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== "ready") return;
    const src = map.getSource(SOURCE_ID) as GeoJSONSource | undefined;
    if (src) src.setData(destinations as unknown as SourceData);
  }, [destinations, status]);

  const resetView = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    userMovedRef.current = false;
    map.easeTo({ center: HOME_CENTER, bearing: 0, pitch: 0, duration: 500 });
    window.setTimeout(() => { if (mapRef.current) fitGlobeToViewport(map, globeFraction); }, 520);
  }, [globeFraction]);

  // ── 搜索定位：平滑 flyTo（"环球定位"的手感），不是瞬移 ──
  const selectDestination = useCallback((doc: DestinationSearchDoc) => {
    const map = mapRef.current;
    const feature = featuresRef.current.find((x) => x.properties.slug === doc.slug);
    if (!feature) return;
    userMovedRef.current = true; // 搜索接管视角后，尺寸自适配不再覆盖
    setSelected({ ...feature.properties, lon: doc.lon, lat: doc.lat });
    if (map) {
      map.flyTo({ center: [doc.lon, doc.lat], duration: 2200, essential: true, curve: 1.3 });
      map.setFilter(LAYER_SELECTED, ["==", ["get", "slug"], doc.slug]);
    }
  }, []);

  // 清除：结果/选中态清掉，**相机不动** —— 用户继续探索当前视角
  const clearSearch = useCallback(() => {
    setSelected(null);
    selectedRef.current = null;
    mapRef.current?.setFilter(LAYER_SELECTED, ["==", ["get", "slug"], ""]);
  }, []);

  // 卡片：hover 优先；无 hover 但有搜索选中态时，显示选中的目的地（跟随节点投影）
  const card = hover
    ? hover
    : selected && selPos
      ? { ...selected, x: selPos.x, y: selPos.y }
      : null;

  const cardLeft = card ? Math.min(Math.max(card.x + 16, 8), Math.max(8, shellW - 216)) : 0;
  const cardTop = card ? Math.max(card.y - 12, 84) : 0;

  return (
    <div
      ref={shellRef}
      data-maplibre-globe=""
      // 页面空间背景（globe 外面）：暖炭灰，与导航栏同族；MapLibre sky 用 UTRIPLA_SPACE_PALETTE
      className="ut-globe-space relative h-[calc(100svh-4rem)] min-h-[520px] overflow-hidden text-[#eef4ff]"
    >
      {/*
        注意：MapLibre 会给自己接管的容器加 `.maplibregl-map { position: relative }`，
        这会盖掉 Tailwind 的 `absolute`（同权重、按样式表顺序决胜）→ 容器高度塌成 0、
        canvas 停在库默认的 300px。所以**不要让 MapLibre 直接接管定位容器**：
        外面这一层由我们定位，里面那层只负责撑满。
      */}
      <div className="absolute inset-0">
        <div ref={containerRef} className="h-full w-full" />
      </div>

      {/* 顶部：极简标题 + 相机控件（视线交给地球，不放面板） */}
      {/* 左上角标题组已按需求整体删除（非隐藏）：左上区域即地图/空间背景 */}
      <div className="pointer-events-none absolute inset-x-0 top-6 z-20 flex justify-end px-4 md:px-8">
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <GlobeControls map={mapInstance} />

          {/* 轻量搜索：共享控件（DestinationSearchBox），索引派生自 destination dataset */}
          <DestinationSearchBox docs={searchIndex} onSelect={selectDestination} onClear={clearSearch} />
        </div>
      </div>

      {/* hover / 搜索选中共用同一张小卡：跟随节点、靠边翻转、绝不遮满屏 */}
      {card && (
        <div
          data-globe-card=""
          className="pointer-events-none absolute z-30 w-[200px] rounded-ut-md border border-white/10 bg-[#080d18]/85 p-2.5 backdrop-blur-md"
          style={{ left: cardLeft, top: cardTop }}
        >
          <p className="font-display text-body-lg leading-none text-white">{card.city}</p>
          <p className="mt-1 font-mono text-micro uppercase tracking-[0.16em] text-white/45">
            {card.country}
            {card.region ? ` · ${card.region}` : ""}
          </p>
          <dl className="mt-2 space-y-0.5 font-mono text-micro leading-[1.5] text-white/60">
            <div className="flex gap-2">
              <dt className="shrink-0 text-white/35">Best</dt>
              <dd className="truncate">{card.bestTime || "Year-round"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0 text-white/35">Budget</dt>
              <dd>{card.budget}</dd>
            </div>
          </dl>
          {card.vibes.length > 0 && (
            <p className="mt-1.5 font-mono text-micro uppercase tracking-[0.14em] text-white/35">
              {card.vibes.slice(0, 4).join(" · ")}
            </p>
          )}
        </div>
      )}

      {/* 底部一条细状态行（不是面板） */}
      <div className="absolute inset-x-0 bottom-3 z-20 flex items-end justify-between gap-4 px-4 md:px-8">
        <div className="flex flex-col gap-1">
          {status === "loading" && (
            <p className="font-mono text-micro uppercase tracking-[0.14em] text-white/40">
              Loading globe engine…
            </p>
          )}
          {status === "failed" && (
            <p className="font-mono text-micro uppercase tracking-[0.14em] text-red-300/80">
              WebGL unavailable — globe engine could not start
            </p>
          )}
          {basemapDegraded && (
            <p className="max-w-[560px] font-mono text-micro uppercase leading-[1.6] tracking-[0.14em] text-amber-200/70">
              Map unavailable — {basemapNote ?? "basemap not loaded"}. Globe &amp; destinations still
              work.
            </p>
          )}
          {!basemapDegraded && provider.id === "none" && (
            <p className="font-mono text-micro uppercase tracking-[0.14em] text-white/30">
              Basemap provider not configured — engine + destinations only
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={resetView}
          className="h-7 rounded-ut-sm border border-white/12 px-2 font-mono text-micro uppercase tracking-[0.14em] text-white/55 transition-colors hover:border-white/35 hover:text-white"
        >
          Reset
        </button>
      </div>

      {/* 无障碍 / SEO：destination 链接**始终在 DOM**（地图视图 sr-only，爬虫与读屏可达） */}
      <nav aria-label="All destinations" className="sr-only">
        <ul>
          {destinations.features.map((f) => (
            <li key={f.properties.slug}>
              <a href={`/destinations/${f.properties.slug}`}>
                {f.properties.city}, {f.properties.country}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* 底图署名（占位 provider 无外部数据，因此为空） */}
      {provider.attribution && (
        <p className="absolute bottom-0 right-2 z-20 font-mono text-[9px] leading-none text-white/35">
          {provider.attribution}
        </p>
      )}
    </div>
  );
}

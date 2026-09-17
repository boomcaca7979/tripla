"use client";

/**
 * MapLibreGlobeSurface — /destinations 的 **MapLibre Globe 地图实现**。
 *
 * 这是 EarthGlobe（Three.js）替换边界契约的 MapLibre 实现（props 完全一致）：
 *   nodes / selectedSlug / onHover / onNodeClick / onFailure / onHandle / onReady / className
 * 页面骨架（DestinationSearchBox / 钉住 preview / CompareTray / sr-only links）
 * 不属于本组件 —— 引擎替换时它们零改动。
 *
 * 复用自 map-test 已验证实现（禁止重写）：
 *   · 引擎装配 / WebGL 降级阶梯 / globe 投影 / 尺寸反解 —— map-engine.ts
 *   · Basemap Provider（默认 OpenFreeMap Liberty，运行时在线加载，无下载无代理无缓存）
 *   · worker 自托管（scripts/prepare-map-worker.mjs → public/vendor/maplibre/6.9.0/）
 *   · 自建拾取 pickPointFeature（globe 模式下 queryRenderedFeatures 不可靠）
 *   · hover 门控 / click / flyTo handle
 *
 * 与 EarthGlobe 的行为对应：
 *   · nodes 变更（月份/月份适宜度/vibe lens）→ GeoJSON setData（不重建地图）
 *   · emphasis → 节点半径权重；visible=false → vibe lens 淡出（图层 filter）
 *   · selectedSlug → selected halo 环（filter 切换）
 *   · onNodeClick(slug, isTouch) —— isTouch 来自指针类型，语义与 Three.js 版一致
 *   · 失败（WebGL 不可用）→ onFailure，不白屏
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { FilterSpecification, GeoJSONSource, Map as MlMap, MapOptions } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { EarthHover, EarthNode, EarthSceneHandle } from "./globe/earth";
import GlobePreview from "./GlobePreview";
import {
  applyBasemapLayerPolicy,
  applyDeepSpaceLook,
  createGlobeMap,
  createHoverGate,
  fitGlobeToViewport,
  pickPointFeature,
  HOME_CENTER,
  MAPLIBRE_VERSION,
} from "@/lib/atlas/map-engine";
import {
  isBasemapConfigured,
  loadBasemapStyle,
  placeholderStyle,
  resolveBasemapProvider,
} from "@/lib/atlas/basemap";

export interface MapLibreGlobeSurfaceProps {
  nodes: EarthNode[];
  selectedSlug: string | null;
  onHover: (hover: EarthHover | null) => void;
  onNodeClick: (slug: string, isTouch: boolean) => void;
  onFailure: (reason: string) => void;
  onHandle: (handle: EarthSceneHandle | null) => void;
  onReady?: () => void;
  /** 底图 provider id；生产默认 OpenFreeMap Liberty（map-test 已验证），未来切 MapTiler 只改这里 */
  basemapId?: string;
  basemapCredential?: string;
  /** 地球直径 / 容器高（>1 出血） */
  globeFraction?: number;
  className?: string;
}

const SOURCE_ID = "utripla-destinations";
const LAYER_GLOW = "utripla-destinations-glow";
const LAYER_DOTS = "utripla-destinations-dots";
const LAYER_HOVER = "utripla-destinations-hover";
const LAYER_SELECTED = "utripla-destinations-selected";

type SourceData = Parameters<GeoJSONSource["setData"]>[0];

/** EarthNode[] → GeoJSON FeatureCollection（引擎数据只含地图侧字段） */
function toFeatureCollection(nodes: EarthNode[]) {
  return {
    type: "FeatureCollection" as const,
    features: nodes.map((n) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [n.lon, n.lat] as [number, number] },
      properties: {
        slug: n.slug,
        city: n.city,
        country: n.country,
        major: n.importance === 1,
        emphasis: n.emphasis,
        visible: n.visible,
      },
    })),
  };
}

const VISIBLE_FILTER = ["==", ["get", "visible"], true] as unknown as FilterSpecification;
const slugVisibleFilter = (slug: string) =>
  ["all", ["==", ["get", "slug"], slug], ["==", ["get", "visible"], true]] as unknown as FilterSpecification;
/** EarthNode[] → 拾取入参（geometry 包一层，properties 只留拾取所需字段） */
const toPickable = (nodes: EarthNode[]) =>
  nodes.map((n) => ({
    geometry: { coordinates: [n.lon, n.lat] as [number, number] },
    properties: { slug: n.slug, major: n.importance === 1 },
  }));

export default function MapLibreGlobeSurface({
  nodes,
  selectedSlug,
  onHover,
  onNodeClick,
  onFailure,
  onHandle,
  onReady,
  basemapId,
  basemapCredential,
  globeFraction = 1.22,
  className = "",
}: MapLibreGlobeSurfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const userMovedRef = useRef(false);

  // props → ref（引擎只创建一次，后续走 update/setSelected）
  const nodesRef = useRef(nodes);
  const selectedRef = useRef(selectedSlug);
  const fractionRef = useRef(globeFraction);
  const cbRef = useRef({ onHover, onNodeClick, onFailure, onHandle, onReady });
  useEffect(() => {
    nodesRef.current = nodes;
    selectedRef.current = selectedSlug;
    fractionRef.current = globeFraction;
    cbRef.current = { onHover, onNodeClick, onFailure, onHandle, onReady };
  });

  const [mapInstance, setMapInstance] = useState<MlMap | null>(null);
  const [ready, setReady] = useState(false);

  const provider = useMemo(() => resolveBasemapProvider(basemapId), [basemapId]);
  const configured = isBasemapConfigured(provider, { credential: basemapCredential });

  // ── 引擎：只创建一次 ──
  //
  // 首屏启动采用**两阶段 boot**（Time-to-First-Visible-Globe 优化，视觉最终态不变）：
  //   Stage A（关键路径，零网络）：用本地占位 style 立即创建地图 → 深空外观 + 节点层 +
  //     交互全部就绪 —— 球体在第一帧就可见、可拖、可 hover/click，不等任何网络请求。
  //   Stage B（非关键路径，异步）：在线拉取真实底图 style，到位后 setStyle 无缝替换；
  //     setStyle 会整体重置 style（含 sky/projection），因此在新 style 首帧渲染前
  //     重新应用深空外观 / 供应商调色 / 图层策略 / 节点层。失败或降级 → 保留占位球面。
  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    let disposed = false;

    const applySelected = (map: MlMap) => {
      map.setFilter(LAYER_SELECTED, slugVisibleFilter(selectedRef.current ?? ""));
    };

    /** 节点 source + 四个图层（glow/dots/hover/selected）。setStyle 后需要整体重装。 */
    const installNodeLayers = (map: MlMap) => {
      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: toFeatureCollection(nodesRef.current) as unknown as SourceData,
      });

      // 柔光晕（emphasis 权重进半径：适宜度高的月份目的地更亮）
      map.addLayer({
        id: LAYER_GLOW,
        type: "circle",
        source: SOURCE_ID,
        filter: VISIBLE_FILTER as never,
        paint: {
          "circle-radius": [
            "interpolate", ["linear"], ["zoom"],
            0, ["*", ["case", ["get", "major"], 9, 6.5], ["+", 0.45, ["*", 0.55, ["get", "emphasis"]]]],
            6, ["*", ["case", ["get", "major"], 16, 11], ["+", 0.45, ["*", 0.55, ["get", "emphasis"]]]],
          ],
          "circle-color": ["case", ["get", "major"], "#ffd9a0", "#cfe0f5"],
          "circle-opacity": ["case", ["get", "major"], 0.26, 0.16],
          "circle-blur": 1,
        },
      });

      // 节点本体
      map.addLayer({
        id: LAYER_DOTS,
        type: "circle",
        source: SOURCE_ID,
        filter: VISIBLE_FILTER as never,
        paint: {
          "circle-radius": [
            "interpolate", ["linear"], ["zoom"],
            0, ["*", ["case", ["get", "major"], 4.2, 2.6], ["+", 0.55, ["*", 0.45, ["get", "emphasis"]]]],
            6, ["*", ["case", ["get", "major"], 7.5, 4.4], ["+", 0.55, ["*", 0.45, ["get", "emphasis"]]]],
          ],
          "circle-color": ["case", ["get", "major"], "#ffeccd", "#e8f0fb"],
          "circle-opacity": ["case", ["get", "major"], 0.98, 0.72],
          "circle-stroke-width": 0.6,
          "circle-stroke-color": "#0a1018",
          "circle-stroke-opacity": 0.5,
        },
      });

      // hover 高亮环（切 filter）
      map.addLayer({
        id: LAYER_HOVER,
        type: "circle",
        source: SOURCE_ID,
        filter: slugVisibleFilter(""),
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

      // selected halo 环（搜索定位 / 触摸钉住）
      map.addLayer({
        id: LAYER_SELECTED,
        type: "circle",
        source: SOURCE_ID,
        filter: slugVisibleFilter(""),
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

      applySelected(map);
    };

    /** hover / click / 拖拽标记：挂在 map 实例上，setStyle 不影响，只装一次。 */
    const attachInteractions = (map: MlMap) => {
      // ── hover（门控照搬 OSIRIS：rAF + 100ms 限流，相机运动中跳过） ──
      const gate = createHoverGate();
      map.on("mousemove", (e) => {
        if (map.isMoving() || !map.isStyleLoaded()) return;
        const point = { x: e.point.x, y: e.point.y };
        gate(() => {
          if (!map.isStyleLoaded()) return;
          const hit = pickPointFeature(map, toPickable(nodesRef.current), point);
          map.getCanvas().style.cursor = hit ? "pointer" : "";
          map.setFilter(LAYER_HOVER, slugVisibleFilter(hit?.properties.slug ?? ""));
          cbRef.current.onHover(hit ? { slug: hit.properties.slug, x: point.x, y: point.y } : null);
        });
      });
      map.on("mouseout", () => {
        map.getCanvas().style.cursor = "";
        if (!map.isStyleLoaded()) return;
        map.setFilter(LAYER_HOVER, slugVisibleFilter(""));
        cbRef.current.onHover(null);
      });

      // ── click：语义与 Three.js 版一致（isTouch 由指针类型决定） ──
      map.on("click", (e) => {
        const hit = pickPointFeature(map, toPickable(nodesRef.current), { x: e.point.x, y: e.point.y });
        if (!hit) return;
        const pointerType = (e.originalEvent as PointerEvent | undefined)?.pointerType;
        cbRef.current.onNodeClick(hit.properties.slug, pointerType === "touch");
      });

      map.on("dragstart", () => { userMovedRef.current = true; });
    };

    const publishMetrics = () => {
      container.dataset.globeMetrics = JSON.stringify({
        engine: `MapLibre GL JS ${MAPLIBRE_VERSION}`,
        basemap: provider.id,
        nodes: nodesRef.current.length,
      });
    };

    // Stage A：零网络启动（本地占位 style，球面首帧不等待任何请求）
    const boot = async () => {
      const map = createGlobeMap({
        container,
        style: placeholderStyle() as unknown as MapOptions["style"],
        center: HOME_CENTER,
        zoom: 1.2,
      });
      if (!map) {
        cbRef.current.onFailure("webgl unavailable");
        return;
      }
      mapRef.current = map;

      let resolveFirstLoad: (() => void) | undefined;
      const firstLoad = new Promise<void>((resolve) => { resolveFirstLoad = resolve; });

      map.on("load", () => {
        if (disposed) return;
        applyDeepSpaceLook(map);
        installNodeLayers(map);
        fitGlobeToViewport(map, fractionRef.current);
        attachInteractions(map);
        publishMetrics();

        const ro = new ResizeObserver(() => {
          if (!userMovedRef.current) fitGlobeToViewport(map, fractionRef.current);
          else map.resize();
        });
        ro.observe(container);

        setReady(true);
        setMapInstance(map);
        cbRef.current.onReady?.();
        cleanupRef.current = () => ro.disconnect();
        resolveFirstLoad?.();
      });
      map.on("error", (e) => {
        console.error("[utripla/globe] map error:", e);
      });

      // Stage B：真实底图异步上线（非关键路径；交互已在 Stage A 可用）
      const loaded = await loadBasemapStyle(provider, { credential: basemapCredential });
      if (disposed || mapRef.current !== map) return;
      await firstLoad;
      if (disposed || mapRef.current !== map) return;
      if (loaded.degraded) {
        // 底图缺失不失败：占位球面 + 节点照常，原因写进日志供诊断
        console.warn("[utripla/globe] basemap degraded:", loaded.reason);
        return;
      }

      // 必须显式 diff:false：默认 setStyle 走 _diffStyle 原地 diff，不触发 style.load，
      // 且会把 sky / globe 投影 / 自建节点层一并 diff 掉（实测浅色平面图回归）。
      // diff:false 走 _updateStyle 全量重建 → style.load 事件可靠触发，下面的重装逻辑才生效。
      map.setStyle(loaded.style as unknown as NonNullable<MapOptions["style"]>, { diff: false });
      // setStyle 重置整个 style（含 sky/projection/source）—— 新 style 首帧渲染前
      // 重新应用外观与节点层，保证从占位球面到底图是无缝过渡、无浅色闪帧。
      map.once("style.load", () => {
        if (disposed || mapRef.current !== map) return;
        applyDeepSpaceLook(map);
        provider.restyle?.(map);
        applyBasemapLayerPolicy(map, provider.hideLayerPrefixes);
        installNodeLayers(map);
        fitGlobeToViewport(map, fractionRef.current);
        publishMetrics();
      });
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
    // 引擎只创建一次；nodes / selectedSlug 通过 handle 增量同步
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 节点（月份适宜度 / vibe lens）变化 → setData，不重建地图
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const src = map.getSource(SOURCE_ID) as GeoJSONSource | undefined;
    if (src) src.setData(toFeatureCollection(nodes) as unknown as SourceData);
  }, [nodes, ready]);

  // 选中状态 → selected halo 环。
  // ⚠️ 必须 isStyleLoaded 守卫：Stage B setStyle(diff:false) 重建期间 style._loaded=false，
  // 任何 setFilter 都会抛 "Style is not done loading"（StrictMode 双挂载下必现）。
  // 错过的话无需补偿 —— style 就绪点（stage A load / stage B style.load）都会
  // 经 installNodeLayers → applySelected 用 selectedRef.current 重新应用。
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !map.isStyleLoaded()) return;
    map.setFilter(LAYER_SELECTED, slugVisibleFilter(selectedSlug ?? ""));
  }, [selectedSlug, ready]);

  // ── handle：与 EarthSceneHandle 同构（WorldAtlas 无感知切换） ──
  useEffect(() => {
    const map = mapInstance;
    if (!map) return;
    const container = containerRef.current;
    if (!container) return;

    const handle: EarthSceneHandle = {
      update(next: EarthNode[]) {
        nodesRef.current = next;
        const src = map.getSource(SOURCE_ID) as GeoJSONSource | undefined;
        if (src) src.setData(toFeatureCollection(next) as unknown as SourceData);
      },
      setSelected(slug: string | null) {
        selectedRef.current = slug;
        // style 重建窗口期跳过（会抛错）；style.load 就绪点会用 selectedRef 重应用
        if (!map.isStyleLoaded()) return;
        map.setFilter(LAYER_SELECTED, slugVisibleFilter(slug ?? ""));
      },
      zoomBy(factor: number) {
        map.easeTo({ zoom: map.getZoom() - Math.log2(factor), duration: 240 });
      },
      resetView() {
        userMovedRef.current = false;
        map.easeTo({ center: HOME_CENTER, duration: 800 });
        window.setTimeout(() => {
          if (mapRef.current === map) fitGlobeToViewport(map, fractionRef.current);
        }, 820);
      },
      flyTo(lonDeg: number, latDeg: number, durationMs = 1600) {
        userMovedRef.current = true;
        map.flyTo({ center: [lonDeg, latDeg], duration: durationMs, essential: true, curve: 1.3 });
      },
      globeMetrics() {
        const shellH = container.clientHeight;
        let diameter = 0;
        try {
          // 复用引擎的反解测量（中心 ±89.5° 投影距离）
          const c = map.getCenter();
          const limb = 89.5;
          const left = map.project([c.lng - limb, Math.max(-85, Math.min(85, c.lat))]);
          const right = map.project([c.lng + limb, Math.max(-85, Math.min(85, c.lat))]);
          diameter = Math.round(Math.abs(right.x - left.x));
        } catch { /* 忽略 */ }
        return {
          shellWidth: container.clientWidth,
          shellHeight: shellH,
          globeDiameterPx: diameter,
          globeHeightRatio: shellH > 0 ? Number((diameter / shellH).toFixed(3)) : 0,
          cameraDistance: Number((2 ** (3.31 - map.getZoom())).toFixed(3)),
          maskResolution: "maplibre-vector-tiles",
          drawCallsPerFrame: 0,
        };
      },
      dispose() {
        try { map.remove(); } catch { /* 已移除 */ }
      },
    };
    cbRef.current.onHandle(handle);
    return () => cbRef.current.onHandle(null);
  }, [mapInstance]);

  if (!configured) {
    console.warn("[utripla/globe] basemap provider not configured:", provider.id);
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* 引擎首帧前的静态球面预览（纯 CSS）：ready 后淡出，canvas 无缝接管 */}
      <GlobePreview visible={!ready} />
    </div>
  );
}

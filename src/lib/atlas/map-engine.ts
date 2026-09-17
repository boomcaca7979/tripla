/**
 * map-engine — MapLibre GL **引擎层**（与底图 Provider 严格分离）。
 *
 * 从 OSIRIS（MIT，https://github.com/simplifaisoul/osiris）移植并保留的部分：
 *   · `createGlobeMap()` 的 **WebGL 上下文降级阶梯**（`attributeFallbacks`）——
 *     MapLibre 会硬要一个高性能 WebGL2 上下文并在拿不到时直接抛错；有些机器拒绝
 *     那个精确请求、却愿意给一个更弱的。逐级下调再放弃，比直接失败好得多。
 *   · **hover 门控**（`createHoverGate()`）—— 拾取放进 rAF、限流 100ms、相机运动中跳过。
 *   · **诊断数据写进容器 dataset**（`attachMapDiagnostics()`）—— OSIRIS 用
 *     `container.dataset.mapCamera` 做"不用截图就能查相机"的回归诊断，这里扩展为
 *     `dataset.globeMetrics`。
 *
 * UTRIPLA 新增的部分（与任何供应商无关）：地球在视口中的**目标尺寸反解**（`fitGlobeToViewport`）
 * 与深空/大气外观（`applyDeepSpaceLook`）。
 */

// MapLibre 的 d.ts 没有 default export —— 必须用命名空间导入（OSIRIS 同样是这么写的）。
import * as maplibregl from 'maplibre-gl';
import type { Map as MapLibreMap, MapOptions } from 'maplibre-gl';
import { applyMapProjection } from './map-projection';

/** 引擎默认参数。注意：这里没有任何供应商信息。 */
export const GLOBE_MAP_DEFAULTS = {
  minZoom: 0,
  maxZoom: 10,
  maxPitch: 85,
  attributionControl: false as const,
} satisfies Partial<MapOptions>;

/** 初始视角：欧亚非（节点密度最能说明问题），与 /destinations 既有约定一致。 */
export const HOME_CENTER: [number, number] = [15, 22];

export interface CreateGlobeMapOptions {
  container: HTMLElement;
  style: MapOptions['style'];
  center?: [number, number];
  zoom?: number;
  maxPitch?: number;
  minZoom?: number;
  maxZoom?: number;
  /**
   * 滚轮/触摸的协作手势策略（默认开启）：
   * 普通滚轮**滚动页面**，只有 ⌘/Ctrl + 滚轮才缩放；触摸端单指滚页、双指操作地图。
   * 这样地图区域不会永久劫持页面滚动。
   */
  cooperativeGestures?: boolean;
}

/**
 * 创建 globe 地图实例，带 WebGL 上下文降级阶梯。
 * 返回 null 表示所有阶梯都被拒绝（调用方应降级为不含地图的视图）。
 */
export function createGlobeMap(opts: CreateGlobeMapOptions): MapLibreMap | null {
  const { container, style, center = HOME_CENTER, zoom = 1 } = opts;

  // MapLibre 6 的默认 worker URL 由 import.meta.url 推导并要求是 http(s) URL；
  // Turbopack 的浏览器 bundle 里它不是 → 库拿到空串，worker **静默**不存在，
  // 于是源数据永不加载（styleLoaded 恒 false / queryRenderedFeatures 恒 0 且零报错）。
  // 修法与 OSIRIS 相同：worker + shared 模块由 scripts/prepare-map-worker.mjs
  // 自托管为静态资源，这里在建 Map 之前显式指定（必须早于 worker 池初始化）。
  maplibregl.setWorkerUrl(`/vendor/maplibre/${maplibregl.getVersion()}/maplibre-gl-worker.mjs`);

  const baseOptions: MapOptions = {
    container,
    style,
    center,
    zoom,
    minZoom: opts.minZoom ?? GLOBE_MAP_DEFAULTS.minZoom,
    maxZoom: opts.maxZoom ?? GLOBE_MAP_DEFAULTS.maxZoom,
    maxPitch: opts.maxPitch ?? GLOBE_MAP_DEFAULTS.maxPitch,
    attributionControl: GLOBE_MAP_DEFAULTS.attributionControl,
    cooperativeGestures: opts.cooperativeGestures ?? true,
  };

  // 逐级下调 WebGL 请求（移植自 OSIRIS）：先默认，再低功耗，最后丢掉 antialias。
  // dev 下额外保留 drawing buffer：这样无需截图就能 readPixels 验证"到底画没画出来"
  // （globe 模式下 queryRenderedFeatures 不完全可靠，见 DestinationGlobeMap 的自建拾取）。
  const keepDrawBuffer = process.env.NODE_ENV === "development";
  const weakRungs: Array<NonNullable<MapOptions['canvasContextAttributes']>> = [
    { powerPreference: 'low-power', failIfMajorPerformanceCaveat: false },
    { powerPreference: 'low-power', failIfMajorPerformanceCaveat: false, antialias: false },
  ];
  const rungs: Array<MapOptions['canvasContextAttributes']> = [undefined, ...weakRungs];
  const attributeFallbacks: Array<MapOptions['canvasContextAttributes']> = keepDrawBuffer
    ? rungs.map((a) => ({ preserveDrawingBuffer: true, ...(a ?? {}) }))
    : rungs;

  for (let i = 0; i < attributeFallbacks.length; i += 1) {
    const canvasContextAttributes = attributeFallbacks[i];
    try {
      return new maplibregl.Map(
        canvasContextAttributes ? { ...baseOptions, canvasContextAttributes } : baseOptions,
      );
    } catch (err) {
      // 构造失败的 canvas 会留在容器里，下一次尝试需要干净容器。
      container.innerHTML = '';
      if (i === attributeFallbacks.length - 1) {
        console.error('[utripla/globe] WebGL context unavailable:', err);
        return null;
      }
    }
  }
  return null;
}

/**
 * UTRIPLA 地图调色板 —— 以**导航栏实际 computed color** 为基准推导，不是拍脑袋：
 *   全站深色态导航栏 = rgba(64, 59, 61, 0.82)（暖炭灰，R&gt;B，饱和度极低）
 *   导航栏墨色      = #f5f2ea（暖白）
 * 地图必须落在这个色相家族里（暖灰黑），而不是此前的蓝黑 —— 否则
 * "导航栏深灰暖色 / 地图纯蓝黑 / 背景另一种黑"三层各说各话。
 * 层级仍然保留：海洋最暗 → 陆地稍亮 → 边界/地名更亮 → 节点最亮。
 */
export const UTRIPLA_MAP_PALETTE = {
  /** 太空/天空：暖近黑（比导航栏更深一档，作空间纵深） */
  space: "#0b0a0a",
  /** 地平线大气：暖灰，极轻的一圈光 */
  horizon: "#3a3430",
  fog: "#171413",
  /** 海洋：暖炭黑 —— 明显比旧版(#04070f)亮，且 R≥B，不再是蓝黑 */
  ocean: "#1b181a",
  /** 陆地基面：比海洋亮一档的同族暖灰 */
  land: "#35302f",
  landLow: "#2b2726",
  /** 国界/边界：暖灰，可辨认 */
  boundary: "#5a534f",
  /** 地名文字 = 导航栏墨色 */
  text: "#f5f2ea",
  textHalo: "#141112",
} as const;

/**
 * 太空（Globe **外面**那一圈）的颜色 —— 与地图内部调色板严格分开。
 *
 * 为什么单独一份：canvas 铺满视口，"地球外面的页面背景"实际是 MapLibre 的 sky，
 * 不是 CSS；而本文件只负责这里，UTRIPLA_MAP_PALETTE（海洋/陆地/边界/文字）
 * 保持不动。颜色基准同样是导航栏 rgba(64,59,61,.82)（暖炭灰 #403B3D）：
 *   · space   比导航栏深一档，让半透明导航栏仍读得出来
 *   · horizon 贴着地球边缘的一圈暖灰光，制造"地球浮在暖色空间里"的层次
 * 不偏蓝、不偏紫。
 */
export const UTRIPLA_SPACE_PALETTE = {
  space: "#342f31",
  horizon: "#4c4648",
  fog: "#262224",
} as const;

/** 深空 + 微大气：地球边缘一圈很轻的暖灰光晕。不写任何自绘大陆。 */
export function applyDeepSpaceLook(map: MapLibreMap): void {
  applyMapProjection(map, 'globe');
  map.setSky({
    'sky-color': UTRIPLA_SPACE_PALETTE.space,
    'horizon-color': UTRIPLA_SPACE_PALETTE.horizon,
    'fog-color': UTRIPLA_SPACE_PALETTE.fog,
    'sky-horizon-blend': 0.65,
    'horizon-fog-blend': 0.6,
    'fog-ground-blend': 0.45,
    // 大气很收敛：只要一圈边缘光，不要糊住球面。
    'atmosphere-blend': 0.40,
  });
}

/**
 * 实测"地球在视口中的水平直径（CSS px）"。
 *
 * 做法：把中心经度 ±89.5° 的两个点投影到屏幕。球面被看到的那一半，
 * 其经度跨度就是 ±90°，所以这两点的屏幕距离≈地球直径。
 * 用一个略小于 90 的角度是为了贴住边缘而不越过它。
 */
export function measureGlobeDiameterPx(map: MapLibreMap): number {
  const c = map.getCenter();
  const limb = 89.5;
  const left = map.project([c.lng - limb, Math.max(-85, Math.min(85, c.lat))]);
  const right = map.project([c.lng + limb, Math.max(-85, Math.min(85, c.lat))]);
  const d = Math.abs(right.x - left.x);
  return Number.isFinite(d) ? d : 0;
}

/**
 * 反解 zoom，让地球直径 ≈ `fraction × 容器高`。
 *
 * 为什么用迭代而不是公式：globe 是透视投影，屏幕上直径与 zoom 的关系
 * 不是闭式的（视距由库内部决定）。用"测量 → 按 log2(目标/实测) 调 zoom"
 * 迭代收敛，比拍一个常数在任何视口/DPR 下都稳。
 */
export function fitGlobeToViewport(
  map: MapLibreMap,
  fraction: number,
  bounds?: { min?: number; max?: number },
): number {
  const min = bounds?.min ?? GLOBE_MAP_DEFAULTS.minZoom;
  const max = bounds?.max ?? GLOBE_MAP_DEFAULTS.maxZoom;
  const target = fraction * map.getContainer().clientHeight;
  let zoom = map.getZoom();
  for (let i = 0; i < 8; i += 1) {
    const measured = measureGlobeDiameterPx(map);
    if (!measured || !Number.isFinite(measured)) break;
    const delta = Math.log2(target / measured);
    if (Math.abs(delta) < 0.01) break;
    const next = Math.max(min, Math.min(max, zoom + delta));
    if (next === zoom) break;
    zoom = next;
    map.setZoom(zoom);
  }
  return zoom;
}

/**
 * hover 门控（移植自 OSIRIS 的限流思路）：
 * 拾取工作放进 rAF，且 100ms 内不重复；相机运动中的一帧直接跳过。
 * 返回的函数应在 mousemove 里调用，内部自行决定是否真的执行。
 */
export function createHoverGate(): (run: () => void) => void {
  let frame = 0;
  let last = -Infinity;
  return (run: () => void) => {
    if (frame || performance.now() - last < 100) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      last = performance.now();
      run();
    });
  };
}

export interface GlobeDiagnosticsExtras {
  engine: string;
  basemap: string;
  nodes: number;
  globeHeightRatio: number;
}

/**
 * 把诊断指标写进容器 dataset（移植自 OSIRIS 的 `dataset.mapCamera` 约定，扩展若干字段）。
 * 目的：无需截图即可在浏览器里读取相机与地球尺寸，做回归验证。
 */
export function attachMapDiagnostics(
  map: MapLibreMap,
  container: HTMLElement,
  extras: () => GlobeDiagnosticsExtras,
): () => void {
  const publish = () => {
    const c = map.getCenter();
    const diameter = measureGlobeDiameterPx(map);
    container.dataset.mapCamera = JSON.stringify({
      zoom: Number(map.getZoom().toFixed(3)),
      pitch: Number(map.getPitch().toFixed(2)),
      bearing: Number(map.getBearing().toFixed(2)),
      lat: Number(c.lat.toFixed(2)),
      lng: Number(c.lng.toFixed(2)),
    });
    container.dataset.globeMetrics = JSON.stringify({
      ...extras(),
      // 当前生效的投影。globe 是自适应投影：总览级是球体，放大后由库内部转 mercator，
      // 所以这里读到的可能就是 'globe' 本身（而不是它的内部实现）。
      projection: map.getProjection()?.type ?? null,
      globeDiameterPx: Math.round(diameter),
      canvasWidth: map.getCanvas().clientWidth,
      canvasHeight: map.getCanvas().clientHeight,
      center: [Number(c.lng.toFixed(2)), Number(c.lat.toFixed(2))],
    });
  };
  map.on('load', publish);
  map.on('moveend', publish);
  map.on('idle', publish);
  const ro = new ResizeObserver(publish);
  ro.observe(container);
  publish();
  return () => ro.disconnect();
}

/** MapLibre 版本号（写进诊断，便于确认引擎版本）。 */
export const MAPLIBRE_VERSION = maplibregl.getVersion();

/**
 * 执行底图 provider 的"图层可见性策略"：把 id 以给定前缀开头的图层隐藏。
 *
 * 这不是供应商逻辑，而是引擎对任意 style 的通用能力 —— provider 只**声明**
 * 想隐藏哪些前缀（见 basemap.ts），engine 负责执行。返回隐藏的图层数。
 */
export function applyBasemapLayerPolicy(
  map: MapLibreMap,
  prefixes: readonly string[] | undefined,
): number {
  if (!prefixes?.length) return 0;
  let hidden = 0;
  for (const layer of map.getStyle().layers ?? []) {
    if (!prefixes.some((p) => layer.id.startsWith(p))) continue;
    try {
      map.setLayoutProperty(layer.id, "visibility", "none");
      hidden += 1;
    } catch {
      /* 个别图层不支持 visibility 时跳过，不影响其余 */
    }
  }
  return hidden;
}

/**
 * 自建拾取：按屏幕距离找最近的可见点要素（globe 模式下 queryRenderedFeatures
 * 只对视口中心附近的瓦片可靠，故绕开它 —— OSIRIS 对卫星层同样绕开）。
 * 通用化：destination GeoJSON 与引擎节点派生 GeoJSON 都满足 PickableFeature。
 */
export interface PickableFeature {
  geometry: { coordinates: [number, number] };
  properties: { slug: string; major?: boolean };
}

export function pickPointFeature<P extends { slug: string; major?: boolean }>(
  map: MapLibreMap,
  features: ReadonlyArray<{ geometry: { coordinates: [number, number] }; properties: P }>,
  point: { x: number; y: number },
): { properties: P } | null {
  const R = Math.PI / 180;
  const c = map.getCenter();
  const sinLatC = Math.sin(c.lat * R);
  const cosLatC = Math.cos(c.lat * R);
  const W = map.getCanvas().clientWidth;
  const H = map.getCanvas().clientHeight;
  let best: { feature: { geometry: { coordinates: [number, number] }; properties: P }; dist: number } | null = null;

  for (const f of features) {
    const [lon, lat] = f.geometry.coordinates;
    // 球面角距（度的弧度值）：> 90° 的点在可见半球之外，直接跳过
    const cosD =
      Math.sin(lat * R) * sinLatC + Math.cos(lat * R) * cosLatC * Math.cos((lon - c.lng) * R);
    if (cosD < 0.02) continue; // ≈ 距离 89° 以外：贴着地平线或背面
    const p = map.project([lon, lat]);
    if (p.x < -40 || p.x > W + 40 || p.y < -40 || p.y > H + 40) continue;
    const dist = Math.hypot(p.x - point.x, p.y - point.y);
    const radius = f.properties.major ? 16 : 11; // 略大于视觉半径，手指/鼠标都好点
    if (dist <= radius && (!best || dist < best.dist)) best = { feature: f, dist };
  }
  return best?.feature ?? null;
}


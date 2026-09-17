"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Viewer } from "cesium";
// Cesium 的 widget 样式通过 bundler 引入（不要手写 <link>）
import "cesium/Build/Cesium/Widgets/widgets.css";

/**
 * CesiumGlobePrototype — /destinations/map-test 的**技术验证原型**（临时页面专用）。
 *
 * 目的：用「真实地图引擎 + 真实地图数据」验证 UTRIPLA Destinations 的形态能否成立：
 *   真实全球地图 + 真正的 3D 地球 + 巨大尺寸 + 暗黑科技视觉 + 145 个 destination 节点
 *   + hover / click / drag / zoom / 移动端。
 *
 * 引擎与数据（合规边界）：
 *   · 渲染引擎 = CesiumJS（Apache-2.0，可商用；不使用 Cesium ion 资产或令牌）
 *   · 地图数据 = 天地图（国家地理信息公共服务平台，实名申请 tk；本文件**不内置任何可用 key**）
 *       - 深色矢量底图 `vec_d` + 深色注记 `cva_d`（官方深色底图，正好是"科技感深色"基调）
 *       - 需要影像/地形时另加 `img_w` / `ter_w`（见 TD_WMTS 注释）
 *   · 为什么不是 Mapbox / Google / OSM 直连瓦片：依据《地图管理条例》第 33/34/38 条与
 *     《测绘法》，境内互联网地图服务必须使用经审核批准的地图、不得链接境外互联网地图服务。
 *     本原型改用合规平台，对"真实地图引擎 + 巨大地球能否做到"这个结论问题同样成立。
 *
 * 性能：145 个节点 = 1 个 PointPrimitiveCollection（单批次）；标签 = 1 个 LabelCollection；
 * 无逐城市 React 组件、无逐城市请求；Cesium 通过动态 import 懒加载（不进首屏 bundle）。
 */

export interface GlobeTestGeoJson {
  type: "FeatureCollection";
  features: {
    type: "Feature";
    geometry: { type: "Point"; coordinates: [number, number] };
    properties: {
      slug: string;
      city: string;
      country: string;
      bestTime: string;
      budget: string;
      major: boolean;
      vibes: string[];
    };
  }[];
}

interface PrototypeProps {
  geojson: GlobeTestGeoJson;
  /** 天地图 tk（NEXT_PUBLIC_TIANDITU_TOKEN）；未配置时瓦片 403，页面会明确提示 */
  token: string;
}

/** WGS84 长半轴（米） */
const EARTH_RADIUS = 6378137;
/** 目标：地球直径 / 容器高（>1 = 上下出血，即"巨大地球"） */
const GLOBE_FRACTION = 1.22;
/** 初始视角中心（经度, 纬度）——默认看向欧亚非，节点密度最能说明问题 */
const HOME_LON = 15;
const HOME_LAT = 22;

/**
 * 天地图 WMTS URL 模板（Web Mercator 矩阵集 `w`）。
 * 若你的 key 只对 CGCS2000 矩阵集生效，把 TILEMATRIXSET 换成 `c` 即可（同一套参数）。
 */
const TD_WMTS = (layer: string, tk: string) =>
  `https://t{s}.tianditu.gov.cn/${layer}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0` +
  `&LAYER=${layer}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles` +
  `&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tk}`;

interface HoverInfo {
  slug: string;
  city: string;
  country: string;
  bestTime: string;
  budget: string;
  vibes: string[];
  x: number;
  y: number;
}

/** Cesium 的 fov 作用于较长边；这里统一换算成**垂直** fov 供尺寸公式使用。 */
function verticalFovOf(frustum: Viewer["camera"]["frustum"], aspect: number): number {
  const f = frustum as { fovy?: number; fov?: number };
  if (typeof f.fovy === "number" && f.fovy > 0) return f.fovy;
  const fov = typeof f.fov === "number" && f.fov > 0 ? f.fov : Math.PI / 3;
  return aspect >= 1 ? 2 * Math.atan(Math.tan(fov / 2) / aspect) : fov;
}

export default function CesiumGlobePrototype({ geojson, token }: PrototypeProps) {
  const router = useRouter();
  const shellRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const creditRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const resetViewRef = useRef<(() => void) | null>(null);
  /** 地图注记图层（天地图 cva_d）：用于"地图标签 / UTRIPLA 标签"重叠测试 */
  const mapLabelLayerRef = useRef<import("cesium").ImageryLayer | null>(null);

  const [hover, setHover] = useState<HoverInfo | null>(null);
  /** 容器宽度：hover 卡片靠边翻转用（渲染期读 ref 是 React 反模式） */
  const [shellW, setShellW] = useState(1280);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const [tileErrors, setTileErrors] = useState(0);
  const [mapLabels, setMapLabels] = useState(true);

  useEffect(() => {
    const container = mapRef.current;
    const credit = creditRef.current;
    if (!container || !credit) return;

    let disposed = false;
    let viewer: Viewer | null = null;
    // Cesium 资源基路径必须在它求值/使用之前设置
    (window as unknown as { CESIUM_BASE_URL?: string }).CESIUM_BASE_URL = "/cesium/";

    (async () => {
      try {
        const Cesium = await import("cesium");
        if (disposed) return;
        // 基路径统一由 window.CESIUM_BASE_URL 提供（见上）；不调用 ion，任何资产都不依赖它
        Cesium.Ion.defaultAccessToken = "";

        viewer = new Cesium.Viewer(container, {
          animation: false,
          timeline: false,
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          fullscreenButton: false,
          infoBox: false,
          selectionIndicator: false,
          baseLayer: false, // 底图由天地图提供，不加载 Cesium 默认底图
          creditContainer: credit,
          requestRenderMode: false,
        });
        viewerRef.current = viewer;

        const scene = viewer.scene;

        // ── 视觉：深空 + 暗黑科技（不是纯黑，不紫） ──
        scene.backgroundColor = Cesium.Color.fromCssColorString("#050912");
        scene.globe.baseColor = Cesium.Color.fromCssColorString("#070d1a");
        scene.globe.enableLighting = false; // 地图可读：不做昼夜半球
        scene.globe.showGroundAtmosphere = false;
        scene.globe.showWaterEffect = false;
        scene.globe.depthTestAgainstTerrain = false;
        scene.globe.maximumScreenSpaceError = 1.6; // 平衡清晰度与瓦片量
        // 内置星空 = 深空感；大气做极轻的蓝灰边缘光
        if (scene.skyBox) scene.skyBox.show = true;
        const atmo = scene.skyAtmosphere;
        if (atmo) {
          atmo.show = true;
          atmo.hueShift = -0.02;
          atmo.saturationShift = -0.3;
          atmo.brightnessShift = -0.5;
        }
        scene.fog.enabled = false;
        scene.screenSpaceCameraController.enableCollisionDetection = false;
        scene.screenSpaceCameraController.minimumZoomDistance = EARTH_RADIUS * 0.02;
        scene.highDynamicRange = false;
        // 滚轮交给页面滚动，只有 ⌘/Ctrl + 滚轮才缩放（与既有 Three.js 版本行为一致）
        scene.screenSpaceCameraController.enableZoom = false;

        // ── 真实地图数据：天地图深色底图 + 深色注记 ──
        const tk = token ?? "";
        const onTileError = () => {
          if (!disposed) setTileErrors((n) => n + 1);
        };
        const darkBase = new Cesium.UrlTemplateImageryProvider({
          url: TD_WMTS("vec_d", tk),
          subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
          minimumLevel: 1,
          maximumLevel: 18,
          credit: new Cesium.Credit("天地图 · 国家地理信息公共服务平台"),
        });
        const darkLabels = new Cesium.UrlTemplateImageryProvider({
          url: TD_WMTS("cva_d", tk),
          subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
          minimumLevel: 1,
          maximumLevel: 18,
        });
        darkBase.errorEvent.addEventListener(onTileError);
        darkLabels.errorEvent.addEventListener(onTileError);

        viewer.imageryLayers.removeAll();
        viewer.imageryLayers.addImageryProvider(darkBase);
        mapLabelLayerRef.current = viewer.imageryLayers.addImageryProvider(darkLabels);

        // ── 145 个 UTRIPLA destination 节点：单个 PointPrimitiveCollection ──
        const points = scene.primitives.add(new Cesium.PointPrimitiveCollection());
        const labels = scene.primitives.add(new Cesium.LabelCollection());
        for (const f of geojson.features) {
          const [lon, lat] = f.geometry.coordinates;
          const p = f.properties;
          // 抬高 15km：避免与地表 z-fighting，同时保留"被地球遮挡"的深度关系
          const position = Cesium.Cartesian3.fromDegrees(lon, lat, 15000);
          points.add({
            position,
            pixelSize: p.major ? 8.5 : 5.5,
            color: Cesium.Color.fromCssColorString(p.major ? "#ffe9c4" : "#f4e2c4").withAlpha(
              p.major ? 0.95 : 0.72,
            ),
            outlineColor: Cesium.Color.fromCssColorString("#1a1206").withAlpha(0.55),
            outlineWidth: p.major ? 2 : 1,
            scaleByDistance: new Cesium.NearFarScalar(1.5e6, 1.35, 2.2e7, 0.75),
            show: true,
            id: { kind: "destination", ...p },
          });
          if (p.major) {
            labels.add({
              position,
              text: p.city,
              font: "500 11px ui-monospace, SFMono-Regular, Menlo, monospace",
              style: Cesium.LabelStyle.FILL,
              fillColor: Cesium.Color.fromCssColorString("#dbe7f7").withAlpha(0.85),
              outlineColor: Cesium.Color.fromCssColorString("#050912").withAlpha(0.9),
              outlineWidth: 3,
              pixelOffset: new Cesium.Cartesian2(11, 0),
              horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 1.35e7),
              scaleByDistance: new Cesium.NearFarScalar(1.5e6, 1.0, 1.35e7, 0.7),
            });
          }
        }

        // ── 巨大地球：由目标屏幕占比反推相机高度 ──
        const frustum = viewer.camera.frustum as import("cesium").PerspectiveFrustum;
        const aspectOf = () => viewer!.canvas.clientWidth / Math.max(1, viewer!.canvas.clientHeight);
        const heightFor = (fraction: number) => {
          const tanHalf = Math.tan(verticalFovOf(frustum, aspectOf()) / 2);
          const theta = Math.atan(fraction * tanHalf);
          return EARTH_RADIUS / Math.sin(theta) - EARTH_RADIUS;
        };
        const resetView = () => {
          viewer?.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(HOME_LON, HOME_LAT, heightFor(GLOBE_FRACTION)),
          });
          viewer?.scene.requestRender();
        };
        resetViewRef.current = resetView;

        const publishMetrics = () => {
          const el = shellRef.current;
          if (disposed || !el || !viewer) return;
          const d = Cesium.Cartesian3.magnitude(viewer.camera.positionWC);
          const theta = Math.asin(Math.min(1, EARTH_RADIUS / d));
          // 实测：按当前相机状态反算"地球上屏直径 / 容器高"
          const ratio = Math.tan(theta) / Math.tan(verticalFovOf(frustum, aspectOf()) / 2);
          el.dataset.globeMetrics = JSON.stringify({
            engine: `CesiumJS ${(Cesium as { VERSION?: string }).VERSION ?? ""}`.trim(),
            globeDiameterPx: Math.round(ratio * el.clientHeight),
            globeHeightRatio: Number(ratio.toFixed(3)),
            cameraHeightKm: Math.round((d - EARTH_RADIUS) / 1000),
            // 相机所在地理坐标（用于验证拖拽旋转是否真的改变了视角）
            cameraLonDeg: Number(Cesium.Math.toDegrees(viewer.camera.positionCartographic.longitude).toFixed(2)),
            cameraLatDeg: Number(Cesium.Math.toDegrees(viewer.camera.positionCartographic.latitude).toFixed(2)),
            globeRotatable: true,
            fovyDeg: Number(Cesium.Math.toDegrees(verticalFovOf(frustum, aspectOf())).toFixed(1)),
            nodes: points.length,
            labels: labels.length,
            imageryLayers: viewer.imageryLayers.length,
            imageryTileErrors: tileErrors,
            hasToken: Boolean(tk),
            containerHeight: el.clientHeight,
          });
        };

        resetView();

        // ── hover / click ──
        const handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        handler.setInputAction((movement: { endPosition: import("cesium").Cartesian2 }) => {
          const picked = scene.pick(movement.endPosition);
          const id = picked?.id as
            | {
                kind?: string;
                slug?: string;
                city?: string;
                country?: string;
                bestTime?: string;
                budget?: string;
                vibes?: string[];
              }
            | undefined;
          if (id?.kind === "destination" && id.slug) {
            setHover({
              slug: id.slug,
              city: id.city ?? "",
              country: id.country ?? "",
              bestTime: id.bestTime ?? "",
              budget: id.budget ?? "",
              vibes: id.vibes ?? [],
              x: movement.endPosition.x,
              y: movement.endPosition.y,
            });
            scene.canvas.style.cursor = "pointer";
          } else {
            setHover(null);
            scene.canvas.style.cursor = "";
          }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        handler.setInputAction((movement: { position: import("cesium").Cartesian2 }) => {
          const picked = scene.pick(movement.position);
          const id = picked?.id as { kind?: string; slug?: string } | undefined;
          if (id?.kind === "destination" && id.slug) {
            router.push(`/destinations/${id.slug}`);
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        /**
         * 滚轮策略：**普通滚轮必须能滚动页面**（不能被地图永久劫持），只有 ⌘/Ctrl + 滚轮才缩放。
         * 注意：Cesium 自己的 canvas wheel 监听会对滚轮做 preventDefault（即使关掉了
         * screenSpaceCameraController.enableZoom），所以这里在**容器捕获阶段**拦下事件：
         *   · 普通滚轮 → stopPropagation（事件不再到达 canvas，浏览器照常滚动页面）
         *   · ⌘/Ctrl 滚轮 → preventDefault + 自己缩放
         */
        const onWheelCapture = (e: WheelEvent) => {
          if (!(e.ctrlKey || e.metaKey)) {
            e.stopPropagation();
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          const amount = viewer!.camera.positionCartographic.height * 0.22;
          if (e.deltaY < 0) viewer!.camera.zoomIn(amount);
          else viewer!.camera.zoomOut(amount);
          viewer!.scene.requestRender();
        };
        container.addEventListener("wheel", onWheelCapture, { capture: true, passive: false });

        // 尺寸变化：维持"巨大地球"目标（用户手动缩放后不覆盖）
        let userMoved = false;
        setShellW(container.clientWidth);
        const ro = new ResizeObserver(() => {
          if (!viewer) return;
          setShellW(container.clientWidth);
          if (!userMoved) resetView();
          publishMetrics();
        });
        ro.observe(container);
        const onCameraChanged = () => {
          userMoved = true;
          publishMetrics();
        };
        viewer.camera.changed.addEventListener(onCameraChanged);
        viewer.camera.percentageChanged = 0.02;

        setStatus("ready");
        window.setTimeout(publishMetrics, 400);

        cleanupRef.current = () => {
          ro.disconnect();
          container.removeEventListener("wheel", onWheelCapture, { capture: true });
          viewer?.camera.changed.removeEventListener(onCameraChanged);
          handler.destroy();
          if (viewer && !viewer.isDestroyed()) viewer.destroy();
        };
      } catch (err) {
        if (!disposed) {
          setStatus("failed");
          console.error("[cesium-prototype] init failed:", err);
        }
      }
    })();

    return () => {
      disposed = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
      viewerRef.current = null;
    };
    // 只在挂载时初始化一次；数据与 token 由服务端给定
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const zoom = (dir: 1 | -1) => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const amount = viewer.camera.positionCartographic.height * 0.28;
    if (dir === 1) viewer.camera.zoomIn(amount);
    else viewer.camera.zoomOut(amount);
    viewer.scene.requestRender();
  };

  const toggleMapLabels = () => {
    const layer = mapLabelLayerRef.current;
    if (!layer) return;
    layer.show = !layer.show;
    setMapLabels(layer.show);
    viewerRef.current?.scene.requestRender();
  };

  return (
    <div
      ref={shellRef}
      data-cesium-globe=""
      className="ut-deep-space relative h-[calc(100svh-4rem)] min-h-[520px] overflow-hidden text-[#eef4ff]"
    >
      {/* 地图容器：占满整个视口（导航悬浮其上） */}
      <div ref={mapRef} className="absolute inset-0" />

      {/* 顶部：一句标题 + 两个测试控件 */}
      <div className="pointer-events-none absolute inset-x-0 top-6 z-20 flex items-start justify-between gap-4 px-4 md:px-8">
        <div>
          <p className="font-mono text-micro uppercase tracking-[0.3em] text-white/40">
            Destinations · engine test
          </p>
          <h1 className="mt-2 font-display text-[1.5rem] leading-none text-white/90 md:text-[1.75rem]">
            Real map globe.
          </h1>
          <p className="mt-2 font-mono text-micro uppercase tracking-[0.16em] text-white/35">
            CesiumJS · Tianditu dark basemap · {geojson.features.length} destinations
          </p>
        </div>
        <div className="pointer-events-auto">
          <button
            type="button"
            onClick={toggleMapLabels}
            aria-pressed={!mapLabels}
            className="h-7 rounded-ut-sm border border-white/12 px-2 font-mono text-micro uppercase tracking-[0.14em] text-white/55 transition-colors hover:border-white/35 hover:text-white"
          >
            {mapLabels ? "Map labels off" : "Map labels on"}
          </button>
        </div>
      </div>

      {/* hover 小卡（跟随指针，不遮地图、不是 modal） */}
      {hover && (
        <div
          data-globe-card=""
          className="pointer-events-none absolute z-30 w-[196px] rounded-ut-md border border-white/10 bg-[#080d18]/85 p-2.5 backdrop-blur-md"
          style={{
            left: Math.min(Math.max(hover.x + 16, 8), Math.max(8, shellW - 212)),
            top: Math.max(hover.y - 12, 76),
          }}
        >
          <p className="font-display text-body-lg leading-none text-white">{hover.city}</p>
          <p className="mt-1 font-mono text-micro uppercase tracking-[0.16em] text-white/45">
            {hover.country}
          </p>
          <dl className="mt-2 space-y-0.5 font-mono text-micro leading-[1.5] text-white/60">
            <div className="flex gap-2">
              <dt className="shrink-0 text-white/35">Best</dt>
              <dd className="truncate">{hover.bestTime || "Year-round"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0 text-white/35">Budget</dt>
              <dd>{hover.budget}</dd>
            </div>
          </dl>
          {hover.vibes.length > 0 && (
            <p className="mt-1.5 font-mono text-micro uppercase tracking-[0.14em] text-white/35">
              {hover.vibes.slice(0, 4).join(" · ")}
            </p>
          )}
        </div>
      )}

      {/* 底部一条细控件（不是面板） */}
      <div className="absolute inset-x-0 bottom-3 z-20 flex items-end justify-between gap-4 px-4 md:px-8">
        <div className="flex flex-col gap-1">
          {status === "loading" && (
            <p className="font-mono text-micro uppercase tracking-[0.14em] text-white/40">
              Loading globe engine…
            </p>
          )}
          {status === "failed" && (
            <p className="font-mono text-micro uppercase tracking-[0.14em] text-red-300/80">
              Globe engine failed to initialise
            </p>
          )}
          {!token && (
            <p className="font-mono text-micro uppercase tracking-[0.14em] text-amber-200/70">
              Tianditu tk missing — basemap tiles will not load (set NEXT_PUBLIC_TIANDITU_TOKEN in .env.local)
            </p>
          )}
          {token && tileErrors > 0 && (
            <p className="font-mono text-micro uppercase tracking-[0.14em] text-amber-200/70">
              {tileErrors} tile requests failed (check tk / Referer whitelist)
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => zoom(1)}
            aria-label="Zoom in"
            className="h-7 min-w-[28px] rounded-ut-sm border border-white/12 font-mono text-micro text-white/55 transition-colors hover:border-white/35 hover:text-white"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => zoom(-1)}
            aria-label="Zoom out"
            className="h-7 min-w-[28px] rounded-ut-sm border border-white/12 font-mono text-micro text-white/55 transition-colors hover:border-white/35 hover:text-white"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => resetViewRef.current?.()}
            className="h-7 rounded-ut-sm border border-white/12 px-2 font-mono text-micro uppercase tracking-[0.14em] text-white/55 transition-colors hover:border-white/35 hover:text-white"
          >
            Reset
          </button>
        </div>
      </div>

      {/* attribution：合规要求保留数据来源署名（Cesium 会把 credit 渲染到这里） */}
      <div
        ref={creditRef}
        className="absolute bottom-0 right-2 z-20 max-w-[60%] font-mono text-[9px] leading-none text-white/35 [&_a]:text-white/40"
      />
    </div>
  );
}

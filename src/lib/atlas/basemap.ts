/**
 * basemap — **底图 Provider 层**（与地图引擎严格分离）。
 *
 * ⚠️ 本文件**禁止 import maplibre-gl**（连 value import 都不行）：
 *   map-test 的 server component 会 import 本文件（取 DEFAULT_BASEMAP_ID），
 *   一旦把 maplibre 拉进 server graph，Turbopack 会因 maplibre 内部的
 *   `new URL('./'+t, import.meta.url)` 动态解析直接编译失败（整页 500）。
 *   所以这里的类型都是**结构化的本地类型**，与 maplibre 的类型在组件层对接。
 *
 * 架构约定：
 *   Map Engine（map-engine.ts，MapLibre）
 *        ↓ 只吃一份 style 对象
 *   Basemap Provider（本文件：选供应商 / 拼 style URL / 声明要隐藏的图层 / 调色）
 *        ↓ 浏览器**运行时**在线请求 style + tiles
 *   Online Map Service
 *
 * 硬性原则（用户约定，务必保持）：
 *   · 第三方地图数据**只在浏览器运行时在线加载**；
 *   · **禁止**把 tiles/pbf/样式数据下载进仓库、public、src/data，或做任何代理/服务端缓存；
 *   · **绝不**在代码里内置任何可用 key —— 凭证一律由页面从环境变量读出后传入。
 *
 * 当前注册的供应商（都是 MapLibre 生态内、英文、全球的服务）：
 *   · `maptiler-dataviz` —— **生产默认**。MapTiler 是 MapLibre 生态的主要维护者之一，
 *     Dataviz 是为"深色底 + 数据叠加"设计的官方样式；开发可用免费额度，商用需订阅，需要 key。
 *   · `openfreemap-liberty` —— **keyless 预览**。免费托管 OSM 派生矢量瓦片，无需注册；
 *     用于在没有 key 的机器上端到端验证"在线真实地图 + globe + 节点"链路。
 *     捐赠资助的免费服务，**不建议**作为商业生产依赖。
 *   · `none` —— 占位：无任何网络请求的深色球面（引擎/节点验证用）。
 *
 * 合规边界（如实说明）：以上均为境外商业/公共服务，适合 UTRIPLA 的英文/全球定位；
 * 若产品今后变为面向中国境内运营，底图必须按当时的规定重新评估。
 */

/**
 * 以**导航栏实际 computed color** 为基准的调色板（真实值见 map-engine.ts 的推导注释）：
 *   全站深色态导航栏 = rgba(64, 59, 61, 0.82)（暖炭灰，R>B，饱和度极低）
 *   导航栏墨色      = #f5f2ea（暖白）
 * 地图落在这个色相家族（暖灰黑），避免"导航栏暖灰 / 地图蓝黑 / 背景另一种黑"的三层割裂。
 * 层级：海洋最暗 → 陆地稍亮 → 边界/地名更亮 → 节点最亮。
 * （数值与引擎层共用一份事实；这里为了保持 maplibre-free 用字面量镜像，
 *   修改时两处必须同步 —— map-engine.ts 顶部有同样的清单。）
 */
export const UTRIPLA_BASEMAP_PALETTE = {
  space: "#0b0a0a",
  horizon: "#3a3430",
  ocean: "#1b181a",
  land: "#35302f",
  landLow: "#2b2726",
  boundary: "#5a534f",
  text: "#f5f2ea",
  textHalo: "#141112",
} as const;

/** provider 产出的 style 对象（结构子集；组件层再与 MapLibre 类型对接）。 */
export interface BasemapStyleSpec {
  version: 8;
  name?: string;
  sources: Record<string, unknown>;
  layers: unknown[];
  glyphs?: string;
  sprite?: string | string[];
}

/** restyle 钩子能用的最小地图接口（结构化，避免 import maplibre）。 */
export interface RestyleCapableMap {
  getStyle(): { layers: Array<{ id: string; type: string }> };
  setPaintProperty(layerId: string, prop: string, value: unknown): unknown;
}

export interface BasemapContext {
  /**
   * 供应商凭证（如 MapTiler key）。**由页面从环境变量注入**，
   * 本模块绝不读取、也绝不内置任何可用 key。
   */
  credential?: string;
}

export interface BasemapProvider {
  /** 稳定标识，用于选择 provider（map-test 可用 ?basemap= 覆盖）。 */
  readonly id: string;
  /** 面板/调试用的人类可读名称。 */
  readonly label: string;
  /** 是否需要外部凭证；需要而未提供时不会发起注定失败的请求。 */
  readonly requiresCredential: boolean;
  /** key 申请入口（缺失凭证时提示用户去哪里申请）。 */
  readonly keySignupUrl?: string;
  /** 署名文本；渲染到地图 credit 位（各家条款均要求保留）。 */
  readonly attribution?: string;
  /**
   * style URL（浏览器运行时在线加载）。返回 null 表示该 provider 没有远程样式
   * （占位 globe）。key 只在这里拼进 URL，不进引擎、不进组件。
   */
  styleUrl(credential: string | undefined): string | null;
  /**
   * 要隐藏的图层 id 前缀（小写，按图层 id 开头匹配）。道路/POI/楼宇对
   * "探索目的地"是噪音；水系/海岸/边界/地名保留。由引擎执行，本层只声明策略。
   */
  hideLayerPrefixes?: readonly string[];
  /**
   * 供应商自有调色（style 加载后、UTRIPLA 节点加入前执行一次）。
   * 只改 paint 颜色，不动数据、不动图层结构。
   */
  restyle?: (map: RestyleCapableMap) => void;
}

/** MapTiler Dataviz：深色数据可视化底图（生产默认）。 */
export const MAPTILER_DATAVIZ: BasemapProvider = {
  id: "maptiler-dataviz",
  label: "MapTiler Dataviz (dark)",
  requiresCredential: true,
  keySignupUrl: "https://cloud.maptiler.com/account/keys/",
  attribution: "© MapTiler © OpenStreetMap contributors",
  styleUrl: (credential) =>
    credential && credential.trim()
      ? `https://api.maptiler.com/maps/dataviz/style.json?key=${encodeURIComponent(credential.trim())}`
      : null,
  hideLayerPrefixes: ["road", "bridge", "tunnel", "transit", "poi", "building", "aeroway", "airport"],
};

/** OpenFreeMap Liberty：keyless 在线真实地图（开发/预览用）。 */
export const OPENFREEMAP_LIBERTY: BasemapProvider = {
  id: "openfreemap-liberty",
  label: "OpenFreeMap Liberty (keyless preview)",
  requiresCredential: false,
  attribution: "© OpenStreetMap contributors (hosted by OpenFreeMap)",
  styleUrl: () => "https://tiles.openfreemap.org/styles/liberty",
  hideLayerPrefixes: [
    "tunnel", "road", "bridge", "building", "poi", "aeroway", "airport", "highway-shield", "highway-name",
  ],
  /**
   * Liberty 原生是浅色样式，直接用会违背"深色科技"目标 —— 在这里压成导航栏同族的
   * 暖炭灰调色板。只动 paint；MapTiler Dataviz 是原生深色，无需这一步。
   */
  restyle: (map) => {
    const P = UTRIPLA_BASEMAP_PALETTE;
    for (const layer of map.getStyle().layers) {
      const id = layer.id;
      try {
        if (layer.type === "background") {
          map.setPaintProperty(id, "background-color", P.land);
        } else if (layer.type === "fill") {
          if (/^water/.test(id)) {
            map.setPaintProperty(id, "fill-color", P.ocean);
          } else if (/^landcover|^landuse|^park|^natural/.test(id)) {
            map.setPaintProperty(id, "fill-color", P.landLow);
            map.setPaintProperty(id, "fill-opacity", 0.85);
          }
        } else if (layer.type === "line" && /^boundary/.test(id)) {
          map.setPaintProperty(id, "line-color", P.boundary);
          map.setPaintProperty(id, "line-opacity", 0.75);
        } else if (layer.type === "symbol") {
          // 地名文字 = 导航栏墨色（暖白）+ 深色描边（浅色样式原本是深字浅晕，反过来）
          map.setPaintProperty(id, "text-color", P.text);
          map.setPaintProperty(id, "text-halo-color", P.textHalo);
          map.setPaintProperty(id, "text-halo-width", 1.4);
        }
      } catch {
        /* 个别图层属性名不同则跳过，不影响整体调色 */
      }
    }
  },
};

/**
 * 占位 provider —— 无任何网络请求：只有一层深色背景把球面填成暖炭黑，
 * 配合引擎的 `setSky` 得到边缘光晕。**不是自绘大陆**。
 * 注意：没有 glyphs 源，因此该模式下地图侧文字图层（symbol/text）无法渲染。
 */
export const PLACEHOLDER_BASEMAP: BasemapProvider = {
  id: "none",
  label: "Placeholder surface (no external tiles)",
  requiresCredential: false,
  styleUrl: () => null,
};

export const BASEMAP_PROVIDERS: readonly BasemapProvider[] = [
  MAPTILER_DATAVIZ,
  OPENFREEMAP_LIBERTY,
  PLACEHOLDER_BASEMAP,
];

/** 生产默认：MapTiler（key 缺失时由 loader 走降级路径，不会白屏）。 */
export const DEFAULT_BASEMAP_ID = MAPTILER_DATAVIZ.id;

/** 按 id 取 provider；未知 id 回落到占位（绝不静默连外部服务）。 */
export function resolveBasemapProvider(id: string | undefined): BasemapProvider {
  return BASEMAP_PROVIDERS.find((p) => p.id === id) ?? PLACEHOLDER_BASEMAP;
}

/** provider 当前是否具备发起请求的条件（需要 key 的必须有 key）。 */
export function isBasemapConfigured(provider: BasemapProvider, ctx: BasemapContext): boolean {
  return !provider.requiresCredential || Boolean(ctx.credential && ctx.credential.trim());
}

/**
 * 占位样式：一层深色背景，零 sources / 零 glyphs / 零网络。
 * 导出给 MapLibreGlobeSurface 做"零网络首帧启动"：地图先用它把球面立起来，
 * 真实底图 style 在非关键路径上异步到位后再 setStyle 无缝替换。
 */
export function placeholderStyle(): BasemapStyleSpec {
  return {
    version: 8,
    name: "UTRIPLA · basemap placeholder (engine verification)",
    sources: {},
    layers: [
      { id: "globe-surface", type: "background", paint: { "background-color": "#05070f" } },
    ],
  };
}

export interface LoadedBasemap {
  style: BasemapStyleSpec;
  /**
   * true = 底图没能上线（缺 key / 网络 / HTTP 错误），已降级为占位球面。
   * 组件据此显示轻量提示，globe / 节点 / 链接层照常工作，绝不白屏。
   */
  degraded: boolean;
  /** 降级原因（展示用）。 */
  reason?: string;
}

/**
 * 在浏览器**运行时**加载底图样式。
 *
 * · style JSON 属于被允许的运行时在线资源（见文件头"允许"清单）；
 * · 请求由浏览器直接发往供应商，UTRIPLA 不设任何代理、缓存或落盘；
 * · 任何失败都降级为占位球面并给出 reason —— 绝不让页面白屏。
 */
export async function loadBasemapStyle(
  provider: BasemapProvider,
  ctx: BasemapContext,
): Promise<LoadedBasemap> {
  if (!isBasemapConfigured(provider, ctx)) {
    return {
      style: placeholderStyle(),
      degraded: true,
      reason: provider.keySignupUrl
        ? `${provider.label}: token missing — get one at ${provider.keySignupUrl}`
        : `${provider.label}: token missing`,
    };
  }
  const url = provider.styleUrl(ctx.credential);
  if (!url) return { style: placeholderStyle(), degraded: false };

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(12_000) });
    if (!res.ok) {
      const hint =
        res.status === 403
          ? "key rejected (403) — check NEXT_PUBLIC_MAP_PROVIDER_TOKEN"
          : `HTTP ${res.status}`;
      return { style: placeholderStyle(), degraded: true, reason: `${provider.label}: ${hint}` };
    }
    const style = (await res.json()) as BasemapStyleSpec;
    return { style, degraded: false };
  } catch (err) {
    return {
      style: placeholderStyle(),
      degraded: true,
      reason: `${provider.label}: ${err instanceof Error ? err.name : "network error"} — cannot reach map service`,
    };
  }
}

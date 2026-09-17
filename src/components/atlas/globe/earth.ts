/**
 * earth — /destinations 的"夜晚地球"WebGL 引擎（framework-agnostic，无 React 依赖）。
 *
 * 本轮（视觉重构）相对上一版的关键变化：
 *   1. 地球上屏尺寸由**目标屏幕占比**反推相机距离（直径 ≈ 1.22×容器高，宽屏按宽度继续放大，
 *      上限 1.62× —— 允许出血），不再是"一颗居中的小球"。见 globeMetrics()。
 *   2. 地理数据升级到 Natural Earth 1:50m（构建期简化，见 data/world/land-50m.ts），
 *      遮罩改为 4096×2048 单通道 DataTexture —— 海岸线从"贴纸"变细腻。
 *   3. 明度层级重建：海洋最暗 → 大陆明显更亮 → 海岸带微光 → 星尘 → 节点 → 选中节点。
 *   4. 新增**地球空间标签系统**（大洲名 + 重要城市名 + hover/选中城市名）：DOM 池按当前帧
 *      投影定位，随地球旋转，带屏幕空间去重叠；React 不参与逐帧更新。
 *   5. 节点两档视觉层级（major / secondary）+ 深度衰减，145 点不再糊成一团。
 *
 * 保留：拖拽旋转（含惯性）、双指/⌘滚轮缩放、屏幕空间拾取、用户交互后永不自转、
 * 离屏/隐藏时停帧、静止降频、WebGL 失败回调。
 */

import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DataTexture,
  DoubleSide,
  Group,
  LineBasicMaterial,
  LineSegments,
  LinearFilter,
  Mesh,
  PerspectiveCamera,
  Points,
  RedFormat,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  UnsignedByteType,
  Vector3,
  WebGLRenderer,
} from "three";
import { LAND_RINGS } from "@/data/world/land-50m";
import { REGION_LABEL_ANCHORS } from "@/data/world/region-labels";
import { createLandMask } from "./land-mask";

// ── 类型 ──────────────────────────────────────────────────────────────

export interface EarthNode {
  slug: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  /** 0..1：当前月份下该目的地的适宜度（canonical tier 派生）→ 亮度 */
  emphasis: number;
  /** false = 被 vibe lens 淡出（数据保留，不删除） */
  visible: boolean;
  /** 0..1：重要度（1 = 站点精选目的地）→ 尺寸 + 是否常驻城市标签 */
  importance: number;
}

export interface EarthHover {
  slug: string;
  x: number;
  y: number;
}

/** 验证/调试用实测指标 */
export interface GlobeMetrics {
  shellWidth: number;
  shellHeight: number;
  /** 地球在屏幕上的直径（CSS px，由相机参数反算） */
  globeDiameterPx: number;
  /** 地球直径 / 容器高度 */
  globeHeightRatio: number;
  cameraDistance: number;
  maskResolution: string;
  drawCallsPerFrame: number;
}

export interface EarthSceneOptions {
  canvas: HTMLCanvasElement;
  container: HTMLElement;
  /** 标签层容器（React 渲染的空 div；引擎只写它的子节点） */
  labelLayer: HTMLElement;
  nodes: EarthNode[];
  onHover: (hover: EarthHover | null) => void;
  onNodeClick: (slug: string, isTouch: boolean) => void;
  onFailure: (reason: string) => void;
  reduceMotion: boolean;
}

export interface EarthSceneHandle {
  update(nodes: EarthNode[]): void;
  setSelected(slug: string | null): void;
  zoomBy(factor: number): void;
  resetView(): void;
  /** 平滑转到指定经纬度（搜索定位用）；durationMs 缺省 1400，reduce-motion 时直接跳转 */
  flyTo(lonDeg: number, latDeg: number, durationMs?: number): void;
  globeMetrics(): GlobeMetrics;
  dispose(): void;
}

// ── 常量与纯函数 ──────────────────────────────────────────────────────

const RADIUS = 1;
const FOV = 38;
const TAN_HALF_FOV = Math.tan(((FOV / 2) * Math.PI) / 180);

/**
 * 地球半径的目标 NDC 值（= 半径 / 半容器高 = 直径 / 容器高）。
 * ≥1.22 表示地球比容器还高（上下出血）；宽屏按 0.78×容器宽继续放大，最高 1.62。
 */
function globeNdcRadius(width: number, height: number, coarse: boolean): number {
  const byHeight = coarse ? 1.3 : 1.22;
  const byWidth = (0.78 * width) / height;
  return Math.min(coarse ? 1.5 : 1.62, Math.max(byHeight, byWidth));
}

function latLonToVector3(lat: number, lon: number, r = RADIUS): Vector3 {
  const phi = (lat * Math.PI) / 180;
  const theta = (lon * Math.PI) / 180;
  return new Vector3(
    r * Math.cos(phi) * Math.cos(theta),
    r * Math.sin(phi),
    r * Math.cos(phi) * Math.sin(theta),
  );
}

function makeRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function hasWebGL(): boolean {
  try {
    const probe = document.createElement("canvas");
    const gl =
      probe.getContext("webgl2") ||
      probe.getContext("webgl") ||
      probe.getContext("experimental-webgl");
    return Boolean(gl);
  } catch {
    return false;
  }
}

// ── 主入口 ────────────────────────────────────────────────────────────

export function createEarthScene(options: EarthSceneOptions): EarthSceneHandle {
  const { canvas, container, labelLayer, onHover, onNodeClick, onFailure, reduceMotion } = options;

  if (!hasWebGL()) {
    onFailure("no-webgl");
    return noopHandle();
  }

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
  } catch (err) {
    onFailure(`renderer: ${String(err)}`);
    return noopHandle();
  }

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.6 : 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 140);
  const earth = new Group();
  scene.add(earth);

  // ── 1) 陆地遮罩：单通道 DataTexture（分辨率随设备） ───────────────────
  const MASK_W = coarse ? 2048 : 4096;
  const MASK_H = MASK_W / 2;
  const mask = createLandMask(MASK_W, MASK_H);
  const maskTexture = new DataTexture(
    mask.data,
    mask.width,
    mask.height,
    RedFormat,
    UnsignedByteType,
  );
  maskTexture.minFilter = LinearFilter;
  maskTexture.magFilter = LinearFilter;
  maskTexture.generateMipmaps = false;
  maskTexture.needsUpdate = true;

  // ── 2) 球体：海洋最暗 / 大陆明显更亮 / 海岸带微光 / 夜侧明暗 ──────────
  const globeMat = new ShaderMaterial({
    uniforms: {
      uMask: { value: maskTexture },
      uOcean: { value: new Color("#04070f") },
      uLand: { value: new Color("#243243") },
      uCoast: { value: new Color("#8fb0d0") },
      uRim: { value: new Color("#7f9dc4") },
      uWarm: { value: new Color("#d6ae86") },
      uLightDir: { value: new Vector3(0.6, 0.3, 0.72).normalize() },
    },
    vertexShader: /* glsl */ `
      varying vec3 vLocal;
      varying vec3 vNormalW;
      varying vec3 vViewDir;
      void main() {
        vLocal = position;
        vec4 world = modelMatrix * vec4(position, 1.0);
        vNormalW = normalize(mat3(modelMatrix) * normal);
        vViewDir = normalize(cameraPosition - world.xyz);
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMask;
      uniform vec3 uOcean, uLand, uCoast, uRim, uWarm;
      uniform vec3 uLightDir;
      varying vec3 vLocal;
      varying vec3 vNormalW;
      varying vec3 vViewDir;

      void main() {
        vec3 n = normalize(vLocal);
        float lon = atan(n.z, n.x);
        float lat = asin(clamp(n.y, -1.0, 1.0));
        vec2 uv = vec2((lon + 3.14159265) / 6.28318531, (1.57079633 - lat) / 3.14159265);
        float land = texture2D(uMask, uv).r;

        vec2 texel = vec2(1.0 / 4096.0, 1.0 / 2048.0);
        float lx = texture2D(uMask, uv + vec2(texel.x, 0.0)).r - texture2D(uMask, uv - vec2(texel.x, 0.0)).r;
        float ly = texture2D(uMask, uv + vec2(0.0, texel.y)).r - texture2D(uMask, uv - vec2(0.0, texel.y)).r;
        float edge = clamp(length(vec2(lx, ly)) * 2.6, 0.0, 1.0);

        // 夜面：太空视角只做纵深，不做"白天地球"
        float lit = dot(normalize(vNormalW), normalize(uLightDir));
        float night = smoothstep(-0.45, 0.6, lit);

        vec3 base = mix(uOcean, uLand, land);
        base *= mix(0.7, 1.08, night);

        // 海岸带：大陆边界一圈更亮（保证大陆轮廓清晰可辨）
        float coast = edge * (0.35 + 0.65 * land) * mix(0.55, 1.0, night);
        float fres = pow(1.0 - clamp(dot(normalize(vNormalW), normalize(vViewDir)), 0.0, 1.0), 2.4);
        vec3 rim = mix(uRim, uWarm, (1.0 - night) * 0.4) * fres * 0.85;

        gl_FragColor = vec4(base + uCoast * coast * 0.8 + rim, 1.0);
      }
    `,
  });
  const globe = new Mesh(new SphereGeometry(RADIUS, 128, 80), globeMat);
  earth.add(globe);

  // ── 3) 海岸线：矢量几何（分辨率无关，比遮罩更锐） ────────────────────
  const coastPositions: number[] = [];
  for (const ring of LAND_RINGS) {
    for (let i = 0; i < ring.length; i += 1) {
      const [lon1, lat1] = ring[i];
      const [lon2, lat2] = ring[(i + 1) % ring.length];
      if (Math.abs(lon1 - lon2) > 180) continue;
      latLonToVector3(lat1, lon1, RADIUS * 1.0006).toArray(coastPositions, coastPositions.length);
      latLonToVector3(lat2, lon2, RADIUS * 1.0006).toArray(coastPositions, coastPositions.length);
    }
  }
  const coastGeo = new BufferGeometry();
  coastGeo.setAttribute("position", new BufferAttribute(new Float32Array(coastPositions), 3));
  const coastMat = new LineBasicMaterial({
    color: new Color("#a9c4e0"),
    transparent: true,
    opacity: 0.34,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  earth.add(new LineSegments(coastGeo, coastMat));

  // ── 4) 大气：非常轻的一层 ────────────────────────────────────────────
  const atmoMat = new ShaderMaterial({
    uniforms: { uColor: { value: new Color("#8aa6c8") }, uWarm: { value: new Color("#d6ae86") } },
    vertexShader: /* glsl */ `
      varying vec3 vNormalW;
      varying vec3 vViewDir;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vNormalW = normalize(mat3(modelMatrix) * normal);
        vViewDir = normalize(cameraPosition - world.xyz);
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor, uWarm;
      varying vec3 vNormalW;
      varying vec3 vViewDir;
      void main() {
        float f = pow(1.0 - clamp(dot(normalize(vNormalW), normalize(vViewDir)), 0.0, 1.0), 3.2);
        gl_FragColor = vec4(mix(uColor, uWarm, 0.24), f * 0.32);
      }
    `,
    transparent: true,
    blending: AdditiveBlending,
    side: DoubleSide,
    depthWrite: false,
  });
  scene.add(new Mesh(new SphereGeometry(RADIUS * 1.14, 64, 48), atmoMat));

  // ── 5) 星尘 ─────────────────────────────────────────────────────────
  const rand = makeRandom(20260914);
  const starCount = coarse ? 1100 : 2000;
  const starPos = new Float32Array(starCount * 3);
  const starSize = new Float32Array(starCount);
  for (let i = 0; i < starCount; i += 1) {
    const u = rand() * 2 - 1;
    const t = rand() * Math.PI * 2;
    const r = 16 + rand() * 14;
    const s = Math.sqrt(1 - u * u);
    starPos[i * 3] = r * s * Math.cos(t);
    starPos[i * 3 + 1] = r * u;
    starPos[i * 3 + 2] = r * s * Math.sin(t);
    starSize[i] = rand() < 0.88 ? 0.5 + rand() * 0.7 : 1.3 + rand() * 1.1;
  }
  const starGeo = new BufferGeometry();
  starGeo.setAttribute("position", new BufferAttribute(starPos, 3));
  starGeo.setAttribute("aSize", new BufferAttribute(starSize, 1));
  const starMat = new ShaderMaterial({
    uniforms: { uPixelRatio: { value: renderer.getPixelRatio() } },
    vertexShader: /* glsl */ `
      attribute float aSize;
      uniform float uPixelRatio;
      varying float vA;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * uPixelRatio;
        vA = 0.16 + 0.46 * aSize;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vA;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        gl_FragColor = vec4(vec3(0.84, 0.88, 0.96), vA * smoothstep(0.5, 0.0, d));
      }
    `,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  scene.add(new Points(starGeo, starMat));

  // ── 6) 目的地节点：单个 Points + 两档层级 + 深度衰减 ──────────────────
  let nodes: EarthNode[] = options.nodes;
  const maxNodes = Math.max(nodes.length, 1);
  const nodePos = new Float32Array(maxNodes * 3);
  const nodeEmphasis = new Float32Array(maxNodes);
  const nodeVisible = new Float32Array(maxNodes);
  const nodeSelected = new Float32Array(maxNodes);
  const nodePhase = new Float32Array(maxNodes);
  const nodeImportance = new Float32Array(maxNodes);
  const nodeGeo = new BufferGeometry();
  nodeGeo.setAttribute("position", new BufferAttribute(nodePos, 3));
  nodeGeo.setAttribute("aEmphasis", new BufferAttribute(nodeEmphasis, 1));
  nodeGeo.setAttribute("aVisible", new BufferAttribute(nodeVisible, 1));
  nodeGeo.setAttribute("aSelected", new BufferAttribute(nodeSelected, 1));
  nodeGeo.setAttribute("aPhase", new BufferAttribute(nodePhase, 1));
  nodeGeo.setAttribute("aImportance", new BufferAttribute(nodeImportance, 1));
  nodeGeo.setDrawRange(0, 0);

  const nodeMat = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: coarse ? 26 : 30 },
      uPixelRatio: { value: renderer.getPixelRatio() },
      uColor: { value: new Color("#f6e3c2") },
      uSelColor: { value: new Color("#ffcf8a") },
    },
    vertexShader: /* glsl */ `
      attribute float aEmphasis;
      attribute float aVisible;
      attribute float aSelected;
      attribute float aPhase;
      attribute float aImportance;
      uniform float uTime, uSize, uPixelRatio;
      varying float vAlpha;
      varying float vGlow;
      varying float vSel;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float breath = 1.0 + 0.08 * sin(uTime * 0.3 + aPhase);
        float tier = 0.42 + 0.58 * aImportance;         // 两档：普通 / 重要
        float size = uSize * tier * (0.5 + 0.5 * aEmphasis) * (1.0 + 0.9 * aSelected) * breath;
        gl_PointSize = clamp(size * uPixelRatio / -mv.z, 0.8, 78.0);
        gl_Position = projectionMatrix * mv;

        vec3 nWorld = normalize(mat3(modelMatrix) * normalize(position));
        vec3 view = normalize(cameraPosition - (modelMatrix * vec4(position, 1.0)).xyz);
        float facing = dot(nWorld, view);
        // 深度：背面与球缘的点显著变暗，145 点不会糊成一团
        vAlpha = aVisible * smoothstep(0.12, 0.42, facing) * (0.55 + 0.45 * aImportance);
        vGlow = 0.35 + 0.65 * aEmphasis;
        vSel = aSelected;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor, uSelColor;
      varying float vAlpha;
      varying float vGlow;
      varying float vSel;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        if (r > 1.0) discard;
        float core = smoothstep(1.0, 0.0, r);
        float halo = pow(max(0.0, 1.0 - r), 2.8);
        float a = (core * core * 0.92 + halo * 0.42) * vAlpha * vGlow;
        if (a < 0.012) discard;
        vec3 col = mix(uColor, uSelColor, clamp(vSel, 0.0, 1.0));
        gl_FragColor = vec4(col * (0.8 + 0.75 * core), a);
      }
    `,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  earth.add(new Points(nodeGeo, nodeMat));

  // ── 状态 ────────────────────────────────────────────────────────────
  const state = {
    yaw: -1.15,
    pitch: 0.2,
    dist: 1,
    baseDist: 1,
    velYaw: 0,
    velPitch: 0,
    dragging: false,
    hovering: null as string | null,
    selected: null as string | null,
    interacting: false,
    /** 用户一旦交互（拖拽 / hover 命中）就永久停止自转：避免"追移动目标" */
    engaged: false,
  };

  function pushNodes(list: EarthNode[]) {
    nodes = list;
    const count = Math.min(list.length, maxNodes);
    for (let i = 0; i < count; i += 1) {
      const n = list[i];
      const v = latLonToVector3(n.lat, n.lon, RADIUS * 1.003);
      nodePos[i * 3] = v.x;
      nodePos[i * 3 + 1] = v.y;
      nodePos[i * 3 + 2] = v.z;
      nodeEmphasis[i] = Math.min(1, Math.max(0, n.emphasis));
      nodeVisible[i] = n.visible ? 1 : 0.06;
      nodeSelected[i] = state.selected === n.slug ? 1 : 0;
      nodePhase[i] = (i % 19) * 0.31;
      nodeImportance[i] = Math.min(1, Math.max(0, n.importance));
    }
    nodeGeo.setDrawRange(0, count);
    for (const name of ["position", "aEmphasis", "aVisible", "aSelected", "aPhase", "aImportance"]) {
      const attr = nodeGeo.getAttribute(name) as BufferAttribute | undefined;
      if (attr) attr.needsUpdate = true;
    }
  }
  pushNodes(nodes);

  // ── 标签池（提前声明：resize() → publishMetrics() 会先于标签系统被调用） ──
  const labelEls: HTMLSpanElement[] = [];

  // ── 尺寸：由目标屏幕占比反推相机距离 ─────────────────────────────────
  let shellW = 1;
  let shellH = 1;

  /** 把实测指标写到容器 dataset（验收/调试用；不触发 React 渲染） */
  function publishMetrics() {
    const ndc = RADIUS / (state.dist * TAN_HALF_FOV);
    const diameter = Math.round(ndc * shellH);
    container.dataset.globeMetrics = JSON.stringify({
      shellHeight: shellH,
      shellWidth: shellW,
      globeDiameterPx: diameter,
      globeHeightRatio: shellH > 0 ? Number((diameter / shellH).toFixed(3)) : 0,
      cameraDistance: Number(state.dist.toFixed(3)),
      maskResolution: `${MASK_W}x${MASK_H}`,
      labels: labelEls.filter((el) => el.style.display !== "none").length,
      drawCalls: renderer.info.render.calls,
    });
  }

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;
    shellW = w;
    shellH = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const ndc = globeNdcRadius(w, h, coarse);
    state.baseDist = RADIUS / (ndc * TAN_HALF_FOV);
    if (!state.interacting) state.dist = state.baseDist;
    publishMetrics();
  }
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  // ── 标签系统（DOM 池；随地球旋转 + 屏幕空间去重叠） ───────────────────
  const LABEL_POOL = 26;
  for (let i = 0; i < LABEL_POOL; i += 1) {
    const el = document.createElement("span");
    el.className = "ut-globe-label";
    el.setAttribute("aria-hidden", "true");
    el.style.display = "none";
    labelLayer.appendChild(el);
    labelEls.push(el);
  }

  interface LabelCandidate {
    text: string;
    kind: "region" | "city" | "hover" | "selected";
    lat: number;
    lon: number;
    priority: number;
    minDist: number;
  }

  const regionCandidates: LabelCandidate[] = REGION_LABEL_ANCHORS.map((r) => ({
    text: r.label,
    kind: "region",
    lat: r.lat,
    lon: r.lon,
    priority: 10,
    minDist: 100,
  }));

  const tmpLabel = new Vector3();
  const camDir = new Vector3();

  function projectToScreen(lat: number, lon: number) {
    tmpLabel.copy(latLonToVector3(lat, lon, RADIUS * 1.005)).applyMatrix4(earth.matrixWorld);
    const facing = -tmpLabel.clone().normalize().dot(camDir);
    tmpLabel.project(camera);
    return {
      x: ((tmpLabel.x + 1) / 2) * shellW,
      y: ((1 - tmpLabel.y) / 2) * shellH,
      facing,
    };
  }

  function updateLabels() {
    camera.getWorldDirection(camDir);
    const candidates: LabelCandidate[] = [...regionCandidates];

    // 重要城市常驻标签：数组顺序即优先级（WorldAtlas 把精选目的地排在前面）
    for (let i = 0; i < nodes.length && i < maxNodes; i += 1) {
      const n = nodes[i];
      if (n.importance < 0.5) continue;
      candidates.push({
        text: n.city,
        kind: "city",
        lat: n.lat,
        lon: n.lon,
        priority: 5,
        minDist: 76,
      });
    }

    // hover / selected：最高优先级
    const active: [string | null, "selected" | "hover", number][] = [
      [state.selected, "selected", 30],
      [state.hovering, "hover", 20],
    ];
    for (const [slug, kind, priority] of active) {
      if (!slug) continue;
      const n = nodes.find((x) => x.slug === slug);
      if (!n) continue;
      candidates.push({ text: n.city, kind, lat: n.lat, lon: n.lon, priority, minDist: 0 });
    }

    const projected = candidates
      .map((c) => ({ c, p: projectToScreen(c.lat, c.lon) }))
      .sort((a, b) => b.c.priority - a.c.priority);

    const placed: { x: number; y: number; d: number }[] = [];
    let used = 0;
    for (const { c, p } of projected) {
      if (used >= labelEls.length) break;
      if (p.facing < 0.22) continue;
      if (p.x < -80 || p.x > shellW + 80 || p.y < -40 || p.y > shellH + 40) continue;
      if (c.minDist > 0) {
        let clash = false;
        for (const q of placed) {
          if (Math.hypot(q.x - p.x, q.y - p.y) < Math.max(q.d, c.minDist)) {
            clash = true;
            break;
          }
        }
        if (clash) continue;
      }
      placed.push({ x: p.x, y: p.y, d: c.minDist });

      const el = labelEls[used];
      used += 1;
      const fade = Math.min(1, Math.max(0, (p.facing - 0.22) / 0.5));
      el.textContent = c.text;
      el.dataset.kind = c.kind;
      el.style.display = "";
      el.style.opacity = (
        c.kind === "region" ? fade * 0.55 : c.kind === "city" ? fade * 0.72 : fade * 0.98
      ).toFixed(3);
      const offset =
        c.kind === "region"
          ? "translate(-50%, -50%)"
          : "translate(11px, -50%)";
      el.style.transform = `translate3d(${Math.round(p.x)}px, ${Math.round(p.y)}px, 0) ${offset}`;
    }
    for (let i = used; i < labelEls.length; i += 1) {
      if (labelEls[i].style.display !== "none") labelEls[i].style.display = "none";
    }
  }

  // ── 屏幕空间拾取 ────────────────────────────────────────────────────
  const projectedNodes: { slug: string; x: number; y: number; front: number }[] = [];
  const tmpPick = new Vector3();
  const hitRadius = coarse ? 24 : 16;

  function projectNodes() {
    projectedNodes.length = 0;
    if (shellW === 0 || shellH === 0) return;
    camera.getWorldDirection(camDir);
    for (let i = 0; i < nodes.length && i < maxNodes; i += 1) {
      tmpPick.set(nodePos[i * 3], nodePos[i * 3 + 1], nodePos[i * 3 + 2]);
      tmpPick.applyMatrix4(earth.matrixWorld);
      const facing = -tmpPick.clone().normalize().dot(camDir);
      tmpPick.project(camera);
      if (tmpPick.z > 1) continue;
      projectedNodes.push({
        slug: nodes[i].slug,
        x: ((tmpPick.x + 1) / 2) * shellW,
        y: ((1 - tmpPick.y) / 2) * shellH,
        front: facing,
      });
    }
  }

  function pick(px: number, py: number): EarthHover | null {
    let best: EarthHover | null = null;
    let bestD = hitRadius * hitRadius;
    for (const p of projectedNodes) {
      if (p.front < 0.12) continue;
      const dx = p.x - px;
      const dy = p.y - py;
      const d = dx * dx + dy * dy;
      if (d < bestD) {
        bestD = d;
        best = { slug: p.slug, x: p.x, y: p.y };
      }
    }
    return best;
  }

  // ── 渲染循环（交互全速 / 静止降频 / 离屏与隐藏停帧） ──────────────────
  /** 搜索定位动画：用户任何拖拽/缩放都会取消 */
  let flyAnim: { yaw0: number; pitch0: number; yaw1: number; pitch1: number; t0: number; dur: number } | null = null;
  let raf = 0;
  let last = performance.now();
  let lastPaint = 0;
  let frameNo = 0;
  let visible = true;
  const IDLE_INTERVAL = 1000 / 24;

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (!visible || document.hidden) {
      last = now;
      return;
    }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    frameNo += 1;

    if (!state.dragging && (Math.abs(state.velYaw) > 1e-4 || Math.abs(state.velPitch) > 1e-4)) {
      state.yaw += state.velYaw * dt;
      state.pitch = Math.max(-1.1, Math.min(1.1, state.pitch + state.velPitch * dt));
      state.velYaw *= 0.92;
      state.velPitch *= 0.92;
    } else if (!state.dragging && !state.hovering && !reduceMotion && !state.engaged) {
      // 首屏极慢漂移（≈ 12 分钟一圈）；交互后永久停止
      state.yaw -= 0.0085 * dt;
    }

    // 搜索定位：easeInOutCubic 把 yaw/pitch 归位到目标经纬度
    if (flyAnim && !state.dragging) {
      const t = Math.min(1, (now - flyAnim.t0) / flyAnim.dur);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      state.yaw = flyAnim.yaw0 + (flyAnim.yaw1 - flyAnim.yaw0) * e;
      state.pitch = flyAnim.pitch0 + (flyAnim.pitch1 - flyAnim.pitch0) * e;
      if (t >= 1) flyAnim = null;
    }

    const interacting = state.dragging || state.interacting || flyAnim !== null;
    if (!interacting && now - lastPaint < IDLE_INTERVAL) return;
    lastPaint = now;

    earth.rotation.y = state.yaw;
    earth.rotation.x = state.pitch;
    earth.updateMatrixWorld();
    camera.position.set(0, 0, state.dist);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();

    nodeMat.uniforms.uTime.value = now / 1000;

    projectNodes();
    if (frameNo % 2 === 0 || interacting) updateLabels();

    renderer.render(scene, camera);
    if (frameNo === 2) publishMetrics();
  }
  raf = requestAnimationFrame(frame);

  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      visible = entries.some((e) => e.isIntersecting);
    },
    { rootMargin: "140px" },
  );
  visibilityObserver.observe(container);

  // ── 指针交互 ────────────────────────────────────────────────────────
  const pointers = new Map<number, { x: number; y: number }>();
  let pinchStart = 0;
  let pinchStartDist = 1;
  let moved = 0;
  let downAt = 0;

  const localXY = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  function onPointerDown(e: PointerEvent) {
    // 先记录指针再尝试捕获：pointer capture 在少数情况下会抛（无活动指针 / 元素已卸载），
    // 不能让它打断交互主流程。
    const p = localXY(e);
    pointers.set(e.pointerId, p);
    moved = 0;
    downAt = performance.now();
    state.engaged = true;
    flyAnim = null; // 用户接管视角：取消搜索定位动画
    try {
      canvas.setPointerCapture?.(e.pointerId);
    } catch {
      /* 捕获失败不影响拖拽与点击逻辑 */
    }
    if (pointers.size === 1) {
      state.dragging = true;
      state.velYaw = 0;
      state.velPitch = 0;
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchStart = Math.hypot(a.x - b.x, a.y - b.y);
      pinchStartDist = state.dist;
    }
  }

  function onPointerMove(e: PointerEvent) {
    const p = localXY(e);
    const prev = pointers.get(e.pointerId);

    if (pointers.size === 2 && prev) {
      pointers.set(e.pointerId, p);
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchStart > 8 && d > 8) {
        const ratio = pinchStart / d;
        state.dist = Math.max(
          state.baseDist * 0.6,
          Math.min(state.baseDist * 2.0, pinchStartDist * ratio),
        );
      }
      return;
    }

    if (state.dragging && prev) {
      const dx = p.x - prev.x;
      const dy = p.y - prev.y;
      moved += Math.abs(dx) + Math.abs(dy);
      pointers.set(e.pointerId, p);
      const k = 0.0038 * (state.dist / state.baseDist);
      state.yaw += dx * k;
      state.pitch = Math.max(-1.1, Math.min(1.1, state.pitch - dy * k * 0.8));
      state.velYaw = dx * k * 6;
      state.velPitch = -dy * k * 5;
      return;
    }

    const hover = pick(p.x, p.y);
    if (hover) state.engaged = true;
    if ((hover?.slug ?? null) !== state.hovering) {
      state.hovering = hover?.slug ?? null;
      onHover(hover);
    } else if (hover) {
      onHover(hover);
    }
  }

  function onPointerUp(e: PointerEvent) {
    const p = pointers.get(e.pointerId);
    pointers.delete(e.pointerId);
    if (pointers.size === 0) state.dragging = false;
    if (p && moved < 8 && performance.now() - downAt < 600) {
      const hit = pick(p.x, p.y);
      if (hit) onNodeClick(hit.slug, e.pointerType !== "mouse");
    }
    try {
      canvas.releasePointerCapture?.(e.pointerId);
    } catch {
      /* 未捕获时释放会抛：忽略 */
    }
  }

  function onPointerLeave() {
    state.interacting = false;
    if (state.hovering !== null) {
      state.hovering = null;
      onHover(null);
    }
  }

  function onWheel(e: WheelEvent) {
    // 默认不劫持页面滚动：只有 ⌘/Ctrl + 滚轮才缩放
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    flyAnim = null;
    const next = state.dist * (1 + Math.sign(e.deltaY) * 0.09);
    state.dist = Math.max(state.baseDist * 0.6, Math.min(state.baseDist * 2.0, next));
  }

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("pointerleave", onPointerLeave);
  canvas.addEventListener("wheel", onWheel, { passive: false });

  function onContextLost(event: Event) {
    event.preventDefault();
    teardown();
    onFailure("context-lost");
  }
  canvas.addEventListener("webglcontextlost", onContextLost);

  // ── 生命周期 ────────────────────────────────────────────────────────
  let disposed = false;
  function teardown() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(raf);
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerup", onPointerUp);
    canvas.removeEventListener("pointercancel", onPointerUp);
    canvas.removeEventListener("pointerleave", onPointerLeave);
    canvas.removeEventListener("wheel", onWheel);
    canvas.removeEventListener("webglcontextlost", onContextLost);
    for (const el of labelEls) el.remove();
    globe.geometry.dispose();
    globeMat.dispose();
    coastGeo.dispose();
    coastMat.dispose();
    starGeo.dispose();
    starMat.dispose();
    nodeGeo.dispose();
    nodeMat.dispose();
    maskTexture.dispose();
    atmoMat.dispose();
    renderer.dispose();
  }

  return {
    update(list: EarthNode[]) {
      pushNodes(list);
    },
    setSelected(slug: string | null) {
      state.selected = slug;
      for (let i = 0; i < nodes.length && i < maxNodes; i += 1) {
        nodeSelected[i] = nodes[i].slug === slug ? 1 : 0;
      }
      (nodeGeo.getAttribute("aSelected") as BufferAttribute).needsUpdate = true;
    },
    zoomBy(factor: number) {
      const next = state.dist * factor;
      state.dist = Math.max(state.baseDist * 0.6, Math.min(state.baseDist * 2.0, next));
      publishMetrics();
    },
    resetView() {
      state.yaw = -1.15;
      state.pitch = 0.2;
      state.dist = state.baseDist;
      state.velYaw = 0;
      state.velPitch = 0;
      flyAnim = null;
      publishMetrics();
    },
    flyTo(lonDeg, latDeg, durationMs = 1400) {
      const lonRad = (lonDeg * Math.PI) / 180;
      const latRad = (latDeg * Math.PI) / 180;
      // 该引擎的朝向约定：center_lon = yaw + π/2，center_lat = pitch
      let yaw1 = lonRad - Math.PI / 2;
      // 最短角路径
      const twoPi = Math.PI * 2;
      yaw1 = state.yaw + (((yaw1 - state.yaw) % twoPi) + twoPi + Math.PI) % twoPi - Math.PI;
      const pitch1 = Math.max(-1.1, Math.min(1.1, latRad));
      state.velYaw = 0;
      state.velPitch = 0;
      state.engaged = true;
      if (reduceMotion) {
        state.yaw = yaw1;
        state.pitch = pitch1;
        flyAnim = null;
        publishMetrics();
        return;
      }
      flyAnim = { yaw0: state.yaw, pitch0: state.pitch, yaw1, pitch1, t0: performance.now(), dur: durationMs };
    },
    globeMetrics() {
      const ndc = RADIUS / (state.dist * TAN_HALF_FOV);
      const diameter = Math.round(ndc * shellH);
      return {
        shellWidth: shellW,
        shellHeight: shellH,
        globeDiameterPx: diameter,
        globeHeightRatio: shellH > 0 ? Number((diameter / shellH).toFixed(3)) : 0,
        cameraDistance: Number(state.dist.toFixed(3)),
        maskResolution: `${MASK_W}x${MASK_H}`,
        drawCallsPerFrame: renderer.info.render.calls,
      };
    },
    dispose: teardown,
  };
}

function noopHandle(): EarthSceneHandle {
  return {
    update() {},
    setSelected() {},
    zoomBy() {},
    resetView() {},
    flyTo() {},
    globeMetrics() {
      return {
        shellWidth: 0,
        shellHeight: 0,
        globeDiameterPx: 0,
        globeHeightRatio: 0,
        cameraDistance: 0,
        maskResolution: "none",
        drawCallsPerFrame: 0,
      };
    },
    dispose() {},
  };
}

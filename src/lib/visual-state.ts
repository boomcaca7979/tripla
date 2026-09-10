/**
 * UTRIPLA Living Home — Visual State 单一真相源。
 *
 * State Source（time / season / mood）
 *   → deriveVisualState()
 *   → CSS Variables（由 HomeEnvironment 写入包裹层）
 *   → Environment（天空/光晕/墨色） + Typography（H1/eyebrow） + UI（accent 族）
 *
 * 纯函数、无 DOM 依赖：SSR 与客户端共用，可单测。
 */

export type Season = "spring" | "summer" | "autumn" | "winter";
export type MoodId =
  | "all" | "food" | "culture" | "nature"
  | "beaches" | "night" | "shopping" | "active";
export type WeatherId = "clear" | "cloudy" | "rain" | "snow" | "storm";
export type MoonPhaseId =
  | "new" | "waxing-crescent" | "first-quarter" | "waxing-gibbous"
  | "full" | "waning-gibbous" | "last-quarter" | "waning-crescent";

export const MOON_PHASE_SEQUENCE: MoonPhaseId[] = [
  "new", "waxing-crescent", "first-quarter", "waxing-gibbous",
  "full", "waning-gibbous", "last-quarter", "waning-crescent",
];

const MOON_LABELS: Record<MoonPhaseId, string> = {
  "new": "New Moon",
  "waxing-crescent": "Waxing Crescent",
  "first-quarter": "First Quarter",
  "waxing-gibbous": "Waxing Gibbous",
  "full": "Full Moon",
  "waning-gibbous": "Waning Gibbous",
  "last-quarter": "Last Quarter",
  "waning-crescent": "Waning Crescent",
};

/** 确定性月相：以已知新月历元 + 朔望月长度推算（无天文 SDK / 无 API） */
const SYNODIC_MONTH = 29.53058867;
const NEW_MOON_EPOCH = Date.UTC(2000, 0, 6, 18, 14);

export function moonPhaseFor(date: Date): MoonPhaseId {
  const age = ((date.getTime() - NEW_MOON_EPOCH) / 86_400_000) % SYNODIC_MONTH;
  const fraction = (age + SYNODIC_MONTH) % SYNODIC_MONTH / SYNODIC_MONTH;
  return MOON_PHASE_SEQUENCE[Math.round(fraction * 8) % 8];
}

/** 月相照明度（0=新月 1=满月） */
const PHASE_ILLUMINATION: Record<MoonPhaseId, number> = {
  "new": 0, "waxing-crescent": 0.25, "first-quarter": 0.5, "waxing-gibbous": 0.75,
  "full": 1, "waning-gibbous": 0.75, "last-quarter": 0.5, "waning-crescent": 0.25,
};

const MOON_WEATHER_FACTOR: Record<WeatherId, number> = {
  clear: 1, cloudy: 0.5, rain: 0.15, snow: 0.25, storm: 0.05,
};

export interface MoonVisual {
  phase: MoonPhaseId;
  label: string;
  /** 乘性系数：与夜间系数/天气共同决定最终 opacity/尺寸/辉光 */
  opacityMul: number;
  sizeMul: number;
  glowMul: number;
}

export function moonVisualFor(phase: MoonPhaseId, weather: WeatherId): MoonVisual {
  const illum = PHASE_ILLUMINATION[phase];
  const wf = MOON_WEATHER_FACTOR[weather];
  return {
    phase,
    label: MOON_LABELS[phase],
    opacityMul: (0.12 + illum * 0.88) * wf,
    sizeMul: 0.86 + illum * 0.32,
    glowMul: 0.3 + illum * 0.7,
  };
}

/**
 * 月相明暗面偏移：深色圆盘相对月盘的水平位移（% 直径）。
 * 0=新月（全遮）→ ±75=凸月 → 满月完全移出；waxing 受光在右、waning 在左。
 */
export function moonShadowShiftFor(phase: MoonPhaseId): string {
  const p = MOON_PHASE_SEQUENCE.indexOf(phase);
  if (p <= 0) return "0%";
  if (p >= 4) return "-150%";
  return `${(p - 4) * 25}%`;
}

// ── Destination（目的地当地时间上下文） ────────────────────────────────

export interface DestinationContext {
  id: string;
  label: string;
  timeZone: string;
}

/** Home 环境当前锚定的目的地（Phase 4 将扩展为多目的地/用户自选） */
export const HOME_DESTINATION: DestinationContext = {
  id: "tokyo",
  label: "Tokyo",
  timeZone: "Asia/Tokyo",
};

/** 用 Intl 原生能力取目的地当地小时（无外部依赖、SSR/客户端一致） */
export function destinationLocalHour(timeZone: string, date: Date): number {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "numeric",
      hourCycle: "h23",
    }).formatToParts(date);
    const h = Number(parts.find((p) => p.type === "hour")?.value ?? date.getHours());
    const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
    return (h % 24) + m / 60;
  } catch {
    return date.getHours() + date.getMinutes() / 60;
  }
}

// ── Weather（确定性天气状态：无 API、按目的地+日期稳定） ─────────────────

const WEATHER_TABLES: Record<Season, [WeatherId, number][]> = {
  winter: [["clear", 28], ["cloudy", 26], ["snow", 24], ["rain", 14], ["storm", 8]],
  spring: [["clear", 42], ["cloudy", 27], ["rain", 19], ["storm", 7], ["snow", 5]],
  summer: [["clear", 48], ["cloudy", 24], ["storm", 14], ["rain", 14], ["snow", 0]],
  autumn: [["clear", 40], ["cloudy", 30], ["rain", 20], ["storm", 7], ["snow", 3]],
};

export function deriveWeatherFor(destinationId: string, date: Date, season: Season): WeatherId {
  const key = `${destinationId}:${date.getFullYear()}:${date.getMonth()}:${date.getDate()}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  const roll = hash % 100;
  let acc = 0;
  for (const [w, weight] of WEATHER_TABLES[season]) {
    acc += weight;
    if (roll < acc) return w;
  }
  return "clear";
}

// ── Season ───────────────────────────────────────────────────────────

/** 按月划分（北半球惯例；与站点气候数据口径一致） */
export function seasonFromDate(d: Date): Season {
  const m = d.getMonth();
  if (m <= 1 || m === 11) return "winter";
  if (m <= 4) return "spring";
  if (m <= 7) return "summer";
  return "autumn";
}

// ── 颜色工具 ──────────────────────────────────────────────────────────

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hh = ((h % 360) + 360) % 360 / 360;
  const ss = Math.min(Math.max(s, 0), 100) / 100;
  const ll = Math.min(Math.max(l, 0), 100) / 100;
  if (ss === 0) {
    const v = Math.round(ll * 255);
    return [v, v, v];
  }
  const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
  const p = 2 * ll - q;
  const channel = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [
    Math.round(channel(hh + 1 / 3) * 255),
    Math.round(channel(hh) * 255),
    Math.round(channel(hh - 1 / 3) * 255),
  ];
}

export function hexOf(h: number, s: number, l: number): string {
  const [r, g, b] = hslToRgb(h, s, l);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

export function rgbTripletOf(h: number, s: number, l: number): string {
  const [r, g, b] = hslToRgb(h, s, l);
  return `${r}, ${g}, ${b}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mixHex(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  return `#${((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1)}`;
}

// ── Sky（Hero 环境层，关键小时插值，思路对齐 Ephemera ambient triplets） ──

interface SkyKey { h: number; a: string; b: string; c: string; ink: "light" | "dark" }

const SKY_KEYS: SkyKey[] = [
  { h: 0,  a: "#12142e", b: "#1d2145", c: "#262a4e", ink: "light" },
  { h: 5,  a: "#1c1a3e", b: "#3a2c52", c: "#7a4a5c", ink: "light" },
  { h: 7,  a: "#5a6a9a", b: "#d9a87c", c: "#f0d8c0", ink: "dark" },
  { h: 10, a: "#a8c8de", b: "#d8e6e8", c: "#f6efe2", ink: "dark" },
  { h: 13, a: "#b8d4e4", b: "#e2ecec", c: "#faf6ea", ink: "dark" },
  { h: 17, a: "#88a8c8", b: "#e8c8a0", c: "#f4e2cc", ink: "dark" },
  { h: 19, a: "#3a3260", b: "#a85a6a", c: "#e8a87c", ink: "light" },
  { h: 21, a: "#191c3c", b: "#2a2450", c: "#4a3060", ink: "light" },
  { h: 24, a: "#12142e", b: "#1d2145", c: "#262a4e", ink: "light" },
];

/** 季节对天空的微妙偏移：冬冷灰、夏饱和、春偏粉、秋偏琥珀 */
function seasonShiftSky(hex: string, season: Season): string {
  const [r, g, b] = hexToRgb(hex);
  const max = Math.max(r, g, b) / 255, min = Math.min(r, g, b) / 255;
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    const rr = r / 255, gg = g / 255, bb = b / 255;
    if (max === rr) h = ((gg - bb) / d) % 6;
    else if (max === gg) h = (bb - rr) / d + 2;
    else h = (rr - gg) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  const adj = {
    spring: { dh: +12, ds: 0, dl: +0.02 },
    summer: { dh: -6, ds: +0.06, dl: +0.01 },
    autumn: { dh: -10, ds: +0.03, dl: 0 },
    winter: { dh: +24, ds: -0.08, dl: +0.01 },
  }[season];
  return hexOf(h + adj.dh, Math.min((s + adj.ds) * 100, 92), Math.min((l + adj.dl) * 100, 96));
}

export interface SkyState {
  a: string; b: string; c: string;
  /** 天空明暗决定 Hero 墨色（夜间白墨 / 白天深墨） */
  ink: "light" | "dark";
  /** 星空可见度：夜 × 天气（晴天满星，风暴归零） */
  starsAlpha: number;
  /** 降水暗示层：雨/雪（轻量 CSS，非模拟） */
  precip: "none" | "rain" | "snow";
}

/** 天气对天空色的修正（组合进基础状态，而非覆盖） */
function weatherShiftSky(hex: string, weather: WeatherId): string {
  const [r, g, b] = hexToRgb(hex);
  const max = Math.max(r, g, b) / 255, min = Math.min(r, g, b) / 255;
  const l = (max + min) / 2 * 100; // 0-100
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    const rr = r / 255, gg = g / 255, bb = b / 255;
    if (max === rr) h = ((gg - bb) / d) % 6;
    else if (max === gg) h = (bb - rr) / d + 2;
    else h = (rr - gg) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = d === 0 ? 0 : (d / (1 - Math.abs(2 * (l / 100) - 1))) * 100;
  switch (weather) {
    case "cloudy": return mixHex(hexOf(h, s * 0.72, Math.min(l * 1.04, 96)), "#8a94a0", 0.16);
    case "rain": return mixHex(hexOf(h, s * 0.8, l * 0.88), "#5a6570", 0.22);
    case "snow": return mixHex(hexOf(h + 8, s * 0.6, Math.min(l * 1.16, 97)), "#e8eef4", 0.3);
    case "storm": return mixHex(hexOf(h + 6, s * 0.7, l * 0.72), "#2a2e3e", 0.3);
    default: return hex;
  }
}

const STARS_WEATHER: Record<WeatherId, number> = {
  clear: 1, cloudy: 0.35, rain: 0.08, snow: 0.15, storm: 0,
};

export function skyFor(hour: number, season: Season, weather: WeatherId = "clear"): SkyState {
  const h = ((hour % 24) + 24) % 24;
  let lo = SKY_KEYS[0], hi = SKY_KEYS[SKY_KEYS.length - 1];
  for (let i = 0; i < SKY_KEYS.length - 1; i++) {
    if (h >= SKY_KEYS[i].h && h <= SKY_KEYS[i + 1].h) {
      lo = SKY_KEYS[i]; hi = SKY_KEYS[i + 1];
      break;
    }
  }
  const t = hi.h === lo.h ? 0 : (h - lo.h) / (hi.h - lo.h);
  // 夜间系数：星空只在天黑后出现
  const nightF = Math.max(0, Math.min(1, 1 - Math.abs(h - 1) / 6)) + Math.max(0, Math.min(1, 1 - Math.abs(h - 23) / 4));
  const starsAlpha = Math.min(1, nightF) * STARS_WEATHER[weather];
  return {
    a: weatherShiftSky(seasonShiftSky(mixHex(lo.a, hi.a, t), season), weather),
    b: weatherShiftSky(seasonShiftSky(mixHex(lo.b, hi.b, t), season), weather),
    c: weatherShiftSky(seasonShiftSky(mixHex(lo.c, hi.c, t), season), weather),
    ink: t < 0.5 ? lo.ink : hi.ink,
    starsAlpha,
    precip: weather === "rain" || weather === "storm" ? "rain" : weather === "snow" ? "snow" : "none",
  };
}

// ── Accent（季节基底 × 心情色相 × 时段明度） ──────────────────────────

const SEASON_BASE: Record<Season, { h: number; s: number; l: number }> = {
  spring: { h: 352, s: 46, l: 44 },
  summer: { h: 34, s: 56, l: 44 },
  autumn: { h: 14, s: 46, l: 42 },
  winter: { h: 204, s: 36, l: 40 },
};

const MOOD_HUE: Record<Exclude<MoodId, "all">, number> = {
  food: 12, culture: 34, nature: 150, beaches: 192,
  night: 262, shopping: 338, active: 24,
};

export interface AccentState {
  /** 主 accent（按钮/下划线/chip 底） */
  accent: string;
  /** rgb 三元组（供 rgba(var(--ut-accent-rgb), α) 家族） */
  accentRgb: string;
  /** 深阶：H1 与 hover（保证深底可读） */
  accentInk: string;
  /** 光晕强度：夜里收敛、白天舒展、降水加剧漫射 */
  glowAlpha: number;
  /** 原始色相/饱和度（供可读性引擎调整明度） */
  h: number;
  s: number;
}

export function accentFor(hour: number, season: Season, mood: MoodId, weather: WeatherId = "clear"): AccentState {
  const base = { ...SEASON_BASE[season] };
  if (mood !== "all") {
    base.h = MOOD_HUE[mood];
    base.s = Math.min(base.s + 10, 66);
  }
  const h = ((hour % 24) + 24) % 24;
  // 时段调制：夜间收敛、黄金时刻偏暖加饱和、正午提亮
  if (h >= 22 || h < 5) { base.s -= 14; base.l -= 6; }
  else if ((h >= 17 && h < 20) || (h >= 5 && h < 8)) { base.s += 8; base.l -= 2; }
  else if (h >= 11 && h < 15) { base.l += 3; }
  // 天气调制（乘性修正，不覆盖 mood/时段）
  if (weather === "cloudy") base.s -= 4;
  else if (weather === "rain") { base.s -= 8; base.l -= 2; }
  else if (weather === "snow") { base.s -= 10; base.l += 2; }
  else if (weather === "storm") { base.s -= 12; base.l -= 4; }

  const l = Math.min(Math.max(base.l, 28), 54);
  const glowBase = h >= 22 || h < 5 ? 0.12 : h >= 17 && h < 20 ? 0.2 : 0.16;
  const glowWeather = { clear: 1, cloudy: 1.2, rain: 1.5, snow: 1.1, storm: 1.8 }[weather];
  return {
    accent: hexOf(base.h, base.s, l),
    accentRgb: rgbTripletOf(base.h, base.s, l),
    accentInk: hexOf(base.h, base.s + 4, Math.min(l, 34)),
    glowAlpha: Math.min(0.36, Math.round(glowBase * glowWeather * 100) / 100),
    h: ((base.h % 360) + 360) % 360,
    s: Math.min(Math.max(base.s, 0), 100),
  };
}

// ── Contrast-safe Hero Palette（最终环境 → 必然可读的墨色体系） ────────
// 原则：State-driven ≠ unreadable。天空先完成季节/天气全部修正，
// 再由"最终天空亮度"反推 ink / soft / muted / display accent，
// 保证任何 状态组合 下文本都达到 WCAG 对比要求。

export const INK_LIGHT = "#f7f4ed";
export const INK_DARK = "#14161c";

/** hex → WCAG 相对亮度 */
export function luminanceOf(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  const f = (v: number) => {
    const t = v / 255;
    return t <= 0.03928 ? t / 12.92 : Math.pow((t + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrastRatio(fgHex: string, bgLum: number): number {
  const l = luminanceOf(fgHex);
  return (Math.max(l, bgLum) + 0.05) / (Math.min(l, bgLum) + 0.05);
}

function rgbTripletFromHex(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  return `${r}, ${g}, ${b}`;
}

/** fg 在该背景上不达标时，向 ink 方向逐步收紧，直到达到 minRatio */
function readableOn(bgHex: string, fg: string, ink: string, minRatio: number, blendSteps: number[]): string {
  const bgL = luminanceOf(bgHex);
  if (contrastRatio(fg, bgL) >= minRatio) return fg;
  for (const a of blendSteps) {
    const cand = mixHex(fg, ink, a);
    if (contrastRatio(cand, bgL) >= minRatio) return cand;
  }
  return ink;
}

export interface HeroPalette {
  /** hero 主墨色（最终天空上必然可读） */
  ink: string;
  /** 次级文本（≥4.5:1） */
  soft: string;
  /** 弱化文本（≥4.5:1） */
  muted: string;
  /** H1 / display 用 accent（大字号 ≥3.2:1） */
  accentText: string;
  /** 静默分隔线（装饰性，无对比度要求） */
  line: string;
  /** 文本带有效背景（天空 b/c 中带混合 + 暗角预留） */
  bg: string;
}

function heroPaletteFor(sky: SkyState, accent: AccentState): HeroPalette {
  // 文本带背景：天空 b→c 中带混合，并预留 vignette 约 10% 的暗化
  const bg = mixHex(mixHex(sky.b, sky.c, 0.45), "#000000", 0.1);
  const bgL = luminanceOf(bg);
  const ink = bgL >= 0.185 ? INK_DARK : INK_LIGHT;
  const soft = readableOn(bg, mixHex(ink, bg, 0.26), ink, 4.5, [0.18, 0.1, 0]);
  const muted = readableOn(bg, mixHex(ink, bg, 0.42), ink, 4.5, [0.3, 0.18, 0.08, 0]);
  // H1 display accent：向可读方向调整明度，直到大字号（≥3.2:1）可读
  let accentText = INK_LIGHT;
  if (ink === INK_LIGHT) {
    for (const l of [64, 72, 80, 86]) {
      const c = hexOf(accent.h, Math.min(accent.s + 8, 70), l);
      if (contrastRatio(c, bgL) >= 3.2) { accentText = c; break; }
    }
  } else {
    for (const l of [36, 30, 24, 18]) {
      const c = hexOf(accent.h, Math.min(accent.s + 6, 60), l);
      if (contrastRatio(c, bgL) >= 3.2) { accentText = c; break; }
    }
  }
  const line = mixHex(ink, bg, 0.45);
  return { ink, soft, muted, accentText, line, bg };
}

// ── Environmental Deep（滚动后的"地平线以下"环境基底） ─────────────────
// 由最终天空 × accent 混出带状态色相的深色世界（L 恒 ≤ 0.125），
// 让内容区始终处于同一环境系统，而不是突然换一套页面语言。

function envDeepFor(sky: SkyState, accent: AccentState): { deep: string; deepRgb: string } {
  let deep = mixHex(mixHex(sky.b, accent.accent, 0.2), "#0a0c12", 0.72);
  let guard = 0;
  while (luminanceOf(deep) > 0.125 && guard < 6) {
    deep = mixHex(deep, "#0a0c12", 0.3);
    guard++;
  }
  return { deep, deepRgb: rgbTripletFromHex(deep) };
}

// ── Ambient line（状态感知文案：网站知道现在几点、什么天气） ────────────

export function ambientLineFor(hour: number, weather: WeatherId): string {
  const h = ((hour % 24) + 24) % 24;
  const night = h >= 22 || h < 5;
  const dawn = h >= 5 && h < 8;
  const morning = h >= 8 && h < 11;
  const midday = h >= 11 && h < 15;
  const afternoon = h >= 15 && h < 17;
  const golden = h >= 17 && h < 19;
  if (weather === "storm") return "A storm is rewriting the skyline in flashes of white.";
  if (night) {
    if (weather === "rain") return "Rain after midnight — the streets shine back twice as loud.";
    if (weather === "snow") return "Snow is falling through the streetlights; nobody is in a hurry.";
    return "It's late, and the best ideas come at night.";
  }
  if (dawn) {
    if (weather === "clear") return "First light over the rooftops — the city belongs to no one yet.";
    if (weather === "rain") return "A wet grey dawn; the first trains hiss through the mist.";
    return "The sky is waking up slowly this morning.";
  }
  if (morning) {
    if (weather === "clear") return "Morning light warming the pavements, one café at a time.";
    if (weather === "cloudy") return "A soft grey morning — good lines and short queues.";
    if (weather === "snow") return "Snow hushes the first trains of the morning.";
    return "The morning is moving at walking pace.";
  }
  if (midday) {
    if (weather === "clear") return "High sun, long shadows — the alleys are coolest right now.";
    if (weather === "rain") return "Rain keeps the crowds away; the museums are all yours.";
    return "Midday haze settles over the rooftops.";
  }
  if (afternoon) {
    if (weather === "clear") return "The afternoon is stretching; find the shade and keep wandering.";
    return "The light is turning soft at the edges.";
  }
  if (golden) {
    if (weather === "clear") return "Golden hour is bending every facade into amber.";
    if (weather === "cloudy") return "A low sun keeps trying to break through the cloud.";
    return "The day is folding into its warmest hour.";
  }
  if (weather === "rain") return "Neon blooms in the wet streets as the light drains away.";
  if (weather === "snow") return "Snow hushes the evening rush; the lamps come on early.";
  return "Lanterns are coming on across the old town.";
}

// ── Greeting（随有效小时变化；拖动即变） ───────────────────────────────

export function greetingFor(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  if (h >= 5 && h < 12) return "Good morning.";
  if (h >= 12 && h < 17) return "Good afternoon.";
  if (h >= 17 && h < 22) return "Good evening.";
  return "Good night.";
}

export function timeLabel(hour: number): string {
  const hh = Math.floor(((hour % 24) + 24) % 24);
  const mm = Math.round((hour - Math.floor(hour)) * 60);
  const h12 = hh % 12 || 12;
  return `${h12}:${String(mm).padStart(2, "0")} ${hh >= 12 ? "PM" : "AM"}`;
}

// ── 星月（环境细节的几何位置；纯计算，渲染交给 CSS/SVG） ────────────────

export interface SkyBodies {
  /** 太阳：白天弧线运动，夜间隐没 */
  sun: { x: number; y: number; opacity: number };
  /** 月亮：夜间弧线运动 */
  moon: { x: number; y: number; opacity: number };
}

export function skyBodiesFor(hour: number): SkyBodies {
  const h = ((hour % 24) + 24) % 24;
  const arc = (t: number) => ({ x: Math.min(Math.max(t, 0), 1), y: Math.sin(Math.min(Math.max(t, 0), 1) * Math.PI) });
  const sunT = (h - 6) / 12;   // 6→18 点横穿天际
  const moonT = h >= 18 ? (h - 18) / 12 : (h + 6) / 12; // 18→6 点
  const sun = arc(sunT);
  const moon = arc(moonT);
  return {
    sun: {
      x: sun.x,
      y: sun.y,
      opacity: sunT > 0.02 && sunT < 0.98 ? 0.85 : 0,
    },
    moon: {
      x: moon.x,
      y: moon.y,
      opacity: moonT > 0.04 && moonT < 0.96 ? 0.8 : 0,
    },
  };
}

// ── 汇总 ─────────────────────────────────────────────────────────────

export interface VisualState extends SkyState, AccentState {
  season: Season;
  mood: MoodId;
  hour: number;
  weather: WeatherId;
  bodies: SkyBodies;
  moon: MoonVisual;
  /** 对比度安全的 hero 墨色体系（由最终天空反推） */
  hero: HeroPalette;
  /** 地平线以下的深色环境基底（内容区世界） */
  envDeep: string;
  envDeepRgb: string;
  /** accent 上的前景色（按最终 accent 亮度选择深/浅，保证交互文本可读） */
  onAccent: string;
  /** 状态感知文案 */
  ambientLine: string;
}

export function deriveVisualState(input: {
  hour: number;
  season: Season;
  mood: MoodId;
  weather: WeatherId;
  moonPhase: MoonPhaseId;
}): VisualState {
  const sky = skyFor(input.hour, input.season, input.weather);
  const accent = accentFor(input.hour, input.season, input.mood, input.weather);
  const hero = heroPaletteFor(sky, accent);
  const deep = envDeepFor(sky, accent);
  // Readability Guard：accent 亮度 ≥0.20 时深墨前景（≥4.3:1），否则白前景（≤4.2:1 反向）。
  // 不固定黑/白 —— 由最终 accent 状态决定。
  const onAccent = luminanceOf(accent.accent) >= 0.2 ? INK_DARK : "#ffffff";
  return {
    hour: input.hour,
    season: input.season,
    mood: input.mood,
    weather: input.weather,
    bodies: skyBodiesFor(input.hour),
    moon: moonVisualFor(input.moonPhase, input.weather),
    ...sky,
    ...accent,
    // ink 以"最终环境亮度"为准（覆盖按小时查表的结果，保证天气变暗时同步翻转）
    ink: hero.ink === INK_LIGHT ? "light" : "dark",
    hero,
    envDeep: deep.deep,
    envDeepRgb: deep.deepRgb,
    onAccent,
    ambientLine: ambientLineFor(input.hour, input.weather),
  };
}

/**
 * user-location — "用户当前所在地"的解析层（client-safe，纯函数 + 一次性异步解析）。
 *
 * 与"用户正在探索的旅行目的地"是**两个严格分离的状态**：
 *   · 旅行目的地 = 145 个目的地数据集（src/data/destinations.ts）
 *   · 用户所在地 = IANA 时区数据（src/lib/data/tz-coords.ts，418 主时区 + 237 别名）
 * 两套数据互不限制：用户所在地**不要求**存在于 145 个目的地中
 * （America/Chicago 也能拿到城市标签 + 坐标 → 正常的本地天气）。
 *
 * 解析优先级（不强制、不弹窗、不落库）：
 *   1. 浏览器 geolocation —— **仅当权限已授予（granted）时**才使用；
 *      permission 为 prompt/denied、或无 Permissions API → 完全不调用，
 *      因此永远不会主动弹出定位授权框。
 *   2. 浏览器时区 —— 解析别名 → 主时区 → 城市级标签 + 该时区参考坐标。
 *   3. 只有时区名、没有可靠坐标（如 Etc/GMT-8）→ 显示 Local time，
 *      Weather 显示不可用（不伪造）。
 *   4. 全都无法确定 → 返回空位置（首页显示通用状态，绝不硬编码东京）。
 *
 * 隐私：只保留城市级标签与用于天气的经纬度，坐标仅存在于内存 state，
 * 不写入 localStorage / cookie，也不上传。
 */

import { TZ_COORDS, canonicalTimeZone, tzCoordsFor } from "./data/tz-coords";

export type UserLocationSource = "geolocation" | "timezone" | null;

export interface ResolvedUserLocation {
  source: UserLocationSource;
  /** 城市级标签（如 "Chicago"）；null = 无法确定。 */
  label: string | null;
  /** IANA 时区（本地时间读数使用）。 */
  timeZone: string | null;
  /** 用于天气查询的坐标；null = 无可靠坐标（Weather 显示不可用）。 */
  latitude: number | null;
  longitude: number | null;
  /** 精度口径：coordinate = 真实坐标；city = 时区参考城市。 */
  precision: "coordinate" | "city" | null;
}

export const EMPTY_USER_LOCATION: ResolvedUserLocation = {
  source: null,
  label: null,
  timeZone: null,
  latitude: null,
  longitude: null,
  precision: null,
};

// ── 时区 → 城市级标签 ─────────────────────────────────────────────────

/** 非城市型时区段（"UTC"、"Etc/GMT-8"、"GMT" 等）不当作城市名。 */
function isNonCityZoneSegment(segment: string): boolean {
  return /^(UTC|GMT|Z)$/i.test(segment) || /^GMT[+-]?\d+$/i.test(segment) || /^\d+$/.test(segment);
}

/**
 * 由 IANA 时区派生城市级标签（**先把别名解析到主时区**，保证标签与坐标同城）：
 * "Asia/Shanghai" → "Shanghai"；"America/New_York" → "New York"；
 * "America/Argentina/Buenos_Aires" → "Buenos Aires"；"UTC" → null。
 */
export function cityLabelFromTimeZone(timeZone: string | null | undefined): string | null {
  if (!timeZone) return null;
  const canonical = canonicalTimeZone(timeZone);
  const segments = canonical.split("/").filter(Boolean);
  if (segments.length < 2) return null;
  const last = segments[segments.length - 1];
  if (isNonCityZoneSegment(last)) return null;
  const label = last.replace(/_/g, " ").trim();
  return label.length > 0 ? label : null;
}

export function browserTimeZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}

// ── 坐标工具 ──────────────────────────────────────────────────────────

/** Haversine（km）：只用于"最近的时区参考城市"判定，不产生新地理事实。 */
export function distanceKm(
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

const TZ_IDS = Object.keys(TZ_COORDS);

/**
 * 由坐标反查"最近的时区参考城市"（城市级标签）。
 * 超出 maxKm 认为不可靠 → null（不把远方的城市名硬当成用户所在地）。
 */
export function nearestTimeZoneCity(
  latitude: number,
  longitude: number,
  maxKm = 500,
): { label: string; timeZone: string; km: number } | null {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  let best: { timeZone: string; km: number } | null = null;
  for (const id of TZ_IDS) {
    const [lat, lon] = TZ_COORDS[id];
    const km = distanceKm(latitude, longitude, lat, lon);
    if (!best || km < best.km) best = { timeZone: id, km };
  }
  if (!best || best.km > maxKm) return null;
  const label = cityLabelFromTimeZone(best.timeZone);
  if (!label) return null;
  return { label, timeZone: best.timeZone, km: best.km };
}

// ── geolocation（只在已授权时使用） ───────────────────────────────────

interface GeoPermissionState {
  state: "granted" | "denied" | "prompt";
}

/**
 * 查询既有定位权限。**不触发弹窗**：
 * · Permissions API 不可用 → 视作未授权（不调用 geolocation）。
 * · 任何异常 → 同样视作未授权。
 */
async function geolocationPermission(): Promise<"granted" | "denied" | "prompt"> {
  if (typeof navigator === "undefined") return "prompt";
  const permissions = (
    navigator as Navigator & {
      permissions?: { query: (d: { name: string }) => Promise<GeoPermissionState> };
    }
  ).permissions;
  if (!permissions?.query) return "prompt";
  try {
    const status = await permissions.query({ name: "geolocation" });
    return status.state;
  } catch {
    return "prompt";
  }
}

/** 已授权时的坐标读取；超时/失败一律返回 null（首页保持通用状态，不报错）。 */
function readCoordinates(timeoutMs = 8000): Promise<{ latitude: number; longitude: number } | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }
    let settled = false;
    const done = (v: { latitude: number; longitude: number } | null) => {
      if (settled) return;
      settled = true;
      resolve(v);
    };
    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => done({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => done(null),
        { timeout: timeoutMs, maximumAge: 15 * 60 * 1000, enableHighAccuracy: false },
      );
    } catch {
      done(null);
    }
  });
}

// ── 主入口 ────────────────────────────────────────────────────────────

export interface ResolveOptions {
  /** 允许使用 geolocation（默认 true；仅"已授权"时才会真正调用）。 */
  allowGeolocation?: boolean;
}

/**
 * 解析用户所在地。永不抛异常；无法确定时返回空位置。
 */
export async function resolveUserLocation(
  options: ResolveOptions = {},
): Promise<ResolvedUserLocation> {
  const { allowGeolocation = true } = options;
  const timeZone = browserTimeZone();
  const tzLabel = cityLabelFromTimeZone(timeZone);

  // 1) 已授权的 geolocation（最精确：真实坐标 + 由坐标反查的城市级标签）
  if (allowGeolocation) {
    const permission = await geolocationPermission();
    if (permission === "granted") {
      const coords = await readCoordinates();
      if (coords) {
        const near = nearestTimeZoneCity(coords.latitude, coords.longitude);
        return {
          source: "geolocation",
          label: near?.label ?? tzLabel,
          timeZone: near?.timeZone ?? timeZone,
          latitude: coords.latitude,
          longitude: coords.longitude,
          precision: "coordinate",
        };
      }
    }
  }

  // 2) 时区 → 参考坐标（不依赖任何目的地数据集）
  const coords = tzCoordsFor(timeZone);
  if (coords && tzLabel) {
    return {
      source: "timezone",
      label: tzLabel,
      timeZone,
      latitude: coords[0],
      longitude: coords[1],
      precision: "city",
    };
  }

  // 3) 只有时区名（城市级标签），没有可靠坐标 → Local time 可显示，天气不伪造
  if (tzLabel) {
    return {
      source: "timezone",
      label: tzLabel,
      timeZone,
      latitude: null,
      longitude: null,
      precision: "city",
    };
  }

  // 4) 无法可靠确定 → 通用状态（绝不硬编码某个城市）
  return EMPTY_USER_LOCATION;
}

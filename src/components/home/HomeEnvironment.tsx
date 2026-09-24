"use client";

import {
  createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode,
} from "react";
import {
  deriveVisualState, destinationLocalHour,
  moonPhaseFor, MOON_PHASE_SEQUENCE, seasonFromDate,
  type DestinationContext, type MoodId, type MoonPhaseId, type Season,
  type VisualState, type WeatherId,
} from "@/lib/visual-state";
import type { BudgetTier, HomeIndexEntry, HomePlace } from "@/lib/home-discovery";
import {
  EMPTY_USER_LOCATION, resolveUserLocation,
  type ResolvedUserLocation,
} from "@/lib/user-location";
import { fetchCurrentWeather, weatherIdFor, type NormalizedWeather } from "@/lib/weather-state";
import { ENV_DARK_TOKENS } from "@/lib/env-tokens";

/**
 * HomeEnvironment — Living Home 的状态中枢 + 页面级环境层。
 *
 * 三类状态在此汇合，且**严格分离**：
 *
 *  A. 用户所在地（userLocation）
 *     由 lib/user-location.ts 解析：已授权的 geolocation > 浏览器时区 > 通用状态。
 *     绝不写入目的地选择，也绝不硬编码东京。
 *
 *  B. 发现层选择（destination / month / budget / mood）
 *     用户主动选择的旅行目的地与筛选条件。
 *
 *  C. 环境状态
 *     focus = 目的地（若有） ?? 用户所在地（若有） → 决定 Local time / Weather 读数；
 *     实时天气经 lib/weather-state.ts 标准化后同时驱动**图标 + 文字 + 环境氛围**
 *     （同一状态源）。天气未知时显示通用 "Weather"，不伪造晴天。
 *
 * 首屏确定性：SSR 与客户端首次 render 都使用初始常量（地点未解析、天气未知），
 * 真实位置/时间/天气在 hydration 之后的 effect 中写入。
 */

/** 聚焦地点：当前"Local time / Weather"读数所锚定的位置。 */
export interface HomeFocus {
  id: string;
  kind: "destination" | "user";
  label: string | null;
  timeZone: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface HomeState {
  /** 首页交互面数据集（server 装配，含 canonical 月值 + 坐标；仅交互面 6 城）。 */
  places: HomePlace[];
  /** 全量目的地轻量索引（邻近计算 / 计数；无月值）。 */
  placeIndex: HomeIndexEntry[];
  /** 构建/首屏所属月份（未筛选月份时的上下文，非筛选条件）。 */
  currentMonth: number;

  /** 已选目的地；null = 用户尚未选择（首页初始状态）。 */
  destination: DestinationContext | null;
  selectDestination: (d: DestinationContext | null) => void;
  /** 用户所在地（解析后写入；未解析/无法确定为 EMPTY）。 */
  userLocation: ResolvedUserLocation;
  /** 读数所在位置 = 目的地 ?? 用户所在地；null = 两者都不确定。 */
  focus: HomeFocus | null;
  /** 已选月份；null = 不限月份。 */
  month: number | null;
  setMonth: (m: number | null) => void;
  budget: BudgetTier;
  setBudget: (b: BudgetTier) => void;
  mood: MoodId;
  setMood: (m: MoodId) => void;

  /** 实时天气的标准化状态；null = 未知（显示 "Weather"）。 */
  condition: NormalizedWeather | null;
  /** 天气来源：live = 真实数据源；unknown = 无可靠数据。 */
  weatherSource: "live" | "unknown";
  weather: WeatherId;
  setWeather: (w: WeatherId) => void;
  moonPhase: MoonPhaseId;
  cycleMoonPhase: () => void;
  hour: number;
  hourOverride: number | null;
  setHourOverride: (h: number | null) => void;
  season: Season;
  visual: VisualState;
  /** saveData 命中：环境动效降级 */
  lite: boolean;
}

const HomeCtx = createContext<HomeState | null>(null);

export function useHomeState(): HomeState {
  const ctx = useContext(HomeCtx);
  if (!ctx) throw new Error("useHomeState must be used within HomeEnvironment");
  return ctx;
}

/**
 * Deterministic first-paint values shared by the SSG server build and the
 * client's first render. They MUST be identical on both sides so React
 * hydration matches (no #418). The real wall-clock time / season / weather /
 * moon phase are applied inside an effect AFTER hydration (see below).
 */
const INITIAL_SEASON: Season = "summer";
/** 首屏环境基底（无天气断言：文字/图标此时显示通用 "Weather"）。 */
const INITIAL_WEATHER: WeatherId = "clear";

/** 天气低频刷新间隔（30 分钟）：不轮询、不制造明显负担。 */
const WEATHER_REFRESH_MS = 30 * 60 * 1000;
/** 回到前台时判定"数据过期"的阈值（10 分钟）。 */
const WEATHER_STALE_MS = 10 * 60 * 1000;
const INITIAL_HOUR = 12;
const INITIAL_MOON: MoonPhaseId = "full";

export default function HomeEnvironment({
  children,
  places,
  placeIndex,
  initialMonth,
}: {
  children: ReactNode;
  places: HomePlace[];
  placeIndex: HomeIndexEntry[];
  /** server 首屏月份（与客户端首次 render 一致，hydration 后再校正为真实当前月）。 */
  initialMonth: number;
}) {
  // ── A/B：位置与发现层选择。初始一律"未确定/未选择"。──
  const [destination, setDestination] = useState<DestinationContext | null>(null);
  const [userLocation, setUserLocation] = useState<ResolvedUserLocation>(EMPTY_USER_LOCATION);
  const [month, setMonth] = useState<number | null>(null);
  const [budget, setBudget] = useState<BudgetTier>("any");
  const [mood, setMood] = useState<MoodId>("all");
  const [currentMonth, setCurrentMonth] = useState<number>(initialMonth);

  // ── C：环境状态（确定性首屏常量，hydration 后写入真实值）──
  const [season, setSeason] = useState<Season>(INITIAL_SEASON);
  const [weather, setWeather] = useState<WeatherId>(INITIAL_WEATHER);
  const [condition, setCondition] = useState<NormalizedWeather | null>(null);
  const [weatherSource, setWeatherSource] = useState<"live" | "unknown">("unknown");
  const [liveHour, setLiveHour] = useState<number>(INITIAL_HOUR);
  const [hourOverride, setHourOverride] = useState<number | null>(null);
  const [moonPhase, setMoonPhase] = useState<MoonPhaseId>(INITIAL_MOON);
  const [moonOverride, setMoonOverride] = useState<MoonPhaseId | null>(null);
  const [saveData, setSaveData] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  /** 最近一次天气取数（用于前台恢复时的过期判断，避免无意义请求）。 */
  const lastWeatherFetchRef = useRef<{ key: string; at: number } | null>(null);

  // ── 用户所在地解析（hydration 后一次；不弹权限框、失败不报错）──
  // 数据源 = IANA 时区表（src/lib/data/tz-coords.ts），与 145 个旅行目的地数据集
  // 完全无关：用户所在地不要求在目的地数据集中存在。
  useEffect(() => {
    let cancelled = false;
    resolveUserLocation()
      .then((loc) => {
        if (!cancelled) setUserLocation(loc);
      })
      .catch(() => {
        if (!cancelled) setUserLocation(EMPTY_USER_LOCATION);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // 聚焦地点：目的地优先，其次用户所在地（严格分离两个状态）
  const focus = useMemo<HomeFocus | null>(() => {
    if (destination) {
      return {
        id: destination.id,
        kind: "destination",
        label: destination.label,
        timeZone: destination.timeZone,
        latitude: destination.latitude ?? null,
        longitude: destination.longitude ?? null,
      };
    }
    if (userLocation.label || userLocation.latitude !== null) {
      return {
        id: "user",
        kind: "user",
        label: userLocation.label,
        timeZone: userLocation.timeZone,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      };
    }
    return null;
  }, [destination, userLocation]);

  const focusTimeZone = focus?.timeZone ?? null;
  const focusLat = focus?.latitude ?? null;
  const focusLon = focus?.longitude ?? null;
  const focusKey = `${focus?.id ?? "none"}|${focusTimeZone ?? ""}|${focusLat ?? ""}|${focusLon ?? ""}`;

  // ── 时间：锚定 focus 当地（无 focus 时为访问者本地时间）──
  useEffect(() => {
    const sync = () => {
      const now = new Date();
      setSeason(seasonFromDate(now));
      setLiveHour(destinationLocalHour(focusTimeZone, now));
      setMoonPhase(moonPhaseFor(now));
      setCurrentMonth(now.getMonth());
    };
    // 异步初始化（避免 effect 内同步 setState 级联渲染）
    const t0 = setTimeout(() => {
      sync();
      const conn = (navigator as Navigator & { connection?: { saveData?: boolean } })
        .connection;
      setSaveData(Boolean(conn?.saveData));
    }, 0);
    const id = setInterval(sync, 30_000);
    return () => { clearTimeout(t0); clearInterval(id); };
  }, [focusTimeZone]);

  // ── 实时天气：focus 坐标 → /api/weather(current) → 标准化状态 ──
  // 图标 / 文字 / 环境氛围全部由这一个状态派生；失败即"未知"，绝不伪造晴天。
  //
  // 刷新策略（低频、可预期、无泄漏）：
  //   · 焦点变化（目的地切换 / 清空）时立即取一次；
  //   · 页面可见时每 WEATHER_REFRESH_MS 取一次；
  //   · 页面隐藏 → 停表（不发请求）；回到前台 → 数据过期则立即刷新，并重新起表；
  //   · 每次 effect 只有一个 interval，cleanup 必定清掉（不会叠加多个 timer）。
  useEffect(() => {
    const ac = new AbortController();
    let cancelled = false;
    const hasCoords = focusLat !== null && focusLon !== null;

    const load = () => {
      if (cancelled) return;
      if (!hasCoords) {
        // 无可靠坐标 → 读数清空为"未知"（不是伪造天气）
        setCondition(null);
        setWeatherSource("unknown");
        setWeather(INITIAL_WEATHER);
        return;
      }
      fetchCurrentWeather(focusLat!, focusLon!, focusTimeZone ?? "UTC", ac.signal).then((reading) => {
        if (cancelled) return;
        lastWeatherFetchRef.current = { key: focusKey, at: Date.now() };
        setCondition(reading.condition);
        setWeatherSource(reading.condition ? "live" : "unknown");
        setWeather(weatherIdFor(reading.condition) ?? INITIAL_WEATHER);
      });
    };

    // 异步首帧（避免 effect 内同步 setState 造成级联渲染）
    const t0 = setTimeout(load, 0);

    let timer: ReturnType<typeof setInterval> | null = null;
    const startTimer = () => {
      if (timer !== null || cancelled) return;
      timer = setInterval(load, WEATHER_REFRESH_MS);
    };
    const stopTimer = () => {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    };
    const onVisibility = () => {
      if (document.hidden) {
        stopTimer();
        return;
      }
      const last = lastWeatherFetchRef.current;
      const stale =
        !last || last.key !== focusKey || Date.now() - last.at > WEATHER_STALE_MS;
      if (stale) load();
      startTimer();
    };

    if (!document.hidden) startTimer();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      clearTimeout(t0);
      stopTimer();
      document.removeEventListener("visibilitychange", onVisibility);
      ac.abort();
    };
  }, [focusKey, focusLat, focusLon, focusTimeZone]);

  const hour = hourOverride ?? liveHour;
  const effectiveMoon: MoonPhaseId = moonOverride ?? moonPhase;
  const visual = useMemo(
    () => deriveVisualState({ hour, season, mood, weather, moonPhase: effectiveMoon }),
    [hour, season, mood, weather, effectiveMoon],
  );

  // 状态渗透：把环境/内容 token 镜像到 :root，让包裹层外的
  // Header / Footer / body 加入同一环境（卸载时全部清理，跨页无残留）。
  useEffect(() => {
    const root = document.documentElement;
    const vars: Record<string, string> = {
      "--ut-accent": visual.accent,
      "--ut-accent-rgb": visual.accentRgb,
      "--ut-accent-strong": visual.accentInk,
      "--ut-accent-ink": visual.accentInk,
      "--ut-on-accent": visual.onAccent,
      "--ut-env-deep-rgb": visual.envDeepRgb,
      "--ut-bg": visual.envDeep,
      "--ut-footer-bg": visual.envDeep,
      "--ut-inverse": visual.onAccent,
      "--ut-hero-ink": visual.hero.ink,
      "--ut-hero-soft": visual.hero.soft,
      "--ut-hero-muted": visual.hero.muted,
      "--ut-hero-accent": visual.hero.accentText,
      "--ut-hero-line": visual.hero.line,
      // 深色环境墨色族（与 lib/env-tokens.ts 共享，Header 首帧用同一份）
      ...ENV_DARK_TOKENS,
    };
    for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
    return () => {
      for (const k of Object.keys(vars)) root.style.removeProperty(k);
    };
  }, [visual]);

  // 指针视差：rAF 节流，直写 CSS 变量（零 React render）。
  // 仅精确指针设备；reduced-motion / saveData 关闭。
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced || saveData) return;

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        el.style.setProperty("--ut-px", ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
        el.style.setProperty("--ut-py", ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
      });
    };
    const onLeave = () => {
      el.style.setProperty("--ut-px", "0");
      el.style.setProperty("--ut-py", "0");
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [saveData]);

  // 滚动环境连续性：hero 离开视口时天空压向 envDeep（页面级 veil，零 React render）。
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const heroH = el.firstElementChild?.getBoundingClientRect().height
          ?? window.innerHeight;
        const progress = Math.min(1, Math.max(0, window.scrollY / Math.max(heroH, 1)));
        el.style.setProperty("--ut-scroll", progress.toFixed(3));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const state: HomeState = {
    places,
    placeIndex,
    currentMonth,
    destination,
    selectDestination: setDestination,
    userLocation,
    focus,
    month,
    setMonth,
    budget,
    setBudget,
    mood,
    setMood,
    condition,
    weatherSource,
    weather,
    setWeather,
    moonPhase: effectiveMoon,
    cycleMoonPhase: () => {
      const i = MOON_PHASE_SEQUENCE.indexOf(effectiveMoon);
      setMoonOverride(MOON_PHASE_SEQUENCE[(i + 1) % MOON_PHASE_SEQUENCE.length]);
    },
    hour,
    hourOverride,
    setHourOverride,
    season,
    visual,
    lite: saveData,
  };

  const vars = {
    "--ut-glow-alpha": visual.glowAlpha,
    "--ut-stars-alpha": visual.starsAlpha,
    "--ut-sky-a": visual.a,
    "--ut-sky-b": visual.b,
    "--ut-sky-c": visual.c,
  } as React.CSSProperties;

  return (
    <HomeCtx.Provider value={state}>
      <div
        ref={wrapRef}
        suppressHydrationWarning
        data-ut-season={season}
        data-ut-mood={mood}
        data-ut-weather={weather}
        data-ut-condition={condition?.id ?? "unknown"}
        data-ut-weather-source={weatherSource}
        data-ut-focus={focus?.kind ?? "none"}
        data-sky-ink={visual.ink}
        data-ut-lite={saveData ? "true" : undefined}
        style={{
          ...vars,
          // 天空色为 @property 注册的 color 类型，可平滑过渡（不支持则瞬时切换）
          transition: "--ut-sky-a 1.2s linear, --ut-sky-b 1.2s linear, --ut-sky-c 1.2s linear",
        }}
        className="relative"
      >
        {/* 页面级环境层：整个 Home 共享同一片天空，滚动后由 veil 延续为深色环境 */}
        <div aria-hidden="true" className="ut-page-sky" />
        <div aria-hidden="true" className="ut-env-veil" />
        <div aria-hidden="true" className="ut-page-haze" />

        <div className="relative z-10">
          {children}
        </div>
      </div>
    </HomeCtx.Provider>
  );
}

"use client";

import {
  createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode,
} from "react";
import {
  deriveVisualState, deriveWeatherFor, destinationLocalHour,
  HOME_DESTINATION, moonPhaseFor, MOON_PHASE_SEQUENCE, seasonFromDate,
  type MoodId, type MoonPhaseId, type Season, type VisualState, type WeatherId,
} from "@/lib/visual-state";

/**
 * HomeEnvironment — Living Home 的状态中枢 + 页面级环境层。
 *
 * State（目的地当地时间 / 季节 / 心情 / 天气）
 *   → deriveVisualState()（src/lib/visual-state.ts，单一真相源，含对比度安全墨色）
 *   → 页面级 fixed 环境层（sky / veil / haze）+ 包裹层 CSS 变量 + data 属性
 *   → Environment / Typography / UI 全部只消费变量。
 *
 * 环境是 Home-level 的：hero 之内是天空，滚动后环境以 envDeep 延续到
 * Discovery / Routes / Field Notes / Footer —— 不存在"hero 之外的另一个世界"。
 *
 * 时间锚定目的地当地（Intl 原生）；天气为确定性状态（无 API）。
 * 指针视差与滚动连续性在此统一以 rAF 直写 CSS 变量（零 React render）。
 */

interface HomeState {
  destination: typeof HOME_DESTINATION;
  mood: MoodId;
  setMood: (m: MoodId) => void;
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

/** 内容区消费的环境 token（浅墨族：envDeep 恒为深色世界） */
const CONTENT_TOKENS: Record<string, string> = {
  "--ut-ink": "#f5f2ea",
  "--ut-text": "rgba(245, 242, 234, 0.92)",
  "--ut-text-2": "rgba(245, 242, 234, 0.78)",
  "--ut-muted": "rgba(245, 242, 234, 0.6)",
  "--ut-subtle": "rgba(245, 242, 234, 0.44)",
  "--ut-border": "rgba(245, 242, 234, 0.13)",
  "--ut-border-strong": "rgba(245, 242, 234, 0.24)",
  "--ut-surface": "rgba(245, 242, 234, 0.05)",
  "--ut-surface-hover": "rgba(245, 242, 234, 0.1)",
  "--ut-surface-elevated": "rgba(17, 19, 26, 0.55)",
};

export default function HomeEnvironment({ children }: { children: ReactNode }) {
  const destination = HOME_DESTINATION;
  // 季节/天气为确定性派生：SSR 与客户端同月同日 → 无 hydration 位移
  const [season] = useState<Season>(() => seasonFromDate(new Date()));
  const [weather, setWeather] = useState<WeatherId>(() =>
    deriveWeatherFor(HOME_DESTINATION.id, new Date(), seasonFromDate(new Date())),
  );
  // SSR 以服务器时钟算东京当地小时（数字一致 → 首帧即正确）
  const [liveHour, setLiveHour] = useState(() => destinationLocalHour(HOME_DESTINATION.timeZone, new Date()));
  const [hourOverride, setHourOverride] = useState<number | null>(null);
  const [mood, setMood] = useState<MoodId>("all");
  const [moonOverride, setMoonOverride] = useState<MoonPhaseId | null>(null);
  const [saveData, setSaveData] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tick = () => setLiveHour(destinationLocalHour(destination.timeZone, new Date()));
    // 异步初始化（避免 effect 内同步 setState 级联渲染）
    const t0 = setTimeout(() => {
      tick();
      const conn = (navigator as Navigator & { connection?: { saveData?: boolean } })
        .connection;
      setSaveData(Boolean(conn?.saveData));
    }, 0);
    const id = setInterval(tick, 30_000);
    return () => { clearTimeout(t0); clearInterval(id); };
  }, [destination.timeZone]);

  const hour = hourOverride ?? liveHour;
  const moonPhase: MoonPhaseId = moonOverride ?? moonPhaseFor(new Date());
  const visual = useMemo(
    () => deriveVisualState({ hour, season, mood, weather, moonPhase }),
    [hour, season, mood, weather, moonPhase],
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
      ...CONTENT_TOKENS,
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
    destination, mood, setMood, weather, setWeather,
    moonPhase,
    cycleMoonPhase: () => {
      const i = MOON_PHASE_SEQUENCE.indexOf(moonPhase);
      setMoonOverride(MOON_PHASE_SEQUENCE[(i + 1) % MOON_PHASE_SEQUENCE.length]);
    },
    hour, hourOverride, setHourOverride, season, visual, lite: saveData,
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

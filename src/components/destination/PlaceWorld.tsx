"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  destinationLocalHour,
  skyFor,
  type Season,
} from "@/lib/visual-state";
import {
  formatHour,
  hemisphereForLatitude,
  placeLightFor,
  seasonForLatitudeMonth,
  type MonthNormal,
} from "@/lib/inner-state";
import type { Destination } from "@/data/destinations";

/**
 * PlaceWorld — Destination 3.0 SCENE 1 "THE PLACE"（INTERACTIVE TRAVEL WORLD）。
 *
 * "我进入了 Tokyo" —— 三层深度的活场景：
 *   BACKGROUND  活天空（复用 home 的 skyFor 引擎：hour/season 驱动渐变 + 星空
 *               + 太阳/月亮位置——时间被拖动时整个天穹移动）。
 *   SCENE       真实街景照片：mask 上缘融入天空；光照滤镜由 placeLightFor
 *               （hour 驱动）模拟此刻的街道光线；指针视差（前景 8px/场景 4px）。
 *   UI          环境 UI 融入画面边缘：左上城市、右上时刻/季节/温度、左下天气/
 *               daylight、底部 TIME 拖轨（THE PLACE 的可玩对象）。
 *
 * 时间是真实的：默认 = 目的地当地此刻（hydration 后同步，每分钟走）；拖动 =
 * 预览那一天的其他时刻（标注 PREVIEW，与 home TimeDock 同一诚信模式）。
 * 光照/天空/星月是"该时刻的视觉推论"，不伪造任何气象数据。
 */

export default function PlaceWorld({
  dest,
  normals,
  currentMonthPrecipMm,
  timeScrubber = true,
}: {
  dest: Destination;
  normals: MonthNormal[];
  /** canonical 当前月降水（mm）——场景雨的密度来源（真实数据投影） */
  currentMonthPrecipMm: number;
  /** Atlas 拥有时间探索；Destination Detail 只展示当前环境（拖轨关闭） */
  timeScrubber?: boolean;
}) {
  const hemisphere = hemisphereForLatitude(dest.airport.latitude);
  const [season] = useState<Season>(() => seasonForLatitudeMonth(new Date().getMonth(), hemisphere) ?? "autumn");

  // 时间：SSG 首帧 19.5（暮色，确定性最上镜初值）；hydration 后 = 当地此刻
  const [hour, setHour] = useState(19.5);
  const [isLiveHour, setIsLiveHour] = useState(false);
  const [draggingTime, setDraggingTime] = useState(false);
  const liveHourRef = useRef(19.5);
  const isLiveRef = useRef(false);
  const rafRef = useRef(0);
  const trackRef = useRef<HTMLDivElement | null>(null);

  // 拖拽中在 window 上收尾（pointer capture 丢 up 时的兜底）
  useEffect(() => {
    if (!draggingTime) return;
    const end = () => setDraggingTime(false);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [draggingTime]);

  useEffect(() => {
    const sync = () => {
      const h = destinationLocalHour(dest.timezone, new Date());
      liveHourRef.current = h;
      if (isLiveRef.current) setHour(h);
    };
    const t0 = setTimeout(() => {
      isLiveRef.current = true;
      setIsLiveHour(true);
      sync();
    }, 0);
    const clock = setInterval(sync, 30_000);
    return () => {
      clearTimeout(t0);
      clearInterval(clock);
    };
  }, [dest.timezone]);

  const setScrubHour = useCallback((h: number) => {
    isLiveRef.current = false;
    setIsLiveHour(false);
    setHour(((h % 24) + 24) % 24);
  }, []);

  const backToLive = useCallback(() => {
    isLiveRef.current = true;
    setIsLiveHour(true);
    setHour(liveHourRef.current);
  }, []);

  // 世界状态（全部确定性派生）
  const light = placeLightFor(hour);
  const sky = skyFor(hour, season, "clear");
  const monthIndex = new Date().getMonth();
  const normal = normals[monthIndex];
  const drops = makeDrops(currentMonthPrecipMm);

  // 指针视差（rAF 节流）
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const onScenePointer = (event: ReactPointerEvent<HTMLElement>) => {
    if (draggingTime) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setParallax({ x, y }));
  };

  // TIME 拖轨
  const onTrackDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggingTime(true);
    setScrubHour(event.clientX);
  };
  const onTrackMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (draggingTime) setScrubHour(event.clientX);
  };
  const onTrackUp = () => setDraggingTime(false);

  // 星星：确定性 42 颗（与 home 同 LCG 手法）
  const stars = makeStars();

  // 太阳 / 月亮位置（hour 驱动）
  const isSun = hour >= 6 && hour < 20;
  const bodyProgress = isSun ? (hour - 6) / 14 : hour >= 20 ? (hour - 20) / 10 : (hour + 4) / 10;
  const bodyLeft = `${Math.min(92, Math.max(6, bodyProgress * 92))}%`;
  const bodyTop = `${34 - Math.sin(Math.min(1, Math.max(0, bodyProgress)) * Math.PI) * 22}%`;

  const timeLabel = formatHour(hour);
  const tempLine = normal ? `${normal.tempHighC.toFixed(0)}° / ${normal.tempLowC.toFixed(0)}°C` : "—";
  const hasImage = Boolean(dest.image);

  return (
    <header
      className="relative isolate flex h-[100svh] flex-col overflow-hidden"
      onPointerMove={onScenePointer}
      data-ut-world-scene="place"
    >
      {/* ── BACKGROUND：活天空 ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 transition-[background] duration-700 ease-ut-out motion-reduce:transition-none"
        style={{
          background: `linear-gradient(180deg, ${sky.a} 0%, ${sky.b} 52%, ${sky.c} 100%)`,
        }}
      >
        {/* 星空（夜） */}
        <div className="absolute inset-0" style={{ opacity: sky.starsAlpha }}>
          {stars.map((st, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white"
              style={{ left: st.x, top: st.y, width: st.s, height: st.s, opacity: st.o }}
            />
          ))}
        </div>
        {/* 太阳 / 月亮（拖动时间时它们在天穹上移动） */}
        <div
          className={isSun ? "ut-sun ut-body absolute" : "ut-moon ut-body absolute"}
          style={{ left: bodyLeft, top: bodyTop, opacity: 0.9 }}
        />
      </div>

      {/* ── SCENE：真实街景（光照滤镜 + 顶部 mask 融入天空 + 视差） ── */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 top-[12%]"
        style={{
          transform: `translate(${parallax.x * -6}px, ${parallax.y * -4}px)`,
        }}
      >
        <div
          className="absolute inset-0 transition-[filter] duration-700 ease-ut-out motion-reduce:transition-none"
          style={{ filter: light.photoFilter, maskImage: "linear-gradient(to bottom, transparent 0%, black 34%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 34%)" }}
        >
          {hasImage ? (
            <Image
              src={dest.image as string}
              alt=""
              fill
              preload
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(var(--ut-place-accent-rgb, 180, 95, 77), 0.3), rgba(12, 15, 22, 1) 90%)",
              }}
            />
          )}
          {/* 城市灯光（夜高昼低）+ 光照压暗 */}
          <div
            className="absolute inset-0 transition-colors duration-700 motion-reduce:transition-none"
            style={{
              background: `radial-gradient(ellipse 90% 60% at 50% 78%, rgba(255, 196, 120, ${light.glowAlpha * 0.5}) 0%, transparent 70%), rgba(10, 12, 20, ${light.overlayAlpha})`,
            }}
          />
        </div>
        {/* 雨（密度 = canonical 当月降水投影） */}
        {drops.map((d, i) => (
          <span
            key={i}
            className="ut-rain-drop"
            style={{ left: d.left, height: d.height, animationDuration: `${d.duration}s`, animationDelay: `${d.delay}s` }}
          />
        ))}
      </div>

      {/* ── UI：环境信息融入画面边缘 ── */}
      <nav aria-label="Breadcrumb" className="absolute inset-x-0 top-5 z-10 px-4 md:px-6">
        <p className="font-mono text-micro uppercase tracking-[0.18em] text-white/60">
          <Link href="/" className="transition-colors hover:text-current motion-reduce:transition-none">
            Home
          </Link>
          <span aria-hidden="true"> / </span>
          <Link href="/destinations" className="transition-colors hover:text-current motion-reduce:transition-none">
            Destinations
          </Link>
          <span aria-hidden="true"> / </span>
          <span className="text-white">{dest.city}</span>
        </p>
      </nav>

      {/* 左下：城市身份 */}
      <div
        className="absolute bottom-[7.5rem] left-4 z-10 md:bottom-32 md:left-6"
        style={{ transform: `translate(${parallax.x * 10}px, ${parallax.y * 8}px)` }}
      >
        <p className="font-mono text-micro uppercase tracking-[0.18em] text-white/70">{dest.region}</p>
        <h1 className="mt-2 font-display text-[clamp(2.75rem,5vw,4.5rem)] leading-none text-white">{dest.city}</h1>
        <p className="mt-1.5 font-mono text-body-sm text-white/75">{dest.country}</p>
      </div>

      {/* 右上：时刻 / 季节 / 温度（环境读数） */}
      <div className="absolute right-4 top-20 z-10 text-right md:right-6 md:top-24">
        <p className="font-display text-[2rem] leading-none text-white tabular-nums">{timeLabel}</p>
        <p className="mt-2 font-mono text-label uppercase tracking-[0.16em] text-white/75">
          {season.toUpperCase()} · {tempLine}
        </p>
        <p className="mt-1 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-[#6ee7b7]">
          {isLiveHour ? "LIVE · LOCAL TIME" : "PREVIEW · DRAG THE TIMELINE"}
        </p>
      </div>

      {/* 左下角（城市块上方）：天气 / daylight 环境行 */}
      <div className="absolute bottom-40 left-4 z-10 md:bottom-56 md:left-6">
        <p className="font-mono text-micro uppercase tracking-[0.16em] text-white/60">
          {normal ? `RAIN ${normal.precipMm.toFixed(0)} MM · DAYLIGHT ${normal.daylightHours.toFixed(1)} H` : "—"}
        </p>
      </div>

      {/* 底部：TIME 拖轨（仅 Atlas 场景；Profile 显示静态实况时钟） */}
      <div
        className={[
          "absolute inset-x-0 bottom-0 z-10 px-4 pb-6 md:px-6",
          timeScrubber ? "" : "hidden",
        ].join(" ")}
      >
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <span className="font-mono text-micro tabular-nums text-white/60">00</span>
          <div
            ref={trackRef}
            role="slider"
            tabIndex={0}
            aria-label="Time of day — drag to preview the city at different hours"
            aria-valuemin={0}
            aria-valuemax={24}
            aria-valuenow={Math.round(hour)}
            aria-valuetext={timeLabel}
            onPointerDown={onTrackDown}
            onPointerMove={onTrackMove}
            onPointerUp={onTrackUp}
            onPointerCancel={onTrackUp}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") { e.preventDefault(); setScrubHour(hour - 0.5); }
              if (e.key === "ArrowRight") { e.preventDefault(); setScrubHour(hour + 0.5); }
              if (e.key === "Home") { e.preventDefault(); setScrubHour(0); }
              if (e.key === "End") { e.preventDefault(); setScrubHour(23.99); }
            }}
            className="ut-time-track relative h-2 min-h-[44px] w-full cursor-ew-resize rounded-full"
            style={{ backgroundPosition: "center", backgroundSize: "100% 8px", backgroundRepeat: "no-repeat" }}
          >
            <span
              className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80 bg-[#0c0f16]"
              style={{ left: `${(hour / 24) * 100}%` }}
            />
          </div>
          <span className="font-mono text-micro tabular-nums text-white/60">24</span>
          <button
            type="button"
            onClick={backToLive}
            className={[
              "min-h-[44px] rounded-ut-pill border px-4 font-mono text-micro uppercase tracking-[0.16em] transition-colors duration-[var(--ut-dur-fast)] motion-reduce:transition-none",
              isLiveHour ? "border-[#6ee7b7]/60 text-[#6ee7b7]" : "border-white/30 text-white/80 hover:border-white/60",
            ].join(" ")}
          >
            {isLiveHour ? "● Live" : "Back to now"}
          </button>
        </div>
      </div>
    </header>
  );
}

function makeDrops(precipMm: number) {
  const count = Math.min(56, Math.max(0, Math.round(precipMm / 3.5)));
  return Array.from({ length: count }, (_, i) => ({
    left: `${(i * 37 + 11) % 100}%`,
    height: `${14 + (i % 4) * 9}px`,
    duration: 0.9 + (i % 5) * 0.14,
    delay: (i % 9) * 0.35,
  }));
}

function makeStars() {
  const stars: { x: string; y: string; s: number; o: number }[] = [];
  let seed = 7;
  for (let i = 0; i < 42; i += 1) {
    seed = (seed * 16807) % 2147483647;
    const rx = (seed % 1000) / 1000;
    seed = (seed * 16807) % 2147483647;
    const ry = (seed % 1000) / 1000;
    seed = (seed * 16807) % 2147483647;
    stars.push({
      x: `${(rx * 100).toFixed(1)}%`,
      y: `${(ry * 55).toFixed(1)}%`,
      s: 1 + ((seed % 3) * 0.5),
      o: 0.35 + ((seed % 5) / 5) * 0.5,
    });
  }
  return stars;
}

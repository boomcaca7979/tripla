"use client";

/**
 * GlobeControls — 地图相机控件（缩放 + 平移）。
 *
 * 来源：**移植自 OSIRIS**（MIT，https://github.com/simplifaisoul/osiris）的
 * `src/components/MapControls.tsx`。逻辑与 DOM 结构照搬：
 *   · 按住不放会连续移动（`press` 延迟 280ms 后每 200ms 走一段）
 *   · 指针捕获 + `onLostPointerCapture` 兜底，手指滑出按钮也不会卡住
 *   · 键盘可达（`onClick` 里 `e.detail === 0` 处理 Enter/Space 的单步移动）
 *   · 到缩放上下限时按钮 disabled
 * 改动仅为"减依赖 + 换外观"：
 *   · 去掉 `framer-motion`（UTRIPLA 未安装）→ 用 CSS transition 做入场
 *   · 去掉 `lucide-react`（UTRIPLA 未安装）→ 内联 SVG
 *   · 配色改用 UTRIPLA 的深空 token，不是 OSIRIS 的情报面板配色
 * 相机控制器本身来自 `@/lib/atlas/map-camera-controls`（同样是 OSIRIS 移植）。
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { Map as MlMap } from "maplibre-gl";
import { createMapCameraControls, type CameraMove } from "@/lib/atlas/map-camera-controls";

interface GlobeControlsProps {
  /**
   * 地图实例。**这里刻意不用 ref**：地图是在子组件的 effect 里异步建出来的，
   * 传 ref 的话控件自己的 effect（依赖 ref 对象）在地图就绪时不会重跑，
   * 控制器就永远拿不到地图。直接传实例、以实例为依赖，才建得起来。
   */
  map: MlMap | null;
  onInteract?: () => void;
}

type IconProps = { className?: string };

function PlusIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function MinusIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden="true">
      <path d="M5 12h14" />
    </svg>
  );
}

function ChevronIcon({ dir, className }: IconProps & { dir: "up" | "down" | "left" | "right" }) {
  const rotate = { up: 0, right: 90, down: 180, left: 270 }[dir];
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transform: `rotate(${rotate}deg)` }}>
      <path d="M6 15l6-6 6 6" />
    </svg>
  );
}

export default function GlobeControls({ map, onInteract }: GlobeControlsProps) {
  const controller = useRef<ReturnType<typeof createMapCameraControls> | null>(null);
  const interact = useRef(onInteract);
  const [limits, setLimits] = useState({ min: false, max: false });
  useEffect(() => { interact.current = onInteract; }, [onInteract]);

  useEffect(() => {
    if (!map) return;
    const controls = createMapCameraControls(
      map,
      () => interact.current?.(),
      () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    controller.current = controls;
    const updateLimits = () => setLimits({
      min: map.getZoom() <= map.getMinZoom() + 0.001,
      max: map.getZoom() >= map.getMaxZoom() - 0.001,
    });
    const onHidden = () => { if (document.hidden) controls.release(); };
    updateLimits();
    map.on("zoomend", updateLimits);
    window.addEventListener("blur", controls.release);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      controls.dispose();
      controller.current = null;
      map.off("zoomend", updateLimits);
      window.removeEventListener("blur", controls.release);
      document.removeEventListener("visibilitychange", onHidden);
    };
  }, [map]);

  const step = useCallback((move: CameraMove) => controller.current?.step(move), []);
  const press = useCallback((move: CameraMove) => controller.current?.press(move), []);
  const release = useCallback(() => controller.current?.release(), []);

  return (
    <div
      data-globe-controls=""
      className="pointer-events-auto flex items-center gap-[3px] rounded-ut-sm border border-white/12 bg-[#070c16]/70 p-[3px] backdrop-blur-md"
    >
      <div className="flex flex-col gap-[3px]">
        <Btn label="Zoom in" move={{ kind: "zoom", dir: 1 }} icon={<PlusIcon className="h-3.5 w-3.5" />} disabled={limits.max} press={press} release={release} step={step} />
        <Btn label="Zoom out" move={{ kind: "zoom", dir: -1 }} icon={<MinusIcon className="h-3.5 w-3.5" />} disabled={limits.min} press={press} release={release} step={step} />
      </div>
      {/* 平移盘：桌面才有意义（触摸端直接拖） */}
      <div className="hidden items-center gap-1 md:flex">
        <div aria-hidden="true" className="mx-1 h-12 w-px bg-white/10" />
        <div className="grid grid-cols-3 grid-rows-3 gap-[3px]">
          <Btn cell="col-start-2 row-start-1" label="Pan north" move={{ kind: "pan", dx: 0, dy: -1 }} icon={<ChevronIcon dir="up" className="h-3.5 w-3.5" />} press={press} release={release} step={step} />
          <Btn cell="col-start-1 row-start-2" label="Pan west" move={{ kind: "pan", dx: -1, dy: 0 }} icon={<ChevronIcon dir="left" className="h-3.5 w-3.5" />} press={press} release={release} step={step} />
          <Btn cell="col-start-3 row-start-2" label="Pan east" move={{ kind: "pan", dx: 1, dy: 0 }} icon={<ChevronIcon dir="right" className="h-3.5 w-3.5" />} press={press} release={release} step={step} />
          <Btn cell="col-start-2 row-start-3" label="Pan south" move={{ kind: "pan", dx: 0, dy: 1 }} icon={<ChevronIcon dir="down" className="h-3.5 w-3.5" />} press={press} release={release} step={step} />
        </div>
      </div>
    </div>
  );
}

function Btn({
  cell = "", label, icon, move, disabled = false, press, release, step,
}: {
  cell?: string;
  label: string;
  icon: React.ReactNode;
  move: CameraMove;
  disabled?: boolean;
  press: (m: CameraMove) => void;
  release: () => void;
  step: (m: CameraMove) => void;
}) {
  return (
    <button
      type="button"
      title={`${label} — hold to keep going`}
      aria-label={label}
      disabled={disabled}
      className={`${cell} flex h-8 w-8 touch-none select-none items-center justify-center rounded-ut-sm text-white/55 transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/40 disabled:opacity-25`}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* 捕获失败不影响单步 */ }
        press(move);
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onClick={(e) => { if (e.detail === 0) step(move); }}
    >
      {icon}
    </button>
  );
}

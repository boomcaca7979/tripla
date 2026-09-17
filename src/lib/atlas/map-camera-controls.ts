/**
 * map-camera-controls — 地图相机按钮控制器（按住连续缩放 / 平移）。
 *
 * 来源：**移植自 OSIRIS**（https://github.com/simplifaisoul/osiris，MIT License，
 * Copyright (c) Souleimen Mele）的 `src/lib/map-camera-controls.ts`，逻辑逐行保留。
 * 唯一改动：内部事件标记 `osirisCameraControl` → `utriplaCameraControl`（纯改名，行为不变）。
 *
 * 这段代码解决的问题（照搬 OSIRIS 的结论，不重新发明）：
 *   按钮驱动的动画会被用户的滚轮/双指/拖拽打断。做法是"**一个控制器持有按钮意图**"，
 *   用 `ownsAnimation` + `issuing` 两个标志区分"这次 movestart 是我自己发起的"还是
 *   "用户接管的"，从而既不丢点击、也不去 stop 用户的惯性动画。
 */

import type { Map as MapLibreMap, MapMovementEvent } from 'maplibre-gl';

export type CameraMove = { kind: 'zoom'; dir: 1 | -1 } | { kind: 'pan'; dx: number; dy: number };
const CONTROL_EVENT = { utriplaCameraControl: true };
const STEP_MS = 240;
const HOLD_DELAY_MS = 280;
const LEG_MS = 400;
const TICK_MS = 200;

/** 一个控制器持有按钮意图；被打断的动画不会丢失点击。 */
export function createMapCameraControls(
  map: MapLibreMap,
  onInteract: () => void = () => {},
  reducedMotion: () => boolean = () => false,
) {
  let targetZoom: number | null = null;
  let issuing = false;
  let ownsAnimation = false;
  let disposed = false;
  let delay: ReturnType<typeof setTimeout> | undefined;
  let repeat: ReturnType<typeof setInterval> | undefined;
  const clampZoom = (zoom: number) => Math.max(map.getMinZoom(), Math.min(map.getMaxZoom(), zoom));

  const run = (action: () => void) => {
    issuing = true;
    ownsAnimation = true;
    try { action(); }
    finally { issuing = false; }
    if (!map.isMoving()) { targetZoom = null; ownsAnimation = false; }
  };

  const release = (stop = true) => {
    clearTimeout(delay);
    delay = undefined;
    const wasHolding = repeat !== undefined;
    clearInterval(repeat);
    repeat = undefined;
    if (wasHolding && stop && ownsAnimation && !disposed) map.stop();
    if (wasHolding) targetZoom = null;
  };

  const step = (move: CameraMove) => {
    if (disposed) return;
    onInteract();
    const duration = reducedMotion() ? 0 : STEP_MS;
    if (move.kind === 'zoom') {
      const next = clampZoom((targetZoom ?? map.getZoom()) + move.dir);
      if (next === targetZoom || (targetZoom === null && next === map.getZoom())) return;
      targetZoom = next;
      run(() => map.easeTo({ zoom: next, duration }, CONTROL_EVENT));
    } else {
      targetZoom = null;
      run(() => map.panBy([move.dx * 220, move.dy * 220], { duration }, CONTROL_EVENT));
    }
  };

  const press = (move: CameraMove) => {
    if (disposed) return;
    release();
    step(move);
    const leg = () => {
      if (disposed) return;
      targetZoom = null;
      const duration = reducedMotion() ? 0 : LEG_MS;
      // 开了 reduced motion 时只走这一 tick 的距离（不做重叠动画）。
      const seconds = (duration ? LEG_MS : TICK_MS) / 1000;
      if (move.kind === 'zoom') {
        const zoom = clampZoom(map.getZoom() + move.dir * 1.6 * seconds);
        if (zoom === map.getZoom()) { release(); return; }
        run(() => map.easeTo({ zoom, duration, easing: t => t }, CONTROL_EVENT));
      } else {
        run(() => map.panBy([move.dx * 640 * seconds, move.dy * 640 * seconds], { duration, easing: t => t }, CONTROL_EVENT));
      }
    };
    delay = setTimeout(() => {
      delay = undefined;
      repeat = setInterval(leg, TICK_MS);
      leg();
    }, HOLD_DELAY_MS);
  };

  const onStart = (event: MapMovementEvent & { utriplaCameraControl?: boolean }) => {
    if (event.utriplaCameraControl || issuing) return;
    // 滚轮 / 双指 / 搜索 / 视角变化接管了所有权：不要 stop 它的运动。
    release(false);
    targetZoom = null;
    ownsAnimation = false;
  };
  const onEnd = () => {
    // easeTo 会同步结束它替换掉的那个动画，然后才开始新的。
    if (!issuing) { targetZoom = null; ownsAnimation = false; }
  };
  const dispose = () => {
    if (disposed) return;
    release();
    disposed = true;
    map.off('movestart', onStart);
    map.off('moveend', onEnd);
    map.off('remove', onRemove);
  };
  const onRemove = () => {
    // 地图销毁早于 React 子组件清理：不要对已死的地图调 stop。
    ownsAnimation = false;
    dispose();
  };
  map.on('movestart', onStart);
  map.on('moveend', onEnd);
  map.on('remove', onRemove);
  return { step, press, release: () => release(), dispose };
}

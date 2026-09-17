"use client";

import { useEffect, useRef, useState } from "react";
import type { EarthHover, EarthNode, EarthSceneHandle } from "./globe/earth";

/**
 * ⚠️ 替换边界：本组件是 /destinations 的**当前地图实现**（Three.js）。
 * 未来正式接入 MapLibre Globe 时，只需提供一个实现相同 props 契约的组件：
 *   nodes / selectedSlug / onHover / onNodeClick / onFailure / onHandle(className)
 * 其中 onHandle 暴露的 handle 需实现：update / setSelected / zoomBy / resetView /
 * flyTo(lonDeg, latDeg, durationMs) / globeMetrics / dispose（见 globe/earth.ts 的
 * EarthSceneHandle）。页面骨架（搜索 / preview / SEO links）不随引擎更换而修改。
 */

/**
 * EarthGlobe — WebGL 夜晚地球的 React 包装层（薄壳）。
 *
 * 设计边界：
 *   · 真正的 3D 逻辑在 ./globe/earth.ts（framework-agnostic）；这里只负责
 *     生命周期、属性同步、以及 WebGL 不可用时的失败上报。
 *   · three.js 通过**动态 import** 进入，只在 /destinations 且组件挂载后才下载，
 *     不进首屏 bundle。
 *   · 失败（无 WebGL / 上下文丢失 / 初始化异常）不白屏：上报给调用方切换降级 UI。
 *
 * 触摸滚动：canvas 使用 `touch-action: pan-y`，纵向滑动仍然滚动页面，
 * 只有横向/斜向拖动才旋转地球，避免地图永久劫持页面滚动。
 */

export interface EarthGlobeProps {
  nodes: EarthNode[];
  selectedSlug: string | null;
  onHover: (hover: EarthHover | null) => void;
  onNodeClick: (slug: string, isTouch: boolean) => void;
  onFailure: (reason: string) => void;
  /** 句柄交给调用方（缩放 / 重置 / 选中同步） */
  onHandle: (handle: EarthSceneHandle | null) => void;
  /** 引擎就绪（用于淡入，避免加载中忽明忽暗） */
  onReady?: () => void;
  className?: string;
}

export default function EarthGlobe({
  nodes,
  selectedSlug,
  onHover,
  onNodeClick,
  onFailure,
  onHandle,
  onReady,
  className = "",
}: EarthGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** 标签层：React 只渲染这个空容器，引擎往里写标签子节点（不参与 React 渲染） */
  const labelLayerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<EarthSceneHandle | null>(null);
  const [ready, setReady] = useState(false);

  // 回调与节点放进 ref：避免它们的身份变化导致场景重建。
  // 注意：ref 只在 effect 里写（React 禁止在 render 期间改 ref）。
  const cbRef = useRef({ onHover, onNodeClick, onFailure, onHandle, onReady });
  const nodesRef = useRef(nodes);
  useEffect(() => {
    cbRef.current = { onHover, onNodeClick, onFailure, onHandle, onReady };
    nodesRef.current = nodes;
  });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const labelLayer = labelLayerRef.current;
    if (!container || !canvas || !labelLayer) return;

    let disposed = false;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    (async () => {
      try {
        const mod = await import("./globe/earth");
        if (disposed) return;
        const handle = mod.createEarthScene({
          canvas,
          container,
          labelLayer,
          nodes: nodesRef.current,
          reduceMotion,
          onHover: (h) => cbRef.current.onHover(h),
          onNodeClick: (slug, isTouch) => cbRef.current.onNodeClick(slug, isTouch),
          onFailure: (reason) => {
            if (disposed) return;
            cbRef.current.onFailure(reason);
          },
        });
        if (disposed) {
          handle.dispose();
          return;
        }
        handleRef.current = handle;
        handle.setSelected(selectedSlug);
        cbRef.current.onHandle(handle);
        setReady(true);
        cbRef.current.onReady?.();
      } catch (err) {
        if (!disposed) cbRef.current.onFailure(`import: ${String(err)}`);
      }
    })();

    return () => {
      disposed = true;
      handleRef.current?.dispose();
      handleRef.current = null;
      cbRef.current.onHandle(null);
    };
    // 只挂载一次：后续变更通过 update/setSelected 同步
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 节点数据 / 选中状态的增量同步（不重建场景）
  useEffect(() => {
    handleRef.current?.update(nodes);
  }, [nodes]);

  useEffect(() => {
    handleRef.current?.setSelected(selectedSlug);
  }, [selectedSlug]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={[
          "h-full w-full cursor-grab touch-pan-y select-none",
          "transition-opacity duration-[var(--ut-dur-slow)] ease-ut-out",
          ready ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
      {/* 标签层：大洲 / 城市 / 当前交互城市（引擎逐帧写入，见 globe/earth.ts） */}
      <div
        ref={labelLayerRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      />
      {!ready && (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-micro uppercase tracking-[0.18em] text-white/40">
          Loading globe
        </p>
      )}
    </div>
  );
}

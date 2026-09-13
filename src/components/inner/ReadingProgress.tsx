"use client";

import { useEffect, useRef } from "react";

/**
 * ReadingProgress — Guide 页面唯一允许的交互状态（FINAL CONTRACT: "reading-progress
 * is Guide's only state"）。
 *
 * 确定性：首屏渲染 transform: scaleX(0) 在 server 与 client 完全一致，
 * useEffect 挂载后再按滚动位置更新 —— 不存在 hydration mismatch（规避 #418 回归）。
 * 不使用 new Date() / 任何非确定性渲染。
 * 减少动画：未加 transition，随滚动即时更新；尊重 saveData / reduced-motion 时本就无动画成本。
 * 定位：固定在 sticky header 正下方（top-16 = 64px），不覆盖 header（z-40 < header z-50）。
 */
export default function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    let raf = 0;

    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const progress =
        scrollable > 0
          ? Math.min(1, Math.max(0, window.scrollY / scrollable))
          : 0;
      bar.style.transform = `scaleX(${progress})`;
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      className="fixed inset-x-0 top-16 z-40 h-0.5 bg-transparent"
      aria-hidden="true"
    >
      <div
        ref={barRef}
        className="h-full w-full origin-left bg-ut-accent"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}

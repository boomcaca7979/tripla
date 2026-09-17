"use client";

import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";

interface RevealProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** 触发可见的额外延迟（ms），用于错落进场；上限 300ms */
  delayMs?: number;
}

/**
 * Reveal — 进入视口后 opacity + translateY 进场。
 *
 * SEO / 无 JS 安全：初始隐藏的样式只包在 CSS `@media (scripting: enabled)`
 * 里（解析期生效，不需要任何内联脚本打 class）。无 JS 或爬虫看到的内容默认可见。
 * 刻意不用内联 <script> 标记：那会占用 <head> 的 DOM 位置，与在 hydration 前
 * 向 head 注入节点的第三方脚本（AdSense）冲突，触发 hydration mismatch。
 * `prefers-reduced-motion: reduce` 时直接可见、无动画。
 */
export default function Reveal({ children, delayMs = 0, className = "", style, ...rest }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // IO 不可用时直接可见（保证内容永远可见）
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("ut-reveal-visible");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("ut-reveal-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={["ut-reveal", className].filter(Boolean).join(" ")}
      style={delayMs ? { ...style, transitionDelay: `${Math.min(delayMs, 300)}ms` } : style}
      {...rest}
    >
      {children}
    </div>
  );
}

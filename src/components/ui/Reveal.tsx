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
 * SEO / 无 JS 安全：初始隐藏的样式只挂在 `html.js-ready` 下
 * （由 layout 中的内联脚本添加）。无 JS 或爬虫看到的内容默认可见。
 * `prefers-reduced-motion: reduce` 时直接可见、无动画。
 */
export default function Reveal({ children, delayMs = 0, className = "", style, ...rest }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // JS 未在 <html> 标记 js-ready（理论上不可能走到这里）或 IO 不支持时直接可见
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

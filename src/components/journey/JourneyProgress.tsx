"use client";

import { useEffect, useState } from "react";
import type { JourneyLeg } from "./journey-state";

/**
 * JourneyProgress — Journey State：Day / Stop 进度。
 *
 * CONTRACT §11 / §40：
 *   页面必须表达"旅程进行到哪一段"。这里用**节点进度轨**表示：
 *   每个 leg 一段，当前 leg 以品牌 accent 高亮；节点同时是到当日行程的锚点链接
 *   （#journey-day-N），因此它既是"进度读数"，也是"旅程导航"。
 *
 *   §10 状态只改变外观（颜色 / aria-current），**绝不改变结构、顺序或内容可见性**：
 *   任何滚动位置下，所有 leg 节点与标签始终存在且顺序不变。
 *
 *   §40 首帧确定性：SSR 与客户端首次 render 都取 legs[0].day（常量）——
 *   两侧完全一致 → 不产生 #418；真实进度在 hydration 后的 scroll 监听里写入。
 *   监听用 rAF 节流 + passive，切页时移除，不引入任何常驻任务。
 *
 * 该组件是本页唯一的 client component（氛围层为纯 server，零 hydration 风险）。
 */
const OFFSET = 160; // 固定 Header (64px) 之下的判定线

export default function JourneyProgress({ legs }: { legs: JourneyLeg[] }) {
  const first = legs[0]?.day ?? 1;
  const [active, setActive] = useState<number>(first);

  useEffect(() => {
    const read = () => {
      let current = first;
      for (const leg of legs) {
        const el = document.getElementById(`journey-day-${leg.day}`);
        if (el && el.getBoundingClientRect().top <= OFFSET) current = leg.day;
      }
      setActive(current);
    };
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        read();
        raf = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    read();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [legs, first]);

  if (legs.length === 0) return null;

  return (
    <nav aria-label="Journey progress — jump to a day" className="mb-8">
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-mono text-micro uppercase tracking-[0.18em] text-ut-muted">
          Journey progress
        </span>
        <span className="font-mono text-label tabular-nums text-ut-muted">
          Day {active} of {legs.length}
        </span>
      </div>

      <div className="mt-3 overflow-x-auto">
        <ol className="flex min-w-full">
          {legs.map((leg) => {
            const on = leg.day === active;
            return (
              <li key={leg.day} className="min-w-[3.25rem] flex-1">
                <a
                  href={`#journey-day-${leg.day}`}
                  aria-current={on ? "step" : undefined}
                  className="group flex min-h-[44px] flex-col justify-center gap-1.5 pr-1.5 focus-visible:outline-2 focus-visible:outline-ut-accent"
                >
                  <span
                    className={[
                      "h-[3px] w-full rounded-ut-pill transition-colors duration-[var(--ut-dur-fast)]",
                      on
                        ? "bg-ut-accent"
                        : "bg-ut-border-strong group-hover:bg-ut-muted",
                    ].join(" ")}
                  />
                  <span
                    className={[
                      "font-mono text-micro tabular-nums tracking-wide transition-colors duration-[var(--ut-dur-fast)]",
                      on ? "text-ut-accent-strong" : "text-ut-muted",
                    ].join(" ")}
                  >
                    Day {leg.day}
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

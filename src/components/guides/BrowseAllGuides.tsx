"use client";

/**
 * BrowseAllGuides — "Browse all guides" 网格（客户端渐进展示）。
 *
 * SEO 契约：**全部卡片由 server component 传入并在 SSR HTML 中渲染**（真实
 * /guides/<slug> 链接全部可爬取）；本组件只做视觉上的渐进展开 —— 首屏显示
 * `initialVisible` 张，其余以 `hidden` 属性隐藏（仍在 DOM），点击 Show more 逐批显示。
 * 卡片本身保持轻量（gradient 封面，无图片请求）。
 */

import { useState } from "react";
import Link from "next/link";
import type { GuideHubCard } from "@/lib/guides-hub";

export default function BrowseAllGuides({
  cards,
  initialVisible = 24,
  step = 24,
}: {
  cards: readonly GuideHubCard[];
  initialVisible?: number;
  step?: number;
}) {
  const [visible, setVisible] = useState(initialVisible);

  return (
    <div>
      <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, i) => (
          <li key={card.slug} hidden={i >= visible}>
            <Link href={`/guides/${card.slug}`} className="group block">
              <div
                className={`relative flex h-32 items-end overflow-hidden rounded-ut-md bg-gradient-to-br ${card.gradient}`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                <span className="absolute bottom-3 left-4 font-mono text-micro uppercase tracking-[0.16em] text-white/90">
                  {card.city} · {card.country}
                </span>
                {card.event && (
                  <span className="absolute right-3 top-3 rounded-full border border-white/30 px-2 py-0.5 font-mono text-micro uppercase tracking-[0.12em] text-white/85">
                    Event
                  </span>
                )}
              </div>
              <h3 className="mt-3 font-display text-[1.05rem] leading-snug text-ut-ink transition-colors group-hover:text-ut-accent">
                {card.title}
              </h3>
              <p className="mt-1 font-mono text-micro uppercase tracking-[0.12em] text-ut-muted">
                {card.readTime} · {card.days} {card.days === 1 ? "day" : "days"} · Updated{" "}
                {card.updatedAt}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {cards.length > visible && (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + step)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-ut-sm border border-white/20 px-6 font-mono text-micro uppercase tracking-[0.16em] text-white/75 transition-colors hover:border-white/50 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ut-accent"
          >
            Show more guides ({cards.length - visible} remaining)
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

/**
 * BrowseAllTrips — "Browse all trips" 网格（客户端渐进展示）。
 *
 * SEO 契约：**全部卡片由 server component 传入并在 SSR HTML 中渲染**（真实
 * /trips/<slug> 链接全部可爬取）；本组件只做视觉上的渐进展开 —— 首屏显示
 * `initialVisible` 张，其余以 `hidden` 属性隐藏（仍在 DOM），点击 Show more 逐批显示。
 *
 * 视觉语言：journey —— 封面 + 天数徽标 + 逐日 progression 摘要。
 */

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { TripHubCard } from "@/lib/trips-hub";
import { TRAVEL_STYLE_LABELS } from "@/lib/trips-hub";

export default function BrowseAllTrips({
  cards,
  initialVisible = 24,
  step = 24,
}: {
  cards: readonly TripHubCard[];
  initialVisible?: number;
  step?: number;
}) {
  const [visible, setVisible] = useState(initialVisible);

  return (
    <div>
      <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, i) => (
          <li key={card.slug} hidden={i >= visible}>
            <Link href={`/trips/${card.slug}`} className="group block">
              <div
                className={`relative flex h-32 items-end overflow-hidden rounded-ut-md bg-gradient-to-br ${card.gradient}`}
              >
                {card.image && (
                  <Image
                    src={card.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    loading="lazy"
                    className="object-cover opacity-80"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
                <span className="absolute bottom-3 left-4 font-mono text-micro uppercase tracking-[0.16em] text-white/90">
                  {card.city} · {card.country}
                </span>
                <span className="absolute right-3 top-3 rounded-full border border-white/25 bg-black/25 px-2 py-0.5 font-mono text-micro uppercase tracking-[0.12em] text-white/85 backdrop-blur-sm">
                  {card.days} {card.days === 1 ? "day" : "days"}
                </span>
              </div>
              <h3 className="mt-3 font-display text-[1.05rem] leading-snug text-ut-ink transition-colors group-hover:text-ut-accent">
                {card.title}
              </h3>
              <p className="mt-1 font-mono text-micro uppercase tracking-[0.12em] text-ut-muted">
                {TRAVEL_STYLE_LABELS[card.travelStyle]} · {card.dayCount}{" "}
                {card.dayCount === 1 ? "day" : "days"} planned
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
            Show more trips ({cards.length - visible} remaining)
          </button>
        </div>
      )}
    </div>
  );
}

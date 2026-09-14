"use client";

import { useDestinationVibeStore } from "./vibe-store";
import { filterByVibe } from "@/lib/inner-state";

/**
 * KeepExploring — "KEEP EXPLORING" 区（guides / routes / related destinations）。
 *
 * Server 页把三组真实条目（含各自真实 tags：guide.tags / trip.interests /
 * destination.interests）作为 props 传入。vibe 来自共享 zustand store：
 *   · null（ALL）→ 全量渲染（SSR 首帧即全量 —— SEO 内容完整在 DOM）。
 *   · vibe → filterByVibe 保序过滤（真实 tag 映射，确定性）。
 *   · 某组过滤后为空 → 回退显示全量 + mono 说明（禁止空白页）。
 *
 * 行样式 = hairline editorial rows（serif 标题 + mono meta + 单行 description +
 * hover surface），不是 3-col 卡片网格。
 */

export interface ExploreItem {
  href: string;
  title: string;
  meta: string;
  description: string;
  tags: string[];
}

export interface ExploreSection {
  key: string;
  title: string;
  eyebrow: string;
  items: ExploreItem[];
}

export default function KeepExploring({ sections }: { sections: ExploreSection[] }) {
  const vibe = useDestinationVibeStore((s) => s.vibe);

  return (
    <div data-ut-keepexploring="">
      {sections.map((section) => {
        const filtered = filterByVibe(section.items, (item) => item.tags, vibe);
        const empty = filtered.length === 0;
        const shown = empty ? section.items : filtered;
        return (
          <div key={section.key} className="mb-10 last:mb-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-h3 leading-[var(--ut-text-h3--lh)] text-ut-ink">
                {section.title}
              </h3>
              <p className="font-mono text-micro uppercase tracking-[0.16em] text-ut-muted">
                {section.eyebrow}
              </p>
            </div>
            {vibe !== null && empty && (
              <p className="mt-2 font-mono text-micro uppercase tracking-[0.14em] text-ut-subtle">
                No {vibe} match here — showing all
              </p>
            )}
            <ul className="mt-3 divide-y divide-ut-border border-t border-ut-border">
              {shown.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="group flex min-h-[44px] flex-col gap-1 px-1 py-4 transition-colors duration-[var(--ut-dur-fast)] ease-ut-out hover:bg-ut-surface motion-reduce:transition-none sm:flex-row sm:items-baseline sm:gap-6"
                  >
                    <span className="min-w-0 shrink-0 basis-[22rem] font-display text-h3 leading-[var(--ut-text-h3--lh)] text-ut-text transition-colors duration-[var(--ut-dur-fast)] group-hover:text-ut-accent-strong motion-reduce:transition-none">
                      {item.title}
                    </span>
                    <span className="whitespace-nowrap font-mono text-label uppercase tracking-[0.14em] text-ut-muted">
                      {item.meta}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-body-sm leading-[1.5] text-ut-text-2">
                      {item.description}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

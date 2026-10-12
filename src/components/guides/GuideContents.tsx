import Link from "next/link";
import Eyebrow from "@/components/ui/Eyebrow";
import type { GuideTocEntry } from "@/lib/guide-detail";

/**
 * GuideContents — "What this guide covers"。
 *
 * 条目全部来自该 guide 真实的章节标题（`sections[].heading` + `itinerary.heading`），
 * 不新增、不改写、不生成任何内容；只是把已有结构提前成可扫描的目录。
 * 锚点指向页面内真实存在的 section id。
 */
export default function GuideContents({ entries }: { entries: GuideTocEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <section aria-labelledby="guide-contents" className="mb-12">
      <Eyebrow className="mb-3">What this guide covers</Eyebrow>
      <h2 id="guide-contents" className="sr-only">
        What this guide covers
      </h2>
      <ol className="divide-y divide-ut-border">
        {entries.map((e) => (
          <li key={e.id}>
            <Link
              href={`#${e.id}`}
              className="group flex items-baseline gap-4 rounded-ut-sm py-3 transition-colors hover:bg-ut-surface-hover focus-visible:outline-2 focus-visible:outline-ut-accent"
            >
              <span className="font-mono text-label tabular-nums text-ut-subtle">
                {String(e.index).padStart(2, "0")}
              </span>
              <span className="min-w-0 font-display text-h3 leading-[var(--ut-text-h3--lh)] text-ut-ink transition-colors group-hover:text-ut-accent">
                {e.heading}
              </span>
              <span
                className="ml-auto shrink-0 text-ut-subtle transition-transform duration-[var(--ut-dur-fast)] group-hover:translate-y-0.5"
                aria-hidden="true"
              >
                ↓
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

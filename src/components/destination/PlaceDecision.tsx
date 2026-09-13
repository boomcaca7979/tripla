import Link from "next/link";
import type { ReactNode } from "react";
import Eyebrow from "@/components/ui/Eyebrow";

/**
 * PlaceDecision — 语境化决策模块（When to go / Budget 共用）。
 *
 * CONTRACT §18 / §19：Destination 中 Best-time 与 Budget 不是整页复制，
 * 而是 contextual decision module：给出可决策的答案 + 一句原因 + 少量真实读数，
 * 再以 hairline accent 链接指向真正的深挖页面（Context → Deep Dive）。
 *
 * 刻意**不使用**填充卡片：以顶部细横线 + 7/5 非对称分栏建立空间关系，
 * 让“决定”读起来是编辑判断，而不是一个 dashboard 组件。
 *
 * 可读性：深挖链接是交互文本，使用 --ut-accent-strong（纸面 5.84:1）而非
 * --ut-accent（4.26:1，未达 AA 4.5:1）；数据行标签属信息，使用 --ut-muted。
 */
export default function PlaceDecision({
  index,
  eyebrow,
  headline,
  body,
  lines = [],
  href,
  linkLabel,
}: {
  index: string;
  eyebrow: string;
  headline: string;
  body: ReactNode;
  lines?: { label: string; value: string }[];
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="grid gap-x-12 gap-y-6 border-t border-ut-border-strong pt-6 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <Eyebrow>
          {index} · {eyebrow}
        </Eyebrow>
        <p className="mt-4 max-w-[26ch] font-display text-h2 leading-[var(--ut-text-h2--lh)] text-ut-ink">
          {headline}
        </p>
        <div className="mt-4 max-w-[58ch] text-body leading-[1.6] text-ut-text-2">
          {body}
        </div>
      </div>

      <div className="lg:col-span-5">
        {lines.length > 0 && (
          <dl className="space-y-3">
            {lines.map((line) => (
              <div
                key={line.label}
                className="flex items-baseline justify-between gap-6 border-t border-ut-border pt-3"
              >
                <dt className="font-mono text-label uppercase tracking-[0.16em] text-ut-muted">
                  {line.label}
                </dt>
                <dd className="text-right font-mono text-body-sm text-ut-text">
                  {line.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
        <Link
          href={href}
          className="mt-5 inline-flex min-h-[44px] items-center gap-2 text-body-sm font-medium text-ut-accent-strong underline decoration-ut-accent-line underline-offset-4 transition-colors duration-[var(--ut-dur-fast)] hover:text-ut-ink focus-visible:outline-2 focus-visible:outline-ut-accent"
        >
          {linkLabel}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";

/**
 * TripQuickFacts — Trip Detail 首屏之下的**决策条**（decision strip）。
 *
 * 目标（Stage 3 §6.2）：让用户在第一屏之后立刻拿到"这是一段什么旅程"的
 * 关键读数 —— 去哪里、几天、什么风格、关注什么、哪个区域、什么时候去。
 *
 * CONTRACT：
 *   · 单条 hairline 读数行，**不是 dashboard**：没有卡片、没有图标网格、
 *     没有十几个字段；最多 6 项，缺数据即整项不渲染。
 *   · 全部字段来自真实数据（trip / destination），不派生假读数。
 *   · Destination 是**真实内链**（/destinations/<slug>），不是纯文本。
 */

export interface QuickFact {
  label: string;
  value: string;
  /** 可选真实内链（仅 Destination 使用）。 */
  href?: string;
}

export default function TripQuickFacts({ facts }: { facts: QuickFact[] }) {
  if (facts.length === 0) return null;

  return (
    <dl className="flex flex-wrap items-baseline gap-x-8 gap-y-3 border-y border-ut-border py-4">
      {facts.map((f) => (
        <div key={f.label} className="flex items-baseline gap-2">
          <dt className="font-mono text-micro uppercase tracking-[0.18em] text-ut-muted">
            {f.label}
          </dt>
          <dd className="font-mono text-body-sm text-ut-text">
            {f.href ? (
              <Link
                href={f.href}
                className="text-ut-accent-strong underline decoration-ut-accent-line underline-offset-4 transition-colors duration-[var(--ut-dur-fast)] hover:text-ut-ink focus-visible:outline-2 focus-visible:outline-ut-accent"
              >
                {f.value}
              </Link>
            ) : (
              f.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

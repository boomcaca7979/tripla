import Link from "next/link";

interface IndexItem {
  href: string;
  title: string;
  /** mono 微标签（read time / 国家 / 天数·预算） */
  meta?: string;
  /** 可选描述（摘要，2 行截断） */
  description?: string;
}

/**
 * EditorialIndex — 编辑式索引行（FINAL CONTRACT: "related = editorial index rows"）。
 * 用于相关指南 / 目的地 / 行程的内链，对应 Home GuidesStage 的 hairline 行模式。
 * 非卡片墙，避免 Card Contract 的"≤3 连续卡片"约束被触发。
 */
export default function EditorialIndex({ items }: { items: IndexItem[] }) {
  if (items.length === 0) return null;
  return (
    <ol className="divide-y divide-ut-border">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="group flex items-baseline justify-between gap-4 rounded-ut-sm py-4 transition-colors hover:bg-ut-surface-hover focus-visible:outline-2 focus-visible:outline-ut-accent"
          >
            <span className="min-w-0">
              <span className="block font-display text-h3 text-ut-ink transition-colors group-hover:text-ut-accent">
                {item.title}
              </span>
              {item.description && (
                <span className="mt-1 block text-body-sm leading-[1.5] text-ut-muted line-clamp-2">
                  {item.description}
                </span>
              )}
            </span>
            <span className="flex shrink-0 flex-col items-end gap-1">
              {item.meta && (
                <span className="font-mono text-label tracking-wide text-ut-subtle">
                  {item.meta}
                </span>
              )}
              <span
                className="text-ut-subtle transition-transform duration-[var(--ut-dur-fast)] group-hover:translate-x-0.5"
                aria-hidden="true"
              >
                →
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

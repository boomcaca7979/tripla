import Link from "next/link";

/**
 * PlaceJourneys — Journeys through this place（Destination → Trips）。
 *
 * CONTRACT §21：表达“穿过这个地方的旅程”，使用 route rows / compact travel
 * objects（duration / number of stops / related destinations），
 * **不是**普通三列 Card Grid。
 *
 * 实现：时刻表式路线行 —— 左侧 mono 天数标记 + serif 路线名 + mono 元数据 +
 * 细横线分隔，与 Guide 的 EditorialIndex（无天数标记）形成可辨识的差异。
 *
 * 语义：每条旅程是 "Routes through …" H2 之下的具名对象，使用 <h3>；
 * 索引行（指南 / 相关目的地）保持为链接文本、不使用标题标签。
 *
 * 可读性：预算是**信息**，使用 --ut-muted（暖面 5.30:1）；天数标记使用
 * --ut-accent-strong（6.44:1），保持与路线名的层级差。
 */
export interface Journey {
  href: string;
  title: string;
  days: number;
  budget: string;
  style: string;
  summary: string;
}

export default function PlaceJourneys({ journeys }: { journeys: Journey[] }) {
  if (journeys.length === 0) return null;

  return (
    <ol className="divide-y divide-ut-border">
      {journeys.map((journey) => (
        <li key={journey.href}>
          <Link
            href={journey.href}
            className={[
              "group grid grid-cols-[2.75rem_1fr_auto] items-baseline gap-x-5 py-5",
              "rounded-ut-sm transition-colors hover:bg-ut-surface-hover",
              "focus-visible:outline-2 focus-visible:outline-ut-accent",
            ].join(" ")}
          >
            <span className="font-mono text-body-sm tabular-nums text-ut-accent-strong">
              {journey.days}D
            </span>
            <div className="min-w-0">
              <h3 className="font-display text-h3 leading-[var(--ut-text-h3--lh)] text-ut-ink transition-colors group-hover:text-ut-accent">
                {journey.title}
              </h3>
              <p className="mt-1.5 line-clamp-2 text-body-sm leading-[1.5] text-ut-muted">
                {journey.summary}
              </p>
              <p className="mt-2 font-mono text-label tracking-wide text-ut-muted">
                {journey.budget} · {journey.style}
              </p>
            </div>
            <span
              className="text-ut-subtle transition-transform duration-[var(--ut-dur-fast)] group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              →
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

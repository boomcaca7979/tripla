import Link from "next/link";
import Eyebrow from "@/components/ui/Eyebrow";
import BeforeYouGo from "./BeforeYouGo";
import { GUIDES } from "@/data/guides";

/**
 * GuidesStage — "Read before you go."
 *
 * 重构点（本轮）：首页不再表现为"这里有六篇文章，请点击"。
 *   · 主体 = BeforeYouGo：决定去一个地方之前要回答的六个问题
 *     （Best time / Typical budget / Weather / Crowds / Ideal stay / What to know），
 *     跟随用户在发现层的当前选择。
 *   · 文章（Field notes）降为**次级索引**：3 条真实最新指南 + 全量入口。
 *
 * server component：guides 数据不进客户端 bundle；交互部分（BeforeYouGo）
 * 作为 client island 接收 HomeEnvironment 的共享状态。
 */

const FIELD_NOTES_LIMIT = 3;

export default function GuidesStage() {
  const latest = [...GUIDES]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, FIELD_NOTES_LIMIT);

  return (
    <section
      className="border-t"
      style={{ borderTopColor: "rgba(var(--ut-accent-rgb), 0.16)" }}
    >
      <div className="mx-auto max-w-[var(--ut-container-max)] px-4 py-20 md:px-6 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow dot>Before you go</Eyebrow>
            <h2 className="mt-3 font-display text-h1 text-ut-ink">
              Read before you go.
            </h2>
            <p className="mt-3 max-w-[58ch] text-body-sm text-ut-muted">
              Six questions decide whether a place actually fits: when to go, what it
              costs, what the weather does, how busy it gets, how long to stay, and what
              you shouldn&apos;t miss.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <BeforeYouGo />
        </div>

        {/* 次级：真实 Field notes 索引（不再是本区主体） */}
        <div className="mt-14 flex flex-wrap items-end justify-between gap-6">
          <p className="font-mono text-micro uppercase tracking-[0.18em] text-ut-subtle">
            Field notes
          </p>
          <Link
            href="/guides"
            className="inline-flex min-h-[44px] items-center rounded-ut-sm border border-ut-border-strong px-5 py-2.5 text-body-sm font-medium text-ut-text transition-[border-color,color] duration-[var(--ut-dur-fast)] ease-ut-out hover:border-ut-accent-line hover:text-ut-accent focus-visible:outline-2 focus-visible:outline-ut-accent"
          >
            All field notes →
          </Link>
        </div>

        <ol className="mt-6 divide-y divide-ut-border border-y border-ut-border">
          {latest.map((g, i) => (
            <li key={g.slug}>
              <Link
                href={`/guides/${g.slug}`}
                className="group flex items-baseline gap-4 py-4 transition-colors duration-[var(--ut-dur-fast)] sm:gap-8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ut-accent"
              >
                <span className="w-8 shrink-0 font-mono text-label text-ut-subtle">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-h3 leading-snug text-ut-ink transition-colors duration-[var(--ut-dur-fast)] group-hover:text-ut-accent">
                    {g.title}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-body-sm text-ut-text-2">{g.excerpt}</p>
                </div>
                <span className="hidden shrink-0 font-mono text-micro uppercase tracking-[0.14em] text-ut-muted sm:block">
                  {g.city} · {g.readTime}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

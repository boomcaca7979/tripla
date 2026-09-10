import Link from "next/link";
import Eyebrow from "@/components/ui/Eyebrow";
import { GUIDES } from "@/data/guides";
import { AI_PAGES } from "@/data/ai-pages";

/**
 * GuidesStage — 编辑内容层（server，零 client JS）。
 * 索引式编辑行（编号 + serif 标题），并保留 AI 落地页的内链带（SEO 内链资产）。
 */

const PLANNING_IDEA_SLUGS = [
  "ai-travel-planner",
  "ai-weekend-trip-planner",
  "ai-budget-travel-planner",
  "ai-food-trip-planner",
  "ai-trip-planner-for-couples",
  "ai-multi-city-trip-planner",
];

export default function GuidesStage() {
  const latest = [...GUIDES]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6);

  const ideas = PLANNING_IDEA_SLUGS
    .map((slug) => AI_PAGES.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <section
      className="border-t"
      style={{ borderTopColor: "rgba(var(--ut-accent-rgb), 0.16)" }}
    >
      <div className="mx-auto max-w-[var(--ut-container-max)] px-4 py-20 md:px-6 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow dot>Field notes</Eyebrow>
            <h2 className="mt-3 font-display text-h1 text-ut-ink">Read before you go.</h2>
          </div>
          <Link
            href="/guides"
            className="inline-flex min-h-[44px] items-center rounded-ut-sm border border-ut-border-strong px-5 py-2.5 text-body-sm font-medium text-ut-text transition-[border-color,color] duration-[var(--ut-dur-fast)] ease-ut-out hover:border-ut-accent-line hover:text-ut-accent focus-visible:outline-2 focus-visible:outline-ut-accent"
          >
            All field notes →
          </Link>
        </div>

        {/* 索引式编辑行 */}
        <ol className="mt-12 divide-y divide-ut-border border-y border-ut-border">
          {latest.map((g, i) => (
            <li key={g.slug}>
              <Link
                href={`/guides/${g.slug}`}
                className="group flex items-baseline gap-4 py-5 transition-colors duration-[var(--ut-dur-fast)] sm:gap-8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ut-accent"
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

        {/* Planning ideas 内链带（保留 AI 落地页从首页的内链） */}
        <div className="mt-14">
          <Eyebrow>Planning, eventually</Eyebrow>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {ideas.map((p) => (
              <Link
                key={p.slug}
                href={`/${p.slug}`}
                className="inline-flex min-h-[36px] items-center rounded-ut-pill border border-ut-border px-4 py-1.5 font-mono text-label text-ut-text-2 transition-[border-color,color] duration-[var(--ut-dur-fast)] ease-ut-out hover:border-ut-accent-line hover:text-ut-accent focus-visible:outline-2 focus-visible:outline-ut-accent"
              >
                {p.seoTitle}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

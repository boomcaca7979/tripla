import Link from "next/link";
import Eyebrow from "@/components/ui/Eyebrow";
import { AI_PAGES } from "@/data/ai-pages";

/**
 * PlanStage — "Plan your trip"（替换原 "Planning, eventually"）。
 *
 * 原实现只把一组 AI 落地页名称堆在首页（栏目名列表 + 未完成感的措辞）。
 * 本轮改为按**能力**组织：Discover → Compare → Understand → Plan，每一步说明
 * UTRIPLA 在这一步能做什么，并链接到真实存在的页面。
 *
 * AI 落地页入口保留但降为次级一行（内链资产不变，首页不再以它们为主体）。
 * server component：无 client JS。
 */

interface Capability {
  step: string;
  title: string;
  body: string;
  href: string;
  cta: string;
}

const CAPABILITIES: Capability[] = [
  {
    step: "01",
    title: "Discover",
    body: "Start from nothing but a month and a mood. The discovery layer above already does this — the atlas answers with places that fit.",
    href: "#discover",
    cta: "Back to discovery",
  },
  {
    step: "02",
    title: "Compare",
    body: "Put up to three destinations side by side in the world atlas and read their climate curves together for the month you care about.",
    href: "/destinations",
    cta: "Compare in the atlas",
  },
  {
    step: "03",
    title: "Understand",
    body: "Before you commit: best months, weather windows and typical daily budgets — destination by destination, from real climate data.",
    href: "/destinations",
    cta: "See months & climate",
  },
  {
    step: "04",
    title: "Plan",
    body: "Turn the place you picked into a day-by-day itinerary with flights, weather scoring and a budget that matches your style.",
    href: "/plan",
    cta: "Open the planner",
  },
];

const PLANNER_SLUGS = [
  "ai-travel-planner",
  "ai-weekend-trip-planner",
  "ai-budget-travel-planner",
  "ai-food-trip-planner",
  "ai-trip-planner-for-couples",
  "ai-multi-city-trip-planner",
];

export default function PlanStage() {
  const planners = PLANNER_SLUGS
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
            <Eyebrow dot>Plan your trip</Eyebrow>
            <h2 className="mt-3 font-display text-h1 text-ut-ink">
              From a place you like to a trip you can take.
            </h2>
            <p className="mt-3 max-w-[58ch] text-body-sm text-ut-muted">
              Discovery is only the first step. Here is how UTRIPLA carries a place from
              first curiosity to a bookable plan.
            </p>
          </div>
        </div>

        <ol className="mt-12 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map((c) => (
            <li key={c.step} className="flex flex-col border-t pt-4" style={{ borderTopColor: "rgba(var(--ut-accent-rgb), 0.22)" }}>
              <span className="font-mono text-micro uppercase tracking-[0.18em] text-ut-subtle">
                {c.step}
              </span>
              <h3 className="mt-2.5 font-display text-h2 leading-snug text-ut-ink">
                {c.title}
              </h3>
              <p className="mt-2 flex-1 text-body-sm leading-snug text-ut-text-2">
                {c.body}
              </p>
              <Link
                href={c.href}
                className="mt-4 inline-flex min-h-[44px] items-center text-body-sm font-medium text-ut-accent underline-offset-4 transition-colors duration-[var(--ut-dur-fast)] hover:text-ut-accent-strong hover:underline focus-visible:outline-2 focus-visible:outline-ut-accent"
              >
                {c.cta} →
              </Link>
            </li>
          ))}
        </ol>

        {/* 次级：既有 planner 入口（内链保留，不再是本区主体） */}
        <div className="mt-14">
          <p className="font-mono text-micro uppercase tracking-[0.18em] text-ut-subtle">
            Planning tools
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {planners.map((p) => (
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

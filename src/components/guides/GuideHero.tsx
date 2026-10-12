import Image from "next/image";
import Link from "next/link";
import type { Guide } from "@/data/guides";
import type { Destination } from "@/data/destinations";

interface GuideHeroProps {
  guide: Guide;
  destination: Destination | null;
  /** Hero eyebrow：由真实数据判定的 guide 类型（Itinerary / Food guide / Event guide…） */
  kind: string;
  /** 主 CTA 目标（buildPlannerHref 产出的真实预填 planner 路由） */
  planHref: string;
  /** 已格式化的更新日期（server-only 确定性格式化） */
  updatedLabel: string;
}

/**
 * GuideHero — Guide Detail 的产品化 hero。
 *
 * · 图片：guide.city → destination.image（真实已有图片）；没有则 gradient fallback。
 *   hero 图 priority + 固定 aspect 容器，避免 layout shift；页面内其余图片一律 lazy。
 * · 不渲染作者身份（数据里的 author 是虚构 persona，属"fake author expertise"，禁止展示）。
 * · 不出现 "AI" 品牌文案。
 */
export default function GuideHero({
  guide,
  destination,
  kind,
  planHref,
  updatedLabel,
}: GuideHeroProps) {
  const image = destination?.image ?? null;
  const days = guide.itinerary.days.length;

  return (
    <header className="mb-12">
      <div className="relative overflow-hidden rounded-ut-md border border-ut-border bg-ut-surface">
        <div className="relative aspect-[16/10] w-full sm:aspect-[21/9]">
          {image ? (
            <Image
              src={image}
              alt=""
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1024px"
              className="object-cover"
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${guide.gradient}`} />
          )}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-5 sm:p-7">
            <p className="font-mono text-micro uppercase tracking-[0.18em] text-white/85">
              {kind}
            </p>
            <p className="font-mono text-micro uppercase tracking-[0.18em] text-white/85">
              {destination ? `${destination.city} · ${destination.country}` : guide.country}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h1 className="font-display text-display-lg leading-[var(--ut-text-display-lg--lh)] text-ut-ink">
          {guide.title}
        </h1>

        <p className="mt-4 max-w-[62ch] text-body-lg leading-[1.6] text-ut-text-2">
          {guide.excerpt}
        </p>

        <p className="mt-4 font-mono text-label uppercase tracking-[0.14em] text-ut-subtle">
          {guide.readTime}
          {days > 0 && ` · ${days} ${days === 1 ? "day" : "days"}`} · Updated {updatedLabel}
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href={planHref}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-ut-sm bg-ut-accent px-5 text-body font-medium text-ut-inverse transition-colors duration-[var(--ut-dur-fast)] ease-ut-out hover:bg-ut-accent-strong focus-visible:outline-2 focus-visible:outline-ut-accent"
          >
            Plan this trip
            <span aria-hidden="true">→</span>
          </Link>
          {destination && (
            <Link
              href={`/destinations/${destination.slug}`}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-ut-sm border border-ut-border px-5 text-body text-ut-ink transition-colors hover:border-ut-accent hover:text-ut-accent focus-visible:outline-2 focus-visible:outline-ut-accent"
            >
              Explore {destination.city}
              <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>

        {guide.tags.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-2">
            {guide.tags.map((t) => (
              <li
                key={t}
                className="rounded-ut-pill border border-ut-border px-3 py-1 text-body-sm text-ut-muted"
              >
                {t}
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  );
}

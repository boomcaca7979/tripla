import Link from "next/link";
import Image from "next/image";
import Eyebrow from "@/components/ui/Eyebrow";
import { TRIPS } from "@/data/trips";

/**
 * RoutesStage — 可直接参考/使用的旅行方案示例（server，零 client JS）。
 * 定位：不是"网站还有 Routes 这个栏目"，而是"这里有可以照着走的完整方案"。
 * 非对称构图：1 张大图特写 + 3 张紧凑行卡，媒体比例刻意不一。
 */

const FEATURED_TRIP_SLUGS = [
  "japan-7d-golden-route",
  "tokyo-3d-foodie",
  "paris-weekend",
  "bali-5d-island",
];

export default function RoutesStage() {
  const trips = FEATURED_TRIP_SLUGS
    .map((slug) => TRIPS.find((t) => t.slug === slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const [feature, ...rest] = trips;
  if (!feature) return null;

  return (
    <section
      className="border-t"
      style={{ borderTopColor: "rgba(var(--ut-accent-rgb), 0.16)" }}
    >
      <div className="mx-auto max-w-[var(--ut-container-max)] px-4 py-20 md:px-6 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow dot>Ready-made plans</Eyebrow>
            <h2 className="mt-3 font-display text-h1 text-ut-ink">Steal a route.</h2>
            <p className="mt-3 max-w-[56ch] text-body text-ut-text-2">
              Pull a real plan instead of a list of attractions: day-by-day timing,
              where to eat, what it costs — take one as-is or bend it to your own dates.
            </p>
          </div>
          <Link
            href="/trips"
            className="inline-flex min-h-[44px] items-center rounded-ut-sm border border-ut-border-strong px-5 py-2.5 text-body-sm font-medium text-ut-text transition-[border-color,color] duration-[var(--ut-dur-fast)] ease-ut-out hover:border-ut-accent-line hover:text-ut-accent focus-visible:outline-2 focus-visible:outline-ut-accent"
          >
            All routes →
          </Link>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {/* 特写路线 — 大图编辑卡 */}
          <Link
            href={`/trips/${feature.slug}`}
            className="group relative flex min-h-[380px] flex-col justify-end overflow-hidden rounded-ut-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ut-accent"
          >
            {feature.coverImage ? (
              <Image
                src={feature.coverImage}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-[var(--ut-dur-slow)] ease-ut-out group-hover:scale-[1.02]"
                priority={false}
              />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient}`} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" aria-hidden="true" />
            <div className="relative p-6 md:p-8">
              <p className="font-mono text-micro uppercase tracking-[0.18em] text-white/70">
                {feature.country} · {feature.days} days · ~{feature.budget} {feature.currency}
              </p>
              <h3 className="mt-2 font-display text-h2 text-white">{feature.title}</h3>
              <p className="mt-2 max-w-[48ch] text-body-sm leading-snug text-white/85">
                {feature.excerpt}
              </p>
            </div>
          </Link>

          {/* 紧凑路线行 — 比例刻意不同 */}
          <div className="flex flex-col gap-5">
            {rest.map((t) => (
              <Link
                key={t.slug}
                href={`/trips/${t.slug}`}
                className="group flex flex-1 items-stretch gap-4 overflow-hidden rounded-ut-lg border border-ut-border bg-ut-surface transition-[border-color,box-shadow] duration-[var(--ut-dur-med)] ease-ut-out hover:border-ut-border-strong hover:shadow-ut-1 focus-visible:outline-2 focus-visible:outline-ut-accent"
              >
                <div className="relative w-28 shrink-0 sm:w-36">
                  {t.coverImage ? (
                    <Image
                      src={t.coverImage}
                      alt=""
                      fill
                      sizes="144px"
                      className="object-cover"
                    />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${t.gradient}`} />
                  )}
                </div>
                <div className="flex flex-col justify-center py-4 pr-5">
                  <p className="font-mono text-micro uppercase tracking-[0.16em] text-ut-muted">
                    {t.city} · {t.days} days
                  </p>
                  <h3 className="mt-1.5 font-display text-h3 leading-snug text-ut-ink group-hover:text-ut-accent">
                    {t.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-1 text-body-sm text-ut-text-2">
                    {t.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

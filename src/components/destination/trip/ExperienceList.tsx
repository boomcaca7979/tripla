"use client";

import { useEffect, useRef, useState } from "react";
import AddToTripButton from "./AddToTripButton";
import AffiliateLink from "@/components/analytics/AffiliateLink";
import { makeTripItemId } from "@/lib/trip-list";

/**
 * ExperienceList — Destination 页「可预订体验」位（Viator Basic Affiliate）。
 *
 * 定位与诚信边界：
 *   · 明确区别于城市 Attraction 本体：标题 = "Bookable experiences in {city}"，
 *     标注 "Live · Viator"；条目是可预订 tour/activity 产品，不是景点介绍。
 *   · 数据全部来自 Viator /products/search 真实返回；provider 没给的字段
 *     （图片/评分/价格）一律不渲染；绝不 mock。
 *   · 额度保护：进入视口才 fetch /api/experiences（server 端另有 24h 缓存），
 *     首屏零请求，155+ 城不爆量。
 *   · 无 key / 无结果 / 上游失败 → 简洁真实空态（"Live experiences
 *     unavailable"）+ Viator 真实搜索入口，绝不显示假数据。
 *   · 价格：仅 provider 返回真实 fromPrice 时展示并可加入 My Trip 预算；
 *     无价格体验只进清单（Price unavailable）。
 */

interface ExperienceItem {
  code: string;
  title: string;
  description?: string;
  image?: string;
  rating?: number;
  reviews?: number;
  price?: { amount: number; currency: string };
  url: string;
}

type ExperiencesState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "ready"; available: boolean; products: ExperienceItem[]; searchUrl: string }
  | { phase: "error" };

export default function ExperienceList({ slug, city }: { slug: string; city: string }) {
  const [state, setState] = useState<ExperiencesState>({ phase: "idle" });
  const rootRef = useRef<HTMLDivElement | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || startedRef.current) return;

    const load = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      setState({ phase: "loading" });
      fetch(`/api/experiences?slug=${encodeURIComponent(slug)}`)
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
        .then((body: { available?: boolean; products?: ExperienceItem[]; searchUrl?: string }) => {
          setState({
            phase: "ready",
            available: body.available === true,
            products: Array.isArray(body.products) ? body.products : [],
            searchUrl:
              body.searchUrl ||
              `https://www.viator.com/searchResults/all?text=${encodeURIComponent(`${city} things to do`)}`,
          });
        })
        .catch(() => setState({ phase: "error" }));
    };

    // 进入视口才请求；IntersectionObserver 不可用时退化为立即请求（仍走服务端缓存）。
    if (typeof IntersectionObserver === "undefined") {
      load();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          load();
        }
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [slug, city]);

  return (
    <div ref={rootRef} className="mt-14">
      <div className="text-center">
        <h2 className="font-display text-[26px] leading-tight text-ut-ink">
          Bookable experiences in {city}
        </h2>
        <p className="mt-2 font-mono text-[0.625rem] uppercase tracking-[0.35em] text-ut-muted">
          Live · Viator
        </p>
      </div>

      {state.phase === "idle" || state.phase === "loading" ? (
        <p className="mt-6 text-center text-label text-ut-muted">Loading live experiences…</p>
      ) : state.phase === "error" ? (
        <p className="mt-6 text-center text-label text-ut-text-2">
          Live experiences unavailable right now.
        </p>
      ) : !state.available ? (
        <div className="mt-6 text-center">
          <p className="text-label text-ut-text-2">Live experiences unavailable right now.</p>
          <AffiliateLink
            href={state.searchUrl}
            category="experience"
            provider="viator"
            destination={slug}
            identifier="search"
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-ut-sm border border-ut-border-strong px-5 py-2.5 text-body font-medium text-ut-text transition-colors duration-[var(--ut-dur-fast)] hover:bg-ut-surface-hover"
          >
            Search things to do in {city} <span aria-hidden="true">→</span>
          </AffiliateLink>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {state.products.map((p) => {
            const itemId = makeTripItemId("experience", p.title);
            return (
              <li
                key={p.code}
                className="flex flex-col justify-between overflow-hidden rounded-ut-sm bg-ut-bg shadow-ut-1"
              >
                {p.image && (
                  // eslint-disable-next-line @next/next/no-img-element -- provider 动态 URL，Next Image 远域白名单不适用
                  <img
                    src={p.image}
                    alt={p.title}
                    loading="lazy"
                    className="aspect-[16/8] w-full object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <p className="font-display text-[17px] leading-snug text-ut-ink">{p.title}</p>
                    {p.description && (
                      <p className="mt-1.5 line-clamp-3 text-label leading-relaxed text-ut-text-2">
                        {p.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                      {typeof p.rating === "number" && (
                        <p className="text-label text-ut-text-2">
                          <span className="font-mono text-micro uppercase tracking-[0.14em] text-ut-muted">
                            Rating&nbsp;
                          </span>
                          {p.rating.toFixed(1)}
                          {typeof p.reviews === "number" && ` · ${p.reviews} reviews`}
                        </p>
                      )}
                      {p.price ? (
                        <p className="text-label font-bold text-ut-ink">
                          From {p.price.currency} {p.price.amount.toLocaleString()}
                        </p>
                      ) : (
                        <p className="font-mono text-micro uppercase tracking-[0.12em] text-ut-muted">
                          Price unavailable
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <AffiliateLink
                      href={p.url}
                      category="experience"
                      provider="viator"
                      destination={slug}
                      identifier={p.code}
                      target="_blank"
                      rel="sponsored noopener noreferrer"
                      className="inline-flex min-h-[34px] items-center gap-1.5 rounded-[4px] bg-ut-accent px-3 py-1.5 text-label font-medium text-white transition-colors hover:bg-ut-accent-strong"
                    >
                      Book on Viator <span aria-hidden="true">→</span>
                    </AffiliateLink>
                    <AddToTripButton
                      type="experience"
                      name={p.title}
                      affiliateUrl={p.url}
                      price={p.price}
                      variant="compact"
                    />
                  </div>
                  <p data-experience-id={itemId} className="hidden" aria-hidden="true" />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

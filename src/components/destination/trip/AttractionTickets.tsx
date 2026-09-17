"use client";

import { useEffect, useRef, useState } from "react";
import AddToTripButton from "./AddToTripButton";

/**
 * AttractionTickets — 单个 Attraction 的「Tickets & Experiences」位（Viator）。
 *
 * 链路：attraction 名 → /api/attraction-tickets（Viator /products/search +
 * searchTerm，server 24h 缓存）→ 真实产品。
 *
 * 诚信边界：
 *   · 产品 = provider 真实返回；标题原文展示（searchTerm 已含 attraction 名，
 *     相关性由 provider 全文搜索决定；不把泛 city tour 标成官方门票）。
 *   · 无匹配产品 → "No bookable experience available"（不造票价、不放占位）。
 *   · 价格只有 provider fromPrice 真实存在才展示/进 My Trip。
 *   · Book = Viator affiliate URL（sponsored 披露）。
 */

interface TicketItem {
  code: string;
  title: string;
  description?: string;
  price?: { amount: number; currency: string };
  url: string;
}

type Phase = "idle" | "loading" | "ready" | "error";

export default function AttractionTickets({
  slug,
  name,
}: {
  slug: string;
  name: string;
}) {
  const [state, setState] = useState<{
    phase: Phase;
    available?: boolean;
    products?: TicketItem[];
  }>({ phase: "idle" });
  const rootRef = useRef<HTMLDivElement | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || startedRef.current) return;

    const load = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      setState({ phase: "loading" });
      fetch(`/api/attraction-tickets?slug=${encodeURIComponent(slug)}&name=${encodeURIComponent(name)}`)
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
        .then((body: { available?: boolean; products?: TicketItem[] }) => {
          setState({
            phase: "ready",
            available: body.available === true,
            products: Array.isArray(body.products) ? body.products.slice(0, 3) : [],
          });
        })
        .catch(() => setState({ phase: "error" }));
    };

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
  }, [slug, name]);

  const products = state.products ?? [];

  return (
    <div ref={rootRef} className="mt-5 rounded-[4px] bg-ut-surface p-4" data-attraction-tickets>
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-micro uppercase tracking-[0.16em] text-ut-text-2">
          Tickets &amp; experiences
        </p>
        <span className="font-mono text-micro uppercase tracking-[0.14em] text-ut-muted">
          Live · Viator
        </span>
      </div>

      {state.phase === "ready" && state.available && products.length > 0 ? (
        <ul className="mt-3 space-y-2.5">
          {products.map((t) => (
            <li
              key={t.code}
              className="flex flex-col gap-2 rounded-[4px] border border-ut-border bg-ut-bg p-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-label font-medium leading-snug text-ut-text">{t.title}</p>
                <p className="mt-0.5 text-micro text-ut-text-2">
                  {t.price ? (
                    <>
                      From{" "}
                      <span className="font-bold text-ut-ink">
                        {t.price.currency} {t.price.amount.toLocaleString()}
                      </span>
                    </>
                  ) : (
                    <span className="font-mono uppercase tracking-[0.12em] text-ut-muted">
                      Price unavailable
                    </span>
                  )}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <a
                  href={t.url}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  className="inline-flex min-h-[30px] items-center gap-1 rounded-[4px] bg-ut-accent px-2.5 py-1 text-micro font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-ut-accent-strong"
                >
                  Book <span aria-hidden="true">→</span>
                </a>
                <AddToTripButton
                  type="experience"
                  name={t.title}
                  affiliateUrl={t.url}
                  price={t.price}
                  variant="compact"
                />
              </div>
            </li>
          ))}
        </ul>
      ) : state.phase === "ready" && !state.available ? (
        <p className="mt-3 text-micro leading-relaxed text-ut-muted">
          No bookable experience available.
        </p>
      ) : state.phase === "error" ? (
        <p className="mt-3 text-micro leading-relaxed text-ut-muted">
          Live tickets unavailable right now.
        </p>
      ) : state.phase === "loading" ? (
        // loading 反馈：避免查询期间出现无说明的空白块
        <p className="mt-3 font-mono text-micro uppercase tracking-[0.12em] text-ut-muted">
          Checking live tickets…
        </p>
      ) : null}
    </div>
  );
}

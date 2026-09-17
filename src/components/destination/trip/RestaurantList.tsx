"use client";

import { useEffect, useState } from "react";
import AddToTripButton from "./AddToTripButton";
import type { Restaurant } from "@/lib/api/restaurants";

/**
 * RestaurantList — Destination Food 区块的真实餐厅列表（Geoapify Places）。
 *
 * 数据诚信：
 *   · 只渲染 provider 真实返回的字段（Geoapify/OSM 源无 rating / price level /
 *     照片 → 对应元素整体不渲染，绝不占位伪造）。
 *   · 无预订、无 affiliate —— Food 只做餐厅发现（Map / Website / Add to My Trip）。
 *   · lat/lon 缺省（城市未收录搜索中心）→ 保持原诚实空态。
 */

type State =
  | { phase: "idle" | "loading" }
  | {
      phase: "ready";
      available: boolean;
      reason?: string;
      restaurants?: Restaurant[];
      attribution?: string;
    }
  | { phase: "error" };

export default function RestaurantList({
  slug,
  lat,
  lon,
}: {
  slug: string;
  lat?: number;
  lon?: number;
}) {
  const hasCenter = typeof lat === "number" && typeof lon === "number";
  const [state, setState] = useState<State>(hasCenter ? { phase: "loading" } : { phase: "idle" });

  useEffect(() => {
    if (!hasCenter) return;
    let cancelled = false;
    const qs = new URLSearchParams({
      slug,
      lat: String(lat),
      lon: String(lon),
      limit: "6",
    });
    fetch(`/api/restaurants?${qs.toString()}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then(
        (body: {
          available?: boolean;
          reason?: string;
          restaurants?: Restaurant[];
          attribution?: string;
        }) => {
          if (cancelled) return;
          setState({
            phase: "ready",
            available: body.available === true,
            reason: body.reason,
            restaurants: Array.isArray(body.restaurants) ? body.restaurants : [],
          });
        },
      )
      .catch(() => {
        if (!cancelled) setState({ phase: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [slug, lat, lon]);

  // 城市无搜索中心坐标 → 保持既有诚实空态（与未接入前的行为一致）。
  if (typeof lat !== "number" || typeof lon !== "number") {
    return <NotConfiguredNotice />;
  }

  if (state.phase === "loading") {
    return (
      <div className="mt-6 rounded-ut-sm bg-ut-surface p-5 text-center" data-restaurants-state>
        <p className="text-label leading-relaxed text-ut-muted">Loading nearby restaurants…</p>
      </div>
    );
  }

  if (state.phase === "error" || (state.phase === "ready" && !state.available)) {
    return (
      <div className="mt-6 rounded-ut-sm bg-ut-surface p-5 text-center" data-restaurants-state>
        <p className="text-label leading-relaxed text-ut-text-2">
          {state.phase === "ready" && state.reason === "no-results"
            ? "No live restaurant listings available for this destination."
            : state.phase === "ready" && state.reason === "not-configured"
              ? "Live restaurant listings aren't available yet. We only show real places from a verified places provider — no estimated ratings, prices or opening hours."
              : "Live restaurant listings unavailable right now."}
        </p>
      </div>
    );
  }

  const restaurants = state.phase === "ready" ? (state.restaurants ?? []) : [];
  if (restaurants.length === 0) {
    return (
      <div className="mt-6 rounded-ut-sm bg-ut-surface p-5 text-center" data-restaurants-state>
        <p className="text-label leading-relaxed text-ut-text-2">
          No live restaurant listings available for this destination.
        </p>
      </div>
    );
  }

  return (
    <div data-restaurants-state>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {restaurants.map((r) => (
          <li
            key={r.id}
            className="flex flex-col justify-between overflow-hidden rounded-[4px] border border-ut-border bg-ut-bg"
          >
            <div className="flex flex-1 flex-col p-4">
              <p className="text-label font-bold leading-snug text-ut-text">{r.name}</p>
              {r.cuisine && (
                <p className="mt-0.5 font-mono text-micro uppercase tracking-[0.1em] text-ut-text-2">
                  {r.cuisine}
                </p>
              )}
              {r.address && (
                <p className="mt-1 text-micro leading-relaxed text-ut-muted">{r.address}</p>
              )}
              {/* Provider 真实评分 / price level 才渲染（Geoapify/OSM 源无 → 不显示） */}
              {typeof r.rating === "number" && (
                <p className="mt-1 text-micro text-ut-text-2">
                  {"★".repeat(Math.min(5, Math.round(r.rating)))} {r.rating.toFixed(1)}
                  {typeof r.ratingCount === "number" ? ` · ${r.ratingCount} reviews` : ""}
                </p>
              )}
              {r.priceLevel && (
                <p className="mt-1 font-mono text-micro uppercase tracking-[0.12em] text-ut-muted">
                  Price level {r.priceLevel}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-ut-border px-4 py-2.5">
              <a
                href={r.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-micro uppercase tracking-[0.1em] text-ut-text-2 underline-offset-2 hover:text-ut-text hover:underline"
              >
                View on map <span aria-hidden="true">↗</span>
              </a>
              {r.website && (
                <a
                  href={r.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-micro uppercase tracking-[0.1em] text-ut-text-2 underline-offset-2 hover:text-ut-text hover:underline"
                >
                  Website <span aria-hidden="true">↗</span>
                </a>
              )}
              <div className="ml-auto">
                <AddToTripButton type="food" name={r.name} variant="compact" />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-center font-mono text-micro uppercase tracking-[0.12em] text-ut-muted">
        Place data © OpenStreetMap contributors
      </p>
    </div>
  );
}

function NotConfiguredNotice() {
  return (
    <div className="mt-6 rounded-ut-sm bg-ut-surface p-5 text-center" data-restaurants-state>
      <p className="text-label leading-relaxed text-ut-text-2">
        Live restaurant listings aren&apos;t available yet. We only show real places from a
        verified places provider — no estimated ratings, prices or opening hours.
      </p>
    </div>
  );
}

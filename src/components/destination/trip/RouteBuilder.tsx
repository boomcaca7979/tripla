"use client";

import { useMemo } from "react";
import { useMyTrip } from "./MyTripContext";
import { findAttractionByName, type AttractionRecord } from "@/data/attractions";

/**
 * RouteBuilder —「Build your route」：路线完全由用户 My Trip 已选条目生成。
 *
 * 逻辑（确定性，无 AI 凭空创造）：
 *   · 输入 = My Trip items（用户显式添加的 attraction / experience / food /
 *     hotel）。没有选择 → "Add places to build your route"，绝不生成假行程。
 *   · 地理排序：有真实坐标的景点（Attractions 数据）按最近邻链排序（贪心，
 *     从第一个已选坐标景点出发）；无坐标条目按选择顺序排在当天。
 *   · 酒店 = 住宿 anchor：Day 1 起始标 "Check in"，每日结束标 "Stay"，绝不
 *     当作 sightseeing stop 排进游览权序。
 *   · 分日 = My Trip 的 Trip length（days），条目均分到天。
 *   · My Trip 清空/变更 → 路线自动重算（派生状态，无独立数据源）。
 */

interface Stop {
  type: "attraction" | "experience" | "food";
  name: string;
  lat?: number;
  lon?: number;
}

/** 最近邻排序（仅对带坐标的 stop；无坐标保持追加顺序）。 */
function orderStops(stops: Stop[]): Stop[] {
  const geo = stops.filter((s) => typeof s.lat === "number" && typeof s.lon === "number");
  const plain = stops.filter((s) => typeof s.lat !== "number" || typeof s.lon !== "number");
  if (geo.length === 0) return [...plain];
  const remaining = [...geo];
  const ordered: Stop[] = [remaining.shift() as Stop];
  while (remaining.length > 0) {
    const cur = ordered[ordered.length - 1];
    let bestIdx = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    remaining.forEach((s, i) => {
      if (typeof cur.lat !== "number" || typeof s.lat !== "number" || typeof s.lon !== "number") return;
      const d = (s.lat - cur.lat) ** 2 + (s.lon - (cur.lon as number)) ** 2;
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    });
    ordered.push(remaining.splice(bestIdx, 1)[0]);
  }
  return [...ordered, ...plain];
}

export default function RouteBuilder({ slug, city }: { slug: string; city: string }) {
  const { items, days, hydrated } = useMyTrip();

  const route = useMemo(() => {
    const hotel = items.find((i) => i.type === "hotel");
    const stops: Stop[] = items
      .filter(
        (i) => i.type === "attraction" || i.type === "experience" || i.type === "food",
      )
      .map((i) => {
        const rec: AttractionRecord | undefined =
          i.type === "attraction" ? findAttractionByName(slug, i.name) : undefined;
        return { type: i.type as Stop["type"], name: i.name, lat: rec?.lat, lon: rec?.lon };
      });
    const ordered = orderStops(stops);
    const perDay = Math.ceil(ordered.length / Math.max(1, days));
    const dayStops: Stop[][] = Array.from({ length: Math.max(1, days) }, (_, d) =>
      ordered.slice(d * perDay, (d + 1) * perDay).filter(Boolean),
    );
    return { hotel, dayStops, stopCount: ordered.length };
  }, [items, days, slug]);
  const typeLabel: Record<Stop["type"], string> = {
    attraction: "Attraction",
    experience: "Experience",
    food: "Food",
  };

  return (
    <div className="rounded-ut-sm bg-ut-surface p-5 sm:p-6" data-route-builder>
      {/* 空态：不生成假行程 */}
      {hydrated && items.length === 0 ? (
        <p className="text-label leading-relaxed text-ut-text-2">
          Add places to build your route — attractions, tickets, food and hotels you add to My
          Trip are arranged into days automatically.
        </p>
      ) : (
        <>
          {route.hotel && (
            <p className="mb-4 text-label text-ut-text-2">
              <span className="font-mono text-micro uppercase tracking-[0.14em] text-ut-muted">
                Stay&nbsp;
              </span>
              {route.hotel.name}
            </p>
          )}
          <ol className="space-y-5">
            {route.dayStops.map((stops, d) => (
              <li key={d}>
                <p className="font-mono text-micro uppercase tracking-[0.18em] text-ut-text-2">
                  Day {d + 1}
                </p>
                {stops.length === 0 ? (
                  <p className="mt-1.5 text-label leading-relaxed text-ut-muted">
                    {d === 0
                      ? "Nothing scheduled — add places to fill this day."
                      : "No stops scheduled."}
                  </p>
                ) : (
                  <ol className="mt-2 space-y-2">
                    {/* 酒店 anchor：Day 1 起始（Check in） */}
                    {d === 0 && route.hotel && (
                      <li className="flex items-baseline gap-3 text-label text-ut-text-2">
                        <span className="font-mono text-micro text-ut-muted">✓</span>
                        Check in · {route.hotel.name}
                      </li>
                    )}
                    {stops.map((s, i) => (
                      <li key={`${s.type}:${s.name}`} className="flex items-baseline gap-3 text-label text-ut-text">
                        <span className="font-mono text-micro text-ut-accent">{i + 1}</span>
                        <span className="min-w-0">
                          {s.name}
                          <span className="ml-2 font-mono text-micro uppercase tracking-[0.12em] text-ut-muted">
                            {typeLabel[s.type]}
                          </span>
                        </span>
                      </li>
                    ))}
                    {/* 酒店 anchor：每日结束（Stay） */}
                    {route.hotel && (
                      <li className="flex items-baseline gap-3 text-label text-ut-text-2">
                        <span className="font-mono text-micro text-ut-muted">⌂</span>
                        Stay · {route.hotel.name}
                      </li>
                    )}
                  </ol>
                )}
              </li>
            ))}
          </ol>
          <p className="mt-4 text-micro leading-relaxed text-ut-muted">
            Built entirely from your My Trip selection in {city} — the route updates
            automatically as you add or remove places. Attractions with known coordinates are
            ordered nearest-first within each day.
          </p>
        </>
      )}
    </div>
  );
}

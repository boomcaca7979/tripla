"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AddToTripButton from "./AddToTripButton";
import AffiliateLink from "@/components/analytics/AffiliateLink";

/**
 * WinkHotelCards — Attraction「Nearby Hotels」唯一酒店内容（Wink 唯一数据源）。
 *
 * 链路：Attraction 真实坐标 → /api/hotels（Wink search/geo）→ distanceInMeters
 * 排序 → 按 offset 分页 → 每批最近 ≤6 家 → 桌面 2 列 × 3 行（移动端单列）。
 *
 * 诚信边界：
 *   · 进入视口才 fetch（首屏零请求）；server 端 6h 景点级缓存（日期进 key），
 *     Refresh 复用同一缓存切片，不重复打上游。
 *   · 每张卡显示真实距离（"860 m away" / "1.3 km away"，来自 Wink
 *     distanceInMeters）——禁止 "Nearby/Closest" 这类无凭据话术。
 *   · Refresh：请求下一批（排除已显示 = server 端确定性切片）；无更多 →
 *     "No more nearby hotels available"；绝不随机排序/城市池补足。
 *   · 结果不足 6 家 → 展示实际数量；无坐标/无供给/失败 → 诚实空态。
 *   · 价格 = 所选入住区间 stay total，标注 "{n}-night total"（n = Suggested
 *     city stay）；无真实价 → "Price unavailable"。
 *   · Book = 官方 Booking Engine URL（client-id 归因 + sd/n/rc/l/c），
 *     rel="sponsored noopener noreferrer"。
 */

interface WinkHotel {
  id: string;
  name: string;
  image?: string;
  starRating?: number;
  guestRating?: number;
  reviewCount?: number;
  distanceInMeters?: number;
  price?: { amount: number; currency: string };
  bookingUrl?: string;
}

interface HotelsPayload {
  available: boolean;
  hotels: WinkHotel[];
  total: number;
  offset: number;
}

type Phase = "idle" | "loading" | "ready" | "error";

/** 真实距离格式化（Wink distanceInMeters；仅在有值时调用）。 */
function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m away`;
  return `${(m / 1000).toFixed(1)} km away`;
}

export default function WinkHotelCards({
  slug,
  name,
  lat,
  lon,
  checkIn,
  checkOut,
  nights,
}: {
  slug: string;
  name: string;
  lat?: number;
  lon?: number;
  checkIn: string;
  checkOut: string;
  nights: number;
}) {
  const [state, setState] = useState<{ phase: Phase; data?: HotelsPayload }>({
    phase: "idle",
  });
  const [refreshing, setRefreshing] = useState(false);
  const [noMore, setNoMore] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const startedRef = useRef(false);

  const hasCoords = typeof lat === "number" && typeof lon === "number";

  const fetchBatch = useCallback(
    (offset: number, isRefresh: boolean) => {
      if (!hasCoords) return;
      if (isRefresh) setRefreshing(true);
      const qs = new URLSearchParams({
        slug,
        name,
        lat: String(lat),
        lon: String(lon),
        checkIn,
        checkOut,
        offset: String(offset),
      });
      fetch(`/api/hotels?${qs.toString()}`)
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
        .then(
          (body: {
            available?: boolean;
            hotels?: WinkHotel[];
            total?: number;
            offset?: number;
          }) => {
            const hotels = Array.isArray(body.hotels) ? body.hotels : [];
            const total = typeof body.total === "number" ? body.total : hotels.length;
            const nextOffset = typeof body.offset === "number" ? body.offset : offset;
            if (isRefresh) {
              if (body.available !== true || hotels.length === 0) {
                setNoMore(true);
              } else {
                setState({ phase: "ready", data: { available: true, hotels, total, offset: nextOffset } });
              }
              setRefreshing(false);
            } else {
              setState({
                phase: "ready",
                data: {
                  available: body.available === true,
                  hotels,
                  total,
                  offset: nextOffset,
                },
              });
            }
          },
        )
        .catch(() => {
          if (isRefresh) setRefreshing(false);
          else setState({ phase: "error" });
        });
    },
    [slug, name, lat, lon, checkIn, checkOut, hasCoords],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root || startedRef.current) return;

    const load = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      setState({ phase: "loading" });
      // 无坐标 = 无 geo 能力：不打 API，直接诚实空态。
      if (!hasCoords) {
        setState({ phase: "ready", data: { available: false, hotels: [], total: 0, offset: 0 } });
        return;
      }
      fetchBatch(0, false);
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
  }, [fetchBatch, hasCoords]);

  const data = state.data;
  const hotels = data?.hotels ?? [];
  const canRefresh =
    data?.available === true &&
    !refreshing &&
    !noMore &&
    typeof data.total === "number" &&
    data.offset + hotels.length < data.total;

  return (
    <div ref={rootRef}>
      {/* Refresh（仅 Nearby Hotels 区域内；有下一批才可点） */}
      {data?.available && data.total > 0 && (
        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => fetchBatch(data.offset + hotels.length, true)}
            disabled={!canRefresh}
            className={`inline-flex min-h-[30px] items-center gap-1.5 rounded-[4px] border px-3 py-1 font-mono text-micro uppercase tracking-[0.12em] transition-colors ${
              canRefresh
                ? "border-ut-border-strong text-ut-text-2 hover:bg-ut-surface-hover"
                : "cursor-not-allowed border-ut-border text-ut-muted opacity-60"
            }`}
          >
            <span aria-hidden="true">⟳</span>
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      )}
      {noMore && (
        <p className="mt-2 text-right font-mono text-micro uppercase tracking-[0.12em] text-ut-muted">
          No more nearby hotels available
        </p>
      )}

      {state.phase === "ready" && data?.available && hotels.length > 0 ? (
        <ul className="mt-3 grid gap-4 sm:grid-cols-2">
          {hotels.map((hotel) => (
            <li
              key={hotel.id}
              className="flex flex-col justify-between overflow-hidden rounded-[4px] border border-ut-border bg-ut-bg"
            >
              {hotel.image ? (
                // eslint-disable-next-line @next/next/no-img-element -- provider 动态 URL，Next Image 远域白名单不适用
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  loading="lazy"
                  className="aspect-[16/9] w-full object-cover"
                />
              ) : (
                // provider 未返回图片 → 中性色块占位，绝不用城市图/景点图冒充
                <div aria-hidden="true" className="aspect-[16/9] w-full bg-ut-surface" />
              )}
              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  <p className="text-label font-bold leading-snug text-ut-text">{hotel.name}</p>
                  {/* 真实距离（Wink distanceInMeters）；无值不渲染任何"附近"话术 */}
                  {typeof hotel.distanceInMeters === "number" && (
                    <p className="mt-0.5 font-mono text-micro uppercase tracking-[0.1em] text-ut-text-2">
                      {formatDistance(hotel.distanceInMeters)}
                    </p>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                    {typeof hotel.starRating === "number" && (
                      <span className="text-micro text-ut-text-2" aria-label={`${hotel.starRating} star hotel`}>
                        {"★".repeat(Math.min(6, hotel.starRating))}
                      </span>
                    )}
                    {typeof hotel.guestRating === "number" &&
                      typeof hotel.reviewCount === "number" && (
                        <span className="text-micro text-ut-muted">
                          {hotel.guestRating.toFixed(1)} · {hotel.reviewCount} reviews
                        </span>
                      )}
                  </div>
                  <p className="mt-1.5">
                    {hotel.price ? (
                      <>
                        <span className="text-label font-bold text-ut-ink">
                          {hotel.price.currency}{" "}
                          {hotel.price.amount.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </span>
                        <span className="text-micro text-ut-muted"> · {nights}-night total</span>
                      </>
                    ) : (
                      <span className="font-mono text-micro uppercase tracking-[0.12em] text-ut-muted">
                        Price unavailable
                      </span>
                    )}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {hotel.bookingUrl && (
                    <AffiliateLink
                      href={hotel.bookingUrl}
                      category="hotel"
                      provider="wink"
                      destination={slug}
                      identifier={hotel.name}
                      target="_blank"
                      rel="sponsored noopener noreferrer"
                      className="inline-flex min-h-[34px] items-center gap-1 rounded-[4px] bg-ut-accent px-3 py-1 text-micro font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-ut-accent-strong"
                    >
                      Book <span aria-hidden="true">→</span>
                    </AffiliateLink>
                  )}
                  <AddToTripButton
                    type="hotel"
                    name={hotel.name}
                    affiliateUrl={hotel.bookingUrl}
                    price={hotel.price}
                    variant="compact"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : state.phase === "ready" && (!data || !data.available) ? (
        <p className="mt-3 text-micro leading-relaxed text-ut-muted">
          {hasCoords
            ? `No live Wink inventory near ${name} for ${checkIn} → ${checkOut} right now.`
            : "Live nearby hotels aren't available for this attraction yet."}
        </p>
      ) : state.phase === "error" ? (
        <p className="mt-3 text-micro leading-relaxed text-ut-muted">
          Live nearby hotels unavailable right now.
        </p>
      ) : state.phase === "loading" ? (
        // loading 反馈：冷启动 Wink 上游可达数秒，占位文本避免"空白块"误解（加载后原样替换）
        <p className="mt-3 font-mono text-micro uppercase tracking-[0.12em] text-ut-muted">
          Loading nearby hotels…
        </p>
      ) : null}
    </div>
  );
}

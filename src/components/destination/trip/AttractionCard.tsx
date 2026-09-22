"use client";

import AddToTripButton from "./AddToTripButton";
import WorkspaceActions from "./WorkspaceActions";
import WinkHotelCards from "./WinkHotelCards";
import AttractionTickets from "./AttractionTickets";
import type { AttractionRecord } from "@/data/attractions";

/**
 * AttractionCard — 景点内容单元（页面主体，Travel Object 而非文章段落）。
 *
 * 两种渲染路径（数据驱动）：
 *   1. 结构化 attraction（attraction 传入，Attractions 数据收录的城市）：
 *      真实景点照片 + 事实描述 + 类型/准入状态 + Wink geo 酒店 + Viator
 *      Tickets & experiences。
 *   2. 字符串高亮（未收录城市）：既有 gradient 视觉，行为不变。
 *
 * 参考视觉（站酷「旅游官网」酒店卡语言）：白卡 8px 圆角 + 极轻投影 + 无描边；
 * 大号序号水印；名称 Heavy；元数据 #999；价格动作 = 绿色填充小按钮。
 *
 * 数据诚信：
 *   · 结构化景点 = 现实世界地点（禁止活动/主题文案作为景点本体）。
 *   · Nearby hotels = Wink 唯一数据源：Attraction 真实坐标 → search/geo →
 *     distanceInMeters 排序 → 最近 ≤6 家（桌面 2 列 × 3 行）+ Refresh 下一批；
 *     无坐标/无供给 → 诚实空态；无 Hotellook 补位。
 *   · Tickets = Viator 真实产品；无产品 → "No bookable experience available"。
 */

export default function AttractionCard({
  name,
  index,
  slug,
  city,
  gradient,
  bestMonths,
  suggestedDays,
  checkIn,
  checkOut,
  lat,
  lon,
  attraction,
}: {
  name: string;
  index: number;
  /** 城市名（保留在 props 契约中；酒店文案不再需要）。 */
  city: string;
  slug: string;
  gradient: string;
  bestMonths: string;
  suggestedDays: number;
  checkIn: string;
  checkOut: string;
  /** Attraction 真实坐标（Wink search/geo 用）；数据未收录时缺省 → 诚实空态。 */
  lat?: number;
  lon?: number;
  /** 结构化景点对象（收录城市传入；缺省回退字符串高亮渲染）。 */
  attraction?: AttractionRecord;
}) {
  const pointLat = attraction?.lat ?? lat;
  const pointLon = attraction?.lon ?? lon;

  return (
    <article className="overflow-hidden rounded-ut-sm bg-ut-bg shadow-ut-1">
      {/* 视觉：结构化景点 = 真实照片；回退 = 城市真实 gradient */}
      {attraction ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element -- 数据集静态 URL 走 img 与画廊一致性成本更低 */}
          <img
            src={attraction.image}
            alt={attraction.imageAlt}
            loading="lazy"
            className="aspect-[16/8] w-full object-cover sm:aspect-[16/7]"
          />
          <span className="absolute right-5 top-2 select-none font-display text-[64px] font-bold leading-none text-white/50 drop-shadow">
            {String(index + 1).padStart(2, "0")}
          </span>
          <p className="absolute bottom-0 left-0 line-clamp-2 bg-black/45 px-5 pb-4 pt-2 font-display text-[24px] font-bold leading-snug text-white">
            {attraction.name}
          </p>
        </div>
      ) : (
        <div
          aria-hidden="true"
          className={`relative flex aspect-[16/8] w-full items-end bg-gradient-to-br ${gradient} sm:aspect-[16/7]`}
        >
          <span className="absolute right-5 top-2 select-none font-display text-[64px] font-bold leading-none text-white/25">
            {String(index + 1).padStart(2, "0")}
          </span>
          <p className="line-clamp-2 px-5 pb-4 font-display text-[24px] font-bold leading-snug text-white drop-shadow">
            {name}
          </p>
        </div>
      )}

      <div className="p-5 sm:p-6">
        {/* 事实描述（仅结构化景点；无则不渲染占位文案） */}
        {attraction?.description && (
          <p className="text-body leading-relaxed text-ut-text-2">{attraction.description}</p>
        )}

        {/* 元信息（类型/准入 = 景点级真实字段；其余 = 城市级真实字段，明确标注） */}
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
          {attraction && (
            <>
              <p className="text-label text-ut-text-2">
                <span className="font-mono text-micro uppercase tracking-[0.14em] text-ut-muted">
                  Type&nbsp;
                </span>
                {attraction.type}
              </p>
              {attraction.admission && (
                <p className="text-label text-ut-text-2">
                  <span className="font-mono text-micro uppercase tracking-[0.14em] text-ut-muted">
                    Admission&nbsp;
                  </span>
                  {attraction.admission}
                </p>
              )}
            </>
          )}
          <p className="text-label text-ut-text-2">
            <span className="font-mono text-micro uppercase tracking-[0.14em] text-ut-muted">
              Best time (city)&nbsp;
            </span>
            {bestMonths}
          </p>
          <p className="text-label text-ut-text-2">
            <span className="font-mono text-micro uppercase tracking-[0.14em] text-ut-muted">
              Suggested city stay&nbsp;
            </span>
            {suggestedDays} {suggestedDays === 1 ? "day" : "days"}
          </p>
        </div>

        {/* Tickets & experiences：Viator 真实产品（无产品 → 诚实空态） */}
        {attraction && <AttractionTickets slug={slug} name={attraction.name} />}

        {/* Nearby hotels：Wink 唯一数据源（真实坐标 geo 搜索；无 Hotellook 补位） */}
        <div className="mt-5 rounded-[4px] bg-ut-surface p-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-mono text-micro uppercase tracking-[0.16em] text-ut-text-2">
              Nearby hotels
            </p>
            <span className="font-mono text-micro uppercase tracking-[0.14em] text-ut-muted">
              Live · Wink
            </span>
          </div>
          <WinkHotelCards
            slug={slug}
            name={attraction?.name ?? name}
            lat={pointLat}
            lon={pointLon}
            checkIn={checkIn}
            checkOut={checkOut}
            nights={suggestedDays}
          />
        </div>

        <div className="mt-5">
          <AddToTripButton type="attraction" name={attraction?.name ?? name} />
          <WorkspaceActions kind="place" title={attraction?.name ?? name} city={city} source={`Destination · ${city}`} compact />
        </div>
      </div>
    </article>
  );
}

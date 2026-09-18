import { buildHotelSearchUrl } from "@/lib/affiliate";
import HotelSearchLink from "./HotelSearchLink";

/**
 * HotelModule — Destination 上唯一的商业模块（Quiet Commerce Module）。
 *
 * CONTRACT §25 / §14：
 *   · 全页最多一个商业模块，出现在 Highlights 之后，绝不进入 Hero / First screen。
 *   · 视觉必须安静：bordered + warm surface + subtle，明确标注
 *     "Sponsored · Hotellook"，并使用 rel="sponsored noopener noreferrer"。
 *   · 禁止蓝色按钮 / banner / 巨大 CTA / 广告墙。
 *   · 视觉权重必须**低于**页面 Primary CTA —— 因此这里用描边按钮（非填充 accent），
 *     使商业入口始终 subordinate to editorial experience。
 *
 * §26：本组件仍是 Server Component；入住窗口的**最终**取值交给 client 叶子
 * HotelSearchLink 在点击前刷新（见该文件）。原因：日期一旦在构建期定死，就会被
 * 静态 HTML 永久冻结，部署后用户点到的恒为"构建当天"。此处保留服务端生成值
 * 作为首帧 / 无 JS 兜底，两处共用同一套 URL 语义。
 */

/** 默认住宿晚数（与原实现一致：今天起 7 晚）。 */
const HOTEL_NIGHTS = 7;

/** 链接视觉契约 —— 原样保留，设计不变。 */
const LINK_CLASS = [
  "mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-ut-sm border border-ut-border-strong",
  "px-5 py-3 text-body font-medium text-ut-text transition-colors duration-[var(--ut-dur-fast)]",
  "hover:bg-ut-surface-hover focus-visible:outline-2 focus-visible:outline-ut-accent",
].join(" ");

/** 服务端兜底入住窗口（首帧 / 无 JS）。仅在 server 端执行。 */
function defaultHotelDates() {
  const checkIn = new Date().toISOString().slice(0, 10);
  const checkOut = new Date(Date.now() + HOTEL_NIGHTS * 86400000)
    .toISOString()
    .slice(0, 10);
  return { checkIn, checkOut };
}

export default function HotelModule({ city }: { city: string }) {
  const href = buildHotelSearchUrl({ city, ...defaultHotelDates() });

  return (
    <section
      aria-label={`Accommodation in ${city}`}
      className="rounded-ut-md border border-ut-border bg-ut-surface p-6 sm:p-8"
    >
      {/* 商业披露必须可读（不可是 decoration-only 的低对比微标签） */}
      <span className="font-mono text-micro uppercase tracking-[0.18em] text-ut-text-2">
        Sponsored · Hotellook
      </span>
      <h2 className="mt-3 font-display text-h3 leading-[var(--ut-text-h3--lh)] text-ut-ink">
        Where to stay in {city}
      </h2>
      <p className="mt-2 max-w-[52ch] text-body leading-[1.6] text-ut-text-2">
        Compare live rates for {city} accommodation. Opens the provider in a new
        tab with a date window prefilled.
      </p>
      <HotelSearchLink href={href} nights={HOTEL_NIGHTS} className={LINK_CLASS}>
        Search hotels in {city}
        <span aria-hidden="true">→</span>
      </HotelSearchLink>
    </section>
  );
}

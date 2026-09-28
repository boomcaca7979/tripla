import Link from "next/link";
import AffiliateLink from "@/components/analytics/AffiliateLink";
import { buildHotelSearchUrl } from "@/lib/affiliate";
import type { Destination } from "@/data/destinations";

/**
 * ContentCommerce — guide / travel-budget 内容页的商业入口模块（P9）。
 *
 * 定位与诚信边界：
 *   · 与正文相关的真实联盟链路（Aviasales 机票搜索 / Hotellook 酒店搜索），
 *     附清楚的 "Sponsored" 标注与 destination 名，独立于正文区块；
 *   · 机票需要一个出发地 —— 页面没有该上下文，链接带目的地与默认窗口日期，
 *     落地在 Aviasales 后由用户补全出发地（不伪造价格、不伪造航线）；
 *   · 不渲染任何价格数字：价格只属于 provider；
 *   · 位于正文中后段（不进首段/Hero），不打断阅读。
 */

/** 与目的地时区无关的"下月起 6 个月窗口"默认日期（可控、确定性）。 */
function defaultWindow(): { depart: string; ret: string } {
  const now = new Date();
  const depart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 15));
  const ret = new Date(depart.getTime() + 7 * 86400000);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { depart: iso(depart), ret: iso(ret) };
}

export default function ContentCommerce({ destination }: { destination: Destination }) {
  const { depart, ret } = defaultWindow();
  const iata = destination.airport?.iata ?? "";

  // 机票：只带我们在这一页**确实知道**的参数（目的地 + 日期窗口）。
  // 出发地未知 → 不传 origin_iata（用户到 Aviasales 后补全），绝不塞空值。
  const flightUrl = (() => {
    const url = new URL("https://www.aviasales.com/search");
    const marker = process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER ?? "";
    if (marker) url.searchParams.set("marker", marker);
    if (iata) url.searchParams.set("destination_iata", iata);
    url.searchParams.set("depart_date", depart);
    url.searchParams.set("return_date", ret);
    return url.toString();
  })();
  const hotelUrl = buildHotelSearchUrl({
    city: destination.city,
    checkIn: depart,
    checkOut: ret,
  });

  return (
    <aside
      aria-label="Plan and book"
      className="my-10 rounded-ut-sm border border-ut-border bg-ut-surface p-5 sm:p-6"
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display text-[18px] font-bold text-ut-ink">
          Flights &amp; stays in {destination.city}
        </p>
        <span className="font-mono text-[0.625rem] uppercase tracking-[0.25em] text-ut-muted">
          Sponsored
        </span>
      </div>
      <p className="mt-2 max-w-[62ch] text-body-sm leading-relaxed text-ut-text-2">
        Compare fares and hotels for {destination.city} with our partners — you continue on
        the provider&apos;s site, and prices are shown there.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <AffiliateLink
          category="flight"
          provider="aviasales"
          destination={destination.slug}
          href={flightUrl}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="inline-flex min-h-[40px] items-center gap-2 rounded-ut-sm bg-ut-accent px-4 py-2 text-body-sm font-medium text-white transition-colors hover:bg-ut-accent-strong"
        >
          Search flights →
        </AffiliateLink>
        <AffiliateLink
          category="hotel"
          provider="hotellook"
          destination={destination.slug}
          href={hotelUrl}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="inline-flex min-h-[40px] items-center gap-2 rounded-ut-sm border border-ut-border-strong px-4 py-2 text-body-sm font-medium text-ut-text transition-colors hover:bg-ut-surface-hover"
        >
          Compare stays →
        </AffiliateLink>
        <Link
          href={`/destinations/${destination.slug}`}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-ut-sm px-4 py-2 text-body-sm font-medium text-ut-accent underline-offset-4 hover:underline"
        >
          Open the {destination.city} guide →
        </Link>
      </div>
    </aside>
  );
}

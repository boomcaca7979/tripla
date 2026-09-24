import { buildFlightSearchUrl } from "@/lib/affiliate";
import AffiliateLink from "@/components/analytics/AffiliateLink";

/**
 * FlightModule — Destination 商业层的 **Flights 插槽**（integration boundary）。
 *
 * 与 HotelModule 同一套 Quiet Commerce 规则（Sponsored 标注 / rel="sponsored
 * noopener noreferrer" / 描边按钮 / 视觉低于页面 Primary CTA）。
 *
 * ⚠️ 边界：航班搜索需要**真实出发地**（originIata）。当前产品没有用户出发地数据，
 * 因此本组件在未提供 originIata 时**渲染为 null** —— 绝不伪造默认出发地或价格。
 * 未来接入用户出发地（profile / geolocation / 搜索上下文）后，传入 originIata
 * 即可点亮本插槽，页面结构无需改动。
 *
 * Server Component：日期在构建期确定性求值，不参与客户端渲染。
 */

function defaultFlightWindow() {
  const departDate = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const returnDate = new Date(Date.now() + 37 * 86400000).toISOString().slice(0, 10);
  return { departDate, returnDate };
}

export default function FlightModule({
  city,
  destinationIata,
  originIata,
}: {
  city: string;
  destinationIata: string;
  /** 出发地 IATA；缺省时不渲染（无真实数据不伪造） */
  originIata?: string;
}) {
  if (!originIata) return null;

  const href = buildFlightSearchUrl({
    originIata,
    destinationIata,
    ...defaultFlightWindow(),
  });

  return (
    <section
      aria-label={`Flights to ${city}`}
      className="rounded-ut-md border border-ut-border bg-ut-surface p-6 sm:p-8"
    >
      <span className="font-mono text-micro uppercase tracking-[0.18em] text-ut-text-2">
        Sponsored · Aviasales
      </span>
      <h2 className="mt-3 font-display text-h3 leading-[var(--ut-text-h3--lh)] text-ut-ink">
        Flights to {city}
      </h2>
      <p className="mt-2 max-w-[52ch] text-body leading-[1.6] text-ut-text-2">
        Compare live fares to {city} ({destinationIata}). Opens the provider in a
        new tab with a departure window prefilled.
      </p>
      <AffiliateLink
        href={href}
        category="flight"
        provider="aviasales"
        destination={city}
        identifier={destinationIata}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-ut-sm border border-ut-border-strong px-5 py-3 text-body font-medium text-ut-text transition-colors duration-[var(--ut-dur-fast)] hover:bg-ut-surface-hover focus-visible:outline-2 focus-visible:outline-ut-accent"
      >
        Search flights to {city}
        <span aria-hidden="true">→</span>
      </AffiliateLink>
    </section>
  );
}

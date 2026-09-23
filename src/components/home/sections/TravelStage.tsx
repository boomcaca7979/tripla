import Eyebrow from "@/components/ui/Eyebrow";
import { getDestinationBySlug } from "@/data/destinations";
import { PhotoLayer, QuietLink } from "./parts";
import { TRAVEL_SLUG, type Postcard } from "@/lib/home-sections";

/**
 * TravelStage — 首页第 4 段：**From discovery to travel.**
 *
 * 只列 Tripla **当前已经存在**的三个真实旅行服务入口，一个都不虚构：
 *   · Flights     —— src/components/destination/trip/FlightSearch.tsx（/api/flights 真实价格 + Aviasales 兜底）
 *   · Hotels      —— src/components/destination/trip/WinkHotelCards.tsx（真实距离与入住窗口）
 *   · Experiences —— src/components/destination/trip/ExperienceList.tsx（Viator 真实商品）
 *
 * 三个入口都长在**目的地详情页**上，所以这里给的是"进入真实服务"的路径
 * （Open <城市> →），而不是把 affiliate 模块搬到首页 —— 商业层按既定决议只进详情页，
 * 首页也不做广告 banner / 廉价 deal 卡片。
 *
 * 构图（第 4 种场景）：整幅宽的照片带，信息层压在照片下缘（hairline 分栏，非卡片）。
 * server component：零 client JS。
 */

interface ServiceEntry {
  index: string;
  label: string;
  note: string;
}

const SERVICES: ServiceEntry[] = [
  { index: "01", label: "Flights", note: "Fare search from your city, city by city." },
  { index: "02", label: "Hotels", note: "Nearby stays, with the real distance shown." },
  { index: "03", label: "Experiences", note: "Bookable tours and tickets, live from Viator." },
];

export default function TravelStage({ card }: { card: Postcard | null }) {
  const city = getDestinationBySlug(TRAVEL_SLUG);

  return (
    <section id="travel" className="scroll-mt-20">
      <div className="mx-auto max-w-[var(--ut-container-max)] px-4 pb-16 md:px-6 md:pb-24">
        <div className="relative flex min-h-[60svh] flex-col justify-between gap-10 overflow-hidden rounded-ut-lg p-5 md:min-h-[70svh] md:p-8">
          {card && (
            <PhotoLayer
              card={card}
              sizes="(max-width: 1024px) 100vw, 80rem"
              creditClassName="top-3 right-3"
            />
          )}

          <div className="relative">
            <Eyebrow dot className="ut-t-micro-photo">
              04 · Travel
            </Eyebrow>
            <h2 className="ut-t-section mt-3 max-w-[18ch] text-white">
              From discovery to travel.
            </h2>
          </div>

          {/* 信息层：三项真实服务入口，hairline 分栏（不是卡片、不是 deal banner） */}
          <div className="relative grid gap-4 sm:grid-cols-3 sm:gap-6">
            {SERVICES.map((s) => (
              <div key={s.label} className="border-t border-white/25 pt-3">
                <p className="ut-t-micro text-white/60">
                  {s.index} · {s.label}
                </p>
                <p className="ut-t-support mt-2 max-w-[34ch] text-white/85">
                  {s.note}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-1">
          {city && <QuietLink href={`/destinations/${city.slug}`}>Open {city.city} →</QuietLink>}
          <QuietLink href="/destinations">All destinations →</QuietLink>
        </div>
        <p className="ut-t-micro mt-2 text-ut-subtle">
          Flights, stays and experiences open inside each destination page.
        </p>
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getDestinationBySlug,
  getDestinationSlugs,
  type Destination,
} from "@/data/destinations";
import { TRIPS } from "@/data/trips";
import { getGuidesForCity } from "@/data/guides";
import { getAttractions } from "@/data/attractions";
import { getDestinationGallery } from "@/data/destination-gallery";
import PlaceWorld from "@/components/destination/PlaceWorld";
import DestinationViewTracker from "@/components/analytics/DestinationViewTracker";
import { getClimateRecord } from "@/data/climate/nasa-canonical";
import { buildMonthRows, canonicalWindowLabel } from "@/components/besttime/besttime-state";
import { monthNormals } from "@/lib/inner-state";
import { MyTripProvider } from "@/components/destination/trip/MyTripContext";
import MyTripPanel from "@/components/destination/trip/MyTripPanel";
import MobileTripBar from "@/components/destination/trip/MobileTripBar";
import AttractionCard from "@/components/destination/trip/AttractionCard";
import { getAttractionPoint } from "@/data/attraction-coordinates";
import PlaceGallery from "@/components/destination/trip/PlaceGallery";
import RouteBuilder from "@/components/destination/trip/RouteBuilder";
import FlightSearch from "@/components/destination/trip/FlightSearch";
import ExperienceList from "@/components/destination/trip/ExperienceList";
import RestaurantList from "@/components/destination/trip/RestaurantList";
import { getCityCenter } from "@/lib/api/restaurants";
import type { TravelInterest, TravelStyle } from "@/types/itinerary";

/**
 * Destination Detail — 3.5：CITY TRIP EXPLORER（旅行探索与规划页）。
 *
 * 产品关系：看城市 → Getting there（机票/酒店） → 看景点 → 加入旅行清单
 *   → 清单实时累积 → AI 按清单生成行程。页面主体 = 景点内容单元（每单元带
 *   Wink 真实周边酒店 + Add to My Trip），桌面右侧 sticky
 *   MY TRIP，移动端底部常驻 Trip Bar + Bottom Sheet。
 *
 * 数据诚信（本轮硬规则）：
 *   · 预算：页面绝不自动估算 trip total（不再有 daily budget × days）。
 *     My Trip total 只累计用户显式选择且带真实价格的条目；无真实价格 →
 *     "Price unavailable"，不进入 total。城市 budgetPerDay 仅作 AI 参考。
 *   · Flights = 站内价格结果（Aviasales Data API 缓存价格，token 缺失 →
 *     诚实空态 + 外部搜索兜底），标注 "Prices from recent Aviasales search
 *     data"；真实价格才进 My Trip。Aviationstack（仅时刻 + mock 回退）不用于本页。
 *   · 景点 = 结构化真实地点对象（attractions.ts：名称/描述/真图/坐标/类型/
 *     准入；未收录城市回退 highlights 字符串）。活动/主题文案不作为景点本体。
 *   · 门票 = Viator attraction 级产品搜索（真实产品 + fromPrice；无产品 →
 *     "No bookable experience available"）。
 *   · 酒店 = Wink 唯一数据源：Attraction 真实坐标 → search/geo →
 *     distanceInMeters 排序（卡片显示真实距离）→ 最近 ≤6 家 + Refresh 下一批；
 *     nights = Suggested city stay；无坐标/无供给 → 诚实空态，绝不 Hotellook。
 *   · 美食 = Restaurants（Geoapify Places；key 未配置 → 诚实空态；绝不把
 *     菜名当餐厅）。
 *   · 路线 = RouteBuilder：完全由 My Trip 已选条目生成（坐标最近邻排序、
 *     酒店作住宿 anchor）；空选择 → "Add places to build your route"。
 *   · AI = 真实 /api/itinerary（Groq llama-3.3-70b），输入含 My Trip tripItems
 *     （含每条价格状态）；AI 成本只能作为 suggestion，不与 confirmed 混淆。
 *
 * Scene 整合：SCENE 01 THE PLACE = Hero（When to go 模块已移除）。
 * SSG（dynamicParams=false）不变。
 */

const SITE_URL = "https://www.utripla.xyz";
const CONTAINER = "mx-auto w-full max-w-7xl px-4 md:px-6";

const VALID_TRAVEL_STYLES: TravelStyle[] = ["relaxed", "active", "cultural", "foodie", "adventure"];
const VALID_INTERESTS: TravelInterest[] = [
  "museums", "nature", "food", "shopping", "nightlife", "history", "sports", "beaches",
];

// ── Static params ─────────────────────────────────────────────────────

export const dynamicParams = false;

export function generateStaticParams() {
  return getDestinationSlugs().map((slug) => ({ slug }));
}

// ── Per-page metadata（保持既有 SEO 实现，未改动）──────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dest = getDestinationBySlug(slug);
  if (!dest) return { title: "Destination not found" };
  const title = buildDestinationTitle(dest);
  const description = buildDestinationMetaDescription(dest);
  return {
    title,
    description,
    alternates: {
      canonical: `/destinations/${dest.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      images: dest.image ? [{ url: dest.image }] : undefined,
    },
    twitter: {
      card: dest.image ? "summary_large_image" : "summary",
      title,
      description,
    },
  };
}

function buildDestinationTitle(dest: Destination): string {
  const base = `${dest.city} Travel Guide`;
  if (dest.city === dest.country) {
    return `${base} · Top Highlights & Tips`;
  }
  if (dest.country.length > 12) {
    return `${base} · ${dest.country} Highlights`;
  }
  return `${base} · ${dest.country} Highlights & Tips`;
}

function buildDestinationMetaDescription(dest: Destination): string {
  const suffix = ` Best time: ${dest.bestMonths}. Stay: ${dest.recommendedDays} days. Budget: ${dest.budgetPerDay} ${dest.budgetCurrency}/day.`;
  const maxPrefix = 160 - suffix.length;
  let prefix = dest.longDescription;
  if (prefix.length > maxPrefix) {
    prefix = prefix.slice(0, Math.max(0, maxPrefix - 1)).trimEnd() + "…";
  }
  return prefix + suffix;
}

// ── JSON-LD（结构与字段保持既有实现，未删减）──────────────────────────

function buildTouristDestinationJsonLd(dest: Destination) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: dest.city,
    description: dest.longDescription,
    url: `${SITE_URL}/destinations/${dest.slug}`,
    image: dest.image ?? undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/destinations/${dest.slug}`,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: dest.city,
      addressCountry: dest.country,
    },
    touristType: dest.travelStyle,
  };
}

function buildBreadcrumbJsonLd(dest: Destination) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Destinations", item: `${SITE_URL}/destinations` },
      {
        "@type": "ListItem",
        position: 3,
        name: dest.city,
        item: `${SITE_URL}/destinations/${dest.slug}`,
      },
    ],
  };
}

function buildPopularTripsItemListJsonLd(dest: Destination, trips: typeof TRIPS) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Popular trip templates in ${dest.city}`,
    itemListElement: trips.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/trips/${t.slug}`,
      name: t.title,
    })),
  };
}

// ── Helpers ───────────────────────────────────────────────────────────

/**
 * Wink 酒店入住窗口：nights = Suggested city stay（recommendedDays），与页面
 * "Suggested city stay N days" / "N-night total" 三者语义一致（项目既有酒店
 * 日期语义 = checkIn + 自然日）。不再固定 7 nights。
 */
function defaultHotelDates(nights: number) {
  const checkIn = new Date().toISOString().slice(0, 10);
  const checkOut = new Date(Date.now() + Math.max(1, nights) * 86400000).toISOString().slice(0, 10);
  return { checkIn, checkOut };
}

// ── Page ──────────────────────────────────────────────────────────────

export default async function DestinationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dest = getDestinationBySlug(slug);
  if (!dest) notFound();

  const popularTrips = TRIPS.filter(
    (t) => t.city.toLowerCase() === dest.city.toLowerCase(),
  ).slice(0, 5);
  const cityGuideCount = getGuidesForCity(dest.city).length;
  // Hero "Explore N guides" 出口：直接进首篇同城 Guide（真实 Guide URL）。
  // 不再指向 /guides?city=X —— 城市唯一页规则下该深链会 308 回本页形成循环。
  const firstCityGuide = getGuidesForCity(dest.city)[0] ?? null;
  const guidesHref = firstCityGuide ? `/guides/${firstCityGuide.slug}` : null;

  // ── Gallery（结构化优先）：城市画廊数据收录的城市用结构化真实地标图
  //    （逐张目检）；未收录城市回退既有拼装（dest.image + 同城 trip 真实封面）。
  const galleryEntries = getDestinationGallery(dest.slug);
  const galleryImages =
    galleryEntries.length > 0
      ? galleryEntries.map((g) => g.src)
      : Array.from(
          new Set([
            ...(dest.image ? [dest.image] : []),
            ...TRIPS.filter(
              (t) => t.city.toLowerCase() === dest.city.toLowerCase() && t.coverImage,
            ).map((t) => t.coverImage as string),
          ]),
        ).slice(0, 6);

  // ── Climate authority（不变） ────────────────────────────────────────
  const climateRecord = getClimateRecord(dest.slug);
  const climateRows = buildMonthRows(dest);
  const normals = monthNormals(climateRecord);
  const goLabel = canonicalWindowLabel(climateRecord.bestMonthsBaseline);

  // ── Trip / AI planner inputs（真实字段适配） ────────────────────────
  const travelStyle = (VALID_TRAVEL_STYLES.includes(dest.travelStyle as TravelStyle)
    ? dest.travelStyle
    : "cultural") as TravelStyle;
  const plannerInterests = dest.interests.filter((i): i is TravelInterest =>
    (VALID_INTERESTS as string[]).includes(i),
  );
  // ── 结构化景点（真实地点对象；未收录城市 → 空数组回退既有 highlights 渲染）
  const attractions = getAttractions(dest.slug);
  const hotelDates = defaultHotelDates(dest.recommendedDays);
  const cityCenter = getCityCenter(dest.slug);

  const plannerPanelProps = {
    airport: dest.airport,
    travelStyle,
    interests: plannerInterests,
  };

  return (
    <MyTripProvider
      slug={dest.slug}
      city={dest.city}
      defaultDays={dest.recommendedDays}
      dailyBudget={{ amount: dest.budgetPerDay, currency: dest.budgetCurrency }}
    >
      <article className="ut-world" data-ut-skin="editorial">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildTouristDestinationJsonLd(dest)),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildBreadcrumbJsonLd(dest)),
          }}
        />
        {popularTrips.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(
                buildPopularTripsItemListJsonLd(dest, popularTrips),
              ),
            }}
          />
        )}

        {/* ═══ SCENE 01 — THE PLACE（Hero 城市身份，保留） ═══ */}
        <DestinationViewTracker destination={dest.slug} country={dest.country} />
        <PlaceWorld
          dest={dest}
          normals={normals}
          currentMonthPrecipMm={climateRows[new Date().getMonth()]?.precipMm ?? 0}
          timeScrubber={false}
          facts={{
            bestTime: goLabel || dest.bestMonths,
          }}
          interests={dest.interests.map((i) => i.charAt(0).toUpperCase() + i.slice(1))}
          planHref="#explore"
          guidesCount={cityGuideCount}
          guidesHref={guidesHref}
        />

        {/* ═══ THE PLACE — Gallery + City identity（Round 15 视觉重构） ═══ */}
        <section
          aria-label="The place"
          className="relative z-10 -mt-8 rounded-t-[1.25rem] bg-ut-bg pb-16 pt-12 shadow-[0_-16px_48px_rgba(5,8,14,0.45)]"
        >
          <div className={CONTAINER}>
            {/* 参考作品 section 标题模式：斜体宽字距 eyebrow + 居中 Heavy 标题 + tiny letterspaced 副标 */}
            <div className="text-center">
              <p className="ut-ref-eyebrow text-micro">The Place</p>
              <h2 className="mt-3 font-display text-[32px] leading-tight text-ut-ink sm:text-[42px]">
                {dest.city}, {dest.country}
              </h2>
              <p className="mt-2 font-mono text-[0.625rem] uppercase tracking-[0.35em] text-ut-muted">
                City introduction
              </p>
            </div>

            <div className="mt-8">
              <PlaceGallery
                city={dest.city}
                country={dest.country}
                images={galleryImages}
              />
            </div>

            {/* 城市简介：历史 / 城市特点 / 代表性景点（真实数据） */}
            <div className="mt-12">
              <p className="mx-auto max-w-[68ch] text-center text-body-lg leading-[1.7] text-ut-text-2">
                {dest.description} {dest.longDescription}
              </p>
            </div>
          </div>
        </section>

        {/* ═══ GETTING THERE — 城市级 Flights（先交通，再进景点） ═══ */}
        <section aria-label={`Getting to ${dest.city}`} className="relative z-10 bg-ut-bg pb-16">
          <div className={CONTAINER}>
            <div className="text-center">
              <p className="ut-ref-eyebrow text-micro">Getting there</p>
              <h2 className="mt-3 font-display text-[32px] leading-tight text-ut-ink sm:text-[42px]">
                Getting to {dest.city}
              </h2>
              <p className="mt-2 font-mono text-[0.625rem] uppercase tracking-[0.35em] text-ut-muted">
                Flights
              </p>
            </div>

            <div className="mt-10">
              <FlightSearch city={dest.city} destinationIata={dest.airport.iata} />
            </div>
          </div>
        </section>

        {/* ═══ EXPLORE — 景点 / 美食 / 路线 / My Trip（页面主体） ═══ */}
        <div id="explore" className="relative z-10 bg-ut-bg pb-16 pt-16">
          <div className={CONTAINER}>
            <div className="text-center">
              <p className="ut-ref-eyebrow text-micro">Explore</p>
              <h2 className="mt-3 font-display text-[32px] leading-tight text-ut-ink sm:text-[42px]">
                Explore {dest.city}
              </h2>
              <p className="mt-2 font-mono text-[0.625rem] uppercase tracking-[0.35em] text-ut-muted">
                Things to do · Stays · Food
              </p>
            </div>

            {/* ── 景点主体 + 桌面 Sticky MY TRIP ── */}
            <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div id="attractions" className="min-w-0 scroll-mt-24">
                <div className="text-center">
                  <h2 className="font-display text-[26px] leading-tight text-ut-ink">
                    Things to see in {dest.city}
                  </h2>
                  <p className="mt-2 font-mono text-[0.625rem] uppercase tracking-[0.35em] text-ut-muted">
                    Attractions
                  </p>
                </div>

                <div className="mt-6 space-y-8">
                  {attractions.length > 0
                    ? attractions.map((a, i) => (
                        <AttractionCard
                          key={a.id}
                          name={a.name}
                          index={i}
                          city={dest.city}
                          slug={dest.slug}
                          gradient={dest.gradient}
                          bestMonths={dest.bestMonths}
                          suggestedDays={dest.recommendedDays}
                          checkIn={hotelDates.checkIn}
                          checkOut={hotelDates.checkOut}
                          lat={a.lat}
                          lon={a.lon}
                          attraction={a}
                        />
                      ))
                    : dest.highlights.map((h, i) => {
                        const point = getAttractionPoint(dest.slug, h);
                        return (
                          <AttractionCard
                            key={h}
                            name={h}
                            index={i}
                            city={dest.city}
                            slug={dest.slug}
                            gradient={dest.gradient}
                            bestMonths={dest.bestMonths}
                            suggestedDays={dest.recommendedDays}
                            checkIn={hotelDates.checkIn}
                            checkOut={hotelDates.checkOut}
                            lat={point?.lat}
                            lon={point?.lon}
                          />
                        );
                      })}
                </div>

                {/* ── 可预订体验（Viator Basic Affiliate；懒加载 + 真实价格才进预算） ── */}
                <ExperienceList slug={dest.slug} city={dest.city} />

                {/* ── Food（Restaurants）：真实餐厅数据 = Geoapify Places API。
                     未收录搜索中心 / 无结果 / key 缺失 → 诚实空态；
                     绝不把菜名当餐厅、不猜价格/评分/图片。 ── */}
                <div className="mt-14">
                  <div className="text-center">
                    <h2 className="font-display text-[26px] leading-tight text-ut-ink">
                      Restaurants in {dest.city}
                    </h2>
                    <p className="mt-2 font-mono text-[0.625rem] uppercase tracking-[0.35em] text-ut-muted">
                      Food
                    </p>
                  </div>
                  <RestaurantList
                    slug={dest.slug}
                    lat={cityCenter?.lat}
                    lon={cityCenter?.lon}
                  />
                </div>

                {/* ── Build your route（完全由 My Trip 已选条目生成；空选择 = 诚实空态） ── */}
                <div className="mt-14">
                  <div className="text-center">
                    <h2 className="font-display text-[26px] leading-tight text-ut-ink">
                      Build your route
                    </h2>
                    <p className="mt-2 font-mono text-[0.625rem] uppercase tracking-[0.35em] text-ut-muted">
                      Route
                    </p>
                  </div>
                  <div className="mt-6">
                    <RouteBuilder slug={dest.slug} city={dest.city} />
                  </div>
                </div>
              </div>

              {/* ── 桌面 Sticky MY TRIP ── */}
              <aside aria-label="My Trip" className="hidden lg:block">
                <div className="sticky top-24 rounded-ut-md bg-ut-bg shadow-ut-2">
                  <MyTripPanel {...plannerPanelProps} />
                </div>
              </aside>
            </div>
          </div>
        </div>

        {/* ═══ 移动端常驻 Trip Bar + Bottom Sheet（lg 以下；置于 article 内以继承 editorial 皮肤） ═══ */}
        <MobileTripBar {...plannerPanelProps} />
      </article>
    </MyTripProvider>
  );
}

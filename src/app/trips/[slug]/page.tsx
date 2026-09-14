import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTripBySlug, getTripSlugs, TRIPS, type Trip } from "@/data/trips";
import { DESTINATIONS } from "@/data/destinations";
import { getGuidesForCity } from "@/data/guides";
import InnerBreadcrumb from "@/components/inner/InnerBreadcrumb";
import InnerSection from "@/components/inner/InnerSection";
import EditorialIndex from "@/components/inner/EditorialIndex";
import InnerCTA from "@/components/inner/InnerCTA";
// 复用已验收的 Guide / Destination Foundation 原语（不修改其行为）：
import PlaceHighlights from "@/components/destination/PlaceHighlights";
import PlacePractical from "@/components/destination/PlacePractical";
import PlaceDecision from "@/components/destination/PlaceDecision";
// Trip 专属 Journey Foundation：
import JourneyAtmosphere from "@/components/journey/JourneyAtmosphere";
import JourneyHero from "@/components/journey/JourneyHero";
import JourneyRoute from "@/components/journey/JourneyRoute";
import JourneyProgress from "@/components/journey/JourneyProgress";
import JourneyTimeline from "@/components/journey/JourneyTimeline";
import JourneyPlaces from "@/components/journey/JourneyPlaces";
import {
  capitalize,
  daysLabel,
  deriveLegs,
  derivePace,
  deriveStopCount,
} from "@/components/journey/journey-state";

/**
 * Trip Detail — JOURNEY EXPERIENCE（第三阶段）。
 *
 * 与 Guide / Destination 的关系（Product Role 三分）：
 *   Guide       = Editorial Experience（**阅读**：文章、章节、阅读进度）
 *   Destination = Place Experience（**抵达**：我到了这个地方、当地状态、地点对象）
 *   Trip        = Journey Experience（**移动**：一段有起点、有段数、有节奏的旅程）
 *
 * 因此本页的骨架是"旅程"的信息关系，而不是文章的章节关系：
 *   Journey Arrival（首屏）→ Journey Route（路线总览 / Journey Strip）→
 *   Overview → Highlights → Journey Timeline（逐日 + 显式地点转换）→
 *   Where to eat → Journey practicalities（仪器面）→ When to go（语境）→
 *   Journey budget（语境）→ 唯一 Primary CTA → Related（编辑式索引 ×3）
 *
 * 与既有实现相比的**内容质量修正**（Inner Audit 确认的缺陷）：
 *   1) 删除 "Travel tips" 区块 —— 它由 trip.bestSeason + 3 条**跨所有 Trip 完全相同**
 *      的硬编码建议组成（唯一变量是城市名）。本模板不再重新包装同一批填充内容，
 *      改为：bestSeason 进入 "When to go" 语境模块；其余实用信息改为
 *      **仅由真实字段构成** 的 Journey practicalities 仪器面。
 *   2) Highlights 只在**独立内容**存在时渲染；若 highlights 是 normalize 从
 *      前 3 天 theme 派生的兜底（50 个 trip），则不再重复展示一遍行程标题。
 *
 * 默认 Server Component；唯一 client 组件是 Journey Progress（Day/Stop 状态）。
 * 无 WebGL / canvas / 视频 / 广告；无新增 Flight Affiliate。
 */

const SITE_URL = "https://www.utripla.xyz";
const CONTAINER = "mx-auto w-full max-w-7xl px-4 md:px-6";

// ── Static params ─────────────────────────────────────────────────────

// 仅允许 generateStaticParams 返回的 slug 被渲染；
// 其他 slug 在路由层直接 404，避免 notFound() 被静默吞掉返回 200。
export const dynamicParams = false;

export function generateStaticParams() {
  return getTripSlugs().map((slug) => ({ slug }));
}

// ── Per-page metadata（保持既有 SEO 实现，未改动）──────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const trip = getTripBySlug(slug);
  if (!trip) return { title: "Trip not found" };
  // layout.tsx 的 title.template = "%s | tripla"，会自动追加站点名，这里不要重复。
  // Phase 6.4: title 目标 50-60 chars（含 " | tripla"），description 目标 140-160 chars。
  // 仅组合已有真实字段，不生成 AI 文案。
  const title = buildTripTitle(trip);
  const description = buildTripMetaDescription(trip);
  return {
    title,
    description,
    alternates: {
      canonical: `/trips/${trip.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      images: trip.coverImage ? [{ url: trip.coverImage }] : undefined,
    },
    twitter: {
      card: trip.coverImage ? "summary_large_image" : "summary",
      title,
      description,
    },
  };
}

/**
 * Phase 6.4: 构造 50-60 char 的 title（含 " | tripla" 9 字符模板）。
 * 按行程标题长度自适应选择后缀，全部来自真实字段。
 */
function buildTripTitle(trip: Trip): string {
  const style = capitalize(trip.travelStyle);
  const candidates = [
    `${trip.title} · ${trip.days}-Day ${style} Plan`,
    `${trip.title} · ${trip.days}-Day ${style} Trip`,
    `${trip.title} · ${trip.days}-Day ${style} Trip Plan`,
    `${trip.title} · ${trip.days}-Day ${style} ${trip.country} Plan`,
    `${trip.title} · ${trip.days}-Day ${style} ${trip.country} Trip Plan`,
  ];
  let chosen = candidates[0];
  for (const c of candidates) {
    if (c.length <= 51) {
      chosen = c;
      if (c.length >= 41) break;
    }
  }
  return chosen;
}

/**
 * Phase 6.4: 构造 140-160 char 的 meta description。
 * 组合 trip.description + 行程基础信息（天数/风格/城市/国家/预算），
 * 全部来自真实字段，不做 AI 文案填充。超长时按省略号截断。
 */
function buildTripMetaDescription(trip: Trip): string {
  const suffix = ` ${trip.days}-day ${trip.travelStyle} itinerary in ${trip.city}, ${trip.country}.`;
  const base = `${trip.description}${suffix}`;
  if (base.length >= 140 && base.length <= 160) return base;
  if (base.length > 160) {
    const maxDesc = 160 - suffix.length - 1;
    return trip.description.slice(0, Math.max(0, maxDesc)).trimEnd() + "…" + suffix;
  }
  // 仍偏短则追加预算信息（仍是真实字段）；若仍超 160 则按省略号截断。
  const withBudget = `${base} Total budget: ${trip.budget} ${trip.currency}.`;
  if (withBudget.length <= 160) return withBudget;
  return withBudget.slice(0, 159).trimEnd() + "…";
}

// ── JSON-LD structured data（结构与字段保持既有实现，未删减）───────────

function buildItineraryJsonLd(trip: Trip) {
  return {
    "@context": "https://schema.org",
    "@type": "Trip",
    name: trip.title,
    description: trip.description,
    url: `${SITE_URL}/trips/${trip.slug}`,
    image: trip.coverImage ?? undefined,
    // Phase 9 Step 6: mainEntityOfPage 强化为 WebPage 实体。
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/trips/${trip.slug}`,
    },
    offers: {
      "@type": "Offer",
      price: trip.budget,
      priceCurrency: trip.currency,
    },
    itinerary: trip.itinerary.map((d) => ({
      "@type": "ItemList",
      name: `Day ${d.day}: ${d.theme}`,
      itemListElement: d.activities.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${a.time} — ${a.name}`,
      })),
    })),
  };
}

function buildBreadcrumbJsonLd(trip: Trip) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Trips", item: `${SITE_URL}/trips` },
      {
        "@type": "ListItem",
        position: 3,
        name: trip.title,
        item: `${SITE_URL}/trips/${trip.slug}`,
      },
    ],
  };
}

/**
 * Related trips ItemList schema（Phase 3 Step 4）。
 * 只描述真实存在的 trip URL，不生成 rating/review/fake data。
 */
function buildRelatedTripsItemListJsonLd(current: Trip, related: Trip[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Trips related to ${current.title}`,
    itemListElement: related.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/trips/${t.slug}`,
      name: t.title,
    })),
  };
}

// ── Helpers ───────────────────────────────────────────────────────────

/**
 * Planner 深链接。SearchBar 实际消费 to / travelStyle / interests
 * （见 src/components/search/SearchBar.tsx 的 deep-link 预填），
 * 旧实现的 &days= 并不被读取，故此处不再写入无效参数。
 */
function buildJourneyPlannerHref(trip: Trip): string {
  const params = new URLSearchParams();
  params.set("to", trip.city);
  params.set("travelStyle", trip.travelStyle);
  if (trip.interests.length > 0) params.set("interests", trip.interests.join(","));
  return `/?${params.toString()}#hero-search`;
}

/**
 * Highlights 是否为**独立内容**。
 *
 * normalizeTrip 在数据未显式提供 highlights 时，会用前 3 天的 theme 兜底
 * （见 src/data/trips.ts）。那种情况下 highlights 与 3 天主题逐字相同 ——
 * 它在同一页里已经被 Journey Route 与 Journey Timeline 完整表达，
 * 再渲染一次只是分散注意力的重复。因此仅在内容独立时渲染该区块。
 * （全量语料：280 个 trip 中 230 个有独立 highlights，50 个为派生兜底。）
 */
function hasExplicitHighlights(trip: Trip): boolean {
  if (trip.highlights.length === 0) return false;
  const derived = trip.itinerary.map((d) => d.theme).slice(0, 3);
  const isDerivedFallback =
    trip.highlights.length === derived.length &&
    trip.highlights.every((h, i) => h === derived[i]);
  return !isDerivedFallback;
}

// ── Page ──────────────────────────────────────────────────────────────

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const trip = getTripBySlug(slug);
  if (!trip) notFound();

  // ── Journey 派生读数（全部来自真实字段）────────────────────────────
  const legs = deriveLegs(trip);
  const stops = deriveStopCount(trip);
  const pace = derivePace(trip);
  const planHref = buildJourneyPlannerHref(trip);
  const showHighlights = hasExplicitHighlights(trip);

  // ── Related data（与既有实现同一套内链级联，未改变结果）────────────
  // 同 city 的 trip 优先；不足时用同 country 补；仍不足用任意其他 trip 补；最多 3。
  const sameCityTrips = TRIPS.filter(
    (t) => t.slug !== trip.slug && t.city.toLowerCase() === trip.city.toLowerCase(),
  );
  const sameCountryTrips = TRIPS.filter(
    (t) => t.slug !== trip.slug &&
      t.city.toLowerCase() !== trip.city.toLowerCase() &&
      t.country === trip.country,
  );
  const otherTrips = TRIPS.filter(
    (t) => t.slug !== trip.slug && t.country !== trip.country,
  );
  const relatedTrips = [
    ...sameCityTrips,
    ...sameCountryTrips,
    ...otherTrips,
  ].slice(0, 3);

  // Related destinations：同 country 优先，再同 region，再任意；最多 3。
  const matchedDestination = DESTINATIONS.find(
    (d) => d.city.toLowerCase() === trip.city.toLowerCase(),
  );
  const sameCountryDests = DESTINATIONS.filter(
    (d) => d.slug !== matchedDestination?.slug && d.country === trip.country,
  );
  const sameRegionDests = DESTINATIONS.filter(
    (d) => d.slug !== matchedDestination?.slug &&
      d.country !== trip.country &&
      matchedDestination && d.region === matchedDestination.region,
  );
  const otherDests = DESTINATIONS.filter(
    (d) => d.slug !== matchedDestination?.slug &&
      (!matchedDestination || d.region !== matchedDestination.region),
  );
  const relatedDestinations = [
    ...sameCountryDests,
    ...sameRegionDests,
    ...otherDests,
  ].slice(0, 3);

  // Trip → Guide 内链（同 city 的 guide，最多 3）。
  const cityGuides = getGuidesForCity(trip.city).slice(0, 3);

  // ── Journey practicalities：仅由真实字段构成（无任何模板建议）──────
  const practicalRows = [
    { label: "Gateway", value: `${trip.airport.iata} · ${trip.airport.name}` },
    { label: "Time zone", value: trip.airport.timezone },
    { label: "Currency", value: trip.currency },
    { label: "Duration", value: daysLabel(trip.days) },
    { label: "Scheduled stops", value: String(stops) },
    { label: "Journey pace", value: pace },
    { label: "Travel style", value: capitalize(trip.travelStyle) },
    ...(matchedDestination
      ? [{ label: "Region", value: matchedDestination.region }]
      : []),
  ];

  const perDay = Math.round(trip.budget / Math.max(trip.days, 1));

  return (
    <JourneyAtmosphere journeyId={trip.slug}>
      <article className="pb-20 pt-6 sm:pt-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildItineraryJsonLd(trip)) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(trip)) }}
        />
        {relatedTrips.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(buildRelatedTripsItemListJsonLd(trip, relatedTrips)),
            }}
          />
        )}

        {/* Quiet breadcrumb */}
        <div className={CONTAINER}>
          <InnerBreadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Trips", href: "/trips" },
              { label: trip.title },
            ]}
          />
        </div>

        {/* Journey Arrival（首屏：eyebrow + H1 + 路线读数 + 紧凑旅程状态） */}
        <div className={`${CONTAINER} mt-6 sm:mt-8`}>
          <JourneyHero
            trip={trip}
            legs={legs}
            stops={stops}
            pace={pace}
            region={matchedDestination?.region ?? trip.country}
          />
        </div>

        {/* Journey Route — Route Overview as a Journey Strip */}
        <div className={`${CONTAINER} mt-12 sm:mt-14`}>
          <InnerSection title="Journey route" eyebrow="Route">
            <JourneyRoute trip={trip} legs={legs} />
          </InnerSection>

          {/* Overview — 开放式引导文本（单段，保持"首屏之后不堆大段正文"） */}
          <div className="mb-12 lg:grid lg:grid-cols-12 lg:gap-x-12">
            <div className="lg:col-span-8">
              <p className="max-w-[62ch] text-body-lg leading-[1.6] text-ut-text">
                {trip.description}
              </p>
              <p className="mt-5 font-mono text-label uppercase tracking-[0.16em] text-ut-muted">
                {capitalize(trip.travelStyle)} ·{" "}
                {trip.interests.map(capitalize).join(" · ")} · Route by {trip.author.name}
              </p>
              {trip.tags.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-2">
                  {trip.tags.map((t) => (
                    <li
                      key={t}
                      className="rounded-ut-pill border border-ut-border px-3 py-1 text-body-sm text-ut-muted"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/*
            Journey context — 安静的上下文链接行（非卡片、非按钮、非 CTA）。
            保留既有实现中的站内爬取路径（城市 hub / travel style / region），
            避免重构造成内部链接回归；budget 与 best-time 两条深链已由上方
            两个决策模块承载。
          */}
          <div className="mb-12 flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <span className="font-mono text-micro uppercase tracking-[0.18em] text-ut-muted">
              Journey context
            </span>
            {matchedDestination && (
              <Link
                href={`/destinations/${matchedDestination.slug}`}
                className="text-body-sm font-medium text-ut-accent-strong underline decoration-ut-accent-line underline-offset-4 transition-colors duration-[var(--ut-dur-fast)] hover:text-ut-ink focus-visible:outline-2 focus-visible:outline-ut-accent"
              >
                {trip.city} travel guide
              </Link>
            )}
            <Link
              href={`/travel-styles/${trip.travelStyle}`}
              className="text-body-sm font-medium text-ut-accent-strong underline decoration-ut-accent-line underline-offset-4 transition-colors duration-[var(--ut-dur-fast)] hover:text-ut-ink focus-visible:outline-2 focus-visible:outline-ut-accent"
            >
              {capitalize(trip.travelStyle)} journeys
            </Link>
            {matchedDestination && (
              <Link
                href={`/regions/${matchedDestination.region.toLowerCase()}`}
                className="text-body-sm font-medium text-ut-accent-strong underline decoration-ut-accent-line underline-offset-4 transition-colors duration-[var(--ut-dur-fast)] hover:text-ut-ink focus-visible:outline-2 focus-visible:outline-ut-accent"
              >
                {matchedDestination.region} journeys
              </Link>
            )}
          </div>

          {/* Highlights — 仅在存在独立内容时渲染（见 hasExplicitHighlights） */}
          {showHighlights && (
            <InnerSection title="Journey highlights" eyebrow="Highlights">
              <PlaceHighlights items={trip.highlights} />
            </InnerSection>
          )}

          {/* Journey Timeline — 本页核心资产（逐日 + 显式地点转换） */}
          <InnerSection title="Day-by-day itinerary" eyebrow="Timeline">
            <JourneyProgress legs={legs} />
            <JourneyTimeline trip={trip} legs={legs} />
          </InnerSection>

          {/* Where to eat — 编辑式行，不是三列卡片 */}
          {trip.restaurants.length > 0 && (
            <InnerSection title={`Where to eat in ${trip.city}`} eyebrow="Food">
              <JourneyPlaces items={trip.restaurants} />
            </InnerSection>
          )}

          {/* Journey practicalities — Instrument Surface（仅真实字段） */}
          <InnerSection title="Journey practicalities" eyebrow="Before you go">
            <PlacePractical rows={practicalRows} />
          </InnerSection>

          {/* When to go — 语境化决策模块 → 深挖（best-time 页） */}
          <InnerSection title="When to go" eyebrow="Season">
            <PlaceDecision
              index="01"
              eyebrow="Season"
              headline={matchedDestination ? matchedDestination.bestMonths : trip.city}
              body={<p>{trip.bestSeason}</p>}
              lines={
                matchedDestination
                  ? [
                      { label: "Best months", value: matchedDestination.bestMonths },
                      {
                        label: "Climate score",
                        value: `${matchedDestination.weatherScore.label} · ${matchedDestination.weatherScore.overall}/100`,
                      },
                    ]
                  : []
              }
              href={
                matchedDestination
                  ? `/best-time-to-visit/${matchedDestination.slug}`
                  : "/best-time-to-visit"
              }
              linkLabel={
                matchedDestination
                  ? `See the full best-time guide for ${trip.city}`
                  : "Browse best-time guides"
              }
            />
          </InnerSection>

          {/* Journey budget — 规划语境（不是 Budget 模板整页复制） */}
          <InnerSection title="Journey budget" eyebrow="Money">
            <PlaceDecision
              index="02"
              eyebrow="Total estimate"
              headline={`${trip.budget.toLocaleString()} ${trip.currency}`}
              body={
                <p>
                  Estimated total for {daysLabel(trip.days)} covering accommodation,
                  local transport, food and the {stops} scheduled stops. International
                  flights are not included.
                </p>
              }
              lines={[
                { label: "Per day", value: `${perDay.toLocaleString()} ${trip.currency}` },
                { label: "Scheduled stops", value: String(stops) },
              ]}
              href={
                matchedDestination
                  ? `/travel-budget/${matchedDestination.slug}`
                  : "/travel-budget"
              }
              linkLabel={
                matchedDestination
                  ? `See the full budget guide for ${trip.city}`
                  : "Browse travel budgets"
              }
            />
          </InnerSection>

          {/* 唯一 Primary CTA（文末，非首屏；文案非 AI / 非 Generate） */}
          <InnerCTA
            href={planHref}
            title="Use this route in your own plan"
            description={`The planner opens with ${trip.city} and this journey's ${trip.travelStyle} travel style prefilled — adjust the dates and interests to make it yours.`}
            label="Use this route in the planner"
          />

          {/* Related — 全部为编辑式索引行（非卡片墙） */}
          {cityGuides.length > 0 && (
            <InnerSection title={`${trip.city} travel guides`} eyebrow="More guides">
              <EditorialIndex
                items={cityGuides.map((g) => ({
                  href: `/guides/${g.slug}`,
                  title: g.seoTitle,
                  meta: g.readTime,
                  description: g.excerpt,
                }))}
              />
            </InnerSection>
          )}

          {relatedTrips.length > 0 && (
            <InnerSection title="Related journeys" eyebrow="Trips">
              <EditorialIndex
                items={relatedTrips.map((t) => ({
                  href: `/trips/${t.slug}`,
                  title: t.title,
                  meta: `${t.days}D · ${t.budget.toLocaleString()} ${t.currency}`,
                  description: t.excerpt,
                }))}
              />
            </InnerSection>
          )}

          {relatedDestinations.length > 0 && (
            <InnerSection title="Related destinations" eyebrow="Explore">
              <EditorialIndex
                items={relatedDestinations.map((d) => ({
                  href: `/destinations/${d.slug}`,
                  title: d.city,
                  meta: d.country,
                  description: d.description,
                }))}
              />
            </InnerSection>
          )}
        </div>
      </article>
    </JourneyAtmosphere>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  DESTINATIONS,
  getDestinationBySlug,
  getDestinationSlugs,
  type Destination,
} from "@/data/destinations";
import { TRIPS } from "@/data/trips";
import { getGuidesForCity } from "@/data/guides";
import InnerSection from "@/components/inner/InnerSection";
import InnerCTA from "@/components/inner/InnerCTA";
import FaqList from "@/components/inner/FaqList";
import PlaceWorld from "@/components/destination/PlaceWorld";
import PlacePractical from "@/components/destination/PlacePractical";
import PlaceDecision from "@/components/destination/PlaceDecision";
import HotelModule from "@/components/destination/HotelModule";
import PlaceInAtlas, { type MiniNode } from "@/components/destination/PlaceInAtlas";
import YearScene from "@/components/destination/YearScene";
import KeepExploring, { type ExploreSection } from "@/components/destination/KeepExploring";
import { capitalize } from "@/components/destination/place-state";
import { getClimateRecord } from "@/data/climate/nasa-canonical";
import {
  buildMonthRows,
  canonicalWindowLabel,
  defaultMonth,
} from "@/components/besttime/besttime-state";
import {
  haversineKm,
  monthNormals,
  nearbyDestinations,
  projectWorldPoint,
} from "@/lib/inner-state";

/**
 * Destination Detail — DESTINATION 2.0 PHASE 1（SPEC v1 §9/§10）。
 *
 * Destination = INTERACTIVE TRAVEL WORLD（3.0：SCENE > UI / MOVEMENT > TEXT）。
 * 全页暗色沉浸世界，三个可玩场景：
 *   SCENE 01 ARRIVAL — 100svh 满出血图像 + city 巨字 + 唯一实时状态行
 *     （Hero + NOW + breadcrumb 合并；NOW 四格与地图已按 SPEC §5 REMOVE）。
 *   SCENE 02 THE LENS — 可拖拽放大透镜（×1.9）游走真实照片；章节 = LENS
 *     WAYPOINT（确定性视觉锚点，非地理坐标）；vibe = 镜环 tint + 列表过滤
 *     （诚实双职）。自由拖拽优先于 waypoint。
 *   SCENE 03 THE YEAR — TIME AS PLACE STATE：ClimateYear moment + 拖拽 scrub，
 *     月份/轨迹/读数/场景氛围 tint（季节色 × tier）同步变化。
 *   之后为后续内容区（About 折叠 / Keep Exploring / Practical / Budget /
 *   Stay / CTA / FAQ），Phase 2 再重构为 Scene 04/05。
 *
 * 数据诚信：
 *   · 气候权威 = canonical bestMonthsBaseline / R-tier（GO IN 宣言同源，无新算法）。
 *   · 温度唯一 live 来源 /api/weather（Open-Meteo 签名校验，mock 回退降级为
 *     CLIMATE NORMAL 标注）—— 不展示哈希天气。
 *   · vibe 只作用于有真实 tag 的内容；highlights 无 tag，不做伪造过滤。
 *   · gateway = Haversine 真实距离（不再使用同 region 冒名 nearby）。
 *
 * 默认 Server Component（SSG, dynamicParams=false）；client 岛：ArrivalState /
 * KeepExploring / YearScene / FaqList(<details> 原生)。
 */

const SITE_URL = "https://www.utripla.xyz";
const CONTAINER = "mx-auto w-full max-w-7xl px-4 md:px-6";

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

/**
 * FAQ 单一真相源：页面可见 FAQ 与 FAQPage schema 由同一数组产生，
 * 保证结构化数据与可见内容严格一致（既保留既有 schema，又不产生无可见内容的问答）。
 */
function buildDestinationFaqs(dest: Destination): { question: string; answer: string }[] {
  const totalBudget = dest.budgetPerDay * dest.recommendedDays;
  return [
    {
      question: `What is the best time to visit ${dest.city}?`,
      answer: `The best months to visit ${dest.city} are ${dest.bestMonths}. ${dest.bestSeason} Plan your trip around these months for the most favorable weather and crowd levels.`,
    },
    {
      question: `How many days do you need in ${dest.city}?`,
      answer: `We recommend staying ${dest.recommendedDays} ${dest.recommendedDays === 1 ? "day" : "days"} in ${dest.city} to cover the main attractions at a relaxed pace. Visiting during ${dest.bestMonths} gives you the best weather for that duration.`,
    },
    {
      question: `How much does ${dest.city} cost per day?`,
      answer: `Estimated daily cost in ${dest.city} is ${dest.budgetPerDay.toLocaleString()} ${dest.budgetCurrency}, covering accommodation, food, local transport, and activities. For the recommended ${dest.recommendedDays}-day stay, plan around ${totalBudget.toLocaleString()} ${dest.budgetCurrency} per person. International flights are not included.`,
    },
  ];
}

function buildFaqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

// ── Helpers ───────────────────────────────────────────────────────────

/**
 * Related destinations：同 region 优先，不足 3 个时以其它 region 补齐。
 * 行为与既有实现一致（未改变内链结果）。
 */
/**
 * Planner 深链接。当前 /plan 路由**不支持** destination prefilled，
 * 因此沿用项目既有机制（Home hero-search 预填），带入 destination context：
 * to / travelStyle / interests —— 与 Guide 的 buildPlannerHref 输出同形。
 */
function buildPlacePlannerHref(dest: Destination): string {
  const params = new URLSearchParams();
  params.set("to", dest.city);
  params.set("travelStyle", dest.travelStyle);
  if (dest.interests.length > 0) params.set("interests", dest.interests.join(","));
  return `/?${params.toString()}#hero-search`;
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

  const faqs = buildDestinationFaqs(dest);
  const planHref = buildPlacePlannerHref(dest);

  const popularTrips = TRIPS.filter(
    (t) => t.city.toLowerCase() === dest.city.toLowerCase(),
  ).slice(0, 5);
  const cityGuides = getGuidesForCity(dest.city).slice(0, 4);

  const totalBudget = dest.budgetPerDay * dest.recommendedDays;

  const practicalRows = [
    { label: "Currency", value: dest.currency },
    { label: "Time zone", value: dest.timezone },
    { label: "Airport", value: `${dest.airport.iata} · ${dest.airport.city}` },
    {
      label: "Typical stay",
      value: `${dest.recommendedDays} ${dest.recommendedDays === 1 ? "day" : "days"}`,
    },
    {
      label: "Daily budget",
      value: `${dest.budgetPerDay.toLocaleString()} ${dest.budgetCurrency}`,
    },
    { label: "Travel style", value: capitalize(dest.travelStyle) },
    { label: "Region", value: dest.region },
  ];

  // ── Climate authority：canonical record（与 Best-time 页同一数据链） ──────
  const climateRecord = getClimateRecord(dest.slug);
  const climateRows = buildMonthRows(dest);
  const climateInitialMonth = defaultMonth(dest);
  const normals = monthNormals(climateRecord);

  // GO IN 宣言（Scene 03 主角）：只由 canonical baseline / Challenging tier 派生
  const goLabel = canonicalWindowLabel(climateRecord.bestMonthsBaseline);
  const avoidShorts = climateRows
    .filter((r) => r.verdict === "avoid")
    .map((r) => r.short);
  const goStatement = goLabel
    ? `Go in ${goLabel}`
    : avoidShorts.length > 0
      ? `Avoid ${avoidShorts.join(" · ")}`
      : "Flexible year-round";

  // ── THE ATLAS：mini world 节点 + 真实最近网关（Haversine） ──────────────
  const gateways = nearbyDestinations(dest, DESTINATIONS, 3);
  const atlasMiniNodes: { slug: string; city: string; x: number; y: number }[] = DESTINATIONS.map((d) => {
    const p = projectWorldPoint(d.airport.latitude, d.airport.longitude);
    return { slug: d.slug, city: d.city, x: p.x, y: p.y };
  });
  const atlasNearest: MiniNode[] = gateways.map((d) => {
    const p = projectWorldPoint(d.airport.latitude, d.airport.longitude);
    return {
      slug: d.slug,
      city: d.city,
      x: p.x,
      y: p.y,
      km: Math.round(
        haversineKm(dest.airport.latitude, dest.airport.longitude, d.airport.latitude, d.airport.longitude),
      ),
    };
  });

  // ── Keep Exploring：三组真实条目（vibe 经真实 tags 过滤） ────────────────
  const keepSections: ExploreSection[] = [];
  if (cityGuides.length > 0) {
    keepSections.push({
      key: "guides",
      title: `${dest.city} field guides`,
      eyebrow: "Prepare",
      items: cityGuides.map((g) => ({
        href: `/guides/${g.slug}`,
        title: g.title,
        meta: g.readTime,
        description: g.excerpt,
        tags: g.tags as string[],
      })),
    });
  }
  if (popularTrips.length > 0) {
    keepSections.push({
      key: "routes",
      title: `Routes through ${dest.city}`,
      eyebrow: "Journey",
      items: popularTrips.map((t) => ({
        href: `/trips/${t.slug}`,
        title: t.title,
        meta: `${t.days} days · ${t.budget.toLocaleString()} ${t.currency}`,
        description: t.excerpt,
        tags: t.interests as string[],
      })),
    });
  }
  if (gateways.length > 0) {
    keepSections.push({
      key: "gateways",
      title: "Next gateways",
      eyebrow: "Discover",
      items: gateways.map((d) => ({
        href: `/destinations/${d.slug}`,
        title: d.city,
        meta: `${Math.round(
          haversineKm(
            dest.airport.latitude,
            dest.airport.longitude,
            d.airport.latitude,
            d.airport.longitude,
          ),
        )} km away`,
        description: d.description,
        tags: d.interests as string[],
      })),
    });
  }


  return (
    <article className="ut-world">
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildFaqJsonLd(faqs)),
          }}
        />

        {/* ═══ SCENE 01 — THE PLACE（活天空 + 时间拖拽 + 视差 + 环境边缘 UI） ═══ */}
        <PlaceWorld
          dest={dest}
          normals={normals}
          currentMonthPrecipMm={climateRows[new Date().getMonth()]?.precipMm ?? 0}
          timeScrubber={false}
        />

        {/* ═══ SCENE 02 — THE YEAR（NASA 气候时间场；Detail 只呈现该地一年） ═══ */}
        <YearScene
          city={dest.city}
          rows={climateRows}
          initialMonth={climateInitialMonth}
          goStatement={goStatement}
          guideHref={`/best-time-to-visit/${dest.slug}`}
        />

        {/* ═══ SCENE 03 — THE ATLAS（全球位置 + 真实最近节点） ═══ */}
        <section aria-labelledby="atlas-heading" className="pt-16 md:pt-20">
          <div className={CONTAINER}>
            <h2
              id="atlas-heading"
              className="font-mono text-micro uppercase tracking-[0.18em] text-white/50"
            >
              In the world atlas
            </h2>
            <div className="mt-8">
              <PlaceInAtlas city={dest.city} nodes={atlasMiniNodes} nearest={atlasNearest} />
            </div>
          </div>
        </section>

        {/* ═══ ARCHIVE（降级后的附录层：内容保留 for SEO，层级低于三个场景） ═══ */}
        <div className="relative z-10 -mt-8 rounded-t-[1.25rem] bg-ut-bg pb-16 pt-8 shadow-[0_-16px_48px_rgba(5,8,14,0.45)]">
        <div className={`${CONTAINER}`}>
          <p className="mb-8 flex items-center gap-3 font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-ut-subtle">
            <span aria-hidden="true" className="h-px flex-1 bg-ut-border" />
            Utripla archive — reference material
            <span aria-hidden="true" className="h-px flex-1 bg-ut-border" />
          </p>
          {/* ABOUT — 全折叠（SEO 文本完整在 DOM；不再是视觉主角） */}
          <details className="group mb-12 max-w-3xl">
            <summary className="inline-flex min-h-[44px] cursor-pointer list-none items-center font-mono text-label uppercase tracking-[0.16em] text-ut-muted transition-colors duration-[var(--ut-dur-fast)] hover:text-ut-text motion-reduce:transition-none [&::-webkit-details-marker]:hidden">
              <span aria-hidden="true" className="mr-2 inline-block transition-transform duration-[var(--ut-dur-fast)] group-open:rotate-90 motion-reduce:transition-none">
                →
              </span>
              About {dest.city}
            </summary>
            <p className="mt-3 max-w-[62ch] text-body leading-[1.6] text-ut-text-2">
              {dest.longDescription}
            </p>
            <p className="mt-4 font-mono text-label uppercase tracking-[0.16em] text-ut-muted">
              {capitalize(dest.travelStyle)} ·{" "}
              {dest.interests.map(capitalize).join(" · ")}
            </p>
          </details>

          {/* KEEP EXPLORING — guides / routes / nearby（vibe 真实过滤） */}
          <InnerSection title="Keep exploring" eyebrow="Next">
            <KeepExploring sections={keepSections} />
          </InnerSection>

          {/* Practical / Instrument Surface */}
          <InnerSection title="Practical planning info" eyebrow="Before you go">
            <PlacePractical rows={practicalRows} />
          </InnerSection>

          {/* Budget — compact decision context → deep dive */}
          <InnerSection title="Budget information" eyebrow="Money">
            <PlaceDecision
              index="02"
              eyebrow="Daily range"
              headline={`${dest.budgetPerDay.toLocaleString()} ${dest.budgetCurrency} per day`}
              body={
                <p>
                  Estimated daily cost covering accommodation, food, local
                  transport and activities for {dest.city}. International
                  flights are not included.
                </p>
              }
              lines={[
                {
                  label: "Typical stay",
                  value: `${dest.recommendedDays} ${dest.recommendedDays === 1 ? "day" : "days"}`,
                },
                {
                  label: "Trip estimate",
                  value: `${totalBudget.toLocaleString()} ${dest.budgetCurrency}`,
                },
              ]}
              href={`/travel-budget/${dest.slug}`}
              linkLabel={`See the full budget guide for ${dest.city}`}
            />
          </InnerSection>

          {/* Commerce — 全页唯一商业模块 */}
          <div className="mb-12">
            <HotelModule city={dest.city} />
          </div>

          {/* Single Page-level Primary CTA */}
          <InnerCTA
            href={planHref}
            title={`Ready to plan your ${dest.city} trip?`}
            description={`Use this page as your starting point — the planner opens with ${dest.city} prefilled around your dates and interests.`}
            label={`Build your ${dest.city} plan`}
          />

          {/* FAQ — 与 FAQPage schema 同一数据源 */}
          <InnerSection title="Frequently asked questions" eyebrow="FAQ">
            <div className="max-w-3xl">
              <FaqList items={faqs} />
            </div>
          </InnerSection>
        </div>
        </div>
      </article>
  );
}

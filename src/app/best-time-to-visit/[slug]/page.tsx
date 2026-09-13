import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getDestinationBySlug,
  getDestinationSlugs,
  type Destination,
} from "@/data/destinations";
import { TRIPS } from "@/data/trips";
import { getGuidesForCity } from "@/data/guides";
import InnerBreadcrumb from "@/components/inner/InnerBreadcrumb";
import InnerSection from "@/components/inner/InnerSection";
import EditorialIndex from "@/components/inner/EditorialIndex";
import InnerCTA from "@/components/inner/InnerCTA";
import FaqList from "@/components/inner/FaqList";
import PlacePractical from "@/components/destination/PlacePractical";
import { capitalize } from "@/components/destination/place-state";
import SeasonAtmosphere from "@/components/besttime/SeasonAtmosphere";
import ClimateHero from "@/components/besttime/ClimateHero";
import MonthSelector from "@/components/besttime/MonthSelector";
import ClimateTable from "@/components/besttime/ClimateTable";
import SeasonSummary from "@/components/besttime/SeasonSummary";
import RecommendationModule from "@/components/besttime/RecommendationModule";
import type { Signal } from "@/components/besttime/DecisionSignals";
import {
  buildDecisionReadout,
  buildMonthRows,
  canonicalWindowLabel,
  defaultMonth,
  seasonLabel,
  summarizeSeasons,
  type DecisionReadout,
  type MonthRow,
} from "@/components/besttime/besttime-state";
import {
  assertCanonicalCoverage,
  CLIMATE_ARTIFACT_VERSION,
  CLIMATE_ATTRIBUTION_LINE,
  getClimateRecord,
} from "@/data/climate/nasa-canonical";

/**
 * Best Time To Visit — DECISION SUPPORT EXPERIENCE（第四阶段）。
 *
 * Product Role 四分（与既有模板互不重叠）：
 *   Guide       = Editorial Experience（**阅读**）
 *   Destination = Place Experience（**抵达**）
 *   Trip        = Journey Experience（**移动**）
 *   Best-time   = Decision Support（**决定何时去**）
 *
 * 本页必须回答的问题（且只回答这些问题）：
 *   什么时候去 / 为什么 / 天气如何 / 旺季还是淡季 / 哪几个月适合某种旅行方式 /
 *   要避开什么 / 最终选哪个月。
 * 它**不是** Destination 的复制、不是气候博客、不是 SaaS dashboard、不是卡片墙。
 *
 * 信息关系（不是章节关系）：
 *   Decision Hero（Breadcrumb → 决策 eyebrow → H1 → context → best-month signal → 气候读数）
 *   → Recommendation（决定 + 为什么）
 *   → MonthSelector（Selected Month 状态：读单月）
 *   → ClimateTable（**Primary Data Object**）
 *   → SeasonSummary（季节叙述）
 *   → Trip shape（真实实用字段）
 *   → FAQ（与 FAQPage schema 同一数据源）
 *   → 唯一 Primary CTA → Related（编辑式索引）
 *
 * ── 数据来源（NASA POWER PRIMARY MIGRATION）──────────────────────────
 * Best-time 的气候权威是 production canonical dataset：
 *   NASA POWER (NASA Langley Research Center) 145 anchors / 1991–2020 / UTC
 *   → v8.7 normalize / aggregate / validate pipeline（internal-data-freeze-v87）
 *   → src/data/climate/nasa-power-canonical-v1.json（version-locked artifact）
 *   → 本页 SSG。
 * 温度 / 降水 / 降水日数 = NASA POWER climate normals（%d 月值，1991–2020 均值）；
 * verdict = R1–R7 tier；Best Months = canonical bestMonthsBaseline；
 * daylightHours = 天文计算（非 NASA 数据）；sunshineHours = 合法 null。
 * 旧的纬度→气候带→定性模板（climate-pattern 气候函数）已从权威链路移除。
 * 缺失 canonical 记录 → build FAIL，绝不回退模板。
 *
 * 相对旧实现的内容质量修正：
 *   1) 删除 legacy 蓝色系（blue/indigo/emerald/rose）与 SaaS 卡片墙：全面改用 --ut-* token。
 *   2) 删除与 Home hero-search 不匹配的"AI planner"渐变区块：改为文末唯一语境 CTA。
 *   3) 纬度派生的定性气候已被 NASA POWER 实测 normals 取代（migration 后）。
 *   4) 旧实现有 FAQPage schema 但页面上**没有**可见 FAQ；现在可见 FAQ 与 schema 同源。
 *   5) 旧 BreadcrumbList 第 2 项名为 "Best Time To Visit" 却指向 /destinations；现修正为
 *      /best-time-to-visit（该 hub 真实存在并已在 sitemap 中）且与可见面包屑一致。
 *
 * 默认 Server Component；唯一 client 组件是 MonthSelector（Selected Month 状态）。
 * 无图片 hero、无 WebGL / canvas / 视频 / 广告、无 Hotel / Flight affiliate。
 */

const SITE_URL = "https://www.utripla.xyz";
const CONTAINER = "mx-auto w-full max-w-7xl px-4 md:px-6";

// ── Static params ─────────────────────────────────────────────────────

// 仅允许 generateStaticParams 返回的 slug 被渲染；其余在路由层 404，
// 避免 notFound() 被静默吞掉后返回 200。
export const dynamicParams = false;

export function generateStaticParams() {
  const slugs = getDestinationSlugs();
  // NASA POWER PRIMARY MIGRATION gate：canonical 必须覆盖全部 destination，
  // 任何缺失 → build FAIL（禁止部分数据集 / 禁止回退纬度模板）。
  assertCanonicalCoverage(slugs);
  return slugs.map((slug) => ({ slug }));
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
  // Phase 6.4 + NASA migration: title 目标 50-60 chars（含 " | tripla"）。
  // Best Months 现在来自 canonical bestMonthsBaseline（R1–R7 派生）。
  const windowLabel = canonicalWindowLabel(getClimateRecord(dest.slug).bestMonthsBaseline);
  const windowText = windowLabel || "Year-round";
  const title = `Best Time To Visit ${dest.city} · ${windowText} Travel Guide`;
  const description = buildBestTimeMetaDescription(dest);
  return {
    title,
    description,
    alternates: { canonical: `/best-time-to-visit/${dest.slug}` },
    robots: { index: true, follow: true },
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

/**
 * Phase 6.4: 构造 140-160 char 的 meta description。
 * 组合 dest.bestSeason（真实季节说明）+ 天气数据，按需截断。
 */
function buildBestTimeMetaDescription(dest: Destination): string {
  const suffix = ` Plan your trip to ${dest.city}, ${dest.country}.`;
  const weatherPrefix = `Weather: ${dest.weatherScore.label}. `;
  const maxSeason = 160 - suffix.length - weatherPrefix.length;
  let season = dest.bestSeason;
  if (season.length > maxSeason) {
    season = season.slice(0, Math.max(0, maxSeason - 1)).trimEnd() + "…";
  }
  return season + " " + weatherPrefix + suffix.trim();
}

// ── JSON-LD（结构与字段保持既有实现；仅修正面包屑指向与 FAQ 同源）──────

function buildArticleJsonLd(dest: Destination) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Best Time To Visit ${dest.city}`,
    description: `Monthly climate patterns and seasonal travel advice for ${dest.city}, ${dest.country}.`,
    url: `${SITE_URL}/best-time-to-visit/${dest.slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/best-time-to-visit/${dest.slug}`,
    },
    author: {
      "@type": "Organization",
      name: "tripla",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "tripla",
      url: SITE_URL,
    },
    datePublished: dest.publishedAt,
    dateModified: dest.updatedAt,
    about: {
      "@type": "TouristDestination",
      name: dest.city,
      address: {
        "@type": "PostalAddress",
        addressLocality: dest.city,
        addressCountry: dest.country,
      },
    },
  };
}

/**
 * 面包屑 schema 与页面可见面包屑严格一致：
 * Home → Best time to visit（/best-time-to-visit，真实存在的 hub）→ {city}。
 * 旧实现的第 2 项名称与目标 URL 不匹配（"Best Time To Visit" 指向 /destinations），此处修正。
 */
function buildBreadcrumbJsonLd(dest: Destination) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Best time to visit",
        item: `${SITE_URL}/best-time-to-visit`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: dest.city,
        item: `${SITE_URL}/best-time-to-visit/${dest.slug}`,
      },
    ],
  };
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
 * FAQ 单一真相源：页面可见 FAQ 与 FAQPage schema 由同一数组产生。
 * Best Months / verdict 均来自 production canonical（NASA POWER + R1–R7）；
 * bestSeason / weatherScore / recommendedDays 是 destination 的真实编辑字段。
 */
function buildBestTimeFaqs(
  dest: Destination,
  rows: MonthRow[],
  readout: DecisionReadout,
): { question: string; answer: string }[] {
  const avoidNames = rows
    .filter((r) => r.verdict === "avoid")
    .map((r) => r.name);
  const windowText = readout.window.label || "the whole year";
  const faqs: { question: string; answer: string }[] = [
    {
      question: `What are the best months to visit ${dest.city}?`,
      answer: `The best months to visit ${dest.city} are ${windowText}, based on the R1–R7 classification of NASA POWER 1991–2020 climate normals. ${dest.bestSeason}`,
    },
    {
      question: `What is the weather like in ${dest.city}?`,
      answer: `${dest.city} is rated ${dest.weatherScore.label} for climate, with a score of ${dest.weatherScore.overall}/100. ${dest.weatherScore.recommendation}`,
    },
  ];
  if (avoidNames.length > 0) {
    faqs.push({
      question: `Which months should I avoid in ${dest.city}?`,
      answer: `On the R1–R7 classification of NASA POWER climate normals, ${avoidNames.join(", ")} ${
        avoidNames.length === 1 ? "is the least favourable month" : "are the least favourable months"
      } in ${dest.city}. This is a historical climate pattern rather than a forecast; the recommended window remains ${windowText}.`,
    });
  }
  faqs.push({
    question: `How many days do you need in ${dest.city}?`,
    answer: `We recommend ${dest.recommendedDays} ${
      dest.recommendedDays === 1 ? "day" : "days"
    } in ${dest.city}, ideally placed inside the recommended window of ${windowText}.`,
  });
  return faqs;
}

/**
 * Planner 深链接。当前 /plan 路由**不支持** destination 预填，因此沿用项目既有机制
 * （Home hero-search 预填：#hero-search 读取 to / travelStyle / interests /
 * departureDate / returnDate）。本页**不**注入具体日期 —— 真实数据里只有"月份窗口"，
 * 没有年份，注入一个编造的具体日期会制造假精度。
 */
function buildBestTimePlannerHref(dest: Destination): string {
  const params = new URLSearchParams();
  params.set("to", dest.city);
  params.set("travelStyle", dest.travelStyle);
  if (dest.interests.length > 0) params.set("interests", dest.interests.join(","));
  return `/?${params.toString()}#hero-search`;
}

// ── Page ──────────────────────────────────────────────────────────────

export default async function BestTimeToVisitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dest = getDestinationBySlug(slug);
  if (!dest) notFound();

  // ── 双信号读数（全部来自真实字段 + 已标注的派生层）──────────────────
  const rows = buildMonthRows(dest);
  const readout = buildDecisionReadout(dest, rows);
  const win = readout.window;
  const seasons = summarizeSeasons(dest, rows);
  const initialMonth = defaultMonth(dest);
  const planHref = buildBestTimePlannerHref(dest);
  const faqs = buildBestTimeFaqs(dest, rows, readout);

  // 首屏紧凑读数带：canonical 派生读数标注数据来源，编辑字段标注 Real field。
  const signals: Signal[] = [
    {
      label: "Recommended window",
      value:
        win.count > 0
          ? `${win.count} ${win.count === 1 ? "month" : "months"}`
          : "Year-round viable",
      basis: "Canonical best months",
    },
    { label: "Climate zone", value: readout.zone, basis: "NASA POWER normals" },
    ...(win.dominantSeason
      ? [
          {
            label: "Dominant season",
            value: seasonLabel(win.dominantSeason),
            basis: "Derived",
          },
        ]
      : []),
    {
      label: "Climate score",
      value: `${dest.weatherScore.label} · ${dest.weatherScore.overall}/100`,
      basis: "Real field",
    },
    ...(readout.avoidMonths.length > 0
      ? [
          {
            label: "Least favourable",
            value: `${readout.avoidMonths.length} ${
              readout.avoidMonths.length === 1 ? "month" : "months"
            }`,
            basis: "R1–R7 classification",
          },
        ]
      : []),
    {
      label: "Typical stay",
      value: `${dest.recommendedDays} ${
        dest.recommendedDays === 1 ? "day" : "days"
      }`,
      basis: "Real field",
    },
  ];

  // ── Related（与既有内链级联同一套数据，不改动其来源）───────────────
  const cityGuides = getGuidesForCity(dest.city).slice(0, 4);
  const cityTrips = TRIPS.filter(
    (t) => t.city.toLowerCase() === dest.city.toLowerCase(),
  ).slice(0, 3);

  const practicalRows = [
    {
      label: "Typical stay",
      value: `${dest.recommendedDays} ${
        dest.recommendedDays === 1 ? "day" : "days"
      }`,
    },
    {
      label: "Daily budget",
      value: `${dest.budgetPerDay.toLocaleString()} ${dest.budgetCurrency}`,
    },
    { label: "Currency", value: dest.currency },
    { label: "Time zone", value: dest.timezone },
    { label: "Airport", value: `${dest.airport.iata} · ${dest.airport.city}` },
    { label: "Travel style", value: capitalize(dest.travelStyle) },
    { label: "Region", value: dest.region },
  ];

  const nextStepItems = [
    {
      href: `/destinations/${dest.slug}`,
      title: `${dest.city} destination guide`,
      meta: "Place",
      description: dest.description,
    },
    {
      href: `/travel-budget/${dest.slug}`,
      title: `${dest.city} budget guide`,
      meta: `${dest.budgetPerDay.toLocaleString()} ${dest.budgetCurrency}/day`,
      description: `Daily costs and a trip estimate for ${dest.city}, built around a ${dest.recommendedDays}-day stay.`,
    },
  ];

  const guideItems = cityGuides.map((g) => ({
    href: `/guides/${g.slug}`,
    title: g.title,
    meta: g.readTime,
    description: g.excerpt,
  }));

  const tripItems = cityTrips.map((t) => ({
    href: `/trips/${t.slug}`,
    title: t.title,
    meta: `${t.days} days · ${t.budget.toLocaleString()} ${t.currency}`,
    description: t.excerpt,
  }));

  return (
    <SeasonAtmosphere season={win.dominantSeason}>
      <article className="pb-20 pt-6 sm:pt-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildArticleJsonLd(dest)) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(dest)) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd(faqs)) }}
        />

        {/* Quiet breadcrumb */}
        <div className={CONTAINER}>
          <InnerBreadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Best time to visit", href: "/best-time-to-visit" },
              { label: dest.city },
            ]}
          />
        </div>

        {/* Decision Hero（首屏：eyebrow + H1 + context + best-month signal + 气候读数） */}
        <div className={`${CONTAINER} mt-6 sm:mt-8`}>
          <ClimateHero
            dest={dest}
            window={win}
            zone={readout.zone}
            hemisphere={readout.hemisphere}
            signals={signals}
          />
        </div>

        <div className={`${CONTAINER} mt-12 sm:mt-14`}>
          {/* 决定 + 为什么（真实窗口 × 派生模式的合成，逐条给出依据） */}
          <InnerSection title="When to go" eyebrow="Recommendation">
            <RecommendationModule dest={dest} rows={rows} readout={readout} />
          </InnerSection>

          {/* Selected Month 状态：读单个月（唯一 client 交互；不改变结构） */}
          <InnerSection title="Read a single month" eyebrow="Month by month">
            <MonthSelector
              rows={rows}
              initialMonth={initialMonth}
              city={dest.city}
            />
          </InnerSection>

          {/* Primary Data Object：语义表格，移动端 contained 横向滚动且不删列 */}
          <InnerSection title="All twelve months" eyebrow="The data">
            <ClimateTable rows={rows} city={dest.city} country={dest.country} />
          </InnerSection>

          {/* 季节叙述（编辑式 + 数据，不是四张卡片） */}
          <InnerSection title="Season by season" eyebrow="Seasons">
            <SeasonSummary seasons={seasons} window={win} city={dest.city} />
          </InnerSection>

          {/* Trip shape：仅真实字段构成的仪器面（决定"去多久 / 花多少"） */}
          <InnerSection title="Trip shape" eyebrow="Practical">
            <PlacePractical rows={practicalRows} />
          </InnerSection>

          {/* FAQ —— 与 FAQPage schema 同一数据源 */}
          <InnerSection title="Frequently asked questions" eyebrow="FAQ">
            <div className="max-w-3xl">
              <FaqList items={faqs} />
            </div>
          </InnerSection>

          {/* 全页唯一 Primary CTA（语境化，位于推荐之后） */}
          <InnerCTA
            href={planHref}
            title={`Plan a ${rows.find((r) => r.index === initialMonth)?.name ?? ""} trip to ${dest.city}`}
            description={`The recommended window is ${win.label || "the whole year"}. The planner opens with ${dest.city} prefilled — set your dates inside that window and build the route around it.`}
            label={`Plan a ${dest.city} trip`}
          />

          {/* Related — 编辑式索引（Destination / Budget / Guide / Trip） */}
          <InnerSection title="Plan around this window" eyebrow="Next steps">
            <EditorialIndex items={nextStepItems} />
          </InnerSection>

          {guideItems.length > 0 && (
            <InnerSection title={`Guides for ${dest.city}`} eyebrow="Reading">
              <EditorialIndex items={guideItems} />
            </InnerSection>
          )}

          {tripItems.length > 0 && (
            <InnerSection title={`Trips in ${dest.city}`} eyebrow="Routes">
              <EditorialIndex items={tripItems} />
            </InnerSection>
          )}

          {/* NASA POWER attribution（compliance v2 要求的事实性来源标注） */}
          <p className="mt-12 max-w-[72ch] font-mono text-micro uppercase leading-[1.8] tracking-[0.16em] text-ut-subtle">
            {CLIMATE_ATTRIBUTION_LINE} · dataset{" "}
            {CLIMATE_ARTIFACT_VERSION}
          </p>
        </div>
      </article>
    </SeasonAtmosphere>
  );
}

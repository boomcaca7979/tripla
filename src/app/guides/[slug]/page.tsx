import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getGuideBySlug,
  getGuideSlugs,
  buildPlannerHref,
  type Guide,
} from "@/data/guides";
import { DESTINATIONS, type Destination } from "@/data/destinations";
import ReadingProgress from "@/components/inner/ReadingProgress";
import InnerBreadcrumb from "@/components/inner/InnerBreadcrumb";
import InnerSection from "@/components/inner/InnerSection";
import EditorialIndex from "@/components/inner/EditorialIndex";
import InnerCTA from "@/components/inner/InnerCTA";
import Timeline from "@/components/inner/Timeline";
import FaqList from "@/components/inner/FaqList";
import PracticalInfo from "@/components/inner/PracticalInfo";
import GuideHero from "@/components/guides/GuideHero";
import WorkspaceActions from "@/components/destination/trip/WorkspaceActions";
import GuideQuickFacts from "@/components/guides/GuideQuickFacts";
import GuideContents from "@/components/guides/GuideContents";
import {
  resolveGuideDestination,
  guideKind,
  guideQuickFacts,
  guideToc,
  relatedGuidesFor,
  relatedTripsFor,
  destinationLinks,
  ITINERARY_ANCHOR,
} from "@/lib/guide-detail";

const SITE_URL = "https://www.utripla.xyz";

// ── Static params ─────────────────────────────────────────────────────

// 仅渲染 generateStaticParams 返回的 slug；其余 404。
export const dynamicParams = false;

export function generateStaticParams() {
  return getGuideSlugs().map((slug) => ({ slug }));
}

// ── Per-page metadata ─────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return { title: "Guide not found" };
  // layout.tsx 的 title.template = "%s | tripla" 会自动追加站点名。
  // seoTitle 在数据层已控制 ≤52 字符；metaDescription 已控制在 140-160 字符。
  const title = guide.seoTitle;
  const description = guide.metaDescription;
  // 有真实 destination 图片时用该图，否则沿用站点 OG 图（不生成新图）。
  const image = resolveGuideDestination(guide)?.image ?? "/og-image.png";
  return {
    title,
    description,
    alternates: {
      canonical: `/guides/${guide.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: guide.publishedAt,
      modifiedTime: guide.updatedAt,
      tags: guide.tags,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

// ── JSON-LD structured data ───────────────────────────────────────────

/**
 * Article schema。
 * 注意：数据层的 `guide.author` 是虚构 persona（"fake author expertise"），
 * 因此不输出 Person author —— author 使用站点主体 Organization（真实）。
 */
function buildArticleJsonLd(guide: Guide) {
  const rawImage = resolveGuideDestination(guide)?.image ?? "/og-image.png";
  const image = rawImage.startsWith("http") ? rawImage : `${SITE_URL}${rawImage}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.seoTitle,
    description: guide.metaDescription,
    url: `${SITE_URL}/guides/${guide.slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/guides/${guide.slug}`,
    },
    image: [image],
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    author: {
      "@type": "Organization",
      name: "tripla",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "tripla",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo-icon.svg`,
      },
    },
    articleSection: guide.tags,
  };
}

/** 与页面可见 breadcrumb 严格一致（4 级，末项为当前页）。 */
function buildBreadcrumbJsonLd(guide: Guide, destination: Destination | null) {
  const cityItem = destination
    ? {
        "@type": "ListItem",
        position: 3,
        name: guide.city,
        // 城市唯一页规则：城市项指向唯一的正式城市内页。
        item: `${SITE_URL}/destinations/${destination.slug}`,
      }
    : { "@type": "ListItem", position: 3, name: guide.city, item: `${SITE_URL}/guides` };
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
      cityItem,
      {
        "@type": "ListItem",
        position: 4,
        name: guide.title,
        item: `${SITE_URL}/guides/${guide.slug}`,
      },
    ],
  };
}

/** FAQPage schema：仅当页面可见 FAQ 存在时输出，与页面内容一致。 */
function buildFaqJsonLd(guide: Guide) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

// ── Helpers ───────────────────────────────────────────────────────────

/**
 * 确定性日期格式化（server-only）。不使用 new Date() 渲染，规避 #418 hydration 回归：
 * 直接按 ISO "YYYY-MM-DD" 解析，避免时区漂移，输出与旧实现一致（"September 10, 2026"）。
 */
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d || m < 1 || m > 12) return iso;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

// ── Page ──────────────────────────────────────────────────────────────

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const planHref = buildPlannerHref(guide.planner);
  const destination = resolveGuideDestination(guide);
  const kind = guideKind(guide);
  const quickFacts = guideQuickFacts(guide, destination);
  const toc = guideToc(guide);

  // Related guides：可解释的规则排序（显式关联 > 同城 > 共享 tag > 同 region），非随机。
  const relatedGuides = relatedGuidesFor(guide, 6);
  const relatedGuideItems = relatedGuides.map((g) => ({
    href: `/guides/${g.slug}`,
    title: g.title,
    meta: `${g.city} · ${g.readTime}`,
    description: g.excerpt,
  }));

  // Related destinations：显式声明的真实关联，排除已在 Plan 区块出现的主体目的地。
  const otherDestinations = guide.relatedDestinationSlugs
    .map((s) => DESTINATIONS.find((d) => d.slug === s))
    .filter((d): d is NonNullable<typeof d> => Boolean(d))
    .filter((d) => d.slug !== destination?.slug)
    .slice(0, 3);
  const relatedDestinationItems = otherDestinations.map((d) => ({
    href: `/destinations/${d.slug}`,
    title: d.city,
    meta: d.country,
  }));

  // Related trips：只取真实 TRIPS（显式关联优先，同城补齐）。
  const relatedTripItems = relatedTripsFor(guide, 3).map((t) => ({
    href: `/trips/${t.slug}`,
    title: t.title,
    meta: `${t.days} days · ${t.budget.toLocaleString("en-US")} ${t.currency}`,
  }));

  const planLinks = destinationLinks(destination).map((l) => ({
    href: l.href,
    title: l.label,
    meta: l.meta,
  }));

  const dates =
    guide.planner.departureDate && guide.planner.returnDate
      ? `${formatDate(guide.planner.departureDate)} → ${formatDate(guide.planner.returnDate)}`
      : guide.planner.departureDate
        ? formatDate(guide.planner.departureDate)
        : null;

  return (
    <article className="pb-20 pt-8 sm:pt-12">
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildArticleJsonLd(guide)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbJsonLd(guide, destination)),
        }}
      />
      {guide.faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd(guide)) }}
        />
      )}

      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb（末项为当前 guide；城市项指向唯一的 /destinations/<slug> 内页） */}
        <InnerBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Guides", href: "/guides" },
            destination
              ? { label: guide.city, href: `/destinations/${destination.slug}` }
              : { label: guide.city, href: "/guides" },
            { label: guide.title },
          ]}
        />

        {/* Hero：destination 图片（或 gradient）+ 标题 + 定位 + 主 CTA */}
        <div className="mt-6">
          <GuideHero
            guide={guide}
            destination={destination}
            kind={kind}
            planHref={planHref}
            updatedLabel={formatDate(guide.updatedAt)}
          />
        </div>

        {/* Quick facts：destination / duration / timing / style / budget（仅有真实数据时） */}
        <GuideQuickFacts facts={quickFacts} />

        {/* 工作区接入（最小 UI，蓝图 #10）：Save guide / Add to Trip */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <WorkspaceActions
            kind="guide"
            title={guide.title}
            city={guide.city}
            source={`Guide · ${guide.city}`}
            sourceUrl={`/guides/${guide.slug}`}
          />
        </div>

        {/* Guide overview：真实引言（不改写） */}
        <section className="mb-10 max-w-[68ch]">
          {guide.introduction.map((p, i) => (
            <p
              key={i}
              className="mb-4 text-body-lg leading-[1.65] text-ut-text last:mb-0"
            >
              {p}
            </p>
          ))}
        </section>

        {/* What this guide covers（条目 = 该 guide 真实章节标题） */}
        <GuideContents entries={toc} />

        {/* Itinerary：真实 itinerary.days，提前为可扫描的行程结构 */}
        <InnerSection id={ITINERARY_ANCHOR} title={guide.itinerary.heading} eyebrow="Itinerary">
          <p className="mb-6 max-w-[68ch] text-body leading-[1.65] text-ut-text-2">
            {guide.itinerary.intro}
          </p>
          <Timeline days={guide.itinerary.days} />
        </InnerSection>

        {/* Body sections（真实正文，未改写） */}
        {guide.sections.map((section, i) => (
          <InnerSection
            key={i}
            id={`guide-section-${i + 1}`}
            title={section.heading}
          >
            <div className="max-w-[68ch]">
              {section.paragraphs.map((p, j) => (
                <p
                  key={j}
                  className="mb-4 text-body leading-[1.65] text-ut-text last:mb-0"
                >
                  {p}
                </p>
              ))}
              {section.bullets && section.bullets.length > 0 && (
                <ul className="mt-2 list-disc space-y-2 pl-6 text-ut-text marker:text-ut-accent">
                  {section.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          </InnerSection>
        ))}

        {/* What to know（实用规划信息，真实数据） */}
        <InnerSection title="What to know before you go" eyebrow="Before you go">
          <PracticalInfo blocks={guide.practicalInfo} />
        </InnerSection>

        {/* Plan this trip（主 CTA + destination 生态内链，全部为已生成路由） */}
        <InnerCTA
          href={planHref}
          label="Plan this trip"
          title="Turn this guide into a trip"
          description={`The trip planner opens pre-filled with ${guide.planner.destination}${
            dates ? ` and ${dates}` : ""
          } — adjust the dates and interests to fit your trip.`}
        />
        {planLinks.length > 0 && (
          <InnerSection title="Plan around this destination" eyebrow="Next step">
            <EditorialIndex items={planLinks} />
          </InnerSection>
        )}

        {/* Related destinations（显式真实关联，排除主体目的地） */}
        {relatedDestinationItems.length > 0 && (
          <InnerSection title="Related destinations" eyebrow="Explore">
            <EditorialIndex items={relatedDestinationItems} />
          </InnerSection>
        )}

        {/* Related guides（规则排序，非随机） */}
        {relatedGuideItems.length > 0 && (
          <InnerSection title="More guides" eyebrow="Keep reading">
            <EditorialIndex items={relatedGuideItems} />
          </InnerSection>
        )}

        {/* Related trips（真实 TRIPS） */}
        {relatedTripItems.length > 0 && (
          <InnerSection title="Ready-made trips" eyebrow="Trips">
            <EditorialIndex items={relatedTripItems} />
          </InnerSection>
        )}

        {/* FAQ（页面可见，与 FAQPage schema 一致） */}
        {guide.faq.length > 0 && (
          <InnerSection title="Frequently asked questions" eyebrow="FAQ">
            <FaqList items={guide.faq} />
          </InnerSection>
        )}
      </div>
    </article>
  );
}

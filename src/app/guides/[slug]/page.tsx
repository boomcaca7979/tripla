import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getGuideBySlug,
  getGuideSlugs,
  buildPlannerHref,
  type Guide,
} from "@/data/guides";
import { DESTINATIONS } from "@/data/destinations";
import { TRIPS } from "@/data/trips";
import ReadingProgress from "@/components/inner/ReadingProgress";
import InnerBreadcrumb from "@/components/inner/InnerBreadcrumb";
import EditorialHero from "@/components/inner/EditorialHero";
import InnerSection from "@/components/inner/InnerSection";
import EditorialIndex from "@/components/inner/EditorialIndex";
import InnerCTA from "@/components/inner/InnerCTA";
import Timeline from "@/components/inner/Timeline";
import FaqList from "@/components/inner/FaqList";
import PracticalInfo from "@/components/inner/PracticalInfo";

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
      authors: [guide.author.name],
      tags: guide.tags,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: guide.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

// ── JSON-LD structured data ───────────────────────────────────────────

function buildArticleJsonLd(guide: Guide) {
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
    image: [`${SITE_URL}/og-image.png`],
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    author: {
      "@type": "Person",
      name: guide.author.name,
      jobTitle: guide.author.role,
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

function buildBreadcrumbJsonLd(guide: Guide) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
      {
        "@type": "ListItem",
        position: 3,
        name: guide.seoTitle,
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
  const parts = iso.split("-").map(Number);
  const [y, m, d] = parts;
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

  // Related content（数据文件显式指定的 slug，过滤掉失效引用）。
  const relatedDestinations = guide.relatedDestinationSlugs
    .map((s) => DESTINATIONS.find((d) => d.slug === s))
    .filter((d): d is NonNullable<typeof d> => Boolean(d))
    .slice(0, 3);
  const relatedTrips = guide.relatedTripSlugs
    .map((s) => TRIPS.find((t) => t.slug === s))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
    .slice(0, 3);
  const relatedGuides = guide.relatedGuideSlugs
    .map((s) => getGuideBySlug(s))
    .filter((g): g is Guide => Boolean(g) && g!.slug !== guide.slug)
    .slice(0, 3);

  const relatedGuideItems = relatedGuides.map((g) => ({
    href: `/guides/${g.slug}`,
    title: g.title,
    meta: g.readTime,
    description: g.excerpt,
  }));
  const relatedDestinationItems = relatedDestinations.map((d) => ({
    href: `/destinations/${d.slug}`,
    title: d.city,
    meta: d.country,
  }));
  const relatedTripItems = relatedTrips.map((t) => ({
    href: `/trips/${t.slug}`,
    title: t.title,
    meta: `${t.days} days · ${t.budget.toLocaleString()} ${t.currency}`,
  }));

  return (
    <article className="pb-20 pt-8 sm:pt-12">
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildArticleJsonLd(guide)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(guide)) }}
      />
      {guide.faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd(guide)) }}
        />
      )}

      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <InnerBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Guides", href: "/guides" },
            { label: guide.city },
          ]}
        />

        {/* Hero（编辑式，无全屏天空 / 无蓝色渐变） */}
        <div className="mt-8">
          <EditorialHero
            eyebrow="Guide"
            title={guide.title}
            tags={guide.tags}
            meta={
              <div className="flex flex-wrap items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-ut-pill bg-ut-ink text-body-sm font-semibold text-ut-inverse"
                  aria-hidden="true"
                >
                  {guide.author.initials}
                </div>
                <div>
                  <p className="text-body-sm font-medium text-ut-ink">
                    {guide.author.name}
                    <span className="ml-1 font-normal text-ut-muted">
                      · {guide.author.role}
                    </span>
                  </p>
                  <p className="font-mono text-label text-ut-subtle">
                    Updated {formatDate(guide.updatedAt)} · {guide.readTime}
                  </p>
                </div>
              </div>
            }
          />
        </div>

        {/* Introduction（引导段，无 H2，首段以 lede 形态承接 hero） */}
        <section className="mb-12">
          {guide.introduction.map((p, i) => (
            <p
              key={i}
              className="mb-4 text-body-lg leading-[1.6] text-ut-text last:mb-0"
            >
              {p}
            </p>
          ))}
          <p className="mt-2 text-body text-ut-muted">
            Prefer a ready-made plan?{" "}
            <Link
              href={planHref}
              className="font-medium text-ut-accent underline underline-offset-2 transition-colors hover:text-ut-accent-strong focus-visible:outline-2 focus-visible:outline-ut-accent"
            >
              Open this guide in the AI planner →
            </Link>
          </p>
        </section>

        {/* Body sections */}
        {guide.sections.map((section, i) => (
          <InnerSection key={i} title={section.heading}>
            {section.paragraphs.map((p, j) => (
              <p
                key={j}
                className="mb-4 text-body leading-[1.6] text-ut-text last:mb-0"
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
          </InnerSection>
        ))}

        {/* Itinerary（时间线，非卡片墙） */}
        <InnerSection title={guide.itinerary.heading} eyebrow="Itinerary">
          <p className="mb-6 text-body leading-[1.6] text-ut-text-2">
            {guide.itinerary.intro}
          </p>
          <Timeline days={guide.itinerary.days} />
        </InnerSection>

        {/* Practical info（紧凑面板网格，非卡片墙） */}
        <InnerSection title="Practical planning info" eyebrow="Before you go">
          <PracticalInfo blocks={guide.practicalInfo} />
        </InnerSection>

        {/* FAQ（页面可见，与 FAQPage schema 一致） */}
        {guide.faq.length > 0 && (
          <InnerSection title="Frequently asked questions" eyebrow="FAQ">
            <FaqList items={guide.faq} />
          </InnerSection>
        )}

        {/* Single Primary CTA（置于文末，不在 hero / first-screen） */}
        <InnerCTA
          href={planHref}
          title={`Ready to plan your ${guide.planner.destination} trip?`}
          description="Use this guide as your starting point — the AI planner builds a day-by-day itinerary around your dates and interests."
          label={guide.planner.label}
        />

        {/* Related guides（编辑式索引行） */}
        {relatedGuideItems.length > 0 && (
          <InnerSection title="Keep reading" eyebrow="More guides">
            <EditorialIndex items={relatedGuideItems} />
          </InnerSection>
        )}

        {/* Related destinations */}
        {relatedDestinationItems.length > 0 && (
          <InnerSection title="Related destinations" eyebrow="Explore">
            <EditorialIndex items={relatedDestinationItems} />
          </InnerSection>
        )}

        {/* Related trips */}
        {relatedTripItems.length > 0 && (
          <InnerSection title="Ready-made trips" eyebrow="Trips">
            <EditorialIndex items={relatedTripItems} />
          </InnerSection>
        )}
      </div>
    </article>
  );
}

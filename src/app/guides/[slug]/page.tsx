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

  return (
    <article className="min-h-screen bg-white pt-24">
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

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/guides" className="hover:text-gray-900">Guides</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{guide.city}</span>
        </nav>

        {/* Hero */}
        <header className="mb-10">
          {/* Gradient banner（coverImage 为 null 时的 fallback，与现有设计一致） */}
          <div
            className={`mb-8 h-40 rounded-2xl bg-gradient-to-br ${guide.gradient} sm:h-56`}
            aria-hidden="true"
          />

          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            {guide.title}
          </h1>

          {/* Author + meta */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${guide.author.avatarColor} text-sm font-bold text-white`}
              aria-hidden="true"
            >
              {guide.author.initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {guide.author.name}
                <span className="ml-1 font-normal text-gray-500">· {guide.author.role}</span>
              </p>
              <p className="text-xs text-gray-500">
                Updated {formatDate(guide.updatedAt)} · {guide.readTime}
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-6 flex flex-wrap gap-2">
            {guide.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
              >
                {t}
              </span>
            ))}
          </div>
        </header>

        {/* Introduction */}
        <section className="mb-10">
          {guide.introduction.map((p, i) => (
            <p key={i} className="mb-4 text-lg leading-relaxed text-gray-700">
              {p}
            </p>
          ))}
        </section>

        {/* Planner CTA（首屏后置顶转换入口） */}
        <section className="mb-10 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white sm:p-8">
          <h2 className="text-xl font-bold sm:text-2xl">
            Turn this guide into a personalized itinerary
          </h2>
          <p className="mt-2 text-blue-100">
            {guide.planner.destination} · dates{guide.planner.departureDate ? " and preferences" : " and preferences"} pre-filled — adjust anything, then generate your day-by-day plan.
          </p>
          <Link
            href={planHref}
            className="mt-4 inline-flex items-center rounded-full bg-white px-6 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            {guide.planner.label} →
          </Link>
        </section>

        {/* Body sections */}
        {guide.sections.map((section, i) => (
          <section key={i} className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">{section.heading}</h2>
            {section.paragraphs.map((p, j) => (
              <p key={j} className="mb-4 leading-relaxed text-gray-700">{p}</p>
            ))}
            {section.bullets && section.bullets.length > 0 && (
              <ul className="list-disc space-y-2 pl-6 text-gray-700">
                {section.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {/* Itinerary */}
        <section className="mb-10">
          <h2 className="mb-3 text-2xl font-bold text-gray-900">{guide.itinerary.heading}</h2>
          <p className="mb-6 leading-relaxed text-gray-700">{guide.itinerary.intro}</p>
          <ol className="space-y-4">
            {guide.itinerary.days.map((d) => (
              <li
                key={d.day}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  Day {d.day} · {d.theme}
                </h3>
                <p className="mt-2 leading-relaxed text-gray-700">{d.description}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Practical info */}
        <section className="mb-10">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Practical planning info</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {guide.practicalInfo.map((block, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  {block.heading}
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  {block.items.map((item, j) => (
                    <li key={j} className="flex gap-2">
                      <span className="text-blue-600" aria-hidden="true">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ（页面可见，与 FAQPage schema 一致） */}
        {guide.faq.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              Frequently asked questions
            </h2>
            <div className="space-y-3">
              {guide.faq.map((item, i) => (
                <details
                  key={i}
                  className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <summary className="cursor-pointer list-none font-semibold text-gray-900 marker:hidden">
                    <span className="mr-2 inline-block text-blue-600 transition group-open:rotate-90" aria-hidden="true">▸</span>
                    {item.question}
                  </summary>
                  <p className="mt-3 leading-relaxed text-gray-700">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Bottom planner CTA */}
        <section className="mb-10 rounded-2xl border border-blue-100 bg-blue-50 p-6 text-center sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Ready to plan your {guide.planner.destination} trip?
          </h2>
          <p className="mt-2 text-gray-600">
            Use this guide as your starting point — the AI planner builds a day-by-day
            itinerary around your dates and interests.
          </p>
          <Link
            href={planHref}
            className="mt-4 inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-md transition hover:from-blue-700 hover:to-indigo-700"
          >
            {guide.planner.label} →
          </Link>
        </section>

        {/* Related guides */}
        {relatedGuides.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Keep reading</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {relatedGuides.map((g) => (
                <Link
                  key={g.slug}
                  href={`/guides/${g.slug}`}
                  className="group block rounded-2xl border border-gray-100 overflow-hidden transition hover:shadow-md"
                >
                  <div
                    className={`flex h-24 items-center justify-center bg-gradient-to-br ${g.gradient} px-4 text-center text-sm font-bold text-white`}
                  >
                    {g.seoTitle}
                  </div>
                  <div className="p-4">
                    <p className="text-sm leading-snug text-gray-700 group-hover:text-blue-700">
                      {g.excerpt}
                    </p>
                    <p className="mt-2 text-xs text-gray-500">{g.readTime}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related destinations */}
        {relatedDestinations.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Related destinations</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {relatedDestinations.map((d) => (
                <Link
                  key={d.slug}
                  href={`/destinations/${d.slug}`}
                  className="group block rounded-2xl border border-gray-100 overflow-hidden transition hover:shadow-md"
                >
                  <div
                    className={`h-24 bg-gradient-to-br ${d.gradient} flex items-center justify-center text-white`}
                  >
                    <span className="text-lg font-bold">{d.city}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">
                      {d.city}
                    </h3>
                    <div className="mt-1 text-sm text-gray-500">{d.country}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related trips */}
        {relatedTrips.length > 0 && (
          <section className="mb-16">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Ready-made trips</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {relatedTrips.map((t) => (
                <Link
                  key={t.slug}
                  href={`/trips/${t.slug}`}
                  className="group block rounded-2xl border border-gray-100 overflow-hidden transition hover:shadow-md"
                >
                  <div
                    className={`h-24 bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white`}
                  >
                    <span className="text-lg font-bold">{t.city}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">
                      {t.title}
                    </h3>
                    <div className="mt-1 text-sm text-gray-500">
                      {t.days} days · {t.budget.toLocaleString()} {t.currency}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

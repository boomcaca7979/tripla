import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AI_PAGES, type AiPage } from "@/data/ai-pages";
import { GUIDES, buildPlannerHref } from "@/data/guides";
import { DESTINATIONS } from "@/data/destinations";

const SITE_URL = "https://www.utripla.xyz";

// ── Static params ─────────────────────────────────────────────────────

// 仅渲染 AI_PAGES 声明的 slug；其余顶级路径 404（静态路由优先于此动态段）。
export const dynamicParams = false;

export function generateStaticParams() {
  return AI_PAGES.map((p) => ({ slug: p.slug }));
}

// ── Per-page metadata ─────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = AI_PAGES.find((p) => p.slug === slug);
  if (!page) return { title: "Page not found" };
  const title = page.seoTitle;
  const description = page.metaDescription;
  return {
    title,
    description,
    alternates: {
      canonical: `/${page.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: page.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

// ── JSON-LD ───────────────────────────────────────────────────────────

function buildPageJsonLd(page: AiPage) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: page.seoTitle,
    description: page.metaDescription,
    url: `${SITE_URL}/${page.slug}`,
    isPartOf: { "@type": "WebSite", name: "tripla", url: SITE_URL },
    datePublished: page.publishedAt,
    dateModified: page.updatedAt,
    // ItemList：页面真实展示的相关 guide 集合（与可见内链一致）。
    mainEntity: {
      "@type": "ItemList",
      itemListElement: page.relatedGuideSlugs
        .map((slug, i) => GUIDES.find((g) => g.slug === slug))
        .filter((g): g is NonNullable<typeof g> => Boolean(g))
        .map((g, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: g.seoTitle,
          url: `${SITE_URL}/guides/${g.slug}`,
        })),
    },
  };
}

function buildBreadcrumbJsonLd(page: AiPage) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "AI Travel Planner", item: `${SITE_URL}/${page.slug}` },
    ],
  };
}

/** FAQPage schema：仅当页面可见 FAQ 存在时输出。 */
function buildFaqJsonLd(page: AiPage) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faq.map((item) => ({
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

export default async function AiTravelPlannerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = AI_PAGES.find((p) => p.slug === slug);
  if (!page) notFound();

  const planHref = buildPlannerHref(page.planner);

  const relatedGuides = page.relatedGuideSlugs
    .map((s) => GUIDES.find((g) => g.slug === s))
    .filter((g): g is NonNullable<typeof g> => Boolean(g))
    .slice(0, 6);
  const relatedDestinations = page.relatedDestinationSlugs
    .map((s) => DESTINATIONS.find((d) => d.slug === s))
    .filter((d): d is NonNullable<typeof d> => Boolean(d))
    .slice(0, 4);

  return (
    <main className="min-h-screen bg-white pt-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildPageJsonLd(page)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(page)) }}
      />
      {page.faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd(page)) }}
        />
      )}

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">AI Travel Planner</span>
        </nav>

        {/* Hero */}
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            {page.title}
          </h1>
          <p className="mt-4 text-xl leading-relaxed text-gray-600">{page.subtitle}</p>
          <p className="mt-3 text-sm font-medium text-blue-700">
            For: {page.audience}
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Updated {page.updatedAt} · {page.readTime}
          </p>
        </header>

        {/* Intro */}
        <section className="mb-10">
          {page.intro.map((p, i) => (
            <p key={i} className="mb-4 text-lg leading-relaxed text-gray-700">
              {p}
            </p>
          ))}
        </section>

        {/* Planner CTA（首屏后） */}
        <section className="mb-10 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white sm:p-8">
          <h2 className="text-xl font-bold sm:text-2xl">
            Generate your itinerary in one pass
          </h2>
          <p className="mt-2 text-blue-100">
            Destination, dates, travel style, interests and budget — one form, one click,
            one day-by-day plan you can keep refining.
          </p>
          <Link
            href={planHref}
            className="mt-4 inline-flex items-center rounded-full bg-white px-6 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            {page.planner.label} →
          </Link>
        </section>

        {/* How it works */}
        <section className="mb-10">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">How it works</h2>
          <div className="space-y-8">
            {page.howItWorks.map((section, i) => (
              <div key={i}>
                <h3 className="mb-3 text-lg font-semibold text-gray-900">
                  {section.heading}
                </h3>
                {section.paragraphs.map((p, j) => (
                  <p key={j} className="mb-3 leading-relaxed text-gray-700">{p}</p>
                ))}
                {section.bullets && section.bullets.length > 0 && (
                  <ul className="list-disc space-y-2 pl-6 text-gray-700">
                    {section.bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Style & budget */}
        <section className="mb-10">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Style and budget</h2>
          <div className="space-y-8">
            {page.styleAndBudget.map((section, i) => (
              <div key={i}>
                <h3 className="mb-3 text-lg font-semibold text-gray-900">
                  {section.heading}
                </h3>
                {section.paragraphs.map((p, j) => (
                  <p key={j} className="mb-3 leading-relaxed text-gray-700">{p}</p>
                ))}
                {section.bullets && section.bullets.length > 0 && (
                  <ul className="list-disc space-y-2 pl-6 text-gray-700">
                    {section.bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* FAQ（可见，与 FAQPage schema 一致） */}
        {page.faq.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              Frequently asked questions
            </h2>
            <div className="space-y-3">
              {page.faq.map((item, i) => (
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
            {page.planner.label}
          </h2>
          <p className="mt-2 text-gray-600">
            Start from a {page.planner.destination} plan or any destination you have in
            mind — the itinerary adapts to your inputs.
          </p>
          <Link
            href={planHref}
            className="mt-4 inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-md transition hover:from-blue-700 hover:to-indigo-700"
          >
            Open the planner →
          </Link>
        </section>

        {/* Related guides */}
        {relatedGuides.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Planning guides</h2>
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
          <section className="mb-16">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Popular destinations</h2>
            <div className="grid gap-4 sm:grid-cols-4">
              {relatedDestinations.map((d) => (
                <Link
                  key={d.slug}
                  href={`/destinations/${d.slug}`}
                  className="group block rounded-2xl border border-gray-100 overflow-hidden transition hover:shadow-md"
                >
                  <div
                    className={`flex h-20 items-center justify-center bg-gradient-to-br ${d.gradient}`}
                  >
                    <span className="text-base font-bold text-white">{d.city}</span>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                      {d.country}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

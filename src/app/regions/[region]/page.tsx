import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  DESTINATIONS,
  type Region,
} from "@/data/destinations";
import { TRIPS } from "@/data/trips";

// ── Static params ─────────────────────────────────────────────────────
// 仅生成真实存在 destination 的 region,避免空页面。
// Region 类型来源:src/data/destinations.ts 的 Region union type。

export const dynamicParams = false;

const ALL_REGIONS: Region[] = ["Asia", "Europe", "Americas", "Oceania", "Africa"];

export function generateStaticParams() {
  // 仅返回在 DESTINATIONS 中真实出现的 region
  const usedRegions = new Set(DESTINATIONS.map((d) => d.region));
  return ALL_REGIONS.filter((r) => usedRegions.has(r)).map((region) => ({
    region: region.toLowerCase(),
  }));
}

// ── Helpers ────────────────────────────────────────────────────────────

function parseRegion(slug: string): Region | null {
  const map: Record<string, Region> = {
    asia: "Asia",
    europe: "Europe",
    americas: "Americas",
    oceania: "Oceania",
    africa: "Africa",
  };
  return map[slug] ?? null;
}

function regionLabel(region: Region): string {
  if (region === "Americas") return "the Americas";
  return region;
}

// ── Metadata (Phase 8.2) ──────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string }>;
}): Promise<Metadata> {
  const { region } = await params;
  const r = parseRegion(region);
  if (!r) return { title: "Region not found" };

  const destCount = DESTINATIONS.filter((d) => d.region === r).length;
  const title = `${r} Travel Guide · Top Destinations & Trips`;
  const description = buildRegionMetaDescription(r, destCount);
  return {
    title,
    description,
    alternates: { canonical: `/regions/${region}` },
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://www.utripla.xyz/regions/${region}`,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

function buildRegionMetaDescription(region: Region, destCount: number): string {
  const cities = DESTINATIONS.filter((d) => d.region === region)
    .slice(0, 4)
    .map((d) => d.city);
  const cityList = cities.length > 0 ? cities.join(", ") + ", and more." : "";
  const base = `Explore ${destCount} top travel destinations in ${regionLabel(region)} — ${cityList}`;
  const suffix = ` Find best time, budget, and trip templates for each city.`;
  const total = base + suffix;
  if (total.length <= 160) return total;
  return total.slice(0, 159).trimEnd() + "…";
}

// ── JSON-LD (Phase 8.2) ───────────────────────────────────────────────

function buildCollectionPageJsonLd(region: Region, destCount: number) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${region} Travel Guide`,
    description: buildRegionMetaDescription(region, destCount),
    url: `https://www.utripla.xyz/regions/${region.toLowerCase()}`,
  };
}

function buildItemListJsonLd(region: Region) {
  const dests = DESTINATIONS.filter((d) => d.region === region);
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Destinations in ${region}`,
    numberOfItems: dests.length,
    itemListElement: dests.map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://www.utripla.xyz/destinations/${d.slug}`,
      name: `${d.city}, ${d.country}`,
    })),
  };
}

function buildBreadcrumbJsonLd(region: Region) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.utripla.xyz/" },
      {
        "@type": "ListItem",
        position: 2,
        name: "Regions",
        item: "https://www.utripla.xyz/destinations",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: region,
        item: `https://www.utripla.xyz/regions/${region.toLowerCase()}`,
      },
    ],
  };
}

// ── Page ──────────────────────────────────────────────────────────────

export default async function RegionPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const { region } = await params;
  const r = parseRegion(region);
  if (!r) notFound();

  const regionDestinations = DESTINATIONS.filter((d) => d.region === r);
  if (regionDestinations.length === 0) notFound();

  // 相关 trips:同 region 的 destination city 关联
  const regionCitySet = new Set(
    regionDestinations.map((d) => d.city.toLowerCase()),
  );
  const relatedTrips = TRIPS.filter((t) =>
    regionCitySet.has(t.city.toLowerCase()),
  ).slice(0, 6);

  // 其他 region 内链 (Phase 8.5)
  const otherRegions = ALL_REGIONS.filter(
    (x) => x !== r && DESTINATIONS.some((d) => d.region === x),
  );

  return (
    <article className="min-h-screen bg-white pt-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildCollectionPageJsonLd(r, regionDestinations.length)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildItemListJsonLd(r)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(r)) }}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/destinations" className="hover:text-gray-900">Destinations</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{r}</span>
        </nav>

        {/* Hero */}
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            {r} Travel Guide
          </h1>
          <p className="mt-3 max-w-2xl text-base text-gray-500 sm:text-lg">
            Discover {regionDestinations.length} curated travel destinations
            across {regionLabel(r)}. Each guide includes best season, daily budget,
            recommended days, and ready-to-use trip templates.
          </p>

          {/* Other regions 内链 (Phase 8.5) */}
          {otherRegions.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {otherRegions.map((x) => (
                <Link
                  key={x}
                  href={`/regions/${x.toLowerCase()}`}
                  className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  {x}
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Region overview */}
        <section className="mb-10">
          <h2 className="mb-3 text-2xl font-bold text-gray-900">
            About travel in {regionLabel(r)}
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {r} offers {regionDestinations.length} destinations covered by
            tripla&apos;s travel guides, spanning{" "}
            {Array.from(new Set(regionDestinations.map((d) => d.country))).length}{" "}
            countries:{" "}
            {Array.from(new Set(regionDestinations.map((d) => d.country))).join(", ")}.
            Use these guides to plan your trip by city, season, and budget.
          </p>
        </section>

        {/* Destinations in {region} */}
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            Destinations in {r}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {regionDestinations.map((d) => (
              <Link
                key={d.slug}
                href={`/destinations/${d.slug}`}
                className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700">
                  {d.city}
                </h3>
                <p className="mt-0.5 text-sm text-gray-500">{d.country}</p>
                <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                  {d.description}
                </p>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <dt className="text-gray-500">Best time</dt>
                    <dd className="font-semibold text-gray-900">{d.bestMonths}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Budget/day</dt>
                    <dd className="font-semibold text-gray-900">
                      {d.budgetPerDay} {d.budgetCurrency}
                    </dd>
                  </div>
                </dl>
                <div className="mt-auto pt-3 text-sm font-semibold text-blue-700 group-hover:underline">
                  View guide →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Related trips in {region} */}
        {relatedTrips.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Popular trips in {r}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedTrips.map((t) => (
                <Link
                  key={t.slug}
                  href={`/trips/${t.slug}`}
                  className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700">
                    {t.title}
                  </h3>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {t.city}, {t.country}
                  </p>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-xs text-gray-500">Duration</dt>
                      <dd className="font-semibold text-gray-900">{t.days} days</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">Budget</dt>
                      <dd className="font-semibold text-gray-900">
                        {t.budget.toLocaleString()} {t.currency}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-auto pt-3 text-sm font-semibold text-blue-700 group-hover:underline">
                    View itinerary →
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Cross-link to Trips hub (Phase 8.5) */}
        <section className="mb-16 rounded-2xl border border-gray-100 p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Looking for more trip templates?
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Browse all {TRIPS.length} trip itineraries or filter by travel style.
          </p>
          <Link
            href="/trips"
            className="mt-3 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-5 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
          >
            View all trips →
          </Link>
        </section>
      </div>
    </article>
  );
}

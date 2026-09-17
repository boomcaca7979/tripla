import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import InnerSection from "@/components/inner/InnerSection";
import Eyebrow from "@/components/ui/Eyebrow";
import TripSearch from "@/components/trips/TripSearch";
import BrowseAllTrips from "@/components/trips/BrowseAllTrips";
import { DESTINATIONS } from "@/data/destinations";
import { GUIDES } from "@/data/guides";
import {
  getTripHub,
  getTripSearchDocs,
  filterTripCards,
  TRAVEL_STYLE_LABELS,
  type TripHubCard,
  type TripHub,
} from "@/lib/trips-hub";

export const metadata: Metadata = {
  title: "Trips",
  description:
    "Ready-to-follow itineraries for real destinations — browse by destination, region, trip length, travel style and interest, then open a day-by-day plan.",
  alternates: {
    canonical: "/trips",
  },
  openGraph: {
    title: "Trips · UTRIPLA",
    description:
      "Ready-to-follow itineraries for real destinations — browse by destination, region, trip length, travel style and interest.",
    type: "website",
    url: "https://www.utripla.xyz/trips",
  },
  twitter: {
    card: "summary",
    title: "Trips · UTRIPLA",
    description:
      "Ready-to-follow itineraries for real destinations — browse by destination, region, trip length, travel style and interest.",
  },
};

const CONTAINER = "mx-auto w-full max-w-7xl px-4 md:px-6";

// ── filter 参数解析（query 只作浏览过滤；canonical 恒为 /trips）──────────

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(sp: SearchParams, key: string): string | null {
  const v = sp[key];
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function readFilters(sp: SearchParams, hub: TripHub) {
  const q = firstParam(sp, "q")?.toLowerCase() ?? null;
  const cityParam = firstParam(sp, "city");
  const city = cityParam
    ? hub.cities.find((c) => c.city.toLowerCase() === cityParam.toLowerCase())?.city ?? null
    : null;
  const region = firstParam(sp, "region");
  const style = firstParam(sp, "style");
  const interest = firstParam(sp, "interest");
  const days = firstParam(sp, "days");

  const filtered = filterTripCards(hub.cards, { q, city, region, days, style, interest });

  const active: Array<{ label: string; param: string; value: string }> = [];
  if (city) active.push({ label: city, param: "city", value: city });
  if (region) active.push({ label: region, param: "region", value: region });
  if (style) {
    const s = hub.styles.find((x) => x.key === style);
    active.push({ label: s?.label ?? style, param: "style", value: style });
  }
  if (interest) {
    const i = hub.interests.find((x) => x.key === interest);
    active.push({ label: i?.label ?? interest, param: "interest", value: interest });
  }
  if (days) {
    const b = hub.daysBuckets.find((x) => x.key === days);
    active.push({ label: b?.label ?? days, param: "days", value: days });
  }
  if (q) active.push({ label: `“${q}”`, param: "q", value: q });

  return { q, city, region, style, interest, days, filtered, active };
}

function buildFilterHref(active: Array<{ param: string; value: string }>, remove?: string): string {
  const params = new URLSearchParams();
  for (const { param, value } of active) {
    if (param === remove) continue;
    params.set(param, value);
  }
  const qs = params.toString();
  return qs ? `/trips?${qs}` : "/trips";
}

// ── 卡片 ─────────────────────────────────────────────────────────────────

function FeaturedTripCard({ card, eager }: { card: TripHubCard; eager: boolean }) {
  return (
    <Link
      href={`/trips/${card.slug}`}
      className="group block overflow-hidden rounded-ut-md border border-white/10 bg-ut-surface transition-colors hover:border-white/30"
    >
      <div className="relative h-56 overflow-hidden">
        {card.image ? (
          <Image
            src={card.image}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            priority={eager}
            loading={eager ? "eager" : "lazy"}
            className="object-cover transition-transform duration-[var(--ut-dur-slow)] group-hover:scale-[1.04]"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <span className="absolute bottom-3 left-4 font-mono text-micro uppercase tracking-[0.16em] text-white/90">
          {card.city} · {card.country}
        </span>
        <span className="absolute right-3 top-3 rounded-full border border-white/25 bg-black/30 px-2 py-0.5 font-mono text-micro uppercase tracking-[0.12em] text-white/85 backdrop-blur-sm">
          {card.days} {card.days === 1 ? "day" : "days"}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-[1.1rem] leading-snug text-ut-ink transition-colors group-hover:text-ut-accent">
          {card.title}
        </h3>
        <p className="mt-2 font-mono text-micro uppercase tracking-[0.12em] text-ut-muted">
          {TRAVEL_STYLE_LABELS[card.travelStyle]} · {card.activityCount} activities
        </p>
        {card.dayThemes.length > 0 && (
          <p className="mt-3 line-clamp-2 text-body-sm leading-[1.6] text-ut-text-2">
            {card.dayThemes.slice(0, 3).join(" → ")}
          </p>
        )}
      </div>
    </Link>
  );
}

function DestinationEntry({
  city,
  count,
  image,
  gradient,
}: {
  city: string;
  count: number;
  image: string | null;
  gradient: string;
}) {
  return (
    <Link
      href={`/trips?city=${encodeURIComponent(city)}`}
      className="group block overflow-hidden rounded-ut-md border border-white/10"
    >
      <div className="relative h-28 overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            loading="lazy"
            className="object-cover opacity-80 transition-transform duration-[var(--ut-dur-slow)] group-hover:scale-[1.05]"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
        <span className="absolute bottom-2.5 left-3.5 font-display text-[1rem] leading-none text-white">
          {city}
        </span>
      </div>
      <p className="px-3.5 py-2.5 font-mono text-micro uppercase tracking-[0.14em] text-white/60">
        {count} {count === 1 ? "trip" : "trips"}
      </p>
    </Link>
  );
}

function FilterChip({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count: number;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`inline-flex min-h-[40px] items-center gap-2 rounded-ut-pill border px-4 font-mono text-micro uppercase tracking-[0.14em] transition-colors ${
        active
          ? "border-ut-accent bg-ut-accent/15 text-white"
          : "border-white/15 text-white/70 hover:border-white/40 hover:text-white"
      }`}
    >
      {label}
      <span className="text-white/40">{count}</span>
    </Link>
  );
}

// ── Page ───────────────────────────────────────────────────────────────

export default async function TripsHubPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const hub = getTripHub();
  const { region, style, interest, days, filtered, active } = readFilters(sp, hub);
  const hasFilters = active.length > 0;

  const featured = hasFilters ? [] : hub.featured;
  const destinationEntries = hub.cities.slice(0, 12);

  return (
    <div className="ut-world min-h-screen">
      {/* ═══ Structured data ═══ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "UTRIPLA Trips",
            description:
              "Ready-to-follow itineraries for real destinations, browsable by destination, region, trip length, travel style and interest.",
            url: "https://www.utripla.xyz/trips",
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "UTRIPLA Trip Itineraries",
            numberOfItems: hub.cards.length,
            itemListElement: hub.cards.map((t, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `https://www.utripla.xyz/trips/${t.slug}`,
              name: t.title,
            })),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://www.utripla.xyz/" },
              { "@type": "ListItem", position: 2, name: "Trips", item: "https://www.utripla.xyz/trips" },
            ],
          }),
        }}
      />

      {/* ═══ Hero ═══ */}
      <section className="relative overflow-hidden pb-14 pt-28 md:pb-20 md:pt-36">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(90% 70% at 50% -10%, rgba(164,81,59,0.16) 0%, rgba(0,0,0,0) 60%)",
          }}
        />
        <div className={`${CONTAINER} relative`}>
          <Eyebrow dot>Discovery</Eyebrow>
          <h1 className="mt-4 font-display text-[clamp(2.75rem,6vw,4.5rem)] leading-[1.02] text-ut-ink">
            Trips
          </h1>
          <p className="mt-4 max-w-xl text-body-lg leading-[1.6] text-ut-text-2">
            Ready-to-follow itineraries for real destinations — day by day, with
            the length, style and interests already decided.
          </p>
          <div className="mt-8">
            <TripSearch docs={getTripSearchDocs()} />
          </div>
        </div>
      </section>

      <div className={`${CONTAINER} pb-20`}>
        {/* ═══ Featured trips ═══ */}
        {featured.length > 0 && (
          <InnerSection eyebrow="Start here" title="Featured trips" className="mb-16">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featured.map((card, i) => (
                <FeaturedTripCard key={card.slug} card={card} eager={i < 2} />
              ))}
            </div>
          </InnerSection>
        )}

        {/* ═══ Explore by Destination ═══ */}
        <InnerSection eyebrow="By place" title="Explore by destination" className="mb-16">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {destinationEntries.map((c) => (
              <DestinationEntry
                key={c.city}
                city={c.city}
                count={c.count}
                image={c.image}
                gradient={c.gradient}
              />
            ))}
          </div>
        </InnerSection>

        {/* ═══ Explore by Region ═══ */}
        <InnerSection eyebrow="By region" title="Explore by region" className="mb-16">
          <div className="flex flex-wrap gap-3">
            {hub.regions.map((r) => (
              <FilterChip
                key={r.region}
                href={`/trips?region=${encodeURIComponent(r.region)}`}
                label={r.region}
                count={r.count}
                active={region?.toLowerCase() === r.region.toLowerCase()}
              />
            ))}
          </div>
        </InnerSection>

        {/* ═══ Travel Style / Interest ═══ */}
        <InnerSection eyebrow="By style" title="Explore by travel style" className="mb-16">
          <div className="flex flex-wrap gap-3">
            {hub.styles.map((s) => (
              <FilterChip
                key={s.key}
                href={`/trips?style=${encodeURIComponent(s.key)}`}
                label={s.label}
                count={s.count}
                active={style === s.key}
              />
            ))}
          </div>
        </InnerSection>

        <InnerSection eyebrow="By interest" title="Explore by interest" className="mb-16">
          <div className="flex flex-wrap gap-3">
            {hub.interests.map((i) => (
              <FilterChip
                key={i.key}
                href={`/trips?interest=${encodeURIComponent(i.key)}`}
                label={i.label}
                count={i.count}
                active={interest === i.key}
              />
            ))}
          </div>
        </InnerSection>

        {/* ═══ Trip length ═══ */}
        <InnerSection eyebrow="How long" title="Explore by trip length" className="mb-16">
          <div className="flex flex-wrap gap-3">
            {hub.daysBuckets.map((b) => (
              <FilterChip
                key={b.key}
                href={`/trips?days=${encodeURIComponent(b.key)}`}
                label={b.label}
                count={b.count}
                active={days === b.key}
              />
            ))}
          </div>
        </InnerSection>

        {/* ═══ Browse all trips ═══ */}
        <InnerSection
          eyebrow="The full archive"
          title={hasFilters ? "Filtered trips" : "Browse all trips"}
          className="mb-16"
        >
          {hasFilters && (
            <div className="mb-8 flex flex-wrap items-center gap-3">
              <span className="font-mono text-micro uppercase tracking-[0.14em] text-ut-muted">
                {filtered.length} {filtered.length === 1 ? "trip" : "trips"} ·
              </span>
              {active.map((a) => (
                <Link
                  key={a.param}
                  href={buildFilterHref(active, a.param)}
                  className="inline-flex min-h-[36px] items-center gap-2 rounded-ut-pill border border-ut-accent/50 bg-ut-accent/10 px-3 font-mono text-micro uppercase tracking-[0.12em] text-white transition-colors hover:bg-ut-accent/20"
                >
                  {a.label}
                  <span aria-hidden="true" className="text-white/60">
                    ×
                  </span>
                </Link>
              ))}
              <Link
                href="/trips"
                className="font-mono text-micro uppercase tracking-[0.14em] text-white/50 underline decoration-white/25 underline-offset-4 hover:text-white"
              >
                Clear all
              </Link>
            </div>
          )}
          {filtered.length > 0 ? (
            <BrowseAllTrips cards={filtered} />
          ) : (
            <p className="font-mono text-micro uppercase tracking-[0.14em] text-ut-muted">
              No trips match the current filters — clear them to see all {hub.cards.length} trips.
            </p>
          )}
        </InnerSection>

        {/*
          Stage 4：Hub 之间的内容级入口（Trips → Destinations / Guides）。
          规则 —— 只使用**真实关系**：
            · 目的地条目来自 hub.cities（trip.city → destinations.ts 精确同名匹配，
              280/280 命中），且 `destinationSlug` 为 null 的条目直接过滤掉，
              绝不生成 `/destinations/null` 这类畸形 href；
            · 两个 hub 链接的计数是 DESTINATIONS.length / GUIDES.length 的真实值。
          刻意保持克制：2 个集合入口 + 6 个真实目的地，不做链接墙（完整 145 个
          目的地清单在 /destinations，完整 guide 清单在 /guides）。
          仅在无筛选时显示 —— 有筛选时页面语义是"筛选结果"，不应再分发导航。
        */}
        {!hasFilters && (
          <InnerSection eyebrow="Keep planning" title="Explore the places behind these trips">
            <p className="max-w-2xl text-body leading-[1.6] text-ut-text-2">
              Every itinerary belongs to a real destination with its own climate,
              budget and practical detail — and most cities also have dedicated
              travel guides.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/destinations"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-ut-sm border border-white/20 px-5 font-mono text-micro uppercase tracking-[0.16em] text-white/75 transition-colors hover:border-white/50 hover:text-white focus-visible:outline-2 focus-visible:outline-ut-accent"
              >
                Explore all {DESTINATIONS.length} destinations
              </Link>
              <Link
                href="/guides"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-ut-sm border border-white/20 px-5 font-mono text-micro uppercase tracking-[0.16em] text-white/75 transition-colors hover:border-white/50 hover:text-white focus-visible:outline-2 focus-visible:outline-ut-accent"
              >
                Read the {GUIDES.length} travel guides
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-3">
              {hub.cities
                .filter((c) => c.destinationSlug)
                .slice(0, 6)
                .map((c) => (
                  <li key={c.city}>
                    <Link
                      href={`/destinations/${c.destinationSlug}`}
                      className="inline-flex min-h-[40px] items-center gap-2 rounded-ut-pill border border-white/15 px-4 font-mono text-micro uppercase tracking-[0.14em] text-white/70 transition-colors hover:border-white/40 hover:text-white"
                    >
                      {c.city}
                      <span className="text-white/40">{c.count}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </InnerSection>
        )}
      </div>
    </div>
  );
}

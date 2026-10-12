import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";
import { DESTINATIONS, type Destination } from "@/data/destinations";
import GuideSearch from "@/components/guides/GuideSearch";
import GuidesDirectoryTracker from "@/components/analytics/GuidesDirectoryTracker";
import MddSection, {
  type MddPanelData,
  type MddCardData,
} from "@/components/guides/MddBlocks";
import DestinationDirectory, {
  type DirectoryRegionGroup,
} from "@/components/guides/DestinationDirectory";
import { getGuideHub, type GuideHub } from "@/lib/guides-hub";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "A destination directory — browse every city Utripla covers by region, season and theme.",
  alternates: {
    canonical: "/guides",
  },
};

// ── 马蜂窝 /mdd/ 1:1 复刻（Round 9 完整实施） ─────────────────────────────
// 页面结构 = 轻搜索条 → 推广 Banner → Block01 热门目的地（region tab）
//   → Block02 当季推荐（12 月 tab）→ Block03 主题精选（5 主题 tab）。
// 每个 block：item-hd 居中头 + scopebar tab + 卡片网格（每面板先 6 张）+ showmore。
// 数据全部来自真实 Tripla 数据（destinations / guides 派生字段），不造假。

// ── city → destination 索引 ─────────────────────────────────────────────

const destinationByCity = new Map<string, Destination>(
  DESTINATIONS.map((d) => [d.city.toLowerCase(), d]),
);

const DIRECTORY_REGIONS = ["Asia", "Europe", "Americas", "Oceania", "Africa"] as const;

// ── guide 数（真实热度代理：排前 6 张 + 业务链接判定） ─────────────────────

function guideCountMap(hub: GuideHub): Map<string, number> {
  const m = new Map<string, number>();
  for (const c of hub.cards) {
    m.set(c.city.toLowerCase(), (m.get(c.city.toLowerCase()) ?? 0) + 1);
  }
  return m;
}

function toCard(d: Destination): MddCardData {
  return {
    key: d.slug,
    city: d.city,
    image: d.image,
    gradient: d.gradient,
    // 城市唯一页规则：点城市 = 进入该城市唯一的正式内页 /destinations/<slug>。
    // 该城的 guide 内容从 Destination Detail 内的 Guides 模块进入（保留原 Guide URL）。
    href: `/destinations/${d.slug}`,
  };
}

/** 按 guide 数降序（参考站「最受大家喜欢」= 热度优先），同名按城市名。 */
function byPopularity(a: Destination, b: Destination, counts: Map<string, number>) {
  const ca = counts.get(a.city.toLowerCase()) ?? 0;
  const cb = counts.get(b.city.toLowerCase()) ?? 0;
  if (cb !== ca) return cb - ca;
  return a.city.localeCompare(b.city);
}

// ── Block 01 热门目的地：region tab，全部 145 张都在面板里 ────────────────

function popularPanels(hub: GuideHub): MddPanelData[] {
  const counts = guideCountMap(hub);
  return DIRECTORY_REGIONS.map((region) => {
    const dests = DESTINATIONS.filter((d) => d.region === region).sort((a, b) =>
      byPopularity(a, b, counts),
    );
    return {
      label: region,
      moreLabel: "More destinations",
      cards: dests.map((d) => toCard(d)),
    };
  });
}

// ── Block 02 当季推荐：bestMonths（真实数据）→ 12 个月面板 ────────────────

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MONTH_ABBR: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

/** 解析 "Mar-May, Sep-Oct" 这类真实区间（含跨年 Nov-Feb）→ 月份集合。 */
function parseBestMonths(bestMonths: string): Set<number> {
  const out = new Set<number>();
  for (const token of bestMonths.split(",")) {
    const t = token.trim();
    const range = t.match(/^([A-Z][a-z]{2})\s*-\s*([A-Z][a-z]{2})$/);
    if (range) {
      const a = MONTH_ABBR[range[1]];
      const b = MONTH_ABBR[range[2]];
      if (a === undefined || b === undefined) continue;
      for (let m = a; ; m = (m + 1) % 12) {
        out.add(m);
        if (m === b) break;
      }
    } else {
      const m = MONTH_ABBR[t];
      if (m !== undefined) out.add(m);
    }
  }
  return out;
}

const monthSets = DESTINATIONS.map((d) => ({
  dest: d,
  months: parseBestMonths(d.bestMonths),
}));

function seasonalPanels(hub: GuideHub): MddPanelData[] {
  const counts = guideCountMap(hub);
  return MONTH_LABELS.map((label, mi) => {
    const dests = monthSets
      .filter((e) => e.months.has(mi))
      .map((e) => e.dest)
      .sort((a, b) => byPopularity(a, b, counts));
    return {
      label,
      moreLabel: "More destinations",
      cards: dests.map((d) => toCard(d)),
    };
  });
}

// ── Block 03 主题精选：现有真实字段映射出 5 个主题面板 ────────────────────

/** 由 guide tags + departureDate 派生的 season（guides-hub 真实字段）。 */
function seasonOfMonth(month: number): "Spring" | "Summer" | "Autumn" | "Winter" {
  // 气象季节：Dec-Feb 冬 / Mar-May 春 / Jun-Aug 夏 / Sep-Nov 秋
  if (month <= 1 || month === 11) return "Winter";
  if (month <= 4) return "Spring";
  if (month <= 7) return "Summer";
  return "Autumn";
}

function themePanels(hub: GuideHub): MddPanelData[] {
  const counts = guideCountMap(hub);
  const now = new Date();
  const month = now.getUTCMonth();
  const season = seasonOfMonth(month);

  const dedupe = (dests: Destination[]): MddCardData[] => {
    const seen = new Set<string>();
    const out: MddCardData[] = [];
    for (const d of dests) {
      if (seen.has(d.slug)) continue;
      seen.add(d.slug);
      out.push(toCard(d));
    }
    return out;
  };
  const citiesToDests = (cities: string[]): Destination[] => {
    const seen = new Set<string>();
    const out: Destination[] = [];
    for (const city of cities) {
      const d = destinationByCity.get(city.toLowerCase());
      if (d && !seen.has(d.slug)) {
        seen.add(d.slug);
        out.push(d);
      }
    }
    return out;
  };

  // 1. 全年适宜：bestMonths 真实窗口 ≥ 6 个月的目的地
  const yearRound = monthSets
    .filter((e) => e.months.size >= 6)
    .map((e) => e.dest)
    .sort((a, b) => byPopularity(a, b, counts));

  // 2. 季节：guides 真实派生 season 命中当前季节的城市
  const seasonCities = hub.cards
    .filter((c) => c.season === season)
    .map((c) => c.city);
  const bySeason = citiesToDests(seasonCities).sort((a, b) =>
    byPopularity(a, b, counts),
  );

  // 3. 出行方式：hub.styles 中真实命中最多 guide 的 style
  const topStyle = hub.styles.reduce<(typeof hub.styles)[number] | null>(
    (best, s) => (best === null || s.count > best.count ? s : best),
    null,
  );
  const styleCities = topStyle
    ? hub.cards.filter((c) => c.styles.includes(topStyle.key)).map((c) => c.city)
    : [];
  const byStyle = citiesToDests(styleCities).sort((a, b) =>
    byPopularity(a, b, counts),
  );

  // 4. 节假日：event guides（planner 带 departureDate）真实命中
  const eventCities = hub.cards.filter((c) => c.event).map((c) => c.city);
  const byEvent = citiesToDests(eventCities).sort((a, b) =>
    byPopularity(a, b, counts),
  );

  // 5. 用户搜索（热度）：guide 数最多的城市
  const popular = [...DESTINATIONS].sort((a, b) => byPopularity(a, b, counts));

  const panels: MddPanelData[] = [
    { label: "Year-round", moreLabel: "More destinations", cards: dedupe(yearRound) },
    { label: `By season · ${season}`, moreLabel: "More destinations", cards: dedupe(bySeason) },
  ];
  if (topStyle) {
    panels.push({
      label: topStyle.label,
      moreLabel: "More destinations",
      cards: dedupe(byStyle),
    });
  }
  panels.push(
    { label: "Holidays & events", moreLabel: "More destinations", cards: dedupe(byEvent) },
    { label: "Popular searches", moreLabel: "More destinations", cards: dedupe(popular) },
  );
  return panels;
}

// ── All destinations：Region → Country → City 全展开完整目录（无 Tab） ────
// 数据全部取自 Destination 真实字段（region / country / city），
// 不手写归属。country 仅做同义归一（"United States" → "USA"，取多数字段值）。

const COUNTRY_NORMALIZE: Record<string, string> = {
  "United States": "USA",
};

function directoryGroups(hub: GuideHub): DirectoryRegionGroup[] {
  const counts = guideCountMap(hub);
  return DIRECTORY_REGIONS.map((region) => {
    const byCountry = new Map<string, Destination[]>();
    for (const d of DESTINATIONS) {
      if (d.region !== region) continue;
      const country = COUNTRY_NORMALIZE[d.country] ?? d.country;
      const bucket = byCountry.get(country);
      if (bucket) bucket.push(d);
      else byCountry.set(country, [d]);
    }
    const countries = [...byCountry.entries()]
      .map(([country, dests]) => ({
        country,
        cities: dests
          .sort((a, b) => byPopularity(a, b, counts))
          .map((d) => {
            const count = counts.get(d.city.toLowerCase()) ?? 0;
            return {
              name: d.city,
              guides: count,
              // 城市唯一页规则：与图片卡一致，一律指向 /destinations/<slug>。
              href: `/destinations/${d.slug}`,
            };
          }),
      }))
      .sort(
        (a, b) =>
          b.cities.length - a.cities.length ||
          a.country.localeCompare(b.country),
      );
    const total = countries.reduce((n, c) => n + c.cities.length, 0);
    return { region, total, countries };
  });
}

// ── Promo Banner：参考站 section.focus（2.5:1 通栏图 + 标题覆盖 + 右箭头） ──

/** 从有真实图片的目的地里按偏好取第一个（只用项目已有真实资源）。 */
const BANNER_CITY_PREFERENCE = [
  "Paris", "Tokyo", "Barcelona", "Sydney", "New York", "Rome",
  "Bangkok", "London", "Dubai", "Singapore", "Istanbul", "Seoul",
];

function buildBanner() {
  for (const city of BANNER_CITY_PREFERENCE) {
    const d = destinationByCity.get(city.toLowerCase());
    if (d?.image) return d;
  }
  return DESTINATIONS.find((d) => d.image) ?? null;
}

// ── Page ───────────────────────────────────────────────────────────────

export default async function GuidesHubPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const hub = getGuideHub();

  // 城市唯一页规则：/guides?city=X 是旧城市聚合视图的深链。
  // 一个城市只有一个正式内页 → 永久重定向（308）到 /destinations/<slug>，
  // 该城的 guide 内容由 Destination Detail 内的 Guides 模块承载。
  const cityParam = typeof sp.city === "string" ? sp.city.trim() : "";
  if (cityParam) {
    const cityDestination = destinationByCity.get(cityParam.toLowerCase());
    if (!cityDestination) notFound();
    permanentRedirect(`/destinations/${cityDestination.slug}`);
  }

  const banner = buildBanner();
  const now = new Date();
  const currentMonth = now.getUTCMonth();

  return (
    // 参考站页面背景为白底、#e6e6e6 实线分块（真实 CSS 取值）
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-[1190px]">
        <>
          {/* 搜索条（参考站 searchbox：最顶部、左右 15px） */}
            <div className="px-[15px] pt-[10px] pb-[10px]">
              <GuideSearch
                docs={hub.cards.map((c) => ({
                  slug: c.slug,
                  title: c.title,
                  city: c.city,
                  country: c.country,
                  tags: c.tags,
                }))}
              />
            </div>

            {/* 推广 Banner（section.focus：2.5:1 通栏图 + 标题覆盖 + 右箭头） */}
            {banner && (
              <section aria-label="Featured destination">
                <Link href={`/destinations/${banner.slug}`} className="group relative block">
                  <div className="relative aspect-[5/2] w-full overflow-hidden bg-[#f2f2f2]">
                    <Image
                      src={banner.image as string}
                      alt={banner.city}
                      fill
                      priority
                      sizes="(max-width: 1190px) 100vw, 1190px"
                      className="object-cover"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/55 to-transparent"
                    />
                    <p className="absolute bottom-[14px] left-[15px] max-w-[80%] text-[16px] leading-snug text-white line-clamp-2">
                      {banner.description}
                    </p>
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="absolute right-[12px] top-1/2 h-6 w-6 -translate-y-1/2 text-white/90"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </div>
                </Link>
              </section>
            )}

            <div className="px-[15px]">
              {/* Block 01 热门目的地（region tab） */}
              <MddSection
                id="mdd-popular"
                title="Popular destinations"
                titleLevel="h1"
                subtitle="The destinations travellers love the most"
                panels={popularPanels(hub)}
              />

              {/* Block 02 当季推荐（12 月 tab，默认当前月） */}
              <MddSection
                id="mdd-seasonal"
                title="Seasonal picks"
                subtitle="Where to go in each month of the year"
                panels={seasonalPanels(hub)}
                defaultPanel={currentMonth}
              />

              {/* Block 03 主题精选（真实字段映射的 5 个主题 tab） */}
              <MddSection
                id="mdd-themes"
                title="Theme picks"
                subtitle="Find destinations by theme"
                panels={themePanels(hub)}
              />

              {/* All destinations：Region → Country → City 全部展开，无 Tab */}
              <DestinationDirectory groups={directoryGroups(hub)} />
              <GuidesDirectoryTracker />
            </div>
        </>
      </div>
    </div>
  );
}

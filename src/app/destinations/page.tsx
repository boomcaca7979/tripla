import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { DESTINATIONS, type Destination } from "@/data/destinations";
import DestinationsSearch from "@/components/destinations/DestinationsSearch";
import MddSection, {
  type MddPanelData,
  type MddCardData,
} from "@/components/destinations/MddBlocks";
import DestinationDirectory, {
  type DirectoryRegionGroup,
} from "@/components/destinations/DestinationDirectory";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "A destination directory — browse every city Utripla covers by region, season and theme.",
  alternates: {
    canonical: "/destinations",
  },
  openGraph: {
    title: "Destinations",
    description:
      "A destination directory — browse every city Utripla covers by region, season and theme.",
    type: "website",
    url: "https://www.utripla.xyz/destinations",
  },
};

// ── 马蜂窝 /mdd/ 1:1 复刻（原 /guides hub 页结构原样迁移到 /destinations） ──
// 页面结构 = 轻搜索条 → 推广 Banner → Block01 热门目的地（region tab）
//   → Block02 当季推荐（12 月 tab）→ Block03 主题精选（主题 tab）
//   → All destinations（Region → Country → City 全展开目录）。
// 与原版的差异仅限功能必需项：数据全部改为现存 DESTINATIONS 字段
// （原 guide 派生的热度/season/style/事件计数不再存在），城市链接一律
// 指向真实存在的 /destinations/<slug>，不恢复任何 Guides 数据。

// ── city → destination 索引 ─────────────────────────────────────────────

const destinationByCity = new Map<string, Destination>(
  DESTINATIONS.map((d) => [d.city.toLowerCase(), d]),
);

const DIRECTORY_REGIONS = ["Asia", "Europe", "Americas", "Oceania", "Africa"] as const;

// ── guide 数（原热度代理）随 Guides 下线不再存在 ─────────────────────────
// 保持 byPopularity 原实现不动：counts 恒为空 → 退化为按城市名排序。

function guideCountMap(): Map<string, number> {
  return new Map();
}

function toCard(d: Destination): MddCardData {
  return {
    key: d.slug,
    city: d.city,
    image: d.image,
    gradient: d.gradient,
    // 城市唯一页规则：点城市 = 进入该城市唯一的正式内页 /destinations/<slug>。
    href: `/destinations/${d.slug}`,
  };
}

/** 按 guide 数降序（原「最受大家喜欢」= 热度优先）；无 guide 数据时按城市名。 */
function byPopularity(a: Destination, b: Destination, counts: Map<string, number>) {
  const ca = counts.get(a.city.toLowerCase()) ?? 0;
  const cb = counts.get(b.city.toLowerCase()) ?? 0;
  if (cb !== ca) return cb - ca;
  return a.city.localeCompare(b.city);
}

// ── Block 01 热门目的地：region tab，全部 205 张都在面板里 ────────────────

function popularPanels(): MddPanelData[] {
  const counts = guideCountMap();
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

function seasonalPanels(): MddPanelData[] {
  const counts = guideCountMap();
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

// ── Block 03 主题精选：现有真实字段映射出主题面板 ──────────────────────────

/** 气象季节：Dec-Feb 冬 / Mar-May 春 / Jun-Aug 夏 / Sep-Nov 秋（原实现保留）。 */
function seasonOfMonth(month: number): "Spring" | "Summer" | "Autumn" | "Winter" {
  if (month <= 1 || month === 11) return "Winter";
  if (month <= 4) return "Spring";
  if (month <= 7) return "Summer";
  return "Autumn";
}

/** 原版由 guide 派生 season；现用 bestMonths 真实窗口与季节月份求交集。 */
function seasonMonthSet(season: "Spring" | "Summer" | "Autumn" | "Winter"): Set<number> {
  if (season === "Spring") return new Set([2, 3, 4]);
  if (season === "Summer") return new Set([5, 6, 7]);
  if (season === "Autumn") return new Set([8, 9, 10]);
  return new Set([11, 0, 1]);
}

function themePanels(): MddPanelData[] {
  const counts = guideCountMap();
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

  // 1. 全年适宜：bestMonths 真实窗口 ≥ 6 个月的目的地（原逻辑保留）
  const yearRound = monthSets
    .filter((e) => e.months.size >= 6)
    .map((e) => e.dest)
    .sort((a, b) => byPopularity(a, b, counts));

  // 2. 季节：原为 guide season 字段；现取 bestMonths 命中当前季节的目的地
  const seasonMonths = seasonMonthSet(season);
  const bySeason = monthSets
    .filter((e) => [...e.months].some((m) => seasonMonths.has(m)))
    .map((e) => e.dest)
    .sort((a, b) => byPopularity(a, b, counts));

  // 3. 出行方式：原为 hub.styles（guide styles）；现取 DESTINATIONS 中
  //    真实 travelStyle 字段出现最多的 style，列出该 style 的目的地
  const styleCounts = new Map<string, number>();
  for (const d of DESTINATIONS) {
    styleCounts.set(d.travelStyle, (styleCounts.get(d.travelStyle) ?? 0) + 1);
  }
  const topStyle = [...styleCounts.entries()].reduce<[string, number] | null>(
    (best, [key, count]) => (best === null || count > best[1] ? [key, count] : best),
    null,
  );
  const byStyle = topStyle
    ? DESTINATIONS.filter((d) => d.travelStyle === topStyle[0]).sort((a, b) =>
        byPopularity(a, b, counts),
      )
    : [];

  // 4. 用户搜索（热度）：原为 guide 数最多的城市；现全量目的地按名排序。
  //    （原「Holidays & events」面板数据源为 event guides，随 Guides 下线
  //    不再有真实数据源，面板随之移除 —— 不造假数据。）
  const popular = [...DESTINATIONS].sort((a, b) => byPopularity(a, b, counts));

  const panels: MddPanelData[] = [
    { label: "Year-round", moreLabel: "More destinations", cards: dedupe(yearRound) },
    { label: `By season · ${season}`, moreLabel: "More destinations", cards: dedupe(bySeason) },
  ];
  if (topStyle) {
    panels.push({
      label: `${topStyle[0].charAt(0).toUpperCase()}${topStyle[0].slice(1)}`,
      moreLabel: "More destinations",
      cards: dedupe(byStyle),
    });
  }
  panels.push(
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

function directoryGroups(): DirectoryRegionGroup[] {
  const counts = guideCountMap();
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

// ── 搜索索引：完全派生自 DESTINATIONS（slug = 目的地 slug） ────────────────

const SEARCH_DOCS = DESTINATIONS.map((d) => ({
  slug: d.slug,
  title: d.city,
  city: d.country,
  tags: [] as string[],
}));

// ── Page ───────────────────────────────────────────────────────────────

export default function DestinationsHubPage() {
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
              <DestinationsSearch docs={SEARCH_DOCS} />
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
                panels={popularPanels()}
              />

              {/* Block 02 当季推荐（12 月 tab，默认当前月） */}
              <MddSection
                id="mdd-seasonal"
                title="Seasonal picks"
                subtitle="Where to go in each month of the year"
                panels={seasonalPanels()}
                defaultPanel={currentMonth}
              />

              {/* Block 03 主题精选（真实字段映射的主题 tab） */}
              <MddSection
                id="mdd-themes"
                title="Theme picks"
                subtitle="Find destinations by theme"
                panels={themePanels()}
              />

              {/* All destinations：Region → Country → City 全部展开，无 Tab */}
              <DestinationDirectory groups={directoryGroups()} />
            </div>
        </>
      </div>
    </div>
  );
}

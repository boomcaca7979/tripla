// Phase 9 Step 8: SEO Audit Script
// 综合检查 metadata / schema / internal links / sitemap
import fs from "node:fs";
import path from "node:path";

const PROJECT_ROOT = "/Users/boomcaca/projects/tripla";
const BUILD_APP = path.join(PROJECT_ROOT, ".next/server/app");

// ── Helpers ────────────────────────────────────────────────────────────

const TITLE_SUFFIX = " | tripla";
const TITLE_MIN = 50;
const TITLE_MAX = 60;
const DESC_MIN = 140;
const DESC_MAX = 160;

const issues = [];
const allTitles = new Map();
const allDescs = new Map();
let inRangeCount = 0;
let totalCount = 0;

function recordTitle(page, title) {
  const finalTitle = `${title}${TITLE_SUFFIX}`;
  const len = finalTitle.length;
  const outOfRange = len < TITLE_MIN || len > TITLE_MAX;
  totalCount++;
  if (!outOfRange) inRangeCount++;
  console.log(`[title] ${page.padEnd(40)} | len=${String(len).padStart(2)} ${outOfRange ? "❌" : "✓"} | "${finalTitle}"`);
  if (outOfRange) issues.push(`title len ${len} (out of ${TITLE_MIN}-${TITLE_MAX}): ${page}`);
  if (!allTitles.has(finalTitle)) allTitles.set(finalTitle, []);
  allTitles.get(finalTitle).push(page);
}

function recordDesc(page, desc) {
  const len = desc.length;
  const outOfRange = len < DESC_MIN || len > DESC_MAX;
  totalCount++;
  if (!outOfRange) inRangeCount++;
  console.log(`[desc]  ${page.padEnd(40)} | len=${String(len).padStart(3)} ${outOfRange ? "❌" : "✓"} | "${desc.slice(0, 80)}${desc.length > 80 ? "..." : ""}"`);
  if (outOfRange) issues.push(`desc len ${len} (out of ${DESC_MIN}-${DESC_MAX}): ${page}`);
  if (!allDescs.has(desc)) allDescs.set(desc, []);
  allDescs.get(desc).push(page);
}

// ── Data parsers (复用 Phase 6.4 逻辑) ────────────────────────────────

function parseDestinations(src) {
  const dests = [];
  const blocks = src.split(/\n  \{\n/).slice(1);
  for (const block of blocks) {
    const cityMatch = block.match(/^    city: "([^"]+)",/m);
    const countryMatch = block.match(/^    country: "([^"]+)",/m);
    const longDescMatch = block.match(/longDescription:\s*\n?\s*"([^"]+)",/);
    const descMatch = block.match(/^    description: "([^"]+)",/m);
    const bestMonthsMatch = block.match(/^    bestMonths: "([^"]+)",/m);
    const bestSeasonMatch = block.match(/bestSeason:\s*\n?\s*"([^"]+)",/);
    const currencyMatch = block.match(/^    currency: "([^"]+)",/m);
    const recDaysMatch = block.match(/^    recommendedDays: (\d+),/m);
    const budgetPerDayMatch = block.match(/^    budgetPerDay: (\d+),/m);
    const budgetCurrencyMatch = block.match(/^    budgetCurrency: "([^"]+)",/m);
    const weatherLabelMatch = block.match(/label: "([^"]+)",/);
    const weatherRecMatch = block.match(/recommendation: "([^"]+)",/);
    const regionMatch = block.match(/^    region: "([^"]+)",/m);
    const travelStyleMatch = block.match(/^    travelStyle: "([^"]+)",/m);
    if (cityMatch) {
      dests.push({
        city: cityMatch[1],
        country: countryMatch?.[1] ?? "",
        description: descMatch?.[1] ?? "",
        longDescription: longDescMatch?.[1] ?? "",
        bestMonths: bestMonthsMatch?.[1] ?? "",
        bestSeason: bestSeasonMatch?.[1] ?? "",
        currency: currencyMatch?.[1] ?? "",
        recommendedDays: parseInt(recDaysMatch?.[1] ?? "3"),
        budgetPerDay: parseInt(budgetPerDayMatch?.[1] ?? "100"),
        budgetCurrency: budgetCurrencyMatch?.[1] ?? "USD",
        weatherLabel: weatherLabelMatch?.[1] ?? "",
        weatherRec: weatherRecMatch?.[1] ?? "",
        region: regionMatch?.[1] ?? "",
        travelStyle: travelStyleMatch?.[1] ?? "",
      });
    }
  }
  return dests;
}

function parseTrips(src) {
  const trips = [];
  const blocks = src.split(/\n  \{\n/).slice(1);
  for (const block of blocks) {
    const idMatch = block.match(/^    id: "([^"]+)",/m);
    const titleMatch = block.match(/^    title: "([^"]+)",/m);
    const cityMatch = block.match(/^    city: "([^"]+)",/m);
    const countryMatch = block.match(/^    country: "([^"]+)",/m);
    const travelStyleMatch = block.match(/^    travelStyle: "([^"]+)",/m);
    const daysMatch = block.match(/^    days: (\d+),/m);
    const budgetMatch = block.match(/^    estimatedCost: (\d+),/m);
    const currencyMatch = block.match(/^    currency: "([^"]+)",/m);
    const excerptMatch = block.match(/excerpt:\s*\n?\s*"([^"]+)",/);
    if (idMatch && titleMatch && excerptMatch) {
      trips.push({
        slug: idMatch[1],
        title: titleMatch[1],
        description: excerptMatch[1],
        city: cityMatch?.[1] ?? "",
        country: countryMatch?.[1] ?? "",
        travelStyle: travelStyleMatch?.[1] ?? "",
        days: parseInt(daysMatch?.[1] ?? "3"),
        budget: parseInt(budgetMatch?.[1] ?? "0"),
        currency: currencyMatch?.[1] ?? "USD",
      });
    }
  }
  return trips;
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// ── Metadata 公式 (复刻 page.tsx) ─────────────────────────────────────

function buildTripTitle(t) {
  const style = cap(t.travelStyle);
  const candidates = [
    `${t.title} · ${t.days}-Day ${style} Plan`,
    `${t.title} · ${t.days}-Day ${style} Trip`,
    `${t.title} · ${t.days}-Day ${style} Trip Plan`,
    `${t.title} · ${t.days}-Day ${style} ${t.country} Plan`,
    `${t.title} · ${t.days}-Day ${style} ${t.country} Trip Plan`,
  ];
  let chosen = candidates[0];
  for (const c of candidates) {
    if (c.length <= 51) {
      chosen = c;
      if (c.length >= 41) break;
    }
  }
  return chosen;
}

function buildTripMetaDescription(t) {
  const suffix = ` ${t.days}-day ${t.travelStyle} itinerary in ${t.city}, ${t.country}.`;
  const base = `${t.description}${suffix}`;
  if (base.length >= 140 && base.length <= 160) return base;
  if (base.length > 160) {
    const maxDesc = 160 - suffix.length - 1;
    return t.description.slice(0, Math.max(0, maxDesc)).trimEnd() + "…" + suffix;
  }
  const withBudget = `${base} Total budget: ${t.budget} ${t.currency}.`;
  if (withBudget.length <= 160) return withBudget;
  return withBudget.slice(0, 159).trimEnd() + "…";
}

function buildDestinationTitle(d) {
  const base = `${d.city} Travel Guide`;
  if (d.city === d.country) {
    return `${base} · Top Highlights & Tips`;
  }
  if (d.country.length > 12) {
    return `${base} · ${d.country} Highlights`;
  }
  return `${base} · ${d.country} Highlights & Tips`;
}

function buildDestinationMetaDescription(d) {
  const suffix = ` Best time: ${d.bestMonths}. Stay: ${d.recommendedDays} days. Budget: ${d.budgetPerDay} ${d.budgetCurrency}/day.`;
  const maxPrefix = 160 - suffix.length;
  let prefix = d.longDescription;
  if (prefix.length > maxPrefix) {
    prefix = prefix.slice(0, Math.max(0, maxPrefix - 1)).trimEnd() + "…";
  }
  return prefix + suffix;
}

function buildTravelBudgetMetaDescription(d) {
  const total = d.budgetPerDay * d.recommendedDays;
  const prefix = `Daily cost in ${d.city}: ${d.budgetPerDay} ${d.budgetCurrency}. Total for ${d.recommendedDays} days: ${total} ${d.budgetCurrency}. `;
  const remaining = 160 - prefix.length;
  let season = d.bestSeason;
  if (season.length > remaining) {
    season = season.slice(0, Math.max(0, remaining - 1)).trimEnd() + "…";
  }
  return prefix + season;
}

// ── HTML 文件读取 (Phase 9 Step 8) ────────────────────────────────────

function readHtmlIfExists(relPath) {
  const fullPath = path.join(BUILD_APP, relPath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, "utf8");
}

function checkSchemaInHtml(html, page) {
  if (!html) {
    issues.push(`schema: HTML not found for ${page}`);
    return;
  }
  // 必须字段
  const required = ['"url"', '"name"', '"description"'];
  for (const field of required) {
    if (!html.includes(field)) {
      issues.push(`schema: missing ${field} in ${page}`);
    }
  }
  // mainEntityOfPage (Phase 9 Step 6)
  if (!html.includes('"mainEntityOfPage"')) {
    issues.push(`schema: missing mainEntityOfPage in ${page}`);
  }
  // 禁止字段
  const forbidden = ['aggregateRating', '"@type":"Review"', '"@type":"Rating"'];
  for (const field of forbidden) {
    if (html.includes(field)) {
      issues.push(`schema: FORBIDDEN ${field} found in ${page}`);
    }
  }
}

function countInternalLinks(html, page, minRequired) {
  if (!html) {
    issues.push(`internal links: HTML not found for ${page}`);
    return 0;
  }
  // 匹配 href="/trips/...", href="/destinations/...", etc.
  const linkRegex = /href="\/(trips|destinations|travel-budget|travel-styles)\/[^"#]+"/g;
  const matches = html.match(linkRegex) ?? [];
  const uniqueLinks = new Set(matches);
  console.log(`[links] ${page.padEnd(40)} | ${uniqueLinks.size} unique internal links ${uniqueLinks.size >= minRequired ? "✓" : "❌"}`);
  if (uniqueLinks.size < minRequired) {
    issues.push(`internal links: ${page} has ${uniqueLinks.size} (min ${minRequired})`);
  }
  return uniqueLinks.size;
}

// ── Load data ─────────────────────────────────────────────────────────

const destSrc = fs.readFileSync(path.join(PROJECT_ROOT, "src/data/destinations.ts"), "utf8");
const tripSrc = fs.readFileSync(path.join(PROJECT_ROOT, "src/data/trips.ts"), "utf8");

const dests = parseDestinations(destSrc);
const trips = parseTrips(tripSrc);

console.log(`Parsed: ${dests.length} destinations, ${trips.length} trips\n`);

// ── 1. Metadata 长度检查 ──────────────────────────────────────────────

console.log("=== 1. Metadata 长度检查 ===\n");

console.log("--- /trips/[slug] ---");
for (const t of trips) {
  const title = buildTripTitle(t);
  const description = buildTripMetaDescription(t);
  recordTitle(`/trips/${t.slug}`, title);
  recordDesc(`/trips/${t.slug}`, description);
}

console.log("\n--- /destinations/[slug] ---");
for (const d of dests) {
  const title = buildDestinationTitle(d);
  const description = buildDestinationMetaDescription(d);
  recordTitle(`/destinations/${d.city.toLowerCase()}`, title);
  recordDesc(`/destinations/${d.city.toLowerCase()}`, description);
}

// 注：/best-time-to-visit/[slug] 与 /regions 栏目已下线（导航/sitemap/内链均已移除，
// 旧 URL 由 next.config.ts 301 兜底），因此不再对它们做 metadata 断言。

console.log("\n--- /travel-budget/[slug] ---");
for (const d of dests) {
  const title = `${d.city} Travel Budget Guide · ${d.budgetPerDay} ${d.budgetCurrency}/day Trip`;
  const description = buildTravelBudgetMetaDescription(d);
  recordTitle(`/travel-budget/${d.city.toLowerCase()}`, title);
  recordDesc(`/travel-budget/${d.city.toLowerCase()}`, description);
}

console.log("\n=== 2. 重复检查 ===");
let dupFound = false;
for (const [title, pages] of allTitles) {
  if (pages.length > 1) {
    dupFound = true;
    console.log(`❌ 重复 title "${title}": ${pages.join(", ")}`);
    issues.push(`duplicate title: ${pages.join(", ")}`);
  }
}
for (const [desc, pages] of allDescs) {
  if (pages.length > 1) {
    dupFound = true;
    console.log(`❌ 重复 description "${desc.slice(0, 60)}...": ${pages.join(", ")}`);
    issues.push(`duplicate description: ${pages.join(", ")}`);
  }
}
if (!dupFound) console.log("✓ 无重复 title / description");

console.log(`\n=== 3. Schema 检查 (Phase 9 Step 8) ===`);
const schemaPages = [
  { rel: "trips/tokyo-3d-foodie.html", page: "/trips/tokyo-3d-foodie" },
  { rel: "destinations/tokyo.html", page: "/destinations/tokyo" },
  { rel: "travel-budget/tokyo.html", page: "/travel-budget/tokyo" },
];
for (const { rel, page } of schemaPages) {
  const html = readHtmlIfExists(rel);
  if (!html) {
    console.log(`[schema] ${page.padEnd(40)} | HTML not found ❌`);
    issues.push(`schema: HTML not found for ${page}`);
    continue;
  }
  const hasUrl = html.includes('"url"');
  const hasName = html.includes('"name"');
  const hasDesc = html.includes('"description"');
  const hasMEO = html.includes('"mainEntityOfPage"');
  const noAR = !html.includes("aggregateRating");
  const noReview = !html.includes('"@type":"Review"');
  const noRating = !html.includes('"@type":"Rating"');
  const ok = hasUrl && hasName && hasDesc && hasMEO && noAR && noReview && noRating;
  console.log(`[schema] ${page.padEnd(40)} | ${ok ? "✓" : "❌"} | url=${hasUrl} name=${hasName} desc=${hasDesc} mainEntity=${hasMEO} noRating=${noAR && noReview && noRating}`);
  if (!hasUrl) issues.push(`schema: missing url in ${page}`);
  if (!hasName) issues.push(`schema: missing name in ${page}`);
  if (!hasDesc) issues.push(`schema: missing description in ${page}`);
  if (!hasMEO) issues.push(`schema: missing mainEntityOfPage in ${page}`);
  if (!noAR) issues.push(`schema: aggregateRating found in ${page}`);
  if (!noReview) issues.push(`schema: Review found in ${page}`);
  if (!noRating) issues.push(`schema: Rating found in ${page}`);
}

console.log(`\n=== 4. Internal Links 检查 (Phase 9 Step 8) ===`);
// Trip: >=5, Destination: >=4, Landing: >=3
const sampleTripHtml = readHtmlIfExists("trips/tokyo-3d-foodie.html");
countInternalLinks(sampleTripHtml, "/trips/tokyo-3d-foodie", 5);

const sampleDestHtml = readHtmlIfExists("destinations/tokyo.html");
countInternalLinks(sampleDestHtml, "/destinations/tokyo", 4);

const landingPages = [
  { rel: "travel-styles/foodie.html", page: "/travel-styles/foodie", min: 3 },
  { rel: "trips.html", page: "/trips", min: 3 },
  { rel: "destinations.html", page: "/destinations", min: 3 },
  { rel: "travel-budget.html", page: "/travel-budget", min: 3 },
];
for (const { rel, page, min } of landingPages) {
  const html = readHtmlIfExists(rel);
  countInternalLinks(html, page, min);
}

console.log(`\n=== 5. Sitemap 检查 (Phase 9 Step 8) ===`);
const sitemapPath = path.join(BUILD_APP, "sitemap.xml.body");
if (fs.existsSync(sitemapPath)) {
  const sitemap = fs.readFileSync(sitemapPath, "utf8");
  const urlMatches = sitemap.match(/<loc>([^<]+)<\/loc>/g) ?? [];
  const urls = urlMatches.map((m) => m.replace(/<\/?loc>/g, ""));
  const uniqueUrls = new Set(urls);
  console.log(`[sitemap] total URLs: ${urls.length}`);
  console.log(`[sitemap] unique URLs: ${uniqueUrls.size}`);
  if (urls.length !== uniqueUrls.size) {
    issues.push(`sitemap: ${urls.length - uniqueUrls.size} duplicate URLs`);
  }
  // 检查关键 URL 存在
  const requiredHubs = [
    "https://www.utripla.xyz/trips",
    "https://www.utripla.xyz/destinations",
    "https://www.utripla.xyz/travel-budget",
    "https://www.utripla.xyz/travel-styles",
  ];
  for (const hub of requiredHubs) {
    if (!uniqueUrls.has(hub)) {
      console.log(`[sitemap] missing hub: ${hub} ❌`);
      issues.push(`sitemap: missing ${hub}`);
    }
  }
  console.log(`[sitemap] all ${requiredHubs.length} hubs present ✓`);
} else {
  console.log(`[sitemap] sitemap.xml.body not found ❌ (run npm run build first)`);
  issues.push("sitemap: build output not found");
}

// ── 汇总 ─────────────────────────────────────────────────────────────

console.log(`\n=== 汇总 ===`);
console.log(`总页面数 (metadata): ${trips.length + dests.length * 2}`);
console.log(`总 title+desc 计数: ${totalCount}`);
console.log(`范围内: ${inRangeCount}/${totalCount} (${Math.round(inRangeCount / totalCount * 100)}%)`);
console.log(`问题数: ${issues.length}`);

console.log(`\n=== SEO Audit Report ===`);
if (issues.length === 0) {
  console.log("PASS ✓");
} else {
  console.log("FAIL ❌");
  console.log("\nIssues:");
  for (const i of issues) console.log(`  - ${i}`);
}

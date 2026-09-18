import { cache } from "../cache";

/**
 * Viator Partner API（Basic Affiliate tier）— server-side wrapper。
 *
 * 能力边界（官方 Basic Access 确认，2026-09）：
 *   · Base URL: https://api.viator.com/partner；认证 header: exp-api-key。
 *   · 可用端点：POST /products/search（产品摘要：title / 简介 / 封面图 /
 *     review 评分与数量 / 价格）、GET /destinations（城市→destinationId）。
 *   · 只展示 provider 真实返回的字段；价格缺失 → 不显示价格、不进 My Trip 预算。
 *   · affiliate attribution：productUrl 拼 partnerId（VIATOR_PARTNER_ID）。
 *   · 无 key → 一切函数返回 unavailable；调用方渲染简洁空态，绝不 mock。
 *
 * 缓存策略（免费额度保护，155+ 城不爆量）：
 *   · destinationId 映射：7 天（全量一次）。
 *   · 产品搜索结果：24 小时 / 城市。
 */

const VIATOR_BASE = "https://api.viator.com/partner";
const DEST_TTL = 604_800_000; // 7 days
const PRODUCT_TTL = 86_400_000; // 24 hours

export interface ViatorExperience {
  code: string;
  title: string;
  /** provider 简介原文；缺失则不展示该字段。 */
  description?: string;
  /** provider 封面图 URL；缺失则不渲染图片（绝不代图）。 */
  image?: string;
  /** provider 评分原文；缺失则不展示。 */
  rating?: number;
  reviews?: number;
  /** provider 真实起价；缺失则不显示价格、不进入 My Trip 预算。 */
  price?: { amount: number; currency: string };
  /** 带 affiliate attribution 的 Viator 跳转链接。 */
  url: string;
}

export interface ViatorSearchResult {
  available: boolean;
  /** key 缺失 / 无结果 / 上游失败的具体原因（用于空态与日志）。 */
  reason?: "no-api-key" | "no-destination" | "no-results" | "upstream-error";
  /** 城市 Viator 搜索入口（含 affiliate 归因）；空态时也提供真实搜索能力。 */
  searchUrl: string;
  products: ViatorExperience[];
}

function apiKey(): string | null {
  const key = process.env.VIATOR_API_KEY?.trim();
  return key ? key : null;
}

/** Affiliate attribution：Viator productUrl（官方已含 mcid/pid 归因参数）兜底拼 PID；绝不重复。 */
function buildViatorUrl(productUrl: string | undefined, fallbackQuery: string): string {
  let base: string;
  if (productUrl && /^https?:\/\//.test(productUrl)) {
    base = productUrl;
  } else if (productUrl) {
    base = `https://www.viator.com${productUrl}`;
  } else {
    base = `https://www.viator.com/searchResults/all?text=${encodeURIComponent(fallbackQuery)}`;
  }
  if (/([?&])pid=/.test(base)) return base; // 官方 productUrl 已带 pid 归因
  const pid = process.env.VIATOR_PARTNER_ID?.trim();
  if (!pid) return base;
  return base.includes("?") ? `${base}&partnerId=${encodeURIComponent(pid)}` : `${base}?partnerId=${encodeURIComponent(pid)}`;
}

interface ViatorDestination {
  destinationId: number;
  name: string;
}

/**
 * 目的地解析结果 —— **必须区分三种失败**，否则"上游抖动/限流/超时"会被
 * 误报成"这个城市在 Viator 不存在"，并被下游当成正常空态缓存下来。
 */
type DestinationResolution =
  | { kind: "ok"; destinationId: number }
  /** key 无效/未激活（401）。 */
  | { kind: "unauthorized" }
  /** 列表**成功取回**，但确实没有这个城市 —— 唯一的真 no-destination。 */
  | { kind: "not-found" }
  /** 列表没取回来（非 2xx / 超时 / 空列表）—— 基建问题，不是城市不存在。 */
  | { kind: "upstream" };

const DEST_FETCH_ATTEMPTS = 3; // 1 次首发 + 2 次重试
const DEST_FAILURE_TTL = 60_000; // 上游失败短缓存 60s，避免 1.19MB 列表被反复请求

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 拉取城市 → destinationId 全量映射（约 1.19MB / 3394 条）。带有限重试：
 * 单次抖动不应让整个城市空态化。空列表同样视为上游异常（正常响应不会是空的）。
 */
async function fetchDestinationList(
  key: string,
): Promise<ViatorDestination[] | "unauthorized" | "upstream"> {
  let lastDetail = "unknown";
  for (let attempt = 0; attempt < DEST_FETCH_ATTEMPTS; attempt++) {
    if (attempt > 0) await sleep(250 * attempt);
    try {
      const res = await fetch(`${VIATOR_BASE}/destinations`, {
        headers: {
          "exp-api-key": key,
          Accept: "application/json;version=2.0",
          "Accept-Language": "en",
        },
        signal: AbortSignal.timeout(15_000),
      });
      if (res.status === 401) return "unauthorized";
      if (!res.ok) {
        lastDetail = `HTTP ${res.status}`;
        console.warn(`[viator] /destinations upstream ${res.status} (attempt ${attempt + 1})`);
        continue;
      }
      const body = (await res.json()) as { destinations?: ViatorDestination[] };
      const list = body.destinations ?? [];
      if (list.length === 0) {
        lastDetail = "empty list";
        console.warn(`[viator] /destinations returned 0 entries (attempt ${attempt + 1})`);
        continue;
      }
      return list;
    } catch (err) {
      lastDetail = err instanceof Error ? err.message : String(err);
      console.warn(`[viator] /destinations fetch failed (attempt ${attempt + 1}):`, lastDetail);
    }
  }
  console.warn("[viator] /destinations giving up:", lastDetail);
  return "upstream";
}

/**
 * 城市 → Viator destinationId（全量列表缓存 7 天）。
 *
 * 关键：`upstream` 失败**绝不**降级为 `not-found`，也**绝不**进入 7 天列表缓存
 * ——只有 60s 的失败短缓存，让上游恢复后立刻自愈。
 */
async function resolveDestination(
  city: string,
): Promise<DestinationResolution> {
  const listKey = `viator_destinations`;
  const failureKey = `viator_destinations_failed`;

  let list = cache.get<ViatorDestination[]>(listKey);
  if (list === null) {
    // 上游刚失败过 → 60s 内不再重复拉 1.19MB（但仍如实报告 upstream）。
    if (cache.get<number>(failureKey) !== null) return { kind: "upstream" };

    const key = apiKey();
    if (!key) return { kind: "upstream" };

    const fetched = await fetchDestinationList(key);
    if (fetched === "unauthorized") return { kind: "unauthorized" };
    if (fetched === "upstream") {
      cache.set(failureKey, Date.now(), DEST_FAILURE_TTL);
      return { kind: "upstream" };
    }
    list = fetched;
    cache.set(listKey, list, DEST_TTL);
  }

  const q = city.trim().toLowerCase();
  const exact = list.find((d) => (d.name ?? "").trim().toLowerCase() === q);
  if (exact) return { kind: "ok", destinationId: exact.destinationId };
  const prefix = list.find((d) =>
    (d.name ?? "").trim().toLowerCase().startsWith(q),
  );
  return prefix
    ? { kind: "ok", destinationId: prefix.destinationId }
    : { kind: "not-found" };
}

/** 统一的解析失败 → 空态结果映射（不 mock、不猜）。 */
function resolutionFailure(
  resolution: Exclude<DestinationResolution, { kind: "ok" }>,
  searchUrl: string,
): ViatorSearchResult {
  const reason: NonNullable<ViatorSearchResult["reason"]> =
    resolution.kind === "unauthorized"
      ? "no-api-key"
      : resolution.kind === "upstream"
        ? "upstream-error"
        : "no-destination";
  return { available: false, reason, searchUrl, products: [] };
}

/**
 * Viator 结果的 HTTP 缓存策略（route handler 唯一出口，避免各处手写漂移）。
 *
 * 致命反模式（已修）：对**所有**结果统一下发 `s-maxage=86400`。一次上游抖动
 * 产生的 `upstream-error` / `no-destination` 会被 CDN 锁死 24 小时，表现为
 * "某个城市整天空白、其它城市正常"。因此只有成功结果长缓存，失败必须短 TTL
 * 或不缓存，保证自愈。
 */
export function viatorCacheControl(result: ViatorSearchResult): string {
  if (result.available && result.products.length > 0) {
    return "public, s-maxage=86400, stale-while-revalidate=3600";
  }
  switch (result.reason) {
    // provider 明确回答"这里没有可售产品" → 可缓存，但比成功短。
    case "no-results":
      return "public, s-maxage=3600, stale-while-revalidate=600";
    // 不在 Viator 列表 → 列表本身是静态的，短 TTL 以便数据侧修正。
    case "no-destination":
      return "public, s-maxage=300, stale-while-revalidate=60";
    // 缺 key / 上游故障 = 基建问题，**绝不缓存**。
    default:
      return "no-store";
  }
}

/** 防御性提取封面图（优先 isCover；provider 返回才展示）。 */
function pickImage(images: unknown): string | undefined {
  if (!Array.isArray(images) || images.length === 0) return undefined;
  type ImageObj = { isCover?: boolean; variants?: { url?: string; width?: number }[] };
  const list = images as ImageObj[];
  const cover = list.find((i) => i.isCover === true);
  const chosenImage: ImageObj | undefined = cover ?? list[0];
  const variants = chosenImage?.variants ?? [];
  if (variants.length === 0) return undefined;
  const sorted = [...variants].sort((a, b) => (a.width ?? 0) - (b.width ?? 0));
  const chosen = sorted.find((v) => (v.width ?? 0) >= 640) ?? sorted[sorted.length - 1];
  return chosen?.url || undefined;
}

/** 防御性映射 /products/search 原始响应 → ViatorExperience[]（城市/景点搜索共用）。 */
function mapProductList(raw: unknown[], fallbackQuery: string): ViatorExperience[] {
  return raw
    .map((p) => {
      const product = p as {
        productCode?: string;
        title?: string;
        shortDescription?: string;
        description?: string;
        productUrl?: string;
        images?: unknown;
        reviews?: { combinedAverageRating?: number; totalReviews?: number };
        pricing?: { fromPrice?: number; summary?: { fromPrice?: number; currency?: string } };
      };
      if (!product.productCode || !product.title) return null;
      // 真实响应：pricing.fromPrice（币种 = 请求指定的 USD）；兼容 summary 包裹。
      const fromPrice =
        typeof product.pricing?.fromPrice === "number"
          ? product.pricing.fromPrice
          : product.pricing?.summary?.fromPrice;
      const price =
        typeof fromPrice === "number" && fromPrice > 0
          ? { amount: fromPrice, currency: product.pricing?.summary?.currency ?? "USD" }
          : undefined;
      const experience: ViatorExperience = {
        code: product.productCode,
        title: product.title,
        description: product.shortDescription ?? product.description,
        image: pickImage(product.images),
        rating:
          typeof product.reviews?.combinedAverageRating === "number"
            ? product.reviews.combinedAverageRating
            : undefined,
        reviews:
          typeof product.reviews?.totalReviews === "number" ? product.reviews.totalReviews : undefined,
        price,
        url: buildViatorUrl(product.productUrl, fallbackQuery),
      };
      return experience;
    })
    .filter((p): p is ViatorExperience => p !== null);
}

/** 按城市搜索可预订体验（Basic /products/search；缓存 24h）。 */
export async function searchCityExperiences(city: string, limit = 6): Promise<ViatorSearchResult> {
  const searchUrl = buildViatorUrl(undefined, `${city} things to do`);
  if (!apiKey()) return { available: false, reason: "no-api-key", searchUrl, products: [] };

  const dest = await resolveDestination(city);
  if (dest.kind !== "ok") return resolutionFailure(dest, searchUrl);
  const destId = dest.destinationId;

  const key = `viator_products_${destId}_${limit}`;
  const cached = cache.get<ViatorSearchResult>(key);
  if (cached !== null) return cached;

  try {
    const res = await fetch(`${VIATOR_BASE}/products/search`, {
      method: "POST",
      headers: {
        "exp-api-key": apiKey() as string,
        "Content-Type": "application/json",
        Accept: "application/json;version=2.0",
        "Accept-Language": "en",
      },
      body: JSON.stringify({
        currency: "USD",
        filtering: { destination: String(destId) },
        sorting: { sort: "TRAVELER_RATING", order: "DESCENDING" },
        pagination: { start: 1, count: limit },
      }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) {
      // 401 = key 无效/未激活（与缺 key 同等空态）；其余上游错误走 upstream-error。
      const reason = res.status === 401 ? "no-api-key" : "upstream-error";
      const result: ViatorSearchResult = { available: false, reason, searchUrl, products: [] };
      cache.set(key, result, 600_000); // 失败结果短缓存 10 分钟，避免爆量重试
      return result;
    }
    const body = (await res.json()) as { products?: unknown[] };
    const raw = Array.isArray(body.products) ? body.products : [];
    const products = mapProductList(raw, `${city} things to do`);

    const result: ViatorSearchResult =
      products.length > 0
        ? { available: true, searchUrl, products }
        : { available: false, reason: "no-results", searchUrl, products: [] };
    cache.set(key, result, PRODUCT_TTL);
    return result;
  } catch {
    const result: ViatorSearchResult = { available: false, reason: "upstream-error", searchUrl, products: [] };
    cache.set(key, result, 600_000);
    return result;
  }
}

/**
 * Attraction 级可预订产品搜索（Tickets & Experiences；Basic /products/search
 * + searchTerm，缓存 24h）。
 *
 * 诚信边界：只返回 provider 真实产品；product 与 attraction 的相关性由
 * provider 全文搜索决定（searchTerm = attraction 名 + 城市）。标题原文展示，
 * 绝不把无关 city tour 标注为某景点的官方门票。
 */
export async function searchAttractionTickets(params: {
  attraction: string;
  city: string;
  limit?: number;
}): Promise<ViatorSearchResult> {
  const { attraction, city, limit = 6 } = params;
  const searchUrl = buildViatorUrl(undefined, `${attraction} ${city}`);
  if (!apiKey()) return { available: false, reason: "no-api-key", searchUrl, products: [] };

  const dest = await resolveDestination(city);
  if (dest.kind !== "ok") return resolutionFailure(dest, searchUrl);
  const destId = dest.destinationId;

  const key = `viator_attr_${destId}_${attraction.trim().toLowerCase()}_${limit}`;
  const cached = cache.get<ViatorSearchResult>(key);
  if (cached !== null) return cached;

  try {
    const res = await fetch(`${VIATOR_BASE}/products/search`, {
      method: "POST",
      headers: {
        "exp-api-key": apiKey() as string,
        "Content-Type": "application/json",
        Accept: "application/json;version=2.0",
        "Accept-Language": "en",
      },
      body: JSON.stringify({
        currency: "USD",
        searchTerm: `${attraction} ${city}`,
        filtering: { destination: String(destId) },
        pagination: { start: 1, count: limit },
      }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) {
      const reason = res.status === 401 ? "no-api-key" : "upstream-error";
      const result: ViatorSearchResult = { available: false, reason, searchUrl, products: [] };
      cache.set(key, result, 600_000);
      return result;
    }
    const body = (await res.json()) as { products?: unknown[] };
    const raw = Array.isArray(body.products) ? body.products : [];
    const mapped = mapProductList(raw, `${attraction} ${city}`);
    // 相关性过滤（硬规则）：product 标题必须包含 attraction 名中最具区分性
    // 的词元（≥3 字符、剔除城市/国家等泛词）；简介提及不算 —— 泛 city tour /
    // 机场服务绝不能冒充该景点的门票/体验。无相关产品 → 诚实 no-results。
    const generic = new Set([city.trim().toLowerCase(), "thailand", "thai", "city", "tour"]);
    const tokens = attraction
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length >= 3 && !generic.has(t));
    const distinctive =
      tokens.length > 0
        ? tokens.reduce((a, b) => (b.length > a.length ? b : a))
        : null;
    const products =
      distinctive !== null
        ? mapped.filter((p) => p.title.toLowerCase().includes(distinctive))
        : [];
    const result: ViatorSearchResult =
      products.length > 0
        ? { available: true, searchUrl, products }
        : { available: false, reason: "no-results", searchUrl, products: [] };
    cache.set(key, result, PRODUCT_TTL);
    return result;
  } catch {
    const result: ViatorSearchResult = {
      available: false,
      reason: "upstream-error",
      searchUrl,
      products: [],
    };
    cache.set(key, result, 600_000);
    return result;
  }
}

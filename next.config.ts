import type { NextConfig } from "next";
import { DESTINATIONS } from "./src/data/destinations";
import { LEGACY_GUIDE_REDIRECTS } from "./src/data/guide-redirects";
/** 城市名 → 连字符 slug（"New York" → "new-york"）。
 *  先做 Unicode NFD 分解去掉变音符号，否则 "Bogotá" 会退化成 "bogot"
 *  （á 被当作分隔符丢弃），推导出用户永远不会输入的错误别名。 */
function hyphenatedSlug(city: string): string {
  return city
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Destination slug 容错（canonical 不动）。
 *
 * 数据里的 slug 并不总是"城市名连字符化"：`city: "New York"` 的 slug 是
 * `newyork`，而用户/外链更常写成 `/destinations/new-york`（以前的 404）。
 * 这里按**数据本身**推导城市名的连字符形式，只为与 canonical 不同的组合
 * 生成 301 —— 不硬编码任何单一城市。
 *
 * 两条硬约束（防遮蔽与防环）：
 *   · alias === 某个真实 canonical slug → 跳过（绝不把真页面 301 掉）；
 *   · alias 重复 → 只保留第一条。
 */
const CANONICAL_DESTINATION_SLUGS = new Set(DESTINATIONS.map((d) => d.slug));

function buildDestinationSlugAliases() {
  const seen = new Set<string>();
  const out: { source: string; destination: string; statusCode: 301 }[] = [];
  for (const d of DESTINATIONS) {
    const alias = hyphenatedSlug(d.city);
    if (!alias || alias === d.slug) continue; // 无变化 → 不生成自环
    if (CANONICAL_DESTINATION_SLUGS.has(alias)) continue; // 不遮蔽真实页面
    if (seen.has(alias)) continue; // 别名冲突 → 首条优先
    seen.add(alias);
    out.push({
      source: `/destinations/${alias}`,
      destination: `/destinations/${d.slug}`,
      statusCode: 301,
    });
  }
  return out;
}

/** 转义城市名中的正则特殊字符（如 "Bali (Denpasar)"）。 */
function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 城市查询参数 → 唯一目的地页，真实 3xx（渲染前生效）。
 *
 * 背景：`/destinations?city=X`、`/guides?city=X` 是历史深链，旧实现把判断放在
 * 页面组件里；但根 layout 的 loading.tsx 会先流式吐出 shell，`permanentRedirect()`
 * 只能退化成 200 + `<meta refresh>`，`notFound()` 退化成 200 软 404。
 * 移到 config 层后：① 在流式开始前返回真正的 301；② 页面不再读 searchParams，
 * `/destinations` 恢复静态生成。
 *
 * 未知城市不在此处匹配 → 回落成目录页（200，canonical 指向 `/destinations`）。
 * 不生成 `city=.*` 兜底规则：Next 会把原查询串拼进 Location，兜底会形成自环。
 *
 * 大小写：`has.value` 会被编译成 `new RegExp("^" + value + "$")`（见
 * prepare-destination.js 的 matchHas），故按 原样/小写/大写 三个变体做择一匹配，
 * 让 `?city=Paris`、`?city=paris`、`?city=PARIS` 都直达同一页。
 */
function buildCityQueryRedirects(source: "/destinations" | "/guides") {
  return DESTINATIONS.map((d) => {
    const variants = [
      ...new Set([d.city, d.city.toLowerCase(), d.city.toUpperCase(), d.slug]),
    ]
      .map(escapeRegex)
      .join("|");
    return {
      source,
      has: [{ type: "query" as const, key: "city", value: `(?:${variants})` }],
      destination: `/destinations/${d.slug}`,
      statusCode: 301 as const,
    };
  });
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
    ],
  },
  async redirects() {
    return [
      // ── 主域统一：apex → www（301） ─────────────────────────────────────
      // 正式 canonical host 只有一个：https://www.utripla.xyz；
      // apex（utripla.xyz）不再作为最终 200 主站。放在数组最前，apex 上任何
      // 路径先归一到 www，再由后续规则继续处理（例：apex /regions → www/regions
      // → www/destinations）。其它 host（Vercel 部署域名等）不受影响。
      //
      // 自循环安全性：Next 把该条件编译为 `new RegExp("^" + value + "$")`
      // （见 shared/lib/router/utils/prepare-destination.js 的 matchHas），
      // 故 "utripla.xyz" 不会命中 "www.utripla.xyz"。
      // 已在 production build 下用伪造 Host 头实测：apex→301、www→200、其它→200。
      {
        source: "/:path*",
        has: [{ type: "host", value: "utripla.xyz" }],
        destination: "https://www.utripla.xyz/:path*",
        statusCode: 301,
      },
      // 移除用户系统与 SaaS 残留后，将旧入口 301 到首页，避免已收录 URL 404。
      // /login 与 /signup 已恢复为真实认证页（Supabase Auth），不再重定向。
      { source: "/forgot-password", destination: "/", statusCode: 301 },
      { source: "/reset-password", destination: "/", statusCode: 301 },
      { source: "/pricing", destination: "/", statusCode: 301 },
      // ── 已下线栏目：Regions 与 Best Time to Visit ──────────────────────
      // 这两个栏目已从前端导航（Header/Footer）、sitemap 与站内链接中完整移除。
      // 它们此前是公开收录页面，因此这里保留 301 兜底 —— 不产生 404，也不留下
      // 只能靠孤儿页吃收录的 thin content。
      //   · /regions*            → /destinations（区域维度由 Destination 发现层承担）
      //   · /best-time-to-visit* → 对应城市的 /destinations/<slug>（气候/月份数据
      //     仍保留在 Destination 页面内部，只是不再有独立栏目包装）
      { source: "/regions", destination: "/destinations", statusCode: 301 },
      { source: "/regions/:region", destination: "/destinations", statusCode: 301 },
      { source: "/best-time-to-visit", destination: "/destinations", statusCode: 301 },
      {
        source: "/best-time-to-visit/:slug",
        destination: "/destinations/:slug",
        statusCode: 301,
      },
      // ── 城市深链：/destinations?city=X 与 /guides?city=X ────────────────
      // 必须排在下方裸 /guides 规则之前：带 city 的请求若先命中裸规则，会先落到
      // /destinations?city=X，再多一跳才到详情页。
      ...buildCityQueryRedirects("/destinations"),
      ...buildCityQueryRedirects("/guides"),
      // ── 旧 Guides 栏目 URL（栏目已整体下线）逐项处理 ───────────────────
      // 栏目首页 /guides 的路由已删除，但该 URL 在当前生产 sitemap 中仍被收录、
      // 且是 330 条子页的原入口。补一条 301 到真正承接其内容的目的地目录，
      // 避免它从 200 直接变成 404（子页规则见下方 LEGACY_GUIDE_REDIRECTS）。
      { source: "/guides", destination: "/destinations", statusCode: 301 },
      // 只重定向「内容已被对应 Destinations 页面完全取代」的旧 Guide：即其
      // `city` 字段命中真实 DESTINATIONS 城市的条目（映射表由数据派生生成，
      // 见 src/data/guide-redirects.ts 头注）。其余旧 Guide（Global/区域专题、
      // 城市不在目的地数据中的）一律 404 —— 绝不批量重定向到无关页面。
      ...Object.entries(LEGACY_GUIDE_REDIRECTS).map(([guideSlug, destSlug]) => ({
        source: `/guides/${guideSlug}`,
        destination: `/destinations/${destSlug}`,
        statusCode: 301 as const,
      })),
      // Destination slug 容错：连字符写法 301 → canonical slug（如
      // /destinations/new-york → /destinations/newyork）。canonical、sitemap、
      // 页面输出与 Destination Detail 设计均不变；alias 与真 slug 冲突时不生成。
      ...buildDestinationSlugAliases(),
    ];
  },
};

export default nextConfig;

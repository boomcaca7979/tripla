# UTRIPLA 2.0 — Refactor Plan（审计 + 迁移方案 + UI 架构）

> 状态：**方案阶段，未修改任何代码**（遵守执行纪律：审阅通过前不进入大规模修改）
> 定位：**Interactive Travel Discovery** — 纯公开、无账号、无登录、可不断探索的旅行发现网站
> UI 输入：`EPHEMERA-UI-REVERSE-ENGINEERING.md`（吸收设计原理，不复制页面/重型技术）
> 站点：`https://www.utripla.xyz` · Next.js 16.2.7 / React 19.2.4 / Tailwind 4（CSS-first）· 全部内容 SSG（~1100+ URL）

---

## 1. Current Architecture

```
src/
├── app/
│   ├── (auth)/            # 登录/注册/找回密码（客户端 Supabase REST + localStorage，无 SDK、无 DB）
│   ├── api/               # 5 个公开工具 API：weather / geocoding / currency / flights / itinerary
│   ├── destinations/      # Hub + [slug]（147 个目的地，SSG + canonical + JSON-LD）
│   ├── guides/            # Hub + [slug]（322 篇攻略，SSG + Article/FAQ JSON-LD）
│   ├── trips/             # Hub + [slug]（283 条行程模板 = "Routes"，SSG + Trip JSON-LD）
│   ├── regions/           # Hub + [region]（按大洲聚合）
│   ├── travel-styles/     # Hub + [style]（6 种风格）
│   ├── best-time-to-visit/  # Hub + [slug]（与目的地同 slug 空间）
│   ├── travel-budget/     # Hub + [slug]（同上）
│   ├── [slug]/            # 60 个 AI 落地页（dynamicParams=false）
│   ├── plan/              # AI 行程规划器（纯客户端，robots disallow）
│   ├── share/             # base64 URL 分享页（无服务端存储）
│   ├── pricing/           # 不存在的 Pro 订阅营销页（SaaS 残留）
│   ├── sitemap-main.xml/  # 手写 XML 路由（GSC 已注册）+ 内置 sitemap.ts
│   ├── robots.ts · privacy · terms · layout.tsx（AdSense 全站注入）
├── components/  ui/(8 个高质量原语) · layout/ · home/ · search/ · weather/ · currency/ · flight/ · itinerary/ · pdf/ · auth/(10 个)
├── data/        147 目的地 + 283 trips + 322 guides + 60 AI pages + 6 styles（~7,000+ 行内容数据）
├── lib/         affiliate(Travelpayouts) · itinerary-engine(Groq) · api/* · cache · share · i18n · auth(删)
├── hooks/ · store/travel.ts(zustand persist) · types/
```

关键事实：
- **无数据库、无 middleware、无受保护路由**。唯一"账户门槛"是 PDF 导出的客户端登录 gate。
- Auth 是 ~1,700 行孤立的客户端 Supabase 代码，零服务端足迹。
- 内容页全部 `generateStaticParams` + `dynamicParams=false`，是站点的 SEO 核心。
- 无 framer-motion；动效全 CSS（3 个漂浮 orb keyframes + transitions）。
- Design token 几乎为空：仅 `--background/--foreground` + Geist 字体；组件用硬编码 Tailwind 灰/蓝（blue-600 SaaS 观感）；dark mode 实际上是坏的。

## 2. Current Routes（32 个路由文件）

| 路由 | 类型 | SEO 价值 | 处置 |
|---|---|---|---|
| `/` | 静态 + HomeClient | 高 | **REBUILD**（Discovery 首页） |
| `/destinations` `/destinations/[slug]` | SSG | 极高 | KEEP + REBUILD 视觉 |
| `/guides` `/guides/[slug]` | SSG | 极高 | KEEP + 轻改 |
| `/trips` `/trips/[slug]` | SSG | 极高 | KEEP（UI 标签改为 "Routes"） |
| `/regions` `/regions/[region]` | SSG | 高 | KEEP |
| `/travel-styles` `/[style]` | SSG | 高 | KEEP |
| `/best-time-to-visit` `/[slug]` | SSG | 高 | KEEP（Living UI 最佳落点之一） |
| `/travel-budget` `/[slug]` | SSG | 高 | KEEP |
| `/[slug]`（60 AI 页） | SSG | 高 | KEEP（planner CTA 依赖 /plan） |
| `/plan` | 客户端 | 无（robots 禁） | KEEP + **降位重塑**（不进导航，作为"互动规划"工具页） |
| `/share` | 客户端 | 极低 | KEEP（无账户分享机制，历史功能） |
| `/pricing` | 静态 | 低（在 sitemap 中） | **DELETE + 301 → /**（SaaS 残留，与"非 SaaS"定位冲突） |
| `/(auth)/login·signup·forgot·reset` | 客户端 | 无（不在 sitemap） | **DELETE + 301 → /** |
| `/privacy` `/terms` | 静态 | 低 | KEEP（正文需去账户化措辞） |
| `/api/*`（5 个） | 动态 | — | KEEP（全部无用户数据） |

## 3. Current Auth System

- 实现：`src/lib/auth.ts` 用 raw fetch 调 Supabase `/auth/v1/*`，token 存 localStorage（`sb-access-token/sb-refresh-token/sb-user`）。
- UI：`/(auth)` 4 页 + `components/auth/` 10 组件（含假 Google 按钮、EyeFollower 装饰）。
- 消费点：`Header.tsx`（登录态 + 登出）、`PDFDownloadButton.tsx`（登录 gate，全站唯一强制账户点）、`i18n.tsx`（login/signup/logout 文案）。
- 环境变量：`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`（`.env.example` 中为空）。
- 无 auth 依赖包、无 DB、无 middleware、无 protected route、无服务端 session。

## 4. Auth Removal Plan（用户系统删除清单）

### DELETE（A 类：纯用户系统，~1,700 行）
```
src/app/(auth)/                      # 整个路由组（5 文件）
src/components/auth/                 # 整个目录（10 文件：LoginForm/SignupForm/ForgotPasswordForm/
                                     #   ResetPassword 相关/PasswordStrength/PasswordField/AuthField/
                                     #   AuthSplitLayout/AuthArt/EyeFollower/GoogleIcon）
src/lib/auth.ts                      # Supabase REST 客户端
src/lib/validators/auth.ts           # 登录/注册 zod schemas
src/hooks/useSearchHistory.ts        # 空文件（0 行）
```

### EDIT（B 类：剥离认证逻辑，保留主体）
| 文件 | 动作 |
|---|---|
| `src/components/layout/Header.tsx` | 删除登录态恢复（~45–58 行）、`handleLogout`、登录/注册按钮；保留导航、温度/货币偏好 |
| `src/lib/i18n.tsx` | 删除 `nav.login / nav.signup / nav.logout` 键（en + zh） |
| `src/components/pdf/PDFDownloadButton.tsx` | 删除 `getStoredUser` 登录 gate——PDF 导出免费开放（去 SaaS 化） |
| `src/app/privacy/page.tsx` · `src/app/terms/page.tsx` | 删除/改写 "User Accounts" 条款（D 类文件本体保留） |
| `.env.example` | 删除 `NEXT_PUBLIC_SUPABASE_*` 两行 |

### C 类：与用户字面无关，仅内容出现相关词 — 不动
`src/data/**` 内 "register/accounting/profile" 等英文正文词汇；`src/store/travel.ts`（localStorage 设备级偏好，非账户）；`src/lib/cache.ts`、`ItineraryTimeline` 打包清单勾选（同为设备级）。

### D 类：历史业务数据 — 绝不删除
`/share` 机制、`src/data/**` 全部内容、`/plan`、法律页、根目录策略文档、`public/ads.txt`。

### 依赖与环境清理
- 删除依赖：`@anthropic-ai/sdk`（代码中零引用，仅 Groq raw fetch 在用）。
- Auth 相关 npm 依赖：**无**（无 supabase/next-auth/clerk 可删）。
- `.env.local`：存在 Supabase 变量则一并清理（实施时确认）。
- 可选：`zustand` 保留（设备级偏好仍需要）；`@react-pdf/renderer` 改 dynamic import（见 §19）。

## 5. Current SEO Assets（SEO 保留清单）

**DO NOT TOUCH：**
1. `src/app/sitemap.ts`（`generateSitemapEntries()` 为两个端点共用）+ `src/app/sitemap-main.xml/route.ts`（GSC 已注册）
2. `src/app/robots.ts`（disallow `/plan`、`/api/`）
3. 全部 8 个动态路由的 `generateStaticParams` + `dynamicParams=false`（~1100 URL 的 SSG 基础）
4. `metadataBase` + 15 处 `alternates.canonical` + OG/Twitter 配置
5. 全部 JSON-LD（Article/TouristDestination/Trip/FAQ/CollectionPage/Breadcrumb）；FAQ 必须保持页面可见与 FAQPage schema 同步（既有防惩罚设计）
6. 目的地 slug 完整性（1 个 slug 喂 3 个路由：destinations/best-time/travel-budget）
7. `public/ads.txt` + AdSense publisher ID `ca-pub-4267926791604017`
8. GSC verification meta
9. 内链结构：`relatedDestinationSlugs/relatedTripSlugs/relatedGuideSlugs` + `getGuidesForCity()` 反链 + AI 页 planner 深链

**已发现问题（本次顺带修复，不属于破坏）：**
- `/og-image.png` 被引用但 **不存在** → 需补一张
- `/sitemap-main.xml` 缺 `<lastmod>`（sitemap.ts 其实算了）→ 补齐
- `SITE_URL` 硬编码重复 ~18 处 → 收敛为 `src/lib/site.ts` 单一常量（纯机械重构）
- `/pricing` 在 sitemap 中 → 删除时同步从 sitemap 移除 + 301

## 6. Current Content Assets（内容保留清单 — 全部 KEEP）

| 资产 | 数量 | 说明 |
|---|---|---|
| destinations（4 个文件聚合） | 147 | slug 复用 3 条路由；字段含 region/budget/airport/travelStyle/interests/gradient/image |
| trips（8 个文件聚合） | 283 | day-by-day itinerary、tags、restaurants —— 即 "Routes" |
| guides（25 个批次文件） | 322 | 完整 SEO 字段 + FAQ + 内链 slug 数组 |
| AI pages（4 个文件聚合） | 60 | `[slug]` catch-all 服务 |
| travel styles | 6 | 由 trips 派生 |
| 数据增强需求（新增，不破坏） | — | Destination 需补 `timezone`（+可选 lat/lng）以驱动 Living UI；由 IATA 机场映射表批量生成 |

## 7. Current Affiliate Assets（Affiliate 保留清单 — DO NOT TOUCH）

- `src/lib/affiliate.ts`：Travelpayouts（Aviasales 机票 + Hotellook 酒店），marker 738032（`NEXT_PUBLIC_TRAVELPAYOUTS_MARKER`）
- 现有调用点 4 处：`DestinationsClient.tsx`、`destinations/[slug]/page.tsx`、`DayCard.tsx`、`ItineraryTimeline.tsx` —— 全部保留，仅随组件重构换壳
- 本阶段不新增 partner；新页面（/hotels /flights）只复用 `buildFlightSearchUrl/buildHotelSearchUrl`

## 8. Current Ad Assets

- AdSense script 全站 `beforeInteractive` 注入于 `layout.tsx`，但**无任何广告单元**（零 `<ins>`、零 `adsbygoogle.push()`）→ 当前对性能是纯负债
- 计划：script 改为延迟加载（`afterInteractive`/lazy，实施时以 `node_modules/next/dist/docs` 中 Next 16 的 Script strategy 语义为准）；广告单元按 §21 规则在 Phase 6 才落地
- `ads.txt` 不动；Adsterra 本阶段不引入

## 9–11. Components：Keep / Remove / Rebuild

### KEEP（原样或近原样）
- `ui/`：Button、Card、Badge、Input、Skeleton、Tooltip、ErrorBoundary、TriplaLogo（质量好，token 化后即成新系统基座）
- `ContentHubSections`（server，SEO 首页内容块）、`WeatherScore`（SVG 表盘，内容页在用）
- `DateRangePicker`（通用）、`ShareButton`、`LanguageSwitcher`
- `layout/PageWrapper`（外壳重写但角色保留）
- hooks：useHydration/useWeather/useCurrency/useFlightSearch/useItinerary
- lib：affiliate/api/*/cache/schemas/share/utils/weather-scorer/climate-pattern/itinerary-engine/i18n

### REMOVE
- `components/auth/`（10 文件）→ 随 §4
- `components/home/ItineraryPreviewSection.tsx`（435 行假生成动画，SaaS 演示残留）
- `components/home/AIShowcaseSection.tsx`（AI 营销叙事，与 2.0 定位不符）
- `components/itinerary/ItineraryBuilder.tsx`（"Save to my trips" 账户隐喻按钮）
- `useSearchHistory.ts`（空）
- `/pricing` 页面 + `PricingClient.tsx`

### REBUILD（换皮/换架构，逻辑保留）
| 组件 | 动作 |
|---|---|
| `Header.tsx` | 重写：去 auth；桌面导航 + 移动全屏抽屉（Ephemera 式 0.15s 淡入下拉）；eyebrow 分组 |
| `Footer.tsx` | 重写：多列站内链接（现在只有 3 条外链，浪费内链）+ affiliate 披露 |
| `SearchBar`（390 行） | 重塑：从 "OTA 搜索框" 降为 Explore 的 mood filter 之一；保留 geocoding autocomplete |
| `weather/WeatherPanel` | 去 recharts（换轻量 SVG 折线或仅温度带）；供 Destination 页 ambient 用 |
| `itinerary/ItineraryTimeline + DayCard` | 保留在 /plan /share，换新 token 皮肤 |
| `flight/FlightList/FlightCard` | 保留（/flights 页复用），换皮肤 |
| `pdf/TripPDF + PDFDownloadButton` | 保留，去登录 gate，dynamic import |
| `currency/CurrencyWidget` | 保留（/plan 内），非导航级功能 |

## 12–13. Routes to Keep / Redirect

- **KEEP**：见 §2 表（16 个内容路由 + /plan + /share + 2 法律页 + 5 API）
- **REDIRECT（301，经 next.config.ts `redirects()`）**：
  - `/login` `/signup` `/forgot-password` `/reset-password` → `/`（防已收录 URL 变 404）
  - `/pricing` → `/`（其在 sitemap 中有收录历史）
  - 无其他 URL 变化 —— **本重构不改变任何内容页 URL**，sitemap 条目只增不减（除 pricing）

## 14. New IA（信息架构）

```
Home（Discovery 舞台）
├── Explore（NEW：mood 驱动的内容发现，核心入口）
├── Destinations（147）→ /destinations/[slug]（Destination 沉浸页）
├── Experiences（NEW：由 trips.interests/destinations.highlights 程序化聚合的"该做什么"）
├── Routes（= /trips，283 条路线，URL 不变）
├── Guides（322）
├── Hotels（NEW：Affiliate 入口 hub，Hotellook）
├── Flights（NEW：Affiliate 入口 hub，Aviasales）
└── About（NEW：品牌/数据来源/affiliate 披露）
辅路：/plan（导航不露出，页脚+上下文入口）、/share、/regions、/travel-styles、
      /best-time-to-visit、/travel-budget、60 AI 页（全部保留为长尾入口）
```

- 导航（桌面）：Explore · Destinations · Experiences · Routes · Guides + 右侧小入口（Flights/Hotels 归入 Destinations 上下文与页脚，避免 OTA 感）。
- 移动：全屏抽屉，eyebrow 分组（Discover / Plan your way / Practical），完整功能不阉割。
- 新增页面均需：generateStaticParams（数据派生）+ canonical + JSON-LD（CollectionPage/ItemList）+ 进 sitemap（新 URL 是"增补"，不触碰既有 URL）。

## 15. New UI Architecture

### 15.1 空间结构（三层，Ephemera 原理转译）
```
[z-0]  Ambient 层   —— CSS 渐变天空/氛围光晕（destination state 驱动），pointer-events:none
[z-5]  Vignette 层  —— radial 暗角 + 文字投影，聚焦内容
[z-10] Content 层   —— SSR 正文（SEO 全量在此）
[z-40] Context 层   —— "Now in Kyoto" 状态条/条件胶囊（sticky）
[z-50] UI 层        —— 导航/页脚（半透明玻璃，滚动后实体化）
```

### 15.2 Living UI 管线（核心机制）
```
Destination state（tz 时间/季节/可选天气）
→ DestinationAmbient（1 个 ~4KB 客户端组件）
→ 写 <section> 级 CSS 变量（--ut-accent-rgb / --ut-ambient-grad / --ut-time-label）
→ 全部组件经 rgba(var(--ut-accent-rgb), α) / var(--ut-ambient-grad) 响应
规则：
- SSR 先渲染静态渐变（destination.gradient 字段已有）→ 客户端仅升级氛围，零布局位移
- 无 JS / 抓取器看到的就是静态可用页面（SEO 安全）
- 时间→色表：每目的地一个基础 hue，24h 亮度/色相曲线由函数生成（不需要 147×24 手工表）
- 季节：当前日期半球判断（复用 climate-pattern.ts）→ --ut-season-* 微调表面色
- 天气：复用现有 /api/weather（Open-Meteo 免 key），仅 Destination 页、进入视口后拉取、3h 缓存已有
- 失败静默回退到时间/季节静态值（沿用现有 mock 回退惯例）
```

### 15.3 页面骨架映射
| 页面 | 借鉴 Ephemera 什么 | 落地 |
|---|---|---|
| Home | "一屏一概念"舞台 + 环境先行 | 全屏 Discovery hero（"Where to disappear to?" 式文案 + 目的地影像轮换 + 本地时间氛围）→ 竖排舞台式内容带 → Footer。无搜索框首屏（搜索降为 Explore 内 filter） |
| Destination | 条件坞 + "进入一个地方" | 顶部 "Now in {city} · 6:42 PM · Dusk" 状态条 + 时间/季节氛围层 → hero 影像 → local context（eyebrow 标注时差/季节/预算）→ experiences → neighborhoods → route ideas（/trips 反链）→ where to stay（Hotellook CTA）→ how to get there（Aviasales CTA）→ guides/related destinations。正文全 SSR |
| Explore | mega menu 分组 + 0.15s 淡入 | mood 标签（6 styles + season/night/beach/food…）过滤 147 目的地/283 trips 的客户端视图（数据已 SSG 进 HTML） |
| Experiences | — | 程序化 hub：按 interests 聚合 trips/destinations |
| Routes（/trips） | alpha 同色状态法 | 现有 hub 换 editorial 皮肤，保留 Trip JSON-LD |
| Guides | eyebrow + 编辑排版 | 保持正文，加 in-content 广告位与相关目的地模块 |
| Hotels / Flights | 信任清单模式 | 轻量 hub：城市列表 → affiliate 深链；不假装是 OTA |
| About | 品牌人格空态 | 品牌 + 数据来源 + 披露 |

## 16. Design Tokens（`--ut-*` 家族）

```css
:root {
  /* surfaces — light-first（旅游决策场景），ambient dark 仅 hero/氛围层 */
  --ut-bg: #faf9f6;            --ut-surface: #ffffff;
  --ut-surface-hover: #f4f2ee; --ut-ink: #16181d;
  --ut-text: #1d2129;          --ut-text-2: #454b57;
  --ut-muted: #6b7280;         --ut-subtle: #9aa1ad;
  --ut-border: rgba(22,24,29,.08);  --ut-border-strong: rgba(22,24,29,.16);

  /* accent — 目的地状态驱动（SSR 给默认值，客户端按目的地时刻重写） */
  --ut-accent: #b45f4d;  --ut-accent-rgb: 180,95,77;
  --ut-accent-soft: rgba(var(--ut-accent-rgb), .10);
  --ut-accent-line: rgba(var(--ut-accent-rgb), .40);
  --ut-season-tint: 0 0 0;      /* 季节微调，[data-ut-season] 覆盖 */

  /* ambient */
  --ut-hero-grad: linear-gradient(...);  --ut-glow: rgba(var(--ut-accent-rgb), .18);
  --ut-vignette: 0.35;                    /* 乘 opacity 的亮度系数，Ephemera 模式 */

  /* type / shape / motion */
  --ut-font-display / --ut-font-sans(=Geist Sans) / --ut-font-mono(=Geist Mono);
  --ut-radius-s: 8px; --ut-radius-m: 12px; --ut-radius-l: 16px; --ut-radius-pill: 999px;
  --ut-shadow-1: 0 4px 24px rgba(0,0,0,.06);
  --ut-dur-fast: 150ms; --ut-dur-med: 300ms; --ut-ease-out: cubic-bezier(.22,1,.36,1);
}
[data-ut-season="spring|summer|autumn|winter"] { /* 表面色/氛围微调 */ }
```

- Typography：Geist Sans（正文/UI）+ **新增一款 display 衬线/编辑字体**（next/font，候选 Fraunces / Instrument Serif，实施时定）用于 H1/H2 + Geist Mono（时间、eyebrow、数据标注——"仪器标注"感）。正文不动 dark mode hack：本阶段**放弃自动暗色**，light-first 固化（当前 dark 实际已坏，先删混乱再谈）。
- Eyebrow 组件：`10px uppercase tracking-[0.18em] text-[var(--ut-subtle)] font-mono`。
- 状态色法：hover/active/selected/disabled 一律 `--ut-accent` × 不同 alpha + 中性灰阶，不引入第二套语义色板（success/warn/danger 仅保留 ui/Badge 现有用法）。

## 17. Interaction System

| 交互 | 规格（Ephemera 实测值转译） |
|---|---|
| 导航下拉 | 纯 opacity 0→1，150ms，无位移；面板 = accent-soft 145deg 渐变表面 |
| 链接 hover | 颜色 + 中心展开 1.5px accent 下划线 300ms ease-out；菜单条目 `translate-x-2px` |
| 卡片 hover | border/阴影 alpha 加深（同色系），300ms；transform ≤2px |
| Now-in 状态条 | 时间轮转：`--ut-accent` 1s 过渡；每分钟校时（1 次 rAF/分钟，非常驻循环） |
| Explore mood 切换 | 卡片 opacity/transform 交叉过渡 300ms；无布局跳变（预留高度） |
| 滚动显现 | IntersectionObserver + `.ut-reveal`（opacity+translateY 24px，500ms ease-out，一次性） |
| 触觉 | 暂不引入（无对应场景） |
| 键盘 | 全交互元素 focus-visible 2px `--ut-accent` outline；Explore 过滤器为真实 button/checkbox（非 hover-only，满足移动端规则） |

## 18. Motion System（CSS-only，零新依赖）

- **双速制**：ambient ≥ 6s 周期、幅度 ≤ 8px、`ease-in-out` infinite（目的地光晕呼吸、hero 影像缓慢 Ken Burns ≤1.03 scale）；反馈 ≤ 300ms。
- 只动 `transform/opacity`（+ 已缓存的 color/border-color）；禁 layout 属性动画。
- 状态挂载：氛围 keyframes 仅在 `[data-ut-ambient="on"]` 时存在（IntersectionObserver 控制，视口外摘除）。
- `@media (prefers-reduced-motion: reduce)` 全局关停（引入 `.ut-motion-kill` 一条通配规则 + 各 keyframe 配对关闭，Ephemera 模式）。
- 不引入 framer-motion（当前未安装，保持）；`/plan` 内的既有过渡维持 CSS。

## 19. Performance Rules

1. **Instant first**：全部内容页保持 SSG；首屏 HTML 含完整正文与静态渐变；氛围/天气/影像升级只在 client 端渐进发生。
2. LCP：目的地 hero 影像 `fetchPriority="high"` + `priority`；首屏外一律 lazy。
3. 重依赖隔离：`recharts` 从 WeatherPanel 移除（改 SVG）或 dynamic import；`@react-pdf/renderer` 在 `PDFDownloadButton` 内 `next/dynamic`；两者彻底退出内容页 bundle。
4. AdSense script 从 `beforeInteractive` 改延迟策略（Phase 6 与广告位一起落，实施前查 Next 16 文档语义）。
5. `prefers-reduced-data`/慢网（`navigator.connection.saveData`）→ 跳过 ambient 升级（轻量 perf-tier：只做"氛围开关"一级，不做 Ephemera 全套）。
6. 视频暂不引入；如后续加入：`preload=none` + 视口触发。
7. 目标硬指标：内容页 LCP < 2.5s（4G 中端机 `estimated`）、JS 内容页预算 < 120KB gz（当前 Header 全站带 zustand 属可接受；新增仅 ≤4KB DestinationAmbient）。

## 20. SEO Rules

1. 动态层只做氛围：`Now in Kyoto / 6:42 PM / Dusk` 是 `<span aria-live=off>` 的氛围元素；目的地名称/介绍/攻略/FAQ/内链全部静态 SSR。
2. 新增页面（/explore /experiences /hotels /flights /about）必须有：静态内容（≥300 词实质内容或真实数据列表）、canonical、CollectionPage JSON-LD、入 sitemap。
3. `[slug]`/AI 页的 planner CTA 与 guides 的 `buildPlannerHref` 在 /plan 保留期间**不改目标**（避免 60+322 处内链失效）。
4. sitemap 变更：− `/pricing`、− 4 个 auth URL（本就不在）、+ 5 个新页；`sitemap-main.xml` 补 `<lastmod>`。
5. 不用 canvas/图片承载正文；正文不因动画隐藏（reveal 仅 opacity/transform，无 JS 时内容默认可见——reveal 初始态必须只在 `.js` 可用时应用）。
6. 结构化数据同步规则保留：FAQ 页面可见 ⇄ JSON-LD。

## 21. Affiliate Placement Rules

| 位置 | 形式 | 文案 |
|---|---|---|
| Destination 页 "Where to stay" 段 | 每城市 1 个 Hotellook CTA 块（在内容之后） | "See where to stay in {city}" |
| Destination 页 "How to get there" 段 | Aviasales CTA（airport 字段已有） | "Find flights to {city}" |
| Trip/[slug] 行程尾部 | 1 个组合块 | "Get there" + "Explore nearby stays" |
| Guides 正文段后 | 上下文 CTA（仅当 guide.city 命中目的地） | "Check flights for {month}" |
| /hotels /flights hub | 列表 → 深链 | 中性描述型 |
| Home | **零 affiliate 按钮** | — |
| 通用 | 全部 `rel="sponsored noopener"` + About/页脚披露 | 禁 BUY NOW 式文案 |

## 22. Migration Risks

| 风险 | 等级 | 缓解 |
|---|---|---|
| 60 AI 页 + 322 guides 的 planner CTA 指向 /plan，误删 /plan 会断 380+ 内链 | 高 | /plan 保留（仅降位），CTA 不动 |
| 目的地 slug 同时喂 3 路由，误改数据字段破坏 441 URL | 高 | slug 只读不改；timezone 字段纯新增 |
| SSG 147×3 页面新增 client 组件导致 bundle 回升 | 中 | DestinationAmbient ≤4KB、零依赖；CI 体积预算 |
| Header/i18n 剥离 auth 引发 hydration 或 TS 断裂 | 中 | 一次性小 PR + `pnpm build` + 现有 vitest |
| AdSense script 策略变更影响收入加载 | 低 | 仅改变时机不改 ID；ads.txt 不动 |
| sitemap 变更引发 GSC 重抓波动 | 低 | 只增不减（除 pricing），补 lastmod |
| Next 16 API 与训练数据差异（AGENTS.md 警告） | 中 | 编码前先读 `node_modules/next/dist/docs/` 相关指南（redirects、Script、metadata） |
| `zustand persist` 的 savedItineraries 在去账户化叙事下的定位 | 低 | 保留为"本设备"语义，UI 文案去掉 "my trips" 账户暗示 |

## 23. Implementation Order（下一阶段开发顺序）

```
Phase 1  清创（机械、低风险，1 个 PR）
         ① 删除 §4 DELETE 清单 ② Header/i18n/PDF 去 auth ③ next.config 301s
         ④ 删 /pricing + sitemap 移除 ⑤ 卸载 @anthropic-ai/sdk ⑥ 补 og-image.png
         验收：build 绿 + seo-meta-check.mjs 通过 + 手动点检 Header
Phase 2  Token 地基
         ① globals.css 重写为 --ut-* 体系 + @theme 映射 ② 引入 display 字体
         ③ ui/ 原语 token 化（变体映射改 CSS 变量）④ Header/Footer 重写（含移动抽屉）
         ⑤ 新增 Eyebrow / Reveal / StateChip 三个基元
Phase 3  Home 重建（Discovery 舞台）
         ① 新 Home hero（静态渐变 + 影像 + 动态文案后备）② 舞台式内容带（复用 ContentHubSections 数据）
         ③ 移动端独立编排 ④ HomeClient/AIShowcase/ItineraryPreview 退役
Phase 4  Destination 沉浸页 + Living UI 管线
         ① Destination 数据补 timezone（IATA 映射脚本，147 条）② DestinationAmbient 组件
         ③ "Now in" 状态条 + 时间/季节/天气渐进升级 ④ destinations/[slug] 版式重构
         ⑤ best-time/travel-budget 页轻同步换肤
Phase 5  新 IA 页面
         ① /explore（mood 过滤器，数据已在 HTML 内）② /experiences（interests 聚合）
         ③ /hotels /flights hub ④ /about ⑤ 全部接入 sitemap + JSON-LD
Phase 6  商业化落地
         ① affiliate CTA 块组件（sponsored rel）② Destination/Trip/Guide 按规则植入
         ③ AdSense 延迟加载 + 指定广告位（guides 优先）④ Footer 披露
Phase 7  性能与 SEO 终验
         ① Lighthouse/移动端实测 ② seo-meta-check + sitemap diff 审计 ③ reduced-motion/键盘/触屏走查
         ④ 内链爬一遍（无孤儿、无 404）
```

每阶段独立可发布、可回滚；Phase 1 完成前不开始任何视觉重写。

---

## 附：修改范围总表（审阅用一页速览）

### DELETE
`(auth)/` 全组 · `components/auth/` 全目录 · `lib/auth.ts` · `lib/validators/auth.ts` · `hooks/useSearchHistory.ts` · `/pricing` 页 + PricingClient · `ItineraryPreviewSection` · `AIShowcaseSection` · `ItineraryBuilder` · 依赖 `@anthropic-ai/sdk` · `.env` 中 `NEXT_PUBLIC_SUPABASE_*`

### KEEP
全部 `src/data/**`（147+283+322+60+6）· 全部内容路由与 SSG 配置 · `ui/` 8 原语 · `weather/flight/currency/pdf/itinerary` 功能组件（换肤）· 5 个 API 路由 · `affiliate.ts` + marker 738032 · `ads.txt` + AdSense ID · sitemap/robots/canonical/JSON-LD 全套 · `/plan` `/share` · legal 页 · `store/travel.ts`（设备级语义）

### REBUILD
`globals.css`（token 地基）· Header · Footer · Home · `destinations/[slug]` 版式 · SearchBar（降位重塑）· WeatherPanel（去 recharts）

### MIGRATE
`SITE_URL` → `lib/site.ts` · Destination schema + timezone 字段 · `ContentHubSections` 数据复用进新 Home · AdSense script 加载策略

### REDIRECT（301）
`/login /signup /forgot-password /reset-password /pricing` → `/`

### NEW
`/explore` · `/experiences` · `/hotels` · `/flights` · `/about` · `DestinationAmbient` 组件 · `Eyebrow/Reveal/StateChip` 基元 · affiliate CTA 块组件 · `lib/site.ts` · og-image.png

### DO NOT TOUCH（本阶段）
`src/data/**` 内容与 slug · `generateStaticParams`/`dynamicParams` 配置 · canonical/JSON-LD 现有值 · `robots.ts` 规则 · `sitemap.ts` 结构 · `lib/affiliate.ts` 与 env marker · `ads.txt` · `/plan` `/share` 的路由与 CTA 依赖关系 · GSC verification · 法律页主体（仅去账户化措辞）

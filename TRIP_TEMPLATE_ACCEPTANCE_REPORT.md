# UTRIPLA TRIP TEMPLATE — 第三阶段最终验收

**模板**：Trip Template（产品角色 = **JOURNEY EXPERIENCE**）
**范围**：重写 `src/app/trips/[slug]/page.tsx` + 新增 Trip 专属组件 `src/components/journey/*`
**日期**：2026-09-11　|　**语料**：280 个 trip 页（全量 SSG）
**结论**：见 §14 与文末

---

## 1. 当前修改范围

| 项 | 内容 |
| --- | --- |
| 允许修改 | 仅 Trip 内页（`src/app/trips/[slug]/page.tsx`）+ 新增 Trip 专属组件 |
| 未修改 | Guide / Destination / Best-time / Budget / AI / Collection / Plan / Share / Home（本轮 0 改动） |
| 本轮（最终修复轮）实际改动 | **仅 1 个文件**：`src/components/journey/JourneyHero.tsx`（首屏对比度 + 高度/scrim 回归） |
| 版本控制 | 工作树**未提交、未推送**（遵纪律，仅本地验证） |

Trip 页仅新增 Trip 专属组件，未触碰共享层（`src/components/inner/*`、`src/components/destination/*` 为 Phase 2 既有产物，本轮只引用、只读）。

## 2. 修改文件

| 文件 | 动作 | 行数 | 说明 |
| --- | --- | --- | --- |
| `src/app/trips/[slug]/page.tsx` | 重写 | 568 | Journey Experience 页面编排 + 保留原 metadata / JSON-LD / 内链级联 |
| `src/components/journey/journey-state.ts` | 新增 | 85 | 纯函数派生：`deriveLegs / deriveStopCount / deriveDensity / derivePace / daysLabel` |
| `src/components/journey/JourneyHero.tsx` | 新增 | 210 | 首屏 Journey Arrival |
| `src/components/journey/JourneyRoute.tsx` | 新增 | 151 | Route Overview（Journey Strip / Route Object） |
| `src/components/journey/JourneyTimeline.tsx` | 新增 | 126 | Day-by-day Journey Timeline（含显式 "Next stop" 转换） |
| `src/components/journey/JourneyProgress.tsx` | 新增（client） | 102 | State：Day/Stop 进度导航（外观状态） |
| `src/components/journey/JourneyAtmosphere.tsx` | 新增（server） | 62 | Environment Depth 2：Journey Atmospheric Band |
| `src/components/journey/JourneyPlaces.tsx` | 新增 | 44 | 餐厅 / 编辑索引（非卡片） |

## 3. 新增组件

- **`journey-state.ts`（纯派生，无副作用）**：`legs = 行程天数`、`stops = 当日活动数`、`pace` 由「停靠密度」推导（Light <2 / Relaxed <3.5 / Balanced <4.5 / Full）。所有首屏读数均来自**真实字段或显式派生**，无硬编码文案。
- **`JourneyAtmosphere`（server）**：`hashSlug → --ut-journey-rgb`（6 组大地色），对比极低；**无 JS、无水合**。
- **`JourneyHero`**：mono eyebrow + Instrument Serif H1（唯一视觉焦点）+ 路线读数（城市/国家 · 天数 · 停靠点 · 节奏）+ 紧凑 leg 进度。**首屏无 `<Link>` / `<button>`**（无大段正文、无蓝色 AI CTA、无多按钮）。
- **`JourneyRoute`**：`Gateway(机场 IATA) → 各日主题 → Destination(城市)` 的路线对象；移动为纵向 rail，`lg` 为横向 grid；长行程（>9 节点）可横向滚动。
- **`JourneyTimeline`**：垂直 hairline 轨道 + accent 节点；Geist Mono 日序号、Instrument Serif 主题、Geist Mono 时间、Geist Sans 活动名；每天结束渲染**显式** `本日 → 次日` 转换块。
- **`JourneyProgress`（client）**：SSR 确定性 = `Day 1`；滚动监听（rAF 节流 + passive）更新 `aria-current="step"`；锚点 `#journey-day-{n}`；节点最小触达高度 44px。
- **`JourneyPlaces`**：`<ol>` 编辑索引行（含 H3），非卡片。

## 4. Trip 新架构（页面顺序）

```
JourneyAtmosphere (Depth 2 氛围带)
 └ breadcrumb
 └ JourneyHero            ← 首屏 Journey Arrival（路线读数 + 紧凑 leg 状态）
 └ JourneyRoute           ← "Journey route"：Journey Strip
 └ Overview               ← 真实 description + 归因读数 + tags
 └ Journey context        ← 目的地 / 旅行风格 / 区域 内链
 └ Highlights             ← 仅当 hasExplicitHighlights（50 个派生 fallback 不渲染）
 └ JourneyTimeline        ← "Day-by-day itinerary"（含 JourneyProgress）
 └ JourneyPlaces          ← 有 restaurants 时
 └ Practicalities         ← "Journey practicalities"（仅真实字段）
 └ When to go             ← bestMonths + weatherScore（深链 best-time）
 └ Journey budget         ← 总预算 + 每日（深链 travel-budget）
 └ InnerCTA               ← 唯一 Primary："Use this route in your own plan"
 └ EditorialIndex         ← guides / trips / destinations 相关索引
```

结构保留：`Trip` JSON-LD（含 itinerary ItemList）、`BreadcrumbList`、related `ItemList`；metadata（`buildTripTitle` / `buildTripMetaDescription`）未回归。

## 5. 与 Destination / Guide 的差异

| 模板 | 产品角色 | 首屏回答 | 主对象 |
| --- | --- | --- | --- |
| Destination | Place（**抵达**） | "这里是什么地方" | Place Object |
| Guide | Editorial（**阅读**） | "怎么理解这件事" | 文章 + 索引 |
| **Trip（本次）** | Journey（**移动**） | "这是一段怎样的旅程" | Route Object + 逐日时间轴 |

Trip 的核心差异化表达是**移动本身**：路线读数、Journey Strip、逐日时间轴、以及每日之间**显式**的 "Next stop" 转换（`本日 → 次日`），而非让读者自行推断。

## 6. Production Build

| Gate | 结果 |
| --- | --- |
| `tsc --noEmit` | **exit 0** |
| `eslint src` | **0 errors** / 38 warnings（全部为既有 warning，非本轮引入） |
| `next build` | **exit 0** |
| 静态页总数 | 1132 |
| `/trips/[slug]` | **SSG，280 页**（磁盘 `.next/server/app/trips/*.html` = 280） |
| 服务 | `next start -p 3210`（本轮新启动） |

## 7. Browser Verification

**真实 Chrome（152 headless）+ CDP**：11 个 trip × 4 视口 = **44 runs**，`0 fatal / 0 measure error`。

| Gate | 结果 |
| --- | --- |
| hydration `#418/#423/#425` | **0** |
| 横向溢出 >1px | **0** |
| CTA 数 ≠ 1 | **0**（每页恰好 1） |
| AI / Generate CTA 文案 | **0** |
| legacy 标记（Travel tips 等） | **0** |
| live-DOM 禁用类（`font-extrabold` / `text-blue-*`） | **0** |
| `h1` ≠ 1 | **0** | / H4 存在：**0** |
| 进度节点最小高度 | **44px** |
| card-ish 块最大值 | **1**（= 单一 Primary CTA 的 Instrument Surface，非 Card Wall） |
| h2 / h3 范围 | 9–11 / 5–20 |

**首屏文字对比度（元素级像素采样，19 个有图 trip × 3 视口 × 4 元素 = 228 次测量，0 失败）**

| 元素 | 字号 | 真实透明度 | 要求 | 最差像素实测 |
| --- | --- | --- | --- | --- |
| H1 | 40–60px | 1.00 | 3:1 | **9.74:1** |
| eyebrow | 10px | 0.80 | 4.5:1 | **6.49:1** |
| route 读数 | 14px | 0.85 | 4.5:1 | **9.23:1** |
| leg 状态 | 10px | 0.75 | 4.5:1 | **8.28:1** |

口径说明：对比度按**元素真实白色透明度**在**最亮像素**上计算（而非纯白代理值），因此该表是比 WCAG 最低要求更严格的下界。

**全语料 SSR 审计（280/280 PASS，9 项不变量全绿）**

| 不变量 | 结果 |
| --- | --- |
| `h1 == 1` | PASS |
| `h2 ∈ [8,12]`（实测 9–11） | PASS |
| `h3 ≥ 5`（实测 5–20） | PASS |
| `h4 == 0` | PASS |
| planner CTA == 1 | PASS |
| 无 legacy 标记 | PASS |
| 6 个 section 全部存在 | PASS |
| 模板（`<article>` 作用域）无禁用类 | PASS |
| "Next stop" 转换存在 | PASS（总 933 = Σ(days−1)，与 280 页日程分布精确吻合） |
| 图片 preload | 19 有图=1 / 261 无图=0 / 其它=0 |

**交互验证**

- 移动抽屉：`role=dialog` / `aria-modal` / focus / `body overflow:hidden`；关闭后节点移除。
- 进度：3 节点 → 点击 Day 3 → `active="Day 3"`、`#journey-day-3` 命中（top 96px）、hash 写入；滚动更新 active。
- 锚点完整性：全部可解析、ID 唯一。
- 路线顺序：`Gateway NRT → Day1 Tsukiji & Shibuya → Day2 Asakusa & Akihabara → Day3 Shinjuku & Ginza → Destination Tokyo`。
- CTA：`count=1`，`href=/?to=Tokyo&travelStyle=foodie&interests=food%2Cshopping%2Chistory#hero-search`（**无 `&days=`**）。
- 内链健康：27/27 全部 200。
- 桌面 14 天：路线条可横向滚动（scrollW 2176 > clientW 1232）；移动 3 天：不可滚动（358 = 358）。

## 8. 390 / 768 / 1280 / 1440

| 视口 | Hero band 高度 | eyebrow 距带顶 | 横向溢出 | 备注 |
| --- | --- | --- | --- | --- |
| 390（mobile） | 336px（21rem） | 67–154px | 0 | 顶部保留可见照片带 |
| 768（tablet） | 368px（23rem） | 129–186px | 0 | 间距收敛 |
| 1280（desktop） | 416px（26rem） | 152–217px | 0 | 舒展 |
| 1440（desktop） | 416px（26rem） | 152–217px | 0 | 舒展 |

- 四视口均 `h1 == 1`，无 H4 跳级（H1→H2→H3 严格递进）。
- 移动端进度节点触达高度 44px（满足触控最小目标）。
- **0 个 run** 出现 eyebrow 距带顶 <12px（该结构性缺陷见 §13-1 已闭合）。

## 9. Console / Hydration / Runtime

- **每页恰好 1 条 console error = `[object Event]`，来源为第三方 AdSense**：
  `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4267926791604017`。
  深度捕获显示其 error 事件的 `target` 就是该 `<SCRIPT>`/`<LINK>`；**沙箱无法访问该域名**导致加载失败。
- **应用侧 error / unhandledrejection = 0**；hydration 警告 `#418/#423/#425` = **0**。
- 结论：应用运行时错误为 0，唯一控制台噪声按规范**单独归因**（非应用缺陷）。

## 10. SEO

| 项 | 结果 |
| --- | --- |
| `<title>` / `description` | 保留（如 `Tokyo 3-Day Foodie Adventure · 3-Day Foodie …`） |
| canonical | `https://www.utripla.xyz/trips/<slug>` 正确 |
| JSON-LD | 每页 3 段：`Trip`（含 itinerary ItemList）、`BreadcrumbList`、related `ItemList`，**全部可解析** |
| `h1` | 全语料唯一（280/280） |
| sitemap | 1117 URL（含 280 个 trip） |
| robots.txt | 含 sitemap 声明 |
| 图片 | 19 个有图 trip 发出 `<link rel="preload" as="image">`（Next 16 用 `preload`，旧 `priority` 已 deprecated）；261 个无图 trip = 0 |

## 11. Affiliate / Commerce

- **无新增 Flight Affiliate**：Trip 页与 journey 组件中 0 处 `buildFlightSearchUrl` / `buildHotelSearchUrl` / Aviasales / Hotellook 引用。
- **无广告位**：Trip 模板未新增任何 ad slot（仅 `layout.tsx` 既有全局 AdSense 脚本）。
- 唯一 Primary CTA 为 **planner 深链**（`/?to=…&travelStyle=…&interests=…#hero-search`），非 commerce、非 AI 生成。
- 无 WebGL / canvas / 视频 / Ads。

## 12. Design Contract 对照

| 契约项 | 落实 |
| --- | --- |
| 首屏 = Journey Arrival | breadcrumb + journey eyebrow + Instrument Serif H1 + 路线读数 + 紧凑 leg 状态；0 大段正文 / 0 蓝色 AI CTA / 0 多按钮 |
| Environment Depth = 2 | Journey Atmospheric Band（确定性色调，无 WebGL/视频）；SSR 无写状态 |
| State = Day/Stop Progress（仅外观） | JourneyProgress：SSR 确定性 `Day 1`，滚动更新 `aria-current` |
| Route Overview = Journey Strip / Route Object | JourneyRoute（非 4 卡片） |
| Day-by-day = Journey Timeline | mono 日序号 / Serif 主题 / mono 时间 / Sans 活动名 + hairline + accent 节点 + **显式转换** |
| Typography | H1/H2/H3 = Instrument Serif；正文 = Geist Sans；时间/日序号/索引 = Geist Mono。**无 `font-extrabold`、无蓝色标题** |
| No Card Wall | card-ish 最大 1（且为单一 CTA Surface） |
| Practical = Instrument Surface | 仅渲染真实字段（Gateway/IATA、时区、货币、时长、停靠数、节奏、风格、区域） |
| Budget = Journey Planning Context | 总预算 + 每日，深链 travel-budget |
| Related = Editorial Index | EditorialIndex（hairline 行，非卡片） |
| CTA = 最多 1 个 Primary | 唯一 CTA "Use this route in your own plan"；无 Generate / AI planner / Get Started |
| Heading hierarchy | 全语料 H1→H2→H3 无跳级，H4=0 |
| Next.js 16 约定 | RSC 优先；`next/image` 用 `preload`；`dynamicParams=false` 全量 SSG |

## 13. 发现的问题

### 13.1 已闭合（本阶段实测发现并修复）

**（1）首屏文字在明亮照片上的对比度事故 —— 并牵出一处结构性排版事故**

- **实测证据**：`JourneyHero` 的 10px eyebrow 采用 `white/80`，旧 scrim 为 `0.88 → 0.66@55% → 0.16`。像素级采样（隐藏字形后取带内最亮像素）显示：
  - tokyo@390 最亮像素 luminance 0.391 → **2.38:1**（要求 4.5）
  - tokyo@1440 **4.17:1**；hongkong@390 **2.82:1**
- **根因（结构性）**：全语料最长 H1 = 52 字符（`vietnam-north-5d`），在 390 宽度下折成 **3 行**；文字块（eyebrow→leg 状态）含内边距共 **268px**，而旧 band 高度 mobile 仅 17rem = **272px**。文字块几乎填满整带 → eyebrow 被顶到**距带底 93.6%–98.7%**、**距带顶仅 3px**，恰好落在旧 scrim 近乎透明的顶部。
- **修复（实测驱动，非审美偏好）**：
  1. band 高度由「17 / 21 / 25rem」调整为 **「21 / 23 / 26rem」**（336 / 368 / 416px），使最长标题下文字块 ≤80% 带高，恢复顶部照片带与呼吸位；
  2. scrim 改为「文字带全程 **≥0.72** + 78% 以上快速衰减」，与文字块顶实测位置（mobile/sm/lg ≈ 67% / 65% / 63%）留 ≥11% 余量；
  3. 无图变体的装饰 route rail 由 `top-[34%]` 上移至 `top-[12%]`，避免与 3 行标题相撞。
- **复测**：228 次元素级测量 **0 失败**，eyebrow 最差 **6.49:1**；全语料 280 页 eyebrow 距带顶 67–217px，`clipped = 0`；截图确认照片重新清晰可见且文字可读。

**（2）"Next stop" 计数出现 2×(days−1) 的口径异常**

- **结论**：**验证脚本口径问题，非视觉/结构缺陷**。旧脚本用 `document.body.textContent.match(/Next stop/g)`，而 `textContent` 会包含 `<script>` 内 RSC flight payload 的序列化字符串，故每条转换被计两次。
- **处置**：脚本改为只统计**已渲染**的 `<p>Next stop</p>`；同时修正 SSR 审计在 `strip(<script>)` 后再计数。修正后全语料总数 **933 = Σ(days−1)**（3天→2、7天→6、14天→13），与日程分布精确吻合。

**（3）派生 highlights 冒充真实内容**

- `normalizeTrip` 在无 `highlights` 时用前 3 天 `fullDays.theme` 兜底（50/280）。页面以 `hasExplicitHighlights()` 门控，**派生 fallback 不再渲染 Highlights 区块**，避免把日程主题当作"亮点"重复输出。实测：有显式 highlights = 渲染；派生 = 不渲染。

**（4）Generic Travel Tips（模板硬编码填充语）**

- Inner Audit 确认其为**跨所有 Trip 重复的模板填充语**，属内容质量缺陷。按规范**优先替换为 trip-specific 指引，否则删除** —— 本页已**删除**该区块（未重命名复用同样 4 条）。

### 13.2 未修复（本阶段范围外 / 需上层决策，仅上报）

- **应用级 `loading.tsx` spinner 与 `not-found.tsx` 404** 使用 `text-blue-600` + `font-extrabold`。它们仅存在于 Next **流式 shell**（SSR HTML + RSC payload），**水合后不在 DOM**：实测 trip 页 `.animate-spin` 可见元素 = 0、`text-blue-*` 可见元素 = 0、正文无 "404"。属 app 级共享层，不在本阶段范围，未改动，仅上报。
- **81 个 trip 无同城 guide**（仅 199/280 有），为数据依赖，与 legacy 行为一致（非回归），仅上报。

## 14. 最终结论

| 维度 | 结果 |
| --- | --- |
| 修改范围 | 仅 Trip 内页 + journey 组件（Guide/Destination/Home 等 0 改动） |
| 构建 | tsc 0 / eslint 0 error / build exit 0 / 280 页 SSG |
| 首屏 Journey 表达 | Journey Arrival + Route Object + Timeline + 显式转换 —— 成立 |
| 对比度 | 元素级 228 次测量 0 失败；DOM 审计 7/7 `domFailCount=0` |
| 泛化 | 全语料 **280/280 PASS**（9 项不变量）+ 真实浏览器 44 runs 0 失败 |
| 水合 / 运行时 | `#418/#423/#425` = 0；应用侧错误 = 0（唯一噪声已归因 AdSense） |
| SEO | title/canonical/JSON-LD/sitemap 全部不回归 |
| Commerce | 无新增 affiliate、无广告、CTA 唯一且为 planner 深链 |
| 未闭合缺陷 | 0（范围外 2 项已明确上报） |

---

# TRIP TEMPLATE — FULLY ACCEPTED

**验证产物**：`.workbuddy/verify/`（脚本：`hero-legibility.mjs`、`hero-shots.mjs`、`hero-worstcase.mjs`、`title-census.mjs`、`browser-verify.mjs`、`analyse.mjs`、`interact-verify.mjs`、`contrast-verify.mjs`、`attribution-probe.mjs`、`ssr-audit.mjs`、`nonregression.mjs`；产物：`shots/`、`*.json`、`browser-runs.ndjson`）。
**生产服务器**：`http://localhost:3210`（本轮新启动，非旧 server）；调试 Chrome CDP `127.0.0.1:9444`。

**按 spec 要求：Trip Template 阶段到此 STOP，不进入后续阶段。工作树未提交、未推送。**

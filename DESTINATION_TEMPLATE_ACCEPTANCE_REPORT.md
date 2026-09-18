# UTRIPLA DESTINATION TEMPLATE — 第二阶段最终验收

**阶段**：Inner Page Rebuild / Stage 2 — Destination Template（Place Experience）
**日期**：2026-09-11
**判定**：**DESTINATION TEMPLATE — FULLY ACCEPTED**

---

## 1. 当前修改范围

从 checkpoint 续接，本阶段只做 Destination 一件事：**读取现状 → 复用 Guide Inner Foundation → 建立 Destination-specific Foundation → 重建页面 → 恢复 SEO → TS/Lint/Build → 真实浏览器四视口验收**。

Working tree 核对结果（`git status --short`）：

| 文件 | 状态 | 归属 |
|---|---|---|
| `src/app/destinations/[slug]/page.tsx` | M | **本阶段** |
| `src/app/globals.css` | M | **本阶段**（无障碍 token 修正） |
| `src/components/ui/Eyebrow.tsx` | M | **本阶段**（注释校准） |
| `src/components/destination/`（11 文件） | ?? | **本阶段新增** |
| `src/app/guides/[slug]/page.tsx` | M | 早前 Guide 阶段遗留（本阶段未触碰） |
| `src/components/inner/`（9 文件） | ?? | 早前 Guide 阶段新增（本阶段未修改） |
| `*.md` ×8 | ?? | 早前会话遗留报告 |

**未 commit、未 push、未触碰 Vercel / 域名 / `travel-planner`、未修改 `.workbuddy`、未把旧报告加入任何提交。**

---

## 2. 修改文件

1. `src/app/destinations/[slug]/page.tsx` — 462 行，整页重建（数据字段与 SEO 全保留）。
2. `src/app/globals.css` — 3 个 token 值 + 注释（见 §13 修复项 1）。
3. `src/components/ui/Eyebrow.tsx` — 文档注释校准（体现新的 AA 下限）。

未修改：Guide 页面、Trip、Best-time、Travel-budget、AI、Region、Travel-style、Collection Hub、Plan、Share，**亦未修改 Home**。

---

## 3. 新增组件

`src/components/destination/`，共 **11 文件 / 684 行**，职责单一，无 God Component：

| 组件 | 职责 | 类型 |
|---|---|---|
| `PlaceAtmosphere.tsx` | Environment Depth = 2 的**受限氛围带**（不含 Home 天空/月亮/envDeep/Mood） | client（状态层） |
| `PlaceHero.tsx` | Place Arrival 首屏（有图 / 无图两条变体） | server |
| `PlaceIdentity.tsx` | 仪器读数带装配（Region/Country + 3 状态读数） | server |
| `LocalStateReadout.tsx` | Local time / Season / Weather（SSR 占位 → hydration 后同步） | client |
| `place-state.ts` | 展示层常量与 `Intl` 目的地时区格式化（**不新建时间系统**） | 无 directive |
| `PlaceReadout.tsx` | 单格仪器读数（mono 标签 + 等宽数值 + 发丝线） | 无 directive |
| `PlaceHighlights.tsx` | Highlights → 编辑式 Place Objects（非对称 feature + 编号行） | server |
| `PlacePractical.tsx` | Practical → 定义式仪器栅格（`<dl>`） | server |
| `PlaceDecision.tsx` | When to go / Budget → 语境决策模块（7/5 非对称 + 深挖链接） | server |
| `PlaceJourneys.tsx` | Trips → 时刻表式路线行 | server |
| `HotelModule.tsx` | 全页唯一商业模块（安静、bordered、warm surface） | server |

**复用（未重复造第二套基础体系）**：`InnerBreadcrumb`、`InnerSection`、`EditorialIndex`、`InnerCTA`、`FaqList`。

**刻意不复用**：`ReadingProgress`、`EditorialHero`、`Timeline`（Guide-specific 阅读体验）。

---

## 4. Destination 新架构

信息关系（与 Contract §28 一致，按真实数据结构落地）：

```
PLACE ATMOSPHERE (PlaceAtmosphere, Depth 2)
  → Quiet Breadcrumb (InnerBreadcrumb)
  → PLACE ARRIVAL (PlaceHero: eyebrow · H1 · country)
  → PLACE IDENTITY (PlaceIdentity: 5 格仪器读数)
  → OPEN INTRODUCTION (max-w-62ch 左对齐 + style/interests mono 行)
  → HIGHLIGHTS / PLACE OBJECTS (PlaceHighlights)
  → COMMERCE (HotelModule — 全页唯一商业入口，位于 Highlights 之后)
  → INSTRUMENT (PlacePractical)
  → WHEN TO GO (PlaceDecision 01 → /best-time-to-visit/[slug])
  → BUDGET (PlaceDecision 02 → /travel-budget/[slug])
  → FAQ (FaqList, 与 FAQPage schema 同源)
  → GUIDES (EditorialIndex)
  → JOURNEYS (PlaceJourneys)
  → PRIMARY ACTION (InnerCTA ×1)
  → RELATED PLACES (EditorialIndex)
```

实测 DOM 顺序（1280）：`nav → header → section → div → Top highlights → Practical planning info → Best time to visit → Budget information → Frequently asked questions → Amsterdam travel guides → Routes through Amsterdam → Where to stay in Amsterdam → Ready to plan your Amsterdam trip? → Other destinations`。

---

## 5. 与 Guide 的差异

| 维度 | Guide（Editorial Experience） | Destination（Place Experience） |
|---|---|---|
| 核心动作 | Reading | Arrive / Explore / Decide |
| 阅读进度条 | 有（ReadingProgress） | **无（实测 0）** |
| 版心 | 896px 单一阅读栏 | **12 栏空间感**（wide hero + 非对称 7/5 + 宽上下文块） |
| 首屏 | EditorialHero（文章标题） | PlaceHero（地点标题页 / 大图 + scrim） |
| 状态 | 仅阅读进度 | **目的地当地时间 / 季节 / 天气** 仪器读数 |
| 环境深度 | 1 | **2（受限氛围带）** |
| Highlights | 无 | 编辑式 Place Objects（feature + 编号行） |
| Trips | Ready-made trips 索引 | **时刻表式路线行（天数标记）** |
| Practical | 2 列卡片（`bg-ut-surface` 圆角盒） | **定义式仪器栅格（0 填充 / 0 圆角 / 发丝线）** |
| 决策模块 | 无 | Best-time / Budget 语境模块 → 深挖页 |
| 商业 | 无 | 1 个安静 Hotellook 模块 |

两页共用同一套 token、字体、间距与 Inner Foundation，但**不是「换数据的同一个页面」**。

---

## 6. Production Build

```
CODEBUDDY_SAFE_DELETE_ENABLED=0 npx next build
→ BUILD_EXIT=0
```

- Turbopack 编译成功（2.9s）、TypeScript 通过、**1132/1132 静态页**
- Destination HTML **145**、Guide HTML **330**（Guide 无回归）
- 零 warning / 零 error / 零 deprecation 输出
- `npx tsc --noEmit` → **exit 0**
- `npx eslint src/components/destination src/app/destinations` → **exit 0**（零 error / 零 warning）

**产物级反缓存核验**（不依据 route table 或文件存在提前宣布成功）：
```
.next/static/chunks/*.css → --ut-accent:#a4513b | --ut-subtle:#646d7e | --ut-muted:#5b6473
旧值检索 (#b45f4d / #98a1b2 / #667085) → 已清除
```

---

## 7. Browser Verification

系统 **Chrome 152 headless + CDP**（Node 22 原生 WebSocket，**非模拟器**），每视口禁用缓存后全新导航。目标 `/destinations/amsterdam`（真实高内容量 slug，含 FAQ / Guides / Journeys）。

| 指标 | 1280×800 | 768×900 | 390×844 | 1440×900 |
|---|---|---|---|---|
| HTTP | 200 | 200 | 200 | 200 |
| 纯白面板 | **0** | **0** | **0** | **0** |
| 暖色 surface 面板 | 7 | 7 | 7 | 7 |
| 横向溢出 | **0** | **0** | **0** | **0** |
| 页面级 Primary CTA | **1** | **1** | **1** | **1** |
| H1 | 1 | 1 | 1 | 1 |
| 当地状态读数 | 08:18 / Autumn / Clear | 同 | 同 | 同 |

**关键验证**：当地时间为 **Amsterdam 本地时间（08:18）**，而测试机时区为 GMT+8（13:18）——**证明用的是 destination timezone，不是设备时间**。

**SSR 确定性（#418 结构性排除）**：服务端 HTML 中 Local time / Season / Weather 三格一律为占位符 `—`，且 SSR 输出内**检索不到任何 `HH:MM` 形态的动态时间**。首次 render 两侧完全一致，真实值仅在 `useEffect` 内写入并每 60s 同步；数值用 `tabular-nums` 定宽，替换不产生 layout shift。

**数据量核验**：Amsterdam 首屏/中段/后段全部要素存在 —— breadcrumb、hero、image 变体、place identity、local time、weather、season、introduction、highlights、practical、best-time、budget、guides、trips、hotel、CTA、related destinations。

**批量冒烟**：**145/145 个 Destination 全部 HTTP 200，0 失败**。

---

## 8. 390 / 768 / 1280 / 1440

- **390**：Header 折叠为汉堡（44px，`aria-label="Open menu"`，点击后 `aria-expanded: false → true`，展开 5 条导航）；Hero 240px **紧凑 image-led，非固定 60vh**；H1 50px 正常换行无溢出；读数带 2 列→1 列重排；CTA 回流为纵向。真实 reflow，**非缩小**。
- **768**：读数带 3 列、Practical 切 2 列、Hero 320px。
- **1280 / 1440**：宽幅 Hero + Place Identity 带 + 非对称 7/5 模块，**expansive**；1440 下编辑栏与 Hero 同步放宽。**未重建 Home 式全屏环境。**

四个视口均为**真实设计**，非机械缩放；**SEO 内容零删除**。

---

## 9. Console / Hydration / Runtime

| | 1280 | 768 | 390 | 1440 |
|---|---|---|---|---|
| React #418 | **0** | **0** | **0** | **0** |
| Hydration mismatch | **0** | **0** | **0** | **0** |
| Runtime / Page exception | **0** | **0** | **0** | **0** |
| Console error | 2 | 2 | 2 | 2 |

**2 个错误的归因已用决定性实验证明**（针对本轮构建重跑）：
拦截 `pagead2.googlesyndication.com/.../adsbygoogle.js`，以 `200` + `Access-Control-Allow-Origin: *` + JS 桩响应，其余环境完全不变 →
```
=== WITH ADSENSE SCRIPT STUBBED (200 OK) ===
total errors: 0
page probe: {"hydrated":true,"h1":"Amsterdam","details":3}
```
**root cause**：`src/app/layout.tsx` 的 AdSense `<Script strategy="beforeInteractive" crossOrigin="anonymous">` 在**无外网沙箱**中 `ERR_CONNECTION_CLOSED`。
→ 属**测试环境第三方网络失败**，**不是 Destination runtime error**；Destination 自身错误为 0，且未掩盖任何真实错误。

---

## 10. SEO

**server-rendered HTML 实测**（`curl` 抓取真实输出，非客户端渲染）：

- 标题层级：**H1 × 1 / H2 × 10 / H3 × 8**，无跳级（H1→H2→H3）
- `title`：`Amsterdam Travel Guide · Netherlands Highlights & Tips | tripla`
- `description`、`<link rel="canonical" href="https://www.utripla.xyz/destinations/amsterdam">` 均存在
- OG / Twitter 齐全
- **JSON-LD 逐项与旧版一致**（无 regression）：

| @type | 旧版 | 新版 |
|---|---|---|
| TouristDestination | 1 | 1 |
| BreadcrumbList | 1 | 1 |
| FAQPage / Question / Answer | 1 / 3 / 3 | 1 / 3 / 3 |
| ItemList / ListItem | 1 / 6 | 1 / 6 |
| PostalAddress | 1 | 1 |
| WebPage | 1 | 1 |

- 内链：`/destinations/*`（相关地点）、`/guides/*`（指南索引）、`/trips/*`（路线行）、`/best-time-to-visit/amsterdam`、`/travel-budget/amsterdam`、`/plan` 入口
- `sitemap.xml` → 200，含 **145** 个 destination URL；`robots.txt` → 200
- 内容无关键字堆砌、无 FAQ wall、无 generic travel advice 堆叠

**标题语义处理（已披露）**：旧版把「指南 / 行程 / 相关目的地」的**索引标题**标为 `<h3>`；新版遵循**已验收 Guide 的约定**——索引行标题为链接文本（不用标题标签），而**章节内具名对象**使用 H3。据此为 Highlights 具名对象（5）与旅程（3）补齐 H3，使文档大纲恢复 H1→H2→H3 深度。**内容与内链零丢失。**

---

## 11. Affiliate / Commerce

- **全页商业模块数量：1**（`HotelModule`，Hotellook）
- 位置：`y = 4987`（390 视口），**位于 Highlights 之后**；**Hero 与首屏内不存在**任何商业入口
- `rel="sponsored noopener noreferrer"`、`target="_blank"`、`marker=738032`
- 视觉：bordered + warm surface + `Sponsored · Hotellook` 微标签 + 文本链接（51.6px）——**非蓝色按钮、非 banner、非卡片广告墙**
- **Flight / Hotel 联盟链接除该模块外为 0**（`flightLinks: 0`）
- `defaultHotelDates()` 保持 server-rendered deterministic 逻辑；**未把动态时间写入任何 client render**

---

## 12. Design Contract 对照

| Contract | 判定 | 依据 |
|---|---|---|
| Brand | **PASS** | Guide/Destination 模板区遗留类计数 0；terracotta 单色系 |
| Environment | **PASS** | Depth = 2 受限氛围带；`envDeep`/`moon`/Mood/TimeDock 检索 **0** |
| State | **PASS** | 只改外观/读数：local time / season / weather；**不改** section 顺序、SEO、可见性、路由、标题、内链 |
| Typography | **PASS** | H1 Instrument Serif 400 / 正文 Geist Sans / 元数据 Geist Mono；字号取自 token |
| Spatial | **PASS** | 12 栏空间感 + 非对称 7/5 + wide hero；非文章单栏 |
| Surface | **PASS** | 内容决定表面；纯白面板 **0**；仪器面 0 填充 |
| Card | **PASS** | 文章内「填充+圆角」元素仅 7 个（Hero 容器 / 3×FAQ / Hotel / CTA 面板 / CTA 按钮）；**无 ≥4 填充卡片的等宽栅格**；仪器栅格 0 填充/0 圆角/0 阴影 |
| Navigation | **PASS** | 语义面包屑 + `aria-current="page"`；移动端汉堡 44px 可展开 |
| CTA | **PASS** | 页面级 **= 1**；y=5304(390)/3862(1280)，**全部在首屏之下**；49.6px ≥44px；禁用词全 0 |
| Commerce | **PASS** | 唯一模块 + sponsored rel + 位置合规（见 §11） |
| Advertising | **PASS** | `adSlots = 0`；仅 layout 的 AdSense loader，**无 slot、无模拟位、无 sticky/banner** |
| Responsive | **PASS** | 4 档真实设计；溢出 0；4 档均正确 |
| Accessibility | **PASS** | 文本对比度失败项 **0**（1280/390，116 节点）；有图变体像素级最差 ≥6.2:1；CTA 49.6px |
| SEO / Editorial | **PASS** | 见 §10（无 regression） |
| Motion | **PASS** | 仅 opacity/transform/color；WebGL/`<canvas>`/`<video>` 检索 **0**；reduced-motion 已实现 |
| Performance | **PASS** | TTFB 2.5ms / FCP 44ms / **LCP 44ms** / **CLS 0** / 长任务 **0** |
| Destination Product Role | **PASS** | 首屏只有 H1（无 H2/CTA）→ 先「抵达」；仪器读数 + 语境决策 + 编辑索引构成 Place Experience，非文章阅读器 |

**17 / 17 PASS，无 BLOCKED。**

---

## 13. 发现的问题

### 已闭合（本阶段实测发现并修复）

1. **Foundation 级无障碍缺陷（对比度系统性不足）** — `--ut-muted #667085` 在暖面上仅 **4.41:1**、`--ut-subtle #98a1b2` 仅 **2.30–2.47:1**，均低于 AA 4.5:1；Destination 页实测 **18 个文本节点失败**（section eyebrow、阅读时长、关系标签等）。Guide 同样受影响（此为已验收 Foundation 的既有短板，非本次引入）。
   → **修复**：`--ut-muted → #5b6473`（暖面 5.30:1 / 纸面 5.68:1）、`--ut-subtle → #646d7e`（暖面 4.61:1 / 纸面 4.95:1）。
   → **Home 零影响（已验证）**：`HomeEnvironment.tsx` 在运行时以 inline style 覆盖全部文本 token 与 accent 族；实测 Home 计算值仍为 `--ut-subtle: rgba(245,242,234,0.44)`、`--ut-accent: #8d513f`、`--ut-bg: #383232`（`overriddenByHome: true`）。
   → 修复后：Destination **0 失败**、Guide **0 失败**（Guide 由 2.47:1 提升至 4.62–4.95:1，**严格改善**）。
2. **CTA 白字对比度 4.48:1（差 0.02 未达 AA）** — `#b45f4d` 上白字仅 4.483:1，且 accent 作正文色时在暖面仅 4.26:1。
   → **修复**：`--ut-accent → #a4513b`（白字 **5.50:1**、作文本 **4.87:1**），`--ut-accent-rgb → 164, 81, 59`。品牌仍为同一色相 terracotta。
3. **有图变体 Hero 小字号在明亮照片上不达标** — 像素级采样（隐藏文字后对文字实际条带采样纯背景）：Paris 场景下 `white/70` 的 10px eyebrow 最差仅 **3.34:1**、country 3.50:1（390 视口 2.94 / 3.08），低于 AA 4.5:1。
   → **修复**：scrim 文字带 alpha 提升（`0.88 / 0.66@55% / 0.16`），eyebrow → `white/80`、country → `white/85`。
   → **复测（Paris / Tokyo / Dubai / Sydney × 1280 / 390）**：H1 最差 **≥8.4:1**、eyebrow **≥6.2:1**、country **≥6.6:1**（且脚本以 `white/70`、`white/75` 作保守下限计算，实际更高）。
4. **Next 16 破坏性 API：`next/image` 的 `priority` 已废弃** — AGENTS.md 已警示「This is NOT the Next.js you know」。实测 `priority` **不产生** `fetchpriority="high"`，也**不产生** `<link rel="preload" as="image">`，即 12 个含图 destination 的 Hero LCP 图未获预加载。
   → **修复**（依据 `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md`）：`priority` → `preload`。复测 Paris 输出 `<link rel="preload" as="image" imageSrcSet="...">` ×1；无图的 Amsterdam 输出 **0 个 image preload、0 个 `<img>`**。
5. **标题语义深度缺失** — 见 §10，已补齐 H3（8）。

### 未修复（均为本阶段范围外 / 数据或共享层限制，按 Step 1 仅上报）

1. **Hero 图片覆盖率是产品级缺口** — 145 个 destination 中**仅 12 个有 `image`**，**133 个为 `image: null`（含 Amsterdam）**。Contract §13 要求「Hero image 非常重要」，但真实数据不支持；本阶段为无图场景设计了状态驱动氛围场 + 12 栏极细竖线 + accent 底线（**不使用假照片渐变**），以保证 133 页不呈现「缺图卡片」观感。**建议后续补齐 destination imagery。**
2. **`/plan` 不支持简单城市预填** — 其 `destination` 参数经 `JSON.parse` 解析为完整 `Airport` 对象，并需 `origin` + 起止日期才构成有效输入；项目无构建期机场数据集（机场来自外部 API）。因此 CTA 沿用**项目既有且已被 Guide 验收采用的**机制：`/?to=<city>&travelStyle=…&interests=…#hero-search`（带入 destination context）。Contract §23 明确「如果 Plan 路由已支持 prefilled destination 则用已有机制；没有则不要为本阶段新建大型 Planner」，故未新建。
3. **`src/app/not-found.tsx` 仍为完全旧版式**（`bg-white` / `text-blue-600` / `font-extrabold`）——被序列化进 flight payload 但**未在 Destination 渲染**（实测 `has404Text = false`）。建议列为下一 Inner 阶段优先项。
4. **共享 Header 的 LanguageSwitcher** 仍用裸 `text-gray-700` / `rounded-lg`（36×36）——Home Phase 4 已验收资产，本轮禁改。
5. **`saveData` 门控全项目缺失**（检索 0 处，含已验收 Home）——项目级既有状态。
6. **面包屑链接 21px**：满足 WCAG 2.5.8 AA 的「间距例外」（inline 文本链接，且相邻目标 24px 圆不相交）；属共享 `InnerBreadcrumb`（Guide 已验收）。FAQ `<summary>` 25.6px ≥24px 通过；Destination 自有 CTA 49.6px、酒店链接 51.6px、深挖链接 44px 均达标。
7. **调试用 headless Chrome 实例仍监听 `127.0.0.1:9222`** — 该进程由本会话沙箱之外的父进程持有，`pkill` / `killall` / `lsof` 均无法从沙箱内终止（`ps` 被拒绝）。它使用 `/tmp/utripla-chrome-profile` 独立 profile，**对项目与生产服务器无任何影响**，可随时手动关闭。

---

## 14. 最终结论

| 验收项 | 结果 |
|---|---|
| Place Experience 成立 | **是**（抵达 → 理解 → 探索 → 决定 → 规划） |
| Home → Guide → Destination 同一产品 | **是**（同 token / 字体 / Foundation，角色各异） |
| Destination ≠ Guide clone | **是**（无阅读进度、无文章单栏、有状态与决策层） |
| 无 SaaS / AI-wrapper / SEO farm | **是**（禁用词 0、无 Generate/Get Started、"Powered by AI" 0） |
| 无 Card Wall | **是**（填充+圆角元素仅 7 个，无 ≥4 等宽卡片栅格） |
| Environment / State / Local Time / Weather 正确 | **是** |
| Typography / Surface / CTA / Commerce 正确 | **是** |
| Responsive 正确（390/768/1280/1440） | **是** |
| Accessibility 正确 | **是**（文本对比度失败 0；有图变体像素级达标） |
| SEO 无 regression | **是**（JSON-LD 逐项一致；标题层级完整） |
| Hydration = 0 / Runtime = 0 | **是** |
| Build = exit 0 | **是**（tsc 0 / eslint 0 / build 0） |
| 真实浏览器验证完成 | **是**（Chrome 152 + CDP，四视口 + 交互） |
| 代码范围干净 | **是** |

# DESTINATION TEMPLATE — FULLY ACCEPTED

**验证产物**：`/tmp/utripla-dest-verify/`（report.json、interact.json、perf.json、pixel-contrast.json、home-regression-1280.png、dest-{390,768,1280,1440}-{viewport,full}.png、paris-{390,1280}.png）。
**生产服务器**：`http://localhost:3000`（本轮新启动，非旧 server）。调试 Chrome 见 §13-7。

**按 §56 要求：本阶段到此 STOP，不进入 Best-time / Budget / Trip / AI / Collection。**

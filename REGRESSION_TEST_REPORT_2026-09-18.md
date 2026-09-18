# UTRIPLA Production 用户视角回归测试报告

**测试日期**：2026-09-18（CST）
**测试角色**：第一次进入 UTRIPLA 的真实旅行用户
**测试目标**：Production `https://www.utripla.xyz` 对照 `http://localhost:3111`（当前正确版本）
**本轮性质**：只测试。未修改任何代码、未 commit、未 push、未部署、未改环境变量。
**判定标准**：严格 PASS / FAIL。不使用"基本正常/可接受"等模糊表述。

---

## 结论摘要

| # | 维度 | 判定 |
|---|------|------|
| 1 | Homepage | **PASS** |
| 2 | Global navigation（桌面） | **PASS** |
| 3 | Destinations discovery | **PASS** |
| 4 | Destination detail | **FAIL** |
| 5 | Flights | **PASS** |
| 6 | Hotels | **FAIL** |
| 7 | Experiences | **FAIL** |
| 8 | Restaurants | **PASS** |
| 9 | Guides | **PASS** |
| 10 | Guide detail | **PASS** |
| 11 | Trips | **FAIL** |
| 12 | Mobile | **FAIL** |
| 13 | Overall user journey | **FAIL** |

**共确认 8 个缺陷**：2 个 Production 特有（A 类），6 个双端共有（B 类）。0 个 C 类（第三方无库存）被判为失败——第三方空态在产品侧表现诚实，已全部判 PASS。

**优先级排序（建议修复顺序）**：

1. **P0** — 移动端导航完全不可用（F4，B 类）
2. **P0** — Production `/destinations/tokyo` 可预订体验区空白（F1，A 类）
3. **P1** — `/trips` 页面标题不可读（F3，B 类）
4. **P1** — Production 全部 Trip 页酒店入住日期过期一天（F2，A 类）
5. **P2** — `/plan` 空态无返回入口（F5，B 类）
6. **P2** — 全站设计系统/主题割裂（F7，B 类）
7. **P3** — 导航命名 "Routes" vs "Trips" 不一致（F8，B 类）
8. **P3** — `/destinations/new-york` 404（F6，B 类）

---

## 缺陷明细

### F1 [P0 / A 类 / Production 特有] Production `/destinations/tokyo` 可预订体验区整块空白

- **URL**：`https://www.utripla.xyz/destinations/tokyo`（"Bookable experiences in Tokyo" 模块）
- **用户做了什么**：进入东京目的地页，向下滚动到 "Bookable experiences in Tokyo" 区块
- **用户看到了什么**：该区块只有标题和一行空态文案，**没有任何体验卡片**（无图、无标题、无评分、无价格）。区块高度约 213px
- **预期应该发生什么**：像其余 154 个目的地一样，渲染 6 张真实 Viator 体验卡片（封面图 + 标题 + 评分 + 起价 + 联盟跳转）
- **实际发生了什么（证据）**：Production 与 localhost 同页对比 —
  - 页面总高：**PROD 7781px vs LOCAL 9088px**（差 1307px）
  - 正文文本量：**PROD 4131 字符 vs LOCAL 9346 字符**
  - 图片数：**PROD 14 张 vs LOCAL 20 张**（少 6 张 = 6 张体验封面）
  - 区块定位：PROD "Bookable experiences" 起点 y=6736 → "Restaurants" y=6949（仅 213px）；LOCAL 同区块 y=6736 → 8256（1520px 真实内容）
- **接口层根因（决定性证据）**：

  | 探测 | Production | localhost |
  |---|---|---|
  | `/api/experiences?slug=tokyo` | `available=false`，`reason=no-destination`，`products=[]`（164 字节） | `available=true`，`products=6`（7376 字节，真实 Viator 数据） |
  | 连续 4 次复测 | 4/4 稳定 `no-destination` | 稳定 `available=true` |

  爆炸半径已确认**仅限东京**：Paris / London / New York / Sydney / Cairo / Seoul / Lisbon 在 Production 全部返回 6 个产品。
  根因链：`src/lib/api/viator.ts` → `searchCityExperiences()` → `resolveDestinationId("Tokyo")` 在 Production 返回 `null`。该函数在 `/destinations` 上游返回**非 401 的任何非 2xx**（如 429 限流、5xx、10s 超时）时同样返回 `null`，与"Viator 列表中没有 Tokyo"无法区分，因此 `reason` 被统一标为 `no-destination`。
- **哪一边出现**：**仅 Production**
- **严重程度**：**高**。东京是全站最核心目的地之一，该区块缺失约 1300px 真实商业内容与 6 张图。
- **是否属于第三方数据暂时没有库存**：**否**。第三方在 localhost 侧有充足库存（6 条），属于 Production 侧该城市解析失败，不能归因于库存。
- **附带（可诊断性缺陷）**：`reason` 枚举把上游故障与"城市不在列表"混为一谈，`no-destination` 会误导排查方向；且 `/trips` 详情页的体验模块共享同一 `resolveDestinationId` 缓存键 `viator_destinations`，同一实例内会连带受影响。

### F2 [P1 / A 类 / Production 特有] Production 全部 Trip 页酒店联盟链接入住日期为"昨天"

- **URL**：`https://www.utripla.xyz/trips/<any>`（实测 5 条：tokyo-5d-classic、japan-7d-golden-route、paris-weekend、bali-5d-island、tokyo-3d-foodie）
- **用户做了什么**：进入任一 Trip 详情页，点击 "Search hotels in Tokyo→"
- **用户看到了什么**：跳转到 Hotellook 时 `checkIn` 已是**昨天**（`2026-09-17`，今天为 2026-09-18）
- **预期应该发生什么**：入住日期为当天或之后（≥ 今天）
- **实际发生了什么（证据）**：

  | Trip 页 | Production checkIn | localhost checkIn |
  |---|---|---|
  | tokyo-5d-classic | 2026-09-17 | 2026-09-18 |
  | japan-7d-golden-route | 2026-09-17 | 2026-09-18 |
  | paris-weekend | 2026-09-17 | 2026-09-18 |
  | bali-5d-island | 2026-09-17 | 2026-09-18 |
  | tokyo-3d-foodie | 2026-09-17 | 2026-09-18 |

  **5/5 命中，即 Production 全量 Trip 页。** 页面响应头 `x-vercel-cache: HIT`、`age: 1457`、`cache-control: public, max-age=0, must-revalidate`。
- **根因**：`checkIn` 由 `new Date().toISOString().slice(0,10)` 在 **SSG 构建期**求值并被烤进静态 HTML（`src/app/destinations/[slug]/page.tsx`、`HotelModule` 的 `defaultHotelDates()`），Production 当前部署的构建日期为 2026-09-17；Vercel 以 ISR 缓存持续返回该 HTML，日期不会随时间推进。
- **哪一边出现**：**仅 Production**（localhost 由 dev server 实时求值，始终为当天）
- **严重程度**：**中高**。用户被送到一个已过去的入住窗口；且偏差会随时间持续放大（一个月后会指向一个月前的日期）。
- **是否属于第三方数据暂时没有库存**：**否**。是本站构建/缓存策略问题，与联盟方无关。

### F3 [P1 / B 类 / 双端一致] `/trips` 页面标题与副标题近乎不可见

- **URL**：`https://www.utripla.xyz/trips`（localhost 同）
- **用户做了什么**：点击导航 "Routes" 进入 Trips 页
- **用户看到了什么**：h1 "Trips" 与 h2 "Featured trips" / "Explore by destination" / "Explore by region" 呈**深色字压在近黑底上，几乎不可见**（近似幽灵文字）；导语段落也明显偏暗
- **预期应该发生什么**：标题与正文在深色背景上应为浅色，对比度 ≥ WCAG AA 4.5:1
- **实际发生了什么（证据）**：计算样式实测 —
  - h1 "Trips"：`color rgb(22,24,29)` on `rgb(12,15,22)` → **对比度 1.08**
  - h2 "Featured trips" / "Explore by destination" / "Explore by region"：全部 `rgb(22,24,29)` on `rgb(12,15,22)` → **对比度 1.08**
  - 导语 `<p>`：`rgb(75,82,97)` on `rgb(12,15,22)` → **对比度 2.45**（仍低于 AA）
  - 对照：`/guides` h1 对比度 18.88，`/guides/<slug>` h1 16.87，`/regions` 20.6 —— 说明该页是异常值而非风格选择
  - 截图 `v-trips-top.png`（scrollY=0）目视确认：标题与 "Featured trips" 均为不可读的暗色残影
- **根因**：`.ut-world` 深色层（bg `#0c0f16`）与 light-first 的 `:root` 墨色 token（`--ut-ink #16181d`）错配。已知 `/guides` 已通过页面根节点 SSR 内联 `ENV_DARK_TOKENS` 修复，`/trips` 未修。
- **哪一边出现**：**双端一致**（B 类）
- **严重程度**：**高**。页面主标题不可读，首屏第一印象直接受损。
- **是否属于第三方数据暂时没有库存**：否。

### F4 [P0 / B 类 / 双端一致] 移动端汉堡菜单打开后没有任何导航项

- **URL**：`https://www.utripla.xyz/` @ 390×844（localhost 同）
- **用户做了什么**：移动端点击右上角汉堡按钮
- **用户看到了什么**：只有按钮变成了关闭 "X"，**页面主体仍是原来的 Hero，Destinations / Guides / Routes / Regions / Best Time to Visit 五个导航项一个都看不到**
- **预期应该发生什么**：展开全屏或抽屉式导航面板，5 个主导航项可读、可点
- **实际发生了什么（证据）**：
  - 抽屉容器 `.fixed.inset-0.z-[60].flex.flex-col.bg-ut-bg` 实测 **height = 64px**（`390×64`，`overflow: visible`，`z-index: 60`）
  - 5 个导航项布局上存在：y=61 / 113 / 165 / 217 / 269，每项高 48px，均在视口内
  - **命中测试决定性证据**：在导航项应处坐标 (195,85)(195,137)(195,189)(195,241)(195,293) 调 `document.elementFromPoint()`，返回的**全部是页面 Hero 内容**（`.relative z-10 …`、"Interactive travel disco"、h1 "Where do you want to dis…"），而非导航链接
  - 截图 `menu-PROD.png` 目视确认：菜单"已打开"，画面上只有关闭按钮与 Hero，无任何导航项
- **根因**：Header 带 `backdrop-filter: blur(12px)`，使 header 成为 fixed 后代的**包含块**，导致抽屉的 `inset-0` 解析为 header 的 64px 盒；抽屉子元素溢出后被页面 Sky/Veil 层覆盖，既不可见也不可点击。
- **哪一边出现**：**双端一致**（B 类），两侧 computed 值完全相同
- **严重程度**：**严重（Critical）**。移动端用户打开菜单得不到任何导航，5 个主导航目的地在手机上完全不可达。
- **是否属于第三方数据暂时没有库存**：否。

### F5 [P2 / B 类 / 双端一致] `/plan` 空态自查无返回入口，且从首页自有 CTA 可达

- **URL**：`https://www.utripla.xyz/plan`（无 query 参数时；localhost 同）
- **用户做了什么**：在首页 "Plan your trip" 能力区点击第 4 步 **"Open the planner →"**
- **用户看到了什么**：一句 "No search parameters found. Go back to the homepage and search for a trip."，页面主体内**没有任何链接或按钮**
- **预期应该发生什么**：文案让用户"回到首页"，就应同时给出可点的"返回首页 / 搜索行程"入口
- **实际发生了什么（证据）**：
  - `main` 内 `h1/h2` 数量 = **0**（无页面主标题）
  - `main` 内可见 `a[href]` = **0**，可见 `button` = **0**
  - 正文全文仅 84 字符：`No search parameters found. Go back to the homepage and search for a trip.`
  - `header` = 存在，`footer` = 存在 → 用户可通过全局导航离开，**并非硬性卡死**
- **哪一边出现**：**双端一致**（B 类）
- **严重程度**：**中**。非死路（顶部导航可用），但页面无主标题（a11y/SEO 缺陷）+ 正文指令无对应可供性，且这是首页自己 CTA 的落点，对首次用户是明显的流程断点。
- **是否属于第三方数据暂时没有库存**：否。
- **补充**：从首页 **SearchBar 完整填写出发地/目的地/日期**后提交，可正常跳转到带参 `/plan` 并渲染航班/行程/酒店联盟链接（已实测 Tokyo→Paris，2026-09-20 → 09-25 走通）。缺陷仅限"无参数进入"这条路径。

### F6 [P3 / B 类 / 双端一致] `/destinations/new-york` 返回 404

- **URL**：`https://www.utripla.xyz/destinations/new-york`（localhost 同）
- **用户做了什么**：按常见 URL 习惯，用连字符拼写纽约 slug 访问
- **用户看到了什么**：404 页面
- **预期应该发生什么**：应到达纽约目的地页（或至少 301 到正确 slug）
- **实际发生了什么（证据）**：`/destinations/new-york` → **HTTP 404**（双端）；真实 slug 为 `/destinations/newyork` → **HTTP 200**
- **哪一边出现**：**双端一致**（B 类）
- **严重程度**：**低**。已核查全仓 `src/` 中 `new-york` 仅出现在**指南 slug**（如 `new-york-weekend-guide-2026`、`how-many-days-in-new-york`），**不存在指向 `/destinations/new-york` 的内部链接或 sitemap 条目** → 不是断链，只是老用户/外部猜测 URL 的容错缺失。
- **是否属于第三方数据暂时没有库存**：否。

### F7 [P2 / B 类 / 双端一致] 全站设计系统与主题割裂

- **URL**：跨页面（`/` vs `/destinations` / `/guides` / `/trips` / `/regions` / `/best-time-to-visit` / `/travel-styles` / `/travel-budget` / `/plan` / `/share`）
- **用户做了什么**：从深色首页依次点入各内页
- **用户看到了什么**：首页是深色"世界"风格（`.ut-world`）；除 `/trips` 外几乎所有内页是浅色（`rgb(250,249,246)`）；`/guides` 与 `/regions` 使用另一套字体栈（geistSans）而非首页的 Instrument Serif。`/trips` 更极端：**浅色 Header 直接压在近黑页面之上，在 header 底边形成一道明显接缝**
- **预期应该发生什么**：全站主题与字体系统一致，或明确、有意图地在页级切换
- **实际发生了什么（证据）**：
  - 首页 `.ut-world` 背景 `rgb(12,15,22)` / 内页 `rgb(250,249,246)` / `255,255,255`
  - `/trips` `.ut-world` = `rgb(12,15,22)`，但 Header 为浅底
  - `/guides`、`/regions` 正文计算字体为 geistSans；首页 Hero h1 为 `font-display`/Instrument Serif
- **哪一边出现**：**双端一致**（B 类）
- **严重程度**：**中**。用户主观感受为"两个不同网站拼接"，削弱品牌一致性与信任感。
- **是否属于第三方数据暂时没有库存**：否。

### F8 [P3 / B 类 / 双端一致] 导航命名 "Routes" 与页面标题 "Trips" 不一致

- **URL**：Header 导航 "Routes" → `/trips`；首页卡片 "All routes →" → `/trips`
- **用户做了什么**：点击 "Routes"，进入后看到标题是 "Trips"
- **用户看到了什么**：入口名与目的地名不是同一个词
- **预期应该发生什么**：导航标签与目标页标题使用同一术语
- **实际发生了什么（证据）**：Header/首页文案 = "Routes"；`/trips` h1 = "Trips"；`.ut-world` 类名 = `ut-trips`
- **哪一边出现**：**双端一致**（B 类）
- **严重程度**：**低**。不影响功能，但影响可理解性（首次用户会怀疑是不是走错了页）。
- **是否属于第三方数据暂时没有库存**：否。

---

## 各维度判定依据

### 1. Homepage — PASS

- Hero 为程序化天气天空（上海实时，截图显示 OVERCAST / 09:45 AM Shanghai / LIVE），棕色主标题 "Where do you want to disappear to?" 在该天空上目视清晰可读。
- **对比度探针的 ratio 1.46 属于测量假阳性**：天空是 gradient（`background-image`），探针只取祖先纯色，取到了 `.ut-world` 的 `rgb(63,63,66)`。已用截图复核，判定非缺陷，不计入 FAIL。
- 首页可见 50 条链接、42 个按钮：主导航 5 项、`#discover`/`#ready` 锚点、2 张主推城市卡 + 1 张图文卡、Guides/Trips 各 4 条、**6 个 AI planner 页面**、footer（Travel Styles / Travel Budget / Plan a Trip / Share / Privacy / Terms）。
- **6 个 AI planner 页面全部 HTTP 200**（`/ai-travel-planner`、`/ai-weekend-trip-planner`、`/ai-budget-travel-planner`、`/ai-food-trip-planner`、`/ai-trip-planner-for-couples`、`/ai-multi-city-trip-planner`），双端一致。
- 图片 `loading="lazy"` 造成的滚动前 `naturalWidth=0` 属正常懒加载，滚动后全部加载，非缺陷。
- 唯一流程瑕疵是 "Open the planner →" 的落点问题，已归入 **F5**，不计入本维度。

### 2. Global navigation（桌面）— PASS

- Header 5 项（Destinations / Guides / Routes / Regions / Best Time to Visit）在桌面端全部存在、可达、active 态正确。
- 各对应目标页均返回 200 且渲染正常内容（`/regions` 与 `/best-time-to-visit` 对比度 20.6 良好）。
- 已核查并排除的候选：`/about`、`/how-it-works`、`/collections` 返回 404，但**这三个路由在 `src/app/` 中确实不存在，且站内无任何链接指向它们** → 404 为预期行为，不是缺陷。
- 命名不一致见 **F8**；移动端问题见 **F4**（本维度只判桌面）。

### 3. Destinations discovery — PASS

- Globe 首屏正常（MapLibre，两阶段 boot），搜索、flyTo、List 视图切换均可用。
- flyTo 生效已用**图像差分确认**（飞行动画前后画面差异 46.7%），不是只验证 DOM。
- list 视图城市条目完整，共 155 城市；`DirectoryTabs` region 平铺 tab 切换正常，非当前面板 `hidden` 保留 SSR 链接。
- 该页 h1 "Destinations — global destination…" 的 ratio 1.05 属**测量假阳性**（h1 为视觉隐藏/位于地图层之下，截图中地图区域无可见标题；已用截图复核）。不计入 FAIL。

### 4. Destination detail — FAIL

- **内容结构 PASS**：已审计 8 个城市（tokyo / seoul / paris / london / newyork / sydney / cairo / cape-town），h1/h2 层级完整、图片 12–14 张且**破图 0 张**、联盟与出口链接齐备。
- Hero 可读性 PASS：以 `/destinations/lisbon` 复核，白色 h1 "Lisbon" 压在城市实景照片上，目视清晰。探针报的 ratio=1 是**背景图假阳性**（visitor 检测未识别到 hero 图），不计入 FAIL。
- 该维度判 **FAIL 的唯一原因是 F1**：Production 上 `/destinations/tokyo` 的可预订体验区整块空白（详见 F1）。

### 5. Flights — PASS

- Destination detail 的航班模块是**真实可用表单**，双端完全一致：出发地输入框（placeholder `e.g. Beijing, or a 3-letter airport code`）+ 2 个 `type=date` 日期输入 + "Search flights→" 按钮。
- **未发现硬编码默认出发地**（符合"缺 originIata 不得猜默认值"的红线）。
- 已确认不存在指向带参联盟深链的空链接；模块以表单收集参数后再生成深链。

### 6. Hotels — FAIL

- 模块本身正常："Where to stay in Tokyo" + "Search hotels in Tokyo→"，双端均渲染，`rel="sponsored noopener noreferrer"` 与 Sponsored 披露齐备。
- 判 **FAIL 的原因为 F2**：Production 全量 Trip 页的酒店链接入住日期停留在构建日（昨天）。

### 7. Experiences — FAIL

- 判 **FAIL 的原因为 F1**（Production 东京空白）。
- 其余目的地（Paris / London / New York / Sydney / Cairo / Seoul / Lisbon）双端均正常渲染 6 条真实产品 → 这些城市 PASS。
- **产品侧空态表现诚实，值得肯定**：无数据时给 "Live experiences unavailable right now." 或 "No bookable experience available." 并保留 Viator 真实搜索出口，**未使用任何 mock 数据**。这是正确行为，不构成缺陷。

### 8. Restaurants — PASS

- `/api/restaurants?slug=tokyo` 双端**完全一致**返回 `available=false, reason=no-results, products=0`。
- 页面渲染为诚实空态，无伪造条目、无假评分。
- 判定为**第三方无库存但产品表现正常**，不计入 FAIL。

### 9. Guides — PASS

- `/guides` = mdd 式目的地目录：h1 对比度 **18.88**（正常），region 平铺 tab + 紧凑卡片网格。
- 145 个目的地链接常驻 SSR DOM（切 tab 不丢链接）。
- 卡片文案为真实内容（如 "Romance, art and café cultur…"）。
- 探针在该页报的 ratio 1.12 属**背景图假阳性**，不计入 FAIL。

### 10. Guide detail — PASS

- `/guides/tokyo-5-day-itinerary`：h1 对比度 **16.87**，h2 层级完整（"What this guide covers" / "The 5-Day Baseline, Day by Day" / "Why Five Beats Three"）。
- `/guides/paris-3-day-itinerary` 同样 16.87，内容与出口正常。
- 卡片与正文无破图、无空区块。

### 11. Trips — FAIL

- 内容层 PASS：Hub 为 Server Component，`FEATURED_TRIP_SLUGS` 6 条 featured 为人工指定（未用"前 N 条"伪装）；Detail 页内容、图片、出口完整（`/trips/tokyo-5d-classic` h1 = "Tokyo 5-Day Classic"，h2 "From gateway to destination" / "Journey highlights" / "Day-by-day itinerary"，对比度 16.87）。
- 判 **FAIL 的原因为 F3**：Hub 页 h1/h2 对比度 1.08，标题不可读。

### 12. Mobile（390×844）— FAIL

- 判 **FAIL 的原因为 F4**：汉堡菜单打开后无任何导航项。
- 其余移动端项 PASS：首页首屏正常、Guides 首屏正常、各详情页 Hero 无横向溢出（未检出横向滚动）。

### 13. Overall user journey — FAIL

- 判 **FAIL 的原因为 F5 / F6 / F7 / F8**：`/plan` 空态无页面内返回入口且无 h1（F5）、`/destinations/new-york` 404（F6）、全站主题与字体系统割裂（F7）、导航命名 "Routes" vs "Trips" 不一致（F8）。
- 用户旅程的**主干是可用的**：首页 → SearchBar 完整提交 → 带参 `/plan`（航班/行程/酒店齐备）→ Destination 发现（Globe/搜索/flyTo/List）→ Destination detail → Guide detail → Trip detail 全程走通，图片与内容真实，联盟披露合规。

---

## 已验证不构成缺陷的项（避免误判记录）

| 现象 | 判定 | 理由 |
|---|---|---|
| 首页图片滚动前 `naturalWidth=0` | 非缺陷 | `loading="lazy"`，滚动后全部加载 |
| 首页 Hero 灰白背景 | 非缺陷 | 程序化天气天空（上海实时 OVERCAST），设计特性 |
| 探针报 `/` h1 ratio 1.46、`/destinations` h1 1.05、`/destinations/<slug>` h1 1.0 | 测量假阳性 | 分别因天空 gradient、h1 视觉隐藏、Hero 背景图；均已截图复核 |
| `/about`、`/how-it-works`、`/collections` 404 | 非缺陷 | 路由在 `src/app/` 中不存在，站内无链接指向 |
| Experiences / Restaurants 空态 | 非缺陷 | 第三方无库存，产品给诚实空态 + 真实出口，无 mock |
| `/plan` 带参流程 | 正常 | 首页 SearchBar 完整提交可走通 |
| 各详情页第三方模块为空 | 非缺陷 | 诚实空态 + Viator/Wink 出口（东京除外，见 F1） |

---

## 测试覆盖清单（实际访问的 URL）

**Production 与 localhost 双端均已访问：**
`/`、`/destinations`、`/destinations/tokyo`、`/destinations/paris`、`/destinations/lisbon`、`/destinations/newyork`、`/destinations/new-york`(404)、`/destinations/seoul`、`/destinations/london`、`/destinations/sydney`、`/destinations/cairo`、`/destinations/cape-town`、`/guides`、`/guides/tokyo-5-day-itinerary`、`/guides/paris-3-day-itinerary`、`/trips`、`/trips/tokyo-5d-classic`、`/trips/paris-3d-classic`、`/trips/japan-7d-golden-route`、`/trips/bali-5d-island`、`/trips/tokyo-3d-foodie`、`/regions`、`/regions/asia`、`/best-time-to-visit`、`/best-time-to-visit/tokyo`、`/travel-styles`、`/travel-budget`、`/plan`（无参与带参）、`/share`、`/privacy`、`/terms`、`/ai-travel-planner` 等 6 个 AI planner 页、`/about`(404)、`/how-it-works`(404)、`/collections`(404)

**接口层双端对比：**
`/api/experiences?slug=<city>`（8 城）、`/api/restaurants?slug=tokyo`、`/api/attraction-tickets?slug=tokyo&name=…`、`/api/hotels`、`/api/flights`

**视口：** 桌面 1440×900 / 1440×2400；移动 390×844

---

## 附录：关键证据文件

| 文件 | 内容 |
|---|---|
| `menu-PROD.png` | 移动端菜单"已打开"但无任何导航项的截图 |
| `v-trips-top.png` | `/trips` scrollY=0，标题与 "Featured trips" 不可读 |
| `v-home.png` | 首页 Hero（天气天空，正常） |
| `v-dest.png` | `/destinations` Globe 首屏 |
| `v-lisbon-top.png` | `/destinations/lisbon` Hero（白字压实景照片，正常） |
| `contrast2.js` / `contrast2.py` | 排除背景图的对比度审计脚本 |
| `scope.js` / `scope.py` | 暗底暗字爆炸半径扫描 |
| `mob.py` / `mobshot.py` | 移动端抽屉测量与命中测试 |
| `aff.py` | 联盟链接日期参数提取 |

---

## 状态

本轮为**纯回归测试**。测试结束后停止 —— 未修改任何代码、未 commit、未 push、未部署、未改环境变量。等待下一步指示。

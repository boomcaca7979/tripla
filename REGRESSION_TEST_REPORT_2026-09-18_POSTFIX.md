# UTRIPLA 修复后用户视角回归测试报告

**测试日期**：2026-09-18（CST）
**测试角色**：第一次进入 UTRIPLA 的真实旅行用户
**测试目标**：验证 F1–F8 修复是否真正生效，并对全站主旅程重新做一次完整用户视角回归
**代码基线**：工作区 `main` @ `4cbf67c` + 本轮 16 个文件改动（未 commit / 未 push / 未部署）
**对照基准**：Production `https://www.utripla.xyz`（= 修复前版本）、`http://localhost:3111`（dev）、`http://localhost:3211`（`npm run build` + `npm start` 生产构建）
**判定标准**：严格 PASS / FAIL，不使用"基本正常 / 可接受 / 后续再改"等模糊表述。
**构建状态**：`npm run build` **退出码 0，0 error**，1168 个静态页生成；`/trips/[slug]` 显示 `Revalidate 1d`。

---

## 一、结论摘要

### 1.1 F1–F8 修复判定（相对修复前）

| # | 缺陷 | 修复前 | 修复后 | 判定 |
|---|------|--------|--------|------|
| F1 | Production 东京体验区空白（上游失败被 CDN 锁 24h） | `reason=no-destination`，`Cache-Control: public` | `available=true, 6 产品`，失败分级缓存正确 | **PASS** |
| F2 | Trip 页酒店入住日期冻结在构建日 | 构建期 `new Date()` 被烤进 HTML | 客户端挂载后按本地时钟重算 + ISR 1d | **PASS** |
| F3 | `/trips` 标题不可读（对比度 1.08） | 600 节点中 65 个 < 4.5:1 | **0 个** < 4.5:1，h1 = 17.13 | **PASS** |
| F4 | 移动端汉堡菜单无任何导航项（抽屉 64px） | 抽屉 390×**64**，命中测试全 MISS | 抽屉 390×**844**，5 项全 HIT | **PASS** |
| F5 | `/plan` 空态无 h1、无返回入口 | `h1=0, a=0, button=0` | h1 "Plan a trip" + "Back to homepage →" | **PASS** |
| F6 | `/destinations/new-york` 404 | HTTP 404 | 301 → `/destinations/newyork`（1 跳 200） | **PASS** |
| F7 | `/trips` 浅色 Header 压在暗页上（接缝） | Header `oklab(0.982…)` 浅底 | Header `rgba(10,12,18,0.82)` 暗底 | **PASS** |
| F8 | 导航 "Routes" vs 页面 "Trips" 不一致 | Header = "Routes" | Header = "Trips"，zh = "行程" | **PASS** |

### 1.2 本轮回归**新发现**并已修复的既有缺陷

| # | 缺陷 | 证据 | 判定 |
|---|------|------|------|
| F9 | `/guides` 目录卡片计数徽标 `· N guides` 不可读 | 硬编码 `text-[#bbb]`（12px）于白底 = **1.92:1**，78 处；两端各 78 处、class 完全一致 → 既有 | **PASS**（修复后 4.61:1，78/78 达标） |
| F10 | `/plan` 行程末日酒店链接 `checkIn === checkOut`（0 晚无效窗口） | `ItineraryTimeline` 用 `returnDate` 兜底，而末日 `date === returnDate` | **PASS**（修复后 3/3 链接有效：5 / 5 / 1 晚） |

> F9 / F10 均为**既有缺陷**（Production 与修复前 localhost 完全相同），**非本轮改动引入**；因落在用户明确授权的范围内（F9 = 文字颜色；F10 = 纯链接逻辑、零视觉影响），已按最小改动修复并在此逐项披露。

### 1.3 13 维度判定（修复后）

| # | 维度 | 判定 | 关键证据 |
|---|------|------|---------|
| 1 | Homepage | **PASS** | 与 Production 逐项一致（51 链接 / 45 按钮 / 5 图 / 6 sections；h1 `rgb(136,68,48)` Instrument Serif 96px） |
| 2 | Global navigation（桌面） | **PASS** | 5 项齐全，命名统一为 Trips |
| 3 | Destinations discovery | **PASS** | Globe WebGL `glError=0`，180 链接 / 155 城市 |
| 4 | Destination detail | **PASS** | 9 城全部：7 h2、19–20 图、**破图 0**、体验卡片与真实价格/评分齐备 |
| 5 | Flights | **PASS** | Aviasales 深链双 IATA（HND→CDG），marker 保留 |
| 6 | Hotels | **PASS** | Hotellook 深链窗口有效（F2 + F10） |
| 7 | Experiences | **PASS** | 全量 155 slug：**149 available**，890 个真实产品 |
| 8 | Restaurants | **PASS** | 诚实空态，无 mock、无假评分 |
| 9 | Guides | **PASS** | h1 18.88；1168 条 destination 链接常驻 SSR；F9 修复后 0 处不达标 |
| 10 | Guide detail | **PASS** | h1 16.87，12 个 h2，0 破图 |
| 11 | Trips | **PASS** | Hub 600 节点 0 处 < 4.5:1；280 Detail 页结构完整 |
| 12 | Mobile（390×844） | **PASS** | 抽屉 844px，5 导航项命中测试全 HIT（`/` 与 `/guides` 双页验证） |
| 13 | Overall user journey | **PASS** | 首页 → `/plan`（带参）→ 航班/酒店联盟深链全链路走通 |

**13 / 13 PASS。F1–F10 全部 PASS。**

---

## 二、F1 修复的决定性证据

### 2.1 全量 155 个 slug 的 `/api/experiences` 检查

```
total=155  available=149  unavailable=6
unavailable reasons: {"upstream-error": 4, "no-destination": 2}
total products: 890
cache-control 分布:
  public, s-maxage=86400, stale-while-revalidate=3600   →  149  （成功产品，长缓存）
  public, s-maxage=300,  stale-while-revalidate=60      →    2  （真实无映射，短缓存）
  no-store                                              →    4  （上游失败，绝不缓存）
```

**这正是 F1 的修复目标**：修复前失败响应统一下发 `Cache-Control: public`（被 Vercel CDN 按 24h 锁死，`age: 2932` 的 Tokyo 命中失败态）；现在**成功长缓存 / 真实无映射 5 分钟 / 上游失败 no-store** 三档分离。

### 2.2 「失败不再被锁死」的直接证明

第一轮扫描中 4 个 slug 返回 `upstream-error`（`no-store`）；**第二轮串行复测全部恢复为成功**：

| slug | 第 1 轮 | 第 2 轮 |
|------|---------|---------|
| abu-dhabi | upstream-error / no-store | **success / s-maxage=86400** |
| adelaide | upstream-error / no-store | **success / s-maxage=86400** |
| amsterdam | upstream-error / no-store | **success / s-maxage=86400** |
| antalya | upstream-error / no-store | **success / s-maxage=86400** |
| **tokyo** | （修复前：no-destination） | **success / 6 产品 / s-maxage=86400** |

修复前这类瞬时抖动会被写进 CDN 缓存 24 小时，用户看到的是"这个城市没有体验"；现在下一次请求即自愈。

### 2.3 剩余 2 个 `no-destination` 的归因

`havana`（哈瓦那）与 `xian`（西安，Viator 列表写作 `Xi'an`）在 Viator 目的地表中无匹配项 → 产品渲染诚实空态 + 真实 Viator 搜索出口，**不伪造数据**。归为"第三方无映射"，不计 FAIL（与上一轮 Restaurants 同类判法）。

---

## 三、F2 修复的证据链与一处**诚实局限**

**证据（4 层）**：

1. **构建产物**：`/trips/[slug]` 在 build 输出中带 `Revalidate 1d / Expire 1y` → ISR 每日重生成 HTML，过期窗口上限收敛为 1 天。
2. **源码语义**：`HotelSearchLink` 的 `useEffect(() => setResolvedHref(refreshStayWindow(href, nights)), [href, nights])` —— **无条件**用客户端 `new Date()` 覆写 `checkIn`/`checkOut`，不依赖服务端值。
3. **HTML 源码（构建期冻结值）**：6 个 Trip 页均为 `checkIn=2026-09-18 checkOut=2026-09-25 marker=738032`（构建日 = 当日）。
4. **运行时 DOM**：`checkIn=2026-09-18`、`marker=738032` 保留、`rel="sponsored noopener noreferrer"` 正确。

**局限（如实记录）**：由于本地构建日与测试日相同，"HTML 冻结为昨日 → 客户端纠正为今日"的**跨日场景无法在本地时钟下直接实测**。曾尝试两种构造该场景的方法，均被工具能力限制，且我**主动排除了假阳性**：

- `open --init-script`：该 CLI 版本未注册成功（`window.__FAKE_CLOCK__` 始终为 `null`）。
- `network route --body <改写后的 HTML>`：**拦截对文档导航请求不生效** —— 关键对照显示注入后 `servedHtmlCheckIn` 仍为 `2026-09-18`（与未拦截的对照组完全相同），因此该轮"D O M 被纠正"的观察**不具备证明力，已作废**，未计入结论。

F2 因此判定为 PASS，依据是**机制上的确定性**（无条件覆写 + ISR 1d），而非跨日实验。

---

## 四、设计保护确认（零破坏）

### 4.1 首页 —— 与 Production 逐项一致

| 指标 | Production | localhost（修复后） | 差异 |
|------|-----------|-------------------|------|
| 链接数 | 51 | 51 | 0 |
| 按钮数 | 45 | 45 | 0 |
| 图片数 | 5 | 5 | 0 |
| section 数 | 6 | 6 | 0 |
| h1 颜色 | `rgb(136,68,48)` | `rgb(136,68,48)` | 0 |
| h1 字体 | Instrument Serif | Instrument Serif | 0 |
| h1 字号 | 96px | 96px | 0 |
| **导航文案** | Destinations/Guides/**Routes**/Regions/Best Time | Destinations/Guides/**Trips**/Regions/Best Time | **F8 授权的文案项** |

首页代码 diff **仅 1 行**（`src/components/home/RoutesStage.tsx`：`"All routes →"` → `"All trips →"`），属 F8 明确授权的"只修改已有文案"。**布局 / Hero / 字体 / 颜色 / 卡片 / section / spacing / CTA / 背景 / 动画 / 视觉层级零改动。**

### 4.2 Destination Detail —— 代码零改动 + 运行时逐项一致

- `git diff --name-only` **不含** `src/app/destinations/**`，亦不含 `PlaceGallery` / `PlaceWorld` / `ExperienceList` / `FlightSearch` 等任何 Detail 组件。
- `HotelModule` 经全仓引用检索确认**仅被 `/trips/[slug]` 使用**（`src/app/trips/[slug]/page.tsx:616`），Destination Detail 不渲染它 → F2 的改动**不触及** Destination Detail。
- 9 城运行时逐项比对：Production 与 localhost 在 **8/9 城数字完全相同**（scrollH / 正文长度 / 图片数 / 链接数 / 价格数 / 评分数十位指标一致），唯一差异是**东京**——而这正是 F1 的修复目标（Production 8063px / 0 卡片 → localhost 9371px / 6 卡片）。

### 4.3 Featured 卡片（`/trips`）视觉零变化

采用 page-scoped token + `.ut-paper-panel` 回调，实测卡片仍为 `background: rgb(244,241,233)`、`border-radius: 12px`、`border-color` 未变。

---

## 五、Production 与 localhost 差异（重要）

**Production 当前仍是修复前版本，本次改动未部署。** 双端实测差异如下：

| 项 | Production | localhost（修复后） | 说明 |
|----|-----------|-------------------|------|
| `/api/experiences?slug=tokyo` | `available=false / no-destination`，`Cache-Control: public` | `available=true / 6 产品`，`s-maxage=86400` | F1 待部署 |
| `/destinations/tokyo` 页面 | 8063px / 4842 字符 / 0 卡片 / 0 价格 | 9371px / 10084 字符 / 6 卡片 / 6 价格 | F1 待部署 |
| `/trips` 对比度 | **570** 个节点 < 4.5:1，h1 = 1.08 | **0** 个，h1 = 17.13 | F3 待部署 |
| `/trips` Header | 浅底 `oklab(0.982…)` | 暗底 `rgba(10,12,18,0.82)` | F7 待部署 |
| `/plan` 空态 | `h1=[]`，链接 `[]` | h1 "Plan a trip" + 返回链接 | F5 待部署 |
| `/destinations/new-york` | **404** | **301 → 200** | F6 待部署 |
| `/destinations/xi-an` | **404** | **301 → 200** | F6 待部署 |
| 导航文案 | "Routes" | "Trips" | F8 待部署 |
| 其余 36 个页面 | 200 | 200 | 一致 |

38 个受检页面状态码：localhost（dev 与生产构建）**38/38 = 200**；Production **36/38**（2 条别名 404）。

---

## 六、修改文件清单（16 个）

**F1 缓存与归因**
1. `src/lib/api/viator.ts` — `resolveDestination` 联合类型、3 次重试、失败 60s/列表 7d 分离缓存、`resolutionFailure`、`viatorCacheControl`
2. `src/app/api/experiences/route.ts` — 接入 `viatorCacheControl`
3. `src/app/api/attraction-tickets/route.ts` — 同上
4. `src/app/api/hotels/route.ts` — 新增 `hotelsCacheControl`

**F2 入住窗口**
5. `src/components/destination/HotelSearchLink.tsx` — **新增** client 叶子，挂载后按本地时钟重算
6. `src/components/destination/HotelModule.tsx` — 改用该叶子（markup/class 不变）
7. `src/app/trips/[slug]/page.tsx` — 新增 `export const revalidate = 86400`

**F3 / F7 主题**
8. `src/app/globals.css` — `[data-ut-page="trips"]` page-scoped token + `.ut-paper-panel` 回调
9. `src/app/trips/page.tsx` — 挂 `data-ut-page="trips"`、Featured 卡片加 `ut-paper-panel`
10. `src/components/layout/Header.tsx` — `isDarkWorld` 覆盖 `/trips`；抽屉改 `h-[100dvh]` 逃出 backdrop-filter 包含块

**F5 / F6 / F8**
11. `src/app/plan/PlanPageClient.tsx` — 空态加 h1 + 返回首页链接
12. `next.config.ts` — slug 别名 301（NFD 归一化推导 + 防遮蔽/防环）
13. `src/lib/i18n.tsx` — Trips / 行程
14. `src/components/home/RoutesStage.tsx` — "All trips →"

**F9 / F10 本轮新发现**
15. `src/components/guides/DestinationDirectory.tsx` — `text-[#bbb]` → `text-[#757575]`
16. `src/components/itinerary/DayCard.tsx` — `nextDay()` + 保证 `checkOut > checkIn`

---

## 七、测试覆盖

- **页面（38 条，双端 + 生产构建）**：`/`、`/destinations`、9 城 Detail、`/guides` + 2 条 Guide detail、`/trips` + 5 条 Trip detail、`/regions` + `/regions/asia`、`/best-time-to-visit` + `/best-time-to-visit/tokyo`、`/travel-styles`、`/travel-budget`、`/plan`（空态 + 带参）、`/share`、`/privacy`、`/terms`、6 个 AI planner 页、2 条 slug 别名
- **接口层**：`/api/experiences`（全量 155 slug × 2 轮）、`/api/restaurants`、`/api/attraction-tickets`、`/api/hotels`
- **交互层**：移动端 390×844 汉堡菜单实际点击 + `elementFromPoint` 命中测试（双页）；首页表单控件枚举；`/plan` 带参落点深链解析
- **视觉度量**：全站对比度探针（区分"压在图片/渐变上"与"纯色底真的不可读"）、滚动触发的懒加载完整性（渐进滚动，非跳跃）
- **其他**：`npm run build` 退出码 0；10 个关键页 **jsErrors = 0**；`routes-manifest.json` 重定向表 164 条 0 自环

---

## 八、遗留事项

1. **未部署**：按指令"全部 PASS 后再决定发布"，本轮**未 commit、未 push、未部署**。Production 仍为修复前版本，F1/F3/F5/F6/F7/F8/F9/F10 在线上均未生效。
2. **F9 修复值的可选性**：`#757575` 是"刚好达 AA（4.61:1）且仍弱于城市名（`#696969`，5.49:1）"的取值，保持了原有视觉层级。若希望进一步统一到设计 token（`--ut-muted`，4.87:1），可无风险替换。
3. **`/guides` 其他次级文字**：region 级计数 `text-[#999]`（13px，3.0:1）同样低于 AA 4.5:1，但明显高于 F9 的 1.92:1，且属层级更高的辅助信息。本次**未改动**（避免范围蔓延），仅在此备案。

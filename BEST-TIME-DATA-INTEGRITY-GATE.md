# UTRIPLA BEST-TIME DATA INTEGRITY GATE

日期：2026-09-11 ｜ 范围：`/best-time-to-visit/[slug]` × 145（全量，非抽样）｜ 性质：只读审计
触发：P0 CONTENT INTEGRITY BLOCKER（用户指令）。已冻结 Best-time UI 工作；未 commit、未 push。

---

## 1. 当前真实数据来源

对 Best-time 页面渲染所消费的全部字段逐一溯源（`src/data/destinations.ts` + `destinations-extended-a/b/d.ts`）：

| 字段 | 形态 | 来源 | 可追溯性 |
|---|---|---|---|
| `bestMonths`（真实窗口） | 字符串，145/145 有值 | **人工编写字面量**（40 种写法） | 无出处、无引用、无验证记录 |
| `bestSeason` | 字符串，145/145 | **人工编写字面量** | 无出处；含 21 组跨目的地共享的 8 词模板句（同一句式被 3–12 个目的地复用） |
| `weatherScore`（overall/label/breakdown/recommendation） | 静态对象，145/145 | **人工编写字面量**（全部整数字段） | 与项目自有评分器无关（见 §3），无数据源 |
| `description / longDescription` | 字符串 | 人工编写 | 无出处；8 个目的地含 "45°C+/40°C/35°C" 等未验证数字声明 |
| `recommendedDays / budgetPerDay / currency / timezone / airport(lat,lon) / region / travelStyle` | 数值/枚举 | 人工编写 | 属规划惯例数据（文件头自述 "planning conventions"），非气候数据 |

仓库内**不存在**任何月度气候数据集：`src/`、`public/` 下无 JSON/CSV 数据文件；无第三方数据依赖（package.json 仅有 `ky/date-fns/recharts/zod/zustand` 等运行库）。

## 2. 数据生成链

```
airport.latitude（真实但仅为坐标）
  → getHemisphere()            lat>=0 ? Northern : Southern        （2 值）
  → getClimateZone()           |lat|<23.5/35/50 → Tropical/Subtropical/Temperate/Continental（Dubai 硬编码 Desert）
  → HEMISPHERE_SEASONS         半球 × 季节 → 月份桶（每季固定 3 个月）
  → getMonthlyClimateNote()    zone × isSummer/isWinter/isShoulder → 查表
        tempLevel ∈ {Cold,Cool,Mild,Warm,Hot}，precipTendency ∈ {Dry,Low,Moderate,High}
        note ∈ 每气候带 3 句固定英文模板（全库共 ~15 句模板池）
  → getMonthRecommendation()   对模板句做关键词匹配：
        best  ← "sunny/comfortable/pleasant/peak/ideal/dry season"
        avoid ← "extreme/wet season/heavy showers/snowy/hot and humid"
        否则    good
  → 页面渲染（Table / Verdict / Recommendation / FAQ JSON-LD）
```

即：**"每月温度等级、降水倾向、best/good/avoid" 的唯一输入是 `Math.abs(latitude)` 的 4 段阈值**。任何城市个性（海拔、洋流、季风相位、雨季真实月份）都不在链路内。

## 3. 145 页全量统计

| 项 | 数量 | 占比 |
|---|---|---|
| 月度数据行（145 目的地 × 12 月） | **1740 / 1740 行全部由 latitude 查表生成** | 100%（真实数值行 = 0） |
| 全库 distinct「12 月 temp+precip+verdict 向量」 | **8 种**（即 145 页共享 8 套月度模式，重复度 98.9%） | — |
| `weatherScore` 为静态手写字面量 | 145/145 | 100% |
| 与项目自有评分公式 `0.4T+0.35P+0.15W+0.1UV` 一致 | **仅 12/145（不一致 133/145）** | 证明其并非由 `weather-scorer.ts` 产出（该函数在 `src/` 内零调用方，仅 `__tests__`） |
| 数据字段含数字型气候声明（°C 等） | 9 个目的地（其中 **8 个会渲染进页面**，如 Dubai "45°C+"、Seville "40°C"） | 均无出处 |
| 渲染页含数字气候声明的页面 | 8/145（SSR 全量扫描证实） | 6% |
| 真实窗口与派生层矛盾：窗口内月份被判 "avoid" | **8/145**（含 rovaniemi：真实窗口 Dec–Feb 三个月全部被判 Avoid） | 6% |
| 真实窗口内没有任何月份被判派生 "best" | **23/145** | 16% |
| 派生层 "best" 落在真实窗口之外 | **99/145** | 68% |
| 派生层无任何 "best" 月（旧版 UI 的 "Best months" 区直接空转） | 18/145 | 12% |
| `bestSeason` 含跨目的地复用模板句（8-gram 出现于 ≥3 目的地） | 21 组（最广一句被 12 个目的地共享："April to June and September to October are ideal…"） | — |

## 4. REAL / DERIVED / TEMPLATE 分类

**A. REAL DATA（真实、可追溯）**
- `bestMonths`（40 种模式）——但它属于"编辑声明"，**未经验证**；严格说介于 A 与 C 之间（无出处）。
- 机场坐标/IATA/时区、`region`、货币、`recommendedDays`、`budgetPerDay` —— 规划惯例字段。
- 运行时 Open-Meteo forecast 客户端（`src/lib/api/weather.ts` + `useWeather`，仅 planner 场景调用，不参与 Best-time 页面）。

**B. DERIVED DATA（从真实数据明确计算）**
- `hemisphere`、`climate zone`（latitude → 阈值分类）：**计算关系明确，可标注使用**。
- 半球 → 季节-月份映射：同上。

**C. TEMPLATE / FICTIONAL DATA（不得冒充真实气候数据）**
- 每月 `tempLevel` / `precipTendency` / `note`（1740/1740 行）。
- `getMonthRecommendation` 的 best/good/avoid 三档（关键词匹配模板句）。
- `weatherScore` 全部 145 个（数值无来源，且 133/145 与项目自有公式不符）。
- `bestSeason` 中 "fewer crowds / lower prices / 45°C+" 类断言（无客流、无价格、无气温数据）。

**结论：当前 Best-time 的月度气候内容 100% 属于 C 类。**

## 5. Recommendation 生成逻辑

- 旧版（上线中）：把派生 `getMonthRecommendation` 直接当作 "Best months / Shoulder season / Months to avoid" 呈现，并配上 "fewer crowds and lower prices" 等无数据支撑的断言；18/145 目的地 Best 区为空。
- 本次会话中我实现的合成层（已冻结）：真实窗口 → Best；窗口外派生 best → Good；其余 Mixed；派生 avoid → Avoid。该方案**如实标注**了双信号，但被标注的信号本身仍是 C 类模板推导 → 依然把 "NOT A REAL CLIMATE RECOMMENDATION" 输出给了用户（rovaniemi 即出现 "Go in December – February" 与 "Avoid: Dec·Jan·Feb" 并存的自相矛盾）。

**判定：NOT A REAL CLIMATE RECOMMENDATION。**

## 6. 当前真实性问题（按严重度）

1. **P0**：全库 1740 个月度行无一来自实测/再分析数据；145 页共享 8 套月度模式，对 SEO 与用户都是同质化伪精确内容。
2. **P0**：`weatherScore`（"Excellent · 86/100"）无任何数据来源，133/145 与项目自有评分公式矛盾 —— 属于"为了 UI 而存在的数字"。
3. **P1**：真实 `bestMonths` 与派生层直接冲突（8 例完全矛盾、23 例 Best 空、99 例 Best 错位），页面无法自洽。
4. **P1**：`bestSeason`/描述中的 45°C/40°C、客流、价格断言无出处（8 页会渲染数字声明）。
5. **P2**：FAQPage JSON-LD 会把上述内容固化为结构化数据，放大不实声明的搜索暴露面。

## 7. 是否存在真实 climate dataset

**NO REAL CLIMATE DATA SOURCE EXISTS**（就 Best-time 所需的"145 目的地 × 12 个月 normals/定性月度画像"而言）。
- 仓库内：无任何气候数据文件；`weather-scorer.ts` 具备真实数值评分能力，但**没有任何真实 `WeatherDay` 输入喂给 145 个目的地**（构建期与运行期都没有）。
- 运行时仅有 `https://api.open-meteo.com/v1/forecast`（未来 7–16 天逐日预报，planner 用），**不是**月度气候 normals，且未在 Best-time 页面使用。
- 未引入任何 API/数据集/依赖（遵守本轮禁令）。

## 8. 候选 Data Strategy（仅决策输入，不选择、不实施）

| 方案 | 数据真实性 | 覆盖率 | SSG 兼容 | API 依赖 | 性能 | 成本 | 维护 | 版权/署名 | SEO 价值 |
|---|---|---|---|---|---|---|---|---|---|
| **A. 授权/公开气候 normals 数据集**（国家气象机构、NOAA、ERA5 再分析等）做成静态数据 | 高（可引用原始出处） | 需逐目的地核对，145 城可达但工作量大 | 高（构建期烘焙） | 无 | 最优 | 中-高（采购或研究人力） | 低（气候 normals 数十年一换） | 需逐源核对许可 | 高（可引用出处的独家内容） |
| **B. 构建期调用气候/历史 API 生成月度聚合**（现有供应商 Open-Meteo 亦提供历史/再分析端点；另有 Meteostat 等选项，均未验证、未接入） | 中-高（取决于聚合方法与年限） | 高（自动化全量） | 中（构建期批处理；需缓存产物入库） | 构建期一次性依赖 | 高 | 低-中 | 中（API 变更/重跑管道） | 多数要求署名，需核对 | 高（数值真实且可解释方法） |
| **C. 重新定义页面：只用当前真实可用数据** | 最高（无虚假内容） | 145/145 | 高 | 无 | 最优 | 零 | 最低 | 无 | 低-中：页面退化为"编辑声明 + 规划惯例"，月度表/月度推荐必须移除，独立 Best-time 价值大幅收窄，可能不足以支撑独立 search intent |
| **D. 人工编辑核实现有 44 种 bestMonths 模式并逐条引用来源** | 中-高（编辑声明 → 有引用的编辑内容） | 145/145（44 模式 + 例外核对） | 高 | 无 | 最优 | 中（编辑人力） | 中 | 引用即可 | 中-高（诚实且独特，但无数值型月度数据） |

**任何方案组合都必须先回答：月度表里放什么数字/等级、它凭什么为真。** 本轮不做选择。

## 9. UI 可以继续什么

- 页面骨架（Decision First 首屏结构、面包屑、容器、栅格）。
- Typography / Instrument System / `--ut-*` token 消费、SeasonAtmosphere 类 Depth-2 氛围层（纯装饰、不承载数据）。
- 导航、相关内链（EditorialIndex）、响应式基础、a11y 模式（tablist/键盘/焦点/对比度方法学）。
- SEO 技术壳（metadata/canonical/JSON-LD 结构本身）。
- 已冻结的组件代码可作为"结构与交互已验证"的资产保留（其数据消费层待替换）。

## 10. UI 必须暂停什么

- 一切月度 Climate Table（温度/降水/日照/客流任一列）。
- 一切月度 Verdict（Best/Good/Mixed/Avoid）与 "Go in X" 结论。
- `weatherScore` 的任何数值/评级展示（当前 133/145 与自有公式矛盾）。
- 基于派生层的 "Shoulder season / fewer crowds / lower prices" 断言。
- 未经验证的 45°C/40°C 数字声明进入渲染与 FAQPage JSON-LD。
- 任何把这些内容固化为 schema 的输出。

## 11. 最终结论

Best-time 的信息架构、交互与验收方法学已就绪，但其**全部月度气候内容为 latitude 模板推导 + 无出处编辑断言**：真实数值数据行 0/1740，145 页共享 8 套月度模式，核心决策信号（月度推荐、climate score）均为 C 类数据。在数据策略未定之前，Decision Support UI 不具备成立基础；本轮亦不做 noindex/delete/merge/redirect 决策。

**当前 Best-time 内容真实性不足。**

# DATA INTEGRITY — BLOCKED

（审计产物：`.workbuddy/verify/besttime-integrity.json`、`besttime-gate.audit.ts`、`besttime-ssr.json`；UI 改动已冻结于工作区，未提交。）

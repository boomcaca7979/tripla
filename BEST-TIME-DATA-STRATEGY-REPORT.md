# UTRIPLA BEST-TIME DATA STRATEGY REPORT（v8.7 — ELEVATION SOURCE ACCEPTANCE CONTRACT + ANCHOR CORRECTIONS A/B）

日期：2026-09-12 ｜ 版本：v8.7（取代 v8.6；本轮为**正式 acceptance contract change**（用户 Decision C = Option 2）+ 用户批准的锚点修正（Decision A/B）；DOCUMENT + PILOT REBUILD）
性质：DATA STRATEGY RESEARCH + PILOT EVIDENCE CONSOLIDATION（零代码修改、零生产数据采集、未 commit/push；Pilot 只读外部取数已归档于 `pilot/best-time/`）
前置：Best-time Data Integrity Audit = BLOCKED（0/1740 真实月度气候行）
Pilot 基线：**`pilot-2026.09.11.v1`**（145 点真实取数；本轮不推翻、不弱化、不重新解释该基线）

> **v8.7 相对 v8.6 的正式契约变更（用户已决策，2026-09-12）**
> 1. **Elevation Source Acceptance Contract（Decision C = Option 2）**：§19.2 不再要求全部 145 点必须 Tier-1 "authoritative" 来源；改为**完整的 source hierarchy + 逐点验证框架**（Tier 1/2 单源可批；Tier 3 必须一条独立佐证源（Δ≤10 m）；Tier 4 永不单独充分；冲突阈值 ≤5 m 记录 / 5–20 m 接受+旗标 / >20 m 拒绝升级；**禁止平均**；禁止把 Tier-3 自动升为 Tier-1）。 Pilot 佐证战役完成：**145/145 production-approved**（17 Tier-1 + 123 verified + 5 verified+FLAG，0 pending / 0 blocked）。
> 2. **锚点修正 A/B（用户批准）**：ho-chi-minh-city 经度 → 106.652（SGN 实际位置；气候值 0 变化）；siem-reap → SAI/VDSA 现役机场 (13.36974, 104.223831)（59 个气候单元格变化；7 月 R5→R3、12 月 R4→R7；Best Months [10]→[10,11]）。全量重烘焙后 R1–R7 = 5/16/158/91/483/460/527，Best Months 分支 117/28/0，**0 条无法解释变化**。
> 3. **v8.7 不改变任何 climate 数学定义**：tempMeanC/tempHighC/tempLowC/precipMm/precipDaysGe1mm/daylightHours、R1–R7 阈值与顺序、Best Months 三分支、聚合公式、dailyBoundary、period 全部与 v8.6 相同。


> **v8.5 相对 v8.4 的三处事实反转（全部有 Pilot 实测证据，见 §23.0）**
> 1. **v8.4 的 canonical 温度映射是语义错误**：`T2M_MAX_AVG / T2M_MIN_AVG` 是「30 年平均的月内极值」，不是「平均日高/低」→ 造成 **509/1740 = 29.3%** 的 R1–R7 分类差异。v8.5 改为 **Daily `T2M_MAX/T2M_MIN` + UTC + 日历月均 + 1991–2020**。
> 2. **v8.4 的 Climatology temporal 陈述与实测不符**：v8.4 称「Monthly/Annual/Climatology 依官方 FAQ 提供 UTC」。实测：**Climatology 默认请求返回 `time_standard: "LST"`；显式 `time-standard=UTC` 返回 `"UTC"`**（4/4 + 145/145）。v8.5 按实测重写。
> 3. **v8.4 的「T2M_MAX/T2M_MIN 一律禁止」过于宽泛**：禁止只在 **Climatology 层**成立；**Daily 层的 `T2M_MAX/T2M_MIN` 正是 canonical high/low 的合法来源**。v8.5 按 temporal level 判定。

v5 修订目标（3 个 blocker）：
- **B1**：Source hierarchy 彻底规范化为 **Provider → Source Family → Official Product**；`Copernicus ERA5 Reanalysis Family` 为唯一 canonical source family（ERA5 与 ERA5-Land 均为该 family 内的 official products，禁止再出现 `sourceFamily = ERA5` 与 `sourceFamily = ERA5-Land` 并存的层级冲突）。
- **B2**：UTC-day 的 provenance 表述纠正——**UTC+00:00 是 UTRIPLA methodology 的明确选择**，不是"ERA5 唯一支持的官方 boundary"的声明。
- **B3**：全部正式结构（§7.4 / §8.2 / §8.2.1 / §9.4 exhaustive proof / §9.5 / §10.2 / §11 / §12.1 / §12.2）**实际存在于本文件中**，逐块非空校验。

v6 修订目标（4 个 patch，FINAL STRATEGY CONSISTENCY PATCH）：
- **P1**：Dataset-level source metadata 改为复数摘要（`sourceFamilies[]`），明确 record-level `sourceFamily` 才是单个目的地的权威 provenance；destination-level lock 不放松。
- **P2**：Copernicus 许可统一为官方正式名称 **Copernicus Licence rev. 12**，废除"类 CC-BY-4.0"非正式表述（Open-Meteo 自身的 CC BY 4.0 不受影响）。
- **P3**：Copernicus Daily Statistics 的 UTC offset 可配置能力移入 research-confirmed（官方产品说明已确认）；UNVERIFIED 清单移除该项；UTC+00:00 仍是 UTRIPLA methodology choice。
- **P4**：R1–R7 exhaustive proof 确认实际存在于 §9.4 正文（effective-domain partition + boundary examples 双层结构），并补齐 Coverage/Gap/Overlap 三结论与"H/L/P 记号 + 与 boundary 举例的区别"声明。

v7 修订目标（6 项修复，FINAL CONSISTENCY REPAIR）：
- **F1**：Copernicus licence 官方正式名称统一为 `Licence to use Copernicus Products (rev. 12)`；`Copernicus Licence rev. 12` 降级为 internal short name。
- **F2**：NASA POWER commercial/redistribution licensing 降级为 `UNVERIFIED / LEGAL REVIEW REQUIRED`；技术能力事实与引用要求保留。
- **F3**：§8.2 时序修正——Step 5 = Provisional Selection（非 final lock）；final lock 仅在 Step 9 source acceptance 之后；fallback 后 final provenance 全部指向 fallback family。
- **F4**：`precipDaysGe1mm` = nullable optional field + 正式 unresolved provenance status（officialProduct = null 合法）；Pilot 核实后 methodologyVersion 递增 + 全量重烘焙。
- **F5**：Best Months 基线补第三分支——Favourable 与 Workable 均空时 `bestMonthsBaseline = []` + `recommendationStatus = "no-favourable-month"`；不从 Challenging 伪造最佳月份；override 仍走 §10.2。
- **F6**：§9.2 Workable/Challenging 表述与 first-match 机制对齐（首个命中规则决定，其余命中留档 QA provenance）。

v8.1 修订目标（ACTUAL FILE CORRECTION · 仅修实际残留错误）：
- **C1**：§7.2/§4 残留的 `tempHighC → T2M_MAX`、`tempLowC → T2M_MIN` 语义错误修正——NASA POWER 官方语义下 `T2M_MAX/T2M_MIN` 是小时瞬时极值口径，canonical fallback mapping 改为 `T2M_MAX_AVG / T2M_MIN_AVG`（新增 §7.2.1）。
- **C2**：`T2M_MAX_AVG/T2M_MIN_AVG` 的 Climatology endpoint 可得性 = UNVERIFIED；未验证前 tempHigh/low fallback 路径 unavailable → degraded，绝不以 T2M_MAX/T2M_MIN 替代。
- **C3**：NASA POWER spatial resolution 改为 endpoint/product-specific，废除 0.5° 未限定泛化。
- **C4**：§12.2 fieldProvenance 增加 NASA fallback 条件式示例 + semantic-invariant（aggregationMethod 与 parameter 口径不得矛盾）。

v8.2 修订目标（NASA POWER PRECIPITATION MAPPING + CLOSURE COUNT REPAIR · 定点修复）：
- **D1**：precipMm 的 NASA fallback exact parameter 依据官方参数注册表 research-confirmed 为 `PRECTOTCORR_SUM`（accumulated 月合计）；average 口径的 `PRECTOTCORR`（mm/day）禁止充当月合计——与 T2M_MAX/T2M_MIN 禁令同类。
- **D2**：§8.2 acceptance 扩展为五项校验（retrieval / schema / range / **parameter semantic** / completeness）；§8.3、§12.2、§21 同步。
- **D3**：§23.4 重编号为连续 1–8 并显式声明 8 independent items。

v8.3 修订目标（NASA UTC TIME STANDARD + LICENSING MATRIX REPAIR · 定点修复 —— **其中 E1/E2/E3 的时间标准部分已被 v8.4 判定为错误并撤销，见下**）：

- **E1**：NASA fallback 请求参数锁死 `time-standard=utc`（NASA POWER Climatology API 默认 `lst`，省略即不合规）；§7.2.1 新增 Time standard requirement 正式规范；`time-standard != display timezone` 明确区分。
- **E2**：§8.2 acceptance 五项扩为**六项**（新增 time-standard / daily-boundary validation）；§8.3、§21 同步；`dailyAggregationBoundary = UTC+00:00` 不再只靠文字说明。
- **E3**：§12.2 fieldProvenance 契约新增 `timeStandard: "UTC" | "not-applicable"`（tempHighC/tempLowC = UTC；tempMeanC/precipMm = not-applicable；与 dailyAggregationBoundary 共同出现、互不替代）。
- **E4**：§4 licensing matrix 内部矛盾修复——NASA redistribution = Yes → UNVERIFIED / LEGAL REVIEW REQUIRED；技术可下载 ≠ 法律允许商业再分发。

v8.4 修订目标（NASA POWER TEMPORAL SEMANTICS CORRECTION · 对 v8.3 的实际文件纠错）：
- **G1**：撤销 v8.3 的错误表述——"NASA POWER Climatology API 默认 lst"、"Climatology request MUST use time-standard=utc"、"省略即 non-compliant"、"time-standard=lst → acceptance FAIL"。依据 NASA 官方文档：Hourly / Daily 支持 UTC 与 LST 且默认 LST；官方 FAQ 明确其它 temporal levels 提供 UTC；Climatology 通过 start/end 请求 custom climatology。
  > **v8.5 补注**：G1 撤销的四条中，第 2–4 条（"MUST / 省略即 non-compliant / lst → FAIL"）作为**方法学主张**仍被 v8.5 撤销——UTC 是 UTRIPLA 方法学选择，不是 NASA 的强制合规条款。但**第 1 条「Climatology 默认 LST」是事实陈述，且已被 v8.5 Pilot 实测证实**（默认请求返回 `time_standard: "LST"`，4/4）。v8.4 一并撤销它属于过头，v8.5 予以恢复并作为实测事实写入 §7.2.1 E。
- **G2**：§7.2.1 重写为 NASA POWER temporal-standard semantics（六条）+ source temporal standard != destination display timezone。
- **G3**：§8.2 / §8.3 acceptance 结构修复——Copernicus acceptance 不再含 NASA-specific request parameter 条件；fallback 后执行 NASA-specific acceptance contract（含 source-specific NASA temporal-standard validation），"六项 acceptance" 表述全文撤销。
- **G4**：§12.2 / §19.1 / §19.2 / §20 / §21 同步修正 timeStandard provenance 与 temporal validation 语义。（**注：G1 中「Climatology 依官方 FAQ 提供 UTC」一句已被 v8.5 的实测证据推翻，见 §23.0；v8.5 保留 G1 中「不得虚构请求参数」的方法学约束，但按实测事实重写 temporal 语义。**）

v8.5 修订目标（NASA CANONICAL SEMANTICS CORRECTION · 真实 Pilot 证据驱动，H1–H12）：

- **H1**（§6 / §7.1 / §7.2 / §7.2.1）：canonical 温度语义彻底统一并逐层固定——
  `tempMeanC` = 1991–2020 average of calendar-month mean 2m temperature（NASA fallback = Climatology `T2M`）；
  `tempHighC` = 1991–2020 mean of daily maximum temperature for each calendar month（NASA fallback = **Daily** `T2M_MAX` + UTC）；
  `tempLowC` = 1991–2020 mean of daily minimum temperature for each calendar month（NASA fallback = **Daily** `T2M_MIN` + UTC）。
  绝对禁止 `Climatology T2M_MAX_AVG → tempHighC`、`Climatology T2M_MIN_AVG → tempLowC`。
- **H2**（§7.2.1）：明确定义 `T2M_MAX_AVG` = 30-year average of monthly extreme maximum、`T2M_MIN_AVG` = 30-year average of monthly extreme minimum；二者**不能**成为 canonical Avg High / Avg Low。
- **H3**（§7.2.1）：修正 v8.1/v8.2「一律禁止 `T2M_MAX/T2M_MIN`」的过度禁令 → **按 temporal level 判定**：Climatology 层 `T2M_MAX/T2M_MIN/T2M_MAX_AVG/T2M_MIN_AVG` 全部禁止用于 canonical tempHigh/tempLow；**Daily 层 `T2M_MAX/T2M_MIN` 允许且必须先做月聚合**。
- **H4**（§7.2.1 / §8.2）：新增 NASA fallback pipeline 五段式（`T2M`→Climatology；`T2M_MAX/T2M_MIN`→Daily→UTC→日历日极值→日历月均→1991–2020；`PRECTOTCORR_SUM`→Climatology），并写明 **No field-level source-family mixing**；NASA 内部多 temporal endpoint 仍属同一 source family，属合法同族记录。
- **H5**（§7.2.1 / §19.1）：temporal 语义按实测重写——Climatology 默认请求 → `LST`；`time-standard=UTC` → `UTC`；Daily 层支持 UTC 且实测 `UTC`；并区分 source temporal standard ≠ UTRIPLA display timezone ≠ UTRIPLA dailyAggregationBoundary。
- **H6**（§3.6 / §7.2.1 / §12.2）：空间分辨率统一为 **tested source-native grid ≈ 0.5° latitude × 0.625° longitude**，官方标题 `NASA/POWER Source Native Resolution`；不把 regional request grid 与 source-native grid 混用，不泛化到所有 POWER products。
- **H7**（§7.2.1 / §12.2）：降水单位与口径统一——`PRECTOTCORR` = mm/day rate（**非月合计**，禁止映射 `precipMm`）；`PRECTOTCORR_SUM` = accumulated monthly total（canonical `precipMm`，实测 145×12 验证）。
- **H8**（§12.2）：fieldProvenance 契约扩展为 **15 键**（provider / sourceFamily / officialProduct / endpoint / parameter / temporalLevel / timeStandard / dailyAggregationBoundary / aggregationMethod / periodStart / periodEnd / grid / selectionReason / ruleVersion / methodologyVersion），canonical NASA 示例改为 `tempMeanC→Climatology/T2M`、`tempHighC→Daily/T2M_MAX/UTC`、`tempLowC→Daily/T2M_MIN/UTC`、`precipMm→Climatology/PRECTOTCORR_SUM`。
- **H9**（§8.2 / §20）：validation contract 按来源分离——Copernicus contract（retrieval / schema / range / parameter semantics / required completeness）与 NASA fallback contract（同五项 + **source-specific temporal semantics where applicable**），不再硬拼为单一合同。
- **H10**（§23.0）：新增 v8.5 correction evidence 章节，逐条引用 `pilot-2026.09.11.v1` 真值（`T2M` correct、`PRECTOTCORR_SUM` correct、`T2M_MAX_AVG/T2M_MIN_AVG` wrong canonical semantics、**509/1740 = 29.3%** 分类差异、ERA5-family cross-check mean Δhigh −0.23 °C / Δlow +0.01 °C（v8.4 记录值；v8.5 可复现值为 −0.181 / −0.040，差异登记于 §23.0）），并声明 Open-Meteo 仅作 cross-check。
- **H11**（§19.2 / §23.4）：把本轮新确认 / 仍 UNRESOLVED 的事项重新登记——`precipDaysGe1mm`=UNRESOLVED、`sunshineHours`=UNRESOLVED、`daylightHours`=astronomical 且无已采用实现、elevation=0/145、ERA5 PRIMARY=BLOCKED_BY_MISSING_CDS_CREDENTIALS、NASA licence=UNVERIFIED、database rights=UNRESOLVED。
- **H12**（§23）：changelog / blocker closure / artifact integrity / final decision 全面重写；`ruleVersion = r1-r7.v4` **保持不变**，R1–R7 数值**一个不改**。

---

## 1. Executive Summary

**为什么 BLOCKED**：Best-time 的 1740 个月度数据行全部由 `airport.latitude` 模板推导，145 页共享 8 套月度模式；`weatherScore` 无可追溯来源。Decision Support UI 的核心承诺建立在不存在的数据上。

**关键数据语义**：ERA5 Monthly Means 的 min/max 字段是**月内极值**；UI 需要的"平均日最高/最低气温"必须经**日值层**（ERA5 Derived Daily Statistics，dailyAggregationBoundary = UTC+00:00，见 §6.1）聚合。

**最终方案**：PRIMARY = **Copernicus ERA5 Reanalysis Family**（canonical source family；字段级 official product 映射固定，代表性增强时使用同 family 的 ERA5-Land products）；FALLBACK = **NASA POWER / MERRA-2 family**（cross-family switch，整条 ClimateRecord 切换）；CONVENIENCE/CROSS-CHECK = **Open-Meteo Archive**；EXCLUDED = **Meteostat**；NOAA 仅作美国交叉验证 benchmark。构建期静态 dataset + SSG；推荐结论 = exhaustive 可解释规则（R1–R7，gap=0）+ 受治理 editorial override；**全链路无单一 Climate Score**；旧 `bestMonths` = Historical editorial claim set。

## 2. Current Data Problem

引用上一阶段审计（不重复编造数字）：
- 1740/1740 月度行 = latitude 查表模板；145 页共享 8 套月度向量；真实数值行 0。
- `weatherScore`：145 个手写字面量，12/145 与项目评分器公式一致 → 不可信，不得进入新架构（冻结，去留属产品决策 P-6）。
- 真实 `bestMonths` 与派生层冲突：8 例完全矛盾 / 23 例窗口内零派生 best / 99 例派生 best 错位。
- 8 页渲染无出处数字（45°C+/40°C），"fewer crowds / lower prices" 无任何客流/价格数据。

## 3. Data Source Research（A–E）

### 3.1 Weather ≠ Climate（硬性区分）
- **Weather**：短期预报（7–16 天）。项目现有 `src/lib/api/weather.ts`（Open-Meteo forecast，runtime，planner 用）属于此类，**不能**做伪 climate。
- **Climate**：多年历史统计（normals）。Best-time 只能使用此类。
- Open-Meteo **Climate API 是 CMIP6 预估（1950–2050 模型数据）**，官方文档明言"不应被当作实际测量"→ 不适合本需求，不与 Archive API 混淆。

### 3.2 A · NOAA / NCEI
- **U.S. Climate Normals 1991–2020**（C01620）：站点级 30 年 normals，仅覆盖美国及领地。月度参数 `mly-tmax-normal / mly-tmin-normal / mly-tavg-normal / mly-prcp-normal` 与 UI 字段语义直接对齐。
- 许可：public domain。对 145：成品 normals 仅覆盖 17/145 → 不作主源，仅作美国城市交叉验证 benchmark。

### 3.3 B · Copernicus ERA5 Reanalysis Family（PRIMARY）
- Provider：**Copernicus Climate Change Service / ECMWF**。
- ECMWF 第五代全球再分析（观测同化 + 物理模型），全球无缝、无缺测格点。
- 覆盖：ERA5 0.25°×0.25°（1940–present）；ERA5-Land 0.1°（1950–present，仅陆地）——**二者均属本 family 的 official products**（见 §7.4 层级定义）。
- 产品谱系（§7 依据）：**ERA5 Monthly Means**（`2m temperature` = 月均；min/max 字段为月内极值；**`total precipitation` = 月平均日率，单位 "m of water equivalent per day"，须 × 当月天数才是月合计**——v8.5 Phase 1B 修正，见 §7.2 行 B 与 §19.2）；**ERA5 Derived Daily Statistics**（由小时值推导的日最低/最高——计算平均日高/低的正确中间层；小时源数据以 UTC 为时间参照）。
- 访问：Copernicus CDS（注册 + 逐数据集接受许可），`cdsapi` 批量下载；GRIB/NetCDF；高峰期排队（小时–天级）。
- 许可：**Licence to use Copernicus Products (rev. 12)**（官方正式名称；Internal short name: Copernicus Licence rev. 12；条件明细见 §15）；署名语句见 §15。
- 维护：机构级保障，供应商停服风险极低。

### 3.4 C · Open-Meteo Historical / Archive（CONVENIENCE / CROSS-CHECK）
- Provider：**Open-Meteo**；Source Family：**Open-Meteo Historical / Archive**；Official Product：**Archive API**。
- 底层 ERA5/ERA5-Land/IFS；日值变量直接可用（`temperature_2m_mean/max/min`、`precipitation_sum`、`sunshine_duration` 等）。
- 限制（Terms 已核验）：免费档非商业；广告站=商用 → 必须订阅（Historical 需 Professional+）。价格 UNVERIFIED。
- 许可：输出 CC BY 4.0 + Copernicus 署名。**永不作为 source of truth。**

### 3.5 D · Meteostat（EXCLUDED）
- CC BY-NC 4.0，禁止商业 as-is 再分发 → **除名**。仅 §7 定义表保留一行"仅供记录"。

### 3.6 E · NASA POWER（FALLBACK source family / CROSS-CHECK）
- Provider：**NASA POWER**（NASA Langley Research Center）；Source Family：**NASA POWER / MERRA-2**；Official Products（按字段固定，见 §7.2.1）：**Climatology API**（`T2M`、`PRECTOTCORR_SUM`，自定义窗口 1991–2020）+ **Daily API**（`T2M_MAX`、`T2M_MIN`，`time-standard=UTC`）。
- Spatial resolution（**v8.5 Pilot-tested**）：**tested source-native grid ≈ 0.5° latitude × 0.625° longitude**。实测依据：Climatology / Daily / Monthly 响应的官方 header title 均为 `NASA/POWER Source Native Resolution …`，`sources = ["MERRA2","POWER"]`；0.5°×0.625° 与 MERRA-2 native grid 一致，并有公开的 NASA POWER 参数速查表述（"Spatial resolution of 0.5 x 0.625 degrees of latitude and longitude respectively"）作为旁证。
  - **限定**：这是**本次测试的 endpoint 的 native source grid 观测**，不代表所有 POWER products/requests 都应按同一分辨率概括；**不得**把 regional request grid 与 source-native grid 混用，也**不得**写成 0.5°×0.5°。
- MERRA-2 同化模型（降水为偏差订正；exact 参数身份与语义见 §7.2.1——`PRECTOTCORR` = **average 口径 mm/day**，禁止充当月合计；`PRECTOTCORR_SUM` = **accumulated 口径月合计**，为 canonical `precipMm` 唯一合法参数）。
- **Canonical 温度路径（v8.5 实测确定）**：`tempHighC` / `tempLowC` **只能**来自 Daily API `T2M_MAX` / `T2M_MIN`（`time-standard=UTC`）经日历月聚合与 1991–2020 平均；Climatology 的 `T2M_MAX_AVG` / `T2M_MIN_AVG` 是「30 年平均的月内极值」，**已被证伪为 canonical high/low 来源**（§23.0）。
- 许可状态（v7 修正）：NASA POWER 站点自述 "no restrictions on the use, access, and/or download" 并请求引用 NASA POWER（Stackhouse et al.）；但**该自述不足以作为正式 licence 条文结论**——commercial use 与 redistribution（含派生静态 dataset 上线）的正式许可条文 = **UNVERIFIED / LEGAL REVIEW REQUIRED**（§15/§19.1/§23.4）。引用要求与数据来源事实保留。
- 判定：**独立 fallback source family**。触发时为 **source-family switch**——整条 ClimateRecord 切换至 NASA POWER family（§8.2 Step 7），不得与 Copernicus family 拼字段。

### 3.7 其它候选
- WorldClim / Meteoblue / Visual Crossing 等：UNVERIFIED，未纳入。本轮不扩展新候选源。

## 4. Data Source Comparison Matrix

| Metric | NOAA Normals | Copernicus ERA5 Reanalysis Family | Open-Meteo Archive | Meteostat | NASA POWER / MERRA-2 |
| --- | --- | --- | --- | --- | --- |
| Data nature | Station observations, homogenized | Reanalysis (observation-assimilated) | Same underlying ERA5 / ERA5-Land | Aggregated station data | MERRA-2 model |
| Global coverage | US and territories only | Global seamless grid | Global seamless grid | Station network | Global grid |
| Monthly climate product | Yes (US normals) | Yes (monthly means + derived daily statistics) | Yes (daily values for self-aggregation) | Yes (normals endpoint) | Yes (climatology) |
| UI three temperature fields direct | Yes (mly-tmax/tmin/tavg) | Mean temp direct; high/low need daily layer (Section 7) | Yes (daily fields) | Yes (but excluded) | Mean temp direct (Climatology `T2M`); precip monthly total = Climatology `PRECTOTCORR_SUM` (v8.2 research-confirmed, v8.5 pilot-verified on 145×12); **high/low MUST come from Daily `T2M_MAX`/`T2M_MIN` + `time-standard=UTC` + calendar-month mean + 1991–2020 average; Climatology `T2M_MAX_AVG`/`T2M_MIN_AVG` are PROHIBITED (30-yr average of monthly EXTREME, §7.2.1 / §23.6)** |
| Coordinate mapping | Station matching | Nearest grid cell (deterministic) | Nearest grid cell (deterministic) | Station / interpolation | Nearest grid cell (deterministic) |
| SSG suitability | Suitable | Suitable (build-time) | Suitable (build-time) | Suitable | Suitable |
| Bulk access | S3 direct | cdsapi (queue) | Per-point API (145 points feasible) | Bulk (RapidAPI key) | REST |
| Commercial use | Yes (public domain) | Yes (explicit) | Subscription required (ad site = commercial) | No (CC BY-NC) | UNVERIFIED / LEGAL REVIEW REQUIRED (v7) |
| Attribution | Cite DOI | Two fixed statements | CC BY 4.0 + Copernicus statement | (excluded) | Cite NASA POWER (Stackhouse et al.); licence terms UNVERIFIED |
| Redistribution | Yes | Yes (notice required on modification) | Yes (CC BY 4.0) | No (as-is commercial banned) | **UNVERIFIED / LEGAL REVIEW REQUIRED (v8.3)**——technical access/download capability confirmed; commercial redistribution of a derived static dataset remains legally unverified |
| Cost | Free | Free (engineering + queue time) | Subscription; price UNVERIFIED | Free but NC | Free |
| Maintenance | 10-year normals cycle | Monthly updates; long-term stable | Vendor terms may change | Small team | NASA-backed, daily updates |
| Vendor risk | Very low | Very low | Medium (private company) | Medium | Very low |
| 145 coverage status | 17/145 verified (finished product) | T1 theoretical 145/145; T2/T3 UNVERIFIED (Section 5) | T1 theoretical 145/145; T2/T3 UNVERIFIED | Station matching UNVERIFIED | T1 theoretical 145/145; T2/T3 UNVERIFIED |

## 5. Coverage Analysis — Theoretical vs Verified（三层区分，禁止混用）

| 层级 | 定义 | Copernicus ERA5 Reanalysis Family | Open-Meteo Archive | NASA POWER / MERRA-2 | NOAA 成品 | Meteostat |
| --- | --- | --- | --- | --- | --- | --- |
| T1 Theoretical | 数学事实：任意经纬度落入全球无缝网格，映射规则确定 | 145/145（算术事实） | 145/145（算术事实） | 145/145（算术事实） | 17/145 | 不适用 |
| T2 Production retrieval | 实际拉取 145 点 × 12 月成功返回、数值通过区间校验、海拔差可接受 | UNVERIFIED（Pilot 前置） | UNVERIFIED | UNVERIFIED | 17/145 verified | UNVERIFIED |
| T3 Production acceptance | T2 全过 + 质量旗标审毕 + schema valid + 质量门（§20.7）通过 | UNVERIFIED | UNVERIFIED | UNVERIFIED | — | — |

- **T1 是算术事实，不构成任何实施依据；只有 T3 = 145/145 才允许上线。**
- 基于 `airport.latitude/longitude`（只分析，未调用任何 API）：总量 145；美国 17；纬度 −45.02°（Queenstown）～ 66.56°（Rovaniemi）；南半球 19 个。
- 网格源风险类别（T2 期逐点打旗标）：小型海岛/海岸格点、复杂地形、机场与市区高差大。缓解：同 family 内切 ERA5-Land products（§8.2 Step 3–4）+ 海拔差旗标。
- Fallback 链（family 级）：Copernicus ERA5 Reanalysis Family 失败/校验不过 → **source-family switch** → NASA POWER / MERRA-2 family → 该目的地降级为"仅真实窗口 + 编辑内容"。**绝不回退 latitude 模板。**

## 6. Climate Methodology

- **Normal 窗口**：**1991–2020**（WMO 当前标准 30 年窗口）。逐记录记录 `periodStart/periodEnd`，页面如实标注；不与其它窗口混存。
- **30 年 normal 计算公式**（对每个目的地 × 日历月 m；monthIndex 0–11，0 = 1 月）：
  - `tempMeanC[m] = mean( y=1991..2020 , mean( daily mean T over all days in month m of year y ) )`
  - `tempHighC[m] = mean( y=1991..2020 , mean( daily max T over all days in month m of year y ) )`
  - `tempLowC[m]  = mean( y=1991..2020 , mean( daily min T over all days in month m of year y ) )`
  - `precipMm[m]  = mean( y=1991..2020 , sum( daily precip over all days in month m of year y ) )`
  - 其中"daily max / daily min / daily mean / daily precip"的"日"一律指 **UTC day (UTC+00:00)**（§6.1，UTRIPLA methodology choice）。
  - 单位统一：温度 °C（K−273.15，一位小数）；降水 mm（一位小数）。
  - 同一字段在同一 dataset 内只允许一种聚合路径；字段→official product 映射由 methodologyVersion 固定（§7.4）。

**v8.5 canonical 定义（唯一合法表述；全篇不得出现第二种写法）**：

```text
tempMeanC
= 1991–2020 average of calendar-month mean 2m temperature
  NASA fallback: NASA POWER Climatology T2M

tempHighC
= 1991–2020 mean of daily maximum temperature for each calendar month
  （聚合顺序固定：先按年取该日历月的日最高均值，再对 1991–2020 取均值）
  NASA fallback: NASA POWER Daily T2M_MAX（time-standard=UTC）

tempLowC
= 1991–2020 mean of daily minimum temperature for each calendar month
  （聚合顺序同上）
  NASA fallback: NASA POWER Daily T2M_MIN（time-standard=UTC）

precipMm
= 1991–2020 average of the monthly total precipitation
  NASA fallback: NASA POWER Climatology PRECTOTCORR_SUM
```

**聚合顺序（v8.5 明确，消除歧义）**：§6 的公式是 **mean-over-years of (per-year calendar-month mean)**，不是把 30 年同一日历月的所有日值直接合并求均值（pooled）。二者在 2 月（闰年权重）存在可测差异——Pilot 实测 v8.4 采用 pooled 口径，导致 **2 月 high 61/145、low 50/145 条与 canonical 定义相差 0.01–0.02 °C**（§23.6）。**v8.5 dataset 一律采用 mean-of-yearly-means。**

**绝对禁止（canonical mapping）**：

```text
Climatology T2M_MAX_AVG  -> tempHighC     ❌
Climatology T2M_MIN_AVG  -> tempLowC      ❌
Climatology T2M_MAX      -> tempHighC     ❌
Climatology T2M_MIN      -> tempLowC      ❌
PRECTOTCORR (mm/day)     -> precipMm      ❌
```

### 6.1 Daily Aggregation Boundary（B2 关闭项 · provenance 正确表述）

```text
dailyAggregationBoundary:
  UTC day (UTC+00:00) — 固定

timezoneForDisplay:
  destination IANA timezone（仅用于展示）

relationship:
  display timezone ≠ climate aggregation boundary

Provenance / status（v5 纠正表述）:
  UTRIPLA methodology explicitly selects UTC day (UTC+00:00) as the fixed
  daily aggregation boundary for reproducibility.
  This is a UTRIPLA methodology choice, not a claim that UTC+00:00 is the
  only boundary supported by ERA5.

  事实基础（research-confirmed）：ERA5 / ERA5-Land 小时源数据以 UTC 为时间
  参照；CDS Derived Daily Statistics 由此类小时数据聚合。
  Official capability（research-confirmed，依据 Copernicus 官方 Daily
  Statistics 产品说明）：daily statistics 的时间边界支持按 UTC offset 配置；
  UTC+00:00 即不做偏移时的选择。
  Product methodology：UTRIPLA 当前固定 dailyAggregationBoundary = UTC+00:00。
  ⚠ 二者不是同一件事——前者是 Copernicus 的官方能力，后者是 UTRIPLA 的
  方法学选择；不得把 UTC+00:00 写成 "ERA5 官方强制口径"。

Rules（全部锁死）:
  1. DST 不影响 climate aggregation——统计层不使用 DST / local offset。
  2. runtime timezone 不能改变历史 climate values。
  3. 每次 pipeline 重跑使用同一 boundary（同 methodologyVersion 必同口径）。
  4. 修改 boundary 必须 increment methodologyVersion + 全量重烘焙 +
     页面口径标注更新。
  5. 同一 dataset version 内不得出现不同 daily boundary。

Implication（如实披露，不隐藏）:
  对远离本初子午线的目的地，UTC day 与当地民用日不同；个别日的日最高/最低
  可能落在当地感知的相邻日期。该影响对 30 年月度 normals 量级小且全球统一；
  页面方法注必须注明 "daily statistics computed on UTC days (UTC+00:00)"。
```

- **降水日数** `precipDaysGe1mm`：**v8.6 = 正式授权的派生字段（Option A，不再为 null）**。定义：`count(日降水 ≥ 1.0 mm，UTC+00:00 日)` 按日历月·年计数 → 1991–2020 均值。输入必须是**同 source family 的官方日值产品**（NASA Daily `PRECTOTCORR`；ERA5 `derived-era5-single-levels-daily-statistics` 的 `total_precipitation` + `daily_sum`——官方目录已确认 daily_sum 仅适用于累积变量，total precipitation 属累积变量）。派生字段政策（v8.6 新增，四条件）：① 仅由 canonical 日值路径输入计算；② 公式确定性且书面固定；③ provenance 记录 `derived=true` + `thresholdMm` + 公式；④ 不得声明该计数本身为 official product。1.0 mm 阈值为 WMO rain-day 惯例。纯月度产品（无日值输入）不得推导 → 该场景下按 §12.3 null 政策处理。
- **日照** `sunshineHours`：WMO 定义 `sunshine_duration` 仅 Open-Meteo 日值路径提供；CDS 直连路径无等价官方产品 → 留 `null`，不造数。（v8.6 维持 UNRESOLVED，属外部/产品决策。）
- **白昼时长** `daylightHours`：**v8.6 = 正式采纳确定性天文实现（不再为 null）**。日值：NOAA General Solar Position Calculations 计算太阳赤纬，日出/日落天顶角 z0 = 90.833°（90° 几何 + 34′ 折射 + 16′ 太阳上缘，民用晨昏线惯例）；日长仅依赖（纬度，日期），与经度/时区无关。月度聚合：**年内逐日均 → 该年月均 → 1991–2020 三十年等权算术平均**（闰年精确处理：30 年中 8 个闰年 2 月各以 29 天计入年均）。极昼/极夜：cos(时角) ≤ −1 → 24 h；≥ 1 → 0 h（rovaniemi 66.56°N 实际触发）。formulaVersion = `noaa-solar-position-2026.09.v1`；数值已验证重跑字节一致 + 外部抽查一致。**禁止标注为观测值**；provenance sourceFamily = `ASTRONOMICAL-CALCULATION`（非气候 family，不参与 source-family 规则）。
- **坐标映射**：anchor = 现有机场坐标；代表性偏差以同 family 的 ERA5-Land products + 海拔差旗标缓解（§8.2）；city-center 属产品决策 P-5。
- **确定性**：同 destination + 同 month → 永远同一数值（dataset 版本化，构建期烘焙）；monthIndex 0–11，不依赖 runtime 时区；`timezone` 仅用于展示。

## 7. Climate Field Definitions（A–E 可执行定义表）

### 7.1 UI Label → Canonical Field → 语义（唯一合法定义）

| UI Label | Canonical Field | 统计语义 | 单位 |
| --- | --- | --- | --- |
| Avg. High | `tempHighC` | **平均日最高气温**：30 年内、该日历月所有"日最高气温"（**UTC+00:00 day** 内最大值，§6.1）的均值。不是月内绝对最高。 | °C |
| Avg. Low | `tempLowC` | **平均日最低气温**：30 年内、该日历月所有"日最低气温"（**UTC+00:00 day** 内最小值）的均值。不是月内绝对最低。 | °C |
| Avg. Temp | `tempMeanC` | **平均日均温**：30 年内、该日历月所有"日均温"的均值。 | °C |
| Rainfall | `precipMm` | 该日历月降水合计的 30 年均值。 | mm |
| Rain days | `precipDaysGe1mm` | **v8.6 派生字段**：该月内日降水 ≥1 mm 天数（UTC+00:00 day）按年计数后的 30 年均值（同 family 官方日值路径输入）。 | days |
| Sunshine | `sunshineHours` | WMO 定义日照时长的月均值（仅 Open-Meteo 日值路径可得）。 | h |
| Daylight | `daylightHours` | **v8.6 已采纳实现**：天文白昼时长（NOAA 公式，民用晨昏线 90.833°）的年内逐日均 → 月均 → 30 年等权均值（确定性计算，非观测）。 | h |

> **关键修正（持续有效）**：ERA5 Monthly Means 的 `maximum_2m_air_temperature`（月极值）**不得**映射到 `tempHighC`；`minimum_2m_air_temperature` **不得**映射到 `tempLowC`。

### 7.2 A–E 源逐字段执行定义

| Source | `tempMeanC` | `tempHighC` | `tempLowC` | `precipMm` | 执行要点 |
| --- | --- | --- | --- | --- | --- |
| A · NOAA Normals（仅美 17 城） | `mly-tavg-normal` 直取 | `mly-tmax-normal` 直取 | `mly-tmin-normal` 直取 | `mly-prcp-normal` 直取 | 仅 17/145；作美国交叉验证 benchmark |
| B · Copernicus ERA5 Reanalysis Family | ERA5 Monthly Means → 30 年均值 | ERA5 Derived Daily Statistics（UTC+00:00 day）→ 月均 → 30 年均值 | 同左（日最低） | ERA5 Monthly Means → **月平均日率 × 当月天数 = 月合计**（官方单位 m of water equivalent per day，见 §19.2 第 8 项）→ 30 年均值 | 同 family 双 official products 组合合法（§8.3）；字段级归属记入 fieldProvenance |
| C · Open-Meteo Archive | 日值 `temperature_2m_mean` → 月均 → 30 年均值 | 日值 `temperature_2m_max` → 月均 → 30 年均值 | 日值 `temperature_2m_min` → 月均 → 30 年均值 | 日值 `precipitation_sum` 月合计 → 30 年均值 | 全字段可算；商用须订阅；仅便利/校验通道 |
| D · Meteostat | normals `tavg` | normals `tmax` | normals `tmin` | normals `prcp` | **已除名（CC BY-NC 4.0）**，仅供记录 |
| E · NASA POWER / MERRA-2 | Climatology `T2M` | **Daily `T2M_MAX` + `time-standard=UTC` + 日历月均 + 1991–2020 平均**（v8.5 pilot-verified 145/145） | **Daily `T2M_MIN` + `time-standard=UTC` + 日历月均 + 1991–2020 平均**（同左） | Climatology `PRECTOTCORR_SUM`（accumulated 月合计；v8.2 research-confirmed + v8.5 pilot-verified 145×12） | **禁止** Climatology `T2M_MAX_AVG/T2M_MIN_AVG`（30 年平均的月内极值）与 Climatology 层 `T2M_MAX/T2M_MIN`；**禁止** average 口径 `PRECTOTCORR` 充当月合计；参数语义见 §7.2.1；自定义窗口 1991–2020 |

### 7.2.1 NASA POWER 参数语义、temporal level 与 canonical pipeline（v8.5 重写 · 依据 `pilot-2026.09.11.v1` 实测）

**本节全部结论以 Pilot 真实响应为依据；research-confirmed 与 pilot-verified 严格分列，不得混称。**

```text
─────────────────────────────────────────────────────────────────────────
A. 参数语义（Pilot 实测 + 官方 Data Processing 定义）
─────────────────────────────────────────────────────────────────────────
Climatology 层
  T2M              = 2m 气温；月度 climatology = 日均温的月平均
                     → 与 canonical tempMeanC 语义一致
                     → PILOT-VERIFIED（145×12 vs 独立 Monthly endpoint：
                        n=1740, mean Δ=0.000011, median Δ=0.000000,
                        max |Δ|=0.005）                              ✅ 采用

  T2M_MAX_AVG      = 30-year average of the monthly EXTREME maximum
                     （每月极端最高气温的 30 年平均）
                     → 实测：与「每年该月内日最大值 → 再对 30 年取均值」
                       在 1734/1740 条上完全一致（残差 ≤0.01 舍入）
                     → 不是「平均日最高气温」                        ❌ 禁用
  T2M_MIN_AVG      = 30-year average of the monthly EXTREME minimum
                     → 实测 1729/1740 条与上述口径一致              ❌ 禁用

  T2M_MAX / T2M_MIN（Climatology 层）= 月内瞬时极值口径
                     → 与 T2M_MAX_AVG/T2M_MIN_AVG 同为 monthly extreme 家族
                                                                    ❌ 禁用

Daily 层
  T2M_MAX          = 该 UTC 日的日最高气温
  T2M_MIN          = 该 UTC 日的日最低气温
                     → 经「日历月内日均值 → 1991–2020 平均」后
                       即 canonical tempHighC / tempLowC             ✅ 采用
                     → 实测 145/145 点 × 10958 天/点，无缺测

Precipitation（Climatology 层）
  PRECTOTCORR      = bias-corrected total precipitation, AVERAGE rate
                     units = mm/day  —— 不是月合计                   ❌ 禁用
  PRECTOTCORR_SUM  = bias-corrected total precipitation, ACCUMULATED
                     units = mm（月合计）
                     → canonical precipMm 的唯一合法参数              ✅ 采用
                     → PILOT-VERIFIED：145×12 上
                        PRECTOTCORR × 当月天数(1991–2020 平均) ≈ PRECTOTCORR_SUM
                        ratio median = 0.999954；月合计 ≥20 mm 的 1565 条
                        ratio ∈ [0.9928, 1.0070]；
                        与独立 Monthly endpoint 相比 mean Δ=0.000072、
                        max |Δ|=0.005

─────────────────────────────────────────────────────────────────────────
B. UTRIPLA canonical fallback mapping（v8.5 · 语义唯一合法解）
─────────────────────────────────────────────────────────────────────────
  tempMeanC  → Climatology  T2M                （timeStandard = UTC）
  tempHighC  → Daily        T2M_MAX            （timeStandard = UTC）
  tempLowC   → Daily        T2M_MIN            （timeStandard = UTC）
  precipMm   → Climatology  PRECTOTCORR_SUM    （timeStandard = UTC）

  绝对禁止：
    Climatology T2M_MAX_AVG  → tempHighC
    Climatology T2M_MIN_AVG  → tempLowC
    Climatology T2M_MAX      → tempHighC
    Climatology T2M_MIN      → tempLowC
    PRECTOTCORR (mm/day)     → precipMm

─────────────────────────────────────────────────────────────────────────
C. temporal-level 判定规则（v8.5 关键修正：按 level 判定，不按参数名）
─────────────────────────────────────────────────────────────────────────
  Climatology-level T2M_MAX / T2M_MIN / T2M_MAX_AVG / T2M_MIN_AVG
      → prohibited for canonical tempHighC / tempLowC

  Daily-level T2M_MAX / T2M_MIN
      → permitted
      → only after calendar-month aggregation（禁止直接当作月值）
      → only with time-standard=UTC

  判定键 = officialProduct 的 temporal level（"climatology" | "daily"），
  不是参数名本身。fieldProvenance 必须记录 temporalLevel（§12.2）。

─────────────────────────────────────────────────────────────────────────
D. NASA fallback pipeline（v8.5 五段式，逐字段固定）
─────────────────────────────────────────────────────────────────────────
  tempMeanC:
      T2M
      → Climatology API
      → time-standard=UTC
      → calendar-month mean
      → 1991–2020

  tempHighC:
      T2M_MAX
      → Daily API
      → time-standard=UTC
      → calendar-day maximum
      → calendar-month mean（先按年，再跨年，见 §6 聚合顺序）
      → 1991–2020

  tempLowC:
      T2M_MIN
      → Daily API
      → time-standard=UTC
      → calendar-day minimum
      → calendar-month mean
      → 1991–2020

  precipMm:
      PRECTOTCORR_SUM
      → Climatology API
      → accumulated monthly precipitation
      → 1991–2020

  No field-level source-family mixing.
  （NASA POWER 内部多个 temporal endpoints 同属 NASA POWER / MERRA-2
    source family，因此整条记录仍是合法的「单一 source family」记录；
   这与「跨 family 拼字段」完全不同，不得混淆。）

─────────────────────────────────────────────────────────────────────────
E. NASA POWER temporal-standard semantics（v8.5 · 按 Pilot 实测重写）
─────────────────────────────────────────────────────────────────────────
  实测事实（pilot-2026.09.11.v1）：
    1. Climatology API —— 默认请求（不带 time-standard）
       → 响应 header 返回 time_standard = "LST"      （4/4 smoke 点）
    2. Climatology API —— time-standard=UTC
       → 响应 header 返回 time_standard = "UTC"      （4/4 smoke + 145/145）
       → 即：Climatology 明确接受 time-standard=UTC 请求参数
    3. Daily API —— time-standard=UTC
       → 响应 header 返回 time_standard = "UTC"      （145/145）
    4. Monthly API —— time-standard=UTC
       → 响应 header 返回 time_standard = "UTC"      （145/145）
    5. LST 与 UTC 响应存在非零差异（4 smoke 点实测）：
       温度最大 |Δ| = 0.14 °C；月降水最大 |Δ| = 3.14 mm

  由实测得出的方法学结论：
    · 禁止再出现 "Climatology default = UTC"         （与实测矛盾）
    · 禁止再出现 "time-standard parameter not supported by Climatology"
                                                      （与实测矛盾）
    · 也不得反向虚构 "省略 time-standard 即 non-compliant" 的 API 硬性要求
      ——UTC 是 UTRIPLA 方法学选择，不是 NASA 强制合规条款

  三个概念严格分离（不得互相替代）：
    source temporal standard      （源产品实际使用的时间标准：UTC / LST）
    ≠ UTRIPLA dailyAggregationBoundary（方法学日边界：固定 UTC+00:00）
    ≠ destination display timezone（展示用 IANA 时区）

  对 Daily-derived canonical 温度：
      timeStandard             = UTC
      dailyAggregationBoundary = UTC+00:00
  对 Climatology-derived canonical 字段（tempMeanC / precipMm）：
      timeStandard             = UTC（显式请求并实测确认）
      dailyAggregationBoundary = not-applicable

  destination display timezone 永不改变历史 climate values。

─────────────────────────────────────────────────────────────────────────
F. Spatial resolution（v8.5 · 统一表述）
─────────────────────────────────────────────────────────────────────────
  tested source-native grid:
      ≈ 0.5° latitude × 0.625° longitude

  official title（响应 header 逐字）:
      "NASA/POWER Source Native Resolution Climatology Climatologies"
      "NASA/POWER Source Native Resolution Daily Data"
      "NASA/POWER Source Native Resolution Monthly and Annual"

  说明：
    · 这是「本次测试 endpoint 的 native source grid 观测」；
    · 不代表所有 POWER products/requests 都应概括成同一 resolution；
    · 不把 regional request grid 与 source-native grid 混用；
    · 不写作 0.5° × 0.5°。

─────────────────────────────────────────────────────────────────────────
G. 官方 Data Processing 链（research-confirmed，保留）
─────────────────────────────────────────────────────────────────────────
  Hourly → Daily → Monthly → Annual → Climatology
```

### 7.3 明确不做的事

- 不得用 Monthly Means 月极值字段冒充 Avg High / Avg Low。
- 不得把 absolute monthly max/min 用于本页。
- **不得把 NASA POWER Climatology `T2M_MAX_AVG` / `T2M_MIN_AVG`（30 年平均的月内极值）冒充 Avg High / Avg Low**——这与 ERA5 Monthly Means 月极值是同一类错误（v8.5 pilot-verified）。
- **不得把 NASA POWER Climatology 层 `T2M_MAX` / `T2M_MIN` 用作 canonical high/low**（temporal level 判定，见 §7.2.1 C）。
- **不得把 average 口径 `PRECTOTCORR`（mm/day）当作月合计**。
- **不得把 Daily 层日值直接当作月值**（必须先做日历月聚合）。
- 任何源缺某字段 → `null` → UI 不展示；禁止填充。

### 7.4 Field → Official Product Mapping（B1/B3 关闭项 · 层级 + 映射正式定义）

```text
Provider:
  Copernicus Climate Change Service / ECMWF
        ↓
Source Family（canonical，全文唯一定义）:
  Copernicus ERA5 Reanalysis Family
        ↓
Official Products（同 family 内的官方产品）:
  - ERA5 Monthly Means
  - ERA5 Derived Daily Statistics
  - ERA5-Land Monthly Means / Daily Statistics（代表性增强触发时使用，见 §8.2 Step 4）

Field mapping（fixed by methodologyVersion；12 个月完全相同）:
  tempMeanC       → ERA5 Monthly Means
  precipMm        → ERA5 Monthly Means
  tempHighC       → ERA5 Derived Daily Statistics
                    （dailyAggregationBoundary = UTC+00:00）
  tempLowC        → ERA5 Derived Daily Statistics
                    （dailyAggregationBoundary = UTC+00:00）
  precipDaysGe1mm → v8.6 = APPROVED-DERIVED（Option A）：
                    ERA5 路径 = derived-era5-single-levels-daily-statistics
                    （total_precipitation + daily_sum，time_zone=utc+00:00）；
                    NASA fallback 路径 = Daily API PRECTOTCORR（已实测 145/145）；
                    count(日降水 ≥ 1.0 mm) 月·年计数 → 1991-2020 均值；
                    provenance 记录 derived=true + thresholdMm=1.0 + 公式
  sunshineHours   → CDS 路径无等价官方产品 → null（UNRESOLVED 维持）
  daylightHours   → v8.6 = 已采纳确定性天文实现（NOAA 公式，formulaVersion
                    noaa-solar-position-2026.09.v1；sourceFamily =
                    ASTRONOMICAL-CALCULATION，非气候 family）
```

**ERA5-Land 的 family 层级（最终定义，B1 关闭项）**：

```text
ERA5-Land = same canonical source family（Copernicus ERA5 Reanalysis Family）
          + different official product

因此：
  one destination = one source family 仍然成立。
  同一目的地在 family 内从 ERA5 products 切到 ERA5-Land products
  （same-family product selection）不破坏锁定。
  全文禁止出现 "sourceFamily = ERA5" 与 "sourceFamily = ERA5-Land" 并存的
  层级写法——ERA5 / ERA5-Land 是 official product 层的名称，
  不是 source family 层的名称。
```

**组合与禁止**：
- **允许**：ERA5 Monthly Means + ERA5 Derived Daily Statistics（同 family）。
- **禁止**：ERA5 tempMeanC + NASA POWER tempHighC；ERA5 precipitation + Open-Meteo temperature——任何跨 source family 拼字段（除非未来单独批准新的 source-family architecture，当前策略不允许）。
- **禁止**：字段→official product 映射逐月变化。

## 8. Source Selection & Switching Rules

### 8.1 角色固定（family 级）

| Source family | 角色 |
| --- | --- |
| Copernicus ERA5 Reanalysis Family（CDS 直连） | PRIMARY（所有目的地的默认起点） |
| NASA POWER / MERRA-2 family | Explicit fallback + cross-check（仅当 §8.2 Step 7 条件触发；触发 = source-family switch） |
| Open-Meteo Historical / Archive family | Convenience / cross-check，永不作为 source of truth |
| NOAA Normals | US cross-validation benchmark（17 城），不参与生产链 |
| Meteostat | Excluded |

（ERA5 与 ERA5-Land 不是两个 family——均为 Copernicus ERA5 Reanalysis Family 内的 official products，见 §7.4。）

### 8.2 Source Selection Algorithm（destination-level，deterministic，可复现可审计）

```text
INPUT
  destinationId        // destinations.ts slug（目的地唯一标识）
  anchorLatitude       // anchor 纬度（现有 destinations.ts 机场坐标）
  anchorLongitude      // anchor 经度
  anchorElevation      // anchor 海拔（m；可为 null，见 Step 1）
  ruleVersion          // source-selection 规则版本（写入 provenance）
  methodologyVersion   // 方法学版本（含字段→product 映射与 daily boundary）

STEP 1:
  Validate anchor
  IF anchorLatitude 或 anchorLongitude 缺失，或超出范围（lat −90..90，lon −180..180）:
      FAIL → 目的地标记 "anchor-invalid"；不生成任何气候字段（降级展示）
  IF anchorElevation 为 null:
      继续流程，但打旗标 "elevation-unknown"（Step 3 受限，如实记录）

STEP 2:
  Initialize canonical source family = Copernicus ERA5 Reanalysis Family

STEP 3:
  Evaluate representativeness enhancement condition
  IF anchorElevation 与初选格点 elevationM 均已知:
      delta   := |gridCellElevationM − anchorElevation|
      trigger := (delta > ELEV_MISMATCH_M)      // 参数身份见 §8.2.1
  ELSE:
      trigger := false（flags 记录 elevation-unknown）

STEP 4:
  Select official Copernicus product according to fixed rule
  IF trigger == true AND anchor 位于陆地:
      official product := ERA5-Land（0.1°）；在 ERA5-Land 网格上重算格点
      IF 新 delta 仍 > ELEV_MISMATCH_M: 打旗标 "elevation-mismatch"（保留）
  ELSE:
      official product := ERA5（0.25°）
  （same-family product selection：不改变 source family）

STEP 5:
  Provisional Selection（临时选定——**不是 final lock**）
  仅记录 candidate：
    candidate source family   = Copernicus ERA5 Reanalysis Family
    candidate official product mapping（§7.4，fixed by methodologyVersion）
    candidate period          = 1991..2020
    candidate anchor/grid     = 本步确定的格点
    candidate methodologyVersion
  此时尚未通过 source acceptance，**不得声称 final lock**。
  Provisional selection != final source lock。

STEP 6:
  Complete retrieval + validation
  按 §7.4 candidate 映射拉取全部字段；执行 **Copernicus acceptance contract**（五项）：
    1) retrieval success
    2) schema validation
    3) range validation
    4) parameter / field semantic validation
       —— canonical 语义断言（与 §6 / §7.1 / §7.2.1 严格一致）：
         · tempHighC 的 aggregationMethod 必须是 "mean of daily maximum"，
           official product 必须是日值层产品（ERA5 Derived Daily Statistics）；
           Monthly Means 的月极值字段一律拒收
         · tempLowC 同理（daily minimum）
         · precipMm 必须是 accumulated monthly total
         · 任何 provenance 中 aggregationMethod 与 parameter 口径矛盾 → 拒收
    5) required-field completeness（tempMeanC / tempHighC / tempLowC / precipMm）
  （Copernicus acceptance contract = documented acceptance condition 的求值；
    **不得包含任何 NASA-specific request parameter 条件**）

STEP 7:
  IF Copernicus fails ITS OWN acceptance contract（上述五项任一失败：
     取数失败 / schema 校验失败 / 区间校验拒收 / 参数语义校验失败 /
     必有字段缺失）:
      switch to NASA POWER / MERRA-2 family —— source-family switch：
      a) discard provisional Copernicus selection for final provenance
         （候选 Copernicus 五元组不作最终 provenance 保留）
      b) retrieve ALL required fields from the fallback family
         （整条 ClimateRecord 的全部字段来自 POWER family；
           禁止 ERA5 字段 + NASA 字段混拼）
      c) validate the **NASA fallback acceptance contract**：
         通用五项（与 Copernicus 同款，但按 NASA 参数断言）：
           1) retrieval success
           2) schema validation
           3) range validation
           4) parameter / field semantic validation
              —— temporal-level aware 断言（§7.2.1 C）：
                · Climatology-level T2M_MAX / T2M_MIN / T2M_MAX_AVG /
                  T2M_MIN_AVG → 用于 tempHighC / tempLowC 一律拒收
                · Daily-level T2M_MAX / T2M_MIN → 允许，且必须已经过
                  日历月聚合（禁止日值直当月值）
                · precipMm 的 parameter 必须是 PRECTOTCORR_SUM；
                  PRECTOTCORR（mm/day）拒收
                · No field-level source-family mixing（整条记录同 family）
           5) required-field completeness
         + **source-specific temporal semantics validation（v8.5 实测基准）**：
           依实际采用的 temporal product 执行：
           · Daily / Monthly / Climatology path → 请求必须显式携带
             time-standard=UTC，且响应 header 的 time_standard 必须为 "UTC"
             （Pilot 实测：Climatology 默认返回 LST；显式 UTC 返回 UTC；
               Daily / Monthly 显式 UTC 均返回 UTC，145/145）
           · 响应 time_standard 与请求不符 → 拒收
           · 不得把 "UTC" 写成 NASA 的强制合规条款——它是 UTRIPLA 方法学选择；
             也不得声称 "Climatology 默认 UTC" 或 "Climatology 不支持
             time-standard 参数"（二者均与实测矛盾）
         IF NASA 任一字段不满足 canonical 语义或 temporal 语义:
             NASA fallback fails → no fabricated values → degraded display
      打旗标 "fallback-source"。
STEP 8:
  IF fallback also fails:
      return null / degraded display:
      该目的地全部气候字段 = null；页面仅显示真实窗口 + 编辑内容。

STEP 9:
  ONLY after successful acceptance → persist FINAL destination-level lock
  （final lock occurs only after source acceptance）:
    one destination = one FINAL source family
                    + one FINAL climate period
                    + one FINAL anchor/grid mapping
                    + one methodologyVersion
                    + one fixed field→official-product mapping
    —— 若走了 Step 7，final source family / grid / fieldProvenance 全部
       指向 fallback（NASA POWER / MERRA-2），不残留 Copernicus 候选值。
  Persist provenance（写入 ClimateRecord，见 §12.2）:
    sourceFamily / fieldProvenance（逐字段 provider+family+product+boundary+
      aggregationMethod，均指 final accepted source）/ periodStart / periodEnd /
      grid / dailyBoundary / selectionReason（含是否发生 fallback 及触发条件）/
      ruleVersion / methodologyVersion / flags
```

**算法约束**：
1. Source selection 是 **destination-level decision**：以目的地为单位决策并锁定，不存在月级选择。
2. **时序不变式（v7）**：`Provisional selection != final source lock`；**final lock occurs only after source acceptance**（Step 9）。fallback 发生后，final sourceFamily / grid / fieldProvenance 全部重新指向 fallback family，不残留 Copernicus 候选值。
3. **12 个月 final lock 定义**：one destination = one FINAL canonical source family + one FINAL climate period + one FINAL canonical anchor/grid mapping + one methodologyVersion + one fixed field→official-product mapping。January 与 December 的映射完全相同，产品映射不允许逐月变化。
4. **禁止跨 source family 拼字段**（ERA5 tempMeanC + NASA POWER tempHighC 等一律禁止）。
5. **禁止**"哪个源数据更好就临时选哪个"——唯一合法变更路径 = 修改规则/参数/映射 → ruleVersion / methodologyVersion 递增 → 全量重烘焙。
6. **deterministic、可复现、可审计**：同输入（坐标 + 海拔 + ruleVersion + methodologyVersion）必同输出；selectionReason 持久化（含 fallback 是否发生）。

### 8.2.1 ELEV_MISMATCH_M 参数身份

```text
Parameter:       ELEV_MISMATCH_M
Proposed trigger: 150 m
Status:          Product / engineering parameter — NOT a scientific constant。
                 150 m 不是 WMO / ECMWF / Copernicus / NASA 官方阈值；
                 不存在任何官方文件规定该数值。
Rationale:       ERA5-Land 的选择原则是"提升 land-surface representativeness"
                 （0.1° 更细网格、仅陆地）。150 m 只是当前 proposed trigger。
Validation:      必须在 Pilot 期评估（145 anchor 的 delta 分布实测后复核）。
Default:         150 m，除非 Pilot 否决或替换。
Change control:  修改该数值 = 修改方法学 → ruleVersion / methodologyVersion 递增，
                 并触发受影响目的地的全量重烘焙。
```

### 8.3 Fallback 语义（两级严格区分）

```text
① Same-family product selection（允许，不改变 family）:
   ERA5 products → ERA5-Land products
   （同属 Copernicus ERA5 Reanalysis Family；§8.2 Step 4）

② Cross-family fallback（source-family switch，整条记录切换）:
   Copernicus ERA5 Reanalysis Family → NASA POWER / MERRA-2 family
   （§8.2 Step 7；一旦发生，整条 ClimateRecord 的全部字段来自 POWER family；
     禁止 ERA5 tempMeanC + NASA tempHighC 之类跨 family 拼接）

   No field-level source-family mixing —— 同 family 内的多 temporal endpoint
   不构成混源：
     NASA POWER / MERRA-2 是一个 source family；
     Climatology API 与 Daily API 是该 family 下的不同 temporal endpoint。
     因此 tempMeanC/precipMm（Climatology）+ tempHighC/tempLowC（Daily）
     是合法的「同一 source family」记录（§7.2.1 D）。

   fallback 记录必须通过 NASA fallback acceptance contract（§8.2 Step 7 c）：
     五项通用校验（其中第 4 项为 temporal-level aware 的 canonical 语义断言）
     + source-specific NASA temporal semantics validation
       （请求显式 time-standard=UTC 且响应 time_standard = "UTC"；
         实测基准见 §7.2.1 E）
```

其余硬性规则：source 锁定与版本化（§8.2 Step 5 provisional → Step 9 final lock；final lock occurs only after source acceptance）；确定性；旗标透明（§12.4）；失败即降级、绝不造数（fallback 链走完仍失败 → null + 降级展示，禁止 latitude 模板兜底）。

## 9. Recommendation Methodology

### 9.1 最高规则：NO SINGLE CLIMATE SCORE
- **禁止**生成任何单一气候总分。任意加权无法从数据推导，正是上一 Gate 判死的伪精确模式。
- 唯一例外门槛：出现可引用的公开方法学且经产品 + 法务双确认——当前不存在，视为不成立。

### 9.2 结论档位 Taxonomy（三档；命名属产品待决 P-4）

| 档位 | 定义（规则产出，非人工印象） | 页面呈现示例 |
| --- | --- | --- |
| Favourable | 未触发 R1–R6 任一规则（即落入 R7） | "Comfortable temperatures, relatively dry" |
| Workable | 最终由 R4/R5/R6 中按 Rule ID 首个命中的规则决定；其他同时命中的温和规则保留在 QA provenance 中，页面只展示胜出的单条理由 | "Hot afternoons — plan mornings" |
| Challenging | 最终由 R1/R2/R3 中按 Rule ID 首个命中的规则决定（其余命中留档 QA provenance，页面只展示胜出的单条理由） | "Peak of the wet season" |

### 9.3 阈值表（每个数字显式标注身份）

**阈值身份声明**：下表任何数字（40°C、32°C、18°C、−10°C、30mm、90mm、200mm）**均不是 WMO / ECMWF / Copernicus / NOAA 官方规定**。每个数字只能是两类身份之一：`Public-methodology anchor + product parameter` 或 `Product-defined threshold`。150m 身份见 §8.2.1。

| 变量 | 档位 | 阈值（基于 canonical 字段） | 身份 |
| --- | --- | --- | --- |
| 日高温 | Extreme hot | `tempHighC ≥ 40` | Public-methodology anchor（高温健康预警量级）+ product parameter（P-3a） |
| 日高温 | Hot | `tempHighC ≥ 32`（决策树中 R1 先处理 ≥40，first-match 消解重叠） | Product-defined threshold（P-3b） |
| 日高温 | Comfortable band | `18 ≤ tempHighC < 32`（v4 修正，与 R7 严格一致） | Product-defined threshold（P-3c） |
| 日高温 | Cool | `tempHighC < 18` | Product-defined threshold（P-3d） |
| 日低温 | Extreme cold | `tempLowC ≤ −10` | Product-defined threshold（P-3e） |
| 月降水 | Dry | `precipMm < 30` | Product-defined threshold（P-3f） |
| 月降水 | Moderate | `30 ≤ precipMm < 90` | Product-defined threshold（P-3f） |
| 月降水 | Wet | `90 ≤ precipMm < 200` | Product-defined threshold（P-3f） |
| 月降水 | Very wet | `precipMm ≥ 200` | Product-defined threshold（P-3f） |

> **v4 修正记录（历史）**：v3 的 Comfortable band 上限 28 与 R7 造成 29–31°C gap；v4 起统一为 `18 ≤ tempHighC < 32`。该判定的 18–31.9°C = Favourable 是 **product-defined operational threshold**，不是科学事实。

### 9.4 R1–R7 Decision Tree（B3 关闭项 · exhaustive proof 实体化）

**执行模型：first-match-wins。按 Rule ID 顺序逐条求值，第一条命中的规则决定档位与展示理由；后续规则不再求值。**

| Rule ID | Input conditions | Classification | Reason text |
| --- | --- | --- | --- |
| R1 | `tempHighC ≥ 40` | Challenging | "Extreme heat: average daytime highs reach {tempHighC}°C" |
| R2 | `tempLowC ≤ −10` | Challenging | "Extreme cold: average overnight lows reach {tempLowC}°C" |
| R3 | `precipMm ≥ 200` | Challenging | "Peak of the wet season: {precipMm} mm of rain" |
| R4 | `tempHighC ≥ 32` | Workable | "Hot afternoons: highs average {tempHighC}°C — plan mornings" |
| R5 | `precipMm ≥ 90` | Workable | "Wet month: {precipMm} mm — pack rain gear" |
| R6 | `tempHighC < 18` | Workable | "Cool days: highs average {tempHighC}°C" |
| R7 | `18 ≤ tempHighC < 32` 且 `precipMm < 90` | Favourable | "Comfortable: highs average {tempHighC}°C, {precipMm} mm rain" |

**Effective domains（first-match 后每条规则的实际生效域；三变量 tempHighC + tempLowC + precipMm 全部纳入）**：

```text
记号（Notation）:
  H = tempHighC        L = tempLowC        P = precipMm

合法输入域（Valid Climate Input Domain）:
  H ∈ [−70, 60]    L ∈ [−70, 60]    P ∈ [0, 2000]

Effective domain（即：排除被更小 Rule ID 先行捕获的输入后的剩余域；
与上方表格的 first-match 求值顺序严格一致）:

R1 effective domain:
  H >= 40
  （L、P 任意）

R2 effective domain:
  H < 40 AND L <= −10
  （P 任意）

R3 effective domain:
  H < 40 AND L > −10 AND P >= 200

R4 effective domain:
  32 <= H < 40 AND L > −10 AND P < 200

R5 effective domain:
  H < 32 AND L > −10 AND 90 <= P < 200

R6 effective domain:
  H < 18 AND L > −10 AND P < 90

R7 effective domain:
  18 <= H < 32 AND L > −10 AND P < 90
```

**Exhaustiveness proof（对三变量全空间）**：

```text
按 H 分支归并（H = tempHighC）：
  [40, 60]                       → R1                      ✔ 覆盖
  [−70, 40):
    L ≤ −10                      → R2                      ✔ 覆盖
    L > −10:
      P ≥ 200                    → R3                      ✔ 覆盖
      P < 200:
        H ∈ [32, 40)             → R4                      ✔ 覆盖
        H < 32:
          P ≥ 90                 → R5                      ✔ 覆盖
          P < 90:
            H < 18               → R6                      ✔ 覆盖
            18 ≤ H < 32          → R7                      ✔ 覆盖

七个 effective domain 两两不相交（每层分支互斥），
且其并集 = 合法输入域全空间（决策树穷尽了 H × L × P 的每一层划分，
无遗漏分支）。

三个结论（显式）:
  ① Coverage:
       Union(R1..R7) = Valid Climate Input Domain
  ② Gap:
       Gap = 0（unclassified gap = 0）
  ③ Overlap:
       raw-condition 层存在设计性重叠（如 R1∩R4：H≥40 亦满足 H≥32；
       R1∩R2：H=41 且 L=−11 同时满足两条；R2∩R3..R7、R3∩R4..R7 等同理）——
       overlap is intentional at raw-condition level；
       first-match ordering resolves it deterministically（较小 Rule ID 胜出）。
       effective domains 层面已互斥：任意合法 (H, L, P) 恰好落入一个
       effective domain → exactly one final rule（最终 classification 唯一）。
```

> **证明与举例的区别（不得混淆）**：上方的 **Effective-domain partition** 用于证明没有逻辑 gap（数学归并）；下方的 **Boundary worked examples** 用于回归测试（逐点断言）。两者不是一回事，二者必须同时存在且同时通过。

**mixed-variable conflict 处理**：
- 极端规则（R1–R3）压过温和规则（R4–R6）与 Favourable——first-match ID 序天然保证。
- 两个温和规则同时命中 → 较小 Rule ID 胜出并提供展示理由；未胜出命中持久化留档（页面只展示一条理由）。
- 同月同时命中多条极端规则 → R1 胜出。

**Worked examples（规格级断言，实现必须复现；未注明处默认 tempLowC > −10）**：

| 输入 | 命中 | 输出 |
| --- | --- | --- |
| `tempHighC=27, precipMm=250` | R3 | Challenging — "Peak of the wet season" |
| `tempHighC=40, precipMm=20` | R1 | Challenging — "Extreme heat" |
| `tempHighC=33, precipMm=120` | R4 | Workable — "Hot afternoons" |
| `tempHighC=10, precipMm=40` | R6 | Workable — "Cool days" |
| `tempHighC=10, precipMm=120` | R5 | Workable — "Wet month" |
| `tempHighC=24, precipMm=70` | R7 | Favourable |
| `tempHighC=41, tempLowC=−11` | R1 | Challenging — "Extreme heat"（ID 序 tie-break） |

**Boundary worked examples（全部边界逐点断言）**：

| 输入 | 命中 | 输出 | 说明 |
| --- | --- | --- | --- |
| `tempHighC=17.9, precipMm=40` | R6 | Workable Cool | 17.9 < 18 |
| `tempHighC=18.0, precipMm=40` | R7 | Favourable | 下边界含 18.0 |
| `tempHighC=28.0, precipMm=89.9` | R7 | Favourable | 28 不再是上限 |
| `tempHighC=28.1, precipMm=89.9` | R7 | Favourable | v3 gap 区间 |
| `tempHighC=29.0, precipMm=89.9` | R7 | Favourable | 29°C 有规则 |
| `tempHighC=30.0, precipMm=89.9` | R7 | Favourable | 30°C 有规则 |
| `tempHighC=31.9, precipMm=89.9` | R7 | Favourable | 31.9°C 有规则 |
| `tempHighC=32.0, precipMm=20` | R4 | Workable Hot | 32°C 进 R4 |
| `tempHighC=39.9, precipMm=20` | R4 | Workable Hot | R4 生效域上界内 |
| `tempHighC=40.0, precipMm=20` | R1 | Challenging | 40.0 恰入极端 |
| `tempLowC=−9.9, tempHighC=25, precipMm=40` | R7 | Favourable | R2 只看 tempLowC ≤ −10 |
| `tempLowC=−10.0, tempHighC=25, precipMm=40` | R2 | Challenging | 恰入极端低温 |
| `tempHighC=25, precipMm=29` | R7 | Favourable | Dry <30 不触发规则 |
| `tempHighC=25, precipMm=30` | R7 | Favourable | Moderate 仅描述性分层 |
| `tempHighC=25, precipMm=89.9` | R7 | Favourable | R5 下边界前 |
| `tempHighC=25, precipMm=90.0` | R5 | Workable Wet | 恰入 Wet |
| `tempHighC=25, precipMm=199.9` | R5 | Workable Wet | R5 生效域上界内 |
| `tempHighC=25, precipMm=200.0` | R3 | Challenging | 恰入 Very wet |

**Best Months 基线三分支确定性规则（正式规范；v7 补全第三分支）**：

```text
if Favourable months exist:
    bestMonthsBaseline := all Favourable months       // 按 monthIndex 升序
else if Workable months exist:
    bestMonthsBaseline := Workable month(s) with lowest precipMm
    tie-break          := smallest |tempHighC − comfortMidpoint|
                          // comfortMidpoint = 25 = 舒适带 (18–32) 中点，
                          // 随 P-3c 变更联动更新
else:
    bestMonthsBaseline := []
    recommendationStatus := "no-favourable-month"
```

**第三分支约束（全部 12 个月 = Challenging 时）**：
- 不得从 Challenging months 中伪造"最佳月份"——`bestMonthsBaseline = []` 是合法的确定性输出。
- R1–R7 classification 仍然只有 `Favourable` / `Workable` / `Challenging` 三档；`bestMonthsBaseline = []` **不是第四档**（它是 Best Months 层的空集状态，不是月份档位）。
- 页面显示采用既有 degraded / no-favourable-month 状态机制（如实呈现"全年均为 Challenging"，配合 Challenging 依据句）。
- editorial override 仍必须经过 §10.2 资格链——不能绕过本分支直接人工填入 Best Months。

- 输出约束：所有规则最终只产生 `Favourable` / `Workable` / `Challenging` 三档之一；不存在第四档、不存在数值分。
- **可追溯链**：`destination → month → source data（ClimateRecord.months[m]）→ rule ID → reason text`。rule 求值结果（含未胜出命中）构建期持久化供 QA 审计。

### 9.5 Best Months Provenance（正式流程，实体化）

```text
Climate Dataset
      ↓
Monthly Climate Facts
      ↓
R1–R7 Recommendation
      ↓
Best Months 基线三分支（§9.4）:
      Favourable 存在        → bestMonthsBaseline = Favourable 月集合
      Favourable 空、Workable 存在 → Workable 中 precipMm 最低
                               （tie-break: |tempHighC − comfortMidpoint| 最小）
      Favourable、Workable 均空    → bestMonthsBaseline = []；
                               recommendationStatus = "no-favourable-month"
      ↓
ruleBaseline（含 [] 空集分支）
      ↓
Editorial Override Eligibility（§10.2；覆盖全部三分支，含 [] 分支）
      ↓
approved override?
   ├── No  → bestMonthsFinal = ruleBaseline（可为 []）
   └── Yes → bestMonthsFinal = editorialOverride
      ↓
bestMonthsFinal
      ↓
Page Display
   （bestMonthsFinal = [] → degraded / no-favourable-month 状态展示；
     非 [] → 正常 Best Months + provenance 标注）
```

- `bestMonthsFinal` **绝不写回 Climate Dataset**；Climate Dataset 永远保持纯事实（只含 §12 气候字段与 provenance，不含任何推荐结论）。
- Best Months 是**产品结论，不是 climate fact**——永远可追问到"哪条规则/哪个 override"。
- `recommendationStatus = "no-favourable-month"` 是展示层状态（degraded 机制），不是 climate 档位，也不是第四个 classification。

## 10. Historical bestMonths 的地位与 Editorial Override 治理

### 10.1 正式定名与地位
- 现有 `bestMonths`（40 种字符串模式）正式更名为 **"Historical editorial claim set"**。
- **不具备任何气候权威**：不是数据、不是基线、不是校准目标、不参与任何数值生成、不得作为 climate truth、不得对数据基线取得 precedence。
- 允许的用途仅三项：① 回归对照；② 审阅队列种子；③ override 证据候选（走 §10.2 资格链）。

### 10.2 Override Qualification Chain（正式流程，实体化）

```text
Historical editorial claim
        ↓
Independent evidence（可指名来源；"通常 / 一般认为 / 编辑经验"不算证据）
        ↓
Editorial rationale（书面理由：为何与数据基线不同）
        ↓
Named reviewer（具名负责人）
        ↓
reviewedAt
        ↓
nextReviewAt
        ↓
Conflict assessment（与 ruleBaseline 的差异逐条留档）
        ↓
Decision
   ├── reject   → claim-only（永不展示为数据、不进入 Best Months）
   └── approve  → editorialOverride（仅改变展示层推荐）
```

**正式规则**：
1. old bestMonths 不具备 climate authority（不是数据、不参与数值生成）。
2. old bestMonths 不自动成为 override——"以前这么写过"绝不构成批准理由；禁止自动迁移。
3. override 不改变 climate facts（dataset 中的数值不因 override 变动）。
4. override 只影响 final displayed recommendation。
5. override 必须可审计（治理记录含 evidence[]/rationale/reviewer/reviewedAt/nextReviewAt/conflict assessment）。
6. override 过期后不能继续无限有效——超过 nextReviewAt 未复核 = 自动失效回退 ruleBaseline，直至重新通过资格链。

## 11. Data Architecture（正式架构图，实体化）

```text
Official Provider
        ↓
Source Family
        ↓
Official Product
        ↓
Acquisition
(一次性 cdsapi 批量下载；原始文件归档于仓库外对象存储，
 附请求参数与时间戳 = 可复现凭证 + database-rights 合规证据)
        ↓
Normalization
(K→°C 换算；字段名规范化为 §12.3 canonical 名称；monthIndex 0–11；
 daily 统计一律 UTC+00:00 口径（§6.1）；缺失 → null，禁止填充)
        ↓
Validation
(Zod schema + 区间校验：温度 −70..60°C、月降水 0..2000mm、monthIndex 0..11、
 period 枚举；越界 = 拒收该值 → null + flag；禁止 clamp)
        ↓
Destination Anchor Mapping
(anchor lat/lon/elev → nearest grid cell，确定性映射；记录 cell 坐标/分辨率/海拔)
        ↓
Source Family / Product Lock
(§8.2 算法；Step 5 provisional selection → Step 6 retrieval+validation →
 Step 7 fallback switch → Step 9 final lock after source acceptance：
 destination-level final 锁定 family + official product mapping +
 period + anchor/grid + methodologyVersion；fallback 后全部指向 fallback
 family；§7.4 字段映射固定)
        ↓
Canonical Climate Dataset
(versioned JSON；datasetVersion + methodologyVersion + period + licence +
 attribution + fieldProvenance；可 diff、可回滚；纯事实，无推荐结论)
        ↓
Recommendation Engine
(R1–R7 first-match 纯函数（exhaustive，gap=0）；阈值从版本化配置读取；构建期执行)
        ↓
Editorial Governance
(§10.2 资格链；approve/reject 决策与理由持久化)
        ↓
Static Build Artifact
(bestMonthsFinal + monthTier + reason 合并进渲染输入)
        ↓
SSG
(generateStaticParams 读 dataset；预渲染 HTML)
        ↓
Best-time Page
(runtime 零气候计算)
```

**Build-time 负责（且仅 build-time）**：acquisition、normalization、daily/monthly aggregation（UTC+00:00 口径）、validation、source selection、provenance generation、recommendation、editorial merge、static dataset generation。

**Runtime 约束**：
- 只允许：`Static Dataset → Page Rendering`。
- **禁止 `Browser → Climate API`**（任何形式的运行时气候请求）。
- destination `timezone` 仅参与展示，不得在 runtime 改变历史 climate values（§6.1 Rule 2）。
- Weather forecast（`lib/api/weather.ts`，planner 场景）与 Best-time 链路完全隔离。

## 12. Data Model（正式 data contract；非代码实现）

### 12.1 ClimateDataset Contract

```ts
type ClimateDataset = {
  datasetVersion: string;        // 数据内容版本（任何重烘焙 → 递增）
  methodologyVersion: string;    // 方法学版本（聚合 + 选源 + 字段→product 映射 + daily boundary）

  source: {
    providers: string[];         // e.g. ["Copernicus Climate Change Service / ECMWF", "NASA POWER (NASA Langley)"]
    sourceFamilies: string[];    // 本 dataset 允许/实际包含的 source families 摘要：
                                 // e.g. ["Copernicus ERA5 Reanalysis Family", "NASA POWER / MERRA-2"]
                                 // 全部来自同一 family 时仅一个元素——但 schema 不强迫单 family
    officialProducts: string[];  // e.g. ["ERA5 Monthly Means", "ERA5 Derived Daily Statistics"]
    licence: string;             // e.g. "Licence to use Copernicus Products (rev. 12)"（官方正式名称）
    attribution: string;         // 逐字署名语句（§15）
  };

  periodStart: string;           // "1991"
  periodEnd: string;             // "2020"
  dailyBoundary: "UTC+00:00";    // §6.1 固定口径（UTRIPLA methodology choice）

  generatedAt: string;           // 烘焙日期（ISO 8601）

  records: ClimateRecord[];      // 见 §12.2
};
```

说明（P1）：**Dataset-level `source.sourceFamilies[]` 是摘要 / 允许的 source-family catalog；`ClimateRecord.sourceFamily` 才是单个目的地记录的权威 provenance。** cross-family fallback 可导致个别目的地的实际 source family 与 dataset 主导 family 不同——记录级（§12.2）权威，dataset 级仅为摘要；不得把两者混淆。此修正**不放松** destination-level lock（§8.2 Step 5 provisional selection → Step 9 final lock 的时序与 §8.3 依然全文有效）。

### 12.2 ClimateRecord Contract

```ts
type ClimateRecord = {
  destinationId: string;         // destinations.ts slug（校验层断言与之一致）

  anchor: {
    type: "airport" | "city";    // "city" 仅在产品决策 P-5 引入后出现
    latitude: number;
    longitude: number;
    elevationM: number | null;   // 未知时 null（伴随 flag "elevation-unknown"）
  };

  grid: {                        // §8.2 Step 9 final lock 确定的格点（fallback 后指向 fallback family 格点）
    latitude: number;
    longitude: number;
    resolution: string;          // "0.25" | "0.1"（Copernicus family）| NASA POWER = endpoint/product-specific（v8.1：以 Pilot 实测的官方
                                 // spatial-resolution wording 为准，不预先泛化为 0.5）
    elevationM: number | null;
  };

  sourceFamily: string;          // "Copernicus ERA5 Reanalysis Family"
                                 // | "NASA POWER / MERRA-2"
                                 // （family 层；ERA5/ERA5-Land 是 product 层名称）

  periodStart: string;           // 记录级（fallback 后可与 dataset 主导值不同）
  periodEnd: string;

  methodologyVersion: string;    // 本记录生成所依据的方法学版本

  selection: {                   // §8.2 Step 9 的最终选源审计信息（指向 final accepted source）
    reason: string;              // 触发规则 + delta 值
    ruleVersion: string;         // 选源规则版本
  };

  dailyBoundary: "UTC+00:00";    // §6.1 固定；timezone 仅展示

  fieldProvenance: Record<string, {
    // ── v8.5 provenance contract：15 keys，全部必填（未核实字段值为 null）
    provider: string;            // e.g. "Copernicus Climate Change Service / ECMWF"
    sourceFamily: string;        // e.g. "Copernicus ERA5 Reanalysis Family"
    officialProduct: string | null;
                                 // e.g. "ERA5 Derived Daily Statistics"；
                                 // null = 正式 unresolved status（v7）：
                                 // 当前实例 = precipDaysGe1mm / sunshineHours /
                                 // daylightHours；禁止伪造 official product；
                                 // 必有字段（tempMeanC/tempHighC/tempLowC/precipMm）
                                 // 的 officialProduct 不得为 null
    endpoint: string | null;     // 精确 endpoint URL
    parameter: string | null;    // 精确参数名（e.g. "T2M_MAX"）
    temporalLevel: string | null;
                                 // "climatology" | "daily" | "monthly" | "hourly"
                                 // v8.5 新增：temporal-level 判定的权威键
                                 // （同一参数名在不同 level 语义不同）
    timeStandard: "UTC" | "LST" | "not-applicable";
                                 // v8.5：source temporal standard actually
                                 // used by the source product / path。
                                 // 实测基准（pilot-2026.09.11.v1）：
                                 //   Climatology 默认请求 → "LST"
                                 //   Climatology + time-standard=UTC → "UTC"（145/145）
                                 //   Daily + time-standard=UTC → "UTC"（145/145）
                                 //   Monthly + time-standard=UTC → "UTC"（145/145）
                                 // Copernicus daily statistics 以 UTC 时间
                                 // 参照处理（§19.1）→ "UTC"。
                                 // Copernicus 月度产品（tempMeanC /
                                 // precipMm）无日聚合时间标准 →
                                 // "not-applicable"。
                                 // 禁止表述："Climatology default = UTC"、
                                 // "Climatology 不支持 time-standard 参数"、
                                 // "Climatology 省略 time-standard 即
                                 //  non-compliant"（三者均与实测矛盾或属
                                 //  把方法学选择伪造成 API 合规条款）。
    dailyAggregationBoundary: "UTC+00:00" | "not-applicable";
                                 // UTRIPLA methodology 日边界（仅日派生字段）
    aggregationMethod: string;   // 见下方示例；必须与 parameter 口径一致
    periodStart: string | null;  // e.g. "1991" / "1991-01-01"
    periodEnd: string | null;    // e.g. "2020" / "2020-12-31"
    grid: string | null;         // e.g. "0.25" | "0.1" |
                                 // "NASA/POWER Source Native Resolution"
    selectionReason: string;     // 为何选该字段来源（含被拒绝来源的原因）
    ruleVersion: string;         // e.g. "r1-r7.v4"（选源规则版本）
    methodologyVersion: string;  // e.g. "utrip-methodology-2026.09.v8.5"
  }>;

  flags: string[];               // §12.4 枚举

  months: MonthRecord[];         // 恰好 12 项；monthIndex 0–11（0 = 1 月）
};
```

**fieldProvenance 权威示例（回答"这个具体数值来自哪个官方产品？"）**：

```text
tempHighC:
  provider                  = Copernicus Climate Change Service / ECMWF
  sourceFamily              = Copernicus ERA5 Reanalysis Family
  officialProduct           = ERA5 Derived Daily Statistics
  dailyAggregationBoundary  = UTC+00:00
  timeStandard              = UTC（v8.4；ERA5 daily statistics 以 UTC 时间参照处理，§19.1）
  aggregationMethod         = mean of daily maximum temperature for each calendar month
                              → 1991–2020 average

tempLowC:
  provider                  = Copernicus Climate Change Service / ECMWF
  sourceFamily              = Copernicus ERA5 Reanalysis Family
  officialProduct           = ERA5 Derived Daily Statistics
  dailyAggregationBoundary  = UTC+00:00
  timeStandard              = UTC（v8.4；同上）
  aggregationMethod         = mean of daily minimum temperature for each calendar month
                              → 1991–2020 average

tempMeanC:
  provider                  = Copernicus Climate Change Service / ECMWF
  sourceFamily              = Copernicus ERA5 Reanalysis Family
  officialProduct           = ERA5 Monthly Means
  dailyAggregationBoundary  = not-applicable（月均产品，无日边界依赖）
  timeStandard              = not-applicable（v8.4；Copernicus 月均产品，无日聚合时间标准）
  aggregationMethod         = 1991–2020 average of the monthly mean 2m temperature

precipMm:
  provider                  = Copernicus Climate Change Service / ECMWF
  sourceFamily              = Copernicus ERA5 Reanalysis Family
  officialProduct           = ERA5 Monthly Means
  dailyAggregationBoundary  = not-applicable
  timeStandard              = not-applicable（v8.4；Copernicus 月合计产品，无日聚合时间标准）
  aggregationMethod         = 1991–2020 average of the monthly total precipitation
```

**NASA POWER / MERRA-2 fallback 时的 fieldProvenance（v8.5 · pilot-verified 145/145）**：

```text
仅当 Copernicus family 未通过 acceptance 且 POWER fallback 通过参数语义与
temporal 语义验证时，记录级 provenance 才指向 POWER family。此时：

  provider                  = NASA POWER (NASA Langley Research Center)
  sourceFamily              = NASA POWER / MERRA-2   （四个字段同一个 family）
  grid                      = NASA/POWER Source Native Resolution
                              （tested ≈ 0.5° lat × 0.625° lon）
  ruleVersion               = r1-r7.v4
  methodologyVersion        = utrip-methodology-2026.09.v8.5

tempMeanC:
  officialProduct           = Climatology API
  endpoint                  = https://power.larc.nasa.gov/api/temporal/climatology/point
  parameter                 = T2M
  temporalLevel             = climatology
  timeStandard              = UTC        （显式 time-standard=UTC，响应实测 UTC）
  dailyAggregationBoundary  = not-applicable
  aggregationMethod         = 1991–2020 average of calendar-month mean 2m temperature
  periodStart / periodEnd   = 1991 / 2020
  selectionReason           = 语义与 canonical tempMeanC 一致（pilot-verified，§23.0）

precipMm:
  officialProduct           = Climatology API
  endpoint                  = https://power.larc.nasa.gov/api/temporal/climatology/point
  parameter                 = PRECTOTCORR_SUM
  temporalLevel             = climatology
  timeStandard              = UTC
  dailyAggregationBoundary  = not-applicable
  aggregationMethod         = 1991–2020 average of the monthly total precipitation
  periodStart / periodEnd   = 1991 / 2020
  selectionReason           = accumulated monthly total；PRECTOTCORR（mm/day）被拒

tempHighC:
  officialProduct           = Daily API
  endpoint                  = https://power.larc.nasa.gov/api/temporal/daily/point
  parameter                 = T2M_MAX
  temporalLevel             = daily
  timeStandard              = UTC
  dailyAggregationBoundary  = UTC+00:00
  aggregationMethod         = mean over 1991–2020 of the per-year calendar-month
                              mean of daily maximum temperature
  periodStart / periodEnd   = 1991-01-01 / 2020-12-31
  selectionReason           = Climatology T2M_MAX_AVG 被拒：
                              30-year average of monthly EXTREME maximum

tempLowC:
  officialProduct           = Daily API
  endpoint                  = https://power.larc.nasa.gov/api/temporal/daily/point
  parameter                 = T2M_MIN
  temporalLevel             = daily
  timeStandard              = UTC
  dailyAggregationBoundary  = UTC+00:00
  aggregationMethod         = mean over 1991–2020 of the per-year calendar-month
                              mean of daily minimum temperature
  periodStart / periodEnd   = 1991-01-01 / 2020-12-31
  selectionReason           = Climatology T2M_MIN_AVG 被拒：
                              30-year average of monthly EXTREME minimum

canonical NASA 速记（v8.5，全篇唯一合法写法）:
  tempMeanC :  Climatology / T2M
  tempHighC :  Daily / T2M_MAX / UTC
  tempLowC  :  Daily / T2M_MIN / UTC
  precipMm  :  Climatology / PRECTOTCORR_SUM

  绝对不得出现：
  tempHighC / T2M_MAX_AVG
  tempLowC  / T2M_MIN_AVG

Semantic-invariant（v8.5 · temporal-level aware）:
  ① aggregationMethod 含 "mean of daily max/min" 时：
     · temporalLevel 必须是 "daily"，parameter 必须是 T2M_MAX / T2M_MIN
       （或 Copernicus 等价日值产品）
     · Climatology-level T2M_MAX / T2M_MIN / T2M_MAX_AVG / T2M_MIN_AVG
       与之同时出现即 semantic contradiction，校验层必须拒绝
  ② aggregationMethod 含 "monthly total precipitation" 时：
     · parameter 必须是 PRECTOTCORR_SUM（accumulated）
     · average 口径 PRECTOTCORR（mm/day）同时出现即拒收
  ③ timeStandard 必须反映该 source product/path 实际使用的 temporal standard：
     · 声明 "UTC" 则请求必须显式 time-standard=UTC 且响应 header
       time_standard = "UTC"；否则拒收
  ④ timeStandard（源 temporal 标准）与 dailyAggregationBoundary（UTRIPLA
     方法学日边界）是两个不同字段，必须共同出现且互不替代
  ⑤ No field-level source-family mixing：一条 ClimateRecord 的全部字段
     必须来自同一 sourceFamily（同 family 内多 temporal endpoint 允许）
```

### 12.3 MonthRecord（与 §6 / §7 / §9 严格一致，字段名全局唯一）

| 字段 | 类型 | 必有性 | 单位 | 语义 / 来源依赖 |
| --- | --- | --- | --- | --- |
| `monthIndex` | number | 必有 | — | 0–11（0 = 1 月）；不依赖 runtime 时区 |
| `tempMeanC` | number | 必有 | °C | **平均日均温**（§7.1）；ERA5 Monthly Means / 日值路径 / POWER T2M |
| `tempHighC` | number | 必有 | °C | **平均日最高气温**（UTC+00:00 day，§7.1）；仅日值路径 |
| `tempLowC` | number | 必有 | °C | **平均日最低气温**（UTC+00:00 day）；仅日值路径 |
| `precipMm` | number | 必有 | mm | **30 年月降水总量均值** |
| `precipDaysGe1mm` | number | **v8.6：必有** | days | **v8.6 定案 = Option A（授权派生字段，解除 null 固定）**：`count(日降水 ≥ 1.0 mm，UTC+00:00 day)` 月·年计数 → 1991–2020 均值。输入 = 同 source family 官方日值产品（NASA Daily `PRECTOTCORR` 已实测 145/145、0 缺失日；ERA5 = `daily_sum` of `total_precipitation`，官方目录确认可得）。派生四条件见 §6。阈值 = WMO rain-day 惯例 1.0 mm。**非 proxy**（输入为官方日值产品，计数为确定性函数）；R1–R7 不消费此字段 |
| `sunshineHours` | number \| null | 可空 | h | WMO 日照时长月均值。**v8.6 维持 UNRESOLVED**：Copernicus ERA5 family 变量表中**不存在** sunshine duration 官方参数；Open-Meteo 虽提供 `sunshine_duration`，但仅为 cross-check 通道且商用需订阅 → **canonical value = null**（外部/产品决策） |
| `daylightHours` | number | **v8.6：必有（实现已采纳）** | h | **天文量（astronomical calculation，non-observed）**，不属于任何气候 source family（provenance sourceFamily = `ASTRONOMICAL-CALCULATION`）。**v8.6 定案**：NOAA General Solar Position Calculations（z0 = 90.833°）日值 → 年内月均 → 30 年等权均值；闰年精确；极昼 24 h / 极夜 0 h。formulaVersion = `noaa-solar-position-2026.09.v1`。禁止标注为观测值。v8.5 的「可空（实现未采用）」状态就此解除 |

- **null 政策**：`null` = "该源不提供或未获批准"，UI 渲染为"不展示"；禁止填充、插补、近似顶替。**v8.6 后仅 `sunshineHours` 一个字段处于该状态**；`precipDaysGe1mm` 与 `daylightHours` 已转为必有字段。
- 必有字段若某月缺失 → §8 降级链，不得部分填充。
- **`monthIndex` 契约 = 0–11（0 = 1 月）**。Pilot v8.4 产物（`normalized/nasa_canonical_145.json`）使用 **1–12**，属**已发现的契约违背缺陷**；v8.5 产物（`nasa_canonical_145_v85.json`）已修正为 0–11，并由断言 `assert monthIndexRange === 0..11` 锁死（§23.6）。
- **重申字段语义唯一性**：canonical 字段名只有 `monthIndex / tempMeanC / tempHighC / tempLowC / precipMm / precipDaysGe1mm / sunshineHours / daylightHours` 这一套。`Avg. High / Avg. Low` 等仅为 UI label，不是 canonical field；`tempMaxC / tempMinC / avgHigh / avgLow` 等同义名禁止出现在任何规范处。

### 12.4 Flags 枚举
`"anchor-invalid"`｜`"elevation-unknown"`｜`"coastal-cell"`｜`"island"`｜`"elevation-mismatch"`｜`"product-switched"`（同 family 内 ERA5→ERA5-Land）｜`"fallback-source"`（cross-family switch 至 POWER）｜`"representativeness-review"`
- Flags 是质量透明层：可驱动 UI 徽标与 QA 队列。

## 13. Source of Truth（层级化唯一事实源；v5 修正）

```text
Provider
  ↓
Source Family
  ↓
Official Product
  ↓
Climate Dataset            ← 唯一 climate fact source（纯事实，无推荐结论）
  ↓
Recommendation Layer       ← 唯一 recommendation source（R1–R7 + 版本化阈值）
  ↓
Governance Layer           ← 唯一 editorial override source（§10.2 治理记录）
  ↓
Page Display
```

**Dataset 级 source 模型（P1）**：

```text
Climate Dataset = 唯一 climate fact source

Supported source families（dataset 级 catalog / 摘要）:
  - Copernicus ERA5 Reanalysis Family        （PRIMARY）
  - NASA POWER / MERRA-2 family              （fallback only）

Record-level sourceFamily = authoritative provenance for each destination record
  （destination-level lock 不放松：one destination = one canonical source family
    + one period + one anchor/grid mapping + one methodologyVersion
    + one fixed field→official-product mapping）

合法：Destination A/B → Copernicus ERA5 Reanalysis Family；
      Destination C → NASA POWER / MERRA-2 family（该记录整体切换）。
非法：Destination A → ERA5 tempMeanC + NASA POWER tempHighC（跨 family 拼字段）。
```

| 域 | 唯一事实源 | 说明 |
| --- | --- | --- |
| Destination metadata | `destinations.ts` | 城市/国家/region/机场/物流/预算；**不得自行复制气候数值** |
| Climate Dataset（新增） | versioned static JSON（§12） | 唯一 climate fact source；supported families 见上；official products = field-specific and methodology-fixed |
| Recommendation Layer（新增） | R1–R7 规则 + 版本化阈值配置 | 唯一 recommendation source；消费 climate facts，不回写 |
| Governance Layer（新增） | override 治理记录（§10.2） | 唯一 editorial override source；现状 `bestMonths` 字符串仅是 claim 前身 |
| Weather runtime | `lib/api/weather.ts`（forecast） | 只属于 planner / trip runtime forecast；与 Best-time 完全隔离 |
| `weatherScore` | **无** | 冻结：不得进入 Best-time / 新数据架构；去留属产品决策 P-6 |

**流向约束（禁止逆向）**：`Climate Dataset → Recommendation Layer → Governance Layer → Page Display`；禁止把 recommendation 写回 climate dataset（§9.5）。禁止状态：destination 内嵌气候断言 / Best-time 自算 / runtime weather 三套数据互相矛盾——迁移完成后 destination 数据文件中的气候性文字字段必须改为引用 climate dataset 或降级为纯编辑叙述。

## 14. SEO / Trust Impact

- **Trust Layer**：页面固定显示 "Climate averages 1991–2020 · Generated using Copernicus Climate Change Service information" + 方法注（reanalysis 定义、网格分辨率、anchor 说明、**daily statistics computed on UTC days (UTC+00:00)**、阈值表及其身份标注公开）。
- **独立搜索价值排序**（低→高）：单纯 climate table < climate + explanation < climate + recommendation < climate + travel-style decision < climate + destination context。
- 每层内容必须能回指 dataset 数字。**不为 SEO 添加无数据支撑的内容**（crowd/price 声明永久禁止；"typically/通常"不是数据来源）。
- FAQPage/Article JSON-LD 中的气候表述必须逐句来自 dataset 或已通过 §10.2 资格链的 override。

## 15. Licensing / Commercial / Attribution

| 源 | License | 商业 | 修改 | 再分发（静态 JSON 上线） | Attribution |
| --- | --- | --- | --- | --- | --- |
| Copernicus ERA5 Reanalysis Family | **Licence to use Copernicus Products (rev. 12)** ✅ | ✅ | ✅ | ✅（修改后需 "Contains modified Copernicus… (Year)"） | "Generated using Copernicus Climate Change Service information (Year)" |
| Open-Meteo 输出 | CC BY 4.0 ✅ | ⚠️ 需订阅（广告站=商用） | ✅ | ✅ 需署名 | "Weather data by Open-Meteo.com (CC BY 4.0)" + Copernicus 语句 |
| NASA POWER / MERRA-2 | ⚠️ **UNVERIFIED / LEGAL REVIEW REQUIRED**（站点自述 "no restrictions on use/access/download" + 引用请求；正式 licence 条文未取得） | ⚠️ UNVERIFIED | ⚠️ UNVERIFIED | ⚠️ UNVERIFIED | 引用 NASA POWER（Stackhouse et al.）（引用要求保留） |
| NOAA Normals | Public domain ✅ | ✅ | ✅ | ✅ | 引用 DOI（10.25921/wck8-er13） |
| Meteostat | CC BY-NC 4.0 | ❌ | — | ❌ as-is 商业再分发禁止 | —（已除名） |
| 数据库权利 | EU 源注意 sui generis database rights：保留完整转换脚本与记录。细节 **UNRESOLVED / LEGAL REVIEW REQUIRED（v8.5 维持，未关闭）** | | | | |

**v8.5 licence 状态说明（技术验证与法律确认严格分离）**：

```text
NASA POWER / MERRA-2 —— 维持 UNVERIFIED / LEGAL REVIEW REQUIRED
  本轮新增的旁证（不构成 licence 条文）：
    · AWS Open Data Registry 的 NASA POWER 条目自述
      "There are no restrictions on the use, access, and/or download of data
       from the NASA POWER Project. We request that you cite the NASA POWER
       Project when using the data provided from NASA POWER Project."
    · 该条目中的 "Creative Commons BY 4.0" 指向的是 Documentation，不是数据许可
  判定维持不变的理由：
    · 站点自述 /  registry 自述 ≠ 正式 licence 条文；
    · 商业使用与「派生静态 dataset 上线再分发」的正式授权仍未取得；
    · API 可访问、数据可下载 ≠ 法律允许商业再分发（v7 起的原则，v8.5 不变）。
  → 若最终采用 POWER fallback 上线，此项为硬前置（§20 第 3 项）。

Copernicus ERA5 Reanalysis Family —— 官方正式名称维持
  "Licence to use Copernicus Products (rev. 12)"
  v8.5 未取得本轮新的 licence 条文确认 → 复制/分发/署名条件沿用已 research-confirmed
  的既有条件；不得简称为 "CC BY 4.0"。

数据库权利 —— 维持 UNRESOLVED / LEGAL REVIEW REQUIRED
  仓库内无可靠法律依据，v8.5 不自行关闭。
```

**Licence to use Copernicus Products (rev. 12) 实际条件（官方正式名称。`licence` metadata 字段一律使用官方正式名称，不得写成 "CC BY 4.0" 或 "类 CC-BY-4.0"。Internal short name: Copernicus Licence rev. 12——仅作文档内部简称）**：

```text
Commercial use:            permitted
Reproduction:              permitted
Distribution:              permitted
Modification / adaptation: permitted
Attribution:               required
Modification notice:       required where applicable
Disclaimer:                required as specified by the licence

注：Open-Meteo 输出数据自身的 "CC BY 4.0" 许可表述不受本条影响——
  那是 Open-Meteo 的许可，不是 Copernicus Licence 的名称。
```

## 16. Cost / Maintenance

- **One-time（主路径 CDS 直连）**：工程一次性投入；数据费 ¥0；全球月度产品 + 145 点日值采样一次性下载；CDS 排队时间成本（小时–天级）。
- **Recurring**：≈ ¥0/月（normals 十年一版）；可选年度复核为人工成本；无 runtime API 账单。
- **便利通道（Open-Meteo Professional）**：价格 UNVERIFIED（采购前核对官方 Pricing）；月付可随时取消。
- **Storage**：dataset JSON（145 × 12 行 × ~10 字段）< 1 MB；原始归档存仓库外。
- **Build cost**：读本地 JSON，构建时间影响可忽略。
- **"免费"的真实含义**：CDS/NASA POWER 数据免费但需自建管道；Open-Meteo 免费档不适用本站（广告=商用）。

## 17. Risks

1. CDS 队列延迟与配额波动（缓解：一次性批量下载）。
2. 再分析 ≠ 站点观测（缓解：页面明示 "reanalysis-based averages"）。
3. 格点代表性（缓解：§8.2 代表性触发 + 旗标 + 可选 city anchor 复核）。
4. Open-Meteo 条款/价格可变性（缓解：仅便利/校验通道）。
5. 未来 windows 更替（缓解：periodStart/periodEnd 字段化）。
6. 编辑 override 与数据基线漂移（缓解：§10.2 治理记录 + nextReviewAt + 过期自动失效）。
7. 许可细节——LEGAL REVIEW REQUIRED。
8. ERA5 Monthly Means 月极值被误用为平均日高/低（缓解：§7 定义表 + fieldProvenance 路径断言）。
9. 阈值/参数被误读为科学常数（缓解：§9.3 / §8.2.1 身份声明）。
10. **UTC+00:00 口径被当地用户误读为"本地日"或被误传为"ERA5 官方强制"**（缓解：§6.1 明确为 UTRIPLA methodology choice + 页面披露 "daily statistics computed on UTC days (UTC+00:00)"）。
11. **字段→product 映射被误改或 family 层级被错误命名**（缓解：映射随 methodologyVersion 固定 + fieldProvenance 校验断言 + §7.4 层级唯一性检查）。

## 18. Recommended Strategy & Rejected Strategies

**ONE PRIMARY：Strategy B' — "机构级静态 Climate Dataset"**
> Copernicus ERA5 Reanalysis Family（canonical source family）1991–2020 统计：均温/降水走 ERA5 Monthly Means，平均日高/低走 ERA5 Derived Daily Statistics（UTC+00:00 口径）；代表性增强时用同 family 的 ERA5-Land products；字段级映射由 methodologyVersion 固定；构建期采集 → 归一化 → 校验 → versioned 静态 JSON → SSG；推荐结论用 §9（exhaustive 可解释规则 + 受治理 override）；全链路无单一分数。

**ONE FALLBACK：NASA POWER / MERRA-2 family**（Climatology API，自定义窗口 1991–2020；触发 = source-family switch，整条记录切换）；**CONVENIENCE / CROSS-CHECK：Open-Meteo Archive**（同源 ERA5，需订阅）——source of truth 不依赖它；**EXCLUDED：Meteostat**；**NOAA = 美国交叉验证 benchmark**。

Rejected：Runtime API；Meteostat（NC 许可）；NOAA 成品 normals 作主源（17/145）；Open-Meteo Climate API（CMIP6）；latitude 模板 / weatherScore；单一 ClimateScore；forecast 冒充 climate；纯 editorial。

## 19. Three-Layer Statement Classification

### 19.1 Research-confirmed（已核验事实）
- Copernicus ERA5 Reanalysis Family：许可文本、两条署名语句、0.25°/0.1° 分辨率、1940/1950–present、Monthly Means 与 Derived Daily Statistics 产品存在性、**小时源数据以 UTC 为时间参照**、更新节奏；Monthly Means min/max = 月极值。
- Open-Meteo：Archive 端点与日值变量、Terms（广告站=商用、Historical 需 Professional）、CC BY 4.0。
- NASA POWER（v8.5 重写 · **research-confirmed 与 pilot-verified 分列**）：
  - **research-confirmed（文档/官方定义层）**：四级粒度（hourly/daily/monthly/climatology）、climatology 自定义窗口、站点/REST 技术能力、数据来源 MERRA-2、官方 Data Processing 链（Hourly→Daily→Monthly→Annual→Climatology）、官方参数注册表逐字定义（`PRECTOTCORR` = "The average MERRA-2 bias corrected total precipitation…" [mm/day]；`PRECTOTCORR_SUM` = "The accumulated MERRA-2 bias corrected total precipitation…"）、POWER 参数速查对 source grid 的表述（0.5° lat × 0.625° lon）。
  - **pilot-verified（`pilot-2026.09.11.v1` 实测，145 点）**：
    1. Climatology / Daily / Monthly 三个 endpoint 全部 **145/145 HTTP 200**；
    2. Climatology `T2M` 语义 = canonical `tempMeanC`（n=1740，mean Δ=0.000011，median Δ=0，max |Δ|=0.005 vs 独立 Monthly endpoint）；
    3. Climatology `T2M_MAX_AVG` / `T2M_MIN_AVG` = **30 年平均的月内极值**（1734/1740、1729/1740 与「年极值→30 年均值」口径一致），**不是平均日高/低**；
    4. Daily `T2M_MAX` / `T2M_MIN`（`time-standard=UTC`，10958 天/点，缺测 0）经日历月聚合 = canonical `tempHighC` / `tempLowC`；
    5. `PRECTOTCORR_SUM` = accumulated monthly total（145×12：ratio median 0.999954；月合计 ≥20mm 的 1565 条 ratio ∈ [0.9928, 1.0070]；vs Monthly endpoint mean Δ=0.000072、max |Δ|=0.005）；
    6. **Temporal：Climatology 默认请求 → `time_standard: "LST"`（4/4）；`time-standard=UTC` → `"UTC"`（4/4 + 145/145）；Daily/Monthly 显式 UTC → `"UTC"`（145/145）**；LST 与 UTC 差异实测最大 0.14 °C / 3.14 mm；
    7. 响应 header title = `NASA/POWER Source Native Resolution …`；tested source-native grid ≈ **0.5° lat × 0.625° lon**（**不是** 0.5°×0.5°）；
    8. 使用错误的 Climatology 温度映射会造成 **509/1740 = 29.3%** 的 R1–R7 分类差异。
  - **UNVERIFIED（维持）**：commercial / redistribution licensing = **UNVERIFIED / LEGAL REVIEW REQUIRED**——站点自述与 registry 自述不足以支撑正式事实声明。
- NOAA：Normals 1991–2020 仅美国；mly-* 语义；public domain。
- Meteostat：CC BY-NC 4.0 → 除名。
- 方法论：Weather ≠ Climate；CMIP6 ≠ normals；WMO 1991–2020 标准；网格映射确定性。
- 审计事实：1740/1740 模板行、8 套月度向量、weatherScore 133/145 矛盾、8 例窗口矛盾。
- **Daily boundary 归属澄清**：UTC+00:00 是 **UTRIPLA 选择的固定 methodology boundary**；不是 ERA5 唯一支持的官方 boundary，本文档不作此 claim。
- **Daily statistics UTC offset 能力（research-confirmed，依据 Copernicus 官方 Daily Statistics 产品说明）**：daily statistics 的时间边界支持按 UTC offset 配置；UTC+00:00 即不做偏移时的选择。**Official capability（Copernicus 能力）≠ Product methodology（UTRIPLA 固定 UTC+00:00）**——两个事实严格区分。

### 19.2 Implementation-prerequisites（实施前必须完成）
- Pilot：145 点真实拉取 → T2 coverage 实测报告 + 海拔差/旗标全量清单 + ELEV_MISMATCH_M 评估。
- 管道脚本入库版本化；**UTC+00:00 口径写入方法学文档并在页面方法注披露**。
- **fieldProvenance 完整性检查**（每个 canonical 字段都有 provider/sourceFamily/officialProduct/aggregationMethod 条目；v8.6 后必有七字段的 officialProduct 不得为 null，`sunshineHours` 的 officialProduct = null + unresolved 状态为唯一合法 null；派生字段记录 derived=true + 公式）。
- **source-family / official-product hierarchy 检查**（不得出现 family 层写 product 名、product 层写 family 名的混用）。
- **dailyBoundary = UTC+00:00 断言**（同一 dataset version 内唯一）。
- **R1–R7 exhaustive regression**（§9.4 边界值表全过）。
- **source-family lock regression**（同 destination 12 个月同 family + 同映射断言；跨 family 拼字段断言必须失败）。
- **NASA POWER Pilot 核对清单（v8.5 状态）**：
  1. 自定义窗口 1991–2020 实测 → **CLOSED**（Climatology/Daily/Monthly 145/145 HTTP 200）
  2. 月度温度参数语义复核 → **CLOSED**（`T2M` = calendar-month mean，max |Δ| = 0.005）
  3. ~~Climatology endpoint 是否暴露 `T2M_MAX_AVG`/`T2M_MIN_AVG`~~ → **CLOSED（结论反转）**：参数确实存在，但语义为「30 年平均的月内极值」，**被证明不适用**；canonical high/low 改走 Daily `T2M_MAX`/`T2M_MIN`（§7.2.1）
  4. 实际 endpoint 的 official spatial-resolution wording → **CLOSED**（`NASA/POWER Source Native Resolution`；tested ≈ 0.5° lat × 0.625° lon）
  5. exact precipitation parameter 与单位标度 → **CLOSED**（`PRECTOTCORR_SUM` accumulated；145×12 验证通过）
  6. `precipDaysGe1mm` 的 official product 核实 → **v8.6 CLOSED（Option A）**：定案为授权派生字段——输入 = 同 family 官方日值产品（NASA Daily `PRECTOTCORR` 实测 145/145、0 缺失日；ERA5 = `daily_sum`，官方目录确认），计数本身不声明为 official product（§23.4 第 2 项）
  7. source-specific temporal semantics verification → **CLOSED**（默认 LST / 显式 UTC 返回 UTC；Daily/Monthly UTC 145/145）
- **ERA5 PRIMARY 前置（v8.5 新增）**：① 取得 CDS 账号与 API key；② `pip install cdsapi`；③ 写 `~/.cdsapirc`；④ 在 CDS 用户profile 逐数据集接受许可；⑤ 使用 `pilot/best-time/scripts/copernicus_request_template.py` 执行取数。当前 **BLOCKED_BY_MISSING_CDS_CREDENTIALS**（§23.6）。
- **anchor elevation 前置（v8.7 正式修订；用户 Decision C = Option 2）**：elevation source 必须满足 **v8.7 Elevation Source Acceptance Contract**：
  - **Tier 1**（official aviation authority / AIP / airport operator / official government airport database，含 identity+location+elevation+datum+traceability）：**单源可批**。已获取：FAA NFDC 28-Day NASR（US，17/145，EFF 2026-09-03）。
  - **Tier 2**（authoritative aviation database / official-derived database，含 source identity+version/date+airport identity+elevation semantics+traceability）：**单源可批**。
  - **Tier 3**（高质量开放机场数据库，traceable）：**必须一条独立佐证源（elevation Δ≤10 m）**，否则 PENDING。
  - **Tier 4**（generic secondary：Wikipedia/旅行网站/搜索结果/OSM）：**永不单独充分**，仅可作 lead/corroboration。
  - **冲突规则**：Δ≤5 m 记录差异；5–20 m 接受+representativeness flag（双值记录）；>20 m 或 identity 冲突 → REJECT/升级。**禁止平均两个来源**；必须选择 accepted source 或 unresolved。
  - **禁止**：为提高 coverage 把 Tier-3 自动升级为 Tier-1。
  - **PRODUCTION_APPROVED 条件**：airport identity resolved + coordinate consistent + datum known + unit known + traceable source + source tier satisfies acceptance + review complete + conflicts resolved。
  - 当前状态：**145/145 production-approved**（17 APPROVED-TIER1 + 123 APPROVED-VERIFIED + 5 APPROVED-VERIFIED+FLAG；ledger = `pilot/best-time/reports/elevation-v87-final-ledger.json`）。`ELEV_MISMATCH_M`（150 m provisional engineering trigger，不变）对 NASA grid 已可评估：114 ≤150 m / 31 >150 m（`reports/elev-mismatch-v87.json`）；ERA5/Land grid 仍待 CDS 凭据。
- **Copernicus 降水单位换算（v8.5 Phase 1B 修正，硬性实施前提）**：ERA5 / ERA5-Land **monthly averaged** 的 `total_precipitation` **不是月合计**。ECMWF 官方文档：monthly means（of daily means, stream=moda/edmo）的累积量被缩放为"有效处理期 = 1 天"，水文参数有效单位为 **"m of water per day"**。
  官方换算（ECMWF "Conversion table for accumulated variables"）：

  ```text
  tp[mm per month] = tp[m/day] × 1000 × N      （N = 该年该月的天数）
  precipMm[m]      = mean(y=1991..2020) of tp[mm per month]
  ```

  省略 ×N 会造成约 **30 倍低估**。ERA5-Land monthly means 同理。
  该修正是 **provider-side 单位语义澄清**，不改变 canonical 定义 `precipMm = 1991–2020 average of the monthly total precipitation`（§6），也**不改变任何 v8.5 Pilot dataset 数值**（v8.5 dataset 走 NASA fallback 路径，`PRECTOTCORR_SUM` 本身即 accumulated 月合计），因此**不需要 methodologyVersion 递增或全量重烘焙**；但 Copernicus PRIMARY 路径实施时必须执行该换算。
- Open-Meteo 若启用：官方 Pricing 核对。
- Database rights 轻量法务确认；Trust Layer 文案落位（含 UTC-day 披露）。
- 阈值校准试运行（R1–R7 档位分布报告供产品确认 P-3a–f）。

### 19.3 Product-decisions（产品 owner 拍板；均附建议默认值）

| # | 决策项 | 建议默认 |
| --- | --- | --- |
| P-1 | 推荐档位命名（Favourable / Workable / Challenging） | 维持三档命名 |
| P-2 | `ELEV_MISMATCH_M` 触发值 | 150 m——proposed operational trigger，非科学常数（§8.2.1） |
| P-3a–f | 温度/降水阈值表（§9.3） | 按表内建议值 |
| P-4 | 档位/依据句最终 UI 文案 | 按 §9.2 句式 |
| P-5 | 是否引入 city-center 坐标 | 第一版不引入，anchor=机场 + 旗标透明 |
| P-6 | `weatherScore` 字段删除 vs 改造 | 从 Best-time 路径移除；字段去留另议 |
| P-7 | sunshine/precipDays 为 null 时的列展示策略 | 整列不展示 |
| P-8 | override 审批流 owner 与复核周期 | 内容负责人 + 12 个月复核 |
| P-9 | 下一代 normal 窗口切换时点 | 跟随 WMO/NOAA 官方切换 |
| — | （非待决）daily aggregation boundary | **已固定 UTC+00:00**（§6.1，UTRIPLA methodology choice）；修改走 methodologyVersion change control |

## 20. Implementation Prerequisites & Quality Gate（未来实施前必须满足；本轮不实施）

1. **Pilot（T2 coverage）**：145 坐标真实拉取，逐点核验取值合理性、格点海拔差、海岛/海岸旗标；输出 coverage-report（T1=145/145 是算术事实；T2/T3 必须实测后才能关闭）。
2. **价格确认**（若用 Open-Meteo 通道）：核对官方 Pricing。
3. **许可落位**：Trust Layer 文案（含 Copernicus 署名与 UTC+00:00 daily-boundary 披露）+ dataset licence/attribution 元数据 + database rights 轻量法务确认 + **NASA POWER 正式 licence 条文确认（commercial/redistribution，当前 UNVERIFIED / LEGAL REVIEW REQUIRED）**——若最终采用 POWER fallback 上线，此项为硬前置。
4. **方法学文档**：normal 窗口、聚合公式（§6）、**daily boundary（UTC+00:00，§6.1）**、anchor/切源规则（§8）、**字段→official product 映射（§7.4）**、null 策略、阈值表（§9.3）成文。
5. **Validation 层（v8.5：按来源分离的两份 contract，不再硬拼）**：

```text
通用（两份 contract 共有）
  · Zod schema（§12）+ 区间校验（温度 −70..60 °C、月降水 0..2000 mm、
    monthIndex 0..11、period 枚举）；越界拒收，禁止 clamp
  · fieldProvenance 15 键完整性断言
  · 逐月映射一致性（12 个月字段→product 映射完全相同）
  · 跨 family 拼字段拒绝断言（No field-level source-family mixing）
  · hierarchy 命名断言（family 层不得出现 product 名）

Copernicus contract（不得含任何 NASA-specific 请求参数条件）
  1) retrieval          取数成功
  2) schema             结构校验
  3) range              区间校验
  4) parameter semantics  canonical 语义断言：tempHighC/tempLowC 必须来自
                        日值层产品；Monthly Means 月极值字段拒收
  5) required completeness  必有四字段齐全

NASA fallback contract
  1) retrieval          取数成功（145/145 基准）
  2) schema             结构校验
  3) range              区间校验
  4) parameter semantics  temporal-level aware 断言（§7.2.1 C）：
                        · Climatology-level T2M_MAX/T2M_MIN/T2M_MAX_AVG/
                          T2M_MIN_AVG → 用于 tempHighC/tempLowC 拒收
                        · Daily-level T2M_MAX/T2M_MIN 允许，但必须已月聚合
                        · precipMm 必须 PRECTOTCORR_SUM；PRECTOTCORR 拒收
  5) required completeness  必有四字段齐全
  6) source-specific temporal semantics where applicable：
                        · 请求显式 time-standard=UTC
                        · 响应 header time_standard == "UTC"
                        · 二者不符 → 拒收

语义断言清单（Pilot 已实现并可运行，见 pilot/best-time/scripts/assertions_v85.py）
  · Climatology T2M_MAX_AVG cannot map to tempHighC
  · Climatology T2M_MIN_AVG cannot map to tempLowC
  · Daily T2M_MAX may map to tempHighC
  · Daily T2M_MIN may map to tempLowC
  · Daily temperature path requires UTC
  · No cross-family field mixing
  · Any unresolved field must be null
  · No template-generated climate data
```
6. **旧数据 Migration 计划（不执行）**：`bestMonths` → "Historical editorial claim set"（禁止自动迁移）；`weatherScore` → Best-time 路径移除（P-6）；`climate-pattern.ts` latitude 逻辑 → 迁移完成后退役；冻结 UI 中必须重写的数据消费层见 §22。
7. **质量 Gate（生产准入 = T3）**：来源可追溯（fieldProvenance 完整 + hierarchy 正确）/ 许可可确认 / T2 coverage 实测 145/145 / 月度 12/12 完整 / schema valid / 数值合理 / recommendation 可解释且 **R1–R7 exhaustiveness 断言通过** / 无内部矛盾 / 有 methodology / 有 attribution / 可复现（methodologyVersion + ruleVersion + dailyBoundary 固定）—— 任一失败 = BLOCKED。

## 21. 12 Implementation-Blocking Questions — Answered

| # | 问题 | 答案 | 依据 |
| --- | --- | --- | --- |
| Q1 | 为什么 Avg High / Avg Low 不直接来自 Monthly Means？ | Monthly Means 的 min/max 字段是**月内极值**（monthly max of daily max / min of daily min），而 UI 需要的是**平均日高/低**（mean of daily max/min）。二者统计语义不同，直接误用会把极端值冒充平均值。Avg High/Low 必须经日值层（ERA5 Derived Daily Statistics）聚合 | §7 |
| Q2 | "一天"如何划分？这是谁的决定？ | **dailyAggregationBoundary = UTC day (UTC+00:00)，是 UTRIPLA methodology 的明确选择**——为全球 145 × 30 年可复现、DST 免疫、跨年一致。**Copernicus supports configurable UTC offsets（research-confirmed）；UTRIPLA methodology fixes UTC+00:00**——official capability 与 product methodology 是两个事实，不得把 UTC+00:00 写成 "ERA5 官方强制口径"。事实基础：ERA5 小时源数据以 UTC 为时间参照。timezone 仅展示，runtime 不能改变统计口径 | §6.1 |
| Q3 | 为什么可以同时使用 Monthly Means + Daily Statistics？ | 二者同属 **Copernicus ERA5 Reanalysis Family** 的 official products。字段级映射（tempMeanC/precipMm→Monthly Means；tempHighC/tempLowC→Derived Daily Statistics）由 methodologyVersion 固定，逐字段 provenance 记录在 fieldProvenance | §7.4 §12.2 |
| Q4 | 为什么这仍然属于一个 source family？ | family = Copernicus ERA5 Reanalysis Family（provider = Copernicus/ECMWF）；ERA5 与 ERA5-Land 都是 **product 层**名称。one destination = one family 的锁定在 product 切换（ERA5↔ERA5-Land，same-family selection）时不被破坏 | §7.4 §8.3 |
| Q5 | NASA POWER 何时触发？四个 canonical 字段分别怎么映射？时间标准怎么定？ | 仅当 Copernicus family 未通过 **自身的 acceptance contract**（五项：取数/schema/区间/**参数语义**/完整性）时，作为 **cross-family fallback = source-family switch**：整条 ClimateRecord 切换至 NASA POWER / MERRA-2 family，禁止与 ERA5 字段拼接；再失败 → null/降级展示。**v8.5 四字段 mapping（pilot-verified）：tempMeanC→Climatology `T2M`；tempHighC→Daily `T2M_MAX`（UTC，日历月均，1991–2020）；tempLowC→Daily `T2M_MIN`（UTC，同上）；precipMm→Climatology `PRECTOTCORR_SUM`（accumulated 月合计）**。**禁止：Climatology `T2M_MAX_AVG`/`T2M_MIN_AVG`（30 年平均的月内极值，509/1740=29.3% 分类差异）、Climatology 层 `T2M_MAX`/`T2M_MIN`、average 口径 `PRECTOTCORR`**。**时间标准（v8.5 实测）：Climatology 默认请求返回 `LST`，显式 `time-standard=UTC` 返回 `UTC`；Daily/Monthly 显式 UTC 亦返回 `UTC`；UTRIPLA 要求请求显式携带 `time-standard=UTC` 且响应 `time_standard == "UTC"`，这是 UTRIPLA 方法学选择而非 NASA 强制合规条款。source temporal standard ≠ dailyAggregationBoundary（UTC+00:00）≠ destination display timezone**；fallback 后执行 NASA fallback acceptance contract（五项 + source-specific temporal semantics，§20 第 5 项）；**同 family 内 Climatology + Daily 双 endpoint 不构成跨 family 混源** | §7.2.1 §8.2 §8.3 §23.6 |
| Q6 | destination 能否跨 source family 混源？ | **不能**。禁止 ERA5 tempMeanC + NASA tempHighC、ERA5 precipitation + Open-Meteo temperature 等任何跨 family 组合；跨 family 只能整条记录切换 | §8.3 |
| Q7 | R1–R7 是否 exhaustive？Best Months 覆盖全年全 Challenging 的情况吗？ | 是。七条规则按 first-match 求值后的 **effective domains 两两互斥且并集 = 合法输入全空间**（tempHighC × tempLowC × precipMm 三变量全纳入），gap = 0；overlap 仅设计性 first-match 重叠。Best Months 基线覆盖三分支：Favourable 集合 / Workable 兜底（precipMm 最低 + tie-break）/ 全 Challenging 时 `bestMonthsBaseline = []` + `recommendationStatus = "no-favourable-month"`（degraded 展示，不从 Challenging 伪造；`[]` 不是第四档；override 仍走 §10.2） | §9.4 §9.5 §10 |
| Q8 | 如何证明没有 29–31°C gap？ | §9.4 effective domains：`tempHighC < 32`（且未中 R1–R3）时降水 <90 走 R7（18 ≤ tempHighC < 32）、≥90 走 R5；因此 29/30/31.9°C 且 precipMm < 90 均落入 R7 = Favourable，32.0°C 起落入 R4。Boundary worked examples 逐点断言（§9.4 表） | §9.4 |
| Q9 | 数据在构建期还是运行时取？schema 是什么样？ | 全部构建期（acquisition→…→dataset generation 九项均为 build-time）；runtime 只允许 Static Dataset → Page Rendering，禁止 Browser → Climate API；正式 data contract 见 §12.1–§12.3 | §11 §12 |
| Q10 | 145/145 覆盖算不算已验证？ | 不算。145/145 目前只是 T1 theoretical；T2/T3 均 UNVERIFIED，须 Pilot 实测 | §5 |
| Q11 | 哪些结论是已核验的、哪些待实施验证、哪些要产品拍板？ | 三层清单：§19.1 / §19.2 / §19.3（P-1~P-9 均附建议默认值；daily boundary 已固定非待决） | §19 |
| Q12 | 实施团队还会在哪里遇到"需要猜"的地方？ | 目标是无。**v8.5 关闭 6 项**（Climatology `T2M_MAX_AVG`/`T2M_MIN_AVG` 可得性与语义、POWER 月度温度参数语义、`PRECTOTCORR_SUM` 单位标度、实际 endpoint spatial resolution、source-specific temporal semantics、Daily 高低温路径）；**v8.6 再关闭 2 项**（`precipDaysGe1mm` 派生字段政策 Option A；`daylightHours` 确定性天文实现），并把 elevation review 推进到 approved 143/145。**剩余开放点（8 项）全部为外部凭据 / 外部权威来源 / 法律确认 / 产品决策**：`sunshineHours` 产品归属；anchor elevation 2 项锚点决策；CDS 凭据与 ERA5 PRIMARY 实测；Open-Meteo 价格；NASA POWER 正式 licence 条文；database rights；T2/T3 production coverage；P-1~P-9（§23.4） | §19 §23.4 |

## 22. 冻结 UI 的处置（只记录，不动代码）

- **可保留**：页面骨架/Decision First 结构、复用层组件、`SeasonAtmosphere`、`MonthSelector` 交互与 a11y、`ClimateTable` 语义表格模式、`VerdictTag`、验收方法学。
- **未来必须重写（数据消费层）**：`besttime-state.ts`（→ climate dataset + §9.4 规则）、`ClimateHero/DecisionSignals` 的 weatherScore 读数、`RecommendationModule`（→ R1–R7 依据句 + provenance）、`ClimateTable`（→ dataset 数值 + null 隐藏策略 P-7）、FAQ/JSON-LD 气候表述、`climate-pattern.ts`（退役）。

## 23. Final Closure Report（v8.5 · NASA CANONICAL SEMANTICS CORRECTION + PHASE-1 PILOT EVIDENCE）

### 23.0 v8.5 Correction Evidence（Pilot 真值，不得重新解释）

```text
Pilot Version:
  pilot-2026.09.11.v1

数据源与覆盖率（真实取数，响应已归档）
  destinations                     = 145
  NASA Climatology (time-standard=UTC)  = 145/145 HTTP 200
  NASA Daily (T2M_MAX/T2M_MIN, UTC)     = 145/145 HTTP 200（10958 天/点，缺测 0）
  NASA Monthly (T2M/PRECTOTCORR_SUM, UTC) = 145/145 HTTP 200（本轮新增，用于独立核验）
  months                           = 1740  （145 × 12）

参数语义结论
  T2M              : correct  —— 与 canonical tempMeanC 语义一致
                     n=1740, mean Δ=0.000011, median Δ=0.000000, max |Δ|=0.005
                     （对照：独立 Monthly endpoint 月度值的 1991–2020 平均）
  PRECTOTCORR_SUM  : correct  —— accumulated monthly total = canonical precipMm
                     n=1740, ratio(PRECTOTCORR_SUM / (PRECTOTCORR × 月均天数))
                       median = 0.999954；月合计 ≥20 mm 的 1565 条
                       ratio ∈ [0.9928, 1.0070]；最大绝对残差 0.904 mm
                     vs Monthly endpoint：mean Δ=0.000072，max |Δ|=0.005
  T2M_MAX_AVG      : WRONG canonical semantics
                     = 30-year average of monthly EXTREME maximum
                     （1734/1740 与「年极值→30 年均值」口径一致，残差 ≤0.01）
  T2M_MIN_AVG      : WRONG canonical semantics
                     = 30-year average of monthly EXTREME minimum
                     （1729/1740 一致，残差 ≤0.01）

分类影响（错误映射 vs canonical 映射）
  509 / 1740 = 29.3% 的 destination × month 分类结果不同

canonical high/low 数学验证（vs v8.4 pilot 产物）
  tempHighC : semantic_match_high = 1679/1740；max_delta_high = 0.02
              （61 条差异全部集中在 2 月，源于 v8.4 采用 pooled 聚合
                而非 canonical 的 mean-of-yearly-means；pooled 口径下
                max delta = 0.00，即 v8.4 产物本身计算无误，仅聚合顺序
                与 §6 canonical 定义不符）
  tempLowC  : semantic_match_low  = 1690/1740；max_delta_low  = 0.02
              （50 条差异，同样全部为 2 月）

ERA5-family cross-check（Open-Meteo · 仅作交叉检查，NOT production source）
  覆盖 = 30/145 destinations，360 destination-months
  v8.5 复算（canonical mean-of-yearly-means）：
      mean Δhigh = −0.1807 °C     mean |Δhigh| = 0.8166
      mean Δlow  = −0.0398 °C     mean |Δlow|  = 1.2278
      mean Δmean = −0.2286 °C
      mean Δprecip = +2.3995 mm   mean |Δprecip| = 16.1926 mm
  ⚠ 与 v8.4 记录值的差异（如实登记，不静默改写）：
      v8.4 README 记录 mean Δhigh = −0.23 °C、Δlow = +0.01 °C（28 destinations）
      —— 该数值无法从当前归档的 30 个 raw 文件复现（复算为 −0.181 / −0.040，
         pooled 口径亦为 −0.181 / −0.040）。差异来源 = v8.4 记录时的样本集
         与现存文件不一致。v8.5 以「可复现的当前实测值」为准，并保留旧记录
         备查。

分区系统偏差（Open-Meteo cross-check，30 destinations）
  northern (lat > 23.5)  n=240  mean Δhigh −0.1633 / Δlow −0.2103 / Δprecip +0.68
  tropical (|lat| ≤ 23.5) n=108  mean Δhigh −0.2253 / Δlow +0.1555 / Δprecip +4.62
                                 mean |Δprecip| = 31.61 mm  ← 热带降水系统性偏差显著
  southern (lat < −23.5)  n=12   mean Δhigh −0.1266 / Δlow +1.6117 / Δprecip +16.83
                                 （仅 1 个目的地，样本不足，不得据此下结论）

R1–R7（canonical 值，1740 个月）
  R1=5  R2=16  R3=157  R4=92  R5=484  R6=460  R7=526
  classified = 1740；unclassified = 0；multiple final rules = 0

Best Months 三分支
  branch1（Favourable 存在）      = 117
  branch2（Workable 兜底）        = 28
  branch3（[] + no-favourable）   = 0

elevation
  existing authoritative elevation source found = 0
  coverage = 0/145
  ELEV_MISMATCH_M = NOT EVALUABLE

断言（pilot/best-time/scripts/assertions_v85.py，v8.5 dataset）
  assertions = 30/30 PASS（两轮确定性重跑结果逐字节一致）

Open-Meteo 地位重申
  ERA5-family cross-check
  NOT production source
```

### 23.0.1 Changed Sections（v8.4 → v8.5）

```text
版本头   — v8.5 目标块（H1–H12）+ 三处事实反转声明；§6 / §7.1 / §7.2 / §7.2.1 /
          §8.2 / §8.3 / §12.2 / §12.3 / §15 / §19.1 / §19.2 / §20 / §21 / §23 同步
§3.6     — NASA POWER official products 改为 Climatology + Daily 双 endpoint；
          spatial resolution 改为 tested source-native ≈0.5°×0.625°；
          新增 canonical 温度路径与「禁止 Climatology 极值映射」声明
§4       — NASA "UI three temperature fields direct" 单元格重写为
          Daily T2M_MAX/T2M_MIN 路径 + 明确禁止 T2M_MAX_AVG/T2M_MIN_AVG
§6       — 新增「v8.5 canonical 定义（唯一合法表述）」块 + 聚合顺序约定
          （mean-of-yearly-means，禁止 pooled）+ 绝对禁止清单
§7.2     — row E 映射改为 Daily T2M_MAX / Daily T2M_MIN / Climatology PRECTOTCORR_SUM
§7.2.1   — 全节重写为 A–G 七段：参数语义 / canonical mapping / temporal-level 判定 /
          fallback pipeline / temporal 实测 / spatial resolution / Data Processing 链
§7.3     — 新增三条禁止项（Climatology 极值、Climatology 层 T2M_MAX/T2M_MIN、
          Daily 日值直当月值）
§8.2     — Step 6 Copernicus contract 明确五项且不含 NASA 参数；
          Step 7 c) 改为 NASA fallback acceptance contract（五项 + source-specific
          temporal semantics，按实测基准）
§8.3     — fallback 语义补「No field-level source-family mixing」与
          「同 family 多 temporal endpoint 合法」说明
§12.2    — fieldProvenance 契约扩为 15 键（新增 endpoint / parameter /
          temporalLevel / periodStart / periodEnd / grid / selectionReason /
          ruleVersion / methodologyVersion；timeStandard 增加 "LST" 取值）；
          NASA 示例全部改为 canonical 路径；Semantic-invariant 改为 temporal-level aware
§12.3    — precipDaysGe1mm / sunshineHours / daylightHours 状态重写；
          monthIndex 契约违背缺陷登记（v8.4 产物用 1–12）
§15      — 新增「v8.5 licence 状态说明」块（NASA 维持 UNVERIFIED，附新旁证；
          Copernicus 官方名维持；database rights 维持 UNRESOLVED）
§19.1    — NASA POWER 条目重写为 research-confirmed / pilot-verified / UNVERIFIED 三段
§19.2    — Pilot 核对清单改为带状态（6 项 CLOSED、1 项 UNRESOLVED）；
          新增 ERA5 PRIMARY 前置与 anchor elevation 前置
§20      — 第 5 项 Validation 层改为两份分离 contract + 语义断言清单
§21      — Q5 / Q12 同步 v8.5 结论与开放点计数（8 → 10）
§23      — 新增 §23.0 证据节与 §23.0.1 本节；§23.2 新增 B13–B18；
          §23.3 更新；§23.4 改为 10 项；§23.5 重写；最终判定行更新

── v8.5 Phase 1B 追加修正（同一 methodologyVersion，不递增版本）──
§3.3/§7.2 row B — 修正 ERA5 / ERA5-Land monthly averaged `total_precipitation`
          的单位语义：官方单位为 "m of water per day"，须 × 当月天数
          才是月合计（原写作"月合计"，会导致约 30 倍低估）
§19.2     — 新增「Copernicus 降水单位换算」实施前提项（含官方换算公式）

── v8.6（Phase 1C Internal Closure；方法学定义变更 → methodologyVersion 递增）──
§6        — precipDaysGe1mm 改为授权派生字段（Option A 四条件政策）；
            daylightHours 采纳 NOAA 确定性天文实现（formulaVersion
            noaa-solar-position-2026.09.v1；月度聚合 = 年均月均 → 30 年等权）；
            sunshineHours 维持 null
§7.1      — Rain days / Daylight 两行同步 v8.6 定义
§7.2      — ERA5 canonical mapping 块：precipDaysGe1mm = APPROVED-DERIVED
            （daily_sum 路径）；daylightHours = ASTRONOMICAL-CALCULATION
§12.3     — precipDaysGe1mm / daylightHours 转必有；null 政策收窄至
            sunshineHours 单字段
§23.4     — 第 2 项（precipDays）与第 4 项（daylight）关闭；第 5 项（elevation）
            更新为 candidate 145/145、approved 143/145、2 项待锚点决策
§23.5/§23.6 — Gate 重算：STRATEGY v8.6 INTERNAL METHODOLOGY = PASS；
            T2/T3 维持 BLOCKED
Pilot（Phase 1C 新增 artifacts，均 PILOT ONLY）:
  raw/nasa/daily_precip_145/              NASA Daily PRECTOTCORR 145/145（UTC）
  normalized/nasa_canonical_145_v86.json  v8.6 canonical dry-run（回归 0 差异）
  reports/nasa_v86_validation.json        v8.6 验证 + v8.5 回归
  reports/assertions_v86.json             23/23 PASS
  reports/schema-audit-v86.json           missing/ambiguous/contradictory = 0
  reports/daylight_calc.json              daylightHours 计算 + 抽查 + 确定性
  reports/copernicus-unit-audit.json      19/19 PASS（月长 unit test 等）
  reports/elevation-review-v1c.json       10 条逐项分类 + 第二来源
  scripts/daylight.py                     NOAA 天文实现（含极昼/极夜）
  scripts/nasa_daily_precip_fetch.py      Daily PRECTOTCORR 抓取
  scripts/build_v86.py                    v8.6 dataset 构建器
  scripts/assertions_v86.py               23 条机器断言
  scripts/copernicus_unit_audit.py        Copernicus 独立数学审计
  scripts/elevation_review_v1c.py         elevation review 生成器
关键回归结果：v8.6 vs v8.5 气候真值（tempMeanC/tempHighC/tempLowC/precipMm/
ruleId/tier/rawRuleHits/bestMonthsBaseline）逐字节一致，0 差异；R1–R7 计数
不变（5/16/157/92/484/460/526）；Best Months 分支不变（117/28/0）

── v8.7（Phase 2；正式 acceptance contract change + 锚点修正 A/B，用户已决策）──
§19.2     — elevation 前置重写为 v8.7 Elevation Source Acceptance Contract
            （Tier 1/2/3/4 + 验证矩阵 + 冲突阈值 + PRODUCTION_APPROVED 条件；
            移除 "authoritative mandatory" 表述——active contract 层 0 残留）
§20/§23.4/§23.5/§23.6 — elevation gate 引用 v8.7 契约；历史 changelog 保留
Pilot（Phase 2 artifacts，均 PILOT ONLY）:
  reports/v86-final-baseline.json             v8.6 冻结基线（四哈希）
  reports/elevation-corroboration-v87.json    OSM Overpass 佐证战役（145 条逐记录）
  reports/elevation-v87-final-ledger.json     终版 ledger：145/145 production-approved
  reports/icao-correction-v87.json            7 条 ICAO-only 修正（identity 层）
  reports/hcmc-approved-anchor-v87.json       Decision A 应用记录（APPROVED_FOR_PILOT_REBUILD）
  reports/siem-reap-approved-anchor-v87.json  Decision B 应用记录（APPROVED_FOR_PILOT_REBUILD）
  normalized/nasa_canonical_145_anchor-corrected-v87.json  v8.7 canonical 数据集
  reports/v87-vs-v86-diff.json                全量 diff（0 条无法解释变化）
  reports/elev-mismatch-v87.json              ELEV_MISMATCH_M 首次可评估（114/31）
关键结果：佐证战役 145/145 通过（17 Tier-1 + 123 verified + 5 verified+FLAG）；
siem-reap 重烘焙后 R1–R7 = 5/16/158/91/483/460/527（增量精确：R3+1 R4−1 R5−1 R7+1）；
Best Months 分支 117/28/0；siem-reap Best Months [10]→[10,11]；
除 siem-reap（59 cells）外 0 个气候单元格变化、0 条无法解释变化
§23.2     — 新增 B19（CLOSED）
说明      — 该修正仅涉及 Copernicus PRIMARY 路径的 provider-side 单位语义，
          不改变 §6 canonical 定义，也不改变 v8.5 Pilot dataset 任何数值
          （dataset 走 NASA fallback，PRECTOTCORR_SUM 本身即 accumulated
          月合计），因此不触发 methodologyVersion 递增与全量重烘焙
```

### 23.1 Changed Sections（v8.3 → v8.4）

```text
版本头 — 新增 v8.4 纠错目标块（G1–G4）；v8.3 目标块标注"其中 E1/E2/E3 的
         时间标准部分已被 v8.4 判定为错误并撤销"
§7.2.1 — 删除错误的 Time standard requirement（Climatology 默认 lst /
         Climatology request MUST time-standard=utc / 省略即 non-compliant
         / lst → acceptance FAIL）；重写为 NASA POWER temporal-standard
         semantics 六条：Hourly/Daily 支持 UTC 与 LST 且默认 LST；
         Monthly/Annual/Climatology 依官方 FAQ 提供 UTC；不得虚构
         Climatology 请求参数；dailyAggregationBoundary 仅适用于日派生
         统计字段；source temporal standard != destination display timezone
§8.2   — 结构性修复：Copernicus acceptance = 五项，且不得包含 NASA-specific
         request parameter 条件；Step 7 改为 IF Copernicus fails ITS OWN
         acceptance contract；Step 7 c) 改为 NASA-specific acceptance
         contract（五项 + source-specific NASA temporal-standard
         validation，依实际 temporal product 执行；失败 → no fabricated
         values → degraded display）；"六项 acceptance" 表述全文撤销
§8.3   — fallback 校验条款同步为 NASA-specific acceptance contract
§12.2  — timeStandard 契约语义重定义为"source temporal standard actually
         used by the source product/path"；八个 provenance 示例同步；
         Semantic-invariant 改为 source-specific 一致性断言
§19.1  — 删除 "Climatology API time-standard 参数 = lst|utc、默认 lst"；
         改为官方 temporal-level 语义三点
§19.2  — ⑦ 改为 source-specific temporal-standard semantics verification
         （Hourly/Daily path 验证 time-standard=UTC；Climatology 等按官方
         temporal-level semantics，不虚构参数）
§20    — Validation 层改为 source-specific temporal-standard validation
§21    — Q5 改为：mapping + 官方 temporal 语义 + 无虚构参数要求 +
          fallback 走 NASA-specific acceptance contract
§23    — 本节；B10 标注 REVERTED（v8.3 时间标准部分），新增 B12；
         23.4 仍为 8 independent items
```

### 23.1.1 Changed Sections（v8.2 → v8.3，历史记录）

```text
§4     — Redistribution 行 NASA cell：Yes → **UNVERIFIED / LEGAL REVIEW
         REQUIRED (v8.3)**（technical access/download ≠ legal commercial
         redistribution；licensing matrix 内部矛盾清除）
§7.2.1 — 新增 Time standard requirement（v8.3 · 确定性 implementation
         requirement）：daily-derived 参数请求 MUST time-standard=utc；
         NASA 默认 lst，省略即 non-compliant；time-standard != display
         timezone；月均/月合计产品无 time-standard 语义依赖（请求仍统一
         携带 utc）
§8.2   — Step 6 acceptance 五项扩为六项（新增 time-standard /
         daily-boundary validation）；Step 7 IF 条件与 fallback 重校验
         同步（六项）
§8.3   — fallback 记录校验条款同步为六项
§12.2  — fieldProvenance 契约新增 timeStandard: "UTC" | "not-applicable"
         （tempHighC/tempLowC = UTC；tempMeanC/precipMm = not-applicable；
         NASA 由请求参数保证，Copernicus 由 UTC 时间参照处理口径）；
         八个 provenance 示例全部补 timeStandard 行；Semantic-invariant
         扩展（UTC boundary 的 NASA daily-derived 字段 timeStandard
         必须 = UTC；两概念共同出现、互不替代）
§19.1  — NASA POWER research-confirmed 项加入 time-standard 参数事实
         （lst | utc，默认 lst）
§19.2  — NASA POWER Pilot 核对清单扩展为 ①–⑦（新增 ⑦：time-standard=utc
         执行核验——methodology 要求，非 unverified 开放点）
§20    — Validation 层增加 time-standard 断言
§21    — Q5 改为四字段 mapping + 六项 acceptance + time-standard=utc +
         dailyAggregationBoundary=UTC+00:00 完整答案
§23    — 本节；23.4 保持 8 independent items（time-standard=utc 属
         methodology requirement，不新增 unverified 项）
```

### 23.1.2 Changed Sections（v8.1 → v8.2，历史记录）

```text
§3.6   — MERRA-2 降水参数身份注明（PRECTOTCORR = average 口径；
         PRECTOTCORR_SUM = accumulated 月合计；细节指向 §7.2.1）
§4     — "UI three temperature fields direct" 行更新：precip monthly total
         = PRECTOTCORR_SUM（v8.2 research-confirmed）
§7.2   — row E：precipMm 映射改为 `PRECTOTCORR_SUM`（exact parameter
         v8.2 research-confirmed）
§7.2.1 — PRECTOTCORR 语义改判（average 口径 mm/day，禁止充当月合计）；
         PRECTOTCORR_SUM = accumulated 月合计；mapping 改为
         precipMm → PRECTOTCORR_SUM；新增官方参数注册表逐字证据块
         （v8.2 research-confirmed）+ 单位标度 Pilot 核对注记
§8.2   — Step 6 acceptance 扩展为五项校验（retrieval / schema / range /
         parameter semantic / completeness）；Step 7 IF 条件与 fallback
         重校验条款同步（fallback 记录重新执行五项校验）
§8.3   — cross-family fallback 补"fallback 记录必须通过五项 acceptance
         校验（含 parameter/field semantic validation）"
§12.2  — NASA fallback fieldProvenance 示例：precipMm officialProduct 改为
         Climatology API · PRECTOTCORR_SUM；Semantic-invariant 扩展
         （monthly total precipitation ↔ 必须为 PRECTOTCORR_SUM）
§19.1  — NASA POWER research-confirmed 项加入参数注册表证据
§19.2  — NASA POWER Pilot 核对清单扩展为 ①–⑥（新增 ⑤：precipMm exact
         parameter 身份已确认 + 单位标度实测；原 ⑤ 顺延为 ⑥）
§21    — Q5 改为四字段完整 mapping + 五项 acceptance；Q12 开放点清单
         同步（8 项；precipMm exact parameter 不再是开放点）
§23    — 本节；23.4 重编号为连续 1–8
```

### 23.1.3 Changed Sections（v7 → v8.1，历史记录）

```text
§7.2   — row E mapping 修正：tempHighC → T2M_MAX_AVG、tempLowC → T2M_MIN_AVG
         （endpoint 可得性 UNVERIFIED）；tempMeanC → T2M、precipMm → PRECTOTCORR
§7.2.1 — 新增：NASA POWER 参数语义正式规范（T2M_MAX/MIN = 瞬时极值口径；
         T2M_MAX_AVG/MIN_AVG = 日值平均口径）+ canonical fallback mapping +
         可得性 UNVERIFIED 与 unavailable→degraded 处理 + spatial resolution
         endpoint/product-specific 限定
§4     — 矩阵 "UI three temperature fields direct" 行修正（同 §7.2 口径）
§3.6   — spatial resolution 改 endpoint/product-specific（0.5° 泛化废除）
§12.2  — grid.resolution 注释修正 + fieldProvenance 新增 NASA fallback
         条件式示例（tempMeanC/tempHighC/tempLowC/precipMm）+
         Semantic-invariant（aggregationMethod 与 parameter 口径不得矛盾）
§19.1  — NASA POWER research-confirmed 项重写（参数语义入列；
         spatial resolution 改 endpoint-specific；licensing 保持 UNVERIFIED）
§19.2  — NASA POWER Pilot 核对清单扩展（①–⑤，含 T2M_MAX_AVG/MIN_AVG
         endpoint 可得性与 spatial-resolution wording）
§21    — Q5 增温度字段 mapping 与 degraded 处理；Q12 增 endpoint 可得性
         与 spatial resolution 开放点、NASA licence 开放点
§23    — 本节
```

### 23.1.4 Changed Sections（v6 → v7，历史记录）

```text
§3.3/§12.1/§15 — F1：Copernicus licence 官方正式名称统一为
         "Licence to use Copernicus Products (rev. 12)"；
         "Copernicus Licence rev. 12" 降级为 Internal short name；
         §15 保留七条实际条件明细（rev. 12 为官方 rev 号）
§3.6/§4/§15/§19.1/§20 — F2：NASA POWER commercial/redistribution licensing
         降级为 UNVERIFIED / LEGAL REVIEW REQUIRED（站点自述不足以作为
         正式 licence 条文结论）；技术能力事实（四级粒度/自定义窗口/0.5°/
         MERRA-2 来源）与引用要求（Cite NASA POWER, Stackhouse et al.）保留；
         §20 许可落位增加 POWER licence 确认为硬前置（若 fallback 上线）
§8.2   — F3：Step 5 改为 Provisional Selection（仅记录 candidate 五元组，
         不得声称 final lock）；Step 6 = complete retrieval + validation；
         Step 7 fallback 时 discard provisional Copernicus selection for
         final provenance + fallback 全字段重取 + fallback record 重新校验；
         Step 9 = ONLY after successful acceptance → persist FINAL lock
         （五元组 + fieldProvenance/selectionReason 均指 final accepted
         source）；显式声明 "Provisional selection != final source lock" 与
         "Final lock occurs only after source acceptance"；
         §8.3/§11/§12.2 相关注释同步（grid/selection 指向 final lock）
§6/§7.4/§12.2/§12.3/§19.2 — F4：precipDaysGe1mm = nullable optional field
         + 正式 unresolved provenance status（officialProduct: string | null，
         null 仅允许用于未核实 optional field，当前唯一实例 precipDaysGe1mm；
         必有四字段 officialProduct 不得为 null；禁止伪造 product）；
         UI 隐藏；不阻塞主数据接受；Pilot 核实后 methodologyVersion 递增 +
         全量重烘焙
§9.4/§9.5 — F5：Best Months 基线三分支（Favourable / Workable 兜底 /
         空集 [] + recommendationStatus = "no-favourable-month"）；
         不从 Challenging 伪造最佳月份；[] 不是第四档；degraded 展示机制；
         override 仍走 §10.2 且覆盖 [] 分支；§9.5 流程图扩展至三分支 +
         Page Display 状态分支
§9.2   — F6：Workable/Challenging 表述改为与 first-match 一致
         （"最终由首个命中规则决定，其余命中留档 QA provenance"）
§21    — Q5 增 "discard provisional selection" 语义；Q7 增三分支与
         no-favourable-month 状态说明
§23    — 本节：v7 final consistency repair
```

### 23.2 Blocker Closure

```text
B1 — CLOSED  Copernicus licence official name：
             规范层 licence 字段与所有"正式名称"表述统一为
             "Licence to use Copernicus Products (rev. 12)"；
             "Copernicus Licence rev. 12" 仅以 Internal short name 出现；
             CC BY 4.0 / 类 CC-BY 仍禁止作为该 licence 名称；
             Open-Meteo CC BY 4.0 表述不受影响。
B2 — CLOSED  NASA POWER licensing evidence status：
             commercial/redistribution = UNVERIFIED / LEGAL REVIEW REQUIRED
             （§3.6/§4/§15/§19.1/§20/§23.4 同步）；技术能力与引用要求保留；
             无任何"已完成法律确认"的表述。
B3 — CLOSED  Source lock 时序：
             Step 5 = provisional；final lock 仅在 Step 9 acceptance 后；
             fallback 后 final family/grid/provenance 全部指向 fallback；
             时序不变式写入 §8.2 算法约束 2 并同步 §11/§12.2。
B4 — CLOSED  precipDaysGe1mm provenance：
             nullable optional + unresolved status contract 贯穿
             §6/§7.4/§12.2/§12.3/§19.2；"映射 fixed" 与"尚未核实"的矛盾
             已消除（fixed 的是映射规则本身；该字段的 officialProduct
             正式处于 null/unresolved 直至核实，核实 = methodologyVersion
             递增 + 重烘焙）。
B5 — CLOSED  Best Months 第三分支：
             三分支确定性规则 + recommendationStatus + degraded 展示 +
             override 不绕行（§9.4/§9.5/§21 Q7 同步）。
B6 — CLOSED  §9.2 表述：Workable/Challenging 定义与 first-match 一致，
             无"单项"歧义。

B7 — CLOSED（v8.2）  NASA precipitation exact mapping：
             PRECTOTCORR_SUM（accumulated）= research-confirmed exact
             parameter（官方参数注册表逐字证据，§7.2.1）；
             average 口径 PRECTOTCORR（mm/day）禁止充当月合计，
             semantic-invariant 扩展至降水（§12.2）。
B8 — CLOSED（v8.2）  Fallback parameter semantic validation：
             §8.2 acceptance 扩展为五项（retrieval / schema / range /
             parameter semantic / completeness）；Step 7 fallback 重校验
             与 §8.3、§21 Q5 同步。
B9 — CLOSED（v8.2）  §23.4 count/numbering：连续编号 1–8 + 顶部显式声明
             8 independent remaining-unverified items（不再使用 2a/2b）。

B10 — REVERTED / SUPERSEDED（v8.3）NASA Climatology time-standard contract：
             v8.3 错误地把 Daily API 的 time-standard 规则迁移到 Climatology
             API 并声称 Climatology 默认 LST——该 contract 已于 v8.4 全文撤销
             （§7.2.1/§8.2/§8.3/§12.2/§19.1/§19.2/§20/§21 同步改写）；
             由 B12 取代。§4 redistribution 修复（B11）不受影响，保持 CLOSED。
             ⚠ v8.5 精确化：v8.3 的**合规主张**（MUST / 省略即 non-compliant）
             仍然错误并维持撤销；但「Climatology 默认 LST」这一**事实陈述**
             已由 v8.5 Pilot 实测证实（默认请求返回 time_standard="LST"），
             v8.4 一并撤销它属于过头（见 G1 的 v8.5 补注）。
B12 — CLOSED（v8.4） NASA POWER temporal semantics correction：
             Hourly/Daily 支持 UTC 与 LST 且默认 LST；Monthly/Annual/
             Climatology 依官方 FAQ 提供 UTC（§7.2.1/§19.1）；
             Copernicus acceptance 不再含 NASA-specific 参数条件；
             NASA-specific acceptance contract 含 source-specific
             temporal-standard validation（§8.2/§8.3）；timeStandard
             provenance 反映实际 source path（§12.2）；
             §19.2 ⑦ / §20 / §21 Q5 同步。
B11 — CLOSED（v8.3） §4 licensing matrix contradiction：
             NASA Redistribution = Yes → UNVERIFIED / LEGAL REVIEW
             REQUIRED；"技术可下载"与"法律允许商业再分发"显式分离；
             规范层 NASA redistribution = Yes 组合 0 残留。

B12 — PARTIALLY SUPERSEDED（v8.4 → v8.5）
             v8.4 的 temporal 结论中「不得虚构 Climatology 请求参数」
             仍成立；但「Monthly/Annual/Climatology 依官方 FAQ 提供 UTC」
             已被 Pilot 实测推翻（Climatology 默认返回 LST），
             由 B14 取代。

B13 — CLOSED（v8.5） NASA canonical temperature mapping：
             Climatology T2M_MAX_AVG / T2M_MIN_AVG 被证明是
             30-year average of monthly EXTREME（1734/1740、1729/1740 一致），
             不得映射 tempHighC / tempLowC；
             canonical 路径改为 Daily T2M_MAX / T2M_MIN（UTC，
             日历月均，1991–2020）；分类影响 509/1740 = 29.3% 已量化。
B14 — CLOSED（v8.5） NASA temporal-standard 实测：
             Climatology 默认 → LST（4/4）；time-standard=UTC → UTC
             （4/4 + 145/145）；Daily / Monthly 显式 UTC → UTC（145/145）；
             LST vs UTC 实测差异最大 0.14 °C / 3.14 mm；
             "Climatology default = UTC" 与 "time-standard 参数不受支持"
             两种表述均从规范层清除。
B15 — CLOSED（v8.5） temporal-level 判定规则：
             禁止按参数名一刀切，改为按 temporalLevel 判定；
             Climatology 层 T2M_MAX/T2M_MIN 禁止、Daily 层允许且须先月聚合。
B16 — CLOSED（v8.5） NASA source-native spatial resolution：
             统一为 tested ≈0.5° lat × 0.625° lon
             （官方标题 NASA/POWER Source Native Resolution）；
             0.5°×0.5° 表述清除；regional vs source-native 不得混用。
B17 — CLOSED（v8.5） 降水参数与单位标度：
             PRECTOTCORR_SUM（accumulated）在 145×12 上验证通过
             （ratio median 0.999954；≥20 mm 子集 ratio ∈ [0.9928, 1.0070]；
             vs Monthly endpoint max |Δ| = 0.005）；
             PRECTOTCORR（mm/day）禁止充当月合计，规范层 0 残留。
B18 — CLOSED（v8.5） validation contract 分离：
             Copernicus contract（五项，不含 NASA 参数条件）与
             NASA fallback contract（五项 + source-specific temporal
             semantics）分离落地；语义断言清单入库并可运行（30/30 PASS）。
B19 — CLOSED（v8.5 Phase 1B） Copernicus 降水单位语义缺陷：
             v8.5 曾写作 "ERA5 Monthly Means（月合计）"——实测官方文档
             表明 monthly averaged `total_precipitation` 的单位是
             "m of water per day"，必须 × 当月天数才是月合计；
             省略将造成约 30 倍低估。§3.3 / §7.2 行 B / §19.2 已修正，
             Copernicus 请求模板已更正。
             影响范围：仅 Copernicus PRIMARY 路径；v8.5 Pilot dataset
             （NASA fallback 路径）数值不受影响，无需重烘焙。
```

### 23.3 Artifact Integrity（实际校验结果）

```text
Empty required code blocks = 0                    （54 fence 成对闭合、逐块非空校验；v8.4 实测）
Required formal diagrams/contracts present = YES  （§7.4/§8.2/§8.2.1/§9.4/§9.5/
                                                   §10.2/§11/§12.1/§12.2/§12.3 实体存在）
Provisional vs final lock semantics = consistent  （Step 5 provisional；Step 9 final；
                                                   时序不变式两处显式声明）
Fallback provenance redirection = consistent      （Step 7 discard + Step 9 final 全指向
                                                   fallback family）
precipDaysGe1mm unresolved contract = consistent  （§6/§7.4/§12.2/§12.3/§19.2 同一口径；
                                                   officialProduct: string | null）
Best Months three-branch coverage = YES           （Favourable / Workable-fallback /
                                                   [] + no-favourable-month 三态均有
                                                   deterministic output）
R1–R7 effective-domain proof = present & intact   （H/L/P 记号 + 分支归并 + 三结论 +
                                                   18 组 boundary examples 未被改坏）
R1–R7 gap = 0；classification uniqueness = YES
Copernicus licence naming = consistent            （official = Licence to use Copernicus
                                                   Products (rev. 12)；short name 已定义）
NASA POWER licensing status = consistent          （UNVERIFIED / LEGAL REVIEW REQUIRED，
                                                   无 research-confirmed 残留）
NASA precipitation exact mapping = consistent     （v8.2：PRECTOTCORR_SUM 唯一合法；
                                                   规范层 "PRECTOTCORR 充当月合计" 0 残留；
                                                   semantic-invariant 双向覆盖温度+降水）
Fallback acceptance = five-condition closure      （§8.2 Step 6/7 + §8.3 + §21 Q5 同口径）
§23.4 item count = consistent                     （8 independent items，连续编号 1–8；
                                                   temporal-standard verification 属 source-specific
                                                   执行核验（§19.2 ⑦），未新增 unverified 项）
NASA temporal-standard semantics = CONSISTENT（v8.5 实测基准）
                                                   （Climatology 默认 → LST；显式 time-standard=UTC
                                                    → UTC，145/145；Daily/Monthly 显式 UTC → UTC；
                                                    规范层 "Climatology default = UTC" 与
                                                    "time-standard 不受支持" 残留 = 0）
NASA canonical temperature mapping = consistent    （规范层 canonical 位置出现
                                                    T2M_MAX_AVG / T2M_MIN_AVG 作为 tempHigh/tempLow
                                                    来源 = 0 残留；仅保留于「被证明不适用」的
                                                    证据/拒绝理由位置，见 §7.2.1 / §23.0）
temporal-level judgement = consistent              （Climatology 层禁、Daily 层允许的判定
                                                    在 §7.2.1 C / §7.3 / §8.2 / §12.2 同口径）
NASA source-native resolution = consistent         （≈0.5° lat × 0.625° lon 单一表述；
                                                    0.5°×0.5° 规范层残留 = 0）
Acceptance contract separation = consistent        （Copernicus 五项不含 NASA 参数条件；fallback
                                                   后执行 NASA fallback contract（五项 +
                                                   source-specific temporal semantics）；
                                                   "六项统一合同" 已撤销）
v8.5 dataset assertions = 30/30 PASS               （两轮确定性重跑逐字节一致；
                                                   monthIndex 0–11；unresolved 字段全 null；
                                                   no fake elevation；no forbidden token in
                                                   canonical mapping）
Licensing matrix consistency = YES                （NASA commercial = redistribution =
                                                   UNVERIFIED / LEGAL REVIEW REQUIRED；
                                                   NASA redistribution = Yes 组合 0 残留）
Broken tables = 0
Threshold identities unchanged = YES              （40/32/18/−10/30/90/200 product-defined
                                                   或 anchor；150m proposed trigger）
```

一致性审计方法：全文检索旧 licence 正式名残留、NASA licensing research-confirmed 残留、"final lock" 与 "provisional" 共现位置、precipDays null contract 前后表述、三分支关键词（no-favourable-month / bestMonthsBaseline）——规范层旧表述 0 命中；历史变更日志中的引述为 meta-reference。

### 23.4 Remaining Unverified（v8.6：10 项中第 2、4 项已关闭，其余 8 项维持）

> **v8.5 已关闭、从本清单移除的 6 项**：Climatology `T2M_MAX_AVG`/`T2M_MIN_AVG` 可得性与语义（结论反转：可得但语义错误）；POWER 月度温度参数语义；`PRECTOTCORR_SUM` 单位标度实测；实际 endpoint spatial resolution；source-specific temporal semantics；Daily 高低温 canonical 路径。

1. Open-Meteo Professional 具体价格（采购前核对官方 Pricing）。
2. **`precipDaysGe1mm` — v8.6 已关闭（Option A 定案）**：正式授权为派生字段（§6 四条件政策）。ERA5 侧 request 级输入已由官方目录确认（`derived-era5-single-levels-daily-statistics`：`total_precipitation` + `daily_sum`，官方说明 "daily sum is only available for the accumulated variables"，total precipitation 属累积变量；`time_zone` 参数确认存在）；NASA fallback 侧已实测：Daily `PRECTOTCORR` 145/145 HTTP 200、每点 10958 有效日、0 缺失。v8.6 数据集该字段 1740/1740 已填充。**残留前提**：ERA5 侧实际取数仍受 CDS credentials 阻塞（并入第 6 项）。
3. **`sunshineHours` 的 official product 归属 = UNRESOLVED**（v8.6 维持）：Copernicus ERA5 family **不存在** sunshine duration 官方参数（仅有辐射通量类参数；以 120 W/m² 阈值换算属文献中的派生估计，不是官方产品）。Open-Meteo 提供 `sunshine_duration`，但该通道仅为 cross-check 且商用需订阅 → **canonical value = null**。
4. **`daylightHours` — v8.6 已关闭（实现定案）**：正式采纳确定性天文实现（NOAA 公式 + z0=90.833° + 年均月聚合 + 闰年精确 + 极昼/极夜处理；formulaVersion `noaa-solar-position-2026.09.v1`）。实现于 `pilot/best-time/scripts/daylight.py`；数值重跑确定性验证通过；外部抽查一致（London 6/21 16.638 h ↔ 公开 16 h 38 m；Singapore 6/21 12.199 h ↔ 12 h 12 m）；v8.6 数据集 1740/1740 已填充。
5. **anchor elevation — v8.7 已关闭（production-approved 145/145）**：历史：Phase 1B candidate 145/145（exact 135 + review 10）→ Phase 1C 逐项分类 + Tier 分级 → **v8.7 契约修订（Decision C Option 2）+ 佐证战役**：FAA NFDC Tier-1（US 17）+ Phase 1C 第二来源（8）+ OSM Overpass `ele` 佐证（Tier 4，仅 corroboration）+ Web 佐证（含缅甸 eAIP / Phu Quoc 官网两个 Tier-1）→ **17 APPROVED-TIER1 + 123 APPROVED-VERIFIED + 5 APPROVED-VERIFIED+FLAG = 145/145，0 pending / 0 blocked**（`elevation-v87-final-ledger.json`；冲突解决已记录：dubrovnik OSM 异常值被拒绝并替换，goa 等 5 条按 5–20 m 规则接受+旗标）。**锚点修正 A/B 已由用户批准并应用于 pilot 数据集**：hcmc（经度 106.652；气候值 0 变化）、siem-reap（SAI/VDSA + 59 气候单元格；7 月 R5→R3、12 月 R4→R7、Best Months [10]→[10,11]）；新发现登记：**phnom-penh (VDPP) 已于 2025-09 被 KTI/VDTI 取代**——同类旧锚点模式，属未来用户决策，本轮不改动。`ELEV_MISMATCH_M`：NASA grid 114 ≤150 m / 31 >150 m；ERA5 grid 仍 NOT EVALUABLE（缺凭据）。
6. **ERA5 PRIMARY 未实测 = BLOCKED_BY_MISSING_CDS_CREDENTIALS**：`cdsapi` 未安装、`~/.cdsapirc` 不存在、`CDSAPI_URL/KEY` 未设置、项目内无 CDS client code。请求模板已就绪（`pilot/best-time/scripts/copernicus_request_template.py`，无凭据、不自动执行）→ 取得凭据后方可执行 T1/T2 实测。
7. **NASA POWER 正式 licence 条文（commercial / redistribution）= UNVERIFIED / LEGAL REVIEW REQUIRED**：本轮新增 AWS Open Data Registry 自述旁证，但仍非正式 licence 条文；若 fallback 上线为硬前置。
8. Database rights 细节（sui generis）＝ **UNRESOLVED / LEGAL REVIEW REQUIRED**（仓库内无可靠法律依据，v8.5 不自行关闭）。
9. **T2 / T3 production coverage 145/145 = 未完成**：T2 需 Copernicus PRIMARY 实测（缺凭据）；T3 需 T2 全过 + 质量旗标审毕 + schema valid + 质量门。当前 **T2 = BLOCKED，T3 = BLOCKED**。
10. P-1~P-9 产品决策（均有建议默认值，见 §19.3）；其中 P-2（`ELEV_MISMATCH_M` = 150 m）因 elevation 数据缺失，**无法在 Pilot 期完成评估**（§23.0）。

（注：Copernicus daily statistics 的 UTC offset 可配置能力已 research-confirmed，不列入本清单。Pilot 期新增的已知文档不一致项——v8.4 记录的 ERA5-family cross-check −0.23 °C / +0.01 °C 无法从现存 30 个 raw 文件复现——已登记于 §23.0，属文档修复事项，不单列为 unverified 项。）

### 23.5 Final Decision（v8.5）

**本轮性质变更（如实记录）**：v8.5 不再是纯文档推演——它以 `pilot-2026.09.11.v1` 的 **145 点真实外部取数**为事实基线（Climatology / Daily / Monthly 各 145/145 HTTP 200，响应全部归档于 `pilot/best-time/raw/`）。本轮**只读**访问外部 API；**未修改** `src/`、`public/`、UI、`bestMonths`、`weatherScore`、`climate-pattern.ts`、sitemap；未 commit、未 push、未部署。

**判定依据（逐条对齐 §37 的策略最终门）**：

```text
① v8.5 document is internally consistent
   · canonical 温度语义在 §6 / §7.1 / §7.2 / §7.2.1 / §12.2 / §21 Q5 单一表述 ✅
   · Climatology 默认 LST / 显式 UTC → UTC 在 §7.2.1 E / §12.2 / §19.1 / §23.0 同口径 ✅
   · source-native ≈0.5°×0.625° 在 §3.6 / §7.2.1 F / §12.2 同口径 ✅
   · 降水单位与口径在 §3.6 / §7.2.1 A / §12.2 同口径 ✅
   · fieldProvenance 15 键契约与 §10 要求逐项对齐 ✅

② v8.4 contradictory wording = 0
   · "Climatology default = UTC"                     规范层残留 0 ✅
   · "time-standard parameter not supported"         规范层残留 0 ✅
   · "Climatology 省略 time-standard 即 non-compliant" 规范层残留 0 ✅
   · "tempHighC → T2M_MAX_AVG"                       规范层残留 0 ✅
   · "tempLowC  → T2M_MIN_AVG"                       规范层残留 0 ✅
   · "0.5° × 0.5°"（作为 POWER source-native）        规范层残留 0 ✅
   · 残留仅存在于「被证明不适用」的历史证据位置（§23.0 / §7.2.1 A / flags）
     —— 已由断言 forbiddenTokensConfinedToRejectionContext 锁死 ✅

③ all known Pilot discoveries represented
   · T2M correct / PRECTOTCORR_SUM correct / T2M_MAX_AVG wrong / T2M_MIN_AVG wrong
   · 509/1740 = 29.3% 分类差异
   · Daily-derived high/low 的 ERA5-family cross-check（含 v8.4 记录值与
     v8.5 可复现值的差异登记）
   · elevation 0/145、ELEV_MISMATCH_M NOT EVALUABLE
   · CDS credentials missing → ERA5 PRIMARY BLOCKED
   · monthIndex 契约违背缺陷（v8.4 产物 1–12）
   · 2 月聚合顺序差异（pooled vs mean-of-yearly-means）
   全部登记于 §23.0 / §23.4 / §23.6 ✅
```

**未关闭事项一律保持 BLOCKED，不做风险接受**：Copernicus PRIMARY 未实测（缺凭据）、NASA licence 未确认、database rights 未确认 → **T2 / T3 不得关闭**（§23.6）。elevation gate 已在 v8.7 契约下关闭（145/145 production-approved）；锚点 A/B 已由用户批准。

```text
STRATEGY v8.7 — INTERNAL METHODOLOGY = FULLY PASSED（契约修订经正式审计；内部矛盾 = 0）
T2 — BLOCKED      （ERA5 PRIMARY 未实测：BLOCKED_BY_MISSING_CDS_CREDENTIALS）
T3 — BLOCKED      （T2 未过 + NASA licence UNVERIFIED + database rights UNRESOLVED）
```

（策略文档本身已可用于指导下一步实施：实施团队依据 v8.6 无需对任何 canonical 语义、temporal 语义、分辨率或派生字段政策做猜测；剩余开放点 = §23.4，且全部为「外部凭据 / 外部权威来源 / 法律确认 / 产品决策」类，非文档内部矛盾。）

### 23.6 执行状态与门控（与策略门分开判定；v8.6 更新）

```text
PILOT ARTIFACTS（v8.5 Phase 1/1B，保留）
  normalized/nasa_canonical_145_v85.json     145 records × 12 months（PILOT ONLY）
  reports/nasa_v85_validation.json           全量验证指标
  reports/assertions_v85.json                30/30 PASS（两轮一致）
  scripts/verify_v85.py                      全量验证 + dataset 生成
  scripts/assertions_v85.py                  30 条机器断言
  scripts/nasa_monthly_fetch.py              Monthly endpoint 145 点取数
  scripts/make_daily_manifest.py             daily_145 manifest 重建
  scripts/copernicus_request_template.py     Copernicus 请求模板（不可执行、无凭据）

PILOT ARTIFACTS（v8.6 Phase 1C 新增）
  raw/nasa/daily_precip_145/                 NASA Daily PRECTOTCORR 145/145 HTTP 200（UTC，每点 10958 有效日，0 缺失）
  normalized/nasa_canonical_145_v86.json     v8.6 canonical dry-run（回归 vs v8.5 = 0 差异）
  reports/nasa_v86_validation.json           v8.6 验证指标 + v8.5 回归
  reports/assertions_v86.json                23/23 PASS
  reports/schema-audit-v86.json              missing/ambiguous/contradictory nullability = 0
  reports/daylight_calc.json                 daylightHours 计算（确定性 + 外部抽查）
  reports/copernicus-unit-audit.json         19/19 PASS（含月长 unit test：Jan31/Feb28/Feb29/Apr30）
  reports/elevation-review-v1c.json          10 条 review 逐项分类 + 第二来源（approved 143/145）
  scripts/daylight.py / nasa_daily_precip_fetch.py / build_v86.py /
  assertions_v86.py / copernicus_unit_audit.py / elevation_review_v1c.py

GATES（Phase 2 / v8.7 重算）
  INTERNAL METHODOLOGY（v8.7）— FULLY PASSED
    v8.7 contract internal consistency = PASS（active contract 层 "authoritative
    mandatory" 残留 0；Tier 框架 + 验证矩阵 + 冲突规则完整）；
    schema ambiguity = 0；methodology contradiction = 0；
    elevation gate = PASS（145/145 production-approved per v8.7 contract：
    17 Tier-1 + 123 verified + 5 verified+FLAG）；
    anchor gate = PASS（Decisions A/B approved 2026-09-12；pilot 已应用；
    siem-reap 全量重烘焙 0 条无法解释变化）；
    derived-field policy = explicit；daylight aggregation = explicit；
    Copernicus request/unit logic = PASS（19/19；request 级）
  B（NASA fallback 技术路径）— PASS（145/145；v8.7 数据集重烘焙后 143 个未修正
    目的地逐字节不变）
  C（外部依赖）— BLOCKED
  T2 — BLOCKED      （Copernicus ERA5 PRIMARY 未实测：BLOCKED_BY_MISSING_CDS_CREDENTIALS）
  T3 — BLOCKED      （T2 未过 + NASA licence UNVERIFIED + database rights UNRESOLVED）
  ELEVATION — PASS（v8.7 契约下 145/145 production-approved）
  ANCHOR — PASS（A/B approved；pilot 应用完成）
  ELEV_MISMATCH_M — NASA grid 可评估：114 ≤150 m / 31 >150 m（provisional trigger 不变）；
              ERA5/Land grid 仍 NOT EVALUABLE（缺 CDS 凭据）
  ERA5_PRIMARY_TEST — BLOCKED_BY_MISSING_CDS_CREDENTIALS
  NASA LICENCE — BLOCKED / LEGAL REVIEW REQUIRED（commercial=UNVERIFIED，redistribution=UNVERIFIED）
  DATABASE RIGHTS — UNRESOLVED / LEGAL REVIEW REQUIRED
  SUNSHINE HOURS — NOT A BLOCKER（canonical = null 合法；T3 checklist 不含）

Phase 1C Final Evidence Audit 追加 artifacts（2026-09-12，全部 PILOT ONLY）:
  raw/nasa/daily_precip_145/ 已在 1C 完成（此处略）
  normalized/nasa_canonical_145_v86_final.json   审计修复重建（全部字段 0 差异）
  reports/phase1c-final-audit.json               独立对账 + 回归 + 分级汇总
  reports/elevation-review-v1c.json（revised）    SECONDARY-VERIFIED 分级 + 对账
  reports/anchor-correction-candidates.json      锚点修正候选（不写 src/data）
  reports/anchor-impact-probe.json               NASA 网格影响实测
  reports/schema-audit-v86-final.json            missing/ambiguous/contradictory = 0
  reports/external-dependency-final.json         外部依赖分级矩阵
  scripts/phase1c_final_audit.py / build_v86_final.py
版本决策：维持 v8.6——本轮为证据澄清与审计修复，无数学定义变化

PRODUCTION
  src/ 修改 = 0；public/ 修改 = 0；UI 修改 = 0
  bestMonths = 未改；weatherScore = 未改；climate-pattern.ts = 未改；sitemap = 未改
  nasa_canonical_145_v85.json / v86.json 未接入任何生产路径
  destinations.ts ICAO 纠正（8 条）已识别、未写入
  Commit = NO；Push = NO；Deployment = NO
```

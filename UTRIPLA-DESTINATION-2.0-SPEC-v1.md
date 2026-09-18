# UTRIPLA DESTINATION 2.0 — Visual Rebuild SPEC v1

- Type: DESIGN SPEC — no code in this round
- Date: 2026-09-13
- Basis: live visual audit of http://localhost:3111/destinations/tokyo at 1440×900 (5 viewport-scrolls), 1280×800, 390×844 (browser screenshots), cross-checked against Paris / Singapore
- Verdict on current page: **DESTINATION VISUAL = FAIL**（功能/数据/交互 PASS 与本轮视觉判定无关）

---

## 1. Current visual diagnosis

页面是"一摞做工良好的小仪器"，不是一个"地方"。整页 5354px 高，只有一张照片（锁在圆角卡片里）、一种节奏（hairline rows）、一种颜色（米纸）、一种字级（小号 mono+serif）。没有任何一个瞬间让用户感到"我在 Tokyo"。它的骨架（ut-* tokens、Instrument Serif、mono 读数）是对的；失败在 **composition 层**——组件各自成立，页面不成立。

## 2. Why it looks ugly（直接结论）

**因为这是一个"组件清单"被纵向排列成了页面，而不是被"构图"成一个地方。**
每个组件单独看都合格；但所有组件权重相同、尺寸相近、宽度相同、底色相同、节奏相同，全页没有一个大于一屏的视觉主角、没有明暗变化、没有色彩旅程、没有 scale 对比。Hero 里的 Tokyo 照片是全页唯一的"世界"，它被装进一张带边框的圆角卡片，周围是空旷的米色文档。用户看到的是"一份关于东京的报告"，不是"东京"。丑的根源不是细节，是**没有 scene**。

## 3. Top 15 visual failures

每条格式：[位置] 问题 / 视觉原因 / 用户感受 / 应该怎么改

1. **[Hero] 照片被卡片化**
   问题：全页唯一的照片装在 rounded-ut-lg + border 卡片里，左右各留 ~110px 纸边，高度仅 370px（占视口 41%）。
   原因：图片被当成"组件内的素材"，而不是页面的主角；页面仍然是一张文档，照片是文档里的插图。
   感受："这是一个博客的 featured image"，不是"我到了东京"。
   改：全出血（full-bleed）100svh 到达屏，图片即页面本身。

2. **[Hero vs NOW] 同一数据重复两遍**
   问题：hero 内 "26°/20°C · AUTUMN · 21:13" 与其下方 100px 处的 NOW 带（LOCAL TIME 21:13 / SEASON AUTUMN / TEMPERATURE 26°/20°C / DAYLIGHT）完全重复。
   原因：两个组件各自合理，组合后互相拆台——重复即廉价。
   感受：像没对齐需求的两个设计师各做了一半。
   改：合并为一个 environmental state（只出现一次，见 §12）。

3. **[NOW] 四格小数字框 = admin 仪表条**
   问题：LOCAL TIME/SEASON/TEMPERATURE/DAYLIGHT 四个等宽小格，mono 小字 + 细线，视觉上是一个 table row。
   原因：数据被"陈列"而不是"表达"；格子等权 = 没有主次。
   感受：SaaS 设置页。
   改：合并进 hero 的环境状态；时间/季节/光只保留一个声音。

4. **[Explorer] 左右两个小工具，没有主角**
   问题：左侧 5 行 serif 文本列表 + 右侧 370px 小地图卡，两者视觉重量几乎相同，都小、都安静。
   原因：争抢注意力但没有一个是主视觉；区块中央是大片空纸。
   感受：工作台，不是探索入口。
   改：让 typographic scale 成为视觉（巨型编号章节，见 §13）；地图移除。

5. **[Map] 米色网格 + 8 个小点 = 占位图**
   问题：地图看起来像线框图/示意图；点的视觉信息量趋近于零；390px 上 KOBE/OSAKA/KANAZAWA 标签重叠成乱码（截图实锤）。
   原因：没有底图地理（海岸线/地形全无），投影点缺乏可读空间线索；城市群在单一 bbox 里过度拥挤。
   感受：这不是地图，是"地图的示意图"；移动端直接破相。
   改：从 Destination 页移除；地图投资转移到 Hub World Atlas（那里有探索价值）。

6. **[Nearby 矛盾] 两种 "nearby" 打架**
   问题：地图上邻近 = Sapporo/Nagoya/Kobe（真实坐标），下方列表 "Nearby places" = Bangkok/Dubai/Singapore（同 region 逻辑），同名不同义。
   原因：两个组件各自取数，语义未对齐——数据诚信的观感损伤。
   感受："这个产品自己都不知道 nearby 是什么。"
   改：统一一个 nearby 定义（真实距离），列表改名 "Next in Asia"。

7. **[Vibe] 三个孤立的表单 pill**
   问题：ALL/FOOD/SHOPPING/HISTORY 四个小 pill 漂浮在大片空白里；下方 mono microcopy 比控件本身更长。
   原因：控件尺寸（min-h-44 pill）与决策重量不匹配；它是一个 section，却只有一行高。
   感受：后台筛选器。
   改：vibe 升级为探索方式选择器，并入 Explorer 场景，chip 放大、语义化（§14）。

8. **[ClimateYear] 12 个小刻度 = 一排尺子**
   问题：每列 verdict strip 3px、温度形状 ~56px 高、降水块 32px——在 1440 宽的页面上整体 < 200px 高，12 列挤在一起读不出任何"轨迹"。
   原因：数据正确但 scale 错误：这是全页最重要的决策数据，视觉权重却排第 6。
   感受：像嵌入的表格插件，不像"什么时候去"的答案。
   改：放大 2.5–3 倍高度，verdict strip 加粗，上方加巨型 serif 结论 "GO IN DECEMBER"（§15）。

9. **[Rhythm] 全页 Block×Block×Block**
   问题：band → strip → 2col → chips → chart → rows → rows → rows → dl → card → card → rows，全部同宽（max-w-7xl）、同底（米纸）、同 padding（py-16/24）。
   原因：机械等距的 section 堆叠；没有 full-bleed、没有明暗切换、没有宽度变化。
   感受：滚了三屏就像在读同一屏。
   改：5 个 scene 的节奏设计：满屏→满宽→满宽→收束→满宽（§10）。

10. **[Scale] 没有 scale 对比**
    问题：除了 hero H1，全页没有 >2rem 的元素；数据、标题、列表全部挤在 0.6–1.4rem 区间。
    原因：instrument 语言（为读数设计）被误用为版面语言（应为版面提供主角+配角层级）。
    感受：精致但平；没有呼吸，没有惊叹点。
    改：建立 6:2:1 的 scale 层级——每屏必须有一个"绝对大"的元素（§19）。

11. **[Color] 一张照片之外全是米色**
    问题：95% 页面是 #faf9f6 + 黑字 + 少量 terracotta；home 有会变化的天空，而"关于一个地方"的页面却是全站最没氛围的页面。
    原因：--ut-place-* 氛围变量只在无图 hero fallback 里生效，从未参与页面级环境。
    感受：出了首页，世界就熄灯了。
    改：以 dest 图片主色/canonical 季节色驱动页面级 atmosphere（Scene 过渡色），到达屏与 When 屏各有一次明暗变化（§20）。

12. **[Imagery] 旅行页只有一张图**
    问题：全页 1 张照片；guides/routes/related 全是文本行。
    原因：数据里只有 dest.image 一张图——诚实约束下未做任何补救设计。
    感受：没有"看"的旅行。
    改：不伪造图；用"已有图的不同用法"（到达屏满出血 + 同图在决定屏的二次裁切构图）+ typographic 视觉补位；图片存在感最大化。

13. **[Affordance] 一切看起来都不可点**
    问题：highlight 行是 button 但视觉上是静态文本；地图点无任何可点暗示；vibe pill 像表单。
    原因：hover 状态只有 bg 变色（太弱）；默认态没有任何"可交互"信号。
    感受：用户不知道可以玩。
    改：默认态加可交互信号（箭头/下划线/序号跳变），hover 增强（位移+内容预览），见 §18。

14. **[Whitespace] 是"没有东西"而非"设计留白"**
    问题：Explorer 右列上方、vibe 行四周、About 区右侧都是无内容空区；它们没有锚点、没有形状。
    原因：留白不是被构图出来的，是组件缩小后剩下的。
    感受：空旷 = 未完成。
    改：留白必须"指向"某个主角（大字/大图/大数字），否则用内容填实或收窄容器（§10 每个 scene 明确留白角色）。

15. **[Distinctiveness] 隐去 logo 后认不出 UTRIPLA**
    问题：整页 = 通用编辑模板 + 通用小地图 + 通用筛选 pill。NO——认不出。
    原因：有 token 一致性，无 product identity；home 的"活着的世界"（天空/时间/天气引擎）没有延续到内页。
    感受：换个 logo 就是别人的网站。
    改：把 home 的环境基因（活时间、活季节、氛围场）带入到达屏；让"实时的地方"成为 UTRIPLA 内页签名（§11）。

## 4. Root causes（为什么加了很多组件仍然不好看）

不是组件太多，是**三重缺失**：

1. **缺主角（No protagonist）**：每个组件都是配角尺寸。Hero 照片本是主角，被卡片化降级；此后页面再无任何元素接管视觉统治。页面由"配角合奏"构成，没有独奏。
2. **缺场景（No scenes, only modules）**：组件按数据库表结构排列（info→list→chart→list），而不是按体验叙事排列（到达→感受→探索→决定）。模块之间没有因果与过渡——NOW 不解释 Explorer，Explorer 不引出 When，When 不给结论。用户在"看组件"，不在"经历一个地方"。
3. **缺对比（No scale/light/color contrast）**：等宽容器、等距 padding、等权字级、单一底色。编辑设计的张力来自对比（巨大 vs 渺小、明亮 vs 幽暗、图像 vs 文字），本页把所有对比都磨平了。ClimateYear 是图表因为它只是图表；地图只是地图；vibe 只是按钮——因为它们没有被给过一个"放大到成为表达"的机会。

结论：**这是"数据库可视化"（把字段渲染成控件），不是"地方体验"（把数据组织成场景）。**

## 5. What to remove

- `NowPanel` full 四格读数带（数据并入 Hero 环境状态）
- Hero 内 compact 读数与 full 带的重复（只保留 hero 内一处）
- `RegionMiniMap` 从 Destination 页移除（移居 Hub Atlas）
- 独立 "PICK YOUR VIBE" section（并入 Explorer 场景头部）
- "Nearby places（同 region 冒名）"列表（改为真实距离的 "Next gateways" 或改名 "Next in {region}"）

## 6. What to merge

- Hero + NOW + breadcrumb → **SCENE 01 ARRIVAL**（一屏说尽"我到了，此刻这里是这样"）
- Explorer + Vibe → **SCENE 02 EXPLORE**（选择玩法 → 巨型章节列表联动）
- Budget + Typical stay + Best window + CTA + Hotel → **SCENE 04 DECIDE**（一个决策面板）
- About 长文 → 折叠并入 SCENE 02 尾部/SCENE 05 之前（不占独立 section 视觉位）

## 7. What to enlarge

- 到达屏图像：卡片 → 100svh full-bleed
- 最佳窗口结论："BEST WINDOW: DECEMBER" mono 小行 → 巨型 serif 宣言（GO IN DECEMBER）
- ClimateYear：高度 ×2.5–3，verdict strip 3px→8–10px，月份列 min 64px
- Highlight 编号章节字：h3 → display 级（clamp 2.5–4.5rem）
- 决策数字：120 USD/day 从 h3 → display 级

## 8. What to reduce

- breadcrumb：从页顶独立行 → 到达屏上的 on-image 小浮层
- Keep Exploring 三组：每组默认 3 条 + "show all"（现在一次全量铺 12 行）
- microcopy 总量：vibe/地图/图例说明减半（当前 mono 说明比控件还抢眼）
- Practical dl：7 行 → 折叠 details（保留 DOM）
- HotelModule：卡片 → 单行 quiet 模块

## 9. Destination 2.0 concept

**Destination = ONE CONTINUOUS EXPLORATION EXPERIENCE — "抵达一个活着的地方"。**

一次滚动的五幕旅程，每幕有唯一主角、唯一动作、明确的明暗/宽度节奏：

```
SEE THE PLACE      SCENE 01  ARRIVAL   满屏图像 + 此刻状态（主角：照片）
FEEL THE PLACE     ↳ 状态不是四个数字，是"此刻的东京"一句话+环境层
EXPLORE THE PLACE  SCENE 02  CHAPTERS  巨型章节 × 玩法选择（主角：字）
UNDERSTAND THE PLACE SCENE 03 WHEN     GO IN … 宣言 + 放大气候年（主角：结论）
DECIDE             SCENE 04  DECIDE    一个决策面板（主角：价格/行动）
CONTINUE           SCENE 05  NEXT      下一站（主角：目的地行）
```

页面不再有"section 标题 + 内容"的文档结构，只有场景。Section 标题降级为场景内的 mono 角标。

## 10. Page scenes

| Scene | 主视觉 | 内容 | Interaction | 高度 | 用户动作 | 下一步 |
|---|---|---|---|---|---|---|
| 01 ARRIVAL | 100svh full-bleed 图（无图=全屏氛围场） | city display、country、on-image 实时状态（temp·season·local time）、on-image breadcrumb 浮层、滚动提示 | 时间每分钟真实跳动；无图时氛围场随季节/时间变化 | 100svh | 看、感受 | 明暗过渡 → 02 |
| 02 EXPLORE | 巨型编号章节（5 highlights，display 级 serif） | 每个 highlight 名 + 序号；vibe 选择器（玩法） | 选 chapter 置顶放大；选 vibe → Keep Exploring 联动过滤 | ~120–150vh | 选、扫 | 气候过渡色带 → 03 |
| 03 WHEN | GO IN {MONTH} 巨型宣言 + 放大 ClimateYear | 12 月轨迹 + 读数 + Full guide 链接 | 月份选择（键盘完整） | ~100vh | 判断 | 结论下探 → 04 |
| 04 DECIDE | display 级价格 + 一个主 CTA | budget/day、trip estimate、best window 复述、practical 折叠、hotel quiet 行 | CTA、折叠 | ~80vh | 决定 | → 05 |
| 05 NEXT | 目的行（imageless, hairline） | guides×3、routes×3、next gateways（真实距离） | vibe 联动过滤、show all | ~80vh | 续逛 | 离开页 |

明暗节奏：01 幽暗（图上）→ 02 明纸 → 03 纸+季节色氛围 → 04 明纸收束 → 05 纸。宽度节奏：01 全出血 → 02–05 容器（02 内部巨型字已破格）。

## 11. Hero（SCENE 01 详细）

- **PLACE IDENTITY 策略**：Tokyo 之所以想去 = 它此刻正在发生（霓虹、深夜、雨）。所以 hero = "The city, now"：图像 + 一行真实活状态。不做海报（无 slogan、无渐变装饰）。
- 布局：图像 object-cover 100svh；文字栈左下：eyebrow(region) → city（display-xl 白，clamp 3.5–7rem）→ country → 实时状态行（mono，白色 85%）。右上：breadcrumb 浮层（on-scrim 白 70%）。底部中央：滚动提示（mono "SCROLL · 05 SCENES" 或细线）。
- 实时状态 = 唯一 NOW 表达：`26°/20°C LIVE · AUTUMN · 21:13`，温度来源标签（LIVE/CLIMATE NORMAL）保留在 aria/后缀 micro。
- 无图 destination：全屏 `--ut-place-*` 氛围场 + 12 栏 hairline（现有 fallback 放大到全屏）+ city 巨字。
- 图像加载：`preload` + blur-up 占位（现有 Image 机制），LCP 不回退。
- 文字量：0 sentences（全部是名字/数值/标签）。

## 12. Now（合并后的 environmental state）

不再是四个格子。实现为一个**状态行 + 页面氛围**两层：
1. 状态行（hero 内）：temp · season · local time（数据源与诚信判据沿用 NowPanel 现有实现：Open-Meteo 签名校验，回退 NASA 法线并标注）。
2. 氛围层：`--ut-place-accent-rgb` 由季节/当地时段驱动，用于 Scene 03 的过渡色带与 Scene 02 的 tint 面板——环境存在于页面里，而非一个组件里。
- Daylight 只保留在 readout aria 或 Scene 03 的当月法线中（视觉上删除独立格）。

## 13. Explorer（SCENE 02 详细）

- **为什么要探索**：用户想找"这个城市该怎么玩"的入口。真实数据 = 5 个 highlight 名称 + 目的地 interests。因此探索 = **选择章节 + 选择玩法**，两者都改变内容。
- 形态：全宽纵向巨型章节列表——每行：mono 巨编号（01–05，text-label×4 大小，accent）+ display 级 serif 名称；选中章节占据 feature 位（字号再升一档 + accent 下划线），其余行按原序跟随。行高 ~88px，整区 ~120vh——**字就是图像**。
- Vibe（§14）作为场景顶部的"玩法带"，选中后：① Keep Exploring 过滤（真实 tags）；② Scene 02 每个章节行尾出现命中该 vibe 的 guides/routes 计数（真实统计："3 FOOD routes"）——这是 vibe 对探索区的**真实**反馈，不伪造 highlight 过滤。
- 文字量：5 个名称 + 计数；0 段落。

## 14. Vibe

- 命名从"兴趣筛选"改为"玩法"：ALL / FOOD / NIGHT / DESIGN / NATURE / SHOPPING / SLOW / HISTORY / SPORTS（仍由 `vibesForInterests` 从真实 interests 映射，无则不显示）。
- 视觉：去 pill 表单感 → 底线式大 chip（mono label 16px、底部 2px accent 状态线、44px+），选中态 = 底线 + 字色转 accent-strong。
- 价值承诺写在 aria 与一行 micro 里："A vibe filters what's next"。

## 15. Climate（SCENE 03 详细）

- 顶部：`GO IN DECEMBER`（display 级 serif；baseline 为空时 `FLEXIBLE — AVOID SEPTEMBER & OCTOBER`，同样来自 canonical R-tier，不新造结论）。
- ClimateYear 保留现有交互/数据契约，呈现放大：列高 ×2.5（temp field 140px、precip 80px）、verdict strip 8px、月名 text-label、hover 列浮出微型读数。移动端横滑保留。
- 读数面板与图例收紧为单行 dl；NASA attribution 保留。
- 场景背景：季节 tint 氛围带（--ut-place-accent 低透明度纵向渐变）——这一屏是页面的第二次"明暗呼吸"。

## 16. Content

- 删除独立 About section：context 一句移入 SCENE 02 底部（章节列表后的一行衬线引言），完整 longDescription 折叠（`Full context` details，DOM 保留）。
- Practical 7 行 → SCENE 04 内折叠 `Practical details`（DOM 保留全部行）。
- 所有 microcopy 复审：≤1 行，只解释"操作会改变什么"。

## 17. Interaction

- 每个交互必须产生新发现：选 chapter → 它成为主角；选 vibe → 后续列表与计数变化；选月份 → 读数变化；CTA → 预填 planner。
- 全部键盘可达（沿用既有 roving-tabindex 模式）；aria-live 读数保留。
- hover = 预览（行位移 2px / 编号变 accent / 图微缩放 ≤1.02），click = commit；reduced-motion 全关。

## 18. Typography

建立三级 scale（对比比当前激进得多）：
- HERO 级：clamp(3.5rem, 8vw, 7rem) — 仅 Scene 01 city 名、Scene 03 GO IN 宣言、Scene 04 价格
- CHAPTER 级：clamp(2rem, 4vw, 3.75rem) — Scene 02 章节、Scene 05 组标题
- INSTRUMENT 级：现有 label/micro/body —— 读数与列表
- Mono 只用于"机器在读的"信息（数据/标签/序号）；serif 用于"人要感受的"（地名/结论）。

## 19. Imagery

- 唯一图像（dest.image）获得两次出场：Scene 01 满出血 + Scene 04 决策面板左侧同图异裁（不同 object-position + duotone 处理，作为面板背景 30% 透明度）——同一素材的再构图，不是伪造新照片。
- 无图目的地：Scene 01 全屏氛围场 + Scene 04 面板改用 season tint。不引外部图片。

## 20. Motion

- Scene 过渡：相邻场景的背景明暗/色相用 CSS 渐变实现（section 顶部 24vh 渐变带），无 JS。
- 入场：`.ut-reveal` 既有机制复用；图像 Scene 01 初始 scale 1.03→1（1.2s，一次，reduced-motion 关闭）。
- 交互反馈：150–300ms color/transform/opacity；禁止新增动画库。

## 21. Responsive

- 390：Scene 01 100svh（图片裁切 object-position 50% 40%）；Scene 02 章节字 clamp 下限 2rem；ClimateYear 横滑 + sticky 选中读数；Scene 04 面板纵向堆叠；全局 0 横向溢出。
- 768：Scene 02 双列章节开始；其余同 390 逻辑。
- 1280/1440：按 §10 场景表。

## 22. Performance

- 保持 SSG；新增 client JS 目标 ≤ 10KB gz（复用现有岛屿逻辑，删除 map 岛反而减重）。
- LCP = Scene 01 图像（preload 保留）；氛围层纯 CSS；无新依赖；CLS 0（100svh 场景固定高度）。

## 23. SEO

- URL/metadata/canonical/JSON-LD/FAQ/robots/sitemap 全部不变。
- longDescription 完整保留在 details DOM；practical 行在折叠 DOM；keep-exploring 内链全保留；H1 = city 名不变（视觉放大）。
- 新增的 GO IN 宣言文本来自 canonical baseline（与 best-time 页同源），不产生第二套 SEO 文案。

## 24. Data integrity

- 全部数据源不变：highlights/interests/budget/NASA canonical/Open-Meteo（签名校验+降级标注）。
- "GO IN {month}" 只能由 `bestMonthsBaseline` 生成；avoid 月由 Challenging tier 生成；不新造推荐语。
- 邻近 = Haversine 真实距离；不再使用同 region 冒名 nearby。
- 无伪造图像/计数/热度。

## 25. Destinations Hub（/destinations 重构概念）

**UTRIPLA WORLD ATLAS**——"在这里逛世界"：

- 第一屏：满版世界图（145 个真实坐标点，等距圆柱投影，hairline 经纬网 + 大洲负空间），点 = 目的地。顶部一行 mono：`145 PLACES · 12 MONTHS · YOUR MOVE`。
- 交互三轴（每次交互产生新发现）：
  1. **MONTH**（JAN–DEC 轨）：选月份 → 全图点变 GOOD/WORKABLE/CHALLENGING（NASA tier）+ 侧读数 "37 places good in April →"；
  2. **VIBE**：选玩法 → 有该 interest 的城市点亮 + 数量；
  3. **POINT**：点城市 → 浮出 preview 卡（image + city + best window + budget/day + Open →）。
- 下方：当月 GOOD 目的的 editorial 行（替代旧 card grid）。
- 布局：图占第一屏 80svh，滚过后是月度清单——图是主角，清单是展开。
- 为什么用户会玩：每个月份/玩法都是一次"世界重新洗牌"，preview 卡给出下一步。

## 26. Hub map concept

- 投影：equirectangular 全域（lat −60..75 裁剪），真实坐标；hairline graticule 每 15°。
- 点：2.5px 基础，GOOD 城市放大 + verdict 色；vibe 命中描环。
- 移动端：图 60svh + 允许横向滚动（snap）+ 双指缩放为 stretch 目标（不承诺，390 优先保证点选可用 + 列表承接）。
- 性能：145 点 = 145 个 button（HTML 定位），无 canvas/无库；SSG 预渲染默认态（ALL/当前月）。

## 27. Implementation sequence

1. Scene 01（Arrival 合并：hero+now+breadcrumb+氛围层）
2. Scene 02（Chapters + vibe 迁移 + 计数联动）
3. Scene 03（GO IN 宣言 + ClimateYear 放大 + 季节氛围带）
4. Scene 04（决策面板 + practical 折叠 + hotel 降级 + 图像二次出场）
5. Scene 05（Keep Exploring 收敛 + 真实 nearby 替换）
6. 删除清单执行（RegionMiniMap 出页 / NowPanel full 出页 / 独立 vibe 出页）
7. Hub World Atlas（新 page client 岛 + 点集预渲染）
8. 全站回归 QA（三视口 × Tokyo/Paris/Singapore/无图目的地 ×1）

## 28. Acceptance criteria（Destination Visual PASS gate）

1. 有明确视觉主角（每 scene 一个；Scene 01 = 图像满屏）
2. 页面不是组件堆叠（≤5 scenes，无重复信息块）
3. 快速理解城市（首屏 3 秒内：城市名+此刻状态+可探索）
4. 不读长文可探索（prose = 1 句）
5. interaction 有明确价值（每个控件有可见的下一步）
6. imagery 有存在理由（满出血主角）
7. typography 有真正层级（HERO/CHAPTER/INSTRUMENT 三级，实测字号差 ≥3×）
8. visual rhythm 有变化（≥2 次明暗/色相变化 + 宽度变化）
9. 旅行感（到达屏有 place identity；无 admin 控件裸露）
10. UTRIPLA 独特性（隐去 logo 可识别——活时间/氛围场/atlas 基因）

任一 FAIL → 整体 DESTINATION VISUAL = FAIL。

## 29. Final design decisions

- **REMOVE**: NowPanel full 读数带；RegionMiniMap（出 Destination 页）；独立 PICK YOUR VIBE section；"Nearby places"（同 region 冒名版）；About 独立 section；Practical 独立 section。
- **MERGE**: Hero+NOW+breadcrumb → Scene 01；Explorer+Vibe → Scene 02；Budget+Stay+Window+CTA → Scene 04；vibe 状态贯通 Scene 02/05。
- **KEEP**: ClimateYear（数据与交互契约原样）、HotelModule（降级）、FaqList、InnerCTA、KeepExploring 机制（收敛为 Scene 05）、/api/weather 签名校验降级逻辑、vibe-store。
- **REDESIGN**: 到达屏（全出血）、Explorer（巨型章节）、Climate 呈现（宣言+放大）、决策面板、Hub（World Atlas）。
- **RELOCATE**: 地图能力 → /destinations Hub Atlas；practical → 折叠；breadcrumb → on-image 浮层。
- **ENLARGE**: 图像、最佳窗口宣言、价格、章节字、ClimateYear。
- **REDUCE**: microcopy、keep-exploring 默认行数、hotel、practical 存在感。

## 30. Visual references（8 个，学什么）

1. **Apple Weather** — 学"环境是一体的"：时间/天气/季节不是四格，是一种状态语言 → Scene 01 状态行。
2. **Polarsteps** — 学"图像必须统治首屏"：到达感来自满出血影像 → Scene 01。
3. **Kinfolk / Cereal** — 学"字可以当图"：巨型 serif 标题与hairline 的张力 → Scene 02 章节化。
4. **Airbnb Explore** — 学"地图必须是发现引擎"：无发现任务的地图不配存在 → 地图移居 Hub。
5. **Flightconnections** — 学"点图+筛选=世界洗牌"：筛选后点阵重组即探索 → Hub Atlas 三轴。
6. **National Geographic Atlas** — 学"graticule 即审美"：经纬网作为版面语言而非工具 → Hub 与 Scene 01 无图 fallback。
7. **Spotify Wrapped** — 学"结论要喊出来"：数据结论以巨型字呈现 → GO IN DECEMBER。
8. **Time.is** — 学"时间是内容本身"：城市当地时间作为主角级信息 → 状态行活秒级存在感。

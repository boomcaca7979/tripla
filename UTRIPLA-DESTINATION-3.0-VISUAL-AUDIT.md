# UTRIPLA DESTINATION 3.0 — ANTI-PASS VISUAL AUDIT

- Date: 2026-09-13
- Method: live browser audit of http://localhost:3111/destinations/tokyo at 1440×900 + 390×844, full scroll walk, forced tests（no-text / no-click / 3-second / Home 对照），全部截图取证
- Scope: audit + design only — NO CODE, NO COMMIT, NO PUSH, NO DEPLOY
- Note: 任务引用的 UTRIPLA-DESTINATION-2.0-EXPERIENCE-REVIEW-v2.md 不存在于仓库；本审计以 SPEC-v1 与真实页面为基准

---

## 1. Why Phase 2.0 still fails

Phase 2.0 的自我评估（SCENE 01/02/03 PASS）是**按"交互存在且可用"判定的**，而不是按"交互是否好玩、是否产生发现"判定的。真实浏览结论：

- Scene 01：一张好看的照片。用户能做的是看/滚/点 NOW（打开一个数字面板）。没有可玩的对象。
- Scene 02：点击第 2 章（Senso-ji）后，帧里的照片**几乎没变**（同一张图的轻微平移），变化的是标题文字和 ON VIEW 标记的位置。用户第二次点击时已经明白："这只是带选中态的列表"。探索循环在第二次点击后死亡。
- Scene 03：拖动月份 = 操作一张图表。数字变了，"世界"没变。
- 全页没有任何 ambient life：除照片外零运动、零氛围、零呼吸——与 Home 的活天空形成断崖。

**自评 PASS 的根因**：验收表里写的是"interaction works / crop changes / tint changes"——我把 visual feedback 当成了 discovery，把自己定义的标准当成了证据。这正是本轮 ANTI-PASS 要修复的评估缺陷。

## 2. Functional vs playful interaction（逐交互判定）

| interaction | user does | what changes | how much | environment changes? | new discovery? | 判定 |
|---|---|---|---|---|---|---|
| NOW chip | 点击 | 一个面板出现（时刻/温度/季节/daylight/来源） | 中（整层） | 否（面板是叠层，页面未变） | 否（都是已知数字的重排） | FUNCTIONAL only |
| 章节 click | 点击 1–5 行 | 帧内照片轻微平移/缩放 + 标题 + ON VIEW + 计数 | 小（同一张照片） | 否 | 否（第二次点击后为零） | FUNCTIONAL only |
| vibe click | 点击 label | 帧 tint 色相变化 + 计数 + 列表过滤 | 小 | 弱（低透明度叠加） | 否（过滤器换了个名字） | FUNCTIONAL only |
| 月份 scrub/drag | 拖/点/键盘 | 巨型月名 + 轨迹选中列 + 读数数字 | 中 | 否（场景底色不变） | 弱（数据是新的，呈现不是） | FUNCTIONAL only |
| 滚动 | 滚动 | 场景切换（明/纸/纸+tint） | 中 | — | 场景间无叙事因果 | 滚动故事薄弱 |

**结论：当前页面 PLAYFUL INTERACTION = 0。所有交互都是 functional。**

## 3. Fake interactions（伪互动清单）

- **crop change**：同一张照片 pan ~20%——用户第二次点击即识破"还是那张图"。visual feedback，不是 discovery。
- **tint change**：6–42% 的色叠加——不改变任何信息，纯装饰反馈。
- **counter change**："1 GUIDE · 5 ROUTES" 数字重排——是列表过滤的副产品，被包装成了"世界变化"。
- **ON VIEW 移动**：选中态标记。
- **font-size/state change**：上上轮的巨型章节（已废）与上轮的行选中。

按 RULE 03（每个核心交互必须产生新发现）：以上全部不产生新信息，只是把已有信息换了个呈现位置。

## 4. Why the page is still text-heavy

真实观察证明（非猜测）：

1. **信息单元仍是词**：5 个章节 = 5 个短语；vibe = 4 个词；结论 = 一个句子。用户消费它们必须"读"。
2. **图像从不换身份**：全页唯一的视觉资产（那张照片）在所有章节里是同一张——视觉通道没有内容变化，所有"新内容"只能走文字通道。
3. **没有空间**：页面是一维纵向流；没有任何可以"在里面移动"的东西（无 lens、无 field、无 orbit）。用户的手只能"点选"，不能"探索"。
4. **没有结果反馈**：点击后没有产生任何"我发现了之前不存在的信息"——一切早已在页面上。
5. **列表仍是列表**：guides/routes/related 是三组 hairline 行——阅读对象。

## 5. No-text test（强制无文字测试 — 实测）

注入 CSS 隐藏全部 p/h1/h2/h3/章节词后观察：

- Hero：一张漂亮的街头照片——**但不再是 Tokyo**（城市名消失即身份消失），甚至不能确定"这是一个目的地页"。
- Scene 02：帧还是那张照片；5 个章节完全消失（它们本来就只是词）；vibe 词残留但无所指。用户无法区分 5 个章节——因为它们**没有视觉差异**。
- Scene 03：数字（温度/毫米）残留，月份身份消失。

**判定：LOW-TEXT EXPERIENCE = FAIL。** 页面的全部信息与身份都寄生在文字上。

## 6. No-click test（只滚不点 — 实测）

滚动态：满屏照片 → 帧（同一张照片的裁切）→ 文字行 → 12 列刻度 → 文字行 → 数字格 → 卡片。节奏有（满出血→纸面），但**没有一次滚动会改变页面状态**——所有场景在滚动前就已定型。滚动 = 翻页，不是旅程。SCROLL STORY = FAIL（弱）。

## 7. 3-second test（实测）

第一眼：照片 + "Tokyo" + NOW chip —— **HERO EXPERIENCE 3 秒识别 = PASS**（这是 2.0 唯一真正的资产）。但"这里有什么可以探索"在 3 秒内不可知——探索性完全依赖向下滚动发现。

## 8. Home vs Destination comparison（实测对照）

Home 有的、Destination 没有的：

| 维度 | Home | Destination |
|---|---|---|
| Environment | 活天空（时间/天气/季节驱动，全页呼吸） | 无（照片之外是静态纸） |
| Ambient motion | 星星/云/光晕/precip | 零 |
| Narrative voice | "Rain after midnight — the streets shine back twice as loud." | 无 |
| Playable instrument | TimeDock（拖时间变整个天空） | 无 |
| Anticipation | "Interactive travel discovery" 承诺 + mood line | 无 |
| Curiosity hooks | 月亮可点、天气可切、星空在动 | 无 |

**继承决策（不复制）**：把 Home 的"alive 原则"——环境状态层 + 一个真正可拖拽的乐器——继承到 Destination：① 全页氛围随季节/月份呼吸（E3）；② 拖拽透镜（E2）= Destination 的 TimeDock。

## 9. Current visual objects（抽象）

Image（1 张，静态身份）/ City（词）/ NOW（数字面板）/ Highlight 1–5（词）/ Vibe（词）/ Year（12 列数据刻度）/ Lists（词行）。**用户真正可以探索的对象：NONE。** PRODUCT EXPERIENCE = FAIL。

## 10. Missing experience

- 缺一个"可探索的物理感对象"（可拖/可扫/有阻尼的东西）。
- 缺"操作 → 世界真的变了"的因果（照片恒定、氛围恒定）。
- 缺叙事声音（Home 有 mood line；Destination 全是标签）。
- 缺页面自身的生命（无 ambient）。
- 缺探索的"结果感"：点完没有任何新信息出现。

## 11. Destination 3.0 concept

**"PLACE YOU CAN TOUCH"** —— 一个目的地页面 = 你能亲手触摸的两个真实资产：

1. **那张照片** → THE LENS：一个可拖拽的放大透镜，在真实街景照片里自由游走；5 个章节是透镜的"导览锚点"（确定性定位），自由拖拽是自由探索。点/拖 → 你真的看到了照片的不同区域（放大 1.9×，视野外区域首次可见）——**新发现来自真实照片的真实区域**。
2. **那 12 个月的数据** → THE YEAR：可拖拽的时间场，月份 scrub 驱动**场景级氛围**（底色 tint 随 verdict/季节变化）+ 巨型月份 + 读数——继承 TimeDock 的"拖一个东西，世界跟着变"。

更少组件：DiscoveryBoard 的 crop-swap 伪探索被透镜取代；巨型章节列表降级为透镜锚点；vibe 并入透镜（滤镜模式）与列表（过滤）。

## 12. Scene architecture（3 experiences）

| Experience | Primary object | Primary interaction | User action | State change | Discovery result |
|---|---|---|---|---|---|
| E1 THE PLACE | 满出血照片 + 活氛围层 | 看 + NOW 层（保留） | 感受 | 轻氛围呼吸（CSS ambient，reduced-motion 关） | 场景气质（诚实：不伪装可玩） |
| E2 THE LENS | 透镜 + 真实照片 | **自由拖拽** / 点章节锚点飞镜 | 摸索街道 | 透镜位置、放大区域、章节字幕、vibe tint | 照片的真实区域首次可见 + 章节落点 |
| E3 THE YEAR | 时间场（12 月大对象） | **横向拖拽 scrub** | 玩时间 | 巨型月份、verdict、场景底色 tint、读数 | 该目的地"什么时候是什么样" |

（DECIDE/NEXT 维持现状，Phase 3 再按同一原则重构。）

## 13. Interaction architecture

- E2 透镜：pointer capture 拖拽（桌面+移动 touch 原生），章节锚点 = `cropForHighlight` 改造的透镜落点（position+scale→lens center+zoom）；键盘：锚点 chips 为 tab/arrow 可达。
- E3 时间场：沿 ClimateYear 的 pointer scrub，扩展为"拖动=时间流动"，场景底色 `rgba(verdict/season tint, 0.05–0.08)` 全 section 过渡。
- RULE 01–08 全部内建（见 §24 decisions）。

## 14. Visual object architecture

- OBJECT-1 照片（真实，唯一）：E1 全出血 + E2 透镜载体——同一资产的两种触法。
- OBJECT-2 年（12×4 真实数值）：E3 的场。
- OBJECT-3 章节（5 个词）：降级为透镜锚点（承认它们是词，不再伪装视觉对象）。
- OBJECT-4 vibe（真实 interests 映射）：透镜滤镜 + 列表过滤器（诚实双职）。
- OBJECT-5 NOW（真实时区时钟/天气）：E1 状态层（保留）。

## 15. Text strategy

Scene 内 prose 继续为 0；章节名/月份名/verdict 是**对象的标签**而不是对象本身；longDescription/FAQ 维持折叠 DOM（SEO）。新增叙事声音：每 scene 一行 mood micro（从 canonical/真实数据派生，如 Scene 03 "Rain heaviest in September — 200 mm"），给页面一个"说话的人"。

## 16. Motion strategy

- E1：氛围层 ambient（类似 home haze 的低频呼吸，20s 级，data-ut-lite/reduced-motion 关）。
- E2：透镜跟随指针（transform，rAF 节流）；锚点飞行 500ms ease-ut-out。
- E3：scrub 即时（跟随手），氛围 tint 300ms 过渡。
- 无新库；全部 transform/opacity。

## 17. Mobile

- E2 透镜：手指即透镜（touch 拖拽天然），章节锚点横滑 chips 在帧下方。
- E3 时间场：横向 scrub 即手势主轴；读数吸底。
- 全局无横向溢出；390 优先设计。

## 18. Performance

SSG 保持；透镜 = transform 层（合成器友好）；无新依赖；client JS 增量 ≤ 8KB gz；LCP 不变（Scene 01 preload）。

## 19. Data integrity

透镜只在**真实照片**内移动（不生成内容）；章节锚点 = 确定性取景函数（已有 cropForHighlight 演化）；年份 = canonical；vibe = 真实 interests；氛围 tint = verdict/季节派生的纯视觉层。零伪造。

## 20. SEO

URL/metadata/canonical/JSON-LD/FAQ/longDescription-DOM/内链全部不变——3.0 是表现层重构。

## 21. Destinations Hub relationship

闭环确认：World Atlas（145 点，月/vibe 轴）→ 选目的地 → 进入 PLACE（本页）→ THE LENS 触摸街道 → THE YEAR 触摸时间 → DECIDE → Atlas 上的"next gateway"回到世界。Atlas 保留 RegionMiniMap 能力，Destination detail 无地图（维持 2.0 决策）。

## 22. Implementation sequence

1. E2 THE LENS（核心可玩对象：拖拽透镜 + 章节锚点 + vibe tint）
2. E3 THE YEAR 场景化（scrub → 场景氛围 + 巨型月份；ClimateYear moment 扩展）
3. E1 活氛围层（ambient 继承）
4. 删除清单执行（DiscoveryBoard crop-swap、独立 vibe、巨型章节）
5. 全站回归 QA（Tokyo/Paris/Singapore/Berlin 无图 × 双视口 × 强制四测试）

## 23. Acceptance criteria（3.0 PASS gate）

1. 无文字测试：隐藏词语后 E2/E3 仍可玩（透镜可拖、年可扫、状态可见）— 与 2.0 的本质区别
2. 无点击测试：滚动中场景氛围随内容变化（≥2 处状态变化）
3. 交互后 30 秒留存测试：用户连续操作 ≥3 次仍有新视野（透镜区域/月份状态）
4. 每个 interaction 满足 RULE 01–03（reveal information / beyond visual / new discovery）
5. Home 对照：Destination 有自己的 ambient life（非复制）
6. 视觉主角每 scene 一个；对象非文字
7. 数据诚信零违规；SEO 零破坏；perf 预算内
8. 双视口 × 4 城（含无图）全部通过

## 24. Final decisions

- **REMOVE**: DiscoveryBoard 的 crop-swap 交互模型（伪探索）；"巨型章节 = 可探索对象"的宣称；vibe 的"场景模式"过度宣称（降级为透镜滤镜 + 列表过滤双职）。
- **REPLACE**: Scene 02 探索模型 → THE LENS（拖拽透镜 + 章节锚点）；Scene 03 呈现 → THE YEAR 场景氛围化。
- **MERGE**: vibe → 透镜滤镜 + 列表过滤；章节 → 透镜锚点。
- **KEEP**: Scene 01 构图与 NOW 层；ClimateYear 数据/算法契约；全部数据链路；SEO；KeepExploring（下阶段重构）。
- **INHERIT**: Home 的 alive 原则 → 全页氛围层 + 可拖拽乐器。
- **STRUCTURE**: 5 scenes → 3 experiences（THE PLACE / THE LENS / THE YEAR）+ 后续内容区。

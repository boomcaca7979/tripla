# EPHEMERA.fm — UI/UX Reverse Engineering Report

> 逆向对象：https://www.ephemera.fm/ （Ephemera — "A Living DAW"，一个会随时间/天气/季节/月相变化的数字音频工作站产品站）
> 分析目的：为 UTRIPLA 2.0（Interactive Travel Discovery）UI 重构提供工程级设计规格
> 方法：真实浏览器访问（DOM / computed styles / 运行时状态 / 交互操作）+ 静态资源抓取（HTML / CSS / JS / GLSL）
> 日期：2026-09-09 · 所有未直接测量的数值均标注 `estimated`

---

## 1. Executive Summary

Ephemera.fm 的核心设计命题是：**"这个网站是活的"（This website is alive）**。它把产品概念（音乐随真实世界条件变化的 DAW）直接映射为网站本身的运行方式——网站读取真实的本地时间、季节、月相，并提供天气、时间等可拖拽的"条件滑块"，用户拖动滑块，**整站的配色、问候文案、hero 合成图像、氛围动画、WebGL 天空渲染全部实时重绘**。

它的"特别感"不来自某个炫技特效，而来自三层机制的叠加：

1. **状态驱动的全局主题**：一个 24 小时 × 逐时色表（`TIME_OF_DAY_COLORS`）+ 季节属性（`data-season`）+ 天气/月相状态机，通过 CSS 变量（`--tod-color` 等）辐射到每一个组件。实测拖拽时间滑块到 20:06，全站 accent 色从下午蓝 `#78a8d6` 实时过渡到黄昏色 `#b65879`，问候语从 "Good afternoon." 变为 "Good evening."。
2. **克制的动效预算**：虽有 115 个 keyframes，但绝大多数是低幅度（2–8px 级）的呼吸/漂浮类 ambient 动画；交互反馈只动 opacity/transform 且时长集中在 0.15–0.4s；`prefers-reduced-motion` 有全局一键关闭；还建立了 `data-perf-tier`（fallback/low/medium/high）设备分级系统，在 shader 层都有 `iTier` uniform。
3. **编辑型排版而非 SaaS 卡片**：logotype 用圆体 Comfortaa、负字距、随时间变色；正文层级靠 "10px uppercase tracking-widest 的 eyebrow 标签 + 语义标题" 建立；首屏没有一个传统 hero banner，而是一个"正在发生的天空"。

**对 UTRIPLA 的启示**：Ephemera 模式完全可以转译为"旅游网站是活的"——目的地当地时间为驱动的主题色、日出日落时段的天空渐变、季节性的目的地氛围层。且其核心技术（CSS 变量 + 属性选择器 + 逐时色表插值）是低成本可复制的，WebGL 层则是可选增强。

---

## 2. Pages Inspected（实际访问记录）

### 2.1 真实浏览器访问（DOM/computed styles/交互测试）
| URL | 视口 | 测试内容 |
|---|---|---|
| `https://www.ephemera.fm/` | 1280×720 桌面 | 全量：实时状态读取、条件滑块拖拽、键盘操作、导航 hover、滚动行为、canvas 帧率、性能资源 |
| `https://www.ephemera.fm/` | 768×1024 平板 | 布局/排版/条件坞换行 |
| `https://www.ephemera.fm/` | 390×844 手机 | 布局/汉堡菜单/canvas 尺寸/dvh |

### 2.2 静态抓取分析（HTML + 内嵌 RSC 数据 + CSS/JS/GLSL 资源）
| URL | 页面目的 | 层级 | 主要区域 | 信息密度 | 主要交互 |
|---|---|---|---|---|---|
| `/` | 产品首页 + 一句话价值主张 | L0 | 固定导航 + Beta 公告条 + 条件坞（Conditions Dock）+ Hero（100dvh）+ Story（What/Who/Why 标签页）+ Features（4 条件卡片，视频/visual）+ FAQ + Footer | 中低——每屏一个概念 | 拖拽滑块、滚动显现、标签切换 |
| `/almanac` | "流媒体之家"（未上线，预告页） | L1 | "Come back in 2028" 邮件收集 + 概念介绍 + 频道/艺人占位 | 低（诚实的不完整状态） | 邮件订阅 |
| `/instruments` | 17 个可玩乐器的家族页 | L1 | family / how / capabilities / studio 四个 section，1 个 canvas | 高（17 个条目） | 入口筛选、scroll reveal |
| `/dimensional` | 单个乐器（3D 宇宙序列器）产品页 | L2 | playground / faq / pricing | 中 | 浏览器内 Launch 可玩 demo |
| `/press` | 媒体资料包 | L1 | boilerplate / logos / screenshots | 高（文案可直接复制） | 一键复制 |
| `/roadmap` | （请求的路径不存在时）品牌化 404 | — | "This page drifted away / Like a sound lost between conditions." | 极低 | 返回首页 |

### 2.3 设计系统一致性结论
所有页面共享同一套 Design System：相同的导航/页脚骨架、相同的 `--tod-*` / `--ephemera-*` token、相同的字体家族（Inter 正文 / Plus Jakarta Sans 标题 / Comfortaa logotype / JetBrains Mono 控制台）、相同的条件坞逻辑（每个页面顶部都有）。**系统一致性极强**；子页面差异只在区块构成，不在视觉语言。连 404 与"未上线"页都用同一语言表达（"The Almanac is still tuning in."）。

---

## 3. Global Design System

### 3.1 Token 组织模式（重要发现）

Ephemera **没有单一 token 层**，而是按"产品域"分了至少 4 套 `:root` 变量组，这是它支撑多主题的架构关键：

- `--ephemera-*`：主站基底（bg/surface/surface-hover）
- `--tod-*`：**时间主题色系统**（time-of-day），含 RGB 三元组拆分（`--tod-color-rgb`、`--tod-color-alpha`、`--tod-color-muted`），供 `rgba(var(--tod-color-rgb), α)` 全站引用
- `--console-*`：控制台风格子主题（深色 + 紫罗兰 accent `#7c83ff` + 琥珀标记色 `#fbbf24`，success/warn/danger 全套）
- `--ix-*`：第三套主题（深空感：`--ix-bg:#05060a`、`--ix-accent:#7dc8ff`）
- `--diorama-*`：小场景插画变量

**关键机制**：`--tod-color` 不是静态值，而是 JS 按当前小时在色表中插值后写入 `:root`（并带 `--tod-brightness` 亮度系数）。主题切换 = 改几个变量，全部组件通过 `rgba(var(--tod-color-rgb), α)` 自动跟随。

### 3.2 Color System（实测值）

**基底（静态）**
| 用途 | 值 | 来源 |
|---|---|---|
| page background | `#0e171c`（但 JS 会用 `darkenForLivingBg()` 再压暗，实测 body 为 `rgb(10,14,19)` ≈ 9% 亮度） | CSS + JS 实测 |
| surface | `#1a1f2a` | CSS |
| surface hover | `#242a38` | CSS |
| text primary | `#f8fafc`（另一处覆盖为 `#fff`） | CSS |
| text body | `#e2e8f0` / `#ffffffe6` | CSS |
| text muted | `#cbd5e1` / `#ffffffd9` | CSS |
| text subtle | `#94a3b8` / `#ffffffb3` | CSS |
| 边框 | `rgba(255,255,255,.08–.12)`、`#1f2937`、`#334155` | CSS |
| success / warning / danger | `#22c55e` / `#f59e0b` / `#ef4444`（console 域） | CSS |

**动态 accent（`--tod-color`，24 小时逐时色表，完整实测自 JS）**
```
0点 #201B3A · 1  #2A2140 · 2  #352847 · 3  #3C2D4A · 4  #4D3A51 · 5  #6F4F5B
6  #A77D61 · 7  #A4917F · 8  #C8A878 · 9  #D4B882 · 10 #E8D155 · 11 #E2CA48
12 #DCC03C · 13 #B8C060 · 14 #A8C470 · 15 #95B865 · 16 #78A8D8 · 17 #6B9BCC
18 #8B6B9C · 19 #B85A7A · 20 #A0426B · 21 #7A355C · 22 #4A2B4C · 23 #2F1F3E
```
每色带语义描述（如 16 点 "Afternoon sky blue"、19 点 "Deep sunset pink-red"）。JS 在相邻小时之间做 RGB 线性插值（实测 16 点段插值出 `#78a8d6`）。hover/active/selected 态不另设色，而是**同一 tod 色的不同 alpha**（如 border `.12`、soft 背景 `.21`、line `.57`）——这是它色彩系统极其省预算的原因。

**环境光三元组**：JS 另维护一份 shadow/midtone/highlight 三色表（9 个关键小时节点，插值），用于生成 hero 天空渐变与 `--tod-brightness`（实测 0.752，随时间变化）。

**季节再着色（实测）**：`data-season="autumn"` 时，`.tod-glass` 卡片边框实测变为 `rgba(210,140,70,.18)`（秋橙），并叠加秋日 vine 装饰层与不同的玻璃渐变；spring/summer/winter 各有对应覆盖。**季节不是换 accent 色，而是在组件级重写表面色。**

**Overlays / 玻璃**：`.tod-glass` = `linear-gradient(145deg, rgba(var(--tod-color-rgb), .07), #0e171cd9 70%)` + `backdrop-blur(12px)`（medium 档降到 4px/移除）+ 内高光 `inset 0 1px 0 #ffffff08` + `0 4px 24px #0000004d` 阴影。mega menu 面板背景同样掺 tod 色（实测 hover 时为 `rgba(182,88,121,.1)` 顶层的 145deg 渐变）。

**渐变即数据可视化**：条件坞的 4 根滑条轨道本身就是内容——时间轨是 24 色天空条、天气轨 11 态色、月相轨 8 相明暗、季节轨 4 季色。渐变在这里不是装饰，是"可拖拽的图例"。

### 3.3 Typography

| 角色 | 字体 | 实测样本 |
|---|---|---|
| Logotype / H1 | **Comfortaa**（圆几何体） | H1 "ephemera"：96px（lg），weight 500，letter-spacing **-1.44px**，颜色=`var(--tod-color-text)`（随时间变色） |
| 标题 | **Plus Jakarta Sans** | H2/H3，默认 `--font-heading-active: var(--font-jakarta)` |
| 正文 | **Inter** | body `font-family: Inter, system-ui, sans-serif`，正文 `text-lg/xl`（18–20px）`leading-[1.6]` |
| 代码/控制台 | **JetBrains Mono** | console 域 |
| 备用 | **Space Grotesk** | 已加载（局部使用） |

全部通过 next/font 自托管 woff2（最大单文件 48KB），fallback 链 `system-ui, sans-serif`。

**排版建立"实验性/编辑型"感的 5 个手法（均实测）**：
1. **10px uppercase + tracking-widest 的 eyebrow 标签**做信息分组（条件坞的 "TIME / WEATHER / MOON / SEASON"、footer 的 "COMMUNITY / CONTACT"、菜单分组标题 `text-[10px] uppercase tracking-widest text-white/30`）——用微缩大写字母制造"仪器标注"感。
2. **逐字符动画文本**（waveform-text）：副标题 "Time, weather, seasons, and the moon shape your music, live." 被拆成单字符 span，每字符带随机化 `--wtc-t` 相位变量，做波形式浮动（`line-height: calc(1em + 40px)` 给浮动留空），并随滚动"散开消散"（JS 实测：字符按 golden-ratio hash 散射 + 模糊 + 降透明）。
3. **文本即状态**：问候语、时间、"Live"标签都是活文本；字符间用 emoji 与文字混排（"Live: 🌸 Spring"）。
4. **声调化措辞 + 声音符号 ambient**：页面顶部漂浮 38 个 ♫♪♬ 音符（2D canvas 层）。
5. **字重克制**：body 400–500，标题不超过 600（`estimated`，视觉判断），层级靠字号与颜色差而非加粗。

### 3.4 Spacing（实测为主）

- 导航：高 64px（h-16），左右 px-6（24px），内容容器 `max-w-7xl`（1280px）
- Hero 文本容器：`max-w-4xl`（896px），副文案 `max-w-2xl`（672px），px-6
- Hero 内部节奏：logo→H1 `mb-8/mb-4`，H1→副文案 `mb-10`（`estimated`，来自 class）
- 条件坞：桌面单行高约 44px（padding 4+4px + 滑条 6px + 标签行 20px，`estimated`）；平板 768px 时换行成 2 行高 133px（实测），手机 390px 时 2 行 92px（实测，布局 `flex-wrap` + 每轨 `min-w-[calc(33.33%-0.375rem)]`）
- 菜单项：`px-5 py-3`（下拉）/ `px-3 py-3`（mega menu），分组 `mb-3` + 分隔 `pt-4 border-t border-white/5`
- 卡片间距：`gap-1.5 md:gap-4`（条件坞）；features 网格 gap `estimated 24–32px`
- 页脚：566px 高（实测 720p 视口），多列 + 底部版权行

垂直节奏观察：Ephemera 各 section 之间没有明显的统一 py 常量，而是**每个 section 自成 100dvh 或接近满屏的"舞台"**（hero 921px、story 1157px、features 1994px @720p 实测），用满屏换页感代替均匀留白。

### 3.5 Shape

- 圆角：卡片 16px、下拉/按钮 12px（rounded-xl）、小按钮 8px（rounded-lg）、滑条 12px（6px 高胶囊）、logo 强制圆形
- 边框：1px 为主，低 alpha 白（.08–.12）或低 alpha tod 色
- 阴影：极轻——`0 4px 24px #0000004d` 级别的深色投影 + 内 1px 高光；几乎不用彩色 glow（除 `tod-glow`、logo halo、`tour-button-glow` 等少量呼吸光）
- blur/backdrop-filter：分层使用（nav blur-sm 4px → 滚动后实测 12px；面板 16px；卡片 12px→按性能档降级）
- 混合模式大量使用：logo 合成用 `multiply / soft-light / screen / overlay` 四种 mix-blend-mode 叠加太阳/月亮/星空层（实测 hero DOM 有 6+ 个混合层）
- 噪点/纹理：hero 内用 GLSL fbm noise 云层（程序化，非贴图）
- 特殊：`@property --rainbow-angle`（Houdini 注册角度属性）驱动 conic-gradient 旋转（rainbow-glow 按钮、moment-card-holo 全息卡）——高级 CSS 特性但有 @supports 级别的降级意识

---

## 4. Layout System

技术栈：CSS Grid + Flexbox（Tailwind 类）+ `position: fixed/sticky` 导航 + `100dvh` 满屏 section + `clamp()` 尺寸（logo `clamp(320px, 40vw, 432px)`）+ 大量 absolute 分层 + z-index 层级（`z-0 背景 / z-5 vignette / z-10 内容 / z-40 条件坞 / z-50 导航`）。

1. **为什么不像普通 SaaS**：SaaS 布局 = 等宽容器 + 均匀卡片栅格 + 静态灰底。Ephemera 的底色是"时间函数"，每个 section 是满屏舞台，卡片只是漂浮在环境光上的玻璃片。accent 色随时刻流动，页面永远不会有两次完全一样的渲染。
2. **为什么像"空间"**：z-index 分层（天空 canvas → 暗角 vignette → 内容 → 玻璃 UI）+ `radial-gradient` 暗角（实测 `radial-gradient(ellipse 60% 50% at 50% 45%, rgba(0,0,0,.55)...)` 且透明度乘以 `--tod-brightness`）模拟了"舞台照明"，而非"文档背景"。
3. **留白**：hero 垂直居中的 logo（40vw 大圆）占据第一焦点，文字退居其次；留白是给环境动效（天空、星星、云）呼吸的空间。
4. **视觉焦点控制**：暗角 + `text-shadow-hero`（文字投影，`estimated` 2 层深色柔影）+ 唯一高饱和色（tod accent）三者把视线钉在 H1 与滑块上。
5. **对齐与偏移**：整体栅格严格（max-w-7xl / 1280px 容器），但装饰层故意偏移——太阳/月亮图层的 `translate(-3.33%, -4%)`、conic 高光的随机角度 `-18.42deg`（实测值，来自实时计算的自然角度）、音符 canvas 全屏随机分布。
6. **非对称结构**：存在但克制——主要在 footer 多列 + story 区图文交错（`scrollRevealLeft/Right` keyframes 暗示左右交替进场）。
7. **标准 vs 艺术化区域**：导航/条件坞/页脚/FAQ/pricing 是标准布局（可预测、可用性优先）；hero、features 的视觉层、各乐器页的 playground 是艺术化区域。

---

## 5. Navigation

**结构（实测 DOM）**：
- `fixed top-0 z-50`，64px 高，初始 `bg-[var(--ephemera-bg)]/30 + backdrop-blur-sm`（半透明融入天空）；滚动后实测 backdrop 提升为 `blur(12px)`（`estimated` 伴随 bg 加深）——滚动越深，导航越"实体化"。
- 左侧 logo（点击回顶部，带 `logo-breath` 呼吸动画）；桌面端 4 个下拉触发器（Discover / Product / Instruments / Community 等）+ Join Beta 按钮；`md` 以下收进汉堡。
- 下拉内容全部**预渲染在 DOM 中**（SEO 可见），仅用 `opacity:0 + pointer-events:none` 隐藏；hover 时 `aria-expanded=true`，**0.15s 纯 opacity 淡入**（实测），无位移缩放。
- 下拉面板：`top: calc(100% + 8px)`，1px 低 alpha 边框，145deg tod 色渐变玻璃底，`backdrop-blur(16px)`，圆角 12px。
- 链接 hover：文字变色 + 下方 1.5px tod 色下划线从中心 `scale-x-0→scale-x-100`（0.3s ease-out）+ 面板内链接 `hover:translate-x-0.5`（0.2s）。
- 移动端：全屏菜单（`mobile-nav-menu`），分组结构与桌面 mega menu 完全一致。
- 页面切换：Next.js Link 客户端路由，**无过渡动画**（转场即瞬时，尊重内容优先）。
- 键盘：导航按钮可聚焦，`focus-visible:outline-2 outline-[var(--tod-color)]`。

**为什么导航不破坏沉浸感**：
1. 半透明玻璃底 + 无边界线，导航"悬浮"在天空上而非"封顶"页面；
2. 下拉用最短的 0.15s 淡入，不做戏剧化展开；
3. 导航在视觉层级上低于条件坞——**站点把"可玩的全局控件"放在条件坞而非导航**，导航只负责找路；
4. 滚动后才增加不透明度，首屏时几乎隐形。

---

## 6. Hero / First Impression

**实测第一屏构成（1280×720）**：
1. 背景：全屏 WebGL2 canvas 程序化天空（43KB GLSL：fbm 云、3 层星星、极光、带相位的月亮、太阳，uniform 含 `iTimeOfDay / iMoonPhase / iScrollProgress / iMousePos / iTier / iRevealProgress`）+ DOM 渐变兜底层
2. 中心：`clamp(320px, 40vw, 432px)` 的圆形 logo 合成体（base + sun + moon + stars 四张 webp 用混合模式叠加，太阳位置/月亮阴影随时间移动，2s ease 过渡）
3. H1 "ephemera"（96px Comfortaa，tod 色）
4. 问候语（实时："Good afternoon." → 拖到晚上变 "Good evening."）
5. 逐字符波形副标题
6. 双 CTA：主 "Join the Beta"（含 3 行信任文案：Lifetime license / Free during beta / No subscription）+ 次 "Try Dimensional"（In-browser / No signup / Shareable）
7. 顶部：导航 + Beta 公告条 + **条件坞（4 根滑条 + "This website is alive — drag to explore conditions" 提示 + Tour All Conditions 按钮）**

**逐问回答**：
1. 第一眼：一轮发光的圆形 logo 悬浮在正在变化的天空中央。
2. 第一焦点：logo 圆（最大、唯一发光体）；第二焦点：tod 色的 H1 与底部条件坞滑条（唯一的交互可供性）。
3. 用户知道下一步吗？知道——两层引导：条件坞有 bounce 箭头 + "drag to explore conditions" 文案；CTA 下有 "No signup" 降阻文案。
4. 是否等待重资源？**否**——HTML 19.6KB 传输，文字/布局/CSS 变量全部即时；WebGL canvas 与 3 个特性视频全部懒启动。SSR 的天空兜底渐变（inline style）保证无 JS 也有天空。
5. 立即可见：导航、条件坞、全部 hero 文案、SSR 渐变天空。渐进出现：logo 的星空/月亮层（`opacity 2s` 过渡）、`logo-reveal` 入场、逐字符浮动、WebGL 精细层、下方 section。
6. Hero 是**动态状态机**而非静态结构：`--tod-brightness` 暗角、`--wave-amp` 波形振幅（随真实小时计算）、logo 图层透明度都是状态的函数。
7. 装饰 vs 真交互：天空/logo/音符是环境装饰（不可交互但随状态变化）；**条件坞滑块、CTA、菜单是真交互**。logo 中部还有一个 `pointer-events-auto` 的隐形圆形热区（悬停触发 shader `iLogoGlow`，实测 DOM）。

**如何不依赖传统 Hero Banner 建立品牌感**：品牌感 = 一个随时会变的视觉系统本身。没有产品截图、没有价值主张大图，"ephemera" 文字的颜色就是此刻的天空色——**产品概念（条件驱动的音乐）与网站视觉（条件驱动的界面）完全同构**。

---

## 7. Interaction Reverse Engineering（实测记录）

| # | 交互 | 触发 | 初始态 | 过渡 | 终态 | 时长/easing | 受影响属性 | 反馈/目的 | 类型 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **时间滑块拖拽** | pointerdown+drag | 6px 细轨，10px 白柄 | 拖动中柄放大 10→18px、轨膨胀 6→24px、柄发光 `0 0 12px var(--tod-color-alpha)`；松手 `left 0.2s ease-out` | 全站 tod 色/问候/hero/亮度更新 | 拖动即时；hover 膨胀 0.2s；主题过渡 1s | `--tod-color(-rgb/-text)`、`--tod-brightness`、问候文本、logo 图层 | 移动端 `navigator.vibrate(10)`（hapticTick，实测 JS）；"Live"标签变"Manual:" + 出现 "Reset to live" | spatial + state |
| 2 | 滑块键盘操作 | 方向键/Home/End | — | 步进 1h（天气/季节按档位） | aria-valuetext 更新 + 全站主题更新 | 0.2s ease-out | 同上 | `aria-live="polite"` 播报 "Now viewing: dusk"（实测 DOM） | state interaction |
| 3 | 天气/月相/季节滑块 | 同上 | 同上 | snap 到档位 | 11 态天气/8 相月/4 季 | 0.2s | 天气影响氛围层与音频描述；季节重写卡片表面色 | 同上 | state |
| 4 | 导航下拉 | hover | opacity 0, pointer-events none | 纯 opacity | opacity 1, aria-expanded | **0.15s**（实测） | opacity | 无位移、快速、不抢注意力 | hover |
| 5 | 导航链接 hover | hover | 白/60 文字 | 颜色 + 中心展开下划线 | 白/90 + 1.5px tod 色下划线 | 0.3s ease-out | color, transform: scaleX | 低摩擦反馈 | micro |
| 6 | 菜单链接 hover | hover | 原位 | `translate-x-0.5`（2px 右移） | 右移 + bg-white/5 | 0.2s | transform, background | "可进入"感 | micro |
| 7 | 卡片 hover（.tod-glass） | hover | border alpha .12 | 边框/阴影加深（medium 档实测另有规则） | border 高亮 + 阴影加深 | 0.3s transform / 1s 色彩 | border-color, box-shadow, transform | 玻璃片被"点亮" | hover |
| 8 | 逐字符副标题滚动消散 | scroll | 波形浮动 | 字符按 hash 散射：translate + rotate + scale(0.6) + blur(2px) + opacity→0.1 | 消散 | 随滚动进度连续 | transform, opacity, filter | hero 让位给内容的方式是"消散"而非"滚走" | scroll-driven |
| 9 | Live 指示灯 | 常态 | — | `animate-pulse`（绿点） | — | 循环 ~2s（`estimated`） | opacity | 实时感的最小信号 | ambient |
| 10 | "Tour All Conditions" | click | — | `tour-button-glow` 呼吸光 + 自动按 20s 巡演 4 个滑块 | 依次展示 24h/11 天气/8 月相/4 季 | 20s 总时长（title 文案注明） | 滑块值 | 引导发现核心机制 | state/navigation |
| 11 | 特性视频 | 进入视口/hover | `preload="none"`，无 src | JS 按需挂载播放 | 视频替身图动起来 | 即时 | video src | 重资源按需 | scroll/state |
| 12 | Beta 公告条 Dismiss | click | 显示 | 移除 | 隐藏 | `estimated` 0.3s | height/opacity | 用户控制 | state |

---

## 8. Motion System（115 个 keyframes 的分类逆向）

**实测分类**：
- **A. 用户触发**：下拉淡入 0.15s、下划线 0.3s、滑块柄 0.2s、卡片 hover 0.3s/1s、菜单项 2px 位移 0.2s。特征：**短、小、只动 transform/opacity/color**。
- **B. 页面进入**：`logo-reveal`（logo 揭幕）、hero 文字 `opacity 0→1 + translateY(20px)`（transition，非 keyframe）、`scrollRevealUp/Left/Right`（子页面滚动进场）。特征：单次、0.4–1s、ease-out 系。
- **C. Scroll-driven**：hero 文字消散（JS 按滚动进度逐字符变换）、shader `iScrollProgress`（hero 天空随滚出视口淡出）、story 区 sticky 叙事。特征：与滚动位置直接映射。
- **D. Ambient（量最大）**：`logoBreath / logoHaloBreath / breathe / divider-breathe / momentBreathe / starTwinkle / cosmicTwinkle / firefly-pulse / creature-float / dioramaRainDrizzle / dioramaFog / cs-drift-*` 等。特征：**幅度小（1–8px / opacity ±0.2）、周期长（2–8s）、ease-in-out 无限循环、全部可被 reduced-motion 或 `.animation-paused` 暂停**。
- **E. 时间/状态驱动**：主题色 1s 过渡、季节 vine 层 1s opacity 切换、`--wave-amp` 随真实小时、天气条件层（`wt-rain/wt-fog/wt-snow` 系列 keyframes 由天气状态挂载）。

**evidence-backed 的 easing 库存**：`ease-out`（位移）、`ease-in-out`（呼吸）、`cubic-bezier(0.22, 1, 0.36, 1)`（条件坞收起，实测 inline style）——即常见的 easeOutQuint 弹性收尾，未见真 spring 物理引擎（Framer Motion 在 bundle 中存在，主要用于组件级动效）。

**为什么"不卡也不炫技"**：
1. 115 个动画里没有一个是全屏大面积的；最大的是 shader 天空，而 shader 有 `iTier` + 30/60fps 分档 + 滚出视口即停（visibilitychange 暂停实测于 JS）。
2. Ambient 动画全部是 compositor-friendly 的 transform/opacity。
3. 动画有"语义挂载"——雨滴动画只在天气=雨时存在，不空转。
4. 交互反馈永远短于 400ms，ambient 永远慢于 2s，两层从不同时抢注意力。
5. 全局退路：`@media (prefers-reduced-motion: reduce)` 把一切动画压到 0.01ms（45 处规则覆盖每个 keyframe 使用点），且 `body:not(.obs-broadcast)` 例外机制防止录制模式失效。

---

## 9. "Alive Website" 机制（核心逆向）

**状态源（实测）**：
| 状态 | 值域 | 来源 | 驱动什么 |
|---|---|---|---|
| 时间 | 0–24h 连续 | 真实本地时间（每小时阈值更新，thresholdStore/useSyncExternalStore 实测于 JS） | tod 色表插值、hero 天空、`--wave-amp`、问候语、logo 太阳位置、暗角亮度 |
| 天气 | 11 档 | 默认 Clear（外部 API `estimated`：文本含 "Live" 标记但未见网络请求） | 氛围 keyframes（rain/fog/snow）、音频描述 |
| 月相 | 8 档 | 真实月相计算（SSR 预载 `moon_new_moon_icon.png`，实测当天为新月 ✓） | logo 月亮层阴影渐变、shader `iMoonPhase`、图标 |
| 季节 | 4 档 | 真实日期（实测 data-season=autumn，9 月 ✓） | 卡片表面色重写、装饰层（vine/environment）、features 背景渐变 |

**更新机制**：CSS 变量写入 `documentElement` + `data-*` 属性 → 组件层用 `rgba(var(--tod-color-rgb), α)` 与 `[data-season=x]` 选择器响应。**没有组件级重渲染，纯浏览器样式引擎传播**。

**为什么感觉"活着"**（按贡献排序）：
1. **数据真**：季节/月相/时间与用户窗外一致（验证成本低、惊喜感高）；
2. **响应全局且连续**：拖一下滑块，几十个 UI 元素同时渐变 1s——形成"环境变化"而非"元素变化"的知觉；
3. **文案参与**："Good afternoon." / "Live" 绿点 / "Reset to live" 把状态写进语言；
4. **有不可预测性**：`--wtc-t` 随机相位、shader 云的 fbm 演化让每次访问微妙不同；
5. 动画本身贡献反而最小——ambient 动画只是让"活"的状态不静止。

**成本分级**：
- 低成本可复制：时间→色表插值→CSS 变量、问候语、`data-season` 属性主题、Live 徽章、逐时渐变图例。**纯 JS 定时器 + CSS，无渲染开销**。
- 中成本：天气状态机 + 条件氛围层、逐字符文本动画。
- 高成本：GLSL 程序化天空（43KB shader + 分级管理）、合成 logo 图层系统、音频反应 uniform（`iAudioBrightness/Turbulence`，主站未绑定，预留）。

---

## 10. Component System

| 组件 | 解剖 | 状态 | 尺寸/间距 | 排版 | 交互/动效 | 设计语言角色 |
|---|---|---|---|---|---|---|
| **Condition Slider**（条件滑条） | 渐变轨道(6px 胶囊) + 白柄(10px) + 9px uppercase 标签 + 状态行(Live 点 + 值) + 可选 tick 行(mix-blend-difference) | live/manual/demo; hover 膨胀 24px; active 18px 柄 | 宽 `md:w-48` / flex-1 | 10px labels, 10px 值 | pointer capture 拖拽 + 键盘 + vibrate + aria slider | **站点的核心控件**：把"状态可玩"具象化 |
| **tod-glass Card** | 145deg tod 渐变玻璃底 + 1px alpha 边 + 内高光 + 24px 深影 | hover 边框/阴影加深；perf 档降级 blur | radius 16px, gap 24–32px(`estimated`) | H3 + muted 正文 | contain: layout style paint（性能自御） | 一切内容容器的默认皮肤——"漂浮在环境光上的玻璃片" |
| **Eyebrow Label** | `text-[10px] uppercase tracking-widest text-white/30` | — | mb-0.5/mb-3 | 10px | — | 仪器标注；信息分组的低噪声方式 |
| **Primary CTA**（Join Beta） | tod 色系高对比按钮 + 下方 3 行 10px 信任文案 | hover 加深/发光 | `px-? py-3`(`estimated`), radius 12px | 14–16px medium | hover bg 过渡 | 转化按钮被"担保清单"包裹，降阻 |
| **Rainbow-glow Button** | `@property --rainbow-angle` 旋转 conic-gradient 边缘光 | 常态旋转 | 同 CTA | — | 360deg 循环（Houdini 动画，GPU 合成） | 唯一的"彩蛋级"装饰按钮（mega menu 底部） |
| **Nav Item** | 文字 + chevron + 中心下划线 span | hover 展开 scaleX | gap-5/8, pb-0.5 | 14px | 0.3s ease-out | 克制的路标 |
| **Mega Menu Panel** | 145deg tod 玻璃 + 分组 eyebrow + 双行条目(主标题+描述) | opacity 0/1 | min-w 200–320px(`estimated`), px-5 py-3 | 14px/12px | 0.15s 淡入；条目 2px 位移 | 导航也服从环境色 |
| **Moment/Holo Card** | tod conic 全息边 + shimmer 伪元素 | breathe; holo 旋转 | — | — | `@property` 动画 + `.animation-paused` 可暂停 | "纪念 moment"内容的仪式感皮肤 |
| **Video Card** | aspect-video 圆角容器 + `preload=none` video | 未载/播放 | aspect-video | — | 按需挂载 | 重媒体的"占位美学" |
| **Live Badge** | 1.5px 绿点 animate-pulse + "Live" 9px uppercase | — | — | 9px | pulse | 0 成本的实时信号 |
| **Status Line**（"Listening to the sky..."） | 顶部小字 | 随状态换文案 | — | 12–13px(`estimated`) | 淡切 | 人格化状态报告 |

---

## 11. Responsive System（实测 3 视口）

| 维度 | 1280×720 桌面 | 768×1024 平板 | 390×844 手机 |
|---|---|---|---|
| 导航 | 64px 下拉组 | 仍桌面导航（md 断点=768 恰在边界） | 64px + 汉堡（aria-label="Open menu"） |
| H1 | 96px | 72px | 48px |
| 条件坞 | 单行 ~44px(`estimated`) | **133px，换行**（实测） | **92px，换行**（实测），轨道 min-w 33% 保底 |
| Tour 按钮 | 显示 | 显示 | `hidden md:flex` 隐藏 |
| canvas | 全屏 webgl + 2d 音符 | 同 | **canvas 尺寸跟随视口**（实测 382×844），笔记类 2d canvas 保留 |
| hero 高度 | `min-height:100dvh` | 同 | 同（dvh 处理移动地址栏） |
| 排版缩放 | text-5xl→7xl→8xl 阶梯 | 中档 | 最档 |
| 性能档 | high/medium（实测 medium） | medium | low/medium（检测逻辑：<640px→low，res 0.5, 30fps；实测 IAB 报 medium 因 screen.width 按物理屏） |

**保留 vs 简化**：
- **保留**：条件坞全部 4 滑块（换行而非砍功能——**移动端不做功能阉割，只做密度压缩**）、季节主题、Live 语义、呼吸动画、WebGL 天空（降档不取消）。
- **简化**：Tour 自动巡演隐藏、blur 半径减半、分辨率 0.5×、目标 30fps、hover 态自然消失（触屏走 tap）。
- **避免"桌面缩小版"**的手段：条件坞从"一行图例"重组为"可触控的多行滑块组"；dvh 替代 vh；haptic 触觉反馈只在触摸设备有意义；断点 640/768/980/1024/1280/1536 全部服务于密度而非裁剪内容。

---

## 12. Performance Analysis（实测）

**传输体积（首次访问，HTTP 压缩后，实测 Performance API）**：
- 文档 HTML：19.6KB（99.7KB 原始）
- JS：45–46 个 chunk，约 **493KB**（最大单块 71KB）——偏重的部分是 React/Next + Framer Motion + 条件引擎
- CSS：2 个文件约 **73KB**（一个 15.9KB 基座 + 一个 258KB 原始/45KB 传输的 Tailwind 全量 + 组件层）
- 图片：62 个请求仅 **60KB**（懒加载 + next/image webp + 尺寸约束；logo 两张最大 94KB/78KB）
- 字体：woff2 自托管，最大 48KB
- **总计 ≈ 911KB**；DCL 3.2s / Load 10.5s（IAB 受控环境，`estimated` 真实骨干网更快）

**首屏快的 6 个原因（实测）**：
1. 关键 CSS 2 个文件 + HTML 内联 RSC，无阻塞第三方（**零第三方脚本**——无分析/无 cookie，资源列表全部第一方）
2. `fetchPriority="high"` 预载 logo webp（imageSrcSet 1x/2x）+ 预载月相图标（首帧状态正确）
3. 文本/布局不依赖任何重资源；天空有 inline CSS 渐变兜底
4. 视频全部 `preload="none"`（实测无 src 挂载）
5. script 全部 async + `fetchPriority="low"`（框架脚本）
6. 字体 next/font 自托管 + subset

**动画实现分工**：CSS 承担 ~95%（115 keyframes + transition + Houdini @property）；JS 只做滚动映射（波形文字消散）、状态引擎、canvas 绘制。WebGL2 仅 1 个常驻（hero），story/features 的 canvas **不在视口不渲染**（实测 0 visible）；`visibilitychange` 暂停（实测 JS 监听）。

**性能分级系统（实测 JS 逆向，工程上最值得抄的部分之一）**：
```
无 WebGL → tier=fallback（纯 CSS 兜底）
navigator.connection.saveData → fallback
GPU 字符串: Apple m1/m2/m3 或 agx → high；intel/mesa/swiftshader/llvmpipe → 压档
移动: 屏宽<640 → low (resolutionScale 0.5, targetFPS 30)；否则 medium (0.75, 60)
桌面: GPU 弱或 cores≤4 → medium (0.85)；否则 high (1, 60)
→ 写入 <html data-perf-tier="...">，CSS/JS/shader(iTier) 三层各自降级
```

### 可复制但轻量 vs 视觉强但昂贵 矩阵

| 效果 | 实现 | 成本 | 移动风险 |
|---|---|---|---|
| tod 色系统 + 季节属性主题 | CSS 变量 + data-* | **极低** | 无 |
| 逐时渐变滑条/图例 | inline linear-gradient | 极低 | 无 |
| 呼吸/漂浮 ambient | CSS keyframes | 低 | 低（数量控制） |
| 逐字符波形文字 | CSS + 每字符 span | 低-中 | 中（span 数量） |
| Houdini conic 旋转 | @property + CSS | 低（仅新浏览器） | 低 |
| 玻璃拟态 | backdrop-filter | 中 | **中-高**（perf 档降级） |
| 滚动消散文字 | JS + per-char style | 中 | 中 |
| 程序化天空 shader | WebGL2 43KB GLSL | **高** | 高（需分级/降帧） |
| 合成 logo 图层系统 | 4 图层 + blend modes + JS 姿态 | 中 | 中 |
| 音频反应渲染 | WebAudio + shader uniform | 高 | 高（未在主站启用） |

---

## 13. Accessibility

**做对的（实测）**：
- Skip to content 链接；`main#main-content` 地标
- 条件滑块 = 完整 `role="slider"` + `aria-valuemin/max/now/valuetext` + 键盘（方向/Home/End）+ `aria-live="polite"` 播报
- 语义 sr-only 状态文本（"Now viewing: midday"）
- `focus-visible` 全局 outline（tod 色）； dismissal 按钮 aria-label；img alt（月相图标有 alt）
- `prefers-reduced-motion` 全覆盖（45 处）+ `prefers-contrast:more` 规则存在
- 触控目标：滑块 hover 后 24px 高、柄 18px（勉强达标）；按钮 py-3

**实验性设计带来的可用性风险（诚实清单）**：
1. **动态对比度**：tod 色在 0–24h 内变化，低亮度时段（#201B3A）文字对比度接近 WCAG AA 下限（`estimated`，需逐色验证）；暗角与 `text-shadow-hero` 进一步压缩对比。
2. 大量 `text-white/30–45` 的 9–10px uppercase 标签——低于 4.5:1（`estimated`），是"氛围优先"的取舍。
3. 滑块默认状态是"Live"，用户拖动可能误以为会改动服务器状态（文案 "Manual:" + "Reset to live" 是补救）。
4. 逐字符 span 破坏文本连续性——已用 `aria-label` 在父级 + `aria-hidden` 逐字符修复（实测，做法值得学习）。
5. 45 个 button 的 mega menu 对屏幕阅读器是长列表（有分组标题缓解）。
6. 触屏无 hover 预览——下拉改为点击（`estimated`，符合惯例）。

---

## 14. Visual DNA

**Visual DNA**：低密度 · 高层差（背景环境层 vs 玻璃 UI 层）· 深底 + 单一动态高饱和 accent · 强编辑感（eyebrow 标签、留白、无卡片海）· 实验性来自"状态化"而非"怪排版"——栅格其实是规矩的，**违规的是颜色和时间**。

**Typography DNA**：4 字族分工（圆体=品牌人格 / 无衬线=信任感 / 等宽=仪器感）· 负字距大标题 + 正字距微标签的两极 · 10px uppercase 是系统的"音效" · 字重轻（400–500）。

**Layout DNA**：1280px 规矩容器 + 满屏舞台 section · z-index 五层空间（天空/暗角/内容/坞/导航）· 装饰层故意偏移、内容层严格对齐 · `clamp()` 流式尺寸。

**Motion DNA**：慢呼吸（2–8s）+ 快反馈（0.15–0.4s）双速制 · 只动 transform/opacity/color · ease-out 位移 / ease-in-out 循环 · 一切可暂停可降级。

**Interaction DNA**：直接操纵（拖拽优于点选）· 状态可见（Live/Manual 徽章）· 反馈多层（视觉+触觉+文案）· 可逆（Reset to live）· 键盘完全平行可用。

**Brand DNA**：人格 = 深夜独行的工匠（"Made with insomnia and moonlight"）· 情绪 = 安静的惊奇 · 感知品类 = 乐器/仪器，而非软件。

**三问最终回答**：
- 为什么不像 SaaS？——SaaS 的色板是静态品牌色，它的色板是时间的函数；SaaS 堆卡片，它造舞台。
- 为什么不像 Landing Page？——没有 hero banner、没有特性三栏、没有社会证明墙；第一屏是一个正在运行的环境 + 一个可玩的控件。
- 为什么像"环境"？——页面有照明（暗角×亮度系数）、有天气（氛围层）、有昼夜（色板）、有声音的暗示（音符、波形文字）——网页的四个边界之外，它模拟出了一个世界的其余部分。

---

## 15. What Makes Ephemera Different（一句话版）

**它把"品牌"实现为一个运行时系统，而不是一套静态样式。** 设计系统的最小单元不是组件，而是"状态→变量→全局响应"这条管线；组件只是管线的受益者。

---

## 16. UTRIPLA Adaptation Matrix（A–F 分类）

### A. Directly Adopt（直接借鉴）
1. **CSS 变量状态管线**：`--ut-color-*` 全局变量 + `data-*` 属性选择器，任何组件零成本响应主题
2. **逐时/逐季色表 + 插值函数**（24 项 hex 表 + RGB lerp，约 50 行 JS）
3. **低 alpha 同色系状态法**：hover/active/selected 用同色不同 alpha，省整个状态色板
4. **eyebrow 10px uppercase tracking-widest 标签体系**
5. **perf-tier 检测器**（GPU 字符串 + saveData + cores → data-perf-tier）
6. **prefers-reduced-motion 全局开关 + .animation-paused 类**
7. **首屏无重资源策略**：inline 兜底渐变 + fetchPriority 预载 LCP 图 + preload=none 视频
8. **玻璃卡片 contain: layout style paint** 自御性能

### B. Adapt for Travel（转译后采用）
1. **时间主题 → 目的地当地时间主题**：UTRIPLA 用"目的地的此刻"（当地时间/日出日落/季节）驱动全站色板——用户浏览东京页面是东京的黄昏色，同时开巴黎页面是巴黎的下午色
2. **条件坞 → "目的地此刻"面板**：4 滑块改为当地时间/季节/日出日落位/天气（或旅游旺季指数），可拖动"预览目的地其他时刻"
3. **hero 合成图 → 目的地天空**：用目的地实时日落色渐变 + 该地标志剪影替代 logo 合成
4. **波形逐字标题 → 航线/地名的呼吸字排**（如 "T O K Y O" 浮动）
5. **"Live" 徽章 → "Now in Tokyo" 实时上下文徽章**
6. **Demo 滑块巡演（Tour）→ 目的地时光巡演**（20 秒从清晨到夜晚展示体验变化）
7. **品牌化 404/未上线页 → 品牌化空态**（"这条路线还在路上"）

### C. Do Not Adopt
1. 以"产品即网站"为前提的整体叙事（UTRIPLA 不是 DAW，条件不能是产品的全部）
2. 深底暗色作为唯一主题（旅游决策场景需要明亮/图片主导的表面，且多数 OTA 用户预期浅色）
3. 43KB 手写 GLSL 天空（UTRIPLA 用真实目的地摄影/视频更有说服力，见 D）
4. 音频反应 uniform（无音频场景）
5. 把 CTA 深埋在氛围里（Ephemera 的转化目标是 beta 注册，可以慢；UTRIPLA 有预订/搜索 KPI）

### D. Performance Risk
1. 全屏 WebGL shader（移动 GPU 发热/耗电）——若做，必须复制其 tier/降帧/视口暂停全套
2. 大规模 backdrop-filter 玻璃层（列表页几十张卡片会杀手级掉帧）——仅限每页 1–3 张
3. 逐字符 span 文本动画（长文案产生 DOM 爆炸）——限 hero 一句
4. 合成图层系统（多层 blend mode 大图）——blend 强制离屏合成

### E. SEO Risk
1. 好消息：Ephemera 证明"活站点"与 SEO 不冲突——内容 SSR、菜单预渲染、文本有 aria 修复；UTRIPLA 应照抄这些纪律
2. 风险 1：状态驱动的动态文案（问候/时间）若替代了实质内容，会造成内容空洞——**动态层只做氛围，信息层（目的地/指南/价格）保持静态 SSR**
3. 风险 2：canvas/shader 内不可有内容
4. 风险 3：暗色低对比若用于正文伤害可读性与抓取渲染评分

### F. High Engineering Cost（第一阶段不做）
1. GLSL 程序化天空 + tier 管理（~1–2 人月 `estimated`）
2. 合成 logo/hero 图层姿态系统
3. WebAudio 分析器联动
4. Houdini @property 动效家族（新浏览器 only，收益低）

### 汇总表
| Ephemera Pattern | What it does | UTRIPLA Adaptation | Priority | Risk |
|---|---|---|---|---|
| CSS 变量状态管线（--tod-*） | 一处状态全站响应 | `--ut-*` + 目的地时区驱动 | P0 | 低 |
| 24h 逐时色表+插值 | 时间→颜色 | 目的地当地时间→城市色板（每城市一组 24 色） | P0 | 低 |
| 条件坞滑条组 | 可拖的状态预览 | "目的地此刻"面板（时间/季节/天气/日出日落） | P1 | 中 |
| data-season 季节表面色 | 季节重写组件色 | 目的地季节主题（春樱/夏海/秋枫/冬雪表面色） | P1 | 低 |
| Live 徽章 + 动态问候 | 状态写进文案 | "Now in {city}" 实时上下文 | P1 | 低 |
| 玻璃卡片 tod-glass | 内容容器皮肤 | 仅用于浮动搜索/时差卡等 ≤3 处 | P2 | 中 |
| eyebrow 标签体系 | 信息分组 | 直接采用（行程段/税费/时差标注） | P0 | 低 |
| 呼吸 ambient 动画 | 页面活性 | 目的地页面少量启用（日出光晕呼吸） | P2 | 低 |
| 逐字符波形标题 | 品牌句动画 | 仅用于城市名/口号一句 | P2 | 中 |
| WebGL 程序化天空 | 环境渲染 | **不做**；用真实目的地影像 | ❌ | 高 |
| perf-tier 分级器 | 设备自适应 | 直接移植（用于图片/动效档位） | P0 | 低 |
| reduced-motion 全覆盖 | 可访问性 | 直接移植 | P0 | 低 |
| 品牌化 404/空态 | 人格延续 | "路线还在路上"空态 | P1 | 低 |
| alpha 同色状态法 | 状态色板 | 直接采用 | P0 | 低 |
| 首屏零重资源策略 | LCP 纪律 | 直接采用（含 inline 渐变兜底） | P0 | 低 |

---

## 17. UTRIPLA 页面级映射

**1. Home**：借鉴"一屏一概念"的舞台节奏与"环境先行"（首屏 = 地球此刻的晨昏线或用户所在时段的天空色 + 一句动态文案），条件坞缩小为"目的地此刻"入口胶囊；SEO：价值主张/目的地索引全部 SSR 静态文案。保持极简：首屏 CTA ≤2。
**2. Destination**：最该"活"的页面——整页主题色 = 目的地此刻太阳位置（逐时色表）；hero = 目的地实时/黄金时刻影像 + "Now in Kyoto: 6:42 PM, dusk" 状态行；拖动时间轴预览"清晨的京都 vs 深夜的京都"。内容主体（指南/季节/交通）静态 SSR。
**3. City**：同 Destination 但密度更高：街区卡用 alpha 同色状态法 hover；eyebrow 标签标注时差/电源/语言（仪器标注感的最佳落点）。
**4. Experience**：体验详情页借鉴"Demo/可玩优先"——把地图/日程做成交互物件，视频 preload=none + 海报占位；价格/库存必须是静态可见（转化底线）。
**5. Route**：路线页借鉴波形文字/逐段动效：路线各段按当日时刻着色（出发段晨色→到达段暮色），滚动时路线像时间轴展开（scroll-driven，CSS scroll-timeline 或轻 JS）。
**6. Travel Guide**：编辑型排版主场——eyebrow + Plus Jakarta 式标题层级 + 左右交替 scroll reveal；氛围降到最低（阅读页）。
**7. Hotel / Stay**：借鉴信任清单（CTA 下的三行担保文案模式）与图片纪律（fetchPriority 首图 + preload=none 其余）；不引入氛围动画（决策页）。
**8. Flight / Get There**：借鉴条件滑条做"出发时间对到达当地时刻的影响"滑块（红眼 vs 白天航班的到达体验预览）——把 Ephemera 最强的交互转译成真实旅行决策工具。
**9. Explore**：借鉴 mega menu 的分组 eyebrow + 双行条目（目的地 + 一句话），以及 0.15s 淡入的克制。
**10. Search / Discovery**：借鉴 alpha 状态法 + Live 徽章（"价格实时"），禁用重动效；骨架屏用 skeletonShimmer（其 CSS 已有，低成本）。

---

## 18. Final UTRIPLA Design Principles

1. **Local time is the brand**——UTRIPLA 的主题色来自目的地的此刻，不是营销部门的 VI。
2. **One state, many responses**——状态只写一次（CSS 变量），让浏览器样式引擎传播，不做组件级重绘。
3. **The interface is a place, not a document**——用层差与照明（暗角/环境层）制造空间，用留白给环境呼吸。
4. **Ambient slow, feedback fast**——氛围动画 ≥2s 周期，交互反馈 ≤400ms，两者永不同时抢戏。
5. **Every animation has a state owner**——动画挂载在状态上（如雨天才有雨），不在状态之外空转。
6. **Gradients can be data**——渐变既可以是图例（时间轴/季节轴）也可以是控件，优先让渐变"有意义"。
7. **Same hue, different alpha**——状态色板用同色不同透明度，全局只认领一个 accent。
8. **Micro-labels carry the craft**——10px uppercase tracking-widest 的 eyebrow 是系统音效，用于一切分组。
9. **Text is alive but content is static**——问候/状态文案可动态，信息内容必须 SSR 静态可抓取。
10. **Drag > click for state exploration**——状态预览优先直接操纵，并给键盘完整平行路径（role=slider + valuetext + live region）。
11. **Always escapable to reality**——任何"手动/预览"状态必须有一键回到"Live/真实"。
12. **Cheap layers first**——一个效果先问 CSS 变量能否做到，再问 canvas；WebGL 只是最后手段且必须带降级。
13. **Detect the device, honor the constraint**——data-perf-tier 式分级（GPU/saveData/核数）决定动效与分辨率，30fps 的完整体验好于 60fps 的卡顿。
14. **Empty states are brand moments**——404/未上线/无结果都值得一句品牌文案。
15. **Motion communicates state, never decorates**——动效只用于表达状态变化（Live 点、主题过渡、消散让位），纯装饰动效压缩到每页 ≤2 个。
16. **Contrast is the floor, atmosphere is the ceiling**——先满足 AA 对比，再谈氛围；暗角与发光不允许压过正文可读性。
17. **Heavy media waits for intent**——视频 preload=none、canvas 视口外不渲染、tab 隐藏即暂停。
18. **The site should feel like the destination, not like a travel site**——拒绝 OTA 卡片海；用地方的光线、时间和季节代替通用蓝色信任感。

---

## 19. Priority Matrix

| | 低工程成本 | 中工程成本 | 高工程成本 |
|---|---|---|---|
| **高视觉/体验收益** | CSS 变量管线 + 逐时色表（P0）；eyebrow 体系（P0）；alpha 状态法（P0）；品牌化空态（P1）；Live 徽章（P1） | "目的地此刻"条件坞（P1）；季节表面色（P1）；目的地时间轴滑块·航班版（P1） | 目的地晨昏线首页（P2，需影像管线） |
| **中收益** | reduced-motion/perf-tier 移植（P0）；首屏零重资源纪律（P0） | 逐字符城市名动画（P2）；玻璃卡片 ≤3 处（P2） | — |
| **低收益/不做** | — | scroll-timeline 路线页（P2，先验证） | GLSL 天空、WebAudio 联动、合成图层系统（❌） |

---

## 20. Ephemera 最值得 UTRIPLA 借鉴的 10 个 UI 模式

1. **状态→CSS 变量→全局响应管线**（--tod-* 家族 + data-season 属性主题）
2. **24 小时逐时色表与插值**（时间即色板，附语义描述的工程化色值管理）
3. **Conditions Dock**：一组 role=slider、键盘可用、带 Live/Manual 模式和 Reset 的"可玩状态面板"
4. **alpha 同色系状态法**（hover/active/border 全部 = accent × 不同 alpha）
5. **10px uppercase tracking-widest eyebrow 标签体系**
6. **"Live" 绿点徽章 + 动态问候语**（最小成本的存在感信号）
7. **零第三方脚本 + inline 渐变兜底 + fetchPriority 预载**的首屏纪律
8. **data-perf-tier 设备分级**（CSS/JS/shader 三层各自降级）
9. **prefers-reduced-motion 全局覆盖 + .animation-paused 暂停机制**
10. **品牌化空态/404/未上线页**（"This page drifted away."）

## Ephemera 最不应该被 UTRIPLA 复制的 10 个模式

1. **深色为主的全站基调**（旅游决策需要明亮、影像主导的界面）
2. **43KB 手写 GLSL 程序化天空**（成本/功耗/维护三高，且真实目的地影像对旅游更有说服力）
3. **合成 logo 多图层混合系统**（blend mode 强制离屏合成，移动端代价大）
4. **逐字符 span 文本动画的滥用**（DOM 爆炸，仅限单句）
5. **把核心叙事全部交给氛围**（Ephemera 可以，因为产品=氛围；UTRIPLA 的核心叙事是目的地内容）
6. **大面积 backdrop-filter 玻璃卡阵列**（列表页性能杀手）
7. **低对比 micro-label 用于关键信息**（white/30 只能用于装饰性分组，不能用于价格/时间）
8. **CTA 让位于氛围**（Ephemera 的转化是 beta 注册可以慢热；预订/搜索必须始终一步可达）
9. **Houdini @property 动效家族**（浏览器兼容面窄，收益小）
10. **WebAudio 反应式渲染预留**（无对应场景）

## UTRIPLA 推荐的第一阶段 UI 技术策略

| 技术 | 用途 | 策略 |
|---|---|---|
| **CSS 变量 + data-* 选择器** | 主题/状态管线的一切 | **主力**。目的地时区→逐时色表插值→写变量；季节→属性主题 |
| **CSS keyframes/transition** | 全部 ambient + 交互反馈 | **主力**。≥95% 动效；配 reduced-motion 与 perf-tier 开关 |
| **Framer Motion（少量）** | 组件进出/布局动画（列表重排、面板） | 有限使用；优先 CSS 能等价实现的场景不用它 |
| **SVG** | 地图剪影、日出日落弧线、月相图标 | **主力**。声明式、可 SSR、无渲染循环 |
| **轻量 JS（IntersectionObserver + rAF）** | 滚动显现、视口外暂停、逐时插值定时器 | 主力，<5KB 自研即可 |
| **Canvas 2D** | 首页晨昏线粒子等单一 ambient | 谨慎；每页 ≤1 个，视口外停帧 |
| **WebGL/GLSL** | — | **第一阶段禁止** |
| **视频** | 目的地影像 | preload=none + 海报 + 交互/视口触发；H.265/AV1 + webm 双源 |
| **图片** | 目的地摄影主角 | next/image 全托管：AVIF/WebP、尺寸约束、fetchPriority 旗舰首图、其余懒加载 |

一句话：**第一阶段用 "CSS 变量 + SVG + 轻量 JS" 复制 Ephemera 80% 的"活着"感，把剩下的 20%（WebGL/音频）留给第二阶段。**

---

## 附录：实测清单

- **URL**：浏览器深测 `/`（3 视口）；静态分析 `/almanac /demo /instruments /dimensional /press /roadmap(404)` + 2 个 CSS + 21 个 JS chunk + hero.frag.glsl + RSC 内载数据
- **Viewport**：1280×720 / 768×1024 / 390×844
- **交互**：时间滑条拖拽（含全站主题联动验证）、键盘方向键、导航 hover 展开、滚动行为、canvas 帧率采样（61fps）、视频懒加载状态检查
- **UI 层**：DOM 结构 / computed styles / CSS 变量运行时值 / data-* 属性 / inline style / GLSL uniforms / 性能分级 JS 逻辑
- **性能因素**：传输体积分类统计、资源瀑布 initiatorType、字体策略、图片策略、视频 preload、canvas 上下文类型与可见性、visibilitychange 处理、第三方脚本计数（=0）
- **主要结论**：Ephemera 的差异化 = "状态驱动的全局主题管线 + 克制的双速动效制 + 编辑型排版"，全部建立在一套可低成本移植的 CSS 变量架构上；WebGL 只是它的奢侈层而非核心。

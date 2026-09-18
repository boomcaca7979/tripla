# UTRIPLA Wave 2 — 最终验收报告（Attraction / Hero 图片）

- **日期**：2026-09-18
- **范围**：Wave 2 新增 50 座城市 × 6 个景点 = **300 张 Attraction 图**，+ **50 张 Hero 图**
- **权威来源**：本仓库源码（`src/data/attractions-wave2.ts`、`src/data/destination-gallery-wave2.ts`、`src/data/destinations-extended-f.ts`）
- **图片口径**：真实、城市正确、景点正确、短边 ≥ 1080px（尺寸一律以**字节实测**为准，不假设）、无 AI / 水印 / 占位图
- **未执行**：未 commit、未 push、未 deploy

---

## 1. 结论

| 项目 | 结果 |
| --- | --- |
| **Attraction** | **297 / 300 PASS**，3 FAIL |
| **Hero** | **50 / 50 PASS**，0 FAIL |
| 结构完整性 | 50 城 × 6 景点 = 300，结构未改动、景点身份未删除 |
| 素材可达性 | **300/300 + 50/50 全部 HTTP 可达并完成字节实测**（本轮独立复测） |
| 分辨率（短边 ≥ 1080） | Attraction **299 / 300**；Hero **50 / 50** |
| 短边分布 | min 529 / max 2880 / avg 1538（n = 350） |
| 署名清单 | `COMMONS-ATTRIBUTION.md` **315 行，0 条 UNRESOLVED** |
| 工程验证 | `tsc --noEmit` 0 错；`next build` **1318 / 1318** 页成功；运行时 50/50 路由 200 |

本轮由**中间态 293/300 + 10 项 FAIL** 修正至 **297/300 + 3 项 FAIL**。仍未通过 3 项均为**来源侧确实无合格图**，而非未检索。

---

## 2. 本轮纠正的状态问题

### 2.1 Tanjung Aru Beach 的报告矛盾 —— 已核实，判为 PASS

- **原矛盾**：报告中同时存在「NO_CANDIDATE / FAIL」状态与一个候选图 URL + `1920×1280` 尺寸记录，二者互斥。
- **处理**：对候选图完成最终证据核验（实际下载 → 解析字节尺寸 → Commons API 元数据 → 目检主体）。
- **核验结论**：

| 项目 | 结果 |
| --- | --- |
| 文件 | `Tanjung_Aru_beach_sunset_view.jpg` |
| Commons 描述 | "Tanjung Aru beach sunset view at Kota Kinabalu." |
| 原始尺寸 | 4272 × 2848 |
| 许可 / 作者 | CC BY-SA 4.0 / Cerevisae |
| 主体 | 目检确认为 Kota Kinabalu（Sabah）Tanjung Aru Beach 的日落海滩，**非**邻近海滩或离岛 |
| 旅游展示适配 | 适用（该海滩以日落景观为标志性场景） |
| AI / 水印 / 占位 | 无 |

- **判定**：**PASS**。原 FAIL 的理由（"no verified image found"）与记录中的 URL/尺寸自相矛盾，属错误状态，已更正；同时由 1920px 档位提升至 3840px（3840 × 2560）。

### 2.2 4 个已回滚景点 —— 保留原始身份，图片问题已推进

| 景点 | 处理结果 |
| --- | --- |
| Hobart → Royal Tasmanian Botanical Gardens | **FAIL → PASS**，c.1870 档案照已被 2013 年现代照片替换 |
| Port Louis → Central Market | **FAIL → PASS**，1960s 档案照已被 2008 年现代照片替换 |
| Montego Bay → Doctor's Cave Beach | **保持 FAIL**（来源确无 ≥1080px 图） |
| Montego Bay → Gloucester Avenue (Hip Strip) | **保持 FAIL**（来源确无该街道图） |

回滚只代表「景点身份恢复」，不代表永久接受 FAIL —— 本轮已对 4 项逐一重新检索。

### 2.3 3 个锁定 NO_CANDIDATE —— 重新检索后的结果

| 景点 | 重新检索结果 |
| --- | --- |
| Kota Kinabalu → Tanjung Aru Beach | 找到并核验合格图 → **PASS**（不再沿用 NO_CANDIDATE） |
| Victoria → Seychelles National Botanical Gardens | 找到并核验合格图（2024 年） → **PASS**（不再沿用 NO_CANDIDATE） |
| Victoria Falls → Livingstone Island | 检索后仍无合格图 → **保持 FAIL** |

### 2.4 分辨率重定档（原理由为「Wikimedia 通道不可达」，该前提已失效）

| 景点 | 原 | 现 |
| --- | --- | --- |
| Aswan → Aswan High Dam | 1920px（短边不足，报告记为 1031） | **3840 × 2880** |
| Medellín → Arví Park | 1920px | **3840 × 2159** |
| Medellín → Plaza Botero | 1920px | **3840 × 2129** |

---

## 3. 仍未通过的项目（3 项）与明确原因

### 3.1 Victoria Falls → Livingstone Island — `FAIL`

- **原因**：Commons `Category:Livingstone Island` 共 18 个文件，**全部是 Victoria Falls / Mosi-oa-Tunya 瀑布景观**（属另一处地标，非该岛本身）。唯一确实位于该岛的文件 `Devil's Pool on Livingstone Island.jpg`（4160×3120）为主体人物的个人泳装快照，不适合作为景点展示图。
- **当前使用图**：Mosi-oa-Tunya 瀑布（1920×1440），主体为瀑布而非岛屿。
- **未采用的替代方案及理由**：用瀑布图冒充 → 属「用附近景点」；用人物快照 → 不符合旅游展示要求。二者均被规则禁止。
- **是否降低标准**：否。景点保留，身份未改。

### 3.2 Montego Bay → Doctor's Cave Beach — `FAIL`

- **原因**：Commons 该海滩**仅有两个文件**，`Doctors-Cave-Beach.jpg`（1011×529）与 `DoctorsCaveBeach.jpeg`（768×512），短边**均低于 1080**。`Category:Montego Bay`（47 个文件）与 Commons 检索均无该海滩的现代高分辨率图；Pexels 无该精确景点覆盖。
- **分辨率**：1011 × 529（short side 529）。
- **候选已排除说明**：`Montego Bay, Jamaica (51237059765).jpg`（3264×1836）画面为海滩躺椅/海滩俱乐部，但 Commons 描述仅为泛化的 "Montego Bay, Jamaica"，**无法核验其即为 Doctor's Cave Beach**，依「不得用主体相似图片冒充」规则不予采用。
- **是否降低标准**：否。

### 3.3 Montego Bay → Gloucester Avenue (Hip Strip) — `FAIL`

- **原因**：Commons **没有** Gloucester Avenue / Hip Strip 的任何文件（检索与 `Category:Montego Bay` 均已穷尽）。
- **当前使用图**：`Montego Bay - Between hotels and the city - panoramio.jpg`（1920×1440）经目检为**路边草地/停车带**（一棵开黄花的树、一辆停放轿车、人物坐地），并非海滨商业街。
- **未采用的替代方案及理由**：改用 Montego Bay 其他海滩或街道 → 属「用相邻街区 / 同城市其他地标」，被规则明确禁止。
- **是否降低标准**：否。

---

## 4. 本轮图片变更明细（7 处，全部字节实测）

| 城市 | 景点 | 新素材文件 | 实测尺寸 | 许可 | 作者 |
| --- | --- | --- | --- | --- | --- |
| Aswan | Aswan High Dam | `Aswan_High_Dam-1.jpg` @3840px | 3840 × 2880 | CC BY-SA 3.0 | شرف الدين |
| Kota Kinabalu | Tanjung Aru Beach | `Tanjung_Aru_beach_sunset_view.jpg` @3840px | 3840 × 2560 | CC BY-SA 4.0 | Cerevisae |
| Medellín | Arví Park | `Metrocable_del_Parque_Arví_-_Medellín.jpg` @3840px | 3840 × 2159 | CC BY-SA 4.0 | Alejandro Rojas (SajoR) |
| Medellín | Plaza Botero | `Medellín,_Plaza_Botero,_2023-07_CN-01.jpg` @3840px | 3840 × 2129 | CC BY-SA 4.0 | Steffen Schmitz |
| Port Louis | Central Market | `Herbal_tisanes_..._Central_Market,_Port_Louis,_Mauritius.jpg` @3840px | 3840 × 2560 | CC BY-SA 4.0 | Sushil Dawka |
| Victoria | Seychelles National Botanical Gardens | `Victoria_Mont_Fleuri_Botanical_Garden_asv2024-09_img2.jpg` @3840px | 3840 × 2160（原生 16:9） | Free Art License | A.Savin |
| Hobart | Royal Tasmanian Botanical Gardens | `Hobart_Botanical_Garden_-_panoramio.jpg` @3840px | 3840 × 2560 | CC BY 3.0 | Annette Teng |

替换/新增素材均已写入 `COMMONS-ATTRIBUTION.md`（含新增的 Free Art License 条目）。

---

## 5. 验证记录

**静态与构建**

- `tsc --noEmit`：**0 错误**
- `next build`（隔离副本，避免影响运行中的共享 dev 进程）：**1318 / 1318 页** 生成成功

**运行时（对本次代码的生产构建，`next start` 于独立端口）**

| 检查 | 结果 |
| --- | --- |
| 50 座新城 `/destinations/<slug>` | **50 / 50 → HTTP 200** |
| `/destinations` 列出新城 | **50 / 50** |
| `/guides` 收录新城 | **50 / 50** |
| 目的地链接总数 | **205**（50 新城 + **155 旧城**），旧城路由 **0 个非 200** |
| 6 个变更页面渲染新素材 | **全部 OK**，且**旧素材已不再出现** |
| 3 个 FAIL 槽位未被静默换图 | **OK**（Livingstone=瀑布图、Doctor's Cave、Montego Bay 路边图保持不变） |

**素材层独立复测**

- 对 `images_final.json` 中 **350 个最终 URL** 逐一发起请求并解析真实 JPEG 尺寸：
  - Attraction：**300 / 300 可达并实测**，**299 / 300 短边 ≥ 1080**
  - Hero：**50 / 50 可达并实测**，**50 / 50 短边 ≥ 1080**

---

## 6. 说明与边界

1. 本轮**未执行** commit / push / deploy，仓库与线上均未变更。
2. 3 项 FAIL 均为**来源侧无合格图**，而非检索不足；在其原始身份下已保留景点，未删除、未改身份、未用近似图顶替。
3. 分辨率短板 `Doctor's Cave Beach`（1011×529）的成因是 Commons 侧仅存在低分辨率历史文件，无法通过重定档解决。
4. 共享工作区存在其他会话的并发改动；本次生产构建在**隔离副本**中完成，未触碰正在运行的共享构建产物。

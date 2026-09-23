/**
 * home-sections — 首页下半部分（Explore / Understand / Compare / Travel）的
 * **叶子配置层**：只放策展名单与类型，不导入任何数据，server 与 client 共用。
 *
 * 纪律：
 *   · 这里出现的 slug 全部是 src/data/destinations.ts 里**真实存在**的目的地；
 *     图片全部来自这些城市在项目图集（src/data/destination-gallery.ts）里已目检的照片。
 *   · 只回答"首页要展示哪几个真实目的地"，不新造评分 / 排序 / 推荐逻辑。
 *   · 任何数值读数都不在这里 —— 一律来自既有 canonical 气候数据与 HomePlace 视图模型。
 */

/** 首页大图/并置图的一块真实照片（由 lib/home-postcards.ts 在 server 端装配）。 */
export interface Postcard {
  slug: string;
  /** CDN 图片 URL（同一张真实照片的展示尺寸变体，不改照片内容）。 */
  src: string;
  /** 图片真实主体描述（沿用项目图集的 alt，不新写）。 */
  alt: string;
  /** 图片来源标识（诚实署名依据）。 */
  source: string;
}

/** Explore：主视觉城市 + 可切换的真实目的地（顺序 = 展示顺序，第一项为主图城市）。 */
export const EXPLORE_SLUG = "tokyo";
export const EXPLORE_SELECTOR_SLUGS = [
  "tokyo",
  "lisbon",
  "bangkok",
  "kyoto",
  "paris",
  "bali",
] as const;

/** Understand：信息面板城市 + 小地图的邻近半径（大圆距离，真实坐标）。 */
export const UNDERSTAND_SLUG = "lisbon";
export const NEIGHBOUR_RADIUS_KM = 1500;
export const NEIGHBOUR_MAX = 10;

/** Compare：并置比较的三个真实目的地。
    3 = 与 /destinations 的比对上一致（真相源 src/components/destination/vibe-store.ts 的 COMPARE_MAX）。 */
export const COMPARE_SLUGS = ["tokyo", "lisbon", "bangkok"] as const;
export const COMPARE_LIMIT_NOTE = "Up to three destinations — the same limit as the world atlas.";

/** Travel：旅行过程主视觉城市（也是三个真实服务入口所在的目的地页）。 */
export const TRAVEL_SLUG = "bali";

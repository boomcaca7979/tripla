/**
 * home-postcards — 首页 Explore / Understand / Compare / Travel 四段的
 * **图片装配层**（server-only）。
 *
 * 职责边界：
 *   · 只从项目既有图集（src/data/destination-gallery.ts，均为已目检的真实照片）
 *     取图，并把 Pexels CDN 的 `w=` 调到展示所需宽度 —— **不换照片、不生成占位图**。
 *   · 每段用**不同的照片**：同一城市在多段出现时取不同取景，避免整页重复同一张图。
 *   · 输出为可序列化的纯数据，供 client 组件作为 props 接收（图集数据本身不进
 *     client bundle）。
 *
 * 为什么在 server 端装配：destination-gallery 含 179 城、体量以百 KB 计，
 * 必须留在服务端；客户端只拿到当段真正要渲染的那几张 URL。
 */

import { getDestinationGallery } from "@/data/destination-gallery";
import {
  COMPARE_SLUGS,
  EXPLORE_SLUG,
  TRAVEL_SLUG,
  UNDERSTAND_SLUG,
  type Postcard,
} from "./home-sections";

/** 主视觉宽度（大图段：Explore / Understand / Travel）。 */
const HERO_WIDTH = 1800;
/** 并置宽度（Compare 三张）。 */
const ROW_WIDTH = 1200;

/**
 * 取图索引：同一城市有多张已目检照片时，用它指定本段使用哪一张。
 * 索引对应用图集里的**真实照片顺序**（首图 = 该城最具辨识度的照片）。
 */
const HERO_IMAGE_INDEX: Record<string, number> = {
  [EXPLORE_SLUG]: 0, // Aerial view of Asakusa and Sensō-ji pagoda at dusk, Tokyo
  [UNDERSTAND_SLUG]: 0, // Tram climbing a Lisbon street
  [TRAVEL_SLUG]: 2, // Coastline beach view in Bali
};

const COMPARE_IMAGE_INDEX: Record<string, number> = {
  // Compare 刻意避开 Explore / Understand 已用过的那张取景
  tokyo: 2, // Tokyo Skytree above the Sumida River
  lisbon: 1, // View over Lisbon's rooftops and the Tagus
  bangkok: 1, // Wat Arun across the Chao Phraya river
};

/** 把 Pexels CDN 的 `w=` 参数调到目标宽度（同一张图的不同尺寸变体）。 */
function atWidth(src: string, width: number): string {
  return src.replace(/([?&]w=)\d+/, `$1${width}`);
}

function postcard(slug: string, index: number, width: number): Postcard | null {
  const entry = getDestinationGallery(slug)[index];
  if (!entry) return null;
  return {
    slug,
    src: atWidth(entry.src, width),
    alt: entry.alt,
    source: entry.source,
  };
}

export interface HomeSectionImages {
  explore: Postcard | null;
  understand: Postcard | null;
  compare: Postcard[];
  travel: Postcard | null;
}

export function buildHomeSectionImages(): HomeSectionImages {
  return {
    explore: postcard(EXPLORE_SLUG, HERO_IMAGE_INDEX[EXPLORE_SLUG] ?? 0, HERO_WIDTH),
    understand: postcard(UNDERSTAND_SLUG, HERO_IMAGE_INDEX[UNDERSTAND_SLUG] ?? 0, HERO_WIDTH),
    compare: COMPARE_SLUGS.map((slug) =>
      postcard(slug, COMPARE_IMAGE_INDEX[slug] ?? 0, ROW_WIDTH),
    ).filter((p): p is Postcard => Boolean(p)),
    travel: postcard(TRAVEL_SLUG, HERO_IMAGE_INDEX[TRAVEL_SLUG] ?? 0, HERO_WIDTH),
  };
}

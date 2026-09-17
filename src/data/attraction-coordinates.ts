/**
 * attraction-coordinates — Attraction 真实坐标（Wink search/geo 附近酒店用）。
 *
 * 数据口径：
 *   · 仅收录地标类 attraction 的真实公开坐标（WGS84，度）。泛化体验类
 *     （地点随供应商变化的 tour/show，如 Desert safari、Flamenco show）
 *     不造坐标 → 页面诚实显示"暂无附近酒店搜索"，绝不编造。
 *   · 覆盖范围随 Wink 供给城市增量补充（当前：Bangkok / Paris / Dubai /
 *     Barcelona / Lisbon），未收录城市 = 无 geo 能力 → 诚实空态。
 *   · 键 = destination slug + highlights 原文（destinations.ts 唯一真相源，
 *     改 highlight 文案须同步此处）。
 */

export interface AttractionPoint {
  lat: number;
  lon: number;
}

export const ATTRACTION_COORDINATES: Record<string, Record<string, AttractionPoint>> = {
  bangkok: {
    "Grand Palace & Wat Phra Kaew": { lat: 13.75, lon: 100.4913 },
    "Damnoen Saduak floating market": { lat: 13.5203, lon: 99.9583 },
    "Yaowarat (Chinatown) street food": { lat: 13.74, lon: 100.51 },
    "Chao Phraya river cruise": { lat: 13.7439, lon: 100.5101 },
    "Rooftop bars at sunset": { lat: 13.7244, lon: 100.522 },
  },
  paris: {
    "Louvre Museum & Mona Lisa": { lat: 48.8606, lon: 2.3376 },
    "Eiffel Tower at sunset": { lat: 48.8584, lon: 2.2945 },
    "Montmartre & Sacré-Cœur Basilica": { lat: 48.8867, lon: 2.3431 },
    "Seine River evening cruise": { lat: 48.8592, lon: 2.3416 },
    "Café de Flore & Saint-Germain": { lat: 48.8541, lon: 2.3325 },
  },
  dubai: {
    "Burj Khalifa observation deck": { lat: 25.1972, lon: 55.2744 },
    "Dubai Mall & aquarium": { lat: 25.1975, lon: 55.2796 },
    "Gold Souk & Spice Souk": { lat: 25.268, lon: 55.297 },
    "Palm Jumeirah & Atlantis": { lat: 25.1306, lon: 55.1171 },
  },
  barcelona: {
    "Sagrada Família & Park Güell": { lat: 41.4036, lon: 2.1744 },
    "Gothic Quarter & Cathedral": { lat: 41.3839, lon: 2.1766 },
    "La Boqueria market": { lat: 41.3817, lon: 2.1716 },
    "Barceloneta Beach": { lat: 41.3784, lon: 2.1925 },
  },
  lisbon: {
    "Alfama & São Jorge Castle": { lat: 38.9131, lon: -9.133 },
    "Belém Tower & Pastéis de Belém": { lat: 38.6916, lon: -9.216 },
    "Tram 28 through Graça": { lat: 38.9167, lon: -9.1292 },
    "LX Factory & Time Out Market": { lat: 38.7071, lon: -9.1459 },
    "Fado night in Bairro Alto": { lat: 38.9131, lon: -9.145 },
  },
};

export function getAttractionPoint(
  slug: string,
  highlight: string,
): AttractionPoint | undefined {
  return ATTRACTION_COORDINATES[slug]?.[highlight];
}

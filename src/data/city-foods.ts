/**
 * city-foods — Destination 页 Food 模块的数据源。
 *
 * 数据诚信规则：
 *   · 只收录可以确证为该城市代表性的本地菜肴/饮食（common-knowledge 级别的
 *     美食文化，不涉及具体餐厅/价格/营业时间 —— 那些没有真实数据）。
 *   · 没有收录的城市 **不渲染** Food 模块（不编造"特色菜"）。
 *   · 后续如接入真实餐厅/菜单数据，可在此扩展字段（restaurant/price 等）。
 */

export interface CityDish {
  /** 菜名（英文常用名）。 */
  name: string;
  /** 一句话说明（编辑型，不虚构价格/店家）。 */
  note: string;
}

/** slug → 本地菜肴列表。仅覆盖有把握的城市；缺省城市无 Food 模块。 */
export const CITY_FOODS: Record<string, CityDish[]> = {
  tokyo: [
    { name: "Sushi & sashimi", note: "Edomae-style sushi — from conveyor-belt counters to omakase." },
    { name: "Ramen", note: "Rich tonkotsu, shoyu and miso broths; every district has its champions." },
    { name: "Tempura", note: "Lightly battered seafood and vegetables, best served fresh from the fryer." },
    { name: "Monjayaki", note: "Tokyo's own sloppy savoury pancake, a Tsukishima specialty." },
  ],
  shanghai: [
    { name: "Xiaolongbao", note: "Soup dumplings pioneered in Nanxiang, now a Shanghai institution." },
    { name: "Shengjianbao", note: "Pan-fried pork buns with a crisp base and soupy filling." },
    { name: "Benzha (Hong Shao) river shrimp & braised pork", note: "Sweet-savoury Benbang cuisine, the city's home cooking style." },
    { name: "Scallion oil noodles", note: "Cong you ban mian — simple, fragrant Shanghai street classic." },
  ],
  bangkok: [
    { name: "Pad Thai", note: "The riverside classic — tamarind, shrimp and peanuts." },
    { name: "Tom Yum Goong", note: "Hot-and-sour lemongrass soup with river prawns." },
    { name: "Mango sticky rice", note: "Khao niew mamuang — the city's beloved dessert." },
    { name: "Boat noodles", note: "Rich broth noodles from the canal markets." },
  ],
  paris: [
    { name: "Croissant & pain au chocolat", note: "Laminated viennoiserie from the city's boulangeries." },
    { name: "Steak frites", note: "Bistro staple with peppercorn or café de Paris butter." },
    { name: "French onion soup", note: "Caramelised onions, broth, gruyère-capped croutons." },
    { name: "Macarons", note: "The Ladurée-and-Pierre-Hermé skyline of Parisian pâtisserie." },
  ],
  rome: [
    { name: "Cacio e pepe", note: "Pecorino, black pepper and tonnarelli — Roman pasta №1." },
    { name: "Carbonara", note: "Guanciale, egg, pecorino — no cream, the Roman way." },
    { name: "Supplì", note: "Fried rice croquettes with molten mozzarella hearts." },
    { name: "Pizza al taglio", note: "Rome's rectangular, sold-by-weight pizza." },
  ],
  istanbul: [
    { name: "Balık ekmek", note: "Grilled fish sandwiches by the Galata Bridge." },
    { name: "Kebap", note: "İskender and Adana styles anchor the city's ocakbaşıs." },
    { name: "Meze & rakı", note: "The long-table sharing tradition of meyhanes." },
    { name: "Simit & börek", note: "Sesame bread rings and layered cheese pastries." },
  ],
  singapore: [
    { name: "Hainanese chicken rice", note: "The de-facto national dish, hawker-stall perfected." },
    { name: "Chilli crab", note: "Sweet-savoury crab in egg-chilli sauce, with fried mantou." },
    { name: "Laksa", note: "Coconut curry noodle soup — Katong style is canonical." },
    { name: "Kaya toast & kopi", note: "The traditional Singaporean breakfast set." },
  ],
  "hong-kong": [
    { name: "Dim sum", note: "Har gow, siu mai and char siu bao from the city's teahouses." },
    { name: "Roast goose", note: "Cantonese siu mei at its most refined." },
    { name: "Wonton noodles", note: "Springy noodles, prawn wontons, dried-fish broth." },
    { name: "Egg tarts", note: "Portuguese-meets-Cantonese cha chaan teng classic." },
  ],
  seoul: [
    { name: "Korean BBQ", note: "Galbi and samgyeopsal grilled table-side." },
    { name: "Bibimbap", note: "Mixed rice, seasonal namul and gochujang." },
    { name: "Tteokbokki", note: "Chewy rice cakes in spicy-sweet gochujang sauce." },
    { name: "Kimchi jjigae", note: "The everyday stew that anchors Korean home cooking." },
  ],
  barcelona: [
    { name: "Pan con tomate", note: "Pa amb tomàquet — bread, tomato, olive oil, salt." },
    { name: "Patatas bravas", note: "Fried potatoes with spicy brava sauce." },
    { name: "Seafood fideuà", note: "Catalonia's noodle answer to paella." },
    { name: "Crema catalana", note: "The original custard-with-a-burnt-top." },
  ],
  "mexico-city": [
    { name: "Tacos al pastor", note: "Spit-grilled pork with pineapple, a capital institution." },
    { name: "Tlacoyos", note: " masa pockets with beans, cheese and nopales." },
    { name: "Chiles en nogada", note: "Poblano chiles in walnut sauce — patriotic tricolour." },
    { name: "Churros & chocolate", note: "Fried dough dipped in thick hot chocolate, El Moro style." },
  ],
  hanoi: [
    { name: "Phở", note: "Beef noodle soup with star-anise broth — Hanoi is its home." },
    { name: "Bún chả", note: "Grilled pork with rice vermicelli and dipping broth." },
    { name: "Bánh cuốn", note: "Steamed rice rolls with minced pork and wood-ear." },
    { name: "Cà phê trứng", note: "Egg-coffee, a Hanoi invention from the 1940s." },
  ],
};

/** 是否有该城市的真实美食数据（无数据 → 页面不渲染 Food 模块）。 */
export function hasCityFood(slug: string): boolean {
  return Boolean(CITY_FOODS[slug]?.length);
}

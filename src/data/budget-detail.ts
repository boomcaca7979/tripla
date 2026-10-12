/**
 * Per-destination budget detail — opt-in, evidence-backed tier data.
 *
 * 设计约束（2026-10-12）：
 *  - 仅当城市在此处有条目时，/travel-budget/<slug> 渲染三档真实分项；
 *    其余城市继续走原有 budgetPerDay + 通用比例渲染，行为不变。
 *  - 所有数字必须可溯源：japantripcost / tokyotourism.org 2026 年东京
 *    住宿与餐饮实价区间、Shibuya Sky 官方票价、open.er-api.com 汇率。
 *    不引入任何"游客调查"或编造均值。
 *  - 档日总价 = 分类区间相加（JPY），USD 按当日汇率换算并注明汇率来源，
 *    不做四舍五入美化。
 */

export interface BudgetCategoryRange {
  /** 分类显示名。 */
  label: string;
  /** 每日区间（JPY，每人）。 */
  jpy: [number, number];
  /** 说明（含价位依据的简述）。 */
  note: string;
}

export interface BudgetTier {
  key: "economy" | "comfort" | "premium";
  label: string;
  /** 该档在东京的典型说法（给用户对照自己）。 */
  profile: string;
  categories: BudgetCategoryRange[];
  /** 档日总价（JPY）= 分类相加；USD 由页面按汇率换算。 */
  dailyTotalJPY: [number, number];
}

export interface BudgetSource {
  /** 数据来源描述。 */
  label: string;
  url: string;
}

export interface BudgetDetail {
  slug: string;
  /** 数据核对时间（用于页面展示"截至"口径）。 */
  checkedAsOf: string;
  /** 汇率说明（含来源与日期）。 */
  fxNote: string;
  /** 使用的汇率（USD→JPY）。 */
  fxRate: number;
  /** 口径声明：每人每日、含住宿、不含国际机票。 */
  scope: string;
  tiers: BudgetTier[];
  /** 城市专属省钱建议（替换通用模板贴士）。 */
  tips: string[];
  /** 本站参考日预算（destination.budgetPerDay）在该档位谱系中的位置说明。 */
  referenceNote: string;
  sources: BudgetSource[];
}

const TOKYO_TIERS: BudgetTier[] = [
  {
    key: "economy",
    label: "Economy",
    profile: "Hostel dorm or capsule hotel, konbini breakfasts, ramen and teishoku lunches, free sights",
    categories: [
      {
        label: "Accommodation",
        jpy: [3000, 6000],
        note: "Hostel dorms ¥3,000–5,000, capsule hotels ¥3,000–6,000 (Nine Hours / First Cabin class)",
      },
      {
        label: "Food",
        jpy: [3000, 5000],
        note: "Konbini meals ¥500–900, ramen ¥900–1,500, teishoku lunch sets ¥800–1,200",
      },
      {
        label: "Transport",
        jpy: [800, 1200],
        note: "Metro/JR single rides ¥180–250; a ¥600 Tokyo Metro 24-hour pass covers a sightseeing day",
      },
      {
        label: "Activities",
        jpy: [500, 2000],
        note: "Free tier: Meiji Shrine, Senso-ji, Ueno Park, Shibuya Crossing; occasional ¥500–1,000 ticket",
      },
    ],
    dailyTotalJPY: [7300, 14200],
  },
  {
    key: "comfort",
    label: "Comfort",
    profile: "Business hotel private room, one sit-down meal a day, a paid attraction or two",
    categories: [
      {
        label: "Accommodation",
        jpy: [8000, 15000],
        note: "Business hotels (Toyoko Inn, APA, Dormy Inn) ¥8,000–15,000 per night",
      },
      {
        label: "Food",
        jpy: [5000, 8000],
        note: "Breakfast at the hotel or konbini, casual lunch, izakaya dinner ¥2,000–4,000",
      },
      {
        label: "Transport",
        jpy: [1000, 1500],
        note: "Metro/JR day moves; occasional airport train (Narita Skyliner ¥2,520 is booked separately)",
      },
      {
        label: "Activities",
        jpy: [1500, 3500],
        note: "Typical tickets: Shinjuku Gyoen ¥500, Tokyo National Museum ¥1,000, Shibuya Sky ¥2,700 (online, before 15:00)",
      },
    ],
    dailyTotalJPY: [15500, 28000],
  },
  {
    key: "premium",
    label: "Premium",
    profile: "Upscale hotel, sushi omakase or kaiseki dinners, taxis and premium experiences",
    categories: [
      {
        label: "Accommodation",
        jpy: [40000, 80000],
        note: "Upscale hotels ¥40,000–80,000; top luxury brands ¥100,000+",
      },
      {
        label: "Food",
        jpy: [10000, 30000],
        note: "Sushi omakase and kaiseki dinners run ¥15,000–50,000 per person; casual meals on other days",
      },
      {
        label: "Transport",
        jpy: [2000, 3000],
        note: "Metro plus regular taxi rides (base fare ~¥500–800)",
      },
      {
        label: "Activities",
        jpy: [3000, 8000],
        note: "Premium experiences and shows; Shibuya Sky sunset slot ¥3,400 online",
      },
    ],
    dailyTotalJPY: [55000, 121000],
  },
];

export const BUDGET_DETAIL: Record<string, BudgetDetail> = {
  tokyo: {
    slug: "tokyo",
    checkedAsOf: "October 2026",
    fxRate: 158,
    fxNote: "USD figures converted at ¥158 per USD (open.er-api.com, October 12, 2026). Pay in yen; card acceptance varies at small ramen and yakitori counters.",
    scope:
      "Per person, per day. Includes accommodation, food, local transport and activities. International flights are not included. Ranges are per-night lodging plus same-day spending — not a survey average.",
    tiers: TOKYO_TIERS,
    referenceNote:
      "The reference figure above (120 USD ≈ ¥19,000/day) is tripla's planning default for Tokyo. It sits in the lower half of the Comfort tier — realistic for a business-hotel stay with casual meals, tight if you add omakase or taxis.",
    tips: [
      "Tokyo's accommodation tax is now charged separately at checkout (as of March 2026): ¥100 per person per night on rooms ¥10,000–14,999, ¥200 on rooms ¥15,000 and up — it will not show in the booking price.",
      "A ¥600 Tokyo Metro 24-hour pass beats single tickets once you make four or more metro rides in a day; JR lines (Yamanote) are separate and need a Suica/Pasmo card.",
      "Depachika (department-store food halls like Isetan Shinjuku or Mitsukoshi Ginza) mark bento and sushi boxes down to roughly half price with red labels after 19:00 — an elite cheap dinner.",
      "Skip cherry blossom (late March–mid April), Golden Week and mid-November for hotel rates 20–40% lower; January, June and late August–September are the cheapest windows.",
      "From Narita, the Skyliner (¥2,520, 36 min) is fast but the N'EX and regular JR trains are cheaper; from Haneda the monorail/Keikyu rides cost a few hundred yen — pick the airport by fare, not habit.",
      "Carry some cash: small ramen shops, yakitori stalls and the Golden Gai bars are cash-first, even though most hotels and department stores take cards.",
    ],
    sources: [
      { label: "Tokyo trip cost line items (accommodation, food, transport ranges, 2026)", url: "https://www.tokyotourism.org/tokyo-trip-cost" },
      { label: "Where to stay in Tokyo — hotel price categories & 2026 accommodation tax change", url: "https://www.tokyotourism.org/?p=1602" },
      { label: "Average hotel prices in Tokyo 2026 (hostel/capsule/business hotel ranges)", url: "https://www.japantripcost.com/blog/average-hotel-prices-tokyo-2026" },
      { label: "USD→JPY exchange rate", url: "https://open.er-api.com/v6/latest/USD" },
    ],
  },
};

export function getBudgetDetail(slug: string): BudgetDetail | undefined {
  return BUDGET_DETAIL[slug];
}

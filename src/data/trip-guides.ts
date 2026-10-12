/**
 * Per-trip guide detail — opt-in field notes for individual trips.
 *
 * 设计约束（2026-10-12）：
 *  - 仅当 trip slug 在此有条目时，/trips/<slug> 渲染"逐日衔接/价格/预订/雨天备选"区块；
 *    其余 279 个 trip 页面渲染路径完全不变。
 *  - 价格标注 verified（对官方渠道核实）或 typical（市场常见区间），
 *    绝不声称来自游客调查；无法核实的项目不写价格。
 *  - 行程地面成本（餐饮+活动+市内交通）与住宿分档分开呈现，
 *    避免与 trip.budget（含住宿的全包参考值）重复计算。
 */

export type PriceStatus = "verified" | "typical";

export interface TripGuideCost {
  item: string;
  /** JPY 区间或 "Free"。 */
  price: string;
  status: PriceStatus;
  note?: string;
}

export interface TripGuideDay {
  day: number;
  /** 活动地点之间的交通衔接（时间标注为近似值）。 */
  transit: string[];
  costs: TripGuideCost[];
  /** 预订 / 入场注意事项。 */
  booking: string[];
  /** 天气不佳时的替代安排。 */
  weatherBackup: string;
  /** 当日地面小计（JPY 区间 + USD 换算），不含住宿。 */
  groundTotal: string;
}

export interface TripGuideTotal {
  label: string;
  value: string;
  note?: string;
}

export interface TripGuideDetail {
  slug: string;
  checkedAsOf: string;
  fxNote: string;
  days: TripGuideDay[];
  totals: TripGuideTotal[];
  /** 对原行程的事实性修正（如已闭馆场所），页面如实展示。 */
  itineraryFix?: {
    original: string;
    updated: string;
    reason: string;
  };
  /** 导入规划器的说明（信息性文案，不新增 CTA）。 */
  plannerImport: string;
  sources: { label: string; url: string }[];
}

export const TRIP_GUIDE_DETAIL: Record<string, TripGuideDetail> = {
  "tokyo-3d-foodie": {
    slug: "tokyo-3d-foodie",
    checkedAsOf: "October 2026",
    fxNote: "USD conversions at 1 USD ≈ ¥158 (open.er-api.com, October 12, 2026).",
    days: [
      {
        day: 1,
        transit: [
          "Tsukiji Outer Market: Hibiya Line to Tsukiji or Toei Oedo Line to Tsukijijo, then a short walk (~15–25 min from central Tokyo).",
          "Tsukiji → Meiji Shrine: ~25–30 min — Hibiya Line to Ebisu, JR Yamanote to Harajuku; the shrine gate is a 10-minute forest-path walk from the station.",
          "Meiji Shrine → Harajuku Takeshita Street: 5-minute walk from the shrine's south gate.",
          "Harajuku → Shibuya: 2 min on the JR Yamanote Line, or ~15 min on foot down Cat Street.",
        ],
        costs: [
          {
            item: "Sushi breakfast at Tsukiji Outer Market",
            price: "¥2,000–4,000",
            status: "typical",
            note: "stall prices vary; most counters are cash-first",
          },
          { item: "Meiji Shrine", price: "Free", status: "verified", note: "open sunrise to sunset, no reservation" },
          { item: "Takeshita Street", price: "Free", status: "verified", note: "crepes typically ¥500–800" },
          {
            item: "Ichiran Shibuya ramen dinner",
            price: "¥1,000–1,600",
            status: "typical",
            note: "citywide ramen bowls run ¥900–1,500; order via the ticket machine",
          },
          { item: "Local transit", price: "¥600–1,200", status: "typical", note: "3–5 metro/JR rides; a ¥600 Tokyo Metro 24-hour pass can pay off" },
        ],
        booking: [
          "No reservations needed anywhere on Day 1. Tsukiji is best before 9:00 — queues at popular sushi counters peak early.",
          "Shibuya etiquette: street drinking is banned 18:00–05:00 around the station.",
        ],
        weatherBackup:
          "Rainy day: Tsukiji's market rows are mostly covered, and Shibuya PARCO (Nintendo TOKYO / Pokémon Center, 6F) plus Miyashita Park are short covered hops from the station — swap the shrine's forest walk for an indoor Shibuya block.",
        groundTotal: "¥4,000–6,800 (≈ $25–43), excluding lodging",
      },
      {
        day: 2,
        transit: [
          "Asakusa: Ginza Line to Asakusa — Senso-ji and Nakamise are a 5-minute walk.",
          "Asakusa → Akihabara: ~10–15 min on the Tsukuba Express (direct) or ~20 min via the Ginza Line with one transfer.",
          "Akihabara → Ueno: 4 min on the JR Keihin-Tohoku Line (2 stops).",
          "Ueno → Shinjuku: ~20 min on the JR Yamanote Line.",
        ],
        costs: [
          { item: "Senso-ji Temple & Nakamise-dori", price: "Free", status: "verified", note: "grounds open at all hours; snacks along Nakamise ¥100–500" },
          { item: "Akihabara", price: "Free", status: "verified", note: "arcades and gachapon ¥100–500 per play" },
          { item: "Ueno Park", price: "Free", status: "verified", note: "Tokyo National Museum ¥1,000 (special exhibitions extra) if you want the indoor option" },
          { item: "Izakaya dinner in Shinjuku / Omoide Yokocho", price: "¥2,000–4,000", status: "typical", note: "per person including a couple of drinks" },
          { item: "Local transit", price: "¥600–1,000", status: "typical" },
        ],
        booking: [
          "Senso-ji needs no ticket; the main hall and most stalls close early evening (~17:00).",
          "Ueno's museums close on Mondays — check the museum calendar for your date.",
          "Omoide Yokocho bars are small and cash-first; check prices before sitting.",
        ],
        weatherBackup:
          "Rainy day: Akihabara's game/electronics towers cluster right around the station, and the Tokyo National Museum is fully indoor — keep Senso-ji for a dry hour (the main gate photo works in the rain).",
        groundTotal: "¥3,300–6,500 (≈ $21–41), excluding lodging",
      },
      {
        day: 3,
        transit: [
          "Shinjuku Gyoen: 10-minute walk from Shinjuku Station's south-east exit, or one metro stop to Shinjuku-gyoemmae.",
          "Gyoen → Ginza: ~20 min via the Tokyo Metro (Marunouchi/Tozai connections) or JR Chuo Line to Tokyo Station then metro.",
          "Ginza → Shinjuku: ~15–20 min direct on the JR Chuo rapid line.",
        ],
        costs: [
          { item: "Shinjuku Gyoen", price: "¥500", status: "verified", note: "official admission; closed on Mondays — check the calendar" },
          { item: "Depachika lunch (Isetan Shinjuku / Mitsukoshi Ginza)", price: "¥1,500–3,000", status: "typical", note: "after 19:00 the same halls mark boxes down ~half price with red labels" },
          { item: "Ginza", price: "Free", status: "verified" },
          { item: "Farewell dinner in Kabukicho", price: "¥2,000–3,500", status: "typical" },
          { item: "Golden Gai nightcap", price: "¥500–1,000 cover", status: "typical", note: "per bar; many seat 5–8 people, look for 'no cover' signs" },
          { item: "Local transit", price: "¥600–1,000", status: "typical" },
        ],
        booking: [
          "Venue correction: the Robot Restaurant in the original plan closed permanently in 2020. The same Kabukicho basement now runs the Samurai Restaurant — daytime shows at 10:50 / 14:00 / 16:30, ¥8,000–¥10,000 including a meal or two drinks, 18+ with ID (checked October 2026). If you want the show, rework this day around an afternoon slot; the meal it includes replaces dinner rather than stacking with it.",
          "Shinjuku Gyoen is closed on Mondays — verify for your date.",
        ],
        weatherBackup:
          "Rainy day: Ginza's connected department-store blocks and depachika keep the food day intact indoors; the Samurai Restaurant show is fully indoor if you booked it.",
        groundTotal: "¥4,600–8,000 (≈ $29–51), excluding lodging; add ¥8,000–10,000 for the Samurai Restaurant show (meal included)",
      },
    ],
    totals: [
      {
        label: "Itinerary ground cost, 3 days",
        value: "¥12,000–21,000 (≈ $76–133)",
        note: "food + activities + local transport for this plan. Accommodation and airport trains are separate — no double counting with the figures below.",
      },
      {
        label: "3 nights' accommodation",
        value: "Economy ¥9,000–18,000 · Comfort ¥24,000–45,000 · Premium ¥120,000+",
        note: "per person for hostels/capsules; per room (often shared between two) for hotels. Ranges match the Tokyo budget guide tiers.",
      },
      {
        label: "3-day total per person",
        value: "Economy ≈ ¥21,000–39,000 ($133–247) · Comfort ≈ ¥36,000–66,000 ($228–418)",
        note: "The trip's 360 USD planning figure sits inside the Comfort band; Premium trips run higher and depend on your hotel choice.",
      },
    ],
    itineraryFix: {
      original: "Robot Restaurant show & farewell dinner",
      updated: "Kabukicho farewell dinner & Golden Gai nightcap",
      reason:
        "Robot Restaurant closed permanently in 2020 (verified October 2026). Its successor, the Samurai Restaurant, runs daytime shows only and is kept as an optional booking note instead.",
    },
    plannerImport:
      "This day-by-day plan is importable: the \"Plan this trip\" button at the top opens the planner with Tokyo, the foodie travel style and this route's food / shopping / history interests prefilled — set your dates and generate to make it yours.",
    sources: [
      { label: "Shibuya guide with 2026 ticket prices and street rules", url: "https://selfguidejapan.com/blog/things-to-do-in-shibuya" },
      { label: "SHIBUYA SKY official pricing summary (¥2,700/¥3,400 online, 2-week release)", url: "https://hontojapan.com/shibuya-sky-tickets" },
      { label: "Robot Restaurant closure status & Samurai Restaurant show times/prices", url: "https://www.smallstepsjapan.com/experiences/robot-restaurant-shinjuku" },
      { label: "Samurai Restaurant 2026 schedule, prices, age rules", url: "https://tokyodeepnightlife.jp/?p=673" },
      { label: "Tokyo food price ranges (ramen, izakaya, depachika)", url: "https://japantripcost.com/blog/zh/tokyo-budget-guide" },
      { label: "USD→JPY exchange rate", url: "https://open.er-api.com/v6/latest/USD" },
    ],
  },
};

export function getTripGuideDetail(slug: string): TripGuideDetail | undefined {
  return TRIP_GUIDE_DETAIL[slug];
}

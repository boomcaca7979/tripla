import type { Airport } from "@/types/flight";
import type { WeatherScore } from "@/types/weather";
import type { TravelStyle, TravelInterest } from "@/types/itinerary";

// ── Types ──────────────────────────────────────────────────────────────

export type Region = "Asia" | "Europe" | "Americas" | "Oceania";

/**
 * Destination 字面量输入类型，保留历史字段名（id/bestMonths/image 等）
 * 以便 DestinationsClient 不动。通过 normalizeDestination 派生为规范 Destination。
 */
interface RawDestination {
  id: string;
  city: string;
  country: string;
  region: Region;
  description: string;
  bestMonths: string;
  currency: string;
  /** Tailwind 渐变类，作为无图时的 fallback 背景。 */
  gradient: string;
  /** Optional 远程图片 URL；null 落回 gradient。 */
  image: string | null;
  weatherScore: WeatherScore;
  airport: Airport;
  travelStyle: TravelStyle;
  interests: TravelInterest[];
  /** Phase 2 新增：完整描述（如未提供则与 description 同值）。 */
  longDescription?: string;
  /** Phase 2 新增：最佳旅行季节说明。 */
  bestSeason?: string;
  /** Phase 2 新增：行程亮点（3-6 条）。 */
  highlights?: string[];
  /** Phase 2 新增：推荐天数。 */
  recommendedDays?: number;
  /** Phase 2 新增：每日预算估算（含住宿/餐饮/交通，不含国际机票）。 */
  budgetPerDay?: number;
  /** Phase 2 新增：预算货币代码。 */
  budgetCurrency?: string;
  /** Phase 7.5 新增：内容最后更新日期（YYYY-MM-DD），缺省时使用 2026-07-26。 */
  updatedAt?: string;
  /** Phase 8.4 新增：内容首次发布日期（YYYY-MM-DD），缺省时使用 2026-07-20。 */
  publishedAt?: string;
}

export interface Destination {
  /** 主键 id，与 slug 同值（保留兼容列表页）。 */
  id: string;
  /** URL slug。 */
  slug: string;
  city: string;
  country: string;
  region: Region;
  /** 短描述（列表页用）。 */
  description: string;
  /** 完整描述（详情页 hero / meta description 用）。 */
  longDescription: string;
  /** 月份简写（列表页 badge），保留兼容。 */
  bestMonths: string;
  /** 最佳旅行季节完整说明（详情页用）。 */
  bestSeason: string;
  currency: string;
  gradient: string;
  image: string | null;
  weatherScore: WeatherScore;
  airport: Airport;
  travelStyle: TravelStyle;
  interests: TravelInterest[];
  /** 时区（IANA / IATA 时区），从 airport.timezone 派生。 */
  timezone: string;
  /** 推荐旅行天数。 */
  recommendedDays: number;
  /** 每日预算估算。 */
  budgetPerDay: number;
  /** 预算货币代码（ISO 4217）。 */
  budgetCurrency: string;
  /** 行程亮点。 */
  highlights: string[];
  /**
   * Phase 7.5: 内容最后更新日期（YYYY-MM-DD）。
   * 用于 Article Schema 的 datePublished / dateModified。
   * 无法确认具体修改日期时使用 2026-07-26 固定值。
   */
  updatedAt: string;
  /**
   * Phase 8.4: 内容首次发布日期（YYYY-MM-DD）。
   * 用于 Article Schema 的 datePublished。
   * 默认 2026-07-20。
   */
  publishedAt: string;
}

// ── Mock data ──────────────────────────────────────────────────────────

const RAW_DESTINATIONS: RawDestination[] = [
  {
    id: "tokyo",
    city: "Tokyo",
    country: "Japan",
    region: "Asia",
    description: "Neon-lit streets meet ancient temples.",
    longDescription:
      "Tokyo is a city of contrasts — Shibuya's neon-soaked crossings, the serene Meiji Shrine, world-class sushi at Tsukiji, and centuries-old temples in Asakusa. Whether you're here for food, shopping, or culture, Tokyo delivers at every turn.",
    bestMonths: "Mar-May",
    bestSeason:
      "March to May (cherry blossoms) and October to November (autumn foliage) are ideal. Summers are hot and humid; winters are dry and cool.",
    currency: "JPY ¥",
    gradient: "from-rose-500 to-pink-700",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    weatherScore: {
      overall: 86,
      label: "Excellent",
      breakdown: { temperature: 88, precipitation: 80, wind: 85, sunshine: 90 },
      recommendation: "Mild and mostly sunny — ideal for sightseeing.",
    },
    airport: {
      iata: "NRT",
      icao: "RJAA",
      name: "Narita International Airport",
      city: "Tokyo",
      country: "Japan",
      timezone: "Asia/Tokyo",
      latitude: 35.7647,
      longitude: 140.3864,
    },
    travelStyle: "foodie",
    interests: ["food", "shopping", "history"],
    recommendedDays: 5,
    budgetPerDay: 120,
    budgetCurrency: "USD",
    highlights: [
      "Shibuya Crossing & neon nightlife",
      "Senso-ji Temple in Asakusa",
      "Sushi breakfast at Tsukiji Outer Market",
      "Cherry blossoms in Ueno Park",
      "Meiji Shrine & Harajuku fashion",
    ],
  },
  {
    id: "paris",
    city: "Paris",
    country: "France",
    region: "Europe",
    description: "Romance, art and café culture on the Seine.",
    longDescription:
      "Paris is the world capital of romance and art — the Louvre, Eiffel Tower, Montmartre's cobblestoned lanes, and centuries of café culture along the Seine. A walkable city where every arrondissement feels like its own village.",
    bestMonths: "Apr-Jun",
    bestSeason:
      "April to June and September to October are ideal. Summers are warm and crowded; winters are chilly but festive.",
    currency: "EUR €",
    gradient: "from-indigo-500 to-pink-600",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
    weatherScore: {
      overall: 78,
      label: "Good",
      breakdown: { temperature: 76, precipitation: 72, wind: 80, sunshine: 84 },
      recommendation: "Pleasant spring weather — perfect for long walks.",
    },
    airport: {
      iata: "CDG",
      icao: "LFPG",
      name: "Charles de Gaulle Airport",
      city: "Paris",
      country: "France",
      timezone: "Europe/Paris",
      latitude: 49.0097,
      longitude: 2.5479,
    },
    travelStyle: "cultural",
    interests: ["museums", "food", "history"],
    recommendedDays: 4,
    budgetPerDay: 150,
    budgetCurrency: "EUR",
    highlights: [
      "Louvre Museum & Mona Lisa",
      "Eiffel Tower at sunset",
      "Montmartre & Sacré-Cœur Basilica",
      "Seine River evening cruise",
      "Café de Flore & Saint-Germain",
    ],
  },
  {
    id: "newyork",
    city: "New York",
    country: "USA",
    region: "Americas",
    description: "The city that never sleeps — a concrete jungle of dreams.",
    longDescription:
      "New York City is five boroughs of energy — Midtown skyscrapers, Brooklyn mornings, Broadway lights, and Central Park quiet. From the Met to a $1 slice, NYC delivers culture at every price point.",
    bestMonths: "Sep-Oct",
    bestSeason:
      "September to October is the best — clear skies and mild temperatures. December is festive; summers are hot and humid.",
    currency: "USD $",
    gradient: "from-amber-500 to-red-600",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
    weatherScore: {
      overall: 74,
      label: "Good",
      breakdown: { temperature: 72, precipitation: 70, wind: 78, sunshine: 76 },
      recommendation: "Cool autumn days — great for walking the boroughs.",
    },
    airport: {
      iata: "JFK",
      icao: "KJFK",
      name: "John F. Kennedy International Airport",
      city: "New York",
      country: "USA",
      timezone: "America/New_York",
      latitude: 40.6413,
      longitude: -73.7781,
    },
    travelStyle: "active",
    interests: ["museums", "food", "nightlife"],
    recommendedDays: 5,
    budgetPerDay: 200,
    budgetCurrency: "USD",
    highlights: [
      "Times Square & Broadway shows",
      "Statue of Liberty & Ellis Island",
      "Central Park bike ride",
      "Brooklyn Bridge walk at sunrise",
      "Metropolitan Museum of Art",
    ],
  },
  {
    id: "bangkok",
    city: "Bangkok",
    country: "Thailand",
    region: "Asia",
    description: "Temple spires, floating markets and fiery street food.",
    longDescription:
      "Bangkok is a sensory overload — gilded temples, floating markets, rooftop bars, and the world's best street food. A budget-friendly gateway to Southeast Asia where ancient culture meets modern chaos.",
    bestMonths: "Nov-Feb",
    bestSeason:
      "November to February is cool and dry. Avoid March to May (very hot) and September (heavy rains).",
    currency: "THB ฿",
    gradient: "from-orange-500 to-yellow-600",
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80",
    weatherScore: {
      overall: 81,
      label: "Excellent",
      breakdown: { temperature: 85, precipitation: 78, wind: 76, sunshine: 86 },
      recommendation: "Dry, warm and sunny — a great time to explore the city.",
    },
    airport: {
      iata: "BKK",
      icao: "VTBS",
      name: "Suvarnabhumi Airport",
      city: "Bangkok",
      country: "Thailand",
      timezone: "Asia/Bangkok",
      latitude: 13.69,
      longitude: 100.7501,
    },
    travelStyle: "foodie",
    interests: ["food", "history", "shopping"],
    recommendedDays: 4,
    budgetPerDay: 50,
    budgetCurrency: "USD",
    highlights: [
      "Grand Palace & Wat Phra Kaew",
      "Damnoen Saduak floating market",
      "Yaowarat (Chinatown) street food",
      "Chao Phraya river cruise",
      "Rooftop bars at sunset",
    ],
  },
  {
    id: "london",
    city: "London",
    country: "United Kingdom",
    region: "Europe",
    description: "Royal palaces, world-class theatre and timeless pubs.",
    longDescription:
      "London layers two millennia of history — the Tower of London, Westminster Abbey, modern Tate Modern, and West End theatre. A walkable city of pub culture, royal pomp, and global cuisine.",
    bestMonths: "May-Sep",
    bestSeason:
      "May to September is the mildest and driest. December brings Christmas markets; winters are dark and rainy.",
    currency: "GBP £",
    gradient: "from-slate-700 to-blue-900",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
    weatherScore: {
      overall: 68,
      label: "Good",
      breakdown: { temperature: 65, precipitation: 60, wind: 70, sunshine: 78 },
      recommendation: "Mild with passing showers — pack a light jacket.",
    },
    airport: {
      iata: "LHR",
      icao: "EGLL",
      name: "London Heathrow Airport",
      city: "London",
      country: "United Kingdom",
      timezone: "Europe/London",
      latitude: 51.47,
      longitude: -0.4543,
    },
    travelStyle: "cultural",
    interests: ["museums", "history", "nightlife"],
    recommendedDays: 5,
    budgetPerDay: 180,
    budgetCurrency: "GBP",
    highlights: [
      "Tower of London & Crown Jewels",
      "British Museum (free entry)",
      "West End theatre shows",
      "Borough Market food hall",
      "Westminster & Big Ben",
    ],
  },
  {
    id: "sydney",
    city: "Sydney",
    country: "Australia",
    region: "Oceania",
    description: "Harbour city with iconic opera house and sunny beaches.",
    longDescription:
      "Sydney pairs urban sophistication with outdoor adventure — the Opera House, Bondi to Coogee coastal walk, Blue Mountains day trips, and harbour kayaking. Year-round sunshine and a relaxed beach culture.",
    bestMonths: "Sep-Nov",
    bestSeason:
      "September to November (spring) and March to May (autumn) are perfect. Summers are hot; winters are mild but short days.",
    currency: "AUD A$",
    gradient: "from-sky-500 to-cyan-700",
    image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80",
    weatherScore: {
      overall: 89,
      label: "Excellent",
      breakdown: { temperature: 90, precipitation: 85, wind: 86, sunshine: 95 },
      recommendation: "Sunny and warm — ideal for the harbour and the surf.",
    },
    airport: {
      iata: "SYD",
      icao: "YSSY",
      name: "Sydney Kingsford Smith Airport",
      city: "Sydney",
      country: "Australia",
      timezone: "Australia/Sydney",
      latitude: -33.9399,
      longitude: 151.1753,
    },
    travelStyle: "active",
    interests: ["beaches", "nature", "food"],
    recommendedDays: 5,
    budgetPerDay: 160,
    budgetCurrency: "AUD",
    highlights: [
      "Sydney Opera House & Harbour Bridge",
      "Bondi to Coogee coastal walk",
      "Taronga Zoo & Manly beach",
      "Blue Mountains day trip",
      "Sunrise kayak on the harbour",
    ],
  },
  {
    id: "dubai",
    city: "Dubai",
    country: "UAE",
    region: "Asia",
    description: "Futuristic skyline rising out of the desert sand.",
    longDescription:
      "Dubai is glamour in the desert — the Burj Khalifa, Palm Jumeirah, gold souks, and dune bashing safaris. A luxury hub where ancient Bedouin culture meets 21st-century architecture.",
    bestMonths: "Nov-Mar",
    bestSeason:
      "November to March is the best — warm sunny days and cool evenings. Summers (June to September) are extremely hot (45°C+).",
    currency: "AED د.إ",
    gradient: "from-amber-400 to-orange-700",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
    weatherScore: {
      overall: 82,
      label: "Excellent",
      breakdown: { temperature: 84, precipitation: 92, wind: 78, sunshine: 74 },
      recommendation: "Sunny and dry — great for desert and beach days.",
    },
    airport: {
      iata: "DXB",
      icao: "OMDB",
      name: "Dubai International Airport",
      city: "Dubai",
      country: "UAE",
      timezone: "Asia/Dubai",
      latitude: 25.2532,
      longitude: 55.3657,
    },
    travelStyle: "active",
    interests: ["shopping", "food", "nightlife"],
    recommendedDays: 4,
    budgetPerDay: 250,
    budgetCurrency: "USD",
    highlights: [
      "Burj Khalifa observation deck",
      "Desert safari & dune bashing",
      "Dubai Mall & aquarium",
      "Gold Souk & Spice Souk",
      "Palm Jumeirah & Atlantis",
    ],
  },
  {
    id: "rome",
    city: "Rome",
    country: "Italy",
    region: "Europe",
    description: "Where every cobblestone whispers ancient history.",
    longDescription:
      "Rome is an open-air museum — the Colosseum, Vatican Museums, Pantheon, and Trastevere's pasta joints. Two millennia of history wrapped in Mediterranean sunshine and espresso-fueled afternoons.",
    bestMonths: "Apr-Jun",
    bestSeason:
      "April to June and September to October are ideal. Summers are hot and crowded; winters are mild but rainy.",
    currency: "EUR €",
    gradient: "from-amber-600 to-rose-700",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
    weatherScore: {
      overall: 80,
      label: "Excellent",
      breakdown: { temperature: 82, precipitation: 74, wind: 80, sunshine: 84 },
      recommendation: "Warm Mediterranean days — perfect for piazzas and gelato.",
    },
    airport: {
      iata: "FCO",
      icao: "LIRF",
      name: "Leonardo da Vinci–Fiumicino Airport",
      city: "Rome",
      country: "Italy",
      timezone: "Europe/Rome",
      latitude: 41.8003,
      longitude: 12.2389,
    },
    travelStyle: "cultural",
    interests: ["history", "food", "museums"],
    recommendedDays: 4,
    budgetPerDay: 130,
    budgetCurrency: "EUR",
    highlights: [
      "Colosseum & Roman Forum",
      "Vatican Museums & Sistine Chapel",
      "Trevi Fountain & Pantheon",
      "Trastevere pasta dinner",
      "Borghese Gallery & Gardens",
    ],
  },
  {
    id: "barcelona",
    city: "Barcelona",
    country: "Spain",
    region: "Europe",
    description: "Gaudí dreams meet Mediterranean sea breeze.",
    longDescription:
      "Barcelona is Gaudí's playground — Sagrada Família, Park Güell, Casa Batlló — paired with Gothic Quarter lanes, Mediterranean beaches, and the world's best tapas culture.",
    bestMonths: "May-Jun",
    bestSeason:
      "May to June and September to October are perfect. Summers are hot and crowded; winters are mild but quieter.",
    currency: "EUR €",
    gradient: "from-pink-500 to-orange-500",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80",
    weatherScore: {
      overall: 85,
      label: "Excellent",
      breakdown: { temperature: 86, precipitation: 80, wind: 82, sunshine: 92 },
      recommendation: "Sunny and warm — perfect for beaches and architecture.",
    },
    airport: {
      iata: "BCN",
      icao: "LEBL",
      name: "Barcelona–El Prat Airport",
      city: "Barcelona",
      country: "Spain",
      timezone: "Europe/Madrid",
      latitude: 41.2974,
      longitude: 2.0833,
    },
    travelStyle: "active",
    interests: ["beaches", "history", "nightlife"],
    recommendedDays: 4,
    budgetPerDay: 120,
    budgetCurrency: "EUR",
    highlights: [
      "Sagrada Família & Park Güell",
      "Gothic Quarter & Cathedral",
      "La Boqueria market",
      "Barceloneta Beach",
      "Flamenco show & tapas crawl",
    ],
  },
  {
    id: "singapore",
    city: "Singapore",
    country: "Singapore",
    region: "Asia",
    description: "A futuristic garden city with world-class hawker food.",
    longDescription:
      "Singapore is where futurism meets food — Gardens by the Bay, Marina Bay Sands, hawker centres with Michelin stars, and spotless streets. A tropical city-state that's a gateway to Southeast Asia.",
    bestMonths: "Feb-Apr",
    bestSeason:
      "February to April is the driest. Year-round tropical climate; November to January has the most rain.",
    currency: "SGD S$",
    gradient: "from-emerald-500 to-teal-700",
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80",
    weatherScore: {
      overall: 75,
      label: "Good",
      breakdown: { temperature: 78, precipitation: 65, wind: 78, sunshine: 80 },
      recommendation: "Warm with brief tropical showers — carry an umbrella.",
    },
    airport: {
      iata: "SIN",
      icao: "WSSS",
      name: "Singapore Changi Airport",
      city: "Singapore",
      country: "Singapore",
      timezone: "Asia/Singapore",
      latitude: 1.3644,
      longitude: 103.9915,
    },
    travelStyle: "foodie",
    interests: ["food", "shopping", "nature"],
    recommendedDays: 3,
    budgetPerDay: 180,
    budgetCurrency: "SGD",
    highlights: [
      "Gardens by the Bay & Cloud Forest",
      "Marina Bay Sands SkyPark",
      "Hawker centres (Lau Pa Sat, Maxwell)",
      "Sentosa Island & Universal Studios",
      "Chinatown & Little India",
    ],
  },
  {
    id: "istanbul",
    city: "Istanbul",
    country: "Turkey",
    region: "Europe",
    description: "Where East meets West across the Bosphorus.",
    longDescription:
      "Istanbul is the only city spanning two continents — Hagia Sophia, Blue Mosque, Grand Bazaar, and Bosphorus cruises. A living museum of Byzantine and Ottoman history with one of the world's great culinary scenes.",
    bestMonths: "Apr-May",
    bestSeason:
      "April to May and September to October are ideal. Summers are hot and humid; winters are cold and rainy.",
    currency: "TRY ₺",
    gradient: "from-red-500 to-rose-700",
    image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80",
    weatherScore: {
      overall: 76,
      label: "Good",
      breakdown: { temperature: 75, precipitation: 70, wind: 80, sunshine: 80 },
      recommendation: "Pleasant spring weather for the bazaars and mosques.",
    },
    airport: {
      iata: "IST",
      icao: "LTFM",
      name: "Istanbul Airport",
      city: "Istanbul",
      country: "Turkey",
      timezone: "Europe/Istanbul",
      latitude: 41.2753,
      longitude: 28.7519,
    },
    travelStyle: "cultural",
    interests: ["history", "food", "shopping"],
    recommendedDays: 4,
    budgetPerDay: 70,
    budgetCurrency: "USD",
    highlights: [
      "Hagia Sophia & Blue Mosque",
      "Grand Bazaar & Spice Bazaar",
      "Topkapi Palace & Harem",
      "Bosphorus sunset cruise",
      "Turkish bath (hamam)",
    ],
  },
  {
    id: "seoul",
    city: "Seoul",
    country: "South Korea",
    region: "Asia",
    description: "K-pop, palaces and an electric street food scene.",
    longDescription:
      "Seoul is where Joseon dynasties meet K-wave — Gyeongbokgung Palace, Bukchon Hanok Village, Myeongdong shopping, and Hongdae nightlife. A high-tech capital with deep traditions and the world's best BBQ.",
    bestMonths: "Mar-May",
    bestSeason:
      "April to June and September to November are ideal. Summers are hot and rainy; winters are cold and dry.",
    currency: "KRW ₩",
    gradient: "from-violet-500 to-fuchsia-700",
    image: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80",
    weatherScore: {
      overall: 79,
      label: "Good",
      breakdown: { temperature: 80, precipitation: 74, wind: 78, sunshine: 84 },
      recommendation: "Mild and sunny — perfect for exploring the city.",
    },
    airport: {
      iata: "ICN",
      icao: "RKSI",
      name: "Incheon International Airport",
      city: "Seoul",
      country: "South Korea",
      timezone: "Asia/Seoul",
      latitude: 37.4602,
      longitude: 126.4407,
    },
    travelStyle: "active",
    interests: ["food", "shopping", "history"],
    recommendedDays: 5,
    budgetPerDay: 100,
    budgetCurrency: "USD",
    highlights: [
      "Gyeongbokgung Palace & guard ceremony",
      "Bukchon Hanok Village walk",
      "Myeongdong K-beauty & street food",
      "N Seoul Tower cable car",
      "Hongdae indie music & nightlife",
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────

/**
 * 将 RawDestination 字面量派生为规范 Destination：
 * - slug = id
 * - longDescription = longDescription ?? description
 * - bestSeason = bestSeason ?? bestMonths
 * - timezone 从 airport.timezone 派生
 * - recommendedDays/budgetPerDay/budgetCurrency 提供默认值
 * - highlights 提供基于 city 的兜底
 */
function normalizeDestination(raw: RawDestination): Destination {
  return {
    ...raw,
    slug: raw.id,
    longDescription: raw.longDescription ?? raw.description,
    bestSeason: raw.bestSeason ?? raw.bestMonths,
    timezone: raw.airport.timezone,
    recommendedDays: raw.recommendedDays ?? 3,
    budgetPerDay: raw.budgetPerDay ?? 100,
    budgetCurrency: raw.budgetCurrency ?? "USD",
    highlights: raw.highlights ?? [
      `Explore ${raw.city}`,
      `Experience ${raw.country} culture`,
      `Try local cuisine`,
    ],
    // Phase 7.5: 默认 2026-07-26（无法确认精确修改日期时的固定值）。
    updatedAt: raw.updatedAt ?? "2026-07-26",
    // Phase 8.4: 默认 2026-07-20（无法确认精确发布日期时的固定值）。
    publishedAt: raw.publishedAt ?? "2026-07-20",
  };
}

export const DESTINATIONS: Destination[] = RAW_DESTINATIONS.map(normalizeDestination);

/** 返回所有 destination 的 slug。 */
export function getDestinationSlugs(): string[] {
  return DESTINATIONS.map((d) => d.slug);
}

/** 根据 slug 获取单个 destination，未找到返回 null。 */
export function getDestinationBySlug(slug: string): Destination | null {
  return DESTINATIONS.find((d) => d.slug === slug) ?? null;
}

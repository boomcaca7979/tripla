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
  {
    id: "mexico-city",
    city: "Mexico City",
    country: "Mexico",
    region: "Americas",
    description: "Aztec ruins, world-class museums and an unstoppable food scene.",
    longDescription:
      "Mexico City layers fifteen centuries of history — Aztec temples beside colonial plazas, murals by Rivera and Kahlo, and a food scene that runs from street tacos to restaurants on the World's 50 Best list. Museums, mariachi and markets make it one of the Americas' great cultural capitals.",
    bestMonths: "Mar-May",
    bestSeason:
      "March to May is dry and warm — ideal for walking the centro histórico. June to September brings afternoon thunderstorms; winters are mild and dry.",
    currency: "MXN $",
    gradient: "from-orange-500 to-red-700",
    image: null,
    weatherScore: {
      overall: 78,
      label: "Good",
      breakdown: { temperature: 80, precipitation: 70, wind: 82, sunshine: 82 },
      recommendation: "Mild high-altitude climate — pack a layer for cool evenings.",
    },
    airport: {
      iata: "MEX",
      icao: "MMMX",
      name: "Mexico City International Airport",
      city: "Mexico City",
      country: "Mexico",
      timezone: "America/Mexico_City",
      latitude: 19.4363,
      longitude: -99.0721,
    },
    travelStyle: "cultural",
    interests: ["history", "food", "museums"],
    recommendedDays: 4,
    budgetPerDay: 150,
    budgetCurrency: "USD",
    publishedAt: "2026-08-28",
    updatedAt: "2026-08-28",
    highlights: [
      "Zócalo & Templo Mayor excavations",
      "Museo Nacional de Antropología",
      "Frida Kahlo's Casa Azul in Coyoacán",
      "Teotihuacán pyramids day trip",
      "Taquería crawl in Roma & Condesa",
      "Chapultepec Park & castle",
    ],
  },
  {
    id: "las-vegas",
    city: "Las Vegas",
    country: "United States",
    region: "Americas",
    description: "Neon, shows and desert landscapes beyond the Strip.",
    longDescription:
      "Las Vegas concentrates more entertainment per block than anywhere on earth — residencies and Cirque shows, celebrity-chef restaurants, and the Sphere's immersive canvas — then swaps casino floors for red-rock canyons within a 30-minute drive. Come for the spectacle, stay for the desert.",
    bestMonths: "Mar-May",
    bestSeason:
      "March to May and September to November are pleasant. Summers are extremely hot (often above 40°C); winters are cool with chilly desert nights.",
    currency: "USD $",
    gradient: "from-fuchsia-500 to-purple-700",
    image: null,
    weatherScore: {
      overall: 74,
      label: "Good",
      breakdown: { temperature: 72, precipitation: 88, wind: 75, sunshine: 90 },
      recommendation: "Dry desert air — sunscreen and water are essentials.",
    },
    airport: {
      iata: "LAS",
      icao: "KLAS",
      name: "Harry Reid International Airport",
      city: "Las Vegas",
      country: "United States",
      timezone: "America/Los_Angeles",
      latitude: 36.084,
      longitude: -115.1538,
    },
    travelStyle: "relaxed",
    interests: ["nightlife", "food", "shopping"],
    recommendedDays: 3,
    budgetPerDay: 180,
    budgetCurrency: "USD",
    publishedAt: "2026-08-28",
    updatedAt: "2026-08-28",
    highlights: [
      "The Strip's resorts & Bellagio fountains",
      "Sphere immersive concerts",
      "Fremont Street Experience downtown",
      "Red Rock Canyon scenic drive",
      "Hoover Dam day trip",
      "World-class residencies & shows",
    ],
  },
  {
    id: "austin",
    city: "Austin",
    country: "United States",
    region: "Americas",
    description: "Live music, BBQ smoke and Texas hill country.",
    longDescription:
      "Austin is the self-styled Live Music Capital of the World — honky-tonks on Sixth Street, outlaw country heritage, and festival season that peaks with SXSW and ACL. Between sets: brisket legends, swimming holes, bat flights under the Congress bridge, and hill-country wineries.",
    bestMonths: "Mar-May",
    bestSeason:
      "March to May and October bring mild weather and festival season. Summers are hot (35°C+); winters are mild.",
    currency: "USD $",
    gradient: "from-violet-500 to-indigo-700",
    image: null,
    weatherScore: {
      overall: 77,
      label: "Good",
      breakdown: { temperature: 78, precipitation: 74, wind: 78, sunshine: 88 },
      recommendation: "Warm and sunny — plan lake time in the afternoon heat.",
    },
    airport: {
      iata: "AUS",
      icao: "KAUS",
      name: "Austin-Bergstrom International Airport",
      city: "Austin",
      country: "United States",
      timezone: "America/Chicago",
      latitude: 30.1975,
      longitude: -97.6664,
    },
    travelStyle: "active",
    interests: ["nightlife", "food", "nature"],
    recommendedDays: 3,
    budgetPerDay: 150,
    budgetCurrency: "USD",
    publishedAt: "2026-08-28",
    updatedAt: "2026-08-28",
    highlights: [
      "Live music on Sixth Street & Rainey bars",
      "Congress Avenue bat flight at dusk",
      "Lady Bird Lake kayak & trail run",
      "Texas BBQ & breakfast taco crawl",
      "Circuit of the Americas (F1 US GP)",
      "Texas State Capitol tour",
    ],
  },
  {
    id: "munich",
    city: "Munich",
    country: "Germany",
    region: "Europe",
    description: "Bavarian beer gardens, baroque palaces and Alpine access.",
    longDescription:
      "Munich pairs a walkable old town — Marienplatz's glockenspiel, the Hofbräuhaus and beer gardens under chestnut trees — with world-class museums and palaces. It's also the springboard for Alpine day trips and, each autumn, host of the world's largest folk festival: Oktoberfest on the Theresienwiese.",
    bestMonths: "May-Sep",
    bestSeason:
      "May to September is warm and festival season. Mid-September to early October brings Oktoberfest (September 19 to October 4, 2026). December sparkles with Christmas markets.",
    currency: "EUR €",
    gradient: "from-sky-600 to-blue-800",
    image: null,
    weatherScore: {
      overall: 76,
      label: "Good",
      breakdown: { temperature: 76, precipitation: 68, wind: 80, sunshine: 76 },
      recommendation: "Pleasant — but pack a rain layer for summer storms.",
    },
    airport: {
      iata: "MUC",
      icao: "EDDM",
      name: "Munich Airport",
      city: "Munich",
      country: "Germany",
      timezone: "Europe/Berlin",
      latitude: 48.3538,
      longitude: 11.7861,
    },
    travelStyle: "cultural",
    interests: ["history", "food", "museums"],
    recommendedDays: 3,
    budgetPerDay: 150,
    budgetCurrency: "USD",
    publishedAt: "2026-08-28",
    updatedAt: "2026-08-28",
    highlights: [
      "Marienplatz & Rathaus-Glockenspiel",
      "Oktoberfest on the Theresienwiese",
      "Englischer Garten surf wave & beer gardens",
      "Deutsches Museum technology exhibits",
      "Nymphenburg Palace gardens",
      "Neuschwanstein day trip gateway",
    ],
  },
  {
    id: "kyoto",
    city: "Kyoto",
    country: "Japan",
    region: "Asia",
    description: "Seventeen UNESCO sites, geisha districts and temple gardens.",
    longDescription:
      "Kyoto was Japan's capital for a thousand years, and it shows — 1,600 Buddhist temples, 400 Shinto shrines, the wooden machiya of Gion, and gardens designed for quiet contemplation. Spring cherry blossoms and autumn maple season are spectacular; the rest of the year you share it with fewer people.",
    bestMonths: "Mar-Apr",
    bestSeason:
      "Late March to April for cherry blossoms, and mid-November to early December for autumn foliage, are the most scenic. Summer is hot and humid; winter is cold but serene.",
    currency: "JPY ¥",
    gradient: "from-red-500 to-orange-700",
    image: null,
    weatherScore: {
      overall: 80,
      label: "Good",
      breakdown: { temperature: 80, precipitation: 72, wind: 80, sunshine: 82 },
      recommendation: "Mild in spring and autumn — ideal temple weather.",
    },
    airport: {
      iata: "KIX",
      icao: "RJBB",
      name: "Kansai International Airport",
      city: "Osaka",
      country: "Japan",
      timezone: "Asia/Tokyo",
      latitude: 34.4273,
      longitude: 135.2444,
    },
    travelStyle: "cultural",
    interests: ["history", "food", "nature"],
    recommendedDays: 3,
    budgetPerDay: 140,
    budgetCurrency: "USD",
    publishedAt: "2026-08-28",
    updatedAt: "2026-08-28",
    highlights: [
      "Fushimi Inari's 10,000 torii gates",
      "Kinkaku-ji golden pavilion",
      "Arashiyama bamboo grove",
      "Gion geisha district at dusk",
      "Kiyomizu-dera hillside temple",
      "Autumn maples at Tōfuku-ji",
    ],
  },
  {
    id: "vienna",
    city: "Vienna",
    country: "Austria",
    region: "Europe",
    description: "Imperial palaces, coffee houses and the world's music capital.",
    longDescription:
      "Vienna is a living Habsburg stage set — Schönbrunn Palace, the Spanish Riding School, Klimt's gold at the Belvedere — wrapped around a coffee-house culture UNESCO recognizes as heritage. From mid-November the Rathausplatz becomes one of Europe's grandest Christmas markets.",
    bestMonths: "Apr-May",
    bestSeason:
      "April to June and September to October are mild. Late November to December brings the Christmas markets (Christkindlmarkt at Rathausplatz runs November 13 to December 26, 2026).",
    currency: "EUR €",
    gradient: "from-amber-500 to-red-600",
    image: null,
    weatherScore: {
      overall: 76,
      label: "Good",
      breakdown: { temperature: 75, precipitation: 70, wind: 76, sunshine: 78 },
      recommendation: "Pleasant for strolling the Ringstrasse most of the year.",
    },
    airport: {
      iata: "VIE",
      icao: "LOWW",
      name: "Vienna International Airport",
      city: "Vienna",
      country: "Austria",
      timezone: "Europe/Vienna",
      latitude: 48.1103,
      longitude: 16.5697,
    },
    travelStyle: "cultural",
    interests: ["museums", "history", "food"],
    recommendedDays: 3,
    budgetPerDay: 140,
    budgetCurrency: "USD",
    publishedAt: "2026-08-28",
    updatedAt: "2026-08-28",
    highlights: [
      "Schönbrunn Palace & gardens",
      "St. Stephen's Cathedral & old town",
      "Klimt's 'The Kiss' at the Belvedere",
      "Viennese coffee-house culture",
      "Christkindlmarkt on Rathausplatz",
      "Classical concerts & the Staatsoper",
    ],
  },
  {
    id: "rovaniemi",
    city: "Rovaniemi",
    country: "Finland",
    region: "Europe",
    description: "The official hometown of Santa Claus on the Arctic Circle.",
    longDescription:
      "Rovaniemi sits right on the Arctic Circle in Finnish Lapland — reindeer crossings on the main street, the Arktikum museum, and Santa Claus Village where you can cross the polar line on foot. From late August the northern lights season begins, peaking in midwinter around the December darkness.",
    bestMonths: "Dec-Feb",
    bestSeason:
      "December to March is the aurora-and-snow season with polar-night twilight. June to August offers midnight sun and hiking under 24-hour daylight.",
    currency: "EUR €",
    gradient: "from-cyan-500 to-blue-700",
    image: null,
    weatherScore: {
      overall: 68,
      label: "Fair",
      breakdown: { temperature: 50, precipitation: 70, wind: 70, sunshine: 65 },
      recommendation: "Sub-zero most of the year — pack proper Arctic layers.",
    },
    airport: {
      iata: "RVN",
      icao: "EFKT",
      name: "Rovaniemi Airport",
      city: "Rovaniemi",
      country: "Finland",
      timezone: "Europe/Helsinki",
      latitude: 66.5648,
      longitude: 25.8319,
    },
    travelStyle: "adventure",
    interests: ["nature", "sports", "museums"],
    recommendedDays: 3,
    budgetPerDay: 180,
    budgetCurrency: "USD",
    publishedAt: "2026-08-28",
    updatedAt: "2026-08-28",
    highlights: [
      "Santa Claus Village on the Arctic Circle",
      "Northern lights hunting",
      "Husky & reindeer safaris",
      "Arktikum science museum",
      "Ranua Wildlife Park (polar bears)",
      "Snowmobiling across frozen rivers",
    ],
  },
  {
    id: "antalya",
    city: "Antalya",
    country: "Turkey",
    region: "Europe",
    description: "Turquoise coast beaches wrapped around an old Roman port.",
    longDescription:
      "Antalya is the gateway to the Turkish Riviera — a crescent of Blue Flag beaches beneath the Taurus Mountains, and a Roman-era old town (Kaleiçi) of Ottoman mansions around a 2nd-century harbour. Aspendos and Perge put classical antiquity within an easy half-day trip.",
    bestMonths: "Apr-Jun",
    bestSeason:
      "April to June and September to October are warm and comfortable. July and August are hot and busy; winter is mild enough for sightseeing but too cool for swimming.",
    currency: "TRY ₺",
    gradient: "from-teal-500 to-cyan-700",
    image: null,
    weatherScore: {
      overall: 82,
      label: "Excellent",
      breakdown: { temperature: 84, precipitation: 76, wind: 78, sunshine: 90 },
      recommendation: "Long sunshine season — sea swimming from May to October.",
    },
    airport: {
      iata: "AYT",
      icao: "LTAI",
      name: "Antalya Airport",
      city: "Antalya",
      country: "Turkey",
      timezone: "Europe/Istanbul",
      latitude: 36.8987,
      longitude: 30.8005,
    },
    travelStyle: "relaxed",
    interests: ["beaches", "history", "food"],
    recommendedDays: 4,
    budgetPerDay: 80,
    budgetCurrency: "USD",
    publishedAt: "2026-08-28",
    updatedAt: "2026-08-28",
    highlights: [
      "Kaleiçi old town & Hadrian's Gate",
      "Düden waterfalls meeting the sea",
      "Antalya Archaeological Museum",
      "Konyaaltı & Lara beaches",
      "Aspendos Roman theatre",
      "Perge ancient city ruins",
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

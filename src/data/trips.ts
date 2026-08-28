import type { Airport } from "@/types/flight";
import type { TravelStyle, TravelInterest } from "@/types/itinerary";

// ── Types ──────────────────────────────────────────────────────────────

export interface TripAuthor {
  /** "ai" = tripla AI, otherwise treated as a community author. */
  kind: "ai" | "user";
  name: string;
  avatarColor: string;
  initials: string;
}

export interface TripActivity {
  time: string;
  name: string;
  emoji: string;
}

export interface TripDay {
  day: number;
  theme: string;
  activities: TripActivity[];
}

export interface TripRestaurant {
  name: string;
  cuisine: string;
  emoji: string;
}

export interface Trip {
  /** 主键 id，与 slug 同值（保留以兼容列表页/Modal 现有引用）。 */
  id: string;
  /** URL slug，对外规范字段。Phase 1.1 要求。 */
  slug: string;
  title: string;
  /** 完整描述（对外规范字段，与 excerpt 同值）。 */
  description: string;
  /** Optional cover image under /public; null falls back to gradient. */
  coverImage: string | null;
  /** Fallback gradient when no cover image. */
  gradient: string;
  author: TripAuthor;
  days: number;
  /** 预算金额（对外规范字段，与 estimatedCost 同值）。 */
  budget: number;
  /** 估算成本，保留以兼容列表页/Modal 现有引用。 */
  estimatedCost: number;
  currency: string;
  tags: string[];
  /** 短描述，保留以兼容列表页/Modal 现有引用。 */
  excerpt: string;
  /** 最佳旅行季节/天气提示（对外规范字段，与 weatherTip 同值）。 */
  bestSeason: string;
  /** 天气提示，保留以兼容列表页/Modal 现有引用。 */
  weatherTip: string;
  /** 行程亮点（3-6 条），Phase 1.1 新增。 */
  highlights: string[];
  /** 每日行程（对外规范字段，与 fullDays 同引用）。 */
  itinerary: TripDay[];
  /** 每日行程数据，保留以兼容列表页/Modal 现有引用。 */
  fullDays: TripDay[];
  restaurants: TripRestaurant[];
  city: string;
  country: string;
  airport: Airport;
  travelStyle: TravelStyle;
  interests: TravelInterest[];
}

// ── Mock data ──────────────────────────────────────────────────────────

/**
 * 字面量输入类型：保留历史字段名，便于现有列表页/Modal 不动。
 * 通过 normalizeTrip 派生为规范 Trip。
 */
interface RawTrip {
  id: string;
  title: string;
  coverImage: string | null;
  gradient: string;
  author: TripAuthor;
  days: number;
  estimatedCost: number;
  currency: string;
  tags: string[];
  excerpt: string;
  weatherTip: string;
  fullDays: TripDay[];
  restaurants: TripRestaurant[];
  city: string;
  country: string;
  airport: Airport;
  travelStyle: TravelStyle;
  interests: TravelInterest[];
  /** 可选自定义亮点；未提供时由 normalize 从 fullDays.theme 派生。 */
  highlights?: string[];
}

const RAW_TRIPS: RawTrip[] = [
  {
    id: "tokyo-3d-foodie",
    title: "Tokyo 3-Day Foodie Adventure",
    coverImage: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    gradient: "from-rose-500 to-pink-700",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    // Fix: 与 destinations.ts 的 budgetPerDay(USD 120/日) 对齐，避免与 /travel-budget/tokyo 页面数据矛盾。
    estimatedCost: 360,
    currency: "USD",
    tags: ["Foodie", "Shopping", "Culture"],
    excerpt:
      "Three days of sushi, ramen and Shibuya neon — a tightly packed taste of Tokyo at a relaxed pace.",
    weatherTip:
      "Aim for March–May or October–November for mild temperatures and clear skies. Summer is humid; winter is dry and cool.",
    fullDays: [
      {
        day: 1,
        theme: "Tsukiji & Shibuya",
        activities: [
          { time: "08:00", name: "Sushi breakfast at Tsukiji Outer Market", emoji: "🍣" },
          { time: "11:00", name: "Meiji Shrine & Yoyogi Park stroll", emoji: "⛩️" },
          { time: "14:00", name: "Harajuku Takeshita Street shopping", emoji: "🛍️" },
          { time: "19:00", name: "Shibuya Crossing & ramen dinner", emoji: "🍜" },
        ],
      },
      {
        day: 2,
        theme: "Asakusa & Akihabara",
        activities: [
          { time: "09:00", name: "Senso-ji Temple & Nakamise-dori", emoji: "🏯" },
          { time: "13:00", name: "Akihabara electronics & anime", emoji: "🤖" },
          { time: "17:00", name: "Ueno Park museum visit", emoji: "🖼️" },
          { time: "20:00", name: "Izakaya hopping in Shinjuku", emoji: "🍶" },
        ],
      },
      {
        day: 3,
        theme: "Shinjuku & Ginza",
        activities: [
          { time: "10:00", name: "Shinjuku Gyoen gardens", emoji: "🌸" },
          { time: "13:00", name: "Depachika (underground food hall) lunch", emoji: "🍱" },
          { time: "16:00", name: "Ginza boutique window-shopping", emoji: "💎" },
          { time: "20:00", name: "Robot Restaurant show & farewell dinner", emoji: "🤖" },
        ],
      },
    ],
    restaurants: [
      { name: "Sushi Dai", cuisine: "Sushi · $$$", emoji: "🍣" },
      { name: "Ichiran Shibuya", cuisine: "Tonkotsu ramen · $", emoji: "🍜" },
      { name: "Omoide Yokocho", cuisine: "Yakitori alley · $$", emoji: "🏮" },
    ],
    city: "Tokyo",
    country: "Japan",
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
  },
  {
    id: "paris-weekend",
    title: "Paris Romantic Weekend",
    coverImage: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
    gradient: "from-indigo-500 to-pink-600",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 2,
    // Fix: 与 destinations.ts 的 budgetPerDay(USD 150/日) 对齐。
    estimatedCost: 300,
    currency: "USD",
    tags: ["Culture", "Foodie", "Couples"],
    excerpt:
      "Two art-filled days along the Seine — Louvre mornings, café afternoons, a sunset cruise, and one unforgettable dinner.",
    weatherTip:
      "April–June or September–October is ideal. Pack a light jacket even in summer — Parisian evenings cool off fast.",
    fullDays: [
      {
        day: 1,
        theme: "Louvre & Latin Quarter",
        activities: [
          { time: "09:00", name: "Louvre Museum (Mona Lisa & Venus de Milo)", emoji: "🖼️" },
          { time: "13:00", name: "Café de Flore lunch in Saint-Germain", emoji: "☕" },
          { time: "16:00", name: "Walk the Jardin du Luxembourg", emoji: "🌳" },
          { time: "20:00", name: "Seine River sunset cruise", emoji: "🌊" },
        ],
      },
      {
        day: 2,
        theme: "Montmartre & Eiffel",
        activities: [
          { time: "09:00", name: "Sacré-Cœur & Montmartre artists", emoji: "🎨" },
          { time: "13:00", name: "Eiffel Tower & Champ de Mars picnic", emoji: "🗼" },
          { time: "17:00", name: "Le Marais vintage boutiques", emoji: "🛍️" },
          { time: "20:30", name: "Le Marais wine bar dinner", emoji: "🍷" },
        ],
      },
    ],
    restaurants: [
      { name: "Café de Flore", cuisine: "Classic Parisian café · $$$", emoji: "☕" },
      { name: "Le Comptoir du Relais", cuisine: "Bistro · $$", emoji: "🥖" },
      { name: "Du Pain et des Idées", cuisine: "Bakery · $", emoji: "🥐" },
    ],
    city: "Paris",
    country: "France",
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
  },
  {
    id: "nyc-explorer",
    title: "New York City Explorer",
    coverImage: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
    gradient: "from-amber-500 to-red-600",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    // Fix: 与 destinations.ts 的 budgetPerDay(USD 200/日) 对齐。
    estimatedCost: 600,
    currency: "USD",
    tags: ["Active", "Culture", "Foodie"],
    excerpt:
      "Midtown icons, Brooklyn mornings and a Broadway night — three full days of the city that never sleeps.",
    weatherTip:
      "September–October has the best weather. Winter is cold but festive; summer is hot and crowded.",
    fullDays: [
      {
        day: 1,
        theme: "Midtown Manhattan",
        activities: [
          { time: "09:00", name: "Times Square & Bryant Park", emoji: "🌃" },
          { time: "12:00", name: "Top of the Rock observation deck", emoji: "🏙️" },
          { time: "15:00", name: "MoMA or Grand Central tour", emoji: "🎨" },
          { time: "19:30", name: "Broadway show", emoji: "🎭" },
        ],
      },
      {
        day: 2,
        theme: "Central Park & Museums",
        activities: [
          { time: "08:00", name: "Central Park bike ride", emoji: "🌳" },
          { time: "12:00", name: "Metropolitan Museum of Art", emoji: "🏛️" },
          { time: "17:00", name: "Hell's Kitchen dinner", emoji: "🍽️" },
          { time: "21:00", name: "Rooftop bar in Midtown", emoji: "🍸" },
        ],
      },
      {
        day: 3,
        theme: "Brooklyn & Downtown",
        activities: [
          { time: "07:00", name: "Brooklyn Bridge walk at sunrise", emoji: "🌉" },
          { time: "11:00", name: "DUMBO & Brooklyn Flea", emoji: "🛍️" },
          { time: "15:00", name: "9/11 Memorial & One World Observatory", emoji: "🕊️" },
          { time: "20:00", name: "Greenwich Village jazz club", emoji: "🎷" },
        ],
      },
    ],
    restaurants: [
      { name: "Joe's Pizza", cuisine: "Classic NYC slice · $", emoji: "🍕" },
      { name: "Katz's Delicatessen", cuisine: "Pastrami · $$", emoji: "🥪" },
      { name: "Le Bernardin", cuisine: "French seafood · $$$$", emoji: "🦞" },
    ],
    city: "New York",
    country: "USA",
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
  },
  {
    id: "bangkok-nightlife",
    title: "Bangkok Night Market Journey",
    coverImage: null,
    gradient: "from-orange-500 to-yellow-600",
    author: { kind: "user", name: "Lalita S.", avatarColor: "from-orange-500 to-yellow-500", initials: "LS" },
    days: 3,
    // Fix: 与 destinations.ts 的 budgetPerDay(USD 50/日) 对齐。
    estimatedCost: 150,
    currency: "USD",
    tags: ["Foodie", "Nightlife", "Budget"],
    excerpt:
      "Street food from dusk to dawn — Chinatown skewers, floating markets, and a rooftop bar to cap it all off.",
    weatherTip:
      "November–February is cool and dry. Avoid March–May (very hot) and the heavy September rains.",
    fullDays: [
      {
        day: 1,
        theme: "Chinatown & Yaowarat",
        activities: [
          { time: "17:00", name: "Wat Pho temple visit at golden hour", emoji: "🛕" },
          { time: "19:30", name: "Yaowarat street food crawl", emoji: "🥢" },
          { time: "22:00", name: "T&K Seafood dinner", emoji: "🦐" },
        ],
      },
      {
        day: 2,
        theme: "Floating Market & Maeklong",
        activities: [
          { time: "07:00", name: "Damnoen Saduak floating market", emoji: "🛶" },
          { time: "11:00", name: "Maeklong Railway Market", emoji: "🚂" },
          { time: "16:00", name: "Chatuchak weekend market (if Sat/Sun)", emoji: "🛍️" },
          { time: "21:00", name: "Khao San Road night scene", emoji: "🎒" },
        ],
      },
      {
        day: 3,
        theme: "Rooftops & Riverside",
        activities: [
          { time: "10:00", name: "Jim Thompson House silk museum", emoji: "🏛️" },
          { time: "14:00", name: "Asiatique the Riverfront shopping", emoji: "🛒" },
          { time: "19:00", name: "Vertigo rooftop dinner", emoji: "🌃" },
          { time: "22:00", name: "Riverside bar on the Chao Phraya", emoji: "🍹" },
        ],
      },
    ],
    restaurants: [
      { name: "Jay Fai", cuisine: "Legendary street crab omelette · $$$", emoji: "🦀" },
      { name: "T&K Seafood", cuisine: "Chinatown seafood · $$", emoji: "🦐" },
      { name: "Gaggan Anand", cuisine: "Progressive Indian · $$$$", emoji: "🍛" },
    ],
    city: "Bangkok",
    country: "Thailand",
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
    interests: ["food", "nightlife", "shopping"],
  },
  {
    id: "london-cultural",
    title: "London Cultural Walk",
    coverImage: null,
    gradient: "from-slate-700 to-blue-900",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 2,
    // Fix: 与 destinations.ts 的 budgetPerDay(USD 180/日) 对齐。
    estimatedCost: 360,
    currency: "USD",
    tags: ["History", "Museums", "Slow Travel"],
    excerpt:
      "Seven centuries of London on foot — Tower, Borough Market, the South Bank, and a free museum afternoon.",
    weatherTip:
      "May–September is the mildest. Always carry a light rain jacket — London weather is famously changeable.",
    fullDays: [
      {
        day: 1,
        theme: "The City & the South Bank",
        activities: [
          { time: "08:30", name: "Tower of London & Crown Jewels", emoji: "🏰" },
          { time: "11:00", name: "Walk across Tower Bridge", emoji: "🌉" },
          { time: "13:00", name: "Borough Market lunch", emoji: "🧀" },
          { time: "16:00", name: "Tate Modern on the South Bank", emoji: "🖼️" },
          { time: "19:30", name: "West End theatre show", emoji: "🎭" },
        ],
      },
      {
        day: 2,
        theme: "Westminster & Covent Garden",
        activities: [
          { time: "09:00", name: "Westminster Abbey & Big Ben", emoji: "🏛️" },
          { time: "12:00", name: "St. Paul's Cathedral", emoji: "⛪" },
          { time: "15:00", name: "British Museum (free)", emoji: "🏺" },
          { time: "19:00", name: "Covent Garden dinner & street performers", emoji: "🍷" },
        ],
      },
    ],
    restaurants: [
      { name: "Borough Market stalls", cuisine: "Street food · $", emoji: "🧀" },
      { name: "The Wolseley", cuisine: "Grand European brasserie · $$$", emoji: "🥐" },
      { name: "Sketch", cuisine: "Afternoon tea · $$$$", emoji: "🫖" },
    ],
    city: "London",
    country: "United Kingdom",
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
    interests: ["history", "museums", "food"],
  },
  {
    id: "sydney-nature",
    title: "Sydney Nature Adventure",
    coverImage: null,
    gradient: "from-sky-500 to-cyan-700",
    author: { kind: "user", name: "Olivia P.", avatarColor: "from-sky-500 to-cyan-500", initials: "OP" },
    days: 3,
    // Fix: 与 destinations.ts 的 budgetPerDay(USD 160/日) 对齐。
    estimatedCost: 480,
    currency: "USD",
    tags: ["Adventure", "Nature", "Beaches"],
    excerpt:
      "Coastal walks, hidden harbour coves and a sunrise kayak — three days of outdoor Sydney beyond the Opera House.",
    weatherTip:
      "September–November is spring perfection. February is the hottest month; June–August is mild but shorter days.",
    fullDays: [
      {
        day: 1,
        theme: "Bondi to Coogee",
        activities: [
          { time: "07:00", name: "Bondi to Coogee coastal walk", emoji: "🌊" },
          { time: "10:30", name: "Bronte Baths ocean swim", emoji: "🏊" },
          { time: "13:00", name: "Lunch at Coogee Pavilion", emoji: "🥗" },
          { time: "16:00", name: "Tamarama beach sunset", emoji: "🌅" },
        ],
      },
      {
        day: 2,
        theme: "Harbour & North Head",
        activities: [
          { time: "06:30", name: "Sunrise kayak from Mosman", emoji: "🛶" },
          { time: "10:00", name: "Taronga Zoo", emoji: "🦘" },
          { time: "14:00", name: "Manly beach & Corso", emoji: "🏖️" },
          { time: "19:00", name: "Harbour dinner cruise", emoji: "⛵" },
        ],
      },
      {
        day: 3,
        theme: "Blue Mountains Day Trip",
        activities: [
          { time: "07:00", name: "Drive to Blue Mountains", emoji: "🚗" },
          { time: "09:30", name: "Three Sisters lookout", emoji: "🏔️" },
          { time: "12:00", name: "Scenic World rides", emoji: "🚞" },
          { time: "16:00", name: "Leura village coffee & return", emoji: "☕" },
        ],
      },
    ],
    restaurants: [
      { name: "Quay Restaurant", cuisine: "Modern Australian · $$$$", emoji: "🍽️" },
      { name: "Bondi Icebergs Club", cuisine: "Italian with a view · $$$", emoji: "🍝" },
      { name: "Mr. Wong", cuisine: "Cantonese · $$$", emoji: "🥟" },
    ],
    city: "Sydney",
    country: "Australia",
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
    interests: ["nature", "beaches", "food"],
  },
  // ── China ───────────────────────────────────────────────────────────
  {
    id: "beijing-cultural-escape",
    title: "Beijing Cultural Escape",
    coverImage: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80",
    gradient: "from-red-600 to-orange-700",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 2800,
    currency: "CNY",
    tags: ["Culture", "History", "Foodie"],
    excerpt:
      "Three days through imperial Beijing — the Forbidden City, the Great Wall, and hutong alleyways alive with local flavor.",
    weatherTip:
      "Best in spring (April–May) and autumn (September–October). Summers are hot and humid; winters are cold and dry.",
    fullDays: [
      {
        day: 1,
        theme: "Forbidden City & Tiananmen",
        activities: [
          { time: "08:30", name: "Tiananmen Square morning walk", emoji: "🏛️" },
          { time: "09:30", name: "Forbidden City full tour", emoji: "🏯" },
          { time: "14:00", name: "Jingshan Park panoramic view", emoji: "⛰️" },
          { time: "17:00", name: "Hutong rickshaw ride & courtyard visit", emoji: "🛒" },
          { time: "19:30", name: "Peking roast duck dinner", emoji: "🦆" },
        ],
      },
      {
        day: 2,
        theme: "Great Wall & Olympic Park",
        activities: [
          { time: "07:00", name: "Mutianyu Great Wall hike", emoji: "🧱" },
          { time: "13:00", name: "Farmhouse lunch near the Wall", emoji: "🍲" },
          { time: "16:00", name: "Bird's Nest & Water Cube exterior", emoji: "🏟️" },
          { time: "19:00", name: "Wangfujing snack street", emoji: "🍢" },
        ],
      },
      {
        day: 3,
        theme: "Temple of Heaven & Nanluoguxiang",
        activities: [
          { time: "08:00", name: "Temple of Heaven morning locals", emoji: "⛩️" },
          { time: "11:00", name: "Pearl Market bargaining", emoji: "💎" },
          { time: "14:00", name: "Nanluoguxiang hutong café crawl", emoji: "☕" },
          { time: "18:00", name: "Houhai lakeside bar stroll", emoji: "🌙" },
        ],
      },
    ],
    restaurants: [
      { name: "Quanjude Roast Duck", cuisine: "Peking duck · $$$", emoji: "🦆" },
      { name: "Siji Minfu", cuisine: "Beijing home-style · $$", emoji: "🍲" },
      { name: "Yaoji Chaogan", cuisine: "Breakfast noodles · $", emoji: "🍜" },
    ],
    city: "Beijing",
    country: "China",
    airport: {
      iata: "PEK",
      icao: "ZBAA",
      name: "Beijing Capital International Airport",
      city: "Beijing",
      country: "China",
      timezone: "Asia/Shanghai",
      latitude: 40.0799,
      longitude: 116.6031,
    },
    travelStyle: "cultural",
    interests: ["history", "museums", "food"],
  },
  {
    id: "shanghai-urban-experience",
    title: "Shanghai Urban Experience",
    coverImage: "https://images.unsplash.com/photo-1537531383496-f4749b76ceba?w=800&q=80",
    gradient: "from-violet-600 to-purple-800",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 3000,
    currency: "CNY",
    tags: ["Urban", "Foodie", "Shopping"],
    excerpt:
      "East meets West in Shanghai — the Bund at sunset, Yu Garden serenity, and Lujiazui's glittering skyline.",
    weatherTip:
      "Spring (March–May) and autumn (September–November) are ideal. Summers are hot and humid; winters are chilly.",
    fullDays: [
      {
        day: 1,
        theme: "The Bund & Nanjing Road",
        activities: [
          { time: "09:00", name: "Nanjing Road pedestrian shopping", emoji: "🛍️" },
          { time: "12:00", name: "Xiaolongbao lunch at Jia Jia Tang Bao", emoji: "🥟" },
          { time: "15:00", name: "Bund waterfront promenade", emoji: "🏙️" },
          { time: "19:00", name: "Huangpu River night cruise", emoji: "🚢" },
        ],
      },
      {
        day: 2,
        theme: "Yu Garden & French Concession",
        activities: [
          { time: "09:00", name: "Yu Garden & City God Temple", emoji: "🏯" },
          { time: "11:30", name: "Breakfast snacks at Yu Garden Bazaar", emoji: "🥮" },
          { time: "14:00", name: "Tianzifang arts & crafts alleys", emoji: "🎨" },
          { time: "17:00", name: "French Concession café hopping", emoji: "☕" },
          { time: "20:00", name: "Xintiandi nightlife", emoji: "🍸" },
        ],
      },
      {
        day: 3,
        theme: "Lujiazui & Pudong",
        activities: [
          { time: "09:00", name: "Shanghai Tower observation deck", emoji: "🏙️" },
          { time: "12:00", name: "Oriental Pearl Tower area lunch", emoji: "🗼" },
          { time: "15:00", name: "Shanghai Museum bronze & ceramics", emoji: "🏺" },
          { time: "19:00", name: "Lujiazui skyline dinner", emoji: "🌃" },
        ],
      },
    ],
    restaurants: [
      { name: "Jia Jia Tang Bao", cuisine: "Soup dumplings · $", emoji: "🥟" },
      { name: "M on the Bund", cuisine: "European fine dining · $$$$", emoji: "🍷" },
      { name: "Din Tai Fung", cuisine: "Taiwanese dumplings · $$", emoji: "🥟" },
    ],
    city: "Shanghai",
    country: "China",
    airport: {
      iata: "PVG",
      icao: "ZSPD",
      name: "Shanghai Pudong International Airport",
      city: "Shanghai",
      country: "China",
      timezone: "Asia/Shanghai",
      latitude: 31.1443,
      longitude: 121.8083,
    },
    travelStyle: "cultural",
    interests: ["food", "shopping", "nightlife"],
  },
  {
    id: "guangzhou-foodie-journey",
    title: "Guangzhou Foodie Journey",
    coverImage: null,
    gradient: "from-amber-500 to-red-600",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 2,
    estimatedCost: 1800,
    currency: "CNY",
    tags: ["Foodie", "Culture", "Budget"],
    excerpt:
      "Cantonese dim sum paradise — morning yum cha, Pearl River night cruise, and street food that defines a culinary capital.",
    weatherTip:
      "October–December is the most pleasant. Spring is rainy; summer is hot and humid with typhoons possible.",
    fullDays: [
      {
        day: 1,
        theme: "Dim Sum & Old Town",
        activities: [
          { time: "08:00", name: "Traditional yum cha at Guangzhou Restaurant", emoji: "🫖" },
          { time: "11:00", name: "Shamian Island colonial architecture walk", emoji: "🏛️" },
          { time: "14:00", name: "Chen Clan Ancestral Hall", emoji: "🏯" },
          { time: "18:00", name: "Shangxiajiu pedestrian street snacks", emoji: "🍢" },
          { time: "20:30", name: "Pearl River night cruise", emoji: "🌊" },
        ],
      },
      {
        day: 2,
        theme: "Markets & Canton Tower",
        activities: [
          { time: "08:30", name: "Point Court dim sum breakfast", emoji: "🥟" },
          { time: "11:00", name: "Qingping Market exotic ingredients tour", emoji: "🥬" },
          { time: "15:00", name: "Canton Tower skywalk", emoji: "🗼" },
          { time: "18:00", name: "Beijing Road street food dinner", emoji: "🍜" },
        ],
      },
    ],
    restaurants: [
      { name: "Guangzhou Restaurant", cuisine: "Classic Cantonese · $$", emoji: "🫖" },
      { name: "Bingsheng Taste", cuisine: "Cantonese seafood · $$$", emoji: "🦐" },
      { name: "Yinji Rice Roll", cuisine: "Rice noodle rolls · $", emoji: "🍚" },
    ],
    city: "Guangzhou",
    country: "China",
    airport: {
      iata: "CAN",
      icao: "ZGGG",
      name: "Guangzhou Baiyun International Airport",
      city: "Guangzhou",
      country: "China",
      timezone: "Asia/Shanghai",
      latitude: 23.3925,
      longitude: 113.2988,
    },
    travelStyle: "foodie",
    interests: ["food", "museums"],
  },
  {
    id: "chengdu-slow-life",
    title: "Chengdu Slow Life",
    coverImage: null,
    gradient: "from-green-600 to-emerald-800",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 2000,
    currency: "CNY",
    tags: ["Slow Travel", "Foodie", "Nature"],
    excerpt:
      "Panda encounters, fiery hotpot nights, and wide-and-narrow alleyway strolls — Chengdu's signature laid-back charm.",
    weatherTip:
      "March–June and September–November are best. Summers are hot and muggy; winters are grey and damp.",
    fullDays: [
      {
        day: 1,
        theme: "Panda Base & Hotpot",
        activities: [
          { time: "07:30", name: "Chengdu Research Base of Giant Panda Breeding", emoji: "🐼" },
          { time: "12:00", name: "Chunxi Road lunch & shopping", emoji: "🛍️" },
          { time: "15:00", name: "People's Park teahouse afternoon", emoji: "🍵" },
          { time: "18:30", name: "Authentic Sichuan hotpot dinner", emoji: "🌶️" },
        ],
      },
      {
        day: 2,
        theme: "Kuanzhai Alley & Wuhou Shrine",
        activities: [
          { time: "09:00", name: "Wuhou Shrine & Jinli Ancient Street", emoji: "⛩️" },
          { time: "12:30", name: "Kuanzhai Alley snack crawl", emoji: "🍢" },
          { time: "15:00", name: "Sichuan Opera face-changing show", emoji: "🎭" },
          { time: "19:00", name: "Jiuyanqiao bar street night out", emoji: "🍸" },
        ],
      },
      {
        day: 3,
        theme: "Dujiangyan Day Trip",
        activities: [
          { time: "08:00", name: "Drive to Dujiangyan Irrigation System", emoji: "🌊" },
          { time: "11:00", name: "Mount Qingcheng Taoist temple hike", emoji: "🏔️" },
          { time: "15:00", name: "Dujiangyan old town stroll", emoji: "🏘️" },
          { time: "18:00", name: "Return to Chengdu & farewell dinner", emoji: "🍲" },
        ],
      },
    ],
    restaurants: [
      { name: "Haidilao Hotpot", cuisine: "Sichuan hotpot · $$", emoji: "🌶️" },
      { name: "Chen Mapo Tofu", cuisine: "Mapo tofu origin · $", emoji: "🧈" },
      { name: "Long Chao Shou", cuisine: "Wontons & snacks · $", emoji: "🥟" },
    ],
    city: "Chengdu",
    country: "China",
    airport: {
      iata: "CTU",
      icao: "ZUUU",
      name: "Chengdu Shuangliu International Airport",
      city: "Chengdu",
      country: "China",
      timezone: "Asia/Shanghai",
      latitude: 30.5785,
      longitude: 103.9471,
    },
    travelStyle: "relaxed",
    interests: ["food", "nature", "museums"],
  },
  {
    id: "xian-historical-journey",
    title: "Xi'an Historical Journey",
    coverImage: null,
    gradient: "from-yellow-600 to-amber-800",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 1800,
    currency: "CNY",
    tags: ["History", "Culture", "Foodie"],
    excerpt:
      "The ancient capital reveals its secrets — Terracotta Warriors, Big Wild Goose Pagoda, and Muslim Quarter feasts.",
    weatherTip:
      "Spring (March–May) and autumn (September–November) offer the best weather. Summers are hot; winters are cold.",
    fullDays: [
      {
        day: 1,
        theme: "Terracotta Warriors & City Wall",
        activities: [
          { time: "08:00", name: "Terracotta Warriors Museum", emoji: "🗿" },
          { time: "13:00", name: "Lishan Garden & lunch", emoji: "🍲" },
          { time: "16:00", name: "Ancient City Wall bike ride", emoji: "🚲" },
          { time: "19:00", name: "Muslim Quarter street food", emoji: "🍢" },
        ],
      },
      {
        day: 2,
        theme: "Big Wild Goose Pagoda & Museums",
        activities: [
          { time: "09:00", name: "Big Wild Goose Pagoda & Da Ci'en Temple", emoji: "🏛️" },
          { time: "12:00", name: "Shaanxi History Museum", emoji: "🏺" },
          { time: "16:00", name: "Small Wild Goose Pagoda park", emoji: "⛩️" },
          { time: "20:00", name: "Datang Everbright City night show", emoji: "🎆" },
        ],
      },
      {
        day: 3,
        theme: "Huashan Day Trip",
        activities: [
          { time: "07:00", name: "High-speed train to Mount Huashan", emoji: "🚄" },
          { time: "09:30", name: "Cable car up & plank walk", emoji: "🏔️" },
          { time: "14:00", name: "Summit views & descent", emoji: "⛰️" },
          { time: "18:30", name: "Return to Xi'an & dumpling banquet", emoji: "🥟" },
        ],
      },
    ],
    restaurants: [
      { name: "Defachang Dumplings", cuisine: "Dumpling banquet · $$", emoji: "🥟" },
      { name: "Lao Sun Jia", cuisine: "Yangrou paomo (lamb soup) · $$", emoji: "🐑" },
      { name: "Muslim Quarter stalls", cuisine: "Roujiamo & biangbiang noodles · $", emoji: "🥙" },
    ],
    city: "Xi'an",
    country: "China",
    airport: {
      iata: "XIY",
      icao: "ZLXY",
      name: "Xi'an Xianyang International Airport",
      city: "Xi'an",
      country: "China",
      timezone: "Asia/Shanghai",
      latitude: 34.4471,
      longitude: 108.7519,
    },
    travelStyle: "cultural",
    interests: ["history", "museums", "food"],
  },
  {
    id: "hangzhou-west-lake-poetry",
    title: "Hangzhou West Lake Poetry",
    coverImage: null,
    gradient: "from-teal-500 to-cyan-700",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 2,
    estimatedCost: 1600,
    currency: "CNY",
    tags: ["Nature", "Culture", "Slow Travel"],
    excerpt:
      "Poetic West Lake mornings, Lingyin Temple serenity, and Longjing tea fields — Hangzhou in its gentlest form.",
    weatherTip:
      "March–May and September–November are perfect. Plum blossoms bloom in February; lotus flowers peak in July.",
    fullDays: [
      {
        day: 1,
        theme: "West Lake & Lingyin Temple",
        activities: [
          { time: "08:00", name: "West Lake boat ride & Broken Bridge", emoji: "🛶" },
          { time: "11:00", name: "Lingyin Temple & Feilai Peak carvings", emoji: "⛩️" },
          { time: "14:00", name: "Longjing Village tea tasting", emoji: "🍵" },
          { time: "17:30", name: "Leifeng Pagoda sunset", emoji: "🌅" },
          { time: "19:30", name: "Impression West Lake night show", emoji: "🎭" },
        ],
      },
      {
        day: 2,
        theme: "Tea Fields & Hefang Street",
        activities: [
          { time: "08:30", name: "Meijiawu tea plantation walk", emoji: "🌿" },
          { time: "11:00", name: "China National Tea Museum", emoji: "🍵" },
          { time: "14:00", name: "Hefang Street souvenir shopping", emoji: "🛍️" },
          { time: "16:00", name: "Xixi National Wetland Park", emoji: "🦆" },
        ],
      },
    ],
    restaurants: [
      { name: "Lou Wai Lou", cuisine: "West Lake vinegar fish · $$$", emoji: "🐟" },
      { name: "Zhi Wei Guan", cuisine: "Hangzhou snacks · $", emoji: "🥟" },
      { name: "Longjing Village teahouse", cuisine: "Farm-to-table · $$", emoji: "🍵" },
    ],
    city: "Hangzhou",
    country: "China",
    airport: {
      iata: "HGH",
      icao: "ZSHC",
      name: "Hangzhou Xiaoshan International Airport",
      city: "Hangzhou",
      country: "China",
      timezone: "Asia/Shanghai",
      latitude: 30.2348,
      longitude: 120.4293,
    },
    travelStyle: "relaxed",
    interests: ["nature", "museums", "food"],
  },
  {
    id: "chongqing-mountain-adventure",
    title: "Chongqing Mountain Adventure",
    coverImage: null,
    gradient: "from-rose-700 to-red-900",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 2000,
    currency: "CNY",
    tags: ["Adventure", "Foodie", "Nightlife"],
    excerpt:
      "Cyberpunk mountain city magic — Hongyadong's glowing tiers, fiery Chongqing hotpot, and a Yangtze River cableway ride.",
    weatherTip:
      "Spring (March–May) and autumn (October–November) are best. Summers are extremely hot; winters are foggy and mild.",
    fullDays: [
      {
        day: 1,
        theme: "Hongyadong & Jiefangbei",
        activities: [
          { time: "10:00", name: "Jiefangbei pedestrian street", emoji: "🏙️" },
          { time: "12:00", name: "Chongqing hotpot lunch", emoji: "🌶️" },
          { time: "15:00", name: "Yangtze River Cableway ride", emoji: "🚡" },
          { time: "19:00", name: "Hongyadong night view & snacks", emoji: "🏮" },
        ],
      },
      {
        day: 2,
        theme: "Ciqikou & Liziba",
        activities: [
          { time: "09:00", name: "Ciqikou Ancient Town stroll", emoji: "🏘️" },
          { time: "12:00", name: "Chen Mahua snack crawl", emoji: "🍡" },
          { time: "14:30", name: "Liziba monorail through building", emoji: "🚝" },
          { time: "17:00", name: "Eling Park panoramic view", emoji: "⛰️" },
          { time: "20:00", name: "Nanbin Road riverside dinner", emoji: "🌃" },
        ],
      },
      {
        day: 3,
        theme: "Wulong Karst Day Trip",
        activities: [
          { time: "07:00", name: "Drive to Wulong Karst Geopark", emoji: "🚗" },
          { time: "10:00", name: "Three Natural Bridges hike", emoji: "🌉" },
          { time: "13:00", name: "Furong Cave exploration", emoji: "🕳️" },
          { time: "17:00", name: "Return & farewell hotpot", emoji: "🌶️" },
        ],
      },
    ],
    restaurants: [
      { name: "Xiaolongkan Hotpot", cuisine: "Chongqing spicy hotpot · $$", emoji: "🌶️" },
      { name: "Haochi Street stalls", cuisine: "Street food · $", emoji: "🍢" },
      { name: "Shancheng Xiaotang", cuisine: "Chongqing noodles · $", emoji: "🍜" },
    ],
    city: "Chongqing",
    country: "China",
    airport: {
      iata: "CKG",
      icao: "ZUCK",
      name: "Chongqing Jiangbei International Airport",
      city: "Chongqing",
      country: "China",
      timezone: "Asia/Shanghai",
      latitude: 29.7192,
      longitude: 106.6417,
    },
    travelStyle: "active",
    interests: ["food", "sports", "nightlife"],
  },
  {
    id: "hongkong-shopping-foodie",
    title: "Hong Kong Shopping & Foodie",
    coverImage: "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800&q=80",
    gradient: "from-sky-600 to-indigo-800",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 2,
    estimatedCost: 3500,
    // Fix: 香港法定货币为港元（HKD），原 CNY 标注错误。
    currency: "HKD",
    tags: ["Shopping", "Foodie", "Urban"],
    excerpt:
      "Victoria Harbour panoramas, Victoria Peak sunsets, and dim sum feasts — Hong Kong in 48 electrifying hours.",
    weatherTip:
      "October–December is the best time. Summers are hot, humid, and typhoon-prone; spring is rainy.",
    fullDays: [
      {
        day: 1,
        theme: "Victoria Harbour & Central",
        activities: [
          { time: "09:00", name: "Star Ferry across Victoria Harbour", emoji: "⛴️" },
          { time: "10:30", name: "Central Mid-Levels escalator & Soho", emoji: "🏙️" },
          { time: "13:00", name: "Dim sum lunch at Tim Ho Wan", emoji: "🥟" },
          { time: "16:00", name: "Causeway Bay shopping spree", emoji: "🛍️" },
          { time: "20:00", name: "A Symphony of Lights harbour show", emoji: "🌃" },
        ],
      },
      {
        day: 2,
        theme: "Victoria Peak & Mong Kok",
        activities: [
          { time: "08:00", name: "Victoria Peak tram & morning view", emoji: "🏔️" },
          { time: "11:00", name: "Lan Kwai Fong brunch", emoji: "☕" },
          { time: "14:00", name: "Mong Kok street markets (Ladies Market)", emoji: "🛒" },
          { time: "17:00", name: "Tsim Sha Tsui promenade sunset", emoji: "🌅" },
          { time: "19:30", name: "Char siu & egg tart dinner", emoji: "🥧" },
        ],
      },
    ],
    restaurants: [
      { name: "Tim Ho Wan", cuisine: "Michelin dim sum · $$", emoji: "🥟" },
      { name: "Yat Lok Roast Goose", cuisine: "Cantonese roast goose · $$", emoji: "🦆" },
      { name: "Australia Dairy Company", cuisine: "HK-style café · $", emoji: "🥛" },
    ],
    city: "Hong Kong",
    country: "China",
    airport: {
      iata: "HKG",
      icao: "VHHH",
      name: "Hong Kong International Airport",
      city: "Hong Kong",
      country: "China",
      timezone: "Asia/Hong_Kong",
      latitude: 22.308,
      longitude: 113.9185,
    },
    travelStyle: "active",
    interests: ["shopping", "food", "nightlife"],
  },
  {
    id: "macau-portuguese-charm",
    title: "Macau Portuguese Charm",
    coverImage: null,
    gradient: "from-amber-600 to-yellow-700",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 2,
    estimatedCost: 2500,
    // Fix: 澳门法定货币为澳门元（MOP），原 CNY 标注错误。
    currency: "MOP",
    tags: ["Culture", "Foodie", "Couples"],
    excerpt:
      "Portuguese heritage meets casino glamour — Ruins of St. Paul's, Venetian canals, and egg tart bliss in Macau.",
    weatherTip:
      "October–March is the most pleasant. Summers are hot and typhoon-prone; autumn is the driest season.",
    fullDays: [
      {
        day: 1,
        theme: "Historic Centre & Egg Tarts",
        activities: [
          { time: "09:00", name: "Ruins of St. Paul's & Mount Fortress", emoji: "⛪" },
          { time: "11:00", name: "Senado Square & St. Dominic's Church", emoji: "🏛️" },
          { time: "13:00", name: "Margaret's Café e Nata egg tart lunch", emoji: "🥧" },
          { time: "15:00", name: "A-Ma Temple & Barra Square", emoji: "⛩️" },
          { time: "19:00", name: "Taipa Village Portuguese dinner", emoji: "🍷" },
        ],
      },
      {
        day: 2,
        theme: "Cotai Strip & Coloane",
        activities: [
          { time: "09:00", name: "The Venetian gondola ride", emoji: "🛶" },
          { time: "11:30", name: "Cotai Strip casino hopping", emoji: "🎰" },
          { time: "14:00", name: "Coloane Village & Lord Stow's Bakery", emoji: "🥧" },
          { time: "16:30", name: "Hac Sa Beach & Fernando's dinner", emoji: "🏖️" },
        ],
      },
    ],
    restaurants: [
      { name: "Lord Stow's Bakery", cuisine: "Portuguese egg tarts · $", emoji: "🥧" },
      { name: "Fernando's", cuisine: "Portuguese · $$", emoji: "🍷" },
      { name: "A Lorcha", cuisine: "Macanese · $$", emoji: "🦐" },
    ],
    city: "Macau",
    country: "China",
    airport: {
      iata: "MFM",
      icao: "VMMC",
      name: "Macau International Airport",
      city: "Macau",
      country: "China",
      timezone: "Asia/Macau",
      latitude: 22.1496,
      longitude: 113.5914,
    },
    travelStyle: "cultural",
    interests: ["museums", "food", "nightlife"],
  },
  // ── Asia (non-China) ────────────────────────────────────────────────
  {
    id: "seoul-k-culture",
    title: "Seoul K-Culture Experience",
    coverImage: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80",
    gradient: "from-pink-500 to-violet-600",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 450000,
    currency: "KRW",
    tags: ["Culture", "Shopping", "Foodie"],
    excerpt:
      "K-wave meets ancient Joseon — Gyeongbokgung palaces, Myeongdong shopping sprees, and N Seoul Tower sunsets.",
    weatherTip:
      "April–June and September–November are ideal. Summers are hot and rainy; winters are cold and dry.",
    fullDays: [
      {
        day: 1,
        theme: "Palaces & Hanok Village",
        activities: [
          { time: "09:00", name: "Gyeongbokgung Palace & guard ceremony", emoji: "🏯" },
          { time: "12:00", name: "Bukchon Hanok Village walk", emoji: "🏘️" },
          { time: "14:30", name: "Insadong crafts & tea houses", emoji: "🍵" },
          { time: "18:00", name: "Gwangjang Market street food", emoji: "🍢" },
        ],
      },
      {
        day: 2,
        theme: "Myeongdong & N Seoul Tower",
        activities: [
          { time: "10:00", name: "Myeongdong K-beauty shopping", emoji: "🛍️" },
          { time: "13:00", name: "Korean BBQ lunch", emoji: "🥩" },
          { time: "16:00", name: "N Seoul Tower cable car & view", emoji: "🗼" },
          { time: "19:30", name: "Hongdae indie music & nightlife", emoji: "🎵" },
        ],
      },
      {
        day: 3,
        theme: "DMZ or Gangnam",
        activities: [
          { time: "08:00", name: "DMZ tour (or COEX Mall & Starfield Library)", emoji: "📚" },
          { time: "13:00", name: "Gangnam style lunch & café", emoji: "☕" },
          { time: "16:00", name: "Cheonggyecheon stream stroll", emoji: "🌊" },
          { time: "19:00", name: "Itaewon international dinner", emoji: "🍽️" },
        ],
      },
    ],
    restaurants: [
      { name: "Jyoti Indian Cuisine", cuisine: "Korean BBQ · $$", emoji: "🥩" },
      { name: "Gwangjang Market", cuisine: "Bindaetteok & gimbap · $", emoji: "🥞" },
      { name: "Café Onion", cuisine: "Trendy bakery · $$", emoji: "🥐" },
    ],
    city: "Seoul",
    country: "South Korea",
    airport: {
      iata: "ICN",
      icao: "RKSI",
      name: "Incheon International Airport",
      city: "Seoul",
      country: "South Korea",
      timezone: "Asia/Seoul",
      latitude: 37.46,
      longitude: 126.44,
    },
    travelStyle: "cultural",
    interests: ["shopping", "food", "history"],
  },
  {
    id: "singapore-garden-city",
    title: "Singapore Garden City",
    coverImage: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80",
    gradient: "from-emerald-500 to-teal-700",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 600,
    currency: "SGD",
    tags: ["Urban", "Foodie", "Nature"],
    excerpt:
      "Futuristic gardens, hawker centre feasts, and Sentosa sunsets — Singapore packs a continent into a city.",
    weatherTip:
      "Year-round tropical climate. February–April is the driest; November–January has the most rain.",
    fullDays: [
      {
        day: 1,
        theme: "Marina Bay & Gardens",
        activities: [
          { time: "09:00", name: "Gardens by the Bay & Cloud Forest", emoji: "🌳" },
          { time: "13:00", name: "Lau Pa Sat hawker lunch", emoji: "🍜" },
          { time: "16:00", name: "Marina Bay Sands SkyPark", emoji: "🏙️" },
          { time: "20:00", name: "Spectra light & water show", emoji: "🎆" },
        ],
      },
      {
        day: 2,
        theme: "Sentosa Island",
        activities: [
          { time: "09:00", name: "Universal Studios Singapore", emoji: "🎢" },
          { time: "14:00", name: "Sentosa beach & cable car", emoji: "🏖️" },
          { time: "18:00", name: "Chinatown dinner & night market", emoji: "🏮" },
        ],
      },
      {
        day: 3,
        theme: "Chinatown & Little India",
        activities: [
          { time: "09:00", name: "Buddha Tooth Relic Temple", emoji: "⛩️" },
          { time: "11:30", name: "Little India & Mustafa Centre", emoji: "🛍️" },
          { time: "14:00", name: "Kampong Glam & Haji Lane", emoji: "🎨" },
          { time: "18:00", name: "Clarke Quay riverside dinner", emoji: "🍷" },
        ],
      },
    ],
    restaurants: [
      { name: "Lau Pa Sat", cuisine: "Hawker centre · $", emoji: "🍜" },
      { name: "Tim Ho Wan", cuisine: "Dim sum · $$", emoji: "🥟" },
      { name: "Jumbo Seafood", cuisine: "Chili crab · $$$", emoji: "🦀" },
    ],
    city: "Singapore",
    country: "Singapore",
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
    travelStyle: "active",
    interests: ["food", "nature", "shopping"],
  },
  {
    id: "osaka-food-capital",
    title: "Osaka Food Capital",
    coverImage: "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&q=80",
    gradient: "from-orange-500 to-red-600",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 80000,
    currency: "JPY",
    tags: ["Foodie", "Culture", "Shopping"],
    excerpt:
      "Japan's kitchen — Dotonbori neon, Osaka Castle, and Universal Studios in three unforgettable days.",
    weatherTip:
      "Spring (March–May) and autumn (October–November) are best. Summers are hot and humid.",
    fullDays: [
      {
        day: 1,
        theme: "Dotonbori & Namba",
        activities: [
          { time: "10:00", name: "Kuromon Market fresh seafood", emoji: "🐟" },
          { time: "13:00", name: "Dotonbori food crawl (takoyaki & okonomiyaki)", emoji: "🐙" },
          { time: "16:00", name: "Shinsaibashi shopping street", emoji: "🛍️" },
          { time: "19:00", name: "Hozenji Temple alley & yakitori", emoji: "🏮" },
        ],
      },
      {
        day: 2,
        theme: "Osaka Castle & Universal",
        activities: [
          { time: "09:00", name: "Osaka Castle & park", emoji: "🏯" },
          { time: "12:00", name: "Universal Studios Japan", emoji: "🎢" },
          { time: "20:00", name: "Namba Yasaka Shrine night view", emoji: "⛩️" },
        ],
      },
      {
        day: 3,
        theme: "Kobe Day Trip & Umeda",
        activities: [
          { time: "08:30", name: "Kobe beef lunch in Chinatown", emoji: "🥩" },
          { time: "12:00", name: "Kobe Port Tower & Meriken Park", emoji: "🗼" },
          { time: "16:00", name: "Umeda Sky Building floating garden", emoji: "🏙️" },
          { time: "19:00", name: "Farewell kushikatsu dinner", emoji: "🍢" },
        ],
      },
    ],
    restaurants: [
      { name: "Ichiran Ramen", cuisine: "Tonkotsu ramen · $", emoji: "🍜" },
      { name: "Dotonbori Konamon Museum", cuisine: "Takoyaki · $", emoji: "🐙" },
      { name: "Kobe Beef Kiso", cuisine: "Kobe beef · $$$$", emoji: "🥩" },
    ],
    city: "Osaka",
    country: "Japan",
    airport: {
      iata: "KIX",
      icao: "RJBB",
      name: "Kansai International Airport",
      city: "Osaka",
      country: "Japan",
      timezone: "Asia/Tokyo",
      latitude: 34.4346,
      longitude: 135.244,
    },
    travelStyle: "foodie",
    interests: ["food", "shopping", "history"],
  },
  {
    id: "bali-island-escape",
    title: "Bali Island Escape",
    coverImage: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    gradient: "from-green-400 to-emerald-600",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 4,
    estimatedCost: 5000000,
    currency: "IDR",
    tags: ["Nature", "Beaches", "Slow Travel"],
    excerpt:
      "Rice terraces, sacred temples, and sunset beaches — four days of Bali's spiritual and tropical magic.",
    weatherTip:
      "April–October is the dry season. May–September is peak. Avoid December–March (rainy season).",
    fullDays: [
      {
        day: 1,
        theme: "Ubud Rice Terraces",
        activities: [
          { time: "08:00", name: "Tegalalang Rice Terrace walk", emoji: "🌾" },
          { time: "11:00", name: "Ubud Monkey Forest", emoji: "🐒" },
          { time: "14:00", name: "Ubud Art Market & Palace", emoji: "🎨" },
          { time: "18:00", name: "Traditional Kecak fire dance", emoji: "🔥" },
        ],
      },
      {
        day: 2,
        theme: "Temples & Waterfalls",
        activities: [
          { time: "07:00", name: "Tirta Empul water purification", emoji: "⛩️" },
          { time: "10:30", name: "Tegenungan Waterfall swim", emoji: "🌊" },
          { time: "14:00", name: "Coffee plantation tour (luwak)", emoji: "☕" },
          { time: "17:00", name: "Tanah Lot temple sunset", emoji: "🌅" },
        ],
      },
      {
        day: 3,
        theme: "Seminyak Beach Day",
        activities: [
          { time: "09:00", name: "Seminyak Beach morning swim", emoji: "🏖️" },
          { time: "12:00", name: "Beach club lunch & pool", emoji: "🍹" },
          { time: "16:00", name: "Surf lesson for beginners", emoji: "🏄" },
          { time: "19:00", name: "Seafood BBQ on Jimbaran Beach", emoji: "🦐" },
        ],
      },
      {
        day: 4,
        theme: "Nusa Penida Day Trip",
        activities: [
          { time: "07:00", name: "Speedboat to Nusa Penida", emoji: "🚤" },
          { time: "09:00", name: "Kelingking Beach viewpoint", emoji: "🏔️" },
          { time: "12:00", name: "Angel's Billabong & Broken Beach", emoji: "🌊" },
          { time: "15:00", name: "Snorkeling with manta rays", emoji: "🤿" },
        ],
      },
    ],
    restaurants: [
      { name: "Locavore", cuisine: "Farm-to-table fine dining · $$$", emoji: "🍽️" },
      { name: "Warung Babi Guling Ibu Oka", cuisine: "Balinese suckling pig · $", emoji: "🐷" },
      { name: "Swept Away", cuisine: "Riverside dining · $$", emoji: "🌊" },
    ],
    city: "Bali",
    country: "Indonesia",
    airport: {
      iata: "DPS",
      icao: "WADD",
      name: "Ngurah Rai International Airport",
      city: "Bali",
      country: "Indonesia",
      timezone: "Asia/Makassar",
      latitude: -8.7467,
      longitude: 115.1668,
    },
    travelStyle: "relaxed",
    interests: ["nature", "beaches", "food"],
  },
  {
    id: "dubai-luxury",
    title: "Dubai Luxury Experience",
    coverImage: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
    gradient: "from-yellow-500 to-amber-700",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 3000,
    currency: "AED",
    tags: ["Shopping", "Adventure", "Luxury"],
    excerpt:
      "Burj Khalifa heights, desert dune bashing, and Palm Jumeirah glamour — Dubai at its most extravagant.",
    weatherTip:
      "November–March is the best time. Summers (June–September) are extremely hot (45°C+).",
    fullDays: [
      {
        day: 1,
        theme: "Downtown Dubai",
        activities: [
          { time: "09:00", name: "Burj Khalifa At The Top", emoji: "🏙️" },
          { time: "12:00", name: "Dubai Mall & aquarium", emoji: "🛍️" },
          { time: "18:00", name: "Dubai Fountain show", emoji: "⛲" },
          { time: "20:00", name: "Dinner at Atmosphere (122nd floor)", emoji: "🍽️" },
        ],
      },
      {
        day: 2,
        theme: "Desert Safari & Marina",
        activities: [
          { time: "09:00", name: "Dubai Marina yacht tour", emoji: "⛵" },
          { time: "14:00", name: "Palm Jumeirah & Atlantis", emoji: "🏝️" },
          { time: "16:30", name: "Desert dune bashing & BBQ camp", emoji: "🏜️" },
          { time: "21:00", name: "Stargazing in the desert", emoji: "⭐" },
        ],
      },
      {
        day: 3,
        theme: "Old Dubai & Gold Souk",
        activities: [
          { time: "09:00", name: "Al Fahidi Historical District", emoji: "🏛️" },
          { time: "11:00", name: "Abra ride across Dubai Creek", emoji: "🛶" },
          { time: "13:00", name: "Gold Souk & Spice Souk", emoji: "💎" },
          { time: "17:00", name: "Madinat Jumeirah sunset", emoji: "🌅" },
        ],
      },
    ],
    restaurants: [
      { name: "At.mosphere", cuisine: "Fine dining 122nd floor · $$$$", emoji: "🏙️" },
      { name: "Al Hadheerah", cuisine: "Desert Arabian feast · $$$", emoji: "🏜️" },
      { name: "Ravi Restaurant", cuisine: "Pakistani street food · $", emoji: "🍛" },
    ],
    city: "Dubai",
    country: "UAE",
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
    travelStyle: "adventure",
    interests: ["shopping", "sports", "food"],
  },
  // ── Europe ──────────────────────────────────────────────────────────
  {
    id: "rome-eternal-city",
    title: "Rome Eternal City",
    coverImage: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
    gradient: "from-amber-600 to-red-700",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 500,
    currency: "EUR",
    tags: ["History", "Foodie", "Culture"],
    excerpt:
      "The Colosseum, Vatican wonders, and Trevi Fountain wishes — three days walking through two millennia of history.",
    weatherTip:
      "April–June and September–October are ideal. Summers are hot and crowded; winters are mild but rainy.",
    fullDays: [
      {
        day: 1,
        theme: "Ancient Rome",
        activities: [
          { time: "09:00", name: "Colosseum & Roman Forum", emoji: "🏛️" },
          { time: "13:00", name: "Trastevere pasta lunch", emoji: "🍝" },
          { time: "16:00", name: "Pantheon & Piazza Navona", emoji: "⛪" },
          { time: "19:30", name: "Trevi Fountain & gelato", emoji: "⛲" },
        ],
      },
      {
        day: 2,
        theme: "Vatican City",
        activities: [
          { time: "08:00", name: "Vatican Museums & Sistine Chapel", emoji: "🖼️" },
          { time: "12:00", name: "St. Peter's Basilica & dome climb", emoji: "⛪" },
          { time: "15:00", name: "Castel Sant'Angelo", emoji: "🏰" },
          { time: "19:00", name: "Roman pizza & wine in Monti", emoji: "🍕" },
        ],
      },
      {
        day: 3,
        theme: "Spanish Steps & Borghese",
        activities: [
          { time: "09:00", name: "Galleria Borghese", emoji: "🎨" },
          { time: "12:00", name: "Spanish Steps & luxury shopping", emoji: "🛍️" },
          { time: "15:00", name: "Appian Way bike ride", emoji: "🚲" },
          { time: "19:00", name: "Supplì & aperitivo farewell", emoji: "🍷" },
        ],
      },
    ],
    restaurants: [
      { name: "Da Enzo al 29", cuisine: "Trastevere trattoria · $$", emoji: "🍝" },
      { name: "Pizzarium Bonci", cuisine: "Pizza al taglio · $", emoji: "🍕" },
      { name: "Roscioli", cuisine: "Deli & pasta · $$", emoji: "🧀" },
    ],
    city: "Rome",
    country: "Italy",
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
  },
  {
    id: "barcelona-art-architecture",
    title: "Barcelona Art & Architecture",
    coverImage: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80",
    gradient: "from-red-500 to-orange-600",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 450,
    currency: "EUR",
    tags: ["Culture", "Foodie", "Beaches"],
    excerpt:
      "Gaudí's masterpieces, tapas crawls, and Mediterranean sun — Barcelona where art meets the sea.",
    weatherTip:
      "May–June and September–October are perfect. Summers are hot and crowded; winters are mild.",
    fullDays: [
      {
        day: 1,
        theme: "Gaudí's Masterpieces",
        activities: [
          { time: "09:00", name: "Sagrada Família", emoji: "⛪" },
          { time: "12:00", name: "Park Güell mosaic walk", emoji: "🎨" },
          { time: "15:00", name: "Casa Batlló & Passeig de Gràcia", emoji: "🏛️" },
          { time: "19:00", name: "El Born tapas crawl", emoji: "🥘" },
        ],
      },
      {
        day: 2,
        theme: "Gothic Quarter & Beach",
        activities: [
          { time: "09:00", name: "Gothic Quarter & Cathedral", emoji: "🏰" },
          { time: "12:00", name: "La Boqueria market lunch", emoji: "🍊" },
          { time: "15:00", name: "Barceloneta Beach afternoon", emoji: "🏖️" },
          { time: "20:00", name: "Flamenco show & dinner", emoji: "💃" },
        ],
      },
      {
        day: 3,
        theme: "Montjuïc & Magic Fountain",
        activities: [
          { time: "09:00", name: "Montjuïc cable car & castle", emoji: "🏔️" },
          { time: "12:00", name: "Picasso Museum", emoji: "🖼️" },
          { time: "16:00", name: "Casa Milà (La Pedrera)", emoji: "🏗️" },
          { time: "21:00", name: "Magic Fountain light show", emoji: "🎆" },
        ],
      },
    ],
    restaurants: [
      { name: "Cervecería Catalana", cuisine: "Tapas · $$", emoji: "🥘" },
      { name: "La Boqueria Pinotxo Bar", cuisine: "Market stall · $", emoji: "🍊" },
      { name: "Tickets", cuisine: "Avant-garde tapas · $$$", emoji: "🎭" },
    ],
    city: "Barcelona",
    country: "Spain",
    airport: {
      iata: "BCN",
      icao: "LEBL",
      name: "Josep Tarradellas Barcelona–El Prat Airport",
      city: "Barcelona",
      country: "Spain",
      timezone: "Europe/Madrid",
      latitude: 41.2974,
      longitude: 2.0833,
    },
    travelStyle: "cultural",
    interests: ["museums", "food", "beaches"],
  },
  {
    id: "amsterdam-canal-romance",
    title: "Amsterdam Canal Romance",
    coverImage: "https://images.unsplash.com/photo-1534351590666-13e3e96b5571?w=800&q=80",
    gradient: "from-blue-500 to-indigo-700",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 400,
    currency: "EUR",
    tags: ["Culture", "Museums", "Slow Travel"],
    excerpt:
      "Canal cruises, Van Gogh's colours, and windmill day trips — Amsterdam at its most charming pace.",
    weatherTip:
      "April–May (tulip season) and September are best. Winters are dark and rainy; summers are mild.",
    fullDays: [
      {
        day: 1,
        theme: "Canal Ring & Museums",
        activities: [
          { time: "09:00", name: "Van Gogh Museum", emoji: "🌻" },
          { time: "12:00", name: "Rijksmuseum highlights", emoji: "🖼️" },
          { time: "15:00", name: "Canal cruise (1 hour)", emoji: "🛶" },
          { time: "19:00", name: "Jordaan neighbourhood dinner", emoji: "🍷" },
        ],
      },
      {
        day: 2,
        theme: "Anne Frank & Vondelpark",
        activities: [
          { time: "09:00", name: "Anne Frank House", emoji: "📖" },
          { time: "12:00", name: "Vondelpark picnic", emoji: "🌳" },
          { time: "15:00", name: "De Pijp & Albert Cuyp Market", emoji: "🧀" },
          { time: "19:00", name: "Red Light District walk", emoji: "🏮" },
        ],
      },
      {
        day: 3,
        theme: "Zaanse Schans Windmills",
        activities: [
          { time: "09:00", name: "Zaanse Schans windmill village", emoji: "🌬️" },
          { time: "12:00", name: "Cheese tasting & clog workshop", emoji: "🧀" },
          { time: "15:00", name: "Volendam fishing village", emoji: "🐟" },
          { time: "19:00", name: "Farewell Indonesian rijsttafel", emoji: "🍛" },
        ],
      },
    ],
    restaurants: [
      { name: "The Pancake Bakery", cuisine: "Dutch pancakes · $$", emoji: "🥞" },
      { name: "Restaurant Blauw", cuisine: "Indonesian rijsttafel · $$", emoji: "🍛" },
      { name: "Winkel 43", cuisine: "Apple pie · $", emoji: "🥧" },
    ],
    city: "Amsterdam",
    country: "Netherlands",
    airport: {
      iata: "AMS",
      icao: "EHAM",
      name: "Amsterdam Airport Schiphol",
      city: "Amsterdam",
      country: "Netherlands",
      timezone: "Europe/Amsterdam",
      latitude: 52.3105,
      longitude: 4.7683,
    },
    travelStyle: "relaxed",
    interests: ["museums", "food", "history"],
  },
  {
    id: "zurich-swiss-lakes",
    title: "Zurich Swiss Lakes",
    coverImage: null,
    gradient: "from-sky-400 to-blue-700",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 2,
    estimatedCost: 500,
    currency: "CHF",
    tags: ["Nature", "Shopping", "Slow Travel"],
    excerpt:
      "Bahnhofstrasse elegance, Lake Zurich serenity, and Swiss chocolate indulgence — two pristine Swiss days.",
    weatherTip:
      "June–September is warmest and best. December–February for Christmas markets. Spring is unpredictable.",
    fullDays: [
      {
        day: 1,
        theme: "Old Town & Lake",
        activities: [
          { time: "09:00", name: "Bahnhofstrasse luxury shopping", emoji: "🛍️" },
          { time: "12:00", name: "Old Town (Altstadt) walk & fondue lunch", emoji: "🧀" },
          { time: "15:00", name: "Lake Zurich boat cruise", emoji: "⛵" },
          { time: "19:00", name: "Grossmünster church & riverside dinner", emoji: "⛪" },
        ],
      },
      {
        day: 2,
        theme: "Chocolate & Mountains",
        activities: [
          { time: "09:00", name: "Lindt Chocolate Factory tour", emoji: "🍫" },
          { time: "12:00", name: "Uetliberg mountain viewpoint", emoji: "🏔️" },
          { time: "15:00", name: "Kunsthaus Zurich art museum", emoji: "🖼️" },
          { time: "18:00", name: "Swiss raclette farewell dinner", emoji: "🧀" },
        ],
      },
    ],
    restaurants: [
      { name: "Zeughauskeller", cuisine: "Traditional Swiss · $$", emoji: "🧀" },
      { name: "Sprüngli", cuisine: "Swiss chocolate & café · $$", emoji: "🍫" },
      { name: "Kronenhalle", cuisine: "Classic European · $$$$", emoji: "🍽️" },
    ],
    city: "Zurich",
    country: "Switzerland",
    airport: {
      iata: "ZRH",
      icao: "LSZH",
      name: "Zurich Airport",
      city: "Zurich",
      country: "Switzerland",
      timezone: "Europe/Zurich",
      latitude: 47.4647,
      longitude: 8.5492,
    },
    travelStyle: "relaxed",
    interests: ["nature", "shopping", "food"],
  },
  {
    id: "prague-fairy-tale",
    title: "Prague Fairy Tale",
    coverImage: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800&q=80",
    gradient: "from-stone-500 to-amber-700",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 8000,
    currency: "CZK",
    tags: ["History", "Culture", "Budget"],
    excerpt:
      "Charles Bridge at dawn, Prague Castle at dusk, and Astronomical Clock magic — a fairy tale come to life.",
    weatherTip:
      "May–June and September are ideal. Christmas season is magical but cold. Summers can be crowded.",
    fullDays: [
      {
        day: 1,
        theme: "Old Town & Jewish Quarter",
        activities: [
          { time: "09:00", name: "Old Town Square & Astronomical Clock", emoji: "🕰️" },
          { time: "11:00", name: "Jewish Quarter & synagogues", emoji: "🕍" },
          { time: "14:00", name: "Wenceslas Square & lunch", emoji: "🍲" },
          { time: "19:00", name: "Vltava River evening cruise", emoji: "🛶" },
        ],
      },
      {
        day: 2,
        theme: "Prague Castle & Malá Strana",
        activities: [
          { time: "08:00", name: "Charles Bridge at sunrise", emoji: "🌉" },
          { time: "09:30", name: "Prague Castle & St. Vitus Cathedral", emoji: "🏰" },
          { time: "13:00", name: "Malá Strana lunch & Lennon Wall", emoji: "🎨" },
          { time: "17:00", name: "Petřín Hill observation tower", emoji: "🗼" },
          { time: "20:00", name: "Czech beer hall dinner", emoji: "🍺" },
        ],
      },
      {
        day: 3,
        theme: "Day Trip to Kutná Hora",
        activities: [
          { time: "08:30", name: "Train to Kutná Hora", emoji: "🚂" },
          { time: "10:00", name: "Sedlec Ossuary (Bone Church)", emoji: "💀" },
          { time: "12:30", name: "St. Barbara's Cathedral", emoji: "⛪" },
          { time: "15:00", name: "Return & trdelník farewell", emoji: "🥐" },
        ],
      },
    ],
    restaurants: [
      { name: "Lokál Dlouhááá", cuisine: "Czech pub food · $$", emoji: "🍺" },
      { name: "Café Louvre", cuisine: "Historic café · $$", emoji: "☕" },
      { name: "Good Food Bakery", cuisine: "Trdelník (chimney cake) · $", emoji: "🥐" },
    ],
    city: "Prague",
    country: "Czech Republic",
    airport: {
      iata: "PRG",
      icao: "LKPR",
      name: "Václav Havel Airport Prague",
      city: "Prague",
      country: "Czech Republic",
      timezone: "Europe/Prague",
      latitude: 50.1008,
      longitude: 14.26,
    },
    travelStyle: "cultural",
    interests: ["history", "museums", "food"],
  },
  // ── Americas ────────────────────────────────────────────────────────
  {
    id: "los-angeles-hollywood",
    title: "Los Angeles Hollywood Dream",
    coverImage: "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800&q=80",
    gradient: "from-yellow-400 to-pink-600",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 800,
    currency: "USD",
    tags: ["Culture", "Shopping", "Beaches"],
    excerpt:
      "Hollywood signs, Universal Studios thrills, and Santa Monica sunsets — three days of LA dreams.",
    weatherTip:
      "Year-round sunshine. June Gloom brings morning fog. Best September–November for clear skies.",
    fullDays: [
      {
        day: 1,
        theme: "Hollywood & Griffith",
        activities: [
          { time: "09:00", name: "Hollywood Walk of Fame & TCL Theatre", emoji: "⭐" },
          { time: "12:00", name: "Griffith Observatory & Hollywood sign view", emoji: "🔭" },
          { time: "16:00", name: "Sunset Boulevard drive", emoji: "🌅" },
          { time: "19:00", name: "Dinner in West Hollywood", emoji: "🍽️" },
        ],
      },
      {
        day: 2,
        theme: "Universal Studios & Studio Tour",
        activities: [
          { time: "08:00", name: "Universal Studios full day", emoji: "🎢" },
          { time: "13:00", name: "Studio Tour backlot", emoji: "🎬" },
          { time: "18:00", name: "CityWalk dinner & entertainment", emoji: "🎸" },
        ],
      },
      {
        day: 3,
        theme: "Santa Monica & Venice",
        activities: [
          { time: "09:00", name: "Santa Monica Pier & beach", emoji: "🎡" },
          { time: "12:00", name: "Venice Beach boardwalk & canals", emoji: "🏄" },
          { time: "15:00", name: "Rodeo Drive window shopping", emoji: "💎" },
          { time: "19:00", name: "Fareword dinner in Beverly Hills", emoji: "🍷" },
        ],
      },
    ],
    restaurants: [
      { name: "In-N-Out Burger", cuisine: "Classic burger · $", emoji: "🍔" },
      { name: "Grand Central Market", cuisine: "Food hall · $$", emoji: "🌮" },
      { name: "Nobu Malibu", cuisine: "Japanese fine dining · $$$$", emoji: "🍣" },
    ],
    city: "Los Angeles",
    country: "USA",
    airport: {
      iata: "LAX",
      icao: "KLAX",
      name: "Los Angeles International Airport",
      city: "Los Angeles",
      country: "USA",
      timezone: "America/Los_Angeles",
      latitude: 33.9425,
      longitude: -118.408,
    },
    travelStyle: "active",
    interests: ["shopping", "beaches", "food"],
  },
  {
    id: "san-francisco-bay",
    title: "San Francisco Bay Style",
    coverImage: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80",
    gradient: "from-orange-400 to-red-600",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 850,
    currency: "USD",
    tags: ["Culture", "Foodie", "Nature"],
    excerpt:
      "Golden Gate fog, Fisherman's Wharf clam chowder, and Silicon Valley vibes — the City by the Bay.",
    weatherTip:
      "September–October is the warmest. Summer fog (Karl) is famous. Pack layers — weather changes fast.",
    fullDays: [
      {
        day: 1,
        theme: "Golden Gate & Presidio",
        activities: [
          { time: "08:00", name: "Golden Gate Bridge walk or bike", emoji: "🌉" },
          { time: "11:00", name: "Presidio & Palace of Fine Arts", emoji: "🏛️" },
          { time: "14:00", name: "Fisherman's Wharf & Pier 39 sea lions", emoji: "🦭" },
          { time: "19:00", name: "Chinatown dinner", emoji: "🥢" },
        ],
      },
      {
        day: 2,
        theme: "Alcatraz & North Beach",
        activities: [
          { time: "09:00", name: "Alcatraz Island tour", emoji: "🏝️" },
          { time: "13:00", name: "North Beach Italian lunch", emoji: "🍝" },
          { time: "16:00", name: "Lombard Street crooked walk", emoji: "🏘️" },
          { time: "19:00", name: "Mission District murals & tacos", emoji: "🌮" },
        ],
      },
      {
        day: 3,
        theme: "Silicon Valley & Haight",
        activities: [
          { time: "09:00", name: "Apple Park Visitor Center", emoji: "🍎" },
          { time: "12:00", name: "Haight-Ashbury vintage shops", emoji: "🎸" },
          { time: "15:00", name: "Golden Gate Park & Japanese Tea Garden", emoji: "🍵" },
          { time: "19:00", name: "Ferry Building artisan dinner", emoji: "🧀" },
        ],
      },
    ],
    restaurants: [
      { name: "Tartine Bakery", cuisine: "Artisan bread & pastries · $$", emoji: "🥖" },
      { name: "Swan Oyster Depot", cuisine: "Fresh oysters · $$$", emoji: "🦪" },
      { name: "La Taqueria", cuisine: "Mission burrito · $", emoji: "🌮" },
    ],
    city: "San Francisco",
    country: "USA",
    airport: {
      iata: "SFO",
      icao: "KSFO",
      name: "San Francisco International Airport",
      city: "San Francisco",
      country: "USA",
      timezone: "America/Los_Angeles",
      latitude: 37.6213,
      longitude: -122.379,
    },
    travelStyle: "active",
    interests: ["food", "nature", "museums"],
  },
  {
    id: "vancouver-nature-city",
    title: "Vancouver Nature & City",
    coverImage: null,
    gradient: "from-green-500 to-sky-600",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 900,
    currency: "CAD",
    tags: ["Nature", "Foodie", "Active"],
    excerpt:
      "Stanley Park trails, Capilano suspension bridge, and Grouse Mountain — Vancouver where city meets wilderness.",
    weatherTip:
      "June–September is the driest and warmest. Winters are rainy but mild. Ski season runs December–March.",
    fullDays: [
      {
        day: 1,
        theme: "Stanley Park & Downtown",
        activities: [
          { time: "09:00", name: "Stanley Park seawall bike ride", emoji: "🌳" },
          { time: "12:00", name: "Granville Island Public Market lunch", emoji: "🥗" },
          { time: "15:00", name: "Gastown Steam Clock & boutiques", emoji: "🕰️" },
          { time: "19:00", name: "Yaletown dinner", emoji: "🍽️" },
        ],
      },
      {
        day: 2,
        theme: "Capilano & Grouse Mountain",
        activities: [
          { time: "09:00", name: "Capilano Suspension Bridge", emoji: "🌉" },
          { time: "12:00", name: "Grouse Mountain skyride", emoji: "🏔️" },
          { time: "15:00", name: "Lighthouse Park ocean view", emoji: "🗼" },
          { time: "19:00", name: "Richmond Night Market (weekends)", emoji: "🍢" },
        ],
      },
      {
        day: 3,
        theme: "Whistler Day Trip",
        activities: [
          { time: "08:00", name: "Sea to Sky Highway drive", emoji: "🚗" },
          { time: "10:00", name: "Whistler Village & Peak 2 Peak gondola", emoji: "🚡" },
          { time: "14:00", name: "Shannon Falls hike", emoji: "🌊" },
          { time: "18:00", name: "Return & sushi dinner", emoji: "🍣" },
        ],
      },
    ],
    restaurants: [
      { name: "Miku", cuisine: "Aburi sushi · $$$", emoji: "🍣" },
      { name: "Granville Island stalls", cuisine: "Market food · $", emoji: "🥗" },
      { name: "Japadog", cuisine: "Japanese hot dogs · $", emoji: "🌭" },
    ],
    city: "Vancouver",
    country: "Canada",
    airport: {
      iata: "YVR",
      icao: "CYVR",
      name: "Vancouver International Airport",
      city: "Vancouver",
      country: "Canada",
      timezone: "America/Vancouver",
      latitude: 49.1947,
      longitude: -123.1792,
    },
    travelStyle: "active",
    interests: ["nature", "food", "sports"],
  },
  {
    id: "mexico-city-ancient-culture",
    title: "Mexico City Ancient Culture",
    coverImage: null,
    gradient: "from-lime-500 to-green-700",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 8000,
    currency: "MXN",
    tags: ["History", "Foodie", "Culture"],
    excerpt:
      "Aztec pyramids, Frida Kahlo's blue house, and taco stands that define a culinary civilization.",
    weatherTip:
      "March–May is the warmest and driest. June–September is rainy season (afternoon showers). December is festive.",
    fullDays: [
      {
        day: 1,
        theme: "Zócalo & Historic Centre",
        activities: [
          { time: "09:00", name: "Zócalo & Metropolitan Cathedral", emoji: "⛪" },
          { time: "11:00", name: "Templo Mayor Aztec ruins", emoji: "🏛️" },
          { time: "14:00", name: "San Juan Market taco lunch", emoji: "🌮" },
          { time: "17:00", name: "Palacio de Bellas Artes", emoji: "🎨" },
          { time: "20:00", name: "Roma Norte mezcal bar", emoji: "🥃" },
        ],
      },
      {
        day: 2,
        theme: "Teotihuacán Pyramids",
        activities: [
          { time: "08:00", name: "Teotihuacán Sun & Moon Pyramids", emoji: "🏛️" },
          { time: "13:00", name: "Pulque tasting & lunch", emoji: "🥛" },
          { time: "16:00", name: "Basilica of Our Lady of Guadalupe", emoji: "⛪" },
          { time: "19:00", name: "Condesa neighbourhood dinner", emoji: "🍽️" },
        ],
      },
      {
        day: 3,
        theme: "Coyoacán & Frida Kahlo",
        activities: [
          { time: "09:00", name: "Frida Kahlo Museum (Casa Azul)", emoji: "🎨" },
          { time: "12:00", name: "Coyoacán Market lunch", emoji: "🥟" },
          { time: "15:00", name: "Chapultepec Castle & park", emoji: "🏰" },
          { time: "19:00", name: "Farewell mole & mariachi", emoji: "🎵" },
        ],
      },
    ],
    restaurants: [
      { name: "Pujol", cuisine: "Modern Mexican · $$$$", emoji: "🌮" },
      { name: "El Huequito", cuisine: "Tacos al pastor · $", emoji: "🥙" },
      { name: "Mercado San Juan", cuisine: "Market food · $", emoji: "🧀" },
    ],
    city: "Mexico City",
    country: "Mexico",
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
  },
  // ── Oceania ─────────────────────────────────────────────────────────
  {
    id: "melbourne-arts-coffee",
    title: "Melbourne Arts & Coffee",
    coverImage: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    gradient: "from-slate-600 to-zinc-800",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 900,
    currency: "AUD",
    tags: ["Culture", "Foodie", "Nature"],
    excerpt:
      "Great Ocean Road adventure, penguin parades, and laneway café culture — Melbourne's creative soul.",
    weatherTip:
      "March–May and September–November are most pleasant. Summers can be very hot; winters are cool and grey.",
    fullDays: [
      {
        day: 1,
        theme: "Laneways & Coffee",
        activities: [
          { time: "09:00", name: "Degraves Street laneway coffee", emoji: "☕" },
          { time: "11:00", name: "Hosier Lane street art", emoji: "🎨" },
          { time: "14:00", name: "Queen Victoria Market", emoji: "🛍️" },
          { time: "17:00", name: "Federation Square & Yarra River", emoji: "🌊" },
          { time: "19:30", name: "Lygon Street Italian dinner", emoji: "🍝" },
        ],
      },
      {
        day: 2,
        theme: "Great Ocean Road",
        activities: [
          { time: "07:00", name: "Great Ocean Road drive", emoji: "🚗" },
          { time: "10:30", name: "Twelve Apostles lookout", emoji: "🏔️" },
          { time: "13:00", name: "Loch Ard Gorge & lunch", emoji: "🌊" },
          { time: "18:00", name: "Return to Melbourne", emoji: "🌆" },
        ],
      },
      {
        day: 3,
        theme: "Penguin Island & St Kilda",
        activities: [
          { time: "09:00", name: "Phillip Island Penguin Parade", emoji: "🐧" },
          { time: "13:00", name: "St Kilda Beach & Luna Park", emoji: "🏖️" },
          { time: "16:00", name: "Royal Botanic Gardens", emoji: "🌿" },
          { time: "19:00", name: "Southbank farewell dinner", emoji: "🍷" },
        ],
      },
    ],
    restaurants: [
      { name: "Attica", cuisine: "Modern Australian · $$$$", emoji: "🍽️" },
      { name: "Market Lane Coffee", cuisine: "Specialty coffee · $", emoji: "☕" },
      { name: "Chin Chin", cuisine: "Asian fusion · $$", emoji: "🍜" },
    ],
    city: "Melbourne",
    country: "Australia",
    airport: {
      iata: "MEL",
      icao: "YMML",
      name: "Melbourne Airport",
      city: "Melbourne",
      country: "Australia",
      timezone: "Australia/Melbourne",
      latitude: -37.669,
      longitude: 144.841,
    },
    travelStyle: "cultural",
    interests: ["food", "nature", "museums"],
  },
  {
    id: "auckland-sail-city",
    title: "Auckland City of Sails",
    coverImage: null,
    gradient: "from-cyan-500 to-blue-700",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 1000,
    currency: "NZD",
    tags: ["Nature", "Adventure", "Culture"],
    excerpt:
      "Sky Tower thrills, Hobbiton magic, and volcanic crater walks — Auckland, the City of Sails.",
    weatherTip:
      "December–March is summer and the best time. Winters (June–August) are mild but rainy.",
    fullDays: [
      {
        day: 1,
        theme: "Sky Tower & Waterfront",
        activities: [
          { time: "09:00", name: "Sky Tower observation & skywalk", emoji: "🗼" },
          { time: "12:00", name: "Viaduct Harbour lunch", emoji: "🐟" },
          { time: "15:00", name: "Wynyard Quarter & Silo Park", emoji: "🌊" },
          { time: "19:00", name: "Britomart dinner district", emoji: "🍽️" },
        ],
      },
      {
        day: 2,
        theme: "Hobbiton Day Trip",
        activities: [
          { time: "07:30", name: "Drive to Matamata Hobbiton", emoji: "🚗" },
          { time: "10:00", name: "Hobbiton Movie Set tour", emoji: "🧙" },
          { time: "13:00", name: "Green Dragon Inn lunch", emoji: "🍺" },
          { time: "16:00", name: "Waitomo Glowworm Caves", emoji: "✨" },
          { time: "20:00", name: "Return to Auckland", emoji: "🌆" },
        ],
      },
      {
        day: 3,
        theme: "Volcanoes & Beaches",
        activities: [
          { time: "09:00", name: "Rangitoto Island volcano hike", emoji: "🌋" },
          { time: "13:00", name: "Devonport village lunch", emoji: "🥧" },
          { time: "15:30", name: "Mount Eden summit 360° view", emoji: "🏔️" },
          { time: "18:00", name: "Piha Beach sunset (black sand)", emoji: "🏖️" },
        ],
      },
    ],
    restaurants: [
      { name: "Orbit 360° Dining", cuisine: "Revolving restaurant · $$$", emoji: "🗼" },
      { name: "Depot Eatery", cuisine: "New Zealand · $$", emoji: "🦪" },
      { name: "Federal Delicatessen", cuisine: "NY-style deli · $$", emoji: "🥪" },
    ],
    city: "Auckland",
    country: "New Zealand",
    airport: {
      iata: "AKL",
      icao: "NZAA",
      name: "Auckland Airport",
      city: "Auckland",
      country: "New Zealand",
      timezone: "Pacific/Auckland",
      latitude: -37.0082,
      longitude: 174.785,
    },
    travelStyle: "adventure",
    interests: ["nature", "sports", "food"],
  },
  {
    // Event template: 2026 Singapore Grand Prix (Oct 9-11, Sprint weekend, Marina Bay).
    id: "singapore-gp-2026",
    title: "Singapore Grand Prix 2026 Race Weekend",
    coverImage: null,
    gradient: "from-red-600 to-rose-800",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 540,
    currency: "SGD",
    tags: ["Sports", "Nightlife", "Events"],
    excerpt:
      "Formula 1's original night race under the Marina Bay floodlights — practice Friday, Sprint Saturday, Grand Prix Sunday, with hawker dinners between sessions.",
    weatherTip:
      "The 2026 Singapore Grand Prix runs October 9-11. Tropical heat and evening thunderstorms are possible — the grandstands are covered, but plan for humidity.",
    fullDays: [
      {
        day: 1,
        theme: "Arrival & Friday practice",
        activities: [
          { time: "14:00", name: "Check in near City Hall or Marina Bay", emoji: "🏨" },
          { time: "17:00", name: "Maxwell Food Centre hawker dinner", emoji: "🍚" },
          { time: "20:00", name: "Marina Bay Circuit · Friday practice", emoji: "🏎️" },
          { time: "22:30", name: "Riverside walk along Boat Quay", emoji: "🌃" },
        ],
      },
      {
        day: 2,
        theme: "Sprint Saturday",
        activities: [
          { time: "09:00", name: "Gardens by the Bay & Cloud Forest", emoji: "🌳" },
          { time: "13:00", name: "Lau Pa Sat lunch satay street", emoji: "🍢" },
          { time: "16:00", name: "Marina Bay Circuit · Sprint & Qualifying", emoji: "🏁" },
          { time: "21:00", name: "Post-session concerts in Zone 4", emoji: "🎵" },
        ],
      },
      {
        day: 3,
        theme: "Race Sunday",
        activities: [
          { time: "10:00", name: "Chinatown & Sri Mariamman Temple stroll", emoji: "🏮" },
          { time: "14:00", name: "Early dinner before track gates", emoji: "🍜" },
          { time: "18:00", name: "Singapore Grand Prix under the lights", emoji: "🏎️" },
          { time: "23:00", name: "Marina Bay Sands SkyPark nightcap", emoji: "🍸" },
        ],
      },
    ],
    restaurants: [
      { name: "Maxwell Food Centre", cuisine: "Hawker centre · $", emoji: "🍚" },
      { name: "Lau Pa Sat", cuisine: "Satay street · $", emoji: "🍢" },
      { name: "Satay by the Bay", cuisine: "Waterfront BBQ · $", emoji: "🍗" },
    ],
    city: "Singapore",
    country: "Singapore",
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
    travelStyle: "active",
    interests: ["sports", "nightlife", "food"],
  },
  {
    // Event template: Oktoberfest Munich 2026 (Sept 19 - Oct 4, Theresienwiese).
    id: "oktoberfest-munich-2026",
    title: "Oktoberfest Munich 2026 Long Weekend",
    coverImage: null,
    gradient: "from-amber-500 to-orange-700",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 450,
    currency: "USD",
    tags: ["Events", "Foodie", "Culture"],
    excerpt:
      "Three days at the Wiesn and beyond — the Saturday tapping ceremony at noon, beer-garden lunches in the Englischer Garten, and Munich's palaces between steins.",
    weatherTip:
      "Oktoberfest 2026 runs September 19 to October 4. Mid-week visits are quieter; weekends fill the tents by mid-morning.",
    fullDays: [
      {
        day: 1,
        theme: "Old town & warm-up",
        activities: [
          { time: "13:00", name: "Marienplatz & the Rathaus-Glockenspiel", emoji: "🏙️" },
          { time: "15:00", name: "Viktualienmarkt beer-garden lunch", emoji: "🍺" },
          { time: "17:00", name: "English Garden & Eisbach surf wave", emoji: "🏄" },
          { time: "19:00", name: "Dinner in a traditional gasthaus", emoji: "🍖" },
        ],
      },
      {
        day: 2,
        theme: "Opening Saturday at the Wiesn",
        activities: [
          { time: "09:00", name: "Landlords' parade to the Theresienwiese", emoji: "🐴" },
          { time: "12:00", name: "'O'zapft is!' — the tapping ceremony", emoji: "🍻" },
          { time: "14:00", name: "Big-tent lunch & liter stein", emoji: "🥨" },
          { time: "18:00", name: "Ferris wheel over the festival lights", emoji: "🎡" },
        ],
      },
      {
        day: 3,
        theme: "Oide Wiesn & palaces",
        activities: [
          { time: "10:00", name: "Oide Wiesn historical festival section", emoji: "🎠" },
          { time: "13:00", name: "Nymphenburg Palace gardens", emoji: "🏰" },
          { time: "16:00", name: "Deutsches Museum highlights", emoji: "⚙️" },
          { time: "19:00", name: "Hofbräuhaus farewell dinner", emoji: "🎺" },
        ],
      },
    ],
    restaurants: [
      { name: "Hofbräuhaus am Platzl", cuisine: "Bavarian · $$", emoji: "🍺" },
      { name: "Augustiner Keller", cuisine: "Beer garden · $$", emoji: "🥨" },
      { name: "Viktualienmarkt stalls", cuisine: "Street food · $", emoji: "🥒" },
    ],
    city: "Munich",
    country: "Germany",
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
    travelStyle: "foodie",
    interests: ["food", "nightlife", "history"],
  },
  {
    // Event template: 2026 United States GP at COTA, Austin (Oct 23-25).
    id: "austin-f1-2026",
    title: "Austin F1 Grand Prix 2026 at COTA",
    coverImage: null,
    gradient: "from-red-600 to-blue-800",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 450,
    currency: "USD",
    tags: ["Sports", "Foodie", "Music"],
    excerpt:
      "The United States Grand Prix at Circuit of the Americas — general-admission hillside viewing, brisket before qualifying, and live music on Sixth Street after the flag.",
    weatherTip:
      "The 2026 United States Grand Prix runs October 23-25. Austin in late October is warm and mostly dry — bring sun protection for the COTA expanses.",
    fullDays: [
      {
        day: 1,
        theme: "Downtown Austin warm-up",
        activities: [
          { time: "12:00", name: "Congress Avenue & State Capitol walk", emoji: "🏛️" },
          { time: "14:00", name: "Breakfast taco & BBQ crawl", emoji: "🥩" },
          { time: "16:30", name: "Congress Bridge bat flight at dusk", emoji: "🦇" },
          { time: "20:00", name: "Live music on Sixth Street", emoji: "🎸" },
        ],
      },
      {
        day: 2,
        theme: "Qualifying Saturday at COTA",
        activities: [
          { time: "09:00", name: "Drive out to Circuit of the Americas", emoji: "🚗" },
          { time: "11:00", name: "Fan zones & F1 Miami-style paddock vibes", emoji: "🎪" },
          { time: "15:00", name: "Qualifying session at Turn 1 climb", emoji: "🏁" },
          { time: "20:00", name: "Rainey Street food trucks", emoji: "🌮" },
        ],
      },
      {
        day: 3,
        theme: "Race Sunday",
        activities: [
          { time: "10:00", name: "Lady Bird Lake morning walk", emoji: "🌅" },
          { time: "12:00", name: "Grand Prix — main straight grandstand", emoji: "🏎️" },
          { time: "17:00", name: "Post-race celebrations downtown", emoji: "🥃" },
          { time: "19:00", name: "Farewell Texas BBQ dinner", emoji: "🔥" },
        ],
      },
    ],
    restaurants: [
      { name: "Franklin Barbecue", cuisine: "Texas BBQ · $", emoji: "🥩" },
      { name: "Veracruz All Natural", cuisine: "Tacos · $", emoji: "🌮" },
      { name: "Cooper's Old Time Pit Bar-B-Que", cuisine: "Hill country BBQ · $$", emoji: "🍖" },
    ],
    city: "Austin",
    country: "United States",
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
    interests: ["sports", "food", "nightlife"],
  },
  {
    // Event template: 2026 Mexico City GP (Oct 30 - Nov 1, Autódromo Hermanos Rodríguez).
    id: "mexico-city-f1-2026",
    title: "Mexico City F1 Grand Prix 2026 Weekend",
    coverImage: null,
    gradient: "from-green-600 to-red-700",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 8000,
    currency: "MXN",
    tags: ["Sports", "Culture", "Foodie"],
    excerpt:
      "The Mexican Grand Prix through the Foro Sol stadium section — packed grandstands, mariachi trackside, plus taquerías, murals and pyramids around the race weekend.",
    weatherTip:
      "The 2026 Mexico City Grand Prix runs October 30 to November 1. Late October is the end of the rainy season — mild days, possible afternoon showers.",
    fullDays: [
      {
        day: 1,
        theme: "Centro histórico warm-up",
        activities: [
          { time: "10:00", name: "Zócalo & Metropolitan Cathedral", emoji: "⛪" },
          { time: "12:00", name: "Templo Mayor ruins & museum", emoji: "🏛️" },
          { time: "15:00", name: "Mural tour in the Centro", emoji: "🎨" },
          { time: "19:00", name: "Taquería dinner in Roma Norte", emoji: "🌮" },
        ],
      },
      {
        day: 2,
        theme: "Qualifying at Foro Sol",
        activities: [
          { time: "09:00", name: "Churros & chocolate at El Moro", emoji: "🍩" },
          { time: "12:00", name: "Autódromo Hermanos Rodríguez · Qualifying", emoji: "🏁" },
          { time: "17:00", name: "Frida Kahlo's Casa Azul, Coyoacán", emoji: "💙" },
          { time: "20:00", name: "Coyoacán market dinner", emoji: "🫓" },
        ],
      },
      {
        day: 3,
        theme: "Race Sunday",
        activities: [
          { time: "11:30", name: "Grand Prix — stadium section roar", emoji: "🏎️" },
          { time: "16:00", name: "Chapultepec Park wind-down", emoji: "🌳" },
          { time: "18:00", name: "Roma Norte mezcalería toast", emoji: "🥃" },
        ],
      },
    ],
    restaurants: [
      { name: "El Moro", cuisine: "Churros & chocolate · $", emoji: "🍩" },
      { name: "Taquería El Greco", cuisine: "Tacos al pastor · $", emoji: "🌮" },
      { name: "Mercado de Coyoacán", cuisine: "Market food · $", emoji: "🫓" },
    ],
    city: "Mexico City",
    country: "Mexico",
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
    travelStyle: "active",
    interests: ["sports", "food", "history"],
  },
  {
    // Event template: 2026 Las Vegas GP (Nov 19-21, Strip circuit).
    id: "las-vegas-f1-2026",
    title: "Las Vegas F1 Grand Prix 2026 Strip Weekend",
    coverImage: null,
    gradient: "from-purple-600 to-fuchsia-800",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 540,
    currency: "USD",
    tags: ["Sports", "Nightlife", "Luxury"],
    excerpt:
      "Formula 1 screaming down the Las Vegas Strip at night — Sphere-side viewing, celebrity-chef dinners, and a Red Rock Canyon reset before the race.",
    weatherTip:
      "The 2026 Las Vegas Grand Prix runs November 19-21. Desert nights get cold — pack layers for the evening track sessions.",
    fullDays: [
      {
        day: 1,
        theme: "Strip arrival",
        activities: [
          { time: "15:00", name: "Check in on or near the Strip", emoji: "🏨" },
          { time: "17:00", name: "Bellagio fountains & conservatory", emoji: "⛲" },
          { time: "19:00", name: "Resort-row dinner", emoji: "🍽️" },
          { time: "21:00", name: "Sphere exterior light show", emoji: "🌀" },
        ],
      },
      {
        day: 2,
        theme: "Qualifying night",
        activities: [
          { time: "10:00", name: "Red Rock Canyon scenic drive", emoji: "🏜️" },
          { time: "15:00", name: "F1 fan zone & driver appearances", emoji: "🎪" },
          { time: "22:00", name: "Qualifying under the Vegas lights", emoji: "🏁" },
          { time: "01:00", name: "Late-night lounge, no clock needed", emoji: "🍸" },
        ],
      },
      {
        day: 3,
        theme: "Race Saturday",
        activities: [
          { time: "11:00", name: "Brunch buffet marathon", emoji: "🥞" },
          { time: "16:00", name: "Track walk & grandstand entry", emoji: "🚶" },
          { time: "22:00", name: "Las Vegas Grand Prix on the Strip", emoji: "🏎️" },
          { time: "01:00", name: "Fremont Street nightcap", emoji: "🎰" },
        ],
      },
    ],
    restaurants: [
      { name: "Bouchon Bistro", cuisine: "French · $$$", emoji: "🥐" },
      { name: "Tacos El Gordo", cuisine: "Tijuana-style tacos · $", emoji: "🌮" },
      { name: "Best Friend", cuisine: "Korean BBQ · $$", emoji: "🥩" },
    ],
    city: "Las Vegas",
    country: "United States",
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
    travelStyle: "active",
    interests: ["sports", "nightlife", "food"],
  },
  {
    // Seasonal template: Kyoto autumn foliage (mid-Nov to early Dec peak).
    id: "kyoto-autumn-2026",
    title: "Kyoto Autumn Foliage 4-Day Escape",
    coverImage: null,
    gradient: "from-red-500 to-amber-700",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 4,
    estimatedCost: 560,
    currency: "USD",
    tags: ["Nature", "Culture", "Slow Travel"],
    excerpt:
      "Momiji season in the old capital — vermilion maples at Tōfuku-ji, an Arashiyama river morning, and lantern-lit temple illuminations after dark.",
    weatherTip:
      "Kyoto's autumn foliage typically peaks from mid-November to early December — book accommodation early, it's the busiest scenic window after cherry blossom season.",
    fullDays: [
      {
        day: 1,
        theme: "Higashiyama classics",
        activities: [
          { time: "10:00", name: "Kiyomizu-dera & Sannenzaka lanes", emoji: "⛩️" },
          { time: "13:00", name: "Lunch in a machiya café", emoji: "🍱" },
          { time: "15:00", name: "Kodai-ji maple garden", emoji: "🍁" },
          { time: "18:00", name: "Gion lantern walk at dusk", emoji: "🏮" },
        ],
      },
      {
        day: 2,
        theme: "Arashiyama morning",
        activities: [
          { time: "07:30", name: "Bamboo grove before the crowds", emoji: "🎋" },
          { time: "10:00", name: "Tenryū-ji temple & garden", emoji: "🏯" },
          { time: "13:00", name: "Hozugawa river boat ride", emoji: "🚣" },
          { time: "16:00", name: "Monkey Park Iwatayama sunset", emoji: "🐒" },
        ],
      },
      {
        day: 3,
        theme: "Golden & vermilion",
        activities: [
          { time: "09:00", name: "Fushimi Inari torii hike", emoji: "🦊" },
          { time: "13:00", name: "Uji matcha stop", emoji: "🍵" },
          { time: "15:30", name: "Kinkaku-ji golden pavilion", emoji: "✨" },
          { time: "18:30", name: "Evening illumination at Tōfuku-ji", emoji: "🍁" },
        ],
      },
      {
        day: 4,
        theme: "Nishiki & Nara option",
        activities: [
          { time: "09:00", name: "Nishiki Market food walk", emoji: "🍢" },
          { time: "11:00", name: "Nijō Castle interiors", emoji: "🏰" },
          { time: "14:00", name: "Day trip to Nara's deer park", emoji: "🦌" },
          { time: "19:00", name: "Pontocho farewell dinner", emoji: "🍶" },
        ],
      },
    ],
    restaurants: [
      { name: "Nishiki Market stalls", cuisine: "Street food · $", emoji: "🍢" },
      { name: "Menami", cuisine: "Obanzai home-style · $$", emoji: "🥢" },
      { name: "Katsukura", cuisine: "Tonkatsu · $$", emoji: "🐖" },
    ],
    city: "Kyoto",
    country: "Japan",
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
    interests: ["nature", "history", "food"],
  },
  {
    // Seasonal template: Vienna Christmas markets 2026 (Christkindlmarkt Nov 13 - Dec 26).
    id: "vienna-christmas-markets-2026",
    title: "Vienna Christmas Markets 2026 Weekend",
    coverImage: null,
    gradient: "from-amber-500 to-red-600",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 3,
    estimatedCost: 420,
    currency: "USD",
    tags: ["Culture", "Foodie", "Winter"],
    excerpt:
      "Glühwein under the Rathaus tree — the Christkindlmarkt at Rathausplatz, Schönbrunn's baroque stalls, Klimt at the Belvedere, and waltzes at the Staatsoper.",
    weatherTip:
      "The Wiener Christkindlmarkt at Rathausplatz runs November 13 to December 26, 2026 (daily 10am-10pm). Weekday evenings are less crowded.",
    fullDays: [
      {
        day: 1,
        theme: "Old town advent",
        activities: [
          { time: "14:00", name: "St. Stephen's Cathedral & Graben lights", emoji: "⛪" },
          { time: "16:00", name: "Christkindlmarkt at Rathausplatz", emoji: "🎄" },
          { time: "18:00", name: "Ice skating at the Rathaus rink", emoji: "⛸️" },
          { time: "20:00", name: "Coffee-house dinner & Sachertorte", emoji: "☕" },
        ],
      },
      {
        day: 2,
        theme: "Imperial Vienna",
        activities: [
          { time: "09:30", name: "Schönbrunn Palace tour & market", emoji: "🏰" },
          { time: "14:00", name: "Belvedere — Klimt's 'The Kiss'", emoji: "🖼️" },
          { time: "16:30", name: "Naschmarkt punch stalls", emoji: "🍹" },
          { time: "19:00", name: "Classical concert or Staatsoper", emoji: "🎻" },
        ],
      },
      {
        day: 3,
        theme: "Museums & small markets",
        activities: [
          { time: "10:00", name: "Spittelberg artisan market lanes", emoji: "🛍️" },
          { time: "13:00", name: "Kunsthistorisches Museum", emoji: "🏛️" },
          { time: "16:00", name: "Karlsplatz market & church", emoji: "✨" },
          { time: "19:00", name: "Farewell Glühwein at Rathausplatz", emoji: "🍻" },
        ],
      },
    ],
    restaurants: [
      { name: "Café Sacher", cuisine: "Viennese classic · $$$", emoji: "🍰" },
      { name: "Figlmüller", cuisine: "Wiener Schnitzel · $$", emoji: "🍖" },
      { name: "Naschmarkt stalls", cuisine: "Market food · $", emoji: "🥨" },
    ],
    city: "Vienna",
    country: "Austria",
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
  },
  {
    // Seasonal template: New England fall foliage loop from Boston.
    id: "new-england-fall-foliage-2026",
    title: "New England Fall Foliage 5-Day Loop",
    coverImage: null,
    gradient: "from-orange-500 to-red-700",
    author: { kind: "ai", name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" },
    days: 5,
    estimatedCost: 850,
    currency: "USD",
    tags: ["Nature", "Road Trip", "Slow Travel"],
    excerpt:
      "Boston to the White Mountains and back — covered bridges, Kancamagus Highway colour, Vermont village greens, and cider donuts at every farm stand.",
    weatherTip:
      "Foliage season moves north to south: northern New England typically peaks late September to mid-October, southern areas mid-October. Watch regional foliage reports before locking dates.",
    fullDays: [
      {
        day: 1,
        theme: "Boston arrival",
        activities: [
          { time: "13:00", name: "Freedom Walk through downtown", emoji: "🗽" },
          { time: "16:00", name: "Boston Public Garden autumn strolls", emoji: "🍂" },
          { time: "19:00", name: "North End Italian dinner", emoji: "🍝" },
        ],
      },
      {
        day: 2,
        theme: "White Mountains, New Hampshire",
        activities: [
          { time: "09:00", name: "Drive north to North Conway", emoji: "🚗" },
          { time: "11:00", name: "Kancamagus Highway scenic stops", emoji: "🍁" },
          { time: "14:00", name: "Covered bridge loop", emoji: "🌉" },
          { time: "17:00", name: "Sunset from Cathedral Ledge", emoji: "🌄" },
        ],
      },
      {
        day: 3,
        theme: "Vermont villages",
        activities: [
          { time: "09:00", name: "Stowe village & church steeple", emoji: "⛪" },
          { time: "11:00", name: "Smugglers' Notch drive", emoji: "⛰️" },
          { time: "14:00", name: "Ben & Jerry's factory tour", emoji: "🍦" },
          { time: "17:00", name: "Cider donuts at a farm stand", emoji: "🍩" },
        ],
      },
      {
        day: 4,
        theme: "Green Mountains south",
        activities: [
          { time: "09:00", name: "Woodstock village green", emoji: "🏡" },
          { time: "11:30", name: "Quechee Gorge walk", emoji: "🏞️" },
          { time: "14:00", name: "Maple syrup farm visit", emoji: "🍁" },
          { time: "18:00", name: "Fireside inn dinner", emoji: "🔥" },
        ],
      },
      {
        day: 5,
        theme: "Back to Boston",
        activities: [
          { time: "09:00", name: "Morning foliage hike", emoji: "🥾" },
          { time: "12:00", name: "Scenic drive back via Wachusett", emoji: "🚙" },
          { time: "16:00", name: "Cambridge & Harvard Yard walk", emoji: "🎓" },
          { time: "19:00", name: "Seafood farewell dinner", emoji: "🦞" },
        ],
      },
    ],
    restaurants: [
      { name: "Polly's Pancake Parlor", cuisine: "New Hampshire · $", emoji: "🥞" },
      { name: "Simon Pearce", cuisine: "Vermont farm-to-table · $$$", emoji: "🍷" },
      { name: "Union Oyster House", cuisine: "Boston chowder · $$", emoji: "🦪" },
    ],
    city: "Boston",
    country: "United States",
    airport: {
      iata: "BOS",
      icao: "KBOS",
      name: "Boston Logan International Airport",
      city: "Boston",
      country: "United States",
      timezone: "America/New_York",
      latitude: 42.3656,
      longitude: -71.0096,
    },
    travelStyle: "relaxed",
    interests: ["nature", "food", "history"],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────

/**
 * 将 RawTrip 字面量派生为规范 Trip：
 * - slug = id（URL 友好的唯一标识）
 * - description = excerpt（SEO 友好字段名）
 * - budget = estimatedCost（SEO 友好字段名）
 * - bestSeason = weatherTip（SEO 友好字段名）
 * - itinerary = fullDays（SEO 友好字段名）
 * - highlights：优先使用字面量提供值，否则从 fullDays.theme 派生前 3 条
 *
 * 保留 id/excerpt/estimatedCost/weatherTip/fullDays 以兼容现有列表页/Modal。
 */
function normalizeTrip(raw: RawTrip): Trip {
  return {
    ...raw,
    slug: raw.id,
    description: raw.excerpt,
    budget: raw.estimatedCost,
    bestSeason: raw.weatherTip,
    itinerary: raw.fullDays,
    highlights: raw.highlights ?? raw.fullDays.map((d) => d.theme).slice(0, 3),
  };
}

export const TRIPS: Trip[] = RAW_TRIPS.map(normalizeTrip);

/** 返回所有 trip 的 slug。 */
export function getTripSlugs(): string[] {
  return TRIPS.map((t) => t.slug);
}

/** 根据 slug 获取单个 trip，未找到返回 null。 */
export function getTripBySlug(slug: string): Trip | null {
  return TRIPS.find((t) => t.slug === slug) ?? null;
}

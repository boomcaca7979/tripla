import type { Airport } from "@/types/flight";
import type { RawTripInput } from "./trips-extended-a";

// Extended trips, batch F — one trip per third-wave destination. Compact
// 2–5-day itineraries with the same structure and budget conventions.

const AI = { kind: "ai" as const, name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" };

const DPS: Airport = {
  iata: "DPS", icao: "WADD", name: "I Gusti Ngurah Rai International Airport", city: "Bali (Denpasar)", country: "Indonesia",
  timezone: "Asia/Makassar", latitude: -8.7482, longitude: 115.1675,
};
const LOP: Airport = {
  iata: "LOP", icao: "WATB", name: "Lombok International Airport", city: "Lombok", country: "Indonesia",
  timezone: "Asia/Makassar", latitude: -8.7569, longitude: 116.2784,
};
const LPQ: Airport = {
  iata: "LPQ", icao: "VLLB", name: "Luang Prabang International Airport", city: "Luang Prabang", country: "Laos",
  timezone: "Asia/Vientiane", latitude: 19.8996, longitude: 102.1606,
};
const KTM: Airport = {
  iata: "KTM", icao: "VNKT", name: "Tribhuvan International Airport", city: "Kathmandu", country: "Nepal",
  timezone: "Asia/Kathmandu", latitude: 27.6966, longitude: 85.3591,
};
const CMB: Airport = {
  iata: "CMB", icao: "VCBI", name: "Bandaranaike International Airport", city: "Colombo", country: "Sri Lanka",
  timezone: "Asia/Colombo", latitude: 7.1808, longitude: 79.8841,
};
const MLE: Airport = {
  iata: "MLE", icao: "VRMM", name: "Velana International Airport", city: "Malé", country: "Maldives",
  timezone: "Indian/Maldives", latitude: 4.1918, longitude: 73.5291,
};
const BOM: Airport = {
  iata: "BOM", icao: "VABB", name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai", country: "India",
  timezone: "Asia/Kolkata", latitude: 19.0896, longitude: 72.8656,
};
const JAI: Airport = {
  iata: "JAI", icao: "VIJP", name: "Jaipur International Airport", city: "Jaipur", country: "India",
  timezone: "Asia/Kolkata", latitude: 26.8242, longitude: 75.8122,
};
const GOI: Airport = {
  iata: "GOI", icao: "VOGO", name: "Dabolim Airport", city: "Goa", country: "India",
  timezone: "Asia/Kolkata", latitude: 15.3808, longitude: 73.8314,
};
const PEN: Airport = {
  iata: "PEN", icao: "WMKP", name: "Penang International Airport", city: "Penang", country: "Malaysia",
  timezone: "Asia/Kuala_Lumpur", latitude: 5.2971, longitude: 100.2769,
};
const UTP: Airport = {
  iata: "UTP", icao: "VTPH", name: "U-Tapao Rayong-Pattaya International Airport", city: "Pattaya", country: "Thailand",
  timezone: "Asia/Bangkok", latitude: 12.6806, longitude: 101.0044,
};
const RGN: Airport = {
  iata: "RGN", icao: "VYYY", name: "Yangon International Airport", city: "Yangon", country: "Myanmar",
  timezone: "Asia/Yangon", latitude: 16.9073, longitude: 96.1332,
};
const WAW: Airport = {
  iata: "WAW", icao: "EPWA", name: "Warsaw Chopin Airport", city: "Warsaw", country: "Poland",
  timezone: "Europe/Warsaw", latitude: 52.1657, longitude: 20.9671,
};
const KRK: Airport = {
  iata: "KRK", icao: "EPKK", name: "John Paul II International Airport Kraków-Balice", city: "Krakow", country: "Poland",
  timezone: "Europe/Warsaw", latitude: 50.0777, longitude: 19.7848,
};
const TLL: Airport = {
  iata: "TLL", icao: "EETN", name: "Lennart Meri Tallinn Airport", city: "Tallinn", country: "Estonia",
  timezone: "Europe/Tallinn", latitude: 59.4133, longitude: 24.8328,
};
const ZAG: Airport = {
  iata: "ZAG", icao: "LDZA", name: "Franjo Tuđman Airport Zagreb", city: "Zagreb", country: "Croatia",
  timezone: "Europe/Zagreb", latitude: 45.7429, longitude: 16.0688,
};
const SPU: Airport = {
  iata: "SPU", icao: "LDSP", name: "Split Airport", city: "Split", country: "Croatia",
  timezone: "Europe/Zagreb", latitude: 43.5389, longitude: 16.298,
};
const GVA: Airport = {
  iata: "GVA", icao: "LSGG", name: "Geneva Airport", city: "Geneva", country: "Switzerland",
  timezone: "Europe/Zurich", latitude: 46.2381, longitude: 6.1089,
};
const LYS: Airport = {
  iata: "LYS", icao: "LFLL", name: "Lyon-Saint Exupéry Airport", city: "Lyon", country: "France",
  timezone: "Europe/Paris", latitude: 45.7256, longitude: 5.0811,
};
const NCE: Airport = {
  iata: "NCE", icao: "LFMN", name: "Nice Côte d'Azur Airport", city: "Nice", country: "France",
  timezone: "Europe/Paris", latitude: 43.6584, longitude: 7.2159,
};
const EAS: Airport = {
  iata: "EAS", icao: "LESO", name: "San Sebastián Airport", city: "San Sebastián", country: "Spain",
  timezone: "Europe/Madrid", latitude: 43.3564, longitude: -1.7906,
};
const PHL: Airport = {
  iata: "PHL", icao: "KPHL", name: "Philadelphia International Airport", city: "Philadelphia", country: "USA",
  timezone: "America/New_York", latitude: 39.8744, longitude: -75.2424,
};
const DEN: Airport = {
  iata: "DEN", icao: "KDEN", name: "Denver International Airport", city: "Denver", country: "USA",
  timezone: "America/Denver", latitude: 39.8561, longitude: -104.6737,
};
const BNA: Airport = {
  iata: "BNA", icao: "KBNA", name: "Nashville International Airport", city: "Nashville", country: "USA",
  timezone: "America/Chicago", latitude: 36.1263, longitude: -86.6774,
};
const HNL: Airport = {
  iata: "HNL", icao: "PHNL", name: "Daniel K. Inouye International Airport", city: "Honolulu", country: "USA",
  timezone: "Pacific/Honolulu", latitude: 21.3245, longitude: -157.9251,
};
const YYC: Airport = {
  iata: "YYC", icao: "CYYC", name: "Calgary International Airport", city: "Calgary", country: "Canada",
  timezone: "America/Edmonton", latitude: 51.1139, longitude: -114.0203,
};
const LIM: Airport = {
  iata: "LIM", icao: "SPJC", name: "Jorge Chávez International Airport", city: "Lima", country: "Peru",
  timezone: "America/Lima", latitude: -12.0219, longitude: -77.1143,
};
const EZE: Airport = {
  iata: "EZE", icao: "SAEZ", name: "Ministro Pistarini International Airport", city: "Buenos Aires", country: "Argentina",
  timezone: "America/Argentina/Buenos_Aires", latitude: -34.8222, longitude: -58.5358,
};
const ADL: Airport = {
  iata: "ADL", icao: "YPAD", name: "Adelaide Airport", city: "Adelaide", country: "Australia",
  timezone: "Australia/Adelaide", latitude: -34.945, longitude: 138.5286,
};
const CNS: Airport = {
  iata: "CNS", icao: "YBCS", name: "Cairns Airport", city: "Cairns", country: "Australia",
  timezone: "Australia/Brisbane", latitude: -16.8858, longitude: 145.7553,
};
const CHC: Airport = {
  iata: "CHC", icao: "NZCH", name: "Christchurch Airport", city: "Christchurch", country: "New Zealand",
  timezone: "Pacific/Auckland", latitude: -43.4894, longitude: 172.5322,
};
const ROT: Airport = {
  iata: "ROT", icao: "NZRO", name: "Rotorua Airport", city: "Rotorua", country: "New Zealand",
  timezone: "Pacific/Auckland", latitude: -38.1093, longitude: 176.3165,
};

export const EXTENDED_TRIPS_F: RawTripInput[] = [
  {
    id: "ubud-3d-jungle", title: "Ubud 3-Day Jungle & Temples Trip",
    coverImage: null, gradient: "from-emerald-500 to-lime-600", author: AI,
    days: 3, estimatedCost: 180, currency: "USD",
    tags: ["Culture", "Nature", "Relaxed"],
    excerpt: "Three days of Bali's green heart: the ridge at dawn, water temples, terraces and the monkey forest between spa hours.",
    weatherTip: "May–September is the dry season. The jungle cools the evenings; pack a light layer.",
    fullDays: [
      { day: 1, theme: "Ridge & Arrival", activities: [
        { time: "16:00", name: "Campuhan Ridge Walk at golden hour", emoji: "🌄" },
        { time: "19:30", name: "Dinner on Ubud's restaurant row", emoji: "🍛" } ] },
      { day: 2, theme: "Terraces & Temples", activities: [
        { time: "07:00", name: "Tegallalang terraces before the vans", emoji: "🌾" },
        { time: "10:30", name: "Tirta Empul's spring ceremony", emoji: "🛕" },
        { time: "16:00", name: "Monkey Forest (straps on everything)", emoji: "🐒" } ] },
      { day: 3, theme: "Waterfalls & Spa", activities: [
        { time: "09:00", name: "Tibumana waterfall swim", emoji: "💦" },
        { time: "14:00", name: "Balinese massage hour", emoji: "💆" },
        { time: "18:00", name: "Legong dance evening", emoji: "💃" } ] },
    ],
    restaurants: [
      { name: "Locavore NXT", cuisine: "Tasting menu · $$$$", emoji: "🌿" },
      { name: "Warung Babi Guling Ibu Oka", cuisine: "Roast pork · $", emoji: "🐖" },
      { name: "Zest Ubud", cuisine: "Plant-forward · $$", emoji: "🥗" },
    ],
    city: "Ubud", country: "Indonesia", airport: DPS, travelStyle: "relaxed",
    interests: ["nature", "food", "history"],
    highlights: ["The ridge at dawn", "Terraces without the crowds", "One Legong dance evening"],
  },
  {
    id: "lombok-4d-volcano-beach", title: "Lombok 4-Day Volcano & Beach Trip",
    coverImage: null, gradient: "from-teal-500 to-emerald-700", author: AI,
    days: 4, estimatedCost: 220, currency: "USD",
    tags: ["Adventure", "Beaches", "Nature"],
    excerpt: "Four days of the wilder island: Rinjani's slopes, empty southern beaches and a Gili day trip.",
    weatherTip: "May–September is dry season — Rinjani treks open and the seas calm.",
    fullDays: [
      { day: 1, theme: "South Beaches", activities: [
        { time: "10:00", name: "Tanjung Aan's twin-bay sand", emoji: "🏖️" },
        { time: "16:00", name: "Merese Hill sunset", emoji: "🌅" } ] },
      { day: 2, theme: "Rinjani Foothills", activities: [
        { time: "07:00", name: "Benang Stokel & Kelambu waterfalls", emoji: "💦" },
        { time: "14:00", name: "Sasak village weaving visit", emoji: "🧶" } ] },
      { day: 3, theme: "Gili Day Trip", activities: [
        { time: "08:00", name: "Boat to Gili Air's snorkel spots", emoji: "🤿" },
        { time: "16:00", name: "Return for a seafood grill", emoji: "🦐" } ] },
      { day: 4, theme: "Farewell", activities: [
        { time: "09:00", name: "Selong Belanaw swim & airport", emoji: "✈️" } ] },
    ],
    restaurants: [
      { name: "Krnak Baru", cuisine: "Local warung · $", emoji: "🍛" },
      { name: "The Santorini Lombok", cuisine: "Seaside Greek · $$", emoji: "🥗" },
      { name: "Beach grill shacks", cuisine: "Catch of the day · $$", emoji: "🐟" },
    ],
    city: "Lombok", country: "Indonesia", airport: LOP, travelStyle: "adventure",
    interests: ["nature", "beaches", "food"],
    highlights: ["Rinjani's green slopes", "The empty southern beaches", "A car-free Gili day"],
  },
  {
    id: "luang-prabang-3d-mekong", title: "Luang Prabang 3-Day Mekong Trip",
    coverImage: null, gradient: "from-orange-400 to-emerald-600", author: AI,
    days: 3, estimatedCost: 150, currency: "USD",
    tags: ["Culture", "Nature", "Temples"],
    excerpt: "Three days of saffron dawns, turquoise falls and Mekong evenings in Laos's UNESCO town.",
    weatherTip: "November–February is cool and misty — the alms procession at its best.",
    fullDays: [
      { day: 1, theme: "Temples & the Hill", activities: [
        { time: "05:30", name: "The dawn alms-giving procession", emoji: "🧘" },
        { time: "10:00", name: "Wat Xieng Thong's golden chapels", emoji: "🛕" },
        { time: "17:30", name: "Mount Phousi's 328 stairs at sunset", emoji: "🌄" } ] },
      { day: 2, theme: "Kuang Si Falls", activities: [
        { time: "08:30", name: "The turquoise tiers & the bear sanctuary", emoji: "💦" },
        { time: "17:00", name: "Mekong riverside dinner", emoji: "🍲" } ] },
      { day: 3, theme: "The River", activities: [
        { time: "09:00", name: "Longtail boat to the Pak Ou caves", emoji: "🛶" },
        { time: "16:00", name: "The night market's silk and snacks", emoji: "🏮" } ] },
    ],
    restaurants: [
      { name: "Tamarind", cuisine: "Modern Lao · $$", emoji: "🍲" },
      { name: "Manda de Laos", cuisine: "Heritage garden · $$$", emoji: "🌺" },
      { name: "Night market grills", cuisine: "Street · $", emoji: "🍢" },
    ],
    city: "Luang Prabang", country: "Laos", airport: LPQ, travelStyle: "cultural",
    interests: ["history", "nature", "food"],
    highlights: ["The saffron dawn procession", "Kuang Si's turquoise tiers", "The Mekong at dusk"],
  },
  {
    id: "kathmandu-3d-valley", title: "Kathmandu 3-Day Valley Trip",
    coverImage: null, gradient: "from-red-600 to-amber-500", author: AI,
    days: 3, estimatedCost: 135, currency: "USD",
    tags: ["Culture", "History", "Temples"],
    excerpt: "Three days of the valley's stupas, squares and prayer wheels — with a Himalaya sunrise from Nagarkot.",
    weatherTip: "October–November is the post-monsoon clear window — mountains visible.",
    fullDays: [
      { day: 1, theme: "Stupas & Squares", activities: [
        { time: "08:00", name: "Boudhanath Stupa's morning kora", emoji: "☸️" },
        { time: "13:00", name: "Patan Durbar Square's carved courtyards", emoji: "🏛️" },
        { time: "17:30", name: "Pashupatinath's aarti ceremony", emoji: "🔥" } ] },
      { day: 2, theme: "The Old Kingdoms", activities: [
        { time: "09:00", name: "Kathmandu Durbar Square & Kumari's house", emoji: "👑" },
        { time: "14:00", name: "Swayambhunath's 365 steps", emoji: "🐒" },
        { time: "18:30", name: "Thamel's rooftop dinner", emoji: "🍲" } ] },
      { day: 3, theme: "Himalaya Sunrise", activities: [
        { time: "05:00", name: "Nagarkot's sunrise over the range", emoji: "🏔️" },
        { time: "13:00", name: "Bhaktapur's pottery square", emoji: "🏺" } ] },
    ],
    restaurants: [
      { name: "Boudha Sekhar Corner", cuisine: "Momo & thukpa · $", emoji: "🥟" },
      { name: "Krishnarpan", cuisine: "Newari feast · $$$", emoji: "🍲" },
      { name: "OR2K", cuisine: "Middle East-Nepali · $$", emoji: "🥗" },
    ],
    city: "Kathmandu", country: "Nepal", airport: KTM, travelStyle: "cultural",
    interests: ["history", "nature", "food"],
    highlights: ["Boudhanath's spinning prayers", "A Himalaya sunrise", "Three medieval squares"],
  },
  {
    id: "colombo-2d-gateway", title: "Colombo 2-Day Gateway Trip",
    coverImage: null, gradient: "from-teal-600 to-amber-500", author: AI,
    days: 2, estimatedCost: 100, currency: "USD",
    tags: ["City Break", "Foodie", "Culture"],
    excerpt: "Two days of the island capital: colonial arcades, ocean-drive evenings and the hopper curriculum.",
    weatherTip: "December–March is the dry west-coast season.",
    fullDays: [
      { day: 1, theme: "Colonial & Coast", activities: [
        { time: "09:00", name: "The Dutch Hospital & old arcades", emoji: "🏛️" },
        { time: "14:00", name: "Gangaramaya's temple complex", emoji: "🛕" },
        { time: "18:00", name: "Galle Face Green's kite sunset", emoji: "🪁" } ] },
      { day: 2, theme: "Markets & Farewell", activities: [
        { time: "09:00", name: "Pettah Market's maze", emoji: "🧺" },
        { time: "13:00", name: "Hoppers and kottu lunch", emoji: "🍜" },
        { time: "17:00", name: "Airport or the tea country train", emoji: "🚂" } ] },
    ],
    restaurants: [
      { name: "Ministry of Crab", cuisine: "Lagoon crab · $$$", emoji: "🦀" },
      { name: "Upali's", cuisine: "Sri Lankan classics · $$", emoji: "🍛" },
      { name: "Galle Face Hotel terrace", cuisine: "Colonial high tea · $$", emoji: "☕" },
    ],
    city: "Colombo", country: "Sri Lanka", airport: CMB, travelStyle: "foodie",
    interests: ["food", "history"],
    highlights: ["Galle Face's kite sunset", "The hopper breakfast", "Pettah's organized chaos"],
  },
  {
    id: "maldives-4d-atoll", title: "Maldives 4-Day Atoll Escape",
    coverImage: null, gradient: "from-cyan-400 to-blue-600", author: AI,
    days: 4, estimatedCost: 1400, currency: "USD",
    tags: ["Beaches", "Luxury", "Romance"],
    excerpt: "Four days of overwater villas, house-reef turtles, sandbank picnics and dolphin dhonis.",
    weatherTip: "December–April is the dry, calm season with the best visibility.",
    fullDays: [
      { day: 1, theme: "Arrive & Float", activities: [
        { time: "13:00", name: "Seaplane or speedboat to the atoll", emoji: "🛩️" },
        { time: "16:00", name: "House-reef snorkel off the villa", emoji: "🐢" } ] },
      { day: 2, theme: "Reef & Sandbank", activities: [
        { time: "09:00", name: "Guided reef dive or snorkel safari", emoji: "🐠" },
        { time: "16:00", name: "Sandbank picnic for two", emoji: "🏝️" } ] },
      { day: 3, theme: "Dolphins & Spa", activities: [
        { time: "10:00", name: "Overwater spa treatment", emoji: "💆" },
        { time: "17:30", name: "Dolphin sunset dhoni cruise", emoji: "🐬" } ] },
      { day: 4, theme: "Farewell", activities: [
        { time: "09:00", name: "Final swim & seaplane home", emoji: "✈️" } ] },
    ],
    restaurants: [
      { name: "Resort overwater dining", cuisine: "Chef's tables · $$$$", emoji: "🍽️" },
      { name: "Sandbank barbecue", cuisine: "Grilled catch · $$$", emoji: "🐟" },
      { name: "Malé local cafés", cuisine: "Mas huni · $", emoji: "🥥" },
    ],
    city: "Maldives", country: "Maldives", airport: MLE, travelStyle: "relaxed",
    interests: ["beaches", "nature", "food"],
    highlights: ["The overwater villa morning", "Turtles off the house reef", "The dolphin dhoni"],
  },
  {
    id: "mumbai-3d-maximum-city", title: "Mumbai 3-Day Maximum City Trip",
    coverImage: null, gradient: "from-amber-500 to-purple-700", author: AI,
    days: 3, estimatedCost: 180, currency: "USD",
    tags: ["Foodie", "Culture", "City Break"],
    excerpt: "Three days of the maximum city: colonial grandeur, Marine Drive's necklace, Bollywood energy and the street-food canon.",
    weatherTip: "November–February is the cool, dry season. The monsoon is dramatic but disruptive.",
    fullDays: [
      { day: 1, theme: "Colonial Mumbai", activities: [
        { time: "09:00", name: "The Gateway of India & the Taj's facade", emoji: "🏛️" },
        { time: "12:00", name: "Kala Ghoda's art district & bookshops", emoji: "📚" },
        { time: "18:30", name: "Marine Drive's Art Deco sunset walk", emoji: "🌅" } ] },
      { day: 2, theme: "Street Food & Film", activities: [
        { time: "09:00", name: "Dabbawala & Dhobi Ghat morning", emoji: "👕" },
        { time: "13:00", name: "Street-food crawl: vada pav to pav bhaji", emoji: "🍔" },
        { time: "17:00", name: "Bollywood studio or Film City tour", emoji: "🎬" } ] },
      { day: 3, theme: "Caves & Markets", activities: [
        { time: "08:30", name: "Elephanta Caves' rock-cut temples (ferry)", emoji: "🗿" },
        { time: "15:00", name: "Crawford Market & Mohammed Ali Road evening", emoji: "🏮" } ] },
    ],
    restaurants: [
      { name: "Swati Snacks", cuisine: "Vegetarian classics · $", emoji: "🍛" },
      { name: "Trishna", cuisine: "Butter crab · $$$", emoji: "🦀" },
      { name: "Mohammed Ali Road stalls", cuisine: "Night kebabs · $", emoji: "🍢" },
    ],
    city: "Mumbai", country: "India", airport: BOM, travelStyle: "foodie",
    interests: ["food", "history", "nightlife"],
    highlights: ["Marine Drive's necklace lights", "The street-food canon", "Elephanta's rock temples"],
  },
  {
    id: "jaipur-3d-pink-city", title: "Jaipur 3-Day Pink City Trip",
    coverImage: null, gradient: "from-rose-400 to-amber-600", author: AI,
    days: 3, estimatedCost: 150, currency: "USD",
    tags: ["Culture", "History", "Shopping"],
    excerpt: "Three days of Rajasthan's pink capital: Amber's ramparts, Hawa Mahal's windows and the bazaar maze.",
    weatherTip: "October–March is the pleasant season; April–June bakes past 40°C.",
    fullDays: [
      { day: 1, theme: "Amber & the Old City", activities: [
        { time: "08:00", name: "Amber Fort's ramparts & mirror palace", emoji: "🏰" },
        { time: "14:00", name: "Hawa Mahal's 953 windows", emoji: "🪟" },
        { time: "17:00", name: "Johari Bazaar's gemstone lanes", emoji: "💎" } ] },
      { day: 2, theme: "Palace & Science", activities: [
        { time: "09:30", name: "The City Palace & its museum", emoji: "👑" },
        { time: "12:00", name: "Jantar Mantar's giant sundials", emoji: "🌞" },
        { time: "17:30", name: "Nahargarh's sunset over the pink city", emoji: "🌄" } ] },
      { day: 3, theme: "Block Print & Bazaars", activities: [
        { time: "09:30", name: "Block-printing workshop in Sanganer", emoji: "🎨" },
        { time: "14:00", name: "Bapu Bazaar's textiles & mojari shoes", emoji: "🛍️" },
        { time: "18:30", name: "Rajasthani thali farewell", emoji: "🍛" } ] },
    ],
    restaurants: [
      { name: "Laxmi Misthan Bhandar", cuisine: "The famous thali · $$", emoji: "🍛" },
      { name: "Tapri Central", cuisine: "Rooftop chai · $", emoji: "☕" },
      { name: "1135 AD", cuisine: "Amber Fort dining · $$$", emoji: "🏰" },
    ],
    city: "Jaipur", country: "India", airport: JAI, travelStyle: "cultural",
    interests: ["history", "shopping", "food"],
    highlights: ["Amber's mirror palace", "The pink-city sunset", "The block-print workshop"],
  },
  {
    id: "goa-4d-beach-state", title: "Goa 4-Day Beach State Trip",
    coverImage: null, gradient: "from-lime-500 to-cyan-600", author: AI,
    days: 4, estimatedCost: 200, currency: "USD",
    tags: ["Beaches", "Relaxed", "Foodie"],
    excerpt: "Four days of India's beach state: Latin quarters, spice plantations, shack dinners and calm crescents.",
    weatherTip: "November–February is the dry, beach-perfect season; monsoon closes the shacks.",
    fullDays: [
      { day: 1, theme: "North Beaches", activities: [
        { time: "10:00", name: "Baga to Anjuna's beach hop", emoji: "🏖️" },
        { time: "17:30", name: "Sunset at Chapora's fort", emoji: "🌅" } ] },
      { day: 2, theme: "Latin & Old Goa", activities: [
        { time: "09:30", name: "Fontainhas' Latin quarter walk", emoji: "🏘️" },
        { time: "12:00", name: "Old Goa's Bom Jesus Basilica", emoji: "⛪" },
        { time: "18:00", name: "Mandovi river cruise", emoji: "⛵" } ] },
      { day: 3, theme: "South & Spice", activities: [
        { time: "09:00", name: "Spice plantation lunch tour", emoji: "🌿" },
        { time: "15:00", name: "Palolem's calm crescent", emoji: "🏝️" } ] },
      { day: 4, theme: "Farewell Shack", activities: [
        { time: "09:30", name: "Final beach morning & shack brunch", emoji: "🥥" },
        { time: "14:00", name: "Airport", emoji: "✈️" } ] },
    ],
    restaurants: [
      { name: "Gunpowder", cuisine: "South Indian · $$", emoji: "🌶️" },
      { name: "Fisherman's Wharf", cuisine: "Riverside seafood · $$", emoji: "🐟" },
      { name: "Beach shacks", cuisine: "Grilled catch · $", emoji: "🦐" },
    ],
    city: "Goa", country: "India", airport: GOI, travelStyle: "relaxed",
    interests: ["beaches", "food", "history"],
    highlights: ["Palolem's calm crescent", "Fontainhas' Latin lanes", "The shack dinner tradition"],
  },
  {
    id: "penang-3d-heritage-food", title: "Penang 3-Day Heritage & Food Trip",
    coverImage: null, gradient: "from-amber-400 to-red-600", author: AI,
    days: 3, estimatedCost: 150, currency: "USD",
    tags: ["Foodie", "Culture", "Art"],
    excerpt: "Three days of Malaysia's food island: George Town's street art, hill temples and the hawker canon.",
    weatherTip: "December–February is the drier window; hawker courts are covered year-round.",
    fullDays: [
      { day: 1, theme: "George Town", activities: [
        { time: "09:00", name: "The street-art trail & shophouses", emoji: "🎨" },
        { time: "13:00", name: "Hawker lunch: char kway teow & assam laksa", emoji: "🍜" },
        { time: "17:30", name: "The clan jetties at sunset", emoji: "🌅" } ] },
      { day: 2, theme: "Hill & Temple", activities: [
        { time: "09:00", name: "Penang Hill's funicular & the canopy walk", emoji: "🚡" },
        { time: "14:00", name: "Kek Lok Si's hilltop pagoda", emoji: "🛕" },
        { time: "19:00", name: "Gurney Drive hawker center dinner", emoji: "🍢" } ] },
      { day: 3, theme: "Markets & Farewell", activities: [
        { time: "09:30", name: "Chowrasta Market & the clan piers", emoji: "🧺" },
        { time: "13:00", name: "Cendol & laksa verdict", emoji: "🍧" },
        { time: "16:00", name: "Airport", emoji: "✈️" } ] },
    ],
    restaurants: [
      { name: "Gurney Drive hawkers", cuisine: "The canon · $", emoji: "🍢" },
      { name: "Air Itam Laksa", cuisine: "Assam laksa · $", emoji: "🍜" },
      { name: "Kebaya", cuisine: "Nyonya fine dining · $$$", emoji: "🌺" },
    ],
    city: "Penang", country: "Malaysia", airport: PEN, travelStyle: "foodie",
    interests: ["food", "history", "museums"],
    highlights: ["The street-art trail", "Malaysia's best hawker food", "Kek Lok Si at dusk"],
  },
  {
    id: "pattaya-3d-gulf", title: "Pattaya 3-Day Gulf Trip",
    coverImage: null, gradient: "from-cyan-500 to-purple-600", author: AI,
    days: 3, estimatedCost: 165, currency: "USD",
    tags: ["Beaches", "Family", "Relaxed"],
    excerpt: "Three days of the Gulf resort strip: Koh Larn's clear water, the wooden Sanctuary of Truth and the garden shows.",
    weatherTip: "November–March is the Gulf-calm window — opposite Phuket's season.",
    fullDays: [
      { day: 1, theme: "Koh Larn Day", activities: [
        { time: "09:00", name: "Ferry to Koh Larn's beaches", emoji: "🏝️" },
        { time: "16:00", name: "Promenade evening & seafood", emoji: "🦐" } ] },
      { day: 2, theme: "Wood & Gardens", activities: [
        { time: "09:00", name: "The Sanctuary of Truth's carved temple", emoji: "🛕" },
        { time: "14:00", name: "Nong Nooch's gardens & shows", emoji: "🌴" },
        { time: "19:00", name: "The Tiffany cabaret show", emoji: "🎭" } ] },
      { day: 3, theme: "Farewell", activities: [
        { time: "09:30", name: "Beach morning & the temple on the hill", emoji: "🏖️" },
        { time: "14:00", name: "Airport", emoji: "✈️" } ] },
    ],
    restaurants: [
      { name: "Mum Aroi", cuisine: "Seafood institution · $$", emoji: "🦐" },
      { name: "Kiss Food & Drink", cuisine: "Beachfront · $$", emoji: "🍹" },
      { name: "Preecha Seafood", cuisine: "Thai seafood · $$", emoji: "🐟" },
    ],
    city: "Pattaya", country: "Thailand", airport: UTP, travelStyle: "relaxed",
    interests: ["beaches", "food", "nature"],
    highlights: ["Koh Larn's clear water", "The wooden Sanctuary of Truth", "The Gulf-side season"],
  },
  {
    id: "yangon-2d-golden", title: "Yangon 2-Day Golden Trip",
    coverImage: null, gradient: "from-amber-400 to-orange-600", author: AI,
    days: 2, estimatedCost: 100, currency: "USD",
    tags: ["Culture", "History", "Temples"],
    excerpt: "Two days of Shwedagon's gold at dusk, the colonial downtown and the circular train.",
    weatherTip: "November–February is cool and dry. Check current travel advisories before planning.",
    fullDays: [
      { day: 1, theme: "The Golden Hour", activities: [
        { time: "09:00", name: "The colonial downtown walk", emoji: "🏛️" },
        { time: "14:00", name: "Bogyoke Aung San market", emoji: "🧺" },
        { time: "17:00", name: "Shwedagon Pagoda at dusk", emoji: "✨" } ] },
      { day: 2, theme: "The Circle", activities: [
        { time: "09:00", name: "The circular train's full loop", emoji: "🚂" },
        { time: "14:00", name: "Mohinga breakfast (late) & the neighborhoods", emoji: "🍜" },
        { time: "17:00", name: "Kandawgyi Lake's golden reflection", emoji: "🌆" } ] },
    ],
    restaurants: [
      { name: "Shwe Sabwa", cuisine: "Burmese classics · $", emoji: "🍛" },
      { name: "99 Shan Noodle", cuisine: "Shan noodles · $", emoji: "🍜" },
      { name: "Pansodan Street cafés", cuisine: "Colonial cafés · $$", emoji: "☕" },
    ],
    city: "Yangon", country: "Myanmar", airport: RGN, travelStyle: "cultural",
    interests: ["history", "food"],
    highlights: ["Shwedagon's dusk glow", "The circular train loop", "Mohinga at dawn"],
  },
  {
    id: "warsaw-3d-risen", title: "Warsaw 3-Day Risen City Trip",
    coverImage: null, gradient: "from-red-500 to-slate-600", author: AI,
    days: 3, estimatedCost: 255, currency: "EUR",
    tags: ["History", "Museums", "Culture"],
    excerpt: "Three days of the city that rebuilt itself: the Old Town, the Rising Museum, POLIN's vaults and Chopin's parks.",
    weatherTip: "May–September is the Vistula-boulevard season; December glows with markets.",
    fullDays: [
      { day: 1, theme: "The Rebuilt Old Town", activities: [
        { time: "09:30", name: "Old Town & Royal Castle", emoji: "🏰" },
        { time: "14:00", name: "The barbican & theNew Town", emoji: "🏘️" },
        { time: "19:00", name: "Vistula boulevard evening", emoji: "🌉" } ] },
      { day: 2, theme: "The Weight", activities: [
        { time: "09:00", name: "Warsaw Rising Museum", emoji: "🕊️" },
        { time: "14:00", name: "POLIN's Jewish-history vaults", emoji: "🕯️" },
        { time: "18:30", name: "Praga district's edgy dinner", emoji: "🍽️" } ] },
      { day: 3, theme: "Chopin & Towers", activities: [
        { time: "10:00", name: "Łazienki Park's palace & Chopin monument", emoji: "🎹" },
        { time: "15:00", name: "The Palace of Culture's terrace view", emoji: "🌆" } ] },
    ],
    restaurants: [
      { name: "Zapiecek", cuisine: "Pierogi chain · $", emoji: "🥟" },
      { name: "Warszawa Wschodnia", cuisine: "Modern Polish · $$$", emoji: "🍽️" },
      { name: "Hala Koszyki", cuisine: "Food hall · $$", emoji: "🧺" },
    ],
    city: "Warsaw", country: "Poland", airport: WAW, travelStyle: "cultural",
    interests: ["history", "museums", "food"],
    highlights: ["The UNESCO rebuilt old town", "POLIN's depth", "Chopin in the park"],
  },
  {
    id: "krakow-3d-royal", title: "Krakow 3-Day Royal City Trip",
    coverImage: null, gradient: "from-emerald-600 to-rose-600", author: AI,
    days: 3, estimatedCost: 225, currency: "EUR",
    tags: ["History", "Culture", "Foodie"],
    excerpt: "Three days of Poland's preserved royal city: Europe's largest square, Wawel's hill, Kazimierz's cafés and the solemn day trip.",
    weatherTip: "May–September is festival season; December's Rynek market is the prettiest.",
    fullDays: [
      { day: 1, theme: "The Square & the Hill", activities: [
        { time: "09:00", name: "The Rynek & St Mary's trumpet call", emoji: "🎺" },
        { time: "12:00", name: "Wawel Castle & the dragon's den", emoji: "🐉" },
        { time: "19:00", name: "Cellar restaurant dinner", emoji: "🍷" } ] },
      { day: 2, theme: "Kazimierz & the Mine", activities: [
        { time: "09:30", name: "Kazimierz's synagogues & street-art courtyards", emoji: "🕊️" },
        { time: "14:00", name: "The Wieliczka Salt Mine's chapels", emoji: "🧂" } ] },
      { day: 3, theme: "The Memorial", activities: [
        { time: "08:00", name: "Auschwitz-Birkenau memorial (booked coach)", emoji: "🕯️" },
        { time: "18:00", name: "Recovery dinner on the square", emoji: "🍲" } ] },
    ],
    restaurants: [
      { name: "Pod Wawelem", cuisine: "Polish portions · $$", emoji: "🍖" },
      { name: "Starka", cuisine: "Regional kitchen & vodkas · $$", emoji: "🥔" },
      { name: "Alchemia od Kogo", cuisine: "Kazimierz bar legend · $$", emoji: "🍹" },
    ],
    city: "Krakow", country: "Poland", airport: KRK, travelStyle: "cultural",
    interests: ["history", "food", "nightlife"],
    highlights: ["Europe's largest medieval square", "The salt mine's chapels", "Kazimierz's rebirth"],
  },
  {
    id: "tallinn-2d-medieval", title: "Tallinn 2-Day Medieval Trip",
    coverImage: null, gradient: "from-slate-500 to-rose-500", author: AI,
    days: 2, estimatedCost: 190, currency: "EUR",
    tags: ["Culture", "History", "City Break"],
    excerpt: "Two days inside the Baltics' best-preserved medieval town: ramparts, spires, viewpoints and the Helsinki ferry.",
    weatherTip: "June–August's light is endless; December's market is the alternate postcard.",
    fullDays: [
      { day: 1, theme: "The Old Town", activities: [
        { time: "09:00", name: "The ramparts wall-walk", emoji: "🏰" },
        { time: "12:00", name: "Toompea's castle viewpoints", emoji: "👁️" },
        { time: "16:00", name: "Raekoja plats & the pharmacy since 1422", emoji: "⚗️" } ] },
      { day: 2, theme: "Parks & the Sea", activities: [
        { time: "09:30", name: "Kadriorg Park & the art museum", emoji: "🌳" },
        { time: "13:30", name: "Telliskivi's creative city & Balti Jaama market", emoji: "🎨" },
        { time: "17:00", name: "The Helsinki ferry or the airport", emoji: "⛴️" } ] },
    ],
    restaurants: [
      { name: "Rataskaevu 16", cuisine: "Estonian modern · $$", emoji: "🍽️" },
      { name: "Olde Hansa", cuisine: "Medieval feast · $$$", emoji: "🍖" },
      { name: "Balti Jaama Turg", cuisine: "Market hall · $", emoji: "🧺" },
    ],
    city: "Tallinn", country: "Estonia", airport: TLL, travelStyle: "cultural",
    interests: ["history", "food", "museums"],
    highlights: ["The wall-walk at opening", "The 1422 pharmacy", "The two-hour Helsinki hop"],
  },
  {
    id: "zagreb-2d-capital", title: "Zagreb 2-Day Capital Trip",
    coverImage: null, gradient: "from-orange-500 to-blue-600", author: AI,
    days: 2, estimatedCost: 170, currency: "EUR",
    tags: ["Culture", "Museums", "City Break"],
    excerpt: "Two days of Croatia's inland capital: the funicular, Dolac's umbrellas and the Broken Relationships museum.",
    weatherTip: "April–June is mild; December's Advent market has won best-in-Europe honors.",
    fullDays: [
      { day: 1, theme: "Upper & Lower Town", activities: [
        { time: "09:30", name: "The funicular to Gornji Grad", emoji: "🚡" },
        { time: "11:30", name: "St Mark's tiled roof & the Lotrščak tower", emoji: "⛪" },
        { time: "15:00", name: "Dolac Market & the main square", emoji: "🧺" } ] },
      { day: 2, theme: "Museums & the Cemetery", activities: [
        { time: "10:00", name: "The Museum of Broken Relationships", emoji: "💔" },
        { time: "13:00", name: "Mirogoj's arcade cemetery", emoji: "🕊️" },
        { time: "16:30", name: "Tkalčićeva's café street & airport", emoji: "☕" } ] },
    ],
    restaurants: [
      { name: "Stari Fijaker", cuisine: "Zagreb classics · $$", emoji: "🍲" },
      { name: "Vinodol", cuisine: "Croatian tavern · $$", emoji: "🍷" },
      { name: "Mali Medo", cuisine: "Craft beer hall · $$", emoji: "🍺" },
    ],
    city: "Zagreb", country: "Croatia", airport: ZAG, travelStyle: "cultural",
    interests: ["museums", "food", "history"],
    highlights: ["The funicular ride", "The Broken Relationships museum", "Advent in December"],
  },
  {
    id: "split-3d-palace-islands", title: "Split 3-Day Palace & Islands Trip",
    coverImage: null, gradient: "from-amber-500 to-cyan-600", author: AI,
    days: 3, estimatedCost: 330, currency: "EUR",
    tags: ["History", "Beaches", "Islands"],
    excerpt: "Three days inside a Roman palace and out to the islands: Diocletian's peristyle, Marjan's trails and Hvar or Brač by ferry.",
    weatherTip: "May–June and September–October are warm with workable crowds.",
    fullDays: [
      { day: 1, theme: "The Palace", activities: [
        { time: "08:30", name: "Diocletian's Palace at dawn — peristyle & basements", emoji: "🏛️" },
        { time: "13:00", name: "The Riva promenade lunch", emoji: "🍤" },
        { time: "17:30", name: "Marjan Hill's viewpoint trail", emoji: "🌄" } ] },
      { day: 2, theme: "Island Day", activities: [
        { time: "08:30", name: "Ferry to Hvar or Brač's Zlatni Rat", emoji: "⛴️" },
        { time: "17:00", name: "Return for the Riva evening", emoji: "🍹" } ] },
      { day: 3, theme: "Fortress & Farewell", activities: [
        { time: "09:30", name: "Klis Fortress's canyon views", emoji: "🏯" },
        { time: "13:30", name: "Beach hour at Bačvice & airport", emoji: "🏖️" } ] },
    ],
    restaurants: [
      { name: "Konoba Marjan", cuisine: "Dalmatian grill · $$", emoji: "🐟" },
      { name: "Zoi", cuisine: "Beach club · $$$", emoji: "🍹" },
      { name: "Villa Spiza", cuisine: "Tiny kitchen legend · $$", emoji: "🍝" },
    ],
    city: "Split", country: "Croatia", airport: SPU, travelStyle: "cultural",
    interests: ["history", "beaches", "food"],
    highlights: ["Dawn inside the Roman palace", "The island ferry day", "Marjan's pine trails"],
  },
  {
    id: "geneva-2d-lake", title: "Geneva 2-Day Lake Trip",
    coverImage: null, gradient: "from-blue-600 to-red-500", author: AI,
    days: 2, estimatedCost: 400, currency: "CHF",
    tags: ["Culture", "Nature", "City Break"],
    excerpt: "Two days on the lake: the jet d'eau, the old town, the Red Cross museum and a Chamonix day trip.",
    weatherTip: "June–September is the lake-swim season; December adds Mont Blanc views.",
    fullDays: [
      { day: 1, theme: "The Lake & the Old Town", activities: [
        { time: "09:30", name: "The Jet d'Eau & the lakefront walk", emoji: "⛲" },
        { time: "12:30", name: "Old-town café lunch in the Bourg-de-Four", emoji: "☕" },
        { time: "15:00", name: "St Pierre's towers & the Red Cross Museum", emoji: "🕊️" } ] },
      { day: 2, theme: "Mont Blanc Day", activities: [
        { time: "08:30", name: "Bus to Chamonix & the Aiguille du Midi cable car", emoji: "🏔️" },
        { time: "17:00", name: "Return for a fondue farewell", emoji: "🧀" } ] },
    ],
    restaurants: [
      { name: "Chez Ma Cousine", cuisine: "Roast chicken institution · $$", emoji: "🍗" },
      { name: "Brasserie des Halles de l'Île", cuisine: "Riverside · $$", emoji: "🧀" },
      { name: "Bayview by Michel Roth", cuisine: "Lake-view gourmet · $$$$", emoji: "⭐" },
    ],
    city: "Geneva", country: "Switzerland", airport: GVA, travelStyle: "cultural",
    interests: ["museums", "nature", "food"],
    highlights: ["The 140-meter jet d'eau", "Mont Blanc from Aiguille du Midi", "The Red Cross museum"],
  },
  {
    id: "lyon-3d-bouchons", title: "Lyon 3-Day Bouchons & Traboules Trip",
    coverImage: null, gradient: "from-rose-500 to-amber-600", author: AI,
    days: 3, estimatedCost: 360, currency: "EUR",
    tags: ["Foodie", "Culture", "History"],
    excerpt: "Three days in France's kitchen: traboule passages, bouchon dinners, Fourvière's basilica and the Bocuse food halls.",
    weatherTip: "April–June and September–October are ideal; December's Fête des Lumières transforms the city.",
    fullDays: [
      { day: 1, theme: "Vieux Lyon & the Traboules", activities: [
        { time: "09:30", name: "The Renaissance lanes & secret traboules", emoji: "🚪" },
        { time: "13:00", name: "Bouchon lunch (quenelle & tablier)", emoji: "🍲" },
        { time: "16:30", name: "Fourvière's funicular & basilica", emoji: "⛪" } ] },
      { day: 2, theme: "Presqu'île & Bocuse", activities: [
        { time: "09:30", name: "Les Halles Paul Bocuse's counters", emoji: "🧺" },
        { time: "14:00", name: "The Croix-Rousse murals & silk-weavers' slopes", emoji: "🎨" },
        { time: "19:30", name: "Second bouchon — different menu", emoji: "🍷" } ] },
      { day: 3, theme: "Confluence & Farewell", activities: [
        { time: "10:00", name: "The Confluence museum & the two rivers' meeting", emoji: "🌊" },
        { time: "14:30", name: "Part-Dieu shopping & airport", emoji: "✈️" } ] },
    ],
    restaurants: [
      { name: "Café des Fédérations", cuisine: "Bouchon institution · $$", emoji: "🍲" },
      { name: "Les Halles Paul Bocuse", cuisine: "The counters · $$", emoji: "🧺" },
      { name: "Daniel et Denise", cuisine: "Michelin-listed bouchon · $$$", emoji: "⭐" },
    ],
    city: "Lyon", country: "France", airport: LYS, travelStyle: "foodie",
    interests: ["food", "history", "museums"],
    highlights: ["The secret traboules", "Two proper bouchon dinners", "The Bocuse halls"],
  },
  {
    id: "nice-3d-riviera", title: "Nice 3-Day Riviera Trip",
    coverImage: null, gradient: "from-cyan-400 to-rose-500", author: AI,
    days: 3, estimatedCost: 390, currency: "EUR",
    tags: ["Beaches", "Culture", "Foodie"],
    excerpt: "Three days on the Riviera's capital: the Promenade, socca in Vieux Nice, Monaco and Èze by the corniche.",
    weatherTip: "May–June and September–October are warm without the August crush.",
    fullDays: [
      { day: 1, theme: "The Promenade & Vieux Nice", activities: [
        { time: "09:30", name: "Cours Saleya's flower market", emoji: "🌻" },
        { time: "12:00", name: "Socca at Chez Pipo & the old lanes", emoji: "🥞" },
        { time: "17:00", name: "The Promenade des Anglais at golden hour", emoji: "🌅" } ] },
      { day: 2, theme: "Monaco & Èze", activities: [
        { time: "09:00", name: "Corniche drive to Monaco's casino & old town", emoji: "🎰" },
        { time: "14:30", name: "Èze's perched village & Jardin Exotique", emoji: "🌵" } ] },
      { day: 3, theme: "Museums & Farewell", activities: [
        { time: "10:00", name: "The Matisse or Chagall museum", emoji: "🖼️" },
        { time: "13:30", name: "Castle Hill's panorama & airport", emoji: "✈️" } ] },
    ],
    restaurants: [
      { name: "Chez Pipo", cuisine: "Socca institution · $", emoji: "🥞" },
      { name: "Le Bistrot d'Antoine", cuisine: "Niçois bistro · $$", emoji: "🍽️" },
      { name: "La Voglia", cuisine: "Riviera Italian · $$", emoji: "🍝" },
    ],
    city: "Nice", country: "France", airport: NCE, travelStyle: "relaxed",
    interests: ["beaches", "food", "museums"],
    highlights: ["The Promenade at golden hour", "Èze's perched gardens", "Socca, the Niçois pancake"],
  },
  {
    id: "cordoba-2d-mezquita", title: "Córdoba 2-Day Mezquita Trip",
    coverImage: null, gradient: "from-amber-500 to-red-600", author: AI,
    days: 2, estimatedCost: 170, currency: "EUR",
    tags: ["History", "Culture", "Foodie"],
    excerpt: "Two days of the column forest: the Mezquita at its booked hour, courtyard lanes and the Roman bridge at sunset.",
    weatherTip: "March–May brings the patio festival; summer exceeds 40°C — mornings only.",
    fullDays: [
      { day: 1, theme: "The Mezquita", activities: [
        { time: "08:30", name: "The Mezquita's 856 columns at opening", emoji: "🕌" },
        { time: "11:30", name: "The Alcazar's gardens & mosaics", emoji: "🌺" },
        { time: "19:00", name: "The Roman bridge at sunset", emoji: "🌉" } ] },
      { day: 2, theme: "Patios & Farewell", activities: [
        { time: "09:30", name: "The Jewish quarter & the Flower Lane", emoji: "🌸" },
        { time: "12:30", name: "Salmorejo lunch & the patios", emoji: "🍲" },
        { time: "16:00", name: "Train to Seville or airport", emoji: "🚄" } ] },
    ],
    restaurants: [
      { name: "Bodegas Guzmán", cuisine: "Old-cellar tapas · $$", emoji: "🍷" },
      { name: "Taberna Salinas", cuisine: "Since 1870 · $$", emoji: "🍲" },
      { name: "Patio de la Culata", cuisine: "Courtyard bar · $", emoji: "🌸" },
    ],
    city: "Cordoba", country: "Spain", airport: {
      iata: "ODB", icao: "LEBA", name: "Córdoba Airport", city: "Córdoba", country: "Spain",
      timezone: "Europe/Madrid", latitude: 37.8444, longitude: -4.8491,
    }, travelStyle: "cultural",
    interests: ["history", "food"],
    highlights: ["The Mezquita's forest of columns", "The Roman bridge at dusk", "Salmorejo at the source"],
  },
  {
    id: "san-sebastian-3d-pintxos", title: "San Sebastián 3-Day Pintxos Trip",
    coverImage: null, gradient: "from-emerald-500 to-amber-500", author: AI,
    days: 3, estimatedCost: 390, currency: "EUR",
    tags: ["Foodie", "Beaches", "Nightlife"],
    excerpt: "Three days in Europe's best food city: pintxos crawls, La Concha's bay, Monte Igueldo's view and one Michelin splurge.",
    weatherTip: "June–September is beach-and-terrace season; the film festival fills September.",
    fullDays: [
      { day: 1, theme: "La Concha & First Crawl", activities: [
        { time: "10:00", name: "La Concha's bay & the Santa Clara island", emoji: "🏖️" },
        { time: "19:00", name: "The Old Town pintxos crawl — six bars, six bites", emoji: "🍢" } ] },
      { day: 2, theme: "The View & the Wave", activities: [
        { time: "09:30", name: "Monte Igueldo's funicular & fairground view", emoji: "🎡" },
        { time: "13:00", name: "Zurriola's surf beach afternoon", emoji: "🏄" },
        { time: "20:30", name: "The Michelin splurge (Arzak tier)", emoji: "⭐" } ] },
      { day: 3, theme: "Farewell Txakoli", activities: [
        { time: "10:00", name: "The fishing port & txakoli tasting", emoji: "🍷" },
        { time: "14:00", name: "Airport — via a final tortilla", emoji: "✈️" } ] },
    ],
    restaurants: [
      { name: "Bar Nestor", cuisine: "The tortilla · $$", emoji: "🍳" },
      { name: "La Cuchara de San Telmo", cuisine: "Pintxos lab · $$", emoji: "🍢" },
      { name: "Arzak", cuisine: "Three stars · $$$$", emoji: "⭐" },
    ],
    city: "San Sebastian", country: "Spain", airport: EAS, travelStyle: "foodie",
    interests: ["food", "beaches", "nightlife"],
    highlights: ["The six-bar pintxos crawl", "La Concha's shell bay", "One three-star splurge"],
  },
  {
    id: "philadelphia-3d-founding", title: "Philadelphia 3-Day Founding Trip",
    coverImage: null, gradient: "from-blue-600 to-red-500", author: AI,
    days: 3, estimatedCost: 480, currency: "USD",
    tags: ["History", "Foodie", "Culture"],
    excerpt: "Three days of America's birthplace: Independence Hall, the Rocky Steps, Reading Terminal and the mosaic gardens.",
    weatherTip: "April–June and September–October are mild; summer is humid.",
    fullDays: [
      { day: 1, theme: "The Founding", activities: [
        { time: "09:00", name: "Independence Hall (booked tour)", emoji: "🏛️" },
        { time: "11:30", name: "The Liberty Bell", emoji: "🔔" },
        { time: "14:00", name: "Elfreth's Alley & Old City", emoji: "🏘️" } ] },
      { day: 2, theme: "Art & the Steps", activities: [
        { time: "09:30", name: "The Art Museum & the Rocky Steps", emoji: "🥊" },
        { time: "13:00", name: "Reading Terminal Market lunch", emoji: "🧺" },
        { time: "16:00", name: "Magic Gardens' mosaic labyrinth", emoji: "🎨" } ] },
      { day: 3, theme: "Markets & Farewell", activities: [
        { time: "09:30", name: "The Italian Market walk", emoji: "🍅" },
        { time: "12:30", name: "The roast-pork verdict (John's or DiNic's)", emoji: "🥪" },
        { time: "15:30", name: "Airport", emoji: "✈️" } ] },
    ],
    restaurants: [
      { name: "John's Roast Pork", cuisine: "The roast-pork verdict · $$", emoji: "🥪" },
      { name: "Reading Terminal (DiNic's)", cuisine: "Market counters · $$", emoji: "🧺" },
      { name: "Vetri Cucina", cuisine: "Italian fine dining · $$$", emoji: "🍝" },
    ],
    city: "Philadelphia", country: "USA", airport: PHL, travelStyle: "cultural",
    interests: ["history", "food", "museums"],
    highlights: ["The founding rooms", "The Rocky Steps' sprint", "The roast-pork verdict"],
  },
  {
    id: "denver-4d-mile-high", title: "Denver 4-Day Mile High Trip",
    coverImage: null, gradient: "from-amber-500 to-blue-700", author: AI,
    days: 4, estimatedCost: 680, currency: "USD",
    tags: ["Adventure", "Nature", "Foodie"],
    excerpt: "Four days at altitude: Red Rocks, the Rockies' elk meadows, the brewery trail and a ski-or-hike mountain day.",
    weatherTip: "June–September is trail season; winter is ski season with 300 days of sun either way.",
    fullDays: [
      { day: 1, theme: "The Mile High City", activities: [
        { time: "10:00", name: "Union Station & LoDo's breweries", emoji: "🍺" },
        { time: "15:00", name: "Red Rocks Amphitheatre's trails", emoji: "🪨" } ] },
      { day: 2, theme: "Rocky Mountain Day", activities: [
        { time: "07:30", name: "Rocky Mountain NP: Trail Ridge & elk meadows", emoji: "🦌" },
        { time: "17:00", name: "Boulder's Pearl Street dinner", emoji: "🍽️" } ] },
      { day: 3, theme: "Mountain Day", activities: [
        { time: "08:00", name: "Breckenridge ski day or the Alpine slide season", emoji: "⛷️" },
        { time: "18:00", name: "Hot-springs soak in Idaho Springs", emoji: "♨️" } ] },
      { day: 4, theme: "Farewell", activities: [
        { time: "09:30", name: "The Art Museum & RiNo murals", emoji: "🎨" },
        { time: "14:00", name: "Airport — hydrate on the way", emoji: "✈️" } ] },
    ],
    restaurants: [
      { name: "The Buckhorn Exchange", cuisine: "Denver's oldest restaurant · $$$", emoji: "🦌" },
      { name: "Snooze A.M. Eatery", cuisine: "Pancake institution · $$", emoji: "🥞" },
      { name: "Great Divide Brewing", cuisine: "Taproom · $$", emoji: "🍺" },
    ],
    city: "Denver", country: "USA", airport: DEN, travelStyle: "active",
    interests: ["nature", "food", "sports"],
    highlights: ["Red Rocks at golden hour", "The Rockies' elk meadows", "The brewery trail"],
  },
  {
    id: "nashville-3d-music-city", title: "Nashville 3-Day Music City Trip",
    coverImage: null, gradient: "from-amber-400 to-red-600", author: AI,
    days: 3, estimatedCost: 480, currency: "USD",
    tags: ["Nightlife", "Foodie", "Music"],
    excerpt: "Three days of Music City: Broadway's honky-tonks, the Ryman's pews, hot chicken and the Opry stage.",
    weatherTip: "April–June and September–October are mild and festival-filled.",
    fullDays: [
      { day: 1, theme: "Broadway", activities: [
        { time: "12:00", name: "Broadway's honky-tonk hop (no covers, tip the bands)", emoji: "🎸" },
        { time: "18:00", name: "Hot chicken dinner — Prince's or Hattie B's", emoji: "🍗" },
        { time: "21:00", name: "Rooftop bars on Lower Broad", emoji: "🌃" } ] },
      { day: 2, theme: "The Sacred & the Opry", activities: [
        { time: "10:00", name: "The Ryman Auditorium's pews tour", emoji: "⛪" },
        { time: "14:00", name: "RCA Studio B's Elvis piano", emoji: "🎹" },
        { time: "19:00", name: "Grand Ole Opry show", emoji: "🎤" } ] },
      { day: 3, theme: "Neighborhoods & Farewell", activities: [
        { time: "10:00", name: "12South's murals & cookie line", emoji: "🍪" },
        { time: "13:00", name: "The Gulch & airport", emoji: "✈️" } ] },
    ],
    restaurants: [
      { name: "Prince's Hot Chicken", cuisine: "The original · $$", emoji: "🍗" },
      { name: "Hattie B's", cuisine: "Hot chicken rival · $$", emoji: "🔥" },
      { name: "The Loveless Cafe", cuisine: "Biscuits & country ham · $$", emoji: "🥞" },
    ],
    city: "Nashville", country: "USA", airport: BNA, travelStyle: "cultural",
    interests: ["nightlife", "food", "nightlife"],
    highlights: ["Live bands from noon to 3am", "The Ryman's mother-church acoustics", "Hot chicken done right"],
  },
  {
    id: "honolulu-5d-paradise", title: "Honolulu 5-Day Paradise Trip",
    coverImage: null, gradient: "from-cyan-400 to-emerald-600", author: AI,
    days: 5, estimatedCost: 1100, currency: "USD",
    tags: ["Beaches", "Nature", "History"],
    excerpt: "Five days of Oahu: Diamond Head at dawn, Pearl Harbor's memorials, Waikiki's surf lessons and the North Shore's winter waves.",
    weatherTip: "April–June and September–November are calm; winter brings the North Shore's giants.",
    fullDays: [
      { day: 1, theme: "Waikiki", activities: [
        { time: "09:00", name: "Beginner surf lesson off Waikiki", emoji: "🏄" },
        { time: "16:00", name: "Sunset on the beach with the Diamond Head silhouette", emoji: "🌅" } ] },
      { day: 2, theme: "Diamond Head & the East", activities: [
        { time: "06:00", name: "Diamond Head's crater sunrise hike", emoji: "🌄" },
        { time: "12:00", name: "Hanauma Bay snorkel reserve", emoji: "🐠" } ] },
      { day: 3, theme: "Pearl Harbor", activities: [
        { time: "08:00", name: "The USS Arizona Memorial (booked)", emoji: "🕊️" },
        { time: "14:00", name: "Poke & plate-lunch crawl", emoji: "🍚" } ] },
      { day: 4, theme: "North Shore", activities: [
        { time: "09:00", name: "Waimea Bay & the Banzai Pipeline (winter: watch)", emoji: "🌊" },
        { time: "15:00", name: "Matsumoto's shave ice", emoji: "🍧" } ] },
      { day: 5, theme: "Farewell", activities: [
        { time: "09:00", name: "Final swim & HNL", emoji: "✈️" } ] },
    ],
    restaurants: [
      { name: "Leonard's Bakery", cuisine: "Malasadas · $", emoji: "🍩" },
      { name: "Ono Seafood", cuisine: "Poke benchmark · $$", emoji: "🍚" },
      { name: "Roy's Waikiki", cuisine: "Hawaiian fusion · $$$", emoji: "🌺" },
    ],
    city: "Honolulu", country: "USA", airport: HNL, travelStyle: "relaxed",
    interests: ["beaches", "nature", "history"],
    highlights: ["The crater sunrise", "The Arizona memorial", "Shave ice after the North Shore"],
  },
  {
    id: "banff-4d-turquoise", title: "Banff 4-Day Turquoise Lakes Trip",
    coverImage: null, gradient: "from-cyan-500 to-indigo-700", author: AI,
    days: 4, estimatedCost: 800, currency: "CAD",
    tags: ["Nature", "Adventure", "Photography"],
    excerpt: "Four days in the Rockies' postcard: Lake Louise, Moraine's ten peaks, Johnston Canyon and the Icefields Parkway.",
    weatherTip: "June–September thaws the lakes turquoise; winter freezes them into ice-skating rinks and walkable canyons.",
    fullDays: [
      { day: 1, theme: "Banff & Sulphur", activities: [
        { time: "10:00", name: "Sulphur Mountain's gondola", emoji: "🚡" },
        { time: "17:00", name: "Banff Upper Hot Springs", emoji: "♨️" } ] },
      { day: 2, theme: "The Lakes", activities: [
        { time: "07:00", name: "Lake Louise at dawn (park shuttle)", emoji: "🏞️" },
        { time: "11:00", name: "Moraine Lake's Valley of the Ten Peaks", emoji: "🏔️" } ] },
      { day: 3, theme: "Canyon & Parkway", activities: [
        { time: "09:00", name: "Johnston Canyon's catwalks", emoji: "💦" },
        { time: "13:00", name: "The Icefields Parkway to the Athabasca Glacier", emoji: "🧊" } ] },
      { day: 4, theme: "Wildlife & Farewell", activities: [
        { time: "08:00", name: "Two Jack Lake & the bison loop", emoji: "🦬" },
        { time: "14:00", name: "Drive to YYC", emoji: "✈️" } ] },
    ],
    restaurants: [
      { name: "The Grizzly House", cuisine: "Fondue institution · $$$", emoji: "🧀" },
      { name: "Three Bears Brewery", cuisine: "Banff brewpub · $$", emoji: "🍺" },
      { name: "Park distillery", cuisine: "Alpine campfire food · $$", emoji: "🔥" },
    ],
    city: "Banff", country: "Canada", airport: YYC, travelStyle: "adventure",
    interests: ["nature", "sports", "food"],
    highlights: ["Moraine's ten peaks", "The canyon catwalks", "The glacier drive"],
  },
  {
    id: "tulum-4d-cenotes", title: "Tulum 4-Day Cenotes & Ruins Trip",
    coverImage: null, gradient: "from-lime-400 to-cyan-600", author: AI,
    days: 4, estimatedCost: 520, currency: "USD",
    tags: ["Beaches", "History", "Nature"],
    excerpt: "Four days of the boho coast: cliff-top ruins, jungle cenote swims, the biosphere float and the beach-strip bikes.",
    weatherTip: "November–April is dry season; cenote water is 24°C year-round.",
    fullDays: [
      { day: 1, theme: "The Ruins & the Beach", activities: [
        { time: "08:00", name: "Tulum's cliff-top ruins at opening", emoji: "🏛️" },
        { time: "13:00", name: "The beach strip's clubs & tacos", emoji: "🌮" } ] },
      { day: 2, theme: "Cenote Day", activities: [
        { time: "09:00", name: "Gran Cenote & Dos Ojos' caverns", emoji: "🤿" },
        { time: "17:00", name: "Mezcal hour on the strip", emoji: "🍹" } ] },
      { day: 3, theme: "Coba & Biosphere", activities: [
        { time: "08:00", name: "Coba's jungle pyramid (bicycle up)", emoji: "🚲" },
        { time: "15:00", name: "Sian Ka'an's biosphere float", emoji: "🌿" } ] },
      { day: 4, theme: "Farewell", activities: [
        { time: "09:00", name: "Beach morning & CUN airport", emoji: "✈️" } ] },
    ],
    restaurants: [
      { name: "Taqueria Honorio", cuisine: "Tulum's taco legend · $", emoji: "🌮" },
      { name: "Arca", cuisine: "Open-fire kitchen · $$$", emoji: "🔥" },
      { name: "Posada Margherita", cuisine: "Italian on the sand · $$", emoji: "🍝" },
    ],
    city: "Tulum", country: "Mexico", airport: {
      iata: "CUN", icao: "MMUN", name: "Cancún International Airport", city: "Cancún", country: "Mexico",
      timezone: "America/Cancun", latitude: 21.0365, longitude: -86.8771,
    }, travelStyle: "relaxed",
    interests: ["beaches", "history", "nature"],
    highlights: ["Ruins above the surf", "Cenote caverns", "The biosphere float"],
  },
  {
    id: "lima-3d-gastronomy", title: "Lima 3-Day Gastronomy Trip",
    coverImage: null, gradient: "from-gray-500 to-lime-500", author: AI,
    days: 3, estimatedCost: 210, currency: "USD",
    tags: ["Foodie", "Culture", "City Break"],
    excerpt: "Three days in the Americas' food capital: ceviche at the source, the cliff-top malecón, Barranco's bohemias and one world-ten table.",
    weatherTip: "December–April is Lima's sunny summer; May–November is the mild grey season.",
    fullDays: [
      { day: 1, theme: "Miraflores & Ceviche", activities: [
        { time: "12:30", name: "Ceviche lunch at a La Mar-class cevichería", emoji: "🐟" },
        { time: "16:00", name: "The malecón's cliff walk & paragliders", emoji: "🪂" },
        { time: "20:00", name: "Barranco's peña (folk-music) night", emoji: "🎸" } ] },
      { day: 2, theme: "Colonial & Catacombs", activities: [
        { time: "09:30", name: "The Plaza Mayor & the Catacombs", emoji: "⛪" },
        { time: "14:00", name: "The Central or Maido splurge (booked months out)", emoji: "⭐" } ] },
      { day: 3, theme: "Markets & Farewell", activities: [
        { time: "10:00", name: "Barranco's murals & Bridge of Sighs", emoji: "🌉" },
        { time: "14:00", name: "Pisco sour lesson & airport", emoji: "✈️" } ] },
    ],
    restaurants: [
      { name: "Central", cuisine: "World-top-ten · $$$$", emoji: "⭐" },
      { name: "La Mar", cuisine: "Ceviche bar · $$$", emoji: "🐟" },
      { name: "El Mercado", cuisine: "Market-to-table · $$$", emoji: "🦐" },
    ],
    city: "Lima", country: "Peru", airport: LIM, travelStyle: "foodie",
    interests: ["food", "history"],
    highlights: ["Ceviche at its birthplace", "The paragliders off the cliffs", "One world-top-ten table"],
  },
  {
    id: "buenos-aires-4d-milongas", title: "Buenos Aires 4-Day Milongas Trip",
    coverImage: null, gradient: "from-sky-400 to-rose-500", author: AI,
    days: 4, estimatedCost: 320, currency: "USD",
    tags: ["Foodie", "Nightlife", "Culture"],
    excerpt: "Four days of the midnight city: tango milongas, La Boca's colors, Recoleta's mausoleums and the parrilla nights.",
    weatherTip: "March–May and September–November are the mild shoulder seasons.",
    fullDays: [
      { day: 1, theme: "San Telmo & First Tango", activities: [
        { time: "10:00", name: "San Telmo's antiques & Sunday market", emoji: "🕰️" },
        { time: "20:00", name: "A milonga night — watch first, dance later", emoji: "💃" } ] },
      { day: 2, theme: "La Boca & Recoleta", activities: [
        { time: "10:00", name: "La Boca's Caminito sheets-metal colors", emoji: "🎨" },
        { time: "14:00", name: "Recoleta Cemetery's mausoleums", emoji: "🏛️" },
        { time: "21:00", name: "Parrilla steak-and-Malbec night", emoji: "🥩" } ] },
      { day: 3, theme: "Palermo & the Delta", activities: [
        { time: "10:00", name: "Palermo Soho's cafés & boutiques", emoji: "☕" },
        { time: "15:00", name: "Tigre delta boat afternoon", emoji: "🛥️" } ] },
      { day: 4, theme: "Farewell", activities: [
        { time: "10:00", name: "Café Tortoni's 1858 coffee & EZE", emoji: "✈️" } ] },
    ],
    restaurants: [
      { name: "Don Julio", cuisine: "The parrilla reservation · $$$", emoji: "🥩" },
      { name: "El Cuartito", cuisine: "Pizza since 1934 · $$", emoji: "🍕" },
      { name: "Café Tortoni", cuisine: "Since 1858 · $$", emoji: "☕" },
    ],
    city: "Buenos Aires", country: "Argentina", airport: EZE, travelStyle: "foodie",
    interests: ["food", "nightlife", "history"],
    highlights: ["A real milonga night", "The steak-and-Malbec ritual", "Café Tortoni's century of coffee"],
  },
  {
    id: "adelaide-4d-wine", title: "Adelaide 4-Day Wine & Wildlife Trip",
    coverImage: null, gradient: "from-rose-400 to-emerald-600", author: AI,
    days: 4, estimatedCost: 600, currency: "AUD",
    tags: ["Foodie", "Nature", "Relaxed"],
    excerpt: "Four days of the festival city: Barossa cellar doors, Kangaroo Island's wildlife and the Central Market mornings.",
    weatherTip: "March–May is warm, calm and post-festival; December–February is hot and dry.",
    fullDays: [
      { day: 1, theme: "The City & Market", activities: [
        { time: "09:00", name: "Adelaide Central Market's producers", emoji: "🧺" },
        { time: "15:00", name: "Glenelg Beach by tram", emoji: "🏖️" } ] },
      { day: 2, theme: "Barossa Day", activities: [
        { time: "09:30", name: "Barossa Valley cellar doors & a Shiraz masterclass", emoji: "🍇" },
        { time: "17:00", name: "Hahndorf's German village dinner", emoji: "🥨" } ] },
      { day: 3, theme: "Kangaroo Island", activities: [
        { time: "08:00", name: "Kangaroo Island: kangaroos, koalas, sea lions", emoji: "🦘" } ] },
      { day: 4, theme: "Hills & Farewell", activities: [
        { time: "10:00", name: "The Adelaide Hills villages & ADL", emoji: "✈️" } ] },
    ],
    restaurants: [
      { name: "Africola", cuisine: "Fire-driven East African · $$", emoji: "🔥" },
      { name: "Appellation (Barossa)", cuisine: "Vineyard dining · $$$", emoji: "🍷" },
      { name: "Central Market stalls", cuisine: "Producer breakfast · $", emoji: "🧺" },
    ],
    city: "Adelaide", country: "Australia", airport: ADL, travelStyle: "relaxed",
    interests: ["food", "nature", "beaches"],
    highlights: ["Barossa's Shiraz doors", "Kangaroo Island's wildlife", "The market mornings"],
  },
  {
    id: "cairns-4d-reef", title: "Cairns 4-Day Reef & Rainforest Trip",
    coverImage: null, gradient: "from-cyan-500 to-emerald-600", author: AI,
    days: 4, estimatedCost: 640, currency: "AUD",
    tags: ["Nature", "Adventure", "Beaches"],
    excerpt: "Four days of the reef's gateway: the outer-reef snorkel, the Daintree's oldest rainforest and the Skyrail over the canopy.",
    weatherTip: "June–October is the dry, stinger-light reef window.",
    fullDays: [
      { day: 1, theme: "The Outer Reef", activities: [
        { time: "08:00", name: "Outer-reef snorkel and dive boat (two sites)", emoji: "🐠" },
        { time: "17:00", name: "Esplanade lagoon sunset", emoji: "🌅" } ] },
      { day: 2, theme: "The Daintree", activities: [
        { time: "08:00", name: "Cape Tribulation & the Daintree river cruise", emoji: "🌿" },
        { time: "16:00", name: "Mossman Gorge swim", emoji: "💦" } ] },
      { day: 3, theme: "Skyrail & Kuranda", activities: [
        { time: "09:30", name: "The Skyrail over the canopy to Kuranda", emoji: "🚡" },
        { time: "15:00", name: "The scenic railway back down", emoji: "🚂" } ] },
      { day: 4, theme: "Farewell", activities: [
        { time: "09:00", name: "Fitzroy Island morning & airport", emoji: "✈️" } ] },
    ],
    restaurants: [
      { name: "Dundee's on the Waterfront", cuisine: "Reef seafood · $$", emoji: "🦞" },
      { name: "Rusty's Markets", cuisine: "Tropical produce · $", emoji: "🥭" },
      { name: "Ochre Restaurant", cuisine: "Native Australian · $$$", emoji: "🌿" },
    ],
    city: "Cairns", country: "Australia", airport: CNS, travelStyle: "adventure",
    interests: ["nature", "beaches", "food"],
    highlights: ["The outer reef's two sites", "The world's oldest rainforest", "The Skyrail canopy"],
  },
  {
    id: "christchurch-3d-garden", title: "Christchurch 3-Day Garden City Trip",
    coverImage: null, gradient: "from-emerald-500 to-rose-500", author: AI,
    days: 3, estimatedCost: 420, currency: "NZD",
    tags: ["Nature", "Culture", "Relaxed"],
    excerpt: "Three days of the reborn garden city: punting on the Avon, the street-art trail, Kaikoura's whales and an alpine pass day.",
    weatherTip: "December–March is the warm, long-day summer; winter adds Mount Hutt's ski fields.",
    fullDays: [
      { day: 1, theme: "The Gardens & the River", activities: [
        { time: "09:30", name: "Punting on the Avon through the Botanic Gardens", emoji: "🛶" },
        { time: "14:00", name: "Riverside Market & the street-art trail", emoji: "🎨" } ] },
      { day: 2, theme: "Kaikoura Whales", activities: [
        { time: "08:00", name: "Drive north for the sperm-whale boat", emoji: "🐋" },
        { time: "18:00", name: "Return for a crayfish dinner", emoji: "🦞" } ] },
      { day: 3, theme: "Alpine Pass", activities: [
        { time: "08:30", name: "Arthur's Pass's alpine train or drive", emoji: "🏔️" },
        { time: "16:00", name: "Airport", emoji: "✈️" } ] },
    ],
    restaurants: [
      { name: "Riverside Market", cuisine: "Collective kitchens · $$", emoji: "🧺" },
      { name: "Inati", cuisine: "Chef's-table fine dining · $$$", emoji: "⭐" },
      { name: "Twenty Seven Steps", cuisine: "Modern NZ · $$$", emoji: "🍽️" },
    ],
    city: "Christchurch", country: "New Zealand", airport: CHC, travelStyle: "relaxed",
    interests: ["nature", "food", "museums"],
    highlights: ["Punting the Avon", "Sperm whales at Kaikoura", "Arthur's Pass's alpine railway"],
  },
  {
    id: "rotorua-3d-geothermal", title: "Rotorua 3-Day Geothermal Trip",
    coverImage: null, gradient: "from-orange-500 to-emerald-700", author: AI,
    days: 3, estimatedCost: 420, currency: "NZD",
    tags: ["Nature", "Culture", "Family"],
    excerpt: "Three days of the geothermal heart: geysers, mud pools, a Māori hāngī welcome and the Redwoods treewalk.",
    weatherTip: "December–March is warm and long-dayed; the steam fields are dramatic in cool months.",
    fullDays: [
      { day: 1, theme: "Geysers & Culture", activities: [
        { time: "09:00", name: "Te Puia's Pohutu geyser & carving school", emoji: "🌋" },
        { time: "17:30", name: "The Māori hāngī feast & hongi welcome", emoji: "🔥" } ] },
      { day: 2, theme: "Wai-O-Tapu & Mud", activities: [
        { time: "08:30", name: "The Champagne Pool & Lady Knox geyser show", emoji: "⛲" },
        { time: "14:00", name: "The mud pools & Hells Gate's spa", emoji: "🧖" } ] },
      { day: 3, theme: "Redwoods & Lakes", activities: [
        { time: "09:30", name: "The Redwoods treewalk's lantern bridges", emoji: "🌲" },
        { time: "14:00", name: "Lake Rotorua's hot-pool edges & airport", emoji: "✈️" } ] },
    ],
    restaurants: [
      { name: "Atticus Finch", cuisine: "Modern NZ · $$$", emoji: "🍽️" },
      { name: "Sabroso", cuisine: "Latin-NZ · $$", emoji: "🌮" },
      { name: "Stratosfare", cuisine: "Skyline gondola dining · $$$", emoji: "🚡" },
    ],
    city: "Rotorua", country: "New Zealand", airport: ROT, travelStyle: "cultural",
    interests: ["nature", "history", "food"],
    highlights: ["Pohutu's eruptions", "The Champagne Pool", "The hāngī and hongi welcome"],
  },
];

import type { Airport } from "@/types/flight";
import type { RawTripInput } from "./trips-extended-a";

// Extended trips, batch C — Asia city & country trips. estimatedCost follows
// destinations budgetPerDay × days at the mid tier.

const AI = { kind: "ai" as const, name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" };

const NRT: Airport = {
  iata: "NRT", icao: "RJAA", name: "Narita International Airport", city: "Tokyo", country: "Japan",
  timezone: "Asia/Tokyo", latitude: 35.7647, longitude: 140.3864,
};
const ICN: Airport = {
  iata: "ICN", icao: "RKSI", name: "Incheon International Airport", city: "Seoul", country: "South Korea",
  timezone: "Asia/Seoul", latitude: 37.4602, longitude: 126.4407,
};
const SIN: Airport = {
  iata: "SIN", icao: "WSSS", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore",
  timezone: "Asia/Singapore", latitude: 1.3644, longitude: 103.9915,
};
const BKK: Airport = {
  iata: "BKK", icao: "VTBS", name: "Suvarnabhumi Airport", city: "Bangkok", country: "Thailand",
  timezone: "Asia/Bangkok", latitude: 13.69, longitude: 100.7501,
};
const HAN: Airport = {
  iata: "HAN", icao: "VVNB", name: "Noi Bai International Airport", city: "Hanoi", country: "Vietnam",
  timezone: "Asia/Ho_Chi_Minh", latitude: 21.2212, longitude: 105.8072,
};
const SGN: Airport = {
  iata: "SGN", icao: "VVTS", name: "Tan Son Nhat International Airport", city: "Ho Chi Minh City", country: "Vietnam",
  timezone: "Asia/Ho_Chi_Minh", latitude: 10.8188, longitude: 106.8069,
};
const MNL: Airport = {
  iata: "MNL", icao: "RPLL", name: "Ninoy Aquino International Airport", city: "Manila", country: "Philippines",
  timezone: "Asia/Manila", latitude: 14.5086, longitude: 121.0198,
};
const CGK: Airport = {
  iata: "CGK", icao: "WIII", name: "Soekarno-Hatta International Airport", city: "Jakarta", country: "Indonesia",
  timezone: "Asia/Jakarta", latitude: -6.1256, longitude: 106.6558,
};
const YIA: Airport = {
  iata: "YIA", icao: "WIHI", name: "Yogyakarta International Airport", city: "Yogyakarta", country: "Indonesia",
  timezone: "Asia/Jakarta", latitude: -7.9014, longitude: 110.0576,
};
const CNX: Airport = {
  iata: "CNX", icao: "VTCC", name: "Chiang Mai International Airport", city: "Chiang Mai", country: "Thailand",
  timezone: "Asia/Bangkok", latitude: 18.7669, longitude: 98.9626,
};
const HKT: Airport = {
  iata: "HKT", icao: "VTSP", name: "Phuket International Airport", city: "Phuket", country: "Thailand",
  timezone: "Asia/Bangkok", latitude: 8.1132, longitude: 98.3169,
};
const USM: Airport = {
  iata: "USM", icao: "VTSM", name: "Samui Airport", city: "Koh Samui", country: "Thailand",
  timezone: "Asia/Bangkok", latitude: 9.5476, longitude: 100.0613,
};
const DAD: Airport = {
  iata: "DAD", icao: "VVDN", name: "Da Nang International Airport", city: "Da Nang", country: "Vietnam",
  timezone: "Asia/Ho_Chi_Minh", latitude: 16.0439, longitude: 108.1994,
};
const CXR: Airport = {
  iata: "CXR", icao: "VVNT", name: "Cam Ranh International Airport", city: "Nha Trang", country: "Vietnam",
  timezone: "Asia/Ho_Chi_Minh", latitude: 11.9982, longitude: 109.2195,
};
const PQC: Airport = {
  iata: "PQC", icao: "VVPQ", name: "Phu Quoc International Airport", city: "Phu Quoc", country: "Vietnam",
  timezone: "Asia/Ho_Chi_Minh", latitude: 10.1713, longitude: 103.9928,
};
const SAI: Airport = {
  iata: "SAI", icao: "VDSR", name: "Siem Reap-Angkor International Airport", city: "Siem Reap", country: "Cambodia",
  timezone: "Asia/Phnom_Penh", latitude: 13.4107, longitude: 103.8132,
};
const PNH: Airport = {
  iata: "PNH", icao: "VDPP", name: "Phnom Penh International Airport", city: "Phnom Penh", country: "Cambodia",
  timezone: "Asia/Phnom_Penh", latitude: 11.5466, longitude: 104.8441,
};
const CJU: Airport = {
  iata: "CJU", icao: "RKPC", name: "Jeju International Airport", city: "Jeju", country: "South Korea",
  timezone: "Asia/Seoul", latitude: 33.5113, longitude: 126.493,
};
const DPS: Airport = {
  iata: "DPS", icao: "WADD", name: "I Gusti Ngurah Rai International Airport", city: "Bali (Denpasar)", country: "Indonesia",
  timezone: "Asia/Makassar", latitude: -8.7482, longitude: 115.1675,
};

export const EXTENDED_TRIPS_C: RawTripInput[] = [
  {
    id: "tokyo-shopping-3d",
    title: "Tokyo 3-Day Shopping Trip",
    coverImage: null,
    gradient: "from-pink-500 to-purple-600",
    author: AI,
    days: 3,
    estimatedCost: 360,
    currency: "USD",
    tags: ["Shopping", "Fashion", "City Break"],
    excerpt:
      "Three days across Tokyo's retail universe: Ginza's flagships, Shimokitazawa's vintage, Nakameguro's independents and Akihabara's electric madness.",
    weatherTip:
      "Shopping is weather-proof. Late January and July bring the Fukubukuro lucky-bag and summer sale seasons; late December has the year's best Fukubukuro.",
    fullDays: [
      {
        day: 1,
        theme: "Ginza & Department Stores",
        activities: [
          { time: "10:00", name: "Ginza Six & the flagship flagships", emoji: "🛍️" },
          { time: "13:00", name: "Depachika food-hall lunch", emoji: "🍱" },
          { time: "15:00", name: "Uniqlo Ginza's twelve floors", emoji: "👕" },
          { time: "18:00", name: "Itoya stationery heaven", emoji: "✏️" },
        ],
      },
      {
        day: 2,
        theme: "Harajuku, Shimokitazawa & Nakameguro",
        activities: [
          { time: "10:00", name: "Takeshita-dori & Ura-Harajuku boutiques", emoji: "🎀" },
          { time: "14:00", name: "Shimokitazawa vintage crawl", emoji: "👕" },
          { time: "17:00", name: "Nakameguro's canal-side independents", emoji: "☕" },
          { time: "19:30", name: "Daikanyama's T-Site browsing", emoji: "📚" },
        ],
      },
      {
        day: 3,
        theme: "Akihabara & Farewell",
        activities: [
          { time: "10:00", name: "Akihabara's electronics & anime floors", emoji: "🎮" },
          { time: "13:30", name: "Kappabashi kitchen-street knives", emoji: "🔪" },
          { time: "16:00", name: "Tokyo Station Character Street souvenirs", emoji: "🎁" },
          { time: "19:00", name: "Tax-free wrap-up & luggage check", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Depachika counters", cuisine: "Deli grazing · $$", emoji: "🍱" },
      { name: "Afuri Nakameguro", cuisine: "Yuzu ramen · $", emoji: "🍜" },
      { name: "Katsu Midori Shibuya", cuisine: "Conveyor sushi · $$", emoji: "🍣" },
    ],
    city: "Tokyo",
    country: "Japan",
    airport: NRT,
    travelStyle: "active",
    interests: ["shopping", "food", "nightlife"],
    highlights: [
      "Ginza to Shimokitazawa: five retail personalities in three days",
      "Kappabashi's knife shops for the kitchen souvenir",
      "The tax-free system, used correctly",
    ],
  },
  {
    id: "tokyo-luxury-4d",
    title: "Tokyo 4-Day Luxury Trip",
    coverImage: null,
    gradient: "from-amber-400 to-indigo-700",
    author: AI,
    days: 4,
    estimatedCost: 1000,
    currency: "USD",
    tags: ["Luxury", "Foodie", "City Break"],
    excerpt:
      "Four days of Tokyo at the top tier: omakase counters, a ryokan-influenced spa afternoon, tower-view suites and the city's most composed dining.",
    weatherTip:
      "Any season works — luxury Tokyo is climate-controlled. Sakura weeks command the year's highest suite rates; book months out.",
    fullDays: [
      {
        day: 1,
        theme: "Arrive & Ginza Refinement",
        activities: [
          { time: "15:00", name: "Check in — tower suite, tea service", emoji: "🏙️" },
          { time: "17:30", name: "Private Ginza gallery walk", emoji: "🖼️" },
          { time: "19:30", name: "Omakase dinner at a Michelin counter", emoji: "🍣" },
        ],
      },
      {
        day: 2,
        theme: "Culture, Privately",
        activities: [
          { time: "09:00", name: "Early Meiji Shrine with a guide", emoji: "⛩️" },
          { time: "13:00", name: "Kaiseki lunch in Roppongi", emoji: "🍲" },
          { time: "16:00", name: "Private-teamLab or museum hour", emoji: "🎨" },
          { time: "20:00", name: "Skyline bar & club-floor dinner", emoji: "🍸" },
        ],
      },
      {
        day: 3,
        theme: "Onsen & Craft",
        activities: [
          { time: "10:00", name: "Onsen spa morning at a ryokan-style retreat", emoji: "♨️" },
          { time: "14:00", name: "Ginza craft ateliers: knives, lacquer, indigo", emoji: "🔪" },
          { time: "18:30", name: "Teppanyaki with Kobe beef", emoji: "🥩" },
        ],
      },
      {
        day: 4,
        theme: "Departure",
        activities: [
          { time: "10:00", name: "Depachika gourmet shopping for the flight", emoji: "🍱" },
          { time: "13:00", name: "Green-tea ceremony farewell", emoji: "🍵" },
          { time: "16:00", name: "Airport limousine — unhurried", emoji: "🚐" },
        ],
      },
    ],
    restaurants: [
      { name: "Sushi Saito (or equivalent counter)", cuisine: "Omakase · $$$$", emoji: "🍣" },
      { name: "Narisawa", cuisine: "Innovative Japanese · $$$$", emoji: "🌿" },
      { name: "Wakkoqu", cuisine: "Teppanyaki Kobe beef · $$$", emoji: "🥩" },
    ],
    city: "Tokyo",
    country: "Japan",
    airport: NRT,
    travelStyle: "relaxed",
    interests: ["food", "museums", "shopping"],
    highlights: [
      "One omakase that defines the trip",
      "A ryokan-style onsen afternoon inside the city",
      "Craft ateliers over malls",
    ],
  },
  {
    id: "tokyo-7d-deep-dive",
    title: "Tokyo 7-Day Deep Dive",
    coverImage: null,
    gradient: "from-indigo-500 to-rose-600",
    author: AI,
    days: 7,
    estimatedCost: 840,
    currency: "USD",
    tags: ["Culture", "Foodie", "Neighborhoods"],
    excerpt:
      "A full week in the city of twelve cities: the classic core, then the neighborhoods, markets, islands and side streets most itineraries never reach.",
    weatherTip:
      "March–May and October–November are ideal for seven walking days. Summer demands the morning-and-evening rhythm.",
    fullDays: [
      {
        day: 1,
        theme: "Old East: Asakusa & Yanaka",
        activities: [
          { time: "08:30", name: "Senso-ji & Nakamise", emoji: "🏯" },
          { time: "14:00", name: "Yanaka's temple lanes", emoji: "🚶" },
          { time: "18:30", name: "Ueno izakaya dinner", emoji: "🍶" },
        ],
      },
      {
        day: 2,
        theme: "Modern West: Meiji to Shibuya",
        activities: [
          { time: "09:00", name: "Meiji Shrine & Harajuku", emoji: "⛩️" },
          { time: "16:00", name: "Shibuya Crossing & Sky", emoji: "🌆" },
          { time: "19:30", name: "Shinjuku Golden Gai bars", emoji: "🏮" },
        ],
      },
      {
        day: 3,
        theme: "Center & Bayside",
        activities: [
          { time: "08:30", name: "Tsukiji Outer Market", emoji: "🍣" },
          { time: "13:00", name: "Ginza & the Imperial gardens", emoji: "🛍️" },
          { time: "17:00", name: "Odaiba waterfront", emoji: "🌉" },
        ],
      },
      {
        day: 4,
        theme: "Neighborhood Day: Shimokitazawa & Koenji",
        activities: [
          { time: "10:00", name: "Shimokitazawa vintage & coffee", emoji: "👕" },
          { time: "15:00", name: "Koenji's punk thrift lanes", emoji: "🎸" },
          { time: "19:00", name: "Koenji tachinomi standing bars", emoji: "🍶" },
        ],
      },
      {
        day: 5,
        theme: "Day Trip: Kamakura",
        activities: [
          { time: "08:30", name: "Enoden line to Kamakura", emoji: "🚃" },
          { time: "10:30", name: "The Great Buddha & Hase-dera", emoji: "🛕" },
          { time: "16:00", name: "Enoshima's sea-candle sunset", emoji: "🌅" },
        ],
      },
      {
        day: 6,
        theme: "Markets & Museums",
        activities: [
          { time: "09:30", name: "Toyosu market tuna viewing", emoji: "🐟" },
          { time: "12:30", name: "teamLab Planets", emoji: "🎨" },
          { time: "16:30", name: "Nakameguro & Daikanyama stroll", emoji: "☕" },
        ],
      },
      {
        day: 7,
        theme: "Flex & Departure",
        activities: [
          { time: "09:30", name: "Return to your favorite neighborhood", emoji: "🚶" },
          { time: "14:00", name: "Souvenir logistics at Tokyo Station", emoji: "🎁" },
          { time: "18:00", name: "Farewell dinner: the meal you missed", emoji: "🍽️" },
        ],
      },
    ],
    restaurants: [
      { name: "Sushi Dai", cuisine: "Toyosu sushi · $$$", emoji: "🍣" },
      { name: "Bear Pond Espresso", cuisine: "Koenji coffee · $$", emoji: "☕" },
      { name: "Omoide Yokocho", cuisine: "Yakitori alley · $", emoji: "🏮" },
    ],
    city: "Tokyo",
    country: "Japan",
    airport: NRT,
    travelStyle: "cultural",
    interests: ["food", "shopping", "history"],
    highlights: [
      "The neighborhoods most trips never reach",
      "Kamakura by the Enoden coast line",
      "A flex day engineered for whim",
    ],
  },
  {
    id: "paris-family-4d",
    title: "Paris 4-Day Family Trip",
    coverImage: null,
    gradient: "from-sky-500 to-pink-500",
    author: AI,
    days: 4,
    estimatedCost: 600,
    currency: "USD",
    tags: ["Family", "Culture", "Parks"],
    excerpt:
      "Four kid-paced days: one museum morning, one park afternoon, a boat ride, and crêpes as structural engineering.",
    weatherTip:
      "April–June and September are ideal for park days. Summer works with early starts; Parisian playgrounds save every itinerary.",
    fullDays: [
      {
        day: 1,
        theme: "Islands & Boat Ride",
        activities: [
          { time: "10:00", name: "Notre-Dame parvis & the islands' ice cream", emoji: "⛪" },
          { time: "13:00", name: "Crepe lunch on Île Saint-Louis", emoji: "🥞" },
          { time: "15:30", name: "Seine boat cruise (kids' favorite hour)", emoji: "🚤" },
          { time: "18:00", name: "Playground stop & pizza night", emoji: "🍕" },
        ],
      },
      {
        day: 2,
        theme: "Louvre, Lightly",
        activities: [
          { time: "09:30", name: "Louvre highlights trail (booked, 90 min)", emoji: "🖼️" },
          { time: "12:00", name: "Tuileries trampolines & carousel", emoji: "🎠" },
          { time: "15:00", name: "Angelina's hot chocolate", emoji: "🍫" },
          { time: "18:30", name: "Early bistro dinner near the hotel", emoji: "🥖" },
        ],
      },
      {
        day: 3,
        theme: "Eiffel & Champ de Mars",
        activities: [
          { time: "10:00", name: "Eiffel Tower's summit or first floor", emoji: "🗼" },
          { time: "12:30", name: "Champ de Mars picnic", emoji: "🧺" },
          { time: "15:30", name: "Seine-side playgrounds & carousel", emoji: "🎠" },
          { time: "18:00", name: "Bateaux mouche sparkle hour (on the hour after dark)", emoji: "✨" },
        ],
      },
      {
        day: 4,
        theme: "Montmartre & Farewell",
        activities: [
          { time: "10:00", name: "Sacré-Cœur & the carousel at its foot", emoji: "🎨" },
          { time: "12:30", name: "Family crêperie lunch", emoji: "🥞" },
          { time: "15:00", name: "Jardin du Luxembourg's ponies & sailboats", emoji: "⛵" },
          { time: "18:00", name: "Departure with macaron boxes", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Angelina", cuisine: "Hot chocolate · $$", emoji: "🍫" },
      { name: "Le Petit Cler", cuisine: "Family bistro · $$", emoji: "🥖" },
      { name: "Breizh Café", cuisine: "Crêpes · $$", emoji: "🥞" },
    ],
    city: "Paris",
    country: "France",
    airport: {
      iata: "CDG", icao: "LFPG", name: "Charles de Gaulle Airport", city: "Paris", country: "France",
      timezone: "Europe/Paris", latitude: 49.0097, longitude: 2.5479,
    },
    travelStyle: "relaxed",
    interests: ["museums", "food", "nature"],
    highlights: [
      "One museum morning per day, maximum",
      "Carousels, ponies and sailboats as the reward system",
      "The sparkle-hour boat",
    ],
  },
  {
    id: "paris-luxury-4d",
    title: "Paris 4-Day Luxury Trip",
    coverImage: null,
    gradient: "from-rose-400 to-indigo-700",
    author: AI,
    days: 4,
    estimatedCost: 1200,
    currency: "USD",
    tags: ["Luxury", "Foodie", "Culture"],
    excerpt:
      "Four days of Paris at the palace tier: a palace-hotel base, chef's-counter dinners, private museum hours and a chauffeured Versailles day.",
    weatherTip:
      "April–June and September–October are the palace-garden months. Fashion weeks (late Feb, late Sep) surge rates — avoid or embrace.",
    fullDays: [
      {
        day: 1,
        theme: "Arrive & Saint-Germain",
        activities: [
          { time: "15:00", name: "Palace-hotel check-in & courtyard tea", emoji: "🏨" },
          { time: "18:00", name: "Private Saint-Germain gallery stroll", emoji: "🖼️" },
          { time: "20:30", name: "Two-star tasting menu", emoji: "🍷" },
        ],
      },
      {
        day: 2,
        theme: "Louvre & Champagne",
        activities: [
          { time: "09:00", name: "Private or first-hour Louvre tour", emoji: "🖼️" },
          { time: "13:00", name: "Lunch at Le Meurice or L'Ambroisie tier", emoji: "🍽️" },
          { time: "17:00", name: "Champagne hour at the Ritz bar", emoji: "🥂" },
        ],
      },
      {
        day: 3,
        theme: "Versailles, Chauffeured",
        activities: [
          { time: "09:00", name: "Private car to Versailles", emoji: "🚘" },
          { time: "10:00", name: "Palace & gardens before the coaches", emoji: "👑" },
          { time: "16:00", name: "Return via a fromagerie picnic", emoji: "🧺" },
          { time: "20:00", name: "Bistro luxury: Comptoir-tier dinner", emoji: "🥖" },
        ],
      },
      {
        day: 4,
        theme: "Marais & Departure",
        activities: [
          { time: "10:00", name: "Place Vendôme high-jewelry windows", emoji: "💎" },
          { time: "12:30", name: "Marais falafel-and-champagne lunch", emoji: "🥂" },
          { time: "15:00", name: "Spa afternoon before the flight", emoji: "💆" },
        ],
      },
    ],
    restaurants: [
      { name: "L'Ambroisie", cuisine: "Place des Vosges institution · $$$$", emoji: "🍽️" },
      { name: "Le Meurice Alain Ducasse", cuisine: "Palace dining · $$$$", emoji: "🏆" },
      { name: "Bar Vendôme", cuisine: "Champagne & club sandwich · $$$", emoji: "🥂" },
    ],
    city: "Paris",
    country: "France",
    airport: {
      iata: "CDG", icao: "LFPG", name: "Charles de Gaulle Airport", city: "Paris", country: "France",
      timezone: "Europe/Paris", latitude: 49.0097, longitude: 2.5479,
    },
    travelStyle: "relaxed",
    interests: ["food", "museums", "shopping"],
    highlights: [
      "A palace-hotel base with courtyard tea",
      "Versailles before the coaches",
      "One two-star dinner, one bistro — the honest balance",
    ],
  },
  {
    id: "seoul-2d-highlights",
    title: "Seoul 2-Day Highlights",
    coverImage: null,
    gradient: "from-fuchsia-500 to-indigo-700",
    author: AI,
    days: 2,
    estimatedCost: 200,
    currency: "USD",
    tags: ["City Break", "Culture", "Foodie"],
    excerpt:
      "48 hours of Seoul's essentials: palaces and hanok lanes on day one, Hongdae or Itaewon energy on day two.",
    weatherTip:
      "April and October are the beautiful windows. Summer is humid; winter is crisp — T-money works in every season.",
    fullDays: [
      {
        day: 1,
        theme: "Royal Seoul",
        activities: [
          { time: "09:00", name: "Gyeongbokgung & the guard ceremony", emoji: "🏯" },
          { time: "12:00", name: "Bukchon hanok lanes & hanbok photos", emoji: "👘" },
          { time: "15:00", name: "Ikseon-dong cafés & Insadong", emoji: "🍵" },
          { time: "19:00", name: "Korean BBQ dinner", emoji: "🥓" },
        ],
      },
      {
        day: 2,
        theme: "Modern Seoul",
        activities: [
          { time: "10:00", name: "Hongdae or Myeongdong shopping", emoji: "🛍️" },
          { time: "14:00", name: "Street-food lunch crawl", emoji: "🌶️" },
          { time: "17:00", name: "N Seoul Tower or Lotte World view", emoji: "🗼" },
          { time: "20:00", name: "Busking, night market & farewell", emoji: "🎤" },
        ],
      },
    ],
    restaurants: [
      { name: "Maple Tree House", cuisine: "Korean BBQ · $$", emoji: "🥓" },
      { name: "Myeongdong Kyoja", cuisine: "Knife noodles · $", emoji: "🍜" },
      { name: "Ikseon Jangsu", cuisine: "Hanok café · $$", emoji: "☕" },
    ],
    city: "Seoul",
    country: "South Korea",
    airport: ICN,
    travelStyle: "active",
    interests: ["history", "food", "shopping"],
    highlights: [
      "The palace-and-hanok morning",
      "One youth-district evening",
      "BBQ night as the anchor meal",
    ],
  },
  {
    id: "seoul-5d-culture",
    title: "Seoul 5-Day Culture Trip",
    coverImage: null,
    gradient: "from-purple-500 to-amber-600",
    author: AI,
    days: 5,
    estimatedCost: 500,
    currency: "USD",
    tags: ["Culture", "History", "Museums"],
    excerpt:
      "Five days through Korea's layers: palaces and hanok, the DMZ's weight, museums and markets, and a jjimjilbang education.",
    weatherTip:
      "October is the culture-trip ideal — clear air for the Inwangsan ridge and the palaces' foliage. The DMZ runs year-round with passports.",
    fullDays: [
      {
        day: 1,
        theme: "Palaces & Hanok",
        activities: [
          { time: "09:00", name: "Gyeongbokgung & Changdeokgung's Secret Garden (booked)", emoji: "🏯" },
          { time: "14:00", name: "Bukchon & Ikseon-dong", emoji: "🏮" },
          { time: "19:00", name: "Insadong dinner", emoji: "🍲" },
        ],
      },
      {
        day: 2,
        theme: "The DMZ",
        activities: [
          { time: "08:00", name: "Pre-booked DMZ tour", emoji: "🕊️" },
          { time: "15:00", name: "Gwangjang Market recovery meal", emoji: "🥞" },
          { time: "19:00", name: "Early night — history is tiring", emoji: "😴" },
        ],
      },
      {
        day: 3,
        theme: "Museums & Markets",
        activities: [
          { time: "10:00", name: "National Museum of Korea (free)", emoji: "🏛️" },
          { time: "14:00", name: "Mangwon Market grazing", emoji: "🛒" },
          { time: "17:00", name: "Inwangsan ridge at golden hour", emoji: "⛰️" },
        ],
      },
      {
        day: 4,
        theme: "Buddhism & Views",
        activities: [
          { time: "09:30", name: "Bongeunsa temple program", emoji: "🛕" },
          { time: "13:00", name: "Gangnam libraries & lunch", emoji: "📚" },
          { time: "17:30", name: "N Seoul Tower at dusk", emoji: "🗼" },
        ],
      },
      {
        day: 5,
        theme: "Bathhouse & Farewell",
        activities: [
          { time: "10:00", name: "Seoul Design Plaza (Dongdaemun)", emoji: "🏗️" },
          { time: "14:00", name: "Jjimjilbang bathhouse afternoon", emoji: "♨️" },
          { time: "18:00", name: "Farewell chimaek", emoji: "🍗" },
        ],
      },
    ],
    restaurants: [
      { name: "Tosokchon Samgyetang", cuisine: "Ginseng chicken · $$", emoji: "🍗" },
      { name: "Gwangjang Market", cuisine: "Bindaetteok · $", emoji: "🥞" },
      { name: "Onjium", cuisine: "Korean royal cuisine · $$$", emoji: "🍲" },
    ],
    city: "Seoul",
    country: "South Korea",
    airport: ICN,
    travelStyle: "cultural",
    interests: ["history", "food"],
    highlights: [
      "The Secret Garden's reserved hour",
      "The DMZ with a licensed operator",
      "A jjimjilbang as the graduation",
    ],
  },
  {
    id: "seoul-family-4d",
    title: "Seoul 4-Day Family Trip",
    coverImage: null,
    gradient: "from-green-500 to-fuchsia-600",
    author: AI,
    days: 4,
    estimatedCost: 400,
    currency: "USD",
    tags: ["Family", "Theme Parks", "Culture"],
    excerpt:
      "Four kid-winning days: a theme park, hanbok photos, the Han River parks, and food every age agrees on.",
    weatherTip:
      "April–June and September–October are comfortable for park days. Lotte World's indoors saves rainy afternoons.",
    fullDays: [
      {
        day: 1,
        theme: "Palaces & Playgrounds",
        activities: [
          { time: "09:30", name: "Gyeongbokgung (kids love the guards' costumes)", emoji: "🏯" },
          { time: "12:00", name: "Bukchon hanbok rental photos", emoji: "👘" },
          { time: "15:00", name: "Playground & ice cream in Ikseon-dong", emoji: "🍦" },
          { time: "18:00", name: "Korean fried chicken night", emoji: "🍗" },
        ],
      },
      {
        day: 2,
        theme: "Theme Park Day",
        activities: [
          { time: "09:30", name: "Lotte World (indoor) or Everland (outdoor)", emoji: "🎢" },
          { time: "17:30", name: "Hotel-pool recovery", emoji: "🏊" },
          { time: "19:00", name: "Simple dinner near the hotel", emoji: "🍜" },
        ],
      },
      {
        day: 3,
        theme: "Han River Day",
        activities: [
          { time: "10:30", name: "Hanang Park: bikes & kite rental", emoji: "🚲" },
          { time: "13:00", name: "Convenience-store picnic by the river", emoji: "🧺" },
          { time: "16:00", name: "Seoul Children's Museum or COEX aquarium", emoji: "🐠" },
          { time: "19:00", name: "Early dinner & early night", emoji: "😴" },
        ],
      },
      {
        day: 4,
        theme: "Markets & Departure",
        activities: [
          { time: "10:00", name: "Gwangjang Market snack tour", emoji: "🥞" },
          { time: "13:00", name: "Dongdaemun Design Plaza's spaceship photo", emoji: "🏗️" },
          { time: "15:30", name: "Souvenir run & airport", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Kyochon", cuisine: "Fried chicken · $$", emoji: "🍗" },
      { name: "Gwangjang Market", cuisine: "Snack tour · $", emoji: "🥞" },
      { name: "Myeongdong Kyoja", cuisine: "Noodles · $", emoji: "🍜" },
    ],
    city: "Seoul",
    country: "South Korea",
    airport: ICN,
    travelStyle: "relaxed",
    interests: ["food", "shopping"],
    highlights: [
      "One theme park, chosen honestly",
      "Han River picnic as the local ritual",
      "Fried chicken diplomacy",
    ],
  },
  {
    id: "singapore-2d-highlights",
    title: "Singapore 2-Day Highlights",
    coverImage: null,
    gradient: "from-emerald-500 to-blue-600",
    author: AI,
    days: 2,
    estimatedCost: 360,
    currency: "SGD",
    tags: ["City Break", "Foodie", "Gardens"],
    excerpt:
      "48 hours through the bay and the hawker centers: Gardens at both light shows, the skyline walk, and one meal per hawker hall.",
    weatherTip:
      "Year-round equatorial — outdoor slots before 11am and after 4pm, air-con middays, umbrella always.",
    fullDays: [
      {
        day: 1,
        theme: "Marina Bay & Gardens",
        activities: [
          { time: "09:00", name: "Gardens by the Bay's outdoor walks", emoji: "🌳" },
          { time: "11:30", name: "Cloud Forest conservatory", emoji: "🌧️" },
          { time: "16:00", name: "Merlion & the bay skyline walk", emoji: "🏙️" },
          { time: "19:45", name: "Garden Rhapsody light show & Lau Pa Sat satay", emoji: "💡" },
        ],
      },
      {
        day: 2,
        theme: "Hawker Circuit & Neighborhoods",
        activities: [
          { time: "09:30", name: "Maxwell Food Centre's chicken rice", emoji: "🍗" },
          { time: "11:00", name: "Chinatown temples & shophouses", emoji: "🛕" },
          { time: "15:00", name: "Kampong Glam: Sultan Mosque & Haji Lane", emoji: "🕌" },
          { time: "19:00", name: "Old Airport Road hawker finale", emoji: "🍢" },
        ],
      },
    ],
    restaurants: [
      { name: "Tian Tian Chicken Rice", cuisine: "Maxwell hawker · $", emoji: "🍗" },
      { name: "Lau Pa Sat satay street", cuisine: "Satay · $", emoji: "🍢" },
      { name: "Dong Fang Hong Sotong", cuisine: "Old Airport Rd · $", emoji: "🍤" },
    ],
    city: "Singapore",
    country: "Singapore",
    airport: SIN,
    travelStyle: "foodie",
    interests: ["food", "shopping", "museums"],
    highlights: [
      "Both Gardens light shows, bookending day one",
      "Three hawker centers, three philosophies",
      "The heat-managed 48 hours",
    ],
  },
  {
    id: "singapore-food-3d",
    title: "Singapore 3-Day Food Trip",
    coverImage: null,
    gradient: "from-orange-500 to-emerald-600",
    author: AI,
    days: 3,
    estimatedCost: 540,
    currency: "SGD",
    tags: ["Foodie", "Hawker", "Markets"],
    excerpt:
      "Three days of eating across Singapore's hawker universe: chicken rice dynasties, char kway teow woks, laksa legacies and one air-con splurge.",
    weatherTip:
      "Hawker centers are covered — the plan survives monsoon season intact. Eat at 11:30am and 6pm to beat the queues.",
    fullDays: [
      {
        day: 1,
        theme: "The Classics",
        activities: [
          { time: "11:30", name: "Tian Tian chicken rice at Maxwell", emoji: "🍗" },
          { time: "14:00", name: "ChinatownComplex's char kway teow", emoji: "🍳" },
          { time: "18:30", name: "Lau Pa Sat satay street under the towers", emoji: "🍢" },
        ],
      },
      {
        day: 2,
        theme: "The Old Guard",
        activities: [
          { time: "09:30", name: "Ya Kun kaya toast breakfast", emoji: "🍞" },
          { time: "12:00", name: "328 Katong laksa in the east", emoji: "🍜" },
          { time: "18:30", name: "Old Airport Road: Hokkien mee & carrot cake", emoji: "🥘" },
        ],
      },
      {
        day: 3,
        theme: "The Modern Layer",
        activities: [
          { time: "10:00", name: "Tiong Bahru Market's chwee kueh", emoji: "🥟" },
          { time: "13:00", name: "Hill Street Tai Hwa pork noodle (Michelin star)", emoji: "⭐" },
          { time: "19:00", name: "One air-con restaurant splurge", emoji: "🍽️" },
        ],
      },
    ],
    restaurants: [
      { name: "Tian Tian Chicken Rice", cuisine: "Hawker legend · $", emoji: "🍗" },
      { name: "Hill Street Tai Hwa Pork Noodle", cuisine: "Michelin hawker · $", emoji: "⭐" },
      { name: "Odette", cuisine: "Fine dining · $$$$", emoji: "🍽️" },
    ],
    city: "Singapore",
    country: "Singapore",
    airport: SIN,
    travelStyle: "foodie",
    interests: ["food"],
    highlights: [
      "The hawker curriculum, course by course",
      "A Michelin-starred bowl under ten dollars",
      "Kaya toast as the breakfast religion",
    ],
  },
  {
    id: "bangkok-5d-temples-river",
    title: "Bangkok 5-Day Temples & River Trip",
    coverImage: null,
    gradient: "from-amber-500 to-purple-700",
    author: AI,
    days: 5,
    estimatedCost: 250,
    currency: "USD",
    tags: ["Culture", "Temples", "River"],
    excerpt:
      "Five days along the Chao Phraya: the golden temple trio, canal villages, riverside markets and the skyline rooftops between.",
    weatherTip:
      "November–February is the cool season. Temple mornings beat both the heat and the coaches in every month.",
    fullDays: [
      {
        day: 1,
        theme: "Grand Palace & Wat Pho",
        activities: [
          { time: "08:30", name: "Grand Palace & Wat Phra Kaew at opening", emoji: "🛕" },
          { time: "11:30", name: "Wat Pho's reclining Buddha & massage school", emoji: "🛌" },
          { time: "18:00", name: "Wat Arun lit at dusk from the west bank", emoji: "🌇" },
        ],
      },
      {
        day: 2,
        theme: "Canals & Thonburi",
        activities: [
          { time: "09:00", name: "Longtail boat through the khlongs", emoji: "🛶" },
          { time: "12:30", name: "Riverside lunch at an old family kitchen", emoji: "🍲" },
          { time: "16:00", name: "Wat Kalayanamit & the river temples", emoji: "🛕" },
        ],
      },
      {
        day: 3,
        theme: "Markets",
        activities: [
          { time: "09:30", name: "Chatuchak (weekend) or Or Tor Kor", emoji: "🛍️" },
          { time: "15:00", name: "Jim Thompson House's silk story", emoji: "🧵" },
          { time: "19:00", name: "Chinatown's Yaowarat blaze", emoji: "🔥" },
        ],
      },
      {
        day: 4,
        theme: "Green & Gold",
        activities: [
          { time: "09:00", name: "Lumpini Park's monitor lizards & tai chi", emoji: "🦎" },
          { time: "12:00", name: "Old-town shophouse lunch", emoji: "🍜" },
          { time: "17:00", name: "Rooftop hour above the river", emoji: "🍸" },
        ],
      },
      {
        day: 5,
        theme: "Farewell on the Water",
        activities: [
          { time: "09:30", name: "Orange-flag boat hop along the river", emoji: "⛴️" },
          { time: "13:00", name: "Thai massage finale", emoji: "💆" },
          { time: "18:00", name: "Riverside farewell dinner", emoji: "🍛" },
        ],
      },
    ],
    restaurants: [
      { name: "Thipsamai", cuisine: "Pad thai · $", emoji: "🍤" },
      { name: "Sorn (or riverside classic)", cuisine: "Southern Thai · $$$", emoji: "🍲" },
      { name: "Or Tor Kor Market", cuisine: "Market curries · $", emoji: "🍈" },
    ],
    city: "Bangkok",
    country: "Thailand",
    airport: BKK,
    travelStyle: "cultural",
    interests: ["history", "food", "nature"],
    highlights: [
      "The temple trio at their quiet hours",
      "Khlong longtail mornings",
      "Yaowarat after dark",
    ],
  },
  {
    id: "bangkok-family-4d",
    title: "Bangkok 4-Day Family Trip",
    coverImage: null,
    gradient: "from-green-500 to-amber-600",
    author: AI,
    days: 4,
    estimatedCost: 200,
    currency: "USD",
    tags: ["Family", "Animals", "Culture"],
    excerpt:
      "Four family days: aquarium and safari mornings, temple visits sized for kids, pool afternoons and street-food wins.",
    weatherTip:
      "November–February is most comfortable. Build pool hours into every day — the heat is the boss here.",
    fullDays: [
      {
        day: 1,
        theme: "River & Temple",
        activities: [
          { time: "09:00", name: "Wat Pho's giant Buddha (kids love the scale)", emoji: "🛕" },
          { time: "11:30", name: "River ferry ride across the Chao Phraya", emoji: "⛴️" },
          { time: "15:00", name: "Pool hour", emoji: "🏊" },
          { time: "18:00", name: "Simple noodle dinner", emoji: "🍜" },
        ],
      },
      {
        day: 2,
        theme: "Animals",
        activities: [
          { time: "09:00", name: "Safari World or SEA LIFE aquarium", emoji: "🦁" },
          { time: "15:00", name: "Pool & nap hour", emoji: "😴" },
          { time: "18:00", name: "Food-court dinner (every kid chooses)", emoji: "🍱" },
        ],
      },
      {
        day: 3,
        theme: "Markets & Sweets",
        activities: [
          { time: "10:00", name: "Chatuchak kids' section or KidZania", emoji: "🧸" },
          { time: "14:00", name: "Mango sticky rice & coconut ice cream", emoji: "🥭" },
          { time: "17:00", name: "Asiatique riverside Ferris wheel", emoji: "🎡" },
        ],
      },
      {
        day: 4,
        theme: "Farewell",
        activities: [
          { time: "10:00", name: "Lumpini Park paddle boats", emoji: "🚣" },
          { time: "13:00", name: "Final pad thai", emoji: "🍤" },
          { time: "16:00", name: "Airport with mango boxes", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Thong Smith", cuisine: "Boat noodles · $", emoji: "🍜" },
      { name: "After You", cuisine: "Dessert café · $$", emoji: "🍧" },
      { name: "Food courts (Siam Paragon)", cuisine: "Every choice · $", emoji: "🍱" },
    ],
    city: "Bangkok",
    country: "Thailand",
    airport: BKK,
    travelStyle: "relaxed",
    interests: ["food", "nature"],
    highlights: [
      "Animals in the morning, pool in the afternoon",
      "The Ferris wheel finale",
      "Food courts as family democracy",
    ],
  },
  {
    id: "bangkok-budget-4d",
    title: "Bangkok 4-Day Budget Trip",
    coverImage: null,
    gradient: "from-red-500 to-amber-500",
    author: AI,
    days: 4,
    estimatedCost: 200,
    currency: "USD",
    tags: ["Budget", "Street Food", "Culture"],
    excerpt:
      "Four days at backpacker tier: $1.50 noodle dinners, free temple exteriors, boat commutes and the guesthouse scene that made Bangkok famous.",
    weatherTip:
      "November–February for comfort; the budget plan works year-round — rain moves everything under roofs and market awnings.",
    fullDays: [
      {
        day: 1,
        theme: "Old Town for Almost Nothing",
        activities: [
          { time: "08:30", name: "Wat Pho (entrance) & free temple exteriors", emoji: "🛕" },
          { time: "12:00", name: "Tha Tien pier noodle lunch ($2)", emoji: "🍜" },
          { time: "16:00", name: "Wat Arun at sunset from the free east bank", emoji: "🌇" },
          { time: "19:00", name: "Khao San Road pad thai ($1.50)", emoji: "🍤" },
        ],
      },
      {
        day: 2,
        theme: "Boats & Markets",
        activities: [
          { time: "09:00", name: "Orange-flag river boat all-day pass", emoji: "⛴️" },
          { time: "12:30", name: "Chinatown street-food crawl", emoji: "🥟" },
          { time: "18:00", name: "Ratchada night market browsing", emoji: "🎪" },
        ],
      },
      {
        day: 3,
        theme: "Green & Free",
        activities: [
          { time: "09:00", name: "Lumpini Park morning (free)", emoji: "🌳" },
          { time: "13:00", name: "Or Tor Kor fruit feast", emoji: "🍈" },
          { time: "17:00", name: "Free rooftop skywalk views", emoji: "🌆" },
        ],
      },
      {
        day: 4,
        theme: "Farewell",
        activities: [
          { time: "09:30", name: "Amulet market & riverside wander", emoji: "🧿" },
          { time: "12:00", name: "Final mango sticky rice", emoji: "🥭" },
          { time: "15:00", name: "Airport train ($1.50)", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Thipsamai", cuisine: "Pad thai · $", emoji: "🍤" },
      { name: "Tha Tien pier stalls", cuisine: "Noodles · $", emoji: "🍜" },
      { name: "Mae Varee", cuisine: "Mango sticky rice · $", emoji: "🥭" },
    ],
    city: "Bangkok",
    country: "Thailand",
    airport: BKK,
    travelStyle: "relaxed",
    interests: ["food", "history"],
    highlights: [
      "The river boat as both commute and cruise",
      "Temple mornings before the ticket booth gets busy",
      "Street food at world-class prices",
    ],
  },
  {
    id: "japan-5d-highlights",
    title: "Japan 5-Day Highlights",
    coverImage: null,
    gradient: "from-rose-500 to-indigo-600",
    author: AI,
    days: 5,
    estimatedCost: 620,
    currency: "USD",
    tags: ["Culture", "Rail", "First-Timer"],
    excerpt:
      "Five days for Japan's essentials: Tokyo's two faces, a Hakone or Fuji day, one Kyoto day by Shinkansen, and an Osaka finale.",
    weatherTip:
      "March–May and October–November are ideal. Sakura weeks sell out — book the Kyoto night months ahead if blossoms are the goal.",
    fullDays: [
      {
        day: 1,
        theme: "Tokyo — Old East",
        activities: [
          { time: "15:00", name: "Senso-ji at dusk", emoji: "🏮" },
          { time: "19:00", name: "Asakusa izakaya dinner", emoji: "🍶" },
        ],
      },
      {
        day: 2,
        theme: "Tokyo — Modern West",
        activities: [
          { time: "09:00", name: "Meiji Shrine & Harajuku", emoji: "⛩️" },
          { time: "15:00", name: "Shibuya & Shinjuku evening", emoji: "🌃" },
        ],
      },
      {
        day: 3,
        theme: "Hakone or Fuji Day",
        activities: [
          { time: "08:00", name: "Romancecar to Hakone — ropeway & lake", emoji: "🚡" },
          { time: "17:00", name: "Onsen hour before the train back", emoji: "♨️" },
        ],
      },
      {
        day: 4,
        theme: "Kyoto Day Trip",
        activities: [
          { time: "07:30", name: "Shinkansen to Kyoto", emoji: "🚄" },
          { time: "09:30", name: "Fushimi Inari's torii trails", emoji: "⛩️" },
          { time: "14:00", name: "Kiyomizu-dera & Higashiyama", emoji: "🛕" },
          { time: "19:30", name: "Back to Tokyo", emoji: "🚄" },
        ],
      },
      {
        day: 5,
        theme: "Center & Departure",
        activities: [
          { time: "08:30", name: "Tsukiji Outer Market breakfast", emoji: "🍣" },
          { time: "12:00", name: "Ginza stroll", emoji: "🛍️" },
          { time: "16:00", name: "Airport", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Omoide Yokocho", cuisine: "Yakitori · $", emoji: "🏮" },
      { name: "Gion Kappa", cuisine: "Kyoto obanzai · $$", emoji: "🍲" },
      { name: "Sushi no Midori", cuisine: "Generous sushi · $$", emoji: "🍣" },
    ],
    city: "Tokyo",
    country: "Japan",
    airport: NRT,
    travelStyle: "cultural",
    interests: ["history", "food", "nature"],
    highlights: [
      "Tokyo plus Kyoto in five days",
      "One onsen day in Hakone",
      "Tsukiji's farewell breakfast",
    ],
  },
  {
    id: "tokyo-kyoto-5d",
    title: "Tokyo & Kyoto: The Two-City Week",
    coverImage: null,
    gradient: "from-red-500 to-teal-600",
    author: AI,
    days: 5,
    estimatedCost: 640,
    currency: "USD",
    tags: ["Multi-City", "Rail", "Culture"],
    excerpt:
      "Three Tokyo nights, two Kyoto nights, one Shinkansen — the two-city split for travelers who'd rather go deep than wide.",
    weatherTip:
      "Sakura (early April) and foliage (late November) are the two sublime windows — book both cities 3–6 months ahead.",
    fullDays: [
      {
        day: 1,
        theme: "Tokyo — Old East",
        activities: [
          { time: "08:30", name: "Senso-ji & Asakusa streets", emoji: "🏯" },
          { time: "14:00", name: "Ueno Park & markets", emoji: "🖼️" },
          { time: "18:30", name: "Yanaka izakaya dinner", emoji: "🍶" },
        ],
      },
      {
        day: 2,
        theme: "Tokyo — Modern West",
        activities: [
          { time: "09:00", name: "Meiji & Harajuku", emoji: "⛩️" },
          { time: "15:00", name: "Shibuya & the crossing", emoji: "🚦" },
          { time: "19:00", name: "Shinjuku oden night", emoji: "🍲" },
        ],
      },
      {
        day: 3,
        theme: "Tokyo — Center",
        activities: [
          { time: "08:30", name: "Tsukiji breakfast & Ginza", emoji: "🍣" },
          { time: "15:00", name: "Ship luggage to Kyoto, travel light", emoji: "📦" },
          { time: "18:00", name: "Tokyo Station ramen street", emoji: "🍜" },
        ],
      },
      {
        day: 4,
        theme: "Kyoto — Dawn Torii & Higashiyama",
        activities: [
          { time: "07:00", name: "Shinkansen, then Fushimi Inari by 9", emoji: "🚄" },
          { time: "13:00", name: "Higashiyama lanes to Kiyomizu", emoji: "🛕" },
          { time: "18:30", name: "Gion lantern streets", emoji: "🏮" },
        ],
      },
      {
        day: 5,
        theme: "Kyoto — Bamboo & Farewell",
        activities: [
          { time: "07:30", name: "Arashiyama bamboo grove early", emoji: "🎋" },
          { time: "12:00", name: "Nishiki Market grazing", emoji: "🍢" },
          { time: "16:00", name: "Kansai or Haneda departure", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Omoide Yokocho", cuisine: "Yakitori · $", emoji: "🏮" },
      { name: "Ippudo Nishikikoji", cuisine: "Ramen · $", emoji: "🍜" },
      { name: "Gion Kappa", cuisine: "Obanzai · $$", emoji: "🍲" },
    ],
    city: "Tokyo",
    country: "Japan",
    airport: NRT,
    travelStyle: "cultural",
    interests: ["history", "food"],
    highlights: [
      "Two cities, one Shinkansen, zero backtracking",
      "Luggage shipped ahead — day packs only",
      "Kyoto's two dawn starts",
    ],
  },
  {
    id: "tokyo-hakone-kyoto-6d",
    title: "Tokyo, Hakone & Kyoto: Onsen Route",
    coverImage: null,
    gradient: "from-orange-500 to-emerald-700",
    author: AI,
    days: 6,
    estimatedCost: 800,
    currency: "USD",
    tags: ["Multi-City", "Onsen", "Rail"],
    excerpt:
      "The onsen route: Tokyo's energy, one ryokan night under Fuji's shadow, and Kyoto's temples — the restorative version of the classic arc.",
    weatherTip:
      "October–November pairs foliage with cool onsen evenings. Winter adds snow-dusted ryokan rotenburo — the connoisseur's version.",
    fullDays: [
      {
        day: 1,
        theme: "Tokyo — Arrive",
        activities: [{ time: "16:00", name: "Asakusa dusk & early dinner", emoji: "🏮" }],
      },
      {
        day: 2,
        theme: "Tokyo — West & Center",
        activities: [
          { time: "09:00", name: "Meiji & Harajuku", emoji: "⛩️" },
          { time: "14:00", name: "Tsukiji lunch & Ginza", emoji: "🍣" },
        ],
      },
      {
        day: 3,
        theme: "To Hakone — Ryokan Night",
        activities: [
          { time: "09:30", name: "Hakone loop: pirate ship & ropeway", emoji: "🚡" },
          { time: "16:00", name: "Ryokan check-in: yukata, kaiseki, onsen", emoji: "♨️" },
        ],
      },
      {
        day: 4,
        theme: "Hakone Morning & To Kyoto",
        activities: [
          { time: "07:30", name: "Dawn onsen & Fuji's silhouette", emoji: "🗻" },
          { time: "11:30", name: "Shinkansen to Kyoto", emoji: "🚄" },
          { time: "16:00", name: "Higashiyama at golden hour", emoji: "🛕" },
        ],
      },
      {
        day: 5,
        theme: "Kyoto — Torii & Bamboo",
        activities: [
          { time: "07:00", name: "Fushimi Inari at dawn", emoji: "⛩️" },
          { time: "11:30", name: "Arashiyama & Tenryu-ji", emoji: "🎋" },
          { time: "18:00", name: "Kaiseki or obanzai dinner", emoji: "🍲" },
        ],
      },
      {
        day: 6,
        theme: "Departure",
        activities: [
          { time: "09:30", name: "Nishiki Market farewell", emoji: "🍢" },
          { time: "13:00", name: "Kansai or Haneda flight", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Ryokan kaiseki", cuisine: "Hakone dinner · $$$$", emoji: "🍲" },
      { name: "Gion Kappa", cuisine: "Kyoto home cooking · $$", emoji: "🍵" },
      { name: "Hakone benz-ten", cuisine: "Lake Ashi soba · $$", emoji: "🍜" },
    ],
    city: "Tokyo",
    country: "Japan",
    airport: NRT,
    travelStyle: "relaxed",
    interests: ["history", "food", "nature"],
    highlights: [
      "The ryokan night as the trip's heart",
      "Dawn rotenburo with Fuji in frame",
      "Kyoto's two mornings, unhurried",
    ],
  },
  {
    id: "korea-7d-seoul-busan",
    title: "South Korea 7-Day Trip: Seoul & Busan",
    coverImage: null,
    gradient: "from-blue-600 to-rose-500",
    author: AI,
    days: 7,
    estimatedCost: 700,
    currency: "USD",
    tags: ["Multi-City", "Rail", "Foodie"],
    excerpt:
      "One week across Korea: four Seoul days of palaces and markets, the KTX down to Busan, and the seaside second city before flying home.",
    weatherTip:
      "April (blossoms along both cities' rivers) and October (foliage) are the sweet spots. Summer is humid; winter is crisp and photogenic.",
    fullDays: [
      {
        day: 1,
        theme: "Seoul — Palaces",
        activities: [
          { time: "09:00", name: "Gyeongbokgung & Bukchon", emoji: "🏯" },
          { time: "15:00", name: "Ikseon-dong & Insadong", emoji: "🍵" },
        ],
      },
      {
        day: 2,
        theme: "Seoul — Markets & Views",
        activities: [
          { time: "10:00", name: "Gwangjang & Mangwon markets", emoji: "🥞" },
          { time: "17:00", name: "N Seoul Tower at dusk", emoji: "🗼" },
        ],
      },
      {
        day: 3,
        theme: "Seoul — Hongdae / Itaewon",
        activities: [
          { time: "11:00", name: "Hongdae shopping & cafés", emoji: "🛍️" },
          { time: "18:00", name: "BBQ dinner & busking", emoji: "🥓" },
        ],
      },
      {
        day: 4,
        theme: "Seoul — DMZ or Deep Seoul",
        activities: [
          { time: "08:00", name: "DMZ tour (booked) or National Museum", emoji: "🕊️" },
          { time: "17:00", name: "Han River evening", emoji: "🌊" },
        ],
      },
      {
        day: 5,
        theme: "KTX to Busan",
        activities: [
          { time: "09:00", name: "Fast train south (2h40)", emoji: "🚄" },
          { time: "13:00", name: "Gamcheon Culture Village", emoji: "🎨" },
          { time: "19:00", name: "Haeundae seafood dinner", emoji: "🦀" },
        ],
      },
      {
        day: 6,
        theme: "Busan — Coast & Temples",
        activities: [
          { time: "09:00", name: "Haedong Yonggungsa seaside temple", emoji: "🛕" },
          { time: "13:00", name: "Jagalchi Fish Market lunch", emoji: "🐟" },
          { time: "17:00", name: "Gwangalli Bridge night view", emoji: "🌉" },
        ],
      },
      {
        day: 7,
        theme: "Departure",
        activities: [
          { time: "10:00", name: "Huinyeoul village & coffee", emoji: "☕" },
          { time: "14:00", name: "Gimhae or KTX to ICN", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Jagalchi Market", cuisine: "Live seafood · $$", emoji: "🦀" },
      { name: "Gwangjang Market", cuisine: "Bindaetteok · $", emoji: "🥞" },
      { name: "Haeundae Milmyeon shops", cuisine: "Cold noodles · $", emoji: "🍜" },
    ],
    city: "Seoul",
    country: "South Korea",
    airport: ICN,
    travelStyle: "cultural",
    interests: ["food", "history", "beaches"],
    highlights: [
      "Seoul's four faces, paced properly",
      "The KTX as a two-hour scenic transfer",
      "Busan's fish-market lunch",
    ],
  },
  {
    id: "thailand-10d-bangkok-islands",
    title: "Thailand 10-Day Trip: Bangkok & the Islands",
    coverImage: null,
    gradient: "from-teal-500 to-amber-600",
    author: AI,
    days: 10,
    estimatedCost: 700,
    currency: "USD",
    tags: ["Multi-City", "Beaches", "Culture"],
    excerpt:
      "Ten days, two acts: Bangkok's temples and markets, then the southern islands' sand — Krabi's karsts or Samui's palms, your pick.",
    weatherTip:
      "December–March suits both acts (west-coast islands included). April to October shifts the beach leg to Samui's Gulf-side season.",
    fullDays: [
      {
        day: 1,
        theme: "Bangkok — Arrive & Old Town",
        activities: [{ time: "16:00", name: "Riverside dinner & early night", emoji: "🍚" }],
      },
      {
        day: 2,
        theme: "Bangkok — Grand Palace",
        activities: [
          { time: "08:30", name: "Grand Palace & Wat Pho", emoji: "🛕" },
          { time: "18:00", name: "Wat Arun sunset", emoji: "🌇" },
        ],
      },
      {
        day: 3,
        theme: "Bangkok — Markets",
        activities: [
          { time: "09:30", name: "Chatuchak or Or Tor Kor", emoji: "🛍️" },
          { time: "19:00", name: "Yaowarat night market", emoji: "🔥" },
        ],
      },
      {
        day: 4,
        theme: "Bangkok — Canals",
        activities: [
          { time: "09:00", name: "Thonburi khlong longtail", emoji: "🛶" },
          { time: "16:00", name: "Rooftop farewell to the capital", emoji: "🍸" },
        ],
      },
      {
        day: 5,
        theme: "Fly South — Krabi or Samui",
        activities: [{ time: "14:00", name: "Arrive, beach walk, seafood dinner", emoji: "🏖️" }],
      },
      {
        day: 6,
        theme: "Islands — Four-Island Tour",
        activities: [
          { time: "08:30", name: "Longtail to the karst lagoons", emoji: "🛶" },
          { time: "17:30", name: "Sunset on the sand", emoji: "🌅" },
        ],
      },
      {
        day: 7,
        theme: "Islands — Snorkel Day",
        activities: [
          { time: "09:00", name: "Reef snorkel trip", emoji: "🐠" },
          { time: "18:00", name: "Beach massage", emoji: "💆" },
        ],
      },
      {
        day: 8,
        theme: "Islands — Free Beach Day",
        activities: [{ time: "10:00", name: "Hammock, swim, repeat", emoji: "🏝️" }],
      },
      {
        day: 9,
        theme: "Islands — Inland Green",
        activities: [
          { time: "09:00", name: "Jungle trek or waterfall swim", emoji: "💦" },
          { time: "19:00", name: "Farewell beach barbecue", emoji: "🦐" },
        ],
      },
      {
        day: 10,
        theme: "Departure",
        activities: [{ time: "11:00", name: "Fly Bangkok & connect home", emoji: "✈️" }],
      },
    ],
    restaurants: [
      { name: "Raan Jay Fai tier street stalls", cuisine: "Wok legends · $$", emoji: "🔥" },
      { name: "Beachfront grill shacks", cuisine: "Catch of the day · $", emoji: "🦐" },
      { name: "Or Tor Kor", cuisine: "Market curries · $", emoji: "🍈" },
    ],
    city: "Bangkok",
    country: "Thailand",
    airport: BKK,
    travelStyle: "relaxed",
    interests: ["beaches", "food", "history"],
    highlights: [
      "Two acts: golden temples then turquoise water",
      "The internal flight as the intermission",
      "One full hammock day, earned",
    ],
  },
  {
    id: "vietnam-10d-north-south",
    title: "Vietnam 10-Day Trip: North to South",
    coverImage: null,
    gradient: "from-red-500 to-yellow-500",
    author: AI,
    days: 10,
    estimatedCost: 500,
    currency: "USD",
    tags: ["Multi-City", "Foodie", "Culture"],
    excerpt:
      "Ten days down the S-curve: Hanoi's Old Quarter, Ha Long's karsts, Hoi An's lanterns and Ho Chi Minh City's engines — plus the trains between.",
    weatherTip:
      "The north is best October–December, the south December–April — February–March splits the difference across the whole country.",
    fullDays: [
      {
        day: 1,
        theme: "Hanoi — Old Quarter",
        activities: [
          { time: "08:00", name: "Pho breakfast & Hoan Kiem Lake", emoji: "🍜" },
          { time: "18:00", name: "Bun cha & bia hoi", emoji: "🍺" },
        ],
      },
      {
        day: 2,
        theme: "Hanoi — History",
        activities: [
          { time: "09:00", name: "Temple of Literature & museums", emoji: "🛕" },
          { time: "15:00", name: "Egg coffee", emoji: "☕" },
        ],
      },
      {
        day: 3,
        theme: "Ha Long Bay Overnight Cruise",
        activities: [
          { time: "08:30", name: "Cruise into the karsts", emoji: "🛶" },
          { time: "19:00", name: "Squid fishing off the deck", emoji: "🦑" },
        ],
      },
      {
        day: 4,
        theme: "Return & Fly to Da Nang",
        activities: [{ time: "16:00", name: "Da Nang beach evening", emoji: "🏖️" }],
      },
      {
        day: 5,
        theme: "Hoi An — Lantern Town",
        activities: [
          { time: "09:00", name: "Ancient Town & tailor shops", emoji: "🏮" },
          { time: "18:30", name: "River lantern boats", emoji: "🕯️" },
        ],
      },
      {
        day: 6,
        theme: "My Son or Marble Mountains",
        activities: [{ time: "09:00", name: "Cham ruins or cave temples", emoji: "🗿" }],
      },
      {
        day: 7,
        theme: "Fly to Ho Chi Minh City",
        activities: [{ time: "17:00", name: "Rooftop over the motorbike rivers", emoji: "🌆" }],
      },
      {
        day: 8,
        theme: "HCMC — History",
        activities: [
          { time: "09:00", name: "Cu Chi tunnels (booked)", emoji: "🕳️" },
          { time: "16:00", name: "War Remnants Museum", emoji: "🕊️" },
        ],
      },
      {
        day: 9,
        theme: "Mekong Delta Day",
        activities: [
          { time: "08:00", name: "Delta boat through the channels", emoji: "🚣" },
          { time: "18:00", name: "Street-food farewell", emoji: "🥖" },
        ],
      },
      {
        day: 10,
        theme: "Departure",
        activities: [{ time: "12:00", name: "Last banh mi & airport", emoji: "✈️" }],
      },
    ],
    restaurants: [
      { name: "Bun Cha Huong Lien", cuisine: "Hanoi legend · $", emoji: "🍜" },
      { name: "Madam Khanh (The Banh Mi Queen)", cuisine: "Hoi An · $", emoji: "🥖" },
      { name: "Anan Saigon", cuisine: "HCMC elevated street · $$", emoji: "🥢" },
    ],
    city: "Hanoi",
    country: "Vietnam",
    airport: HAN,
    travelStyle: "cultural",
    interests: ["food", "history", "nature"],
    highlights: [
      "Ha Long's overnight on the water",
      "Hoi An's lantern evening",
      "The delta's slow boat finale",
    ],
  },
  {
    id: "manila-3d-highlights",
    title: "Manila 3-Day Highlights",
    coverImage: null,
    gradient: "from-blue-500 to-yellow-500",
    author: AI,
    days: 3,
    estimatedCost: 165,
    currency: "USD",
    tags: ["Culture", "Foodie", "History"],
    excerpt:
      "Three days of the Philippine capital: Intramuros' walled history, Binondo's Chinatown feasts, and Manila Bay's famous sunset.",
    weatherTip:
      "January–April is dry season. The Bay sunset performs year-round — rain or not, it's the city's daily show.",
    fullDays: [
      {
        day: 1,
        theme: "Intramuros",
        activities: [
          { time: "09:00", name: "Fort Santiago & the walled city by bambike", emoji: "🏰" },
          { time: "12:30", name: "Spanish-Filipino lunch in the old city", emoji: "🍲" },
          { time: "16:00", name: "San Agustin Church & museum", emoji: "⛪" },
          { time: "18:00", name: "Manila Bay sunset on Roxas Boulevard", emoji: "🌅" },
        ],
      },
      {
        day: 2,
        theme: "Binondo & Chinatowns",
        activities: [
          { time: "09:30", name: "Binondo food crawl (world's oldest Chinatown)", emoji: "🥟" },
          { time: "14:00", name: "Escolta's art-deco remnants", emoji: "🏛️" },
          { time: "18:30", name: "Poblacion's bar & sisig evening", emoji: "🍹" },
        ],
      },
      {
        day: 3,
        theme: "Museums & Markets",
        activities: [
          { time: "10:00", name: "National Museum complex (free)", emoji: "🖼️" },
          { time: "14:00", name: "Greenhills or Divisoria bargain runs", emoji: "🛍️" },
          { time: "18:00", name: "Farewell lechon dinner", emoji: "🐖" },
        ],
      },
    ],
    restaurants: [
      { name: "Café Ilang-Ilang", cuisine: "Filipino buffet · $$", emoji: "🍲" },
      { name: "Dong Bei Dumplings", cuisine: "Binondo · $", emoji: "🥟" },
      { name: "Abe", cuisine: "Modern Filipino · $$", emoji: "🐖" },
    ],
    city: "Manila",
    country: "Philippines",
    airport: MNL,
    travelStyle: "foodie",
    interests: ["food", "history", "shopping"],
    highlights: [
      "Intramuros by bamboo bike",
      "Binondo's dumpling dynasty",
      "The Bay sunset, every evening",
    ],
  },
  {
    id: "jakarta-2d-highlights",
    title: "Jakarta 2-Day Highlights",
    coverImage: null,
    gradient: "from-red-500 to-slate-700",
    author: AI,
    days: 2,
    estimatedCost: 110,
    currency: "USD",
    tags: ["City Break", "Foodie", "Culture"],
    excerpt:
      "Two days through Indonesia's capital: Kota Tua's colonial squares, Istiqlal's scale, and the satay-and-mall rhythm of the megacity.",
    weatherTip:
      "June–September is drier. Traffic is the real weather — plan around it, not the rain.",
    fullDays: [
      {
        day: 1,
        theme: "Old Jakarta",
        activities: [
          { time: "09:00", name: "Kota Tua's Fatahillah Square by bicycle taxi", emoji: "🏛️" },
          { time: "12:00", name: "Cafe Batavia lunch under the fans", emoji: "☕" },
          { time: "15:00", name: "Sunda Kelapa's wooden pinisi harbor", emoji: "⛵" },
          { time: "19:00", name: "Menteng dinner & the skyline", emoji: "🌃" },
        ],
      },
      {
        day: 2,
        theme: "Faith, Art & Malls",
        activities: [
          { time: "09:00", name: "Istiqlal Mosque & Jakarta Cathedral pair", emoji: "🕌" },
          { time: "12:00", name: "National Museum's Indonesian treasures", emoji: "🏺" },
          { time: "15:30", name: "Mall lunch & Grand Indonesia walk", emoji: "🛍️" },
          { time: "19:00", name: "Satay & nasi goreng farewell", emoji: "🍢" },
        ],
      },
    ],
    restaurants: [
      { name: "Cafe Batavia", cuisine: "Colonial institution · $$", emoji: "☕" },
      { name: "Sate Khas Senayan", cuisine: "Satay house · $$", emoji: "🍢" },
      { name: "Warung Nia", cuisine: "Indonesian comfort · $", emoji: "🍛" },
    ],
    city: "Jakarta",
    country: "Indonesia",
    airport: CGK,
    travelStyle: "cultural",
    interests: ["food", "history", "shopping"],
    highlights: [
      "Kota Tua by bicycle taxi",
      "The mosque-cathedral dialogue across the street",
      "Satay as the national handshake",
    ],
  },
  {
    id: "yogyakarta-3d-temples",
    title: "Yogyakarta 3-Day Temples Trip",
    coverImage: null,
    gradient: "from-amber-500 to-emerald-700",
    author: AI,
    days: 3,
    estimatedCost: 135,
    currency: "USD",
    tags: ["Culture", "Temples", "History"],
    excerpt:
      "Three days around Java's cultural capital: Borobudur at sunrise, Prambanan at sunset, the Sultan's palace and Merapi's slopes between.",
    weatherTip:
      "May–September's dry season makes the dawn temple trips comfortable. Wet season greens the rice fields beautifully.",
    fullDays: [
      {
        day: 1,
        theme: "Borobudur Dawn",
        activities: [
          { time: "04:30", name: "Leave for the Borobudur sunrise", emoji: "🌄" },
          { time: "05:30", name: "Sunrise over the stupa fields", emoji: "🛕" },
          { time: "10:00", name: "Pawon & Mendut's smaller temples", emoji: "🕯️" },
          { time: "17:00", name: "Malioboro Street evening", emoji: "🛍️" },
        ],
      },
      {
        day: 2,
        theme: "Kraton & Crafts",
        activities: [
          { time: "09:00", name: "The Sultan's Kraton palace", emoji: "👑" },
          { time: "11:30", name: "Taman Sari water castle", emoji: "⛲" },
          { time: "14:30", name: "Batik workshop hour", emoji: "🎨" },
          { time: "19:00", name: "Gudeg & the night-food streets", emoji: "🍛" },
        ],
      },
      {
        day: 3,
        theme: "Prambanan & Merapi",
        activities: [
          { time: "09:00", name: "Prambanan's Hindu towers", emoji: "🗿" },
          { time: "14:00", name: "Merapi jeep lava tour", emoji: "🚙" },
          { time: "18:30", name: "Farewell Ramayana ballet (seasonal)", emoji: "💃" },
        ],
      },
    ],
    restaurants: [
      { name: "Gudeg Yu Djum", cuisine: "Jackfruit stew · $", emoji: "🍛" },
      { name: "Bale Raos", cuisine: "Royal recipes · $$", emoji: "👑" },
      { name: "Mirota Batik", cuisine: "Javanese · $", emoji: "🍲" },
    ],
    city: "Yogyakarta",
    country: "Indonesia",
    airport: YIA,
    travelStyle: "cultural",
    interests: ["history", "nature", "food"],
    highlights: [
      "Borobudur's sunrise stupa field",
      "The living Sultan's palace",
      "Merapi's volcanic edge",
    ],
  },
  {
    id: "chiang-mai-4d-culture",
    title: "Chiang Mai 4-Day Culture Trip",
    coverImage: null,
    gradient: "from-emerald-500 to-amber-600",
    author: AI,
    days: 4,
    estimatedCost: 180,
    currency: "USD",
    tags: ["Culture", "Temples", "Foodie"],
    excerpt:
      "Four days in the moated old city: temple mornings, a cooking school, ethical elephants and the Sunday market's lantern glow.",
    weatherTip:
      "November–February is cool and clear. Avoid March's burning-season haze if air quality matters to you.",
    fullDays: [
      {
        day: 1,
        theme: "Old City Temples",
        activities: [
          { time: "09:00", name: "Wat Phra Singh & Wat Chedi Luang", emoji: "🛕" },
          { time: "13:00", name: "Khao soi lunch (the northern curry)", emoji: "🍜" },
          { time: "17:00", name: "Sunday Walking Street (if Sunday)", emoji: "🏮" },
        ],
      },
      {
        day: 2,
        theme: "Doi Suthep",
        activities: [
          { time: "08:00", name: "Doi Suthep's 306 steps & golden chedi", emoji: "⛰️" },
          { time: "13:00", name: "Old-city café afternoon", emoji: "☕" },
          { time: "18:30", name: "Night bazaar dinner", emoji: "🍢" },
        ],
      },
      {
        day: 3,
        theme: "Elephants (Ethical)",
        activities: [
          { time: "07:30", name: "Sanctuary day: feed, walk, observe", emoji: "🐘" },
          { time: "18:00", name: "Restorative khao soi #2", emoji: "🍜" },
        ],
      },
      {
        day: 4,
        theme: "Cooking & Farewell",
        activities: [
          { time: "09:00", name: "Market-to-wok cooking school", emoji: "🍳" },
          { time: "15:00", name: "Nimman's cafés & crafts", emoji: "🛍️" },
          { time: "18:00", name: "Farewell khantoke dinner", emoji: "🏮" },
        ],
      },
    ],
    restaurants: [
      { name: "Khao Soi Mae Sai", cuisine: "The northern classic · $", emoji: "🍜" },
      { name: "Tong Tem Toh", cuisine: "Lanna cuisine · $$", emoji: "🍲" },
      { name: "The Baristro", cuisine: "Mountain coffee · $$", emoji: "☕" },
    ],
    city: "Chiang Mai",
    country: "Thailand",
    airport: CNX,
    travelStyle: "cultural",
    interests: ["food", "nature", "history"],
    highlights: [
      "Doi Suthep above the city",
      "Elephants at a genuine sanctuary",
      "The cooking school you'll use forever",
    ],
  },
  {
    id: "chiang-mai-5d-cafe-nature",
    title: "Chiang Mai 5-Day Café & Nature Trip",
    coverImage: null,
    gradient: "from-teal-500 to-orange-500",
    author: AI,
    days: 5,
    estimatedCost: 225,
    currency: "USD",
    tags: ["Nature", "Foodie", "Relaxed"],
    excerpt:
      "Five slow days: waterfall mornings, mountain cafés, Doi Inthanon's summit, and the Nimman coffee belt between.",
    weatherTip:
      "November–February offers cool mornings for the mountains. The cafés run year-round — rain adds atmosphere.",
    fullDays: [
      {
        day: 1,
        theme: "Nimman Coffee Belt",
        activities: [
          { time: "09:00", name: "Café crawl: Ristr8to's latte art", emoji: "☕" },
          { time: "14:00", name: "Wat Chedi Luang's evening monk chat", emoji: "🛕" },
          { time: "19:00", name: "Chang Phueak night-market khao soi", emoji: "🍜" },
        ],
      },
      {
        day: 2,
        theme: "Waterfalls",
        activities: [
          { time: "09:00", name: "Doi Suthep-Pui's waterfalls & Hmong market", emoji: "💦" },
          { time: "16:00", name: "Mon Jam's ridge sunset", emoji: "🌄" },
        ],
      },
      {
        day: 3,
        theme: "Doi Inthanon",
        activities: [
          { time: "07:30", name: "Thailand's highest peak & the twin pagodas", emoji: "⛰️" },
          { time: "16:00", name: "Royal project coffee tasting", emoji: "☕" },
        ],
      },
      {
        day: 4,
        theme: "Mae Kampong Village",
        activities: [
          { time: "09:00", name: "Mountain village stay: zipline & tea", emoji: "🍃" },
          { time: "18:30", name: "Homestay dinner by the stream", emoji: "🍲" },
        ],
      },
      {
        day: 5,
        theme: "Farewell",
        activities: [
          { time: "09:00", name: "Old-city temple sweep", emoji: "🛕" },
          { time: "13:00", name: "Last flat white & airport", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Ristr8to Lab", cuisine: "Latte art champions · $$", emoji: "☕" },
      { name: "The Faces Gallery", cuisine: "Nimman eats · $$", emoji: "🍜" },
      { name: "Mae Kampong homestays", cuisine: "Mountain kitchen · $", emoji: "🍲" },
    ],
    city: "Chiang Mai",
    country: "Thailand",
    airport: CNX,
    travelStyle: "relaxed",
    interests: ["nature", "food"],
    highlights: [
      "Doi Inthanon's summit clouds",
      "A night in the mountains at Mae Kampong",
      "The coffee belt, cup by cup",
    ],
  },
  {
    id: "phuket-4d-beaches",
    title: "Phuket 4-Day Beaches Trip",
    coverImage: null,
    gradient: "from-cyan-500 to-teal-700",
    author: AI,
    days: 4,
    estimatedCost: 260,
    currency: "USD",
    tags: ["Beaches", "Relaxed", "Islands"],
    excerpt:
      "Four days on Thailand's big island: Kata's family cove, Nai Harn's calm, Old Town's shophouses and the Big Buddha above it all.",
    weatherTip:
      "November–April is the calm-sea season. May–October brings swell — surfers' season, swimmers' caution.",
    fullDays: [
      {
        day: 1,
        theme: "Arrive & Kata",
        activities: [
          { time: "12:00", name: "Beach settle at Kata", emoji: "🏖️" },
          { time: "17:30", name: "Kata's viewpoint sunset", emoji: "🌅" },
          { time: "19:30", name: "Beach-road seafood", emoji: "🦐" },
        ],
      },
      {
        day: 2,
        theme: "Big Buddha & Old Town",
        activities: [
          { time: "09:00", name: "Big Buddha's 45-meter white marbled peak", emoji: "🛕" },
          { time: "13:00", name: "Old Phuket Town shophouses & cafés", emoji: "🏛️" },
          { time: "18:00", name: "Sunday walking street (if Sunday)", emoji: "🏮" },
        ],
      },
      {
        day: 3,
        theme: "South Beaches",
        activities: [
          { time: "09:30", name: "Nai Harn & Ya Nui's calm coves", emoji: "🏝️" },
          { time: "17:00", name: "Promthep Cape sunset", emoji: "🌅" },
        ],
      },
      {
        day: 4,
        theme: "Farewell Swim",
        activities: [
          { time: "09:00", name: "Final swim & massage", emoji: "💆" },
          { time: "13:00", name: "Airport", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Kaab Gluay", cuisine: "Thai classics · $", emoji: "🍌" },
      { name: "One Chun", cuisine: "Old-town Michelin · $$", emoji: "🦐" },
      { name: "Kata beachfront grills", cuisine: "Seafood · $$", emoji: "🐟" },
    ],
    city: "Phuket",
    country: "Thailand",
    airport: HKT,
    travelStyle: "relaxed",
    interests: ["beaches", "food", "nature"],
    highlights: [
      "Kata and Nai Harn over the crowds",
      "Big Buddha above the bays",
      "Old Town's Sino-Portuguese streets",
    ],
  },
  {
    id: "phuket-5d-island-hopping",
    title: "Phuket 5-Day Island Hopping Trip",
    coverImage: null,
    gradient: "from-blue-500 to-emerald-500",
    author: AI,
    days: 5,
    estimatedCost: 325,
    currency: "USD",
    tags: ["Islands", "Snorkel", "Beaches"],
    excerpt:
      "Five days cruising the Andaman: Phang Nga's canoe lagoons, Phi Phi's bays, James Bond Island and Racha's clear water.",
    weatherTip:
      "November–April gives flat seas and clear water. The Phi Phi day runs best in calm season; seas can cancel in monsoon.",
    fullDays: [
      {
        day: 1,
        theme: "Arrive & Patong or Kata",
        activities: [{ time: "14:00", name: "Beach settle & sunset dinner", emoji: "🏖️" }],
      },
      {
        day: 2,
        theme: "Phang Nga Bay",
        activities: [
          { time: "08:00", name: "Canoe through the karst caves & lagoons", emoji: "🛶" },
          { time: "13:00", name: "James Bond Island's limestone pillar", emoji: "🏝️" },
          { time: "18:00", name: "Seafood dinner back at the pier", emoji: "🦐" },
        ],
      },
      {
        day: 3,
        theme: "Phi Phi Day",
        activities: [
          { time: "08:30", name: "Speedboat to Maya Bay & Pileh Lagoon", emoji: "🐠" },
          { time: "16:00", name: "Koh Phi Phi viewpoint", emoji: "🌅" },
        ],
      },
      {
        day: 4,
        theme: "Racha or Coral Island",
        activities: [
          { time: "09:00", name: "Snorkel the clear-water reefs", emoji: "🤿" },
          { time: "16:00", name: "Beach club afternoon", emoji: "🍹" },
        ],
      },
      {
        day: 5,
        theme: "Farewell",
        activities: [{ time: "10:00", name: "Final swim & airport", emoji: "✈️" }],
      },
    ],
    restaurants: [
      { name: "One Chun", cuisine: "Old Town · $$", emoji: "🦐" },
      { name: "Boat-lunch onboard", cuisine: "Thai buffet · $", emoji: "🍚" },
      { name: "La Gritta", cuisine: "Seafront Italian · $$$", emoji: "🍝" },
    ],
    city: "Phuket",
    country: "Thailand",
    airport: HKT,
    travelStyle: "active",
    interests: ["beaches", "nature"],
    highlights: [
      "Phang Nga's canoe-only lagoons",
      "May Bay's return to the screen",
      "Racha's turquoise clarity",
    ],
  },
  {
    id: "koh-samui-4d-beach",
    title: "Koh Samui 4-Day Beach Trip",
    coverImage: null,
    gradient: "from-teal-500 to-blue-600",
    author: AI,
    days: 4,
    estimatedCost: 320,
    currency: "USD",
    tags: ["Beaches", "Relaxed", "Islands"],
    excerpt:
      "Four palm-lined days: Chaweng's long sand, Silver Beach's cove, Ang Thong's emerald lagoons and waterfall swims inland.",
    weatherTip:
      "January–March is Samui's dry window. The island's seasons run opposite Phuket's — plan accordingly.",
    fullDays: [
      {
        day: 1,
        theme: "Chaweng & Big Buddha",
        activities: [
          { time: "11:00", name: "Chaweng Beach settle", emoji: "🏖️" },
          { time: "16:00", name: "Big Buddha & Wat Plai Laem", emoji: "🛕" },
          { time: "19:00", name: "Beachfront dinner", emoji: "🦐" },
        ],
      },
      {
        day: 2,
        theme: "Ang Thong Marine Park",
        activities: [
          { time: "08:00", name: "Speedboat to the emerald lagoon", emoji: "🛶" },
          { time: "15:00", name: "Koh Wua Talap's viewpoint hike", emoji: "⛰️" },
        ],
      },
      {
        day: 3,
        theme: "South & Waterfalls",
        activities: [
          { time: "09:30", name: "Silver Beach cove", emoji: "🏝️" },
          { time: "13:00", name: "Na Muang waterfall swim", emoji: "💦" },
          { time: "17:30", name: "Fisherman's Village market (Friday)", emoji: "🏮" },
        ],
      },
      {
        day: 4,
        theme: "Farewell",
        activities: [{ time: "09:30", name: "Final swim & airport", emoji: "✈️" }],
      },
    ],
    restaurants: [
      { name: "The Larder", cuisine: "Fisherman's Village · $$", emoji: "🦐" },
      { name: "Krua Bophut", cuisine: "Thai seafood · $$", emoji: "🐟" },
      { name: "Beach shack pad thai", cuisine: "Everywhere · $", emoji: "🍤" },
    ],
    city: "Koh Samui",
    country: "Thailand",
    airport: USM,
    travelStyle: "relaxed",
    interests: ["beaches", "nature", "food"],
    highlights: [
      "Ang Thong's marine-park lagoons",
      "Silver Beach's local cove",
      "The Friday walking street",
    ],
  },
  {
    id: "da-nang-3d-beach-bridge",
    title: "Da Nang 3-Day Beach & Bridge Trip",
    coverImage: null,
    gradient: "from-sky-500 to-amber-500",
    author: AI,
    days: 3,
    estimatedCost: 150,
    currency: "USD",
    tags: ["Beaches", "Culture", "Family"],
    excerpt:
      "Three days of Vietnam's beach city: the Golden Bridge's stone hands, Marble Mountain caves, My Khe sand and a Hoi An lantern evening.",
    weatherTip:
      "February–May is dry and warm. September–November carries typhoon risk on this coast — check forecasts.",
    fullDays: [
      {
        day: 1,
        theme: "Ba Na Hills & the Golden Bridge",
        activities: [
          { time: "08:30", name: "Cable car up & the Golden Bridge's stone hands", emoji: "🌉" },
          { time: "13:00", name: "French village & gardens", emoji: "🏰" },
          { time: "18:00", name: "My Khe seafood street dinner", emoji: "🦐" },
        ],
      },
      {
        day: 2,
        theme: "Marble Mountains & Beach",
        activities: [
          { time: "08:00", name: "Marble Mountains' cave temples", emoji: "🗿" },
          { time: "12:00", name: "Mi Quang lunch", emoji: "🍜" },
          { time: "16:00", name: "My Khe Beach afternoon", emoji: "🏖️" },
          { time: "19:00", name: "Dragon Bridge's weekend fire", emoji: "🐉" },
        ],
      },
      {
        day: 3,
        theme: "Hoi An Day Trip",
        activities: [
          { time: "08:30", name: "Ancient Town's lanes & the Japanese bridge", emoji: "🏮" },
          { time: "15:00", name: "Back for the airport or one more beach hour", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Bun Cha Ca 109", cuisine: "Fish-cake noodle · $", emoji: "🍜" },
      { name: "Com Ga Ba Buoi", cuisine: "Hoi An chicken rice · $", emoji: "🍚" },
      { name: "Beach seafood grills", cuisine: "My Khe · $$", emoji: "🦐" },
    ],
    city: "Da Nang",
    country: "Vietnam",
    airport: DAD,
    travelStyle: "relaxed",
    interests: ["beaches", "nature", "food"],
    highlights: [
      "The Golden Bridge's famous hands",
      "Marble Mountains' cave shrines",
      "Hoi An an easy 30 minutes away",
    ],
  },
  {
    id: "nha-trang-3d-seafood",
    title: "Nha Trang 3-Day Seafood & Bay Trip",
    coverImage: null,
    gradient: "from-cyan-500 to-emerald-600",
    author: AI,
    days: 3,
    estimatedCost: 150,
    currency: "USD",
    tags: ["Beaches", "Foodie", "Islands"],
    excerpt:
      "Three days on Vietnam's resort bay: island snorkeling, mud-bath afternoons, Cham towers and the lobster street that justifies the trip.",
    weatherTip:
      "January–August is the dry run here. Seafood is in season, gloriously, all of it.",
    fullDays: [
      {
        day: 1,
        theme: "Bay & Beach",
        activities: [
          { time: "09:00", name: "Island-hopping boat: snorkel stops", emoji: "🤿" },
          { time: "17:00", name: "Tran Phu beach sunset", emoji: "🌅" },
          { time: "19:00", name: "Lobster street dinner", emoji: "🦞" },
        ],
      },
      {
        day: 2,
        theme: "Mud & Towers",
        activities: [
          { time: "09:30", name: "I-resort mud baths", emoji: "🛁" },
          { time: "14:00", name: "Po Nagar Cham towers", emoji: "🗿" },
          { time: "18:30", name: "Night-market squid & pancakes", emoji: "🦑" },
        ],
      },
      {
        day: 3,
        theme: "Farewell",
        activities: [{ time: "09:00", name: "Final swim, banh can breakfast, airport", emoji: "✈️" }],
      },
    ],
    restaurants: [
      { name: "Lobster Street (Ngoc Suong area)", cuisine: "Grilled lobster · $$", emoji: "🦞" },
      { name: "Banh Can 51", cuisine: "Mini pancakes · $", emoji: "🥞" },
      { name: "Giang Hai squid", cuisine: "Night market · $", emoji: "🦑" },
    ],
    city: "Nha Trang",
    country: "Vietnam",
    airport: CXR,
    travelStyle: "relaxed",
    interests: ["beaches", "food"],
    highlights: [
      "The island-snorkel morning",
      "Mud baths as the afternoon sport",
      "Lobster at lobster-fishing-village prices",
    ],
  },
  {
    id: "phu-quoc-4d-island",
    title: "Phu Quoc 4-Day Island Trip",
    coverImage: null,
    gradient: "from-blue-500 to-orange-500",
    author: AI,
    days: 4,
    estimatedCost: 220,
    currency: "USD",
    tags: ["Beaches", "Relaxed", "Islands"],
    excerpt:
      "Four easy days on Vietnam's resort island: Ong Lang's sunsets, the Hon Thom cable car, night squid fishing and pepper-farm mornings.",
    weatherTip:
      "November–March is dry and calm. Sunset-facing west beaches make every evening an event.",
    fullDays: [
      {
        day: 1,
        theme: "Arrive & Ong Lang",
        activities: [
          { time: "13:00", name: "Ong Lang Beach settle & sunset", emoji: "🌅" },
          { time: "19:00", name: "Dinh Cau night market", emoji: "🦐" },
        ],
      },
      {
        day: 2,
        theme: "Cable Car & South",
        activities: [
          { time: "09:30", name: "World's longest over-sea cable car to Hon Thom", emoji: "🚡" },
          { time: "13:00", name: "Aquapark & snorkel hour", emoji: "🤿" },
          { time: "18:30", name: "Sunset dinner on the south coast", emoji: "🍤" },
        ],
      },
      {
        day: 3,
        theme: "North & Farms",
        activities: [
          { time: "09:00", name: "Pepper farm & fish-sauce factory", emoji: "🌱" },
          { time: "15:00", name: "Phu Quoc National Park walk", emoji: "🌴" },
          { time: "19:30", name: "Night squid fishing boat", emoji: "🦑" },
        ],
      },
      {
        day: 4,
        theme: "Farewell",
        activities: [{ time: "09:30", name: "Sao Beach morning & airport", emoji: "✈️" }],
      },
    ],
    restaurants: [
      { name: "Bun Quay Kiên Xây", cuisine: "Island noodle signature · $", emoji: "🍜" },
      { name: "Sao Beach shacks", cuisine: "Grilled seafood · $$", emoji: "🦐" },
      { name: "Ra Khoi", cuisine: "Island seafood · $$", emoji: "🦑" },
    ],
    city: "Phu Quoc",
    country: "Vietnam",
    airport: PQC,
    travelStyle: "relaxed",
    interests: ["beaches", "nature", "food"],
    highlights: [
      "The over-sea cable car",
      "Night squid fishing with the fleet",
      "West-facing sunsets, nightly",
    ],
  },
  {
    id: "siem-reap-3d-angkor",
    title: "Siem Reap 3-Day Angkor Trip",
    coverImage: null,
    gradient: "from-stone-500 to-amber-700",
    author: AI,
    days: 3,
    estimatedCost: 165,
    currency: "USD",
    tags: ["History", "Temples", "Culture"],
    excerpt:
      "The Angkor curriculum: sunrise at Angkor Wat, Bayon's faces, Ta Prohm's roots — the small circuit, the grand circuit, and a lake sunset.",
    weatherTip:
      "November–February is cool-season comfort. Sunrise at Angkor Wat works year-round; equinox mornings align with the towers.",
    fullDays: [
      {
        day: 1,
        theme: "The Small Circuit",
        activities: [
          { time: "05:00", name: "Angkor Wat sunrise", emoji: "🌄" },
          { time: "08:30", name: "Bayon's 200 faces & the Baphuon", emoji: "🗿" },
          { time: "15:00", name: "Ta Prohm's tree-strangled halls", emoji: "🌳" },
        ],
      },
      {
        day: 2,
        theme: "The Grand Circuit",
        activities: [
          { time: "08:00", name: "Preah Khan & Neak Pean", emoji: "🛕" },
          { time: "14:00", name: "Banteay Kdei & Srah Srang", emoji: "⛲" },
          { time: "17:30", name: "Phnom Bakheng sunset", emoji: "🌅" },
        ],
      },
      {
        day: 3,
        theme: "Outlying & the Lake",
        activities: [
          { time: "08:00", name: "Banteay Srei's pink sandstone (booked car)", emoji: "🌸" },
          { time: "15:30", name: "Tonlé Sap floating village sunset", emoji: "🛶" },
          { time: "19:30", name: "Pub Street recovery", emoji: "🍹" },
        ],
      },
    ],
    restaurants: [
      { name: "Cuisine Wat Damnak", cuisine: "Modern Cambodian · $$", emoji: "🍲" },
      { name: "Marum", cuisine: "Training-restaurant · $$", emoji: "🍛" },
      { name: "Pub Street & Angkor night market", cuisine: "Street eats · $", emoji: "🍢" },
    ],
    city: "Siem Reap",
    country: "Cambodia",
    airport: SAI,
    travelStyle: "cultural",
    interests: ["history", "food", "nature"],
    highlights: [
      "Sunrise at the largest religious monument on earth",
      "Ta Prohm's jungle reclamation",
      "Tonlé Sap's floating evening",
    ],
  },
  {
    id: "siem-reap-4d-temples-deep",
    title: "Siem Reap 4-Day Temples Deep Trip",
    coverImage: null,
    gradient: "from-amber-700 to-emerald-700",
    author: AI,
    days: 4,
    estimatedCost: 220,
    currency: "USD",
    tags: ["History", "Temples", "Photography"],
    excerpt:
      "A fourth temple day changes everything: Beng Mealea's unrestored jungle, Koh Ker's pyramid, and the town's cafés between circuits.",
    weatherTip:
      "November–February for comfort; the deep-circuit roads handle rain better than they used to but check conditions.",
    fullDays: [
      {
        day: 1,
        theme: "Small Circuit",
        activities: [
          { time: "05:00", name: "Angkor Wat sunrise", emoji: "🌄" },
          { time: "09:00", name: "Bayon & Ta Prohm", emoji: "🗿" },
        ],
      },
      {
        day: 2,
        theme: "Grand Circuit",
        activities: [
          { time: "08:00", name: "Preah Khan & Ta Som", emoji: "🛕" },
          { time: "16:00", name: "Srah Srang sunset", emoji: "🌅" },
        ],
      },
      {
        day: 3,
        theme: "Beng Mealea & Koh Ker",
        activities: [
          { time: "07:30", name: "Beng Mealea's raw jungle ruin", emoji: "🌿" },
          { time: "13:00", name: "Koh Ker's seven-tier pyramid", emoji: "🗿" },
        ],
      },
      {
        day: 4,
        theme: "Town & the Lake",
        activities: [
          { time: "10:00", name: "Angkor National Museum & cafés", emoji: "🏛️" },
          { time: "16:00", name: "Tonlé Sap or the countryside by bicycle", emoji: "🚲" },
        ],
      },
    ],
    restaurants: [
      { name: "Cuisine Wat Damnak", cuisine: "Tasting menus · $$", emoji: "🍲" },
      { name: "Sombai infused rice spirits bar", cuisine: "Angkor tipple · $$", emoji: "🍸" },
      { name: "Wat Bo village cafés", cuisine: "Brunch · $$", emoji: "☕" },
    ],
    city: "Siem Reap",
    country: "Cambodia",
    airport: SAI,
    travelStyle: "cultural",
    interests: ["history", "nature"],
    highlights: [
      "Beng Mealea — the ruin without the ropes",
      "Koh Ker's jungle pyramid",
      "Temple-fatigue recovery cafés",
    ],
  },
  {
    id: "phnom-penh-2d-history",
    title: "Phnom Penh 2-Day History Trip",
    coverImage: null,
    gradient: "from-amber-500 to-red-700",
    author: AI,
    days: 2,
    estimatedCost: 100,
    currency: "USD",
    tags: ["History", "Culture", "Foodie"],
    excerpt:
      "Two days of Cambodia's capital: the Royal Palace's gold, the Killing Fields' weight, and riverside evenings that insist on life.",
    weatherTip:
      "November–February is the cool window. The museums are heavy — pair each with a riverside decompression.",
    fullDays: [
      {
        day: 1,
        theme: "The Palace & the River",
        activities: [
          { time: "09:00", name: "Royal Palace & Silver Pagoda", emoji: "👑" },
          { time: "12:30", name: "Central Market's art-deco dome lunch", emoji: "🏛️" },
          { time: "16:00", name: "Wat Phnom & the river promenade", emoji: "🌊" },
          { time: "19:00", name: "Riverside Khmer dinner", emoji: "🍲" },
        ],
      },
      {
        day: 2,
        theme: "The Weight of History",
        activities: [
          { time: "08:30", name: "Killing Fields of Choeung Ek (audio guide)", emoji: "🕊️" },
          { time: "12:00", name: "S-21 Tuol Sleng Museum", emoji: "🕯️" },
          { time: "16:00", name: "Riverside recovery & sunset", emoji: "🌅" },
          { time: "19:00", name: "Farewell fish amok", emoji: "🐟" },
        ],
      },
    ],
    restaurants: [
      { name: "Malis", cuisine: "Royal Khmer · $$", emoji: "🍲" },
      { name: "Friends the Restaurant", cuisine: "Training kitchen · $$", emoji: "🍛" },
      { name: "Riverside BBQ stalls", cuisine: "Street grill · $", emoji: "🍢" },
    ],
    city: "Phnom Penh",
    country: "Cambodia",
    airport: PNH,
    travelStyle: "cultural",
    interests: ["history", "food"],
    highlights: [
      "The palace's gold against the river",
      "Choeung Ek's essential gravity",
      "Life insisted upon, every evening",
    ],
  },
  {
    id: "jeju-4d-coastal-roadtrip",
    title: "Jeju 4-Day Coastal Road Trip",
    coverImage: null,
    gradient: "from-green-500 to-sky-600",
    author: AI,
    days: 4,
    estimatedCost: 340,
    currency: "USD",
    tags: ["Road Trip", "Nature", "Foodie"],
    excerpt:
      "Four days circling the volcanic island by car: lava tubes, sunrise peaks, haenyeo divers, tangerine orchards and black-pork BBQ.",
    weatherTip:
      "April–June and September–October are mild and calm. Jeju's wind is legendary — check forecasts for the coastal walks.",
    fullDays: [
      {
        day: 1,
        theme: "East: Seongsan & Udo",
        activities: [
          { time: "08:00", name: "Seongsan Ilchulbong's sunrise crater", emoji: "🌄" },
          { time: "11:00", name: "Udo Island by bicycle", emoji: "🚲" },
          { time: "18:00", name: "Black-pork BBQ in Jeju City", emoji: "🥓" },
        ],
      },
      {
        day: 2,
        theme: "Lava & Divers",
        activities: [
          { time: "09:00", name: "Manjanggul lava tube", emoji: "🕳️" },
          { time: "13:00", name: "Haenyeo performance at Hado", emoji: "🤿" },
          { time: "17:00", name: "Sehwa coastal cafés", emoji: "☕" },
        ],
      },
      {
        day: 3,
        theme: "South: Cliffs & Waterfalls",
        activities: [
          { time: "09:00", name: "Jusangjeolli's columnar cliffs", emoji: "🪨" },
          { time: "13:00", name: "Cheonjiyeon waterfall & Oedolgae", emoji: "💦" },
          { time: "18:00", name: "Seogwipo's dongnae markets", emoji: "🍊" },
        ],
      },
      {
        day: 4,
        theme: "West & Hallasan",
        activities: [
          { time: "09:00", name: "Hallasan's Eorimok trail (or Hallim Park)", emoji: "⛰️" },
          { time: "15:00", name: "Hyeopjae Beach & Biyangdo sunset", emoji: "🌅" },
        ],
      },
    ],
    restaurants: [
      { name: "Heukdwaeji Black Pork Street", cuisine: "Jeju BBQ · $$", emoji: "🥓" },
      { name: "Myeongin Jeonbok", cuisine: "Abalone rice · $$", emoji: "🐚" },
      { name: "Seogwipo Maeil Olle Market", cuisine: "Street eats · $", emoji: "🍢" },
    ],
    city: "Jeju",
    country: "South Korea",
    airport: CJU,
    travelStyle: "active",
    interests: ["nature", "food", "beaches"],
    highlights: [
      "The sunrise crater at Seongsan",
      "Haenyeo free-divers at work",
      "The coastal road as the destination",
    ],
  },
];

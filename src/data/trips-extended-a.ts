import type { Airport } from "@/types/flight";
import type { TravelStyle, TravelInterest } from "@/types/itinerary";

// Extended trips, batch A — Japan/Korea/Paris/SEA city trips and multi-city
// Japan routes. estimatedCost follows src/data/destinations.ts budgetPerDay ×
// days at the mid tier (backpacker/comfort tiers where the trip's theme calls
// for it), so trip pages never contradict the /travel-budget pages.

export interface RawTripInput {
  id: string;
  title: string;
  coverImage: string | null;
  gradient: string;
  author: { kind: "ai" | "user"; name: string; avatarColor: string; initials: string };
  days: number;
  estimatedCost: number;
  currency: string;
  tags: string[];
  excerpt: string;
  weatherTip: string;
  fullDays: { day: number; theme: string; activities: { time: string; name: string; emoji: string }[] }[];
  restaurants: { name: string; cuisine: string; emoji: string }[];
  city: string;
  country: string;
  airport: Airport;
  travelStyle: TravelStyle;
  interests: TravelInterest[];
  highlights?: string[];
}

const AI = { kind: "ai" as const, name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" };

const NRT: Airport = {
  iata: "NRT", icao: "RJAA", name: "Narita International Airport", city: "Tokyo", country: "Japan",
  timezone: "Asia/Tokyo", latitude: 35.7647, longitude: 140.3864,
};
const KIX: Airport = {
  iata: "KIX", icao: "RJBB", name: "Kansai International Airport", city: "Osaka", country: "Japan",
  timezone: "Asia/Tokyo", latitude: 34.4273, longitude: 135.2444,
};
const ICN: Airport = {
  iata: "ICN", icao: "RKSI", name: "Incheon International Airport", city: "Seoul", country: "South Korea",
  timezone: "Asia/Seoul", latitude: 37.4602, longitude: 126.4407,
};
const CDG: Airport = {
  iata: "CDG", icao: "LFPG", name: "Charles de Gaulle Airport", city: "Paris", country: "France",
  timezone: "Europe/Paris", latitude: 49.0097, longitude: 2.5479,
};
const SIN: Airport = {
  iata: "SIN", icao: "WSSS", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore",
  timezone: "Asia/Singapore", latitude: 1.3644, longitude: 103.9915,
};
const HKG: Airport = {
  iata: "HKG", icao: "VHHH", name: "Hong Kong International Airport", city: "Hong Kong", country: "Hong Kong SAR",
  timezone: "Asia/Hong_Kong", latitude: 22.308, longitude: 113.9185,
};
const TPE: Airport = {
  iata: "TPE", icao: "RCTP", name: "Taiwan Taoyuan International Airport", city: "Taipei", country: "Taiwan",
  timezone: "Asia/Taipei", latitude: 25.0777, longitude: 121.2328,
};
const BKK: Airport = {
  iata: "BKK", icao: "VTBS", name: "Suvarnabhumi Airport", city: "Bangkok", country: "Thailand",
  timezone: "Asia/Bangkok", latitude: 13.69, longitude: 100.7501,
};
const DPS: Airport = {
  iata: "DPS", icao: "WADD", name: "I Gusti Ngurah Rai International Airport", city: "Bali (Denpasar)", country: "Indonesia",
  timezone: "Asia/Makassar", latitude: -8.7482, longitude: 115.1675,
};
const HAN: Airport = {
  iata: "HAN", icao: "VVNB", name: "Noi Bai International Airport", city: "Hanoi", country: "Vietnam",
  timezone: "Asia/Ho_Chi_Minh", latitude: 21.2212, longitude: 105.8072,
};

export const EXTENDED_TRIPS_A: RawTripInput[] = [
  {
    id: "tokyo-2d-highlights",
    title: "Tokyo 2-Day Highlights",
    coverImage: null,
    gradient: "from-rose-500 to-red-700",
    author: AI,
    days: 2,
    estimatedCost: 240,
    currency: "USD",
    tags: ["City Break", "Culture", "Foodie"],
    excerpt:
      "A 48-hour Tokyo dash: old east side on day one, the modern west on day two — the compressed route that works for stopovers and long weekends.",
    weatherTip:
      "March–May and October–November are ideal. Winter is dry and clear; summer is humid. This route works in any season.",
    fullDays: [
      {
        day: 1,
        theme: "Old East: Asakusa & Ueno",
        activities: [
          { time: "08:30", name: "Senso-ji Temple & Nakamise-dori before the crowds", emoji: "🏯" },
          { time: "11:00", name: "Ueno Park & the Tokyo National Museum", emoji: "🖼️" },
          { time: "14:00", name: "Yanaka's old backstreets & temple lanes", emoji: "🚶" },
          { time: "19:00", name: "Izakaya dinner under the Asakusa lanterns", emoji: "🏮" },
        ],
      },
      {
        day: 2,
        theme: "Modern West: Meiji to Shibuya",
        activities: [
          { time: "09:00", name: "Meiji Shrine forest walk", emoji: "⛩️" },
          { time: "11:00", name: "Harajuku Takeshita Street & Ura-Harajuku", emoji: "🛍️" },
          { time: "15:00", name: "Omotesando architecture & coffee", emoji: "☕" },
          { time: "18:00", name: "Shibuya Crossing, tower view & ramen finish", emoji: "🍜" },
        ],
      },
    ],
    restaurants: [
      { name: "Omoide Yokocho stalls", cuisine: "Yakitori · $", emoji: "🏮" },
      { name: "Afuri Yuzu Ramen", cuisine: "Ramen · $", emoji: "🍜" },
      { name: "Asakusa Imahan", cuisine: "Sukiyaki · $$$", emoji: "🍲" },
    ],
    city: "Tokyo",
    country: "Japan",
    airport: NRT,
    travelStyle: "cultural",
    interests: ["history", "food", "shopping"],
    highlights: [
      "Senso-ji at its quietest hour",
      "Meiji Shrine's forest in the middle of the city",
      "Shibuya Crossing at dusk",
    ],
  },
  {
    id: "tokyo-5d-classic",
    title: "Tokyo 5-Day Classic",
    coverImage: null,
    gradient: "from-pink-500 to-rose-700",
    author: AI,
    days: 5,
    estimatedCost: 600,
    currency: "USD",
    tags: ["Culture", "Foodie", "Shopping"],
    excerpt:
      "The five-day sweet spot: the east–west core, a neighborhoods day, and one flex day — Tokyo at the pace where it stops being a blur.",
    weatherTip:
      "Aim for March–May or October–November for mild weather and clear skies. Summer is humid; winter is dry and cool with the best views.",
    fullDays: [
      {
        day: 1,
        theme: "Old East: Asakusa & Ueno",
        activities: [
          { time: "08:30", name: "Senso-ji & Nakamise-dori market", emoji: "🏯" },
          { time: "11:00", name: "Ueno Park museums", emoji: "🖼️" },
          { time: "15:00", name: "Yanaka Ginza street-food stroll", emoji: "🍡" },
          { time: "19:00", name: "Early izakaya dinner, early night", emoji: "🍶" },
        ],
      },
      {
        day: 2,
        theme: "Modern West: Meiji & Shibuya",
        activities: [
          { time: "09:00", name: "Meiji Shrine", emoji: "⛩️" },
          { time: "11:00", name: "Harajuku & Omotesando", emoji: "🛍️" },
          { time: "15:00", name: "Shibuya Sky viewpoint", emoji: "🌆" },
          { time: "19:00", name: "Izakaya hopping in Shinjuku", emoji: "🏮" },
        ],
      },
      {
        day: 3,
        theme: "Center: Tsukiji & Ginza",
        activities: [
          { time: "08:30", name: "Tsukiji Outer Market grazing breakfast", emoji: "🍣" },
          { time: "11:00", name: "Ginza department stores & depachika", emoji: "🛍️" },
          { time: "15:00", name: "Imperial Palace East Gardens", emoji: "🌳" },
          { time: "19:00", name: "Ginza dinner or teamLab digital art", emoji: "🎨" },
        ],
      },
      {
        day: 4,
        theme: "Neighborhood Tokyo",
        activities: [
          { time: "10:00", name: "Shimokitazawa vintage & coffee crawl", emoji: "👕" },
          { time: "14:00", name: "Nakameguro canal-side cafés", emoji: "☕" },
          { time: "16:30", name: "Daikanyama bookshops & boutiques", emoji: "📚" },
          { time: "19:30", name: "Neighborhood izakaya dinner", emoji: "🍢" },
        ],
      },
      {
        day: 5,
        theme: "Flex Day",
        activities: [
          { time: "09:00", name: "Slow morning in your favorite district", emoji: "☕" },
          { time: "12:00", name: "Kamakura day trip — or the museum you skipped", emoji: "🛕" },
          { time: "17:00", name: "Souvenir logistics in Tokyo Station's Character Street", emoji: "🎁" },
          { time: "20:00", name: "Farewell dinner: Omoide Yokocho or a sushi counter", emoji: "🍣" },
        ],
      },
    ],
    restaurants: [
      { name: "Sushi Dai", cuisine: "Sushi · $$$", emoji: "🍣" },
      { name: "Afuri Ramen", cuisine: "Yuzu ramen · $", emoji: "🍜" },
      { name: "Depachika food halls", cuisine: "Japanese deli · $$", emoji: "🍱" },
    ],
    city: "Tokyo",
    country: "Japan",
    airport: NRT,
    travelStyle: "cultural",
    interests: ["food", "shopping", "history"],
    highlights: [
      "One core area per day — no heroic crossings",
      "Tsukiji market-morning breakfast",
      "A real neighborhoods day most itineraries skip",
    ],
  },
  {
    id: "tokyo-budget-4d",
    title: "Tokyo Budget 4-Day Trip",
    coverImage: null,
    gradient: "from-amber-500 to-red-600",
    author: AI,
    days: 4,
    estimatedCost: 300,
    currency: "USD",
    tags: ["Budget", "Culture", "Foodie"],
    excerpt:
      "Four days of Tokyo at backpacker tier: capsule-hotel nights, konbini breakfasts, teishoku lunches and free sights — the city for roughly $75 a day.",
    weatherTip:
      "Winter (December–February) has the cheapest rooms and clearest skies. Sakura weeks multiply every budget line; book months out.",
    fullDays: [
      {
        day: 1,
        theme: "Free East Tokyo",
        activities: [
          { time: "08:00", name: "Senso-ji (free) & Nakamise snacking", emoji: "🏯" },
          { time: "11:00", name: "Ueno Park walk & free zoo days", emoji: "🌳" },
          { time: "15:00", name: "Ameyoko market street budget lunch", emoji: "🍢" },
          { time: "19:00", name: "Konbini dinner picnic by the Sumida River", emoji: "🍙" },
        ],
      },
      {
        day: 2,
        theme: "Shrines & Views for Free",
        activities: [
          { time: "09:00", name: "Meiji Shrine (free)", emoji: "⛩️" },
          { time: "11:00", name: "Yoyogi Park people-watching", emoji: "🌳" },
          { time: "14:00", name: "Shibuya Crossing & free tower-lobby views", emoji: "🚦" },
          { time: "19:00", name: "Standing-bar izakaya (tachi-nomi) dinner", emoji: "🍶" },
        ],
      },
      {
        day: 3,
        theme: "Market & Museum Day",
        activities: [
          { time: "08:30", name: "Toyosu or Tsukiji market breakfast", emoji: "🍣" },
          { time: "11:00", name: "Sumida Hokusai Museum (¥900)", emoji: "🖼️" },
          { time: "15:00", name: "Tokyo Metropolitan Government's free observation deck", emoji: "🌆" },
          { time: "19:00", name: "Teishoku set dinner — the ¥900 lunch at night", emoji: "🍱" },
        ],
      },
      {
        day: 4,
        theme: "Departure Day",
        activities: [
          { time: "09:00", name: "Depachika bargain breakfast from 8pm discounts", emoji: "🍱" },
          { time: "11:00", name: "Last shrine or park wander", emoji: "⛩️" },
          { time: "14:00", name: "Narita/Naritasan temple stop on the way out", emoji: "🛕" },
          { time: "18:00", name: "Airport — plane food never tasted so earned", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Hanamaru Udon", cuisine: "Udon · $", emoji: "🍜" },
      { name: "Konbini onigiri", cuisine: "Convenience classics · $", emoji: "🍙" },
      { name: "Tachi-nomi standing bars", cuisine: "Izakaya · $", emoji: "🍶" },
    ],
    city: "Tokyo",
    country: "Japan",
    airport: NRT,
    travelStyle: "relaxed",
    interests: ["food", "history"],
    highlights: [
      "Free observation decks and shrine forests",
      "Konbini breakfasts as a feature, not a compromise",
      "Standing-bar izakaya culture",
    ],
  },
  {
    id: "tokyo-family-4d",
    title: "Tokyo Family 4-Day Trip",
    coverImage: null,
    gradient: "from-sky-500 to-indigo-600",
    author: AI,
    days: 4,
    estimatedCost: 480,
    currency: "USD",
    tags: ["Family", "Theme Parks", "Culture"],
    excerpt:
      "Four family-paced days: theme-park magic, animal mornings, hands-on museums, and the trains kids already love — built around naps and early dinners.",
    weatherTip:
      "March–May and October–November are comfortable for park days. Summer is humid — plan indoor middays; December adds illuminations.",
    fullDays: [
      {
        day: 1,
        theme: "Arrive & Odaiba",
        activities: [
          { time: "10:00", name: "teamLab Planets digital-art wading (book ahead)", emoji: "🎨" },
          { time: "13:00", name: "DiverCity's life-size Gundam statue", emoji: "🤖" },
          { time: "16:00", name: "Odaiba waterfront & the Rainbow Bridge view", emoji: "🌉" },
          { time: "18:30", name: "Family-friendly food-court dinner, early night", emoji: "🍛" },
        ],
      },
      {
        day: 2,
        theme: "Ueno Zoo & Asakusa",
        activities: [
          { time: "09:00", name: "Ueno Zoo pandas & park picnic", emoji: "🐼" },
          { time: "13:00", name: "Senso-ji & rickshaw ride photo op", emoji: "🏯" },
          { time: "16:00", name: "Kappabashi kitchen-street plastic-food hunting", emoji: "🍣" },
          { time: "18:00", name: "Family ramen or tempura dinner", emoji: "🍤" },
        ],
      },
      {
        day: 3,
        theme: "Tokyo Disneyland or DisneySea",
        activities: [
          { time: "08:00", name: "Rope-drop the park (book tickets ahead)", emoji: "🏰" },
          { time: "13:00", name: "Parade & churro refuel", emoji: "🎢" },
          { time: "17:00", name: "Evening parade & fireworks", emoji: "🎆" },
          { time: "20:00", name: "Home — everyone will sleep", emoji: "😴" },
        ],
      },
      {
        day: 4,
        theme: "Shibuya & Departure",
        activities: [
          { time: "09:30", name: "Shibuya Crossing & Hachiko statue photo", emoji: "🐕" },
          { time: "11:00", name: "Nintendo Tokyo & Pokémon Center stores", emoji: "🎮" },
          { time: "14:00", name: "Shinjuku Gyoen gardens picnic (space to run)", emoji: "🌸" },
          { time: "17:00", name: "Airport with a suitcase of plush", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Sukiya", cuisine: "Gyudon chain · $", emoji: "🍚" },
      { name: "Ichiran Ramen", cuisine: "Solo-booth ramen · $", emoji: "🍜" },
      { name: "Depachika picnics", cuisine: "Deli boxes · $$", emoji: "🍱" },
    ],
    city: "Tokyo",
    country: "Japan",
    airport: NRT,
    travelStyle: "relaxed",
    interests: ["shopping", "food", "museums"],
    highlights: [
      "teamLab's walk-through digital art",
      "Ueno Zoo pandas before the crowds",
      "A full Disney park day with early exits",
    ],
  },
  {
    id: "japan-budget-4d",
    title: "Japan Budget Sampler: Tokyo & Kyoto",
    coverImage: null,
    gradient: "from-red-500 to-amber-500",
    author: AI,
    days: 4,
    estimatedCost: 380,
    currency: "USD",
    tags: ["Budget", "Culture", "Rail"],
    excerpt:
      "Four days covering both icons at backpacker tier: Tokyo's free sights, one Kyoto temple day by local train, and honest konbini economics.",
    weatherTip:
      "Winter is the value season — dry, clear and cheap. Avoid Golden Week (late April–early May) entirely; sakura weeks book out months ahead.",
    fullDays: [
      {
        day: 1,
        theme: "Tokyo — Free East Side",
        activities: [
          { time: "08:00", name: "Senso-ji & Asakusa streets (free)", emoji: "🏯" },
          { time: "12:00", name: "Ameyoko market lunch", emoji: "🍢" },
          { time: "15:00", name: "Ueno Park & free museum days", emoji: "🖼️" },
          { time: "19:00", name: "Standing-bar dinner in Ueno", emoji: "🍶" },
        ],
      },
      {
        day: 2,
        theme: "Tokyo — West & Views",
        activities: [
          { time: "09:00", name: "Meiji Shrine & Yoyogi Park (free)", emoji: "⛩️" },
          { time: "13:00", name: "Shibuya Crossing & window shopping", emoji: "🚦" },
          { time: "16:00", name: "Metropolitan Government free observation deck", emoji: "🌆" },
          { time: "19:00", name: "Shinjuku ramen counter dinner", emoji: "🍜" },
        ],
      },
      {
        day: 3,
        theme: "Shinkansen to Kyoto",
        activities: [
          { time: "08:30", name: "Bullet train to Kyoto (book the value Kodama)", emoji: "🚄" },
          { time: "12:00", name: "Fushimi Inari's torii trails (free)", emoji: "⛩️" },
          { time: "16:00", name: "Gion's lantern-lit streets (free)", emoji: "🏮" },
          { time: "19:00", name: "Kyoto station ramen street dinner", emoji: "🍜" },
        ],
      },
      {
        day: 4,
        theme: "Kyoto & Home",
        activities: [
          { time: "08:00", name: "Kiyomizu-dera (¥400) & the Sannenzaka lanes", emoji: "🛕" },
          { time: "12:00", name: "Nishiki Market grazing lunch", emoji: "🍢" },
          { time: "15:00", name: "Kamo River banks walk (free)", emoji: "🌊" },
          { time: "18:00", name: "Kansai airport departure", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Kyoto Ramen Koji", cuisine: "Ramen street · $", emoji: "🍜" },
      { name: "Nishiki Market stalls", cuisine: "Market grazing · $", emoji: "🍢" },
      { name: "Konbini onigiri", cuisine: "Everywhere · $", emoji: "🍙" },
    ],
    city: "Tokyo",
    country: "Japan",
    airport: NRT,
    travelStyle: "relaxed",
    interests: ["history", "food"],
    highlights: [
      "Two icon cities on one budget",
      "Fushimi Inari's 10,000 torii — free and endless",
      "The value-Kodama Shinkansen trick",
    ],
  },
  {
    id: "japan-7d-golden-route",
    title: "Japan 7-Day Golden Route",
    coverImage: null,
    gradient: "from-rose-500 to-red-700",
    author: AI,
    days: 7,
    estimatedCost: 950,
    currency: "USD",
    tags: ["Culture", "Rail", "Classic"],
    excerpt:
      "The classic week: Tokyo's core, a Hakone onsen night, Kyoto's temples and Osaka's neon finale — the Golden Route paced to actually be remembered.",
    weatherTip:
      "March–May and October–November are ideal. Sakura and foliage weeks are sublime but book hotels 3–6 months out; avoid Golden Week.",
    fullDays: [
      {
        day: 1,
        theme: "Tokyo — Arrive East",
        activities: [
          { time: "16:00", name: "Asakusa's lantern-lit streets at dusk", emoji: "🏮" },
          { time: "18:30", name: "Early izakaya dinner near Senso-ji", emoji: "🍶" },
        ],
      },
      {
        day: 2,
        theme: "Tokyo — Modern West",
        activities: [
          { time: "09:00", name: "Meiji Shrine forest", emoji: "⛩️" },
          { time: "11:30", name: "Harajuku & Omotesando", emoji: "🛍️" },
          { time: "16:00", name: "Shibuya Crossing at dusk", emoji: "🚦" },
          { time: "19:00", name: "Shinjuku neon & izakaya dinner", emoji: "🌃" },
        ],
      },
      {
        day: 3,
        theme: "Tokyo — Center & Bayside",
        activities: [
          { time: "08:30", name: "Tsukiji Outer Market breakfast", emoji: "🍣" },
          { time: "11:30", name: "Ginza & the Imperial Palace gardens", emoji: "🛍️" },
          { time: "16:00", name: "Odaiba waterfront or teamLab", emoji: "🎨" },
          { time: "19:30", name: "Farewell-Tokyo dinner in Ginza", emoji: "🍱" },
        ],
      },
      {
        day: 4,
        theme: "Hakone — Onsen Night",
        activities: [
          { time: "09:00", name: "Hakone loop: pirate ship & ropeway", emoji: "🚢" },
          { time: "15:00", name: "Ryokan check-in, open-air onsen", emoji: "♨️" },
          { time: "18:30", name: "Kaiseki dinner", emoji: "🍲" },
        ],
      },
      {
        day: 5,
        theme: "To Kyoto — Higashiyama Dusk",
        activities: [
          { time: "10:00", name: "Shinkansen to Kyoto", emoji: "🚄" },
          { time: "14:00", name: "Higashiyama lanes: Yasaka to Kiyomizu-dera", emoji: "🛕" },
          { time: "18:00", name: "Gion at dusk & kaiseki or obanzai dinner", emoji: "🏮" },
        ],
      },
      {
        day: 6,
        theme: "Kyoto — Dawn Torii to Bamboo",
        activities: [
          { time: "07:00", name: "Fushimi Inari's empty torii tunnel", emoji: "⛩️" },
          { time: "11:00", name: "Arashiyama bamboo grove & riverbank", emoji: "🎋" },
          { time: "15:30", name: "Nishiki Market or the Philosopher's Path", emoji: "🍢" },
        ],
      },
      {
        day: 7,
        theme: "Osaka — Finale",
        activities: [
          { time: "09:30", name: "Train to Osaka & Osaka Castle grounds", emoji: "🏯" },
          { time: "15:00", name: "Dotonbori: takoyaki, okonomiyaki, the Glico man", emoji: "🦑" },
          { time: "20:00", name: "Farewell night that runs late", emoji: "🏮" },
        ],
      },
    ],
    restaurants: [
      { name: "Ryokan kaiseki", cuisine: "Hakone kaiseki · $$$$", emoji: "🍲" },
      { name: "Ippudo Nishikikoji", cuisine: "Ramen · $", emoji: "🍜" },
      { name: "Wanaka Dotonbori", cuisine: "Takoyaki · $", emoji: "🐙" },
    ],
    city: "Tokyo",
    country: "Japan",
    airport: NRT,
    travelStyle: "cultural",
    interests: ["history", "food", "nature"],
    highlights: [
      "The classic route with two-night minimums",
      "One ryokan night with kaiseki and onsen",
      "Fushimi Inari before the crowds",
    ],
  },
  {
    id: "japan-10d-classic",
    title: "Japan 10-Day Classic",
    coverImage: null,
    gradient: "from-orange-500 to-red-600",
    author: AI,
    days: 10,
    estimatedCost: 1200,
    currency: "USD",
    tags: ["Culture", "Rail", "Multi-City"],
    excerpt:
      "Ten days on the Golden Route plus its two great extensions: Nara's bowing deer from Kyoto and an overnight in Hiroshima with Miyajima's floating torii.",
    weatherTip:
      "October–November is the connoisseur's window — foliage, clear skies, softer crowds. Sakura weeks are magnificent but book everything months ahead.",
    fullDays: [
      {
        day: 1,
        theme: "Tokyo — Arrive",
        activities: [
          { time: "16:00", name: "Asakusa at dusk & early dinner", emoji: "🏮" },
        ],
      },
      {
        day: 2,
        theme: "Tokyo — Modern West",
        activities: [
          { time: "09:00", name: "Meiji Shrine & Harajuku", emoji: "⛩️" },
          { time: "16:00", name: "Shibuya & Shinjuku evening", emoji: "🌃" },
        ],
      },
      {
        day: 3,
        theme: "Tokyo — Center",
        activities: [
          { time: "08:30", name: "Tsukiji Outer Market & Ginza", emoji: "🍣" },
          { time: "16:00", name: "Odaiba or museums", emoji: "🖼️" },
        ],
      },
      {
        day: 4,
        theme: "Hakone — Onsen Night",
        activities: [
          { time: "09:30", name: "Hakone loop & ropeway", emoji: "🚡" },
          { time: "17:00", name: "Ryokan onsen & kaiseki", emoji: "♨️" },
        ],
      },
      {
        day: 5,
        theme: "Kyoto — Higashiyama",
        activities: [
          { time: "11:00", name: "Shinkansen to Kyoto", emoji: "🚄" },
          { time: "15:00", name: "Yasaka to Kiyomizu-dera at golden hour", emoji: "🛕" },
        ],
      },
      {
        day: 6,
        theme: "Kyoto — Dawn Torii & Bamboo",
        activities: [
          { time: "07:00", name: "Fushimi Inari at dawn", emoji: "⛩️" },
          { time: "11:00", name: "Arashiyama & the Philosopher's Path", emoji: "🎋" },
        ],
      },
      {
        day: 7,
        theme: "Nara Day Trip",
        activities: [
          { time: "09:00", name: "Todai-ji's Great Buddha", emoji: "🛕" },
          { time: "12:00", name: "Nara Park's bowing deer", emoji: "🦌" },
          { time: "16:00", name: "Back to Kyoto for dinner", emoji: "🏮" },
        ],
      },
      {
        day: 8,
        theme: "Hiroshima",
        activities: [
          { time: "09:00", name: "Shinkansen west", emoji: "🚄" },
          { time: "14:00", name: "Peace Memorial Park & museum", emoji: "🕊️" },
          { time: "19:00", name: "Hiroshima-style okonomiyaki dinner", emoji: "🥞" },
        ],
      },
      {
        day: 9,
        theme: "Miyajima & On to Osaka",
        activities: [
          { time: "08:30", name: "Ferry to Miyajima's floating torii", emoji: "⛩️" },
          { time: "15:00", name: "Shinkansen to Osaka", emoji: "🚄" },
          { time: "19:00", name: "Dotonbori dinner", emoji: "🐙" },
        ],
      },
      {
        day: 10,
        theme: "Osaka — Finale",
        activities: [
          { time: "09:30", name: "Osaka Castle & Kuromon Market", emoji: "🏯" },
          { time: "18:00", name: "Shinsekai farewell kushikatsu", emoji: "🍢" },
        ],
      },
    ],
    restaurants: [
      { name: "Okonomimura", cuisine: "Hiroshima okonomiyaki · $", emoji: "🥞" },
      { name: "Wanaka Dotonbori", cuisine: "Takoyaki · $", emoji: "🐙" },
      { name: "Gion Kappa", cuisine: "Obanzai · $$", emoji: "🍲" },
    ],
    city: "Tokyo",
    country: "Japan",
    airport: NRT,
    travelStyle: "cultural",
    interests: ["history", "food", "nature"],
    highlights: [
      "Nara's deer without changing hotels",
      "Miyajima's torii in morning light",
      "Kyoto gets a true third day",
    ],
  },
  {
    id: "japan-14d-grand",
    title: "Japan 14-Day Grand Tour",
    coverImage: null,
    gradient: "from-purple-500 to-red-600",
    author: AI,
    days: 14,
    estimatedCost: 1450,
    currency: "USD",
    tags: ["Multi-City", "Rail", "Grand Tour"],
    excerpt:
      "Two weeks, one arc: Tokyo, Hakone, Kyoto, Nara, Hiroshima, Miyajima, Osaka — the full Golden Route plus the Kansai depth most trips never reach.",
    weatherTip:
      "October–November is ideal for two weeks of walking. Spring (late March–April) is glorious but needs 4–6 months of hotel lead time.",
    fullDays: [
      {
        day: 1,
        theme: "Tokyo — Arrive",
        activities: [{ time: "16:00", name: "Asakusa dusk & early night", emoji: "🏮" }],
      },
      {
        day: 2,
        theme: "Tokyo — Old East",
        activities: [
          { time: "08:30", name: "Senso-ji & Ueno Park", emoji: "🏯" },
          { time: "16:00", name: "Yanaka backstreets", emoji: "🚶" },
        ],
      },
      {
        day: 3,
        theme: "Tokyo — Modern West",
        activities: [
          { time: "09:00", name: "Meiji, Harajuku, Shibuya", emoji: "⛩️" },
          { time: "19:00", name: "Shinjuku izakaya night", emoji: "🍶" },
        ],
      },
      {
        day: 4,
        theme: "Tokyo — Center & Bayside",
        activities: [
          { time: "08:30", name: "Tsukiji breakfast & Ginza", emoji: "🍣" },
          { time: "15:00", name: "Odaiba or teamLab", emoji: "🎨" },
        ],
      },
      {
        day: 5,
        theme: "Hakone — Onsen Night",
        activities: [
          { time: "10:00", name: "Hakone loop", emoji: "🚢" },
          { time: "17:00", name: "Ryokan kaiseki & onsen", emoji: "♨️" },
        ],
      },
      {
        day: 6,
        theme: "Kyoto — Higashiyama",
        activities: [
          { time: "11:00", name: "Shinkansen to Kyoto", emoji: "🚄" },
          { time: "15:00", name: "Yasaka & Kiyomizu at golden hour", emoji: "🛕" },
        ],
      },
      {
        day: 7,
        theme: "Kyoto — Dawn & Bamboo",
        activities: [
          { time: "07:00", name: "Fushimi Inari at dawn", emoji: "⛩️" },
          { time: "11:30", name: "Arashiyama", emoji: "🎋" },
        ],
      },
      {
        day: 8,
        theme: "Kyoto — Deep Temples",
        activities: [
          { time: "09:00", name: "Kinkaku-ji's golden pavilion", emoji: "🏯" },
          { time: "13:00", name: "Nijo Castle & Nishiki Market", emoji: "🍢" },
        ],
      },
      {
        day: 9,
        theme: "Nara Day Trip",
        activities: [
          { time: "09:00", name: "Todai-ji & the deer", emoji: "🦌" },
          { time: "16:00", name: "Return via Uji's tea houses", emoji: "🍵" },
        ],
      },
      {
        day: 10,
        theme: "Hiroshima",
        activities: [
          { time: "10:00", name: "Shinkansen west", emoji: "🚄" },
          { time: "14:00", name: "Peace Park & museum", emoji: "🕊️" },
        ],
      },
      {
        day: 11,
        theme: "Miyajima",
        activities: [
          { time: "08:30", name: "Floating torii & Mount Misen hike", emoji: "⛩️" },
          { time: "17:00", name: "Back to Hiroshima", emoji: "🚢" },
        ],
      },
      {
        day: 12,
        theme: "Himeji Stop & Osaka",
        activities: [
          { time: "09:30", name: "Himeji Castle — Japan's finest", emoji: "🏯" },
          { time: "16:00", name: "On to Osaka & Dotonbori dinner", emoji: "🐙" },
        ],
      },
      {
        day: 13,
        theme: "Osaka",
        activities: [
          { time: "09:30", name: "Osaka Castle & Kuromon Market", emoji: "🦑" },
          { time: "18:00", name: "Kushikatsu in Shinsekai", emoji: "🍢" },
        ],
      },
      {
        day: 14,
        theme: "Departure",
        activities: [
          { time: "10:00", name: "Last errands & airport", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Ryokan kaiseki", cuisine: "Hakone · $$$$", emoji: "🍲" },
      { name: "Okonomimura", cuisine: "Hiroshima layers · $", emoji: "🥞" },
      { name: "Daruma Kushikatsu", cuisine: "Osaka fried · $$", emoji: "🍢" },
    ],
    city: "Tokyo",
    country: "Japan",
    airport: NRT,
    travelStyle: "cultural",
    interests: ["history", "food", "nature"],
    highlights: [
      "The complete Golden Route plus Himeji",
      "Miyajima with a Mount Misen hike",
      "A second Kyoto day most trips skip",
    ],
  },
  {
    id: "tokyo-kyoto-osaka-7d",
    title: "Tokyo Kyoto Osaka: The Three-City Week",
    coverImage: null,
    gradient: "from-red-500 to-indigo-700",
    author: AI,
    days: 7,
    estimatedCost: 900,
    currency: "USD",
    tags: ["Multi-City", "Rail", "Classic"],
    excerpt:
      "Three cities, one Shinkansen arc: three Tokyo nights, two Kyoto, one Osaka — with luggage-shipping logistics that make hotel changes painless.",
    weatherTip:
      "March–May and October–November suit all three cities. Sakura peaks early April; foliage peaks late November — book 3–6 months out either way.",
    fullDays: [
      {
        day: 1,
        theme: "Tokyo — Arrive & Asakusa",
        activities: [
          { time: "16:00", name: "Senso-ji at dusk", emoji: "🏮" },
          { time: "18:30", name: "Izakaya dinner & early night", emoji: "🍶" },
        ],
      },
      {
        day: 2,
        theme: "Tokyo — East & West",
        activities: [
          { time: "08:30", name: "Ueno Park & market breakfast", emoji: "🖼️" },
          { time: "14:00", name: "Meiji Shrine & Harajuku", emoji: "⛩️" },
          { time: "18:00", name: "Shibuya Crossing", emoji: "🚦" },
        ],
      },
      {
        day: 3,
        theme: "Tokyo — Ship Luggage & Shinjuku",
        activities: [
          { time: "09:00", name: "Ship the big bag to Kyoto (takkyubin)", emoji: "📦" },
          { time: "11:00", name: "Tsukiji Outer Market lunch", emoji: "🍣" },
          { time: "16:00", name: "Shinjuku Gyoen & tower views", emoji: "🌆" },
          { time: "19:00", name: "Omoide Yokocho dinner", emoji: "🏮" },
        ],
      },
      {
        day: 4,
        theme: "Shinkansen & Higashiyama",
        activities: [
          { time: "09:00", name: "Bullet train to Kyoto", emoji: "🚄" },
          { time: "14:00", name: "Yasaka Shrine to Kiyomizu-dera", emoji: "🛕" },
          { time: "18:30", name: "Gion dusk walk & dinner", emoji: "🏮" },
        ],
      },
      {
        day: 5,
        theme: "Kyoto — Torii & Bamboo",
        activities: [
          { time: "07:00", name: "Fushimi Inari at dawn", emoji: "⛩️" },
          { time: "11:00", name: "Arashiyama bamboo & Tenryu-ji", emoji: "🎋" },
          { time: "16:00", name: "Nishiki Market snacks", emoji: "🍢" },
        ],
      },
      {
        day: 6,
        theme: "To Osaka",
        activities: [
          { time: "10:00", name: "Local train to Osaka", emoji: "🚃" },
          { time: "12:00", name: "Kuromon Market lunch", emoji: "🦐" },
          { time: "15:00", name: "Osaka Castle", emoji: "🏯" },
          { time: "19:00", name: "Dotonbori neon & street food", emoji: "🦑" },
        ],
      },
      {
        day: 7,
        theme: "Departure from KIX",
        activities: [
          { time: "10:00", name: "Umeda Sky Building or last shopping", emoji: "🌆" },
          { time: "14:00", name: "Kansai airport — via the best airport noodles on earth", emoji: "🍜" },
        ],
      },
    ],
    restaurants: [
      { name: "Nishiki Market", cuisine: "Kyoto grazing · $", emoji: "🍢" },
      { name: "Wanaka Dotonbori", cuisine: "Takoyaki · $", emoji: "🐙" },
      { name: "Kuromon Market", cuisine: "Seafood & wagyu · $$", emoji: "🦐" },
    ],
    city: "Tokyo",
    country: "Japan",
    airport: NRT,
    travelStyle: "cultural",
    interests: ["history", "food", "shopping"],
    highlights: [
      "Luggage shipped ahead — travel light between cities",
      "Kyoto's dawn torii and bamboo mornings",
      "Osaka's Dotonbori finale",
    ],
  },
  {
    id: "kyoto-2d-temples",
    title: "Kyoto 2-Day Temple Circuit",
    coverImage: null,
    gradient: "from-orange-500 to-red-600",
    author: AI,
    days: 2,
    estimatedCost: 280,
    currency: "USD",
    tags: ["Culture", "Temples", "Walking"],
    excerpt:
      "Two dawn-start days covering Kyoto's essence: Higashiyama's lanes and Gion, then Arashiyama's bamboo before the crowds wake up.",
    weatherTip:
      "Late March–early April and mid–late November are sublime and packed — book rooms months out. Summer dawns double as heat avoidance.",
    fullDays: [
      {
        day: 1,
        theme: "Higashiyama & Gion",
        activities: [
          { time: "06:30", name: "Kiyomizu-dera's wooden stage at opening", emoji: "🛕" },
          { time: "09:00", name: "Sannenzaka & Ninenzaka lanes", emoji: "🚶" },
          { time: "11:30", name: "Yasaka Shrine & Maruyama Park", emoji: "⛩️" },
          { time: "15:00", name: "Kennin-ji zen garden or craft shops", emoji: "🧘" },
          { time: "18:00", name: "Gion's lantern streets & kaiseki dinner", emoji: "🏮" },
        ],
      },
      {
        day: 2,
        theme: "Arashiyama Dawn & Market",
        activities: [
          { time: "07:30", name: "Bamboo grove before 8am", emoji: "🎋" },
          { time: "09:00", name: "Tenryu-ji's garden", emoji: "🏯" },
          { time: "11:00", name: "Togetsukyo Bridge & riverbank", emoji: "🌊" },
          { time: "15:00", name: "Nishiki Market grazing", emoji: "🍢" },
          { time: "18:00", name: "Farewell dinner near the station", emoji: "🍲" },
        ],
      },
    ],
    restaurants: [
      { name: "Nishiki Market", cuisine: "Market grazing · $", emoji: "🍢" },
      { name: "Gion Kappa", cuisine: "Obanzai home cooking · $$", emoji: "🍲" },
      { name: "% Arabica Higashiyama", cuisine: "Coffee · $$", emoji: "☕" },
    ],
    city: "Kyoto",
    country: "Japan",
    airport: KIX,
    travelStyle: "cultural",
    interests: ["history", "food", "nature"],
    highlights: [
      "Kiyomizu-dera before the tour buses",
      "The bamboo grove in morning silence",
      "Gion's lantern-lit evening",
    ],
  },
  {
    id: "seoul-3d-classic",
    title: "Seoul 3-Day Classic",
    coverImage: null,
    gradient: "from-fuchsia-500 to-purple-700",
    author: AI,
    days: 3,
    estimatedCost: 300,
    currency: "USD",
    tags: ["Culture", "Foodie", "City Break"],
    excerpt:
      "Three days across Seoul's three personalities: royal palaces and hanok lanes, Hongdae's buskers, and Gangnam's river-park sunset.",
    weatherTip:
      "April (blossoms) and October (foliage) are the peaks. Summer is humid with a late-June–July monsoon; winter is crisp and bright.",
    fullDays: [
      {
        day: 1,
        theme: "Royal Seoul",
        activities: [
          { time: "09:00", name: "Gyeongbokgung & the guard ceremony", emoji: "🏯" },
          { time: "11:30", name: "Hanbok rental & Bukchon hanok lanes", emoji: "👘" },
          { time: "14:00", name: "Ikseon-dong's hanok cafés & lunch", emoji: "☕" },
          { time: "17:00", name: "Insadong tea house & souvenirs", emoji: "🍵" },
        ],
      },
      {
        day: 2,
        theme: "Hongdae Energy",
        activities: [
          { time: "11:00", name: "Hongdae shopping & street snacks", emoji: "🛍️" },
          { time: "14:00", name: "Yeonnam-dong's alley cafés", emoji: "☕" },
          { time: "17:00", name: "Korean BBQ dinner (staff-grilled)", emoji: "🥓" },
          { time: "20:00", name: "Busking shows & noraebang if game", emoji: "🎤" },
        ],
      },
      {
        day: 3,
        theme: "Gangnam & the Han River",
        activities: [
          { time: "10:00", name: "COEX Starfield Library", emoji: "📚" },
          { time: "12:00", name: "Bongeunsa temple amid the towers", emoji: "🛕" },
          { time: "15:00", name: "Lotte World Tower's Seoul Sky", emoji: "🌆" },
          { time: "18:30", name: "Ttukseom Hanang Park: chicken & convenience-store ramyeon by the river", emoji: "🍗" },
        ],
      },
    ],
    restaurants: [
      { name: "Maple Tree House", cuisine: "Korean BBQ · $$", emoji: "🥓" },
      { name: "Gwangjang Market", cuisine: "Bindaetteok & gimbap · $", emoji: "🥞" },
      { name: "Myeongdong Kyoja", cuisine: "Kalguksu noodles · $", emoji: "🍜" },
    ],
    city: "Seoul",
    country: "South Korea",
    airport: ICN,
    travelStyle: "active",
    interests: ["history", "food", "shopping"],
    highlights: [
      "Palace morning with a hanbok twist",
      "Hongdae's busking culture from dusk",
      "The Han River picnic ritual",
    ],
  },
  {
    id: "seoul-4d-deep-dive",
    title: "Seoul 4-Day Deep Dive",
    coverImage: null,
    gradient: "from-purple-500 to-fuchsia-600",
    author: AI,
    days: 4,
    estimatedCost: 400,
    currency: "USD",
    tags: ["Culture", "History", "Markets"],
    excerpt:
      "The classic three plus a fourth day choosing between the DMZ, Suwon's fortress, or Seoul's own museums, markets and bathhouse finish.",
    weatherTip:
      "October is the deep-dive sweet spot — clear air for the Inwangsan ridge walk. The DMZ runs year-round; winter visits are cold but atmospheric.",
    fullDays: [
      {
        day: 1,
        theme: "Royal Seoul",
        activities: [
          { time: "09:00", name: "Gyeongbokgung & Bukchon hanbok walk", emoji: "🏯" },
          { time: "14:00", name: "Ikseon-dong cafés & Insadong", emoji: "🍵" },
          { time: "18:00", name: "N Seoul Tower at dusk", emoji: "🗼" },
        ],
      },
      {
        day: 2,
        theme: "Hongdae or Itaewon",
        activities: [
          { time: "11:00", name: "Hongdae shopping & snacks", emoji: "🛍️" },
          { time: "17:00", name: "BBQ dinner", emoji: "🥓" },
          { time: "20:00", name: "Busking & night markets", emoji: "🎤" },
        ],
      },
      {
        day: 3,
        theme: "Gangnam & River",
        activities: [
          { time: "10:00", name: "COEX Library & Bongeunsa", emoji: "📚" },
          { time: "15:00", name: "Lotte World Tower view", emoji: "🌆" },
          { time: "18:30", name: "Han River park picnic", emoji: "🍗" },
        ],
      },
      {
        day: 4,
        theme: "The Deep Dive",
        activities: [
          { time: "08:00", name: "DMZ tour (booked ahead) — or the National Museum", emoji: "🕊️" },
          { time: "14:00", name: "Mangwon or Gwangjang Market grazing", emoji: "🥞" },
          { time: "16:30", name: "Inwangsan fortress-wall ridge at golden hour", emoji: "⛰️" },
          { time: "19:30", name: "Jjimjilbang bathhouse finish", emoji: "♨️" },
        ],
      },
    ],
    restaurants: [
      { name: "Gwangjang Market", cuisine: "Market classics · $", emoji: "🥞" },
      { name: "Tosokchon Samgyetang", cuisine: "Ginseng chicken soup · $$", emoji: "🍗" },
      { name: "Maple Tree House", cuisine: "Korean BBQ · $$", emoji: "🥓" },
    ],
    city: "Seoul",
    country: "South Korea",
    airport: ICN,
    travelStyle: "cultural",
    interests: ["history", "food", "shopping"],
    highlights: [
      "The DMZ, Suwon, or deep-Seoul fork",
      "Inwangsan's ridge over the city",
      "A jjimjilbang finish for tired legs",
    ],
  },
  {
    id: "seoul-food-3d",
    title: "Seoul 3-Day Food Trip",
    coverImage: null,
    gradient: "from-red-500 to-orange-600",
    author: AI,
    days: 3,
    estimatedCost: 300,
    currency: "USD",
    tags: ["Foodie", "Markets", "BBQ"],
    excerpt:
      "Three days organized around the table: BBQ tiers, Gwangjang's market legends, street-food crawls and the café culture that became a sight.",
    weatherTip:
      "Any season works — food is indoor-dependent in monsoon (June–July) and comforting in winter. October adds street-food weather.",
    fullDays: [
      {
        day: 1,
        theme: "Market Foundations",
        activities: [
          { time: "10:00", name: "Gwangjang Market: bindaetteok & mayak gimbap", emoji: "🥞" },
          { time: "13:00", name: "Ikseon-dong café hour", emoji: "☕" },
          { time: "16:00", name: "Insadong tea & rice cakes", emoji: "🍵" },
          { time: "18:30", name: "First Korean BBQ — pork belly tier", emoji: "🥓" },
        ],
      },
      {
        day: 2,
        theme: "Street Food & Noodles",
        activities: [
          { time: "10:00", name: "Mangwon Market's local prices", emoji: "🛒" },
          { time: "13:00", name: "Myeongdong Kyoja's knife noodles", emoji: "🍜" },
          { time: "16:00", name: "Myeongdong street-food row: tteokbokki & hotteok", emoji: "🌶️" },
          { time: "19:00", name: "Fried chicken & beer (chimaek) night", emoji: "🍗" },
        ],
      },
      {
        day: 3,
        theme: "Premium & Farewell",
        activities: [
          { time: "10:00", name: "Department-store food hall brunch", emoji: "🍱" },
          { time: "13:00", name: "Hanwoo beef BBQ splurge", emoji: "🥩" },
          { time: "16:00", name: "Bingsu dessert café finale", emoji: "🍧" },
          { time: "19:00", name: "Airport with skincare and instant ramen", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Gwangjang Market (Sunhui's)", cuisine: "Bindaetteok · $", emoji: "🥞" },
      { name: "Myeongdong Kyoja", cuisine: "Kalguksu · $", emoji: "🍜" },
      { name: "Byeokje Galbi", cuisine: "Hanwoo BBQ · $$$", emoji: "🥩" },
    ],
    city: "Seoul",
    country: "South Korea",
    airport: ICN,
    travelStyle: "foodie",
    interests: ["food", "shopping"],
    highlights: [
      "The BBQ tier system from pork belly to hanwoo",
      "Gwangjang's century-old market counters",
      "Chimaek: the chicken-and-beer institution",
    ],
  },
  {
    id: "seoul-shopping-2d",
    title: "Seoul 2-Day Shopping Trip",
    coverImage: null,
    gradient: "from-pink-500 to-purple-600",
    author: AI,
    days: 2,
    estimatedCost: 200,
    currency: "USD",
    tags: ["Shopping", "K-Beauty", "Fashion"],
    excerpt:
      "48 hours of K-beauty flagships, underground malls, vintage Hongdae and tax-refund logistics — plus the skincare haul strategy.",
    weatherTip:
      "Shopping is weather-proof year-round. Time it to the summer (June–August) or Seoul Fashion Week (March, October) sale seasons.",
    fullDays: [
      {
        day: 1,
        theme: "Beauty & Department Store Day",
        activities: [
          { time: "10:00", name: "Myeongdong's K-beauty flagship crawl", emoji: "🧴" },
          { time: "13:00", name: "Lotte or Shinsegae department stores", emoji: "🛍️" },
          { time: "16:00", name: "Olive Young mega-store restock run", emoji: "💊" },
          { time: "19:00", name: "Dongdaemun's night shopping malls", emoji: "🌃" },
        ],
      },
      {
        day: 2,
        theme: "Underground & Vintage",
        activities: [
          { time: "10:00", name: "Gangnam Station underground shopping center", emoji: "🚇" },
          { time: "13:00", name: "Common Ground's container mall", emoji: "📦" },
          { time: "15:00", name: "Hongdae vintage & streetwear crawl", emoji: "👕" },
          { time: "18:00", name: "Tax-refund processing & airport", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Myeongdong street food", cuisine: "Street snacks · $", emoji: "🌶️" },
      { name: "Kyochon", cuisine: "Fried chicken · $$", emoji: "🍗" },
      { name: "Isaac Toast", cuisine: "Korean toast · $", emoji: "🥪" },
    ],
    city: "Seoul",
    country: "South Korea",
    airport: ICN,
    travelStyle: "active",
    interests: ["shopping", "food", "nightlife"],
    highlights: [
      "Myeongdong's K-beauty ground zero",
      "Dongdaemun malls that never sleep",
      "The tax-refund system, used properly",
    ],
  },
  {
    id: "paris-3d-classic",
    title: "Paris 3-Day Classic",
    coverImage: null,
    gradient: "from-indigo-500 to-pink-600",
    author: AI,
    days: 3,
    estimatedCost: 450,
    currency: "USD",
    tags: ["Culture", "Museums", "Classic"],
    excerpt:
      "The first-timer's Paris: islands and the Louvre, Montmartre and the Marais, and the grand axis to the Eiffel Tower — grouped by neighborhood to beat the crowds.",
    weatherTip:
      "April–June and September–October are ideal. December is festive and cold; August means quieter streets but closed bistros.",
    fullDays: [
      {
        day: 1,
        theme: "The Islands & the Louvre",
        activities: [
          { time: "09:00", name: "Louvre at first entry (timed ticket)", emoji: "🖼️" },
          { time: "12:30", name: "Sainte-Chapelle's stained glass", emoji: "⛪" },
          { time: "15:00", name: "Île Saint-Louis & the Latin Quarter", emoji: "📚" },
          { time: "20:00", name: "Saint-Germain bistro dinner (booked)", emoji: "🍷" },
        ],
      },
      {
        day: 2,
        theme: "Montmartre & the Marais",
        activities: [
          { time: "09:00", name: "Sacré-Cœur before the crowds", emoji: "⛪" },
          { time: "11:30", name: "Montmartre's back lanes & Place du Tertre", emoji: "🎨" },
          { time: "15:00", name: "Place des Vosges & Marais boutiques", emoji: "🛍️" },
          { time: "20:00", name: "Marais bistro dinner", emoji: "🥖" },
        ],
      },
      {
        day: 3,
        theme: "The Grand Axis",
        activities: [
          { time: "10:00", name: "Tuileries to Place de la Concorde", emoji: "🌳" },
          { time: "13:00", name: "Long formule lunch (the meal of the trip)", emoji: "🍽️" },
          { time: "17:00", name: "Trocadéro gardens & the Eiffel Tower at golden hour", emoji: "🗼" },
          { time: "21:00", name: "Seine at night — free and better than most tickets", emoji: "🌊" },
        ],
      },
    ],
    restaurants: [
      { name: "Café de Flore", cuisine: "Classic café · $$$", emoji: "☕" },
      { name: "L'As du Fallafel", cuisine: "Marais falafel · $", emoji: "🧆" },
      { name: "Le Comptoir du Relais", cuisine: "Bistro · $$", emoji: "🥖" },
    ],
    city: "Paris",
    country: "France",
    airport: CDG,
    travelStyle: "cultural",
    interests: ["museums", "food", "history"],
    highlights: [
      "Louvre's first-entry slot",
      "One long formule lunch",
      "The tower from Trocadéro, not the queue",
    ],
  },
  {
    id: "paris-5d-art-food",
    title: "Paris 5-Day Art & Food Trip",
    coverImage: null,
    gradient: "from-purple-500 to-pink-600",
    author: AI,
    days: 5,
    estimatedCost: 750,
    currency: "USD",
    tags: ["Museums", "Foodie", "Culture"],
    excerpt:
      "Five days for the museum-and-table version of Paris: Louvre and d'Orsay done properly, Versailles unhurried, and the pastry circuit as serious sightseeing.",
    weatherTip:
      "April–June and September–October pair gallery weather with terrace season. Book the big museum slots and two dinners before you fly.",
    fullDays: [
      {
        day: 1,
        theme: "The Louvre, Properly",
        activities: [
          { time: "09:00", name: "Louvre first entry — two wings, not five", emoji: "🖼️" },
          { time: "13:00", name: "Tuileries stroll & Angelina's chocolate", emoji: "🍫" },
          { time: "16:00", name: "Musée de l'Orangerie's Water Lilies", emoji: "🎨" },
          { time: "20:00", name: "Saint-Germain dinner", emoji: "🍷" },
        ],
      },
      {
        day: 2,
        theme: "Orsay & Rodin",
        activities: [
          { time: "09:30", name: "Musée d'Orsay's Impressionist floor", emoji: "🖌️" },
          { time: "13:00", name: "Rue Cler market lunch", emoji: "🧺" },
          { time: "15:30", name: "Rodin Museum's sculpture garden", emoji: "🗿" },
          { time: "20:00", name: "Left Bank bistro", emoji: "🥖" },
        ],
      },
      {
        day: 3,
        theme: "Versailles, All Day",
        activities: [
          { time: "08:00", name: "First RER C train out", emoji: "🚆" },
          { time: "09:00", name: "Palace at opening — Hall of Mirrors early", emoji: "👑" },
          { time: "13:00", name: "Gardens, Trianon & a Grand Canal rowboat", emoji: "🚣" },
          { time: "20:00", name: "Simple dinner near the hotel — you'll be footsore", emoji: "🥪" },
        ],
      },
      {
        day: 4,
        theme: "Montmartre & the Pastry Circuit",
        activities: [
          { time: "09:00", name: "Sacré-Cœur & the butte's lanes", emoji: "🎨" },
          { time: "13:00", name: "Long Marais lunch", emoji: "🍽️" },
          { time: "16:00", name: "Pâtisserie crawl: Pierre Hermé to Du Pain et des Idées", emoji: "🥐" },
          { time: "20:00", name: "Canal Saint-Martin wine-bar night", emoji: "🍷" },
        ],
      },
      {
        day: 5,
        theme: "Covered Passages & Farewell",
        activities: [
          { time: "10:00", name: "The 2nd arrondissement's covered passages", emoji: "🏛️" },
          { time: "13:00", name: "Farewell formule lunch", emoji: "🥖" },
          { time: "15:00", name: "Sainte-Chapelle (if it rained earlier) or shopping", emoji: "🛍️" },
          { time: "18:00", name: "Croissants for the train", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Pierre Hermé", cuisine: "Pâtisserie · $$", emoji: "🥐" },
      { name: "Le Comptoir du Relais", cuisine: "Bistro · $$", emoji: "🥖" },
      { name: "Angelina", cuisine: "Chocolate & tea · $$", emoji: "🍫" },
    ],
    city: "Paris",
    country: "France",
    airport: CDG,
    travelStyle: "cultural",
    interests: ["museums", "food", "history"],
    highlights: [
      "Louvre and d'Orsay both done properly",
      "Versailles without the misery",
      "The pastry circuit as serious sightseeing",
    ],
  },
  {
    id: "paris-food-3d",
    title: "Paris 3-Day Food Trip",
    coverImage: null,
    gradient: "from-rose-500 to-amber-500",
    author: AI,
    days: 3,
    estimatedCost: 450,
    currency: "USD",
    tags: ["Foodie", "Markets", "Patisserie"],
    excerpt:
      "Three days built around the table: bakery breakfasts, formule lunches, market picnics, a booked bistro a night, and the pastry circuit between.",
    weatherTip:
      "Terrace season (April–October) makes market picnics a way of life. Winter doubles the hot-chocolate ration.",
    fullDays: [
      {
        day: 1,
        theme: "The Left Bank Table",
        activities: [
          { time: "08:30", name: "Bakery breakfast & the Rue Cler market", emoji: "🥐" },
          { time: "12:30", name: "Formule lunch in Saint-Germain", emoji: "🍽️" },
          { time: "15:00", name: "Pierre Hermé & Bon Marché's food hall", emoji: "🍫" },
          { time: "20:00", name: "Booked bistro dinner", emoji: "🍷" },
        ],
      },
      {
        day: 2,
        theme: "Market Morning & the Marais",
        activities: [
          { time: "09:00", name: "Marché Bastille or Marché d'Aligre", emoji: "🧺" },
          { time: "12:00", name: "Seine picnic with market spoils", emoji: "🥖" },
          { time: "15:00", name: "L'As du Fallafel & Marais pastry stops", emoji: "🧆" },
          { time: "20:00", name: "Le Marais wine-bar dinner", emoji: "🍷" },
        ],
      },
      {
        day: 3,
        theme: "The Pastry Pilgrimage",
        activities: [
          { time: "09:30", name: "Du Pain et des Idées' escargots", emoji: "🥐" },
          { time: "12:00", name: "Farewell formule lunch near the canal", emoji: "🍽️" },
          { time: "15:00", name: "Angelina's chocolate & the covered passages", emoji: "🍫" },
          { time: "18:00", name: "Croissants for the flight", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Du Pain et des Idées", cuisine: "Bakery · $", emoji: "🥐" },
      { name: "L'As du Fallafel", cuisine: "Falafel · $", emoji: "🧆" },
      { name: "Le Comptoir du Relais", cuisine: "Bistro · $$", emoji: "🥖" },
    ],
    city: "Paris",
    country: "France",
    airport: CDG,
    travelStyle: "foodie",
    interests: ["food", "shopping"],
    highlights: [
      "The formule lunch as the budget's best trick",
      "Marché d'Aligre's market chaos",
      "One booked bistro every night",
    ],
  },
  {
    id: "singapore-3d-family",
    title: "Singapore 3-Day Family Trip",
    coverImage: null,
    gradient: "from-emerald-500 to-green-700",
    author: AI,
    days: 3,
    estimatedCost: 540,
    currency: "SGD",
    tags: ["Family", "Gardens", "Foodie"],
    excerpt:
      "Three heat-managed family days: gardens and light shows, Sentosa's beaches and Universal, and hawker dinners everyone can agree on.",
    weatherTip:
      "February–April is the driest window, but Singapore is equatorial year-round — this plan hides indoors through the midday furnace regardless.",
    fullDays: [
      {
        day: 1,
        theme: "Gardens & the Bay",
        activities: [
          { time: "09:00", name: "Gardens by the Bay's outdoor walks", emoji: "🌳" },
          { time: "11:30", name: "Cloud Forest conservatory (air-con)", emoji: "🌧️" },
          { time: "14:00", name: "Hotel-pool break through the heat", emoji: "🏊" },
          { time: "17:30", name: "Satay dinner at Lau Pa Sat", emoji: "🍢" },
          { time: "19:45", name: "Garden Rhapsody light show (free)", emoji: "💡" },
        ],
      },
      {
        day: 2,
        theme: "Sentosa Day",
        activities: [
          { time: "09:30", name: "Cable car over to Sentosa", emoji: "🚡" },
          { time: "10:30", name: "Universal Studios or Siloso Beach", emoji: "🎢" },
          { time: "14:00", name: "Lunch & luge rides", emoji: "🛷" },
          { time: "17:30", name: "Wings of Time evening show", emoji: "🎆" },
        ],
      },
      {
        day: 3,
        theme: "Animals & Farewell",
        activities: [
          { time: "09:00", name: "Singapore Zoo's morning feeding sessions", emoji: "🦧" },
          { time: "13:00", name: "Maxwell Food Centre's chicken rice", emoji: "🍗" },
          { time: "15:00", name: "Marina Bay Sands' skypark or mall wander", emoji: "🏙️" },
          { time: "18:00", name: "Changi — the world's best airport, plan for it", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Tian Tian Chicken Rice", cuisine: "Hawker · $", emoji: "🍗" },
      { name: "Lau Pa Sat satay street", cuisine: "Satay · $", emoji: "🍢" },
      { name: "Crystal Jade", cuisine: "Dim sum · $$", emoji: "🥟" },
    ],
    city: "Singapore",
    country: "Singapore",
    airport: SIN,
    travelStyle: "relaxed",
    interests: ["food", "shopping", "museums"],
    highlights: [
      "Gardens by the Bay bookending the day",
      "Sentosa with an exit plan",
      "Hawker dinners that please every age",
    ],
  },
  {
    id: "hong-kong-3d-highlights",
    title: "Hong Kong 3-Day Highlights",
    coverImage: null,
    gradient: "from-red-600 to-amber-500",
    author: AI,
    days: 3,
    estimatedCost: 390,
    currency: "USD",
    tags: ["Foodie", "Skyline", "Culture"],
    excerpt:
      "Three days of Victoria Peak and the skyline, dim sum mornings, the Star Ferry, and a Big Buddha day trip on Lantau.",
    weatherTip:
      "October–December is cool, dry and clear — the best skyline weather. Summers are hot, humid and typhoon-prone; spring fogs the peaks.",
    fullDays: [
      {
        day: 1,
        theme: "Island Icons",
        activities: [
          { time: "09:00", name: "Dim sum breakfast at a classic teahouse", emoji: "🥟" },
          { time: "11:00", name: "Star Ferry across Victoria Harbour", emoji: "⛴️" },
          { time: "14:00", name: "Victoria Peak by tram", emoji: "🚋" },
          { time: "19:00", name: "Symphony of Lights from Tsim Sha Tsui", emoji: "🌆" },
        ],
      },
      {
        day: 2,
        theme: "Lantau & the Big Buddha",
        activities: [
          { time: "09:30", name: "Ngong Ping 360 cable car", emoji: "🚡" },
          { time: "11:00", name: "Tian Tan Big Buddha & Po Lin Monastery", emoji: "🛕" },
          { time: "15:00", name: "Tai O fishing village's stilt houses", emoji: "⛵" },
          { time: "19:30", name: "Temple Street night market dinner", emoji: "🍢" },
        ],
      },
      {
        day: 3,
        theme: "Markets & Departure",
        activities: [
          { time: "09:00", name: "Cha chaan teng breakfast: milk tea & pineapple bun", emoji: "🥛" },
          { time: "11:00", name: "Central–Mid-Levels escalators & SOHO", emoji: "🛍️" },
          { time: "14:00", name: "Wonton noodles & egg tarts farewell", emoji: "🥮" },
          { time: "17:00", name: "Airport express — 24 minutes", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Tai Cheong Bakery", cuisine: "Egg tarts · $", emoji: "🥮" },
      { name: "Lin Heung-tea house heirs", cuisine: "Dim sum · $$", emoji: "🥟" },
      { name: "Mak's Noodle", cuisine: "Wonton noodles · $", emoji: "🍜" },
    ],
    city: "Hong Kong",
    country: "Hong Kong SAR",
    airport: HKG,
    travelStyle: "foodie",
    interests: ["food", "shopping", "nature"],
    highlights: [
      "The Peak in the clearest hour you can find",
      "Dim sum mornings done properly",
      "Lantau's Big Buddha by cable car",
    ],
  },
  {
    id: "taipei-3d-night-markets",
    title: "Taipei 3-Day Night-Market Trip",
    coverImage: null,
    gradient: "from-cyan-500 to-indigo-700",
    author: AI,
    days: 3,
    estimatedCost: 270,
    currency: "USD",
    tags: ["Foodie", "Night Markets", "City Break"],
    excerpt:
      "Three days, one night market per evening: temples and street food by day, Raohe's glow, Shilin's scale, and the Elephant Mountain sunset between.",
    weatherTip:
      "October–November is the sweet spot. Summers are hot and wet; winters mild but grey. Night markets run in any weather — many are covered.",
    fullDays: [
      {
        day: 1,
        theme: "Temples & Raohe",
        activities: [
          { time: "10:00", name: "Longshan Temple's morning incense", emoji: "🛕" },
          { time: "13:00", name: "Dadaocheng's riverside & tea shops", emoji: "🍵" },
          { time: "17:30", name: "Raohe Night Market at lamp-lighting", emoji: "🏮" },
          { time: "20:00", name: "Pepper buns from the charcoal oven", emoji: "🥟" },
        ],
      },
      {
        day: 2,
        theme: "Springs & Shilin",
        activities: [
          { time: "10:00", name: "Beitou hot springs & thermal valley", emoji: "♨️" },
          { time: "14:00", name: "National Palace Museum highlights", emoji: "🏺" },
          { time: "18:00", name: "Shilin Night Market — the big one", emoji: "🍢" },
          { time: "21:00", name: "Stinky tofu, conquered or deferred", emoji: "🧆" },
        ],
      },
      {
        day: 3,
        theme: "101, Elephant Mountain & Ningxia",
        activities: [
          { time: "10:00", name: "Taipei 101 observatory", emoji: "🏙️" },
          { time: "16:30", name: "Elephant Mountain climb for sunset", emoji: "🌄" },
          { time: "19:00", name: "Ningxia Night Market — the food-first local pick", emoji: "🥟" },
          { time: "21:30", name: "Bubble tea farewell", emoji: "🧋" },
        ],
      },
    ],
    restaurants: [
      { name: "Fuzhou pepper buns", cuisine: "Charcoal oven · $", emoji: "🥟" },
      { name: "Din Tai Fung Xinyi", cuisine: "Xiaolongbao · $$", emoji: "🥟" },
      { name: "Ningxia market stalls", cuisine: "Taiwanese street · $", emoji: "🍢" },
    ],
    city: "Taipei",
    country: "Taiwan",
    airport: TPE,
    travelStyle: "foodie",
    interests: ["food", "shopping", "nature"],
    highlights: [
      "A different night market every evening",
      "Beitou's hot springs on the MRT line",
      "Elephant Mountain's famous skyline shot",
    ],
  },
  {
    id: "bangkok-3d-temples-markets",
    title: "Bangkok 3-Day Temples & Markets",
    coverImage: null,
    gradient: "from-amber-500 to-purple-700",
    author: AI,
    days: 3,
    estimatedCost: 150,
    currency: "USD",
    tags: ["Culture", "Markets", "Budget"],
    excerpt:
      "Three heat-managed days: golden temples at opening, Chatuchak and Chinatown markets late, and the longtail-boat canal Bangkok in between.",
    weatherTip:
      "November–February is the cool season. April scorches; June–October brings afternoon monsoon bursts that pass in twenty minutes.",
    fullDays: [
      {
        day: 1,
        theme: "Grand Palace & Riverside",
        activities: [
          { time: "08:30", name: "Grand Palace & Wat Phra Kaew at opening", emoji: "🛕" },
          { time: "11:00", name: "Wat Pho's reclining Buddha", emoji: "🛕" },
          { time: "15:00", name: "Ferry to Wat Arun for sunset", emoji: "🌇" },
          { time: "19:00", name: "Yaowarat (Chinatown) street-food dinner", emoji: "🍢" },
        ],
      },
      {
        day: 2,
        theme: "Market Day",
        activities: [
          { time: "09:30", name: "Chatuchak Weekend Market (or museums on weekdays)", emoji: "🛍️" },
          { time: "13:00", name: "Or Tor Kor's perfect fruit", emoji: "🍈" },
          { time: "16:00", name: "Air-con afternoon: malls or Jim Thompson House", emoji: "🏛️" },
          { time: "18:30", name: "Ratchada night market & its neon wheel", emoji: "🎡" },
        ],
      },
      {
        day: 3,
        theme: "Canals & Farewell",
        activities: [
          { time: "09:00", name: "Longtail boat through the Thonburi canals", emoji: "🛶" },
          { time: "12:00", name: "Riverside lunch", emoji: "🍲" },
          { time: "15:00", name: "Thai massage (the city's signature)", emoji: "💆" },
          { time: "18:30", name: "Chao Phraya riverside farewell dinner", emoji: "🍛" },
        ],
      },
    ],
    restaurants: [
      { name: "Thipsamai", cuisine: "Pad thai · $", emoji: "🍤" },
      { name: "Or Tor Kor Market", cuisine: "Fruit & curries · $", emoji: "🍈" },
      { name: "Jay Fai", cuisine: "Michelin street wok · $$$", emoji: "🥢" },
    ],
    city: "Bangkok",
    country: "Thailand",
    airport: BKK,
    travelStyle: "foodie",
    interests: ["food", "history", "shopping"],
    highlights: [
      "Temples at 8:30 before the coaches",
      "Chatuchak's 15,000 stalls",
      "The canal-side Bangkok tourists skip",
    ],
  },
  {
    id: "bangkok-food-3d",
    title: "Bangkok 3-Day Food Trip",
    coverImage: null,
    gradient: "from-orange-500 to-red-600",
    author: AI,
    days: 3,
    estimatedCost: 150,
    currency: "USD",
    tags: ["Foodie", "Street Food", "Markets"],
    excerpt:
      "Three days of eating: Chinatown's Yaowarat blaze, Michelin street woks, floating-market mornings and the mango-sticky-rice curriculum.",
    weatherTip:
      "Street food is year-round; the cool season (November–February) makes the evening markets comfortable. Monsoon afternoons move everything under roofs.",
    fullDays: [
      {
        day: 1,
        theme: "Yaowarat & Old Town",
        activities: [
          { time: "10:00", name: "Old-town shophouse brunch", emoji: "🍜" },
          { time: "14:00", name: "Chinatown's gold-shop lanes & snack crawl", emoji: "🥟" },
          { time: "18:30", name: "Yaowarat's street-food blaze at ignition", emoji: "🔥" },
          { time: "21:00", name: "Toast & chestnut dessert carts", emoji: "🌰" },
        ],
      },
      {
        day: 2,
        theme: "Markets & the Wok Masters",
        activities: [
          { time: "09:00", name: "Or Tor Kor market breakfast", emoji: "🍈" },
          { time: "12:30", name: "Jay Fai's crab omelet (or the queue's honest alternative)", emoji: "🦀" },
          { time: "16:00", name: "Boat-noodle alley dinner roulette", emoji: "🍜" },
          { time: "20:00", name: "Rooftop nightcap with the skyline", emoji: "🍸" },
        ],
      },
      {
        day: 3,
        theme: "Floating Market & Farewell",
        activities: [
          { time: "07:00", name: "Damnoen Saduak or Taling Chan floating market", emoji: "🛶" },
          { time: "13:00", name: "Som tam & grilled chicken school", emoji: "🥗" },
          { time: "16:00", name: "Mango sticky rice graduation", emoji: "🥭" },
          { time: "19:00", name: "Airport — pleasantly heavy", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Jay Fai", cuisine: "Michelin street wok · $$$", emoji: "🦀" },
      { name: "Thipsamai", cuisine: "Pad thai · $", emoji: "🍤" },
      { name: "Ba Hao", cuisine: "Yaowarat Chinese-Thai · $$", emoji: "🥟" },
    ],
    city: "Bangkok",
    country: "Thailand",
    airport: BKK,
    travelStyle: "foodie",
    interests: ["food", "shopping"],
    highlights: [
      "Yaowarat after dark — the street-food capital of Asia",
      "The mango sticky rice curriculum",
      "A floating-market dawn",
    ],
  },
  {
    id: "bali-5d-island",
    title: "Bali 5-Day Island Escape",
    coverImage: null,
    gradient: "from-green-500 to-teal-700",
    author: AI,
    days: 5,
    estimatedCost: 350,
    currency: "USD",
    tags: ["Beaches", "Nature", "Temples"],
    excerpt:
      "Five days split the right way: Ubud's rice terraces, temples and waterfalls, then the southern coast's sunset bars and beach finale.",
    weatherTip:
      "April–October is the dry season — plan the waterfall and terrace days freely. The wet season (November–March) trades afternoon storms for lower prices.",
    fullDays: [
      {
        day: 1,
        theme: "Arrive & Ubud",
        activities: [
          { time: "12:00", name: "Airport to Ubud (land early if you can)", emoji: "🚐" },
          { time: "17:00", name: "Campuhan Ridge golden-hour walk", emoji: "🌄" },
          { time: "19:30", name: "Dinner on Ubud's restaurant row", emoji: "🍛" },
        ],
      },
      {
        day: 2,
        theme: "Terraces & Temples",
        activities: [
          { time: "07:00", name: "Tegallalang rice terraces before the vans", emoji: "🌾" },
          { time: "10:00", name: "Tirta Empul's spring-water ceremony", emoji: "🛕" },
          { time: "14:00", name: "Gunung Kawi's river-valley shrines", emoji: "🗿" },
          { time: "19:30", name: "Babi guling or tempeh-warung dinner", emoji: "🐖" },
        ],
      },
      {
        day: 3,
        theme: "Waterfalls & Monkeys",
        activities: [
          { time: "09:00", name: "Tibumana waterfall swim", emoji: "💦" },
          { time: "12:00", name: "Sacred Monkey Forest (straps on everything)", emoji: "🐒" },
          { time: "16:00", name: "Ubud palace & market", emoji: "🛍️" },
          { time: "19:00", name: "Legong dance evening", emoji: "💃" },
        ],
      },
      {
        day: 4,
        theme: "Transfer South & Sunset",
        activities: [
          { time: "10:00", name: "Drive to Uluwatu or Seminyak", emoji: "🚐" },
          { time: "13:00", name: "Beach club afternoon", emoji: "🍹" },
          { time: "18:00", name: "Uluwatu's cliff temple & kecak fire dance", emoji: "🔥" },
          { time: "20:00", name: "Jimbaran seafood on the sand", emoji: "🦐" },
        ],
      },
      {
        day: 5,
        theme: "Beach Day & Departure",
        activities: [
          { time: "09:00", name: "Surf lesson or pool-and-massage morning", emoji: "🏄" },
          { time: "13:00", name: "Final nasi campur lunch", emoji: "🍛" },
          { time: "16:00", name: "Airport (late flights are the norm — use the day)", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Warung Babi Guling Ibu Oka", cuisine: "Balinese roast pork · $", emoji: "🐖" },
      { name: "Locavore-style Ubud dining", cuisine: "Modern Indonesian · $$$", emoji: "🌿" },
      { name: "Jimbaran beach seafood", cuisine: "Grilled on the sand · $$", emoji: "🦐" },
    ],
    city: "Bali",
    country: "Indonesia",
    airport: DPS,
    travelStyle: "relaxed",
    interests: ["beaches", "nature", "food"],
    highlights: [
      "Tegallalang's terraces at 7am",
      "The kecak fire dance on Uluwatu's cliff",
      "Two Balis: green interior, blue coast",
    ],
  },
  {
    id: "bali-honeymoon-7d",
    title: "Bali 7-Day Honeymoon Trip",
    coverImage: null,
    gradient: "from-rose-400 to-teal-600",
    author: AI,
    days: 7,
    estimatedCost: 1050,
    currency: "USD",
    tags: ["Couples", "Luxury", "Beaches"],
    excerpt:
      "A slow seven days for two: a jungle villa in Ubud, a clifftop finish in Uluwatu, spa afternoons, and dinners with room in them.",
    weatherTip:
      "April–October is the dry season — book clifftop and jungle villas early. The wet season's green quiet suits honeymoon budgets even better.",
    fullDays: [
      {
        day: 1,
        theme: "Arrive & Jungle Villa",
        activities: [
          { time: "13:00", name: "Check into the Ubud villa; pool hours begin", emoji: "🏊" },
          { time: "18:00", name: "Campuhan Ridge at golden hour", emoji: "🌄" },
          { time: "20:00", name: "Candlelit Ubud dinner", emoji: "🕯️" },
        ],
      },
      {
        day: 2,
        theme: "Terraces & Spa",
        activities: [
          { time: "08:00", name: "Private sunrise at the Tegallalang terraces", emoji: "🌾" },
          { time: "13:00", name: "Couple's spa afternoon", emoji: "💆" },
          { time: "19:30", name: "Fine-dining Ubud night", emoji: "🌿" },
        ],
      },
      {
        day: 3,
        theme: "Temples & Waterfalls",
        activities: [
          { time: "09:00", name: "Tirta Empul with a private driver", emoji: "🛕" },
          { time: "13:00", name: "Tibumana waterfall picnic", emoji: "💦" },
          { time: "18:30", name: "Legong dance & late dinner", emoji: "💃" },
        ],
      },
      {
        day: 4,
        theme: "Transfer to the Cliff",
        activities: [
          { time: "10:00", name: "Slow morning, drive south", emoji: "🚐" },
          { time: "14:00", name: "Uluwatu clifftop villa check-in", emoji: "🏨" },
          { time: "18:00", name: "Kecak fire dance at sunset", emoji: "🔥" },
        ],
      },
      {
        day: 5,
        theme: "Beach & Boat",
        activities: [
          { time: "09:00", name: "Padang Padang cove swim", emoji: "🏖️" },
          { time: "13:00", name: "Beach-club daybed afternoon", emoji: "🍹" },
          { time: "19:00", name: "Jimbaran seafood on the sand", emoji: "🦐" },
        ],
      },
      {
        day: 6,
        theme: "Snorkel & Sunset",
        activities: [
          { time: "08:30", name: "Blue-point or Nusa Penida snorkel trip", emoji: "🐠" },
          { time: "16:00", name: "Final spa round", emoji: "💆" },
          { time: "19:00", name: "Clifftop farewell dinner", emoji: "🥂" },
        ],
      },
      {
        day: 7,
        theme: "Departure",
        activities: [
          { time: "10:00", name: "Pool, pack, and one last smoothie bowl", emoji: "🥥" },
          { time: "15:00", name: "Airport", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Locavore NXT", cuisine: "Ubud tasting menu · $$$$", emoji: "🌿" },
      { name: "Jimbaran beach grills", cuisine: "Seafood on sand · $$", emoji: "🦐" },
      { name: "Single Fin Uluwatu", cuisine: "Cliff sunset · $$", emoji: "🍹" },
    ],
    city: "Bali",
    country: "Indonesia",
    airport: DPS,
    travelStyle: "relaxed",
    interests: ["beaches", "nature", "food"],
    highlights: [
      "Two villas: jungle then cliff",
      "The terraces without the crowds",
      "One perfect kecak sunset",
    ],
  },
  {
    id: "hanoi-3d-street-food",
    title: "Hanoi 3-Day Street-Food Trip",
    coverImage: null,
    gradient: "from-red-500 to-orange-600",
    author: AI,
    days: 3,
    estimatedCost: 150,
    currency: "USD",
    tags: ["Foodie", "Street Food", "Culture"],
    excerpt:
      "Three days of pho at dawn, bun cha at lunch, and the Old Quarter's motorbike-tide evenings — plus the Ha Long Bay day cruise option.",
    weatherTip:
      "October–November is Hanoi's best window: dry, warm, clear. Summer is hot and rainy; winter is cool and drizzly — pho weather either way.",
    fullDays: [
      {
        day: 1,
        theme: "Old Quarter Foundations",
        activities: [
          { time: "07:30", name: "Pho breakfast at a street stall", emoji: "🍜" },
          { time: "10:00", name: "Hoan Kiem Lake & Ngoc Son Temple", emoji: "🌉" },
          { time: "14:00", name: "Old Quarter's 36 merchant streets", emoji: "🛵" },
          { time: "18:30", name: "Bun cha & bia hoi corner dinner", emoji: "🍺" },
        ],
      },
      {
        day: 2,
        theme: "History & Egg Coffee",
        activities: [
          { time: "08:30", name: "Temple of Literature", emoji: "🛕" },
          { time: "11:00", name: "Ho Chi Minh complex or the Hoa Lo Prison museum", emoji: "🏛️" },
          { time: "14:00", name: "Egg coffee in a hidden café", emoji: "☕" },
          { time: "19:00", name: "Cha ca turmeric-fish dinner", emoji: "🐟" },
        ],
      },
      {
        day: 3,
        theme: "Ha Long Bay or Train Street",
        activities: [
          { time: "08:00", name: "Ha Long Bay day cruise (book ahead)", emoji: "🛶" },
          { time: "17:30", name: "Back for Train Street coffee", emoji: "🚂" },
          { time: "20:00", name: "Banana-salad & grille-pork farewell", emoji: "🍢" },
        ],
      },
    ],
    restaurants: [
      { name: "Bun Cha Huong Lien", cuisine: "Obama's bun cha · $", emoji: "🍜" },
      { name: "Pho Bat Dan", cuisine: "Pho queue legend · $", emoji: "🍲" },
      { name: "Cha Ca Thang Long", cuisine: "Turmeric fish · $$", emoji: "🐟" },
    ],
    city: "Hanoi",
    country: "Vietnam",
    airport: HAN,
    travelStyle: "foodie",
    interests: ["food", "history", "nature"],
    highlights: [
      "Pho before the city wakes up",
      "The Old Quarter's motorbike ballet",
      "Ha Long Bay in a day",
    ],
  },
];

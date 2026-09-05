import type { Airport } from "@/types/flight";
import type { RawTripInput } from "./trips-extended-a";

// Extended trips, batch D — Japan's regional cities and Europe's second tier.

const AI = { kind: "ai" as const, name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" };

const FUK: Airport = {
  iata: "FUK", icao: "RJFF", name: "Fukuoka Airport", city: "Fukuoka", country: "Japan",
  timezone: "Asia/Tokyo", latitude: 33.5859, longitude: 130.451,
};
const CTS: Airport = {
  iata: "CTS", icao: "RJCC", name: "New Chitose Airport", city: "Sapporo", country: "Japan",
  timezone: "Asia/Tokyo", latitude: 42.7752, longitude: 141.6923,
};
const NGO: Airport = {
  iata: "NGO", icao: "RJGG", name: "Chubu Centrair International Airport", city: "Nagoya", country: "Japan",
  timezone: "Asia/Tokyo", latitude: 34.8584, longitude: 136.8054,
};
const NGS: Airport = {
  iata: "NGS", icao: "RJFU", name: "Nagasaki Airport", city: "Nagasaki", country: "Japan",
  timezone: "Asia/Tokyo", latitude: 32.9169, longitude: 129.9138,
};
const HIJ: Airport = {
  iata: "HIJ", icao: "RJOA", name: "Hiroshima Airport", city: "Hiroshima", country: "Japan",
  timezone: "Asia/Tokyo", latitude: 34.4361, longitude: 132.9194,
};
const KMQ: Airport = {
  iata: "KMQ", icao: "RJNK", name: "Komatsu Airport", city: "Kanazawa", country: "Japan",
  timezone: "Asia/Tokyo", latitude: 36.3939, longitude: 136.4072,
};
const UKB: Airport = {
  iata: "UKB", icao: "RJBE", name: "Kobe Airport", city: "Kobe", country: "Japan",
  timezone: "Asia/Tokyo", latitude: 34.6328, longitude: 135.2239,
};
const BER: Airport = {
  iata: "BER", icao: "EDDB", name: "Berlin Brandenburg Airport", city: "Berlin", country: "Germany",
  timezone: "Europe/Berlin", latitude: 52.3667, longitude: 13.5033,
};
const MUC: Airport = {
  iata: "MUC", icao: "EDDM", name: "Munich Airport", city: "Munich", country: "Germany",
  timezone: "Europe/Berlin", latitude: 48.3538, longitude: 11.7861,
};
const FRA: Airport = {
  iata: "FRA", icao: "EDDF", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany",
  timezone: "Europe/Berlin", latitude: 50.0379, longitude: 8.5622,
};
const MXP: Airport = {
  iata: "MXP", icao: "LIMC", name: "Milan Malpensa Airport", city: "Milan", country: "Italy",
  timezone: "Europe/Rome", latitude: 45.6306, longitude: 8.7281,
};
const NAP: Airport = {
  iata: "NAP", icao: "LIRN", name: "Naples International Airport", city: "Naples", country: "Italy",
  timezone: "Europe/Rome", latitude: 40.886, longitude: 14.2908,
};
const BLQ: Airport = {
  iata: "BLQ", icao: "LIPQ", name: "Bologna Airport", city: "Bologna", country: "Italy",
  timezone: "Europe/Rome", latitude: 44.5354, longitude: 11.2887,
};
const TRN: Airport = {
  iata: "TRN", icao: "LIMF", name: "Turin Airport", city: "Turin", country: "Italy",
  timezone: "Europe/Rome", latitude: 45.2008, longitude: 7.6496,
};
const MAD: Airport = {
  iata: "MAD", icao: "LEMD", name: "Adolfo Suárez Madrid–Barajas Airport", city: "Madrid", country: "Spain",
  timezone: "Europe/Madrid", latitude: 40.4936, longitude: -3.5668,
};
const VLC: Airport = {
  iata: "VLC", icao: "LEVC", name: "Valencia Airport", city: "Valencia", country: "Spain",
  timezone: "Europe/Madrid", latitude: 39.4893, longitude: -0.4816,
};
const AGP: Airport = {
  iata: "AGP", icao: "LEMG", name: "Málaga Airport", city: "Malaga", country: "Spain",
  timezone: "Europe/Madrid", latitude: 36.6749, longitude: -4.4991,
};
const GRX: Airport = {
  iata: "GRX", icao: "LEGR", name: "Federico García Lorca Granada Airport", city: "Granada", country: "Spain",
  timezone: "Europe/Madrid", latitude: 37.1888, longitude: -3.7772,
};
const OPO: Airport = {
  iata: "OPO", icao: "LPPR", name: "Francisco Sá Carneiro Airport", city: "Porto", country: "Portugal",
  timezone: "Europe/Lisbon", latitude: 41.2481, longitude: -8.6814,
};
const BRU: Airport = {
  iata: "BRU", icao: "EBBR", name: "Brussels Airport", city: "Brussels", country: "Belgium",
  timezone: "Europe/Brussels", latitude: 50.9014, longitude: 4.4844,
};
const ARN: Airport = {
  iata: "ARN", icao: "ESSA", name: "Stockholm Arlanda Airport", city: "Stockholm", country: "Sweden",
  timezone: "Europe/Stockholm", latitude: 59.6519, longitude: 17.9186,
};
const OSL: Airport = {
  iata: "OSL", icao: "ENGM", name: "Oslo Airport, Gardermoen", city: "Oslo", country: "Norway",
  timezone: "Europe/Oslo", latitude: 60.1939, longitude: 11.1004,
};
const KEF: Airport = {
  iata: "KEF", icao: "BIKF", name: "Keflavík International Airport", city: "Reykjavik", country: "Iceland",
  timezone: "Atlantic/Reykjavik", latitude: 63.985, longitude: -22.6056,
};
const DUB: Airport = {
  iata: "DUB", icao: "EIDW", name: "Dublin Airport", city: "Dublin", country: "Ireland",
  timezone: "Europe/Dublin", latitude: 53.4213, longitude: -6.2701,
};
const DBV: Airport = {
  iata: "DBV", icao: "LDDU", name: "Dubrovnik Airport", city: "Dubrovnik", country: "Croatia",
  timezone: "Europe/Zagreb", latitude: 42.5614, longitude: 18.2682,
};
const JTR: Airport = {
  iata: "JTR", icao: "LGSR", name: "Santorini Airport", city: "Santorini", country: "Greece",
  timezone: "Europe/Athens", latitude: 36.3991, longitude: 25.4789,
};

export const EXTENDED_TRIPS_D: RawTripInput[] = [
  {
    id: "fukuoka-3d-food",
    title: "Fukuoka 3-Day Food Trip",
    coverImage: null,
    gradient: "from-orange-500 to-blue-600",
    author: AI,
    days: 3,
    estimatedCost: 315,
    currency: "USD",
    tags: ["Foodie", "City Break", "Culture"],
    excerpt:
      "Three days in Japan's ramen capital: yatai riverside stalls, tonkotsu at the source, and a Dazaifu shrine day between bowls.",
    weatherTip:
      "March–May and October–November are ideal for the stall-lined evenings. Summer is humid; winter is ramen-perfect.",
    fullDays: [
      {
        day: 1,
        theme: "Yatai Nights",
        activities: [
          { time: "11:00", name: "Yanagibashi Market's seafood bowls", emoji: "🐟" },
          { time: "15:00", name: "Ohori Park & Fukuoka Tower", emoji: "🌳" },
          { time: "18:30", name: "Nakasu yatai stall dinner under the lanterns", emoji: "🏮" },
        ],
      },
      {
        day: 2,
        theme: "Ramen Pilgrimage",
        activities: [
          { time: "09:00", name: "Kushida Shrine & Hakata's old lanes", emoji: "⛩️" },
          { time: "12:00", name: "Tonkotsu ramen at the original counters", emoji: "🍜" },
          { time: "16:00", name: "Tenjin underground malls", emoji: "🛍️" },
          { time: "19:00", name: "Izakaya night in Daimyo", emoji: "🍶" },
        ],
      },
      {
        day: 3,
        theme: "Dazaifu Day Trip",
        activities: [
          { time: "09:30", name: "Dazaifu Tenmangu's shrine approach", emoji: "🛕" },
          { time: "13:00", name: "Umegae mochi & café street", emoji: "🍡" },
          { time: "17:00", name: "Farewell stall hop before the flight", emoji: "🍢" },
        ],
      },
    ],
    restaurants: [
      { name: "Nakasu yatai stalls", cuisine: "Riverside stalls · $", emoji: "🏮" },
      { name: "Shin Shin Hakata", cuisine: "Tonkotsu classic · $", emoji: "🍜" },
      { name: "Kawabata Sobakiri", cuisine: "Soba · $$", emoji: "🍥" },
    ],
    city: "Fukuoka",
    country: "Japan",
    airport: FUK,
    travelStyle: "foodie",
    interests: ["food", "shopping", "history"],
    highlights: [
      "The yatai stall culture, one night minimum",
      "Tonkotsu ramen where it was born",
      "Dazaifu's mochi-lined approach",
    ],
  },
  {
    id: "sapporo-3d-winter-food",
    title: "Sapporo 3-Day Winter & Food Trip",
    coverImage: null,
    gradient: "from-sky-500 to-slate-700",
    author: AI,
    days: 3,
    estimatedCost: 360,
    currency: "USD",
    tags: ["Foodie", "Winter", "Culture"],
    excerpt:
      "Three days in Hokkaido's capital: Snow Festival ice palaces (February), miso ramen lanes, beer heritage and a ski afternoon.",
    weatherTip:
      "February is festival season — book rooms 4–6 months out. December–March is snow-solid; July–August is the cool escape.",
    fullDays: [
      {
        day: 1,
        theme: "Odori & Ramen",
        activities: [
          { time: "10:00", name: "Odori Park & the TV Tower (Snow Festival sites in Feb)", emoji: "❄️" },
          { time: "13:00", name: "Miso ramen at Ramen Alley", emoji: "🍜" },
          { time: "18:00", name: "Susukino's ice bars & izakaya night", emoji: "🧊" },
        ],
      },
      {
        day: 2,
        theme: "Beer & Seafood",
        activities: [
          { time: "10:00", name: "Sapporo Beer Museum & garden lunch", emoji: "🍺" },
          { time: "14:00", name: "Nijo Market's crab & uni", emoji: "🦀" },
          { time: "18:30", name: "Soup curry dinner (Hokkaido's own)", emoji: "🍲" },
        ],
      },
      {
        day: 3,
        theme: "Ski or Snowshoe",
        activities: [
          { time: "09:00", name: "Teine or Sapporo Teine slopes (rentals easy)", emoji: "⛷️" },
          { time: "17:00", name: "Mount Moiwa's night view", emoji: "🌃" },
        ],
      },
    ],
    restaurants: [
      { name: "Ramen Alley (Ganso)", cuisine: "Miso ramen · $", emoji: "🍜" },
      { name: "Sapporo Beer Garden", cuisine: "Genghis Khan lamb · $$", emoji: "🍺" },
      { name: "Suage+", cuisine: "Soup curry · $$", emoji: "🍲" },
    ],
    city: "Sapporo",
    country: "Japan",
    airport: CTS,
    travelStyle: "foodie",
    interests: ["food", "sports", "nature"],
    highlights: [
      "The Snow Festival's ice palaces",
      "Soup curry, Hokkaido's invention",
      "Ski fields twenty minutes from downtown",
    ],
  },
  {
    id: "nagoya-2d-castle-food",
    title: "Nagoya 2-Day Castle & Food Trip",
    coverImage: null,
    gradient: "from-slate-500 to-red-600",
    author: AI,
    days: 2,
    estimatedCost: 220,
    currency: "USD",
    tags: ["Culture", "Foodie", "City Break"],
    excerpt:
      "Two days of the Japan-between: Nagoya Castle's rebuilt palace, miso katsu, hitsumabushi eel and the Osu electric streets.",
    weatherTip:
      "March–May and October–November are mild and clear. The castle's palace interiors are best in soft morning light.",
    fullDays: [
      {
        day: 1,
        theme: "Castle & Cuisine",
        activities: [
          { time: "09:00", name: "Nagoya Castle & Hommaru Palace's gold screens", emoji: "🏯" },
          { time: "13:00", name: "Miso katsu lunch (Yabaton)", emoji: "🍗" },
          { time: "16:00", name: "Osu's temple lanes & electronics", emoji: "🛍️" },
          { time: "19:00", name: "Hitsumabushi eel dinner", emoji: "🐡" },
        ],
      },
      {
        day: 2,
        theme: "Industry & Day Trip",
        activities: [
          { time: "10:00", name: "Toyota Commemorative Museum", emoji: "🚗" },
          { time: "14:00", name: "Inuyama Castle's riverside day trip", emoji: "🛕" },
          { time: "18:00", name: "Nagoya Station's miso-nikomi udon farewell", emoji: "🍜" },
        ],
      },
    ],
    restaurants: [
      { name: "Yabaton", cuisine: "Miso katsu · $$", emoji: "🍗" },
      { name: "Atsuta Horaiken", cuisine: "Hitsumabushi eel · $$$", emoji: "🐡" },
      { name: "Komeda's Coffee", cuisine: "Breakfast institution · $", emoji: "☕" },
    ],
    city: "Nagoya",
    country: "Japan",
    airport: NGO,
    travelStyle: "cultural",
    interests: ["food", "history", "shopping"],
    highlights: [
      "Hommaru Palace's recreated gold",
      "Nagoya's three signature dishes",
      "Inuyama — Japan's oldest original castle",
    ],
  },
  {
    id: "nagasaki-2d-peace-history",
    title: "Nagasaki 2-Day Peace & History Trip",
    coverImage: null,
    gradient: "from-teal-500 to-indigo-700",
    author: AI,
    days: 2,
    estimatedCost: 190,
    currency: "USD",
    tags: ["History", "Culture", "Reflection"],
    excerpt:
      "Two days in the city where Japan met the world and must never forget: the Peace Park, Dejima's Dutch trade, and the hillside churches.",
    weatherTip:
      "March–May and October–November suit the hillside walking. The Peace Park is moving in any weather.",
    fullDays: [
      {
        day: 1,
        theme: "The Weight",
        activities: [
          { time: "09:00", name: "Nagasaki Peace Park & the Atomic Bomb Museum", emoji: "🕊️" },
          { time: "13:00", name: "Urakami Cathedral", emoji: "⛪" },
          { time: "16:00", name: "Nagasaki's terraced night view (one of the world's best)", emoji: "🌃" },
        ],
      },
      {
        day: 2,
        theme: "The Window",
        activities: [
          { time: "09:30", name: "Dejima's reconstructed Dutch trading post", emoji: "⛵" },
          { time: "12:00", name: "Champon lunch in Chinatown", emoji: "🍜" },
          { time: "14:30", name: "Glover Garden & Oura Cathedral", emoji: "🏛️" },
          { time: "18:00", name: "Shippoku-style farewell dinner", emoji: "🍲" },
        ],
      },
    ],
    restaurants: [
      { name: "Shikairou Chinese", cuisine: "Champon originators · $$", emoji: "🍜" },
      { name: "Yosso", cuisine: "Shippoku full-course · $$$", emoji: "🍲" },
      { name: "Café de L'Amitie", cuisine: "European-Nagasaki · $$", emoji: "☕" },
    ],
    city: "Nagasaki",
    country: "Japan",
    airport: NGS,
    travelStyle: "cultural",
    interests: ["history", "food"],
    highlights: [
      "The Peace Park's quiet gravity",
      "Dejima — the only gate to the world for 200 years",
      "The terraced night view over the harbor",
    ],
  },
  {
    id: "hiroshima-2d-peace-miyajima",
    title: "Hiroshima 2-Day Peace & Miyajima Trip",
    coverImage: null,
    gradient: "from-red-500 to-emerald-600",
    author: AI,
    days: 2,
    estimatedCost: 190,
    currency: "USD",
    tags: ["History", "Culture", "Nature"],
    excerpt:
      "Two days that belong on every Japan week: the Peace Memorial Park's riverside morning, okonomiyaki stacked for dinner, and Miyajima's floating torii the next day.",
    weatherTip:
      "March–May and October–November are ideal. Miyajima's torii 'floats' at high tide — check the tide tables.",
    fullDays: [
      {
        day: 1,
        theme: "Hiroshima",
        activities: [
          { time: "09:00", name: "Peace Memorial Park & Museum (allow the morning)", emoji: "🕊️" },
          { time: "14:00", name: "Hiroshima Castle & Shukkeien garden", emoji: "🏯" },
          { time: "18:00", name: "Okonomiyaki at Okonomimura", emoji: "🥞" },
        ],
      },
      {
        day: 2,
        theme: "Miyajima",
        activities: [
          { time: "08:30", name: "Ferry to Miyajima & the floating torii", emoji: "⛩️" },
          { time: "11:00", name: "Mount Misen's ropeway & views", emoji: "⛰️" },
          { time: "16:00", name: "Momiji manju & the shrine at high tide", emoji: "🍪" },
          { time: "18:30", name: "Return & airport or Shinkansen", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Okonomimura", cuisine: "Okonomiyaki floors · $", emoji: "🥞" },
      { name: "Kakiya", cuisine: "Grilled oysters · $$", emoji: "🦪" },
      { name: "Miyajima anago restaurants", cuisine: "Conger eel rice · $$", emoji: "🍚" },
    ],
    city: "Hiroshima",
    country: "Japan",
    airport: HIJ,
    travelStyle: "cultural",
    interests: ["history", "food", "nature"],
    highlights: [
      "The Peace Park, unhurried",
      "Miyajima's torii at high tide",
      "Okonomiyaki in its layered home",
    ],
  },
  {
    id: "kanazawa-2d-gardens-craft",
    title: "Kanazawa 2-Day Gardens & Craft Trip",
    coverImage: null,
    gradient: "from-amber-500 to-teal-700",
    author: AI,
    days: 2,
    estimatedCost: 200,
    currency: "USD",
    tags: ["Culture", "Gardens", "Crafts"],
    excerpt:
      "Two days in Japan's preserved castle town: Kenrokuen at opening, samurai lanes, geisha streets and gold-leaf everything.",
    weatherTip:
      "April–June and October–November are ideal. Winter's yukitsuri garden ropes are the connoisseur's photo.",
    fullDays: [
      {
        day: 1,
        theme: "Castle & Gardens",
        activities: [
          { time: "08:00", name: "Kenrokuen Garden at opening", emoji: "🏞️" },
          { time: "11:00", name: "Kanazawa Castle Park", emoji: "🏯" },
          { time: "14:00", name: "21st Century Museum's pool", emoji: "🏊" },
          { time: "18:00", name: "Omicho Market's seafood dinner", emoji: "🦀" },
        ],
      },
      {
        day: 2,
        theme: "Districts & Gold",
        activities: [
          { time: "09:00", name: "Nagamachi samurai lanes", emoji: "⚔️" },
          { time: "11:30", name: "Higashi Chaya geisha district", emoji: "🏮" },
          { time: "14:00", name: "Gold-leaf workshop & ice cream", emoji: "✨" },
          { time: "17:00", name: "Departure via Komatsu or the shinkansen", emoji: "🚄" },
        ],
      },
    ],
    restaurants: [
      { name: "Omicho Market counters", cuisine: "Kaisendon bowls · $$", emoji: "🦀" },
      { name: "Hachi-ban", cuisine: "Oden & local sake · $$", emoji: "🍢" },
      { name: "Gold-leaf cafés", cuisine: "Gilded ice cream · $", emoji: "🍨" },
    ],
    city: "Kanazawa",
    country: "Japan",
    airport: KMQ,
    travelStyle: "cultural",
    interests: ["history", "food", "museums"],
    highlights: [
      "Kenrokuen — Japan's garden art at its peak",
      "Higashi Chaya's preserved geisha lanes",
      "Gold leaf on everything, famously",
    ],
  },
  {
    id: "kobe-2d-beef-harbor",
    title: "Kobe 2-Day Beef & Harbor Trip",
    coverImage: null,
    gradient: "from-red-600 to-slate-700",
    author: AI,
    days: 2,
    estimatedCost: 220,
    currency: "USD",
    tags: ["Foodie", "City Break", "Nature"],
    excerpt:
      "Two days of Japan's port of beef: a teppanyaki lunch that solves the price problem, Kitano's western houses, and the mountain at the end of the street.",
    weatherTip:
      "March–May and October–November are ideal for the Rokko trails. Winter delivers the clearest harbor night views.",
    fullDays: [
      {
        day: 1,
        theme: "Beef & Harbor",
        activities: [
          { time: "11:30", name: "Kobe beef teppanyaki lunch (the smart price window)", emoji: "🥩" },
          { time: "14:00", name: "Kitano's ijinkan western houses", emoji: "🏡" },
          { time: "17:30", name: "Harborland & the Port Tower at dusk", emoji: "🌆" },
          { time: "19:30", name: "Nankin-machi Chinatown snacks", emoji: "🥟" },
        ],
      },
      {
        day: 2,
        theme: "The Mountain",
        activities: [
          { time: "09:00", name: "Nunobiki herb garden & ropeway", emoji: "🌿" },
          { time: "13:00", name: "Mt Rokko's alpine views & music box museum", emoji: "🎼" },
          { time: "17:00", name: "Arima Onsen's hot-spring close (optional)", emoji: "♨️" },
        ],
      },
    ],
    restaurants: [
      { name: "Steak Land Kobe", cuisine: "Beef teppanyaki · $$", emoji: "🥩" },
      { name: "Moria Wakasugi-ya", cuisine: "Premium Kobe beef · $$$$", emoji: "🏆" },
      { name: "Nankin-machi stalls", cuisine: "Street dumplings · $", emoji: "🥟" },
    ],
    city: "Kobe",
    country: "Japan",
    airport: UKB,
    travelStyle: "foodie",
    interests: ["food", "nature"],
    highlights: [
      "Real Kobe beef at lunch prices",
      "Harborland's night reflection",
      "Arima Onsen an hour up the mountain",
    ],
  },
  {
    id: "berlin-4d-history-culture",
    title: "Berlin 4-Day History & Culture Trip",
    coverImage: null,
    gradient: "from-slate-600 to-amber-500",
    author: AI,
    days: 4,
    estimatedCost: 520,
    currency: "EUR",
    tags: ["History", "Culture", "Nightlife"],
    excerpt:
      "Four days through Berlin's century: the Wall's trace, Museum Island's vaults, Kreuzberg's canals and one proper club night.",
    weatherTip:
      "May–September is terrace season. Berlin's museums and clubs run year-round; winter is grey but cheap.",
    fullDays: [
      {
        day: 1,
        theme: "The Wall & Mitte",
        activities: [
          { time: "09:30", name: "Bernauer Straße memorial & the death strip", emoji: "🧱" },
          { time: "13:00", name: "Museum Island's Pergamon collections", emoji: "🏺" },
          { time: "18:00", name: "Unter den Linden & Brandenburg Gate at dusk", emoji: "🏛️" },
        ],
      },
      {
        day: 2,
        theme: "The Reichstag & Kreuzberg",
        activities: [
          { time: "09:00", name: "Reichstag dome (free, booked ahead)", emoji: "🏛️" },
          { time: "12:30", name: "Kreuzberg's Markthalle Neun lunch", emoji: "🥙" },
          { time: "16:00", name: "Tempelhof's airport-runway park", emoji: "🛩️" },
          { time: "20:00", name: "Canal-side dinner & bars", emoji: "🍺" },
        ],
      },
      {
        day: 3,
        theme: "East Side & Art",
        activities: [
          { time: "10:00", name: "East Side Gallery's painted Wall", emoji: "🎨" },
          { time: "13:00", name: "Friedrichshain's Sunday flea market (if Sunday)", emoji: "🧺" },
          { time: "16:00", name: "Hamburger Bahnhof's modern art", emoji: "🖼️" },
          { time: "23:00", name: "One Berlin club night (door rules apply)", emoji: "🎧" },
        ],
      },
      {
        day: 4,
        theme: "Charlottenburg & Departure",
        activities: [
          { time: "10:00", name: "Charlottenburg Palace & the Ku'damm", emoji: "👑" },
          { time: "14:00", name: "Curry 591 verdict & airport", emoji: "🌭" },
        ],
      },
    ],
    restaurants: [
      { name: "Markthalle Neun", cuisine: "Street food hall · $$", emoji: "🥙" },
      { name: "Konnopke Imbiss", cuisine: "Currywurst legend · $", emoji: "🌭" },
      { name: "Katz Orange", cuisine: "Modern Berlin · $$$", emoji: "🍽️" },
    ],
    city: "Berlin",
    country: "Germany",
    airport: BER,
    travelStyle: "cultural",
    interests: ["history", "nightlife", "museums"],
    highlights: [
      "The Wall's trace, on foot and by mural",
      "Museum Island's antiquity vaults",
      "Tempelhof's runway as public park",
    ],
  },
  {
    id: "berlin-3d-weekend",
    title: "Berlin 3-Day Weekend",
    coverImage: null,
    gradient: "from-gray-600 to-yellow-500",
    author: AI,
    days: 3,
    estimatedCost: 390,
    currency: "EUR",
    tags: ["City Break", "Weekend", "History"],
    excerpt:
      "A long weekend of essentials: the Wall and the dome, Museum Island and Kreuzberg, and one long Sunday in the parks.",
    weatherTip:
      "May–September suits the park-heavy plan. Berlin weekends are casual — pack accordingly and bring cash for the markets.",
    fullDays: [
      {
        day: 1,
        theme: "Mitte Essentials",
        activities: [
          { time: "09:00", name: "Reichstag dome (booked) & the memorial", emoji: "🏛️" },
          { time: "13:00", name: "Museum Island highlights", emoji: "🏺" },
          { time: "19:00", name: "Hackescher Höfe dinner", emoji: "🍽️" },
        ],
      },
      {
        day: 2,
        theme: "Kreuzberg & the Gallery",
        activities: [
          { time: "10:00", name: "East Side Gallery's murals", emoji: "🎨" },
          { time: "13:30", name: "Markthalle Neun lunch & Bergmannkiez", emoji: "🥙" },
          { time: "17:00", name: "Tempelhof sunset on the runway", emoji: "🛩️" },
        ],
      },
      {
        day: 3,
        theme: "Sunday Slow",
        activities: [
          { time: "10:00", name: "Mauerpark flea market & karaoke", emoji: "🧺" },
          { time: "14:00", name: "Spree riverside walk", emoji: "🚶" },
          { time: "17:00", name: "Departure — cash spent, karma full", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Markthalle Neun", cuisine: "Food hall · $$", emoji: "🥙" },
      { name: "Mustafa's Gemüse Kebap", cuisine: "Kebap queue · $", emoji: "🌯" },
      { name: "Prater Garten", cuisine: "Beer garden · $$", emoji: "🍺" },
    ],
    city: "Berlin",
    country: "Germany",
    airport: BER,
    travelStyle: "active",
    interests: ["history", "nightlife", "food"],
    highlights: [
      "The essentials in three honest days",
      "Mauerpark's Sunday institution",
      "Beer-garden dinners as the norm",
    ],
  },
  {
    id: "munich-3d-beer-gardens",
    title: "Munich 3-Day Beer Gardens Trip",
    coverImage: null,
    gradient: "from-blue-600 to-emerald-600",
    author: AI,
    days: 3,
    estimatedCost: 450,
    currency: "EUR",
    tags: ["Foodie", "Culture", "Beer"],
    excerpt:
      "Three days of Bavaria's capital: the Englischer Garten's surf wave, six beer gardens, the Viktualienmarkt, and one Neuschwanstein day trip.",
    weatherTip:
      "May–September is beer-garden season — chestnut shade and cool evenings. Oktoberfest (late Sep) needs months of booking.",
    fullDays: [
      {
        day: 1,
        theme: "Center & Gardens",
        activities: [
          { time: "09:30", name: "Marienplatz & the Glockenspiel hour", emoji: "🏛️" },
          { time: "11:30", name: "Viktualienmarkt lunch & beer garden", emoji: "🥨" },
          { time: "15:00", name: "Englischer Garten's Eisbach surfers", emoji: "🌊" },
          { time: "18:30", name: "Chinesischer Turm beer garden", emoji: "🍺" },
        ],
      },
      {
        day: 2,
        theme: "Palaces & History",
        activities: [
          { time: "09:30", name: "Nymphenburg Palace & park", emoji: "👑" },
          { time: "14:00", name: "Residenz & the Cuvilliés Theatre", emoji: "🎭" },
          { time: "17:00", name: "Dachau memorial (sobering, essential)", emoji: "🕊️" },
        ],
      },
      {
        day: 3,
        theme: "Neuschwanstein Day Trip",
        activities: [
          { time: "08:00", name: "Train to Füssen & the fairytale castle", emoji: "🏰" },
          { time: "14:00", name: "Alpsee's lake walk", emoji: "🏔️" },
          { time: "19:00", name: "Farewell weisswurst & pretzel", emoji: "🥨" },
        ],
      },
    ],
    restaurants: [
      { name: "Chinesischer Turm", cuisine: "Grand beer garden · $$", emoji: "🍺" },
      { name: "Viktualienmarkt", cuisine: "Market lunch · $", emoji: "🥨" },
      { name: "Augustiner Keller", cuisine: "Monastery beers · $$", emoji: "🍻" },
    ],
    city: "Munich",
    country: "Germany",
    airport: MUC,
    travelStyle: "cultural",
    interests: ["food", "history", "nature"],
    highlights: [
      "The Eisbach surfers' river wave",
      "Beer gardens as the daily institution",
      "Neuschwanstein on the day trip",
    ],
  },
  {
    id: "frankfurt-2d-layover",
    title: "Frankfurt 2-Day Layover Trip",
    coverImage: null,
    gradient: "from-slate-600 to-sky-500",
    author: AI,
    days: 2,
    estimatedCost: 280,
    currency: "EUR",
    tags: ["City Break", "Layover", "Museums"],
    excerpt:
      "Turn the layover into a trip: the Römerberg square, the Städel's vaults, an apple-wine tavern evening and the Main Tower's skyline.",
    weatherTip:
      "May–September is the riverside season. Frankfurt's transit makes even a 12-hour layover productive.",
    fullDays: [
      {
        day: 1,
        theme: "Old Town & Skyline",
        activities: [
          { time: "10:00", name: "Römerberg's half-timbered square", emoji: "🏛️" },
          { time: "12:30", name: "Kleinmarkthalle's counters", emoji: "🥨" },
          { time: "16:00", name: "Main Tower's 200-meter view", emoji: "🌆" },
          { time: "19:00", name: "Sachsenhausen apple-wine tavern dinner", emoji: "🍷" },
        ],
      },
      {
        day: 2,
        theme: "Art & River",
        activities: [
          { time: "09:30", name: "Städel Museum's 700 years", emoji: "🖼️" },
          { time: "13:00", name: "Museumsufer riverside walk", emoji: "🚶" },
          { time: "16:00", name: "Back to the airport in 15 minutes", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Atschel", cuisine: "Apple-wine tavern · $$", emoji: "🍷" },
      { name: "Kleinmarkthalle", cuisine: "Market counters · $", emoji: "🥨" },
      { name: "Zarges", cuisine: "Frankfurt schnitzel · $$", emoji: "🍽️" },
    ],
    city: "Frankfurt",
    country: "Germany",
    airport: FRA,
    travelStyle: "cultural",
    interests: ["museums", "food"],
    highlights: [
      "The apple-wine tavern culture",
      "Main Tower's skyline against the old town",
      "Airport-to-altstadt in fifteen minutes",
    ],
  },
  {
    id: "milan-2d-design-food",
    title: "Milan 2-Day Design & Food Trip",
    coverImage: null,
    gradient: "from-gray-600 to-red-500",
    author: AI,
    days: 2,
    estimatedCost: 260,
    currency: "EUR",
    tags: ["Shopping", "Foodie", "Culture"],
    excerpt:
      "Two days of Italy's design capital: the Duomo's rooftops, the Last Supper (booked), Navigli aperitivo and the Quadrilatero's windows.",
    weatherTip:
      "April–June and September–October are ideal. August is hot and half-closed; design week (April) doubles the city's energy and its prices.",
    fullDays: [
      {
        day: 1,
        theme: "The Icons",
        activities: [
          { time: "09:00", name: "Duomo's rooftop terraces first", emoji: "⛪" },
          { time: "11:30", name: "Galleria & the Quadrilatero windows", emoji: "🛍️" },
          { time: "15:00", name: "The Last Supper (booked months out)", emoji: "🖼️" },
          { time: "19:00", name: "Navigli aperitivo along the canals", emoji: "🍹" },
        ],
      },
      {
        day: 2,
        theme: "Brera & Departure",
        activities: [
          { time: "09:30", name: "Pinacoteca di Brera", emoji: "🖼️" },
          { time: "12:30", name: "Risotto & osso buco lunch in Brera", emoji: "🍽️" },
          { time: "15:00", name: "Lake Como tease (45-min train) or airport", emoji: "🚄" },
        ],
      },
    ],
    restaurants: [
      { name: "Trattoria Milanese", cuisine: "Risotto classics · $$", emoji: "🍽️" },
      { name: "Mag Café", cuisine: "Navigli aperitivo · $$", emoji: "🍹" },
      { name: "Luini", cuisine: "Panzerotto institution · $", emoji: "🥟" },
    ],
    city: "Milan",
    country: "Italy",
    airport: MXP,
    travelStyle: "cultural",
    interests: ["shopping", "food", "museums"],
    highlights: [
      "The Duomo's rooftop before the queues",
      "The Last Supper's fifteen booked minutes",
      "Navigli at aperitivo hour",
    ],
  },
  {
    id: "naples-3d-pizza-history",
    title: "Naples 3-Day Pizza & History Trip",
    coverImage: null,
    gradient: "from-orange-600 to-slate-700",
    author: AI,
    days: 3,
    estimatedCost: 285,
    currency: "EUR",
    tags: ["Foodie", "History", "Culture"],
    excerpt:
      "Three days in Europe's rawest city: pizza at both shrines, Pompeii's frozen streets, the archaeology museum's originals, and Vesuvius' crater.",
    weatherTip:
      "April–June and September–October are ideal. Summer bakes; winter is mild and gloriously local.",
    fullDays: [
      {
        day: 1,
        theme: "Pizza Pilgrimage",
        activities: [
          { time: "12:00", name: "L'Antica Pizzeria da Michele's margherita", emoji: "🍕" },
          { time: "15:00", name: "Spanish Quarter & the Toledo stairways", emoji: "🚶" },
          { time: "19:30", name: "Sorbillo's second verdict", emoji: "🍕" },
        ],
      },
      {
        day: 2,
        theme: "Pompeii & Vesuvius",
        activities: [
          { time: "08:30", name: "Circumvesuviana to Pompeii's excavations", emoji: "🏛️" },
          { time: "15:00", name: "Vesuvius crater trail (booked shuttle)", emoji: "🌋" },
          { time: "19:00", name: "Seafront dinner at Mergellina", emoji: "🍤" },
        ],
      },
      {
        day: 3,
        theme: "Museum & Old Town",
        activities: [
          { time: "09:30", name: "National Archaeological Museum's Pompeii originals", emoji: "🏺" },
          { time: "13:00", name: "Naples Cathedral & the historic center", emoji: "⛪" },
          { time: "16:00", name: "Sfogliatella farewell & airport", emoji: "🥐" },
        ],
      },
    ],
    restaurants: [
      { name: "L'Antica Pizzeria da Michele", cuisine: "The margherita · $", emoji: "🍕" },
      { name: "Sorbillo", cuisine: "The rival · $", emoji: "🍕" },
      { name: "Trattoria da Nennella", cuisine: "Quarter institution · $$", emoji: "🍽️" },
    ],
    city: "Naples",
    country: "Italy",
    airport: NAP,
    travelStyle: "foodie",
    interests: ["food", "history"],
    highlights: [
      "Pizza at both of its shrines",
      "Pompeii with the museum's originals in mind",
      "Vesuvius' crater edge",
    ],
  },
  {
    id: "amalfi-coast-4d-coast",
    title: "Amalfi Coast 4-Day Coast Trip",
    coverImage: null,
    gradient: "from-rose-500 to-cyan-600",
    author: AI,
    days: 4,
    estimatedCost: 640,
    currency: "EUR",
    tags: ["Beaches", "Romance", "Nature"],
    excerpt:
      "Four cliff-hugging days: Positano's stacked houses, the Path of the Gods, Ravello's gardens and a Capri boat day.",
    weatherTip:
      "May–June and September–October are the coast's best — warm seas, open hotels, thinner roads. Buses are slow; boats are smarter.",
    fullDays: [
      {
        day: 1,
        theme: "Positano",
        activities: [
          { time: "12:00", name: "Arrive & the stacked-seaside view", emoji: "🏖️" },
          { time: "17:00", name: "Spiaggia Grande & Aperol hour", emoji: "🍹" },
          { time: "20:00", name: "Cliffside dinner", emoji: "🍋" },
        ],
      },
      {
        day: 2,
        theme: "Path of the Gods",
        activities: [
          { time: "08:30", name: "Bomerano to Nocelle cliff trail (shuttle up)", emoji: "🥾" },
          { time: "14:00", name: "Lemon granita in Nocelle", emoji: "🍋" },
          { time: "17:00", name: "Return by bus & swim", emoji: "🏊" },
        ],
      },
      {
        day: 3,
        theme: "Amalfi & Ravello",
        activities: [
          { time: "09:30", name: "Amalfi's Duomo & paper museum", emoji: "⛪" },
          { time: "14:00", name: "Ravello's Villa Rufolo & Cimbrone gardens", emoji: "🌺" },
          { time: "19:00", name: "Ristorante-with-a-view dinner", emoji: "🍽️" },
        ],
      },
      {
        day: 4,
        theme: "Capri by Boat",
        activities: [
          { time: "09:00", name: "Private or group boat around Capri", emoji: "⛵" },
          { time: "15:00", name: "Blue Grotto or Anacapri's Monte Solaro", emoji: "🚡" },
          { time: "19:00", name: "Farewell lemon dessert", emoji: "🍰" },
        ],
      },
    ],
    restaurants: [
      { name: "La Sponda", cuisine: "Positano candlelit · $$$$", emoji: "🕯️" },
      { name: "Da Vincenzo", cuisine: "Positano seafood · $$$", emoji: "🦐" },
      { name: "Pasticceria Pansa", cuisine: "Amalfi desserts · $", emoji: "🍰" },
    ],
    city: "Amalfi Coast",
    country: "Italy",
    airport: NAP,
    travelStyle: "relaxed",
    interests: ["beaches", "food", "nature"],
    highlights: [
      "The Path of the Gods' cliff trail",
      "Ravello's garden balconies",
      "Capri from the water",
    ],
  },
  {
    id: "bologna-2d-food",
    title: "Bologna 2-Day Food Trip",
    coverImage: null,
    gradient: "from-red-600 to-amber-500",
    author: AI,
    days: 2,
    estimatedCost: 220,
    currency: "EUR",
    tags: ["Foodie", "Culture", "Markets"],
    excerpt:
      "Two days in Italy's kitchen: the Quadrilatero's counters, fresh-pasta school, the Two Towers and a Modena balsamic pilgrimage.",
    weatherTip:
      "April–June and September–October are ideal. The porticoes shade even the summer visits.",
    fullDays: [
      {
        day: 1,
        theme: "The Kitchen",
        activities: [
          { time: "09:30", name: "Quadrilatero market-lane grazing", emoji: "🧺" },
          { time: "12:30", name: "Tagliatelle al ragù (never call it spaghetti bolognese)", emoji: "🍝" },
          { time: "16:00", name: "Fresh-pasta making class", emoji: "👩‍🍳" },
          { time: "20:00", name: "Osteria dinner in the university quarter", emoji: "🍷" },
        ],
      },
      {
        day: 2,
        theme: "Towers & Modena",
        activities: [
          { time: "09:00", name: "Climb the Two Towers", emoji: "🗼" },
          { time: "11:30", name: "Train to Modena: balsamic tasting & Osteria Francescana's town", emoji: "🍇" },
          { time: "17:00", name: "Return via Mortadella laboratorio", emoji: "🥓" },
        ],
      },
    ],
    restaurants: [
      { name: "Trattoria Anna Maria", cuisine: "Bologna institution · $$", emoji: "🍝" },
      { name: "Sfoglia Rina", cuisine: "Fresh pasta shop · $", emoji: "👩‍🍳" },
      { name: "Osteria dell'Orsa", cuisine: "Student classic · $", emoji: "🍷" },
    ],
    city: "Bologna",
    country: "Italy",
    airport: BLQ,
    travelStyle: "foodie",
    interests: ["food", "history"],
    highlights: [
      "The pasta class you'll repeat at home",
      "Modena's balsamic barrels",
      "Portico walks in any weather",
    ],
  },
  {
    id: "turin-2d-baroque-cafes",
    title: "Turin 2-Day Baroque & Cafés Trip",
    coverImage: null,
    gradient: "from-amber-600 to-slate-700",
    author: AI,
    days: 2,
    estimatedCost: 220,
    currency: "EUR",
    tags: ["Culture", "Foodie", "Museums"],
    excerpt:
      "Two days of Italy's understated capital: the Mole's cinema museum, Savoy palaces, vermouth counters and bicerin at the original café.",
    weatherTip:
      "April–June and September–October are mild. Winter suits the chocolate-and-café season best.",
    fullDays: [
      {
        day: 1,
        theme: "Palaces & the Mole",
        activities: [
          { time: "09:30", name: "Palazzo Reale & the royal armory", emoji: "👑" },
          { time: "13:00", name: "Bicerin & agnolotti lunch", emoji: "☕" },
          { time: "16:00", name: "Mole Antonelliana's cinema museum & lift", emoji: "🎬" },
          { time: "19:00", name: "Vermouth-and-tajarin dinner", emoji: "🍸" },
        ],
      },
      {
        day: 2,
        theme: "Piazzas & Chocolate",
        activities: [
          { time: "10:00", name: "Piazza San Carlo's chocolate counters", emoji: "🍫" },
          { time: "13:00", name: "Porta Palazzo market & the Quadrilatero", emoji: "🧺" },
          { time: "16:00", name: "Lingotto's rooftop test track", emoji: "🏎️" },
        ],
      },
    ],
    restaurants: [
      { name: "Caffè Al Bicerin", cuisine: "The original bicerin · $$", emoji: "☕" },
      { name: "Del Cambio", cuisine: "Historic grand dining · $$$", emoji: "🍽️" },
      { name: "Ostello Bello Torino", cuisine: "Piedmont sharing · $$", emoji: "🍷" },
    ],
    city: "Turin",
    country: "Italy",
    airport: TRN,
    travelStyle: "cultural",
    interests: ["museums", "food", "history"],
    highlights: [
      "Bicerin at its 1763 birthplace",
      "The Mole's dizzying cinema collection",
      "Vermouth where it was invented",
    ],
  },
  {
    id: "madrid-3d-art-tapas",
    title: "Madrid 3-Day Art & Tapas Trip",
    coverImage: null,
    gradient: "from-red-500 to-amber-500",
    author: AI,
    days: 3,
    estimatedCost: 360,
    currency: "EUR",
    tags: ["Museums", "Foodie", "Nightlife"],
    excerpt:
      "Three days of Spain's capital: the Prado's Velázquezes, Guernica's white room, Retiro's rowboats and tapas crawls that end after midnight.",
    weatherTip:
      "March–June and September–October are ideal. Summer bakes — tapas move outdoors only after sunset.",
    fullDays: [
      {
        day: 1,
        theme: "The Golden Triangle",
        activities: [
          { time: "09:00", name: "The Prado's Velázquez & Goya rooms", emoji: "🖼️" },
          { time: "14:00", name: "Retiro Park's Palacio de Cristal", emoji: "🌳" },
          { time: "18:00", name: "Reina Sofía's Guernica", emoji: "🎨" },
          { time: "21:30", name: "La Latina tapas crawl", emoji: "🍢" },
        ],
      },
      {
        day: 2,
        theme: "Royal & Market",
        activities: [
          { time: "10:00", name: "Royal Palace & the Armory", emoji: "👑" },
          { time: "13:00", name: "Mercado de San Miguel grazing", emoji: "🥘" },
          { time: "16:00", name: "Templo de Debod's sunset", emoji: "🌅" },
          { time: "21:00", name: "Cava Baja's tavern route", emoji: "🍷" },
        ],
      },
      {
        day: 3,
        theme: "Markets & Departure",
        activities: [
          { time: "10:00", name: "El Rastro flea market (Sundays) or Malasaña vintage", emoji: "🧺" },
          { time: "13:00", name: "Cocido madrileño lunch (the heavy one)", emoji: "🍲" },
          { time: "16:00", name: "Chocolate con churros & airport", emoji: "🥖" },
        ],
      },
    ],
    restaurants: [
      { name: "Casa Botín", cuisine: "The world's oldest restaurant · $$$", emoji: "🍖" },
      { name: "Taberna La Daniela", cuisine: "Cocido & tapas · $$", emoji: "🍲" },
      { name: "Mercado de San Miguel", cuisine: "Graze hall · $$", emoji: "🥘" },
    ],
    city: "Madrid",
    country: "Spain",
    airport: MAD,
    travelStyle: "cultural",
    interests: ["museums", "food", "nightlife"],
    highlights: [
      "Velázquez, Goya and Guernica in 48 hours",
      "Retiro's rowboats",
      "The tapas crawl that starts at 21:30",
    ],
  },
  {
    id: "madrid-4d-art-parks",
    title: "Madrid 4-Day Art & Parks Trip",
    coverImage: null,
    gradient: "from-green-500 to-red-500",
    author: AI,
    days: 4,
    estimatedCost: 480,
    currency: "EUR",
    tags: ["Museums", "Parks", "Culture"],
    excerpt:
      "Four days at Madrid's rhythm: the art vaults at their free hours, Retiro and Casa de Campo's green, Toledo's day trip and the terrace evenings.",
    weatherTip:
      "April–June and September–October make the park days sing. July–August shifts everything to mornings and evenings.",
    fullDays: [
      {
        day: 1,
        theme: "Prado & Retiro",
        activities: [
          { time: "09:00", name: "The Prado (free last two hours if budget-planned)", emoji: "🖼️" },
          { time: "14:00", name: "Retiro's rowboats & rose garden", emoji: "🚣" },
          { time: "20:00", name: "Terraza dinner in La Latina", emoji: "🍷" },
        ],
      },
      {
        day: 2,
        theme: "Sofía, Thyssen & Malasaña",
        activities: [
          { time: "10:00", name: "Reina Sofía's Guernica", emoji: "🎨" },
          { time: "13:00", name: "Thyssen-Bornemisza's spans", emoji: "🖼️" },
          { time: "17:00", name: "Malasaña's vintage & vermouth", emoji: "🍹" },
        ],
      },
      {
        day: 3,
        theme: "Toledo Day Trip",
        activities: [
          { time: "09:00", name: "AVE or bus to Toledo's hilltop lanes", emoji: "🕌" },
          { time: "13:00", name: "Cathedral & the El Greco trail", emoji: "⛪" },
          { time: "18:30", name: "Back for a late Madrid dinner", emoji: "🍽️" },
        ],
      },
      {
        day: 4,
        theme: "Green West & Farewell",
        activities: [
          { time: "10:00", name: "Casa de Campo's lake & cable car", emoji: "🚡" },
          { time: "14:00", name: "Templo de Debod picnic", emoji: "🧺" },
          { time: "17:00", name: "Airport", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Casa Julio", cuisine: "Huevos rotos · $$", emoji: "🍳" },
      { name: "Rosiqui", cuisine: "La Latina tavern · $$", emoji: "🍷" },
      { name: "Gofre", cuisine: "Malasaña waffles · $", emoji: "🧇" },
    ],
    city: "Madrid",
    country: "Spain",
    airport: MAD,
    travelStyle: "cultural",
    interests: ["museums", "nature", "food"],
    highlights: [
      "The Golden Triangle of art, paced over two days",
      "Toledo as the easy escape",
      "Retiro's boats and rose garden",
    ],
  },
  {
    id: "valencia-3d-paella-beach",
    title: "Valencia 3-Day Paella & Beach Trip",
    coverImage: null,
    gradient: "from-orange-500 to-teal-600",
    author: AI,
    days: 3,
    estimatedCost: 285,
    currency: "EUR",
    tags: ["Foodie", "Beaches", "Culture"],
    excerpt:
      "Three days in paella's birthplace: wood-fire valenciana in the huerta, Calatrava's sci-fi city, Turia gardens and Malvarrosa sand.",
    weatherTip:
      "March–June and September–October are ideal. Las Fallas (March) transforms the city if you can handle the noise.",
    fullDays: [
      {
        day: 1,
        theme: "Old Town & Market",
        activities: [
          { time: "09:30", name: "Central Market's ceramic dome", emoji: "🧺" },
          { time: "12:00", name: "Cathedral & the Holy Grail chapel", emoji: "⛪" },
          { time: "17:00", name: "Turia Gardens' stroll to the arts city", emoji: "🌳" },
          { time: "20:30", name: "Paella valenciana over wood fire", emoji: "🥘" },
        ],
      },
      {
        day: 2,
        theme: "City of Arts & Beach",
        activities: [
          { time: "10:00", name: "City of Arts and Sciences' Calatrava sweep", emoji: "🏗️" },
          { time: "14:00", name: "Malvarrosa Beach afternoon", emoji: "🏖️" },
          { time: "19:30", name: "Cabanyal's fishermen-quarter dinner", emoji: "🦐" },
        ],
      },
      {
        day: 3,
        theme: "Albufera & Farewell",
        activities: [
          { time: "10:00", name: "Albufera lake's rice fields & boat ride", emoji: "🛶" },
          { time: "15:00", name: "Horchata & fartons in the old quarter", emoji: "🥛" },
          { time: "17:30", name: "Airport", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Casa Carmela", cuisine: "Wood-fire paella · $$", emoji: "🥘" },
      { name: "La Pepica", cuisine: "Hemingway's table · $$", emoji: "🦐" },
      { name: "Horchatería Daniel", cuisine: "Horchata house · $", emoji: "🥛" },
    ],
    city: "Valencia",
    country: "Spain",
    airport: VLC,
    travelStyle: "foodie",
    interests: ["food", "beaches", "museums"],
    highlights: [
      "Paella where paella was born",
      "The Albufera's rice-field sunset",
      "Turia's nine-kilometer garden loop",
    ],
  },
  {
    id: "malaga-3d-museums-coast",
    title: "Málaga 3-Day Museums & Coast Trip",
    coverImage: null,
    gradient: "from-sky-500 to-orange-500",
    author: AI,
    days: 3,
    estimatedCost: 300,
    currency: "EUR",
    tags: ["Museums", "Beaches", "Culture"],
    excerpt:
      "Three days in Picasso's city: his museum in his birthplace, the Alcazaba's Moorish walls, rooftop vermut and a Caminito del Rey day.",
    weatherTip:
      "March–June and September–October are ideal; Caminito tickets sell out weeks ahead in every season.",
    fullDays: [
      {
        day: 1,
        theme: "Picasso & the Old Town",
        activities: [
          { time: "10:00", name: "Museo Picasso Málaga", emoji: "🖼️" },
          { time: "13:00", name: "Atarazanas Market lunch", emoji: "🧺" },
          { time: "17:00", name: "Alcazaba & Roman theatre", emoji: "🕌" },
          { time: "20:00", name: "Rooftop vermut hour", emoji: "🍹" },
        ],
      },
      {
        day: 2,
        theme: "Caminito del Rey",
        activities: [
          { time: "08:30", name: "The pinned walkway's gorge (booked weeks out)", emoji: "🥾" },
          { time: "16:00", name: "Beach & espetos (sardine skewers)", emoji: "🐟" },
        ],
      },
      {
        day: 3,
        theme: "Thyssen & Departure",
        activities: [
          { time: "10:00", name: "Carmen Thyssen's Andalusian collection", emoji: "🖼️" },
          { time: "13:00", name: "Malagueta beach stroll", emoji: "🏖️" },
          { time: "16:00", name: "Airport — 20 minutes out", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "El Pimpi", cuisine: "Málaga institution · $$", emoji: "🍷" },
      { name: "Los Mellizos", cuisine: "Espetos & seafood · $$", emoji: "🐟" },
      { name: "Casa Aranda", cuisine: "Churros since 1932 · $", emoji: "🍩" },
    ],
    city: "Malaga",
    country: "Spain",
    airport: AGP,
    travelStyle: "cultural",
    interests: ["museums", "food", "beaches"],
    highlights: [
      "Picasso in his birthplace",
      "Caminito del Rey's pinned path",
      "Espetos on the beach at lunch",
    ],
  },
  {
    id: "granada-3d-alhambra",
    title: "Granada 3-Day Alhambra Trip",
    coverImage: null,
    gradient: "from-amber-600 to-red-700",
    author: AI,
    days: 3,
    estimatedCost: 270,
    currency: "EUR",
    tags: ["History", "Culture", "Foodie"],
    excerpt:
      "Three days under the Alhambra: the Nasrid palaces at their booked hour, Albaicín miradors, Sacromonte flamenco and free tapas nightly.",
    weatherTip:
      "March–June and September–November are ideal. Alhambra tickets sell out weeks ahead — book first, then plan.",
    fullDays: [
      {
        day: 1,
        theme: "The Alhambra",
        activities: [
          { time: "08:30", name: "Nasrid Palaces at their booked slot", emoji: "🕌" },
          { time: "12:00", name: "Generalife gardens", emoji: "🌺" },
          { time: "17:00", name: "Albaicín's Mirador de San Nicolás at sunset", emoji: "🌅" },
          { time: "21:00", name: "Tapas crawl (tapas come free here)", emoji: "🍢" },
        ],
      },
      {
        day: 2,
        theme: "Albaicín & Sacromonte",
        activities: [
          { time: "10:00", name: "The Albaicín's lanes & Dar al-Horra", emoji: "🤍" },
          { time: "14:00", name: "Cathedral & the Royal Chapel", emoji: "⛪" },
          { time: "21:00", name: "Sacromonte cave flamenco", emoji: "💃" },
        ],
      },
      {
        day: 3,
        theme: "Sierra & Farewell",
        activities: [
          { time: "09:30", name: "Sierra Nevada foothills or the Arab baths", emoji: "♨️" },
          { time: "14:00", name: "Final tapas & airport", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Bodegas Castañeda", cuisine: "Free-tapas institution · $", emoji: "🍢" },
      { name: "Restaurante Chikito", cuisine: "Café de las columnas · $$", emoji: "🍽️" },
      { name: "Carmen de Aben Humeya", cuisine: "Garden dining · $$$", emoji: "🌺" },
    ],
    city: "Granada",
    country: "Spain",
    airport: GRX,
    travelStyle: "cultural",
    interests: ["history", "food", "nightlife"],
    highlights: [
      "The Nasrid Palaces' booked hour",
      "San Nicolás' sunset over the red fortress",
      "Tapas that arrive unasked",
    ],
  },
  {
    id: "porto-3d-river-port",
    title: "Porto 3-Day River & Port Trip",
    coverImage: null,
    gradient: "from-indigo-600 to-amber-500",
    author: AI,
    days: 3,
    estimatedCost: 285,
    currency: "EUR",
    tags: ["Culture", "Foodie", "Wine"],
    excerpt:
      "Three days on the Douro: the Dom Luís bridge's views, Gaia's port lodges, Livraria Lello's stairs and a river-valley train day.",
    weatherTip:
      "April–June and September–October are mild. The Douro Valley train is glorious in every season.",
    fullDays: [
      {
        day: 1,
        theme: "Ribeira & Bridges",
        activities: [
          { time: "10:00", name: "Ribeira's riverfront & Dom Luís I's top deck", emoji: "🌉" },
          { time: "13:00", name: "Francesinha lunch (bring your appetite)", emoji: "🥪" },
          { time: "16:00", name: "São Bento station's tile hall & Clérigos tower", emoji: "🚉" },
          { time: "19:30", name: "Gaia's port lodges at sunset", emoji: "🍷" },
        ],
      },
      {
        day: 2,
        theme: "Books & Tiles",
        activities: [
          { time: "09:30", name: "Livraria Lello (timed ticket)", emoji: "📚" },
          { time: "12:00", name: "Cedofeita's galleries & cafés", emoji: "☕" },
          { time: "16:00", name: "Foz do Douro's ocean end & lighthouse", emoji: "🌊" },
        ],
      },
      {
        day: 3,
        theme: "Douro Valley Day",
        activities: [
          { time: "08:30", name: "Train up the river to Pinhão's vineyard station", emoji: "🚆" },
          { time: "13:30", name: "Quinta tasting on the terraces", emoji: "🍇" },
          { time: "19:00", name: "Farewell tripas or seafood", emoji: "🍲" },
        ],
      },
    ],
    restaurants: [
      { name: "Café Santiago", cuisine: "Francesinha home · $$", emoji: "🥪" },
      { name: "Cantina 32", cuisine: "Modern Portuguese · $$", emoji: "🍷" },
      { name: "DeCastro Gaia", cuisine: "Cellar-view dining · $$$", emoji: "🍇" },
    ],
    city: "Porto",
    country: "Portugal",
    airport: OPO,
    travelStyle: "cultural",
    interests: ["food", "history", "nature"],
    highlights: [
      "Port lodges across the river at sunset",
      "Livraria Lello's staircase (booked)",
      "The Douro line to Pinhão",
    ],
  },
  {
    id: "brussels-2d-food-beer",
    title: "Brussels 2-Day Food & Beer Trip",
    coverImage: null,
    gradient: "from-amber-500 to-slate-600",
    author: AI,
    days: 2,
    estimatedCost: 280,
    currency: "EUR",
    tags: ["Foodie", "Beer", "Culture"],
    excerpt:
      "Two days of the standards: frites and waffles, Cantillon's lambic, Horta's art nouveau and the Grand-Place's gilded drama.",
    weatherTip:
      "May–September is terrace season. The Grand-Place is magnificent in rain too — which Brussels supplies.",
    fullDays: [
      {
        day: 1,
        theme: "The Center",
        activities: [
          { time: "09:30", name: "Grand-Place's guildhalls & Manneken", emoji: "🏛️" },
          { time: "12:00", name: "Frites at Maison Antoine & waffle stop", emoji: "🍟" },
          { time: "15:00", name: "Cantillon's working lambic brewery", emoji: "🍺" },
          { time: "19:30", name: "Belgian classics dinner: stoofvlees & beer", emoji: "🍲" },
        ],
      },
      {
        day: 2,
        theme: "Art Nouveau & Comics",
        activities: [
          { time: "10:00", name: "Horta Museum's art-nouveau townhouse", emoji: "🏡" },
          { time: "12:30", name: "Comic-strip murals & the comics museum", emoji: "🎨" },
          { time: "16:00", name: "Delirium's 2,000-bottle list (or a quiet café)", emoji: "🍻" },
          { time: "18:30", name: "Departure — waffle boxes secured", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Chez Léon", cuisine: "Moules-frites institution · $$", emoji: "🦪" },
      { name: "Café Georgette", cuisine: "Frites & beer · $", emoji: "🍟" },
      { name: "Le Cirio", cuisine: "1902 café grandeur · $$", emoji: "☕" },
    ],
    city: "Brussels",
    country: "Belgium",
    airport: BRU,
    travelStyle: "foodie",
    interests: ["food", "history", "nightlife"],
    highlights: [
      "Cantillon's living lambic brewery",
      "Horta's art-nouveau interiors",
      "The frites standard, verified personally",
    ],
  },
  {
    id: "stockholm-3d-islands-design",
    title: "Stockholm 3-Day Islands & Design Trip",
    coverImage: null,
    gradient: "from-sky-500 to-blue-700",
    author: AI,
    days: 3,
    estimatedCost: 495,
    currency: "EUR",
    tags: ["Museums", "Design", "Nature"],
    excerpt:
      "Three days across the fourteen islands: the Vasa's warship, Gamla Stan's ochre lanes, Djurgården's museums and an archipelago ferry.",
    weatherTip:
      "May–August's light makes the archipelago days magic. Winter is dark but hyggelig — museums and glögg carry it.",
    fullDays: [
      {
        day: 1,
        theme: "Gamla Stan & the Vasa",
        activities: [
          { time: "09:30", name: "The Vasa Museum's 1628 warship", emoji: "⛵" },
          { time: "13:00", name: "Gamla Stan's lanes & the royal palace", emoji: "🏰" },
          { time: "18:00", name: "Södermalm's viewpoint & dinner", emoji: "🌆" },
        ],
      },
      {
        day: 2,
        theme: "Djurgården & Design",
        activities: [
          { time: "10:00", name: "Skansen's open-air history or ABBA Museum", emoji: "🎻" },
          { time: "14:00", name: "Rosendals garden café fika", emoji: "🧁" },
          { time: "17:00", name: "Norrmalm's design stores", emoji: "🛋️" },
        ],
      },
      {
        day: 3,
        theme: "Archipelago Day",
        activities: [
          { time: "09:00", name: "Waxholmsbolaget ferry to Vaxholm", emoji: "⛴️" },
          { time: "15:00", name: "Return for a farewell smörgåsbord", emoji: "🥪" },
        ],
      },
    ],
    restaurants: [
      { name: "Traditions", cuisine: "Swedish classics · $$", emoji: "🥪" },
      { name: "Rosendals Trädgård", cuisine: "Garden fika · $$", emoji: "🧁" },
      { name: "Pelikan", cuisine: "Södermalm institution · $$", emoji: "🍺" },
    ],
    city: "Stockholm",
    country: "Sweden",
    airport: ARN,
    travelStyle: "cultural",
    interests: ["museums", "nature", "food"],
    highlights: [
      "The Vasa — a warship that sank and survived",
      "The archipelago ferry hour",
      "Fika as a twice-daily law",
    ],
  },
  {
    id: "oslo-2d-fjord-modern",
    title: "Oslo 2-Day Fjord & Modern Trip",
    coverImage: null,
    gradient: "from-teal-500 to-indigo-700",
    author: AI,
    days: 2,
    estimatedCost: 350,
    currency: "EUR",
    tags: ["Museums", "Nature", "Culture"],
    excerpt:
      "Two days of Norway's waterfront capital: the opera roof, Vigeland's sculpture army, Munch's scream and a fjord sauna.",
    weatherTip:
      "May–August for the fjord swims and rooftops. Winter brings the ski-jump glow and darkness by four.",
    fullDays: [
      {
        day: 1,
        theme: "The Waterfront",
        activities: [
          { time: "09:30", name: "Opera House roof climb", emoji: "🏛️" },
          { time: "12:00", name: "Munch Museum & the new National Gallery", emoji: "🖼️" },
          { time: "17:00", name: "Fjord sauna & dip (year-round)", emoji: "🧖" },
          { time: "20:00", name: "Aker Brygge seafood dinner", emoji: "🦐" },
        ],
      },
      {
        day: 2,
        theme: "Sculptures & Islands",
        activities: [
          { time: "09:30", name: "Vigeland Sculpture Park", emoji: "🗿" },
          { time: "13:00", name: "Bygdøy's Fram & Kon-Tiki museums", emoji: "⛵" },
          { time: "16:30", name: "Island ferry or Holmenkollen's jump view", emoji: "⛷️" },
        ],
      },
    ],
    restaurants: [
      { name: "Lofoten Fiskerestaurant", cuisine: "Fjord seafood · $$$", emoji: "🦐" },
      { name: "Mathallen Oslo", cuisine: "Food hall · $$", emoji: "🧺" },
      { name: "Kaffebrenneriet", cuisine: "Nordic coffee · $$", emoji: "☕" },
    ],
    city: "Oslo",
    country: "Norway",
    airport: OSL,
    travelStyle: "cultural",
    interests: ["museums", "nature", "food"],
    highlights: [
      "The opera roof as the city's living room",
      "Vigeland's monolith",
      "A fjord sauna, winter included",
    ],
  },
  {
    id: "reykjavik-4d-golden-circle",
    title: "Reykjavík 4-Day Golden Circle Trip",
    coverImage: null,
    gradient: "from-indigo-500 to-cyan-500",
    author: AI,
    days: 4,
    estimatedCost: 720,
    currency: "EUR",
    tags: ["Nature", "Adventure", "Geothermal"],
    excerpt:
      "Four days from the world's northernmost capital: the Golden Circle's rifts and geysers, a lagoon soak, whale watching and the aurora hunt.",
    weatherTip:
      "June–August for open roads and light; September–March for auroras and ice caves. Weather rewrites plans hourly — stay flexible.",
    fullDays: [
      {
        day: 1,
        theme: "Reykjavík & Blue Lagoon",
        activities: [
          { time: "11:00", name: "Hallgrímskirkja & the harbor", emoji: "⛪" },
          { time: "15:00", name: "Blue Lagoon or Sky Lagoon soak", emoji: "♨️" },
          { time: "19:30", name: "Icelandic lamb & skyr dessert", emoji: "🍲" },
        ],
      },
      {
        day: 2,
        theme: "The Golden Circle",
        activities: [
          { time: "09:00", name: "Þingvellir's tectonic rift", emoji: "🪨" },
          { time: "12:00", name: "Geysir & Strokkur's eruptions", emoji: "🌋" },
          { time: "15:00", name: "Gullfoss' double waterfall", emoji: "💦" },
        ],
      },
      {
        day: 3,
        theme: "Whales & the South Shore",
        activities: [
          { time: "09:00", name: "Whale watching from the old harbor", emoji: "🐋" },
          { time: "14:00", name: "Seljalandsfoss & Reynisfjara's black sand", emoji: "🖤" },
        ],
      },
      {
        day: 4,
        theme: "Aurora or Farewell",
        activities: [
          { time: "10:00", name: "National Museum & shopping street", emoji: "🧶" },
          { time: "21:00", name: "Aurora hunt (Sep–Mar) or midnight sun walk (Jun–Aug)", emoji: "🌌" },
        ],
      },
    ],
    restaurants: [
      { name: "Sægreifinn (Sea Baron)", cuisine: "Lobster soup · $$", emoji: "🦞" },
      { name: "Dill", cuisine: "New Nordic · $$$$", emoji: "🌿" },
      { name: "Bæjarins Beztu", cuisine: "The famous hot dog · $", emoji: "🌭" },
    ],
    city: "Reykjavik",
    country: "Iceland",
    airport: KEF,
    travelStyle: "adventure",
    interests: ["nature", "food"],
    highlights: [
      "The Golden Circle's geology class",
      "A lagoon soak in geothermal weather",
      "The aurora, if the sky cooperates",
    ],
  },
  {
    id: "dublin-3d-literary-pubs",
    title: "Dublin 3-Day Literary & Pubs Trip",
    coverImage: null,
    gradient: "from-green-600 to-amber-600",
    author: AI,
    days: 3,
    estimatedCost: 420,
    currency: "EUR",
    tags: ["Culture", "Nightlife", "Literature"],
    excerpt:
      "Three days in the city of storytellers: Trinity's Long Room, the Guinness gravity bar, Kilmainham's history and the pubs where the words were written.",
    weatherTip:
      "May–September is the mildest stretch. The pubs don't care about weather — neither should you.",
    fullDays: [
      {
        day: 1,
        theme: "Trinity & Temple Bar",
        activities: [
          { time: "09:30", name: "Trinity College & the Book of Kells", emoji: "📚" },
          { time: "13:00", name: "Grafton Street & St Stephen's Green", emoji: "🌳" },
          { time: "18:00", name: "Temple Bar (then the better pubs beyond)", emoji: "🍺" },
        ],
      },
      {
        day: 2,
        theme: "Guinness & History",
        activities: [
          { time: "10:00", name: "Guinness Storehouse & the Gravity Bar", emoji: "🍻" },
          { time: "14:00", name: "Kilmainham Gaol", emoji: "🕊️" },
          { time: "19:00", name: " trad session in a listening pub", emoji: "🎻" },
        ],
      },
      {
        day: 3,
        theme: "Literary & Farewell",
        activities: [
          { time: "10:00", name: "Dublin Writers Museum or Joyce's pages", emoji: "✒️" },
          { time: "13:00", name: "Molly Malone & the Georgian doors", emoji: "🚪" },
          { time: "16:00", name: "One last properly pulled pint", emoji: "🍺" },
        ],
      },
    ],
    restaurants: [
      { name: "The Brazen Head", cuisine: "Ireland's oldest pub · $$", emoji: "🍺" },
      { name: "The Woollen Mills", cuisine: "Modern Irish · $$", emoji: "🍽️" },
      { name: "Bewley's", cuisine: "Dublin institution · $$", emoji: "☕" },
    ],
    city: "Dublin",
    country: "Ireland",
    airport: DUB,
    travelStyle: "cultural",
    interests: ["nightlife", "history", "food"],
    highlights: [
      "The Long Room's 200,000 oldest books",
      "A trad session in a listening pub",
      "Guinness from the source floor",
    ],
  },
  {
    id: "dubrovnik-3d-walls-islands",
    title: "Dubrovnik 3-Day Walls & Islands Trip",
    coverImage: null,
    gradient: "from-orange-500 to-blue-600",
    author: AI,
    days: 3,
    estimatedCost: 360,
    currency: "EUR",
    tags: ["History", "Beaches", "Islands"],
    excerpt:
      "Three days in the walled pearl: the walls at 8am, Lokrum's peacocks, a kayak around the fortifications and the cable car's sunset.",
    weatherTip:
      "May–June and September–October dodge the cruise crush. The wall walk needs an early start in every season.",
    fullDays: [
      {
        day: 1,
        theme: "The Walls",
        activities: [
          { time: "08:00", name: "The city wall circuit at opening", emoji: "🏰" },
          { time: "12:00", name: "Old Town's lanes & the cathedral", emoji: "⛪" },
          { time: "17:00", name: "Buža cliff bar above the sea", emoji: "🍹" },
        ],
      },
      {
        day: 2,
        theme: "Lokrum & Kayaks",
        activities: [
          { time: "09:30", name: "Lokrum Island's gardens & peacocks", emoji: "🦚" },
          { time: "16:00", name: "Sea-kayak around the walls at golden hour", emoji: "🛶" },
        ],
      },
      {
        day: 3,
        theme: "Srđ & Elaphiti",
        activities: [
          { time: "09:00", name: "Cable car to Mount Srđ's war museum", emoji: "🚡" },
          { time: "13:00", name: "Banje Beach swim with old-town views", emoji: "🏖️" },
          { time: "17:00", name: "Farewell seafood in the old port", emoji: "🦐" },
        ],
      },
    ],
    restaurants: [
      { name: "Proto", cuisine: "Old-town seafood · $$$", emoji: "🦐" },
      { name: "Bowa (Lokrum-adjacent)", cuisine: "Beach club · $$$", emoji: "🍹" },
      { name: "Soul Caffe & snack lanes", cuisine: "Quick bites · $", emoji: "🥙" },
    ],
    city: "Dubrovnik",
    country: "Croatia",
    airport: DBV,
    travelStyle: "cultural",
    interests: ["history", "beaches", "nature"],
    highlights: [
      "The wall circuit before the heat",
      "Kayaking under the fortifications",
      "Mount Srđ's sunset terrace",
    ],
  },
  {
    id: "santorini-3d-caldera",
    title: "Santorini 3-Day Caldera Trip",
    coverImage: null,
    gradient: "from-blue-500 to-slate-200",
    author: AI,
    days: 3,
    estimatedCost: 540,
    currency: "EUR",
    tags: ["Beaches", "Romance", "Sunsets"],
    excerpt:
      "Three days on the caldera rim: Oia's sunset, the Fira-to-Oia cliff walk, Akrotiri's buried city and a volcanic-wine afternoon.",
    weatherTip:
      "May–June and September–early October are the connoisseur's window — warm, open, and less wind than August.",
    fullDays: [
      {
        day: 1,
        theme: "Fira & the Caldera",
        activities: [
          { time: "11:00", name: "Fira's rim walk & cable-car view", emoji: "🤍" },
          { time: "16:00", name: "Caldera-edge aperitif", emoji: "🍹" },
          { time: "19:30", name: "First sunset (they're all good)", emoji: "🌅" },
        ],
      },
      {
        day: 2,
        theme: "The Cliff Walk & Oia",
        activities: [
          { time: "08:30", name: "Fira-to-Oia walk (3 hours, windiest in the middle)", emoji: "🥾" },
          { time: "13:00", name: "Oia's blue domes & lazy lunch", emoji: "📸" },
          { time: "19:00", name: "The famous Oia sunset, claimed early", emoji: "🌇" },
        ],
      },
      {
        day: 3,
        theme: "Akrotiri & Wine",
        activities: [
          { time: "09:30", name: "Akrotiri's Bronze-Age city", emoji: "🏺" },
          { time: "12:30", name: "Red Beach & the volcanic coves", emoji: "🏖️" },
          { time: "16:00", name: "Assyrtiko tasting at a caldera winery", emoji: "🍷" },
        ],
      },
    ],
    restaurants: [
      { name: "Metaxy Mas", cuisine: "Local tavern favorite · $$", emoji: "🍽️" },
      { name: "Lycabettus", cuisine: "Cliff-edge dining · $$$$", emoji: "🌅" },
      { name: "Lucky's Souvlaki", cuisine: "Fira quick fix · $", emoji: "🥙" },
    ],
    city: "Santorini",
    country: "Greece",
    airport: JTR,
    travelStyle: "relaxed",
    interests: ["beaches", "food", "history"],
    highlights: [
      "The Fira–Oia caldera walk",
      "Akrotiri's ash-preserved streets",
      "Assyrtiko where the volcano grew it",
    ],
  },
];

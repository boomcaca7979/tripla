import type { Airport } from "@/types/flight";
import type { RawTripInput } from "./trips-extended-a";

// Extended trips, batch B — Europe, Italy, and second-tier city trips.
// estimatedCost follows src/data/destinations.ts budgetPerDay × days at the
// mid tier, in the destination's planning currency where the /travel-budget
// pages use one (EUR/GBP/SGD), USD otherwise.

const AI = { kind: "ai" as const, name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" };

const CDG: Airport = {
  iata: "CDG", icao: "LFPG", name: "Charles de Gaulle Airport", city: "Paris", country: "France",
  timezone: "Europe/Paris", latitude: 49.0097, longitude: 2.5479,
};
const LHR: Airport = {
  iata: "LHR", icao: "EGLL", name: "London Heathrow Airport", city: "London", country: "United Kingdom",
  timezone: "Europe/London", latitude: 51.47, longitude: -0.4543,
};
const FCO: Airport = {
  iata: "FCO", icao: "LIRF", name: "Leonardo da Vinci–Fiumicino Airport", city: "Rome", country: "Italy",
  timezone: "Europe/Rome", latitude: 41.8003, longitude: 12.2389,
};
const BCN: Airport = {
  iata: "BCN", icao: "LEBL", name: "Barcelona–El Prat Airport", city: "Barcelona", country: "Spain",
  timezone: "Europe/Madrid", latitude: 41.2974, longitude: 2.0833,
};
const LIS: Airport = {
  iata: "LIS", icao: "LPPT", name: "Humberto Delgado Airport", city: "Lisbon", country: "Portugal",
  timezone: "Europe/Lisbon", latitude: 38.7742, longitude: -9.1342,
};
const BUD: Airport = {
  iata: "BUD", icao: "LHBP", name: "Budapest Ferenc Liszt International Airport", city: "Budapest", country: "Hungary",
  timezone: "Europe/Budapest", latitude: 47.4369, longitude: 19.2556,
};
const VCE: Airport = {
  iata: "VCE", icao: "LIPZ", name: "Venice Marco Polo Airport", city: "Venice", country: "Italy",
  timezone: "Europe/Rome", latitude: 45.5053, longitude: 12.3519,
};
const ATH: Airport = {
  iata: "ATH", icao: "LGAV", name: "Athens Eleftherios Venizelos Airport", city: "Athens", country: "Greece",
  timezone: "Europe/Athens", latitude: 37.9364, longitude: 23.9445,
};
const JFK: Airport = {
  iata: "JFK", icao: "KJFK", name: "John F. Kennedy International Airport", city: "New York", country: "USA",
  timezone: "America/New_York", latitude: 40.6413, longitude: -73.7781,
};
const DXB: Airport = {
  iata: "DXB", icao: "OMDB", name: "Dubai International Airport", city: "Dubai", country: "UAE",
  timezone: "Asia/Dubai", latitude: 25.2532, longitude: 55.3657,
};
const AMS: Airport = {
  iata: "AMS", icao: "EHAM", name: "Amsterdam Airport Schiphol", city: "Amsterdam", country: "Netherlands",
  timezone: "Europe/Amsterdam", latitude: 52.3105, longitude: 4.7683,
};
const IST: Airport = {
  iata: "IST", icao: "LTFM", name: "Istanbul Airport", city: "Istanbul", country: "Turkey",
  timezone: "Europe/Istanbul", latitude: 41.2753, longitude: 28.7519,
};
const MEL: Airport = {
  iata: "MEL", icao: "YMML", name: "Melbourne Airport", city: "Melbourne", country: "Australia",
  timezone: "Australia/Melbourne", latitude: -37.669, longitude: 144.841,
};
const SYD: Airport = {
  iata: "SYD", icao: "YSSY", name: "Sydney Kingsford Smith Airport", city: "Sydney", country: "Australia",
  timezone: "Australia/Sydney", latitude: -33.9399, longitude: 151.1753,
};
const SGN: Airport = {
  iata: "SGN", icao: "VVTS", name: "Tan Son Nhat International Airport", city: "Ho Chi Minh City", country: "Vietnam",
  timezone: "Asia/Ho_Chi_Minh", latitude: 10.8188, longitude: 106.8069,
};
const KUL: Airport = {
  iata: "KUL", icao: "WMKK", name: "Kuala Lumpur International Airport", city: "Kuala Lumpur", country: "Malaysia",
  timezone: "Asia/Kuala_Lumpur", latitude: 2.7456, longitude: 101.7099,
};

export const EXTENDED_TRIPS_B: RawTripInput[] = [
  {
    id: "europe-7d-first-timer",
    title: "Europe 7-Day First Timer: Paris & Rome",
    coverImage: null,
    gradient: "from-blue-600 to-amber-500",
    author: AI,
    days: 7,
    estimatedCost: 1000,
    currency: "EUR",
    tags: ["Multi-City", "Culture", "Classic"],
    excerpt:
      "The proven first Europe trip: four Paris nights, three Rome, one short flight between — two cities done properly instead of five done badly.",
    weatherTip:
      "April–June and September–October flatter both cities. Book intra-Europe flights and trains when you book the trip — prices only climb.",
    fullDays: [
      {
        day: 1,
        theme: "Paris — Islands & Louvre",
        activities: [
          { time: "09:00", name: "Louvre at first entry", emoji: "🖼️" },
          { time: "13:00", name: "Sainte-Chapelle & the Île de la Cité", emoji: "⛪" },
          { time: "20:00", name: "Saint-Germain bistro dinner", emoji: "🍷" },
        ],
      },
      {
        day: 2,
        theme: "Paris — Montmartre & Marais",
        activities: [
          { time: "09:00", name: "Sacré-Cœur & the butte's lanes", emoji: "🎨" },
          { time: "15:00", name: "Place des Vosges & the Marais", emoji: "🛍️" },
          { time: "20:00", name: "Marais bistro", emoji: "🥖" },
        ],
      },
      {
        day: 3,
        theme: "Paris — Grand Axis or Versailles",
        activities: [
          { time: "10:00", name: "Tuileries to Trocadéro", emoji: "🌳" },
          { time: "18:00", name: "Eiffel Tower at golden hour from Champ de Mars", emoji: "🗼" },
        ],
      },
      {
        day: 4,
        theme: "Paris → Rome",
        activities: [
          { time: "10:00", name: "Morning flight to Rome", emoji: "✈️" },
          { time: "17:00", name: "Pantheon & Trevi Fountain at dusk — both free", emoji: "⛲" },
        ],
      },
      {
        day: 5,
        theme: "Rome — Ancient Core",
        activities: [
          { time: "08:30", name: "Colosseum first slot", emoji: "🏛️" },
          { time: "11:30", name: "Forum & Palatine Hill", emoji: "🏚️" },
          { time: "20:00", name: "Trastevere dinner", emoji: "🍝" },
        ],
      },
      {
        day: 6,
        theme: "Rome — Vatican",
        activities: [
          { time: "08:00", name: "Vatican Museums early entry", emoji: "🎨" },
          { time: "13:00", name: "St Peter's & the dome climb", emoji: "⛪" },
          { time: "20:00", name: "Trattoria night in Monti", emoji: "🍷" },
        ],
      },
      {
        day: 7,
        theme: "Rome — Fountains & Farewell",
        activities: [
          { time: "10:00", name: "Piazza Navona & Campo de' Fiori", emoji: "⛲" },
          { time: "13:00", name: "Farewell carbonara", emoji: "🍝" },
        ],
      },
    ],
    restaurants: [
      { name: "Le Comptoir du Relais", cuisine: "Paris bistro · $$", emoji: "🥖" },
      { name: "Da Enzo al 29", cuisine: "Trastevere trattoria · $$", emoji: "🍝" },
      { name: "Roscioli", cuisine: "Roman deli-restaurant · $$", emoji: "🥓" },
    ],
    city: "Paris",
    country: "France",
    airport: CDG,
    travelStyle: "cultural",
    interests: ["museums", "food", "history"],
    highlights: [
      "Two cities, zero 6am flights",
      "One day trip slot per city",
      "The Louvre and Colosseum both done properly",
    ],
  },
  {
    id: "europe-10d-highlights",
    title: "Europe 10-Day Highlights: London, Paris, Amsterdam",
    coverImage: null,
    gradient: "from-sky-600 to-emerald-600",
    author: AI,
    days: 10,
    estimatedCost: 1650,
    currency: "EUR",
    tags: ["Multi-City", "Rail", "Culture"],
    excerpt:
      "Ten days on one rail thread: four London nights, three Paris, three Amsterdam — Eurostar and Thalys, no airports, one day trip per city.",
    weatherTip:
      "May–June and September are the sweet spot for all three. Book Eurostar and Thalys fares when you book flights — walk-up prices triple.",
    fullDays: [
      {
        day: 1,
        theme: "London — Arrive & Westminster",
        activities: [
          { time: "15:00", name: "Westminster & Trafalgar Square walk", emoji: "⛪" },
          { time: "19:00", name: "First pub dinner", emoji: "🍺" },
        ],
      },
      {
        day: 2,
        theme: "London — Museums & Tower",
        activities: [
          { time: "09:30", name: "British Museum (free)", emoji: "🏛️" },
          { time: "13:00", name: "Borough Market lunch", emoji: "🧀" },
          { time: "15:30", name: "Tower of London", emoji: "👑" },
        ],
      },
      {
        day: 3,
        theme: "Day Trip — Cambridge or Bath",
        activities: [
          { time: "09:00", name: "Rail out, spires or spa history", emoji: "🚆" },
          { time: "19:00", name: "West End show or pub roast", emoji: "🎭" },
        ],
      },
      {
        day: 4,
        theme: "London — Villages",
        activities: [
          { time: "10:00", name: "Notting Hill & Portobello Road", emoji: "🏡" },
          { time: "15:00", name: "Hyde Park & South Kensington museums", emoji: "🌳" },
        ],
      },
      {
        day: 5,
        theme: "Eurostar to Paris",
        activities: [
          { time: "10:00", name: "2h20 city-center transfer", emoji: "🚄" },
          { time: "15:00", name: "Marais stroll & booked bistro", emoji: "🍷" },
        ],
      },
      {
        day: 6,
        theme: "Paris — Islands & Louvre",
        activities: [
          { time: "09:00", name: "Louvre first entry", emoji: "🖼️" },
          { time: "14:00", name: "Sainte-Chapelle & Latin Quarter", emoji: "⛪" },
        ],
      },
      {
        day: 7,
        theme: "Paris — Grand Axis or Versailles",
        activities: [
          { time: "10:00", name: "Tuileries & Champs-Élysées", emoji: "🌳" },
          { time: "18:00", name: "Eiffel at golden hour", emoji: "🗼" },
        ],
      },
      {
        day: 8,
        theme: "Thalys to Amsterdam",
        activities: [
          { time: "10:00", name: "3h20 transfer", emoji: "🚄" },
          { time: "15:00", name: "Canal-ring walk & brown café", emoji: "🚲" },
        ],
      },
      {
        day: 9,
        theme: "Amsterdam — Museums & Jordaan",
        activities: [
          { time: "09:00", name: "Rijksmuseum or Van Gogh at opening", emoji: "🖼️" },
          { time: "15:00", name: "Jordaan lanes & canal evening", emoji: "🛶" },
        ],
      },
      {
        day: 10,
        theme: "Amsterdam — Windmills & Farewell",
        activities: [
          { time: "09:30", name: "Zaanse Schans or the Waterland by bike", emoji: "🌬️" },
          { time: "16:00", name: "Farewell herring & frites", emoji: "🐟" },
        ],
      },
    ],
    restaurants: [
      { name: "Borough Market", cuisine: "London market · $$", emoji: "🧀" },
      { name: "Le Comptoir du Relais", cuisine: "Paris bistro · $$", emoji: "🥖" },
      { name: "Café Chris", cuisine: "Jordaan brown café · $$", emoji: "🍺" },
    ],
    city: "London",
    country: "United Kingdom",
    airport: LHR,
    travelStyle: "cultural",
    interests: ["museums", "food", "history"],
    highlights: [
      "Three cities, one rail thread, no airports",
      "A day trip from each capital",
      "London's free museums carrying the budget",
    ],
  },
  {
    id: "europe-14d-grand-tour",
    title: "Europe 14-Day Grand Tour by Rail",
    coverImage: null,
    gradient: "from-indigo-600 to-emerald-500",
    author: AI,
    days: 14,
    estimatedCost: 2300,
    currency: "EUR",
    tags: ["Multi-City", "Rail", "Grand Tour"],
    excerpt:
      "The modern grand tour: London, Paris, Lucerne, Venice, Rome — four cities and the Alps on one one-way rail loop with no internal flights.",
    weatherTip:
      "May–June and September–October fit the whole loop. Book every rail leg when you book flights; the Gotthard and TGV routes reward window seats.",
    fullDays: [
      {
        day: 1,
        theme: "London — Arrive",
        activities: [{ time: "15:00", name: "Westminster dusk & pub dinner", emoji: "🍺" }],
      },
      {
        day: 2,
        theme: "London — Museums & Tower",
        activities: [
          { time: "09:30", name: "British Museum & Borough Market", emoji: "🏛️" },
          { time: "15:30", name: "Tower of London", emoji: "👑" },
        ],
      },
      {
        day: 3,
        theme: "London — Day Trip",
        activities: [{ time: "09:00", name: "Bath or Cambridge, back for a show", emoji: "🚆" }],
      },
      {
        day: 4,
        theme: "London — Villages",
        activities: [{ time: "10:00", name: "Notting Hill & Hyde Park", emoji: "🌳" }],
      },
      {
        day: 5,
        theme: "Paris — Eurostar In",
        activities: [{ time: "15:00", name: "Marais & booked bistro", emoji: "🍷" }],
      },
      {
        day: 6,
        theme: "Paris — Islands & Louvre",
        activities: [{ time: "09:00", name: "Louvre & Sainte-Chapelle", emoji: "🖼️" }],
      },
      {
        day: 7,
        theme: "Paris — Grand Axis",
        activities: [{ time: "17:30", name: "Trocadéro & Eiffel at golden hour", emoji: "🗼" }],
      },
      {
        day: 8,
        theme: "Lucerne — Lake Arrival",
        activities: [
          { time: "13:00", name: "TGV & Swiss rails to Lucerne", emoji: "🚄" },
          { time: "18:00", name: "Chapel Bridge & lakeside dinner", emoji: "🌉" },
        ],
      },
      {
        day: 9,
        theme: "Lucerne — Mountain Day",
        activities: [
          { time: "09:00", name: "Steamer & cog railway up Rigi or Pilatus", emoji: "🚞" },
          { time: "17:00", name: "Lake swim or lakeside beer", emoji: "🍺" },
        ],
      },
      {
        day: 10,
        theme: "Venice — Gotthard South",
        activities: [
          { time: "14:00", name: "Arrive & Grand Canal vaporetto at dusk", emoji: "🛶" },
          { time: "19:00", name: "Cicchetti crawl", emoji: "🍤" },
        ],
      },
      {
        day: 11,
        theme: "Venice — San Marco & Back Canals",
        activities: [
          { time: "08:30", name: "St Mark's early & Doge's Palace", emoji: "⛪" },
          { time: "15:00", name: "Dorsoduro & Castello back lanes", emoji: "🎨" },
        ],
      },
      {
        day: 12,
        theme: "Venice — Lagoon Islands",
        activities: [
          { time: "09:30", name: "Murano & Burano", emoji: "🧶" },
          { time: "18:00", name: "Farewell gondola or traghetto", emoji: "🛶" },
        ],
      },
      {
        day: 13,
        theme: "Rome — Ancient Core",
        activities: [
          { time: "14:00", name: "Train to Rome & Colosseum's late slot", emoji: "🏛️" },
          { time: "20:00", name: "Trastevere dinner", emoji: "🍝" },
        ],
      },
      {
        day: 14,
        theme: "Rome — Vatican & Farewell",
        activities: [
          { time: "08:30", name: "Vatican early slot", emoji: "🎨" },
          { time: "18:00", name: "Pantheon & Trevi at dusk", emoji: "⛲" },
        ],
      },
    ],
    restaurants: [
      { name: "Wirtshaus Taube", cuisine: "Lucerne Swiss · $$$", emoji: "🧀" },
      { name: "All'Arco", cuisine: "Venice cicchetti · $", emoji: "🍤" },
      { name: "Da Enzo al 29", cuisine: "Rome trattoria · $$", emoji: "🍝" },
    ],
    city: "London",
    country: "United Kingdom",
    airport: LHR,
    travelStyle: "cultural",
    interests: ["museums", "history", "food"],
    highlights: [
      "One-way rail: no backtracking, no flights",
      "The Alps between two art capitals",
      "Two nights minimum everywhere that counts",
    ],
  },
  {
    id: "london-3d-classic",
    title: "London 3-Day Classic",
    coverImage: null,
    gradient: "from-blue-700 to-red-600",
    author: AI,
    days: 3,
    estimatedCost: 540,
    currency: "GBP",
    tags: ["Museums", "Culture", "City Break"],
    excerpt:
      "Westminster and the river first, the ancient city and markets second, villages or a day trip third — London grouped by riverbank and neighborhood.",
    weatherTip:
      "May–June and September are the sweet spot. It rains lightly year-round — the plan works with a compact umbrella in every month.",
    fullDays: [
      {
        day: 1,
        theme: "Westminster & the River",
        activities: [
          { time: "09:30", name: "Westminster Abbey at opening", emoji: "⛪" },
          { time: "12:00", name: "South Bank walk past the Eye", emoji: "🎡" },
          { time: "15:00", name: "National Gallery hour (free)", emoji: "🖼️" },
          { time: "19:00", name: "Covent Garden pub dinner", emoji: "🍺" },
        ],
      },
      {
        day: 2,
        theme: "Ancient City & Markets",
        activities: [
          { time: "09:00", name: "Tower of London first slot", emoji: "👑" },
          { time: "12:30", name: "Borough Market lunch", emoji: "🧀" },
          { time: "15:00", name: "Tate Modern or St Paul's", emoji: "🏛️" },
          { time: "19:00", name: "Sunday roast or a City pub", emoji: "🍗" },
        ],
      },
      {
        day: 3,
        theme: "Villages or Day Trip",
        activities: [
          { time: "10:00", name: "Notting Hill & Portobello Road", emoji: "🏡" },
          { time: "14:00", name: "Hampstead Heath's Parliament Hill view", emoji: "🌄" },
          { time: "17:00", name: "Camden canal wander", emoji: "🚤" },
          { time: "19:30", name: "West End show or a properly old pub", emoji: "🎭" },
        ],
      },
    ],
    restaurants: [
      { name: "Gloria", cuisine: "Italian grand Café · $$", emoji: "🍝" },
      { name: "Borough Market stalls", cuisine: "Market grazing · $", emoji: "🧀" },
      { name: "The Lamb", cuisine: "Classic pub · $$", emoji: "🍺" },
    ],
    city: "London",
    country: "United Kingdom",
    airport: LHR,
    travelStyle: "cultural",
    interests: ["museums", "history", "food"],
    highlights: [
      "The world's best free museums, used hourly",
      "Borough Market at lunch rush",
      "One pub ending per day, non-negotiable",
    ],
  },
  {
    id: "london-5d-deep",
    title: "London 5-Day Deep Dive",
    coverImage: null,
    gradient: "from-purple-600 to-blue-700",
    author: AI,
    days: 5,
    estimatedCost: 900,
    currency: "GBP",
    tags: ["Museums", "Culture", "Neighborhoods"],
    excerpt:
      "Five days beyond the classics: Greenwich, Kew or Hampstead, the East End's street art, and a second day trip — London at local speed.",
    weatherTip:
      "May–September suits the parks and river walks. August is festival-heavy; December adds lights, markets and ice rinks.",
    fullDays: [
      {
        day: 1,
        theme: "Westminster & South Bank",
        activities: [
          { time: "09:30", name: "Westminster Abbey", emoji: "⛪" },
          { time: "14:00", name: "South Bank & Tate Modern", emoji: "🖼️" },
          { time: "19:00", name: "Southwark pub dinner", emoji: "🍺" },
        ],
      },
      {
        day: 2,
        theme: "The City & Markets",
        activities: [
          { time: "09:00", name: "Tower of London", emoji: "👑" },
          { time: "12:30", name: "Borough Market", emoji: "🧀" },
          { time: "15:00", name: "St Paul's dome climb", emoji: "⛪" },
        ],
      },
      {
        day: 3,
        theme: "Greenwich & the River",
        activities: [
          { time: "10:00", name: "Riverbus to Greenwich", emoji: "🚤" },
          { time: "12:00", name: "Royal Observatory & the meridian", emoji: "🌐" },
          { time: "16:00", name: "National Maritime Museum (free)", emoji: "⚓" },
        ],
      },
      {
        day: 4,
        theme: "East End & Street Art",
        activities: [
          { time: "10:00", name: "Spitalfields & Brick Lane", emoji: "🎨" },
          { time: "13:00", name: "Beigel Bake's salt beef bagel", emoji: "🥯" },
          { time: "16:00", name: "Shoreditch street-art wander", emoji: "🖌️" },
        ],
      },
      {
        day: 5,
        theme: "Kew or Day Trip",
        activities: [
          { time: "10:00", name: "Kew Gardens — or the Windsor/Bath rail day", emoji: "🌿" },
          { time: "16:00", name: "Farewell museum hour", emoji: "🏛️" },
          { time: "19:00", name: "Farewell roast", emoji: "🍗" },
        ],
      },
    ],
    restaurants: [
      { name: "Beigel Bake", cuisine: "Salt beef bagel · $", emoji: "🥯" },
      { name: "Hawksmoor", cuisine: "Proper steak · $$$", emoji: "🥩" },
      { name: "The Guinea Grill", cuisine: "Historic pub pie · $$", emoji: "🥧" },
    ],
    city: "London",
    country: "United Kingdom",
    airport: LHR,
    travelStyle: "cultural",
    interests: ["museums", "history", "nature"],
    highlights: [
      "Greenwich by riverbus",
      "Brick Lane's bagel institution",
      "Kew Gardens as the flexible day",
    ],
  },
  {
    id: "rome-3d-classics",
    title: "Rome 3-Day Classics",
    coverImage: null,
    gradient: "from-amber-500 to-orange-700",
    author: AI,
    days: 3,
    estimatedCost: 390,
    currency: "EUR",
    tags: ["History", "Culture", "Classic"],
    excerpt:
      "Ancient core, Vatican, and the fountains-and-piazzas finale — the three Roman days, timed to beat both the queues and the sun.",
    weatherTip:
      "April–May and late September–October are ideal. Summer regularly clears 35°C — the plan starts early and hides at midday by design.",
    fullDays: [
      {
        day: 1,
        theme: "Ancient Rome",
        activities: [
          { time: "08:30", name: "Colosseum first slot (timed ticket)", emoji: "🏛️" },
          { time: "11:00", name: "Forum & Palatine Hill", emoji: "🏚️" },
          { time: "16:00", name: "Siesta, then Trevi Fountain at dusk", emoji: "⛲" },
          { time: "20:00", name: "Dinner in Monti", emoji: "🍝" },
        ],
      },
      {
        day: 2,
        theme: "Vatican & the River",
        activities: [
          { time: "08:00", name: "Vatican Museums early entry", emoji: "🎨" },
          { time: "13:00", name: "St Peter's & the dome", emoji: "⛪" },
          { time: "16:30", name: "Castel Sant'Angelo terraces", emoji: "🏰" },
          { time: "20:00", name: "Trastevere dinner — get lost on purpose", emoji: "🍷" },
        ],
      },
      {
        day: 3,
        theme: "Fountains, Piazzas & Villas",
        activities: [
          { time: "09:30", name: "Piazza Navona with morning coffee", emoji: "⛲" },
          { time: "11:00", name: "Campo de' Fiori market", emoji: "🧺" },
          { time: "14:00", name: "Borghese Gallery (booked) or the gardens", emoji: "🗿" },
          { time: "20:00", name: "Farewell carbonara", emoji: "🍝" },
        ],
      },
    ],
    restaurants: [
      { name: "Da Enzo al 29", cuisine: "Trastevere trattoria · $$", emoji: "🍝" },
      { name: "Roscioli", cuisine: "Roman deli-restaurant · $$", emoji: "🥓" },
      { name: "Trapizzino Trastevere", cuisine: "Street pizza pockets · $", emoji: "🍕" },
    ],
    city: "Rome",
    country: "Italy",
    airport: FCO,
    travelStyle: "cultural",
    interests: ["history", "food", "museums"],
    highlights: [
      "The Colosseum's first slot",
      "Vatican early before the river of crowds",
      "Fountains and piazzas at their dusk best",
    ],
  },
  {
    id: "rome-food-3d",
    title: "Rome 3-Day Food Trip",
    coverImage: null,
    gradient: "from-orange-500 to-red-600",
    author: AI,
    days: 3,
    estimatedCost: 390,
    currency: "EUR",
    tags: ["Foodie", "Pasta", "Markets"],
    excerpt:
      "The four-pasta degree course across three days: carbonara mornings, pizza al taglio lunches, and the fried starters that hold the wine.",
    weatherTip:
      "Trattorias run year-round. April–October lets the evening passeggiata carry dinner outdoors; winter is soup-and-carbonara weather.",
    fullDays: [
      {
        day: 1,
        theme: "Carbonara School",
        activities: [
          { time: "08:30", name: "Cornetto & cappuccino at the bar", emoji: "☕" },
          { time: "13:00", name: "Testaccio market lunch", emoji: "🧺" },
          { time: "16:00", name: "Espresso & tiramisu masterclass stop", emoji: "🍰" },
          { time: "20:00", name: "Carbonara & carciofi dinner", emoji: "🍝" },
        ],
      },
      {
        day: 2,
        theme: "Fried Things & Pizza",
        activities: [
          { time: "09:30", name: "Jewish Ghetto's fried artichokes", emoji: "🥬" },
          { time: "13:00", name: "Pizza al taglio by weight", emoji: "🍕" },
          { time: "17:00", name: "Supplì across Monti", emoji: "🍚" },
          { time: "20:30", name: "Cacio e pepe finale", emoji: "🧀" },
        ],
      },
      {
        day: 3,
        theme: "Markets & Gricia",
        activities: [
          { time: "09:00", name: "Campo de' Fiori market morning", emoji: "🧺" },
          { time: "13:00", name: "Amatriciana lunch in the ghetto or Monti", emoji: "🍅" },
          { time: "16:30", name: "Gelato graduation (pistachio test)", emoji: "🍦" },
          { time: "19:30", name: "Farewell gricia", emoji: "🥓" },
        ],
      },
    ],
    restaurants: [
      { name: "Roscioli", cuisine: "Carbonara institution · $$", emoji: "🍝" },
      { name: "Trapizzino", cuisine: "Street pizza pockets · $", emoji: "🍕" },
      { name: "Pizzarium", cuisine: "Pizza al taglio · $", emoji: "🍕" },
    ],
    city: "Rome",
    country: "Italy",
    airport: FCO,
    travelStyle: "foodie",
    interests: ["food", "history"],
    highlights: [
      "All four pastas, ranked by your own palate",
      "Testaccio — the locals' food quarter",
      "The pistachio gelato test",
    ],
  },
  {
    id: "barcelona-3d-gaudi",
    title: "Barcelona 3-Day Gaudí & Gothic Trip",
    coverImage: null,
    gradient: "from-red-500 to-yellow-500",
    author: AI,
    days: 3,
    estimatedCost: 360,
    currency: "EUR",
    tags: ["Architecture", "Culture", "Beaches"],
    excerpt:
      "Gaudí's masterpieces with booked slots, the Gothic Quarter's free medieval lanes, and a hill-or-beach third day — the complete first Barcelona.",
    weatherTip:
      "April–June and September–October are ideal. Summers are hot and crowded; the sea breeze keeps evenings civilized year-round.",
    fullDays: [
      {
        day: 1,
        theme: "Sagrada Família & Modernisme",
        activities: [
          { time: "09:00", name: "Sagrada Família's morning slot (booked)", emoji: "⛪" },
          { time: "13:00", name: "Casa Batlló or La Pedrera on Passeig de Gràcia", emoji: "🏠" },
          { time: "17:00", name: "Gràcia's village squares & tapas", emoji: "🍻" },
        ],
      },
      {
        day: 2,
        theme: "Park Güell & the Gothic City",
        activities: [
          { time: "08:30", name: "Park Güell first-entry slot", emoji: "🦎" },
          { time: "12:00", name: "La Boqueria's back-bar lunch", emoji: "🧺" },
          { time: "15:00", name: "Cathedral & Barri Gòtic lanes", emoji: "⛪" },
          { time: "20:00", name: "El Born pintxos dinner", emoji: "🍢" },
        ],
      },
      {
        day: 3,
        theme: "Montjuïc or Beach",
        activities: [
          { time: "10:00", name: "Montjuïc cable car & castle views", emoji: "🚡" },
          { time: "14:00", name: "Barceloneta boardwalk & seafood", emoji: "🏖️" },
          { time: "19:00", name: "Vermouth hour — the city's institution", emoji: "🍹" },
        ],
      },
    ],
    restaurants: [
      { name: "El Quim de la Boqueria", cuisine: "Market counter · $$", emoji: "🧺" },
      { name: "Cal Pep", cuisine: "Seafood tapas · $$", emoji: "🍤" },
      { name: "Quimet & Quimet", cuisine: "Montaditos · $", emoji: "🥫" },
    ],
    city: "Barcelona",
    country: "Spain",
    airport: BCN,
    travelStyle: "cultural",
    interests: ["history", "food", "beaches"],
    highlights: [
      "Sagrada Família's morning stained glass",
      "The Gothic Quarter's free medieval maze",
      "The vermouth hour, done properly",
    ],
  },
  {
    id: "barcelona-food-3d",
    title: "Barcelona 3-Day Food Trip",
    coverImage: null,
    gradient: "from-red-500 to-orange-500",
    author: AI,
    days: 3,
    estimatedCost: 360,
    currency: "EUR",
    tags: ["Foodie", "Tapas", "Markets"],
    excerpt:
      "Three days of movement: tapas crawls through Gràcia and El Born, market counters at La Boqueria, menú del día lunches and the vermut ritual.",
    weatherTip:
      "Terrace season runs April–October. Tapas crawls work year-round; the menú del día is the constant.",
    fullDays: [
      {
        day: 1,
        theme: "Market & Gràcia",
        activities: [
          { time: "09:00", name: "La Boqueria's back counters at opening", emoji: "🧺" },
          { time: "13:30", name: "Menú del día in Gràcia", emoji: "🍽️" },
          { time: "19:00", name: "Vermut hour in a Gràcia square", emoji: "🍹" },
          { time: "21:30", name: "Tapas crawl: bravas, tortilla, croquetas", emoji: "🍢" },
        ],
      },
      {
        day: 2,
        theme: "Born & Seafood",
        activities: [
          { time: "10:00", name: "Santa Caterina market", emoji: "🧺" },
          { time: "13:30", name: "Cal Pep's counter lunch", emoji: "🍤" },
          { time: "17:00", name: "Barceloneta boardwalk vermut", emoji: "🍹" },
          { time: "21:00", name: "Pintxos dinner in El Born", emoji: "🍢" },
        ],
      },
      {
        day: 3,
        theme: "Poble-sec & Farewell",
        activities: [
          { time: "11:00", name: "Montjuïc views first", emoji: "⛰️" },
          { time: "13:30", name: "Carrer de Blai's pintxo street", emoji: "🍢" },
          { time: "17:00", name: "Churros con chocolate", emoji: "🍩" },
          { time: "20:00", name: "Farewell paella or fideuà", emoji: "🥘" },
        ],
      },
    ],
    restaurants: [
      { name: "El Quim de la Boqueria", cuisine: "Market counter · $$", emoji: "🧺" },
      { name: "Quimet & Quimet", cuisine: "Montaditos & conservas · $", emoji: "🥫" },
      { name: "Can Solé", cuisine: "Paella since 1903 · $$", emoji: "🥘" },
    ],
    city: "Barcelona",
    country: "Spain",
    airport: BCN,
    travelStyle: "foodie",
    interests: ["food", "nightlife"],
    highlights: [
      "The menú del día as the budget's best friend",
      "Carrer de Blai's pintxo street",
      "The vermut hour as an institution",
    ],
  },
  {
    id: "lisbon-3d-hills",
    title: "Lisbon 3-Day Hills & Tiles Trip",
    coverImage: null,
    gradient: "from-yellow-500 to-blue-600",
    author: AI,
    days: 3,
    estimatedCost: 330,
    currency: "EUR",
    tags: ["Culture", "Foodie", "Views"],
    excerpt:
      "Three days across Lisbon's ridges: Alfama's lanes and fado, Belém's monastery and original custard tarts, and the miradouro circuit at sunset.",
    weatherTip:
      "April–June and September–October are ideal; November is mild and quiet. The hills are the constant — bring real shoes.",
    fullDays: [
      {
        day: 1,
        theme: "Alfama & the Castle",
        activities: [
          { time: "09:00", name: "São Jorge Castle at opening", emoji: "🏰" },
          { time: "12:00", name: "Alfama's lanes & miradouros", emoji: "🚶" },
          { time: "14:00", name: "Grilled sardine lunch", emoji: "🐟" },
          { time: "20:00", name: "Fado dinner in Alfama (booked)", emoji: "🎵" },
        ],
      },
      {
        day: 2,
        theme: "Belém Riverside",
        activities: [
          { time: "09:00", name: "Warm pastéis de Belém at the source", emoji: "🥮" },
          { time: "10:30", name: "Jerónimos Monastery's cloisters", emoji: "⛪" },
          { time: "14:00", name: "Belém Tower & the MAAT walk", emoji: "🌊" },
          { time: "20:00", name: "Bairro Alto night", emoji: "🍷" },
        ],
      },
      {
        day: 3,
        theme: "Baixa & Farewell",
        activities: [
          { time: "10:00", name: "Baixa's grid & Praça do Comércio", emoji: "🏛️" },
          { time: "13:00", name: "Time Out Market grazing lunch", emoji: "🍽️" },
          { time: "16:00", name: "Tram 28 or the LX Factory bookshop", emoji: "🚋" },
          { time: "19:30", name: "Sunset miradouro farewell drink", emoji: "🌅" },
        ],
      },
    ],
    restaurants: [
      { name: "Pastéis de Belém", cuisine: "The original tarts · $", emoji: "🥮" },
      { name: "Time Out Market", cuisine: "Best-of grazing · $$", emoji: "🍽️" },
      { name: "A Cevicheria", cuisine: "Peruvian-Portuguese · $$", emoji: "🐟" },
    ],
    city: "Lisbon",
    country: "Portugal",
    airport: LIS,
    travelStyle: "cultural",
    interests: ["food", "history", "museums"],
    highlights: [
      "The original custard tarts, still warm",
      "One fado night where it was born",
      "The miradouro circuit at golden hour",
    ],
  },
  {
    id: "budapest-3d-baths",
    title: "Budapest 3-Day Baths & Ruin Bars Trip",
    coverImage: null,
    gradient: "from-emerald-600 to-amber-600",
    author: AI,
    days: 3,
    estimatedCost: 240,
    currency: "EUR",
    tags: ["Culture", "Nightlife", "Spas"],
    excerpt:
      "Castle mornings, thermal-bath afternoons, and the ruin bars of the Jewish Quarter at night — Budapest's three pillars in three days.",
    weatherTip:
      "April–June and September–October are ideal. Winter bathing in steaming outdoor pools is the signature experience; December adds Advent markets.",
    fullDays: [
      {
        day: 1,
        theme: "Buda Castle & the River",
        activities: [
          { time: "09:00", name: "Fisherman's Bastion early", emoji: "🏰" },
          { time: "11:30", name: "Matthias Church & castle lanes", emoji: "⛪" },
          { time: "16:00", name: "Danube cruise or riverside ferry hour", emoji: "🚢" },
          { time: "19:30", name: "Parliament lit from Batthyány Square", emoji: "🏛️" },
        ],
      },
      {
        day: 2,
        theme: "Baths & Markets",
        activities: [
          { time: "09:00", name: "Széchenyi's steaming pools (timed ticket)", emoji: "♨️" },
          { time: "14:00", name: "Great Market Hall & lángos", emoji: "🧀" },
          { time: "17:00", name: "Andrássy Avenue café hour", emoji: "☕" },
          { time: "20:00", name: "Szimpla Kert before it multiplies", emoji: "🍹" },
        ],
      },
      {
        day: 3,
        theme: "Jewish Quarter & Farewell",
        activities: [
          { time: "10:00", name: "Dohány Street Synagogue", emoji: "🕍" },
          { time: "13:00", name: "Gozsdu Courtyard lunch", emoji: "🍽️" },
          { time: "16:00", name: "Central Café's ornate cakes", emoji: "🍰" },
          { time: "19:00", name: "Shoes on the Danube & farewell walk", emoji: "🌉" },
        ],
      },
    ],
    restaurants: [
      { name: "Café Central", cuisine: "Grand café · $$", emoji: "🍰" },
      { name: "Mazel Tov", cuisine: "Modern Jewish · $$", emoji: "🌿" },
      { name: "Lángos at the market hall", cuisine: "Fried dough · $", emoji: "🧀" },
    ],
    city: "Budapest",
    country: "Hungary",
    airport: BUD,
    travelStyle: "cultural",
    interests: ["history", "food", "nightlife"],
    highlights: [
      "Széchenyi's steam in any season",
      "Szimpla Kert, the original ruin bar",
      "Both riverbanks, on foot",
    ],
  },
  {
    id: "venice-2d-canals",
    title: "Venice 2-Day Canals Trip",
    coverImage: null,
    gradient: "from-blue-500 to-indigo-700",
    author: AI,
    days: 2,
    estimatedCost: 300,
    currency: "EUR",
    tags: ["Culture", "Romance", "Classic"],
    excerpt:
      "San Marco early, the back canals properly, and Murano-Burano on day two — Venice compressed without being cheated.",
    weatherTip:
      "April–May and September–October are mild and navigable. Winter is cold, foggy and local; acqua alta (high water) mostly affects November–December.",
    fullDays: [
      {
        day: 1,
        theme: "San Marco & the Back Canals",
        activities: [
          { time: "08:15", name: "St Mark's Basilica at opening", emoji: "⛪" },
          { time: "10:00", name: "Doge's Palace", emoji: "🏰" },
          { time: "13:00", name: "Cicchetti lunch in the back lanes", emoji: "🍤" },
          { time: "16:00", name: "Dorsoduro & Castello wander", emoji: "🎨" },
          { time: "19:00", name: "Grand Canal vaporetto at dusk", emoji: "🛶" },
        ],
      },
      {
        day: 2,
        theme: "Rialto & the Lagoon Islands",
        activities: [
          { time: "08:00", name: "Rialto Market at dawn", emoji: "🦑" },
          { time: "10:30", name: "Ferry to Murano's glass furnaces", emoji: "🫧" },
          { time: "14:00", name: "Burano's painted houses", emoji: "🧶" },
          { time: "18:00", name: "Farewell gondola or traghetto crossing", emoji: "🚣" },
        ],
      },
    ],
    restaurants: [
      { name: "All'Arco", cuisine: "Cicchetti counter · $", emoji: "🍤" },
      { name: "Cantina Do Spade", cuisine: "Oldest bacaro · $", emoji: "🍷" },
      { name: "Trattoria alla Madonna", cuisine: "Classic Venetian · $$", emoji: "🦑" },
    ],
    city: "Venice",
    country: "Italy",
    airport: VCE,
    travelStyle: "cultural",
    interests: ["museums", "food", "history"],
    highlights: [
      "St Mark's before the day-trippers",
      "The back-canallel Venice that's five minutes away",
      "Burano's colors in afternoon light",
    ],
  },
  {
    id: "athens-3d-classics",
    title: "Athens 3-Day Classics Trip",
    coverImage: null,
    gradient: "from-blue-500 to-amber-600",
    author: AI,
    days: 3,
    estimatedCost: 285,
    currency: "EUR",
    tags: ["History", "Culture", "Foodie"],
    excerpt:
      "The Acropolis early, the world-class museums, Plaka's taverna lanes and a rooftop sunset facing 2,500 years — with the islands one metro ride away.",
    weatherTip:
      "April–May and September–October are warm without the furnace. Summer clears 35°C — start at dawn like the ancients did.",
    fullDays: [
      {
        day: 1,
        theme: "The Acropolis & Plaka",
        activities: [
          { time: "08:00", name: "Acropolis at opening — the Parthenon cool and quiet", emoji: "🏛️" },
          { time: "11:00", name: "Acropolis Museum", emoji: "🏺" },
          { time: "14:00", name: "Plaka & Anafiotika's island lanes", emoji: "🚶" },
          { time: "20:00", name: "Taverna dinner under the Acropolis", emoji: "🍲" },
        ],
      },
      {
        day: 2,
        theme: "Museums & Ancient Agora",
        activities: [
          { time: "09:00", name: "National Archaeological Museum's bronzes", emoji: "🗿" },
          { time: "13:00", name: "Central Market lunch", emoji: "🥙" },
          { time: "16:00", name: "Ancient Agora & the Temple of Hephaestus", emoji: "🏚️" },
          { time: "20:00", name: "Rooftop dinner facing the floodlit Acropolis", emoji: "🌆" },
        ],
      },
      {
        day: 3,
        theme: "Lycabettus & Farewell",
        activities: [
          { time: "10:00", name: "Temple of Olympian Zeus & Hadrian's Arch", emoji: "🏛️" },
          { time: "13:00", name: "Souvlaki farewell lunch", emoji: "🍢" },
          { time: "17:30", name: "Mount Lycabettus sunset", emoji: "🌄" },
          { time: "20:00", name: "Gyros & one last ouzo", emoji: "🥃" },
        ],
      },
    ],
    restaurants: [
      { name: "To Kafeneio", cuisine: "Plaka taverna · $$", emoji: "🍲" },
      { name: "O Kostas", cuisine: "Legendary souvlaki · $", emoji: "🍢" },
      { name: "A for Athens", cuisine: "Rooftop views · $$", emoji: "🍹" },
    ],
    city: "Athens",
    country: "Greece",
    airport: ATH,
    travelStyle: "cultural",
    interests: ["history", "food", "museums"],
    highlights: [
      "The Parthenon at 8am, cool and empty",
      "The National Museum's bronze Zeus",
      "Lycabettus sunset over the whole city",
    ],
  },
  {
    id: "italy-7d-classics",
    title: "Italy 7-Day Classics: Rome, Florence, Venice",
    coverImage: null,
    gradient: "from-green-600 to-red-600",
    author: AI,
    days: 7,
    estimatedCost: 950,
    currency: "EUR",
    tags: ["Multi-City", "Rail", "Classic"],
    excerpt:
      "The triangle done right: three Rome nights, two Florence, two Venice — Frecciarossa trains, open-jaw flights, no backtracking.",
    weatherTip:
      "April–May and late September–October suit all three cities. Book Frecciarossa fares and timed museum entries when you book flights.",
    fullDays: [
      {
        day: 1,
        theme: "Rome — Ancient Core",
        activities: [
          { time: "08:30", name: "Colosseum first slot", emoji: "🏛️" },
          { time: "16:00", name: "Trevi & Pantheon at dusk", emoji: "⛲" },
        ],
      },
      {
        day: 2,
        theme: "Rome — Vatican",
        activities: [
          { time: "08:00", name: "Vatican early entry", emoji: "🎨" },
          { time: "20:00", name: "Trastevere dinner", emoji: "🍝" },
        ],
      },
      {
        day: 3,
        theme: "Rome — Piazzas",
        activities: [
          { time: "09:30", name: "Piazza Navona & Campo de' Fiori", emoji: "⛲" },
          { time: "14:00", name: "Borghese Gallery (booked)", emoji: "🗿" },
        ],
      },
      {
        day: 4,
        theme: "Florence — Renaissance",
        activities: [
          { time: "09:00", name: "Train to Florence (1h30)", emoji: "🚄" },
          { time: "14:00", name: "Duomo's dome climb (booked)", emoji: "⛪" },
          { time: "18:30", name: "Piazzale Michelangelo sunset", emoji: "🌄" },
        ],
      },
      {
        day: 5,
        theme: "Florence — David & Oltrarno",
        activities: [
          { time: "08:30", name: "The Accademia's David", emoji: "🗿" },
          { time: "13:00", name: "Uffizi's Botticellis", emoji: "🖼️" },
          { time: "17:00", name: "Oltrarno artisan lanes", emoji: "🛠️" },
        ],
      },
      {
        day: 6,
        theme: "Venice — Arrival & San Marco",
        activities: [
          { time: "09:30", name: "Train to Venice (2h10)", emoji: "🚄" },
          { time: "15:00", name: "Grand Canal vaporetto & St Mark's at dusk", emoji: "🛶" },
        ],
      },
      {
        day: 7,
        theme: "Venice — Lagoon Islands",
        activities: [
          { time: "09:30", name: "Murano & Burano", emoji: "🧶" },
          { time: "17:00", name: "Farewell cicchetti", emoji: "🍤" },
        ],
      },
    ],
    restaurants: [
      { name: "Roscioli", cuisine: "Rome deli-restaurant · $$", emoji: "🥓" },
      { name: "Trattoria Mario", cuisine: "Florence lunch legend · $$", emoji: "🍝" },
      { name: "All'Arco", cuisine: "Venice cicchetti · $", emoji: "🍤" },
    ],
    city: "Rome",
    country: "Italy",
    airport: FCO,
    travelStyle: "cultural",
    interests: ["history", "food", "museums"],
    highlights: [
      "Three cities, two rail legs, zero backtracking",
      "David, the dome, and the Grand Canal",
      "Timed entries booked before the trip",
    ],
  },
  {
    id: "italy-10d-north-south",
    title: "Italy 10-Day North to South",
    coverImage: null,
    gradient: "from-emerald-600 to-orange-600",
    author: AI,
    days: 10,
    estimatedCost: 1400,
    currency: "EUR",
    tags: ["Multi-City", "Rail", "Coast"],
    excerpt:
      "Venice, Florence, Rome and the Amalfi Coast in ten days — the full Italian arc from canals to cliffs, by train and one coastal transfer.",
    weatherTip:
      "May–June and September–early October are ideal — the coast swims and the cities walk. August crowds the coast; winter quiets everything.",
    fullDays: [
      {
        day: 1,
        theme: "Venice — Arrival",
        activities: [{ time: "15:00", name: "Grand Canal vaporetto & cicchetti", emoji: "🛶" }],
      },
      {
        day: 2,
        theme: "Venice — San Marco & Islands",
        activities: [
          { time: "08:15", name: "St Mark's early", emoji: "⛪" },
          { time: "14:00", name: "Murano & Burano", emoji: "🧶" },
        ],
      },
      {
        day: 3,
        theme: "Florence — Renaissance",
        activities: [
          { time: "10:00", name: "Train to Florence", emoji: "🚄" },
          { time: "15:00", name: "Duomo & the dome climb", emoji: "⛪" },
        ],
      },
      {
        day: 4,
        theme: "Florence — Uffizi & Oltrarno",
        activities: [
          { time: "08:30", name: "Uffizi at opening", emoji: "🖼️" },
          { time: "16:00", name: "Piazzale Michelangelo", emoji: "🌄" },
        ],
      },
      {
        day: 5,
        theme: "Tuscany Day",
        activities: [{ time: "09:00", name: "Siena or Chianti day trip", emoji: "🍇" }],
      },
      {
        day: 6,
        theme: "Rome — Ancient Core",
        activities: [
          { time: "10:00", name: "Train to Rome", emoji: "🚄" },
          { time: "16:00", name: "Trevi & Pantheon at dusk", emoji: "⛲" },
        ],
      },
      {
        day: 7,
        theme: "Rome — Vatican & Trastevere",
        activities: [
          { time: "08:00", name: "Vatican early", emoji: "🎨" },
          { time: "20:00", name: "Trastevere dinner", emoji: "🍝" },
        ],
      },
      {
        day: 8,
        theme: "To the Amalfi Coast",
        activities: [
          { time: "09:00", name: "Train to Naples & ferry to Sorrento", emoji: "⛴️" },
          { time: "17:00", name: "Cliff-top aperitivo", emoji: "🍹" },
        ],
      },
      {
        day: 9,
        theme: "Amalfi & Positano",
        activities: [
          { time: "09:30", name: "Coast ferry to Amalfi & Positano", emoji: "🏖️" },
          { time: "19:00", name: "Lemon-grove dinner", emoji: "🍋" },
        ],
      },
      {
        day: 10,
        theme: "Departure via Naples",
        activities: [
          { time: "10:00", name: "Naples pizza pilgrimage en route", emoji: "🍕" },
          { time: "16:00", name: "Airport", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "All'Arco", cuisine: "Venice cicchetti · $", emoji: "🍤" },
      { name: "Da Enzo al 29", cuisine: "Rome trattoria · $$", emoji: "🍝" },
      { name: "L'Abate", cuisine: "Amalfi coast · $$", emoji: "🍋" },
    ],
    city: "Rome",
    country: "Italy",
    airport: FCO,
    travelStyle: "cultural",
    interests: ["history", "food", "beaches"],
    highlights: [
      "The full arc: canals to Renaissance to ruins to coast",
      "A Tuscan day between two art cities",
      "Naples pizza as the departure ritual",
    ],
  },
  {
    id: "rome-florence-venice-7d",
    title: "Rome Florence Venice: Art & Food Week",
    coverImage: null,
    gradient: "from-amber-500 to-emerald-600",
    author: AI,
    days: 7,
    estimatedCost: 950,
    currency: "EUR",
    tags: ["Multi-City", "Foodie", "Rail"],
    excerpt:
      "The triangle with a food bias: Rome's four pastas, Florence's bistecca and markets, Venice's cicchetti crawl — museums still included.",
    weatherTip:
      "April–May and September–October pair walking weather with market season. Book the Uffizi, Accademia and Vatican slots ahead.",
    fullDays: [
      {
        day: 1,
        theme: "Rome — Arrival & Carbonara",
        activities: [
          { time: "16:00", name: "Pantheon & Trevi at dusk", emoji: "⛲" },
          { time: "20:00", name: "Carbonara school dinner", emoji: "🍝" },
        ],
      },
      {
        day: 2,
        theme: "Rome — Ancient & Fried",
        activities: [
          { time: "08:30", name: "Colosseum & Forum", emoji: "🏛️" },
          { time: "13:00", name: "Jewish Ghetto fried artichokes", emoji: "🥬" },
          { time: "20:00", name: "Cacio e pepe night", emoji: "🧀" },
        ],
      },
      {
        day: 3,
        theme: "Rome — Vatican & Markets",
        activities: [
          { time: "08:00", name: "Vatican early", emoji: "🎨" },
          { time: "14:00", name: "Testaccio market lunch", emoji: "🧺" },
          { time: "20:00", name: "Farewell amatriciana", emoji: "🍅" },
        ],
      },
      {
        day: 4,
        theme: "Florence — Bistecca Day",
        activities: [
          { time: "09:00", name: "Train north", emoji: "🚄" },
          { time: "13:00", name: "Mercato Centrale lunch", emoji: "🥩" },
          { time: "17:00", name: "Piazzale Michelangelo", emoji: "🌄" },
        ],
      },
      {
        day: 5,
        theme: "Florence — Art & Steak",
        activities: [
          { time: "08:30", name: "The Accademia's David", emoji: "🗿" },
          { time: "14:00", name: "Uffizi", emoji: "🖼️" },
          { time: "20:00", name: "Bistecca alla fiorentina", emoji: "🥩" },
        ],
      },
      {
        day: 6,
        theme: "Venice — Cicchetti School",
        activities: [
          { time: "10:00", name: "Train to Venice", emoji: "🚄" },
          { time: "13:00", name: "Rialto market & cicchetti crawl", emoji: "🍤" },
          { time: "19:00", name: "Grand Canal at dusk", emoji: "🛶" },
        ],
      },
      {
        day: 7,
        theme: "Venice — Islands & Farewell",
        activities: [
          { time: "09:30", name: "Murano & Burano", emoji: "🧶" },
          { time: "17:00", name: "Last spritz on the canal", emoji: "🍹" },
        ],
      },
    ],
    restaurants: [
      { name: "Roscioli", cuisine: "Rome · $$", emoji: "🍝" },
      { name: "Trattoria Mario", cuisine: "Florence · $$", emoji: "🥩" },
      { name: "All'Arco", cuisine: "Venice · $", emoji: "🍤" },
    ],
    city: "Rome",
    country: "Italy",
    airport: FCO,
    travelStyle: "foodie",
    interests: ["food", "museums", "history"],
    highlights: [
      "The four pastas, the bistecca, the cicchetti",
      "Markets as the morning anchors",
      "Museums in the heat-sheltered middays",
    ],
  },
  {
    id: "nyc-3d-first-timer",
    title: "New York 3-Day First Timer",
    coverImage: null,
    gradient: "from-amber-500 to-red-600",
    author: AI,
    days: 3,
    estimatedCost: 600,
    currency: "USD",
    tags: ["City Break", "Culture", "Classic"],
    excerpt:
      "The essential three: Midtown icons, downtown neighborhoods and one museum — New York grouped by geography so nobody crosses the bridges twice.",
    weatherTip:
      "September–October is the classic window. December is festive and cold; July is hot and humid — the subway handles both.",
    fullDays: [
      {
        day: 1,
        theme: "Midtown Icons",
        activities: [
          { time: "09:00", name: "Top of the Rock or Empire State (booked)", emoji: "🌆" },
          { time: "12:00", name: "Bryant Park & the Library", emoji: "📚" },
          { time: "15:00", name: "Times Square & Broadway ticket hunt", emoji: "🎭" },
          { time: "19:00", name: "Show or Hell's Kitchen dinner", emoji: "🍗" },
        ],
      },
      {
        day: 2,
        theme: "Downtown & the Bridge",
        activities: [
          { time: "09:00", name: "Statue of Liberty ferry or the Staten Island freebie", emoji: "🗽" },
          { time: "12:00", name: "Wall Street & the Oculus", emoji: "🏙️" },
          { time: "15:00", name: "Walk the Brooklyn Bridge at golden hour", emoji: "🌉" },
          { time: "19:30", name: "DUMBO pizza & skyline", emoji: "🍕" },
        ],
      },
      {
        day: 3,
        theme: "Central Park & Museums",
        activities: [
          { time: "09:30", name: "The Met's highlights tour", emoji: "🏛️" },
          { time: "13:00", name: "Central Park walk & carousel", emoji: "🌳" },
          { time: "16:00", name: "High Line & Chelsea Market", emoji: "🌿" },
          { time: "19:30", name: "Farewell: bagels for the plane", emoji: "🥯" },
        ],
      },
    ],
    restaurants: [
      { name: "Katz's Delicatessen", cuisine: "Pastrami institution · $$", emoji: "🥪" },
      { name: "Joe's Pizza", cuisine: "Dollar-slice dynasty · $", emoji: "🍕" },
      { name: "Ess-a-Bagel", cuisine: "Bagel benchmark · $", emoji: "🥯" },
    ],
    city: "New York",
    country: "USA",
    airport: JFK,
    travelStyle: "active",
    interests: ["museums", "food", "shopping"],
    highlights: [
      "One observation deck, chosen honestly",
      "The Brooklyn Bridge on foot",
      "The Met, two hours, done well",
    ],
  },
  {
    id: "nyc-5d-deep",
    title: "New York 5-Day Deep Dive",
    coverImage: null,
    gradient: "from-blue-600 to-amber-500",
    author: AI,
    days: 5,
    estimatedCost: 1000,
    currency: "USD",
    tags: ["Culture", "Neighborhoods", "Foodie"],
    excerpt:
      "Five days beyond the icons: Brooklyn's brownstones, Queens' food corridors, Harlem's history, and the villages — the New York that keeps people moving here.",
    weatherTip:
      "May–June and September–October are ideal. Winter is bitter but atmospheric; summer belongs to the parks and rooftops.",
    fullDays: [
      {
        day: 1,
        theme: "Midtown Icons",
        activities: [
          { time: "09:00", name: "Observation deck (booked)", emoji: "🌆" },
          { time: "14:00", name: "The High Line & Chelsea Market", emoji: "🌿" },
          { time: "19:30", name: "Broadway or Hell's Kitchen", emoji: "🎭" },
        ],
      },
      {
        day: 2,
        theme: "Downtown & Brooklyn",
        activities: [
          { time: "09:00", name: "Statue of Liberty ferry", emoji: "🗽" },
          { time: "13:00", name: "DUMBO & Williamsburg", emoji: "🌉" },
          { time: "19:00", name: "Brooklyn rooftop or beer garden", emoji: "🍺" },
        ],
      },
      {
        day: 3,
        theme: "Queens & Museums",
        activities: [
          { time: "10:00", name: "The Met or MoMA (pick one)", emoji: "🏛️" },
          { time: "15:00", name: "Astoria & LIC food corridors", emoji: "🥙" },
          { time: "19:00", name: "Greektown dinner", emoji: "🍢" },
        ],
      },
      {
        day: 4,
        theme: "Harlem & the Villages",
        activities: [
          { time: "10:00", name: "Harlem's history walk & gospel options", emoji: "🎺" },
          { time: "13:00", name: "Sylvia's or Red Rooster lunch", emoji: "🍗" },
          { time: "17:00", name: "Washington Square & the Village", emoji: "🏘️" },
        ],
      },
      {
        day: 5,
        theme: "Lower East & Farewell",
        activities: [
          { time: "09:30", name: "Katz's & the Lower East Side", emoji: "🥪" },
          { time: "13:00", name: "Tenement Museum (booked)", emoji: "🏚️" },
          { time: "16:00", name: "Last bagels & skyline", emoji: "🥯" },
        ],
      },
    ],
    restaurants: [
      { name: "Katz's Delicatessen", cuisine: "Pastrami · $$", emoji: "🥪" },
      { name: "Red Rooster", cuisine: "Harlem soul · $$", emoji: "🍗" },
      { name: "Taverna Kyclades", cuisine: "Astoria Greek · $$", emoji: "🥙" },
    ],
    city: "New York",
    country: "USA",
    airport: JFK,
    travelStyle: "active",
    interests: ["museums", "food", "nightlife"],
    highlights: [
      "Queens' food corridors most trips miss",
      "Harlem's history and tables",
      "The Tenement Museum as the sleeper hit",
    ],
  },
  {
    id: "dubai-4d-highlights",
    title: "Dubai 4-Day Highlights",
    coverImage: null,
    gradient: "from-yellow-500 to-orange-600",
    author: AI,
    days: 4,
    estimatedCost: 1000,
    currency: "USD",
    tags: ["Luxury", "Skyline", "Desert"],
    excerpt:
      "Burj Khalifa heights, the desert's silence, old Dubai's creek crossings and one indulgent day — the city of superlatives, paced sensibly.",
    weatherTip:
      "November–March is the pleasant season. Summer tops 45°C — indoor Dubai only. Ramadan shifts some hours; check dates.",
    fullDays: [
      {
        day: 1,
        theme: "Downtown & the Tower",
        activities: [
          { time: "16:00", name: "Burj Khalifa's sunset slot (book weeks out)", emoji: "🌆" },
          { time: "18:30", name: "Dubai Mall & the fountain show", emoji: "⛲" },
          { time: "20:00", name: "Downtown dinner", emoji: "🍽️" },
        ],
      },
      {
        day: 2,
        theme: "Old Dubai & the Creek",
        activities: [
          { time: "09:30", name: "Al Fahidi historical district", emoji: "🏘️" },
          { time: "11:30", name: "Abra creek crossing & the souks", emoji: "⛵" },
          { time: "15:00", name: "Gold & spice souks", emoji: "🪙" },
          { time: "19:30", name: "Al Seef riverside dinner", emoji: "🌙" },
        ],
      },
      {
        day: 3,
        theme: "Desert Safari",
        activities: [
          { time: "14:00", name: "Dune drive into the silence", emoji: "🏜️" },
          { time: "17:30", name: "Camel ride & desert sunset", emoji: "🐫" },
          { time: "19:30", name: "Bedouin-camp dinner & show", emoji: "🔥" },
        ],
      },
      {
        day: 4,
        theme: "Beach & Farewell",
        activities: [
          { time: "10:00", name: "JBR or Kite Beach morning", emoji: "🏖️" },
          { time: "14:00", name: "Palm Jumeirah & the View at the Palm", emoji: "🌴" },
          { time: "18:00", name: "Airport — often a destination itself", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Al Ustad Special Kabab", cuisine: "Old Dubai institution · $", emoji: "🍢" },
      { name: "Ravi Restaurant", cuisine: "Pakistani classic · $", emoji: "🍛" },
      { name: "At.mosphere", cuisine: "Burj fine dining · $$$$", emoji: "🌆" },
    ],
    city: "Dubai",
    country: "UAE",
    airport: DXB,
    travelStyle: "active",
    interests: ["shopping", "food", "nightlife"],
    highlights: [
      "The Burj at sunset, booked ahead",
      "Old Dubai's abra crossings",
      "The desert's actual silence",
    ],
  },
  {
    id: "amsterdam-3d-canals",
    title: "Amsterdam 3-Day Canals Trip",
    coverImage: null,
    gradient: "from-orange-500 to-blue-600",
    author: AI,
    days: 3,
    estimatedCost: 480,
    currency: "EUR",
    tags: ["Museums", "Culture", "Bikes"],
    excerpt:
      "Museum mornings, Jordaan afternoons, one bike day through the Waterland — Amsterdam at the pace the canal ring was built for.",
    weatherTip:
      "April–September is terrace and cycling season. Winter is cold but cozy — the museums and brown cafés carry it.",
    fullDays: [
      {
        day: 1,
        theme: "Museum Quarter & Canals",
        activities: [
          { time: "09:00", name: "Rijksmuseum at opening", emoji: "🖼️" },
          { time: "13:00", name: "Vondelpark & museum-quarter lunch", emoji: "🌳" },
          { time: "16:00", name: "Canal-ring walk & the Nine Streets", emoji: "🛶" },
          { time: "19:30", name: "Brown café dinner", emoji: "🍺" },
        ],
      },
      {
        day: 2,
        theme: "Jordaan & Anne Frank",
        activities: [
          { time: "09:30", name: "Anne Frank House (booked weeks out)", emoji: "🕯️" },
          { time: "12:00", name: "Jordaan lanes & Noordermarkt", emoji: "🛒" },
          { time: "16:00", name: "Canal cruise or the Houseboat Museum", emoji: "🚤" },
          { time: "20:00", name: "De Pijp dinner & craft beer", emoji: "🍻" },
        ],
      },
      {
        day: 3,
        theme: "Bike Day & Farewell",
        activities: [
          { time: "09:30", name: "Ferry north or bike the Waterland polders", emoji: "🚲" },
          { time: "13:00", name: "Zaanse Schans windmills (optional)", emoji: "🌬️" },
          { time: "17:00", name: "Farewell stroopwafel & frites", emoji: "🧇" },
        ],
      },
    ],
    restaurants: [
      { name: "Café Chris", cuisine: "Jordaan brown café · $$", emoji: "🍺" },
      { name: "Foodhallen", cuisine: "Indoor food hall · $$", emoji: "🍽️" },
      { name: "Winkel 43", cuisine: "Appeltaart legend · $", emoji: "🥧" },
    ],
    city: "Amsterdam",
    country: "Netherlands",
    airport: AMS,
    travelStyle: "cultural",
    interests: ["museums", "history", "nightlife"],
    highlights: [
      "The Rijksmuseum's Golden Age before lunch",
      "Anne Frank House, booked weeks out",
      "One proper bike day",
    ],
  },
  {
    id: "istanbul-4d-two-continents",
    title: "Istanbul 4-Day Two Continents Trip",
    coverImage: null,
    gradient: "from-red-600 to-teal-600",
    author: AI,
    days: 4,
    estimatedCost: 280,
    currency: "USD",
    tags: ["History", "Foodie", "Culture"],
    excerpt:
      "Sultanahmet's Byzantine-Ottoman core, the Bosphorus between two continents, Asian-side Kadıköy, and the grand bazaar's maze — four days of layer cake.",
    weatherTip:
      "April–May and September–October are ideal. Winters are chilly but atmospheric; the call to prayer echoes the same in every season.",
    fullDays: [
      {
        day: 1,
        theme: "Sultanahmet's Blue Hour",
        activities: [
          { time: "08:30", name: "Hagia Sophia at opening", emoji: "🕌" },
          { time: "11:00", name: "Blue Mosque & Basilica Cistern", emoji: "💧" },
          { time: "16:00", name: "Süleymaniye Mosque & the Golden Horn view", emoji: "🌇" },
          { time: "19:30", name: "Kebap dinner in the old city", emoji: "🍢" },
        ],
      },
      {
        day: 2,
        theme: "Bazaars & the Golden Horn",
        activities: [
          { time: "09:30", name: "Grand Bazaar's 4,000 shops", emoji: "🛍️" },
          { time: "13:00", name: "Spice Bazaar & Egyptian lunch", emoji: "🌶️" },
          { time: "16:00", name: "Galata Tower & Karaköy", emoji: "🗼" },
          { time: "20:00", name: "Meyhane dinner with meze & rakı", emoji: "🥃" },
        ],
      },
      {
        day: 3,
        theme: "Bosphorus & the Palaces",
        activities: [
          { time: "09:00", name: "Topkapi Palace (harem included)", emoji: "🏰" },
          { time: "14:00", name: "Bosphorus ferry to Ortaköy", emoji: "⛴️" },
          { time: "18:00", name: "Kumpir & waterfront sunset", emoji: "🥔" },
        ],
      },
      {
        day: 4,
        theme: "Asian Side & Farewell",
        activities: [
          { time: "10:00", name: "Ferry to Kadıköy — Europe to Asia in 20 minutes", emoji: "⛴️" },
          { time: "12:30", name: "Kadıköy market & Balık ekmek", emoji: "🐟" },
          { time: "16:00", name: "Moda waterfront walk", emoji: "🌅" },
          { time: "19:00", name: "Airport with Turkish delight", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Pandeli", cuisine: "Spice Bazaar institution · $$", emoji: "🐟" },
      { name: "Karaköy Lokantası", cuisine: "Meyhane classics · $$", emoji: "🥃" },
      { name: "Çiya Sofrası", cuisine: "Anatolian regional · $", emoji: "🍲" },
    ],
    city: "Istanbul",
    country: "Turkey",
    airport: IST,
    travelStyle: "cultural",
    interests: ["history", "food", "shopping"],
    highlights: [
      "Hagia Sophia before the crowds",
      "Two continents by ferry",
      "The meze-and-rakı night ritual",
    ],
  },
  {
    id: "melbourne-3d-coffee-lanes",
    title: "Melbourne 3-Day Coffee & Lanes Trip",
    coverImage: null,
    gradient: "from-yellow-400 to-emerald-600",
    author: AI,
    days: 3,
    estimatedCost: 900,
    currency: "AUD",
    tags: ["Foodie", "Culture", "Lanes"],
    excerpt:
      "Laneway espresso mornings, Queen Victoria Market, street-art hunting and a Great Ocean Road day trip — Melbourne's coffee-blooded charm.",
    weatherTip:
      "March–May and September–November are mild. Melbourne's four-seasons-in-a-day cliché is accurate — pack layers year-round.",
    fullDays: [
      {
        day: 1,
        theme: "Lanes & Coffee",
        activities: [
          { time: "08:00", name: "Hosier Lane street art & lane espresso", emoji: "☕" },
          { time: "11:00", name: "Flinders Street & Federation Square", emoji: "🏛️" },
          { time: "14:00", name: "Block Arcade & Royal Arcades", emoji: "🛍️" },
          { time: "19:00", name: "Chinatown or Fitzroy dinner", emoji: "🍜" },
        ],
      },
      {
        day: 2,
        theme: "Market & Museums",
        activities: [
          { time: "09:00", name: "Queen Victoria Market breakfast", emoji: "🧺" },
          { time: "12:30", name: "NGV Australia at Federation Square", emoji: "🖼️" },
          { time: "16:00", name: "Fitzroy Gardens & Cooks' Cottage", emoji: "🌿" },
          { time: "19:30", name: "Rooftop bar & Carlton dinner", emoji: "🍹" },
        ],
      },
      {
        day: 3,
        theme: "Great Ocean Road",
        activities: [
          { time: "07:30", name: "Day trip: the coastal drive", emoji: "🚗" },
          { time: "13:00", name: "Twelve Apostles' boardwalks", emoji: "🗿" },
          { time: "18:00", name: "Koala spotting at Kennett River", emoji: "🐨" },
        ],
      },
    ],
    restaurants: [
      { name: "Patricia Coffee Brewers", cuisine: "Standing-room espresso · $", emoji: "☕" },
      { name: "Chin Chin", cuisine: "Modern Asian · $$", emoji: "🍜" },
      { name: "Queen Victoria Market", cuisine: "Market grazing · $", emoji: "🧺" },
    ],
    city: "Melbourne",
    country: "Australia",
    airport: MEL,
    travelStyle: "cultural",
    interests: ["food", "museums", "nature"],
    highlights: [
      "The laneway espresso circuit",
      "Queen Vic Market's breakfast hour",
      "The Twelve Apostles by day trip",
    ],
  },
  {
    id: "sydney-4d-harbour",
    title: "Sydney 4-Day Harbour & Coast Trip",
    coverImage: null,
    gradient: "from-sky-500 to-teal-600",
    author: AI,
    days: 4,
    estimatedCost: 640,
    currency: "AUD",
    tags: ["Beaches", "Nature", "City Break"],
    excerpt:
      "Harbour icons, the Bondi-to-Coogee walk, Manly by ferry and the Blue Mountains — Sydney's best earned entirely outdoors.",
    weatherTip:
      "October–November and March–April are the swim-and-walk sweet spots. Summer (December–February) is beach season with real UV — slip, slop, slap.",
    fullDays: [
      {
        day: 1,
        theme: "Harbour Icons",
        activities: [
          { time: "09:00", name: "Opera House & Royal Botanic Garden", emoji: "🎭" },
          { time: "12:00", name: "Harbour walk to Mrs Macquarie's Chair", emoji: "🌊" },
          { time: "15:00", name: "The Rocks & Harbour Bridge", emoji: "🌉" },
          { time: "19:30", name: "Harbour-side dinner", emoji: "🦐" },
        ],
      },
      {
        day: 2,
        theme: "Bondi to Coogee",
        activities: [
          { time: "08:30", name: "Bondi Beach & the Icebergs pool", emoji: "🏊" },
          { time: "10:30", name: "The Bondi-to-Coogee coastal walk", emoji: "🚶" },
          { time: "14:00", name: "Coogee swim & fish and chips", emoji: "🍟" },
          { time: "19:00", name: "Surry Hills dinner", emoji: "🍽️" },
        ],
      },
      {
        day: 3,
        theme: "Manly by Ferry",
        activities: [
          { time: "09:30", name: "Ferry across the harbour — the best value cruise on earth", emoji: "⛴️" },
          { time: "11:00", name: "Manly Beach & the spit walk", emoji: "🏖️" },
          { time: "16:00", name: "Return ferry at sunset", emoji: "🌅" },
          { time: "19:00", name: "Chinatown or Barangaroo dinner", emoji: "🍜" },
        ],
      },
      {
        day: 4,
        theme: "Blue Mountains",
        activities: [
          { time: "07:30", name: "Train to Katoomba", emoji: "🚂" },
          { time: "10:00", name: "Three Sisters & the cliff walks", emoji: "⛰️" },
          { time: "16:00", name: "Scenic World or the Giant Stairway", emoji: "🪜" },
        ],
      },
    ],
    restaurants: [
      { name: "Sydney Cove Oyster Bar", cuisine: "Harbour seafood · $$$", emoji: "🦐" },
      { name: "Bourke Street Bakery", cuisine: "Bakery cult · $", emoji: "🥐" },
      { name: "Bennelong", cuisine: "Under the sails · $$$$", emoji: "🎭" },
    ],
    city: "Sydney",
    country: "Australia",
    airport: SYD,
    travelStyle: "active",
    interests: ["beaches", "nature", "food"],
    highlights: [
      "The Bondi-to-Coogee cliff walk",
      "The Manly ferry at sunset",
      "The Blue Mountains' actual wilderness",
    ],
  },
  {
    id: "ho-chi-minh-3d",
    title: "Ho Chi Minh City 3-Day Trip",
    coverImage: null,
    gradient: "from-amber-500 to-red-600",
    author: AI,
    days: 3,
    estimatedCost: 150,
    currency: "USD",
    tags: ["Foodie", "History", "City Break"],
    excerpt:
      "District 1's colonial core, the war-history weight of the museums and Cu Chi, rooftop bars over the Saigon River, and banh mi economics.",
    weatherTip:
      "December–January is dry and slightly cooler. Monsoon afternoons (May–October) arrive fast and leave fast — carry a shell.",
    fullDays: [
      {
        day: 1,
        theme: "Colonial Core & Street Food",
        activities: [
          { time: "08:00", name: "Banh mi breakfast & the Central Post Office", emoji: "🥖" },
          { time: "10:30", name: "Notre-Dame Basilica & the Book Street", emoji: "⛪" },
          { time: "14:00", name: "Ben Thanh Market & noodle lunch", emoji: "🍜" },
          { time: "18:30", name: "Rooftop bar over the Saigon River", emoji: "🍹" },
        ],
      },
      {
        day: 2,
        theme: "War History & Cu Chi",
        activities: [
          { time: "08:00", name: "Cu Chi Tunnels half-day tour", emoji: "🕳️" },
          { time: "14:00", name: "War Remnants Museum — heavy, essential", emoji: "🕊️" },
          { time: "17:30", name: "Reunification Palace", emoji: "🏛️" },
          { time: "19:30", name: "Seafood street dinner on Nguyen Thien Thuat", emoji: "🦐" },
        ],
      },
      {
        day: 3,
        theme: "River & Farewell",
        activities: [
          { time: "08:30", name: "Thich Quang Duc monument & Chinatown's Thien Hau temple", emoji: "🛕" },
          { time: "12:00", name: "Pho & iced coffee farewell", emoji: "🍜" },
          { time: "15:00", name: "Landmark 81's skyview or the river walk", emoji: "🌆" },
          { time: "18:00", name: "Airport — with drip-coffee supplies", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Banh Mi Huynh Hoa", cuisine: "The banh mi benchmark · $", emoji: "🥖" },
      { name: "Pho Hoa Pasteur", cuisine: "Pho institution · $", emoji: "🍜" },
      { name: "Anan Saigon", cuisine: "Michelin street-elevated · $$", emoji: "🥢" },
    ],
    city: "Ho Chi Minh City",
    country: "Vietnam",
    airport: SGN,
    travelStyle: "foodie",
    interests: ["food", "history", "nightlife"],
    highlights: [
      "The banh mi benchmark on Huynh Hoa's line",
      "Cu Chi's tunnels with a licensed guide",
      "Rooftop hour over the motorbike river",
    ],
  },
  {
    id: "kuala-lumpur-3d",
    title: "Kuala Lumpur 3-Day Trip",
    coverImage: null,
    gradient: "from-emerald-500 to-teal-700",
    author: AI,
    days: 3,
    estimatedCost: 180,
    currency: "USD",
    tags: ["Foodie", "Culture", "City Break"],
    excerpt:
      "Twin towers and rainbow stairs, three cuisines on one street, and the hawker courts where Malay, Chinese and Indian KL meet — on a modest budget.",
    weatherTip:
      "May–July is relatively dry on the west coast. Rain falls year-round in short tropical bursts; the heat never leaves.",
    fullDays: [
      {
        day: 1,
        theme: "Towers & Colonial Core",
        activities: [
          { time: "09:00", name: "Petronas Towers' skybridge (book ahead)", emoji: "🌆" },
          { time: "12:00", name: "KLCC park & lunch", emoji: "🌳" },
          { time: "15:00", name: "Merdeka Square & Sultan Abdul Samad", emoji: "🏛️" },
          { time: "19:00", name: "Jalan Alor hawker dinner", emoji: "🍢" },
        ],
      },
      {
        day: 2,
        theme: "Batu Caves & Temples",
        activities: [
          { time: "08:30", name: "Batu Caves' rainbow steps before the heat", emoji: "🪜" },
          { time: "12:00", name: "Brickfields' (Little India) banana-leaf lunch", emoji: "🍛" },
          { time: "15:00", name: "Thean Hou Temple", emoji: "🛕" },
          { time: "19:30", name: "Changkat Bukit Bintang nightlife", emoji: "🍹" },
        ],
      },
      {
        day: 3,
        theme: "Markets & Farewell",
        activities: [
          { time: "09:00", name: "Central Market & Chinatown's Petaling Street", emoji: "🛍️" },
          { time: "12:30", name: "Nasi lemak & teh tarik farewell", emoji: "🍚" },
          { time: "15:00", name: "KL Forest Eco Park canopy walk", emoji: "🌿" },
          { time: "18:00", name: "Airport — with white coffee supplies", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Jalan Alor stalls", cuisine: "Hawker row · $", emoji: "🍢" },
      { name: "Madras Lane", cuisine: "Petaling Street hawker · $", emoji: "🍜" },
      { name: "Yut Kee", cuisine: "Hainanese kopitiam · $", emoji: "🍞" },
    ],
    city: "Kuala Lumpur",
    country: "Malaysia",
    airport: KUL,
    travelStyle: "foodie",
    interests: ["food", "shopping", "history"],
    highlights: [
      "The skybridge between the towers",
      "Batu Caves' 272 rainbow steps",
      "Three cuisines, one food street",
    ],
  },
];

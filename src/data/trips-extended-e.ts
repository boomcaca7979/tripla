import type { Airport } from "@/types/flight";
import type { RawTripInput } from "./trips-extended-a";

// Extended trips, batch E — Americas, Oceania, and country-scale routes.

const AI = { kind: "ai" as const, name: "tripla AI", avatarColor: "from-blue-500 to-indigo-600", initials: "AI" };

const MIA: Airport = {
  iata: "MIA", icao: "KMIA", name: "Miami International Airport", city: "Miami", country: "USA",
  timezone: "America/New_York", latitude: 25.7959, longitude: -80.287,
};
const MCO: Airport = {
  iata: "MCO", icao: "KMCO", name: "Orlando International Airport", city: "Orlando", country: "USA",
  timezone: "America/New_York", latitude: 28.4312, longitude: -81.3081,
};
const ORD: Airport = {
  iata: "ORD", icao: "KORD", name: "O'Hare International Airport", city: "Chicago", country: "USA",
  timezone: "America/Chicago", latitude: 41.9742, longitude: -87.9073,
};
const IAD: Airport = {
  iata: "IAD", icao: "KIAD", name: "Washington Dulles International Airport", city: "Washington DC", country: "USA",
  timezone: "America/New_York", latitude: 38.9531, longitude: -77.4565,
};
const SEA: Airport = {
  iata: "SEA", icao: "KSEA", name: "Seattle-Tacoma International Airport", city: "Seattle", country: "USA",
  timezone: "America/Los_Angeles", latitude: 47.4502, longitude: -122.3088,
};
const SAN: Airport = {
  iata: "SAN", icao: "KSAN", name: "San Diego International Airport", city: "San Diego", country: "USA",
  timezone: "America/Los_Angeles", latitude: 32.7338, longitude: -117.1933,
};
const MSY: Airport = {
  iata: "MSY", icao: "KMSY", name: "Louis Armstrong New Orleans International Airport", city: "New Orleans", country: "USA",
  timezone: "America/Chicago", latitude: 29.9934, longitude: -90.2581,
};
const CUN: Airport = {
  iata: "CUN", icao: "MMUN", name: "Cancún International Airport", city: "Cancun", country: "Mexico",
  timezone: "America/Cancun", latitude: 21.0365, longitude: -86.8771,
};
const YUL: Airport = {
  iata: "YUL", icao: "CYUL", name: "Montréal-Trudeau International Airport", city: "Montreal", country: "Canada",
  timezone: "America/Toronto", latitude: 45.4706, longitude: -73.7408,
};
const YQB: Airport = {
  iata: "YQB", icao: "CYQB", name: "Québec City Jean Lesage International Airport", city: "Quebec City", country: "Canada",
  timezone: "America/Toronto", latitude: 46.7881, longitude: -71.3928,
};
const BNE: Airport = {
  iata: "BNE", icao: "YBBN", name: "Brisbane Airport", city: "Brisbane", country: "Australia",
  timezone: "Australia/Brisbane", latitude: -27.3842, longitude: 153.1175,
};
const OOL: Airport = {
  iata: "OOL", icao: "YBCG", name: "Gold Coast Airport", city: "Gold Coast", country: "Australia",
  timezone: "Australia/Brisbane", latitude: -28.1644, longitude: 153.5052,
};
const PER: Airport = {
  iata: "PER", icao: "YPPH", name: "Perth Airport", city: "Perth", country: "Australia",
  timezone: "Australia/Perth", latitude: -31.9403, longitude: 115.9669,
};
const ZQN: Airport = {
  iata: "ZQN", icao: "NZQN", name: "Queenstown Airport", city: "Queenstown", country: "New Zealand",
  timezone: "Pacific/Auckland", latitude: -45.0211, longitude: 168.7392,
};
const WLG: Airport = {
  iata: "WLG", icao: "NZWN", name: "Wellington International Airport", city: "Wellington", country: "New Zealand",
  timezone: "Pacific/Auckland", latitude: -41.3272, longitude: 174.8053,
};
const YYZ: Airport = {
  iata: "YYZ", icao: "CYYZ", name: "Toronto Pearson International Airport", city: "Toronto", country: "Canada",
  timezone: "America/Toronto", latitude: 43.6777, longitude: -79.6248,
};
const JFK: Airport = {
  iata: "JFK", icao: "KJFK", name: "John F. Kennedy International Airport", city: "New York", country: "USA",
  timezone: "America/New_York", latitude: 40.6413, longitude: -73.7781,
};
const LAS: Airport = {
  iata: "LAS", icao: "KLAS", name: "Harry Reid International Airport", city: "Las Vegas", country: "USA",
  timezone: "America/Los_Angeles", latitude: 36.084, longitude: -115.1537,
};
const CDG: Airport = {
  iata: "CDG", icao: "LFPG", name: "Charles de Gaulle Airport", city: "Paris", country: "France",
  timezone: "Europe/Paris", latitude: 49.0097, longitude: 2.5479,
};
const LIS: Airport = {
  iata: "LIS", icao: "LPPT", name: "Humberto Delgado Airport", city: "Lisbon", country: "Portugal",
  timezone: "Europe/Lisbon", latitude: 38.7742, longitude: -9.1342,
};
const ATH: Airport = {
  iata: "ATH", icao: "LGAV", name: "Athens Eleftherios Venizelos Airport", city: "Athens", country: "Greece",
  timezone: "Europe/Athens", latitude: 37.9364, longitude: 23.9445,
};
const BER: Airport = {
  iata: "BER", icao: "EDDB", name: "Berlin Brandenburg Airport", city: "Berlin", country: "Germany",
  timezone: "Europe/Berlin", latitude: 52.3667, longitude: 13.5033,
};
const ZRH: Airport = {
  iata: "ZRH", icao: "LSZH", name: "Zurich Airport", city: "Zurich", country: "Switzerland",
  timezone: "Europe/Zurich", latitude: 47.4647, longitude: 8.5492,
};
const VIE: Airport = {
  iata: "VIE", icao: "LOWW", name: "Vienna International Airport", city: "Vienna", country: "Austria",
  timezone: "Europe/Vienna", latitude: 48.1103, longitude: 16.5697,
};
const PRG: Airport = {
  iata: "PRG", icao: "LKPR", name: "Václav Havel Airport Prague", city: "Prague", country: "Czech Republic",
  timezone: "Europe/Prague", latitude: 50.1008, longitude: 14.26,
};
const BUD: Airport = {
  iata: "BUD", icao: "LHBP", name: "Budapest Ferenc Liszt International Airport", city: "Budapest", country: "Hungary",
  timezone: "Europe/Budapest", latitude: 47.4369, longitude: 19.2556,
};
const LHR: Airport = {
  iata: "LHR", icao: "EGLL", name: "London Heathrow Airport", city: "London", country: "United Kingdom",
  timezone: "Europe/London", latitude: 51.47, longitude: -0.4543,
};
const FCO: Airport = {
  iata: "FCO", icao: "LIRF", name: "Leonardo da Vinci–Fiumicino Airport", city: "Rome", country: "Italy",
  timezone: "Europe/Rome", latitude: 41.8003, longitude: 12.2389,
};
const SGN: Airport = {
  iata: "SGN", icao: "VVTS", name: "Tan Son Nhat International Airport", city: "Ho Chi Minh City", country: "Vietnam",
  timezone: "Asia/Ho_Chi_Minh", latitude: 10.8188, longitude: 106.8069,
};
const DPS: Airport = {
  iata: "DPS", icao: "WADD", name: "I Gusti Ngurah Rai International Airport", city: "Bali (Denpasar)", country: "Indonesia",
  timezone: "Asia/Makassar", latitude: -8.7482, longitude: 115.1675,
};
const SYD: Airport = {
  iata: "SYD", icao: "YSSY", name: "Sydney Kingsford Smith Airport", city: "Sydney", country: "Australia",
  timezone: "Australia/Sydney", latitude: -33.9399, longitude: 151.1753,
};

export const EXTENDED_TRIPS_E: RawTripInput[] = [
  {
    id: "miami-4d-beach-culture",
    title: "Miami 4-Day Beach & Culture Trip",
    coverImage: null,
    gradient: "from-cyan-400 to-pink-500",
    author: AI,
    days: 4,
    estimatedCost: 680,
    currency: "USD",
    tags: ["Beaches", "Culture", "Foodie"],
    excerpt:
      "Four days of the tropical capital: South Beach's deco strip, Wynwood's murals, Little Havana's cafecito and an Everglades airboat day.",
    weatherTip:
      "March–May is warm and dry. June–November is hurricane-aware; winter is peak season and peak rates.",
    fullDays: [
      {
        day: 1,
        theme: "South Beach",
        activities: [
          { time: "09:00", name: "South Beach sand & the lifeguard towers", emoji: "🏖️" },
          { time: "13:00", name: "Art-deco walking tour on Ocean Drive", emoji: "🏛️" },
          { time: "19:00", name: "Ocean Drive dinner & people-watching", emoji: "🍹" },
        ],
      },
      {
        day: 2,
        theme: "Wynwood & Design",
        activities: [
          { time: "10:00", name: "Wynwood Walls' mural blocks", emoji: "🎨" },
          { time: "13:30", name: "Design District & the museums", emoji: "🛍️" },
          { time: "19:30", name: "Brickell rooftop night", emoji: "🌃" },
        ],
      },
      {
        day: 3,
        theme: "Little Havana & the Bay",
        activities: [
          { time: "10:00", name: "Calle Ocho: cafecito, cigars, domino players", emoji: "☕" },
          { time: "14:00", name: "Vizcaya's villa & gardens", emoji: "🏰" },
          { time: "18:30", name: "Bayside sunset cruise option", emoji: "⛵" },
        ],
      },
      {
        day: 4,
        theme: "Everglades",
        activities: [
          { time: "09:00", name: "Airboat ride & gator show", emoji: "🐊" },
          { time: "15:00", name: "Final beach hour & airport", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Versailles", cuisine: "Little Havana Cuban · $$", emoji: "☕" },
      { name: "Joe's Stone Crab", cuisine: "Seasonal legend · $$$", emoji: "🦀" },
      { name: "La Sandwicherie", cuisine: "Late-night French-Cuban · $", emoji: "🥖" },
    ],
    city: "Miami",
    country: "USA",
    airport: MIA,
    travelStyle: "relaxed",
    interests: ["beaches", "food", "nightlife"],
    highlights: [
      "The art-deco strip at golden hour",
      "Calle Ocho's cafecito windows",
      "Gators from an airboat",
    ],
  },
  {
    id: "orlando-5d-theme-parks",
    title: "Orlando 5-Day Theme Parks Trip",
    coverImage: null,
    gradient: "from-purple-500 to-pink-500",
    author: AI,
    days: 5,
    estimatedCost: 800,
    currency: "USD",
    tags: ["Family", "Theme Parks", "First-Timer"],
    excerpt:
      "Five days through the park capital: two Disney days, one Universal day, a pool day, and Kennedy Space Center's rockets.",
    weatherTip:
      "February–May is the sweet spot. Rope-drop at opening, pool at 2pm, fireworks at close — the heat-proof rhythm.",
    fullDays: [
      {
        day: 1,
        theme: "Magic Kingdom",
        activities: [
          { time: "08:30", name: "Rope-drop & the mountains before the lines", emoji: "🏰" },
          { time: "15:00", name: "Pool & nap hour", emoji: "🏊" },
          { time: "20:30", name: "Fireworks return", emoji: "🎆" },
        ],
      },
      {
        day: 2,
        theme: "Epcot or Animal Kingdom",
        activities: [
          { time: "08:30", name: "Chosen park at opening", emoji: "🌏" },
          { time: "18:30", name: "Resort dinner & early night", emoji: "😴" },
        ],
      },
      {
        day: 3,
        theme: "Universal & the Wizarding World",
        activities: [
          { time: "08:00", name: "Diagon Alley before the crowd river", emoji: "🧙" },
          { time: "17:00", name: "CityWalk dinner", emoji: "🍔" },
        ],
      },
      {
        day: 4,
        theme: "Pool & International Drive",
        activities: [
          { time: "10:00", name: "Resort pool morning (build it in)", emoji: "🏖️" },
          { time: "15:00", name: "Icon Park's wheel & dinner", emoji: "🎡" },
        ],
      },
      {
        day: 5,
        theme: "Kennedy Space Center",
        activities: [
          { time: "09:00", name: "Rockets, shuttle & launchpad history (1h east)", emoji: "🚀" },
          { time: "17:00", name: "Departure", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Be Our Guest", cuisine: "In-park dining (booked) · $$$", emoji: "🏰" },
      { name: "The Wizarding World eateries", cuisine: "Butterbeer & bangers · $$", emoji: "🧙" },
      { name: "Chef Art Smith's Homecomin'", cuisine: "Disney Springs · $$", emoji: "🍗" },
    ],
    city: "Orlando",
    country: "USA",
    airport: MCO,
    travelStyle: "relaxed",
    interests: ["shopping", "food"],
    highlights: [
      "Rope-drop as the entire strategy",
      "The built-in pool day",
      "Real rockets at Kennedy",
    ],
  },
  {
    id: "chicago-4d-architecture-food",
    title: "Chicago 4-Day Architecture & Food Trip",
    coverImage: null,
    gradient: "from-blue-600 to-red-600",
    author: AI,
    days: 4,
    estimatedCost: 720,
    currency: "USD",
    tags: ["Culture", "Foodie", "Architecture"],
    excerpt:
      "Four days of the lakefront capital: the river cruise's skyscraper class, the Art Institute, deep-dish versus tavern-style, and blues at night.",
    weatherTip:
      "June–September is the reward season. Winter is arctic — the museums and pizza argue strongly for indoor visits.",
    fullDays: [
      {
        day: 1,
        theme: "The River & the Loop",
        activities: [
          { time: "10:00", name: "Architecture river cruise", emoji: "🛥️" },
          { time: "14:00", name: "Millennium Park & the Bean", emoji: "🫘" },
          { time: "18:00", name: "Deep-dish trial #1 (Lou Malnati's)", emoji: "🍕" },
        ],
      },
      {
        day: 2,
        theme: "Art & Museums",
        activities: [
          { time: "09:30", name: "The Art Institute's American Wing", emoji: "🖼️" },
          { time: "14:00", name: "Willis Tower's Skydeck ledge", emoji: "🏙️" },
          { time: "19:00", name: "Blues club night", emoji: "🎸" },
        ],
      },
      {
        day: 3,
        theme: "Neighborhoods & Pizza #2",
        activities: [
          { time: "10:00", name: "Wicker Park & Logan Square cafés", emoji: "☕" },
          { time: "14:00", name: "Lakefront trail walk or bike", emoji: "🚲" },
          { time: "18:00", name: "Tavern-style verdict (Piece or Vito & Nick's)", emoji: "🍕" },
        ],
      },
      {
        day: 4,
        theme: "Farewell",
        activities: [
          { time: "09:30", name: "Navy Pier or the Cultural Center's dome", emoji: "🎡" },
          { time: "13:00", name: "Italian beef sandwich finale", emoji: "🥪" },
          { time: "16:00", name: "Airport", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Lou Malnati's", cuisine: "Deep-dish camp · $$", emoji: "🍕" },
      { name: "Au Cheval", cuisine: "The burger queue · $$", emoji: "🍔" },
      { name: "Kingston Mines", cuisine: "Blues & drinks · $$", emoji: "🎸" },
    ],
    city: "Chicago",
    country: "USA",
    airport: ORD,
    travelStyle: "cultural",
    interests: ["museums", "food", "nightlife"],
    highlights: [
      "The architecture cruise, non-negotiable",
      "The pizza verdict, personally rendered",
      "Blues at midnight",
    ],
  },
  {
    id: "washington-dc-4d-museums",
    title: "Washington DC 4-Day Museums Trip",
    coverImage: null,
    gradient: "from-stone-500 to-blue-700",
    author: AI,
    days: 4,
    estimatedCost: 760,
    currency: "USD",
    tags: ["Museums", "History", "Family"],
    excerpt:
      "Four days of the free-museum capital: the monuments by night, Air & Space and Natural History, Georgetown's lanes and the National Archives.",
    weatherTip:
      "April–June and September–October are ideal. The museums are climate-controlled year-round — winter works fine.",
    fullDays: [
      {
        day: 1,
        theme: "The Mall & the Monuments",
        activities: [
          { time: "10:00", name: "Capitol & the Mall's east end", emoji: "🏛️" },
          { time: "14:00", name: "Smithsonian Natural History", emoji: "🦖" },
          { time: "20:00", name: "The monuments by night (Lincoln at its best)", emoji: "🌙" },
        ],
      },
      {
        day: 2,
        theme: "Air, Space & Archives",
        activities: [
          { time: "10:00", name: "National Air and Space Museum (booked entry)", emoji: "🚀" },
          { time: "14:00", name: "National Archives: the founding documents", emoji: "📜" },
          { time: "18:30", name: "Penn Quarter dinner", emoji: "🍽️" },
        ],
      },
      {
        day: 3,
        theme: "History & Culture",
        activities: [
          { time: "10:00", name: "NMAAHC (book well ahead) or American History", emoji: "🏛️" },
          { time: "15:00", name: "White House & Lafayette Square", emoji: "🏦" },
          { time: "19:00", name: "The Wharf waterfront dinner", emoji: "🦐" },
        ],
      },
      {
        day: 4,
        theme: "Georgetown & Departure",
        activities: [
          { time: "10:00", name: "Georgetown's lanes & the canal", emoji: "🚶" },
          { time: "14:00", name: "Airport", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Old Ebbitt Grill", cuisine: "DC institution · $$", emoji: "🦪" },
      { name: "Ben's Chili Bowl", cuisine: "Half-smoke legend · $", emoji: "🌭" },
      { name: "The Wharf fish counters", cuisine: "Waterfront · $$", emoji: "🦐" },
    ],
    city: "Washington DC",
    country: "USA",
    airport: IAD,
    travelStyle: "cultural",
    interests: ["museums", "history", "food"],
    highlights: [
      "The monuments after dark, empty and lit",
      "Seventeen free museums, honestly",
      "The Archives' founding ink",
    ],
  },
  {
    id: "seattle-4d-market-mountains",
    title: "Seattle 4-Day Market & Mountains Trip",
    coverImage: null,
    gradient: "from-emerald-600 to-slate-700",
    author: AI,
    days: 4,
    estimatedCost: 720,
    currency: "USD",
    tags: ["Nature", "Foodie", "City Break"],
    excerpt:
      "Four days between sound and volcano: Pike Place's fish throw, the Bainbridge ferry, a Mount Rainier day and the coffee pilgrimage.",
    weatherTip:
      "July–September is the dry, sunny window — plan Rainier for it. The rest of the year: bring the shell, love the museums.",
    fullDays: [
      {
        day: 1,
        theme: "Pike Place & the Waterfront",
        activities: [
          { time: "09:00", name: "Pike Place Market & the fish throw", emoji: "🐟" },
          { time: "13:00", name: "Waterfront & the great wheel", emoji: "🎡" },
          { time: "17:00", name: "Kerry Park's skyline & dinner on Capitol Hill", emoji: "🌆" },
        ],
      },
      {
        day: 2,
        theme: "Ferry & Coffee",
        activities: [
          { time: "10:00", name: "Bainbridge Island ferry & cycle loop", emoji: "⛴️" },
          { time: "15:00", name: "The original Starbucks & the independents", emoji: "☕" },
          { time: "19:00", name: "Chihuly Garden & Space Needle at dusk", emoji: "🌷" },
        ],
      },
      {
        day: 3,
        theme: "Mount Rainier Day",
        activities: [
          { time: "07:30", name: "Drive to Paradise's wildflower trails", emoji: "🏔️" },
          { time: "16:00", name: "Return via a salmon dinner", emoji: "🐟" },
        ],
      },
      {
        day: 4,
        theme: "Farewell",
        activities: [
          { time: "09:30", name: "Fremont Troll & Ballard Locks' salmon ladder", emoji: "🧌" },
          { time: "13:00", name: "Airport", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "The Pink Door", cuisine: "Waterfront Italian · $$", emoji: "🍝" },
      { name: "Pike Place counters", cuisine: "Market grazing · $", emoji: "🧺" },
      { name: "Un Bien", cuisine: "Caribbean roast sandwich · $", emoji: "🥖" },
    ],
    city: "Seattle",
    country: "USA",
    airport: SEA,
    travelStyle: "active",
    interests: ["nature", "food", "museums"],
    highlights: [
      "Rainier on a clear day — the whole reason",
      "The Bainbridge ferry as the cheap cruise",
      "Coffee at every altitude of quality",
    ],
  },
  {
    id: "san-diego-4d-beach-zoo",
    title: "San Diego 4-Day Beach & Zoo Trip",
    coverImage: null,
    gradient: "from-yellow-400 to-sky-500",
    author: AI,
    days: 4,
    estimatedCost: 700,
    currency: "USD",
    tags: ["Beaches", "Family", "Foodie"],
    excerpt:
      "Four days in the climate consensus: Balboa Park and the Zoo, La Jolla's sea lions, Coronado's sand and the California-burrito quest.",
    weatherTip:
      "March–June and September–October are the local picks. 'May Gray' mornings clear by noon — plan beaches late.",
    fullDays: [
      {
        day: 1,
        theme: "Balboa Park",
        activities: [
          { time: "09:00", name: "Balboa Park's museums & gardens", emoji: "🏛️" },
          { time: "13:00", name: "San Diego Zoo's panda-canyon walk", emoji: "🐼" },
          { time: "18:30", name: "North Park dinner", emoji: "🍔" },
        ],
      },
      {
        day: 2,
        theme: "La Jolla & the Coast",
        activities: [
          { time: "09:30", name: "La Jolla Cove's sea lions & kayaks", emoji: "🦭" },
          { time: "14:00", name: "Torrey Pines' cliff trail", emoji: "🌵" },
          { time: "18:30", name: "Sunset at Windansea", emoji: "🌅" },
        ],
      },
      {
        day: 3,
        theme: "Coronado & Old Town",
        activities: [
          { time: "10:00", name: "Coronado Ferry & the Hotel del's beach", emoji: "🏰" },
          { time: "15:00", name: "Old Town's Mexican heritage dinner", emoji: "🌮" },
        ],
      },
      {
        day: 4,
        theme: "Sunset Cliffs & Farewell",
        activities: [
          { time: "09:30", name: "Sunset Cliffs' coastal trail", emoji: "🌅" },
          { time: "13:00", name: "The California burrito verdict", emoji: "🌯" },
          { time: "15:30", name: "Airport", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Oscar's Mexican Seafood", cuisine: "The burrito camp · $", emoji: "🌯" },
      { name: "Liberty Public Market", cuisine: "Food hall · $$", emoji: "🧺" },
      { name: "C-level", cuisine: "Bay-view seafood · $$$", emoji: "🦐" },
    ],
    city: "San Diego",
    country: "USA",
    airport: SAN,
    travelStyle: "relaxed",
    interests: ["beaches", "food", "nature"],
    highlights: [
      "The Zoo's genuinely world-class collection",
      "La Jolla's sea lions up close",
      "Sunset Cliffs at golden hour",
    ],
  },
  {
    id: "new-orleans-3d-jazz-food",
    title: "New Orleans 3-Day Jazz & Food Trip",
    coverImage: null,
    gradient: "from-purple-600 to-green-600",
    author: AI,
    days: 3,
    estimatedCost: 450,
    currency: "USD",
    tags: ["Nightlife", "Foodie", "Culture"],
    excerpt:
      "Three days in the Crescent City: French Quarter mornings, Frenchmen Street's jazz nights, beignets at any hour and a swamp afternoon.",
    weatherTip:
      "February–May is festival season with mild air. Summer is heavy — the music moves indoors where it's just as good.",
    fullDays: [
      {
        day: 1,
        theme: "The Quarter",
        activities: [
          { time: "09:00", name: "Café du Monde beignets & Jackson Square", emoji: "🍩" },
          { time: "12:00", name: "The French Market & riverfront", emoji: "🎺" },
          { time: "19:00", name: "Dinner & Frenchmen Street's live jazz", emoji: "🎷" },
        ],
      },
      {
        day: 2,
        theme: "Garden District & Swamp",
        activities: [
          { time: "10:00", name: "St Charles streetcar & the Garden District", emoji: "🚋" },
          { time: "14:00", name: "Swamp tour through the bayou", emoji: "🐊" },
          { time: "20:00", name: "Creole dinner on Chartres", emoji: "🍲" },
        ],
      },
      {
        day: 3,
        theme: "History & Farewell",
        activities: [
          { time: "10:00", name: "St Louis Cemetery No 1 (guided) or the Mardi Gras museum", emoji: "⚰️" },
          { time: "13:00", name: "Po-boy & muffuletta verdicts", emoji: "🥪" },
          { time: "16:00", name: "Airport — powdered sugar in the bag", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Café du Monde", cuisine: "Beignets since 1862 · $", emoji: "🍩" },
      { name: "Dooky Chase's Restaurant", cuisine: "Creole legend · $$$", emoji: "🍲" },
      { name: "Domilise's", cuisine: "Po-boy institution · $", emoji: "🥪" },
    ],
    city: "New Orleans",
    country: "USA",
    airport: MSY,
    travelStyle: "foodie",
    interests: ["nightlife", "food", "history"],
    highlights: [
      "Frenchmen Street over Bourbon, always",
      "The swamp's quiet dragons",
      "Beignets at midnight, powdered and unrepentant",
    ],
  },
  {
    id: "cancun-5d-cenotes-ruins",
    title: "Cancún 5-Day Cenotes & Ruins Trip",
    coverImage: null,
    gradient: "from-cyan-500 to-emerald-600",
    author: AI,
    days: 5,
    estimatedCost: 650,
    currency: "USD",
    tags: ["Beaches", "History", "Nature"],
    excerpt:
      "Five days of the Yucatán's double act: Chichén Itzá's pyramid, cenote swims in cathedral-caves, Tulum's cliff ruins and Isla Mujeres' calm water.",
    weatherTip:
      "December–April is dry season. Cenote water is 24°C year-round — the swim is the air conditioning.",
    fullDays: [
      {
        day: 1,
        theme: "Arrive & the Strip",
        activities: [{ time: "14:00", name: "Playa Delfines' public sand & sunset", emoji: "🏖️" }],
      },
      {
        day: 2,
        theme: "Chichén Itzá & Cenote Ik Kil",
        activities: [
          { time: "08:00", name: "Early Chichén Itzá before the coaches", emoji: "🏛️" },
          { time: "13:30", name: "Swim in cenote Ik Kil's open sinkhole", emoji: "🕳️" },
        ],
      },
      {
        day: 3,
        theme: "Tulum & Cenote Dos Ojos",
        activities: [
          { time: "09:00", name: "Tulum's cliff-top ruins above the beach", emoji: "🌊" },
          { time: "14:00", name: "Dos Ojos' crystal cavern snorkel", emoji: "🤿" },
        ],
      },
      {
        day: 4,
        theme: "Isla Mujeres",
        activities: [
          { time: "09:00", name: "Catamaran or ferry to the island", emoji: "⛵" },
          { time: "16:00", name: "Punta Sur's cliffs & Cancún farewell dinner", emoji: "🌅" },
        ],
      },
      {
        day: 5,
        theme: "Departure",
        activities: [{ time: "11:00", name: "Beach hour & airport", emoji: "✈️" }],
      },
    ],
    restaurants: [
      { name: "La Habichuela", cuisine: "Yucatecan classic · $$$", emoji: "🦐" },
      { name: "El Fogón", cuisine: "Tacos campechanos · $", emoji: "🌮" },
      { name: "Isla Mujeres grill shacks", cuisine: "Catch of the day · $$", emoji: "🐟" },
    ],
    city: "Cancun",
    country: "Mexico",
    airport: CUN,
    travelStyle: "relaxed",
    interests: ["beaches", "history", "nature"],
    highlights: [
      "Chichén Itzá before the buses",
      "Cenote swims in stone cathedrals",
      "Tulum's ruins over the surf",
    ],
  },
  {
    id: "montreal-4d-food-festivals",
    title: "Montréal 4-Day Food & Festivals Trip",
    coverImage: null,
    gradient: "from-blue-600 to-red-500",
    author: AI,
    days: 4,
    estimatedCost: 600,
    currency: "CAD",
    tags: ["Foodie", "Culture", "City Break"],
    excerpt:
      "Four days of the French capital of North America: Vieux-Montréal's stones, the bagel rivalry, Jean-Talon's markets and Mont Royal's lookout.",
    weatherTip:
      "June–September is festival season with terrace life. Winter is seriously cold — the underground city and January rates compensate.",
    fullDays: [
      {
        day: 1,
        theme: "Vieux-Montréal",
        activities: [
          { time: "10:00", name: "Old Port & Notre-Dame Basilica's light show", emoji: "⛪" },
          { time: "14:00", name: "Vieux-Montréal's cobblestone wander", emoji: "🥖" },
          { time: "19:00", name: "Old-Port French dinner", emoji: "🍽️" },
        ],
      },
      {
        day: 2,
        theme: "The Bagel Rivalry",
        activities: [
          { time: "09:00", name: "St-Viateur vs Fairmount, both judged", emoji: "🥯" },
          { time: "12:00", name: "Mile End's cafés & vintage", emoji: "☕" },
          { time: "17:00", name: "Mount Royal lookout at sunset", emoji: "🌄" },
          { time: "20:00", name: "Poutine pilgrimage", emoji: "🍟" },
        ],
      },
      {
        day: 3,
        theme: "Markets & Plateau",
        activities: [
          { time: "10:00", name: "Jean-Talon Market's Quebec harvest", emoji: "🧺" },
          { time: "14:00", name: "The Plateau's murals & terraces", emoji: "🎨" },
          { time: "19:30", name: "Byward-tier BYOW dinner", emoji: "🍷" },
        ],
      },
      {
        day: 4,
        theme: "Farewell",
        activities: [
          { time: "10:00", name: "Olympic Park or the underground city", emoji: "🏟️" },
          { time: "14:00", name: "Airport with bagels boxed", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "St-Viateur Bagel", cuisine: "Wood-fired since 1957 · $", emoji: "🥯" },
      { name: "La Banquise", cuisine: "Poutine at 3am · $", emoji: "🍟" },
      { name: "Toqué!-tier or Bouillon Bilk", cuisine: "Quebec fine dining · $$$", emoji: "🍽️" },
    ],
    city: "Montreal",
    country: "Canada",
    airport: YUL,
    travelStyle: "foodie",
    interests: ["food", "history", "nightlife"],
    highlights: [
      "The bagel verdict, both baked",
      "Mont Royal's sunset lookout",
      "Poutine as serious cuisine",
    ],
  },
  {
    id: "quebec-city-3d-walled-charm",
    title: "Québec City 3-Day Walled Charm Trip",
    coverImage: null,
    gradient: "from-red-600 to-sky-500",
    author: AI,
    days: 3,
    estimatedCost: 420,
    currency: "CAD",
    tags: ["Culture", "History", "Romance"],
    excerpt:
      "Three days inside the only walled city north of Mexico: Château Frontenac, Petit Champlain's lanes, Montmorency Falls and maple everything.",
    weatherTip:
      "June–September is warm and festive; late September ignites the color. February's Carnaval is the deep-freeze classic.",
    fullDays: [
      {
        day: 1,
        theme: "The Walls",
        activities: [
          { time: "09:30", name: "Château Frontenac & Dufferin Terrace", emoji: "🏰" },
          { time: "12:30", name: "Petit Champlain's lanes & crêpes", emoji: "🥞" },
          { time: "16:00", name: "Walk the ramparts at golden hour", emoji: "🚶" },
          { time: "19:30", name: "French-Canadian sugar-pie dinner", emoji: "🍁" },
        ],
      },
      {
        day: 2,
        theme: "Falls & Plains",
        activities: [
          { time: "09:30", name: "Montmorency Falls' zipline or stairways", emoji: "💦" },
          { time: "14:00", name: "Plains of Abraham & the Citadel", emoji: "🏛️" },
          { time: "19:00", name: "Sugar-shack evening (seasonal)", emoji: "🥞" },
        ],
      },
      {
        day: 3,
        theme: "Farewell",
        activities: [
          { time: "10:00", name: "Marché du Vieux-Port & artisan lanes", emoji: "🧺" },
          { time: "14:00", name: "Airport", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Aux Anciens Canadiens", cuisine: "Québécois classics · $$", emoji: "🍁" },
      { name: "Le Clocher Penché", cuisine: "Modern Québec · $$$", emoji: "🍽️" },
      { name: "Paillard", cuisine: "Bakery lunches · $", emoji: "🥖" },
    ],
    city: "Quebec City",
    country: "Canada",
    airport: YQB,
    travelStyle: "cultural",
    interests: ["history", "food", "nature"],
    highlights: [
      "The Frontenac over the St Lawrence",
      "Montmorency's 83-meter drop",
      "Maple in every course",
    ],
  },
  {
    id: "brisbane-3d-river-coast",
    title: "Brisbane 3-Day River & Coast Trip",
    coverImage: null,
    gradient: "from-amber-500 to-sky-600",
    author: AI,
    days: 3,
    estimatedCost: 480,
    currency: "AUD",
    tags: ["City Break", "Beaches", "Nature"],
    excerpt:
      "Three days of the sunshine capital: South Bank's lagoon, koalas at Lone Pine, Story Bridge's climb and a Gold Coast day.",
    weatherTip:
      "March–October is the dry, warm stretch. Summer is hot and stormy — the river breeze helps.",
    fullDays: [
      {
        day: 1,
        theme: "River City",
        activities: [
          { time: "09:30", name: "South Bank Parklands & Streets Beach lagoon", emoji: "🏊" },
          { time: "14:00", name: "City botanic gardens & the river loop", emoji: "🌳" },
          { time: "18:30", name: "Story Bridge climb or riverside dinner", emoji: "🌉" },
        ],
      },
      {
        day: 2,
        theme: "Koalas & Valleys",
        activities: [
          { time: "09:00", name: "Lone Pine Koala Sanctuary by river cruise", emoji: "🐨" },
          { time: "14:00", name: "Fortitude Valley & New Farm's cafés", emoji: "☕" },
          { time: "19:00", name: "Eat Street or Howard Smith Wharves", emoji: "🍢" },
        ],
      },
      {
        day: 3,
        theme: "Gold Coast Day",
        activities: [
          { time: "09:00", name: "Train to the Gold Coast: Burleigh or Surfers", emoji: "🏖️" },
          { time: "16:00", name: "Return & airport", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Julius", cuisine: "Modern Australian · $$$", emoji: "🍽️" },
      { name: "South Bank collective kitchens", cuisine: "River eats · $$", emoji: "🦐" },
      { name: "Bonfire on the Eyre", cuisine: "Fortitude Valley · $$", emoji: "🔥" },
    ],
    city: "Brisbane",
    country: "Australia",
    airport: BNE,
    travelStyle: "relaxed",
    interests: ["beaches", "nature", "food"],
    highlights: [
      "Streets Beach — a city lagoon that works",
      "Koalas by river cruise",
      "The Story Bridge at night",
    ],
  },
  {
    id: "gold-coast-4d-surf-parks",
    title: "Gold Coast 4-Day Surf & Parks Trip",
    coverImage: null,
    gradient: "from-yellow-500 to-cyan-600",
    author: AI,
    days: 4,
    estimatedCost: 600,
    currency: "AUD",
    tags: ["Beaches", "Family", "Adventure"],
    excerpt:
      "Four days of the playground strip: surf mornings at Burleigh, one theme-park day, whale watching in season and the hinterland's rainforest.",
    weatherTip:
      "May–October is dry and mild with humpback season offshore. Summer is hot with stinger-aware surf.",
    fullDays: [
      {
        day: 1,
        theme: "Burleigh & the Point",
        activities: [
          { time: "08:30", name: "Burleigh Heads' surf & headland walk", emoji: "🏄" },
          { time: "15:00", name: "Beachfront markets or pool", emoji: "🍉" },
          { time: "18:30", name: "Burleigh's dinner strip", emoji: "🍤" },
        ],
      },
      {
        day: 2,
        theme: "Theme Park Day",
        activities: [
          { time: "09:00", name: "Movie World or Dreamworld, all day", emoji: "🎢" },
          { time: "18:30", name: "Surfers Paradise night walk", emoji: "🌃" },
        ],
      },
      {
        day: 3,
        theme: "Whales or Skyline",
        activities: [
          { time: "09:00", name: "Whale watch (Jun–Oct) or SkyPoint's view", emoji: "🐋" },
          { time: "15:00", name: "Currumbin's wildlife sanctuary", emoji: "🦜" },
        ],
      },
      {
        day: 4,
        theme: "Hinterland",
        activities: [
          { time: "08:30", name: "Springbrook's Natural Bridge & waterfalls", emoji: "🌿" },
          { time: "16:00", name: "Airport", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Rick Shores", cuisine: "Burleigh ocean dining · $$$", emoji: "🌊" },
      { name: "Nineteen at the Star", cuisine: "Skyline dining · $$$", emoji: "🍽️" },
      { name: "Beachfront fish & chips", cuisine: "Every evening · $", emoji: "🍟" },
    ],
    city: "Gold Coast",
    country: "Australia",
    airport: OOL,
    travelStyle: "active",
    interests: ["beaches", "nature"],
    highlights: [
      "Burleigh's headland over Surfers' towers",
      "Humpbacks offshore in season",
      "Rainforest an hour inland",
    ],
  },
  {
    id: "perth-4d-island-wine",
    title: "Perth 4-Day Island & Wine Trip",
    coverImage: null,
    gradient: "from-sky-400 to-emerald-600",
    author: AI,
    days: 4,
    estimatedCost: 620,
    currency: "AUD",
    tags: ["Beaches", "Nature", "Wine"],
    excerpt:
      "Four days in the sunniest capital: Rottnest's quokkas by bike, Kings Park's wildflowers, Cottesloe's sand and the Swan Valley's cellars.",
    weatherTip:
      "September–November is wildflower spring; March–May is calm and warm. Summer is seriously hot and dry.",
    fullDays: [
      {
        day: 1,
        theme: "Kings Park & the River",
        activities: [
          { time: "09:00", name: "Kings Park's skyline & botanic garden", emoji: "🌺" },
          { time: "14:00", name: "Swan River ferry or Elizabeth Quay", emoji: "🚤" },
          { time: "18:30", name: "Northbridge dinner", emoji: "🍽️" },
        ],
      },
      {
        day: 2,
        theme: "Rottnest Island",
        activities: [
          { time: "08:00", name: "Ferry & bike the bays", emoji: "🚲" },
          { time: "13:00", name: "Quokka selfie (gently, at distance)", emoji: "🐨" },
          { time: "17:00", name: "Return for a Fremantle dinner", emoji: "⚓" },
        ],
      },
      {
        day: 3,
        theme: "Beaches & Fremantle",
        activities: [
          { time: "09:30", name: "Cottesloe & Scarborough's beach path", emoji: "🏖️" },
          { time: "14:00", name: "Fremantle Prison & markets", emoji: "⚓" },
        ],
      },
      {
        day: 4,
        theme: "Swan Valley",
        activities: [
          { time: "09:30", name: "Wine route: cellars, chocolate, honey", emoji: "🍇" },
          { time: "16:00", name: "Airport", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Wildflower", cuisine: "Rooftop native menu · $$$", emoji: "🌿" },
      { name: "Bathers Beach House", cuisine: "Fremantle sands · $$", emoji: "🦐" },
      { name: "Cottesloe cafés", cuisine: "Beach brunch · $$", emoji: "☕" },
    ],
    city: "Perth",
    country: "Australia",
    airport: PER,
    travelStyle: "relaxed",
    interests: ["beaches", "nature", "food"],
    highlights: [
      "Quokkas — the world's happiest animal",
      "Kings Park bigger than Central Park",
      "The Swan Valley's urban wine route",
    ],
  },
  {
    id: "queenstown-4d-adventure",
    title: "Queenstown 4-Day Adventure Trip",
    coverImage: null,
    gradient: "from-emerald-500 to-sky-700",
    author: AI,
    days: 4,
    estimatedCost: 720,
    currency: "NZD",
    tags: ["Adventure", "Nature", "Adrenaline"],
    excerpt:
      "Four days in the adventure capital: bungee's birthplace, jet boats through canyons, a Milford Sound day and the gondola's luge.",
    weatherTip:
      "Every season is a different trip: summer for long days, winter for skiing, autumn for gold. Milford day-trips best in calm weather.",
    fullDays: [
      {
        day: 1,
        theme: "Arrive & the Gondola",
        activities: [
          { time: "14:00", name: "Skyline gondola & the luge runs", emoji: "🚡" },
          { time: "19:00", name: "Fergburger's famous queue", emoji: "🍔" },
        ],
      },
      {
        day: 2,
        theme: "Adrenaline Day",
        activities: [
          { time: "09:00", name: "Kawarau Bridge bungee (or Nevis for the brave)", emoji: "🪢" },
          { time: "14:00", name: "Shotover Jet's canyon spins", emoji: "🚤" },
          { time: "19:00", name: "Lakeside recovery dinner", emoji: "🍷" },
        ],
      },
      {
        day: 3,
        theme: "Milford Sound",
        activities: [
          { time: "07:00", name: "Coach or fly to the fjord cruise", emoji: "⛵" },
          { time: "16:00", name: "Stirling Falls' spray & seals", emoji: "🦭" },
        ],
      },
      {
        day: 4,
        theme: "Wine & Farewell",
        activities: [
          { time: "10:00", name: "Gibbston Valley's wine-cycle route", emoji: "🚲" },
          { time: "15:00", name: "Airport over the Remarkables", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Fergburger", cuisine: "The institution · $", emoji: "🍔" },
      { name: "Rātā", cuisine: "Josh Emett's regional menu · $$$", emoji: "🍽️" },
      { name: "Gibbston cellars", cuisine: "Pinot noir country · $$", emoji: "🍷" },
    ],
    city: "Queenstown",
    country: "New Zealand",
    airport: ZQN,
    travelStyle: "adventure",
    interests: ["nature", "sports", "food"],
    highlights: [
      "Bungee where it was invented",
      "Milford Sound's mile-high walls",
      "Pinot noir on the Gibbston trail",
    ],
  },
  {
    id: "wellington-2d-culture-coffee",
    title: "Wellington 2-Day Culture & Coffee Trip",
    coverImage: null,
    gradient: "from-blue-500 to-green-600",
    author: AI,
    days: 2,
    estimatedCost: 300,
    currency: "NZD",
    tags: ["Culture", "Foodie", "City Break"],
    excerpt:
      "Two days of the windy capital: Te Papa's national stories, the cable car, Weta's workshop magic and Cuba Street's coffee line.",
    weatherTip:
      "December–March is the warmest stretch. The famous wind is real — the museum-and-coffee density is the answer.",
    fullDays: [
      {
        day: 1,
        theme: "Te Papa & the Cable Car",
        activities: [
          { time: "09:30", name: "Te Papa Tongarewa's national museum (free)", emoji: "🏛️" },
          { time: "13:00", name: "Cable car up & the botanic garden descent", emoji: "🚋" },
          { time: "17:00", name: "Oriental Bay's promenade", emoji: "🌊" },
          { time: "19:30", name: "Courtenay Place dinner", emoji: "🍽️" },
        ],
      },
      {
        day: 2,
        theme: "Weta & Cuba Street",
        activities: [
          { time: "10:00", name: "Weta Workshop's film-magic tour", emoji: "🎬" },
          { time: "13:30", name: "Cuba Street's coffee & vintage crawl", emoji: "☕" },
          { time: "16:00", name: "Departure or the ferry to the South Island", emoji: "⛴️" },
        ],
      },
    ],
    restaurants: [
      { name: "Logan Brown", cuisine: "Wellington institution · $$$", emoji: "🍽️" },
      { name: "Fidel's Cafe", cuisine: "Cuba Street classic · $", emoji: "☕" },
      { name: "Mr. Go's", cuisine: "Asian sharing · $$", emoji: "🥟" },
    ],
    city: "Wellington",
    country: "New Zealand",
    airport: WLG,
    travelStyle: "cultural",
    interests: ["museums", "food", "nature"],
    highlights: [
      "Te Papa's depth, for free",
      "Weta's behind-the-scenes craft",
      "The coffee capital's roast line",
    ],
  },
  {
    id: "canada-7d-toronto-montreal",
    title: "Canada 7-Day Trip: Toronto & Montréal",
    coverImage: null,
    gradient: "from-red-500 to-blue-600",
    author: AI,
    days: 7,
    estimatedCost: 1050,
    currency: "CAD",
    tags: ["Multi-City", "Foodie", "Culture"],
    excerpt:
      "One week between Canada's two personalities: Toronto's towers and islands, the train to Montréal, and Québec City's walls to finish.",
    weatherTip:
      "June–September is festival season on both cities' terraces. Late September adds the fall color; winter is for the brave.",
    fullDays: [
      {
        day: 1,
        theme: "Toronto — Downtown & Islands",
        activities: [
          { time: "10:00", name: "CN Tower & the harbourfront", emoji: "🗼" },
          { time: "14:00", name: "Toronto Islands ferry picnic", emoji: "⛴️" },
        ],
      },
      {
        day: 2,
        theme: "Toronto — Markets & Museums",
        activities: [
          { time: "10:00", name: "St Lawrence Market's peameal bacon", emoji: "🥓" },
          { time: "14:00", name: "Kensington Market & the AGO", emoji: "🎨" },
        ],
      },
      {
        day: 3,
        theme: "Niagara Day Trip",
        activities: [{ time: "09:00", name: "The Falls' boat or the table-rock walk", emoji: "🌊" }],
      },
      {
        day: 4,
        theme: "Train to Montréal",
        activities: [{ time: "15:00", name: "Vieux-Montréal's first evening", emoji: "🥖" }],
      },
      {
        day: 5,
        theme: "Montréal — Food & Lookout",
        activities: [
          { time: "09:00", name: "The bagel rivalry & Mile End", emoji: "🥯" },
          { time: "17:30", name: "Mount Royal's sunset lookout", emoji: "🌄" },
        ],
      },
      {
        day: 6,
        theme: "Québec City Day or Stay",
        activities: [{ time: "09:00", name: "Rail to the walled city (or a Montréal museum day)", emoji: "🏰" }],
      },
      {
        day: 7,
        theme: "Departure",
        activities: [{ time: "11:00", name: "Poutine farewell & YUL airport", emoji: "✈️" }],
      },
    ],
    restaurants: [
      { name: "St Lawrence Market", cuisine: "Toronto's counter culture · $$", emoji: "🥓" },
      { name: "Toqué! tier orbouillons", cuisine: "Quebec kitchens · $$$", emoji: "🍽️" },
      { name: "La Banquise", cuisine: "Poutine at any hour · $", emoji: "🍟" },
    ],
    city: "Toronto",
    country: "Canada",
    airport: YYZ,
    travelStyle: "cultural",
    interests: ["food", "museums", "nature"],
    highlights: [
      "The islands' skyline picnic",
      "Niagara's unreasonable volume",
      "Two founding cultures in one week",
    ],
  },
  {
    id: "usa-east-coast-10d",
    title: "USA 10-Day Trip: The East Coast Triangle",
    coverImage: null,
    gradient: "from-blue-700 to-red-500",
    author: AI,
    days: 10,
    estimatedCost: 1800,
    currency: "USD",
    tags: ["Multi-City", "Museums", "Rail"],
    excerpt:
      "Ten days on the Northeast Corridor: New York's five days, Boston's revolution, Washington's monuments — all by Amtrak, no cars needed.",
    weatherTip:
      "September–October is the corridor's golden window. Amtrak Northeast Regional fares climb late — book when you book flights.",
    fullDays: [
      {
        day: 1,
        theme: "New York — Midtown",
        activities: [{ time: "15:00", name: "Arrival, Times Square & the first slice", emoji: "🍕" }],
      },
      {
        day: 2,
        theme: "New York — Downtown",
        activities: [{ time: "09:00", name: "Statue of Liberty & Brooklyn Bridge", emoji: "🗽" }],
      },
      {
        day: 3,
        theme: "New York — Museums & Parks",
        activities: [{ time: "09:30", name: "The Met & Central Park", emoji: "🖼️" }],
      },
      {
        day: 4,
        theme: "New York — Neighborhoods",
        activities: [{ time: "10:00", name: "Katz's, the High Line, Chelsea Market", emoji: "🥪" }],
      },
      {
        day: 5,
        theme: "New York — Flex",
        activities: [{ time: "10:00", name: "MoMA or the Tenement Museum", emoji: "🏚️" }],
      },
      {
        day: 6,
        theme: "Boston",
        activities: [{ time: "11:00", name: "Train north; the Freedom Trail's red line", emoji: "🔴" }],
      },
      {
        day: 7,
        theme: "Boston — Cambridge & Farewell",
        activities: [{ time: "10:00", name: "Harvard Yard & the North End's cannoli", emoji: "🥐" }],
      },
      {
        day: 8,
        theme: "Washington DC",
        activities: [{ time: "13:00", name: "Train south; the monuments by night", emoji: "🌙" }],
      },
      {
        day: 9,
        theme: "DC — Museums",
        activities: [{ time: "10:00", name: "Air & Space or the NMAAHC", emoji: "🚀" }],
      },
      {
        day: 10,
        theme: "DC — Departure",
        activities: [{ time: "12:00", name: "Archives & IAD airport", emoji: "✈️" }],
      },
    ],
    restaurants: [
      { name: "Katz's Delicatessen", cuisine: "NYC pastrami · $$", emoji: "🥪" },
      { name: "Mike's Pastry", cuisine: "Boston cannoli · $", emoji: "🥐" },
      { name: "Ben's Chili Bowl", cuisine: "DC half-smoke · $", emoji: "🌭" },
    ],
    city: "New York",
    country: "USA",
    airport: JFK,
    travelStyle: "cultural",
    interests: ["museums", "food", "history"],
    highlights: [
      "Three cities, zero rental cars",
      "The Freedom Trail's red brick line",
      "The monuments after dark",
    ],
  },
  {
    id: "usa-southwest-7d",
    title: "USA 7-Day Trip: The Southwest Loop",
    coverImage: null,
    gradient: "from-orange-500 to-red-700",
    author: AI,
    days: 7,
    estimatedCost: 1200,
    currency: "USD",
    tags: ["Road Trip", "Nature", "Adventure"],
    excerpt:
      "Seven days from Las Vegas through the canyon country: Zion's narrows, Bryce's hoodoos, Horseshoe Bend and the Grand Canyon's rim.",
    weatherTip:
      "April–May and September–October are ideal — warm days, cool nights. Summer bakes; winter rims can ice.",
    fullDays: [
      {
        day: 1,
        theme: "Las Vegas — Arrive",
        activities: [{ time: "16:00", name: "Strip night or early rest for the parks", emoji: "🎰" }],
      },
      {
        day: 2,
        theme: "Zion — The Narrows",
        activities: [{ time: "08:00", name: "Riverside Walk into the Virgin's narrows", emoji: "🥾" }],
      },
      {
        day: 3,
        theme: "Zion — Angels Landing",
        activities: [{ time: "07:00", name: "The chained ridge (permit) or Canyon Overlook", emoji: "⛰️" }],
      },
      {
        day: 4,
        theme: "Bryce Canyon",
        activities: [{ time: "08:00", name: "Sunrise among the hoodoos & the rim trail", emoji: "🧱" }],
      },
      {
        day: 5,
        theme: "Page — Horseshoe & Antelope",
        activities: [{ time: "09:00", name: "Horseshoe Bend & Antelope Canyon (booked)", emoji: "📸" }],
      },
      {
        day: 6,
        theme: "Grand Canyon South Rim",
        activities: [{ time: "08:00", name: "Rim trail & sunset at Hopi Point", emoji: "🌅" }],
      },
      {
        day: 7,
        theme: "Return to Vegas",
        activities: [{ time: "11:00", name: "Route 66 stops & Hoover Dam detour", emoji: "🛣️" }],
      },
    ],
    restaurants: [
      { name: "Springdale & Page local grills", cuisine: "Trail-town fare · $$", emoji: "🍔" },
      { name: "El Tovar Dining Room", cuisine: "Rim-side historic · $$$", emoji: "🏔️" },
      { name: "Las Vegas finals", cuisine: "Everything, at volume · $$$", emoji: "🎰" },
    ],
    city: "Las Vegas",
    country: "USA",
    airport: LAS,
    travelStyle: "adventure",
    interests: ["nature", "sports"],
    highlights: [
      "Zion's narrows waded upstream",
      "Bryce's sunrise amphitheater",
      "The Grand Canyon's rim at dusk",
    ],
  },
  {
    id: "australia-14d-east-coast",
    title: "Australia 14-Day Trip: The East Coast",
    coverImage: null,
    gradient: "from-cyan-500 to-amber-500",
    author: AI,
    days: 14,
    estimatedCost: 2200,
    currency: "AUD",
    tags: ["Multi-City", "Beaches", "Nature"],
    excerpt:
      "Two weeks down the east coast: Sydney's harbour, Byron's beaches, Brisbane's river, the Whitsundays' sailing and Cairns' reef.",
    weatherTip:
      "May–October is the dry, stinger-light window north. Summer (Dec–Feb) is hot, wet and jellyfish-seasoned in Far North QLD.",
    fullDays: [
      { day: 1, theme: "Sydney — Harbour", activities: [{ time: "14:00", name: "Opera House & the Rocks", emoji: "🎭" }] },
      { day: 2, theme: "Sydney — Bondi to Coogee", activities: [{ time: "08:30", name: "The coastal walk & Icebergs pool", emoji: "🏊" }] },
      { day: 3, theme: "Sydney — Blue Mountains", activities: [{ time: "08:00", name: "Three Sisters & the cliff walks", emoji: "⛰️" }] },
      { day: 4, theme: "Byron Bay", activities: [{ time: "10:00", name: "Fly south to Byron; lighthouse & beaches", emoji: "🏄" }] },
      { day: 5, theme: "Byron — Slow", activities: [{ time: "09:00", name: "Cape Byron sunrise & market day", emoji: "🌅" }] },
      { day: 6, theme: "Brisbane", activities: [{ time: "13:00", name: "South Bank & the river city", emoji: "🐨" }] },
      { day: 7, theme: "Gold Coast", activities: [{ time: "09:00", name: "Burleigh headland & the beach strip", emoji: "🏄" }] },
      { day: 8, theme: "Fly to the Whitsundays", activities: [{ time: "15:00", name: "Airlie Beach arrival", emoji: "⛵" }] },
      { day: 9, theme: "Whitsundays — Whitehaven", activities: [{ time: "08:00", name: "Whitehaven Beach's silica sand", emoji: "🏝️" }] },
      { day: 10, theme: "Whitsundays — Sail", activities: [{ time: "09:00", name: "Day sail & snorkel stop", emoji: "🤿" }] },
      { day: 11, theme: "Fly to Cairns", activities: [{ time: "16:00", name: "Esplanade evening", emoji: "🌴" }] },
      { day: 12, theme: "Great Barrier Reef", activities: [{ time: "08:00", name: "Outer-reef snorkel or dive day", emoji: "🐠" }] },
      { day: 13, theme: "Daintree & Kuranda", activities: [{ time: "09:00", name: "Rainforest skyrail & the Daintree river", emoji: "🌿" }] },
      { day: 14, theme: "Departure", activities: [{ time: "11:00", name: "CNS airport", emoji: "✈️" }] },
    ],
    restaurants: [
      { name: "Sydney fish markets & Bondi cafés", cuisine: "Harbour fare · $$", emoji: "🦐" },
      { name: "Airlie Beach marina grills", cuisine: "Sailing fuel · $$", emoji: "🐟" },
      { name: "Cairns Esplanade", cuisine: "Tropical plates · $$", emoji: "🥭" },
    ],
    city: "Sydney",
    country: "Australia",
    airport: SYD,
    travelStyle: "relaxed",
    interests: ["beaches", "nature", "food"],
    highlights: [
      "The harbour to the reef in two weeks",
      "Whitehaven's swirl of silica",
      "The outer reef's blue",
    ],
  },
  {
    id: "new-zealand-7d-south-island",
    title: "New Zealand 7-Day Trip: The South Island",
    coverImage: null,
    gradient: "from-sky-600 to-emerald-600",
    author: AI,
    days: 7,
    estimatedCost: 1260,
    currency: "NZD",
    tags: ["Road Trip", "Nature", "Adventure"],
    excerpt:
      "One week around the south: Queenstown's adventures, Wanaka's tree, Mount Cook's glacier road and thefiords' deep water.",
    weatherTip:
      "December–March is the long-day season; June–September adds snow to every view. Mountain weather changes fast — drive by daylight.",
    fullDays: [
      { day: 1, theme: "Queenstown — Arrive", activities: [{ time: "14:00", name: "Gondola & the lakefront", emoji: "🚡" }] },
      { day: 2, theme: "Queenstown — Adventure", activities: [{ time: "09:00", name: "Jet boat & bungee menu", emoji: "🪢" }] },
      { day: 3, theme: "Wanaka", activities: [{ time: "10:00", name: "Roys Peak's viewpoint or the lone tree", emoji: "🌳" }] },
      { day: 4, theme: "Mount Cook", activities: [{ time: "09:00", name: "Hooker Valley's swing bridges", emoji: "🏔️" }] },
      { day: 5, theme: "Te Anau & Milford", activities: [{ time: "08:00", name: "The fiord cruise beneath Mitre Peak", emoji: "⛵" }] },
      { day: 6, theme: "Glenorchy & Paradise", activities: [{ time: "10:00", name: "The road at the end of the map", emoji: "🛣️" }] },
      { day: 7, theme: "Departure", activities: [{ time: "11:00", name: "ZQN's alpine takeoff", emoji: "✈️" }] },
    ],
    restaurants: [
      { name: "Fergburger", cuisine: "Queenstown's queue · $", emoji: "🍔" },
      { name: "Kirkwood Village & Arrowtown cafés", cuisine: "Central Otago · $$", emoji: "🍷" },
      { name: "Te Anau lakefront kitchens", cuisine: "Fiordland fuel · $$", emoji: "🐟" },
    ],
    city: "Queenstown",
    country: "New Zealand",
    airport: ZQN,
    travelStyle: "adventure",
    interests: ["nature", "sports"],
    highlights: [
      "Milford beneath Mitre Peak",
      "Hooker Valley's three bridges",
      "The road to Paradise (it's real)",
    ],
  },
  {
    id: "spain-10d-andalusia",
    title: "Spain 10-Day Trip: Madrid & Andalusia",
    coverImage: null,
    gradient: "from-red-500 to-amber-600",
    author: AI,
    days: 10,
    estimatedCost: 1200,
    currency: "EUR",
    tags: ["Multi-City", "Culture", "History"],
    excerpt:
      "Ten days from Madrid's art vaults through Andalusia's Moorish trio — Córdoba, Seville and Granada — by fast trains.",
    weatherTip:
      "March–May and October–November are ideal. Andalusian summers exceed 40°C — the patios shut by day.",
    fullDays: [
      { day: 1, theme: "Madrid — Prado", activities: [{ time: "09:00", name: "The Prado's masters", emoji: "🖼️" }] },
      { day: 2, theme: "Madrid — Palace & Parks", activities: [{ time: "10:00", name: "Royal Palace & Retiro", emoji: "👑" }] },
      { day: 3, theme: "Madrid — Day Trip or Museums", activities: [{ time: "09:00", name: "Toledo or the Reina Sofía's Guernica", emoji: "🎨" }] },
      { day: 4, theme: "AVE to Córdoba", activities: [{ time: "10:00", name: "The Mezquita's forest of columns", emoji: "🕌" }] },
      { day: 5, theme: "Córdoba → Seville", activities: [{ time: "13:00", name: "Train on; Triana's tapas night", emoji: "🍷" }] },
      { day: 6, theme: "Seville — Alcázar", activities: [{ time: "09:00", name: "The Alcázar's Mudéjar halls", emoji: "🕌" }] },
      { day: 7, theme: "Seville — Cathedral & Flamenco", activities: [{ time: "10:00", name: "The Giralda climb & a tablaos night", emoji: "💃" }] },
      { day: 8, theme: "Seville → Granada", activities: [{ time: "14:00", name: "Albaicín's sunset mirador", emoji: "🌅" }] },
      { day: 9, theme: "Granada — Alhambra", activities: [{ time: "08:30", name: "The Nasrid Palaces (booked weeks out)", emoji: "🕌" }] },
      { day: 10, theme: "Departure", activities: [{ time: "12:00", name: "Final tapas & flight home", emoji: "✈️" }] },
    ],
    restaurants: [
      { name: "Taberna La Daniela", cuisine: "Madrid tapas · $$", emoji: "🍢" },
      { name: "Bodegas Castañeda", cuisine: "Granada free tapas · $", emoji: "🍷" },
      { name: "Espacio Eol (or Triana classics)", cuisine: "Seville · $$", emoji: "🥘" },
    ],
    city: "Madrid",
    country: "Spain",
    airport: {
      iata: "MAD", icao: "LEMD", name: "Adolfo Suárez Madrid–Barajas Airport", city: "Madrid", country: "Spain",
      timezone: "Europe/Madrid", latitude: 40.4936, longitude: -3.5668,
    },
    travelStyle: "cultural",
    interests: ["history", "food", "museums"],
    highlights: [
      "The Mezquita's forest of columns",
      "Seville's Alcázar and a real tablaos",
      "The Alhambra as the finale",
    ],
  },
  {
    id: "portugal-7d-lisbon-porto",
    title: "Portugal 7-Day Trip: Lisbon & Porto",
    coverImage: null,
    gradient: "from-yellow-500 to-blue-600",
    author: AI,
    days: 7,
    estimatedCost: 770,
    currency: "EUR",
    tags: ["Multi-City", "Foodie", "Culture"],
    excerpt:
      "One week between Portugal's two personalities: Lisbon's hills and fado, the Douro line north, and Porto's port-cellars finish.",
    weatherTip:
      "April–June and September–October are ideal. The Atlantic keeps both cities mild even in summer.",
    fullDays: [
      { day: 1, theme: "Lisbon — Alfama & Castle", activities: [{ time: "09:00", name: "São Jorge & Alfama's lanes", emoji: "🏰" }] },
      { day: 2, theme: "Lisbon — Belém", activities: [{ time: "09:00", name: "The original custard tarts & the monastery", emoji: "🥮" }] },
      { day: 3, theme: "Lisbon — Sintra Day", activities: [{ time: "08:30", name: "Pena Palace & the fairytale hills", emoji: "🏰" }] },
      { day: 4, theme: "Lisbon — Fado Night", activities: [{ time: "10:00", name: "LX Factory & Chiado; fado at night", emoji: "🎵" }] },
      { day: 5, theme: "Train to Porto", activities: [{ time: "13:00", name: "Ribeira & the Dom Luís bridge", emoji: "🌉" }] },
      { day: 6, theme: "Porto — Cellars & Lello", activities: [{ time: "10:00", name: "Port lodges & Livraria Lello (booked)", emoji: "🍷" }] },
      { day: 7, theme: "Douro or Departure", activities: [{ time: "09:00", name: "Pinhão's valley train or OPO airport", emoji: "✈️" }] },
    ],
    restaurants: [
      { name: "Pastéis de Belém", cuisine: "The originals · $", emoji: "🥮" },
      { name: "Café Santiago", cuisine: "Francesinha · $$", emoji: "🥪" },
      { name: "Cantina 32", cuisine: "Porto modern · $$", emoji: "🍷" },
    ],
    city: "Lisbon",
    country: "Portugal",
    airport: LIS,
    travelStyle: "cultural",
    interests: ["food", "history", "nature"],
    highlights: [
      "Sintra's palaces in the mist",
      "Fado where it was born",
      "The Douro's valley train",
    ],
  },
  {
    id: "greece-10d-athens-islands",
    title: "Greece 10-Day Trip: Athens & the Islands",
    coverImage: null,
    gradient: "from-blue-500 to-amber-500",
    author: AI,
    days: 10,
    estimatedCost: 1300,
    currency: "EUR",
    tags: ["Multi-City", "History", "Beaches"],
    excerpt:
      "Ten days of the classical dream: Athens' Acropolis, ferry hops through the Cyclades — Naxos, Paros or Mykonos — and Santorini's sunset finish.",
    weatherTip:
      "May–June and September–early October are the ferry-friendly sweet spots. Meltemi winds can ruffle July–August sailings.",
    fullDays: [
      { day: 1, theme: "Athens — Acropolis", activities: [{ time: "08:00", name: "The Acropolis at opening", emoji: "🏛️" }] },
      { day: 2, theme: "Athens — Museums & Plaka", activities: [{ time: "09:30", name: "The Acropolis Museum & Plaka lanes", emoji: "🏺" }] },
      { day: 3, theme: "Ferry to Naxos", activities: [{ time: "12:00", name: "Portara's temple gate at sunset", emoji: "🌅" }] },
      { day: 4, theme: "Naxos — Villages & Beaches", activities: [{ time: "10:00", name: "Mountain villages & Agios Prokopios", emoji: "🏖️" }] },
      { day: 5, theme: "Paros", activities: [{ time: "10:00", name: "Naoussa's harbour & Antiparos day", emoji: "⛵" }] },
      { day: 6, theme: "Paros — Slow", activities: [{ time: "09:00", name: "Beach day, taverna lunch, repeat", emoji: "🥗" }] },
      { day: 7, theme: "Mykonos (or another island)", activities: [{ time: "11:00", name: "Little Venice & the windmills", emoji: "🌬️" }] },
      { day: 8, theme: "Ferry to Santorini", activities: [{ time: "15:00", name: "First caldera view from Fira", emoji: "🤍" }] },
      { day: 9, theme: "Santorini — Oia & Wine", activities: [{ time: "10:00", name: "Akrotiri & an Assyrtiko tasting; Oia's sunset", emoji: "🍷" }] },
      { day: 10, theme: "Departure", activities: [{ time: "11:00", name: "JTR flight home", emoji: "✈️" }] },
    ],
    restaurants: [
      { name: "To Kafeneio", cuisine: "Athens taverna · $$", emoji: "🍲" },
      { name: "Naxos & Paros tavernas", cuisine: "Island plates · $$", emoji: "🥗" },
      { name: "Metaxy Mas", cuisine: "Santorini local pick · $$", emoji: "🍽️" },
    ],
    city: "Athens",
    country: "Greece",
    airport: ATH,
    travelStyle: "relaxed",
    interests: ["history", "beaches", "food"],
    highlights: [
      "The Acropolis before the heat",
      "Ferry decks across the Aegean",
      "Santorini's caldera as the finale",
    ],
  },
  {
    id: "germany-7d-berlin-munich",
    title: "Germany 7-Day Trip: Berlin & Munich",
    coverImage: null,
    gradient: "from-slate-600 to-yellow-500",
    author: AI,
    days: 7,
    estimatedCost: 980,
    currency: "EUR",
    tags: ["Multi-City", "History", "Culture"],
    excerpt:
      "One week between Germany's two capitals of character: Berlin's century of history, the ICE south, and Munich's beer gardens and Alps.",
    weatherTip:
      "May–September serves both cities' outdoor life. December's Christmas markets are the alternate highlight reel.",
    fullDays: [
      { day: 1, theme: "Berlin — The Wall & Mitte", activities: [{ time: "09:30", name: "Bernauer Straße & Museum Island", emoji: "🧱" }] },
      { day: 2, theme: "Berlin — Reichstag & Kreuzberg", activities: [{ time: "09:00", name: "The dome (booked) & Kreuzberg's canals", emoji: "🏛️" }] },
      { day: 3, theme: "Berlin — East Side & Clubs", activities: [{ time: "10:00", name: "East Side Gallery; one club night option", emoji: "🎧" }] },
      { day: 4, theme: "ICE to Munich", activities: [{ time: "14:00", name: "Marienplatz & first beer garden", emoji: "🍺" }] },
      { day: 5, theme: "Munich — Gardens & Residenz", activities: [{ time: "09:30", name: "Englischer Garten's surfers & Nymphenburg", emoji: "🌊" }] },
      { day: 6, theme: "Neuschwanstein Day", activities: [{ time: "08:00", name: "The fairytale castle & Alpsee", emoji: "🏰" }] },
      { day: 7, theme: "Departure", activities: [{ time: "11:00", name: "Viktualienmarkt farewell & MUC", emoji: "✈️" }] },
    ],
    restaurants: [
      { name: "Markthalle Neun", cuisine: "Berlin food hall · $$", emoji: "🥙" },
      { name: "Chinesischer Turm", cuisine: "Grand beer garden · $$", emoji: "🍺" },
      { name: "Viktualienmarkt", cuisine: "Market lunch · $", emoji: "🥨" },
    ],
    city: "Berlin",
    country: "Germany",
    airport: BER,
    travelStyle: "cultural",
    interests: ["history", "food", "nightlife"],
    highlights: [
      "Berlin's Wall trace and museum vaults",
      "The ICE train between two worlds",
      "Beer gardens as civic religion",
    ],
  },
  {
    id: "switzerland-7d-alpine",
    title: "Switzerland 7-Day Trip: Lakes & Peaks",
    coverImage: null,
    gradient: "from-red-500 to-sky-600",
    author: AI,
    days: 7,
    estimatedCost: 1750,
    currency: "CHF",
    tags: ["Rail", "Nature", "Adventure"],
    excerpt:
      "One week on Swiss rails: Lucerne's lake, the GoldenPass to Interlaken, Jungfraujoch's rooftop of Europe and Zermatt's Matterhorn.",
    weatherTip:
      "June–September opens all the mountain lifts. Winter is the ski season — the same rails, different gear. Peak prices match the views.",
    fullDays: [
      { day: 1, theme: "Lucerne — Arrival", activities: [{ time: "14:00", name: "Chapel Bridge & the lakefront", emoji: "🌉" }] },
      { day: 2, theme: "Lucerne — Pilatus or Rigi", activities: [{ time: "09:00", name: "Steamer + cog railway up the mountain", emoji: "🚞" }] },
      { day: 3, theme: "GoldenPass to Interlaken", activities: [{ time: "11:00", name: "The scenic rail through the Brünig", emoji: "🚄" }] },
      { day: 4, theme: "Jungfraujoch", activities: [{ time: "08:00", name: "The Top of Europe's ice palace & view", emoji: "🏔️" }] },
      { day: 5, theme: "Lauterbrunnen & Grindelwald", activities: [{ time: "09:30", name: "The valley of 72 waterfalls", emoji: "💦" }] },
      { day: 6, theme: "Zermatt & the Matterhorn", activities: [{ time: "09:00", name: "Gornergrat's railway & the iconic peak", emoji: "⛰️" }] },
      { day: 7, theme: "Departure", activities: [{ time: "11:00", name: "Rail to Geneva or Zurich", emoji: "🚄" }] },
    ],
    restaurants: [
      { name: "Wirtshaus Taube", cuisine: "Lucerne Swiss · $$$", emoji: "🧀" },
      { name: "Hüsi Bistro", cuisine: "Interlaken local · $$", emoji: "🥔" },
      { name: "Zermatt raclette houses", cuisine: "Mountain cheese · $$", emoji: "🏔️" },
    ],
    city: "Zurich",
    country: "Switzerland",
    airport: ZRH,
    travelStyle: "active",
    interests: ["nature", "sports", "food"],
    highlights: [
      "Jungfraujoch's rooftop of Europe",
      "Lauterbrunnen's 72 waterfalls",
      "The Matterhorn from Gornergrat",
    ],
  },
  {
    id: "austria-5d-vienna-salzburg",
    title: "Austria 5-Day Trip: Vienna & Salzburg",
    coverImage: null,
    gradient: "from-amber-500 to-emerald-700",
    author: AI,
    days: 5,
    estimatedCost: 850,
    currency: "EUR",
    tags: ["Culture", "Music", "History"],
    excerpt:
      "Five days of the imperial route: Vienna's palaces and cafés, the train through the lakes, and Salzburg's Mozart-and-hills finale.",
    weatherTip:
      "April–June and September–October are ideal. December's Christkindlmärkte are the musical-alternative season.",
    fullDays: [
      { day: 1, theme: "Vienna — Ring & Cafés", activities: [{ time: "10:00", name: "The Hofburg & a proper café hour", emoji: "☕" }] },
      { day: 2, theme: "Vienna — Schönbrunn & Museums", activities: [{ time: "09:00", name: "Schönbrunn's palace & gardens; Kunsthistorisches", emoji: "👑" }] },
      { day: 3, theme: "Vienna — Music Night", activities: [{ time: "10:00", name: "The Naschmarkt; a Konzert or Staatsoper night", emoji: "🎻" }] },
      { day: 4, theme: "Train to Salzburg", activities: [{ time: "13:00", name: "The fortress & Getreidegasse", emoji: "🏰" }] },
      { day: 5, theme: "Salzburg — Lakes & Departure", activities: [{ time: "09:00", name: "Salzkammergut lake morning & airport", emoji: "🏔️" }] },
    ],
    restaurants: [
      { name: "Café Sperl", cuisine: "Viennese coffee house · $$", emoji: "☕" },
      { name: "Figlmüller", cuisine: "The schnitzel · $$$", emoji: "🍗" },
      { name: "St Peter Stiftskulinarium", cuisine: "Europe's oldest restaurant · $$$", emoji: "🏰" },
    ],
    city: "Vienna",
    country: "Austria",
    airport: VIE,
    travelStyle: "cultural",
    interests: ["history", "museums", "food"],
    highlights: [
      "Schönbrunn's imperial scale",
      "A Staatsoper night (standing tickets exist)",
      "Salzburg's fortress at sunset",
    ],
  },
  {
    id: "florence-2d-renaissance",
    title: "Florence 2-Day Renaissance Trip",
    coverImage: null,
    gradient: "from-orange-500 to-red-700",
    author: AI,
    days: 2,
    estimatedCost: 260,
    currency: "EUR",
    tags: ["Museums", "Culture", "Art"],
    excerpt:
      "Two days in the Renaissance's workshop: the dome's climb, David at opening, the Uffizi's Botticellis and Oltrarno's artisans.",
    weatherTip:
      "April–May and late September–October are ideal. The dome and Uffizi slots sell out — book both before the trip.",
    fullDays: [
      {
        day: 1,
        theme: "The Dome & David",
        activities: [
          { time: "08:15", name: "Brunelleschi's dome climb (booked slot)", emoji: "⛪" },
          { time: "11:00", name: "The Accademia's David", emoji: "🗿" },
          { time: "15:00", name: "San Lorenzo & Medici chapels", emoji: "🏛️" },
          { time: "19:00", name: "Bistecca alla fiorentina (share it)", emoji: "🥩" },
        ],
      },
      {
        day: 2,
        theme: "Uffizi & Oltrarno",
        activities: [
          { time: "08:30", name: "The Uffizi at opening (booked)", emoji: "🖼️" },
          { time: "13:00", name: "Oltrarno's artisan workshops", emoji: "🛠️" },
          { time: "18:00", name: "Piazzale Michelangelo's sunset", emoji: "🌄" },
        ],
      },
    ],
    restaurants: [
      { name: "Trattoria Mario", cuisine: "Lunch institution · $$", emoji: "🍝" },
      { name: "All'Antico Vinaio", cuisine: "Schiacciata queues · $", emoji: "🥪" },
      { name: "La Giostra", cuisine: "Hapsburg romance · $$$", emoji: "🍷" },
    ],
    city: "Florence",
    country: "Italy",
    airport: {
      iata: "FLR", icao: "LIRQ", name: "Florence Peretola Airport", city: "Florence", country: "Italy",
      timezone: "Europe/Rome", latitude: 43.81, longitude: 11.2051,
    },
    travelStyle: "cultural",
    interests: ["museums", "food", "history"],
    highlights: [
      "The dome's 463 steps, booked",
      "David at the opening hour",
      "Piazzale Michelangelo's farewell",
    ],
  },
  {
    id: "vienna-3d-imperial",
    title: "Vienna 3-Day Imperial Trip",
    coverImage: null,
    gradient: "from-amber-500 to-purple-700",
    author: AI,
    days: 3,
    estimatedCost: 420,
    currency: "EUR",
    tags: ["Culture", "History", "Music"],
    excerpt:
      "Three days of the imperial city: Schönbrunn's palace, the Ring's grand buildings, café-hour sachertorte and one concert night.",
    weatherTip:
      "April–June and September–October are ideal. December's markets and concert halls are the alternative Vienna.",
    fullDays: [
      {
        day: 1,
        theme: "The Ring",
        activities: [
          { time: "09:30", name: "The Hofburg & Spanish Riding School", emoji: "🐎" },
          { time: "13:00", name: "St Stephen's Cathedral & the Graben", emoji: "⛪" },
          { time: "16:00", name: "Café Sperl's sachertorte hour", emoji: "🍰" },
          { time: "19:30", name: "Staatsoper or Musikverein night", emoji: "🎻" },
        ],
      },
      {
        day: 2,
        theme: "Schönbrunn & Museums",
        activities: [
          { time: "09:00", name: "Schönbrunn Palace & the gardens", emoji: "👑" },
          { time: "14:30", name: "Kunsthistorisches' Bruegels", emoji: "🖼️" },
          { time: "19:00", name: "Naschmarkt & dinner in the Museumsquartier", emoji: "🍽️" },
        ],
      },
      {
        day: 3,
        theme: "Belvedere & Farewell",
        activities: [
          { time: "09:30", name: "The Belvedere's Klimt Kiss", emoji: "💋" },
          { time: "13:00", name: "Prater's Ferris wheel", emoji: "🎡" },
          { time: "16:00", name: "Airport", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Figlmüller", cuisine: "The original schnitzel · $$$", emoji: "🍗" },
      { name: "Café Central", cuisine: "The grand café · $$", emoji: "☕" },
      { name: "Zum Schwarzen Kameel", cuisine: "Since 1618 · $$$", emoji: "🍽️" },
    ],
    city: "Vienna",
    country: "Austria",
    airport: VIE,
    travelStyle: "cultural",
    interests: ["history", "museums", "food"],
    highlights: [
      "Schönbrunn's gardens at opening",
      "Klimt's Kiss in the Belvedere",
      "A concert in the Musikverein's golden hall",
    ],
  },
  {
    id: "prague-2d-fairytale-weekend",
    title: "Prague 2-Day Fairytale Weekend",
    coverImage: null,
    gradient: "from-rose-500 to-amber-600",
    author: AI,
    days: 2,
    estimatedCost: 220,
    currency: "EUR",
    tags: ["City Break", "Culture", "Weekend"],
    excerpt:
      "48 hours of the hundred spires: the castle at opening, Charles Bridge before dawn, Old Town's astronomical hour and Petřín's views.",
    weatherTip:
      "April–June and September–October are ideal. Winter is cold and cinematic; summer is crowded but the spires don't mind.",
    fullDays: [
      {
        day: 1,
        theme: "The Castle Side",
        activities: [
          { time: "08:00", name: "Prague Castle & St Vitus at opening", emoji: "🏰" },
          { time: "11:00", name: "Golden Lane & the Lesser Town", emoji: "🏘️" },
          { time: "14:00", name: "Charles Bridge as the crowds thin", emoji: "🌉" },
          { time: "19:00", name: "Old Town square's astronomical show", emoji: "🌌" },
        ],
      },
      {
        day: 2,
        theme: "Views & Jewish Quarter",
        activities: [
          { time: "09:30", name: "The Jewish Quarter's synagogues & cemetery", emoji: "✡️" },
          { time: "13:00", name: "Petřín Hill's funicular & tower", emoji: "🗼" },
          { time: "16:00", name: "Trdelník verdict & departure", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Lokál Dlouhááá", cuisine: "Pilsner & goulash · $$", emoji: "🍺" },
      { name: "Café Savoy", cuisine: "Grand café · $$", emoji: "☕" },
      { name: "Havelské tržiště fruit stalls", cuisine: "Market snack · $", emoji: "🍑" },
    ],
    city: "Prague",
    country: "Czech Republic",
    airport: PRG,
    travelStyle: "cultural",
    interests: ["history", "food"],
    highlights: [
      "Charles Bridge at dawn, empty",
      "The astronomical clock's hourly show",
      "Petřín's miniature Eiffel view",
    ],
  },
  {
    id: "czech-4d-prague-bohemia",
    title: "Czech Republic 4-Day Trip: Prague & Bohemia",
    coverImage: null,
    gradient: "from-emerald-600 to-rose-600",
    author: AI,
    days: 4,
    estimatedCost: 400,
    currency: "EUR",
    tags: ["Culture", "History", "Nature"],
    excerpt:
      "Four days beyond the postcard: Prague's essentials, a Český Krumlov day, and Kutná Hora's bone chapel or Bohemian Switzerland's rocks.",
    weatherTip:
      "May–September suits the Bohemian Switzerland hikes; December adds Krumlov's castle in snow.",
    fullDays: [
      { day: 1, theme: "Prague — Castle & Bridge", activities: [{ time: "08:00", name: "The castle & Charles Bridge at opening", emoji: "🏰" }] },
      { day: 2, theme: "Prague — Old Town & Views", activities: [{ time: "09:30", name: "The Jewish Quarter & Petřín's view", emoji: "🗼" }] },
      { day: 3, theme: "Český Krumlov Day", activities: [{ time: "09:00", name: "The UNESCO village's castle & river bend", emoji: "🏘️" }] },
      { day: 4, theme: "Bohemian Switzerland or Kutná Hora", activities: [{ time: "08:30", name: "Pravčická's rock arch or the Sedlec ossuary", emoji: "🪨" }] },
    ],
    restaurants: [
      { name: "Lokál", cuisine: "Pilsner institution · $$", emoji: "🍺" },
      { name: "Krumlov riverside inns", cuisine: "Bohemian plates · $$", emoji: "🍲" },
      { name: "U Medvídků", cuisine: "Brewpub since 1466 · $$", emoji: "🍺" },
    ],
    city: "Prague",
    country: "Czech Republic",
    airport: PRG,
    travelStyle: "cultural",
    interests: ["history", "nature", "food"],
    highlights: [
      "Krumlov's river-wrapped castle",
      "The ossuary's honest strangeness",
      "Bohemian Switzerland's arch",
    ],
  },
  {
    id: "hungary-3d-budapest-deep",
    title: "Hungary 3-Day Budapest Deep Trip",
    coverImage: null,
    gradient: "from-emerald-600 to-amber-600",
    author: AI,
    days: 3,
    estimatedCost: 240,
    currency: "EUR",
    tags: ["Culture", "Spas", "Nightlife"],
    excerpt:
      "Three days beyond the baths: both riverbanks, the Jewish Quarter's layers, Margaret Island's gardens and a Danube-bend escape to Szentendre.",
    weatherTip:
      "April–June and September–October are ideal. Winter bathing in steaming pools is the signature; December adds markets.",
    fullDays: [
      {
        day: 1,
        theme: "Buda & the River",
        activities: [
          { time: "09:00", name: "Fisherman's Bastion & Matthias Church", emoji: "🏰" },
          { time: "13:00", name: "Castle walk down to the Chain Bridge", emoji: "🌉" },
          { time: "19:00", name: "Parliament lit from Batthyány Square", emoji: "🏛️" },
        ],
      },
      {
        day: 2,
        theme: "Pest & the Quarter",
        activities: [
          { time: "10:00", name: "Dohány Street Synagogue & the Quarter", emoji: "🕍" },
          { time: "13:00", name: "Great Market Hall & lángos", emoji: "🧀" },
          { time: "16:00", name: "Széchenyi or Rudas bath session", emoji: "♨️" },
          { time: "20:00", name: "Szimpla Kert before midnight", emoji: "🍹" },
        ],
      },
      {
        day: 3,
        theme: "Szentendre & Farewell",
        activities: [
          { time: "09:30", name: "Danube-bend train to Szentendre's artist lanes", emoji: "🎨" },
          { time: "15:00", name: "Margaret Island stroll & airport", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Café Central", cuisine: "The grand café · $$", emoji: "🍰" },
      { name: "Mazel Tov", cuisine: "Quarter courtyard · $$", emoji: "🌿" },
      { name: "Retro Lángos", cuisine: "Market hall · $", emoji: "🧀" },
    ],
    city: "Budapest",
    country: "Hungary",
    airport: BUD,
    travelStyle: "cultural",
    interests: ["history", "food", "nightlife"],
    highlights: [
      "The baths as a civic institution",
      "Szimpla's ruin-bar origin",
      "Szentendre's Danube-bend escape",
    ],
  },
  {
    id: "uk-7d-england-edinburgh",
    title: "UK 7-Day Trip: England & Scotland",
    coverImage: null,
    gradient: "from-blue-700 to-green-700",
    author: AI,
    days: 7,
    estimatedCost: 1260,
    currency: "GBP",
    tags: ["Multi-City", "Rail", "History"],
    excerpt:
      "One week up the spine: four London days, the east-coast rail line to York, and Edinburgh's castle-and-closes finale.",
    weatherTip:
      "May–September is the mildest rail-window. The LNER line up the coast is the journey — book a left-side seat for the sea.",
    fullDays: [
      { day: 1, theme: "London — Westminster & River", activities: [{ time: "09:30", name: "Westminster & the South Bank walk", emoji: "⛪" }] },
      { day: 2, theme: "London — Museums & Tower", activities: [{ time: "09:30", name: "British Museum & the Tower", emoji: "👑" }] },
      { day: 3, theme: "London — Villages & Parks", activities: [{ time: "10:00", name: "Notting Hill, Hyde Park & a West End show", emoji: "🎭" }] },
      { day: 4, theme: "London — Day Trip", activities: [{ time: "08:30", name: "Bath or Cambridge by rail", emoji: "🚆" }] },
      { day: 5, theme: "LNER to York", activities: [{ time: "12:00", name: "The Shambles & York Minster", emoji: "🛕" }] },
      { day: 6, theme: "Rail to Edinburgh", activities: [{ time: "13:00", name: "The Royal Mile & castle esplanade", emoji: "🏰" }] },
      { day: 7, theme: "Edinburgh — Arthur's Seat & Departure", activities: [{ time: "08:00", name: "Sunrise on Arthur's Seat & airport", emoji: "🌄" }] },
    ],
    restaurants: [
      { name: "Borough Market", cuisine: "London grazing · $$", emoji: "🧀" },
      { name: "Yorkshire pudding houses", cuisine: "The roast, done right · $$", emoji: "🍗" },
      { name: "The Witchery by the Castle", cuisine: "Edinburgh theatre · $$$$", emoji: "🏰" },
    ],
    city: "London",
    country: "United Kingdom",
    airport: LHR,
    travelStyle: "cultural",
    interests: ["history", "museums", "food"],
    highlights: [
      "The east-coast rail line's sea views",
      "York's Shambles at dawn",
      "Arthur's Seat inside a capital",
    ],
  },
  {
    id: "france-10d-paris-provence",
    title: "France 10-Day Trip: Paris & Provence",
    coverImage: null,
    gradient: "from-lavender-500 to-amber-500",
    author: AI,
    days: 10,
    estimatedCost: 1500,
    currency: "EUR",
    tags: ["Multi-City", "Culture", "Foodie"],
    excerpt:
      "Ten days from the capital to the south: Paris' museums and Montmartre, the TGV to Avignon, and the Provence triangle — Arles, Aix, the calanques.",
    weatherTip:
      "May–June and September are ideal — lavender (late June–July) and market season. August is hot and Paris-empty.",
    fullDays: [
      { day: 1, theme: "Paris — Islands & Louvre", activities: [{ time: "09:00", name: "The Louvre at first entry", emoji: "🖼️" }] },
      { day: 2, theme: "Paris — Montmartre & Marais", activities: [{ time: "09:00", name: "Sacré-Cœur & the Marais", emoji: "🎨" }] },
      { day: 3, theme: "Paris — Versailles or the Axis", activities: [{ time: "08:30", name: "Versailles' first slot", emoji: "👑" }] },
      { day: 4, theme: "Paris — Musées & Passages", activities: [{ time: "10:00", name: "Orsay & the covered passages", emoji: "🏛️" }] },
      { day: 5, theme: "TGV to Avignon", activities: [{ time: "14:00", name: "The Papal Palace & the Rhône bridge", emoji: "🏰" }] },
      { day: 6, theme: "Provence — Luberon Villages", activities: [{ time: "09:30", name: "Gordes & Roussillon's ochre cliffs (car day)", emoji: "🏞️" }] },
      { day: 7, theme: "Provence — Arles & Van Gogh", activities: [{ time: "10:00", name: "Arles' arena & the yellow café trail", emoji: "🌻" }] },
      { day: 8, theme: "Aix & Cézanne", activities: [{ time: "10:00", name: "Aix's fountains & Cézanne's studio", emoji: "🖌️" }] },
      { day: 9, theme: "Calanques or Cassis", activities: [{ time: "09:00", name: "The limestone creeks by boat or trail", emoji: "🛶" }] },
      { day: 10, theme: "Departure", activities: [{ time: "11:00", name: "Marseille or NCE airport", emoji: "✈️" }] },
    ],
    restaurants: [
      { name: "Le Comptoir du Relais", cuisine: "Paris bistro · $$", emoji: "🥖" },
      { name: "Avignon & Arles bistros", cuisine: "Provence tables · $$", emoji: "🌻" },
      { name: "Cassis port-side grills", cuisine: "Bouillabaisse country · $$$", emoji: "🐟" },
    ],
    city: "Paris",
    country: "France",
    airport: CDG,
    travelStyle: "cultural",
    interests: ["food", "museums", "nature"],
    highlights: [
      "Versailles before the coaches",
      "The Luberon's hilltop villages",
      "The calanques' turquoise creeks",
    ],
  },
  {
    id: "vietnam-food-8d",
    title: "Vietnam 8-Day Food Trip",
    coverImage: null,
    gradient: "from-red-500 to-emerald-500",
    author: AI,
    days: 8,
    estimatedCost: 400,
    currency: "USD",
    tags: ["Foodie", "Cooking", "Markets"],
    excerpt:
      "Eight days on the pho-and-fire trail: Hanoi's pho and bun cha, Hoi An's cooking schools, and Ho Chi Minh City's banh mi dynasty.",
    weatherTip:
      "February–April splits the north and south seasons best. The food calendar never closes.",
    fullDays: [
      { day: 1, theme: "Hanoi — Pho Foundations", activities: [{ time: "07:00", name: "Pho at dawn; egg coffee after", emoji: "🍜" }] },
      { day: 2, theme: "Hanoi — Street School", activities: [{ time: "09:00", name: "Market tour & cooking class", emoji: "👩‍🍳" }] },
      { day: 3, theme: "Hanoi — Bun Cha & Bia Hoi", activities: [{ time: "17:00", name: "Bun cha, nem, and the bia hoi corner", emoji: "🍺" }] },
      { day: 4, theme: "Fly to Da Nang → Hoi An", activities: [{ time: "15:00", name: "Cao lầu & white-rose dumplings", emoji: "🥟" }] },
      { day: 5, theme: "Hoi An — Herb Farm Cooking", activities: [{ time: "09:00", name: "Tra Que herbs & clay-pot class", emoji: "🌿" }] },
      { day: 6, theme: "Fly to Ho Chi Minh City", activities: [{ time: "17:00", name: "Banh mi Huynh Hoa verdict", emoji: "🥖" }] },
      { day: 7, theme: "HCMC — Markets & Com Tam", activities: [{ time: "10:00", name: "Ben Thanh & com tam Broken Rice", emoji: "🍚" }] },
      { day: 8, theme: "Departure", activities: [{ time: "11:00", name: "Final drip coffee & SGN", emoji: "✈️" }] },
    ],
    restaurants: [
      { name: "Pho Bat Dan", cuisine: "The queue legend · $", emoji: "🍜" },
      { name: "Madam Khanh", cuisine: "Hoi An's banh mi queen · $", emoji: "🥖" },
      { name: "Anan Saigon", cuisine: "Street elevated · $$", emoji: "🥢" },
    ],
    city: "Ho Chi Minh City",
    country: "Vietnam",
    airport: SGN,
    travelStyle: "foodie",
    interests: ["food"],
    highlights: [
      "Three regional cuisines in one country",
      "Two cooking schools worth the suitcase space",
      "The banh mi verdict, scientifically",
    ],
  },
  {
    id: "bali-family-6d",
    title: "Bali 6-Day Family Trip",
    coverImage: null,
    gradient: "from-green-500 to-cyan-600",
    author: AI,
    days: 6,
    estimatedCost: 420,
    currency: "USD",
    tags: ["Family", "Beaches", "Nature"],
    excerpt:
      "Six kid-paced days: Ubud's monkeys and terraces, water park afternoons, a pool-heavy beach finish and one cultural hour the kids tolerate.",
    weatherTip:
      "April–October is the dry season. Pool hours are structural — build them in and everyone wins.",
    fullDays: [
      { day: 1, theme: "Arrive & Ubud", activities: [{ time: "14:00", name: "Villa pool & easy dinner", emoji: "🏊" }] },
      { day: 2, theme: "Monkeys & Terraces", activities: [{ time: "09:00", name: "Monkey Forest (straps on everything) & Tegallalang", emoji: "🐒" }] },
      { day: 3, theme: "Waterfalls & Swings", activities: [{ time: "09:30", name: "Tibumana swim & the jungle swings", emoji: "💦" }] },
      { day: 4, theme: "Transfer South & Waterbom", activities: [{ time: "10:00", name: "Kuta's Waterbom park (Asia's best)", emoji: "🎢" }] },
      { day: 5, theme: "Beach & Turtles", activities: [{ time: "09:00", name: "Turtle island boat or Sanur's calm shore", emoji: "🐢" }] },
      { day: 6, theme: "Departure", activities: [{ time: "10:00", name: "Pool & airport", emoji: "✈️" }] },
    ],
    restaurants: [
      { name: "Warung kids' menus everywhere", cuisine: "Nasi goreng · $", emoji: "🍚" },
      { name: "Waterbom's sliders", cuisine: "Park fuel · $$", emoji: "🍔" },
      { name: "Sanur beach cafés", cuisine: "Calm-water dinners · $$", emoji: "🥥" },
    ],
    city: "Bali",
    country: "Indonesia",
    airport: DPS,
    travelStyle: "relaxed",
    interests: ["beaches", "nature", "food"],
    highlights: [
      "The monkeys, at strap-down distance",
      "Waterbom's genuinely world-class slides",
      "Sanur's calm water for little swimmers",
    ],
  },
  {
    id: "nyc-family-4d",
    title: "New York 4-Day Family Trip",
    coverImage: null,
    gradient: "from-sky-500 to-amber-500",
    author: AI,
    days: 4,
    estimatedCost: 800,
    currency: "USD",
    tags: ["Family", "Museums", "Parks"],
    excerpt:
      "Four kid-approved days: the natural-history dinosaurs, Central Park's zoo and carousel, the Statute of Liberty's boat and a Broadway matinée.",
    weatherTip:
      "April–June and September–October are ideal park months. The subway handles every season; strollers do too.",
    fullDays: [
      {
        day: 1,
        theme: "Natural History & the Park",
        activities: [
          { time: "10:00", name: "American Museum of Natural History's dinosaurs", emoji: "🦖" },
          { time: "14:00", name: "Central Park Zoo & the carousel", emoji: "🎠" },
          { time: "18:00", name: "Shake Shack & early night", emoji: "🍔" },
        ],
      },
      {
        day: 2,
        theme: "Statue & Downtown",
        activities: [
          { time: "09:30", name: "Statue of Liberty ferry (booked crown or pedestal)", emoji: "🗽" },
          { time: "13:30", name: "Brooklyn Bridge walk & pizza", emoji: "🍕" },
          { time: "17:00", name: "Seaport ice cream", emoji: "🍦" },
        ],
      },
      {
        day: 3,
        theme: "Broadway & Midtown",
        activities: [
          { time: "10:00", name: "Top of the Rock's view", emoji: "🌆" },
          { time: "14:00", name: "Broadway matinée (kid-picked show)", emoji: "🎭" },
          { time: "18:30", name: "Times Square lights & dinner", emoji: "✨" },
        ],
      },
      {
        day: 4,
        theme: "Playgrounds & Departure",
        activities: [
          { time: "10:00", name: "Heckscher playground or Brooklyn's Pier 6", emoji: "🛝" },
          { time: "14:00", name: "Airport", emoji: "✈️" },
        ],
      },
    ],
    restaurants: [
      { name: "Shake Shack", cuisine: "The kids' verdict · $", emoji: "🍔" },
      { name: "Joe's Pizza", cuisine: "Slice democracy · $", emoji: "🍕" },
      { name: "Ellen's Stardust Diner", cuisine: "Singing waiters · $$", emoji: "🎤" },
    ],
    city: "New York",
    country: "USA",
    airport: JFK,
    travelStyle: "relaxed",
    interests: ["museums", "food"],
    highlights: [
      "The dinosaurs before the crowds",
      "One matinée, kid-chosen",
      "Playgrounds as the reward system",
    ],
  },
  {
    id: "italy-couples-10d",
    title: "Italy 10-Day Couples Trip",
    coverImage: null,
    gradient: "from-rose-400 to-emerald-700",
    author: AI,
    days: 10,
    estimatedCost: 1500,
    currency: "EUR",
    tags: ["Couples", "Romance", "Foodie"],
    excerpt:
      "Ten slow days for two: Rome's golden hours, Florence's terraces, Venice's back canals and the Amalfi Coast's cliff dinners.",
    weatherTip:
      "May–June and September–early October are the romance window — warm seas, open terraces, thinner queues.",
    fullDays: [
      { day: 1, theme: "Rome — Trastevere Evening", activities: [{ time: "16:00", name: "Pantheon & Trevi at dusk; Trastevere dinner", emoji: "⛲" }] },
      { day: 2, theme: "Rome — Ancient Morning", activities: [{ time: "08:30", name: "Colosseum & Forum early", emoji: "🏛️" }] },
      { day: 3, theme: "Rome — Vatican & Villa", activities: [{ time: "08:00", name: "Vatican early; Borghese gardens evening", emoji: "🎨" }] },
      { day: 4, theme: "Train to Florence", activities: [{ time: "15:00", name: "Piazzale Michelangelo's sunset", emoji: "🌄" }] },
      { day: 5, theme: "Florence — Art & Terraces", activities: [{ time: "08:30", name: "Uffizi at opening; Oltrarno aperitivo", emoji: "🖼️" }] },
      { day: 6, theme: "Tuscany — Chianti Day", activities: [{ time: "09:30", name: "Wine route & a slow lunch", emoji: "🍇" }] },
      { day: 7, theme: "Train to Venice", activities: [{ time: "16:00", name: "Grand Canal vaporetto at dusk", emoji: "🛶" }] },
      { day: 8, theme: "Venice — Back Canals", activities: [{ time: "08:15", name: "St Mark's early; Dorsoduro wander", emoji: "🤍" }] },
      { day: 9, theme: "Train to the Amalfi Coast", activities: [{ time: "16:00", name: "Positano's cliff dinner", emoji: "🍋" }] },
      { day: 10, theme: "Amalfi & Departure", activities: [{ time: "09:30", name: "Path of the Gods teaser or a boat hour; NAP", emoji: "✈️" }] },
    ],
    restaurants: [
      { name: "Da Enzo al 29", cuisine: "Rome trattoria · $$", emoji: "🍝" },
      { name: "La Giostra", cuisine: "Florence romance · $$$", emoji: "🍷" },
      { name: "La Sponda", cuisine: "Positano candlelit · $$$$", emoji: "🕯️" },
    ],
    city: "Rome",
    country: "Italy",
    airport: FCO,
    travelStyle: "relaxed",
    interests: ["food", "history", "nature"],
    highlights: [
      "Golden-hour Rome without the crowds",
      "A Chianti terrace lunch",
      "Positano as the closing argument",
    ],
  },
];

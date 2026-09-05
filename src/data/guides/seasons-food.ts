import type { Guide } from "../guides";

// Best-time-to-visit, best-areas-to-stay, and city food guides — the seasonal
// and "where should I stay/eat" long-tail cluster. Seasonal claims stay
// consistent with the bestSeason fields in src/data/destinations.ts.

const MARCUS = {
  name: "Marcus Chen",
  initials: "MC",
  avatarColor: "from-violet-500 to-purple-600",
  role: "City Break Editor",
};

const YUKI = {
  name: "Yuki Tanaka",
  initials: "YT",
  avatarColor: "from-rose-500 to-red-600",
  role: "Japan Editor",
};

const SOFIA = {
  name: "Sofia Laurent",
  initials: "SL",
  avatarColor: "from-blue-500 to-indigo-600",
  role: "Europe Editor",
};

const PRIYA = {
  name: "Priya Nair",
  initials: "PN",
  avatarColor: "from-emerald-500 to-teal-600",
  role: "Asia Editor",
};

export const SEASONS_FOOD_GUIDES: Guide[] = [
  // ── 1. Best Time to Visit Tokyo ───────────────────────────────────────
  {
    slug: "best-time-to-visit-tokyo",
    title: "Best Time to Visit Tokyo: Month by Month, Honestly",
    seoTitle: "Best Time to Visit Tokyo: Month by Month",
    metaDescription:
      "When to visit Tokyo: March–May for cherry blossoms, October–November for foliage and clear skies — plus the honest case for summer and winter visits.",
    excerpt:
      "Tokyo's best months ranked, the sakura-crowd tradeoff explained, and why winter might be the city's most underrated season.",
    coverImage: null,
    gradient: "from-pink-500 to-sky-600",
    author: YUKI,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "7 min read",
    tags: ["tokyo", "best time", "seasons", "japan"],
    city: "Tokyo",
    country: "Japan",
    introduction: [
      "Tokyo has two golden windows — late March to May for cherry blossoms, October to November for foliage and the year's clearest skies — and the honest complication that both are the most crowded, most expensive weeks of the calendar. The real answer depends on whether you're chasing a season or avoiding one.",
      "Our best-season summary from the destination data: March–May and October–November are ideal; summers are hot and humid; winters dry, cool and quietly wonderful. Here's the month-by-month truth.",
    ],
    sections: [
      {
        heading: "The Two Golden Windows",
        paragraphs: [
          "Late March to mid-April delivers the cherry blossoms — and with them, hotel prices that double and parks that fill by 8am. It's genuinely magical and genuinely priced accordingly. October–November is the connoisseur's window: foliage colors, crisp walking air, and thinner crowds than spring. If you can pick one without a sakura bucket list, pick autumn.",
        ],
      },
      {
        heading: "Summer and Winter: The Underrated Options",
        paragraphs: [
          "Summer (June–September) is hot, humid and rainy — but it's also festival season, beer gardens, and the cheapest hotel rates of the year. Do it like a local: mornings out, air-conditioned middays, evening festivals. Winter (December–February) is dry, cool and the year's best-value season: clear-sky Fuji views from the towers, illumination displays, and steaming ramen as a weather strategy.",
        ],
      },
      {
        heading: "Weeks to Avoid or Plan Around",
        paragraphs: [
          "Golden Week (late April–early May), Obon (mid-August) and New Year (Dec 29–Jan 3) are domestic travel peaks: trains book out, some restaurants and museums close, and hotels spike. Cherry blossom timing shifts yearly — follow the forecasts in February and book refundable rooms.",
        ],
      },
    ],
    itinerary: {
      heading: "The Seasonal Calendar",
      intro: "Tokyo by month, compressed — plan around these, not just the temperature.",
      days: [
        {
          day: 1,
          theme: "January–June",
          description:
            "Jan–Feb: clear skies, best value, illuminations. March: blossoms start, prices climb. April: sakura peak — book six months out. May: green, mild, Golden Week crowds early. June: rainy season begins.",
        },
        {
          day: 2,
          theme: "July–December",
          description:
            "Jul–Aug: hot, humid, festival-rich, cheapest beds. September: typhoon risk, fewer crowds. October: the connoisseur's month — warm days, clear air. November: foliage peak. December: illuminations, year-end quiet, empty streets after the 29th.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Booking windows",
        items: [
          "Sakura hotels: 4–6 months ahead, refundable if possible.",
          "Autumn foliage: 2–3 months ahead.",
          "Summer and winter: 2–6 weeks is often enough — the value seasons' hidden perk.",
        ],
      },
      {
        heading: "Packing notes",
        items: [
          "Winter: layers and a warm coat — indoor heating runs hot.",
          "Summer: breathable fabrics, a folding umbrella, and midday museum plans.",
          "Rainy season (June): proper rain shell, not a folding umbrella.",
        ],
      },
    ],
    faq: [
      {
        question: "What is the best month to visit Tokyo?",
        answer:
          "October for the balance of weather, foliage and crowds; late March–early April if the cherry blossoms are the point and you book months ahead.",
      },
      {
        question: "Is winter a bad time for Tokyo?",
        answer:
          "No — it's the value season: dry, sunny, uncrowded, with the year's clearest Fuji views. Pack layers; evenings drop near freezing.",
      },
      {
        question: "When is typhoon season in Tokyo?",
        answer:
          "August–September carries the highest risk. Direct hits are rare and forecastable days out — keep one flexible indoor day in the plan.",
      },
    ],
    relatedDestinationSlugs: ["tokyo", "kyoto", "osaka"],
    relatedTripSlugs: ["tokyo-5d-classic", "kyoto-autumn-2026", "tokyo-3d-foodie"],
    relatedGuideSlugs: ["best-autumn-trips-japan-2026", "tokyo-3-day-itinerary", "tokyo-travel-budget", "best-time-to-visit-japan", "how-many-days-in-tokyo"],
    planner: {
      destination: "Tokyo",
      travelStyle: "cultural",
      interests: ["history", "food"],
      label: "Plan your Tokyo dates with AI",
    },
  },

  // ── 2. Best Time to Visit Paris ───────────────────────────────────────
  {
    slug: "best-time-to-visit-paris",
    title: "Best Time to Visit Paris: Seasons, Crowds and the August Question",
    seoTitle: "Best Time to Visit Paris: Season Guide",
    metaDescription:
      "When to visit Paris: April–June and September–October are ideal — plus the honest case for December's lights, and what really happens in August.",
    excerpt:
      "Paris season by season: the sweet-spot windows, the December lights argument, and the truth about August — half the city closes, half the visitors don't notice.",
    coverImage: null,
    gradient: "from-indigo-500 to-rose-500",
    author: SOFIA,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "6 min read",
    tags: ["paris", "best time", "seasons", "france"],
    city: "Paris",
    country: "France",
    introduction: [
      "Paris's best weather windows are April–June and September–October: mild, bright, and terrace-ready without the summer crush. But the calendar question in Paris is less about weather than about what's open — the city hums differently in December lights, August quiet, and January's post-holiday hush.",
      "Our planning summary: April–June and September–October are ideal; summers are warm and crowded; winters chilly but festive. Here's how to choose.",
    ],
    sections: [
      {
        heading: "The Sweet-Spot Windows",
        paragraphs: [
          "April–June brings chestnut blossoms, long evenings and the café terraces reopening; September–October brings golden light, cultural-season openings (Foire d'Art, design week) and thinning crowds after the summer surge. Both windows book hotels 6–10 weeks out; June and September are the connoisseur's picks.",
        ],
      },
      {
        heading: "December vs August: The Two Extreme Parises",
        paragraphs: [
          "December is the festive city — Christmas lights, ice rinks, covered-passage shopping — cold enough to justify the chocolate chaud, crowded enough to book early. August is the opposite experiment: half the bistros shutter as Parisians leave, but the museums stay open, the tourists thin after the first week, and the city feels almost residential. Both are legitimate; neither is the default.",
        ],
      },
      {
        heading: "Rain, Heat and the Small Print",
        paragraphs: [
          "Paris rains lightly year-round — a compact umbrella lives in the bag in every season. July heatwaves have become regular; hotels with air conditioning command a premium that's worth it. January–February is the value season: fewer queues, lower rates, and the museums never close.",
        ],
      },
    ],
    itinerary: {
      heading: "The Seasonal Calendar",
      intro: "Paris by season, compressed.",
      days: [
        {
          day: 1,
          theme: "Spring & Summer",
          description:
            "Apr–Jun: blossoms, terraces, long evenings — book early. Jul–Aug: warm and busy; August means closed bistros but thinner late-month crowds. Pack the AC premium or the umbrella, whichever your dates demand.",
        },
        {
          day: 2,
          theme: "Autumn & Winter",
          description:
            "Sep–Oct: golden light, cultural openings, the connoisseur's window. Nov: quiet and moody. Dec: lights, markets, festive cold. Jan–Feb: value season, empty queues, real Parisian pace.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Booking windows",
        items: [
          "June and September hotels: 6–10 weeks ahead minimum.",
          "December: book by October — the festive weeks sell out.",
          "August and January: last-minute deals genuinely exist.",
        ],
      },
      {
        heading: "Packing notes",
        items: [
          "A compact umbrella every month of the year.",
          "Comfortable shoes — Paris is walked, and the pavés are merciless.",
          "Summer: light layers; museums and Métro cars run cold against the street heat.",
        ],
      },
    ],
    faq: [
      {
        question: "What is the best month to visit Paris?",
        answer:
          "May and September — mild, bright, and outside the peak-season crush. April and October are nearly as good with fewer crowds.",
      },
      {
        question: "Should I visit Paris in August?",
        answer:
          "Know what you're getting: many bistros and boutiques close, but hotels discount, museums stay open, and the city turns residential. For museum-focused trips it's underrated.",
      },
      {
        question: "Is Paris worth visiting in winter?",
        answer:
          "December especially — lights, markets and covered passages — with shorter days as the tradeoff. January–February is the value window with the fewest queues.",
      },
    ],
    relatedDestinationSlugs: ["paris", "london", "amsterdam"],
    relatedTripSlugs: ["paris-3d-classic", "paris-weekend", "paris-5d-art-food"],
    relatedGuideSlugs: ["paris-3-day-itinerary", "paris-travel-budget", "best-areas-to-stay-in-paris", "christmas-markets-europe-2026", "where-to-travel-december-2026"],
    planner: {
      destination: "Paris",
      travelStyle: "cultural",
      interests: ["food", "museums"],
      label: "Plan your Paris dates with AI",
    },
  },

  // ── 3. Best Time to Visit Seoul ───────────────────────────────────────
  {
    slug: "best-time-to-visit-seoul",
    title: "Best Time to Visit Seoul: Cherry Blossoms, Foliage and Monsoon",
    seoTitle: "Best Time to Visit Seoul: Season Guide",
    metaDescription:
      "When to visit Seoul: April for blossoms, October for foliage and clear skies — plus summer's monsoon reality, winter's charm, and the festival calendar.",
    excerpt:
      "Seoul's seasons ranked — spring blossoms and autumn foliage lead, but the festival calendar and monsoon timing change the answer.",
    coverImage: null,
    gradient: "from-fuchsia-500 to-sky-600",
    author: MARCUS,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "6 min read",
    tags: ["seoul", "best time", "seasons", "korea"],
    city: "Seoul",
    country: "South Korea",
    introduction: [
      "Seoul's two beautiful seasons are textbook: April's cherry blossoms along the Yeouido riverside and October's fiery foliage in the palace grounds. Both are genuinely spectacular and both are priced accordingly. The rest of the year has its own arguments — winter's crisp palaces, summer's festivals against a monsoon backdrop.",
      "Our planning summary: September–October is the best window, spring is the blossom race, and the monsoon (late June–July) is the season to plan around. Here's the breakdown.",
    ],
    sections: [
      {
        heading: "Autumn: The Connoisseur's Choice",
        paragraphs: [
          "Late September to early November combines mild days, clear skies and the foliage show — Namsan, Changdeokgung's Secret Garden and Bukhansan all peak in sequence. October also brings the Busan fireworks-adjacent energy south and Seoul's own festival calendar (Seoul Light, jazz festivals). It's the month locals would pick.",
        ],
      },
      {
        heading: "Spring: The Blossom Race",
        paragraphs: [
          "Yeouido's cherry blossoms bloom late March to early April — a two-week window that books hotels months out. The upside over Japan: blossom festivals in every park, and prices that spike less dramatically. May is the sleeper month — warm, green, and festival-heavy without the pollen chaos.",
        ],
      },
      {
        heading: "Monsoon and Winter",
        paragraphs: [
          "Late June through July is jangma, the monsoon: humid, gray, and sometimes relentless — plan museum-and-café days and skip the hiking. August is hot but festival-rich (Boryeong Mud Festival, water-gun fights in Sinchon). Winter is genuinely appealing: crisp, dry, snow-dusted palaces, and hot-pot-and-spa weather that locals defend fiercely.",
        ],
      },
    ],
    itinerary: {
      heading: "The Seasonal Calendar",
      intro: "Seoul by season, compressed.",
      days: [
        {
          day: 1,
          theme: "Spring & Summer",
          description:
            "Mar–Apr: the blossom window — book early, expect crowds at Yeouido and Seokchon Lake. May: green, warm, festival season. Jun–Jul: monsoon — museums, cafés and malls carry the trip.",
        },
        {
          day: 2,
          theme: "Autumn & Winter",
          description:
            "Sep–Oct: the best month pairing — foliage, festivals, clear air. Nov: late foliage, cooler. Dec–Feb: crisp palaces, jjimjilbang season, ski-day-trip options; Jan–Feb is the value window.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Booking windows",
        items: [
          "Blossom weeks (late Mar–early Apr): 2–3 months ahead.",
          "October: 6–8 weeks ahead.",
          "Monsoon season: last-minute deals are common.",
        ],
      },
      {
        heading: "Packing notes",
        items: [
          "Monsoon: a real rain jacket, waterproof shoes.",
          "Winter: serious layers — Seoul runs colder than Tokyo.",
          "Autumn/spring: layers for 10–15°C swings between morning and afternoon.",
        ],
      },
    ],
    faq: [
      {
        question: "What is the best month to visit Seoul?",
        answer:
          "October — foliage in the palaces, clear skies, mild walking weather and the festival calendar at full tilt. Late September is nearly as good.",
      },
      {
        question: "When do cherry blossoms bloom in Seoul?",
        answer:
          "Typically late March to early April, peaking around Yeouido's festival. The window is about two weeks and shifts yearly with the winter's temperature.",
      },
      {
        question: "Is summer a bad time for Seoul?",
        answer:
          "Late June–July is monsoon season — humid and gray. August is hot but festival-heavy. If summer is your only window, plan indoor middays and lean into the evening city.",
      },
    ],
    relatedDestinationSlugs: ["seoul", "busan", "tokyo"],
    relatedTripSlugs: ["seoul-3d-classic", "seoul-4d-deep-dive", "seoul-k-culture"],
    relatedGuideSlugs: ["seoul-3-day-itinerary", "seoul-travel-budget", "seoul-food-guide", "seoul-vs-tokyo", "how-many-days-in-seoul"],
    planner: {
      destination: "Seoul",
      travelStyle: "foodie",
      interests: ["history", "food"],
      label: "Plan your Seoul dates with AI",
    },
  },

  // ── 4. Best Time to Visit Singapore ───────────────────────────────────
  {
    slug: "best-time-to-visit-singapore",
    title: "Best Time to Visit Singapore: The Honest Answer (It's Always Hot)",
    seoTitle: "Best Time to Visit Singapore: Honest Guide",
    metaDescription:
      "When to visit Singapore: February–April is the driest window, but Singapore is equatorial year-round — here's what actually changes month to month.",
    excerpt:
      "Singapore has no bad month, only wetter and drier ones — February–April leads, monsoon season is manageable, and the heat never leaves.",
    coverImage: null,
    gradient: "from-emerald-500 to-cyan-600",
    author: MARCUS,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "5 min read",
    tags: ["singapore", "best time", "seasons"],
    city: "Singapore",
    country: "Singapore",
    introduction: [
      "Let's be honest first: Singapore sits 85 miles from the equator, and it is hot and humid every month of the year — 30°C highs don't move much. The real seasonal variable is rain: February to April is the driest stretch, November to January the wettest, and the differences are real but not trip-breaking.",
      "Our planning summary: May–July is relatively dry on the west coast, showers fall year-round in short tropical bursts, and the city is engineered for the heat — underground links, mall transit, and a light show every evening regardless of weather.",
    ],
    sections: [
      {
        heading: "The Drier Window: February–April",
        paragraphs: [
          "February to April brings marginally less rain and marginally more sunshine — the best odds for beach days on Sentosa and the Bay's outdoor evenings. Hotel prices stay fairly flat year-round except during the F1 week (late September/early October) and December holidays, so weather is nearly the only variable worth optimizing.",
        ],
      },
      {
        heading: "Monsoon Season: Manageable, Not Ruinous",
        paragraphs: [
          "November–January's Northeast Monsoon delivers short, fierce afternoon downpours rather than all-day soakers — the itinerary pattern (outdoors early and late, malls and museums midday) absorbs them. Bring a compact umbrella, expect twenty-minute drenchings, and the trip proceeds.",
        ],
      },
      {
        heading: "Events That Change the Calculus",
        paragraphs: [
          "The Singapore Grand Prix (September–October) doubles hotel rates and fills the city — magical if you're attending, expensive if you're not. Chinese New Year (January–February) closes some family businesses but lights up Chinatown. The Great Singapore Sale (June–August) is the shopping season.",
        ],
      },
    ],
    itinerary: {
      heading: "The Monthly Cheat Sheet",
      intro: "Singapore by month, compressed — weather varies little, events vary a lot.",
      days: [
        {
          day: 1,
          theme: "January–June",
          description:
            "Jan: CNY lights, monsoon tail. Feb–Apr: driest window, best beach odds. May–Jun: Great Singapore Sale begins, afternoon storms return.",
        },
        {
          day: 2,
          theme: "July–December",
          description:
            "Jul–Aug: hot, sale season continues. Sep–Oct: F1 week doubles prices (late Sep/early Oct). Nov–Dec: wettest months, festive lights, holiday premiums.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Year-round facts",
        items: [
          "Daytime highs ~30–32°C, humidity 70–90%, every month.",
          "UV is extreme — sunscreen and the midday-indoors rhythm are non-negotiable.",
          "Malls and MRT are aggressively air-conditioned: pack a light layer.",
        ],
      },
      {
        heading: "Event alerts",
        items: [
          "F1 week: book months out or avoid — there is no middle price.",
          "CNY (Jan–Feb): Chinatown glows; some hawker stalls close for family days.",
          "National Day (Aug 9): parade rehearsals close streets; fireworks free.",
        ],
      },
    ],
    faq: [
      {
        question: "What is the best month to visit Singapore?",
        answer:
          "February to April — the driest, sunniest stretch. Honestly though, Singapore is a year-round city; rain comes in short bursts and the itinerary handles it.",
      },
      {
        question: "When should I avoid Singapore?",
        answer:
          "Only if price-sensitive during F1 week (late September/early October), when hotel rates double. Weather-wise, November–January is the wettest but still workable.",
      },
      {
        question: "Is Singapore too hot in summer?",
        answer:
          "It's 30–32°C every month — 'summer' isn't a meaningful category there. The heat-management rhythm (early mornings, shaded middays, evening shows) works year-round.",
      },
    ],
    relatedDestinationSlugs: ["singapore", "kuala-lumpur", "bali"],
    relatedTripSlugs: ["singapore-garden-city", "singapore-3d-family", "singapore-gp-2026"],
    relatedGuideSlugs: ["singapore-3-day-itinerary", "singapore-travel-budget", "is-singapore-expensive", "best-area-to-stay-in-singapore", "singapore-grand-prix-2026-travel-guide"],
    planner: {
      destination: "Singapore",
      travelStyle: "foodie",
      interests: ["food", "shopping"],
      label: "Plan your Singapore dates with AI",
    },
  },

  // ── 5. Best Time to Visit Rome ────────────────────────────────────────
  {
    slug: "best-time-to-visit-rome",
    title: "Best Time to Visit Rome: The April–May and October Windows",
    seoTitle: "Best Time to Visit Rome: Season Guide",
    metaDescription:
      "When to visit Rome: April–May and late September–October for mild crowds-free walking — plus the honest case for a Roman Christmas and a July heat strategy.",
    excerpt:
      "Rome's best months — the spring and autumn windows, the summer heat reality, and why Christmas in Rome is quietly brilliant.",
    coverImage: null,
    gradient: "from-amber-500 to-orange-700",
    author: SOFIA,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "6 min read",
    tags: ["rome", "best time", "seasons", "italy"],
    city: "Rome",
    country: "Italy",
    introduction: [
      "Rome's calendar has two perfect windows — April–May and late September–October — when the light is golden, the walking is pleasant and the queues are merely long rather than biblical. June–August brings genuine heat (35°C+ is normal in July) and peak crowds; winter is cool, quiet and quietly magical.",
      "Our planning summary matches the data: April–May is ideal, summer scorches, and the crowd question matters as much as the thermometer.",
    ],
    sections: [
      {
        heading: "The Two Golden Windows",
        paragraphs: [
          "April–May pairs azalea-covered Spanish Steps with walkable temperatures; late September–October repeats the trick with harvest-season menus and softer light. Both are busy — Rome is never empty — but the queue math is humane: book the Colosseum and Vatican timed entries a week or more out and the rest flows.",
        ],
      },
      {
        heading: "Summer: Beautiful, Brutal, Manageable",
        paragraphs: [
          "July–August is the furnace: sights open early, fountains refill bottles, and the afternoon belongs to museums, churches and shaded trattorias. Romans flee in August (some restaurants close), yet the city remains fully serviced for visitors — the evening passeggiata is the reward for heat-survival discipline.",
        ],
      },
      {
        heading: "Winter: The Locals' Secret",
        paragraphs: [
          "November–February is cool (8–15°C), occasionally rainy, and blessedly thin-crowded: the Vatican on a January morning can feel private. Christmas is the sleeper hit — nativity scenes in every piazza, the Christmas market at Piazza Navona, and carnival-adjacent energy into February. Pack layers; churches are unheated.",
        ],
      },
    ],
    itinerary: {
      heading: "The Seasonal Calendar",
      intro: "Rome by season, compressed.",
      days: [
        {
          day: 1,
          theme: "Spring & Summer",
          description:
            "Apr–May: the best pair — mild, blooming, bookable. Jun: warming, busy. Jul–Aug: 35°C+ heat; early starts, midday museums, evening passeggiata. August: Romans leave, tourists don't notice.",
        },
        {
          day: 2,
          theme: "Autumn & Winter",
          description:
            "Sep–Oct: the second golden window — harvest menus, soft light. Nov: quiet, occasional rain. Dec: nativities, Navona market, festive cold. Jan–Feb: thin crowds, unheated churches, honest value.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Booking windows",
        items: [
          "April–May and October: 8–10 weeks ahead for central hotels.",
          "Easter week: the city fills with pilgrims — book months out or avoid.",
          "Winter: 2–3 weeks is often enough.",
        ],
      },
      {
        heading: "Heat management",
        items: [
          "Colosseum's first slot (8:30) and the Vatican's early entry beat the sun and the queue.",
          "The nasoni fountains run free, cold drinking water across the city — carry a bottle.",
          "August afternoons: museums, churches (free, cooled, full of art) and long lunches.",
        ],
      },
    ],
    faq: [
      {
        question: "What is the best month to visit Rome?",
        answer:
          "Late April–May or October — mild temperatures, golden light, and queues that respect human life. Book the big two (Colosseum, Vatican) ahead regardless.",
      },
      {
        question: "Is Rome too hot in July?",
        answer:
          "35°C+ is common — but with early starts, fountain refills, museum middays and evening passeggiata, summer Rome is manageable. Air conditioning is now standard in most hotels.",
      },
      {
        question: "Is Rome worth visiting at Christmas?",
        answer:
          "Genuinely yes — nativity scenes in every church, the Piazza Navona market, St Peter's Midnight Mass broadcast to the square, and thin crowds between the events.",
      },
    ],
    relatedDestinationSlugs: ["rome", "florence", "venice"],
    relatedTripSlugs: ["rome-3d-classics", "rome-food-3d", "rome-eternal-city"],
    relatedGuideSlugs: ["rome-3-day-itinerary", "rome-food-guide", "how-many-days-in-rome", "rome-vs-paris", "italy-7-day-itinerary"],
    planner: {
      destination: "Rome",
      travelStyle: "cultural",
      interests: ["history", "food"],
      label: "Plan your Rome dates with AI",
    },
  },

  // ── 6. Best Time to Visit Japan ───────────────────────────────────────
  {
    slug: "best-time-to-visit-japan",
    title: "Best Time to Visit Japan: Blossoms, Foliage and the Golden Week Trap",
    seoTitle: "Best Time to Visit Japan: Season Guide",
    metaDescription:
      "When to visit Japan: late March–April for sakura, November for foliage — plus Golden Week, typhoon season, and the honest case for a January trip.",
    excerpt:
      "Japan's seasons ranked: the two flower-and-leaf peaks, the Golden Week warning, and the winter value play most travelers skip.",
    coverImage: null,
    gradient: "from-pink-500 to-red-600",
    author: YUKI,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "7 min read",
    tags: ["japan", "best time", "seasons", "sakura"],
    city: "Tokyo",
    country: "Japan",
    introduction: [
      "Japan's calendar is built around two natural events: the cherry blossoms (late March–early April, moving south to north) and the autumn foliage (November, moving north to south). Both are the country at its postcard best — and both are the most crowded, most expensive weeks. Everything else has its own case.",
      "Our planning summary: March–May and October–November are ideal; summers are hot and humid; winters dry and cool. The trap to know: Golden Week (late April–early May) is a domestic travel rush that makes even the ideal season stressful.",
    ],
    sections: [
      {
        heading: "Sakura Season: The Peak, Explained",
        paragraphs: [
          "The blossoms bloom over about six weeks from Kyushu (late March) to Hokkaido (May), with Tokyo and Kyoto peaking around the first week of April. Hotels in the golden cities sell out 4–6 months ahead and prices double. The blossom forecast (published January, updated weekly) is the closest thing Japan has to a national sporting event.",
        ],
      },
      {
        heading: "Autumn Foliage: The Better Deal",
        paragraphs: [
          "November's momiji (maple) season delivers color at least as spectacular as the blossoms, with thinner crowds and softer pricing. Kyoto's temple gardens, Tokyo's Yoyogi and Nikko's mountains peak in sequence through the month. For travelers choosing between the two peaks without a sakura obsession, autumn wins on value.",
        ],
      },
      {
        heading: "The Traps: Golden Week, Typhoons, New Year",
        paragraphs: [
          "Golden Week (Apr 29–May 5) is Japan traveling within Japan: trains and hotels sell out nationwide even as foreign tourists assume it's a normal week. Typhoon season (August–September) threatens the south and west with forecastable interruptions. New Year (Dec 29–Jan 3) closes museums and family restaurants, though shrines overflow with hatsumode visitors and city streets empty beautifully.",
        ],
      },
    ],
    itinerary: {
      heading: "The Seasonal Calendar",
      intro: "Japan by season, compressed — cities and dates that matter.",
      days: [
        {
          day: 1,
          theme: "Winter & Spring",
          description:
            "Jan–Feb: dry, cold, clear — best value, best Fuji views, snow country opens. Mar: blossoms start in the south. Apr: sakura peak in Tokyo/Kyoto — book 4–6 months out. Late Apr–May: Golden Week trap, then green calm.",
        },
        {
          day: 2,
          theme: "Summer & Autumn",
          description:
            "Jun: rainy season. Jul–Aug: hot, humid, festival-rich (Gion Matsuri tails, fireworks). Sep: typhoon risk peaks. Oct: clear, warm, the shoulder gem. Nov: foliage peak — the connoisseur's Japan. Dec: illuminations, year-end quiet.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Booking windows",
        items: [
          "Sakura (Tokyo/Kyoto April): 4–6 months ahead, refundable rooms.",
          "Foliage (Kyoto November): 2–3 months ahead.",
          "Golden Week: avoid booking travel within Japan — or avoid the week entirely.",
          "Winter: 2–6 weeks is fine outside New Year.",
        ],
      },
      {
        heading: "Seasonal tips",
        items: [
          "Blossom chasing: follow the JMA forecasts from February; flexibility beats precision.",
          "Typhoon season: keep one flexible indoor day; Shinkansen resumes fast after disruptions.",
          "Winter: ski Hakone/Nagano side trips; onsen weather is winter weather.",
        ],
      },
    ],
    faq: [
      {
        question: "What is the best month to visit Japan?",
        answer:
          "Late March–early April for blossoms, November for foliage. October is the balance pick — warm, clear, pre-peak pricing — and winter is the value play most travelers skip.",
      },
      {
        question: "When should I avoid visiting Japan?",
        answer:
          "Golden Week (April 29–May 5) and New Year (December 29–January 3) — domestic travel peaks that strain trains, hotels and opening hours nationwide.",
      },
      {
        question: "When do cherry blossoms bloom?",
        answer:
          "Late March in Tokyo and Kyoto (peaking around the first week of April), earlier in the south, into May in Hokkaido. The forecast shifts yearly — follow it from February.",
      },
    ],
    relatedDestinationSlugs: ["tokyo", "kyoto", "osaka"],
    relatedTripSlugs: ["japan-7d-golden-route", "kyoto-autumn-2026", "japan-10d-classic"],
    relatedGuideSlugs: ["best-time-to-visit-tokyo", "japan-cherry-blossom-2027", "golden-week-japan-2027", "best-autumn-trips-japan-2026", "japan-travel-budget"],
    planner: {
      destination: "Tokyo",
      travelStyle: "cultural",
      interests: ["history", "nature", "food"],
      label: "Plan your Japan dates with AI",
    },
  },

  // ── 7. Best Areas to Stay in Paris ────────────────────────────────────
  {
    slug: "best-areas-to-stay-in-paris",
    title: "Best Areas to Stay in Paris: Six Neighborhoods for Every Kind of Trip",
    seoTitle: "Best Areas to Stay in Paris: 6 Picks",
    metaDescription:
      "Where to stay in Paris: Saint-Germain for first-timers, Le Marais for nightlife and style, Montmartre for views — six neighborhoods matched to trip types.",
    excerpt:
      "The six Paris neighborhoods worth sleeping in — matched to first visits, budgets, romance, and the métro lines that make each work.",
    coverImage: null,
    gradient: "from-pink-500 to-indigo-600",
    author: SOFIA,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "7 min read",
    tags: ["paris", "where to stay", "neighborhoods", "hotels"],
    city: "Paris",
    country: "France",
    introduction: [
      "Where you sleep in Paris matters more than most cities, because the difference between neighborhoods is the difference between bistro-lined evenings and tourist-trap dinners. The honest summary: stay within reach of Métro lines 1, 4 or the RER, and pick a neighborhood for its evenings, not its address on the map.",
      "Six neighborhoods cover nearly every trip: Saint-Germain for the classic first visit, Le Marais for style and nightlife, the Latin Quarter for budgets that still want charm, Montmartre for the postcard, Opéra for convenience, and Canal Saint-Martin for the local feeling.",
    ],
    sections: [
      {
        heading: "The Six, Matched to Trip Types",
        paragraphs: [],
        bullets: [
          "Saint-Germain-des-Prés — the classic first-timer pick: cafés, galleries, walkable to the islands. Premium prices, zero regret.",
          "Le Marais — boutiques, falafel, wine bars, open Sundays. Best mix of energy and location; small hotels book out.",
          "Latin Quarter — student prices, genuine charm, five minutes from Notre-Dame. Pick streets carefully; some arteries are noisy.",
          "Montmartre — the village on the hill and the postcard views. The trade is the climb and the metro ride to everything else.",
          "Opéra / Grands Boulevards — central, grand, business-hotel value, two Metro lines to everywhere. Less romantic, very practical.",
          "Canal Saint-Martin — the local Paris: iron footbridges, natural-wine bars, weekend picnics. Ten minutes from Gare du Nord.",
        ],
      },
      {
        heading: "The Métro-Line Rule",
        paragraphs: [
          "Line 1 runs east–west past the Louvre and Marais; Line 4 cuts north–south through Montmartre, the islands and Saint-Germain; the RER B links both airports and the Gare du Nord. Any hotel within ten minutes' walk of one of these three is a good hotel, whatever the neighborhood.",
        ],
      },
      {
        heading: "What to Avoid",
        paragraphs: [
          "Not specific districts — Paris is safe throughout — but specific situations: Monument-adjacent chains (you're paying for the view of scaffolding), anywhere requiring a bus transfer on arrival day, and the Republic-adjacent strip's stag-night noise on weekends. Read recent reviews for the block, not the neighborhood.",
        ],
      },
    ],
    itinerary: {
      heading: "The Decision Tree",
      intro: "Answer one question, get a neighborhood.",
      days: [
        {
          day: 1,
          theme: "First visit, romance, or budget?",
          description:
            "First visit → Saint-Germain or Le Marais. Romance → Saint-Germain side streets or Montmartre at the top. Budget → Latin Quarter's back streets or Canal Saint-Martin. Convenience above all → Opéra. Nightlife focus → Le Marais or Oberkampf.",
        },
        {
          day: 2,
          theme: "The booking note",
          description:
            "Parisian hotel rooms run small — a 'double' is 14–16m². Read the square meters, not the star rating, and upsize one tier if the trip exceeds four nights.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Booking notes",
        items: [
          "Small hotels sell out 8–10 weeks ahead for June and September.",
          "Air-conditioning is not universal — filter for it in July and August.",
          "Elevator ('ascenseur') matters above the third floor; Parisian walk-ups are steep.",
        ],
      },
      {
        heading: "Neighborhood etiquette",
        items: [
          "Greet shopkeepers with 'Bonjour' on entry — it changes the service you receive.",
          "Sunday: the Marais stays open while most of the city closes.",
          "Ask for the rooms facing the courtyard ('côté cour') for quiet.",
        ],
      },
    ],
    faq: [
      {
        question: "What is the best area to stay in Paris for first-timers?",
        answer:
          "Saint-Germain-des-Prés or Le Marais — central, walkable to the islands and the Louvre, and full of good bistros for tired evenings. Both sit on Métro line 1 or 4.",
      },
      {
        question: "Is Montmartre a good place to stay?",
        answer:
          "For atmosphere and views, yes — it's the postcard Paris. The trade: a Métro ride (or a climb) to most sights, and livelier streets late at night near Pigalle.",
      },
      {
        question: "Where should I stay on a budget in Paris?",
        answer:
          "The Latin Quarter's back streets and Canal Saint-Martin offer charm at lower rates — both near Métro line 4 or the RER B. Expect small rooms; that's Paris.",
      },
    ],
    relatedDestinationSlugs: ["paris", "london", "amsterdam"],
    relatedTripSlugs: ["paris-weekend", "paris-3d-classic", "paris-5d-art-food"],
    relatedGuideSlugs: ["paris-3-day-itinerary", "paris-travel-budget", "best-time-to-visit-paris", "paris-shopping-guide-2026", "how-many-days-in-paris"],
    planner: {
      destination: "Paris",
      travelStyle: "cultural",
      interests: ["food", "shopping"],
      label: "Match a Paris neighborhood to your trip",
    },
  },

  // ── 8. Best Areas to Stay in London ───────────────────────────────────
  {
    slug: "best-areas-to-stay-in-london",
    title: "Best Areas to Stay in London: Five Neighborhoods That Make Sense",
    seoTitle: "Best Areas to Stay in London: 5 Picks",
    metaDescription:
      "Where to stay in London: Covent Garden for first-timers, South Bank for walks, Shoreditch for nightlife — five areas matched to trip types and Tube lines.",
    excerpt:
      "Five London neighborhoods worth the hotel bill — matched to first visits, budgets, nightlife, and the Tube lines that decide everything.",
    coverImage: null,
    gradient: "from-red-600 to-blue-700",
    author: MARCUS,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "7 min read",
    tags: ["london", "where to stay", "neighborhoods", "hotels"],
    city: "London",
    country: "United Kingdom",
    introduction: [
      "London is a city of villages, and the hotel decision is really a village decision: where do you want to eat dinner, and which Tube line do you want to marry? Stay Zone 1, near a Jubilee, Victoria or Northern line station, and pick the village for its evenings.",
      "Five areas cover most trips: Covent Garden/Soho for the classic first visit, South Bank for riverside walks and theatre, King's Cross/St Pancras for arrivals and value, Shoreditch for nightlife, and Notting Hill/Holland Park for the leafy London of postcards.",
    ],
    sections: [
      {
        heading: "The Five, Matched to Trip Types",
        paragraphs: [],
        bullets: [
          "Covent Garden / Soho — the first-timer core: theatre, dining, walkable to Trafalgar and the river. Priciest, most convenient.",
          "South Bank — riverside walks, Tate Modern, Shakespeare's Globe, Waterloo's connections. Quieter evenings, superb transport.",
          "King's Cross / St Pancras — arrivals-friendly (Eurostar, two airports' express trains), regenerated and full of food halls. Best value-for-location in Zone 1.",
          "Shoreditch — street art, nightlife, vintage markets, Overground links. The East End trade: distance from the royal sights.",
          "Notting Hill / Holland Park — pastel terraces, Portobello Road, park-side calm. The postcard trade: a Tube ride to everything central.",
        ],
      },
      {
        heading: "The Tube-Line Rule",
        paragraphs: [
          "Jubilee runs Bond Street–Westminster–Greenwich; Victoria covers the west and Gatwick express; Northern slices through King's Cross, Bank and London Bridge. A hotel near two of these three lines means no journey in the city needs more than one change.",
        ],
      },
      {
        heading: "What to Avoid",
        paragraphs: [
          "Nothing dangerous — London is safe throughout — but a few value traps: 'Zone 2' hotels near stations that are fifteen minutes' walk from the platform, Earl's Court's budget strip (fine, just far), and anything whose best feature is proximity to an airport. Time is the real currency; spend it on the city.",
        ],
      },
    ],
    itinerary: {
      heading: "The Decision Tree",
      intro: "Answer one question, get a neighborhood.",
      days: [
        {
          day: 1,
          theme: "First visit, budget, or nightlife?",
          description:
            "First visit → Covent Garden/Soho or South Bank. Budget → King's Cross or a well-reviewed Zone 2 village (Brixton, Hackney). Nightlife → Shoreditch or Soho. Leafy calm → Notting Hill. Theatre focus → Covent Garden, obviously.",
        },
        {
          day: 2,
          theme: "The booking note",
          description:
            "London hotel rooms run small at every price — read square meters, check for AC (increasingly standard post-2022 heatwaves), and remember Sunday check-ins often find the city quieter than Saturday arrivals.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Booking notes",
        items: [
          "West End weeks and school holidays spike prices; midweek is consistently cheaper.",
          "Contactless payment works on all transport from any Zone 1 hotel — no passes needed.",
          "Check the actual walking distance to the Tube, not the postcode's Zone.",
        ],
      },
      {
        heading: "Neighborhood etiquette",
        items: [
          "Queuing is sacred; stand right on escalators.",
          "Pub kitchens stop early — order food before 9pm outside Soho.",
          "'Sorry' is a full sentence in London; use it liberally.",
        ],
      },
    ],
    faq: [
      {
        question: "What is the best area to stay in London for tourists?",
        answer:
          "Covent Garden/Soho for the classic first visit, or South Bank for riverside calm with Waterloo's transport. Both are Zone 1 with one-change journeys to everything.",
      },
      {
        question: "Where should I stay in London on a budget?",
        answer:
          "King's Cross/St Pancras offers the best value-for-location in Zone 1; beyond it, well-connected Zone 2 villages like Brixton or Hackney trade commute time for real savings.",
      },
      {
        question: "Is Shoreditch a good place to stay?",
        answer:
          "For nightlife, street art and vintage shopping, yes — with the trade that the royal sights and museums need an Overground or Tube hop. Evening-focused trips love it.",
      },
    ],
    relatedDestinationSlugs: ["london", "paris", "edinburgh"],
    relatedTripSlugs: ["london-3d-classic", "london-5d-deep", "london-cultural"],
    relatedGuideSlugs: ["london-3-day-itinerary", "london-travel-budget", "how-many-days-in-london", "london-on-foot-guide-2026", "best-time-to-visit-paris"],
    planner: {
      destination: "London",
      travelStyle: "cultural",
      interests: ["museums", "nightlife"],
      label: "Match a London neighborhood to your trip",
    },
  },

  // ── 9. Best Areas to Stay in New York ─────────────────────────────────
  {
    slug: "best-areas-to-stay-in-new-york",
    title: "Best Areas to Stay in New York: Five Borough Picks That Actually Help",
    seoTitle: "Best Areas to Stay in NYC: 5 Picks",
    metaDescription:
      "Where to stay in New York: Midtown for first-timers, Lower East Side for nightlife, Williamsburg for style — five areas matched to trips, budgets and subway lines.",
    excerpt:
      "Five New York areas worth sleeping in — matched to first visits, budgets, nightlife, and the subway lines that rule the city.",
    coverImage: null,
    gradient: "from-amber-500 to-red-600",
    author: MARCUS,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "7 min read",
    tags: ["new york", "where to stay", "neighborhoods", "hotels"],
    city: "New York",
    country: "USA",
    introduction: [
      "New York hotel geography is a subway decision wearing a neighborhood costume. The real questions: which lines run near your door (the L, the 1-2-3, the A-C-E change everything), and where do you want to be at midnight — Times Square's glare, the Lower East Side's bars, or a Brooklyn rooftop?",
      "Five areas cover most trips: Midtown for the first-timer essentials, Chelsea/Flatiron for balance, Lower East Side for food and nightlife, Williamsburg for style across the river, and the Upper West Side for families and park people.",
    ],
    sections: [
      {
        heading: "The Five, Matched to Trip Types",
        paragraphs: [],
        bullets: [
          "Midtown (Times Square/Bryant Park) — the first-timer core: walk to the big sights, hotels at every price. The trade: crowds, and dinners dominated by chains unless you know the side streets.",
          "Chelsea / Flatiron / Union Square — the local favorite: High Line, galleries, good food, multiple subway lines, more reasonable rates than Midtown.",
          "Lower East Side / East Village — nightlife and the city's best casual eating. Rooms skew small; evenings skew late.",
          "Williamsburg (Brooklyn) — style, rooftop bars, L-train access to Manhattan. Cheaper square footage, longer commutes.",
          "Upper West Side — Central Park on your doorstep, family-sized rooms, museum miles north and south. Quieter, residential, practical.",
        ],
      },
      {
        heading: "The Subway-Line Rule",
        paragraphs: [
          "The 1-2-3 covers the west side, the 4-5-6 the east, the A-C-E and L the crosstown west, the N-Q-R the crosstown east. A hotel within two blocks of a 24-hour line (the L never sleeps, the 1 nearly does) means every plan survives midnight. Check the line map before the reviews.",
        ],
      },
      {
        heading: "What to Avoid",
        paragraphs: [
          "Airport hotels (spend your evenings elsewhere), the rows of hotel rooms above loud late-night food corridors without reading reviews for the specific block, and any deal that seems too good in Midtown — it's usually a construction site's neighbor. New York is safe throughout; noise is the enemy.",
        ],
      },
    ],
    itinerary: {
      heading: "The Decision Tree",
      intro: "Answer one question, get a neighborhood.",
      days: [
        {
          day: 1,
          theme: "First visit, style, or family?",
          description:
            "First visit → Midtown or Chelsea. Nightlife and food focus → Lower East Side. Style on a budget → Williamsburg. Families and park time → Upper West Side. Theatre and tourist-core convenience → Midtown, accept the glare.",
        },
        {
          day: 2,
          theme: "The booking note",
          description:
            "NYC hotel taxes add ~15% at checkout — budget it. Rooms at every tier run small; a 'king' in Midtown is a European double. Weekends spike for leisure, weekdays for business — reverse-book accordingly.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Booking notes",
        items: [
          "OMNY tap-to-ride on every subway bus and train — no MetroCard purchase needed.",
          "JFK: the AirTrain+subway is $11 total; taxis are flat-fare ~$70+. LaGuardia: Q70 bus is free-ish and fast.",
          "Ask for rooms facing inner courtyards; New York streets hum all night.",
        ],
      },
      {
        heading: "Neighborhood etiquette",
        items: [
          "Walk fast or stand still — the middle of the sidewalk is a moving lane.",
          "Tipping 18–20% at bars and restaurants is not optional.",
          "The subway is safe around the clock on the main lines; trust the platform crowds.",
        ],
      },
    ],
    faq: [
      {
        question: "What is the best area to stay in NYC for first-timers?",
        answer:
          "Midtown near Bryant Park or Grand Central — walkable to the essential sights with every subway line nearby. Chelsea/Flatiron is the calmer alternative ten minutes south.",
      },
      {
        question: "Is it better to stay in Manhattan or Brooklyn?",
        answer:
          "Manhattan for first visits and sightseeing density; Williamsburg for style, space and value — with the L train as the lifeline. Commutes to Midtown run 30–40 minutes from Brooklyn.",
      },
      {
        question: "How much is a hotel in New York?",
        answer:
          "Mid-range rooms run $250–400/night before the ~15% tax spike at checkout; boutique Chelsea rooms and Williamsburg hotels often undercut Midtown chains.",
      },
    ],
    relatedDestinationSlugs: ["newyork", "boston", "toronto"],
    relatedTripSlugs: ["nyc-3d-first-timer", "nyc-explorer", "nyc-5d-deep"],
    relatedGuideSlugs: ["new-york-weekend-guide-2026", "how-many-days-in-new-york", "is-las-vegas-expensive", "best-fall-trips-usa-2026", "labor-day-weekend-getaways-2026"],
    planner: {
      destination: "New York",
      travelStyle: "active",
      interests: ["museums", "food", "nightlife"],
      label: "Match a NYC neighborhood to your trip",
    },
  },

  // ── 10. Seoul Food Guide ──────────────────────────────────────────────
  {
    slug: "seoul-food-guide",
    title: "Seoul Food Guide: What to Eat and Where, From BBQ to Street Snacks",
    seoTitle: "Seoul Food Guide: BBQ to Street Snacks",
    metaDescription:
      "What to eat in Seoul: K-BBQ economics, the street-food classics, Gwangjang Market's bindaetteok, and the café culture that became a sight in itself.",
    excerpt:
      "The Seoul eating curriculum — BBQ tiers, market legends, street-food classics, and why dessert is a full meal category here.",
    coverImage: null,
    gradient: "from-red-500 to-orange-600",
    author: MARCUS,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "7 min read",
    tags: ["seoul", "food", "korea", "korean bbq"],
    city: "Seoul",
    country: "South Korea",
    introduction: [
      "Seoul is the best food value in East Asia, and its cuisine is a system, not a list: banchan (free side dishes) frame every meal, grills anchor the social ones, and street food carries the between-hours. This guide is the curriculum — what to eat, where it lives, and what to order twice.",
      "The one-line orientation: if a restaurant has exactly one dish on the menu, that's the one to order. Korea's specialist culture means the one-dish places are the legends.",
    ],
    sections: [
      {
        heading: "The BBQ Curriculum",
        paragraphs: [
          "Samgyeopsal (pork belly) is the everyman cut, galbi the marinated splurge, chadol (brisket) the connoisseur's thin-sliced choice. The system: the staff grills for you, lettuce wraps (ssam) with ssamjang paste deliver the payload, and banchan refills are free. Budget ₩12,000–18,000 per person at the mid tier — less than a Western burger chain for a night you'll remember.",
        ],
      },
      {
        heading: "Street Food and Market Legends",
        paragraphs: [
          "Tteokbokki (chewy rice cakes in chili sauce), hotteok (sweet pancakes), kimbap rolls and tornado potatoes are the street canon. Gwangjang Market is the sit-down version: bindaetteok (mung-bean pancakes) fried before you, mayak gimbap ('narcotic' gimbap, named for its addictiveness), and yukhoe if you're brave. Mangwon Market is the local's alternative with better prices.",
        ],
      },
      {
        heading: "The Café Situation and the Sweet Finish",
        paragraphs: [
          "Seoul's café culture is a competitive sport — multi-floor theme cafés, dessert cafés where bingsu (shaved-ice mountains) is the main event, and a latte-art scene that borders on obsessive. Budget it like a sightseeing line item. And late night belongs to convenience stores: the ramyeon counter at 1am is a Seoul institution.",
        ],
      },
    ],
    itinerary: {
      heading: "One Perfect Eating Day",
      intro: "Seoul's day in four meals, arranged geographically.",
      days: [
        {
          day: 1,
          theme: "The eating circuit",
          description:
            "Morning: kimbap and soup at a Gwangjang-adjacent restaurant. Midday: bindaetteok and mayak gimbap at Gwangjang Market. Afternoon: café hour in Ikseon-dong — bingsu or a sculptural latte. Evening: samgyeopsal BBQ in Hongdae with soju, then a 1am convenience-store ramyeon if the night runs long.",
        },
        {
          day: 2,
          theme: "The specialist list",
          description:
            "One-dish legends to slot in across a trip: sundubu jjigae (tofu stew), samgyetang (ginseng chicken soup — a summer tradition), naengmyeon (cold noodles), Korean fried chicken (the pairing with beer is called chimaek and it's a national institution).",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Ordering & etiquette",
        items: [
          "Banchan refills are free — ask without hesitation ('jom deo juseyo').",
          "Tipping isn't customary; service charges don't exist.",
          "Pour drinks for others at the table, receive with two hands — the etiquette is quick to learn and appreciated.",
        ],
      },
      {
        heading: "Budget & practical",
        items: [
          "Street food ₩3,000–8,000; market meals ₩8,000–12,000; BBQ ₩12,000–18,000; premium hanwoo ₩40,000+.",
          "Cards work nearly everywhere; markets prefer cash or T-money.",
          "Queues are the honest rating system — the line at the one-dish place is the review.",
        ],
      },
    ],
    faq: [
      {
        question: "What food is Seoul famous for?",
        answer:
          "Korean BBQ (samgyeopsal, galbi), street food (tteokbokki, hotteok), Gwangjang Market's bindaetteok, fried chicken, and the café-and-dessert scene. The specialist one-dish restaurants are the hidden layer.",
      },
      {
        question: "Is Korean BBQ expensive?",
        answer:
          "No — it's Seoul's best value meal: ₩12,000–18,000 per person for all-you-can-grill pork with free side dishes. Premium hanwoo beef runs ₩40,000+ for the splurge night.",
      },
      {
        question: "Do I need to book restaurants in Seoul?",
        answer:
          "Rarely — walk-in culture dominates, and the queue system (leave your name, wander) is standard. Book ahead only for Michelin-listed places and premium BBQ chains on weekends.",
      },
    ],
    relatedDestinationSlugs: ["seoul", "busan", "tokyo"],
    relatedTripSlugs: ["seoul-food-3d", "seoul-3d-classic", "seoul-k-culture"],
    relatedGuideSlugs: ["seoul-3-day-itinerary", "seoul-travel-budget", "how-many-days-in-seoul", "tokyo-food-guide", "osaka-food-guide-2027"],
    planner: {
      destination: "Seoul",
      travelStyle: "foodie",
      interests: ["food"],
      label: "Plan an eating trip to Seoul",
    },
  },

  // ── 11. Barcelona Food Guide ──────────────────────────────────────────
  {
    slug: "barcelona-food-guide",
    title: "Barcelona Food Guide: Tapas, Markets and the Vermouth Hour",
    seoTitle: "Barcelona Food Guide: Tapas to Vermouth",
    metaDescription:
      "What to eat in Barcelona: tapas bars vs pintxos counters, La Boqueria's real rules, the menú del día trick, and the vermouth hour that starts every Catalan evening.",
    excerpt:
      "The Barcelona eating curriculum — tapas logistics, market ethics, the €14 lunch formule, and why vermouth is a meal's opening act, not a drink.",
    coverImage: null,
    gradient: "from-red-500 to-yellow-500",
    author: SOFIA,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "7 min read",
    tags: ["barcelona", "food", "spain", "tapas"],
    city: "Barcelona",
    country: "Spain",
    introduction: [
      "Barcelona eats in movements: small plates in bars, one plate each, then walk to the next bar. The tapas crawl is not a meal — it's an evening architecture, and this guide is the blueprint: which plates are non-negotiable, which market rules keep you honest, and why the vermouth hour (la hora del vermut) is the city's most sacred appointment.",
      "Catalan cooking is its own cuisine — not Spanish-with-a-dialect — and the differences (pa amb tomàquet, calcots, mar i muntanya) are the local pride. Learn three Catalan words on the menu and doors open.",
    ],
    sections: [
      {
        heading: "The Tapas Canon",
        paragraphs: [
          "Pan con tomate (pa amb tomàquet) is the foundation — bread, tomato, oil, salt, perfection. Patatas bravas judge every bar (the sauce is the thesis). Tortilla española: runny or set, pick a side. Jamón ibérico melts; croquetas reveal the kitchen. Pintxos bars (Basque-style, toothpick-accounted) are the efficient version — graze a counter and pay by the sticks.",
        ],
      },
      {
        heading: "Markets: La Boqueria and the Locals' Alternatives",
        paragraphs: [
          "La Boqueria at 9am is glorious and genuine; by noon it's a photo set. The rules: eat at the back bars (El Quim, Bar Pinotxo), not the front fruit cups. Santa Caterina is the quieter local market; Mercado de Sant Antoni the Sunday-book-lovers' alternative. Buy jamón and cheese for picnics; buy meals only at the counters that cook.",
        ],
      },
      {
        heading: "The Menú del Día and the Vermouth Hour",
        paragraphs: [
          "The menú del día (€12–15 for three courses plus wine or water) is Europe's best lunch institution — the same kitchens, a third of dinner prices. And before dinner, the vermouth hour: a glass of vermut with olives and chips around 1pm or 7pm, a ritual so central it's a verb ('fer el vermut'). Dinner starts at 9pm; the 7pm vermut bridges the wait.",
        ],
      },
    ],
    itinerary: {
      heading: "One Perfect Eating Day",
      intro: "Barcelona's day in four movements, arranged geographically.",
      days: [
        {
          day: 1,
          theme: "The eating circuit",
          description:
            "Morning: churros con chocolate in the Gothic Quarter. Midday: menú del día in Gràcia (€14, three courses, wine included). Afternoon: La Boqueria's back-bar jamón or a Santa Caterina stop. Evening: 7pm vermut in El Born, then a tapas crawl — bravas, tortilla, pintxos — ending wherever the night band is playing.",
        },
        {
          day: 2,
          theme: "The specialist list",
          description:
            "Slot these in across a trip: fresh anchovies from a bomba-bar, xurros at midnight, fideuà if paella's cousin tempts, crema catalana for the dessert (burnt cream, better than crème brûlée, don't argue), and cava by the glass everywhere.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Logistics & etiquette",
        items: [
          "Lunch 1:30–3:30pm, dinner 9–11pm — kitchens outside those windows are telling you something.",
          "Eating at the bar is cheaper and faster; tipping rounds up, not percentages.",
          "English menus exist; the Catalan/Spanish menu with fewer tourists is usually better.",
        ],
      },
      {
        heading: "Budget & practical",
        items: [
          "Tapas €3–8 per plate; a two-person crawl lands €30–50 with drinks.",
          "Menú del día €12–15 is the budget's best friend — lunch is the meal to eat big.",
          "Vermut €3–5; house wine (tinto de verano in summer) €2–4.",
        ],
      },
    ],
    faq: [
      {
        question: "What food is Barcelona famous for?",
        answer:
          "Tapas and pintxos, pan con tomate, patatas bravas, jamón ibérico, fresh seafood, crema catalana — plus the vermouth hour and the menú del día lunch tradition.",
      },
      {
        question: "Is La Boqueria worth visiting?",
        answer:
          "Yes — at 9am, eating at the back counters (El Quim, Pinotxo) rather than the front juice stands. Santa Caterina is the local-priced alternative ten minutes away.",
      },
      {
        question: "Why is dinner so late in Barcelona?",
        answer:
          "Clocks and culture: Spain runs on a time zone shifted by Franco's decree, and Catalonian social life follows the sun. Embrace it — vermut at 7, dinner at 9:30, bars after 11.",
      },
    ],
    relatedDestinationSlugs: ["barcelona", "madrid", "seville"],
    relatedTripSlugs: ["barcelona-food-3d", "barcelona-3d-gaudi", "barcelona-art-architecture"],
    relatedGuideSlugs: ["barcelona-3-day-itinerary", "rome-food-guide", "paris-shopping-guide-2026", "best-european-cities-first-time", "europe-7-day-itinerary"],
    planner: {
      destination: "Barcelona",
      travelStyle: "foodie",
      interests: ["food", "nightlife"],
      label: "Plan an eating trip to Barcelona",
    },
  },

  // ── 12. Rome Food Guide ───────────────────────────────────────────────
  {
    slug: "rome-food-guide",
    title: "Rome Food Guide: The Four Pastas and the Rules of the Trattoria",
    seoTitle: "Rome Food Guide: The Four Pastas",
    metaDescription:
      "What to eat in Rome: carbonara, cacio e pepe, amatriciana and gricia — plus supplì, pizza al taglio, the trap-avoidance rules, and where the locals actually eat.",
    excerpt:
      "Rome's eating curriculum — the four pastas, the fried starters, the lunch-only institutions, and the three rules that keep you out of tourist traps.",
    coverImage: null,
    gradient: "from-orange-500 to-red-600",
    author: SOFIA,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "7 min read",
    tags: ["rome", "food", "italy", "pasta"],
    city: "Rome",
    country: "Italy",
    introduction: [
      "Roman cuisine is plebeian genius: four pastas built on pork and pecorino, fried things to hold the wine, and a trattoria culture that hasn't moved since your grandmother's hypothetical Rome. The city doesn't need innovation; it needs execution — and the good places have been executing the same four recipes for generations.",
      "This guide is the curriculum: master the four pastas, learn the fried starters, respect the rhythm (lunch is the big meal), and follow three trap-avoidance rules that keep dinner Roman.",
    ],
    sections: [
      {
        heading: "The Four Pastas",
        paragraphs: [
          "Carbonara (guanciale, egg, pecorino — no cream, ever), cacio e pepe (pecorino, black pepper, pasta water alchemy), amatriciana (tomato, guanciale, pecorino) and gricia (amatriciana without tomato). That's the degree course. A Roman kitchen reveals itself in cacio e pepe — nothing to hide behind. Order all four across a trip; argue about your favorite.",
        ],
      },
      {
        heading: "The Fried Things and the Pizza",
        paragraphs: [
          "Supplì (rice croquettes with mozzarella hearts) and carciofi alla giudia (Jewish-style artichokes, fried to bronze) are the starters. Pizza al taglio — sold by weight, cut with scissors — is the street lunch; pizza tonda romana (thin, crispy) is the sit-down version. Trap alert: Roman pizza is thin and crisp; if the menu says 'napoletana', adjust expectations accordingly.",
        ],
      },
      {
        heading: "The Three Trap Rules",
        paragraphs: [
          "One: no photo menus, no host waving you in from the pavement — walk in or walk on. Two: the menu has no 'tourist menu' and the pasta is priced €10–14, not €4 (suspicious) or €25 (theft). Three: look for Italian at other tables, short menus, and a location one street off the monument. Trastevere, Monti and Testaccio are the neighborhoods that pass.",
        ],
      },
    ],
    itinerary: {
      heading: "One Perfect Eating Day",
      intro: "Rome's day in four meals, arranged geographically.",
      days: [
        {
          day: 1,
          theme: "The eating circuit",
          description:
            "Morning: cornetto and cappuccino standing at the bar (cappuccino after 11am marks you). Midday: the big meal — carbonara and carciofi at a Testaccio or Monti trattoria. Afternoon: pizza al taglio by weight near the sights. Evening: supplì and gricia in Trastevere, gelato on the walk home (pistachio judges the gelateria).",
        },
        {
          day: 2,
          theme: "The specialist list",
          description:
            "Slot in across a trip: cacio e pepe at a one-dish legend, amatriciana where it was born-ish (the argument continues), Jewish Ghetto's fried artichokes, trapizzino (pizza-pocket street food), tiramisu at a pompi-style specialist, and espresso standing at the counter like you mean it.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Logistics & etiquette",
        items: [
          "Lunch 1–2:30pm, dinner 8:30–10:30pm; Romans dine late and slowly.",
          "Coperto (cover charge, €2–3) is legal and printed on the menu — not a scam.",
          "Coffee at the bar counter costs half the table price; drink like a local.",
        ],
      },
      {
        heading: "Budget & practical",
        items: [
          "Trattoria pastas €10–14; a two-person dinner with wine lands €45–65.",
          "Pizza al taglio €3–6 by weight; supplì €1.5–3; gelato €2.5–4 for two scoops.",
          "House wine (vino della casa) is honest and €5–8 for a quarter liter.",
        ],
      },
    ],
    faq: [
      {
        question: "What food is Rome famous for?",
        answer:
          "The four pastas (carbonara, cacio e pepe, amatriciana, gricia), supplì, carciofi alla giudia, pizza al taglio, and gelato — plebeian recipes executed for centuries.",
      },
      {
        question: "How do I avoid tourist-trap restaurants in Rome?",
        answer:
          "No photo menus or street-side hosts, pasta priced €10–14, short menus, Italian conversations at nearby tables, and locations one street off the monuments. Trastevere, Monti and Testaccio pass.",
      },
      {
        question: "Should I put cream in carbonara?",
        answer:
          "Rome says no — the sauce is egg yolks, pecorino, guanciale and pasta water. Any restaurant offering creamy carbonara has told you everything about its kitchen.",
      },
    ],
    relatedDestinationSlugs: ["rome", "florence", "venice"],
    relatedTripSlugs: ["rome-food-3d", "rome-3d-classics", "rome-eternal-city"],
    relatedGuideSlugs: ["rome-3-day-itinerary", "barcelona-food-guide", "best-time-to-visit-rome", "slow-travel-italy-2026", "italy-7-day-itinerary"],
    planner: {
      destination: "Rome",
      travelStyle: "foodie",
      interests: ["food", "history"],
      label: "Plan an eating trip to Rome",
    },
  },

  // ── 13. Hong Kong Food Guide ──────────────────────────────────────────
  {
    slug: "hong-kong-food-guide",
    title: "Hong Kong Food Guide: Dim Sum, Roast Goose and the Cha Chaan Teng",
    seoTitle: "Hong Kong Food Guide: Dim Sum & More",
    metaDescription:
      "What to eat in Hong Kong: dim sum etiquette, the cha chaan teng's milk tea, Michelin-starred roast goose, egg tarts and the dai pai dong tradition.",
    excerpt:
      "The Hong Kong eating curriculum — dim sum logistics, the milk-tea canon, roast-goose pilgrimages, and the $5 breakfasts that define the city.",
    coverImage: null,
    gradient: "from-red-600 to-amber-500",
    author: PRIYA,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "7 min read",
    tags: ["hong kong", "food", "dim sum", "cantonese"],
    city: "Hong Kong",
    country: "Hong Kong",
    introduction: [
      "Hong Kong eats with the density and seriousness of nowhere else: three Michelin-starred roast-goose institutions, a cha chaan teng (tea restaurant) culture that turns milk tea and pineapple buns into heritage, and dim sum trolleys that have been navigating the same rooms since the 1960s. The city's food is its museum — and this is the floor plan.",
      "The orientation rule: eat early, eat often, and let the queues do the rating. Hong Kong's famous spots sell out by mid-afternoon; the breakfast at 7:30am is the local's meal and the traveler's secret.",
    ],
    sections: [
      {
        heading: "Dim Sum: The Morning Ceremony",
        paragraphs: [
          "Yum cha ('drink tea') is the ritual: har gow (shrimp dumplings — translucent, three pleats minimum), siu mai (pork and shrimp), char siu bao (BBQ pork buns), and cheung fun (rice rolls) arrive by trolley or order sheet. The etiquette: tea pours for others before yourself, tap two fingers to say thanks, and don't dawdle at the classic rooms — tables turn on schedule.",
        ],
      },
      {
        heading: "The Roast Meats and the Wonton Noodles",
        paragraphs: [
          "Roast goose is the pilgrimage (Kam's Roast Goose and Yat Lok hold Michelin stars; the queue is the price), char siu (BBQ pork) is the everyday glory, and siu yuk's crackling is a texture museum. Wonton noodle shops serve bowls under HK$50 that would headline elsewhere — the springy noodles, the shrimp-packed wontons, the broth that took the family three generations to tune.",
        ],
      },
      {
        heading: "Cha Chaan Teng and the Street Sweets",
        paragraphs: [
          "The cha chaan teng is Hong Kong's café-diner: milk tea (silk-stocking brewed, silky with evaporated milk), pineapple buns (no pineapple, all butter), French toast the Hong Kong way (peanut butter stuffed, syrup flooded), and macaroni soup with ham for breakfast. Egg tarts — Tai Cheong's is the legend — and egg waffles complete the street-sweet canon. Dai pai dong open-air stalls are the old-school dinner theater.",
        ],
      },
    ],
    itinerary: {
      heading: "One Perfect Eating Day",
      intro: "Hong Kong's day in four meals, arranged on the Island.",
      days: [
        {
          day: 1,
          theme: "The eating circuit",
          description:
            "7:30am: cha chaan teng breakfast — milk tea, pineapple bun, macaroni soup. 11am: dim sum at a classic teahouse (Lin Heung-era institutions or Lin Heung-heirs). 3pm: roast goose pilgrimage or wonton noodles in Central. 7pm: dai pai dong dinner in Sham Shui Po or Temple Street's night-market stalls, egg waffle for the walk.",
        },
        {
          day: 2,
          theme: "The specialist list",
          description:
            "Slot in across a trip: egg tarts at Tai Cheong, clay-pot rice in Yuen Long's winter season, fish balls and beef offal from street carts, Hong Kong-style French toast, Peking-style duck if you're loyal to a different canon, and midnight wontons in Mong Kok.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Logistics & etiquette",
        items: [
          "Dim sum is breakfast-to-lunch; famous rooms thin out by 2pm.",
          "Sharing tables is normal at noodle shops; the two-finger tea thanks is universal.",
          "Octopus card works at bakeries and cha chaan tengs — top it up beyond transit.",
        ],
      },
      {
        heading: "Budget & practical",
        items: [
          "Cha chaan teng breakfast HK$40–60; dim sum HK$100–150 per person; wonton noodles HK$40–55; roast goose set HK$90–150.",
          "Michelin-starred eats here can cost less than a Western sandwich — the Bib Gourmand list is the budget's roadmap.",
          "Cash still rules at stalls and older shops; cards and pay apps cover the chains.",
        ],
      },
    ],
    faq: [
      {
        question: "What food is Hong Kong famous for?",
        answer:
          "Dim sum, roast goose, wonton noodles, char siu, milk tea and pineapple buns from the cha chaan tengs, egg tarts and egg waffles — Cantonese cooking with its own café culture.",
      },
      {
        question: "Is Hong Kong expensive to eat?",
        answer:
          "The famous restaurants are shockingly affordable — Michelin-starred meals under HK$150 — while fine dining runs international prices. The street and cha chaan teng layer keeps a day of eating under HK$300.",
      },
      {
        question: "What time should I eat dim sum?",
        answer:
          "Morning to early afternoon — the classic rooms serve from 7–8am and wind down by 2:30pm. Go early for the freshest carts and the local crowd.",
      },
    ],
    relatedDestinationSlugs: ["hong-kong", "macau", "taipei"],
    relatedTripSlugs: ["hong-kong-3d-highlights", "hongkong-shopping-foodie", "macau-portuguese-charm"],
    relatedGuideSlugs: ["hong-kong-48-hours", "how-many-days-in-hong-kong", "taipei-3-day-itinerary", "seoul-food-guide", "osaka-food-guide-2027"],
    planner: {
      destination: "Hong Kong",
      travelStyle: "foodie",
      interests: ["food", "shopping"],
      label: "Plan an eating trip to Hong Kong",
    },
  },
];

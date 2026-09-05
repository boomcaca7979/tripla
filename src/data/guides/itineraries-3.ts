import type { Guide } from "../guides";

// Itinerary guides, batch 3 — the shorter/longer length variants for the
// highest-volume destinations. Each pairs with (not duplicates) the existing
// 3/5/7-day guides and references the trips from the 200-trip library.

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

const MARCUS = {
  name: "Marcus Chen",
  initials: "MC",
  avatarColor: "from-violet-500 to-purple-600",
  role: "City Break Editor",
};

const PRIYA = {
  name: "Priya Nair",
  initials: "PN",
  avatarColor: "from-emerald-500 to-teal-600",
  role: "Asia Editor",
};

export const ITINERARIES_3_GUIDES: Guide[] = [
  {
    slug: "tokyo-2-day-itinerary",
    title: "Tokyo 2 Day Itinerary: The 48-Hour Essentials",
    seoTitle: "Tokyo 2 Day Itinerary: 48 Hours",
    metaDescription:
      "A realistic 48 hours in Tokyo: one old-east day, one modern-west day, and the pacing that keeps a short visit from becoming a transit slog.",
    excerpt:
      "Two days in the city of twelve: the honest essentials, one side per day, and what to skip without regret.",
    coverImage: null,
    gradient: "from-rose-500 to-pink-700",
    author: YUKI,
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    readTime: "6 min read",
    tags: ["tokyo", "itinerary", "2 days", "japan"],
    city: "Tokyo",
    country: "Japan",
    introduction: [
      "Two days in Tokyo is a stopover, a weekend bolt-on, or a deliberate taster — and all three can be excellent if you accept the constraint: one side of the city per day, no exceptions. Tokyo's transit is superb but its size is real, and the two-day failure mode is spending three hours a day underground.",
      "The plan below does old east Tokyo on day one (Senso-ji, Ueno, Yanaka) and the modern west on day two (Meiji, Harajuku, Shibuya, Shinjuku). At roughly $120 a day, the trip runs about $240 excluding flights — see the budget guide for the line items.",
    ],
    sections: [
      {
        heading: "The One-Side Rule",
        paragraphs: [
          "Pick a hotel on the Yamanote loop — Ueno for day one's geometry, Shinjuku or Shibuya for day two's — and refuse every cross-town temptation. The east is temples, markets and low-rise lanes; the west is shrines, fashion and neon. Two days is exactly one day of each.",
        ],
      },
      {
        heading: "What Gets Skipped",
        paragraphs: [
          "Ginza, the bayside, Akihabara, day trips, and most museums. If any of those is the actual reason you're flying in, swap it for day one's afternoon — the itinerary is a frame, not a cage. Our 3-day and 5-day guides show what the next day buys.",
        ],
      },
      {
        heading: "Jet-Lag Arithmetic",
        paragraphs: [
          "Long-haul arrivals wake at four in the morning — use it. Senso-ji at 7am is empty and beautiful; Ueno's park is yours before the school groups. Front-load nothing ticketed until day two, when your body clock and the queues are both manageable.",
        ],
      },
    ],
    itinerary: {
      heading: "Your 48 Hours",
      intro: "One side per day, mornings doing the work, dinners near the hotel.",
      days: [
        {
          day: 1,
          theme: "Old East Tokyo",
          description:
            "Senso-ji before 9am, Nakamise's snack stalls, then Ueno Park's museums or Yanaka's lanes. Evening: an izakaya near the hotel and the earliest night of your trip.",
        },
        {
          day: 2,
          theme: "Modern West Tokyo",
          description:
            "Meiji Shrine's forest first, Harajuku's Takeshita-dori and back lanes, Shibuya Crossing at dusk, and a farewell Shinjuku neon dinner.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Transit",
        items: [
          "Suica on your phone from the airport; it covers everything.",
          "Never more than two transfers between sights in 48 hours.",
          "Trains stop near midnight — plan dinners close to base.",
        ],
      },
      {
        heading: "Money",
        items: [
          "About $120/day mid-range; konbini breakfasts and teishoku lunches stretch it.",
          "Point-to-point tickets, not passes, for a two-day stay.",
        ],
      },
    ],
    faq: [
      {
        question: "Is 2 days in Tokyo enough?",
        answer:
          "For a first taste, yes — one day of old east, one of modern west. You'll skip Ginza, bayside and day trips; our 3-day and 5-day itineraries show the next rungs.",
      },
      {
        question: "Where should I stay for 2 days?",
        answer:
          "On the Yamanote loop: Ueno if you want the east-first geometry, Shinjuku or Shibuya for nightlife and west-side access.",
      },
      {
        question: "Can I see Mount Fuji in 2 days?",
        answer:
          "Not honestly. Fuji views from the towers on a clear day are the realistic version; Hakone deserves its own day.",
      },
    ],
    relatedDestinationSlugs: ["tokyo", "kyoto", "osaka"],
    relatedTripSlugs: ["tokyo-2d-highlights", "tokyo-3d-foodie", "tokyo-5d-classic"],
    relatedGuideSlugs: ["tokyo-3-day-itinerary", "how-many-days-in-tokyo", "tokyo-travel-budget", "best-time-to-visit-tokyo", "best-area-to-stay-in-tokyo"],
    planner: {
      destination: "Tokyo",
      travelStyle: "cultural",
      interests: ["history", "food"],
      label: "Build your 48-hour Tokyo plan",
    },
  },
  {
    slug: "tokyo-4-day-itinerary",
    title: "Tokyo 4 Day Itinerary: The Core Plus One Flex Day",
    seoTitle: "Tokyo 4 Day Itinerary: Core + Flex",
    metaDescription:
      "Four days in Tokyo: the east–west core, one center-and-bayside day, and a flex day for weather, whim or your first day trip.",
    excerpt:
      "The four-day shape: three core days and one flex day — the minimum that lets Tokyo surprise you.",
    coverImage: null,
    gradient: "from-pink-500 to-indigo-600",
    author: YUKI,
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    readTime: "7 min read",
    tags: ["tokyo", "itinerary", "4 days", "japan"],
    city: "Tokyo",
    country: "Japan",
    introduction: [
      "Four days is the length where Tokyo trips stop being itineraries and start being cities. The first three days follow the proven east–west–center arc; the fourth is deliberately unplanned — the flex day that absorbs rain, whims, and the queue you couldn't resist.",
      "Budget at roughly $120 a day: call it $480 excluding flights. The flex day is also the budget's shock absorber — a cheap neighborhood day balances any splurge that snuck in.",
    ],
    sections: [
      {
        heading: "Days 1–3: The Proven Arc",
        paragraphs: [
          "East (Asakusa, Ueno, Yanaka), west (Meiji, Harajuku, Shibuya, Shinjuku), center (Tsukiji, Ginza, bayside) — the arc our 3-day guide details. Each day keeps to one side of the city and does its heavy lifting before noon.",
        ],
      },
      {
        heading: "Day 4: The Flex Day, Spent Well",
        paragraphs: [
          "The flex day's menu: a Kamakura day trip if the weather is kind, Shimokitazawa and Nakameguro if it isn't, the teamLab slot you couldn't book earlier, or the neighborhood you loved — returned to slowly. The rule: nothing booked, everything weather-dependent, no guilt.",
        ],
      },
      {
        heading: "Who Four Days Is For",
        paragraphs: [
          "First-timers who want the core without the sprint, returners filling gaps, and anyone whose Japan route gives Tokyo a real base. Four days is our honest minimum for the city plus one excursion; five adds the neighborhoods day most trips remember most.",
        ],
      },
    ],
    itinerary: {
      heading: "The 4-Day Shape",
      intro: "Three core days on the proven arc, one flex day at the end.",
      days: [
        {
          day: 1,
          theme: "Old East: Asakusa & Ueno",
          description: "Senso-ji early, Ueno or Yanaka after, izakaya dinner, early night.",
        },
        {
          day: 2,
          theme: "Modern West: Meiji to Shibuya",
          description: "Meiji's forest, Harajuku's lanes, Shibuya at dusk, Shinjuku neon.",
        },
        {
          day: 3,
          theme: "Center: Tsukiji, Ginza & Bayside",
          description: "Market breakfast, Ginza's halls, Odaiba or museums by afternoon.",
        },
        {
          day: 4,
          theme: "Flex Day",
          description: "Kamakura if clear, neighborhoods if not — nothing booked, everything earned.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Structure",
        items: [
          "One core area per day; the fourth day has none — that's the point.",
          "Book ticketed experiences for days 2–4, after jet lag releases you.",
          "Keep the flex day's budget low to offset any splurge.",
        ],
      },
      {
        heading: "Timing",
        items: [
          "Four days at ~$120/day lands near $480 excluding flights.",
          "Sakura weeks: book the hotel 4–6 months out.",
        ],
      },
    ],
    faq: [
      {
        question: "Is 4 days in Tokyo better than 3?",
        answer:
          "Yes, by exactly one flex day — the day that absorbs rain and whim. Three days covers the core; four lets the city surprise you.",
      },
      {
        question: "Can I add a day trip with 4 days?",
        answer:
          "One — Kamakura, Hakone, or Nikko each take the flex day. Two day trips at four days means sprinting.",
      },
      {
        question: "How much does 4 days in Tokyo cost?",
        answer:
          "About $480 excluding flights at our $120/day mid-range planning figure.",
      },
    ],
    relatedDestinationSlugs: ["tokyo", "kyoto", "osaka"],
    relatedTripSlugs: ["tokyo-budget-4d", "tokyo-family-4d", "tokyo-5d-classic"],
    relatedGuideSlugs: ["tokyo-3-day-itinerary", "tokyo-5-day-itinerary", "how-many-days-in-tokyo", "tokyo-travel-budget", "is-tokyo-expensive"],
    planner: {
      destination: "Tokyo",
      travelStyle: "cultural",
      interests: ["food", "shopping"],
      label: "Generate your 4-day Tokyo plan",
    },
  },
  {
    slug: "tokyo-7-day-itinerary",
    title: "Tokyo 7 Day Itinerary: A Week Inside the City",
    seoTitle: "Tokyo 7 Day Itinerary: A Week Inside",
    metaDescription:
      "Seven days based entirely in Tokyo: the classic core, the neighborhoods most trips skip, two day trips, and one deliberately empty day.",
    excerpt:
      "Seven days without changing hotels: the core, the neighborhoods, two day trips, and the week's most important day — the empty one.",
    coverImage: null,
    gradient: "from-indigo-500 to-rose-600",
    author: YUKI,
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    readTime: "8 min read",
    tags: ["tokyo", "itinerary", "7 days", "japan"],
    city: "Tokyo",
    country: "Japan",
    introduction: [
      "A week in Tokyo without changing hotels is a different trip — slower, deeper, and cheaper than the Golden Route version. The core takes three days; the neighborhoods take two; two day trips (Kamakura, Hakone or Nikko) fill the frame; and one day stays deliberately empty.",
      "Budget at roughly $120 a day — about $840 for the week excluding flights and any ryokan splurge. The single-hotel base kills the packing tax and lets the neighborhoods, not the stations, set the pace.",
    ],
    sections: [
      {
        heading: "Why a Tokyo-Only Week Works",
        paragraphs: [
          "The classic mistake is treating Tokyo as a two-day gateway. Treated as a destination, it offers a dozen district-characters, a museum scene of world rank, markets, islands, mountains on the horizon — and day trips that deserve full days, not rushed halves. One hotel, unpacked once, is the luxury that makes seven days feel short.",
        ],
      },
      {
        heading: "The Two Day Trips",
        paragraphs: [
          "Kamakura (an hour by train): the Great Buddha, Hase-dera and the Enoshima coast. Hakone (90 minutes): the ropeway, the pirate ship, the onsen — do it as a day or upgrade to a ryokan overnight. Nikko (two hours): the shrine complex in cedar forest, best in autumn.",
        ],
      },
      {
        heading: "The Empty Day Doctrine",
        paragraphs: [
          "Day seven is blank on purpose. By then you'll have a list the city gave you — the café, the market, the lane. The empty day is when Tokyo stops being an itinerary and becomes somewhere you've been. Guard it from yourself.",
        ],
      },
    ],
    itinerary: {
      heading: "The Week, Day by Day",
      intro: "Core (1–3), neighborhoods (4–5), day trips (6), empty day (7).",
      days: [
        {
          day: 1,
          theme: "Old East: Asakusa & Ueno",
          description: "Senso-ji early, Ueno's museums or Yanaka's lanes, izakaya night.",
        },
        {
          day: 2,
          theme: "Modern West: Meiji to Shinjuku",
          description: "Meiji, Harajuku, Shibuya at dusk, Shinjuku's neon and bars.",
        },
        {
          day: 3,
          theme: "Center: Tsukiji, Ginza & Bayside",
          description: "Market breakfast, Ginza, Odaiba or teamLab, museums if it rains.",
        },
        {
          day: 4,
          theme: "Neighborhoods: Shimokitazawa & Nakameguro",
          description: "Vintage lanes, canal cafés, Daikanyama's boutiques — the day most trips skip.",
        },
        {
          day: 5,
          theme: "Neighborhoods: Koenji & Akihabara",
          description: "Koenji's punk thrift and standing bars; Akihabara if the electric city calls.",
        },
        {
          day: 6,
          theme: "Day Trip: Kamakura or Hakone",
          description: "One full excursion — coast or mountains — back by dinner.",
        },
        {
          day: 7,
          theme: "The Empty Day",
          description: "Nothing planned. Return to what you loved. The best day of the week.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Base strategy",
        items: [
          "One hotel on the Yamanote loop for the whole week — Shinjuku or Ueno.",
          "Ship any luggage you don't need on day one (takkyubin).",
          "Buy point-to-point day-trip tickets; no passes for a city week.",
        ],
      },
      {
        heading: "Budget",
        items: [
          "About $840 for seven days at planning figures, excluding flights.",
          "One ryokan-style splurge or onsen afternoon is the week's treat.",
        ],
      },
    ],
    faq: [
      {
        question: "Is a week too long for Tokyo alone?",
        answer:
          "Not with the neighborhoods and day trips included — seven days is the minimum for Tokyo-as-destination rather than Tokyo-as-gateway.",
      },
      {
        question: "Which day trips work from a Tokyo base?",
        answer:
          "Kamakura, Hakone and Nikko each fill a day comfortably. Pick by weather: coast for clear, mountains for mist.",
      },
      {
        question: "How much does a Tokyo-only week cost?",
        answer:
          "About $840 excluding flights at our $120/day planning figure — a single hotel base is the quiet savings.",
      },
    ],
    relatedDestinationSlugs: ["tokyo", "kyoto", "osaka"],
    relatedTripSlugs: ["tokyo-7d-deep-dive", "tokyo-5d-classic", "japan-budget-4d"],
    relatedGuideSlugs: ["tokyo-5-day-itinerary", "tokyo-3-day-itinerary", "best-neighborhoods-in-tokyo", "tokyo-travel-budget", "japan-rail-travel-guide"],
    planner: {
      destination: "Tokyo",
      travelStyle: "cultural",
      interests: ["food", "shopping", "history"],
      label: "Plan a Tokyo-only week",
    },
  },
  {
    slug: "seoul-2-day-itinerary",
    title: "Seoul 2 Day Itinerary: The 48-Hour Sprint",
    seoTitle: "Seoul 2 Day Itinerary: 48 Hours",
    metaDescription:
      "48 hours in Seoul: palaces and hanok lanes on day one, Hongdae or Itaewon on day two — the compressed route with T-money logistics.",
    excerpt:
      "Two days, three Seouls compressed into two: royal morning, food-fueled evenings, zero wasted transfers.",
    coverImage: null,
    gradient: "from-fuchsia-500 to-purple-700",
    author: MARCUS,
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    readTime: "6 min read",
    tags: ["seoul", "itinerary", "2 days", "korea"],
    city: "Seoul",
    country: "South Korea",
    introduction: [
      "Two days in Seoul covers the royal core and one youth district comfortably — the city's subway geometry favors the sprint. Day one is palaces and hanok lanes; day two is the Seoul you came to eat in.",
      "At roughly $100 a day, the trip runs about $200 excluding flights. Stay near Line 2 (Hongdae, Euljiro or Gangnam) and every day starts one ride from anywhere.",
    ],
    sections: [
      {
        heading: "Day One: The Royal Core",
        paragraphs: [
          "Gyeongbokgung at 9am for the guard ceremony, a hanbok rental to make the palace photos and the entry free, Bukchon's lanes before they fill, Ikseon-dong's café alleys for lunch, and Insadong for souvenirs. Evening: your first Korean BBQ — staff-grilled, banchan refilled, cheap.",
        ],
      },
      {
        heading: "Day Two: The Youth District",
        paragraphs: [
          "Pick Hongdae (buskers, street food, cafés) or Itaewon (global food, rooftops) and commit. Morning shopping, street-food lunch, and the evening that explains Seoul's reputation. N Seoul Tower or Lotte World Tower's view slots in before dinner if the sky is clear.",
        ],
      },
      {
        heading: "The Skip List",
        paragraphs: [
          "Gangnam, the DMZ, Suwon and the Han River parks — all worth days of their own (see our 3-day and 4-day guides). Two days is the royal core plus one district, done well.",
        ],
      },
    ],
    itinerary: {
      heading: "Your 48 Hours",
      intro: "Royal Seoul first, youth district second, BBQ every night.",
      days: [
        {
          day: 1,
          theme: "Royal Seoul",
          description:
            "Gyeongbokgung ceremony, hanbok walk through Bukchon, Ikseon-dong cafés, Insadong tea, and a staff-grilled BBQ dinner.",
        },
        {
          day: 2,
          theme: "Hongdae or Itaewon",
          description:
            "Shopping and cafés, street-food lunch, tower view at dusk, and the night that runs — buskers, markets, noraebang if game.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Logistics",
        items: [
          "T-money card on arrival — subway, buses, convenience stores.",
          "Stay near Line 2; two days needs at most one transfer per ride.",
          "Palace entry is free in hanbok — rentals cluster by Gyeongbokgung.",
        ],
      },
      {
        heading: "Money",
        items: [
          "About $100/day mid-range; BBQ for two under $40.",
          "Cards work nearly everywhere; markets prefer T-money or cash.",
        ],
      },
    ],
    faq: [
      {
        question: "Is 2 days in Seoul enough?",
        answer:
          "For the royal core plus one district, yes. The DMZ, Gangnam and Busan need more — our 3-day and 5-day guides extend cleanly.",
      },
      {
        question: "Which youth district should I pick?",
        answer:
          "Hongdae for buskers and street energy; Itaewon for global food and rooftops. Pick one and commit the evening.",
      },
      {
        question: "How much does 2 days in Seoul cost?",
        answer: "About $200 excluding flights at our $100/day planning figure.",
      },
    ],
    relatedDestinationSlugs: ["seoul", "busan", "tokyo"],
    relatedTripSlugs: ["seoul-2d-highlights", "seoul-3d-classic", "seoul-food-3d"],
    relatedGuideSlugs: ["seoul-3-day-itinerary", "how-many-days-in-seoul", "seoul-travel-budget", "seoul-food-guide", "seoul-vs-tokyo"],
    planner: {
      destination: "Seoul",
      travelStyle: "foodie",
      interests: ["food", "history"],
      label: "Build your 48-hour Seoul plan",
    },
  },
  {
    slug: "seoul-5-day-itinerary",
    title: "Seoul 5 Day Itinerary: The Deep Version",
    seoTitle: "Seoul 5 Day Itinerary: The Deep Version",
    metaDescription:
      "Five days in Seoul: the classic three, a DMZ or Suwon deep-dive, and a fifth day of markets, mountains and bathhouse recovery.",
    excerpt:
      "The five-day Seoul: the classic core, one deep-dive day, and the fifth day that locals would actually run.",
    coverImage: null,
    gradient: "from-purple-500 to-fuchsia-700",
    author: MARCUS,
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    readTime: "7 min read",
    tags: ["seoul", "itinerary", "5 days", "korea"],
    city: "Seoul",
    country: "South Korea",
    introduction: [
      "Five days is where Seoul trips get their second act. The first three follow our classic arc — palaces, youth districts, Gangnam and the river. Day four is the deep-dive fork (DMZ, Suwon's fortress, or deeper Seoul). Day five is the local version: markets, a ridge walk, and the bathhouse finish.",
      "At roughly $100 a day, plan on $500 excluding flights — plus DMZ fees if that branch calls. The fifth day is also the cheapest: markets, mountains and jjimjilbangs cost almost nothing.",
    ],
    sections: [
      {
        heading: "Days 1–3: The Classic Arc",
        paragraphs: [
          "Royal Seoul (Gyeongbokgung, Bukchon, Ikseon-dong), the youth districts (Hongdae or Itaewon), and Gangnam with the Han River sunset — our 3-day guide's arc, unchanged.",
        ],
      },
      {
        heading: "Day 4: The Deep-Dive Fork",
        paragraphs: [
          "The DMZ with a licensed operator (book 1–2 weeks out, passport required), Suwon's Hwaseong Fortress walls an hour south, or the in-city deep version: the free National Museum, Mangwon Market, and Inwangsan's fortress-wall ridge at golden hour. All three are honest days; pick by temperament.",
        ],
      },
      {
        heading: "Day 5: The Local Sunday",
        paragraphs: [
          "Gwangjang's bindaetteok for lunch, Mangwon's market for snacks, Dongdaemun Design Plaza's spaceship for the photo, and a jjimjilbang finish that turns four days of walking into new legs. This is the day Seoulites actually live.",
        ],
      },
    ],
    itinerary: {
      heading: "The 5-Day Shape",
      intro: "Classic arc (1–3), deep-dive fork (4), local Sunday (5).",
      days: [
        {
          day: 1,
          theme: "Royal Seoul",
          description: "Gyeongbokgung, Bukchon hanbok walk, Ikseon-dong, Insadong, BBQ dinner.",
        },
        {
          day: 2,
          theme: "Hongdae / Itaewon",
          description: "Shopping, street food, buskers or rooftops, and the late night.",
        },
        {
          day: 3,
          theme: "Gangnam & the Han",
          description: "COEX library, Bongeunsa, Lotte World view, Han River park picnic.",
        },
        {
          day: 4,
          theme: "Deep-Dive Fork",
          description: "DMZ, Suwon's fortress, or the National Museum–Mangwon–Inwangsan trio.",
        },
        {
          day: 5,
          theme: "Local Sunday",
          description: "Gwangjang lunch, DDP's architecture, jjimjilbang finish, farewell chimaek.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Booking ahead",
        items: [
          "DMZ tours sell out 1–2 weeks ahead; passport details required.",
          "Changdeokgung's Secret Garden books by timed slot.",
          "Everything else walks up — Seoul forgives.",
        ],
      },
      {
        heading: "Budget",
        items: [
          "About $500 for five days at planning figures, excluding flights.",
          "Day five is the cheapest — markets and bathhouses cost pocket change.",
        ],
      },
    ],
    faq: [
      {
        question: "Is 5 days in Seoul too long?",
        answer:
          "Not with the deep-dive day and the local Sunday included — five days is where Seoul stops being a checklist.",
      },
      {
        question: "DMZ, Suwon, or deep Seoul for day four?",
        answer:
          "History-first travelers take the DMZ; walkers take Suwon's walls; everyone else takes the museum-market-ridge trio. All three are honest days.",
      },
      {
        question: "How much does 5 days in Seoul cost?",
        answer: "About $500 excluding flights at our $100/day planning figure, plus DMZ fees if chosen.",
      },
    ],
    relatedDestinationSlugs: ["seoul", "busan", "tokyo"],
    relatedTripSlugs: ["seoul-5d-culture", "seoul-4d-deep-dive", "korea-7d-seoul-busan"],
    relatedGuideSlugs: ["seoul-3-day-itinerary", "seoul-4-day-itinerary", "seoul-travel-budget", "seoul-food-guide", "best-neighborhoods-in-seoul"],
    planner: {
      destination: "Seoul",
      travelStyle: "cultural",
      interests: ["history", "food"],
      label: "Generate your 5-day Seoul plan",
    },
  },
  {
    slug: "seoul-7-day-itinerary",
    title: "Seoul 7 Day Itinerary: A Week in Korea's Capital",
    seoTitle: "Seoul 7 Day Itinerary: A Week",
    metaDescription:
      "Seven days in Seoul: the classic core, the deep dives, day trips to Suwon and the DMZ, and a Busan teaser by KTX if you must.",
    excerpt:
      "A full week in Seoul: the core, the forks, the day trips, and one KTX teaser toward Busan for the curious.",
    coverImage: null,
    gradient: "from-blue-600 to-fuchsia-600",
    author: MARCUS,
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    readTime: "8 min read",
    tags: ["seoul", "itinerary", "7 days", "korea"],
    city: "Seoul",
    country: "South Korea",
    introduction: [
      "Seven days in Seoul is the version where the city stops being a stopover. The classic arc takes three days; the deep dives take two; day six goes to Suwon's fortress or the DMZ; and day seven — the honest choice — boards the KTX for a Busan teaser or holds the Seoul base for one more neighborhood.",
      "Budget at roughly $100 a day: about $700 for the week excluding flights. Korea's rail makes the country feel small; the temptation to over-travel is real, and this guide argues for restraint.",
    ],
    sections: [
      {
        heading: "The Week's Architecture",
        paragraphs: [
          "Days 1–3 run the classic arc (royal, youth, Gangnam-and-river). Day 4 is the DMZ or Suwon fork. Day 5 is the museums-markets-bathhouse local day. Day 6 is the second fork — Bukhansan's granite hikes, Everland with kids, or the KTX teaser to Busan. Day 7 stays soft: the neighborhood you loved, souvenir logistics, the airport train.",
        ],
      },
      {
        heading: "The Busan Question",
        paragraphs: [
          "A KTX day-trip to Busan (2h40 each way) is possible and tempting — Gamcheon's colors and Jagalchi's seafood in one long day. The honest advice: don't. Busan deserves the two-night version (our Korea 7-day guide does it properly); from a Seoul base, use day six for Suwon or Bukhansan instead.",
        ],
      },
      {
        heading: "One Hotel, Seven Days",
        paragraphs: [
          "Pick a Line 2 or Line 3 base and stay put. Seoul's subway makes day trips trivial and hotel changes pointless — the money saved funds the BBQ count.",
        ],
      },
    ],
    itinerary: {
      heading: "The Week, Day by Day",
      intro: "Classic arc (1–3), forks (4–6), soft landing (7).",
      days: [
        {
          day: 1,
          theme: "Royal Seoul",
          description: "Gyeongbokgung, Bukchon, Ikseon-dong, Insadong, BBQ dinner.",
        },
        {
          day: 2,
          theme: "Youth District",
          description: "Hongdae or Itaewon — shopping, street food, the late night.",
        },
        {
          day: 3,
          theme: "Gangnam & the Han",
          description: "COEX, Bongeunsa, tower view, Han River park sunset.",
        },
        {
          day: 4,
          theme: "Fork One: DMZ",
          description: "The licensed tour morning, Gwangjang recovery evening.",
        },
        {
          day: 5,
          theme: "The Local Day",
          description: "National Museum, Mangwon Market, Inwangsan ridge, jjimjilbang.",
        },
        {
          day: 6,
          theme: "Fork Two: Suwon or Bukhansan",
          description: "Hwaseong's wall walk and galbi dinner — or the granite ridges.",
        },
        {
          day: 7,
          theme: "Soft Landing",
          description: "The neighborhood you loved, souvenirs, the airport train.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Base & transit",
        items: [
          "One hotel near Line 2 or 3 for the week.",
          "T-money everywhere; KTX tickets bought same-day for day trips.",
        ],
      },
      {
        heading: "Budget",
        items: [
          "About $700 for seven days at planning figures, excluding flights.",
          "The DMZ tour (~$70–100) is the week's biggest add-on.",
        ],
      },
    ],
    faq: [
      {
        question: "Is a week in Seoul too much?",
        answer:
          "Not with the forks and day trips included — seven days is the version where Seoul becomes a base rather than a stop.",
      },
      {
        question: "Should I day-trip to Busan from Seoul?",
        answer:
          "Possible, not recommended — 2h40 each way leaves hours, not a visit. Give Busan two nights on a separate route.",
      },
      {
        question: "How much does a Seoul week cost?",
        answer: "About $700 excluding flights at our $100/day planning figure, plus DMZ fees.",
      },
    ],
    relatedDestinationSlugs: ["seoul", "busan", "tokyo"],
    relatedTripSlugs: ["korea-7d-seoul-busan", "seoul-5d-culture", "seoul-4d-deep-dive"],
    relatedGuideSlugs: ["seoul-5-day-itinerary", "seoul-travel-budget", "seoul-transportation-guide", "best-time-to-visit-seoul", "south-korea-travel-guide"],
    planner: {
      destination: "Seoul",
      travelStyle: "cultural",
      interests: ["history", "food"],
      label: "Plan a Seoul week with AI",
    },
  },
  {
    slug: "paris-2-day-itinerary",
    title: "Paris 2 Day Itinerary: The Tight Weekend",
    seoTitle: "Paris 2 Day Itinerary: Tight Weekend",
    metaDescription:
      "A tight 48 hours in Paris: one museum, two neighborhoods, the Seine at golden hour — the version that ends rested instead of needing a holiday.",
    excerpt:
      "The 48-hour Paris that works: one museum, two neighborhoods, two booked dinners, and the river at night.",
    coverImage: null,
    gradient: "from-indigo-500 to-pink-500",
    author: SOFIA,
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    readTime: "5 min read",
    tags: ["paris", "itinerary", "2 days", "france"],
    city: "Paris",
    country: "France",
    introduction: [
      "Two days in Paris is a museum, two neighborhoods, and two dinners — anything more and the weekend starts working against itself. The plan: day one on the islands and in the Marais, day two across the river in Saint-Germain and up in Montmartre.",
      "At roughly €150 a day, the weekend runs about €300 excluding transport. The advance-planning load is tiny: one museum slot, two dinner reservations.",
    ],
    sections: [
      {
        heading: "The One-Museum Rule",
        paragraphs: [
          "Pick one: the Louvre's 9am slot for first-timers, d'Orsay for the manageable two hours, the Orangerie for Monet and out by lunch. Two museums in 48 hours costs a neighborhood — a bad trade in the world's most walkable museum-free city.",
        ],
      },
      {
        heading: "Two Evenings, Booked",
        paragraphs: [
          "Paris weekends punish walk-ins. Reserve Friday and Saturday dinners in advance — one Saint-Germain bistro, one Marais or Canal Saint-Martin spot — and walk the Seine after both. The night river is the best free attraction in Europe.",
        ],
      },
    ],
    itinerary: {
      heading: "Your 48 Hours",
      intro: "Islands and Marais first, Saint-Germain and Montmartre second.",
      days: [
        {
          day: 1,
          theme: "Islands & the Marais",
          description:
            "Île de la Cité's Sainte-Chapelle, Île Saint-Louis ice cream, the Marais's Place des Vosges and lanes, booked bistro dinner, and the Seine after.",
        },
        {
          day: 2,
          theme: "Saint-Germain & Montmartre",
          description:
            "Museum at opening, a long formule lunch, Saint-Germain's bookshop-and-café circuit, then Montmartre's lanes and the view. Croissants for the train.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Logistics",
        items: [
          "Stay central — Saint-Germain, the Marais, or by your arrival station.",
          "Four Métro rides a day maximum; the center is walkable.",
        ],
      },
      {
        heading: "Money",
        items: [
          "About €300 for two days at planning figures, excluding rail fares.",
          "Formule lunches and Seine picnics balance the two dinners.",
        ],
      },
    ],
    faq: [
      {
        question: "Is 2 days enough for Paris?",
        answer:
          "For one museum, two neighborhoods and the river — yes, done well. Versailles and the grand axis need day three (see our 3-day itinerary).",
      },
      {
        question: "Which museum for a weekend?",
        answer:
          "The Louvre for the icons, d'Orsay for efficiency, the Orangerie for Monet and speed. One only.",
      },
      {
        question: "How much does a Paris weekend cost?",
        answer: "About €300 excluding transport at our €150/day planning estimate.",
      },
    ],
    relatedDestinationSlugs: ["paris", "london", "amsterdam"],
    relatedTripSlugs: ["paris-weekend", "paris-3d-classic", "paris-food-3d"],
    relatedGuideSlugs: ["paris-weekend-itinerary", "paris-3-day-itinerary", "paris-travel-budget", "best-areas-to-stay-in-paris", "paris-vs-london"],
    planner: {
      destination: "Paris",
      travelStyle: "cultural",
      interests: ["food", "museums"],
      label: "Build your Paris weekend",
    },
  },
  {
    slug: "paris-4-day-itinerary",
    title: "Paris 4 Day Itinerary: The Core Plus Versailles",
    seoTitle: "Paris 4 Day Itinerary: +Versailles",
    metaDescription:
      "Four days in Paris: the three-day classic core plus one full Versailles day — timed entries, RER logistics and the gardens done properly.",
    excerpt:
      "The four-day Paris: the classic core, then Versailles as a full, unhurried day — the trip that does both well.",
    coverImage: null,
    gradient: "from-purple-500 to-rose-500",
    author: SOFIA,
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    readTime: "6 min read",
    tags: ["paris", "itinerary", "4 days", "versailles"],
    city: "Paris",
    country: "France",
    introduction: [
      "The fourth Paris day has one honest use: Versailles, all day, done properly. The palace is two hours; the gardens and the Trianon estate are the other five. Trying to bolt Versailles onto a three-day trip is how travelers see neither well.",
      "Budget at roughly €150 a day — about €600 for four days excluding flights, plus the ~€32 Versailles passport ticket. The RER C from central Paris takes forty minutes; the first train is the whole strategy.",
    ],
    sections: [
      {
        heading: "Days 1–3: The Classic Core",
        paragraphs: [
          "The islands-and-Louvre day, the Montmartre-and-Marais day, and the grand-axis day to the Eiffel Tower — our 3-day itinerary's arc, unchanged and proven.",
        ],
      },
      {
        heading: "Day 4: Versailles Without the Misery",
        paragraphs: [
          "First RER C train out, the palace at opening with a passport ticket (all three estates), the Hall of Mirrors before the funnel fills, then the day belongs to the gardens: the Trianon's quiet rooms, the Grand Canal's rowboats, and a picnic bought at the morning market. Return footsore and satisfied.",
        ],
      },
    ],
    itinerary: {
      heading: "The 4-Day Shape",
      intro: "Classic core (1–3), Versailles all day (4).",
      days: [
        {
          day: 1,
          theme: "Islands & the Louvre",
          description: "Louvre's 9am slot, Sainte-Chapelle, Latin Quarter, Saint-Germain dinner.",
        },
        {
          day: 2,
          theme: "Montmartre & the Marais",
          description: "Sacré-Cœur early, the butte's lanes, Place des Vosges, Marais bistro.",
        },
        {
          day: 3,
          theme: "The Grand Axis",
          description: "Tuileries to Trocadéro, Eiffel at golden hour from Champ de Mars.",
        },
        {
          day: 4,
          theme: "Versailles, All Day",
          description: "First RER out, palace at opening, gardens and Trianon until the feet quit.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Versailles logistics",
        items: [
          "Passport ticket online, days or weeks ahead — same-day queues are real.",
          "Gardens cost extra on fountain-show days; check the calendar.",
          "Closed Mondays — plan around it.",
        ],
      },
      {
        heading: "Budget",
        items: [
          "About €600 for four days at planning figures, excluding flights.",
          "The Versailles ticket (~€32) is the only new line item.",
        ],
      },
    ],
    faq: [
      {
        question: "Is Versailles worth a full day?",
        answer:
          "Yes — the palace is two hours, the gardens and Trianon are the other five. The rushed half-day version is the classic regret.",
      },
      {
        question: "4 days in Paris or 3 plus another city?",
        answer:
          "Both work. Four days suits a deeper Paris; three days plus London or Amsterdam suits first-time-Europe trips.",
      },
      {
        question: "How much does 4 days in Paris cost?",
        answer: "About €600 excluding flights at our €150/day planning estimate, plus the Versailles ticket.",
      },
    ],
    relatedDestinationSlugs: ["paris", "london", "amsterdam"],
    relatedTripSlugs: ["paris-3d-classic", "paris-5d-art-food", "paris-luxury-4d"],
    relatedGuideSlugs: ["paris-3-day-itinerary", "paris-5-day-itinerary", "paris-travel-budget", "best-time-to-visit-paris", "paris-4-day-itinerary"],
    planner: {
      destination: "Paris",
      travelStyle: "cultural",
      interests: ["museums", "history"],
      label: "Add Versailles to your Paris plan",
    },
  },
  {
    slug: "paris-7-day-itinerary",
    title: "Paris 7 Day Itinerary: A Week in Paris Properly",
    seoTitle: "Paris 7 Day Itinerary: A Week Properly",
    metaDescription:
      "Seven days in Paris: the classic core, Versailles, the museums most trips skip, and the neighborhoods that make Paris a place you've lived.",
    excerpt:
      "A Paris week: the core, Versailles, the second-tier museums, and the neighborhoods that turn visits into residency.",
    coverImage: null,
    gradient: "from-rose-500 to-indigo-700",
    author: SOFIA,
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    readTime: "7 min read",
    tags: ["paris", "itinerary", "7 days", "france"],
    city: "Paris",
    country: "France",
    introduction: [
      "A week in Paris is the trip people mean when they say 'when I retire'. The core takes three days; Versailles takes one; the second-tier museums (d'Orsay, Rodin, Orangerie, Picasso) take two; and the last day belongs to the neighborhoods — Canal Saint-Martin, the passages, the marché streets where Paris is lived rather than visited.",
      "Budget at roughly €150 a day — about €1,050 for the week excluding flights. The Museum Pass pays for itself here, finally, and the single-hotel base (Saint-Germain or the Marais) makes every day walkable.",
    ],
    sections: [
      {
        heading: "Why a Paris-Only Week Beats the Rush",
        paragraphs: [
          "The 48-hour Paris is a sprint; the week is a residency. Museums get their proper two hours instead of their highlights; dinners repeat at the good tables; and the schedule absorbs rain, strikes and whim without collapse. Paris rewards depth more than any city in Europe — the week is how you collect the dividend.",
        ],
      },
      {
        heading: "The Second-Tier Museums",
        paragraphs: [
          "d'Orsay's Impressionists deserve their unhurried morning; the Rodin's sculpture garden is the city's best-value entry; the Orangerie's Water Lilies are two oval rooms of silence; the Picasso in the Marais pairs with the neighborhood. With the Museum Pass, hopping becomes free.",
        ],
      },
      {
        heading: "The Neighborhood Days",
        paragraphs: [
          "Canal Saint-Martin's iron footbridges, the covered passages of the 2nd, Rue Cler's market morning, and Butte-aux-Cailles' village lanes — the days that make the trip feel lived. One apéritif rule per neighborhood: drink where the regulars drink.",
        ],
      },
    ],
    itinerary: {
      heading: "The Week, Day by Day",
      intro: "Core (1–3), Versailles (4), museums (5–6), neighborhoods (7).",
      days: [
        {
          day: 1,
          theme: "Islands & the Louvre",
          description: "Louvre's first entry, Sainte-Chapelle, the Latin Quarter, Saint-Germain dinner.",
        },
        {
          day: 2,
          theme: "Montmartre & the Marais",
          description: "Sacré-Cœur early, the butte's lanes, Place des Vosges, Picasso museum.",
        },
        {
          day: 3,
          theme: "The Grand Axis",
          description: "Tuileries to Trocadéro, Eiffel at golden hour, the Seine by night.",
        },
        {
          day: 4,
          theme: "Versailles, All Day",
          description: "First RER out, the palace, the gardens, the Trianon, the rowboats.",
        },
        {
          day: 5,
          theme: "Museums: d'Orsay & Rodin",
          description: "The Impressionists unhurried, Rodin's garden, a long formule lunch between.",
        },
        {
          day: 6,
          theme: "Museums: Orangerie & Beyond",
          description: "The Water Lilies, the Cluny's medieval tapestries, Saint-Germain's shops.",
        },
        {
          day: 7,
          theme: "Neighborhood Paris",
          description: "Canal Saint-Martin, the passages, Rue Cler's market — lived, not visited.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Pass & base",
        items: [
          "The Paris Museum Pass finally pays off at this length — price it against your list.",
          "One central hotel all week: Saint-Germain or the Marais.",
        ],
      },
      {
        heading: "Budget",
        items: [
          "About €1,050 for the week at planning figures, excluding flights.",
          "One splurge dinner, one picnic, one formule lunch per two days is the rhythm.",
        ],
      },
    ],
    faq: [
      {
        question: "Is a week too long for Paris?",
        answer:
          "It's the trip people wish they'd taken — the museums, the gardens and the neighborhoods all need it. Paris is the rare city that absorbs a week gracefully.",
      },
      {
        question: "Does the Museum Pass pay off in a week?",
        answer: "Yes, at 4+ museums — which a Paris week almost guarantees.",
      },
      {
        question: "How much does a Paris week cost?",
        answer: "About €1,050 excluding flights at our €150/day planning estimate.",
      },
    ],
    relatedDestinationSlugs: ["paris", "london", "amsterdam"],
    relatedTripSlugs: ["paris-luxury-4d", "paris-5d-art-food", "paris-3d-classic"],
    relatedGuideSlugs: ["paris-5-day-itinerary", "paris-4-day-itinerary", "paris-travel-budget", "best-neighborhoods-in-paris", "paris-food-guide"],
    planner: {
      destination: "Paris",
      travelStyle: "cultural",
      interests: ["museums", "food"],
      label: "Plan a Paris week with AI",
    },
  },
  {
    slug: "rome-2-day-itinerary",
    title: "Rome 2 Day Itinerary: The Ancient Sprint",
    seoTitle: "Rome 2 Day Itinerary: Ancient Sprint",
    metaDescription:
      "48 hours in Rome: the ancient core on day one, the Vatican on day two — with the queue timing and Trastevere evenings that make it humane.",
    excerpt:
      "Two days of Rome's non-negotiables: ancient core, Vatican, and every evening in Trastevere.",
    coverImage: null,
    gradient: "from-amber-500 to-orange-700",
    author: SOFIA,
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    readTime: "5 min read",
    tags: ["rome", "itinerary", "2 days", "italy"],
    city: "Rome",
    country: "Italy",
    introduction: [
      "Two days in Rome covers the two non-negotiables — the ancient core and the Vatican — if the bookings are made before you fly. Everything between them is free, walkable, and best at dusk.",
      "At roughly €130 a day, the trip runs about €260 excluding flights. Two timed entries (Colosseum+Forum, Vatican Museums) are the entire advance load.",
    ],
    sections: [
      {
        heading: "Day One: The Ancient Core",
        paragraphs: [
          "Colosseum's first slot, the Forum's valley, Palatine's viewpoint — all before the heat peaks. Afternoon siesta, then the free evening circuit: Trevi Fountain and the Pantheon at dusk, dinner in Monti.",
        ],
      },
      {
        heading: "Day Two: The Vatican & the River",
        paragraphs: [
          "Vatican Museums' early entry (Sistine before the crowd river), St Peter's if booked, then the afternoon crossing Ponte Sant'Angelo. Trastevere for dinner — the lanes reward getting lost.",
        ],
      },
    ],
    itinerary: {
      heading: "Your 48 Hours",
      intro: "Ancient first, Vatican second, fountains at dusk both days.",
      days: [
        {
          day: 1,
          theme: "Ancient Rome",
          description:
            "Colosseum's first slot, Forum and Palatine, siesta, Trevi and Pantheon at dusk, Monti dinner.",
        },
        {
          day: 2,
          theme: "The Vatican",
          description:
            "Vatican early entry, St Peter's, Ponte Sant'Angelo's terraces, Trastevere farewell carbonara.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Bookings",
        items: [
          "Colosseum+Forum and Vatican timed entries: book a week out minimum.",
          "The Pantheon charges a small fee — buy on arrival.",
        ],
      },
      {
        heading: "Money",
        items: [
          "About €260 for two days at planning figures, excluding flights.",
          "Fountains refill bottles free — carry one.",
        ],
      },
    ],
    faq: [
      {
        question: "Is 2 days enough for Rome?",
        answer:
          "For the ancient core and the Vatican, yes — with both booked ahead. The Borghese and Trastevere depth need day three (see our 3-day guide).",
      },
      {
        question: "Colosseum or Vatican first?",
        answer:
          "Both early, on different days. The Forum handles heat better; the Vatican rewards the earliest entry slot.",
      },
      {
        question: "How much does 2 days in Rome cost?",
        answer: "About €260 excluding flights at our €130/day planning estimate.",
      },
    ],
    relatedDestinationSlugs: ["rome", "florence", "venice"],
    relatedTripSlugs: ["rome-3d-classics", "rome-food-3d", "rome-eternal-city"],
    relatedGuideSlugs: ["rome-3-day-itinerary", "how-many-days-in-rome", "rome-vs-paris", "best-time-to-visit-rome", "italy-travel-guide"],
    planner: {
      destination: "Rome",
      travelStyle: "cultural",
      interests: ["history", "food"],
      label: "Build your 48-hour Rome plan",
    },
  },
  {
    slug: "rome-5-day-itinerary",
    title: "Rome 5 Day Itinerary: The Deeper City",
    seoTitle: "Rome 5 Day Itinerary: Deeper City",
    metaDescription:
      "Five days in Rome: the classic three plus the Borghese, Ostia Antica or Appian Way, and the neighborhoods that reward the extra days.",
    excerpt:
      "Five days of Rome: the classic core, the Borghese, one ancient day trip, and the trattoria depth between.",
    coverImage: null,
    gradient: "from-red-500 to-amber-600",
    author: SOFIA,
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    readTime: "6 min read",
    tags: ["rome", "itinerary", "5 days", "italy"],
    city: "Rome",
    country: "Italy",
    introduction: [
      "Five days is where Rome trips stop sprinting. The classic three days run unchanged; day four belongs to the Borghese Gallery's timed hour or an ancient day trip (Ostia Antica's quieter ruins, the Appian Way's tombs); day five is the neighborhoods — Testaccio's market, Trastevere done slowly, Aventine's keyhole.",
      "At roughly €130 a day, plan on €650 excluding flights. The extra days are the cheap ones — neighborhoods cost less than monuments.",
    ],
    sections: [
      {
        heading: "Days 1–3: The Classic Arc",
        paragraphs: [
          "Ancient core, Vatican, fountains-and-piazzas — our 3-day itinerary's proven shape, with both big bookings made ahead.",
        ],
      },
      {
        heading: "Day 4: The Borghese or the Ancient Beyond",
        paragraphs: [
          "The Borghese Gallery's timed two hours (book weeks out) is Rome's best single collection. Prefer ruins? Ostia Antica gives Pompeii's feel at a quarter of the crowds, a 30-minute train ride away. The Appian Way suits cyclists and tomb-hunters.",
        ],
      },
      {
        heading: "Day 5: The Neighborhoods",
        paragraphs: [
          "Testaccio's market and the Monte dei Cocci, the Aventine's keyhole and orange garden, Trastevere done slowly with a Santa Maria in mind. This is the Rome that makes people move here.",
        ],
      },
    ],
    itinerary: {
      heading: "The 5-Day Shape",
      intro: "Classic arc (1–3), Borghese or Ostia (4), neighborhoods (5).",
      days: [
        {
          day: 1,
          theme: "Ancient Core",
          description: "Colosseum's first slot, Forum, Trevi and Pantheon at dusk.",
        },
        {
          day: 2,
          theme: "The Vatican",
          description: "Vatican early entry, St Peter's, Trastevere dinner.",
        },
        {
          day: 3,
          theme: "Fountains & Piazzas",
          description: "Navona, Campo de' Fiori, the Borghese gardens, farewell carbonara.",
        },
        {
          day: 4,
          theme: "Borghese or Ostia",
          description: "The gallery's timed hour, or Ostia Antica's quiet ruins by train.",
        },
        {
          day: 5,
          theme: "Neighborhoods",
          description: "Testaccio market, the Aventine keyhole, Trastevere done slowly.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Bookings",
        items: [
          "The Borghese's timed entry sells out weeks ahead — book first.",
          "Ostia needs nothing but a metro+train ticket.",
        ],
      },
      {
        heading: "Budget",
        items: [
          "About €650 for five days at planning figures, excluding flights.",
          "Neighborhood days are the budget's relief valve.",
        ],
      },
    ],
    faq: [
      {
        question: "Is 5 days too long for Rome?",
        answer:
          "Not with the Borghese, Ostia and the neighborhoods included — five days is where Rome's depth starts showing.",
      },
      {
        question: "Borghese or Ostia for day four?",
        answer:
          "Art lovers take the Borghese; ruin-lovers take Ostia. Both are timed-or-trivial to book.",
      },
      {
        question: "How much does 5 days in Rome cost?",
        answer: "About €650 excluding flights at our €130/day planning estimate.",
      },
    ],
    relatedDestinationSlugs: ["rome", "florence", "venice"],
    relatedTripSlugs: ["rome-3d-classics", "rome-food-3d", "italy-7d-classics"],
    relatedGuideSlugs: ["rome-3-day-itinerary", "rome-food-guide", "best-time-to-visit-rome", "rome-travel-budget", "italy-travel-guide"],
    planner: {
      destination: "Rome",
      travelStyle: "cultural",
      interests: ["history", "food"],
      label: "Generate your 5-day Rome plan",
    },
  },
  {
    slug: "rome-7-day-itinerary",
    title: "Rome 7 Day Itinerary: A Week in the Eternal City",
    seoTitle: "Rome 7 Day Itinerary: Eternal Week",
    metaDescription:
      "Seven days in Rome: the classic core, the deep museums, Ostia and the Appian Way, a Florence teaser — and the passeggiata every evening.",
    excerpt:
      "A Roman week: the core, the deep cuts, the ancient beyond, and the evenings that make the city eternal.",
    coverImage: null,
    gradient: "from-orange-600 to-amber-600",
    author: SOFIA,
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    readTime: "7 min read",
    tags: ["rome", "itinerary", "7 days", "italy"],
    city: "Rome",
    country: "Italy",
    introduction: [
      "A week in Rome is the version where the city's layers separate: ancient, papal, Baroque, and the twentieth century's fascist architecture — each with its own day. The classic three run unchanged; the deep days add the Borghese, Ostia, the Appian Way's catacombs, and one Florence teaser by fast train.",
      "Budget at roughly €130 a day — about €910 for the week excluding flights. Rome rewards the single-hotel base: pick Monti or the Centro Storico and walk everywhere.",
    ],
    sections: [
      {
        heading: "The Week's Layers",
        paragraphs: [
          "Ancient (day 1), papal (day 2), Baroque-and-piazzas (day 3), the Borghese (day 4), the ancient beyond — Ostia or the Appian catacombs (day 5), a Florence teaser by Frecciarossa (day 6, or Trastevere-and-Testaccio if you'd rather not leave), and the neighborhoods' Sunday (day 7).",
        ],
      },
      {
        heading: "The Florence Teaser",
        paragraphs: [
          "A 90-minute train each way buys the Duomo's piazza, David's gaze and a proper lunch. Honest verdict: it's a lovely day that usually convinces people to plan a Florence week — which is a fine outcome.",
        ],
      },
      {
        heading: "The Passeggiata Doctrine",
        paragraphs: [
          "Every evening ends with the walk — the fountains, the piazzas, the river at dusk. Rome's evening is free, scheduled nowhere, and the reason the week never exhausts you.",
        ],
      },
    ],
    itinerary: {
      heading: "The Week, Day by Day",
      intro: "Core (1–3), deep cuts (4–5), Florence teaser (6), Sunday (7).",
      days: [
        {
          day: 1,
          theme: "Ancient Core",
          description: "Colosseum's first slot, Forum, Palatine, Trevi and Pantheon at dusk.",
        },
        {
          day: 2,
          theme: "The Vatican",
          description: "Vatican early, St Peter's dome, Trastevere dinner.",
        },
        {
          day: 3,
          theme: "Baroque Rome",
          description: "Navona, Campo de' Fiori, the Spanish Steps, Borghese gardens.",
        },
        {
          day: 4,
          theme: "The Borghese",
          description: "The gallery's timed hour, Aventine's keyhole, Testaccio dinner.",
        },
        {
          day: 5,
          theme: "The Ancient Beyond",
          description: "Ostia Antica by train or the Appian Way's catacombs by bike.",
        },
        {
          day: 6,
          theme: "Florence Teaser",
          description: "Fast train out, David and the Duomo, a long lunch, back for dinner.",
        },
        {
          day: 7,
          theme: "The Sunday Passeggiata",
          description: "Market morning, the river, and the last carbonara.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Bookings",
        items: [
          "Borghese, Vatican, Colosseum: all timed, all bookable weeks out.",
          "Ostia and the Appian Way need nothing but transit.",
        ],
      },
      {
        heading: "Budget",
        items: [
          "About €910 for the week at planning figures, excluding flights.",
          "The Florence teaser adds ~€60 of rail.",
        ],
      },
    ],
    faq: [
      {
        question: "Is a week too long for Rome?",
        answer:
          "Not with the layers separated — ancient, papal, Baroque, and the neighborhoods each need their day. Rome is the city people plan to leave and don't.",
      },
      {
        question: "Should I do a Florence day trip from Rome?",
        answer:
          "The train makes it easy and it's a lovely day — but it usually just books the next trip. A Trastevere-and-Testaccio day is the alternative.",
      },
      {
        question: "How much does a Rome week cost?",
        answer: "About €910 excluding flights at our €130/day planning estimate.",
      },
    ],
    relatedDestinationSlugs: ["rome", "florence", "venice"],
    relatedTripSlugs: ["italy-7d-classics", "rome-3d-classics", "rome-food-3d"],
    relatedGuideSlugs: ["rome-5-day-itinerary", "rome-food-guide", "rome-transportation-guide", "italy-travel-guide", "italy-10-day-itinerary"],
    planner: {
      destination: "Rome",
      travelStyle: "cultural",
      interests: ["history", "food"],
      label: "Plan a Roman week with AI",
    },
  },
  {
    slug: "singapore-2-day-itinerary",
    title: "Singapore 2 Day Itinerary: The Bay & the Hawk Weekend",
    seoTitle: "Singapore 2 Day Itinerary: Bay & Hawkers",
    metaDescription:
      "48 hours in Singapore: Marina Bay at both light shows, three hawker centers, and the heat-managed rhythm that makes the weekend work.",
    excerpt:
      "The 48-hour Singapore: gardens at both shows, the bay at golden hour, and one hawker center per meal.",
    coverImage: null,
    gradient: "from-emerald-500 to-blue-600",
    author: MARCUS,
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    readTime: "5 min read",
    tags: ["singapore", "itinerary", "2 days"],
    city: "Singapore",
    country: "Singapore",
    introduction: [
      "Singapore in 48 hours is a scheduling problem with one solution: outdoor before 11am and after 4pm, air-con middays, and hawker dinners once the breeze returns. Day one belongs to Marina Bay and the Gardens; day two belongs to the hawker centers and one heritage neighborhood.",
      "At about S$180 a day, the weekend runs around S$360 excluding flights — hotels are the premium; hawker meals at S$4–8 are the equalizer.",
    ],
    sections: [
      {
        heading: "Day One: Marina Bay, Both Shows",
        paragraphs: [
          "Gardens by the Bay's outdoor walks at 9am, the Cloud Forest's cooled mist at midday, Merlion and the bay walk late afternoon, and the Garden Rhapsody light show at 7:45pm — then satay at Lau Pa Sat under the towers.",
        ],
      },
      {
        heading: "Day 2: Hawkers & Heritage",
        paragraphs: [
          "Maxwell's chicken rice for lunch, Chinatown's temples and shophouses, Kampong Glam's Sultan Mosque and Haji Lane murals, and Old Airport Road's char kway teow for the farewell dinner.",
        ],
      },
    ],
    itinerary: {
      heading: "Your 48 Hours",
      intro: "Bay first, hawkers second, heat respected throughout.",
      days: [
        {
          day: 1,
          theme: "Marina Bay & Gardens",
          description:
            "Gardens at 9am, Cloud Forest at noon, the bay walk at 4, Rhapsody at 7:45, satay after.",
        },
        {
          day: 2,
          theme: "Hawkers & Heritage",
          description:
            "Maxwell lunch, Chinatown temples, Kampong Glam murals, Old Airport Road finale.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Heat management",
        items: [
          "MRT tap-in with a contactless card; underground links between 12–3pm.",
          "A compact umbrella for the twenty-minute downpours.",
        ],
      },
      {
        heading: "Money",
        items: [
          "About S$360 for the weekend at planning figures, excluding flights.",
          "Hawker meals S$4–8; alcohol is the taxed line — hawker beer or happy hours.",
        ],
      },
    ],
    faq: [
      {
        question: "Is 2 days enough for Singapore?",
        answer:
          "For the bay, the gardens and the hawker circuit — yes. Sentosa and the neighborhoods need a third day (see our 3-day guide).",
      },
      {
        question: "Which hawker centers for a weekend?",
        answer: "Maxwell, Lau Pa Sat and Old Airport Road — one per meal, three distinct philosophies.",
      },
      {
        question: "How much does a Singapore weekend cost?",
        answer: "About S$360 excluding flights at our S$180/day planning figure.",
      },
    ],
    relatedDestinationSlugs: ["singapore", "kuala-lumpur", "bali"],
    relatedTripSlugs: ["singapore-2d-highlights", "singapore-garden-city", "singapore-food-3d"],
    relatedGuideSlugs: ["singapore-3-day-itinerary", "singapore-travel-budget", "best-area-to-stay-in-singapore", "singapore-food-guide", "things-to-do-in-singapore"],
    planner: {
      destination: "Singapore",
      travelStyle: "foodie",
      interests: ["food", "shopping"],
      label: "Build your Singapore weekend",
    },
  },
  {
    slug: "singapore-5-day-itinerary",
    title: "Singapore 5 Day Itinerary: The Full City",
    seoTitle: "Singapore 5 Day Itinerary: Full City",
    metaDescription:
      "Five days in Singapore: the bay, the hawker circuit, Sentosa or the heritage neighborhoods, Pulau Ubin's wild side and one splurge night.",
    excerpt:
      "Five days of Singapore: the bay, the hawkers, Sentosa or heritage, Pulau Ubin's village wild, and one Michelin-tier night.",
    coverImage: null,
    gradient: "from-green-500 to-purple-600",
    author: MARCUS,
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    readTime: "6 min read",
    tags: ["singapore", "itinerary", "5 days"],
    city: "Singapore",
    country: "Singapore",
    introduction: [
      "Five days is the full Singapore: the bay and the hawker circuit take two; day three is the Sentosa-or-heritage fork; day four escapes to Pulau Ubin's kampong wild — the island Singapore used to be; day five belongs to the museums, the Botanic Gardens and one Michelin-tier dinner.",
      "At about S$180 a day, plan on S$900 excluding flights. The pattern that works: hawker lunches, one restaurant splurge, and the free outdoor city carrying the itinerary.",
    ],
    sections: [
      {
        heading: "Days 1–2: The Bay & the Hawk",
        paragraphs: [
          "Our 2-day weekend's arc unchanged — Gardens at both shows, the bay walk, Maxwell, Lau Pa Sat, Chinatown, Kampong Glam and Old Airport Road.",
        ],
      },
      {
        heading: "Day 3: The Fork",
        paragraphs: [
          "Families take Sentosa's beaches and cable car; everyone else takes the heritage trio — Little India's spice lanes, Katong's Peranakan shophouses and the Botanic Gardens' UNESCO shade. Both forks are honest days.",
        ],
      },
      {
        heading: "Day 4: Pulau Ubin",
        paragraphs: [
          "A bumboat from Changi Point (S$4 each way) lands you in the kampong Singapore of the 1960s — bicycles, wild boar, the Chek Jawa wetlands boardwalk. It's the island's best-kept secret and the trip's most surprising day.",
        ],
      },
      {
        heading: "Day 5: Museums & the Splurge",
        paragraphs: [
          "The National Gallery's Southeast Asian vaults, the Botanic Gardens' National Orchid, and the Michelin dinner that balances a week of hawker eating. Budget symmetry, deliberately.",
        ],
      },
    ],
    itinerary: {
      heading: "The 5-Day Shape",
      intro: "Bay and hawkers (1–2), the fork (3), Pulau Ubin (4), museums and splurge (5).",
      days: [
        {
          day: 1,
          theme: "Marina Bay & Gardens",
          description: "Gardens at 9, Cloud Forest at noon, the bay walk, Rhapsody, satay.",
        },
        {
          day: 2,
          theme: "Hawker Circuit",
          description: "Maxwell, Chinatown, Kampong Glam, Old Airport Road.",
        },
        {
          day: 3,
          theme: "Sentosa or Heritage",
          description: "Beaches and cable car — or Little India, Katong and the Botanic Gardens.",
        },
        {
          day: 4,
          theme: "Pulau Ubin",
          description: "Bumboat out, bicycles, Chek Jawa's boardwalk, kampong lunch.",
        },
        {
          day: 5,
          theme: "Museums & Splurge",
          description: "The National Gallery, the orchids, and the Michelin-tier farewell.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Logistics",
        items: [
          "Pulau Ubin's bumboats run from Changi Point until evening — last boat back matters.",
          "Book the splurge dinner and the Cloud Forest slots ahead.",
        ],
      },
      {
        heading: "Budget",
        items: [
          "About S$900 for five days at planning figures, excluding flights.",
          "Hawker lunches fund the one restaurant splurge — the honest math.",
        ],
      },
    ],
    faq: [
      {
        question: "Is 5 days too long for Singapore?",
        answer:
          "Not with Pulau Ubin and the heritage neighborhoods included — five days is where the city's layers show.",
      },
      {
        question: "Is Pulau Ubin worth a day?",
        answer: "It's the trip's most surprising day — the kampong island the skyscrapers forgot.",
      },
      {
        question: "How much does 5 days in Singapore cost?",
        answer: "About S$900 excluding flights at our S$180/day planning figure.",
      },
    ],
    relatedDestinationSlugs: ["singapore", "kuala-lumpur", "bali"],
    relatedTripSlugs: ["singapore-food-3d", "singapore-3d-family", "singapore-2d-highlights"],
    relatedGuideSlugs: ["singapore-3-day-itinerary", "singapore-travel-budget", "singapore-food-guide", "things-to-do-in-singapore", "singapore-transportation-guide"],
    planner: {
      destination: "Singapore",
      travelStyle: "foodie",
      interests: ["food", "nature"],
      label: "Generate your 5-day Singapore plan",
    },
  },
  {
    slug: "bangkok-2-day-itinerary",
    title: "Bangkok 2 Day Itinerary: The 48-Hour Temple Sprint",
    seoTitle: "Bangkok 2 Day Itinerary: 48 Hours",
    metaDescription:
      "48 hours in Bangkok: the golden temple trio at opening, one market marathon, and the Yaowarat street-food blaze between.",
    excerpt:
      "Two days of Bangkok's essentials: temples at opening, a market marathon, and Yaowarat after dark.",
    coverImage: null,
    gradient: "from-amber-500 to-purple-600",
    author: PRIYA,
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    readTime: "5 min read",
    tags: ["bangkok", "itinerary", "2 days", "thailand"],
    city: "Bangkok",
    country: "Thailand",
    introduction: [
      "Two days in Bangkok covers the golden trio — Grand Palace, Wat Pho, Wat Arun — plus one market marathon and the Chinatown night that justifies the trip. The heat dictates the order; the BTS Skytrain solves the geometry.",
      "At roughly $50 a day, the trip runs under $100 excluding flights — the best value capital in Southeast Asia.",
    ],
    sections: [
      {
        heading: "Day One: The Temple Trio",
        paragraphs: [
          "Grand Palace and Wat Phra Kaew at 8:30 (covered shoulders, before the coaches), Wat Pho's reclining Buddha late morning, and the cross-river ferry to Wat Arun for sunset. Dinner: Yaowarat's street-food blaze begins at dusk.",
        ],
      },
      {
        heading: "Day Two: The Market Marathon",
        paragraphs: [
          "Chatuchak's 15,000 stalls if it's a weekend (museums if not), Or Tor Kor's perfect fruit for lunch, an air-con afternoon, and the Ratchada night market or a rooftop to close.",
        ],
      },
    ],
    itinerary: {
      heading: "Your 48 Hours",
      intro: "Temples at opening, markets late, Yaowarat between.",
      days: [
        {
          day: 1,
          theme: "Temples & Chinatown",
          description:
            "Grand Palace and Wat Pho at opening, Wat Arun sunset by ferry, Yaowarat street-food dinner.",
        },
        {
          day: 2,
          theme: "Markets & Skyline",
          description:
            "Chatuchak or museums, Or Tor Kor fruit, air-con afternoon, Ratchada or rooftop finale.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Logistics",
        items: [
          "BTS Skytrain plus the Chao Phraya orange-flag boat covers everything.",
          "Use Grab for taxis; insist on the meter otherwise.",
        ],
      },
      {
        heading: "Money",
        items: [
          "Under $100 for two days at planning figures, excluding flights.",
          "Street-food meals $1–3; massages $10.",
        ],
      },
    ],
    faq: [
      {
        question: "Is 2 days enough for Bangkok?",
        answer:
          "For the temples, one market marathon and Yaowarat — yes. The canals and Ayutthaya need day three (see our 3-day guide).",
      },
      {
        question: "When should I do Chatuchak?",
        answer: "Saturday or Sunday morning — most stalls open weekends only, and the heat is kindest early.",
      },
      {
        question: "How much does 2 days in Bangkok cost?",
        answer: "Under $100 excluding flights at our $50/day planning estimate.",
      },
    ],
    relatedDestinationSlugs: ["bangkok", "chiang-mai", "phuket"],
    relatedTripSlugs: ["bangkok-3d-temples-markets", "bangkok-food-3d"],
    relatedGuideSlugs: ["bangkok-3-day-itinerary", "how-many-days-in-bangkok", "bangkok-night-markets-guide-2026", "thailand-travel-guide"],
    planner: {
      destination: "Bangkok",
      travelStyle: "foodie",
      interests: ["food", "history"],
      label: "Build your 48-hour Bangkok plan",
    },
  },
  {
    slug: "bangkok-5-day-itinerary",
    title: "Bangkok 5 Day Itinerary: Temples, Canals & Beyond",
    seoTitle: "Bangkok 5 Day Itinerary: Temples & Beyond",
    metaDescription:
      "Five days in Bangkok: the temple trio, the canal Bangkok, Ayutthaya's ruins by train, and the markets and rooftops between.",
    excerpt:
      "Five days of Bangkok: the temples, the canals, Ayutthaya's ruins, and every evening at street level.",
    coverImage: null,
    gradient: "from-purple-600 to-amber-500",
    author: PRIYA,
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    readTime: "6 min read",
    tags: ["bangkok", "itinerary", "5 days", "thailand"],
    city: "Bangkok",
    country: "Thailand",
    introduction: [
      "Five days lets Bangkok show its second act: the temple trio takes one, the canal Bangkok another, Ayutthaya's ruined capital a third by train, and the markets split the rest. The heat-managed rhythm — temples early, malls midday, markets late — carries all five.",
      "At roughly $50 a day, plan on $250 excluding flights. The Ayutthaya day (~$15 by train) is the week's best value.",
    ],
    sections: [
      {
        heading: "Days 1–2: The Classic Core",
        paragraphs: [
          "Our 2-day sprint unchanged: the temple trio, Chatuchak's marathon, Yaowarat's blaze.",
        ],
      },
      {
        heading: "Day 3: The Canal Bangkok",
        paragraphs: [
          "A longtail boat through the Thonburi khlongs — wooden houses on stilts, theartist villages, Wat Kalayanamit's giant Buddha. It's the Bangkok tourists skip and locals love.",
        ],
      },
      {
        heading: "Day 4: Ayutthaya by Train",
        paragraphs: [
          "The 90-minute train to the ruined Siamese capital: headless Buddhas, brick prangs, and the tree-wrapped Buddha head at Wat Mahathat. Rent a bicycle at the station; the ruins are spread out and flat.",
        ],
      },
      {
        heading: "Day 5: Markets & Massages",
        paragraphs: [
          "A floating-market morning (Taling Chan is closest), Lumpini Park's monitor lizards, and the two-hour massage that ends every good Bangkok trip.",
        ],
      },
    ],
    itinerary: {
      heading: "The 5-Day Shape",
      intro: "Temples (1), markets (2), canals (3), Ayutthaya (4), green and massage (5).",
      days: [
        {
          day: 1,
          theme: "Temple Trio & Yaowarat",
          description: "Grand Palace, Wat Pho, Wat Arun at sunset, Chinatown's blaze.",
        },
        {
          day: 2,
          theme: "Market Marathon",
          description: "Chatuchak or museums, Or Tor Kor fruit, Ratchada or rooftop night.",
        },
        {
          day: 3,
          theme: "Canal Bangkok",
          description: "Longtail through the khlongs, riverside lunch, Wat Kalayanamit.",
        },
        {
          day: 4,
          theme: "Ayutthaya by Train",
          description: "Bicycle among the ruins, the tree-wrapped Buddha, back by evening.",
        },
        {
          day: 5,
          theme: "Green & Massage",
          description: "Taling Chan floating market, Lumpini Park, the two-hour massage.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Ayutthaya logistics",
        items: [
          "Trains leave Hua Lamphong roughly hourly; rent bicycles at the station.",
          "Modest dress at the ruins — scarves solve everything.",
        ],
      },
      {
        heading: "Budget",
        items: ["About $250 for five days at planning figures, excluding flights."],
      },
    ],
    faq: [
      {
        question: "Is 5 days too long for Bangkok?",
        answer:
          "Not with the canals and Ayutthaya included — five days is where Bangkok becomes a base rather than a stop.",
      },
      {
        question: "Is Ayutthaya worth a day?",
        answer:
          "Yes — the ruined capital at bicycle speed is one of Southeast Asia's great days, an hour and $15 away.",
      },
      {
        question: "How much does 5 days in Bangkok cost?",
        answer: "About $250 excluding flights at our $50/day planning estimate.",
      },
    ],
    relatedDestinationSlugs: ["bangkok", "chiang-mai", "phuket"],
    relatedTripSlugs: ["bangkok-5d-temples-river", "bangkok-3d-temples-markets", "thailand-10d-bangkok-islands"],
    relatedGuideSlugs: ["bangkok-3-day-itinerary", "bangkok-food-guide", "best-areas-to-stay-in-bangkok", "thailand-travel-guide", "bangkok-nightlife-guide"],
    planner: {
      destination: "Bangkok",
      travelStyle: "cultural",
      interests: ["food", "history"],
      label: "Generate your 5-day Bangkok plan",
    },
  },
  {
    slug: "japan-5-day-itinerary",
    title: "Japan 5 Day Itinerary: The Tight Golden Route",
    seoTitle: "Japan 5 Day Itinerary: Tight Golden Route",
    metaDescription:
      "Five days on Japan's essentials: Tokyo's two faces, one Hakone or Fuji day, a Kyoto day trip by Shinkansen, and what to honestly skip.",
    excerpt:
      "The tight Golden Route: Tokyo's two faces, one mountain day, a Kyoto day trip — and the honest skip list.",
    coverImage: null,
    gradient: "from-red-500 to-teal-600",
    author: YUKI,
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    readTime: "6 min read",
    tags: ["japan", "itinerary", "5 days", "golden route"],
    city: "Tokyo",
    country: "Japan",
    introduction: [
      "Five days is the tightest honest Japan trip: three Tokyo days (the classic arc), one Hakone or Fuji day, and a Kyoto day-trip by Shinkansen. It works because the Tokaido corridor is engineered for it — but it demands discipline and an honest skip list.",
      "Budget: Tokyo ~$120/day, Kyoto ~$140, Hakone's onsen day ~$110 — call it $620 excluding flights. The Kyoto day-trip costs about ¥28,000 of Shinkansen; the alternative is skipping Kyoto entirely.",
    ],
    sections: [
      {
        heading: "The Shape: Tokyo Base, Two Excursions",
        paragraphs: [
          "One Tokyo hotel for the whole trip. Days 1–2 run the east–west core. Day 3 goes to Hakone's ropeway and onsen (or Kawaguchiko's Fuji views). Day 4 is the Kyoto day trip — Fushimi Inari at 9:30, Kiyomizu by afternoon, the last Shinkansen back. Day 5 is Tsukiji, Ginza and the airport.",
        ],
      },
      {
        heading: "The Honest Skip List",
        paragraphs: [
          "Osaka, Nara, Hiroshima, the ryokan overnight, and any second Kyoto day. Five days is Tokyo plus a taste — the 7-day Golden Route is where the route opens up, and the 10-day is where it breathes.",
        ],
      },
      {
        heading: "The Kyoto Day-Trip Discipline",
        paragraphs: [
          "Take the 7:30 Shinkansen. Fushimi Inari's lower trails by 9:30, Kiyomizu-dera by 14:00, Gion's lanes at 16:30, the 19:30 train back. It's a real Kyoto taste — not a Kyoto visit. Know the difference and enjoy it anyway.",
        ],
      },
    ],
    itinerary: {
      heading: "The 5-Day Shape",
      intro: "Tokyo core (1–2), Hakone (3), Kyoto day trip (4), departure (5).",
      days: [
        {
          day: 1,
          theme: "Tokyo — Old East",
          description: "Senso-ji at dusk, early dinner, jet-lag dawn ahead.",
        },
        {
          day: 2,
          theme: "Tokyo — Modern West",
          description: "Meiji, Harajuku, Shibuya at dusk, Shinjuku neon.",
        },
        {
          day: 3,
          theme: "Hakone or Fuji Day",
          description: "The ropeway and onsen loop, or Kawaguchiko's lake views.",
        },
        {
          day: 4,
          theme: "Kyoto Day Trip",
          description: "First Shinkansen out, Fushimi Inari, Kiyomizu, Gion, last train back.",
        },
        {
          day: 5,
          theme: "Tsukiji & Departure",
          description: "Market breakfast, Ginza stroll, airport.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Rail math",
        items: [
          "Point-to-point tickets beat any pass at five days.",
          "Book the Kyoto day-trip Shinkansen seats ahead in peak seasons.",
        ],
      },
      {
        heading: "Budget",
        items: [
          "About $620 for five days at planning figures, excluding flights.",
          "The Kyoto day trip adds ~¥28,000 of Shinkansen — the trip's biggest decision.",
        ],
      },
    ],
    faq: [
      {
        question: "Is 5 days enough for Japan?",
        answer:
          "For Tokyo plus a Kyoto taste and one mountain day — yes, barely. The 7-day Golden Route is the comfortable version.",
      },
      {
        question: "Should I do a Kyoto day trip or skip Kyoto?",
        answer:
          "If Kyoto is why you're coming, the day trip justifies itself. If not, spend the day in Tokyo's neighborhoods and plan the Kyoto week properly.",
      },
      {
        question: "How much does 5 days in Japan cost?",
        answer: "About $620 excluding flights at planning figures, including the Kyoto Shinkansen.",
      },
    ],
    relatedDestinationSlugs: ["tokyo", "kyoto", "osaka"],
    relatedTripSlugs: ["japan-5d-highlights", "japan-7d-golden-route", "tokyo-kyoto-5d"],
    relatedGuideSlugs: ["japan-7-day-itinerary", "japan-travel-budget", "japan-rail-travel-guide", "best-time-to-visit-japan", "japan-first-time-guide"],
    planner: {
      destination: "Tokyo",
      travelStyle: "cultural",
      interests: ["history", "food"],
      label: "Build the tight Golden Route",
    },
  },
  {
    slug: "japan-14-day-itinerary",
    title: "Japan 14 Day Itinerary: The Full Arc",
    seoTitle: "Japan 14 Day Itinerary: The Full Arc",
    metaDescription:
      "Fourteen days across Japan: the Golden Route plus Kanazawa, Hiroshima, Miyajima, Nara and an onsen night — one-way, no backtracking.",
    excerpt:
      "The full arc: the Golden Route, Kanazawa's gardens, Hiroshima and Miyajima, Nara's deer — one way, no backtracking.",
    coverImage: null,
    gradient: "from-purple-600 to-red-600",
    author: YUKI,
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    readTime: "8 min read",
    tags: ["japan", "itinerary", "14 days", "grand tour"],
    city: "Tokyo",
    country: "Japan",
    introduction: [
      "Fourteen days is Japan's full arc, run one-way with no backtracking: Tokyo (4 nights), Hakone ryokan (1), Kyoto (3), Nara (day trip), Kanazawa (2), Hiroshima and Miyajima (2), Osaka (1–2). It's the trip that finally includes everything the week-trippers regret missing.",
      "Budget at planning figures — Tokyo ~$120/day, Kyoto ~$140, Kanazawa ~$100, Hiroshima ~$95: call it $1,650 excluding flights, including one ryokan splurge night.",
    ],
    sections: [
      {
        heading: "The One-Way Discipline",
        paragraphs: [
          "Fly into Tokyo, out of Osaka (or reverse). Every leg moves west: the Hakone ryokan, Kyoto's three nights, the shinkansen to Kanazawa's preserved streets (a spectacular alpine-route detour east), then back down to Hiroshima's peace park and Miyajima's torii, finishing in Osaka's neon. Rail passes finally approach break-even at this length — price it.",
        ],
      },
      {
        heading: "What the Extra Days Buy",
        paragraphs: [
          "Kanazawa is the addition that surprises people — Kenrokuen is Japan's garden art at its peak, and the preserved samurai and geisha districts come without Kyoto's crowds. The second Kyoto day lets you add Arashiyama properly. And Nara's bowing deer get their own unhurried half-day instead of a rushed detour.",
        ],
      },
      {
        heading: "The Pace Rules",
        paragraphs: [
          "Two-night minimums everywhere except the ryokan and Osaka. One transfer day = a half-day. One empty afternoon per city. Pack one bag, ship it forward. These four rules turn fourteen days from a march into a journey.",
        ],
      },
    ],
    itinerary: {
      heading: "The Full Arc, Day by Day",
      intro: "Tokyo (1–4), Hakone (5), Kyoto (6–8), Kanazawa (9–10), Hiroshima & Miyajima (11–12), Osaka (13–14).",
      days: [
        {
          day: 1,
          theme: "Tokyo — Arrive East",
          description: "Asakusa at dusk, early night, jet-lag dawn ahead.",
        },
        {
          day: 2,
          theme: "Tokyo — Modern West",
          description: "Meiji, Harajuku, Shibuya, Shinjuku's neon.",
        },
        {
          day: 3,
          theme: "Tokyo — Center",
          description: "Tsukiji breakfast, Ginza, bayside or museums.",
        },
        {
          day: 4,
          theme: "Tokyo — Neighborhoods or Kamakura",
          description: "Shimokitazawa and Nakameguro — or the coastal day trip.",
        },
        {
          day: 5,
          theme: "Hakone — Ryokan Night",
          description: "The Hakone loop, kaiseki dinner, dawn onsen with Fuji.",
        },
        {
          day: 6,
          theme: "Kyoto — Higashiyama",
          description: "Shinkansen west; Yasaka to Kiyomizu at golden hour.",
        },
        {
          day: 7,
          theme: "Kyoto — Torii & Bamboo",
          description: "Fushimi Inari at dawn, Arashiyama by late morning.",
        },
        {
          day: 8,
          theme: "Kyoto — Nara Day Trip",
          description: "Todai-ji's Great Buddha and the bowing deer, back by dinner.",
        },
        {
          day: 9,
          theme: "To Kanazawa",
          description: "The thunderbird express north; Omicho Market's seafood bowls.",
        },
        {
          day: 10,
          theme: "Kanazawa — Gardens & Districts",
          description: "Kenrokuen at opening, samurai lanes, gold-leaf ateliers.",
        },
        {
          day: 11,
          theme: "Hiroshima",
          description: "Shinkansen west; the Peace Memorial Park's afternoon.",
        },
        {
          day: 12,
          theme: "Miyajima & Osaka",
          description: "The floating torii at high tide; on to Dotonbori.",
        },
        {
          day: 13,
          theme: "Osaka",
          description: "Osaka Castle, Kuromon Market, kushikatsu in Shinsekai.",
        },
        {
          day: 14,
          theme: "Departure",
          description: "Kansai airport — via the best airport noodles on earth.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Rail & passes",
        items: [
          "At fourteen days with Hiroshima, price the nationwide JR Pass against point-to-point — the gap nearly closes.",
          "Reserve peak-season shinkansen seats ahead; the Kanazawa leg uses limited expresses.",
        ],
      },
      {
        heading: "Budget",
        items: [
          "About $1,650 for fourteen days at planning figures, excluding flights.",
          "One ryokan night is the splurge; Hiroshima hotels cost half of Tokyo's.",
        ],
      },
    ],
    faq: [
      {
        question: "Is 14 days the right length for Japan?",
        answer:
          "It's the full-arc length — every regret the week-trippers mention (Kanazawa, Hiroshima, Nara unhurried) gets its day. Longer starts adding regions; shorter starts cutting the classics.",
      },
      {
        question: "Does the JR Pass pay off at 14 days?",
        answer: "It approaches break-even with Hiroshima included — price both and compare honestly.",
      },
      {
        question: "How much does 14 days in Japan cost?",
        answer: "About $1,650 excluding flights at planning figures, including the ryokan splurge.",
      },
    ],
    relatedDestinationSlugs: ["tokyo", "kyoto", "osaka"],
    relatedTripSlugs: ["japan-14d-grand", "japan-10d-classic", "japan-7d-golden-route"],
    relatedGuideSlugs: ["japan-10-day-itinerary", "japan-7-day-itinerary", "japan-travel-budget", "japan-rail-travel-guide", "japan-first-time-guide"],
    planner: {
      destination: "Tokyo",
      travelStyle: "cultural",
      interests: ["history", "food", "nature"],
      label: "Plan the full Japan arc",
    },
  },
  {
    slug: "europe-5-day-itinerary",
    title: "Europe 5 Day Itinerary: One City, Done Deep",
    seoTitle: "Europe 5 Day Itinerary: One City Deep",
    metaDescription:
      "Five days in Europe: one city done deep — Paris, Rome or London — with a day trip, the second-tier museums and the neighborhoods.",
    excerpt:
      "Five days is one European city done deep — not three done badly. Pick Paris, Rome or London and let the day trip breathe.",
    coverImage: null,
    gradient: "from-blue-600 to-rose-500",
    author: SOFIA,
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    readTime: "6 min read",
    tags: ["europe", "itinerary", "5 days", "city break"],
    city: "Paris",
    country: "France",
    introduction: [
      "Five days is the first length where a European city trip can breathe — and the wrong move is spending it on three cities. The right move is one city done deep: the classic core, the second-tier museums, one day trip, and the neighborhoods.",
      "Budget at our planning figures — Paris ~€150/day, Rome ~€130, London ~£180 — and let the city choice follow your temperament. This guide shows the shape with Paris; the arc translates.",
    ],
    sections: [
      {
        heading: "Days 1–3: The Classic Core",
        paragraphs: [
          "The proven arc, compressed or unhurried by temperament: islands-and-Louvre, Montmartre-and-Marais, the grand axis. Every day walkable, every evening reserved.",
        ],
      },
      {
        heading: "Day 4: The Day Trip",
        paragraphs: [
          "Versailles from Paris, Ostia or Florence-teaser from Rome, Bath or Cambridge from London. One full excursion, booked ahead, done properly — not a rushed half.",
        ],
      },
      {
        heading: "Day 5: The Neighborhoods",
        paragraphs: [
          "Canal Saint-Martin and the passages; Trastevere and Testaccio; Notting Hill and Hampstead. The day that makes people move here — cheap, slow, and the reason five days beats three.",
        ],
      },
    ],
    itinerary: {
      heading: "The 5-Day Shape (Paris shown)",
      intro: "Core (1–3), day trip (4), neighborhoods (5).",
      days: [
        {
          day: 1,
          theme: "Islands & the Louvre",
          description: "First-entry Louvre, Sainte-Chapelle, the Latin Quarter, Saint-Germain dinner.",
        },
        {
          day: 2,
          theme: "Montmartre & the Marais",
          description: "Sacré-Cœur early, the butte's lanes, Place des Vosges, Marais dinner.",
        },
        {
          day: 3,
          theme: "The Grand Axis",
          description: "Tuileries to Trocadéro, Eiffel at golden hour.",
        },
        {
          day: 4,
          theme: "Versailles Day Trip",
          description: "First RER out, the palace, the gardens, the rowboats.",
        },
        {
          day: 5,
          theme: "Neighborhood Paris",
          description: "Canal Saint-Martin, the covered passages, the marché streets.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Choosing the city",
        items: [
          "Paris for beauty and food ritual; Rome for ancient wow; London for museums and ease.",
          "One city, one hotel, one day trip — the five-day formula.",
        ],
      },
      {
        heading: "Budget",
        items: [
          "€650–750 for five days in Paris or Rome; ~£900 in London, excluding flights.",
          "The day trip is the only intercity cost.",
        ],
      },
    ],
    faq: [
      {
        question: "One city or two for 5 days in Europe?",
        answer:
          "One, done deep — the two-city split needs six days minimum (see our 7-day itinerary). Five days split is five days compromised.",
      },
      {
        question: "Which city for a first Europe trip?",
        answer: "Paris for beauty and food, London for ease, Rome for wow — all three hold the 5-day shape.",
      },
      {
        question: "How much does 5 days in Europe cost?",
        answer: "About €650–750 in Paris or Rome at planning figures, excluding flights.",
      },
    ],
    relatedDestinationSlugs: ["paris", "rome", "london"],
    relatedTripSlugs: ["europe-7d-first-timer", "paris-3d-classic", "rome-3d-classics"],
    relatedGuideSlugs: ["europe-7-day-itinerary", "europe-10-day-itinerary", "best-european-cities-first-time", "europe-first-time-guide", "paris-vs-london"],
    planner: {
      destination: "Paris",
      travelStyle: "cultural",
      interests: ["museums", "food"],
      label: "Plan your 5-day Europe trip",
    },
  },
  {
    slug: "italy-10-day-itinerary",
    title: "Italy 10 Day Itinerary: The Full Boot",
    seoTitle: "Italy 10 Day Itinerary: The Full Boot",
    metaDescription:
      "Ten days down Italy: Venice, Florence and Rome by rail, then the Amalfi Coast by ferry — the full arc at a humane pace.",
    excerpt:
      "The full boot: Venice, Florence, Rome and the Amalfi Coast in ten days — rail north to south, no backtracking.",
    coverImage: null,
    gradient: "from-emerald-600 to-orange-600",
    author: SOFIA,
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    readTime: "7 min read",
    tags: ["italy", "itinerary", "10 days", "amalfi"],
    city: "Rome",
    country: "Italy",
    introduction: [
      "Ten days is the full Italian arc: Venice's canals (2 nights), Florence and Tuscany (3), Rome (3), the Amalfi Coast (2) — run north to south with no backtracking, trains for the cities and a ferry-and-bus finale on the coast.",
      "Budget at planning figures — Venice ~€150/day, Florence ~€130, Rome ~€130, Amalfi ~€160: call it €1,400 excluding flights. Open-jaw into Venice and out of Naples is the routing that makes it work.",
    ],
    sections: [
      {
        heading: "The One-Way Boot",
        paragraphs: [
          "Fly into Venice (VCE), out of Naples (NAP). The Frecciarossa legs run two hours or less; the Rome-to-Salerno leg hands you to the coast ferries. No leg repeats, no city gets less than two nights, and the scenery improves with every transfer.",
        ],
      },
      {
        heading: "The Amalfi Finale",
        paragraphs: [
          "Base in Sorrento or Praiano, not Positano (prices without the quiet). The Path of the Gods, Ravello's gardens, and the Capri boat day fill two days. September and early October are the connoisseur's window — warm seas, open hotels, thinner roads.",
        ],
      },
      {
        heading: "The Skip List",
        paragraphs: [
          "Milan, Cinque Terre, Sicily, Bologna — all real, all skippable at ten days. The boot is long; this arc is the classics plus the coast done well.",
        ],
      },
    ],
    itinerary: {
      heading: "10 Days North to South",
      intro: "Venice (1–2), Florence (3–5), Rome (6–8), Amalfi (9–10).",
      days: [
        {
          day: 1,
          theme: "Venice — Arrival",
          description: "Grand Canal vaporetto at dusk, cicchetti crawl.",
        },
        {
          day: 2,
          theme: "Venice — San Marco & Islands",
          description: "St Mark's early, Murano and Burano's lagoon afternoon.",
        },
        {
          day: 3,
          theme: "Florence — Renaissance",
          description: "Train south; the Duomo's dome, Piazzale Michelangelo sunset.",
        },
        {
          day: 4,
          theme: "Florence — David & Uffizi",
          description: "The Accademia at opening, the Uffizi's Botticellis.",
        },
        {
          day: 5,
          theme: "Tuscany Day",
          description: "Siena or a Chianti wine route with a driver.",
        },
        {
          day: 6,
          theme: "Rome — Ancient Core",
          description: "Train south; Colosseum's late slot, Trastevere dinner.",
        },
        {
          day: 7,
          theme: "Rome — Vatican",
          description: "Vatican early entry, St Peter's, the centro's fountains.",
        },
        {
          day: 8,
          theme: "Rome — Borghese & Piazzas",
          description: "The gallery's timed hour, Navona and Campo at dusk.",
        },
        {
          day: 9,
          theme: "To the Amalfi Coast",
          description: "Train to Salerno, ferry along the cliffs to Positano.",
        },
        {
          day: 10,
          theme: "Path of the Gods & Departure",
          description: "The cliff trail morning, NAP airport by evening.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Rail & booking",
        items: [
          "Book every Frecciarossa leg when you book flights.",
          "Amalfi hotels: book 2–3 months out for May–June and September.",
        ],
      },
      {
        heading: "Budget",
        items: [
          "About €1,400 for ten days at planning figures, excluding flights.",
          "The coast is the premium tier; Rome and Florence are the relief.",
        ],
      },
    ],
    faq: [
      {
        question: "Is 10 days enough for Italy?",
        answer:
          "For the classics plus the Amalfi Coast — yes, paced humanely. Sicily and the north need their own trips.",
      },
      {
        question: "Which direction, north or south first?",
        answer:
          "North to south — the coast finale rewards the order, and open-jaw flights make it free.",
      },
      {
        question: "How much does 10 days in Italy cost?",
        answer: "About €1,400 excluding flights at planning figures, including all rail.",
      },
    ],
    relatedDestinationSlugs: ["venice", "florence", "rome"],
    relatedTripSlugs: ["italy-10d-north-south", "italy-7d-classics"],
    relatedGuideSlugs: ["italy-7-day-itinerary", "italy-14-day-itinerary", "italy-travel-guide", "slow-travel-italy-10-day", "italy-10d-north-south"],
    planner: {
      destination: "Rome",
      travelStyle: "cultural",
      interests: ["history", "food", "beaches"],
      label: "Plan the full Italian boot",
    },
  },
];

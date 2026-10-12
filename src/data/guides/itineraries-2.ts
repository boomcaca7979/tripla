import type { Guide } from "../guides";

// Destination itinerary guides, batch 2 — second-tier cities and the new
// destination coverage (Taipei, Lisbon, Budapest, Bali). Budget figures stay
// consistent with src/data/destinations.ts budgetPerDay values.

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

export const ITINERARIES_2_GUIDES: Guide[] = [
  // ── 1. London 3 Day Itinerary ─────────────────────────────────────────
  {
    slug: "london-3-day-itinerary",
    title: "London 3 Day Itinerary: Museums, Markets and the River",
    seoTitle: "London 3 Day Itinerary: Museums & Markets",
    metaDescription:
      "A walkable 3 day London itinerary: Westminster and the museums, the Tower and Borough Market, Notting Hill and a day-trip option — with Oyster and budget notes.",
    excerpt:
      "Three days of London grouped by riverbank and neighborhood — the museums, the markets, and the evening pubs that make the plan work.",
    coverImage: null,
    gradient: "from-blue-700 to-red-600",
    author: MARCUS,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "9 min read",
    tags: ["london", "itinerary", "uk", "3 days"],
    city: "London",
    country: "United Kingdom",
    introduction: [
      "London's scale punishes checklists and rewards grouping: its world-class museums cluster in South Kensington, its ancient core hugs the Tower, and its villages — Notting Hill, Hampstead, Shoreditch — each deserve a half-day. Three days gives you the grand essentials plus one village, if you keep every day on one side of the river.",
      "The pubs are not optional. London's evening culture is the reward for walking 20,000 steps, and each day below ends at one worth the detour. At our planning estimate of about £180 a day, three days runs roughly £540 excluding flights.",
    ],
    sections: [
      {
        heading: "Museums Are Free — Use That",
        paragraphs: [
          "The British Museum, National Gallery, Tate Modern, Natural History Museum and V&A charge nothing at the door. That changes the strategy: no museum needs a full day, and a two-hour focused visit (pick one wing) beats a six-hour death march. Pop in for an hour between other things — London is the rare city where that's a great idea.",
        ],
      },
      {
        heading: "The River Is the Spine",
        paragraphs: [
          "Walk it. Westminster to the Tower along the South Bank is forty minutes of theatre-queue-free sightseeing past the Eye, Tate Modern, Shakespeare's Globe and St Paul's across the water. Every day in this itinerary touches the Thames — it's how London stays navigable in your head.",
        ],
      },
      {
        heading: "The Day-Trip Fork",
        paragraphs: [
          "Day three is either a village day in Notting Hill, Hampstead and Camden, or a rail day trip — Bath, Cambridge, and Windsor all sit under an hour away. Do the village version if it's your first visit and the weather is doubtful; the day trip if you've seen the essentials or the sun is out.",
        ],
      },
    ],
    itinerary: {
      heading: "Your 3 Days in London",
      intro: "Westminster and museums first, the ancient city second, villages or a day trip third.",
      days: [
        {
          day: 1,
          theme: "Westminster & the River",
          description:
            "Westminster Abbey at opening, the Parliament square, walk the South Bank past the Eye to the National Gallery for an afternoon hour, Trafalgar Square, and a pub dinner in Covent Garden.",
        },
        {
          day: 2,
          theme: "Ancient City & Markets",
          description:
            "Tower of London first slot (the Crown Jewels before 10am), Borough Market lunch, Tate Modern or St Paul's through the afternoon, and the Tower riverside walk back. Sunday roast or a City pub for dinner.",
        },
        {
          day: 3,
          theme: "Villages or Day Trip",
          description:
            "Notting Hill's Portobello Road and colored terraces, Hampstead Heath's skyline view from Parliament Hill, Camden's canals — or the Bath/Cambridge rail day. Farewell: a West End show or a properly old pub.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Getting around",
        items: [
          "Tap a contactless card at every gate — the daily fare cap means you never need a pass.",
          "The Tube map deceives: central London is walkable, and the walks above beat the Underground.",
          "Black cabs are honest and pricey; buses are slow but scenic along the river.",
        ],
      },
      {
        heading: "Money",
        items: [
          "About £180/day mid-range — the free museums are the great budget gift.",
          "Pub meals (£12–16) and market lunches keep food costs sane; Sunday roast is the splurge that's worth it.",
          "Book the Tower and Westminster Abbey online for timed entry and a small discount.",
        ],
      },
    ],
    faq: [
      {
        question: "Is 3 days enough for London?",
        answer:
          "For the essentials, yes — Westminster, one or two free museums, the Tower, Borough Market and a village day. You'll leave a list, which is London's way of guaranteeing a return visit.",
      },
      {
        question: "Which museums should I pick in 3 days?",
        answer:
          "The British Museum for world history, the National Gallery for paintings, the Tate Modern for modern art and the view — and remember you can do each in two hours for free.",
      },
      {
        question: "How much does 3 days in London cost?",
        answer:
          "About £540 mid-range excluding flights at our £180/day planning estimate — with free museums, pub meals and contactless fare caps doing the trimming.",
      },
    ],
    relatedDestinationSlugs: ["london", "paris", "edinburgh"],
    relatedTripSlugs: ["london-3d-classic", "london-5d-deep", "london-cultural"],
    relatedGuideSlugs: ["how-many-days-in-london", "london-travel-budget", "best-areas-to-stay-in-london", "london-on-foot-guide-2026", "paris-vs-london"],
    planner: {
      destination: "London",
      travelStyle: "cultural",
      interests: ["museums", "history", "food"],
      label: "Generate your London itinerary",
    },
  },

  // ── 2. Rome 3 Day Itinerary ───────────────────────────────────────────
  {
    slug: "rome-3-day-itinerary",
    title: "Rome 3 Day Itinerary: The Ancient Core, the Vatican, and Trastevere",
    seoTitle: "Rome 3 Day Itinerary: Ancient to Trastevere",
    metaDescription:
      "A 3 day Rome itinerary: Colosseum and Forum, Vatican Museums and St Peter's, plus fountains, piazzas and Trastevere dinners — timed to beat queues and heat.",
    excerpt:
      "Three days of Rome in the right order: ancient Rome first, the Vatican early, and every evening in Trastevere's lanes. Queue-timing included.",
    coverImage: null,
    gradient: "from-amber-500 to-orange-700",
    author: SOFIA,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "9 min read",
    tags: ["rome", "itinerary", "italy", "3 days"],
    city: "Rome",
    country: "Italy",
    introduction: [
      "Rome in three days works if you respect two forces: the queues and the sun. The Colosseum and Vatican Museums both sell timed entries that sell out days ahead; the Roman afternoon bothers everyone from June to September. This plan books the big two in advance, does them early, and saves the fountains, piazzas and Trastevere dinners for the golden hours.",
      "At our planning estimate of about €130 a day, three days runs roughly €390 excluding flights — and Rome's trattorias make that budget feel luxurious.",
    ],
    sections: [
      {
        heading: "Book the Big Two, Then Stop Booking",
        paragraphs: [
          "Colosseum + Forum combined tickets and Vatican Museums entries are the only reservations that matter. Everything else — the Pantheon, Trevi Fountain, Piazza Navona, the Spanish Steps — is free and best at dusk or dawn. Don't over-schedule: Rome's joy is the unplanned piazza.",
        ],
      },
      {
        heading: "The Geometry of the Centro Storico",
        paragraphs: [
          "Rome's center is compact and walkable — Pantheon, Navona, Trevi and Campo de' Fiori sit within twenty minutes of each other. The ancient core and the Vatican are the outliers, one to the south, one across the river: they get one day each, everything between them is evening material.",
        ],
      },
      {
        heading: "Eat Roman, Not Tourist Roman",
        paragraphs: [
          "The four pastas — carbonara, cacio e pepe, amatriciana, gricia — are the curriculum, and the test of a trattoria is a short menu and Roman dialect at the next table. Trastevere and Monti are the dinner districts; anything with a photo menu inside the shadow of a monument exists for people who didn't read this.",
        ],
      },
    ],
    itinerary: {
      heading: "Your 3 Days in Rome",
      intro: "Ancient core, Vatican, and a fountain-and-piazzas finale — with heat-aware timing throughout.",
      days: [
        {
          day: 1,
          theme: "Ancient Rome",
          description:
            "Colosseum's first slot, then the Forum and Palatine Hill before the heat peaks. Afternoon siesta, evening walk: Trevi Fountain and the Pantheon at dusk, dinner in Monti or the Centro Storico.",
        },
        {
          day: 2,
          theme: "Vatican & the River",
          description:
            "Vatican Museums' early entry (Sistine Chapel before the crowd river thickens), St Peter's dome climb if booked, lunch in Prati, and an afternoon crossing Ponte Sant'Angelo to Castel Sant'Angelo's terraces. Trastevere for dinner — get lost on purpose.",
        },
        {
          day: 3,
          theme: "Fountains, Piazzas & Villas",
          description:
            "Piazza Navona with morning coffee, Campo de' Fiori's market, the Borghese Gallery (book ahead — it's timed and worth it) or Villa Borghese's gardens, and a farewell walk past the Spanish Steps. Last-night carbonara.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Booking & timing",
        items: [
          "Colosseum and Vatican timed entries: book online a week or more ahead in any season.",
          "The Pantheon now charges a small entry fee — buy on arrival or online to skip the line.",
          "Dress code at St Peter's: covered shoulders and knees, enforced.",
        ],
      },
      {
        heading: "Heat & money",
        items: [
          "About €130/day mid-range; trattoria dinners for two run €40–60 with wine.",
          "Fountains refill bottles for free — carry one from June to September.",
          "Taxis are flat-fare from Fiumicino into the center (€55); the Leonardo Express train is the backup.",
        ],
      },
    ],
    faq: [
      {
        question: "Is 3 days enough for Rome?",
        answer:
          "Yes for the essential city: ancient Rome, the Vatican, and the centro storico's fountains and piazzas. A fourth day adds Ostia Antica, Appian Way, or a Florence leg — see our Italy itineraries.",
      },
      {
        question: "Colosseum or Vatican first?",
        answer:
          "Both early, on different days. Ancient Rome handles heat better (shade in the Forum's valleys); the Vatican rewards the earliest entry slot before the galleries clog by 10:30.",
      },
      {
        question: "How much does 3 days in Rome cost?",
        answer:
          "About €390 mid-range excluding flights at our €130/day planning estimate — trattorias, fountains and free piazzas make Rome the best value of Europe's big three.",
      },
    ],
    relatedDestinationSlugs: ["rome", "florence", "venice"],
    relatedTripSlugs: ["rome-3d-classics", "rome-eternal-city", "rome-food-3d"],
    relatedGuideSlugs: ["how-many-days-in-rome", "rome-vs-paris", "rome-food-guide", "best-time-to-visit-rome", "italy-7-day-itinerary"],
    planner: {
      destination: "Rome",
      travelStyle: "cultural",
      interests: ["history", "food", "museums"],
      label: "Generate your Rome itinerary",
    },
  },

  // ── 3. Barcelona 3 Day Itinerary ──────────────────────────────────────
  {
    slug: "barcelona-3-day-itinerary",
    title: "Barcelona 3 Day Itinerary: Gaudí, Gothic Lanes and Beach Evenings",
    seoTitle: "Barcelona 3 Day Itinerary: Gaudí to Beach",
    metaDescription:
      "A 3 day Barcelona itinerary: Sagrada Família and Gaudí's park, the Gothic Quarter and La Boqueria, and Montjuïc or the beach — with ticket-timing notes.",
    excerpt:
      "Three days between Gaudí's fever dreams and the Gothic Quarter's shadow — with the Sagrada Família ticket rule every first-timer learns too late.",
    coverImage: null,
    gradient: "from-red-500 to-yellow-500",
    author: SOFIA,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "8 min read",
    tags: ["barcelona", "itinerary", "spain", "3 days"],
    city: "Barcelona",
    country: "Spain",
    introduction: [
      "Barcelona in three days balances two cities: Gaudí's, where stone melts and towers grow like termite mounds, and the medieval one, where Gothic lanes open onto squares of espresso and old men playing cards. Add the beach and a hill, and you have the complete first visit.",
      "The one booking rule: Sagrada Família sells out. It's the most-visited monument in Spain and the timed-entry system means walk-ups get the 4pm slot or nothing. Book it first, then build the days around it. At our planning estimate of about €120 a day, three days runs roughly €360 excluding flights.",
    ],
    sections: [
      {
        heading: "The Gaudí Ticket Problem",
        paragraphs: [
          "Sagrada Família, Park Güell and Casa Batlló or La Pedrera all use timed entries, and all reward early booking. The efficient pattern: Sagrada Família early on day one (the east-facing stained glass burns blue-gold in the morning), Park Güell's monument zone at its first slot on day two, and one modernist house — Batlló's roof dragon or Pedrera's attic — whenever the queue slot fits.",
        ],
      },
      {
        heading: "The Gothic Quarter Is Free",
        paragraphs: [
          "The Barri Gòtic costs nothing and deserves hours: the cathedral's geese, Plaça Reial's palms, the lanes where the medieval city plan survives. Pair it with La Boqueria market (go at 9am before it's a photo set), El Born's boutiques, and Santa Maria del Mar's austere perfection.",
        ],
      },
      {
        heading: "Barcelona Is a Beach City",
        paragraphs: [
          "Evenings belong to the sea: Barceloneta's boardwalk at sunset, fresh seafood where the fishing quarter used to be, and the truth that this Mediterranean metropolis relaxes after dark — dinner at 9:30 is not a pose, it's the climate speaking. Montjuïc's cable car and magic-fountain shows are the alternative evening.",
        ],
      },
    ],
    itinerary: {
      heading: "Your 3 Days in Barcelona",
      intro: "Gaudí's masterworks first, the medieval city second, hill-and-beach third.",
      days: [
        {
          day: 1,
          theme: "Sagrada Família & Modernisme",
          description:
            "Sagrada Família's morning slot (book weeks out), then Passeig de Gràcia's modernist block — Casa Batlló or La Pedrera — and tapas crawls in Gràcia's squares.",
        },
        {
          day: 2,
          theme: "Park Güell & the Gothic City",
          description:
            "Park Güell's first-entry slot and mosaic dragon, then down to La Boqueria, the cathedral, and a Barri Gòtic wander ending in El Born. Catalán dinner or pintxos.",
        },
        {
          day: 3,
          theme: "Montjuïc or Beach Day",
          description:
            "Montjuïc cable car, castle views and Fundació Joan Miró — or a beach morning, Barceloneta lunch, and the magic fountain's evening show. Farewell: vermouth hour, which is a Barcelona institution.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Booking & transit",
        items: [
          "Sagrada Família and Park Güell: book online 1–3 weeks out; the T-casual transit card covers ten Metro rides.",
          "The Metro is fast and safe; the hop-on buses are for rivers, not this city.",
          "Watch bags in the Gothic Quarter and on La Rambla — pickpocket capital of Europe, but violent crime is rare.",
        ],
      },
      {
        heading: "Money & meals",
        items: [
          "About €120/day mid-range; menú del día lunches at €12–15 are the deal of the city.",
          "Tapas are small and priced accordingly — order progressively, move bars.",
          "Dinner starts at 9pm; kitchens that open at 7 are telling you something.",
        ],
      },
    ],
    faq: [
      {
        question: "Is 3 days enough for Barcelona?",
        answer:
          "Yes — Gaudí's big three, the Gothic Quarter, and a hill or beach day fit comfortably. A fourth day usually means Montserrat's serrated mountains or Sitges by train.",
      },
      {
        question: "Do I need to book Sagrada Família in advance?",
        answer:
          "Yes — it's the single most important booking in Barcelona. Timed-entry slots sell out days or weeks ahead; the tower elevator upgrade is worth it if any remain.",
      },
      {
        question: "How much does 3 days in Barcelona cost?",
        answer:
          "About €360 mid-range excluding flights at our €120/day planning estimate, plus roughly €26–36 each for Sagrada Família and Park Güell entries.",
      },
    ],
    relatedDestinationSlugs: ["barcelona", "madrid", "seville"],
    relatedTripSlugs: ["barcelona-3d-gaudi", "barcelona-art-architecture", "barcelona-food-3d"],
    relatedGuideSlugs: ["barcelona-food-guide", "paris-vs-london", "best-european-cities-first-time", "europe-7-day-itinerary", "f1-madrid-2026-travel-guide"],
    planner: {
      destination: "Barcelona",
      travelStyle: "cultural",
      interests: ["food", "history", "beaches"],
      label: "Generate your Barcelona itinerary",
    },
  },

  // ── 4. Bangkok 3 Day Itinerary ────────────────────────────────────────
  {
    slug: "bangkok-3-day-itinerary",
    title: "Bangkok 3 Day Itinerary: Temples, Markets and the Chao Phraya",
    seoTitle: "Bangkok 3 Day Itinerary: Temples & Markets",
    metaDescription:
      "A 3 day Bangkok itinerary: the Grand Palace and riverside temples, chatuchak and the night markets, and a Thonburi canal day — with heat and BTS logistics.",
    excerpt:
      "Three days of Bangkok arranged around the heat and the river: golden temples early, markets late, and the canal-side Bangkok tourists skip.",
    coverImage: null,
    gradient: "from-amber-500 to-purple-700",
    author: PRIYA,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "8 min read",
    tags: ["bangkok", "itinerary", "thailand", "3 days"],
    city: "Bangkok",
    country: "Thailand",
    introduction: [
      "Bangkok rewards early risers and punishes midday planners: the golden temples are cool and luminous at 8:30 and infernos by 1pm. This itinerary does temples at opening, hides in malls and museums through the heat, and surfaces for markets and rooftop evenings — the rhythm locals already live by.",
      "The Chao Phraya river is the city's spine and the BTS Skytrain its nervous system; both appear daily in this plan. At our planning estimate of about $50 a day, three days runs under $150 excluding flights — one of the world's great budget capitals.",
    ],
    sections: [
      {
        heading: "The Temple Mornings",
        paragraphs: [
          "Wat Phra Kaew and the Grand Palace open at 8:30 — be there, in covered shoulders and knees, before the tour coaches. Wat Pho's reclining Buddha and Wat Arun's porcelain spires complete the trio; the cross-river ferry to Wat Arun costs pennies and delivers the best view in the city at sunset.",
        ],
      },
      {
        heading: "Markets Are the Real Museums",
        paragraphs: [
          "Chatuchak Weekend Market covers 15,000 stalls (weekends only — plan around it); Or Tor Kor next door sells the fruit that makes Bangkok worth flying for. Evenings: the Ratchada night market's neon wheel, Yaowarat's street-food blaze in Chinatown, or Asiatique's riverside calmer version.",
        ],
      },
      {
        heading: "The Canal Bangkok",
        paragraphs: [
          "Half of Bangkok's charm lives on the khlongs — the Thonburi canals behind Wat Arun where wooden houses stand on stilts and longtail boats cost a few hundred baht an hour. It's the antidote to the mall-city impression, and it fits any afternoon.",
        ],
      },
    ],
    itinerary: {
      heading: "Your 3 Days in Bangkok",
      intro: "Riverside temples first, market city second, canals and rooftops third.",
      days: [
        {
          day: 1,
          theme: "Grand Palace & Riverside",
          description:
            "Grand Palace and Wat Phra Kaew at 8:30, Wat Pho's reclining Buddha, ferry across to Wat Arun for sunset, Yaowarat street-food dinner in Chinatown.",
        },
        {
          day: 2,
          theme: "Market Day",
          description:
            "Chatuchak and Or Tor Kor if it's a weekend (museums or Jim Thompson House if not), air-con afternoon, then Ratchada or a rooftop bar for the evening skyline.",
        },
        {
          day: 3,
          theme: "Canals & Farewell",
          description:
            "Longtail boat through the Thonburi canals, Wat Arun in morning light if you saved it, a massage (this is the city for it), and a Chao Phraya riverside farewell dinner.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Getting around",
        items: [
          "BTS Skytrain and MRT cover the modern city; grab a Rabbit or contactless-friendly pass.",
          "Boats on the Chao Phraya are the scenic option — the orange-flag tourist boat beats the ferries for coverage.",
          "Use ride-hail (Grab) for taxis; insist on the meter otherwise.",
        ],
      },
      {
        heading: "Heat & money",
        items: [
          "About $50/day mid-range; street-food meals at $1–3 and massages at $10 keep it easy.",
          "November to February is the cool season; April scorches and the monsoon soaks June–October.",
          "Cover shoulders and knees at all temples; scarves solve everything.",
        ],
      },
    ],
    faq: [
      {
        question: "Is 3 days enough for Bangkok?",
        answer:
          "For the temples, markets and canals, yes. A fourth day usually adds Ayutthaya's ruins by train or a floating-market morning — or just more of the food, which is the real reason people return.",
      },
      {
        question: "When should I visit Chatuchak Market?",
        answer:
          "Saturday or Sunday morning — most of its 15,000 stalls open only on weekends. Arrive by 10am to beat the heat and the crowds.",
      },
      {
        question: "How much does 3 days in Bangkok cost?",
        answer:
          "Under $150 excluding flights at our $50/day planning estimate — street food, ferries and guesthouse-to-boutique range make Bangkok Southeast Asia's great value capital.",
      },
    ],
    relatedDestinationSlugs: ["bangkok", "singapore", "kuala-lumpur"],
    relatedTripSlugs: ["bangkok-3d-temples-markets", "bangkok-nightlife", "bangkok-food-3d"],
    relatedGuideSlugs: ["how-many-days-in-bangkok", "bangkok-night-markets-guide-2026", "where-to-travel-november-2026", "seoul-vs-tokyo", "bali-travel-budget"],
    planner: {
      destination: "Bangkok",
      travelStyle: "foodie",
      interests: ["food", "history", "shopping"],
      label: "Generate your Bangkok itinerary",
    },
  },

  // ── 5. Kyoto 2 Day Itinerary ──────────────────────────────────────────
  {
    slug: "kyoto-2-day-itinerary",
    title: "Kyoto 2 Day Itinerary: Dawn Torii, Bamboo and Higashiyama Evenings",
    seoTitle: "Kyoto 2 Day Itinerary: Dawn Torii & Bamboo",
    metaDescription:
      "A 2 day Kyoto itinerary built on early starts: Fushimi Inari at dawn, Arashiyama's bamboo, Higashiyama's temple lanes and the geisha district at dusk.",
    excerpt:
      "Two days in Japan's old capital done in the right order — the dawn starts that beat the crowds, and the evenings that make Kyoto Kyoto.",
    coverImage: null,
    gradient: "from-orange-500 to-red-600",
    author: YUKI,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "7 min read",
    tags: ["kyoto", "itinerary", "japan", "2 days"],
    city: "Kyoto",
    country: "Japan",
    introduction: [
      "Kyoto in two days is a scheduling problem with one solution: start absurdly early. The city's great sights — Fushimi Inari's torii tunnel, Arashiyama's bamboo grove, Kiyomizu-dera's wooden stage — all transform between 7 and 9am, from photo scrums into what they were built to be. Sleep in and you'll see the crowds, not the city.",
      "Two days covers the east-and-south temple circuit plus Arashiyama if you accept the dawn starts. At our planning estimate of about $140 a day, the trip runs roughly $280 excluding hotels in peak seasons — when, honestly, the real cost is booking a room months out.",
    ],
    sections: [
      {
        heading: "The Dawn Doctrine",
        paragraphs: [
          "Fushimi Inari is open 24 hours and empty at 7am — the torii tunnel, yours. Arashiyama's bamboo grove is a corridor of echo-quiet green before 8. Kiyomizu-dera opens at 6 in high season. Every hour before 9 in Kyoto is worth three after it; the itinerary below is built on that exchange rate.",
        ],
      },
      {
        heading: "East First, West Second",
        paragraphs: [
          "Day one is the east-side cluster: Higashiyama's preserved lanes from Yasaka Shrine up to Kiyomizu-dera, then Gion at dusk — where luck, timing and a quiet street can produce the city's famous glimpse of a geiko or maiko hurrying to an appointment. Day two crosses to Arashiyama early, then fills the afternoon with Nishiki Market or the Philosopher's Path.",
        ],
      },
      {
        heading: "What Two Days Skips",
        paragraphs: [
          "Kinkaku-ji's golden pavilion, Nijo Castle, and the northern temples — plus Nara, which deserves its own half or full day (our Japan 10-day itinerary slots it in). Two days is the minimum for Kyoto's essence; three is where depth begins.",
        ],
      },
    ],
    itinerary: {
      heading: "Your 2 Days in Kyoto",
      intro: "Eastern temple lanes first, Arashiyama at dawn second. Everything else negotiates with these anchors.",
      days: [
        {
          day: 1,
          theme: "Higashiyama & Gion",
          description:
            "Kiyomizu-dera at opening, the Sannenzaka and Ninenzaka lanes down through Yasaka Shrine, lunch in the Gion backstreets, Kennin-ji or a craft shop afternoon, and Gion's lantern streets after dark.",
        },
        {
          day: 2,
          theme: "Arashiyama Dawn & Market Afternoon",
          description:
            "Bamboo grove before 8am, Tenryu-ji's garden and the Katsura riverbank, Togetsukyo Bridge, then back east for Nishiki Market's food stalls or the Philosopher's Path in season. Farewell kaiseki or a standing bar near the station.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Getting around",
        items: [
          "Buses cover the temple clusters but clog in season — the subway + walking is often faster.",
          "Rent bikes for the Arashiyama and Philosopher's Path days; Kyoto is flat.",
          "Coin lockers at Kyoto Station solve the luggage-transfer problem between cities.",
        ],
      },
      {
        heading: "Season notes",
        items: [
          "Late March–early April (sakura) and mid–late November (foliage) are sublime and crowded — book rooms 3–6 months out.",
          "Summer is humid but the dawn strategy doubles as heat avoidance.",
          "Many temples close by 5pm; plan evenings for streets and food, not gates.",
        ],
      },
    ],
    faq: [
      {
        question: "Is 2 days enough for Kyoto?",
        answer:
          "For the essence — Fushimi Inari, Arashiyama, Higashiyama and Gion — yes, with dawn starts. Three days adds the golden pavilion, Nijo Castle and real depth; our how-many-days-in-Kyoto guide runs the options.",
      },
      {
        question: "When should I visit Fushimi Inari?",
        answer:
          "Before 8am — the shrine is open 24 hours, and the 10,000 torii gates are empty and magical at dawn. By 10am the lower tunnels are a slow-moving photo queue.",
      },
      {
        question: "How much does 2 days in Kyoto cost?",
        answer:
          "About $280 excluding hotels at our $140/day planning estimate — but in sakura and foliage seasons, hotel scarcity is the real budget line. Book early or stay in Osaka.",
      },
    ],
    relatedDestinationSlugs: ["kyoto", "osaka", "tokyo"],
    relatedTripSlugs: ["kyoto-2d-temples", "kyoto-autumn-2026", "tokyo-kyoto-osaka-7d"],
    relatedGuideSlugs: ["how-many-days-in-kyoto", "kyoto-vs-osaka", "is-kyoto-expensive", "best-area-to-stay-in-kyoto", "kyoto-autumn-travel-2026"],
    planner: {
      destination: "Kyoto",
      travelStyle: "cultural",
      interests: ["history", "food", "nature"],
      label: "Build your Kyoto plan with AI",
    },
  },

  // ── 6. Taipei 3 Day Itinerary ─────────────────────────────────────────
  {
    slug: "taipei-3-day-itinerary",
    title: "Taipei 3 Day Itinerary: Night Markets, Hot Springs and the 101",
    seoTitle: "Taipei 3 Day Itinerary: Markets & Springs",
    metaDescription:
      "A 3 day Taipei itinerary: night markets and temples, Beitou hot springs and the National Palace Museum, plus Elephant Mountain's skyline view — MRT-first pacing.",
    excerpt:
      "Three days of Taipei built around the MRT and the night markets — hot springs, museum treasures, and the sunset hike every photographer pretends isn't a hike.",
    coverImage: null,
    gradient: "from-cyan-500 to-indigo-700",
    author: PRIYA,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "8 min read",
    tags: ["taipei", "itinerary", "taiwan", "3 days"],
    city: "Taipei",
    country: "Taiwan",
    introduction: [
      "Taipei is the easiest great food city in Asia: night markets with queue-managed stalls, an MRT that works in English, hot springs thirty minutes from downtown, and a price tag that still starts conversations with delight. Three days covers the classics with room for one soak and one museum marathon.",
      "At our planning estimate of about $90 a day, the trip runs roughly $270 excluding flights — and the food alone justifies the airfare.",
    ],
    sections: [
      {
        heading: "The Night-Market Curriculum",
        paragraphs: [
          "Shilin is the biggest, Raohe is the best lit (the covered lane glows at dusk), and Ningxia is the food-first local pick. The curriculum: stinky tofu (try it), oyster omelets, pepper buns from the charcoal oven, bubble tea at its source, and whatever queue is longest — Taipei queues are honest ratings.",
        ],
      },
      {
        heading: "Hot Springs and Museum Days",
        paragraphs: [
          "Beitou's hot-spring district is a 30-minute MRT ride: public baths, a hot-spring museum, and day-use private rooms at spa hotels for the shy. The National Palace Museum holds the Chinese imperial collection — do it in one focused two-hour visit (jade cabbage, bronzes, calligraphy) and spend the afternoon in the artist district of Dadaocheng instead.",
        ],
      },
      {
        heading: "The View from Elephant Mountain",
        paragraphs: [
          "The famous Taipei 101 skyline shot comes from a twenty-minute staircase up Elephant Mountain — go ninety minutes before sunset, bring water, and stake out the Six Giant Rocks platform. It's the best free thing to do in the city and pairs perfectly with a night-market dinner afterward.",
        ],
      },
    ],
    itinerary: {
      heading: "Your 3 Days in Taipei",
      intro: "Temples and markets first, springs and museums second, heights and old streets third.",
      days: [
        {
          day: 1,
          theme: "Temples & First Night Market",
          description:
            "Longshan Temple's morning incense, Bopiliao's preserved lanes, a Dadaocheng afternoon on the riverside, and Raohe night market for dinner when its arch lights up.",
        },
        {
          day: 2,
          theme: "Beitou Springs & Palace Museum",
          description:
            "MRT to Beitou: thermal valley, hot-spring museum, a morning or afternoon soak. National Palace Museum for a focused two hours, then Shilin's mega-market for dinner.",
        },
        {
          day: 3,
          theme: "101, Elephant Mountain & Maokong",
          description:
            "Taipei 101's observatory or its basement food court, Elephant Mountain climb for sunset, then the Maokong Gondola over tea hills for a teahouse evening — or Ningxia market if the legs refuse.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Getting around",
        items: [
          "Buy an EasyCard on arrival — MRT, buses, and convenience stores, one tap.",
          "The MRT is spotless, signed in English, and covers everything in this plan.",
          "YouBike bike-share solves the last mile; the app takes foreign cards.",
        ],
      },
      {
        heading: "Money & timing",
        items: [
          "About $90/day mid-range; night-market dinners run $5–10 per person, gloriously.",
          "October–November is the sweet spot; typhoon season roughs up July–September.",
          "Cash still rules at market stalls — ATMs are everywhere.",
        ],
      },
    ],
    faq: [
      {
        question: "Is 3 days enough for Taipei?",
        answer:
          "Yes — the temples, one night market per evening, Beitou's springs and the Elephant Mountain view fit comfortably. A fourth day adds Jiufen's lantern-lit hillside or Yangmingshan's volcanic trails.",
      },
      {
        question: "Which night market should I choose?",
        answer:
          "Shilin for scale, Raohe for atmosphere (and the pepper buns), Ningxia for pure food focus. You can realistically do one per evening across three days.",
      },
      {
        question: "How much does 3 days in Taipei cost?",
        answer:
          "About $270 excluding flights at our $90/day planning estimate — one of the best food-per-dollar ratios in Asia.",
      },
    ],
    relatedDestinationSlugs: ["taipei", "hong-kong", "tokyo"],
    relatedTripSlugs: ["taipei-3d-night-markets", "hongkong-shopping-foodie", "hong-kong-3d-highlights"],
    relatedGuideSlugs: ["hong-kong-48-hours", "hong-kong-food-guide", "seoul-3-day-itinerary", "singapore-3-day-itinerary", "best-time-to-visit-japan"],
    planner: {
      destination: "Taipei",
      travelStyle: "foodie",
      interests: ["food", "shopping", "nature"],
      label: "Generate your Taipei itinerary",
    },
  },

  // ── 7. Lisbon 3 Day Itinerary ─────────────────────────────────────────
  {
    slug: "lisbon-3-day-itinerary",
    title: "Lisbon 3 Day Itinerary: Alfama's Lanes, Belém's Tarts and the Miradouros",
    seoTitle: "Lisbon 3 Day Itinerary: Alfama to Belém",
    metaDescription:
      "A 3 day Lisbon itinerary: Alfama and the castle, Belém's monastery and custard tarts, plus the viewpoints and fado nights that make Lisbon Lisbon.",
    excerpt:
      "Three days across Lisbon's hills — castle lanes, monastery mornings, tram rides, and the sunset miradouro circuit — at Western Europe's friendliest price.",
    coverImage: null,
    gradient: "from-yellow-500 to-blue-600",
    author: SOFIA,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "8 min read",
    tags: ["lisbon", "itinerary", "portugal", "3 days"],
    city: "Lisbon",
    country: "Portugal",
    introduction: [
      "Lisbon's itinerary writes itself around its hills: each neighborhood is a ridge, each ridge ends at a miradouro with a view and a drink. Three days covers Alfama's laundry-strung lanes, Belém's monastery and the original custard tarts, and the Baixa–Chiado core — with a fado night somewhere in the middle.",
      "At our planning estimate of about €130 a day, three days runs roughly €390 excluding flights — the best value among Western Europe's capitals, and the best November weather north of Andalusia.",
    ],
    sections: [
      {
        heading: "The Hill Logic",
        paragraphs: [
          "Alfama climbs from the Tagus to São Jorge Castle and rewards the walk with laundry lines, fado seeping from doorways and miradouros at every bend. Ride Tram 28 once for the experience (dawn or after 9pm to dodge pickpockets and crowds), then walk — the tram is a photo op, not transport.",
        ],
      },
      {
        heading: "Belém and the Original Pastéis",
        paragraphs: [
          "The riverside Belém district holds the Jerónimos Monastery's lacework stone and Belém Tower, but the pilgrimage is to Pastéis de Belém, baking the original custard tarts since 1837 — eat them warm, dust them with cinnamon, and note the difference. The 15E tram or an early train gets you there before the queue coils.",
        ],
      },
      {
        heading: "Fado, Azulejos and the Miradouro Circuit",
        paragraphs: [
          "One evening belongs to fado — Alfama's taverns or Bairro Alto's rooms, booked or early. The azulejo (tile) museum explains the city's ceramic soul. And the miradouros — Graça, Santa Luzia, São Pedro de Alcântara — are the nightly ritual: a drink, a view, and the 25 de Abril bridge glowing.",
        ],
      },
    ],
    itinerary: {
      heading: "Your 3 Days in Lisbon",
      intro: "Castle hill first, Belém second, the Baixa core and a Sintra teaser third.",
      days: [
        {
          day: 1,
          theme: "Alfama & the Castle",
          description:
            "São Jorge Castle at opening, down through Alfama's lanes and miradouros, lunch on grilled sardines, azulejo museum or Sé cathedral, fado dinner in the neighborhood where it was born.",
        },
        {
          day: 2,
          theme: "Belém Riverside",
          description:
            "Warm custard tarts at opening, Jerónimos Monastery's cloisters, Belém Tower, and the MAAT riverside walk. Back to town for Chiado's bookshop (Livraria Bertrand, the world's oldest) and a Bairro Alto night.",
        },
        {
          day: 3,
          theme: "Baixa, LX Factory & Farewell",
          description:
            "Baixa's grid and Praça do Comércio, Elevador de Santa Justa's view, LX Factory's bookshop-under-bridge, and Time Out Market's grazing dinner. Sintra calls — see below.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Getting around",
        items: [
          "Buy a Viva Viagem card and zapp rides on Metro, trams and the Santa Justa elevator.",
          "The hills are real — comfortable shoes outrank any itinerary advice.",
          "Sintra is 40 minutes by train; it deserves its own day if you can add one.",
        ],
      },
      {
        heading: "Money",
        items: [
          "About €130/day mid-range; petiscos dinners and €1 coffee culture keep it humane.",
          "Pastéis de nata count as a food group — budget calories accordingly.",
          "April–June and September–October are ideal; November is mild and quiet.",
        ],
      },
    ],
    faq: [
      {
        question: "Is 3 days enough for Lisbon?",
        answer:
          "For the city proper, yes — Alfama, Belém and the core. Sintra's palaces deserve a fourth day (or a very early start), and Cascais makes a fifth if the beach calls.",
      },
      {
        question: "Should I ride Tram 28?",
        answer:
          "Once, at dawn or late evening — it's a charming photo op and a notorious pickpocket line. For actual transport, the Metro and your feet are better.",
      },
      {
        question: "How much does 3 days in Lisbon cost?",
        answer:
          "About €390 excluding flights at our €130/day planning estimate — the friendliest price tag among Western Europe's capital cities.",
      },
    ],
    relatedDestinationSlugs: ["lisbon", "barcelona", "madrid"],
    relatedTripSlugs: ["lisbon-3d-hills", "barcelona-3d-gaudi", "europe-7d-first-timer"],
    relatedGuideSlugs: ["best-european-cities-first-time", "europe-7-day-itinerary", "paris-vs-london", "barcelona-food-guide", "europe-10-day-itinerary"],
    planner: {
      destination: "Lisbon",
      travelStyle: "cultural",
      interests: ["food", "history", "museums"],
      label: "Generate your Lisbon itinerary",
    },
  },

  // ── 8. Budapest 3 Day Itinerary ───────────────────────────────────────
  {
    slug: "budapest-3-day-itinerary",
    title: "Budapest 3 Day Itinerary: Thermal Baths, Ruin Bars and Both Riverbanks",
    seoTitle: "Budapest 3 Day Itinerary: Baths to Ruin Bars",
    metaDescription:
      "A 3 day Budapest itinerary: Buda Castle and Fisherman's Bastion, the Széchenyi baths, Parliament at riverbank, and the ruin bars of the Jewish Quarter.",
    excerpt:
      "Three days on the Danube: castle-district mornings, thermal-bath afternoons, and the ruin-bar nights that made Budapest famous.",
    coverImage: null,
    gradient: "from-emerald-600 to-amber-600",
    author: SOFIA,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "8 min read",
    tags: ["budapest", "itinerary", "hungary", "3 days"],
    city: "Budapest",
    country: "Hungary",
    introduction: [
      "Budapest's three-day itinerary has three pillars and everyone knows them: the thermal baths, the ruin bars, and the Danube views from both banks. The pleasure is in the order — castle mornings when the light is right, baths when your legs surrender, and the Jewish Quarter's courtyard bars once the lamps come on.",
      "At our planning estimate of about €80 a day, three days runs roughly €240 excluding flights — Central Europe's best-value big city, with a food scene that has quietly outgrown its goulash reputation.",
    ],
    sections: [
      {
        heading: "The Bath Doctrine",
        paragraphs: [
          "Széchenyi is the postcard — vast outdoor pools steaming in winter snow — while Rudas offers an Ottoman dome and night bathing, and Gellért trades hype for interiors. Book timed tickets online, bring your own towel and flip-flops, and know that swim caps are required in some lap pools (available there). Winter bathing in steam is the signature experience.",
        ],
      },
      {
        heading: "Buda Looks, Pest Lives",
        paragraphs: [
          "The castle district — Fisherman's Bastion's fairytale terraces, Matthias Church's tiled roof — is a half-day of views. Pest is where the trip happens: the Jewish Quarter's ruin bars (Szimpla Kert is the original, go before 8pm), the Great Market Hall's lángos, Andrássy Avenue's cafés, and Parliament's riverside profile, best from Batthyány Square at sunset.",
        ],
      },
      {
        heading: "Danube Logistics",
        paragraphs: [
          "One hour on the water — a daytime sightseeing cruise or the cheap public ferry — gives you the parliament, bridges and castle from the angle the city was designed for. Evening: the Chain Bridge walk at dusk, and the free perspectives from both banks beat most paid lookouts.",
        ],
      },
    ],
    itinerary: {
      heading: "Your 3 Days in Budapest",
      intro: "Buda's views first, baths and markets second, the ruin-bar quarter third.",
      days: [
        {
          day: 1,
          theme: "Buda Castle & the River",
          description:
            "Fisherman's Bastion early, Matthias Church, castle-lanes walk down to the Chain Bridge, riverside ferry or cruise hour, and Parliament lit from Batthyány Square at dusk.",
        },
        {
          day: 2,
          theme: "Baths & Markets",
          description:
            "Széchenyi's steaming pools (morning slots are quieter), lunch and lángos at the Great Market Hall, Andrássy Avenue's café hour, and an early Szimpla Kert before the night multiplies.",
        },
        {
          day: 3,
          theme: "Jewish Quarter & Farewell",
          description:
            "Dohány Street Synagogue and the moving Weeping Willow memorial, Gozsdu Courtyard's lunch options, Central Café's ornate cakes, and a Danube-bank farewell walk past the Shoes on the Danube memorial.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Getting around",
        items: [
          "Budapest's Metro, trams and the M2 red line cover everything; single tickets or a 72-hour pass.",
          "Tram 2 along the Danube is officially scenic — ride it end to end once.",
          "The airport bus 100E links to the center in 35 minutes for a flat fare.",
        ],
      },
      {
        heading: "Money",
        items: [
          "About €80/day mid-range — baths €25–35, ruin-bar drinks €3–5, dinner with wine for two under €40.",
          "Cards work everywhere; get forints from bank ATMs, not the Euronet ones.",
          "April–June and September–October are ideal; December adds Advent markets, summer adds heat.",
        ],
      },
    ],
    faq: [
      {
        question: "Is 3 days enough for Budapest?",
        answer:
          "Yes — both riverbanks, one or two baths, the Jewish Quarter and the ruin bars fit comfortably. A fourth day adds Margaret Island, Memento Park, or a Danube-bend trip to Szentendre.",
      },
      {
        question: "Which thermal bath should I pick?",
        answer:
          "Széchenyi for the iconic outdoor pools (and winter steam), Rudas for the Ottoman dome and night sessions, Gellért for Art Nouveau interiors with fewer tourists.",
      },
      {
        question: "How much does 3 days in Budapest cost?",
        answer:
          "About €240 excluding flights at our €80/day planning estimate — the best value among Europe's major capitals.",
      },
    ],
    relatedDestinationSlugs: ["budapest", "vienna", "prague"],
    relatedTripSlugs: ["budapest-3d-baths", "vienna-christmas-markets-2026", "prague-fairy-tale"],
    relatedGuideSlugs: ["how-many-days-in-vienna", "is-vienna-expensive", "best-christmas-markets-germany-2026", "europe-10-day-itinerary", "best-european-cities-first-time"],
    planner: {
      destination: "Budapest",
      travelStyle: "cultural",
      interests: ["history", "food", "nightlife"],
      label: "Generate your Budapest itinerary",
    },
  },

  // ── 9. Bali 5 Day Itinerary ───────────────────────────────────────────
  {
    slug: "bali-5-day-itinerary",
    title: "Bali 5 Day Itinerary: Ubud's Rice Terraces and the Southern Beaches",
    seoTitle: "Bali 5 Day Itinerary: Ubud to Beaches",
    metaDescription:
      "A 5 day Bali itinerary: Ubud's rice terraces, temples and waterfalls, then Seminyak or Uluwatu's beach clubs and sunsets — with realistic drive-time math.",
    excerpt:
      "Five days split between Ubud's green interior and the southern coast — temples, terraces, waterfalls, and the sunset that makes the flight worth it.",
    coverImage: null,
    gradient: "from-green-500 to-teal-700",
    author: PRIYA,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "9 min read",
    tags: ["bali", "itinerary", "indonesia", "5 days"],
    city: "Bali",
    country: "Indonesia",
    introduction: [
      "Bali's five-day mistake is staying in one place — usually a traffic-worn southern beach — and day-tripping everywhere. The island works better split in two: two or three nights in Ubud for the rice terraces, temples and jungle air, then two or three nights on the coast (Seminyak for sunset bars, Uluwatu for cliffs, Sanur for calm) for the beach finale.",
      "Respect the drive times: '20 kilometers' can mean 90 minutes in Bali's traffic, so this plan groups each day's stops geographically. At our planning estimate of about $70 a day, five days runs roughly $350 excluding flights — villas and drivers included.",
    ],
    sections: [
      {
        heading: "Ubud Days: Terraces, Temples, Waterfalls",
        paragraphs: [
          "The Tegallalang rice terraces photograph best at 7am (go before the tour vans), Tirta Empul's spring-water purification is an active ceremony — dress modestly and follow the line — and the Campuhan Ridge Walk at golden hour costs nothing. Sacred Monkey Forest is fun if you secure sunglasses and phones; Tibumana or Tegenungan waterfalls cool the afternoon.",
        ],
      },
      {
        heading: "The Coast Days: Which Beach Is Yours",
        paragraphs: [
          "Seminyak and Canggu mean beach clubs, surf lessons and sunset cocktails; Uluwatu means cliff temples, the kecak fire dance at dusk, and padang-padang's cove; Nusa Dua and Sanur mean calm water and families. Pick one and anchor there — hopping coasts wastes hours you'll want back.",
        ],
      },
      {
        heading: "The Day-Trip Dilemma: Nusa Penida",
        paragraphs: [
          "The Kelingking Beach cliffs of Nusa Penida are Bali's most famous photo and a full-day commitment: fast boat, bruising roads, an early start. With five days total it's a judgment call — do it only if the beach days shrink to one. Our Bali first-timers guide covers the tradeoffs.",
        ],
      },
    ],
    itinerary: {
      heading: "Your 5 Days in Bali",
      intro: "Ubud base for the green days, southern coast for the blue ones. One driver day, one temple day, and a beach finale.",
      days: [
        {
          day: 1,
          theme: "Arrive & Ubud Settle",
          description:
            "Airport to Ubud (90 minutes without traffic — land early if you can), Campuhan Ridge golden-hour walk, and dinner on Jalan Raya's restaurant row.",
        },
        {
          day: 2,
          theme: "Terraces & Temples",
          description:
            "Tegallalang terraces at 7am, Tirta Empul's spring ceremony mid-morning, Gunung Kawi's river-valley shrines, and a spit-roasted babi guling lunch if you eat pork.",
        },
        {
          day: 3,
          theme: "Waterfalls & Monkey Forest",
          description:
            "Tibumana or Tegenungan waterfall swim, Monkey Forest's macaques (straps on everything), Ubud palace and market, and a Legong dance evening.",
        },
        {
          day: 4,
          theme: "Transfer South & Sunset Coast",
          description:
            "Morning drive to the coast (Uluwatu: cliff temple and the 6pm kecak fire dance; Seminyak: beach club afternoon), sunset cocktails, seafood on the sand at Jimbaran.",
        },
        {
          day: 5,
          theme: "Beach Day & Farewell",
          description:
            "Surf lesson or pool-and-massage morning, last nasi campur lunch, airport with a suitcase of kopiko and arak. Late flights out of DPS are the norm — use the day.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Getting around",
        items: [
          "Hire a private driver by the day (€40–60) for the temple days; Gojek/Grab handles short hops.",
          "Scooters are the local way but demand competence, a license and insurance honesty.",
          "Traffic is the planning variable: leave before 8am, never promise a 9am flight.",
        ],
      },
      {
        heading: "Money & etiquette",
        items: [
          "About $70/day mid-range; villa pools and drivers are cheaper than you fear.",
          "Cash rules at warungs and stalls; cards work at hotels and beach clubs.",
          "Temples need a sarong (usually rentable at the gate) and covered shoulders.",
        ],
      },
    ],
    faq: [
      {
        question: "Is 5 days enough for Bali?",
        answer:
          "For the Ubud-plus-coast essence, yes. Seven days adds Nusa Penida or the northern lakes; five days should not try to add both coasts and the far east.",
      },
      {
        question: "Ubud or the beach for my base?",
        answer:
          "Split it — two or three nights each. Ubud alone means no beach; the south alone means traffic between every sight. The transfer costs half a day and buys you both Balis.",
      },
      {
        question: "How much does 5 days in Bali cost?",
        answer:
          "About $350 excluding flights at our $70/day planning estimate, including a private driver day — villas, warungs and sunset bars all stay remarkably affordable.",
      },
    ],
    relatedDestinationSlugs: ["bali", "singapore", "kuala-lumpur"],
    relatedTripSlugs: ["bali-5d-island", "bali-island-escape", "bali-honeymoon-7d"],
    relatedGuideSlugs: ["bali-first-timers-guide", "bali-travel-budget", "is-bali-expensive", "singapore-3-day-itinerary", "hong-kong-48-hours"],
    planner: {
      destination: "Bali",
      travelStyle: "relaxed",
      interests: ["beaches", "nature", "food"],
      label: "Generate your Bali itinerary",
    },
  },
  // ── 10. Italy 7 Day Itinerary ─────────────────────────────────────────
  {
    slug: "italy-7-day-itinerary",
    title: "Italy 7 Day Itinerary: Rome, Florence and Venice Without the Rush",
    seoTitle: "Italy 7 Day Itinerary: The Classic Three",
    metaDescription:
      "The classic 7 day Italy itinerary — Rome's ancient core, Florence's Renaissance, Venice's canals — with Frecciarossa logistics and per-day budgets.",
    excerpt:
      "Rome, Florence, Venice in one week: the classic Italy triangle paced by train times, with the two-night minimums that keep it humane.",
    coverImage: null,
    gradient: "from-green-600 to-red-600",
    author: SOFIA,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "9 min read",
    tags: ["italy", "itinerary", "7 days", "rome", "florence", "venice"],
    city: "Rome",
    country: "Italy",
    introduction: [
      "Seven days is exactly enough for Italy's classic triangle — Rome, Florence, Venice — if you respect the rail math and the two-night minimum. The Frecciarossa high-speed trains make the legs short (Rome–Florence 1.5 hours, Florence–Venice 2), which is why this route works when a five-city scramble wouldn't.",
      "The budget at our planning figures: Rome ~€130/day, Florence ~€130/day, Venice ~€150/day — call it €800 for the week excluding flights. The Venice premium is real; the Florence relief is equally real.",
    ],
    sections: [
      {
        heading: "The Triangle Logic",
        paragraphs: [
          "Fly into Rome (FCO), out of Venice (VCE) — open-jaw tickets eliminate backtracking. Three nights Rome covers the ancient core and the Vatican; two Florence covers the Renaissance essentials plus one Tuscan half-day; two Venice covers San Marco and the lagoon islands. Every hotel change is a short train ride, not a travel day.",
        ],
        bullets: [
          "Nights 1–3: Rome — ancient core day, Vatican day, fountain-and-piazzas day.",
          "Nights 4–5: Florence — Duomo and Uffizi, then a Tuscan afternoon (Fiesole, or Chianti if you book a driver).",
          "Nights 6–7: Venice — San Marco and the back canals, then Murano and Burano before the flight.",
        ],
      },
      {
        heading: "Train Logistics That Matter",
        paragraphs: [
          "Book Frecciarossa and Italo fares when you book flights — the early-bird Rome–Florence fare is €20–30 versus €50+ walk-up. Stations are central in all three cities (Roma Termini, Firenze SMN, Venezia Santa Lucia), so hotel-to-hotel transfers are 15-minute walks, not airport odysseys. Venice's Santa Lucia station is inside the lagoon city itself.",
        ],
      },
      {
        heading: "What Seven Days Skips",
        paragraphs: [
          "The Amalfi Coast, Milan, Cinque Terre, and a second Tuscan day (Siena, San Gimignano). Italy rewards depth: the triangle done well beats the boot raced across. Ten days adds the south — our 10-day Italy trip outline and the slow-travel alternative cover that version.",
        ],
      },
    ],
    itinerary: {
      heading: "7 Days Through the Triangle",
      intro: "Rome 3 → Florence 2 → Venice 2. One-way rail throughout; fly home from Venice.",
      days: [
        {
          day: 1,
          theme: "Rome — ancient core",
          description: "Colosseum first slot, Forum, Palatine; evening fountains and the Pantheon at dusk.",
        },
        {
          day: 2,
          theme: "Rome — Vatican",
          description: "Vatican Museums early, St Peter's, Trastevere dinner.",
        },
        {
          day: 3,
          theme: "Rome — piazzas & farewell",
          description: "Borghese Gallery or Villa Borghese, Piazza Navona, Campo de' Fiori, last carbonara.",
        },
        {
          day: 4,
          theme: "Florence — Renaissance day",
          description:
            "Morning Frecciarossa, Duomo's dome climb (book the slot), Uffizi's Botticellis, sunset at Piazzale Michelangelo.",
        },
        {
          day: 5,
          theme: "Florence — David & Tuscany",
          description:
            "The Accademia's David at opening, Oltrarno artisan lanes, and an afternoon in Fiesole's hills or a Chianti wine stop.",
        },
        {
          day: 6,
          theme: "Venice — arrival & San Marco",
          description:
            "Two-hour train to Santa Lucia, vaporetto down the Grand Canal, St Mark's at dusk, cicchetti crawl in the back lanes.",
        },
        {
          day: 7,
          theme: "Venice — lagoon islands",
          description: "Murano's furnaces, Burano's painted houses, a last gondola-or-traghetto crossing, airport or extended stay.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Trains & booking",
        items: [
          "Rome–Florence 1h30, Florence–Venice 2h10; book both when you book flights.",
          "Open-jaw flights (into FCO, out of VCE) save the backtracking day.",
          "Venezia Santa Lucia is in the city — no transfer needed on arrival.",
        ],
      },
      {
        heading: "Budget notes",
        items: [
          "Rome ~€130/day, Florence ~€130/day, Venice ~€150/day — about €800 for the week.",
          "Venice hotels are the premium line; Mestre across the bridge halves them at a cost of romance.",
          "Timed entries (Uffizi, Accademia, Borghese) book out days ahead in season.",
        ],
      },
    ],
    faq: [
      {
        question: "Is 7 days enough for Rome, Florence and Venice?",
        answer:
          "Yes — 3+2+2 nights is the proven minimum for the triangle. It skips the Amalfi Coast and the north; ten days adds those or a slower pace.",
      },
      {
        question: "Should I drive in Italy for this trip?",
        answer:
          "No — the triangle is pure high-speed rail, and city centers are ZTL (restricted traffic) zones where foreign drivers collect fines by mail. Trains and feet.",
      },
      {
        question: "How much does a 7-day Italy trip cost?",
        answer:
          "About €900–950 excluding flights at our planning figures — Rome and Florence ~€130/day, Venice ~€150/day, plus €50–70 of high-speed rail.",
      },
    ],
    relatedDestinationSlugs: ["rome", "florence", "venice"],
    relatedTripSlugs: ["italy-7d-classics", "rome-florence-venice-7d", "italy-10d-north-south"],
    relatedGuideSlugs: ["rome-3-day-itinerary", "rome-food-guide", "how-many-days-in-rome", "slow-travel-italy-2026", "europe-7-day-itinerary"],
    planner: {
      destination: "Rome",
      travelStyle: "cultural",
      interests: ["history", "food", "museums"],
      label: "Generate your Italy triangle plan",
    },
  },
];

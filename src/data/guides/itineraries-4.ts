import type { Guide } from "../guides";

// Itinerary guides, batch 4 — the expanded-destination cities (Berlin, Madrid,
// Vienna, Prague…) and the Italian country arcs.

const SOFIA = {
  name: "Sofia Laurent",
  initials: "SL",
  avatarColor: "from-blue-500 to-indigo-600",
  role: "Europe Editor",
};

const YUKI = {
  name: "Yuki Tanaka",
  initials: "YT",
  avatarColor: "from-rose-500 to-red-600",
  role: "Japan Editor",
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

export const ITINERARIES_4_GUIDES: Guide[] = [
  {
    slug: "italy-14-day-itinerary",
    title: "Italy 14 Day Itinerary: The Grand Tour",
    seoTitle: "Italy 14 Day Itinerary: Grand Tour",
    metaDescription:
      "Fourteen days across Italy: Venice, the Dolomites teaser, Florence and Tuscany, Rome, Naples and the Amalfi Coast — the grand tour by rail and ferry.",
    excerpt:
      "The grand tour: Venice to the Amalfi Coast in fourteen days — every classic, two nights minimum, one-way south.",
    coverImage: null,
    gradient: "from-emerald-700 to-amber-600",
    author: SOFIA,
    publishedAt: "2026-09-10",
    updatedAt: "2026-09-10",
    readTime: "9 min read",
    tags: ["italy", "itinerary", "14 days", "grand tour"],
    city: "Rome",
    country: "Italy",
    introduction: [
      "Fourteen days is Italy's grand tour, run one-way: Venice (3), Florence and Tuscany (4), Rome (4), Naples, Pompeii and the Amalfi Coast (3). Every classic gets its day; every transfer is a two-hour train; and the finale is the coast's cliff towns at golden hour.",
      "Budget at planning figures — Venice ~€150/day, Florence ~€130, Rome ~€130, the coast ~€160: call it €1,900 excluding flights. Open-jaw Venice-to-Naples makes the routing free of backtracking.",
    ],
    sections: [
      {
        heading: "The One-Way Discipline",
        paragraphs: [
          "North to south, always. The Frecciarossa legs run under three hours; the Salerno ferry hands you to the coast. Two-night minimums everywhere except one-day stops, and every transfer day is a half-day by design — the rule that keeps fourteen days humane.",
        ],
      },
      {
        heading: "What Fourteen Days Buys",
        paragraphs: [
          "Tuscany gets two days (Siena and the Chianti drivers' route), Rome gets its Borghese and an Ostia day, and the coast gets both the Path of the Gods and the Capri boat. Ten-day travelers choose between these; fourteen-day travelers don't have to.",
        ],
      },
    ],
    itinerary: {
      heading: "The Grand Tour, Day by Day",
      intro: "Venice (1–3), Florence & Tuscany (4–7), Rome (8–11), Naples & Amalfi (12–14).",
      days: [
        { day: 1, theme: "Venice — Arrival", description: "Grand Canal at dusk, cicchetti crawl." },
        { day: 2, theme: "Venice — San Marco & Islands", description: "St Mark's early; Murano and Burano." },
        { day: 3, theme: "Venice — Back Canals", description: "Dorsoduro, Castello, the quiet Venice." },
        { day: 4, theme: "Florence — Renaissance", description: "Train south; the dome, Piazzale sunset." },
        { day: 5, theme: "Florence — David & Uffizi", description: "The Accademia at opening; Uffizi's Botticellis." },
        { day: 6, theme: "Siena Day", description: "The campo, the duomo, the towers." },
        { day: 7, theme: "Chianti Day", description: "Wine route with a driver; slow lunch." },
        { day: 8, theme: "Rome — Ancient Core", description: "Train south; Colosseum, Forum, Trastevere." },
        { day: 9, theme: "Rome — Vatican", description: "Vatican early; the centro's fountains." },
        { day: 10, theme: "Rome — Borghese & Piazzas", description: "The gallery's hour; Navona at dusk." },
        { day: 11, theme: "Rome — Ostia Day", description: "The quiet ruins by train." },
        { day: 12, theme: "Naples & Pompeii", description: "Train south; pizza shrine; Pompeii's streets." },
        { day: 13, theme: "Amalfi Coast", description: "Ferry along the cliffs; Positano and Ravello." },
        { day: 14, theme: "Path of the Gods & Departure", description: "The cliff trail morning; NAP by evening." },
      ],
    },
    practicalInfo: [
      {
        heading: "Rail & booking",
        items: [
          "Book all Frecciarossa legs with the flights; coast hotels 2–3 months out.",
          "The Dolomites and Sicily are the honest skips at fourteen days.",
        ],
      },
      {
        heading: "Budget",
        items: ["About €1,900 for fourteen days at planning figures, excluding flights."],
      },
    ],
    faq: [
      {
        question: "Is 14 days the right length for Italy?",
        answer:
          "It's the grand-tour length — every classic gets a day and the pace stays humane. Sicily and the far north need their own trips.",
      },
      {
        question: "Which direction?",
        answer: "North to south, ending on the coast — the scenery improves with every leg.",
      },
      {
        question: "How much does 14 days in Italy cost?",
        answer: "About €1,900 excluding flights at planning figures, including all rail and ferries.",
      },
    ],
    relatedDestinationSlugs: ["venice", "florence", "rome"],
    relatedTripSlugs: ["italy-10d-north-south", "italy-7d-classics"],
    relatedGuideSlugs: ["italy-10-day-itinerary", "italy-7-day-itinerary", "italy-travel-guide", "slow-travel-italy-10-day", "italy-10d-north-south"],
    planner: {
      destination: "Rome",
      travelStyle: "cultural",
      interests: ["history", "food", "beaches"],
      label: "Plan the Italian grand tour",
    },
  },
  {
    slug: "slow-travel-italy-10-day",
    title: "Northern Italy Itinerary: Milan, the Lakes and the Dolomites",
    seoTitle: "Northern Italy Itinerary: Lakes & Alps",
    metaDescription:
      "A northern Italy route: Milan's design pulse, Lake Como's villas, Verona's arena and the Dolomites' pale peaks — by train and cable car.",
    excerpt:
      "Northern Italy: Milan, Como, Verona and the Dolomites — the Alps-side Italy most itineraries skip.",
    coverImage: null,
    gradient: "from-sky-600 to-emerald-700",
    author: SOFIA,
    publishedAt: "2026-09-10",
    updatedAt: "2026-09-10",
    readTime: "7 min read",
    tags: ["italy", "itinerary", "northern italy", "dolomites"],
    city: "Milan",
    country: "Italy",
    introduction: [
      "Northern Italy is the Alps-side country the classics itineraries skip: Milan's design pulse, Lake Como's villa shores, Verona's Roman arena and Juliet balconies, and the Dolomites' pale towers rising over green meadows. A week by train and cable car.",
      "Budget: Milan ~€130/day, the lakes and mountains similar — call it €130/day blended. June–September opens every pass; winter is the ski season.",
    ],
    sections: [
      {
        heading: "The Route",
        paragraphs: [
          "Milan (2 nights) as the arrival city — the Duomo, the Last Supper booked months out, the Navigli at aperitivo. Como (1–2) by the Milanese's own train. Verona (1) for the arena and the balcony. Then north to the Dolomites (2–3) — Cortina or Val Gardena — for the pale peaks and the rifugio lunches.",
        ],
      },
      {
        heading: "The Dolomites Decision",
        paragraphs: [
          "The pale mountains deserve two nights minimum — the Alpe di Siusi's meadows, the Seceda ridge, and a rifugio lunch at 2,000 meters. Summer hiking or winter skiing; the cable cars run for both.",
        ],
      },
    ],
    itinerary: {
      heading: "The Northern Week",
      intro: "Milan (1–2), Como (3), Verona (4), Dolomites (5–7).",
      days: [
        { day: 1, theme: "Milan — Icons", description: "The Duomo's roof, the Last Supper (booked), Navigli aperitivo." },
        { day: 2, theme: "Milan — Design & Brera", description: "The Pinacoteca, the Quadrilatero's windows." },
        { day: 3, theme: "Lake Como", description: "Train to Varenna; the villas and the ferry triangle." },
        { day: 4, theme: "Verona", description: "The arena, the balcony, the piazzas at dusk." },
        { day: 5, theme: "To the Dolomites", description: "Train and bus to Val Gardena or Cortina." },
        { day: 6, theme: "Dolomites — The Ridges", description: "Seceda or Alpe di Siusi's meadows; rifugio lunch." },
        { day: 7, theme: "Departure via Venice or Milan", description: "The pale peaks in the mirror; the airport." },
      ],
    },
    practicalInfo: [
      {
        heading: "Transit",
        items: [
          "Trains cover Milan–Como–Verona; the Dolomites need buses or a rental.",
          "Book the Last Supper and the mountain hotels weeks ahead.",
        ],
      },
      {
        heading: "Budget",
        items: ["About €900 for a week at planning figures, excluding flights."],
      },
    ],
    faq: [
      {
        question: "Is northern Italy worth skipping the classics for?",
        answer:
          "For mountain people and design lovers — absolutely. It pairs perfectly with a Venice arrival or departure.",
      },
      {
        question: "Como or Garda?",
        answer: "Como for the villas and the Milanese day-trip energy; Garda for the quieter shores.",
      },
      {
        question: "How much does a northern Italy week cost?",
        answer: "About €900 excluding flights at planning figures, plus the Dolomites' lift passes.",
      },
    ],
    relatedDestinationSlugs: ["milan", "venice", "florence"],
    relatedTripSlugs: ["slow-travel-italy-10-day", "italy-7d-classics"],
    relatedGuideSlugs: ["italy-travel-guide", "italy-10-day-itinerary", "northern-italy-itinerary", "italy-10d-north-south", "italy-14-day-itinerary"],
    planner: {
      destination: "Milan",
      travelStyle: "active",
      interests: ["nature", "food"],
      label: "Plan the northern route",
    },
  },
  {
    slug: "italy-10d-north-south",
    title: "Southern Italy Itinerary: Naples, Puglia and the South",
    seoTitle: "Southern Italy Itinerary: Naples to Puglia",
    metaDescription:
      "A southern Italy route: Naples' pizza and chaos, Pompeii's streets, Matera's cave city and Puglia's trulli towns — the Mezzogiorno by train.",
    excerpt:
      "The Mezzogiorno: Naples, Pompeii, Matera's cave city and Puglia's trulli — southern Italy on its own terms.",
    coverImage: null,
    gradient: "from-orange-600 to-emerald-600",
    author: SOFIA,
    publishedAt: "2026-09-10",
    updatedAt: "2026-09-10",
    readTime: "7 min read",
    tags: ["italy", "itinerary", "southern italy", "puglia"],
    city: "Naples",
    country: "Italy",
    introduction: [
      "Southern Italy — the Mezzogiorno — is the country's rawer, warmer, cheaper half: Naples' pizza chaos, Pompeii's frozen streets, Matera's cave city carved from stone, and Puglia's trulli cones and whitewash. A week or ten days by train, at half the Amalfi's prices and twice its character.",
      "Budget: Naples ~€95/day, Puglia ~€90 — call it €95/day blended. May–June and September–October are ideal; July–August is hot and local.",
    ],
    sections: [
      {
        heading: "The Route",
        paragraphs: [
          "Naples (2 nights) — the pizza shrines and the archaeology museum. Pompeii or Herculaneum as the day trip. Then the long train across to Matera (2) — the cave city of the Basilicata borderlands. Finish in Puglia (3): Bari's old town, Alberobello's trulli, Ostuni's white hill, Lecce's baroque.",
        ],
      },
      {
        heading: "Why Skip the Amalfi (This Trip)",
        paragraphs: [
          "The coast is glorious and priced accordingly. The south done on its own terms — Naples, Matera, Puglia — costs half as much and feeds twice as well. Save the cliffs for the classics trip; this is the connoisseur's Mezzogiorno.",
        ],
      },
    ],
    itinerary: {
      heading: "The Southern Week",
      intro: "Naples (1–2), Matera (3–4), Puglia (5–7).",
      days: [
        { day: 1, theme: "Naples — Pizza & Chaos", description: "Both pizza shrines; the Spanish Quarter at dusk." },
        { day: 2, theme: "Pompeii Day", description: "The frozen streets; the museum's originals after." },
        { day: 3, theme: "Train to Matera", description: "The cave city's first sunset from the viewpoint." },
        { day: 4, theme: "Matera — Sassi", description: "The rock churches and the cave dwellings." },
        { day: 5, theme: "To Puglia — Bari", description: "Bari vecchia's orecchiette-making nonnas." },
        { day: 6, theme: "Alberobello & Ostuni", description: "The trulli cones; the white hill town." },
        { day: 7, theme: "Lecce & Departure", description: "The baroque capital; BRI or BDS airport." },
      ],
    },
    practicalInfo: [
      {
        heading: "Transit",
        items: [
          "Naples–Matera needs a bus leg (or a Bari connection); Puglia's towns need regional trains or a car.",
          "Rent a car for the Puglia days — the towns are spread.",
        ],
      },
      {
        heading: "Budget",
        items: ["About €650 for a week at planning figures, excluding flights."],
      },
    ],
    faq: [
      {
        question: "Is southern Italy worth a dedicated trip?",
        answer:
          "For travelers past their first Italy — yes: half the prices, twice the character, and Matera alone justifies the journey.",
      },
      {
        question: "Matera or the Amalfi Coast?",
        answer: "Different trips. Matera for the cave city's gravity; the coast for the cliffs. This itinerary is the Matera one.",
      },
      {
        question: "How much does a southern Italy week cost?",
        answer: "About €650 excluding flights at planning figures — half the Amalfi's tab.",
      },
    ],
    relatedDestinationSlugs: ["naples", "bologna", "rome"],
    relatedTripSlugs: ["naples-3d-pizza-history", "italy-10d-north-south"],
    relatedGuideSlugs: ["italy-travel-guide", "italy-food-guide", "italy-10-day-itinerary", "slow-travel-italy-10-day"],
    planner: {
      destination: "Naples",
      travelStyle: "foodie",
      interests: ["history", "food"],
      label: "Plan the Mezzogiorno route",
    },
  },
  {
    slug: "berlin-3-day-itinerary",
    title: "Berlin 3 Day Itinerary: History, Art and the Long Night",
    seoTitle: "Berlin 3 Day Itinerary",
    metaDescription:
      "Three days in Berlin: the Wall's trace, Museum Island's vaults, Kreuzberg's canals and one proper club night — with cash-and-door-rule logistics.",
    excerpt:
      "Three days of Berlin: the Wall's trace, the museums, Kreuzberg's canals and one honest club night.",
    coverImage: null,
    gradient: "from-slate-600 to-yellow-500",
    author: MARCUS,
    publishedAt: "2026-09-10",
    updatedAt: "2026-09-10",
    readTime: "6 min read",
    tags: ["berlin", "itinerary", "3 days", "germany"],
    city: "Berlin",
    country: "Germany",
    introduction: [
      "Three days covers Berlin's essentials — the Wall's century, Museum Island's vaults, and one Kreuzberg day — if you book the Reichstag dome ahead and respect the club-door rules. Berlin rewards effort and punishes taxis; the U-Bahn and a good pair of shoes are the plan.",
      "At roughly €130 a day, the trip runs about €390 excluding flights. Berlin remains Western Europe's cheapest great capital — cash for the markets and döner, cards for the rest.",
    ],
    sections: [
      {
        heading: "Day One: The Wall Century",
        paragraphs: [
          "Bernauer Straße's memorial and the preserved death strip, the East Side Gallery's painted stretch, and Checkpoint Charlie's touristy museum if you must. Evening: Hackescher Höfe's courtyards and dinner.",
        ],
      },
      {
        heading: "Day Two: Museums & the Dome",
        paragraphs: [
          "The Reichstag dome at its booked slot (free), Museum Island's Pergamon antiquities, and the Humboldt Forum's rebuilt palace. Evening: Kreuzberg's Markthalle Neun and the canal bars.",
        ],
      },
      {
        heading: "Day Three: Kreuzberg, Tempelhof & the Night",
        paragraphs: [
          "Tempelhof's runway-turned-park by bike, Bergmannkiez's cafés, the East Side's flea markets if it's Sunday — and the club night. The door rules: small groups, no photos, speak softly in line. Or skip it: Berlin's bars are legendary without the rope.",
        ],
      },
    ],
    itinerary: {
      heading: "The 3-Day Shape",
      intro: "Wall century (1), museums (2), Kreuzberg and the night (3).",
      days: [
        {
          day: 1,
          theme: "The Wall Century",
          description: "Bernauer Straße, East Side Gallery, Checkpoint Charlie, Hackescher Höfe.",
        },
        {
          day: 2,
          theme: "Museums & the Dome",
          description: "Reichstag dome, Museum Island, Humboldt Forum, Markthalle Neun.",
        },
        {
          day: 3,
          theme: "Kreuzberg & the Night",
          description: "Tempelhof by bike, Bergmannkiez, flea markets, the club or the bars.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Logistics",
        items: [
          "Book the Reichstag dome online days ahead — it's free.",
          "Carry cash: markets, döner stands and many bars.",
        ],
      },
      {
        heading: "Money",
        items: ["About €390 for three days at planning figures, excluding flights."],
      },
    ],
    faq: [
      {
        question: "Is 3 days enough for Berlin?",
        answer:
          "For the Wall century, the museums and one neighborhood immersion — yes. Four adds Tempelhof and Prenzlauer Berg properly.",
      },
      {
        question: "Do I need to book the club?",
        answer:
          "No — Berlin's famous doors are walk-up with attitude rules. Small groups, no photos, sober-ish in line.",
      },
      {
        question: "How much does 3 days in Berlin cost?",
        answer: "About €390 excluding flights at our €130/day planning estimate.",
      },
    ],
    relatedDestinationSlugs: ["berlin", "munich", "prague"],
    relatedTripSlugs: ["berlin-3d-weekend", "berlin-4d-history-culture", "germany-7d-berlin-munich"],
    relatedGuideSlugs: ["germany-travel-guide", "berlin-3-day-itinerary", "europe-by-train-guide", "best-european-cities-first-time"],
    planner: {
      destination: "Berlin",
      travelStyle: "cultural",
      interests: ["history", "nightlife"],
      label: "Build your Berlin plan",
    },
  },
  {
    slug: "madrid-3-day-itinerary",
    title: "Madrid 3 Day Itinerary: Art, Tapas and the Late Night",
    seoTitle: "Madrid 3 Day Itinerary",
    metaDescription:
      "Three days in Madrid: the Prado and Guernica, Retiro's rowboats, the Royal Palace, and tapas crawls that start at 21:30 — Europe's sunniest capital.",
    excerpt:
      "Three days of Madrid: the art triangle, Retiro's boats, the palace, and the tapas crawls that define the city.",
    coverImage: null,
    gradient: "from-red-500 to-amber-500",
    author: SOFIA,
    publishedAt: "2026-09-10",
    updatedAt: "2026-09-10",
    readTime: "6 min read",
    tags: ["madrid", "itinerary", "3 days", "spain"],
    city: "Madrid",
    country: "Spain",
    introduction: [
      "Three days in Madrid runs on two clocks: the art triangle by day, the tapas crawls by night — the second starting when other cities close. Day one is the Prado and Retiro; day two is the palace and the Reina Sofía's Guernica; day three is Toledo by fast train or the market circuit.",
      "At roughly €120 a day, the trip runs about €360 excluding flights. Madrid is Europe's sunniest big capital — 300 days of terraza weather, and the food priced below Barcelona's.",
    ],
    sections: [
      {
        heading: "Day One: The Prado & Retiro",
        paragraphs: [
          "The Prado's Velázquez and Goya rooms at opening (free in the last two hours if budget-planned), then Retiro's rowboats and the Palacio de Cristal. Evening: La Latina's tapas crawl — casa-botín-adjacent history at every bar.",
        ],
      },
      {
        heading: "Day Two: Palace & Guernica",
        paragraphs: [
          "The Royal Palace's 3,000 rooms, the Mercado de San Miguel's grazing lunch, the Reina Sofía's Guernica in its white room, and Templo de Debod's Egyptian sunset. The Cava Baja tavern route finishes it.",
        ],
      },
      {
        heading: "Day Three: Toledo or the Markets",
        paragraphs: [
          "Toledo's hilltop lanes are 30 minutes by AVE — the cathedral, the El Greco trail, the views. Or stay: El Rastro's Sunday flea market, Malasaña's vintage, and the cocido madrileño lunch that requires an afternoon nap.",
        ],
      },
    ],
    itinerary: {
      heading: "The 3-Day Shape",
      intro: "Prado and Retiro (1), palace and Guernica (2), Toledo or markets (3).",
      days: [
        {
          day: 1,
          theme: "Prado & Retiro",
          description: "The masters at opening, Retiro's boats, La Latina's tapas night.",
        },
        {
          day: 2,
          theme: "Palace & Guernica",
          description: "The Royal Palace, San Miguel grazing, the Reina Sofía, Debod's sunset.",
        },
        {
          day: 3,
          theme: "Toledo or Markets",
          description: "The hilltop city by AVE — or Rastro, Malasaña and cocido.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Logistics",
        items: [
          "Book the Reina Sofía's free slots and Toledo's AVE ahead.",
          "Dinner starts at 21:30 — kitchens that open at 7 are telling you something.",
        ],
      },
      {
        heading: "Money",
        items: ["About €360 for three days at planning figures, excluding flights."],
      },
    ],
    faq: [
      {
        question: "Is 3 days enough for Madrid?",
        answer:
          "For the art triangle, the palace and one excursion — yes. Add a fourth for Segovia or the parks (see our 4-day guide).",
      },
      {
        question: "Toledo or Segovia for the day trip?",
        answer: "Toledo for the layers and El Greco; Segovia for the aqueduct and the Alcázar. Both are 30 minutes by rail.",
      },
      {
        question: "How much does 3 days in Madrid cost?",
        answer: "About €360 excluding flights at our €120/day planning estimate.",
      },
    ],
    relatedDestinationSlugs: ["madrid", "barcelona", "seville"],
    relatedTripSlugs: ["madrid-3d-art-tapas", "madrid-4d-art-parks", "spain-10d-andalusia"],
    relatedGuideSlugs: ["spain-travel-guide", "madrid-3-day-itinerary", "europe-by-train-guide", "barcelona-food-guide"],
    planner: {
      destination: "Madrid",
      travelStyle: "cultural",
      interests: ["museums", "food", "nightlife"],
      label: "Build your Madrid plan",
    },
  },
  {
    slug: "vienna-3-day-itinerary",
    title: "Vienna 3 Day Itinerary: Palaces, Cafés and One Concert",
    seoTitle: "Vienna 3 Day Itinerary",
    metaDescription:
      "Three days in Vienna: Schönbrunn's palace, the Ring's grand buildings, café-hour sachertorte and one concert in the Musikverein's golden hall.",
    excerpt:
      "Three days of Vienna: the palace, the Ring, the cafés, and one concert night in the golden hall.",
    coverImage: null,
    gradient: "from-amber-500 to-purple-700",
    author: SOFIA,
    publishedAt: "2026-09-10",
    updatedAt: "2026-09-10",
    readTime: "6 min read",
    tags: ["vienna", "itinerary", "3 days", "austria"],
    city: "Vienna",
    country: "Austria",
    introduction: [
      "Three days in Vienna runs on imperial time: Schönbrunn's palace and gardens, the Ring's museums, and the coffeehouse hours that are the city's true religion — sachertorte at Café Sperl, strudel at Café Central. The finale is one concert: the Staatsoper's standing tickets cost €13–18 and deliver the golden hall.",
      "At roughly €110 a day, the trip runs about €330 excluding flights. Vienna is grand but walkable — the Ring tram circles everything.",
    ],
    sections: [
      {
        heading: "Day One: The Ring & the Cafés",
        paragraphs: [
          "The Hofburg and the Spanish Riding School's morning exercise, St Stephen's Cathedral's roof pattern, and the café hour — Café Sperl or Central, sachertorte mandatory. Evening: the Staatsoper (standing tickets from €13) or the Musikverein.",
        ],
      },
      {
        heading: "Day Two: Schönbrunn & the Museums",
        paragraphs: [
          "Schönbrunn's 1,441 rooms and the gardens at opening, the Gloriette's view, then the Kunsthistorisches' Bruegels — the finest collection of them on earth. Naschmarkt's dinner stalls close the day.",
        ],
      },
      {
        heading: "Day Three: The Belvedere & the Prater",
        paragraphs: [
          "The Belvedere's Klimt collection (the Kiss, in person), the Prater's 1897 Ferris wheel, and the Danube canal's graffiti walk to the airport train.",
        ],
      },
    ],
    itinerary: {
      heading: "The 3-Day Shape",
      intro: "Ring and cafés (1), Schönbrunn (2), Belvedere and the Prater (3).",
      days: [
        {
          day: 1,
          theme: "The Ring & Concert",
          description: "Hofburg, St Stephen's, café hour, and the Staatsoper night.",
        },
        {
          day: 2,
          theme: "Schönbrunn & Museums",
          description: "The palace at opening, the Gloriette, the Kunsthistorisches, Naschmarkt.",
        },
        {
          day: 3,
          theme: "Belvedere & the Prater",
          description: "Klimt's Kiss, the Ferris wheel, the canal walk, departure.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Logistics",
        items: [
          "Staatsoper standing tickets sell 80 minutes before curtain — queue for the golden hall at student prices.",
          "Schönbrunn's Grand Tour ticket books online.",
        ],
      },
      {
        heading: "Money",
        items: ["About €330 for three days at planning figures, excluding flights."],
      },
    ],
    faq: [
      {
        question: "Is 3 days enough for Vienna?",
        answer:
          "For the palace, the museums, the cafés and one concert — yes. Four adds the Belvedere's upper palace properly and a Danube-valley day.",
      },
      {
        question: "Standing tickets at the Staatsoper — really?",
        answer:
          "Really — €13–18 for the golden hall's standing stalls, sold 80 minutes before curtain. It's Vienna's best-kept deal.",
      },
      {
        question: "How much does 3 days in Vienna cost?",
        answer: "About €330 excluding flights at our €110/day planning estimate.",
      },
    ],
    relatedDestinationSlugs: ["vienna", "budapest", "prague"],
    relatedTripSlugs: ["vienna-3d-imperial", "austria-5d-vienna-salzburg", "budapest-3d-baths"],
    relatedGuideSlugs: ["austria-travel-guide", "vienna-3-day-itinerary", "how-many-days-in-vienna", "is-vienna-expensive", "budapest-3-day-itinerary"],
    planner: {
      destination: "Vienna",
      travelStyle: "cultural",
      interests: ["history", "museums", "food"],
      label: "Build your Vienna plan",
    },
  },
  {
    slug: "prague-3-day-itinerary",
    title: "Prague 3 Day Itinerary: Spires, Castle and Beer",
    seoTitle: "Prague 3 Day Itinerary",
    metaDescription:
      "Three days in Prague: the castle at opening, Charles Bridge at dawn, the astronomical clock, Petřín's views and the Pilsner-and-goulash evenings.",
    excerpt:
      "Three days of the hundred spires: the castle, the bridge at dawn, the astronomical hour, and Pilsner as civic religion.",
    coverImage: null,
    gradient: "from-rose-500 to-amber-600",
    author: MARCUS,
    publishedAt: "2026-09-10",
    updatedAt: "2026-09-10",
    readTime: "6 min read",
    tags: ["prague", "itinerary", "3 days", "czech republic"],
    city: "Prague",
    country: "Czech Republic",
    introduction: [
      "Three days in Prague covers the castle side, the Old Town's astronomical hour, the Jewish Quarter's weight and one Bohemian escape — all priced at Central Europe's friendliest tier. The strategy is timing: the castle at opening, Charles Bridge at dawn, everything else whenever.",
      "At roughly €90 a day, the trip runs about €270 excluding flights. Pilsner costs less than water in some restaurants — the evenings write themselves.",
    ],
    sections: [
      {
        heading: "Day One: The Castle Side",
        paragraphs: [
          "Prague Castle and St Vitus at 8am opening, Golden Lane's tiny colored houses, down through the Lesser Town to the Charles Bridge as the tour groups thin. Evening: Lokál's Pilsner and goulash.",
        ],
      },
      {
        heading: "Day Two: Old Town & the Astronomical Hour",
        paragraphs: [
          "The Old Town Square's astronomical clock show (hourly, arrive early), the Jewish Quarter's synagogues and the Old Cemetery's stacked stones, and the Klementinum's tower view. Evening: a classical concert in the churches or a river cruise.",
        ],
      },
      {
        heading: "Day Three: Petřín or Bohemia",
        paragraphs: [
          "Petřín Hill's funicular and miniature-Eiffel view, the Strahov library's baroque ceiling — or the full-day escape: Český Krumlov's river-wrapped castle (2.5 hours by bus) or Bohemian Switzerland's rock arches.",
        ],
      },
    ],
    itinerary: {
      heading: "The 3-Day Shape",
      intro: "Castle side (1), Old Town (2), Petřín or Bohemia (3).",
      days: [
        {
          day: 1,
          theme: "The Castle Side",
          description: "Castle at opening, Golden Lane, Lesser Town, Charles Bridge, Lokál dinner.",
        },
        {
          day: 2,
          theme: "Old Town & the Quarter",
          description: "The astronomical hour, the Jewish Quarter, Klementinum's view, concert night.",
        },
        {
          day: 3,
          theme: "Petřín or Bohemia",
          description: "The funicular view — or Krumlov's castle and Bohemian Switzerland's rocks.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Logistics",
        items: [
          "Castle tickets: buy the circuit online; the Security Office queue is real.",
          "Krumlov's buses book a day ahead from Florenc station.",
        ],
      },
      {
        heading: "Money",
        items: ["About €270 for three days at planning figures, excluding flights."],
      },
    ],
    faq: [
      {
        question: "Is 3 days enough for Prague?",
        answer: "For the castle, the Old Town and one Bohemian escape — yes, comfortably.",
      },
      {
        question: "Krumlov or Bohemian Switzerland for day three?",
        answer: "Krumlov for the storybook castle; Switzerland for the rock arches and hikes. Both are doable.",
      },
      {
        question: "How much does 3 days in Prague cost?",
        answer: "About €270 excluding flights at our €90/day planning estimate.",
      },
    ],
    relatedDestinationSlugs: ["prague", "vienna", "budapest"],
    relatedTripSlugs: ["prague-2d-fairytale-weekend", "czech-4d-prague-bohemia"],
    relatedGuideSlugs: ["czech-republic-travel-guide", "prague-3-day-itinerary", "vienna-3-day-itinerary", "europe-by-train-guide", "best-european-cities-first-time"],
    planner: {
      destination: "Prague",
      travelStyle: "cultural",
      interests: ["history", "food"],
      label: "Build your Prague plan",
    },
  },
  {
    slug: "amsterdam-4-day-itinerary",
    title: "Amsterdam 4 Day Itinerary: Canals, Museums and Bikes",
    seoTitle: "Amsterdam 4 Day Itinerary",
    metaDescription:
      "Four days in Amsterdam: the museum quarter at opening, Anne Frank's house (booked), the Jordaan's lanes and a proper bike day through the polders.",
    excerpt:
      "Four days of Amsterdam: the museums, the Anne Frank house, the Jordaan, and the bike day through the waterlands.",
    coverImage: null,
    gradient: "from-orange-500 to-blue-600",
    author: MARCUS,
    publishedAt: "2026-09-10",
    updatedAt: "2026-09-10",
    readTime: "6 min read",
    tags: ["amsterdam", "itinerary", "4 days", "netherlands"],
    city: "Amsterdam",
    country: "Netherlands",
    introduction: [
      "Four days is the full Amsterdam: the museum quarter's Rijksmuseum and Van Gogh at opening, Anne Frank's house (booked weeks out — non-negotiable), the Jordaan's lanes and brown cafés, and the fourth day on a rented bike through the Waterland polders north of the ferries.",
      "At roughly €160 a day, the trip runs about €640 excluding flights. Amsterdam's hotel tax is real — book early, stay a tram stop out, and budget honestly.",
    ],
    sections: [
      {
        heading: "Days 1–2: The Museum Core",
        paragraphs: [
          "The Rijksmuseum's Golden Age at opening, the Van Gogh after lunch, and the canal-ring walk between. Anne Frank House's timed slot anchors day two — book the release window weeks ahead; it sells out in hours.",
        ],
      },
      {
        heading: "Day 3: The Jordaan & the Markets",
        paragraphs: [
          "The Jordaan's lanes and Noordermarkt, the Albert Cuyp market's stroopwafels, and the canal cruise or the Houseboat Museum. Evening: De Pijp's craft-beer circuit.",
        ],
      },
      {
        heading: "Day 4: The Bike Day",
        paragraphs: [
          "Free ferries north, then rented bikes through the Waterland polders — cows, windmills, and the flattest cycling on earth. Zaanse Schans's windmills for the photo, back for the farewell frites.",
        ],
      },
    ],
    itinerary: {
      heading: "The 4-Day Shape",
      intro: "Museum core (1–2), Jordaan (3), bike day (4).",
      days: [
        {
          day: 1,
          theme: "Museum Quarter & Canals",
          description: "The Rijksmuseum at opening, the Van Gogh, the canal-ring walk, brown-café dinner.",
        },
        {
          day: 2,
          theme: "Anne Frank & the Jordaan",
          description: "The booked house, Noordermarkt, the Nine Streets, De Pijp's beer night.",
        },
        {
          day: 3,
          theme: "Markets & Museums",
          description: "Albert Cuyp's stroopwafels, the canal cruise, the Houseboat Museum.",
        },
        {
          day: 4,
          theme: "The Bike Day",
          description: "Ferries north, Waterland's polders by bike, Zaanse Schans, farewell frites.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Bookings",
        items: [
          "Anne Frank House: book the release window (weeks out) — it sells out in hours.",
          "The Rijksmuseum and Van Gogh timed slots book days ahead.",
        ],
      },
      {
        heading: "Money",
        items: ["About €640 for four days at planning figures, excluding flights and the hotel tax."],
      },
    ],
    faq: [
      {
        question: "Is 4 days enough for Amsterdam?",
        answer:
          "For the museums, the Jordaan and the bike day — yes, and the bike day is the one people remember.",
      },
      {
        question: "How far ahead for Anne Frank House?",
        answer: "Weeks — the ticket release sells out in hours. Set a calendar alert for the release date.",
      },
      {
        question: "How much does 4 days in Amsterdam cost?",
        answer: "About €640 excluding flights at our €160/day planning estimate — Amsterdam is the price leader.",
      },
    ],
    relatedDestinationSlugs: ["amsterdam", "brussels", "paris"],
    relatedTripSlugs: ["amsterdam-3d-canals", "europe-10d-highlights", "brussels-2d-food-beer"],
    relatedGuideSlugs: ["europe-by-train-guide", "europe-10-day-itinerary", "paris-vs-london", "best-european-cities-first-time", "western-europe-travel-guide"],
    planner: {
      destination: "Amsterdam",
      travelStyle: "cultural",
      interests: ["museums", "food", "nature"],
      label: "Build your Amsterdam plan",
    },
  },
  {
    slug: "florence-2-day-itinerary",
    title: "Florence 2 Day Itinerary: The Renaissance Sprint",
    seoTitle: "Florence 2 Day Itinerary",
    metaDescription:
      "48 hours in Florence: the dome's climb, David at opening, the Uffizi's Botticellis and Oltrarno's artisan lanes — with both museum slots booked.",
    excerpt:
      "The 48-hour Florence: the dome, David, the Uffizi, and Oltrarno's artisans — both bookings made before you fly.",
    coverImage: null,
    gradient: "from-orange-500 to-red-700",
    author: SOFIA,
    publishedAt: "2026-09-10",
    updatedAt: "2026-09-10",
    readTime: "5 min read",
    tags: ["florence", "itinerary", "2 days", "italy"],
    city: "Florence",
    country: "Italy",
    introduction: [
      "Florence in 48 hours is a bookings problem with a beautiful solution: Brunelleschi's dome climb and the Uffizi both run timed entries that sell out days ahead — book them first, then build the days around them. Day one is the dome and David; day two is the Uffizi and Oltrarno.",
      "At roughly €130 a day, the trip runs about €260 excluding flights. The center is thirty minutes on foot end to end — the only real cost is the queue discipline.",
    ],
    sections: [
      {
        heading: "Day One: The Dome & David",
        paragraphs: [
          "Brunelleschi's 463 steps at the 8:15 slot — the terracotta sea from the lantern, Brunelleschi's engineering inches from your shoulders. The Accademia's David at opening, San Lorenzo's Medici chapels after, and the bistecca (shared) for dinner.",
        ],
      },
      {
        heading: "Day 2: The Uffizi & Oltrarno",
        paragraphs: [
          "The Uffizi at its booked hour — Botticelli's Venus and Primavera in the same room — then Oltrarno's artisan workshops, the Santo Spirito piazza, and Piazzale Michelangelo's sunset.",
        ],
      },
    ],
    itinerary: {
      heading: "Your 48 Hours",
      intro: "Dome and David (1), Uffizi and Oltrarno (2).",
      days: [
        {
          day: 1,
          theme: "The Dome & David",
          description: "The 463 steps at 8:15, the Accademia at opening, Medici chapels, bistecca night.",
        },
        {
          day: 2,
          theme: "The Uffizi & Oltrarno",
          description: "Botticelli's room at opening, artisan workshops, the sunset terrace.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Bookings",
        items: [
          "The dome climb and the Uffizi both need timed tickets — book 1–3 weeks out.",
          "The Accademia's David needs a slot too, or a 7:30am queue.",
        ],
      },
      {
        heading: "Money",
        items: ["About €260 for two days at planning figures, excluding flights."],
      },
    ],
    faq: [
      {
        question: "Is 2 days enough for Florence?",
        answer:
          "For the dome, David and the Uffizi — yes, with both bookings made. Tuscany's hills need day three (see our Italy itineraries).",
      },
      {
        question: "Uffizi or the Accademia if I can only do one?",
        answer: "The Uffizi — Botticelli's room alone outweighs David's single statue, though the statue disagrees.",
      },
      {
        question: "How much does 2 days in Florence cost?",
        answer: "About €260 excluding flights at our €130/day planning estimate.",
      },
    ],
    relatedDestinationSlugs: ["florence", "rome", "venice"],
    relatedTripSlugs: ["florence-2d-renaissance", "italy-7d-classics", "rome-florence-venice-7d"],
    relatedGuideSlugs: ["italy-travel-guide", "italy-7-day-itinerary", "rome-3-day-itinerary", "italy-food-guide", "florence-2-day-itinerary"],
    planner: {
      destination: "Florence",
      travelStyle: "cultural",
      interests: ["museums", "food", "history"],
      label: "Build your Florence plan",
    },
  },
  {
    slug: "venice-3-day-itinerary",
    title: "Venice 3 Day Itinerary: The Lagoon Properly",
    seoTitle: "Venice 3 Day Itinerary",
    metaDescription:
      "Three days in Venice: San Marco early, the back canals, the lagoon islands, and the sestieri most day-trippers never reach.",
    excerpt:
      "Three days of Venice: San Marco early, the back canals, Murano and Burano, and the sestieri beyond the postcard.",
    coverImage: null,
    gradient: "from-blue-500 to-indigo-700",
    author: SOFIA,
    publishedAt: "2026-09-10",
    updatedAt: "2026-09-10",
    readTime: "6 min read",
    tags: ["venice", "itinerary", "3 days", "italy"],
    city: "Venice",
    country: "Italy",
    introduction: [
      "Three days is Venice done properly — the extra day beyond the classic two buys the back-canallel sestieri (Castello, Dorsoduro, Cannaregio) where the city actually lives. San Marco early, the islands mid-trip, and the quiet Venice filling the gaps.",
      "At roughly €150 a day, the trip runs about €450 excluding flights. The vaporetto pass pays off at this length; the traghetto crossings remain the two-euro gondola.",
    ],
    sections: [
      {
        heading: "Days 1–2: The Classics, Properly Timed",
        paragraphs: [
          "St Mark's at 8am, the Doge's Palace, the Rialto market at dawn on day two, and the back-canallel afternoons — our 2-day itinerary's arc with the afternoons now unhurried.",
        ],
      },
      {
        heading: "Day 3: The Living Sestieri",
        paragraphs: [
          "Cannaregio's Jewish Ghetto and its bacari, Castello's Arsenal and the Via Garibaldi market, Dorsoduro's galleries and the Zattere's sun-walk. This is the Venice of residents — five minutes from San Marco and a world away.",
        ],
      },
    ],
    itinerary: {
      heading: "The 3-Day Shape",
      intro: "San Marco (1), Rialto and islands (2), the sestieri (3).",
      days: [
        {
          day: 1,
          theme: "San Marco & the Doge",
          description: "The basilica at 8, the palace, the back lanes, cicchetti dinner.",
        },
        {
          day: 2,
          theme: "Rialto & the Lagoon Islands",
          description: "The market at dawn, Murano's furnaces, Burano's colors.",
        },
        {
          day: 3,
          theme: "The Living Sestieri",
          description: "Cannaregio's Ghetto, the Arsenal, Dorsoduro's galleries, the Zattere.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Logistics",
        items: [
          "A 72-hour vaporetto pass pays off at three days.",
          "St Mark's requires the dress code and the free-but-booked entry slot.",
        ],
      },
      {
        heading: "Money",
        items: ["About €450 for three days at planning figures, excluding flights."],
      },
    ],
    faq: [
      {
        question: "Is 3 days enough for Venice?",
        answer:
          "It's the proper length — the islands and the living sestieri both fit without sprinting.",
      },
      {
        question: "Which sestiere for the quiet Venice?",
        answer: "Cannaregio for the bacari, Dorsoduro for the galleries, Castello for the Arsenal — all three in a day.",
      },
      {
        question: "How much does 3 days in Venice cost?",
        answer: "About €450 excluding flights at our €150/day planning estimate.",
      },
    ],
    relatedDestinationSlugs: ["venice", "florence", "rome"],
    relatedTripSlugs: ["venice-2d-canals", "italy-7d-classics", "europe-14d-grand-tour"],
    relatedGuideSlugs: ["italy-travel-guide", "italy-7-day-itinerary", "europe-14-day-itinerary", "florence-2-day-itinerary", "italy-10-day-itinerary"],
    planner: {
      destination: "Venice",
      travelStyle: "cultural",
      interests: ["museums", "food", "history"],
      label: "Build your Venice plan",
    },
  },
  {
    slug: "athens-4-day-itinerary",
    title: "Athens 4 Day Itinerary: The Classical Base",
    seoTitle: "Athens 4 Day Itinerary",
    metaDescription:
      "Four days in Athens: the Acropolis at opening, the museum vaults, Piraeus and the Saronic islands — or the mainland's Delphi day trip.",
    excerpt:
      "Four days of Athens: the Acropolis, the museums, and the island-or-Delphi fork for day four.",
    coverImage: null,
    gradient: "from-blue-500 to-amber-600",
    author: MARCUS,
    publishedAt: "2026-09-10",
    updatedAt: "2026-09-10",
    readTime: "6 min read",
    tags: ["athens", "itinerary", "4 days", "greece"],
    city: "Athens",
    country: "Greece",
    introduction: [
      "Four days makes Athens a base rather than a stop: the classical core takes two days, day three goes to the National Museum's vaults and the city's hills, and day four is the fork — a Saronic island day by ferry from Piraeus, or Delphi's mountain sanctuary by bus.",
      "At roughly €95 a day, the trip runs about €380 excluding flights. Athens is Europe's cheapest gateway to island-hopping — the ferries start at Piraeus, a metro ride away.",
    ],
    sections: [
      {
        heading: "Days 1–2: The Classical Core",
        paragraphs: [
          "Our 3-day itinerary's arc: the Acropolis at opening, the Acropolis Museum, the Ancient Agora, Plaka's lanes, and the National Archaeological Museum's bronze Zeus. Sunset from Mount Lycabettus both evenings if the legs allow.",
        ],
      },
      {
        heading: "Day 3: The Museums & the Hills",
        paragraphs: [
          "The National Archaeological Museum properly (it deserves half a day), Kerameikos' ancient cemetery, and the Anafiotika island-village lanes above Plaka.",
        ],
      },
      {
        heading: "Day 4: The Fork",
        paragraphs: [
          "Island day: the Flying Dolphin hydrofoil to Aegina or Hydra (Piraeus is 20 minutes away). Mainland day: Delphi's sanctuary on the mountainside, 2.5 hours by bus. Both are honest days — pick by sea-leg or mountain-leg preference.",
        ],
      },
    ],
    itinerary: {
      heading: "The 4-Day Shape",
      intro: "Classical core (1–2), museums and hills (3), the island-or-Delphi fork (4).",
      days: [
        {
          day: 1,
          theme: "The Acropolis",
          description: "The Parthenon at opening, the Acropolis Museum, Plaka's lanes, taverna dinner.",
        },
        {
          day: 2,
          theme: "Agora & Lycabettus",
          description: "The Ancient Agora, the National Museum, the Lycabettus sunset.",
        },
        {
          day: 3,
          theme: "Museums & Hills",
          description: "The bronzes properly, Kerameikos, Anafiotika's island lanes.",
        },
        {
          day: 4,
          theme: "The Fork",
          description: "Aegina or Hydra by hydrofoil — or Delphi's mountain sanctuary.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Logistics",
        items: [
          "The Acropolis' timed entry books online; summer slots sell out.",
          "Piraeus is 20 minutes by metro; Delphi buses leave from KTEL Liossion.",
        ],
      },
      {
        heading: "Money",
        items: ["About €380 for four days at planning figures, excluding flights and ferry tickets."],
      },
    ],
    faq: [
      {
        question: "Is 4 days enough for Athens?",
        answer:
          "It's the base-trip length — the classical core, the museums, and one island or Delphi day. The islands themselves need more.",
      },
      {
        question: "Island or Delphi for day four?",
        answer: "Sea legs take the hydrofoil to Aegina or Hydra; mountain legs take Delphi. Both run year-round.",
      },
      {
        question: "How much does 4 days in Athens cost?",
        answer: "About €380 excluding flights at our €95/day planning estimate.",
      },
    ],
    relatedDestinationSlugs: ["athens", "santorini", "dubrovnik"],
    relatedTripSlugs: ["athens-3d-classics", "greece-10d-athens-islands"],
    relatedGuideSlugs: ["greece-travel-guide", "athens-3-day-itinerary", "santorini-3-day-itinerary", "mediterranean-travel-guide", "europe-7-day-itinerary"],
    planner: {
      destination: "Athens",
      travelStyle: "cultural",
      interests: ["history", "food", "beaches"],
      label: "Build your Athens plan",
    },
  },
  {
    slug: "dubai-3-day-itinerary",
    title: "Dubai 3 Day Itinerary: The Superlatives Sprint",
    seoTitle: "Dubai 3 Day Itinerary",
    metaDescription:
      "Three days in Dubai: the Burj's sunset slot, old Dubai's creek crossings, a desert evening and the beach morning — booked weeks ahead where it counts.",
    excerpt:
      "Three days of superlatives: the Burj at sunset, the creek's abra crossings, the desert's silence and the beach between.",
    coverImage: null,
    gradient: "from-yellow-500 to-orange-600",
    author: PRIYA,
    publishedAt: "2026-09-10",
    updatedAt: "2026-09-10",
    readTime: "5 min read",
    tags: ["dubai", "itinerary", "3 days", "uae"],
    city: "Dubai",
    country: "UAE",
    introduction: [
      "Three days covers Dubai's four personalities — the tower, the old creek, the desert and the beach — if the Burj Khalifa's sunset slot is booked weeks ahead. The rest is walk-up friendly and climate-managed.",
      "At roughly $250 a day, the trip runs about $750 excluding flights. November–March is the pleasant season; summer is indoor-only Dubai.",
    ],
    sections: [
      {
        heading: "Day One: The Tower & the Mall",
        paragraphs: [
          "Burj Khalifa's level 124/125 at the sunset slot (booked), the fountain show from the waterfront, and Dubai Mall's aquarium if the kids demand it. Downtown dinner with the tower lit.",
        ],
      },
      {
        heading: "Day 2: Old Dubai & the Creek",
        paragraphs: [
          "Al Fahidi's historical lanes, the one-dirham abra crossing, the gold and spice souks, and Al Seef's heritage waterfront for dinner.",
        ],
      },
      {
        heading: "Day Three: Desert & Beach",
        paragraphs: [
          "Morning at Kite or JBR beach, and the evening desert safari — dune drive, camel hour, the bedouin-camp barbecue under stars.",
        ],
      },
    ],
    itinerary: {
      heading: "The 3-Day Shape",
      intro: "Tower (1), creek (2), desert and beach (3).",
      days: [
        {
          day: 1,
          theme: "The Tower & Downtown",
          description: "Burj's sunset slot, the fountain show, downtown dinner.",
        },
        {
          day: 2,
          theme: "Old Dubai & the Souks",
          description: "Al Fahidi, the abra crossing, gold and spice souks, Al Seef.",
        },
        {
          day: 3,
          theme: "Desert & Beach",
          description: "Beach morning, desert safari evening, the camp barbecue.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Bookings",
        items: [
          "The Burj's sunset slot sells out weeks ahead — book first.",
          "Desert safaris: pick a reputable operator; red-dune routes are the scenic ones.",
        ],
      },
      {
        heading: "Money",
        items: ["About $750 for three days at planning figures, excluding flights."],
      },
    ],
    faq: [
      {
        question: "Is 3 days enough for Dubai?",
        answer:
          "For the tower, the creek, the desert and the beach — yes, exactly. Abu Dhabi needs a fourth day.",
      },
      {
        question: "Which Burj slot?",
        answer: "Sunset — the day view and the lit-up night in one booking. Book weeks ahead.",
      },
      {
        question: "How much does 3 days in Dubai cost?",
        answer: "About $750 excluding flights at our $250/day planning estimate.",
      },
    ],
    relatedDestinationSlugs: ["dubai", "abu-dhabi"],
    relatedTripSlugs: ["dubai-4d-highlights"],
    relatedGuideSlugs: ["dubai-3-day-itinerary", "tokyo-luxury-travel-guide", "usa-travel-guide", "tokyo-travel-budget"],
    planner: {
      destination: "Dubai",
      travelStyle: "active",
      interests: ["shopping", "food"],
      label: "Build your Dubai plan",
    },
  },
  {
    slug: "hong-kong-3-day-itinerary",
    title: "Hong Kong 3 Day Itinerary: Skyline, Dim Sum and the Peak",
    seoTitle: "Hong Kong 3 Day Itinerary",
    metaDescription:
      "Three days in Hong Kong: Victoria Peak's tram, dim sum mornings, the Star Ferry, Lantau's Big Buddha and the night-market blaze.",
    excerpt:
      "Three days of Hong Kong: the Peak's tram, dim sum mornings, the Star Ferry, Lantau's Buddha and Temple Street at night.",
    coverImage: null,
    gradient: "from-red-600 to-amber-500",
    author: PRIYA,
    publishedAt: "2026-09-10",
    updatedAt: "2026-09-10",
    readTime: "5 min read",
    tags: ["hong kong", "itinerary", "3 days"],
    city: "Hong Kong",
    country: "Hong Kong SAR",
    introduction: [
      "Three days covers Hong Kong's essentials: the Peak and the Star Ferry, dim sum in the classic rooms, Lantau's Big Buddha by cable car, and the Temple Street night market. The Octopus card and the MRT make the geometry trivial.",
      "At roughly $130 a day, the trip runs about $390 excluding flights. October–December is the clear-sky window; summers are hot and typhoon-aware.",
    ],
    sections: [
      {
        heading: "Day One: The Island Icons",
        paragraphs: [
          "Dim sum breakfast at a classic teahouse, the Star Ferry across the harbor, Victoria Peak by tram, and the Symphony of Lights from Tsim Sha Tsui at 8pm.",
        ],
      },
      {
        heading: "Day 2: Lantau & the Big Buddha",
        paragraphs: [
          "The Ngong Ping cable car, the Big Buddha and Po Lin Monastery, Tai O's stilt houses, and Temple Street's night market dinner.",
        ],
      },
      {
        heading: "Day Three: Markets & Farewell",
        paragraphs: [
          "Cha chaan teng breakfast (milk tea, pineapple bun), the Central–Mid-Levels escalators, wonton noodles and egg tarts, and the 24-minute Airport Express.",
        ],
      },
    ],
    itinerary: {
      heading: "The 3-Day Shape",
      intro: "Island icons (1), Lantau (2), markets and farewell (3).",
      days: [
        {
          day: 1,
          theme: "Island Icons",
          description: "Dim sum, Star Ferry, the Peak tram, Symphony of Lights.",
        },
        {
          day: 2,
          theme: "Lantau & the Buddha",
          description: "The cable car, the Big Buddha, Tai O, Temple Street night market.",
        },
        {
          day: 3,
          theme: "Markets & Farewell",
          description: "Cha chaan teng breakfast, the escalators, egg tarts, the airport express.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Logistics",
        items: [
          "Octopus card for MRT, ferries, trams and bakeries.",
          "Peak tram queues: buy the skip-line bundle online.",
        ],
      },
      {
        heading: "Money",
        items: ["About HK$3,000 for three days at planning figures, excluding flights."],
      },
    ],
    faq: [
      {
        question: "Is 3 days enough for Hong Kong?",
        answer: "For the Peak, dim sum, Lantau and the markets — yes, comfortably.",
      },
      {
        question: "Best month for the skyline?",
        answer: "October–December — cool, dry and the clearest harbor views.",
      },
      {
        question: "How much does 3 days in Hong Kong cost?",
        answer: "About HK$3,000 excluding flights at our planning figures.",
      },
    ],
    relatedDestinationSlugs: ["hong-kong", "macau", "taipei"],
    relatedTripSlugs: ["hong-kong-3d-highlights", "hongkong-shopping-foodie", "taipei-3d-night-markets"],
    relatedGuideSlugs: ["hong-kong-travel-guide", "hong-kong-food-guide", "hong-kong-48-hours", "taipei-3-day-itinerary"],
    planner: {
      destination: "Hong Kong",
      travelStyle: "foodie",
      interests: ["food", "shopping", "nature"],
      label: "Build your Hong Kong plan",
    },
  },
  {
    slug: "kuala-lumpur-3-day-itinerary",
    title: "Kuala Lumpur 3 Day Itinerary: Towers, Temples and Hawkers",
    seoTitle: "Kuala Lumpur 3 Day Itinerary",
    metaDescription:
      "Three days in Kuala Lumpur: the Petronas skybridge, Batu Caves' rainbow steps, three cuisines on one street and the KL Forest canopy walk.",
    excerpt:
      "Three days of KL: the towers, the rainbow steps, three cuisines on one street, and the canopy walk above the city.",
    coverImage: null,
    gradient: "from-emerald-500 to-teal-700",
    author: PRIYA,
    publishedAt: "2026-09-10",
    updatedAt: "2026-09-10",
    readTime: "5 min read",
    tags: ["kuala lumpur", "itinerary", "3 days", "malaysia"],
    city: "Kuala Lumpur",
    country: "Malaysia",
    introduction: [
      "Three days covers KL's essentials: the Petronas Towers' skybridge, Batu Caves' 272 rainbow steps, the colonial core, and the hawker courts where Malay, Chinese and Indian KL share a street. The KUL ekspres train and the monorail handle everything.",
      "At roughly $60 a day, the trip runs about $180 excluding flights — one of Asia's best-value capitals.",
    ],
    sections: [
      {
        heading: "Day One: Towers & the Colonial Core",
        paragraphs: [
          "Petronas Towers' skybridge (book the morning slot), KLCC park's fountain lunch, Merdeka Square's Moorish buildings, and Jalan Alor's hawker street for dinner.",
        ],
      },
      {
        heading: "Day Two: Batu Caves & Temples",
        paragraphs: [
          "Batu Caves' rainbow stairs before the heat (the monkeys are part of it), Brickfields' banana-leaf lunch, Thean Hou Temple, and Changkat's nightlife.",
        ],
      },
      {
        heading: "Day Three: Markets & the Canopy",
        paragraphs: [
          "Central Market and Petaling Street's Chinatown, nasi lemak and teh tarik farewell, and the KL Forest Eco Park's canopy walk before the airport.",
        ],
      },
    ],
    itinerary: {
      heading: "The 3-Day Shape",
      intro: "Towers (1), caves (2), markets and canopy (3).",
      days: [
        {
          day: 1,
          theme: "Towers & Colonial Core",
          description: "The skybridge, KLCC park, Merdeka Square, Jalan Alor dinner.",
        },
        {
          day: 2,
          theme: "Batu Caves & Temples",
          description: "The rainbow steps early, banana-leaf lunch, Thean Hou, Changkat night.",
        },
        {
          day: 3,
          theme: "Markets & Canopy",
          description: "Central Market, Petaling Street, the canopy walk, airport.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Logistics",
        items: [
          "The KLIA Ekspres is 28 minutes from the airport.",
          "Skybridge tickets sell out — book online the day before.",
        ],
      },
      {
        heading: "Money",
        items: ["About MYR 850 for three days at planning figures, excluding flights."],
      },
    ],
    faq: [
      {
        question: "Is 3 days enough for Kuala Lumpur?",
        answer: "For the towers, caves and hawker circuit — yes. Cameron Highlands or Penang need more days.",
      },
      {
        question: "When should I climb Batu Caves?",
        answer: "Before 9am — cooler, quieter, and the monkeys are at their most theatrical.",
      },
      {
        question: "How much does 3 days in KL cost?",
        answer: "About MYR 850 excluding flights at our $60/day planning estimate.",
      },
    ],
    relatedDestinationSlugs: ["kuala-lumpur", "singapore"],
    relatedTripSlugs: ["kuala-lumpur-3d", "singapore-3d-family"],
    relatedGuideSlugs: ["southeast-asia-travel-guide", "singapore-3-day-itinerary", "kuala-lumpur-3-day-itinerary", "asia-travel-guide", "thailand-travel-guide"],
    planner: {
      destination: "Kuala Lumpur",
      travelStyle: "foodie",
      interests: ["food", "shopping", "history"],
      label: "Build your KL plan",
    },
  },
  {
    slug: "hanoi-3-day-itinerary",
    title: "Hanoi 3 Day Itinerary: The Old Quarter & the Bay",
    seoTitle: "Hanoi 3 Day Itinerary",
    metaDescription:
      "Three days in Hanoi: pho at dawn, the Old Quarter's motorbike tide, egg coffee, Train Street and the Ha Long Bay day cruise.",
    excerpt:
      "Three days of Hanoi: pho at dawn, the Old Quarter, egg coffee, Train Street and Ha Long's karsts.",
    coverImage: null,
    gradient: "from-red-500 to-orange-600",
    author: PRIYA,
    publishedAt: "2026-09-10",
    updatedAt: "2026-09-10",
    readTime: "5 min read",
    tags: ["hanoi", "itinerary", "3 days", "vietnam"],
    city: "Hanoi",
    country: "Vietnam",
    introduction: [
      "Three days covers Hanoi's essentials and one Ha Long escape: pho breakfasts and the Old Quarter's 36 streets, the museums and egg-coffee cafés, and the bay's karst towers on a day cruise. October–November is the dry, clear window.",
      "At roughly $50 a day, the trip runs about $150 excluding flights — the best value capital on the continent.",
    ],
    sections: [
      {
        heading: "Day One: The Old Quarter",
        paragraphs: [
          "Pho at dawn (Pho Bat Dan's queue is the recommendation), Hoan Kiem Lake's morning tai chi, the 36 merchant streets' motorbike ballet, and bun cha with bia hoi at dusk.",
        ],
      },
      {
        heading: "Day Two: History & Egg Coffee",
        paragraphs: [
          "The Temple of Literature, the Hoa Lo Prison museum or the Ho Chi Minh complex, egg coffee in a hidden café, and cha ca's turmeric-fish dinner.",
        ],
      },
      {
        heading: "Day Three: Ha Long Bay or Train Street",
        paragraphs: [
          "The Ha Long day cruise (booked, 4 hours each way) — or, if staying, Train Street's coffee-and-train theater and the Water Puppet Theatre.",
        ],
      },
    ],
    itinerary: {
      heading: "The 3-Day Shape",
      intro: "Old Quarter (1), history (2), the bay (3).",
      days: [
        {
          day: 1,
          theme: "The Old Quarter",
          description: "Pho at dawn, Hoan Kiem, the 36 streets, bun cha and bia hoi.",
        },
        {
          day: 2,
          theme: "History & Coffee",
          description: "The Temple of Literature, museums, egg coffee, cha ca dinner.",
        },
        {
          day: 3,
          theme: "Ha Long or Train Street",
          description: "The karst cruise — or Train Street and the water puppets.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Logistics",
        items: [
          "Ha Long day cruises pick up from the Old Quarter — book with a reputable operator.",
          "Cross streets slowly and steadily; the motorbikes read intention.",
        ],
      },
      {
        heading: "Money",
        items: ["About $150 for three days at planning figures, excluding flights."],
      },
    ],
    faq: [
      {
        question: "Is 3 days enough for Hanoi?",
        answer: "For the Old Quarter, the museums and one Ha Long day — yes. Sapa and Ninh Binh need more.",
      },
      {
        question: "Ha Long day trip or overnight?",
        answer: "The overnight cruise is the better trip; the day cruise is the honest 3-day version. Both are good.",
      },
      {
        question: "How much does 3 days in Hanoi cost?",
        answer: "About $150 excluding flights at our $50/day planning estimate.",
      },
    ],
    relatedDestinationSlugs: ["hanoi", "ho-chi-minh-city", "da-nang"],
    relatedTripSlugs: ["hanoi-3d-street-food", "vietnam-10d-north-south"],
    relatedGuideSlugs: ["vietnam-travel-guide", "hanoi-3-day-itinerary", "southeast-asia-travel-guide", "ho-chi-minh-city-3-day-itinerary"],
    planner: {
      destination: "Hanoi",
      travelStyle: "foodie",
      interests: ["food", "history", "nature"],
      label: "Build your Hanoi plan",
    },
  },
  {
    slug: "ho-chi-minh-city-3-day-itinerary",
    title: "Ho Chi Minh City 3 Day Itinerary: The Engine City",
    seoTitle: "Ho Chi Minh City 3 Day Itinerary",
    metaDescription:
      "Three days in Ho Chi Minh City: the colonial core, the war-history weight of Cu Chi and the museums, rooftop bars and the banh mi dynasty.",
    excerpt:
      "Three days of the engine city: the colonial core, Cu Chi's tunnels, the museums and the rooftops.",
    coverImage: null,
    gradient: "from-amber-500 to-red-600",
    author: PRIYA,
    publishedAt: "2026-09-10",
    updatedAt: "2026-09-10",
    readTime: "5 min read",
    tags: ["ho chi minh city", "itinerary", "3 days", "vietnam"],
    city: "Ho Chi Minh City",
    country: "Vietnam",
    introduction: [
      "Three days covers Saigon's essentials: the colonial core's post office and basilica, the war-history weight of Cu Chi's tunnels and the War Remnants Museum, rooftop bars over the motorbike rivers, and the banh mi dynasty on Huynh Hoa's line.",
      "At roughly $50 a day, the trip runs about $150 excluding flights. December–January is the dry, slightly cooler window.",
    ],
    sections: [
      {
        heading: "Day One: The Colonial Core",
        paragraphs: [
          "Banh mi breakfast at the benchmark, the Central Post Office's ironwork and the Book Street, Ben Thanh's market lunch, and the rooftop hour over the river.",
        ],
      },
      {
        heading: "Day Two: The Weight",
        paragraphs: [
          "Cu Chi's tunnels with a licensed guide (half-day), the War Remnants Museum — heavy, essential — and the street-seafood dinner on Nguyen Thien Thuat.",
        ],
      },
      {
        heading: "Day Three: Chinatown & Farewell",
        paragraphs: [
          "Cholon's Thien Hau temple and the medicine streets, pho and drip coffee farewell, and the Landmark 81 view or the river walk before the airport.",
        ],
      },
    ],
    itinerary: {
      heading: "The 3-Day Shape",
      intro: "Colonial core (1), the weight (2), Chinatown (3).",
      days: [
        {
          day: 1,
          theme: "The Colonial Core",
          description: "Banh mi breakfast, the Post Office, Ben Thanh, the rooftop hour.",
        },
        {
          day: 2,
          theme: "The Weight",
          description: "Cu Chi's tunnels, the War Remnants Museum, street-seafood dinner.",
        },
        {
          day: 3,
          theme: "Chinatown & Farewell",
          description: "Cholon's temples, pho farewell, the Landmark 81 view.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Logistics",
        items: [
          "Cu Chi tours need booking a day ahead; pick licensed operators.",
          "Cross like the locals: slow, steady, never stopping.",
        ],
      },
      {
        heading: "Money",
        items: ["About $150 for three days at planning figures, excluding flights."],
      },
    ],
    faq: [
      {
        question: "Is 3 days enough for Ho Chi Minh City?",
        answer: "For the core, the history and the food — yes. The Mekong Delta needs a fourth day.",
      },
      {
        question: "Is Cu Chi worth it?",
        answer: "Yes — with a licensed guide, and paired with the museum for the full context.",
      },
      {
        question: "How much does 3 days in HCMC cost?",
        answer: "About $150 excluding flights at our $50/day planning estimate.",
      },
    ],
    relatedDestinationSlugs: ["ho-chi-minh-city", "hanoi", "da-nang"],
    relatedTripSlugs: ["ho-chi-minh-3d", "vietnam-food-8d", "vietnam-10d-north-south"],
    relatedGuideSlugs: ["vietnam-travel-guide", "ho-chi-minh-city-3-day-itinerary", "hanoi-3-day-itinerary", "southeast-asia-travel-guide"],
    planner: {
      destination: "Ho Chi Minh City",
      travelStyle: "foodie",
      interests: ["food", "history"],
      label: "Build your Saigon plan",
    },
  },
  {
    slug: "osaka-2-day-itinerary",
    title: "Osaka 2 Day Itinerary: Kuidaore Weekend",
    seoTitle: "Osaka 2 Day Itinerary",
    metaDescription:
      "48 hours in Osaka: Dotonbori's neon, the castle's grounds, Kuromon Market and the kushikatsu-and-takoyaki curriculum — Japan's food city, compressed.",
    excerpt:
      "48 hours of kuidaore: Dotonbori's neon, the castle, Kuromon Market and the fried curriculum.",
    coverImage: null,
    gradient: "from-red-500 to-orange-600",
    author: YUKI,
    publishedAt: "2026-09-10",
    updatedAt: "2026-09-10",
    readTime: "5 min read",
    tags: ["osaka", "itinerary", "2 days", "japan"],
    city: "Osaka",
    country: "Japan",
    introduction: [
      "Two days in Osaka is a food trip with sightseeing between meals: Dotonbori's neon and the Glico running man, Osaka Castle's grounds, Kuromon Market's wagyu skewers, and the kushikatsu rule — no double-dipping the sauce — learned the fun way.",
      "At roughly $110 a day, the trip runs about $220 excluding flights. Osaka is Japan's cheapest big-city food market — the kuidaore ('eat yourself bankrupt') motto is earned nightly.",
    ],
    sections: [
      {
        heading: "Day One: Dotonbori & the Castle",
        paragraphs: [
          "Osaka Castle's grounds and museum, Kuromon Market's grazing lunch, and the Dotonbori evening — takoyaki, okonomiyaki, the Glico sign, and the kushikatsu rule at Daruma.",
        ],
      },
      {
        heading: "Day Two: Umeda & Shinsekai",
        paragraphs: [
          "Osaka Museum of Housing's recreated streets, Umeda Sky Building's view, Shinsekai's retro kushikatsu alleys, and the last-standing-bar round.",
        ],
      },
    ],
    itinerary: {
      heading: "Your 48 Hours",
      intro: "Castle and Dotonbori (1), Umeda and Shinsekai (2).",
      days: [
        {
          day: 1,
          theme: "Castle & Dotonbori",
          description: "The castle's grounds, Kuromon lunch, the neon evening and its fried curriculum.",
        },
        {
          day: 2,
          theme: "Umeda & Shinsekai",
          description: "The housing museum, the Sky Building, Shinsekai's alleys, the standing-bar round.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Logistics",
        items: [
          "Kansai airport: the Nankai rapi:t hits Namba in 40 minutes.",
          "Kushikatsu rule: the sauce is shared — no double-dipping, ever.",
        ],
      },
      {
        heading: "Money",
        items: ["About $220 for two days at planning figures, excluding flights."],
      },
    ],
    faq: [
      {
        question: "Is 2 days enough for Osaka?",
        answer:
          "For the food curriculum and the castle — yes. Add Universal or Nara with a third day.",
      },
      {
        question: "What is kuidaore?",
        answer:
          "'Eat yourself bankrupt' — Osaka's civic identity, and the reason the food-to-price ratio beats Tokyo's.",
      },
      {
        question: "How much does 2 days in Osaka cost?",
        answer: "About $220 excluding flights at our $110/day planning estimate.",
      },
    ],
    relatedDestinationSlugs: ["osaka", "kyoto", "kobe"],
    relatedTripSlugs: ["osaka-food-capital", "tokyo-kyoto-osaka-7d", "kyoto-2d-temples"],
    relatedGuideSlugs: ["tokyo-vs-osaka", "kyoto-vs-osaka", "japan-travel-guide", "osaka-food-guide-2027", "how-many-days-in-osaka"],
    planner: {
      destination: "Osaka",
      travelStyle: "foodie",
      interests: ["food", "nightlife", "shopping"],
      label: "Build your Osaka plan",
    },
  },
  {
    slug: "kyoto-3-day-itinerary",
    title: "Kyoto 3 Day Itinerary: The Deeper Temples",
    seoTitle: "Kyoto 3 Day Itinerary",
    metaDescription:
      "Three days in Kyoto: the dawn-torii and bamboo essentials, the northern temples and Nijo Castle, and Arashiyama done without the rush.",
    excerpt:
      "Three days of Kyoto: the dawn essentials, the northern temples, and Arashiyama unhurried.",
    coverImage: null,
    gradient: "from-orange-600 to-red-600",
    author: YUKI,
    publishedAt: "2026-09-10",
    updatedAt: "2026-09-10",
    readTime: "6 min read",
    tags: ["kyoto", "itinerary", "3 days", "japan"],
    city: "Kyoto",
    country: "Japan",
    introduction: [
      "The third Kyoto day changes the trip: the first two cover the dawn essentials (Fushimi Inari, Higashiyama, Arashiyama); the third adds the northern temples — Kinkaku-ji's golden pavilion, Ryoan-ji's rock garden, Nijo Castle's nightingale floors — at a pace the two-day trip can't afford.",
      "At roughly $140 a day, the trip runs about $420 excluding hotels in peak seasons. The dawn doctrine still rules: every hour before 9am is worth three after it.",
    ],
    sections: [
      {
        heading: "Days 1–2: The Dawn Essentials",
        paragraphs: [
          "Fushimi Inari at 7am, Higashiyama's lanes and Gion at dusk; Arashiyama's bamboo before 8am, Tenryu-ji's garden, the riverbank. Our 2-day itinerary's arc, unchanged.",
        ],
      },
      {
        heading: "Day 3: The Northern Temples",
        paragraphs: [
          "Kinkaku-ji's golden pavilion at opening (the reflection beats the crowd), Ryoan-ji's fifteen stones and their mystery, Nijo Castle's nightingale floors and the Imperial Palace's park. Nishiki Market's farewell grazing.",
        ],
      },
    ],
    itinerary: {
      heading: "The 3-Day Shape",
      intro: "Dawn essentials (1–2), the northern temples (3).",
      days: [
        {
          day: 1,
          theme: "Higashiyama & Gion",
          description: "Kiyomizu at opening, the Sannenzaka lanes, Yasaka, Gion at dusk.",
        },
        {
          day: 2,
          theme: "Arashiyama Dawn",
          description: "The bamboo grove before 8, Tenryu-ji, the riverbank, Nishiki Market.",
        },
        {
          day: 3,
          theme: "The Northern Temples",
          description: "Kinkaku-ji's gold, Ryoan-ji's stones, Nijo's floors, the farewell kaiseki.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Logistics",
        items: [
          "Buses clog in season — the subway plus walking is often faster.",
          "Book kaiseki or shojin-ryori dinners ahead; the good rooms are small.",
        ],
      },
      {
        heading: "Money",
        items: ["About $420 for three days at planning figures, excluding peak-season hotels."],
      },
    ],
    faq: [
      {
        question: "Is 3 days enough for Kyoto?",
        answer:
          "It's the depth threshold — the dawn essentials plus the northern temples and Nijo. Four adds Uji and the tea country.",
      },
      {
        question: "Which temple for day three's sunrise?",
        answer: "Kinkaku-ji's golden pavilion at opening — the reflection across the pond beats any queue.",
      },
      {
        question: "How much does 3 days in Kyoto cost?",
        answer: "About $420 excluding hotels at our $140/day planning estimate.",
      },
    ],
    relatedDestinationSlugs: ["kyoto", "osaka"],
    relatedTripSlugs: ["kyoto-2d-temples", "tokyo-kyoto-5d", "japan-7d-golden-route"],
    relatedGuideSlugs: ["japan-travel-guide", "kyoto-2-day-itinerary", "how-many-days-in-kyoto", "kyoto-vs-osaka", "japan-rail-travel-guide"],
    planner: {
      destination: "Kyoto",
      travelStyle: "cultural",
      interests: ["history", "food", "nature"],
      label: "Build your 3-day Kyoto plan",
    },
  },
];

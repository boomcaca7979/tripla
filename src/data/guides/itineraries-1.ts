import type { Guide } from "../guides";

// Destination itinerary guides — day-by-day planning narratives for the
// highest-volume "X day itinerary" searches. Budget figures stay consistent
// with src/data/destinations.ts budgetPerDay values.

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

export const ITINERARIES_1_GUIDES: Guide[] = [
  // ── 1. Tokyo 3 Day Itinerary ──────────────────────────────────────────
  {
    slug: "tokyo-3-day-itinerary",
    title: "Tokyo 3 Day Itinerary: The First-Timer's Route That Actually Works",
    seoTitle: "Tokyo 3 Day Itinerary: The First-Timer's Route",
    metaDescription:
      "A realistic 3 day Tokyo itinerary: Asakusa and old east side, Meiji to Shibuya on the west, and one flexible Ginza–bayside day — with transit and budget notes.",
    excerpt:
      "Three days in Tokyo without the heroic crossings: one core area per day, jet-lag-aware pacing, and the specific route we'd walk ourselves.",
    coverImage: null,
    gradient: "from-rose-500 to-red-700",
    author: YUKI,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "9 min read",
    tags: ["tokyo", "itinerary", "japan", "3 days"],
    city: "Tokyo",
    country: "Japan",
    introduction: [
      "Three days in Tokyo is a sprint, and the difference between a great short trip and an exhausting one is geography. Tokyo isn't one city but a dozen districts stapled together by a superb but vast rail network — so this itinerary commits to one side of the city per day and refuses to zig-zag.",
      "The plan below pairs the old east (Asakusa, Ueno, Yanaka) with the modern west (Meiji, Harajuku, Shibuya, Shinjuku) and keeps day three flexible for Ginza, the bayside, or rain-day museums. At our planning estimate of roughly $120 a day, a three-day Tokyo trip lands around $360 excluding flights — see our Tokyo budget guide for the breakdown.",
    ],
    sections: [
      {
        heading: "The Logic: One Side of the City Per Day",
        paragraphs: [
          "The classic first-timer mistake is treating Tokyo like a compact European capital. It isn't: Shibuya to Asakusa is a 40-minute train ride, and two cross-city errors a day will eat your trip. This route does east first (jet lag makes you wake early, and Senso-ji is best before the crowds anyway), then west, then a flex day in the center.",
        ],
        bullets: [
          "Day 1 — east side: Asakusa, Senso-ji, Ueno or Yanaka. Low-stakes walking while you recover.",
          "Day 2 — west side: Meiji Shrine, Harajuku, Omotesando, Shibuya at dusk.",
          "Day 3 — center: Tsukiji Outer Market, Ginza, then bayside Odaiba or museums if it rains.",
        ],
      },
      {
        heading: "Pacing Around Jet Lag",
        paragraphs: [
          "Most long-haul arrivals land in the late afternoon, sleep badly, and wake at four in the morning. Use it: Tokyo's best experiences — market mornings, shrine forests, empty crossings — reward the early waker. Front-load ticketed activities for day two onward, when your body clock has caught up and queues are actually enjoyable.",
          "Dinners on nights one and two should be within walking distance of dinner-and-done: a konbini picnic, an izakaya near your hotel, ramen at a counter. Save the Shinjuku bar crawl for night three, when you can afford a late one.",
        ],
      },
      {
        heading: "What Three Days Cuts (and Why That's OK)",
        paragraphs: [
          "Three days skips: day trips to Hakone or Nikko, most museums beyond one flagship, Akihabara unless it's your thing, and any ryokan night. That's the honest trade for seeing the city rather than transiting it. If any of those cut items is the actual reason you're flying to Japan, add a fourth day or shift them into a longer Japan route — our how-many-days-in-Tokyo guide walks through the tradeoffs.",
        ],
      },
    ],
    itinerary: {
      heading: "Your 3 Days in Tokyo, Day by Day",
      intro:
        "One core area per day, mornings doing the heavy lifting, evenings near your hotel. Times are suggestions, not appointments.",
      days: [
        {
          day: 1,
          theme: "Old East Tokyo: Asakusa & Ueno",
          description:
            "Land, drop bags, and if you're arriving in time, walk Senso-ji's incense smoke at dusk when the lanterns come on. If you arrived the night before, do it properly: Senso-ji before 9am, Nakamise-dori's snack stalls, then Ueno Park's museums or the Yanaka backstreets — low-rise, walkable, and mercifully flat.",
        },
        {
          day: 2,
          theme: "Modern West: Meiji, Harajuku & Shibuya",
          description:
            "Meiji Shrine's forest first — it's quiet before ten — then Takeshita-dori's teenage chaos, the calmer back lanes of Ura-Harajuku, and Omotesando's architecture strip. End at Shibuya Crossing at dusk, shop the tower view if you want the panorama, and eat izakaya-style in the alleys behind the station.",
        },
        {
          day: 3,
          theme: "Center: Tsukiji, Ginza & Bayside",
          description:
            "Tsukiji Outer Market for a grazing breakfast (get there by 9am; stalls sell out), then Ginza for department-store food halls and window shopping. Afternoon is your flex slot: teamLab-style digital art, Odaiba's waterfront, or the Imperial Palace gardens. Farewell dinner in Shinjuku's Omoide Yokocho if you have the energy.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Getting around",
        items: [
          "Add a Suica (or your phone's equivalent) on arrival; it covers trains, buses and convenience stores.",
          "Buy point-to-point tickets — a rail pass doesn't pay off for a three-day city stay.",
          "Trains stop near midnight; late dinners mean taxis, which are clean but priced like a luxury.",
        ],
      },
      {
        heading: "Money & timing",
        items: [
          "Budget roughly $120/day mid-range; konbini breakfasts and lunch sets stretch it further.",
          "Cash still matters at small stalls, though IC cards and cards are accepted nearly everywhere else.",
          "Book any ticketed digital-art or themed experience before you fly — they sell out weeks ahead.",
        ],
      },
    ],
    faq: [
      {
        question: "Is 3 days in Tokyo enough?",
        answer:
          "For a first taste, yes — you'll see the essential east and west cores plus the center. You'll skip day trips and most museums. Five days is the more comfortable sweet spot if your route allows it.",
      },
      {
        question: "Should I stay in Asakusa or Shibuya for this itinerary?",
        answer:
          "Either works because day one is east and day two is west. Asakusa suits early risers and tighter budgets; Shibuya or Shinjuku suit nightlife and late dinners. The route reverses cleanly if you stay west.",
      },
      {
        question: "How much does 3 days in Tokyo cost?",
        answer:
          "At our planning estimate of about $120 per day mid-range, expect roughly $360 excluding international flights — less with business hotels and konbini meals, more with tower views and omakase.",
      },
    ],
    relatedDestinationSlugs: ["tokyo", "kyoto", "osaka"],
    relatedTripSlugs: ["tokyo-3d-foodie", "tokyo-2d-highlights", "tokyo-5d-classic"],
    relatedGuideSlugs: ["how-many-days-in-tokyo", "best-area-to-stay-in-tokyo", "tokyo-travel-budget", "best-time-to-visit-tokyo", "tokyo-food-guide"],
    planner: {
      destination: "Tokyo",
      travelStyle: "cultural",
      interests: ["history", "food", "shopping"],
      label: "Turn this 3-day route into your own Tokyo plan",
    },
  },

  // ── 2. Tokyo 5 Day Itinerary ──────────────────────────────────────────
  {
    slug: "tokyo-5-day-itinerary",
    title: "Tokyo 5 Day Itinerary: The Sweet-Spot Plan for First-Timers",
    seoTitle: "Tokyo 5 Day Itinerary: The Sweet-Spot Plan",
    metaDescription:
      "Five days in Tokyo with room to breathe: the classic east–west core, Ginza and bayside, neighborhoods most itineraries skip, and one flex or day-trip day.",
    excerpt:
      "The five-day Tokyo plan we recommend as the baseline: three core days, one neighborhoods day, one flex day — plus the day-trip options if you extend.",
    coverImage: null,
    gradient: "from-pink-500 to-rose-700",
    author: YUKI,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "11 min read",
    tags: ["tokyo", "itinerary", "japan", "5 days"],
    city: "Tokyo",
    country: "Japan",
    introduction: [
      "Five days is the length we recommend for a first Tokyo trip, and the reason is simple: it's the shortest stay where the city stops being a blur. Three days covers the famous core; five adds the neighborhoods, one proper museum day, and the flex day that Tokyo rewards more than almost any city on earth.",
      "This itinerary builds on our 3-day route and adds two days: a slow neighborhoods day (Shimokitazawa, Nakameguro, or Yanaka done properly) and a flex day you can spend on weather, whim, or a first day trip. At roughly $120 a day, plan on about $600 excluding flights.",
    ],
    sections: [
      {
        heading: "Why Five Beats Three (and Seven, Mostly)",
        paragraphs: [
          "Tokyo's transit is excellent, but its size taxes every cross-town move. Three days forces you to sprint; five lets you keep the sprint days but adds depth without exhaustion. Seven is only better if you're committing to Hakone, Nikko, or Kamakura — otherwise the last day drifts. Our honest guide to Tokyo trip length covers the full tradeoff curve.",
        ],
      },
      {
        heading: "The Structure: Core Days First, Flex Day Last",
        paragraphs: [
          "Days one through three follow the proven east–west–center arc from our 3-day itinerary. Day four goes deep on one neighborhood cluster — the day most itineraries skip and the one travelers remember. Day five is deliberately unplanned: it absorbs rain, a discovered festival, a queue that ran long, or a Kamakura dash if the weather is kind.",
        ],
        bullets: [
          "Days 1–3: Asakusa & Ueno → Meiji, Harajuku & Shibuya → Tsukiji, Ginza & bayside.",
          "Day 4: neighborhoods — Shimokitazawa's vintage lanes, Nakameguro's canal cafés, Daikanyama's boutiques.",
          "Day 5: flex — rain-day museums, a discovered market, or the Kamakura coastal day trip.",
        ],
      },
      {
        heading: "Day Trips: When to Bolt One On",
        paragraphs: [
          "With five days, a day trip is possible but costs you the flex day — which is why we recommend deciding on the ground. Hakone is worth it for mountain-and-onsen scenery; Nikko for shrine architecture in cedar forest; Kamakura for a Great Buddha and beach-town feel an hour from Shinjuku. If two day trips tempt you, extend to seven days rather than cramming.",
        ],
      },
    ],
    itinerary: {
      heading: "The 5-Day Baseline, Day by Day",
      intro:
        "Three core days, one neighborhoods day, one flex day. Compress to four by dropping day four; extend to seven by adding Hakone and Nikko.",
      days: [
        {
          day: 1,
          theme: "Old East: Asakusa & Ueno",
          description:
            "Senso-ji before the crowds, Nakamise-dori snacks, then Ueno Park's museums or Yanaka's lanes. Early night — jet lag will schedule your morning anyway.",
        },
        {
          day: 2,
          theme: "Modern West: Meiji to Shibuya",
          description:
            "Meiji Shrine's forest, Harajuku's Takeshita-dori and back lanes, Omotesando architecture, and Shibuya Crossing at dusk. Izakaya dinner behind the station.",
        },
        {
          day: 3,
          theme: "Center: Tsukiji, Ginza & Bayside",
          description:
            "Market-morning grazing at Tsukiji Outer Market, Ginza's department-store basements, then Odaiba waterfront or digital art — or museums if the weather turns.",
        },
        {
          day: 4,
          theme: "Neighborhood Tokyo",
          description:
            "Shimokitazawa's vintage shops and coffee roasters, Nakameguro's riverside cafés, Daikanyama's bookshop-and-boutique blocks. This is the day Tokyo starts to feel like somewhere you've lived.",
        },
        {
          day: 5,
          theme: "Flex Day",
          description:
            "A slow morning where you loved days one to four, then whatever the trip is missing: a Kamakura day trip, the teamLab queue you skipped, a depachika picnic, or souvenir logistics done properly.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Staying efficient",
        items: [
          "Pick a hotel on the Yamanote loop line — Shinjuku, Shibuya, or Ueno — so every day starts one ride from anywhere.",
          "One core area per day beats two; the zig-zag tax is real.",
          "Put ticketed experiences on days three to five, after jet lag releases you.",
        ],
      },
      {
        heading: "Money notes",
        items: [
          "Five days at roughly $120/day lands near $600 excluding flights.",
          "Department-store basement food halls (depachika) are the best cheap-lunch value in Ginza.",
          "Neighborhood days are the cheapest days: cafés, thrift stores, and trains — plan them after any splurge day.",
        ],
      },
    ],
    faq: [
      {
        question: "Is 5 days in Tokyo too long?",
        answer:
          "Not for a first visit — it's the length where the city stops blurring together. You keep the three-day core and add neighborhoods plus a flex day. If you want two day trips, extend to seven instead of cramming.",
      },
      {
        question: "Can I do a day trip from Tokyo in 5 days?",
        answer:
          "Yes, one: Hakone, Nikko, or Kamakura each take a full day. The trade is your flex day, so decide based on weather once you're on the ground.",
      },
      {
        question: "How much does a 5-day Tokyo trip cost?",
        answer:
          "Roughly $600 at our mid-range planning estimate of $120 per day, excluding international flights. Business hotels and konbini breakfasts pull it lower; omakase and tower-view rooms push it up.",
      },
    ],
    relatedDestinationSlugs: ["tokyo", "kyoto", "osaka"],
    relatedTripSlugs: ["tokyo-5d-classic", "tokyo-3d-foodie", "tokyo-family-4d"],
    relatedGuideSlugs: ["tokyo-3-day-itinerary", "how-many-days-in-tokyo", "tokyo-travel-budget", "best-time-to-visit-tokyo", "tokyo-vs-osaka"],
    planner: {
      destination: "Tokyo",
      travelStyle: "cultural",
      interests: ["food", "shopping", "history"],
      label: "Build your own 5-day Tokyo plan",
    },
  },

  // ── 3. Paris 3 Day Itinerary ──────────────────────────────────────────
  {
    slug: "paris-3-day-itinerary",
    title: "Paris 3 Day Itinerary: Classics, Neighborhoods, and One Long Lunch",
    seoTitle: "Paris 3 Day Itinerary: The First-Timer's Plan",
    metaDescription:
      "A walkable 3 day Paris itinerary: Louvre and the islands, Montmartre and the Marais, and one Seine-side day — with museum timing and budget realism.",
    excerpt:
      "Three days of Paris arranged by arrondissement, not by checklist — museum mornings, neighborhood afternoons, and the specific order that beats the queues.",
    coverImage: null,
    gradient: "from-indigo-500 to-pink-600",
    author: SOFIA,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "9 min read",
    tags: ["paris", "itinerary", "france", "3 days"],
    city: "Paris",
    country: "France",
    introduction: [
      "Paris rewards the walker and punishes the checklist. Three days is enough for the essential core — the Louvre, Notre-Dame's setting on the Île de la Cité, Montmartre, the Eiffel Tower — but only if you group days by district instead of criss-crossing the river for single sights.",
      "This itinerary keeps everything inside a Métro ride or a long walk: museum mornings (timed entry is everything), neighborhood afternoons, and dinners booked in advance for at least two of the three nights. At our planning estimate of about €150 a day, budget roughly €450 for three days excluding flights.",
    ],
    sections: [
      {
        heading: "The Order That Beats the Crowds",
        paragraphs: [
          "Paris's big three — the Louvre, the Eiffel Tower, Versailles — all have queue cultures that punish improvisation. The fix is boring and effective: timed-entry tickets bought ahead, big museums first thing in the morning, and the tower at sunset from Trocadéro instead of from its own queue.",
        ],
        bullets: [
          "Book the Louvre's first-entry slot (9am) — galleries empty out for the first ninety minutes.",
          "See the Eiffel Tower from Trocadéro or Champ de Mars; ascend only if the sky is clear.",
          "Leave Versailles out of a 3-day trip — it costs a full day and competes with Paris itself.",
        ],
      },
      {
        heading: "Eat Like It Matters (It Does)",
        paragraphs: [
          "In Paris the meal is a sight. One long lunch belongs in any three-day plan — a classic bistro with a fixed-price formule, two hours minimum. Book dinners two or three nights ahead in Saint-Germain or the Marais; bakery breakfasts from a different boulangerie each morning double as a self-guided tour.",
        ],
      },
      {
        heading: "What Three Days Skips",
        paragraphs: [
          "Versailles, Disneyland, the Musée d'Orsay and the Louvre in the same trip (choose one and do it well), and day trips to Giverny. Three days is Paris-the-city. If Versailles or Monet's gardens is the reason you're going, cut a neighborhood day and make room — our how-many-days-in-Paris guide runs the math.",
        ],
      },
    ],
    itinerary: {
      heading: "Your 3 Days in Paris, Day by Day",
      intro:
        "River islands and the Louvre first, hills and villages second, grand-axis Paris last. Every day is walkable with one or two Métro hops.",
      days: [
        {
          day: 1,
          theme: "The Islands & the Louvre",
          description:
            "Louvre at 9am with timed entry (pick two wings, not all of them), then cross to the Île de la Cité for Sainte-Chapelle's stained glass and the Notre-Dame parvis. Afternoon on the Left Bank: Shakespeare and Company, the Latin Quarter's lanes, dinner in Saint-Germain.",
        },
        {
          day: 2,
          theme: "Montmartre & the Marais",
          description:
            "Morning up in Montmartre — Sacré-Cœur before the tour buses, then the butte's back lanes and Place du Tertre's portraitists. Afternoon in the Marais: Place des Vosges, vintage shops, falafel on Rue des Rosiers, and the Picasso museum if it's raining. Marais bistro for dinner.",
        },
        {
          day: 3,
          theme: "The Grand Axis",
          description:
            "Tuileries gardens to Place de la Concorde, up the Champs-Élysées or through the Trocadéro gardens, and the Eiffel Tower at golden hour from Champ de Mars. Long farewell lunch instead of a big dinner — then the Seine at night from a pont, which is free and better than most paid attractions.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Getting around",
        items: [
          "Buy a carnet of Métro tickets or tap a contactless card at the gates — Paris's system takes both.",
          "The center is genuinely walkable: never more than 30 minutes between these stops.",
          "Skip driving; parking ruins days. Taxis and ride-hails for late nights only.",
        ],
      },
      {
        heading: "Booking windows",
        items: [
          "Louvre, Sainte-Chapelle and any tower ascent: timed tickets online, days or weeks ahead.",
          "Dinners: reserve two nights ahead minimum, especially Thursday to Saturday.",
          "April–June and September–October are ideal; August means locals leave and some bistros close.",
        ],
      },
    ],
    faq: [
      {
        question: "Is 3 days enough for Paris?",
        answer:
          "Yes for the city itself — the islands, the Louvre, Montmartre, the Marais and the grand axis. It's not enough for Versailles plus everything above; either drop Versailles or add a fourth day.",
      },
      {
        question: "How much does 3 days in Paris cost?",
        answer:
          "Around €450 mid-range at our planning estimate of €150 per day, excluding flights. Bakeries, Métro carnets and fixed-price lunch formules stretch it; Michelin dinners raise it fast.",
      },
      {
        question: "Should I visit the Louvre or Musée d'Orsay with only 3 days?",
        answer:
          "Pick one and do it well. First-timers usually want the Louvre; art lovers short on time often prefer d'Orsay's manageable size and Impressionist floor. Doing both properly costs most of two days.",
      },
    ],
    relatedDestinationSlugs: ["paris", "london", "rome"],
    relatedTripSlugs: ["paris-weekend", "paris-3d-classic", "paris-5d-art-food"],
    relatedGuideSlugs: ["how-many-days-in-paris", "paris-travel-budget", "best-areas-to-stay-in-paris", "best-time-to-visit-paris", "paris-vs-london"],
    planner: {
      destination: "Paris",
      travelStyle: "cultural",
      interests: ["museums", "food", "history"],
      label: "Generate your own Paris itinerary",
    },
  },

  // ── 4. Paris 5 Day Itinerary ──────────────────────────────────────────
  {
    slug: "paris-5-day-itinerary",
    title: "Paris 5 Day Itinerary: The Classic Core Plus Versailles and Depth",
    seoTitle: "Paris 5 Day Itinerary: Core + Versailles",
    metaDescription:
      "Five days in Paris: the three-day classic core, a full Versailles day, and a museums-and-villages day — arranged to avoid the worst queues.",
    excerpt:
      "The five-day Paris plan: our 3-day core, one full day at Versailles, and a slower fifth day in the museums and villages tourists skip.",
    coverImage: null,
    gradient: "from-purple-500 to-pink-600",
    author: SOFIA,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "10 min read",
    tags: ["paris", "itinerary", "france", "5 days"],
    city: "Paris",
    country: "France",
    introduction: [
      "Five days is where Paris trips stop feeling like evacuations. The first three days cover the classic core from our 3-day itinerary; day four belongs to Versailles as a full, unhurried excursion; day five is the reward — a slower Paris of museums, covered passages, and canal-side afternoons.",
      "Versailles is the reason to extend from three to five days: it's a full-day commitment (the palace, the gardens, and the Trianon estate are three sites on one ticket), and trying to bolt it onto a three-day trip is how people end up seeing neither well.",
    ],
    sections: [
      {
        heading: "Versailles Without the Misery",
        paragraphs: [
          "The palace's Hall of Mirrors funnels tens of thousands of visitors a day into one corridor, so the strategy is simple: take the first timed-entry slot, do the palace in the first two hours, then spend the rest of the day in the gardens and the Trianon palaces, where crowds thin to almost nothing. Rent a rowboat on the Grand Canal or bike the estate's perimeter.",
        ],
        bullets: [
          "RER C from central Paris to Versailles Château — about 40 minutes each way.",
          "First entry slot + passport ticket (all three estates) is the only version worth doing in a day.",
          "Closed Mondays — plan around it.",
        ],
      },
      {
        heading: "The Fifth Day: Paris at Local Speed",
        paragraphs: [
          "Day five is deliberately soft: the Musée d'Orsay if you skipped it, the covered passages of the 2nd arrondissement, a Canal Saint-Martin walk, and shopping in Le Marais or Saint-Germain. It's also your weather-buffer day — whatever rained out earlier gets rescued here.",
        ],
      },
      {
        heading: "When Five Isn't Enough",
        paragraphs: [
          "If you want Giverny, Mont Saint-Michel, or the Loire châteaux added, those are overnight or very long day trips — see them properly by extending to a week or basing a second leg elsewhere. Five days is Paris plus one excursion; two excursions starts stealing from the city that you came for.",
        ],
      },
    ],
    itinerary: {
      heading: "The 5-Day Shape",
      intro:
        "Classic core (days 1–3, same arc as our 3-day plan), Versailles day four, soft-landing day five.",
      days: [
        {
          day: 1,
          theme: "Islands & Louvre",
          description:
            "First-entry Louvre, then Sainte-Chapelle and the Île de la Cité, Latin Quarter afternoon, Saint-Germain dinner.",
        },
        {
          day: 2,
          theme: "Montmartre & Marais",
          description:
            "Sacré-Cœur early, Montmartre lanes, then Place des Vosges and the Marais shops. Bistro dinner.",
        },
        {
          day: 3,
          theme: "Grand Axis & Eiffel",
          description:
            "Tuileries to Champs-Élysées, Trocadéro gardens, Eiffel Tower at golden hour from Champ de Mars.",
        },
        {
          day: 4,
          theme: "Versailles, All Day",
          description:
            "First RER C train out, palace at opening, then gardens, Trianon, and a rowboat or bike loop. Return for a simple dinner near your hotel — you'll be footsore.",
        },
        {
          day: 5,
          theme: "Museums & Villages",
          description:
            "Musée d'Orsay's Impressionists, the covered passages, Canal Saint-Martin's iron footbridges, and a last pâtisserie crawl through Saint-Germain.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Versailles logistics",
        items: [
          "Buy the passport ticket online in advance; same-day queues can eat an hour or more.",
          "Gardens are free most days but the musical fountains days cost extra — check the calendar.",
          "Pack water and picnic supplies; on-site food is priced for captives.",
        ],
      },
      {
        heading: "Budget shape",
        items: [
          "Five days at roughly €150/day lands near €750 excluding flights and Versailles tickets.",
          "One splurge dinner and one picnic dinner balances a five-day budget nicely.",
          "Museum-lovers should price the Paris Museum Pass against individual timed tickets for their actual plan.",
        ],
      },
    ],
    faq: [
      {
        question: "Is Versailles worth a full day?",
        answer:
          "Yes — the palace is two hours, but the gardens and Trianon estate are half the experience. A rushed half-day Versailles trip is the most common regret we hear from short Paris itineraries.",
      },
      {
        question: "5 days in Paris or 3 days plus another city?",
        answer:
          "Both work. Five days suits a slower, deeper Paris; three days plus London or Amsterdam suits first-time Europe trips on a schedule. Our Paris vs London comparison covers the split decision.",
      },
      {
        question: "How much does 5 days in Paris cost?",
        answer:
          "About €750 mid-range at our €150/day planning estimate, excluding flights — plus roughly €30–35 for the Versailles passport ticket.",
      },
    ],
    relatedDestinationSlugs: ["paris", "london", "rome"],
    relatedTripSlugs: ["paris-5d-art-food", "paris-3d-classic", "paris-weekend"],
    relatedGuideSlugs: ["paris-3-day-itinerary", "paris-travel-budget", "best-areas-to-stay-in-paris", "rome-vs-paris", "best-time-to-visit-paris"],
    planner: {
      destination: "Paris",
      travelStyle: "cultural",
      interests: ["museums", "food", "history"],
      label: "Plan your 5-day Paris trip with AI",
    },
  },

  // ── 5. Paris Weekend Itinerary ────────────────────────────────────────
  {
    slug: "paris-weekend-itinerary",
    title: "Paris Weekend Itinerary: 48 Hours Done Right",
    seoTitle: "Paris Weekend Itinerary: 48 Hours Done Right",
    metaDescription:
      "A 48-hour Paris weekend: one museum, two neighborhoods, the Seine at sunset and a dinner worth the train — with realistic pacing for a short stay.",
    excerpt:
      "Two days, one museum, two neighborhoods, zero panic: the Paris weekend that leaves you rested instead of needing a holiday.",
    coverImage: null,
    gradient: "from-rose-500 to-indigo-700",
    author: SOFIA,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "7 min read",
    tags: ["paris", "itinerary", "weekend", "france"],
    city: "Paris",
    country: "France",
    introduction: [
      "A Paris weekend fails by overstuffing. The Eurostar from London and the TGV from Brussels land you before lunch, and the temptation is to cram the Louvre, the tower, Montmartre and Versailles into 48 hours — which turns Paris into a queue-connecting exercise. The weekend that works does less, better.",
      "The plan: one museum, one hilltop neighborhood, one grand riverside walk, and two proper dinners. Everything else is a bonus. At roughly €150 a day, a two-day weekend runs about €300 excluding transport — see our Paris budget guide for where it goes.",
    ],
    sections: [
      {
        heading: "The One-Museum Rule",
        paragraphs: [
          "With 48 hours you get one museum, chosen honestly. The Louvre if it's your first Paris visit and you book the 9am slot; the Musée d'Orsay if you value a manageable two-hour visit; the Musée de l'Orangerie if you want Monet's Water Lilies and out by lunch. Doing two museums in a weekend costs you a neighborhood — a bad trade.",
        ],
      },
      {
        heading: "Two Evenings, Two Moods",
        paragraphs: [
          "Book Friday or Saturday dinner in advance — this is not the city for walk-ins on weekends. One classic bistro in Saint-Germain, one livelier Marais or Canal Saint-Martin spot, and an after-dinner walk along the Seine, which at night is the best free attraction in Europe.",
        ],
      },
      {
        heading: "The Save-It-For-Next-Time List",
        paragraphs: [
          "Versailles, Disneyland, Montmartre plus the Louvre in one day, and any itinerary requiring more than four Métro rides a day. A weekend that ends with a list of what's next is a successful weekend — Paris is a relationship, not a transaction.",
        ],
      },
    ],
    itinerary: {
      heading: "48 Hours, Hour by Hour-ish",
      intro:
        "Arrive before noon if you can; leave late Sunday. One anchor per half-day, everything walkable from the center.",
      days: [
        {
          day: 1,
          theme: "Islands, Marais & Golden Hour",
          description:
            "Drop bags, coffee on the Île Saint-Louis, Sainte-Chapelle's glass, and a Marais afternoon — Place des Vosges, Rue des Rosiers, the Carnavalet's free city-history galleries. Sunset from Pont Alexandre III, dinner booked in the Marais or Saint-Germain.",
        },
        {
          day: 2,
          theme: "One Museum, Montmartre & Farewell",
          description:
            "Museum at opening, a long bistro lunch (this is the meal the weekend was built around), then Montmartre late afternoon — Sacré-Cœur, the lanes, the view. Or invert it: Montmartre at opening, museum after lunch. Leave from Gare du Nord or Lyon with a paper bag of croissants.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Weekend logistics",
        items: [
          "Stay central — Saint-Germain, the Marais or near your arrival station — so nothing needs a transfer.",
          "Métro single tickets or a carnet; you'll ride four times a day at most.",
          "Sunday: many shops close, but museums, cafés and the Marais largely stay open.",
        ],
      },
      {
        heading: "Booking ahead",
        items: [
          "One museum timed ticket and two dinner reservations are the entire advance-planning load.",
          "Eurostar/TGV fares climb inside two weeks — book the train before the hotel.",
        ],
      },
    ],
    faq: [
      {
        question: "Is a weekend in Paris enough?",
        answer:
          "For a first taste, yes — one museum, two neighborhoods, and the Seine done properly beats a week of checklist fatigue. You'll leave with a short list for next time, which is the point.",
      },
      {
        question: "What should I skip on a Paris weekend?",
        answer:
          "Versailles, Disneyland, and any plan requiring more than four Métro rides a day. Pick one museum and two neighborhoods; Paris rewards depth over coverage.",
      },
      {
        question: "How much does a Paris weekend cost?",
        answer:
          "Around €360 mid-range for two days at our €150/day estimate, excluding rail fares. Bakeries, picnic lunches and free riverbanks keep it lower without feeling cheap.",
      },
    ],
    relatedDestinationSlugs: ["paris", "london", "amsterdam"],
    relatedTripSlugs: ["paris-weekend", "paris-3d-classic", "paris-food-3d"],
    relatedGuideSlugs: ["paris-3-day-itinerary", "paris-travel-budget", "paris-vs-london", "new-york-weekend-guide-2026", "best-areas-to-stay-in-paris"],
    planner: {
      destination: "Paris",
      travelStyle: "cultural",
      interests: ["food", "museums"],
      label: "Generate your Paris weekend plan",
    },
  },

  // ── 6. Seoul 3 Day Itinerary ──────────────────────────────────────────
  {
    slug: "seoul-3-day-itinerary",
    title: "Seoul 3 Day Itinerary: Palaces, Neon and the Best Food Value in Asia",
    seoTitle: "Seoul 3 Day Itinerary: Palaces to Neon",
    metaDescription:
      "A 3 day Seoul itinerary: Gyeongbokgung and Bukchon, Hongdae and Itaewon nightlife, Gangnam and the Han River — with KTX, T-money and budget notes.",
    excerpt:
      "Three days across Seoul's three personalities — royal, hip, and glittering — plus the street-food trail that ties them together.",
    coverImage: null,
    gradient: "from-fuchsia-500 to-purple-700",
    author: MARCUS,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "9 min read",
    tags: ["seoul", "itinerary", "korea", "3 days"],
    city: "Seoul",
    country: "South Korea",
    introduction: [
      "Seoul runs three parallel cities: the royal one of palaces and hanok lanes, the young one of Hongdae buskers and Itaewon kitchens, and the corporate one of Gangnam towers and Han River parks. Three days gives you one day of each — and Seoul's superb subway makes the geometry work.",
      "The city is also the best food value in East Asia: Michelin-level buns for pocket change, BBQ done table-side, and a café culture that borders on competitive sport. At our planning estimate of about $90 a day, three days runs roughly $270 excluding flights.",
    ],
    sections: [
      {
        heading: "Palace Day, Done in the Right Order",
        paragraphs: [
          "Start at Gyeongbokgung at opening to catch the changing-of-the-guard ceremony, rent a hanbok nearby (palace entry is free in hanbok) and walk Bukchon's hanok lanes before they fill. Lunch in Ikseon-dong's remodeled hanok alleys — the neighborhood is Seoul's best café district — and end at Insadong for souvenirs and tea.",
        ],
      },
      {
        heading: "The Youth Districts",
        paragraphs: [
          "Hongdae owns the evening: street performers from dusk, shopping in the afternoon, and BBQ dinner where the staff grills for you. Itaewon is the alternative — global food, rooftop bars, and the best people-watching in the city. Pick one per night; they don't mix well in a single evening.",
        ],
      },
      {
        heading: "Gangnam & the River",
        paragraphs: [
          "Day three goes south: COEX's giant library, Bongeunsa temple's contrast with the towers, and Lotus-core shopping if that's your thing. The essential finish is the Han River at sunset — convenience-store ramyeon and fried chicken by the water at Ttukseom or Yeouido is a local ritual worth adopting.",
        ],
      },
    ],
    itinerary: {
      heading: "Your 3 Days in Seoul",
      intro:
        "Royal Seoul first, youth districts second, Gangnam and the river third. The subway's Line 3 and Line 2 do most of the work.",
      days: [
        {
          day: 1,
          theme: "Royal Seoul",
          description:
            "Gyeongbokgung at opening, guard ceremony, hanbok walk through Bukchon, lunch and cafés in Ikseon-dong, Insadong tea houses, and N Seoul Tower if the sky is clear.",
        },
        {
          day: 2,
          theme: "Hongdae / Itaewon",
          description:
            "Slow morning, afternoon shopping in Hongdae, street-food dinner (tteokbokki, hotteok, fried chicken), busking shows from dusk — or swap the whole day to Itaewon for food-hall lunches and rooftop bars.",
        },
        {
          day: 3,
          theme: "Gangnam & the Han",
          description:
            "COEX Starfield Library, Bongeunsa temple, Gangnam lunch, then Ttukseom or Yeouido Hangang Park at sunset with convenience-store supplies and delivered chicken.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Getting around",
        items: [
          "Buy a T-money card at any convenience store; it works on subway, buses and taxis.",
          "The subway is signposted in English and spotless — you will not need a car.",
          "Taxis are metered, cheap and safe; use them after midnight when trains thin out.",
        ],
      },
      {
        heading: "Money & etiquette",
        items: [
          "About $90/day mid-range; BBQ dinners for two often cost less than one Western entrée.",
          "Cards are accepted nearly everywhere, but markets and street food are cash/T-money territory.",
          "Tipping isn't customary; side dishes (banchan) are free and refillable.",
        ],
      },
    ],
    faq: [
      {
        question: "Is 3 days in Seoul enough?",
        answer:
          "It covers the three Seouls — palaces, youth districts, Gangnam — comfortably. Add a fourth for a DMZ tour or a day trip to Suwon or Incheon; our Seoul 4-day itinerary shows how.",
      },
      {
        question: "Do I need a hanbok for the palaces?",
        answer:
          "No, but renting one waives palace entry fees and makes the photos — dozens of rental shops cluster near Gyeongbokgung, and the process takes ten minutes.",
      },
      {
        question: "How much does 3 days in Seoul cost?",
        answer:
          "Roughly $300 mid-range at our $100/day estimate, excluding flights and the DMZ tour. Street food, BBQ and the subway keep Seoul one of Asia's best-value capitals.",
      },
    ],
    relatedDestinationSlugs: ["seoul", "busan", "tokyo"],
    relatedTripSlugs: ["seoul-3d-classic", "seoul-4d-deep-dive", "seoul-food-3d"],
    relatedGuideSlugs: ["how-many-days-in-seoul", "seoul-travel-budget", "seoul-food-guide", "best-time-to-visit-seoul", "seoul-vs-tokyo"],
    planner: {
      destination: "Seoul",
      travelStyle: "foodie",
      interests: ["food", "history", "nightlife"],
      label: "Build your Seoul itinerary with AI",
    },
  },

  // ── 7. Seoul 4 Day Itinerary ──────────────────────────────────────────
  {
    slug: "seoul-4-day-itinerary",
    title: "Seoul 4 Day Itinerary: The Classic Three Plus a Deep-Dive Day",
    seoTitle: "Seoul 4 Day Itinerary: Add the Deep Dive",
    metaDescription:
      "Four days in Seoul: the palace-and-Hongdae core, then a fourth day choosing between the DMZ, Suwon's fortress, or Seoul's own museums and markets.",
    excerpt:
      "The 4-day Seoul plan: our 3-day core plus one deep-dive day — DMZ, Suwon, or the museums and markets most itineraries skip.",
    coverImage: null,
    gradient: "from-purple-500 to-fuchsia-600",
    author: MARCUS,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "8 min read",
    tags: ["seoul", "itinerary", "korea", "4 days"],
    city: "Seoul",
    country: "South Korea",
    introduction: [
      "The fourth Seoul day is a fork, and the right branch depends on what you came for. History-first travelers book the DMZ tour; culture-first travelers ride to Suwon's UNESCO-listed Hwaseong Fortress; everyone else spends the day on Seoul's own underrated museums, markets and mountains — Bukhansan's granite peaks sit inside the city limits.",
      "The first three days follow our Seoul 3-day itinerary exactly; this guide is about spending the fourth well. Budget runs to about $400 for four days at our $100/day planning estimate.",
    ],
    sections: [
      {
        heading: "Option A: The DMZ",
        paragraphs: [
          "The half-day or full-day tours from Seoul are the only way civilians see the Joint Security Area, and they sell out — book a week or more ahead and bring your passport. It's a sobering, structured experience rather than a sightseeing day, and for many visitors it's the most memorable hours of the trip.",
        ],
      },
      {
        heading: "Option B: Suwon & the Fortress",
        paragraphs: [
          "One hour by subway or KTX, Hwaseong Fortress walls walk the ridgeline above a city of street food and royal-market energy. Fewer foreign tourists than the palaces, a proper wall-walk with archer posts and secret gates, and a galbi-town reputation that predates the fortress's UNESCO listing.",
        ],
      },
      {
        heading: "Option C: Seoul Deeper",
        paragraphs: [
          "The underrated in-city day: the National Museum of Korea (world-class, free), Mangwon or Gwangjang markets, a hike up Namsan or Inwangsan's fortress-wall ridge, and a jjimjilbang (Korean bathhouse) finish — the experience that turns tired legs into new ones.",
        ],
      },
    ],
    itinerary: {
      heading: "Day Four, Three Ways",
      intro:
        "Pick one option — or split the day: DMZ tours run mornings, leaving afternoons for markets and the river.",
      days: [
        {
          day: 4,
          theme: "DMZ / Suwon / Deep Seoul",
          description:
            "Option A: pre-booked DMZ tour, then a Gwangjang Market evening with bindaetteok and mayak gimbap. Option B: Hwaseong Fortress wall-walk in Suwon, galbi dinner, home by evening. Option C: National Museum, Mangwon Market, Inwangsan ridge at golden hour, jjimjilbang finish.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Booking ahead",
        items: [
          "DMZ tours: book 1–2 weeks out, passport details required, bring it on the day.",
          "Suwon: no booking needed — just a T-money card and an hour of transit.",
          "Jjimjilbangs are single-sex bathing with communal areas; day passes run ₩8,000–15,000.",
        ],
      },
      {
        heading: "Pacing note",
        items: [
          "Put the deep-dive day last — by day four you'll navigate Seoul like a local.",
          "Keep dinner flexible; Korean meals run long and social, and the best ones are unplanned.",
        ],
      },
    ],
    faq: [
      {
        question: "Is 4 days in Seoul better than 3?",
        answer:
          "The third day covers the essentials; the fourth is where you pick a deep-dive — DMZ, Suwon, or the city's museums and mountains. If any of those is why you're going, book four days.",
      },
      {
        question: "Can you visit the DMZ on your own?",
        answer:
          "No — access requires a licensed guided tour, and JSA visits have periodic suspensions. Book with a reputable operator well in advance and carry your passport.",
      },
      {
        question: "How much does 4 days in Seoul cost?",
        answer:
          "About $400 at our $100/day planning estimate, excluding flights — plus DMZ tour fees if you choose that option.",
      },
    ],
    relatedDestinationSlugs: ["seoul", "busan", "tokyo"],
    relatedTripSlugs: ["seoul-4d-deep-dive", "seoul-3d-classic", "seoul-shopping-2d"],
    relatedGuideSlugs: ["seoul-3-day-itinerary", "how-many-days-in-seoul", "seoul-food-guide", "seoul-travel-budget", "best-time-to-visit-seoul"],
    planner: {
      destination: "Seoul",
      travelStyle: "cultural",
      interests: ["history", "food"],
      label: "Generate your 4-day Seoul plan",
    },
  },

  // ── 8. Singapore 3 Day Itinerary ──────────────────────────────────────
  {
    slug: "singapore-3-day-itinerary",
    title: "Singapore 3 Day Itinerary: Hawker Centers, Gardens and Skyline",
    seoTitle: "Singapore 3 Day Itinerary: Hawkers to Skyline",
    metaDescription:
      "A 3 day Singapore itinerary: Marina Bay and Gardens by the Bay, hawker culture across the districts, and Sentosa or the neighborhoods — heat-managed hour by hour.",
    excerpt:
      "Three days in Singapore arranged around the heat: air-conditioned middays, hawker dinners, and the gardens and skyline at their photogenic hours.",
    coverImage: null,
    gradient: "from-emerald-500 to-green-700",
    author: MARCUS,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "8 min read",
    tags: ["singapore", "itinerary", "3 days"],
    city: "Singapore",
    country: "Singapore",
    introduction: [
      "Singapore is a planner's city and a heat problem. The equatorial sun dictates the schedule: outdoor sights before 11am and after 4pm, museums and malls through the furnace hours, and hawker dinners in open-air courts once the breeze returns. Build your three days around that rhythm and the city is effortless.",
      "Food is the real attraction — hawker centers hold Michelin-starred chicken rice and $3 noodles side by side — and this itinerary treats every meal as a scheduled sight. At our planning estimate of about S$180 a day, three days runs roughly S$540 excluding flights.",
    ],
    sections: [
      {
        heading: "Marina Bay, Both Daylight and Dark",
        paragraphs: [
          "Gardens by the Bay's Supertrees and conservatories bookend perfectly: gardens at 9am before the heat, the cooled Cloud Forest at midday, and the free Garden Rhapsody light show at the Supertrees after dark. Marina Bay Sands' skypark or the Merlo garden walk fills the afternoon.",
        ],
      },
      {
        heading: "The Hawker Curriculum",
        paragraphs: [
          "One hawker center per meal is the right dose: Maxwell Road for Tian Tian chicken rice, Lau Pa Sat's satay street for dinner under the towers, Old Airport Road for char kway teow and Hokkien mee. Queue wherever the aunties queue — it's the only reliable rating system.",
        ],
      },
      {
        heading: "Neighborhoods vs Sentosa",
        paragraphs: [
          "Day three is the fork: Sentosa for beaches and Universal if you're traveling with kids; Kampong Glam, Little India and Chinatown if you're not. The neighborhood route costs almost nothing and delivers Singapore's best street art, temples and spice-shop lanes — Sentosa costs theme-park money.",
        ],
      },
    ],
    itinerary: {
      heading: "Your 3 Days in Singapore",
      intro:
        "Bay first, food districts second, and the Sentosa-or-neighborhoods fork third. The MRT handles everything; the heat decides the order.",
      days: [
        {
          day: 1,
          theme: "Marina Bay & Gardens",
          description:
            "Gardens by the Bay outdoors at 9am, Cloud Forest conservatory at midday, Merlion and the bay walk late afternoon, Garden Rhapsody light show at 7:45pm, satay dinner at Lau Pa Sat.",
        },
        {
          day: 2,
          theme: "Hawker Culture & Civic Core",
          description:
            "Maxwell Road hawker lunch, Chinatown's temples and shophouses, Fort Canning or the National Gallery through the hot hours, Clarke Quay riverside for sunset, and a riverside or Chinatown dinner.",
        },
        {
          day: 3,
          theme: "Sentosa or the Neighborhoods",
          description:
            "Families: Sentosa beaches, cable car, Universal if committed. Everyone else: Sultan Mosque and Haji Lane's murals in Kampong Glam, Little India's temples and spice lanes, and a final hawker dinner at Old Airport Road or Newton.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Getting around",
        items: [
          "Tap in with a contactless card on the MRT — Singapore's system takes foreign cards directly.",
          "Everything in this plan is one MRT transfer from anywhere you're likely to stay.",
          "Underground links connect downtown hotels to malls — use them between 12 and 3pm.",
        ],
      },
      {
        heading: "Heat & money",
        items: [
          "About S$180/day mid-range; hawker meals at S$4–8 are the great budget equalizer.",
          "Alcohol is heavily taxed — happy hours and hawker beer keep evenings affordable.",
          "Carry a light rain shell; equatorial downpours pass in twenty minutes.",
        ],
      },
    ],
    faq: [
      {
        question: "Is 3 days enough for Singapore?",
        answer:
          "Yes — Singapore is compact and this plan covers the bay, the food districts, and either Sentosa or the heritage neighborhoods. A fourth day usually means Universal Studios or a Malaysia side trip.",
      },
      {
        question: "Is Singapore expensive for tourists?",
        answer:
          "Accommodation and alcohol are pricey; food and transit are not. Hawker meals at $3–6 and tap-in MRT fares make daily costs manageable — our Singapore budget guide has the full picture.",
      },
      {
        question: "What's the best month for this itinerary?",
        answer:
          "February to April tends to be drier, but Singapore is hot and showery year-round — the itinerary's heat-managed schedule works in any month.",
      },
    ],
    relatedDestinationSlugs: ["singapore", "kuala-lumpur", "bali"],
    relatedTripSlugs: ["singapore-garden-city", "singapore-3d-family", "singapore-gp-2026"],
    relatedGuideSlugs: ["how-many-days-in-singapore", "singapore-travel-budget", "best-area-to-stay-in-singapore", "best-time-to-visit-singapore", "is-singapore-expensive"],
    planner: {
      destination: "Singapore",
      travelStyle: "foodie",
      interests: ["food", "museums", "shopping"],
      label: "Generate your Singapore itinerary",
    },
  },

  // ── 9. Japan 7 Day Itinerary ──────────────────────────────────────────
  {
    slug: "japan-7-day-itinerary",
    title: "Japan 7 Day Itinerary: The Golden Route Without the Guilt",
    seoTitle: "Japan 7 Day Itinerary: The Golden Route",
    metaDescription:
      "The classic 7 day Japan itinerary — Tokyo, Hakone, Kyoto and Osaka on the Golden Route — with Shinkansen logistics, pacing and per-day costs.",
    excerpt:
      "Tokyo, Hakone, Kyoto, Osaka in one week: the Golden Route paced so you actually remember it — with train logistics and the two-night minimums that matter.",
    coverImage: null,
    gradient: "from-red-500 to-pink-700",
    author: YUKI,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "11 min read",
    tags: ["japan", "itinerary", "golden route", "7 days"],
    city: "Tokyo",
    country: "Japan",
    introduction: [
      "Seven days is the classic Japan trip length, and the classic route — Tokyo, Hakone, Kyoto, Osaka — is classic for a reason: it strings the country's essential experiences along one Shinkansen corridor with almost no backtracking. The failure mode isn't the route; it's pacing it like a bullet train.",
      "The plan below spends two nights minimum everywhere (one-night stays are how Japan trips dissolve into luggage management) and gives Tokyo the three nights it deserves. Budget at our planning figures: Tokyo ~$120/day, Kyoto ~$140/day, Osaka ~$110/day — call it $950 for the week excluding flights.",
    ],
    sections: [
      {
        heading: "The Route and Why It Holds",
        paragraphs: [
          "Fly into Tokyo, out of Osaka (or back to Tokyo if fares demand it). Tokyo three nights covers the east–west core; a Hakone overnight adds mountain air and an onsen ryokan between megacities; Kyoto two nights handles the temples; Osaka one or two nights closes with street food and neon. Total Shinkansen time is under four hours across the whole week.",
        ],
        bullets: [
          "Nights 1–3: Tokyo (Asakusa/Ueno day, Shibuya/Shinjuku day, Ginza/bayside or day trip).",
          "Night 4: Hakone ryokan — onsen, kaiseki dinner, Fuji views if the clouds cooperate.",
          "Nights 5–6: Kyoto — Fushimi Inari at dawn, Arashiyama, Higashiyama's temple lanes.",
          "Night 7: Osaka — Dotonbori, Osaka Castle, and the best street food in the country.",
        ],
      },
      {
        heading: "Rail Passes: Do the Math First",
        paragraphs: [
          "The nationwide JR Pass repriced sharply upward in recent years and no longer pays off on a pure Golden Route week — point-to-point tickets (Tokyo–Odawara, Odawara–Kyoto, Kyoto–Osaka) total far less. Regional passes can win if you add Hiroshima or Kanazawa; price your actual itinerary before buying anything.",
        ],
      },
      {
        heading: "What Gets Cut at Seven Days",
        paragraphs: [
          "Hiroshima, Nara (doable as a half-day from Kyoto if you move fast), Kanazawa, the Alps, and any of Kyushu or Shikoku. Seven days is one corridor of Japan done well. Ten days unlocks Hiroshima and Nara properly — our Japan 10-day itinerary picks up where this one ends.",
        ],
      },
    ],
    itinerary: {
      heading: "7 Days, City by City",
      intro:
        "Tokyo base → Hakone ryokan → Kyoto base → Osaka finale. Pack light: you'll change hotels three times, and coin lockers solve the intermediate days.",
      days: [
        {
          day: 1,
          theme: "Tokyo — arrive east",
          description:
            "Land, train in, and keep it low-stakes: Asakusa's lantern-lit streets, Senso-ji at dusk, early izakaya dinner. Jet lag will hand you a dawn.",
        },
        {
          day: 2,
          theme: "Tokyo — modern west",
          description:
            "Meiji Shrine's forest, Harajuku and Omotesando, Shibuya Crossing at dusk, neon and dinner in Shinjuku.",
        },
        {
          day: 3,
          theme: "Tokyo — center or day trip",
          description:
            "Tsukiji Outer Market breakfast, Ginza, then Odaiba or museums — or a Kamakura dash if the weather is clear and the crowds don't scare you.",
        },
        {
          day: 4,
          theme: "Hakone — onsen night",
          description:
            "Morning Romancecar or Shinkansen to Odawara, the Hakone loop's pirate ship and ropeway, then check into a ryokan: kaiseki dinner, onsen, and tomorrow's Fuji from the open-air bath.",
        },
        {
          day: 5,
          theme: "To Kyoto — Higashiyama dusk",
          description:
            "Late-morning Shinkansen to Kyoto, drop bags, and walk Higashiyama's preserved lanes — Yasaka Shrine to Kiyomizu-dera — in the golden hour. Gion dinner.",
        },
        {
          day: 6,
          theme: "Kyoto — dawn torii to bamboo",
          description:
            "Fushimi Inari at 7am (empty, magic), Arashiyama's bamboo grove and riverbank by late morning, and the Philosopher's Path or Nishiki Market in the afternoon.",
        },
        {
          day: 7,
          theme: "Osaka — finale",
          description:
            "Short train to Osaka, Osaka Castle's grounds, then Dotonbori: takoyaki, okonomiyaki, the Glico running man, and a farewell night that runs late.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Trains & luggage",
        items: [
          "Book Tokyo–Odawara and Odawara–Kyoto Shinkansen seats ahead in peak seasons (sakura, Golden Week, foliage).",
          "Ship luggage between hotels with takkyubin (¥2,000–2,500 per bag) — it's why Japanese travelers pack light.",
          "IC cards (Suica/ICOCA) cover all city transit; buy Shinkansen tickets separately.",
        ],
      },
      {
        heading: "Budget shape",
        items: [
          "Roughly $950 for the week at planning figures, excluding international flights.",
          "The Hakone ryokan night is the splurge — ¥30,000–50,000 for two with dinner; a business-hotel alternative halves it.",
          "Point-to-point rail beats the nationwide JR Pass on this route; price both anyway at booking time.",
        ],
      },
    ],
    faq: [
      {
        question: "Is 7 days enough for Japan?",
        answer:
          "For the Golden Route — Tokyo, Hakone, Kyoto, Osaka — yes, and it's the best-shaped first trip. You'll skip Hiroshima, Nara (unless added from Kyoto) and everything west. Ten days covers those properly.",
      },
      {
        question: "Do I need the JR Pass for this itinerary?",
        answer:
          "Almost certainly not — after the price increase, point-to-point tickets are far cheaper on this route. Regional passes win only if you add distant stops like Hiroshima.",
      },
      {
        question: "How much does a 7-day Japan trip cost?",
        answer:
          "Around $950 excluding flights at mid-range planning figures — Tokyo ~$120/day, Kyoto ~$140/day, Osaka ~$110/day, plus the ryokan splurge night.",
      },
    ],
    relatedDestinationSlugs: ["tokyo", "kyoto", "osaka"],
    relatedTripSlugs: ["japan-7d-golden-route", "tokyo-kyoto-osaka-7d", "solo-japan-7-day"],
    relatedGuideSlugs: ["japan-travel-budget", "best-time-to-visit-japan", "japan-10-day-itinerary", "tokyo-3-day-itinerary", "how-many-days-in-kyoto"],
    planner: {
      destination: "Tokyo",
      travelStyle: "cultural",
      interests: ["history", "food", "nature"],
      label: "Generate your own Japan Golden Route plan",
    },
  },

  // ── 10. Japan 10 Day Itinerary ────────────────────────────────────────
  {
    slug: "japan-10-day-itinerary",
    title: "Japan 10 Day Itinerary: Golden Route Plus Nara and Hiroshima",
    seoTitle: "Japan 10 Day Itinerary: +Nara & Hiroshima",
    metaDescription:
      "Ten days in Japan: the classic Golden Route extended with Nara's deer park, Hiroshima's peace park and Miyajima — with honest pacing advice.",
    excerpt:
      "The 10-day Japan plan: Golden Route core, then Nara from Kyoto and a Hiroshima–Miyajima overnight that most week trips can't fit.",
    coverImage: null,
    gradient: "from-orange-500 to-red-700",
    author: YUKI,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "11 min read",
    tags: ["japan", "itinerary", "10 days", "hiroshima"],
    city: "Tokyo",
    country: "Japan",
    introduction: [
      "Ten days is where Japan trips get their second act. The first five days run the classic Golden Route — Tokyo, Hakone, Kyoto — exactly as our 7-day itinerary describes. The extra three days buy the two experiences week-trippers always regret missing: Nara's temple-and-deer park from Kyoto, and an overnight in Hiroshima with Miyajima's floating torii.",
      "Budget scales simply: about $1,200 for ten days at planning figures (~$120/day blended across Tokyo, Kyoto, Hiroshima and Osaka), excluding flights. The extra days also dilute the flight cost per day — the quiet reason longer Japan trips are better value than they look.",
    ],
    sections: [
      {
        heading: "What the Extra Days Actually Buy",
        paragraphs: [
          "Nara is a half-day from Kyoto by train: Todai-ji's Great Buddha, the bowing deer of Nara Park, and Kasuga Taisha's lantern-lined approaches. Hiroshima is a full overnight — the Peace Memorial Park deserves a sober afternoon, okonomiyaki deserves dinner, and Miyajima's island torii is a thirty-minute ferry from the city.",
        ],
        bullets: [
          "Nara: half-day or full-day trip from Kyoto — no hotel change needed.",
          "Hiroshima: one night; Peace Park afternoon, Miyajima morning, Shinkansen onward to Osaka.",
          "The pacing bonus: Kyoto gets a true third day instead of a frantic half.",
        ],
      },
      {
        heading: "The Trade You Make",
        paragraphs: [
          "Ten days in one country is a commitment — fewer places per yen of airfare, and a longer runway of hotels. But Japan rewards depth more than almost anywhere: the difference between a week and ten days is the difference between seeing Japan and understanding it. Fourteen days adds the Alps or Kyushu; our 14-day outline sketches that version.",
        ],
      },
    ],
    itinerary: {
      heading: "10 Days: Golden Route, Extended",
      intro:
        "Days 1–6 match our 7-day plan through Kyoto. Day 7 is Nara, days 8–9 Hiroshima and Miyajima, day 10 Osaka.",
      days: [
        {
          day: 1,
          theme: "Tokyo — arrive",
          description: "Asakusa at dusk, early dinner, jet-lag dawn ahead.",
        },
        {
          day: 2,
          theme: "Tokyo — modern west",
          description: "Meiji, Harajuku, Shibuya, Shinjuku neon.",
        },
        {
          day: 3,
          theme: "Tokyo — center",
          description: "Tsukiji, Ginza, bayside or museums.",
        },
        {
          day: 4,
          theme: "Hakone — onsen night",
          description: "Hakone loop, ryokan, kaiseki, onsen.",
        },
        {
          day: 5,
          theme: "Kyoto — Higashiyama",
          description: "Transfer, then Yasaka-to-Kiyomizu at golden hour.",
        },
        {
          day: 6,
          theme: "Kyoto — dawn torii to bamboo",
          description: "Fushimi Inari at dawn, Arashiyama, Philosopher's Path.",
        },
        {
          day: 7,
          theme: "Nara day trip",
          description:
            "Thirty minutes from Kyoto: Todai-ji's Great Buddha, the bowing deer, Kasuga Taisha's lanterns, back to Kyoto for dinner.",
        },
        {
          day: 8,
          theme: "Hiroshima",
          description:
            "Shinkansen west, Peace Memorial Park and the museum in the afternoon, okonomiyaki dinner downtown.",
        },
        {
          day: 9,
          theme: "Miyajima & on to Osaka",
          description:
            "Ferry to Miyajima early — the floating torii, the shrine, momiji manju — afternoon Shinkansen to Osaka, Dotonbori dinner.",
        },
        {
          day: 10,
          theme: "Osaka — finale",
          description: "Osaka Castle, Kuromon Market lunch, farewell in Shinsekai or Umeda.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Rail math",
        items: [
          "At ten days with Hiroshima included, price the nationwide JR Pass against point-to-point again — the gap narrows but point-to-point often still wins.",
          "Reserve Hiroshima and Miyajima-day Shinkansen seats in advance during peak seasons.",
          "Nara needs nothing booked — Kintetsu or JR trains run every fifteen minutes.",
        ],
      },
      {
        heading: "Budget shape",
        items: [
          "About $1,200 excluding flights at blended planning figures.",
          "Hiroshima hotels cost half of Tokyo's for the same quality — a good night to book somewhere nice.",
          "Miyajima is free to wander; the ferry is a few hundred yen each way.",
        ],
      },
    ],
    faq: [
      {
        question: "10 days or 7 days in Japan?",
        answer:
          "Ten if the calendar allows: Nara and Hiroshima–Miyajima are the two experiences week-trippers most regret missing, and Kyoto gets a properly unhurried visit. Seven is still a complete first trip.",
      },
      {
        question: "Can Hiroshima be a day trip instead?",
        answer:
          "From Kyoto or Osaka it's technically possible but brutal — four-plus hours of trains around a site that deserves a sober afternoon. The overnight makes it humane and adds Miyajima's morning light.",
      },
      {
        question: "How much does a 10-day Japan trip cost?",
        answer:
          "Roughly $1,200 excluding international flights at mid-range planning figures, including the Hakone ryokan night and one splurge dinner.",
      },
    ],
    relatedDestinationSlugs: ["tokyo", "kyoto", "osaka"],
    relatedTripSlugs: ["japan-10d-classic", "japan-14d-grand", "japan-7d-golden-route"],
    relatedGuideSlugs: ["japan-7-day-itinerary", "japan-travel-budget", "kyoto-vs-osaka", "best-time-to-visit-japan", "how-many-days-in-kyoto"],
    planner: {
      destination: "Tokyo",
      travelStyle: "cultural",
      interests: ["history", "food", "nature"],
      label: "Build your 10-day Japan route",
    },
  },

  // ── 11. Europe 7 Day Itinerary ────────────────────────────────────────
  {
    slug: "europe-7-day-itinerary",
    title: "Europe 7 Day Itinerary: Two Cities, Done Properly",
    seoTitle: "Europe 7 Day Itinerary: Two Cities Properly",
    metaDescription:
      "The honest 7 day Europe itinerary: two cities with a day trip each — Paris and Rome, London and Paris, or Barcelona and Amsterdam — instead of five blur cities.",
    excerpt:
      "Seven days in Europe is two cities, not five: pick a pair, add a day trip each, and skip the train-marathon regret. Here's how to choose and plan it.",
    coverImage: null,
    gradient: "from-blue-600 to-amber-500",
    author: SOFIA,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "9 min read",
    tags: ["europe", "itinerary", "7 days", "first-timer"],
    city: "Paris",
    country: "France",
    introduction: [
      "Here's the advice most first-timers ignore and all first-timers need: seven days in Europe is a two-city trip. The five-cities-in-a-week itinerary is a rite of passage and a mistake — you'll spend it in stations, see museums from the outside, and remember the airports. Two cities, three or four nights each, one day trip apiece: that's Europe at a human pace.",
      "Pick a pair that shares a short rail link — Paris–London, Paris–Amsterdam, Rome–Florence, Barcelona–Madrid — and the transfer costs you half a day instead of one. Budget at our planning figures: Paris ~€150/day, London ~£180/day, Rome ~€130/day, Barcelona ~€120/day.",
    ],
    sections: [
      {
        heading: "Choosing the Pair",
        paragraphs: [
          "The honest matrix: art-and-food first-timers pick Paris–Rome (via a short flight or a long train day); grand-city generalists pick London–Paris (Eurostar, 2h20, city center to city center); architecture-and-tapas pick Barcelona–Madrid; canal-and-culture pick Amsterdam–Paris. All four pairs work; the wrong answer is any pair joined by a budget flight at 6am.",
        ],
      },
      {
        heading: "The Shape: 4 + 3 or 3 + 4",
        paragraphs: [
          "Give the city you care about more four nights, the other three. Each city gets one day trip — Versailles or Giverny from Paris, Bath or Cambridge from London, Florence or Ostia from Rome, Girona or Montserrat from Barcelona — and one deliberately unplanned day, which is where Europe actually gets under your skin.",
        ],
      },
      {
        heading: "The One-City Alternative",
        paragraphs: [
          "If trains stress you and museums are the point, do one city for seven days with three day trips. Paris for a week is a legitimate and quietly luxurious trip; so is Rome. This is the version experienced travelers quietly pick after their first five-city mistake.",
        ],
      },
    ],
    itinerary: {
      heading: "The Template (Shown for Paris + Rome)",
      intro:
        "Swap the pair, keep the shape: four nights, three nights, one day trip each, zero dawn flights.",
      days: [
        {
          day: 1,
          theme: "Paris — islands & Louvre",
          description:
            "First-entry Louvre, Sainte-Chapelle, Latin Quarter afternoon, Saint-Germain dinner.",
        },
        {
          day: 2,
          theme: "Paris — Montmartre & Marais",
          description:
            "Sacré-Cœur early, the butte's lanes, Marais afternoon and dinner.",
        },
        {
          day: 3,
          theme: "Paris — day trip or grand axis",
          description:
            "Versailles (book the first slot) or the Tuileries-to-Eiffel grand axis if you'd rather stay in town.",
        },
        {
          day: 4,
          theme: "Paris → Rome",
          description:
            "Morning flight (1h50) or the long rail day, check in near the centro storico, and an evening stroll to the Pantheon and Trevi Fountain — both free, both best at dusk.",
        },
        {
          day: 5,
          theme: "Rome — ancient core",
          description:
            "Colosseum's first slot, Forum and Palatine after, Trastevere dinner — the classic Roman day, comfortably done before the heat peaks.",
        },
        {
          day: 6,
          theme: "Rome — Vatican or villas",
          description:
            "Vatican Museums' early slot and St Peter's, or — skipping queues — the Borghese Gallery and a Villa Borghese afternoon.",
        },
        {
          day: 7,
          theme: "Rome — fountains & farewell",
          description:
            "Slow morning: Piazza Navona's fountains, Campo de' Fiori, a last carbonara, and the long walk home through streets that have looked like this for centuries.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Between cities",
        items: [
          "Book intra-Europe rail and flights when you book the trip — prices only climb.",
          "City-center-to-center rail beats airport security theater for pairs under four hours apart.",
          "Pack one carry-on; seven cities' worth of luggage on seven days of trains is misery.",
        ],
      },
      {
        heading: "Money",
        items: [
          "Blended mid-range budget for this pair: roughly €145/day average, so about €1,000 for the week.",
          "Museum passes (Paris Museum Pass, Roma Pass) pay off only if you actually follow the plan — price against your real list.",
          "Dinner is the budget lever: one splurge, one trattoria, one picnic per city balances it.",
        ],
      },
    ],
    faq: [
      {
        question: "How many cities for a 7-day Europe trip?",
        answer:
          "Two. Three if two are close together (Amsterdam–Brussels–Paris works), but never five — the five-city week spends more time in transit than anywhere else.",
      },
      {
        question: "Is the Eurail Pass worth it for a week?",
        answer:
          "Usually not for two cities — point-to-point tickets bought early are cheaper. Passes win on multi-stop, last-minute-flexible itineraries, which we're arguing against anyway.",
      },
      {
        question: "What's the best city pair for a first Europe trip?",
        answer:
          "London–Paris for the easiest logistics, Paris–Rome for the art-and-food jackpot. Both are proven first-timer routes with short, civilized transfers.",
      },
    ],
    relatedDestinationSlugs: ["paris", "rome", "london"],
    relatedTripSlugs: ["europe-7d-first-timer", "paris-3d-classic", "rome-3d-classics"],
    relatedGuideSlugs: ["europe-10-day-itinerary", "paris-vs-london", "rome-vs-paris", "best-european-cities-first-time", "europe-14-day-itinerary"],
    planner: {
      destination: "Paris",
      travelStyle: "cultural",
      interests: ["museums", "food", "history"],
      label: "Plan your two-city Europe week",
    },
  },

  // ── 12. Europe 10 Day Itinerary ───────────────────────────────────────
  {
    slug: "europe-10-day-itinerary",
    title: "Europe 10 Day Itinerary: Three Cities and a Thread That Makes Sense",
    seoTitle: "Europe 10 Day Itinerary: Three Cities",
    metaDescription:
      "A 10 day Europe itinerary that works: three cities on one rail thread — London, Paris, Amsterdam or Paris, Lucerne, Rome — with pacing and budget math.",
    excerpt:
      "Ten days buys three European cities and one real day trip each — if they share a rail thread. Two proven routes and the rules that keep them humane.",
    coverImage: null,
    gradient: "from-sky-600 to-emerald-600",
    author: SOFIA,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "10 min read",
    tags: ["europe", "itinerary", "10 days", "multi-city"],
    city: "Paris",
    country: "France",
    introduction: [
      "Ten days is the first length where a three-city Europe trip stops being a punishment. The rule that keeps it humane: all three cities must sit on one rail thread, so you never double back and no leg exceeds four hours. Everything else — pacing, budgets, what to skip — follows from that.",
      "Two proven threads: the northern one (London → Paris → Amsterdam, all 2–3.5 hours apart by train) and the southern one (Paris → Lucerne → Rome, adding a Swiss interlude before the Italian finale). Budget for the northern thread runs about £120–150/day in London and €130–150/day on the continent; call it €1,600–1,700 blended for ten days.",
    ],
    sections: [
      {
        heading: "The Northern Thread: London, Paris, Amsterdam",
        paragraphs: [
          "Eurostar legs of 2h20 and 3h20, city center to city center, no airports. Four nights London, three Paris, three Amsterdam covers the essentials with a day trip each — Bath or Cambridge, Versailles or Giverny, and the Dutch waterlands or Zaanse Schans windmills. English-speaking throughout, which matters more than people admit on a first trip.",
        ],
      },
      {
        heading: "The Southern Thread: Paris, Lucerne, Rome",
        paragraphs: [
          "For art-and-alps types: TGV to Lucerne (about 4.5 hours), then the scenic Gotthard route down to Rome. Lucerne's lake and chapel bridge are a two-day luxury; Rome gets four nights, which the ancient city deserves. This thread trades ease for drama — book the Gotthard Panorama Express segment if you want the full lake-and-mountain show.",
        ],
      },
      {
        heading: "Pacing Rules for Ten Days",
        paragraphs: [
          "Transfer days are half-days — schedule nothing. One anchor sight per day, booked. Every city gets one unplanned afternoon. Pack one carry-on. And book all intercity trains when you book flights: the €45 early-bird fare and the €180 walk-up fare are the same seat.",
        ],
      },
    ],
    itinerary: {
      heading: "The Northern Thread, Day by Day",
      intro: "London 4 nights → Paris 3 → Amsterdam 3. One day trip per city, one lazy half-day after each transfer.",
      days: [
        {
          day: 1,
          theme: "London — arrive & Westminster",
          description: "Land, drop bags, walk Westminster to Trafalgar Square at dusk.",
        },
        {
          day: 2,
          theme: "London — museums & the City",
          description: "British Museum morning, Borough Market lunch, Tower and riverside walk.",
        },
        {
          day: 3,
          theme: "Day trip — Cambridge or Bath",
          description: "One hour out, back for a West End show or a pub dinner.",
        },
        {
          day: 4,
          theme: "London — Notting Hill & farewell",
          description: "Portobello Road, Hyde Park, last pub roast.",
        },
        {
          day: 5,
          theme: "Eurostar to Paris",
          description: "2h20 city-center transfer, afternoon Marais stroll, booked bistro dinner.",
        },
        {
          day: 6,
          theme: "Paris — islands & Louvre",
          description: "First-entry Louvre, Sainte-Chapelle, Latin Quarter evening.",
        },
        {
          day: 7,
          theme: "Paris — grand axis or Versailles",
          description: "Tuileries to Eiffel at golden hour — or the first-slot Versailles day trip.",
        },
        {
          day: 8,
          theme: "Thalys to Amsterdam",
          description: "3h20 transfer, canal-ring walk, brown-café dinner.",
        },
        {
          day: 9,
          theme: "Amsterdam — museums & Jordaan",
          description: "Rijksmuseum or Van Gogh at opening, Jordaan lanes, canal evening.",
        },
        {
          day: 10,
          theme: "Amsterdam — windmills & wheels",
          description: "Zaanse Schans or a rented bike through the Waterland, farewell herring and frites.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Rail bookings",
        items: [
          "Book Eurostar and Thalys when you book flights — walk-up fares run three to five times higher.",
          "Seat reservations are mandatory on these trains; the app-based tickets are all you need.",
          "St Pancras, Gare du Nord and Amsterdam Centraal are all downtown — no airport transfers anywhere.",
        ],
      },
      {
        heading: "Money",
        items: [
          "Blended €160–170/day across the three cities, roughly €1,600–1,700 for ten days excluding flights.",
          "London is the expensive night; Amsterdam's herring carts and Paris's formule lunches are the budget valves.",
          "Museum passes exist in all three cities — price against your actual booked list.",
        ],
      },
    ],
    faq: [
      {
        question: "Is 10 days enough for three European cities?",
        answer:
          "Yes — three to four nights each with rail legs under four hours is a comfortable, deep trip. It's the sweet spot between the two-city week and the fourteen-day grand tour.",
      },
      {
        question: "Rail pass or point-to-point tickets?",
        answer:
          "Point-to-point, booked early — for three fixed cities it's cheaper and forces the schedule discipline that makes ten days work.",
      },
      {
        question: "How much does a 10-day Europe trip cost?",
        answer:
          "About €1,600–1,700 mid-range excluding flights, including intercity rail — London nights and museum entries are the biggest variables.",
      },
    ],
    relatedDestinationSlugs: ["london", "paris", "amsterdam"],
    relatedTripSlugs: ["europe-10d-highlights", "europe-7d-first-timer", "london-3d-classic"],
    relatedGuideSlugs: ["europe-7-day-itinerary", "europe-14-day-itinerary", "paris-vs-london", "best-european-cities-first-time", "london-travel-budget"],
    planner: {
      destination: "London",
      travelStyle: "cultural",
      interests: ["museums", "food", "history"],
      label: "Generate your three-city Europe plan",
    },
  },

  // ── 13. Europe 14 Day Itinerary ───────────────────────────────────────
  {
    slug: "europe-14-day-itinerary",
    title: "Europe 14 Day Itinerary: The Grand Tour, Reimagined for Trains",
    seoTitle: "Europe 14 Day Itinerary: The Grand Tour",
    metaDescription:
      "A 14 day Europe itinerary: four cities plus the Alps on one rail loop — London, Paris, Switzerland, Venice and Rome — with the pacing rules that keep it fun.",
    excerpt:
      "Fourteen days, four cities and the Alps: the modern grand tour by rail — London, Paris, Lucerne, Venice, Rome — paced for enjoyment, not endurance.",
    coverImage: null,
    gradient: "from-indigo-600 to-emerald-500",
    author: SOFIA,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "11 min read",
    tags: ["europe", "itinerary", "14 days", "grand tour"],
    city: "Paris",
    country: "France",
    introduction: [
      "Fourteen days is grand-tour territory, and the modern version runs on rails: one loop through London, Paris, the Swiss lakes, Venice and Rome with no internal flights at all. Five stops sounds like a blur warning, but the math works — four, three, two, three and two nights respectively, every leg under five hours, and the scenery improving with each transfer.",
      "The honest caveat: this is the maximum. Fourteen days cannot add Amsterdam, Barcelona, Vienna or the Rhine without breaking the loop — every addition costs a night somewhere that needed it. Budget runs about €2,200–2,400 mid-range for two weeks, with Switzerland the budget event and Italy the relief.",
    ],
    sections: [
      {
        heading: "Why the Loop Works",
        paragraphs: [
          "The route is a one-way arc: start London (usually the best-served long-haul gateway), sweep through Paris and the Alps, finish Rome — or reverse if your return flight says so. No leg repeats, no backtracking, and every transfer is itself an attraction: the Eurostar's undersea dash, the TGV's champagne fields, the Gotthard's lake-and-mountain theatre, and the Venice–Florence–Rome corridor through Tuscan hill country.",
        ],
      },
      {
        heading: "The Switzerland Question",
        paragraphs: [
          "Two nights in Lucerne buys lake steamers, the chapel bridge, and — if the day is clear — a mountain railway up Pilatus or Rigi. Switzerland will double your daily budget for those days; the alternative swap is two nights in Munich or Salzburg at half the cost. We keep Lucerne because the contrast is the point: fourteen days should contain one landscape you'll talk about for years.",
        ],
      },
      {
        heading: "Pacing: The Two-Night Minimum, Relaxedinly Broken",
        paragraphs: [
          "Venice and Rome get the short shifts because both compress well — Venice is a two-day city, Rome rewards even a brisk two nights if you pre-book the Vatican and Colosseum. Everywhere else holds three or four. The rule that survives from every long Europe trip: transfer days are half-days, and one afternoon per city stays unplanned.",
        ],
      },
    ],
    itinerary: {
      heading: "14 Days, Stop by Stop",
      intro: "London 4 → Paris 3 → Lucerne 2 → Venice 3 → Rome 2. One-way rail throughout; fly home from Rome.",
      days: [
        {
          day: 1,
          theme: "London — arrive",
          description: "Westminster at dusk, first pub dinner.",
        },
        {
          day: 2,
          theme: "London — museums & Tower",
          description: "British Museum, Borough Market, Tower and the Thames walk.",
        },
        {
          day: 3,
          theme: "London — day trip",
          description: "Bath or Cambridge, back for a West End show.",
        },
        {
          day: 4,
          theme: "London — villages",
          description: "Notting Hill, Hyde Park, farewell roast.",
        },
        {
          day: 5,
          theme: "Paris — Eurostar in",
          description: "Afternoon Marais, booked bistro dinner.",
        },
        {
          day: 6,
          theme: "Paris — islands & Louvre",
          description: "First-entry Louvre, Sainte-Chapelle, Latin Quarter.",
        },
        {
          day: 7,
          theme: "Paris — grand axis",
          description: "Tuileries to Trocadéro, Eiffel at golden hour.",
        },
        {
          day: 8,
          theme: "Lucerne — lake arrival",
          description: "TGV and Swiss rails to Lucerne, chapel bridge, lakeside dinner.",
        },
        {
          day: 9,
          theme: "Lucerne — the mountain day",
          description: "Steamer and cog railway up Rigi or Pilatus, alpine afternoon, lake swim if it's warm.",
        },
        {
          day: 10,
          theme: "Venice — Gotthard south",
          description: "Gotthard route to Venice, Grand Canal vaporetto at dusk, cicchetti crawl.",
        },
        {
          day: 11,
          theme: "Venice — San Marco & back canals",
          description: "St Mark's early, Doge's Palace, then the Castello and Dorsoduro back-canal afternoons.",
        },
        {
          day: 12,
          theme: "Venice — lagoon islands",
          description: "Murano's glass furnaces, Burano's painted houses, lagoon ferry afternoon.",
        },
        {
          day: 13,
          theme: "Rome — ancient core",
          description: "Train to Rome, Colosseum's late slot, Trastevere dinner.",
        },
        {
          day: 14,
          theme: "Rome — Vatican & farewell",
          description: "Vatican early slot, Pantheon and Trevi at dusk, farewell carbonara. Fly home tomorrow.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Rail & passes",
        items: [
          "Book every leg when you book flights — Eurostar, TGV, Gotthard and Italian Frecciarossa fares all climb late.",
          "A rail pass rarely beats these five point-to-point fares; price both if your dates stay flexible.",
          "Station-to-hotel walks matter with luggage: pick hotels within fifteen minutes of each station.",
        ],
      },
      {
        heading: "Money",
        items: [
          "€2,200–2,400 mid-range for two weeks excluding flights; Switzerland runs €200+/day, Italy €130–150.",
          "The budget seesaw: London and Lucerne splurges offset by Rome and Venice trattorias.",
          "One splurge dinner per country is the sustainable rhythm — picnics and osterias carry the rest.",
        ],
      },
    ],
    faq: [
      {
        question: "Is 14 days enough for five stops?",
        answer:
          "Barely, and only because the loop never backtracks and two of the stops (Lucerne, Venice) are deliberately compact. Add a sixth city and it breaks — this is the maximum comfortable scope.",
      },
      {
        question: "How much does a 14-day Europe trip cost?",
        answer:
          "About €2,200–2,400 mid-range excluding flights, including all rail. Switzerland is the budget event; skipping it for Munich or Salzburg saves roughly €250–350.",
      },
      {
        question: "Should I fly between cities instead of trains?",
        answer:
          "On this loop, no — every rail leg is under five hours center-to-center, and flights would add airport transfers and security theater to every transfer day. Trains are the itinerary.",
      },
    ],
    relatedDestinationSlugs: ["london", "paris", "venice"],
    relatedTripSlugs: ["europe-14d-grand-tour", "europe-10d-highlights", "venice-2d-canals"],
    relatedGuideSlugs: ["europe-10-day-itinerary", "europe-7-day-itinerary", "best-european-cities-first-time", "rome-vs-paris", "paris-vs-london"],
    planner: {
      destination: "London",
      travelStyle: "cultural",
      interests: ["museums", "history", "food"],
      label: "Plan your grand tour with AI",
    },
  },
];

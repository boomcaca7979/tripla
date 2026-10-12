import type { Guide } from "../guides";

// Travel budget guides — "X travel budget" long-tail searches. All figures are
// planning estimates consistent with the budgetPerDay values in
// src/data/destinations.ts, and every guide points to the same three-tier
// structure (backpacker / mid-range / comfort).

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

export const BUDGET_GUIDES: Guide[] = [
  // ── 1. Tokyo Travel Budget ────────────────────────────────────────────
  {
    slug: "tokyo-travel-budget",
    title: "Tokyo Travel Budget: What a Day Really Costs in 2026",
    seoTitle: "Tokyo Travel Budget: What a Day Costs",
    metaDescription:
      "Tokyo daily costs in 2026: $75 backpacker, $120 mid-range, $250+ comfort — line by line for hotels, food, transit and attractions, with the honest cheap tricks.",
    excerpt:
      "The Tokyo budget, tier by tier: where the money goes, where it doesn't have to, and the three cheap tricks that actually work in 2026.",
    coverImage: null,
    gradient: "from-rose-500 to-pink-700",
    author: YUKI,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "8 min read",
    tags: ["tokyo", "budget", "japan", "costs"],
    city: "Tokyo",
    country: "Japan",
    introduction: [
      "Tokyo's reputation for expense is a decade out of date. A weak yen and a business-hotel boom have made Japan's capital one of the better-priced megacities: our planning figure is about $120 a day mid-range, with honest backpacking at $75 and comfort starting around $250 — the spread between a capsule hotel and a Shibuya tower suite.",
      "This guide breaks the day into its four lines — bed, food, transit, attractions — and shows where each tier saves. Spoiler: transit is nearly free, food is the great equalizer, and accommodation is where all the money actually lives.",
    ],
    sections: [
      {
        heading: "The Three Tiers, Line by Line",
        paragraphs: [
          "These are planning figures, not quotes — but they hold across most of the year outside sakura and New Year peaks:",
        ],
        bullets: [
          "Backpacker ($75/day): capsule or guesthouse bed ¥3,500–5,000, konbini breakfasts, teishoku lunches, street food dinners, ¥1,000 transit, free shrines and parks.",
          "Mid-range ($120/day): business hotel ¥12,000–16,000, one casual restaurant meal plus one izakaya, all the transit you need, one paid attraction.",
          "Comfort ($250+/day): design or tower hotel ¥30,000+, omakase or kaiseki dinners, taxis when it rains, and the teamLab-plus-cocktail evening.",
        ],
      },
      {
        heading: "Food: The Great Equalizer",
        paragraphs: [
          "Tokyo has more Michelin stars than any city on earth and a $6 bowl of ramen that outranks most Western restaurant meals. The budget move isn't eating cheap food — it's eating where salaries are spent: lunch sets (teishoku, donburi) at 60–70% of dinner prices for the same kitchens. Konbini breakfasts are a feature, not a surrender.",
        ],
      },
      {
        heading: "Where Budgets Explode",
        paragraphs: [
          "Three lines blow up Tokyo budgets: sakura-season hotels (book six months out or pay double), Narita express fares (budget the airport transfer both ways), and the tap-water-free assumption — Tokyo's tap water is safe and convenience-store drinks are the only beverage habit you need to break.",
        ],
      },
    ],
    itinerary: {
      heading: "One Tokyo Day at Two Budgets",
      intro: "The same route, two wallets — proof the itinerary is free and the money is in the margins.",
      days: [
        {
          day: 1,
          theme: "$75 version vs $250 version",
          description:
            "Morning: Senso-ji (free) vs teamLab ticket (¥3,800+). Lunch: ¥900 teishoku vs ¥3,000 sushi counter. Transit: ¥800 metro day vs ¥4,000 taxis. Evening: ¥1,500 standing-bar izakaya vs ¥12,000 kaiseki with skyline view. Same city, same streets, tenfold dinner.",
        },
        {
          day: 2,
          theme: "The weekly view",
          description:
            "Five days at $75 ≈ $375; five days at $120 ≈ $600; five days at $250 ≈ $1,250. Flights and shopping sit outside all three — and sakura-week hotel prices sit above all of them.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Saving honestly",
        items: [
          "Business hotels (APA, Dormy Inn, Mitsui Garden) are the mid-range cheat code — book early, not cheaply.",
          "IC cards (Suica) on your phone make transit accounting invisible and accurate.",
          "Department-store basement halls (depachika) at 8pm discount the day's bento by 30–50%.",
        ],
      },
      {
        heading: "Spending well",
        items: [
          "One splurge meal per trip converts food money into memory — omakase lunch is half the dinner price.",
          "Ryokan nights are the real luxury purchase; do one great one instead of three mediocre upgrades.",
          "Skip nothing free: shrines, parks, crossings and neighborhoods are Tokyo's best exhibits.",
        ],
      },
    ],
    faq: [
      {
        question: "Is Tokyo expensive for tourists in 2026?",
        answer:
          "Less than its reputation — about $120/day mid-range at our planning figures, with the weak yen helping. Accommodation in peak sakura weeks is the one genuinely expensive line.",
      },
      {
        question: "Can you do Tokyo on $50 a day?",
        answer:
          "Tight but possible: capsule bed, konbini and street food, metro-only transit, free sights. Most travelers who try it land near $70–75 once a single restaurant meal sneaks in.",
      },
      {
        question: "How much cash do I need in Tokyo?",
        answer:
          "Less every year — cards and IC cards work nearly everywhere — but markets, small ramen shops and some shrines are cash zones. ¥10,000–15,000 in reserve covers any day.",
      },
    ],
    relatedDestinationSlugs: ["tokyo", "kyoto", "osaka"],
    relatedTripSlugs: ["tokyo-budget-4d", "tokyo-3d-foodie", "solo-japan-7-day"],
    relatedGuideSlugs: ["is-tokyo-expensive", "how-many-days-in-tokyo", "japan-travel-budget", "tokyo-3-day-itinerary", "best-area-to-stay-in-tokyo"],
    planner: {
      destination: "Tokyo",
      travelStyle: "relaxed",
      interests: ["food", "shopping"],
      label: "Budget your Tokyo trip with AI",
    },
  },

  // ── 2. Paris Travel Budget ────────────────────────────────────────────
  {
    slug: "paris-travel-budget",
    title: "Paris Travel Budget: The Day-by-Day Numbers for 2026",
    seoTitle: "Paris Travel Budget: The Day-by-Day Numbers",
    metaDescription:
      "Paris daily costs in 2026: €90 hostel-to-market days, €150 mid-range, €300+ comfort — hotels, bistros, museums and transit, with the formule-lunch trick.",
    excerpt:
      "What a Paris day really costs at three tiers — and the formule lunch, Métro carnet and picnic logic that keeps mid-range honest.",
    coverImage: null,
    gradient: "from-indigo-500 to-pink-600",
    author: SOFIA,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "8 min read",
    tags: ["paris", "budget", "france", "costs"],
    city: "Paris",
    country: "France",
    introduction: [
      "Paris costs what you decide it costs on the first evening. The city can be done respectably at €90 a day — hostel or small hotel, market picnics, formule lunches — and destroyed at €300 by the third glass of champagne with a view. Our planning figure is €150 a day mid-range, and the interesting part is where it bends.",
      "The good news: Paris's best catalog is free. The Seine, the parks, the churches, the bridges, and window-shopping the world's most beautiful streets cost nothing. The money goes to beds, restaurants and timed-entry tickets — in that order.",
    ],
    sections: [
      {
        heading: "The Three Tiers, Line by Line",
        paragraphs: [],
        bullets: [
          "Tight (€90/day): hostel or €80 hotel room, bakery breakfasts, formule lunches (€14–18), market picnics for dinner, Métro carnet, free museums' first Sundays.",
          "Mid-range (€150/day): €130–180 hotel near the center, café breakfast, one bistro dinner, one museum entry, Métro as needed.",
          "Comfort (€300+/day): boutique hotel €250+, Michelin or neo-bistro dinners, taxis, and the rooftop-drinks habit that grows on you.",
        ],
      },
      {
        heading: "Eating Well on Purpose",
        paragraphs: [
          "The formule/prix-fixe lunch is Paris's honest bargain — the same kitchens that charge €45 for dinner sell a two-course lunch at €16–22. Bakery breakfasts (€3), market picnics along the Seine (€10 buys a feast) and a single splurge dinner balance a week. The €9 café soft drink by a monument is the tax for not walking 200 meters.",
        ],
      },
      {
        heading: "Where Budgets Explode",
        paragraphs: [
          "Location: the same hotel room costs 30% more inside the boulevards than ten Métro minutes out. Fashion weeks and June wedding season spike rates. And the Eiffel Tower dinner is a €90+ experience that a Trocadéro picnic plus a proper bistro improves on for a third of the price.",
        ],
      },
    ],
    itinerary: {
      heading: "One Paris Day at Two Budgets",
      intro: "The same arrondissements, two wallets — Paris is kind to both.",
      days: [
        {
          day: 1,
          theme: "€90 version vs €300 version",
          description:
            "Morning: free riverside walk and Sainte-Chapelle (€13) vs private Louvre tour. Lunch: formule bistro €18 vs a €60 seafood platter. Transit: Métro carnet vs Vélib' and taxis. Evening: Seine picnic (€12) vs rooftop dinner with the tower glittering (€120).",
        },
        {
          day: 2,
          theme: "The weekly view",
          description:
            "Four days tight ≈ €360; four days mid-range ≈ €600; four days comfort ≈ €1,200. Versailles (€32 with gardens) and one splurge dinner are the add-ons that matter.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Saving honestly",
        items: [
          "Stay near a Métro line 1 or 4 station; 10 minutes out halves the hotel bill.",
          "Book the Louvre's timed slot online and skip the €0 queue-shaped misery.",
          "Tap water is excellent and free — 'une carafe d'eau' at every restaurant.",
        ],
      },
      {
        heading: "Spending well",
        items: [
          "One dinner reservation made two weeks out beats four spontaneous average meals.",
          "The Paris Museum Pass pays off at 4+ museums in 4 days — price against your real list.",
          "A Seine cruise at dusk (~€15) is the cheapest great memory in the city.",
        ],
      },
    ],
    faq: [
      {
        question: "Is €100 a day enough for Paris?",
        answer:
          "It's tight-but-honest: an €80 hotel room, formule lunches, market picnics and Métro carnets. Most budget travelers realistically land at €110–130 once a café here and a museum there join in.",
      },
      {
        question: "How much is a nice dinner in Paris?",
        answer:
          "A good bistro dinner with wine runs €40–60 per person; the fixed-price formule lunch in the same kitchen is €16–22. Comfort-tier tasting menus start around €90.",
      },
      {
        question: "What's the most overpriced thing in Paris?",
        answer:
          "Monument-adjacent café terraces — the €9 coffee with a view is a location tax. Walk 200 meters off the postcard and the same coffee costs €2.50.",
      },
    ],
    relatedDestinationSlugs: ["paris", "london", "amsterdam"],
    relatedTripSlugs: ["paris-3d-classic", "paris-weekend", "paris-food-3d"],
    relatedGuideSlugs: ["paris-3-day-itinerary", "best-areas-to-stay-in-paris", "best-time-to-visit-paris", "paris-5-day-itinerary", "paris-shopping-guide-2026"],
    planner: {
      destination: "Paris",
      travelStyle: "cultural",
      interests: ["food", "museums"],
      label: "Budget your Paris trip with AI",
    },
  },

  // ── 3. Seoul Travel Budget ────────────────────────────────────────────
  {
    slug: "seoul-travel-budget",
    title: "Seoul Travel Budget: How Much a Day Costs in Korea's Capital",
    seoTitle: "Seoul Travel Budget: A Day's Real Cost",
    metaDescription:
      "Seoul daily costs in 2026: $60 tight, $100 mid-range, $200+ comfort — hotels, BBQ dinners, T-money transit and the café-culture line item nobody budgets for.",
    excerpt:
      "The Seoul budget, tier by tier — including the café spending that quietly becomes a second rent, and why BBQ makes the food line a bargain.",
    coverImage: null,
    gradient: "from-fuchsia-500 to-purple-700",
    author: MARCUS,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "7 min read",
    tags: ["seoul", "budget", "korea", "costs"],
    city: "Seoul",
    country: "South Korea",
    introduction: [
      "Seoul is East Asia's quiet budget champion: our planning figure is about $100 a day mid-range, and the surprise is what doesn't cost money. The subway is world-class and cheap, BBQ restaurants charge less for all-you-can-grill than a Western burger chain, and hotel rooms that would be $200 in Tokyo sit at $80–110.",
      "The budget line nobody sees coming is cafés. Seoul's coffee culture is a competitive sport, and three sculptural lattés a day at ₩6,000 each becomes a real line item. Budget it on purpose and the rest of the math stays friendly.",
    ],
    sections: [
      {
        heading: "The Three Tiers, Line by Line",
        paragraphs: [],
        bullets: [
          "Tight ($60/day): hostel or goshiwon-style bed ₩25,000–35,000, street food and kimbap, T-money ₩3,000/day, palace entries ₩3,000 (hanbok wearers: free).",
          "Mid-range ($100/day): business hotel ₩110,000–150,000, one BBQ or sundubu meal plus street food, cafés budgeted on purpose, one paid experience.",
          "Comfort ($200+/day): design hotel ₩220,000+, premium BBQ (hanwoo beef), taxis, DMZ tour (₩70,000–100,000), and the skincare shopping that follows you home.",
        ],
      },
      {
        heading: "BBQ Economics",
        paragraphs: [
          "Korean BBQ is the best group-meal value in Asia: ₩12,000–18,000 per person for all-you-can-grill pork at the mid tier, with banchan refills free. The bill splits evenly and nobody leaves hungry. Even hanwoo beef dinners at ₩40,000 compare well against any Western steakhouse.",
        ],
      },
      {
        heading: "Where Budgets Explode",
        paragraphs: [
          "Autumn foliage weeks and cherry-blossom weeks spike hotel prices like Japan's peaks. Shopping is the honest variable — K-beauty, fashion and underground-mall hauls are the reason many people overdraw their Seoul budget, and they'll tell you it was worth it.",
        ],
      },
    ],
    itinerary: {
      heading: "One Seoul Day at Two Budgets",
      intro: "Same city, two wallets — the subway and street food keep the floor low.",
      days: [
        {
          day: 1,
          theme: "$60 version vs $200 version",
          description:
            "Morning: Gyeongbokgung (₩3,000 or free in hanbok) vs private palace tour. Lunch: kimbap and tteokbokki ₩8,000 vs department-store food hall ₩35,000. Transit: T-money ₩3,000 vs taxis ₩25,000. Evening: street-food crawl ₩15,000 vs hanwoo BBQ ₩60,000.",
        },
        {
          day: 2,
          theme: "The weekly view",
          description:
            "Four days tight ≈ $220; four days mid-range ≈ $360; four days comfort ≈ $720 plus whatever the skincare haul adds.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Saving honestly",
        items: [
          "Stay near Line 2 — Hongdae, Euljiro or Gangnam all work at different price points.",
          "T-money on your phone or a ₩4,000 card; the subway does everything.",
          "Department-store food halls at closing time discount like Tokyo's depachika.",
        ],
      },
      {
        heading: "Spending well",
        items: [
          "One hanwoo BBQ night is the food splurge that defines the trip.",
          "The DMZ tour is the big-ticket experience — book ahead and treat it as the trip's anchor.",
          "Café-hopping is a sightseeing activity in Seoul; budget it, don't resist it.",
        ],
      },
    ],
    faq: [
      {
        question: "Is Seoul expensive to visit?",
        answer:
          "No — about $100/day mid-range at our planning figures, cheaper than Tokyo or Singapore. Hotels, BBQ and transit all undercut their regional equivalents.",
      },
      {
        question: "How much is a meal in Seoul?",
        answer:
          "Street food ₩4,000–8,000, casual meals ₩9,000–15,000, all-you-can-grill BBQ ₩12,000–18,000, premium hanwoo dinner ₩40,000+. Coffee runs ₩5,000–6,000.",
      },
      {
        question: "Why are prices shown in won?",
        answer:
          "Because you'll mostly pay in won — cards work nearly everywhere, but markets, taxis and street stalls run on cash or T-money. Roughly ₩1,350 = $1 at recent planning rates.",
      },
    ],
    relatedDestinationSlugs: ["seoul", "busan", "tokyo"],
    relatedTripSlugs: ["seoul-3d-classic", "seoul-food-3d", "seoul-shopping-2d"],
    relatedGuideSlugs: ["seoul-3-day-itinerary", "seoul-food-guide", "how-many-days-in-seoul", "seoul-vs-tokyo", "best-time-to-visit-seoul"],
    planner: {
      destination: "Seoul",
      travelStyle: "foodie",
      interests: ["food", "shopping"],
      label: "Budget your Seoul trip with AI",
    },
  },

  // ── 4. Singapore Travel Budget ────────────────────────────────────────
  {
    slug: "singapore-travel-budget",
    title: "Singapore Travel Budget: The Hawker-Center Paradox",
    seoTitle: "Singapore Travel Budget: The Hawker Paradox",
    metaDescription:
      "Singapore daily costs in 2026: S$80 tight, S$180 mid-range, S$330+ comfort — why the world's priciest city for hotels has $4 Michelin-starred hawker meals.",
    excerpt:
      "Singapore is expensive and cheap at the same time — $300 hotels beside $4 hawker lunches. The tier-by-tier numbers, and how to skew them.",
    coverImage: null,
    gradient: "from-emerald-500 to-green-700",
    author: MARCUS,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "7 min read",
    tags: ["singapore", "budget", "costs"],
    city: "Singapore",
    country: "Singapore",
    introduction: [
      "Singapore tops 'most expensive city' lists and then sells you a Michelin-starred chicken-rice lunch for SGD 5. The paradox resolves cleanly: accommodation, alcohol and attractions carry the premium; food (if you eat like a local), transit and the best sights are cheap or free. Our planning figure is about $110 a day mid-range — and the range around it is enormous.",
      "The strategy is asymmetric: save hard on the hotel (the city's smallest rooms cost the earth; stay a stop out or in Chinatown's heritage hostels), spend freely on the hawker circuit, and let the free sights — Marina Bay, the gardens' outdoor sections, the light shows — carry the itinerary.",
    ],
    sections: [
      {
        heading: "The Three Tiers, Line by Line",
        paragraphs: [],
        bullets: [
          "Tight (S$80/day): heritage hostel bed S$35–50, hawker meals S$4–8, MRT S$2/day, free gardens, parks and light shows.",
          "Mid-range (S$180/day): 3-star or 4-star room S$150–220, hawker lunches plus one restaurant dinner, Gardens' conservatories (S$32 combined), MRT.",
          "Comfort (S$330+/day): Marina Bay-view room S$350+, celebrity-chef dinners, Sentosa admissions, cocktails at S$25 a glass.",
        ],
      },
      {
        heading: "Food: Eat Like the Majority",
        paragraphs: [
          "Hawker centers are the national dining room: SGD 3–8 buys chicken rice, char kway teow, laksa or nasi lemak at stalls with decades-long queues. The Michelin Bib Gourmand list reads like a hawker map. A day of eating at hawkers costs less than one airport sandwich; the restaurant night is the choice, not the default.",
        ],
      },
      {
        heading: "Where Budgets Explode",
        paragraphs: [
          "Hotels: Singapore's rooms are Asia's priciest per square meter — the single biggest lever is location-and-size honesty. Alcohol carries heavy excise (SGD 9–15 beers), and Marina Bay Sands' skypark ticket plus rooftop drinks can quietly cost a hawker week. The F1 weekend in September doubles everything.",
        ],
      },
    ],
    itinerary: {
      heading: "One Singapore Day at Two Budgets",
      intro: "Same skyline, two wallets — the free outdoor city is the great equalizer.",
      days: [
        {
          day: 1,
          theme: "S$80 version vs S$330 version",
          description:
            "Morning: free Gardens outdoor walk vs conservatory pair (SGD 32). Lunch: Maxwell hawker SGD 6 vs hotel brunch SGD 45. Transit: MRT SGD 2 vs Grab SGD 30. Evening: Garden Rhapsody light show (free) vs skypark cocktails SGD 60.",
        },
        {
          day: 2,
          theme: "The three-day view",
          description:
            "Three days tight ≈ S$240; mid-range ≈ S$540; comfort ≈ S$1,000. The hotel decision alone explains most of the spread.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Saving honestly",
        items: [
          "Stay in Chinatown, Bugis or Kampong Glam — one MRT stop from the bay, 30% cheaper rooms.",
          "Tap a contactless card on the MRT; foreign cards work at the gates.",
          "Alcohol from hawker centers' beverage stalls or 7-Eleven beats bar prices 3-to-1.",
        ],
      },
      {
        heading: "Spending well",
        items: [
          "The Gardens conservatories (Cloud Forest + Flower Dome) are the paid sight worth paying for.",
          "One Marina-bay rooftop drink at sunset is the splurge photograph of the trip.",
          "Universal Studios only if traveling with kids — otherwise Sentosa's free beaches suffice.",
        ],
      },
    ],
    faq: [
      {
        question: "Is Singapore expensive for tourists?",
        answer:
          "The hotel bill is; the rest doesn't have to be. Hawker meals at SGD 4–8, MRT fares under SGD 2, and free gardens and light shows make about S$180/day genuinely comfortable.",
      },
      {
        question: "How much should I budget for food in Singapore?",
        answer:
          "SGD 15–25 a day eating at hawker centers; SGD 60+ if every meal is a restaurant. The honest answer is you'll do both, and both are worth it.",
      },
      {
        question: "When is Singapore most expensive?",
        answer:
          "The F1 Singapore Grand Prix week (late September/early October) doubles hotel rates across the city; December's holiday season adds 20–30%.",
      },
    ],
    relatedDestinationSlugs: ["singapore", "kuala-lumpur", "bali"],
    relatedTripSlugs: ["singapore-garden-city", "singapore-3d-family", "singapore-gp-2026"],
    relatedGuideSlugs: ["is-singapore-expensive", "singapore-3-day-itinerary", "how-many-days-in-singapore", "best-area-to-stay-in-singapore", "best-time-to-visit-singapore"],
    planner: {
      destination: "Singapore",
      travelStyle: "foodie",
      interests: ["food", "shopping"],
      label: "Budget your Singapore trip with AI",
    },
  },

  // ── 5. Japan Travel Budget ────────────────────────────────────────────
  {
    slug: "japan-travel-budget",
    title: "Japan Travel Budget: A Week on the Golden Route, Priced Honestly",
    seoTitle: "Japan Travel Budget: The Golden Route Price",
    metaDescription:
      "Japan daily costs in 2026 by city — Tokyo ~$120, Kyoto ~$100, Osaka ~$95 — plus the 7-day Golden Route total, rail math and where the yen helps you.",
    excerpt:
      "The whole-Japan budget: per-city daily figures, the 7-day Golden Route total, and the rail-pass math people get wrong.",
    coverImage: null,
    gradient: "from-red-500 to-pink-600",
    author: YUKI,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "8 min read",
    tags: ["japan", "budget", "costs", "golden route"],
    city: "Tokyo",
    country: "Japan",
    introduction: [
      "Japan's budget math has one headline: the weak yen did travelers a favor, and the country that felt expensive in 2015 is now mid-priced. Our per-city planning figures: Tokyo about $120 a day, Kyoto $140, Osaka $110 — and a 7-day Golden Route week (Tokyo, Hakone, Kyoto, Osaka) lands around $950 excluding flights.",
      "The two budget events in any Japan trip are the Hakone ryokan night (¥30,000–50,000 for two with kaiseki dinner — worth every yen, once) and peak-season hotels. Everything else — trains, food, temples — is cheaper than its reputation.",
    ],
    sections: [
      {
        heading: "Per-City Daily Figures",
        paragraphs: [],
        bullets: [
          "Tokyo ~$120/day: business hotel ¥12,000–16,000, one casual meal + one izakaya, metro, one attraction.",
          "Kyoto ~$140/day: temple fees and ryokan temptations push it slightly above Tokyo; market food pulls it back.",
          "Osaka ~$110/day: the cheapest big-city food in Japan — Dotonbori dinners are a bargain sport.",
          "Hakone night: the ryokan splurge line — or halve it with a minshuku or day-use onsen.",
        ],
      },
      {
        heading: "The Rail-Pass Math People Get Wrong",
        paragraphs: [
          "The nationwide JR Pass price rose roughly 70% in 2023, and a pure Golden Route week now costs far less point-to-point (Tokyo–Odawara, Odawara–Kyoto, Kyoto–Osaka total under ¥25,000 versus a ¥50,000 pass). Regional passes and passes that include the Haruka airport express can win on specific routes — price your actual itinerary, not a generic rule.",
        ],
      },
      {
        heading: "Where Budgets Explode",
        paragraphs: [
          "Sakura weeks and foliage weeks double hotel prices and sell out months ahead. The ryokan temptation multiplies (do one great one). And shopping — from Akihabara's machines to Don Quijote's everything — is the line item that famously doesn't fit anyone's spreadsheet.",
        ],
      },
    ],
    itinerary: {
      heading: "The 7-Day Golden Route Total",
      intro: "Sum of the planning figures, with and without the splurge.",
      days: [
        {
          day: 1,
          theme: "The arithmetic",
          description:
            "Tokyo ×3 nights ≈ $360; Hakone ryokan night for two ≈ $210 (halve it with a minshuku); Kyoto ×2 ≈ $280; Osaka ×1 ≈ $110; Shinkansen and local trains ≈ ¥22,000–25,000 (~$150). Total ≈ $950 excluding international flights.",
        },
        {
          day: 2,
          theme: "The 10-day extension",
          description:
            "Adding Nara (day trip, ¥1,300 trains) and a Hiroshima–Miyajima overnight (~$90/day there) brings ten days to roughly $1,200 — the best value-per-day Japan offers.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Saving honestly",
        items: [
          "Business hotels are the deal of Japan — clean, central, reliable, book early.",
          "Lunch sets run 60% of dinner prices; depachika basements discount at 8pm.",
          "Coin lockers + takkyubin luggage shipping make cheap itineraries possible.",
        ],
      },
      {
        heading: "Spending well",
        items: [
          "One ryokan night with kaiseki dinner and onsen is the trip's defining splurge.",
          "Buy point-to-point Shinkansen tickets; skip the nationwide pass on short routes.",
          "Temple and shrine entries are ¥300–600 — the country's sights cost less than a coffee.",
        ],
      },
    ],
    faq: [
      {
        question: "How much does a 7-day Japan trip cost?",
        answer:
          "About $950 excluding international flights at our planning figures — Tokyo ~$120/day, Kyoto ~$140, Osaka ~$110, plus the Hakone ryokan splurge and ~$150 of trains.",
      },
      {
        question: "Is the JR Pass still worth it?",
        answer:
          "Rarely on the Golden Route since the 2023 price hike — point-to-point tickets are far cheaper. It can win on long multi-region routes (Hiroshima + Tokyo round trips) — price your itinerary.",
      },
      {
        question: "Why did Japan get cheaper?",
        answer:
          "Exchange rates: the yen's slide against the dollar and euro means today's ¥15,000 business hotel costs meaningfully less in hard currency than five years ago.",
      },
    ],
    relatedDestinationSlugs: ["tokyo", "kyoto", "osaka"],
    relatedTripSlugs: ["japan-7d-golden-route", "japan-budget-4d", "solo-japan-7-day"],
    relatedGuideSlugs: ["tokyo-travel-budget", "japan-7-day-itinerary", "japan-10-day-itinerary", "best-time-to-visit-japan", "is-tokyo-expensive"],
    planner: {
      destination: "Tokyo",
      travelStyle: "cultural",
      interests: ["food", "history"],
      label: "Budget your Japan trip with AI",
    },
  },

  // ── 6. London Travel Budget ───────────────────────────────────────────
  {
    slug: "london-travel-budget",
    title: "London Travel Budget: Free Museums, Expensive Beds",
    seoTitle: "London Travel Budget: Free Museums, Costly Beds",
    metaDescription:
      "London daily costs in 2026: £100 tight, £180 mid-range, £350+ comfort — why the free museums offset the hotel bill, and the pub-meal arithmetic that works.",
    excerpt:
      "The London budget equation: the world's best free museums against the world's least generous hotel rooms. Tier-by-tier numbers and the pub math.",
    coverImage: null,
    gradient: "from-blue-700 to-red-600",
    author: MARCUS,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "7 min read",
    tags: ["london", "budget", "uk", "costs"],
    city: "London",
    country: "United Kingdom",
    introduction: [
      "London's budget is a tale of two lines: the cheapest great museums on earth (free, all of them) against the most expensive mediocre hotel rooms in Europe. Our planning figure is about £180 a day mid-range — and the accommodation line is where nearly every pound of the spread lives.",
      "The British pound's strength does the damage for dollar and euro visitors. The city's compensations are real: contactless fare capping makes transit cheap, pub meals run £12–16, and the national museums charge nothing — a week of London can cost less than a week of almost any other major capital if you hold the hotel line.",
    ],
    sections: [
      {
        heading: "The Three Tiers, Line by Line",
        paragraphs: [],
        bullets: [
          "Tight (£100/day): hostel bed £30–45, supermarket and market meals, Zone 1–2 transit under the daily cap, free museums and parks.",
          "Mid-range (£180/day): £150–200 hotel room (split it and mid-range begins to make sense), pub lunches, one museum donation, one paid attraction, the occasional West End ticket.",
          "Comfort (£350+/day): boutique hotel £300+, tasting menus and Sunday roasts at gastropubs, black cabs, afternoon tea done properly.",
        ],
      },
      {
        heading: "The Free-Museum Dividend",
        paragraphs: [
          "The British Museum, National Gallery, Tate Modern, Natural History Museum, V&A and more charge nothing. Budget two museum hours a day at £0 and the London maths softens: the city's cultural floor is the best free offer in the world, and it directly offsets the hotel pain.",
        ],
      },
      {
        heading: "Where Budgets Explode",
        paragraphs: [
          "Hotels first: central rooms are small and priced accordingly — ten Tube minutes out changes everything. West End tickets run £50–150 (lotteries and day seats fix it). And the soft-drink-with-ice at a tourist pub is a £6 lesson in walking 100 more meters.",
        ],
      },
    ],
    itinerary: {
      heading: "One London Day at Two Budgets",
      intro: "Same riverbank, two wallets — the free museums carry the budget tier.",
      days: [
        {
          day: 1,
          theme: "£100 version vs £280 version",
          description:
            "Morning: British Museum (free) vs private tower tour. Lunch: Borough Market £12 vs a £45 gastropub Sunday roast. Transit: contactless cap £8 vs black cabs £45. Evening: free National Gallery hour and a £14 pub dinner vs £120 West End stalls and a cocktail.",
        },
        {
          day: 2,
          theme: "The four-day view",
          description:
            "Four days tight ≈ £400; mid-range ≈ £720; comfort ≈ £1,400. The hotel choice is 60% of the difference.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Saving honestly",
        items: [
          "Contactless cards cap daily Tube/bus fares automatically — no Oyster purchase needed.",
          "Stay Zones 1–2 near a Jubilee or Victoria line station; Zone 1 postcodes are a luxury tax.",
          "Pub meal deals and market lunches (£8–12) are the honest food floor.",
        ],
      },
      {
        heading: "Spending well",
        items: [
          "One West End show is the cultural splurge — enter lotteries for £10–25 stalls seats.",
          "Sunday roast at a proper gastropub is the meal London does best.",
          "Museum special exhibitions (£15–25) are the only paid museum line worth planning around.",
        ],
      },
    ],
    faq: [
      {
        question: "Is London expensive for tourists?",
        answer:
          "The hotels are; the city can be done honestly at about £180/day mid-range. Free museums, capped transit fares and pub meals are the three offsets.",
      },
      {
        question: "How much is a meal in London?",
        answer:
          "Pub mains £12–18, market lunches £8–12, gastropub Sunday roast £20–28, restaurant dinners £35–60. Coffee £3–4.5.",
      },
      {
        question: "Do I need cash in London?",
        answer:
          "Almost never — cards and phones work everywhere, including buses and market stalls. Keep £20 for the rare cash-only pub dartboard.",
      },
    ],
    relatedDestinationSlugs: ["london", "paris", "edinburgh"],
    relatedTripSlugs: ["london-3d-classic", "london-5d-deep", "london-cultural"],
    relatedGuideSlugs: ["london-3-day-itinerary", "how-many-days-in-london", "best-areas-to-stay-in-london", "paris-vs-london", "london-on-foot-guide-2026"],
    planner: {
      destination: "London",
      travelStyle: "cultural",
      interests: ["museums", "history"],
      label: "Budget your London trip with AI",
    },
  },

  // ── 7. Bali Travel Budget ─────────────────────────────────────────────
  {
    slug: "bali-travel-budget",
    title: "Bali Travel Budget: Villas, Drivers and the $4 Nasi Campur",
    seoTitle: "Bali Travel Budget: Villas & Drivers",
    metaDescription:
      "Bali daily costs in 2026: $30 tight, $70 mid-range, $150+ comfort — villa stays, private drivers, beach clubs and the warung meals that keep the floor low.",
    excerpt:
      "The Bali budget, tier by tier: why a private villa can cost less than a European hostel bunk, and where the money actually goes.",
    coverImage: null,
    gradient: "from-green-500 to-teal-600",
    author: PRIYA,
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-03",
    readTime: "7 min read",
    tags: ["bali", "budget", "indonesia", "costs"],
    city: "Bali",
    country: "Indonesia",
    introduction: [
      "Bali's budget reputation survives for one reason: it's still true. A private-pool villa can cost $60, a warung lunch $2, a full-day private driver $50 — our planning figure is about $70 a day mid-range, and at the tight end ($30) you'll still eat well and swim daily.",
      "The spread exists because Bali runs on two currencies of experience: the local one (warungs, scooters, warung-beach clubs) and the imported one (fine dining, retail therapy, daybed bills). The trick is knowing which line you're on.",
    ],
    sections: [
      {
        heading: "The Three Tiers, Line by Line",
        paragraphs: [],
        bullets: [
          "Tight ($30/day): hostel or simple guesthouse $15–25, warung meals $1.5–4, scooter rental $5/day, waterfalls and beaches at entry-fee prices.",
          "Mid-range ($70/day): villa with pool $40–60, a driver day shared, restaurant dinners $8–15, spa treatments $10–15, beach-club afternoons.",
          "Comfort ($150+/day): design villas $120+, fine-dining nights, Uluwatu and Canggu's flagship beach clubs (daybed minimums $30–100), private yoga and surf coaching.",
        ],
      },
      {
        heading: "The Driver Math",
        paragraphs: [
          "A private driver costs $40–60 for a full day — cheaper than two taxis and infinitely better for the temple-and-waterfall geography. Split it, negotiate the route the night before, and tip honestly. Gojek and Grab handle everything under an hour for pocket change.",
        ],
      },
      {
        heading: "Where Budgets Explode",
        paragraphs: [
          "Beach-club daybed minimums are the leak (one Canggu afternoon can equal three villa nights). Imported wine is taxed into absurdity — arak cocktails and Bintang do the job. And December–January's wet season dips prices 30% while trading you an afternoon storm a day.",
        ],
      },
    ],
    itinerary: {
      heading: "One Bali Day at Two Budgets",
      intro: "Same island, two wallets — the gap is mostly rooms and daybeds.",
      days: [
        {
          day: 1,
          theme: "$30 version vs $150 version",
          description:
            "Morning: Tegallalang terraces ($2 entry) vs private sunrise photo tour. Lunch: nasi campur $3 vs restaurant brunch $18. Transit: scooter $5 vs driver $55. Evening: warung dinner $4 vs cliffside sunset dinner with kecak dance $60.",
        },
        {
          day: 2,
          theme: "The five-day view",
          description:
            "Five days tight ≈ $150; mid-range ≈ $350 (including one driver day); comfort ≈ $750. Flights are the only big number.",
        },
      ],
    },
    practicalInfo: [
      {
        heading: "Saving honestly",
        items: [
          "Book villas direct or a month out — walk-in rates in the wet season undercut the platforms.",
          "Eat where the scooters park: warungs serve the island's best food at local prices.",
          "ATM fees and card minimums add up — withdraw larger amounts less often.",
        ],
      },
      {
        heading: "Spending well",
        items: [
          "The private driver day is the best money on the island — book the good one, not the cheap one.",
          "One flagship beach-club afternoon delivers the Bali photograph; do it once, then go back to the warung beach.",
          "The kecak fire dance at Uluwatu (about $10) is the best-value show in Southeast Asia.",
        ],
      },
    ],
    faq: [
      {
        question: "Is Bali cheap to visit?",
        answer:
          "Yes by regional standards: about $70/day mid-range at our planning figures, with honest backpacking at $30. The imported-experience tier (beach clubs, fine dining) is where budgets climb.",
      },
      {
        question: "How much is a villa in Bali?",
        answer:
          "Private-pool villas run $40–60 mid-range and $120+ for the design tier — often less than a European city hotel room, which is the island's core unfair advantage.",
      },
      {
        question: "Do I need cash in Bali?",
        answer:
          "Warungs, drivers, temple donations and stalls are cash economy; hotels and beach clubs take cards. Roughly IDR 15,500 = $1 — mind the extra zeros.",
      },
    ],
    relatedDestinationSlugs: ["bali", "singapore", "kuala-lumpur"],
    relatedTripSlugs: ["bali-5d-island", "bali-island-escape", "bali-honeymoon-7d"],
    relatedGuideSlugs: ["is-bali-expensive", "bali-first-timers-guide", "bali-5-day-itinerary", "singapore-travel-budget", "seoul-travel-budget"],
    planner: {
      destination: "Bali",
      travelStyle: "relaxed",
      interests: ["beaches", "nature", "food"],
      label: "Budget your Bali trip with AI",
    },
  },
];

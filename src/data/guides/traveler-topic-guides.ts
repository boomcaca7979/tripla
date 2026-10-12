import type { Guide } from "../guides";

// Traveler-type guides (first-time, family, couples, solo, budget, luxury,
// by-train) and city-topic guides (things to do, neighborhoods, food,
// transport, night) — the final batch of this expansion.

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

function compactGuide(cfg: {
  slug: string; title: string; seoTitle: string; meta: string; excerpt: string;
  gradient: string; author: typeof YUKI; city: string; country: string; tags: string[];
  intro: string[]; sections: { heading: string; paragraphs: string[]; bullets?: string[] }[];
  route: { heading: string; intro: string; days: { day: number; theme: string; description: string }[] };
  practical: { heading: string; items: string[] }[];
  faq: { question: string; answer: string }[];
  dest: string[]; trips: string[]; guides: string[]; plannerCity: string; readTime: string;
}): Guide {
  return {
    slug: cfg.slug, title: cfg.title, seoTitle: cfg.seoTitle, metaDescription: cfg.meta,
    excerpt: cfg.excerpt, coverImage: null, gradient: cfg.gradient, author: cfg.author,
    publishedAt: "2026-09-12", updatedAt: "2026-09-12", readTime: cfg.readTime,
    tags: cfg.tags, city: cfg.city, country: cfg.country, introduction: cfg.intro,
    sections: cfg.sections, itinerary: cfg.route, practicalInfo: cfg.practical, faq: cfg.faq,
    relatedDestinationSlugs: cfg.dest, relatedTripSlugs: cfg.trips, relatedGuideSlugs: cfg.guides,
    planner: {
      destination: cfg.plannerCity, travelStyle: "cultural", interests: ["food", "history"],
      label: `Generate your ${cfg.city} plan`,
    },
  };
}

export const TRAVELER_TOPIC_GUIDES: Guide[] = [
  // ── Traveler-type guides ─────────────────────────────────────────────
  compactGuide({
    slug: "tokyo-first-time-guide", title: "Tokyo First Time Guide: Everything Before You Land",
    seoTitle: "Tokyo First Time Guide", gradient: "from-rose-500 to-indigo-600", author: YUKI,
    city: "Tokyo", country: "Japan", tags: ["tokyo", "first time", "beginners"],
    meta: "The Tokyo first-timer's primer: Suica setup, the Yamanote logic, konbini culture, onsen rules and the five phrases that open doors.",
    excerpt: "Everything before you land: Suica, the Yamanote logic, konbini culture and the five phrases.",
    intro: [
      "Tokyo intimidates from maps and delights from streets. The gap closes with about an hour of preparation: a phone Suica, a hotel on the Yamanote loop, the konbini breakfast concept, and five Japanese phrases. This guide is that hour.",
      "Everything else — the itineraries, the budgets, the neighborhoods — follows from the infrastructure below.",
    ],
    sections: [
      { heading: "Setup: The First Hour", paragraphs: ["Add a Suica to Apple/Google Wallet before departure — it works on every train, bus and konbini from the airport train onward. Book a hotel near Shinjuku, Shibuya, Ueno or Tokyo Station. Download Google Maps (it handles Tokyo transit superbly) and a translation app.", "Carry ¥10,000 cash as backup; cards and IC work almost everywhere else."], bullets: ["Suica on the phone — the single best setup move.", "Yamanote-loop hotel — Shinjuku, Shibuya, Ueno or Tokyo Station.", "Google Maps + a translation app.", "¥10,000 cash reserve."] },
      { heading: "The Konbini Culture", paragraphs: ["Convenience stores (7-Eleven, FamilyMart, Lawson) are Tokyo's honest food infrastructure: onigiri breakfasts, bento lunches, fried-chicken snacks and oden in winter — fresh, cheap, everywhere. Use them without apology; locals do.", "Etiquette basics: no eating while walking in crowded lanes, shoes off where floors rise, no phone calls on trains, and the escalator stands on one side (left in Tokyo)."] },
      { heading: "The Five Phrases", paragraphs: ["Sumimasen (excuse me/sorry — the universal opener), arigatou gozaimasu (thank you), kore o kudasai (this one, please), oishii (delicious), and eki wa doko desu ka (where's the station?). Five phrases and a bow's worth of politeness change every interaction."] },
    ],
    route: { heading: "The First Evening", intro: "What to do the moment you land.", days: [
      { day: 1, theme: "Land, load, wander", description: "Suica on the phone, the train in, and a konbini dinner near the hotel. Tomorrow starts early." },
    ] },
    practical: [
      { heading: "Money & transit", items: ["Tokyo ~$120/day mid-range at planning figures.", "Suica on the phone; cash reserve for small stalls."] },
      { heading: "Etiquette", items: ["No calls on trains; quiet is the norm.", "Shoes off where floors rise.", "Escalators: stand left in Tokyo."] },
    ],
    faq: [
      { question: "Do I need cash in Tokyo?", answer: "Less every year — cards and IC work nearly everywhere — but markets and small ramen shops are cash zones. ¥10,000 in reserve covers any day." },
      { question: "Is the language barrier a problem?", answer: "Not seriously — translation apps and patience cover the gaps, and the five phrases carry most interactions." },
      { question: "What's the first thing to do after landing?", answer: "Load the Suica, ride the train in, konbini dinner, early night. The jet-lag dawn is tomorrow's gift." },
    ],
    dest: ["tokyo", "kyoto", "osaka"], trips: ["tokyo-2d-highlights", "tokyo-3d-foodie", "japan-5d-highlights"],
    guides: ["tokyo-3-day-itinerary", "tokyo-travel-budget", "tokyo-transportation-guide", "best-area-to-stay-in-tokyo", "japan-first-time-guide"],
    plannerCity: "Tokyo", readTime: "6 min read",
  }),
  compactGuide({
    slug: "tokyo-family-travel-guide", title: "Tokyo Family Travel Guide: Kids, Trains and Theme Parks",
    seoTitle: "Tokyo Family Travel Guide", gradient: "from-sky-500 to-pink-500", author: YUKI,
    city: "Tokyo", country: "Japan", tags: ["tokyo", "family", "kids"],
    meta: "Tokyo with kids: Disney's rope-drop strategy, Ueno's pandas, teamLab's wading art, kid-friendly food and the train etiquette that makes it work.",
    excerpt: "Tokyo with kids: pandas, rope-drops, wading art and the trains kids already love.",
    intro: [
      "Tokyo is one of the world's great family cities — safe, clean, punctual trains kids find magical, and a theme-park-plus-pandas-plus-digital-art menu. The keys are pacing (one anchor per day), pool hours (build them in), and the rope-drop discipline at any park.",
      "Four days is the family sweet spot; our family trip plans show the shape day by day.",
    ],
    sections: [
      { heading: "The Family Anchors", paragraphs: ["Ueno Zoo's pandas and park picnic, teamLab Planets' barefoot wading art (booked), Disney's two parks (rope-drop at 8:30), and the Pokémon Center/Nintendo Tokyo pilgrimage. Shinjuku Gyoen's lawns absorb the meltdowns.", "Food: depachika picnics, conveyor sushi, and food courts where every kid chooses."], bullets: ["Ueno Zoo pandas (go at opening).", "teamLab Planets — booked, barefoot, magical.", "One Disney day, rope-dropped.", "Food courts as family democracy."] },
      { heading: "The Train Game", paragraphs: ["Kids love the trains if you frame it: the Yamanote's green loop, the monorail to Odaiba, the Disney Resort line. Rush hour (7:30–9am) is the one hazard — travel after 9:30 with kids."] },
    ],
    route: { heading: "The 4-Day Family Shape", intro: "One anchor per day, pool every afternoon.", days: [
      { day: 1, theme: "Odaiba & teamLab", description: "The wading art, the Gundam, early dinner." },
      { day: 2, theme: "Ueno & Asakusa", description: "Pandas at opening, Senso-ji, rickshaw photos." },
      { day: 3, theme: "Disney day", description: "Rope-drop, parade, fireworks, sleep." },
      { day: 4, theme: "Shibuya & departure", description: "The crossing, Pokémon Center, airport." },
    ] },
    practical: [
      { heading: "Logistics", items: ["Book teamLab and Disney tickets before flying.", "Strollers work; rush hour doesn't — travel after 9:30."] },
      { heading: "Money", items: ["About $120/day mid-range plus Disney tickets (~$70–100/person)."] },
    ],
    faq: [
      { question: "Is Tokyo good for kids?", answer: "Excellent — safe, clean, punctual and full of anchors. The pacing is the parent's job." },
      { question: "Disney or DisneySea?", answer: "Magic Kingdom for younger kids; DisneySea for the unique-theming camp. One day each if the trip allows." },
      { question: "How many days for Tokyo with kids?", answer: "Four — one anchor per day plus pool hours." },
    ],
    dest: ["tokyo", "osaka", "kyoto"], trips: ["tokyo-family-4d", "tokyo-5d-classic", "singapore-3d-family"],
    guides: ["tokyo-family-travel-guide", "tokyo-3-day-itinerary", "tokyo-first-time-guide", "tokyo-travel-budget", "japan-family-travel-guide"],
    plannerCity: "Tokyo", readTime: "6 min read",
  }),
  compactGuide({
    slug: "tokyo-solo-travel-guide", title: "Tokyo Solo Travel Guide: The City Built for One",
    seoTitle: "Tokyo Solo Travel Guide", gradient: "from-indigo-500 to-teal-600", author: YUKI,
    city: "Tokyo", country: "Japan", tags: ["tokyo", "solo travel"],
    meta: "Tokyo solo: counter dining, capsule hotels, the safest big city on earth, and the neighborhoods best explored alone.",
    excerpt: "Tokyo solo: counter dining, capsule nights and the safest streets on earth.",
    intro: [
      "Tokyo is the world's best solo-travel city: counter dining designed for one, capsule and business hotels at honest prices, safety that removes the evening caution tax, and neighborhoods — Shimokitazawa, Koenji, Nakameguro — that reward solitary wandering.",
      "The solo strategy is the counter: sushi, ramen, yakitori and tempura all seat singles front and center. No city on earth feeds one better.",
    ],
    sections: [
      { heading: "The Counter Economy", paragraphs: ["Sushi counters (conveyor or omakase), ramen's solo ticket machines, yakitori's six-seat shops, and standing bars (tachinomi) — Tokyo's dining culture is built for parties of one. Sit at the counter, watch the craft, eat brilliantly.", "Ichiran's solo booths are the famous extreme; the standing bars of Omoide Yokocho are the social version."], bullets: ["Conveyor sushi and ramen ticket machines.", "Tachinomi standing bars for the social solo.", "Ichiran's booths as the rite of passage."] },
      { heading: "Safety & Lodging", paragraphs: ["Tokyo's safety is genuine — late-night walks are unremarkable. Capsule hotels (nine hours, clean, quiet) and business hotels run $40–80 solo; the money saved funds the omakase."] },
    ],
    route: { heading: "The Solo Day", intro: "One neighborhood, one counter, one walk.", days: [
      { day: 1, theme: "Neighborhood solo", description: "Shimokitazawa's vintage, Nakameguro's coffee, a standing-bar dinner." },
    ] },
    practical: [
      { heading: "Money", items: ["Solo budgets run leaner: $80–100/day is comfortable.", "Capsule and business hotels $40–80."] },
      { heading: "Solo-specific", items: ["Counter seating everywhere — no reservations needed.", "Late-night safety is genuine; the last train is 1am."] },
    ],
    faq: [
      { question: "Is Tokyo good for solo travelers?", answer: "The best — counter dining, capsule hotels, safety, and neighborhoods that reward wandering." },
      { question: "Will I eat alone awkwardly?", answer: "No — counter dining is the local default. Solo seats are the best seats." },
      { question: "Is Tokyo safe at night alone?", answer: "Genuinely — one of the safest big cities on earth. The last train is near 1am." },
    ],
    dest: ["tokyo", "kyoto", "osaka"], trips: ["solo-japan-7-day", "tokyo-budget-4d", "tokyo-2d-highlights"],
    guides: ["tokyo-solo-travel-guide", "best-solo-travel-destinations-2026", "tokyo-budget-travel-guide", "tokyo-3-day-itinerary", "japan-first-time-guide"],
    plannerCity: "Tokyo", readTime: "5 min read",
  }),
  compactGuide({
    slug: "tokyo-budget-travel-guide", title: "Tokyo Budget Travel Guide: The City for $75 a Day",
    seoTitle: "Tokyo Budget Travel Guide", gradient: "from-amber-500 to-red-600", author: YUKI,
    city: "Tokyo", country: "Japan", tags: ["tokyo", "budget"],
    meta: "Tokyo on $75 a day: capsule beds, konbini breakfasts, teishoku lunches, free observation decks and the honest cheap tricks that work.",
    excerpt: "Tokyo for $75/day: capsules, konbini, teishoku and the free decks.",
    intro: [
      "Tokyo on $75 a day is not deprivation — it's the city as locals actually budget it: capsule or guesthouse beds, konbini breakfasts, teishoku lunch sets, free observation decks and shrine-filled days. This guide is the line-by-line method.",
      "The three rules: bed from ¥3,500–5,000, food from konbini and teishoku counters, transit by IC card. Everything else — the shrines, the crossings, the parks, the markets — is free or nearly.",
    ],
    sections: [
      { heading: "The Bed Line", paragraphs: ["Capsule hotels (¥3,500–5,000), youth hostels and the guesthouse scene cover sleep honestly. Book early for weekends; the budget tier fills first."], bullets: ["Capsules: clean, quiet, nine-hour stays.", "Guesthouses: the social option.", "Business hotels at ¥8,000 = the mid-range escape hatch."] },
      { heading: "The Food Line", paragraphs: ["Konbini breakfasts (¥500), teishoku lunch sets (¥900 — the same kitchens at 60% of dinner prices), standing-bar dinners (¥1,500), and the depachika 8pm discounts. Eating well on ¥3,000/day is a solved problem."],
      },
      { heading: "The Free City", paragraphs: ["Senso-ji, Meiji Shrine, the Imperial gardens, Shibuya Crossing, the Metropolitan Government's free observation deck, Ueno Park — Tokyo's best catalog is free. Paid tickets (teamLab, towers) are choices, not requirements."] },
    ],
    route: { heading: "The $75 Day", intro: "One line at a time.", days: [
      { day: 1, theme: "The free day", description: "Senso-ji, Ueno, the free deck at dusk, konbini picnic by the river." },
    ] },
    practical: [
      { heading: "The math", items: ["Bed ¥4,000 + food ¥3,000 + transit ¥800 + one paid entry = ~$60–75.", "Sakura weeks break every line — travel off-peak."] },
      { heading: "Honest upgrades", items: ["One splurge meal per trip converts money into memory.", "The ryokan night is the one worth saving for."] },
    ],
    faq: [
      { question: "Can you do Tokyo on $50 a day?", answer: "Tight but possible — capsule, konbini, metro-only, free sights. Most land at $70 once a restaurant meal sneaks in." },
      { question: "Are capsule hotels uncomfortable?", answer: "No — clean, quiet and engineered for sleep. They're a Tokyo institution, not a compromise." },
      { question: "What's the best budget meal in Tokyo?", answer: "The teishoku lunch set: the same kitchens as dinner at 60% of the price." },
    ],
    dest: ["tokyo", "osaka", "kyoto"], trips: ["tokyo-budget-4d", "japan-budget-4d", "tokyo-2d-highlights"],
    guides: ["tokyo-travel-budget", "is-tokyo-expensive", "tokyo-solo-travel-guide", "japan-travel-budget", "tokyo-first-time-guide"],
    plannerCity: "Tokyo", readTime: "5 min read",
  }),
  compactGuide({
    slug: "tokyo-luxury-travel-guide", title: "Tokyo Luxury Travel Guide: The Top Tier",
    seoTitle: "Tokyo Luxury Travel Guide", gradient: "from-amber-400 to-indigo-700", author: YUKI,
    city: "Tokyo", country: "Japan", tags: ["tokyo", "luxury"],
    meta: "Tokyo at the top tier: omakase counters, ryokan-influenced spas, tower suites and the craft ateliers — with the honest per-day figures.",
    excerpt: "Tokyo at the top tier: omakase, spas, suites and craft.",
    intro: [
      "Tokyo's luxury tier is the world's most specific: omakase counters where the chef serves you alone, onsen spas inside skyscrapers, tower suites over the crossing, and craft ateliers — knives, indigo, lacquer — that predate the concept of luxury branding.",
      "Honest figures: $250+/day and rising with every counter booked. The guide's method: one splurge category per day, and the rest of the city is free anyway.",
    ],
    sections: [
      { heading: "The Splurge Menu", paragraphs: ["Omakase (¥30,000–60,000 — book via hotel concierge or TableCheck), kaiseki (¥25,000+), teppanyaki Kobe beef (¥20,000+), and the tower-view cocktails (¥3,000). One per day is the sustainable rhythm."], bullets: ["One omakase defines the trip.", "The onsen spa afternoon as the recovery.", "Craft ateliers over malls — knives, indigo, washi."] },
      { heading: "The Suites & the Service", paragraphs: ["Aman, Park Hyatt, Hoshinoya and the palace hotels deliver the world's best service at ¥80,000–150,000/night. The mid-luxury alternative: a ¥40,000 suite plus three counters. Both are honest."],
      },
    ],
    route: { heading: "The Luxury Day", intro: "One splurge, then the free city.", days: [
      { day: 1, theme: "Counter & skyline", description: "Omakase lunch, Ginza ateliers, the tower-bar sunset." },
    ] },
    practical: [
      { heading: "Bookings", items: ["Omakase and kaiseki: book 1–3 months out via concierge or platforms.", "Suites in sakura season: 6 months."] },
      { heading: "Money", items: ["$250+/day honest; $400 with the suite tier."] },
    ],
    faq: [
      { question: "How do I book Tokyo's omakase?", answer: "Hotels' concierge desks, or platforms like TableCheck and Pocket Concierge — months out for the famous counters." },
      { question: "Is the suite or the food the better spend?", answer: "The food — Tokyo's counters are unique; the suites are excellent but not singular." },
      { question: "How much does luxury Tokyo cost?", answer: "$250–400/day honest, depending on the room tier." },
    ],
    dest: ["tokyo", "kyoto", "osaka"], trips: ["tokyo-luxury-4d", "tokyo-5d-classic", "japan-7d-golden-route"],
    guides: ["tokyo-luxury-travel-guide", "tokyo-travel-budget", "japan-travel-budget", "tokyo-foodie-guide-2026"],
    plannerCity: "Tokyo", readTime: "5 min read",
  }),
  compactGuide({
    slug: "paris-first-time-guide", title: "Paris First Time Guide: The Essentials Before You Land",
    seoTitle: "Paris First Time Guide", gradient: "from-indigo-500 to-pink-600", author: SOFIA,
    city: "Paris", country: "France", tags: ["paris", "first time", "beginners"],
    meta: "The Paris first-timer's primer: Navigo vs carnet, the arrondissement logic, bonjour etiquette, and the two bookings that matter.",
    excerpt: "Everything before you land: the Métro logic, the bonjour rule and the two bookings.",
    intro: [
      "Paris rewards about an hour of preparation: a Métro strategy, the arrondissement logic, the bonjour rule that changes every interaction, and two advance bookings (one museum slot, two dinner reservations). This guide is that hour.",
    ],
    sections: [
      { heading: "The Métro Logic", paragraphs: ["Single tickets (t+), a carnet of ten, or tap-to-pay with a contactless card — Paris accepts all three. Line 1 runs the east–west spine; Line 4 the north–south; the RER B links both airports. Never more than two transfers per journey."], bullets: ["Contactless tap at the gates works directly.", "Line 1 and 4 cover most first-timer geometry.", "The center is walkable — 30 minutes max between sights."] },
      { heading: "The Bonjour Rule", paragraphs: ["Say 'Bonjour' entering every shop, café and bakery — it's not politeness, it's the price of admission, and its absence explains most 'rude Parisian' stories. 'Bonjour' on entry, 'merci, au revoir' on exit."],
      },
      { heading: "The Two Bookings", paragraphs: ["The Louvre's 9am timed slot (or d'Orsay's), and two dinner reservations made 1–2 weeks out. Everything else — the Seine, the parks, the churches, the bridges — is free and walk-up."] },
    ],
    route: { heading: "The First Evening", intro: "What to do on arrival.", days: [
      { day: 1, theme: "Arrive and walk", description: "Drop bags, walk the Seine at dusk, bonjour at dinner. Tomorrow starts at the museum." },
    ] },
    practical: [
      { heading: "Money", items: ["Paris ~€150/day mid-range at planning figures.", "Tap water is free at every restaurant ('une carafe d'eau')."] },
      { heading: "Etiquette", items: ["Bonjour on entry — everywhere, always.", "Greet in French first; switch on request."] },
    ],
    faq: [
      { question: "Do I need to speak French?", answer: "Five words: bonjour, merci, au revoir, s'il vous plaît, l'addition. Effort is the currency; fluency isn't required." },
      { question: "Is Paris safe?", answer: "Yes — with pickpocket awareness on the Métro and around the icons. Normal city rules." },
      { question: "What are the two bookings?", answer: "One museum timed slot and two dinner reservations. Everything else walks up." },
    ],
    dest: ["paris", "london", "amsterdam"], trips: ["paris-weekend", "paris-3d-classic"],
    guides: ["paris-3-day-itinerary", "paris-travel-budget", "paris-transportation-guide", "best-areas-to-stay-in-paris", "paris-food-guide"],
    plannerCity: "Paris", readTime: "5 min read",
  }),
  compactGuide({
    slug: "paris-family-guide", title: "Paris Family Guide: The City for Kids",
    seoTitle: "Paris Family Guide", gradient: "from-sky-500 to-pink-500", author: SOFIA,
    city: "Paris", country: "France", tags: ["paris", "family", "kids"],
    meta: "Paris with kids: the carousel strategy, Luxembourg's ponies, one museum morning per day, and the crêpe economy that keeps everyone walking.",
    excerpt: "Paris with kids: carousels, ponies, one museum morning and the crêpe economy.",
    intro: [
      "Paris with kids runs on a simple exchange rate: one adult sight buys one kid reward. The Louvre's 90 minutes earn the Tuileries carousel; Montmartre's climb earns the crêpe; the museum morning earns the Luxembourg ponies. This guide is the ledger.",
    ],
    sections: [
      { heading: "The Kid Anchors", paragraphs: ["The Tuileries and Luxembourg carousels, Jardin du Luxembourg's ponies and sailboats, the Seine boat cruise (every child's favorite hour), the Ice cream on Île Saint-Louis, and the playgrounds hidden inside every park."], bullets: ["The boat cruise — book the 6pm slot.", "Luxembourg's ponies and vintage sailboats.", "A playground in every arrondissement."] },
      { heading: "The Museum Rule", paragraphs: ["One museum morning per day, maximum 90 minutes, highlights-trail only. The Louvre's Denon wing for the hits; d'Orsay's Impressionists for the manageable version. Kids under 18 enter free."] },
    ],
    route: { heading: "The 4-Day Family Shape", intro: "One anchor per day.", days: [
      { day: 1, theme: "Islands & boat", description: "Sainte-Chapelle, ice cream, the 6pm cruise." },
      { day: 2, theme: "Louvre lightly", description: "90 minutes, then carousels and hot chocolate." },
      { day: 3, theme: "Eiffel & picnic", description: "The tower, Champ de Mars, the sparkle hour." },
      { day: 4, theme: "Montmartre & Luxembourg", description: "The climb, the crêpe, the ponies." },
    ] },
    practical: [
      { heading: "Logistics", items: ["Kids under 18 free at national museums; strollers work on the Métro's Line 1.", "Book the boat and one museum ahead."] },
      { heading: "Money", items: ["About €150/day mid-range plus family-friendly multipliers."] },
    ],
    faq: [
      { question: "Is Paris good for kids?", answer: "Surprisingly — the parks, the carousels, the crêpes and the boat make it one of Europe's easiest family cities." },
      { question: "Disneyland Paris?", answer: "A separate day (or two) 40 minutes by RER — worth it if the trip is family-first." },
      { question: "The best kid meal strategy?", answer: "Crêperies and pizza for dinner; formule lunches for the adults; bakeries for all crises." },
    ],
    dest: ["paris", "london", "amsterdam"], trips: ["paris-family-4d", "paris-3d-classic", "paris-weekend"],
    guides: ["paris-family-guide", "paris-3-day-itinerary", "paris-first-time-guide", "paris-travel-budget", "paris-transportation-guide"],
    plannerCity: "Paris", readTime: "5 min read",
  }),
  compactGuide({
    slug: "paris-couples-guide", title: "Paris Couples Guide: The Romance Itinerary",
    seoTitle: "Paris Couples Guide", gradient: "from-rose-400 to-purple-600", author: SOFIA,
    city: "Paris", country: "France", tags: ["paris", "couples", "romance"],
    meta: "Paris for two: the sunset towers, the Seine at night, one two-star splurge, and the mirador equivalent — the bridges after dark.",
    excerpt: "Paris for two: the sunsets, the bridges, the splurge and the walk.",
    intro: [
      "Paris is the default romantic city because it earned it: the tower's sparkle on the hour, the Seine's night current, the bistro tables too close together on purpose. The couples' version of Paris is not the checklist — it's the evenings, and one splurge.",
    ],
    sections: [
      { heading: "The Romantic Anchors", paragraphs: ["The Eiffel Tower's sparkle (on the hour after dark, from Trocadéro or a boat), the Seine's bridges after dinner — Pont Alexandre III at midnight, Pont Neuf's square du Vert-Galant with wine — and Montmartre's steps at golden hour."], bullets: ["The sparkle hour, claimed from Trocadéro.", "Pont Alexandre III at midnight.", "A picnic on the Île Saint-Louis with wine."] },
      { heading: "The Splurge Logic", paragraphs: ["One two-star dinner or one palace-hotel afternoon tea — not both, not neither. The rest of the romance is free: the bridges, the riversides, the wrong turns through Saint-Germain."] },
    ],
    route: { heading: "The 3-Day Couples Shape", intro: "Museums by day, rivers by night.", days: [
      { day: 1, theme: "Islands & first sparkle", description: "Sainte-Chapelle, the ice cream, the sparkle from the boat." },
      { day: 2, theme: "Montmartre & the splurge", description: "The steps at golden hour; the booked table." },
      { day: 3, theme: "The bridges", description: "The Louvre at 9, then the midnight bridges." },
    ] },
    practical: [
      { heading: "Bookings", items: ["One splurge table, 2–3 weeks out.", "The boat's 6pm slot books days ahead."] },
      { heading: "Money", items: ["€150–200/day for two at the mid tier; the splurge adds €150–300."] },
    ],
    faq: [
      { question: "Best romantic evening in Paris?", answer: "The sparkle hour from a Seine boat, then Pont Alexandre III at midnight. Costs €20; remembers forever." },
      { question: "Is the Eiffel Tower dinner worth it?", answer: "The view is (from above), the food is mid. The Trocadéro picnic plus a proper bistro improves it for a third of the price." },
      { question: "Montmartre at night — safe?", answer: "Yes around the tourist core; take the Métro down after midnight." },
    ],
    dest: ["paris", "venice", "amsterdam"], trips: ["paris-weekend", "paris-luxury-4d", "paris-food-3d"],
    guides: ["paris-couples-guide", "paris-luxury-guide", "paris-3-day-itinerary", "paris-travel-budget", "best-time-to-visit-paris"],
    plannerCity: "Paris", readTime: "5 min read",
  }),
  compactGuide({
    slug: "paris-budget-guide", title: "Paris Budget Guide: The City for €90 a Day",
    seoTitle: "Paris Budget Guide", gradient: "from-amber-500 to-indigo-600", author: SOFIA,
    city: "Paris", country: "France", tags: ["paris", "budget"],
    meta: "Paris on €90 a day: the €80 room ten Métro minutes out, formule lunches, market picnics and the free catalog that carries it.",
    excerpt: "Paris for €90/day: the room out, the formule lunch and the free catalog.",
    intro: [
      "Paris on €90 a day is tight-but-honest: an €80 room ten Métro minutes out, bakery breakfasts, formule lunches (€14–18), market picnics for dinner, and the free catalog — the Seine, the parks, the churches, the world's best window-shopping — carrying the days.",
      "The three levers: the room's location, the lunch formule, and the picnic. Everything else negotiates.",
    ],
    sections: [
      { heading: "The Bed Line", paragraphs: ["€80–100 rooms exist ten Métro minutes from the center — near Line 1 or 4 stations, or around Gare du Nord for the arrivals logic. The 30% saving funds the entire food budget."], bullets: ["Line 1 or 4 proximity over postcode.", "Read the square meters, not the stars.", "Air conditioning filter in July–August."] },
      { heading: "The Food Line", paragraphs: ["Bakery breakfasts (€3), the formule lunch (€14–18 — the same kitchens at a third of dinner), market picnics along the Seine (€10 buys a feast), and one splurge per trip. Wine from the supermarket, drunk by the river."],
      },
      { heading: "The Free Catalog", paragraphs: ["The Seine and its bridges, the parks (Luxembourg, Tuileries, Buttes-Chaumont), the churches (Saint-Sulpice, Saint-Eustache), the covered passages, and the views: Montmartre, Belleville, the Sacré-Cœur steps. Paris's best floor price is zero."],
      },
    ],
    route: { heading: "The €90 Day", intro: "One line at a time.", days: [
      { day: 1, theme: "The free day", description: "Bakery breakfast, the river walk, a formule lunch, the parks, picnic dinner." },
    ] },
    practical: [
      { heading: "The math", items: ["Room €80 + food €35 + transit €8 + one entry = ~€90.", "Museum Pass: skip it at budget tier — the free first Sundays exist."] },
      { heading: "Honest upgrades", items: ["One splurge dinner per trip.", "The Seine cruise (~€15) is the best cheap memory."] },
    ],
    faq: [
      { question: "Is €100 a day enough for Paris?", answer: "Yes at budget tier — the €80 room, formule lunches and picnics land near €100 all-in." },
      { question: "Where should budget travelers stay?", answer: "Latin Quarter back streets, Canal Saint-Martin, or near a Line 4 station — charm at lower rates." },
      { question: "What's the best free thing in Paris?", answer: "The Seine at dusk — better than most paid attractions in any city." },
    ],
    dest: ["paris", "london", "amsterdam"], trips: ["paris-3d-classic", "paris-weekend", "paris-food-3d"],
    guides: ["paris-budget-guide", "paris-travel-budget", "paris-3-day-itinerary", "paris-transportation-guide", "best-areas-to-stay-in-paris"],
    plannerCity: "Paris", readTime: "5 min read",
  }),
  compactGuide({
    slug: "paris-luxury-guide", title: "Paris Luxury Guide: The Palace Tier",
    seoTitle: "Paris Luxury Guide", gradient: "from-rose-400 to-indigo-700", author: SOFIA,
    city: "Paris", country: "France", tags: ["paris", "luxury"],
    meta: "Paris at the palace tier: the courtyard teas, the two-star counters, Place Vendôme's jewellers and the chauffeured Versailles day.",
    excerpt: "Paris at the palace tier: the teas, the counters, the jewels and the driver.",
    intro: [
      "Paris at the palace tier is the city's most composed form: the Ritz and Meurice courtyards, two-star counters that book months out, Place Vendôme's high-jewelry windows (window-shopping is free and world-class), and the chauffeured day trip to Versailles before the coaches.",
      "Honest figures: €400–600/day at the palace tier. The guide's method: one splurge category per day, and the city's free beauty carries the rest.",
    ],
    sections: [
      { heading: "The Palace Anchor", paragraphs: ["The Ritz, Le Meurice, Le Bristol and the Cheval Blanc — courtyard teas (€60–90), spa afternoons, and suites that overlook the Tuileries. Book the tea even without the room: it's the accessible palace experience."], bullets: ["The courtyard tea as the entry ritual.", "One two-star dinner (L'Ambroisie tier) per trip.", "Place Vendôme's windows at dusk."] },
      { heading: "The Chauffeured Day", paragraphs: ["A private car to Versailles at opening (€200–300), the palace before the coaches, the gardens and the Trianon — then home for the simple bistro dinner that balances it."],
      },
    ],
    route: { heading: "The Palace Day", intro: "Tea, jewels, and the driver.", days: [
      { day: 1, theme: "Tea & jewels", description: "The courtyard tea, the Vendôme windows, the booked counter." },
    ] },
    practical: [
      { heading: "Bookings", items: ["Two-star tables: 2–3 months out via concierge.", "Palace teas: days ahead."] },
      { heading: "Money", items: ["€400–600/day at the palace tier honest."] },
    ],
    faq: [
      { question: "Is the palace tea worth it?", answer: "Yes — it's the accessible way into the palaces, and the pastries justify themselves." },
      { question: "Suite or counter?", answer: "The counter — Paris's two-star tables are singular; the suites are excellent but not unique." },
      { question: "How much does luxury Paris cost?", answer: "€400–600/day at the palace tier, honestly." },
    ],
    dest: ["paris", "london", "venice"], trips: ["paris-luxury-4d", "paris-5d-art-food", "paris-3d-classic"],
    guides: ["paris-luxury-guide", "paris-travel-budget", "paris-couples-guide", "paris-shopping-guide-2026", "tokyo-luxury-travel-guide"],
    plannerCity: "Paris", readTime: "5 min read",
  }),
  compactGuide({
    slug: "rome-first-time-guide", title: "Rome First Time Guide: The Essentials",
    seoTitle: "Rome First Time Guide", gradient: "from-amber-500 to-orange-700", author: SOFIA,
    city: "Rome", country: "Italy", tags: ["rome", "first time", "beginners"],
    meta: "The Rome first-timer's primer: the two bookings, the water fountains, the dress codes, and the four pastas as curriculum.",
    excerpt: "Everything before you land: the two bookings, the fountains, the dress codes and the pastas.",
    intro: [
      "Rome's first-timer preparation is short: two timed bookings (Colosseum+Forum, Vatican), the dress-code note for churches, the free water-fountain system, and the four-pasta curriculum. This guide is the checklist.",
    ],
    sections: [
      { heading: "The Two Bookings", paragraphs: ["Colosseum+Forum combined tickets and the Vatican Museums' early entry — both bookable online, both sell out days ahead in every season. Everything else in Rome is free or walk-up."], bullets: ["Colosseum+Forum combined ticket.", "Vatican early-entry slot.", "The Pantheon's small fee on arrival."] },
      { heading: "The Practical Rules", paragraphs: ["Dress codes: covered shoulders and knees at St Peter's and the basilicas. Water: the nasoni fountains run free, cold drinking water across the city — carry a bottle. Coffee: at the bar counter, standing, for half the table price. And cappuccino is a morning drink — after 11am marks you."],
      },
      { heading: "The Four-Pasta Curriculum", paragraphs: ["Carbonara, cacio e pepe, amatriciana, gricia — no cream, ever. Order all four across the trip; judge each kitchen by its cacio e pepe, the one with nowhere to hide."] },
    ],
    route: { heading: "The First Evening", intro: "Arrival hour.", days: [
      { day: 1, theme: "Arrive and wander", description: "The Pantheon and Trevi at dusk — both free, both best then. Carbonara night." },
    ] },
    practical: [
      { heading: "Money", items: ["Rome ~€130/day mid-range at planning figures.", "Trattoria pastas €10–14; house wine €5–8."] },
      { heading: "Practical", items: ["The nasoni fountains refill bottles free.", "Dress codes enforced at St Peter's."] },
    ],
    faq: [
      { question: "Do I need to book the Colosseum?", answer: "Yes — the combined Colosseum+Forum ticket is timed and sells out days ahead." },
      { question: "Can I drink the tap water?", answer: "Better than bottled — the nasoni fountains run free across the city." },
      { question: "What's the first dinner order?", answer: "Carbonara — then grade every kitchen against it." },
    ],
    dest: ["rome", "florence", "venice"], trips: ["rome-3d-classics", "rome-eternal-city", "italy-7d-classics"],
    guides: ["rome-3-day-itinerary", "rome-food-guide", "rome-transportation-guide", "best-time-to-visit-rome", "italy-travel-guide"],
    plannerCity: "Rome", readTime: "5 min read",
  }),
  compactGuide({
    slug: "rome-couples-guide", title: "Rome Couples Guide: The Eternal Romance",
    seoTitle: "Rome Couples Guide", gradient: "from-rose-400 to-orange-600", author: SOFIA,
    city: "Rome", country: "Italy", tags: ["rome", "couples", "romance"],
    meta: "Rome for two: the Trevi at midnight, the Aventine keyhole, Trastevere's lantern lanes and the rooftop aperitivo facing the domes.",
    excerpt: "Rome for two: midnight fountains, the keyhole view, Trastevere's lanterns.",
    intro: [
      "Rome's romance is older than Paris's and less advertised: the Trevi at midnight (empty), the Aventine keyhole's perfectly framed dome, Trastevere's lantern-lit lanes, and the rooftop aperitivi over the domes. The couples' Rome is an evening city.",
    ],
    sections: [
      { heading: "The Romantic Anchors", paragraphs: ["The Trevi Fountain at midnight (the crowd leaves around 11), the Aventine's keyhole and Orange Garden, Ponte Sisto's evening crossing into Trastevere, and the Gianicolo's terrace view."], bullets: ["Trevi at midnight — coin over the left shoulder.", "The Aventine keyhole's dome.", "Trastevere dinner at 9, walk home at 11."] },
      { heading: "The Evening Architecture", paragraphs: ["Rome's romance runs 6pm–midnight: the passeggiata, the aperitivo, the late dinner, and the gelato walk home. Schedule nothing before 6 that isn't ancient."] },
    ],
    route: { heading: "The 3-Day Couples Shape", intro: "Ancient by day, romance by night.", days: [
      { day: 1, theme: "Ancient & first fountain", description: "The Forum early; the midnight Trevi." },
      { day: 2, theme: "Vatican & the keyhole", description: "The museums early; the Aventine at dusk." },
      { day: 3, theme: "Trastevere & the terrace", description: "The lanes, the rooftop aperitivo, the farewell." },
    ] },
    practical: [
      { heading: "Bookings", items: ["One rooftop aperitivo and one splurge trattoria, booked."] },
      { heading: "Money", items: ["€110–150/day for two at the mid tier; the romance is mostly free."] },
    ],
    faq: [
      { question: "Best romantic evening in Rome?", answer: "The midnight Trevi, then Trastevere's lanes — the crowd-free version of the postcard." },
      { question: "Is the Aventine keyhole worth it?", answer: "Yes — the perfectly framed dome through the keyhole is Rome's best free surprise." },
      { question: "Rome or Paris for a couple?", answer: "Paris for the engineered romance; Rome for the discovered one. Both earned it." },
    ],
    dest: ["rome", "florence", "venice"], trips: ["rome-food-3d", "italy-couples-10d", "rome-3d-classics"],
    guides: ["rome-couples-guide", "rome-3-day-itinerary", "rome-food-guide", "rome-vs-paris", "italy-travel-guide"],
    plannerCity: "Rome", readTime: "5 min read",
  }),
  compactGuide({
    slug: "seoul-first-time-guide", title: "Seoul First Time Guide: The Essentials",
    seoTitle: "Seoul First Time Guide", gradient: "from-fuchsia-500 to-indigo-600", author: MARCUS,
    city: "Seoul", country: "South Korea", tags: ["seoul", "first time", "beginners"],
    meta: "The Seoul first-timer's primer: T-money setup, the hanbok trick, the BBQ rules and the banchan etiquette that changes every meal.",
    excerpt: "Everything before you land: T-money, the hanbok trick and the BBQ rules.",
    intro: [
      "Seoul's first-timer preparation is short: a T-money card, the hanbok trick (free palace entry), the BBQ rules (staff grills, banchan refills free), and the pouring etiquette. This guide is the checklist.",
    ],
    sections: [
      { heading: "The T-money Setup", paragraphs: ["Buy the card at any convenience store on arrival (₩4,000) or load it on your phone — it covers subway, buses, taxis and convenience stores. The subway is signposted in English and spotless; Line 2 circles the city."], bullets: ["T-money at any CU or GS25.", "Line 2 and 3 cover the first-timer geometry.", "Taxis are metered, cheap and safe."] },
      { heading: "The Hanbok Trick", paragraphs: ["Rent a hanbok near Gyeongbokgung (₩15,000–30,000 for hours) and palace entry is free — plus the photos. The rental shops cluster by the palace gates; the process takes ten minutes."],
      },
      { heading: "The Table Rules", paragraphs: ["Banchan (side dishes) are free and refillable — ask without hesitation. Pour drinks for others; receive with two hands. No tipping, anywhere. The oldest at the table starts the meal."],
      },
    ],
    route: { heading: "The First Evening", intro: "Arrival hour.", days: [
      { day: 1, theme: "Arrive and eat", description: "T-money loaded, the first BBQ (staff-grilled), and an early night. The palace is tomorrow's 9am." },
    ] },
    practical: [
      { heading: "Money", items: ["Seoul ~$100/day mid-range at planning figures.", "Cards work nearly everywhere; markets take T-money or cash."] },
      { heading: "Etiquette", items: ["Two hands when receiving drinks.", "Banchan refills are free — ask.", "No tipping, ever."] },
    ],
    faq: [
      { question: "Do I need Korean in Seoul?", answer: "No — the subway and signs are in English, and translation apps cover menus. The five basic phrases earn smiles." },
      { question: "Is Seoul safe at night?", answer: "Very — the main districts run late and safe; the subway is 24/7 on key lines." },
      { question: "What's the hanbok trick?", answer: "Rent the dress, enter the palaces free, and get the photos. Ten minutes at any rental shop." },
    ],
    dest: ["seoul", "busan", "jeju"], trips: ["seoul-3d-classic", "seoul-2d-highlights", "seoul-food-3d"],
    guides: ["seoul-first-time-guide", "seoul-3-day-itinerary", "seoul-travel-budget", "seoul-transportation-guide", "seoul-food-guide"],
    plannerCity: "Seoul", readTime: "5 min read",
  }),
  compactGuide({
    slug: "seoul-solo-travel-guide", title: "Seoul Solo Travel Guide: The Easy Capital",
    seoTitle: "Seoul Solo Travel Guide", gradient: "from-purple-500 to-teal-600", author: MARCUS,
    city: "Seoul", country: "South Korea", tags: ["seoul", "solo travel"],
    meta: "Seoul solo: the single-seat BBQ culture, 24-hour saunas, the safest late nights in Asia and the neighborhoods that welcome one.",
    excerpt: "Seoul solo: single seats, 24-hour saunas and the easiest late nights in Asia.",
    intro: [
      "Seoul is one of the world's easiest solo cities: single-seat dining is a solved culture (solo booths at ramen shops, single-grill tables at BBQ), the jjimjilbangs run 24 hours, and the main districts are safe and alive at 2am.",
      "The solo budget runs $70–90/day at the mid tier — cheaper than traveling with company, honestly.",
    ],
    sections: [
      { heading: "The Solo Dining Culture", paragraphs: ["Korea engineered for one: ramen ticket machines, single-grill BBQ tables, dosirak counters and the convenience-store ramyeon station. Ichiran-style booths exist at every price point; nobody notices, everybody eats well."], bullets: ["Single-grill BBQ tables — the game changer.", "24-hour jjimjilbangs for the late arrival.", "Convenience-store ramyeon counters at 1am."] },
      { heading: "Safety & the Late Night", paragraphs: ["Seoul's main districts (Hongdae, Itaewon, Gangnam) are safe and active past midnight; taxis are metered and cheap. The jjimjilbang solves the 4am arrival better than any hotel."],
      },
    ],
    route: { heading: "The Solo Day", intro: "One district, one grill, one sauna.", days: [
      { day: 1, theme: "Hongdae solo", description: "Shopping, the single-grill dinner, the busking hour, the noraebang if game." },
    ] },
    practical: [
      { heading: "Money", items: ["$70–90/day solo at the mid tier.", "Jjimjilbang day passes ₩8,000–15,000."] },
      { heading: "Solo-specific", items: ["Single-grill tables everywhere.", "The jjimjilbang is the late-arrival solution."] },
    ],
    faq: [
      { question: "Is Seoul good for solo travelers?", answer: "One of the best — single-seat dining culture, 24-hour saunas, safe late nights." },
      { question: "Can I eat BBQ alone?", answer: "Yes — single-grill tables exist at every tier, no awkwardness included." },
      { question: "What about a 4am arrival?", answer: "The 24-hour jjimjilbang: shower, sleep in the communal room, ramyeon at dawn." },
    ],
    dest: ["seoul", "busan", "tokyo"], trips: ["seoul-3d-classic", "seoul-2d-highlights", "korea-7d-seoul-busan"],
    guides: ["seoul-solo-travel-guide", "best-solo-travel-destinations-2026", "seoul-first-time-guide", "seoul-travel-budget", "seoul-3-day-itinerary"],
    plannerCity: "Seoul", readTime: "5 min read",
  }),
  compactGuide({
    slug: "europe-first-time-guide", title: "Europe First Time Guide: The Planning Primer",
    seoTitle: "Europe First Time Guide", gradient: "from-blue-600 to-emerald-500", author: SOFIA,
    city: "Paris", country: "France", tags: ["europe", "first time", "beginners"],
    meta: "The Europe first-timer's primer: the two-city rule, the Schengen clock, the rail bookings and the packing list that fits one carry-on.",
    excerpt: "The planning primer: the two-city rule, the Schengen clock, the rail bookings.",
    intro: [
      "Europe's first-timer preparation is a decision tree, not a checklist: how many cities (two), which pair (rail-linked), how long (seven days), and what to book (flights, trains, two hotels). This guide is the tree.",
    ],
    sections: [
      { heading: "The Two-City Rule", paragraphs: ["Two cities, three-to-four nights each, joined by a rail leg under four hours. The proven pairs: London–Paris, Paris–Rome, Barcelona–Madrid, Amsterdam–Paris. Never five cities in seven days — the most common and expensive first-timer mistake."], bullets: ["London–Paris for the easiest logistics.", "Paris–Rome for the art-and-food jackpot.", "Barcelona–Madrid for the tapas-and-Gaudí version."] },
      { heading: "The Schengen Clock", paragraphs: ["The Schengen zone grants 90 days in any 180 across most of Europe. A two-week trip uses 14 — no issue for first-timers, but long trips should track it."],
      },
      { heading: "The Booking Order", paragraphs: ["Flights first (open-jaw if the pair allows), intercity trains second (2–3 months out), hotels third (6–10 weeks for June and September), museum slots last. Pack one carry-on — the seven-cities'-worth-of-luggage trip is the other classic mistake."],
      },
    ],
    route: { heading: "The Booking Sequence", intro: "In order, once.", days: [
      { day: 1, theme: "The sequence", description: "Flights → trains → hotels → museum slots. One carry-on. Done." },
    ] },
    practical: [
      { heading: "Money", items: ["€110–180/day across Western Europe at planning figures.", "Book rail when you book flights — the €45 early bird exists."] },
      { heading: "Packing", items: ["One carry-on, one pair of comfortable shoes, one rain shell.", "Everything else is purchasable in Europe."] },
    ],
    faq: [
      { question: "How many cities for a first Europe trip?", answer: "Two. Three if close together. Never five — the five-city week is the classic regret." },
      { question: "Which pair?", answer: "London–Paris for logistics, Paris–Rome for the jackpot. Both proven thousands of times." },
      { question: "Rail pass or tickets?", answer: "Point-to-point tickets, booked early — passes lose on fixed two-city itineraries." },
    ],
    dest: ["paris", "london", "rome"], trips: ["europe-7d-first-timer", "paris-3d-classic", "rome-3d-classics"],
    guides: ["europe-first-time-guide", "europe-7-day-itinerary", "best-european-cities-first-time", "europe-travel-guide", "europe-by-train-guide"],
    plannerCity: "Paris", readTime: "6 min read",
  }),
  compactGuide({
    slug: "europe-family-guide", title: "Europe Family Guide: The Kid-Paced Continent",
    seoTitle: "Europe Family Guide", gradient: "from-sky-500 to-amber-500", author: SOFIA,
    city: "Paris", country: "France", tags: ["europe", "family", "kids"],
    meta: "Europe with kids: the playground-per-city rule, the boat-and-train rewards, the one-museum-morning law and the apartment-hotel logic.",
    excerpt: "Europe with kids: playgrounds, boats, one museum morning and apartment hotels.",
    intro: [
      "Europe with kids runs on one law and one economy: one museum morning per day, and playgrounds as the reward currency. Add apartment hotels (space, kitchens, laundry) and rail legs under three hours, and the continent becomes the easiest family destination on earth.",
    ],
    sections: [
      { heading: "The One-Museum Law", paragraphs: ["One museum morning per day, maximum 90 minutes, highlights-only, and kids under a certain age enter free nearly everywhere. The Louvre, the Colosseum's arena, the Tower of London — all survivable at kid pace if you leave before the meltdown hour."], bullets: ["90 minutes, highlights trail, out before lunch.", "Under-18s free at most national museums.", "The playground is the reward, scheduled."] },
      { heading: "The Apartment-Hotel Logic", paragraphs: ["Aparthotels and rentals give space, kitchens (breakfast economics) and laundry (packing halves). Book the two-bedroom tier; the family of four in hotel rooms is the budget destroyer."],
      },
      { heading: "The Transport Rewards", paragraphs: ["Kids love boats and trains: the Seine cruise, the Amsterdam ferries, the Swiss cog railways, the London double-deckers' front seats. Every transfer can be the day's highlight if you pick the vehicle."],
      },
    ],
    route: { heading: "The 7-Day Family Thread", intro: "London and Paris, kid-paced.", days: [
      { day: 1, theme: "London — parks & boat", description: "Hyde Park, the Diana playground, the Thames clipper." },
      { day: 2, theme: "London — Tower & museum", description: "The Tower at opening; 90 minutes max." },
      { day: 3, theme: "Eurostar to Paris", description: "The train kids love; the apartment check-in." },
      { day: 4, theme: "Paris — Louvre lightly", description: "90 minutes, then the Tuileries carousel." },
      { day: 5, theme: "Paris — Eiffel & picnic", description: "The tower, Champ de Mars, the sparkle." },
      { day: 6, theme: "Paris — Luxembourg", description: "The ponies and sailboats; crêpe economy." },
      { day: 7, theme: "Farewell", description: "The last croissants; CDG." },
    ] },
    practical: [
      { heading: "Logistics", items: ["Apartment hotels in both cities; laundry halves the packing.", "Book the boat and one museum per city ahead."] },
      { heading: "Money", items: ["€150–200/day for the family at the mid tier — kitchens save the food line."] },
    ],
    faq: [
      { question: "Which European cities are best with kids?", answer: "London (playgrounds and free museums), Paris (carousels and boats), Amsterdam (bikes and canals), Rome (gladiators)." },
      { question: "Hotel or apartment?", answer: "Apartment — space, kitchen and laundry beat the hotel breakfast every time for a family." },
      { question: "How long should a family Europe trip be?", answer: "Seven days for two cities; ten if a theme park (Disneyland Paris) joins." },
    ],
    dest: ["paris", "london", "amsterdam"], trips: ["paris-family-4d", "nyc-family-4d", "singapore-3d-family"],
    guides: ["europe-family-guide", "paris-family-guide", "europe-7-day-itinerary", "paris-travel-budget", "best-european-cities-first-time"],
    plannerCity: "Paris", readTime: "6 min read",
  }),
  compactGuide({
    slug: "europe-by-train-guide", title: "Europe by Train: The Complete Rail Guide",
    seoTitle: "Europe by Train Guide", gradient: "from-sky-600 to-emerald-600", author: SOFIA,
    city: "Paris", country: "France", tags: ["europe", "rail", "transportation"],
    meta: "Europe by train: the Eurostar, TGV, ICE and Frecciarossa arithmetic, the booking windows, the pass verdict and the scenic lines worth routing for.",
    excerpt: "The complete rail guide: the booking windows, the pass verdict and the scenic lines.",
    intro: [
      "Europe's high-speed rail network is the continent's secret superpower: city-center to city-center in 2–4 hours, airport-free, scenery included. This guide covers the arithmetic — booking windows, passes vs point-to-point, and the scenic lines worth routing for.",
    ],
    sections: [
      { heading: "The Booking Windows", paragraphs: ["Every operator opens sales 2–6 months out, and fares only climb: the €30 TGV early bird becomes €150 walk-up. Book rail when you book flights — that's the whole rule. Eurostar, TGV, ICE, AVE and Frecciarossa all behave the same."], bullets: ["Eurostar: 2h20 London–Paris, book 2–3 months out.", "TGV: Paris–Avignon 2h40 from €19.", "ICE: Berlin–Munich 4h from €40.", "Frecciarossa: Rome–Florence 1h30 from €20."] },
      { heading: "The Pass Verdict", paragraphs: ["Eurail passes lose on fixed two-to-four-city itineraries since the point-to-point early-bird pricing arrived. They win on multi-stop, flexible, long routes — Switzerland's and Japan-style pass countries are the exceptions. Price your actual route, always."],
      },
      { heading: "The Scenic Lines Worth Routing For", paragraphs: ["The Gotthard Panorama (Lucerne–Lugano), the Glacier Express (Zermatt–St Moritz), the Bernina Express (to Tirano), Norway's Flåm line, Scotland's west Highland line, and the Centovalli. Some journeys justify the destination."],
      },
    ],
    route: { heading: "The Booking Sequence", intro: "When and how.", days: [
      { day: 1, theme: "Book with the flights", description: "Every intercity leg, at the early-bird window. Seat reservations on the premium trains are mandatory." },
    ] },
    practical: [
      { heading: "Money", items: ["Early-bird fares: €19–60 per leg if booked 2–3 months out.", "Walk-up fares run 3–5× higher — the only real mistake is lateness."] },
      { heading: "Station logic", items: ["European stations are central — no airport transfers anywhere.", "Arrive 20 minutes early; platforms post 15 minutes out."] },
    ],
    faq: [
      { question: "Rail pass or point-to-point?", answer: "Point-to-point booked early for fixed itineraries — passes only win on flexible multi-stop routes." },
      { question: "Do I need seat reservations?", answer: "On the premium trains (Eurostar, TGV, ICE, Frecciarossa) yes — included with booked tickets." },
      { question: "Which is Europe's most scenic line?", answer: "The Gotthard Panorama or the Bernina Express — both justify a destination choice." },
    ],
    dest: ["paris", "london", "zurich"], trips: ["europe-14d-grand-tour", "europe-10d-highlights", "switzerland-7d-alpine"],
    guides: ["europe-by-train-guide", "europe-10-day-itinerary", "europe-14-day-itinerary", "western-europe-travel-guide", "switzerland-travel-guide"],
    plannerCity: "Paris", readTime: "6 min read",
  }),
  compactGuide({
    slug: "japan-first-time-guide", title: "Japan First Time Guide: The Essentials",
    seoTitle: "Japan First Time Guide", gradient: "from-red-500 to-indigo-600", author: YUKI,
    city: "Tokyo", country: "Japan", tags: ["japan", "first time", "beginners"],
    meta: "The Japan first-timer's primer: the Suica setup, the Golden Route logic, the onsen rules, the konbini economy and the rail-pass verdict.",
    excerpt: "Everything before you land: Suica, the Golden Route, the onsen rules and the pass verdict.",
    intro: [
      "Japan's first-timer preparation is the most valuable hour in travel planning: the Suica setup, the Golden Route decision, the onsen and tattoo rules, the konbini economy, and the rail-pass verdict (usually no). This guide is the hour.",
    ],
    sections: [
      { heading: "The Setup", paragraphs: ["Suica on the phone before departure; a Google Fi or eSIM data plan; the Golden Route booking (Tokyo 3 → Hakone 1 → Kyoto 2 → Osaka 1); and one carry-on — the takkyubin luggage-shipping service moves bags between hotels for ¥2,000–2,500."], bullets: ["Suica on the phone from day one.", "The Golden Route as the first-trip shape.", "Takkyubin ships the big bag — travel with a daypack."] },
      { heading: "The Onsen Rules", paragraphs: ["Onsen are nude, sex-separated, and wash-before-you-soak. Tattoos: increasingly accepted, still refused at some houses — check ahead or book private-family baths (kashikiri). Small towels never enter the water."],
      },
      { heading: "The Rail-Pass Verdict", paragraphs: ["The nationwide JR Pass repriced ~70% in 2023 and loses on the Golden Route — point-to-point (Tokyo–Odawara, Odawara–Kyoto, Kyoto–Osaka ≈ ¥25,000 total) beats the ¥50,000 pass. Regional passes win on specific routes; price your actual itinerary."],
      },
    ],
    route: { heading: "The First Evening", intro: "Arrival hour.", days: [
      { day: 1, theme: "Land, load, wander", description: "Suica loaded, the Narita Express in, Asakusa at dusk, konbini dinner." },
    ] },
    practical: [
      { heading: "Money", items: ["Tokyo ~$120/day, Kyoto ~$140, Osaka ~$110 at planning figures.", "Cash reserve ¥15,000 for markets and small shops."] },
      { heading: "Etiquette", items: ["No calls on trains; shoes off where floors rise.", "Wash before the onsen soak; tattoos vary by house."] },
    ],
    faq: [
      { question: "Do I need the JR Pass?", answer: "Rarely on the Golden Route since the 2023 reprice — point-to-point is cheaper. Price your itinerary." },
      { question: "Can I use tattoos at the onsen?", answer: "Increasingly yes; some houses still refuse. Book private baths (kashikiri) as the safe route." },
      { question: "How do I ship luggage between hotels?", answer: "Takkyubin (Yamato) — any hotel front desk sends bags overnight for ¥2,000–2,500. It's why Japan packs light." },
    ],
    dest: ["tokyo", "kyoto", "osaka"], trips: ["japan-7d-golden-route", "japan-5d-highlights", "tokyo-kyoto-osaka-7d"],
    guides: ["japan-first-time-guide", "japan-7-day-itinerary", "japan-travel-budget", "japan-rail-travel-guide", "tokyo-first-time-guide"],
    plannerCity: "Tokyo", readTime: "6 min read",
  }),
  compactGuide({
    slug: "japan-family-travel-guide", title: "Japan Family Travel Guide",
    seoTitle: "Japan Family Travel Guide", gradient: "from-pink-500 to-sky-500", author: YUKI,
    city: "Tokyo", country: "Japan", tags: ["japan", "family", "kids"],
    meta: "Japan with kids: the Disney-and-pandas Tokyo base, the shinkansen as the day's highlight, konbini dinners and the ryokan question answered.",
    excerpt: "Japan with kids: Disney, pandas, the shinkansen and the ryokan question.",
    intro: [
      "Japan with kids is the easiest long-haul family trip: safe, clean, punctual, and full of anchors — Disney, pandas, the shinkansen itself, teamLab's wading art, and food courts where every child chooses. The keys are the one-anchor-per-day law and the konbini dinner.",
    ],
    sections: [
      { heading: "The Family Anchors", paragraphs: ["Tokyo: Ueno's pandas, teamLab Planets, Disney's two parks. Osaka: Universal's Wizarding World. Kyoto: the monkey park (Iwatayama) over the temples. The shinkansen itself is the day's event — book the Mt Fuji side seats."], bullets: ["The shinkansen as the day's highlight — window seats, Mt Fuji side.", "One anchor per day, pool or park in the afternoon.", "Food courts as family democracy."] },
      { heading: "The Ryokan Question", paragraphs: ["One ryokan night with dinner is magical for kids over six (floor beds, yukata, the onsen); under six, book the family-room business hotel instead and save the splurge. Hakone's family-friendly ryokan with private baths is the compromise."],
      },
    ],
    route: { heading: "The 7-Day Family Golden Route", intro: "Tokyo base, one ryokan, Kyoto.", days: [
      { day: 1, theme: "Tokyo — Odaiba", description: "teamLab, the Gundam, the food court." },
      { day: 2, theme: "Tokyo — pandas & temple", description: "Ueno Zoo, Senso-ji, early night." },
      { day: 3, theme: "Disney day", description: "Rope-drop, parade, fireworks." },
      { day: 4, theme: "Shinkansen & Hakone", description: "The Fuji-side seats; the family ryokan." },
      { day: 5, theme: "To Kyoto", description: "The monkey park; the lanes at dusk." },
      { day: 6, theme: "Kyoto — bamboo & Nara", description: "The grove early; the deer afternoon." },
      { day: 7, theme: "Osaka & departure", description: "The castle grounds; KIX." },
    ] },
    practical: [
      { heading: "Logistics", items: ["Book Disney, teamLab and the ryokan before flying.", "Travel after 9:30am to dodge rush hour with kids."] },
      { heading: "Money", items: ["About $130–150/day for the family at the mid tier, plus Disney tickets."] },
    ],
    faq: [
      { question: "Is Japan good with kids?", answer: "One of the best — safe, clean, punctual and full of kid-scale wonders." },
      { question: "Ryokan with young kids?", answer: "Over six, yes — the floor beds and yukata are magic. Under six, the business-hotel family room wins." },
      { question: "Which is better, Disney Tokyo or DisneySea?", answer: "Magic Kingdom for the classics; DisneySea for the one-of-a-kind theming." },
    ],
    dest: ["tokyo", "kyoto", "osaka"], trips: ["japan-7d-golden-route", "tokyo-family-4d"],
    guides: ["japan-family-travel-guide", "tokyo-family-travel-guide", "japan-7-day-itinerary", "japan-first-time-guide", "japan-travel-budget"],
    plannerCity: "Tokyo", readTime: "6 min read",
  }),
  // ── City-topic guides ────────────────────────────────────────────────
  compactGuide({
    slug: "best-things-to-do-in-tokyo", title: "Best Things to Do in Tokyo: The Honest Top 15",
    seoTitle: "Best Things to Do in Tokyo", gradient: "from-rose-500 to-purple-600", author: YUKI,
    city: "Tokyo", country: "Japan", tags: ["tokyo", "things to do"],
    meta: "The honest top 15 things to do in Tokyo: Senso-ji at dawn, Meiji's forest, Shibuya's crossing, teamLab, the depachika basements and the markets.",
    excerpt: "The honest top 15 — from dawn temples to midnight neon, ranked by what you'll remember.",
    intro: [
      "Every Tokyo 'top things to do' list is the same 30 items; the honest version is 15, ranked by what you'll actually remember a year later. Dawn temples beat tower queues; neighborhoods beat landmarks; and one meal counts as a sight.",
    ],
    sections: [
      { heading: "The Dawn Tier", paragraphs: ["Senso-ji at 7am (empty, lantern-lit), Meiji Shrine's forest before ten, and the Tsukiji Outer Market's 9am grazing — Tokyo's best hours are before the city wakes, and the jet lag hands them to you."], bullets: ["Senso-ji at dawn — the empty version.", "Meiji Shrine's forest walk.", "Tsukiji's market-morning grazing."] },
      { heading: "The Icon Tier", paragraphs: ["Shibuya Crossing at dusk (free, from the tower or the street), teamLab Planets (booked), the Shibuya Sky view, Akihabara's electric streets, and the Harajuku-to-Omotesando walk from teenage chaos to architecture."],
      },
      { heading: "The Food-as-Sight Tier", paragraphs: ["The depachika basement food halls, an omakase counter at any budget, the Omoide Yokocho yakitori alleys, and a standing-bar night in Koenji — in Tokyo the meals are the museums."],
      },
    ],
    route: { heading: "How to Sequence Them", intro: "Dawn tier early, icons mid-trip, food every night.", days: [
      { day: 1, theme: "The dawn trio", description: "Senso-ji, Meiji, Tsukiji — all before noon on one heroic day." },
    ] },
    practical: [
      { heading: "Booking", items: ["teamLab and tower slots book days ahead; everything else walks up."] },
      { heading: "Pacing", items: ["Two sights per day is the honest Tokyo maximum — pick from this list, don't complete it."] },
    ],
    faq: [
      { question: "What should I not miss in Tokyo?", answer: "Senso-ji at dawn, Meiji's forest, Shibuya at dusk and one depachika. The rest is taste." },
      { question: "Is teamLab worth it?", answer: "Yes — book Planets (the wading one) over Borderless for the sensory difference." },
      { question: "How many days to see the top 15?", answer: "Five covers them comfortably; three does the dawn and icon tiers." },
    ],
    dest: ["tokyo", "kyoto", "osaka"], trips: ["tokyo-5d-classic", "tokyo-7d-deep-dive", "tokyo-3d-foodie"],
    guides: ["best-things-to-do-in-tokyo", "tokyo-3-day-itinerary", "tokyo-food-guide", "best-neighborhoods-in-tokyo", "tokyo-at-night-guide"],
    plannerCity: "Tokyo", readTime: "6 min read",
  }),
  compactGuide({
    slug: "best-neighborhoods-in-tokyo", title: "Best Neighborhoods in Tokyo: The Twelve Cities",
    seoTitle: "Best Neighborhoods in Tokyo", gradient: "from-indigo-500 to-pink-600", author: YUKI,
    city: "Tokyo", country: "Japan", tags: ["tokyo", "neighborhoods"],
    meta: "Tokyo's twelve neighborhood-characters: Shibuya's crossing energy, Shimokitazawa's vintage, Yanaka's old lanes, Ginza's marble and Koenji's punk.",
    excerpt: "The twelve cities of Tokyo, one character each — and which three to visit per day.",
    intro: [
      "Tokyo isn't one city but a dozen stapled together, each with its own character and its own day. This guide profiles the twelve worth knowing — and the rule that one core area per day is the only way to visit them.",
    ],
    sections: [
      { heading: "The Twelve", paragraphs: ["Shibuya (the crossing energy), Shinjuku (neon and bars), Asakusa (old temples), Ueno (parks and museums), Yanaka (old lanes), Ginza (marble and department stores), Harajuku/Omotesando (fashion and architecture), Shimokitazawa (vintage and coffee), Nakameguro (canal cafés), Koenji (punk thrift), Akihabara (electric city), Odaiba (bayside future)."], bullets: ["Each neighborhood = one day, or one morning-and-evening.", "Shimokitazawa and Koenji are the locals' Tokyo.", "Yanaka is the old city most trips skip."] },
      { heading: "The Grouping Rule", paragraphs: ["East day: Asakusa + Ueno + Yanaka. West day: Meiji + Harajuku + Shibuya + Shinjuku. Center day: Ginza + the bayside. Neighborhood day: Shimokitazawa + Nakameguro + Daikanyama. Four days, four clusters, zero zig-zags."],
      },
    ],
    route: { heading: "The Four-Cluster Week", intro: "One cluster per day.", days: [
      { day: 1, theme: "East cluster", description: "Asakusa, Ueno, Yanaka — the old Tokyo." },
      { day: 2, theme: "West cluster", description: "Meiji, Harajuku, Shibuya, Shinjuku." },
      { day: 3, theme: "Center cluster", description: "Ginza, the gardens, the bayside." },
      { day: 4, theme: "Neighborhood cluster", description: "Shimokitazawa, Nakameguro, Daikanyama." },
    ] },
    practical: [
      { heading: "The rule", items: ["One cluster per day; the Yamanote loop links them all.", "Stay near a loop station — Shinjuku or Ueno."] },
      { heading: "Insider picks", items: ["Koenji's standing bars for the local night.", "Yanaka's temple lanes for the 7am walk."] },
    ],
    faq: [
      { question: "Which Tokyo neighborhood should I stay in?", answer: "Shinjuku for access and nightlife, Ueno for the old-city geometry, Shibuya for the energy." },
      { question: "Which neighborhood do locals love?", answer: "Shimokitazawa and Nakameguro — the coffee-and-vintage belt." },
      { question: "How many neighborhoods can I see in a day?", answer: "Three if they cluster; two if they don't. Clustering is the whole strategy." },
    ],
    dest: ["tokyo", "kyoto", "osaka"], trips: ["tokyo-7d-deep-dive", "tokyo-5d-classic", "tokyo-2d-highlights"],
    guides: ["best-neighborhoods-in-tokyo", "tokyo-3-day-itinerary", "tokyo-transportation-guide", "best-things-to-do-in-tokyo", "tokyo-at-night-guide"],
    plannerCity: "Tokyo", readTime: "6 min read",
  }),
  compactGuide({
    slug: "tokyo-at-night-guide", title: "Tokyo at Night: Neon, Bars and the 1am Trains",
    seoTitle: "Tokyo at Night Guide", gradient: "from-purple-600 to-rose-600", author: YUKI,
    city: "Tokyo", country: "Japan", tags: ["tokyo", "night", "nightlife"],
    meta: "Tokyo at night: Shinjuku's Golden Gai, Shibuya's crossing after dark, the izakaya alleys, night views from the towers and the last-train logistics.",
    excerpt: "Tokyo after dark: Golden Gai's alleys, the izakaya lanes, tower views and the 1am train.",
    intro: [
      "Tokyo at night is a second city: Shinjuku's Golden Gai's six-seat bars, the Omoide Yokocho smoke, Shibuya's crossing under neon, tower views over the sprawl, and the standing bars where the office workers decompress. The logistics rule everything: the last train is near 1am.",
    ],
    sections: [
      { heading: "The Night Districts", paragraphs: ["Shinjuku's Golden Gai (200 six-seat bars in six alleys — cover charges ¥500–1,000, pick the friendly one), Omoide Yokocho's yakitori smoke, Shibuya's crossing and tower, and the Roppongi and Azabu-juban dinner-and-bars tier."], bullets: ["Golden Gai: pick a bar, pay the cover, meet someone.", "Omoide Yokocho: the smoke and the skewers.", "Shibuya Sky's night slot: booked."] },
      { heading: "The Last-Train Logistics", paragraphs: ["Trains thin from midnight and stop near 1am. The strategy: dinner near the hotel, or accept the ¥3,000–5,000 taxi. The night owl alternative: drink until the first train (5am) — a Tokyo rite of passage."],
      },
    ],
    route: { heading: "The Night Out", intro: "One district, one tower, one last train.", days: [
      { day: 1, theme: "Shinjuku night", description: "Omoide Yokocho dinner, Golden Gai's bars, the 12:40 train." },
    ] },
    practical: [
      { heading: "Logistics", items: ["Last trains ~midnight–1am; taxis ¥3,000–5,000 across town.", "Golden Gai covers: ¥500–1,000 per bar."] },
      { heading: "Etiquette", items: ["No phone calls on the night trains; the platform queue is sacred."] },
    ],
    faq: [
      { question: "What time do bars close in Tokyo?", answer: "Most izakayas last-order at 11; Golden Gai's bars run until their owners sleep. Trains stop near 1am." },
      { question: "Is Golden Gai touristy?", answer: "Some bars yes, some no — the ¥500-cover seat at a six-seat bar remains a genuine Tokyo night." },
      { question: "Best night view in Tokyo?", answer: "Shibuya Sky's night slot or the free Metropolitan Government deck — both over the endless sprawl." },
    ],
    dest: ["tokyo", "osaka", "kyoto"], trips: ["tokyo-7d-deep-dive", "tokyo-2d-highlights", "tokyo-5d-classic"],
    guides: ["tokyo-at-night-guide", "best-neighborhoods-in-tokyo", "tokyo-3-day-itinerary", "tokyo-food-guide", "best-things-to-do-in-tokyo"],
    plannerCity: "Tokyo", readTime: "5 min read",
  }),
  compactGuide({
    slug: "tokyo-transportation-guide", title: "Tokyo Transportation Guide: The System, Decoded",
    seoTitle: "Tokyo Transportation Guide", gradient: "from-teal-500 to-blue-700", author: YUKI,
    city: "Tokyo", country: "Japan", tags: ["tokyo", "transportation", "transit"],
    meta: "Tokyo transit decoded: the Suica setup, JR vs Metro lines, the transfer penalty, the last train and when taxis actually make sense.",
    excerpt: "The system decoded: Suica, the line logic, the transfer penalty and the last train.",
    intro: [
      "Tokyo's transit is the world's best and its most confusing-looking: two operators (JR and Metro) running interleaved lines with different fare systems. The Suica card dissolves the confusion; the transfer penalty defines the strategy; and the last train bounds the night.",
    ],
    sections: [
      { heading: "The Suica Solution", paragraphs: ["Add Suica to your phone wallet before departure — it works on JR, Metro, Toei, buses and convenience stores with one tap. No ticket machines, no fare math, no language barrier. It is the single best setup move in Japan travel."], bullets: ["Suica on Apple/Google Wallet from home.", "One tap covers JR + Metro + buses.", "Children's Suica available at counters."] },
      { heading: "The Transfer Penalty", paragraphs: ["Every line change costs 5–10 minutes plus walking — and Tokyo's stations are vertical mazes. The strategy: one transfer maximum per journey, and cluster days by geography (our neighborhood guide's clusters)."] },
      { heading: "When Taxis Make Sense", paragraphs: ["After midnight (trains stop ~1am), in rain with luggage, and for groups of 3–4 splitting the flag-fall. Taxis are clean, honest and ¥1,000–3,000 across central Tokyo — a fair price for the last train you missed."],
      },
    ],
    route: { heading: "The Transit Day", intro: "The system in use.", days: [
      { day: 1, theme: "The tap-through day", description: "Suica taps, one transfer maximum, the last train honored." },
    ] },
    practical: [
      { heading: "Money", items: ["Metro rides ¥180–260; the day's transit rarely exceeds ¥1,000.", "No passes needed for a city stay — Suica handles it."] },
      { heading: "Logistics", items: ["Last trains ~midnight–1am; first trains ~5am.", "Google Maps' transit directions are accurate to the minute."] },
    ],
    faq: [
      { question: "Do I need a Suica card or can I use tickets?", answer: "The phone Suica — it dissolves the two-operator confusion entirely. Tickets are the hard mode." },
      { question: "JR Pass or Suica in Tokyo?", answer: "Suica — the JR Pass is for intercity rail, not city transit, and activates nothing here." },
      { question: "How bad is rush hour?", answer: "Legendary 7:30–9am — avoid with kids or luggage. The rest of the day is smooth." },
    ],
    dest: ["tokyo", "kyoto", "osaka"], trips: ["tokyo-3d-foodie", "tokyo-5d-classic", "japan-5d-highlights"],
    guides: ["tokyo-transportation-guide", "tokyo-first-time-guide", "japan-rail-travel-guide", "tokyo-3-day-itinerary", "best-neighborhoods-in-tokyo"],
    plannerCity: "Tokyo", readTime: "5 min read",
  }),
  compactGuide({
    slug: "tokyo-food-guide", title: "Tokyo Food Guide: From Konbini to Omakase",
    seoTitle: "Tokyo Food Guide", gradient: "from-orange-500 to-red-600", author: YUKI,
    city: "Tokyo", country: "Japan", tags: ["tokyo", "food"],
    meta: "The Tokyo food curriculum: sushi counters, ramen tiers, depachika basements, izakaya alleys and the konbini as infrastructure — at every price point.",
    excerpt: "The food curriculum: sushi, ramen tiers, depachika, izakaya and the konbini.",
    intro: [
      "Tokyo has more Michelin stars than any city on earth and a ¥6 ramen bowl that outranks most Western restaurants — the food guide isn't a list of restaurants but a curriculum across price tiers, from konbini to omakase.",
    ],
    sections: [
      { heading: "The Tiers", paragraphs: ["Konbini (¥500 meals that are genuinely good), teishoku lunch sets (¥900 — dinner kitchens at 60% prices), conveyor sushi (¥1,500–3,000), ramen tiers from ¥600 bowls to ¥1,500 signatures, izakaya alleys (¥3,000), depachika basement halls (grazing), and the omakase counters (¥15,000–60,000)."], bullets: ["The teishoku lunch as the budget's best trick.", "Depachika at 8pm: the day's bento at 30–50% off.", "Standing bars: the ¥1,500 social dinner."] },
      { heading: "The Specialties by District", paragraphs: ["Tsukiji's outer market for sushi breakfast, Shinjuku's Omoide Yokocho for yakitori, Nakameguro's ramen row, Kanda's curry district, Monzen-Nakacho's foie-granola monjayaki — the districts have dishes, and the dishes have addresses."],
      },
    ],
    route: { heading: "The Eating Day", intro: "Three tiers, one day.", days: [
      { day: 1, theme: "The three-tier day", description: "Konbini breakfast, teishoku lunch, izakaya alley dinner — the full curriculum for ¥4,000." },
    ] },
    practical: [
      { heading: "Money", items: ["Konbini ¥500; teishoku ¥900; conveyor sushi ¥2,000; omakase from ¥15,000.", "Cash at the small counters; cards at the depachika."] },
      { heading: "Etiquette", items: ["No eating while walking in crowded lanes.", "Slurping the ramen is correct, not rude."] },
    ],
    faq: [
      { question: "How do I eat well in Tokyo cheaply?", answer: "Konbini breakfasts, teishoku lunches and standing-bar dinners — the ¥3,000/day curriculum." },
      { question: "Do I need reservations for omakase?", answer: "Yes — 1–3 months for the famous counters via concierge or booking platforms." },
      { question: "What is depachika?", answer: "The department-store basement food halls — Tokyo's best grazing, and the 8pm discounts are the budget hack." },
    ],
    dest: ["tokyo", "osaka", "kyoto"], trips: ["tokyo-3d-foodie", "tokyo-5d-classic"],
    guides: ["tokyo-food-guide", "tokyo-foodie-guide-2026", "tokyo-travel-budget", "seoul-food-guide", "osaka-food-guide-2027"],
    plannerCity: "Tokyo", readTime: "6 min read",
  }),
  compactGuide({
    slug: "seoul-shopping-guide", title: "Seoul Shopping Guide: K-Beauty to Vintage",
    seoTitle: "Seoul Shopping Guide", gradient: "from-pink-500 to-purple-600", author: MARCUS,
    city: "Seoul", country: "South Korea", tags: ["seoul", "shopping", "k-beauty"],
    meta: "The Seoul shopping curriculum: Myeongdong's K-beauty flagships, Dongdaemun's night malls, Hongdae's vintage and the tax-refund system.",
    excerpt: "The shopping curriculum: K-beauty flagships, night malls, vintage and the tax refund.",
    intro: [
      "Seoul shopping runs on four circuits: Myeongdong's K-beauty flagships, Dongdaemun's malls that never sleep, Hongdae's vintage and streetwear, and the underground shopping centers — plus the tax-refund system that pays you back for doing it properly.",
    ],
    sections: [
      { heading: "The K-Beauty Circuit", paragraphs: ["Myeongdong is ground zero: Olive Young's mega-store (the one-stop restock), the Innisfree and Laneige flagships, and the sheet-mask economics (buy ten, they're nothing). Then the department stores — Lotte and Shinsegae — for the premium tier."], bullets: ["Olive Young: the one-stop K-beauty restock.", "Sheet-mask economics: buy in bulk.", "Department-store tax-free counters."] },
      { heading: "The Night Malls & Vintage", paragraphs: ["Dongdaemun's malls run until 5am — the wholesale fashion ecosystem. Hongdae and Common Ground's container mall carry the vintage and streetwear. Gangnam Station's underground center is the locals' secret."],
      },
      { heading: "The Tax Refund", paragraphs: ["Spends over ₩15,000 at tax-free flagged stores earn instant or airport refunds — the counters sit before security at Incheon. Keep receipts; the system pays."],
      },
    ],
    route: { heading: "The Shopping Day", intro: "Beauty by day, malls by night.", days: [
      { day: 1, theme: "Myeongdong to Dongdaemun", description: "The flagships by day, the night malls by night." },
    ] },
    practical: [
      { heading: "Money", items: ["Sheet masks ₩1,000–3,000; Olive Young hauls ₩30,000–80,000.", "Tax refund threshold ₩15,000 per store."] },
      { heading: "Logistics", items: ["Dongdaemun's malls run to 5am — jet lag's best friend.", "Bring an empty suitcase half."],
      },
    ],
    faq: [
      { question: "Where's the best K-beauty shopping?", answer: "Myeongdong's flagships for the experience, Olive Young for the one-stop haul." },
      { question: "How does the tax refund work?", answer: "Spend ₩15,000+ at flagged stores, keep receipts, refund at the airport counters before security." },
      { question: "Vintage or flagship?", answer: "Both — Hongdae's vintage morning, Myeongdong's flagship afternoon." },
    ],
    dest: ["seoul", "tokyo", "busan"], trips: ["seoul-shopping-2d", "seoul-3d-classic", "seoul-food-3d"],
    guides: ["seoul-shopping-guide", "seoul-food-guide", "seoul-travel-budget", "best-neighborhoods-in-seoul", "seoul-3-day-itinerary"],
    plannerCity: "Seoul", readTime: "5 min read",
  }),
  compactGuide({
    slug: "best-neighborhoods-in-seoul", title: "Best Neighborhoods in Seoul: The Five Personalities",
    seoTitle: "Best Neighborhoods in Seoul", gradient: "from-purple-500 to-fuchsia-600", author: MARCUS,
    city: "Seoul", country: "South Korea", tags: ["seoul", "neighborhoods"],
    meta: "Seoul's five neighborhood-personalities: the royal Jongno, the hip Hongdae, the global Itaewon, the corporate Gangnam and the artsy Seochon.",
    excerpt: "Seoul's five personalities — and the day-cluster rule that keeps you off the subway for hours.",
    intro: [
      "Seoul divides into five neighborhood-personalities: royal Jongno (palaces, hanok, Insadong), hip Hongdae (students, buskers, vintage), global Itaewon (world food, rooftops), corporate Gangnam (towers, libraries, the river), and artsy Seochon (galleries, hanok cafés). One per day keeps the subway math kind.",
    ],
    sections: [
      { heading: "The Five", paragraphs: ["Jongno: Gyeongbokgung, Bukchon, Ikseon-dong, Insadong — the royal spine. Hongdae: the student energy, busking from dusk. Itaewon: the world's kitchens and the rooftop bars. Gangnam: COEX's library, Bongeunsa's temple-among-towers, Lotte World's view. Seochon: the west-village galleries and hanok cafés."], bullets: ["Jongno = the royal day.", "Hongdae = the night day.", "Seochon = the café-and-gallery day."] },
      { heading: "The Cluster Rule", paragraphs: ["One neighborhood per day: Jongno's sights cluster walkably; Hongdae's energy runs into the night; Itaewon's food crawl spans an evening. The subway connects, but the clusters minimize it."],
      },
    ],
    route: { heading: "The Five-Day Arc", intro: "One personality per day.", days: [
      { day: 1, theme: "Jongno", description: "Palaces, Bukchon, Ikseon-dong, Insadong." },
      { day: 2, theme: "Hongdae", description: "Shopping, street food, buskers, the late night." },
      { day: 3, theme: "Itaewon", description: "World lunches, the rooftops." },
      { day: 4, theme: "Gangnam", description: "COEX, Bongeunsa, the tower, the river." },
      { day: 5, theme: "Seochon", description: "The galleries, the hanok cafés, the market." },
    ] },
    practical: [
      { heading: "The rule", items: ["One neighborhood per day; Line 2 links most.", "Stay on Line 2 — Hongdae, Euljiro or Gangnam."] },
      { heading: "Insider picks", items: ["Seochon's Seochon Village Sunday market.", "Euljiro's hip XX alleys between the two worlds."] },
    ],
    faq: [
      { question: "Which Seoul neighborhood should I stay in?", answer: "Hongdae for energy and value; Jongno for the royal access; Gangnam for the business-tier hotels." },
      { question: "Itaewon or Hongdae?", answer: "Hongdae for the youthful Korean energy; Itaewon for the global food and rooftops. Both are evenings." },
      { question: "Where do locals hang out?", answer: "Seochon's cafés, Euljiro's alleys and Mangwon's market — the neighborhoods the tourists skim." },
    ],
    dest: ["seoul", "busan", "tokyo"], trips: ["seoul-5d-culture", "seoul-3d-classic", "seoul-shopping-2d"],
    guides: ["best-neighborhoods-in-seoul", "seoul-3-day-itinerary", "seoul-transportation-guide", "seoul-food-guide", "seoul-shopping-guide"],
    plannerCity: "Seoul", readTime: "5 min read",
  }),
  compactGuide({
    slug: "seoul-transportation-guide", title: "Seoul Transportation Guide: The T-money System",
    seoTitle: "Seoul Transportation Guide", gradient: "from-blue-600 to-purple-600", author: MARCUS,
    city: "Seoul", country: "South Korea", tags: ["seoul", "transportation", "transit"],
    meta: "Seoul transit decoded: the T-money card, the Line 2 logic, the KTX connections, the midnight trains and when taxis make sense.",
    excerpt: "Transit decoded: T-money, Line 2, the KTX and the midnight trains.",
    intro: [
      "Seoul's transit is the world's most underrated: spotless, English-signposted, cheap and 24-hour on the key lines. The T-money card dissolves everything; Line 2 circles the city; the KTX connects the country.",
    ],
    sections: [
      { heading: "The T-money Setup", paragraphs: ["Buy at any convenience store (₩4,000) or load on your phone — it covers subway, buses, taxis and convenience stores. Transfers between subway and bus are free within 30 minutes. The system does the math; you tap."], bullets: ["T-money at any CU or GS25.", "Free subway-bus transfers within 30 minutes.", "Phone T-money via the app or Samsung Pay."] },
      { heading: "The Line 2 Logic", paragraphs: ["Line 2 is the loop — Hongdae, City Hall, Gangnam, and everywhere between. Stay near it and every first-timer destination is one ride. Line 3 adds the palaces; the KTX at Seoul Station connects Busan in 2h40."],
      },
      { heading: "Midnight & Taxis", paragraphs: ["Key lines run past midnight; the last trains thin after 1am. Taxis are metered, cheap and safe — the base fare is ₩4,800 — and the late-night surcharge still beats most cities' day rates."],
      },
    ],
    route: { heading: "The Transit Day", intro: "The system in use.", days: [
      { day: 1, theme: "The tap-through day", description: "T-money taps, Line 2's loop, the 30-minute transfer trick." },
    ] },
    practical: [
      { heading: "Money", items: ["Subway rides ₩1,400–2,000; the day rarely exceeds ₩5,000.", "No passes needed — T-money handles it."] },
      { heading: "Logistics", items: ["The KTX to Busan: 2h40, tickets same-day.", "Last trains thin after midnight; taxis fill the gap cheaply."] },
    ],
    faq: [
      { question: "T-money card or phone?", answer: "Either — the physical card is easier to share; the phone version never runs out at the gate." },
      { question: "Do I need the Discover Seoul Pass?", answer: "Only if museum-hopping heavily — T-money plus individual entries wins for most trips." },
      { question: "How do I get to Busan?", answer: "The KTX from Seoul Station, 2h40, tickets same-day at the machines." },
    ],
    dest: ["seoul", "busan", "jeju"], trips: ["seoul-3d-classic", "korea-7d-seoul-busan", "seoul-5d-culture"],
    guides: ["seoul-transportation-guide", "seoul-first-time-guide", "seoul-3-day-itinerary", "seoul-travel-budget", "south-korea-travel-guide"],
    plannerCity: "Seoul", readTime: "5 min read",
  }),
  compactGuide({
    slug: "paris-food-guide", title: "Paris Food Guide: Bistros, Bakeries and the Formule",
    seoTitle: "Paris Food Guide", gradient: "from-amber-500 to-rose-500", author: SOFIA,
    city: "Paris", country: "France", tags: ["paris", "food"],
    meta: "The Paris food curriculum: bakery breakfasts, the formule lunch trick, bistros vs brasseries, market picnics and the pâtisserie circuit.",
    excerpt: "The food curriculum: bakeries, the formule trick, bistros and the pâtisserie circuit.",
    intro: [
      "Paris eating runs on a curriculum, not a list: bakery breakfasts, the formule lunch (the same kitchens at a third of dinner prices), market picnics, bistro dinners, and the pâtisserie circuit as dessert-based sightseeing.",
    ],
    sections: [
      { heading: "The Formule Trick", paragraphs: ["The formule/prix-fixe lunch is Paris's honest bargain: two or three courses at €14–22 in kitchens that charge €45 at dinner. Book nothing; walk in at 12:30; eat like the neighborhood."], bullets: ["Formule lunch: €14–22, the best value in Western Europe.", "Bakery breakfasts: €3 and better than hotel buffets.", "Market picnics: €10 along the Seine."] },
      { heading: "Bistros vs Brasseries", paragraphs: ["The bistro is small, chef-owned and seasonal; the brasserie is grand, Alsatian and open late. Both matter: the bistro for the formule lunch, the brasserie for the 11pm oysters-and-choucroute. The café terrace is for the coffee and the people-watching."],
      },
      { heading: "The Pâtisserie Circuit", paragraphs: ["Pierre Hermé's macarons, Du Pain et des Idées' escargots, Angelina's chocolate, Cédric Grolet's fruit sculptures — the circuit is real sightseeing. One per day, eaten on a bench, is the Paris rule."],
      },
    ],
    route: { heading: "The Eating Day", intro: "Three meals, one city.", days: [
      { day: 1, theme: "The three-meal day", description: "Bakery breakfast, formule lunch, picnic dinner — and one pâtisserie between." },
    ] },
    practical: [
      { heading: "Money", items: ["Bakery breakfast €3; formule lunch €14–22; bistro dinner €35–50.", "The splurge: one Michelin-tier table per trip."] },
      { heading: "Etiquette", items: ["Bonjour on entry; l'addition when you want the bill.", "Bread goes on the table, not the plate."] },
    ],
    faq: [
      { question: "What's the formule lunch?", answer: "The fixed-price lunch menu — the same kitchens as dinner at a third of the price. Paris's best-kept open secret." },
      { question: "Do I need reservations?", answer: "For dinner yes (1–2 weeks), for the formule lunch no — walk in at 12:30." },
      { question: "Best bakery in Paris?", answer: "Du Pain et des Idées for the escargots; your corner boulangerie for the daily croissant." },
    ],
    dest: ["paris", "london", "amsterdam"], trips: ["paris-food-3d", "paris-3d-classic", "paris-weekend"],
    guides: ["paris-food-guide", "paris-travel-budget", "paris-3-day-itinerary", "barcelona-food-guide", "paris-shopping-guide-2026"],
    plannerCity: "Paris", readTime: "5 min read",
  }),
  compactGuide({
    slug: "best-neighborhoods-in-paris", title: "Best Neighborhoods in Paris: The Village Map",
    seoTitle: "Best Neighborhoods in Paris", gradient: "from-pink-500 to-indigo-600", author: SOFIA,
    city: "Paris", country: "France", tags: ["paris", "neighborhoods"],
    meta: "Paris's village map: Saint-Germain, Le Marais, Montmartre, the Latin Quarter, Canal Saint-Martin and the arrondissement logic behind them.",
    excerpt: "The village map: six neighborhoods, one day each, the arrondissement logic decoded.",
    intro: [
      "Paris is twenty arrondissements spiraling like a snail, but the traveler's map is six villages: Saint-Germain (the classic Left Bank), Le Marais (the style village), Montmartre (the hill), the Latin Quarter (the students), Canal Saint-Martin (the local Paris) and Passy/Batignolles (the bourgeois hideouts). One per day keeps the Métro math kind.",
    ],
    sections: [
      { heading: "The Six Villages", paragraphs: ["Saint-Germain-des-Prés (cafés, galleries, the classic), Le Marais (boutiques, falafel, Place des Vosges, open Sundays), Montmartre (the butte's lanes and the view), the Latin Quarter (students, bookshops, cheap charm), Canal Saint-Martin (iron footbridges, wine bars), Batignolles/Passy (the residential Paris)."], bullets: ["Le Marais stays open Sundays — plan around it.", "Canal Saint-Martin is the local evening.", "Montmartre is the morning village — before the crowds."] },
      { heading: "The Arrondissement Logic", paragraphs: ["The numbers spiral outward from the Louvre: 1st–8th are the classic core, 11th–20th are the residential rings. A hotel in the 4th, 5th, 6th or 7th puts the villages at walking distance."],
      },
    ],
    route: { heading: "The Six-Day Map", intro: "One village per day.", days: [
      { day: 1, theme: "Saint-Germain", description: "The cafés, the galleries, the Luxembourg gardens." },
      { day: 2, theme: "Le Marais", description: "The boutiques, the Vosges, the falafel." },
      { day: 3, theme: "Montmartre", description: "The butte's lanes, the morning view." },
      { day: 4, theme: "Latin Quarter", description: "The bookshops, the Pantheon, the cheap charm." },
      { day: 5, theme: "Canal Saint-Martin", description: "The footbridges, the wine bars." },
      { day: 6, theme: "The hideouts", description: "Batignolles and Passy's residential calm." },
    ] },
    practical: [
      { heading: "The rule", items: ["One village per day; the 4th–7th arrondissements are the walking base.", "The Marais on Sundays; the others respect the day of rest."] },
      { heading: "Booking", items: ["Hotels in the 4th–7th: 6–10 weeks ahead for June and September."] },
    ],
    faq: [
      { question: "Which Paris neighborhood should I stay in?", answer: "Saint-Germain for the classic, Le Marais for the style, the Latin Quarter for the budget." },
      { question: "What's open on Sundays?", answer: "Le Marais — the shops, the falafel, the museums. Plan the Sunday there." },
      { question: "Is Montmartre worth staying in?", answer: "For the atmosphere yes; for the logistics, it's a Métro ride from everything else." },
    ],
    dest: ["paris", "london", "amsterdam"], trips: ["paris-5d-art-food", "paris-3d-classic", "paris-weekend"],
    guides: ["best-neighborhoods-in-paris", "paris-3-day-itinerary", "best-areas-to-stay-in-paris", "paris-food-guide", "paris-transportation-guide"],
    plannerCity: "Paris", readTime: "5 min read",
  }),
  compactGuide({
    slug: "paris-transportation-guide", title: "Paris Transportation Guide: Métro, Vélib' and the RER",
    seoTitle: "Paris Transportation Guide", gradient: "from-blue-600 to-pink-500", author: SOFIA,
    city: "Paris", country: "France", tags: ["paris", "transportation", "transit"],
    meta: "Paris transit decoded: contactless tap-in, the Métro line logic, the RER to Versailles, Vélib' bikes and the airport connections.",
    excerpt: "Transit decoded: the tap-in, the line logic, the RER and the bikes.",
    intro: [
      "Paris transit decoded: contactless cards tap directly at the gates, the Métro's numbered lines follow a learnable logic, the RER C reaches Versailles, and the Vélib' bikes solve the last mile. The center is walkable — the Métro is for the outskirts.",
    ],
    sections: [
      { heading: "The Tap-In Solution", paragraphs: ["Contactless bank cards tap directly at Métro and bus gates — no Navigo purchase needed for a short stay. Single tickets (t+ €2.15) or ten-packs work; the day you ride more than five times, the carnet wins."], bullets: ["Contactless tap at every gate.", "t+ tickets €2.15; carnets of ten cheaper.", "Line 1 and 4 cover the first-timer geometry."] },
      { heading: "The RER & the Airports", paragraphs: ["RER C reaches Versailles (40 minutes); RER B links CDG (50 minutes) and Orly via the Orlyval. The Gare du Nord is the Eurostar terminus — city-center to city-center, as it should be."],
      },
      { heading: "Vélib' & Walking", paragraphs: ["The Vélib' bike-share takes foreign cards via the app — €5/day covers unlimited 45-minute rides. And the center is walkable: never more than 30 minutes between the first-timer sights."],
      },
    ],
    route: { heading: "The Transit Day", intro: "The system in use.", days: [
      { day: 1, theme: "The tap-through day", description: "Contactless taps, one RER to Versailles, the Vélib' for the canal." },
    ] },
    practical: [
      { heading: "Money", items: ["t+ tickets €2.15; the day's transit rarely exceeds €8.", "Vélib' €5/day; the RER to Versailles ~€5 each way."] },
      { heading: "Logistics", items: ["CDG: RER B 50 minutes. Orly: Orlyval+RER B.", "Pickpocket awareness on Line 1 and 4 — normal rules."] },
    ],
    faq: [
      { question: "Do I need a Navigo card?", answer: "Not for a short stay — contactless tap-in covers it. Navigo Découverte wins only on heavy week-long use." },
      { question: "Métro or Vélib'?", answer: "Métro for distance, Vélib' for the flat river-and-canal days, walking for the center." },
      { question: "How do I get to Versailles?", answer: "RER C from central Paris, 40 minutes, ~€5 each way — first train out is the whole strategy." },
    ],
    dest: ["paris", "london"], trips: ["paris-3d-classic", "paris-weekend", "paris-5d-art-food"],
    guides: ["paris-transportation-guide", "paris-first-time-guide", "paris-3-day-itinerary", "paris-travel-budget", "paris-5-day-itinerary"],
    plannerCity: "Paris", readTime: "5 min read",
  }),
  compactGuide({
    slug: "rome-transportation-guide", title: "Rome Transportation Guide: Metro, Feet and the Flat City",
    seoTitle: "Rome Transportation Guide", gradient: "from-orange-600 to-slate-700", author: SOFIA,
    city: "Rome", country: "Italy", tags: ["rome", "transportation", "transit"],
    meta: "Rome transit decoded: the two-line Metro, the walkable centro, the airport flat fares, and the tap-in ticket system that covers it all.",
    excerpt: "Transit decoded: two Metro lines, walkable feet and the flat fares.",
    intro: [
      "Rome's transit secret: the centro storico is walkable, the Metro has just three lines, and the airport flat fares are honest. The strategy is feet first, Metro for the outliers (Vatican, Colosseum), and the Leonardo Express or the €55 taxi from Fiumicino.",
    ],
    sections: [
      { heading: "The Feet-First Strategy", paragraphs: ["Pantheon, Navona, Campo de' Fiori, Trevi and the Spanish Steps cluster within a 25-minute walk. The centro storico's cobbles punish wheels but reward pedestrians — comfortable shoes are the transport plan."], bullets: ["The centro is 25 minutes end to end on foot.", "Metro A: Vatican ↔ Termini. Metro B: Colosseum.", "Cobblestones: real soles, not sandals."] },
      { heading: "The Airport Arithmetic", paragraphs: ["Fiumicino: the Leonardo Express train (32 minutes, €14) or the €55 flat-fare taxi into the center. Ciampino: the buses. Both airports sit outside the Metro system — the train is the honest option."],
      },
      { heading: "The Ticket System", paragraphs: ["Tap-to-ride contactless cards work on Metro and buses — no ticket purchase needed. Single tickets (BIT, €1.50) cover 100 minutes of transit; 24/48/72-hour passes exist for the museum-marathon days."],
      },
    ],
    route: { heading: "The Transit Day", intro: "The system in use.", days: [
      { day: 1, theme: "The walk-and-tap day", description: "The centro on foot, Metro A to the Vatican, the tap-through ticket." },
    ] },
    practical: [
      { heading: "Money", items: ["BIT ticket €1.50 (100 minutes); 24-hour pass €7.", "Fiumicino taxi flat fare €55; Leonardo Express €14."] },
      { heading: "Logistics", items: ["Watch bags on bus 64 and at Termini — the classic pickpocket routes.", "The Metro closes at 11:30pm; the centro's evening is walked."] },
    ],
    faq: [
      { question: "Do I need a Roma Pass?", answer: "Rarely — the transit is cheap and the big sights need timed bookings anyway. Price it against your list." },
      { question: "Metro or walk in Rome?", answer: "Walk the centro, Metro for the Vatican and Colosseum outliers." },
      { question: "How do I get from Fiumicino?", answer: "Leonardo Express (32 min, €14) or the €55 flat-fare taxi. Both honest; the train for one or two, the taxi for three." },
    ],
    dest: ["rome", "florence", "naples"], trips: ["rome-3d-classics", "rome-food-3d", "italy-7d-classics"],
    guides: ["rome-transportation-guide", "rome-3-day-itinerary", "rome-first-time-guide", "italy-travel-guide", "rome-travel-budget"],
    plannerCity: "Rome", readTime: "5 min read",
  }),
  compactGuide({
    slug: "best-areas-to-stay-in-rome", title: "Best Areas to Stay in Rome: Five Neighborhoods",
    seoTitle: "Best Areas to Stay in Rome", gradient: "from-red-500 to-amber-600", author: SOFIA,
    city: "Rome", country: "Italy", tags: ["rome", "where to stay", "neighborhoods"],
    meta: "Where to stay in Rome: Monti for the charm, the Centro Storico for the walkability, Trastevere for the nights, Prati for the Vatican and Termini for the budget.",
    excerpt: "Five neighborhoods: Monti, the Centro, Trastevere, Prati and the Termini budget belt.",
    intro: [
      "Where you sleep in Rome decides whether the evenings are trattoria walks or Metro commutes. Five areas cover every trip: Monti (the charming center), the Centro Storico (the walkable core), Trastevere (the nightlife village), Prati (the Vatican-side calm) and the Termini belt (the budget logistics).",
    ],
    sections: [
      { heading: "The Five", paragraphs: ["Monti: cobbled lanes, wine bars, ten minutes from the Colosseum — the charm pick. Centro Storico: Pantheon-adjacent, walkable to everything — the convenience pick at a premium. Trastevere: the nightlife village across the river — the evening pick. Prati: calm, kosher bakeries, Vatican-adjacent — the family pick. Termini: budget hotels and transit links — the logistics pick."], bullets: ["Monti: the charm pick, ten minutes from everything ancient.", "Trastevere: book the room away from the pub streets.", "Termini: honest budget, watch the block not the zone."] },
      { heading: "The Booking Logic", paragraphs: ["April–May and October book 8–10 weeks out; the room sizes run small at every tier — read square meters. Air conditioning is now standard but verify in July–August."],
      },
    ],
    route: { heading: "The Decision Tree", intro: "Answer one question.", days: [
      { day: 1, theme: "Charm, convenience, or budget?", description: "Charm → Monti. Convenience → Centro Storico. Nights → Trastevere. Family → Prati. Budget → Termini's quiet blocks." },
    ] },
    practical: [
      { heading: "Booking notes", items: ["8–10 weeks ahead for April–May and October.", "Read square meters — Roman doubles run 14–16m²."] },
      { heading: "Neighborhood notes", items: ["Ask for the courtyard-facing room ('cortile') for quiet.", "Trastevere's hills: the beautiful side is the steep side."] },
    ],
    faq: [
      { question: "What's the best area for first-timers?", answer: "Monti — the charm of the center at slightly softer prices, ten minutes from the Colosseum." },
      { question: "Is Trastevere too far?", answer: "No — it's a 15-minute walk across the river, and the evenings are the reason to stay there." },
      { question: "Where should budget travelers stay?", answer: "The Termini belt's quiet side streets — honest hotels, superb transit, walk to Monti." },
    ],
    dest: ["rome", "florence", "naples"], trips: ["rome-3d-classics", "rome-food-3d", "italy-7d-classics"],
    guides: ["best-areas-to-stay-in-rome", "rome-3-day-itinerary", "rome-transportation-guide", "rome-travel-budget", "rome-food-guide"],
    plannerCity: "Rome", readTime: "5 min read",
  }),
  compactGuide({
    slug: "singapore-food-guide", title: "Singapore Food Guide: The Hawker Curriculum",
    seoTitle: "Singapore Food Guide", gradient: "from-emerald-500 to-orange-500", author: MARCUS,
    city: "Singapore", country: "Singapore", tags: ["singapore", "food", "hawker"],
    meta: "The Singapore food curriculum: chicken rice dynasties, char kway teow woks, laksa legacies, kaya toast mornings and the Michelin hawker stars.",
    excerpt: "The hawker curriculum: chicken rice, char kway teow, laksa and the Michelin stars.",
    intro: [
      "Singapore's food guide is a curriculum, not a list: the hawker centers are the classrooms, the queue is the rating system, and the dishes — chicken rice, char kway teow, laksa, kaya toast — are the degree requirements. Michelin stars sit in the same rooms as $4 noodles.",
    ],
    sections: [
      { heading: "The Core Dishes", paragraphs: ["Hainanese chicken rice (Tian Tian at Maxwell), char kway teow's wok hei, Katong laksa's coconut spice, Hokkien mee, carrot cake (neither carrot nor cake), bak kut teh's pepper broth, and kaya toast with soft eggs for breakfast."], bullets: ["Tian Tian's chicken rice — the queue is honest.", "Hill Street Tai Hwa's Michelin-starred bak chor mee.", "Ya Kun's kaya toast since 1944."] },
      { heading: "The Hawker Center Map", paragraphs: ["Maxwell (Chinatown's tourist-friendly greats), Lau Pa Sat (satay street under the towers), Old Airport Road (the locals' depth), Tiong Bahru (the heritage market), Chinatown Complex (the biggest). One per meal is the dose."],
      },
    ],
    route: { heading: "The Eating Day", intro: "Three hawker centers, one day.", days: [
      { day: 1, theme: "The curriculum day", description: "Kaya toast morning, Maxwell lunch, Lau Pa Sat satay dinner." },
    ] },
    practical: [
      { heading: "Money", items: ["Hawker meals S$4–8; the Michelin-tier bowls under S$6.", "Restaurant splurges S$60+ — balance deliberately."] },
      { heading: "Etiquette", items: ["Chope the seat with a tissue packet — the national reservation system.", "Queue where the aunties queue."] },
    ],
    faq: [
      { question: "What must I eat in Singapore?", answer: "Chicken rice, char kway teow, laksa and kaya toast — the four core courses of the curriculum." },
      { question: "Is hawker food safe?", answer: "Extremely — the centers are licensed and inspected; the queues prove the turnover." },
      { question: "Which hawker center first?", answer: "Maxwell for the icons and the accessibility; Old Airport Road for the depth." },
    ],
    dest: ["singapore", "kuala-lumpur"], trips: ["singapore-food-3d", "singapore-2d-highlights", "singapore-3d-family"],
    guides: ["singapore-food-guide", "singapore-travel-budget", "singapore-3-day-itinerary", "things-to-do-in-singapore", "kuala-lumpur-3-day-itinerary"],
    plannerCity: "Singapore", readTime: "5 min read",
  }),
  compactGuide({
    slug: "things-to-do-in-singapore", title: "Things to Do in Singapore: The Honest Ten",
    seoTitle: "Things to Do in Singapore", gradient: "from-green-500 to-blue-600", author: MARCUS,
    city: "Singapore", country: "Singapore", tags: ["singapore", "things to do"],
    meta: "The honest ten things to do in Singapore: the Gardens at both shows, the hawker centers, Pulau Ubin's wild, the Botanic Gardens and the skyline walks.",
    excerpt: "The honest ten — gardens, hawkers, Ubin and the skyline walks.",
    intro: [
      "Singapore's honest top-ten isn't a list of malls: the Gardens at both light shows, the hawker curriculum, Pulau Ubin's kampong wild, the Botanic Gardens' UNESCO orchids, and the skyline walks that cost nothing.",
    ],
    sections: [
      { heading: "The Free Tier", paragraphs: ["Gardens by the Bay's outdoor Supertree walks and the nightly Garden Rhapsody (7:45pm), the Marina Bay loop, the Botanic Gardens' National Orchid (small fee, worth it), and the Southern Ridges' canopy walk."], bullets: ["Garden Rhapsody: 7:45pm nightly, free.", "The Marina Bay loop at golden hour.", "The Southern Ridges' treetop walk."] },
      { heading: "The Paid Tier", paragraphs: ["The Cloud Forest conservatory (S$32 paired with the Flower Dome), the National Gallery's Southeast Asian vaults, the Cable Car to Sentosa, and the Skypark's view — one or two per trip, chosen honestly."],
      },
      { heading: "The Wild Card", paragraphs: ["Pulau Ubin: a S$4 bumboat to the kampong island of bicycles, wild boar and the Chek Jawa wetlands — the Singapore that existed before the skyline."],
      },
    ],
    route: { heading: "The Sequencing", intro: "Free mornings, paid middays, shows after dark.", days: [
      { day: 1, theme: "The bay day", description: "Gardens at 9, Cloud Forest at noon, Rhapsody at 7:45." },
    ] },
    practical: [
      { heading: "Booking", items: ["Cloud Forest slots and the Skypark book days ahead.", "Pulau Ubin needs nothing but the bumboat schedule."] },
      { heading: "Pacing", items: ["Two sights per day; the heat is the third."] },
    ],
    faq: [
      { question: "What should I not miss in Singapore?", answer: "The Gardens at both shows, one great hawker center, and Pulau Ubin if the time allows." },
      { question: "Is Sentosa worth it?", answer: "With kids, yes (the beaches and luge). Without, the neighborhoods and Ubin beat it." },
      { question: "How many days to see the top ten?", answer: "Three for the core; five for the full honest ten." },
    ],
    dest: ["singapore", "kuala-lumpur", "bali"], trips: ["singapore-2d-highlights", "singapore-3d-family", "singapore-food-3d"],
    guides: ["things-to-do-in-singapore", "singapore-3-day-itinerary", "singapore-food-guide", "singapore-travel-budget", "singapore-transportation-guide"],
    plannerCity: "Singapore", readTime: "5 min read",
  }),
  compactGuide({
    slug: "best-areas-to-stay-in-singapore", title: "Best Areas to Stay in Singapore",
    seoTitle: "Best Areas to Stay in Singapore", gradient: "from-teal-500 to-blue-700", author: MARCUS,
    city: "Singapore", country: "Singapore", tags: ["singapore", "where to stay", "neighborhoods"],
    meta: "Where to stay in Singapore: Chinatown's heritage shophouses, Kampong Glam's murals, the Marina Bay towers and the Bugis value belt.",
    excerpt: "Four areas: Chinatown's heritage, Kampong Glam's style, Marina Bay's towers, Bugis's value.",
    intro: [
      "Singapore's hotel decision is a neighborhood choice: Chinatown's heritage shophouses (the value-heritage pick), Kampong Glam's murals and boutiques (the style pick), the Marina Bay towers (the splurge), and the Bugis belt (the honest middle). The MRT makes them all ten minutes from the bay.",
    ],
    sections: [
      { heading: "The Four", paragraphs: ["Chinatown: boutique hotels in restored shophouses, hawker centers at the door — the character-value pick. Kampong Glam: Haji Lane's independents and Sultan Mosque's calls — the style pick. Marina Bay: the bay-view towers — the splurge. Bugis: mid-range chains between the heritage districts — the honest middle."], bullets: ["Chinatown: shophouse boutique hotels from S$120.", "Marina Bay: the splurge with the view.", "Bugis: the value belt, one MRT stop from everything."] },
      { heading: "The Booking Logic", paragraphs: ["F1 week (late September/early October) doubles every rate in the city — avoid it or embrace it. December's holidays add 20–30%.", "Book 6–8 weeks ahead in normal seasons; months ahead for the event weeks."] },
    ],
    route: { heading: "The Decision Tree", intro: "Answer one question.", days: [
      { day: 1, theme: "Heritage, style, view or value?", description: "Heritage → Chinatown. Style → Kampong Glam. View → Marina Bay. Value → Bugis." },
    ] },
    practical: [
      { heading: "Booking notes", items: ["The MRT covers all four in under 15 minutes.", "Heritage hotels: ask for the shophouse-facing rooms."] },
      { heading: "Money", items: ["S$120–250 mid-range, S$350+ for the bay views.", "The hotel is the budget's biggest lever — choose honestly."] },
    ],
    faq: [
      { question: "What's the best area for first-timers?", answer: "Chinatown — heritage character, hawker centers at the door, two MRT stops from the bay." },
      { question: "Is Marina Bay worth the splurge?", answer: "One night of it, for the view — then move to Chinatown for the character." },
      { question: "When should I book?", answer: "6–8 weeks normally; months ahead for F1 week and December." },
    ],
    dest: ["singapore", "kuala-lumpur", "bali"], trips: ["singapore-2d-highlights", "singapore-food-3d", "singapore-3d-family"],
    guides: ["best-areas-to-stay-in-singapore", "singapore-3-day-itinerary", "singapore-travel-budget", "singapore-food-guide", "singapore-transportation-guide"],
    plannerCity: "Singapore", readTime: "4 min read",
  }),
  compactGuide({
    slug: "singapore-transportation-guide", title: "Singapore Transportation Guide: The MRT and Beyond",
    seoTitle: "Singapore Transportation Guide", gradient: "from-emerald-600 to-blue-700", author: MARCUS,
    city: "Singapore", country: "Singapore", tags: ["singapore", "transportation", "transit"],
    meta: "Singapore transit decoded: contactless MRT tap-in, the underground-link middays, Grab vs the MRT, and the Changi arrival advantage.",
    excerpt: "Transit decoded: the contactless MRT, the underground middays and Grab.",
    intro: [
      "Singapore transit is the easiest in Asia: contactless foreign cards tap directly at the MRT gates, the network covers everything in 15-minute rides, and the Changi airport connection is the world's best. The heat, not the distance, is what you're planning around.",
    ],
    sections: [
      { heading: "The Contactless MRT", paragraphs: ["Foreign contactless cards and phones tap directly at the MRT and bus gates — no tourist pass needed. Rides run S$1–2.50; the day rarely exceeds S$5. The network covers every sight in this guide's itineraries."], bullets: ["Foreign contactless cards tap directly.", "Rides S$1–2.50; fares capped daily.", "The underground city-link malls for the hot middays."] },
      { heading: "Grab vs MRT", paragraphs: ["Grab (ride-hail) costs 3–5× the MRT but solves the rain and the shopping bags. The strategy: MRT by default, Grab for the airport with luggage and the tropical downpours."],
      },
      { heading: "The Changi Advantage", paragraphs: ["Changi's Jewel (the indoor waterfall) is worth an arrival hour by itself; the city is 20 minutes by MRT or 25 by Grab. Plan the departure early — the airport is a destination."],
      },
    ],
    route: { heading: "The Transit Day", intro: "The system in use.", days: [
      { day: 1, theme: "The tap-through day", description: "Contactless taps, the underground malls at noon, Grab only for the rain." },
    ] },
    practical: [
      { heading: "Money", items: ["MRT rides S$1–2.50; the day under S$5.", "Grab rides S$8–20 depending on distance and surge."] },
      { heading: "Logistics", items: ["The MRT runs 5:30am–midnight; Grab fills the night.", "The underground links connect downtown hotels to the malls."] },
    ],
    faq: [
      { question: "Do I need an EZ-Link card?", answer: "No — foreign contactless cards and phones tap directly at the gates." },
      { question: "MRT or Grab?", answer: "MRT by default; Grab for the rain, the luggage and the 11pm hawker run." },
      { question: "Is Changi really worth arriving early for?", answer: "Yes — the Jewel waterfall, the gardens and the food courts make it the world's best airport." },
    ],
    dest: ["singapore", "kuala-lumpur", "bali"], trips: ["singapore-2d-highlights", "singapore-food-3d", "singapore-garden-city"],
    guides: ["singapore-transportation-guide", "singapore-3-day-itinerary", "singapore-first-time-guide", "singapore-travel-budget", "singapore-travel-guide"],
    plannerCity: "Singapore", readTime: "4 min read",
  }),
  compactGuide({
    slug: "bangkok-food-guide", title: "Bangkok Food Guide: Street Food Capital",
    seoTitle: "Bangkok Food Guide", gradient: "from-red-500 to-amber-600", author: PRIYA,
    city: "Bangkok", country: "Thailand", tags: ["bangkok", "food", "street food"],
    meta: "The Bangkok food curriculum: pad thai woks, boat noodles, Yaowarat's Chinatown blaze, mango sticky rice and the Michelin street legends.",
    excerpt: "The street-food capital's curriculum: woks, boat noodles, Yaowarat and the mango sticky rice.",
    intro: [
      "Bangkok is the street-food capital of the world: pad thai fired to order, boat noodles by the bowl, Yaowarat's Chinatown blaze after dark, and mango sticky rice as the national dessert — at $1–3 per plate, with Michelin stars working the same woks.",
    ],
    sections: [
      { heading: "The Core Dishes", paragraphs: ["Pad thai (Thipsamai's egg-wrapped legend), boat noodles' dark broths by the bowl, som tam's papaya pound, khao soi if you detour north, mango sticky rice at Mae Varee, and the crab omelet at Jay Fai's Michelin wok."], bullets: ["Thipsamai's pad thai — queue at 6pm.", "Jay Fai's crab omelet — the Michelin street legend.", "Mae Varee's mango sticky rice."] },
      { heading: "The District Map", paragraphs: ["Yaowarat (Chinatown) after dark is the street-food capital's capital; the Old Town's Tha Tien stalls feed the temple mornings; Or Tor Kor market sells the perfect fruit; the Ratchada night market adds the neon wheel."],
      },
    ],
    route: { heading: "The Eating Day", intro: "Three meals, three districts.", days: [
      { day: 1, theme: "The blaze day", description: "Old Town noodles by the temples, Yaowarat's blaze after dark, chestnut desserts." },
    ] },
    practical: [
      { heading: "Money", items: ["Street meals $1–3; Jay Fai's crab omelet $30+.", "The mango sticky rice pilgrimage: $2."] },
      { heading: "Etiquette", items: ["Eat where the plastic stools are full.", "Spice levels: 'mai phet' (not spicy) is honored, mostly."] },
    ],
    faq: [
      { question: "What must I eat in Bangkok?", answer: "Pad thai from a wok, boat noodles by the bowl, Yaowarat's evening blaze and the mango sticky rice." },
      { question: "Is street food safe?", answer: "Yes — the turnover at the busy woks is the safety system. Queue where the locals queue." },
      { question: "Is Jay Fai worth it?", answer: "The crab omelet is genuinely great; the queue is the price. The honest alternative two stalls down is also excellent." },
    ],
    dest: ["bangkok", "chiang-mai", "phuket"], trips: ["bangkok-food-3d", "bangkok-3d-temples-markets", "thailand-10d-bangkok-islands"],
    guides: ["bangkok-food-guide", "bangkok-night-markets-guide-2026", "bangkok-3-day-itinerary", "thailand-travel-guide", "bangkok-nightlife-guide"],
    plannerCity: "Bangkok", readTime: "5 min read",
  }),
  compactGuide({
    slug: "bangkok-nightlife-guide", title: "Bangkok Nightlife Guide: Rooftops, Bars and the Night Markets",
    seoTitle: "Bangkok Nightlife Guide", gradient: "from-purple-600 to-red-600", author: PRIYA,
    city: "Bangkok", country: "Thailand", tags: ["bangkok", "nightlife", "night"],
    meta: "Bangkok after dark: the skyline rooftops, Chinatown's neon blaze, the night markets and the Thonglor cocktail tier — with the BTS midnight logistics.",
    excerpt: "Bangkok after dark: rooftops, Yaowarat's neon, night markets and the cocktails.",
    intro: [
      "Bangkok after dark splits into three moods: the skyline rooftops (the city's best views at cocktail prices), Yaowarat's Chinatown neon (the street-food blaze), and the night markets (Ratchada's wheel, Asiatique's riverside calm). The BTS Skytrain runs until midnight — plan around it.",
    ],
    sections: [
      { heading: "The Rooftop Tier", paragraphs: ["The classic rooftops (Vertigo and Moon Bar, Sky Bar at Lebua) charge for the view and deliver it; the Thonglor and Ekkamai cocktail bars serve the craft tier at half the price. One skyline drink per trip is the sustainable dose."], bullets: ["Vertigo's 61st-floor open-air deck.", "The Thonglor cocktail bars at local prices.", "The sunset slot beats the midnight slot."] },
      { heading: "The Night Markets", paragraphs: ["Ratchada's neon ferris wheel and flea stalls, the Yaowarat street-food blaze from 7pm, Asiatique's calmer riverside version, and the Khao San Road's backpacker institution — pick the mood, not the list."],
      },
    ],
    route: { heading: "The Night Out", intro: "One skyline, one market, one last train.", days: [
      { day: 1, theme: "Rooftop then market", description: "The sunset rooftop, then Ratchada's wheel by BTS before midnight." },
    ] },
    practical: [
      { heading: "Money", items: ["Rooftop cocktails ฿350–600; craft bars ฿250–400; night-market dinners ฿100–200."] },
      { heading: "Logistics", items: ["The BTS runs until midnight; Grab fills the gap cheaply.", "Dress codes at the top rooftops: no shorts or sandals."] },
    ],
    faq: [
      { question: "Which rooftop in Bangkok?", answer: "Vertigo for the classic deck; the Thonglor bars for the craft tier at half the price." },
      { question: "Khao San Road — yes or no?", answer: "Once, for the institution. Then Ratchada and Yaowarat for the real nights." },
      { question: "How late does the BTS run?", answer: "Until midnight — after that, Grab is metered-app cheap across town." },
    ],
    dest: ["bangkok", "chiang-mai", "phuket"], trips: ["bangkok-3d-temples-markets", "bangkok-food-3d", "bangkok-nightlife"],
    guides: ["bangkok-nightlife-guide", "bangkok-food-guide", "bangkok-night-markets-guide-2026", "bangkok-3-day-itinerary", "thailand-travel-guide"],
    plannerCity: "Bangkok", readTime: "5 min read",
  }),
  compactGuide({
    slug: "best-areas-to-stay-in-bangkok", title: "Best Areas to Stay in Bangkok",
    seoTitle: "Best Areas to Stay in Bangkok", gradient: "from-amber-600 to-indigo-700", author: PRIYA,
    city: "Bangkok", country: "Thailand", tags: ["bangkok", "where to stay", "neighborhoods"],
    meta: "Where to stay in Bangkok: the riverside for the views, Sukhumvit for the transit, the Old Town for the temples and Thonglor for the local nights.",
    excerpt: "Four areas: the riverside, Sukhumvit, the Old Town and Thonglor.",
    intro: [
      "Bangkok's hotel decision is a BTS-station choice: the riverside (the views and the boats), Sukhumvit (the transit spine and the malls), the Old Town/Rattanakosin (the temple mornings), and Thonglor/Ekkamai (the local café-and-bar nights). The Chao Phraya boat and the BTS connect them all.",
    ],
    sections: [
      { heading: "The Four", paragraphs: ["The riverside: Chao Phraya views and the boat as transit — the splurge with the sunset. Sukhumvit: the BTS spine from Nana to Thong Lo, malls and night markets — the convenience pick. The Old Town: temple mornings before the coaches — the culture pick, thinner on transit. Thonglor/Ekkamai: the cafés, bars and the local scene — the insider pick."], bullets: ["The riverside: the view is the amenity.", "Sukhumvit near Asok/Siam: the transit heart.", "The Old Town: walk to the temples at 8am."] },
      { heading: "The Booking Logic", paragraphs: ["November–February books 6–8 weeks out; the riverside suites earlier. The Chao Phraya tourist boat and the BTS make all four areas work — pick by view or by rhythm."],
      },
    ],
    route: { heading: "The Decision Tree", intro: "Answer one question.", days: [
      { day: 1, theme: "View, transit, temples or cafés?", description: "View → riverside. Transit → Sukhumvit. Temples → Old Town. Cafés → Thonglor." },
    ] },
    practical: [
      { heading: "Booking notes", items: ["The riverside books first in high season.", "The BTS access matters more than the stars."] },
      { heading: "Money", items: ["฿1,500–4,000 mid-range depending on area and view; the riverside suites top it."] },
    ],
    faq: [
      { question: "What's the best area for first-timers?", answer: "Sukhumvit near Asok — the BTS heart with everything one ride away." },
      { question: "Is the riverside worth it?", answer: "For the sunset commute by boat — yes, once per trip. The Old Town wins for the temple mornings." },
      { question: "Where do locals stay?", answer: "Thonglor and Ekkamai — the café, bar and brunch tier." },
    ],
    dest: ["bangkok", "chiang-mai", "phuket"], trips: ["bangkok-3d-temples-markets", "bangkok-5d-temples-river", "bangkok-food-3d"],
    guides: ["best-areas-to-stay-in-bangkok", "bangkok-3-day-itinerary", "bangkok-transportation-guide", "bangkok-food-guide", "thailand-travel-guide"],
    plannerCity: "Bangkok", readTime: "4 min read",
  }),
];

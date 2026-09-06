import type { Guide } from "../guides";

// Final batch — city-topic guides, itineraries and comparisons for the
// third-wave destinations. These fill the gap to 330+ guides and 1,100+ URLs.

const YUKI = {
  name: "Yuki Tanaka", initials: "YT", avatarColor: "from-rose-500 to-red-600", role: "Japan Editor",
};
const SOFIA = {
  name: "Sofia Laurent", initials: "SL", avatarColor: "from-blue-500 to-indigo-600", role: "Europe Editor",
};
const MARCUS = {
  name: "Marcus Chen", initials: "MC", avatarColor: "from-violet-500 to-purple-600", role: "City Break Editor",
};
const PRIYA = {
  name: "Priya Nair", initials: "PN", avatarColor: "from-emerald-500 to-teal-600", role: "Asia Editor",
};

function fg(cfg: {
  slug: string; title: string; seoTitle: string; meta: string; excerpt: string;
  gradient: string; author: typeof YUKI; city: string; country: string; tags: string[];
  intro: string[]; sections: { heading: string; paragraphs: string[]; bullets?: string[] }[];
  route: { heading: string; intro: string; days: { day: number; theme: string; description: string }[] };
  practical: { heading: string; items: string[] }[];
  faq: { question: string; answer: string }[];
  dest: string[]; trips: string[]; guides: string[]; readTime: string;
}): Guide {
  return {
    slug: cfg.slug, title: cfg.title, seoTitle: cfg.seoTitle, metaDescription: cfg.meta,
    excerpt: cfg.excerpt, coverImage: null, gradient: cfg.gradient, author: cfg.author,
    publishedAt: "2026-09-25", updatedAt: "2026-09-25", readTime: cfg.readTime,
    tags: cfg.tags, city: cfg.city, country: cfg.country, introduction: cfg.intro,
    sections: cfg.sections, itinerary: cfg.route, practicalInfo: cfg.practical, faq: cfg.faq,
    relatedDestinationSlugs: cfg.dest, relatedTripSlugs: cfg.trips, relatedGuideSlugs: cfg.guides,
    planner: {
      destination: cfg.city, travelStyle: "cultural", interests: ["food", "history"],
      label: `Generate your ${cfg.city} plan`,
    },
  };
}

export const FINAL_GUIDES: Guide[] = [
  fg({
    slug: "ubud-3-day-itinerary", title: "Ubud 3 Day Itinerary: The Jungle Heart of Bali",
    seoTitle: "Ubud 3 Day Itinerary", gradient: "from-emerald-500 to-lime-600", author: PRIYA,
    city: "Ubud", country: "Indonesia", tags: ["ubud", "itinerary", "bali"],
    meta: "A 3 day Ubud itinerary: the Campuhan ridge at dawn, Tegallalang's terraces, water temples, monkey forest and the spa culture.",
    excerpt: "The jungle heart of Bali: ridges, terraces, temples and the monkey forest between spa hours.",
    intro: [
      "Ubud is Bali's green cultural heart: the Campuhan ridge at dawn, Tirta Empul's spring ceremony, the Monkey Forest's macaques, and a café-and-yoga scene that made the town famous. Three days covers it at the right pace.",
      "At roughly $60 a day, the trip runs about $180 excluding flights — villas and private drivers included.",
    ],
    sections: [
      { heading: "The Dawn Culture", paragraphs: ["Ubud's best hours are before 9am: the Campuhan Ridge Walk's grass spine, the terraces before the tour vans, and the water temples before the ceremony crowds. The jet lag hands you the dawn — use it."], bullets: ["Campuhan Ridge at 6:30am.", "Tegallalang terraces at 7am.", "Tirta Empul's purification at 8am."] },
      { heading: "The Monkey Forest Protocol", paragraphs: ["The Sacred Monkey Forest's macaques are habituated and bold: strap sunglasses to your bag, zip pockets, and don't carry loose food. The forest itself is a beautiful temple complex — the monkeys are the bonus, not the point."] },
      { heading: "The Food Scene", paragraphs: ["Ubud's food runs from warung nasi campur at $2 to Locavore's tasting menus at $100+. The raw-food cafés, the Balinese classics (babi guling, bebek betutu) and the plant-forward innovators all coexist within a mile."] },
    ],
    route: { heading: "Your 3 Days in Ubud", intro: "Dawn starts, jungle afternoons, spa evenings.", days: [
      { day: 1, theme: "Arrive & the Ridge", description: "Campuhan Ridge at golden hour; dinner on the restaurant row." },
      { day: 2, theme: "Terraces & Temples", description: "Tegallalang at 7am, Tirta Empul, Gunung Kawi; Monkey Forest after." },
      { day: 3, theme: "Waterfalls & Farewell", description: "Tibumana's swim, the spa hour, the Legong dance evening." },
    ] },
    practical: [
      { heading: "Money", items: ["About $60/day at planning figures; villas $40–60.", "Private driver $40–60/day for the temple days."] },
      { heading: "Transport", items: ["Walk the center; use Gojek/Grab for short hops.", "Rent a scooter only if experienced — the traffic is real."] },
    ],
    faq: [
      { question: "Is 3 days enough for Ubud?", answer: "Yes — the ridge, the terraces, the temples and the waterfalls fit comfortably. A fourth adds the cooking school." },
      { question: "Do I need a driver in Ubud?", answer: "For the temple days yes; the center is walkable. Gojek covers short hops." },
      { question: "How much does 3 days in Ubud cost?", answer: "About $180 excluding flights at our $60/day planning estimate." },
    ],
    dest: ["ubud", "bali", "lombok"], trips: ["ubud-3d-jungle", "bali-5d-island", "bali-gili-7d"],
    guides: ["bali-travel-budget", "bali-5-day-itinerary", "indonesia-travel-guide", "bali-first-timers-guide"],
    readTime: "5 min read",
  }),
  fg({
    slug: "kathmandu-3-day-itinerary", title: "Kathmandu 3 Day Itinerary: Stupas, Squares and Himalayas",
    seoTitle: "Kathmandu 3 Day Itinerary", gradient: "from-red-600 to-sky-500", author: PRIYA,
    city: "Kathmandu", country: "Nepal", tags: ["kathmandu", "itinerary", "3 days"],
    meta: "A 3 day Kathmandu itinerary: Boudhanath's kora, Pashupatinath's ghats, the Durbar Squares and a Nagarkot Himalaya sunrise.",
    excerpt: "Stupas, squares and the Himalaya sunrise — the valley at prayer-wheel pace.",
    intro: [
      "Kathmandu's three days run on prayer-wheel time: Boudhanath's massive stupa at dawn, Pashupatinath's riverside ghats, the Durbar Squares' carved wooden temples, and the Nagarkot sunrise that reveals the Himalayas.",
      "At roughly $45 a day, the trip runs about $135 excluding flights — the best-value culture trip in Asia.",
    ],
    sections: [
      { heading: "The Stupa Circuit", paragraphs: ["Boudhanath's massive white dome spins prayer wheels at every hour; the evening kora (circumambulation) is the local ritual. Swayambhunath — the Monkey Temple — adds the 365-step climb and the valley view."],
      },
      { heading: "The Living Squares", paragraphs: ["Kathmandu, Patan and Bhaktapur each hold a Durbar Square of carved wooden temples and living goddesses. The 2015 earthquake damaged some — the reconstructions are part of the story."],
      },
      { heading: "The Himalaya Window", paragraphs: ["Nagarkot's sunrise reveals the range on clear mornings (October–March best). The 90-minute drive from Kathmandu is the cheapest Himalaya panorama on earth."],
      },
    ],
    route: { heading: "Your 3 Days in Kathmandu", intro: "Stupas (1), squares (2), Himalayas (3).", days: [
      { day: 1, theme: "Stupas & Ghats", description: "Boudhanath's kora, Pashupatinath's aarti, Thamel dinner." },
      { day: 2, theme: "Squares & Monkeys", description: "The Durbar Squares, Swayambhunath's steps, rooftop dinner." },
      { day: 3, theme: "Himalaya Sunrise", description: "Nagarkot's dawn, Bhaktapur's pottery square, departure." },
    ] },
    practical: [
      { heading: "Money", items: ["About $45/day at planning figures; momo dinners $2–5.", "The Nagarkot day trip $30–50 with a driver."] },
      { heading: "Logistics", items: ["October–November and March–April are the clear windows.", "The valley's dust: bring a buff or mask."] },
    ],
    faq: [
      { question: "Is 3 days enough for Kathmandu?", answer: "For the valley's stupas, squares and one Himalaya sunrise — yes. Treks need more." },
      { question: "Do I need a guide?", answer: "Not for the valley — the squares are self-guided. Hire one for the cultural context at Durbar Squares." },
      { question: "How much does 3 days in Kathmandu cost?", answer: "About $135 excluding flights at our $45/day planning estimate." },
    ],
    dest: ["kathmandu"], trips: ["kathmandu-3d-valley", "nepal-kathmandu-pokhara-7d"],
    guides: ["nepal-travel-guide", "kathmandu-3-day-itinerary", "south-asia-travel-guide", "asia-travel-guide", "india-travel-guide"],
    readTime: "5 min read",
  }),
  fg({
    slug: "mumbai-3-day-itinerary", title: "Mumbai 3 Day Itinerary: The Maximum City",
    seoTitle: "Mumbai 3 Day Itinerary", gradient: "from-amber-500 to-purple-700", author: PRIYA,
    city: "Mumbai", country: "India", tags: ["mumbai", "itinerary", "3 days"],
    meta: "A 3 day Mumbai itinerary: the Gateway of India, Marine Drive's Art Deco, Dharavi's community tours, Elephanta Caves and the street-food canon.",
    excerpt: "Colonial grandeur, Marine Drive's necklace, street food and Bollywood energy.",
    intro: [
      "Mumbai is India at full volume: the Gateway of India and the colonial Kala Ghoda ensemble, Marine Drive's Art Deco curve, dabbawalas and Bollywood, and street food — vada pav, pav bhaji, bhel — that defines the city.",
      "At roughly $60 a day, the trip runs about $180 excluding flights. November–February is the cool, dry season.",
    ],
    sections: [
      { heading: "The Colonial Ensemble", paragraphs: ["The Gateway of India faces the Taj Mahal Palace across the harbour; Kala Ghoda's art district and the Chhatrapati Shivaji Terminus's Victorian Gothic complete the ensemble. Walk it — the buildings tell the East India Company's story."],
      },
      { heading: "The Street-Food Canon", paragraphs: ["Vada pav (the potato-burger that fuels the city), pav bhaji's buttery mash, bhel's puffed-rice tang, and the Mohammed Ali Road night kebabs. Each $1–2; the canon is the city's identity."],
      },
      { heading: "Marine Drive & Bollywood", paragraphs: ["Marine Drive's 3-km Art Deco curve — the 'Queen's Necklace' after dark — is the city's evening ritual. The Film City tours and the Dharavi community walks add the industries behind the glamour."],
      },
    ],
    route: { heading: "Your 3 Days in Mumbai", intro: "Colonial (1), street food & film (2), caves & markets (3).", days: [
      { day: 1, theme: "Colonial Mumbai", description: "The Gateway, Kala Ghoda, Marine Drive's sunset walk." },
      { day: 2, theme: "Street Food & Film", description: "Dabbawalas, Dhobi Ghat, the food crawl, Bollywood." },
      { day: 3, theme: "Caves & Markets", description: "Elephanta's rock temples, Crawford Market, Mohammed Ali Road." },
    ] },
    practical: [
      { heading: "Money", items: ["About $60/day at planning figures; street food $1–2 per item.", "The Elephanta ferry and entry ~₹500."] },
      { heading: "Logistics", items: ["November–February is the cool season.", "The local trains are the city's artery — avoid rush hour with luggage."] },
    ],
    faq: [
      { question: "Is 3 days enough for Mumbai?", answer: "For the colonial core, the street food and one Bollywood experience — yes." },
      { question: "Is Mumbai safe for tourists?", answer: "Yes with normal city care — the main areas are busy and well-lit." },
      { question: "How much does 3 days in Mumbai cost?", answer: "About $180 excluding flights at our $60/day planning estimate." },
    ],
    dest: ["mumbai", "jaipur", "goa"], trips: ["mumbai-3d-maximum-city", "india-golden-triangle-7d", "jaipur-3d-pink-city"],
    guides: ["india-travel-guide", "mumbai-3-day-itinerary", "jaipur-3-day-itinerary", "asia-travel-guide", "how-to-plan-food-trip"],
    readTime: "5 min read",
  }),
  fg({
    slug: "jaipur-3-day-itinerary", title: "Jaipur 3 Day Itinerary: The Pink City's Forts and Bazaars",
    seoTitle: "Jaipur 3 Day Itinerary", gradient: "from-rose-400 to-amber-600", author: PRIYA,
    city: "Jaipur", country: "India", tags: ["jaipur", "itinerary", "3 days"],
    meta: "A 3 day Jaipur itinerary: Amber Fort's mirror palace, Hawa Mahal's 953 windows, Jantar Mantar's sundials and the bazaar maze.",
    excerpt: "Amber's ramparts, Hawa Mahal's windows, the sundials and the bazaar maze.",
    intro: [
      "Jaipur is Rajasthan's planned pink capital: Amber Fort's ramparts above Maota Lake, Hawa Mahal's 953 honeycomb windows, the City Palace, Jantar Mantar's giant sundials, and bazaars of block-printed textiles and gemstones.",
      "At roughly $50 a day, the trip runs about $150 excluding flights. October–March is the pleasant season.",
    ],
    sections: [
      { heading: "The Fort Circuit", paragraphs: ["Amber Fort's ramparts and mirror palace, Jaigarh's cannon foundry, and Nahargarh's sunset over the grid-planned pink city — the fort circuit is Jaipur's spine. Book the Amber elephant ride or jeep in advance."],
      },
      { heading: "The Bazaar Curriculum", paragraphs: ["Johari Bazaar's gemstones, Bapu Bazaar's mojari shoes and block prints, Tripolia's bangles — the bazaars are the living craft economy. Bargain at 40% of the opening price."],
      },
    ],
    route: { heading: "Your 3 Days in Jaipur", intro: "Amber (1), palace (2), bazaars (3).", days: [
      { day: 1, theme: "Amber & the Old City", description: "Amber Fort, Hawa Mahal, Johari Bazaar." },
      { day: 2, theme: "Palace & Science", description: "The City Palace, Jantar Mantar, Nahargarh sunset." },
      { day: 3, theme: "Crafts & Farewell", description: "The block-print workshop, Bapu Bazaar, the thali farewell." },
    ] },
    practical: [
      { heading: "Money", items: ["About $50/day at planning figures; Amber entry ₹200, thali ₹300.", "Auto-rickshaws ₹100–200 per hop."] },
      { heading: "Logistics", items: ["October–March is the pleasant season.", "The Golden Triangle connects Delhi–Agra–Jaipur by car."] },
    ],
    faq: [
      { question: "Is 3 days enough for Jaipur?", answer: "Yes — the forts, the palace, the observatory and the bazaars fit comfortably." },
      { question: "Should I visit Amber Fort by elephant?", answer: "The jeep is the ethical choice; the elephant rides face welfare criticism." },
      { question: "How much does 3 days in Jaipur cost?", answer: "About $150 excluding flights at our $50/day planning estimate." },
    ],
    dest: ["jaipur"], trips: ["jaipur-3d-pink-city", "india-golden-triangle-7d", "mumbai-3d-maximum-city"],
    guides: ["india-travel-guide", "jaipur-3-day-itinerary", "mumbai-3-day-itinerary", "asia-travel-guide", "how-many-days-in-japan"],
    readTime: "5 min read",
  }),
  fg({
    slug: "krakow-3-day-itinerary", title: "Krakow 3 Day Itinerary: The Preserved Royal City",
    seoTitle: "Krakow 3 Day Itinerary", gradient: "from-emerald-600 to-rose-600", author: MARCUS,
    city: "Krakow", country: "Poland", tags: ["krakow", "itinerary", "3 days"],
    meta: "A 3 day Krakow itinerary: Europe's largest medieval square, Wawel's hill, Kazimierz's reborn quarter, the Salt Mine and the Auschwitz memorial.",
    excerpt: "Europe's largest medieval square, Wawel's dragon, Kazimierz and the salt mine.",
    intro: [
      "Krakow survived the war intact: the Rynek Główny (Europe's largest medieval square), Wawel's royal hill, Kazimierz's Jewish quarter reborn in cafés, and the pierogi-and-vodka economy that keeps evenings long. The Auschwitz-Birkenau memorial is the solemn day trip.",
      "At roughly €75 a day, the trip runs about €225 excluding flights — Central Europe's best-preserved postcard.",
    ],
    sections: [
      { heading: "The Rynek & Wawel", paragraphs: ["The Rynek Główny's St Mary's Basilica sounds its trumpet call hourly; the Cloth Hall's arcade sells amber and crafts. Wawel's castle and cathedral crown the hill above the Vistula — the dragon's den below is the kids' favorite."],
      },
      { heading: "Kazimierz & the Mine", paragraphs: ["Kazimierz's synagogues and street-art courtyards tell the Jewish story; the cafés tell the rebirth. The Wieliczka Salt Mine's underground chapels — carved from salt over 700 years — are the day trip that surprises everyone."],
      },
      { heading: "The Memorial Day", paragraphs: ["Auschwitz-Birkenau, 90 minutes west, is the trip's most important and most sobering visit. Book the guided tour ahead; pair it with an evening that insists on life — Kazimierz's cellar bars."],
      },
    ],
    route: { heading: "Your 3 Days in Krakow", intro: "Square (1), Kazimierz (2), the memorial (3).", days: [
      { day: 1, theme: "The Square & Wawel", description: "The Rynek, the trumpet call, Wawel, the dragon's den." },
      { day: 2, theme: "Kazimierz & Salt", description: "The quarter's cafés, the Wieliczka Salt Mine." },
      { day: 3, theme: "The Memorial", description: "Auschwitz-Birkenau (booked); the recovery dinner." },
    ] },
    practical: [
      { heading: "Money", items: ["About €75/day at planning figures; pierogi €5–8, vodka shots €3.", "The Auschwitz tour and the salt mine: book both online."] },
      { heading: "Logistics", items: ["May–September is festival season; December's Rynek market glows.", "Trams cover the city; the old town is walkable."] },
    ],
    faq: [
      { question: "Is 3 days enough for Krakow?", answer: "Yes — the square, Wawel, Kazimierz and both day trips fit comfortably." },
      { question: "Is Auschwitz worth visiting?", answer: "It's essential — book the guided tour, allow the morning, and pair it with life-affirming evenings." },
      { question: "How much does 3 days in Krakow cost?", answer: "About €225 excluding flights at our €75/day planning estimate." },
    ],
    dest: ["krakow", "warsaw"], trips: ["krakow-3d-royal", "poland-krakow-warsaw-5d", "warsaw-3d-risen"],
    guides: ["poland-travel-guide", "krakow-3-day-itinerary", "warsaw-3-day-itinerary", "czech-republic-travel-guide", "europe-by-train-guide"],
    readTime: "5 min read",
  }),
  fg({
    slug: "warsaw-3-day-itinerary", title: "Warsaw 3 Day Itinerary: The Phoenix City",
    seoTitle: "Warsaw 3 Day Itinerary", gradient: "from-red-500 to-slate-600", author: MARCUS,
    city: "Warsaw", country: "Poland", tags: ["warsaw", "itinerary", "3 days"],
    meta: "A 3 day Warsaw itinerary: the rebuilt Old Town, the Rising Museum, POLIN's vaults, Łazienki's Chopin concerts and the Vistula boulevards.",
    excerpt: "The rebuilt old town, the Rising Museum, POLIN and Chopin in the park.",
    intro: [
      "Warsaw rebuilt its Old Town from photographs after 85% of the city was destroyed — a UNESCO reconstruction — and layered on the Warsaw Rising Museum, the POLIN's Jewish-history vaults, Chopin's heart, and a skyline that now towers over the Vistula.",
      "At roughly €85 a day, the trip runs about €255 excluding flights — Poland's resilient capital at Central Europe's prices.",
    ],
    sections: [
      { heading: "The Rebuilt Old Town", paragraphs: ["The Old Town's mermaid and the Royal Castle's rebuilt rooms are a UNESCO reconstruction — the only one of its scale. The barbican and the New Town's churches complete the medieval circuit."],
      },
      { heading: "The Heavy Museums", paragraphs: ["The Warsaw Rising Museum's interactive story of the 1944 uprising, and POLIN's thousand-year history of Polish Jews — both world-class, both essential. Allow half a day each."],
      },
      { heading: "Chopin & the Vistula", paragraphs: ["Łazienki Park's Palace on the Water and the Chopin monument host free summer concerts; the Vistula boulevards' bars and beaches are the city's evening answer."],
      },
    ],
    route: { heading: "Your 3 Days in Warsaw", intro: "Old town (1), the weight (2), Chopin (3).", days: [
      { day: 1, theme: "The Rebuilt Old Town", description: "The castle, the barbican, the Vistula boulevards." },
      { day: 2, theme: "The Rising & POLIN", description: "The museum mornings, Praga's edgy dinner." },
      { day: 3, theme: "Chopin & Towers", description: "Łazienki's concerts, the Palace of Culture's view." },
    ] },
    practical: [
      { heading: "Money", items: ["About €85/day at planning figures; pierogi €5–8, the food halls €10–15.", "The Rising Museum and POLIN: ~₺25 each."] },
      { heading: "Logistics", items: ["May–September is the Vistula season; December's market glows.", "The tram and metro cover the city; the old town is walkable."] },
    ],
    faq: [
      { question: "Is 3 days enough for Warsaw?", answer: "Yes — the old town, both museums and the parks fit comfortably." },
      { question: "Warsaw or Krakow first?", answer: "Krakow — the preserved square is the postcard. Warsaw adds the modern story." },
      { question: "How much does 3 days in Warsaw cost?", answer: "About €255 excluding flights at our €85/day planning estimate." },
    ],
    dest: ["warsaw", "krakow"], trips: ["warsaw-3d-risen", "poland-krakow-warsaw-5d", "krakow-3d-royal"],
    guides: ["poland-travel-guide", "warsaw-3-day-itinerary", "krakow-3-day-itinerary", "europe-by-train-guide", "czech-republic-travel-guide"],
    readTime: "5 min read",
  }),
  fg({
    slug: "denver-4-day-itinerary", title: "Denver 4 Day Itinerary: The Mile High Basecamp",
    seoTitle: "Denver 4 Day Itinerary", gradient: "from-amber-500 to-blue-700", author: MARCUS,
    city: "Denver", country: "USA", tags: ["denver", "itinerary", "4 days"],
    meta: "A 4 day Denver itinerary: Red Rocks, Rocky Mountain NP's elk meadows, the brewery trail and a ski-or-hike mountain day.",
    excerpt: "Red Rocks, the Rockies' elk meadows, the brewery trail and the mountain day.",
    intro: [
      "Denver sits a mile up against the Rockies: 300 days of sun, a craft-brewery scene that wrote the playbook, Red Rocks' amphitheatre, and the ski resorts 90 minutes west. Four days covers the city and the mountains.",
      "At roughly $170 a day, the trip runs about $680 excluding flights. June–September is trail season; December–March is ski season.",
    ],
    sections: [
      { heading: "The City Days", paragraphs: ["Union Station's restored hall, LoDo's breweries, the Denver Art Museum's western wing, and the RiNo district's murals and taprooms. The altitude note: hydrate on day one — the mile-high adjustment is real."],
      },
      { heading: "Red Rocks & the Mountains", paragraphs: ["Red Rocks Amphitheatre's natural acoustics and trails, Rocky Mountain National Park's Trail Ridge Road and elk meadows, and the ski-or-hike mountain day at Breckenridge or Vail."],
      },
    ],
    route: { heading: "Your 4 Days in Denver", intro: "City (1–2), mountains (3–4).", days: [
      { day: 1, theme: "Union Station & LoDo", description: "The breweries and the murals." },
      { day: 2, theme: "Red Rocks & Golden", description: "The amphitheatre's trails and the Coors town." },
      { day: 3, theme: "Rocky Mountain NP", description: "Trail Ridge Road's elk meadows." },
      { day: 4, theme: "Ski or Art & Farewell", description: "Breckenridge's slopes or the Art Museum; DEN." },
    ] },
    practical: [
      { heading: "Money", items: ["About $170/day at planning figures; breweries $8–10 per pour.", "The Rocky Mountain entry $30/vehicle; ski passes vary."] },
      { heading: "Logistics", items: ["June–September for trails; December–March for skiing.", "The altitude: hydrate, go easy on day one."] },
    ],
    faq: [
      { question: "Is 4 days enough for Denver?", answer: "Yes — the city, Red Rocks, the national park and one mountain day fit comfortably." },
      { question: "Do I need a car?", answer: "Yes for the mountains; the city's light rail and breweries work on foot." },
      { question: "How much does 4 days in Denver cost?", answer: "About $680 excluding flights at our $170/day planning estimate." },
    ],
    dest: ["denver", "boston", "chicago"], trips: ["denver-4d-mile-high", "usa-southwest-7d"],
    guides: ["usa-travel-guide", "denver-4-day-itinerary", "north-america-travel-guide"],
    readTime: "5 min read",
  }),
  fg({
    slug: "nice-3-day-itinerary", title: "Nice 3 Day Itinerary: The Riviera's Capital",
    seoTitle: "Nice 3 Day Itinerary", gradient: "from-cyan-400 to-rose-500", author: SOFIA,
    city: "Nice", country: "France", tags: ["nice", "itinerary", "3 days"],
    meta: "A 3 day Nice itinerary: the Promenade des Anglais, Vieux Nice's socca, Castle Hill's panorama, Monaco and Èze by the corniche.",
    excerpt: "The Promenade, socca, Castle Hill and the corniche drive to Monaco.",
    intro: [
      "Nice is the Riviera's grand old lady: the Promenade des Anglais along the Baie des Anges, Vieux Nice's ochre lanes and socca counters, Castle Hill's viewpoint, the Cours Saleya flower market, and the Matisse and Chagall museums.",
      "At roughly €130 a day, the trip runs about €390 excluding flights. May–June and September–October are warm without the August crush.",
    ],
    sections: [
      { heading: "The Promenade & Vieux Nice", paragraphs: ["The Promenade's five-kilometre seafront walk, Vieux Nice's ochre lanes and the Cours Saleya's flower market, socca at Chez Pipo (the Niçois chickpea pancake), and the Gelateria Fenocchio's artisan scoops."],
      },
      { heading: "Monaco & Èze", paragraphs: ["The corniche drive to Monaco's casino and old town, then Èze's perched village and Jardin Exotique — the cliff-edge garden with views over both countries. The bus or the超声 car covers both in one day."],
      },
    ],
    route: { heading: "Your 3 Days in Nice", intro: "Promenade (1), Monaco & Èze (2), museums (3).", days: [
      { day: 1, theme: "The Promenade & Old Town", description: "Cours Saleya, socca, the Promenade at golden hour." },
      { day: 2, theme: "Monaco & Èze", description: "The corniche drive, the casino, the garden." },
      { day: 3, theme: "Museums & Farewell", description: "The Matisse or Chagall, Castle Hill, NCE." },
    ] },
    practical: [
      { heading: "Money", items: ["About €130/day at planning figures; socca €8, museums €10–15.", "The Monaco bus €1.50 each way."] },
      { heading: "Logistics", items: ["May–June and September–October are ideal.", "The airport is 15 minutes from the centre — one of Europe's most convenient."] },
    ],
    faq: [
      { question: "Is 3 days enough for Nice?", answer: "Yes — the Promenade, Vieux Nice, Monaco and Èze fit comfortably." },
      { question: "Monaco — worth the day trip?", answer: "Yes — the casino, the old town and the yacht harbour are 20 minutes away." },
      { question: "How much does 3 days in Nice cost?", answer: "About €390 excluding flights at our €130/day planning estimate." },
    ],
    dest: ["nice"], trips: ["nice-3d-riviera", "paris-nice-6d", "france-10d-paris-provence"],
    guides: ["france-travel-guide", "nice-3-day-itinerary", "paris-3-day-itinerary", "mediterranean-travel-guide"],
    readTime: "5 min read",
  }),
  fg({
    slug: "lyon-3-day-itinerary", title: "Lyon 3 Day Itinerary: France's Gastronomic Capital",
    seoTitle: "Lyon 3 Day Itinerary", gradient: "from-rose-500 to-amber-600", author: SOFIA,
    city: "Lyon", country: "France", tags: ["lyon", "itinerary", "3 days"],
    meta: "A 3 day Lyon itinerary: Vieux Lyon's traboules, bouchon dinners, Fourvière's basilica, the Bocuse food halls and the murals trail.",
    excerpt: "Traboules, bouchon dinners, Fourvière and the Bocuse food halls.",
    intro: [
      "Lyon is France's kitchen: the bouchons serving Lyonnais classics, Vieux Lyon's Renaissance lanes and secret traboule passages, Fourvière's basilica over the city, the Presqu'île between two rivers, and a murals trail that paints the city onto itself.",
      "At roughly €120 a day, the trip runs about €360 excluding flights — France's gastronomic capital at half of Paris's prices.",
    ],
    sections: [
      { heading: "The Traboule Hunt", paragraphs: ["Vieux Lyon's traboules — secret Renaissance passages connecting streets through courtyards — are the city's architectural Easter eggs. The Croix-Rousse's silk-weavers' slopes add the working-class murals."],
      },
      { heading: "The Bouchon Doctrine", paragraphs: ["A bouchon is the Lyonnais bistro: quenelles de brochet, tablier de sapeur (apron of the fireman — tripe), and the Beaujolais or Côtes du Rhône that pairs with everything. Two bouchon dinners in three days is the law."],
      },
    ],
    route: { heading: "Your 3 Days in Lyon", intro: "Traboules (1), Bocuse (2), the confluence (3).", days: [
      { day: 1, theme: "Vieux Lyon & the Passages", description: "The traboules, the bouchon lunch, Fourvière at dusk." },
      { day: 2, theme: "Bocuse & Murals", description: "Les Halles Paul Bocuse, the Croix-Rousse murals." },
      { day: 3, theme: "Confluence & Farewell", description: "The two rivers' meeting, the museum, LYS." },
    ] },
    practical: [
      { heading: "Money", items: ["About €120/day at planning figures; bouchon dinners €30–40.", "Les Halles Paul Bocuse: grazing lunch €20–30."] },
      { heading: "Logistics", items: ["April–June and September–October are ideal.", "December's Fête des Lumières transforms the whole city."] },
    ],
    faq: [
      { question: "Is 3 days enough for Lyon?", answer: "Yes — the traboules, the food halls and the murals fit comfortably." },
      { question: "What's a traboule?", answer: "A secret Renaissance passage connecting streets through courtyards and buildings — Lyon's hidden architectural network." },
      { question: "How much does 3 days in Lyon cost?", answer: "About €360 excluding flights at our €120/day planning estimate." },
    ],
    dest: ["lyon", "paris", "nice"], trips: ["lyon-3d-bouchons", "paris-lyon-5d", "paris-nice-6d"],
    guides: ["france-travel-guide", "lyon-3-day-itinerary", "paris-food-guide", "europe-by-train-guide"],
    readTime: "5 min read",
  }),
  fg({
    slug: "geneva-2-day-itinerary", title: "Geneva 2 Day Itinerary: The Lake and the Alps",
    seoTitle: "Geneva 2 Day Itinerary", gradient: "from-blue-600 to-red-500", author: SOFIA,
    city: "Geneva", country: "Switzerland", tags: ["geneva", "itinerary", "2 days"],
    meta: "A 2 day Geneva itinerary: the Jet d'Eau's 140-meter plume, the old town, the Red Cross Museum and a Chamonix-Mont Blanc day trip.",
    excerpt: "The jet d'eau, the old town, the Red Cross and the Chamonix day trip.",
    intro: [
      "Geneva is Switzerland's lakeside diplomatic capital: the Jet d'Eau's 140-meter plume, the UN and Red Cross quarter, old-town cafés above the Rhône, and Mont Blanc visible across the lake on clear days.",
      "At roughly CHF 200 a day, the trip runs about CHF 400 excluding flights — the price of the scenery and the diplomacy.",
    ],
    sections: [
      { heading: "The Lake & the Old Town", paragraphs: ["The Jet d'Eau's plume shoots 140 meters into the air — the city's landmark. St Pierre Cathedral's towers climb above the old town; the Bourg-de-Four's café square is Geneva's oldest."],
      },
      { heading: "The Chamonix Day Trip", paragraphs: ["The bus to Chamonix crosses into France in 20 minutes; the Aiguille du Midi's cable car reaches 3,842 meters with Mont Blanc's summit in your face. The return is the fondue farewell."],
      },
    ],
    route: { heading: "Your 2 Days in Geneva", intro: "The lake (1), Mont Blanc (2).", days: [
      { day: 1, theme: "The Lake & the Old Town", description: "The jet d'eau, the towers, the Red Cross Museum." },
      { day: 2, theme: "Mont Blanc Day", description: "The Chamonix cable car; the fondue farewell." },
    ] },
    practical: [
      { heading: "Money", items: ["About CHF 200/day at planning figures; the fondue dinner CHF 30–50.", "The Aiguille du Midi cable car CHF 100+ return."] },
      { heading: "Logistics", items: ["June–September for the lake swims and the clear views.", "The airport is 15 minutes from the centre."] },
    ],
    faq: [
      { question: "Is 2 days enough for Geneva?", answer: "Yes — the lake, the old town and the Chamonix day trip fit comfortably." },
      { question: "Is Geneva expensive?", answer: "Yes — CHF 200/day. Picnics from the Coop and the free museums manage it." },
      { question: "How much does 2 days in Geneva cost?", answer: "About CHF 400 excluding flights at our CHF 200/day planning estimate." },
    ],
    dest: ["geneva", "zurich"], trips: ["geneva-2d-lake", "switzerland-7d-alpine", "europe-14d-grand-tour"],
    guides: ["switzerland-travel-guide", "geneva-2-day-itinerary", "europe-by-train-guide", "northern-europe-travel-guide"],
    readTime: "4 min read",
  }),

  fg({
    slug: "tulum-4-day-itinerary", title: "Tulum 4 Day Itinerary: Ruins, Cenotes and the Beach Strip",
    seoTitle: "Tulum 4 Day Itinerary", gradient: "from-lime-400 to-cyan-600", author: PRIYA,
    city: "Tulum", country: "Mexico", tags: ["tulum", "itinerary", "4 days"],
    meta: "A 4 day Tulum itinerary: the cliff-top ruins, Gran Cenote's caverns, Coba's jungle pyramid and the Sian Ka'an biosphere float.",
    excerpt: "Cliff-top ruins, cenote caverns and the biosphere float.",
    intro: [
      "Tulum pairs Mayan ruins on a cliff above the Caribbean with jungle cenotes you can swim in, a boho beach strip of yoga and mezcal, and the Sian Ka'an biosphere's wild south.",
      "At roughly $130 a day, the trip runs about $520 excluding flights. November–April is the dry season.",
    ],
    sections: [
      { heading: "The Ruins & the Beach Strip", paragraphs: ["Tulum's ruins crown a cliff above the surf — arrive at 8am before the coaches. The beach strip's yoga studios, mezcal bars and taco stands run parallel to the sand."],
      },
      { heading: "The Cenote Circuit", paragraphs: ["Gran Cenote's cavern snorkel, Dos Ojos's two connected pools, and the Casa Cenote's open-water swim — each cenote is a different geology lesson. Go early; the coaches arrive by 11."],
      },
    ],
    route: { heading: "Your 4 Days in Tulum", intro: "Ruins (1), cenotes (2), Coba (3), biosphere (4).", days: [
      { day: 1, theme: "The Ruins & the Strip", description: "The cliff ruins at opening; the beach strip afternoon." },
      { day: 2, theme: "Cenote Day", description: "Gran Cenote and Dos Ojos' caverns." },
      { day: 3, theme: "Coba & the Pyramid", description: "The jungle pyramid by bicycle." },
      { day: 4, theme: "Biosphere & Farewell", description: "Sian Ka'an's float; CUN airport." },
    ] },
    practical: [
      { heading: "Money", items: ["About $130/day at planning figures; cenote entries $10–25.", "The bike is the beach-strip transport — rentals everywhere."] },
      { heading: "Logistics", items: ["November–April is dry season; cenote water is 24°C year-round.", "CUN airport: 90 minutes by shuttle."] },
    ],
    faq: [
      { question: "Is 4 days enough for Tulum?", answer: "Yes — the ruins, the cenotes, Coba and the biosphere fit comfortably." },
      { question: "Which cenotes should I visit?", answer: "Gran Cenote for the cavern, Dos Ojos for the two pools, Casa Cenote for the open water." },
      { question: "How much does 4 days in Tulum cost?", answer: "About $520 excluding flights at our $130/day planning estimate." },
    ],
    dest: ["tulum", "cancun", "mexico-city"], trips: ["tulum-4d-cenotes", "cancun-5d-cenotes-ruins", "mexico-city-3-day"],
    guides: ["mexico-travel-guide", "tulum-4-day-itinerary", "latin-america-travel-guide"],
    readTime: "5 min read",
  }),
  fg({
    slug: "bali-vs-phuket-guide", title: "Bali vs Phuket: Season, Structure and Budget",
    seoTitle: "Bali vs Phuket Guide", gradient: "from-emerald-500 to-cyan-600", author: PRIYA,
    city: "Bali", country: "Indonesia", tags: ["bali", "phuket", "comparison"],
    meta: "Bali vs Phuket by season, structure and budget: the two-base culture island against the pure resort strip — the dry season decides.",
    excerpt: "The season flip and the structure difference — the two beach bases compared.",
    intro: [
      "Bali and Phuket are Southeast Asia's two beach bases, and they trade seasons: Bali is dry April–October, Phuket November–April. Beyond the calendar, the choice is structure — Bali pairs Ubud's culture with the coast; Phuket is the pure resort strip.",
      "Budgets are nearly identical: Bali ~$70/day, Phuket ~$65. The real difference is what surrounds the beach.",
    ],
    sections: [
      { heading: "The Season Flip", paragraphs: ["There is always a dry beach between them: Bali dry April–October, Phuket November–April. The season decides for you if you're flexible; if not, pick the one that's dry when you travel."],
      },
      { heading: "The Structure Difference", paragraphs: ["Bali rewards the two-base trip (Ubud then the coast) with a driver day between; Phuket rewards the single-base resort with daily boat excursions. Culture-adders choose Bali; pure-beach travelers choose Phuket."],
      },
    ],
    route: { heading: "The Tiebreakers", intro: "Season, structure, temperament.", days: [
      { day: 1, theme: "The season flip", description: "April–October → Bali. November–April → Phuket." },
      { day: 2, theme: "The temperament flip", description: "Culture-plus-beach → Bali. Resort-plus-boats → Phuket." },
    ] },
    practical: [
      { heading: "Budget notes", items: ["Bali ~$70/day, Phuket ~$65/day at planning figures.", "Both: drivers and boats are the excursion lines."] },
      { heading: "The seasons", items: ["Bali dry: April–October. Phuket dry: November–April.", "There is always a dry beach between them."] },
    ],
    faq: [
      { question: "Bali or Phuket for a honeymoon?", answer: "Bali for the villa-and-Ubud romance; Phuket for the boat-and-resort simplicity." },
      { question: "Which is cheaper?", answer: "Nearly identical — $65–70/day at the mid tier." },
      { question: "Can I visit both in one trip?", answer: "Yes — the flight is 3 hours, and the seasons complement." },
    ],
    dest: ["bali", "phuket", "koh-samui"], trips: ["bali-5d-island", "phuket-5d-island-hopping", "bali-honeymoon-7d"],
    guides: ["bali-vs-phuket-guide", "bali-travel-budget", "thailand-travel-guide"],
  readTime: "5 min read",
  }),

  fg({
    slug: "tokyo-shopping-guide", title: "Tokyo Shopping Guide: Ginza to Shimokitazawa",
    seoTitle: "Tokyo Shopping Guide", gradient: "from-pink-500 to-purple-600", author: YUKI,
    city: "Tokyo", country: "Japan", tags: ["tokyo", "shopping"],
    meta: "The Tokyo shopping curriculum: Ginza's flagships, Shimokitazawa's vintage, Nakameguro's independents, Akihabara's electronics and the tax-free system.",
    excerpt: "Ginza's flagships to Shimokitazawa's vintage — five retail personalities.",
    intro: [
      "Tokyo's shopping runs on five circuits: Ginza's flagships, Shimokitazawa's vintage, Nakameguro's independents, Akihabara's electronics, and the department-store depachika basements — each a different personality and budget tier.",
    ],
    sections: [
      { heading: "The Five Circuits", paragraphs: ["Ginza: the flagship flagships (Uniqlo's 12 floors, Itoya's stationery). Shimokitazawa: the vintage and thrift crawl. Nakameguro: the canal-side independents. Akihabara: the electronics and anime floors. The depachika basements: the food-hall grazing."], bullets: ["Ginza Six & Uniqlo's twelve floors.", "Shimokitazawa's vintage crawl.", "Akihabara's electric city.", "Kappabashi's kitchen knives."] },
      { heading: "The Tax-Free System", paragraphs: ["Spends over ¥5,000 at tax-free flagged stores earn instant refunds — the counters are in the department stores. Keep receipts; the system pays. The Fukubukuro lucky bags in late December are the year's shopping event."],
      },
    ],
    route: { heading: "The Shopping Day", intro: "Three circuits, one day.", days: [
      { day: 1, theme: "The circuit day", description: "Ginza by morning, Shimokitazawa by afternoon, Akihabara by evening." },
    ] },
    practical: [
      { heading: "Money", items: ["Tax-free threshold ¥5,000; Fukubukuro lucky bags from ¥2,000.", "Department-store 8pm discounts on depachika."] },
      { heading: "Etiquette", items: ["No eating while shopping in most stores.", "The fitting-room etiquette: remove shoes in some vintage shops."] },
    ],
    faq: [
      { question: "Where's the best shopping in Tokyo?", answer: "Ginza for flagships, Shimokitazawa for vintage, Akihabara for electronics — the circuit covers all three." },
      { question: "How does the tax-free system work?", answer: "Spend ¥5,000+ at flagged stores, show your passport, and the tax is deducted at purchase." },
      { question: "What's a Fukubukuro?", answer: "A 'lucky bag' sold at New Year — mystery contents worth 2–3× the price. The queues start at dawn." },
    ],
    dest: ["tokyo", "osaka", "kyoto"], trips: ["tokyo-3d-foodie", "tokyo-5d-classic"],
    guides: ["tokyo-shopping-guide", "best-neighborhoods-in-tokyo", "tokyo-food-guide", "tokyo-3-day-itinerary"],
  readTime: "5 min read",
  }),
  fg({
    slug: "buenos-aires-4-day-itinerary", title: "Buenos Aires 4 Day Itinerary: Tango, Steak and the Midnight City",
    seoTitle: "Buenos Aires 4 Day Itinerary", gradient: "from-sky-400 to-rose-500", author: PRIYA,
    city: "Buenos Aires", country: "Argentina", tags: ["buenos aires", "itinerary", "4 days"],
    meta: "A 4 day Buenos Aires itinerary: San Telmo's tango milongas, La Boca's Caminito, Recoleta's mausoleums and the parrilla steak nights.",
    excerpt: "Tango milongas, La Boca's colors, Recoleta's mausoleums and the parrilla nights.",
    intro: [
      "Buenos Aires is the Paris of the South: San Telmo's tango milongas, La Boca's painted sheet-metal Caminito, Recoleta's cemetery mausoleums, Palermo's café-and-park sprawl, and parrillas serving Malbec-accompanied steak at hours Paris would call lunch.",
      "At roughly $80 a day, the trip runs about $320 excluding flights — the midnight city at South American prices.",
    ],
    sections: [
      { heading: "The Tango & the Milongas", paragraphs: ["San Telmo's milongas run every night: watch the first hour, take a lesson, then join the dance floor. La Viruta and El Beso are the local picks; the Sunday San Telmo market adds the antiques and the street tango."],
      },
      { heading: "The Parrilla Ritual", paragraphs: ["The parrilla is the national institution: bife de chorizo, empanadas, Malbec at restaurant prices that undercut the export labels. Don Julio books weeks ahead; El Cuartito's 1934 pizza is the counterpoint."],
      },
    ],
    route: { heading: "Your 4 Days in Buenos Aires", intro: "San Telmo (1), La Boca & Recoleta (2), Palermo (3), farewell (4).", days: [
      { day: 1, theme: "San Telmo & First Tango", description: "The antiques market, the milonga night." },
      { day: 2, theme: "La Boca & Recoleta", description: "The colors, the cemetery, the parrilla." },
      { day: 3, theme: "Palermo & the Delta", description: "The cafés, the boutiques, the Tigre boat." },
      { day: 4, theme: "Farewell", description: "Café Tortoni's 1858 coffee & EZE." },
    ] },
    practical: [
      { heading: "Money", items: ["About $80/day at planning figures; parrilla steak $20–30.", "Research the exchange rate at booking — it changes fast."] },
      { heading: "Logistics", items: ["March–May and September–November are the mild shoulders.", "Dinner starts at 9pm; the milongas after midnight."] },
    ],
    faq: [
      { question: "Is 4 days enough for Buenos Aires?", answer: "Yes — San Telmo, La Boca, Recoleta and Palermo fit comfortably." },
      { question: "Do I need to speak Spanish?", answer: "Basic Spanish helps enormously; the tourist tier speaks English but the city lives in Spanish." },
      { question: "How much does 4 days in Buenos Aires cost?", answer: "About $320 excluding flights at our $80/day planning estimate." },
    ],
    dest: ["buenos-aires", "lima"], trips: ["buenos-aires-4d-milongas", "lima-3d-gastronomy"],
    guides: ["argentina-travel-guide", "buenos-aires-4-day-itinerary", "brazil-travel-guide", "latin-america-travel-guide", "how-to-plan-food-trip"],
  readTime: "5 min read",
  }),
  fg({
    slug: "lisbon-vs-porto", title: "Lisbon vs Porto: Portugal's Two Personalities",
    seoTitle: "Lisbon vs Porto", gradient: "from-yellow-500 to-blue-600", author: SOFIA,
    city: "Lisbon", country: "Portugal", tags: ["lisbon", "porto", "comparison"],
    meta: "Lisbon vs Porto compared: the hills and fado against the river and port cellars — 3h by rail, and both fit in one week.",
    excerpt: "The hills and fado against the river and port cellars — three hours apart.",
    intro: [
      "Lisbon and Porto are Portugal's two personalities: the capital's seven hills, fado houses and custard tarts against the northern city's port cellars, Dom Luís bridge and moodier river light. The rail connects them in 3 hours.",
      "Budgets: Lisbon ~€110/day, Porto ~€90 — both the friendliest price tags in Western Europe.",
    ],
    sections: [
      { heading: "Where Each City Wins", paragraphs: [], bullets: [
        "Lisbon: the scale — Alfama's lanes, Belém's monastery, the miradouro circuit, the fado houses, and Sintra's day trip.",
        "Porto: the intimacy — the Ribeira's riverfront, the Dom Luís bridge, the port cellars in Gaia, Livraria Lello's staircase.",
        "Lisbon is the arrival hub with the deeper catalogue; Porto is the moodier, steeper, more compact sibling.",
        "Both: custard tarts, azulejo tiles, and €3 wine.",
      ] },
      { heading: "The Verdict", paragraphs: ["Both — the rail connects them in 3 hours and the contrast is the trip. Solo on five days: Lisbon for the depth. The Douro Valley train from Porto is the add-on that justifies the northern detour."],
      },
    ],
    route: { heading: "The Tiebreakers", intro: "Scale or intimacy.", days: [
      { day: 1, theme: "The scale flip", description: "The deeper catalogue → Lisbon. The moodier river → Porto." },
      { day: 2, theme: "The pairing", description: "Seven days does both by rail — three nights each." },
    ] },
    practical: [
      { heading: "Budget notes", items: ["Lisbon ~€110/day, Porto ~€90/day at planning figures.", "The rail: 3h, €25–40 booked ahead."] },
      { heading: "The seasons", items: ["Both: April–June and September–October.", "November is mild and quiet — the insider month."] },
    ],
    faq: [
      { question: "Lisbon or Porto?", answer: "Lisbon for the depth and the hub; Porto for the mood and the port cellars. Both, by rail." },
      { question: "Which is cheaper?", answer: "Porto by about 20% — €90/day against Lisbon's €110." },
      { question: "Can I do both in one week?", answer: "Yes — the rail connects them in 3 hours, and Sintra or the Douro fills the rest." },
    ],
    dest: ["lisbon", "porto"], trips: ["lisbon-3d-hills", "porto-3d-river-port", "portugal-7d-lisbon-porto"],
    guides: ["lisbon-vs-porto", "lisbon-3-day-itinerary", "porto-3-day-itinerary", "portugal-travel-guide", "europe-7-day-itinerary"],
  readTime: "5 min read",
  }),
  fg({
    slug: "singapore-family-guide", title: "Singapore Family Guide: The Kid-Paced City",
    seoTitle: "Singapore Family Guide", gradient: "from-emerald-500 to-blue-600", author: MARCUS,
    city: "Singapore", country: "Singapore", tags: ["singapore", "family", "kids"],
    meta: "Singapore with kids: Gardens by the Bay, Sentosa's beaches, the zoo's morning feeds, the hawker democracy and the heat-managed rhythm.",
    excerpt: "Gardens, Sentosa, the zoo and hawker dinners that please every age.",
    intro: [
      "Singapore is the easiest great family city in Asia: safe, clean, air-conditioned everywhere, and packed with kid-scale wonders — the Gardens' light shows, Sentosa's beaches, the Zoo's morning feeds, and hawker dinners everyone agrees on.",
      "The heat-managed rhythm is the parent's tool: outdoor before 11am and after 4pm, pools and museums at noon.",
    ],
    sections: [
      { heading: "The Kid Anchors", paragraphs: ["Gardens by the Bay's Supertree lights and the Cloud Forest's mist, the Singapore Zoo's morning feeding sessions, Sentosa's beaches and the cable car, and the ArtScience Museum's interactive exhibits."], bullets: ["Gardens by the Bay's outdoor walks + the Rhapsody show.", "Singapore Zoo's morning feeding sessions.", "Sentosa's beaches and the cable car.", "The ArtScience Museum's interactive floor."] },
      { heading: "The Hawker Democracy", paragraphs: ["Hawker centers solve the family dinner: every age chooses from every cuisine at $4–8 per plate. Maxwell, Lau Pa Sat and the food courts inside the malls make eating out the easiest meal of the day."],
      },
    ],
    route: { heading: "The 3-Day Family Shape", intro: "Bay (1), animals (2), Sentosa (3).", days: [
      { day: 1, theme: "Gardens & the Bay", description: "The outdoor walks, the Cloud Forest, the light show, satay." },
      { day: 2, theme: "Zoo & Hawkers", description: "The morning feeds, the pool hour, Maxwell's chicken rice." },
      { day: 3, theme: "Sentosa & Farewell", description: "The cable car, the beach, Changi's waterfall." },
    ] },
    practical: [
      { heading: "Money", items: ["About S$180/day for the family at the mid tier; hawker meals S$4–8.", "The Zoo and the Gardens' conservatories book online."] },
      { heading: "Logistics", items: ["The MRT covers everything; strollers work on the system.", "Build pool hours into every day — the heat is the boss."] },
    ],
    faq: [
      { question: "Is Singapore good for kids?", answer: "Excellent — safe, clean, air-conditioned and full of kid-scale wonders." },
      { question: "Sentosa or the neighborhoods?", answer: "Sentosa with young kids; the heritage neighborhoods with tweens and teens." },
      { question: "How many days for Singapore with kids?", answer: "Three covers the bay, the animals and Sentosa comfortably." },
    ],
    dest: ["singapore", "kuala-lumpur", "bali"], trips: ["singapore-3d-family", "singapore-2d-highlights", "singapore-food-3d"],
    guides: ["singapore-family-guide", "singapore-3-day-itinerary", "singapore-transportation-guide", "singapore-food-guide", "singapore-travel-budget"],
  readTime: "5 min read",
  }),
  fg({
    slug: "tokyo-vs-kyoto-guide", title: "Tokyo vs Kyoto: Which Japanese City Deserves Your Days?",
    seoTitle: "Tokyo vs Kyoto Guide", gradient: "from-red-500 to-amber-500", author: YUKI,
    city: "Tokyo", country: "Japan", tags: ["tokyo", "kyoto", "comparison"],
    meta: "Tokyo vs Kyoto compared: scale against serenity, the dawn temples against midnight neon, and why the shinkansen makes both the default.",
    excerpt: "The neon megacity against the preserved imperial capital — 2h10 apart.",
    intro: [
      "Tokyo and Kyoto are Japan's two poles: the neon megacity of twelve districts against the preserved imperial capital of temples and lanes. They're 2h10 apart by shinkansen — the contrast is the point.",
    ],
    sections: [
      { heading: "Where Each City Wins", paragraphs: [], bullets: [
        "Tokyo: scale — a dozen districts, world museums, the deepest food scene, day trips.",
        "Kyoto: the preserved past — Fushimi Inari, Arashiyama, Higashiyama, the geisha districts.",
        "Tokyo overwhelms; Kyoto rewards the early riser.",
        "Day trips: Tokyo owns Hakone and Kamakura; Kyoto owns Nara.",
      ] },
      { heading: "The Verdict", paragraphs: ["Both. The 2h10 shinkansen makes the two-capital trip the default — and the contrast is the point. Solo travelers on five days pick one: Tokyo for scale, Kyoto for depth."],
      },
    ],
    route: { heading: "The Split", intro: "The classic two-city week.", days: [
      { day: 1, theme: "The standard split", description: "Tokyo 3 + Kyoto 2, or 3+2+1 with Osaka." },
      { day: 2, theme: "The tiebreakers", description: "Museums and day trips → Tokyo. Temples and gardens → Kyoto." },
    ] },
    practical: [
      { heading: "Budget notes", items: ["Tokyo ~$120/day, Kyoto ~$140/day at planning figures.", "Shinkansen: 2h10, ~¥14,000."] },
      { heading: "The seasons", items: ["Sakura: Kyoto, booked months out.", "Foliage: both, with Kyoto's temples the masterpiece."] },
    ],
    faq: [
      { question: "Tokyo or Kyoto first?", answer: "Tokyo — the arrival hub and the easier jet-lag landing." },
      { question: "Is Kyoto worth it on five days?", answer: "Yes, as the day trip — Fushimi Inari and Higashiyama in one long day." },
      { question: "How many days each?", answer: "The classic: Tokyo three, Kyoto two. Temple-lovers flip it." },
    ],
    dest: ["tokyo", "kyoto", "osaka"], trips: ["tokyo-kyoto-5d", "tokyo-kyoto-osaka-7d", "japan-7d-golden-route"],
    guides: ["tokyo-vs-kyoto-guide", "tokyo-vs-osaka", "kyoto-vs-osaka", "japan-7-day-itinerary", "how-many-days-in-kyoto"],
  readTime: "5 min read",
  }),
];

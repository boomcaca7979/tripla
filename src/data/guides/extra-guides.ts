import type { Guide } from "../guides";

// Extra guides — the cluster referenced by country/AI guides: rail guide,
// national food guides, city itineraries for Copenhagen/Santorini/Athens/
// Munich/Granada/Porto/Hanoi/HCMC/KL, and budget/first-time/transit guides.

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

function cg(cfg: {
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
    publishedAt: "2026-09-14", updatedAt: "2026-09-14", readTime: cfg.readTime,
    tags: cfg.tags, city: cfg.city, country: cfg.country, introduction: cfg.intro,
    sections: cfg.sections, itinerary: cfg.route, practicalInfo: cfg.practical, faq: cfg.faq,
    relatedDestinationSlugs: cfg.dest, relatedTripSlugs: cfg.trips, relatedGuideSlugs: cfg.guides,
    planner: {
      destination: cfg.city, travelStyle: "cultural", interests: ["food", "history"],
      label: `Generate your ${cfg.city} plan`,
    },
  };
}

export const EXTRA_GUIDES: Guide[] = [
  cg({
    slug: "japan-rail-travel-guide", title: "Japan Rail Travel Guide: Shinkansen, IC Cards and the Pass Verdict",
    seoTitle: "Japan Rail Travel Guide", gradient: "from-red-500 to-slate-700", author: YUKI,
    city: "Tokyo", country: "Japan", tags: ["japan", "rail", "transportation"],
    meta: "Japan by rail: the shinkansen booking windows, the IC-card system, the 2023 JR-Pass repricing math, luggage shipping and the scenic lines worth routing for.",
    excerpt: "The shinkansen arithmetic, the IC-card system and the honest pass verdict.",
    intro: [
      "Japan's rail network is the country's real attraction: 320 km/h trains at 90-second punctuality, IC cards that dissolve fares, and luggage services that erase the packing problem. This guide is the arithmetic — booking windows, the re-priced pass verdict, and the scenic lines worth a detour.",
      "The one-line summary: point-to-point tickets beat the nationwide JR Pass on any itinerary under ten days without Hiroshima — price both, then book early.",
    ],
    sections: [
      { heading: "The Shinkansen Arithmetic", paragraphs: ["Tokyo–Kyoto ¥14,000 (2h10), Tokyo–Osaka ¥14,500 (2h30), Tokyo–Hakone from ¥8,000 with the Romancecar add. Book seats at the green windows, machines or the smart EX app — peak seasons (sakura, Golden Week, foliage) sell out days ahead.", "The 2023 JR-Pass repricing (~70% up) changed the verdict: a Golden Route week costs ~¥25,000 point-to-point against the ¥50,000 pass. Passes win only at two weeks with Hiroshima — price your actual route."], bullets: ["Tokyo–Kyoto ¥14,000, 2h10 — book peak seats ahead.", "The JR Pass loses under 10 days without Hiroshima.", "Mt Fuji sits on the right side heading west (E seat)."] },
      { heading: "IC Cards & Luggage", paragraphs: ["Suica/ICOCA on your phone covers every city train, bus and konbini nationwide. Takkyubin luggage shipping (¥2,000–2,500 per bag, overnight) moves bags between hotels — it's why Japan packs light, and why you should too."],
      },
      { heading: "The Scenic Detours", paragraphs: ["The Romancecar's Observation Deck to Hakone, the Kurobe gorge's little trains, the Yufuin no Mori to Kyushu, and the Five of the nothing-better-to-do rides: for pure scenery, the Odoriko along the Izu coast wins."],
      },
    ],
    route: { heading: "The Rail Week in Use", intro: "The Golden Route by ticket.", days: [
      { day: 1, theme: "Tokyo → Hakone", description: "Romancecar from Shinjuku; the Fuji-side seats." },
      { day: 2, theme: "Hakone → Kyoto", description: "Shinkansen from Odawara; Higashiyama by dusk." },
      { day: 3, theme: "Kyoto → Osaka", description: "The 15-minute local; Dotonbori's neon." },
    ] },
    practical: [
      { heading: "Money", items: ["Point-to-point Golden Route week ≈ ¥25,000 total.", "IC card on the phone; no city passes needed."] },
      { heading: "Booking", items: ["Peak shinkansen seats: days to weeks ahead.", "Luggage shipping: any hotel front desk, overnight."] },
    ],
    faq: [
      { question: "Do I need the JR Pass?", answer: "Rarely under ten days without Hiroshima — point-to-point is cheaper since the 2023 reprice." },
      { question: "How do I book shinkansen seats?", answer: "smart EX app, machines or green windows — peak seasons sell out days ahead." },
      { question: "How does luggage shipping work?", answer: "Takkyubin via any hotel desk — ¥2,000–2,500 per bag, overnight, flawlessly." },
    ],
    dest: ["tokyo", "kyoto", "osaka"], trips: ["japan-7d-golden-route", "tokyo-kyoto-osaka-7d", "japan-10d-classic"],
    guides: ["japan-first-time-guide", "japan-travel-budget", "japan-7-day-itinerary", "tokyo-transportation-guide", "best-time-to-visit-japan"],
    readTime: "6 min read",
  }),
  cg({
    slug: "italy-food-guide", title: "Italy Food Guide: Eat by Region, Not by Menu",
    seoTitle: "Italy Food Guide", gradient: "from-green-600 to-red-600", author: SOFIA,
    city: "Rome", country: "Italy", tags: ["italy", "food"],
    meta: "Italy by plate: Rome's four pastas, Florence's bistecca, Naples' pizza, Venice's cicchetti, Bologna's ragù and Puglia's orecchiette — the regional curriculum.",
    excerpt: "The regional curriculum: four pastas, one bistecca, one pizza and a hundred trattorias.",
    intro: [
      "Italy is twenty regions that happen to share a flag, and every one eats differently: Rome's four pastas, Florence's bistecca, Naples' pizza, Venice's cicchetti, Bologna's ragù, Puglia's orecchiette. The food guide is regional — order the local specialty or don't order at all.",
    ],
    sections: [
      { heading: "The Regional Curriculum", paragraphs: ["Rome: carbonara, cacio e pepe, amatriciana, gricia — no cream. Florence: bistecca alla fiorentina, ribollita, lampredotto. Naples: the pizza, the sfogliatella. Venice: cicchetti and sarde in saor. Bologna: tagliatelle al ragù, mortadella, tortellini in brodo. Puglia: orecchiette with cime di rapa."], bullets: ["Rome: the four pastas, judged by the cacio e pepe.", "Florence: share the bistecca; the solo version is a mortgage.", "Naples: one margherita at the source, minimum."] },
      { heading: "The Menu Rules", paragraphs: ["Primi are pastas, secondi are meats — ordering both is a feast, one is a meal. The coperto (cover charge) is legal and printed. House wine (vino della casa) is honest at €5–8. Cappuccino is breakfast; espresso is everything after."] },
    ],
    route: { heading: "The Regional Week", intro: "One region, one plate per day.", days: [
      { day: 1, theme: "Rome — the pastas", description: "Carbonara day one; cacio e pepe by day three." },
    ] },
    practical: [
      { heading: "Money", items: ["Trattoria pastas €10–14; regional dinners €35–50 for two.", "The south costs half the north — eat accordingly."] },
      { heading: "Etiquette", items: ["No cream in carbonara — it's law, not preference.", "Espresso standing at the bar, half the table price."] },
    ],
    faq: [
      { question: "What should I eat in Italy?", answer: "The regional specialty where you are — carbonara in Rome, ragù in Bologna, pizza in Naples. Never the generic Italian menu." },
      { question: "Is house wine good?", answer: "Yes — vino della casa at €5–8 is honest, local and the correct choice at trattorias." },
      { question: "Cappuccino after lunch?", answer: "Never — it marks you. Espresso after meals; cappuccino is breakfast." },
    ],
    dest: ["rome", "florence", "naples"], trips: ["rome-food-3d", "italy-7d-classics", "bologna-2d-food"],
    guides: ["rome-food-guide", "italy-travel-guide", "barcelona-food-guide", "slow-travel-italy-2026", "rome-3-day-itinerary"],
    readTime: "6 min read",
  }),
  cg({
    slug: "copenhagen-3-day-itinerary", title: "Copenhagen 3 Day Itinerary: Bikes, Hygge and the Harbor",
    seoTitle: "Copenhagen 3 Day Itinerary", gradient: "from-red-500 to-cyan-600", author: SOFIA,
    city: "Copenhagen", country: "Denmark", tags: ["copenhagen", "itinerary", "3 days"],
    meta: "Three days in Copenhagen: Nyhavn and the harbor baths, Tivoli after dark, Christiania's freetown, the design museums and a Sweden day-trip option.",
    excerpt: "Three days of bikes, hygge, the harbor and Tivoli after dark.",
    intro: [
      "Copenhagen is the two-wheel city: harbor baths in the summer, Tivoli's lanterns after dark, Christiania's freetown anarchy, the design museums, and a bike lane network that makes visitors weep with envy. Three days covers it at hygge pace.",
      "At roughly €160 a day, the trip runs about €480 excluding flights — Scandinavia priced honestly, softened by picnics and city bikes.",
    ],
    sections: [
      { heading: "Day One: The Harbor & Nyhavn", paragraphs: ["Nyhavn's postcard canal, the harbor bath swim (summer) or the crisp walk (winter), the Little Mermaid's touristy pilgrimage, and Kastellet's star fortress. Evening: Tivoli after dark."],
      },
      { heading: "Day Two: Design & Freetown", paragraphs: ["The Design Museum, Christiania's car-free lanes (photos limited — respect the rules), Christianshavn's canals, and the smørrebrød lunch that defines the cuisine. Evening: the Meatpacking's bars."],
      },
      { heading: "Day Three: Malmö or the Museums", paragraphs: ["The Øresund bridge train to Malmö (35 minutes) for the two-country brag, or the National Museum and the Glyptotek's winter garden. Farewell smørrebrød and the airport's 15 minutes."],
      },
    ],
    route: { heading: "The 3-Day Shape", intro: "Harbor (1), design (2), Malmö or museums (3).", days: [
      { day: 1, theme: "The Harbor", description: "Nyhavn, the baths, the Mermaid, Tivoli after dark." },
      { day: 2, theme: "Design & Freetown", description: "The Design Museum, Christiania, smørrebrød, Meatpacking." },
      { day: 3, theme: "Malmö or Museums", description: "The bridge train — or the Glyptotek's garden." },
    ] },
    practical: [
      { heading: "Money", items: ["About €160/day at planning figures; picnics and city bikes manage it.", "Smørrebrød lunch €15–25; Tivoli entry + rides ~€30."] },
      { heading: "Logistics", items: ["Rent city bikes via the app; the lanes are the transport.", "CPH airport: 15 minutes by metro."] },
    ],
    faq: [
      { question: "Is Copenhagen expensive?", answer: "Yes, honestly — €160/day. Picnics, city bikes and one splurge keep it human." },
      { question: "Is the Malmö day trip worth it?", answer: "For the bridge and the two-country photo — yes, in 35 minutes each way." },
      { question: "When should I visit?", answer: "May–August for the harbor baths; December for Tivoli's Christmas version." },
    ],
    dest: ["copenhagen", "stockholm", "oslo"], trips: ["stockholm-3d-islands-design", "oslo-2d-fjord-modern", "europe-10d-highlights"],
    guides: ["northern-europe-travel-guide", "europe-10-day-itinerary", "copenhagen-3-day-itinerary"],
    readTime: "5 min read",
  }),
  cg({
    slug: "santorini-3-day-itinerary", title: "Santorini 3 Day Itinerary: The Caldera Properly",
    seoTitle: "Santorini 3 Day Itinerary", gradient: "from-blue-500 to-slate-200", author: SOFIA,
    city: "Santorini", country: "Greece", tags: ["santorini", "itinerary", "3 days"],
    meta: "Three days on Santorini: the Fira-to-Oia caldera walk, Akrotiri's Bronze-Age city, Perissa's black sand and an Assyrtiko tasting above the sea.",
    excerpt: "The caldera walk, Akrotiri's ruins, the black sand and the wine.",
    intro: [
      "Santorini in three days: the caldera rim walk between Fira and Oia (three hours, windiest in the middle), Akrotiri's ash-preserved Bronze-Age streets, Perissa's black-sand beach, and the volcanic Assyrtiko wines grown in the lava. May–June and September–October are the window.",
      "At roughly €180 a day, the trip runs about €540 excluding flights — the caldera view is the premium, and worth it once.",
    ],
    sections: [
      { heading: "Day One: The Rim", paragraphs: ["Fira's cliff-edge walk, the cable-car view, the first sunset from a quieter terrace than Oia's famous one."],
      },
      { heading: "Day Two: The Walk & Oia", paragraphs: ["The Fira-to-Oia caldera walk at 8:30 (three hours, water mandatory), Oia's blue domes by lunch, and the famous sunset claimed two hours early from the castle ruins."],
      },
      { heading: "Day Three: Akrotiri & Wine", paragraphs: ["Akrotiri's 3,600-year-old streets preserved in ash, the Red Beach's iron cliffs, and an Assyrtiko tasting at a caldera-edge winery before the flight."],
      },
    ],
    route: { heading: "The 3-Day Shape", intro: "Rim (1), walk and Oia (2), Akrotiri and wine (3).", days: [
      { day: 1, theme: "The Rim", description: "Fira's walk, the cable car, the first sunset." },
      { day: 2, theme: "The Walk & Oia", description: "Fira to Oia at 8:30; the castle-ruins sunset." },
      { day: 3, theme: "Akrotiri & Wine", description: "The Bronze-Age city, the Red Beach, the tasting." },
    ] },
    practical: [
      { heading: "Money", items: ["About €180/day at planning figures — the caldera view is the premium.", "Assyrtiko tastings €20–40; Akrotiri entry €15."] },
      { heading: "Logistics", items: ["Rent an ATV or use the buses — the caldera towns are steep.", "Book caldera-view rooms 2–3 months out for May–October."] },
    ],
    faq: [
      { question: "Is 3 days enough for Santorini?", answer: "Yes — the walk, the ruins, the beach and the wine fit comfortably." },
      { question: "Oia or Fira for the sunset?", answer: "Oia's is famous; the Fira-side terraces serve the same sun without the scrum." },
      { question: "How much does 3 days cost?", answer: "About €540 excluding flights at our €180/day planning estimate." },
    ],
    dest: ["santorini", "athens"], trips: ["santorini-3d-caldera", "greece-10d-athens-islands", "athens-3d-classics"],
    guides: ["greece-travel-guide", "athens-4-day-itinerary", "mediterranean-travel-guide", "athens-3-day-itinerary"],
    readTime: "5 min read",
  }),
  cg({
    slug: "athens-3-day-itinerary", title: "Athens 3 Day Itinerary: The Classical Core",
    seoTitle: "Athens 3 Day Itinerary", gradient: "from-blue-500 to-amber-600", author: SOFIA,
    city: "Athens", country: "Greece", tags: ["athens", "itinerary", "3 days"],
    meta: "Three days in Athens: the Acropolis at opening, the museum vaults, Plaka's lanes and the Lycabettus sunset — with the islands a metro ride away.",
    excerpt: "The Acropolis at opening, the bronzes, Plaka's lanes and the Lycabettus sunset.",
    intro: [
      "Three days covers Athens' classical core: the Acropolis at 8am before the heat and the coaches, the Acropolis Museum's top-floor parthenon frieze, the National Archaeological Museum's bronzes, and Plaka's island-village lanes. Sunset from Mount Lycabettus closes two of the three days.",
      "At roughly €95 a day, the trip runs about €285 excluding flights — Europe's cheapest gateway to the classical world and the islands beyond.",
    ],
    sections: [
      { heading: "Day One: The Acropolis", paragraphs: ["The Parthenon at the 8am opening slot (timed tickets online), the Acropolis Museum's glass floors, and Plaka's lanes for lunch. Evening: taverna dinner under the floodlit rock."],
      },
      { heading: "Day Two: Museums & the Agora", paragraphs: ["The National Archaeological Museum's bronze Zeus and the Mask of Agamemnon, the Ancient Agora's Temple of Hephaestus, and the Anafiotika lanes clinging to the Acropolis's north slope."],
      },
      { heading: "Day Three: Lycabettus & Farewell", paragraphs: ["The Temple of Olympian Zeus, souvlaki at O Kostas, and the funicular or the climb up Mount Lycabettus for the sunset over the whole classical world."],
      },
    ],
    route: { heading: "The 3-Day Shape", intro: "Acropolis (1), museums (2), Lycabettus (3).", days: [
      { day: 1, theme: "The Acropolis", description: "The 8am Parthenon, the museum, Plaka, taverna dinner." },
      { day: 2, theme: "Museums & Agora", description: "The bronzes, Hephaestus' temple, Anafiotika." },
      { day: 3, theme: "Lycabettus & Farewell", description: "Zeus' temple, the souvlaki verdict, the sunset climb." },
    ] },
    practical: [
      { heading: "Money", items: ["About €95/day at planning figures — taverna dinners €25–40 for two.", "The Acropolis' timed entry books online; summer slots sell out."] },
      { heading: "Logistics", items: ["The metro covers the center; Piraeus is 20 minutes for the islands.", "Summer heat: 35°C+ — the 8am opening is non-negotiable."] },
    ],
    faq: [
      { question: "Is 3 days enough for Athens?", answer: "For the classical core — yes. Day four adds the islands or Delphi (see our 4-day guide)." },
      { question: "Acropolis at sunrise or sunset?", answer: "Opening — cool, empty, and the light is better on the marble anyway." },
      { question: "How much does 3 days in Athens cost?", answer: "About €285 excluding flights at our €95/day planning estimate." },
    ],
    dest: ["athens", "santorini"], trips: ["athens-3d-classics", "greece-10d-athens-islands", "santorini-3d-caldera"],
    guides: ["greece-travel-guide", "athens-4-day-itinerary", "santorini-3-day-itinerary", "mediterranean-travel-guide", "europe-7-day-itinerary"],
    readTime: "5 min read",
  }),
  cg({
    slug: "munich-3-day-itinerary", title: "Munich 3 Day Itinerary: Beer Gardens and the Alps",
    seoTitle: "Munich 3 Day Itinerary", gradient: "from-blue-600 to-emerald-600", author: MARCUS,
    city: "Munich", country: "Germany", tags: ["munich", "itinerary", "3 days"],
    meta: "Three days in Munich: the Englischer Garten's surfers, the Viktualienmarkt, Nymphenburg, the Dachau memorial and a Neuschwanstein day trip.",
    excerpt: "Beer gardens, the surf wave, the palace and the fairytale castle day trip.",
    intro: [
      "Three days in Munich runs on beer-garden time: the Englischer Garten's river-surfers, the Viktualienmarkt's lunches, Nymphenburg's palace, the sobering Dachau memorial, and the Neuschwanstein day trip that closes the postcard.",
      "At roughly €150 a day, the trip runs about €450 excluding flights — Oktoberfest weeks excepted, when Munich rewrites all its prices.",
    ],
    sections: [
      { heading: "Day One: The Center & the Gardens", paragraphs: ["Marienplatz's Glockenspiel hour, the Viktualienmarkt lunch under the maypole, the Englischer Garten's Eisbach wave and the beer gardens within. Evening: the Chinesischer Turm's tables."],
      },
      { heading: "Day Two: Palaces & the Memorial", paragraphs: ["Nymphenburg's palace and park, the Residenz's Cuvilliés theatre, and the Dachau memorial's essential gravity (30 minutes by S-Bahn)."],
      },
      { heading: "Day Three: Neuschwanstein", paragraphs: ["The early train to Füssen, the fairytale castle's booked tour, the Alpsee's lake walk, and the farewell weisswurst before the evening train."],
      },
    ],
    route: { heading: "The 3-Day Shape", intro: "Center (1), palaces (2), the castle day (3).", days: [
      { day: 1, theme: "Center & Gardens", description: "Marienplatz, the market, the surfers, the beer garden." },
      { day: 2, theme: "Palaces & Memorial", description: "Nymphenburg, the Residenz, Dachau's gravity." },
      { day: 3, theme: "Neuschwanstein", description: "The fairytale castle, the Alpsee, the farewell pretzel." },
    ] },
    practical: [
      { heading: "Money", items: ["About €150/day at planning figures — the beer gardens keep dinners honest.", "Neuschwanstein tickets book online days ahead."] },
      { heading: "Logistics", items: ["Oktoberfest (late Sep) rewrites prices — book months out or avoid.", "The Bayern Ticket covers the Füssen train and regional day trips."] },
    ],
    faq: [
      { question: "Is 3 days enough for Munich?", answer: "For the city, one memorial and one castle day trip — yes, comfortably." },
      { question: "Dachau — should I visit?", answer: "It's sobering and essential; pair it with an evening that insists on life, as the city does." },
      { question: "How much does 3 days in Munich cost?", answer: "About €450 excluding flights at our €150/day planning estimate." },
    ],
    dest: ["munich", "berlin", "frankfurt"], trips: ["munich-3d-beer-gardens", "oktoberfest-munich-2026", "germany-7d-berlin-munich"],
    guides: ["germany-travel-guide", "berlin-3-day-itinerary", "best-christmas-markets-germany-2026", "europe-by-train-guide"],
    readTime: "5 min read",
  }),
  cg({
    slug: "granada-3-day-itinerary", title: "Granada 3 Day Itinerary: The Alhambra and the Free Tapas",
    seoTitle: "Granada 3 Day Itinerary", gradient: "from-amber-600 to-red-700", author: SOFIA,
    city: "Granada", country: "Spain", tags: ["granada", "itinerary", "3 days"],
    meta: "Three days in Granada: the Nasrid Palaces' booked slot, the Albaicín's miradors, Sacromonte's cave flamenco and the tapas that arrive free.",
    excerpt: "The Alhambra's booked hour, the miradors, the cave flamenco and the free tapas.",
    intro: [
      "Three days in Granada centers on one booking — the Alhambra's Nasrid Palaces slot, sold out weeks ahead — and one miracle: tapas that arrive free with every drink. The Albaicín's miradors and the Sacromonte's cave flamenco fill the frame.",
      "At roughly €90 a day, the trip runs about €270 excluding flights — Andalusia's best-value culture city.",
    ],
    sections: [
      { heading: "Day One: The Alhambra", paragraphs: ["The Nasrid Palaces at their booked slot (the tilework detail rewards the slow walk), the Generalife's water gardens, and the Albaicín's Mirador de San Nicolás at sunset — the red fortress in gold."],
      },
      { heading: "Day Two: The Albaicín & Sacromonte", paragraphs: ["The white lanes and Dar al-Horra, the Cathedral and Royal Chapel, and the 9pm Sacromonte cave flamenco — zambra style, born here."],
      },
      { heading: "Day Three: Baths & Farewell", paragraphs: ["The Arab baths' steam morning, the Sierra Nevada foothills or the Realejo's street art, and the final tapas crawl through Bodegas Castañeda's crowded rooms."],
      },
    ],
    route: { heading: "The 3-Day Shape", intro: "Alhambra (1), Albaicín (2), baths (3).", days: [
      { day: 1, theme: "The Alhambra", description: "The Nasrid slot, the Generalife, San Nicolás at sunset." },
      { day: 2, theme: "Albaicín & Sacromonte", description: "The lanes, the cathedral, the cave flamenco." },
      { day: 3, theme: "Baths & Farewell", description: "The Arab baths, the Realejo, the final tapas." },
    ] },
    practical: [
      { heading: "Money", items: ["About €90/day at planning figures — tapas dinners for two under €30.", "The Alhambra ticket €15–20; the Arab baths €25–35."] },
      { heading: "Logistics", items: ["Alhambra tickets sell out weeks ahead — book first, plan second.", "The Albaicín is steep: the mirador walk is downhill, not up."] },
    ],
    faq: [
      { question: "Is 3 days enough for Granada?", answer: "Yes — the Alhambra, the quarters and the caves fit comfortably." },
      { question: "How far ahead for Alhambra tickets?", answer: "Weeks — the Nasrid slot is the single most important booking in Andalusia." },
      { question: "Do tapas really come free?", answer: "In Granada, genuinely yes — a drink orders a plate. It's the last city in Spain where the tradition survives intact." },
    ],
    dest: ["granada", "seville", "malaga"], trips: ["granada-3d-alhambra", "spain-10d-andalusia", "malaga-3d-museums-coast"],
    guides: ["spain-travel-guide", "granada-3-day-itinerary", "madrid-3-day-itinerary", "mediterranean-travel-guide", "europe-by-train-guide"],
    readTime: "5 min read",
  }),
  cg({
    slug: "porto-3-day-itinerary", title: "Porto 3 Day Itinerary: River, Cellars and Tiles",
    seoTitle: "Porto 3 Day Itinerary", gradient: "from-indigo-600 to-amber-500", author: SOFIA,
    city: "Porto", country: "Portugal", tags: ["porto", "itinerary", "3 days"],
    meta: "Three days in Porto: the Dom Luís bridge, Gaia's port cellars, Livraria Lello's staircase, São Bento's tiles and the Douro Valley train.",
    excerpt: "The bridge, the cellars, the staircase and the Douro train.",
    intro: [
      "Three days in Porto: the Dom Luís I bridge's top deck, the port cellars across the river in Gaia, Livraria Lello's bookstore staircase (booked), São Bento's tile hall, and the Douro Valley train to Pinhão's vineyard terraces.",
      "At roughly €90 a day, the trip runs about €270 excluding flights — Portugal's moodier, steeper, cheaper second city.",
    ],
    sections: [
      { heading: "Day One: The River", paragraphs: ["The Ribeira's riverfront, the Dom Luís top deck, francesinha lunch at Café Santiago, São Bento's tile hall, and the Gaia cellars at sunset — Taylor's, Graham's or the smaller quintas."],
      },
      { heading: "Day Two: Books & the Ocean", paragraphs: ["Livraria Lello's booked hour, Cedofeita's galleries, and the Foz do Douro ocean end — the lighthouse and the wave-washed terraces."],
      },
      { heading: "Day Three: The Douro", paragraphs: ["The Douro train to Pinhão's vineyard station, a quinta tasting on the terraces, and the farewell tripas or seafood."] },
    ],
    route: { heading: "The 3-Day Shape", intro: "River (1), books (2), the Douro (3).", days: [
      { day: 1, theme: "The River", description: "The Ribeira, the bridge, the tiles, the cellars at sunset." },
      { day: 2, theme: "Books & Ocean", description: "Lello's staircase, the galleries, Foz's lighthouse." },
      { day: 3, theme: "The Douro", description: "Pinhão by train, the quinta tasting, the farewell." },
    ] },
    practical: [
      { heading: "Money", items: ["About €90/day at planning figures — port tastings €10–25.", "Livraria Lello's ticket books days ahead."] },
      { heading: "Logistics", items: ["The Douro line from São Bento is the scenic option — sit right.", "The hills: the funicular and the bridge's lower deck save the legs."] },
    ],
    faq: [
      { question: "Is 3 days enough for Porto?", answer: "Yes — the river, the cellars and the Douro day fit comfortably." },
      { question: "Lello — worth the booked ticket?", answer: "The staircase is the photo; the ticket credits against a book. Go at opening." },
      { question: "How much does 3 days in Porto cost?", answer: "About €270 excluding flights at our €90/day planning estimate." },
    ],
    dest: ["porto", "lisbon"], trips: ["porto-3d-river-port", "portugal-7d-lisbon-porto", "lisbon-3d-hills"],
    guides: ["portugal-travel-guide", "lisbon-3-day-itinerary", "europe-7-day-itinerary", "best-european-cities-first-time", "porto-3-day-itinerary"],
    readTime: "5 min read",
  }),
  cg({
    slug: "rome-travel-budget", title: "Rome Travel Budget: What a Day Costs in the Eternal City",
    seoTitle: "Rome Travel Budget", gradient: "from-orange-600 to-red-700", author: SOFIA,
    city: "Rome", country: "Italy", tags: ["rome", "budget"],
    meta: "Rome daily costs: €80 budget, €130 mid-range, €250+ comfort — trattorias, fountains, timed entries and the honest cheap tricks.",
    excerpt: "The Rome budget: trattorias, fountains, free piazzas and the €130 middle.",
    intro: [
      "Rome's budget is the kindest of Europe's big three: our planning figure is about €130 a day mid-range, with honest budgeting at €80 and comfort at €250. The fountains, piazzas and basilicas are free; the trattorias undercut Paris and London dramatically.",
    ],
    sections: [
      { heading: "The Three Tiers", paragraphs: ["Budget (€80/day): a Termini-adjacent room, pizza al taglio lunches, fountain-refilled water, the free piazzas. Mid-range (€130/day): a Monti or Prati room, trattoria dinners, the timed big-two entries. Comfort (€250+/day): a Centro Storico boutique, rooftop aperitivi, the Borghese and the drivers."], bullets: ["Budget €80: pizza al taglio €4, pastas €10–14.", "Mid-range €130: trattoria dinner for two €45.", "Comfort €250+: the rooftops and the drivers."] },
      { heading: "The Free Catalog", paragraphs: ["The Trevi, the Pantheon's exterior, Navona, the Spanish Steps, the nasoni fountains, the Gianicolo's view, St Peter's Square — Rome's free floor is the deepest in Europe. The big two (Colosseum+Forum, Vatican) are the only paid musts."],
      },
    ],
    route: { heading: "One Day at Two Budgets", intro: "Same streets, two wallets.", days: [
      { day: 1, theme: "€80 vs €250", description: "Free fountains and pizza al taglio — versus the rooftop aperitivo, the Borghese and the driver to Ostia." },
    ] },
    practical: [
      { heading: "The math", items: ["Three days mid-range ≈ €390; budget ≈ €240; comfort ≈ €750.", "The timed big-two entries: €18–25 each."] },
      { heading: "Cheap tricks", items: ["The nasoni fountains: free, cold, safe.", "Pizza al taglio by weight for lunch.", "House wine at trattorias: €5–8 per quarter liter."] },
    ],
    faq: [
      { question: "Is Rome expensive?", answer: "The kindest of Europe's big three — about €130/day mid-range, with the south even kinder." },
      { question: "How much for 3 days in Rome?", answer: "€390 mid-range, €240 budget, €750 comfort — excluding flights." },
      { question: "What's the cheapest good meal in Rome?", answer: "Pizza al taglio by weight (€3–6) or a Monti trattoria's €10 carbonara." },
    ],
    dest: ["rome", "florence", "naples"], trips: ["rome-3d-classics", "rome-food-3d", "italy-7d-classics"],
    guides: ["rome-3-day-itinerary", "rome-food-guide", "italy-travel-guide", "rome-first-time-guide", "rome-5-day-itinerary"],
    readTime: "5 min read",
  }),
  cg({
    slug: "northern-italy-itinerary", title: "Milan 2 Day Itinerary: Design, Duomo and Aperitivo",
    seoTitle: "Milan 2 Day Itinerary", gradient: "from-gray-600 to-red-500", author: SOFIA,
    city: "Milan", country: "Italy", tags: ["milan", "itinerary", "2 days"],
    meta: "48 hours in Milan: the Duomo's rooftops, the Last Supper (booked months out), the Navigli aperitivo and Brera's galleries.",
    excerpt: "The Duomo's roof, the Last Supper, the Navigli aperitivo.",
    intro: [
      "Milan in 48 hours is three bookings and a canal: the Duomo's rooftop terraces, Leonardo's Last Supper (booked months out — the ticket window opens months ahead and closes in hours), and the Navigli aperitivo between them.",
      "At roughly €130 a day, the trip runs about €260 excluding flights. April–June and September are ideal; August is hot and half-closed.",
    ],
    sections: [
      { heading: "Day One: The Icons", paragraphs: ["The Duomo's roof at opening (stairs or lift), the Galleria's apex and the Quadrilatero's windows, the Last Supper's fifteen booked minutes, and the Navigli aperitivo along the canals."],
      },
      { heading: "Day Two: Brera & Farewell", paragraphs: ["The Pinacoteca di Brera's Mantegnas and Caravaggios, the Brera district's cafés, risotto alla milanese lunch, and the Lake Como teaser — 45 minutes by train if the evening flight allows."],
      },
    ],
    route: { heading: "Your 48 Hours", intro: "Icons (1), Brera (2).", days: [
      { day: 1, theme: "The Icons", description: "The rooftop, the Galleria, the Last Supper, the Navigli." },
      { day: 2, theme: "Brera & Farewell", description: "The Pinacoteca, the risotto, the Como teaser." },
    ] },
    practical: [
      { heading: "Bookings", items: ["The Last Supper: months out — the slot opens and closes in hours.", "The Duomo roof: days ahead for the sunset slots."] },
      { heading: "Money", items: ["About €260 for two days at planning figures, excluding flights."] },
    ],
    faq: [
      { question: "How do I book the Last Supper?", answer: "The official Cenacolo site releases tickets months ahead — set an alert; they vanish in hours." },
      { question: "Is Milan worth two days?", answer: "Yes — the roof, the Last Supper and the Navigli are genuinely singular." },
      { question: "How much does 2 days in Milan cost?", answer: "About €260 excluding flights at our €130/day planning estimate." },
    ],
    dest: ["milan", "venice", "florence"], trips: ["slow-travel-italy-10-day", "italy-7d-classics"],
    guides: ["italy-travel-guide", "slow-travel-italy-10-day", "italy-10-day-itinerary", "venice-3-day-itinerary", "italy-food-guide"],
    readTime: "4 min read",
  }),
  cg({
    slug: "singapore-first-time-guide", title: "Singapore First Time Guide: The Essentials",
    seoTitle: "Singapore First Time Guide", gradient: "from-emerald-500 to-teal-700", author: MARCUS,
    city: "Singapore", country: "Singapore", tags: ["singapore", "first time", "beginners"],
    meta: "The Singapore first-timer's primer: contactless MRT, the heat rhythm, the chope tissue rule and the hawker etiquette.",
    excerpt: "Everything before you land: the contactless MRT, the heat rhythm and the chope rule.",
    intro: [
      "Singapore's first-timer preparation is the shortest in Asia: a contactless card for the MRT, the heat rhythm (outdoors at 9am and 4pm, indoors at noon), and the tissue-packet chope rule. This guide is the fifteen minutes.",
    ],
    sections: [
      { heading: "The Contactless MRT", paragraphs: ["Foreign cards and phones tap directly at MRT and bus gates — no EZ-Link purchase needed. Rides S$1–2.50; the day rarely exceeds S$5. The network covers every sight at 15-minute rides."], bullets: ["Foreign contactless tap at every gate.", "The underground mall links for the hot middays.", "Grab for the downpours only."] },
      { heading: "The Heat Rhythm & the Chope Rule", paragraphs: ["Outdoors before 11am and after 4pm; the conservatories, museums and malls absorb noon. At the hawker centers, 'chope' the seat with a tissue packet while you queue — the national reservation system, honored absolutely."],
      },
    ],
    route: { heading: "The First Evening", intro: "Arrival hour.", days: [
      { day: 1, theme: "Arrive and eat", description: "MRT in, the bay walk at golden hour, satay at Lau Pa Sat when the towers light up." },
    ] },
    practical: [
      { heading: "Money", items: ["About S$180/day mid-range at planning figures.", "Hawker meals S$4–8; alcohol is the taxed line."] },
      { heading: "Practical", items: ["A compact umbrella for the 20-minute downpours.", "Sunscreen is not optional — the equatorial UV is extreme."] },
    ],
    faq: [
      { question: "Do I need an EZ-Link card?", answer: "No — foreign contactless cards and phones tap directly at the gates." },
      { question: "Is Singapore safe?", answer: "One of the safest cities on earth — the rules are strict and the streets follow." },
      { question: "What's chope?", answer: "Reserving a hawker seat with a tissue packet while you queue for food. It works; don't question it." },
    ],
    dest: ["singapore", "kuala-lumpur", "bali"], trips: ["singapore-2d-highlights", "singapore-3d-family", "singapore-food-3d"],
    guides: ["singapore-first-time-guide", "singapore-3-day-itinerary", "singapore-transportation-guide", "singapore-food-guide", "singapore-travel-budget"],
    readTime: "4 min read",
  }),
  cg({
    slug: "bangkok-transportation-guide", title: "Bangkok Transportation Guide: BTS, Boats and Grab",
    seoTitle: "Bangkok Transportation Guide", gradient: "from-sky-500 to-amber-500", author: PRIYA,
    city: "Bangkok", country: "Thailand", tags: ["bangkok", "transportation", "transit"],
    meta: "Bangkok transit decoded: the BTS Skytrain, the Chao Phraya boats, Grab vs the meter, and the traffic reality that shapes every itinerary.",
    excerpt: "Transit decoded: the BTS, the boats, Grab and the traffic.",
    intro: [
      "Bangkok's transit is a three-layer system: the BTS Skytrain above the traffic, the Chao Phraya boats along the river, and Grab below them — with the legendary traffic as the planning constant. The itineraries that work do temples by boat, markets by BTS and taxis only off-peak.",
    ],
    sections: [
      { heading: "The Three Layers", paragraphs: ["The BTS Skytrain (Rabbit or contactless-friendly cards) covers the modern city; the Chao Phraya orange-flag tourist boat and the khlong ferries cover the river city; Grab covers everything else. The MRT adds the older spine."], bullets: ["BTS Skytrain: Rabbit card or contactless where signed.", "The orange-flag boat: the scenic and honest river option.", "Grab: metered-app honest, off-peak only."] },
      { heading: "The Traffic Reality", paragraphs: ["Bangkok's traffic is the city's true boss: 4–6pm gridlock, weekend market waves. The itineraries that work start at 8am, hide at midday and surface after dark — matching the temple-and-market rhythm anyway."],
      },
    ],
    route: { heading: "The Transit Day", intro: "The system in use.", days: [
      { day: 1, theme: "Boat and BTS", description: "The temple trio by boat, the markets by BTS, dinner off-peak by Grab." },
    ] },
    practical: [
      { heading: "Money", items: ["BTS rides ฿17–60; the river boat ฿30; Grab rides ฿100–250.", "The day rarely exceeds ฿200 in transit."] },
      { heading: "Logistics", items: ["BTS until midnight; Grab fills the night.", "Temple dress code: covered shoulders and knees."] },
    ],
    faq: [
      { question: "BTS or taxis in Bangkok?", answer: "BTS for the modern city, boats for the river, taxis off-peak — never at 5pm." },
      { question: "How do I get to the Grand Palace?", answer: "BTS to Saphan Taksin, then the orange-flag boat to Tha Tien — the scenic and sane route." },
      { question: "Is Grab safe in Bangkok?", answer: "Yes — metered-app honest, and the alternative (un-metered taxis) is the reason it exists." },
    ],
    dest: ["bangkok", "chiang-mai", "phuket"], trips: ["bangkok-3d-temples-markets", "bangkok-food-3d", "thailand-10d-bangkok-islands"],
    guides: ["bangkok-transportation-guide", "bangkok-3-day-itinerary", "thailand-travel-guide", "bangkok-food-guide", "bangkok-nightlife-guide"],
    readTime: "4 min read",
  }),
];

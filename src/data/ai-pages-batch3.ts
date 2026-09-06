import type { AiPage } from "./ai-pages";

// AI travel-planning landing pages, batch 3 — country-specific planners
// referenced by the expansion's country guides. All relatedGuideSlugs and
// relatedDestinationSlugs must resolve.

const PUBLISHED = "2026-09-22";
const UPDATED = "2026-09-22";

function aiPage(cfg: {
  slug: string; title: string; seoTitle: string; meta: string; subtitle: string;
  audience: string; intro: string[];
  how: { heading: string; paragraphs: string[]; bullets?: string[] }[];
  style: { heading: string; paragraphs: string[] }[];
  faq: { question: string; answer: string }[];
  guides: string[]; dests: string[]; plannerCity: string; readTime: string;
}): AiPage {
  return {
    slug: cfg.slug, title: cfg.title, seoTitle: cfg.seoTitle, metaDescription: cfg.meta,
    subtitle: cfg.subtitle, audience: cfg.audience, intro: cfg.intro,
    howItWorks: cfg.how, styleAndBudget: cfg.style, faq: cfg.faq,
    relatedGuideSlugs: cfg.guides, relatedDestinationSlugs: cfg.dests,
    planner: {
      destination: cfg.plannerCity, travelStyle: "cultural", interests: ["food", "history"],
      label: `Plan your ${cfg.plannerCity} trip with AI`,
    },
    publishedAt: PUBLISHED, updatedAt: UPDATED, readTime: cfg.readTime,
  };
}

export const AI_PAGES_BATCH_3: AiPage[] = [
  aiPage({
    slug: "ai-trip-planner-vietnam", title: "AI Vietnam Trip Planner: The S-Curve by Rail and Flight",
    seoTitle: "AI Vietnam Trip Planner", meta: "Plan a Vietnam trip with AI: the Hanoi-to-Saigon S-curve, Ha Long and Ninh Binh karsts, Hoi An's lanterns and the street-food curriculum.",
    subtitle: "The S-curve routed by season and rail — day by day with cost estimates.",
    audience: "For travelers who want the full country's food and landscapes in one week or two.",
    intro: [
      "Vietnam runs a thousand miles down a curve of coastline, and every region has its own season and its own food. An AI Vietnam planner routes the S-curve honestly — Hanoi's Old Quarter, Ha Long's karsts, Hoi An's lanterns and Saigon's engines — scheduled around the weather windows.",
      "Feed it your dates and the planner sequences the cities by season: the north in autumn, the center in spring, the south in winter — with per-day figures in dollars at $50/day.",
    ],
    how: [
      { heading: "The season-aware S-curve", paragraphs: ["The planner routes north-to-south or south-to-north by your dates: Hanoi and Ha Long in October–December, Hoi An and Da Nang in February–April, Saigon and the Mekong in December–April. The internal flights (1h20) are scheduled as the hinges between acts."], bullets: ["Season-matched routing — north or south first.", "Internal flights scheduled between regions.", "Street-food curriculum: pho, bun cha, banh mi, com tam.", "Per-day figures in dollars at $50/day planning tier."] },
      { heading: "Refining the plan", paragraphs: ["Add the cooking-class interest for the Hoi An school, or the history interest for the Cu Chi and War Remnants days. The planner weights the itinerary toward your selections."] },
    ],
    style: [
      { heading: "Styles for Vietnam", paragraphs: ["Foodie produces the eating-first shape; cultural adds the war-history weight; adventure adds Ninh Binh's cycling and the caves. The S-curve structure holds in all three."] },
      { heading: "Budget for Vietnam", paragraphs: ["About $50/day at the mid tier — street meals $1–3, the Ha Long cruise $50–80, and the internal flights $30–60."] },
    ],
    faq: [
      { question: "How many days for Vietnam?", answer: "Eight does Saigon to Hanoi properly; ten adds the Mekong Delta and Ninh Binh." },
      { question: "Ha Long day trip or overnight cruise?", answer: "The overnight cruise is the better trip; the day cruise is the honest short version. Both are good." },
      { question: "Which season?", answer: "February–April splits the north and south seasons best." },
      { question: "Is Vietnam cheap?", answer: "The best value in Asia — about $50/day at the mid tier." },
    ],
    guides: ["vietnam-travel-guide", "hanoi-3-day-itinerary", "ho-chi-minh-city-3-day-itinerary", "southeast-asia-travel-guide"],
    dests: ["hanoi", "ho-chi-minh-city", "da-nang"], plannerCity: "Hanoi", readTime: "5 min read",
  }),
  aiPage({
    slug: "ai-trip-planner-indonesia", title: "AI Indonesia Trip Planner: Bali, Java and the Islands",
    seoTitle: "AI Indonesia Trip Planner", meta: "Plan an Indonesia trip with AI: Bali's Ubud and coast, Java's Borobudur and Bromo, Lombok's Rinjani and the Gili Islands.",
    subtitle: "Bali as the base, the neighbors as extensions — routed by season and drive time.",
    audience: "For travelers who want Bali plus the Indonesian archipelago's temples, volcanoes and islands.",
    intro: [
      "Indonesia is 17,000 islands with a select-few travel circuit: Bali's terraces and temples, Java's Borobudur sunrise and Bromo's crater, Lombok's wild beaches and the Gili's car-free sand. An AI Indonesia planner sequences them by season and drive time.",
      "Planning figures: Bali ~$70/day, Java ~$50, Lombok ~$55 — with internal flights $30–80 and private drivers $40–60/day.",
    ],
    how: [
      { heading: "The island-hopping logic", paragraphs: ["The generated plans sequence Bali's two-base structure (Ubud then the coast), then schedule the Java extension (Borobudur at dawn, Prambanan) or the Lombok-Gili arc as the second act — with the internal flights marked."], bullets: ["Bali's Ubud-then-coast two-base structure.", "Java extension: Borobudur, Prambanan, Yogyakarta.", "Lombok-Gili: the fast boat or the flight.", "Private-driver days scheduled for the temple geography."] },
      { heading: "Refining the plan", paragraphs: ["The honest trade: Bali depth versus island breadth. Five days does Bali alone; seven adds one extension; ten does both."] },
    ],
    style: [
      { heading: "Styles for Indonesia", paragraphs: ["Relaxed for the villa-and-beach shape; adventure for the volcano treks and canyoneering; foodie for the warung-to-fine-dining range. The two-base structure holds in all three."] },
      { heading: "Budget for Indonesia", paragraphs: ["Bali ~$70/day, Java ~$50, Lombok ~$55 — villas $40–60, drivers $40–60 split, warung meals $2–5."] },
    ],
    faq: [
      { question: "Bali alone or island-hop?", answer: "Bali alone for five days; island-hop from a week. The flights make hops cheap." },
      { question: "Java or the Gilis?", answer: "Java for the temples and volcanoes; the Gilis for the car-free beaches." },
      { question: "How many days for Indonesia?", answer: "A week does Bali plus one extension; ten does both." },
      { question: "Does the plan include drivers?", answer: "It schedules the driver days that the temple geography demands." },
    ],
    guides: ["indonesia-travel-guide", "bali-travel-budget", "bali-5-day-itinerary"],
    dests: ["bali", "yogyakarta", "lombok"], plannerCity: "Bali", readTime: "5 min read",
  }),
  aiPage({
    slug: "ai-trip-planner-philippines", title: "AI Philippines Trip Planner: 7,000 Islands, Routed",
    seoTitle: "AI Philippines Trip Planner", meta: "Plan a Philippines trip with AI: Palawan's lagoons, Cebu's whale sharks, Boracay's sand and the ferry-and-flight island math.",
    subtitle: "The island archipelago routed by season and ferry math — day by day.",
    audience: "For travelers facing 7,641 islands with two weeks and a healthy respect for ferry timetables.",
    intro: [
      "The Philippines is the world's longest combined coastline, and the planning challenge is island selection: Palawan's lagoons, Cebu's whale sharks, Boracay's powder, Siargao's surf. An AI Philippines planner routes the islands by season and ferry arithmetic.",
      "Planning figures: $50–65/day at the mid tier, with internal flights $30–80 and island-hopping boats $20–40/day.",
    ],
    how: [
      { heading: "The island-selection logic", paragraphs: ["The generated plans sequence the islands by your season: Palawan and Cebu for December–May, Siargao for the March–October surf window. The internal flights ($30–80) and ferries are scheduled as the hinges."], bullets: ["Manila as the arrival gateway (1–2 nights).", "Palawan's El Nido and Coron as the lagoon act.", "Cebu's whale sharks and canyoneering as the adventure act.", "Boracay or Siargao as the beach-or-surf finale."] },
      { heading: "Refining the plan", paragraphs: ["The honest trade: island count versus island depth. Three islands with real days beats five with ferry fatigue. Generate both and compare."] },
    ],
    style: [
      { heading: "Styles for the Philippines", paragraphs: ["Relaxed produces the resort-and-beach shape; adventure adds the canyoneering and diving; foodie routes to the ceviche-and-lechon canon."] },
      { heading: "Budget for the Philippines", paragraphs: ["$50–65/day at the mid tier; internal flights $30–80; island-hopping boats $20–40/day."] },
    ],
    faq: [
      { question: "Palawan or Boracay?", answer: "Palawan for the lagoons and the adventure; Boracay for the pure-beach resort tier." },
      { question: "How many islands per trip?", answer: "Three with real days; four is the maximum before ferry fatigue wins." },
      { question: "Which season?", answer: "December–May is the dry window; June–November is typhoon-aware." },
      { question: "Does the plan include whale sharks?", answer: "Yes — the Cebu day schedules the Oslob encounter with the Moalboal sardine run." },
    ],
    guides: ["philippines-travel-guide", "asia-travel-guide", "southeast-asia-travel-guide"],
    dests: ["manila", "cebu"], plannerCity: "Manila", readTime: "5 min read",
  }),
  aiPage({
    slug: "ai-trip-planner-greece", title: "AI Greece Trip Planner: Athens and the Cyclades",
    seoTitle: "AI Greece Trip Planner", meta: "Plan a Greece trip with AI: the Acropolis at opening, the Cycladic ferry chain, Santorini's caldera and the island season arithmetic.",
    subtitle: "The classical mainland and the island ferries — routed around the meltemi.",
    audience: "For travelers who want the Parthenon, the ferries and the whitewashed villages in one trip.",
    intro: [
      "Greece is two trips in one: the classical mainland and the island Aegean. An AI Greece planner sequences the Acropolis at opening, the ferry chain through the Cyclades, and Santorini's caldera — routed around the meltemi winds.",
      "Planning figures: Athens ~€95/day, the islands €120–180 depending on fame — with ferries €40–80 per leg.",
    ],
    how: [
      { heading: "The ferry-chain logic", paragraphs: ["The generated plans route one way through the Cyclades — Athens → Naxos → Paros → Santorini — with ferry legs scheduled as half-days and the beach days between. The meltemi wind check runs first for July–August sailings."], bullets: ["The Acropolis at the 8am opening.", "The ferry chain scheduled one-way.", "Akrotiri and the wine tasting on Santorini.", "Per-day figures in euros by island tier."] },
      { heading: "Refining the plan", paragraphs: ["The honest trade: Santorini's fame versus Naxos's value. Generate both and compare the ferry-per-beach ratio."] },
    ],
    style: [
      { heading: "Styles for Greece", paragraphs: ["Relaxed produces the beach-and-taverna shape; cultural adds the Delphi and Peloponnese days; foodie routes to the islands that eat best — Naxos's potatoes, Paros's fish, Santorini's fava."] },
      { heading: "Budget for Greece", paragraphs: ["Athens ~€95/day; islands €120–180 depending on fame — Santorini the price leader, Naxos the value pick."] },
    ],
    faq: [
      { question: "Santorini or Mykonos?", answer: "Santorini for the caldera and the views; Mykonos for the beaches and the parties. Naxos and Paros for the value." },
      { question: "Which season?", answer: "May–June and September–early October — warm seas, open hotels, thinner crowds." },
      { question: "How many islands per trip?", answer: "Three with real days; four is the maximum before ferry fatigue wins." },
      { question: "Do I book ferries ahead?", answer: "High-season Cycladic ferries yes; the meltemi winds can delay July–August sailings." },
    ],
    guides: ["greece-travel-guide", "athens-3-day-itinerary", "santorini-3-day-itinerary", "mediterranean-travel-guide"],
    dests: ["athens", "santorini"], plannerCity: "Athens", readTime: "5 min read",
  }),
  aiPage({
    slug: "ai-trip-planner-canada", title: "AI Canada Trip Planner: Cities, Rockies and the Seasons",
    seoTitle: "AI Canada Trip Planner", meta: "Plan a Canada trip with AI: Toronto and Montréal's festivals, Québec City's walls, Banff's turquoise lakes — routed by season.",
    subtitle: "The cultural east or the mountain west — routed by the season you travel.",
    audience: "For travelers choosing between poutine-and-festivals and turquoise-glacier-lakes.",
    intro: [
      "Canada splits into two trips: the cultural east (Toronto, Montréal, Québec City by Via Rail) and the mountain west (Banff, Jasper by the Icefields Parkway). An AI Canada planner sequences whichever region matches your season and temperament.",
      "Planning figures: cities CA$140–150/day, the Rockies CA$180 — with the Via Rail east corridor and the park shuttle systems priced in.",
    ],
    how: [
      { heading: "The region logic", paragraphs: ["The generated plans route east or west: the east for cities, festivals and food (June–September); the Rockies for the turquoise lakes and trails (June–September) or skiing (December–March). The Via Rail and the park shuttles are scheduled."], bullets: ["East: Toronto 3 → Montréal 3 → Québec 2 by Via Rail.", "Rockies: Calgary 1 → Banff 3 → Jasper 2 by the Icefields Parkway.", "Niagara day trip from Toronto scheduled.", "Season-matched: festivals east in summer, skiing west in winter."] },
      { heading: "Refining the plan", paragraphs: ["The honest trade: the east's culture versus the Rockies' landscapes. Two weeks can do both — one week picks."] },
    ],
    style: [
      { heading: "Styles for Canada", paragraphs: ["Foodie routes to Montréal's bagel rivalry and Toronto's St Lawrence Market; adventure to the Icefields Parkway and Banff's trails; relaxed to Québec City's walls and the hot springs."] },
      { heading: "Budget for Canada", paragraphs: ["CA$140–180/day depending on region — the cities are cheaper than the mountain resorts."] },
    ],
    faq: [
      { question: "East or the Rockies?", answer: "East for cities and culture; the Rockies for the lakes. Two weeks can do both — one week picks." },
      { question: "Which season?", answer: "June–September for festivals east and open trails west; September for the fall color." },
      { question: "Does the plan include Niagara?", answer: "Yes — the Toronto leg schedules the day trip by car or bus." },
      { question: "Banff or Jasper?", answer: "Banff for the iconic lakes and the town; Jasper for the darker skies and fewer crowds." },
    ],
    guides: ["canada-travel-guide", "north-america-travel-guide"],
    dests: ["toronto", "montreal", "quebec-city"], plannerCity: "Toronto", readTime: "5 min read",
  }),
  aiPage({
    slug: "ai-trip-planner-switzerland", title: "AI Switzerland Trip Planner: Rails, Peaks and Lakes",
    seoTitle: "AI Switzerland Trip Planner", meta: "Plan a Switzerland trip with AI: Lucerne's lake, the Jungfraujoch railway, Zermatt's Matterhorn — with the Half-Fare Card survival math.",
    subtitle: "The scenic rails and the peaks — routed with the price-survival kit built in.",
    audience: "For travelers facing Switzerland's beauty and its prices with open eyes.",
    intro: [
      "Switzerland is the rail-and-peak country priced like it looks. An AI Switzerland planner sequences the scenic railways (the GoldenPass, the Glacier Express, the Gornergrat), the mountain excursions (Jungfraujoch, Pilatus), and the lake towns — with the Half-Fare Card math built into every estimate.",
      "Planning figures: €200+/day honestly — the Half-Fare Card halves the rail; picnics and the Coop/Migros runs halve the food.",
    ],
    how: [
      { heading: "The rail-and-peak logic", paragraphs: ["The generated plans chain Lucerne → Interlaken → Zermatt by scenic rail, scheduling the Jungfraujoch's summit, the Lauterbrunnen valley's waterfalls and the Gornergrat's Matterhorn view — with the Half-Fare Card and the Swiss Travel Pass priced against each other."], bullets: ["Lucerne 2 → Interlaken 3 → Zermatt 2.", "The Jungfraujoch, the Gornergrat and the GoldenPass marked.", "Half-Fare Card vs Swiss Travel Pass priced both ways.", "Per-day figures in CHF honestly."] },
      { heading: "Refining the plan", paragraphs: ["The honest trade: the Alps depth versus the city culture. The planner can add Zurich, Geneva or the Ticino if the calendar allows."] },
    ],
    style: [
      { heading: "Styles for Switzerland", paragraphs: ["Adventure produces the hiking-and-cable-car shape; relaxed the lake-and-rail version; foodie the fondue-and-chocolate route. Every style needs the Half-Fare Card."] },
      { heading: "Budget for Switzerland", paragraphs: ["CHF 200+/day honestly; the Half-Fare Card halves rail, picnics halve food. The planner shows the tier honestly."] },
    ],
    faq: [
      { question: "Jungfraujoch or Gornergrat?", answer: "Both if the week allows; Jungfraujoch for the ice palace, Gornergrat for the Matterhorn." },
      { question: "Half-Fare Card or Swiss Travel Pass?", answer: "Price both against your actual route — the planner's estimates make it visible." },
      { question: "How many days for Switzerland?", answer: "A week does Lucerne, the Jungfrau region and Zermatt by scenic rail." },
      { question: "Is Switzerland worth the prices?", answer: "For the mountains and the rails, yes — with the survival kit managing the bill." },
    ],
    guides: ["switzerland-travel-guide", "europe-by-train-guide", "europe-14-day-itinerary", "northern-europe-travel-guide"],
    dests: ["zurich", "geneva"], plannerCity: "Zurich", readTime: "5 min read",
  }),
  aiPage({
    slug: "ai-trip-planner-germany", title: "AI Germany Trip Planner: Berlin, Munich and the Rails Between",
    seoTitle: "AI Germany Trip Planner", meta: "Plan a Germany trip with AI: Berlin's Wall history and clubs, Munich's beer gardens and Alps, the ICE rail and the Christmas markets.",
    subtitle: "Berlin's century and Munich's beer gardens — connected by the ICE.",
    audience: "For travelers who want the history, the beer culture and the Alps in one trip.",
    intro: [
      "Germany runs on rails and regional pride: Berlin's Wall trace and nightlife, Munich's beer gardens and the Alps, the Rhine's castles and the Christmas markets. An AI Germany planner sequences the ICE legs and the city days.",
      "Planning figures: Berlin ~€130/day, Munich ~€150 — with the Deutschland-Ticket (€49/month) covering all regional transit.",
    ],
    how: [
      { heading: "The ICE-and-city logic", paragraphs: ["The generated plans schedule Berlin's Wall trace and Museum Island, the ICE south (4h), and Munich's beer gardens and day trips — with the Deutschland-Ticket priced for regional travel."], bullets: ["Berlin's Wall trace and Museum Island.", "The ICE south scheduled at the early-bird window.", "Munich's beer gardens and Neuschwanstein day.", "Christmas markets routed in December."] },
      { heading: "Refining the plan", paragraphs: ["Add the Rhine's castles, Cologne's cathedral or Hamburg's port as the third act if the calendar allows."] },
    ],
    style: [
      { heading: "Styles for Germany", paragraphs: ["Cultural produces the history-and-museum shape; foodie the beer-hall-and-market days; nightlife the Berlin-club-and-Munich-beer-garden contrast."] },
      { heading: "Budget for Germany", paragraphs: ["Berlin ~€130/day, Munich ~€150 — the beer is cheaper than water in places."] },
    ],
    faq: [
      { question: "Berlin or Munich first?", answer: "Berlin for history and nightlife; Munich for beer and the Alps. The ICE makes both a one-week trip." },
      { question: "Do I need the Deutschland-Ticket?", answer: "Yes for regional transit — €49/month covers every bus, tram and regional train nationwide." },
      { question: "How many days for Germany?", answer: "A week does Berlin and Munich; ten adds the Rhine or the Christmas markets." },
      { question: "Oktoberfest?", answer: "Book rooms 6 months out for late September — the festival rewrites all prices." },
    ],
    guides: ["germany-travel-guide", "berlin-3-day-itinerary", "munich-3-day-itinerary", "best-christmas-markets-germany-2026", "europe-by-train-guide"],
    dests: ["berlin", "munich", "frankfurt"], plannerCity: "Berlin", readTime: "5 min read",
  }),
  aiPage({
    slug: "ai-trip-planner-portugal", title: "AI Portugal Trip Planner: Lisbon, Porto and the Algarve",
    seoTitle: "AI Portugal Trip Planner", meta: "Plan a Portugal trip with AI: Lisbon's hills and fado, Porto's cellars, Sintra's palaces and the Algarve's grottoes — by rail and coast.",
    subtitle: "Lisbon to Porto to the Algarve — the country that fits in one week by rail.",
    audience: "For travelers who want Western Europe's best value — hills, tiles, wine and beaches.",
    intro: [
      "Portugal is Western Europe's value play: Lisbon's hills and fado, Porto's port cellars, Sintra's fairytale palaces and the Algarve's grottoes — at €90–110/day with wine at €3.",
      "The classic route: Lisbon (3) → Sintra day → Porto (3) by the scenic rail, with the Douro Valley and the Algarve as the add-ons.",
    ],
    how: [
      { heading: "The two-city-and-coast logic", paragraphs: ["The generated plans schedule Lisbon's Alfama, Belém and the miradouros, the Sintra day trip, the rail north to Porto's cellars, and the Algarve extension when the calendar allows."], bullets: ["Lisbon's Alfama, Belém and the miradouro circuit.", "Sintra's palaces as the booked day trip.", "Porto's cellars and the Douro Valley train.", "The Algarve's grottoes as the beach act."] },
      { heading: "Refining the plan", paragraphs: ["The honest trade: the Douro Valley versus the Algarve. Generate both and compare the ferry-per-beach ratio."] },
    ],
    style: [
      { heading: "Styles for Portugal", paragraphs: ["Cultural produces the heritage-and-fado shape; foodie the petiscos-and-nata days; relaxed the Algarve-and-casual version."] },
      { heading: "Budget for Portugal", paragraphs: ["€90–110/day — Western Europe's friendliest price tag with wine at €3."] },
    ],
    faq: [
      { question: "Lisbon or Porto?", answer: "Lisbon — bigger, hillier, the arrival hub. Porto finishes the trip moodier." },
      { question: "Douro or Algarve?", answer: "The Douro for the wine and the river; the Algarve for the beaches and the grottoes." },
      { question: "How many days for Portugal?", answer: "A week does Lisbon, Sintra and Porto; ten adds the Douro and the Algarve." },
      { question: "Is Portugal cheap?", answer: "By Western Europe's standards, yes — €90–110/day." },
    ],
    guides: ["portugal-travel-guide", "lisbon-3-day-itinerary", "porto-3-day-itinerary", "best-european-cities-first-time"],
    dests: ["lisbon", "porto"], plannerCity: "Lisbon", readTime: "5 min read",
  }),
  aiPage({
    slug: "ai-trip-planner-croatia", title: "AI Croatia Trip Planner: Walls, Islands and the Adriatic",
    seoTitle: "AI Croatia Trip Planner", meta: "Plan a Croatia trip with AI: Zagreb's capital calm, Split's palace, Hvar's lavender and Dubrovnik's walls — by ferry and coast road.",
    subtitle: "The Adriatic coast routed by ferry — Zagreb to Dubrovnik.",
    audience: "For travelers who want Roman palaces, walled cities and island ferries in one trip.",
    intro: [
      "Croatia's coast is a ferry map: Zagreb's capital calm inland, Split's Roman palace, Hvar's lavender island, and Dubrovnik's walled pearl — connected by catamarans and the coastal road. An AI Croatia planner sequences the ferry chain.",
      "Planning figures: Zagreb ~€85/day, the coast €100–130 — with catamarans €15–40 per leg.",
    ],
    how: [
      { heading: "The ferry-chain logic", paragraphs: ["The generated plans route Zagreb → Split → the islands → Dubrovnik one way, with catamaran legs scheduled as half-days and the beach days between. High-season ferries book days ahead."], bullets: ["Zagreb's funicular and museums.", "Split's Diocletian Palace at dawn.", "Hvar or Brač by catamaran.", "Dubrovnik's walls at opening."] },
      { heading: "Refining the plan", paragraphs: ["Plitvice's lakes and Istria's truffle towns are the inland adds — the planner schedules them when the calendar allows."] },
    ],
    style: [
      { heading: "Styles for Croatia", paragraphs: ["Cultural produces the palace-and-walls shape; relaxed the island-and-beach version; adventure the Plitvice-and-Kayak days."] },
      { heading: "Budget for Croatia", paragraphs: ["Zagreb ~€85/day, the coast €100–130 — the ferries and the catamarans are the transit."] },
    ],
    faq: [
      { question: "Split or Dubrovnik first?", answer: "Split — the transport hub with the islands. Dubrovnik finishes the route." },
      { question: "Which season?", answer: "May–June and September–October are warm with workable crowds." },
      { question: "How many days for Croatia?", answer: "A week does the coast; ten adds Plitvice and Istria." },
      { question: "Do I book ferries ahead?", answer: "High-season catamarans yes; the off-season boats are walk-up." },
    ],
    guides: ["croatia-travel-guide", "mediterranean-travel-guide", "europe-7-day-itinerary"],
    dests: ["split", "dubrovnik", "zagreb"], plannerCity: "Split", readTime: "5 min read",
  }),
  aiPage({
    slug: "ai-trip-planner-india", title: "AI India Trip Planner: The Golden Triangle and Beyond",
    seoTitle: "AI India Trip Planner", meta: "Plan an India trip with AI: the Golden Triangle's Taj and forts, Rajasthan's palaces, Kerala's backwaters and the food regions.",
    subtitle: "The Golden Triangle as the first trip — the planner sequences Delhi, Agra and Jaipur.",
    audience: "For travelers taking the first (or fifth) India trip who want the icons and the food routed properly.",
    intro: [
      "India is many trips wearing one visa: the Golden Triangle's forts and the Taj, Rajasthan's desert cities, Kerala's backwaters, Goa's beaches. An AI India planner sequences the first trip honestly — the Golden Triangle at a humane pace.",
      "Planning figures: $50–80/day at the mid tier with drivers included — the Taj's sunrise slot booked online.",
    ],
    how: [
      { heading: "The Triangle logic", paragraphs: ["The generated plans sequence Delhi's monuments, the Agra drive with the Taj at dawn, and Jaipur's forts and bazaars — with the private car-and-driver as the transport and the food regions noted at each stop."], bullets: ["Delhi's Old and New Delhi split across two days.", "The Taj at sunrise — the booked slot.", "Amber Fort's ramparts and the mirror palace.", "Private car-and-driver included in the estimates."] },
      { heading: "Refining the plan", paragraphs: ["The honest extension: Rajasthan's full loop (Udaipur, Jodhpur, Jaisalmer) or Kerala's backwaters. Generate both and compare the totals."] },
    ],
    style: [
      { heading: "Styles for India", paragraphs: ["Cultural produces the fort-and-palace shape; foodie the street-food-and-thali days; shopping the bazaar-and-textile route."] },
      { heading: "Budget for India", paragraphs: ["$50–80/day at the mid tier with drivers included — the Taj's sunrise slot and the private car are the main adds."] },
    ],
    faq: [
      { question: "How many days for the Golden Triangle?", answer: "Seven — Delhi two, Agra one, Jaipur three, with the drives between." },
      { question: "Do I need a driver?", answer: "Yes — the Triangle's drives and the fort access are far easier with a private car and driver." },
      { question: "Is India safe for first-timers?", answer: "Yes with normal city care — book drivers through hotels, dress modestly at temples, drink bottled water." },
      { question: "When should I visit?", answer: "October–March is the pleasant season; April–June bakes the plains." },
    ],
    guides: ["india-travel-guide", "how-to-plan-food-trip", "asia-travel-guide"],
    dests: ["jaipur", "goa"], plannerCity: "Delhi", readTime: "5 min read",
  }),
  aiPage({
    slug: "mexico-travel-guide", title: "AI Mexico Trip Planner: CDMX, the Yucatán and Oaxaca",
    seoTitle: "AI Mexico Trip Planner", meta: "Plan a Mexico trip with AI: Mexico City's museums and tacos, the Yucatán's cenotes and ruins, Oaxaca's kitchens and the Pacific coast.",
    subtitle: "The capital, the Yucatán and Oaxaca — Mexico's three trips, routed honestly.",
    audience: "For travelers who know Mexico is several trips and want the right one first.",
    intro: [
      "Mexico is several trips: Mexico City's museums and taco canon, the Yucatán's cenotes and Mayan ruins, Oaxaca's moles and mezcal, the Pacific's surf. An AI Mexico planner sequences whichever region matches your season and temperament.",
      "Planning figures: CDMX ~$80/day, the Yucatán resorts $130+, Oaxaca ~$60 — the food is the constant at every tier.",
    ],
    how: [
      { heading: "The region logic", paragraphs: ["The generated plans route one region per itinerary: the Yucatán loop (Cancún → Tulum → the cenotes → Chichén Itzá → Mérida), the capital-and-Oaxaca pair, or the Pacific coast. Two weeks fits two regions."], bullets: ["Yucatán: Cancún → Tulum → cenotes → Chichén Itzá → Mérida.", "Capital: CDMX 4 → Oaxaca 3.", "Pacific: CDMX 2 → Puerto Escondido 3."] },
      { heading: "Refining the plan", paragraphs: ["The cenote days alternate with the ruin days — never two cenote days back-to-back. The planner sequences them with the beach and city days between."] },
    ],
    style: [
      { heading: "Styles for Mexico", paragraphs: ["Cultural produces the ruins-and-museum shape; foodie the taco-and-mole days; adventure the cenote and jungle days."] },
      { heading: "Budget for Mexico", paragraphs: ["CDMX ~$80/day, Oaxaca ~$60, the Yucatán resorts $130+ — tacos al pastor $1–2 each."] },
    ],
    faq: [
      { question: "Yucatán or Mexico City first?", answer: "Mexico City for the food-and-museum depth; the Yucatán for the ruins and cenotes. Both are first-trip worthy." },
      { question: "Oaxaca — worth it?", answer: "Yes — the moles, the mezcal and the markets are Mexico's culinary heart." },
      { question: "How many days for Mexico?", answer: "A week does the Yucatán loop or the capital-Oaxaca pair; two weeks does both." },
      { question: "Is Mexico safe for tourists?", answer: "The tourist corridors are well-trodden — normal city rules apply. Check state-level guidance." },
    ],
    guides: ["mexico-travel-guide", "latin-america-travel-guide", "usa-travel-guide"],
    dests: ["mexico-city", "cancun", "tulum"], plannerCity: "Mexico City", readTime: "5 min read",
  }),
  aiPage({
    slug: "ai-trip-planner-turkey", title: "AI Turkey Trip Planner: Istanbul and the Coasts",
    seoTitle: "AI Turkey Trip Planner", meta: "Plan a Turkey trip with AI: Istanbul's Byzantine-Ottoman layers, Cappadocia's balloons, the Turquoise Coast and the bazaar maze.",
    subtitle: "Istanbul's layers, Cappadocia's balloons and the coast — the crossroads country routed.",
    audience: "For travelers who want two continents, four civilizations and one kebab culture in one trip.",
    intro: [
      "Turkey stacks civilizations: Istanbul's Hagia Sophia and Blue Mosque, Cappadocia's fairy chimneys and balloon fleets, the Turquoise Coast's gulet cruises, and the bazaar's 4,000 shops. An AI Turkey planner sequences the layers.",
      "Planning figures: Istanbul ~$70/day, Cappadocia ~$80, the coast ~$75 — one of the best-value countries bridging Europe and Asia.",
    ],
    how: [
      { heading: "The Istanbul-and-beyond logic", paragraphs: ["The generated plans sequence Istanbul's Sultanahmet core, the Bosphorus crossing to Asia, then the internal flight to Cappadocia's balloon fields or the Turquoise Coast's gulet ports."], bullets: ["Istanbul 3 → Cappadocia 2 → the coast 2.", "The Bosphorus ferry between two continents.", "The balloon flight (booked ahead) at dawn.", "Per-day figures in dollars at $70–80."] },
      { heading: "Refining the plan", paragraphs: ["Ephesus and Pamukkale are the add-ons at ten days. The planner schedules the domestic flights and the overnight buses."] },
    ],
    style: [
      { heading: "Styles for Turkey", paragraphs: ["Cultural produces the mosque-and-palace shape; foodie the meze-and-kebap days; adventure the balloon-and-coast version."] },
      { heading: "Budget for Turkey", paragraphs: ["$70–80/day at the mid tier — the kebaps, meze and ferries keep it honest."] },
    ],
    faq: [
      { question: "How many days for Turkey?", answer: "A week does Istanbul plus one region; ten adds Cappadocia and the coast." },
      { question: "Cappadocia or the coast?", answer: "Cappadocia for the balloons and the caves; the coast for the gulet cruises and the swimming." },
      { question: "Is the balloon flight worth it?", answer: "Yes — the dawn balloon over the fairy chimneys is Turkey's defining image. Book weeks ahead." },
      { question: "Istanbul alone or plus Cappadocia?", answer: "Istanbul alone is a complete trip at 4 days; the flight to Cappadocia adds the landscape contrast." },
    ],
    guides: ["mediterranean-travel-guide", "europe-travel-guide"],
    dests: ["istanbul", "antalya"], plannerCity: "Istanbul", readTime: "5 min read",
  }),
  aiPage({
    slug: "ai-trip-planner-netherlands", title: "AI Netherlands Trip Planner: Canals, Tulips and Bikes",
    seoTitle: "AI Netherlands Trip Planner", meta: "Plan a Netherlands trip with AI: Amsterdam's canals and museums, the Keukenhof tulips, Rotterdam's modernism and the bike-first polders.",
    subtitle: "Amsterdam as the base, the country by bike and rail — the tulip season routed.",
    audience: "For travelers who want the museums, the tulips and the bike lanes in one compact country.",
    intro: [
      "The Netherlands is the bike-first country: Amsterdam's canal ring and museums, the Keukenhof's tulip explosion (mid-March–mid-May), Rotterdam's modernist experiment, and the polders by OV-fiets. An AI Netherlands planner schedules the tulip season and the museums.",
      "Planning figures: Amsterdam ~€160/day; the other cities €100–120 — with the OV-fiets rentals at €4.60/day.",
    ],
    how: [
      { heading: "The base-and-day-trip logic", paragraphs: ["The generated plans schedule Amsterdam's museums and canals, the Keukenhof's tulip slots (seasonal, booked ahead), and the day trips — Utrecht's wharf cellars, The Hague's Mauritshuis, Rotterdam's Markthal — all by the 15–40-minute trains."], bullets: ["Amsterdam 3–4 as the base.", "Keukenhof's tulip slots (mid-March–mid-May).", "Rotterdam, Utrecht and Delft as day trips.", "The bike day through the Waterland polders."] },
      { heading: "Refining the plan", paragraphs: ["The honest trade: the museums versus the tulips — the Keukenhof is seasonal, the museums year-round. Generate both shapes and compare."] },
    ],
    style: [
      { heading: "Styles for the Netherlands", paragraphs: ["Cultural produces the museum-and-canal shape; relaxed the bike-and-park version; foodie the stroopwafel-and-herring trail."] },
      { heading: "Budget for the Netherlands", paragraphs: ["Amsterdam ~€160/day; the other cities €100–120 — the hotel tax is the premium."] },
    ],
    faq: [
      { question: "How many days for the Netherlands?", answer: "Four for Amsterdam and its day trips; a week adds Rotterdam and Utrecht." },
      { question: "When are the tulips?", answer: "Mid-March to mid-May; Keukenhof's season matches exactly." },
      { question: "Do I need to book Anne Frank House?", answer: "Yes — weeks ahead; the release sells out in hours." },
      { question: "Do I need a car?", answer: "No — the trains and bikes cover everything better than a car would." },
    ],
    guides: ["netherlands-travel-guide", "amsterdam-4-day-itinerary", "belgium-travel-guide", "europe-by-train-guide", "western-europe-travel-guide"],
    dests: ["amsterdam"], plannerCity: "Amsterdam", readTime: "5 min read",
  }),
  aiPage({
    slug: "ai-trip-planner-uae", title: "AI UAE Trip Planner: Dubai and Abu Dhabi",
    seoTitle: "AI UAE Trip Planner", meta: "Plan a UAE trip with AI: Dubai's Burj Khalifa and desert, Abu Dhabi's Louvre and mosque — with the climate-managed daily rhythm.",
    subtitle: "Two emirates, one trip — the tower, the desert, the mosque and the beach.",
    audience: "For travelers who want the superlatives, the culture and the desert in one compact trip.",
    intro: [
      "The UAE stacks superlatives into a compact country: Dubai's Burj Khalifa and fountain shows, Abu Dhabi's Louvre and Grand Mosque, the desert's dune drives, and the beach clubs between. An AI UAE planner sequences them around the climate.",
      "Planning figures: Dubai ~$250/day, Abu Dhabi ~$200 — November–March is the pleasant season.",
    ],
    how: [
      { heading: "The two-emirate logic", paragraphs: ["The generated plans split Dubai (2–3 days: the tower, the creek, the desert) and Abu Dhabi (1–2 days: the Louvre, the Grand Mosque, the Formula 1 circuit) — with the 90-minute drive between scheduled."], bullets: ["Dubai 2–3: the tower, the creek, the desert safari.", "Abu Dhabi 1–2: the Louvre, the Grand Mosque, the Corniche.", "The desert safari as the signature evening.", "Climate-managed: outdoor mornings and evenings only."] },
      { heading: "Refining the plan", paragraphs: ["The honest trade: the tower's sunset slot versus the desert's sunset camp — both are sunset experiences. Generate both and choose."] },
    ],
    style: [
      { heading: "Styles for the UAE", paragraphs: ["Relaxed produces the beach-and-mall shape; adventure the desert-and-dune version; foodie the old-Dubai-to-Michelin range. The climate-managed rhythm holds in all three."] },
      { heading: "Budget for the UAE", paragraphs: ["Dubai ~$250/day, Abu Dhabi ~$200 — the Burj slot, the desert safari and the brunches are the lines."] },
    ],
    faq: [
      { question: "Dubai or Abu Dhabi first?", answer: "Dubai — the transport hub with the icons. Abu Dhabi finishes with the culture and the calm." },
      { question: "Which Burj slot?", answer: "Sunset — the day view and the lit-up night in one booking." },
      { question: "How many days for the UAE?", answer: "Four or five covers Dubai and Abu Dhabi comfortably." },
      { question: "When should I visit?", answer: "November–March is the pleasant season; summer is indoor-only." },
    ],
    guides: ["dubai-3-day-itinerary", "tokyo-luxury-travel-guide"],
    dests: ["dubai", "abu-dhabi"], plannerCity: "Dubai", readTime: "5 min read",
  }),
];

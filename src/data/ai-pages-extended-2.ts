import type { AiPage } from "./ai-pages";

// AI travel-planning landing pages, batch 2 — country planners, seasonal
// planners and traveler-type planners. All relatedGuideSlugs and
// relatedDestinationSlugs must resolve against src/data/guides.ts and
// src/data/destinations.ts.

const PUBLISHED = "2026-09-14";
const UPDATED = "2026-09-14";

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
      label: `Plan your ${cfg.plannerCity === "Tokyo" ? "trip" : cfg.plannerCity + " trip"} with AI`,
    },
    publishedAt: PUBLISHED, updatedAt: UPDATED, readTime: cfg.readTime,
  };
}

export const AI_PAGES_EXTENDED_2: AiPage[] = [
  aiPage({
    slug: "ai-trip-planner-korea", title: "AI Korea Trip Planner: Seoul, Busan and the KTX Between",
    seoTitle: "AI Korea Trip Planner", meta: "Plan a Korea trip with AI: Seoul's palaces and markets, the KTX to Busan, per-day cost estimates and the DMZ booking logistics built into the itinerary.",
    subtitle: "Tell the planner your dates and style — get a day-by-day Korea itinerary with the KTX math already done.",
    audience: "For travelers who want Seoul's energy, Busan's coast and the trains between, without the planning evenings.",
    intro: [
      "Korea is the best-value rail country in East Asia: Seoul's palaces and markets, the 2h40 KTX to Busan, Jeju's volcanic island — all stitched by transit that actually works. An AI Korea trip planner turns those inputs into a day-by-day itinerary with named places, times and cost estimates.",
      "UTripla's planner asks for a destination, dates, travel style, interests and budget. Feed it Seoul as the anchor and it schedules the palaces at opening, the markets at lunch, the KTX legs and the Busan finish — with per-day figures in won at every step.",
    ],
    how: [
      { heading: "The planner's Korea logic", paragraphs: ["Seoul anchors every Korea itinerary because the KTX makes the country a day-trip network. The generated plans sequence the palaces at opening (hanbok wearers enter free), the markets at lunch, and one youth district per evening — then the KTX south when your dates allow.", "The DMZ requires a licensed tour booked 1–2 weeks ahead with passport details — the planner's itinerary marks the day, and you make the booking it names."], bullets: ["Seoul as the anchor — palaces, markets, youth districts.", "The KTX legs scheduled with the 2h40 transit math.", "DMZ days marked for the licensed-tour booking.", "Per-day cost estimates in won."] },
      { heading: "Refining the plan", paragraphs: ["Generate, read the days, adjust one input at a time. Too packed? Switch to the relaxed style. Want more food? Add the food interest. Two rounds usually land the trip."] },
    ],
    style: [
      { heading: "Styles for Korea", paragraphs: ["Cultural produces the palace-and-market shape; foodie organizes days around BBQ and street food; active adds the Inwangsan ridge and Bukhansan. The style is the pacing dial — Korea rewards one notch gentler than instinct."] },
      { heading: "Budget for Korea", paragraphs: ["About ₩130,000/day (≈$100) mid-range at planning figures — hotels, BBQ, transit and one paid experience. BBQ dinners for two often cost less than one Western entrée."] },
    ],
    faq: [
      { question: "How many days for a Korea trip?", answer: "Five for Seoul plus a deep-dive; seven adds Busan properly by KTX." },
      { question: "Does the plan book the DMZ tour?", answer: "No — it schedules the day and names the booking; you reserve with a licensed operator 1–2 weeks ahead." },
      { question: "Seoul only or Seoul plus Busan?", answer: "Seoul-only at five days; add Busan's two nights at seven. The KTX makes it one trip." },
      { question: "What does the cost estimate include?", answer: "Hotels, meals, transit and activities at planning figures — accurate enough to budget, not quotes." },
    ],
    guides: ["south-korea-travel-guide", "seoul-3-day-itinerary", "seoul-travel-budget", "seoul-food-guide", "seoul-7-day-itinerary"],
    dests: ["seoul", "busan", "jeju"], plannerCity: "Seoul", readTime: "5 min read",
  }),
  aiPage({
    slug: "ai-trip-planner-thailand", title: "AI Thailand Trip Planner: Bangkok, the North and the Islands",
    seoTitle: "AI Thailand Trip Planner", meta: "Plan a Thailand trip with AI: Bangkok's temples, Chiang Mai's cafés, the two-coast island season split — with a day-by-day itinerary and cost estimates.",
    subtitle: "Bangkok to the islands by month — the planner routes Thailand by the season you're traveling.",
    audience: "For travelers who want temples, street food and a dry beach in the same week.",
    intro: [
      "Thailand's planning trick is the two-coast season split: the Andaman (Phuket, Krabi) is dry November–April, the Gulf (Samui) January–September — there is always a dry island. An AI Thailand planner routes by the month you travel, not by a generic list.",
      "Feed the planner Bangkok as the anchor with your dates, and it sequences the temples at opening, the markets after dark, the internal flight south, and the island days — at $50–70/day planning figures.",
    ],
    how: [
      { heading: "The season-aware routing", paragraphs: ["The planner's island recommendation follows your dates: Andaman islands for November–April trips, Gulf islands for January–September. The internal flight ($30–60) is scheduled as the intermission between city and beach acts."], bullets: ["Bangkok as the anchor — temples at opening, markets after dark.", "Chiang Mai's cafés and temples as the northern act.", "Island routing by season — Andaman or Gulf.", "Internal flights scheduled, not improvised."] },
      { heading: "Refining the plan", paragraphs: ["Generate, adjust, regenerate. The beach-leg length is the honest trade: city days fund island days. Two or three rounds converge."] },
    ],
    style: [
      { heading: "Styles for Thailand", paragraphs: ["Cultural for the temple-weighted shape; foodie for the eating-first days; relaxed for the island-heavy version. The heat-management rhythm (temples early, malls midday, markets late) applies to every style."] },
      { heading: "Budget for Thailand", paragraphs: ["Bangkok ~$50/day, Chiang Mai ~$45, islands ~$65 at planning figures — street food at $1–3 and massages at $10 keep the floor low."] },
    ],
    faq: [
      { question: "Phuket or Samui?", answer: "The season decides: Andaman (Phuket, Krabi) for November–April; Gulf (Samui) for January–September." },
      { question: "How many days for Thailand?", answer: "A week does Bangkok plus one region; ten does the city-north-islands arc." },
      { question: "Does the plan include Ayutthaya?", answer: "It can — add the history interest and the planner schedules the ruins day trip by train." },
      { question: "Are the cost estimates in baht?", answer: "Yes — per-day planning figures in baht, honest about the street-food floor and the island premium." },
    ],
    guides: ["thailand-travel-guide", "bangkok-food-guide", "bangkok-5-day-itinerary", "asia-travel-guide", "best-areas-to-stay-in-bangkok"],
    dests: ["bangkok", "chiang-mai", "phuket"], plannerCity: "Bangkok", readTime: "5 min read",
  }),
  aiPage({
    slug: "ai-trip-planner-italy", title: "AI Italy Trip Planner: The Triangle, the Coast and the Boot",
    seoTitle: "AI Italy Trip Planner", meta: "Plan an Italy trip with AI: the Venice-Florence-Rome triangle, the Amalfi Coast, rail arithmetic and timed museum bookings — day by day.",
    subtitle: "The triangle or the full boot — the planner sequences Italy's rail legs and museum slots.",
    audience: "For travelers who want the classics done properly and the coast if the days allow.",
    intro: [
      "Italy is Europe's deepest country and its easiest to over-stuff: the triangle (Venice, Florence, Rome) is a week; the coast adds three days; the full boot is fourteen. An AI Italy planner sequences the rail legs under three hours and the timed museum bookings that sell out.",
      "Feed it your dates and the planner schedules the Frecciarossa legs, the Uffizi and Vatican slots, the Amalfi ferries — with per-day figures in euros.",
    ],
    how: [
      { heading: "The rail-and-booking logic", paragraphs: ["Italy's cities chain by high-speed rail: Venice–Florence 2h, Florence–Rome 1h30, Rome–Salerno 2h. The generated plans schedule the legs as half-days and mark the timed bookings (Uffizi, Accademia, Vatican, Borghese) that you make ahead."], bullets: ["Open-jaw routing: Venice in, Naples out.", "Rail legs as half-days — two-night minimums.", "Timed museum bookings marked in the itinerary.", "Per-day figures in euros."] },
      { heading: "Refining the plan", paragraphs: ["The classic trade: the coast versus the north. Generate both versions and compare the totals — the planner makes the trade visible."] },
    ],
    style: [
      { heading: "Styles for Italy", paragraphs: ["Cultural for the triangle shape; foodie for the trattoria-and-market days; relaxed for the coast-heavy version. The two-night minimum holds in every style."] },
      { heading: "Budget for Italy", paragraphs: ["Rome and Florence ~€130/day, Venice ~€150, the south ~€95 — call it €130–150 blended, with rail and ferries added."] },
    ],
    faq: [
      { question: "Seven days or ten for Italy?", answer: "Seven for the triangle; ten adds the Amalfi Coast; fourteen is the grand tour." },
      { question: "Does the plan book the museums?", answer: "No — it schedules the slots and names them; you book the Uffizi, Accademia and Vatican entries ahead." },
      { question: "North to south or south to north?", answer: "North to south — the coast finale rewards the order, and open-jaw flights make it free." },
      { question: "Do I need a car?", answer: "No for the cities and the triangle; a driver or ferry for the Amalfi days." },
    ],
    guides: ["italy-travel-guide", "italy-7-day-itinerary", "italy-10-day-itinerary", "rome-food-guide", "italy-food-guide", "rome-3-day-itinerary"],
    dests: ["rome", "florence", "venice"], plannerCity: "Rome", readTime: "5 min read",
  }),
  aiPage({
    slug: "ai-trip-planner-france", title: "AI France Trip Planner: Paris and Beyond by TGV",
    seoTitle: "AI France Trip Planner", meta: "Plan a France trip with AI: Paris's museums and neighborhoods, the TGV to Provence, Versailles slots and the regional tables.",
    subtitle: "Paris or Paris-plus-Provence — the planner schedules the capital and the TGV south.",
    audience: "For travelers who want the capital done deeply and the provinces if the calendar allows.",
    intro: [
      "France is Paris plus everything Parisians flee to — and the TGV makes the provinces a half-day away. An AI France planner sequences the capital's museums and neighborhoods, the Versailles day, and the Avignon-and-Luberon extension when the calendar supports it.",
      "Planning figures: Paris ~€150/day, the provinces €110–130 — with TGV fares from €19 when booked at the window.",
    ],
    how: [
      { heading: "The Paris depth logic", paragraphs: ["A Paris week is a residency: the classic three days, Versailles as a full day, the second-tier museums, and the neighborhoods. The planner schedules all of it — or hands off to Provence when your dates run past seven."], bullets: ["The classic core at proper pace.", "Versailles as the booked full day.", "The TGV south scheduled at the early-bird window.", "Provence days routed with the villages."] },
      { heading: "Refining the plan", paragraphs: ["The honest trade is Paris depth versus provincial breadth. Generate both, compare the totals, decide."] },
    ],
    style: [
      { heading: "Styles for France", paragraphs: ["Cultural for the museum-weighted shape; foodie for the market-and-bistro days; relaxed for the Provence-heavy version."] },
      { heading: "Budget for France", paragraphs: ["Paris ~€150/day, the provinces €110–130 — the TGV early-bird and the formule lunch are the two levers."] },
    ],
    faq: [
      { question: "Paris alone or Paris plus the south?", answer: "A week can be Paris alone; ten days adds Provence properly by TGV." },
      { question: "Does the plan book Versailles?", answer: "It schedules the day and the first-train logic; you book the passport ticket online." },
      { question: "Loire or Provence?", answer: "Provence by TGV (2h40); the Loire by rental car from Paris. The planner routes either." },
      { question: "What about the Riviera?", answer: "Add it at fourteen days — Nice, the calanques and the perched villages." },
    ],
    guides: ["france-travel-guide", "paris-travel-budget", "paris-7-day-itinerary", "paris-3-day-itinerary", "best-time-to-visit-paris", "paris-food-guide"],
    dests: ["paris", "barcelona"], plannerCity: "Paris", readTime: "5 min read",
  }),
  aiPage({
    slug: "ai-trip-planner-spain", title: "AI Spain Trip Planner: Madrid, Barcelona and Andalusia",
    seoTitle: "AI Spain Trip Planner", meta: "Plan a Spain trip with AI: Madrid's art triangle, Barcelona's Gaudí, Andalusia's Moorish trio by AVE — with the late-night dinner clock built in.",
    subtitle: "Madrid, Barcelona, Andalusia by AVE — the planner schedules the art, the tapas and the Alhambra slot.",
    audience: "For travelers who want the art vaults, the Gaudí icons and the Alhambra — and understand dinner starts at 9:30.",
    intro: [
      "Spain runs on three cities and one south: Madrid's art triangle, Barcelona's Gaudí, and Andalusia's Córdoba-Seville-Granada trio — all connected by AVE high-speed rail. An AI Spain planner sequences the museums, the timed Alhambra slot and the tapas crawls.",
      "Planning figures: Madrid and Barcelona ~€110–120/day, Andalusia ~€90 — with the menú del día lunch doing the budget's heavy lifting.",
    ],
    how: [
      { heading: "The AVE logic", paragraphs: ["Madrid–Barcelona in 2h30, Madrid–Seville in 2h40, Madrid–Granada with a connection — the planner schedules the AVE legs as half-days and marks the Alhambra's Nasrid-palace slot, which books out weeks ahead."], bullets: ["Madrid as the rail hub.", "The Alhambra's booked slot marked.", "Tapas crawls scheduled after 21:00.", "Per-day figures in euros."] },
      { heading: "Refining the plan", paragraphs: ["Ten days does all three regions; a week picks two. Generate both shapes and compare."] },
    ],
    style: [
      { heading: "Styles for Spain", paragraphs: ["Cultural for the art-and-monuments shape; foodie for the tapas-and-market days; relaxed for the Andalusian patio evenings."] },
      { heading: "Budget for Spain", paragraphs: ["€90–120/day depending on region — the menú del día lunch (€12–15) is Europe's best-value meal."] },
    ],
    faq: [
      { question: "Madrid or Barcelona first?", answer: "Madrid — the rail hub and the art capital; Barcelona follows by AVE in 2h30." },
      { question: "How many days for Andalusia?", answer: "Four or five: Seville two, Córdoba one, Granada two." },
      { question: "Does the plan book the Alhambra?", answer: "It schedules the day; you book the Nasrid-palace slot weeks ahead — it sells out." },
      { question: "San Sebastián?", answer: "The food pilgrimage deserves its own trip — or swap Barcelona for it at ten days." },
    ],
    guides: ["spain-travel-guide", "madrid-3-day-itinerary", "barcelona-food-guide", "granada-3-day-itinerary", "europe-by-train-guide"],
    dests: ["madrid", "barcelona", "granada"], plannerCity: "Madrid", readTime: "5 min read",
  }),
  aiPage({
    slug: "ai-trip-planner-singapore", title: "AI Singapore Trip Planner: The Bay, the Hawk and the Heat Rhythm",
    seoTitle: "AI Singapore Trip Planner", meta: "Plan a Singapore trip with AI: the heat-managed daily rhythm, the hawker curriculum, Gardens by the Bay slots and Pulau Ubin's wild day.",
    subtitle: "The heat-managed rhythm, the hawker curriculum and the Ubin wild — planned hour by hour.",
    audience: "For travelers who want the city-state done properly — food first, heat respected.",
    intro: [
      "Singapore is a scheduling problem with one solution: outdoor before 11am and after 4pm, air-conditioned middays, hawker dinners when the breeze returns. An AI Singapore planner builds every day around that rhythm — and around the hawker curriculum.",
      "Planning figure: about S$180/day mid-range — hotels carry the premium; hawker meals at S$4–8 are the equalizer.",
    ],
    how: [
      { heading: "The heat-rhythm logic", paragraphs: ["The generated plans schedule the Gardens at 9am, the conservatories at noon, the malls and museums through the furnace hours, and the light shows after dark — with the hawker centers as the fixed meal points."], bullets: ["Outdoors at 9am and after 4pm — always.", "Hawker centers as the meal anchors.", "Pulau Ubin scheduled as the wild day.", "Per-day figures in Singapore dollars."] },
      { heading: "Refining the plan", paragraphs: ["Sentosa or the heritage neighborhoods is the day-three fork; Pulau Ubin is the insider day. Adjust the interests and regenerate."] },
    ],
    style: [
      { heading: "Styles for Singapore", paragraphs: ["Foodie produces the hawker-heavy shape; relaxed adds Sentosa and the pools; cultural weights the museums and heritage districts. The heat rhythm holds in all three."] },
      { heading: "Budget for Singapore", paragraphs: ["S$180/day mid-range — the hotel is the biggest lever; hawker meals and tap-in MRT keep the rest honest."] },
    ],
    faq: [
      { question: "Two days or five for Singapore?", answer: "Two for the bay and hawkers; five for the full city including Pulau Ubin and the heritage districts." },
      { question: "Sentosa or the neighborhoods?", answer: "Sentosa with kids; the heritage trio and Pulau Ubin without." },
      { question: "Which hawker centers?", answer: "Maxwell, Lau Pa Sat and Old Airport Road — one per meal, three philosophies." },
      { question: "Is the plan weather-proof?", answer: "Yes — the rhythm absorbs the twenty-minute tropical downpours by design." },
    ],
    guides: ["singapore-travel-guide", "singapore-food-guide", "singapore-3-day-itinerary", "singapore-travel-budget", "things-to-do-in-singapore", "singapore-transportation-guide"],
    dests: ["singapore", "kuala-lumpur", "bali"], plannerCity: "Singapore", readTime: "5 min read",
  }),
  aiPage({
    slug: "ai-trip-planner-bali", title: "AI Bali Trip Planner: Ubud, the Coast and the Island Math",
    seoTitle: "AI Bali Trip Planner", meta: "Plan a Bali trip with AI: the Ubud-and-coast split, drive-time-honest day plans, private-driver days and per-day villa economics.",
    subtitle: "Two Balis, one trip — the planner splits Ubud and the coast by drive time, not by list.",
    audience: "For travelers who want the terraces and the beaches — and to respect the island's traffic.",
    intro: [
      "Bali's planning secret is the split: two or three nights in Ubud for the terraces and temples, two or three on the coast for the beaches and sunsets — because '20 kilometers' can mean 90 minutes. An AI Bali planner sequences days by geography, not by list.",
      "Planning figure: about $70/day mid-range, villas and drivers included — the island's core unfair advantage.",
    ],
    how: [
      { heading: "The drive-time logic", paragraphs: ["The generated plans group each day's stops geographically: the Ubud cluster (terraces at 7am, Tirta Empul, the waterfalls), the transfer day south, and the coastal cluster (Uluwatu's kecak, the beach clubs, Jimbaran's seafood)."], bullets: ["The Ubud-then-coast two-base structure.", "Private-driver days scheduled for the temple runs.", "Drive times respected — no heroic crossings.", "Per-day villa-and-driver economics in dollars."] },
      { heading: "Refining the plan", paragraphs: ["Nusa Penida is the honest trade: a full day of bruising roads for the famous cliffs. Add it only if a beach day shrinks. The planner makes the trade visible."] },
    ],
    style: [
      { heading: "Styles for Bali", paragraphs: ["Relaxed produces the pool-and-spa-heavy shape; adventure adds the volcanoes and canyoneering; foodie leans into the Ubud restaurant row. The two-base structure holds in all three."] },
      { heading: "Budget for Bali", paragraphs: ["$70/day mid-range — villas $40–60, drivers $40–60 split, warung meals $2–5. The wet season dips prices 30%."] },
    ],
    faq: [
      { question: "Ubud or the beach for my base?", answer: "Split it — the transfer costs half a day and buys you both Balis." },
      { question: "Nusa Penida — worth it?", answer: "The cliffs are the famous photo; the roads are the price. Add it only with days to spare." },
      { question: "How many days for Bali?", answer: "Five for the Ubud-coast split; seven adds Nusa Penida or the north." },
      { question: "Does the plan include drivers?", answer: "It schedules the driver days (~$40–60) that the temple geography demands." },
    ],
    guides: ["bali-travel-budget", "bali-5-day-itinerary", "bali-first-timers-guide", "indonesia-travel-guide"],
    dests: ["bali", "yogyakarta", "jakarta"], plannerCity: "Bali", readTime: "5 min read",
  }),
  aiPage({
    slug: "ai-trip-planner-australia", title: "AI Australia Trip Planner: The East Coast and the Distances",
    seoTitle: "AI Australia Trip Planner", meta: "Plan an Australia trip with AI: the Sydney-to-Cairns east coast, the reef trips, the domestic-flight arithmetic and the season routing.",
    subtitle: "The harbour to the reef — the planner sequences the east coast around its honest distances.",
    audience: "For travelers facing a continent with two weeks and a healthy respect for flight math.",
    intro: [
      "Australia's planning challenge is distance: Sydney to Cairns is three hours by air, Uluru is a world away in the middle. An AI Australia planner sequences the east coast (Sydney → Byron → the Whitsundays → Cairns) around the domestic-flight arithmetic.",
      "Planning figures: cities AU$150–170/day, reef trips AU$200+ — with the domestic hops AU$80–200 booked alongside the international ticket.",
    ],
    how: [
      { heading: "The flight-hop logic", paragraphs: ["The generated plans schedule the Sydney base days, the Byron interlude, the Whitsunday sailing and the Cairns reef trips — with the internal flights marked as the itinerary's hinges. Uluru is the add-on that gets its own flight."], bullets: ["The Sydney base for the harbour and Blue Mountains.", "The Whitsunday sailing scheduled.", "The reef trips timed to the season window.", "Domestic flights marked, not improvised."] },
      { heading: "Refining the plan", paragraphs: ["The honest trade: the east coast versus the red centre. Two weeks fits one properly plus a teaser; three weeks fits both."] },
    ],
    style: [
      { heading: "Styles for Australia", paragraphs: ["Relaxed for the beach-and-harbour shape; adventure for the reef dives and the hikes; family for the theme-park-and-zoo version. The season window (May–October north) routes the reef leg."] },
      { heading: "Budget for Australia", paragraphs: ["AU$150–170/day in the cities, AU$200+ for the reef days — the domestic flights are the hidden line."] },
    ],
    faq: [
      { question: "East coast or the Outback?", answer: "First trip: the east coast. Uluru deserves its own flight and two nights." },
      { question: "Which season for the reef?", answer: "May–October — dry, stinger-light and the sailing is best." },
      { question: "How many days for Australia?", answer: "Two weeks for the east coast plus Uluru; three adds Tasmania or the west." },
      { question: "Does the plan book the reef trips?", answer: "It schedules the days and names the operators; you book the outer-reef boats ahead." },
    ],
    guides: ["australia-travel-guide", "new-zealand-travel-guide"],
    dests: ["sydney", "brisbane"], plannerCity: "Sydney", readTime: "5 min read",
  }),
  aiPage({
    slug: "ai-trip-planner-north-america", title: "AI North America Trip Planner: Regions, Not Continents",
    seoTitle: "AI North America Trip Planner", meta: "Plan a North America trip with AI: the East Coast triangle by rail, the Southwest canyon loop by car, Canada's east — region by region.",
    subtitle: "Two regions per two weeks — the planner sequences the honest regions, not the continent.",
    audience: "For travelers who respect the distances and want one region done properly.",
    intro: [
      "North America's planning error is continental ambition on a two-week budget. The honest unit is the region: the East Coast triangle (New York, Boston, Washington) by Amtrak, the Southwest canyon loop by car from Las Vegas, Canada's eastern triangle by rail.",
      "Planning figures: cities $180–200/day, the parks $150 — with the America the Beautiful pass as the single best purchase.",
    ],
    how: [
      { heading: "The region logic", paragraphs: ["The planner generates one region per itinerary: the Northeast by rail (no car needed), the Southwest loop by car (Zion, Bryce, Page, the Grand Canyon), or Canada's Toronto–Montréal–Québec triangle. Two regions fit two weeks."], bullets: ["The Northeast triangle by Amtrak.", "The Southwest loop by car from Las Vegas.", "Canada's east by Via Rail.", "Park-pass and tipping economics in the estimates."] },
      { heading: "Refining the plan", paragraphs: ["The honest trade is depth versus coverage. Generate the region you're drawn to, read the days, and resist adding the third region."] },
    ],
    style: [
      { heading: "Styles for North America", paragraphs: ["Cultural and foodie fit the city regions; adventure fits the Southwest and the parks; relaxed fits the coast drives. Generate each leg with its own style."] },
      { heading: "Budget for North America", paragraphs: ["$180–200/day in the cities, $150 in the parks — accommodation and the tipping economy are the two constants."] },
    ],
    faq: [
      { question: "How much fits in two weeks?", answer: "Two regions — the planner's per-leg itineraries make the arithmetic visible before you book flights." },
      { question: "Do I need a car?", answer: "The East Coast triangle, no. The Southwest, the parks and Canada's Rockies, yes." },
      { question: "Which region first?", answer: "The Northeast for a first visit; the Southwest for the landscapes; Canada for the value." },
      { question: "Does the plan include the national parks?", answer: "Yes — the Southwest loop schedules Zion, Bryce, Page and the Grand Canyon with the pass economics." },
    ],
    guides: ["usa-travel-guide", "canada-travel-guide", "best-areas-to-stay-in-new-york"],
    dests: ["newyork", "las-vegas", "toronto"], plannerCity: "New York", readTime: "5 min read",
  }),
  aiPage({
    slug: "ai-beach-vacation-planner", title: "AI Beach Vacation Planner: Sand by Season",
    seoTitle: "AI Beach Vacation Planner", meta: "Plan a beach vacation with AI: the planner routes by season — the dry island when you travel, drive-time-honest days, and per-day resort economics.",
    subtitle: "There is always a dry beach — the planner finds the one that matches your dates.",
    audience: "For travelers whose trip is measured in swim hours, not sight counts.",
    intro: [
      "Beach vacations fail by season, not by destination: Phuket's monsoon, Santorini's meltemi, Bali's rain — every coast has a wet month. An AI beach vacation planner routes by the season you travel: the Andaman in winter, the Gulf in summer, the Mediterranean in the shoulders.",
      "Feed it your dates and the planner proposes the coasts that are dry, the islands that are open, and the day plans that respect the tide and the traffic.",
    ],
    how: [
      { heading: "The season routing", paragraphs: ["The planner's beach logic: November–April routes to Thailand's Andaman coast, the Maldives-adjacent atolls and the Caribbean; May–September routes to the Mediterranean, the Gulf islands and Bali; the shoulder months get the connoisseur coasts with the open hotels."], bullets: ["Season-matched coasts, not generic lists.", "Boat days scheduled around sea state.", "Resort-and-villa economics per day.", "The hammock day — scheduled, earned."] },
      { heading: "Refining the plan", paragraphs: ["The honest trade is remoteness versus services: the paradise island with the bruising transfer, or the serviced beach with the spa. Generate both and compare the day shapes."] },
    ],
    style: [
      { heading: "Styles for beach trips", paragraphs: ["Relaxed produces the anchor-light, pool-heavy shape; adventure adds the snorkel, surf and dive days; foodie routes to the coasts that eat as well as they swim — the Thai islands, the Amalfi, the Mexican Caribbean."] },
      { heading: "Budget for beach trips", paragraphs: ["The spread is enormous: Thailand's islands at $65/day versus the Maldives at $500+. The planner's estimates make the tier visible before you book."] },
    ],
    faq: [
      { question: "Which beach destination for my dates?", answer: "November–April: Thailand's Andaman, the Caribbean, the Gulf of Thailand's islands. May–September: the Mediterranean, Bali, the Greek islands." },
      { question: "All-inclusive or boutique?", answer: "All-inclusive for the resort-only trip; boutique for the island-hopping one. The planner prices both." },
      { question: "How many days for a beach vacation?", answer: "Five is the honest minimum — three travel days and two full sand days at that length." },
      { question: "Does the plan include boat days?", answer: "Yes — island-hopping and snorkel days scheduled around the sea state your season implies." },
    ],
    guides: ["bali-travel-budget", "thailand-travel-guide", "mediterranean-travel-guide", "santorini-3-day-itinerary"],
    dests: ["bali", "phuket", "santorini"], plannerCity: "Bali", readTime: "5 min read",
  }),
  aiPage({
    slug: "ai-adventure-trip-planner", title: "AI Adventure Trip Planner: Adrenaline With a Schedule",
    seoTitle: "AI Adventure Trip Planner", meta: "Plan an adventure trip with AI: the canyon loops, the dive days, the alpine trails — sequenced with rest days and honest difficulty notes.",
    subtitle: "Canyons, reefs and ridges — sequenced with rest days, because adventure is a pacing sport.",
    audience: "For travelers whose best day involves a harness, a mask or a summit.",
    intro: [
      "Adventure trips fail by sequencing, not by ambition: three summit days back-to-back, no rest between dive days, and the itinerary collapses. An AI adventure planner sequences the adrenaline with rest days and honest difficulty notes.",
      "Feed it the region (the Southwest's canyons, Queenstown's adrenaline menu, Bali's reefs and volcanoes) and the planner schedules the big days with the recoveries between.",
    ],
    how: [
      { heading: "The sequencing logic", paragraphs: ["The generated plans alternate: the summit day, then the valley day; the dive day, then the beach day; the canyon wade, then the rim walk. Rest days are scheduled, not stolen — and the difficulty notes are honest about chains, altitude and current."], bullets: ["Big days alternated with recoveries.", "Difficulty notes: chains, altitude, current.", "Permits and bookings marked (Angels Landing, dives).", "Gear-rental days scheduled near the outfitters."] },
      { heading: "Refining the plan", paragraphs: ["The honest trade is the bucket-list item versus the recovery day. If the plan needs three summit days in a row, it's wrong — regenerate with a slower style."] },
    ],
    style: [
      { heading: "Styles for adventure", paragraphs: ["Adventure is the style — the interests do the routing: nature for the trails and reefs, sports for the adrenaline infrastructure, beaches for the recovery days."] },
      { heading: "Budget for adventure", paragraphs: ["Guided days and gear add $50–150/day over base costs — the planner's estimates include the activity tier, and the rest days are the budget's relief valve."] },
    ],
    faq: [
      { question: "Which destinations suit adventure trips?", answer: "Queenstown, the Southwest's canyon country, Bali's reefs and volcanoes, Iceland's raw south, the Dolomites." },
      { question: "Does the plan include rest days?", answer: "Yes — sequenced, scheduled and defended. Adventure without recovery is a hospital visit." },
      { question: "Do I need permits?", answer: "Some — Angels Landing's lottery, dive certifications, canyon permits. The plan marks which need booking." },
      { question: "How fit do I need to be?", answer: "The plan's difficulty notes say honestly: chains and exposure, altitude, current. Choose the days that match." },
    ],
    guides: ["new-zealand-travel-guide", "usa-travel-guide", "bali-travel-budget", "northern-europe-travel-guide"],
    dests: ["queenstown", "las-vegas", "reykjavik"], plannerCity: "Queenstown", readTime: "5 min read",
  }),
  aiPage({
    slug: "ai-group-trip-planner", title: "AI Group Trip Planner: Democracy With an Itinerary",
    seoTitle: "AI Group Trip Planner", meta: "Plan a group trip with AI: one style everyone agrees on, interests from every member, budgets that total honestly — the democracy itinerary.",
    subtitle: "One style, everyone's interests, one budget — the group plan that ends the negotiation.",
    audience: "For the group chat that's been arguing about the trip since January.",
    intro: [
      "Group trips die in the group chat: four wishlists, one calendar, and no mechanism. An AI group trip planner ends the negotiation structurally — one travel style chosen together, interests pooled from every member, and a budget that totals honestly per person.",
      "The method: pick the style that describes the group's shared energy, load interests from everyone (up to eight categories), and let the generated day-by-day plan — with per-person cost estimates — be the document the vote happens on.",
    ],
    how: [
      { heading: "The group technique", paragraphs: ["The planner's style setting controls pacing for everyone, so choose it for the group's middle, not its loudest member. Pool the interests — the planner interleaves them rather than segregating days. The per-person cost totals become the accountability everyone agreed to."], bullets: ["One style chosen together, for the group's middle.", "Interests pooled from every member.", "Per-person cost totals as the shared cap.", "Regeneration is free — the drafts are the negotiation."] },
      { heading: "Refining without re-arguing", paragraphs: ["The honest workflow: generate once, read the days aloud, and let the person who didn't pick the style do the first edit. Two rounds land the plan most of the group will fly on — and the rest is what gelato is for."] },
    ],
    style: [
      { heading: "Styles for groups", paragraphs: ["Cultural and foodie produce the shapes groups agree on most easily — anchors with meals between. Active works for the group that actually hikes together; relaxed for the rest-and-rooftop trips."] },
      { heading: "Budget for groups", paragraphs: ["Per-person estimates make the shared villas and the split drivers legible. The one-splurge-per-trip rule scales to groups better than to couples — everyone remembers the boat day."] },
    ],
    faq: [
      { question: "Can the planner blend different tastes?", answer: "Through the interests, yes — pool them and the plan interleaves. The style is chosen together for the shared pacing." },
      { question: "How do we handle budget disagreements?", answer: "The per-person totals make the cap real before anything is booked. Adjust the level and regenerate." },
      { question: "What group size works best?", answer: "Four to eight — big enough to split costs, small enough to move. The plans work at any size." },
      { question: "Which destinations suit groups?", answer: "The villa economies (Bali, Croatia's coast), the BBQ tables (Seoul), the beer gardens (Munich) — destinations where the table is the activity." },
    ],
    guides: ["seoul-food-guide", "munich-3-day-itinerary", "bali-travel-budget", "paris-couples-guide", "bali-5-day-itinerary", "mediterranean-travel-guide"],
    dests: ["bali", "seoul", "munich"], plannerCity: "Bali", readTime: "5 min read",
  }),
  aiPage({
    slug: "ai-anniversary-trip-planner", title: "AI Anniversary Trip Planner: The Milestone Itinerary",
    seoTitle: "AI Anniversary Trip Planner", meta: "Plan an anniversary trip with AI: the slow days, the one splurge that marks the year, the table booked ahead — and the rest left unplanned.",
    subtitle: "One splurge that marks the year, slow days around it — the milestone itinerary.",
    audience: "For couples turning a number into a place.",
    intro: [
      "Anniversary trips have one job: convert a number into a memory. The AI anniversary planner builds the slow scaffolding — which town, which days, the one splurge that marks the year — and leaves the rest unplanned on purpose.",
      "Feed it the destination, the dates and the relaxed style; the generated plan sequences long meals, one booked table, and enough slack that the best moment stays unplannable.",
    ],
    how: [
      { heading: "The milestone logic", paragraphs: ["The relaxed style produces the anniversary shape: one or two anchors per day, long meals, real gaps. The planner schedules the splurge — the tasting menu, the private boat, the suite upgrade — as a line item, and the per-day estimates keep the rest honest."], bullets: ["Relaxed style: one or two anchors per day.", "The splurge scheduled as a line item.", "Per-day estimates to keep the budget honest.", "Gaps defended from your own checklist."] },
      { heading: "Refining the plan", paragraphs: ["The honest technique: generate at the luxury level to see the ceiling, then trade down the line that matters least. The plan is the negotiation, made visible."] },
    ],
    style: [
      { heading: "Styles for milestones", paragraphs: ["Relaxed, nearly always — the foodie style works when the table is the relationship's language. Cultural for the city pairs that have history together."] },
      { heading: "Budget for milestones", paragraphs: ["The splurge is the line: one great table, one upgrade night, one private experience — the planner's estimates make the choice deliberate instead of a drip."] },
    ],
    faq: [
      { question: "Which destinations suit anniversaries?", answer: "Paris, Venice, Kyoto, Bali's villas, the Amalfi Coast — the places beautiful at walking pace." },
      { question: "How far ahead should we plan?", answer: "Generate early — the itinerary is free and tells you what to book (the table, the suite) and when." },
      { question: "One splurge or several?", answer: "One great one. Two mediocre splurges are the classic anniversary mistake." },
      { question: "Can the plan surprise my partner?", answer: "Yes — generate the plan, book the splurge quietly, and let the itinerary be the reveal." },
    ],
    guides: ["paris-couples-guide", "europe-14-day-itinerary", "paris-weekend-itinerary", "italy-travel-guide", "paris-luxury-guide", "kyoto-2-day-itinerary"],
    dests: ["paris", "venice", "kyoto"], plannerCity: "Paris", readTime: "4 min read",
  }),
  aiPage({
    slug: "ai-train-travel-planner", title: "AI Train Travel Planner: Europe's Rails, Sequenced",
    seoTitle: "AI Train Travel Planner", meta: "Plan a train trip with AI: the rail threads where every leg is under four hours, the booking windows, and the scenic lines worth routing for.",
    subtitle: "Every leg under four hours, city center to city center — the rail itinerary as the trip.",
    audience: "For travelers who measure a trip by its transfers and consider the station an attraction.",
    intro: [
      "Europe by train is a different trip: city-center to city-center, no airports, the scenery improving with every leg. An AI train travel planner sequences the threads where every leg stays under four hours — the difference between a journey and a commute.",
      "The proven threads: London–Paris–Amsterdam; Paris–Lucerne–Venice–Rome; Prague–Vienna–Budapest. The planner generates each city's days and schedules the legs at the early-bird booking windows.",
    ],
    how: [
      { heading: "The four-hour rule", paragraphs: ["Every rail leg stays under four hours — beyond that, the transfer day eats the destination. The planner schedules the legs as half-days with soft first and last days, so the stitching never tears the itinerary."], bullets: ["Every leg under four hours.", "Two-night minimums between transfers.", "Transfer days are half-days — nothing scheduled.", "Booking windows marked (2–3 months out)."] },
      { heading: "Refining the plan", paragraphs: ["The honest trade is the fifth city versus the fourth night. Generate both shapes — the totals make the pace visible."] },
    ],
    style: [
      { heading: "Styles for rail trips", paragraphs: ["Cultural produces the museum-city shape; foodie the eating-thread; relaxed the scenic-line version (the Gotthard, the Glacier Express) where the window seat is the point."] },
      { heading: "Budget for rail trips", paragraphs: ["Rail adds €20–60 per leg booked early; passes lose on fixed threads. The planner's per-city estimates plus the rail math give the honest total."] },
    ],
    faq: [
      { question: "Rail pass or point-to-point?", answer: "Point-to-point booked early for fixed threads — passes lose on every proven route." },
      { question: "Which thread for a first rail trip?", answer: "London–Paris–Amsterdam: the proven ten days, every leg under 3.5 hours." },
      { question: "Which scenic lines justify a detour?", answer: "The Gotthard Panorama, the Glacier Express, the Bernina Express, the Flåm railway." },
      { question: "Do I need reservations?", answer: "On the premium trains yes — included with booked tickets. Regional trains are walk-up." },
    ],
    guides: ["europe-by-train-guide", "europe-10-day-itinerary", "europe-14-day-itinerary", "western-europe-travel-guide", "switzerland-travel-guide", "europe-travel-guide"],
    dests: ["paris", "london", "zurich"], plannerCity: "London", readTime: "5 min read",
  }),
  aiPage({
    slug: "ai-island-hopping-planner", title: "AI Island Hopping Planner: Ferries, Seasons and the Right Order",
    seoTitle: "AI Island Hopping Planner", meta: "Plan an island-hopping trip with AI: the ferry arithmetic, the season-matched chains, and the route order that never doubles back.",
    subtitle: "The ferry arithmetic and the season-matched chain — islands in the right order.",
    audience: "For travelers who count ferry timetables the way others count flights.",
    intro: [
      "Island hopping is a logistics sport: the chain, the ferry timetable, and the season that keeps the boats running. An AI island-hopping planner sequences the route so it never doubles back, schedules the ferry legs with the sea state in mind, and builds the beach days between the crossings.",
      "The proven chains: Greece's Cyclades (Athens → Naxos → Paros → Santorini), Thailand's Andaman (Phuket → Krabi → Koh Lanta), Indonesia's Bali → the Gilis → Komodo.",
    ],
    how: [
      { heading: "The chain logic", paragraphs: ["The generated plans route one way — every island new, no backtracking — with ferry legs scheduled as half-days and the beach days between. The season check runs first: the meltemi winds can ruffle Cycladic ferries in July–August; the Andaman seas calm in high season."], bullets: ["One-way chains — no doubled-back routes.", "Ferry legs scheduled with timetables in mind.", "Beach days between crossings.", "Season checks built into the routing."] },
      { heading: "Refining the plan", paragraphs: ["The honest trade is island count versus island depth: three islands with real days beats five with ferry fatigue. Generate both and compare the ferry-per-beach ratio."] },
    ],
    style: [
      { heading: "Styles for island trips", paragraphs: ["Relaxed is the default — the chain serves the sand. Adventure adds the dive and volcano days (Santorini, Komodo); foodie routes to the islands that eat well (the Greek tavernas, the Thai beach grills)."] },
      { heading: "Budget for island trips", paragraphs: ["Ferries run €40–80 per Cycladic leg, less in Southeast Asia; the accommodation tier decides the rest. The planner's estimates include the crossings."] },
    ],
    faq: [
      { question: "Which island chain first?", answer: "The Cyclades — the ferries are frequent, the islands distinct, and Athens is the gateway." },
      { question: "How many islands per trip?", answer: "Three with real days; four is the maximum before ferry fatigue wins." },
      { question: "Which season?", answer: "May–June and September–October — warm seas, open boats, thinner decks." },
      { question: "Do I book ferries ahead?", answer: "High-season Cycladic and Komodo ferries, yes. Southeast Asian boats are walk-up." },
    ],
    guides: ["greece-travel-guide", "thailand-travel-guide", "indonesia-travel-guide", "mediterranean-travel-guide"],
    dests: ["athens", "phuket", "santorini"], plannerCity: "Athens", readTime: "5 min read",
  }),
  aiPage({
    slug: "ai-ski-trip-planner", title: "AI Ski Trip Planner: Slopes, Saunas and the Season",
    seoTitle: "AI Ski Trip Planner", meta: "Plan a ski trip with AI: the resort-and-town pairing, the pass arithmetic, the non-skiing days and the season window that matters.",
    subtitle: "The resort, the town, the pass and the rest day — planned for the legs that have to last the week.",
    audience: "For skiers and boarders who've learned that the week is won in the evenings.",
    intro: [
      "Ski trips fail by day three: the legs go, the group fragments, and the last two lift tickets go unused. An AI ski trip planner sequences the week — the big days early, the recovery afternoons, the non-skiing day in the middle, the town nights that keep the group together.",
      "Feed it the region (the Alps, Japan's powder, the Rockies) and the planner sequences the slopes with the saunas, the onsen and the mountain restaurants between.",
    ],
    how: [
      { heading: "The week's arc", paragraphs: ["The generated plans open with the warm-up day, front-load the big-mountain days while the legs are fresh, schedule the mid-week rest (spa, village, scenic rail), and close with the gentle finale. The pass arithmetic and the rental days are marked."], bullets: ["Warm-up day first, always.", "The mid-week non-skiing day — spa, village, scenic rail.", "Pass and rental economics marked.", "Town nights scheduled to keep the group together."] },
      { heading: "Refining the plan", paragraphs: ["The honest trade is ski days versus town days: five ski days is the sustainable maximum in a week. Generate both shapes and read the legs."] },
    ],
    style: [
      { heading: "Styles for ski trips", paragraphs: ["Adventure produces the maximum-vertical shape; relaxed adds the onsen-and-fondue days; foodie routes to the mountains that eat well — the Alps's rifugios, Japan's powder-and-ramen pairing."] },
      { heading: "Budget for ski trips", paragraphs: ["Lift passes CHF 60–90/day in the Alps, ¥6,000–8,000 in Japan; rentals and lessons add. The planner's estimates include the pass tier and the rest-day economics."] },
    ],
    faq: [
      { question: "Alps or Japan?", answer: "The Alps for the scale and the village culture; Japan for the powder and the ramen. Both are proven weeks." },
      { question: "How many ski days per week?", answer: "Five maximum — the mid-week rest day is what keeps the group skiing on day six." },
      { question: "Does the plan include non-skiing days?", answer: "Yes — the spa, the scenic rail, the village. They're scheduled, not optional." },
      { question: "When should I book?", answer: "Lodging 3–6 months out for the season; passes early-bird in autumn." },
    ],
    guides: ["switzerland-travel-guide", "japan-travel-guide", "austria-travel-guide", "japan-family-travel-guide"],
    dests: ["zurich", "sapporo", "munich"], plannerCity: "Zurich", readTime: "4 min read",
  }),
  aiPage({
    slug: "ai-autumn-foliage-trip-planner", title: "AI Autumn Foliage Trip Planner: Chasing the Color South to North",
    seoTitle: "AI Autumn Foliage Trip Planner", meta: "Plan an autumn foliage trip with AI: Japan's November maples, New England's October, the routing that follows the color and books before it peaks.",
    subtitle: "The color moves — north to south in Japan, south to north in New England. The planner follows it.",
    audience: "For travelers who plan around a season instead of a city.",
    intro: [
      "Autumn color is a moving target: Japan's maples peak mid-November moving north; New England's foliage peaks late September moving south. An AI foliage planner routes the trip along the wave — and books the hotels before the color books them.",
      "Feed it the region and your week, and the planner sequences the foliage cities and parks in the order the color arrives, with the temples, the trails and the mountain roads between.",
    ],
    how: [
      { heading: "The wave logic", paragraphs: ["The generated plans sequence by peak: Japan's Kyoto (mid-to-late November) after Tokyo (late November) and before Nikko's earlier show; New England's Vermont and New Hampshire (late September–early October) before the Massachusetts coast. Peak weeks book 3–6 months out — the itinerary tells you when."], bullets: ["Cities sequenced by peak week, not by list.", "Temples, trails and mountain roads between.", "Hotel booking windows marked (3–6 months).", "Weather-buffer days built in."] },
      { heading: "Refining the plan", paragraphs: ["The honest trade is peak-color certainty versus crowd tolerance: the exact peak week is the crowded week. The shoulder of the wave is the connoisseur's answer — generate both and read the trade."] },
    ],
    style: [
      { heading: "Styles for foliage trips", paragraphs: ["Cultural for the temple-garden version (Japan is the masterpiece); adventure for the trail-and-mountain-road version (New England, the Alps); relaxed for the scenic-drive days."] },
      { heading: "Budget for foliage trips", paragraphs: ["Peak-foliage weeks are peak-price weeks: Kyoto's November and New England's October run 30–50% above shoulder rates — the planner's estimates show the premium honestly."] },
    ],
    faq: [
      { question: "Japan or New England for foliage?", answer: "Japan for the temple gardens and the walkable color; New England for the scale and the drives. Both are proven weeks." },
      { question: "When does Kyoto peak?", answer: "Mid-to-late November typically — the forecast publishes from September and the planner's notes track it." },
      { question: "How far ahead should I book?", answer: "3–6 months for the peak-week hotels in Kyoto and New England — the color books the rooms." },
      { question: "Does rain ruin foliage?", answer: "No — the wet maples glow. Wind is the enemy; the plan's buffer days absorb it." },
    ],
    guides: ["best-time-to-visit-japan", "japan-travel-guide", "usa-travel-guide", "kyoto-autumn-travel-2026", "best-fall-foliage-trips-2026"],
    dests: ["kyoto", "boston", "tokyo"], plannerCity: "Kyoto", readTime: "5 min read",
  }),
  aiPage({
    slug: "ai-cherry-blossom-trip-planner", title: "AI Cherry Blossom Trip Planner: Chasing the Sakura Front",
    seoTitle: "AI Cherry Blossom Trip Planner", meta: "Plan a cherry blossom trip with AI: the sakura front from Kyushu to Hokkaido, the forecast tracking, and the hotels that book six months out.",
    subtitle: "The sakura front moves south to north over six weeks — the planner follows it and books ahead of it.",
    audience: "For travelers whose trip is built around two weeks of petals.",
    intro: [
      "The cherry blossoms bloom over six weeks from Kyushu (late March) to Hokkaido (May), with Tokyo and Kyoto peaking around the first week of April — and the hotels in the golden cities sell out 4–6 months ahead. An AI sakura planner routes along the front and marks the booking windows.",
      "Feed it your week and the planner sequences the blossom cities in peak order — with the parks, the temples and the forecast-tracking notes between.",
    ],
    how: [
      { heading: "The front logic", paragraphs: ["The generated plans sequence by bloom: Fukuoka and Kyushu in late March, Tokyo and Kyoto at the early-April peak, the Tohoku north in mid-April, Hokkaido in May. The JMA forecasts publish from February — the plan's notes track the updates."], bullets: ["Cities sequenced by the front's arrival.", "Parks and temples scheduled at their blossom best.", "Hotel booking windows marked (4–6 months).", "The forecast-tracking notes, updated weekly."] },
      { heading: "Refining the plan", paragraphs: ["The honest trade is the famous parks versus the neighborhood trees: Ueno's crowds against the riverbank lanes. Generate both shapes — the neighborhood version is usually the better trip."] },
    ],
    style: [
      { heading: "Styles for sakura trips", paragraphs: ["Cultural is the natural shape — the temples and gardens hold the blossoms. Foodie adds the hanami bento economy; relaxed adds the picnic afternoons that are the point."] },
      { heading: "Budget for sakura trips", paragraphs: ["Peak-blossom weeks double hotel prices in Tokyo and Kyoto — the planner's estimates show the premium, and the Osaka-base alternative halves it at a commute's cost."] },
    ],
    faq: [
      { question: "When do the blossoms peak?", answer: "Tokyo and Kyoto around the first week of April; Kyushu late March; Hokkaido into May. The forecast shifts yearly." },
      { question: "How far ahead do I book?", answer: "4–6 months for the golden cities' hotels — refundable if the forecast moves." },
      { question: "Is the crowd worth it?", answer: "At dawn and in the neighborhoods, yes — the 7am park is the trip. The planner schedules around the scrums." },
      { question: "What if I miss the peak?", answer: "The front moves north — the planner reroutes to the Tohoku or Hokkaido bloom within your window." },
    ],
    guides: ["japan-travel-guide", "best-time-to-visit-japan", "japan-cherry-blossom-2027", "kyoto-3-day-itinerary", "tokyo-first-time-guide", "japan-travel-budget"],
    dests: ["tokyo", "kyoto", "fukuoka"], plannerCity: "Tokyo", readTime: "5 min read",
  }),
  aiPage({
    slug: "ai-summer-vacation-planner", title: "AI Summer Vacation Planner: Heat, Light and the Long Days",
    seoTitle: "AI Summer Vacation Planner", meta: "Plan a summer vacation with AI: the heat-managed city days, the mountain and coast escapes, and the regions where summer is the best season.",
    subtitle: "Summer is the best season somewhere — the planner finds where and schedules around the heat elsewhere.",
    audience: "For travelers locked to the school calendar who refuse to melt.",
    intro: [
      "Summer travel is a routing problem: the Mediterranean bakes, the cities empty, and the mountains, coasts and Nordic light peak. An AI summer planner routes to where summer is the best season — the Alps, the Baltic, the Pacific Northwest, the southern-hemisphere winters — and heat-manages the cities it must include.",
    ],
    how: [
      { heading: "The summer routing", paragraphs: ["The generated plans route by season logic: the Alps and the Nordic capitals for the light, the Pacific Northwest for the driest summer in America, the Baltic coasts for the swim, and the southern-hemisphere ski-and-city trips for the true heat-averse. Cities that must be included get the early-and-late rhythm."], bullets: ["Season-matched regions, not generic lists.", "The early-and-late rhythm for necessary cities.", "Mountain and coast days between.", "Per-day figures with the summer premiums shown."] },
      { heading: "Refining the plan", paragraphs: ["The honest trade is the school-calendar constraint versus the heat: the planner's job is to make the calendar work, routing to altitude and latitude."] },
    ],
    style: [
      { heading: "Styles for summer", paragraphs: ["Relaxed routes to the lakes and coasts; adventure to the alpine trails; cultural to the northern cities where summer is the season — Stockholm, Copenhagen, Vancouver, Seattle."] },
      { heading: "Budget for summer", paragraphs: ["Summer premiums are real in Europe (+20–30%) and reversed in the southern hemisphere — the planner's estimates show both sides of the calendar."] },
    ],
    faq: [
      { question: "Where is summer the best season?", answer: "The Alps, the Nordic capitals, the Pacific Northwest, the Baltics — and the southern-hemisphere winters." },
      { question: "How do I handle city heat?", answer: "The early-and-late rhythm: sights at opening, pools and museums at noon, terraces after dark." },
      { question: "Is summer the wrong time for Europe?", answer: "For the Mediterranean yes; for the Alps and the north, it's the best season there is." },
      { question: "Can the planner handle school holidays?", answer: "Yes — it routes to the regions where the school-calendar crowd thins: altitude, latitude, and the southern hemisphere." },
    ],
    guides: ["switzerland-travel-guide", "northern-europe-travel-guide", "usa-travel-guide"],
    dests: ["zurich", "copenhagen", "seattle"], plannerCity: "Copenhagen", readTime: "4 min read",
  }),
  aiPage({
    slug: "ai-winter-vacation-planner", title: "AI Winter Vacation Planner: Snow, Steam and the Northern Lights",
    seoTitle: "AI Winter Vacation Planner", meta: "Plan a winter vacation with AI: the ski weeks, the onsen-and-snow pairings, the aurora hunts and the cities that are better in December.",
    subtitle: "Winter is the best season somewhere — the planner finds the snow, the steam and the aurora.",
    audience: "For travelers who'd rather chase the cold than escape it.",
    intro: [
      "Winter travel is a routing problem too: the ski weeks (the Alps, Japan's powder), the onsen-and-snow pairings (Hakone, Zermatt), the aurora hunts (Iceland, Lapland), and the cities that are better in December — Vienna's markets, Prague's spires, Kyoto's quiet temples in snow.",
      "Feed it your week and the planner sequences the winter region honestly — with the daylight hours, the cold-weather pacing and the steam breaks built in.",
    ],
    how: [
      { heading: "The winter routing", paragraphs: ["The generated plans route by winter logic: the Alps and Hokkaido for the snow sports, Iceland and Lapland for the aurora, the European capitals for the markets and museums, Japan's onsen towns for the steam-and-snow pairing. Daylight hours bound every day — the plans schedule around them."], bullets: ["Season-matched regions: snow, steam, aurora or markets.", "Daylight-bounded days — plan by 3pm finishes.", "The onsen-and-sauna recovery rhythm.", "Per-day figures with the season premiums shown."] },
      { heading: "Refining the plan", paragraphs: ["The honest trade is the snow quality versus the light quantity: January's powder comes with four-hour days in the north. The planner makes the trade visible."] },
    ],
    style: [
      { heading: "Styles for winter", paragraphs: ["Adventure routes to the ski and aurora regions; relaxed to the onsen and spa pairings; cultural to the market-and-museum capitals where winter is the local season."] },
      { heading: "Budget for winter", paragraphs: ["Ski regions and aurora hunts carry premiums; the city winters are the value season — Vienna and Prague in January are half their December rates."] },
    ],
    faq: [
      { question: "Where is winter the best season?", answer: "The Alps and Hokkaido for snow, Iceland and Lapland for aurora, the onsen towns for steam — and the European capitals for value." },
      { question: "How do I handle short days?", answer: "The plans bound outdoor days by 3pm and move the evenings to baths, markets and dinners." },
      { question: "Aurora trips — worth the gamble?", answer: "With four nights minimum in the aurora zone, yes — the odds and the planner's buffer nights make it honest." },
      { question: "Japan in winter?", answer: "The connoisseur's choice — powder in Hokkaido, snow-dusted Kyoto, steaming onsen in Hakone." },
    ],
    guides: ["switzerland-travel-guide", "japan-travel-guide", "austria-travel-guide", "northern-europe-travel-guide", "vienna-3-day-itinerary"],
    dests: ["zurich", "sapporo", "reykjavik"], plannerCity: "Zurich", readTime: "4 min read",
  }),
  aiPage({
    slug: "ai-family-vacation-planner", title: "AI Family Vacation Planner: One Anchor Per Day",
    seoTitle: "AI Family Vacation Planner", meta: "Plan a family vacation with AI: the one-anchor-per-day law, the playground economy, apartment-hotel logic and the kid-picked rewards.",
    subtitle: "One anchor per day, playgrounds as currency, and the pool hours that save every trip.",
    audience: "For parents converting school holidays into memories without meltdowns.",
    intro: [
      "Family trips fail by overstuffing: the parents' checklist against the kids' stamina, and nobody wins. An AI family vacation planner enforces the one law — one anchor per day — and schedules the playgrounds, pools and ice-cream stops as the reward economy that keeps everyone walking.",
      "Feed it the destination, the dates and the kids' ages in the notes; the generated plan sequences the anchors, the rewards and the pool hours that are structural, not optional.",
    ],
    how: [
      { heading: "The one-anchor law", paragraphs: ["The generated plans schedule one major sight per day — the zoo, the theme park, the boat, the tower — with the afternoon belonging to pools, playgrounds and gelato. Museums run 90 minutes, highlights-only, and under-18s are free nearly everywhere."], bullets: ["One anchor per day — the law that holds it together.", "Playgrounds, pools and gelato as the reward currency.", "Apartment-hotel logic: space, kitchen, laundry.", "Rush-hour and heat windows avoided by design."] },
      { heading: "Refining the plan", paragraphs: ["The honest trade is the parents' list versus the kids' pace. Generate, cut one anchor, add one pool hour, regenerate — the plan converges on the trip everyone survives happily."] },
    ],
    style: [
      { heading: "Styles for families", paragraphs: ["Relaxed is the default family style — anchors light, pools heavy. The foodie style works when the food courts count as entertainment; the theme-park style is its own commitment."] },
      { heading: "Budget for families", paragraphs: ["Apartment hotels halve the food line; under-18 free entry multiplies; the theme-park day is the budget event. The planner's per-person estimates include the kids' discounts."] },
    ],
    faq: [
      { question: "Which destinations are best with kids?", answer: "Tokyo, Singapore, Orlando, Amsterdam, Copenhagen — the safe, clean, anchor-rich cities with playground economies." },
      { question: "How many anchors per day?", answer: "One. Two on a perfect day with a pool between them. The law holds." },
      { question: "Hotel or apartment?", answer: "Apartment — space, kitchen and laundry beat the hotel breakfast for families of four." },
      { question: "Does the plan handle different kid ages?", answer: "Note the ages in your planning — the planner weights playgrounds for littles and theme parks for bigs." },
    ],
    guides: ["tokyo-family-travel-guide", "paris-family-guide", "japan-family-travel-guide", "europe-family-guide", "usa-travel-guide", "bali-travel-budget"],
    dests: ["tokyo", "orlando", "singapore"], plannerCity: "Orlando", readTime: "5 min read",
  }),
];

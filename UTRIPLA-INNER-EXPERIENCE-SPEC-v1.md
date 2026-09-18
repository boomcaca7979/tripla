# UTRIPLA — Inner Experience Rebuild + Homepage Planning Entry Reposition — SPEC v1

- Status: DESIGN SPEC — implementation is explicitly out of scope for this round
- Date: 2026-09-13
- Codebase: /Users/boomcaca/projects/tripla (Next.js 16.2.7 / React 19.2.4 / Tailwind CSS 4)
- Scope: 5 inner page types (Destination, Guide, Trip, Region, Best Time) + ONE home change (PlanLater reposition)
- Hard constraint: Home UI is FROZEN except repositioning of the "Already know where?" section

---

## 0. Executive Summary

UTRIPLA's home already has a visual personality (living sky environment, Instrument Serif display, terracotta accent, Geist Mono instrument readouts). The four detail pages have already been migrated to this design language — but they are **editorial documents, not exploration products**: almost every section is static text/rows, the only interactions are FAQ `<details>` and a month tablist, and there is not a single map or climate chart. The hub pages still run the legacy gray/blue card-grid style. The result: the home promises "interactive travel discovery", the inner pages deliver "read an article".

This spec redefines the five inner page types as **experience pages with a dominant core behavior each** — EXPLORE (Destination), PREPARE (Guide), JOURNEY (Trip), DISCOVER (Region), UNDERSTAND (Best Time) — on one shared design system, using **only real data already in the codebase** (NASA POWER canonical climate incl. per-month tiers and real coordinates, existing destination/trip/guide datasets, the existing Open-Meteo weather API). The single home change moves the "Already know where?" planning entry (currently the last section of the page) to directly below the Hero.

Total new component count: **7 new components + 1 data adapter module**. No map library, no chart library, no framer-motion. All visualizations are hand-rolled SVG/CSS against existing SSG pages.

---

## PART A — STEP 1 AUDIT (current state, evidence-based)

### A.1 Page inventory and render order (as built today)

**Destination detail** — `src/app/destinations/[slug]/page.tsx` (463 lines, SSG, `dynamicParams = false`):
1. `PlaceAtmosphere` (client wrapper → `--ut-place-*` CSS vars) · 2. 4× JSON-LD (TouristDestination, Breadcrumb, ItemList, FAQPage) · 3. `InnerBreadcrumb` · 4. `PlaceHero` (image band or atmosphere-field fallback, serif H1 city, mono region eyebrow) · 5. `PlaceIdentity` instrument strip (Region/Country + `LocalStateReadout`: local time, season, weather — hydrate-driven) · 6. **`longDescription` prose ~50–70 words** · 7. `PlaceHighlights` (asymmetric editorial: 1 feature + numbered hairline rows — static) · 8. `PlacePractical` dl grid · 9. `PlaceDecision` best-time module (text) · 10. `PlaceDecision` budget module (text) · 11. `FaqList` (`<details>`) · 12. Guides index · 13. Routes rows · 14. `HotelModule` · 15. `InnerCTA` · 16. Related destinations.

**Guide detail** — `src/app/guides/[slug]/page.tsx` (353 lines): `ReadingProgress` bar · 3× JSON-LD (Article, Breadcrumb, FAQPage) · breadcrumb · `EditorialHero` (typographic, no image) · **introduction paragraphs** · `sections[]` as H2+paragraph+bullets (3–6 sections × ~100 words) · itinerary `Timeline` · `PracticalInfo` 2 panels · FAQ · CTA · 3 related indexes. **The wordiest page type; effectively a formatted article.**

**Trip detail** — `src/app/trips/[slug]/page.tsx` (569 lines): `JourneyAtmosphere` · 3× JSON-LD (Trip + per-day ItemList) · breadcrumb · `JourneyHero` (image/tint band + route readout + "Day 1 of N" bar) · **`JourneyRoute` strip** (Gateway → day legs → Destination, vertical/horizontal rail) · description ~50 words · context links · conditional `PlaceHighlights` · **`JourneyProgress` + `JourneyTimeline`** (vertical day timeline, scroll-spy anchor track, "Next stop →" transfer blocks) · `JourneyPlaces` (restaurant rows) · `PlacePractical` · 2× `PlaceDecision` · CTA · related indexes. **This page already delivers the journey visualization core.**

**Region detail** — `src/app/regions/[region]/page.tsx` (331 lines, fully static): 3× JSON-LD · hand-rolled breadcrumb · **legacy `text-4xl font-extrabold` H1** · 1 templated paragraph · **uniform 3-col destination card grid** (text-only) · uniform 3-col trip card grid · cross-link panel. **Zero interactivity, zero visuals, legacy palette, no map.** Regions are only a 4-value union (`Asia | Europe | Americas | Oceania`, `src/data/destinations.ts:10`); region pages are macro-continent pages.

**Best Time detail** — `src/app/best-time-to-visit/[slug]/page.tsx` (517 lines): `SeasonAtmosphere` · 3× JSON-LD (Article) · breadcrumb · `ClimateHero` (decision-first, split window/score, 6-cell `DecisionSignals` readout) · `RecommendationModule` (verdict distribution + reasoning prose) · **`MonthSelector`** (12-month tablist, the only interaction) · **`ClimateTable`** (semantic 12-row `<table>`) · `SeasonSummary` rows · `PlacePractical` · FAQ · CTA · related · NASA attribution.

**Hubs** (`/destinations`, `/guides`, `/trips`, `/regions`, `/regions/[region]`, `/best-time-to-visit`): legacy gray/blue palette, uniform card grids; `/guides` hub has no JSON-LD at all; `/best-time-to-visit` hub metadata hardcodes "12 top destinations" while rendering 145.

### A.2 Interaction inventory (the gap)

| Page | Interactive today | Missing |
|---|---|---|
| Destination | FAQ accordion, atmosphere hydration | no map, no vibe/interest filtering, no climate viz, no image-state switching |
| Guide | ReadingProgress bar, FAQ accordion | no module navigation, no visual budget/season/transport expression |
| Trip | `JourneyProgress` scroll-spy | no map, no weather window, legs lack duration/visual rhythm |
| Region | **none** | no map, no month filtering, no status display |
| Best Time | MonthSelector tablist | no 12-month visual trajectory (table + tabs only) |

### A.3 Data assets available (all real — this is what makes the rebuild honest)

From `src/data/destinations.ts` (`Destination` type, 145 records incl. extended files):
- `airport.{latitude,longitude,timezone,iata}` → **real coordinates for every destination** (never rendered today) → can drive lightweight SVG maps.
- `highlights[]` (5 per destination) → city-exploration anchors (real, curated).
- `interests[]`, `travelStyle`, `budgetPerDay/Currency`, `recommendedDays`, `weatherScore.{overall,breakdown,recommendation}` (breakdown only used on hub ring today).
- `image|null` + `gradient` (hero fallbacks exist).

From `src/data/climate/nasa-power-canonical-v1.json` + `nasa-canonical.ts` (145 records, build-fail on missing):
- 12 × `{ tempMeanC, tempHighC, tempLowC, precipMm, precipDaysGe1mm, daylightHours, ruleId, tier: Favourable|Workable|Challenging }` + `bestMonthsBaseline` → **month-level GOOD/WORKABLE/CHALLENGING status for every destination exists already** — exactly the data the Region month-matrix and the Climate Year need. `sunshineHours` is always null — must not be visualized as if real.

From `src/lib/visual-state.ts` + `HomeEnvironment`: real local time (Intl), season; weather on home is a deterministic hash (not live) — inner pages must NOT reuse that hash as "weather" (it would violate the no-fake-data rule); the **existing `/api/weather` (Open-Meteo) is the only live weather source**.

From `src/data/trips.ts` (280 trips): `itinerary/fullDays` with per-activity time blocks, `restaurants`, `bestSeason/weatherTip`, `budget/estimatedCost`.
From `src/data/guides.ts` (~342 guides): `introduction/sections/practicalInfo/itinerary/faq`, `related*Slugs`, `planner` deep-link payload.

### A.4 Existing component audit (reuse / replace / obsolete)

**Reusable as-is** (design-system primitives, keep): `InnerSection`, `InnerBreadcrumb`, `Eyebrow`, `PlacePractical`, `PlaceDecision`, `FaqList`, `EditorialIndex`, `HotelModule`, `InnerCTA`, atmosphere wrappers (`PlaceAtmosphere`/`JourneyAtmosphere`/`SeasonAtmosphere`), `LocalStateReadout`.
**Reusable with adaptation**: `PlaceHighlights` (becomes interactive anchor board), `JourneyRoute`/`JourneyTimeline`/`JourneyProgress` (keep; enrich), `MonthSelector` (drives new ClimateYear), `ClimateTable` (keep for SEO/accessibility), `VerdictTag`, `WeatherScore`, `Timeline` (guide), `SearchBar`+`PlanLater` (move, don't redesign).
**Obsolete after rebuild**: none deleted blindly — `Timeline` (guide) folded into field-guide module set; legacy hub card components stay out of scope this round (hubs get token migration only if trivially cheap; otherwise next round).
**Do-not-touch**: entire `src/components/home/` except `page.tsx` section order and `PlanLater` spacing; `HomeEnvironment`, `HomeHero`, `TimeDock`, `DiscoveryStage`, `RoutesStage`, `GuidesStage` are frozen.

### A.5 Interaction reference study (6 products, patterns only — nothing copied)

1. **Apple Weather** — status-first hierarchy: giant current state, then horizontally pannable data bands; every number has a visual form (bars/curves), never a paragraph. → informs **NOW module** and **Climate Year**.
2. **Polarsteps** — journey as a living vertical line: day nodes, photos dominant, text captions secondary; "walking the route" feeling. → informs **Trip journey spine**.
3. **Airbnb (explore)** — map and content co-drive state: filtering the list moves the map, tapping a pin selects a card; sticky split surfaces. → informs **Region Map Explorer** state model (without a map library: abstract SVG plot).
4. **Wanderlog** — itinerary where days, places and travel durations are one connected object, not repeated day cards. → informs **Journey leg blocks with durations**.
5. **CN Traveler "Where to go in {year}" / Timeshifter** — month-first decision UI: pick a month, see which places are good now. → informs **Region month matrix**.
6. **Kinfolk / Cereal (editorial)** — typographic calm, hairline rhythm, generous whitespace; data presented as instruments, not cards. → confirms the existing `ut-*` editorial language for inner pages.

---

## PART B — STEP 2 DESIGN SYSTEM & PAGE ARCHITECTURE

### B.1 Shared design system (extends the existing `ut-*` system — no new visual language)

The four detail pages already run the `ut-*` token system (`src/app/globals.css:9–156`). The rebuild **extends** it:

**Typography (unchanged roles, tightened usage)**: Instrument Serif display for place/journey/month names (the *subject* of each page); Geist Mono uppercase micro for instrument labels, readouts, coordinates, day numbers; Geist Sans only for supporting context sentences. New rule: **every page must state its subject (place/route/region) in ≥ display-lg within the first viewport, with a mono state readout attached**.

**New tokens to add (globals.css only, no component-level colors)**:
- `--ut-region-*` var family (mirror of `--ut-place-*`/`--ut-journey-*`/`--ut-season-*`): a per-region earth tint assigned server-side by deterministic region hash (4 regions → 4 fixed tints, no hydration risk).
- Verdict scale tokens: `--ut-verdict-good`, `--ut-verdict-workable`, `--ut-verdict-challenging` (mapped from existing R-tier semantics: Favourable/Workable/Challenging). Fixed hues, documented in one place, WCAG-checked on `--ut-bg` and `--ut-surface`.
- `--ut-data-line` (hairline for charts), `--ut-data-fill` (accent-soft area fill).

**Layout rhythm**: 12-col container (`--ut-container-max: 80rem`); section vertical rhythm = `py-16 md:py-24`; every page alternates **full-width visual band → instrument row → narrow context column**. Forbidden: repeated 3-col card grids on detail pages.

**Surface model**: page background stays `--ut-bg`; interactive boards sit on `--ut-surface` / `--ut-surface-elevated` with `border-ut` hairlines; data graphics render directly on the paper background (no card wrapping the chart).

### B.2 The five core behaviors (page = one dominant verb)

| Page | Verb | First-viewport promise | Primary interactive object |
|---|---|---|---|
| Destination | EXPLORE | "This is the place, right now" | `CityExplorer` (area anchor board) + `VibeSelector` |
| Guide | PREPARE | "Everything you must know, at a glance" | `FieldGuideModules` (WHEN/MOVE/EAT/STAY/DON'T MISS/GOOD TO KNOW) |
| Trip | JOURNEY | "Walk this route" | `JourneySpine` (enriched timeline) |
| Region | DISCOVER | "Where to next, and when" | `RegionMapExplorer` + month control |
| Best Time | UNDERSTAND | "Go then, not then" | `ClimateYear` |

### B.3 Component architecture (complete list; deliberately small)

**New components (7)** — all in `src/components/inner/` unless noted:

1. **`NowPanel.tsx`** (client island) — Destination NOW module. Renders local time + season (real, via `Intl` + `visual-state` helpers, hydration-updated) and temperature from **`/api/weather` (existing Open-Meteo integration, real)** with graceful fallback to the NASA canonical current-month normal range, explicitly labeled `CLIMATE NORMAL` vs `LIVE`. Single instrument row: time · season · temp · daylight. No invented conditions.
2. **`ClimateYear.tsx`** (client island, hand-rolled SVG) — the 12-month visual trajectory. Composition per month column: verdict-colored band (tier → verdict token), temperature range curve (tempLowC→tempHighC area + tempMeanC line), precipitation bars (precipMm, secondary axis), rain-day dots (precipDaysGe1mm). Hover/focus/keyboard selects a month → readout row updates (month name, season, verdict tag, 4 numeric readouts). Data source: `nasa-canonical.ts` per destination; shared by Destination "When to go" and Best Time hero-adjacent section. **No recharts** (recharts stays only on /plan WeatherPanel). Target ≤ 6 KB gz incl. interaction.
3. **`RegionMiniMap.tsx`** (server-renderable SVG + client highlight) — abstract geographic plot of real `airport.latitude/longitude` for a set of destinations (the city + its region neighbors on Destination; the whole region on Region page). Equirectangular projection over the region's bounding box, hairline graticule, dot-per-city with mono label; selected city enlarged with accent ring. Pure SVG, no tiles, no library.
4. **`VibeSelector.tsx`** (client island) — Destination "Pick your vibe": chips derived from the destination's real `interests[]` + global interest keys (NIGHT/FOOD/DESIGN/NATURE/SHOPPING/SLOW mapping documented per interest key). Selecting a vibe reorders/filters the highlight board and the related guides/trips rows (state change = real filtering over real relations; empty state shows all). Implemented with CSS `hidden`/order + `useState`; no animation library.
5. **`RegionMapExplorer.tsx`** (client island) — Region page core: `RegionMiniMap` (all member destinations) + month control (JAN–DEC). Selecting a month colors every city dot and its label with verdict status for that month from `nasa-canonical` (Favourable→GOOD, Workable→WORKABLE, Challenging→CHALLENGING) and updates a side readout (count of good/workable/challenging + top 3 good cities). The list beside the map syncs selection.
6. **`FieldGuideModules.tsx`** (server + native `<details>`) — Guide page module set: maps `guide.sections[]` (real content) into a fixed instrument frame; each module = mono label + first paragraph visible + expandable remainder (content stays in DOM for SEO); modules get categorical icons derived from heading keywords (WHEN/MOVE/EAT/STAY/DON'T MISS/GOOD TO KNOW buckets with deterministic keyword mapping; unmatched → NOTES). `practicalInfo[]` renders as budget/transport instrument panels; itinerary keeps the existing `Timeline` inside the JOURNEY module.
7. **`WeatherWindow.tsx`** (server) — Trip page: NASA canonical verdict band spanning the trip's months (calendar days → month tier strip) + `bestSeason` line; answers "is this window good" without prose.

**Data adapter (1)**: `src/lib/inner-state.ts` — pure functions: `regionTintFor(region)`, `projectRegionPoints(destinations)` (bbox + equirectangular), `verdictForMonth(record, m)`, `tripMonthWindow(trip, canonical)`, `interestToVibe(key)`, `bucketGuideSection(heading)`. All deterministic, unit-testable (Vitest, matching repo practice), no client deps.

**Explicitly banned**: map tile libraries, WebGL, framer-motion, recharts on inner pages, CSS frameworks beyond Tailwind.

### B.4 Interaction system (shared rules)

- Every interactive control: ≥44px target, visible focus (`--ut-shadow-focus`), keyboard operable (tabs/arrows/Enter/Space), `aria-selected`/`aria-expanded`/`role=tablist` where tabular (matches `MonthSelector` precedent), state announced via `aria-live="polite"` readout.
- Interaction must change **information**: selection → readout/filter/map color/reordered content. No decorative-only motion. Allowed motion: 150–300ms opacity/transform transitions on state change, existing `.ut-reveal` on scroll, `prefers-reduced-motion` + `[data-ut-lite]` shutoff (already in globals.css:732–778 — reused).
- Single-selection pattern per page (one vibe, one month, one city) — multi-select only where comparison is the point (Region: none; keep single month).
- Hover = preview (enlarge dot, underline label); click = commit (state). On touch, hover states degrade to tap.

### B.5 Visual information system

- **Instruments over prose**: every number appears inside a mono readout with a label; every status appears as a colored verdict band/tag; every location appears as a labeled point or a serif name over imagery.
- **Verdict is the universal status color**: Favourable=GOOD (calm green-adjacent token), Workable=WORKABLE (paper/neutral), Challenging=CHALLENGING (muted warning) — used identically in ClimateYear, RegionMapExplorer, WeatherWindow, MonthSelector, ClimateTable legend. One legend component text shared verbatim.
- **Map language**: no basemaps; paper background, hairline graticule, accent dots — the map reads as part of the editorial page, not an embedded widget.
- **Imagery**: only existing `image` fields (destination/trip/guide covers). Fallback = existing atmosphere-field pattern (tint + hairline grid), never stock substitutes, never external fetching.

### B.6 Text-minimization rules (hard constraints)

1. No detail page may open with more than **2 sentences of prose** before an interactive or visual element (current Destination violates this with `longDescription` ~50–70 words + 2 decision modules before any interaction).
2. `longDescription` (Destination) and `introduction[]` (Guide) are **demoted, not deleted**: rendered as a collapsed `About {city}` / `Why this guide` `<details>` (content in DOM → SEO intact) placed after the core interactive sections.
3. Every section heading ≤ 4 words, mono; every status line ≤ 12 words ("Best between March and May", never a paragraph).
4. Section body text ≤ 40 words before a visual break; longer data lives in instruments (tables/charts/timelines), never paragraphs.
5. All JSON-LD text sources (FAQ, descriptions) remain byte-identical sources — text minimization changes *placement*, not *data*.

### B.7 Responsive behavior

- Mobile-first: instrument rows collapse to 2×2 grids; ClimateYear becomes horizontally scrollable band with snap + sticky selected-month readout (content in DOM, scroll only); RegionMapExplorer stacks (map on top, list below, selection syncs); JourneySpine stays vertical (already mobile-correct); FieldGuideModules single column.
- Breakpoints: existing Tailwind defaults (`sm/lg`), consistent with current pages; touch targets ≥ `--ut-touch-min`.
- `data-ut-lite` (saveData) and `prefers-reduced-motion` disable all new transitions (reuse existing global shutoffs).

### B.8 Performance constraints (budget, not aspirations)

- All five detail pages remain **SSG** (`generateStaticParams`, `dynamicParams=false`) — no dynamic rendering introduced.
- Client JS per detail page: current baseline + **≤ 15 KB gz of new client code** (NowPanel ~2 KB, ClimateYear ≤ 6 KB, VibeSelector ≤ 2 KB, RegionMapExplorer ≤ 5 KB — each page uses only its own islands).
- No recharts on inner pages; no new runtime dependencies. SVG hand-rolled; hydration surface unchanged in spirit (existing pages already hydrate `PlaceAtmosphere` etc.).
- LCP protected: hero band unchanged (image or atmosphere field, no new hero media); charts render below/near hero without blocking; no layout shift from instruments (fixed row heights, `aspect-ratio` reserved).
- Build time guard: ClimateYear/RegionMiniMap derive from the already-loaded canonical JSON — no additional 1.6 MB parsing beyond existing `nasa-canonical.ts` usage (module-level import shared, tree-shaken per page).

### B.9 SEO constraints

- URLs, `generateMetadata`, canonical, OG/Twitter blocks: **unchanged** on all five page types.
- All JSON-LD blocks preserved verbatim (TouristDestination/Article/Trip/CollectionPage/Breadcrumb/FAQPage/ItemList).
- `ClimateTable` (semantic `<table>`) and guide full text remain in DOM — visualizations are additive, not replacements.
- Collapsed prose (`<details>`) is indexable (content present in HTML) — chosen specifically over client-only tabs that unmount content.
- Known pre-existing SEO gaps to fix **only if free**: `/guides` hub missing JSON-LD (add CollectionPage/ItemList), `/best-time-to-visit` hub stale "12 top destinations" copy (align to dataset length), region breadcrumb position-2 pointing to `/destinations` (`regions/[region]/page.tsx:125`). These are data-correctness fixes, not UI work.

### B.10 Data integrity constraints

- Climate: only `nasa-canonical.ts` + `nasa-power-canonical-v1.json`; R1–R7 semantics, verdict tiers, `bestMonthsBaseline` untouched; build-fail coverage assert stays.
- Weather: live values only from existing `/api/weather` (Open-Meteo); fallback shows NASA normals **explicitly labeled** `CLIMATE NORMAL`. The home's deterministic hash weather (`visual-state.ts:130–141`) must never be presented as real weather on inner pages.
- Coordinates: only `airport.latitude/longitude` from the dataset. `sunshineHours` (always null) and `ruleId` are never visualized.
- No fake counts, reviews, popularity, "people loved this", or fabricated neighborhoods/areas. Destination area anchors = real `highlights[]`; vibes = real `interests[]`; region statuses = real NASA tiers; trip durations = real itinerary time blocks.

---

## PART C — PAGE EXPERIENCE SPECS

### C.1 DESTINATION — core verb: EXPLORE

File: `src/app/destinations/[slug]/page.tsx` (rebuild in place; URL/JSON-LD/metadata unchanged).

1. **Destination visual hero** (keep `PlaceHero`) — city name display, mono region eyebrow; **NEW: attach compact state readout into the hero band** (local time · season · live temp chip) so the first viewport reads "TOKYO · 18°C · Autumn · 19:58" as one object (replaces the identity-strip's separated readout; identity strip folds into hero band).
2. **NOW** (`NowPanel`) — one instrument row: local time (live), season, temperature (live via `/api/weather`, fallback NASA normal labeled), daylight hours (NASA current month). Weather *conditions* shown only if live API responds (WMO glyph); otherwise omitted, never faked.
3. **EXPLORE THE CITY** (`CityExplorer` = `VibeSelector` + `PlaceHighlights` board + `RegionMiniMap`) — left: highlight anchor board (existing `highlights[]` rendered as the existing asymmetric editorial board, now clickable: selecting a highlight swaps the board's feature position and shows its interest tags); right: `RegionMiniMap` with the city + regional neighbors (real coordinates). Interaction changes the board state and map highlight.
4. **PICK YOUR VIBE** (`VibeSelector`) — chips from real `interests[]` (+ SLOW → relaxed, NIGHT → nightlife, DESIGN → museums/art, FOOD → food, NATURE → nature/beaches, SHOPPING → shopping). Selecting reorders highlights and filters guides/trips rows below.
5. **WHEN TO GO** (`ClimateYear`) — 12-month verdict/temperature/precipitation trajectory replacing the text `PlaceDecision` (the text decision becomes the one-line readout under the chart: "Best between March and May · Climate score 84/100"). Deep link to `/best-time-to-visit/[slug]` kept.
6. **Context (demoted prose)** — `About {city}` `<details>`: `longDescription` + mono meta line (style · interests). Same text, now supporting role.
7. **KEEP EXPLORING** — existing `EditorialIndex` guides/trips/related-destinations (vibe-filtered when a vibe is active), `PlacePractical` dl, `HotelModule`, `InnerCTA`, FAQ (kept; single source of truth with JSON-LD preserved).

### C.2 GUIDE — core verb: PREPARE

File: `src/app/guides/[slug]/page.tsx`. From article → **field guide**.

1. **Hero** (keep `EditorialHero` — typographic; add city context readout line: city · best window (NASA) · read time).
2. **At-a-glance band** — 6 mono module tiles: WHEN · MOVE · EAT · STAY · DON'T MISS · GOOD TO KNOW (+ NOTES if unmatched sections exist). Clicking scrolls/expands the module (anchor + `open`).
3. **`FieldGuideModules`** — each module: mono label, deterministic icon, **first paragraph visible**, rest in `<details>` (SEO-safe). Module assignments via `bucketGuideSection(heading)` keyword mapping over real `sections[]` headings; `practicalInfo[]` panels slot into MOVE/STAY/GOOD TO KNOW as instrument lists (budget ranges as visual range bars, not sentences); itinerary `Timeline` lives in DON'T MISS/JOURNEY module.
4. **Journey window** — one-line season/when instrument (NASA window for the guide's city).
5. FAQ, CTA, related indexes unchanged (single-source-of-truth FAQ preserved).
6. `introduction[]` demoted into the first module's expandable body or an `About this guide` details block.

### C.3 TRIP / ROUTE — core verb: JOURNEY (refinement, not rebuild)

File: `src/app/trips/[slug]/page.tsx` + `src/components/journey/*`.

Keep: `JourneyHero`, `JourneyRoute`, `JourneyTimeline`, `JourneyProgress` (the page's spine is already right).

Enrich:
1. **JourneySpine** upgrade of `JourneyTimeline`: day nodes get leg-duration readouts (from `journey-state.ts` `legHours`/real activity time blocks), stop glyphs, and the "Next stop →" transfer blocks become visually continuous rails (animated dash on scroll, reduced-motion safe).
2. **`WeatherWindow`** ("When to go" section): NASA verdict band across the trip's calendar months + bestSeason line — replaces the text-only `PlaceDecision` best-time module (budget `PlaceDecision` stays).
3. **Day density rhythm**: existing `deriveDensity`/`derivePace` render as a small pace strip (Light/Relaxed/Balanced/Full) under the route.
4. Prose demoted identically (description ≤ 2 sentences visible above fold, rest in details).

### C.4 REGION — core verb: DISCOVER (largest gap → full rebuild of page body)

File: `src/app/regions/[region]/page.tsx`. URL/metadata/JSON-LD unchanged.

1. **Hero** — migrate to `ut-*` tokens: serif H1, mono readout: `{n} destinations · {n} trips · best month now: {month}` (computed from NASA data, real).
2. **`RegionMapExplorer`** (the page's core): `RegionMiniMap` with all member destination dots (real coordinates) + JAN–DEC month control. Selecting APRIL, for example, colors every dot GOOD / WORKABLE / CHALLENGING (NASA tiers for that month) with a side readout: counts + top good cities; selecting a city highlights its card. Both map and list respond to the same state.
3. **Season band** — 12-month strip aggregated over the region (count of Favourable cities per month → mini bar band) with the same month control state.
4. **Destination list** — replaces the uniform card grid: verdict-tagged rows (city serif name + country + best window + budget mono readout), sorted by selected-month tier (Favourable first). Interaction = the discovery loop.
5. **Trips in region** — keep as hairline rows (consistent with EditorialIndex), verdict-tagged by trip month window.
6. Region tint: `--ut-region-*` per the 4 fixed region tints.

### C.5 BEST TIME — core verb: UNDERSTAND (visual upgrade only; algorithm/data untouched)

File: `src/app/best-time-to-visit/[slug]/page.tsx`.

1. Keep `ClimateHero` decision-first hero (window + score + signals) unchanged.
2. **`ClimateYear` inserted directly under the hero** (before `RecommendationModule`) — the 12-month trajectory becomes the page's visual thesis; selecting a month syncs with the existing `MonthSelector` state (one shared month state, two views).
3. Keep `MonthSelector` (a11y tablist precedent) and `ClimateTable` (semantic table) exactly.
4. `RecommendationModule` reasoning prose demoted to `<details>` ("Why these months?"); verdict distribution stays visual.
5. FAQ/attribution/related unchanged; R1–R7, NASA data, Best Months logic untouched.

### C.6 HOMEPAGE — the single allowed change

File: `src/app/page.tsx` — move `<PlanLater />` (currently line 79, last section) to between `<HomeHero />` (line 75) and `<DiscoveryStage />` (line 76). Resulting order: Hero → Already know where? (#ready, contains #hero-search) → Discovery (#discover) → Routes → Guides.

Allowed adjustments (and only these):
- `PlanLater` spacing: reduce `py-20 md:py-24` → `py-14 md:py-20` so the fold is not consumed; keep border-t treatment, keep the centered header + `SearchBar` untouched.
- Verify hero `.ut-hero-blend` fade band doesn't clip the section (adjust section top padding if needed — spacing only).
- All anchors keep working: hero CTA "I already know where" → `#ready` (now near-top), "Start exploring" → `#discover` (now second section), all `#hero-search` deep links (Header icon, AI pages, guide CTAs) land near the top — an improvement.
- `PlanLater`/`SearchBar` component internals: **not redesigned**. `src/components/home/*` others: untouched.

---

## PART D — IMPLEMENTATION SEQUENCE (next rounds)

| Step | Work | Depends on |
|---|---|---|
| 1 | `inner-state.ts` adapter + unit tests + verdict tokens + `--ut-region-*` in globals.css | — |
| 2 | `ClimateYear` (shared; used by Destination + Best Time) | 1 |
| 3 | Destination rebuild (NowPanel, CityExplorer, VibeSelector, RegionMiniMap, integration) | 1–2 |
| 4 | Best Time integration (ClimateYear + shared month state + prose demotion) | 2 |
| 5 | Trip refinement (WeatherWindow, JourneySpine enrichment) | 1–2 |
| 6 | Guide rebuild (FieldGuideModules + at-a-glance band) | 1 |
| 7 | Region rebuild (RegionMapExplorer + season band + verdict list) | 1–2 |
| 8 | Home PlanLater move + spacing QA | — |
| 9 | Full audit pass: responsive / performance / a11y / SEO diff / data-integrity grep (no fake data), plus the three free SEO fixes (B.9) | 2–8 |

Each step ships all five acceptance columns below for its pages before the next begins.

---

## PART E — ACCEPTANCE CRITERIA (per-item, not "looks better")

- **Home**: PlanLater visible without scrolling past Hero on 1440×900 and 390×844 → PASS criterion: `#ready` section top within first ~1.5 viewports; anchor `#hero-search` resolves there. Home visual diff otherwise zero.
- **Destination**: visual exploration PASS (map + highlight board + vibe filter all functional); low-text PASS (≤2 sentences before first interactive element); interaction PASS (vibe changes content, highlight changes board+map, month changes ClimateYear readout).
- **Guide**: visual information PASS (6-module field-guide band + instrument panels render from real data); low-text PASS (per-module first-paragraph pattern).
- **Trip**: journey visualization PASS (continuous spine with durations + WeatherWindow band).
- **Region**: discovery interaction PASS (month selection re-colors map + list + readouts from NASA tiers).
- **Best Time**: climate visualization PASS (ClimateYear renders 12 months × 3 metrics from canonical data, keyboard-navigable).
- **SEO**: metadata/JSON-LD/canonical byte-diff = 0 on all five types; collapsed prose present in HTML; semantic table intact.
- **Performance**: SSG retained; +≤15 KB gz client JS per page; no new dependencies; LCP element unchanged; no CLS from instruments.
- **Responsive**: 390/768/1280/1440 checks; scrollable ClimateYear on mobile; map/list sync on stacked layout.
- **Accessibility**: keyboard-complete islands, ARIA states, verdict colors ≥ 4.5:1 for text usage, reduced-motion honored.
- **Data integrity**: NASA coverage assert untouched and passing; no `sunshineHours`/fake weather/fabricated areas anywhere; live weather only via `/api/weather` with labeled fallback.
- **No production API regression**: `/api/weather`, `/api/geocoding`, planner deep links (`?to=…#hero-search`) verified after changes.

---

## PART F — RISKS

1. **145-destination imagery sparsity** (`image|null`): atmosphere-field fallback must carry the visual weight; the spec's hero pattern already exists (destination hero fallback) — extend, don't improvise.
2. **Guide heading variance** (~342 guides, free-form headings): `bucketGuideSection` must be conservative — unmatched headings go to NOTES, never force-fit.
3. **Map correctness**: abstract SVG plot of real coordinates is honest but must label axes/regions minimally to avoid seeming like a real basemap; include mono lat/long readout on selection (adds instrument credibility).
4. **Hydration discipline**: new client islands must follow the existing deterministic-SSG-first-paint pattern (MonthSelector/LocalStateReadout precedent) to avoid React #418 regressions — all month/verdict initial states derivable server-side deterministically.
5. **Home freeze**: the PlanLater move touches the page render order — visual regression test of Hero region (screenshot diff) before/after.

# NASA POWER PRIMARY PRODUCTION MIGRATION REPORT

- migration id: `nasa-power-primary-migration-2026.09.13.v1`
- date: 2026-09-13
- prerequisites: compliance SECOND PASS = PASS · migration readiness = READY ·
  v8.7 internal data freeze = PASS
- **NO COMMIT · NO PUSH · NO DEPLOY** (migration complete, unreleased)

## 1. PRE-MIGRATION SOURCE

- git `main` @ `2873745f96737515a441b829de68d4c2e1ee9343`
- Production Best-time climate authority: **latitude-derived climate-zone templates**
  (`src/lib/climate-pattern.ts`: `getClimateZone` / `getMonthlyClimateNote` /
  `getMonthRecommendation`) → qualitative levels + template sentences.
- The NASA POWER canonical existed only as a pilot artifact.
- Pre-migration hashes recorded (page `d0c7381d…`, climate-pattern `4dd75021…`,
  pilot canonical `63fbc9c1…`). Five other files had **pre-existing** uncommitted
  edits from a prior phase and were not touched by this migration.

## 2. POST-MIGRATION SOURCE

- **NASA POWER canonical static dataset** is the production climate authority:
  `src/data/climate/nasa-power-canonical-v1.json`
  (artifact `nasa-power-canonical-production-v1`, 145 records, self-hash
  `c92bd293cb7932a2…`, file sha256 `fb8d12c6de58d616…`).
- Architecture: NASA POWER build-time acquisition (145-scale retrieval already
  executed and manifested in pilot) → frozen v8.7 validated canonical →
  version-locked production static data module → Best-time SSG.
  **Runtime climate API = 0.**
- Latitude templates **retired from the authority**: the climate functions were
  removed from `climate-pattern.ts` (only geographic/calendar helpers remain:
  hemisphere, season months, month names).

## 3. FILES CHANGED

Production (migration-made):
- `src/data/climate/nasa-power-canonical-v1.json` — NEW production artifact
- `src/data/climate/nasa-canonical.ts` — NEW typed loader; missing record →
  throw → build FAIL; `assertCanonicalCoverage` called from `generateStaticParams`
- `src/components/besttime/besttime-state.ts` — rewritten onto the canonical
  (tempLevel/precipTendency/zone = fixed deterministic buckets over NASA POWER
  values; verdict = R1–R7 tier × canonical `bestMonthsBaseline`)
- `src/components/besttime/besttime-labels.ts` — MonthRow extended with canonical
  numeric fields; verdict meanings reworded to R1–R7 semantics
- `src/components/besttime/ClimateTable.tsx` — real normals in cells + visible
  NASA attribution line
- `src/components/besttime/MonthSelector.tsx` — numeric readouts (high/low °C,
  mm, rain days, daylight) + honest source note
- `src/components/besttime/RecommendationModule.tsx` — reasoning/signals cite
  NASA POWER normals + R1–R7
- `src/components/besttime/SeasonSummary.tsx` — copy updated to NASA POWER normals
- `src/app/best-time-to-visit/[slug]/page.tsx` — metadata/FAQ/CTA/signals read
  canonical Best Months; attribution footer; 145/145 coverage assert
- `src/lib/climate-pattern.ts` — latitude climate authority removed

Pilot-side (allowed):
- `pilot/best-time/scripts/build_production_canonical.py` (deterministic generator
  with freeze-hash abort guard), `migration_gates.py` (gate runner),
  `nasa/migration/migration-gates-result.json`, this report.

Explicitly untouched: destinations/guides/trips pages, `globals.css`,
`Eyebrow.tsx` (pre-existing edits only), `/api/weather`, `/api/geocoding`,
`sitemap.ts`, the frozen pilot canonical (hash re-verified unchanged).

## 4. DATASET VERSION

`nasa-power-canonical-production-v1` ← `pilot-nasa-canonical-145-final-v87`
(methodology `utrip-methodology-2026.09.v8.7`, rules `r1-r7.v4`). Generation is
deterministic: provenance timestamps inherited from the source artifact, so two
generator runs are byte-identical (verified).

## 5. DATASET HASH

| Hash | Value | Status |
| --- | --- | --- |
| coreClimateHash | `7d884fd2334b…` | MATCH vs v8.7 freeze |
| recommendationHash | `28d6a16cd5ab…` | MATCH |
| bestMonthsHash | `417c40eb6246…` | MATCH |
| sourceCanonicalDatasetHash | `9ac50d81a0b2…` | MATCH |
| source file sha256 | `63fbc9c1aa4e…` | MATCH |
| production artifact self-hash | `c92bd293cb79…` | recomputation-verified |

## 6. PROVENANCE

All 15 provenance dimensions survive into production (destinationId, anchor,
sourceFamily `NASA POWER / MERRA-2`, officialProduct, endpoint, parameter,
temporalLevel, timeStandard UTC, aggregationBoundary UTC+00:00, aggregationMethod,
period 1991–2020, grid, selection, methodologyVersion, fieldProvenance).
**Licence metadata upgraded** per compliance v2: `UNVERIFIED` → `PASS` (CC0
default / CC BY 4.0 label rights chain; EU database right = LEGAL REVIEW REQUIRED
residual). Attribution line rendered on every page:
`Climate data source: NASA POWER (NASA Langley Research Center) · Climatology /
Daily / Monthly point APIs · 1991–2020 · accessed 2026-09-13` — factual naming
only; no NASA marks, no endorsement wording, no "NASA-powered".

## 7. NUMERICAL GATE — **PASS**

`migration_gates.py` recomputed all hashes from the **production artifact** (the
real production data path): 145 destinations × 12 months × 4 core fields — every
hash matches the v8.7 validated baseline. No climate number, recommendation or
Best Months changed. (Best Months now displayed come from the canonical
`bestMonthsBaseline` — the R1–R7-derived, freeze-validated claim set — replacing
the old editorial string; the values displayed are the v8.7 values.)

## 8. SCHEMA GATE — **PASS**

145 records × 1740 months: required fields/types/nullability verified;
sunshineHours = null 1740/1740 (legal state); daylightHours numeric (astronomical,
non-NASA); precipDaysGe1mm derived (≥1 mm, UTC day); tempHigh/tempLow semantics
correct (monthly means of daily max/min); 0 missing / 0 ambiguous / 0
contradictory; tiers ∈ {Favourable, Workable, Challenging}; ruleIds ∈ R1–R7.

## 9. DETERMINISM GATE — **PASS**

Artifact generator: byte-identical across runs. Clean production build ×3: all
145 Best-time pages **byte-identical** after excluding only the Next.js `BUILD_ID`
(one occurrence per page in the RSC bootstrap — build metadata, not content).

## 10. RUNTIME ISOLATION — **PASS**

Zero `fetch`/`axios` in besttime components and climate data modules;
`power.larc.nasa.gov` appears only as provenance strings inside the static JSON
artifact; `/api/weather` (Open-Meteo planner) and `/api/geocoding` byte-unchanged.

## 11. PAGE COVERAGE — **PASS**

145/145 Best-time pages prerendered (×3 builds); every page contains the NASA
attribution line; January `tempHighC` spot-verified against the canonical on all
145 pages (0 mismatches); canonical window labels render (e.g. Tokyo → December,
Paris → May – September).

## 12. REGRESSION — **PASS**

Three clean builds × 1132 static pages, zero errors; planner routes, sitemap,
other templates byte-untouched; no behavioural change outside the Best-time
climate data path.

## 13. SECURITY — **PASS**

No credentials/secrets in `src/`; no NetCDF, no raw NASA responses, no pilot raw
files in production (only the validated canonical artifact); pilot data stays
under `pilot/`.

## 14. ROLLBACK PLAN

- Before-authority: `src/lib/climate-pattern.ts` latitude templates (HEAD
  `2873745` file state; hashes recorded).
- After-authority: `src/data/climate/nasa-power-canonical-v1.json`
  (`c92bd293cb79…`).
- Action: revert the besttime chain + page + `climate-pattern.ts` to
  pre-migration state and remove `src/data/climate/`; or data-only rollback by
  regenerating the artifact deterministically / repointing to a prior version.
- Conditions: numerical mismatch vs v8.7 baseline; artifact corruption (sha256
  mismatch); post-deploy structural break in the NASA POWER dataset; legal hold.
- **Not executed this round.**

## 15. REMAINING RISKS

1. EU sui generis database right — LEGAL REVIEW REQUIRED (jurisdiction-specific,
   non-blocking; compliance v2).
2. NASA POWER automation policy — UNVERIFIED quota; operational only (affects
   future re-acquisition runs, not the shipped static artifact).
3. Empty-window destinations (`bestMonthsBaseline = []`) currently = 0
   (branch3 = 0); defensive display exists ("Year-round viable") but the path is
   not exercised by live data.
4. `sunshineHours` remains null (product decision, unchanged, out of scope).

## 16. FINAL DECISION

**PASS** — production migration completed and fully validated (numerical /
schema / determinism / runtime isolation / coverage / regression / security all
PASS). **The migration is NOT released**: no commit, no push, no deploy. Release
awaits an explicit separate instruction.

PRODUCTION SOURCE BEFORE: latitude-derived climate-zone templates
PRODUCTION SOURCE AFTER: NASA POWER canonical static dataset
(v1.6 MB artifact, version-locked, hash-verified)

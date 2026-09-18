# UTRIPLA Best-time Data Pilot — Phase 1 / 1B / 1C（v8.6 状态）

**Status: PILOT ONLY.** Not production data. Nothing in this directory is wired
into the Best-time page, `bestMonths`, `weatherScore`, `climate-pattern.ts`, UI
or sitemap. No commit / no push.

## Purpose

Validate the open items of `BEST-TIME-DATA-STRATEGY-REPORT.md` §20 / §23.4
against real provider responses, and produce the fact base for a T3
production-acceptance decision.

## Provenance of every retrieval

Each raw response records: provider, source family, official product, exact
endpoint, exact parameters, request URL, retrieval timestamp, destinationId,
requested lat/lon, returned grid information, methodologyVersion and
pilotVersion.

| Item | Value |
| --- | --- |
| methodologyVersion | `utrip-methodology-2026.09.v8.6` |
| ruleVersion | `r1-r7.v4` |
| pilotVersion | `pilot-2026.09.11.v1` |
| period | 1991-01-01 .. 2020-12-31 |

## Directory

```
pilot/best-time/
  README.md
  config/destinations.json          145 destinations extracted (read-only) from src/data/destinations*.ts
  raw/nasa/smoke_utc/               4-point smoke test, time-standard=UTC      -> time_standard "UTC"
  raw/nasa/smoke_default/           same 4 points, no time-standard parameter  -> time_standard "LST"
  raw/nasa/utc_145/                 145 Climatology responses, time-standard=UTC (+ manifest)
  raw/nasa/daily_145/               145 Daily responses (T2M_MAX/T2M_MIN), UTC (+ RECONSTRUCTED manifest)
  raw/nasa/monthly_145/             145 Monthly responses (T2M, PRECTOTCORR_SUM), UTC (+ manifest)  [v8.5 new]
  raw/openmeteo/era5_utc/           ERA5-family cross-check (NOT a production source)
                                    INCOMPLETE: 30/145 — Open-Meteo free tier HTTP 429
                                    minutely rate limit; script now backoffs 65s on 429.
  normalized/nasa_utc_145.json      Climatology-level mapping (v8.2 documented mapping — SUPERSEDED)
  normalized/nasa_canonical_145.json v8.4 canonical-semantics artifact (pooled, monthIndex 1-12)
  normalized/nasa_canonical_145_v85.json v8.5 canonical dry-run artifact (PILOT ONLY)  [v8.5 new]
  reports/nasa_daily_semantics_check.json  Parameter-semantics proof
  reports/nasa_v85_validation.json  v8.5 full 145x12 validation metrics  [v8.5 new]
  reports/assertions.json           Machine-checkable assertions (Climatology mapping)
  reports/assertions_canonical.json Machine-checkable assertions (canonical mapping)
  reports/assertions_v85.json       Machine-checkable assertions (v8.5 dataset, 30/30)  [v8.5 new]
  scripts/                          Extraction / retrieval / normalization / assertions / templates
  scripts/copernicus_request_template.py  CDS/ERA5 request template — NO credentials, not executable  [v8.5 new]
```

### Scripts

| Script | Purpose |
| --- | --- |
| `extract_destinations.py` | read-only extraction of 145 destinations from `src/data/destinations*.ts` |
| `nasa_fetch.py` | Climatology retrieval (`--time-standard UTC/LST/none`) |
| `nasa_daily_check.py` | Daily-path cross-check; proves `T2M_MAX_AVG/T2M_MIN_AVG` are monthly extremes |
| `nasa_monthly_fetch.py` | **v8.5 new** — Monthly endpoint retrieval for 145 points (independent T2M / precip proof) |
| `make_daily_manifest.py` | **v8.5 new** — rebuilds `daily_145/_manifest.json` from stored responses |
| `normalize_nasa.py` | Climatology-level normalization (superseded mapping) |
| `normalize_canonical.py` | v8.4 canonical artifact builder |
| `verify_v85.py` | **v8.5 new** — full 145x12 verification + v8.5 canonical dataset |
| `assertions.py` | v8.4 assertions |
| `assertions_v85.py` | **v8.5 new** — 30 machine assertions on the v8.5 dataset |
| `copernicus_request_template.py` | **v8.5 new** — CDS/ERA5 request template (no secrets, refuses to execute) |

## Headline findings

1. `T2M` (Climatology) = 1991–2020 average of calendar-month mean 2m temperature
   → **matches** canonical `tempMeanC`. Verified against the independent Monthly
   endpoint on 145 x 12: n=1740, mean Δ=0.000011, median Δ=0.000000,
   max |Δ|=0.005.
2. `PRECTOTCORR_SUM` (Climatology) = accumulated monthly total → **matches**
   canonical `precipMm`. `PRECTOTCORR` is a daily rate (mm/day) and must not be
   used as a monthly total. Verified on 145 x 12:
   `PRECTOTCORR x mean days in calendar month ≈ PRECTOTCORR_SUM`,
   ratio median 0.999954; for months with >= 20 mm the ratio stays within
   [0.9928, 1.0070]; versus the Monthly endpoint mean Δ=0.000072, max |Δ|=0.005.
3. `T2M_MAX_AVG` / `T2M_MIN_AVG` (Climatology) are the **30-year average of the
   monthly EXTREME** max/min — **not** the mean of daily max/min. Verified
   exactly against the Daily API on 145 × 12 months (1734/1740 and 1729/1740
   exact; all residual deltas ≤ 0.01 rounding).
4. Consequence: the v8.2 documented mapping
   `tempHighC → T2M_MAX_AVG` / `tempLowC → T2M_MIN_AVG` is a **semantic error**.
   It changes the R1–R7 classification of **509 / 1740 months (29.3%)**.
5. Correct NASA path for `tempHighC` / `tempLowC`: Daily API `T2M_MAX` /
   `T2M_MIN` at `time-standard=UTC`, aggregated to calendar-month means over
   1991–2020. Cross-checked against ERA5 (Open-Meteo) on 30 destinations /
   360 month-comparisons: mean Δhigh = −0.18 °C (mean |Δhigh| 0.82),
   mean Δlow = −0.04 °C (mean |Δlow| 1.23).
   Same comparison for the Climatology parameters: Δhigh +4.18 °C
   (max +9.53), Δlow −3.92 °C (min −11.42).
6. Climatology `time-standard` is a **real, effective** parameter: default
   (omitted) = `LST` (4/4); `time-standard=UTC` returns `time_standard: "UTC"`
   (4/4 smoke + 145/145). Daily and Monthly endpoints with explicit UTC also
   return `"UTC"` (145/145). Non-zero deltas vs LST (up to 0.14 °C temperature,
   3.14 mm/month precipitation).
7. Spatial resolution: official header title is
   `NASA/POWER Source Native Resolution Climatology Climatologies`; empirically
   the cell is **0.5° latitude × 0.625° longitude** (MERRA-2 native). It is not
   0.5° × 0.5°.
8. Licensing: NASA POWER commercial / redistribution terms remain
   **UNVERIFIED / LEGAL REVIEW REQUIRED** — no official licence text obtained.
   (An AWS Open Data registry self-statement was located; it is not a licence.)
9. `destinations.ts` contains **no anchor elevation** (145/145 missing; the
   `Airport` type has no elevation/altitude field and the repository holds no
   airport / geonames / elevation dataset) → the `ELEV_MISMATCH_M` (150 m)
   trigger is **NOT EVALUABLE**. No candidate mapping was produced.
10. Copernicus / CDS (the PRIMARY source family) was **not testable**: no
    `~/.cdsapirc`, no `cdsapi` package, no credentials in the environment →
    `ERA5_PRIMARY_TEST = BLOCKED_BY_MISSING_CDS_CREDENTIALS`.
11. ERA5 cross-check coverage is **30/145 (incomplete)** — Open-Meteo free-tier
    HTTP 429. Non-blocking for the gate (Open-Meteo is not a production source),
    but the cross-check is not full-scale.

## v8.5 verification results (`reports/nasa_v85_validation.json`)

| Metric | Value |
| --- | --- |
| destinations | 145 |
| Climatology / Daily / Monthly HTTP 200 | 145 / 145 / 145 |
| months | 1740 |
| missing daily values | 0 (10958 days per point) |
| T2M mean / median / max abs delta | 0.000011 / 0.000000 / 0.005 |
| tempHigh semantic_match (canonical order) | 1679/1740, max delta 0.02 |
| tempLow semantic_match (canonical order) | 1690/1740, max delta 0.02 |
| v8.4 artifact vs pooled aggregation | max delta 0.00 (v8.4 used pooled) |
| precip ratio median / min / max | 0.999954 / 0.790323 / 1.200000 |
| precip max abs residual | 0.904 mm |
| R1–R7 counts | R1=5 R2=16 R3=157 R4=92 R5=484 R6=460 R7=526 |
| R1–R7 unclassified / multiple final | 0 / 0 |
| Best Months branches | branch1=117, branch2=28, branch3=0 |
| assertions (v8.5 dataset) | 30/30 PASS (byte-identical on clean rerun) |
| elevation coverage | 0/145 |

## Defects found in the v8.4 artifacts (fixed in the v8.5 artifact)

1. **`monthIndex` 1–12 instead of 0–11** — `normalized/nasa_canonical_145.json`
   violates the §12.3 contract. The v8.5 artifact uses 0–11 and is locked by the
   assertion `assert monthIndexRange === 0..11`.
2. **Pooled aggregation instead of mean-of-yearly-means** — the v8.4 artifact
   pools all days of a calendar month across 1991–2020, while §6 defines
   `mean over years of (per-year calendar-month mean)`. They differ in February
   (leap-year weighting): 61/145 highs and 50/145 lows differ by 0.01–0.02 °C.
   The v8.5 artifact uses the canonical order.
3. **No manifest for `raw/nasa/daily_145/`** — the 145 Daily responses were
   stored without provenance. `make_daily_manifest.py` reconstructs it from the
   responses themselves; `retrievedAt` stays `null` (never captured) and
   `fileModifiedAt` is reported instead. No value is invented.
4. **Cross-check value provenance** — the strategy §23.0 registers that the
   earlier "−0.23 °C / +0.01 °C" figure is not reproducible from the 30 stored
   raw files (both pooled and canonical aggregation give −0.181 / −0.040).
   The reproducible value is authoritative.

## Open-Meteo cross-check — zone breakdown (ERA5-family, NOT a production source)

Δ = NASA canonical minus Open-Meteo; 30/145 destinations, 360 months.

| Zone | n | mean Δhigh | mean Δlow | mean Δmean | mean Δprecip | mean abs Δprecip |
| --- | --- | --- | --- | --- | --- | --- |
| northern (lat > 23.5) | 240 | −0.163 | −0.210 | −0.333 | +0.68 | 9.22 |
| tropical (|lat| <= 23.5) | 108 | −0.225 | +0.156 | −0.092 | +4.62 | 31.61 |
| southern (lat < −23.5) | 12 | −0.127 | +1.612 | +0.631 | +16.83 | 16.83 |
| **overall** | 360 | **−0.181** | **−0.040** | **−0.229** | **+2.40** | **16.19** |

Reported as-is, not smoothed: the tropical precipitation deviation
(mean |Δ| ≈ 31.6 mm) is a real systematic MERRA-2 vs ERA5 difference. The
southern sample is a single destination and cannot support a conclusion.

## Phase 1B (2026-09-12)

### MonthIndex contract

```text
monthIndex contract = 0..11
```

Evidence (production code, unchanged by this pilot):

| Evidence | Location |
| --- | --- |
| `spring: [2, 3, 4], // Mar-May (index 0-11)` | `src/lib/climate-pattern.ts:18` |
| `winter: [11, 0, 1], // Dec-Feb` | `src/lib/climate-pattern.ts:21` |
| `MONTH_NAMES[0] = "January"` | `src/lib/climate-pattern.ts:31-34` |
| JSDoc "月份 index（0-11）" | `src/lib/climate-pattern.ts:62` |
| `MONTH_ABBR jan:0 .. dec:11` | `src/components/besttime/besttime-state.ts:40-42` |
| `buildMonthRows` -> `index: m` over `length: 12` | `src/components/besttime/besttime-state.ts:146-167` |

```text
strategy (S12.3 0-11) ↔ pilot schema (nasa_canonical_145_v85.json 0-11)
    ↔ recommendation engine ↔ future UI  :  CONSISTENT
contradictions = 0
```

The v8.4 artifact (`nasa_canonical_145.json`) used 1-12 and is recorded as the defect.

### Elevation (candidate)

```text
source       : OurAirports open data — airports.csv (Public Domain; source states
               "no guarantee of accuracy or fitness for use")
sourceURL    : https://davidmegginson.github.io/ourairports-data/airports.csv
fieldMeaning : elevation_ft = airport elevation MSL in feet
conversion   : elevationM = elevation_ft * 0.3048
candidateCoverage : 145/145
exactCoverage     : 135/145
reviewQueue       : 10  (8 ICAO-code conflicts, 2 anchor-coordinate conflicts)
productionWrite   : NONE
```

`pilot/best-time/config/elevation-candidates.json` is a **review artifact**, not a
production value. Note: 8 destinations carry an ICAO code in `destinations.ts` that
disagrees with OurAirports (e.g. bologna `LIPQ` vs `LIPE`), while IATA and
coordinates agree; 2 destinations (ho-chi-minh-city 16.9 km, siem-reap 44.7 km)
have anchor coordinates that do not match the airport.

### Grid-elevation trigger (engineering assessment, not a validation of 150 m)

| Grid source | n | <=150 m | >150 m | median delta | max delta |
| --- | --- | --- | --- | --- | --- |
| MERRA-2 (NASA POWER `geometry.coordinates[2]`) | 145 | 114 | 31 (21.4%) | 46.1 m | 1160.4 m |
| ERA5-family (Open-Meteo `elevation`, cross-check) | 30 | 30 | 0 | 4.9 m | 42.1 m |
| **Copernicus CDS ERA5 / ERA5-Land** | **0** | - | - | - | - |

The strict PRIMARY-family trigger remains **NOT EVALUABLE** without CDS credentials.
The two available grids are proxies only.

### Other Phase 1B findings

- **Copernicus precipitation unit defect**: ERA5 / ERA5-Land *monthly averaged*
  `total_precipitation` is in **m of water per day**; the monthly total requires
  `x 1000 x N_days`. The previous template omitted `x N` (~30x under-estimate).
  Fixed in `copernicus_request_template.py`; strategy S3.3 / S7.2 row B / S19.2
  corrected (blocker B19). v8.5 pilot dataset values are unaffected (NASA path).
- **ERA5-Land cannot replace ERA5**: `derived-era5-land-daily-statistics` omits
  accumulated variables, so daily precipitation (and therefore any >=1 mm day count)
  can never come from ERA5-Land.
- **NASA attribution CONFIRMED**, NASA commercial licence still UNVERIFIED.
- **Production runtime climate API in Best-time: NOT FOUND.** The only runtime
  weather call is `/api/weather` -> Open-Meteo **forecast** (planner path), which
  the Best-time page does not import.

## Gate result

```
STRATEGY v8.6 — INTERNAL METHODOLOGY = PASS
T2  — BLOCKED
T3  — BLOCKED
ELEV_MISMATCH_M — NOT EVALUABLE
ERA5_PRIMARY_TEST — BLOCKED_BY_MISSING_CDS_CREDENTIALS
ELEVATION (candidate 145/145, approved 143/145) — BLOCKED (2 records pending project anchor-coordinate decision)
NASA LICENCE — BLOCKED / LEGAL REVIEW REQUIRED
DATABASE RIGHTS — UNRESOLVED / LEGAL REVIEW REQUIRED
```

## Phase 1C (2026-09-12) — Final Internal Closure

### 1. `precipDaysGe1mm` — Option A adopted (methodology v8.6)

```text
Before (v8.5): nullable optional, canonical value null, provenance UNRESOLVED
               ("no official product; derived count not authorised")
After  (v8.6): APPROVED-DERIVED field
               count(daily precipitation >= 1.0 mm, UTC+00:00 day)
               per calendar month per year -> mean over 1991-2020
Reason : deterministic function of the SAME source family's official daily
         product (not a proxy, no cross-family mixing); ERA5 daily_sum input
         confirmed in the official CDS catalogue ("daily sum is only
         available for the accumulated variables"; total precipitation is an
         accumulated variable); threshold = WMO rain-day convention.
Evidence (NASA fallback path, real data):
         raw/nasa/daily_precip_145/  145/145 HTTP 200, time_standard=UTC,
         10958 valid days per point, 0 missing days
         v8.6 dataset: 1740/1740 months populated
Policy  : derived fields are allowed ONLY if (1) computed solely from
         canonical daily-path input of the same source family, (2) formula
         deterministic and written down, (3) provenance records derived=true
         + thresholdMm + formula, (4) no official-product claim for the count.
```

### 2. `daylightHours` — deterministic astronomical implementation adopted (methodology v8.6)

```text
Before (v8.5): "no vetted implementation adopted" -> canonical value null
After  (v8.6): adopted implementation (formulaVersion noaa-solar-position-2026.09.v1)
               daily  : NOAA General Solar Position Calculations (declination)
                        + sunrise/sunset hour angle at z0 = 90.833 deg
                        (civil convention: +34' refraction +16' upper limb)
               monthly: mean over 1991-2020 of the per-year calendar-month
                        mean of daily duration (equal year weights; leap
                        years exact: 8 leap Februaries of 29 days in 30 years)
               polar  : cos(hour angle) >= 1 -> 0.0 h; <= -1 -> 24.0 h
                        (rovaniemi 66.5648N actually triggers this)
Evidence : values byte-stable on rerun (deterministic, no external data);
           external spot checks match published values
           (London 2000-06-21: 16.638 h vs published 16h38m;
            Singapore 2000-06-21: 12.199 h vs published ~12h12m);
           physical sanity: Singapore 12.04-12.20 h; Sydney phase inverted;
           Rovaniemi Jun 23.84 h / Dec 2.60 h.
Never label as observed data; provenance sourceFamily =
ASTRONOMICAL-CALCULATION (non-climate family, outside source-family rules).
```

### 3. Schema audit v8.6 (`reports/schema-audit-v86.json`)

```text
missing definition            = 0
ambiguous definition          = 0
contradictory nullability     = 0
fields required (non-null)    : monthIndex, tempMeanC, tempHighC, tempLowC,
                                precipMm, precipDaysGe1mm, daylightHours
fields nullable (null legal)  : sunshineHours ONLY (external/product decision)
assertions                    : reports/assertions_v86.json  23/23 PASS
```

### 4. v8.6 dataset regression (`reports/nasa_v86_validation.json`)

```text
compared vs v8.5: tempMeanC / tempHighC / tempLowC / precipMm / ruleId /
                  tier / rawRuleHits / bestMonthsBaseline
differing cells = 0 (byte-identical climate truth)
R1-R7 counts unchanged : 5 / 16 / 157 / 92 / 484 / 460 / 526  (unclassified 0)
Best Months unchanged  : branch1=117, branch2=28, branch3=0
```

### 5. Elevation review — 10/10 classified (`reports/elevation-review-v1c.json`)

```text
source A : OurAirports airports.csv (Public Domain; "no guarantee of accuracy")
source B : independent second source per record (Wikipedia infoboxes citing
           AIP; METAR-TAF / SKYbrary / AirportGuide / ch-aviation),
           retrieved via server-side web search 2026-09-12
result   : 8 x PROJECT_ANCHOR_ERROR -> APPROVED (ICAO field in destinations.ts
           wrong; IATA + coordinates identify the same airport; elevation
           confirmed by source B; ICAO independently resolved per rule)
           rovaniemi EFKT->EFRO, cebu RPVB->RPVM, yogyakarta WIHI->WAHI,
           nha-trang VVNT->VVCR, bologna LIPQ->LIPE, lombok WATB->WADL,
           pattaya VTPH->VTBU, chengdu (RESOLVED_SAME_AIRPORT, 2.25 km is a
           reference-point convention difference)
         : 2 x PROJECT_ANCHOR_ERROR -> NOT APPROVED, pending project anchor
           decision: ho-chi-minh-city (anchor longitude points at the city
           centre, 16.92 km from SGN/VVTS) and siem-reap (anchor coords are
           the CLOSED old airport site; new SAI airport ICAO is VDSA, not
           VDSR; 44.65 km). The decision also changes which climate grid cell
           represents the destination -> production-migration scope.
coverage : candidate 145/145, approved 143/145
ICAO corrections identified but NOT written to src/data (production untouched).
```

### 6. Copernicus request/unit audit (`reports/copernicus-unit-audit.json`)

```text
19/19 PASS, request-level (data-level still blocked by CDS credentials)
- precipitation conversion unit tests incl. month lengths:
  0.002 m/day x 1000 x {31,28,29,30,29,29} days (Jan 1991, Feb 1991,
  Feb 1992/2000/2020, Apr 1991) — never a fixed 30
- area ordering N/W/S/E; dataset IDs; time_zone=utc+00:00;
  ERA5 daily_sum available for accumulated variables only;
  ERA5-Land daily statistics omit accumulated variables (cannot replace ERA5);
  template import is network-free; request builders structurally valid
- template precipDaysGe1mm plan updated to APPROVED-DERIVED (v8.6)
```

### 7. Production runtime check (re-verified)

```text
runtime climate/weather calls in src/: /api/weather (Open-Meteo FORECAST,
planner path) and /api/geocoding only. Best-time page imports neither.
No NASA POWER / CDS / archive API in any runtime path.
src/ modifications this phase = 0; commit = NO; push = NO.
```

### Phase 1C gate

```text
INTERNAL METHODOLOGY (v8.6) — PASS
B NASA fallback technical path — PASS
C external dependencies — BLOCKED (CDS credentials, NASA licence,
  database rights, 2 elevation anchor decisions, sunshineHours product call)
T2 — BLOCKED      T3 — BLOCKED
```

## Phase 1C Final Evidence Audit (2026-09-12, second pass)

Independent recount from the raw JSONs (not from summaries); one documentation
error found and corrected; no mathematical definition changed (version stays v8.6).

### Elevation count reconciliation (`reports/phase1c-final-audit.json`)

```text
raw conflict records  = 11  (8 icaoConflict flags + 3 distance>2km flags)
unique destinations   = 10
ICAO-only             = 7   (rovaniemi, cebu, yogyakarta, nha-trang, bologna, lombok, pattaya)
coordinate-only       = 2   (chengdu, ho-chi-minh-city)
both                  = 1   (siem-reap — ONE record, single root cause: 2023 relocation;
                             counted once)
other                 = 0
arithmetic            = 7 + 2 + 1 + 0 = 10  ✔ consistent
```

The earlier "8 ICAO + 2 coordinate mismatches" handoff summary was a SUMMARY
error (siem-reap double-counted, chengdu omitted). The underlying
`elevation-source-audit.json` always contained all 10 records incl. chengdu
(reason: "anchor-to-source distance 2.254 km > 2 km"). The Phase 1C review
correctly covered all 10; no script was adjusted to make numbers fit.

### Source authority re-classification (`reports/elevation-review-v1c.json`, revised)

```text
TIER 1 (official operator/AIP)      : operator-site values for nha-trang, bologna, lombok, pattaya
TIER 2 (authoritative aviation DB)  : ch-aviation; WAHI AIP chart (tertiary-hosted copy)
TIER 3 (reputable secondary DB)     : OurAirports (source A), METAR-TAF, SKYbrary, SkyVector, AirportGuide
TIER 4 (Wikipedia / search snippets): recorded as "secondary page citing primary source" — never as AIP itself

coverage:
  candidate coverage              = 145/145 (TIER 3 source)
  source-reviewed coverage        = 145/145
  secondary-verified coverage     = 10/145 flagged records carry an independent 2nd source
                                    (135/145 exact records remain single-source)
  SECONDARY-VERIFIED approved     = 143/145 (was mislabeled "APPROVED" in the first pass)
  AUTHORITATIVE approved          =   0/145 (no Tier-1 primary text retrieved)
  blocked                         =   2/145 (ho-chi-minh-city, siem-reap — anchor decision)
```

### Anchor correction candidates (`reports/anchor-correction-candidates.json`)

`src/data/destinations.ts` NOT modified. Candidates only. NASA probe
(`reports/anchor-impact-probe.json`, real Climatology responses at the proposed
coords):

```text
ho-chi-minh-city  lon 106.8069 -> 106.652 : climate values UNCHANGED (delta 0.0)
siem-reap         full anchor move        : grid elevation 36.86 -> 70.78 m,
                    T2M Jul -0.16 C, precip Jul +6.84 mm
                    -> July precip 198.55 -> 205.39 mm CROSSES the R3 >= 200 mm
                       threshold (Workable -> Challenging) — anchor correction is
                       PRODUCTION-DATA-AFFECTING; full re-bake + re-derivation required
```

### Audit re-verification

```text
assertions_v86            23/23 PASS   (re-run)
copernicus unit audit     19/19 PASS   (re-run; month-length unit tests unchanged)
v86_final rebuild         0 differences vs v86 (all fields, 145x12)
core climate vs v8.5      0 differences (tempMean/tempHigh/tempLow/precipMm)
R1-R7                     5/16/157/92/484/460/526 unchanged; unclassified 0; duplicates 0
Best Months               branch1=117 branch2=28 branch3=0 unchanged
precipDaysGe1mm<=precipMm 0 violations across all 1740 months (recounted)
daylight determinism      PASS (byte-stable; Tokyo 14h34m, Denver 14h59m,
                          Sydney 14h25m, Rovaniemi 24h00m/2h10m vs published values)
daylight provenance       corrected: officialProduct=null,
                          sourceFamily="astronomical-derived (non-climate)"
schema-audit-v86-final    missing=0 ambiguous=0 contradictory=0
external-dependency-final BLOCKED_EXTERNAL x6, NOT_REQUIRED x1 (Open-Meteo pricing)
version decision          stays v8.6 (evidence clarification only; no math change)
```

### Final gate

```text
INTERNAL METHODOLOGY — FULLY PASSED
T2 — BLOCKED      T3 — BLOCKED
```

## Production Data Decision Gate (2026-09-12, third pass)

### Frozen baseline (`reports/production-decision-baseline.json`)

```text
canonicalClimateCore sha256 = 7edfaa493e113cf141956b24bcdb05268a2322cfdb7c688233bc1f1b53ce7d6a
  (tempMeanC/tempHighC/tempLowC/precipMm, 1740 months, v86_final)
recommendation sha256       = see baseline file (ruleId/tier/bestMonthsBaseline, 145 records)
strategy + dataset file hashes recorded; R1-R7 = 5/16/157/92/484/460/526; branches 117/28/0
```

### Anchor decision (full 12-month simulations, `normalized/anchor-correction-simulated-*.json`)

```text
ho-chi-minh-city (proposed 106.8069 -> 106.652):
  climate value cells changed = 0      classification changed = 0
  Best Months unchanged = [11]         -> DATA-INTEGRITY-ONLY correction
  re-fetch NASA required = NO (values identical under current grid)
siem-reap (full anchor move to new SAI/VDSA site):
  climate value cells changed = 59     classification changed = monthIndex 6 and 11
  July   : R5 -> R3  (precip 198.55 -> 205.39 mm crosses R3 >= 200; Workable -> Challenging)
  Dec    : R4 -> R7  (-> Favourable)
  Best Months [10] -> [10, 11]         -> PRODUCTION-DATA-AFFECTING
  full NASA retrieval for the new anchor archived in raw/nasa/anchor_sim/siemreap-proposed/
  re-bake + full re-derivation required after user approval
```

`reports/anchor-final-decision.json` = **USER DECISION REQUIRED** for both;
nothing is approved production data; nothing written to `src/data`.

### Airport identity corrections (`reports/airport-identity-corrections.json`)

7 ICAO-only items read directly from the original audit JSON
(bologna LIPE, cebu RPVM, lombok WADL, nha-trang VVCR, pattaya VTBU,
rovaniemi EFRO, yogyakarta WAHI): climate impact = none, metadata-only.
siem-reap excluded (belongs to the spatial anchor case); chengdu has no ICAO conflict.

### Elevation acceptance contract (decided by the strategy text, not preference)

Strategy §19.2 prerequisite literally requires "可审查的 **authoritative**
elevation source". Therefore Tier-1 confirmation — OR a user amendment of that
sentence — remains a **MUST FIX BEFORE T3**; SECONDARY-VERIFIED 143/145 does
not satisfy the literal wording. `AUTHORITATIVE = 0/145` stands.

### sunshineHours reclassified

Schema-nullable by contract, canonical null legal, not consumed by R1-R7 or
Best Months, absent from the T3 checklist → **NOT A T2/T3 BLOCKER**
(product decision deferred; no Open-Meteo pricing research needed).

### Copernicus readiness

```text
cdsapi / ~/.cdsapirc / CDSAPI_URL / CDSAPI_KEY: ALL ABSENT -> ERA5_PRIMARY = BLOCKED
templates complete + dry-run verified (19/19 PASS re-run)
CDS onboarding for the user (when ready):
  1. register at https://cds.climate.copernicus.eu (accept both ERA5 dataset licences in the profile)
  2. profile page -> API key
  3. pip install cdsapi
  4. write ~/.cdsapirc:
       url: https://cds.climate.copernicus.eu/api
       key: <API key>
No secret needs to be shared with the agent; the agent only needs to verify
credentials are present in the environment before starting the real retrieval.
```

### NASA licence search (evidence added, blocker unchanged)

New lead: NASA Earthdata "Data Use and Citation Guidance" (policy page,
generally permits commercial use + redistribution with acknowledgment) —
recorded in `reports/nasa-licence-search-2026-09-12.json`. Still NOT a
POWER-specific formal licence instrument → commercial/redistribution remain
**UNVERIFIED / BLOCKED_EXTERNAL**; closable by written confirmation from
`larc-power-project@mail.nasa.gov` or by user legal review.

### Gate result

```text
INTERNAL METHODOLOGY — FULLY PASSED (assertions 23/23 + decision-gate 8/8 + anchor-impact 12/12)
NASA FALLBACK TECHNICAL — PASS
ANCHOR DECISION — USER DECISION REQUIRED (2 cases; simulations complete)
ERA5 PRIMARY — BLOCKED (credentials absent; templates ready 19/19)
LEGAL — BLOCKED (NASA licence UNVERIFIED; database rights legal review)
T2 — BLOCKED      T3 — BLOCKED
```

## T3 Preflight + External Closure (2026-09-12, fourth pass)

### Authoritative elevation — Tier-1 acquisition STARTED (`reports/elevation-authority-ledger.json`)

```text
source acquired : FAA NFDC 28-Day NASR Subscription, APT_BASE.csv, EFF 2026-09-03
                  (TIER 1 — national aviation authority; raw archived with sha256)
coverage        = AUTHORITATIVE 17/145 (all US destinations: JFK LAS AUS SFO BOS LAX MIA
                  MCO ORD IAD SEA SAN MSY PHL DEN BNA HNL)
cross-check     : max |FAA - OurAirports| = 0.9 m (rounding); max anchor distance 0.896 km
not force-filled: the remaining 128 non-US records keep authoritativeElevationM = null
                  (non-US AIPs are PDF-based and not batch-accessible here) — secondary
                  data was NOT upgraded
```

### Contract extraction (`reports/t3-contract-extract.json`)

§19.2 literal text still requires an "authoritative elevation source"; the term is
UNDEFINED in the strategy and the user's own Phase 1C acceptance rule says only
"traceable source". The tension is surfaced as **Decision C** (strict reading
governs: AUTHORITATIVE 17/145 → T3 elevation gate = BLOCKED). Extraction
contradictions = 0.

### Anchor proposals (`reports/{hcmc,siem-reap}-final-anchor-proposal.json`)

Both USER_DECISION_REQUIRED. Full-145 hash proof (`t3-anchor-impact-summary.json`):
HCMC → core climate hash unchanged, recommendation hash unchanged (metadata-only);
siem-reap → both hashes changed + Best Months [10]→[10,11] (production-data-affecting).

### Other closures

```text
NASA licence      : no POWER-specific formal instrument exists (final search);
                    escalation channel recorded (larc-power-project@mail.nasa.gov);
                    agent does NOT send email or make legal judgements
database rights   : final matrix (NASA / Copernicus / OurAirports); OurAirports is
                    removable from production dependencies once Tier-1 coverage completes
sunshineHours     : no mandatory requirement found anywhere in v8.6 -> NOT A BLOCKER (final)
Copernicus        : credential preflight recorded (all absent) -> ERA5_PRIMARY BLOCKED;
                    request readiness PASS (19/19 re-run)
```

### Preflight assertions

```text
t3-preflight assertions 14/14 PASS; baseline hashes reproduce exactly;
canonical unexpected nulls = 0 (sunshineHours only, 1740);
R1-R7 stable; daylight 6-city regression PASS + deterministic;
source-family 145/145 single family; copernicus 19/19; assertions_v86 23/23
```

### Gate result (separated states)

```text
INTERNAL = PASS   NASA FALLBACK = PASS   ERA5 PRIMARY = BLOCKED
ELEVATION = PARTIALLY CLOSED (17/145 AUTHORITATIVE; gate BLOCKED pending Decision C + coverage)
ANCHOR = USER DECISION REQUIRED          LEGAL = BLOCKED
T2 = BLOCKED      T3 = BLOCKED
```

## Elevation Contract Decision Analysis (2026-09-12, fifth pass)

Fact base for the user's Decision C — the agent does NOT choose an option and
v8.6 stays untouched. All artifacts under `reports/`:

```text
elevation source distribution (raw recount, sum = 145):
  Tier-1 authoritative            =  17  (FAA NFDC, US)
  Tier-3 single-source (exact)    = 118
  Tier-3 + independent corrob.    =   8
  anchor-pending                  =   2  (hcmc, siem-reap)

OPTION 1 (keep authoritative hard gate):
  remaining acquisition scope = 128 airports / 49 countries
  realistically obtainable now = 17/145; NO bulk machine-readable Tier-1
  product exists for the other countries (probe: 7/16 AIP portals reachable,
  all PDF eAIP; China CAAC not public; Japan MLIT unreachable; Airservices
  products paid). Remaining work = per-country PDF AD-2 parsing projects,
  weeks+, possibly unclosable for some countries from free public sources.

OPTION 2 (revise contract; v8.7-DRAFT written, NOT applied):
  full source-acceptance framework designed (hierarchy, verification matrix,
  conflict thresholds, approval statuses, anchor separation) — see
  option2-source-acceptance-framework.json
  simulated coverage from data: APPROVED now = 25/145 (17 Tier-1 + 8 verified);
  118 need ONE corroborating source each (method proven on the 10 review
  items) -> achievable 143/145; 2 stay anchor-gated.
  NOT a blanket "OurAirports accepted" — Tier-3 alone is insufficient.

Siem Reap impact table (12 months, reports/siem-reap-impact-table.json):
  July: precip 198.55 -> 205.39 mm, rule R5 -> R3 (Workable -> Challenging)
        [correction: old rule is R5, not R4 — tempHigh 30.55 < 32 so R4 never fired]
  December: R4 -> R7 (Workable -> Favourable)
  Best Months: [10] -> [10, 11]
HCMC reconfirmed: climate numerical impact = NO; anchor identity fix = YES.

decision-c assertions: 12/12 PASS
```

`USER DECISIONS REQUIRED: A (hcmc anchor) / B (siem-reap anchor) / C (Option 1 vs Option 2)`.
CDS credentials still absent (`ERA5_PRIMARY = BLOCKED`); NASA licence and
database rights unchanged (BLOCKED_EXTERNAL); sunshineHours NOT A BLOCKER.

## Phase 2 — v8.7 Contract Revision + Corroboration Campaign (2026-09-12, sixth pass)

User decisions received: **A = YES, B = YES, C = Option 2**. methodologyVersion
is now `utrip-methodology-2026.09.v8.7` (ruleVersion unchanged: r1-r7.v4).

### v8.7 Elevation Source Acceptance Contract (§19.2 rewritten)

```text
Tier 1 (authority/AIP/operator/official DB) : single-source approval permitted
Tier 2 (authoritative aviation DB)          : single-source approval permitted
Tier 3 (traceable open dataset)             : ONE independent corroboration required (delta <= 10 m)
Tier 4 (generic secondary / OSM / Wikipedia) : NEVER sufficient alone; corroboration only
Conflicts  : <=5 m record | 5-20 m accept+flag | >20 m or identity conflict -> reject
             averaging FORBIDDEN; Tier-3 -> Tier-1 upgrades FORBIDDEN
PRODUCTION_APPROVED = identity resolved + coordinate consistent + datum/unit known +
                      traceable source + tier satisfies acceptance + reviewed + conflicts resolved
```

### Corroboration campaign — 145/145 production-approved

```text
elevation-v87-final-ledger.json:
  APPROVED-TIER1            =  17  (FAA NFDC NASR, EFF 2026-09-03)
  APPROVED-VERIFIED         = 123  (OSM Overpass ele corroboration 118 + pass-2 2 +
                                    Phase 1C review sources 8 + web search incl.
                                    yangon eAIP (Tier 1) & phu-quoc operator site (Tier 1))
  APPROVED-VERIFIED + FLAG  =   5  (5-20 m band: banff, cologne, frankfurt, turin, goa)
  pending / blocked         =   0
conflict resolution recorded: dubrovnik OSM outlier (125.88, delta -34.7) REJECTED,
  replaced by five consistent sources (527 ft); never averaged.
new finding registered: phnom-penh (VDPP) replaced by KTI/VDTI on 2025-09-09 —
  future anchor decision, NOT part of A/B; elevation approval unaffected.
```

### Anchor corrections applied (pilot only)

```text
Decision A ho-chi-minh-city : lon 106.8069 -> 106.652 — climate/recommendation/BM impact = 0
Decision B siem-reap        : -> SAI/VDSA (13.36974, 104.223831) — full re-bake:
  59 climate cells changed; July R5->R3 (198.55 -> 205.39 mm);
  December R4->R7; Best Months [10] -> [10, 11] (Oct was already Favourable in v86)
v87-vs-v86-diff.json: unexplained changes = 0; the 143 unmodified destinations are
  field-by-field identical.
R1-R7 (1740 months, recomputed): 5/16/158/91/483/460/527 — delta exactly
  {R3+1, R4-1, R5-1, R7+1} from the two siem-reap month changes; unclassified 0.
Best Months branches: 117/28/0.
```

### ELEV_MISMATCH_M — first time evaluable

```text
abs(NASA grid elevation - approved anchor elevation), 145/145:
  <= 150 m : 114     > 150 m : 31  (provisional engineering trigger, unchanged)
  ERA5/Land grid comparison still requires CDS credentials.
```

### Audits

```text
phase2-assertions 21/21 PASS (incl. double rebuild determinism — byte-identical
  excluding timestamps); copernicus unit audit 19/19; assertions_v86 23/23;
  schema-audit-v87 missing/ambiguous/contradictory = 0 (sunshineHours only null);
  source-family 145/145 single family; v8.7 contract consistency scan:
  "authoritative mandatory" remains ONLY in historical sections + meta-references.
```

### Gate (separated states)

```text
INTERNAL v8.7 CONTRACT = FULLY PASSED      ELEVATION = PASS (145/145)
NASA FALLBACK = PASS                        ANCHOR = PASS (A/B applied, pilot only)
ERA5 PRIMARY = BLOCKED (credentials)        LEGAL = BLOCKED (NASA licence, DB rights)
T2 = BLOCKED                                T3 = BLOCKED
remaining T3 blockers: CDS credentials, NASA POWER formal licence, database rights

## Phnom Penh Anchor Integrity Audit (2026-09-12, seventh pass — CDS/ERA5 frozen)

New legacy-airport finding investigated to factual closure (PILOT ONLY):

```text
current project anchor : PNH / VDPP (11.5466, 104.8441) = OLD airport site
                         (0.07 km from published VDPP ARP; 22.39 km from VDTI)
old airport status     : CLOSED — last flights 2025-09-08 23:59; closed 2025-09-09
                         00:01; all flights transferred (Air Cambodia / Cathay Pacific /
                         Vietnam Airlines notices + Wikipedia)
new airport            : Techo International KTI / VDTI (11.36, 104.9213), ops from
                         2025-09-09; elevation 20 ft / 6.1 m MSL (official operator site
                         Tier 1 + METAR-TAF + OSM 7 m corroborated; the "4000 m" figure
                         on phnompenhairport.com is the runway length — discarded)
NASA simulation        : full Climatology+Daily retrieval at proposed anchor (UTC);
                         grid elevation 9.54 -> 9.54; observed climate (tempMean/High/
                         Low, precipMm, precipDays) BYTE-IDENTICAL across 12 months;
                         R1-R7 unchanged; Best Months unchanged [10,11];
                         ONLY daylightHours shifts ±0.01 h in 8 months (astronomical
                         function of the 0.19° latitude change)
VERDICT                : METADATA-ONLY IMPACT
                         (identity correction; observed climate unchanged; note: a
                         future re-bake changes 8 daylightHours cells by 0.01 h, so
                         hashes will move)
status                 : CORRECTION PROPOSAL - USER DECISION REQUIRED (new decision,
                         separate from approved A/B); production untouched
artifacts              : reports/phnom-penh-anchor-review.json,
                         reports/phnom-penh-anchor-correction-proposal.json,
                         reports/phnom-penh-assertions.json (12/12 PASS),
                         normalized/anchor-correction-simulated-phnom-penh.json,
                         raw/nasa/anchor_sim/phnompenh-proposed/
```

## Global Legacy Airport / Anchor Integrity Sweep (2026-09-12, eighth pass)

All 145 destination anchors re-inventoried directly from `src/data/destinations*.ts`
(`config/anchor-inventory-v87.json`; 145/145 paired, 0 duplicates, no reliance on
prior snapshots). Detection patterns A–F applied; 8 candidates verified with
Tier 1–3 evidence (no Tier-4-only approvals, no guessing):

```text
verified candidates (all CURRENT AIRPORT -> NO ISSUE):
  chengdu     CTU operational (dual-airport with TFU since 2021; Cathay moves BACK to CTU 2026-07)
  goa         GOI operational (Mopa GOX 2022 took most traffic; no closure plan)
  mexico-city MEX operational & primary (NLU/AIFA is secondary since 2022)
  mumbai      BOM operational (NMI opened 2025-12-25; partial shift from 2026-10)
  beijing     PEK operational (dual-airport with PKX since 2019; 100M combined 2025)
  berlin      project anchor = BER/EDDB = current airport (TXL closed 2020-11) — pre-migrated
  istanbul    project anchor = IST/LTFM = current airport (Atatürk closed 2019) — pre-migrated
confirmed legacy airports = 3 (hcmc A-approved+applied, siem-reap B-approved+applied,
  phnom-penh PROPOSAL PENDING user decision — referenced, not recomputed)
inventory: 3 confirmed legacy + 142 no-issue = 145; metadata-only/production-data-
  affecting/ambiguous OUTSTANDING = 0; new NASA simulations required = 0
legacy-inventory-assertions.json: 10/10 PASS
artifacts: reports/legacy-airport-impact-summary.json, legacy-airport-candidates.json,
  legacy-airport-correction-proposals.json, legacy-inventory-assertions.json
```

## Decision D Applied — v8.7 Internal Data Freeze (2026-09-12, ninth pass)

User approved **Decision D: phnom-penh anchor correction = YES**. Applied to the
PILOT canonical dataset only:

```text
anchor:  PNH/VDPP (11.5466, 104.8441) -> KTI/VDTI "Techo International Airport"
         (11.36, 104.9213); elevation 12.2 -> 6.1 m (Tier 1 operator source)
raw reuse: raw/nasa/anchor_sim/phnompenh-proposed/ verified complete
         (UTC; 10958 valid days per daily parameter; 12 month keys present)
verification:
  observed climate (tempMean/High/Low, precipMm, precipDays) = 60/60 cells UNCHANGED
  R1-R7 (12 months recomputed) = 0 classification changes
  Best Months = [10, 11] unchanged
  daylightHours = 8 cells ±0.01 h (astronomical; NOT a climate data change)
hashes (pre-D vs post-D):
  coreClimateHash UNCHANGED | recommendationHash UNCHANGED | bestMonthsHash UNCHANGED
  anchorHash CHANGED | elevationHash CHANGED — honestly NOT "dataset completely unchanged"
full dataset: 145x12 recomputed — R1-R7 = 5/16/158/91/483/460/527 (unclassified 0,
  duplicates 0); Best Months 117/28/0; unexplained changes 0
ELEV_MISMATCH_M recomputed post-D: 114 <= 150 m / 31 > 150 m (phnom-penh delta 3.4 m)
anchor integrity: 145/145 PASS — 3 corrections applied (A/B/D), 0 unresolved legacy
audits: source-family 145/145 single family; schema missing/ambiguous/contradictory
  = 0; provenance complete incl. anchorCorrection block (old/new identity, decision,
  evidence separation: airport identity vs climate data vs astronomical);
  deterministic double rebuild byte-identical; runtime climate API refs in
  Best-time = 0
FREEZE: reports/internal-data-freeze-v87.json — INTERNAL PILOT DATA FREEZE COMPLETE
  (not a production release). T2/T3 remain BLOCKED (external only).
```
```

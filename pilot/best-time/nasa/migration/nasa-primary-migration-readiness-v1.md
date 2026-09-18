# NASA POWER PRIMARY MIGRATION READINESS

- gate id: `nasa-power-primary-migration-gate-2026.09.13.v1`
- companion matrix: `nasa-primary-migration-readiness-v1.json`
- prerequisites: compliance SECOND PASS (PRIMARY USAGE = PASS, OVERALL = PASS) + v8.7 Internal
  Data Freeze (anchor/elevation/schema/R1–R7/Best Months/determinism = PASS)
- this gate performs **no migration**. It is the decision gate only.

## 1. Current Production Source

**CURRENT PRODUCTION SOURCE = latitude-derived climate-zone templates.**
The production Best-time pages (`src/app/best-time-to-visit/[slug]/page.tsx`) consume
`src/lib/climate-pattern.ts` — qualitative climate zones, precipitation tendencies and
template sentences synthesized from the airport latitude. **Production does not use NASA
POWER and does not use the pilot canonical dataset.**

- CURRENT PILOT SOURCE = NASA POWER (Climatology/Daily/Monthly point APIs, 145 anchors,
  1991–2020, UTC)
- RUNTIME CLIMATE API = 0 (`/api/weather` is the Open-Meteo planner route, isolated;
  no `power.larc.nasa.gov` reference exists anywhere in `src/`)

## 2. Proposed Production Source

NASA POWER **promoted from FALLBACK to PRIMARY**:

| Role | Source | Status |
| --- | --- | --- |
| PRIMARY | NASA POWER — Climatology/Daily/Monthly point APIs, build-time acquisition | promoted by this gate |
| SECONDARY | none enabled at promotion time | no runtime fallback, no silent switch |
| SUSPENDED | Copernicus ERA5 / CDS | route **retained, not deleted** — see below |

Copernicus disposition (operational reason, not legal): the CDS route requires credentials +
cdsapi client + a queued batch-download pipeline with hours-to-days latency, which does not
match the product requirement of a self-contained, keyless, deterministic build-time
acquisition. All Copernicus audit/history (ERA5 pilot, schema corrections F-1/F-2, pre-flight
report) is retained in full. **"Legally not allowed" is explicitly NOT the reason** — the
Copernicus licence was never found deficient.

## 3. Architecture

```
NASA POWER REST API (acquisition layer ONLY, build-time)
  → HTTPS GET, JSON, no key
  → throttle + retry + sha256 sidecars + manifest cache
  → normalization (hash-verified cache only, no network)
  → aggregation (monthly → 1991–2020 normals; derived fields)
  → validation (schema + range + semantics + completeness)
  → canonical static dataset (versioned, hash-locked)
  → R1–R7 classification → Best Months
  → SSG pages (static data only)
```

Hard rules: NASA POWER is the acquisition layer only; the canonical dataset remains a static,
versioned, auditable artifact; production pages **never** call NASA POWER at runtime.

## 4. API Contract

| # | Question | Answer |
| --- | --- | --- |
| A | Direct HTTPS GET | Yes |
| B | JSON | Yes (`format=JSON`) |
| C | API key | No (documented + live-proven) |
| D | Retry | exponential backoff 30/60/120/300 s, max 5 attempts, then **abort build** — never skip an anchor |
| E | Rate limiting | sequential dispatch, ≥ 1 s spacing; documented ≤ 20-param/point limit respected |
| F | Cache | raw + metadata sidecar (URL, params, timestamp, sha256); cache hit = identical parameter set + sha256 verified |
| G | Duplicate avoidance | manifest-driven; canonicalized parameter-set comparison |
| H | Request logging | endpoint + full parameters + community + time-standard + span + timestamp + destinationId |
| I | Response hash | sha256 at acquisition; re-verified before any normalization |
| J | Deterministic build | normalization reads only hash-verified cache; no network in normalize phase; sort_keys output |
| K | API failure | build FAIL/BLOCKED; previous validated canonical retained; no partial dataset; no deploy |
| L | Stale canonical fallback | only as retain-previous-validated-artifact on build failure (whole-dataset version lock); never partial/mixed-source |

## 5. 145-Destination Feasibility

| Batch | Endpoint | Parameters | Count |
| --- | --- | --- | --- |
| climatology | `api/temporal/climatology/point` | T2M, T2M_MAX_AVG, T2M_MIN_AVG, PRECTOTCORR_SUM, PRECTOTCORR (5 ≤ 20 limit) | 145 |
| daily-temp | `api/temporal/daily/point` | T2M_MAX, T2M_MIN (1991–2020, UTC) | 145 |
| monthly | `api/temporal/monthly/point` | T2M, PRECTOTCORR_SUM (1991–2020, UTC) | 145 |
| daily-precip | `api/temporal/daily/point` | PRECTOTCORR (1991–2020, UTC) | 145 |

**Total: 580 requests, 3 endpoints, max 5 parameters/request, ~584+ cache objects.**
Feasibility is **demonstrated, not projected**: all four batches were already fully executed
at 145-anchor scale during the pilot (manifests `raw/nasa/utc_145`, `daily_145`,
`monthly_145`, `daily_precip_145`).

AUTOMATION POLICY = UNVERIFIED (no published quota; HTTP 429 documented). Per the gate rule
this is **not upgraded to a blocker**: request feasibility is demonstrated by the completed
145-scale retrieval, the gap is an external NASA-controlled publication state, and it is a
quota/operational matter — explicitly **not a license failure** (license = PASS).

## 6. Canonical Data Compatibility

All 15 contract dimensions verified present in every record (15/15 PASS):
destination identity, anchor (elevation production-approved), sourceFamily
(`NASA POWER / MERRA-2`), officialProduct (Climatology/Daily API), endpoint (full URL),
parameter, temporalLevel, timeStandard (UTC), aggregationBoundary (UTC+00:00),
aggregationMethod (explicit per field), period (1991–2020), grid (returned point +
resolution), selection, methodologyVersion, fieldProvenance (per-field block).

Field classification (no classes conflated):

| Field | Class | Source |
| --- | --- | --- |
| tempMeanC | NASA official | Climatology `T2M` |
| tempHighC | NASA official-derived | Daily `T2M_MAX` (UTC) → monthly mean → 30-yr |
| tempLowC | NASA official-derived | Daily `T2M_MIN` (UTC) → monthly mean → 30-yr |
| precipMm | NASA official-derived | Monthly `PRECTOTCORR_SUM` → mm/month → 30-yr |
| precipDaysGe1mm | NASA-derived (v8.6 Option A) | count(daily `PRECTOTCORR` ≥ 1.0 mm, UTC) → 30-yr |
| sunshineHours | nullable | null 1740/1740 (legal null, unchanged) |
| daylightHours | astronomical-derived | UTRIPLA computation — **not NASA data** (1740/1740 populated) |

## 7. Numerical Reproducibility

Pipeline identity is **proven, not copied**: fieldProvenance endpoints are byte-identical to
the batch manifest endpoints; the same pilot scripts produced the v8.7 canonical; freeze
determinism = double rebuild byte-identical. In this gate all four hashes were **independently
recomputed** from the canonical artifact and matched the freeze report:

| Hash | Recomputed | Freeze | |
| --- | --- | --- | --- |
| coreClimateHash | 7d884fd2… | 7d884fd2… | **MATCH** |
| recommendationHash | 28d6a16c… | 28d6a16c… | **MATCH** |
| bestMonthsHash | 417c40eb… | 417c40eb… | **MATCH** |
| canonicalDatasetHash | 9ac50d81… | 9ac50d81… | **MATCH** |

Coverage: 145 destinations × 12 months × 4 core fields (1740 months) + recommendation +
Best Months.

## 8. Provenance

Per-field provenance is complete (provider → sourceFamily → officialProduct → endpoint →
parameter → temporalLevel → timeStandard → aggregation → period → grid → selection →
versions). One migration-time action recorded: the frozen pilot canonical's
`source.licence` string ("UNVERIFIED / LEGAL REVIEW REQUIRED") is **stale** — superseded by
compliance v2 PASS. The frozen artifact is not edited; the production canonical must carry
updated licence/attribution metadata when the migration phase builds it.

## 9. Legal / Attribution

- Rights chain closed (compliance v2): commercial use, modification, derived products,
  commercial display, direct API use = PASS.
- Required provenance expression: `Climate data source: NASA POWER (NASA Langley Research
  Center)` + official data-reference template (service name, version, access date).
- Branding: no NASA insignia/logotype; no endorsement implication; no "NASA-powered"
  marketing phrasing.
- EU database right: LEGAL REVIEW REQUIRED, jurisdiction-specific residual, non-blocking
  (separate legal concept; never merged into the copyright analysis).

## 10. Failure Safety

Acquisition failure → build FAIL/BLOCKED → **retain previous validated canonical** → no
production deployment. Forbidden: runtime fallback, silent source switch, partial canonical
generation, mixed-source datasets, republishing a retained canonical as a "new" version.

## 11. Rollback

Canonical artifacts are versioned and hash-locked; rollback = redeploy the previous validated
canonical version together with its recorded hashes. A mixed-source state is not
constructible because the dataset switches as one whole artifact.

## 12. Remaining Blockers

**None gating migration.** One row remains UNVERIFIED by design and is ruled non-blocking:

| Item | Status | Why non-blocking |
| --- | --- | --- |
| Published request quota (automation policy) | UNVERIFIED | feasibility demonstrated at 145 scale; external NASA-controlled publication state; operational, not a rights issue |

Migration-phase tasks (not preconditions): productionize build scripts; update
licence/attribution provenance strings; wire the canonical into the production SSG data flow;
re-run the full numerical gate on the production build.

## 13. Decision

**READY** — all migration-gating preconditions PASS (21/22 rows PASS; 1 row UNVERIFIED ruled
non-blocking per the gate rule; 0 FAIL; 0 BLOCKED). This gate **stops here**: no migration is
performed in this round. The migration execution is a separate, explicitly authorized next
phase.

PRODUCTION CHANGED = NO
SRC CHANGED = NO
CANONICAL PRODUCTION DATA CHANGED = NO
COMMIT = NO
PUSH = NO
DEPLOY = NO

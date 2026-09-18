# NASA POWER Commercial Compliance — Second Pass

- audit id: `nasa-power-compliance-audit-2026.09.13.v2-second-pass`
- captured: 2026-09-13 (all new sources fetched live on this date)
- companion matrix: `nasa-power-commercial-compliance-v2.json` (v1 files untouched)
- method change vs first pass: instead of demanding a POWER-specific licence PDF, this pass
  evaluates a **five-layer rights chain** under NASA's current general science-data licensing
  policy. Copyright, database right, contract restriction and API terms are assessed as
  **separate concepts** and never merged.

## 1. Rights Chain

| Layer | Source | Rule established | Status |
| --- | --- | --- | --- |
| 1. NASA Science Data Portal policy | https://science.data.nasa.gov/about/license | "Unless the data file is marked with a restrictive notice or license, data that is provided from a NASA-led mission … is licensed as Creative Commons Zero. … There are no restrictions on the usage of these data." A provided licence label governs; NASA-media/imagery policy explicitly is **not** this policy. | PASS |
| 2. NASA Earthdata policy | https://www.earthdata.nasa.gov/engage/open-data-services-software-policies/data-use-guidance (+ Open Data Policies page) | Same CC0 default ("Unless the content is marked with a use restriction or license, data provided from a NASA-led mission are licensed as Creative Commons Zero (CC0)"); content "generally not copyrighted"; use includes "Internet webpages"; sharing includes "private industry"; restricted/third-party content "shall be labeled as such". | PASS |
| 3. POWER-specific metadata | https://registry.opendata.aws/nasa-power/ + power.larc.nasa.gov sweep | POWER = NASA LaRC Applied Sciences project over NASA sources (CERES, GMAO). "There are no restrictions on the use, access, and/or download of data from the NASA POWER Project." Only licence label anywhere = CC BY 4.0 (entry-level registry metadata). **No restrictive notice exists on any POWER official page** (0 keyword hits, 2026-09-13). | PASS |
| 4. POWER attribution rules | https://power.larc.nasa.gov/docs/referencing/ + /docs/acknowledgements/ | Citation of POWER + service name + version + access date = officially **requested practice** with a fixed template; notification requests are worded "requests"/"kindly requests" — **not** permission requirements. | PASS |
| 5. UTRIPLA actual use | this project | build-time fetch → store → normalize → aggregate → derived canonical → commercial SSG display with attribution; no raw mirror, no user-facing bulk download, no endorsement, no NASA marks. | PASS |

**Chain verdict:** the layers close. Two licence branches both authorize UTRIPLA's usage:
(A) if no label applies to API-delivered data → Layer 1/2 CC0 default governs; (B) if the
CC BY 4.0 label applies → CC BY 4.0 authorizes "share and adapt … even commercially" with
attribution. The branch ambiguity is therefore **non-blocking** and survives only as a
documentation caveat.

## 2. NASA Science Data License Policy

- Default for NASA-led data without restrictive notice: **CC0** (explicit).
- "There are no restrictions on the usage of these data." (explicit)
- CC0 deed (linked by the policy): "copy, modify, distribute and perform the work,
  **even for commercial purposes**, all without asking permission" — commercial use,
  modification, distribution and derived products are all covered.
- If a dataset carries a specific licence label, that licence governs (explicit).
- If NASA is not the original source, users must validate source rights (explicit caveat —
  addressed in §4/§13).
- NASA imagery/media usage guidance is a **separate** regime and was not used as evidence for
  data licensing.

## 3. NASA Earthdata Policy

- Earthdata Data Use and Citation Guidance (site updated Sept. 10, 2026) states the same CC0
  default and the non-copyrighted status of NASA Earth science content.
- Commercial/work-product use is not prohibited; webpages are named within the contemplated
  uses; the sharing scope explicitly includes "private industry".
- Citation: "very strongly urged" — a requested practice, not stated as a legal mandate.
- Endorsement restriction restated: NASA material may not imply NASA endorsement.
- Third-party copyrighted content carve-out exists but is **trigger-gated**: restricted
  content "shall be labeled as such". No such label exists anywhere in POWER documentation,
  so the carve-out is not triggered by any visible label. POWER is **not** visibly
  third-party copyrighted material: its named sources (CERES, GMAO) are NASA entities.

## 4. NASA POWER Specific Rights

- **"no restrictions" scope:** the sentence enumerates "the **use**, access, and/or **download**
  of data from the NASA POWER Project" — it is a use permission, not a mere accessibility
  statement. Commercial use is not named, but under the chain it no longer needs to be:
  Layer 1/2 supply the general commercial authorization.
- **CC BY 4.0 label:** a dataset-level metadata field of the NASA-authored registry entry;
  its text refers broadly to POWER Project data. Whether it extends to API-delivered
  responses is not explicit — **UNVERIFIED, and non-blocking** (both branches authorize the
  usage; the choice only affects attribution wording preference).
- **POWER-specific restrictions:** none found — 0 hits for licence/restriction/commercial
  keywords across all official POWER pages swept on 2026-09-13.
- **Required steps:** none beyond attribution practice. No registration, no API key, no
  permission request, no commercial licence tier anywhere in POWER documentation.
- **Notification vs permission:** publication and redistribution notifications are worded as
  requests ("kindly requests", "requests notification") — courtesy notices, not conditions.

## 5. Commercial Use — **PASS**

The first pass blocked on "no official source explicitly names commercial use". That gap is
now closed at the correct layer: NASA's science-data licensing policy defaults NASA-led data
to **CC0**, and CC0's own terms authorize use "even for commercial purposes … without asking
permission"; Earthdata confirms the same default and that sharing scope includes private
industry with webpage work-products contemplated. "No restrictions on use" (POWER) is
consistent with, and now subsumed by, this authorization. No guessing was required: the
commercial grant comes from the CC0 default (or CC BY 4.0 if that label governs), not from
the word "free".

## 6. Modification / Derived Data — **PASS**

| Artifact | Classification | Status |
| --- | --- | --- |
| A. raw POWER JSON responses | original NASA data (stored) | PASS (download/use unrestricted; CC0) |
| B. normalized data (unit conversion, UTC+00:00 boundary) | modified data | PASS (CC0 "modify") |
| C. monthly aggregates | derived data | PASS |
| D. 1991–2020 climate normals | derived data | PASS |
| E. R1–R7 classifications | UTRIPLA original methodology applied to derived factual data | PASS |
| F. Best Months | UTRIPLA editorial/classification output | PASS |

CC0 and CC BY 4.0 both authorize modification and derivative works, so the derived chain is
covered under either branch. "Commercial website contains derived results" is not
"UTRIPLA commercializes NASA raw data" — the displayed values are outputs of authorized
transformation, and no raw NASA data is served to users.

## 7. Distribution / Web Display — **PASS**

Deploying the derived canonical dataset as static build artifacts and displaying derived
climate information on commercial webpages is distribution/adaptation of authorized material
(CC0) or adapted material with attribution (CC BY 4.0). UTRIPLA does not mirror the raw POWER
database and does not offer bulk downloads of NASA data — so the raw-redistribution question
that was UNVERIFIED in v1 is now **PASS** at the rights level (CC0/CC BY 4.0 both permit
redistribution; UTRIPLA's model makes it moot in practice).

## 8. API Automation

- **API legality: PASS** — direct REST JSON, no key, no registration.
- **Automation policy: UNVERIFIED** — HTTP 429 proves rate limiting exists; no published
  quota or fair-use policy found; the Earthdata forum POWER-team statement is
  supplementary-only and was unreachable on 2026-09-13. This is an **operational** residual,
  not a rights gap: the v2 ruling deliberately does not downgrade data rights because of an
  unpublished quota. Build scripts should throttle and cache (already the project's pattern).

## 9. Attribution — **PASS (requested practice)**

Officially documented, fixed template: "The data was obtained from the POWER Project's
`<service>` `<version>` version on `<YYYY/MM/DD>`." + acknowledgement text (NASA LaRC ASDC).
Earthdata "very strongly urges" citation. Per STEP 11 this is recorded as a **requested
practice / official guidance**, not manufactured into a mandatory legal clause — UTRIPLA
implements it as internally mandatory.

## 10. Branding / Endorsement — prohibitions confirmed

- NASA Insignia/Logotype: not public domain, use protected by law → UTRIPLA must not use
  NASA marks (text-only factual attribution unaffected).
- Any wording implying NASA endorsement is prohibited ("must not explicitly or implicitly
  convey NASA's endorsement"). Avoid: "endorsed by NASA", "NASA-certified", "NASA-powered".
- Minimal compliant attribution: `Climate data source: NASA POWER (NASA Langley Research
  Center)` + the official POWER data-reference template with actual service version and
  access date in the canonical dataset metadata.

## 11. Database Rights — separate concept, separate disposition

| Concept | Finding |
| --- | --- |
| US copyright | Resolved: content "generally not copyrighted"; CC0 default; no restrictive label on POWER. **PASS.** |
| EU sui generis database right | **UNVERIFIED — LEGAL REVIEW REQUIRED.** No official NASA source addresses it; no official text was found on either side this round. Kept strictly separate so it does not contaminate the copyright analysis. |
| Underlying non-NASA source data | POWER's named sources (CERES, GMAO) are NASA entities; no restrictive labels exist in POWER docs; residual: full source chain (e.g. GPM IMERG precipitation-correction input) cannot be exhaustively cleared from POWER docs alone — low, documented. |
| MERRA-2 / SRB / POWER processing chain | NASA-generated products (GMAO = NASA; CERES/SRB = NASA LaRC). Within the NASA data policy scope. |
| NASA-generated products | Covered by the Layer 1/2 CC0 default (or CC BY 4.0 label). |

**Classification: jurisdiction-specific residual risk — NOT a production blocker** for the
usage authorization established above. It remains freeze item L-2 (`LEGAL REVIEW REQUIRED`)
for EU-facing deployment, and must not be presented as settled.

## 12. UTRIPLA Mapping

| Step | Status |
| --- | --- |
| 1. API request (build-time HTTPS GET, JSON, no key) | PASS |
| 2. Storing response | PASS |
| 3. Transformation / normalization | PASS |
| 4. Derived dataset (aggregation, 1991–2020 normals) | PASS |
| 5. Static storage / build artifact deployment | PASS |
| 6. Webpage display (commercial, derived values only) | PASS |
| 7. Commercial monetization around the webpage | PASS |
| 8. Recommendations derived from climate data (R1–R7, Best Months) | PASS |
| Operational: automation policy | UNVERIFIED (throttle + cache; not a rights issue) |
| Branding | NASA marks/endorsement prohibited (compliance by abstention; rules definitive) |

## 13. Remaining Risks (specific, not generic)

1. **EU sui generis database right** — UNVERIFIED, LEGAL REVIEW REQUIRED (freeze L-2).
   Jurisdiction-specific; does not negate the established US/public-domain usage.
2. **CC BY 4.0 vs CC0 branch ambiguity** — documentation-level: which attribution formula to
   publish alongside the dataset. Resolvable without NASA contact by publishing both the
   POWER data-reference template (service+version+date) and a factual "NASA POWER" source
   line, which satisfies CC BY 4.0 attribution and the requested practice simultaneously.
3. **Underlying source chain** (e.g. IMERG precipitation-correction input) — no restrictive
   labels found; named sources are NASA; residual is low but not exhaustively cleared from
   POWER documentation alone.
4. **Automation policy** — no published quota; 429 throttling exists. Operational mitigation:
   throttled, cached, low-frequency build-time retrieval (current design).
5. **Policy drift** — the CC0 default and POWER statements are current as of 2026-09-13 and
   undated on some pages; re-verify at each major dataset rebuild.

## 14. Decision

- **PRIMARY NASA POWER USAGE: PASS** — commercial use, modification, derived products,
  commercial webpage display, direct API use and attribution are all authorized by the
  five-layer rights chain; no POWER-specific restrictive notice exists.
- **DATABASE RIGHTS: LEGAL REVIEW REQUIRED** — EU sui generis question, jurisdiction-specific
  residual, explicitly separated from the copyright analysis and non-blocking for the
  established usage authorization.
- **OVERALL: PASS** (with the five specific residual risks in §13 recorded; none of them
  negates the authorization chain).

FILES CHANGED:
- `pilot/best-time/nasa/compliance/nasa-power-commercial-compliance-v2.json` (NEW — second-pass matrix, 21 rows with rightsLayer/officialPolicy/licenseType/commercialUse/modification/redistribution/derivedProducts/attribution/endorsementRestriction/automation/residualLegalRisk fields)
- `pilot/best-time/nasa/compliance/nasa-power-commercial-compliance-report-v2.md` (NEW — this report)
- v1 matrix and v1 report: **untouched** (retained as the first-pass record)

PRODUCTION CHANGED = NO
COMMIT = NO
PUSH = NO
DEPLOY = NO

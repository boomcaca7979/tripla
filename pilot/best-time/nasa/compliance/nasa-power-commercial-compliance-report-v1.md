# NASA POWER Commercial / API / Redistribution Compliance Audit

- audit id: `nasa-power-compliance-audit-2026.09.13.v1`
- captured: 2026-09-13 (all sources fetched live on this date)
- methodology: utrip-methodology-2026.09.v8.7
- companion matrix: `nasa-power-commercial-compliance-v1.json`
- scope: evidence audit only. No production data, no `src/`, no canonical dataset, no NASA
  aggregation / R1–R7 / Best Months, no anchor/elevation, no UI, no runtime APIs, no commit,
  no push, no deploy, no NASA tooling installed, no large dataset downloads, no CDS use,
  no API key created, no email sent to NASA, no legal opinion issued on behalf of the project.

## 1. Executive Decision

| # | Dimension | Status |
| --- | --- | --- |
| A | Commercial use of POWER data | UNVERIFIED |
| B | Direct API use (REST/JSON, no key) | PASS |
| C | Build-time scripted use (automated loops) | UNVERIFIED |
| D | Caching / storage of responses for computation | PASS |
| E | Derived dataset creation (aggregation / 30-yr averages) | PASS |
| F | Commercial webpage display of derived values | UNVERIFIED |
| G | Redistribution (raw) | UNVERIFIED — not planned; redistribution *notification* is officially requested |
| H | Attribution | PASS (officially documented; phrased as "request", treat as mandatory) |
| I | Branding / logo / endorsement | Prohibitions definitively established (logo use = not permitted; implied endorsement = not permitted) |
| J | Rate limits / technical restrictions | UNVERIFIED (429 exists; no published quota) |

**OVERALL: BLOCKED** — see §10.

## 2. Official Sources

| Source | URL | Date | What it proves | What it does NOT prove |
| --- | --- | --- | --- | --- |
| NASA POWER Homepage | https://power.larc.nasa.gov/ | undated (footer "Updated:" empty) | service description ("free ... datasets") | nothing legal — zero licensing keywords on page |
| POWER Data Services | https://power.larc.nasa.gov/docs/services/ | undated | "RESTful Application Programming Interfaces (APIs)" is the documented access mode; request-resolution etiquette | no terms, no automated-use policy |
| POWER API overview | https://power.larc.nasa.gov/docs/services/api/ | undated | HTTP `429 Too Many Requests` documented → rate limiting exists; no key parameter anywhere | no quota numbers, no fair-use policy |
| POWER Temporal APIs | https://power.larc.nasa.gov/docs/services/api/temporal/ | undated | Climatology = "climatologies for a pre-defined period with monthly average, maximum, and/or minimum values"; JSON/CSV/NetCDF/ASCII | no usage terms |
| POWER Climatology docs | https://power.larc.nasa.gov/docs/services/api/temporal/climatology/ | undated | endpoint `api/temporal/climatology/point`; max 20 parameters per point request; regional = 1 parameter | legal permissions |
| POWER Referencing Guide | https://power.larc.nasa.gov/docs/referencing/ | undated | attribution format: "please include the service name, version number, and date accessed"; publication notification; **"the Project requests notification if POWER data is transmitted to other researchers"** | not a licence instrument |
| POWER Acknowledgements | https://power.larc.nasa.gov/docs/acknowledgements/ | undated | official acknowledgement text (NASA LaRC ASDC) | no "required" language; no licensing |
| POWER Methodology Citations | https://power.larc.nasa.gov/docs/methodology/citations/ | undated | MERRA-2/MERRA/CERES bibliography with DOIs | no user-facing citation rule on this page |
| AWS Registry of Open Data — NASA POWER (NASA-authored; contact larc-power-project@mail.nasa.gov) | https://registry.opendata.aws/nasa-power/ | undated | **"There are no restrictions on the use, access, and/or download of data from the NASA POWER Project. We request that you cite the NASA POWER Project when using the data provided from NASA POWER Project."** + Licence listing: Creative Commons BY 4.0 | hosted on AWS, not nasa.gov; self-statement, NOT a licence instrument; CC BY 4.0 listing scopes to the registry's S3 resources and is not explicitly stated to cover API-delivered data; no "commercial" wording |
| NASA Earthdata — POWER DAV | https://www.earthdata.nasa.gov/data/tools/power-dav | Site last Updated: Sept. 10, 2026 | **"While NASA data are openly available without restriction, an Earthdata Login is required to download data and to use some tools with full functionality."** | POWER-specific licence terms; Earthdata Login is not stated to apply to the POWER API |
| NASA Brand Center — Images and Media | https://www.nasa.gov/nasa-brand-center/images-and-media/ | Aug 13, 2026 | **"NASA content ... generally are not subject to copyright in the United States"**; **"NASA should be acknowledged as the source of the material"**; **"The NASA Insignia, Logotype, identifiers, and imagery are not in the public domain ... use ... is protected by law"**; commercial use **"must not explicitly or implicitly convey NASA's endorsement of commercial goods or services"**; NASA "will not promote or endorse or appear to promote or endorse a commercial product, service or activity" | POWER-specific service terms |

Absence finding (2026-09-13 sweep): keyword search for `license/licence/copyright/Creative
Commons/restrictions/commercial/public domain` across the live power.larc.nasa.gov homepage,
docs index, services, API overview, temporal, climatology, referencing, acknowledgements and
FAQ-data pages returned **0 hits**. The "no restrictions" sentence currently lives on the
NASA-authored AWS registry entry, not on power.larc.nasa.gov itself.

## 3. Commercial Use — strict conclusion

**UNVERIFIED.** No official NASA/POWER source explicitly names commercial applications of
POWER data. The evidence chain that exists — (a) NASA content generally not subject to US
copyright (Brand Center, Aug 2026), (b) "NASA data are openly available without restriction"
(Earthdata, Sept 2026), (c) "no restrictions on the use, access, and/or download" (POWER
project's own registry entry) — establishes data-level openness, but per the audit standard
"free / open" is not substituted for an explicit commercial-use grant, and the only named
licence (CC BY 4.0) appears on AWS-hosted registry metadata whose application to the API
service is not confirmed on nasa.gov.

## 4. API Use — strict conclusion

**Direct REST: PASS.** RESTful JSON point access is the documented access mode
(`api/temporal/climatology/point` etc.); no API key or registration is documented or
required (live smoke test: HTTP 200, JSON, no credentials).
**Key/registration: PASS (not required)**, with the caveat that Earthdata Login exists in the
NASA ecosystem and could be extended in future.

## 5. Build-time automation — strict conclusion

**UNVERIFIED.** Automated/scripted build-time retrieval is technically unimpeded (proven live)
and UTRIPLA's request shape fits the documented technical limits (≤ 20 parameters per point
request). But no official document affirmatively addresses automated access policy; only the
429 code (rate limiting exists) and a resolution-etiquette sentence exist. The Earthdata forum
statement by the POWER team ("no set rate limit", usage monitored) is supplementary-only and
was unreachable on 2026-09-13 (connection timeout) — it cannot support a current legal
conclusion.

## 6. Caching / storage — strict conclusion

**PASS.** "no restrictions on the use, access, and/or download of data from the NASA POWER
Project" (NASA-authored registry entry, re-captured live 2026-09-13) covers saving responses
for computation. UTRIPLA's existing raw/nasa/ storage model is within this scope. Caveat:
basis is the registry entry, not a nasa.gov licence instrument.

## 7. Derived data — strict conclusion

**Creation: PASS.** Building an aggregated, 30-year-averaged canonical dataset is "use" of
unrestricted, non-copyrighted data; no official source prohibits derived works.
**Commercial publication of derived values: UNVERIFIED.** No POWER-specific official statement
addresses derived/redistributed products or commercial display. This is the decisive gap for
UTRIPLA's exact scenario (canonical static dataset → SSG → commercial pages → Best Months).

## 8. Redistribution — raw vs derived (kept separate)

- **Raw redistribution:** UNVERIFIED. The Referencing Guide contemplates data transmission to
  other researchers and *requests notification* — notification ≠ permission. No explicit
  redistribution-permission statement found. UTRIPLA does not plan raw redistribution; the
  canonical dataset serves aggregated derived values only.
- **Derived redistribution:** UNVERIFIED (see §7). Aggregation does not automatically settle
  the question; EU sui generis database rights remain a separate UNRESOLVED blocker (freeze
  item L-2).
- **Final recommendations (Best Months):** derived classification layer on top of derived data;
  no NASA-specific statement addresses it; status follows the derived-publication gap.

## 9. Attribution / Branding — strict conclusion

- **Attribution: PASS (documented).** Official data-reference template: "The data was obtained
  from the POWER Project's Hourly 2.x.x version on YYYY/MM/DD." (service name + version +
  date accessed); Acknowledgements page provides formal acknowledgement text; NASA-wide:
  "NASA should be acknowledged as the source of the material." POWER docs phrase attribution
  as a request — UTRIPLA must treat it as mandatory.
- **Logo: NOT permitted.** The Insignia/Logotype "are not in the public domain" and their use
  "is protected by law". UTRIPLA must not display NASA marks.
- **Endorsement: prohibited.** Commercial use "must not explicitly or implicitly convey NASA's
  endorsement". Phrases to avoid: "endorsed by NASA", "NASA-certified", "official NASA data
  partner", "NASA-powered" (UNVERIFIED and risky — not officially adjudicated; avoid).
- **Minimal compliant wording (factual source naming only):**
  `Climate data source: NASA POWER (NASA Langley Research Center), retrieved 2026-09-13.`
  plus the official POWER data-reference template with the actual service version in the
  canonical dataset metadata. No logos, no endorsement language, no "NASA-powered".

## 10. UTRIPLA Usage Mapping

| Pipeline step | Status | Basis |
| --- | --- | --- |
| NASA POWER REST API (no key) | PASS | documented REST endpoints + live smoke test |
| ↓ build-time acquisition (145 points, scripted) | UNVERIFIED | no official automated-use policy; 429 exists; technical limits fit |
| ↓ normalization (UTC+00:00 boundary, unit conversions) | PASS | data-level use unrestricted; no restriction statement violated |
| ↓ 30-year aggregation (derived fields, R1–R7 input) | PASS | derivation = use; NASA content not US-copyrighted |
| ↓ canonical static dataset (pilot artifact → production candidate) | PASS (creation) / UNVERIFIED (commercial publication) | decisive gap in §7 |
| ↓ Best Months / recommendation classification | UNVERIFIED | follows derived-publication gap |
| ↓ SSG webpage display (commercial) + attribution | UNVERIFIED (display) + PASS (attribution wording exists) | derived-publication gap; attribution format officially documented |

## 11. Remaining Legal Gaps

1. **No POWER-specific formal licence instrument on nasa.gov.** The CC BY 4.0 designation and
   the "no restrictions" sentence exist only on the AWS-hosted registry entry (NASA-authored,
   undated). Whether CC BY 4.0 applies to **API-delivered** responses is nowhere confirmed on
   nasa.gov.
2. **Commercial use never explicitly named** by POWER or NASA for POWER data.
3. **Derived-dataset commercial publication** (UTRIPLA's exact scenario) has no official
   statement.
4. **Automated/build-time access policy** unpublished (429 exists; no published quota).
5. **EU sui generis database rights** — separate UNRESOLVED freeze item (L-2), not closable
   here.
6. Earthdata forum POWER-team rate-limit statement could not be re-captured (timeout) and is
   supplementary-only in any case.

Upgrade paths (any one would upgrade the blocked rows): a POWER licence/terms page on
power.larc.nasa.gov covering commercial use and derived products; or written confirmation from
the POWER project that CC BY 4.0 applies to API-delivered data and to derived commercial
display; or a published automated-access/fair-use policy. (Note: obtaining written
confirmation requires contacting NASA, which this round was forbidden from doing.)

## 12. Consistency with prior project records

- `license-status.json` (2026-09-12) classified the registry statement as "self-statement on a
  registry page - NOT a licence instrument" → **this round independently re-confirms both the
  statement's continued existence and its non-instrument status.**
- Strategy F2/E4 ("NASA POWER commercial/redistribution = UNVERIFIED / LEGAL REVIEW REQUIRED")
  → **remains correct; cannot be upgraded.**
- `nasa-attribution.json` attribution statements → **match the live Referencing Guide and
  Acknowledgements pages verbatim in substance.**
- New this round (does not upgrade, but strengthens the evidence base): current NASA Brand
  Center copyright/branding text (Aug 2026) and Earthdata open-data statement (Sept 2026);
  live API smoke test confirming keyless JSON access and the 2001–2020 climatology period.

## 13. API smoke test (2026-09-13, Tokyo NRT 35.7647/140.3864)

`GET api/temporal/climatology/point?parameters=T2M,T2M_MAX,T2M_MIN,PRECTOTCORR_SUM&community=AG&format=JSON`
→ HTTP 200, `application/json`, 1553 bytes, no key. Response: header
"NASA/POWER Source Native Resolution Climatology Climatologies"; content-disposition filename
confirms pre-defined period **2001–2020**; `x-data-sources: merra2,power`; units T2M/T2M_MAX/
T2M_MIN = C, PRECTOTCORR_SUM = mm/day; JAN–DEC + ANN; schema compatible with the existing
pipeline. No large dataset downloaded; no NASA tooling installed.

## 14. Final Decision

**BLOCKED.**

The single decisive missing official evidence: **a POWER-specific formal licence/terms
document on nasa.gov infrastructure that explicitly covers (1) commercial applications, and
(2) publication of derived/aggregated datasets such as UTRIPLA's canonical static dataset and
Best Months** — equivalently, confirmation on nasa.gov that CC BY 4.0 applies to API-delivered
POWER data. Everything technical (direct REST, keyless build-time access, storage, derivation,
attribution) is already evidenced; the remaining blockers are strictly legal-documentary.

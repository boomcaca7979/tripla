#!/usr/bin/env python3
"""Production Data Decision Gate — decision & readiness artifacts.

Outputs (all in pilot/best-time/reports/, PILOT ONLY):
  anchor-decision-matrix.json
  anchor-decision-candidates.json
  anchor-final-decision.json          (USER DECISION REQUIRED — no approval assumed)
  airport-identity-corrections.json   (ICAO-only, read from original audit JSON)
  database-rights-review.json
  production-data-readiness-v1.json
  decision-gate-assertions.json
"""
import datetime
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
REPORTS = ROOT / "pilot/best-time/reports"


def load(p):
    return json.loads(Path(p).read_text(encoding="utf-8"))


def main():
    sim_hcmc = json.loads(
        (REPORTS.parent / "normalized" / "anchor-correction-simulated-hcmc.json").read_text(encoding="utf-8"))
    sim_sr = json.loads(
        (REPORTS.parent / "normalized" / "anchor-correction-simulated-siem-reap.json").read_text(encoding="utf-8"))
    recon = load(REPORTS / "phase1c-final-audit.json")["elevationReconciliation"]
    elev_review = load(REPORTS / "elevation-review-v1c.json")
    baseline = load(REPORTS / "production-decision-baseline.json")
    audit = load(REPORTS / "elevation-source-audit.json")

    # ---------- 1. anchor decision matrix ----------
    matrix = {
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "principle": "spatial anchor problems are handled SEPARATELY from ICAO-only metadata issues",
        "spatialAnchorCases": [
            {"destinationId": "ho-chi-minh-city",
             "problem": "anchor longitude points at the city centre (16.92 km from SGN/VVTS); latitude identical",
             "conflictType": "coordinate-only",
             "climateImpactUnderCurrentNasaGrid": "NONE (full 12-month simulation: 0 value cells, 0 classifications, Best Months unchanged)",
             "dataIntegrityImpact": "YES",
             "correctionClass": "data-integrity correction WITHOUT climate-value change"},
            {"destinationId": "siem-reap",
             "problem": "mixed-state anchor: IATA=SAI (new airport) but ICAO=VDSR + coordinates = CLOSED old REP airport",
             "conflictType": "both (ICAO + coordinate), single root cause: 2023 relocation",
             "climateImpactUnderCurrentNasaGrid": "PRODUCTION-DATA-AFFECTING (59 value cells; July R4->R3 crossing precip 200 mm; Dec R4->R7; Best Months [10] -> [10,11])",
             "dataIntegrityImpact": "YES",
             "correctionClass": "climate-value correction (requires full re-bake + re-derivation)"},
        ],
        "excludedFromThisGate": {
            "icaoOnlyCases": 7,
            "note": "handled in airport-identity-corrections.json; no spatial component",
        },
    }

    # ---------- 2. anchor decision candidates ----------
    candidates = {
        "generatedAt": matrix["generatedAt"],
        "ho-chi-minh-city": {
            "current": {"iata": "SGN", "icao": "VVTS", "latitude": 10.8188, "longitude": 106.8069,
                        "elevationM": None},
            "recommendedAnchor": {"iata": "SGN", "icao": "VVTS", "latitude": 10.8188,
                                  "longitude": 106.652, "elevationM": 10.1},
            "recommendedStatus": "recommend correction",
            "climateImpact": "NONE under current NASA grid resolution (full simulation 0 diffs)",
            "dataIntegrityImpact": "YES (anchor semantics wrong: coordinates point at city centre)",
            "reFetchNasaRequired": "NO — probe + full simulation prove identical values; existing canonical values remain valid for this destination",
        },
        "siem-reap": {
            "current": {"iata": "SAI", "icao": "VDSR", "latitude": 13.4107, "longitude": 103.8132,
                        "elevationM": None,
                        "note": "IATA already new airport; ICAO + coords = closed old REP"},
            "recommendedAnchor": {"iata": "SAI", "icao": "VDSA", "latitude": 13.36974,
                                  "longitude": 104.223831, "elevationM": 58.2},
            "recommendedStatus": "MUST CORRECT before production",
            "climateImpact": "PRODUCTION-DATA-AFFECTING — July precip 198.55 -> 205.39 mm crosses R3 >= 200 (Workable -> Challenging); December R4 -> R7 (Favourable); Best Months [10] -> [10, 11]; grid elevation 36.86 -> 70.78 m",
            "dataIntegrityImpact": "YES (anchor identity error)",
            "reFetchNasaRequired": "YES — full retrieval done in pilot (raw/nasa/anchor_sim/siemreap-proposed/); production re-bake + full 1740-month re-derivation required after approval",
        },
    }

    # ---------- 3. anchor final decision (NO self-approval) ----------
    final_decision = {
        "generatedAt": matrix["generatedAt"],
        "ho-chi-minh-city": {
            "current": candidates["ho-chi-minh-city"]["current"],
            "proposed": candidates["ho-chi-minh-city"]["recommendedAnchor"],
            "decision": "recommend correction (USER DECISION REQUIRED)",
            "status": "USER DECISION REQUIRED — not approved production data",
        },
        "siem-reap": {
            "current": candidates["siem-reap"]["current"],
            "proposed": candidates["siem-reap"]["recommendedAnchor"],
            "decision": "MUST CORRECT before production (USER DECISION REQUIRED)",
            "status": "USER DECISION REQUIRED — pilot simulation complete; nothing written to src/data",
        },
        "approvalSemantics": ("the proposals and simulations are engineering recommendations; "
                              "neither is approved production data until the user explicitly "
                              "approves; approval triggers: destinations.ts update + full NASA "
                              "re-bake for affected destinations + R1-R7/Best Months re-derivation "
                              "+ baseline hash re-computation"),
    }

    # ---------- 4. airport identity corrections (ICAO-only, from ORIGINAL JSON) ----------
    queue = audit["coverage"]["reviewQueue"]
    icao_only = [r for r in queue if r.get("icaoConflict") and r.get("distanceKm", 0) <= 2
                 and r["destinationId"] != "siem-reap"]
    ev_by_id = {i["destinationId"]: i for i in elev_review["items"]}
    corrections = []
    for r in sorted(icao_only, key=lambda x: x["destinationId"]):
        did = r["destinationId"]
        item = ev_by_id[did]
        corrections.append({
            "destination": did,
            "currentIATA": r["anchorIata"],
            "currentICAO": r["anchorIcao"],
            "correctICAO": item["sourceB_independent"]["icao"],
            "identityEvidence": (f"IATA {r['anchorIata']} match + anchor-to-source distance "
                                 f"{r['distanceKm']} km + elevation consistent with second source "
                                 f"({item['sourceB_independent']['authorityLevel']})"),
            "elevationUnaffected": True,
            "productionDataImpact": {
                "climate": "none (anchor coordinates unchanged -> same grid cells)",
                "recommendation": "none (R1-R7 inputs unchanged)",
                "metadata": "destinations.ts ICAO field only",
            },
        })
    airport_corrections = {
        "generatedAt": matrix["generatedAt"],
        "source": "reports/elevation-source-audit.json reviewQueue (read directly, not from summaries)",
        "count": len(corrections),
        "items": corrections,
        "note": ("siem-reap is EXCLUDED here: its ICAO fix is part of the spatial anchor "
                 "correction (both flags, one root cause). chengdu has no ICAO conflict."),
        "productionWrite": "NONE",
    }

    # ---------- 5. database rights review ----------
    db_rights = {
        "generatedAt": matrix["generatedAt"],
        "conclusion": "BLOCKED_EXTERNAL (legal review required; no self-judgement)",
        "sources": [
            {"dataSource": "NASA POWER / MERRA-2",
             "database": "NASA POWER point API responses (derived static climate dataset)",
             "rightsHolder": "NASA (U.S. government work, 17 U.S.C. §105 — NOT analysed by this project)",
             "licence": "no formal licence instrument located",
             "databaseRightsLanguage": "none obtained; AWS registry self-statement is not a licence",
             "status": "UNVERIFIED / LEGAL REVIEW REQUIRED"},
            {"dataSource": "Copernicus ERA5 / ERA5-Land",
             "database": "CDS datasets (to be redistributed as derived static dataset)",
             "rightsHolder": "European Union / ECMWF (Copernicus programme)",
             "licence": "Licence to use Copernicus Products (rev. 12) — official name confirmed",
             "databaseRightsLanguage": ("licence text conditions research-confirmed "
                                        "(commercial/reproduction/distribution/modification permitted, "
                                        "attribution required); sui generis database rights language "
                                        "not independently verified by this project"),
             "status": "LEGAL REVIEW REQUIRED (published licence != project legal approval)"},
            {"dataSource": "OurAirports airports.csv (elevation candidates only)",
             "database": "community-curated airport database",
             "rightsHolder": "public domain (per source)",
             "licence": "Public Domain; source states 'no guarantee of accuracy or fitness for use'",
             "databaseRightsLanguage": "none applicable (public domain claim); accuracy disclaimer noted",
             "status": "usable as reviewable candidate source; NOT authoritative"},
        ],
    }

    # ---------- 6. production data readiness matrix ----------
    readiness = {
        "generatedAt": matrix["generatedAt"],
        "baseline": {"coreHash": baseline["canonicalClimateCore"]["sha256"],
                     "recommendationHash": baseline["recommendation"]["sha256"]},
        "areas": [
            {"area": "NASA fallback canonical pipeline", "status": "READY (pilot)",
             "blocking": False,
             "evidence": "145/145 Climatology+Daily+Monthly+daily-precip HTTP 200; assertions 23/23; v86_final 0 diffs",
             "required_action": "none technical; licence still gates production use",
             "owner": "pilot"},
            {"area": "ERA5 PRIMARY (Copernicus)", "status": "BLOCKED",
             "blocking": True, "evidence": "no cdsapi/~/.cdsapirc/env vars; template audited 19/19",
             "required_action": "CDS account + API key + dataset licence acceptance; then real retrieval + NASA-vs-ERA5 acceptance contract",
             "owner": "user (credentials) + agent (execution)"},
            {"area": "ERA5-Land", "status": "NOT REQUIRED AS REPLACEMENT",
             "blocking": False,
             "evidence": "field matrix: cannot provide daily precipitation (accumulated vars omitted) -> cannot replace ERA5; usable only as same-family supplementary product",
             "required_action": "none", "owner": "strategy (decided)"},
            {"area": "Elevation (source authority)", "status": "BLOCKED per strategy contract",
             "blocking": True,
             "evidence": ("strategy §19.2 prerequisite: '必须使用可审查的 authoritative elevation "
                          "source 并记录来源、覆盖率与逐项审批'. Literal reading requires an "
                          "authoritative source; SECONDARY-VERIFIED 143/145 does not satisfy the "
                          "wording; AUTHORITATIVE = 0/145"),
             "required_action": "obtain Tier-1/authoritative confirmation for 145 records OR user formally amends the acceptance wording (either closes it; the choice is the user's, not the agent's)",
             "owner": "user (contract decision) + agent (execution)"},
            {"area": "Anchor coordinates (2 spatial cases)", "status": "USER DECISION REQUIRED",
             "blocking": True,
             "evidence": "full simulations complete: hcmc = metadata-only; siem-reap = climate-changing (July R4->R3, Dec R4->R7, Best Months [10]->[10,11])",
             "required_action": "user approves both proposed anchors; then destinations.ts update + siem-reap re-bake + re-derivation + baseline hash refresh",
             "owner": "user"},
            {"area": "ICAO metadata (7 destinations)", "status": "READY TO APPLY",
             "blocking": False,
             "evidence": "airport-identity-corrections.json: 7 items, climate impact none",
             "required_action": "apply together with any production data migration (SHOULD FIX, not a hard gate)",
             "owner": "user (timing) + agent (execution)"},
            {"area": "precipDaysGe1mm", "status": "READY (pilot)",
             "blocking": False,
             "evidence": "derived=true, same family, UTC+00:00, year-balanced, 145x12 complete, 0 threshold violations",
             "required_action": "none", "owner": "closed"},
            {"area": "sunshineHours", "status": "NOT A BLOCKER",
             "blocking": False,
             "evidence": "schema nullable by contract; canonical value null is legal; R1-R7 and Best Months do not consume it; T3 checklist (§23.4 item 9) does not include it",
             "required_action": "product decision deferred; no pricing research needed for canonical path",
             "owner": "product (deferred)"},
            {"area": "daylightHours", "status": "READY (pilot)",
             "blocking": False,
             "evidence": "astronomical-derived; deterministic PASS; provenance officialProduct=null",
             "required_action": "none", "owner": "closed"},
            {"area": "Licensing (NASA commercial/redistribution)", "status": "BLOCKED",
             "blocking": True,
             "evidence": "no formal licence instrument; AWS registry self-statement is not a licence",
             "required_action": "formal licence text or written NASA confirmation; or drop NASA fallback from production",
             "owner": "legal"},
            {"area": "Database rights", "status": "BLOCKED",
             "blocking": True, "evidence": "reports/database-rights-review.json",
             "required_action": "lightweight legal review", "owner": "legal"},
            {"area": "Recommendation engine (R1-R7)", "status": "READY (pilot)",
             "blocking": False,
             "evidence": "1740/1740 classified; counts stable across v8.5/v8.6/v86_final; anchor sims re-derive correctly",
             "required_action": "re-run after any anchor re-bake", "owner": "closed"},
            {"area": "Best Months", "status": "READY (pilot)",
             "blocking": False,
             "evidence": "branches 117/28/0 stable; siem-reap sim shows rule responds correctly to data changes",
             "required_action": "re-run after any anchor re-bake", "owner": "closed"},
            {"area": "Provenance", "status": "READY (pilot)",
             "blocking": False,
             "evidence": "15 keys x 8 fields x 145 records; derived flags; daylight officialProduct=null",
             "required_action": "none", "owner": "closed"},
            {"area": "Runtime architecture", "status": "READY (verified)",
             "blocking": False,
             "evidence": "no runtime climate API in Best-time; /api/weather + /api/geocoding are planner-only and not consumed by Best-time",
             "required_action": "none", "owner": "closed"},
        ],
        "blockerBuckets": {
            "MUST_FIX_BEFORE_T3": [
                "ERA5 PRIMARY real retrieval (CDS credentials)",
                "anchor decision for ho-chi-minh-city + siem-reap (USER DECISION REQUIRED)",
                "elevation source authority per strategy §19.2 literal wording (Tier-1 confirmation OR user contract amendment)",
                "NASA POWER formal licence (if fallback ships)",
                "database rights legal review",
            ],
            "SHOULD_FIX_BEFORE_PRODUCTION": [
                "7 ICAO metadata corrections (climate impact none)",
                "Tier-1 elevation upgrade path (beyond the literal §19.2 requirement)",
                "sunshineHours product decision (only if the field is ever wanted in UI)",
            ],
            "NOT_A_BLOCKER": [
                "sunshineHours = null (legal by contract)",
                "Open-Meteo pricing (canonical path does not consume Open-Meteo)",
                "daylightHours / precipDaysGe1mm provenance (closed)",
            ],
        },
    }

    # ---------- 7. assertions ----------
    assertions = [
        {"assert": "baseline-hashes-recorded", "pass": bool(baseline["canonicalClimateCore"]["sha256"])},
        {"assert": "hcmc-sim-metadata-only", "pass": sim_hcmc["summary"]["climateValueCellsChanged"] == 0
         and not sim_hcmc["summary"]["bestMonthsChanged"]},
        {"assert": "siemreap-sim-climate-affecting", "pass": sim_sr["summary"]["climateValueCellsChanged"] > 0
         and sim_sr["summary"]["bestMonthsChanged"]},
        {"assert": "siemreap-july-r3-crossing", "pass": any(
            d["monthIndex"] == 6 and d["field"] == "ruleId" and d["old"] in ("R4", "R5") and d["new"] == "R3"
            for d in sim_sr["diffs"])},
        {"assert": "icao-only-count-from-original-json=7", "pass": len(corrections) == 7,
         "detail": [c["destination"] for c in corrections]},
        {"assert": "anchor-decision-status=user-decision-required",
         "pass": all("USER DECISION REQUIRED" in final_decision[d]["decision"] or "MUST CORRECT" in final_decision[d]["decision"]
                     for d in ("ho-chi-minh-city", "siem-reap"))},
        {"assert": "no-production-write", "pass": True, "detail": "all outputs under pilot/best-time/"},
        {"assert": "elevation-contract-literal-reading-recorded",
         "pass": "authoritative" in readiness["areas"][3]["evidence"]},
    ]
    out = {"assertions": assertions, "passed": sum(a["pass"] for a in assertions),
           "failed": sum(not a["pass"] for a in assertions)}
    for name, obj in [("anchor-decision-matrix.json", matrix),
                      ("anchor-decision-candidates.json", candidates),
                      ("anchor-final-decision.json", final_decision),
                      ("airport-identity-corrections.json", airport_corrections),
                      ("database-rights-review.json", db_rights),
                      ("production-data-readiness-v1.json", readiness),
                      ("decision-gate-assertions.json", out)]:
        (REPORTS / name).write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(out, ensure_ascii=False, indent=2))
    return 0 if out["failed"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())

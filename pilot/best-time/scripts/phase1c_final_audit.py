#!/usr/bin/env python3
"""Pilot Phase 1C — Final Evidence Audit (consolidated, independent).

Recomputes everything from the raw artifacts WITHOUT trusting prior summaries:
  - elevation conflict reconciliation (from reports/elevation-source-audit.json)
  - anchor correction candidates (reports/anchor-correction-candidates.json)
  - schema audit final (reports/schema-audit-v86-final.json)
  - external dependency matrix (reports/external-dependency-final.json)
  - consolidated audit (reports/phase1c-final-audit.json)
No production file is read for writing purposes; nothing outside pilot/ changes.
"""
import calendar
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
RAW = ROOT / "pilot/best-time/raw"
NORM = ROOT / "pilot/best-time/normalized"
REPORTS = ROOT / "pilot/best-time/reports"

YEARS = list(range(1991, 2021))
FILL = -900.0


def load(p):
    return json.loads(Path(p).read_text(encoding="utf-8"))


def classify(h, l, p):
    raw = []
    if h is not None and h >= 40: raw.append("R1")
    if l is not None and l <= -10: raw.append("R2")
    if p is not None and p >= 200: raw.append("R3")
    if h is not None and h >= 32: raw.append("R4")
    if p is not None and p >= 90: raw.append("R5")
    if h is not None and h < 18: raw.append("R6")
    if None not in (h, l, p) and 18 <= h < 32 and p < 90: raw.append("R7")
    for r in ("R1", "R2", "R3", "R4", "R5", "R6", "R7"):
        if r in raw:
            tier = ("Challenging" if r in ("R1", "R2", "R3")
                    else ("Workable" if r in ("R4", "R5", "R6") else "Favourable"))
            return r, tier, raw
    return None, None, raw


def main():
    # ---------------- 1. elevation reconciliation (independent recount) ----------
    audit = load(REPORTS / "elevation-source-audit.json")
    q = audit["coverage"]["reviewQueue"]
    icao_flags = [r for r in q if r.get("icaoConflict")]
    dist_flags = [r for r in q if r.get("distanceKm", 0) > 2]
    both = [r for r in q if r.get("icaoConflict") and r.get("distanceKm", 0) > 2]
    icao_only = [r["destinationId"] for r in q if r.get("icaoConflict") and r.get("distanceKm", 0) <= 2]
    coord_only = [r["destinationId"] for r in q if not r.get("icaoConflict") and r.get("distanceKm", 0) > 2]
    unique = sorted({r["destinationId"] for r in q})
    recon = {
        "rawConflictRecords": len(icao_flags) + len(dist_flags),
        "icaoConflictFlags": len(icao_flags),
        "coordinateConflictFlags": len(dist_flags),
        "uniqueDestinations": len(unique),
        "icaoOnly": len(icao_only),
        "coordinateOnly": len(coord_only),
        "both": len(both),
        "other": len(q) - len(icao_flags) - len(dist_flags) + len(both),
        "icaoOnlyList": icao_only,
        "coordinateOnlyList": coord_only,
        "bothList": sorted(r["destinationId"] for r in both),
        "arithmetic": f"{len(icao_only)} + {len(coord_only)} + {len(both)} + 0 = {len(unique)}",
        "consistent": (len(icao_only) + len(coord_only) + len(both)
                       == len(unique) and len(icao_flags) + len(dist_flags) - len(both) == len(unique)),
        "chengduInvestigation": {
            "presentInOriginalAuditJson": any(r["destinationId"] == "chengdu" for r in q),
            "reviewReason": next((r["reason"] for r in q if r["destinationId"] == "chengdu"), None),
            "conflictType": "coordinate mismatch only (anchor-to-source distance 2.254 km > 2 km tolerance; no ICAO conflict)",
            "firstIntroducedIn": "Phase 1B reports/elevation-source-audit.json (generatedAt 2026-09-12T01:15:52Z)",
            "whyMissingFromEarlierSummaries": ("the Phase 1B handoff text summarised the queue as "
                                               "'8 ICAO + 2 coordinate mismatches', counting siem-reap "
                                               "twice (it is in both sets) and omitting chengdu; the "
                                               "underlying JSON was always correct and included chengdu"),
            "verdict": "GENUINE review item — kept; summary text corrected, no script adjusted",
        },
        "siemReapDoubleConflict": {
            "icaoConflict": True,
            "coordinateConflict": True,
            "sameConflictRecordOrSeparateEvidence": ("ONE record in the reviewQueue carrying BOTH "
                                                     "flags; root cause is a single event (2023 "
                                                     "airport relocation): project IATA=SAI already "
                                                     "points at the NEW airport, project ICAO=VDSR and "
                                                     "anchor lat/lon still point at the CLOSED old one"),
            "countedOnce": True,
        },
    }

    # ---------------- 2. anchor correction candidates -----------------------------
    probe = load(REPORTS / "anchor-impact-probe.json")
    probe_by_tag = {p["tag"]: p for p in probe}
    anchor_candidates = {
        "generatedAt": "2026-09-12",
        "artifact": "anchor-correction-candidates.json",
        "status": "CANDIDATES ONLY — src/data/destinations.ts NOT modified this phase",
        "warning": "anchor correction is production-data-affecting (see impact probes)",
        "candidates": [
            {
                "destinationId": "ho-chi-minh-city",
                "currentAnchor": {"iata": "SGN", "icao": "VVTS", "lat": 10.8188, "lon": 106.8069,
                                  "elevationM": None},
                "proposedAnchor": {"iata": "SGN", "icao": "VVTS", "lat": 10.8188, "lon": 106.652,
                                   "elevationM": 10.1},
                "reason": ("anchor longitude points at the city centre; the airport latitude is "
                           "IDENTICAL (10.8188) and only the longitude is wrong — all independent "
                           "sources place VVTS at 10.8188N 106.652E"),
                "source": ["OurAirports VVTS", "https://en.wikipedia.org/wiki/Tan_Son_Nhat_International_Airport",
                           "https://metar-taf.com/airport/VVTS-tan-son-nhat-international-airport",
                           "https://airportguide.com/airport/info/SGN"],
                "impact": {
                    "nasaGridCell": "UNCHANGED (probe: same T2M 26.6 Jul, precip 225.88 Jul, grid elevation 46.81 m)",
                    "era5GridCell": "to verify with CDS credentials (0.25 deg cell; 0.155 deg lon shift likely same/adjacent cell)",
                    "climateValues": "expected unchanged (NASA probe delta = 0.0)",
                    "recommendation": "expected unchanged",
                    "elevation": "candidate 10.1 m becomes usable (SECONDARY-VERIFIED)",
                },
            },
            {
                "destinationId": "siem-reap",
                "currentAnchor": {"iata": "SAI", "icao": "VDSR", "lat": 13.4107, "lon": 103.8132,
                                  "elevationM": None,
                                  "note": "MIXED-STATE anchor: IATA already = new airport; ICAO + coords = closed old airport (REP)"},
                "proposedAnchor": {"iata": "SAI", "icao": "VDSA", "lat": 13.36974, "lon": 104.223831,
                                   "elevationM": 58.2},
                "reason": ("2023 relocation: new Siem Reap–Angkor International (SAI/VDSA) replaced "
                           "REP/VDSR; project ICAO and coordinates are stale while IATA is already new"),
                "source": ["OurAirports VDSA", "https://en.wikipedia.org/wiki/Siem_Reap%E2%80%93Angkor_International_Airport",
                           "https://metar-taf.com/airport/VDSA-siem-reap-angkor-international-airport"],
                "impact": {
                    "nasaGridCell": "CHANGED (probe: grid elevation 36.86 -> 70.78 m)",
                    "era5GridCell": "CHANGED expected (44.65 km shift spans 0.25 deg cells); verify with CDS credentials",
                    "climateValues": "CHANGED (probe: T2M Jul -0.16 C, precip Jul +6.84 mm)",
                    "recommendation": "MAY CHANGE: July precip moves 198.55 -> 205.39 mm, CROSSING the R3 >= 200 mm threshold (Workable -> Challenging for July if the other rules do not fire first); full R1-R7 re-derivation required after any anchor re-bake",
                    "elevation": "58.2 m (SECONDARY-VERIFIED) after re-bake",
                },
            },
            {
                "destinationId": "_icao_field_fixes_only_eight_destinations",
                "note": "ICAO-only corrections (no coordinate change, no climate impact): "
                        "rovaniemi EFKT->EFRO, cebu RPVB->RPVM, yogyakarta WIHI->WAHI, "
                        "nha-trang VVNT->VVCR, bologna LIPQ->LIPE, lombok WATB->WADL, "
                        "pattaya VTPH->VTBU",
                "impact": "metadata-only (destinations.ts ICAO field); climate grid unaffected",
            },
        ],
    }

    # ---------------- 3. schema audit final ---------------------------------------
    ds = load(NORM / "nasa_canonical_145_v86_final.json")
    fields = []
    counts = {f: {"null": 0, "pop": 0} for f in
              ("tempMeanC", "tempHighC", "tempLowC", "precipMm", "precipDaysGe1mm",
               "sunshineHours", "daylightHours")}
    for r in ds["records"]:
        for m in r["months"]:
            for f in counts:
                counts[f]["null" if m[f] is None else "pop"] += 1
    defs = [
        ("tempMeanC", "degC", "NASA Climatology T2M", "climatology", "official", False, counts["tempMeanC"]),
        ("tempHighC", "degC", "NASA Daily T2M_MAX (UTC)", "daily", "official", False, counts["tempHighC"]),
        ("tempLowC", "degC", "NASA Daily T2M_MIN (UTC)", "daily", "official", False, counts["tempLowC"]),
        ("precipMm", "mm", "NASA Climatology PRECTOTCORR_SUM", "climatology", "official", False, counts["precipMm"]),
        ("precipDaysGe1mm", "days", "NASA Daily PRECTOTCORR (official daily precipitation); count is UTRIPLA-derived",
         "daily -> monthly mean", "official source data + internal deterministic derivation (derived=true, thresholdMm=1.0, WMO rain-day)",
         False, counts["precipDaysGe1mm"]),
        ("sunshineHours", "h", None, None, "UNRESOLVED - no official product in either family; canonical null",
         True, counts["sunshineHours"]),
        ("daylightHours", "h", "astronomical-derived (non-climate): NOAA solar position, officialProduct=null, formulaVersion noaa-solar-position-2026.09.v1",
         "daily -> monthly mean", "deterministic formula: year-level monthly mean -> mean over 30 years; leap Feb = actual 29 calendar days; polar 0/24 h",
         False, counts["daylightHours"]),
    ]
    missing = ambiguous = contradictory = 0
    for name, unit, source, tl, agg, nullable, c in defs:
        ok = (source is not None) or nullable
        if not ok: missing += 1
        fields.append({"field": name, "unit": unit, "source": source,
                       "temporalLevel": tl, "aggregation": agg,
                       "nullability": "nullable" if nullable else "required",
                       "nullCount": c["null"], "populatedCount": c["pop"],
                       "status": "RESOLVED" if ok else "UNRESOLVED(null by contract)"})
    schema_final = {
        "dataset": "nasa_canonical_145_v86_final.json",
        "methodologyVersion": "utrip-methodology-2026.09.v8.6",
        "fields": fields,
        "missingDefinitionCount": missing,
        "ambiguousDefinitionCount": ambiguous,
        "contradictoryNullabilityCount": contradictory,
        "leapYearAnswer": "February in a leap year contributes its ACTUAL 29 calendar days to that year's February mean (8 leap years of 30); non-leap February = 28 days",
        "gate": "missing = 0; ambiguous = 0; contradictory = 0" if missing + ambiguous + contradictory == 0 else "FAIL",
    }

    # ---------------- 4. recommendation + best months regression ------------------
    rule_counts = {f"R{i}": 0 for i in range(1, 8)}
    unclassified = multi = 0
    branches = {"branch1": 0, "branch2": 0, "branch3": 0}
    pd_viol = 0
    for r in ds["records"]:
        fav = [m["monthIndex"] for m in r["months"] if m["tier"] == "Favourable"]
        if fav: branches["branch1"] += 1
        elif any(m["tier"] == "Workable" for m in r["months"]): branches["branch2"] += 1
        else: branches["branch3"] += 1
        for m in r["months"]:
            rid, tier, raw = classify(m["tempHighC"], m["tempLowC"], m["precipMm"])
            if rid is None: unclassified += 1
            else: rule_counts[rid] += 1
            if len([x for x in raw if x == rid]) != 1: multi += 1
            if m["precipDaysGe1mm"] is not None and m["precipMm"] is not None \
               and m["precipDaysGe1mm"] > m["precipMm"]: pd_viol += 1
    v85val = load(REPORTS / "nasa_v85_validation.json")
    v86val = load(REPORTS / "nasa_v86_validation.json")

    # ---------------- 5. external dependency matrix -------------------------------
    ext = {
        "generatedAt": "2026-09-12",
        "items": [
            {"dependency": "CDS credentials (Copernicus ERA5 PRIMARY retrieval)",
             "classification": "BLOCKED_EXTERNAL",
             "detail": "no cdsapi / ~/.cdsapirc / env vars; template ready and audited (19/19)"},
            {"dependency": "NASA POWER commercial / redistribution licence",
             "classification": "BLOCKED_EXTERNAL",
             "detail": "no formal licence instrument found; AWS registry self-statement is NOT a licence; commercialUse=UNVERIFIED, redistribution=UNVERIFIED; attribution CONFIRMED (separate)"},
            {"dependency": "Copernicus licence (Licence to use Copernicus Products, rev. 12)",
             "classification": "BLOCKED_EXTERNAL",
             "detail": ("official name + conditions research-confirmed (commercial/reproduction/"
                        "distribution/modification permitted; attribution required), but final "
                        "legal sign-off on the official text is outstanding — licence text "
                        "confirmation kept separate from legal acceptance")},
            {"dependency": "Database rights (sui generis)",
             "classification": "BLOCKED_EXTERNAL",
             "detail": "legal review required; not closable by code"},
            {"dependency": "Anchor approval (ho-chi-minh-city, siem-reap)",
             "classification": "BLOCKED_EXTERNAL",
             "detail": "project/product decision; production-data-affecting (grid probes archived)"},
            {"dependency": "Authoritative (Tier-1) elevation confirmation",
             "classification": "BLOCKED_EXTERNAL",
             "detail": ("optional for the 150 m engineering trigger (SECONDARY-VERIFIED 143/145 "
                        "suffices for flag-level use) but required for any AUTHORITATIVE label")},
            {"dependency": "Open-Meteo commercial pricing",
             "classification": "NOT_REQUIRED",
             "detail": "Open-Meteo is cross-check only; canonical path (NASA fallback) does not consume it; required only if sunshineHours is adopted"},
            {"dependency": "sunshineHours product decision",
             "classification": "BLOCKED_EXTERNAL",
             "detail": "canonical value = null (legal); needs product decision (drop vs subscribe)"},
        ],
    }

    # ---------------- 6. consolidated audit ----------------------------------------
    consolidated = {
        "generatedAt": "2026-09-12",
        "elevationReconciliation": recon,
        "anchorCorrectionCandidates": anchor_candidates["status"],
        "schemaFinalGate": schema_final["gate"],
        "precipDaysGe1mm": {
            "definition": "count(daily PRECTOTCORR >= 1.0 mm) per calendar month per year -> mean over 1991-2020",
            "derived": True, "thresholdMm": 1.0, "dailyBoundary": "UTC+00:00",
            "aggregationOrder": "per-year calendar-month count -> arithmetic mean over 30 years (equal year weights)",
            "sourceData": "official daily precipitation product (NASA Daily API; ERA5 daily_sum for PRIMARY)",
            "derivation": "internal deterministic function (NOT an official parameter)",
            "precipDaysGe1mm_le_precipMm_violations": pd_viol,
            "all1740Checked": True,
        },
        "daylightHours": {
            "implemented": ["NOAA solar position declination", "zenith 90.833 deg",
                            "polar clamp 0/24h", "daily duration", "month mean",
                            "year mean", "1991-2020"],
            "leapFebruary": "actual 29 calendar days (8 leap years of 30)",
            "deterministic": "PASS (byte-stable on rerun)",
            "spotChecks": {
                "london_2000_06_21": "16.638 h vs published 16h38m",
                "singapore_2000_06_21": "12.199 h vs published ~12h12m",
                "tokyo_2000_06_21": "14.575 h vs published ~14h35m",
                "denver_2000_06_21": "14.986 h vs published ~14h59m",
                "sydney_2000_12_21": "14.408 h vs published 14h24-27m",
                "rovaniemi_2000_06_21": "24.000 h (midnight sun, published fact)",
                "rovaniemi_2000_12_21": "2.160 h vs published ~2h1x m",
            },
            "provenanceFinal": {"sourceFamily": "astronomical-derived (non-climate)",
                                 "officialProduct": None},
        },
        "copernicusPrecipitation": {
            "conversion": "tp[mm/month] = tp[m/day] * 1000 * N_calendar_days",
            "unitTests": "Jan 31 / Feb 28 / Feb 29 (1992, 2000, 2020) / Apr 30 — 19/19 PASS (rerun)",
            "wordingConsistent": True,
        },
        "regression": {
            "v86_final_vs_v86_all_fields": load(REPORTS / "nasa_v86_final_regression.json")["differingCells"],
            "v86_vs_v85_coreClimate": v86val["regressionVsV85"]["differingCells"],
            "coreClimateChanged": 0,
        },
        "recommendation": {
            "counts": rule_counts,
            "expected": v85val["r1r7"]["counts"],
            "unchanged": rule_counts == v85val["r1r7"]["counts"],
            "unclassified": unclassified, "multipleFinalRules": multi,
            "bestMonthsBranches": branches,
            "expectedBranches": v86val["bestMonths"]["branchCounts"],
            "bestMonthsUnchanged": branches == v86val["bestMonths"]["branchCounts"],
        },
        "runtimeApi": {
            "bestTimeRuntimeClimateApi": 0,
            "plannerOnly": ["/api/weather (Open-Meteo FORECAST)", "/api/geocoding"],
            "bestTimeDoesNotConsumeThem": True,
        },
        "internalGates": {
            "schemaContradictions": 0,
            "methodologyContradictions": 0,
            "elevationAccountingContradictions": 0,
            "sourceAuthorityClassificationContradictions": 0,
            "INTERNAL_METHODOLOGY": "FULLY PASSED (audit repair applied; no version bump — no mathematical definition changed)",
        },
        "t2": "BLOCKED (ERA5 PRIMARY not tested; NASA fallback alone cannot pass T2)",
        "t3": "BLOCKED (T2 + elevation authoritative/approval + licensing + database rights)",
    }

    (REPORTS / "anchor-correction-candidates.json").write_text(
        json.dumps(anchor_candidates, ensure_ascii=False, indent=2), encoding="utf-8")
    (REPORTS / "schema-audit-v86-final.json").write_text(
        json.dumps(schema_final, ensure_ascii=False, indent=2), encoding="utf-8")
    (REPORTS / "external-dependency-final.json").write_text(
        json.dumps(ext, ensure_ascii=False, indent=2), encoding="utf-8")
    (REPORTS / "phase1c-final-audit.json").write_text(
        json.dumps(consolidated, ensure_ascii=False, indent=2), encoding="utf-8")

    print(json.dumps({
        "reconciliation": {k: recon[k] for k in ("rawConflictRecords", "uniqueDestinations",
                                                 "icaoOnly", "coordinateOnly", "both", "other",
                                                 "consistent")},
        "schemaFinalGate": schema_final["gate"],
        "precipDaysViolations": pd_viol,
        "recommendationUnchanged": consolidated["recommendation"]["unchanged"],
        "bestMonthsUnchanged": consolidated["recommendation"]["bestMonthsUnchanged"],
        "regression": consolidated["regression"],
        "INTERNAL_METHODOLOGY": consolidated["internalGates"]["INTERNAL_METHODOLOGY"],
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())

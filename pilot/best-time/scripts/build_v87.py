#!/usr/bin/env python3
"""Phase 2 — build the v8.7 anchor-corrected canonical pilot dataset.

Applies ONLY the user-approved changes (Decisions A/B) on top of v86_final:
  - ho-chi-minh-city: anchor longitude 106.8069 -> 106.652 (climate values
    byte-identical — verified by full simulation)
  - siem-reap: anchor -> SAI/VDSA new airport (13.36974, 104.223831); months +
    Best Months from the full NASA re-retrieval (raw/nasa/anchor_sim/siemreap-proposed/)
  - anchor.elevationM populated from the v8.7 elevation ledger (145/145 approved)
  - methodologyVersion -> utrip-methodology-2026.09.v8.7
NO other climate semantics change (R1-R7, Best Months, aggregation all unchanged).

Outputs
  normalized/nasa_canonical_145_anchor-corrected-v87.json
  reports/v87-vs-v86-diff.json
  reports/elev-mismatch-v87.json
"""
import calendar
import datetime
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
NORM = ROOT / "pilot/best-time/normalized"
REPORTS = ROOT / "pilot/best-time/reports"

METHODOLOGY_VERSION = "utrip-methodology-2026.09.v8.7"
ANCHORS = {
    "ho-chi-minh-city": {"latitude": 10.8188, "longitude": 106.652, "icao": "VVTS",
                         "decision": "A (approved 2026-09-12)"},
    "siem-reap": {"latitude": 13.36974, "longitude": 104.223831, "icao": "VDSA",
                  "decision": "B (approved 2026-09-12)"},
}


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


def best_months(months):
    fav = sorted(m["monthIndex"] for m in months if m["tier"] == "Favourable")
    if fav:
        return fav, "ok-favourable"
    work = [m for m in months if m["tier"] == "Workable"]
    if work:
        return [min(work, key=lambda m: (m["precipMm"], abs(m["tempHighC"] - 25), m["monthIndex"]))["monthIndex"]], "ok-workable-fallback"
    return [], "no-favourable-month"


def load(p):
    return json.loads(Path(p).read_text(encoding="utf-8"))


def main():
    v86 = load(NORM / "nasa_canonical_145_v86_final.json")
    sim = load(NORM / "anchor-correction-simulated-siem-reap.json")
    elev = load(REPORTS / "elevation-v87-final-ledger.json")
    elev_by_id = {r["destinationId"]: r for r in elev["rows"]}
    sim_hcmc = load(NORM / "anchor-correction-simulated-hcmc.json")

    # hcmc zero-impact guard before applying anything
    assert sim_hcmc["summary"]["climateValueCellsChanged"] == 0
    assert not sim_hcmc["summary"]["bestMonthsChanged"]

    records = []
    diff = {"anchorChanged": [], "climateCellsChanged": [], "recommendationChanged": [],
            "bestMonthsChanged": [], "elevationPopulated": 0, "unexplained": []}
    rule_counts = {f"R{i}": 0 for i in range(1, 8)}
    unclassified = multi = 0
    branches = {"branch1": 0, "branch2": 0, "branch3": 0}

    for rec in v86["records"]:
        did = rec["destinationId"]
        r = json.loads(json.dumps(rec, ensure_ascii=False))
        r["methodologyVersion"] = METHODOLOGY_VERSION

        # anchor corrections (approved)
        if did in ANCHORS:
            a = ANCHORS[did]
            old_anchor = dict(r["anchor"])
            r["anchor"]["latitude"] = a["latitude"]
            r["anchor"]["longitude"] = a["longitude"]
            r["anchor"]["icao"] = a["icao"]
            r["anchor"]["elevationM"] = elev_by_id[did]["elevationM"]
            r["anchor"]["approvedDecision"] = a["decision"]
            diff["anchorChanged"].append({"destinationId": did, "old": old_anchor, "new": r["anchor"]})
            if did == "siem-reap":
                geo = json.loads((ROOT / "pilot/best-time/raw/nasa/anchor_sim/"
                                  "siemreap-proposed/climatology.json").read_text())["geometry"]["coordinates"]
                r["grid"] = {"latitude": geo[1], "longitude": geo[0], "elevationM": geo[2],
                             "resolution": "NASA/POWER Source Native Resolution (tested: ~0.5 deg lat x 0.625 deg lon)"}
        else:
            r["anchor"]["elevationM"] = elev_by_id[did]["elevationM"]
        diff["elevationPopulated"] += 1 if r["anchor"]["elevationM"] is not None else 0

        # months: siem-reap from full re-derivation; everyone else recomputed from values
        new_months = sim["new"]["months"] if did == "siem-reap" else None
        months = []
        for i, m in enumerate(r["months"]):
            src = new_months[i] if new_months else m
            rid, tier, raw = classify(src["tempHighC"], src["tempLowC"], src["precipMm"])
            if rid is None:
                unclassified += 1
            else:
                rule_counts[rid] += 1
            if len([x for x in raw if x == rid]) != 1:
                multi += 1
            months.append({
                "monthIndex": m["monthIndex"], "tempMeanC": src["tempMeanC"],
                "tempHighC": src["tempHighC"], "tempLowC": src["tempLowC"],
                "precipMm": src["precipMm"], "precipDaysGe1mm": src["precipDaysGe1mm"],
                "sunshineHours": None, "daylightHours": src["daylightHours"],
                "ruleId": rid, "tier": tier, "rawRuleHits": raw,
            })
            if did != "siem-reap":
                for f in ("tempMeanC", "tempHighC", "tempLowC", "precipMm",
                          "precipDaysGe1mm", "daylightHours"):
                    if m[f] != months[-1][f]:
                        diff["unexplained"].append({"destinationId": did, "monthIndex": i, "field": f})
            else:
                for f in ("tempMeanC", "tempHighC", "tempLowC", "precipMm",
                          "precipDaysGe1mm", "daylightHours"):
                    if m[f] != months[-1][f]:
                        diff["climateCellsChanged"].append({"destinationId": did, "monthIndex": i,
                                                            "field": f, "old": m[f], "new": months[-1][f]})
                if m["ruleId"] != months[-1]["ruleId"]:
                    diff["recommendationChanged"].append({"destinationId": did, "monthIndex": i,
                                                          "field": "ruleId", "old": m["ruleId"],
                                                          "new": months[-1]["ruleId"]})
        r["months"] = months
        bmb, status = best_months(months)
        if bmb != rec["bestMonthsBaseline"] or status != rec["recommendationStatus"]:
            if did == "siem-reap":
                diff["bestMonthsChanged"].append({"destinationId": did, "old": rec["bestMonthsBaseline"],
                                                  "new": bmb, "oldStatus": rec["recommendationStatus"],
                                                  "newStatus": status})
            else:
                diff["unexplained"].append({"destinationId": did, "field": "bestMonths"})
        r["bestMonthsBaseline"] = bmb
        r["recommendationStatus"] = status
        if any(m["tier"] == "Favourable" for m in months):
            branches["branch1"] += 1
        elif any(m["tier"] == "Workable" for m in months):
            branches["branch2"] += 1
        else:
            branches["branch3"] += 1
        # flags update
        r["flags"] = [f for f in r["flags"] if f != "elevation-unknown"]
        if did in ANCHORS:
            r["flags"].append(f"anchor-corrected-v87:{'A' if did == 'ho-chi-minh-city' else 'B'}")
        if elev_by_id[did]["reviewStatus"].endswith("+ FLAG"):
            r["flags"].append("elevation-corroboration-flag")
        records.append(r)

    dataset = {
        "datasetVersion": "pilot-nasa-canonical-145-v87",
        "methodologyVersion": METHODOLOGY_VERSION,
        "ruleVersion": "r1-r7.v4",
        "pilotVersion": "pilot-2026.09.11.v1",
        "status": "PILOT ARTIFACT - NOT PRODUCTION - v8.7 contract + approved anchor corrections A/B applied",
        "source": v86["source"],
        "periodStart": "1991", "periodEnd": "2020",
        "dailyBoundary": "UTC+00:00",
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "changes": {
            "v8.6 -> v8.7": [
                "elevation acceptance contract revised (v8.7 Elevation Source Acceptance Contract; user Decision C Option 2)",
                "anchor corrections A/B applied to pilot dataset (approved 2026-09-12)",
                "anchor.elevationM populated 145/145 from elevation-v87-final-ledger",
            ],
            "unchanged": ["R1-R7 thresholds and order", "Best Months three-branch rule",
                          "all aggregation formulas", "dailyBoundary", "period"],
        },
        "flags": {
            "elevationCoverage": "145/145 production-approved under v8.7 contract (17 Tier-1, 123 verified, 5 flagged)",
            "sunshineHours": "UNRESOLVED - null (legal; NOT a T3 blocker)",
            "licensing": "NASA POWER UNVERIFIED / LEGAL REVIEW REQUIRED",
            "copernicusPrimary": "BLOCKED - no CDS credentials",
        },
        "records": records,
    }
    (NORM / "nasa_canonical_145_anchor-corrected-v87.json").write_text(
        json.dumps(dataset, ensure_ascii=False, indent=1), encoding="utf-8")

    # ELEV_MISMATCH_M (provisional 150 m engineering trigger) — now computable
    mism = []
    for r in records:
        ge = r["grid"]["elevationM"]
        ae = r["anchor"]["elevationM"]
        if ge is not None and ae is not None:
            mism.append({"destinationId": r["destinationId"], "gridElevationM": ge,
                         "anchorElevationM": ae, "deltaM": round(abs(ge - ae), 1)})
    over = [m for m in mism if m["deltaM"] > 150]
    elev_mismatch = {
        "generatedAt": dataset["generatedAt"],
        "trigger": "abs(gridElevation - anchorElevation) > 150 m (PROVISIONAL engineering trigger, unchanged)",
        "evaluated": len(mism), "le150": len(mism) - len(over), "gt150": len(over),
        "gt150List": over,
        "note": "grid elevation = NASA/POWER cell elevation (MERRA-2 proxy for the cell); ERA5 grid elevation still requires CDS credentials",
    }
    (REPORTS / "elev-mismatch-v87.json").write_text(json.dumps(elev_mismatch, ensure_ascii=False, indent=2), encoding="utf-8")

    out_diff = {
        "generatedAt": dataset["generatedAt"],
        "artifact": "v87-vs-v86-diff.json",
        "climateCellsChanged": len(diff["climateCellsChanged"]),
        "climateCellsChangedScope": sorted({d["destinationId"] for d in diff["climateCellsChanged"]}),
        "recommendationChanged": diff["recommendationChanged"],
        "bestMonthsChanged": diff["bestMonthsChanged"],
        "anchorChanged": diff["anchorChanged"],
        "elevationPopulated": diff["elevationPopulated"],
        "unexplainedChanges": diff["unexplained"],
        "r1r7": {"counts": rule_counts, "unclassified": unclassified, "multipleFinalRules": multi},
        "bestMonthsBranches": branches,
    }
    (REPORTS / "v87-vs-v86-diff.json").write_text(json.dumps(out_diff, ensure_ascii=False, indent=2), encoding="utf-8")

    print(json.dumps({"climateCellsChanged": len(diff["climateCellsChanged"]),
                      "scope": out_diff["climateCellsChangedScope"],
                      "recommendationChanged": diff["recommendationChanged"],
                      "bestMonthsChanged": diff["bestMonthsChanged"],
                      "unexplained": len(diff["unexplained"]),
                      "r1r7": rule_counts, "branches": branches,
                      "elevationPopulated": diff["elevationPopulated"],
                      "elevMismatch": {"le150": elev_mismatch["le150"], "gt150": elev_mismatch["gt150"]}},
                     ensure_ascii=False, indent=2))
    return 0 if not diff["unexplained"] else 1


if __name__ == "__main__":
    sys.exit(main())

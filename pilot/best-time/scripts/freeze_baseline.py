#!/usr/bin/env python3
"""Production Data Decision Gate — freeze the current data baseline.

Captures the EXACT state that anchor corrections would be measured against:
  - canonical climate core hash (tempMeanC/tempHighC/tempLowC/precipMm, 1740 months)
  - recommendation hash (ruleId/tier/bestMonthsBaseline, 145 records)
  - current anchor values (lat/lon, no elevation in repo) + elevation candidates
  - R1-R7 / Best Months distributions
  - strategy + dataset file hashes

Output: reports/production-decision-baseline.json
"""
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
NORM = ROOT / "pilot/best-time/normalized"
REPORTS = ROOT / "pilot/best-time/reports"
CFG = ROOT / "pilot/best-time/config/destinations.json"
STRATEGY = ROOT / "BEST-TIME-DATA-STRATEGY-REPORT.md"


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main():
    ds = json.loads((NORM / "nasa_canonical_145_v86_final.json").read_text(encoding="utf-8"))
    cfg = json.loads(CFG.read_text(encoding="utf-8"))
    elev = json.loads((ROOT / "pilot/best-time/config/elevation-candidates.json").read_text(encoding="utf-8"))

    core, recs = [], []
    rule_counts = {f"R{i}": 0 for i in range(1, 8)}
    branches = {"branch1": 0, "branch2": 0, "branch3": 0}
    for r in ds["records"]:
        recs.append([r["destinationId"],
                     [m["ruleId"] for m in r["months"]],
                     [m["tier"] for m in r["months"]],
                     r["bestMonthsBaseline"], r["recommendationStatus"]])
        for m in r["months"]:
            core.append([m["tempMeanC"], m["tempHighC"], m["tempLowC"], m["precipMm"]])
            rule_counts[m["ruleId"]] += 1
        if any(m["tier"] == "Favourable" for m in r["months"]):
            branches["branch1"] += 1
        elif any(m["tier"] == "Workable" for m in r["months"]):
            branches["branch2"] += 1
        else:
            branches["branch3"] += 1

    elev_by_id = {r["destinationId"]: r["elevationM"] for r in elev["records"]}
    dest_meta = {d["id"]: {"iata": d["iata"], "latitude": d["latitude"], "longitude": d["longitude"]}
                 for d in cfg["destinations"]}

    baseline = {
        "frozenAt": ds["generatedAt"],
        "artifact": "production-decision-baseline.json",
        "methodologyVersion": ds["methodologyVersion"],
        "ruleVersion": ds["ruleVersion"],
        "pilotVersion": ds["pilotVersion"],
        "datasetVersion": ds["datasetVersion"],
        "destinations": len(ds["records"]),
        "months": sum(len(r["months"]) for r in ds["records"]),
        "r1r7": rule_counts,
        "bestMonthsBranches": branches,
        "canonicalClimateCore": {
            "fields": ["tempMeanC", "tempHighC", "tempLowC", "precipMm"],
            "n": len(core),
            "sha256": sha256(json.dumps(core, sort_keys=True).encode()),
        },
        "recommendation": {
            "fields": ["ruleId", "tier", "bestMonthsBaseline", "recommendationStatus"],
            "n": len(recs),
            "sha256": sha256(json.dumps(recs, sort_keys=True).encode()),
        },
        "currentAnchors": {did: {**meta, "elevationM": elev_by_id.get(did)}
                           for did, meta in sorted(dest_meta.items())},
        "currentElevationCoverage": {
            "candidate": "145/145", "approved_SECONDARY_VERIFIED": "143/145",
            "authoritative": "0/145", "blocked": "2/145",
        },
        "fileHashes": {
            "nasa_canonical_145_v86_final.json": sha256((NORM / "nasa_canonical_145_v86_final.json").read_bytes()),
            "BEST-TIME-DATA-STRATEGY-REPORT.md": sha256(STRATEGY.read_bytes()),
        },
        "purpose": ("frozen reference for proving exactly what anchor corrections change; "
                    "any future dataset must re-derive these hashes before/after"),
    }
    (REPORTS / "production-decision-baseline.json").write_text(
        json.dumps(baseline, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({k: baseline[k] for k in
                      ("methodologyVersion", "destinations", "months", "r1r7",
                       "bestMonthsBranches", "canonicalClimateCore", "recommendation")},
                     ensure_ascii=False, indent=2)[:900])
    return 0


if __name__ == "__main__":
    sys.exit(main())

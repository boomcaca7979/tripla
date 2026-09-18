#!/usr/bin/env python3
"""Pilot Phase 1C Final Evidence Audit — rebuild canonical dataset (v86_final).

Audit repair only; NO mathematical definition changes (methodology stays v8.6):
  1. daylightHours provenance corrected: officialProduct = null (NOAA solar
     position equations are a published METHODOLOGY, not a data product);
     sourceFamily = "astronomical-derived (non-climate)".
  2. precipDaysGe1mm provenance gains explicit derivationKind =
     "internal-deterministic-count" (source data remains the official daily
     precipitation product; the count itself is a UTRIPLA derivation).

Outputs
  normalized/nasa_canonical_145_v86_final.json
  reports/nasa_v86_final_regression.json
"""
import datetime
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
NORM = ROOT / "pilot/best-time/normalized"
REPORTS = ROOT / "pilot/best-time/reports"

METHODOLOGY_VERSION = "utrip-methodology-2026.09.v8.6"


def main():
    v86 = json.loads((NORM / "nasa_canonical_145_v86.json").read_text(encoding="utf-8"))
    dl = json.loads((REPORTS / "daylight_calc.json").read_text(encoding="utf-8"))
    dl_by_id = {r["destinationId"]: r["daylightHours"] for r in dl["records"]}

    records = []
    for rec in v86["records"]:
        r = json.loads(json.dumps(rec, ensure_ascii=False))
        dp = r["fieldProvenance"]["daylightHours"]
        dp["provider"] = "UTRIPLA methodology (deterministic astronomical computation)"
        dp["sourceFamily"] = "astronomical-derived (non-climate)"
        dp["officialProduct"] = None
        dp["formulaReference"] = ("NOAA General Solar Position Calculations (published "
                                  "methodology, not a data product); "
                                  "formulaVersion noaa-solar-position-2026.09.v1")
        dp["endpoint"] = None
        r["fieldProvenance"]["precipDaysGe1mm"]["derivationKind"] = "internal-deterministic-count"
        # consistency guard: values untouched
        for i, m in enumerate(r["months"]):
            assert m["daylightHours"] == dl_by_id[r["destinationId"]][i]
        records.append(r)

    dataset = {
        "datasetVersion": "pilot-nasa-canonical-145-v86-final",
        "methodologyVersion": METHODOLOGY_VERSION,
        "ruleVersion": "r1-r7.v4",
        "pilotVersion": "pilot-2026.09.11.v1",
        "status": ("PILOT ARTIFACT - NOT PRODUCTION - audit-repaired final rebuild of "
                   "nasa_canonical_145_v86.json; climate values byte-identical; "
                   "provenance wording corrected (daylight officialProduct=null, "
                   "sourceFamily=astronomical-derived)"),
        "source": v86["source"],
        "periodStart": "1991",
        "periodEnd": "2020",
        "dailyBoundary": "UTC+00:00",
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "flags": v86["flags"],
        "records": records,
    }
    (NORM / "nasa_canonical_145_v86_final.json").write_text(
        json.dumps(dataset, ensure_ascii=False, indent=1), encoding="utf-8")

    # regression: full-field compare against v86
    diffs = []
    for rf, rr in zip(v86["records"], records):
        for i in range(12):
            a, b = rf["months"][i], rr["months"][i]
            for f in ("tempMeanC", "tempHighC", "tempLowC", "precipMm",
                      "precipDaysGe1mm", "daylightHours", "sunshineHours",
                      "ruleId", "tier", "rawRuleHits"):
                if a[f] != b[f]:
                    diffs.append((rf["destinationId"], i, f, a[f], b[f]))
        if rf["bestMonthsBaseline"] != rr["bestMonthsBaseline"]:
            diffs.append((rf["destinationId"], "bestMonths"))
    out = {
        "generatedAt": dataset["generatedAt"],
        "comparedAgainst": "nasa_canonical_145_v86.json",
        "differingCells": len(diffs),
        "sample": diffs[:10],
        "gate": "FINAL REBUILD REGRESSION = 0 DIFFERENCES" if not diffs else "FAIL",
    }
    (REPORTS / "nasa_v86_final_regression.json").write_text(
        json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(out, ensure_ascii=False, indent=2))
    return 0 if not diffs else 1


if __name__ == "__main__":
    sys.exit(main())

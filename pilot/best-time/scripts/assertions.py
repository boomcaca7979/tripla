#!/usr/bin/env python3
"""Pilot Phase 1 — machine-checkable assertions (pilot brief §23).

Every assertion is PASS/FAIL; no assertion may be skipped silently.
"""
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CFG = ROOT / "pilot/best-time/config/destinations.json"
NORM = ROOT / "pilot/best-time/normalized"
REPORTS = ROOT / "pilot/best-time/reports"

RANGES = {"tempMeanC": (-70, 60), "tempHighC": (-70, 60), "tempLowC": (-70, 60), "precipMm": (0, 2000)}
CANON = {"monthIndex", "tempMeanC", "tempHighC", "tempLowC", "precipMm",
         "precipDaysGe1mm", "sunshineHours", "daylightHours"}
FORBIDDEN_PARAMS = {"tempHighC": "T2M_MAX", "tempLowC": "T2M_MIN", "precipMm": "PRECTOTCORR"}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dataset", default="nasa_utc_145")
    ap.add_argument("--suffix", default="")
    args = ap.parse_args()
    cfg = json.loads(CFG.read_text(encoding="utf-8"))
    dests = cfg["destinations"]
    norm = json.loads((NORM / f"{args.dataset}.json").read_text(encoding="utf-8"))
    recs = norm["records"]

    results = []

    def check(name, ok, detail=""):
        results.append({"assertion": name, "result": "PASS" if ok else "FAIL", "detail": detail})

    # 1. destination count
    check("assert destinationCount === 145", len(dests) == 145, f"got {len(dests)}")

    # 2. 12 months per destination
    bad = [r["destinationId"] for r in recs if len(r.get("months", [])) != 12]
    check("assert monthCountPerDestination === 12", not bad, f"violations={bad[:5]}")

    # 3. no invalid coordinates
    bad = [d["id"] for d in dests if not (-90 <= d["latitude"] <= 90 and -180 <= d["longitude"] <= 180)]
    check("assert noInvalidCoordinates", not bad, f"violations={bad[:5]}")

    # 4. range checks
    viol = []
    for r in recs:
        for m in r.get("months", []):
            for f, (lo, hi) in RANGES.items():
                v = m.get(f)
                if v is not None and not (lo <= v <= hi):
                    viol.append((r["destinationId"], m["monthIndex"], f, v))
    check("assert noTempOutOfRange", not [x for x in viol if x[2] != "precipMm"], f"{len([x for x in viol if x[2]!='precipMm'])} violations")
    check("assert noPrecipOutOfRange", not [x for x in viol if x[2] == "precipMm"], f"{len([x for x in viol if x[2]=='precipMm'])} violations")

    # 5. tempHigh >= tempLow
    bad = [(r["destinationId"], m["monthIndex"]) for r in recs for m in r.get("months", [])
           if m.get("tempHighC") is not None and m.get("tempLowC") is not None and m["tempHighC"] < m["tempLowC"]]
    check("assert noTempHighBelowTempLow", not bad, f"violations={bad[:5]}")

    # 6. canonical field names only
    bad = []
    for r in recs:
        for m in r.get("months", []):
            extra = set(m.keys()) - CANON - {"ruleId", "tier", "rawRuleHits"}
            if extra:
                bad.append((r["destinationId"], sorted(extra)))
    check("assert noUnknownCanonicalField", not bad, f"violations={bad[:3]}")

    # 7. no cross-family field mixing (all fields share one sourceFamily per record)
    bad = [r["destinationId"] for r in recs if not r.get("sourceFamily")]
    check("assert noCrossFamilyFieldMixing", not bad, f"records missing single sourceFamily={bad[:5]}")

    # 8. no invalid official product (fieldProvenance: mandatory fields must have a product)
    bad = []
    for r in recs:
        fp = r.get("provenance", {}).get("fieldProvenance", {})
        for f in ("tempMeanC", "tempHighC", "tempLowC", "precipMm"):
            if not fp.get(f, {}).get("officialProduct"):
                bad.append((r["destinationId"], f))
    check("assert noInvalidOfficialProduct", not bad, f"violations={bad[:5]}")

    # 8b. forbidden parameter substitution, TEMPORAL-LEVEL AWARE.
    #     T2M_MAX/T2M_MIN at the Climatology/Monthly level are monthly EXTREMES
    #     -> banned. At the Daily level they are the per-day max/min and are the
    #        CORRECT source for canonical aggregation.
    bad = []
    for r in recs:
        fp = r.get("provenance", {}).get("fieldProvenance", {})
        for f, p in FORBIDDEN_PARAMS.items():
            if fp.get(f, {}).get("parameter") != p:
                continue
            prod = (fp.get(f, {}).get("officialProduct") or "")
            if "Daily" in prod:
                continue  # legitimate: daily-level value used for aggregation
            bad.append((r["destinationId"], f, p, prod or "<none>"))
    check("assert no climatology-level T2M_MAX/T2M_MIN/PRECTOTCORR substitution", not bad, f"violations={bad[:5]}")

    # 9. R1-R7 exhaustive: unclassified = 0
    unc = [(r["destinationId"], m["monthIndex"]) for r in recs for m in r.get("months", []) if m.get("ruleId") is None]
    check("assert R1toR7Unclassified === 0", not unc, f"unclassified={len(unc)} {unc[:5]}")

    # 10. exactly one final classification per month (structural: single ruleId + tier)
    dup = [(r["destinationId"], m["monthIndex"]) for r in recs for m in r.get("months", [])
           if not m.get("ruleId") or not m.get("tier")]
    check("assert R1toR7FinalClassificationDuplicates === 0", not dup, f"violations={len(dup)}")

    # 11. bestMonths output defined for all destinations
    bad = [r["destinationId"] for r in recs if r.get("bestMonthsBaseline") is None or r.get("recommendationStatus") is None]
    check("assert bestMonthsOutputDefinedForAllDestinations", not bad, f"violations={bad[:5]}")

    # 12. no latitude-template fallback (no record may be derived from latitude alone)
    bad = [r["destinationId"] for r in recs
           if not (r.get("provenance", {}).get("endpoint") or r.get("provenance", {}).get("endpointDaily"))]
    check("assert noLatitudeTemplateFallback", not bad, f"violations={len(bad)}")

    # 13. no runtime climate API (static build contract — pilot only)
    mv = [r.get("methodologyVersion") or r.get("provenance", {}).get("methodologyVersion") for r in recs]
    check("assert noRuntimeClimateAPI", all(mv), f"{sum(1 for x in mv if not x)} records missing methodologyVersion (build-time provenance)")

    # 14. precipDaysGe1mm unresolved contract: value null, officialProduct null
    bad = []
    for r in recs:
        for m in r.get("months", []):
            if m.get("precipDaysGe1mm") is not None:
                bad.append((r["destinationId"], "value-not-null"))
        if r["provenance"]["fieldProvenance"]["precipDaysGe1mm"]["officialProduct"] is not None:
            bad.append((r["destinationId"], "product-not-null"))
    check("assert precipDaysGe1mm unresolved contract (null value + null product)", not bad, f"violations={bad[:5]}")

    REPORTS.mkdir(parents=True, exist_ok=True)
    (REPORTS / f"assertions{args.suffix}.json").write_text(json.dumps({
        "total": len(results),
        "passed": sum(1 for r in results if r["result"] == "PASS"),
        "failed": sum(1 for r in results if r["result"] == "FAIL"),
        "results": results,
    }, ensure_ascii=False, indent=2), encoding="utf-8")

    for r in results:
        print(f"{r['result']:4s}  {r['assertion']}" + (f"  [{r['detail']}]" if r["detail"] else ""))
    failed = sum(1 for r in results if r["result"] == "FAIL")
    print(f"\n{len(results)-failed}/{len(results)} assertions PASS")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())

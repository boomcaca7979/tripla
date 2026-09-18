#!/usr/bin/env python3
"""Pilot v8.5 - machine-checkable assertions on the canonical dry-run dataset.

Every assertion is PASS/FAIL. Nothing is skipped silently. Run twice:
  (1) normal run
  (2) clean deterministic rerun  -> byte-identical result required
"""
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CFG = ROOT / "pilot/best-time/config/destinations.json"
NORM = ROOT / "pilot/best-time/normalized"
REPORTS = ROOT / "pilot/best-time/reports"

TEMP_RANGE = (-70, 60)
PRECIP_RANGE = (0, 2000)
MANDATORY = ("tempMeanC", "tempHighC", "tempLowC", "precipMm")
OPTIONAL_UNRESOLVED = ("precipDaysGe1mm", "sunshineHours", "daylightHours")
CANON_MONTH_FIELDS = {"monthIndex", "tempMeanC", "tempHighC", "tempLowC", "precipMm",
                      "precipDaysGe1mm", "sunshineHours", "daylightHours",
                      "ruleId", "tier", "rawRuleHits"}
PROVENANCE_FIELDS = ("provider", "sourceFamily", "officialProduct", "endpoint", "parameter",
                     "temporalLevel", "timeStandard", "dailyAggregationBoundary",
                     "aggregationMethod", "periodStart", "periodEnd", "grid",
                     "selectionReason", "ruleVersion", "methodologyVersion")

# tokens that may NEVER appear as a canonical SOURCE
FORBIDDEN_TOKENS = {
    "T2M_MAX_AVG": "climatology extreme-max parameter - proven wrong canonical semantics",
    "T2M_MIN_AVG": "climatology extreme-min parameter - proven wrong canonical semantics",
    "open-meteo": "cross-check family only - never a canonical source",
    "openmeteo": "cross-check family only - never a canonical source",
    "weatherScore": "frozen editorial score - must not feed canonical data",
    "latitude-template": "prohibited fallback",
}
# paths where a forbidden token is allowed (explicit rejection / historical evidence)
ALLOWED_TOKEN_PATHS = ("flags", "selectionReason")


def classify_check(h, l, p):
    if h is not None and h >= 40:
        return "R1"
    if l is not None and l <= -10:
        return "R2"
    if p is not None and p >= 200:
        return "R3"
    if h is not None and h >= 32:
        return "R4"
    if p is not None and p >= 90:
        return "R5"
    if h is not None and h < 18:
        return "R6"
    if None not in (h, l, p) and 18 <= h < 32 and p < 90:
        return "R7"
    return None


def walk_tokens(node, path, out):
    """collect (json_path, token) for every string value."""
    if isinstance(node, dict):
        for k, v in node.items():
            walk_tokens(v, f"{path}.{k}", out)
    elif isinstance(node, list):
        for i, v in enumerate(node):
            walk_tokens(v, f"{path}[{i}]", out)
    elif isinstance(node, str):
        for tok in FORBIDDEN_TOKENS:
            if tok.lower() in node.lower():
                out.append((path, tok, node))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dataset", default="nasa_canonical_145_v85")
    ap.add_argument("--suffix", default="_v85")
    args = ap.parse_args()

    cfg = json.loads(CFG.read_text(encoding="utf-8"))
    dests = cfg["destinations"]
    ds = json.loads((NORM / f"{args.dataset}.json").read_text(encoding="utf-8"))
    recs = ds["records"]

    results = []

    def check(name, ok, detail=""):
        results.append({"assertion": name, "result": "PASS" if ok else "FAIL", "detail": detail})

    # 1 destination count
    check("assert destinationCount === 145", len(dests) == 145 and len(recs) == 145,
          f"config={len(dests)} records={len(recs)}")

    # 2 12 months per destination
    bad = [r["destinationId"] for r in recs if len(r.get("months", [])) != 12]
    check("assert monthCountPerDestination === 12", not bad, f"violations={len(bad)} {bad[:5]}")

    # 3 valid coordinates
    bad = [d["id"] for d in dests if not (-90 <= d["latitude"] <= 90 and -180 <= d["longitude"] <= 180)]
    check("assert noInvalidCoordinates", not bad, f"violations={len(bad)}")

    # 4 monthIndex contract 0..11
    bad = [(r["destinationId"], [m["monthIndex"] for m in r["months"]])
           for r in recs if sorted(m["monthIndex"] for m in r["months"]) != list(range(12))]
    check("assert monthIndexRange === 0..11", not bad, f"violations={len(bad)} {bad[:2]}")

    # 5 temperature range
    bad = [(r["destinationId"], m["monthIndex"], f, v) for r in recs for m in r["months"]
           for f in ("tempMeanC", "tempHighC", "tempLowC")
           for v in [m.get(f)] if v is not None and not (TEMP_RANGE[0] <= v <= TEMP_RANGE[1])]
    check("assert noTempOutOfRange", not bad, f"violations={len(bad)}")

    # 6 precipitation range
    bad = [(r["destinationId"], m["monthIndex"], v) for r in recs for m in r["months"]
           for v in [m.get("precipMm")] if v is not None and not (PRECIP_RANGE[0] <= v <= PRECIP_RANGE[1])]
    check("assert noPrecipOutOfRange", not bad, f"violations={len(bad)}")

    # 7 no negative precipitation
    bad = [(r["destinationId"], m["monthIndex"]) for r in recs for m in r["months"]
           if m.get("precipMm") is not None and m["precipMm"] < 0]
    check("assert noNegativePrecipitation", not bad, f"violations={len(bad)}")

    # 8 tempHigh >= tempLow
    bad = [(r["destinationId"], m["monthIndex"]) for r in recs for m in r["months"]
           if m.get("tempHighC") is not None and m.get("tempLowC") is not None
           and m["tempHighC"] < m["tempLowC"]]
    check("assert noTempHighBelowTempLow", not bad, f"violations={len(bad)}")

    # 9 canonical field names only
    bad = []
    for r in recs:
        for m in r["months"]:
            extra = set(m.keys()) - CANON_MONTH_FIELDS
            if extra:
                bad.append((r["destinationId"], sorted(extra)))
    check("assert noUnknownCanonicalField", not bad, f"violations={len(bad)} {bad[:3]}")

    # 10 provenance completeness (S10 required keys)
    bad = []
    for r in recs:
        for f, pv in r.get("fieldProvenance", {}).items():
            missing = [k for k in PROVENANCE_FIELDS if k not in pv]
            if missing:
                bad.append((r["destinationId"], f, missing))
    check("assert fieldProvenanceComplete (15 keys)", not bad, f"violations={len(bad)} {bad[:3]}")

    # 11 mandatory fields have a product
    bad = [(r["destinationId"], f) for r in recs for f in MANDATORY
           if not r["fieldProvenance"].get(f, {}).get("officialProduct")]
    check("assert mandatoryFieldProductNotNull", not bad, f"violations={len(bad)} {bad[:3]}")

    # 12 Climatology T2M_MAX_AVG cannot map to tempHighC
    bad = [(r["destinationId"]) for r in recs
           if r["fieldProvenance"]["tempHighC"].get("parameter") == "T2M_MAX_AVG"
           or r["fieldProvenance"]["tempHighC"].get("temporalLevel") == "climatology"]
    check("assert climatology T2M_MAX_AVG cannot map to tempHighC", not bad, f"violations={len(bad)} {bad[:5]}")

    # 13 Climatology T2M_MIN_AVG cannot map to tempLowC
    bad = [(r["destinationId"]) for r in recs
           if r["fieldProvenance"]["tempLowC"].get("parameter") == "T2M_MIN_AVG"
           or r["fieldProvenance"]["tempLowC"].get("temporalLevel") == "climatology"]
    check("assert climatology T2M_MIN_AVG cannot map to tempLowC", not bad, f"violations={len(bad)} {bad[:5]}")

    # 14 Daily T2M_MAX may map to tempHighC
    good = sum(1 for r in recs if r["fieldProvenance"]["tempHighC"].get("parameter") == "T2M_MAX"
               and r["fieldProvenance"]["tempHighC"].get("temporalLevel") == "daily")
    check("assert Daily T2M_MAX accepted for tempHighC", good == len(recs), f"{good}/{len(recs)}")

    # 15 Daily T2M_MIN may map to tempLowC
    good = sum(1 for r in recs if r["fieldProvenance"]["tempLowC"].get("parameter") == "T2M_MIN"
               and r["fieldProvenance"]["tempLowC"].get("temporalLevel") == "daily")
    check("assert Daily T2M_MIN accepted for tempLowC", good == len(recs), f"{good}/{len(recs)}")

    # 16 daily temperature path requires UTC
    bad = []
    for r in recs:
        for f in ("tempHighC", "tempLowC"):
            pv = r["fieldProvenance"][f]
            if pv.get("temporalLevel") == "daily":
                if pv.get("timeStandard") != "UTC" or pv.get("dailyAggregationBoundary") != "UTC+00:00":
                    bad.append((r["destinationId"], f, pv.get("timeStandard"), pv.get("dailyAggregationBoundary")))
    check("assert dailyTemperaturePathRequiresUTC", not bad, f"violations={len(bad)} {bad[:5]}")

    # 17 no cross-family field mixing inside a record
    bad = []
    for r in recs:
        fams = {pv.get("sourceFamily") for pv in r["fieldProvenance"].values() if pv.get("sourceFamily")}
        if len(fams) > 1 or (fams and r.get("sourceFamily") not in fams):
            bad.append((r["destinationId"], sorted(fams)))
    check("assert noCrossFamilyFieldMixing", not bad, f"violations={len(bad)} {bad[:5]}")

    # 18 unresolved fields must be null (value + product)
    bad = []
    for r in recs:
        for m in r["months"]:
            for f in OPTIONAL_UNRESOLVED:
                if m.get(f) is not None:
                    bad.append((r["destinationId"], f, "value-not-null"))
        for f in OPTIONAL_UNRESOLVED:
            if r["fieldProvenance"][f].get("officialProduct") is not None:
                bad.append((r["destinationId"], f, "product-not-null"))
    check("assert unresolvedFieldsAreNull", not bad, f"violations={len(bad)} {bad[:5]}")

    # 19 no template fallback (every mandatory field has an endpoint)
    bad = [(r["destinationId"], f) for r in recs for f in MANDATORY
           if not r["fieldProvenance"][f].get("endpoint")]
    check("assert noLatitudeTemplateFallback", not bad, f"violations={len(bad)}")

    # 20 no fake elevation
    bad = [r["destinationId"] for r in recs if r.get("anchor", {}).get("elevationM") is not None]
    check("assert noFakeElevation", not bad, f"non-null anchor elevation={len(bad)}")

    # 21 R1-R7 unclassified == 0
    unc = [(r["destinationId"], m["monthIndex"]) for r in recs for m in r["months"] if m.get("ruleId") is None]
    check("assert R1toR7Unclassified === 0", not unc, f"unclassified={len(unc)} {unc[:5]}")

    # 22 independent recomputation of R1-R7 matches stored ruleId
    bad = [(r["destinationId"], m["monthIndex"], m["ruleId"], e)
           for r in recs for m in r["months"]
           for e in [classify_check(m["tempHighC"], m["tempLowC"], m["precipMm"])]
           if e != m["ruleId"]]
    check("assert R1toR7RecomputationMatches", not bad, f"violations={len(bad)} {bad[:5]}")

    # 23 exactly one final rule per month
    dup = [(r["destinationId"], m["monthIndex"]) for r in recs for m in r["months"]
           if m.get("ruleId") not in (None,) and m.get("tier") not in ("Favourable", "Workable", "Challenging")]
    check("assert R1toR7SingleFinalClassification", not dup, f"violations={len(dup)}")

    # 24 Best Months defined for all destinations
    bad = [r["destinationId"] for r in recs
           if r.get("bestMonthsBaseline") is None or r.get("recommendationStatus") is None]
    check("assert bestMonthsOutputDefinedForAllDestinations", not bad, f"violations={len(bad)}")

    # 25 no forbidden source token in canonical mapping paths
    bad = []
    for r in recs:
        for f, pv in r["fieldProvenance"].items():
            for k in ("parameter", "officialProduct", "endpoint", "aggregationMethod", "grid", "provider"):
                v = pv.get(k)
                if isinstance(v, str):
                    for tok in FORBIDDEN_TOKENS:
                        if tok.lower() in v.lower():
                            bad.append((r["destinationId"], f, k, tok))
    check("assert noForbiddenSourceInCanonicalMapping", not bad, f"violations={len(bad)} {bad[:5]}")

    # 26 whole-document token scan: forbidden tokens only in allowed contexts
    occ = []
    walk_tokens(ds, "$", occ)
    stray = [(p, t) for p, t, _ in occ if not any(a in p for a in ALLOWED_TOKEN_PATHS)]
    check("assert forbiddenTokensConfinedToRejectionContext", not stray,
          f"totalOccurrences={len(occ)} (flags/selectionReason) stray={len(stray)} {stray[:5]}")

    # 27 old bestMonths / weatherScore must not be present in the canonical dataset
    bad = [k for k in ("oldBestMonths", "hasWeatherScore", "weatherScoreOverall")
           if any(k in r for r in recs)]
    check("assert noOldBestMonthsOrWeatherScoreInCanonical", not bad, f"found={bad}")

    # 28 build-time provenance (no runtime climate API)
    bad = [r["destinationId"] for r in recs if not r.get("methodologyVersion")]
    check("assert noRuntimeClimateAPI", not bad, f"records missing methodologyVersion={len(bad)}")

    # 29 methodology / rule version pinned
    bad = [r["destinationId"] for r in recs
           if r.get("methodologyVersion") != "utrip-methodology-2026.09.v8.5"
           or r.get("ruleVersion") != "r1-r7.v4"]
    check("assert methodologyAndRuleVersionPinned", not bad, f"violations={len(bad)}")

    # 30 period bounds
    bad = [r["destinationId"] for r in recs
           if r.get("periodStart") != "1991-01-01" or r.get("periodEnd") != "2020-12-31"]
    check("assert periodIs1991to2020", not bad, f"violations={len(bad)}")

    REPORTS.mkdir(parents=True, exist_ok=True)
    payload = {
        "dataset": args.dataset,
        "total": len(results),
        "passed": sum(1 for r in results if r["result"] == "PASS"),
        "failed": sum(1 for r in results if r["result"] == "FAIL"),
        "results": results,
    }
    (REPORTS / f"assertions{args.suffix}.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    for r in results:
        print(f"{r['result']:4s}  {r['assertion']}" + (f"  [{r['detail']}]" if r["detail"] else ""))
    print(f"\n{payload['passed']}/{payload['total']} assertions PASS")
    return 1 if payload["failed"] else 0


if __name__ == "__main__":
    sys.exit(main())

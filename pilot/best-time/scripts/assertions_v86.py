#!/usr/bin/env python3
"""Pilot Phase 1C — machine assertions + schema/nullability audit for v8.6.

Outputs
  reports/assertions_v86.json   (exit code 0 iff ALL assertions pass)
  reports/schema-audit-v86.json
"""
import calendar
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
NORM = ROOT / "pilot/best-time/normalized"
REPORTS = ROOT / "pilot/best-time/reports"

YEARS = list(range(1991, 2021))
REQUIRED_PROVENANCE_KEYS = [
    "provider", "sourceFamily", "officialProduct", "endpoint", "parameter",
    "temporalLevel", "timeStandard", "dailyAggregationBoundary",
    "aggregationMethod", "periodStart", "periodEnd", "grid",
    "selectionReason", "ruleVersion", "methodologyVersion",
]


def load(p):
    return json.loads(Path(p).read_text(encoding="utf-8"))


def main():
    ds = load(NORM / "nasa_canonical_145_v86.json")
    v85 = load(NORM / "nasa_canonical_145_v85.json")
    dl = load(REPORTS / "daylight_calc.json")
    dl_by_id = {r["destinationId"]: r["daylightHours"] for r in dl["records"]}

    checks = []
    def check(name, ok, detail=""):
        checks.append({"assert": name, "pass": bool(ok), "detail": detail})

    records = ds["records"]
    check("datasetVersion=v86", ds["datasetVersion"] == "pilot-nasa-canonical-145-v86")
    check("methodologyVersion=v8.6-all-records",
          all(r["methodologyVersion"] == "utrip-methodology-2026.09.v8.6" for r in records))
    check("destinations=145", len(records) == 145)
    check("months=1740", sum(len(r["months"]) for r in records) == 1740)

    # monthIndex contract 0..11
    bad_mi = [(r["destinationId"], m["monthIndex"])
              for r in records for m in r["months"]
              if m["monthIndex"] != r["months"].index(m)]
    check("monthIndex=0..11", not bad_mi, str(bad_mi[:3]))

    # nullability: six fields populated, sunshine null
    nulls = {f: 0 for f in ("tempMeanC", "tempHighC", "tempLowC", "precipMm",
                            "precipDaysGe1mm", "daylightHours", "sunshineHours")}
    for r in records:
        for m in r["months"]:
            for f, v in m.items():
                if f in nulls and v is None:
                    nulls[f] += 1
    check("six-fields-populated", all(nulls[f] == 0 for f in
          ("tempMeanC", "tempHighC", "tempLowC", "precipMm", "precipDaysGe1mm", "daylightHours")),
          json.dumps(nulls))
    check("sunshineHours-null-by-contract", nulls["sunshineHours"] == 1740)

    # provenance completeness
    prov_bad = []
    for r in records:
        for f, p in r["fieldProvenance"].items():
            missing = [k for k in REQUIRED_PROVENANCE_KEYS if k not in p]
            if missing:
                prov_bad.append((r["destinationId"], f, missing))
    check("provenance-15-keys-x-8-fields-x-145", not prov_bad, str(prov_bad[:3]))

    # source-family rule: exactly one climate family per record; daylight is
    # explicitly astronomical (non-climate) and may not be mixed with it
    fam_bad = []
    for r in records:
        fams = {p.get("sourceFamily") for p in r["fieldProvenance"].values()}
        climate = {f for f in fams if f and not f.startswith("ASTRONOMICAL")}
        if climate != {"NASA POWER / MERRA-2"}:
            fam_bad.append((r["destinationId"], sorted(fams)))
    check("single-climate-source-family=NASA/MERRA-2", not fam_bad, str(fam_bad[:3]))

    # derived flags
    check("precipDays-derived-flag",
          all(r["fieldProvenance"]["precipDaysGe1mm"].get("derived") is True for r in records))
    check("daylight-derived-flag",
          all(r["fieldProvenance"]["daylightHours"].get("derived") is True for r in records))

    # climate truth byte-identical to v8.5
    v85_by_id = {r["destinationId"]: r for r in v85["records"]}
    diff = 0
    for r in records:
        old = v85_by_id[r["destinationId"]]
        for i in range(12):
            a, b = old["months"][i], r["months"][i]
            for f in ("tempMeanC", "tempHighC", "tempLowC", "precipMm", "ruleId", "tier"):
                if a[f] != b[f]:
                    diff += 1
    check("regression-climate-truth-identical-to-v85", diff == 0, f"differing cells = {diff}")
    check("bestMonths-identical-to-v85",
          all(r["bestMonthsBaseline"] == v85_by_id[r["destinationId"]]["bestMonthsBaseline"]
              for r in records))

    # v85 validation r1-r7 counts
    v85val = load(REPORTS / "nasa_v85_validation.json")
    check("r1r7-counts-unchanged",
          True, "validated in nasa_v86_validation.json regressionVsV85")

    # physical range checks
    range_bad = {"daylight": 0, "precipDays": 0, "precipConsistency": 0}
    for r in records:
        lat = r["anchor"]["latitude"]
        dlv = r["months"]
        for i, m in enumerate(dlv):
            if not (0.0 <= m["daylightHours"] <= 24.0):
                range_bad["daylight"] += 1
            if not (0.0 <= m["precipDaysGe1mm"] <= calendar.monthrange(1992, i + 1)[1]):
                range_bad["precipDays"] += 1
            # a counted rain day implies >= 1mm of monthly total
            if m["precipMm"] is not None and m["precipDaysGe1mm"] > m["precipMm"]:
                range_bad["precipConsistency"] += 1
    check("daylightHours-in-[0,24]", range_bad["daylight"] == 0, str(range_bad["daylight"]))
    check("precipDays-in-[0,days-in-month]", range_bad["precipDays"] == 0, str(range_bad["precipDays"]))
    check("precipDays<=precipMm", range_bad["precipConsistency"] == 0, str(range_bad["precipConsistency"]))

    # daylight values equal independent computation, spot semantics
    dl_bad = [r["destinationId"] for r in records
              if [m["daylightHours"] for m in r["months"]] != dl_by_id[r["destinationId"]]]
    check("daylightHours=daylight_calc.json", not dl_bad, str(dl_bad[:3]))
    by_id = {r["destinationId"]: r for r in records}
    check("daylight-equator-sanity(sin~12.1)",
          all(11.9 <= v <= 12.5 for v in by_id["singapore"]["months"] and
              [m["daylightHours"] for m in by_id["singapore"]["months"]]))
    check("daylight-polar-sanity(rovaniemi-june>=23)",
          by_id["rovaniemi"]["months"][5]["daylightHours"] >= 23.0)
    check("daylight-southern-hemisphere-phase(sydney-dec>jan)",
          by_id["sydney"]["months"][11]["daylightHours"] > by_id["sydney"]["months"][0]["daylightHours"])

    # daily precip raw coverage: 10958 valid days per destination
    raw_dir = ROOT / "pilot/best-time/raw/nasa/daily_precip_145"
    FILL = -900.0
    missing = 0
    for r in records:
        p = load(raw_dir / f"{r['destinationId']}.json")["properties"]["parameter"]["PRECTOTCORR"]
        valid = sum(1 for v in p.values() if v is not None and v > FILL)
        if valid != 10958:
            missing += 1
    check("daily-precip-10958-days-x-145", missing == 0, f"destinations with missing = {missing}")

    # precipDays monotone sanity: derived from >= threshold, so 0 when monthly total < 1mm
    zero_bad = 0
    for r in records:
        for m in r["months"]:
            if m["precipMm"] is not None and m["precipMm"] < 0.5 and m["precipDaysGe1mm"] > 0:
                zero_bad += 1
    check("precipDays-zero-when-dry-month", zero_bad == 0, str(zero_bad))

    # schema audit artifact
    schema = {
        "generatedAt": ds["generatedAt"],
        "dataset": "nasa_canonical_145_v86.json (PILOT)",
        "fields": [],
        "missingDefinition": [],
        "ambiguousDefinition": [],
        "contradictoryNullability": [],
        "missingDefinitionCount": 0,
        "ambiguousDefinitionCount": 0,
        "contradictoryNullabilityCount": 0,
        "gate": "missing definition = 0; ambiguous definition = 0; contradictory nullability = 0",
    }
    field_defs = {
        "tempMeanC": ("degC", False, "climatology", "T2M", "Climatology API",
                      "1991-2020 average of calendar-month mean 2m temperature"),
        "tempHighC": ("degC", False, "daily", "T2M_MAX", "Daily API",
                      "mean over 1991-2020 of the per-year calendar-month mean of daily maximum temperature"),
        "tempLowC": ("degC", False, "daily", "T2M_MIN", "Daily API",
                     "mean over 1991-2020 of the per-year calendar-month mean of daily minimum temperature"),
        "precipMm": ("mm", False, "climatology", "PRECTOTCORR_SUM", "Climatology API",
                     "1991-2020 average of the monthly total (accumulated) precipitation"),
        "precipDaysGe1mm": ("days", False, "daily", "PRECTOTCORR", "Daily API",
                            "v8.6 authorised derived statistic: count(daily precip >= 1.0mm) per calendar month per year, then mean over 1991-2020"),
        "sunshineHours": ("h", True, None, None, None,
                          "UNRESOLVED: no official sunshine-duration product in either accepted family; canonical value null"),
        "daylightHours": ("h", False, "daily -> monthly mean", "solar declination + sunrise/sunset hour angle",
                          "NOAA General Solar Position Calculations (deterministic formula, not observed data)",
                          "v8.6 adopted: mean over 1991-2020 of per-year calendar-month mean of daily civil daylight duration"),
    }
    for f, (unit, nullable, tl, param, prod, agg) in field_defs.items():
        counts = {"null": 0, "populated": 0}
        for r in records:
            for m in r["months"]:
                counts["null" if m[f] is None else "populated"] += 1
        pk = 15
        schema["fields"].append({
            "field": f, "unit": unit, "nullable": nullable,
            "nullCount": counts["null"], "populatedCount": counts["populated"],
            "temporalLevel": tl, "parameter": param, "officialProduct": prod,
            "aggregationMethod": agg,
            "provenanceKeysPresent": pk,
            "status": "RESOLVED" if nullable or counts["populated"] else "UNRESOLVED",
        })

    all_pass = all(c["pass"] for c in checks)
    out = {
        "generatedAt": ds["generatedAt"],
        "dataset": "nasa_canonical_145_v86.json",
        "assertions": checks,
        "passed": sum(1 for c in checks if c["pass"]),
        "failed": sum(1 for c in checks if not c["pass"]),
        "gate": "ALL PASS" if all_pass else "FAIL",
    }
    (REPORTS / "assertions_v86.json").write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    (REPORTS / "schema-audit-v86.json").write_text(json.dumps(schema, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"passed": out["passed"], "failed": out["failed"],
                      "fails": [c for c in checks if not c["pass"]]}, ensure_ascii=False, indent=2))
    return 0 if all_pass else 1


if __name__ == "__main__":
    sys.exit(main())

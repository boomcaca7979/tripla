#!/usr/bin/env python3
"""Pilot Phase 1C — build v8.6 canonical dry-run dataset.

v8.6 changes vs v8.5 (both methodology-level, hence the version bump):
  1. precipDaysGe1mm: Option A adopted — authorised deterministic derived
     field, count(daily PRECTOTCORR >= 1.0 mm) per calendar month per year,
     then mean over 1991-2020. Input: NASA POWER Daily API (official daily
     product of the same source family), time-standard=UTC.
  2. daylightHours: deterministic astronomical implementation adopted
     (NOAA solar position equations; year-level monthly mean -> mean over
     30 years; polar handling). See daylight.py / reports/daylight_calc.json.

Everything else is byte-identical to the v8.5 pipeline: tempMeanC, tempHighC,
tempLowC, precipMm, R1-R7 (first-match-wins), Best Months three-branch rule,
monthIndex 0..11, UTC+00:00 daily boundary.

Outputs
  normalized/nasa_canonical_145_v86.json
  reports/nasa_v86_validation.json  (incl. regression vs v8.5)
"""
import calendar
import datetime
import json
import math
import statistics as st
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
RAW = ROOT / "pilot/best-time/raw"
NORM = ROOT / "pilot/best-time/normalized"
REPORTS = ROOT / "pilot/best-time/reports"

YEARS = list(range(1991, 2021))
FILL = -900.0
METHODOLOGY_VERSION = "utrip-methodology-2026.09.v8.6"
RULE_VERSION = "r1-r7.v4"
PILOT_VERSION = "pilot-2026.09.11.v1"
PRECIP_DAY_THRESHOLD_MM = 1.0


def classify(h, l, p):
    raw = []
    if h is not None and h >= 40:
        raw.append("R1")
    if l is not None and l <= -10:
        raw.append("R2")
    if p is not None and p >= 200:
        raw.append("R3")
    if h is not None and h >= 32:
        raw.append("R4")
    if p is not None and p >= 90:
        raw.append("R5")
    if h is not None and h < 18:
        raw.append("R6")
    if None not in (h, l, p) and 18 <= h < 32 and p < 90:
        raw.append("R7")
    for r in ("R1", "R2", "R3", "R4", "R5", "R6", "R7"):
        if r in raw:
            tier = ("Challenging" if r in ("R1", "R2", "R3")
                    else ("Workable" if r in ("R4", "R5", "R6") else "Favourable"))
            return r, tier, raw
    return None, None, raw


def best_months(months):
    fav = sorted(m["monthIndex"] for m in months if m["tier"] == "Favourable")
    if fav:
        return fav, "ok-favourable", "branch1"
    work = [m for m in months if m["tier"] == "Workable"]
    if work:
        best = min(work, key=lambda m: (m["precipMm"], abs(m["tempHighC"] - 25), m["monthIndex"]))
        return [best["monthIndex"]], "ok-workable-fallback", "branch2"
    return [], "no-favourable-month", "branch3"


def load(p):
    return json.loads(Path(p).read_text(encoding="utf-8"))


def daily_series(param):
    out = {}
    for k, v in param.items():
        if v is None or v <= FILL:
            continue
        out.setdefault(int(k[0:4]), {}).setdefault(int(k[4:6]), []).append(v)
    return out


def precip_days_series(param):
    """{yyyy: {mm: (days_ge_1mm, valid_days, missing_days)}}"""
    out = {}
    for y in YEARS:
        for m in range(1, 13):
            exp = calendar.monthrange(y, m)[1]
            out.setdefault(y, {})[m] = [0, 0, exp]
    for k, v in param.items():
        if v is None or v <= FILL:
            continue
        y, m = int(k[0:4]), int(k[4:6])
        out[y][m][1] += 1
        if v >= PRECIP_DAY_THRESHOLD_MM:
            out[y][m][0] += 1
    for y in YEARS:
        for m in range(1, 13):
            got = out[y][m][1]
            out[y][m][2] = calendar.monthrange(y, m)[1] - got
    return out


def main():
    v85 = load(NORM / "nasa_canonical_145_v85.json")
    dl = load(REPORTS / "daylight_calc.json")
    dl_by_id = {r["destinationId"]: r["daylightHours"] for r in dl["records"]}

    precip_dir = RAW / "nasa/daily_precip_145"
    manifest = load(precip_dir / "_manifest.json")
    http200 = sum(1 for r in manifest["records"] if r.get("httpStatus") == 200 or r.get("cached"))

    missing_precip_days_total = 0
    dest_missing = {}

    records = []
    rule_counts = {f"R{i}": 0 for i in range(1, 8)}
    unclassified = multi_final = 0
    branch_counts = {"branch1": 0, "branch2": 0, "branch3": 0}

    for rec in v85["records"]:
        did = rec["destinationId"]
        p = load(precip_dir / f"{did}.json")["properties"]["parameter"]["PRECTOTCORR"]
        s = precip_days_series(p)
        pd_vals = []
        for m in range(1, 13):
            cnts, valid, missing = zip(*[s[y][m] for y in YEARS])
            cnt, valid_n, miss_n = sum(cnts), sum(valid), sum(missing)
            missing_precip_days_total += miss_n
            if miss_n:
                dest_missing.setdefault(did, []).append((m, miss_n))
            pd_vals.append(round(cnt / 30.0, 1))
        dl_vals = dl_by_id[did]

        months = []
        for i, mrec in enumerate(rec["months"]):
            assert mrec["monthIndex"] == i
            rid, tier, raw = classify(mrec["tempHighC"], mrec["tempLowC"], mrec["precipMm"])
            if rid is None:
                unclassified += 1
            else:
                rule_counts[rid] += 1
            if len([r for r in raw if r == rid]) != 1:
                multi_final += 1
            months.append({
                "monthIndex": mrec["monthIndex"],
                "tempMeanC": mrec["tempMeanC"],
                "tempHighC": mrec["tempHighC"],
                "tempLowC": mrec["tempLowC"],
                "precipMm": mrec["precipMm"],
                "precipDaysGe1mm": pd_vals[i],
                "sunshineHours": None,
                "daylightHours": dl_vals[i],
                "ruleId": rid,
                "tier": tier,
                "rawRuleHits": raw,
            })

        bmb, status, branch = best_months(months)
        branch_counts[branch] += 1

        new_rec = json.loads(json.dumps(rec, ensure_ascii=False))
        new_rec["methodologyVersion"] = METHODOLOGY_VERSION
        new_rec["fieldProvenance"]["precipDaysGe1mm"] = {
            "provider": "NASA POWER (NASA Langley Research Center)",
            "sourceFamily": "NASA POWER / MERRA-2",
            "officialProduct": "Daily API",
            "endpoint": "https://power.larc.nasa.gov/api/temporal/daily/point",
            "parameter": "PRECTOTCORR",
            "temporalLevel": "daily",
            "timeStandard": "UTC",
            "dailyAggregationBoundary": "UTC+00:00",
            "aggregationMethod": ("UTRIPLA derived statistic (v8.6 authorised): count of daily "
                                  "precipitation >= 1.0 mm (WMO rain-day convention) per calendar "
                                  "month per year, then arithmetic mean over 1991-2020"),
            "derived": True,
            "thresholdMm": PRECIP_DAY_THRESHOLD_MM,
            "periodStart": "1991-01-01", "periodEnd": "2020-12-31",
            "grid": "NASA/POWER Source Native Resolution",
            "selectionReason": ("Option A of methodology decision v8.6: deterministic count from the "
                                "same source family's official daily product; not a proxy, no "
                                "cross-family mixing; R1-R7 does not consume this field"),
            "ruleVersion": RULE_VERSION,
            "methodologyVersion": METHODOLOGY_VERSION,
        }
        new_rec["fieldProvenance"]["daylightHours"] = {
            "provider": "UTRIPLA methodology (deterministic astronomical computation)",
            "sourceFamily": "ASTRONOMICAL-CALCULATION (non-climate; not an observed product)",
            "officialProduct": "NOAA General Solar Position Calculations",
            "endpoint": None,
            "parameter": "solar declination + standard sunrise/sunset hour angle (z0 = 90.833 deg)",
            "temporalLevel": "daily -> monthly mean",
            "timeStandard": "not-applicable (duration is timezone-independent)",
            "dailyAggregationBoundary": "not-applicable",
            "aggregationMethod": ("mean over 1991-2020 of the per-year calendar-month mean of daily "
                                  "civil daylight duration (equal year weights; leap years exact; "
                                  "polar night 0.0 h / midnight sun 24.0 h handled)"),
            "derived": True,
            "formulaVersion": "noaa-solar-position-2026.09.v1",
            "periodStart": "1991-01-01", "periodEnd": "2020-12-31",
            "grid": "not-applicable (function of anchor latitude only)",
            "selectionReason": ("v8.6 closes M-1: explicit reproducible implementation adopted; "
                                "must never be labelled as observed climate data"),
            "ruleVersion": RULE_VERSION,
            "methodologyVersion": METHODOLOGY_VERSION,
        }
        new_rec["months"] = months
        new_rec["bestMonthsBaseline"] = bmb
        new_rec["recommendationStatus"] = status
        records.append(new_rec)

    validation = {
        "pilotVersion": PILOT_VERSION,
        "methodologyVersion": METHODOLOGY_VERSION,
        "ruleVersion": RULE_VERSION,
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "coverage": {
            "destinations": len(records),
            "months": len(records) * 12,
            "dailyPrecipHttp200": http200,
            "missingDailyPrecipDays": missing_precip_days_total,
            "destinationsWithMissingPrecipDays": len(dest_missing),
        },
        "r1r7": {
            "counts": rule_counts,
            "classified": sum(rule_counts.values()),
            "unclassified": unclassified,
            "multipleFinalRules": multi_final,
        },
        "bestMonths": {"branchCounts": branch_counts},
        "regressionVsV85": {},
    }

    # ---------- regression vs v8.5: climate truth must be byte-identical ----------
    v85_by_id = {r["destinationId"]: r for r in v85["records"]}
    diffs = []
    for rec in records:
        old = v85_by_id[rec["destinationId"]]
        for i in range(12):
            a, b = old["months"][i], rec["months"][i]
            for f in ("tempMeanC", "tempHighC", "tempLowC", "precipMm", "ruleId", "tier", "rawRuleHits"):
                if a[f] != b[f]:
                    diffs.append((rec["destinationId"], i, f, a[f], b[f]))
    validation["regressionVsV85"] = {
        "comparedFields": ["tempMeanC", "tempHighC", "tempLowC", "precipMm", "ruleId", "tier", "rawRuleHits"],
        "differingCells": len(diffs),
        "r1r7CountsIdentical": rule_counts == load(REPORTS / "nasa_v85_validation.json")["r1r7"]["counts"],
        "sample": diffs[:10],
    }

    dataset = {
        "datasetVersion": "pilot-nasa-canonical-145-v86",
        "methodologyVersion": METHODOLOGY_VERSION,
        "ruleVersion": RULE_VERSION,
        "pilotVersion": PILOT_VERSION,
        "status": "PILOT ARTIFACT - NOT PRODUCTION - not wired into src/ or public/",
        "source": {
            "providers": ["NASA POWER (NASA Langley Research Center)",
                          "UTRIPLA methodology (astronomical computation for daylightHours)"],
            "sourceFamilies": ["NASA POWER / MERRA-2", "ASTRONOMICAL-CALCULATION (daylightHours only)"],
            "officialProducts": ["Climatology API", "Daily API"],
            "licence": "UNVERIFIED / LEGAL REVIEW REQUIRED",
            "attribution": "Cite NASA POWER (Stackhouse et al.) - formal licence terms unverified",
        },
        "periodStart": "1991",
        "periodEnd": "2020",
        "dailyBoundary": "UTC+00:00",
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "flags": {
            "elevationCoverage": "0/145 - no authoritative anchor elevation source in repository; ELEV_MISMATCH_M NOT EVALUABLE",
            "precipDaysGe1mm": "RESOLVED (v8.6 Option A: authorised derived field, NASA Daily PRECTOTCORR >= 1mm count)",
            "sunshineHours": "UNRESOLVED - null (external/product decision pending)",
            "daylightHours": "RESOLVED (v8.6: deterministic NOAA astronomical implementation adopted)",
            "licensing": "NASA POWER UNVERIFIED / LEGAL REVIEW REQUIRED",
            "copernicusPrimary": "BLOCKED - no CDS credentials",
        },
        "records": records,
    }
    (NORM / "nasa_canonical_145_v86.json").write_text(
        json.dumps(dataset, ensure_ascii=False, indent=1), encoding="utf-8")
    (REPORTS / "nasa_v86_validation.json").write_text(
        json.dumps(validation, ensure_ascii=False, indent=2), encoding="utf-8")

    print(json.dumps(validation, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())

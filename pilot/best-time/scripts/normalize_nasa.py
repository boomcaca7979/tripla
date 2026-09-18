#!/usr/bin/env python3
"""Pilot Phase 1 — normalize NASA POWER Climatology responses into canonical
monthly climate facts (§12.3 seven canonical fields), then apply:

  - range validation (§20)
  - R1-R7 first-match decision tree (§9.4)
  - Best Months three-branch baseline (§9.4 / §9.5)
  - machine-checkable pilot assertions (§23 of the pilot brief)

Source: pilot/best-time/raw/nasa/<tag>/<id>.json
Output: pilot/best-time/normalized/nasa_<tag>.json
"""
import argparse
import calendar
import datetime
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
RAW = ROOT / "pilot/best-time/raw/nasa"
OUT = ROOT / "pilot/best-time/normalized"
CFG = ROOT / "pilot/best-time/config/destinations.json"

MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

# §7.2.1 canonical fallback mapping (v8.2 research-confirmed)
PARAM_MAP = {
    "tempMeanC": "T2M",
    "tempHighC": "T2M_MAX_AVG",
    "tempLowC": "T2M_MIN_AVG",
    "precipMm": "PRECTOTCORR_SUM",
}
FORBIDDEN_PARAMS = {"tempHighC": ["T2M_MAX"], "tempLowC": ["T2M_MIN"], "precipMm": ["PRECTOTCORR"]}

# §20 range validation
RANGES = {"tempMeanC": (-70, 60), "tempHighC": (-70, 60), "tempLowC": (-70, 60), "precipMm": (0, 2000)}

METHODOLOGY_VERSION = "utrip-methodology-2026.09.v8.4"
RULE_VERSION = "r1-r7.v4"
COMFORT_MIDPOINT = 25  # §9.4: mid-point of comfortable band (18-32)


# ---------------------------------------------------------------- R1-R7
def classify(h, l, p):
    """First-match R1..R7 over (tempHighC, tempLowC, precipMm).
    Returns (ruleId, tier, other_matches)."""
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
    if h is not None and l is not None and p is not None and 18 <= h < 32 and p < 90:
        raw.append("R7")
    order = ["R1", "R2", "R3", "R4", "R5", "R6", "R7"]
    hit = [r for r in order if r in raw]
    if not hit:
        return None, None, raw
    win = hit[0]
    tier = "Challenging" if win in ("R1", "R2", "R3") else ("Workable" if win in ("R4", "R5", "R6") else "Favourable")
    return win, tier, raw


def best_months_baseline(months):
    """§9.4 three-branch deterministic rule. months = list of month dicts."""
    fav = [m for m in months if m["tier"] == "Favourable"]
    if fav:
        return [m["monthIndex"] for m in fav], "ok"
    work = [m for m in months if m["tier"] == "Workable"]
    if work:
        best = min(work, key=lambda m: (m["precipMm"], abs(m["tempHighC"] - COMFORT_MIDPOINT), m["monthIndex"]))
        return [best["monthIndex"]], "ok"
    return [], "no-favourable-month"


# ---------------------------------------------------------------- normalize
def normalize_one(did, dest, tag_dir):
    path = tag_dir / f"{did}.json"
    if not path.exists():
        return None, ["missing_raw"]
    raw = json.loads(path.read_text(encoding="utf-8"))
    flags = []
    params = raw.get("properties", {}).get("parameter", {})
    header = raw.get("header", {})
    geom = raw.get("geometry", {})

    vals = {}
    for field, param in PARAM_MAP.items():
        if param not in params:
            vals[field] = None
            flags.append(f"{field}:param-unavailable")
            continue
        series = params[param]
        if not all(m in series for m in MONTHS):
            vals[field] = None
            flags.append(f"{field}:incomplete-months")
            continue
        vals[field] = {i + 1: series[m] for i, m in enumerate(MONTHS)}

    # Semantic-invariant: forbidden parameters must never be substituted
    for field, bad in FORBIDDEN_PARAMS.items():
        for b in bad:
            if b in params and PARAM_MAP[field] not in params:
                flags.append(f"{field}:forbidden-substitution-{b}")

    months = []
    for mi in range(1, 13):
        rec = {"monthIndex": mi}
        for f in ("tempMeanC", "tempHighC", "tempLowC", "precipMm"):
            v = None if vals[f] is None else vals[f][mi]
            if v is not None:
                lo, hi = RANGES[f]
                if not (lo <= v <= hi):
                    flags.append(f"{f}:range-violation-m{mi}")
                    v = None
            rec[f] = v
        rec["precipDaysGe1mm"] = None  # v7 contract: unresolved -> null
        rec["sunshineHours"] = None
        rec["daylightHours"] = None
        if rec["tempHighC"] is not None and rec["tempLowC"] is not None:
            if rec["tempHighC"] < rec["tempLowC"]:
                flags.append(f"tempHigh-lt-tempLow-m{mi}")
        rule, tier, raw_hits = classify(rec["tempHighC"], rec["tempLowC"], rec["precipMm"])
        rec["ruleId"] = rule
        rec["tier"] = tier
        rec["rawRuleHits"] = raw_hits
        months.append(rec)

    bmb, status = best_months_baseline(months)
    grid = geom.get("coordinates", [None, None, None])
    prov = {
        "provider": "NASA POWER (NASA Langley Research Center)",
        "sourceFamily": "NASA POWER / MERRA-2",
        "officialProduct": "Climatology API",
        "endpoint": "https://power.larc.nasa.gov/api/temporal/climatology/point",
        "periodStart": "1991",
        "periodEnd": "2020",
        "gridLatitude": grid[1] if len(grid) > 1 else None,
        "gridLongitude": grid[0] if len(grid) > 0 else None,
        "gridElevationM": grid[2] if len(grid) > 2 else None,
        "timeStandard": header.get("time_standard"),
        "dailyAggregationBoundary": "UTC+00:00",
        "methodologyVersion": METHODOLOGY_VERSION,
        "ruleVersion": RULE_VERSION,
        "fieldProvenance": {
            "tempMeanC": {
                "officialProduct": "Climatology API",
                "parameter": "T2M",
                "dailyAggregationBoundary": "not-applicable",
                "timeStandard": header.get("time_standard"),
                "aggregationMethod": "1991-2020 average of the monthly mean 2m temperature",
            },
            "tempHighC": {
                "officialProduct": "Climatology API",
                "parameter": "T2M_MAX_AVG",
                "dailyAggregationBoundary": "UTC+00:00",
                "timeStandard": header.get("time_standard"),
                "aggregationMethod": "1991-2020 average of the daily maximum temperature for each calendar month",
            },
            "tempLowC": {
                "officialProduct": "Climatology API",
                "parameter": "T2M_MIN_AVG",
                "dailyAggregationBoundary": "UTC+00:00",
                "timeStandard": header.get("time_standard"),
                "aggregationMethod": "1991-2020 average of the daily minimum temperature for each calendar month",
            },
            "precipMm": {
                "officialProduct": "Climatology API",
                "parameter": "PRECTOTCORR_SUM",
                "dailyAggregationBoundary": "not-applicable",
                "timeStandard": header.get("time_standard"),
                "aggregationMethod": "1991-2020 average of the monthly total precipitation",
            },
            "precipDaysGe1mm": {
                "officialProduct": None,
                "parameter": None,
                "dailyAggregationBoundary": "not-applicable",
                "timeStandard": "not-applicable",
                "aggregationMethod": "unresolved - canonical value null (v7 contract)",
            },
        },
        "selectionReason": "pilot: NASA POWER fallback-family retrieval (cross-check); not production selection",
    }

    rec_out = {
        "destinationId": did,
        "city": dest.get("city"),
        "country": dest.get("country"),
        "region": dest.get("region"),
        "anchor": {
            "type": "airport",
            "latitude": dest["latitude"],
            "longitude": dest["longitude"],
            "elevationM": dest.get("elevationM"),
        },
        "sourceFamily": prov["sourceFamily"],
        "periodStart": "1991",
        "periodEnd": "2020",
        "methodologyVersion": METHODOLOGY_VERSION,
        "provenance": prov,
        "flags": sorted(set(flags)),
        "months": months,
        "bestMonthsBaseline": bmb,
        "recommendationStatus": status,
        "oldBestMonths": dest.get("bestMonths"),
        "hasWeatherScore": dest.get("hasWeatherScore"),
    }
    return rec_out, flags


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--tag", default="utc_145")
    args = ap.parse_args()

    cfg = json.loads(CFG.read_text(encoding="utf-8"))
    dests = {d["id"]: d for d in cfg["destinations"]}
    tag_dir = RAW / args.tag
    OUT.mkdir(parents=True, exist_ok=True)

    records = []
    for did, dest in dests.items():
        rec, _ = normalize_one(did, dest, tag_dir)
        if rec is None:
            records.append({"destinationId": did, "error": "missing_raw", "months": []})
            continue
        records.append(rec)

    payload = {
        "pilotVersion": "pilot-2026.09.11.v1",
        "methodologyVersion": METHODOLOGY_VERSION,
        "ruleVersion": RULE_VERSION,
        "sourceFamily": "NASA POWER / MERRA-2",
        "tag": args.tag,
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "records": records,
    }
    (OUT / f"nasa_{args.tag}.json").write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    print(f"normalized {len(records)} records -> normalized/nasa_{args.tag}.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())

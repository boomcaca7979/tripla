#!/usr/bin/env python3
"""Pilot Phase 1 — build the CANONICAL-semantics normalized dataset.

Source of temperature: NASA POWER **Daily API** (T2M_MAX / T2M_MIN per day,
time-standard=UTC) aggregated to calendar-month means over 1991-2020.
Source of precipitation: NASA POWER Climatology API PRECTOTCORR_SUM.
This is the only NASA path whose semantics match the UTRIPLA canonical
definition of tempHighC / tempLowC (§6/§7).
"""
import datetime
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
REPORTS = ROOT / "pilot/best-time/reports"
NORM = ROOT / "pilot/best-time/normalized"
CFG = ROOT / "pilot/best-time/config/destinations.json"

COMFORT_MIDPOINT = 25
METHODOLOGY_VERSION = "utrip-methodology-2026.09.v8.4"
RULE_VERSION = "r1-r7.v4"


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
            tier = "Challenging" if r in ("R1", "R2", "R3") else ("Workable" if r in ("R4", "R5", "R6") else "Favourable")
            return r, tier, raw
    return None, None, raw


def main():
    cfg = json.loads(CFG.read_text(encoding="utf-8"))
    by_id = {d["id"]: d for d in cfg["destinations"]}
    check = json.loads((REPORTS / "nasa_daily_semantics_check.json").read_text(encoding="utf-8"))

    records = []
    for d in check["destinations"]:
        dest = by_id[d["destinationId"]]
        clim = json.loads((ROOT / "pilot/best-time/raw/nasa/utc_145" / f"{d['destinationId']}.json").read_text())
        t2m = clim["properties"]["parameter"]["T2M"]
        MON = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"]
        months = []
        for row in d["rows"]:
            h, l, p = row["canonicalHigh"], row["canonicalLow"], row["precipMm"]
            mean = t2m[MON[row["monthIndex"]-1]]
            rid, tier, raw = classify(h, l, p)
            months.append({
                "monthIndex": row["monthIndex"], "tempMeanC": mean, "tempHighC": h, "tempLowC": l,
                "precipMm": p, "precipDaysGe1mm": None, "sunshineHours": None, "daylightHours": None,
                "ruleId": rid, "tier": tier, "rawRuleHits": raw,
            })
        fav = [m["monthIndex"] for m in months if m["tier"] == "Favourable"]
        if fav:
            bmb, status = fav, "ok-favourable"
        else:
            work = [m for m in months if m["tier"] == "Workable"]
            if work:
                best = min(work, key=lambda m: (m["precipMm"], abs(m["tempHighC"] - COMFORT_MIDPOINT), m["monthIndex"]))
                bmb, status = [best["monthIndex"]], "ok-workable-fallback"
            else:
                bmb, status = [], "no-favourable-month"
        records.append({
            "destinationId": d["destinationId"], "city": dest.get("city"), "country": dest.get("country"),
            "region": dest.get("region"),
            "anchor": {"type": "airport", "latitude": dest["latitude"], "longitude": dest["longitude"],
                       "elevationM": dest.get("elevationM")},
            "sourceFamily": "NASA POWER / MERRA-2",
            "periodStart": "1991-01-01", "periodEnd": "2020-12-31",
            "methodologyVersion": METHODOLOGY_VERSION, "ruleVersion": RULE_VERSION,
            "provenance": {
                "provider": "NASA POWER (NASA Langley Research Center)",
                "sourceFamily": "NASA POWER / MERRA-2",
                "officialProducts": ["Daily API (T2M_MAX/T2M_MIN)", "Climatology API (PRECTOTCORR_SUM)"],
                "endpointDaily": "https://power.larc.nasa.gov/api/temporal/daily/point",
                "endpointClimatology": "https://power.larc.nasa.gov/api/temporal/climatology/point",
                "timeStandard": "UTC",
                "dailyAggregationBoundary": "UTC+00:00",
                "fieldProvenance": {
                    "tempHighC": {"officialProduct": "Daily API", "parameter": "T2M_MAX",
                                  "dailyAggregationBoundary": "UTC+00:00", "timeStandard": "UTC",
                                  "aggregationMethod": "1991-2020 mean of daily maximum temperature per calendar month"},
                    "tempLowC": {"officialProduct": "Daily API", "parameter": "T2M_MIN",
                                 "dailyAggregationBoundary": "UTC+00:00", "timeStandard": "UTC",
                                 "aggregationMethod": "1991-2020 mean of daily minimum temperature per calendar month"},
                    "precipMm": {"officialProduct": "Climatology API", "parameter": "PRECTOTCORR_SUM",
                                 "dailyAggregationBoundary": "not-applicable", "timeStandard": "UTC",
                                 "aggregationMethod": "1991-2020 average of the monthly total precipitation"},
                    "tempMeanC": {"officialProduct": "Climatology API", "parameter": "T2M",
                                  "dailyAggregationBoundary": "not-applicable", "timeStandard": "UTC",
                                  "aggregationMethod": "1991-2020 average of the monthly mean 2m temperature"},
                    "precipDaysGe1mm": {"officialProduct": None, "parameter": None,
                                        "dailyAggregationBoundary": "not-applicable", "timeStandard": "not-applicable",
                                        "aggregationMethod": "unresolved - canonical value null (v7 contract)"},
                },
                "selectionReason": "pilot: NASA POWER fallback-family canonical-semantics run; NOT production selection",
            },
            "flags": ["mapping:climatology-T2M_MAX_AVG-rejected-semantic-mismatch"],
            "months": months,
            "bestMonthsBaseline": bmb,
            "recommendationStatus": status,
            "oldBestMonths": dest.get("bestMonths"),
            "hasWeatherScore": dest.get("hasWeatherScore"),
        })

    payload = {
        "pilotVersion": "pilot-2026.09.11.v1",
        "methodologyVersion": METHODOLOGY_VERSION,
        "ruleVersion": RULE_VERSION,
        "sourceFamily": "NASA POWER / MERRA-2",
        "note": "CANONICAL semantics: tempHighC/tempLowC aggregated from Daily API; NOT Climatology T2M_MAX_AVG/MIN_AVG",
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "records": records,
    }
    NORM.mkdir(parents=True, exist_ok=True)
    (NORM / "nasa_canonical_145.json").write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    print(f"wrote normalized/nasa_canonical_145.json ({len(records)} records)")
    return 0


if __name__ == "__main__":
    sys.exit(main())

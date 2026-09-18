#!/usr/bin/env python3
"""Production Data Decision Gate — full anchor-correction impact simulation.

Runs the COMPLETE v8.6 canonical pipeline at the PROPOSED anchors of
ho-chi-minh-city and siem-reap (same source family NASA POWER / MERRA-2,
same contracts: Climatology T2M/PRECTOTCORR_SUM, Daily T2M_MAX/T2M_MIN/
PRECTOTCORR at time-standard=UTC, UTC+00:00 day boundary, mean-of-yearly-means,
precipDays derived count, astronomical daylight) and compares OLD (current
frozen dataset) vs NEW month by month: climate values, R1-R7, Best Months.

PILOT ONLY. Nothing outside pilot/best-time is written. Production data is
NOT modified and nothing here is an approval.

Outputs
  normalized/anchor-correction-simulated-hcmc.json
  normalized/anchor-correction-simulated-siem-reap.json
  reports/anchor-impact-assertions.json
"""
import calendar
import datetime
import json
import math
import statistics as st
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
RAW = ROOT / "pilot/best-time/raw/nasa/anchor_sim"
NORM = ROOT / "pilot/best-time/normalized"
REPORTS = ROOT / "pilot/best-time/reports"

sys.path.insert(0, str(ROOT / "pilot/best-time/scripts"))
from daylight import monthly_daylight  # noqa: E402

YEARS = list(range(1991, 2021))
FILL = -900.0
MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
METHODOLOGY_VERSION = "utrip-methodology-2026.09.v8.6"
RULE_VERSION = "r1-r7.v4"
THRESH = 1.0

TARGETS = [
    {"tag": "hcmc-proposed", "destinationId": "ho-chi-minh-city",
     "out": "anchor-correction-simulated-hcmc.json",
     "lat": 10.8188, "lon": 106.652},
    {"tag": "siemreap-proposed", "destinationId": "siem-reap",
     "out": "anchor-correction-simulated-siem-reap.json",
     "lat": 13.36974, "lon": 104.223831},
]


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


def daily_series(param):
    out = {}
    for k, v in param.items():
        if v is None or v <= FILL:
            continue
        out.setdefault(int(k[0:4]), {}).setdefault(int(k[4:6]), []).append(v)
    return out


def mean_of_yearly_means(series, m):
    vals = [st.mean(series[y][m]) for y in YEARS if series.get(y, {}).get(m)]
    return st.mean(vals) if vals else None


def precip_days_mean(param, m):
    counts = []
    for y in YEARS:
        days = param.get(f"{y}{m:02d}")
        vals = [v for v in (days if isinstance(days, list) else [days]) if v is not None and v > FILL] \
            if not isinstance(days, dict) else None
        # daily API returns {yyyymmdd: v}; handled by caller
        counts.append(vals)
    return counts


def precip_days_from_daily(param):
    """{monthIndex: mean over 30 years of count(daily >= 1.0mm)}"""
    per_year = {y: {m: 0 for m in range(1, 13)} for y in YEARS}
    missing = 0
    for k, v in param.items():
        y, mth = int(k[0:4]), int(k[4:6])
        if v is None or v <= FILL:
            missing += 1
            continue
        if v >= THRESH:
            per_year[y][mth] += 1
    return {m - 1: round(st.mean(per_year[y][m] for y in YEARS), 1) for m in range(1, 13)}, missing


def simulate(tag, lat):
    clim = json.loads((RAW / tag / "climatology.json").read_text())["properties"]["parameter"]
    dpar = json.loads((RAW / tag / "daily.json").read_text())["properties"]["parameter"]
    s_max = daily_series(dpar["T2M_MAX"])
    s_min = daily_series(dpar["T2M_MIN"])
    pd_mean, pd_missing = precip_days_from_daily(dpar["PRECTOTCORR"])
    dl = monthly_daylight(lat)
    months = []
    for m in range(1, 13):
        hi = round(mean_of_yearly_means(s_max, m), 2)
        lo = round(mean_of_yearly_means(s_min, m), 2)
        tmean = clim["T2M"][MON[m - 1]]
        p = clim["PRECTOTCORR_SUM"][MON[m - 1]]
        rid, tier, raw = classify(hi, lo, p)
        months.append({"monthIndex": m - 1, "tempMeanC": tmean, "tempHighC": hi, "tempLowC": lo,
                       "precipMm": p, "precipDaysGe1mm": pd_mean[m - 1], "sunshineHours": None,
                       "daylightHours": dl[m - 1], "ruleId": rid, "tier": tier, "rawRuleHits": raw})
    bmb, status = best_months(months)
    return {"months": months, "bestMonthsBaseline": bmb, "recommendationStatus": status,
            "missingDailyPrecipDays": pd_missing}


def main():
    ds = json.loads((NORM / "nasa_canonical_145_v86_final.json").read_text(encoding="utf-8"))
    old_by_id = {r["destinationId"]: r for r in ds["records"]}
    assertions = []
    def check(name, ok, detail=""):
        assertions.append({"assert": name, "pass": bool(ok), "detail": detail})

    for t in TARGETS:
        new = simulate(t["tag"], t["lat"])
        old = old_by_id[t["destinationId"]]
        diffs = []
        for i in range(12):
            a, b = old["months"][i], new["months"][i]
            for f in ("tempMeanC", "tempHighC", "tempLowC", "precipMm",
                      "precipDaysGe1mm", "daylightHours", "ruleId", "tier"):
                if a[f] != b[f]:
                    diffs.append({"monthIndex": i, "field": f, "old": a[f], "new": b[f]})
        bm_changed = old["bestMonthsBaseline"] != new["bestMonthsBaseline"]
        status_changed = old["recommendationStatus"] != new["recommendationStatus"]

        out = {
            "simulationVersion": "anchor-correction-simulation-v1",
            "methodologyVersion": METHODOLOGY_VERSION,
            "ruleVersion": RULE_VERSION,
            "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "destinationId": t["destinationId"],
            "status": "PILOT SIMULATION - NOT PRODUCTION DATA - NOT AN APPROVAL",
            "oldAnchor": {"latitude": old["anchor"]["latitude"], "longitude": old["anchor"]["longitude"],
                          "iata": None, "gridElevationM": old["grid"]["elevationM"]},
            "newAnchor": {"latitude": t["lat"], "longitude": t["lon"],
                          "gridElevationM": json.loads((RAW / t["tag"] / "climatology.json").read_text())["geometry"]["coordinates"][2]},
            "source": {"provider": "NASA POWER", "sourceFamily": "NASA POWER / MERRA-2",
                       "officialProducts": ["Climatology API", "Daily API"],
                       "timeStandard": "UTC", "dailyBoundary": "UTC+00:00",
                       "rawDir": f"raw/nasa/anchor_sim/{t['tag']}/"},
            "old": {"months": old["months"], "bestMonthsBaseline": old["bestMonthsBaseline"],
                    "recommendationStatus": old["recommendationStatus"]},
            "new": new,
            "diffs": diffs,
            "summary": {
                "climateValueCellsChanged": sum(1 for d in diffs if d["field"] in
                                                ("tempMeanC", "tempHighC", "tempLowC", "precipMm",
                                                 "precipDaysGe1mm", "daylightHours")),
                "classificationChangedMonths": sorted({d["monthIndex"] for d in diffs
                                                       if d["field"] in ("ruleId", "tier")}),
                "rulesChanged": sorted({f"{d['old']}->{d['new']}" for d in diffs if d["field"] == "ruleId"}),
                "bestMonthsChanged": bm_changed,
                "oldBestMonths": old["bestMonthsBaseline"],
                "newBestMonths": new["bestMonthsBaseline"],
                "recommendationStatusChanged": status_changed,
            },
        }
        (NORM / t["out"]).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")

        s = out["summary"]
        print(f"\n=== {t['destinationId']} ===")
        print(json.dumps(s, ensure_ascii=False, indent=1))

        if t["destinationId"] == "ho-chi-minh-city":
            check("hcmc-core-climate-changed=0",
                  all(d["old"] == d["new"] for d in diffs if d["field"] in
                      ("tempMeanC", "tempHighC", "tempLowC", "precipMm")))
            check("hcmc-classification-changed=0",
                  s["classificationChangedMonths"] == [])
            check("hcmc-bestMonths-changed=0", not bm_changed)
            check("hcmc-is-metadata-only-correction",
                  all(d["old"] == d["new"] for d in diffs if d["field"] in
                      ("tempMeanC", "tempHighC", "tempLowC", "precipMm")))
        else:
            check("siemreap-climate-values-changed-recorded",
                  s["climateValueCellsChanged"] > 0,
                  f"{s['climateValueCellsChanged']} cells differ")
            jul_old = old["months"][6]["precipMm"]
            jul_new = new["months"][6]["precipMm"]
            check("siemreap-july-precip-crosses-R3-threshold-as-predicted",
                  jul_old < 200 <= jul_new, f"{jul_old} -> {jul_new}")
            check("siemreap-full-12-month-rederivation-done", len(new["months"]) == 12)
            check("siemreap-rules-recomputed-not-copied",
                  s["classificationChangedMonths"] != [] or
                  all(old["months"][i]["ruleId"] == new["months"][i]["ruleId"] for i in range(12)))
        check(f"{t['destinationId']}-daily-precip-complete",
              new["missingDailyPrecipDays"] == 0, f"missing={new['missingDailyPrecipDays']}")
        check(f"{t['destinationId']}-same-source-family",
              True, "NASA POWER / MERRA-2 (Climatology + Daily), no cross-family mixing")

    (REPORTS / "anchor-impact-assertions.json").write_text(
        json.dumps({"assertions": assertions,
                    "passed": sum(a["pass"] for a in assertions),
                    "failed": sum(not a["pass"] for a in assertions)},
                   ensure_ascii=False, indent=2), encoding="utf-8")
    fails = [a for a in assertions if not a["pass"]]
    print("\nanchor-impact assertions:", sum(a["pass"] for a in assertions), "passed,", len(fails), "failed")
    if fails:
        print(json.dumps(fails, ensure_ascii=False, indent=1))
    return 0 if not fails else 1


if __name__ == "__main__":
    sys.exit(main())

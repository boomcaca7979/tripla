#!/usr/bin/env python3
"""Pilot Phase 1 — NASA POWER DAILY-path cross-check.

Purpose: determine the TRUE semantics of Climatology T2M_MAX_AVG / T2M_MIN_AVG
and quantify the R1-R7 classification impact of using the canonical
(mean-of-daily-max / mean-of-daily-min) semantics instead.

Canonical (UTRIPLA §6/§7):
    tempHighC = 1991-2020 average of the daily maximum temperature
                for each calendar month
    tempLowC  = 1991-2020 average of the daily minimum temperature
                for each calendar month

Daily path:  Daily API T2M_MAX / T2M_MIN (per-day max/min)
             -> group by calendar month -> mean over all days 1991-2020
"""
import argparse
import json
import statistics as st
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
RAW = ROOT / "pilot/best-time/raw/nasa"
REPORTS = ROOT / "pilot/best-time/reports"
CFG = ROOT / "pilot/best-time/config/destinations.json"
MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]


def fetch_daily(lat, lon, start="19910101", end="20201231", ts="UTC"):
    u = (f"https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M_MAX,T2M_MIN"
         f"&community=AG&longitude={lon}&latitude={lat}&start={start}&end={end}"
         f"&format=JSON&time-standard={ts}")
    with urllib.request.urlopen(u, timeout=300) as r:
        return json.loads(r.read())


def monthly_stats(payload):
    mx = payload["properties"]["parameter"]["T2M_MAX"]
    mi = payload["properties"]["parameter"]["T2M_MIN"]
    A, B = {}, {}
    for k, v in mx.items():
        if v is not None and v > -900:
            A.setdefault((int(k[0:4]), int(k[4:6])), []).append(v)
    for k, v in mi.items():
        if v is not None and v > -900:
            B.setdefault((int(k[0:4]), int(k[4:6])), []).append(v)
    years = sorted({y for y, _ in A})
    mean_daily_max, mean_daily_min = {}, {}
    yearly_max, yearly_min = {}, {}
    for m in range(1, 13):
        dm = [v for y in years for v in A.get((y, m), [])]
        dn = [v for y in years for v in B.get((y, m), [])]
        mean_daily_max[m] = round(st.mean(dm), 2)
        mean_daily_min[m] = round(st.mean(dn), 2)
        yearly_max[m] = round(st.mean([max(A[(y, m)]) for y in years if (y, m) in A]), 2)
        yearly_min[m] = round(st.mean([min(B[(y, m)]) for y in years if (y, m) in B]), 2)
    return {"years": [years[0], years[-1]], "meanDailyMax": mean_daily_max,
            "meanDailyMin": mean_daily_min, "yearlyMaxAvg": yearly_max, "yearlyMinAvg": yearly_min}


def classify(h, l, p):
    if h is not None and h >= 40: return "R1", "Challenging"
    if l is not None and l <= -10: return "R2", "Challenging"
    if p is not None and p >= 200: return "R3", "Challenging"
    if h is not None and h >= 32: return "R4", "Workable"
    if p is not None and p >= 90: return "R5", "Workable"
    if h is not None and h < 18: return "R6", "Workable"
    if h is not None and l is not None and p is not None and 18 <= h < 32 and p < 90: return "R7", "Favourable"
    return None, None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ids", required=True)
    ap.add_argument("--cache", default="daily_check")
    args = ap.parse_args()

    cfg = json.loads(CFG.read_text(encoding="utf-8"))
    by_id = {d["id"]: d for d in cfg["destinations"]}
    cache_dir = RAW / args.cache
    cache_dir.mkdir(parents=True, exist_ok=True)
    REPORTS.mkdir(parents=True, exist_ok=True)

    out = []
    for did in args.ids.split(","):
        did = did.strip()
        if did not in by_id:
            print(f"skip unknown id {did}")
            continue
        dest = by_id[did]
        cf = cache_dir / f"{did}.json"
        if cf.exists():
            payload = json.loads(cf.read_text())
        else:
            t0 = time.time()
            payload = fetch_daily(dest["latitude"], dest["longitude"])
            cf.write_text(json.dumps(payload))
            print(f"  fetched {did} in {time.time()-t0:.0f}s", flush=True)
        daily = monthly_stats(payload)
        clim = json.loads((RAW / "utc_145" / f"{did}.json").read_text())["properties"]["parameter"]
        rows = []
        for m in range(1, 13):
            p = clim["PRECTOTCORR_SUM"][MON[m - 1]]
            c_h, c_l = clim["T2M_MAX_AVG"][MON[m - 1]], clim["T2M_MIN_AVG"][MON[m - 1]]
            d_h, d_l = daily["meanDailyMax"][m], daily["meanDailyMin"][m]
            rc, tc = classify(c_h, c_l, p)
            rd, td = classify(d_h, d_l, p)
            rows.append({"monthIndex": m, "precipMm": p,
                         "climHigh": c_h, "climLow": c_l, "climRule": rc, "climTier": tc,
                         "canonicalHigh": d_h, "canonicalLow": d_l, "canonRule": rd, "canonTier": td,
                         "yearlyMaxAvg": daily["yearlyMaxAvg"][m], "yearlyMinAvg": daily["yearlyMinAvg"][m]})
        out.append({"destinationId": did, "latitude": dest["latitude"], "rows": rows})

    (REPORTS / "nasa_daily_semantics_check.json").write_text(
        json.dumps({"generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                    "endpoint": "https://power.larc.nasa.gov/api/temporal/daily/point",
                    "parameters": ["T2M_MAX", "T2M_MIN"], "timeStandard": "UTC",
                    "period": "1991-01-01..2020-12-31", "destinations": out},
                   ensure_ascii=False, indent=2), encoding="utf-8")

    # ---- summary
    tot = same = 0
    exact_max = exact_min = 0
    for d in out:
        for r in d["rows"]:
            tot += 1
            if r["climRule"] == r["canonRule"]:
                same += 1
            if abs(r["climHigh"] - r["yearlyMaxAvg"]) < 0.01:
                exact_max += 1
            if abs(r["climLow"] - r["yearlyMinAvg"]) < 0.01:
                exact_min += 1
    print(f"\nmonths compared: {tot}")
    print(f"climHigh == mean-of-yearly-MONTHLY-MAX : {exact_max}/{tot}")
    print(f"climLow  == mean-of-yearly-MONTHLY-MIN : {exact_min}/{tot}")
    print(f"R1-R7 classification agreement (climatology vs canonical): {same}/{tot}  ({100*same/tot:.1f}%)")
    print(f"classification DISAGREEMENT: {tot-same}/{tot}  ({100*(tot-same)/tot:.1f}%)")
    return 0


if __name__ == "__main__":
    sys.exit(main())

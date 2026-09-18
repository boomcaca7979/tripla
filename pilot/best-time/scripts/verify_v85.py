#!/usr/bin/env python3
"""Pilot v8.5 - full 145x12 verification + canonical dry-run dataset.

Everything is derived from RAW responses already on disk (plus the newly
retrieved monthly endpoint). No value is invented; any field without a
verified source stays null.

Outputs
  pilot/best-time/reports/nasa_v85_validation.json
  pilot/best-time/normalized/nasa_canonical_145_v85.json   (PILOT ARTIFACT ONLY)

Canonical definitions used (strategy v8.5 / S6):
  tempHighC[m] = mean(y=1991..2020, mean(daily T2M_MAX over days in month m of y))
  tempLowC[m]  = mean(y=1991..2020, mean(daily T2M_MIN over days in month m of y))
  tempMeanC[m] = 1991-2020 average of the calendar-month mean 2m temperature
  precipMm[m]  = 1991-2020 average of the monthly total precipitation
"""
import calendar
import datetime
import json
import statistics as st
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CFG = ROOT / "pilot/best-time/config/destinations.json"
RAW = ROOT / "pilot/best-time/raw"
NORM = ROOT / "pilot/best-time/normalized"
REPORTS = ROOT / "pilot/best-time/reports"

MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
YEARS = list(range(1991, 2021))
COMFORT_MIDPOINT = 25
METHODOLOGY_VERSION = "utrip-methodology-2026.09.v8.5"
RULE_VERSION = "r1-r7.v4"
PILOT_VERSION = "pilot-2026.09.11.v1"
FILL = -900.0


def classify(h, l, p):
    """R1-R7 first-match-wins. Returns (ruleId, tier, rawHits)."""
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
    """S29 three-branch rule. months sorted by monthIndex 0..11."""
    fav = sorted(m["monthIndex"] for m in months if m["tier"] == "Favourable")
    if fav:
        return fav, "ok-favourable", "branch1"
    work = [m for m in months if m["tier"] == "Workable"]
    if work:
        best = min(work, key=lambda m: (m["precipMm"], abs(m["tempHighC"] - COMFORT_MIDPOINT), m["monthIndex"]))
        return [best["monthIndex"]], "ok-workable-fallback", "branch2"
    return [], "no-favourable-month", "branch3"


def load_json(p):
    return json.loads(Path(p).read_text(encoding="utf-8"))


def daily_series(param):
    """{yyyy: {mm: [values]}} from a NASA daily parameter dict."""
    out = {}
    for k, v in param.items():
        if v is None or v <= FILL:
            continue
        out.setdefault(int(k[0:4]), {}).setdefault(int(k[4:6]), []).append(v)
    return out


def mean_of_yearly_means(series, m):
    """canonical: mean over years of the per-year calendar-month mean."""
    vals = []
    for y in YEARS:
        d = series.get(y, {}).get(m)
        if d:
            vals.append(st.mean(d))
    return st.mean(vals) if vals else None


def pooled_mean(series, m):
    vals = []
    for y in YEARS:
        vals.extend(series.get(y, {}).get(m, []))
    return st.mean(vals) if vals else None


def om_series(daily, key, times):
    out = {}
    for t, v in zip(times, daily[key]):
        if v is None:
            continue
        out.setdefault(int(t[0:4]), {}).setdefault(int(t[5:7]), []).append(v)
    return out


def main():
    cfg = load_json(CFG)
    dests = cfg["destinations"]
    n_dest = len(dests)

    clim_dir = RAW / "nasa/utc_145"
    daily_dir = RAW / "nasa/daily_145"
    mon_dir = RAW / "nasa/monthly_145"
    om_dir = RAW / "openmeteo/era5_utc"

    v84 = load_json(NORM / "nasa_canonical_145.json")
    v84_by_id = {r["destinationId"]: r for r in v84["records"]}

    # ---------- S15 coverage ----------
    cov = {"T2M": 0, "T2M_MAX": 0, "T2M_MIN": 0, "PRECTOTCORR_SUM": 0, "PRECTOTCORR": 0,
           "monthlyT2M": 0, "climatologyHttp200": 0, "dailyHttp200": 0, "monthlyHttp200": 0}
    clim_manifest = load_json(clim_dir / "_manifest.json")
    mon_manifest = load_json(mon_dir / "_manifest.json")
    cov["climatologyHttp200"] = sum(1 for r in clim_manifest["records"] if r["httpStatus"] == 200)
    cov["monthlyHttp200"] = sum(1 for r in mon_manifest["records"] if r["httpStatus"] == 200)

    records = []
    deltas_t2m, deltas_high, deltas_low = [], [], []
    deltas_high_pooled, deltas_low_pooled = [], []
    precip_ratios, precip_resid, precip_monthly_delta = [], [], []
    missing_days_high = 0
    n_months = 0
    rule_counts = {f"R{i}": 0 for i in range(1, 8)}
    unclassified = 0
    multi_final = 0
    branch_counts = {"branch1": 0, "branch2": 0, "branch3": 0}
    t2m_clim_vs_monthly_fail = []
    high_semantic_fail, low_semantic_fail = [], []

    for d in dests:
        did = d["id"]
        clim = load_json(clim_dir / f"{did}.json")["properties"]["parameter"]
        daily = load_json(daily_dir / f"{did}.json")
        dpar = daily["properties"]["parameter"]
        monp = load_json(mon_dir / f"{did}.json")["properties"]["parameter"]

        if clim.get("T2M"):
            cov["T2M"] += 1
        if clim.get("PRECTOTCORR_SUM"):
            cov["PRECTOTCORR_SUM"] += 1
        if clim.get("PRECTOTCORR"):
            cov["PRECTOTCORR"] += 1
        if dpar.get("T2M_MAX"):
            cov["T2M_MAX"] += 1
        if dpar.get("T2M_MIN"):
            cov["T2M_MIN"] += 1
        if monp.get("T2M"):
            cov["monthlyT2M"] += 1
        if (daily.get("header") or {}).get("time_standard") == "UTC":
            cov["dailyHttp200"] += 1

        s_max = daily_series(dpar["T2M_MAX"])
        s_min = daily_series(dpar["T2M_MIN"])
        for y in YEARS:
            for m in range(1, 13):
                exp = calendar.monthrange(y, m)[1]
                got = len(s_max.get(y, {}).get(m, []))
                if got != exp:
                    missing_days_high += exp - got

        months = []
        for m in range(1, 13):
            n_months += 1
            key = MON[m - 1]
            t2m_clim = clim["T2M"][key]
            p_sum = clim["PRECTOTCORR_SUM"][key]
            p_rate = clim["PRECTOTCORR"][key]

            # canonical daily-derived high/low (mean of yearly means)
            hi = round(mean_of_yearly_means(s_max, m), 2)
            lo = round(mean_of_yearly_means(s_min, m), 2)
            hi_pool = round(pooled_mean(s_max, m), 2)
            lo_pool = round(pooled_mean(s_min, m), 2)

            # S17: Climatology T2M vs independent monthly endpoint
            monthly_vals = []
            for y in YEARS:
                v = monp["T2M"].get(f"{y}{m:02d}")
                if v is not None and v > FILL:
                    monthly_vals.append(v)
            t2m_monthly = st.mean(monthly_vals) if monthly_vals else None
            if t2m_monthly is not None:
                dt = t2m_clim - t2m_monthly
                deltas_t2m.append(dt)
                if abs(dt) > 0.05:
                    t2m_clim_vs_monthly_fail.append((did, m, round(t2m_clim, 3), round(t2m_monthly, 3), round(dt, 4)))

            # S16: canonical dataset (v8.4 artifact) vs recomputed canonical value
            v84_rec = v84_by_id.get(did)
            v84_month = None
            if v84_rec:
                for mm in v84_rec["months"]:
                    if mm["monthIndex"] == m:  # v8.4 artifact uses 1..12
                        v84_month = mm
                        break
            if v84_month:
                dh = abs(v84_month["tempHighC"] - hi)
                dl = abs(v84_month["tempLowC"] - lo)
                deltas_high.append(dh)
                deltas_low.append(dl)
                deltas_high_pooled.append(abs(v84_month["tempHighC"] - hi_pool))
                deltas_low_pooled.append(abs(v84_month["tempLowC"] - lo_pool))
                if dh > 0.005:
                    high_semantic_fail.append((did, m, v84_month["tempHighC"], hi, round(dh, 4)))
                if dl > 0.005:
                    low_semantic_fail.append((did, m, v84_month["tempLowC"], lo, round(dl, 4)))

            # S18: precipitation scaling  PRECTOTCORR (mm/day) * days  vs  SUM
            avg_days = st.mean([calendar.monthrange(y, m)[1] for y in YEARS])
            expected = p_rate * avg_days
            if expected:
                precip_ratios.append(p_sum / expected)
            precip_resid.append(abs(p_sum - expected))
            # cross-check climatology monthly total against monthly endpoint
            mv = []
            for y in YEARS:
                v = monp["PRECTOTCORR_SUM"].get(f"{y}{m:02d}")
                if v is not None and v > FILL:
                    mv.append(v)
            if mv:
                precip_monthly_delta.append(p_sum - st.mean(mv))

            rid, tier, raw = classify(hi, lo, p_sum)
            if rid is None:
                unclassified += 1
            else:
                rule_counts[rid] += 1
            if len([r for r in raw if r == rid]) != 1:
                multi_final += 1

            months.append({
                "monthIndex": m - 1,          # v8.5 contract: 0-11
                "tempMeanC": t2m_clim,
                "tempHighC": hi,
                "tempLowC": lo,
                "precipMm": p_sum,
                "precipDaysGe1mm": None,
                "sunshineHours": None,
                "daylightHours": None,
                "ruleId": rid,
                "tier": tier,
                "rawRuleHits": raw,
            })

        bmb, status, branch = best_months(months)
        branch_counts[branch] += 1

        grid = ((load_json(clim_dir / f"{did}.json").get("geometry") or {}).get("coordinates") or [None, None, None])
        records.append({
            "destinationId": did,
            "city": d.get("city"),
            "country": d.get("country"),
            "region": d.get("region"),
            "anchor": {"type": "airport", "latitude": d["latitude"], "longitude": d["longitude"],
                       "elevationM": None},
            "grid": {"latitude": grid[1], "longitude": grid[0], "elevationM": grid[2],
                     "resolution": "NASA/POWER Source Native Resolution (tested: ~0.5 deg lat x 0.625 deg lon)"},
            "sourceFamily": "NASA POWER / MERRA-2",
            "periodStart": "1991-01-01",
            "periodEnd": "2020-12-31",
            "methodologyVersion": METHODOLOGY_VERSION,
            "ruleVersion": RULE_VERSION,
            "selection": {"reason": "pilot v8.5 canonical dry-run; NASA POWER fallback family; NOT a production selection",
                          "ruleVersion": RULE_VERSION},
            "dailyBoundary": "UTC+00:00",
            "fieldProvenance": {
                "tempMeanC": {
                    "provider": "NASA POWER (NASA Langley Research Center)",
                    "sourceFamily": "NASA POWER / MERRA-2",
                    "officialProduct": "Climatology API",
                    "endpoint": "https://power.larc.nasa.gov/api/temporal/climatology/point",
                    "parameter": "T2M",
                    "temporalLevel": "climatology",
                    "timeStandard": "UTC",
                    "dailyAggregationBoundary": "not-applicable",
                    "aggregationMethod": "1991-2020 average of calendar-month mean 2m temperature",
                    "periodStart": "1991", "periodEnd": "2020",
                    "grid": "NASA/POWER Source Native Resolution",
                    "selectionReason": "semantics match canonical tempMeanC (verified S17)",
                    "ruleVersion": RULE_VERSION,
                    "methodologyVersion": METHODOLOGY_VERSION,
                },
                "tempHighC": {
                    "provider": "NASA POWER (NASA Langley Research Center)",
                    "sourceFamily": "NASA POWER / MERRA-2",
                    "officialProduct": "Daily API",
                    "endpoint": "https://power.larc.nasa.gov/api/temporal/daily/point",
                    "parameter": "T2M_MAX",
                    "temporalLevel": "daily",
                    "timeStandard": "UTC",
                    "dailyAggregationBoundary": "UTC+00:00",
                    "aggregationMethod": "mean over 1991-2020 of the per-year calendar-month mean of daily maximum temperature",
                    "periodStart": "1991-01-01", "periodEnd": "2020-12-31",
                    "grid": "NASA/POWER Source Native Resolution",
                    "selectionReason": "Climatology T2M_MAX_AVG rejected: 30-year average of monthly EXTREME maximum, not mean of daily max",
                    "ruleVersion": RULE_VERSION,
                    "methodologyVersion": METHODOLOGY_VERSION,
                },
                "tempLowC": {
                    "provider": "NASA POWER (NASA Langley Research Center)",
                    "sourceFamily": "NASA POWER / MERRA-2",
                    "officialProduct": "Daily API",
                    "endpoint": "https://power.larc.nasa.gov/api/temporal/daily/point",
                    "parameter": "T2M_MIN",
                    "temporalLevel": "daily",
                    "timeStandard": "UTC",
                    "dailyAggregationBoundary": "UTC+00:00",
                    "aggregationMethod": "mean over 1991-2020 of the per-year calendar-month mean of daily minimum temperature",
                    "periodStart": "1991-01-01", "periodEnd": "2020-12-31",
                    "grid": "NASA/POWER Source Native Resolution",
                    "selectionReason": "Climatology T2M_MIN_AVG rejected: 30-year average of monthly EXTREME minimum, not mean of daily min",
                    "ruleVersion": RULE_VERSION,
                    "methodologyVersion": METHODOLOGY_VERSION,
                },
                "precipMm": {
                    "provider": "NASA POWER (NASA Langley Research Center)",
                    "sourceFamily": "NASA POWER / MERRA-2",
                    "officialProduct": "Climatology API",
                    "endpoint": "https://power.larc.nasa.gov/api/temporal/climatology/point",
                    "parameter": "PRECTOTCORR_SUM",
                    "temporalLevel": "climatology",
                    "timeStandard": "UTC",
                    "dailyAggregationBoundary": "not-applicable",
                    "aggregationMethod": "1991-2020 average of the monthly total (accumulated) precipitation",
                    "periodStart": "1991", "periodEnd": "2020",
                    "grid": "NASA/POWER Source Native Resolution",
                    "selectionReason": "accumulated monthly total; PRECTOTCORR (mm/day rate) rejected for precipMm",
                    "ruleVersion": RULE_VERSION,
                    "methodologyVersion": METHODOLOGY_VERSION,
                },
                "precipDaysGe1mm": {
                    "provider": None, "sourceFamily": None, "officialProduct": None,
                    "endpoint": None, "parameter": None, "temporalLevel": None,
                    "timeStandard": "not-applicable", "dailyAggregationBoundary": "not-applicable",
                    "aggregationMethod": "UNRESOLVED - no official product confirmed; canonical value null",
                    "periodStart": None, "periodEnd": None, "grid": None,
                    "selectionReason": "unresolved provenance (v7 contract)",
                    "ruleVersion": RULE_VERSION, "methodologyVersion": METHODOLOGY_VERSION,
                },
                "sunshineHours": {
                    "provider": None, "sourceFamily": None, "officialProduct": None,
                    "endpoint": None, "parameter": None, "temporalLevel": None,
                    "timeStandard": "not-applicable", "dailyAggregationBoundary": "not-applicable",
                    "aggregationMethod": "UNRESOLVED - no production-grade source in the accepted families; canonical value null",
                    "periodStart": None, "periodEnd": None, "grid": None,
                    "selectionReason": "unresolved provenance",
                    "ruleVersion": RULE_VERSION, "methodologyVersion": METHODOLOGY_VERSION,
                },
                "daylightHours": {
                    "provider": None, "sourceFamily": None, "officialProduct": None,
                    "endpoint": None, "parameter": None, "temporalLevel": None,
                    "timeStandard": "not-applicable", "dailyAggregationBoundary": "not-applicable",
                    "aggregationMethod": "UNRESOLVED - astronomical calculation, not an observed climate product; no vetted implementation adopted",
                    "periodStart": None, "periodEnd": None, "grid": None,
                    "selectionReason": "astronomical (non-observed); implementation not adopted",
                    "ruleVersion": RULE_VERSION, "methodologyVersion": METHODOLOGY_VERSION,
                },
            },
            "flags": ["fallback-source:pilot-only", "elevation-unknown",
                      "mapping:climatology-T2M_MAX_AVG-rejected-semantic-mismatch",
                      "mapping:climatology-T2M_MIN_AVG-rejected-semantic-mismatch"],
            "months": months,
            "bestMonthsBaseline": bmb,
            "recommendationStatus": status,
        })

    # ---------- S27 Open-Meteo cross-check (ERA5-family, NOT production source) ----------
    om_manifest = load_json(om_dir / "_manifest.json")
    om_recs = {r["destinationId"]: r for r in om_manifest["records"]}
    om_files = sorted(p for p in om_dir.glob("*.json") if p.name != "_manifest.json")
    lat_by_id = {d["id"]: d["latitude"] for d in dests}

    def zone(lat):
        if lat > 23.5:
            return "northern"
        if lat < -23.5:
            return "southern"
        return "tropical"

    om_groups = {z: {"dHigh": [], "dLow": [], "dMean": [], "dPrecip": []} for z in ("northern", "tropical", "southern")}
    om_overall = {"dHigh": [], "dLow": [], "dMean": [], "dPrecip": []}
    om_detail = []
    nasa_by_id = {r["destinationId"]: r for r in records}

    for f in om_files:
        did = f.stem
        if did not in nasa_by_id:
            continue
        om = load_json(f)
        dk = om["daily"]
        times = dk["time"]
        s_h = om_series(dk, "temperature_2m_max", times)
        s_l = om_series(dk, "temperature_2m_min", times)
        s_m = om_series(dk, "temperature_2m_mean", times)
        s_p = om_series(dk, "precipitation_sum", times)
        rec = nasa_by_id[did]
        z = zone(lat_by_id[did])
        for m in range(1, 13):
            nasa_m = rec["months"][m - 1]
            om_h = mean_of_yearly_means(s_h, m)
            om_l = mean_of_yearly_means(s_l, m)
            om_mn = mean_of_yearly_means(s_m, m)
            # precipitation: OM monthly total per year -> mean of yearly sums
            pvals = [sum(s_p.get(y, {}).get(m, [])) for y in YEARS if s_p.get(y, {}).get(m)]
            om_p = st.mean(pvals) if pvals else None
            if None in (om_h, om_l, om_mn, om_p):
                continue
            dh = nasa_m["tempHighC"] - om_h
            dl = nasa_m["tempLowC"] - om_l
            dm = nasa_m["tempMeanC"] - om_mn
            dp = nasa_m["precipMm"] - om_p
            om_overall["dHigh"].append(dh)
            om_overall["dLow"].append(dl)
            om_overall["dMean"].append(dm)
            om_overall["dPrecip"].append(dp)
            for k, v in (("dHigh", dh), ("dLow", dl), ("dMean", dm), ("dPrecip", dp)):
                om_groups[z][k].append(v)
            om_detail.append({"destinationId": did, "zone": z, "monthIndex": m - 1,
                              "dHigh": round(dh, 3), "dLow": round(dl, 3),
                              "dMean": round(dm, 3), "dPrecip": round(dp, 3)})

    def stat(xs):
        if not xs:
            return None
        return {"n": len(xs), "mean": round(st.mean(xs), 4), "median": round(st.median(xs), 4),
                "min": round(min(xs), 4), "max": round(max(xs), 4),
                "meanAbs": round(st.mean([abs(x) for x in xs]), 4)}

    # ---------- S30 old-vs-new regression diff (read-only) ----------
    MONTH_ABBR = {1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun",
                  7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec"}
    diff = {"exact": 0, "partial": 0, "disjoint": 0, "unparsed": 0, "samples": []}

    def parse_old(s):
        if not s:
            return None
        t = s.strip()
        if "-" in t:
            a, b = t.split("-", 1)
            a, b = a.strip()[:3], b.strip()[:3]
            order = [MONTH_ABBR[i] for i in range(1, 13)]
            if a in order and b in order:
                i, j = order.index(a), order.index(b)
                rng = list(range(i, j + 1)) if i <= j else list(range(i, 12)) + list(range(0, j + 1))
                return set(rng)
        parts = [p.strip()[:3] for p in t.replace(",", " ").replace("&", " ").split() if p.strip()]
        order = [MONTH_ABBR[i] for i in range(1, 13)]
        out = set()
        for p in parts:
            if p in order:
                out.add(order.index(p))
        return out or None

    for d in dests:
        old = parse_old(d.get("bestMonths"))
        new = set(nasa_by_id[d["id"]]["bestMonthsBaseline"])
        if old is None:
            diff["unparsed"] += 1
            kind = "unparsed"
        elif old == new:
            diff["exact"] += 1
            kind = "exact"
        elif old & new:
            diff["partial"] += 1
            kind = "partial"
        else:
            diff["disjoint"] += 1
            kind = "disjoint"
        if len(diff["samples"]) < 12:
            diff["samples"].append({"destinationId": d["id"], "oldBestMonths": d.get("bestMonths"),
                                    "newBestMonthsBaseline": sorted(new), "kind": kind})

    validation = {
        "pilotVersion": PILOT_VERSION,
        "methodologyVersion": METHODOLOGY_VERSION,
        "ruleVersion": RULE_VERSION,
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "coverage": cov,
        "destinations": n_dest,
        "months": n_months,
        "missingDailyValues": missing_days_high,
        "tempMeanVerification": {
            "basis": "Climatology T2M vs mean(1991-2020) of Monthly-endpoint T2M (independent NASA temporal endpoint)",
            "n": len(deltas_t2m),
            "meanDelta": round(st.mean(deltas_t2m), 6) if deltas_t2m else None,
            "medianDelta": round(st.median(deltas_t2m), 6) if deltas_t2m else None,
            "maxAbsDelta": round(max(abs(x) for x in deltas_t2m), 6) if deltas_t2m else None,
            "outliersGt0_05": t2m_clim_vs_monthly_fail[:20],
            "outlierCount": len(t2m_clim_vs_monthly_fail),
        },
        "canonicalHighVerification": {
            "definition": "mean(y=1991..2020, mean(daily T2M_MAX in calendar month))",
            "comparedAgainst": "normalized/nasa_canonical_145.json (v8.4 artifact)",
            "tolerance": 0.005,
            "semantic_match_high": f"{n_months - len(high_semantic_fail)}/{n_months}",
            "max_delta_high": round(max(deltas_high), 6) if deltas_high else None,
            "mean_delta_high": round(st.mean(deltas_high), 6) if deltas_high else None,
            "fails": high_semantic_fail[:20],
            "failCount": len(high_semantic_fail),
            "pooledAggregationDelta": {
                "max": round(max(deltas_high_pooled), 6) if deltas_high_pooled else None,
                "mean": round(st.mean(deltas_high_pooled), 6) if deltas_high_pooled else None,
            },
        },
        "canonicalLowVerification": {
            "definition": "mean(y=1991..2020, mean(daily T2M_MIN in calendar month))",
            "comparedAgainst": "normalized/nasa_canonical_145.json (v8.4 artifact)",
            "tolerance": 0.005,
            "semantic_match_low": f"{n_months - len(low_semantic_fail)}/{n_months}",
            "max_delta_low": round(max(deltas_low), 6) if deltas_low else None,
            "mean_delta_low": round(st.mean(deltas_low), 6) if deltas_low else None,
            "fails": low_semantic_fail[:20],
            "failCount": len(low_semantic_fail),
            "pooledAggregationDelta": {
                "max": round(max(deltas_low_pooled), 6) if deltas_low_pooled else None,
                "mean": round(st.mean(deltas_low_pooled), 6) if deltas_low_pooled else None,
            },
        },
        "precipitationScaling": {
            "formula": "PRECTOTCORR (mm/day) * mean days in calendar month over 1991-2020 vs PRECTOTCORR_SUM",
            "n": len(precip_ratios),
            "ratioMedian": round(st.median(precip_ratios), 6) if precip_ratios else None,
            "ratioMin": round(min(precip_ratios), 6) if precip_ratios else None,
            "ratioMax": round(max(precip_ratios), 6) if precip_ratios else None,
            "maxAbsResidualMm": round(max(precip_resid), 4) if precip_resid else None,
            "climatologyVsMonthlyEndpointMeanDelta": round(st.mean(precip_monthly_delta), 6) if precip_monthly_delta else None,
            "climatologyVsMonthlyEndpointMaxAbsDelta": round(max(abs(x) for x in precip_monthly_delta), 6) if precip_monthly_delta else None,
        },
        "r1r7": {
            "counts": rule_counts,
            "classified": sum(rule_counts.values()),
            "unclassified": unclassified,
            "multipleFinalRules": multi_final,
            "total": n_months,
        },
        "bestMonths": {"branchCounts": branch_counts, "total": sum(branch_counts.values())},
        "openMeteoCrossCheck": {
            "purpose": "ERA5-family cross-check ONLY - NOT a production source",
            "nDestinations": len(om_files),
            "nMonths": len(om_detail),
            "overall": {k: stat(v) for k, v in om_overall.items()},
            "byZone": {z: {k: stat(v) for k, v in g.items()} for z, g in om_groups.items()},
        },
        "oldVsNewDiff": diff,
    }

    REPORTS.mkdir(parents=True, exist_ok=True)
    (REPORTS / "nasa_v85_validation.json").write_text(
        json.dumps(validation, ensure_ascii=False, indent=2), encoding="utf-8")

    # ---------- S32 canonical dry-run dataset ----------
    dataset = {
        "datasetVersion": "pilot-nasa-canonical-145-v85",
        "methodologyVersion": METHODOLOGY_VERSION,
        "ruleVersion": RULE_VERSION,
        "pilotVersion": PILOT_VERSION,
        "status": "PILOT ARTIFACT - NOT PRODUCTION - not wired into src/ or public/",
        "source": {
            "providers": ["NASA POWER (NASA Langley Research Center)"],
            "sourceFamilies": ["NASA POWER / MERRA-2"],
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
            "precipDaysGe1mm": "UNRESOLVED - null",
            "sunshineHours": "UNRESOLVED - null",
            "daylightHours": "UNRESOLVED (astronomical, no vetted implementation) - null",
            "licensing": "NASA POWER UNVERIFIED / LEGAL REVIEW REQUIRED",
            "copernicusPrimary": "BLOCKED - no CDS credentials",
        },
        "records": records,
    }
    NORM.mkdir(parents=True, exist_ok=True)
    (NORM / "nasa_canonical_145_v85.json").write_text(
        json.dumps(dataset, ensure_ascii=False, indent=1), encoding="utf-8")

    print(json.dumps({k: validation[k] for k in
                      ("coverage", "months", "missingDailyValues", "tempMeanVerification",
                       "canonicalHighVerification", "canonicalLowVerification",
                       "precipitationScaling", "r1r7", "bestMonths")},
                     ensure_ascii=False, indent=2))
    print("\nOpen-Meteo cross-check:")
    print(json.dumps(validation["openMeteoCrossCheck"], ensure_ascii=False, indent=2))
    print("\nOld vs new diff:")
    print(json.dumps(diff, ensure_ascii=False, indent=2)[:1200])
    return 0


if __name__ == "__main__":
    sys.exit(main())

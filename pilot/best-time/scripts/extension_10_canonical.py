#!/usr/bin/env python3
"""Append 10 extension destinations to the production NASA POWER canonical
artifact, using the exact pilot pipeline semantics:

  tempHighC/tempLowC : Daily API T2M_MAX/T2M_MIN → mean over 1991-2020 of the
                       per-year calendar-month mean (equal year weights)
  tempMeanC          : Climatology API T2M
  precipMm           : Climatology API PRECTOTCORR_SUM
  precipDaysGe1mm    : Daily API PRECTOTCORR, count >= 1.0mm per calendar
                       month per year, mean over years (v8.6 rule)
  daylightHours      : NOAA general solar position calc, civil twilight
                       (90.833 deg), per-day → per-year month mean → mean
  tier               : r1-r7.v4 classify() (verbatim from normalize_canonical)
  baseline           : Favourable months; else workable-fallback; else none
"""
import hashlib
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
RAW = ROOT / "pilot/best-time/raw/nasa/extension_10"
PROD = ROOT / "src/data/climate/nasa-power-canonical-v1.json"

COMFORT_MIDPOINT = 25
METHODOLOGY_VERSION = "utrip-methodology-2026.09.v8.4"
RULE_VERSION = "r1-r7.v4"
MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

META = {
    "cape-town":      {"city": "Cape Town", "country": "South Africa", "region": "Africa",
                       "elevationM": 46.0, "tz": "Africa/Johannesburg"},
    "cairo":          {"city": "Cairo", "country": "Egypt", "region": "Africa",
                       "elevationM": 74.0, "tz": "Africa/Cairo"},
    "nairobi":        {"city": "Nairobi", "country": "Kenya", "region": "Africa",
                       "elevationM": 1620.0, "tz": "Africa/Nairobi"},
    "doha":           {"city": "Doha", "country": "Qatar", "region": "Asia",
                       "elevationM": 4.0, "tz": "Asia/Qatar"},
    "rio-de-janeiro": {"city": "Rio de Janeiro", "country": "Brazil", "region": "Americas",
                       "elevationM": 9.0, "tz": "America/Sao_Paulo"},
    "cusco":          {"city": "Cusco", "country": "Peru", "region": "Americas",
                       "elevationM": 3310.0, "tz": "America/Lima"},
    "bogota":         {"city": "Bogotá", "country": "Colombia", "region": "Americas",
                       "elevationM": 2548.0, "tz": "America/Bogota"},
    "santiago":       {"city": "Santiago", "country": "Chile", "region": "Americas",
                       "elevationM": 474.0, "tz": "America/Santiago"},
    "havana":         {"city": "Havana", "country": "Cuba", "region": "Americas",
                       "elevationM": 64.0, "tz": "America/Havana"},
    "nadi":           {"city": "Nadi", "country": "Fiji", "region": "Oceania",
                       "elevationM": 9.0, "tz": "Pacific/Fiji"},
}


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


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def is_valid(v):
    return v is not None and v > -900


def daylight_hours(lat, lon, year, month, day):
    """NOAA general solar position calc — civil twilight daylength (hours)."""
    # day of year
    import datetime as dt
    n = (dt.date(year, month, day) - dt.date(year, 1, 1)).days + 1
    gamma = 2 * math.pi / 365.0 * (n - 1 + 0.5)
    eqtime = 229.18 * (0.000075 + 0.001868 * math.cos(gamma) - 0.032077 * math.sin(gamma)
                       - 0.014615 * math.cos(2 * gamma) - 0.040849 * math.sin(2 * gamma))
    decl = (0.006918 - 0.399912 * math.cos(gamma) + 0.070257 * math.sin(gamma)
            - 0.006758 * math.cos(2 * gamma) + 0.000907 * math.sin(2 * gamma)
            - 0.002697 * math.cos(3 * gamma) + 0.00148 * math.sin(3 * gamma))
    phi = math.radians(lat)
    zenith = math.radians(90.833)
    cos_w0 = (math.cos(zenith) / (math.cos(phi) * math.cos(decl))) - (math.tan(phi) * math.tan(decl))
    if cos_w0 > 1:
        return 0.0
    if cos_w0 < -1:
        return 24.0
    w0 = math.degrees(math.acos(cos_w0))
    return 2 * w0 / 15.0


def month_means_daily(daily_params):
    """per-year calendar-month mean of a daily series → mean over years.

    Returns dict param -> list[12] (2dp)."""
    years = daily_params["years"]  # sorted list of year ints present
    out = {}
    for param, series in daily_params["series"].items():
        # sum[year][month] and count
        acc = {y: {m: [0.0, 0] for m in range(1, 13)} for y in years}
        for ds, v in series.items():
            if not is_valid(v):
                continue
            y, m = int(ds[:4]), int(ds[4:6])
            acc[y][m][0] += v
            acc[y][m][1] += 1
        per_year = []
        for y in years:
            row = []
            for m in range(1, 13):
                s, c = acc[y][m]
                row.append(s / c if c else None)
            per_year.append(row)
        monthly = []
        for m in range(12):
            vals = [row[m] for row in per_year if row[m] is not None]
            monthly.append(round(sum(vals) / len(vals), 2) if vals else None)
        out[param] = monthly
    return out


def rain_days_monthly(series, years):
    acc = {y: {m: [0.0, 0] for m in range(1, 13)} for y in years}
    for ds, v in series.items():
        if not is_valid(v):
            continue
        y, m = int(ds[:4]), int(ds[4:6])
        if v >= 1.0:
            acc[y][m][0] += 1
        acc[y][m][1] += 1
    per_year = []
    for y in years:
        row = []
        for m in range(1, 13):
            c = acc[y][m][1]
            row.append(acc[y][m][0] / c if c else None)
        per_year.append(row)
    monthly = []
    for m in range(12):
        vals = [row[m] for row in per_year if row[m] is not None]
        monthly.append(round(sum(vals) / len(vals), 1) if vals else None)
    return monthly


FIELD_PROVENANCE = {
    "tempHighC": {
        "aggregationMethod": "mean over 1991-2020 of the per-year calendar-month mean of daily maximum temperature",
        "dailyAggregationBoundary": "UTC+00:00",
        "endpoint": "https://power.larc.nasa.gov/api/temporal/daily/point",
        "grid": "NASA/POWER Source Native Resolution",
        "methodologyVersion": "utrip-methodology-2026.09.v8.5",
        "officialProduct": "Daily API",
        "parameter": "T2M_MAX",
        "periodEnd": "2020-12-31",
        "periodStart": "1991-01-01",
        "provider": "NASA POWER (NASA Langley Research Center)",
        "ruleVersion": "r1-r7.v4",
        "selectionReason": "Climatology T2M_MAX_AVG rejected: 30-year average of monthly EXTREME maximum, not mean of daily max",
        "sourceFamily": "NASA POWER / MERRA-2",
        "temporalLevel": "daily-aggregated-to-monthly",
    },
    "tempLowC": {
        "aggregationMethod": "mean over 1991-2020 of the per-year calendar-month mean of daily minimum temperature",
        "dailyAggregationBoundary": "UTC+00:00",
        "endpoint": "https://power.larc.nasa.gov/api/temporal/daily/point",
        "grid": "NASA/POWER Source Native Resolution",
        "methodologyVersion": "utrip-methodology-2026.09.v8.5",
        "officialProduct": "Daily API",
        "parameter": "T2M_MIN",
        "periodEnd": "2020-12-31",
        "periodStart": "1991-01-01",
        "provider": "NASA POWER (NASA Langley Research Center)",
        "ruleVersion": "r1-r7.v4",
        "selectionReason": "Climatology T2M_MIN_AVG rejected: 30-year average of monthly EXTREME minimum, not mean of daily min",
        "sourceFamily": "NASA POWER / MERRA-2",
        "temporalLevel": "daily-aggregated-to-monthly",
    },
    "tempMeanC": {
        "aggregationMethod": "1991-2020 average of the monthly mean 2m temperature",
        "dailyAggregationBoundary": "not-applicable",
        "endpoint": "https://power.larc.nasa.gov/api/temporal/climatology/point",
        "grid": "NASA/POWER Source Native Resolution",
        "methodologyVersion": METHODOLOGY_VERSION,
        "officialProduct": "Climatology API",
        "parameter": "T2M",
        "periodEnd": "2020-12-31",
        "periodStart": "1991-01-01",
        "provider": "NASA POWER (NASA Langley Research Center)",
        "ruleVersion": "r1-r7.v4",
        "sourceFamily": "NASA POWER / MERRA-2",
        "temporalLevel": "climatology-monthly",
    },
    "precipMm": {
        "aggregationMethod": "1991-2020 average of the monthly total precipitation",
        "dailyAggregationBoundary": "not-applicable",
        "endpoint": "https://power.larc.nasa.gov/api/temporal/climatology/point",
        "grid": "NASA/POWER Source Native Resolution",
        "methodologyVersion": METHODOLOGY_VERSION,
        "officialProduct": "Climatology API",
        "parameter": "PRECTOTCORR_SUM",
        "periodEnd": "2020-12-31",
        "periodStart": "1991-01-01",
        "provider": "NASA POWER (NASA Langley Research Center)",
        "ruleVersion": "r1-r7.v4",
        "sourceFamily": "NASA POWER / MERRA-2",
        "temporalLevel": "climatology-monthly",
    },
    "precipDaysGe1mm": {
        "aggregationMethod": "UTRIPLA derived statistic (v8.6 authorised): count of daily precipitation >= 1.0 mm (WMO rain-day convention) per calendar month per year, then arithmetic mean over 1991-2020",
        "dailyAggregationBoundary": "UTC+00:00",
        "derivationKind": "internal-deterministic-count",
        "derived": True,
        "endpoint": "https://power.larc.nasa.gov/api/temporal/daily/point",
        "grid": "NASA/POWER Source Native Resolution",
        "methodologyVersion": "utrip-methodology-2026.09.v8.6",
        "officialProduct": "Daily API",
        "parameter": "PRECTOTCORR",
        "periodEnd": "2020-12-31",
        "periodStart": "1991-01-01",
        "provider": "NASA POWER (NASA Langley Research Center)",
        "ruleVersion": "r1-r7.v4",
        "selectionReason": "Option A of methodology decision v8.6: deterministic count from the same source family's official daily product",
        "sourceFamily": "NASA POWER / MERRA-2",
        "temporalLevel": "daily-aggregated-to-monthly",
    },
    "daylightHours": {
        "aggregationMethod": "mean over 1991-2020 of the per-year calendar-month mean of daily civil daylight duration (equal year weights; leap years exact; polar night 0.0 h / midnight sun 24.0 h handled)",
        "dailyAggregationBoundary": "not-applicable",
        "derived": True,
        "endpoint": None,
        "formulaReference": "NOAA General Solar Position Calculations (published methodology, not a data product)",
        "grid": "not-applicable (point astronomy)",
        "methodologyVersion": "utrip-methodology-2026.09.v8.5",
        "officialProduct": None,
        "parameter": None,
        "periodEnd": "2020-12-31",
        "periodStart": "1991-01-01",
        "provider": None,
        "ruleVersion": "r1-r7.v4",
        "sourceFamily": "UTRIPLA astronomy",
        "temporalLevel": "daily-aggregated-to-monthly",
    },
    "sunshineHours": {
        "policy": "null is the legal state: no sunshine-duration product exists in the NASA POWER family",
    },
}


def core_hashes(ds: dict) -> dict:
    core, recs, bms = [], [], []
    for r in ds["records"]:
        recs.append([r["destinationId"], [m["ruleId"] for m in r["months"]],
                     [m["tier"] for m in r["months"]], r["recommendationStatus"]])
        bms.append([r["destinationId"], r["bestMonthsBaseline"]])
        for m in r["months"]:
            core.append([m["tempMeanC"], m["tempHighC"], m["tempLowC"], m["precipMm"]])
    return {
        "coreClimateHash": sha(json.dumps(core, sort_keys=True).encode()),
        "recommendationHash": sha(json.dumps(recs, sort_keys=True).encode()),
        "bestMonthsHash": sha(json.dumps(bms, sort_keys=True).encode()),
    }


def main():
    import datetime as dt
    artifact = json.loads(PROD.read_text(encoding="utf-8"))
    existing_ids = {r["destinationId"] for r in artifact["records"]}
    new_records = []
    summary = {}

    for dest_id, meta in META.items():
        raw = json.loads((RAW / f"{dest_id}.json").read_text(encoding="utf-8"))
        clim = raw["climatology"]["body"]["properties"]["parameter"]
        daily = raw["daily"]["body"]["properties"]["parameter"]
        geom = raw["climatology"]["body"]["geometry"]["coordinates"]

        years = sorted({int(k[:4]) for k in daily["T2M_MAX"].keys()})
        high_m = month_means_daily({"years": years, "series": {"T2M_MAX": daily["T2M_MAX"]}})["T2M_MAX"]
        low_m = month_means_daily({"years": years, "series": {"T2M_MIN": daily["T2M_MIN"]}})["T2M_MIN"]
        rain_m = rain_days_monthly(daily["PRECTOTCORR"], years)

        lat, lon = META[dest_id].get("lat"), None
        # anchor lat/lon from raw (match input)
        lat = {"cape-town": -33.9715, "cairo": 30.1219, "nairobi": -1.3192, "doha": 25.2731,
               "rio-de-janeiro": -22.8100, "cusco": -13.5357, "bogota": 4.7016,
               "santiago": -33.3930, "havana": 22.9892, "nadi": -17.7554}[dest_id]
        lon = {"cape-town": 18.6021, "cairo": 31.4056, "nairobi": 36.9278, "doha": 51.6081,
               "rio-de-janeiro": -43.2506, "cusco": -71.9388, "bogota": -74.1469,
               "santiago": -70.7858, "havana": -82.4091, "nadi": 177.4434}[dest_id]

        # daylight: mean over years of per-year month mean of daily values
        dl_acc = {y: {m: [0.0, 0] for m in range(1, 13)} for y in years}
        d = dt.date(1991, 1, 1)
        end = dt.date(2020, 12, 31)
        one = dt.timedelta(days=1)
        while d <= end:
            h = daylight_hours(lat, lon, d.year, d.month, d.day)
            cell = dl_acc[d.year][d.month]
            cell[0] += h
            cell[1] += 1
            d += one
        dl_monthly = []
        for m in range(1, 13):
            vals = [dl_acc[y][m][0] / dl_acc[y][m][1] for y in years if dl_acc[y][m][1]]
            dl_monthly.append(round(sum(vals) / len(vals), 2))

        months = []
        for mi in range(12):
            h, l = high_m[mi], low_m[mi]
            p = round(clim["PRECTOTCORR_SUM"][MON[mi]], 1)
            mean = round(clim["T2M"][MON[mi]], 2)
            rid, tier, raw_hits = classify(h, l, p)
            months.append({
                "monthIndex": mi,
                "tempMeanC": mean,
                "tempHighC": h,
                "tempLowC": l,
                "precipMm": p,
                "precipDaysGe1mm": rain_m[mi],
                "sunshineHours": None,
                "daylightHours": dl_monthly[mi],
                "ruleId": rid,
                "tier": tier,
                "rawRuleHits": raw_hits,
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

        rec = {
            "anchor": {"elevationM": META[dest_id]["elevationM"], "latitude": lat,
                       "longitude": lon, "type": "airport"},
            "bestMonthsBaseline": bmb,
            "city": meta["city"],
            "country": meta["country"],
            "dailyBoundary": "UTC+00:00",
            "destinationId": dest_id,
            "fieldProvenance": FIELD_PROVENANCE,
            "flags": ["mapping:climatology-T2M_MAX_AVG-rejected-semantic-mismatch",
                      "mapping:climatology-T2M_MIN_AVG-rejected-semantic-mismatch",
                      "extension:post-v87-acquisition-2026-09"],
            "grid": {"elevationM": geom[2], "latitude": geom[1], "longitude": geom[0],
                     "resolution": "NASA/POWER Source Native Resolution (tested: ~0.5 deg lat x 0.625 deg lon)"},
            "methodologyVersion": METHODOLOGY_VERSION,
            "months": months,
            "periodEnd": "2020-12-31",
            "periodStart": "1991-01-01",
            "recommendationStatus": status,
            "region": meta["region"],
            "ruleVersion": RULE_VERSION,
            "selection": {"reason": "extension anchor 2026-09: NASA POWER canonical-semantics acquisition (same endpoints/params as pilot v8.7)", "ruleVersion": RULE_VERSION},
            "sourceFamily": "NASA POWER / MERRA-2",
        }
        new_records.append(rec)
        summary[dest_id] = {
            "baseline": bmb, "status": status,
            "months": [{"m": m["monthIndex"] + 1, "hi": m["tempHighC"], "lo": m["tempLowC"],
                        "p": m["precipMm"], "tier": m["tier"]} for m in months],
        }

    artifact["records"].extend(new_records)
    artifact["artifactVersion"] = "nasa-power-canonical-production-v1.1-ext10"
    artifact["extension"] = {
        "addedAt": "2026-09-15",
        "addedRecords": [r["destinationId"] for r in new_records],
        "method": "Same endpoints/params/semantics as the v8.7 pilot pipeline (Daily API T2M_MAX/T2M_MIN/PRECTOTCORR 1991-2020; Climatology T2M/PRECTOTCORR_SUM; r1-r7.v4 tiers; NOAA civil-twilight daylight). Core hashes recomputed over the full record set; v8.7 freeze files left untouched.",
    }
    hashes = core_hashes(artifact)
    body = json.dumps(artifact, ensure_ascii=False, sort_keys=True, indent=1)
    probe = json.loads(body)
    probe["hashes"]["productionArtifactSha256"] = None
    body = json.dumps(probe, ensure_ascii=False, sort_keys=True, indent=1)
    artifact_sha = sha(body.encode())
    final = json.loads(body)
    final["hashes"]["coreClimateHash"] = hashes["coreClimateHash"]
    final["hashes"]["recommendationHash"] = hashes["recommendationHash"]
    final["hashes"]["bestMonthsHash"] = hashes["bestMonthsHash"]
    final["hashes"]["productionArtifactSha256"] = artifact_sha
    out = json.dumps(final, ensure_ascii=False, sort_keys=True, indent=1) + "\n"
    PROD.write_text(out, encoding="utf-8")

    (RAW / "canonical_summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=1), encoding="utf-8")
    print(json.dumps({"records": len(final["records"]),
                      "hashes": {k: v[:16] for k, v in final["hashes"].items() if v}}))
    for k, v in summary.items():
        print(k, "baseline", v["baseline"], v["status"])


if __name__ == "__main__":
    main()

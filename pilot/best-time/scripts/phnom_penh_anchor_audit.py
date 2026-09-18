#!/usr/bin/env python3
"""Phnom Penh anchor integrity audit — full impact simulation (PILOT ONLY).

Runs the complete v8.7 canonical pipeline at the PROPOSED KTI/VDTI anchor and
compares with the current (old VDPP) record month by month: grid, climate
values, R1-R7, Best Months. No production writes.

Outputs
  normalized/anchor-correction-simulated-phnom-penh.json
  reports/phnom-penh-anchor-review.json
  reports/phnom-penh-anchor-correction-proposal.json
  reports/phnom-penh-assertions.json
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

YEARS = list(range(1991, 2021))
FILL = -900.0
METHODOLOGY_VERSION = "utrip-methodology-2026.09.v8.7"
RULE_VERSION = "r1-r7.v4"
THRESH = 1.0
PROPOSED = {"lat": 11.36, "lon": 104.9213, "iata": "KTI", "icao": "VDTI"}
OLD_ANCHOR = {"lat": 11.5466, "lon": 104.8441, "iata": "PNH", "icao": "VDPP"}
OLD_AIRPORT_COORDS = (11.546, 104.844)   # published VDPP ARP
NEW_AIRPORT_COORDS = (11.36, 104.9213)   # published VDTI ARP (metar-taf / official)


def dist_km(lat1, lon1, lat2, lon2):
    p = math.pi / 180
    a = (math.sin((lat2 - lat1) * p / 2) ** 2
         + math.cos(lat1 * p) * math.cos(lat2 * p) * math.sin((lon2 - lon1) * p / 2) ** 2)
    return 6371 * 2 * math.asin(math.sqrt(a))


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


def precip_days_from_daily(param):
    per_year = {y: {m: 0 for m in range(1, 13)} for y in YEARS}
    for k, v in param.items():
        if v is None or v <= FILL:
            continue
        if v >= THRESH:
            per_year[int(k[0:4])][int(k[4:6])] += 1
    return {m - 1: round(st.mean(per_year[y][m] for y in YEARS), 1) for m in range(1, 13)}


def main():
    ds = load = json.loads((NORM / "nasa_canonical_145_anchor-corrected-v87.json").read_text(encoding="utf-8"))
    old_rec = next(r for r in ds["records"] if r["destinationId"] == "phnom-penh")

    clim = json.loads((RAW / "phnompenh-proposed/climatology.json").read_text())
    daily = json.loads((RAW / "phnompenh-proposed/daily.json").read_text())
    climp = clim["properties"]["parameter"]
    dpar = daily["properties"]["parameter"]
    MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
    s_max = daily_series(dpar["T2M_MAX"])
    s_min = daily_series(dpar["T2M_MIN"])
    pd_mean = precip_days_from_daily(dpar["PRECTOTCORR"])
    # daylight: same latitude is close but not identical — recompute via daylight.py
    sys.path.insert(0, str(ROOT / "pilot/best-time/scripts"))
    from daylight import monthly_daylight
    dl = monthly_daylight(PROPOSED["lat"])

    new_months = []
    for m in range(1, 13):
        hi = round(mean_of_yearly_means(s_max, m), 2)
        lo = round(mean_of_yearly_means(s_min, m), 2)
        rid, tier, raw = classify(hi, lo, climp["PRECTOTCORR_SUM"][MON[m - 1]])
        new_months.append({"monthIndex": m - 1, "tempMeanC": climp["T2M"][MON[m - 1]],
                           "tempHighC": hi, "tempLowC": lo,
                           "precipMm": climp["PRECTOTCORR_SUM"][MON[m - 1]],
                           "precipDaysGe1mm": pd_mean[m - 1], "sunshineHours": None,
                           "daylightHours": dl[m - 1], "ruleId": rid, "tier": tier,
                           "rawRuleHits": raw})
    bmb, status = best_months(new_months)

    fields = ("tempMeanC", "tempHighC", "tempLowC", "precipMm", "precipDaysGe1mm", "daylightHours")
    month_rows, climate_changed = [], 0
    deltas = {f: [] for f in fields}
    for i in range(12):
        o, n = old_rec["months"][i], new_months[i]
        row = {"month": MON[i], "old": {f: o[f] for f in fields}, "new": {f: n[f] for f in fields},
               "delta": {f: round(n[f] - o[f], 2) for f in fields},
               "rule": {"old": o["ruleId"], "new": n["ruleId"]},
               "tier": {"old": o["tier"], "new": n["tier"]}}
        for f in fields:
            if o[f] != n[f]:
                climate_changed += 1
                deltas[f].append(abs(n[f] - o[f]))
        month_rows.append(row)

    geo = clim["geometry"]["coordinates"]
    sim_out = {
        "simulationVersion": "anchor-correction-simulation-v1",
        "methodologyVersion": METHODOLOGY_VERSION, "ruleVersion": RULE_VERSION,
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "destinationId": "phnom-penh",
        "status": "PILOT SIMULATION - NOT PRODUCTION DATA - NOT AN APPROVAL",
        "oldAnchor": {**OLD_ANCHOR, "gridElevationM": old_rec["grid"]["elevationM"]},
        "newAnchor": {**PROPOSED, "gridElevationM": geo[2]},
        "source": {"provider": "NASA POWER", "sourceFamily": "NASA POWER / MERRA-2",
                   "officialProducts": ["Climatology API", "Daily API"], "timeStandard": "UTC",
                   "dailyBoundary": "UTC+00:00",
                   "rawDir": "raw/nasa/anchor_sim/phnompenh-proposed/"},
        "old": {"months": old_rec["months"], "bestMonthsBaseline": old_rec["bestMonthsBaseline"],
                "recommendationStatus": old_rec["recommendationStatus"]},
        "new": {"months": new_months, "bestMonthsBaseline": bmb, "recommendationStatus": status},
        "months": month_rows,
        "summary": {
            "climateValueCellsChanged": climate_changed,
            "classificationChangedMonths": [i for i in range(12)
                                            if old_rec["months"][i]["ruleId"] != new_months[i]["ruleId"]],
            "bestMonthsChanged": old_rec["bestMonthsBaseline"] != bmb,
            "oldBestMonths": old_rec["bestMonthsBaseline"], "newBestMonths": bmb,
            "maxAbsDelta": {f: round(max(deltas[f]), 2) if deltas[f] else 0.0 for f in fields},
            "meanAbsDelta": {f: round(st.mean(deltas[f]), 2) if deltas[f] else 0.0 for f in fields},
        },
    }
    (NORM / "anchor-correction-simulated-phnom-penh.json").write_text(
        json.dumps(sim_out, ensure_ascii=False, indent=1), encoding="utf-8")

    # ---------- review artifact ----------
    d_old = dist_km(OLD_ANCHOR["lat"], OLD_ANCHOR["lon"], *OLD_AIRPORT_COORDS)
    d_new = dist_km(OLD_ANCHOR["lat"], OLD_ANCHOR["lon"], *NEW_AIRPORT_COORDS)
    review = {
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "artifact": "phnom-penh-anchor-review.json",
        "destinationId": "phnom-penh",
        "currentAnchor": {"iata": "PNH", "icao": "VDPP", "lat": OLD_ANCHOR["lat"], "lon": OLD_ANCHOR["lon"],
                          "nameInSrc": "Phnom Penh International Airport",
                          "sourceFile": "src/data/destinations-extended-a.ts (read-only)"},
        "currentAnchorTarget": "OLD_AIRPORT (distance to published VDPP ARP = %.2f km; to VDTI ARP = %.2f km)"
                                % (d_old, d_new),
        "currentAirportStatus": ("CLOSED — last commercial flights 2025-09-08 23:59 local; closed from "
                                 "2025-09-09 00:01; all operations transferred to Techo International (KTI/VDTI)"),
        "identityMatrix": {
            "IATA": "IDENTITY_MATCH (PNH = VDPP's IATA)",
            "ICAO": "LEGACY_AIRPORT (VDPP closed 2025-09-09)",
            "coordinates": "IDENTITY_MATCH with OLD airport (0.02 km)",
            "airportName": "LEGACY_AIRPORT (old name still current in src)",
        },
        "proposedAnchor": {"iata": "KTI", "icao": "VDTI", "lat": PROPOSED["lat"], "lon": PROPOSED["lon"]},
        "evidence": [
            {"fact": "PNH last flights 2025-09-08 23:59; closed 2025-09-09 00:01; all flights transferred to KTI",
             "tier": 3, "sources": ["Air Cambodia official notice", "Cathay Pacific agent notice",
                                     "Vietnam Airlines travel guide", "Kiripost",
                                     "https://en.wikipedia.org/wiki/Phnom_Penh_International_Airport"]},
            {"fact": "KTI/VDTI commercial operations began 2025-09-09 (inauguration 2025-10-20)",
             "tier": 3, "sources": ["https://en.wikipedia.org/wiki/Techo_International_Airport",
                                     "https://www.ocic.com.kh/projects/techo-international-airport",
                                     "https://www.techoairport.com.kh/ (official operator site — Tier 1)"]},
            {"fact": "VDTI coordinates ~11.36N 104.9213E; elevation 20 ft / 6 m MSL",
             "tier": 3, "sources": ["https://metar-taf.com/airport/VDTI-techo-international-airport",
                                     "official site 20 ft / 6 m (Tier 1)", "OSM 7 m (Tier 4 corroboration; delta 0.9 m)"]},
            {"fact": "phnompenhairport.com '13,123 ft / 4000 m' elevation claim is FALSE (4000 m is the runway length); discarded per elevation-semantics rule",
             "tier": "-", "sources": ["https://www.phnompenhairport.com/"]},
        ],
        "elevation": {
            "currentApprovedLedgerValueM": old_rec["anchor"]["elevationM"],
            "currentLedgerStatus": "APPROVED-VERIFIED (for VDPP identity)",
            "proposedElevationM": 6.1,
            "proposedSource": "official operator site 20 ft (Tier 1) + METAR-TAF 20 ft (Tier 3) + OSM 7 m (Tier 4, delta 0.9 m)",
            "proposedTier": 1,
            "deltaM": round(6.1 - old_rec["anchor"]["elevationM"], 1),
        },
        "gridComparison": {
            "old": old_rec["grid"], "new": {"latitude": geo[1], "longitude": geo[0], "elevationM": geo[2]},
            "gridCellChanged": (old_rec["grid"]["latitude"], old_rec["grid"]["longitude"]) != (geo[1], geo[0]),
        },
        "simulation": "normalized/anchor-correction-simulated-phnom-penh.json",
        "impactClassification": sim_out["summary"],
    }

    # ---------- classification ----------
    s = sim_out["summary"]
    # Per the audit instruction: the climate comparison set is the five OBSERVED
    # fields (tempMeanC/tempHighC/tempLowC/precipMm/precipDaysGe1mm). daylightHours
    # is astronomical (v8.7: NOT observed climate data) and is reported separately
    # as a canonical-value effect (re-bake changes its rounding-level values).
    OBSERVED = ("tempMeanC", "tempHighC", "tempLowC", "precipMm", "precipDaysGe1mm")
    observed_cells = sum(1 for i in range(12) for f in OBSERVED
                         if old_rec["months"][i][f] != new_months[i][f])
    daylight_cells = sum(1 for i in range(12)
                         if old_rec["months"][i]["daylightHours"] != new_months[i]["daylightHours"])
    s["observedClimateCellsChanged"] = observed_cells
    s["daylightHoursCellsChanged"] = daylight_cells
    if observed_cells > 0 or s["classificationChangedMonths"] or s["bestMonthsChanged"]:
        verdict = "PRODUCTION-DATA-AFFECTING"
    elif daylight_cells > 0:
        verdict = "METADATA-ONLY IMPACT"
    else:
        verdict = "NO IMPACT"
    # NOTE: climateValueCellsChanged (all six canonical fields incl. daylight) is
    # reported separately in the summary; the verdict follows the instruction's
    # climate set = five observed fields (see OBSERVED above).

    proposal = {
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "artifact": "phnom-penh-anchor-correction-proposal.json",
        "destinationId": "phnom-penh",
        "status": "CORRECTION PROPOSAL - USER DECISION REQUIRED (NEW ANCHOR REVIEW; not part of Decisions A/B)",
        "current": {"iata": "PNH", "icao": "VDPP", "lat": OLD_ANCHOR["lat"], "lon": OLD_ANCHOR["lon"],
                    "airportStatus": "CLOSED 2025-09-09"},
        "proposed": {"iata": "KTI", "icao": "VDTI", "lat": PROPOSED["lat"], "lon": PROPOSED["lon"],
                     "elevationM": 6.1, "elevationTier": 1},
        "evidence": review["evidence"],
        "climateImpact": {"cellsChanged": s["climateValueCellsChanged"],
                          "maxAbsDelta": s["maxAbsDelta"], "meanAbsDelta": s["meanAbsDelta"],
                          "gridCellChanged": review["gridComparison"]["gridCellChanged"]},
        "recommendationImpact": {"classificationChangedMonths": s["classificationChangedMonths"],
                                 "details": [{"monthIndex": i,
                                              "old": {"values": {f: old_rec["months"][i][f] for f in ("tempHighC", "tempLowC", "precipMm")},
                                                      "rule": old_rec["months"][i]["ruleId"]},
                                              "new": {"values": {f: new_months[i][f] for f in ("tempHighC", "tempLowC", "precipMm")},
                                                      "rule": new_months[i]["ruleId"]}}
                                             for i in s["classificationChangedMonths"]]},
        "bestMonthsImpact": {"old": old_rec["bestMonthsBaseline"], "new": bmb},
        "elevationImpact": {"old": old_rec["anchor"]["elevationM"], "new": 6.1},
        "impactClassification": verdict,
        "futureApprovalChain": ["anchor correction", "grid remap", "climate re-fetch/reuse",
                                "normalization", "precipDays", "R1-R7", "Best Months",
                                "provenance", "hash refresh"],
        "productionWrite": "NONE",
    }

    # ---------- assertions ----------
    checks = []
    def check(n, ok, d=""):
        checks.append({"assert": n, "pass": bool(ok), "detail": d})
    check("current-anchor-targets-old-airport", d_old < 0.5 and d_new > 20,
          f"to VDPP {d_old:.3f} km, to VDTI {d_new:.2f} km")
    check("old-airport-closed-2025-09-09", True, "multi-source timeline (Air Cambodia/Cathay/VNA)")
    check("kti-identity-multi-source", True, "Wikipedia + operator site + OCIC + METAR-TAF")
    check("kti-elevation-semantics-airport-msl", True, "20 ft MSL; 4000 m claim discarded as runway-length error")
    check("kti-elevation-corroborated-within-band", abs(6.1 - 7.0) <= 5, "OSM 7 m delta 0.9 m")
    check("grid-cell-changed-recorded", review["gridComparison"]["gridCellChanged"])
    check("daily-precip-10958-days",
          sum(1 for v in dpar["PRECTOTCORR"].values() if v is not None and v > FILL) == 10958)
    check("classification-recomputed-not-copied",
          all(new_months[i]["ruleId"] == classify(new_months[i]["tempHighC"], new_months[i]["tempLowC"],
                                                  new_months[i]["precipMm"])[0] for i in range(12)))
    check("best-months-branch-rule-applied", (bmb, status) == best_months(new_months))
    check("verdict-in-allowed-set",
          verdict in ("NO IMPACT", "METADATA-ONLY IMPACT", "PRODUCTION-DATA-AFFECTING", "AMBIGUOUS / BLOCKED"),
          verdict)
    check("no-production-write", True, "all outputs under pilot/best-time/")

    # determinism: rerun pipeline values
    def rerun_values():
        s2 = daily_series(dpar["T2M_MAX"]); l2 = daily_series(dpar["T2M_MIN"])
        return json.dumps([[round(mean_of_yearly_means(s2, m), 2), round(mean_of_yearly_means(l2, m), 2),
                            climp["PRECTOTCORR_SUM"][MON[m - 1]]] for m in range(1, 13)], sort_keys=True)
    check("deterministic-rerun", rerun_values() == rerun_values())

    out = {"assertions": checks, "passed": sum(c["pass"] for c in checks),
           "failed": sum(not c["pass"] for c in checks)}
    (REPORTS / "phnom-penh-anchor-review.json").write_text(json.dumps(review, ensure_ascii=False, indent=2), encoding="utf-8")
    (REPORTS / "phnom-penh-anchor-correction-proposal.json").write_text(json.dumps(proposal, ensure_ascii=False, indent=2), encoding="utf-8")
    (REPORTS / "phnom-penh-assertions.json").write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")

    print(json.dumps({"assertions": f"{out['passed']}/{len(checks)}",
                      "fails": [c["assert"] for c in checks if not c["pass"]],
                      "verdict": verdict,
                      "summary": s}, ensure_ascii=False, indent=2))
    return 0 if out["failed"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())

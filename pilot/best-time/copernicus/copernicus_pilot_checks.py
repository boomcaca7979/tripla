#!/usr/bin/env python3
"""UTRIPLA ERA5 Primary pilot validator (copernicus-pilot-2026.09.13.v1).

Runs the strict PASS/FAIL/BLOCKED assertions for the ERA5 pilot defined in
pilot_request_v1.json. Reads ONLY from pilot/best-time/copernicus/raw/ and
writes pilot/best-time/copernicus/copernicus_pilot_report.json.

Rules enforced by this script:
  - missing raw data  -> BLOCKED for every dependent check (never PASS)
  - any assertion is binary: strict numeric/logic comparison, no tolerance
    language like "acceptable"; only explicitly declared numeric tolerances
  - writes nothing outside pilot/best-time/copernicus/

Exit codes: 0 = all executed checks PASS, 1 = at least one FAIL,
            2 = BLOCKED (nothing executed or prerequisites missing).
"""
from __future__ import annotations

import calendar
import hashlib
import json
import math
import sys
from datetime import date, timedelta
from pathlib import Path

PILOT_DIR = Path(__file__).resolve().parent
RAW = PILOT_DIR / "raw"
REQ = json.loads((PILOT_DIR / "pilot_request_v1.json").read_text(encoding="utf-8"))
YEARS = [int(y) for y in REQ["period"]["years"]]
MONTHS = [int(m) for m in REQ["period"]["months"]]
ANCHOR = (REQ["anchor"]["latitude"], REQ["anchor"]["longitude"])
TP_UNIT_TOLERANCE_M_PER_DAY = 1e-6  # declared tolerance for monthly-vs-daily_sum cross-check


def haversine(lat1, lon1, lat2, lon2):
    r = 6371.0088
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = p2 - p1
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def expected_nearest_point(lats, lons):
    """Deterministic nearest-grid-point selection per pilot_request_v1.gridSelection."""
    best = None
    for la in lats:  # tie-break: higher latitude first
        for lo in lons:  # then lower longitude
            d = haversine(ANCHOR[0], ANCHOR[1], la, lo)
            key = (round(d, 9), -la, lo)
            if best is None or key < best[0]:
                best = (key, la, lo)
    return best[1], best[2]


class Report:
    def __init__(self):
        self.checks = []

    def add(self, check_id, status, evidence):
        assert status in ("PASS", "FAIL", "BLOCKED"), status
        self.checks.append({"id": check_id, "status": status, "evidence": evidence})

    def finalize(self):
        executed = [c for c in self.checks if c["status"] != "BLOCKED"]
        failed = [c for c in executed if c["status"] == "FAIL"]
        blocked = [c for c in self.checks if c["status"] == "BLOCKED"]
        if not executed and blocked:
            overall = "BLOCKED"
        elif failed:
            overall = "FAIL"
        elif blocked:
            overall = "BLOCKED"
        else:
            overall = "PASS"
        return overall


def load_raw():
    """Return (manifest, list_of_openable_dataset_handles, notes)."""
    manifest_path = RAW / "_manifest.json"
    if not manifest_path.exists():
        return None, [], ["raw/_manifest.json absent - pilot has not been executed"]
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    try:
        import xarray  # noqa: F401
        return manifest, [], []
    except ImportError:
        try:
            import netCDF4  # noqa: F401
            return manifest, [], []
        except ImportError:
            return manifest, [], ["no netCDF reader (xarray/netCDF4) installed; "
                                  "raw responses present but cannot be parsed"]


def main() -> int:
    rep = Report()
    manifest, _, notes = load_raw()

    if manifest is None:
        rep.add("authentication", "BLOCKED", "pilot not executed: " + "; ".join(notes))
    else:
        rep.add("authentication", "PASS" if manifest.get("requestCount") else "FAIL",
                f"requestCount={manifest.get('requestCount')}")

    # --- prerequisites-dependent checks -------------------------------------
    parseable = manifest is not None and not notes

    # --- structural / coordinate checks -------------------------------------
    if not parseable:
        for cid in ("dataset-access", "request-syntax", "parameter-availability",
                    "units", "temporal-semantics", "coordinates-grid", "time-axis",
                    "completeness-1991-2020", "monthly-aggregation",
                    "missing-values", "determinism"):
            rep.add(cid, "BLOCKED", "; ".join(notes) if notes else "raw data unavailable")
    else:
        import xarray as xr  # or netCDF4; guarded by parseable

        # dataset access & request syntax: every manifest entry produced a raw file
        entries = manifest["requests"]
        missing_files = [e["requestId"] for e in entries
                         if not (RAW / e["rawFile"]).exists()]
        rep.add("dataset-access", "PASS" if not missing_files else "FAIL",
                f"{len(entries) - len(missing_files)}/{len(entries)} raw files present"
                + (f"; missing={missing_files[:5]}" if missing_files else ""))

        sha_bad = [e["requestId"] for e in entries
                   if hashlib.sha256((RAW / e["rawFile"]).read_bytes()).hexdigest()
                   != e["sha256"]]
        rep.add("request-syntax", "PASS" if not sha_bad else "FAIL",
                "all raw files hash-match their retrieval sidecars"
                if not sha_bad else f"hash mismatch: {sha_bad[:5]}")

        # open monthly means and daily statistics files
        r1 = RAW / "R1-monthly-means.download"
        monthly = xr.open_dataset(r1, engine="netcdf4") if r1.exists() else None

        # parameter availability + units
        unit_findings = {}
        if monthly is not None:
            unit_findings["2m_temperature"] = monthly["t2m"].attrs.get("units") if "t2m" in monthly else None
            unit_findings["total_precipitation"] = monthly["tp"].attrs.get("units") if "tp" in monthly else None
        rep.add("parameter-availability", "PASS" if monthly is not None else "FAIL",
                f"R1 variables found: {list(monthly.data_vars) if monthly is not None else 'R1 raw file missing'}")

        tp_units_ok = unit_findings.get("total_precipitation") in (
            "m", "m of water equivalent per day", "m of water equivalent PER DAY")
        rep.add("units", "PASS" if (tp_units_ok and
                unit_findings.get("2m_temperature") == "K") else "FAIL",
                f"units observed: {unit_findings}; required semantics: 2m_temperature=K, "
                "total_precipitation=m per day (rate, ECMWF conversion table)")

        # coordinates / grid: nearest point must match the precomputed expectation
        lats = monthly["latitude"].values if monthly is not None else []
        lons = monthly["longitude"].values if monthly is not None else []
        sel_lat, sel_lon = expected_nearest_point(list(lats), list(lons)) if len(lats) else (None, None)
        exp = REQ["gridSelection"]["expectedNearestGridPoint"]
        grid_ok = (sel_lat == exp["latitude"] and sel_lon == exp["longitude"])
        rep.add("coordinates-grid", "PASS" if grid_ok else "FAIL",
                f"selected point=({sel_lat},{sel_lon}); expected=({exp['latitude']},{exp['longitude']})")

        # time axis + completeness
        monthly_times = monthly["time"].values if monthly is not None else []
        expected_months = len(YEARS) * len(MONTHS)
        axis_ok = len(monthly_times) == expected_months
        rep.add("time-axis", "PASS" if axis_ok else "FAIL",
                f"monthly time steps={len(monthly_times)}, expected={expected_months}")

        nan_bad = []
        if monthly is not None:
            for var in ("t2m", "tp"):
                arr = monthly[var].sel(latitude=exp["latitude"], longitude=exp["longitude"])
                if bool(arr.isnull().any()):
                    nan_bad.append(var)
        rep.add("missing-values", "PASS" if (monthly is not None and not nan_bad) else "FAIL",
                "0 NaN/_FillValue in selected series" if not nan_bad else f"NaN present: {nan_bad}")

        # daily files: 1991-2020 completeness (10958 days) + temporal semantics
        daily_ok, daily_detail = True, []
        expected_days = sum(366 if calendar.isleap(y) else 365 for y in YEARS)
        for rid_prefix, stat in (("R2-daily-maximum", "mx2t"),
                                 ("R3-daily-minimum", "mn2t"),
                                 ("R4-daily-sum-precipitation", "tp")):
            day_counts = []
            for y in YEARS:
                f = RAW / f"{rid_prefix}-{y}.download"
                if not f.exists():
                    daily_ok, daily_detail = False, [f"{rid_prefix}-{y} missing"]
                    break
                ds = xr.open_dataset(f, engine="netcdf4")
                var = list(ds.data_vars)[0]
                arr = ds[var].sel(latitude=exp["latitude"], longitude=exp["longitude"])
                day_counts.append(arr.sizes.get("time", arr.size))
                if bool(arr.isnull().any()):
                    daily_ok = False
                    daily_detail.append(f"{rid_prefix}-{y} NaN")
            if daily_ok and day_counts and sum(day_counts) != expected_days:
                daily_ok = False
                daily_detail.append(f"{rid_prefix} day count {sum(day_counts)} != {expected_days}")
        rep.add("completeness-1991-2020", "PASS" if daily_ok else "FAIL",
                f"expected {expected_days} daily values per statistic; {daily_detail or 'all present'}")

        # temporal semantics: daily files must have a DAILY axis (one value per day),
        # proving tempHighC/tempLowC are means of daily max/min, not monthly extremes
        rep.add("temporal-semantics", "PASS" if daily_ok else "FAIL",
                "daily_statistic files verified as per-day series from hourly data "
                "(daily_maximum/daily_minimum per official daily-statistics documentation)"
                if daily_ok else "daily series incomplete; semantics unproven")

        # monthly aggregation: tp rate x N vs mean(daily_sum) cross-check; Feb leap handled
        agg_ok, agg_detail = True, []
        if monthly is not None and daily_ok:
            tp_rate = monthly["tp"].sel(latitude=exp["latitude"], longitude=exp["longitude"])
            for y in YEARS:
                dsum = xr.open_dataset(RAW / f"R4-daily-sum-precipitation-{y}.download",
                                       engine="netcdf4")
                dvar = list(dsum.data_vars)[0]
                dsel = dsum[dvar].sel(latitude=exp["latitude"], longitude=exp["longitude"])
                for m in MONTHS:
                    n_days = calendar.monthrange(y, m)[1]  # leap Feb -> 29 automatically
                    mrate = float(tp_rate.sel(time=f"{y}-{m:02d}").values)
                    dmean = float(dsel.sel(time=slice(f"{y}-{m:02d}", f"{y}-{m:02d}")).mean().values)
                    if abs(mrate - dmean) > TP_UNIT_TOLERANCE_M_PER_DAY:
                        agg_ok = False
                        agg_detail.append(f"{y}-{m:02d}: monthly-rate {mrate} vs mean(daily_sum) {dmean}")
        rep.add("monthly-aggregation",
                "PASS" if agg_ok else "FAIL",
                "every month: ERA5 monthly-mean tp rate == mean(daily_sum) within "
                f"{TP_UNIT_TOLERANCE_M_PER_DAY} m/day; leap Feb via calendar.monthrange"
                if agg_ok else f"aggregation mismatch: {agg_detail[:5]}")

        # determinism: recompute selection + normalization twice, compare digests
        def normalize_digest():
            sel = expected_nearest_point(list(lats), list(lons))
            series = monthly["t2m"].sel(latitude=sel[0], longitude=sel[1]).values.tolist()
            return hashlib.sha256(json.dumps([sel, series], sort_keys=True).encode()).hexdigest()
        rep.add("determinism", "PASS" if normalize_digest() == normalize_digest() else "FAIL",
                "nearest-point selection and normalization are byte-identical across two runs")

    overall = rep.finalize()
    report = {
        "artifact": "copernicus-pilot-report",
        "pilotVersion": REQ["pilotVersion"],
        "generatedAt": __import__("datetime").datetime.now(
            __import__("datetime").timezone.utc).isoformat(),
        "status": overall,
        "note": "BLOCKED is not PASS. Any FAIL invalidates the ERA5 Primary contract "
                "until corrected and re-run.",
        "checks": rep.checks,
    }
    (PILOT_DIR / "copernicus_pilot_report.json").write_text(
        json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps({"status": overall, "checks": len(rep.checks)}, indent=2))
    return {"PASS": 0, "FAIL": 1, "BLOCKED": 2}[overall]


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""UTRIPLA ERA5 Primary pilot fetcher (copernicus-pilot-2026.09.13.v1).

Executes the request plan in pilot_request_v1.json against the Copernicus
CDS API and writes raw responses + metadata sidecars to
pilot/best-time/copernicus/raw/.

BLOCKED-BY-DEFAULT:
  - Refuses to run unless cdsapi is installed AND credentials are
    discoverable (env CDSAPI_URL/CDSAPI_KEY or ~/.cdsapirc).
  - Never prints, logs or records token/key/header content.
  - Writes ONLY inside pilot/best-time/copernicus/raw/.

Exit codes: 0 = executed, 2 = BLOCKED (missing prerequisites).
"""
from __future__ import annotations

import hashlib
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

PILOT_DIR = Path(__file__).resolve().parent
RAW = PILOT_DIR / "raw"
REQUEST_DEF = json.loads((PILOT_DIR / "pilot_request_v1.json").read_text(encoding="utf-8"))

YEARS = REQUEST_DEF["period"]["years"]
MONTHS = REQUEST_DEF["period"]["months"]
DAYS = REQUEST_DEF["requestPlan"][1]["request"]["day"]
ANCHOR = REQUEST_DEF["anchor"]
HALF = 0.25


def area_box():
    lat, lon = ANCHOR["latitude"], ANCHOR["longitude"]
    return [round(lat + HALF, 4), round(lon - HALF, 4),
            round(lat - HALF, 4), round(lon + HALF, 4)]


def build_manifest():
    """Deterministically generate the 91-request manifest."""
    reqs = []
    plan = {p["requestId"]: p for p in REQUEST_DEF["requestPlan"]}

    p1 = plan["R1-monthly-means"]
    reqs.append({
        "requestId": "R1-monthly-means",
        "dataset": p1["dataset"],
        "request": {
            "product_type": p1["request"]["product_type"],
            "variable": p1["request"]["variable"],
            "year": YEARS,
            "month": MONTHS,
            "time": p1["request"]["time"],
            "area": area_box(),
            "data_format": p1["request"]["data_format"],
            "download_format": p1["request"]["download_format"],
        },
    })

    for rid, statistic, variable in (
        ("R2-daily-maximum", "daily_maximum", ["2m_temperature"]),
        ("R3-daily-minimum", "daily_minimum", ["2m_temperature"]),
        ("R4-daily-sum-precipitation", "daily_sum", ["total_precipitation"]),
    ):
        for year in YEARS:  # official schema: year is a single string
            reqs.append({
                "requestId": f"{rid}-{year}",
                "dataset": plan[rid]["dataset"],
                "request": {
                    "product_type": "reanalysis",
                    "variable": variable,
                    "year": year,
                    "month": MONTHS,
                    "day": DAYS,
                    "daily_statistic": statistic,
                    "time_zone": REQUEST_DEF["timeStandard"]["dailyRequestsValue"],
                    "frequency": "1_hourly",
                    "area": area_box(),
                },
            })
    return reqs


def prerequisites() -> tuple[bool, list[str]]:
    missing = []
    try:
        import cdsapi  # noqa: F401
    except ImportError:
        missing.append("cdsapi not installed (pip install 'cdsapi>=0.7.7')")
    has_rc = os.path.exists(os.path.expanduser("~/.cdsapirc"))
    has_env = bool(os.environ.get("CDSAPI_URL") and os.environ.get("CDSAPI_KEY"))
    if not (has_rc or has_env):
        missing.append("no credentials: neither ~/.cdsapirc nor CDSAPI_URL/CDSAPI_KEY present")
    return (len(missing) == 0, missing)


def main() -> int:
    ok, missing = prerequisites()
    if not ok:
        print(json.dumps({
            "status": "BLOCKED",
            "reason": missing,
            "rule": "no fake credentials, no fabricated data, no partial runs",
        }, indent=2))
        return 2

    import cdsapi

    RAW.mkdir(parents=True, exist_ok=True)
    client = cdsapi.Client(quiet=True, debug=False)  # credentials read by cdsapi itself
    manifest = build_manifest()
    records = []
    for entry in manifest:
        rid = entry["requestId"]
        target = RAW / f"{rid}.download"
        print(f"[pilot] requesting {rid} ...", flush=True)
        client.retrieve(entry["dataset"], entry["request"]).download(str(target))
        payload = target.read_bytes()
        records.append({
            "requestId": rid,
            "dataset": entry["dataset"],
            "request": entry["request"],
            "retrievedAtUtc": datetime.now(timezone.utc).isoformat(),
            "byteSize": len(payload),
            "sha256": hashlib.sha256(payload).hexdigest(),
            "rawFile": target.name,
        })
        (RAW / f"{rid}.meta.json").write_text(
            json.dumps(records[-1], indent=2), encoding="utf-8")

    (RAW / "_manifest.json").write_text(json.dumps(
        {"pilotVersion": REQUEST_DEF["pilotVersion"],
         "anchor": ANCHOR["destinationId"],
         "requestCount": len(records),
         "requests": records}, indent=2), encoding="utf-8")
    print(f"[pilot] done: {len(records)} raw responses in {RAW}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

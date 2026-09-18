#!/usr/bin/env python3
"""Pilot Phase 1C — NASA POWER Daily PRECTOTCORR retrieval for precipDaysGe1mm.

Methodology v8.6 authorises precipDaysGe1mm as a deterministic derived field:
    count(daily precipitation >= 1.0 mm) per calendar month per year,
    then mean over 1991-2020.
The daily input is the SAME source family's official daily product
(NASA POWER Daily API, parameter PRECTOTCORR, mm/day), retrieved with
time-standard=UTC — identical contract to the canonical tempHighC/tempLowC
daily path (dailyAggregationBoundary = UTC+00:00).

Writes raw per-destination JSON into raw/nasa/daily_precip_145/ + manifest.
No value is invented; derived statistics are computed only from these raw
responses by build_v86.py.
"""
import argparse
import datetime
import json
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
RAW = ROOT / "pilot/best-time/raw/nasa"
CFG = ROOT / "pilot/best-time/config/destinations.json"

ENDPOINT = "https://power.larc.nasa.gov/api/temporal/daily/point"
PARAMS = ["PRECTOTCORR"]
METHODOLOGY_VERSION = "utrip-methodology-2026.09.v8.6"
PILOT_VERSION = "pilot-2026.09.11.v1"


def build_url(lat, lon, start, end, community="AG", time_standard="UTC"):
    q = [
        f"parameters={','.join(PARAMS)}",
        f"community={community}",
        f"longitude={lon}",
        f"latitude={lat}",
        f"start={start}",
        f"end={end}",
        "format=JSON",
        f"time-standard={time_standard}",
    ]
    return f"{ENDPOINT}?{'&'.join(q)}"


def fetch(url, tries=4, timeout=120):
    last = None
    for i in range(tries):
        try:
            with urllib.request.urlopen(url, timeout=timeout) as r:
                return r.status, json.loads(r.read().decode("utf-8"))
        except Exception as e:  # noqa: BLE001
            last = e
            time.sleep(3 + 3 * i)
    return None, {"error": str(last)}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--ids", default="")
    ap.add_argument("--start", default="19910101")
    ap.add_argument("--end", default="20201231")
    ap.add_argument("--sleep", type=float, default=0.4)
    args = ap.parse_args()

    cfg = json.loads(CFG.read_text(encoding="utf-8"))
    dests = cfg["destinations"]
    if args.ids:
        want = set(args.ids.split(","))
        dests = [d for d in dests if d["id"] in want]
    if args.limit:
        dests = dests[: args.limit]

    out_dir = RAW / "daily_precip_145"
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest = {
        "pilotVersion": PILOT_VERSION,
        "methodologyVersion": METHODOLOGY_VERSION,
        "provider": "NASA POWER (NASA Langley Research Center)",
        "sourceFamily": "NASA POWER / MERRA-2",
        "officialProduct": "Daily API (point)",
        "endpoint": ENDPOINT,
        "parameters": PARAMS,
        "community": "AG",
        "start": args.start,
        "end": args.end,
        "timeStandardRequested": "UTC",
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "records": [],
    }

    ok = fail = 0
    for i, d in enumerate(dests, 1):
        out_path = out_dir / f"{d['id']}.json"
        if out_path.exists():
            existing = json.loads(out_path.read_text(encoding="utf-8"))
            if existing.get("properties", {}).get("parameter", {}).get("PRECTOTCORR"):
                manifest["records"].append({
                    "destinationId": d["id"], "httpStatus": 200, "cached": True,
                })
                ok += 1
                continue
        url = build_url(d["latitude"], d["longitude"], args.start, args.end)
        status, payload = fetch(url)
        rec = {
            "destinationId": d["id"],
            "anchorLatitude": d["latitude"],
            "anchorLongitude": d["longitude"],
            "requestUrl": url,
            "httpStatus": status,
            "fetchedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "responseTimeStandard": (payload.get("header", {}) or {}).get("time_standard") if isinstance(payload, dict) else None,
            "gridCoordinates": payload.get("geometry", {}).get("coordinates") if isinstance(payload, dict) else None,
            "error": payload.get("error") if isinstance(payload, dict) else None,
            "parametersReturned": sorted((payload.get("properties", {}).get("parameter", {}) or {}).keys()) if isinstance(payload, dict) else [],
        }
        if status == 200 and rec["parametersReturned"]:
            ok += 1
        else:
            fail += 1
        out_path.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
        manifest["records"].append(rec)
        print(f"[{i}/{len(dests)}] {d['id']:28s} http={status} params={len(rec['parametersReturned'])} ts={rec['responseTimeStandard']}", flush=True)
        time.sleep(args.sleep)

    manifest["summary"] = {"requested": len(dests), "http200": ok, "failed": fail}
    (out_dir / "_manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(manifest["summary"]))
    return 0 if fail == 0 else 1


if __name__ == "__main__":
    sys.exit(main())

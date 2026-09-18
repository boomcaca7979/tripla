#!/usr/bin/env python3
"""Pilot Phase 1 — NASA POWER Climatology retrieval (read-only external calls).

Writes raw per-destination JSON into pilot/best-time/raw/nasa/<id>.json plus a
manifest with exact endpoint/parameters/timestamp for reproducibility.
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

ENDPOINT = "https://power.larc.nasa.gov/api/temporal/climatology/point"
PARAMS = ["T2M", "T2M_MAX_AVG", "T2M_MIN_AVG", "PRECTOTCORR_SUM", "PRECTOTCORR"]
METHODOLOGY_VERSION = "utrip-methodology-2026.09.v8.4"
PILOT_VERSION = "pilot-2026.09.11.v1"


def build_url(lat, lon, start, end, community="AG", time_standard=None):
    q = [
        f"parameters={','.join(PARAMS)}",
        f"community={community}",
        f"longitude={lon}",
        f"latitude={lat}",
        f"start={start}",
        f"end={end}",
        "format=JSON",
    ]
    if time_standard:
        q.append(f"time-standard={time_standard}")
    return f"{ENDPOINT}?{'&'.join(q)}"


def fetch(url, tries=3, timeout=90):
    last = None
    for i in range(tries):
        try:
            with urllib.request.urlopen(url, timeout=timeout) as r:
                return r.status, json.loads(r.read().decode("utf-8"))
        except Exception as e:  # noqa: BLE001
            last = e
            time.sleep(2 + 2 * i)
    return None, {"error": str(last)}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--ids", default="")
    ap.add_argument("--time-standard", default="UTC", choices=["UTC", "LST", "none"])
    ap.add_argument("--tag", default="utc")
    ap.add_argument("--start", default="1991")
    ap.add_argument("--end", default="2020")
    ap.add_argument("--sleep", type=float, default=0.4)
    args = ap.parse_args()

    cfg = json.loads(CFG.read_text(encoding="utf-8"))
    dests = cfg["destinations"]
    if args.ids:
        want = set(args.ids.split(","))
        dests = [d for d in dests if d["id"] in want]
    if args.limit:
        dests = dests[: args.limit]

    ts = None if args.time_standard == "none" else args.time_standard
    out_dir = RAW / args.tag
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest = {
        "pilotVersion": PILOT_VERSION,
        "methodologyVersion": METHODOLOGY_VERSION,
        "provider": "NASA POWER (NASA Langley Research Center)",
        "sourceFamily": "NASA POWER / MERRA-2",
        "officialProduct": "Climatology API (point)",
        "endpoint": ENDPOINT,
        "parameters": PARAMS,
        "community": "AG",
        "start": args.start,
        "end": args.end,
        "timeStandardRequested": ts,
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "records": [],
    }

    ok = fail = 0
    for i, d in enumerate(dests, 1):
        url = build_url(d["latitude"], d["longitude"], args.start, args.end, time_standard=ts)
        status, payload = fetch(url)
        rec = {
            "destinationId": d["id"],
            "anchorLatitude": d["latitude"],
            "anchorLongitude": d["longitude"],
            "requestUrl": url,
            "httpStatus": status,
            "fetchedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "responseTimeStandard": (payload.get("header", {}) or {}).get("time_standard") if isinstance(payload, dict) else None,
            "responseTitle": (payload.get("header", {}) or {}).get("title") if isinstance(payload, dict) else None,
            "apiVersion": ((payload.get("header", {}) or {}).get("api", {}) or {}).get("version") if isinstance(payload, dict) else None,
            "sources": (payload.get("header", {}) or {}).get("sources") if isinstance(payload, dict) else None,
            "gridCoordinates": payload.get("geometry", {}).get("coordinates") if isinstance(payload, dict) else None,
            "error": payload.get("error") if isinstance(payload, dict) else None,
            "parametersReturned": sorted((payload.get("properties", {}).get("parameter", {}) or {}).keys()) if isinstance(payload, dict) else [],
        }
        if status == 200 and rec["parametersReturned"]:
            ok += 1
        else:
            fail += 1
        (out_dir / f"{d['id']}.json").write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
        manifest["records"].append(rec)
        print(f"[{i}/{len(dests)}] {d['id']:28s} http={status} params={len(rec['parametersReturned'])} ts={rec['responseTimeStandard']}", flush=True)
        time.sleep(args.sleep)

    manifest["summary"] = {"requested": len(dests), "http200": ok, "failed": fail}
    (out_dir / "_manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(manifest["summary"]))
    return 0 if fail == 0 else 1


if __name__ == "__main__":
    sys.exit(main())

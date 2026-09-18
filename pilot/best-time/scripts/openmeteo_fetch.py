#!/usr/bin/env python3
"""Pilot Phase 1 — Open-Meteo Archive (ERA5-family) CROSS-CHECK retrieval.

NOT a production source. Used only to exercise the methodology on real
ERA5-derived daily data (UTC day aggregation, monthly means, R1-R7, best
months) while the Copernicus CDS primary path lacks credentials in this pilot.
"""
import argparse
import datetime
import json
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
RAW = ROOT / "pilot/best-time/raw/openmeteo"
CFG = ROOT / "pilot/best-time/config/destinations.json"
ENDPOINT = "https://archive-api.open-meteo.com/v1/archive"
DAILY = ["temperature_2m_max", "temperature_2m_min", "temperature_2m_mean", "precipitation_sum"]
METHODOLOGY_VERSION = "utrip-methodology-2026.09.v8.4"
PILOT_VERSION = "pilot-2026.09.11.v1"


def build_url(lat, lon, start, end):
    q = [
        f"latitude={lat}",
        f"longitude={lon}",
        f"start_date={start}",
        f"end_date={end}",
        f"daily={','.join(DAILY)}",
        "timezone=UTC",
    ]
    return f"{ENDPOINT}?{'&'.join(q)}"


def fetch_one(d, start, end, out_dir, retries=6):
    url = build_url(d["latitude"], d["longitude"], start, end)
    rec = {
        "destinationId": d["id"],
        "anchorLatitude": d["latitude"],
        "anchorLongitude": d["longitude"],
        "requestUrl": url,
        "fetchedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }
    last_err = None
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(url, timeout=180) as r:
                status = r.status
                payload = json.loads(r.read().decode("utf-8"))
            break
        except Exception as e:  # noqa: BLE001
            last_err = e
            status = None
            payload = None
            wait = 2.0 * (attempt + 1)
            # Open-Meteo free tier returns HTTP 429 with "try again in one minute"
            if "429" in str(last_err):
                wait = 65.0 * (attempt + 1)
            if attempt < retries - 1:
                time.sleep(wait)
    else:
        body = ""
        try:
            body = last_err.read().decode()[:300]  # type: ignore[attr-defined]
        except Exception:  # noqa: BLE001
            pass
        rec.update(httpStatus=None, error=f"{type(last_err).__name__}: {last_err} | body={body}")
        return rec
    rec["httpStatus"] = status
    if "daily" in payload:
        rec.update(
            gridLatitude=payload.get("latitude"),
            gridLongitude=payload.get("longitude"),
            gridElevationM=payload.get("elevation"),
            utcOffsetSeconds=payload.get("utc_offset_seconds"),
            timezone=payload.get("timezone"),
            dailyUnits=payload.get("daily_units"),
            dayCount=len(payload["daily"]["time"]),
            firstDay=payload["daily"]["time"][0],
            lastDay=payload["daily"]["time"][-1],
        )
    else:
        rec["error"] = str(payload)[:300]
    (out_dir / f"{d['id']}.json").write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    return rec


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--ids", default="")
    ap.add_argument("--start", default="1991-01-01")
    ap.add_argument("--end", default="2020-12-31")
    ap.add_argument("--workers", type=int, default=1)
    ap.add_argument("--only-missing", action="store_true")
    args = ap.parse_args()

    cfg = json.loads(CFG.read_text(encoding="utf-8"))
    dests = cfg["destinations"]
    if args.ids:
        want = set(args.ids.split(","))
        dests = [d for d in dests if d["id"] in want]
    if args.limit:
        dests = dests[: args.limit]

    out_dir = RAW / "era5_utc"
    out_dir.mkdir(parents=True, exist_ok=True)
    if args.only_missing:
        dests = [d for d in dests if not (out_dir / f"{d['id']}.json").exists()]

    with ThreadPoolExecutor(max_workers=args.workers) as ex:
        futs = [ex.submit(fetch_one, d, args.start, args.end, out_dir) for d in dests]
        records = []
        for i, f in enumerate(futs, 1):
            r = f.result()
            records.append(r)
            print(f"[{i}/{len(dests)}] {r['destinationId']:28s} http={r.get('httpStatus')} days={r.get('dayCount')} elev={r.get('gridElevationM')}", flush=True)

    manifest = {
        "pilotVersion": PILOT_VERSION,
        "methodologyVersion": METHODOLOGY_VERSION,
        "provider": "Open-Meteo",
        "sourceFamily": "Open-Meteo Historical / Archive (ERA5-family derived)",
        "officialProduct": "Archive API (daily)",
        "endpoint": ENDPOINT,
        "parameters": DAILY,
        "timezone": "UTC",
        "start": args.start,
        "end": args.end,
        "purpose": "ERA5-family CROSS-CHECK ONLY — not a production source",
        "licensingStatus": "Open-Meteo data CC BY 4.0; commercial use requires subscription — UNVERIFIED for production",
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "records": records,
        "summary": {
            "requested": len(dests),
            "ok": sum(1 for r in records if r.get("httpStatus") == 200 and r.get("dayCount")),
            "failed": sum(1 for r in records if not (r.get("httpStatus") == 200 and r.get("dayCount"))),
        },
    }
    (out_dir / "_manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(manifest["summary"]))
    return 0 if manifest["summary"]["failed"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())

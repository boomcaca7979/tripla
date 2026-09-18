#!/usr/bin/env python3
"""Pilot v8.5 - NASA POWER MONTHLY endpoint retrieval for 145 points.

Purpose (pilot brief §17): prove that Climatology `T2M` really is the
1991-2020 average of the calendar-month mean 2m temperature, by comparing it
against an INDEPENDENT NASA temporal endpoint (monthly/point) whose values are
monthly means, averaged over 1991-2020.

Also returns monthly PRECTOTCORR_SUM so the climatology monthly-total
precipitation can be cross-checked against per-year monthly totals.

This is a READ-ONLY external retrieval. Nothing is written outside
pilot/best-time/raw/nasa/monthly_145/.
"""
import argparse
import datetime
import json
import sys
import threading
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
RAW = ROOT / "pilot/best-time/raw/nasa/monthly_145"
CFG = ROOT / "pilot/best-time/config/destinations.json"

ENDPOINT = "https://power.larc.nasa.gov/api/temporal/monthly/point"
PARAMS = ["T2M", "PRECTOTCORR_SUM"]
METHODOLOGY_VERSION = "utrip-methodology-2026.09.v8.5"
PILOT_VERSION = "pilot-2026.09.11.v1"


def build_url(lat, lon, start="1991", end="2020", community="AG", time_standard="UTC"):
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


def fetch(url, tries=4, timeout=180):
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
    ap.add_argument("--workers", type=int, default=6)
    ap.add_argument("--start", default="1991")
    ap.add_argument("--end", default="2020")
    args = ap.parse_args()

    cfg = json.loads(CFG.read_text(encoding="utf-8"))
    dests = cfg["destinations"]
    if args.limit:
        dests = dests[: args.limit]

    RAW.mkdir(parents=True, exist_ok=True)
    manifest = {
        "pilotVersion": PILOT_VERSION,
        "methodologyVersion": METHODOLOGY_VERSION,
        "provider": "NASA POWER (NASA Langley Research Center)",
        "sourceFamily": "NASA POWER / MERRA-2",
        "officialProduct": "Monthly and Annual API (point)",
        "endpoint": ENDPOINT,
        "parameters": PARAMS,
        "community": "AG",
        "start": args.start,
        "end": args.end,
        "timeStandardRequested": "UTC",
        "purpose": "independent NASA temporal endpoint used to verify Climatology T2M / PRECTOTCORR_SUM semantics (pilot brief S17/S18)",
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "records": [],
    }

    lock = threading.Lock()
    idx = {"i": 0}
    total = len(dests)

    def worker(d):
        url = build_url(d["latitude"], d["longitude"], args.start, args.end)
        t0 = time.time()
        status, payload = fetch(url)
        fetched = datetime.datetime.now(datetime.timezone.utc).isoformat()
        entry = {
            "destinationId": d["id"],
            "anchorLatitude": d["latitude"],
            "anchorLongitude": d["longitude"],
            "requestUrl": url,
            "httpStatus": status,
            "fetchedAt": fetched,
            "elapsedSeconds": round(time.time() - t0, 2),
            "error": None,
            "parametersReturned": [],
            "responseTimeStandard": None,
            "responseTitle": None,
            "apiVersion": None,
            "sources": None,
            "gridCoordinates": None,
            "monthCount": None,
        }
        if status == 200 and isinstance(payload, dict):
            hdr = payload.get("header", {})
            entry["responseTimeStandard"] = hdr.get("time_standard")
            entry["responseTitle"] = hdr.get("title")
            entry["apiVersion"] = (hdr.get("api") or {}).get("version")
            entry["sources"] = hdr.get("sources")
            entry["parametersReturned"] = sorted(
                (payload.get("properties", {}).get("parameter", {}) or {}).keys()
            )
            entry["gridCoordinates"] = (payload.get("geometry", {}).get("coordinates"))
            entry["monthCount"] = len(
                (payload.get("properties", {}).get("parameter", {}) or {}).get("T2M", {})
            )
            (RAW / f"{d['id']}.json").write_text(
                json.dumps(payload, ensure_ascii=False), encoding="utf-8"
            )
        else:
            entry["error"] = str(payload)[:400] if not isinstance(payload, dict) else payload.get("error")
        with lock:
            manifest["records"].append(entry)
            idx["i"] += 1
            print(f"[{idx['i']}/{total}] {d['id']} http={status} months={entry['monthCount']}", flush=True)

    threads = []
    pending = list(dests)
    sem = threading.Semaphore(args.workers)

    def run(d):
        with sem:
            worker(d)

    for d in pending:
        t = threading.Thread(target=run, args=(d,))
        t.start()
        threads.append(t)
    for t in threads:
        t.join()

    manifest["records"].sort(key=lambda r: r["destinationId"])
    ok = sum(1 for r in manifest["records"] if r["httpStatus"] == 200)
    manifest["summary"] = {
        "requested": total,
        "httpOk": ok,
        "httpFailed": total - ok,
        "allResponseTimeStandardUTC": all(
            r["responseTimeStandard"] == "UTC" for r in manifest["records"] if r["httpStatus"] == 200
        ),
    }
    (RAW / "_manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps(manifest["summary"], ensure_ascii=False))
    return 0 if ok == total else 1


if __name__ == "__main__":
    sys.exit(main())

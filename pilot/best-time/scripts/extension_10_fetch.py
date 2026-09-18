#!/usr/bin/env python3
"""Extension anchors — NASA POWER acquisition (same endpoints/params as pilot).

Read-only external fetch for 10 new destinations. Raw JSONs land in
pilot/best-time/raw/nasa/extension_10/ for the canonical-record builder.
Climatology: T2M + PRECTOTCORR_SUM (+ grid elevation from geometry).
Daily 1991-2020: T2M_MAX, T2M_MIN, PRECTOTCORR (canonical tempHigh/Low +
rain-day semantics per v8.5/v8.6 methodology).
"""
import datetime
import json
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "pilot/best-time/raw/nasa/extension_10"
OUT.mkdir(parents=True, exist_ok=True)

ANCHORS = {
    "cape-town":      {"lat": -33.9715, "lon": 18.6021},
    "cairo":          {"lat": 30.1219,  "lon": 31.4056},
    "nairobi":        {"lat": -1.3192,  "lon": 36.9278},
    "doha":           {"lat": 25.2731,  "lon": 51.6081},
    "rio-de-janeiro": {"lat": -22.8100, "lon": -43.2506},
    "cusco":          {"lat": -13.5357, "lon": -71.9388},
    "bogota":         {"lat": 4.7016,   "lon": -74.1469},
    "santiago":       {"lat": -33.3930, "lon": -70.7858},
    "havana":         {"lat": 22.9892,  "lon": -82.4091},
    "nadi":           {"lat": -17.7554, "lon": 177.4434},
}


def fetch(url, tries=3, timeout=120):
    last = None
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "utrip-data-pipeline/1.0"})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.status, json.loads(r.read().decode("utf-8"))
        except Exception as e:  # noqa: BLE001
            last = e
            time.sleep(3 + 3 * i)
    return None, {"error": str(last)}


def main():
    manifest = {}
    for dest_id, a in ANCHORS.items():
        lat, lon = a["lat"], a["lon"]
        entry = {}

        clim_url = (
            "https://power.larc.nasa.gov/api/temporal/climatology/point?"
            f"parameters=T2M,PRECTOTCORR_SUM&community=AG&longitude={lon}"
            f"&latitude={lat}&start=1991&end=2020&format=JSON"
        )
        s, clim = fetch(clim_url)
        entry["climatology"] = {"status": s, "url": clim_url, "body": clim if s == 200 else None}
        time.sleep(2)

        daily_url = (
            "https://power.larc.nasa.gov/api/temporal/daily/point?"
            "parameters=T2M_MAX,T2M_MIN,PRECTOTCORR&community=AG"
            f"&longitude={lon}&latitude={lat}&start=19910101&end=20201231"
            "&time-standard=UTC&format=JSON"
        )
        s, daily = fetch(daily_url)
        entry["daily"] = {"status": s, "url": daily_url, "body": daily if s == 200 else None}
        time.sleep(2)

        (OUT / f"{dest_id}.json").write_text(
            json.dumps(entry, ensure_ascii=False), encoding="utf-8")
        manifest[dest_id] = {
            "climatology": s if False else entry["climatology"]["status"],
            "daily": entry["daily"]["status"],
            "dailyBytes": len(json.dumps(entry["daily"]["body"])) if entry["daily"]["body"] else 0,
        }
        print(dest_id, manifest[dest_id], flush=True)

    (OUT / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")
    print("DONE", json.dumps(manifest, indent=0)[:200])


if __name__ == "__main__":
    main()

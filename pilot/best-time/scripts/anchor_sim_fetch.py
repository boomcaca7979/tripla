#!/usr/bin/env python3
"""Production Data Decision Gate — fetch full NASA data at PROPOSED anchors.

Read-only external retrieval for anchor-correction impact simulation (pilot
only). Two destinations, two endpoints each:
  Climatology: T2M, PRECTOTCORR, PRECTOTCORR_SUM (1991-2020, time-standard=UTC)
  Daily      : T2M_MAX, T2M_MIN, PRECTOTCORR      (19910101-20201231, UTC)

Output: raw/nasa/anchor_sim/<tag>/{climatology,daily}.json + _manifest.json
Nothing outside pilot/best-time/raw is written.
"""
import datetime
import json
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
RAW = ROOT / "pilot/best-time/raw/nasa/anchor_sim"

TARGETS = [
    {"tag": "hcmc-proposed", "destinationId": "ho-chi-minh-city", "lat": 10.8188, "lon": 106.652},
    {"tag": "siemreap-proposed", "destinationId": "siem-reap", "lat": 13.36974, "lon": 104.223831},
]
METHODOLOGY_VERSION = "utrip-methodology-2026.09.v8.6"


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
    RAW.mkdir(parents=True, exist_ok=True)
    manifest = {"generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "methodologyVersion": METHODOLOGY_VERSION,
                "purpose": "anchor-correction impact simulation (PROPOSED anchors only; production untouched)",
                "records": []}
    ok = fail = 0
    for t in TARGETS:
        d = RAW / t["tag"]
        d.mkdir(parents=True, exist_ok=True)
        jobs = [
            ("climatology",
             f"https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=T2M,PRECTOTCORR,PRECTOTCORR_SUM&community=AG&longitude={t['lon']}&latitude={t['lat']}&start=1991&end=2020&format=JSON&time-standard=UTC"),
            ("daily",
             f"https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M_MAX,T2M_MIN,PRECTOTCORR&community=AG&longitude={t['lon']}&latitude={t['lat']}&start=19910101&end=20201231&format=JSON&time-standard=UTC"),
        ]
        for name, url in jobs:
            status, payload = fetch(url)
            (d / f"{name}.json").write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
            rec = {"tag": t["tag"], "destinationId": t["destinationId"], "kind": name,
                   "lat": t["lat"], "lon": t["lon"], "httpStatus": status,
                   "timeStandard": (payload.get("header", {}) or {}).get("time_standard") if isinstance(payload, dict) else None,
                   "grid": payload.get("geometry", {}).get("coordinates") if isinstance(payload, dict) else None,
                   "params": sorted((payload.get("properties", {}).get("parameter", {}) or {}).keys()) if isinstance(payload, dict) else []}
            manifest["records"].append(rec)
            ok += status == 200
            fail += status != 200
            print(f"{t['tag']:18s} {name:12s} http={status} grid={rec['grid']} ts={rec['timeStandard']}", flush=True)
            time.sleep(0.5)
    manifest["summary"] = {"ok": ok, "failed": fail}
    (RAW / "_manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    return 0 if fail == 0 else 1


if __name__ == "__main__":
    sys.exit(main())

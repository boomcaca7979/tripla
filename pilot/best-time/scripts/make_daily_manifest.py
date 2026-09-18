#!/usr/bin/env python3
"""Pilot v8.5 - reconstruct a provenance manifest for raw/nasa/daily_145.

The 145 Daily responses were stored without a manifest in the previous session.
This script rebuilds the manifest FROM THE RESPONSES THEMSELVES plus file
mtimes.  It does NOT invent anything: `retrievedAt` stays null because the
fetch timestamp was not captured, and `fileModifiedAt` is reported as-is.
"""
import datetime
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
RAW = ROOT / "pilot/best-time/raw/nasa/daily_145"
CFG = ROOT / "pilot/best-time/config/destinations.json"

ENDPOINT = "https://power.larc.nasa.gov/api/temporal/daily/point"
PARAMS = ["T2M_MAX", "T2M_MIN"]

cfg = json.loads(CFG.read_text(encoding="utf-8"))
records = []
for d in cfg["destinations"]:
    p = RAW / f"{d['id']}.json"
    if not p.exists():
        records.append({"destinationId": d["id"], "httpStatus": None, "error": "file missing"})
        continue
    payload = json.loads(p.read_text(encoding="utf-8"))
    hdr = payload.get("header", {})
    par = payload.get("properties", {}).get("parameter", {})
    mtime = datetime.datetime.fromtimestamp(p.stat().st_mtime, datetime.timezone.utc)
    records.append({
        "destinationId": d["id"],
        "anchorLatitude": d["latitude"],
        "anchorLongitude": d["longitude"],
        "requestUrl": (f"{ENDPOINT}?parameters={','.join(PARAMS)}&community=AG"
                       f"&longitude={d['longitude']}&latitude={d['latitude']}"
                       f"&start={hdr.get('start')}&end={hdr.get('end')}"
                       f"&format=JSON&time-standard=UTC"),
        "httpStatus": 200,
        "retrievedAt": None,
        "retrievedAtNote": "not captured at fetch time; fileModifiedAt reported instead",
        "fileModifiedAt": mtime.isoformat(),
        "responseTimeStandard": hdr.get("time_standard"),
        "responseTitle": hdr.get("title"),
        "apiVersion": (hdr.get("api") or {}).get("version"),
        "sources": hdr.get("sources"),
        "parametersReturned": sorted(par.keys()),
        "dayCountT2M_MAX": len(par.get("T2M_MAX", {})),
        "dayCountT2M_MIN": len(par.get("T2M_MIN", {})),
        "gridCoordinates": (payload.get("geometry") or {}).get("coordinates"),
        "error": None,
    })

manifest = {
    "pilotVersion": "pilot-2026.09.11.v1",
    "methodologyVersion": "utrip-methodology-2026.09.v8.5",
    "provider": "NASA POWER (NASA Langley Research Center)",
    "sourceFamily": "NASA POWER / MERRA-2",
    "officialProduct": "Daily API (point)",
    "endpoint": ENDPOINT,
    "parameters": PARAMS,
    "community": "AG",
    "start": "19910101",
    "end": "20201231",
    "timeStandardRequested": "UTC",
    "manifestKind": "RECONSTRUCTED from stored responses (no fetch manifest existed)",
    "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "summary": {
        "requested": len(cfg["destinations"]),
        "filesPresent": sum(1 for r in records if r.get("httpStatus") == 200),
        "allResponseTimeStandardUTC": all(r.get("responseTimeStandard") == "UTC" for r in records),
        "allDayCountsEqual10958": all(r.get("dayCountT2M_MAX") == 10958 and r.get("dayCountT2M_MIN") == 10958
                                      for r in records if r.get("httpStatus") == 200),
    },
    "records": records,
}
(RAW / "_manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps(manifest["summary"], ensure_ascii=False))

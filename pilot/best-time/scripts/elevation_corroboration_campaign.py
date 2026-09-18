#!/usr/bin/env python3
"""Phase 2 — Elevation corroboration campaign (v8.7).

Corroborates the Tier-3 single-source candidate elevations with one independent
source (OpenStreetMap aerodrome `ele` via the public Overpass API — Tier 4,
usable ONLY as corroboration per the v8.7 contract). Existing stronger
corroborations (Phase 1C review items, FAA Tier-1) are preserved.

Per-record output: candidate, corroborating source, delta, identity check,
coordinate check, final status. No averaging; deltas drive the disposition
(v8.7 conflict rules: <=5m record; 5-20m flag; >20m reject).

Outputs
  raw/osm/aerodromes_YYYY-MM-DD.json        archived raw Overpass response
  reports/elevation-corroboration-v87.json  per-record campaign ledger
"""
import datetime
import json
import math
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CFG = ROOT / "pilot/best-time/config/destinations.json"
RAW = ROOT / "pilot/best-time/raw"
REPORTS = ROOT / "pilot/best-time/reports"

# user-approved anchor corrections (Decision A/B): identity keys change here
ICAO_OVERRIDES = {"siem-reap": "VDSA", "ho-chi-minh-city": "VVTS"}


def dist_km(lat1, lon1, lat2, lon2):
    p = math.pi / 180
    a = (math.sin((lat2 - lat1) * p / 2) ** 2
         + math.cos(lat1 * p) * math.cos(lat2 * p) * math.sin((lon2 - lon1) * p / 2) ** 2)
    return 6371 * 2 * math.asin(math.sqrt(a))


def overpass(icaos):
    """Fetch aerodrome tags for a list of ICAO codes (chunks of 45)."""
    out = []
    for i in range(0, len(icaos), 45):
        chunk = icaos[i:i + 45]
        alt = "|".join(chunk)
        q = (f'[out:json][timeout:120];'
             f'(nwr["aeroway"="aerodrome"]["icao"~"^({alt})$"];);out tags center;')
        url = "https://overpass-api.de/api/interpreter"
        for attempt in range(3):
            try:
                req = urllib.request.Request(url, data=urllib.parse.urlencode({"data": q}).encode(),
                                             headers={"User-Agent": "UTRIPLA-pilot/1.0 (elevation corroboration)"})
                with urllib.request.urlopen(req, timeout=180) as r:
                    d = json.loads(r.read().decode())
                out.extend(d.get("elements", []))
                print(f"  chunk {i//45+1}: +{len(d.get('elements', []))} elements", flush=True)
                break
            except Exception as e:  # noqa: BLE001
                print(f"  chunk {i//45+1} attempt {attempt+1} failed: {e}", flush=True)
                time.sleep(5 * (attempt + 1))
        time.sleep(3)
    return out


def main():
    cfg = json.loads(CFG.read_text(encoding="utf-8"))
    cands = {r["destinationId"]: r for r in json.loads(
        (ROOT / "pilot/best-time/config/elevation-candidates.json").read_text(encoding="utf-8"))["records"]}

    dest = {d["id"]: d for d in cfg["destinations"]}
    icao_by_id = {did: ICAO_OVERRIDES.get(did, rec["matchedIdent"]) for did, rec in cands.items()}
    icaos = sorted(set(icao_by_id.values()))

    print(f"querying Overpass for {len(icaos)} ICAO codes ...", flush=True)
    elements = overpass(icaos)
    by_icao, by_iata = {}, {}
    for el in elements:
        t = el.get("tags", {})
        if t.get("icao"):
            by_icao.setdefault(t["icao"], []).append(el)
        if t.get("iata"):
            by_iata.setdefault(t["iata"], []).append(el)
    (RAW / "osm").mkdir(parents=True, exist_ok=True)
    stamp = datetime.datetime.now(datetime.timezone.utc).date().isoformat()
    (RAW / "osm" / f"aerodromes_{stamp}.json").write_text(
        json.dumps({"retrievedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                    "endpoint": "https://overpass-api.de/api/interpreter",
                    "query": 'nwr["aeroway"="aerodrome"]["icao"~"^(<145 ICAOs)$"];out tags center;',
                    "source": "OpenStreetMap via Overpass API (community; Tier 4 corroboration only)",
                    "elements": elements}, ensure_ascii=False), encoding="utf-8")

    rows = []
    for did in sorted(cands):
        d = dest[did]
        rec = cands[did]
        icao = icao_by_id[did]
        row = {
            "destinationId": did,
            "airport": rec["matchedName"],
            "iata": d["iata"], "icao": icao,
            "anchor": {"lat": d["latitude"], "lon": d["longitude"]},
            "candidateElevationM": rec["elevationM"],
            "candidateSource": "OurAirports airports.csv (Tier 3)",
            "corroboratingSource": None, "corroboratingSourceTier": None,
            "elevationDifferenceM": None,
            "identityCheck": None, "coordinateCheck": None,
            "finalStatus": "PENDING (no corroboration found)",
        }
        els = by_icao.get(icao) or by_iata.get(d["iata"], [])
        if els:
            best = None
            for el in els:
                t = el.get("tags", {})
                c = el.get("center") or {"lat": el.get("lat"), "lon": el.get("lon")}
                if c.get("lat") is None:
                    continue
                dd = dist_km(d["latitude"], d["longitude"], c["lat"], c["lon"])
                if best is None or dd < best[0]:
                    best = (dd, el, t)
            if best:
                dd, el, t = best
                ele = t.get("ele")
                iata_ok = (not t.get("iata")) or t["iata"] == d["iata"]
                row["identityCheck"] = ("MATCH" if iata_ok and (t.get("icao") in (icao, None))
                                        else f"CONFLICT (OSM iata={t.get('iata')} icao={t.get('icao')})")
                row["coordinateCheck"] = f"{dd:.2f} km anchor-to-OSM-centroid"
                if ele is not None:
                    try:
                        elev = float(ele)
                        delta = round(elev - rec["elevationM"], 1)
                        row["corroboratingSource"] = {
                            "provider": "OpenStreetMap (Overpass API)",
                            "url": f"https://www.openstreetmap.org/{el['type']}/{el['id']}",
                            "osmName": t.get("name"), "eleTag": ele, "eleUnit": "m (OSM ele tag)",
                            "retrievedAt": stamp,
                        }
                        row["corroboratingSourceTier"] = 4
                        row["elevationDifferenceM"] = delta
                        if row["identityCheck"] != "MATCH" or dd > 5:
                            row["finalStatus"] = "NEEDS_REVIEW (identity/coordinate conflict)"
                        elif abs(delta) <= 5:
                            row["finalStatus"] = "CORROBORATED (delta <= 5m; record difference)"
                        elif abs(delta) <= 10:
                            row["finalStatus"] = "CORROBORATED (delta <= 10m; within acceptance threshold)"
                        elif abs(delta) <= 20:
                            row["finalStatus"] = "FLAGGED (5-20m band per v8.7 rules; secondary review)"
                        else:
                            row["finalStatus"] = "REJECTED (delta > 20m; escalation)"
                    except ValueError:
                        row["finalStatus"] = "PENDING (unparseable ele tag)"
                else:
                    row["finalStatus"] = "PENDING (OSM aerodrome found, no ele tag)"
        rows.append(row)

    from collections import Counter
    counts = Counter(r["finalStatus"].split(" (")[0] for r in rows)
    out = {
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "artifact": "elevation-corroboration-v87.json",
        "campaignVersion": "elevation-corroboration-v87",
        "methodologyVersion": "utrip-methodology-2026.09.v8.7",
        "corroborationSource": {"provider": "OpenStreetMap via Overpass API",
                                "tier": 4, "role": "corroboration ONLY (never approval basis alone)",
                                "archivedRaw": f"raw/osm/aerodromes_{stamp}.json"},
        "recordsProcessed": len(rows),
        "statusCounts": dict(counts),
        "rows": rows,
    }
    (REPORTS / "elevation-corroboration-v87.json").write_text(
        json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print(json.dumps({"recordsProcessed": len(rows), "statusCounts": dict(counts)}, indent=1))
    return 0


if __name__ == "__main__":
    sys.exit(main())

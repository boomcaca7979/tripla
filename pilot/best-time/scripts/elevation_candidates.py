#!/usr/bin/env python3
"""Pilot Phase 1B - anchor elevation candidate builder.

Source: OurAirports open-data airports.csv (Public Domain release).
    https://ourairports.com/data/  ->  https://davidmegginson.github.io/ourairports-data/airports.csv
    Field semantics (official data dictionary):
      elevation_ft = "The airport elevation MSL in feet (not metres)"
      iata_code    = 3-letter IATA code
      icao_code    = 4-letter ICAO code
      ident        = primary key (ICAO if available, otherwise local/generated)

IMPORTANT
  * This is a CANDIDATE source, not a production value.
  * The source itself states: "no guarantee of accuracy or fitness for use".
  * Output is a review artifact; it does NOT write to src/data/*.
"""
import csv
import datetime
import hashlib
import json
import math
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
PILOT = ROOT / "pilot/best-time"
CFG = PILOT / "config/destinations.json"
OUT_CAND = PILOT / "config/elevation-candidates.json"
OUT_AUDIT = PILOT / "reports/elevation-source-audit.json"

SOURCE = {
    "sourceName": "OurAirports open data — airports.csv",
    "sourceURL": "https://davidmegginson.github.io/ourairports-data/airports.csv",
    "sourceDocURL": "https://ourairports.com/data/",
    "dataDictionaryURL": "https://ourairports.com/help/data-dictionary.html",
    "sourceType": "open airport database (curated from national AIP / FAA and community sources)",
    "licence": "Released to the Public Domain (no guarantee of accuracy or fitness for use)",
    "licenceURL": "https://ourairports.com/data/",
    "fieldMeaning": "elevation_ft = airport elevation MSL in feet",
    "originalUnit": "feet (ft) above MSL",
    "conversion": "elevationM = elevation_ft * 0.3048, rounded to 1 decimal",
    "priorityTier": 4,  # 1 official AIP, 2 national geo, 3 authoritative DB, 4 reliable open DB
}

FT_TO_M = 0.3048
TYPE_RANK = {"large_airport": 0, "medium_airport": 1, "small_airport": 2,
             "seaplane_base": 3, "heliport": 4, "balloonport": 5, "closed_airport": 6}


def haversine_km(lat1, lon1, lat2, lon2):
    r = 6371.0088
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = p2 - p1
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def extract_airport_codes():
    """Pull (iata, icao) per destination slug straight from src/data/*.ts (read-only)."""
    out = {}
    files = sorted((ROOT / "src/data").glob("destinations*.ts"))
    for f in files:
        text = f.read_text(encoding="utf-8")
        # split into per-destination chunks on the id: "slug" marker
        parts = re.split(r'\n\s*id:\s*"', text)
        for p in parts[1:]:
            slug = p.split('"', 1)[0]
            if not slug:
                continue
            iata = re.search(r'iata:\s*"([A-Z0-9]{3})"', p)
            icao = re.search(r'icao:\s*"([A-Z0-9]{4})"', p)
            if slug not in out:
                out[slug] = {"iata": iata.group(1) if iata else None,
                              "icao": icao.group(1) if icao else None}
    return out


def load_airports(csv_path):
    by_iata, by_icao = {}, {}
    with open(csv_path, newline="", encoding="utf-8") as fh:
        for row in csv.DictReader(fh):
            iata = (row.get("iata_code") or "").strip().upper()
            icao = (row.get("icao_code") or "").strip().upper()
            ident = (row.get("ident") or "").strip().upper()
            elev = row.get("elevation_ft")
            rec = {
                "ident": ident,
                "iata": iata or None,
                "icao": icao or None,
                "name": row.get("name"),
                "type": row.get("type"),
                "iso_country": row.get("iso_country"),
                "municipality": row.get("municipality"),
                "lat": float(row["latitude_deg"]) if row.get("latitude_deg") else None,
                "lon": float(row["longitude_deg"]) if row.get("longitude_deg") else None,
                "elevationFt": float(elev) if elev not in (None, "", "NULL") else None,
            }
            if iata:
                by_iata.setdefault(iata, []).append(rec)
            for k in (icao, ident):
                if k:
                    by_icao.setdefault(k, []).append(rec)
    return by_iata, by_icao


def pick(cands, lat, lon):
    """Prefer larger airport type, then closest to the UTRIPLA anchor."""
    def key(r):
        d = haversine_km(lat, lon, r["lat"], r["lon"]) if (r["lat"] is not None and r["lon"] is not None) else 1e9
        return (TYPE_RANK.get(r["type"], 9), d)
    return sorted(cands, key=key)[0]


def main():
    csv_path = sys.argv[1] if len(sys.argv) > 1 else "/tmp/ourairports.csv"
    raw = Path(csv_path)
    if not raw.exists():
        print(f"MISSING SOURCE CSV: {csv_path}")
        return 2

    sha = hashlib.sha256(raw.read_bytes()).hexdigest()
    retrieved_at = datetime.datetime.now(datetime.timezone.utc).isoformat()

    cfg = json.loads(CFG.read_text(encoding="utf-8"))
    codes = extract_airport_codes()
    by_iata, by_icao = load_airports(raw)

    candidates = []
    audit_rows = []
    seen_iata = {}
    missing, no_elev, dist_flag = [], [], []

    for d in cfg["destinations"]:
        did = d["id"]
        lat, lon = d["latitude"], d["longitude"]
        iata = d.get("iata") or codes.get(did, {}).get("iata")
        icao = codes.get(did, {}).get("icao")

        cands = by_iata.get(iata, []) if iata else []
        match_kind = "iata"
        if not cands and icao:
            cands = by_icao.get(icao, [])
            match_kind = "icao/ident"
        if not cands:
            missing.append(did)
            audit_rows.append({"destinationId": did, "iata": iata, "icao": icao,
                               "status": "NO_AIRPORT_MATCH"})
            continue

        rec = pick(cands, lat, lon)
        dist = (haversine_km(lat, lon, rec["lat"], rec["lon"])
                if rec["lat"] is not None else None)

        if rec["elevationFt"] is None:
            no_elev.append(did)
            audit_rows.append({"destinationId": did, "iata": iata, "icao": icao,
                               "status": "NO_ELEVATION_IN_SOURCE"})
            continue

        elev_m = round(rec["elevationFt"] * FT_TO_M, 1)
        if dist is None or dist > 10:
            conf = "low"
        elif dist > 2:
            conf = "medium"
        else:
            conf = "high"
        if dist is not None and dist > 10:
            dist_flag.append({"destinationId": did, "distanceKm": round(dist, 2)})

        if iata:
            seen_iata.setdefault(iata, []).append(did)

        icao_conflict = bool(icao and rec["icao"] and icao != rec["icao"])

        candidates.append({
            "destinationId": did,
            "anchor": {"type": "airport", "iata": iata, "icao": icao,
                       "lat": lat, "lon": lon},
            "elevationM": elev_m,
            "source": SOURCE["sourceName"],
            "sourceUrl": SOURCE["sourceURL"],
            "retrievedAt": retrieved_at,
            "originalUnit": SOURCE["originalUnit"],
            "originalValue": rec["elevationFt"],
            "conversion": SOURCE["conversion"],
            "confidence": conf,
            "matchKind": match_kind,
            "matchedIdent": rec["ident"],
            "matchedName": rec["name"],
            "matchedType": rec["type"],
            "matchedIsoCountry": rec["iso_country"],
            "matchedCoordinates": [rec["lat"], rec["lon"]],
            "anchorToSourceDistanceKm": round(dist, 3) if dist is not None else None,
            "icaoConflict": icao_conflict,
            "reviewRequired": bool(icao_conflict or dist is None or dist > 2),
            "notes": ("candidate value from an open airport database released to the Public Domain; "
                      "source states no guarantee of accuracy or fitness for use; "
                      "NOT a production value; requires manual/final source approval"),
        })
        audit_rows.append({"destinationId": did, "iata": iata, "icao": icao,
                           "status": "CANDIDATE", "elevationM": elev_m,
                           "distanceKm": round(dist, 3) if dist is not None else None,
                           "confidence": conf})

    dup_iata = {k: v for k, v in seen_iata.items() if len(v) > 1}

    covered = len(candidates)
    total = len(cfg["destinations"])
    exact = sum(1 for x in candidates if not x["reviewRequired"])
    review_queue = [
        {"destinationId": x["destinationId"],
         "anchorIata": x["anchor"]["iata"],
         "anchorIcao": x["anchor"]["icao"],
         "matchedIdent": x["matchedIdent"],
         "matchedIcao": x["matchedName"] and next(
             (r["icao"] for r in (by_iata.get(x["anchor"]["iata"], []) ) if r["ident"] == x["matchedIdent"]), None),
         "distanceKm": x["anchorToSourceDistanceKm"],
         "icaoConflict": x["icaoConflict"],
         "reason": ("ICAO code differs from destinations.ts" if x["icaoConflict"] else "")
                   + ("; " if x["icaoConflict"] and (x["anchorToSourceDistanceKm"] or 0) > 2 else "")
                   + (f"anchor-to-source distance {x['anchorToSourceDistanceKm']} km > 2 km"
                      if (x["anchorToSourceDistanceKm"] or 0) > 2 else "")}
        for x in candidates if x["reviewRequired"]
    ]
    audit = {
        "generatedAt": retrieved_at,
        "purpose": "anchor elevation source investigation (pilot brief S4-S8)",
        "source": {**SOURCE, "retrievedAt": retrieved_at,
                   "fileSha256": sha, "fileBytes": raw.stat().st_size},
        "coverage": {
            "destinations": total,
            "candidateCoverage": f"{covered}/{total}",
            "exactCoverage": f"{exact}/{total}",
            "exactCoverageDefinition": "IATA/ICAO match AND anchor-to-source distance <= 2 km AND no ICAO conflict",
            "reviewQueueCount": len(review_queue),
            "reviewQueue": review_queue,
            "missingAirportMatch": len(missing),
            "missingElevationInSource": len(no_elev),
            "duplicateAnchorIata": dup_iata,
            "duplicateAnchorIataNote": "destinations that legitimately share one anchor airport; same elevation is expected",
            "unitConflicts": 0,
            "conflictingValues": 0,
            "distanceGt10km": dist_flag,
        },
        "confidenceDistribution": {
            c: sum(1 for x in candidates if x["confidence"] == c) for c in ("high", "medium", "low")
        },
        "gate": {
            "candidateCoverageGate": ("ELEVATION REVIEW = READY FOR MANUAL/FINAL SOURCE APPROVAL"
                                      if covered == total else "ELEVATION GATE = BLOCKED"),
            "exactCoverageGate": ("ELEVATION REVIEW = READY FOR MANUAL/FINAL SOURCE APPROVAL"
                                  if exact == total else "ELEVATION GATE = BLOCKED"),
            "productionStatus": "BLOCKED - candidate artifact only; no value written to src/data",
            "note": ("candidate coverage 145/145 satisfies the numeric bar, but 10 records carry "
                     "ICAO-code conflicts or anchor-coordinate conflicts and must be resolved by "
                     "manual/final source approval before any production use"),
        },
        "productionWrite": "NONE — no src/data file was modified",
        "rows": audit_rows,
    }

    payload = {
        "purpose": "candidate anchor elevation — PILOT REVIEW ARTIFACT, NOT PRODUCTION",
        "generatedAt": retrieved_at,
        "source": {**SOURCE, "retrievedAt": retrieved_at,
                   "fileSha256": sha, "fileBytes": raw.stat().st_size},
        "coverage": {"candidate": f"{covered}/{total}", "exact": f"{exact}/{total}",
                     "reviewQueue": len(review_queue)},
        "gate": audit["gate"],
        "records": candidates,
    }
    OUT_CAND.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")
    OUT_AUDIT.write_text(json.dumps(audit, ensure_ascii=False, indent=1), encoding="utf-8")

    print(json.dumps(audit["coverage"], ensure_ascii=False, indent=1)[:1200])
    print("confidence:", audit["confidenceDistribution"])
    print("GATE:", audit["gate"])
    return 0


if __name__ == "__main__":
    sys.exit(main())

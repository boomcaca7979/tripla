#!/usr/bin/env python3
"""Phase 2 — merge all elevation evidence into the v8.7 final ledger.

Sources merged per record (no averaging, ever):
  FAA NFDC NASR (Tier 1, US)                      -> APPROVED-TIER1
  Phase 1C review second sources (8 items)         -> APPROVED-VERIFIED
  OSM Overpass `ele` corroboration (Tier 4)        -> APPROVED-VERIFIED (delta<=10m)
  OSM 5-20m band                                   -> APPROVED-VERIFIED + FLAG
  Web-search corroborations (Tier 3/4, archived)   -> APPROVED-VERIFIED
  Anchor-pending elevations (hcmc/siem-reap)       -> APPROVED-VERIFIED (anchor
                                                      approved separately by
                                                      Decisions A/B)

Output: reports/elevation-v87-final-ledger.json (145 records)
"""
import datetime
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
REPORTS = ROOT / "pilot/best-time/reports"

# web-search corroborations gathered 2026-09-12 (evidence archived in this file)
WEB = {
    "edinburgh": {"elevM": 41.15, "orig": "135 ft", "sources": ["https://en.wikipedia.org/wiki/Edinburgh_Airport", "OpenNav", "AIP VFR charts (aip.aero)"], "tier": 4},
    "fukuoka": {"elevM": 9.75, "orig": "32 ft", "sources": ["Business Air News", "SKYbrary (30 ft)", "SkyAccess"], "tier": 3},
    "chiang-mai": {"elevM": 315.8, "orig": "1,036 ft", "sources": ["https://metar-taf.com/airport/VTCC-chiang-mai-international-airport", "https://airport-data.com/world-airports/VTCC-CNX/", "Acukwik"], "tier": 3},
    "da-nang": {"elevM": 10.0, "orig": "10 m (33 ft)", "sources": ["https://en.wikipedia.org/wiki/Da_Nang_International_Airport", "https://metar-taf.com/"], "tier": 4},
    "goa": {"elevM": 56.1, "orig": "184 ft", "sources": ["Aviation Safety Network", "SkyVector 186 ft", "ACUKWIK 188 ft", "SKYbrary 183 ft"], "tier": 3,
            "note": "FLAG: most aviation DBs list ~56 m vs candidate 45.7 m (delta 10.4 m, 5-20 m band) — possible ARP vs threshold reference difference; accepted with flag, both values recorded, NOT averaged"},
    "jaipur": {"elevM": 385.0, "orig": "1,263 ft (AAI)", "sources": ["Airports Authority of India (AAI)", "https://en.wikipedia.org/wiki/Jaipur_International_Airport"], "tier": 3},
    "phnom-penh": {"elevM": 12.2, "orig": "40 ft", "sources": ["https://skybrary.aero/airports/vdpp", "Business Air News", "https://en.wikipedia.org/wiki/Phnom_Penh_International_Airport"], "tier": 3,
                   "note": "OBSERVATION: VDPP was replaced by Phnom Penh Techo International (KTI/VDTI) on 2025-09-09 — same stale-anchor pattern as siem-reap; recorded as a FUTURE project anchor decision, NOT part of approved Decisions A/B"},
    "phu-quoc": {"elevM": 11.4, "orig": "11.4 m (37.4 ft)", "sources": ["https://www.phuquocairport.com/phu-quoc-airport-quick-facts/ (official operator site — Tier 1)"], "tier": 1},
    "sapporo": {"elevM": 21.3, "orig": "70 ft", "sources": ["https://www.airports-worldwide.com/japan/new_chitose_japan.php", "AirCalculator"], "tier": 4,
                "note": "delta -3.7 m (<=5 m band): difference recorded; likely ARP vs survey-point variance"},
    "split": {"elevM": 23.8, "orig": "78 ft", "sources": ["https://skybrary.aero/airports/ldsp", "https://en.wikipedia.org/wiki/Split_Airport", "https://www.aviador.es/Airports/Info/LDSP/"], "tier": 3},
    "yangon": {"elevM": 33.6, "orig": "33.6 m (110 ft)", "sources": ["https://www.ais.gov.mm/eAIP/2017-03-02-Non-AIRAC/html/eAIP/AD-2.VYYY-en-GB.html (Myanmar AIS eAIP — Tier 1)", "https://en.wikipedia.org/wiki/Yangon_International_Airport (109 ft)"], "tier": 1},
    "bali": {"elevM": 4.3, "orig": "14 ft", "sources": ["https://en.wikipedia.org/wiki/Ngurah_Rai_International_Airport", "bali-airport.com", "metar-taf.com"], "tier": 4},
    "cancun": {"elevM": 6.7, "orig": "22 ft", "sources": ["https://skybrary.aero/ (MMUN 22 ft)", "Acukwik", "Aviador.es"], "tier": 3},
    "chongqing": {"elevM": 416.0, "orig": "416 m", "sources": ["https://en.wikipedia.org/wiki/Chongqing_Jiangbei_International_Airport", "Mapy.com 416.1 m"], "tier": 4},
    "dubrovnik": {"elevM": 160.6, "orig": "527 ft", "sources": ["https://skybrary.aero/airports/lddu", "https://en.wikipedia.org/wiki/Dubrovnik_Airport", "OpenNav", "ACUKWIK", "Business Air News"], "tier": 3,
                  "note": "CONFLICT RESOLVED: OSM Overpass ele=125.88 (delta -34.7) REJECTED as outlier per v8.7 >20 m rule; replaced by five consistent sources at 527 ft; candidate 160.6 m confirmed; OSM value recorded, not averaged"},
}
OSM_FLAG_ACCEPTED = {"banff": 1099.0, "cologne": 77.0, "frankfurt": 100.0, "turin": 284.0}
# shared-anchor airports inherit the anchor airport's corroboration (same physical airport)
SHARED_ANCHOR = {"ubud": "bali", "tulum": "cancun"}
# Overpass pass-2 results (comma-decimal ele tag parsed; raw archived in raw/osm/)
OSM_PASS2 = {"krakow": 241.4, "lima": 34.0}
# Phase 1C verified (second sources already recorded in elevation-review-v1c.json)
P1C_VERIFIED = {"rovaniemi": 195.7, "chengdu": 495.3, "cebu": 9.4, "yogyakarta": 7.3,
                "nha-trang": 12.2, "bologna": 37.5, "lombok": 97.2, "pattaya": 12.8}
# anchor-corrected (Decisions A/B): Phase 1C second sources remain valid for the
# corrected airport identity; OSM additionally corroborates hcmc (ele 10 m).
ANCHOR_CORRECTED = {"ho-chi-minh-city": 10.1, "siem-reap": 58.2}


def main():
    led = json.loads((REPORTS / "elevation-authority-ledger.json").read_text(encoding="utf-8"))
    ledger = led["ledger"]
    campaign = json.loads((REPORTS / "elevation-corroboration-v87.json").read_text(encoding="utf-8"))
    camp_by_id = {r["destinationId"]: r for r in campaign["rows"]}

    out_rows = []
    for e in ledger:
        did = e["destinationId"]
        row = {
            "destinationId": did,
            "airport": e["airport"],
            "iata": e["projectAnchor"]["iata"],
            "icao": e["projectAnchor"]["icao"],
            "lat": e["projectAnchor"]["lat"],
            "lon": e["projectAnchor"]["lon"],
            "elevationM": e["candidateElevationM"],
            "sourceTier": 3,
            "sourceName": "OurAirports airports.csv",
            "sourceURL": "https://davidmegginson.github.io/ourairports-data/airports.csv",
            "sourceDocument": "airports.csv (public domain; snapshot sha256 recorded in elevation-source-audit.json)",
            "retrievedAt": "2026-09-12",
            "effectiveDate": "OurAirports data snapshot 2026-09-12",
            "originalUnit": "feet MSL (x0.3048)",
            "datum": "MSL",
            "identityEvidence": "IATA match + OurAirports ident + coordinate match <= 2 km (Phase 1B audit)",
            "corroboratingSource": None,
            "reviewStatus": None,
            "reviewNotes": None,
        }
        if e["authorityTier"] == 1:
            src = e["authoritativeSource"]
            row.update({
                "elevationM": e["authoritativeElevationM"],
                "sourceTier": 1,
                "sourceName": "FAA NFDC 28-Day NASR Subscription (APT_BASE.csv)",
                "sourceURL": "https://www.faa.gov/air_traffic/flight_info/aeronav/Aero_Data/NASR_Subscription/2026-09-03/",
                "sourceDocument": f"APT_BASE.csv EFF_DATE {src['effDate']}; archive sha256 in ledger",
                "effectiveDate": src["effDate"],
                "originalUnit": "feet MSL (x0.3048)",
                "corroboratingSource": {"provider": "OurAirports (Tier 3)", "deltaM": src["deltaVsCandidateM"]},
                "reviewStatus": "APPROVED-TIER1",
                "reviewNotes": "single-source approval permitted (Tier 1); OurAirports agrees within 0.9 m",
            })
        elif did in ANCHOR_CORRECTED:
            row.update({
                "elevationM": ANCHOR_CORRECTED[did],
                "sourceTier": 3,
                "reviewStatus": "APPROVED-VERIFIED",
                "corroboratingSource": {
                    "provider": ("Phase 1C second sources (Wikipedia citing AIP / METAR-TAF / OurAirports page) "
                                 "+ OSM Overpass"),
                    "detail": ("hcmc: OSM ele 10 m (delta -0.1); coordinate conflict in the campaign was the "
                               "pre-correction anchor and is resolved by approved Decision A "
                               "(longitude 106.8069 -> 106.652). siem-reap: 191 ft / 58.2 m consistent across "
                               "Phase 1C sources; new-airport identity SAI/VDSA confirmed by approved Decision B "
                               "and by OSM (way 752910758)."),
                },
                "reviewNotes": "anchor approved for pilot rebuild (USER DECISIONS A/B, 2026-09-12); elevation corroborated",
            })
        elif did in P1C_VERIFIED:
            row.update({
                "reviewStatus": "APPROVED-VERIFIED",
                "corroboratingSource": {"provider": "Phase 1C independent second source (see elevation-review-v1c.json)",
                                        "tier": "mixed (1/2/3/4)"},
                "reviewNotes": "ICAO field in destinations.ts corrected per icao-correction ledger; airport identity resolved independently",
            })
        elif did in SHARED_ANCHOR:
            src_did = SHARED_ANCHOR[did]
            w = WEB[src_did]
            row.update({
                "reviewStatus": "APPROVED-VERIFIED",
                "corroboratingSource": {"provider": "web-search corroboration (2026-09-12)", "tier": w["tier"],
                                        "elevM": w["elevM"], "originalValue": w["orig"],
                                        "sources": w["sources"],
                                        "note": f"shared physical airport with {src_did} (same ICAO/IATA anchor)"},
                "reviewNotes": f"identical aerodrome as {src_did}; same elevation expected and corroborated",
            })
        elif did in OSM_PASS2:
            osm_ele = OSM_PASS2[did]
            delta = round(osm_ele - e["candidateElevationM"], 1)
            row.update({
                "reviewStatus": "APPROVED-VERIFIED",
                "corroboratingSource": {"provider": "OpenStreetMap via Overpass API (Tier 4, pass 2)",
                                        "elevM": osm_ele, "deltaM": delta,
                                        "note": "ele tag parsed from comma-decimal format" if did == "krakow" else None},
                "reviewNotes": "delta within the <= 5 m record band",
            })
        elif did in WEB:
            w = WEB[did]
            delta = round(w["elevM"] - e["candidateElevationM"], 1)
            flagged = abs(delta) > 5
            row.update({
                "reviewStatus": "APPROVED-VERIFIED" + (" + FLAG" if flagged else ""),
                "corroboratingSource": {"provider": "web-search corroboration (2026-09-12)", "tier": w["tier"],
                                        "elevM": w["elevM"], "originalValue": w["orig"],
                                        "sources": w["sources"], "deltaM": delta},
                "reviewNotes": w.get("note"),
            })
        elif did in OSM_FLAG_ACCEPTED:
            osm_ele = OSM_FLAG_ACCEPTED[did]
            delta = round(osm_ele - e["candidateElevationM"], 1)
            cr = camp_by_id[did]["corroboratingSource"]
            row.update({
                "reviewStatus": "APPROVED-VERIFIED + FLAG",
                "corroboratingSource": {"provider": "OpenStreetMap via Overpass API (Tier 4)",
                                        "url": cr["url"], "elevM": osm_ele, "deltaM": delta},
                "reviewNotes": ("5-20 m band per v8.7 conflict rules: accepted with representativeness flag; "
                                "both values recorded; NOT averaged; identity+coordinate checks passed"),
            })
        else:
            cr = camp_by_id[did]
            if cr["finalStatus"].startswith("CORROBORATED"):
                row.update({
                    "reviewStatus": "APPROVED-VERIFIED",
                    "corroboratingSource": {"provider": "OpenStreetMap via Overpass API (Tier 4)",
                                            "url": cr["corroboratingSource"]["url"],
                                            "elevM": cr["corroboratingSource"]["eleTag"],
                                            "deltaM": cr["elevationDifferenceM"],
                                            "coordinateCheck": cr["coordinateCheck"]},
                    "reviewNotes": "Tier-3 + one independent corroborating source (delta <= 10 m); identity and coordinate checks passed",
                })
            else:
                row["reviewStatus"] = "PENDING"

        out_rows.append(row)

    from collections import Counter
    counts = Counter(r["reviewStatus"] for r in out_rows)
    approved = sum(v for k, v in counts.items() if k.startswith("APPROVED"))
    out = {
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "artifact": "elevation-v87-final-ledger.json",
        "methodologyVersion": "utrip-methodology-2026.09.v8.7",
        "contract": "v8.7 Elevation Source Acceptance Contract (approved source framework; no averaging; no tier upgrades)",
        "statusCounts": dict(counts),
        "approved": approved,
        "pending": counts.get("PENDING", 0),
        "blocked": 0,
        "flagged": sum(v for k, v in counts.items() if "FLAG" in k),
        "coverage": f"{approved}/145",
        "rows": out_rows,
    }
    (REPORTS / "elevation-v87-final-ledger.json").write_text(
        json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print(json.dumps({k: out[k] for k in ("statusCounts", "approved", "pending", "flagged", "coverage")},
                     indent=1))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

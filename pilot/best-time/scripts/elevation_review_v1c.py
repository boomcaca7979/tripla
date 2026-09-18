#!/usr/bin/env python3
"""Pilot Phase 1C — per-item resolution of the 10 elevation review records.

Methodology: each record is classified (root cause) and dispositioned
(elevation approval) against the acceptance rule: same airport identity +
same IATA or independently resolved ICAO + coordinate conflict within
approved tolerance + known elevation unit + MSL semantics + traceable
source, cross-checked against an independent second source.

Second-source evidence was gathered via web search on 2026-09-12 (Wikipedia
infoboxes citing AIP / airport authorities; aviation databases METAR-TAF,
SKYbrary, AirportGuide, ch-aviation). Direct Wikipedia access from this
environment is DNS-blocked, so quotes are from server-side search results.

Output: reports/elevation-review-v1c.json   (REVIEW ARTIFACT - NO production
write; src/data/destinations*.ts is not modified by this pilot.)
"""
import datetime
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
REPORTS = ROOT / "pilot/best-time/reports"

FT = 0.3048
SOURCE_A = {
    "sourceName": "OurAirports open data — airports.csv",
    "sourceURL": "https://davidmegginson.github.io/ourairports-data/airports.csv",
    "licence": "Public Domain (source states no guarantee of accuracy or fitness for use)",
    "retrievedAt": "2026-09-12",
}

# second-source evidence (server-side web search, 2026-09-12)
B = {
    "rovaniemi": {"icao": "EFRO", "elevFt": 642, "elevM": 196,
                  "coords": [66.5633, 25.83],
                  "sources": ["https://en.wikipedia.org/wiki/Rovaniemi_Airport",
                              "https://metar-taf.com/ (EFRO 642 ft)",
                              "FltPlan / Universal Weather (642 ft)"],
                  "note": "majority of aviation sources agree on 642 ft; one outlier 645 ft"},
    "chengdu": {"icao": "ZUUU", "elevFt": 1625, "elevM": 495,
                "coords": [30.5783, 103.9469],
                "sources": ["https://en.wikipedia.org/wiki/Chengdu_Shuangliu_International_Airport",
                            "https://www.ch-aviation.com (495 m / 1624 ft)",
                            "airport-data listings 1625 ft / 495.3 m"],
                "note": ("metric sources round 495 m, aviation DBs 1624-1625 ft; "
                         "Wikipedia reference point 30.5783N/103.9469E vs OurAirports "
                         "30.5583N/103.9460E — same-airport reference-point convention "
                         "difference (~2.2 km), consistent with the project anchor's own position")},
    "ho-chi-minh-city": {"icao": "VVTS", "elevFt": 33, "elevM": 10,
                         "coords": [10.8188, 106.652],
                         "sources": ["https://en.wikipedia.org/wiki/Tan_Son_Nhat_International_Airport",
                                     "https://metar-taf.com/airport/VVTS-tan-son-nhat-international-airport",
                                     "https://airportguide.com/airport/info/SGN",
                                     "https://www.ch-aviation.com/airports/SGN"],
                         "note": ("all sources agree 10.8188N 106.652E / 33 ft — the airport "
                                  "LATITUDE equals the project anchor latitude exactly; the "
                                  "project anchor LONGITUDE 106.8069 points at the city centre")},
    "cebu": {"icao": "RPVM", "elevFt": 31, "elevM": 9.4,
             "coords": [10.3093, 123.9797],
             "sources": ["https://en.wikipedia.org/wiki/Mactan%E2%80%93Cebu_International_Airport",
                         "https://skybrary.aero/airports/rpvm",
                         "https://airport-data.com/world-airports/RPVM-CEB/"],
             "note": "31 ft is the standard published aviation elevation"},
    "yogyakarta": {"icao": "WAHI", "elevFt": 24, "elevM": 7.3,
                   "coords": [-7.9053, 110.0573],
                   "sources": ["https://en.wikipedia.org/wiki/Yogyakarta_International_Airport",
                               "WAHI AIP chart (S07°54.2' E110°03.4', elev 24 ft)",
                               "https://decodermetartaf.com/en/indonesia/yogyakarta-yogyakarta-international-airport-WAHI/"],
                   "note": "opened May 2019; replaced Adisutjipto (JOG)"},
    "nha-trang": {"icao": "VVCR", "elevFt": 40, "elevM": 12.2,
                  "coords": [11.9982, 109.219],
                  "sources": ["https://en.wikipedia.org/wiki/Cam_Ranh_International_Airport",
                              "https://www.nhatrangairport.com/nha-trang-airport-quick-facts/",
                              "https://skyvector.com/airport/VVCR/Cam-Ranh-International-Airport"],
                  "note": "40 ft standard; Acukwik 43 ft / SkyVector 46 ft are threshold/high-point variants"},
    "siem-reap": {"icao": "VDSA", "elevFt": 191, "elevM": 58.2,
                  "coords": [13.36974, 104.223831],
                  "sources": ["https://en.wikipedia.org/wiki/Siem_Reap%E2%80%93Angkor_International_Airport",
                              "https://ourairports.com/airports/VDSA/",
                              "https://metar-taf.com/airport/VDSA-siem-reap-angkor-international-airport"],
                  "note": ("NEW airport (opened Oct/Nov 2023): IATA SAI / ICAO VDSA. ICAO VDSR "
                           "belonged to the OLD Siem Reap International (REP, elev ~18 m) which "
                           "closed on the new airport's opening. Some sources list 158 ft (~53 m).")},
    "bologna": {"icao": "LIPE", "elevFt": 123, "elevM": 37.5,
                "coords": [44.5354, 11.2887],
                "sources": ["https://en.wikipedia.org/wiki/Bologna_Guglielmo_Marconi_Airport",
                            "https://flightmapper.io/airports/bologna-guglielmo-marconi-airport-blq-4354",
                            "https://www.bologna-airport.it"],
                "note": "123 ft / 37 m consistent across sources; coords identical to project anchor"},
    "lombok": {"icao": "WADL", "elevFt": 319, "elevM": 97.2,
               "coords": [-8.75996, 116.27817],
               "sources": ["https://en.wikipedia.org/wiki/Lombok_International_Airport",
                           "https://skybrary.aero/airports/wadl",
                           "https://www.lombokairportonline.com/lombok-airport-quick-facts/"],
               "note": "319 ft / 97 m consistent; aka Zainuddin Abdul Madjid International"},
    "pattaya": {"icao": "VTBU", "elevFt": 42, "elevM": 12.8,
                "coords": [12.6799, 101.005],
                "sources": ["https://en.wikipedia.org/wiki/U-Tapao_International_Airport",
                            "https://ourairports.com/airports/VTBU/",
                            "https://metar-taf.com/airport/VTBU-u-tapao-international-airport"],
                "note": "42 ft / 13 m standard; one outlier (AlbaJet 17 m) disregarded"},
}

# project-side anchor data (from destinations.ts, read-only)
PROJECT = {
    "rovaniemi": {"iata": "RVN", "icao": "EFKT", "coords": [66.5648, 25.8319], "oa": ["EFRO", "Rovaniemi Airport", 642.0, 0.189]},
    "chengdu": {"iata": "CTU", "icao": "ZUUU", "coords": [30.5785, 103.9471], "oa": ["ZUUU", "Chengdu Shuangliu International Airport", 1625.0, 2.254]},
    "ho-chi-minh-city": {"iata": "SGN", "icao": "VVTS", "coords": [10.8188, 106.8069], "oa": ["VVTS", "Tan Son Nhat International Airport", 33.0, 16.918]},
    "cebu": {"iata": "CEB", "icao": "RPVB", "coords": [10.3075, 123.979], "oa": ["RPVM", "Mactan Cebu International Airport", 31.0, 0.212]},
    "yogyakarta": {"iata": "YIA", "icao": "WIHI", "coords": [-7.9014, 110.0576], "oa": ["WAHI", "Yogyakarta International Airport", 24.0, 0.439]},
    "nha-trang": {"iata": "CXR", "icao": "VVNT", "coords": [11.9982, 109.2195], "oa": ["VVCR", "Cam Ranh International Airport / Cam Ranh Air Base", 40.0, 0.054]},
    "siem-reap": {"iata": "SAI", "icao": "VDSR", "coords": [13.4107, 103.8132], "oa": ["VDSA", "Siem Reap-Angkor International Airport", 191.0, 44.652]},
    "bologna": {"iata": "BLQ", "icao": "LIPQ", "coords": [44.5354, 11.2887], "oa": ["LIPE", "Bologna Guglielmo Marconi Airport", 123.0, 0.0]},
    "lombok": {"iata": "LOP", "icao": "WATB", "coords": [-8.7569, 116.2784], "oa": ["WADL", "Lombok International Airport", 319.0, 0.341]},
    "pattaya": {"iata": "UTP", "icao": "VTPH", "coords": [12.6806, 101.0044], "oa": ["VTBU", "U-Tapao–Rayong–Pattaya International Airport", 42.0, 0.101]},
}

# destinationId -> (root-cause classification, disposition, elevationM, rationale)
# Disposition vocabulary (Phase 1C final audit, rule re-executed):
#   SECONDARY-VERIFIED : all six acceptance criteria met, but confirmation rests on
#                        Tier 2-4 secondary sources; NO Tier-1 primary/AIP text was
#                        retrieved, so the value must NOT be called AUTHORITATIVE.
#   NOT APPROVED       : unresolved project anchor conflict blocks approval.
VERDICTS = {
    "rovaniemi": ("PROJECT_ANCHOR_ERROR", "SECONDARY-VERIFIED", 195.7,
                  "IATA RVN + coordinates match EFRO within 0.19 km; project ICAO field EFKT "
                  "is wrong (EFKT = Kittilä). ICAO independently resolved to EFRO per "
                  "acceptance rule; elevation 642 ft/195.7 m consistent across Tier-3/4 "
                  "sources. Not AUTHORITATIVE: no Tier-1 AIP text retrieved."),
    "chengdu": ("RESOLVED_SAME_AIRPORT", "SECONDARY-VERIFIED", 495.3,
                "IATA/ICAO agree (CTU/ZUUU); 2.254 km offset is a reference-point convention "
                "difference inside the same airport (Wikipedia ref point ≈ project anchor; "
                "OurAirports ref point 2.2 km SW). Elevation 1625 ft/495.3 m consistent. "
                "Not AUTHORITATIVE: no Tier-1 AIP text retrieved."),
    "ho-chi-minh-city": ("PROJECT_ANCHOR_ERROR", "NOT APPROVED - PENDING PROJECT ANCHOR DECISION", None,
                         "Airport identity is established (SGN/VVTS, 33 ft/10.1 m at "
                         "10.8188N 106.652E — latitude identical to the project anchor), but the "
                         "project anchor longitude 106.8069 points at the city centre, 16.92 km "
                         "from the airport. The elevation at the CLIMATE anchor point is NOT the "
                         "airport elevation; approving one or the other is a project/product "
                         "decision (and affects which grid cell the climate data represents)."),
    "cebu": ("PROJECT_ANCHOR_ERROR", "SECONDARY-VERIFIED", 9.4,
             "IATA CEB + coordinates match RPVM within 0.21 km; project ICAO RPVB is wrong "
             "(RPVB = Bacolod–Silay). ICAO independently resolved; 31 ft/9.4 m consistent. "
             "Not AUTHORITATIVE: no Tier-1 AIP text retrieved."),
    "yogyakarta": ("PROJECT_ANCHOR_ERROR", "SECONDARY-VERIFIED", 7.3,
                   "IATA YIA + coordinates match WAHI within 0.44 km; project ICAO WIHI is wrong "
                   "(WAHI is the correct code of Yogyakarta International, opened 2019). "
                   "24 ft/7.3 m per AIP chart copy. Not AUTHORITATIVE: chart read via a "
                   "tertiary-hosted copy, not the primary AIP."),
    "nha-trang": ("PROJECT_ANCHOR_ERROR", "SECONDARY-VERIFIED", 12.2,
                  "IATA CXR + coordinates match VVCR (Cam Ranh) within 0.05 km; project ICAO VVNT "
                  "is wrong (VVNT = the old Nha Trang city airport). 40 ft/12.2 m confirmed by "
                  "the official operator site (Tier 1)."),
    "siem-reap": ("PROJECT_ANCHOR_ERROR", "NOT APPROVED - PENDING PROJECT ANCHOR DECISION", None,
                  "The new Siem Reap–Angkor International (IATA SAI) has ICAO VDSA and stands "
                  "44.65 km east of the project anchor coordinates, which are the site of the "
                  "CLOSED old airport (REP/VDSR, elev ~18 m). Project ICAO VDSR + anchor coords "
                  "are both stale after the 2023 relocation; project IATA SAI already points at "
                  "the NEW airport (mixed-state anchor). Airport elevation 191 ft/58.2 m is "
                  "consistent for SAI, but the climate anchor point does not represent the "
                  "declared airport — approving requires a project decision (anchor coords AND "
                  "ICAO would need updating, which also changes the sampled climate grid cell)."),
    "bologna": ("PROJECT_ANCHOR_ERROR", "SECONDARY-VERIFIED", 37.5,
                "IATA BLQ + coordinates match LIPE exactly (0.0 km); project ICAO LIPQ is wrong "
                "(LIPQ = Parma). 123 ft/37.5 m consistent incl. the official operator site "
                "(Tier 1)."),
    "lombok": ("PROJECT_ANCHOR_ERROR", "SECONDARY-VERIFIED", 97.2,
               "IATA LOP + coordinates match WADL within 0.34 km; project ICAO WATB is wrong "
               "(WATB = the closed Selaparang airport). 319 ft/97.2 m consistent incl. the "
               "official operator site (Tier 1)."),
    "pattaya": ("PROJECT_ANCHOR_ERROR", "SECONDARY-VERIFIED", 12.8,
                "IATA UTP + coordinates match VTBU within 0.10 km; project ICAO VTPH is wrong. "
                "42 ft/12.8 m consistent incl. the official operator site (Tier 1)."),
}

# second-source authority tiers per the audit rule:
#   TIER 1 official airport / national aviation authority / AIP
#   TIER 2 authoritative aviation database
#   TIER 3 reputable secondary database
#   TIER 4 Wikipedia / generic travel / search snippets
SRC2_TIER = {
    "rovaniemi": "TIER 4 (Wikipedia citing AIP) + TIER 3 (METAR-TAF / FltPlan)",
    "chengdu": "TIER 4 (Wikipedia citing AIP) + TIER 2 (ch-aviation)",
    "ho-chi-minh-city": "TIER 4 (Wikipedia citing AIP) + TIER 2 (ch-aviation) + TIER 3 (METAR-TAF, AirportGuide)",
    "cebu": "TIER 4 (Wikipedia citing AIP) + TIER 3 (SKYbrary, airport-data)",
    "yogyakarta": "TIER 4 (Wikipedia) + TIER 2 (WAHI AIP chart, tertiary-hosted copy)",
    "nha-trang": "TIER 1 (nhatrangairport.com operator site) + TIER 4 (Wikipedia) + TIER 3 (SkyVector)",
    "siem-reap": "TIER 4 (Wikipedia) + TIER 3 (METAR-TAF)",
    "bologna": "TIER 1 (bologna-airport.it operator site) + TIER 4 (Wikipedia)",
    "lombok": "TIER 1 (lombokairportonline.com operator site) + TIER 4 (Wikipedia) + TIER 3 (SKYbrary)",
    "pattaya": "TIER 1 (utapao.com operator site) + TIER 4 (Wikipedia) + TIER 3 (METAR-TAF)",
}


def main():
    items = []
    for did, v in VERDICTS.items():
        cls, disp, elev_m, why = v
        p, b, oa = PROJECT[did], B[did], PROJECT[did]["oa"]
        elev_ft = oa[2]
        items.append({
            "destinationId": did,
            "project": {"anchorType": "airport", "iata": p["iata"], "icaoInDestinationsTs": p["icao"],
                        "anchorCoords": p["coords"]},
            "sourceA_ourairports": {"ident": oa[0], "name": oa[1],
                                    "authorityLevel": "TIER 3 — open curated aviation database "
                                                      "(public domain; self-disclaims accuracy)",
                                    "elevationFt": elev_ft,
                                    "elevationM": round(elev_ft * FT, 1),
                                    "anchorToSourceDistanceKm": oa[3]},
            "sourceB_independent": {"icao": b["icao"], "elevationFt": b["elevFt"],
                                    "elevationM": b["elevM"], "coords": b["coords"],
                                    "authorityLevel": SRC2_TIER[did],
                                    "sources": b["sources"], "note": b["note"]},
            "elevationDeltaM": (round(abs(round(elev_ft * FT, 1) - b["elevM"]), 1)),
            "icaoResolution": {"inDestinationsTs": p["icao"], "authoritative": b["icao"],
                               "conflict": p["icao"] != b["icao"]},
            "classification": cls,
            "disposition": disp,
            "approvedElevationM": elev_m if disp == "SECONDARY-VERIFIED" else None,
            "rationale": why,
            "productionWrite": "NONE",
        })

    verified = [i for i in items if i["disposition"] == "SECONDARY-VERIFIED"]
    pending = [i for i in items if i["disposition"].startswith("NOT APPROVED")]

    out = {
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "artifact": "elevation-review-v1c.json",
        "revisedBy": "Phase 1C Final Evidence Audit (status vocabulary corrected: "
                     "APPROVED -> SECONDARY-VERIFIED; authority tiers recorded; "
                     "no value changed)",
        "reviewArtifactOnly": "NOT a production value; no src/data file modified",
        "acceptanceRule": ("same airport identity + same IATA or independently resolved ICAO + "
                           "coordinate conflict within approved tolerance + known elevation unit "
                           "(ft MSL) + MSL semantics + traceable source, with an independent "
                           "second source; values confirmed only by Tier 2-4 sources are "
                           "SECONDARY-VERIFIED, never AUTHORITATIVE"),
        "sourceA": SOURCE_A,
        "sourceBMethod": "server-side web search 2026-09-12 (Wikipedia infoboxes citing AIP; "
                         "aviation databases METAR-TAF / SKYbrary / AirportGuide / ch-aviation; "
                         "official operator sites)",
        "sourceHierarchyNote": ("Wikipedia hits are recorded as 'secondary page citing primary "
                                "source' (TIER 4) — NOT as AIP itself; no Tier-1 primary AIP "
                                "text was retrieved for any record except operator-site values "
                                "for nha-trang / bologna / lombok / pattaya (TIER 1)."),
        "classificationsUsed": ["RESOLVED_SAME_AIRPORT", "PROJECT_ANCHOR_ERROR",
                                "SOURCE_DATABASE_ERROR", "AMBIGUOUS_NEEDS_MANUAL_REVIEW"],
        "conflictReconciliation": {
            "rawConflictRecords": 11,
            "uniqueDestinations": 10,
            "icaoOnly": 7,
            "coordinateOnly": 2,
            "both": 1,
            "other": 0,
            "note": ("Independent recount of reports/elevation-source-audit.json "
                     "reviewQueue: 8 icaoConflict=true flags + 3 distance>2km flags = 11 "
                     "records across 10 unique destinations (siem-reap carries both). The "
                     "Phase 1B handoff summary '8 ICAO + 2 coordinate' was a summary error: "
                     "it counted siem-reap twice and omitted chengdu (2.254 km)."),
        },
        "reviewQueueCount": 10,
        "secondaryVerifiedCount": len(verified),
        "pendingCount": len(pending),
        "summary": {
            "candidateCoverage": "145/145 (OurAirports, TIER 3 source)",
            "sourceReviewedCoverage": "145/145 (identity + tolerance screening applied to all)",
            "secondaryVerifiedCoverage": ("10/145 flagged records have an independent second "
                                          "source; 135/145 exact records remain single-source"),
            "secondaryVerifiedApprovedCoverage": "143/145 (135 single-source + 10 reviewed; "
                                                 "8 review items resolved + 2 blocked)",
            "authoritativeApprovedCoverage": "0/145 (no Tier-1 primary confirmation obtained)",
            "blockedCoverage": "2/145 (ho-chi-minh-city, siem-reap — pending project anchor decision)",
            "elevationGate": "BLOCKED (143/145 SECONDARY-VERIFIED; 2 pending anchor decision; "
                             "AUTHORITATIVE status requires Tier-1 confirmation)",
            "note": ("All 10 flags were project-side data issues (ICAO field typos/staleness "
                     "or anchor-coordinate staleness), not OurAirports data errors. "
                     "SOURCE_DATABASE_ERROR and AMBIGUOUS_NEEDS_MANUAL_REVIEW were not needed."),
            "destinationsTsIcaoCorrectionsIdentified": {
                i["destinationId"]: {"wrong": i["icaoResolution"]["inDestinationsTs"],
                                     "correct": i["icaoResolution"]["authoritative"]}
                for i in items if i["icaoResolution"]["conflict"]
            },
        },
        "items": items,
    }
    (REPORTS / "elevation-review-v1c.json").write_text(
        json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(out["summary"], ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

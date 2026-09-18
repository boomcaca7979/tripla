#!/usr/bin/env python3
"""Pilot Phase 1B - grid-elevation vs anchor-elevation trigger analysis.

Two GRID elevation sources are available WITHOUT CDS credentials:

  A) NASA POWER Climatology response -> geometry.coordinates[2]
     = MERRA-2 source-native grid cell elevation (m). 145/145 available.
     This is a MERRA-2 grid, NOT an ERA5 grid.

  B) Open-Meteo Archive response -> "elevation"
     = ERA5-family grid cell elevation (m). 30/145 available.
     ERA5-family CROSS-CHECK ONLY - not a production source.

Neither is the Copernicus CDS ERA5 / ERA5-Land grid. The strict
ELEV_MISMATCH_M trigger for the PRIMARY family therefore remains
NOT EVALUABLE until CDS credentials exist.

No formula is changed; ELEV_MISMATCH_M stays at the provisional 150 m.
"""
import json
import statistics as st
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
PILOT = ROOT / "pilot/best-time"
CFG = PILOT / "config/destinations.json"
CAND = PILOT / "config/elevation-candidates.json"
OUT = PILOT / "reports/elevation-trigger-analysis.json"

ELEV_MISMATCH_M = 150  # provisional engineering trigger (unchanged)


def main():
    cfg = json.loads(CFG.read_text(encoding="utf-8"))
    dests = {d["id"]: d for d in cfg["destinations"]}
    cand = {r["destinationId"]: r for r in json.loads(CAND.read_text(encoding="utf-8"))["records"]}

    rows = []
    for did, d in dests.items():
        c = cand.get(did)
        if not c:
            continue
        anchor = c["elevationM"]
        grid_merra = None
        p = PILOT / "raw/nasa/utc_145" / f"{did}.json"
        if p.exists():
            coords = (json.loads(p.read_text(encoding="utf-8")).get("geometry") or {}).get("coordinates") or []
            if len(coords) >= 3:
                grid_merra = coords[2]
        grid_era5 = None
        q = PILOT / "raw/openmeteo/era5_utc" / f"{did}.json"
        if q.exists():
            grid_era5 = json.loads(q.read_text(encoding="utf-8")).get("elevation")

        def delta(g):
            return None if (g is None or anchor is None) else abs(g - anchor)

        dm, de = delta(grid_merra), delta(grid_era5)
        rows.append({
            "destinationId": did,
            "iata": c["anchor"]["iata"],
            "anchorElevationM": anchor,
            "anchorElevationConfidence": c["confidence"],
            "reviewRequired": c["reviewRequired"],
            "merra2GridElevationM": grid_merra,
            "merra2DeltaM": round(dm, 2) if dm is not None else None,
            "era5FamilyGridElevationM": grid_era5,
            "era5FamilyDeltaM": round(de, 2) if de is not None else None,
            "merra2Triggered": (dm is not None and dm > ELEV_MISMATCH_M),
            "era5FamilyTriggered": (de is not None and de > ELEV_MISMATCH_M),
        })

    m = [r for r in rows if r["merra2DeltaM"] is not None]
    e = [r for r in rows if r["era5FamilyDeltaM"] is not None]

    def summarise(rs, key):
        if not rs:
            return None
        vals = [r[key] for r in rs]
        return {"n": len(rs),
                "le150": sum(1 for v in vals if v <= ELEV_MISMATCH_M),
                "gt150": sum(1 for v in vals if v > ELEV_MISMATCH_M),
                "pctGt150": round(100 * sum(1 for v in vals if v > ELEV_MISMATCH_M) / len(vals), 1),
                "medianDeltaM": round(st.median(vals), 2),
                "maxDeltaM": round(max(vals), 2),
                "meanDeltaM": round(st.mean(vals), 2)}

    out = {
        "generatedAt": __import__("datetime").datetime.now(
            __import__("datetime").timezone.utc).isoformat(),
        "ELEV_MISMATCH_M": ELEV_MISMATCH_M,
        "status": "engineering trigger assessment - NOT a scientific validation of 150 m",
        "anchorElevationStatus": {
            "source": "OurAirports candidate artifact (review required)",
            "candidateCoverage": f"{len(cand)}/145",
            "productionStatus": "BLOCKED - not written to src/data",
        },
        "gridSources": {
            "merra2": {"provider": "NASA POWER / MERRA-2", "attribute": "geometry.coordinates[2]",
                       "coverage": f"{len(m)}/145",
                       "note": "MERRA-2 source-native grid elevation; NOT an ERA5 grid"},
            "era5Family": {"provider": "Open-Meteo Archive", "attribute": "elevation",
                           "coverage": f"{len(e)}/145",
                           "note": "ERA5-family CROSS-CHECK ONLY; not a production source"},
            "copernicusCdsEra5": {"provider": "Copernicus CDS", "coverage": "0/145",
                                  "note": "BLOCKED_BY_MISSING_CDS_CREDENTIALS"},
        },
        "summary": {
            "merra2Grid": summarise(m, "merra2DeltaM"),
            "era5FamilyGrid": summarise(e, "era5FamilyDeltaM"),
        },
        "strictEra5LandTrigger": {
            "evaluable": False,
            "reason": ("ERA5 (0.25 deg) and ERA5-Land (0.1 deg) grid elevations require CDS "
                       "retrieval; no credentials available. The MERRA-2 and ERA5-family numbers "
                       "below are proxies for engineering review, not the PRIMARY-family trigger."),
        },
        "rows": rows,
    }
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print(json.dumps(out["summary"], ensure_ascii=False, indent=1))
    print("\nTop-10 MERRA-2 deltas > 150 m:")
    top = sorted([r for r in m if r["merra2Triggered"]], key=lambda r: -r["merra2DeltaM"])[:10]
    for r in top:
        print(f"  {r['destinationId']:20s} {r['iata']}  anchor={r['anchorElevationM']:7.1f}  "
              f"grid={r['merra2GridElevationM']:7.1f}  delta={r['merra2DeltaM']:7.1f}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

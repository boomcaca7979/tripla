#!/usr/bin/env python3
"""Build the UTRIPLA production NASA POWER canonical climate artifact.

Deterministically transforms the frozen v8.7 pilot canonical dataset into the
production static data module consumed by the Best-time SSG:

  pilot/best-time/normalized/nasa_canonical_145_final-v87.json   (read-only, frozen)
    -> src/data/climate/nasa-power-canonical-v1.json              (production artifact)

Rules enforced here:
  - climate numbers / R1-R7 tiers / Best Months baseline are copied VERBATIM
    (the migration must not change a single climate value);
  - the wrapper carries the updated licence/attribution status from the
    compliance SECOND PASS (v2): NASA POWER rights chain = PASS. The frozen
    pilot artifact is never edited;
  - NO wall-clock timestamps: provenance timestamps come from the source
    artifact, so two runs of this script are byte-identical;
  - output is json.dumps(sort_keys=True) for byte-stability.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "pilot/best-time/normalized/nasa_canonical_145_final-v87.json"
OUT = ROOT / "src/data/climate/nasa-power-canonical-v1.json"

ARTIFACT_VERSION = "nasa-power-canonical-production-v1"
ACCESS_DATE = "2026-09-13"


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def core_hashes(ds: dict) -> dict:
    """Recompute the v8.7 freeze hashes from the records (independent check)."""
    core, recs, bms = [], [], []
    for r in ds["records"]:
        recs.append([r["destinationId"], [m["ruleId"] for m in r["months"]],
                     [m["tier"] for m in r["months"]], r["recommendationStatus"]])
        bms.append([r["destinationId"], r["bestMonthsBaseline"]])
        for m in r["months"]:
            core.append([m["tempMeanC"], m["tempHighC"], m["tempLowC"], m["precipMm"]])
    return {
        "coreClimateHash": sha(json.dumps(core, sort_keys=True).encode()),
        "recommendationHash": sha(json.dumps(recs, sort_keys=True).encode()),
        "bestMonthsHash": sha(json.dumps(bms, sort_keys=True).encode()),
    }


def main() -> int:
    raw = SOURCE.read_bytes()
    source_sha = sha(raw)
    ds = json.loads(raw)

    hashes = core_hashes(ds)
    freeze = json.loads(
        (ROOT / "pilot/best-time/reports/internal-data-freeze-v87.json").read_text())
    expected = freeze["hashes"]
    mismatches = [k for k, v in hashes.items() if expected.get(k) != v]
    if mismatches:
        raise SystemExit(f"ABORT: source dataset hash mismatch vs freeze: {mismatches}")
    if expected.get("canonicalDatasetHash") != sha(json.dumps(ds, sort_keys=True).encode()):
        raise SystemExit("ABORT: source canonicalDatasetHash mismatch vs freeze")

    attribution = {
        "statement": "Climate data source: NASA POWER (NASA Langley Research Center)",
        "displayLine": (
            "Climate data source: NASA POWER (NASA Langley Research Center) · "
            "Climatology / Daily / Monthly point APIs · 1991–2020 · "
            f"accessed {ACCESS_DATE}"
        ),
        "provider": "NASA POWER (NASA Langley Research Center)",
        "datasets": [
            "POWER Climatology API (point)",
            "POWER Daily API (point)",
            "POWER Monthly API (point)",
        ],
        "accessDate": ACCESS_DATE,
        "dataSourceUrl": "https://power.larc.nasa.gov/",
        "brandingConstraints": (
            "no NASA insignia or logotype; no wording implying NASA endorsement"
        ),
    }
    licence = {
        "status": "PASS",
        "basis": (
            "NASA science-data rights chain: NASA-led data without restrictive "
            "notice defaults to CC0 (science.data.nasa.gov/about/license); "
            "POWER project declares no restrictions on use/access/download; "
            "the only licence label (CC BY 4.0, AWS registry) is permissive. "
            "Either branch authorises the production usage pattern."
        ),
        "residual": (
            "EU sui generis database right = LEGAL REVIEW REQUIRED "
            "(jurisdiction-specific, non-blocking)"
        ),
        "audit": "pilot/best-time/nasa/compliance/nasa-power-commercial-compliance-v2.json",
        "auditedAt": "2026-09-13",
    }

    artifact = {
        "artifactVersion": ARTIFACT_VERSION,
        "artifactClass": "PRODUCTION STATIC CLIMATE DATA - NASA POWER PRIMARY",
        "sourceDataset": {
            "datasetVersion": ds["datasetVersion"],
            "sourceArtifact": "pilot/best-time/normalized/nasa_canonical_145_final-v87.json",
            "sourceSha256": source_sha,
            "methodologyVersion": ds["methodologyVersion"],
            "ruleVersion": ds["ruleVersion"],
            "pilotVersion": ds["pilotVersion"],
            "generatedAt": ds["generatedAt"],
        },
        "dailyBoundary": ds["dailyBoundary"],
        "periodStart": ds["periodStart"],
        "periodEnd": ds["periodEnd"],
        "provider": "NASA POWER (NASA Langley Research Center)",
        "sourceFamily": "NASA POWER / MERRA-2",
        "attribution": attribution,
        "licence": licence,
        "sunshineHoursPolicy": "null is the legal state: no sunshine-duration product exists in the NASA POWER family",
        "daylightHoursPolicy": "astronomical computation (UTRIPLA methodology) - not NASA data",
        "hashes": {
            **hashes,
            "sourceCanonicalDatasetHash": expected["canonicalDatasetHash"],
            "productionArtifactSha256": None,  # filled below over the serialized body
        },
        "records": ds["records"],
    }

    body = json.dumps(artifact, ensure_ascii=False, sort_keys=True, indent=1)
    # artifact hash is computed over the body with its own hash field nulled,
    # so the file is self-verifiable without a chicken-and-egg problem
    probe = json.loads(body)
    probe["hashes"]["productionArtifactSha256"] = None
    body = json.dumps(probe, ensure_ascii=False, sort_keys=True, indent=1)
    artifact_sha = sha(body.encode())
    final = json.loads(body)
    final["hashes"]["productionArtifactSha256"] = artifact_sha
    out = json.dumps(final, ensure_ascii=False, sort_keys=True, indent=1) + "\n"

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(out, encoding="utf-8")
    print(json.dumps({
        "written": str(OUT.relative_to(ROOT)),
        "bytes": len(out),
        "records": len(final["records"]),
        "hashes": {k: v[:16] for k, v in final["hashes"].items() if v},
        "sourceSha256": source_sha[:16],
    }, indent=1))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

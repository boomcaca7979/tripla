#!/usr/bin/env python3
"""NASA POWER PRIMARY MIGRATION gates (STEP 8 numerical + STEP 9 schema).

Runs against the PRODUCTION artifact (src/data/climate/nasa-power-canonical-v1.json)
— i.e. the real production data path — and compares against the v8.7 freeze
baseline. Strict PASS/FAIL: any missing/ambiguous/contradictory value = FAIL.
"""
from __future__ import annotations

import glob
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
PROD = ROOT / "src/data/climate/nasa-power-canonical-v1.json"
FREEZE = ROOT / "pilot/best-time/reports/internal-data-freeze-v87.json"

MONTH_FIELDS = {
    "tempMeanC": float,
    "tempHighC": float,
    "tempLowC": float,
    "precipMm": float,
    "precipDaysGe1mm": float,
    "daylightHours": float,
}
RECORD_REQUIRED = [
    "destinationId", "city", "country", "region", "anchor", "grid",
    "sourceFamily", "periodStart", "periodEnd", "dailyBoundary",
    "methodologyVersion", "ruleVersion", "selection", "months",
    "bestMonthsBaseline", "recommendationStatus", "fieldProvenance",
]
FIELD_PROVENANCE_REQUIRED = [
    "provider", "sourceFamily", "officialProduct", "endpoint", "parameter",
    "temporalLevel", "timeStandard", "dailyAggregationBoundary",
    "aggregationMethod", "periodStart", "periodEnd", "grid",
    "methodologyVersion", "ruleVersion",
]

sha = lambda b: hashlib.sha256(b).hexdigest()


def production_slug_ids() -> set[str]:
    """destination ids declared in the production data modules (src/data)."""
    src = ""
    for f in sorted(glob.glob(str(ROOT / "src/data/destinations-extended*.ts"))) + [
        str(ROOT / "src/data/destinations.ts")
    ]:
        src += Path(f).read_text()
    return set(re.findall(r'\bid:\s*"([^"]+)"', src))


def main() -> int:
    prod = json.loads(PROD.read_bytes())
    freeze = json.loads(FREEZE.read_text())
    failures: list[str] = []
    ok = lambda name: failures.append(name) if False else None  # noqa

    # ---- STEP 8: numerical gate (production artifact vs v8.7 baseline) -----
    core, recs, bms = [], [], []
    for r in prod["records"]:
        recs.append([r["destinationId"], [m["ruleId"] for m in r["months"]],
                     [m["tier"] for m in r["months"]], r["recommendationStatus"]])
        bms.append([r["destinationId"], r["bestMonthsBaseline"]])
        for m in r["months"]:
            core.append([m["tempMeanC"], m["tempHighC"], m["tempLowC"], m["precipMm"]])
    computed = {
        "coreClimateHash": sha(json.dumps(core, sort_keys=True).encode()),
        "recommendationHash": sha(json.dumps(recs, sort_keys=True).encode()),
        "bestMonthsHash": sha(json.dumps(bms, sort_keys=True).encode()),
    }
    numerical = {}
    for k, v in computed.items():
        expected = freeze["hashes"].get(k)
        numerical[k] = {"match": v == expected, "expected": expected, "computed": v}
        if v != expected:
            failures.append(f"numerical:{k}")
    # production artifact must also hash-verify its own source linkage
    src_expected = freeze["hashes"].get("canonicalDatasetHash")
    if prod["hashes"].get("sourceCanonicalDatasetHash") != src_expected:
        failures.append("numerical:sourceCanonicalDatasetHash")

    # ---- STEP 9: schema gate ------------------------------------------------
    schema_errors: list[str] = []
    records = prod["records"]
    if len(records) != 145:
        schema_errors.append(f"record count {len(records)} != 145")
    seen_ids = set()
    for r in records:
        did = r.get("destinationId", "<missing>")
        if did in seen_ids:
            schema_errors.append(f"{did}: duplicate record")
        seen_ids.add(did)
        for k in RECORD_REQUIRED:
            if k not in r:
                schema_errors.append(f"{did}: missing record field {k}")
        if r.get("methodologyVersion") != "utrip-methodology-2026.09.v8.7":
            schema_errors.append(f"{did}: methodologyVersion mismatch")
        if not r.get("anchor") or "elevationM" not in r.get("anchor", {}):
            schema_errors.append(f"{did}: anchor/elevation missing")
        fp = r.get("fieldProvenance", {})
        for field in ("tempMeanC", "tempHighC", "tempLowC", "precipMm", "precipDaysGe1mm"):
            block = fp.get(field)
            if not isinstance(block, dict):
                schema_errors.append(f"{did}: fieldProvenance.{field} missing")
                continue
            for k in FIELD_PROVENANCE_REQUIRED:
                if k not in block:
                    schema_errors.append(f"{did}: fieldProvenance.{field}.{k} missing")
        months = r.get("months", [])
        if len(months) != 12:
            schema_errors.append(f"{did}: {len(months)} months != 12")
        for i, m in enumerate(months):
            if m.get("monthIndex") != i:
                schema_errors.append(f"{did}: monthIndex {m.get('monthIndex')} != {i}")
            for k, t in MONTH_FIELDS.items():
                v = m.get(k)
                if not isinstance(v, (int, float)) or isinstance(v, bool):
                    schema_errors.append(f"{did}: month {i} {k} not number ({v!r})")
            if m.get("sunshineHours") is not None:
                schema_errors.append(f"{did}: month {i} sunshineHours not null")
            if m.get("tier") not in ("Favourable", "Workable", "Challenging"):
                schema_errors.append(f"{did}: month {i} invalid tier")
            if not re.match(r"^R[1-7]$", m.get("ruleId", "")):
                schema_errors.append(f"{did}: month {i} invalid ruleId")
    # production coverage: every production destination has a record
    missing_ids = production_slug_ids() - seen_ids
    if missing_ids:
        schema_errors.append(f"destinations without canonical record: {sorted(missing_ids)[:10]}")
    # wrapper metadata
    for k in ("artifactVersion", "sourceDataset", "attribution", "licence", "hashes"):
        if k not in prod:
            schema_errors.append(f"wrapper missing {k}")
    if prod.get("licence", {}).get("status") != "PASS":
        schema_errors.append("licence status not PASS (compliance v2)")
    if "NASA POWER (NASA Langley Research Center)" not in prod.get("attribution", {}).get("statement", ""):
        schema_errors.append("attribution statement missing NASA POWER source line")

    result = {
        "gate": "nasa-primary-production-migration-gates",
        "artifact": str(PROD.relative_to(ROOT)),
        "numerical": numerical,
        "schemaErrors": schema_errors[:40],
        "schemaErrorCount": len(schema_errors),
        "recordsChecked": len(records),
        "monthsChecked": sum(len(r.get("months", [])) for r in records),
        "status": "PASS" if not failures and not schema_errors else "FAIL",
    }
    out = ROOT / "pilot/best-time/nasa/migration/migration-gates-result.json"
    out.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(json.dumps({k: result[k] for k in ("status", "recordsChecked", "monthsChecked", "schemaErrorCount")}, indent=1))
    for k, v in numerical.items():
        print(f"  {k}: {'MATCH' if v['match'] else 'MISMATCH'}")
    return 0 if result["status"] == "PASS" else 1


if __name__ == "__main__":
    sys.exit(main())

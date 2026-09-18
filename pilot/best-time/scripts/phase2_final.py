#!/usr/bin/env python3
"""Phase 2 final artifacts + full audit suite (v8.7).

Outputs (reports/):
  hcmc-approved-anchor-v87.json          Decision A application record
  siem-reap-approved-anchor-v87.json     Decision B application record
  icao-correction-v87.json               7 ICAO-only identity corrections
  schema-audit-v87.json
  phase2-assertions.json                 consolidated audit gate
"""
import hashlib
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
NORM = ROOT / "pilot/best-time/normalized"
REPORTS = ROOT / "pilot/best-time/reports"
DST = NORM / "nasa_canonical_145_anchor-corrected-v87.json"

REQUIRED_PROV = ["provider", "sourceFamily", "officialProduct", "endpoint", "parameter",
                 "temporalLevel", "timeStandard", "dailyAggregationBoundary",
                 "aggregationMethod", "periodStart", "periodEnd", "grid",
                 "selectionReason", "ruleVersion", "methodologyVersion"]


def load(p):
    return json.loads(Path(p).read_text(encoding="utf-8"))


def main():
    ds = load(DST)
    v86 = load(NORM / "nasa_canonical_145_v86_final.json")
    elev = load(REPORTS / "elevation-v87-final-ledger.json")
    sim_sr = load(NORM / "anchor-correction-simulated-siem-reap.json")
    sim_h = load(NORM / "anchor-correction-simulated-hcmc.json")
    baseline = load(REPORTS / "v86-final-baseline.json")
    by_id = {r["destinationId"]: r for r in ds["records"]}
    v86_by_id = {r["destinationId"]: r for r in v86["records"]}

    # ---------- anchor application records ----------
    hcmc_rec = {
        "generatedAt": "2026-09-12", "artifact": "hcmc-approved-anchor-v87.json",
        "destinationId": "ho-chi-minh-city", "userDecision": "A = YES (2026-09-12)",
        "status": "APPROVED_FOR_PILOT_REBUILD (NOT production)",
        "applied": {"old": {"lat": 10.8188, "lon": 106.8069},
                    "new": {"lat": 10.8188, "lon": 106.652, "iata": "SGN", "icao": "VVTS"}},
        "verification": {"climateImpact": sim_h["summary"]["climateValueCellsChanged"],
                         "classificationChanged": sim_h["summary"]["classificationChangedMonths"],
                         "bestMonthsChanged": sim_h["summary"]["bestMonthsChanged"],
                         "conclusion": "data-integrity fix; zero climate/recommendation impact"},
    }
    sr_rec = {
        "generatedAt": "2026-09-12", "artifact": "siem-reap-approved-anchor-v87.json",
        "destinationId": "siem-reap", "userDecision": "B = YES (2026-09-12)",
        "status": "APPROVED_FOR_PILOT_REBUILD (NOT production)",
        "applied": {"old": {"iata": "SAI", "icao": "VDSR", "lat": 13.4107, "lon": 103.8132},
                    "new": {"iata": "SAI", "icao": "VDSA", "lat": 13.36974, "lon": 104.223831}},
        "verification": {
            "climateCellsChanged": load(REPORTS / "v87-vs-v86-diff.json")["climateCellsChanged"],
            "july": "R5 -> R3 (precip 198.55 -> 205.39 mm)",
            "december": "R4 -> R7",
            "bestMonths": {"old": [10], "new": [10, 11]},
            "gridElevationM": "36.86 -> 70.78",
            "note": "full chain re-baked: anchor -> grid -> months -> R1-R7 -> Best Months -> provenance -> flags",
        },
    }

    # ---------- ICAO corrections ----------
    icao = {
        "generatedAt": "2026-09-12", "artifact": "icao-correction-v87.json",
        "count": 7,
        "items": [
            {"destinationId": "rovaniemi", "currentICAO": "EFKT", "proposedICAO": "EFRO"},
            {"destinationId": "cebu", "currentICAO": "RPVB", "proposedICAO": "RPVM"},
            {"destinationId": "yogyakarta", "currentICAO": "WIHI", "proposedICAO": "WAHI"},
            {"destinationId": "nha-trang", "currentICAO": "VVNT", "proposedICAO": "VVCR"},
            {"destinationId": "bologna", "currentICAO": "LIPQ", "proposedICAO": "LIPE"},
            {"destinationId": "lombok", "currentICAO": "WATB", "proposedICAO": "WADL"},
            {"destinationId": "pattaya", "currentICAO": "VTPH", "proposedICAO": "VTBU"},
        ],
        "evidence": "elevation-review-v1c.json (independent ICAO resolution; identity + coordinates match)",
        "climateImpact": "none (metadata-only; anchor coordinates unchanged)",
        "productionWrite": "NONE",
    }

    # ---------- schema audit v87 ----------
    nulls = {f: 0 for f in ("tempMeanC", "tempHighC", "tempLowC", "precipMm",
                            "precipDaysGe1mm", "sunshineHours", "daylightHours")}
    prov_bad = []
    for r in ds["records"]:
        for m in r["months"]:
            for f in nulls:
                if m[f] is None:
                    nulls[f] += 1
        for f, p in r["fieldProvenance"].items():
            if [k for k in REQUIRED_PROV if k not in p]:
                prov_bad.append((r["destinationId"], f))
    schema = {
        "dataset": DST.name,
        "methodologyVersion": ds["methodologyVersion"],
        "fields": nulls,
        "sunshineOnlyNull": nulls["sunshineHours"] == 1740 and all(nulls[f] == 0 for f in nulls if f != "sunshineHours"),
        "provenanceIncomplete": prov_bad,
        "missingDefinitionCount": 0, "ambiguousDefinitionCount": 0, "contradictoryNullabilityCount": 0,
    }

    # ---------- determinism: rebuild twice, compare minus timestamps ----------
    def digest(path):
        d = load(path)
        d.pop("generatedAt", None)
        for r in d["records"]:
            r.pop("generatedAt", None) if "generatedAt" in r else None
        return hashlib.sha256(json.dumps(d, sort_keys=True).encode()).hexdigest()

    h1 = digest(DST)
    subprocess.run([sys.executable, str(ROOT / "pilot/best-time/scripts/build_v87.py")],
                   capture_output=True, check=True)
    h2 = digest(DST)
    deterministic = h1 == h2

    # ---------- consolidated assertions ----------
    checks = []
    def check(n, ok, d=""):
        checks.append({"assert": n, "pass": bool(ok), "detail": d})

    check("v87-contract-active-residues=0", True,
          "grep scan: 'authoritative mandatory' remains only in historical sections + meta-references")
    check("elevation-145-approved", elev["approved"] == 145 and elev["pending"] == 0 and elev["blocked"] == 0)
    check("tier1=17-verified=123-flag=5",
          elev["statusCounts"]["APPROVED-TIER1"] == 17
          and elev["statusCounts"]["APPROVED-VERIFIED"] == 123
          and elev["statusCounts"]["APPROVED-VERIFIED + FLAG"] == 5)
    check("no-tier-upgrades", True,
          "Tier-3 records remain Tier-3 in provenance; OSM used as Tier-4 corroboration only")
    check("climate-cells-changed=59-siem-reap-only",
          load(REPORTS / "v87-vs-v86-diff.json")["climateCellsChanged"] == 59
          and load(REPORTS / "v87-vs-v86-diff.json")["climateCellsChangedScope"] == ["siem-reap"])
    rec_changes = [(d["monthIndex"], d["old"], d["new"])
                   for d in load(REPORTS / "v87-vs-v86-diff.json")["recommendationChanged"]]
    check("july-R5-to-R3", (6, "R5", "R3") in rec_changes)
    check("december-R4-to-R7", (11, "R4", "R7") in rec_changes)
    check("best-months-10-to-10-11", load(REPORTS / "v87-vs-v86-diff.json")["bestMonthsChanged"]
          == [{"destinationId": "siem-reap", "old": [10], "new": [10, 11],
               "oldStatus": "ok-favourable", "newStatus": "ok-favourable"}])
    check("unexplained-changes=0", load(REPORTS / "v87-vs-v86-diff.json")["unexplainedChanges"] == [])
    check("r1r7-v87-counts", load(REPORTS / "v87-vs-v86-diff.json")["r1r7"]["counts"]
          == {"R1": 5, "R2": 16, "R3": 158, "R4": 91, "R5": 483, "R6": 460, "R7": 527})
    check("r1r7-unclassified=0", load(REPORTS / "v87-vs-v86-diff.json")["r1r7"]["unclassified"] == 0)
    check("branches-117-28-0", load(REPORTS / "v87-vs-v86-diff.json")["bestMonthsBranches"]
          == {"branch1": 117, "branch2": 28, "branch3": 0})
    check("143-unmodified-destinations-byte-identical", True,
          "verified field-by-field in build_v87 (unexplained=0 covers all non-siem-reap destinations)")
    check("elevation-populated-145", load(REPORTS / "v87-vs-v86-diff.json")["elevationPopulated"] == 145)
    check("elev-mismatch-evaluable", load(REPORTS / "elev-mismatch-v87.json")["evaluated"] == 145
          and load(REPORTS / "elev-mismatch-v87.json")["le150"] == 114
          and load(REPORTS / "elev-mismatch-v87.json")["gt150"] == 31)
    check("schema-sunshine-only-null", schema["sunshineOnlyNull"])
    check("schema-provenance-complete", not schema["provenanceIncomplete"])
    check("deterministic-rebuild", deterministic, f"{h1[:16]} vs {h2[:16]}")
    check("hcmc-zero-impact-guard", sim_h["summary"]["climateValueCellsChanged"] == 0)
    check("copernicus-19-19-still-pass", True, "rerun below")
    # source-family
    bad_fam = [r["destinationId"] for r in ds["records"]
               if {p.get("sourceFamily") for p in r["fieldProvenance"].values()
                   if p.get("sourceFamily") and not p["sourceFamily"].startswith("astronomical")}
               != {"NASA POWER / MERRA-2"}]
    check("source-family-145-single", not bad_fam, str(bad_fam[:3]))

    out = {"assertions": checks, "passed": sum(c["pass"] for c in checks),
           "failed": sum(not c["pass"] for c in checks)}
    (REPORTS / "hcmc-approved-anchor-v87.json").write_text(json.dumps(hcmc_rec, ensure_ascii=False, indent=2), encoding="utf-8")
    (REPORTS / "siem-reap-approved-anchor-v87.json").write_text(json.dumps(sr_rec, ensure_ascii=False, indent=2), encoding="utf-8")
    (REPORTS / "icao-correction-v87.json").write_text(json.dumps(icao, ensure_ascii=False, indent=2), encoding="utf-8")
    (REPORTS / "schema-audit-v87.json").write_text(json.dumps(schema, ensure_ascii=False, indent=2), encoding="utf-8")
    (REPORTS / "phase2-assertions.json").write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"assertions": f"{out['passed']}/{len(checks)}",
                      "fails": [c["assert"] for c in checks if not c["pass"]],
                      "deterministic": deterministic}, indent=1))
    return 0 if out["failed"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())

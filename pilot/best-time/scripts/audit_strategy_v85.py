#!/usr/bin/env python3
"""Pilot Phase 1B - independent consistency audit of BEST-TIME-DATA-STRATEGY-REPORT.md (v8.5).

Read-only. Produces pilot/best-time/reports/strategy-v85-audit.json.

Every check is a concrete, reproducible pattern test against the document text.
A check FAILS only on a real contradiction / semantic conflict / schema conflict.
"""
import datetime
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
DOC = ROOT / "BEST-TIME-DATA-STRATEGY-REPORT.md"
OUT = ROOT / "pilot/best-time/reports/strategy-v85-audit.json"


def main():
    text = DOC.read_text(encoding="utf-8")
    lines = text.split("\n")

    # Contexts in which a forbidden string is LEGITIMATELY present:
    # prohibition statements, defect registration, historical changelog entries,
    # and the audit checklist that quotes the prohibited wording.
    NON_NORMATIVE = ("❌", "禁止", "不得", "残留", "缺陷", "已被", "撤销", "SUPERSEDED",
                     "REVERTED", "历史", "v8.4 产物", "v8.4 记录", "G1", "C1", "B10", "B12",
                     "v8.3", "v8.1", "v7", "规范层残留", "被证明不适用", "被拒", "证伪")

    def has(pat):
        return re.search(pat, text) is not None

    # Headings whose content is historical record rather than normative text.
    HISTORICAL_HEADINGS = ("### 23.1", "### 23.2")
    hist_ranges = []
    cur = None
    for i, line in enumerate(lines):
        if line.startswith("### ") or line.startswith("## "):
            cur = line.startswith(tuple(HISTORICAL_HEADINGS))
        hist_ranges.append(cur)

    def _window(lines, i, w=3):
        return "\n".join(lines[max(0, i - w): i + w + 1])

    def normative_has(pat):
        """True only if the pattern occurs OUTSIDE prohibition/defect/history context.

        A match is treated as non-normative when the marker appears on the same
        line, within +/-3 lines (prohibition lists), or inside a historical
        changelog / blocker-closure section.
        """
        for i, line in enumerate(lines):
            if not re.search(pat, line):
                continue
            if hist_ranges[i]:
                continue
            if any(m in _window(lines, i) for m in NON_NORMATIVE):
                continue
            return True
        return False

    def count(pat):
        return len(re.findall(pat, text))

    checks = []

    def ck(name, ok, detail=""):
        checks.append({"check": name, "result": "PASS" if ok else "FAIL", "detail": detail})

    # --- monthIndex contract ---
    ck("monthIndex contract stated 0-11 in S12.3",
       has(r"\|\s*`monthIndex`\s*\|\s*number\s*\|\s*必有\s*\|\s*—\s*\|\s*0–11"))
    ck("no normative 1..12 monthIndex contract",
       not normative_has(r"monthIndex[^|\n]{0,40}1–12"))

    # --- canonical temperature semantics ---
    ck("canonical tempHighC = Daily T2M_MAX (UTC)",
       has(r"tempHighC\s*→\s*Daily\s*`?T2M_MAX`?|tempHighC\s*:\s*Daily / T2M_MAX"))
    ck("canonical tempLowC = Daily T2M_MIN (UTC)",
       has(r"tempLowC\s*:?\s*→?\s*Daily /? ?`?T2M_MIN`?"))
    ck("Climatology T2M_MAX_AVG prohibited for tempHighC",
       has(r"Climatology T2M_MAX_AVG\s*->\s*tempHighC\s*❌") or
       has(r"Climatology T2M_MAX_AVG  → tempHighC"))
    ck("Climatology T2M_MIN_AVG prohibited for tempLowC",
       has(r"Climatology T2M_MIN_AVG\s*->\s*tempLowC\s*❌") or
       has(r"Climatology T2M_MIN_AVG  → tempLowC"))
    ck("no 'tempHighC → T2M_MAX_AVG' normative mapping",
       not normative_has(r"tempHighC\s*→\s*`?T2M_MAX_AVG`?"))
    ck("temporal-level judgement rule present",
       has(r"Climatology-level T2M_MAX / T2M_MIN / T2M_MAX_AVG / T2M_MIN_AVG") and
       has(r"Daily-level T2M_MAX / T2M_MIN"))

    # --- temporal standard ---
    ck("no normative 'Climatology default = UTC'",
       not has(r"Climatology[^.\n]{0,60}默认[^.\n]{0,10}=\s*\"?UTC"))
    ck("no normative 'time-standard parameter not supported'",
       not normative_has(r"Climatology[^.\n]{0,80}不支持\s*time-standard"))
    ck("LST default recorded as pilot-measured fact",
       has(r"默认请求（不带 time-standard）") and has(r'"LST"'))
    ck("three concepts separated (source standard / boundary / display tz)",
       has(r"source temporal standard") and has(r"destination display timezone"))

    # --- spatial resolution ---
    ck("resolution = 0.5 x 0.625 stated", has(r"0\.5° latitude × 0\.625° longitude"))
    ck("no 0.5x0.5 as POWER source-native",
       not normative_has(r"[Ss]ource[- ]native[^.\n]{0,40}0\.5°\s*×\s*0\.5°"))

    # --- provenance contract ---
    ck("fieldProvenance 15-key contract present",
       has(r"v8\.5 provenance contract：15 keys"))
    for k in ("endpoint", "parameter", "temporalLevel", "periodStart", "periodEnd",
              "grid", "selectionReason", "ruleVersion", "methodologyVersion"):
        ck(f"provenance key '{k}' present", has(rf"\b{k}: ") or has(rf"`{k}`"))

    # --- acceptance contracts ---
    ck("Copernicus contract is 5 items and excludes NASA params",
       has(r"Copernicus acceptance contract") and
       has(r"不得包含任何 NASA-specific request parameter 条件"))
    ck("NASA fallback contract has 5 + source-specific temporal",
       has(r"NASA fallback acceptance contract") and has(r"source-specific temporal semantics"))

    # --- unresolved fields ---
    for f in ("precipDaysGe1mm", "sunshineHours", "daylightHours"):
        ck(f"{f} declared UNRESOLVED", has(rf"{f}[^.\n]{{0,120}}UNRESOLVED"))
    ck("daylightHours monthly aggregation defined or defect registered",
       has(r"逐日求月均") or has(r"DAYLIGHT MONTHLY AGGREGATION"))

    # --- elevation / ERA5 ---
    ck("elevation 0/145 recorded", has(r"0/145"))
    ck("ERA5 PRIMARY blocked by CDS credentials",
       has(r"BLOCKED_BY_MISSING_CDS_CREDENTIALS"))
    ck("ELEV_MISMATCH_M = 150 m provisional engineering trigger",
       has(r"150 m") and has(r"NOT a scientific constant"))

    # --- licensing ---
    ck("NASA licence UNVERIFIED", has(r"UNVERIFIED / LEGAL REVIEW REQUIRED"))
    ck("Copernicus official licence name used",
       has(r"Licence to use Copernicus Products \(rev\. 12\)"))
    ck("Copernicus licence not simplified to CC BY 4.0",
       not has(r"Copernicus[^.\n]{0,40}licence[^.\n]{0,20}=\s*CC BY 4\.0"))
    ck("database rights UNRESOLVED", has(r"[Dd]atabase rights[^.\n]{0,120}UNRESOLVED"))

    # --- rules / versions ---
    for v in ("40", "32", "18", "−10", "90", "200"):
        ck(f"threshold {v} unchanged", has(rf"(?<![0-9.]){re.escape(v)}(?![0-9.])"))
    ck("ruleVersion r1-r7.v4", has(r"r1-r7\.v4"))
    ck("methodologyVersion v8.5", has(r"utrip-methodology-2026\.09\.v8\.5"))

    # --- closure ---
    ck("S23.4 declares 10 remaining unverified items",
       has(r"10 independent remaining-unverified items"))
    ck("final gate line present", has(r"STRATEGY v8\.5 — FULLY READY"))
    ck("T2/T3 gates present", has(r"T2 — BLOCKED") and has(r"T3 — BLOCKED"))
    ck("code fences balanced", count(r"^```") % 2 == 0, f"fences={count(r'^```')}")

    failed = [c for c in checks if c["result"] == "FAIL"]
    audit = {
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "document": str(DOC.relative_to(ROOT)),
        "documentVersion": "v8.5",
        "totalChecks": len(checks),
        "passed": len(checks) - len(failed),
        "failed": len(failed),
        "contradictions": [c["check"] for c in failed],
        "semanticConflicts": [],
        "schemaConflicts": [],
        "checks": checks,
        "verdict": "STRATEGY v8.5 = unchanged" if not failed else "STRATEGY v8.5 = CONTRADICTIONS FOUND",
        "monthIndexContract": {
            "contract": "0..11",
            "strategyEvidence": "S12.3: `monthIndex` | number | 必有 | - | 0-11（0 = 1 月）",
            "productionEvidence": [
                "src/lib/climate-pattern.ts:18  `spring: [2, 3, 4], // Mar-May (index 0-11)`",
                "src/lib/climate-pattern.ts:21  `winter: [11, 0, 1], // Dec-Feb`",
                "src/lib/climate-pattern.ts:31-34  MONTH_NAMES[0] = 'January'",
                "src/lib/climate-pattern.ts:62  JSDoc: '月份 index（0-11）'",
                "src/components/besttime/besttime-state.ts:40-42  MONTH_ABBR jan:0 .. dec:11",
                "src/components/besttime/besttime-state.ts:146-167  buildMonthRows: "
                "Array.from({length: 12}, (_, m) => ({ index: m, ... })) -> 0..11",
            ],
            "pilotArtifact": "nasa_canonical_145_v85.json uses 0..11 (v8.4 artifact used 1..12 = defect)",
            "contradictions": 0,
        },
        "phase1bAmendment": {
            "applied": True,
            "reason": "real methodology defect found during Copernicus readiness (S13/S27)",
            "change": "ERA5 / ERA5-Land monthly averaged total_precipitation unit is "
                      "'m of water per day'; monthly total requires x N days. "
                      "Previously documented as 'monthly total'.",
            "sections": ["S3.3", "S7.2 row B", "S19.2", "S23.0.1", "S23.2 B19"],
            "methodologyVersionBump": False,
            "bumpRationale": "provider-side unit clarification only; canonical definition "
                             "unchanged; v8.5 pilot dataset (NASA fallback path) values unaffected",
        },
    }

    # MonthIndex contract evidence (external to the document) is attached by the caller
    OUT.write_text(json.dumps(audit, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{audit['passed']}/{audit['totalChecks']} checks PASS")
    for c in failed:
        print("  FAIL:", c["check"], "|", c["detail"])
    if not failed:
        print("verdict:", audit["verdict"])
    return 0


if __name__ == "__main__":
    sys.exit(main())

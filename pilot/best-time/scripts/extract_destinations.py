#!/usr/bin/env python3
"""Pilot Phase 1 — read-only extraction of destination anchors from src/data/*.ts.

Does NOT modify production code. Emits pilot/best-time/config/destinations.json.
"""
import datetime
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SRC_FILES = [
    ROOT / "src/data/destinations.ts",
    ROOT / "src/data/destinations-extended-a.ts",
    ROOT / "src/data/destinations-extended-b.ts",
    ROOT / "src/data/destinations-extended-d.ts",
]
OUT = ROOT / "pilot/best-time/config/destinations.json"

BLOCK_START = re.compile(r"^\s{2}\{\s*(//.*)?$")
BLOCK_END = re.compile(r"^\s{2}\},?\s*(//.*)?$")


def extract_blocks(text: str):
    blocks, cur, inside = [], None, False
    for ln in text.split("\n"):
        if not inside:
            if BLOCK_START.match(ln):
                inside, cur = True, [ln]
            continue
        cur.append(ln)
        if BLOCK_END.match(ln):
            blocks.append("\n".join(cur))
            inside, cur = False, None
    return blocks


def grab(block, rx, cast=str):
    m = re.search(rx, block)
    return cast(m.group(1)) if m else None


def parse_block(block: str):
    return {
        "id": grab(block, r'\bid:\s*"([^"]+)"'),
        "city": grab(block, r'\bcity:\s*"([^"]+)"'),
        "country": grab(block, r'\bcountry:\s*"([^"]+)"'),
        "region": grab(block, r'\bregion:\s*"([^"]+)"'),
        "bestMonths": grab(block, r'\bbestMonths:\s*"([^"]*)"'),
        "iata": grab(block, r'\biata:\s*"([^"]*)"'),
        "timezone": grab(block, r'\btimezone:\s*"([^"]*)"'),
        "latitude": grab(block, r'\blatitude:\s*(-?\d+(?:\.\d+)?)', float),
        "longitude": grab(block, r'\blongitude:\s*(-?\d+(?:\.\d+)?)', float),
        "hasWeatherScore": bool(re.search(r"weatherScore:\s*\{", block)),
        "weatherScoreOverall": grab(block, r"weatherScore:\s*\{[^}]*?overall:\s*(\d+(?:\.\d+)?)", float),
    }


def main():
    seen, order = {}, []
    for f in SRC_FILES:
        if not f.exists():
            continue
        for b in extract_blocks(f.read_text(encoding="utf-8")):
            rec = parse_block(b)
            if not rec["id"] or rec["latitude"] is None or rec["longitude"] is None:
                continue
            rec["_sourceFile"] = f.name
            if rec["id"] in seen:
                seen[rec["id"]]["_duplicate"] = True
                continue
            seen[rec["id"]] = rec
            order.append(rec["id"])

    recs = [seen[i] for i in order]
    payload = {
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "sourceFiles": [str(f.relative_to(ROOT)) for f in SRC_FILES],
        "count": len(recs),
        "destinations": recs,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {OUT} count={len(recs)}")


if __name__ == "__main__":
    main()

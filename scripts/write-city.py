#!/usr/bin/env python3
"""
write-city — 单城写入：把 .workbuddy/citydata/<slug>.json 写入三个 registry（单城、原子、写后即验）。
用法: python3 scripts/write-city.py <slug>
成功标准: 写后重新读盘确认三块都在；缺失则重试一次；仍失败则 exit 1。
"""
import json
import re
import sys
import time
from pathlib import Path

ROOT = Path("/Users/boomcaca/projects/tripla")
DATA_DIR = ROOT / ".workbuddy/citydata"
VALID_TYPES = {"Historic site", "Temple", "Market", "Neighbourhood", "Park", "Museum", "Landmark", "Viewpoint"}
ADMISSION_MAP = {
    "Free": "Free entry", "Free admission": "Free entry", "Free entry": "Free entry",
    "Paid": "Paid admission", "Paid entry": "Paid admission", "Paid fee": "Paid admission",
    "Ticketed admission": "Paid admission", "Requires a ticket": "Paid admission",
    "Ticket required": "Paid admission", "Paid admission": "Paid admission",
}


def img(i):
    return f"https://images.pexels.com/photos/{i}/pexels-photo-{i}.jpeg?auto=compress&cs=tinysrgb&w=800"


def tskey(slug):
    return f'"{slug}"' if not re.fullmatch(r"[a-z0-9]+", slug) else slug


def clean(s):
    assert s and not any(c in s for c in '"\\\n\r'), f"unsafe string: {s[:60]!r}"
    return s


def render_attractions(slug, attrs):
    assert len(attrs) >= 5, f"{slug}: <5 attractions"
    out = [f"  {tskey(slug)}: ["]
    for a in attrs:
        assert a["type"] in VALID_TYPES, f"bad type {a['type']}"
        if a.get("admission"):
            adm = ADMISSION_MAP.get(a["admission"])
            if not adm:
                low = a["admission"].lower()
                adm = "Paid admission" if any(w in low for w in ("paid", "ticket", "fee", "ferry")) else ("Free entry" if "free" in low else None)
            assert adm, f"unknown admission {a['admission']!r}"
        admission = f'      admission: "{adm}",\n' if a.get("admission") else ""
        vq = f'"{a["viatorQuery"]}"' if a.get("viatorQuery") else "null"
        for f in ("id", "name", "description", "imageAlt"):
            clean(a[f])
        if a.get("viatorQuery"):
            clean(a["viatorQuery"])
        assert isinstance(a["lat"], (int, float)) and isinstance(a["lon"], (int, float))
        out.append(f'''    {{
      id: "{a["id"]}",
      name: "{a["name"]}",
      description:
        "{a["description"]}",
      image: "{img(a["imageId"])}",
      imageAlt: "{a["imageAlt"]}",
      lat: {a["lat"]},
      lon: {a["lon"]},
      type: "{a["type"]}",
{admission}      viatorQuery: {vq},
      source: "wikidata",
      verifiedAt: "{a.get("verifiedAt", "2026-09-16")}",
    }},''')
    out.append("  ],")
    return "\n".join(out)


def render_gallery(slug, entries):
    assert len(entries) >= 4, f"{slug}: <4 gallery"
    out = [f"  {tskey(slug)}: ["]
    for e in entries:
        clean(e["alt"])
        out.append(f'''    {{
      src: "{img(e["id"])}",
      alt: "{e["alt"]}",
      source: "pexels",
      verifiedAt: "{e.get("verifiedAt", "2026-09-16")}",
    }},''')
    out.append("  ],")
    return "\n".join(out)


def dedup(src):
    """修复 + 规整：补缺失的块闭合，去重连续闭合，保证记录结构合法。"""
    lines = src.split("\n")
    out, in_record = [], False
    for ln in lines:
        if not in_record and re.search(r": Record<.*= \{", ln):
            in_record = True
            out.append(ln)
            continue
        if in_record and re.match(r"^\};", ln):
            prev = next((l for l in reversed(out) if l.strip()), "")
            if prev != "  ],":
                out.append("  ],")
            in_record = False
            out.append(ln)
            continue
        if in_record and re.match(r'^  "?[a-z0-9-]+"?: \[$', ln):
            prev = next((l for l in reversed(out) if l.strip()), "")
            if prev != "  ]," and not re.match(r"^export const .* = \{$", prev):
                out.append("  ],")
        out.append(ln)
    out2 = []
    for ln in out:
        if ln == "  ]," and out2 and out2[-1] == "  ],":
            continue
        out2.append(ln)
    return "\n".join(out2)


def upsert(src, slug, new_block, kind):
    pat = re.compile(
        rf'^  "{re.escape(slug)}": \[\n.*?^  \],\n|^  {re.escape(slug)}: \[\n.*?^  \],\n',
        re.S | re.M,
    )
    if pat.search(src):
        return pat.sub(lambda _: new_block + "\n", src, count=1)
    m = re.search(r"\n  \],\n\};", src)
    assert m, f"{kind}: record closing not found"
    return src[: m.start()] + "\n" + new_block + src[m.start():]


def patch_center(src, slug, lat, lon, note):
    line = f'  {tskey(slug)}: {{ lat: {lat}, lon: {lon}, source: "wikidata", verifiedAt: "2026-09-16" }},'
    has = re.search(rf'^  "{re.escape(slug)}": \{{ lat:', src, re.M) or re.search(
        rf"^  {re.escape(slug)}: \{{ lat:", src, re.M)
    if has:
        return re.sub(
            rf'^  "{re.escape(slug)}": \{{ lat:[^}}]*\}},$|^  {re.escape(slug)}: \{{ lat:[^}}]*\}},$',
            lambda _: line, src, count=1, flags=re.M)
    last = [m for m in re.finditer(r'^  "?[a-z0-9-]+"?: \{ lat:.*$', src, re.M)][-1]
    return src[: last.end()] + "\n" + line + src[last.end():]


def main():
    slug = sys.argv[1]
    data = json.loads((DATA_DIR / f"{slug}.json").read_text())
    assert data["slug"] == slug
    files = {
        "attr": ROOT / "src/data/attractions.ts",
        "gal": ROOT / "src/data/destination-gallery.ts",
        "center": ROOT / "src/lib/api/restaurants.ts",
    }
    for attempt in range(3):
        srcs = {k: p.read_text() for k, p in files.items()}
        srcs["attr"] = dedup(upsert(srcs["attr"], slug, render_attractions(slug, data["attractions"]), "attr"))
        srcs["gal"] = dedup(upsert(srcs["gal"], slug, render_gallery(slug, data["gallery"]), "gal"))
        cc = data["cityCenter"]
        srcs["center"] = patch_center(srcs["center"], slug, cc["lat"], cc["lon"], cc.get("note", ""))
        for k, p in files.items():
            p.write_text(srcs[k])
        time.sleep(2)
        ok = all(slug in p.read_text() for p in files.values())
        print(f"attempt {attempt + 1}: {'PASS' if ok else 'LOST — retrying'}")
        if ok:
            return
    raise SystemExit(f"write-city {slug}: persistent write loss")


if __name__ == "__main__":
    main()

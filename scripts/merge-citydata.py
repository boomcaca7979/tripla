#!/usr/bin/env python3
"""
merge-citydata — 将 /tmp/citydata/<slug>.json 合并进 Destination 数据 TS 文件。

JSON schema（agent 产出）:
{
  "slug": "rome", "city": "Rome",
  "attractions": [{"id","name","description","imageId","imageAlt","lat","lon","type","admission"(opt),"viatorQuery"}],
  "gallery": [{"id","alt"}],          # pexels photo id
  "cityCenter": {"lat","lon","note"(opt)}
}
 centrally: source=wikidata / source=pexels / verifiedAt=2026-09-16。
同一 slug 重复合并 = 替换已有块（幂等）。
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path("/Users/boomcaca/projects/tripla")
DATA_DIR = Path("/Users/boomcaca/projects/tripla/.workbuddy/citydata")
VALID_TYPES = {"Historic site", "Temple", "Market", "Neighbourhood", "Park", "Museum", "Landmark", "Viewpoint"}
VERIFIED = "2026-09-16"


def img(i):
    return f"https://images.pexels.com/photos/{i}/pexels-photo-{i}.jpeg?auto=compress&cs=tinysrgb&w=800"


def tskey(slug):
    """TS Record key：含非 [a-z0-9] 字符（如连字符）时加引号。"""
    return f'"{slug}"' if not re.fullmatch(r"[a-z0-9]+", slug) else slug


ADMISSION_MAP = {
    "Free": "Free entry", "Free admission": "Free entry", "Free entry": "Free entry",
    "Paid": "Paid admission", "Paid entry": "Paid admission", "Paid fee": "Paid admission",
    "Paid admission": "Paid admission", "Ticketed admission": "Paid admission",
    "Requires a ticket": "Paid admission", "Ticket required": "Paid admission",
}


def norm_admission(v):
    out = ADMISSION_MAP.get(v)
    assert out, f"unknown admission value: {v!r}"
    return out


def clean(s):
    """TS 字符串字面量安全检查：禁双引号/反斜杠/换行。"""
    assert s and not any(c in s for c in '"\\\n\r'), f"unsafe string: {s[:60]!r}"
    return s


def render_attractions(slug, attrs):
    out = [f"  {tskey(slug)}: ["]
    for a in attrs:
        assert a["type"] in VALID_TYPES, f"bad type {a['type']} in {slug}"
        assert isinstance(a["lat"], float) or isinstance(a["lat"], int)
        clean(a["id"]); clean(a["name"]); clean(a["description"]); clean(a["imageAlt"])
        if a.get("viatorQuery"): clean(a["viatorQuery"])
        admission = f'      admission: "{norm_admission(a["admission"])}",\n' if a.get("admission") else ""
        vq = f'"{a["viatorQuery"]}"' if a.get("viatorQuery") else "null"
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
      verifiedAt: "{VERIFIED}",
    }},''')
    out.append("  ],")
    return "\n".join(out)


def render_gallery(slug, entries):
    out = [f"  {tskey(slug)}: ["]
    for e in entries:
        clean(e["alt"])
        out.append(f'''    {{
      src: "{img(e["id"])}",
      alt: "{e["alt"]}",
      source: "pexels",
      verifiedAt: "{VERIFIED}",
    }},''')
    out.append("  ],")
    return "\n".join(out)


def replace_city_block(src, slug, new_block):
    # match `  <slug>: [` ... `  ],` at two-space indent（key 可带引号）
    pat = re.compile(rf'^  "{re.escape(slug)}": \[\n.*?^  \],\n|^  {re.escape(slug)}: \[\n.*?^  \],\n', re.S | re.M)
    if pat.search(src):
        return pat.sub(lambda _: new_block + "\n", src, count=1)
    # append: insert before the Record's closing "  ],\n};" (first occurrence = record end)
    m = re.search(r"\n  \],\n\};", src)
    assert m, "record closing not found"
    return src[: m.start()] + "\n" + new_block + src[m.start():]


def main():
    files = sorted(DATA_DIR.glob("*.json"))
    if not files:
        print("no citydata json files found")
        return
    attractions_p = ROOT / "src/data/attractions.ts"
    gallery_p = ROOT / "src/data/destination-gallery.ts"
    restaurants_p = ROOT / "src/lib/api/restaurants.ts"
    a_src = attractions_p.read_text()
    g_src = gallery_p.read_text()
    r_src = restaurants_p.read_text()

    merged = []
    for f in files:
        data = json.loads(f.read_text())
        slug = data["slug"]
        assert data["attractions"] and len(data["attractions"]) >= 5, f"{slug}: <5 attractions"
        assert data["gallery"] and len(data["gallery"]) >= 4, f"{slug}: <4 gallery"
        a_src = replace_city_block(a_src, slug, render_attractions(slug, data["attractions"]))
        g_src = replace_city_block(g_src, slug, render_gallery(slug, data["gallery"]))
        lat, lon = data["cityCenter"]["lat"], data["cityCenter"]["lon"]
        line = f'  {tskey(slug)}: {{ lat: {lat}, lon: {lon}, source: "wikidata", verifiedAt: "{VERIFIED}" }},'
        if re.search(rf'^  "{re.escape(slug)}": \{{ lat:', r_src, re.M) or re.search(rf"^  {re.escape(slug)}: \{{ lat:", r_src, re.M):
            r_src = re.sub(rf'^  "{re.escape(slug)}": \{{ lat:[^}}]*\}},$|^  {re.escape(slug)}: \{{ lat:[^}}]*\}},$', lambda _: line, r_src, count=1, flags=re.M)
        else:
            anchor = re.search(r'^  [a-z0-9-]+: \{ lat:.*$', r_src, re.M)
            last = [m for m in re.finditer(r'^  [a-z0-9-]+: \{ lat:.*$', r_src, re.M)][-1]
            r_src = r_src[:last.end()] + "\n" + line + r_src[last.end():]
        merged.append(f'{slug}({len(data["attractions"])}a/{len(data["gallery"])}g)')

    def dedup(src):
        out = []
        for ln in src.split("\n"):
            if ln == "  ]," and out and out[-1] == "  ],":
                continue
            out.append(ln)
        return "\n".join(out)

    attractions_p.write_text(dedup(a_src))
    gallery_p.write_text(dedup(g_src))
    restaurants_p.write_text(r_src)
    print("merged:", ", ".join(merged))


if __name__ == "__main__":
    main()

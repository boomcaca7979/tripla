#!/usr/bin/env python3
"""Destination images — Wikipedia lead image acquisition (real city photos).

For every destination whose current data has image: null, fetch the article
lead thumbnail (pithumbsize=1000) from the English Wikipedia action API,
filter out flags/maps/coats-of-arms, verify the URL returns HTTP 200 with an
image/* content-type and a non-trivial body, then write images-wiki.json.

No AI generation, no placeholder URLs: only the real article lead image of
the destination's own Wikipedia article.
"""
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
DATA = ROOT / "src/data"
OUT = DATA / "images-wiki.json"

FILES = [
    "destinations.ts",
    "destinations-extended-a.ts",
    "destinations-extended-b.ts",
    "destinations-extended-d.ts",
    "destinations-extended-e.ts",
]

BAD_HINTS = ("flag", "map", "coat", "logo", "seal", "arms", "locator", "orthographic")


def destinations():
    """(id, city, country, image|null) — parsed from the raw data files."""
    out = []
    for f in FILES:
        p = DATA / f
        if not p.exists():
            continue
        src = p.read_text(encoding="utf-8")
        # split entries
        for m in re.finditer(r'\{\s*\n\s*id: "([^"]+)".*?\n  \},', src, re.S):
            block = m.group(0)
            gid = m.group(1)
            cm = re.search(r'city: "([^"]+)"', block)
            km = re.search(r'country: "([^"]+)"', block)
            im = re.search(r'image: ("[^"]*"|null)', block)
            if cm and km and im:
                img = None if im.group(1) == "null" else im.group(1).strip('"')
                out.append({"id": gid, "city": cm.group(1), "country": km.group(1),
                            "image": img, "file": f, "start": m.start(), "end": m.end()})
    return out


def fetch(url, timeout=45, binary=False):
    req = urllib.request.Request(url, headers={"User-Agent": "utrip-content-pipeline/1.0 (destination images)"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        data = r.read()
        if binary:
            return r.status, r.headers.get("Content-Type", ""), data
        return r.status, r.headers.get("Content-Type", ""), data.decode("utf-8", "replace")


def wiki_thumb(titles):
    q = urllib.parse.urlencode({
        "action": "query", "format": "json", "prop": "pageimages",
        "piprop": "thumbnail", "pithumbsize": "1000", "titles": titles, "redirects": 1,
    })
    s, ct, body = fetch(f"https://en.wikipedia.org/w/api.php?{q}")
    if s != 200:
        return {}
    j = json.loads(body)
    out = {}
    for p in j.get("query", {}).get("pages", {}).values():
        t = p.get("thumbnail", {}).get("source")
        if t:
            out[p.get("title", "")] = t
    # handle normalized titles
    for n in j.get("query", {}).get("normalized", []):
        if n["to"] in out:
            out[n["from"]] = out[n["to"]]
    return out


def verify(url):
    s, ct, body = fetch(url, binary=True)
    ok = s == 200 and ct.startswith("image/") and len(body) > 20000
    return ok, ct, len(body)


def main():
    dests = destinations()
    print(f"parsed {len(dests)} destinations")
    need = [d for d in dests if not d["image"]]
    print(f"{len(need)} need images")

    result = {}
    candidates = {}
    BATCH = 12
    for i in range(0, len(need), BATCH):
        chunk = need[i:i + BATCH]
        titles = []
        for d in chunk:
            titles.append(d["city"])
            titles.append(f"{d['city']}, {d['country']}")
        got = wiki_thumb(titles)
        time.sleep(0.8)
        for d in chunk:
            url = None
            for t in (d["city"], f"{d['city']}, {d['country']}"):
                u = got.get(t) or got.get(t.replace("'", ""))
                if u and not any(h in u.lower() for h in BAD_HINTS):
                    url = u
                    break
            candidates[d["id"]] = {"city": d["city"], "url": url}
        print(f"batch {i//BATCH}: {sum(1 for c in chunk if candidates[c['id']]['url'])}/{len(chunk)} found", flush=True)

    ok_map = {}
    for did, c in candidates.items():
        if not c["url"]:
            result[did] = {"city": c["city"], "image": None, "reason": "no-suitable-lead-image"}
            continue
        ok, ct, size = verify(c["url"])
        result[did] = {"city": c["city"], "image": c["url"] if ok else None,
                       "contentType": ct, "bytes": size, "reason": None if ok else f"verify-failed({s if False else ct})"}
        time.sleep(0.4)

    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=1), encoding="utf-8")
    good = sum(1 for v in result.values() if v["image"])
    print(f"DONE verified images: {good}/{len(result)}")


if __name__ == "__main__":
    main()

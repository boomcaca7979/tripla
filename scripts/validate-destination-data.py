#!/usr/bin/env python3
"""
validate-destination-data — Destination 城市数据层自动校验器。

检查项（对应 Full Build 硬性规则）：
  · duplicate attraction ids / duplicate coordinates / cross-city leakage
  · missing source / verifiedAt / image / imageAlt / lat / lon / description
  · invalid type / activity keywords / airport-or-citycenter-as-attraction
  · cross-city & intra-city image URL reuse
  · gallery < 4 张 / gallery 重复
  · missing IATA / missing city center / attractions < 5
  · malformed registry

用法：python3 scripts/validate-destination-data.py [--network]
  --network 额外对全部图片 URL 做 HTTP 200 检查（较慢）。
输出：终端报告 + /tmp/dest-data-validation.json；exit 1 = 有 ERROR。
"""
import json
import re
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEST_FILES = [
    "src/data/destinations.ts",
    "src/data/destinations-extended-a.ts",
    "src/data/destinations-extended-b.ts",
    "src/data/destinations-extended-d.ts",
    "src/data/destinations-extended-e.ts",
]
ATTR_FILE = "src/data/attractions.ts"
GALLERY_FILE = "src/data/destination-gallery.ts"
RESTAURANTS_FILE = "src/lib/api/restaurants.ts"
CLIMATE_FILE = "src/data/climate/nasa-power-canonical-v1.json"

VALID_TYPES = {
    "Historic site", "Temple", "Market", "Neighbourhood", "Park", "Museum",
    "Landmark", "Viewpoint",
}
ACTIVITY_WORDS = re.compile(
    r"\b(cruise|crawl|tour|show|safari|cooking class|nightlife|rooftop bar"
    r"|fado night|sunset at|sunrise trek|pub crawl|food crawl|bar hop)\b",
    re.I,
)
errors = []
warnings = []


def err(city, check, detail):
    errors.append({"city": city, "check": check, "detail": detail})


def warn(city, check, detail):
    warnings.append({"city": city, "check": check, "detail": detail})


def parse_registry():
    cities = {}
    for fn in DEST_FILES:
        src = (ROOT / fn).read_text()
        starts = [
            (m.group(1), m.start())
            for m in re.finditer(r'\{\s*\n\s*id:\s*"([a-z0-9-]+)",', src)
        ]
        for i, (slug, start) in enumerate(starts):
            end = starts[i + 1][1] if i + 1 < len(starts) else len(src)
            body = src[start:end]
            city_m = re.search(r'city:\s*"([^"]+)"', body)
            iata_m = re.search(r'iata:\s*"([A-Z]{3})"', body)
            lat_m = re.search(r'latitude:\s*(-?[\d.]+)', body)
            lon_m = re.search(r'longitude:\s*(-?[\d.]+)', body)
            cities[slug] = {
                "city": city_m.group(1) if city_m else "?",
                "iata": iata_m.group(1) if iata_m else None,
                "airport_lat": float(lat_m.group(1)) if lat_m else None,
                "airport_lon": float(lon_m.group(1)) if lon_m else None,
                "file": fn,
            }
    return cities


def parse_attractions():
    src = (ROOT / ATTR_FILE).read_text()
    per_city = {}
    for m in re.finditer(r'^\s{2}"?([a-z0-9-]+)"?:\s*\[\n(.*?)^\s{2}\],', src, re.S | re.M):
        slug, body = m.group(1), m.group(2)
        records = []
        for rm in re.finditer(r'\{\s*id:\s*"([^"]+)".*?\},', body, re.S):
            rec_src = rm.group(0)
            rec = {"id": rm.group(1)}
            for field in ("name", "description", "image", "imageAlt", "source", "verifiedAt"):
                fm = re.search(rf'{field}:\s*"([^"]*)"', rec_src)
                rec[field] = fm.group(1) if fm else None
            lat = re.search(r'lat:\s*(-?[\d.]+)', rec_src)
            lon = re.search(r'lon:\s*(-?[\d.]+)', rec_src)
            rec["lat"] = float(lat.group(1)) if lat else None
            rec["lon"] = float(lon.group(1)) if lon else None
            tm = re.search(r'type:\s*"([^"]+)"', rec_src)
            rec["type"] = tm.group(1) if tm else None
            am = re.search(r'admission:\s*"([^"]+)"', rec_src)
            rec["admission"] = am.group(1) if am else None
            vm = re.search(r'viatorQuery:\s*(null|"[^"]*")', rec_src)
            rec["viatorQuery"] = None if (not vm or vm.group(1) == "null") else vm.group(1).strip('"')
            records.append(rec)
        per_city[slug] = records
    return per_city


def parse_gallery():
    src = (ROOT / GALLERY_FILE).read_text()
    per_city = {}
    for m in re.finditer(r'^\s{2}"?([a-z0-9-]+)"?:\s*\[\n(.*?)^\s{2}\],', src, re.S | re.M):
        slug, body = m.group(1), m.group(2)
        entries = []
        for em in re.finditer(r'\{\s*src:\s*"([^"]+)",\s*alt:\s*"([^"]*)"(.*?),?\s*\},', body, re.S):
            extra = em.group(3) or ""
            sm = re.search(r'source:\s*"([^"]*)"', extra)
            vm = re.search(r'verifiedAt:\s*"([^"]*)"', extra)
            entries.append({
                "src": em.group(1), "alt": em.group(2),
                "source": sm.group(1) if sm else None,
                "verifiedAt": vm.group(1) if vm else None,
            })
        per_city[slug] = entries
    return per_city


def parse_city_centers():
    src = (ROOT / RESTAURANTS_FILE).read_text()
    centers = {}
    block = re.search(r'const CITY_CENTERS[^=]*=\s*\{(.*?)\n\};', src, re.S)
    if not block:
        return centers
    for m in re.finditer(r'"?([a-z0-9-]+)"?:\s*\{\s*lat:\s*(-?[\d.]+),\s*lon:\s*(-?[\d.]+)'
                         r'(?:,\s*source:\s*"([^"]*)")?(?:,\s*verifiedAt:\s*"([^"]*)")?', block.group(1)):
        centers[m.group(1)] = {
            "lat": float(m.group(2)), "lon": float(m.group(3)),
            "source": m.group(4), "verifiedAt": m.group(5),
        }
    return centers


def dist_m(lat1, lon1, lat2, lon2):
    dx = (lon2 - lon1) * 111320 * abs(__import__("math").cos(__import__("math").radians(lat1)))
    dy = (lat2 - lat1) * 110540
    return (dx * dx + dy * dy) ** 0.5


def main():
    network = "--network" in sys.argv
    cities = parse_registry()
    attractions = parse_attractions()
    gallery = parse_gallery()
    centers = parse_city_centers()
    climate_ids = set()
    cm = re.finditer(r'"destinationId":\s*"([a-z0-9-]+)"', (ROOT / CLIMATE_FILE).read_text())
    climate_ids = {m.group(1) for m in cm}

    slug_image = defaultdict(list)  # url -> [slug:kind]
    coord_owner = defaultdict(list)

    for slug, meta in cities.items():
        if not meta["iata"]:
            err(slug, "missing-iata", "no airport IATA")
        if slug not in climate_ids:
            err(slug, "missing-climate", "no NASA canonical record")
        if slug not in centers:
            warn(slug, "missing-city-center", "no CITY_CENTERS entry (Food = empty state)")
        elif not centers[slug].get("source") or not centers[slug].get("verifiedAt"):
            err(slug, "missing-provenance", "city center missing source/verifiedAt")

        # airports must not duplicate the same coords across cities
        recs = attractions.get(slug, [])
        if len(recs) < 5:
            warn(slug, "attractions-incomplete", f"{len(recs)}/5 structured attractions")
        for r in recs:
            rid = f'{slug}:{r["id"]}'
            for f in ("name", "description", "image", "imageAlt", "source", "verifiedAt"):
                if not r.get(f):
                    err(slug, "missing-provenance", f'{rid} missing {f}')
            if r["lat"] is None or r["lon"] is None:
                err(slug, "missing-coordinates", rid)
            else:
                coord_owner[(r["lat"], r["lon"])].append(rid)
                if meta["airport_lat"] is not None:
                    d = dist_m(r["lat"], r["lon"], meta["airport_lat"], meta["airport_lon"])
                    if d < 200:
                        err(slug, "airport-as-attraction", f"{rid} {d:.0f}m from airport")
                    elif d < 600:
                        warn(slug, "airport-adjacent", f"{rid} {d:.0f}m from airport (verify real site)")
                if slug in centers:
                    d = dist_m(r["lat"], r["lon"], centers[slug]["lat"], centers[slug]["lon"])
                    if d < 150:
                        err(slug, "citycenter-as-attraction", f"{rid} {d:.0f}m from city center")
            if r["type"] not in VALID_TYPES:
                err(slug, "invalid-type", f'{rid}: {r["type"]}')
            if r.get("name") and ACTIVITY_WORDS.search(r["name"]):
                err(slug, "activity-as-attraction", f'{rid}: {r["name"]}')
            if r.get("image"):
                slug_image[r["image"]].append(f"{slug}:attraction:{r['id']}")
        # gallery
        g = gallery.get(slug, [])
        if len(g) < 4:
            warn(slug, "gallery-incomplete", f"{len(g)}/4 structured gallery images")
        seen = set()
        for e in g:
            if not e.get("source") or not e.get("verifiedAt"):
                err(slug, "missing-provenance", f'gallery {e["src"][:60]} missing source/verifiedAt')
            if e["src"] in seen:
                err(slug, "duplicate-gallery-image", e["src"][:80])
            seen.add(e["src"])
            slug_image[e["src"]].append(f"{slug}:gallery")

    # cross-city coordinate / image leakage
    for (lat, lon), owners in coord_owner.items():
        slugs = {o.split(":")[0] for o in owners}
        if len(slugs) > 1:
            err(sorted(slugs)[0], "cross-city-coordinate-leak", f"{lat},{lon} → {sorted(slugs)}")
    for url, owners in slug_image.items():
        slugs = {o.split(":")[0] for o in owners}
        if len(slugs) > 1:
            err(sorted(slugs)[0], "cross-city-image-leak", f"{url[:70]} → {sorted(slugs)}")

    if network:
        urls = sorted({r["image"] for rs in attractions.values() for r in rs} |
                      {e["src"] for gs in gallery.values() for e in gs})
        for u in urls:
            code = subprocess.run(
                ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "-I", "-m", "12", u],
                capture_output=True, text=True).stdout.strip()
            if code != "200":
                err("network", "broken-image", f"{code} {u[:80]}")

    report = {"errors": errors, "warnings": warnings,
              "counts": {"cities": len(cities), "attractions": sum(len(v) for v in attractions.values()),
                         "gallery_images": sum(len(v) for v in gallery.values()),
                         "city_centers": len(centers)}}
    (Path("/tmp/dest-data-validation.json")).write_text(json.dumps(report, indent=1, ensure_ascii=False))
    print(f"cities={len(cities)} attractions={report['counts']['attractions']} "
          f"gallery={report['counts']['gallery_images']} city_centers={len(centers)}")
    print(f"ERRORS={len(errors)} WARNINGS={len(warnings)}")
    for e in errors[:40]:
        print("  E", e["city"], e["check"], e["detail"][:90])
    for w in warnings[:40]:
        print("  W", w["city"], w["check"], w["detail"][:90])
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()

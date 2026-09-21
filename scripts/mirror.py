#!/usr/bin/env python3
"""Mirror list-level images (thumbs, hero icons, lord avatars/portraits, talent icons) into img/cdn/ and write data/mirror.json."""
import concurrent.futures, hashlib, json, os, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SNAP = os.path.join(ROOT, "data", "cards-snapshot.json")
OUT_DIR = os.path.join(ROOT, "img", "cdn")
MAP = os.path.join(ROOT, "data", "mirror.json")
HERO_ICON = "https://game.gtimg.cn/images/osgame/cp/a20260707sfgw/card/icon/hero_{id}.png"

def wanted(snap):
    urls = set()
    for c in snap.get("heroCards", []):
        urls.add(HERO_ICON.format(id=c["id"]))
        urls.add(c.get("thumb"))
    for key in ("talentCards", "equipCards", "effectCards"):
        for c in snap.get(key, []):
            urls.add(c.get("thumb") or c.get("image"))
            for s in c.get("sourceCards") or []:
                urls.add(s.get("thumb") or s.get("image"))
    for l in snap.get("lords", []):
        urls.add(l.get("avatar")); urls.add(l.get("portraitV2") or l.get("banShenImg"))
        for t in l.get("talent") or []:
            urls.add(t.get("icon"))
            for c in t.get("cards") or []:
                urls.add(c.get("thumb"))
        for c in l.get("relatedCards") or []:
            urls.add(c.get("thumb") or c.get("image"))
    return sorted(u for u in urls if u and u.startswith("http"))

def local_name(url):
    ext = os.path.splitext(url.split("?")[0])[1].lower() or ".png"
    if ext not in (".png", ".jpg", ".jpeg", ".webp", ".gif"):
        ext = ".png"
    return hashlib.sha1(url.encode()).hexdigest()[:16] + ext

def fetch(url):
    name = local_name(url)
    path = os.path.join(OUT_DIR, name)
    if os.path.exists(path) and os.path.getsize(path) > 0:
        return url, name, "cached"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=40) as r:
            data = r.read()
        if len(data) < 100:
            return url, None, "tiny"
        with open(path, "wb") as f:
            f.write(data)
        return url, name, "new"
    except Exception as e:
        return url, None, f"fail {e}"

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    snap = json.load(open(SNAP, encoding="utf-8"))
    urls = wanted(snap)
    old = json.load(open(MAP)) if os.path.exists(MAP) else {}
    mapping, stats = {}, {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as ex:
        for url, name, status in ex.map(fetch, urls):
            stats[status.split(" ")[0]] = stats.get(status.split(" ")[0], 0) + 1
            if name:
                mapping[url] = "img/cdn/" + name
            elif url in old:
                mapping[url] = old[url]
            if status.startswith("fail"):
                print("FAIL", url, status, file=sys.stderr)
    json.dump(mapping, open(MAP, "w"), separators=(",", ":"))
    keep = set(os.path.basename(p) for p in mapping.values())
    stale = [f for f in os.listdir(OUT_DIR) if f not in keep]
    for f in stale:
        os.remove(os.path.join(OUT_DIR, f))
    total = sum(os.path.getsize(os.path.join(OUT_DIR, f)) for f in os.listdir(OUT_DIR))
    print(f"{len(mapping)} mirrored, {stats}, removed {len(stale)} stale, {total/1048576:.1f} MB")

if __name__ == "__main__":
    main()

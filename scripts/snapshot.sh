#!/usr/bin/env bash
# Refresh data/cards-snapshot.json from the official card data files.
set -euo pipefail
cd "$(dirname "$0")/.."
B=https://game.gtimg.cn/images/amside/ide_timer/589094_oscard_new
python3 - "$B" <<'PY'
import json, sys, urllib.request, datetime
base = sys.argv[1]
out = {"heroCards": [], "effectCards": [], "equipCards": [], "talentCards": [], "lords": []}
for n in (1, 2, 4, 8, 16):
    with urllib.request.urlopen(f"{base}_{n}.js", timeout=30) as r:
        d = json.load(r)
    for k in out:
        out[k] += d.get(k) or []
cms = "https://vasd-cms.qq.com/cms/osgamewsq/prod/api/v1/osgamewsqwsq_info_article_3019.json?ts=0"
with urllib.request.urlopen(cms, timeout=30) as r:
    out["cms"] = [{"uid": x.get("uid"), "title": x.get("title"),
                   "basicInfo": {"line_text": (x.get("basicInfo") or {}).get("line_text", ""),
                                 "lines": [{"url": u["url"]} for u in ((x.get("basicInfo") or {}).get("lines") or []) if u.get("url")]},
                   "homepageInfo": {"en_name": (x.get("homepageInfo") or {}).get("en_name", "")}}
                  for x in json.load(r).get("data", [])]
out["snapshotDate"] = datetime.date.today().isoformat()
json.dump(out, open("data/cards-snapshot.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print({k: len(v) for k, v in out.items() if isinstance(v, list)}, out["snapshotDate"])
PY

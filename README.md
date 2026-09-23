# 万象宝典 · wxq-codex

[中文说明](README.zh-CN.md)

Companion page for 王者万象棋 (Honor of Kings auto chess): an upgrade cost calculator on top, the card compendium and the lord roster below, all on one page that works on an iPad next to the game.

Live: https://yuuteng.github.io/wxq-codex/

![Calculator](docs/screenshot.jpg)

## Calculator

Pick three things with buttons: whether you hold 弈星 (none / normal / awakened), your current level, and the XP already banked. The page shows the energy needed to reach every higher level, with the 弈星 discount on chained upgrades shown in brackets. The XP model comes from my own notes; the rules and the derived cost tables are printed at the bottom of the page.

## Card compendium

![Compendium](docs/gallery.jpg)

- Four tabs (heroes, talents, equipment, effects) with the same filters as the official site: faction, keyword and tier for heroes, unlock group for talents and effects, category and type for equipment.
- The right panel shows the card art, description, keyword glossary, skills, stats and the awakened form. Related cards open in a lightbox.
- Card data is read from the official site when the page opens, so numbers never lag a patch. A snapshot in `data/` is used only when that fetch fails.
- Each tab's list is built once and then toggled, so switching filters does not reload images. The other tabs are prefetched in the background after the first paint.

## Lords

![Lords](docs/roles.jpg)

Nineteen lords with portrait, quote, the three abilities (skill, secret, exclusive) and the related card list.

## Offline behaviour

A service worker caches images and fonts on first sight and revalidates page files and data on every load. List thumbnails, hero icons and lord portraits are mirrored into `img/cdn/` so the first load does not depend on a slow host; a missing mirror falls back to the original URL.

## Layout

| Path | Purpose |
|------|---------|
| `index.html` | Calculator, page shell, rules and tables |
| `cards.js`, `cards.css` | Compendium |
| `roles.js`, `roles.css` | Lord roster |
| `sw.js` | Service worker |
| `data/cards-snapshot.json` | Fallback data snapshot |
| `data/mirror.json`, `img/cdn/` | Mirrored list images and the URL map |
| `img/card/`, `img/role/` | Sprites and backgrounds |
| `fonts/` | HYQiHei 60S and 75W |
| `scripts/sync.sh` | Refresh snapshot and mirror after a game update |

## Updating after a patch

```sh
scripts/sync.sh
git commit -am "sync" && git push
```

## Running locally

```sh
python3 -m http.server 8000
```

## Notes

Personal, non-commercial project. Card data, artwork and fonts belong to Tencent and their respective owners.

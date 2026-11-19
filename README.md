# Leonida Ledger — GTA 6 Trophy Guide & Tracker

[![Trophy Guide](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/4Quaranz/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/4Quaranz/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI — built for the [gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01) bounty on make.fun.

## What it is

- **Checklist** of every official trophy with its official name, description and grade (1 platinum, 2 gold, 6 silver, 46 bronze), saved in the browser with export and import.
- **Filters** by kind — story, missable, collectibles, activities, strangers, money, moments — plus search and earned / still-to-earn views.
- **Spoiler setting** that hides the names and descriptions of hidden story trophies until you earn them.
- **Roadmap to the platinum** in four stages, built from the official trophy descriptions.
- **Missable flags** on the 11 trophies tied to a single story moment or one-time event, each with its own note.
- **A guide for every trophy** in our own words, each naming its sources.

## Files

- `app/index.html` — the shell: header with progress, tabs, toolbar, checklist and guide pane.
- `app/js/main.js` — boot, routing and toolbar wiring; `app/js/store.js` — localStorage progress, export and import; `app/js/views.js` — checklist, detail, roadmap, missables and about rendering; `app/js/data.js` — filters and the four-stage roadmap.
- `app/data/trophies.json` — the 55 official trophies with our own guide and sources for each.
- `app/css/style.css` — the night theme, system fonts only.
- `main.ts` — the hand-in program; `serve.ts` — a tiny local static server for trying the guide.

## Run it

```sh
node serve.ts
```

Then open <http://localhost:8080>. It is plain static files under `app/` — no build step, no network request, system fonts only. It works with the network off.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's `vendor/makefun-frontend.ts`. Running it twice writes byte-identical output.

## Sources

- Trophy names, descriptions, grades and hidden flags: the official list on Exophase, read 19 November 2026.
- PSN progress counts (42 Shooting Range challenges, 14 drone race locations, 18 meditation spots, 52 areas, 9 gangs, 8 garages): PSNProfiles.
- Every guide is our own advice, read from the official descriptions. GTA 6 released 19 November 2026, so where an exact in-game spot is not yet verified, the guide says so instead of inventing one.

## Not affiliated

An unofficial, fan-made guide. Not affiliated with Rockstar Games, Take-Two Interactive or PlayStation. No Rockstar logo, official artwork, box art or game screenshot is used — the look is our own.

## License

MIT — see [LICENSE](LICENSE).

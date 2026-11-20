[![GTA 6 Trophy Guide — make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/4Quaranz/gta6-trophy-guide-01/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/4Quaranz/gta6-trophy-guide-01/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

# Leonida Ledger — GTA 6 Trophy Guide & Tracker

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI: every trophy with its official name, description and grade, a checklist saved in the browser, export and import, filters by kind, a spoiler setting, a roadmap to the platinum, and the missable trophies flagged — with every guide in our own words and citing its sources.

- **Tracker:** checklist of all 55 trophies saved in localStorage, per-trophy progress counters against PSN's tracked goals (for example 0/42 Shooting Range challenges), personal notes, export to JSON and import back.
- **Filters:** by kind (story, collectibles, activities, missable, online, platinum), by grade, by earned status, plus search and sorting.
- **Spoiler-free mode:** hides story trophy names and descriptions until they are earned.
- **Roadmap:** three steps to the platinum — story (60–80 hours), the 100% checklist (about 100 hours), cleanup (about 10 hours) — about 200 hours in total, one playthrough, no online trophies.
- **Missables:** the one possibly missable trophy (Positive Mental Attitude) flagged with its Chapter 1 warning; everything else is safe to earn any time.
- **Sources:** every guide cites Exophase, PSNProfiles, PowerPyx and CryptoGames (GTABase / PowerPyx). Where the published guides have not confirmed a step yet, the guide says so instead of guessing.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. No build step, no network: every file the app loads is under `app/`.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

That copies `app/` and `screenshots/` to `out/` and writes `out/dossier.json`.

## Verification

List verified 2026-11-20 against Exophase and PSNProfiles (names, descriptions, grades and PSN counts agree): 55 trophies — 1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden on PlayStation; no online trophies.

Referral code: `scveefga`

## License

MIT — see [LICENSE](LICENSE). Unofficial fan-made guide, not affiliated with Rockstar Games, Sony or PlayStation. No Rockstar artwork, logos or screenshots are used.

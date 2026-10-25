# Maintenance

Every change goes through Git: edit → `npm test && npm run build` → commit → push to `main` → the deploy workflow publishes it (tests must pass).

## Publish a news article (no code change)

Create one file per language with the same `translationKey`:

```
src/content/news/en/2027-07-01-glasses.md
src/content/news/fr/2027-07-01-glasses.md
src/content/news/ar/2027-07-01-glasses.md
```

```markdown
---
title: …
description: …            # 50–160 characters, unique
date: 2027-07-01
updated: 2027-07-03        # optional
translationKey: glasses-2027
draft: false               # true = not published
sources:
  - title: …
    url: https://…
---
Text in Markdown…
```

## Update a page

Long-form pages are in `src/content/pages/{en,fr,ar}/*.md` (guide, science, about, privacy, legal). Update the three languages and the `updated:` date. Pages with computed data (home, map, calculator, weather, destinations, FAQ, sources) are Astro files in `src/pages/[lang]/`, with their texts at the top of each file.

## Update practical / tourist information

`src/data/destinations.json`: texts per language, airports, UNESCO links. Change `"verified"` to the date of the check. Never add an establishment, price, availability or travel time that has not been verified.

## Before the eclipse (timeline)

| When | Action |
|---|---|
| Each spring | Check `ADOPTED_DELTA_T` against IERS Bulletin A (ΔT = 32.184 + 37 − (UT1−UTC)); if it changes by > 0.5 s, update it, run `npm run data:path`, `npm run data:validate`, `npm test`, commit. |
| Every 3 months | `npm outdated`, update dependencies, run all tests (`npm test`, `npx playwright test`, `npx astro check`). Check that OpenFreeMap still serves the `dark` style. |
| June–July 2027 | Re-check destinations (airports, rail, travel advice), refresh `verified`; publish practical news (glasses, traffic). |
| ~10 days before | Add a dated weather news item with links to the official forecasts (INM, ECMWF, dust forecasts); do not publish own forecasts. |
| Day before / day of | Update the weather news with the official forecasts; monitor the site (uptime monitor). |
| After the eclipse | Change the countdown messages (already automatic), publish an article, archive photos/reports; the site can evolve to other events (the engine accepts other Besselian elements). |

## Dependencies

`npm audit` and `npm outdated` regularly. Node.js ≥ 22.22 (Astro 7.4.1 is pinned because Astro 7.4.2 requires Node 22.23.4+). The RTL text plugin is copied from `node_modules` into `public/vendor` by `scripts/copy-vendor.mjs` before every build.

## Backup and recovery

The Git repository is the backup (code, data, content, documentation). Keep at least one clone outside the hosting provider (e.g. the owner's computer). No database, no user data, no secret to back up. Recovery or change of host: see [DEPLOYMENT.md](DEPLOYMENT.md#recovery--change-of-provider).

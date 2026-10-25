# Eclipse in Tunisia 2027

**ECLIPSE 2027 — TUNISIA · Experience the Total Solar Eclipse**

Scientific, cartographic and travel portal about the total solar eclipse of **Monday 2 August 2027** in Tunisia, in English, French and Arabic (RTL).

- Interactive map of the path of totality (MapLibre GL JS + OpenFreeMap), with limits, central line, duration and magnitude isolines, governorates, towns and destinations.
- Local circumstances calculator (town, map click, coordinates, geolocation with consent): contacts C1–C4, duration of totality, magnitude, obscuration, Sun altitude/azimuth, distance to the limits.
- Eclipse simulation synchronised with the selected place.
- Observation and eye-safety guide, science pages, destinations, climate statistics, FAQ, news.
- All predictions computed from NASA's Besselian elements by an engine validated against NASA's path table and an independent library (see [docs/VALIDATION.md](docs/VALIDATION.md)).

## Quick start

Requirements: Node.js ≥ 22.22, npm. Google Chrome for the end-to-end tests.

```bash
npm ci
npm run dev          # http://localhost:4321/
npm test             # unit + scientific validation tests (Vitest)
npm run build        # static site in dist/
npm run preview      # serve dist/
npx playwright test  # end-to-end, accessibility (axe) tests — needs a build
npx astro check      # strict type check
```

Configuration is done through environment variables (see [.env.example](.env.example)): `SITE_URL`, `BASE_PATH`, optional analytics and Search Console token. No secret is required.

## Project structure

```
src/
  lib/eclipse/        Astronomical engine (Besselian elements, local circumstances, path geometry)
  lib/                Data access, formatting, validation, SVG map rendering
  i18n/               Languages, routes and UI strings (EN, FR, AR)
  data/               cities.json, destinations.json, climate.json, sources.ts
  content/pages/      Long-form pages in Markdown, one file per language
  content/news/       News articles in Markdown (add a file to publish)
  components/         Astro components (header, map preview, calculator form, simulation…)
  scripts/            Browser code (map, calculator, results, simulation)
  pages/[lang]/       Routes: /, map, calculator, guide, destinations, weather, science, faq, news, sources…
public/data/          GeoJSON layers (path, governorates, countries)
scripts/              Data generation and validation scripts
tests/unit/           Vitest: engine, NASA validation, cross-check
tests/e2e/            Playwright: pages, calculator, map, accessibility
docs/                 Architecture, astronomy, data, validation, tests, deployment, maintenance, status
```

## Documentation

| Document | Content |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Technical choices, architecture, i18n, security |
| [docs/ASTRONOMY.md](docs/ASTRONOMY.md) | Eclipse engine, conventions, ΔT, accuracy |
| [docs/DATA.md](docs/DATA.md) | Data sources, CRS, licences, regeneration |
| [docs/VALIDATION.md](docs/VALIDATION.md) | Scientific validation tables (generated) |
| [docs/TEST-REPORT.md](docs/TEST-REPORT.md) | Tests actually run and results |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Hosting comparison, deployment, custom domain, costs |
| [docs/MAINTENANCE.md](docs/MAINTENANCE.md) | Updating content, data, dependencies; backup and recovery |
| [docs/STATUS.md](docs/STATUS.md) | Progress, acceptance criteria, remaining human actions |

## Credits and licences

Eclipse predictions by Fred Espenak, NASA's GSFC. Boundaries © OpenStreetMap contributors via geoBoundaries (ODbL). Towns: GeoNames (CC BY 4.0). Climate: ERA5 / Copernicus via Open-Meteo (CC BY 4.0). Background map: OpenFreeMap, © OpenMapTiles, © OpenStreetMap contributors. Code: MIT (see `package.json`).

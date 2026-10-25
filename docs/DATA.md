# Data

All geographic data are in **WGS 84 geographic coordinates (EPSG:4326)**, GeoJSON order `[longitude, latitude]`. MapLibre displays them in Web Mercator (EPSG:3857); all astronomical computations use the geographic coordinates directly (geodetic latitude, east longitude).

| File | Content | Source / licence | Produced by |
|---|---|---|---|
| `public/data/eclipse-2027-path.geojson` (≈ 140 KB) | Umbra polygon, central line, northern/southern limits, duration isolines (1–5 min, 5°–14° E), magnitude isolines (0.95, 0.9, 0.8, 0.7, 12° W–30° E) | Computed from NASA/GSFC Besselian elements (F. Espenak) | `npm run data:path` |
| `public/data/tunisia-governorates.geojson` (≈ 110 KB) | 24 governorates, ISO 3166-2 code, names EN/FR/AR | geoBoundaries gbOpen TUN ADM1 (commit 9469f09), from OpenStreetMap — **ODbL 1.0** | mapshaper (see below) |
| `public/data/region-countries.geojson` (≈ 5 KB) | Tunisia, Algeria, Libya, Italy, Malta outlines | Natural Earth 1:10m admin-0 — public domain | mapshaper |
| `src/data/cities.json` | 62 places: coordinates, population, governorate, names EN/FR/AR | GeoNames TN.zip + alternatenames — **CC BY 4.0**; names reviewed by hand | `scripts/build-cities.ts` |
| `src/data/destinations.json` | 12 destination sheets (texts in 3 languages, airports, UNESCO links) | Editorial; UNESCO World Heritage List; verified 2026-10-25 | Manual |
| `src/data/climate.json` | Cloud cover / temperature at 09:00 UTC, 26 Jul–9 Aug, 2000–2024 | ERA5 (Copernicus C3S/ECMWF) via Open-Meteo — **CC BY 4.0** | `scripts/fetch-climate.ts` |
| `tests/fixtures/nasa-path-2027.json` | NASA path table (101 rows, 08:26–11:46 UT) | NASA GSFC (F. Espenak) | Extracted from the HTML table |

## Quality checks performed

- **Geometric validity**: governorates cleaned and checked with `mapshaper -clean -check-geometry` (24 of 24 features retained); the umbra polygon is closed and built from monotonic limit lines.
- **Coordinates of towns**: every place is assigned to its governorate by point-in-polygon on the boundary layer (all 62 fall inside Tunisia; coastal points would be matched to the nearest vertex within 0.1° — none needed). Arabic names from GeoNames were incomplete or wrong (e.g. Teboulba) and were replaced by reviewed names.
- **Consistency map / calculator / tables**: the same engine and the same ΔT generate the GeoJSON and the browser computations; tests check that every reference town's "inside/outside" status from `limitInfo` matches its type of eclipse.
- **Units and angles**: degrees everywhere in data; radians only inside the engine; azimuth from north through east.

## Regenerating the data

```bash
# Path of the eclipse (≈ 25 s)
npm run data:path

# Towns (download GeoNames extracts into a scratch folder first)
curl -O https://download.geonames.org/export/dump/TN.zip && unzip TN.zip -d geonames
curl -o alt.zip https://download.geonames.org/export/dump/alternatenames/TN.zip && unzip alt.zip -d geonames-alt
node --experimental-strip-types scripts/build-cities.ts geonames/TN.txt geonames-alt/TN.txt

# Governorates (geoBoundaries) — simplify then add names (see names table in scripts/build-cities.ts / src/lib/data.ts)
curl -L -o tun.geojson https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/TUN/ADM1/geoBoundaries-TUN-ADM1.geojson
npx mapshaper@0.6.113 -i tun.geojson -clean -simplify 6% keep-shapes -filter-fields shapeISO -rename-fields iso=shapeISO -check-geometry -o gov.geojson precision=0.0001
# then add name_en / name_fr / name_ar per ISO code (same table as GOVERNORATES in src/lib/data.ts)

# Climate (rate-limited API: ~5 min)
node --experimental-strip-types scripts/fetch-climate.ts

# Validation report
npm run data:validate
```

/**
 * Builds src/data/climate.json: cloud-cover and temperature climatology at the
 * hour of the eclipse (09:00 UTC = 10:00 Tunisian time) for each destination.
 *
 *   node --experimental-strip-types scripts/fetch-climate.ts
 *
 * Data: ERA5 reanalysis (Copernicus Climate Change Service / ECMWF), served by
 * the Open-Meteo Historical Weather API (https://open-meteo.com, CC BY 4.0).
 * ERA5 total cloud cover is a model quantity on a ~0.25° grid (≈ 25–30 km);
 * it is a climatological indicator, NOT a forecast.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const FIRST_YEAR = 2000;
const LAST_YEAR = 2024;
/** Window of days around 2 August (inclusive), month 7 = July. */
const WINDOW = { from: [7, 26], to: [8, 9] } as const;
const HOUR_UTC = 9;

const { cities } = JSON.parse(readFileSync('src/data/cities.json', 'utf8')) as {
  cities: { id: string; lat: number; lon: number }[];
};
const { destinations } = JSON.parse(readFileSync('src/data/destinations.json', 'utf8')) as {
  destinations: { id: string; cityId: string }[];
};

interface Stats {
  id: string;
  lat: number;
  lon: number;
  gridLat: number;
  gridLon: number;
  samples: number;
  meanCloudCover: number;
  /** Share of samples with total cloud cover ≤ 10 % */
  clearShare: number;
  /** Share of samples with total cloud cover ≥ 50 % */
  cloudyShare: number;
  meanTemperature: number;
}

async function fetchPoint(id: string, lat: number, lon: number): Promise<Stats> {
  const url = new URL('https://archive-api.open-meteo.com/v1/archive');
  url.search = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    start_date: `${FIRST_YEAR}-01-01`,
    end_date: `${LAST_YEAR}-12-31`,
    hourly: 'cloud_cover,temperature_2m',
    models: 'era5',
    timezone: 'GMT',
  }).toString();
  let res = await fetch(url);
  // Long series count as several API calls: wait and retry when rate-limited.
  for (let attempt = 0; res.status === 429 && attempt < 5; attempt++) {
    await new Promise((r) => setTimeout(r, 65_000));
    res = await fetch(url);
  }
  if (!res.ok) throw new Error(`${id}: HTTP ${res.status} ${await res.text()}`);
  const data = (await res.json()) as {
    latitude: number;
    longitude: number;
    hourly: { time: string[]; cloud_cover: (number | null)[]; temperature_2m: (number | null)[] };
  };
  const clouds: number[] = [];
  const temps: number[] = [];
  data.hourly.time.forEach((iso, i) => {
    const month = Number(iso.slice(5, 7));
    const day = Number(iso.slice(8, 10));
    const hour = Number(iso.slice(11, 13));
    if (hour !== HOUR_UTC) return;
    const md = month * 100 + day;
    if (md < WINDOW.from[0] * 100 + WINDOW.from[1] || md > WINDOW.to[0] * 100 + WINDOW.to[1]) return;
    const c = data.hourly.cloud_cover[i];
    const t = data.hourly.temperature_2m[i];
    if (c != null) clouds.push(c);
    if (t != null) temps.push(t);
  });
  const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
  const r1 = (v: number) => Math.round(v * 10) / 10;
  return {
    id,
    lat,
    lon,
    gridLat: data.latitude,
    gridLon: data.longitude,
    samples: clouds.length,
    meanCloudCover: r1(mean(clouds)),
    clearShare: r1((100 * clouds.filter((c) => c <= 10).length) / clouds.length),
    cloudyShare: r1((100 * clouds.filter((c) => c >= 50).length) / clouds.length),
    meanTemperature: r1(mean(temps)),
  };
}

const results: Stats[] = [];
for (const d of destinations) {
  const city = cities.find((c) => c.id === d.cityId);
  if (!city) throw new Error(`Unknown city ${d.cityId}`);
  results.push(await fetchPoint(d.id, city.lat, city.lon));
  console.log(results.at(-1));
  await new Promise((r) => setTimeout(r, 15_000));
}

writeFileSync(
  'src/data/climate.json',
  JSON.stringify(
    {
      source: 'ERA5 reanalysis (Copernicus C3S / ECMWF) via Open-Meteo Historical Weather API, CC BY 4.0',
      method: `Hourly total cloud cover and 2 m temperature at ${HOUR_UTC}:00 UTC, 26 July – 9 August, ${FIRST_YEAR}–${LAST_YEAR}`,
      period: [FIRST_YEAR, LAST_YEAR],
      generated: new Date().toISOString().slice(0, 10),
      points: results,
    },
    null,
    1,
  ),
);

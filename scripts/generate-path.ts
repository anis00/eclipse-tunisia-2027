/**
 * Generates public/data/eclipse-2027-path.geojson from the Besselian elements.
 *
 *   npm run data:path
 *
 * Coordinates: WGS 84 geographic (EPSG:4326), [lon, lat], 5 decimals (~1 m).
 * Computed at sea level with the adopted ΔT (see src/lib/eclipse/elements.ts).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { ADOPTED_DELTA_T, ECLIPSE_2027 } from '../src/lib/eclipse/elements.ts';
import { durationCrossings, magnitudeCrossings, totalityLimits, type LonLat } from '../src/lib/eclipse/path.ts';

const el = ECLIPSE_2027;
const dT = ADOPTED_DELTA_T;
const round = (v: number) => Math.round(v * 1e5) / 1e5;
const range = (from: number, to: number, step: number) => {
  const out: number[] = [];
  for (let v = from; v <= to + 1e-9; v += step) out.push(Math.round(v * 1e4) / 1e4);
  return out;
};

// Fine sampling over Tunisia and its neighbourhood, coarser elsewhere along the path.
const lons = [...range(-12, 5.9, 0.1), ...range(6, 13, 0.02), ...range(13.1, 30, 0.1)];

const north: LonLat[] = [];
const south: LonLat[] = [];
const central: LonLat[] = [];
const centralByLon = new Map<number, number>();
for (const lon of lons) {
  const c = totalityLimits(el, lon, dT);
  centralByLon.set(lon, c.central);
  central.push([round(lon), round(c.central)]);
  if (c.north !== null) north.push([round(lon), round(c.north)]);
  if (c.south !== null) south.push([round(lon), round(c.south)]);
}

const features: object[] = [];
features.push({
  type: 'Feature',
  properties: { kind: 'umbra' },
  geometry: { type: 'Polygon', coordinates: [[...north, ...[...south].reverse(), north[0]]] },
});
features.push({ type: 'Feature', properties: { kind: 'central' }, geometry: { type: 'LineString', coordinates: central } });
features.push({ type: 'Feature', properties: { kind: 'limit', side: 'north' }, geometry: { type: 'LineString', coordinates: north } });
features.push({ type: 'Feature', properties: { kind: 'limit', side: 'south' }, geometry: { type: 'LineString', coordinates: south } });

// Duration isolines across the Tunisian part of the path.
const durationLons = range(5, 14, 0.05);
for (const seconds of [60, 120, 180, 240, 300]) {
  const n: LonLat[] = [];
  const s: LonLat[] = [];
  for (const lon of durationLons) {
    const c = totalityLimits(el, lon, dT).central;
    const x = durationCrossings(el, lon, dT, seconds, c);
    if (x.north !== null) n.push([round(lon), round(x.north)]);
    if (x.south !== null) s.push([round(lon), round(x.south)]);
  }
  for (const [side, coords] of [['north', n], ['south', s]] as const) {
    features.push({ type: 'Feature', properties: { kind: 'duration', seconds, side }, geometry: { type: 'LineString', coordinates: coords } });
  }
}

// Magnitude isolines of the partial eclipse (both sides of the path).
const magLons = range(-12, 30, 0.1);
for (const magnitude of [0.95, 0.9, 0.8, 0.7]) {
  const n: LonLat[] = [];
  const s: LonLat[] = [];
  for (const lon of magLons) {
    const c = centralByLon.get(lon) ?? totalityLimits(el, lon, dT).central;
    const x = magnitudeCrossings(el, lon, dT, magnitude, c);
    if (x.north !== null) n.push([round(lon), round(x.north)]);
    if (x.south !== null) s.push([round(lon), round(x.south)]);
  }
  for (const [side, coords] of [['north', n], ['south', s]] as const) {
    features.push({ type: 'Feature', properties: { kind: 'magnitude', magnitude, side }, geometry: { type: 'LineString', coordinates: coords } });
  }
}

const geojson = {
  type: 'FeatureCollection',
  metadata: {
    eclipse: el.id,
    crs: 'EPSG:4326 (WGS 84), [longitude, latitude]',
    deltaT: dT,
    height: 'sea level (h = 0 m)',
    source: 'Computed from NASA/GSFC Besselian elements (F. Espenak). Eclipse Predictions by Fred Espenak, NASA GSFC.',
    generated: new Date().toISOString().slice(0, 10),
  },
  features,
};
mkdirSync('public/data', { recursive: true });
writeFileSync('public/data/eclipse-2027-path.geojson', JSON.stringify(geojson));
console.log(`Wrote ${features.length} features (${central.length} meridians).`);

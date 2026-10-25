/**
 * Independent cross-check against Astronomy Engine (D. Cross), which uses its own
 * ephemerides and a slightly larger lunar radius. Contact
 * times must agree within a few seconds; differences in the duration of
 * totality are expected from the lunar radius convention and are reported.
 */
import { describe, expect, it } from 'vitest';
import * as A from 'astronomy-engine';
import { readFileSync } from 'node:fs';
import { ADOPTED_DELTA_T, eclipseAt, limitInfo } from '../../src/lib/eclipse/index.ts';

// Same ΔT in both engines so that only ephemerides and algorithms are compared
// (Astronomy Engine's default Espenak–Meeus model gives ≈ 76 s for 2027).
A.SetDeltaTFunction(() => ADOPTED_DELTA_T);

const { cities } = JSON.parse(readFileSync('src/data/cities.json', 'utf8')) as {
  cities: { id: string; lat: number; lon: number }[];
};

/** Reference points: centre of the path, near limits, outside, deep partial. */
const POINTS: [string, number, number][] = [
  ['central line (NASA 09:10 UT)', 34 + 43.4 / 60, 9 + 51.5 / 60],
  ...cities
    .filter((c) => ['sfax', 'gafsa', 'gabes', 'kairouan', 'tozeur', 'houmt-souk', 'sousse', 'tunis', 'bizerte', 'tataouine', 'kebili'].includes(c.id))
    .map((c) => [c.id, c.lat, c.lon] as [string, number, number]),
];

function reference(lat: number, lon: number) {
  return A.SearchLocalSolarEclipse(new Date('2027-08-01T00:00:00Z'), new A.Observer(lat, lon, 0));
}

describe('Engine vs Astronomy Engine', () => {
  it.each(POINTS)('%s', (_name, lat, lon) => {
    const e = eclipseAt(lat, lon);
    const r = reference(lat, lon);
    const dt = (a: Date, b: Date) => Math.abs(a.getTime() - b.getTime()) / 1000;
    expect(dt(e.c1!.time, r.partial_begin.time.date)).toBeLessThan(5);
    expect(dt(e.c4!.time, r.partial_end.time.date)).toBeLessThan(5);
    expect(dt(e.max!.time, r.peak.time.date)).toBeLessThan(5);
    expect(Math.abs(e.max!.sun.altitude - r.peak.altitude)).toBeLessThan(0.3);
    // Lunar radius conventions differ (k = 0.272281 vs Astronomy Engine's larger mean
    // radius): the difference grows near the limits, so C2/C3 are compared only > 20 km inside.
    const lim = limitInfo(lat, lon);
    if (e.kind === 'total' && r.kind === 'total' && lim && lim.km > 20) {
      expect(dt(e.c2!.time, r.total_begin!.time.date)).toBeLessThan(8);
      expect(dt(e.c3!.time, r.total_end!.time.date)).toBeLessThan(8);
    }
    // Obscuration agrees for partial locations.
    if (e.kind === 'partial' && r.kind === 'partial') {
      expect(Math.abs(e.max!.obscuration - r.obscuration)).toBeLessThan(0.002);
    }
  });
});

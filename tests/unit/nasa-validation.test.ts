/**
 * Validates the Besselian engine against NASA's published path table
 * (tests/fixtures/nasa-path-2027.json, ΔT = 76.0 s as used by NASA).
 */
import { describe, expect, it } from 'vitest';
import fixtureJson from '../fixtures/nasa-path-2027.json';
import { ECLIPSE_2027 } from '../../src/lib/eclipse/elements.ts';
import { computeLocalCircumstances } from '../../src/lib/eclipse/circumstances.ts';
import { totalityLimits } from '../../src/lib/eclipse/path.ts';

type LonLat = [number, number];
interface Row {
  ut: string;
  north: LonLat;
  south: LonLat;
  central: LonLat;
  ratio: number;
  sunAlt: number;
  sunAz: number;
  width: number;
  duration: number;
}
const fixture = fixtureJson as unknown as { rows: Row[] };
const NASA_DT = 76.0;
// Rows crossing the Atlantic → Libya, with the Tunisian section (09:04–09:16 UT).
const rows = fixture.rows.filter((r) => r.ut >= '08:40' && r.ut <= '09:40');

describe('Engine vs NASA path table', () => {
  it.each(rows)('central line at $ut UT', (row) => {
    const [lon, lat] = row.central;
    const c = computeLocalCircumstances(ECLIPSE_2027, { lat, lon }, NASA_DT);
    expect(c.kind).toBe('total');
    // NASA durations are given to 0.1 s; coordinates are rounded to 0.1′.
    expect(Math.abs(c.centralDuration! - row.duration)).toBeLessThan(1.0);
    expect(Math.abs(c.max!.sun.altitude - row.sunAlt)).toBeLessThanOrEqual(1);
    expect(Math.abs(c.max!.sun.azimuth - row.sunAz)).toBeLessThanOrEqual(1);
    expect(Math.abs(c.max!.moonSunRatio - row.ratio)).toBeLessThan(0.0011);
    const ut = c.max!.time.toISOString().slice(11, 16);
    const minutes = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3, 5));
    expect(Math.abs(minutes(ut) - minutes(row.ut))).toBeLessThanOrEqual(1);
  });

  it.each(rows)('limits of totality at $ut UT (< 0.6 km)', (row) => {
    for (const side of ['north', 'south'] as const) {
      const [lon, lat] = row[side];
      const lim = totalityLimits(ECLIPSE_2027, lon, NASA_DT);
      const dLatKm = Math.abs(lim[side]! - lat) * 111.2;
      expect(dLatKm).toBeLessThan(0.6);
    }
  });
});

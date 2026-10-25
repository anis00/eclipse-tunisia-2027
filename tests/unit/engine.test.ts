import { describe, expect, it } from 'vitest';
import { obscuration, sunPosition, tToDate, dateToT } from '../../src/lib/eclipse/circumstances.ts';
import { ECLIPSE_2027 } from '../../src/lib/eclipse/elements.ts';
import { eclipseAt, limitInfo } from '../../src/lib/eclipse/index.ts';
import { formatMagnitude, formatObscuration, formatDuration } from '../../src/lib/format.ts';

describe('geometry helpers', () => {
  it('obscuration of disjoint, contained and equal disks', () => {
    expect(obscuration(1, 1, 2.5)).toBe(0);
    expect(obscuration(1, 1.1, 0)).toBe(1);
    expect(obscuration(1, 0.5, 0)).toBeCloseTo(0.25, 10);
    // Two equal disks offset by one radius overlap by ≈ 39.1 %.
    expect(obscuration(1, 1, 1)).toBeCloseTo(0.391, 3);
  });
  it('sun position: hour angle 0 at the equator with dec 0 is the zenith', () => {
    expect(sunPosition(0, 0, 0).altitude).toBeCloseTo(90, 6);
    expect(sunPosition(34, -30, 18).azimuth).toBeGreaterThan(90);
    expect(sunPosition(34, -30, 18).azimuth).toBeLessThan(180);
  });
  it('time conversion is reversible', () => {
    const d = tToDate(ECLIPSE_2027, -0.85, 69.2);
    expect(dateToT(ECLIPSE_2027, d, 69.2)).toBeCloseTo(-0.85, 10);
  });
});

describe('local circumstances', () => {
  it('Sfax is total, Tunis is partial, contacts are ordered', () => {
    const sfax = eclipseAt(34.74056, 10.76028);
    expect(sfax.kind).toBe('total');
    expect(sfax.c1!.time < sfax.c2!.time && sfax.c2!.time < sfax.max!.time).toBe(true);
    expect(sfax.max!.time < sfax.c3!.time && sfax.c3!.time < sfax.c4!.time).toBe(true);
    expect(sfax.centralDuration!).toBeGreaterThan(330);
    expect(sfax.centralDuration!).toBeLessThan(345);
    const tunis = eclipseAt(36.81897, 10.16579);
    expect(tunis.kind).toBe('partial');
    expect(tunis.c2).toBeUndefined();
    expect(tunis.centralDuration).toBeUndefined();
    expect(tunis.max!.magnitude).toBeLessThan(1);
  });
  it('no eclipse far away (Cape Town)', () => {
    expect(eclipseAt(-33.92, 18.42).kind).toBe('none');
  });
  it('limit information is consistent with the kind of eclipse', () => {
    for (const [lat, lon] of [
      [34.74, 10.76],
      [35.68, 10.1],
      [35.83, 10.64],
      [36.82, 10.17],
      [33.7, 8.97],
    ]) {
      const e = eclipseAt(lat!, lon!);
      const l = limitInfo(lat!, lon!)!;
      expect(l.inside).toBe(e.kind === 'total');
    }
  });
});

describe('display formatting never suggests totality for a partial eclipse', () => {
  it('truncates deep partial values', () => {
    expect(formatObscuration(0.99997, false, 'en')).not.toContain('100');
    expect(formatMagnitude(0.9996, false, 'en')).toBe('0.999');
    expect(formatObscuration(1, true, 'fr')).toMatch(/100/);
  });
  it('formats durations', () => {
    expect(formatDuration(339.4, 'en')).toBe('5 min 39 s');
    expect(formatDuration(42, 'fr')).toBe('42 s');
    expect(formatDuration(246, 'ar')).toBe('4 د 06 ث');
  });
});

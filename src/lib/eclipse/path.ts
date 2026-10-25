/**
 * Geometry of the eclipse path on the ground, derived from the Besselian
 * elements by root finding along meridians: for each longitude, the latitude
 * where a given quantity (umbral margin, central duration, magnitude) reaches a
 * target value. Heights are taken at sea level (h = 0).
 */
import type { BesselianElements } from './elements.ts';
import { computeLocalCircumstances, shadowState, timeOfMaximum } from './circumstances.ts';

export type LonLat = [number, number];

/** Distance to the shadow axis and umbral radius at the instant of maximum eclipse. */
function atMaximum(el: BesselianElements, lat: number, lon: number, deltaT: number) {
  const o = { lat, lon, height: 0 };
  const t = timeOfMaximum(el, o, deltaT);
  return shadowState(el, o, t, deltaT);
}

function bisectLat(f: (lat: number) => number, lo: number, hi: number, iterations = 36): number | null {
  let flo = f(lo);
  const fhi = f(hi);
  if (Math.sign(flo) === Math.sign(fhi)) return null;
  for (let i = 0; i < iterations; i++) {
    const mid = (lo + hi) / 2;
    const fm = f(mid);
    if (Math.sign(fm) === Math.sign(flo)) {
      lo = mid;
      flo = fm;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}

/** Latitude of the central line on a meridian (minimum of m), golden-section search. */
export function centralLatitude(el: BesselianElements, lon: number, deltaT: number, lo = 0, hi = 60): number {
  const g = (Math.sqrt(5) - 1) / 2;
  let a = lo;
  let b = hi;
  let c = b - g * (b - a);
  let d = a + g * (b - a);
  let fc = atMaximum(el, c, lon, deltaT).m;
  let fd = atMaximum(el, d, lon, deltaT).m;
  while (b - a > 1e-7) {
    if (fc < fd) {
      b = d;
      d = c;
      fd = fc;
      c = b - g * (b - a);
      fc = atMaximum(el, c, lon, deltaT).m;
    } else {
      a = c;
      c = d;
      fc = fd;
      d = a + g * (b - a);
      fd = atMaximum(el, d, lon, deltaT).m;
    }
  }
  return (a + b) / 2;
}

export interface MeridianCrossing {
  lon: number;
  central: number;
  north: number | null;
  south: number | null;
}

/** Northern and southern limits of totality on a meridian. */
export function totalityLimits(el: BesselianElements, lon: number, deltaT: number): MeridianCrossing {
  const central = centralLatitude(el, lon, deltaT);
  const margin = (lat: number) => {
    const s = atMaximum(el, lat, lon, deltaT);
    return s.m - Math.abs(s.L2);
  };
  return {
    lon,
    central,
    north: bisectLat(margin, central, central + 4),
    south: bisectLat(margin, central - 4, central),
  };
}

/** Latitudes on both sides of the central line where the central duration equals `seconds`. */
export function durationCrossings(el: BesselianElements, lon: number, deltaT: number, seconds: number, central: number) {
  const f = (lat: number) => (computeLocalCircumstances(el, { lat, lon }, deltaT).centralDuration ?? 0) - seconds;
  return { north: bisectLat(f, central, central + 2), south: bisectLat(f, central - 2, central) };
}

/** Latitudes on both sides of the central line where the magnitude equals `magnitude` (< 1). */
export function magnitudeCrossings(el: BesselianElements, lon: number, deltaT: number, magnitude: number, central: number) {
  const f = (lat: number) => {
    const s = atMaximum(el, lat, lon, deltaT);
    return (s.L1 - s.m) / (s.L1 + s.L2) - magnitude;
  };
  return {
    north: bisectLat(f, central, Math.min(central + 25, 85)),
    south: bisectLat(f, Math.max(central - 25, -85), central),
  };
}

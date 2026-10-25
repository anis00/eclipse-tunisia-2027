/**
 * Local circumstances of a solar eclipse from polynomial Besselian elements.
 *
 * Method: Explanatory Supplement to the Astronomical Almanac (1992), ch. 8, and
 * J. Meeus, "Elements of Solar Eclipses 1951–2200" (1989). The observer is
 * projected onto the fundamental plane; contacts are the instants where the
 * distance m between observer and shadow axis equals the penumbral radius L1
 * (partial phase) or the umbral radius |L2| (total phase).
 *
 * Conventions:
 *  - latitude: geodetic, degrees, north positive (WGS 84)
 *  - longitude: degrees, EAST positive
 *  - height: metres above the ellipsoid (sea level is a fine approximation)
 *  - all instants are returned as JavaScript Date objects in UTC (UT1 ≈ UTC)
 *  - altitude/azimuth of the Sun are geometric (no refraction), azimuth measured
 *    from north through east.
 *
 * Accuracy limits are documented in docs/ASTRONOMY.md (lunar limb profile,
 * ΔT, elevation, topography).
 */
import type { BesselianElements, Poly } from './elements.ts';

const DEG = Math.PI / 180;
/** Earth flattening ratio b/a for WGS 84 / IAU (1 − f) */
const B_OVER_A = 0.99664719;
const EARTH_RADIUS_M = 6378137;

export type EclipseKind = 'none' | 'partial' | 'total' | 'annular';

export interface Observer {
  lat: number;
  lon: number;
  height?: number;
}

export interface SunPosition {
  /** Geometric altitude (degrees) */
  altitude: number;
  /** Azimuth from north through east (degrees) */
  azimuth: number;
}

export interface ContactEvent {
  /** Instant (UTC) */
  time: Date;
  sun: SunPosition;
}

export interface MaximumEvent extends ContactEvent {
  /** Eclipse magnitude: fraction of the Sun's diameter covered by the Moon */
  magnitude: number;
  /** Obscuration: fraction of the Sun's disk area covered (0–1) */
  obscuration: number;
  /** Ratio of the apparent diameters Moon / Sun */
  moonSunRatio: number;
}

export interface LocalCircumstances {
  observer: Required<Observer>;
  kind: EclipseKind;
  /** First contact (start of the partial phase) */
  c1?: ContactEvent;
  /** Second contact (start of totality) */
  c2?: ContactEvent;
  max?: MaximumEvent;
  /** Third contact (end of totality) */
  c3?: ContactEvent;
  /** Fourth contact (end of the partial phase) */
  c4?: ContactEvent;
  /** Duration of the central (total) phase in seconds */
  centralDuration?: number;
  /** True when part of the eclipse happens with the Sun below the horizon */
  horizonLimited: boolean;
  /** ΔT used for the computation (s) */
  deltaT: number;
}

/** Shadow geometry relative to the observer at an instant t (hours from t0, TDT). */
export interface ShadowState {
  t: number;
  /** Observer → shadow axis vector on the fundamental plane (Earth radii) */
  u: number;
  v: number;
  /** Time derivatives of u and v (Earth radii per hour) */
  a: number;
  b: number;
  /** Distance observer–axis */
  m: number;
  /** Penumbral and umbral radii at the observer */
  L1: number;
  L2: number;
  /** Height of the observer above the fundamental plane (≈ sin of Sun's altitude) */
  zeta: number;
  /** Hour angle of the shadow axis at the observer (degrees) */
  H: number;
  /** Declination of the shadow axis (degrees) */
  d: number;
}

function poly(c: Poly, t: number): number {
  return c[0] + t * (c[1] + t * (c[2] + t * c[3]));
}

function polyDot(c: Poly, t: number): number {
  return c[1] + t * (2 * c[2] + t * 3 * c[3]);
}

interface ObserverConstants {
  rhoSinPhi: number;
  rhoCosPhi: number;
  sinLat: number;
  cosLat: number;
}

function observerConstants(o: Required<Observer>): ObserverConstants {
  const phi = o.lat * DEG;
  const U = Math.atan(B_OVER_A * Math.tan(phi));
  const hr = o.height / EARTH_RADIUS_M;
  return {
    rhoSinPhi: B_OVER_A * Math.sin(U) + hr * Math.sin(phi),
    rhoCosPhi: Math.cos(U) + hr * Math.cos(phi),
    sinLat: Math.sin(phi),
    cosLat: Math.cos(phi),
  };
}

export function shadowState(
  el: BesselianElements,
  o: Required<Observer>,
  t: number,
  deltaT: number,
  k: ObserverConstants = observerConstants(o),
): ShadowState {
  const x = poly(el.x, t);
  const y = poly(el.y, t);
  const d = poly(el.d, t);
  const l1 = poly(el.l1, t);
  const l2 = poly(el.l2, t);
  const mu = poly(el.mu, t);
  const xd = polyDot(el.x, t);
  const yd = polyDot(el.y, t);
  const dd = polyDot(el.d, t) * DEG;
  const mud = polyDot(el.mu, t) * DEG;

  const H = mu + o.lon - 0.00417807 * deltaT;
  const sH = Math.sin(H * DEG);
  const cH = Math.cos(H * DEG);
  const sd = Math.sin(d * DEG);
  const cd = Math.cos(d * DEG);

  const xi = k.rhoCosPhi * sH;
  const eta = k.rhoSinPhi * cd - k.rhoCosPhi * cH * sd;
  const zeta = k.rhoSinPhi * sd + k.rhoCosPhi * cH * cd;
  const xiDot = mud * k.rhoCosPhi * cH;
  const etaDot = mud * xi * sd - zeta * dd;

  const u = x - xi;
  const v = y - eta;
  return {
    t,
    u,
    v,
    a: xd - xiDot,
    b: yd - etaDot,
    m: Math.hypot(u, v),
    L1: l1 - zeta * el.tanF1,
    L2: l2 - zeta * el.tanF2,
    zeta,
    H,
    d,
  };
}

/** Sun position from the hour angle and declination of the shadow axis. */
export function sunPosition(lat: number, H: number, d: number): SunPosition {
  const phi = lat * DEG;
  const h = H * DEG;
  const dec = d * DEG;
  const sinAlt = Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(h);
  const altitude = Math.asin(Math.max(-1, Math.min(1, sinAlt))) / DEG;
  const az = Math.atan2(Math.sin(h), Math.cos(h) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi)) / DEG + 180;
  return { altitude, azimuth: ((az % 360) + 360) % 360 };
}

/** Area fraction of a disk of radius rs hidden by a disk of radius rm at centre distance m. */
export function obscuration(rs: number, rm: number, m: number): number {
  if (m >= rs + rm) return 0;
  if (m <= Math.abs(rm - rs)) return rm >= rs ? 1 : (rm * rm) / (rs * rs);
  const a1 = rs * rs * Math.acos((m * m + rs * rs - rm * rm) / (2 * m * rs));
  const a2 = rm * rm * Math.acos((m * m + rm * rm - rs * rs) / (2 * m * rm));
  const a3 = 0.5 * Math.sqrt((-m + rs + rm) * (m + rs - rm) * (m - rs + rm) * (m + rs + rm));
  return (a1 + a2 - a3) / (Math.PI * rs * rs);
}

/** Converts t (hours from t0, TDT) to a UTC Date. */
export function tToDate(el: BesselianElements, t: number, deltaT: number): Date {
  const base = Date.parse(`${el.date}T00:00:00Z`);
  return new Date(base + ((el.t0 + t) * 3600 - deltaT) * 1000);
}

/** Converts a UTC Date to t (hours from t0, TDT). */
export function dateToT(el: BesselianElements, date: Date, deltaT: number): number {
  const base = Date.parse(`${el.date}T00:00:00Z`);
  return ((date.getTime() - base) / 1000 + deltaT) / 3600 - el.t0;
}

/** Validity window of the polynomial elements (hours from t0). */
const T_MIN = -3.5;
const T_MAX = 3.5;

function bisect(f: (t: number) => number, lo: number, hi: number, iterations = 40): number {
  let flo = f(lo);
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

/**
 * Instant of maximum eclipse for an observer (minimum of m), in hours from t0.
 * Coarse scan then Newton refinement (Meeus): τ = −(u·a + v·b) / (a² + b²).
 */
export function timeOfMaximum(el: BesselianElements, o: Required<Observer>, deltaT: number): number {
  const k = observerConstants(o);
  let best = 0;
  let bestM = Infinity;
  for (let t = T_MIN; t <= T_MAX; t += 1 / 60) {
    const s = shadowState(el, o, t, deltaT, k);
    if (s.m < bestM) {
      bestM = s.m;
      best = t;
    }
  }
  let t = best;
  for (let i = 0; i < 8; i++) {
    const s = shadowState(el, o, t, deltaT, k);
    const tau = -(s.u * s.a + s.v * s.b) / (s.a * s.a + s.b * s.b);
    t += tau;
    if (Math.abs(tau) < 1e-9) break;
  }
  return t;
}

export function computeLocalCircumstances(
  el: BesselianElements,
  observer: Observer,
  deltaT: number,
): LocalCircumstances {
  const o: Required<Observer> = { lat: observer.lat, lon: observer.lon, height: observer.height ?? 0 };
  const k = observerConstants(o);
  const state = (t: number) => shadowState(el, o, t, deltaT, k);
  const event = (t: number): ContactEvent => {
    const s = state(t);
    return { time: tToDate(el, t, deltaT), sun: sunPosition(o.lat, s.H, s.d) };
  };

  const tMax = timeOfMaximum(el, o, deltaT);
  const sMax = state(tMax);
  const result: LocalCircumstances = { observer: o, kind: 'none', horizonLimited: false, deltaT };
  if (sMax.m >= sMax.L1) return result;

  const penumbra = (t: number) => {
    const s = state(t);
    return s.m - s.L1;
  };
  const tC1 = bisect(penumbra, T_MIN, tMax);
  const tC4 = bisect(penumbra, tMax, T_MAX);

  const rs = (sMax.L1 + sMax.L2) / 2;
  const rm = (sMax.L1 - sMax.L2) / 2;
  const magnitude = (sMax.L1 - sMax.m) / (sMax.L1 + sMax.L2);
  result.kind = 'partial';
  result.c1 = event(tC1);
  result.c4 = event(tC4);
  result.max = {
    ...event(tMax),
    magnitude,
    obscuration: obscuration(rs, rm, sMax.m),
    moonSunRatio: rm / rs,
  };

  if (sMax.m < Math.abs(sMax.L2)) {
    result.kind = sMax.L2 < 0 ? 'total' : 'annular';
    const umbra = (t: number) => {
      const s = state(t);
      return s.m - Math.abs(s.L2);
    };
    const tC2 = bisect(umbra, tMax - 0.5, tMax);
    const tC3 = bisect(umbra, tMax, tMax + 0.5);
    result.c2 = event(tC2);
    result.c3 = event(tC3);
    result.centralDuration = (tC3 - tC2) * 3600;
  }

  result.horizonLimited = [result.c1, result.c4, result.max].some((e) => e && e.sun.altitude < 0);
  return result;
}

/**
 * Apparent geometry for drawing the Sun and Moon as seen by the observer.
 * Units: solar radii. (dx, dy) is the Moon centre relative to the Sun centre,
 * dx positive towards celestial east, dy positive towards celestial north.
 * `parallacticAngle` (degrees) rotates north-up to zenith-up.
 */
export interface ApparentDisks {
  moonRadius: number;
  dx: number;
  dy: number;
  parallacticAngle: number;
  magnitude: number;
  obscuration: number;
  sun: SunPosition;
}

export function apparentDisks(
  el: BesselianElements,
  observer: Observer,
  date: Date,
  deltaT: number,
): ApparentDisks {
  const o: Required<Observer> = { lat: observer.lat, lon: observer.lon, height: observer.height ?? 0 };
  const s = shadowState(el, o, dateToT(el, date, deltaT), deltaT);
  const rs = (s.L1 + s.L2) / 2;
  const rm = (s.L1 - s.L2) / 2;
  const phi = o.lat * DEG;
  const h = s.H * DEG;
  const dec = s.d * DEG;
  const q = Math.atan2(Math.sin(h), Math.tan(phi) * Math.cos(dec) - Math.sin(dec) * Math.cos(h)) / DEG;
  return {
    moonRadius: rm / rs,
    dx: s.u / rs,
    dy: s.v / rs,
    parallacticAngle: q,
    magnitude: Math.max(0, (s.L1 - s.m) / (s.L1 + s.L2)),
    obscuration: obscuration(rs, rm, s.m),
    sun: sunPosition(o.lat, s.H, s.d),
  };
}

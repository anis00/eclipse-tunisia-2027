/**
 * Public façade of the eclipse engine, bound to the 2027 August 2 elements and
 * the adopted ΔT. Used both at build time (Astro pages) and in the browser.
 */
import { ADOPTED_DELTA_T, ECLIPSE_2027 } from './elements.ts';
import { apparentDisks, computeLocalCircumstances, type LocalCircumstances } from './circumstances.ts';
import { totalityLimits } from './path.ts';

export type { LocalCircumstances } from './circumstances.ts';
export { ADOPTED_DELTA_T, ECLIPSE_2027 } from './elements.ts';

/** Kilometres per degree of latitude (mean). */
const KM_PER_DEG_LAT = 111.2;
/** Below this distance to a limit, results are flagged as sensitive (lunar limb, ΔT, elevation). */
export const NEAR_LIMIT_KM = 5;

export function eclipseAt(lat: number, lon: number, height = 0): LocalCircumstances {
  return computeLocalCircumstances(ECLIPSE_2027, { lat, lon, height }, ADOPTED_DELTA_T);
}

export function disksAt(lat: number, lon: number, date: Date) {
  return apparentDisks(ECLIPSE_2027, { lat, lon }, date, ADOPTED_DELTA_T);
}

export interface LimitInfo {
  inside: boolean;
  /** Distance along the meridian to the nearest limit (inside) or to the path (outside), km */
  km: number;
  /** Direction of the path when outside */
  direction: 'north' | 'south' | null;
}

/**
 * Distance to the limits of totality measured along the local meridian. Across
 * Tunisia the path is inclined by less than 10° to the parallels, so this is
 * within ~2 % of the perpendicular distance.
 */
export function limitInfo(lat: number, lon: number): LimitInfo | null {
  const lim = totalityLimits(ECLIPSE_2027, lon, ADOPTED_DELTA_T);
  if (lim.north === null || lim.south === null) return null;
  if (lat <= lim.north && lat >= lim.south) {
    return { inside: true, km: Math.min(lim.north - lat, lat - lim.south) * KM_PER_DEG_LAT, direction: null };
  }
  return lat > lim.north
    ? { inside: false, km: (lat - lim.north) * KM_PER_DEG_LAT, direction: 'south' }
    : { inside: false, km: (lim.south - lat) * KM_PER_DEG_LAT, direction: 'north' };
}

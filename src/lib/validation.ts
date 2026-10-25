/**
 * Scientific validation computed at build time (also used by scripts/validate-engine.ts):
 *  1. engine (ΔT = 76 s) vs NASA path table on the Tunisian section;
 *  2. engine vs Astronomy Engine (same ΔT) for reference towns.
 */
import * as A from 'astronomy-engine';
import nasa from '../../tests/fixtures/nasa-path-2027.json';
import { ECLIPSE_2027 } from './eclipse/elements.ts';
import { computeLocalCircumstances } from './eclipse/circumstances.ts';
import { totalityLimits } from './eclipse/path.ts';
import { ADOPTED_DELTA_T, eclipseAt, limitInfo } from './eclipse/index.ts';
import { cities } from './data.ts';

/** ΔT used by NASA for the published path table. */
const NASA_DELTA_T = 76.0;

export interface NasaRow {
  ut: string;
  lat: number;
  lon: number;
  nasaDuration: number;
  engineDuration: number;
  northKm: number;
  southKm: number;
}

export function nasaComparison(from = '09:00', to = '09:20'): NasaRow[] {
  return nasa.rows
    .filter((r) => r.ut >= from && r.ut <= to)
    .map((r) => {
      const [lon, lat] = r.central as [number, number];
      const c = computeLocalCircumstances(ECLIPSE_2027, { lat, lon }, NASA_DELTA_T);
      const n = totalityLimits(ECLIPSE_2027, r.north[0]!, NASA_DELTA_T).north!;
      const s = totalityLimits(ECLIPSE_2027, r.south[0]!, NASA_DELTA_T).south!;
      return {
        ut: r.ut,
        lat,
        lon,
        nasaDuration: r.duration,
        engineDuration: c.centralDuration ?? 0,
        northKm: (n - r.north[1]!) * 111.2,
        southKm: (s - r.south[1]!) * 111.2,
      };
    });
}

export interface CrossRow {
  id: string;
  kind: string;
  refKind: string;
  limitKm: number | null;
  inside: boolean;
  dC1: number;
  dC2: number | null;
  dMax: number;
  dC3: number | null;
  dC4: number;
  duration: number | null;
  refDuration: number | null;
}

export const CROSS_IDS = ['sfax', 'sidi-bouzid', 'gafsa', 'gabes', 'houmt-souk', 'el-jem', 'kairouan', 'mahdia', 'tozeur', 'kebili', 'matmata', 'sousse', 'monastir', 'tunis', 'bizerte', 'tataouine'];

export function crossComparison(ids = CROSS_IDS): CrossRow[] {
  A.SetDeltaTFunction(() => ADOPTED_DELTA_T);
  const s = (a: Date, b: Date) => (a.getTime() - b.getTime()) / 1000;
  return ids.map((id) => {
    const c = cities.find((x) => x.id === id)!;
    const e = eclipseAt(c.lat, c.lon);
    const r = A.SearchLocalSolarEclipse(new Date('2027-08-01T00:00:00Z'), new A.Observer(c.lat, c.lon, 0));
    const lim = limitInfo(c.lat, c.lon);
    const both = e.kind === 'total' && r.kind === 'total';
    return {
      id,
      kind: e.kind,
      refKind: r.kind,
      limitKm: lim?.km ?? null,
      inside: lim?.inside ?? false,
      dC1: s(e.c1!.time, r.partial_begin.time.date),
      dC2: both ? s(e.c2!.time, r.total_begin!.time.date) : null,
      dMax: s(e.max!.time, r.peak.time.date),
      dC3: both ? s(e.c3!.time, r.total_end!.time.date) : null,
      dC4: s(e.c4!.time, r.partial_end.time.date),
      duration: e.centralDuration ?? null,
      refDuration: r.total_begin && r.total_end ? (r.total_end.time.ut - r.total_begin.time.ut) * 86400 : null,
    };
  });
}

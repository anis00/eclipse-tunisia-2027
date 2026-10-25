/** Build-time data access: places, destinations, climate, with computed eclipse circumstances. */
import citiesFile from '../data/cities.json' with { type: 'json' };
import destinationsFile from '../data/destinations.json' with { type: 'json' };
import climateFile from '../data/climate.json' with { type: 'json' };
import { eclipseAt, limitInfo, type LimitInfo, type LocalCircumstances } from './eclipse/index.ts';
import type { Lang } from '../i18n/config.ts';
import { geometryContains, readGeoJSON } from './svgmap.ts';

export interface City {
  id: string;
  geonameId: number;
  name: Record<Lang, string>;
  lat: number;
  lon: number;
  population: number;
  governorateCode: string;
  capital: boolean;
}

export interface CityWithEclipse extends City {
  eclipse: LocalCircumstances;
  limit: LimitInfo | null;
}

type Localized<T> = Record<Lang, T>;

export interface Destination {
  id: string;
  cityId: string;
  governorate: string;
  advisory?: boolean;
  airports: { iata: string; name: Localized<string> }[];
  unesco: { url: string; name: Localized<string> }[];
  text: Localized<{ summary: string; description: string; access: string; nearby: string }>;
}

export interface ClimatePoint {
  id: string;
  lat: number;
  lon: number;
  gridLat: number;
  gridLon: number;
  samples: number;
  meanCloudCover: number;
  clearShare: number;
  cloudyShare: number;
  meanTemperature: number;
}

export const cities: City[] = citiesFile.cities as City[];
export const destinations: Destination[] = destinationsFile.destinations as Destination[];
export const destinationsVerified: string = destinationsFile.verified;
export const climate = climateFile as {
  source: string;
  method: string;
  period: [number, number];
  generated: string;
  points: ClimatePoint[];
};

let cache: CityWithEclipse[] | null = null;
export function citiesWithEclipse(): CityWithEclipse[] {
  cache ??= cities.map((c) => ({ ...c, eclipse: eclipseAt(c.lat, c.lon), limit: limitInfo(c.lat, c.lon) }));
  return cache;
}

export function cityById(id: string): CityWithEclipse {
  const c = citiesWithEclipse().find((x) => x.id === id);
  if (!c) throw new Error(`Unknown city id: ${id}`);
  return c;
}

export const GOVERNORATES: Record<string, Localized<string>> = {
  'TN-11': { en: 'Tunis', fr: 'Tunis', ar: 'تونس' },
  'TN-12': { en: 'Ariana', fr: 'Ariana', ar: 'أريانة' },
  'TN-13': { en: 'Ben Arous', fr: 'Ben Arous', ar: 'بن عروس' },
  'TN-14': { en: 'Manouba', fr: 'La Manouba', ar: 'منوبة' },
  'TN-21': { en: 'Nabeul', fr: 'Nabeul', ar: 'نابل' },
  'TN-22': { en: 'Zaghouan', fr: 'Zaghouan', ar: 'زغوان' },
  'TN-23': { en: 'Bizerte', fr: 'Bizerte', ar: 'بنزرت' },
  'TN-31': { en: 'Béja', fr: 'Béja', ar: 'باجة' },
  'TN-32': { en: 'Jendouba', fr: 'Jendouba', ar: 'جندوبة' },
  'TN-33': { en: 'Le Kef', fr: 'Le Kef', ar: 'الكاف' },
  'TN-34': { en: 'Siliana', fr: 'Siliana', ar: 'سليانة' },
  'TN-41': { en: 'Kairouan', fr: 'Kairouan', ar: 'القيروان' },
  'TN-42': { en: 'Kasserine', fr: 'Kasserine', ar: 'القصرين' },
  'TN-43': { en: 'Sidi Bouzid', fr: 'Sidi Bouzid', ar: 'سيدي بوزيد' },
  'TN-51': { en: 'Sousse', fr: 'Sousse', ar: 'سوسة' },
  'TN-52': { en: 'Monastir', fr: 'Monastir', ar: 'المنستير' },
  'TN-53': { en: 'Mahdia', fr: 'Mahdia', ar: 'المهدية' },
  'TN-61': { en: 'Sfax', fr: 'Sfax', ar: 'صفاقس' },
  'TN-71': { en: 'Gafsa', fr: 'Gafsa', ar: 'قفصة' },
  'TN-72': { en: 'Tozeur', fr: 'Tozeur', ar: 'توزر' },
  'TN-73': { en: 'Kebili', fr: 'Kébili', ar: 'قبلي' },
  'TN-81': { en: 'Gabès', fr: 'Gabès', ar: 'قابس' },
  'TN-82': { en: 'Medenine', fr: 'Médenine', ar: 'مدنين' },
  'TN-83': { en: 'Tataouine', fr: 'Tataouine', ar: 'تطاوين' },
};

export interface TunisiaFacts {
  /** Longest central duration on Tunisian land (s) and where it occurs */
  maxDuration: number;
  maxAt: { lat: number; lon: number };
  /** Earliest start and latest end of totality among sampled Tunisian points */
  firstC2: Date;
  lastC3: Date;
  /** Sun altitude at maximum on the central line in Tunisia (degrees, range) */
  sunAltitude: [number, number];
}

let factsCache: TunisiaFacts | null = null;
/** Key figures computed from the central line and the limits inside Tunisia. */
export function tunisiaFacts(): TunisiaFacts {
  if (factsCache) return factsCache;
  const gov = readGeoJSON('tunisia-governorates.geojson').features;
  const path = readGeoJSON('eclipse-2027-path.geojson').features;
  const inside = (lon: number, lat: number) => gov.some((f) => geometryContains(f.geometry, lon, lat));
  const central = (path.find((f) => f.properties.kind === 'central')!.geometry.coordinates as number[][]).filter(
    ([lon, lat]) => inside(lon!, lat!),
  );
  let maxDuration = 0;
  let maxAt = { lat: 0, lon: 0 };
  let firstC2 = Infinity;
  let lastC3 = -Infinity;
  let altMin = 90;
  let altMax = 0;
  for (const [lon, lat] of central) {
    const e = eclipseAt(lat!, lon!);
    if (!e.centralDuration) continue;
    if (e.centralDuration > maxDuration) [maxDuration, maxAt] = [e.centralDuration, { lat: lat!, lon: lon! }];
    altMin = Math.min(altMin, e.max!.sun.altitude);
    altMax = Math.max(altMax, e.max!.sun.altitude);
  }
  // Earliest/latest totality: limits and central line points on Tunisian land.
  for (const f of path.filter((x) => x.properties.kind === 'limit' || x.properties.kind === 'central')) {
    for (const [lon, lat] of f.geometry.coordinates as number[][]) {
      if (!inside(lon!, lat!)) continue;
      // Points exactly on a limit have zero duration: nudge 1 km towards the centre.
      const nudge = f.properties.side === 'north' ? -0.009 : f.properties.side === 'south' ? 0.009 : 0;
      const e = eclipseAt(lat! + nudge, lon!);
      if (e.c2 && e.c3) {
        firstC2 = Math.min(firstC2, e.c2.time.getTime());
        lastC3 = Math.max(lastC3, e.c3.time.getTime());
      }
    }
  }
  factsCache = { maxDuration, maxAt, firstC2: new Date(firstC2), lastC3: new Date(lastC3), sunAltitude: [altMin, altMax] };
  return factsCache;
}

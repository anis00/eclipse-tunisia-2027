/**
 * Builds src/data/cities.json from the GeoNames Tunisia extracts.
 *
 *   node --experimental-strip-types scripts/build-cities.ts <TN.txt> <alternatenames/TN.txt>
 *
 * Inputs (CC BY 4.0, https://download.geonames.org/export/dump/):
 *   - TN.zip                  → TN.txt (geonames table)
 *   - alternatenames/TN.zip   → TN.txt (alternate names with language codes)
 *
 * Keeps the curated places listed in CURATED (governorate capitals, main towns
 * and places frequently visited by travellers).
 */
import { readFileSync, writeFileSync } from 'node:fs';

const [geonamesPath, altPath] = process.argv.slice(2);
if (!geonamesPath || !altPath) {
  console.error('Usage: build-cities.ts <TN.txt> <alternatenames TN.txt>');
  process.exit(1);
}

/**
 * Curated places: GeoNames name → localized display names. GeoNames Arabic names
 * are incomplete or sometimes wrong, so Arabic (and some French/English) names
 * are set explicitly here and reviewed by hand.
 */
const CURATED: Record<string, { en?: string; fr?: string; ar: string }> = {
  Tunis: { ar: 'تونس' },
  Sfax: { ar: 'صفاقس' },
  Sousse: { ar: 'سوسة' },
  Kairouan: { ar: 'القيروان' },
  Bizerte: { ar: 'بنزرت' },
  Aryanah: { en: 'Ariana', fr: 'Ariana', ar: 'أريانة' },
  'Gabès': { ar: 'قابس' },
  Hammamet: { ar: 'الحمامات' },
  Gafsa: { ar: 'قفصة' },
  Monastir: { ar: 'المنستير' },
  "M'saken": { fr: 'Msaken', ar: 'مساكن' },
  'Houmt Souk': { fr: 'Houmt Souk (Djerba)', en: 'Houmt Souk (Djerba)', ar: 'حومة السوق (جربة)' },
  Midoun: { fr: 'Midoun (Djerba)', en: 'Midoun (Djerba)', ar: 'ميدون (جربة)' },
  Ajim: { fr: 'Ajim (Djerba)', en: 'Ajim (Djerba)', ar: 'أجيم (جربة)' },
  'Ben Arous': { ar: 'بن عروس' },
  'Ben Gardane': { en: 'Ben Guerdane', fr: 'Ben Guerdane', ar: 'بن قردان' },
  Kasserine: { ar: 'القصرين' },
  Zarzis: { ar: 'جرجيس' },
  Feriana: { fr: 'Fériana', ar: 'فريانة' },
  Medenine: { fr: 'Médenine', ar: 'مدنين' },
  Nabeul: { ar: 'نابل' },
  Tataouine: { ar: 'تطاوين' },
  Kelibia: { fr: 'Kélibia', ar: 'قليبية' },
  Moknine: { ar: 'المكنين' },
  'Béja': { ar: 'باجة' },
  'El Kef': { en: 'Le Kef', fr: 'Le Kef', ar: 'الكاف' },
  Mahdia: { ar: 'المهدية' },
  Jendouba: { ar: 'جندوبة' },
  'Sidi Bouzid': { ar: 'سيدي بوزيد' },
  'El Hamma': { ar: 'الحامة' },
  'Ksar Hellal': { ar: 'قصر هلال' },
  Djemmal: { ar: 'جمال' },
  Metlaoui: { ar: 'المتلوي' },
  'Ksour Essaf': { ar: 'قصور الساف' },
  Tozeur: { ar: 'توزر' },
  Douz: { ar: 'دوز' },
  Manouba: { ar: 'منوبة' },
  Siliana: { ar: 'سليانة' },
  Kebili: { fr: 'Kébili', ar: 'قبلي' },
  'Ar Rudayyif': { en: 'Redeyef', fr: 'Redeyef', ar: 'الرديف' },
  Carthage: { ar: 'قرطاج' },
  Sbeitla: { fr: 'Sbeïtla', ar: 'سبيطلة' },
  Nefta: { ar: 'نفطة' },
  Chebba: { ar: 'الشابة' },
  'El Jem': { ar: 'الجم' },
  'Moularès': { ar: 'أم العرائس' },
  Tabarka: { ar: 'طبرقة' },
  Zaghouan: { ar: 'زغوان' },
  Matmata: { ar: 'مطماطة' },
  Chebika: { ar: 'الشبيكة' },
  Degache: { ar: 'دقاش' },
  Teboulba: { ar: 'طبلبة' },
  'Hammam Sousse': { ar: 'حمام سوسة' },
  'El Fahs': { ar: 'الفحص' },
  Dahmani: { ar: 'الدهماني' },
  Sbiba: { ar: 'سبيبة' },
  'Métouia': { ar: 'المطوية' },
  Bekalta: { ar: 'البقالطة' },
  'Kelaa Kebira': { fr: 'Kalâa Kebira', en: 'Kalaa Kebira', ar: 'القلعة الكبرى' },
  'Menzel Bourguiba': { ar: 'منزل بورقيبة' },
  Mateur: { ar: 'ماطر' },
  Korba: { ar: 'قربة' },
  'Menzel Temime': { ar: 'منزل تميم' },
  'Medjez el Bab': { ar: 'مجاز الباب' },
};

interface Row {
  id: number;
  name: string;
  lat: number;
  lon: number;
  fclass: string;
  fcode: string;
  admin1: string;
  population: number;
  elevation: number | null;
}

const rows: Row[] = readFileSync(geonamesPath, 'utf8')
  .split('\n')
  .filter(Boolean)
  .map((line) => line.split('\t'))
  .filter((f) => f[6] === 'P')
  .map((f) => ({
    id: Number(f[0]),
    name: f[1]!,
    lat: Number(f[4]),
    lon: Number(f[5]),
    fclass: f[6]!,
    fcode: f[7]!,
    admin1: f[10]!,
    population: Number(f[14]) || 0,
    elevation: f[16] ? Number(f[16]) : f[17] && f[17] !== '-9999' ? Number(f[17]) : null,
  }));

const keep = rows.filter((r) => r.name in CURATED && r.fcode !== 'PPLX');
const ids = new Set(keep.map((r) => r.id));

// alternate names: id, geonameid, lang, name, isPreferred, isShort, isColloquial, isHistoric
const alt = new Map<number, { fr?: string; ar?: string; frPref?: boolean; arPref?: boolean }>();
for (const line of readFileSync(altPath, 'utf8').split('\n')) {
  const f = line.split('\t');
  const gid = Number(f[1]);
  if (!ids.has(gid) || f[6] === '1' || f[7] === '1') continue;
  const lang = f[2];
  if (lang !== 'fr' && lang !== 'ar') continue;
  const entry = alt.get(gid) ?? {};
  const pref = f[4] === '1';
  if (lang === 'fr' && (!entry.fr || (pref && !entry.frPref))) Object.assign(entry, { fr: f[3], frPref: pref });
  if (lang === 'ar' && (!entry.ar || (pref && !entry.arPref))) Object.assign(entry, { ar: f[3], arPref: pref });
  alt.set(gid, entry);
}

// Drop duplicates of the same name (keep the most populated).
const byName = new Map<string, Row>();
for (const r of keep) {
  const prev = byName.get(r.name);
  if (!prev || r.population > prev.population) byName.set(r.name, r);
}

// Assign each place to its governorate (ISO 3166-2) by point-in-polygon on the
// boundary layer; this also checks that every coordinate falls inside Tunisia.
type Ring = [number, number][];
const gov = JSON.parse(readFileSync('public/data/tunisia-governorates.geojson', 'utf8')) as {
  features: { properties: { iso: string }; geometry: { type: string; coordinates: Ring[] | Ring[][] } }[];
};
const inRing = (x: number, y: number, ring: Ring) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]!;
    const [xj, yj] = ring[j]!;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
const inPolygon = (x: number, y: number, poly: Ring[]) => inRing(x, y, poly[0]!) && !poly.slice(1).some((h) => inRing(x, y, h));
function governorateOf(lon: number, lat: number): string {
  for (const f of gov.features) {
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates as Ring[]] : (f.geometry.coordinates as Ring[][]);
    if (polys.some((p) => inPolygon(lon, lat, p))) return f.properties.iso;
  }
  // Coastal points can fall just outside generalized coastlines: use the nearest vertex.
  let best = '';
  let bestD = Infinity;
  for (const f of gov.features) {
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates as Ring[]] : (f.geometry.coordinates as Ring[][]);
    for (const p of polys) for (const [x, y] of p[0]!) {
      const d = (x - lon) ** 2 + (y - lat) ** 2;
      if (d < bestD) [bestD, best] = [d, f.properties.iso];
    }
  }
  if (Math.sqrt(bestD) > 0.1) throw new Error(`Place outside Tunisia? ${lon},${lat}`);
  console.warn(`  ${lon},${lat}: assigned to nearest governorate ${best}`);
  return best;
}

const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const cities = [...byName.values()]
  .sort((a, b) => b.population - a.population)
  .map((r) => {
    const a = alt.get(r.id) ?? {};
    const cur = CURATED[r.name]!;
    return {
      id: slug(r.name),
      geonameId: r.id,
      name: {
        en: cur.en ?? r.name,
        fr: cur.fr ?? a.fr ?? r.name,
        ar: cur.ar,
      },
      lat: Math.round(r.lat * 1e5) / 1e5,
      lon: Math.round(r.lon * 1e5) / 1e5,
      population: r.population,
      governorateCode: governorateOf(r.lon, r.lat),
      capital: r.fcode === 'PPLC' || r.fcode === 'PPLA',
    };
  });

writeFileSync(
  'src/data/cities.json',
  JSON.stringify(
    {
      source: 'GeoNames (https://www.geonames.org), CC BY 4.0 — TN.zip and alternatenames/TN.zip',
      crs: 'EPSG:4326 (WGS 84)',
      generated: new Date().toISOString().slice(0, 10),
      cities,
    },
    null,
    1,
  ),
);
console.log(`Wrote ${cities.length} places.`);

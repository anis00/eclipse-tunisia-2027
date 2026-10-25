/** Registry of the sources used by the project (organisation, document, use, limits). */
import type { Lang } from '../i18n/config.ts';

type L = Record<Lang, string>;
export interface SourceRecord {
  org: string;
  title: string;
  url: string;
  consulted: string;
  licence: string;
  use: L;
  limits: L;
}

export const SOURCES: SourceRecord[] = [
  {
    org: 'NASA GSFC — F. Espenak',
    title: 'Besselian Elements — Total Solar Eclipse of 2027 August 02',
    url: 'https://eclipse.gsfc.nasa.gov/SEsearch/SEdata.php?Ecl=+20270802',
    consulted: '2026-10-25',
    licence: '"Eclipse Predictions by Fred Espenak, NASA\'s GSFC" (free reproduction with acknowledgement)',
    use: {
      en: 'Polynomial Besselian elements (x, y, d, l1, l2, μ, tan f1, tan f2), basis of every computation on the site.',
      fr: 'Éléments de Bessel polynomiaux (x, y, d, l1, l2, μ, tan f1, tan f2), base de tous les calculs du site.',
      ar: 'عناصر بيسل متعددة الحدود (x وy وd وl1 وl2 وμ وtan f1 وtan f2)، وهي أساس جميع حسابات الموقع.',
    },
    limits: {
      en: 'VSOP87/ELP2000-82 ephemerides; ΔT = 76.0 s extrapolated; smooth lunar limb (limits accurate to about 1–2 km).',
      fr: 'Éphémérides VSOP87/ELP2000-82 ; ΔT = 76,0 s extrapolé ; limbe lunaire lisse (limites précises à environ 1–2 km).',
      ar: 'تقاويم VSOP87/ELP2000-82؛ قيمة ΔT = 76.0 ثانية مستقرأة؛ حافة قمرية ملساء (دقة الحدود 1–2 كم تقريبًا).',
    },
  },
  {
    org: 'NASA GSFC — F. Espenak',
    title: 'Path of the Total Solar Eclipse of 2027 Aug 02',
    url: 'https://eclipse.gsfc.nasa.gov/SEpath/SEpath2001/SE2027Aug02Tpath.html',
    consulted: '2026-10-25',
    licence: 'NASA — acknowledgement required',
    use: {
      en: 'Reference table (limits, central line, durations every 2 minutes) used to validate the engine.',
      fr: 'Table de référence (limites, ligne centrale, durées toutes les 2 minutes) utilisée pour valider le moteur.',
      ar: 'جدول مرجعي (الحدود، الخط المركزي، المدد كل دقيقتين) استُعمل للتحقق من المحرك.',
    },
    limits: {
      en: 'Coordinates rounded to 0.1′; same ΔT and lunar model as the elements.',
      fr: 'Coordonnées arrondies à 0,1′ ; même ΔT et même modèle lunaire que les éléments.',
      ar: 'إحداثيات مقرّبة إلى 0.1 دقيقة قوسية؛ نفس ΔT ونفس النموذج القمري المعتمد في العناصر.',
    },
  },
  {
    org: 'Astronomy Engine — D. Cross',
    title: 'astronomy-engine 2.1.19 (npm)',
    url: 'https://github.com/cosinekitty/astronomy',
    consulted: '2026-10-25',
    licence: 'MIT',
    use: {
      en: 'Independent cross-check of contact times, obscuration and Sun position; positions of planets during totality.',
      fr: 'Vérification indépendante des contacts, de l’obscuration et de la position du Soleil ; position des planètes pendant la totalité.',
      ar: 'تحقق مستقل من التماسات ونسبة الحجب وموقع الشمس؛ مواقع الكواكب خلال الكسوف الكلي.',
    },
    limits: {
      en: 'Uses a larger mean lunar radius: totality a few seconds longer, slightly wider path.',
      fr: 'Utilise un rayon lunaire moyen plus grand : totalité plus longue de quelques secondes, bande légèrement plus large.',
      ar: 'تستعمل نصف قطر قمري متوسط أكبر: كسوف كلي أطول ببضع ثوانٍ ونطاق أعرض قليلًا.',
    },
  },
  {
    org: 'geoBoundaries (William & Mary) — OpenStreetMap',
    title: 'geoBoundaries gbOpen TUN ADM1 (commit 9469f09)',
    url: 'https://www.geoboundaries.org/',
    consulted: '2026-10-25',
    licence: 'ODbL 1.0 — © OpenStreetMap contributors',
    use: {
      en: 'Boundaries of the 24 governorates (simplified with mapshaper, 6 % of vertices kept).',
      fr: 'Limites des 24 gouvernorats (simplifiées avec mapshaper, 6 % des sommets conservés).',
      ar: 'حدود الولايات الأربع والعشرين (مبسطة بأداة mapshaper مع الإبقاء على 6٪ من الرؤوس).',
    },
    limits: {
      en: 'Year represented: 2017; generalised geometry, not suitable for legal or cadastral use.',
      fr: 'Année représentée : 2017 ; géométrie généralisée, non adaptée à un usage juridique ou cadastral.',
      ar: 'السنة الممثلة: 2017؛ هندسة معمّمة لا تصلح للاستعمال القانوني أو العقاري.',
    },
  },
  {
    org: 'Natural Earth',
    title: 'Admin 0 – Countries 1:10m',
    url: 'https://www.naturalearthdata.com/',
    consulted: '2026-10-25',
    licence: 'Public domain',
    use: {
      en: 'Outline of neighbouring countries on the static map of the home page.',
      fr: 'Contour des pays voisins sur la carte statique de la page d’accueil.',
      ar: 'حدود البلدان المجاورة على الخريطة الثابتة في الصفحة الرئيسية.',
    },
    limits: {
      en: 'Strongly simplified for display only.',
      fr: 'Fortement simplifié, pour l’affichage uniquement.',
      ar: 'مبسطة كثيرًا ولأغراض العرض فقط.',
    },
  },
  {
    org: 'GeoNames',
    title: 'TN.zip and alternatenames/TN.zip',
    url: 'https://download.geonames.org/export/dump/',
    consulted: '2026-10-25',
    licence: 'CC BY 4.0',
    use: {
      en: 'Coordinates and population of 62 towns; Arabic and French names reviewed by hand.',
      fr: 'Coordonnées et population de 62 localités ; noms arabes et français relus manuellement.',
      ar: 'إحداثيات وعدد سكان 62 مدينة وبلدة؛ مع مراجعة يدوية للأسماء العربية والفرنسية.',
    },
    limits: {
      en: 'One point per town (town centre); a town can extend several kilometres around it.',
      fr: 'Un point par ville (centre) ; une ville peut s’étendre sur plusieurs kilomètres autour.',
      ar: 'نقطة واحدة لكل مدينة (المركز)، وقد تمتد المدينة عدة كيلومترات حولها.',
    },
  },
  {
    org: 'Copernicus C3S / ECMWF — Open-Meteo',
    title: 'ERA5 hourly reanalysis via the Open-Meteo Historical Weather API',
    url: 'https://open-meteo.com/en/docs/historical-weather-api',
    consulted: '2026-10-25',
    licence: 'CC BY 4.0',
    use: {
      en: 'Cloud cover and temperature at 09:00 UTC, 26 July–9 August, 2000–2024, for each destination.',
      fr: 'Nébulosité et température à 09 h UTC, du 26 juillet au 9 août, 2000–2024, pour chaque destination.',
      ar: 'الغطاء السحابي والحرارة في الساعة 09:00 بالتوقيت العالمي، من 26 جويلية إلى 9 أوت، للفترة 2000–2024، لكل وجهة.',
    },
    limits: {
      en: 'Model reanalysis on a ~25–30 km grid; climate statistics, not observations at the site.',
      fr: 'Réanalyse de modèle sur une grille d’environ 25–30 km ; statistiques climatiques, pas des observations sur site.',
      ar: 'إعادة تحليل بنموذج على شبكة 25–30 كم تقريبًا؛ إحصائيات مناخية وليست أرصادًا في الموقع.',
    },
  },
  {
    org: 'Eclipsophile — J. Anderson',
    title: 'Total Solar Eclipse 2027 August 2 (weather prospects)',
    url: 'https://eclipsophile.com/tse2027/',
    consulted: '2026-10-25',
    licence: '© Eclipsophile — cited, not reproduced',
    use: {
      en: 'Qualitative comparison with satellite cloud climatology (MODIS) and aerosol information.',
      fr: 'Comparaison qualitative avec la climatologie satellitaire des nuages (MODIS) et les informations sur les aérosols.',
      ar: 'مقارنة نوعية مع مناخ السحب المستخلص من الأقمار الصناعية (MODIS) ومعلومات الهباء الجوي.',
    },
    limits: {
      en: 'Regional figures; no site-level numbers reproduced here.',
      fr: 'Données régionales ; aucun chiffre par site n’est reproduit ici.',
      ar: 'معطيات جهوية؛ لم تُنقل هنا أي أرقام خاصة بمواقع بعينها.',
    },
  },
  {
    org: 'NASA Science / American Astronomical Society',
    title: 'Eclipse safety; How to view a solar eclipse safely',
    url: 'https://science.nasa.gov/eclipses/safety/',
    consulted: '2026-10-25',
    licence: 'Cited',
    use: {
      en: 'Basis of the safety recommendations (ISO 12312-2, filters in front of optics, totality only).',
      fr: 'Base des recommandations de sécurité (ISO 12312-2, filtres à l’avant des instruments, totalité uniquement).',
      ar: 'أساس توصيات السلامة (ISO 12312-2، المرشّحات في مقدمة الأدوات، النظر بالعين المجردة خلال الكسوف الكلي فقط).',
    },
    limits: { en: '—', fr: '—', ar: '—' },
  },
  {
    org: 'UNESCO World Heritage Centre',
    title: 'World Heritage List — Tunisia',
    url: 'https://whc.unesco.org/en/statesparties/TN',
    consulted: '2026-10-25',
    licence: 'Cited',
    use: {
      en: 'Heritage sites mentioned in the destination sheets.',
      fr: 'Sites du patrimoine mentionnés dans les fiches destinations.',
      ar: 'مواقع التراث المذكورة في بطاقات الوجهات.',
    },
    limits: { en: '—', fr: '—', ar: '—' },
  },
  {
    org: 'OpenFreeMap',
    title: 'Vector tiles and "dark" style',
    url: 'https://openfreemap.org/',
    consulted: '2026-10-25',
    licence: '© OpenMapTiles, © OpenStreetMap contributors (ODbL)',
    use: {
      en: 'Background map of the interactive map (no API key).',
      fr: 'Fond de la carte interactive (sans clé d’API).',
      ar: 'الخريطة الأساسية للخريطة التفاعلية (دون مفتاح واجهة برمجية).',
    },
    limits: {
      en: 'Free community service without guaranteed availability; the eclipse layers keep working without it.',
      fr: 'Service communautaire gratuit sans garantie de disponibilité ; les couches de l’éclipse fonctionnent sans lui.',
      ar: 'خدمة مجتمعية مجانية دون ضمان للتوفر؛ وتعمل طبقات الكسوف بدونها.',
    },
  },
];

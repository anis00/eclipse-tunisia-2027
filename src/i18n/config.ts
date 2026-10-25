export const LANGS = ['en', 'fr', 'ar'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'en';

export const LANG_META: Record<Lang, { label: string; dir: 'ltr' | 'rtl'; locale: string; ogLocale: string }> = {
  en: { label: 'English', dir: 'ltr', locale: 'en-GB', ogLocale: 'en_GB' },
  fr: { label: 'Français', dir: 'ltr', locale: 'fr-FR', ogLocale: 'fr_FR' },
  // Tunisian Arabic usage: Western (Latin) digits.
  ar: { label: 'العربية', dir: 'rtl', locale: 'ar-TN-u-nu-latn', ogLocale: 'ar_TN' },
};

export function isLang(v: unknown): v is Lang {
  return typeof v === 'string' && (LANGS as readonly string[]).includes(v);
}

/** Route keys → path segment (same in every language; the language prefix carries the locale). */
export const ROUTES = {
  home: '',
  map: 'map',
  calculator: 'calculator',
  guide: 'guide',
  destinations: 'destinations',
  weather: 'weather',
  science: 'science',
  faq: 'faq',
  news: 'news',
  sources: 'sources',
  about: 'about',
  privacy: 'privacy',
  legal: 'legal',
} as const;
export type RouteKey = keyof typeof ROUTES;

/** Builds an internal URL honouring the configured base path. */
export function href(lang: Lang, path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = path.replace(/^\/|\/$/g, '');
  return `${base}/${lang}/${clean ? `${clean}/` : ''}`;
}

export function asset(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}

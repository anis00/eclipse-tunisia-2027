import { LANG_META, type Lang } from '../i18n/config.ts';

export const TUNIS_TZ = 'Africa/Tunis';

export function formatTime(date: Date, lang: Lang, timeZone: string = TUNIS_TZ): string {
  return new Intl.DateTimeFormat(LANG_META[lang].locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZone,
  }).format(date);
}

export function formatDate(date: Date | string, lang: Lang): string {
  const d = typeof date === 'string' ? new Date(`${date}T12:00:00Z`) : date;
  return new Intl.DateTimeFormat(LANG_META[lang].locale, { dateStyle: 'long', timeZone: TUNIS_TZ }).format(d);
}

export function formatNumber(value: number, lang: Lang, digits: number): string {
  return new Intl.NumberFormat(LANG_META[lang].locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatPercent(fraction: number, lang: Lang, digits = 1): string {
  return new Intl.NumberFormat(LANG_META[lang].locale, {
    style: 'percent',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(fraction);
}

/** "5 min 39 s" — rounded to the nearest second. */
export function formatDuration(seconds: number, lang: Lang): string {
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  const unit = lang === 'ar' ? { m: 'د', s: 'ث' } : { m: 'min', s: 's' };
  return m > 0 ? `${m} ${unit.m} ${String(s).padStart(2, '0')} ${unit.s}` : `${s} ${unit.s}`;
}

export function formatDegrees(value: number, lang: Lang, digits = 0): string {
  return `${formatNumber(value, lang, digits)}°`;
}

/**
 * Obscuration for display. A partial eclipse is truncated (never rounded up) so
 * that a very deep partial eclipse can never be shown as "100 %".
 */
export function formatObscuration(fraction: number, total: boolean, lang: Lang): string {
  if (total) return formatPercent(1, lang, 0);
  const digits = fraction >= 0.99 ? 2 : 1;
  const f = 10 ** (digits + 2);
  return formatPercent(Math.min(Math.floor(fraction * f) / f, 1 - 1 / f), lang, digits);
}

/** Magnitude for display, truncated for partial eclipses (never shows 1.000 when not total). */
export function formatMagnitude(magnitude: number, total: boolean, lang: Lang): string {
  const v = total ? magnitude : Math.min(Math.floor(magnitude * 1000) / 1000, 0.999);
  return formatNumber(v, lang, 3);
}

/** Label separator: French typography puts a space before the colon. */
export function colon(lang: Lang): string {
  return lang === 'fr' ? ' : ' : ': ';
}

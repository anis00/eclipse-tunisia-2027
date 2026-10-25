/** Reads the localized strings and locale embedded by the page (see components/ClientI18n.astro). */
import type { Dict } from '../i18n/ui.ts';
import type { Lang } from '../i18n/config.ts';

export interface ClientI18n {
  lang: Lang;
  locale: string;
  d: Pick<Dict, 'calc' | 'common' | 'sim' | 'map'>;
  base: string;
}

let cached: ClientI18n | null = null;
export function clientI18n(): ClientI18n {
  if (cached) return cached;
  const el = document.getElementById('client-i18n');
  if (!el?.textContent) throw new Error('Missing #client-i18n');
  cached = JSON.parse(el.textContent) as ClientI18n;
  return cached;
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? `{${k}}`));
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/config.ts';

export type NewsEntry = CollectionEntry<'news'>;

/** Published news for a language, newest first. Entry ids look like "en/2026-10-25-site-launch". */
export async function newsFor(lang: Lang): Promise<NewsEntry[]> {
  const all = await getCollection('news', (e) => e.id.startsWith(`${lang}/`) && !e.data.draft);
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export const newsSlug = (e: NewsEntry) => e.id.split('/').slice(1).join('/');

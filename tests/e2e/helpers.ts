import { readFileSync } from 'node:fs';
import type { Page } from '@playwright/test';

/** All page paths from the generated sitemap (requires `npm run build`). */
export function sitemapPaths(): string[] {
  const xml = readFileSync('dist/sitemap-0.xml', 'utf8');
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => new URL(m[1]!).pathname);
}

/** Collects console errors and uncaught exceptions, ignoring third-party tile failures. */
export function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const text = m.text();
    if (/tiles\.openfreemap\.org|Failed to load resource/.test(text) && !/localhost/.test(m.location().url)) return;
    errors.push(`console: ${text} @ ${m.location().url}`);
  });
  return errors;
}

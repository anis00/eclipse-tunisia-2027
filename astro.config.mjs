// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * SITE_URL  – public origin, e.g. https://eclipseintunisia.com (no trailing slash)
 * BASE_PATH – sub-path when served from a folder, e.g. /eclipse-tunisia-2027 (default /)
 */
const site = process.env.SITE_URL ?? 'https://eclipseintunisia.com';
const base = process.env.BASE_PATH ?? '/';
// Optional privacy-friendly analytics script origin (see .env.example).
const analyticsSrc = process.env.PUBLIC_ANALYTICS_SRC;
const analyticsOrigin = analyticsSrc ? new URL(analyticsSrc).origin : null;
const tiles = 'https://tiles.openfreemap.org';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  i18n: {
    locales: ['en', 'fr', 'ar'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
  // Content-Security-Policy emitted as a <meta> tag with hashes of inline scripts/styles.
  security: {
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        `img-src 'self' data: blob: ${tiles}`,
        `connect-src 'self' ${tiles}${analyticsOrigin ? ` ${analyticsOrigin}` : ''}`,
        "worker-src 'self' blob:",
        "font-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
      scriptDirective: { resources: ["'self'", ...(analyticsOrigin ? [analyticsOrigin] : [])] },
      styleDirective: { resources: ["'self'"] },
    },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', fr: 'fr', ar: 'ar' } },
      // The root page is a language chooser (x-default): the localized pages carry the content.
      filter: (page) => !page.endsWith('/404/') && new URL(page).pathname !== base.replace(/\/?$/, '/'),
    }),
  ],
  vite: {
    build: { chunkSizeWarningLimit: 1200 },
  },
});

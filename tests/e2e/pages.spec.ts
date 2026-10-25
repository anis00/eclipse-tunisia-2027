import { expect, test } from '@playwright/test';
import { sitemapPaths, trackErrors } from './helpers.ts';

const paths = sitemapPaths();

test.describe('every page', () => {
  test.skip(({ isMobile }) => isMobile, 'run once (desktop)');
  for (const path of paths.filter((p) => !p.endsWith('/map/'))) {
    test(`renders ${path}`, async ({ page }) => {
      const errors = trackErrors(page);
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      const lang = path.split('/')[1]!;
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.locator('html')).toHaveAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      await expect(page.locator('h1')).toHaveCount(1);
      expect((await page.title()).length).toBeGreaterThan(10);
      const desc = await page.locator('meta[name="description"]').getAttribute('content');
      expect(desc?.length ?? 0).toBeGreaterThan(50);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`${path}$`));
      expect(await page.locator('link[rel="alternate"][hreflang]').count()).toBeGreaterThanOrEqual(2);
      await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
      expect(errors).toEqual([]);
    });
  }
});

test('titles and descriptions are unique', async ({ request }) => {
  const titles = new Map<string, string>();
  const descs = new Map<string, string>();
  for (const path of paths) {
    const html = await (await request.get(path)).text();
    const title = html.match(/<title>(.*?)<\/title>/)?.[1] ?? '';
    const desc = html.match(/<meta name="description" content="(.*?)"/)?.[1] ?? '';
    expect(titles.get(title), `duplicate title on ${path}`).toBeUndefined();
    expect(descs.get(desc), `duplicate description on ${path}`).toBeUndefined();
    titles.set(title, path);
    descs.set(desc, path);
  }
});

test('internal links resolve', async ({ request }) => {
  const seen = new Set<string>();
  const broken: string[] = [];
  for (const path of [...paths, '/']) {
    const html = await (await request.get(path)).text();
    for (const m of html.matchAll(/href="([^"#?]+)[^"]*"/g)) {
      const href = m[1]!;
      if (/^(https?:|mailto:|tel:)/.test(href)) continue;
      const target = new URL(href, `http://localhost${path}`).pathname;
      if (seen.has(target)) continue;
      seen.add(target);
      const res = await request.get(target);
      if (res.status() !== 200) broken.push(`${path} -> ${target} (${res.status()})`);
    }
  }
  expect(broken).toEqual([]);
});

test('no horizontal scroll on mobile', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile only');
  for (const path of ['/en/', '/ar/', '/fr/calculator/?place=sfax', '/ar/calculator/?place=sfax', '/fr/destinations/', '/ar/destinations/gabes/', '/ar/guide/', '/en/sources/', '/ar/faq/', '/fr/weather/', '/en/map/']) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, path).toBeLessThanOrEqual(1);
  }
});

test('countdown shows a positive number of days', async ({ page }) => {
  await page.goto('/fr/');
  const days = page.locator('[data-unit="days"]');
  await expect(days).not.toHaveText('–');
  expect(Number(await days.textContent())).toBeGreaterThan(0);
});

test('language switcher keeps the page', async ({ page, isMobile }) => {
  test.skip(isMobile);
  await page.goto('/en/guide/');
  await page.locator('.langs a[hreflang="ar"]').click();
  await expect(page).toHaveURL(/\/ar\/guide\/$/);
  await expect(page.locator('h1')).toHaveText('دليل الرصد');
});

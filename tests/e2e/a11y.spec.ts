import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES = ['/en/', '/fr/calculator/?place=sfax', '/ar/', '/ar/calculator/?place=tunis', '/en/guide/', '/fr/destinations/', '/fr/destinations/sfax/', '/en/weather/', '/ar/faq/', '/en/sources/', '/fr/map/'];

for (const path of PAGES) {
  test(`axe WCAG 2.2 AA: ${path}`, async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop only');
    await page.goto(path);
    if (path.includes('/map/')) await page.locator('#map[data-ready]').waitFor({ state: 'attached', timeout: 30_000 });
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      // The WebGL canvas content is covered by the text alternative below the map.
      .exclude('.maplibregl-canvas-container')
      .analyze();
    const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} × ${v.nodes[0]?.target.join(' ')}`);
    expect(summary).toEqual([]);
  });
}

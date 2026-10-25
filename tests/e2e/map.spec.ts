import { expect, test } from '@playwright/test';
import { trackErrors } from './helpers.ts';

test('map loads, search and click compute circumstances', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('/en/map/');
  await expect(page.locator('#map[data-ready]')).toBeAttached({ timeout: 30_000 });
  await page.fill('[data-search]', 'Kairouan');
  await page.press('[data-search]', 'Enter');
  await expect(page.locator('[data-results]')).toContainText('Kairouan');
  await expect(page.locator('[data-results]')).toContainText('2 min 41 s');
  const box = (await page.locator('#map canvas').boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.locator('[data-results] .res-place')).not.toContainText('Kairouan');
  await expect(page).toHaveURL(/lat=/);
  // Layer toggle does not throw
  await page.locator('[data-layer="magnitudes"]').uncheck();
  expect(errors).toEqual([]);
});

test('map page offers a text alternative', async ({ page }) => {
  await page.goto('/fr/map/');
  await expect(page.getByRole('heading', { name: /Alternative textuelle/ })).toBeVisible();
  expect(await page.locator('table tbody tr').count()).toBeGreaterThan(50);
});

test('map degrades gracefully when the basemap is unreachable', async ({ page }) => {
  await page.route('https://tiles.openfreemap.org/**', (r) => r.abort());
  await page.goto('/en/map/');
  await expect(page.locator('[data-map-status]')).toContainText('background map could not be loaded');
  await expect(page.locator('#map[data-ready]')).toBeAttached({ timeout: 30_000 });
  await page.fill('[data-search]', 'Sfax');
  await page.press('[data-search]', 'Enter');
  await expect(page.locator('[data-results]')).toContainText('Totality is visible');
});

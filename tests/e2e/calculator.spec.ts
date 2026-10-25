import { expect, test } from '@playwright/test';
import { trackErrors } from './helpers.ts';

test('town selection shows totality for Sfax', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('/en/calculator/');
  await page.selectOption('#calc-city', 'gabes');
  const res = page.locator('[data-results]');
  await expect(res).toContainText('Gabès');
  await expect(res).toContainText('Totality is visible');
  await expect(res).toContainText('Totality begins (C2)');
  await expect(res).toContainText(/4 min 0\d s/);
  await expect(page).toHaveURL(/place=gabes/);
  expect(errors).toEqual([]);
});

test('partial eclipse in Tunis is explained, no fictitious duration', async ({ page }) => {
  await page.goto('/fr/calculator/?place=tunis');
  const res = page.locator('[data-results]');
  await expect(res).toContainText('La totalité n’est PAS visible');
  await expect(res).not.toContainText('Début de la totalité');
  await expect(res).toContainText(/11\d km/);
});

test('near-limit warning (Sousse) and manual coordinates', async ({ page }) => {
  await page.goto('/en/calculator/');
  await page.fill('#calc-lat', '35.70');
  await page.fill('#calc-lon', '10.60');
  await page.click('button[type=submit]');
  await expect(page.locator('[data-results]')).toContainText('close to a limit');
});

test('invalid coordinates show an error', async ({ page }) => {
  await page.goto('/ar/calculator/');
  await page.fill('#calc-lat', '123');
  await page.fill('#calc-lon', 'abc');
  await page.click('button[type=submit]');
  await expect(page.locator('[data-lat-err]')).toHaveText('أدخل خط عرض بين −90 و90.');
  await expect(page.locator('[data-lon-err]')).toHaveText('أدخل خط طول بين −180 و180.');
  await expect(page.locator('#calc-lat')).toHaveAttribute('aria-invalid', 'true');
});

test('geolocation granted', async ({ browser }) => {
  const context = await browser.newContext({ permissions: ['geolocation'], geolocation: { latitude: 34.42, longitude: 8.78 } });
  const page = await context.newPage();
  await page.goto('/en/calculator/');
  await page.click('[data-locate]');
  await expect(page.locator('#calc-lat')).toHaveValue('34.42000');
  await expect(page.locator('[data-results]')).toContainText('Totality is visible');
  await context.close();
});

test('geolocation denied', async ({ browser }) => {
  const context = await browser.newContext({ permissions: [] });
  const page = await context.newPage();
  await page.goto('/fr/calculator/');
  await page.click('[data-locate]');
  await expect(page.locator('[data-geo-err]')).toContainText('refusé');
  await context.close();
});

test('simulation plays and reset works', async ({ page }) => {
  await page.goto('/en/calculator/?place=sfax');
  const time = page.locator('[data-sim="time"]');
  await expect(time).not.toHaveText('--:--:--');
  const before = await time.textContent();
  await page.click('[data-sim="play"]');
  await page.waitForTimeout(1500);
  await page.click('[data-sim="play"]');
  expect(await time.textContent()).not.toBe(before);
  await page.click('[data-sim="reset"]');
  // Reset goes back to the start of the simulation (6 min before first contact).
  const reset = (await time.textContent())!;
  expect(reset < before!).toBe(true);
  expect(reset.startsWith('08:5')).toBe(true);
});

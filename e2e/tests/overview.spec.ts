import { test, expect } from '@playwright/test';
import { gotoOCPOverview } from '../helpers';

test.describe('OCP Overview', () => {
  test('renders Control Plane Overview page', async ({ page }) => {
    await gotoOCPOverview(page);
    await expect(page.locator('text=Control Plane Overview')).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('text=Components')).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/overview.png', fullPage: true });
  });

  test('shows component status chips', async ({ page }) => {
    await gotoOCPOverview(page);
    await expect(page.locator('text=Crossplane').first()).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('text=Flux').first()).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/overview-components.png', fullPage: true });
  });

  test('sidebar does not contain hidden entries', async ({ page }) => {
    await gotoOCPOverview(page);
    await expect(page.locator('nav a[aria-label="Storage"]')).not.toBeVisible();
    await expect(page.locator('nav a[aria-label="Network"]')).not.toBeVisible();
  });
});

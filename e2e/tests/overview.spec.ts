import { test, expect, type Page } from '@playwright/test';
import { gotoOCPOverview } from '../helpers';

// Intercept all Kubernetes API probe requests and return 404 so every component
// appears as "not installed". Used to verify that the Install Service action is
// visible without needing real cluster state.
async function mockAllComponentsNotInstalled(page: Page) {
  await page.route('**/clusters/**', (route) => {
    const url = route.request().url();
    const isProbe =
      url.includes('/apis/pkg.crossplane.io') ||
      url.includes('/apis/kustomize.toolkit.fluxcd.io') ||
      url.includes('/apis/services.cloud.sap.com') ||
      url.includes('/apis/external-secrets.io') ||
      url.includes('/apis/kyverno.io') ||
      url.includes('/apis/apps/v1/deployments');
    if (isProbe) {
      return route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ kind: 'Status', code: 404 }) });
    }
    return route.continue();
  });
}

test.describe('OCP Overview', () => {
  test('renders Control Plane Overview page', async ({ page }) => {
    await gotoOCPOverview(page);
    await expect(page.locator('h1:has-text("Control Plane Overview")')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('text=Components').first()).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/overview.png', fullPage: true });
  });

  test('shows component status chips', async ({ page }) => {
    await gotoOCPOverview(page);
    await expect(page.locator('text=Crossplane').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('text=Flux').first()).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/overview-components.png', fullPage: true });
  });

  test('sidebar does not contain hidden entries', async ({ page }) => {
    await gotoOCPOverview(page);
    await expect(page.locator('nav a[aria-label="Storage"]')).not.toBeVisible();
    await expect(page.locator('nav a[aria-label="Network"]')).not.toBeVisible();
  });
});

test.describe('OCP Overview - Components table', () => {
  test('renders all expected column headers', async ({ page }) => {
    await gotoOCPOverview(page);
    const thead = page.locator('table').first().locator('thead');
    await expect(thead.locator('th:has-text("Component")')).toBeVisible({ timeout: 15_000 });
    await expect(thead.locator('th:has-text("Status")')).toBeVisible();
    await expect(thead.locator('th:has-text("Progress")')).toBeVisible();
    await expect(thead.locator('th:has-text("Installed versions")')).toBeVisible();
    await expect(thead.locator('th:has-text("Actions")')).toBeVisible();
  });

  test('each component row has a Details action button', async ({ page }) => {
    await gotoOCPOverview(page);
    const rows = page.locator('table').first().locator('tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 15_000 });
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const detailsBtn = row.locator('button:has-text("Details"), select');
      await expect(detailsBtn).toBeVisible();
    }
  });

  test('expanding a component row reveals View Logs button', async ({ page }) => {
    await gotoOCPOverview(page);
    const firstRow = page.locator('table').first().locator('tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 5_000 });
    await firstRow.click();
    await expect(page.locator('button:has-text("View Logs"), button:has-text("Hide Logs")')).toBeVisible({
      timeout: 5_000,
    });
    await page.screenshot({ path: 'e2e/screenshots/overview-expanded.png', fullPage: true });
  });

  test('collapsing an expanded row hides View Logs button', async ({ page }) => {
    await gotoOCPOverview(page);
    const firstRow = page.locator('table').first().locator('tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 5_000 });
    await firstRow.click();
    await expect(page.locator('button:has-text("View Logs"), button:has-text("Hide Logs")')).toBeVisible({
      timeout: 5_000,
    });
    await firstRow.click();
    await expect(page.locator('button:has-text("View Logs")')).not.toBeVisible();
  });
});

test.describe('OCP Overview - Details dropdown', () => {
  test('clicking Details button opens dropdown menu', async ({ page }) => {
    await gotoOCPOverview(page);
    const firstDetailsBtn = page.locator('button:has-text("Details")').first();
    await expect(firstDetailsBtn).toBeVisible({ timeout: 15_000 });
    await firstDetailsBtn.click();
    await expect(page.locator('li:has-text("Open Documentation"), option[value="docs"]')).toBeVisible({ timeout: 3_000 });
    await page.screenshot({ path: 'e2e/screenshots/overview-details-menu.png', fullPage: true });
  });

  test('Open Documentation opens a new tab', async ({ page }) => {
    await gotoOCPOverview(page);
    const firstDetailsBtn = page.locator('button:has-text("Details")').first();
    await expect(firstDetailsBtn).toBeVisible({ timeout: 15_000 });
    await firstDetailsBtn.click();
    await expect(page.locator('li:has-text("Open Documentation"), option[value="docs"]')).toBeVisible({ timeout: 3_000 });
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.locator('li:has-text("Open Documentation")').click(),
    ]);
    await expect(popup).toBeTruthy();
  });
});

test.describe('OCP Overview - Install Service (mocked)', () => {
  test('Install Service option is visible for installable components when not installed', async ({ page }) => {
    await mockAllComponentsNotInstalled(page);
    await gotoOCPOverview(page);

    // Crossplane is installable in mode=unknown — find its row and open Details
    const crossplaneRow = page.locator('tr', { hasText: 'Crossplane' }).first();
    await expect(crossplaneRow).toBeVisible({ timeout: 10_000 });
    const detailsBtn = crossplaneRow.locator('button:has-text("Details")');
    await expect(detailsBtn).toBeVisible({ timeout: 5_000 });
    await detailsBtn.click();
    await expect(page.locator('li:has-text("Install Service")')).toBeVisible({ timeout: 3_000 });
    await page.screenshot({ path: 'e2e/screenshots/overview-install-service.png', fullPage: true });
  });

  test('status chip reflects not-installed state when all probes return 404', async ({ page }) => {
    await mockAllComponentsNotInstalled(page);
    await gotoOCPOverview(page);
    const crossplaneRow = page.locator('tr', { hasText: 'Crossplane' }).first();
    await expect(crossplaneRow).toBeVisible({ timeout: 10_000 });
    // StatusChip should not show an "installed" indicator
    await expect(crossplaneRow.locator('text=Not installed')).toBeVisible({ timeout: 5_000 });
    await page.screenshot({ path: 'e2e/screenshots/overview-not-installed.png', fullPage: true });
  });
});

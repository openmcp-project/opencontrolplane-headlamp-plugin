import type { Page } from '@playwright/test';

const HEADLAMP_TOKEN = process.env.HEADLAMP_TOKEN ?? '';
const CLUSTER = 'main';

async function authenticate(page: Page) {
  const authHeader = page.locator('h1:has-text("Authentication")');
  const hasAuthPage = await authHeader
    .waitFor({ state: 'visible', timeout: 5_000 })
    .then(() => true)
    .catch(() => false);
  if (!hasAuthPage) return;
  await page.locator('#token').fill(HEADLAMP_TOKEN);
  await Promise.all([
    page.waitForNavigation({ timeout: 15_000 }).catch(() => {}),
    page.click('button:has-text("Authenticate")'),
  ]);
}

export async function gotoOCPOverview(page: Page) {
  await page.goto(`/c/${CLUSTER}/ocp/overview`, { waitUntil: 'domcontentloaded' });
  await authenticate(page);
  await page
    .waitForSelector('text=Control Plane Overview', { timeout: 30_000 })
    .catch(() => {});
}

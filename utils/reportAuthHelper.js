const fs = require('fs');
const path = require('path');
const { LoginPage } = require('../pages/loginPage');
const PartnerPage = require('../pages/Partner/PartnerPage');
const { ReportsPage } = require('../pages/Reports/ReportsPage');
const { expect } = require('@playwright/test');
const globalConfig = require('../config/globalConfig');

const ADMIN_STORAGE_STATE = path.join(__dirname, '../storageState/adminAuth.json');

/**
 * Initializes a shared browser context and page for reports.
 * Logs in once as Admin (or reuses storageState) and preserves the session.
 * 
 * @param {import('@playwright/test').Browser} browser
 * @returns {Promise<{ context: import('@playwright/test').BrowserContext, page: import('@playwright/test').Page, reportsPage: ReportsPage }>}
 */
async function setupReportsSession(browser) {
  let context;
  const hasStorage = fs.existsSync(ADMIN_STORAGE_STATE);

  try {
    context = await browser.newContext({
      storageState: hasStorage ? ADMIN_STORAGE_STATE : undefined,
      acceptDownloads: true
    });
  } catch (e) {
    context = await browser.newContext({ acceptDownloads: true });
  }

  const page = await context.newPage();
  const loginPage = new LoginPage(page);
  const reportsPage = new ReportsPage(page);

  // Navigate to dashboard or base url
  await page.goto('/busy/dashboard', { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(1000);

  const isLoginVisible = await page.locator('#usr, input[type="email"]').first().isVisible({ timeout: 2000 }).catch(() => false);
  const isDashboardVisible = page.url().includes('/busy/') && !page.url().includes('/login');

  if (!isDashboardVisible || isLoginVisible) {
    await loginPage.login(globalConfig.ADMIN_EMAIL, globalConfig.ADMIN_PASSWORD);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    try {
      const dir = path.dirname(ADMIN_STORAGE_STATE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      await context.storageState({ path: ADMIN_STORAGE_STATE });
    } catch (e) {
      // Non-fatal if storageState cannot be written
    }
  }

  return { context, page, reportsPage };
}

/**
 * Reusable helper to login and navigate to a specific partner account.
 * This refactors duplicated raw playwright logic across report tests.
 * 
 * @param {import('@playwright/test').Page} page - The Playwright Page instance
 * @param {string} partnerName - The name of the partner to search and access
 */
async function loginAndAccessPartner(page, partnerName = 'Inside Sales (Delhi Office)') {
    const loginPage = new LoginPage(page);
    const partnerPage = new PartnerPage(page);

    // 1. Login
    await loginPage.login(globalConfig.BUSY_TEAM_EMAIL, globalConfig.BUSY_TEAM_PASSWORD);

    // 2. Navigate to Partner Listing
    await page.locator('.MuiBackdrop-root').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    const menuBtn = page.getByRole('button', { name: 'menu' }).first();
    await expect(menuBtn).toBeVisible({ timeout: 15000 });
    await menuBtn.click();
    
    // Some tests use /Partner/i, some use 'perm_identity Partner' - we use a robust regex
    await page.getByRole('link', { name: /Partner/i }).first().click();
    await page.waitForTimeout(1500);

    // 3. Search and Access Partner
    await page.locator('.MuiBackdrop-root').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    await partnerPage.searchPartner(partnerName);
    await page.locator('.MuiBackdrop-root').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

    const lockIconBtn = page.locator('button[aria-label="Access Account"], button:has(svg[data-testid="LockOpenIcon"])').first();
    await expect(lockIconBtn).toBeVisible({ timeout: 15000 });
    await lockIconBtn.click();

    // Small stabilization wait that was present in most report tests
    await page.waitForTimeout(3000);
}

module.exports = { loginAndAccessPartner, setupReportsSession };


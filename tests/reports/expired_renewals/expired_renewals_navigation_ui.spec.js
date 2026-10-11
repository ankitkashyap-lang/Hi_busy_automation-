const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../../pages/loginPage');
const { ExpiredRenewalsPage } = require('../../../pages/Reports/ExpiredRenewalsPage');
const expiredRenewalsData = require('../../../test-data/reports/expiredRenewalsData');
const globalConfig = require('../../../config/globalConfig');

test.describe('Expired Renewals Report - Navigation & UI/UX Suite', () => {
  let page;
  let expiredRenewalsPage;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(90000);
    const context = await browser.newContext();
    page = await context.newPage();
    expiredRenewalsPage = new ExpiredRenewalsPage(page);
    await expiredRenewalsPage.navigateToExpiredRenewals(expiredRenewalsData.DEFAULT_PARTNER);
  });

  test.afterAll(async () => {
    if (page) await page.close().catch(() => {});
  });

  test.beforeEach(async () => {
    if (!page.url().includes('/partner/analytics/expiredrenewal')) {
      await page.goto(expiredRenewalsData.EXPIRED_RENEWALS_URL, { waitUntil: 'domcontentloaded' });
    }
  });

  test('TC-ER-NAV-01 & 02: Verify Navigation and Page Header of Expired Renewals', async () => {
    expect(page.url()).toContain('/partner/analytics/expiredrenewal');
    await expect(expiredRenewalsPage.locators.pageTitle).toBeVisible({ timeout: 15000 });
    const headerText = await expiredRenewalsPage.locators.pageTitle.innerText();
    expect(headerText).toMatch(/Expired Renewals/i);
  });

  test('TC-ER-UI-01: Verify Back Navigation Arrow Button is Visible', async () => {
    const backBtn = expiredRenewalsPage.locators.backButton;
    await expect(backBtn).toBeVisible({ timeout: 10000 });
  });

  test('TC-ER-UI-02: Verify Product Navigation Tabs Bar', async () => {
    await expect(expiredRenewalsPage.locators.productTabs.online).toBeVisible({ timeout: 10000 });
    await expect(expiredRenewalsPage.locators.productTabs.mobile).toBeVisible({ timeout: 10000 });
    await expect(expiredRenewalsPage.locators.productTabs.recom).toBeVisible({ timeout: 10000 });
    await expect(expiredRenewalsPage.locators.productTabs.mazu).toBeVisible({ timeout: 10000 });
  });

  test('TC-ER-UI-03: Verify Top KPI Metrics Summary Cards are Displayed', async () => {
    const metrics = await expiredRenewalsPage.getMetricsSummary();
    expect(metrics.rawText).toContain('Expired Renewals');
    expect(metrics.rawText).toContain('Expired');
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-ER-UI-04: Verify Filter Controls and Apply Filters Button are Enabled', async () => {
    const inputCount = await expiredRenewalsPage.locators.allAutocompleteInputs.count();
    expect(inputCount).toBeGreaterThanOrEqual(9);

    await expect(expiredRenewalsPage.locators.applyFiltersButton).toBeVisible({ timeout: 10000 });
    await expect(expiredRenewalsPage.locators.applyFiltersButton).toBeEnabled();
  });

  test('TC-ER-UI-05: Verify Data Grid Columns Structure and Sample Records', async () => {
    const pageText = await page.innerText('body');
    for (const col of expiredRenewalsData.EXPECTED_UI_HEADERS) {
      expect(pageText).toContain(col);
    }

    const rows = await expiredRenewalsPage.getTableRowsData();
    expect(rows.length).toBeGreaterThan(0);
  });

  test('TC-ER-UI-06: Verify Download Excel Button Visual Attributes', async () => {
    const dlBtn = expiredRenewalsPage.locators.downloadExcelButton;
    await expect(dlBtn).toBeVisible({ timeout: 10000 });
    const title = await dlBtn.getAttribute('title').catch(() => null) || 
                  await dlBtn.locator('img').first().getAttribute('title').catch(() => '');
    expect(title).toMatch(/Download Excel/i);
  });

  test('TC-ER-NAV-03: Verify Back Navigation to Partner Dashboard', async () => {
    const backBtn = expiredRenewalsPage.locators.backButton;
    await backBtn.click();
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/partner/dashboard');

    // Return to Expired Renewals
    await expiredRenewalsPage.navigateToExpiredRenewals(expiredRenewalsData.DEFAULT_PARTNER);
    expect(page.url()).toContain('/partner/analytics/expiredrenewal');
  });
});

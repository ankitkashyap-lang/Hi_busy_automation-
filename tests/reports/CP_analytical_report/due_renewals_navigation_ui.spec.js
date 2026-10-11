const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../../pages/loginPage');
const { DueRenewalsPage } = require('../../../pages/Reports/DueRenewalsPage');
const dueRenewalsData = require('../../../test-data/reports/dueRenewalsData');
const globalConfig = require('../../../config/globalConfig');

test.describe('Due Renewals Report - Navigation & UI/UX Suite', () => {
  let page;
  let dueRenewalsPage;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(90000);
    const context = await browser.newContext();
    page = await context.newPage();
    dueRenewalsPage = new DueRenewalsPage(page);
    await dueRenewalsPage.navigateToDueRenewals(dueRenewalsData.DEFAULT_PARTNER);
  });

  test.afterAll(async () => {
    if (page) await page.close().catch(() => {});
  });

  test.beforeEach(async () => {
    // Ensure we are on Due Renewals
    if (!page.url().includes('/partner/analytics/duerenewal')) {
      await page.goto(dueRenewalsData.DUE_RENEWALS_URL, { waitUntil: 'domcontentloaded' });
    }
  });

  test('TC-DR-NAV-01 & 02: Verify Navigation and Page Header of Due Renewals', async () => {
    expect(page.url()).toContain('/partner/analytics/duerenewal');
    await expect(dueRenewalsPage.locators.pageTitle).toBeVisible({ timeout: 15000 });
    const headerText = await dueRenewalsPage.locators.pageTitle.innerText();
    expect(headerText).toMatch(/Due Renewals/i);
  });

  test('TC-DR-UI-01: Verify Back Navigation Arrow Button is Visible', async () => {
    const backBtn = dueRenewalsPage.locators.backButton;
    await expect(backBtn).toBeVisible({ timeout: 10000 });
  });

  test('TC-DR-UI-02: Verify Product Navigation Tabs Bar', async () => {
    // Verify product selectors are available
    await expect(dueRenewalsPage.locators.productTabs.online).toBeVisible({ timeout: 10000 });
    await expect(dueRenewalsPage.locators.productTabs.mobile).toBeVisible({ timeout: 10000 });
    await expect(dueRenewalsPage.locators.productTabs.recom).toBeVisible({ timeout: 10000 });
    await expect(dueRenewalsPage.locators.productTabs.mazu).toBeVisible({ timeout: 10000 });
  });

  test('TC-DR-UI-03: Verify Top KPI Metrics Summary Cards are Displayed', async () => {
    const metrics = await dueRenewalsPage.getMetricsSummary();
    expect(metrics.rawText).toContain('Due Renewals');
    expect(metrics.rawText).toContain('Pending');
    expect(metrics.rawText).toContain('In Grace');
    expect(metrics.rawText).toContain('Expired');
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-DR-UI-04: Verify Filter Controls and Apply Filters Button are Enabled', async () => {
    // 9 Autocomplete inputs
    const inputCount = await dueRenewalsPage.locators.allAutocompleteInputs.count();
    expect(inputCount).toBeGreaterThanOrEqual(9);

    // Apply Filters button
    await expect(dueRenewalsPage.locators.applyFiltersButton).toBeVisible({ timeout: 10000 });
    await expect(dueRenewalsPage.locators.applyFiltersButton).toBeEnabled();
  });

  test('TC-DR-UI-05: Verify Data Grid Columns Structure and Sample Records', async () => {
    // Check that table headers contain expected column names
    const pageText = await page.innerText('body');
    for (const col of dueRenewalsData.EXPECTED_UI_HEADERS) {
      expect(pageText).toContain(col);
    }

    const rows = await dueRenewalsPage.getTableRowsData();
    expect(rows.length).toBeGreaterThan(0);
  });

  test('TC-DR-UI-06: Verify Download Excel Button Visual Attributes', async () => {
    const dlBtn = dueRenewalsPage.locators.downloadExcelButton;
    await expect(dlBtn).toBeVisible({ timeout: 10000 });
    const title = await dlBtn.getAttribute('title').catch(() => null) || 
                  await dlBtn.locator('img').first().getAttribute('title').catch(() => '');
    expect(title).toMatch(/Download Excel/i);
  });

  test('TC-DR-NAV-03: Verify Back Navigation to Partner Dashboard', async () => {
    const backBtn = dueRenewalsPage.locators.backButton;
    await backBtn.click();
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/partner/dashboard');

    // Return to Due Renewals
    await dueRenewalsPage.navigateToDueRenewals(dueRenewalsData.DEFAULT_PARTNER);
    expect(page.url()).toContain('/partner/analytics/duerenewal');
  });
});

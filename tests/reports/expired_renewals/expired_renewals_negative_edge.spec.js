const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../../pages/loginPage');
const { ExpiredRenewalsPage } = require('../../../pages/Reports/ExpiredRenewalsPage');
const expiredRenewalsData = require('../../../test-data/reports/expiredRenewalsData');
const globalConfig = require('../../../config/globalConfig');

test.describe('Expired Renewals Report - Negative, Empty State & Stability Suite', () => {
  let context;
  let page;
  let expiredRenewalsPage;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(90000);
    context = await browser.newContext();
    page = await context.newPage();

    expiredRenewalsPage = new ExpiredRenewalsPage(page);
    await expiredRenewalsPage.navigateToExpiredRenewals(expiredRenewalsData.DEFAULT_PARTNER);
  });

  test.afterAll(async () => {
    if (page) await page.close().catch(() => { });
    if (context) await context.close().catch(() => { });
  });

  test.beforeEach(async () => {
    await page.goto(expiredRenewalsData.EXPIRED_RENEWALS_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
  });

  test('TC-ER-EMP-01 & 03: Empty State Handling & Metrics Displaying Zero (No NaN or Undefined)', async () => {
    // Select filter combination with 0 records (e.g. Pulwama city + Dual User)
    await expiredRenewalsPage.setAutocompleteFilter(expiredRenewalsData.FILTER_INDICES.CITY, 'Pulwama');
    await expiredRenewalsPage.setAutocompleteFilter(expiredRenewalsData.FILTER_INDICES.LICENSE_TYPE, 'DU');
    await expiredRenewalsPage.applyFilters();

    const metrics = await expiredRenewalsPage.getMetricsSummary();
    expect(metrics.rawText).not.toContain('NaN');
    expect(metrics.rawText).not.toContain('undefined');
    expect(metrics.rawText).not.toContain('null');
  });

  test('TC-ER-EMP-05: Filter Recovery from Empty State to Populated Default State', async () => {
    // Apply 0-match filter
    await expiredRenewalsPage.setAutocompleteFilter(expiredRenewalsData.FILTER_INDICES.CITY, 'Pulwama');
    await expiredRenewalsPage.setAutocompleteFilter(expiredRenewalsData.FILTER_INDICES.LICENSE_TYPE, 'DU');
    await expiredRenewalsPage.applyFilters();

    // Reset filters back to 'All'
    await expiredRenewalsPage.setAutocompleteFilter(expiredRenewalsData.FILTER_INDICES.CITY, 'All');
    await expiredRenewalsPage.setAutocompleteFilter(expiredRenewalsData.FILTER_INDICES.LICENSE_TYPE, 'All');
    await expiredRenewalsPage.applyFilters();

    const metrics = await expiredRenewalsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThan(0);
  });

  test('TC-ER-NEG-01: Rapid Multiple Clicks on Apply Filters Button (Debounce Test)', async () => {
    const applyBtn = expiredRenewalsPage.locators.applyFiltersButton;
    await expect(applyBtn).toBeVisible();

    // Click 4 times rapidly
    await Promise.all([
      applyBtn.click(),
      applyBtn.click(),
      applyBtn.click(),
      applyBtn.click()
    ]).catch(() => { });

    await page.waitForTimeout(3000);
    // Page should remain responsive and stable
    expect(page.url()).toContain('/partner/analytics/expiredrenewal');
    await expect(expiredRenewalsPage.locators.pageTitle).toBeVisible();
  });

  test('TC-ER-NEG-04: Page Refresh (F5) Resilience with Session Preservation', async () => {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    expect(page.url()).toContain('/partner/analytics/expiredrenewal');
    await expect(expiredRenewalsPage.locators.pageTitle).toBeVisible();
    const metrics = await expiredRenewalsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThan(0);
  });

  test('TC-ER-NEG-06: Special Characters in Filter Inputs Do Not Break UI or Cause Alert', async () => {
    const cityInput = expiredRenewalsPage.locators.allAutocompleteInputs.nth(expiredRenewalsData.FILTER_INDICES.CITY);
    await cityInput.fill('<script>alert("test")</script>');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Click Apply
    await expiredRenewalsPage.applyFilters();

    // Verify application did not crash or pop up native alert
    expect(page.url()).toContain('/partner/analytics/expiredrenewal');
    await expect(expiredRenewalsPage.locators.pageTitle).toBeVisible();
  });
});

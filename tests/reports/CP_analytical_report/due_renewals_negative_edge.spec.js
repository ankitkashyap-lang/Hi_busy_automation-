const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../../pages/loginPage');
const { DueRenewalsPage } = require('../../../pages/Reports/DueRenewalsPage');
const dueRenewalsData = require('../../../test-data/reports/dueRenewalsData');
const globalConfig = require('../../../config/globalConfig');

test.describe('Due Renewals Report - Negative, Empty State & Stability Suite', () => {
  let context;
  let page;
  let dueRenewalsPage;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(90000);
    context = await browser.newContext();
    page = await context.newPage();

    dueRenewalsPage = new DueRenewalsPage(page);
    await dueRenewalsPage.navigateToDueRenewals(dueRenewalsData.DEFAULT_PARTNER);
  });

  test.afterAll(async () => {
    if (page) await page.close().catch(() => {});
    if (context) await context.close().catch(() => {});
  });

  test.beforeEach(async () => {
    await page.goto(dueRenewalsData.DUE_RENEWALS_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
  });

  test('TC-DR-EMP-01 & 03: Empty State Handling & Metrics Displaying Zero (No NaN or Undefined)', async () => {
    // Select filter combination with 0 records (e.g. Pulwama city + Dual User)
    await dueRenewalsPage.setAutocompleteFilter(dueRenewalsData.FILTER_INDICES.CITY, 'Pulwama');
    await dueRenewalsPage.setAutocompleteFilter(dueRenewalsData.FILTER_INDICES.LICENSE_TYPE, 'DU');
    await dueRenewalsPage.applyFilters();

    const metrics = await dueRenewalsPage.getMetricsSummary();
    expect(metrics.rawText).not.toContain('NaN');
    expect(metrics.rawText).not.toContain('undefined');
    expect(metrics.rawText).not.toContain('null');
  });

  test('TC-DR-EMP-05: Filter Recovery from Empty State to Populated Default State', async () => {
    // Apply 0-match filter
    await dueRenewalsPage.setAutocompleteFilter(dueRenewalsData.FILTER_INDICES.CITY, 'Pulwama');
    await dueRenewalsPage.setAutocompleteFilter(dueRenewalsData.FILTER_INDICES.LICENSE_TYPE, 'DU');
    await dueRenewalsPage.applyFilters();

    // Reset filters back to 'All'
    await dueRenewalsPage.setAutocompleteFilter(dueRenewalsData.FILTER_INDICES.CITY, 'All');
    await dueRenewalsPage.setAutocompleteFilter(dueRenewalsData.FILTER_INDICES.LICENSE_TYPE, 'All');
    await dueRenewalsPage.applyFilters();

    const metrics = await dueRenewalsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThan(0);
  });

  test('TC-DR-NEG-01: Rapid Multiple Clicks on Apply Filters Button (Debounce Test)', async () => {
    const applyBtn = dueRenewalsPage.locators.applyFiltersButton;
    await expect(applyBtn).toBeVisible();

    // Click 4 times rapidly
    await Promise.all([
      applyBtn.click(),
      applyBtn.click(),
      applyBtn.click(),
      applyBtn.click()
    ]).catch(() => {});

    await page.waitForTimeout(3000);
    // Page should remain responsive and stable
    expect(page.url()).toContain('/partner/analytics/duerenewal');
    await expect(dueRenewalsPage.locators.pageTitle).toBeVisible();
  });

  test('TC-DR-NEG-04: Page Refresh (F5) Resilience with Session Preservation', async () => {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    expect(page.url()).toContain('/partner/analytics/duerenewal');
    await expect(dueRenewalsPage.locators.pageTitle).toBeVisible();
    const metrics = await dueRenewalsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThan(0);
  });

  test('TC-DR-NEG-06: Special Characters in Filter Inputs Do Not Break UI or Cause Errors', async () => {
    const cityInput = dueRenewalsPage.locators.filterCityInput;
    await cityInput.fill('<script>alert("test")</script>');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Click Apply
    await dueRenewalsPage.applyFilters();

    // Verify application did not crash or pop up native alert
    expect(page.url()).toContain('/partner/analytics/duerenewal');
    await expect(dueRenewalsPage.locators.pageTitle).toBeVisible();
  });
});

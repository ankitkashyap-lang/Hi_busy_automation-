const { test, expect } = require('@playwright/test');
const { InactivePage } = require('../../../pages/Reports/InactivePage');
const inactiveData = require('../../../test-data/reports/inactiveData');

const path = require('path');
const fs = require('fs');

test.describe.configure({ mode: 'serial' });

test.describe('Inactive Report - Negative & Edge Cases Suite', () => {
  let context;
  let page;
  let inactivePage;
  const storageStatePath = path.join(__dirname, '../../../storageState/adminAuth.json');

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(90000);
    const hasStorage = fs.existsSync(storageStatePath);
    context = await browser.newContext({
      storageState: hasStorage ? storageStatePath : undefined,
      acceptDownloads: true,
      viewport: { width: 1440, height: 900 }
    });
    page = await context.newPage();
    inactivePage = new InactivePage(page);

    // Single login session authentication and navigation
    await inactivePage.navigateToInactive(inactiveData.DEFAULT_PARTNER);

    try {
      await context.storageState({ path: storageStatePath });
    } catch (e) {}
  });

  test.afterAll(async () => {
    if (page) await page.close().catch(() => {});
  });

  test.beforeEach(async () => {
    test.setTimeout(60000);
  });

  test('TC-INACT-EDGE-01: Zero-Record Filter Combination & Empty State Handling', async () => {
    await page.goto(inactiveData.INACTIVE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Combination known to yield 0 inactive records: 180 Days + Active + FOC
    await inactivePage.setFilter('days', '180 Days');
    await inactivePage.setFilter('status', 'Active');
    await inactivePage.setFilter('category', 'FOC');
    await inactivePage.applyFilters();

    const metrics = await inactivePage.getMetricsSummary();
    expect(metrics.inactiveCount).toBe(0);

    const rows = await inactivePage.getTableRowsData();
    expect(rows.length).toBe(0);

    // Ensure page does not crash or display an error
    const pageText = await page.innerText('body');
    expect(pageText).not.toContain('Internal Server Error');
  });

  test('TC-INACT-EDGE-02: Filter Reset & Data Restoration to Default Full Dataset', async () => {
    // Re-set all filters back to default
    await inactivePage.setFilter('days', '30 Days');
    await inactivePage.setFilter('status', 'All');
    await inactivePage.setFilter('category', 'All');
    await inactivePage.applyFilters();

    const metrics = await inactivePage.getMetricsSummary();
    expect(metrics.inactiveCount).toBeGreaterThan(0);

    const rows = await inactivePage.getTableRowsData();
    expect(rows.length).toBeGreaterThan(0);
  });

  test('TC-INACT-EDGE-03: Rapid Filter Selection Stability', async () => {
    // Change multiple filters in rapid succession before applying
    await inactivePage.setFilter('days', '90 Days');
    await inactivePage.setFilter('status', 'Disabled');
    await inactivePage.setFilter('releaseVersion', '21');
    await inactivePage.setFilter('userType', 'SU');
    await inactivePage.applyFilters();

    const metrics = await inactivePage.getMetricsSummary();
    expect(metrics.inactiveCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-INACT-EDGE-04: Non-existent City Search Autocomplete Handling', async () => {
    const cityInput = inactivePage.locators.cityInput;
    await cityInput.click();
    await cityInput.fill('NonExistentCityXYZ');
    await page.waitForTimeout(500);

    // Verify no matching option is present in the popper
    const matchingOptionCount = await page.locator('.MuiAutocomplete-popper li')
      .filter({ hasText: 'NonExistentCityXYZ' })
      .count();
    expect(matchingOptionCount).toBe(0);

    await page.keyboard.press('Escape');
    await cityInput.fill('All');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
  });

  test('TC-INACT-EDGE-05: Page Refresh State Preservation', async () => {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Ensure page reloads cleanly under same authenticated session
    expect(page.url()).toContain('/partner/analytics/inactive');
    await expect(inactivePage.locators.pageTitle).toBeVisible();

    const metrics = await inactivePage.getMetricsSummary();
    expect(metrics.inactiveCount).toBeGreaterThan(0);
  });
});

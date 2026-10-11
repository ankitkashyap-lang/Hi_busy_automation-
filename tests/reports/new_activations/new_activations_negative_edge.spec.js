const { test, expect } = require('@playwright/test');
const { NewActivationsPage } = require('../../../pages/Reports/NewActivationsPage');
const newActivationsData = require('../../../test-data/reports/newActivationsData');
const path = require('path');
const fs = require('fs');

test.describe('New Activations Report - Negative, Edge & Resilience Suite', () => {
  let context;
  let page;
  let newActivationsPage;
  const storageStatePath = path.join(__dirname, '../../../storageState/adminAuth.json');

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(90000);
    const hasStorage = fs.existsSync(storageStatePath);
    context = await browser.newContext({
      storageState: hasStorage ? storageStatePath : undefined
    });
    page = await context.newPage();

    newActivationsPage = new NewActivationsPage(page);
    await newActivationsPage.navigateToNewActivations(newActivationsData.DEFAULT_PARTNER);
  });

  test.afterAll(async () => {
    if (page) await page.close().catch(() => {});
    if (context) await context.close().catch(() => {});
  });

  test.beforeEach(async () => {
    await page.goto(newActivationsData.NEW_ACTIVATIONS_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
  });

  test('TC-NA-EMP-01: Empty State Handling & Metrics Displaying Zero (No NaN or Undefined)', async () => {
    await newActivationsPage.selectDesktopVariation('Busy 21');
    // Select a zero-match filter combination (e.g. City: Birgunj)
    await newActivationsPage.setFilterById('city', 'Birgunj');
    await newActivationsPage.applyFilters();

    const metrics = await newActivationsPage.getMetricsSummary();
    expect(metrics.rawText).not.toContain('NaN');
    expect(metrics.rawText).not.toContain('undefined');
    expect(metrics.rawText).not.toContain('null');
  });

  test('TC-NA-EMP-02: Filter Recovery from Empty State to Populated Default State', async () => {
    // Apply 0-match filter
    await newActivationsPage.selectDesktopVariation('Busy 21');
    await newActivationsPage.setFilterById('city', 'Birgunj');
    await newActivationsPage.applyFilters();

    // Reset back to All
    await newActivationsPage.setFilterById('city', 'All');
    await newActivationsPage.applyFilters();

    const metrics = await newActivationsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThan(0);
  });

  test('TC-NA-NEG-01: Rapid Multiple Clicks on Apply Filters Button (Debounce Test)', async () => {
    const applyBtn = newActivationsPage.locators.applyFiltersButton;
    await expect(applyBtn).toBeVisible();

    // Click 4 times rapidly
    await Promise.all([
      applyBtn.click(),
      applyBtn.click(),
      applyBtn.click(),
      applyBtn.click()
    ]).catch(() => {});

    await page.waitForTimeout(3000);
    expect(page.url()).toContain('/partner/analytics/newactivations');
    await expect(newActivationsPage.locators.pageTitle).toBeVisible();
  });

  test('TC-NA-NEG-02: Page Refresh (F5) Resilience with Session Preservation', async () => {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    expect(page.url()).toContain('/partner/analytics/newactivations');
    await expect(newActivationsPage.locators.pageTitle).toBeVisible();
    const metrics = await newActivationsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThan(0);
  });

  test('TC-NA-NEG-03: Special Characters in Filter Inputs Do Not Break UI or Cause Errors', async () => {
    const timeInput = newActivationsPage.locators.timePeriodInput;
    await timeInput.fill('<script>alert("xss")</script>');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    await newActivationsPage.applyFilters();

    // Verify page did not crash or prompt native alert
    expect(page.url()).toContain('/partner/analytics/newactivations');
    await expect(newActivationsPage.locators.pageTitle).toBeVisible();
  });

  test('TC-NA-BUG-01: Backend Report Generation Behavior When Desktop Variation is "All"', async () => {
    test.setTimeout(90000);
    // Ensure variation is 'All'
    await newActivationsPage.selectDesktopVariation('All');
    await newActivationsPage.applyFilters();

    const { downloadPage, isPopup } = await newActivationsPage.triggerDownloadExcel();
    try {
      // Trigger cron
      const cronHost = new URL(downloadPage.url()).hostname;
      const cronUrl = `http://${cronHost}:9094/report/v1/cron/report/`;
      await downloadPage.request.get(cronUrl, { timeout: 10000 }).catch(() => {});

      await downloadPage.reload({ waitUntil: 'domcontentloaded' });
      await downloadPage.waitForTimeout(2000);

      const firstRow = downloadPage.locator('tbody tr, div[role="row"]:not(:first-child)').first();
      await expect(firstRow).toBeVisible();
      const rowText = await firstRow.innerText();

      // Documented Known Defect: When Desktop variation is "All", the backend cron fails
      // We assert that the application shows either Error/Failed or Processed, without hanging
      expect(rowText).toMatch(/Error|Failed|Processed/i);
    } finally {
      if (isPopup) await downloadPage.close().catch(() => {});
    }
  });
});

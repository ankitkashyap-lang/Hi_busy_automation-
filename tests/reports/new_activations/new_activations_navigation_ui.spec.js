const { test, expect } = require('@playwright/test');
const { NewActivationsPage } = require('../../../pages/Reports/NewActivationsPage');
const newActivationsData = require('../../../test-data/reports/newActivationsData');
const path = require('path');
const fs = require('fs');

test.describe('New Activations Report - Navigation & UI/UX Suite', () => {
  let context;
  let page;
  let newActivationsPage;
  const storageStatePath = path.join(__dirname, '../../../storageState/adminAuth.json');

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(90000);
    const hasStorage = fs.existsSync(storageStatePath);
    context = await browser.newContext({
      storageState: hasStorage ? storageStatePath : undefined,
      acceptDownloads: true
    });
    page = await context.newPage();
    newActivationsPage = new NewActivationsPage(page);
    await newActivationsPage.navigateToNewActivations(newActivationsData.DEFAULT_PARTNER);

    // Save storageState for subsequent reuse across suites
    try {
      await context.storageState({ path: storageStatePath });
    } catch (e) {}
  });

  test.afterAll(async () => {
    if (page) await page.close().catch(() => {});
    if (context) await context.close().catch(() => {});
  });

  test.beforeEach(async () => {
    // Ensure we are on New Activations
    if (!page.url().includes('/partner/analytics/newactivations')) {
      await page.goto(newActivationsData.NEW_ACTIVATIONS_URL, { waitUntil: 'domcontentloaded' });
    }
  });

  test('TC-NA-NAV-01 & 02: Verify Navigation and Page Header of New Activations', async () => {
    expect(page.url()).toContain('/partner/analytics/newactivations');
    await expect(newActivationsPage.locators.pageTitle).toBeVisible({ timeout: 15000 });
    const headerText = await newActivationsPage.locators.pageTitle.innerText();
    expect(headerText).toMatch(/New Activations/i);
  });

  test('TC-NA-NAV-03: Verify Back Navigation to Partner Dashboard', async () => {
    const backBtn = newActivationsPage.locators.backButton;
    await expect(backBtn).toBeVisible({ timeout: 10000 });
    await backBtn.click();
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/partner/dashboard');

    // Return to New Activations
    await page.goto(newActivationsData.NEW_ACTIVATIONS_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/partner/analytics/newactivations');
  });

  test('TC-NA-UI-01: Verify All 5 Product Tabs Are Displayed', async () => {
    await expect(newActivationsPage.locators.productTabs.desktop).toBeVisible({ timeout: 10000 });
    await expect(newActivationsPage.locators.productTabs.online).toBeVisible({ timeout: 10000 });
    await expect(newActivationsPage.locators.productTabs.mobile).toBeVisible({ timeout: 10000 });
    await expect(newActivationsPage.locators.productTabs.recom).toBeVisible({ timeout: 10000 });
    await expect(newActivationsPage.locators.productTabs.mazu).toBeVisible({ timeout: 10000 });
  });

  test('TC-NA-UI-02 & 03: Verify Top KPI Metrics Summary Cards and Category Badges', async () => {
    const metrics = await newActivationsPage.getMetricsSummary();
    expect(metrics.rawText).toContain('New Activations');
    expect(metrics.rawText).toContain('In Cluster');
    expect(metrics.rawText).toContain('Out Of Cluster');
    expect(metrics.rawText).toContain('Installed By Self');
    expect(metrics.rawText).toContain('By Reseller');
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);

    // Verify Category Badges are present
    const pageText = await page.innerText('body');
    expect(pageText).toMatch(/REG|CA|ACC|TP|FOC/);
  });

  test('TC-NA-UI-04: Verify Filter Controls and Apply Filters Button are Enabled', async () => {
    const inputCount = await newActivationsPage.locators.allAutocompleteInputs.count();
    expect(inputCount).toBeGreaterThanOrEqual(3);

    await expect(newActivationsPage.locators.applyFiltersButton).toBeVisible({ timeout: 10000 });
    await expect(newActivationsPage.locators.applyFiltersButton).toBeEnabled();
  });

  test('TC-NA-UI-05: Verify Data Grid 8 Columns Structure and Sample Records', async () => {
    const pageText = await page.innerText('body');
    for (const col of newActivationsData.EXPECTED_UI_HEADERS) {
      expect(pageText).toContain(col);
    }

    const rows = await newActivationsPage.getTableRowsData();
    expect(rows.length).toBeGreaterThan(0);
  });

  test('TC-NA-UI-06: Verify Download Excel Button Visual Attributes', async () => {
    const dlBtn = newActivationsPage.locators.downloadExcelButton;
    await expect(dlBtn).toBeVisible({ timeout: 10000 });
    const title = await dlBtn.getAttribute('title').catch(() => null) ||
                  await dlBtn.locator('img').first().getAttribute('title').catch(() => '');
    expect(title).toMatch(/Download Excel/i);
  });
});

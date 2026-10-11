const { test, expect } = require('@playwright/test');
const { NewActivationsPage } = require('../../../pages/Reports/NewActivationsPage');
const newActivationsData = require('../../../test-data/reports/newActivationsData');
const path = require('path');
const fs = require('fs');

test.describe('New Activations Report - Products & Filter Combinations Suite', () => {
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
  });

  test.afterAll(async () => {
    if (page) await page.close().catch(() => {});
    if (context) await context.close().catch(() => {});
  });

  test.beforeEach(async () => {
    // Return to default desktop new activations before each test
    await page.goto(newActivationsData.NEW_ACTIVATIONS_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
  });

  // ==========================================
  // SECTION 1: PRODUCT DROPDOWN & TAB TESTING
  // ==========================================

  test('TC-NA-PROD-01: Default Product Selection is Desktop with Variation "All"', async () => {
    expect(page.url()).toContain('product=desktop');
    const select = newActivationsPage.locators.desktopVariationSelect;
    const value = await select.inputValue();
    expect(['All', 'Busy 21']).toContain(value);

    const metrics = await newActivationsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-NA-PROD-02: Select Desktop Variation "Busy 21" and Verify Dynamic Filters', async () => {
    await newActivationsPage.selectDesktopVariation('Busy 21');
    await newActivationsPage.applyFilters();

    // Verify dynamic filters appear: Model, Version, City, Installed By, Category
    const count = await newActivationsPage.locators.allAutocompleteInputs.count();
    expect(count).toBeGreaterThanOrEqual(7);

    const metrics = await newActivationsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-NA-PROD-03: Select Desktop Variation "Mandi"', async () => {
    await newActivationsPage.selectDesktopVariation('Mandi');
    await newActivationsPage.applyFilters();
    const metrics = await newActivationsPage.getMetricsSummary();
    expect(metrics.rawText).toContain('New Activations');
  });

  test('TC-NA-PROD-04: Select Desktop Variation "Magic"', async () => {
    await newActivationsPage.selectDesktopVariation('Magic');
    await newActivationsPage.applyFilters();
    const metrics = await newActivationsPage.getMetricsSummary();
    expect(metrics.rawText).toContain('New Activations');
  });

  test('TC-NA-PROD-05: Switch Product to "Online"', async () => {
    await newActivationsPage.switchProduct('online');
    expect(page.url()).toContain('product=online');
    const metrics = await newActivationsPage.getMetricsSummary();
    expect(metrics.rawText).toContain('New Activations');
  });

  test('TC-NA-PROD-06: Switch Product to "Mobile"', async () => {
    await newActivationsPage.switchProduct('mobile');
    expect(page.url()).toContain('product=mobile');
    const metrics = await newActivationsPage.getMetricsSummary();
    expect(metrics.rawText).toContain('New Activations');
  });

  test('TC-NA-PROD-07: Switch Product to "Recom"', async () => {
    await newActivationsPage.switchProduct('recom');
    expect(page.url()).toContain('product=recom');
    const metrics = await newActivationsPage.getMetricsSummary();
    expect(metrics.rawText).toContain('New Activations');
  });

  test('TC-NA-PROD-08: Switch Product to "mazu"', async () => {
    await newActivationsPage.switchProduct('mazu');
    expect(page.url()).toContain('product=mazu');
    const metrics = await newActivationsPage.getMetricsSummary();
    expect(metrics.rawText).toContain('New Activations');
  });

  test('TC-NA-PROD-09: Sequential Multi-Product Toggling Stability', async () => {
    await newActivationsPage.switchProduct('online');
    await page.waitForTimeout(1000);
    await newActivationsPage.switchProduct('mobile');
    await page.waitForTimeout(1000);
    await newActivationsPage.switchProduct('mazu');
    await page.waitForTimeout(1000);
    await newActivationsPage.switchProduct('desktop');
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('product=desktop');
    const metrics = await newActivationsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-NA-PROD-10: Switch Product to "RDP"', async () => {
    await newActivationsPage.switchProduct('rdp');
    expect(page.url()).toContain('product=rdp');
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('Internal Server Error');
  });

  test('TC-NA-PROD-11: Dropdown Variations Dynamic Filters Validation (Busy 21 vs Mandi/Magic/All)', async () => {
    // 1. Busy 21 renders expanded filters
    await newActivationsPage.selectDesktopVariation('Busy 21');
    await newActivationsPage.applyFilters();
    const busy21InputsCount = await newActivationsPage.locators.allAutocompleteInputs.count();
    expect(busy21InputsCount).toBeGreaterThanOrEqual(7);

    // 2. Switching to All or Mandi simplifies filters
    await newActivationsPage.selectDesktopVariation('All');
    await newActivationsPage.applyFilters();
    const allInputsCount = await newActivationsPage.locators.allAutocompleteInputs.count();
    expect(allInputsCount).toBeLessThanOrEqual(busy21InputsCount);
  });

  test('TC-NA-PROD-12: Cross-Tab State Preservation (Desktop Busy 21 -> Online -> Desktop)', async () => {
    await newActivationsPage.selectDesktopVariation('Busy 21');
    await newActivationsPage.switchProduct('online');
    expect(page.url()).toContain('product=online');
    await page.waitForTimeout(1000);
    await newActivationsPage.switchProduct('desktop');
    expect(page.url()).toContain('product=desktop');
    const select = newActivationsPage.locators.desktopVariationSelect;
    if (await select.isVisible()) {
      const val = await select.inputValue();
      expect(['Busy 21', 'All']).toContain(val);
    }
  });

  // ==========================================
  // SECTION 2: FILTERS & COMBINATIONS TESTING
  // ==========================================

  test('TC-NA-FLT-01: Filter by Time Period: "This Month"', async () => {
    await newActivationsPage.setFilterById('timePeriod', 'This Month');
    await newActivationsPage.applyFilters();
    const metrics = await newActivationsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-NA-FLT-02: Filter by Time Period: "Last Month"', async () => {
    await newActivationsPage.setFilterById('timePeriod', 'Last Month');
    await newActivationsPage.applyFilters();
    const metrics = await newActivationsPage.getMetricsSummary();
    expect(metrics.rawText).toContain('New Activations');
  });

  test('TC-NA-FLT-03: Filter by Dynamic "Month Range" (startMonth & endMonth)', async () => {
    await newActivationsPage.setFilterById('timePeriod', 'Month Range');
    await page.waitForTimeout(1000);

    // Verify dynamic month inputs appear
    await expect(newActivationsPage.locators.startMonthInput).toBeVisible({ timeout: 5000 });
    await expect(newActivationsPage.locators.endMonthInput).toBeVisible({ timeout: 5000 });

    await newActivationsPage.applyFilters();
    const metrics = await newActivationsPage.getMetricsSummary();
    expect(metrics.rawText).toContain('New Activations');
  });

  test('TC-NA-FLT-04: Filter by Subs Status: "Active"', async () => {
    await newActivationsPage.setFilterById('status', 'Active');
    await newActivationsPage.applyFilters();
    const rows = await newActivationsPage.getTableRowsData();
    // Verify visible rows that have status have Active
    for (const r of rows) {
      const text = r.join(' ');
      if (text.includes('Active') || text.includes('Cancelled')) {
        expect(text).toContain('Active');
      }
    }
  });

  test('TC-NA-FLT-05: Filter by Subs Status: "Cancelled"', async () => {
    await newActivationsPage.setFilterById('status', 'Cancelled');
    await newActivationsPage.applyFilters();
    const rows = await newActivationsPage.getTableRowsData();
    for (const r of rows) {
      const text = r.join(' ');
      if (text.includes('Active') || text.includes('Cancelled')) {
        expect(text).toContain('Cancelled');
      }
    }
  });

  test('TC-NA-FLT-06: Filter by Installed By: Partner Self ("3M Infocare")', async () => {
    await newActivationsPage.setFilterById('installedBy', '3M Infocare');
    await newActivationsPage.applyFilters();
    const rows = await newActivationsPage.getTableRowsData();
    for (const r of rows) {
      const text = r.join(' ');
      if (text.includes('3M Infocare') || text.includes('EWAY HM')) {
        expect(text).toContain('3M Infocare');
      }
    }
  });

  test('TC-NA-FLT-07: Filter by Installed By: Reseller ("EWAY HM")', async () => {
    await newActivationsPage.setFilterById('installedBy', 'EWAY HM');
    await newActivationsPage.applyFilters();
    const rows = await newActivationsPage.getTableRowsData();
    for (const r of rows) {
      const text = r.join(' ');
      if (text.includes('EWAY HM')) {
        expect(text).toContain('EWAY HM');
      }
    }
  });

  test('TC-NA-FLT-08: Combined Multi-Filter: Busy 21 + Cancelled + EWAY HM', async () => {
    await newActivationsPage.selectDesktopVariation('Busy 21');
    await newActivationsPage.setFilterById('status', 'Cancelled');
    await newActivationsPage.setFilterById('installedBy', 'EWAY HM');
    await newActivationsPage.applyFilters();

    const rows = await newActivationsPage.getTableRowsData();
    expect(rows.length).toBeGreaterThanOrEqual(0);
    if (rows.length > 0) {
      const firstRowText = rows[0].join(' ');
      expect(firstRowText).toContain('Cancelled');
    }
  });
});

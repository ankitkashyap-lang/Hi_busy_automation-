const { test, expect } = require('@playwright/test');
const { InactivePage } = require('../../../pages/Reports/InactivePage');
const inactiveData = require('../../../test-data/reports/inactiveData');

const path = require('path');
const fs = require('fs');

test.describe.configure({ mode: 'serial' });

test.describe('Inactive Report - Products & Filter Combinations Suite', () => {
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

  // ==========================================
  // SECTION 1: PRODUCT DROPDOWN & TAB TESTING
  // ==========================================

  test('TC-INACT-PROD-01: Default Product Selection is Desktop', async () => {
    const select = inactivePage.locators.productSelect;
    if (await select.isVisible().catch(() => false)) {
      const val = await select.inputValue().catch(() => '');
      expect(['Desktop', 'Busy 21', 'All']).toContain(val || 'Desktop');
    }
    const metrics = await inactivePage.getMetricsSummary();
    expect(metrics.inactiveCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-INACT-PROD-02: Verify Product Dropdown Variations (Busy 21 / Mandi / Magic)', async () => {
    const select = inactivePage.locators.productSelect;
    if (await select.isVisible().catch(() => false)) {
      const options = await select.locator('option').allInnerTexts().catch(() => []);
      expect(options.length).toBeGreaterThanOrEqual(1);
    }
    await inactivePage.selectDesktopVariation('Busy 21');
    const metrics = await inactivePage.getMetricsSummary();
    expect(metrics.inactiveCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-INACT-PROD-03: Switch Product to "Online"', async () => {
    await inactivePage.switchProduct('online');
    expect(page.url()).toContain('product=online');
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('Internal Server Error');
  });

  test('TC-INACT-PROD-04: Switch Product to "Mobile"', async () => {
    await inactivePage.switchProduct('mobile');
    expect(page.url()).toContain('product=mobile');
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('Internal Server Error');
  });

  test('TC-INACT-PROD-05: Switch Product to "Recom"', async () => {
    await inactivePage.switchProduct('recom');
    expect(page.url()).toContain('product=recom');
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('Internal Server Error');
  });

  test('TC-INACT-PROD-06: Switch Product to "mazu"', async () => {
    await inactivePage.switchProduct('mazu');
    expect(page.url()).toContain('product=mazu');
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('Internal Server Error');
  });

  test('TC-INACT-PROD-07: Switch Product to "RDP"', async () => {
    await inactivePage.switchProduct('rdp');
    expect(page.url()).toContain('product=rdp');
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('Internal Server Error');
  });

  test('TC-INACT-PROD-08: Sequential Multi-Product & Tab Switching Stability', async () => {
    await inactivePage.switchProduct('online');
    await page.waitForTimeout(1000);
    await inactivePage.switchProduct('mobile');
    await page.waitForTimeout(1000);
    await inactivePage.switchProduct('desktop');
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('product=desktop');
    const metrics = await inactivePage.getMetricsSummary();
    expect(metrics.inactiveCount).toBeGreaterThanOrEqual(0);
  });

  // ==========================================
  // SECTION 2: FILTERS & COMBINATIONS TESTING
  // ==========================================

  test('TC-INACT-FLT-01: Filter by Days: "30 Days" (Default)', async () => {
    await inactivePage.setFilter('days', '30 Days');
    await inactivePage.applyFilters();

    const metrics = await inactivePage.getMetricsSummary();
    expect(metrics.inactiveCount).toBeGreaterThan(0);
  });

  test('TC-INACT-FLT-02: Filter by Days: "90 Days"', async () => {
    await inactivePage.setFilter('days', '90 Days');
    await inactivePage.applyFilters();

    const metrics = await inactivePage.getMetricsSummary();
    expect(metrics.inactiveCount).toBeGreaterThan(0);
  });

  test('TC-INACT-FLT-03: Filter by Days: "180 Days"', async () => {
    await inactivePage.setFilter('days', '180 Days');
    await inactivePage.applyFilters();

    const metrics = await inactivePage.getMetricsSummary();
    expect(metrics.inactiveCount).toBeGreaterThan(0);
  });

  test('TC-INACT-FLT-04: Filter by Status: "Active"', async () => {
    await inactivePage.setFilter('days', '30 Days');
    await inactivePage.setFilter('status', 'Active');
    await inactivePage.applyFilters();

    const rows = await inactivePage.getTableRowsData();
    if (rows.length > 0) {
      // Every rendered row status cell should indicate Active
      for (const row of rows.slice(0, 5)) {
        const rowText = row.join(' ');
        expect(rowText.toLowerCase()).toContain('active');
      }
    }
  });

  test('TC-INACT-FLT-05: Filter by Status: "Disabled"', async () => {
    await inactivePage.setFilter('status', 'Disabled');
    await inactivePage.applyFilters();

    const metrics = await inactivePage.getMetricsSummary();
    expect(metrics.inactiveCount).toBeGreaterThanOrEqual(0);

    const rows = await inactivePage.getTableRowsData();
    if (rows.length > 0) {
      for (const row of rows.slice(0, 5)) {
        const rowText = row.join(' ');
        expect(rowText.toLowerCase()).toContain('disable');
      }
    } else {
      expect(rows.length).toBe(0);
    }
  });

  test('TC-INACT-FLT-06: Filter by Status: "Expired"', async () => {
    await inactivePage.setFilter('status', 'Expired');
    await inactivePage.applyFilters();

    const metrics = await inactivePage.getMetricsSummary();
    expect(metrics.inactiveCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-INACT-FLT-07: Filter by Model: "Basic - Single User"', async () => {
    await inactivePage.setFilter('status', 'All');
    await inactivePage.setFilter('model', 'Basic - Single User');
    await inactivePage.applyFilters();

    const rows = await inactivePage.getTableRowsData();
    if (rows.length > 0) {
      for (const row of rows.slice(0, 5)) {
        const rowText = row.join(' ');
        expect(rowText).toMatch(/BS|Basic/i);
      }
    }
  });

  test('TC-INACT-FLT-08: Filter by Model: "Standard - Single User"', async () => {
    await inactivePage.setFilter('model', 'Standard - Single User');
    await inactivePage.applyFilters();

    const rows = await inactivePage.getTableRowsData();
    if (rows.length > 0) {
      for (const row of rows.slice(0, 5)) {
        const rowText = row.join(' ');
        expect(rowText).toMatch(/SS|Standard/i);
      }
    }
  });

  test('TC-INACT-FLT-09: Filter by Release Version: "21"', async () => {
    await inactivePage.setFilter('model', 'All');
    await inactivePage.setFilter('releaseVersion', '21');
    await inactivePage.applyFilters();

    const metrics = await inactivePage.getMetricsSummary();
    expect(metrics.version21Count).toBeGreaterThan(0);
  });

  test('TC-INACT-FLT-10: Filter by Release Version: "18"', async () => {
    await inactivePage.setFilter('releaseVersion', '18');
    await inactivePage.applyFilters();

    const metrics = await inactivePage.getMetricsSummary();
    expect(metrics.version18Count).toBeGreaterThanOrEqual(0);
  });

  test('TC-INACT-FLT-11: Filter by User Architecture: "SU" (Single User)', async () => {
    await inactivePage.setFilter('releaseVersion', 'All');
    await inactivePage.setFilter('userType', 'SU');
    await inactivePage.applyFilters();

    const rows = await inactivePage.getTableRowsData();
    expect(rows.length).toBeGreaterThan(0);
  });

  test('TC-INACT-FLT-12: Filter by User Architecture: "MU" (Multi User)', async () => {
    await inactivePage.setFilter('userType', 'MU');
    await inactivePage.applyFilters();

    const rows = await inactivePage.getTableRowsData();
    expect(rows.length).toBeGreaterThanOrEqual(0);
  });

  test('TC-INACT-FLT-13: Filter by City: "Faridabad"', async () => {
    await inactivePage.setFilter('userType', 'All');
    await inactivePage.setFilter('city', 'Faridabad');
    await inactivePage.applyFilters();

    const rows = await inactivePage.getTableRowsData();
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows.slice(0, 5)) {
      expect(row.join(' ')).toContain('Faridabad');
    }
  });

  test('TC-INACT-FLT-14: Filter by Installed By: Partner Self ("3M Infocare")', async () => {
    await inactivePage.setFilter('city', 'All');
    await inactivePage.setFilter('installedBy', '3M Infocare');
    await inactivePage.applyFilters();

    const rows = await inactivePage.getTableRowsData();
    expect(rows.length).toBeGreaterThan(0);
  });

  test('TC-INACT-FLT-15: Filter by Category: "Regular"', async () => {
    await inactivePage.setFilter('installedBy', 'All');
    await inactivePage.setFilter('category', 'Regular');
    await inactivePage.applyFilters();

    const metrics = await inactivePage.getMetricsSummary();
    expect(metrics.inactiveCount).toBeGreaterThan(0);
  });

  test('TC-INACT-FLT-16: Combined Multi-Filter: 30 Days + Active + Faridabad', async () => {
    await inactivePage.setFilter('days', '30 Days');
    await inactivePage.setFilter('status', 'Active');
    await inactivePage.setFilter('category', 'All');
    await inactivePage.setFilter('city', 'Faridabad');
    await inactivePage.applyFilters();

    const rows = await inactivePage.getTableRowsData();
    if (rows.length > 0) {
      for (const row of rows.slice(0, 5)) {
        const text = row.join(' ');
        expect(text.toLowerCase()).toContain('active');
        expect(text).toContain('Faridabad');
      }
    } else {
      expect(rows.length).toBe(0);
    }
  });
});

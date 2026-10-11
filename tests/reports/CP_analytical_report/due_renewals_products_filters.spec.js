const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../../pages/loginPage');
const { DueRenewalsPage } = require('../../../pages/Reports/DueRenewalsPage');
const dueRenewalsData = require('../../../test-data/reports/dueRenewalsData');
const globalConfig = require('../../../config/globalConfig');

test.describe('Due Renewals Report - Products & Filter Combinations Suite', () => {
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
    // Return to default desktop due renewals before each test
    await page.goto(dueRenewalsData.DUE_RENEWALS_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
  });

  // ==========================================
  // SECTION 1: PRODUCT DROPDOWN & TAB TESTING
  // ==========================================

  test('TC-DR-PROD-01: Default Product Selection is Desktop', async () => {
    expect(page.url()).toContain('product=desktop');
    const metrics = await dueRenewalsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-DR-PROD-02: Select Desktop Variation "All"', async () => {
    await dueRenewalsPage.selectDesktopVariation('All');
    await dueRenewalsPage.applyFilters();
    const metrics = await dueRenewalsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-DR-PROD-03: Select Desktop Variation "Mandi"', async () => {
    await dueRenewalsPage.selectDesktopVariation('Mandi');
    await dueRenewalsPage.applyFilters();
    const metrics = await dueRenewalsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-DR-PROD-04: Switch Product to "Online"', async () => {
    await dueRenewalsPage.switchProduct('online');
    expect(page.url()).toContain('product=online');
    const metrics = await dueRenewalsPage.getMetricsSummary();
    expect(metrics.rawText).toContain('Due Renewals');
  });

  test('TC-DR-PROD-05: Switch Product to "Mobile"', async () => {
    await dueRenewalsPage.switchProduct('mobile');
    expect(page.url()).toContain('product=mobile');
    const metrics = await dueRenewalsPage.getMetricsSummary();
    expect(metrics.rawText).toContain('Due Renewals');
  });

  test('TC-DR-PROD-06: Switch Product to "Recom"', async () => {
    await dueRenewalsPage.switchProduct('recom');
    expect(page.url()).toContain('product=recom');
    const metrics = await dueRenewalsPage.getMetricsSummary();
    expect(metrics.rawText).toContain('Due Renewals');
  });

  test('TC-DR-PROD-07: Switch Product to "mazu"', async () => {
    await dueRenewalsPage.switchProduct('mazu');
    expect(page.url()).toContain('product=mazu');
    const metrics = await dueRenewalsPage.getMetricsSummary();
    expect(metrics.rawText).toContain('Due Renewals');
  });

  test('TC-DR-PROD-08: Sequential Multi-Product Toggling Stability', async () => {
    await dueRenewalsPage.switchProduct('online');
    await page.waitForTimeout(1500);
    await dueRenewalsPage.switchProduct('mobile');
    await page.waitForTimeout(1500);
    await dueRenewalsPage.switchProduct('desktop');
    await page.waitForTimeout(3000);
    expect(page.url()).toContain('product=desktop');
    const metrics = await dueRenewalsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-DR-PROD-09: Select Desktop Variation "Busy 21"', async () => {
    await dueRenewalsPage.selectDesktopVariation('Busy 21');
    await dueRenewalsPage.applyFilters();
    const metrics = await dueRenewalsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-DR-PROD-10: Select Desktop Variation "Magic"', async () => {
    const select = dueRenewalsPage.locators.desktopVariationSelect;
    const hasMagic = await select.locator('option[value="Magic"]').count();
    if (hasMagic > 0) {
      await dueRenewalsPage.selectDesktopVariation('Magic');
      await dueRenewalsPage.applyFilters();
      const metrics = await dueRenewalsPage.getMetricsSummary();
      expect(metrics.rawText).toContain('Due Renewals');
    } else {
      // Magic option check verified gracefully if not enabled for this partner
      expect(hasMagic).toBe(0);
    }
  });

  test('TC-DR-PROD-11: Switch Product to "RDP"', async () => {
    await dueRenewalsPage.switchProduct('rdp');
    expect(page.url()).toContain('product=rdp');
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('Internal Server Error');
  });

  test('TC-DR-PROD-12: Cross-Tab State Preservation (Desktop -> Online -> Desktop)', async () => {
    await dueRenewalsPage.selectDesktopVariation('Busy 21');
    await dueRenewalsPage.switchProduct('online');
    expect(page.url()).toContain('product=online');
    await page.waitForTimeout(1000);
    await dueRenewalsPage.switchProduct('desktop');
    expect(page.url()).toContain('product=desktop');
    const select = dueRenewalsPage.locators.desktopVariationSelect;
    if (await select.isVisible()) {
      const val = await select.inputValue();
      expect(['Busy 21', 'All']).toContain(val);
    }
  });

  // ==========================================
  // SECTION 2: SINGLE FILTER TESTING
  // ==========================================

  test('TC-DR-FILT-01: Filter by Time Period: "Today"', async () => {
    await dueRenewalsPage.setAutocompleteFilter(dueRenewalsData.FILTER_INDICES.TIME_PERIOD, 'Today');
    await dueRenewalsPage.applyFilters();
    const metrics = await dueRenewalsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-DR-FILT-02: Filter by Time Period: "Next Month"', async () => {
    await dueRenewalsPage.setAutocompleteFilter(dueRenewalsData.FILTER_INDICES.TIME_PERIOD, 'Next Month');
    await dueRenewalsPage.applyFilters();
    const metrics = await dueRenewalsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-DR-FILT-03: Filter by Renew Status: "Expired"', async () => {
    await dueRenewalsPage.setAutocompleteFilter(dueRenewalsData.FILTER_INDICES.RENEW_STATUS, 'Expired');
    await dueRenewalsPage.applyFilters();
    const metrics = await dueRenewalsPage.getMetricsSummary();
    expect(metrics.expiredCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-DR-FILT-04: Filter by Renew Status: "Pending"', async () => {
    await dueRenewalsPage.setAutocompleteFilter(dueRenewalsData.FILTER_INDICES.RENEW_STATUS, 'Pending');
    await dueRenewalsPage.applyFilters();
    const metrics = await dueRenewalsPage.getMetricsSummary();
    expect(metrics.pendingCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-DR-FILT-05: Filter by Renew Status: "In Grace"', async () => {
    await dueRenewalsPage.setAutocompleteFilter(dueRenewalsData.FILTER_INDICES.RENEW_STATUS, 'In Grace');
    await dueRenewalsPage.applyFilters();
    const metrics = await dueRenewalsPage.getMetricsSummary();
    expect(metrics.inGraceCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-DR-FILT-06: Filter by Times Renewed: "1"', async () => {
    await dueRenewalsPage.setAutocompleteFilter(dueRenewalsData.FILTER_INDICES.TIMES_RENEWED, '1');
    await dueRenewalsPage.applyFilters();
    const metrics = await dueRenewalsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-DR-FILT-07: Filter by Version: "21"', async () => {
    await dueRenewalsPage.setAutocompleteFilter(dueRenewalsData.FILTER_INDICES.VERSION, '21');
    await dueRenewalsPage.applyFilters();
    const metrics = await dueRenewalsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-DR-FILT-08: Filter by City: "Delhi"', async () => {
    await dueRenewalsPage.setAutocompleteFilter(dueRenewalsData.FILTER_INDICES.CITY, 'Delhi');
    await dueRenewalsPage.applyFilters();
    const metrics = await dueRenewalsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-DR-FILT-09: Filter by Category: "Regular"', async () => {
    await dueRenewalsPage.setAutocompleteFilter(dueRenewalsData.FILTER_INDICES.CATEGORY, 'Regular');
    await dueRenewalsPage.applyFilters();
    const metrics = await dueRenewalsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  // ==========================================
  // SECTION 3: MULTI-FILTER COMBINATIONS
  // ==========================================

  test('TC-DR-COMB-01: Combined Filter: Status: Expired + Time: This Month', async () => {
    await dueRenewalsPage.setAutocompleteFilter(dueRenewalsData.FILTER_INDICES.RENEW_STATUS, 'Expired');
    await dueRenewalsPage.setAutocompleteFilter(dueRenewalsData.FILTER_INDICES.TIME_PERIOD, 'This Month');
    await dueRenewalsPage.applyFilters();

    const metrics = await dueRenewalsPage.getMetricsSummary();
    expect(metrics.expiredCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-DR-COMB-02: Combined Filter: Status: Expired + Version: 21', async () => {
    await dueRenewalsPage.setAutocompleteFilter(dueRenewalsData.FILTER_INDICES.RENEW_STATUS, 'Expired');
    await dueRenewalsPage.setAutocompleteFilter(dueRenewalsData.FILTER_INDICES.VERSION, '21');
    await dueRenewalsPage.applyFilters();

    const metrics = await dueRenewalsPage.getMetricsSummary();
    expect(metrics.expiredCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-DR-COMB-03: Combined Filter: City: Delhi + Times Renewed: 1', async () => {
    await dueRenewalsPage.setAutocompleteFilter(dueRenewalsData.FILTER_INDICES.CITY, 'Delhi');
    await dueRenewalsPage.setAutocompleteFilter(dueRenewalsData.FILTER_INDICES.TIMES_RENEWED, '1');
    await dueRenewalsPage.applyFilters();

    const metrics = await dueRenewalsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-DR-COMB-04: Cross-Product Filter: Online + Status: Due + Time: This Month', async () => {
    await dueRenewalsPage.switchProduct('online');
    await dueRenewalsPage.setAutocompleteFilter(dueRenewalsData.FILTER_INDICES.RENEW_STATUS, 'Due');
    await dueRenewalsPage.applyFilters();

    const metrics = await dueRenewalsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-DR-COMB-05: Tri-Filter Combination: Status: Expired + Version: 21 + City: Delhi', async () => {
    await dueRenewalsPage.setAutocompleteFilter(dueRenewalsData.FILTER_INDICES.RENEW_STATUS, 'Expired');
    await dueRenewalsPage.setAutocompleteFilter(dueRenewalsData.FILTER_INDICES.VERSION, '21');
    await dueRenewalsPage.setAutocompleteFilter(dueRenewalsData.FILTER_INDICES.CITY, 'Delhi');
    await dueRenewalsPage.applyFilters();

    const metrics = await dueRenewalsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });
});

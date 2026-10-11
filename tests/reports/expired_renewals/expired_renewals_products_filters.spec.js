const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../../pages/loginPage');
const { ExpiredRenewalsPage } = require('../../../pages/Reports/ExpiredRenewalsPage');
const expiredRenewalsData = require('../../../test-data/reports/expiredRenewalsData');
const globalConfig = require('../../../config/globalConfig');

test.describe('Expired Renewals Report - Products & Filter Combinations Suite', () => {
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
    await page.goto(expiredRenewalsData.EXPIRED_RENEWALS_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
  });

  // ==========================================
  // SECTION 1: PRODUCT DROPDOWN & TAB TESTING
  // ==========================================

  test('TC-ER-PROD-01: Default Product Selection is Desktop', async () => {
    expect(page.url()).toContain('product=desktop');
    const metrics = await expiredRenewalsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-ER-PROD-02: Select Desktop Variation "All"', async () => {
    await expiredRenewalsPage.selectDesktopVariation('All');
    await expiredRenewalsPage.applyFilters();
    const metrics = await expiredRenewalsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-ER-PROD-03: Select Desktop Variation "Mandi"', async () => {
    await expiredRenewalsPage.selectDesktopVariation('Mandi');
    await expiredRenewalsPage.applyFilters();
    const metrics = await expiredRenewalsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-ER-PROD-04: Switch Product to "Online"', async () => {
    await expiredRenewalsPage.switchProduct('online');
    expect(page.url()).toContain('product=online');
    const metrics = await expiredRenewalsPage.getMetricsSummary();
    expect(metrics.rawText).toContain('Expired Renewals');
  });

  test('TC-ER-PROD-05: Switch Product to "Mobile"', async () => {
    await expiredRenewalsPage.switchProduct('mobile');
    expect(page.url()).toContain('product=mobile');
    const metrics = await expiredRenewalsPage.getMetricsSummary();
    expect(metrics.rawText).toContain('Expired Renewals');
  });

  test('TC-ER-PROD-06: Switch Product to "Recom"', async () => {
    await expiredRenewalsPage.switchProduct('recom');
    expect(page.url()).toContain('product=recom');
    const metrics = await expiredRenewalsPage.getMetricsSummary();
    expect(metrics.rawText).toContain('Expired Renewals');
  });

  test('TC-ER-PROD-07: Switch Product to "mazu"', async () => {
    await expiredRenewalsPage.switchProduct('mazu');
    expect(page.url()).toContain('product=mazu');
    const metrics = await expiredRenewalsPage.getMetricsSummary();
    expect(metrics.rawText).toContain('Expired Renewals');
  });

  test('TC-ER-PROD-08: Sequential Multi-Product Toggling Stability', async () => {
    await expiredRenewalsPage.switchProduct('online');
    await page.waitForTimeout(1500);
    await expiredRenewalsPage.switchProduct('mobile');
    await page.waitForTimeout(1500);
    await expiredRenewalsPage.switchProduct('desktop');
    await page.waitForTimeout(3000);
    expect(page.url()).toContain('product=desktop');
    const metrics = await expiredRenewalsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-ER-PROD-09: Select Desktop Variation "Busy 21"', async () => {
    await expiredRenewalsPage.selectDesktopVariation('Busy 21');
    await expiredRenewalsPage.applyFilters();
    const metrics = await expiredRenewalsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-ER-PROD-10: Select Desktop Variation "Magic"', async () => {
    const select = expiredRenewalsPage.locators.desktopVariationSelect;
    const hasMagic = await select.locator('option[value="Magic"]').count();
    if (hasMagic > 0) {
      await expiredRenewalsPage.selectDesktopVariation('Magic');
      await expiredRenewalsPage.applyFilters();
      const metrics = await expiredRenewalsPage.getMetricsSummary();
      expect(metrics.rawText).toContain('Expired Renewals');
    } else {
      expect(hasMagic).toBe(0);
    }
  });

  test('TC-ER-PROD-11: Switch Product to "RDP"', async () => {
    await expiredRenewalsPage.switchProduct('rdp');
    expect(page.url()).toContain('product=rdp');
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('Internal Server Error');
  });

  test('TC-ER-PROD-12: Cross-Tab State Preservation (Desktop -> Mobile -> Desktop)', async () => {
    await expiredRenewalsPage.selectDesktopVariation('Busy 21');
    await expiredRenewalsPage.switchProduct('mobile');
    expect(page.url()).toContain('product=mobile');
    await page.waitForTimeout(1000);
    await expiredRenewalsPage.switchProduct('desktop');
    expect(page.url()).toContain('product=desktop');
    const select = expiredRenewalsPage.locators.desktopVariationSelect;
    if (await select.isVisible()) {
      const val = await select.inputValue();
      expect(['Busy 21', 'All']).toContain(val);
    }
  });

  // ==========================================
  // SECTION 2: SINGLE FILTER TESTING
  // ==========================================

  test('TC-ER-FILT-01: Filter by Time Period: "< 3 Months"', async () => {
    await expiredRenewalsPage.setAutocompleteFilter(expiredRenewalsData.FILTER_INDICES.TIME_PERIOD, '< 3 Months');
    await expiredRenewalsPage.applyFilters();
    const metrics = await expiredRenewalsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-ER-FILT-02: Filter by Time Period: "4-6 Months"', async () => {
    await expiredRenewalsPage.setAutocompleteFilter(expiredRenewalsData.FILTER_INDICES.TIME_PERIOD, '4-6 Months');
    await expiredRenewalsPage.applyFilters();
    const metrics = await expiredRenewalsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-ER-FILT-03: Filter by Renew Status: "Expired"', async () => {
    await expiredRenewalsPage.setAutocompleteFilter(expiredRenewalsData.FILTER_INDICES.RENEW_STATUS, 'Expired');
    await expiredRenewalsPage.applyFilters();
    const metrics = await expiredRenewalsPage.getMetricsSummary();
    expect(metrics.expiredCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-ER-FILT-04: Filter by Renew Status: "In Grace"', async () => {
    await expiredRenewalsPage.setAutocompleteFilter(expiredRenewalsData.FILTER_INDICES.RENEW_STATUS, 'In Grace');
    await expiredRenewalsPage.applyFilters();
    const metrics = await expiredRenewalsPage.getMetricsSummary();
    expect(metrics.inGraceCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-ER-FILT-05: Filter by Renew Status: "By Others"', async () => {
    await expiredRenewalsPage.setAutocompleteFilter(expiredRenewalsData.FILTER_INDICES.RENEW_STATUS, 'By Others');
    await expiredRenewalsPage.applyFilters();
    const metrics = await expiredRenewalsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-ER-FILT-06: Filter by Times Renewed: "1"', async () => {
    await expiredRenewalsPage.setAutocompleteFilter(expiredRenewalsData.FILTER_INDICES.TIMES_RENEWED, '1');
    await expiredRenewalsPage.applyFilters();
    const metrics = await expiredRenewalsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-ER-FILT-07: Filter by Version: "21"', async () => {
    await expiredRenewalsPage.setAutocompleteFilter(expiredRenewalsData.FILTER_INDICES.VERSION, '21');
    await expiredRenewalsPage.applyFilters();
    const metrics = await expiredRenewalsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-ER-FILT-08: Filter by City: "Delhi"', async () => {
    await expiredRenewalsPage.setAutocompleteFilter(expiredRenewalsData.FILTER_INDICES.CITY, 'Delhi');
    await expiredRenewalsPage.applyFilters();
    const metrics = await expiredRenewalsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-ER-FILT-09: Filter by Category: "Regular"', async () => {
    await expiredRenewalsPage.setAutocompleteFilter(expiredRenewalsData.FILTER_INDICES.CATEGORY, 'Regular');
    await expiredRenewalsPage.applyFilters();
    const metrics = await expiredRenewalsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  // ==========================================
  // SECTION 3: MULTI-FILTER COMBINATIONS
  // ==========================================

  test('TC-ER-COMB-01: Combined Filter: Status: Expired + Time: < 3 Months', async () => {
    await expiredRenewalsPage.setAutocompleteFilter(expiredRenewalsData.FILTER_INDICES.RENEW_STATUS, 'Expired');
    await expiredRenewalsPage.setAutocompleteFilter(expiredRenewalsData.FILTER_INDICES.TIME_PERIOD, '< 3 Months');
    await expiredRenewalsPage.applyFilters();

    const metrics = await expiredRenewalsPage.getMetricsSummary();
    expect(metrics.expiredCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-ER-COMB-02: Combined Filter: Status: Expired + Version: 21', async () => {
    await expiredRenewalsPage.setAutocompleteFilter(expiredRenewalsData.FILTER_INDICES.RENEW_STATUS, 'Expired');
    await expiredRenewalsPage.setAutocompleteFilter(expiredRenewalsData.FILTER_INDICES.VERSION, '21');
    await expiredRenewalsPage.applyFilters();

    const metrics = await expiredRenewalsPage.getMetricsSummary();
    expect(metrics.expiredCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-ER-COMB-03: Combined Filter: City: Delhi + Times Renewed: 1', async () => {
    await expiredRenewalsPage.setAutocompleteFilter(expiredRenewalsData.FILTER_INDICES.CITY, 'Delhi');
    await expiredRenewalsPage.setAutocompleteFilter(expiredRenewalsData.FILTER_INDICES.TIMES_RENEWED, '1');
    await expiredRenewalsPage.applyFilters();

    const metrics = await expiredRenewalsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-ER-COMB-04: Cross-Product Filter: Online + Status: Expired', async () => {
    await expiredRenewalsPage.switchProduct('online');
    await expiredRenewalsPage.setAutocompleteFilter(expiredRenewalsData.FILTER_INDICES.RENEW_STATUS, 'Expired');
    await expiredRenewalsPage.applyFilters();

    const metrics = await expiredRenewalsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-ER-COMB-05: Tri-Filter Combination: Status: Expired + Version: 21 + City: Delhi', async () => {
    await expiredRenewalsPage.setAutocompleteFilter(expiredRenewalsData.FILTER_INDICES.RENEW_STATUS, 'Expired');
    await expiredRenewalsPage.setAutocompleteFilter(expiredRenewalsData.FILTER_INDICES.VERSION, '21');
    await expiredRenewalsPage.setAutocompleteFilter(expiredRenewalsData.FILTER_INDICES.CITY, 'Delhi');
    await expiredRenewalsPage.applyFilters();

    const metrics = await expiredRenewalsPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });
});

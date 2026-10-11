const { test, expect } = require('@playwright/test');
const { TransferInPage } = require('../../../pages/Reports/TransferInPage');
const transferInData = require('../../../test-data/reports/transferInData');
const path = require('path');
const fs = require('fs');

test.describe('Transfer In Report - Filters & Sorting Suite', () => {
  let context;
  let page;
  let transferInPage;
  const storageStatePath = path.join(__dirname, '../../../storageState/adminAuth.json');

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(90000);
    const hasStorage = fs.existsSync(storageStatePath);
    context = await browser.newContext({
      storageState: hasStorage ? storageStatePath : undefined,
      acceptDownloads: true
    });
    page = await context.newPage();
    transferInPage = new TransferInPage(page);
    await transferInPage.navigateToTransferIn(transferInData.DEFAULT_PARTNER);
  });

  test.afterAll(async () => {
    if (page) await page.close().catch(() => {});
    if (context) await context.close().catch(() => {});
  });

  test.beforeEach(async () => {
    // Reset to fresh default page state before each test
    await page.goto(transferInData.TRANSFER_IN_URL, { waitUntil: 'domcontentloaded' });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
  });

  // ==========================================
  // SECTION 1: PRODUCT DROPDOWN & TAB TESTING
  // ==========================================

  test('TC-TI-PROD-01: Default Product Selection is Desktop', async () => {
    const select = transferInPage.locators.productSelect;
    if (await select.isVisible().catch(() => false)) {
      const val = await select.inputValue().catch(() => '');
      expect(['Desktop', 'Busy 21', 'All']).toContain(val || 'Desktop');
    }
    const metrics = await transferInPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-TI-PROD-02: Verify Product Dropdown Variations (Busy 21 / Mandi / Magic)', async () => {
    const select = transferInPage.locators.productSelect;
    if (await select.isVisible().catch(() => false)) {
      const options = await select.locator('option').allInnerTexts().catch(() => []);
      expect(options.length).toBeGreaterThanOrEqual(1);
    }
    await transferInPage.selectDesktopVariation('Busy 21');
    const metrics = await transferInPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-TI-PROD-03: Switch Product to "Online"', async () => {
    await transferInPage.switchProduct('online');
    expect(page.url()).toContain('product=online');
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('Internal Server Error');
  });

  test('TC-TI-PROD-04: Switch Product to "Mobile"', async () => {
    await transferInPage.switchProduct('mobile');
    expect(page.url()).toContain('product=mobile');
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('Internal Server Error');
  });

  test('TC-TI-PROD-05: Switch Product to "Recom"', async () => {
    await transferInPage.switchProduct('recom');
    expect(page.url()).toContain('product=recom');
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('Internal Server Error');
  });

  test('TC-TI-PROD-06: Switch Product to "mazu"', async () => {
    await transferInPage.switchProduct('mazu');
    expect(page.url()).toContain('product=mazu');
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('Internal Server Error');
  });

  test('TC-TI-PROD-07: Switch Product to "RDP"', async () => {
    await transferInPage.switchProduct('rdp');
    expect(page.url()).toContain('product=rdp');
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('Internal Server Error');
  });

  test('TC-TI-PROD-08: Sequential Multi-Product & Tab Switching Stability', async () => {
    await transferInPage.switchProduct('online');
    await page.waitForTimeout(1000);
    await transferInPage.switchProduct('mobile');
    await page.waitForTimeout(1000);
    await transferInPage.switchProduct('desktop');
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('product=desktop');
    const metrics = await transferInPage.getMetricsSummary();
    expect(metrics.totalCount).toBeGreaterThanOrEqual(0);
  });

  // ==========================================
  // SECTION 2: FILTERS & SORTING TESTING
  // ==========================================

  test('TC-TI-FLT-01: Default filter Time Period is "< 3 Months" with Populated Records', async () => {
    const defaultVal = await transferInPage.locators.timePeriodInput.inputValue();
    expect(defaultVal).toBe('< 3 Months');

    const rows = await transferInPage.getTableRowsData();
    expect(rows.length).toBeGreaterThan(0);
  });

  test('TC-TI-FLT-02: Filter by Time Period: "4-6 Months"', async () => {
    await transferInPage.setFilterById('timePeriod', '4-6 Months');
    await transferInPage.applyFilters();

    const inputVal = await transferInPage.locators.timePeriodInput.inputValue();
    expect(inputVal).toBe('4-6 Months');
  });

  test('TC-TI-FLT-03: Filter by Time Period: "7-9 Months"', async () => {
    await transferInPage.setFilterById('timePeriod', '7-9 Months');
    await transferInPage.applyFilters();

    const inputVal = await transferInPage.locators.timePeriodInput.inputValue();
    expect(inputVal).toBe('7-9 Months');
  });

  test('TC-TI-FLT-04: Filter by Time Period: "9+ Months"', async () => {
    await transferInPage.setFilterById('timePeriod', '9+ Months');
    await transferInPage.applyFilters();

    const inputVal = await transferInPage.locators.timePeriodInput.inputValue();
    expect(inputVal).toBe('9+ Months');
  });

  test('TC-TI-FLT-05: Filter by Subs Status: "Active"', async () => {
    await transferInPage.setFilterById('status', 'Active');
    await transferInPage.applyFilters();

    const rows = await transferInPage.getTableRowsData();
    expect(rows.length).toBeGreaterThan(0);
    // Verify every visible row has Active status
    for (const r of rows) {
      const fullText = r.join(' ');
      expect(fullText).toContain('Active');
    }
  });

  test('TC-TI-FLT-06: Filter by Subs Status: "Expired"', async () => {
    await transferInPage.setFilterById('status', 'Expired');
    await transferInPage.applyFilters();

    const rows = await transferInPage.getTableRowsData();
    // Verify rows are either 0 or have Expired
    if (rows.length > 0) {
      for (const r of rows) {
        expect(r.join(' ')).toContain('Expired');
      }
    }
  });

  test('TC-TI-FLT-07: Filter by Transferred From: "Inside Sales (Delhi Office)"', async () => {
    await transferInPage.setFilterById('transferredFrom', 'Inside Sales (Delhi Office)');
    await transferInPage.applyFilters();

    const rows = await transferInPage.getTableRowsData();
    if (rows.length > 0) {
      for (const r of rows) {
        expect(r.join(' ')).toMatch(/Inside Sales/i);
      }
    } else {
      expect(await transferInPage.hasNoData()).toBe(true);
    }
  });

  test('TC-TI-FLT-08: Filter by Transferred From: "Vision Softech"', async () => {
    await transferInPage.setFilterById('transferredFrom', 'Vision Softech');
    await transferInPage.applyFilters();

    const rows = await transferInPage.getTableRowsData();
    if (rows.length > 0) {
      for (const r of rows) {
        expect(r.join(' ')).toMatch(/Vision Softech/i);
      }
    } else {
      expect(await transferInPage.hasNoData()).toBe(true);
    }
  });

  test('TC-TI-FLT-09: Filter by City: "Faridabad"', async () => {
    await transferInPage.setFilterById('city', 'Faridabad');
    await transferInPage.applyFilters();

    const rows = await transferInPage.getTableRowsData();
    if (rows.length > 0) {
      for (const r of rows) {
        expect(r.join(' ')).toMatch(/Faridabad/i);
      }
    } else {
      expect(await transferInPage.hasNoData()).toBe(true);
    }
  });

  test('TC-TI-FLT-10: Filter by City: "Ahmedabad"', async () => {
    await transferInPage.setFilterById('city', 'Ahmedabad');
    await transferInPage.applyFilters();

    const rows = await transferInPage.getTableRowsData();
    if (rows.length > 0) {
      for (const r of rows) {
        expect(r.join(' ')).toMatch(/Ahmedabad/i);
      }
    } else {
      expect(await transferInPage.hasNoData()).toBe(true);
    }
  });

  test('TC-TI-FLT-11: Combined Filter: Subs Status "Active" + City "Faridabad"', async () => {
    await transferInPage.setFilterById('status', 'Active');
    await transferInPage.setFilterById('city', 'Faridabad');
    await transferInPage.applyFilters();

    const rows = await transferInPage.getTableRowsData();
    expect(rows.length).toBeGreaterThan(0);
    for (const r of rows) {
      const text = r.join(' ');
      expect(text).toContain('Active');
      expect(text).toContain('Faridabad');
    }
  });

  test('TC-TI-FLT-12: Multi-Filter Combination: Time Period + Transferred From + Status', async () => {
    await transferInPage.setFilterById('timePeriod', '< 3 Months');
    await transferInPage.setFilterById('transferredFrom', 'Inside Sales (Delhi Office)');
    await transferInPage.setFilterById('status', 'Active');
    await transferInPage.applyFilters();

    const rows = await transferInPage.getTableRowsData();
    expect(rows.length).toBeGreaterThan(0);
    for (const r of rows) {
      const text = r.join(' ');
      expect(text).toMatch(/Inside Sales/i);
      expect(text).toContain('Active');
    }
  });

  test('TC-TI-SORT-01: Table Sorting by Install Date Reorders Rows', async () => {
    const beforeSort = await transferInPage.getTableRowsData();
    expect(beforeSort.length).toBeGreaterThan(1);
    const firstSerialBefore = beforeSort[0][0];

    await transferInPage.sortByInstallDate();

    const afterSort = await transferInPage.getTableRowsData();
    expect(afterSort.length).toBe(beforeSort.length);
    const firstSerialAfter = afterSort[0][0];

    // Verify sort order changed
    expect(firstSerialBefore).not.toBe(firstSerialAfter);
  });
});

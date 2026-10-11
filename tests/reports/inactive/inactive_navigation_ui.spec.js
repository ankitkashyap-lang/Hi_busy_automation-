const { test, expect } = require('@playwright/test');
const { InactivePage } = require('../../../pages/Reports/InactivePage');
const inactiveData = require('../../../test-data/reports/inactiveData');

const path = require('path');
const fs = require('fs');

test.describe.configure({ mode: 'serial' });

test.describe('Inactive Report - Navigation & UI Suite', () => {
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

  test('TC-INACT-NAV-01: Direct URL Navigation to Inactive Report with Session Reuse', async () => {
    await page.goto(inactiveData.INACTIVE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    expect(page.url()).toContain('/partner/analytics/inactive');
    await expect(inactivePage.locators.pageTitle).toBeVisible({ timeout: 10000 });
  });

  test('TC-INACT-NAV-02: Header, Breadcrumb and Page Title Verification', async () => {
    const title = await page.title();
    expect(title).toContain('Hi Busy');

    await expect(inactivePage.locators.pageTitle).toBeVisible();
    await expect(inactivePage.locators.backButton).toBeVisible();
  });

  test('TC-INACT-NAV-03: Product Selection Fixed to Busy 21', async () => {
    const productSelect = inactivePage.locators.productSelect;
    await expect(productSelect).toBeVisible({ timeout: 10000 });

    const selectedOption = await productSelect.inputValue().catch(async () => {
      return await productSelect.innerText();
    });
    expect(selectedOption).toMatch(/Busy 21|Desktop/i);

    // Verify it is disabled by design
    const isDisabled = await productSelect.isDisabled();
    expect(isDisabled).toBeTruthy();
  });

  test('TC-INACT-NAV-04: KPI Metric Summary Cards Display', async () => {
    const metrics = await inactivePage.getMetricsSummary();

    // Verify Inactive count and breakdown numbers are positive integers
    expect(metrics.inactiveCount).toBeGreaterThan(0);
    expect(metrics.customer0Count + metrics.customerGt0Count).toBeGreaterThan(0);
    expect(metrics.version21Count + metrics.version18Count).toBeGreaterThan(0);
  });

  test('TC-INACT-NAV-05: Category Badge Breakdown Display', async () => {
    // Primary category REG is always visible
    await expect(inactivePage.locators.categoryBadges.reg).toBeVisible({ timeout: 5000 });

    // Category breakdown dynamically renders present categories (e.g. REG, CA, FOC, ACC, TP)
    const otherBadges = [
      inactivePage.locators.categoryBadges.ca,
      inactivePage.locators.categoryBadges.foc,
      inactivePage.locators.categoryBadges.acc,
      inactivePage.locators.categoryBadges.tp
    ];

    let renderedCount = 1; // reg is visible
    for (const badge of otherBadges) {
      if (await badge.isVisible().catch(() => false)) {
        renderedCount++;
      }
    }
    expect(renderedCount).toBeGreaterThanOrEqual(2);
  });

  test('TC-INACT-NAV-06: UI Data Table Structure & 8 Column Headers Validation', async () => {
    await inactivePage.locators.tableHeaders.first().waitFor({ state: 'visible', timeout: 10000 });
    const headers = await inactivePage.locators.tableHeaders.allInnerTexts();
    const cleanedHeaders = headers.map(h => h.trim().replace(/\s+/g, ' ')).filter(Boolean);

    for (const expectedHeader of inactiveData.EXPECTED_UI_HEADERS) {
      expect(cleanedHeaders.some(h => h.toLowerCase().includes(expectedHeader.toLowerCase()))).toBeTruthy();
    }
    expect(cleanedHeaders.length).toBeGreaterThanOrEqual(8);
  });

  test('TC-INACT-NAV-07: Data Rows Virtual Scroll Rendering Verification', async () => {
    const rows = await inactivePage.getTableRowsData();
    expect(rows.length).toBeGreaterThan(0);

    // Verify sample row has at least serial number, dates, and status
    const sampleRow = rows[0];
    expect(sampleRow.length).toBeGreaterThanOrEqual(5);
  });
});

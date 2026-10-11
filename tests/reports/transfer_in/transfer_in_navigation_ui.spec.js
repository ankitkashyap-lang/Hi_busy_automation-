const { test, expect } = require('@playwright/test');
const { TransferInPage } = require('../../../pages/Reports/TransferInPage');
const transferInData = require('../../../test-data/reports/transferInData');
const path = require('path');
const fs = require('fs');

test.describe('Transfer In Report - Navigation & UI/UX Suite', () => {
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
    if (!page.url().includes('/partner/analytics/transferin')) {
      await page.goto(transferInData.TRANSFER_IN_URL, { waitUntil: 'domcontentloaded' });
    }
  });

  test('TC-TI-NAV-01 & 02: Verify Direct Navigation and Page Title of Transfer In', async () => {
    expect(page.url()).toContain('/partner/analytics/transferin');
    await expect(transferInPage.locators.pageTitle).toBeVisible({ timeout: 15000 });
    const headerText = await transferInPage.locators.pageTitle.innerText();
    expect(headerText).toMatch(/Transfer In/i);
  });

  test('TC-TI-NAV-03: Verify Back Navigation to Partner Dashboard', async () => {
    const backBtn = transferInPage.locators.backButton;
    await expect(backBtn).toBeVisible({ timeout: 10000 });
    await backBtn.click();
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/partner/dashboard');

    // Return to Transfer In
    await page.goto(transferInData.TRANSFER_IN_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/partner/analytics/transferin');
  });

  test('TC-TI-UI-01: Verify Product Selector Is Fixed to Busy 21 and Disabled', async () => {
    const select = transferInPage.locators.productSelect;
    await expect(select).toBeVisible({ timeout: 10000 });
    const value = await select.inputValue().catch(() => '');
    expect(value).toMatch(/Busy 21|Desktop/i);
    expect(await select.isDisabled()).toBeTruthy();
  });

  test('TC-TI-UI-02: Verify All 8 Autocomplete Filter Controls Are Rendered', async () => {
    const inputCount = await transferInPage.locators.allAutocompleteInputs.count();
    expect(inputCount).toBe(8);

    await expect(transferInPage.locators.timePeriodInput).toBeVisible();
    await expect(transferInPage.locators.statusInput).toBeVisible();
    await expect(transferInPage.locators.transferredFromInput).toBeVisible();
    await expect(transferInPage.locators.modelInput).toBeVisible();
    await expect(transferInPage.locators.versionInput).toBeVisible();
    await expect(transferInPage.locators.userInput).toBeVisible();
    await expect(transferInPage.locators.cityInput).toBeVisible();
    await expect(transferInPage.locators.installedByInput).toBeVisible();
  });

  test('TC-TI-UI-03: Verify Apply Filters Button is Visible and Enabled', async () => {
    const applyBtn = transferInPage.locators.applyFiltersButton;
    await expect(applyBtn).toBeVisible({ timeout: 10000 });
    await expect(applyBtn).toBeEnabled();
  });

  test('TC-TI-UI-04: Verify Data Grid 7 Columns Structure and Sample Records', async () => {
    await transferInPage.applyFilters();
    const pageText = await page.innerText('body');
    for (const col of transferInData.EXPECTED_UI_HEADERS) {
      expect(pageText).toContain(col);
    }

    const rows = await transferInPage.getTableRowsData();
    expect(rows.length).toBeGreaterThan(0);
  });

  test('TC-TI-UI-05: Verify Download Excel Button Visual Attributes', async () => {
    const dlBtn = transferInPage.locators.downloadExcelButton;
    await expect(dlBtn).toBeVisible({ timeout: 10000 });
    const title = await dlBtn.getAttribute('title').catch(() => null) ||
                  await dlBtn.locator('img').first().getAttribute('title').catch(() => '');
    expect(title).toMatch(/Download Excel/i);
  });

  test('TC-TI-UI-06: Verify Install Date Column Header Has Sorting Toggle Button', async () => {
    const sortBtn = transferInPage.locators.installDateSortButton;
    if (!(await sortBtn.isVisible().catch(() => false))) {
      await transferInPage.applyFilters();
    }
    await expect(sortBtn).toBeVisible({ timeout: 10000 });
  });

  test('TC-TI-UI-07: Verify Top KPI Metrics Summary Cards and Category Badges', async () => {
    await transferInPage.applyFilters();
    const metrics = await transferInPage.getMetricsSummary();
    expect(metrics.rawText).toContain('Transfer In');
    expect(metrics.rawText).toContain('Perpetual');
    expect(metrics.rawText).toContain('Subscription');
    expect(metrics.totalCount).toBeGreaterThan(0);

    // Verify Category Badges are present
    const pageText = await page.innerText('body');
    expect(pageText).toContain('REG');
    expect(pageText).toContain('CA');
    expect(pageText).toContain('ACC');
    expect(pageText).toContain('TP');
    expect(pageText).toContain('FOC');
    expect(pageText).toContain('Expired');
  });

  test('TC-TI-PROD-01 to 04: Product Query Parameter Resilience (online, mobile, recom, mazu)', async () => {
    for (const prod of ['online', 'mobile', 'recom', 'mazu']) {
      await page.goto(`${transferInData.TRANSFER_IN_URL}?product=${prod}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);
      expect(page.url()).toContain(`/partner/analytics/transferin?product=${prod}`);
      await expect(transferInPage.locators.pageTitle).toBeVisible();
    }

    // Return to standard URL
    await page.goto(transferInData.TRANSFER_IN_URL, { waitUntil: 'domcontentloaded' });
  });
});

const { test, expect } = require('@playwright/test');
const { TransferInPage } = require('../../../pages/Reports/TransferInPage');
const transferInData = require('../../../test-data/reports/transferInData');
const globalConfig = require('../../../config/globalConfig');
const path = require('path');
const fs = require('fs');

test.describe('Transfer In Report - Negative & Edge Cases Suite', () => {
  let context;
  let page;
  let transferInPage;
  const storageStatePath = path.join(__dirname, '../../../storageState/adminAuth.json');

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(90000);
    const hasStorage = fs.existsSync(storageStatePath);
    context = await browser.newContext({
      baseURL: globalConfig.BASE_URL,
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
    await page.goto(transferInData.TRANSFER_IN_URL, { waitUntil: 'domcontentloaded' });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
  });

  test('TC-TI-EMP-01: Empty state handling for 0-record filter combinations', async () => {
    // Select combination with 0 transfer-in records: Vision Softech + City: Ahmedabad
    await transferInPage.setFilterById('transferredFrom', 'Vision Softech');
    await transferInPage.setFilterById('city', 'Ahmedabad');
    await transferInPage.applyFilters();

    const rows = await transferInPage.getTableRowsData();
    expect(rows.length).toBe(0);

    // Verify UI displays gracefully without console errors or crash
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('Cannot read properties of undefined');
  });

  test('TC-TI-EMP-02: Filter recovery from empty state back to populated state', async () => {
    // 1. Enter empty state (Vision Softech + City: Ahmedabad)
    await transferInPage.setFilterById('transferredFrom', 'Vision Softech');
    await transferInPage.setFilterById('city', 'Ahmedabad');
    await transferInPage.applyFilters();
    let rows = await transferInPage.getTableRowsData();
    expect(rows.length).toBe(0);

    // 2. Recover to populated state by resetting filters to All
    await transferInPage.setFilterById('transferredFrom', 'All');
    await transferInPage.setFilterById('city', 'All');
    await transferInPage.applyFilters();

    rows = await transferInPage.getTableRowsData();
    expect(rows.length).toBeGreaterThan(0);
  });

  test('TC-TI-NEG-01: Rapid multiple clicks on Apply Filters button (Debounce test)', async () => {
    const applyBtn = transferInPage.locators.applyFiltersButton;
    await expect(applyBtn).toBeVisible();

    // Click multiple times rapidly
    await applyBtn.click();
    await applyBtn.click().catch(() => {});
    await applyBtn.click().catch(() => {});

    await page.waitForTimeout(3000);
    // Verify page is still functional, URL is intact, and data is populated
    expect(page.url()).toContain('/partner/analytics/transferin');
    await expect(transferInPage.locators.pageTitle).toBeVisible();
    const rows = await transferInPage.getTableRowsData();
    expect(rows.length).toBeGreaterThan(0);
  });

  test('TC-TI-NEG-02: Page Refresh (F5) resilience with session preservation', async () => {
    await transferInPage.applyFilters();
    const rowsBefore = await transferInPage.getTableRowsData();
    expect(rowsBefore.length).toBeGreaterThan(0);

    // Perform page reload (F5)
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Ensure session is intact and user not logged out
    expect(page.url()).toContain('/partner/analytics/transferin');
    await expect(transferInPage.locators.pageTitle).toBeVisible();
  });

  test('TC-TI-NEG-03: Special characters in filter input (XSS injection safety)', async () => {
    let dialogTriggered = false;
    page.once('dialog', async (dialog) => {
      dialogTriggered = true;
      await dialog.dismiss();
    });

    const input = transferInPage.locators.allAutocompleteInputs.nth(6); // City filter input
    await input.click();
    await input.fill('<script>alert("xss")</script>');
    await page.waitForTimeout(1000);
    await page.keyboard.press('Escape');

    // Confirm no JS execution dialog was triggered
    expect(dialogTriggered).toBe(false);
  });
});

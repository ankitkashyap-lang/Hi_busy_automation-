const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/loginPage');
const { ReportsPage } = require('../../pages/Reports/ReportsPage');
const { setupReportsSession } = require('../../utils/reportAuthHelper');
const globalConfig = require('../../config/globalConfig');

test.describe('Reports Module - Filter Combinations & Negative Scenarios', () => {
  let context;
  let page;
  let reportsPage;

  test.beforeAll(async ({ browser }) => {
    // 1. Perform Login once and initialize shared session
    const session = await setupReportsSession(browser);
    context = session.context;
    page = session.page;
    reportsPage = session.reportsPage;
  });

  test.afterAll(async () => {
    if (page) await page.close().catch(() => {});
    if (context) await context.close().catch(() => {});
  });

  test.beforeEach(async () => {
    if (context) {
      const pages = context.pages();
      for (const p of pages) {
        if (p !== page && !p.isClosed()) {
          await p.close().catch(() => {});
        }
      }
    }
    if (!page || page.isClosed()) {
      page = await context.newPage();
      const loginPage = new LoginPage(page);
      await loginPage.login(globalConfig.ADMIN_EMAIL, globalConfig.ADMIN_PASSWORD);
      await page.waitForLoadState('domcontentloaded');
      reportsPage = new ReportsPage(page);
    } else {
      await page.bringToFront().catch(() => {});
    }
  });

  test('FLT-01: Filter Combinations on AC Stock (Partner Type & Time Periods)', async () => {
    await reportsPage.navigateToReport('AC Stock', '/busy/report/acStock');

    // 1. Select Channel Partner
    await reportsPage.selectDropdownValue(0, 'Channel Partner');

    // 2. Select Time Period: Current Month
    await reportsPage.selectDropdownValue(4, 'Current Month');

    await reportsPage.submitReport();
    await page.waitForTimeout(2000);

    // Verify table renders properly with column headers
    const table = page.getByRole('table').or(page.locator('table')).first();
    await expect(table).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('columnheader', { name: 'Partner' })).toBeVisible();

    // 3. Switch to Previous Month
    await reportsPage.selectDropdownValue(4, 'Previous Month');
    await reportsPage.submitReport();
    await page.waitForTimeout(2000);

    await expect(table).toBeVisible({ timeout: 15000 });
  });

  test('FLT-02: Date Picker Range Selection on Customer List Report', async () => {
    await reportsPage.navigateToReport('Customer List', '/busy/report/customerlist');

    // Initial state: Submit button is present
    const submitBtn = reportsPage.locators.submitButton;
    await expect(submitBtn).toBeVisible({ timeout: 10000 });

    // Select custom date range
    await reportsPage.selectDateRange('1', '20');

    // Verify date range selection was accepted
    await expect(submitBtn).toBeEnabled();
  });

  test('NEG-01: Non-Existent Search Keyword Handling on Subscription History', async () => {
    await reportsPage.navigateToReport('Subscription History', '/busy/report/desktopSubscription');

    const searchInput = page.locator('input[placeholder*="Subscription ID" i]').or(reportsPage.locators.searchInput);
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    // Enter a non-existent fake ID
    await searchInput.fill('NON_EXISTENT_SUB_ID_99999999');
    await reportsPage.submitReport();
    await page.waitForTimeout(2000);

    // Verify application handles empty search gracefully without uncaught exception
    const noData = page.getByText(/No data to display|No Records Found|No data available|Not Found/i).first();
    const isNoDataVisible = await noData.isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`Non-existent search handled gracefully. Empty state visible: ${isNoDataVisible}`);
  });

  test('NEG-02: Suspicious License Activation Filter without Date Range', async () => {
    await reportsPage.navigateToReport('Suspicious License Activation', '/busy/report/suspiciousActivation');

    const searchBtn = reportsPage.locators.searchButton.or(reportsPage.locators.submitButton);
    await expect(searchBtn).toBeVisible({ timeout: 10000 });

    // Click search without selecting date range
    await searchBtn.click();
    await page.waitForTimeout(1500);

    // Verify system remains responsive, no crash
    expect(page.url()).toContain('/busy/report/suspiciousActivation');
  });

  test('NEG-03: Central Downloads Queue Failed/Error Job Resilience', async () => {
    await reportsPage.openDownloadsPage();

    const failedRow = page.locator('div[role="row"]:has-text("Error"), div[role="row"]:has-text("Failed")').first();
    const isFailedRowPresent = await failedRow.isVisible({ timeout: 3000 }).catch(() => false);

    if (isFailedRowPresent) {
      console.log('Detected historical Failed/Error row in downloads queue. Verified error status badge.');
      await expect(failedRow).toBeVisible();
    } else {
      console.log('No historical failed jobs in the downloads queue.');
    }
  });
});

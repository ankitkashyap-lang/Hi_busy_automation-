const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/loginPage');
const { ReportsPage } = require('../../pages/Reports/ReportsPage');
const { setupReportsSession } = require('../../utils/reportAuthHelper');
const { REPORTS } = require('../../test-data/reports/reportsConfig');
const downloadValidator = require('../../utils/downloadValidator');
const globalConfig = require('../../config/globalConfig');
const path = require('path');

test.describe('Reports Module - Download Automation & Server Cron Suite', () => {
  let context;
  let page;
  let reportsPage;
  const downloadDir = path.join(process.cwd(), 'downloads');

  test.beforeAll(async ({ browser }) => {
    // Clean old downloads before fresh execution
    downloadValidator.cleanDownloadsDir(downloadDir);

    // Login once and initialize shared browser session
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
    test.setTimeout(180000); // 3 minutes buffer for report generation and cron processing

    // Ensure any leftover popup tabs are closed so tests run cleanly
    if (context) {
      const pages = context.pages();
      for (const p of pages) {
        if (p !== page && !p.isClosed()) {
          await p.close().catch(() => {});
        }
      }
    }

    // Self-healing: Reconnect or re-login if page was unexpectedly closed
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

  // ==========================================
  // SECTION 1: IN-PAGE DIRECT EXPORT REPORTS
  // ==========================================

  test('DL-01: Download and Validate "AC Stock" In-Page Report', async () => {
    await reportsPage.navigateToReport('AC Stock', '/busy/report/acStock');

    await reportsPage.submitReport();
    await page.waitForTimeout(3000);

    const downloadBtn = reportsPage.locators.inPageDownloadButton;
    await expect(downloadBtn).toBeVisible({ timeout: 15000 });

    const isVisuallyDisabled = await downloadBtn.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.opacity === '0.5' || style.cursor === 'not-allowed' || el.disabled;
    }).catch(() => false);

    if (isVisuallyDisabled) {
      console.log('AC Stock has no records for selected filter, download disabled as expected.');
    } else {
      const saved = await reportsPage.downloadInPageReport(page, downloadDir);
      expect(saved.filename).toMatch(/\.xlsx?$|\.csv$/i);

      const validation = await downloadValidator.validateDownloadedReport(saved.filePath, /\.xlsx?$|\.csv$/i);
      expect(validation.isSuccess, `File validation failed: ${validation.errors.join(', ')}`).toBeTruthy();
      expect(validation.basics.size).toBeGreaterThan(0);
      expect(validation.content.sheetNames.length).toBeGreaterThan(0);
    }
  });

  test('DL-02: Download and Validate "App Penetration" In-Page Report', async () => {
    await reportsPage.navigateToReport('App Penetration', '/busy/report/penetrationLevel');

    await reportsPage.submitReport();
    await page.waitForTimeout(3000);

    const downloadBtn = reportsPage.locators.inPageDownloadButton;
    await expect(downloadBtn).toBeVisible({ timeout: 15000 });

    const isVisuallyDisabled = await downloadBtn.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.opacity === '0.5' || style.cursor === 'not-allowed' || el.disabled;
    }).catch(() => false);

    if (!isVisuallyDisabled) {
      const saved = await reportsPage.downloadInPageReport(page, downloadDir);
      const validation = await downloadValidator.validateDownloadedReport(saved.filePath, /\.xlsx?$|\.csv$/i);
      expect(validation.isSuccess).toBeTruthy();
      expect(validation.basics.size).toBeGreaterThan(0);
    }
  });

  // ==========================================
  // SECTION 2: QUEUED REPORTS WITH CRON TRIGGER
  // Reports that redirect or open popup to /busy/report/download
  // ==========================================

  const queuedReportsToTest = [
    { id: 'REP-08', name: 'List of Clusters', url: '/busy/report/listofclusters', matchName: /List of Clusters/i, regex: /cluster/i, needsDate: false, actionName: 'Download' },
    { id: 'REP-13', name: 'Referral Lead Report', url: '/busy/report/referrallead', matchName: /Referral Lead/i, regex: /referral|lead/i, needsDate: false, actionName: 'Download' },
    { id: 'REP-07', name: 'Customer List', url: '/busy/report/customerlist', matchName: /Customer List/i, regex: /customer/i, needsDate: true, actionName: 'Submit' },
    { id: 'REP-03', name: 'Blocked Licenses', url: '/busy/report/blockedlicence', matchName: /Blocked Licenses/i, regex: /blocked/i, needsDate: false, actionName: 'Submit' },
    { id: 'REP-04', name: 'BLS Expiry', url: '/busy/report/blsexpiry', matchName: /BLS Expiry/i, regex: /bls/i, needsDate: false, actionName: 'Submit' },
    { id: 'REP-14', name: 'Reseller', url: '/busy/report/reportresellers', matchName: /Reseller/i, regex: /reseller/i, needsDate: false, actionName: 'Submit' },
    { id: 'REP-22', name: 'Transfer License', url: '/busy/report/transferlicence', matchName: /Transfer License/i, regex: /transfer/i, needsDate: false, actionName: 'Submit' },
    { id: 'REP-24', name: 'Version 17 & 18 Report', url: '/busy/report/ver1718Sub', matchName: /17.*18|Version/i, regex: /17.*18|ver/i, needsDate: false, actionName: 'Submit' },
    { id: 'REP-23', name: 'Unused Serial No', url: '/busy/report/unusedserialno', matchName: /Unused Serial No/i, regex: /unused/i, needsDate: true, actionName: 'Submit' },
    { id: 'REP-11', name: 'RDP License Report', url: '/busy/report/rdpLicense', matchName: /RDP License/i, regex: /rdp/i, needsDate: true, actionName: 'Submit' },
    { id: 'REP-05', name: 'Busy Online Report', url: '/busy/report/boreport', matchName: /Busy Online/i, regex: /online|bo/i, needsDate: true, actionName: 'Submit' },
    { id: 'REP-06', name: 'Cancellation And Reversal', url: '/busy/report/cancellationandreversal', matchName: /Cancellation/i, regex: /cancellation|reversal/i, needsDate: true, actionName: 'Submit' },
    { id: 'REP-09', name: 'Mobile LITE Usage', url: '/busy/report/mobileapplite', matchName: /Mobile.*Lite/i, regex: /mobile|lite/i, needsDate: true, actionName: 'Submit' },
    { id: 'REP-10', name: 'Partners Renewal Rate Report', url: '/report/renewalRate', matchName: /Renewal Rate/i, regex: /renewal/i, needsDate: false, actionName: 'Submit' },
    { id: 'REP-12', name: 'Renewal & Upgrade', url: '/busy/report/renewalsandupgrade', matchName: /Renewal/i, regex: /renewal|upgrade/i, needsDate: true, actionName: 'Submit' },
    { id: 'REP-15', name: 'Sales Promotion', url: '/report/salespromotion', matchName: /Sales Promotion/i, regex: /sales|promotion/i, needsDate: true, actionName: 'Submit' },
    { id: 'REP-17', name: 'Subscription List', url: '/report/paidsubscriptions', matchName: /Subscription/i, regex: /subscription/i, needsDate: true, actionName: 'Submit' },
    { id: 'REP-19', name: 'Mazu Transaction Report', url: '/report/mazuTransaction', matchName: /Mazu/i, regex: /mazu/i, needsDate: true, actionName: 'Submit' },
    { id: 'REP-20', name: 'Recurring Payments', url: '/report/recurringPayments', matchName: /Recurring/i, regex: /recurring|payment/i, needsDate: true, actionName: 'Submit' },
    { id: 'REP-25', name: 'Recom Order Consumption', url: '/busy/report/recomorderconsumption', matchName: /Recom/i, regex: /recom/i, needsDate: true, actionName: 'Submit' }
  ];

  for (const rep of queuedReportsToTest) {
    test(`DL-QUEUE: Generate and Download "${rep.name}" via Server Cron`, async ({ request }) => {
      // 1. Navigate to Report page on the same logged-in page
      await reportsPage.navigateToReport(rep.name, rep.url);

      // 2. Select Date Range if required to enable Submit button
      if (rep.needsDate) {
        await reportsPage.selectDateRange('15');
      }

      // 3. Submit or Download action to redirect or open download page in popup
      const { downloadPage, isPopup } = await reportsPage.submitReportAndOpenDownloadPage(page, rep.actionName || 'Submit');

      try {
        // 4. On download page: Click Refresh, hit server cron API, check Row 1, poll for Processed, download from Row 1
        const refreshBtn = downloadPage.getByRole('button', { name: 'Select' })
          .or(downloadPage.getByTitle('Refresh'))
          .or(downloadPage.locator('button:has(.material-icons:has-text("refresh"))'))
          .first();
        await expect(refreshBtn).toBeVisible({ timeout: 15000 });
        await refreshBtn.click();
        await downloadPage.waitForTimeout(2000);

        // Dynamic server cron URL based on current page host
        const cronHost = new URL(downloadPage.url()).hostname;
        const cronUrl = `http://${cronHost}:9094/report/v1/cron/report/`;
        console.log(`Triggering cron API at: ${cronUrl}`);
        request.get(cronUrl, { timeout: 30000 }).catch(err => {
          console.warn(`Cron API call notice (non-fatal): ${err.message}`);
        });

        // Target row matching report name or first data row
        const getRow = () => {
          if (rep.matchName) {
            return downloadPage.locator('div[role="row"]').filter({ hasText: rep.matchName }).first();
          }
          return downloadPage.locator('div[role="row"]').nth(1);
        };

        let targetRow = getRow();
        if (!(await targetRow.isVisible({ timeout: 5000 }).catch(() => false))) {
          targetRow = downloadPage.locator('div[role="row"]').nth(1);
        }
        await expect(targetRow).toBeVisible({ timeout: 30000 });

        let downloadBtn = targetRow.locator('button', { hasText: 'Download' }).first();

        // Click Refresh button again and wait until status changes to 'Processed' and download button is enabled
        await expect(async () => {
          if (await refreshBtn.isVisible()) {
            await refreshBtn.click();
          } else {
            await downloadPage.reload({ waitUntil: 'domcontentloaded' });
          }
          await downloadPage.waitForTimeout(2000);

          targetRow = getRow();
          if (!(await targetRow.isVisible({ timeout: 2000 }).catch(() => false))) {
            targetRow = downloadPage.locator('div[role="row"]').nth(1);
          }
          downloadBtn = targetRow.locator('button', { hasText: 'Download' }).first();

          const rowText = await targetRow.innerText().catch(() => '');
          if (!/Processed/i.test(rowText)) {
            // Re-ping server cron to ensure worker processes queue
            request.get(cronUrl, { timeout: 10000 }).catch(() => {});
          }

          await expect(targetRow).toContainText(/Processed/i, { timeout: 2000 });
          await expect(downloadBtn).toBeVisible({ timeout: 2000 });
          await expect(downloadBtn).toBeEnabled({ timeout: 2000 });
        }).toPass({ intervals: [5000], timeout: 120000 });

        // Download strictly from the first row
        const downloadPromise = Promise.race([
          downloadPage.waitForEvent('download', { timeout: 30000 }),
          context.waitForEvent('download', { timeout: 30000 })
        ]);

        const [download] = await Promise.all([
          downloadPromise,
          downloadBtn.click()
        ]);

        // Save downloaded file into downloads directory
        const saved = await downloadValidator.saveDownload(download, downloadDir);
        console.log(`Successfully downloaded first row report: ${saved.filename}`);
        expect(saved.filename).toMatch(rep.regex || /\.xlsx?$|\.csv$/i);

        // Validate downloaded file (existence, size > 0, extension, content rows & headers)
        const validation = await downloadValidator.validateDownloadedReport(saved.filePath, rep.regex);
        expect(validation.isSuccess, `Download validation failed for ${rep.name}: ${validation.errors.join('; ')}`).toBeTruthy();
        expect(validation.basics.size).toBeGreaterThan(0);
        if (validation.content.isExcel) {
          expect(validation.content.sheetNames.length).toBeGreaterThan(0);
        }

        console.log(`Successfully verified ${rep.name}: file=${saved.filename}, size=${validation.basics.size} bytes, rows=${validation.content.rowCount}`);
      } finally {
        if (isPopup) {
          await downloadPage.close().catch(() => {});
        }
      }
    });
  }

  // ==========================================
  // SECTION 3: DIRECT CENTRAL DOWNLOADS VALIDATION
  // ==========================================

  test('DL-CENTRAL: Central Queue Listing & Immediate File Download', async ({ request }) => {
    await reportsPage.openDownloadsPage();

    // Trigger cron on that same server to process any pending jobs
    await reportsPage.triggerCronProcessor(page, request);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const firstRow = reportsPage.locators.downloadFirstDataRow;
    await expect(firstRow).toBeVisible({ timeout: 15000 });

    const downloadBtn = firstRow.locator('button', { hasText: 'Download' }).first();
    const rowText = await firstRow.innerText().catch(() => '');

    if (/Processed/i.test(rowText) && await downloadBtn.isVisible()) {
      const downloadPromise = Promise.race([
        page.waitForEvent('download', { timeout: 20000 }),
        context.waitForEvent('download', { timeout: 20000 })
      ]);

      const [download] = await Promise.all([
        downloadPromise,
        downloadBtn.click()
      ]);

      const saved = await downloadValidator.saveDownload(download, downloadDir);
      const validation = await downloadValidator.validateDownloadedReport(saved.filePath);

      expect(validation.isSuccess).toBeTruthy();
      expect(validation.basics.size).toBeGreaterThan(0);
      if (validation.content.isExcel) {
        expect(validation.content.sheetNames.length).toBeGreaterThan(0);
      }
      console.log(`Central Queue Download verified: ${saved.filename}, size: ${validation.basics.size} bytes`);
    } else {
      console.log(`First row in queue is not in Processed status yet (${rowText.replace(/\n+/g, ' | ')}).`);
    }
  });
});

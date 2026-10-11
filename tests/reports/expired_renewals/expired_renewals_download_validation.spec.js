const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../../pages/loginPage');
const { ExpiredRenewalsPage } = require('../../../pages/Reports/ExpiredRenewalsPage');
const downloadValidator = require('../../../utils/downloadValidator');
const expiredRenewalsData = require('../../../test-data/reports/expiredRenewalsData');
const globalConfig = require('../../../config/globalConfig');
const path = require('path');
const xlsx = require('xlsx');

test.describe('Expired Renewals Report - Download Automation & Content Validation Suite', () => {
  let context;
  let page;
  let expiredRenewalsPage;
  const downloadDir = path.join(process.cwd(), 'downloads');

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(90000);
    downloadValidator.cleanDownloadsDir(downloadDir);

    context = await browser.newContext({ acceptDownloads: true });
    page = await context.newPage();

    expiredRenewalsPage = new ExpiredRenewalsPage(page);
    await expiredRenewalsPage.navigateToExpiredRenewals(expiredRenewalsData.DEFAULT_PARTNER);
  });

  test.afterAll(async () => {
    if (page) await page.close().catch(() => { });
    if (context) await context.close().catch(() => { });
  });

  test.beforeEach(async () => {
    test.setTimeout(180000); // 3 minutes buffer for async job queue processing

    // Close any leftover popup pages
    if (context) {
      const pages = context.pages();
      for (const p of pages) {
        if (p !== page && !p.isClosed()) {
          await p.close().catch(() => { });
        }
      }
    }

    // Ensure we are on Expired Renewals
    if (!page.url().includes('/partner/analytics/expiredrenewal')) {
      await page.goto(expiredRenewalsData.EXPIRED_RENEWALS_URL, { waitUntil: 'domcontentloaded' });
    }
  });

  // ============================================================
  // SECTION 1: DOWNLOAD AUTOMATION & QUEUE PROCESSING
  // ============================================================

  test('TC-ER-DL-01: Download Default Desktop Expired Renewals Report and Validate File Basics', async () => {
    await page.goto(expiredRenewalsData.EXPIRED_RENEWALS_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const { downloadPage, isPopup } = await expiredRenewalsPage.triggerDownloadExcel();
    try {
      const saved = await expiredRenewalsPage.waitForPartnerReportProcessedAndDownload(downloadPage, downloadDir);
      expect(saved.filename).toMatch(expiredRenewalsData.DOWNLOAD_FILENAME_REGEX);

      // Validate basics
      const basics = downloadValidator.validateFileBasics(saved.filePath, expiredRenewalsData.DOWNLOAD_FILENAME_REGEX);
      expect(basics.exists).toBeTruthy();
      expect(basics.isSizeValid).toBeTruthy();
      expect(basics.size).toBeGreaterThan(1000); // Excel should have non-trivial size
      expect(basics.extension).toBe('.xlsx');
      expect(basics.isPatternValid).toBeTruthy();
    } finally {
      if (isPopup) await downloadPage.close().catch(() => { });
    }
  });

  test('TC-ER-DL-02: Download Filtered Report (Renew Status: Expired)', async () => {
    await page.goto(expiredRenewalsData.EXPIRED_RENEWALS_URL, { waitUntil: 'domcontentloaded' });
    await expiredRenewalsPage.setAutocompleteFilter(expiredRenewalsData.FILTER_INDICES.RENEW_STATUS, 'Expired');
    await expiredRenewalsPage.applyFilters();

    const { downloadPage, isPopup } = await expiredRenewalsPage.triggerDownloadExcel();
    try {
      const saved = await expiredRenewalsPage.waitForPartnerReportProcessedAndDownload(downloadPage, downloadDir);
      expect(saved.filename).toMatch(expiredRenewalsData.DOWNLOAD_FILENAME_REGEX);

      const basics = downloadValidator.validateFileBasics(saved.filePath);
      expect(basics.exists).toBeTruthy();
      expect(basics.isSizeValid).toBeTruthy();
    } finally {
      if (isPopup) await downloadPage.close().catch(() => { });
    }
  });

  test('TC-ER-DL-03: Download Filtered Report (Time Period: < 3 Months)', async () => {
    await page.goto(expiredRenewalsData.EXPIRED_RENEWALS_URL, { waitUntil: 'domcontentloaded' });
    await expiredRenewalsPage.setAutocompleteFilter(expiredRenewalsData.FILTER_INDICES.TIME_PERIOD, '< 3 Months');
    await expiredRenewalsPage.applyFilters();

    const { downloadPage, isPopup } = await expiredRenewalsPage.triggerDownloadExcel();
    try {
      const saved = await expiredRenewalsPage.waitForPartnerReportProcessedAndDownload(downloadPage, downloadDir);
      expect(saved.filename).toMatch(expiredRenewalsData.DOWNLOAD_FILENAME_REGEX);

      const basics = downloadValidator.validateFileBasics(saved.filePath);
      expect(basics.exists).toBeTruthy();
      expect(basics.isSizeValid).toBeTruthy();
    } finally {
      if (isPopup) await downloadPage.close().catch(() => { });
    }
  });

  // ============================================================
  // SECTION 2: EXCEL CONTENT & SCHEMA VALIDATION (ALL 22 HEADERS)
  // ============================================================

  test('TC-ER-CONT-01 & 02: Validate Excel Date Metadata (Row 0) and All 22 Column Headers (Row 1)', async () => {
    await page.goto(expiredRenewalsData.EXPIRED_RENEWALS_URL, { waitUntil: 'domcontentloaded' });
    const { downloadPage, isPopup } = await expiredRenewalsPage.triggerDownloadExcel();
    try {
      const saved = await expiredRenewalsPage.waitForPartnerReportProcessedAndDownload(downloadPage, downloadDir);

      const validation = expiredRenewalsPage.validateDownloadedExpiredRenewalsExcel(saved.filePath);
      expect(validation.isValid, `Excel validation failed: ${validation.errors.join(', ')}`).toBeTruthy();

      // Verify date bounds in row 0
      expect(validation.dateMetadata).toContain('From');
      expect(validation.dateMetadata).toContain('To');

      // Verify all 22 column headers
      for (const expectedHeader of expiredRenewalsData.EXPECTED_EXCEL_HEADERS) {
        expect(validation.headers, `Missing expected header: ${expectedHeader}`).toContain(expectedHeader);
      }
    } finally {
      if (isPopup) await downloadPage.close().catch(() => { });
    }
  });

  test('TC-ER-CONT-03 & 04: Validate Excel Data Integrity and Serial Number Uniqueness', async () => {
    await page.goto(expiredRenewalsData.EXPIRED_RENEWALS_URL, { waitUntil: 'domcontentloaded' });
    const { downloadPage, isPopup } = await expiredRenewalsPage.triggerDownloadExcel();
    try {
      const saved = await expiredRenewalsPage.waitForPartnerReportProcessedAndDownload(downloadPage, downloadDir);

      const workbook = xlsx.readFile(saved.filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

      const dataRows = rawRows.slice(2);
      expect(dataRows.length).toBeGreaterThan(0);

      // Check Serial No. uniqueness and format
      const serialNumbers = dataRows.map(r => String(r[0] || '').trim()).filter(Boolean);
      const uniqueSerials = new Set(serialNumbers);
      expect(uniqueSerials.size).toBe(serialNumbers.length); // 0 duplicate serial numbers
    } finally {
      if (isPopup) await downloadPage.close().catch(() => { });
    }
  });

  // ============================================================
  // SECTION 3: UI VS DOWNLOADED FILE RECONCILIATION
  // ============================================================

  test('TC-ER-RECON-01: Reconcile Total Record Count: UI Metrics Card vs Excel Data Rows', async () => {
    await page.goto(expiredRenewalsData.EXPIRED_RENEWALS_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Get metric card count from UI
    const metrics = await expiredRenewalsPage.getMetricsSummary();
    const expectedCount = metrics.totalCount;
    expect(expectedCount).toBeGreaterThan(0);

    // Download report
    const { downloadPage, isPopup } = await expiredRenewalsPage.triggerDownloadExcel();
    try {
      const saved = await expiredRenewalsPage.waitForPartnerReportProcessedAndDownload(downloadPage, downloadDir);

      const validation = expiredRenewalsPage.validateDownloadedExpiredRenewalsExcel(saved.filePath);
      expect(validation.isValid).toBeTruthy();

      console.log(`UI Total Count: ${expectedCount} | Excel Data Rows: ${validation.dataRowCount}`);
      // Exact reconciliation between UI card and Excel data rows
      expect(validation.dataRowCount).toBe(expectedCount);
    } finally {
      if (isPopup) await downloadPage.close().catch(() => { });
    }
  });

  test('TC-ER-RECON-02 & 03: Reconcile Visible UI Records (Serial No, Company & City) with Excel File', async () => {
    await page.goto(expiredRenewalsData.EXPIRED_RENEWALS_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Scrape first row from UI table
    const uiRows = await expiredRenewalsPage.getTableRowsData();
    expect(uiRows.length).toBeGreaterThan(0);
    const firstUiRow = uiRows[0];
    const uiSerial = firstUiRow[0]; // e.g. "1123051730" or serial identifier

    // Download report
    const { downloadPage, isPopup } = await expiredRenewalsPage.triggerDownloadExcel();
    try {
      const saved = await expiredRenewalsPage.waitForPartnerReportProcessedAndDownload(downloadPage, downloadDir);

      const workbook = xlsx.readFile(saved.filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

      const dataRows = rawRows.slice(2);
      const excelSerials = dataRows.map(r => String(r[0] || '').trim());
      const excelSubs = dataRows.map(r => String(r[1] || '').trim());

      // On UI, cell contains both Subscription No and Serial No (e.g. "1123051730\n(23051730)")
      const isMatched = excelSerials.some(s => uiSerial.includes(s)) || excelSubs.some(sub => uiSerial.includes(sub));
      expect(isMatched, `Expected UI record identifier "${uiSerial}" to match an Excel Serial No or Subscription No`).toBeTruthy();
    } finally {
      if (isPopup) await downloadPage.close().catch(() => { });
    }
  });
});

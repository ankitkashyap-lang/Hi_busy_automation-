const { test, expect } = require('@playwright/test');
const { NewActivationsPage } = require('../../../pages/Reports/NewActivationsPage');
const downloadValidator = require('../../../utils/downloadValidator');
const newActivationsData = require('../../../test-data/reports/newActivationsData');
const path = require('path');
const fs = require('fs');

test.describe('New Activations Report - Download Automation & Content Validation Suite', () => {
  let context;
  let page;
  let newActivationsPage;
  const downloadDir = path.join(process.cwd(), 'downloads');
  const storageStatePath = path.join(__dirname, '../../../storageState/adminAuth.json');

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(90000);
    downloadValidator.cleanDownloadsDir(downloadDir);

    const hasStorage = fs.existsSync(storageStatePath);
    context = await browser.newContext({
      storageState: hasStorage ? storageStatePath : undefined,
      acceptDownloads: true
    });
    page = await context.newPage();

    newActivationsPage = new NewActivationsPage(page);
    await newActivationsPage.navigateToNewActivations(newActivationsData.DEFAULT_PARTNER);
  });

  test.afterAll(async () => {
    if (page) await page.close().catch(() => {});
    if (context) await context.close().catch(() => {});
  });

  test.beforeEach(async () => {
    test.setTimeout(180000); // 3 minutes buffer for async job queue processing

    // Close any leftover popup pages
    if (context) {
      const pages = context.pages();
      for (const p of pages) {
        if (p !== page && !p.isClosed()) {
          await p.close().catch(() => {});
        }
      }
    }

    // Ensure we are on New Activations
    if (!page.url().includes('/partner/analytics/newactivations')) {
      await page.goto(newActivationsData.NEW_ACTIVATIONS_URL, { waitUntil: 'domcontentloaded' });
    }
  });

  // ============================================================
  // SECTION 1: DOWNLOAD AUTOMATION & QUEUE PROCESSING
  // ============================================================

  test('TC-NA-DL-01: Download Busy 21 New Activations Report and Validate File Basics', async () => {
    await page.goto(newActivationsData.NEW_ACTIVATIONS_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Select Busy 21 to trigger successfully
    await newActivationsPage.selectDesktopVariation('Busy 21');
    await newActivationsPage.applyFilters();

    const { downloadPage, isPopup } = await newActivationsPage.triggerDownloadExcel();
    try {
      const saved = await newActivationsPage.waitForPartnerReportProcessedAndDownload(downloadPage, downloadDir);
      expect(saved.filename).toMatch(newActivationsData.DOWNLOAD_FILENAME_REGEX);

      // Validate basics
      const basics = downloadValidator.validateFileBasics(saved.filePath, newActivationsData.DOWNLOAD_FILENAME_REGEX);
      expect(basics.exists).toBeTruthy();
      expect(basics.isSizeValid).toBeTruthy();
      expect(basics.size).toBeGreaterThan(1000);
      expect(basics.extension).toBe('.xlsx');
      expect(basics.isPatternValid).toBeTruthy();
    } finally {
      if (isPopup) await downloadPage.close().catch(() => {});
    }
  });

  test('TC-NA-DL-02: Download Filtered Report (Subs Status: Cancelled)', async () => {
    await page.goto(newActivationsData.NEW_ACTIVATIONS_URL, { waitUntil: 'domcontentloaded' });
    await newActivationsPage.selectDesktopVariation('Busy 21');
    await newActivationsPage.setFilterById('status', 'Cancelled');
    await newActivationsPage.applyFilters();

    const { downloadPage, isPopup } = await newActivationsPage.triggerDownloadExcel();
    try {
      const saved = await newActivationsPage.waitForPartnerReportProcessedAndDownload(downloadPage, downloadDir);
      expect(saved.filename).toMatch(newActivationsData.DOWNLOAD_FILENAME_REGEX);

      const basics = downloadValidator.validateFileBasics(saved.filePath);
      expect(basics.exists).toBeTruthy();
      expect(basics.isSizeValid).toBeTruthy();
    } finally {
      if (isPopup) await downloadPage.close().catch(() => {});
    }
  });

  test('TC-NA-DL-03: Download Filtered Report (Installed By: EWAY HM)', async () => {
    await page.goto(newActivationsData.NEW_ACTIVATIONS_URL, { waitUntil: 'domcontentloaded' });
    await newActivationsPage.selectDesktopVariation('Busy 21');
    await newActivationsPage.setFilterById('installedBy', 'EWAY HM');
    await newActivationsPage.applyFilters();

    const { downloadPage, isPopup } = await newActivationsPage.triggerDownloadExcel();
    try {
      const saved = await newActivationsPage.waitForPartnerReportProcessedAndDownload(downloadPage, downloadDir);
      expect(saved.filename).toMatch(newActivationsData.DOWNLOAD_FILENAME_REGEX);

      const basics = downloadValidator.validateFileBasics(saved.filePath);
      expect(basics.exists).toBeTruthy();
      expect(basics.isSizeValid).toBeTruthy();
    } finally {
      if (isPopup) await downloadPage.close().catch(() => {});
    }
  });

  // ============================================================
  // SECTION 2: EXCEL CONTENT & SCHEMA VALIDATION (ALL 22 HEADERS)
  // ============================================================

  test('TC-NA-CONT-01 & 02: Validate Excel Date Metadata (Row 0) and All 22 Column Headers (Row 1)', async () => {
    await page.goto(newActivationsData.NEW_ACTIVATIONS_URL, { waitUntil: 'domcontentloaded' });
    await newActivationsPage.selectDesktopVariation('Busy 21');
    await newActivationsPage.applyFilters();

    const { downloadPage, isPopup } = await newActivationsPage.triggerDownloadExcel();
    try {
      const saved = await newActivationsPage.waitForPartnerReportProcessedAndDownload(downloadPage, downloadDir);
      const validation = newActivationsPage.validateDownloadedNewActivationsExcel(saved.filePath);

      expect(validation.errors).toEqual([]);
      expect(validation.isValid).toBeTruthy();
      expect(validation.dateMetadata).toContain('From');
      expect(validation.dateMetadata).toContain('To');

      // Verify each of the 22 headers is present
      for (const h of newActivationsData.EXPECTED_EXCEL_HEADERS) {
        expect(validation.headers).toContain(h);
      }
    } finally {
      if (isPopup) await downloadPage.close().catch(() => {});
    }
  });

  test('TC-NA-CONT-03: Validate Excel Data Integrity and Serial Numbers', async () => {
    await page.goto(newActivationsData.NEW_ACTIVATIONS_URL, { waitUntil: 'domcontentloaded' });
    await newActivationsPage.selectDesktopVariation('Busy 21');
    await newActivationsPage.applyFilters();

    const { downloadPage, isPopup } = await newActivationsPage.triggerDownloadExcel();
    try {
      const saved = await newActivationsPage.waitForPartnerReportProcessedAndDownload(downloadPage, downloadDir);
      const validation = newActivationsPage.validateDownloadedNewActivationsExcel(saved.filePath);

      expect(validation.isValid).toBeTruthy();
      expect(validation.dataRowCount).toBeGreaterThan(0);
    } finally {
      if (isPopup) await downloadPage.close().catch(() => {});
    }
  });

  test('TC-NA-CONT-04: UI vs Download Data Consistency Comparison', async () => {
    await page.goto(newActivationsData.NEW_ACTIVATIONS_URL, { waitUntil: 'domcontentloaded' });
    await newActivationsPage.selectDesktopVariation('Busy 21');
    await newActivationsPage.applyFilters();

    // Scrape sample serial numbers from UI table
    const uiRows = await newActivationsPage.getTableRowsData();
    expect(uiRows.length).toBeGreaterThan(0);

    const { downloadPage, isPopup } = await newActivationsPage.triggerDownloadExcel();
    try {
      const saved = await newActivationsPage.waitForPartnerReportProcessedAndDownload(downloadPage, downloadDir);
      const xlsx = require('xlsx');
      const wb = xlsx.readFile(saved.filePath);
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const excelRows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

      // Column index for Serial No in Excel is 0
      const excelSerials = excelRows.slice(2).map(r => String(r[0] || '').trim()).filter(Boolean);

      // Verify that at least one UI serial number exists in the downloaded Excel serials
      const uiFirstSerial = uiRows[0][0]; // Serial number text from UI
      const matching = excelSerials.some(s => uiFirstSerial.includes(s) || s.includes(uiFirstSerial));
      expect(matching).toBeTruthy();
    } finally {
      if (isPopup) await downloadPage.close().catch(() => {});
    }
  });
});

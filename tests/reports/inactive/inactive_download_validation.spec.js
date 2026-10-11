const { test, expect } = require('@playwright/test');
const { InactivePage } = require('../../../pages/Reports/InactivePage');
const inactiveData = require('../../../test-data/reports/inactiveData');
const path = require('path');
const fs = require('fs');

test.describe.configure({ mode: 'serial' });

test.describe('Inactive Report - Download Automation & Content Validation Suite', () => {
  let context;
  let page;
  let inactivePage;
  let downloadedFilePath;
  const storageStatePath = path.join(__dirname, '../../../storageState/adminAuth.json');

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(120000);
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

  test('TC-INACT-DL-01: Trigger Download Excel and Intercept addJob API Request', async () => {
    let capturedJobPayload = null;

    const requestListener = (req) => {
      if (req.url().includes('/account/report/addJob') && req.method() === 'POST') {
        try {
          capturedJobPayload = JSON.parse(req.postData() || '{}');
        } catch (e) {
          capturedJobPayload = req.postData();
        }
      }
    };

    page.on('request', requestListener);

    const { downloadPage, isPopup } = await inactivePage.triggerDownloadExcel();

    try {
      expect(downloadPage.url()).toContain('/partner/report/download');
      if (capturedJobPayload) {
        expect(capturedJobPayload.report_type_key).toBe(inactiveData.PRODUCT.reportTypeKey);
        expect(capturedJobPayload.product_name).toBe(inactiveData.PRODUCT.productId);
      }
    } finally {
      page.off('request', requestListener);
      if (isPopup) await downloadPage.close().catch(() => {});
    }
  });

  test('TC-INACT-DL-02 & 03: Queue Redirection and Cron Job Status Transition to Processed', async () => {
    await page.goto(inactiveData.INACTIVE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const { downloadPage, isPopup } = await inactivePage.triggerDownloadExcel();

    try {
      const saved = await inactivePage.waitForPartnerReportProcessedAndDownload(
        downloadPage,
        path.join(process.cwd(), 'downloads'),
        90000
      );

      expect(saved).toBeDefined();
      expect(saved.filename).toMatch(inactiveData.DOWNLOAD_FILENAME_REGEX);
      expect(fs.existsSync(saved.filePath)).toBeTruthy();

      downloadedFilePath = saved.filePath;
    } finally {
      if (isPopup) await downloadPage.close().catch(() => {});
    }
  });

  test('TC-INACT-DL-04: Complete Excel Download File Validation Basics', async () => {
    expect(downloadedFilePath).toBeDefined();
    expect(fs.existsSync(downloadedFilePath)).toBeTruthy();

    const stats = fs.statSync(downloadedFilePath);
    expect(stats.size).toBeGreaterThan(0);
    expect(path.extname(downloadedFilePath)).toBe('.xlsx');
  });

  test('TC-INACT-CONT-01 & 02: Validate Excel Metadata (Row 0) and All 20 Column Headers (Row 1)', async () => {
    expect(downloadedFilePath).toBeDefined();

    const validation = inactivePage.validateDownloadedInactiveExcel(downloadedFilePath);

    if (!validation.isValid) {
      console.error('Validation errors found:', validation.errors);
    }

    expect(validation.errors).toEqual([]);
    expect(validation.isValid).toBeTruthy();
    expect(validation.rowCount).toBeGreaterThanOrEqual(2);
    expect(validation.headers.length).toBeGreaterThanOrEqual(20);

    // Verify all 20 exact headers
    for (const expectedHeader of inactiveData.EXPECTED_EXCEL_HEADERS) {
      expect(validation.headers).toContain(expectedHeader);
    }
  });

  test('TC-INACT-CONT-05: UI KPI Count vs Excel Row Count Data Consistency', async () => {
    await page.goto(inactiveData.INACTIVE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Ensure default 30 Days filter is set
    await inactivePage.setFilter('days', '30 Days');
    await inactivePage.applyFilters();

    const metrics = await inactivePage.getMetricsSummary();
    expect(metrics.inactiveCount).toBeGreaterThan(0);

    const validation = inactivePage.validateDownloadedInactiveExcel(downloadedFilePath);
    expect(validation.isValid).toBeTruthy();

    // Data rows in Excel should match UI Inactive metric count
    expect(validation.dataRowCount).toBe(metrics.inactiveCount);
  });

  test('TC-INACT-CONT-06: UI Scraped Serial Numbers vs Downloaded Excel Records Comparison', async () => {
    await page.goto(inactiveData.INACTIVE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const uiRows = await inactivePage.getTableRowsData();
    expect(uiRows.length).toBeGreaterThan(0);

    // Read Excel data rows using xlsx
    const xlsx = require('xlsx');
    const wb = xlsx.readFile(downloadedFilePath);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    const excelDataRows = rawData.slice(2);

    // Extract sample serial number from UI row
    const firstUiRow = uiRows[0];
    const sampleSerialFromUi = firstUiRow[0];
    const cleanSerial = sampleSerialFromUi.replace(/[()]/g, '').trim().split(/\s+/)[0];

    const matchFound = excelDataRows.some((row) => {
      const serialInExcel = String(row[0] || '').trim();
      const subNoInExcel = String(row[1] || '').trim();
      return cleanSerial.includes(serialInExcel) || subNoInExcel.includes(cleanSerial);
    });

    expect(matchFound).toBeTruthy();
  });
});

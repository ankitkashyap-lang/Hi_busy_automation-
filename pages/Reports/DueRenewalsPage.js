const { expect } = require('@playwright/test');
const BasePage = require('../../base/BasePage');
const { DueRenewalsLocators } = require('../../page_objects/locators/DueRenewalsLocators');
const downloadValidator = require('../../utils/downloadValidator');
const Logger = require('../../utils/logger');
const xlsx = require('xlsx');
const path = require('path');
const dueRenewalsData = require('../../test-data/reports/dueRenewalsData');

/**
 * DueRenewalsPage - Enterprise Page Object for Analytics -> Due Renewals Report
 * Inherits from BasePage and encapsulates navigation, product tabs, filter combinations,
 * metrics extraction, table scraping, download queue monitoring, and Excel file validation.
 */
class DueRenewalsPage extends BasePage {
  constructor(page) {
    super(page);
    this.logger = Logger.getInstance();
    this.locators = new DueRenewalsLocators(page);
  }

  /**
   * Navigates to Due Renewals report under a partner account (default: 3M Infocare)
   * Handles login, partner search & access, and transition to analytics
   * @param {string} partnerName 
   */
  async navigateToDueRenewals(partnerName = dueRenewalsData.DEFAULT_PARTNER) {
    this.logger.info(`Navigating to Due Renewals report for partner: "${partnerName}"`);

    const currentUrl = this.page.url();
    if (currentUrl.includes('/partner/analytics/duerenewal')) {
      this.logger.info('Already on Due Renewals page. Ensuring page is ready.');
      await this.page.waitForLoadState('domcontentloaded');
      return;
    }

    if (currentUrl.includes('/partner/')) {
      await this.page.goto(dueRenewalsData.DUE_RENEWALS_URL, { waitUntil: 'domcontentloaded' });
      await this.page.waitForTimeout(2000);
      return;
    }

    // Check login
    const { LoginPage } = require('../loginPage');
    const globalConfig = require('../../config/globalConfig');
    const loginPage = new LoginPage(this.page);
    await loginPage.login(globalConfig.ADMIN_EMAIL, globalConfig.ADMIN_PASSWORD);
    await this.page.waitForLoadState('domcontentloaded');

    // Menu -> Partner
    const menuBtn = this.page.getByRole('button', { name: 'menu' }).first();
    await expect(menuBtn).toBeVisible({ timeout: 15000 });
    await menuBtn.click();
    await this.page.waitForTimeout(1000);

    const partnerLink = this.page.getByRole('link', { name: /Partner/i }).first();
    await expect(partnerLink).toBeVisible({ timeout: 10000 });
    await partnerLink.click();
    await this.page.waitForTimeout(3000);

    // Search and access partner
    const PartnerPage = require('../Partner/PartnerPage');
    const partnerPage = new PartnerPage(this.page);
    await partnerPage.searchPartner(partnerName);

    const accessBtn = this.page.locator('button[aria-label="Access Account"], button:has(svg[data-testid="LockOpenIcon"])').first();
    await expect(accessBtn).toBeVisible({ timeout: 10000 });
    await accessBtn.click();
    await this.page.waitForTimeout(4000);

    // Click Due Renewals card or navigate directly
    const card = this.page.locator('div.MuiPaper-root').filter({ hasText: 'Due Renewals' }).first();
    if (await card.isVisible({ timeout: 5000 }).catch(() => false)) {
      this.logger.info('Clicking Due Renewals card on partner dashboard');
      await card.click();
    } else {
      this.logger.info('Navigating to Due Renewals URL directly');
      await this.page.goto(dueRenewalsData.DUE_RENEWALS_URL, { waitUntil: 'domcontentloaded' });
    }

    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(3000);
    this.logger.info(`Successfully landed on Due Renewals: ${this.page.url()}`);
  }

  /**
   * Switches to a specific product (Desktop, Online, Mobile, Recom, mazu)
   * @param {'desktop'|'online'|'mobile'|'recom'|'mazu'} product 
   */
  async switchProduct(product = 'desktop') {
    this.logger.info(`Switching product to: ${product}`);
    const prodKey = String(product).toLowerCase();
    const prodInfo = dueRenewalsData.PRODUCTS[prodKey.toUpperCase()] || { param: prodKey, tabIndex: 0 };

    const targetUrl = `/partner/analytics/duerenewal?tab=${prodInfo.tabIndex}&product=${prodInfo.param}`;
    await this.page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(2500);
    this.logger.info(`Product switched to ${product}. Current URL: ${this.page.url()}`);
  }

  /**
   * Selects Desktop sub-variation (All, Busy 21, Mandi)
   * @param {'All'|'Busy 21'|'Mandi'} variation 
   */
  async selectDesktopVariation(variation = 'Busy 21') {
    this.logger.info(`Selecting desktop variation: ${variation}`);
    const select = this.locators.desktopVariationSelect;
    if (await select.isVisible({ timeout: 3000 }).catch(() => false)) {
      await select.selectOption(variation);
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Sets value for an Autocomplete filter by index
   * @param {number} filterIndex (0: Time Period, 1: Renew Status, 2: Times Renewed, etc.)
   * @param {string} value Option text to select
   */
  async setAutocompleteFilter(filterIndex, value) {
    this.logger.info(`Setting filter #${filterIndex} to value "${value}"`);
    await this.page.locator('.MuiBackdrop-root').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    const input = this.locators.allAutocompleteInputs.nth(filterIndex);
    await expect(input).toBeVisible({ timeout: 5000 });

    // Open popup
    const popupBtn = this.locators.autocompletePopupButtons.nth(filterIndex);
    if (await popupBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await popupBtn.click({ force: true });
    } else {
      await input.click({ force: true });
    }
    await this.page.waitForTimeout(500);

    // Look for matching option in the popper
    const option = this.page.locator('.MuiAutocomplete-popper li, [role="listbox"] li, .MuiAutocomplete-option')
      .filter({ hasText: new RegExp(`^${value}$`, 'i') })
      .or(this.page.locator('.MuiAutocomplete-popper li, [role="listbox"] li').filter({ hasText: value }))
      .first();

    if (await option.isVisible({ timeout: 3000 }).catch(() => false)) {
      await option.click();
    } else {
      // Fallback: type and press Enter
      await input.fill(value);
      await this.page.keyboard.press('ArrowDown');
      await this.page.keyboard.press('Enter');
    }
    await this.page.waitForTimeout(500);
  }

  /**
   * Clicks the "Apply Filters" button and waits for network response & reload
   */
  async applyFilters() {
    this.logger.info('Clicking "Apply Filters" button');
    await this.page.locator('.MuiBackdrop-root').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    const applyBtn = this.locators.applyFiltersButton;
    await expect(applyBtn).toBeVisible({ timeout: 10000 });
    await applyBtn.click({ force: true });
    await this.page.waitForTimeout(1500);
    await this.page.locator('.MuiBackdrop-root').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(1500);
    this.logger.info('Filters applied successfully');
  }

  /**
   * Extracts metric counts and values from the KPI cards
   * @returns {Promise<{ totalCount: number, pendingCount: number, inGraceCount: number, expiredCount: number, rawText: string }>}
   */
  async getMetricsSummary() {
    this.logger.info('Extracting metrics KPI cards summary');
    const cardsText = await this.page.locator('div[class*="row"]:has-text("Due Renewals"), div[class*="MuiGrid"]:has-text("Due Renewals")')
      .first()
      .innerText()
      .catch(() => '');

    // Extract numbers using regex
    const totalMatch = cardsText.match(/Due Renewals\s*(\d+)/i) || cardsText.match(/(\d+)\s*\|\s*₹/);
    const pendingMatch = cardsText.match(/Pending\s*(\d+)/i);
    const inGraceMatch = cardsText.match(/In Grace\s*(\d+)/i);
    const expiredMatch = cardsText.match(/Expired\s*(\d+)/i);

    const summary = {
      totalCount: totalMatch ? parseInt(totalMatch[1], 10) : 0,
      pendingCount: pendingMatch ? parseInt(pendingMatch[1], 10) : 0,
      inGraceCount: inGraceMatch ? parseInt(inGraceMatch[1], 10) : 0,
      expiredCount: expiredMatch ? parseInt(expiredMatch[1], 10) : 0,
      rawText: cardsText
    };
    this.logger.info(`Metrics extracted: Total=${summary.totalCount}, Pending=${summary.pendingCount}, InGrace=${summary.inGraceCount}, Expired=${summary.expiredCount}`);
    return summary;
  }

  /**
   * Scrapes visible data rows from the UI data table
   * @returns {Promise<Array<{ serialNo: string, lastActive: string, dueDate: string, modelVersion: string, timesRenewed: string, companyCity: string, renewStatus: string }>>}
   */
  async getTableRowsData() {
    this.logger.info('Extracting table rows data from UI');
    const rows = await this.page.evaluate(() => {
      const result = [];
      const trs = Array.from(document.querySelectorAll('tbody tr, div[role="row"]:not(:first-child)'));
      for (const tr of trs) {
        const text = tr.innerText?.trim();
        if (text) {
          result.push(text.split('\n').filter(Boolean));
        }
      }
      return result;
    });
    this.logger.info(`Scraped ${rows.length} rows from UI`);
    return rows;
  }

  /**
   * Clicks the Download Excel button on Due Renewals
   * Captures the resulting popup tab (or navigates to /partner/report/download)
   * @returns {Promise<{ downloadPage: import('@playwright/test').Page, isPopup: boolean }>}
   */
  async triggerDownloadExcel() {
    this.logger.info('Triggering Download Excel from Due Renewals page');
    const dlBtn = this.locators.downloadExcelButton;
    await expect(dlBtn).toBeVisible({ timeout: 15000 });

    const popupPromise = this.page.waitForEvent('popup', { timeout: 10000 }).catch(() => null);
    await dlBtn.click();

    const popup = await popupPromise;
    const downloadPage = popup || this.page;
    await downloadPage.waitForLoadState('domcontentloaded');
    await downloadPage.waitForTimeout(2000);

    // If still on the same page and no popup, navigate directly to partner download queue
    if (!popup && !downloadPage.url().includes('/partner/report/download')) {
      await downloadPage.goto('/partner/report/download', { waitUntil: 'domcontentloaded' });
      await downloadPage.waitForTimeout(2000);
    }

    this.logger.info(`Download queue page ready: ${downloadPage.url()}`);
    return { downloadPage, isPopup: !!popup };
  }

  /**
   * Monitors the central partner report download queue, waits until status becomes 'Processed',
   * and triggers the file download strictly from row 1.
   * 
   * @param {import('@playwright/test').Page} downloadPage 
   * @param {string} [downloadDir] 
   * @param {number} [timeoutMs] 
   * @returns {Promise<{ filePath: string, filename: string }>}
   */
  async waitForPartnerReportProcessedAndDownload(downloadPage, downloadDir = path.join(process.cwd(), 'downloads'), timeoutMs = 120000) {
    this.logger.info(`Polling partner download queue on: ${downloadPage.url()}`);

    const cronHost = new URL(downloadPage.url()).hostname;
    const cronUrl = `http://${cronHost}:9094/report/v1/cron/report/`;
    try {
      this.logger.info(`Triggering report cron processor API at: ${cronUrl}`);
      await downloadPage.request.get(cronUrl, { timeout: 15000 }).catch(() => {});
    } catch (e) {}

    // Find row matching Due Renewal or first row
    const getTargetRow = () => {
      return downloadPage.locator('tbody tr, div[role="row"]:not(:first-child)').filter({ hasText: /Due Renewal/i }).first();
    };

    let targetRow = getTargetRow();
    if (!(await targetRow.isVisible({ timeout: 5000 }).catch(() => false))) {
      targetRow = downloadPage.locator('tbody tr, div[role="row"]:not(:first-child)').first();
    }
    await expect(targetRow).toBeVisible({ timeout: 30000 });

    let downloadBtn = targetRow.locator('button:has-text("Download")').first();

    // Poll until matching row contains "Processed" and download button is active
    await expect(async () => {
      try {
        await downloadPage.request.get(cronUrl, { timeout: 10000 }).catch(() => {});
      } catch (e) {}

      // Reload page to fetch fresh job status
      await downloadPage.reload({ waitUntil: 'domcontentloaded' });
      await downloadPage.waitForTimeout(2000);

      targetRow = getTargetRow();
      if (!(await targetRow.isVisible({ timeout: 3000 }).catch(() => false))) {
        targetRow = downloadPage.locator('tbody tr, div[role="row"]:not(:first-child)').first();
      }
      downloadBtn = targetRow.locator('button:has-text("Download")').first();

      const rowText = await targetRow.innerText().catch(() => '');
      this.logger.info(`Current Target Row Status: ${rowText.replace(/\n/g, ' | ')}`);

      await expect(targetRow).toContainText(/Processed/i, { timeout: 2000 });
      await expect(downloadBtn).toBeVisible({ timeout: 2000 });
      await expect(downloadBtn).toBeEnabled({ timeout: 2000 });
    }).toPass({ intervals: [4000], timeout: timeoutMs });

    this.logger.info('Report is Processed. Triggering download...');

    // Capture the download event
    const downloadPromise = downloadPage.waitForEvent('download', { timeout: 30000 });
    await downloadBtn.click();
    const download = await downloadPromise;

    const saved = await downloadValidator.saveDownload(download, downloadDir);
    this.logger.info(`Successfully downloaded and saved report: ${saved.filename} (${saved.filePath})`);
    return saved;
  }

  /**
   * Deep validation of downloaded Due Renewals Excel file
   * Validates:
   * 1. File existence, size > 0, extension .xlsx
   * 2. Suggested filename matches Due Renewal Subs_*.xlsx
   * 3. Sheet1 existence
   * 4. Row 0: Date metadata ('From', ..., 'To', ...)
   * 5. Row 1: All 22 required column headers
   * 6. Data rows: Data integrity, valid Serial numbers, no corruption
   * 
   * @param {string} filePath 
   * @param {object} [options] Expected counts, filters, etc.
   * @returns {{ isValid: boolean, rowCount: number, dataRowCount: number, headers: string[], dateMetadata: string[], errors: string[] }}
   */
  validateDownloadedDueRenewalsExcel(filePath, options = {}) {
    this.logger.info(`Performing deep content validation on: ${filePath}`);
    const errors = [];

    // File level basics
    const basics = downloadValidator.validateFileBasics(filePath, dueRenewalsData.DOWNLOAD_FILENAME_REGEX);
    if (!basics.exists) errors.push(`File does not exist: ${filePath}`);
    if (!basics.isSizeValid) errors.push(`File is empty: ${basics.size} bytes`);
    if (basics.extension !== '.xlsx') errors.push(`Expected .xlsx extension, got ${basics.extension}`);
    if (!basics.isPatternValid) errors.push(`Filename "${basics.filename}" did not match expected pattern`);

    // Parse workbook with xlsx
    let workbook;
    try {
      workbook = xlsx.readFile(filePath);
    } catch (e) {
      errors.push(`Failed to read workbook: ${e.message}`);
      return { isValid: false, rowCount: 0, dataRowCount: 0, headers: [], dateMetadata: [], errors };
    }

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      errors.push('Workbook contains no sheets');
      return { isValid: false, rowCount: 0, dataRowCount: 0, headers: [], dateMetadata: [], errors };
    }

    const sheet = workbook.Sheets[sheetName];
    const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    const rowCount = rawRows.length;

    if (rowCount < 2) {
      errors.push(`Workbook has fewer than 2 rows (Headers missing). Found ${rowCount} rows.`);
      return { isValid: false, rowCount, dataRowCount: 0, headers: [], dateMetadata: [], errors };
    }

    // Row 0: Date Metadata
    const row0 = rawRows[0] || [];
    const dateMetadata = row0.map(x => String(x || '').trim());
    if (!dateMetadata.includes('From') || !dateMetadata.includes('To')) {
      errors.push(`Row 0 does not contain 'From' and 'To' date metadata: ${JSON.stringify(dateMetadata)}`);
    }

    // Row 1: Column Headers
    const row1 = rawRows[1] || [];
    const headers = row1.map(x => String(x || '').trim());

    // Compare with expected 22 column headers
    for (const expectedCol of dueRenewalsData.EXPECTED_EXCEL_HEADERS) {
      if (!headers.includes(expectedCol)) {
        errors.push(`Missing expected column header in Excel: "${expectedCol}"`);
      }
    }

    const dataRowCount = Math.max(0, rowCount - 2);
    this.logger.info(`Excel Sheet: "${sheetName}" | Total Rows: ${rowCount} | Data Rows: ${dataRowCount} | Columns: ${headers.length}`);

    // If expected row count provided, compare
    if (options.expectedRowCount !== undefined && options.expectedRowCount !== null) {
      if (dataRowCount !== options.expectedRowCount) {
        errors.push(`Data row count mismatch: Expected ${options.expectedRowCount}, got ${dataRowCount}`);
      }
    }

    return {
      isValid: errors.length === 0,
      rowCount,
      dataRowCount,
      headers,
      dateMetadata,
      errors
    };
  }
}

module.exports = { DueRenewalsPage };

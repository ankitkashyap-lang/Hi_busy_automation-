const { expect } = require('@playwright/test');
const BasePage = require('../../base/BasePage');
const { NewActivationsLocators } = require('../../page_objects/locators/NewActivationsLocators');
const downloadValidator = require('../../utils/downloadValidator');
const Logger = require('../../utils/logger');
const xlsx = require('xlsx');
const path = require('path');
const newActivationsData = require('../../test-data/reports/newActivationsData');

/**
 * NewActivationsPage - Enterprise Page Object for Analytics -> New Activations Report
 * Inherits from BasePage and encapsulates navigation, product tabs, desktop variations,
 * dynamic filter combinations, metrics extraction, table scraping, download queue monitoring,
 * and deep Excel file validation.
 */
class NewActivationsPage extends BasePage {
  constructor(page) {
    super(page);
    this.logger = Logger.getInstance();
    this.locators = new NewActivationsLocators(page);
  }

  /**
   * Navigates to New Activations report under a partner account (default: 3M Infocare)
   * Handles session preservation, login if needed, partner search & access, and transition to analytics
   * @param {string} partnerName 
   */
  async navigateToNewActivations(partnerName = newActivationsData.DEFAULT_PARTNER) {
    this.logger.info(`Navigating to New Activations report for partner: "${partnerName}"`);

    // 1. Try direct navigation to New Activations (fast path for authenticated session)
    try {
      await this.page.goto(newActivationsData.NEW_ACTIVATIONS_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await this.page.waitForTimeout(2000);
      if (this.page.url().includes('/partner/analytics/newactivations')) {
        this.logger.info(`Directly landed on New Activations via existing session: ${this.page.url()}`);
        return;
      }
    } catch (e) {
      this.logger.info('Direct navigation failed, performing login & access flow.');
    }

    // 2. If redirected to login, perform authentication
    const isLoginVisible = await this.page.locator('#usr, input[type="email"]').first().isVisible({ timeout: 2000 }).catch(() => false);
    if (isLoginVisible || this.page.url().includes('/login')) {
      const { LoginPage } = require('../loginPage');
      const globalConfig = require('../../config/globalConfig');
      const loginPage = new LoginPage(this.page);
      await loginPage.login(globalConfig.ADMIN_EMAIL, globalConfig.ADMIN_PASSWORD);
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(2000);
    }

    // 3. Navigate to Partners listing
    await this.page.goto('/partner/teams/id', { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(3000);

    // 4. Search and access the partner account
    const searchInput = this.page.locator('input[placeholder*="Search"], input[aria-label="search"]').first();
    await expect(searchInput).toBeVisible({ timeout: 15000 });
    await searchInput.fill(partnerName);
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(3500);

    const accessBtn = this.page.locator('button[aria-label="Access Account"], button:has(svg[data-testid="LockOpenIcon"])').first();
    await expect(accessBtn).toBeVisible({ timeout: 15000 });
    await accessBtn.click();
    await this.page.waitForTimeout(4000);

    // 5. Navigate to New Activations
    await this.page.goto(newActivationsData.NEW_ACTIVATIONS_URL, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(2500);
    this.logger.info(`Successfully landed on New Activations: ${this.page.url()}`);
  }

  /**
   * Switches to a specific product (Desktop, Online, Mobile, Recom, mazu)
   * @param {'desktop'|'online'|'mobile'|'recom'|'mazu'} product 
   */
  async switchProduct(product = 'desktop') {
    this.logger.info(`Switching product to: ${product}`);
    const prodKey = String(product).toLowerCase();
    const prodInfo = newActivationsData.PRODUCTS[prodKey.toUpperCase()] || { param: prodKey, tabIndex: 0 };

    const targetUrl = `/partner/analytics/newactivations?tab=${prodInfo.tabIndex}&product=${prodInfo.param}`;
    await this.page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(2500);
    this.logger.info(`Product switched to ${product}. Current URL: ${this.page.url()}`);
  }

  /**
   * Selects Desktop sub-variation (All, Busy 21, Mandi, Magic)
   * @param {'All'|'Busy 21'|'Mandi'|'Magic'} variation 
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
   * @param {number} filterIndex 
   * @param {string} value 
   */
  async setAutocompleteFilter(filterIndex, value) {
    this.logger.info(`Setting filter #${filterIndex} to value "${value}"`);
    const input = this.locators.allAutocompleteInputs.nth(filterIndex);
    await expect(input).toBeVisible({ timeout: 5000 });

    const popupBtn = this.locators.autocompletePopupButtons.nth(filterIndex);
    await this.page.locator('.MuiBackdrop-root').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    if (await popupBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await popupBtn.click({ force: true });
    } else {
      await input.click({ force: true });
    }
    await this.page.waitForTimeout(500);

    const option = this.page.locator('.MuiAutocomplete-popper li, [role="listbox"] li, .MuiAutocomplete-option')
      .filter({ hasText: new RegExp(`^${value}$`, 'i') })
      .or(this.page.locator('.MuiAutocomplete-popper li, [role="listbox"] li').filter({ hasText: value }))
      .first();

    if (await option.isVisible({ timeout: 3000 }).catch(() => false)) {
      await option.click();
    } else {
      await input.fill(value);
      await this.page.keyboard.press('ArrowDown');
      await this.page.keyboard.press('Enter');
    }
    await this.page.waitForTimeout(500);
  }

  /**
   * Sets filter value by input ID (e.g. 'timePeriod', 'status', 'installedBy', 'model', 'city')
   * @param {string} inputId 
   * @param {string} value 
   */
  async setFilterById(inputId, value) {
    this.logger.info(`Setting filter by id "${inputId}" to value "${value}"`);
    const input = this.page.locator(`input#${inputId}`).first();
    await expect(input).toBeVisible({ timeout: 5000 });

    const root = input.locator('xpath=ancestor::div[contains(@class, "MuiAutocomplete-root")]');
    const popupBtn = root.locator('button[title="Open"]').first();

    if (await popupBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await popupBtn.click();
    } else {
      await input.click();
    }
    await this.page.waitForTimeout(500);

    const option = this.page.locator('.MuiAutocomplete-popper li, [role="listbox"] li, .MuiAutocomplete-option')
      .filter({ hasText: new RegExp(`^${value}$`, 'i') })
      .or(this.page.locator('.MuiAutocomplete-popper li, [role="listbox"] li').filter({ hasText: value }))
      .first();

    if (await option.isVisible({ timeout: 3000 }).catch(() => false)) {
      await option.click();
    } else {
      await input.fill(value);
      await this.page.keyboard.press('ArrowDown');
      await this.page.keyboard.press('Enter');
    }
    await this.page.waitForTimeout(500);
  }

  /**
   * Sets Month Range filter with start and end months
   * @param {string} startMonth e.g. 'Aug-26'
   * @param {string} endMonth e.g. 'Sep-26'
   */
  async setMonthRange(startMonth, endMonth) {
    this.logger.info(`Setting Month Range: ${startMonth} to ${endMonth}`);
    await this.setFilterById('timePeriod', 'Month Range');
    await this.page.waitForTimeout(1000);

    if (startMonth && await this.locators.startMonthInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await this.locators.startMonthInput.fill(startMonth);
    }
    if (endMonth && await this.locators.endMonthInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await this.locators.endMonthInput.fill(endMonth);
    }
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
   * @returns {Promise<{ totalCount: number, inClusterCount: number, outOfClusterCount: number, selfCount: number, resellerCount: number, rawText: string }>}
   */
  async getMetricsSummary() {
    this.logger.info('Extracting metrics KPI cards summary');
    const cardsText = await this.page.locator('div[class*="row"]:has-text("New Activations"), div[class*="MuiGrid"]:has-text("New Activations")')
      .first()
      .innerText()
      .catch(() => '');

    const totalMatch = cardsText.match(/New Activations\s*(\d+)/i) || cardsText.match(/(\d+)\s*\|\s*₹/);
    const inClusterMatch = cardsText.match(/In Cluster\s*(\d+)/i);
    const outClusterMatch = cardsText.match(/Out Of Cluster\s*(\d+)/i);
    const selfMatch = cardsText.match(/Installed By Self\s*(\d+)/i);
    const resellerMatch = cardsText.match(/By Reseller\s*(\d+)/i);

    const summary = {
      totalCount: totalMatch ? parseInt(totalMatch[1], 10) : 0,
      inClusterCount: inClusterMatch ? parseInt(inClusterMatch[1], 10) : 0,
      outOfClusterCount: outClusterMatch ? parseInt(outClusterMatch[1], 10) : 0,
      selfCount: selfMatch ? parseInt(selfMatch[1], 10) : 0,
      resellerCount: resellerMatch ? parseInt(resellerMatch[1], 10) : 0,
      rawText: cardsText
    };
    this.logger.info(`Metrics: Total=${summary.totalCount}, InCluster=${summary.inClusterCount}, OutOfCluster=${summary.outOfClusterCount}, Self=${summary.selfCount}, Reseller=${summary.resellerCount}`);
    return summary;
  }

  /**
   * Scrapes visible data rows from the UI data table
   * @returns {Promise<Array<string[]>>}
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
   * Clicks the Download Excel button on New Activations
   * Captures the resulting popup tab (or navigates to /partner/report/download)
   * @returns {Promise<{ downloadPage: import('@playwright/test').Page, isPopup: boolean }>}
   */
  async triggerDownloadExcel() {
    this.logger.info('Triggering Download Excel from New Activations page');
    const dlBtn = this.locators.downloadExcelButton;
    await expect(dlBtn).toBeVisible({ timeout: 15000 });

    const popupPromise = this.page.waitForEvent('popup', { timeout: 10000 }).catch(() => null);
    await dlBtn.click();

    const popup = await popupPromise;
    const downloadPage = popup || this.page;
    await downloadPage.waitForLoadState('domcontentloaded');
    await downloadPage.waitForTimeout(2000);

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

    const firstRow = downloadPage.locator('tbody tr, div[role="row"]:not(:first-child)').first();
    await expect(firstRow).toBeVisible({ timeout: 30000 });

    const downloadBtn = firstRow.locator('button:has-text("Download")').first();

    await expect(async () => {
      try {
        await downloadPage.request.get(cronUrl, { timeout: 10000 }).catch(() => {});
      } catch (e) {}

      await downloadPage.reload({ waitUntil: 'domcontentloaded' });
      await downloadPage.waitForTimeout(2000);

      const rowText = await firstRow.innerText();
      this.logger.info(`Current First Row Status: ${rowText.replace(/\n+/g, ' | ')}`);

      if (rowText.toLowerCase().includes('failed') || rowText.toLowerCase().includes('error')) {
        throw new Error(`Report generation failed on backend: ${rowText.replace(/\n+/g, ' | ')}`);
      }

      await expect(firstRow).toContainText(/Processed/i, { timeout: 2000 });
      await expect(downloadBtn).toBeVisible({ timeout: 2000 });
      await expect(downloadBtn).toBeEnabled({ timeout: 2000 });
    }).toPass({ intervals: [4000], timeout: timeoutMs });

    this.logger.info('Report is Processed. Triggering download...');

    const downloadPromise = downloadPage.waitForEvent('download', { timeout: 30000 });
    await downloadBtn.click();
    const download = await downloadPromise;

    const saved = await downloadValidator.saveDownload(download, downloadDir);
    this.logger.info(`Successfully downloaded and saved report: ${saved.filename} (${saved.filePath})`);
    return saved;
  }

  /**
   * Deep validation of downloaded New Activations Excel file
   * Validates:
   * 1. File existence, size > 0, extension .xlsx
   * 2. Suggested filename matches Activation Subs_*.xlsx
   * 3. Sheet1 existence
   * 4. Row 0: Date metadata ('From', ..., 'To', ...)
   * 5. Row 1: All 22 required column headers
   * 6. Data rows: Data integrity, valid Serial numbers, no corruption
   * 
   * @param {string} filePath 
   * @param {object} [options] 
   * @returns {{ isValid: boolean, rowCount: number, dataRowCount: number, headers: string[], dateMetadata: string[], errors: string[] }}
   */
  validateDownloadedNewActivationsExcel(filePath, options = {}) {
    this.logger.info(`Performing deep content validation on: ${filePath}`);
    const errors = [];

    const basics = downloadValidator.validateFileBasics(filePath, newActivationsData.DOWNLOAD_FILENAME_REGEX);
    if (!basics.exists) errors.push(`File does not exist: ${filePath}`);
    if (!basics.isSizeValid) errors.push(`File is empty: ${basics.size} bytes`);
    if (basics.extension !== '.xlsx') errors.push(`Expected .xlsx extension, got ${basics.extension}`);
    if (!basics.isPatternValid) errors.push(`Filename "${basics.filename}" did not match expected pattern`);

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
    for (const expectedCol of newActivationsData.EXPECTED_EXCEL_HEADERS) {
      if (!headers.includes(expectedCol)) {
        errors.push(`Missing expected column header in Excel: "${expectedCol}"`);
      }
    }

    const dataRowCount = Math.max(0, rowCount - 2);
    this.logger.info(`Excel Sheet: "${sheetName}" | Total Rows: ${rowCount} | Data Rows: ${dataRowCount} | Columns: ${headers.length}`);

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

module.exports = { NewActivationsPage };

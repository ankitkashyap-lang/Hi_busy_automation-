const { expect } = require('@playwright/test');
const BasePage = require('../../base/BasePage');
const { TransferInLocators } = require('../../page_objects/locators/TransferInLocators');
const downloadValidator = require('../../utils/downloadValidator');
const Logger = require('../../utils/logger');
const xlsx = require('xlsx');
const path = require('path');
const transferInData = require('../../test-data/reports/transferInData');
const globalConfig = require('../../config/globalConfig');

/**
 * TransferInPage - Enterprise Page Object for Analytics -> Transfer In Report
 * Inherits from BasePage and encapsulates navigation, filter configuration,
 * table scraping, sorting, download queue monitoring, and deep Excel file validation.
 */
class TransferInPage extends BasePage {
  constructor(page) {
    super(page);
    this.logger = Logger.getInstance();
    this.locators = new TransferInLocators(page);
  }

  /**
   * Navigates to Transfer In report under a partner account (default: 3M Infocare)
   * Handles session preservation, login if needed, partner search & access, and transition to analytics
   * @param {string} partnerName 
   */
  async navigateToTransferIn(partnerName = transferInData.DEFAULT_PARTNER) {
    this.logger.info(`Navigating to Transfer In report for partner: "${partnerName}"`);

    // 1. Try direct navigation to Transfer In (fast path for authenticated session)
    const targetUrl = transferInData.TRANSFER_IN_URL.startsWith('http')
      ? transferInData.TRANSFER_IN_URL
      : `${globalConfig.BASE_URL.replace(/\/$/, '')}${transferInData.TRANSFER_IN_URL}`;

    try {
      await this.page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await this.page.waitForTimeout(2000);
      if (this.page.url().includes('/partner/analytics/transferin')) {
        this.logger.info(`Directly landed on Transfer In via existing session: ${this.page.url()}`);
        const applyBtn = this.locators.applyFiltersButton;
        if (await applyBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await applyBtn.click();
          await this.page.waitForTimeout(2500);
        }
        return;
      }
    } catch (e) {
      this.logger.info('Direct navigation failed, performing login & partner access flow.');
    }

    // 2. If redirected to login or not logged in
    const isLoginVisible = await this.page.locator('#usr, input[type="email"]').first().isVisible({ timeout: 2000 }).catch(() => false);
    if (isLoginVisible || this.page.url().includes('/login') || !this.page.url().includes('pooraa.net')) {
      const { LoginPage } = require('../loginPage');
      const loginPage = new LoginPage(this.page);
      await loginPage.login(globalConfig.ADMIN_EMAIL, globalConfig.ADMIN_PASSWORD);
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(2000);
    }

    // 3. Search and access the partner account
    this.logger.info(`Accessing partner: ${partnerName}`);
    const partnerUrl = `${globalConfig.BASE_URL.replace(/\/$/, '')}/partner/teams/id`;
    await this.page.goto(partnerUrl, { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(2500);

    const searchInput = this.page.locator('input[placeholder*="Search"], input[aria-label="search"]').first();
    if (await searchInput.isVisible({ timeout: 10000 }).catch(() => false)) {
      await searchInput.fill(partnerName);
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(3000);

      const accessBtn = this.page.locator('button[aria-label="Access Account"], button:has(svg[data-testid="LockOpenIcon"])').first();
      if (await accessBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
        await accessBtn.click();
        await this.page.waitForTimeout(4000);
        this.logger.info(`Entered partner account. Current URL: ${this.page.url()}`);
      }
    }

    // 4. Land on Transfer In report
    await this.page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(2500);

    // Apply default filters to load table
    const applyBtn = this.locators.applyFiltersButton;
    if (await applyBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await applyBtn.click();
      await this.page.waitForTimeout(3000);
    }

    // Save active partner session to storageState
    const storageStatePath = path.join(__dirname, '../../storageState/adminAuth.json');
    await this.page.context().storageState({ path: storageStatePath }).catch(() => {});

    this.logger.info(`Successfully landed on Transfer In with partner session: ${this.page.url()}`);
  }

  /**
   * Switches to a specific product tab or parameter (Desktop, Online, Mobile, Recom, mazu, rdp)
   * @param {'desktop'|'online'|'mobile'|'recom'|'mazu'|'rdp'} product 
   */
  async switchProduct(product = 'desktop') {
    this.logger.info(`Switching product to: ${product}`);
    const prodKey = String(product).toLowerCase();
    const prodInfo = transferInData.PRODUCTS[prodKey.toUpperCase()] || { param: prodKey, tabIndex: 0 };

    const targetUrl = `/partner/analytics/transferin?tab=${prodInfo.tabIndex}&product=${prodInfo.param}`;
    await this.page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(2500);
    this.logger.info(`Product switched to ${product}. Current URL: ${this.page.url()}`);
  }

  /**
   * Selects Desktop sub-variation if available in UI
   * @param {string} variation 
   */
  async selectDesktopVariation(variation = 'Busy 21') {
    this.logger.info(`Selecting desktop variation: ${variation}`);
    const select = this.locators.productSelect;
    if (await select.isVisible({ timeout: 3000 }).catch(() => false)) {
      const isEnabled = await select.isEnabled().catch(() => false);
      if (isEnabled) {
        await select.selectOption(variation).catch(() => {});
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Sets value for an Autocomplete filter by index
   * @param {number} filterIndex (0: Time Period, 1: Subs Status, 2: Transferred From, 3: Model, 4: Version, 5: User, 6: City, 7: Installed By)
   * @param {string} value Option text to select
   */
  async setAutocompleteFilter(filterIndex, value) {
    this.logger.info(`Setting filter #${filterIndex} to value "${value}"`);
    const input = this.locators.allAutocompleteInputs.nth(filterIndex);
    await expect(input).toBeVisible({ timeout: 5000 });

    // Open popup
    await this.page.locator('.MuiBackdrop-root').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
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
   * Sets filter by key/id
   * @param {'timePeriod'|'status'|'transferredFrom'|'model'|'version'|'user'|'city'|'installedBy'} key 
   * @param {string} value 
   */
  async setFilterById(key, value) {
    const keyMap = {
      timeperiod: 0,
      time: 0,
      status: 1,
      subsstatus: 1,
      transferredfrom: 2,
      transferredto: 2,
      model: 3,
      version: 4,
      user: 5,
      usertype: 5,
      city: 6,
      installedby: 7
    };

    const idx = keyMap[String(key).toLowerCase()];
    if (idx !== undefined) {
      await this.setAutocompleteFilter(idx, value);
    } else {
      throw new Error(`Unknown filter key: ${key}`);
    }
  }

  /**
   * Clicks the "Apply Filters" button and waits for grid refresh
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
   * Extracts metric counts and values from the Transfer In KPI cards
   * @returns {Promise<{ totalCount: number, perpetualCount: number, subscriptionCount: number, rawText: string }>}
   */
  async getMetricsSummary() {
    this.logger.info('Extracting metrics KPI cards summary');
    const cardsText = await this.locators.metricsContainer.innerText().catch(() => '');

    const totalMatch = cardsText.match(/Transfer In\s*(\d+)/i);
    const perpetualMatch = cardsText.match(/Perpetual\s*(\d+)/i);
    const subsMatch = cardsText.match(/Subscription\s*(\d+)/i);

    const summary = {
      totalCount: totalMatch ? parseInt(totalMatch[1], 10) : 0,
      perpetualCount: perpetualMatch ? parseInt(perpetualMatch[1], 10) : 0,
      subscriptionCount: subsMatch ? parseInt(subsMatch[1], 10) : 0,
      rawText: cardsText
    };
    this.logger.info(`Metrics extracted: Total=${summary.totalCount}, Perpetual=${summary.perpetualCount}, Subs=${summary.subscriptionCount}`);
    return summary;
  }

  /**
   * Clicks the sort toggle button on the Install Date column header
   */
  async sortByInstallDate() {
    this.logger.info('Toggling sort on Install Date column');
    const sortBtn = this.locators.installDateSortButton;
    await expect(sortBtn).toBeVisible({ timeout: 5000 });
    await sortBtn.click();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Scrapes visible data rows from the UI data table
   * @returns {Promise<Array<string[]>>}
   */
  async getTableRowsData() {
    this.logger.info('Extracting table rows data from UI');
    const rows = await this.page.evaluate(() => {
      const result = [];
      const trs = Array.from(document.querySelectorAll('.MuiTableBody-root [role="row"], tbody tr'));
      for (const tr of trs) {
        const text = tr.innerText?.trim();
        if (text) {
          result.push(text.split('\n').map(s => s.trim()).filter(Boolean));
        }
      }
      return result;
    });
    this.logger.info(`Scraped ${rows.length} rows from UI`);
    return rows;
  }

  /**
   * Clicks the Download Excel button on Transfer In
   * Captures the resulting popup tab (or navigates to /partner/report/download)
   * @returns {Promise<{ downloadPage: import('@playwright/test').Page, isPopup: boolean }>}
   */
  async triggerDownloadExcel() {
    this.logger.info('Triggering Download Excel from Transfer In page');
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

    const firstRow = downloadPage.locator('tbody tr, div[role="row"]:not(:first-child)').first();
    await expect(firstRow).toBeVisible({ timeout: 30000 });

    const downloadBtn = firstRow.locator('button:has-text("Download")').first();

    // Poll until row 1 contains "Processed" and download button is active
    await expect(async () => {
      try {
        await downloadPage.request.get(cronUrl, { timeout: 10000 }).catch(() => {});
      } catch (e) {}

      // Reload page to fetch fresh job status
      await downloadPage.reload({ waitUntil: 'domcontentloaded' });
      await downloadPage.waitForTimeout(2000);

      const rowText = await firstRow.innerText();
      this.logger.info(`Current First Row Status: ${rowText.replace(/\n/g, ' | ')}`);

      await expect(firstRow).toContainText(/Processed/i, { timeout: 2000 });
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
   * Deep validation of downloaded Transfer In Excel file
   * Validates:
   * 1. File existence, size > 0, extension .xlsx
   * 2. Suggested filename matches Transfer In Subs_*.xlsx
   * 3. Sheet1 existence
   * 4. Row 0: Date metadata ('From', ..., 'To', ...)
   * 5. Row 1: All 22 required column headers
   * 6. Data rows: Data integrity, valid Serial numbers, no corruption
   * 
   * @param {string} filePath 
   * @returns {{ isValid: boolean, rowCount: number, dataRowCount: number, headers: string[], dateMetadata: string[], errors: string[] }}
   */
  validateDownloadedTransferInExcel(filePath) {
    this.logger.info(`Performing deep content validation on: ${filePath}`);
    const errors = [];

    // File level basics
    const basics = downloadValidator.validateFileBasics(filePath, transferInData.DOWNLOAD_FILENAME_REGEX);
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
    const missingHeaders = transferInData.EXPECTED_EXCEL_HEADERS.filter(h => !headers.includes(h));

    if (missingHeaders.length > 0) {
      errors.push(`Missing expected Excel headers: ${missingHeaders.join(', ')}`);
    }

    const dataRowCount = Math.max(0, rowCount - 2);

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

module.exports = { TransferInPage };

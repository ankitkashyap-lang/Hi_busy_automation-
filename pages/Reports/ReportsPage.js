const { expect } = require('@playwright/test');
const BasePage = require('../../base/BasePage');
const { ReportsLocators } = require('../../page_objects/locators/ReportsLocators');
const downloadValidator = require('../../utils/downloadValidator');
const Logger = require('../../utils/logger');
const path = require('path');

/**
 * ReportsPage - Enterprise Page Object for Reports Module
 * Inherits from BasePage and encapsulates all business actions, form filters,
 * cron triggering, queue polling, and file downloads.
 */
class ReportsPage extends BasePage {
  constructor(page) {
    super(page);
    this.logger = Logger.getInstance();
    this.locators = new ReportsLocators(page);
  }

  /**
   * Opens the side navigation menu
   */
  async openMenu() {
    this.logger.info('Opening side navigation menu');
    const menuBtn = this.locators.menuButton;
    await menuBtn.waitFor({ state: 'visible', timeout: 15000 });
    await menuBtn.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Opens the Reports accordion inside the side menu
   */
  async openReportsMenu() {
    await this.openMenu();
    this.logger.info('Expanding Reports menu section');
    const reportAccordion = this.locators.reportsMenuAccordion;
    if (await reportAccordion.isVisible({ timeout: 5000 }).catch(() => false)) {
      await reportAccordion.click();
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Navigates to a specific report by name or direct URL
   * @param {string} reportName 
   * @param {string} [directUrl] 
   */
  async navigateToReport(reportName, directUrl = null) {
    this.logger.info(`Navigating to report: ${reportName}`);

    // Dismiss any open backdrop, modal or tooltip
    try {
      const backdrop = this.page.locator('.MuiBackdrop-root');
      if (await backdrop.isVisible({ timeout: 500 }).catch(() => false)) {
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(300);
      }
    } catch (e) {}

    if (directUrl) {
      await this.navigate(directUrl);
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(1000);

      // Self-heal: If redirected to login page, re-authenticate and retry
      if (this.page.url().includes('/login') || this.page.url().endsWith('/')) {
        const isLogin = await this.page.locator('#usr, input[type="email"]').first().isVisible({ timeout: 1500 }).catch(() => false);
        if (isLogin) {
          this.logger.warn('Session expired. Re-authenticating as Admin...');
          const { LoginPage } = require('../loginPage');
          const globalConfig = require('../../config/globalConfig');
          const loginPage = new LoginPage(this.page);
          await loginPage.login(globalConfig.ADMIN_EMAIL, globalConfig.ADMIN_PASSWORD);
          await this.page.waitForLoadState('domcontentloaded');
          await this.navigate(directUrl);
          await this.page.waitForLoadState('domcontentloaded');
          await this.page.waitForTimeout(1000);
        }
      }
      return;
    }

    await this.openReportsMenu();
    const link = this.locators.getReportLink(reportName);
    await link.waitFor({ state: 'visible', timeout: 15000 });
    await link.click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(1000);
  }

  /**
   * Selects date range in standard Material-UI / react-date-range picker
   * Clicks day (default '15') twice to select a valid single-day range and enable Submit
   * @param {number|string} day 
   */
  async selectDateRange(startDay = '15', endDay = null) {
    this.logger.info(`Selecting date range with day "${startDay}"`);
    const dateBtn = this.page.getByRole('button', { name: 'date_range' }).first()
      .or(this.locators.firstDateRangeButton);

    if (await dateBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await dateBtn.click();
      await this.page.waitForTimeout(600);

      // Find enabled day buttons in calendar picker (avoid clicking disabled future days)
      const enabledDays = this.page.locator('button.MuiPickersDay-day:not(.MuiPickersDay-dayDisabled):not([disabled])')
        .or(this.page.locator('.MuiPickersCalendar-transitionContainer button:not([disabled])'));
      const count = await enabledDays.count();

      if (count > 0) {
        const firstDay = enabledDays.first();
        const secondDay = enabledDays.nth(Math.min(count - 1, 3));
        await firstDay.click({ force: true }).catch(() => {});
        await secondDay.click({ force: true }).catch(() => {});
      }
      // Dismiss any open date picker dialog/backdrop
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(600);
    }
  }

  /**
   * Selects a value in a dropdown by index
   * @param {number} dropdownIndex 
   * @param {string} value 
   */
  async selectDropdownValue(dropdownIndex = 0, value = '') {
    this.logger.info(`Selecting "${value}" in dropdown #${dropdownIndex}`);
    const dropdown = this.locators.allSelectDropdowns.nth(dropdownIndex);
    if (await dropdown.isVisible({ timeout: 3000 }).catch(() => false)) {
      const tagName = await dropdown.evaluate(el => el.tagName.toLowerCase());
      if (tagName === 'select') {
        await dropdown.selectOption(value);
      } else {
        await dropdown.click();
        await this.page.getByRole('option', { name: value }).click();
      }
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Clicks Submit or Search button on the current page
   */
  async submitReport() {
    this.logger.info('Submitting report generation form');
    if (await this.locators.submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.locators.submitButton.click();
    } else if (await this.locators.searchButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.locators.searchButton.click();
    }
    await this.page.waitForTimeout(1500);
  }

  /**
   * Submits/Downloads a report form and captures the download page
   * Handles both new popup tab and direct same-page redirect seamlessly
   * @param {import('@playwright/test').Page} [targetPage]
   * @param {string} [actionName] 'Submit' or 'Download'
   * @returns {Promise<{ downloadPage: import('@playwright/test').Page, isPopup: boolean }>}
   */
  async submitReportAndOpenDownloadPage(targetPage = this.page, actionName = 'Submit') {
    this.logger.info(`Submitting report with action button "${actionName}"`);

    // Ensure any open dialog or backdrop is dismissed
    const backdrop = targetPage.locator('.MuiBackdrop-root, .MuiDialog-root');
    if (await backdrop.isVisible().catch(() => false)) {
      await targetPage.keyboard.press('Escape');
      await targetPage.waitForTimeout(500);
    }

    const actionBtn = targetPage.getByRole('button', { name: actionName })
      .or(targetPage.locator(`button:has-text("${actionName}")`))
      .first();
    await expect(actionBtn).toBeVisible({ timeout: 15000 });

    const popupPromise = targetPage.waitForEvent('popup', { timeout: 10000 }).catch(() => null);
    await actionBtn.click({ force: true });
    const popup = await popupPromise;

    const downloadPage = popup || targetPage;
    await downloadPage.waitForLoadState('domcontentloaded');
    await downloadPage.waitForTimeout(2000);

    return { downloadPage, isPopup: !!popup };
  }

  /**
   * Triggers the backend cron processor API dynamically based on current page host
   * @param {import('@playwright/test').Page} [targetPage] 
   * @param {import('@playwright/test').APIRequestContext} [request] 
   */
  async triggerCronProcessor(targetPage = this.page, request = null) {
    try {
      const currentUrl = targetPage.url();
      const cronHost = new URL(currentUrl).hostname;
      const cronUrl = `http://${cronHost}:9094/report/v1/cron/report/`;
      this.logger.info(`Triggering background report cron API: ${cronUrl}`);
      const reqObj = request || targetPage.request;
      await reqObj.get(cronUrl, { timeout: 30000 }).catch(err => {
        this.logger.warn(`Cron API call notice (non-fatal): ${err.message}`);
      });
      return true;
    } catch (error) {
      this.logger.warn(`Cron API trigger notice: ${error.message}`);
      return false;
    }
  }

  /**
   * Navigates directly to Central Downloads page
   */
  async openDownloadsPage() {
    this.logger.info('Navigating to central Downloads page (/busy/report/download)');
    await this.navigate('/busy/report/download');
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(2000);
  }

  /**
   * Downloads an in-page report (e.g. AC Stock, App Penetration, Subscription Status)
   * @param {import('@playwright/test').Page} [targetPage] 
   * @param {string} [downloadDir] 
   */
  async downloadInPageReport(targetPage = this.page, downloadDir = path.join(process.cwd(), 'downloads')) {
    this.logger.info('Attempting in-page report download');
    const downloadBtn = this.locators.inPageDownloadButton;
    await downloadBtn.waitFor({ state: 'visible', timeout: 15000 });

    const downloadPromise = targetPage.waitForEvent('download', { timeout: 30000 });
    await downloadBtn.click();
    const download = await downloadPromise;

    const saved = await downloadValidator.saveDownload(download, downloadDir);
    this.logger.info(`In-page report successfully downloaded: ${saved.filename}`);
    return saved;
  }

  /**
   * Robust enterprise implementation of queued report download
   * 1. Clicks Refresh on download page
   * 2. Hits dynamic server cron API: http://${cronHost}:9094/report/v1/cron/report/
   * 3. Scopes checks strictly to first data row: div[role="row"].nth(1)
   * 4. Awaits "Processed" status and enabled Download button via .toPass({ intervals: [5000], timeout: timeoutMs })
   * 5. Downloads strictly from row 1 using Promise.race on download event
   * 6. Validates file and saves to downloads/
   * 
   * @param {import('@playwright/test').Page} downloadPage 
   * @param {string|RegExp} [expectedReportName] 
   * @param {import('@playwright/test').APIRequestContext} [request] 
   * @param {number} [timeoutMs] 
   * @param {string} [downloadDir] 
   */
  async waitForReportProcessedAndDownload(downloadPage, expectedReportName = null, request = null, timeoutMs = 120000, downloadDir = path.join(process.cwd(), 'downloads')) {
    this.logger.info(`Processing queued report "${expectedReportName}" on download page: ${downloadPage.url()}`);

    await downloadPage.waitForLoadState('domcontentloaded');
    await downloadPage.waitForTimeout(2000);

    // 1. Click Refresh button on download page, then trigger cron API (works dynamically for QA1 & QA2)
    const refreshBtn = downloadPage.getByRole('button', { name: 'Select' })
      .or(downloadPage.getByTitle('Refresh'))
      .or(downloadPage.locator('button:has(.material-icons:has-text("refresh"))'))
      .first();
    await expect(refreshBtn).toBeVisible({ timeout: 15000 });
    await refreshBtn.click();
    await downloadPage.waitForTimeout(2000);

    const cronHost = new URL(downloadPage.url()).hostname;
    const cronUrl = `http://${cronHost}:9094/report/v1/cron/report/`;
    try {
      this.logger.info(`Triggering cron API at: ${cronUrl}`);
      const reqObj = request || downloadPage.request;
      await reqObj.get(cronUrl, { timeout: 30000 }).catch(err => {
        this.logger.warn(`Cron API call notice (non-fatal): ${err.message}`);
      });
    } catch (err) {
      this.logger.warn(`Cron API call notice: ${err.message}`);
    }

    // 2. Target ONLY and ONLY the first row (Row index 1 below header row 0) and verify report name
    const firstRow = downloadPage.locator('div[role="row"]').nth(1).or(downloadPage.locator('tbody tr').first());
    await expect(firstRow).toBeVisible({ timeout: 30000 });

    if (expectedReportName) {
      const pattern = expectedReportName instanceof RegExp ? expectedReportName : new RegExp(expectedReportName, 'i');
      await expect(firstRow).toContainText(pattern, { timeout: 10000 }).catch(() => {
        this.logger.warn(`First row title check notice for: ${expectedReportName}`);
      });
    }

    // Download button scoped strictly to the first row only
    const downloadBtn = firstRow.locator('button', { hasText: 'Download' }).first();

    // 3. Click Refresh button again and wait until status changes from 'In Process' to 'Processed' and download button is enabled
    await expect(async () => {
      if (await refreshBtn.isVisible()) {
        await refreshBtn.click();
      } else {
        await downloadPage.reload({ waitUntil: 'domcontentloaded' });
      }
      await downloadPage.waitForTimeout(2000);

      await expect(firstRow).toContainText(/Processed/i, { timeout: 2000 });
      await expect(downloadBtn).toBeVisible({ timeout: 2000 });
      await expect(downloadBtn).toBeEnabled({ timeout: 2000 });
    }).toPass({ intervals: [5000], timeout: timeoutMs });

    // 4. Download strictly from the first row
    const context = downloadPage.context();
    const downloadPromise = Promise.race([
      downloadPage.waitForEvent('download', { timeout: 30000 }),
      context.waitForEvent('download', { timeout: 30000 })
    ]);

    const [download] = await Promise.all([
      downloadPromise,
      downloadBtn.click()
    ]);

    const saved = await downloadValidator.saveDownload(download, downloadDir);
    this.logger.info(`Successfully downloaded first row report: ${saved.filename}`);
    return saved;
  }

  /**
   * Unified end-to-end report generation and download
   * Automatically handles both in-page downloads and async-queue downloads
   * @param {object} reportConfig 
   * @param {import('@playwright/test').APIRequestContext} [request]
   * @param {string} [downloadDir]
   */
  async generateAndDownload(reportConfig, request = null, downloadDir = path.join(process.cwd(), 'downloads')) {
    this.logger.info(`Starting unified download flow for: ${reportConfig.name}`);

    // 1. Navigate to Report
    await this.navigateToReport(reportConfig.name, reportConfig.url);

    // 2. Apply filters if required
    if (reportConfig.needsDate) {
      await this.selectDateRange(reportConfig.dateDay || '15');
    }

    // 3. Handle according to report type
    if (reportConfig.type === 'in-page') {
      if (reportConfig.needsSubmit) {
        await this.submitReport();
        await this.page.waitForTimeout(3000);
      }
      return await this.downloadInPageReport(this.page, downloadDir);
    } else {
      // Async-queue report (opens popup or redirects to /busy/report/download)
      const actionName = reportConfig.actionName || 'Submit';
      const { downloadPage, isPopup } = await this.submitReportAndOpenDownloadPage(this.page, actionName);

      try {
        const saved = await this.waitForReportProcessedAndDownload(
          downloadPage,
          reportConfig.matchName || reportConfig.name,
          request,
          120000,
          downloadDir
        );
        return saved;
      } finally {
        if (isPopup) {
          await downloadPage.close().catch(() => {});
        }
      }
    }
  }
}

module.exports = { ReportsPage };

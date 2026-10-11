/**
 * ReportsLocators - Centralized locator repository for the Reports Module
 * Following Enterprise Locator Priority: test-id > id > name > role+name > placeholder > css
 */
class ReportsLocators {
  constructor(page) {
    this.page = page;

    // --- Side Navigation & Menu ---
    this.menuButton = page.getByRole('button', { name: 'menu' })
      .or(page.getByRole('banner').getByRole('button', { name: 'menu' }))
      .or(page.locator('button[aria-label="menu"]'))
      .or(page.locator('.menu-icon'))
      .first();
    this.bannerMenuButton = page.getByRole('banner').getByRole('button', { name: 'menu' }).first();
    this.reportsMenuAccordion = page.getByText('bar_chartReport')
      .or(page.locator('text=/bar_chart\\s*Report/i'))
      .or(page.getByRole('button', { name: /Report/i }))
      .or(page.locator('text="Report"'))
      .first();
    this.sideDrawer = page.locator('.MuiDrawer-root, .MuiDrawer-paper, [role="navigation"], .MuiList-root').first();

    // --- Report Navigation Links ---
    this.reportLinks = {
      'AC Stock': page.locator('a[href*="/report/acStock"]').or(page.getByRole('link', { name: 'AC Stock', exact: true })).first(),
      'App Penetration': page.locator('a[href*="/report/penetrationLevel"]').or(page.getByRole('link', { name: 'App Penetration', exact: true })).first(),
      'Blocked Licenses': page.locator('a[href*="/report/blockedlicence"]').or(page.getByRole('link', { name: 'Blocked Licenses', exact: true })).first(),
      'BLS Expiry': page.locator('a[href*="/report/blsexpiry"]').or(page.getByRole('link', { name: 'BLS Expiry', exact: true })).first(),
      'Busy Online Report': page.locator('a[href*="/report/boreport"]').or(page.getByRole('link', { name: /Busy Online/i })).first(),
      'Cancellation And Reversal': page.locator('a[href*="/report/cancellationandreversal"]').or(page.getByRole('link', { name: 'Cancellation And Reversal', exact: true })).first(),
      'Customer List': page.locator('a[href*="/report/customerlist"]').or(page.getByRole('link', { name: 'Customer List', exact: true })).first(),
      'List of Clusters': page.locator('a[href*="/report/listofclusters"]').or(page.getByRole('link', { name: 'List of Clusters', exact: true })).first(),
      'Mobile LITE Usage': page.locator('a[href*="/report/mobileapplite"]').or(page.getByRole('link', { name: 'Mobile LITE Usage', exact: true })).first(),
      'Partners Renewal Rate Report': page.locator('a[href*="/report/renewalRate"]').or(page.getByRole('link', { name: 'Partners Renewal Rate Report', exact: true })).first(),
      'RDP License Report': page.locator('a[href*="/report/rdpLicense"]').or(page.getByRole('link', { name: 'RDP License Report', exact: true })).first(),
      'Renewal & Upgrade': page.locator('a[href*="/report/renewalsandupgrade"]').or(page.getByRole('link', { name: 'Renewal & Upgrade', exact: true })).first(),
      'Referral Lead Report': page.locator('a[href*="/report/referrallead"]').or(page.getByRole('link', { name: 'Referral Lead Report', exact: true })).first(),
      'Reseller': page.locator('a[href*="/report/reportresellers"]').or(page.getByRole('link', { name: 'Reseller', exact: true })).first(),
      'Sales Promotion': page.locator('a[href*="/report/salespromotion"]').or(page.getByRole('link', { name: 'Sales Promotion', exact: true })).first(),
      'Subscription History': page.locator('a[href*="/report/desktopSubscription"]').or(page.getByRole('link', { name: 'Subscription History', exact: true })).first(),
      'Subscription List': page.locator('a[href*="/report/paidsubscriptions"]').or(page.getByRole('link', { name: 'Subscription List', exact: true })).first(),
      'Subscription Status': page.locator('a[href*="/report/subscriptionStatus"]').or(page.getByRole('link', { name: 'Subscription Status', exact: true })).first(),
      'Mazu Transaction Report': page.locator('a[href*="/report/mazuTransaction"]').or(page.getByRole('link', { name: 'Mazu Transaction Report', exact: true })).first(),
      'Recurring Payments': page.locator('a[href*="/report/recurringPayments"]').or(page.getByRole('link', { name: 'Recurring Payments', exact: true })).first(),
      'Suspicious License Activation': page.locator('a[href*="/report/suspiciousActivation"]').or(page.getByRole('link', { name: 'Suspicious License Activation', exact: true })).first(),
      'Transfer License': page.locator('a[href*="/report/transferlicence"]').or(page.getByRole('link', { name: 'Transfer License', exact: true })).first(),
      'Unused Serial No': page.locator('a[href*="/report/unusedserialno"]').or(page.getByRole('link', { name: 'Unused Serial No', exact: true })).first(),
      'Version 17 & 18 Report': page.locator('a[href*="/report/ver1718Sub"]').or(page.getByRole('link', { name: 'Version 17 & 18 Report', exact: true })).first(),
      'Recom Order Consumption': page.locator('a[href*="/report/recomorderconsumption"]').or(page.getByRole('link', { name: 'Recom Order Consumption', exact: true })).first(),
      'Download Page': page.locator('a[href*="/report/download"]').or(page.getByRole('link', { name: /Download/i })).first()
    };

    // --- Common Page Elements ---
    this.pageHeading = page.locator('h1, h2, h3, h4, h5, .page-title, [class*="heading"]').first();
    this.submitButton = page.getByRole('button', { name: 'Submit' }).or(page.locator('button[type="submit"]')).first();
    this.searchButton = page.getByRole('button', { name: 'Search' }).or(page.locator('button:has(.material-icons:has-text("search"))')).first();
    this.inPageDownloadButton = page.getByRole('button', { name: /Download|Download Excel/i })
      .or(page.locator('button:has(img[title*="Download" i])'))
      .or(page.locator('button:has-text("Download")'))
      .first();

    // --- Filter Controls ---
    this.dateRangeButtons = page.locator('button:has(.material-icons:has-text("date_range")), button[aria-label*="date" i]');
    this.firstDateRangeButton = this.dateRangeButtons.first();
    this.secondDateRangeButton = this.dateRangeButtons.nth(1);
    this.calendarDays = (day) => page.getByRole('button', { name: String(day), exact: true });
    this.allSelectDropdowns = page.locator('select, [role="combobox"]');
    this.searchInput = page.locator('input[placeholder*="Search" i], input[placeholder*="Subscription ID" i], input[type="text"]').first();

    // --- Results & Data Grid Elements ---
    this.dataTable = page.locator('table, [role="grid"], .MuiDataGrid-root');
    this.tableHeaders = page.locator('th, [role="columnheader"]');
    this.tableRows = page.locator('tbody tr, div[role="row"]:not(:first-child)');
    this.noDataMessage = page.getByText(/No data to display|No Records Found|No data available/i).first();
    this.loadingSpinner = page.locator('.MuiCircularProgress-root, .spinner, .loader, [role="progressbar"]');

    // --- Central Downloads Page Elements (/busy/report/download) ---
    this.downloadPageRefreshButton = page.getByRole('button', { name: 'Select' })
      .or(page.getByTitle('Refresh'))
      .or(page.locator('button:has(.material-icons:has-text("refresh"))'))
      .first();
    this.downloadRows = page.locator('div[role="row"], tbody tr');
    this.downloadFirstDataRow = page.locator('div[role="row"]').nth(1).or(page.locator('tbody tr').first());
    this.downloadFirstRowBtn = this.downloadFirstDataRow.locator('button', { hasText: 'Download' }).first();
  }

  /**
   * Helper to get a specific report link locator by name
   * @param {string} reportName 
   * @returns {import('@playwright/test').Locator}
   */
  getReportLink(reportName) {
    if (this.reportLinks[reportName]) {
      return this.reportLinks[reportName];
    }
    return this.page.getByRole('link', { name: reportName }).or(this.page.locator(`a:has-text("${reportName}")`)).first();
  }

  /**
   * Get locator for a specific row on the downloads page
   * @param {number} rowIndex 1-indexed
   */
  getDownloadRow(rowIndex = 1) {
    return this.page.locator('div[role="row"]').nth(rowIndex).or(this.page.locator('tbody tr').nth(rowIndex - 1));
  }
}

module.exports = { ReportsLocators };

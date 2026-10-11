/**
 * NewActivationsLocators - Centralized locator repository for Analytics -> New Activations Report
 * Follows Enterprise Locator Strategy: data-testid > id > aria/role > placeholder > text > CSS
 */
class NewActivationsLocators {
  constructor(page) {
    this.page = page;

    // --- Navigation & Header ---
    this.menuButton = page.getByRole('button', { name: 'menu' })
      .or(page.locator('button[aria-label="menu"]'))
      .or(page.locator('.menu-icon'))
      .first();

    this.backButton = page.getByRole('button', { name: 'arrow_back' })
      .or(page.locator('button:has(.material-icons:has-text("arrow_back"))'))
      .or(page.locator('button[aria-label="create"]'))
      .first();

    this.pageTitle = page.locator('span:has-text("New Activations"), div:has-text("New Activations"), p:has-text("New Activations")').first();

    // --- Product Selection & Tabs ---
    this.productTabs = {
      desktop: page.locator('.tab0').first(),
      online: page.locator('.tab1').or(page.locator('div:has-text("Online")')).first(),
      mobile: page.locator('.tab2').or(page.locator('div:has-text("Mobile")')).first(),
      recom: page.locator('.tab3').or(page.locator('div:has-text("Recom")')).first(),
      mazu: page.locator('.tab4').or(page.locator('div:has-text("mazu")')).first()
    };

    // Desktop sub-variation dropdown (All, Busy 21, Mandi, Magic)
    this.desktopVariationSelect = page.locator('.tab0 select, select:has(option[value="Busy 21"])').first();

    // --- Metrics KPI Cards ---
    this.metricsContainer = page.locator('div[class*="row"]:has-text("New Activations"), div[class*="MuiGrid"]:has-text("New Activations")').first();
    this.newActivationsTotalCard = page.locator('div:has-text("New Activations")').filter({ hasText: /₹/ }).first();
    this.inClusterCard = page.locator('div:has-text("In Cluster")').first();
    this.outOfClusterCard = page.locator('div:has-text("Out Of Cluster")').first();
    this.installedBySelfCard = page.locator('div:has-text("Installed By Self")').first();
    this.byResellerCard = page.locator('div:has-text("By Reseller")').first();

    // Category KPI Badges
    this.categoryBadges = {
      reg: page.locator('div:has-text("REG")').first(),
      ca: page.locator('div:has-text("CA")').first(),
      acc: page.locator('div:has-text("ACC")').first(),
      tp: page.locator('div:has-text("TP")').first(),
      foc: page.locator('div:has-text("FOC")').first()
    };

    // --- Filter Controls ---
    this.allAutocompleteInputs = page.locator('.MuiAutocomplete-root input');
    this.autocompletePopupButtons = page.locator('.MuiAutocomplete-root button[title="Open"]');
    this.autocompletePopperList = page.locator('.MuiAutocomplete-popper li, [role="listbox"] li, .MuiAutocomplete-option');

    // Dynamic month inputs when Month Range is chosen
    this.startMonthInput = page.locator('input#startMonth').first();
    this.endMonthInput = page.locator('input#endMonth').first();

    // Named inputs
    this.timePeriodInput = page.locator('input#timePeriod').or(this.allAutocompleteInputs.nth(0)).first();
    this.statusInput = page.locator('input#status').or(this.allAutocompleteInputs.nth(1)).first();
    this.installedByInput = page.locator('input#installedBy').first();

    this.applyFiltersButton = page.getByRole('button', { name: 'Apply Filters' })
      .or(page.locator('button:has-text("Apply Filters")'))
      .first();

    // --- Download / Export Elements ---
    this.downloadExcelButton = page.locator('button:has(img[title="Download Excel"]), button[title="Download Excel"], img[title="Download Excel"]').first();

    // --- Data Table & Grid ---
    this.tableContainer = page.locator('table, [role="grid"], div[class*="table"]').first();
    this.tableHeaders = page.locator('th, div[class*="header"], div[role="columnheader"]');
    this.tableRows = page.locator('tbody tr, div[role="row"]:not(:first-child)');
    this.emptyStateMessage = page.locator('text=/No Record|No data to display|No Records Found/i').first();

    // --- Partner Downloads Page Elements (/partner/report/download) ---
    this.partnerDownloadsTable = page.locator('table, [role="grid"]').first();
    this.partnerDownloadsFirstRow = page.locator('tbody tr, div[role="row"]:not(:first-child)').first();
    this.partnerDownloadsFirstRowDownloadBtn = this.partnerDownloadsFirstRow.locator('button:has-text("Download")').first();
  }
}

module.exports = { NewActivationsLocators };

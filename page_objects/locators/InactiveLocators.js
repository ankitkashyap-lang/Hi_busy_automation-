/**
 * InactiveLocators - Centralized locator repository for Analytics -> Inactive Report
 * Follows Enterprise Locator Strategy: data-testid > id > aria/role > placeholder > text > CSS
 */
class InactiveLocators {
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

    this.pageTitle = page.locator('span:has-text("Inactive"), div:has-text("Inactive"), p:has-text("Inactive")')
      .filter({ hasText: /^Inactive$/i })
      .or(page.locator('text="Inactive"'))
      .first();

    // --- Product Selection ---
    // Inactive report product is fixed to Busy 21 (select disabled)
    this.productSelect = page.locator('select:has(option[value="Busy 21"])')
      .or(page.locator('select.MuiSelect-root'))
      .first();

    // --- Metrics KPI Cards & Badges ---
    this.metricsContainer = page.locator('div[class*="row"]:has-text("Inactive"), div[class*="MuiGrid"]:has-text("Inactive")').first();
    this.inactiveTotalCountCard = page.locator('div:has-text("Inactive")').filter({ hasText: /\d+/ }).first();
    this.totalSubscriptionsSection = page.locator('div:has-text("Total Subscriptions with Customer")').first();
    this.versionSection = page.locator('div:has-text("Version")').first();

    // Category KPI Badges
    this.categoryBadges = {
      reg: page.locator('p:has-text("REG"), div:has-text("REG")').first(),
      ca: page.locator('p:has-text("CA"), div:has-text("CA")').first(),
      acc: page.locator('p:has-text("ACC"), div:has-text("ACC")').first(),
      tp: page.locator('p:has-text("TP"), div:has-text("TP")').first(),
      foc: page.locator('p:has-text("FOC"), div:has-text("FOC")').first()
    };

    // --- Filter Controls (8 Autocomplete dropdowns) ---
    this.allAutocompleteInputs = page.locator('.MuiAutocomplete-root input');
    this.autocompletePopupButtons = page.locator('.MuiAutocomplete-root button[title="Open"]');
    this.autocompletePopperList = page.locator('.MuiAutocomplete-popper li, [role="listbox"] li, .MuiAutocomplete-option');

    // Named Filter Inputs
    this.daysInput = page.locator('input#days').first();
    this.statusInput = page.locator('input#status').first();
    this.modelInput = page.locator('input#model').first();
    // Two inputs have id="version": first is release version (21, 18), second is user type (SU, DU, MU, CS)
    this.releaseVersionInput = page.locator('input#version').nth(0);
    this.userTypeInput = page.locator('input#version').nth(1);
    this.cityInput = page.locator('input#city').first();
    this.installedByInput = page.locator('input#installedBy').first();
    this.categoryInput = page.locator('input#category').first();

    this.applyFiltersButton = page.getByRole('button', { name: 'Apply Filters' })
      .or(page.locator('button:has-text("Apply Filters")'))
      .first();

    // --- Download / Export Elements ---
    this.downloadExcelButton = page.locator('button:has(img[title="Download Excel"]), button[title="Download Excel"], img[title="Download Excel"]').first();

    // --- Data Table & Grid ---
    this.tableContainer = page.locator('div.MuiTableContainer-root, table, [role="grid"]').first();
    this.tableHeaders = page.locator('[role="columnheader"]');
    this.tableRows = page.locator('[role="row"]').filter({ hasNot: page.locator('[role="columnheader"]') });
    this.emptyStateMessage = page.locator('text=/No Record|No data to display|No Records Found/i').first();

    // --- Partner Downloads Page Elements (/partner/report/download) ---
    this.partnerDownloadsTable = page.locator('table, [role="grid"]').first();
    this.partnerDownloadsFirstRow = page.locator('tbody tr, div[role="row"]:not(:first-child)').first();
    this.partnerDownloadsFirstRowDownloadBtn = this.partnerDownloadsFirstRow.locator('button:has-text("Download")').first();
  }
}

module.exports = { InactiveLocators };

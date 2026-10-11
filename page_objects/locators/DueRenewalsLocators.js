/**
 * DueRenewalsLocators - Centralized locator repository for Analytics -> Due Renewals Report
 * Follows Enterprise Locator Strategy: data-testid > id > aria/role > placeholder > text > CSS
 */
class DueRenewalsLocators {
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

    this.pageTitle = page.locator('span:has-text("Due Renewals"), div:has-text("Due Renewals"), p:has-text("Due Renewals")').first();

    // --- Product Selection & Tabs ---
    this.productTabs = {
      desktop: page.locator('.MuiBox-root:has-text("Busy 21"), select:has(option[value="Busy 21"])').first(),
      online: page.locator('.tab1, div:has-text("Online")').first(),
      mobile: page.locator('.tab2, div:has-text("Mobile")').first(),
      recom: page.locator('.tab3, div:has-text("Recom")').first(),
      mazu: page.locator('.tab4, div:has-text("mazu")').first()
    };

    // Desktop sub-variation dropdown (All, Busy 21, Mandi)
    this.desktopVariationSelect = page.locator('select:has(option[value="Busy 21"])').first();

    // --- Metrics KPI Cards ---
    this.metricsContainer = page.locator('div[class*="row"]:has-text("Due Renewals"), div[class*="MuiGrid"]:has-text("Due Renewals")').first();
    this.dueRenewalsTotalCard = page.locator('div:has-text("Due Renewals")').filter({ hasText: /₹/ }).first();
    this.pendingCard = page.locator('div:has-text("Pending")').filter({ hasText: /₹/ }).first();
    this.inGraceCard = page.locator('div:has-text("In Grace")').filter({ hasText: /₹/ }).first();
    this.expiredCard = page.locator('div:has-text("Expired")').filter({ hasText: /₹/ }).first();

    // --- Filter Controls ---
    // 9 Autocomplete inputs on the page:
    // 0: Time Period, 1: Renew Status, 2: Renewed, 3: Model, 4: Version, 5: License Type, 6: City, 7: Installed By, 8: Category
    this.allAutocompleteInputs = page.locator('.MuiAutocomplete-root input');
    this.autocompletePopupButtons = page.locator('.MuiAutocomplete-root button[title="Open"]');
    this.autocompletePopperList = page.locator('.MuiAutocomplete-popper li, [role="listbox"] li, .MuiAutocomplete-option');

    this.filterTimePeriodInput = this.allAutocompleteInputs.nth(0);
    this.filterRenewStatusInput = this.allAutocompleteInputs.nth(1);
    this.filterTimesRenewedInput = this.allAutocompleteInputs.nth(2);
    this.filterModelInput = this.allAutocompleteInputs.nth(3);
    this.filterVersionInput = this.allAutocompleteInputs.nth(4);
    this.filterLicenseTypeInput = this.allAutocompleteInputs.nth(5);
    this.filterCityInput = this.allAutocompleteInputs.nth(6);
    this.filterInstalledByInput = this.allAutocompleteInputs.nth(7);
    this.filterCategoryInput = this.allAutocompleteInputs.nth(8);

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

module.exports = { DueRenewalsLocators };

/**
 * TransferInLocators - Centralized locator repository for Analytics -> Transfer In Report
 * Follows Enterprise Locator Strategy: data-testid > id > aria/role > placeholder > text > CSS
 */
class TransferInLocators {
  constructor(page) {
    this.page = page;

    // --- Navigation & Header ---
    this.menuButton = page.getByRole('button', { name: 'menu' })
      .or(page.locator('button[aria-label="menu"]'))
      .or(page.locator('.menu-icon'))
      .first();

    this.backButton = page.getByRole('button', { name: 'arrow_back' })
      .or(page.locator('button:has(.material-icons:has-text("arrow_back"))'))
      .or(page.locator('button[title="Back"]'))
      .or(page.locator('button[aria-label="create"]'))
      .first();

    this.pageTitle = page.locator('p:has-text("Transfer In"), span:has-text("Transfer In"), div:has-text("Transfer In")')
      .filter({ hasText: /Transfer In/i })
      .first();

    // --- Metrics KPI Cards & Badges ---
    this.metricsContainer = page.locator('div:has-text("Transfer In")').first();
    this.transferInTotalCard = page.locator('div:has-text("Transfer In")').filter({ hasText: /\d+/ }).first();
    this.perpetualCountCard = page.locator('div:has-text("Perpetual")').first();
    this.subscriptionCountCard = page.locator('div:has-text("Subscription")').first();
    this.categoryBadges = {
      reg: page.locator('div:has-text("REG")').first(),
      ca: page.locator('div:has-text("CA")').first(),
      acc: page.locator('div:has-text("ACC")').first(),
      tp: page.locator('div:has-text("TP")').first(),
      foc: page.locator('div:has-text("FOC")').first(),
      expired: page.locator('div:has-text("Expired")').first()
    };

    // --- Product Selection ---
    // Transfer In report product is fixed to Busy 21 (select disabled)
    this.productSelect = page.locator('select:has(option[value="Busy 21"])')
      .or(page.locator('select.MuiSelect-root'))
      .or(page.locator('select'))
      .first();

    // --- Filter Controls (8 Autocomplete dropdowns) ---
    this.allAutocompleteInputs = page.locator('.MuiAutocomplete-root input');
    this.autocompletePopupButtons = page.locator('.MuiAutocomplete-root button[title="Open"]');
    this.autocompletePopperList = page.locator('.MuiAutocomplete-popper li, [role="listbox"] li, .MuiAutocomplete-option');

    // Named Filter Inputs
    this.timePeriodInput = page.locator('input#timePeriod').first();
    this.statusInput = page.locator('input#status').first();
    // In UI, the label is "Transferred From" but the element id is "transferredTo"
    this.transferredFromInput = page.locator('input#transferredTo').first();
    this.modelInput = page.locator('input#model').first();
    // Two inputs have id="version": index 0 is Version, index 1 is User
    this.versionInput = page.locator('input#version').nth(0);
    this.userInput = page.locator('input#version').nth(1);
    this.cityInput = page.locator('input#city').first();
    this.installedByInput = page.locator('input#installedBy').first();

    this.applyFiltersButton = page.getByRole('button', { name: 'Apply Filters' })
      .or(page.locator('button:has-text("Apply Filters")'))
      .first();

    // --- Download / Export Elements ---
    this.downloadExcelButton = page.locator('button:has(img[title="Download Excel"]), button[title="Download Excel"], img[title="Download Excel"]').first();

    // --- Data Table & Grid ---
    this.tableContainer = page.locator('div.MuiTableContainer-root, table, [role="grid"]').first();
    this.tableHeaders = page.locator('.MuiTableRow-head [role="columnheader"]');
    this.installDateSortButton = page.locator('.MuiTableRow-head button[aria-label="menu"]').first();
    this.tableRows = page.locator('.MuiTableBody-root [role="row"], tbody tr').filter({ hasNot: page.locator('[role="columnheader"]') });
    this.emptyStateMessage = page.locator('text=/No Record|No data to display|No Records Found/i').first();

    // --- Partner Downloads Page Elements (/partner/report/download) ---
    this.partnerDownloadsTable = page.locator('table, [role="grid"]').first();
    this.partnerDownloadsFirstRow = page.locator('tbody tr, div[role="row"]:not(:first-child)').first();
    this.partnerDownloadsFirstRowDownloadBtn = this.partnerDownloadsFirstRow.locator('button:has-text("Download")').first();
  }
}

module.exports = { TransferInLocators };

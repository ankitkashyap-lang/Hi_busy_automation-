class PartnerProfileLocators {
    constructor(page) {
        this.page = page;

        // --- Header Section ---
        this.closeButton = page.locator('#slide-close-btn');
        
        // --- Top Summary Section ---
        this.partnerNameLabel = page.locator('#details-header-name-0-0-value');
        this.partnerTierLabel = page.locator('#details-header-partner-tier-1-0-value');
        this.dealerIdLabel = page.locator('#details-header-dealer-id-2-0-value');
        this.pinLabel = page.locator('#details-header-pin-2-1-value');
        this.gstinLabel = page.locator('#details-header-gstin-4-0-value');
        
        // --- Navigation Tabs ---
        this.userInfoTab = page.locator('#details-tab-user-info-0');
        this.partnerInfoTab = page.locator('#details-tab-partner-info-1');
        this.gstTab = page.locator('#details-tab-gst-2');
        this.invoiceTab = page.locator('#details-tab-invoice-3');
        this.walletTab = page.locator('#details-tab-wallet-4');
        this.creditTab = page.locator('#details-tab-credit-5');
        this.paymentsTab = page.locator('#details-tab-payments-6');
        this.roleTab = page.locator('#details-tab-role-7');
        this.othersTab = page.locator('#details-tab-others-8');

        // --- User Info Tab Panel ---
        // We scope to the panel because both tabs share the exact same input IDs (e.g. #details-text-contact-person-0-0-input)
        this.userInfoPanel = page.locator('#details-tabpanel-0');
        this.userInfoNameInput = this.userInfoPanel.locator('#details-text-contact-person-0-0-input');
        this.userInfoMobileInput = this.userInfoPanel.locator('#details-text-mobile-1-0-input');
        this.userInfoEmailInput = this.userInfoPanel.locator('#details-text-email-2-0-input');
        this.userInfoRoleValueLabel = this.userInfoPanel.locator('#details-select-name-3-0-value');
        this.userInfoRoleSelectButton = this.userInfoPanel.locator('#details-select-name-3-0-open-btn');

        // --- Partner Info Tab Panel ---
        // Scoped to #details-tabpanel-1 to avoid Strict Mode Violations
        this.partnerInfoPanel = page.locator('#details-tabpanel-1');
        this.partnerInfoNameInput = this.partnerInfoPanel.locator('#details-text-contact-person-0-0-input');
        this.partnerInfoMobileInput = this.partnerInfoPanel.locator('#details-text-mobile-1-0-input');
        this.partnerInfoEmailInput = this.partnerInfoPanel.locator('#details-text-email-2-0-input');
        this.partnerInfoCreationDateInput = this.partnerInfoPanel.locator('#details-text-created-at-3-0-input');
        this.partnerInfoCreatedByInput = this.partnerInfoPanel.locator('#details-text-created-by-4-0-input');

        // --- GST Tab Panel ---
        // Developers haven't added IDs here yet, so falling back to structural label-based locating (scoping to the panel)
        this.gstPanel = page.locator('#details-tabpanel-2');
        this.gstUsernameInput = this.gstPanel.locator('div').filter({ has: page.locator('label', { hasText: /^Username/ }) }).locator('input');
        this.gstPasswordInput = this.gstPanel.locator('div').filter({ has: page.locator('label', { hasText: /^Password/ }) }).locator('input');
        this.gstUpdateButton = this.gstPanel.locator('button', { hasText: 'Update' });

        // --- Invoice Tab Panel ---
        // Using IDs as per priority 1 where available
        this.invoicePanel = page.locator('#details-tabpanel-3');
        this.nextInvoiceNoInput = this.invoicePanel.locator('#details-text-next-available-inv-no-0-0-input');
        this.nextSalesReturnNoInput = this.invoicePanel.locator('#details-text-next-available-sr-no-1-0-input');
        
        // These don't have specific IDs, so we use accessible stable text locators scoped to the panel
        this.dailyFrequencyButton = this.invoicePanel.locator('button', { hasText: 'Daily' });
        this.weeklyFrequencyButton = this.invoicePanel.locator('button', { hasText: 'Weekly' });
        this.monthlyFrequencyButton = this.invoicePanel.locator('button', { hasText: 'Monthly' });

        // --- Wallet Tab Panel ---
        this.walletPanel = page.locator('#details-tabpanel-4');
        
        // Action Buttons (Using priority 4/5 since no IDs exist for these specific interactive chips)
        this.walletTransferAcButton = this.walletPanel.locator('.MuiChip-clickable', { hasText: 'Transfer AC' });
        this.walletAddAcButton = this.walletPanel.locator('.MuiChip-clickable', { hasText: 'Add AC' });
        this.walletFilterButton = this.walletPanel.locator('span[title="Filter"] button');
        
        // Balance & Export
        this.walletBalanceContainer = this.walletPanel.locator('div', { hasText: 'AC Balance:' });
        this.walletDownloadExcelButton = this.walletPanel.locator('img[title="Download Excel"]');
        
        // Transactions Table
        this.walletTable = this.walletPanel.locator('.MuiTable-root');
        // Targets the rows inside the table body
        this.walletTableRows = this.walletTable.locator('div[role="rowgroup"]').last().locator('div[role="row"]');

        // Wallet Filter Panel Fields
        this.walletFilterSubIdInput = this.walletPanel.locator('div').filter({ has: page.locator('label', { exact: true, hasText: 'Sub ID / Serial No.' }) }).locator('input');
        this.walletFilterDeviceIdInput = this.walletPanel.locator('div').filter({ has: page.locator('label', { exact: true, hasText: 'Device ID, Transacted By Partner or User' }) }).locator('input');
        this.walletFilterDateRangeInput = this.walletPanel.locator('div').filter({ has: page.locator('label', { exact: true, hasText: 'Date Range' }) }).locator('input');
        this.walletFilterDateRangeButton = this.walletPanel.locator('div').filter({ has: page.locator('label', { exact: true, hasText: 'Date Range' }) }).locator('button');
        
        this.walletFilterTypeSelect = this.walletPanel.locator('div').filter({ has: page.locator('label', { exact: true, hasText: 'Type' }) }).locator('select');
        this.walletFilterProductSelect = this.walletPanel.locator('div').filter({ has: page.locator('label', { exact: true, hasText: 'Product' }) }).locator('select');
        
        this.walletFilterSubmitButton = this.walletPanel.locator('button', { hasText: 'Submit' });
        this.walletFilterResetButton = this.walletPanel.locator('button', { hasText: 'Reset' });

        // Wallet Transfer AC Drawer Fields
        this.walletTransferToInput = this.walletPanel.locator('div').filter({ has: page.locator('label', { hasText: /^Transfer To/ }) }).locator('input');
        this.walletTransferAcInput = this.walletPanel.locator('div').filter({ has: page.locator('label', { hasText: /^AC/ }) }).locator('input');
        this.walletTransferNarrationInput = this.walletPanel.locator('div').filter({ has: page.locator('label', { hasText: /^Narration/ }) }).locator('textarea').first();
        this.walletTransferSubmitButton = this.walletPanel.locator('button', { hasText: 'Transfer Now' });
        this.walletTransferCloseButton = this.walletPanel.locator('span[title="Close"] button');

        // --- Credit Tab Panel ---
        this.creditPanel = page.locator('#details-tabpanel-5');

        // Summary Values (We will parse the text content in Actions)
        this.creditLimitText = this.creditPanel.locator('tablecell, td').filter({ hasText: /^Credit Limit:/ });
        this.creditAvailableText = this.creditPanel.locator('tablecell, td').filter({ hasText: /^Available:/ }).first();
        this.creditOverdueAmountText = this.creditPanel.locator('tablecell, td').filter({ hasText: /^Overdue Amount:/ });
        
        // Export & Filter
        this.creditFilterButton = this.creditPanel.locator('span[title="Filter"] button');
        this.creditDownloadExcelButton = this.creditPanel.locator('img[title="Download Excel"]');
        this.creditDownloadPdfButton = this.creditPanel.locator('img[title="Credit & Overdue Policy"]');

        // Ledger Transactions Table (The main data grid uses div[role="table"] while summaries use <table>)
        this.creditLedgerTable = this.creditPanel.locator('div[role="table"]');
        this.creditLedgerRows = this.creditLedgerTable.locator('div[role="rowgroup"]').last().locator('div[role="row"]');

        // --- Payments Tab Panel ---
        this.paymentsPanel = page.locator('#details-tabpanel-6');
        
        // Filter Button
        this.paymentsFilterButton = this.paymentsPanel.locator('span[title="Filter"] button');

        // Payments Transactions Table
        this.paymentsTable = this.paymentsPanel.locator('div[role="table"]');
        this.paymentsTableRows = this.paymentsTable.locator('div[role="rowgroup"]').last().locator('div[role="row"]');

        // --- Role Tab Panel ---
        this.rolePanel = page.locator('#details-tabpanel-7');

        // Name Field (Using Priority 1 IDs provided in the DOM)
        this.roleNameValue = this.rolePanel.locator('#details-select-name-0-0-value');
        this.roleNameOpenBtn = this.rolePanel.locator('#details-select-name-0-0-open-btn');

        // --- Others Tab Panel ---
        this.othersPanel = page.locator('#details-tabpanel-8');

        // Type (Partner/Reseller) buttons
        this.othersTypePartnerBtn = this.othersPanel.locator('#details-field-partnerresellertype-0-0 button', { hasText: 'Partner' });
        this.othersTypeResellerBtn = this.othersPanel.locator('#details-field-partnerresellertype-0-0 button', { hasText: 'Reseller' });

        // Status
        this.othersStatusNonCompliantBtn = this.othersPanel.locator('#details-field-partnerstatus-1-0 button', { hasText: 'Non-Compliant' });

        // Toggles / Radios (Using exact IDs)
        this.othersTcsApplicableBtn = this.othersPanel.locator('#details-radio-tcsapplicable-3-0');
        this.othersIsNewBtn = this.othersPanel.locator('#details-radio-isnew-4-0');
        this.othersIsRetailBtn = this.othersPanel.locator('#details-radio-isretail-5-0');

        // Address Area (Using exact ID)
        this.othersAddressInput = this.othersPanel.locator('#details-text-area-address-6-0-input');

        // --- Side Drawer (e.g., Transfer To Selection) ---
        // Scoped to the drawer paper to prevent conflicts if main page has similar IDs
        this.drawerPanel = page.locator('.MuiDrawer-paper');
        this.drawerCloseIcon = this.drawerPanel.locator('#drawer-close-btn');
        this.drawerSearchInput = this.drawerPanel.locator('#drawer-search-input');
        this.drawerResultCount = this.drawerPanel.locator('#drawer-result-count');
        this.drawerActionBtn = this.drawerPanel.locator('#drawer-action-btn'); // The bottom action button (e.g. "Close")
        
        // Drawer Listing Elements
        this.drawerListing = this.drawerPanel.locator('#drawer-listing');
        // Dynamic matches for any item select button (id ends with "-select-btn")
        this.drawerResultButtons = this.drawerListing.locator('button[id$="-select-btn"]');
    }
}

module.exports = { PartnerProfileLocators };

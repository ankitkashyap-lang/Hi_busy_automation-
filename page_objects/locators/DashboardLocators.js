class DashboardLocators {
    constructor(page) {
        this.page = page;

        // --- Search Bar ---
        // These don't have test-ids, so falling back to robust attributes like placeholder/roles/text
        this.searchInput = page.locator('input[placeholder="Enter Subscription ID, Mobile, Email or GSTIN"]');
        this.searchButton = page.locator('button:has(.material-icons:has-text("search"))');
        
        // --- Top Action Buttons ---
        this.addAcButton = page.locator('button:has-text("Add AC")').first();
        this.transferAcButton = page.locator('button:has-text("Transfer AC")').first();
        
        // --- Navigation Tabs ---
        // Using the data-testid attributes added by the developers
        this.dashboardTabsContainer = page.getByTestId('partner-dashboard-tabs');
        this.desktopTab = page.getByTestId('partner-dashboard-tab-desktop');
        this.onlineTab = page.getByTestId('partner-dashboard-tab-online');
        this.mobileTab = page.getByTestId('partner-dashboard-tab-mobile');
        this.recomTab = page.getByTestId('partner-dashboard-tab-recom');
        this.mazuTab = page.getByTestId('partner-dashboard-tab-mazu');
        this.busyMagicTab = page.getByTestId('partner-dashboard-tab-busy-magic');

        // --- License Type Selection ---
        this.productSelectDropdown = page.getByTestId('partner-dashboard-product-select');
        this.perpetualButton = page.locator('button:has-text("Perpetual")');
        this.subscriptionButton = page.locator('button:has-text("Subscription")');
        
        // --- Serial Number Renewal/Upgrade Section ---
        this.serialNumberInput = page.locator('input[placeholder="Enter Serial Number"]');
        this.renewButton = page.locator('button:has-text("Renew")');
        this.upgradeButton = page.locator('button:has-text("Upgrade")');
        this.viewHistoryButton = page.locator('button:has-text("View History")');
        
        // --- Balance Overview & Links ---
        this.walletBalanceValue = page.locator('div:has-text("Wallet Bal.") + div');
        this.viewWalletLink = page.locator('a', { hasText: 'View Wallet' });

        this.creditBalanceValue = page.locator('div:has-text("Credit Bal.") + div');
        this.viewCreditInfoLink = page.locator('a', { hasText: 'View Credit Info' });

        this.ledgerBalanceValue = page.locator('div:has-text("Ledger Bal.") + div');
        this.viewLedgerLink = page.locator('a', { hasText: 'View Ledger' });
        
        // --- Dashboard Stats Cards ---
        this.newActivationsCard = page.locator('div.MuiPaper-root').filter({ hasText: 'New Activations' });
        this.upgradesCard = page.locator('div.MuiPaper-root').filter({ hasText: 'Upgrades' });
        this.retainedCard = page.locator('div.MuiPaper-root').filter({ hasText: 'Retained' });
        this.inactiveCard = page.locator('div.MuiPaper-root').filter({ hasText: 'Inactive' });
        this.dueRenewalsCard = page.locator('div.MuiPaper-root').filter({ hasText: 'Due Renewals' });
        this.dueFor720DaysExtensionCard = page.locator('div.MuiPaper-root').filter({ hasText: 'Due for 720 days Extension' });
        this.transferInCard = page.locator('div.MuiPaper-root').filter({ hasText: 'Transfer In' });
        this.transferOutCard = page.locator('div.MuiPaper-root').filter({ hasText: 'Transfer Out' });
        this.expiredRenewalsCard = page.locator('div.MuiPaper-root').filter({ hasText: 'Expired Renewals' });
        this.extraRenewOppCard = page.locator('div.MuiPaper-root').filter({ hasText: 'Extra Renew Opp' });
    }
}

module.exports = { DashboardLocators };

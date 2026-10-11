class MobileDashboardLocators {
    constructor(page) {
        this.page = page;

        // --- Navigation ---
        // This confirms we are looking at the mobile dashboard view
        this.mobileTab = page.getByTestId('partner-dashboard-tab-mobile');
        
        // --- Serial Number Section ---
        this.serialNumberInput = page.locator('input[placeholder="Enter Serial Number"]');
        this.newButton = page.locator('button:has-text("New")');
        this.renewButton = page.locator('button:has-text("Renew")');

        // --- Consumption Section ---
        this.consumptionSection = page.locator('div').filter({ hasText: /^Consumption$/ }).locator('..');
        this.consumptionLastMonthValue = this.consumptionSection.locator('div').filter({ hasText: /^Last Month$/ }).locator('+ div');
        this.consumptionThisMonthValue = this.consumptionSection.locator('div').filter({ hasText: /^This Month$/ }).locator('+ div');
        this.consumptionTodayValue = this.consumptionSection.locator('div').filter({ hasText: /^Today$/ }).locator('+ div');

        // --- Credit Limit Section ---
        this.creditLimitSection = page.locator('div').filter({ hasText: /^Credit Limit \(Equivalent to ACs\)$/ }).locator('..');
        this.creditLimitTotalValue = this.creditLimitSection.locator('div').filter({ hasText: /^Total$/ }).locator('+ div');
        this.creditLimitUsedValue = this.creditLimitSection.locator('div').filter({ hasText: /^Used$/ }).locator('+ div');
        this.downloadCreditPolicyButton = page.locator('button', { hasText: 'Download Credit & Overdue Policy' });

        // --- Chart Stats ---
        this.chartBusy21Stat = page.locator('span', { hasText: /^Busy 21 :/ });
        this.chartOnlineStat = page.locator('span', { hasText: /^Online :/ });
        this.chartAppStat = page.locator('span', { hasText: /^App :/ });
        this.chartRecomStat = page.locator('span', { hasText: /^Recom :/ });
        this.chartBusyMagicStat = page.locator('span', { hasText: /^Busy Magic :/ });
        
        // Target the container that holds Total and Subscriptions, then get its first child (which is the number)
        this.chartTotalSubscriptionsValue = page.locator('div').filter({ has: page.locator('div', { exact: true, hasText: 'Total' }) }).filter({ has: page.locator('div', { exact: true, hasText: 'Subscriptions' }) }).locator('div').first();
        
        // --- Dashboard Stats Cards ---
        this.newActivationsCard = page.locator('div.MuiPaper-root').filter({ hasText: 'New Activations' });
        this.upgradesCard = page.locator('div.MuiPaper-root').filter({ hasText: 'Upgrades' });
        this.dueRenewalsCard = page.locator('div.MuiPaper-root').filter({ hasText: 'Due Renewals' });
        this.expiredRenewalsCard = page.locator('div.MuiPaper-root').filter({ hasText: 'Expired Renewals' });
    }
}

module.exports = { MobileDashboardLocators };

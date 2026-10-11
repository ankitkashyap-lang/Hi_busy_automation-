const { DashboardLocators } = require('../locators/DashboardLocators');

class DashboardActions {
    constructor(page) {
        this.page = page;
        this.locators = new DashboardLocators(page);
    }

    // --- Search Actions ---
    async searchFor(query) {
        await this.locators.searchInput.fill(query);
        await this.locators.searchButton.click();
    }

    // --- Top Action Buttons ---
    async clickAddAc() {
        await this.locators.addAcButton.click();
    }

    async clickTransferAc() {
        await this.locators.transferAcButton.click();
    }

    // --- Tab Navigation Actions ---
    async selectDesktopTab() {
        await this.locators.desktopTab.click();
    }

    async selectOnlineTab() {
        await this.locators.onlineTab.click();
    }

    async selectMobileTab() {
        await this.locators.mobileTab.click();
    }

    async selectRecomTab() {
        await this.locators.recomTab.click();
    }

    async selectMazuTab() {
        await this.locators.mazuTab.click();
    }

    async selectBusyMagicTab() {
        await this.locators.busyMagicTab.click();
    }

    // --- License Filter Actions ---
    async selectProductDropdown() {
        await this.locators.productSelectDropdown.click();
    }

    async clickPerpetual() {
        await this.locators.perpetualButton.click();
    }

    async clickSubscription() {
        await this.locators.subscriptionButton.click();
    }

    // --- Serial Number Actions ---
    async renewSerialNumber(serialNumber) {
        await this.locators.serialNumberInput.fill(serialNumber);
        await this.locators.renewButton.click();
    }

    async upgradeSerialNumber(serialNumber) {
        await this.locators.serialNumberInput.fill(serialNumber);
        await this.locators.upgradeButton.click();
    }

    async viewHistory() {
        await this.locators.viewHistoryButton.click();
    }
    
    // --- Balance and Navigation Links ---
    async getWalletBalance() {
        return await this.locators.walletBalanceValue.textContent();
    }

    async viewWallet() {
        await this.locators.viewWalletLink.click();
    }

    async getCreditBalance() {
        return await this.locators.creditBalanceValue.textContent();
    }

    async viewCreditInfo() {
        await this.locators.viewCreditInfoLink.click();
    }

    async getLedgerBalance() {
        return await this.locators.ledgerBalanceValue.textContent();
    }

    async viewLedger() {
        await this.locators.viewLedgerLink.click();
    }

    // --- Stats Card Actions ---
    // Methods to click into or read values from the specific summary cards
    async clickNewActivationsCard() {
        await this.locators.newActivationsCard.click();
    }

    async clickUpgradesCard() {
        await this.locators.upgradesCard.click();
    }
    
    async clickRetainedCard() {
        await this.locators.retainedCard.click();
    }
    
    async clickInactiveCard() {
        await this.locators.inactiveCard.click();
    }
    
    async clickDueRenewalsCard() {
        await this.locators.dueRenewalsCard.click();
    }

    async clickDueFor720DaysExtensionCard() {
        await this.locators.dueFor720DaysExtensionCard.click();
    }
    
    async clickTransferInCard() {
        await this.locators.transferInCard.click();
    }
    
    async clickTransferOutCard() {
        await this.locators.transferOutCard.click();
    }
    
    async clickExpiredRenewalsCard() {
        await this.locators.expiredRenewalsCard.click();
    }
    
    async clickExtraRenewOppCard() {
        await this.locators.extraRenewOppCard.click();
    }
}

module.exports = { DashboardActions };

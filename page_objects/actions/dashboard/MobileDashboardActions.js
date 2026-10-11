const { MobileDashboardLocators } = require('../../locators/dashboard/MobileDashboardLocators');

class MobileDashboardActions {
    constructor(page) {
        this.page = page;
        this.locators = new MobileDashboardLocators(page);
    }

    // --- Serial Number Actions ---
    async newSerialNumber(serialNumber) {
        await this.locators.serialNumberInput.fill(serialNumber);
        await this.locators.newButton.click();
    }

    async renewSerialNumber(serialNumber) {
        await this.locators.serialNumberInput.fill(serialNumber);
        await this.locators.renewButton.click();
    }

    // --- Consumption Getters ---
    async getConsumptionLastMonth() {
        return await this.locators.consumptionLastMonthValue.textContent();
    }

    async getConsumptionThisMonth() {
        return await this.locators.consumptionThisMonthValue.textContent();
    }

    async getConsumptionToday() {
        return await this.locators.consumptionTodayValue.textContent();
    }

    // --- Credit Limit Getters & Actions ---
    async getCreditLimitTotal() {
        return await this.locators.creditLimitTotalValue.textContent();
    }

    async getCreditLimitUsed() {
        return await this.locators.creditLimitUsedValue.textContent();
    }

    async downloadCreditPolicy() {
        await this.locators.downloadCreditPolicyButton.click();
    }

    // --- Chart Stats ---
    async getChartBusy21Stat() {
        return await this.locators.chartBusy21Stat.textContent();
    }

    async getChartOnlineStat() {
        return await this.locators.chartOnlineStat.textContent();
    }

    async getChartAppStat() {
        return await this.locators.chartAppStat.textContent();
    }

    async getChartRecomStat() {
        return await this.locators.chartRecomStat.textContent();
    }

    async getChartBusyMagicStat() {
        return await this.locators.chartBusyMagicStat.textContent();
    }

    async getChartTotalSubscriptions() {
        return await this.locators.chartTotalSubscriptionsValue.textContent();
    }

    // --- Stats Card Actions ---
    async clickNewActivationsCard() {
        await this.locators.newActivationsCard.click();
    }

    async clickUpgradesCard() {
        await this.locators.upgradesCard.click();
    }
    
    async clickDueRenewalsCard() {
        await this.locators.dueRenewalsCard.click();
    }
    
    async clickExpiredRenewalsCard() {
        await this.locators.expiredRenewalsCard.click();
    }
}

module.exports = { MobileDashboardActions };

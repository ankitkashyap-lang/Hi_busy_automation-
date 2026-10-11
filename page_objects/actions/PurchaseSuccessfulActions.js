const { PurchaseSuccessfulLocators } = require('../locators/PurchaseSuccessfulLocators');

class PurchaseSuccessfulActions {
    constructor(page) {
        this.page = page;
        this.locators = new PurchaseSuccessfulLocators(page);
    }

    async goBack() {
        await this.locators.backButton.click();
    }

    async getSubscriptionSummary() {
        return await this.locators.subscriptionSummary.textContent();
    }

    async getAcsConsumed() {
        return await this.locators.acsConsumed.textContent();
    }

    async claimBundleOffer() {
        await this.locators.claimOfferButton.click();
    }

    async copySerialNumber() {
        await this.locators.serialNumberCopyBtn.click();
    }

    async copyActivationKey() {
        await this.locators.activationKeyCopyBtn.click();
    }
}

module.exports = { PurchaseSuccessfulActions };

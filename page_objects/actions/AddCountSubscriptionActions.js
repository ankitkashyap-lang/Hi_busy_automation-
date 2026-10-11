const { AddCountSubscriptionLocators } = require('../locators/AddCountSubscriptionLocators');

class AddCountSubscriptionActions {
    constructor(page) {
        this.page = page;
        this.locators = new AddCountSubscriptionLocators(page);
    }

    async goBack() {
        await this.locators.backButton.click();
    }

    async goForward() {
        await this.locators.forwardChevronButton.click();
    }

    /**
     * Set the count of a specific subscription package.
     * @param {string} packageName - e.g. "Emerald" 
     * @param {string|number} count - The quantity you want to add
     */
    async setPackageCount(packageName, count) {
        const input = this.locators.getPackageCountInput(packageName);
        await input.fill(count.toString());
    }

    async clickPurchase() {
        await this.locators.purchaseButton.click();
    }
}

module.exports = { AddCountSubscriptionActions };

const { PerpetualPurchaseLocators } = require('../locators/PerpetualPurchaseLocators');

class PerpetualPurchaseActions {
    constructor(page) {
        this.page = page;
        this.locators = new PerpetualPurchaseLocators(page);
    }

    // --- Header Actions ---
    async goBack() {
        await this.locators.backButton.click();
    }

    // --- Dropdown Selections ---
    async selectTenure(tenureValue) {
        // e.g. tenureValue: '360' or '1080'
        await this.locators.tenureSelect.selectOption(tenureValue);
    }

    async selectRegion(regionValue) {
        // e.g. regionValue: 'India'
        await this.locators.regionSelect.selectOption(regionValue);
    }

    async selectCategory(categoryValue) {
        // e.g. categoryValue: 'Regular', 'CA', 'FOC'
        await this.locators.categorySelect.selectOption(categoryValue);
    }

    // --- Package Quantity Actions ---
    /**
     * Fills the quantity for a specific package type.
     * @param {string} packageLevel - "Basic", "Standard", or "Enterprise"
     * @param {string} userType - "Single User", "Multi User", or "Client Server"
     * @param {string|number} quantity - The amount to purchase
     */
    async setPackageQuantity(packageLevel, userType, quantity) {
        const inputLocator = this.locators.getPackageInput(packageLevel, userType);
        await inputLocator.fill(quantity.toString());
    }

    /**
     * Convenience methods for specific package combinations
     */
    async setBasicSingleUser(quantity) {
        await this.setPackageQuantity('Basic', 'Single User', quantity);
    }

    async setStandardMultiUser(quantity) {
        await this.setPackageQuantity('Standard', 'Multi User', quantity);
    }

    async setEnterpriseClientServer(quantity) {
        await this.setPackageQuantity('Enterprise', 'Client Server', quantity);
    }

    // --- Footer Actions ---
    async getTotalAcs() {
        return await this.locators.totalAcsLabel.textContent();
    }

    async clickPurchase() {
        await this.locators.purchaseButton.click();
    }
}

module.exports = { PerpetualPurchaseActions };

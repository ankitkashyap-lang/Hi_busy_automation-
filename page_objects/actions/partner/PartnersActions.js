const { PartnersLocators } = require('../../locators/partner/PartnersLocators');

class PartnersActions {
    constructor(page) {
        this.page = page;
        this.locators = new PartnersLocators(page);
    }

    async searchFor(query) {
        await this.locators.searchInput.fill(query);
        await this.locators.searchButton.click();
    }

    async toggleFilters() {
        await this.locators.toggleFiltersButton.click();
    }

    async exportPartners() {
        await this.locators.downloadButton.click();
    }

    // Grid Item Actions
    async clickPartnerName(rowId) {
        await this.locators.getListItemName(rowId).click();
    }

    async callPartner(rowId) {
        await this.locators.getListItemCallButton(rowId).click();
    }

    async openPartnerOptions(rowId) {
        await this.locators.getListItemOptionsButton(rowId).click();
    }

    async selectPartner(rowId) {
        await this.locators.getListItemCheckbox(rowId).check();
    }
}

module.exports = { PartnersActions };

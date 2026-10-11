class PartnersLocators {
    constructor(page) {
        this.page = page;

        // Search Bar
        this.searchInput = page.getByTestId('search-input');
        this.searchButton = page.getByTestId('search-search-icon');
        this.toggleFiltersButton = page.getByTestId('search-toggle-filters-btn');

        // Toolbar Buttons
        this.downloadButton = page.getByTestId('partner-export-button');
        this.bulkCreditButton = page.getByTestId('bulk-credit-limit-button');
        this.emailButton = page.getByTestId('email-button');
        this.smsButton = page.getByTestId('sms-button');
        this.whatsappButton = page.getByTestId('whatsapp-button');

        // Filter / Columns
        this.viewColumnsButton = page.getByTestId('View Columns');
        this.filterButton = page.getByTestId('Filter');
    }

    // Dynamic locators for grid items based on Row ID (e.g., '1020')
    getListItem(rowId) {
        return this.page.getByTestId(`list-item-${rowId}`);
    }

    getListItemName(rowId) {
        return this.page.getByTestId(`list-item-name-${rowId}`);
    }

    getListItemId(rowId) {
        return this.page.getByTestId(`list-item-id-${rowId}`);
    }

    getListItemCallButton(rowId) {
        return this.page.getByTestId(`list-item-call-${rowId}`);
    }

    getListItemOptionsButton(rowId) {
        return this.page.getByTestId(`list-item-options-${rowId}`);
    }

    getListItemCheckbox(rowId) {
        return this.page.getByTestId(`list-item-checkbox-${rowId}`);
    }
}

module.exports = { PartnersLocators };

class AddCountSubscriptionLocators {
    constructor(page) {
        this.page = page;

        // --- Header ---
        this.pageTitle = page.locator('h1', { hasText: 'Add Count' });
        this.backButton = page.locator('button:has(.material-icons:has-text("arrow_back"))');
        this.forwardChevronButton = page.locator('button:has(.material-icons:has-text("chevron_right"))');
        
        // --- Footer Actions ---
        this.purchaseButton = page.locator('button', { hasText: 'Purchase' });
    }

    /**
     * Dynamically locates the count input field for a specific package type.
     * @param {string} packageName - The name of the package (e.g. "Emerald")
     */
    getPackageCountInput(packageName) {
        // Finds the row container that holds the specific package name, then finds the input field inside it
        return this.page.locator('div.MuiGrid-container').filter({
            has: this.page.locator(`div:text-is("${packageName}")`)
        }).locator('input[type="text"]');
    }
}

module.exports = { AddCountSubscriptionLocators };

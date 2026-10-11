class PerpetualPurchaseLocators {
    constructor(page) {
        this.page = page;

        // --- Header ---
        this.pageTitle = page.locator('h1', { hasText: 'Purchase - Busy 21 Perpetual' });
        this.backButton = page.locator('button:has(.material-icons:has-text("arrow_back"))');

        // --- Dropdowns ---
        // Using structural logic: finding the label, going to the parent container, and locating the select element
        this.tenureSelect = page.locator('.MuiFormControl-root').filter({ hasText: 'Tenure' }).locator('select');
        this.regionSelect = page.locator('.MuiFormControl-root').filter({ hasText: 'Region' }).locator('select');
        this.categorySelect = page.locator('.MuiFormControl-root').filter({ hasText: 'Category' }).locator('select');

        // --- Footer Actions & Totals ---
        // Matches the element displaying the total ACs (e.g., "0 ACs")
        this.totalAcsLabel = page.locator('div').filter({ hasText: /^\d+\s*ACs$/ });
        this.purchaseButton = page.locator('button', { hasText: 'Purchase' });
    }

    /**
     * Dynamically locates the quantity input field for a given package and user type.
     * @param {string} packageLevel - "Basic", "Standard", or "Enterprise"
     * @param {string} userType - "Single User", "Multi User", or "Client Server"
     * @returns {Locator}
     */
    getPackageInput(packageLevel, userType) {
        // Finds the outer container for the specific package (Basic/Standard/Enterprise)
        const packageSection = this.page.locator('div.MuiGrid-container').filter({
            has: this.page.locator(`div:text-is("${packageLevel}")`)
        });
        
        // Within that package section, finds the row for the specific user type and targets its input
        return packageSection
            .locator('div.MuiGrid-container')
            .filter({ has: this.page.locator(`div:text-is("${userType}")`) })
            .locator('input[type="text"]');
    }
}

module.exports = { PerpetualPurchaseLocators };

class PurchaseSuccessfulLocators {
    constructor(page) {
        this.page = page;
        
        // --- Headers ---
        // Matches any h5 that contains "Purchase Successful" (e.g. "Busy 21 - Purchase Successful")
        this.pageTitle = page.locator('h5', { hasText: /Purchase Successful/i });
        this.backButton = page.locator('button:has(.material-icons:has-text("arrow_back"))');

        // --- Summary Details ---
        // The first summary paragraph usually contains words like Subscription, Count, etc.
        this.subscriptionSummary = page.locator('p').filter({ hasText: /(Subscription|Count)/i }).first();
        
        // The region and tenure are usually separated by a pipe '|', making this locator highly reliable
        this.regionTenureDetails = page.locator('p').filter({ hasText: /\|/ });
        this.acsConsumed = page.locator('p').filter({ hasText: /ACs Consumed/i });
        
        // --- Bundle Offers (if present) ---
        this.claimOfferButton = page.locator('button', { hasText: /Claim the offer/i });

        // --- Purchased Items ---
        // The specific package bought is styled with a bolder font weight
        this.purchasedPackageLabel = page.locator('p[style*="font-weight: bolder"]');
        
        // --- Serial Number & Keys ---
        this.copyButtons = page.locator('button[aria-label="copy"]');
        this.serialNumberCopyBtn = this.copyButtons.nth(0);
        this.activationKeyCopyBtn = this.copyButtons.nth(1);

        // --- Confirmation Info ---
        this.emailConfirmationTexts = page.locator('p').filter({ hasText: /^Details sent to/i });
    }
}

module.exports = { PurchaseSuccessfulLocators };

class MobileAppPurchaseLocators {
    constructor(page) {
        this.page = page;

        // --- Header Section ---
        this.backButton = page.locator('span[title="Back"] button');
        this.pageTitle = page.locator('p').filter({ hasText: 'Purchase Mobile App:' });

        // --- Form Fields ---
        this.subscriptionCountInput = page.locator('div').filter({ has: page.locator('label', { hasText: /^Subscription Count/ }) }).locator('input');
        
        // Subscription Period Cards
        this.period360DaysCard = page.locator('.MuiCard-root').filter({ hasText: '360 Days' });
        this.period1080DaysCard = page.locator('.MuiCard-root').filter({ hasText: '1080 Days' });
        this.period14DaysCard = page.locator('.MuiCard-root').filter({ hasText: 'FOC - 14 Days' });

        // Readonly Calculated Values
        this.advanceCreditInput = page.locator('div').filter({ has: page.locator('label', { exact: true, hasText: 'Advance Credit' }) }).locator('input');
        this.lpInput = page.locator('div').filter({ has: page.locator('label', { hasText: /^LP/ }) }).locator('input');

        // --- Footer Actions ---
        this.nextButton = page.locator('button', { hasText: 'Next' });

        // --- Preview Screen (When apps already exist) ---
        this.previewTopSummary = page.locator('h6').filter({ hasText: /will be renewed/ });
        this.previewTopSubSummary = page.locator('h6').filter({ hasText: /expiry date/ });
        
        this.previewTable = page.locator('.MuiTable-root');
        this.previewTableRows = this.previewTable.locator('.MuiTableBody-root .MuiTableRow-root');
        
        this.previewFooterSummary = page.locator('p').filter({ hasText: /^Summary:/ });
        this.previewBackButton = page.locator('button', { exact: true, hasText: 'Back' });

        // --- OTP Verification Screen ---
        this.userDetailsToggle = page.locator('div').filter({ has: page.locator('p', { exact: true, hasText: 'User' }) }).locator('button[aria-label="toggle"]');
        this.mobileTCodeInput = page.locator('div').filter({ has: page.locator('label', { hasText: /^Mobile T-Code/ }) }).locator('input');
        this.emailTCodeInput = page.locator('div').filter({ has: page.locator('label', { hasText: /^Email T-Code/ }) }).locator('input');
        
        // Footer Buttons for OTP Screen
        this.purchaseButton = page.locator('button', { exact: true, hasText: 'Purchase' });
        this.resendOtpButton = page.locator('button').filter({ hasText: /^Resend OTP/ });
        this.otpBackButton = page.locator('button', { exact: true, hasText: 'Back' });
    }
}

module.exports = { MobileAppPurchaseLocators };

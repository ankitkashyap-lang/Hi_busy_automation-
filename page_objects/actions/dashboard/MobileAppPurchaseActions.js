const { MobileAppPurchaseLocators } = require('../locators/MobileAppPurchaseLocators');

class MobileAppPurchaseActions {
    constructor(page) {
        this.page = page;
        this.locators = new MobileAppPurchaseLocators(page);
    }

    // --- Header Actions ---
    async clickBack() {
        await this.locators.backButton.click();
    }

    async getPageTitleText() {
        return await this.locators.pageTitle.textContent();
    }

    // --- Form Actions ---
    async setSubscriptionCount(count) {
        await this.locators.subscriptionCountInput.fill(count.toString());
    }

    async getSubscriptionCount() {
        return await this.locators.subscriptionCountInput.inputValue();
    }

    async selectPeriod360Days() {
        await this.locators.period360DaysCard.click();
    }

    async selectPeriod1080Days() {
        await this.locators.period1080DaysCard.click();
    }

    async selectPeriod14Days() {
        await this.locators.period14DaysCard.click();
    }

    // --- Values Retrieval ---
    async getAdvanceCreditValue() {
        return await this.locators.advanceCreditInput.inputValue();
    }

    async getLpValue() {
        return await this.locators.lpInput.inputValue();
    }

    // --- Footer Actions ---
    async clickNext() {
        await this.locators.nextButton.click();
    }

    // --- Preview Screen Actions ---
    async getPreviewTopSummary() {
        return await this.locators.previewTopSummary.textContent();
    }

    async getPreviewTopSubSummary() {
        return await this.locators.previewTopSubSummary.textContent();
    }

    async getPreviewTableRowCount() {
        return await this.locators.previewTableRows.count();
    }

    async getPreviewTableRow(index) {
        return this.locators.previewTableRows.nth(index);
    }

    async getPreviewFooterSummary() {
        return await this.locators.previewFooterSummary.textContent();
    }

    async clickPreviewBack() {
        await this.locators.previewBackButton.click();
    }

    // --- OTP Verification Screen Actions ---
    async toggleUserDetails() {
        await this.locators.userDetailsToggle.click();
    }

    async setMobileTCode(otp) {
        await this.locators.mobileTCodeInput.fill(otp.toString());
    }

    async setEmailTCode(otp) {
        await this.locators.emailTCodeInput.fill(otp.toString());
    }

    async clickPurchase() {
        await this.locators.purchaseButton.click();
    }

    async clickResendOtp() {
        await this.locators.resendOtpButton.click();
    }

    async clickOtpBack() {
        await this.locators.otpBackButton.click();
    }
}

module.exports = { MobileAppPurchaseActions };

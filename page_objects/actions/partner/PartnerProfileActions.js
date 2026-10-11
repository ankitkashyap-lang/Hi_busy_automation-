const { PartnerProfileLocators } = require('../../locators/partner/PartnerProfileLocators');

class PartnerProfileActions {
    constructor(page) {
        this.page = page;
        this.locators = new PartnerProfileLocators(page);
    }

    // --- General Actions ---
    async closeProfile() {
        await this.locators.closeButton.click();
    }

    async getPartnerName() {
        return await this.locators.partnerNameLabel.textContent();
    }

    async getPartnerTier() {
        return await this.locators.partnerTierLabel.textContent();
    }

    async getDealerId() {
        return await this.locators.dealerIdLabel.textContent();
    }

    async getPin() {
        return await this.locators.pinLabel.textContent();
    }

    async getGstin() {
        return await this.locators.gstinLabel.textContent();
    }

    // --- Tab Navigation ---
    async goToUserInfoTab() {
        await this.locators.userInfoTab.click();
    }
    async goToPartnerInfoTab() {
        await this.locators.partnerInfoTab.click();
    }
    async goToGstTab() {
        await this.locators.gstTab.click();
    }
    async goToInvoiceTab() {
        await this.locators.invoiceTab.click();
    }
    async goToWalletTab() {
        await this.locators.walletTab.click();
    }
    async goToCreditTab() {
        await this.locators.creditTab.click();
    }
    async goToPaymentsTab() {
        await this.locators.paymentsTab.click();
    }
    async goToRoleTab() {
        await this.locators.roleTab.click();
    }
    async goToOthersTab() {
        await this.locators.othersTab.click();
    }

    // --- User Info Tab Actions ---
    async getUserInfoName() {
        return await this.locators.userInfoNameInput.inputValue();
    }

    async getUserInfoMobile() {
        return await this.locators.userInfoMobileInput.inputValue();
    }

    async getUserInfoEmail() {
        return await this.locators.userInfoEmailInput.inputValue();
    }

    async getUserInfoRole() {
        return await this.locators.userInfoRoleValueLabel.textContent();
    }

    async clickUserInfoRoleSelect() {
        await this.locators.userInfoRoleSelectButton.click();
    }

    // --- Partner Info Tab Actions ---
    async getPartnerInfoName() {
        return await this.locators.partnerInfoNameInput.inputValue();
    }
    
    async setPartnerInfoName(name) {
        await this.locators.partnerInfoNameInput.fill(name);
    }

    async getPartnerInfoMobile() {
        return await this.locators.partnerInfoMobileInput.inputValue();
    }
    
    async setPartnerInfoMobile(mobile) {
        await this.locators.partnerInfoMobileInput.fill(mobile);
    }

    async getPartnerInfoEmail() {
        return await this.locators.partnerInfoEmailInput.inputValue();
    }
    
    async setPartnerInfoEmail(email) {
        await this.locators.partnerInfoEmailInput.fill(email);
    }

    async getPartnerInfoCreationDate() {
        return await this.locators.partnerInfoCreationDateInput.inputValue();
    }

    async getPartnerInfoCreatedBy() {
        return await this.locators.partnerInfoCreatedByInput.inputValue();
    }

    // --- GST Tab Actions ---
    async getGstUsername() {
        return await this.locators.gstUsernameInput.inputValue();
    }
    
    async setGstUsername(username) {
        await this.locators.gstUsernameInput.fill(username);
    }

    async getGstPassword() {
        return await this.locators.gstPasswordInput.inputValue();
    }
    
    async setGstPassword(password) {
        await this.locators.gstPasswordInput.fill(password);
    }

    async clickGstUpdate() {
        await this.locators.gstUpdateButton.click();
    }

    // --- Invoice Tab Actions ---
    async getNextInvoiceNo() {
        return await this.locators.nextInvoiceNoInput.inputValue();
    }

    async getNextSalesReturnNo() {
        return await this.locators.nextSalesReturnNoInput.inputValue();
    }

    async selectDailyInvoiceFrequency() {
        await this.locators.dailyFrequencyButton.click();
    }

    async selectWeeklyInvoiceFrequency() {
        await this.locators.weeklyFrequencyButton.click();
    }

    async selectMonthlyInvoiceFrequency() {
        await this.locators.monthlyFrequencyButton.click();
    }

    // --- Wallet Tab Actions ---
    async clickTransferAc() {
        await this.locators.walletTransferAcButton.click();
    }

    async clickAddAc() {
        await this.locators.walletAddAcButton.click();
    }

    async clickWalletFilter() {
        await this.locators.walletFilterButton.click();
    }

    async getAcBalance() {
        const text = await this.locators.walletBalanceContainer.textContent();
        if (text) {
            const match = text.match(/AC Balance:\s*([0-9,.-]+)/);
            return match ? match[1] : text;
        }
        return null;
    }

    async downloadWalletExcel() {
        await this.locators.walletDownloadExcelButton.click();
    }

    async getWalletTransactionCount() {
        return await this.locators.walletTableRows.count();
    }

    async getWalletTransactionRow(index) {
        return this.locators.walletTableRows.nth(index);
    }

    // --- Wallet Filter Actions ---
    async setWalletFilterSubId(subId) {
        await this.locators.walletFilterSubIdInput.fill(subId);
    }

    async setWalletFilterDeviceId(deviceId) {
        await this.locators.walletFilterDeviceIdInput.fill(deviceId);
    }

    async clickWalletFilterDateRangeIcon() {
        await this.locators.walletFilterDateRangeButton.click();
    }

    async selectWalletFilterType(typeOption) {
        await this.locators.walletFilterTypeSelect.selectOption({ label: typeOption });
    }

    async selectWalletFilterProduct(productOption) {
        await this.locators.walletFilterProductSelect.selectOption({ label: productOption });
    }

    async clickWalletFilterSubmit() {
        await this.locators.walletFilterSubmitButton.click();
    }

    async clickWalletFilterReset() {
        await this.locators.walletFilterResetButton.click();
    }

    // --- Credit Tab Actions ---
    async getCreditLimit() {
        const text = await this.locators.creditLimitText.textContent();
        if (text) {
            const match = text.match(/Credit Limit:\s*([0-9,.-]+)/);
            return match ? match[1] : text;
        }
        return null;
    }

    async getCreditAvailable() {
        const text = await this.locators.creditAvailableText.textContent();
        if (text) {
            const match = text.match(/Available:\s*([0-9,.-]+)/);
            return match ? match[1] : text;
        }
        return null;
    }

    async getOverdueAmount() {
        const text = await this.locators.creditOverdueAmountText.textContent();
        if (text) {
            const match = text.match(/Overdue Amount:\s*([0-9,.-]+)/);
            return match ? match[1] : text;
        }
        return null;
    }

    async clickCreditFilter() {
        await this.locators.creditFilterButton.click();
    }

    async downloadCreditExcel() {
        await this.locators.creditDownloadExcelButton.click();
    }

    async downloadCreditPolicyPdf() {
        await this.locators.creditDownloadPdfButton.click();
    }

    async getCreditLedgerTransactionCount() {
        return await this.locators.creditLedgerRows.count();
    }

    async getCreditLedgerTransactionRow(index) {
        return this.locators.creditLedgerRows.nth(index);
    }

    // --- Payments Tab Actions ---
    async clickPaymentsFilter() {
        await this.locators.paymentsFilterButton.click();
    }

    async getPaymentsTransactionCount() {
        return await this.locators.paymentsTableRows.count();
    }

    async getPaymentsTransactionRow(index) {
        return this.locators.paymentsTableRows.nth(index);
    }

    // --- Role Tab Actions ---
    async getRoleName() {
        return await this.locators.roleNameValue.textContent();
    }

    async clickRoleNameEdit() {
        await this.locators.roleNameOpenBtn.click();
    }

    // --- Others Tab Actions ---
    async selectOthersTypePartner() {
        await this.locators.othersTypePartnerBtn.click();
    }

    async selectOthersTypeReseller() {
        await this.locators.othersTypeResellerBtn.click();
    }

    async selectOthersStatusNonCompliant() {
        await this.locators.othersStatusNonCompliantBtn.click();
    }

    async toggleTcsApplicable() {
        await this.locators.othersTcsApplicableBtn.click();
    }

    async toggleIsNew() {
        await this.locators.othersIsNewBtn.click();
    }

    async toggleIsRetail() {
        await this.locators.othersIsRetailBtn.click();
    }

    async setOthersAddress(address) {
        await this.locators.othersAddressInput.fill(address);
    }

    async getOthersAddress() {
        return await this.locators.othersAddressInput.inputValue();
    }

    // --- Side Drawer Actions (e.g., Transfer To Selection) ---
    async searchInDrawer(query) {
        await this.locators.drawerSearchInput.fill(query);
    }

    async getDrawerResultCount() {
        return await this.locators.drawerResultCount.textContent();
    }

    async selectDrawerResultByIndex(index) {
        await this.locators.drawerResultButtons.nth(index).click();
    }

    async selectDrawerResultByText(text) {
        const targetBtn = this.locators.drawerListing.locator('button', { hasText: text }).first();
        await targetBtn.click();
    }

    async closeDrawer() {
        await this.locators.drawerCloseIcon.click();
    }

    async clickDrawerBottomActionBtn() {
        await this.locators.drawerActionBtn.click();
    }
}

module.exports = { PartnerProfileActions };

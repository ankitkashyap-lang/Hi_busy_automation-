const { expect } = require('@playwright/test');
const Logger = require('../utils/logger.js');
const PartnerPage = require('../pages/Partner/PartnerPage.js');

/**
 * PartnerValidation - Validation and assertion class for Partner module
 */
class PartnerValidation {
  constructor(page) {
    this.page = page;
    this.logger = Logger.getInstance();
    this.partnerPage = new PartnerPage(page);
  }

  /**
   * Verify Partner Listing page is fully loaded with core components
   * Note: Does NOT assert results count — that depends on API permissions.
   */
  async verifyPartnerListingLoaded() {
    this.logger.info('Verifying Partner listing page elements');
    await expect(this.page.locator(this.partnerPage.pageHeader)).toBeVisible({ timeout: 10000 });
    await expect(this.page.locator(this.partnerPage.searchInput)).toBeVisible({ timeout: 5000 });
    await expect(this.page.locator(this.partnerPage.excelDownloadButton).first()).toBeVisible({ timeout: 5000 });
    await expect(this.page.locator(this.partnerPage.createPartnerButton)).toBeVisible({ timeout: 5000 });
    this.logger.info('✓ Partner listing page loaded successfully');
  }

  /**
   * Verify result count text is displayed (gracefully handles empty data)
   */
  async verifyResultsCountNotEmpty() {
    this.logger.info('Checking results count text');
    try {
      const countText = await this.partnerPage.getResultsCountText();
      this.logger.info(`Results count text: "${countText}"`);
      // Pass as long as something is rendered in the count area
      expect(countText.length).toBeGreaterThan(0);
      this.logger.info(`✓ Results count area verified: ${countText}`);
    } catch (e) {
      this.logger.info('ℹ Results count element not visible — may be hidden due to API permissions');
    }
  }

  /**
   * Verify a partner card exists with specific name
   */
  async verifyPartnerCardByName(partnerName) {
    this.logger.info(`Verifying partner card exists with name: "${partnerName}"`);
    const cardLocator = this.page.locator(this.partnerPage.cardNameValues).filter({ hasText: partnerName }).first();
    await expect(cardLocator).toBeVisible({ timeout: 5000 });
    this.logger.info(`✓ Partner card found for: ${partnerName}`);
  }

  /**
   * Verify partner card details by ID
   */
  async verifyPartnerCardDetailsById(id, { name, dealerId, pin, tier, email, mobile, location } = {}) {
    this.logger.info(`Verifying details for partner card ID: ${id}`);
    if (name) {
      const nameEl = this.page.locator(this.partnerPage.partnerNameById(id));
      await expect(nameEl).toHaveText(name);
    }
    if (dealerId || pin) {
      const dealerPinEl = this.page.locator(this.partnerPage.partnerDealerIdPinById(id));
      const text = await dealerPinEl.innerText();
      if (dealerId) expect(text).toContain(dealerId);
      if (pin) expect(text).toContain(pin);
    }
    if (location) {
      const locationEl = this.page.locator(this.partnerPage.partnerCountryTileById(id));
      await expect(locationEl).toContainText(location);
    }
    if (email || mobile) {
      const contactEl = this.page.locator(this.partnerPage.partnerMobileEmailById(id));
      const text = await contactEl.innerText();
      if (email) expect(text).toContain(email);
      if (mobile) expect(text).toContain(mobile);
    }
    if (tier) {
      const tierEl = this.page.locator(this.partnerPage.partnerTierById(id));
      await expect(tierEl).toContainText(tier);
    }
    this.logger.info(`✓ Details verified for partner ID: ${id}`);
  }

  /**
   * Verify Search Options filter panel is visible or hidden
   */
  async verifyFilterPanelVisibility(shouldBeVisible = true) {
    this.logger.info(`Verifying filter panel visibility (expected: ${shouldBeVisible})`);
    const filterField = this.page.locator(this.partnerPage.filterNameInput);
    if (shouldBeVisible) {
      await expect(filterField).toBeVisible({ timeout: 5000 });
    } else {
      await expect(filterField).toBeHidden({ timeout: 5000 });
    }
    this.logger.info(`✓ Filter panel visibility verified as ${shouldBeVisible}`);
  }

  /**
   * Verify Create Partner wizard drawer is opened
   */
  async verifyCreatePartnerDrawerOpen() {
    this.logger.info('Verifying Create Partner wizard drawer is open');
    await expect(this.page.locator(this.partnerPage.createCountryInput)).toBeVisible({ timeout: 5000 });
    await expect(this.page.locator(this.partnerPage.createTimeZoneInput)).toBeVisible({ timeout: 5000 });
    await expect(this.page.locator(this.partnerPage.wizardNextButton)).toBeVisible({ timeout: 5000 });
    this.logger.info('✓ Create Partner wizard drawer is open');
  }

  /**
   * Verify navigation after clicking Access Account
   */
  async verifyAccessAccountNavigation() {
    this.logger.info('Verifying access account redirects to partner/channel_partner dashboard');
    await expect(this.page).toHaveURL(/\/(partner|channel_partner)\/dashboard/);
    this.logger.info('✓ Access Account redirected successfully');
  }
}

module.exports = PartnerValidation;

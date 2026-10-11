const PartnerPage = require('../pages/Partner/PartnerPage.js');
const PartnerValidation = require('../validations/PartnerValidation.js');
const Logger = require('../utils/logger.js');

/**
 * PartnerFlow - High-level end-to-end flows for Partner module
 */
class PartnerFlow {
  constructor(page) {
    this.page = page;
    this.logger = Logger.getInstance();
    this.partnerPage = new PartnerPage(page);
    this.partnerValidation = new PartnerValidation(page);
  }

  /**
   * Flow: Navigate to partner listing and verify page loaded
   */
  async navigateAndVerifyListing() {
    this.logger.separator();
    this.logger.info('Flow: Navigate to Partner listing and verify');
    await this.partnerPage.navigateToPartnerListing();
    await this.partnerValidation.verifyPartnerListingLoaded();
    await this.partnerValidation.verifyResultsCountNotEmpty();
  }

  /**
   * Flow: Quick search partner by keyword and verify
   */
  async searchPartnerAndVerify(query) {
    this.logger.separator();
    this.logger.info(`Flow: Search partner by query: "${query}"`);
    await this.partnerPage.searchPartner(query);
    await this.partnerValidation.verifyPartnerCardByName(query);
  }

  /**
   * Flow: Filter partners using Search Options
   */
  async filterPartners(filters) {
    this.logger.separator();
    this.logger.info('Flow: Filter partners with advanced options');
    await this.partnerPage.applyFilters(filters);
    await this.partnerValidation.verifyResultsCountNotEmpty();
  }

  /**
   * Flow: Complete end-to-end Partner Creation wizard
   */
  async createNewPartner(partnerData) {
    this.logger.separator();
    this.logger.info('Flow: Create new partner through 4-step wizard');
    await this.partnerPage.openCreatePartnerDrawer();
    await this.partnerValidation.verifyCreatePartnerDrawerOpen();

    // Step 1
    await this.partnerPage.fillStep1({
      partnerType: partnerData.partnerType || 'Partner',
      tier: partnerData.tier || 'Gold',
      timeZone: partnerData.timeZone || 'Asia/Kolkata',
    });

    // Step 2
    await this.partnerPage.fillStep2({
      gstin: partnerData.gstin,
      partnerName: partnerData.partnerName,
      dealerId: partnerData.dealerId,
      pin: partnerData.pin,
    });

    // Step 3
    await this.partnerPage.fillStep3({
      pincode: partnerData.pincode || '110001',
      address: partnerData.address || 'Test Partner Address',
    });

    // Step 4
    await this.partnerPage.fillStep4AndSubmit({
      contactName: partnerData.contactName || 'Test Contact',
      mobile: partnerData.mobile || '9999999999',
      email: partnerData.email || 'testpartner@example.com',
    });
  }

  /**
   * Flow: Access a partner account directly from listing
   */
  async accessPartnerAccountAndVerify(index = 0) {
    this.logger.separator();
    this.logger.info(`Flow: Access partner account at index: ${index}`);
    await this.partnerPage.accessPartnerAccount(index);
    await this.partnerValidation.verifyAccessAccountNavigation();
  }
}

module.exports = PartnerFlow;

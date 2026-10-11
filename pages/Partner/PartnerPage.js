const BasePage = require('../../base/BasePage.js');
const Logger = require('../../utils/logger.js');

/**
 * PartnerPage - Page Object for Partner Listing & Management functionality
 * Contains robust ID and data-testid based locators and interaction methods.
 */
class PartnerPage extends BasePage {
  constructor(page) {
    super(page);
    this.logger = Logger.getInstance();

    // ==========================================
    // Page Header & Top Bar Locators
    // ==========================================
    this.pageHeader = 'span:has-text("Partners")';
    this.headerTitle = 'span:has-text("Partners")';
    this.excelDownloadButton = 'button:has(img[title="Download Excel"]), img[title="Download Excel"]';
    this.createPartnerButton = 'button[aria-label="create"], span[title="Create"] button';
    this.resultsCount = 'span:has-text("results")';

    // ==========================================
    // Search Bar & Search Options (Filter)
    // ==========================================
    this.searchInput = 'input[placeholder="Search"], input[aria-label="search"]';
    this.searchOptionsToggle = 'button[aria-label*="Search Options"], button[title*="Search Options"], button[aria-label*="search options"], button[title*="search options"]';

    // Search Options Collapse Fields
    this.filterNameInput = 'input[placeholder="Name"]';
    this.filterPartnerIdInput = 'input[placeholder="Partner ID"]';
    this.filterPartnerPinInput = 'input[placeholder="Partner PIN"]';
    this.filterMobileInput = 'input[placeholder="Mobile"]';
    this.filterEmailInput = 'input[placeholder="Email ID"]';
    this.filterCityInput = 'input[placeholder="City"]';
    this.filterStateInput = 'input[placeholder="State"]';
    this.filterStatusSelect = 'select:has(option[value="Enabled"])';
    this.filterPartnerTypeSelect = 'select:has(option[value="Channel Partner"])';
    this.filterSearchButton = 'button:has-text("Search")';
    this.filterResetButton = 'button:has-text("Reset")';

    // ==========================================
    // Partner Grid / Card Locators (data-testid & id)
    // ==========================================
    this.partnerCards = '[data-testid^="list-item-"], [id^="list-item-"]';
    this.partnerCardById = (id) => `[data-testid="list-item-${id}-card"], #list-item-${id}-card`;
    this.partnerNameById = (id) => `[data-testid="list-item-${id}-label-name-value"], #list-item-${id}-label-name-value`;
    this.partnerDealerIdPinById = (id) => `[data-testid="list-item-${id}-label-dealer-id-pin-value"], #list-item-${id}-label-dealer-id-pin-value`;
    this.partnerCountryTileById = (id) => `[data-testid="list-item-${id}-label-countrytile"], #list-item-${id}-label-countrytile`;
    this.partnerMobileEmailById = (id) => `[data-testid="list-item-${id}-label-mobile-email-value"], #list-item-${id}-label-mobile-email-value`;
    this.partnerTierById = (id) => `[data-testid="list-item-${id}-label-partnertier"], #list-item-${id}-label-partnertier`;
    this.accessAccountButtonById = (id) => `[data-testid="list-item-${id}"] button[aria-label="Access Account"]`;
    this.moreInfoButtonById = (id) => `[data-testid="list-item-${id}-more-info-btn"], #list-item-${id}-more-info-btn`;

    // Generic Card Locators
    this.cardNameValues = '[data-testid$="-label-name-value"], [id$="-label-name-value"]';
    this.cardDealerIdPinValues = '[data-testid$="-label-dealer-id-pin-value"], [id$="-label-dealer-id-pin-value"]';
    this.cardCountryTiles = '[data-testid$="-label-countrytile"], [id$="-label-countrytile"]';
    this.cardMobileEmailValues = '[data-testid$="-label-mobile-email-value"], [id$="-label-mobile-email-value"]';
    this.cardTierValues = '[data-testid$="-label-partnertier"], [id$="-label-partnertier"]';
    this.accessAccountButtons = 'button[aria-label="Access Account"]';
    this.moreInfoButtons = 'button[aria-label="more info"], [data-testid$="-more-info-btn"]';

    // ==========================================
    // Create Partner Drawer (Wizard Steps)
    // ==========================================
    this.createDrawerCloseBtn = '#slide-close-btn, [data-testid="slide-close-btn"]';

    // Step 1: Partner Type & Tier
    this.createCountryInput = 'input#create-select-country-id-0-0-input, [data-testid="create-select-country-id-0-0-input"], #country_id, input[placeholder="Country"]';
    this.createTimeZoneInput = 'input#create-select-time-zone-id-0-1-input, [data-testid="create-select-time-zone-id-0-1-input"], #time_zone_id';
    this.createPartnerTypeBtn = 'button:has-text("Partner")';
    this.createResellerTypeBtn = 'button:has-text("Reseller")';
    this.createPartnerTierInput = 'input#create-select-partner-tier-0-4-input, [data-testid="create-select-partner-tier-0-4-input"], #partner_tier';
    this.tierModalAddButton = '#drawer-action-btn, [data-testid="drawer-action-btn"], .MuiDrawer-modal button:has-text("Add")';
    this.timeZoneModalAddButton = '#drawer-action-btn, [data-testid="drawer-action-btn"], .MuiDrawer-modal button:has-text("Add")';
    this.wizardNextButton = 'button:has-text("Next")';

    // Step 2: GSTIN & Basic Details
    this.createGstinInput = 'input#create-text-gstin-1-0-input, [data-testid="create-text-gstin-1-0-input"], #gstin';
    this.createPartnerNameInput = 'input#create-text-name-1-1-input, [data-testid="create-text-name-1-1-input"], #name';
    this.createDealerIdInput = 'input#create-text-dealer-id-1-2-input, [data-testid="create-text-dealer-id-1-2-input"], #dealer_id';
    this.createPartnerPinInput = 'input#create-text-pin-1-3-input, [data-testid="create-text-pin-1-3-input"], #pin';

    // Step 3: Location / Address Details
    this.createPincodeInput = 'div.MuiFormControl-root:has(label:has-text("Pincode")) input, input[aria-invalid="false"][type="text"]:not([disabled]), span:has-text("Pincode") input';
    this.createStateInput = 'input#create-select-state-id-2-1-input, [data-testid="create-select-state-id-2-1-input"], #state_id';
    this.createCityInput = 'input#create-select-city-id-2-2-input, [data-testid="create-select-city-id-2-2-input"], #city_id';
    this.createAddressTextarea = 'textarea#create-text-address-2-3-input, textarea[data-testid="create-text-address-2-3-input"], textarea#address, #address';

    // Step 4: Contact Details
    this.createContactNameInput = 'input#create-text-contact-person-3-0-input, [data-testid="create-text-contact-person-3-0-input"], #contact_person';
    this.createContactMobileInput = 'input#create-text-mobile-3-1-input, [data-testid="create-text-mobile-3-1-input"], #mobile';
    this.createContactEmailInput = 'input#create-text-email-3-2-input, [data-testid="create-text-email-3-2-input"], #email';
    this.createSubmitButton = '#create-button-save-3-3, [data-testid="create-button-save-3-3"], button:has-text("Submit")';
  }

  /**
   * Navigate to Partner Listing page
   * Uses SPA-aware navigation: if already on same origin, use pushState to avoid
   * hard reload which can reset auth context. Falls back to full goto if needed.
   */
  async navigateToPartnerListing() {
    this.logger.info('Navigating to Partner listing page');
    const currentUrl = this.page.url();
    const origin = new URL(currentUrl).origin;
    const targetUrl = `${origin}/partner/teams/id`;

    if (!currentUrl.includes('/partner/teams/id')) {
      // Same-origin SPA navigation via React Router (avoids full page reload)
      this.logger.info(`Using SPA pushState navigation to partner listing on ${origin}`);
      await this.page.evaluate((url) => {
        const path = new URL(url).pathname;
        window.history.pushState({}, '', path);
        window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
      }, targetUrl);
      // Give React Router time to re-render
      await this.page.waitForTimeout(800);
      
      // Fallback if pushState didn't work (e.g. not in React app context yet)
      if (!this.page.url().includes('/partner/teams/id')) {
          await this.navigate(targetUrl);
      }
    }

    await this.waitForPartnerListingToLoad();
  }

  /**
   * Wait for Partner listing page to fully load
   */
  async waitForPartnerListingToLoad(timeout = this.timeout) {
    this.logger.info('Waiting for Partner listing page to load');
    await this.waitForElement(this.pageHeader, timeout);
    await this.page.waitForTimeout(800);
  }

  /**
   * Check if partner cards have loaded (depends on API permissions).
   * Returns true if cards are visible, false if API returned 403/no data.
   * waitMs is intentionally short — a 403 response arrives immediately.
   */
  async hasCardsLoaded(waitMs = 500) {
    await this.page.waitForTimeout(waitMs);
    const count = await this.page.locator(this.partnerCards).count();
    this.logger.info(`Partner cards loaded: ${count}`);
    return count > 0;
  }

  /**
   * Quick search by text
   */
  async searchPartner(query) {
    this.logger.info(`Searching partner with query: "${query}"`);
    await this.page.locator(this.searchInput).fill(query);
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(1000);
  }

  /**
   * Open Search Options (Filter collapse)
   */
  async openSearchOptions() {
    this.logger.info('Opening Search Options filter panel');
    await this.page.locator('.MuiBackdrop-root').waitFor({ state: 'hidden', timeout: 3000 }).catch(() => { });
    const filterInput = this.page.locator(this.filterNameInput);
    if (!(await filterInput.isVisible())) {
      await this.page.locator(this.searchOptionsToggle).click();
      try {
        await filterInput.waitFor({ state: 'visible', timeout: 3000 });
      } catch (e) {
        if (!(await filterInput.isVisible())) {
          await this.page.locator(this.searchOptionsToggle).click();
          await filterInput.waitFor({ state: 'visible', timeout: 5000 });
        }
      }
    }
  }

  /**
   * Close Search Options filter panel
   */
  async closeSearchOptions() {
    this.logger.info('Closing Search Options filter panel');
    const filterInput = this.page.locator(this.filterNameInput);
    if (await filterInput.isVisible()) {
      await this.page.locator(this.searchOptionsToggle).click();
      try {
        await filterInput.waitFor({ state: 'hidden', timeout: 3000 });
      } catch (e) {
        if (await filterInput.isVisible()) {
          await this.page.locator(this.searchOptionsToggle).click();
          await filterInput.waitFor({ state: 'hidden', timeout: 5000 });
        }
      }
    }
  }

  /**
   * Apply advanced filters
   */
  async applyFilters({ name, partnerId, partnerPin, mobile, email, city, state, status, partnerType } = {}) {
    this.logger.info('Applying advanced partner filters');
    await this.openSearchOptions();

    if (name !== undefined) await this.page.locator(this.filterNameInput).fill(name);
    if (partnerId !== undefined) await this.page.locator(this.filterPartnerIdInput).fill(partnerId);
    if (partnerPin !== undefined) await this.page.locator(this.filterPartnerPinInput).fill(partnerPin);
    if (mobile !== undefined) await this.page.locator(this.filterMobileInput).fill(mobile);
    if (email !== undefined) await this.page.locator(this.filterEmailInput).fill(email);
    if (city !== undefined) await this.page.locator(this.filterCityInput).fill(city);
    if (state !== undefined) await this.page.locator(this.filterStateInput).fill(state);
    if (status !== undefined) await this.page.locator(this.filterStatusSelect).selectOption(status);
    if (partnerType !== undefined) await this.page.locator(this.filterPartnerTypeSelect).selectOption(partnerType);

    await this.page.locator(this.filterSearchButton).click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Reset advanced filters
   */
  async resetFilters() {
    this.logger.info('Resetting partner filters');
    await this.openSearchOptions();
    await this.page.locator(this.filterResetButton).click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Get the total results count displayed on page
   */
  async getResultsCountText() {
    this.logger.info('Getting results count text');
    const text = await this.page.locator(this.resultsCount).first().innerText();
    return text.trim();
  }

  /**
   * Navigate directly to Partner Create page/drawer without re-login
   */
  async navigateToCreatePartner() {
    this.logger.info('Navigating directly to Partner Create page');
    const currentUrl = this.page.url();
    const origin = new URL(currentUrl).origin;
    const targetUrl = `${origin}/partner/teams/create`;

    await this.page.goto(targetUrl);
    await this.page.locator(this.createCountryInput).first().waitFor({ state: 'visible', timeout: 15000 });
  }

  /**
   * Open the Create Partner wizard drawer
   */
  async openCreatePartnerDrawer() {
    this.logger.info('Opening Create Partner wizard drawer');
    await this.page.locator('.MuiBackdrop-root').waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    if (await this.page.locator(this.createCountryInput).first().isVisible({ timeout: 1000 }).catch(() => false)) {
      this.logger.info('Create Partner wizard drawer is already open');
      return;
    }
    const createBtn = this.page.locator(this.createPartnerButton).first();
    if (await createBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await createBtn.click();
    } else {
      await this.navigateToCreatePartner();
    }
    await this.page.locator(this.createCountryInput).first().waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Close the Create Partner wizard drawer
   */
  async closeCreatePartnerDrawer() {
    this.logger.info('Closing Create Partner wizard drawer');
    const closeBtn = this.page.locator(this.createDrawerCloseBtn).or(this.page.locator('button[aria-label="close"], button:has-text("Close"), button:has-text("Cancel")')).first();
    if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeBtn.click().catch(() => {});
    } else {
      await this.page.keyboard.press('Escape');
    }
    await this.page.keyboard.press('Escape');
    await this.page.locator(this.createCountryInput).first().waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    await this.page.locator('.MuiBackdrop-root').waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
  }

  /**
   * Select Partner Tier dynamically in modal drawer
   */
  async selectPartnerTier() {
    this.logger.info(`Selecting partner tier dynamically`);
    await this.page.locator(this.createPartnerTierInput).click();
    await this.page.waitForTimeout(1000);
    
    // Select option via button with id/testid or visible option text
    const option = this.page.locator('button[id$="-select-btn"], button[data-testid$="-select-btn"]').first();
    if (await option.isVisible({ timeout: 3000 })) {
       await option.click();
    } else {
       const fallback = this.page.locator('.MuiDrawer-modal button, [role="dialog"] button').filter({ hasText: /.+/ }).filter({ hasNotText: /^Add$|^Close$/i }).first();
       await fallback.click();
    }
    await this.page.locator(this.tierModalAddButton).last().click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Select Time Zone dynamically in modal drawer
   */
  async selectTimeZone() {
    this.logger.info(`Selecting time zone dynamically`);
    await this.page.locator(this.createTimeZoneInput).click();
    await this.page.waitForTimeout(1000);
    
    const option = this.page.locator('button[id$="-select-btn"], button[data-testid$="-select-btn"]').first();
    if (await option.isVisible({ timeout: 3000 })) {
       await option.click();
    } else {
       const fallback = this.page.locator('.MuiDrawer-modal button, [role="dialog"] button').filter({ hasText: /.+/ }).filter({ hasNotText: /^Add$|^Close$/i }).first();
       await fallback.click();
    }
    await this.page.locator(this.timeZoneModalAddButton).last().click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Select Parent Partner dynamically in modal drawer for Resellers
   */
  async selectParentPartner(searchTerm) {
    this.logger.info(`Selecting Parent Partner dynamically for reseller: ${searchTerm}`);
    
    // Ensure the Select Parent Partner input is clicked to open the drawer
    const parentInput = this.page.getByRole('textbox', { name: 'Select Parent Partner' }).or(this.page.locator('input[placeholder*="Parent Partner"]')).first();
    await parentInput.waitFor({ state: 'visible', timeout: 10000 });
    await parentInput.click();
    await this.page.waitForTimeout(1000);
    
    // Fill the search box inside the drawer/modal
    const modalSearch = this.page.locator('.MuiDrawer-modal, [role="dialog"]').locator('input[placeholder*="Search"], input[placeholder*="search"], input[aria-label*="search"], input').first();
    await modalSearch.waitFor({ state: 'visible', timeout: 8000 });
    await modalSearch.click();
    await modalSearch.fill(searchTerm);
    await this.page.waitForTimeout(1500);

    // Select the matching partner item from search results
    const resultItem = this.page.locator('.MuiDrawer-modal, [role="dialog"]').locator(`text="${searchTerm}"`).or(this.page.locator('.MuiDrawer-modal, [role="dialog"]').getByText(searchTerm)).first();
    if (await resultItem.isVisible({ timeout: 8000 }).catch(() => false)) {
       await resultItem.click();
    } else {
       this.logger.warn(`Specific partner name "${searchTerm}" not directly clickable, attempting first list item`);
       const fallbackItem = this.page.locator('.MuiDrawer-modal, [role="dialog"]').locator('button, [role="button"], li').filter({ hasText: /add/i }).first();
       if (await fallbackItem.isVisible({ timeout: 3000 }).catch(() => false)) {
         await fallbackItem.click();
       }
    }
    
    // Click the final Add button in the modal
    const addBtn = this.page.locator('.MuiDrawer-modal button:has-text("Add"), [role="dialog"] button:has-text("Add"), #drawer-action-btn').last();
    if (await addBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
       await addBtn.click();
    }
    await this.page.waitForTimeout(500);
  }

  /**
   * Complete Step 1 of Partner Creation
   */
  async fillStep1({ partnerType = 'Partner', parentPartnerName = null } = {}) {
    this.logger.info('Filling Step 1 of Partner Creation');
    if (partnerType.toLowerCase() === 'reseller') {
      await this.page.locator(this.createResellerTypeBtn).click();
      if (parentPartnerName) {
        await this.selectParentPartner(parentPartnerName);
      }
    } else {
      await this.page.locator(this.createPartnerTypeBtn).click();
    }
    await this.selectPartnerTier();
    await this.selectTimeZone();
    await this.page.locator(this.wizardNextButton).click();
    await this.page.locator(this.createGstinInput).waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Complete Step 2 of Partner Creation
   */
  async fillStep2({ gstin, partnerName, dealerId, pin } = {}) {
    this.logger.info('Filling Step 2 (Business Details) of Partner Creation');
    if (gstin) await this.page.locator(this.createGstinInput).fill(gstin);
    if (partnerName) await this.page.locator(this.createPartnerNameInput).fill(partnerName);
    if (dealerId) await this.page.locator(this.createDealerIdInput).fill(dealerId);
    if (pin) await this.page.locator(this.createPartnerPinInput).fill(pin);
    await this.page.locator(this.wizardNextButton).click();
    await this.page.locator(this.createAddressTextarea).waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Complete Step 3 of Partner Creation
   */
  async fillStep3({ pincode, address } = {}) {
    this.logger.info('Filling Step 3 (Location Details) of Partner Creation');
    if (pincode) {
      await this.page.locator(this.createPincodeInput).fill(pincode);
      await this.page.waitForTimeout(500);
    }
    if (address) await this.page.locator(this.createAddressTextarea).fill(address);
    await this.page.locator(this.wizardNextButton).click();
    await this.page.locator(this.createContactNameInput).waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Complete Step 4 of Partner Creation & Submit
   */
  async fillStep4AndSubmit({ contactName, mobile, email } = {}) {
    this.logger.info('Filling Step 4 (Contact Details) and Submitting Partner Creation');
    if (contactName) await this.page.locator(this.createContactNameInput).fill(contactName);
    if (mobile) await this.page.locator(this.createContactMobileInput).fill(mobile);
    if (email) await this.page.locator(this.createContactEmailInput).fill(email);
    
    // We start waiting for the toast BEFORE clicking submit to avoid race conditions
    const toastLocator = this.page.locator('.MuiAlert-message, .toast-message, [role="alert"], #notistack-snackbar').first();
    const toastPromise = toastLocator.waitFor({ state: 'visible', timeout: 15000 }).catch(() => null);
    
    await this.page.locator(this.createSubmitButton).click();
    
    // Wait for the toast promise to resolve
    await toastPromise;
    try {
        return await toastLocator.innerText();
    } catch(e) {
        return null;
    }
  }

  /**
   * Access a partner account directly from listing
   */
  async accessPartnerAccount(index = 0) {
    this.logger.info(`Accessing partner account at index ${index}`);
    const btn = this.page.locator(this.accessAccountButtons).nth(index);
    await btn.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Get validation error text near a field
   */
  async getFieldErrorText(fieldLocator) {
    this.logger.info(`Getting field error text for: ${fieldLocator}`);
    try {
      // Find the closest sibling or parent container error message
      const errorText = await this.page.locator(`${fieldLocator} ~ p, ${fieldLocator} ~ span, ${fieldLocator} + p, ${fieldLocator} + span`).first().innerText({ timeout: 2000 });
      return errorText;
    } catch (e) {
      return null;
    }
  }

  /**
   * Wait for specific toast message
   */
  async waitForToastMessage(message, timeout = 5000) {
    this.logger.info(`Waiting for toast message containing: ${message}`);
    const toast = this.page.locator('.MuiAlert-message, .toast-message, [role="alert"]').filter({ hasText: new RegExp(message, 'i') }).first();
    await toast.waitFor({ state: 'visible', timeout });
    return await toast.innerText();
  }
  /**
   * Get validation error text near a field
   */
  async getFieldErrorText(fieldLocator) {
    this.logger.info(`Getting field error text for: ${fieldLocator}`);
    try {
      const control = this.page.locator(fieldLocator).locator('xpath=ancestor::*[contains(@class, "MuiFormControl-root") or contains(@class, "form-group") or contains(@class, "input-container")]').first();
      // Target specific error classes on paragraph tags ONLY to avoid capturing the field label (which also gets .Mui-error)
      const errorEl = control.locator('p.Mui-error, p.MuiFormHelperText-root, p.error-text, p.text-danger, p[id$="-helper-text"]').first();
      if (await errorEl.isVisible({ timeout: 1000 })) {
        return await errorEl.innerText();
      }
      throw new Error("No error paragraph found");
    } catch (e) {
      // Fallback: look for generic sibling error paragraph
      try {
        return await this.page.locator(`${fieldLocator} ~ p, ${fieldLocator} + p`).first().innerText({ timeout: 1000 });
      } catch (e2) {
        return null;
      }
    }
  }

  /**
   * Wait for specific toast message
   */
  async waitForToastMessage(timeout = 15000) {
    this.logger.info(`Waiting for toast message`);
    const toast = this.page.locator('.MuiAlert-message, .toast-message, [role="alert"], #notistack-snackbar').first();
    await toast.waitFor({ state: 'visible', timeout });
    return await toast.innerText();
  }
}

module.exports = PartnerPage;

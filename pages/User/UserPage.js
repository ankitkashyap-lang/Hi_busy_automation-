const BasePage = require('../../base/BasePage.js');
const Logger = require('../../utils/logger.js');

/**
 * UserPage - Page Object for User Management functionality
 */
class UserPage extends BasePage {
  constructor(page) {
    super(page);
    this.logger = Logger.getInstance();

    // Locators
    this.usersMenuLink = 'a:has-text("person Users"), a[href*="users"]';
    this.createUserButton = 'button:has-text("create"), button[aria-label="create"], span[title="Create"] button';
    
    // Create User Form Locators (using data-testids found from QA1)
    this.userNameInput = '[data-testid="create-text-user-name-0-0-input"]';
    this.userMobileInput = '[data-testid="create-text-username-0-1-input"]';
    this.userEmailInput = '[data-testid="create-text-email-0-2-input"]';
    this.saveButton = 'button:has-text("Save")';
    
    // Generic error locator
    this.errorParagraph = 'p.Mui-error';
  }

  /**
   * Navigate to Users page from the partner dashboard menu
   */
  async navigateToUsers() {
    this.logger.info('Navigating to Users page via menu');
    await this.page.getByRole('button', { name: 'menu' }).first().click();
    await this.page.waitForTimeout(500);
    await this.page.locator(this.usersMenuLink).click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Open the Create User drawer
   */
  async openCreateUserDrawer() {
    this.logger.info('Opening Create User drawer');
    await this.page.locator(this.createUserButton).first().click();
    await this.page.locator(this.userNameInput).waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Submit the empty form to trigger validation errors
   */
  async triggerValidationErrors() {
    this.logger.info('Clicking Save to trigger validation errors');
    await this.page.locator(this.saveButton).click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Fill the Create User form
   */
  async fillUserForm({ name, mobile, email }) {
    this.logger.info(`Filling user form: ${name}, ${mobile}, ${email}`);
    if (name) await this.page.locator(this.userNameInput).fill(name);
    if (mobile) await this.page.locator(this.userMobileInput).fill(mobile);
    if (email) await this.page.locator(this.userEmailInput).fill(email);
  }

  /**
   * Save the User form
   */
  async saveUser() {
    this.logger.info('Saving user');
    await this.page.locator(this.saveButton).click();
  }

  /**
   * Verify all field errors say "Cannot be blank."
   */
  async verifyEmptyFieldErrors() {
    this.logger.info('Verifying empty field validation errors');
    const errors = this.page.locator(this.errorParagraph);
    const count = await errors.count();
    
    const messages = [];
    for (let i = 0; i < count; i++) {
        messages.push(await errors.nth(i).innerText());
    }
    return messages;
  }

  /**
   * Get validation error text near a specific field
   */
  async getFieldErrorText(fieldLocator) {
    this.logger.info(`Getting field error text for: ${fieldLocator}`);
    try {
      const control = this.page.locator(fieldLocator).locator('xpath=ancestor::*[contains(@class, "MuiFormControl-root")]').first();
      const errorEl = control.locator('p.Mui-error').first();
      if (await errorEl.isVisible({ timeout: 1000 })) {
        return await errorEl.innerText();
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Click the "more info" (three dots or close) button on a user card
   */
  async clickMoreInfo(userName) {
    this.logger.info(`Clicking more info for user: ${userName}`);
    // Check if a more-info button is already visible in the card
    let card = null;
    if (userName) {
      const nameLocator = this.page.locator(`text=${userName}`).first();
      if (await nameLocator.count() > 0) {
        card = nameLocator.locator('xpath=ancestor::*[contains(@class, "MuiPaper-root") or contains(@data-testid, "list-item")]').first();
      }
    }

    if (card && await card.count() > 0) {
      const moreInfoBtns = card.locator('button[aria-label="more info"], button[data-testid$="-more-info-btn"]');
      const count = await moreInfoBtns.count();
      for (let i = 0; i < count; i++) {
        if (await moreInfoBtns.nth(i).isVisible()) {
          await moreInfoBtns.nth(i).click();
          return;
        }
      }
    }

    // Fallback: click any visible more-info/close button
    const anyMoreInfo = this.page.locator('button[data-testid$="-more-info-btn"]:visible, button[aria-label="more info"]:visible').first();
    if (await anyMoreInfo.isVisible({ timeout: 2000 })) {
      await anyMoreInfo.click();
    }
  }

  /**
   * Toggle the enable/disable switch on the back of the card
   */
  async toggleEnableDisable() {
    this.logger.info('Toggling enable/disable switch');
    // The switch base (span) has the click handler, not the hidden input
    const switches = this.page.locator('span[data-testid$="-enable-disable-switch"]');
    const count = await switches.count();
    let clickedSwitch = null;
    
    for (let i = 0; i < count; i++) {
        if (await switches.nth(i).isVisible()) {
            clickedSwitch = switches.nth(i);
            break;
        }
    }
    
    if (!clickedSwitch) {
        // Fallback to first if none visible
        clickedSwitch = switches.first();
    }
    
    const input = clickedSwitch.locator('input[type="checkbox"]');
    const isChecked = await input.isChecked();
    
    // In Material-UI, clicking the hidden input with force:true is the most reliable way to trigger the onChange event
    await input.click({ force: true });
    
    // Handle the confirmation dialog if it appears
    this.logger.info('Checking for confirmation dialog');
    try {
      const visibleOkBtn = this.page.locator('#list-approval-dialog-ok-btn:visible, button:has-text("OK"):visible, button:has-text("Yes"):visible').first();
      if (await visibleOkBtn.isVisible({ timeout: 2000 })) {
        this.logger.info('Confirmation dialog appeared, clicking OK');
        await visibleOkBtn.click();
      }
    } catch (e) {
      // Dialog not shown
    }
    
    await this.page.waitForTimeout(1500);
    return !isChecked; // Returns new state
  }

  /**
   * Get the color style of the username text
   */
  async getUserNameColor(userName) {
    this.logger.info(`Getting text color for user: ${userName}`);
    const nameEl = this.page.locator(`text="${userName}"`).first();
    // Wait for the element to be visible
    await nameEl.waitFor({ state: 'visible', timeout: 5000 });
    // Get computed color
    const color = await nameEl.evaluate(el => window.getComputedStyle(el).color);
    return color;
  }

  /**
   * Open the User Details drawer by clicking on the user card
   */
  async openUserDetails(userName) {
    this.logger.info(`Opening user details for: ${userName}`);
    const card = this.page.locator(`text=${userName}`).locator('xpath=ancestor::*[contains(@class, "MuiPaper-root")]').first();
    await card.click();
    await this.page.locator('[data-testid="slide-close-btn"]').waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Edit User Details (Name, Mobile, Email, Role)
   */
  async editUserDetails({ name, mobile, email, roleIndex }) {
    this.logger.info(`Editing user details...`);
    
    if (name) {
      await this.page.getByTestId('details-header-name-0-0-edit-btn').click();
      await this.page.waitForTimeout(500);
      
      // Try to find the input within the header, or just use focused element
      const nameInput = this.page.locator('[data-testid*="name"][data-testid*="input"]').first();
      if (await nameInput.isVisible()) {
          await nameInput.fill(name);
      } else {
          await this.page.keyboard.press('Control+A');
          await this.page.keyboard.press('Backspace');
          await this.page.keyboard.type(name);
      }
      
      await this.page.getByTestId('details-header-text-name-0-0-apply-btn').click();
      await this.page.waitForTimeout(1000);
    }
    
    if (mobile) {
      const mobileInput = this.page.getByTestId('details-text-mobile-0-0-input');
      await mobileInput.click();
      await mobileInput.fill(mobile);
      await this.page.getByTestId('details-tabpanel-0').click(); // Click out to save
      await this.page.waitForTimeout(1000);
    }
    
    if (email) {
      const emailInput = this.page.getByTestId('details-text-email-1-0-input');
      await emailInput.click();
      await emailInput.fill(email);
      await emailInput.press('Enter'); // Save via Enter
      await this.page.waitForTimeout(1000);
    }
    
    if (roleIndex !== undefined) {
      await this.page.getByTestId('details-tab-role-1').click();
      await this.page.getByTestId('details-select-name-0-0-open-btn').click();
      await this.page.waitForTimeout(1000);
      const selectBtn = this.page.locator('#drawer [data-testid$="-select-btn"], [data-testid="drawer"] [data-testid$="-select-btn"]').first();
      await selectBtn.waitFor({ state: 'visible', timeout: 5000 });
      await selectBtn.click();
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Close the user details drawer
   */
  async closeUserDetails() {
    this.logger.info('Closing user details drawer');
    await this.page.getByTestId('slide-close-btn').click();
    await this.page.waitForTimeout(1000);
  }
}

module.exports = UserPage;

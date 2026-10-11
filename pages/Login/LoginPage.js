const BasePage = require('../../base/BasePage.js');
const Logger = require('../../utils/logger.js');

/**
 * LoginPage - Page Object for Login functionality
 * Manages all login-related UI interactions and locators
 */
class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.logger = Logger.getInstance();

    // Login form locators
    this.emailField = '#usr';  // Email ID field with id="usr"
    this.emailFieldByPlaceholder = this.page.getByPlaceholder('Email ID');
    this.emailFieldByLabel = this.page.getByLabel('Email');

    this.passwordField = '#pwd';  // Password field with id="pwd"
    this.passwordFieldByPlaceholder = this.page.getByPlaceholder('Password');
    this.passwordFieldByLabel = this.page.getByLabel('Password');

    this.loginButton = 'button[type="submit"]';  // Login submit button
    this.loginButtonByRole = this.page.getByRole('button', { name: 'Login' });

    // Error/Validation messages
    this.errorMessage = 'text=Invalid username or password';
    this.invalidCredentialsError = 'text=Invalid username or password';
    this.validationError = '.validation-error, .field-error';
    this.emailError = '[data-testid="email-error"], .email-error';
    this.passwordError = '[data-testid="password-error"], .password-error';

    // Form elements
    this.loginForm = '#frmLogin, [data-testid="login-form"]';
    this.clearButton = 'button:has-text("Clear"), button[type="reset"]';

    // Success/Navigation
    this.loginPageTitle = 'h1:has-text("Login"), h1:has-text("Sign In")';
    this.logoutButton = 'text=/Logout|Log out/i';  // Logout button in menu

    // Loading states
    this.loadingSpinner = '.spinner, .loader, [role="status"]';
    this.submitButton = 'button[type="submit"]';
  }

  /**
   * Navigate to login page
   */
  async navigateToLogin(baseUrl = '') {
    const emailEl = this.page.locator(this.emailField);
    const isEmailVisible = await emailEl.isVisible().catch(() => false);
    const currentUrl = this.page.url();
    const isDashboard = currentUrl.includes('dashboard') || currentUrl.includes('admin') || currentUrl.includes('partner') || currentUrl.includes('reseller');

    if (isEmailVisible && !isDashboard) {
      this.logger.info('Already on login page, reusing existing page');
      await emailEl.fill('').catch(() => {});
      await this.page.locator(this.passwordField).fill('').catch(() => {});
      return;
    }

    if (isDashboard) {
      this.logger.info('Currently on dashboard, clearing session to return to login page');
      await this.page.context().clearCookies();
      await this.page.evaluate(() => {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (e) {}
      }).catch(() => {});
    }

    this.logger.info('Navigating to login page');
    const url = baseUrl || this.page.url();
    await this.navigate(url);
    await this.waitForLoginPageToLoad();
  }

  /**
   * Wait for login page to fully load
   */
  async waitForLoginPageToLoad(timeout = this.timeout) {
    this.logger.info('Waiting for login page to load');
    await this.waitForElement(this.emailField, timeout);
    await this.waitForElement(this.passwordField, timeout);
    await this.waitForElement(this.loginButton, timeout);
  }

  /**
   * Check if login page is visible
   */
  async isLoginPageVisible() {
    return await this.isVisible(this.loginForm);
  }

  /**
   * Enter email address
   */
  async enterEmail(email) {
    this.logger.info('Entering email address');
    await this.fill(this.emailField, email);
  }

  /**
   * Enter password
   */
  async enterPassword(password) {
    this.logger.info('Entering password');
    await this.fill(this.passwordField, password);
  }

  /**
   * Click login button
   */
  async clickLogin() {
    this.logger.info('Clicking login button');
    await this.click(this.loginButton);
  }

  /**
   * Click logout button
   */
  async clickLogout() {
    this.logger.info('Opening menu to access logout button');
    // First, click the menu button to open menu
    const menuButton = this.page.locator('[aria-label="menu"]');
    const menuVisible = await menuButton.isVisible().catch(() => false);
    
    if (menuVisible) {
      await menuButton.click();
      await this.page.waitForTimeout(500);  // Wait for menu to open
    }
    
    this.logger.info('Clicking logout button');
    await this.click(this.logoutButton);
  }

  /**
   * Clear email field
   */
  async clearEmailField() {
    this.logger.info('Clearing email field');
    await this.clearField(this.emailField);
  }

  /**
   * Clear password field
   */
  async clearPasswordField() {
    this.logger.info('Clearing password field');
    await this.clearField(this.passwordField);
  }

  /**
   * Clear form (if Clear button exists)
   */
  async clearForm() {
    this.logger.info('Clearing login form');
    const clearButtonExists = await this.doesElementExist(this.clearButton);
    if (clearButtonExists) {
      await this.click(this.clearButton);
    } else {
      await this.clearEmailField();
      await this.clearPasswordField();
    }
  }

  /**
   * Get error message text
   */
  async getErrorMessage() {
    this.logger.info('Getting error message');
    try {
      await this.waitForElement(this.errorMessage, 3000);
      return await this.getText(this.errorMessage);
    } catch (error) {
      this.logger.warn(`Error message not found: ${error.message}`);
      const emailMsg = await this.getFieldValidationMessage(this.emailField);
      if (emailMsg) return emailMsg;
      const pwdMsg = await this.getFieldValidationMessage(this.passwordField);
      if (pwdMsg) return pwdMsg;
      return null;
    }
  }

  /**
   * Get email field validation error
   */
  async getEmailError() {
    this.logger.info('Getting email validation error');
    const errorExists = await this.doesElementExist(this.emailError);
    if (errorExists) {
      return await this.getText(this.emailError);
    }
    return null;
  }

  /**
   * Get password field validation error
   */
  async getPasswordError() {
    this.logger.info('Getting password validation error');
    const errorExists = await this.doesElementExist(this.passwordError);
    if (errorExists) {
      return await this.getText(this.passwordError);
    }
    return null;
  }

  /**
   * Check if error message is displayed
   */
  async isErrorMessageDisplayed() {
    try {
      // Check if invalid credentials error message is visible
      await this.waitForElement(this.invalidCredentialsError, 3000).catch(() => {});
      const errorVisible = await this.isVisible(this.invalidCredentialsError);
      if (errorVisible) return true;

      const valError = await this.isVisible(this.validationError);
      if (valError) return true;

      const hasEmailVal = await this.hasFieldValidationError(this.emailField);
      if (hasEmailVal) return true;
      const hasPwdVal = await this.hasFieldValidationError(this.passwordField);
      if (hasPwdVal) return true;

      return false;
    } catch (error) {
      this.logger.error(`Failed to check error message: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if field has validation error (HTML5 validation)
   */
  async hasFieldValidationError(fieldSelector) {
    try {
      const validationMessage = await this.page.locator(fieldSelector).evaluate(el => {
        return el.validationMessage || '';
      });
      const hasError = validationMessage && validationMessage.length > 0;
      this.logger.info(`Field validation error on ${fieldSelector}: ${hasError} (${validationMessage})`);
      return hasError;
    } catch (error) {
      this.logger.error(`Failed to check field validation: ${error.message}`);
      return false;
    }
  }

  /**
   * Get field validation message
   */
  async getFieldValidationMessage(fieldSelector) {
    try {
      const validationMessage = await this.page.locator(fieldSelector).evaluate(el => {
        return el.validationMessage || '';
      });
      return validationMessage;
    } catch (error) {
      this.logger.error(`Failed to get field validation message: ${error.message}`);
      return null;
    }
  }

  /**
   * Check if validation error is displayed
   */
  async isValidationErrorDisplayed() {
    return await this.isVisible(this.validationError);
  }

  /**
   * Get email field value
   */
  async getEmailValue() {
    this.logger.info('Getting email field value');
    return await this.getInputValue(this.emailField);
  }

  /**
   * Get password field value
   */
  async getPasswordValue() {
    this.logger.info('Getting password field value');
    return await this.getInputValue(this.passwordField);
  }

  /**
   * Verify password field is masked
   */
  async isPasswordFieldMasked() {
    this.logger.info('Checking if password field is masked');
    const fieldType = await this.getAttributeValue(this.passwordField, 'type');
    return fieldType === 'password';
  }

  /**
   * Check if login button is enabled
   */
  async isLoginButtonEnabled() {
    return await this.isEnabled(this.loginButton);
  }

  /**
   * Check if login button is disabled
   */
  async isLoginButtonDisabled() {
    return await this.isDisabled(this.loginButton);
  }

  /**
   * Check if loading spinner is visible
   */
  async isLoadingSpinnerVisible() {
    const spinnerExists = await this.doesElementExist(this.loadingSpinner);
    if (spinnerExists) {
      return await this.isVisible(this.loadingSpinner);
    }
    return false;
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoadingToComplete(timeout = this.timeout) {
    this.logger.info('Waiting for loading to complete');
    const spinnerExists = await this.doesElementExist(this.loadingSpinner);
    if (spinnerExists) {
      await this.waitForElementToBeHidden(this.loadingSpinner, timeout);
    }
  }

  /**
   * Submit login form using Enter key
   */
  async submitLoginWithEnterKey() {
    this.logger.info('Submitting login form with Enter key');
    await this.focus(this.passwordField);
    await this.pressKey('Enter');
  }

  /**
   * Double click login button
   */
  async doubleClickLoginButton() {
    this.logger.info('Double clicking login button');
    await this.doubleClick(this.loginButton);
  }

  /**
   * Perform complete login
   */
  async login(email, password) {
    this.logger.info(`Performing login with email: ${email}`);
    await this.waitForLoginPageToLoad();
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickLogin();
    await this.waitForLoadingToComplete();
  }

  /**
   * Verify all login page elements are visible
   */
  async verifyAllLoginElementsVisible() {
    this.logger.info('Verifying all login page elements are visible');
    const emailVisible = await this.isVisible(this.emailField);
    const passwordVisible = await this.isVisible(this.passwordField);
    const buttonVisible = await this.isVisible(this.loginButton);
    return emailVisible && passwordVisible && buttonVisible;
  }

  /**
   * Get page title
   */
  async getLoginPageTitle() {
    this.logger.info('Getting login page title');
    return await this.getTitle();
  }

  /**
   * Navigate by pressing Tab key
   */
  async navigateWithTabKey(times = 1) {
    this.logger.info(`Navigating with Tab key ${times} times`);
    for (let i = 0; i < times; i++) {
      await this.pressKey('Tab');
    }
  }

  /**
   * Verify tab order
   */
  async verifyTabOrder() {
    this.logger.info('Verifying tab order');
    await this.focus(this.emailField);
    await this.pressKey('Tab');
    const focused = await this.page.evaluate(() => document.activeElement.tagName);
    return focused !== null;
  }

  /**
   * Click browser back button
   */
  async clickBrowserBack() {
    this.logger.info('Clicking browser back button');
    await this.goBack();
  }

  /**
   * Refresh page
   */
  async refreshPage() {
    this.logger.info('Refreshing page');
    await this.reload();
    await this.waitForLoginPageToLoad();
  }
}

module.exports = LoginPage;

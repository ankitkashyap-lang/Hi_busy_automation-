const LoginPage = require('../pages/Login/LoginPage.js');
const Logger = require('../utils/logger.js');
const urls = require('../config/urls.js');
const globalConfig = require('../config/globalConfig.js');

/**
 * LoginFlow - Business Flow for Login operations
 * Orchestrates login scenarios at the business level
 */
class LoginFlow {
  constructor(page) {
    this.page = page;
    this.loginPage = new LoginPage(page);
    this.logger = Logger.getInstance();
  }

  /**
   * Perform basic login
   */
  async login(credentials) {
    this.logger.info(`Starting login flow for user: ${credentials.email}`);
    this.logger.separator();

    try {
      await this.loginPage.navigateToLogin(urls.BASE_URL);
      await this.loginPage.login(credentials.email, credentials.password);
      this.logger.info('Login flow completed successfully');
    } catch (error) {
      this.logger.error(`Login flow failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Login and verify dashboard
   */
  async loginAndVerifyDashboard(credentials, expectedDashboard) {
    this.logger.info(
      `Login and verify dashboard: ${expectedDashboard} for user: ${credentials.email}`
    );
    this.logger.separator();

    try {
      await this.login(credentials);

      // Wait for dashboard to load
      await this.page.waitForURL(
        (url) => url.pathname.includes(expectedDashboard.toLowerCase()),
        { timeout: globalConfig.NAVIGATION_TIMEOUT }
      );

      this.logger.info(`Dashboard verified: ${expectedDashboard}`);
    } catch (error) {
      this.logger.error(`Dashboard verification failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Login and get error message
   */
  async loginAndGetError(credentials) {
    this.logger.info(`Login with credentials that should fail: ${credentials.email}`);
    this.logger.separator();

    try {
      await this.loginPage.navigateToLogin(urls.BASE_URL);
      await this.loginPage.login(credentials.email, credentials.password);

      // Wait for error message
      await this.page.waitForTimeout(2000);

      const errorMessage = await this.loginPage.getErrorMessage();
      this.logger.info(`Error message received: ${errorMessage}`);
      return errorMessage;
    } catch (error) {
      this.logger.error(`Login error retrieval failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Login and logout
   */
  async loginAndLogout(credentials) {
    this.logger.info(`Login and logout flow for user: ${credentials.email}`);
    this.logger.separator();

    try {
      await this.login(credentials);
      this.logger.info('Login successful, proceeding to logout');

      // Wait a moment for dashboard to load
      await this.page.waitForTimeout(2000);

      await this.loginPage.clickLogout();
      this.logger.info('Logout completed');
    } catch (error) {
      this.logger.error(`Login/Logout flow failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Login and refresh page
   */
  async loginAndRefreshPage(credentials) {
    this.logger.info(`Login and refresh page for user: ${credentials.email}`);
    this.logger.separator();

    try {
      await this.login(credentials);
      this.logger.info('Login successful, refreshing page');

      // Wait for dashboard to stabilize
      await this.page.waitForTimeout(1500);

      await this.loginPage.refreshPage();
      this.logger.info('Page refreshed, verifying session persists');
    } catch (error) {
      this.logger.error(`Login/Refresh flow failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Multiple failed login attempts
   */
  async multipleFailedLoginAttempts(credentials, attemptCount = 3) {
    this.logger.info(
      `Performing ${attemptCount} failed login attempts for user: ${credentials.email}`
    );
    this.logger.separator();

    try {
      for (let i = 1; i <= attemptCount; i++) {
        this.logger.info(`Attempt ${i} of ${attemptCount}`);
        await this.loginPage.navigateToLogin(urls.BASE_URL);
        await this.loginPage.login(credentials.email, credentials.password);

        const errorMessage = await this.loginPage.getErrorMessage();
        this.logger.info(`Attempt ${i} - Error: ${errorMessage}`);

        await this.page.waitForTimeout(1000);
      }

      this.logger.info('Multiple failed login attempts completed');
    } catch (error) {
      this.logger.error(`Multiple login attempts failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retry login after failure
   */
  async retryLoginAfterFailure(invalidCredentials, validCredentials) {
    this.logger.info('Retry login after failure flow');
    this.logger.separator();

    try {
      // First attempt with invalid credentials
      this.logger.info('First attempt with invalid credentials');
      await this.loginPage.navigateToLogin(urls.BASE_URL);
      await this.loginPage.login(invalidCredentials.email, invalidCredentials.password);

      const errorMessage = await this.loginPage.getErrorMessage();
      this.logger.info(`Error message on failed attempt: ${errorMessage}`);

      // Retry with valid credentials
      this.logger.info('Retrying with valid credentials');
      await this.page.waitForTimeout(1000);
      await this.loginPage.clearForm();
      await this.loginPage.login(validCredentials.email, validCredentials.password);

      this.logger.info('Retry login completed successfully');
    } catch (error) {
      this.logger.error(`Retry login flow failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Login with Enter key
   */
  async loginWithEnterKey(credentials) {
    this.logger.info(`Login with Enter key for user: ${credentials.email}`);
    this.logger.separator();

    try {
      await this.loginPage.navigateToLogin(urls.BASE_URL);
      await this.loginPage.enterEmail(credentials.email);
      await this.loginPage.enterPassword(credentials.password);
      await this.loginPage.submitLoginWithEnterKey();
      await this.loginPage.waitForLoadingToComplete();

      this.logger.info('Login with Enter key completed');
    } catch (error) {
      this.logger.error(`Login with Enter key failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Double click login button
   */
  async doubleClickLoginButton(credentials) {
    this.logger.info(`Double click login button for user: ${credentials.email}`);
    this.logger.separator();

    try {
      await this.loginPage.navigateToLogin(urls.BASE_URL);
      await this.loginPage.enterEmail(credentials.email);
      await this.loginPage.enterPassword(credentials.password);
      await this.loginPage.doubleClickLoginButton();
      await this.loginPage.waitForLoadingToComplete();

      this.logger.info('Double click login completed');
    } catch (error) {
      this.logger.error(`Double click login failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Login and access dashboard directly
   */
  async loginAndAccessDashboardDirectly(credentials, dashboardUrl) {
    this.logger.info(`Login and access dashboard directly: ${dashboardUrl}`);
    this.logger.separator();

    try {
      // Log in first
      await this.login(credentials);
      this.logger.info('Login successful, navigating to dashboard directly');

      // Navigate directly to dashboard
      await this.page.goto(dashboardUrl, { waitUntil: 'networkidle' });
      this.logger.info('Dashboard accessed directly');
    } catch (error) {
      this.logger.error(`Dashboard direct access failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Login and browse back
   */
  async loginAndBrowseBack(credentials) {
    this.logger.info(`Login and browse back for user: ${credentials.email}`);
    this.logger.separator();

    try {
      // First navigate to a page
      await this.page.goto(urls.BASE_URL);
      await this.page.waitForTimeout(1000);

      // Then login
      await this.login(credentials);
      await this.page.waitForTimeout(2000);

      // Click browser back
      await this.loginPage.clickBrowserBack();
      this.logger.info('Browser back button clicked');
    } catch (error) {
      this.logger.error(`Browse back flow failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Login and wait for timeout
   */
  async loginAndWaitForTimeout(credentials, timeoutMs = 60000) {
    this.logger.info(
      `Login and wait for session timeout (${timeoutMs}ms) for user: ${credentials.email}`
    );
    this.logger.separator();

    try {
      await this.login(credentials);
      this.logger.info(`Waiting for session timeout: ${timeoutMs}ms`);
      await this.page.waitForTimeout(timeoutMs);

      this.logger.info('Timeout period completed');
    } catch (error) {
      this.logger.error(`Timeout flow failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Logout and login as different role
   */
  async logoutAndLoginAsDifferentRole(firstCredentials, secondCredentials) {
    this.logger.info(
      `Logout and login as different role: ${secondCredentials.email}`
    );
    this.logger.separator();

    try {
      // First login
      this.logger.info(`First login as: ${firstCredentials.email}`);
      await this.login(firstCredentials);
      await this.page.waitForTimeout(1500);

      // Logout
      this.logger.info('Logging out');
      await this.loginPage.clickLogout();
      await this.page.waitForTimeout(1500);

      // Login as different role
      this.logger.info(`Second login as: ${secondCredentials.email}`);
      await this.login(secondCredentials);

      this.logger.info('Role switching completed');
    } catch (error) {
      this.logger.error(`Role switching failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify password field is masked
   */
  async verifyPasswordFieldMasked() {
    this.logger.info('Verifying password field is masked');
    this.logger.separator();

    try {
      await this.loginPage.navigateToLogin(urls.BASE_URL);
      const isMasked = await this.loginPage.isPasswordFieldMasked();

      if (isMasked) {
        this.logger.info('Password field is properly masked');
      } else {
        this.logger.warn('Password field is NOT masked');
      }

      return isMasked;
    } catch (error) {
      this.logger.error(`Password field verification failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify all login page elements
   */
  async verifyLoginPageElements() {
    this.logger.info('Verifying all login page elements');
    this.logger.separator();

    try {
      await this.loginPage.navigateToLogin(urls.BASE_URL);
      const allVisible = await this.loginPage.verifyAllLoginElementsVisible();

      if (allVisible) {
        this.logger.info('All login page elements are visible');
      } else {
        this.logger.warn('Some login page elements are missing');
      }

      return allVisible;
    } catch (error) {
      this.logger.error(`Login page verification failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get login page title
   */
  async getPageTitle() {
    this.logger.info('Getting login page title');
    return await this.loginPage.getLoginPageTitle();
  }

  /**
   * Navigate with keyboard (Tab key)
   */
  async navigateWithKeyboard(tabCount = 3) {
    this.logger.info(`Navigating with Tab key ${tabCount} times`);
    this.logger.separator();

    try {
      await this.loginPage.navigateToLogin(urls.BASE_URL);
      await this.loginPage.navigateWithTabKey(tabCount);

      this.logger.info('Keyboard navigation completed');
    } catch (error) {
      this.logger.error(`Keyboard navigation failed: ${error.message}`);
      throw error;
    }
  }
}

module.exports = LoginFlow;

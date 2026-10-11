const { test as base } = require('@playwright/test');
const Logger = require('../utils/logger.js');
const globalConfig = require('../config/globalConfig.js');
const urls = require('../config/urls.js');

/**
 * base.fixture.js - Base Test Fixtures
 * Common fixtures for all tests
 */
const baseFixture = base.extend({
  /**
   * logger - Logger instance for tests
   */
  logger: async ({}, use) => {
    const logger = Logger.getInstance();
    logger.info('Setting up logger fixture');

    await use(logger);

    logger.info('Cleaning up logger fixture');
  },

  /**
   * config - Global configuration object
   */
  config: async ({}, use) => {
    const logger = Logger.getInstance();
    logger.info('Setting up config fixture');

    const config = {
      baseURL: globalConfig.BASE_URL,
      environment: globalConfig.ENVIRONMENT,
      browser: globalConfig.BROWSER,
      headless: globalConfig.HEADLESS,
      logLevel: globalConfig.LOG_LEVEL,
      navigationTimeout: globalConfig.NAVIGATION_TIMEOUT,
      actionTimeout: globalConfig.ACTION_TIMEOUT,
    };

    logger.info('✓ Config fixture ready');
    await use(config);

    logger.info('Cleaning up config fixture');
  },

  /**
   * urls - Application URLs
   */
  appUrls: async ({}, use) => {
    const logger = Logger.getInstance();
    logger.info('Setting up appUrls fixture');

    const appUrls = {
      login: urls.LOGIN,
      adminDashboard: urls.ADMIN_DASHBOARD,
      busyTeamDashboard: urls.BUSY_TEAM_DASHBOARD,
      channelPartnerDashboard: urls.CHANNEL_PARTNER_DASHBOARD,
      resellerDashboard: urls.RESELLER_DASHBOARD,
      subscriptions: urls.SUBSCRIPTIONS,
      customers: urls.CUSTOMERS,
      wallet: urls.WALLET,
      reports: urls.REPORTS,
    };

    logger.info('✓ AppUrls fixture ready');
    await use(appUrls);

    logger.info('Cleaning up appUrls fixture');
  },

  /**
   * testData - Container for test-specific data
   */
  testData: async ({}, use) => {
    const logger = Logger.getInstance();
    logger.info('Setting up testData fixture');

    const testData = {
      data: {},
      set: (key, value) => {
        testData.data[key] = value;
        logger.info(`Test data set: ${key}`);
      },
      get: (key) => {
        return testData.data[key];
      },
      clear: () => {
        testData.data = {};
        logger.info('Test data cleared');
      },
      getAll: () => testData.data,
    };

    logger.info('✓ TestData fixture ready');
    await use(testData);

    logger.info('Cleaning up testData fixture');
  },

  /**
   * pageUtils - Common page utilities
   */
  pageUtils: async ({ page }, use) => {
    const logger = Logger.getInstance();
    logger.info('Setting up pageUtils fixture');

    const pageUtils = {
      /**
       * Take screenshot on failure
       */
      takeScreenshot: async (name) => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `./screenshots/${name}-${timestamp}.png`;
        await page.screenshot({ path: filename, fullPage: true });
        logger.info(`Screenshot saved: ${filename}`);
        return filename;
      },

      /**
       * Wait for navigation with timeout
       */
      waitForNavigation: async (navigationPromise, timeout = globalConfig.NAVIGATION_TIMEOUT) => {
        return Promise.race([
          navigationPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Navigation timeout')), timeout)),
        ]);
      },

      /**
       * Check if element is visible
       */
      isElementVisible: async (selector) => {
        try {
          await page.waitForSelector(selector, { timeout: 1000 });
          return await page.isVisible(selector);
        } catch {
          return false;
        }
      },

      /**
       * Get current URL
       */
      getCurrentUrl: () => {
        return page.url();
      },

      /**
       * Get page title
       */
      getTitle: async () => {
        return await page.title();
      },

      /**
       * Perform login using credentials
       */
      performLogin: async (email, password) => {
        const emailInput = 'input[type="email"]';
        const passwordInput = 'input[type="password"]';
        const loginButton = 'button:has-text("Login")';

        await page.fill(emailInput, email);
        await page.fill(passwordInput, password);
        await page.click(loginButton);
      },

      /**
       * Accept alert
       */
      acceptAlert: async () => {
        page.once('dialog', (dialog) => dialog.accept());
      },

      /**
       * Dismiss alert
       */
      dismissAlert: async () => {
        page.once('dialog', (dialog) => dialog.dismiss());
      },

      /**
       * Wait for network idle
       */
      waitForNetworkIdle: async (timeout = globalConfig.NAVIGATION_TIMEOUT) => {
        await page.waitForLoadState('networkidle', { timeout });
      },

      /**
       * Get element text
       */
      getElementText: async (selector) => {
        return await page.textContent(selector);
      },

      /**
       * Check if element exists
       */
      elementExists: async (selector) => {
        const count = await page.locator(selector).count();
        return count > 0;
      },

      /**
       * Reload page
       */
      reloadPage: async () => {
        await page.reload();
      },

      /**
       * Navigate to URL
       */
      navigateTo: async (url) => {
        await page.goto(url, { waitUntil: 'networkidle' });
      },
    };

    logger.info('✓ PageUtils fixture ready');
    await use(pageUtils);

    logger.info('Cleaning up pageUtils fixture');
  },

  /**
   * assertions - Common assertion utilities
   */
  assertions: async ({}, use) => {
    const logger = Logger.getInstance();
    logger.info('Setting up assertions fixture');

    const { expect } = require('@playwright/test');

    const assertions = {
      /**
       * Assert element is visible
       */
      isVisible: async (page, selector) => {
        await expect(page.locator(selector)).toBeVisible();
        logger.info(`✓ Element is visible: ${selector}`);
      },

      /**
       * Assert element is hidden
       */
      isHidden: async (page, selector) => {
        await expect(page.locator(selector)).toBeHidden();
        logger.info(`✓ Element is hidden: ${selector}`);
      },

      /**
       * Assert text is on page
       */
      textExists: async (page, text) => {
        await expect(page.getByText(text)).toBeTruthy();
        logger.info(`✓ Text found on page: "${text}"`);
      },

      /**
       * Assert URL contains string
       */
      urlContains: async (page, urlPart) => {
        await expect(page).toHaveURL(new RegExp(urlPart));
        logger.info(`✓ URL contains: ${urlPart}`);
      },

      /**
       * Assert page title
       */
      titleIs: async (page, title) => {
        await expect(page).toHaveTitle(title);
        logger.info(`✓ Page title is: ${title}`);
      },
    };

    logger.info('✓ Assertions fixture ready');
    await use(assertions);

    logger.info('Cleaning up assertions fixture');
  },

  /**
   * testContext - Complete test context with all utilities
   */
  testContext: async ({ page, logger, config, appUrls, testData, pageUtils }, use) => {
    const logger_inst = Logger.getInstance();
    logger_inst.info('Setting up testContext fixture');

    const testContext = {
      page,
      logger,
      config,
      appUrls,
      testData,
      pageUtils,
      startTime: Date.now(),
      endTest: () => {
        const duration = Date.now() - testContext.startTime;
        logger.info(`Test duration: ${duration}ms`);
      },
    };

    logger_inst.info('✓ TestContext fixture ready');
    await use(testContext);

    logger_inst.info('Cleaning up testContext fixture');
  },
});

module.exports = baseFixture;

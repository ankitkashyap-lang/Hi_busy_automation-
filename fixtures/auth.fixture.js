const { test as base } = require('@playwright/test');
const UserFactory = require('../factories/UserFactory.js');
const LoginFlow = require('../flows/LoginFlow.js');
const Logger = require('../utils/logger.js');

/**
 * auth.fixture.js - Authentication Fixture
 * Provides authenticated browser context/page for tests
 */
const authFixture = base.extend({
  /**
   * authenticatedPage - Page with user already logged in
   */
  authenticatedPage: async ({ page }, use) => {
    const logger = Logger.getInstance();
    logger.info('Setting up authenticated page fixture');

    // Get default admin user
    const adminUser = UserFactory.createAdminUser();

    // Perform login
    const loginFlow = new LoginFlow(page);
    await loginFlow.login(adminUser);

    logger.info('✓ Authenticated page fixture ready');

    // Use the authenticated page in the test
    await use(page);

    // Cleanup
    logger.info('Cleaning up authenticated page fixture');
  },

  /**
   * adminPage - Page with admin user logged in
   */
  adminPage: async ({ page }, use) => {
    const logger = Logger.getInstance();
    logger.info('Setting up admin authenticated page fixture');

    const adminUser = UserFactory.createAdminUser();
    const loginFlow = new LoginFlow(page);
    await loginFlow.login(adminUser);

    logger.info('✓ Admin page fixture ready');
    await use(page);
    logger.info('Cleaning up admin page fixture');
  },

  /**
   * busyTeamPage - Page with busy_team user logged in
   */
  busyTeamPage: async ({ page }, use) => {
    const logger = Logger.getInstance();
    logger.info('Setting up busy_team authenticated page fixture');

    const busyTeamUser = UserFactory.createBusyTeamUser();
    const loginFlow = new LoginFlow(page);
    await loginFlow.login(busyTeamUser);

    logger.info('✓ Busy team page fixture ready');
    await use(page);
    logger.info('Cleaning up busy_team page fixture');
  },

  /**
   * channelPartnerPage - Page with channel_partner user logged in
   */
  channelPartnerPage: async ({ page }, use) => {
    const logger = Logger.getInstance();
    logger.info('Setting up channel_partner authenticated page fixture');

    const channelPartnerUser = UserFactory.createChannelPartnerUser();
    const loginFlow = new LoginFlow(page);
    await loginFlow.login(channelPartnerUser);

    logger.info('✓ Channel partner page fixture ready');
    await use(page);
    logger.info('Cleaning up channel_partner page fixture');
  },

  /**
   * resellerPage - Page with reseller user logged in
   */
  resellerPage: async ({ page }, use) => {
    const logger = Logger.getInstance();
    logger.info('Setting up reseller authenticated page fixture');

    const resellerUser = UserFactory.createResellerUser();
    const loginFlow = new LoginFlow(page);
    await loginFlow.login(resellerUser);

    logger.info('✓ Reseller page fixture ready');
    await use(page);
    logger.info('Cleaning up reseller page fixture');
  },

  /**
   * authenticatedPageWithUser - Page with custom user logged in
   */
  authenticatedPageWithUser: async ({ page }, use) => {
    const logger = Logger.getInstance();
    logger.info('Setting up authenticated page fixture with custom user');

    // This fixture requires a parameter to specify which user
    // Usage: authenticatedPageWithUser(user)
    let currentUser;

    const setUser = (user) => {
      currentUser = user;
    };

    await use({
      page,
      setUser,
      login: async (user) => {
        const loginFlow = new LoginFlow(page);
        await loginFlow.login(user);
        currentUser = user;
      },
      getCurrentUser: () => currentUser,
    });

    logger.info('Cleaning up authenticated page with custom user fixture');
  },
});

module.exports = authFixture;

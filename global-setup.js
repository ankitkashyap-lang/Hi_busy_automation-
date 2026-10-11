const globalConfig = require('./config/globalConfig.js');
const Logger = require('./utils/logger.js');

const logger = Logger.getInstance();

/**
 * Global setup for Playwright tests
 * Runs once per test session before any test
 */
async function globalSetup() {
  logger.info('🚀 Starting Global Setup...');
  logger.info(`Environment: ${globalConfig.ENVIRONMENT}`);
  logger.info(`Base URL: ${globalConfig.BASE_URL}`);
  logger.info(`Browser: ${globalConfig.BROWSER}`);
  logger.info(`Headless: ${globalConfig.HEADLESS}`);
  logger.info(`Workers: ${globalConfig.WORKERS}`);

  // Clean previous Allure results to guarantee latest-run-only reporting
  if (process.env.SKIP_ALLURE_CLEAN !== 'true') {
    try {
      const { cleanAllureDirs, RESULTS_DIR } = require('./scripts/allure-utils.js');
      cleanAllureDirs([RESULTS_DIR]);
      logger.info('🧹 Cleaned stale Allure results for fresh execution');
    } catch (e) {
      logger.warn(`Could not clean Allure results: ${e.message}`);
    }
  }

  logger.info('✅ Global Setup Complete');

  return async () => {
    logger.info('🧹 Running Global Teardown...');
    // Global teardown logic
    logger.info('✅ Global Teardown Complete');
  };
}

module.exports = globalSetup;

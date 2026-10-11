const { test } = require('@playwright/test');
const Logger = require('../utils/logger');

/**
 * BaseTest - Base test configuration
 * Wraps Playwright test with additional functionality
 */
class BaseTest {
  constructor() {
    this.logger = Logger.getInstance();
  }

  /**
   * Get test instance
   */
  static getTest() {
    return test;
  }

  /**
   * Describe tests
   */
  static describe(name, callback) {
    test.describe(name, callback);
  }

  /**
   * Create a test
   */
  static createTest(name, callback) {
    return test(name, async (context) => {
      const logger = Logger.getInstance();
      logger.info(`Starting test: ${name}`);
      
      try {
        await callback(context);
        logger.info(`✅ Test passed: ${name}`);
      } catch (error) {
        logger.error(`❌ Test failed: ${name}`);
        logger.error(error.message);
        throw error;
      }
    });
  }

  /**
   * Skip test
   */
  static skip(name, callback) {
    return test.skip(name, callback);
  }

  /**
   * Mark test as only
   */
  static only(name, callback) {
    return test.only(name, callback);
  }

  /**
   * Setup before tests
   */
  static beforeAll(callback) {
    return test.beforeAll(callback);
  }

  /**
   * Cleanup after tests
   */
  static afterAll(callback) {
    return test.afterAll(callback);
  }

  /**
   * Setup before each test
   */
  static beforeEach(callback) {
    return test.beforeEach(callback);
  }

  /**
   * Cleanup after each test
   */
  static afterEach(callback) {
    return test.afterEach(callback);
  }

  /**
   * Add test fixture
   */
  static fixture(name, callback) {
    return test.extend({ [name]: callback });
  }
}

module.exports = BaseTest;

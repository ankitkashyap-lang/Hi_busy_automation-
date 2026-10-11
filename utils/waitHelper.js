const Logger = require('./logger');

/**
 * WaitHelper - Utility for custom wait strategies
 */
class WaitHelper {
  constructor() {
    this.logger = Logger.getInstance();
  }

  /**
   * Wait for specific time
   */
  async wait(milliseconds) {
    this.logger.debug(`Waiting for ${milliseconds}ms`);
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  /**
   * Wait with exponential backoff
   */
  async waitWithBackoff(fn, maxAttempts = 3, delayMs = 1000) {
    this.logger.debug(`Waiting with exponential backoff, max attempts: ${maxAttempts}`);
    let attempt = 0;
    let lastError;

    while (attempt < maxAttempts) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        attempt++;
        if (attempt < maxAttempts) {
          const delay = delayMs * Math.pow(2, attempt - 1);
          this.logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms`);
          await this.wait(delay);
        }
      }
    }

    throw lastError;
  }

  /**
   * Wait until condition is true
   */
  async waitUntil(fn, timeout = 30000, pollInterval = 500) {
    this.logger.debug(`Waiting until condition is true (timeout: ${timeout}ms)`);
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        if (await fn()) {
          return true;
        }
      } catch (error) {
        // Continue waiting
      }
      await this.wait(pollInterval);
    }

    throw new Error(`Timeout waiting for condition after ${timeout}ms`);
  }

  /**
   * Wait for value to change
   */
  async waitForValueChange(fn, initialValue, timeout = 30000, pollInterval = 500) {
    this.logger.debug('Waiting for value to change');
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const currentValue = await fn();
      if (currentValue !== initialValue) {
        return currentValue;
      }
      await this.wait(pollInterval);
    }

    throw new Error(`Value did not change after ${timeout}ms`);
  }

  /**
   * Wait for specific number of elements
   */
  async waitForElementCount(page, locator, expectedCount, timeout = 30000) {
    this.logger.debug(`Waiting for ${expectedCount} elements matching ${locator}`);
    await this.waitUntil(
      async () => {
        const count = await page.locator(locator).count();
        return count === expectedCount;
      },
      timeout
    );
  }
}

module.exports = new WaitHelper();

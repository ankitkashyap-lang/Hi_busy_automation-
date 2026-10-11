const fs = require('fs');
const path = require('path');
const Logger = require('./logger');

/**
 * Screenshot - Utility for capturing screenshots
 */
class Screenshot {
  constructor() {
    this.logger = Logger.getInstance();
    this.screenshotDir = 'screenshots';

    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(page, filename = null) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const name = filename || `screenshot-${timestamp}`;
      const filePath = path.join(this.screenshotDir, `${name}.png`);

      await page.screenshot({ path: filePath });
      this.logger.info(`Screenshot saved: ${filePath}`);
      return filePath;
    } catch (error) {
      this.logger.error(`Failed to take screenshot: ${error.message}`);
      throw error;
    }
  }

  /**
   * Take screenshot of specific element
   */
  async takeElementScreenshot(page, locator, filename = null) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const name = filename || `element-${timestamp}`;
      const filePath = path.join(this.screenshotDir, `${name}.png`);

      const element = page.locator(locator);
      await element.screenshot({ path: filePath });
      this.logger.info(`Element screenshot saved: ${filePath}`);
      return filePath;
    } catch (error) {
      this.logger.error(`Failed to take element screenshot: ${error.message}`);
      throw error;
    }
  }

  /**
   * Take full page screenshot
   */
  async takeFullPageScreenshot(page, filename = null) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const name = filename || `fullpage-${timestamp}`;
      const filePath = path.join(this.screenshotDir, `${name}.png`);

      await page.screenshot({ path: filePath, fullPage: true });
      this.logger.info(`Full page screenshot saved: ${filePath}`);
      return filePath;
    } catch (error) {
      this.logger.error(`Failed to take full page screenshot: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clear old screenshots
   */
  clearScreenshots() {
    try {
      if (fs.existsSync(this.screenshotDir)) {
        const files = fs.readdirSync(this.screenshotDir);
        files.forEach((file) => {
          fs.unlinkSync(path.join(this.screenshotDir, file));
        });
        this.logger.info('Screenshots cleared');
      }
    } catch (error) {
      this.logger.error(`Failed to clear screenshots: ${error.message}`);
    }
  }
}

module.exports = new Screenshot();

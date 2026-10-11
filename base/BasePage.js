const { expect } = require('@playwright/test');
const Logger = require('../utils/logger');

/**
 * BasePage - Base class for all page objects
 * Contains reusable browser interactions and helpers
 */
class BasePage {
  constructor(page) {
    this.page = page;
    this.logger = Logger.getInstance();
    this.timeout = 30000;
  }

  /**
   * Navigate to URL
   */
  async navigate(url, waitUntil = 'domcontentloaded') {
    this.logger.info(`Navigating to: ${url}`);
    await this.page.goto(url, { waitUntil });
  }

  /**
   * Click element
   */
  async click(locator) {
    this.logger.info(`Clicking element: ${locator}`);
    await this.page.locator(locator).click();
  }

  /**
   * Fill input field
   */
  async fill(locator, text) {
    this.logger.info(`Filling ${locator} with text`);
    await this.page.locator(locator).clear();
    await this.page.locator(locator).fill(text);
  }

  /**
   * Clear input field
   */
  async clearField(locator) {
    this.logger.info(`Clearing field: ${locator}`);
    await this.page.locator(locator).clear();
  }

  /**
   * Get text from element
   */
  async getText(locator) {
    this.logger.info(`Getting text from: ${locator}`);
    return await this.page.locator(locator).textContent();
  }

  /**
   * Check if element is visible
   */
  async isVisible(locator) {
    this.logger.info(`Checking visibility: ${locator}`);
    return await this.page.locator(locator).isVisible();
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(locator, timeout = this.timeout) {
    this.logger.info(`Waiting for element: ${locator}`);
    await this.page.locator(locator).waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for URL to match
   */
  async waitForURL(urlPattern, timeout = this.timeout) {
    this.logger.info(`Waiting for URL: ${urlPattern}`);
    await this.page.waitForURL(urlPattern, { timeout });
  }

  /**
   * Select option from dropdown
   */
  async selectOption(locator, value) {
    this.logger.info(`Selecting option "${value}" from ${locator}`);
    await this.page.locator(locator).selectOption(value);
  }

  /**
   * Hover over element
   */
  async hover(locator) {
    this.logger.info(`Hovering over: ${locator}`);
    await this.page.locator(locator).hover();
  }

  /**
   * Upload file
   */
  async uploadFile(locator, filePath) {
    this.logger.info(`Uploading file: ${filePath}`);
    await this.page.locator(locator).setInputFiles(filePath);
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(filename) {
    this.logger.info(`Taking screenshot: ${filename}`);
    await this.page.screenshot({ path: `screenshots/${filename}.png` });
  }

  /**
   * Get page title
   */
  async getTitle() {
    return await this.page.title();
  }

  /**
   * Get current URL
   */
  async getCurrentURL() {
    return this.page.url();
  }

  /**
   * Press key
   */
  async pressKey(key) {
    this.logger.info(`Pressing key: ${key}`);
    await this.page.keyboard.press(key);
  }

  /**
   * Type text character by character
   */
  async typeText(locator, text) {
    this.logger.info(`Typing text in ${locator}`);
    await this.page.locator(locator).type(text);
  }

  /**
   * Double click element
   */
  async doubleClick(locator) {
    this.logger.info(`Double clicking: ${locator}`);
    await this.page.locator(locator).dblclick();
  }

  /**
   * Right click element
   */
  async rightClick(locator) {
    this.logger.info(`Right clicking: ${locator}`);
    await this.page.locator(locator).click({ button: 'right' });
  }

  /**
   * Check if element exists
   */
  async doesElementExist(locator) {
    this.logger.info(`Checking if element exists: ${locator}`);
    return (await this.page.locator(locator).count()) > 0;
  }

  /**
   * Get element count
   */
  async getElementCount(locator) {
    this.logger.info(`Getting count for: ${locator}`);
    return await this.page.locator(locator).count();
  }

  /**
   * Reload page
   */
  async reload() {
    this.logger.info('Reloading page');
    await this.page.reload();
  }

  /**
   * Go back
   */
  async goBack() {
    this.logger.info('Going back');
    await this.page.goBack();
  }

  /**
   * Go forward
   */
  async goForward() {
    this.logger.info('Going forward');
    await this.page.goForward();
  }

  /**
   * Accept browser alert
   */
  async acceptAlert() {
    this.logger.info('Accepting alert');
    this.page.once('dialog', (dialog) => {
      dialog.accept();
    });
  }

  /**
   * Dismiss browser alert
   */
  async dismissAlert() {
    this.logger.info('Dismissing alert');
    this.page.once('dialog', (dialog) => {
      dialog.dismiss();
    });
  }

  /**
   * Handle alert with text input
   */
  async handleAlert(text) {
    this.logger.info(`Handling alert with text: ${text}`);
    this.page.once('dialog', (dialog) => {
      dialog.accept(text);
    });
  }

  /**
   * Wait for navigation
   */
  async waitForNavigation() {
    this.logger.info('Waiting for navigation');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Clear input field
   */
  async clearField(locator) {
    this.logger.info(`Clearing field: ${locator}`);
    await this.page.locator(locator).clear();
  }

  /**
   * Focus on element
   */
  async focus(locator) {
    this.logger.info(`Focusing on: ${locator}`);
    await this.page.locator(locator).focus();
  }

  /**
   * Evaluate JavaScript
   */
  async executeScript(script, arg) {
    this.logger.info('Executing JavaScript');
    return await this.page.evaluate(script, arg);
  }

  /**
   * Get attribute value
   */
  async getAttributeValue(locator, attributeName) {
    this.logger.info(`Getting attribute "${attributeName}" from ${locator}`);
    return await this.page.locator(locator).getAttribute(attributeName);
  }

  /**
   * Wait for element to be hidden
   */
  async waitForElementToBeHidden(locator, timeout = this.timeout) {
    this.logger.info(`Waiting for element to be hidden: ${locator}`);
    await this.page.locator(locator).waitFor({ state: 'hidden', timeout });
  }

  /**
   * Scroll into view
   */
  async scrollIntoView(locator) {
    this.logger.info(`Scrolling into view: ${locator}`);
    await this.page.locator(locator).scrollIntoViewIfNeeded();
  }

  /**
   * Get input value
   */
  async getInputValue(locator) {
    this.logger.info(`Getting input value from: ${locator}`);
    return await this.page.locator(locator).inputValue();
  }

  /**
   * Check if element is enabled
   */
  async isEnabled(locator) {
    this.logger.info(`Checking if enabled: ${locator}`);
    return await this.page.locator(locator).isEnabled();
  }

  /**
   * Check if element is disabled
   */
  async isDisabled(locator) {
    this.logger.info(`Checking if disabled: ${locator}`);
    return !(await this.isEnabled(locator));
  }
}

module.exports = BasePage;

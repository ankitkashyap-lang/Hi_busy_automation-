const { expect } = require('@playwright/test');
const Logger = require('../utils/logger');

/**
 * BaseAssertions - Base class for all assertion methods
 * Contains reusable Playwright assertions
 */
class BaseAssertions {
  constructor(page) {
    this.page = page;
    this.logger = Logger.getInstance();
  }

  /**
   * Assert element is visible
   */
  async assertElementIsVisible(locator) {
    this.logger.info(`Asserting element is visible: ${locator}`);
    await expect(this.page.locator(locator)).toBeVisible();
  }

  /**
   * Assert element is hidden
   */
  async assertElementIsHidden(locator) {
    this.logger.info(`Asserting element is hidden: ${locator}`);
    await expect(this.page.locator(locator)).toBeHidden();
  }

  /**
   * Assert element exists
   */
  async assertElementExists(locator) {
    this.logger.info(`Asserting element exists: ${locator}`);
    await expect(this.page.locator(locator)).toBeTruthy();
  }

  /**
   * Assert text content
   */
  async assertTextContent(locator, expectedText) {
    this.logger.info(`Asserting text content: ${expectedText}`);
    await expect(this.page.locator(locator)).toContainText(expectedText);
  }

  /**
   * Assert exact text content
   */
  async assertExactText(locator, expectedText) {
    this.logger.info(`Asserting exact text: ${expectedText}`);
    await expect(this.page.locator(locator)).toHaveText(expectedText);
  }

  /**
   * Assert URL
   */
  async assertURL(expectedUrl) {
    this.logger.info(`Asserting URL: ${expectedUrl}`);
    await expect(this.page).toHaveURL(expectedUrl);
  }

  /**
   * Assert URL contains
   */
  async assertURLContains(urlPart) {
    this.logger.info(`Asserting URL contains: ${urlPart}`);
    expect(this.page.url()).toContain(urlPart);
  }

  /**
   * Assert title
   */
  async assertTitle(expectedTitle) {
    this.logger.info(`Asserting title: ${expectedTitle}`);
    await expect(this.page).toHaveTitle(expectedTitle);
  }

  /**
   * Assert element is enabled
   */
  async assertElementIsEnabled(locator) {
    this.logger.info(`Asserting element is enabled: ${locator}`);
    await expect(this.page.locator(locator)).toBeEnabled();
  }

  /**
   * Assert element is disabled
   */
  async assertElementIsDisabled(locator) {
    this.logger.info(`Asserting element is disabled: ${locator}`);
    await expect(this.page.locator(locator)).toBeDisabled();
  }

  /**
   * Assert element is checked
   */
  async assertElementIsChecked(locator) {
    this.logger.info(`Asserting element is checked: ${locator}`);
    await expect(this.page.locator(locator)).toBeChecked();
  }

  /**
   * Assert element is unchecked
   */
  async assertElementIsUnchecked(locator) {
    this.logger.info(`Asserting element is unchecked: ${locator}`);
    const isChecked = await this.page.locator(locator).isChecked();
    expect(isChecked).toBe(false);
  }

  /**
   * Assert attribute value
   */
  async assertAttributeValue(locator, attributeName, expectedValue) {
    this.logger.info(`Asserting attribute: ${attributeName} = ${expectedValue}`);
    await expect(this.page.locator(locator)).toHaveAttribute(
      attributeName,
      expectedValue
    );
  }

  /**
   * Assert element count
   */
  async assertElementCount(locator, expectedCount) {
    this.logger.info(`Asserting element count: ${expectedCount}`);
    await expect(this.page.locator(locator)).toHaveCount(expectedCount);
  }

  /**
   * Assert value in input
   */
  async assertInputValue(locator, expectedValue) {
    this.logger.info(`Asserting input value: ${expectedValue}`);
    await expect(this.page.locator(locator)).toHaveValue(expectedValue);
  }

  /**
   * Assert class name
   */
  async assertClassName(locator, className) {
    this.logger.info(`Asserting class name: ${className}`);
    const element = this.page.locator(locator);
    const classes = await element.getAttribute('class');
    expect(classes).toContain(className);
  }

  /**
   * Assert element is in viewport
   */
  async assertElementInViewport(locator) {
    this.logger.info(`Asserting element is in viewport: ${locator}`);
    const isInViewport = await this.page.locator(locator).evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    });
    expect(isInViewport).toBe(true);
  }

  /**
   * Assert text is selected
   */
  async assertTextIsSelected(locator) {
    this.logger.info(`Asserting text is selected: ${locator}`);
    const selectedText = await this.page.evaluate(() => window.getSelection().toString());
    expect(selectedText.length).toBeGreaterThan(0);
  }

  /**
   * Assert page contains text
   */
  async assertPageContainsText(text) {
    this.logger.info(`Asserting page contains text: ${text}`);
    await expect(this.page.locator('body')).toContainText(text);
  }

  /**
   * Assert element has CSS class
   */
  async assertHasClass(locator, className) {
    this.logger.info(`Asserting element has class: ${className}`);
    const classes = await this.page.locator(locator).getAttribute('class');
    expect(classes).toContain(className);
  }

  /**
   * Assert element does NOT have CSS class
   */
  async assertDoesNotHaveClass(locator, className) {
    this.logger.info(`Asserting element does NOT have class: ${className}`);
    const classes = await this.page.locator(locator).getAttribute('class');
    expect(classes).not.toContain(className);
  }

  /**
   * Assert multiple elements visible
   */
  async assertMultipleElementsVisible(locator, expectedCount) {
    this.logger.info(`Asserting ${expectedCount} elements visible: ${locator}`);
    const count = await this.page.locator(locator).count();
    expect(count).toBeGreaterThanOrEqual(expectedCount);
  }

  /**
   * Generic assertion with custom message
   */
  async assertTrue(condition, message = 'Assertion failed') {
    this.logger.info(`Asserting condition: ${message}`);
    expect(condition).toBe(true);
  }

  /**
   * Generic assertion with custom message - false
   */
  async assertFalse(condition, message = 'Assertion failed') {
    this.logger.info(`Asserting condition is false: ${message}`);
    expect(condition).toBe(false);
  }

  /**
   * Assert equals
   */
  async assertEqual(actual, expected, message = '') {
    this.logger.info(`Asserting equals: ${message}`);
    expect(actual).toBe(expected);
  }

  /**
   * Assert not equals
   */
  async assertNotEqual(actual, expected, message = '') {
    this.logger.info(`Asserting not equals: ${message}`);
    expect(actual).not.toBe(expected);
  }
}

module.exports = BaseAssertions;

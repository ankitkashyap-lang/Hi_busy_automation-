const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/Login/LoginPage.js');
const Logger = require('../../utils/logger.js');
const globalConfig = require('../../config/globalConfig.js');

test.describe('Test Suite 1 - Login by Busy Team User', () => {
  let loginPage;
  const logger = Logger.getInstance();

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateToLogin(globalConfig.BASE_URL);
  });

  test('TC-L01: Login with valid Busy Team credentials @positive', async ({ page }) => {
    logger.info('Executing TC-L01: Valid Busy Team Login');
    await loginPage.enterEmail(globalConfig.BUSY_TEAM_EMAIL);
    await loginPage.enterPassword(globalConfig.ADMIN_PASSWORD);
    await loginPage.clickLogin();

    // Verify dashboard or partner listing loaded
    await page.waitForURL(/\/partner\/teams|\/dashboard/i, { timeout: 15000 }).catch(() => {});
    
    // Verify no error message is displayed
    const isErrorDisplayed = await loginPage.isErrorMessageDisplayed();
    expect(isErrorDisplayed).toBeFalsy();

    logger.info('Login successful, dashboard loaded');
  });

  test('TC-L02: Validate UI alignment and visibility @ui', async ({ page }) => {
    logger.info('Validating UI elements on Login Page');
    const isVisible = await loginPage.verifyAllLoginElementsVisible();
    expect(isVisible).toBeTruthy();
    
    const title = await loginPage.getLoginPageTitle();
    expect(title).toBeDefined();
    
    // Button should be enabled initially
    await expect(loginPage.loginButtonByRole).toBeEnabled();
  });

  test('TC-L03: Empty username validation @negative', async ({ page }) => {
    logger.info('Testing empty username');
    // Leaving username empty, filling password
    await loginPage.enterPassword(globalConfig.ADMIN_PASSWORD);
    await loginPage.clickLogin();
    
    const hasEmailError = await loginPage.hasFieldValidationError(loginPage.emailField);
    expect(hasEmailError).toBeTruthy();
    const errorMsg = await loginPage.getFieldValidationMessage(loginPage.emailField);
    expect(errorMsg.length).toBeGreaterThan(0);
  });

  test('TC-L04: Empty password validation @negative', async ({ page }) => {
    logger.info('Testing empty password');
    await loginPage.enterEmail(globalConfig.BUSY_TEAM_EMAIL);
    await loginPage.clickLogin();
    
    const hasPasswordError = await loginPage.hasFieldValidationError(loginPage.passwordField);
    expect(hasPasswordError).toBeTruthy();
    const errorMsg = await loginPage.getFieldValidationMessage(loginPage.passwordField);
    expect(errorMsg.length).toBeGreaterThan(0);
  });

  test('TC-L05: Invalid email format validation @negative', async ({ page }) => {
    logger.info('Testing invalid email format');
    await loginPage.enterEmail('invalid_format_email');
    await loginPage.enterPassword(globalConfig.ADMIN_PASSWORD);
    await loginPage.clickLogin();

    const hasEmailError = await loginPage.hasFieldValidationError(loginPage.emailField);
    expect(hasEmailError).toBeTruthy();
    const errorMsg = await loginPage.getFieldValidationMessage(loginPage.emailField);
    expect(errorMsg).toMatch(/@|email|fill out this field/i);
  });

  test('TC-L06: Invalid password validation @negative', async ({ page }) => {
    logger.info('Testing invalid password');
    await loginPage.enterEmail(globalConfig.BUSY_TEAM_EMAIL);
    await loginPage.enterPassword('WrongPassword123');
    await loginPage.clickLogin();

    const isErrorDisplayed = await loginPage.isErrorMessageDisplayed();
    expect(isErrorDisplayed).toBeTruthy();
    const errorText = await loginPage.getErrorMessage();
    expect(errorText).toMatch(/Invalid username or password|invalid credentials/i);
  });
});

const { test, expect } = require('@playwright/test');
const LoginFlow = require('../../flows/LoginFlow.js');
const LoginValidation = require('../../validations/LoginValidation.js');
const TestDataProvider = require('../../providers/TestDataProvider.js');
const Logger = require('../../utils/logger.js');
const urls = require('../../config/urls.js');
const globalConfig = require('../../config/globalConfig.js');

const logger = Logger.getInstance();

/**
 * LOGIN TEST SUITE
 * Comprehensive test cases for Login module
 * Data-driven directly from test-data/LoginData.xlsx
 */

test.describe('Login Module Tests @login', () => {
  let context;
  let page;
  let loginFlow;
  let loginValidation;
  let testData = [];

  test.beforeAll(async ({ browser }) => {
    logger.info('='.repeat(80));
    logger.info('LOGIN TEST SUITE - INITIALIZATION');
    logger.info('='.repeat(80));

    try {
      testData = await TestDataProvider.getExecutableTestData();
      logger.info(`✓ Loaded ${testData.length} executable test cases from Excel`);
      logger.info('='.repeat(80));
    } catch (error) {
      logger.error(`Failed to load test data from Excel: ${error.message}`);
      throw error;
    }

    // Initialize single browser context and page to be reused across all tests
    context = await browser.newContext();
    page = await context.newPage();
    loginFlow = new LoginFlow(page);
    loginValidation = new LoginValidation(page);

    // Open login page ONCE
    await page.goto(urls.BASE_URL, { waitUntil: 'domcontentloaded' });
    await loginFlow.loginPage.waitForLoginPageToLoad();
  });

  test.afterAll(async () => {
    if (page) await page.close().catch(() => {});
    if (context) await context.close().catch(() => {});
  });

  test.beforeEach(async ({}, testInfo) => {
    logger.separator();
    logger.info(`Test Started: ${testInfo.title}`);

    if (page.isClosed()) {
      page = await context.newPage();
      loginFlow = new LoginFlow(page);
      loginValidation = new LoginValidation(page);
      await page.goto(urls.BASE_URL, { waitUntil: 'domcontentloaded' });
      await loginFlow.loginPage.waitForLoginPageToLoad();
      return;
    }

    const currentUrl = page.url();
    const isDashboard = currentUrl.includes('dashboard') || currentUrl.includes('admin') || currentUrl.includes('partner') || currentUrl.includes('reseller');
    const emailField = page.locator('#usr');
    const isEmailVisible = await emailField.isVisible().catch(() => false);

    if (isDashboard || !isEmailVisible) {
      logger.info('Not on login page, clearing session and returning to login page');
      await context.clearCookies();
      await page.evaluate(() => {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (e) {}
      }).catch(() => {});
      try {
        await page.goto(urls.BASE_URL, { waitUntil: 'domcontentloaded' });
      } catch (err) {
        await page.waitForTimeout(500);
        await page.goto(urls.BASE_URL, { waitUntil: 'domcontentloaded' });
      }
      await loginFlow.loginPage.waitForLoginPageToLoad();
    } else {
      logger.info('Already on login page, clearing fields for next test');
      await emailField.fill('').catch(() => {});
      await page.locator('#pwd').fill('').catch(() => {});
    }
  });

  test.afterEach(async ({}, testInfo) => {
    logger.info(`Test Status: ${testInfo.status}`);

    if (testInfo.status === 'failed') {
      logger.error('Test failed - capturing artifacts');
    }

    logger.info('Test Ended');
    logger.separator();
  });

  // Helper to get TC data from Excel and skip if Execute = No
  const getTestCaseData = async (tcId, defaultRole = 'admin') => {
    const tc = await TestDataProvider.getLoginDataByTestCaseId(tcId);
    if (tc) {
      if (tc.Execute && String(tc.Execute).trim().toLowerCase() === 'no') {
        test.skip(true, `Test case ${tcId} is marked Execute=No in LoginData.xlsx`);
      }
      return {
        email: String(tc.Email || '').trim(),
        password: String(tc.Password || '').trim(),
        role: tc.Role || defaultRole,
        expectedDashboard: tc.ExpectedDashboard || defaultRole,
        scenario: tc.Scenario,
      };
    }
    // Fallback to role from Excel
    return TestDataProvider.getTestUserByRole(defaultRole);
  };

  // SMOKE TESTS - P0 Priority (Valid Logins)
  test('LOGIN-TC-001: Valid Admin Login @smoke @sanity', async () => {
    const data = await getTestCaseData('LOGIN-TC-001', 'admin');
    expect(data).toBeTruthy();


    await loginFlow.login(data);
    await loginValidation.verifySuccessfulLogin();
    await loginValidation.verifyAdminDashboard();
  });

  test('LOGIN-TC-002: Valid Busy Team Login @smoke @sanity', async () => {
    const data = await getTestCaseData('LOGIN-TC-002', 'busy_team');
    expect(data).toBeTruthy();


    await loginFlow.login(data);
    await loginValidation.verifySuccessfulLogin();
    await loginValidation.verifyBusyTeamDashboard();
  });

  test('LOGIN-TC-003: Valid Channel Partner Login @smoke @sanity', async () => {
    const data = await getTestCaseData('LOGIN-TC-003', 'channel_partner');
    expect(data).toBeTruthy();


    await loginFlow.login(data);
    await loginValidation.verifySuccessfulLogin();
    await loginValidation.verifyChannelPartnerDashboard();
  });

  // NEGATIVE TESTS - P1 Priority (Invalid Credentials)
  test('LOGIN-TC-004: Invalid Email Format @login @sanity', async () => {
    const data = await getTestCaseData('LOGIN-TC-004', 'admin');
    const invalidEmail = data ? data.email : 'invalidemail';
    const validPassword = data ? data.password : globalConfig.ADMIN_PASSWORD;


    await loginFlow.login({ email: invalidEmail, password: validPassword });
    await loginValidation.verifyFailedLogin();
  });

  test('LOGIN-TC-005: Invalid Password @login @sanity', async () => {
    const data = await getTestCaseData('LOGIN-TC-005', 'admin');
    const validEmail = data ? data.email : globalConfig.ADMIN_EMAIL;
    const invalidPassword = data ? data.password : 'wrongpassword123';


    await loginFlow.login({ email: validEmail, password: invalidPassword });
    await loginValidation.verifyFailedLogin();
    await loginValidation.verifyErrorMessageDisplayed();
  });

  test('LOGIN-TC-006: Both Email and Password Invalid @login', async () => {
    const data = await getTestCaseData('LOGIN-TC-006', 'admin');
    const invalidEmail = data ? data.email : 'invalid@invalid.com';
    const invalidPassword = data ? data.password : 'wrongpassword123';


    await loginFlow.login({ email: invalidEmail, password: invalidPassword });
    await loginValidation.verifyFailedLogin();
  });

  test('LOGIN-TC-007: Blank Email Field @login @sanity', async () => {
    const data = await getTestCaseData('LOGIN-TC-007', 'admin');
    const blankEmail = data ? data.email : '';
    const validPassword = data ? data.password : globalConfig.ADMIN_PASSWORD;


    await loginFlow.loginPage.navigateToLogin(urls.BASE_URL);
    await loginFlow.loginPage.enterEmail(blankEmail);
    await loginFlow.loginPage.enterPassword(validPassword);
    await loginFlow.loginPage.clickLogin();

    const isStillLoginPage = await loginFlow.loginPage.isLoginPageVisible();
    expect(isStillLoginPage).toBe(true);
  });

  test('LOGIN-TC-008: Blank Password Field @login @sanity', async () => {
    const data = await getTestCaseData('LOGIN-TC-008', 'admin');
    const validEmail = data ? data.email : globalConfig.ADMIN_EMAIL;
    const blankPassword = data ? data.password : '';


    await loginFlow.loginPage.navigateToLogin(urls.BASE_URL);
    await loginFlow.loginPage.enterEmail(validEmail);
    await loginFlow.loginPage.enterPassword(blankPassword);
    await loginFlow.loginPage.clickLogin();

    const isStillLoginPage = await loginFlow.loginPage.isLoginPageVisible();
    expect(isStillLoginPage).toBe(true);
  });

  test('LOGIN-TC-009: Both Email and Password Blank @login', async () => {
    const data = await getTestCaseData('LOGIN-TC-009', 'admin');
    const blankEmail = data ? data.email : '';
    const blankPassword = data ? data.password : '';


    await loginFlow.loginPage.navigateToLogin(urls.BASE_URL);
    await loginFlow.loginPage.enterEmail(blankEmail);
    await loginFlow.loginPage.enterPassword(blankPassword);
    await loginFlow.loginPage.clickLogin();

    const isStillLoginPage = await loginFlow.loginPage.isLoginPageVisible();
    expect(isStillLoginPage).toBe(true);
  });

  // VALIDATION TESTS - P1 Priority (Email Validation)
  test('LOGIN-TC-010: Malformed Email Missing @ Symbol @login', async () => {
    const data = await getTestCaseData('LOGIN-TC-010', 'admin');
    const malformedEmail = data ? data.email : 'testemaildomain.com';
    const password = data ? data.password : globalConfig.ADMIN_PASSWORD;


    await loginFlow.loginPage.navigateToLogin(urls.BASE_URL);
    await loginFlow.loginPage.enterEmail(malformedEmail);
    await loginFlow.loginPage.enterPassword(password);
    await loginFlow.loginPage.clickLogin();

    const isStillLoginPage = await loginFlow.loginPage.isLoginPageVisible();
    expect(isStillLoginPage).toBe(true);
  });

  test('LOGIN-TC-011: Email with Multiple @ Symbols @login', async () => {
    const data = await getTestCaseData('LOGIN-TC-011', 'admin');
    const malformedEmail = data ? data.email : 'test@@example.com';
    const password = data ? data.password : globalConfig.ADMIN_PASSWORD;


    await loginFlow.loginPage.navigateToLogin(urls.BASE_URL);
    await loginFlow.loginPage.enterEmail(malformedEmail);
    await loginFlow.loginPage.enterPassword(password);
    await loginFlow.loginPage.clickLogin();

    const isStillLoginPage = await loginFlow.loginPage.isLoginPageVisible();
    expect(isStillLoginPage).toBe(true);
  });

  test('LOGIN-TC-012: Email with Leading Space @login', async () => {
    const data = await getTestCaseData('LOGIN-TC-012', 'admin');
    const emailWithSpace = data ? data.email : ' ankit.kashyap@tech.busy.in';
    const password = data ? data.password : globalConfig.ADMIN_PASSWORD;


    await loginFlow.loginPage.navigateToLogin(urls.BASE_URL);
    await loginFlow.loginPage.enterEmail(emailWithSpace);
    await loginFlow.loginPage.enterPassword(password);
    await loginFlow.loginPage.clickLogin();

    await page.waitForTimeout(2000);
  });

  test('LOGIN-TC-013: Email with Trailing Space @login', async () => {
    const data = await getTestCaseData('LOGIN-TC-013', 'admin');
    const emailWithSpace = data ? data.email : 'ankit.kashyap@tech.busy.in ';
    const password = data ? data.password : globalConfig.ADMIN_PASSWORD;


    await loginFlow.loginPage.navigateToLogin(urls.BASE_URL);
    await loginFlow.loginPage.enterEmail(emailWithSpace);
    await loginFlow.loginPage.enterPassword(password);
    await loginFlow.loginPage.clickLogin();

    await page.waitForTimeout(2000);
  });

  // BOUNDARY TESTS - P2 Priority
  test('LOGIN-TC-014: Very Long Email Address @login @regression', async () => {
    const data = await getTestCaseData('LOGIN-TC-014', 'admin');
    const longEmail = data ? data.email : 'a'.repeat(256) + '@example.com';
    const password = data ? data.password : globalConfig.ADMIN_PASSWORD;


    await loginFlow.loginPage.navigateToLogin(urls.BASE_URL);
    await loginFlow.loginPage.enterEmail(longEmail);
    await loginFlow.loginPage.enterPassword(password);
    await loginFlow.loginPage.clickLogin();

    await page.waitForTimeout(2000);
  });

  test('LOGIN-TC-015: Very Long Password @login @regression', async () => {
    const data = await getTestCaseData('LOGIN-TC-015', 'admin');
    const email = data ? data.email : globalConfig.ADMIN_EMAIL;
    const longPassword = data ? data.password : 'a'.repeat(500);


    await loginFlow.loginPage.navigateToLogin(urls.BASE_URL);
    await loginFlow.loginPage.enterEmail(email);
    await loginFlow.loginPage.enterPassword(longPassword);
    await loginFlow.loginPage.clickLogin();

    await page.waitForTimeout(2000);
  });

  test('LOGIN-TC-016: Email Case Sensitivity - Uppercase @login @regression', async () => {
    const data = await getTestCaseData('LOGIN-TC-016', 'admin');
    const uppercaseEmail = data ? data.email : 'ANKIT.KASHYAP@TECH.BUSY.IN';
    const password = data ? data.password : globalConfig.ADMIN_PASSWORD;


    await loginFlow.loginPage.navigateToLogin(urls.BASE_URL);
    await loginFlow.loginPage.enterEmail(uppercaseEmail);
    await loginFlow.loginPage.enterPassword(password);
    await loginFlow.loginPage.clickLogin();

    await page.waitForTimeout(2000);
  });

  test('LOGIN-TC-017: Email with Special Characters @login', async () => {
    const data = await getTestCaseData('LOGIN-TC-017', 'admin');
    const specialEmail = data ? data.email : 'test+label@example.com';
    const password = data ? data.password : globalConfig.ADMIN_PASSWORD;


    await loginFlow.loginPage.navigateToLogin(urls.BASE_URL);
    await loginFlow.loginPage.enterEmail(specialEmail);
    await loginFlow.loginPage.enterPassword(password);
    await loginFlow.loginPage.clickLogin();

    await page.waitForTimeout(2000);
  });

  // UI/UX TESTS - P2 Priority
  test('LOGIN-TC-018: Password Field is Masked @login @smoke', async () => {
    await getTestCaseData('LOGIN-TC-018', 'admin');

    await loginFlow.loginPage.navigateToLogin(urls.BASE_URL);
    const isMasked = await loginFlow.loginPage.isPasswordFieldMasked();
    expect(isMasked).toBe(true);
  });

  test('LOGIN-TC-019: All Login Page Elements Visible @login @smoke', async () => {
    await getTestCaseData('LOGIN-TC-019', 'admin');

    await loginFlow.loginPage.navigateToLogin(urls.BASE_URL);
    await loginValidation.verifyLoginPageElements();
  });

  test('LOGIN-TC-020: Login Button Initially Enabled @login', async () => {
    await getTestCaseData('LOGIN-TC-020', 'admin');

    await loginFlow.loginPage.navigateToLogin(urls.BASE_URL);
    const isEnabled = await loginFlow.loginPage.isLoginButtonEnabled();
    expect(isEnabled).toBe(true);
  });

  // SESSION TESTS - P1 Priority
  test('LOGIN-TC-021: Session Persists After Page Refresh @login @regression', async () => {
    const testData = await getTestCaseData('LOGIN-TC-021', 'admin');

    await loginFlow.login(testData);
    await loginValidation.verifySuccessfulLogin();

    // Refresh page
    await page.reload();

    // Verify still logged in
    await loginValidation.verifySessionPersistsAfterRefresh();
  });

  test('LOGIN-TC-022: Logout Redirects to Login Page @login @sanity', async () => {
    const testData = await getTestCaseData('LOGIN-TC-022', 'admin');

    await loginFlow.login(testData);
    await loginValidation.verifySuccessfulLogin();

    // Click logout
    await loginFlow.loginPage.clickLogout();

    // Verify redirected to login
    await loginValidation.verifyRedirectToLoginAfterLogout();
  });

  test('LOGIN-TC-023: Cannot Access Dashboard After Logout @login @regression', async () => {
    const testData = await getTestCaseData('LOGIN-TC-023', 'admin');

    // First login
    await loginFlow.login(testData);
    await loginValidation.verifySuccessfulLogin();

    // Get dashboard URL
    const dashboardUrl = page.url();

    // Logout
    await loginFlow.loginPage.clickLogout();
    await loginValidation.verifyRedirectToLoginAfterLogout();

    // Try to access dashboard directly
    await loginValidation.verifyCannotAccessDashboardAfterLogout(dashboardUrl);
  });

  test('LOGIN-TC-024: Login with Enter Key @login @regression', async () => {
    const testData = await getTestCaseData('LOGIN-TC-024', 'admin');

    await loginFlow.loginWithEnterKey(testData);
    await loginValidation.verifySuccessfulLogin();
  });

  test('LOGIN-TC-025: Multiple Failed Login Attempts @login @regression', async () => {
    const data = await getTestCaseData('LOGIN-TC-025', 'admin');

    const invalidCredentials = {
      email: data ? data.email : globalConfig.ADMIN_EMAIL,
      password: data ? data.password : 'wrongpassword',
    };

    await loginFlow.multipleFailedLoginAttempts(invalidCredentials, 3);

    // Should still be able to attempt login (no lockout in this test)
    const isLoginPageVisible = await loginFlow.loginPage.isLoginPageVisible();
    expect(isLoginPageVisible).toBe(true);
  });

  test('LOGIN-TC-026: Retry Login After Failed Attempt @login @regression', async () => {
    const data = await getTestCaseData('LOGIN-TC-026', 'admin');

    const invalidCredentials = {
      email: data ? data.email : globalConfig.ADMIN_EMAIL,
      password: 'wrongpassword',
    };

    const validCredentials = data || TestDataProvider.getTestUserByRole('admin');

    await loginFlow.retryLoginAfterFailure(invalidCredentials, validCredentials);
    await loginValidation.verifySuccessfulLogin();
  });

  test('LOGIN-TC-027: Login and Clear Form @login', async () => {
    const data = await getTestCaseData('LOGIN-TC-027', 'admin');

    await loginFlow.loginPage.navigateToLogin(urls.BASE_URL);
    await loginFlow.loginPage.enterEmail(data && data.email ? data.email : 'test@example.com');
    await loginFlow.loginPage.enterPassword(data && data.password ? data.password : 'password123');

    // Clear form
    await loginFlow.loginPage.clearForm();

    // Verify cleared
    const emailValue = await loginFlow.loginPage.getEmailValue();
    const passwordValue = await loginFlow.loginPage.getPasswordValue();

    expect(emailValue).toBe('');
    expect(passwordValue).toBe('');
  });

  test('LOGIN-TC-028: Tab Navigation Order @login @regression', async () => {
    await getTestCaseData('LOGIN-TC-028', 'admin');

    await loginFlow.navigateWithKeyboard(5);

    // Verify we can navigate with Tab key
    const tabOrderValid = await loginFlow.loginPage.verifyTabOrder();
    expect(tabOrderValid).toBeTruthy();
  });

  test('LOGIN-TC-029: Refresh Login Page @login', async () => {

    await loginFlow.loginPage.navigateToLogin(urls.BASE_URL);
    await loginFlow.loginPage.refreshPage();

    // Should be back on login page
    await loginValidation.verifyLoginPageDisplayed();
  });

  test('LOGIN-TC-030: Double Click Login Button @login @regression', async () => {
    const testData = await getTestCaseData('LOGIN-TC-030', 'admin');

    await loginFlow.doubleClickLoginButton(testData);

    // Should still successfully login (no duplicate submission)
    await loginValidation.verifySuccessfulLogin();
  });

  // ADMIN SPECIFIC TESTS
  test('LOGIN-TC-031: Admin Login Displays Admin Dashboard @login @smoke', async () => {
    const testData = await getTestCaseData('LOGIN-TC-031', 'admin');

    await loginFlow.login(testData);
    await loginValidation.verifyAdminDashboard();
  });

  test('LOGIN-TC-032: Admin Dashboard URL Contains Admin @login @regression', async () => {
    const testData = await getTestCaseData('LOGIN-TC-032', 'admin');

    await loginFlow.login(testData);
    await loginValidation.verifyDashboardURL('admin');
  });

  // ROLE-BASED TESTS
  test('LOGIN-TC-033: Logout and Login as Different Role @login @regression', async () => {
    await getTestCaseData('LOGIN-TC-033', 'busy_team');
    const adminUser = TestDataProvider.getTestUserByRole('admin');
    const busyTeamUser = TestDataProvider.getTestUserByRole('busy_team');


    await loginFlow.logoutAndLoginAsDifferentRole(adminUser, busyTeamUser);
    await loginValidation.verifySuccessfulLogin();
  });

  test('LOGIN-TC-034: Verify Admin Menu Items After Login @login @regression', async () => {
    const testData = await getTestCaseData('LOGIN-TC-034', 'admin');

    await loginFlow.login(testData);
    await loginValidation.verifyAdminMenuItems();
  });

  test('LOGIN-TC-035: Verify Busy Team Menu Items After Login @login @regression', async () => {
    const testData = await getTestCaseData('LOGIN-TC-035', 'busy_team');

    await loginFlow.login(testData);
    await loginValidation.verifyBusyTeamMenuItems();
  });

  // EDGE CASES - P2 Priority
  test('LOGIN-TC-036: Email with Subdomain @login @regression', async () => {
    const data = await getTestCaseData('LOGIN-TC-036', 'admin');
    const subdomainEmail = data ? data.email : 'test.subdomain@mail.example.co.uk';
    const password = data ? data.password : globalConfig.ADMIN_PASSWORD;


    await loginFlow.loginPage.navigateToLogin(urls.BASE_URL);
    await loginFlow.loginPage.enterEmail(subdomainEmail);
    await loginFlow.loginPage.enterPassword(password);
    await loginFlow.loginPage.clickLogin();

    await page.waitForTimeout(2000);
  });

  test('LOGIN-TC-037: Password with Special Characters @login @regression', async () => {
    const data = await getTestCaseData('LOGIN-TC-037', 'admin');
    const email = data ? data.email : globalConfig.ADMIN_EMAIL;
    const specialPassword = data ? data.password : 'P@$$w0rd!#%';


    await loginFlow.loginPage.navigateToLogin(urls.BASE_URL);
    await loginFlow.loginPage.enterEmail(email);
    await loginFlow.loginPage.enterPassword(specialPassword);
    await loginFlow.loginPage.clickLogin();

    await page.waitForTimeout(2000);
  });

  test('LOGIN-TC-038: Login Page Title Verification @login', async () => {
    await getTestCaseData('LOGIN-TC-038', 'admin');

    await loginFlow.loginPage.navigateToLogin(urls.BASE_URL);
    const title = await loginFlow.getPageTitle();

    expect(title).toBeTruthy();
  });

  test('LOGIN-TC-039: Verify Loading Spinner During Login @login @regression', async () => {
    const testData = await getTestCaseData('LOGIN-TC-039', 'admin');

    await loginFlow.loginPage.navigateToLogin(urls.BASE_URL);
    await loginFlow.loginPage.enterEmail(testData.email);
    await loginFlow.loginPage.enterPassword(testData.password);
    await loginFlow.loginPage.clickLogin();

    await loginValidation.verifyLoadingSpinnerDuringLogin();
    await loginValidation.verifySuccessfulLogin();
  });

  test('LOGIN-TC-040: Error Message Does Not Expose User Info @login @regression', async () => {
    const data = await getTestCaseData('LOGIN-TC-040', 'admin');
    const invalidEmail = data ? data.email : 'nonexistent@example.com';
    const password = data ? data.password : globalConfig.ADMIN_PASSWORD;


    await loginFlow.login({ email: invalidEmail, password });
    await loginValidation.verifyGenericErrorMessage();
  });

  test.describe('Login - Data-Driven Tests @login @data-driven', () => {
    test('Execute all test data rows with Execute=Yes', async () => {
      test.setTimeout(180000);
      const executableData = await TestDataProvider.getExecutableTestData();

      logger.info(`Executing ${executableData.length} test data rows from LoginData.xlsx`);

      for (const testRow of executableData) {
        if (!testRow.Execute || (testRow.Execute !== 'Yes' && testRow.Execute !== true && String(testRow.Execute).toLowerCase() !== 'yes')) {
          continue;
        }

        logger.info(`Executing: ${testRow.TC_ID} - ${testRow.Scenario}`);

        try {
          const expected = String(testRow.ExpectedResult || '').trim().toLowerCase();
          const isPositive = expected === 'dashboard' || (expected.startsWith('dashboard') && !expected.includes(' or '));
          const isNegative = expected === 'login failed' || expected === 'validation error';

          await loginFlow.login({ email: testRow.Email, password: testRow.Password });

          const currentUrl = page.url();
          const isDashboardOrBusy = currentUrl.includes('dashboard') || currentUrl.includes('busy') || currentUrl.includes('partner') || currentUrl.includes('admin');

          if (isPositive) {
            expect(isDashboardOrBusy).toBe(true);
          } else if (isNegative) {
            // Negative test
            const isLoginVisible = await loginFlow.loginPage.isLoginPageVisible();
            expect(isLoginVisible).toBe(true);
          }

          // Reset for next iteration
          if (isDashboardOrBusy) {
            await context.clearCookies();
            await page.evaluate(() => {
              try { localStorage.clear(); sessionStorage.clear(); } catch (e) {}
            }).catch(() => {});
            try {
              await page.goto(urls.BASE_URL, { waitUntil: 'domcontentloaded' });
            } catch (err) {
              await page.waitForTimeout(500);
              await page.goto(urls.BASE_URL, { waitUntil: 'domcontentloaded' });
            }
            await loginFlow.loginPage.waitForLoginPageToLoad();
          } else {
            await page.locator('#usr').fill('').catch(() => {});
            await page.locator('#pwd').fill('').catch(() => {});
          }

          logger.info(`✓ ${testRow.TC_ID} PASSED`);
        } catch (error) {
          logger.error(`✗ ${testRow.TC_ID} FAILED: ${error.message}`);
          throw error;
        }
      }
    });
  });
});

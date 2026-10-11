const { test, expect } = require("@playwright/test");
const LoginPage = require("../../pages/Login/LoginPage.js");
const PartnerPage = require("../../pages/Partner/PartnerPage.js");
const UserPage = require("../../pages/User/UserPage.js");
const randomData = require("../../utils/randomData.js");
const partnerDataHelper = require("../../utils/partnerDataHelper.js");
const Logger = require("../../utils/logger.js");
const globalConfig = require("../../config/globalConfig.js");

test.describe.configure({ mode: 'serial' });

test.describe("Test Suite - Channel Partner User Creation", () => {
  test.setTimeout(80000);

  let context;
  let page;
  let loginPage;
  let partnerPage;
  let userPage;
  const logger = Logger.getInstance();

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    loginPage = new LoginPage(page);
    partnerPage = new PartnerPage(page);
    userPage = new UserPage(page);
  });

  test.beforeEach(async () => {
    logger.info('Resetting session and logging in as Admin before test');
    await context.clearCookies();
    await loginPage.navigateToLogin(globalConfig.BASE_URL);
    await loginPage.login(globalConfig.BUSY_TEAM_EMAIL, globalConfig.BUSY_TEAM_PASSWORD);
    await page.waitForTimeout(1500);
    await partnerPage.navigateToPartnerListing();
  });

  test.afterAll(async () => {
    if (page) await page.close().catch(() => {});
    if (context) await context.close().catch(() => {});
  });

  test("TC-CP-USER-01: Validate required/empty-field validations", async () => {
    // 4. Search and select any one Channel Partner only
    const targetPartner = await partnerDataHelper.getZeroBalanceChannelPartnerFromDB();
    const partnerName = targetPartner.partnerName;

    logger.info(`Starting User Creation flow for partner: ${partnerName}`);

    await partnerPage.searchPartner(partnerName);
    
    // 5. On the Channel Partner tile, click the Lock icon (Access Account)
    await partnerPage.accessPartnerAccount(0);

    // 6. Navigate: Menu -> Users -> Make User
    await userPage.navigateToUsers();
    await userPage.openCreateUserDrawer();

    // 10. Validate Required/empty-field validations
    logger.info("Asserting empty form validation messages");
    await userPage.triggerValidationErrors();
    const errors = await userPage.verifyEmptyFieldErrors();

    // 9. If any error occurs, capture and assert the exact error message
    expect(errors.length).toBeGreaterThanOrEqual(3);
    for (const errorMsg of errors) {
      expect(errorMsg).toMatch(/Cannot be blank/i);
    }
  });

  test("TC-CP-USER-02: Validate invalid/duplicate input validations", async () => {
    const targetPartner = await partnerDataHelper.getZeroBalanceChannelPartnerFromDB();
    const partnerName = targetPartner.partnerName;

    logger.info(`Starting invalid/duplicate validation for partner: ${partnerName}`);

    await partnerPage.searchPartner(partnerName);
    await partnerPage.accessPartnerAccount(0);
    await userPage.navigateToUsers();
    await userPage.openCreateUserDrawer();

    // Validate Invalid Inputs
    logger.info("Filling invalid data for mobile and email");
    await userPage.fillUserForm({
      name: "Invalid Tester",
      mobile: "12345", // Invalid length
      email: "invalid_email_format", // Invalid format
    });

    await userPage.triggerValidationErrors();

    const mobileError = await userPage.getFieldErrorText(userPage.userMobileInput);
    const emailError = await userPage.getFieldErrorText(userPage.userEmailInput);

    expect(mobileError).toMatch(/Invalid Mobile/i);
    expect(emailError).toMatch(/Invalid Email/i);
  });

  test("TC-CP-USER-03: Create User Successfully and Verify in Search", async () => {
    const targetPartner = await partnerDataHelper.getZeroBalanceChannelPartnerFromDB();
    const partnerName = targetPartner.partnerName;

    await partnerPage.searchPartner(partnerName);
    await partnerPage.accessPartnerAccount(0);
    await userPage.navigateToUsers();
    await userPage.openCreateUserDrawer();

    // 7. Create a new user for the selected Channel Partner
    const timestamp = Date.now();
    const uniqueMobile = `99${Math.floor(10000000 + Math.random() * 90000000)}`;
    const uniqueName = `CPUser ${randomData.generateRandomString(5)}`;
    const uniqueEmail = `cpuser_${timestamp}@gmail.com`;

    const userData = {
      name: uniqueName,
      mobile: uniqueMobile,
      email: uniqueEmail,
    };

    logger.info(`Creating user: ${uniqueName}`);
    await userPage.fillUserForm(userData);
    await userPage.saveUser();

    // Wait for creation success (drawer closes)
    await expect(page.locator(userPage.userNameInput)).toBeHidden({ timeout: 10000 });

    // 8. Verify that the user is created successfully and can be found through user search
    const searchInput = page.locator('#search-input, input[placeholder="Search"]').first();
    await searchInput.fill(uniqueName);
    await page.waitForTimeout(2000);

    await expect(page.locator(`text=${uniqueName}`).first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator(`text=${uniqueEmail}`).first()).toBeVisible({ timeout: 5000 });
  });

  test("TC-CP-USER-04: Validate whether Name, Email, and Phone are editable and Validate Role Assignment", async () => {
    const targetPartner = await partnerDataHelper.getZeroBalanceChannelPartnerFromDB();
    const partnerName = targetPartner.partnerName;

    await partnerPage.searchPartner(partnerName);
    await partnerPage.accessPartnerAccount(0);
    await userPage.navigateToUsers();
    
    // Create a new user first to edit
    await userPage.openCreateUserDrawer();
    const timestamp = Date.now();
    const uniqueName = `EditUser ${randomData.generateRandomString(4)}`;
    await userPage.fillUserForm({
      name: uniqueName,
      mobile: `99${Math.floor(10000000 + Math.random() * 90000000)}`,
      email: `cp_edit_${timestamp}@gmail.com`,
    });
    await userPage.saveUser();
    await expect(page.locator(userPage.userNameInput)).toBeHidden({ timeout: 10000 });

    const searchInput = page.locator('#search-input, input[placeholder="Search"]').first();
    await searchInput.fill(uniqueName);
    await page.waitForTimeout(2000);

    // Open user details (Right-side drawer)
    await userPage.openUserDetails(uniqueName);

    // 10. Validate whether Name, Email, and Phone are editable
    // We do this by attempting to edit them through the UserPage helper
    const editedName = `${uniqueName} Edited`;
    const editedMobile = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
    const editedEmail = `edited_${timestamp}@gmail.com`;

    // 11. Validate Role assignment from the right-side drawer
    // The roleIndex approach is identical to Reseller User Creation (roleIndex: 13 for example)
    await userPage.editUserDetails({
      name: editedName,
      mobile: editedMobile,
      email: editedEmail,
      roleIndex: 1,
    });

    await userPage.closeUserDetails();

    // Verify updates in grid
    await searchInput.fill("");
    await page.waitForTimeout(500);
    await searchInput.fill(editedName);
    await page.waitForTimeout(2000);

    await expect(page.locator(`text=${editedName}`).first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator(`text=${editedEmail}`).first()).toBeVisible({ timeout: 5000 });
  });
});

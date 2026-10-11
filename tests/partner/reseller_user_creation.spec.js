const { test, expect } = require("@playwright/test");
const LoginPage = require("../../pages/Login/LoginPage.js");
const PartnerPage = require("../../pages/Partner/PartnerPage.js");
const UserPage = require("../../pages/User/UserPage.js");
const randomData = require("../../utils/randomData.js");
const partnerDataHelper = require("../../utils/partnerDataHelper.js");
const Logger = require("../../utils/logger.js");
const globalConfig = require("../../config/globalConfig.js");

test.describe.configure({ mode: 'serial' });

test.describe("Test Suite 4 - Reseller User Creation", () => {
  test.setTimeout(60000); // Increase timeout for E2E flow

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

  test("TC-USER-01: Create User Successfully E2E with Validation", async () => {
    // Dynamically fetch a valid partner from DB to create a user under
    const targetPartner =
      await partnerDataHelper.getZeroBalanceChannelPartnerFromDB();
    const partnerName = targetPartner.partnerName;

    logger.info(`Starting User Creation flow for partner: ${partnerName}`);

    // Step 1: Search for the partner in the grid
    await partnerPage.searchPartner(partnerName);

    // Step 2: Access the partner's account
    await partnerPage.accessPartnerAccount(0); // Clicks the first "Access Account" button in results

    // Step 3: Navigate to Users section inside the partner's dashboard
    await userPage.navigateToUsers();

    // Step 4: Open Create User Drawer
    await userPage.openCreateUserDrawer();

    // Step 5: Assert Validation Errors (Empty Form Submit)
    logger.info("Asserting empty form validation messages");
    await userPage.triggerValidationErrors();
    const errors = await userPage.verifyEmptyFieldErrors();

    expect(errors.length).toBeGreaterThanOrEqual(3);
    for (const errorMsg of errors) {
      expect(errorMsg).toMatch(/Cannot be blank/i);
    }

    // Step 6: Fill User Details with Random Data
    const timestamp = Date.now();
    const uniqueMobile = `99${Math.floor(10000000 + Math.random() * 90000000)}`; // 10 digit number starting with 99

    const userData = {
      name: `AutoUser ${randomData.generateRandomString(5)}`,
      mobile: uniqueMobile,
      email: `autouser_${timestamp}@gmail.com`,
    };

    await userPage.fillUserForm(userData);

    // Step 7: Save and Verify
    await userPage.saveUser();

    // Wait for drawer to close (indicating success) or wait for a success toast
    await expect(page.locator(userPage.userNameInput)).toBeHidden({
      timeout: 10000,
    });
    logger.info(`User ${userData.name} created successfully!`);
  });

  test("TC-USER-02: Validate invalid email and mobile format @negative", async () => {
    // Dynamically fetch a valid partner from DB to create a user under
    const targetPartner =
      await partnerDataHelper.getZeroBalanceChannelPartnerFromDB();
    const partnerName = targetPartner.partnerName;

    logger.info(
      `Starting User Creation flow for partner: ${partnerName} to validate invalid inputs`,
    );

    // Navigate and Open Drawer
    await partnerPage.searchPartner(partnerName);
    await partnerPage.accessPartnerAccount(0);
    await userPage.navigateToUsers();
    await userPage.openCreateUserDrawer();

    // Fill Invalid Data
    logger.info("Filling invalid data for mobile and email");
    await userPage.fillUserForm({
      name: "Invalid Tester",
      mobile: "123", // Extremely short mobile
      email: "invalid_email", // Bad format email
    });

    // Trigger validations
    await userPage.triggerValidationErrors();

    // Verify Error Messages Specific to the Fields
    const mobileError = await userPage.getFieldErrorText(
      userPage.userMobileInput,
    );
    const emailError = await userPage.getFieldErrorText(
      userPage.userEmailInput,
    );

    expect(mobileError).toMatch(/Invalid Mobile/i);
    expect(emailError).toMatch(/Invalid Email/i);

    // Clean up: Close drawer
    await page.getByRole("button", { name: "Close" }).click();
  });

  test("TC-USER-03: Search and Verify Created User in Grid @positive", async () => {
    // Fetch a partner from DB
    const targetPartner =
      await partnerDataHelper.getZeroBalanceChannelPartnerFromDB();
    const partnerName = targetPartner.partnerName;

    logger.info(
      `Starting User Creation flow for partner: ${partnerName} to verify search functionality`,
    );

    // Navigate and Open Drawer
    await partnerPage.searchPartner(partnerName);
    await partnerPage.accessPartnerAccount(0);
    await userPage.navigateToUsers();
    await userPage.openCreateUserDrawer();

    // Create a uniquely identifiable user
    const timestamp = Date.now();
    const uniqueMobile = `99${Math.floor(10000000 + Math.random() * 90000000)}`;
    const uniqueName = `SearchableUser ${randomData.generateRandomString(5)}`;
    const uniqueEmail = `searchable_${timestamp}@gmail.com`;

    const userData = {
      name: uniqueName,
      mobile: uniqueMobile,
      email: uniqueEmail,
    };

    logger.info(`Creating user to search: ${uniqueName}`);
    await userPage.fillUserForm(userData);
    await userPage.saveUser();

    // Wait for drawer to close
    await expect(page.locator(userPage.userNameInput)).toBeHidden({
      timeout: 10000,
    });

    // Search for the user in the grid
    logger.info(`Searching for created user in grid: ${uniqueName}`);
    const searchInput = page
      .locator('#search-input, input[placeholder="Search"]')
      .first();
    await searchInput.fill(uniqueName);
    await page.waitForTimeout(2000); // Wait for debounced search / API call

    // Verify the user name and email appear in the search results
    await expect(page.locator(`text=${uniqueName}`).first()).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator(`text=${uniqueEmail}`).first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("TC-USER-04: Enable and Disable User Toggle @positive", async () => {
    // Fetch a partner from DB
    const targetPartner =
      await partnerDataHelper.getZeroBalanceChannelPartnerFromDB();
    const partnerName = targetPartner.partnerName;

    logger.info(`Starting Enable/Disable flow for partner: ${partnerName}`);

    // Navigate to Users
    await partnerPage.searchPartner(partnerName);
    await partnerPage.accessPartnerAccount(0);
    await userPage.navigateToUsers();

    // Step 1: Create a user so we have a fresh one to test
    await userPage.openCreateUserDrawer();
    const timestamp = Date.now();
    const uniqueName = `ToggleUser ${randomData.generateRandomString(4)}`;
    await userPage.fillUserForm({
      name: uniqueName,
      mobile: `99${Math.floor(10000000 + Math.random() * 90000000)}`,
      email: `toggle_${timestamp}@gmail.com`,
    });
    await userPage.saveUser();
    await expect(page.locator(userPage.userNameInput)).toBeHidden({
      timeout: 10000,
    });

    // In Hi Busy, users created without OTP are marked 'notverified' and cannot be toggled.
    // Verify user in DB with status='disable' so enable/disable toggle is permitted.
    await partnerDataHelper.verifyUserInDB(uniqueName, 'disable');

    // Search for the newly created user
    const searchInput = page
      .locator('#search-input, input[placeholder="Search"]')
      .first();
    await searchInput.fill(uniqueName);
    await page.waitForTimeout(2000); // Debounce wait

    // By default, newly created user is Disabled -> Red Color (rgb(189, 57, 43))
    let initialColor = await userPage.getUserNameColor(uniqueName);
    expect(initialColor).toBe("rgb(189, 57, 43)"); // Red color for Disabled

    // Step 2: Click three dots top right corner on tile
    await userPage.clickMoreInfo(uniqueName);
    await page.waitForTimeout(1000);

    // Step 3: Toggle the Enable/Disable switch
    logger.info("Toggling the switch to Enable the user");
    await userPage.toggleEnableDisable();

    // Close the back tile (click three dots again or escape)
    await userPage.clickMoreInfo(uniqueName);
    await page.waitForTimeout(1000);

    // Assert the color changes to grey/black after enabling
    let toggledColor = await userPage.getUserNameColor(uniqueName);
    expect(toggledColor).not.toBe("rgb(189, 57, 43)");
    // Often enabled is just #000 or grey. We assert it's no longer the red disable color.
    logger.info(`Enabled color is: ${toggledColor}`);

    // Optional: Toggle back to Disable
    await userPage.clickMoreInfo(uniqueName);
    await page.waitForTimeout(1000);
    logger.info("Toggling the switch to Disable the user");
    await userPage.toggleEnableDisable();
    await userPage.clickMoreInfo(uniqueName);
    await page.waitForTimeout(1000);

    // Verify it turns back to Red
    let finalColor = await userPage.getUserNameColor(uniqueName);
    expect(finalColor).toBe("rgb(189, 57, 43)"); // Red color
  });

  test("TC-USER-05: Edit User Details and Verify Update @positive", async () => {
    // Fetch a partner from DB
    const targetPartner =
      await partnerDataHelper.getZeroBalanceChannelPartnerFromDB();
    const partnerName = targetPartner.partnerName;

    logger.info(`Starting Edit User flow for partner: ${partnerName}`);

    // Navigate to Users
    await partnerPage.searchPartner(partnerName);
    await partnerPage.accessPartnerAccount(0);
    await userPage.navigateToUsers();

    // Step 1: Create a user so we have a fresh one to edit
    await userPage.openCreateUserDrawer();
    const timestamp = Date.now();
    const uniqueName = `EditUser ${randomData.generateRandomString(4)}`;
    await userPage.fillUserForm({
      name: uniqueName,
      mobile: `99${Math.floor(10000000 + Math.random() * 90000000)}`,
      email: `edit_${timestamp}@gmail.com`,
    });
    await userPage.saveUser();
    await expect(page.locator(userPage.userNameInput)).toBeHidden({
      timeout: 10000,
    });

    // Search for the newly created user
    const searchInput = page
      .locator('#search-input, input[placeholder="Search"]')
      .first();
    await searchInput.fill(uniqueName);
    await page.waitForTimeout(2000);

    // Step 2: Open user details
    await userPage.openUserDetails(uniqueName);

    // Step 3: Edit details
    const editedName = `${uniqueName} Edited`;
    const editedMobile = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
    const editedEmail = `edited_${timestamp}@gmail.com`;

    await userPage.editUserDetails({
      name: editedName,
      mobile: editedMobile,
      email: editedEmail,
      roleIndex: 13, // From recorded reference drawer-item-13-select-btn
    });

    // Step 4: Close drawer and verify
    await userPage.closeUserDetails();

    // Clear search and search again with new name
    await searchInput.fill("");
    await page.waitForTimeout(500);
    await searchInput.fill(editedName);
    await page.waitForTimeout(2000);

    // Verify the updated user name and email appear in the search results
    await expect(page.locator(`text=${editedName}`).first()).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator(`text=${editedEmail}`).first()).toBeVisible({
      timeout: 5000,
    });
  });
});

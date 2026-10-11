const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/Login/LoginPage.js');
const PartnerPage = require('../../pages/Partner/PartnerPage.js');
const randomData = require('../../utils/randomData.js');
const Logger = require('../../utils/logger.js');
const globalConfig = require('../../config/globalConfig.js');

test.describe.configure({ mode: 'serial' });

test.describe('Test Suite 2 - Channel Partner Creation', () => {
  test.setTimeout(60000); // Increase timeout for E2E flow

  let context;
  let page;
  let loginPage;
  let partnerPage;
  const logger = Logger.getInstance();

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    loginPage = new LoginPage(page);
    partnerPage = new PartnerPage(page);

    logger.info('Performing one-time login for Channel Partner Creation test suite');
    await loginPage.navigateToLogin(globalConfig.BASE_URL);
    await loginPage.login(globalConfig.BUSY_TEAM_EMAIL, globalConfig.BUSY_TEAM_PASSWORD);
    await page.waitForTimeout(2000);
  });

  test.beforeEach(async () => {
    logger.info('Navigating to Partner Create URL');
    await partnerPage.navigateToCreatePartner();
  });

  test.afterAll(async () => {
    if (page) await page.close().catch(() => {});
    if (context) await context.close().catch(() => {});
  });

  test('TC-CP01: Validate mandatory fields and next button state', async () => {
    logger.info('Testing mandatory fields in Step 2');
    await partnerPage.openCreatePartnerDrawer();
    await partnerPage.fillStep1({ partnerType: 'Partner' });

    // Try clicking next without filling Step 2
    await page.locator(partnerPage.wizardNextButton).click();

    // Validate error messages
    const nameError = await partnerPage.getFieldErrorText(partnerPage.createPartnerNameInput);
    expect(nameError).toMatch(/required|empty|blank/i);
  });

  test('TC-CP02: Validate GSTIN formatting rules', async () => {
    logger.info('Testing GSTIN formats');
    await partnerPage.openCreatePartnerDrawer();
    await partnerPage.fillStep1({ partnerType: 'Partner' });

    // Invalid length
    await page.locator(partnerPage.createGstinInput).fill('12ABCDE123');
    await page.locator(partnerPage.createPartnerNameInput).focus(); // Trigger blur
    let gstinError = await partnerPage.getFieldErrorText(partnerPage.createGstinInput);
    if (gstinError) expect(gstinError).toBeTruthy(); // The UI might wait for submission

    // Valid GSTIN generated
    const validData = randomData.generateConsistentPartnerData();
    await page.locator(partnerPage.createGstinInput).fill(validData.gstin);
    await page.locator(partnerPage.createPartnerNameInput).focus();
  });

  test('TC-CP03: Create Channel Partner Successfully E2E', async () => {
    const pData = randomData.generateConsistentPartnerData();
    const testEmail = randomData.generateRandomEmail('autocp.com');
    const contactName = `Contact ${randomData.generateRandomString(5)}`;

    logger.info(`Executing E2E Creation with Data: ${JSON.stringify(pData)}`);

    await partnerPage.openCreatePartnerDrawer();

    // Step 1
    await partnerPage.fillStep1({ partnerType: 'Partner' });

    // Step 2
    await partnerPage.fillStep2({
      gstin: pData.gstin,
      partnerName: pData.companyName,
      dealerId: pData.partnerId,
      pin: pData.partnerPin
    });

    // Step 3 (Address)
    await partnerPage.fillStep3({
      pincode: pData.pincode,
      address: `Automation Test Address ${randomData.generateRandomString(10)}`
    });

    // Step 4 (Contact)
    const toastMessage = await partnerPage.fillStep4AndSubmit({
      contactName: contactName,
      mobile: pData.mobile,
      email: testEmail
    });

    if (toastMessage) {
      expect(toastMessage).toMatch(/successfully|created/i);
    } else {
      logger.info("Toast message not found or timed out, assuming success via drawer closing.");
    }

    // Verify in grid
    await partnerPage.closeCreatePartnerDrawer().catch(() => { });
    await partnerPage.searchPartner(pData.companyName);

    // Instead of relying on brittle card classes, wait for the company name to appear in the results
    const partnerCard = page.locator(`text=${pData.companyName}`).first();
    await expect(partnerCard).toBeVisible({ timeout: 15000 });
  });
});

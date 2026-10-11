const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/Login/LoginPage.js');
const PartnerPage = require('../../pages/Partner/PartnerPage.js');
const randomData = require('../../utils/randomData.js');
const Logger = require('../../utils/logger.js');
const globalConfig = require('../../config/globalConfig.js');

test.describe('Test Suite 3 - Reseller Creation', () => {
  test.setTimeout(60000); // Increase timeout for E2E flow
  
  let loginPage;
  let partnerPage;
  const logger = Logger.getInstance();

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    partnerPage = new PartnerPage(page);

    await loginPage.navigateToLogin(globalConfig.BASE_URL);
    await loginPage.login(globalConfig.BUSY_TEAM_EMAIL, globalConfig.BUSY_TEAM_PASSWORD);
    await partnerPage.navigateToPartnerListing();
    
    if (!await page.locator(partnerPage.createPartnerButton).isVisible({ timeout: 5000 })) {
      await page.getByRole('button', { name: 'menu' }).click();
      await page.getByRole('link', { name: 'perm_identity Partner' }).click();
    }
  });

  test('TC-RESELLER-01: Create Reseller Successfully E2E', async ({ page }) => {
    const partnerDataHelper = require('../../utils/partnerDataHelper');
    // Fetch a generic active channel partner to act as the Parent Partner
    const targetParent = await partnerDataHelper.getZeroBalanceChannelPartnerFromDB();
    const parentName = targetParent.partnerName;

    const pData = randomData.generateConsistentPartnerData();
    const testEmail = randomData.generateRandomEmail('autoreseller.com');
    const contactName = `ResellerContact ${randomData.generateRandomString(5)}`;

    logger.info(`Executing Reseller E2E Creation with Data: ${JSON.stringify(pData)}. Parent: ${parentName}`);

    await partnerPage.openCreatePartnerDrawer();
    
    // Step 1 - Important: Pass Reseller!
    await partnerPage.fillStep1({ partnerType: 'Reseller', parentPartnerName: parentName });

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
      address: `Reseller Automation Address ${randomData.generateRandomString(10)}`
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
    await partnerPage.closeCreatePartnerDrawer().catch(() => {});
    await partnerPage.searchPartner(pData.companyName);
    
    // Instead of relying on brittle card classes, wait for the company name to appear in the results
    const partnerCard = page.locator(`text=${pData.companyName}`).first();
    await expect(partnerCard).toBeVisible({ timeout: 15000 });
  });
});

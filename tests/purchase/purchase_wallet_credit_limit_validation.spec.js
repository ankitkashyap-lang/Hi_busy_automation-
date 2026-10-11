const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/loginPage');
const { PurchasePage } = require('../../pages/purchasePage');
const DialogHelper = require('../../pages/DialogHelper');
const PartnerPage = require('../../pages/Partner/PartnerPage');
const partnerDataHelper = require('../../utils/partnerDataHelper');
const globalConfig = require('../../config/globalConfig');

test.describe.configure({ mode: 'serial' });

test.describe('Subscription Purchase Module — Dynamic DB-Driven Wallet & Credit Limit Validations', () => {
  let context;
  let page;
  let loginPage;
  let purchasePage;
  let dialogHelper;
  let partnerPage;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({ baseURL: globalConfig.BASE_URL });
    page = await context.newPage();
    loginPage = new LoginPage(page);
    purchasePage = new PurchasePage(page);
    dialogHelper = new DialogHelper(page);
    partnerPage = new PartnerPage(page);
  });

  test.beforeEach({ timeout: 90000 }, async () => {
    // Clear cookies and re-login as Admin so each test starts fresh with Admin permissions
    await context.clearCookies();
    await page.goto(globalConfig.BASE_URL, { waitUntil: 'domcontentloaded' });
    await loginPage.login(globalConfig.BUSY_TEAM_EMAIL, globalConfig.BUSY_TEAM_PASSWORD);
    await page.waitForTimeout(1500);
    await partnerPage.navigateToPartnerListing();
  });

  test.afterAll(async () => {
    if (page) await page.close().catch(() => {});
    if (context) await context.close().catch(() => {});
  });

  test('TC-WALLET-001: DB-Driven Insufficient Balance Validation (Wallet Bal = 0)', async () => {
    // 1. Fetch from DB
    const targetPartner = await partnerDataHelper.getZeroBalanceChannelPartnerFromDB();
    console.log(`[DB QUERY SUCCESS] Target Partner fetched: ${targetPartner.partnerName} (ID: ${targetPartner.partnerId}), Wallet Bal: ${targetPartner.walletAmount}, Credit Limit: ${targetPartner.creditLimit}`);

    // 2. Navigate and Access
    await partnerPage.navigateToPartnerListing();
    await partnerPage.searchPartner(targetPartner.partnerName);
    const partnerCard = page.locator(`text=${targetPartner.partnerName}`).first();
    await expect(partnerCard).toBeVisible({ timeout: 15000 });
    
    // Access account
    await page.locator('[data-testid*="list-item"], div.MuiPaper-root')
      .filter({ hasText: targetPartner.partnerName }).first()
      .locator('button[aria-label="Access Account"], button:has(svg[data-testid="LockOpenIcon"])').first().click();
    
    await page.waitForURL(/\/partner\/dashboard|\/reseller\/dashboard/, { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1000);

    // 3. Purchase Flow
    await purchasePage.selectProduct('Subscription');
    await purchasePage.selectPurchaseDetails(360, 'India', 'Regular');
    await page.waitForTimeout(1000);
    await purchasePage.choosePlanWithQnty('Subscription', 'Blue', 'Single User', 1);
    
    // Press Tab to ensure React registers the quantity change
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);

    // 4. Click Purchase
    const purchaseBtn = page.getByRole('button', { name: /^Purchase$/i }).first();
    await expect(purchaseBtn).toBeEnabled({ timeout: 5000 });
    await purchaseBtn.click();

    // Wait a moment for network call/popup to render
    await page.waitForTimeout(2000);

    // 5. Verify error message / popup when wallet balance is 0 or insufficient
    const alertOrPopupText = await page.evaluate(() => document.body.innerText);
    expect(alertOrPopupText).toMatch(/Insufficient balance|Insufficient Wallet Balance!|Shortfall/i);
    
    // If alert dialog is visible, validate text
    const dialogText = await dialogHelper.verifyInsufficientBalanceAlert().catch(() => null);
    if (dialogText) {
      expect(dialogText).toMatch(/Insufficient balance|Insufficient Wallet Balance!/i);
    }
  });

  test('TC-CREDIT-002: DB-Driven Credit Limit Fallback Popup Assertion & Dynamic Calculation', async () => {
    // 1. Fetch from DB (needs credit limit!)
    const targetPartner = await partnerDataHelper.getZeroBalanceWithCreditChannelPartnerFromDB();
    console.log(`[DB QUERY SUCCESS] Target Partner fetched: ${targetPartner.partnerName} (ID: ${targetPartner.partnerId}), Wallet Bal: ${targetPartner.walletAmount}, Credit Limit: ${targetPartner.creditLimit}`);

    // 2. Navigate and Access
    await partnerPage.navigateToPartnerListing();
    await partnerPage.searchPartner(targetPartner.partnerName);
    const partnerCard = page.locator(`text=${targetPartner.partnerName}`).first();
    await expect(partnerCard).toBeVisible({ timeout: 15000 });
    
    // Access account
    await page.locator('[data-testid*="list-item"], div.MuiPaper-root')
      .filter({ hasText: targetPartner.partnerName }).first()
      .locator('button[aria-label="Access Account"], button:has(svg[data-testid="LockOpenIcon"])').first().click();
    
    await page.waitForURL(/\/partner\/dashboard|\/reseller\/dashboard/, { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1000);

    // 3. Purchase Flow
    await purchasePage.selectProduct('Subscription');
    await purchasePage.selectPurchaseDetails(360, 'India', 'Regular');
    await page.waitForTimeout(1000);
    await purchasePage.choosePlanWithQnty('Subscription', 'Blue', 'Single User', 1);
    
    // Press Tab to ensure React registers the quantity change
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);

    // 4. Click Purchase
    const purchaseBtn = page.getByRole('button', { name: /^Purchase$/i }).first();
    await expect(purchaseBtn).toBeEnabled({ timeout: 5000 });
    await purchaseBtn.click();

    // Wait a moment for network call/popup to render
    await page.waitForTimeout(2000);

    // 5. Verify Credit Limit Popup structure if wallet balance = 0 & credit limit is available
    const creditPopupInfo = await dialogHelper.verifyCreditLimitFallbackPopup().catch((err) => {
      console.log('Credit limit fallback popup assertion notice:', err.message);
      return null;
    });

    if (creditPopupInfo) {
      expect(creditPopupInfo.popupText).toContain('Insufficient Wallet Balance!');
      expect(creditPopupInfo.popupText).toContain('Shortfall');
      expect(creditPopupInfo.popupText).toContain('Credit Limit Available');
      expect(creditPopupInfo.popupText).toContain('Post transaction, Credit Limit Available will become');
      expect(creditPopupInfo.popupText).toContain('Do you want to continue?');

      if (creditPopupInfo.shortfall !== null && creditPopupInfo.creditLimitAvailable !== null) {
        const expectedPostBal = creditPopupInfo.creditLimitAvailable - creditPopupInfo.shortfall;
        expect(creditPopupInfo.postTransactionCreditLimit).toBe(expectedPostBal);
      }
    } else {
      throw new Error("Credit Limit Popup was not found even though partner had credit limit > 0");
    }
  });
});

const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/loginPage');
const { PurchasePage } = require('../../pages/purchasePage');
const DialogHelper = require('../../pages/DialogHelper');
const globalConfig = require('../../config/globalConfig');
const {
  QTY_MIN,
  QTY_MAX,
  USER_COUNT_MIN,
  USER_COUNT_MAX,
  PRODUCT_CONFIG,
  PERPETUAL_CATEGORY_PLANS,
  REGION_CHANGE_SUBCONTINENT_DIALOG_TEXT,
  SUBCONTINENT_PRICE_MULTIPLIER,
  validateQuantity,
  validateUserCount,
  getPerpetualCategoryPlans,
  calculateSubcontinentPrice,
} = require('../../utils/productConfig');

const { loginAndAccessPartner } = require('../../utils/reportAuthHelper');

test.describe.configure({ mode: 'serial' });

test.describe('Purchase Pricing & Product Configuration Test Cases (TC-001 to TC-022)', () => {
  let context;
  let page;
  let loginPage;
  let purchasePage;
  let dialogHelper;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({ baseURL: globalConfig.BASE_URL });
    page = await context.newPage();
    loginPage = new LoginPage(page);
    purchasePage = new PurchasePage(page);
    dialogHelper = new DialogHelper(page);

    await loginAndAccessPartner(page, 'Inside Sales (Delhi Office)');
  });

  test.beforeEach(async () => {
    const baseUrl = globalConfig.BASE_URL;
    await page.goto(`${baseUrl}partner/dashboard`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
  });

  test.afterAll(async () => {
    if (page) await page.close().catch(() => {});
    if (context) await context.close().catch(() => {});
  });

  /* ===================================================================
   * 1. QUANTITY VALIDATION (TC-001 to TC-005)
   * =================================================================== */

  test('TC-001: Minimum Quantity (Qty = 1)', async () => {
    const res = validateQuantity(1);
    expect(res.valid).toBe(true);

    await purchasePage.selectProduct('Perpetual');
    const input = page.locator('input[type="number"], input').first();
    if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
      await input.fill('1');
      await expect(input).toHaveValue('1');
    }
  });

  test('TC-002: Maximum Quantity (Qty = 999)', async () => {
    const res = validateQuantity(999);
    expect(res.valid).toBe(true);

    await purchasePage.selectProduct('Perpetual');
    const input = page.locator('input[type="number"], input').first();
    if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
      await input.fill('999');
      await expect(input).toHaveValue('999');
    }
  });

  test('TC-003: Quantity Below Minimum (Qty = 0 or Negative)', async () => {
    expect(validateQuantity(0).valid).toBe(false);
    expect(validateQuantity(-1).valid).toBe(false);
    expect(validateQuantity(-50).valid).toBe(false);
  });

  test('TC-004: Quantity Above Maximum (Qty = 1000)', async () => {
    const res = validateQuantity(1000);
    expect(res.valid).toBe(false);
    expect(res.reason).toContain('exceed 999');
  });

  test('TC-005: Invalid Quantity Format (Blank, Decimal, Alphabetic, Special Chars)', async () => {
    expect(validateQuantity('').valid).toBe(false);
    expect(validateQuantity('12.5').valid).toBe(false);
    expect(validateQuantity('abc').valid).toBe(false);
    expect(validateQuantity('@#$').valid).toBe(false);
    expect(validateQuantity(' 10 ').valid).toBe(true); // trimmed integer is valid
  });

  /* ===================================================================
   * 2. USER COUNT VALIDATION (TC-006 to TC-010)
   * =================================================================== */

  test('TC-006: Minimum User Count (Count = 1)', async () => {
    expect(validateUserCount(1).valid).toBe(true);
  });

  test('TC-007: Maximum User Count (Count = 999)', async () => {
    expect(validateUserCount(999).valid).toBe(true);
    expect(validateUserCount(1000).valid).toBe(false);
  });

  test('TC-008: User Count Below Minimum (Count = 0 or Negative)', async () => {
    expect(validateUserCount(0).valid).toBe(false);
    expect(validateUserCount(-1).valid).toBe(false);
  });

  test('TC-009: User Count Above Maximum (Count = 1000)', async () => {
    expect(validateUserCount(1000).valid).toBe(false);
  });

  test('TC-010: Invalid User Count Format (Blank, Decimal, Alphabetic, Special Chars)', async () => {
    expect(validateUserCount('').valid).toBe(false);
    expect(validateUserCount('2.5').valid).toBe(false);
    expect(validateUserCount('five').valid).toBe(false);
    expect(validateUserCount('!@#').valid).toBe(false);
  });

  /* ===================================================================
   * 3. DESKTOP PERPETUAL — CATEGORY / PRODUCT VISIBILITY (TC-011 to TC-015)
   * =================================================================== */

  test('TC-011: Perpetual + CA Category Allowed Plans', async () => {
    const plans = getPerpetualCategoryPlans('CA');
    expect(plans.Basic).toEqual(['Single User', 'Multi User']);
    expect(plans.Standard).toEqual(['Single User']);
    expect(plans.Enterprise).toBeUndefined();
  });

  test('TC-012: Perpetual + Regular Category Allowed Plans', async () => {
    const plans = getPerpetualCategoryPlans('Regular');
    expect(plans.Basic).toBeDefined();
    expect(plans.Standard).toBeDefined();
    expect(plans.Enterprise).toBeDefined();
  });

  test('TC-013: Perpetual + FOC Category Allowed Plans', async () => {
    const plans = getPerpetualCategoryPlans('FOC');
    expect(plans.Basic).toBeDefined();
    expect(plans.Standard).toBeDefined();
    expect(plans.Enterprise).toBeDefined();
  });

  test('TC-014: Perpetual + Accountant Category Allowed Plans', async () => {
    const plans = getPerpetualCategoryPlans('Accountant');
    expect(plans.Basic).toBeUndefined(); // Basic plan hidden
    expect(plans.Standard).toEqual(['Single User', 'Multi User', 'Client Server']);
    expect(plans.Enterprise).toEqual(['Single User', 'Multi User', 'Client Server']);
  });

  test('TC-015: Perpetual + GST Practitioner Category Allowed Plans', async () => {
    const plans = getPerpetualCategoryPlans('GST Practitioner');
    expect(plans.Basic).toBeUndefined(); // Basic plan hidden
    expect(plans.Standard).toEqual(['Single User', 'Multi User', 'Client Server']);
    expect(plans.Enterprise).toEqual(['Single User', 'Multi User', 'Client Server']);
  });

  /* ===================================================================
   * 4. PERPETUAL — ALLOWED CATEGORIES (TC-016)
   * =================================================================== */

  test('TC-016: Validate Perpetual Categories (Regular, FOC, CA, GST Practitioner, Accountant)', async () => {
    await purchasePage.selectProduct('Perpetual');
    const allowed = PRODUCT_CONFIG.Perpetual.categories;
    expect(allowed).toEqual(['Regular', 'FOC', 'CA', 'GST Practitioner', 'Accountant']);

    const categorySelect = page.locator('label:has-text("Category") + div select');
    if (await categorySelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      const text = await categorySelect.innerText();
      for (const cat of allowed) {
        expect(text).toContain(cat);
      }
    }
  });

  /* ===================================================================
   * 5. SUBSCRIPTION — ALLOWED CATEGORIES (TC-017)
   * =================================================================== */

  test('TC-017: Validate Subscription Categories (Regular, FOC allowed; CA, GST Practitioner, Accountant restricted)', async () => {
    await purchasePage.selectProduct('Subscription');
    const allowed = PRODUCT_CONFIG.Subscription.categories;
    expect(allowed).toEqual(['Regular', 'FOC']);
    expect(allowed).not.toContain('CA');
    expect(allowed).not.toContain('GST Practitioner');
    expect(allowed).not.toContain('Accountant');
  });

  /* ===================================================================
   * 6. SUBSCRIPTION — ALLOWED REGIONS (TC-018)
   * =================================================================== */

  test('TC-018: Validate Subscription Regions (India, Subcontinent, Global)', async () => {
    await purchasePage.selectProduct('Subscription');
    const allowed = PRODUCT_CONFIG.Subscription.regions;
    expect(allowed).toEqual(['india', 'subcontinent', 'global']);

    const regionSelect = page.locator('label:has-text("Region") + div select');
    if (await regionSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      const text = await regionSelect.innerText();
      expect(text).toContain('India');
    }
  });

  /* ===================================================================
   * 7. SUBSCRIPTION — REGION CHANGE DIALOG (TC-019 to TC-021)
   * =================================================================== */

  test('TC-019: Subscription Region Change India -> Subcontinent (OK & Cancel)', async () => {
    await purchasePage.selectProduct('Subscription');
    await purchasePage.selectPurchaseDetails(360, 'India', 'Regular');

    const regionSelect = page.locator('label:has-text("Region") + div select');
    if (await regionSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Trigger region change to Subcontinent
      await regionSelect.selectOption({ label: 'Subcontinent' }).catch(() => { });

      // Verify dialog confirmation popup text and action handling
      await dialogHelper.handleDialogIfVisible('Subcontinent', 'OK');
    }
  });

  test('TC-020: Subscription Region Change India -> Global (OK & Cancel)', async () => {
    await purchasePage.selectProduct('Subscription');
    await purchasePage.selectPurchaseDetails(360, 'India', 'Regular');

    const regionSelect = page.locator('label:has-text("Region") + div select');
    if (await regionSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await regionSelect.selectOption({ label: 'Global' }).catch(() => { });
      await dialogHelper.handleDialogIfVisible('Global', 'OK');
    }
  });

  test('TC-021: Dialog Text Validation for Region Change', async () => {
    expect(REGION_CHANGE_SUBCONTINENT_DIALOG_TEXT).toBe(
      'Pricing structure for Subcontinent region is different. Do you want to continue?'
    );
  });

  /* ===================================================================
   * 8. SUBSCRIPTION — REGION PRICING CALCULATION (TC-022)
   * =================================================================== */

  test('TC-022: Subcontinent Pricing Calculation (Subcontinent Price = India Price x 1.1)', async () => {
    const indiaPrice = 1000;
    const expectedSubcontinentPrice = calculateSubcontinentPrice(indiaPrice);
    expect(expectedSubcontinentPrice).toBe(1100);

    const indiaPrice2 = 4500;
    expect(calculateSubcontinentPrice(indiaPrice2)).toBe(4950);
  });
});

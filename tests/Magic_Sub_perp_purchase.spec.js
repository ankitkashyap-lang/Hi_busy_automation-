const { test } = require('@playwright/test');
const { getTestData } = require('../utils/excelReader');
const { validateRow } = require('../utils/productConfig');
const { LoginPage } = require('../pages/loginPage');
const { PurchasePage } = require('../pages/purchasePage');
const globalConfig = require('../config/globalConfig');
const { loginAndAccessPartner } = require('../utils/reportAuthHelper');

const testData = getTestData();

test.describe.configure({ mode: 'serial' });

test.describe('Excel-Driven Purchase Flow', () => {
  let context;
  let page;
  let loginPage;
  let purchasePage;

  test.beforeAll({ timeout: 120000 }, async ({ browser }) => {
    context = await browser.newContext({ baseURL: globalConfig.BASE_URL });
    page = await context.newPage();
    loginPage = new LoginPage(page);
    purchasePage = new PurchasePage(page);

    await loginAndAccessPartner(page, 'Inside Sales (Delhi Office)');
  });

  test.beforeEach(async () => {
    // Navigate directly back to partner dashboard before each test
    const baseUrl = globalConfig.BASE_URL;
    await page.goto(`${baseUrl}partner/dashboard`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
  });

  test.afterAll(async () => {
    if (page) await page.close().catch(() => {});
    if (context) await context.close().catch(() => {});
  });

  for (const row of testData) {
    const title = `${row.Role} | ${row.Product_name} | ${row.Plan_name} - ${row.Model_name} | ${row.category}`;

    test(title, async () => {
      await validateRow(row);

      // Purchase flow
      console.log("Product Name:", row.Product_name);
      await purchasePage.selectProduct(String(row.Product_name));
      await purchasePage.selectPurchaseDetails(String(row.Tenure), String(row.Region), String(row.category));
      await page.waitForTimeout(2000);
      await purchasePage.choosePlanWithQnty(String(row.Product_name), String(row.Plan_name), String(row.Model_name), String(row.Enter_Qnt));
      await purchasePage.verifyAndClickNextOrPurchase(String(row.Product_name), String(row.Plan_name), String(row.Model_name), String(row.UserCount));
    });
  }
});

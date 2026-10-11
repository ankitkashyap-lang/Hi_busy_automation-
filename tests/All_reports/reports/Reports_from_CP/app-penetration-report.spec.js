const { test, expect } = require('@playwright/test');
const { loginAndAccessPartner } = require('../../../../utils/reportAuthHelper');
const fs = require('fs');
const path = require('path');

test.describe.configure({ mode: 'serial' });

test.describe("App Penetration Report Tests", () => {
  let context;
  let page;

  test.beforeAll({ timeout: 120000 }, async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();

    // 1. Login
    await loginAndAccessPartner(page, 'Inside Sales (Delhi Office)');

    // Wait for Dashboard
    //await page.waitForTimeout(5000);

    // Navigate to Menu -> Reports -> App Penetration
    const bannerMenu = page.getByRole('banner').getByRole('button', { name: 'menu' });
    if (await bannerMenu.isVisible()) {
      await bannerMenu.click();
    }

    await page.getByText('bar_chartReport').click();
    await page.getByRole('link', { name: 'App Penetration' }).click();

    // Wait for Report Page to load
    await page.waitForTimeout(3000);
    await expect(page.locator('h1').filter({ hasText: 'App Penetration' })).toBeVisible({ timeout: 10000 });
  });

  test.afterAll(async () => {
    if (page) await page.close();
    if (context) await context.close();
  });

  test("TC-01: Report Page Load & UI Validation", async () => {
    // Verify Page Title
    const title = page.locator('h1').filter({ hasText: 'App Penetration' });
    await expect(title).toBeVisible();

    // Verify Filters exist
    const filters = page.getByRole('combobox');
    await expect(filters).toHaveCount(2); // Partner Type, Product

    // Verify Submit button exists
    const submitBtn = page.getByRole('button', { name: 'Submit' });
    await expect(submitBtn).toBeVisible();

    // Verify Download Excel button exists
    const downloadBtn = page.locator('button:has(img[title="Download Excel"])');
    await expect(downloadBtn).toBeVisible();
  });

  test("TC-02: Filter Scenarios (Valid Inputs)", async () => {
    // Filter by Partner Type: Channel Partner
    await page.getByRole('combobox').nth(0).selectOption('Channel Partner');

    // Filter by Product: Busy Mobile App (usually the only option, but we re-select to be safe)
    await page.getByRole('combobox').nth(1).selectOption('Busy Mobile App');

    await page.getByRole('button', { name: 'Submit' }).click();

    // Wait for results to update
    await page.waitForTimeout(3000);

    // Verify table headers appear
    await expect(page.locator('.MuiTableHead-root')).toBeVisible();
  });

  test("TC-03: Download functionality with API wait and Excel validation", async () => {
    // Set filters
    await page.getByRole('combobox').nth(0).selectOption('All');

    await page.getByRole('button', { name: 'Submit' }).click();

    const downloadBtn = page.locator('button:has(img[title="Download Excel"])');

    // Wait for the UI to update. If there is data, the opacity becomes 1. 
    // If there is no data, the opacity remains 0.5. We will wait briefly for any UI update.
    //await page.waitForTimeout(3000);

    // Check if the button is visually disabled by the application (opacity: 0.5)
    // which happens when there is no data in the grid.
    const isVisuallyDisabled = await downloadBtn.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.opacity === "0.5" || style.cursor === "not-allowed";
    });

    if (isVisuallyDisabled) {
      console.log("Grid has no data. Verifying Download button is disabled.");
      expect(isVisuallyDisabled).toBeTruthy();
    } else {
      // 3. Trigger download and verify
      const downloadPromise = context.waitForEvent('download', { timeout: 15000 });

      let popupPage = null;
      context.once('page', p => {
        popupPage = p;
      });

      await downloadBtn.click();

      try {
        const download = await downloadPromise;
        const suggestedFilename = download.suggestedFilename();
        expect(suggestedFilename).toMatch(/\.xlsx$|\.xls$|\.csv$/i);
        console.log("Download triggered:", suggestedFilename);

        // Save the file to the local disk
        const downloadDir = path.join(__dirname, '..', '..', '..', '..', 'downloads');
        if (!fs.existsSync(downloadDir)) {
          fs.mkdirSync(downloadDir, { recursive: true });
        }
        const downloadPath = path.join(downloadDir, suggestedFilename);
        await download.saveAs(downloadPath);

        // Verify the file was downloaded successfully
        expect(fs.existsSync(downloadPath)).toBeTruthy();
        console.log("File downloaded and saved to:", downloadPath);

        // Open and read the file to verify its contents
        const xlsx = require('xlsx');
        const workbook = xlsx.readFile(downloadPath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert the first few rows to JSON to verify data exists
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        console.log(`Successfully opened Excel file. Sheet name: ${sheetName}`);
        console.log(`Rows in excel file: ${data.length}`);

        if (data.length > 0) {
          console.log("First row (Headers):", data[0]);
        }

        // We verify that it actually contains data (at least headers)
        expect(data.length).toBeGreaterThan(0);

      } catch (e) {
        throw new Error("Download failed to trigger or process. Error: " + e.message);
      } finally {
        if (popupPage && !popupPage.isClosed()) {
          await popupPage.close().catch(() => { });
        }
      }
    }
  });

  test("TC-04: Verify Table Headers", async () => {
    // This report has specific sub-count headers
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForTimeout(3000);

    const headers = [
      'Partner',
      '0 Sub',
      '1 Sub',
      '2 Sub',
      '3 Sub',
      '4 Sub',
      '5 Sub',
      '6 to 10 Sub',
      'More Than 10 Sub'
    ];

    for (const headerText of headers) {
      const headerCell = page.locator('.MuiTableCell-head').filter({ hasText: new RegExp(`^${headerText}$`) });
      await expect(headerCell).toBeVisible();
    }
  });
});

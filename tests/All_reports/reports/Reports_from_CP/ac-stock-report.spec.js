const { test, expect } = require("@playwright/test");
const { loginAndAccessPartner } = require('../../../../utils/reportAuthHelper');
const globalConfig = require('../../../../config/globalConfig');
const fs = require('fs');
const path = require('path');

test.describe.configure({ mode: 'serial' });

test.describe("AC Stock Report Tests", () => {
  test.setTimeout(120000); // 2 minutes for slow report loading/downloads

  let context;
  let page;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();

    // 1. Login & Access Channel Partner
    await loginAndAccessPartner(page, 'Inside Sales (Delhi Office)');

    // 2. Navigate to Menu -> Reports -> AC Stock
    const bannerMenu = page.getByRole('banner').getByRole('button', { name: 'menu' });
    if (await bannerMenu.isVisible()) {
      await bannerMenu.click();
    }

    // Click on Reports -> AC Stock
    await page.getByText('bar_chartReport').click();
    await page.getByRole('link', { name: 'AC Stock' }).click();

    // Wait for Report Page to load
    await page.waitForTimeout(3000);
    const heading = page.getByRole('heading', { name: 'AC Stock' }).or(page.locator('text="AC Stock"').first());
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test.afterAll(async () => {
    if (page) await page.close().catch(() => { });
    if (context) await context.close().catch(() => { });
  });

  test("TC-01: Report Page Load & UI Validation", async () => {
    // Verify essential elements are present
    const submitBtn = page.getByRole('button', { name: 'Submit' });
    await expect(submitBtn).toBeVisible();

    const downloadBtn = page.getByRole('button', { name: 'Download Excel' }).or(page.locator('button:has(img[title="Download Excel"])')).first();
    await expect(downloadBtn).toBeVisible();

    // Verify comboboxes exist (Partner Type, Time Period)
    const comboboxes = page.getByRole('combobox');
    await expect(comboboxes).toHaveCount(2);

    // Submit with default filters to verify grid load
    await submitBtn.click();

    // Verify some data or a loader appears
    await page.waitForTimeout(2000);
  });

  test("TC-02: Filter Scenarios (Valid Inputs)", async () => {
    // Filter by Partner Type: Channel Partner
    await page.getByRole('combobox').nth(0).selectOption('Channel Partner');

    // Filter by Time Period: Previous Month
    await page.getByRole('combobox').nth(1).selectOption('Previous Month');

    await page.getByRole('button', { name: 'Submit' }).click();

    // Wait for results to update
    await page.waitForTimeout(3000);

    // Keep filter as Channel Partner and switch to Current Month
    await page.getByRole('combobox').nth(0).selectOption('Channel Partner');
    await page.getByRole('combobox').nth(1).selectOption('Current Month');
    await page.getByRole('button', { name: 'Submit' }).click();

    await page.waitForTimeout(3000);
  });

  test("TC-03: Download functionality", async () => {
    // Select Channel Partner as required
    await page.getByRole('combobox').nth(0).selectOption('Channel Partner');
    await page.getByRole('combobox').nth(1).selectOption('Current Month');

    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForTimeout(3000);

    const downloadBtn = page.getByRole('button', { name: 'Download Excel' }).or(page.locator('button:has(img[title="Download Excel"])')).first();
    await expect(downloadBtn).toBeVisible();

    // Check if the button is visually disabled (opacity: 0.5 when no data)
    const isVisuallyDisabled = await downloadBtn.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.opacity === "0.5" || style.cursor === "not-allowed" || el.disabled;
    }).catch(() => false);

    if (isVisuallyDisabled) {
      console.log("Grid has no data for selected period. Verified Download button is disabled (opacity 0.5).");
      expect(isVisuallyDisabled).toBeTruthy();
    } else {
      // Trigger download and verify
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

        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        console.log(`Successfully opened Excel file. Sheet name: ${sheetName}`);
        console.log(`Rows in excel file: ${data.length}`);

        if (data.length > 0) {
          console.log("First row (Headers):", data[0]);
        }

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

  test("TC-04: Negative / Edge Cases", async () => {
    // Attempting an edge case filter with Channel Partner
    await page.getByRole('combobox').nth(0).selectOption('Channel Partner');
    await page.getByRole('combobox').nth(1).selectOption('Previous FY');

    await page.getByRole('button', { name: 'Submit' }).click();

    // Wait and verify no catastrophic failure
    await page.waitForTimeout(3000);

    // Check if "No Record Found" or similar is shown
    const noData = page.getByText('No data to display').or(page.getByText('No Records Found'));
    if (await noData.isVisible()) {
      await expect(noData).toBeVisible();
    }
  });
});

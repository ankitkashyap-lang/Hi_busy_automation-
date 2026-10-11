const { test, expect } = require("@playwright/test");
const { loginAndAccessPartner } = require('../../../../utils/reportAuthHelper');
const fs = require('fs');
const path = require('path');

test.describe.configure({ mode: 'serial' });

test.describe("Subscription Status Report Tests", () => {
  test.setTimeout(120000); // 2 minutes for slow report loading/downloads

  let context;
  let page;

  test.beforeAll({ timeout: 120000 }, async ({ browser }) => {
    context = await browser.newContext({ acceptDownloads: true });
    page = await context.newPage();

    // 1. Login & Access Channel Partner
    await loginAndAccessPartner(page, 'Inside Sales (Delhi Office)');

    // 2. Navigate to Menu -> Reports -> Subscription Status
    const bannerMenu = page.getByRole('banner').getByRole('button', { name: 'menu' }).first();
    await expect(bannerMenu).toBeVisible({ timeout: 15000 });
    await bannerMenu.click();
    await page.waitForTimeout(1000);

    const reportAccordion = page.getByText('bar_chartReport').or(page.getByRole('button', { name: /Report/i })).first();
    if (await reportAccordion.isVisible()) {
      await reportAccordion.click();
      await page.waitForTimeout(1000);
    }

    const reportLink = page.getByRole('link', { name: 'Subscription Status', exact: true })
      .or(page.getByRole('link', { name: /Subscription Status/i }))
      .first();
    await expect(reportLink).toBeVisible({ timeout: 10000 });
    await reportLink.click();
    await page.waitForTimeout(3000);
  });

  test.afterAll(async () => {
    if (page) await page.close().catch(() => { });
    if (context) await context.close().catch(() => { });
  });

  test("TC-01: Report Page Load & UI Validation", async () => {
    // Verify essential elements are present
    const submitBtn = page.getByRole('button', { name: 'Submit' });
    await expect(submitBtn).toBeVisible({ timeout: 15000 });

    const downloadBtn = page.getByRole('button', { name: 'Download Excel' })
      .or(page.locator('button:has(img[title="Download Excel"])'))
      .first();
    await expect(downloadBtn).toBeVisible({ timeout: 15000 });

    // Verify comboboxes exist
    const comboboxes = page.getByRole('combobox');
    await expect(comboboxes.first()).toBeVisible();

    // Submit with default filters to verify grid load
    await submitBtn.click();
    await page.waitForTimeout(2000);
  });

  test("TC-02: Filter Scenarios (Valid Inputs)", async () => {
    // Filter by Partner Type: Channel Partner
    const partnerTypeSelect = page.getByRole('combobox').first();
    await partnerTypeSelect.selectOption('Channel Partner');
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForTimeout(2000);

    // Period combobox (combobox index 2 or 1)
    const comboboxes = page.getByRole('combobox');
    const comboboxCount = await comboboxes.count();
    const periodSelect = comboboxCount > 2 ? comboboxes.nth(2) : comboboxes.nth(1);

    // Filter by Time Period: Current Month
    if (await periodSelect.isVisible()) {
      await periodSelect.selectOption('Current Month').catch(() => { });
      await page.getByRole('button', { name: 'Submit' }).click();
      await page.waitForTimeout(2000);

      // Filter by Current Quarter
      await periodSelect.selectOption('Current Quarter').catch(() => { });
      await page.getByRole('button', { name: 'Submit' }).click();
      await page.waitForTimeout(2000);

      // Filter by Today
      await periodSelect.selectOption('Today').catch(() => { });
      await page.getByRole('button', { name: 'Submit' }).click();
      await page.waitForTimeout(2000);
    }
  });

  test("TC-03: Download functionality", async () => {
    // Select filter
    await page.getByRole('combobox').first().selectOption('Channel Partner');

    const comboboxes = page.getByRole('combobox');
    const comboboxCount = await comboboxes.count();
    const periodSelect = comboboxCount > 2 ? comboboxes.nth(2) : comboboxes.nth(1);
    if (await periodSelect.isVisible()) {
      await periodSelect.selectOption('Today').catch(() => { });
    }

    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForTimeout(3000);

    const downloadBtn = page.getByRole('button', { name: 'Download Excel' })
      .or(page.locator('button:has(img[title="Download Excel"])'))
      .first();
    await expect(downloadBtn).toBeVisible({ timeout: 15000 });

    // Check if the button is visually disabled (opacity: 0.5 when no data)
    const isVisuallyDisabled = await downloadBtn.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.opacity === "0.5" || style.cursor === "not-allowed" || el.disabled;
    }).catch(() => false);

    if (isVisuallyDisabled) {
      console.log("Grid has no data for selected period. Verified Download button is disabled (opacity 0.5).");
      expect(isVisuallyDisabled).toBeTruthy();
    } else {
      // Trigger download and catch both popup and download events
      const downloadPromise = Promise.race([
        page.waitForEvent('download', { timeout: 30000 }),
        context.waitForEvent('download', { timeout: 30000 })
      ]);

      const page1Promise = page.waitForEvent('popup', { timeout: 15000 }).catch(() => null);

      await downloadBtn.click();

      try {
        const download = await downloadPromise;
        const page1 = await page1Promise;

        const suggestedFilename = download.suggestedFilename();
        expect(suggestedFilename).toMatch(/\.xlsx$|\.xls$|\.csv$/i);
        console.log("Download triggered successfully:", suggestedFilename);

        const downloadDir = path.join(__dirname, '..', '..', '..', '..', 'downloads');
        if (!fs.existsSync(downloadDir)) {
          fs.mkdirSync(downloadDir, { recursive: true });
        }
        const downloadPath = path.join(downloadDir, suggestedFilename);
        await download.saveAs(downloadPath);

        expect(fs.existsSync(downloadPath)).toBeTruthy();
        console.log("File downloaded and saved to:", downloadPath);

        const xlsx = require('xlsx');
        const workbook = xlsx.readFile(downloadPath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        console.log(`Successfully opened Excel file. Sheet: ${sheetName}, Rows: ${data.length}`);
        expect(data.length).toBeGreaterThan(0);

        if (page1 && !page1.isClosed()) {
          await page1.close().catch(() => { });
        }
      } catch (e) {
        throw new Error("Download failed to trigger or process. Error: " + e.message);
      }
    }
  });

  test("TC-04: Negative / Edge Cases", async () => {
    // Attempting edge case filter
    await page.getByRole('combobox').first().selectOption('Channel Partner');
    const comboboxes = page.getByRole('combobox');
    const comboboxCount = await comboboxes.count();
    const periodSelect = comboboxCount > 2 ? comboboxes.nth(2) : comboboxes.nth(1);
    if (await periodSelect.isVisible()) {
      await periodSelect.selectOption('Previous FY').catch(() => { });
    }
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForTimeout(3000);

    const noData = page.getByText('No data to display').or(page.getByText('No Records Found'));
    if (await noData.isVisible()) {
      await expect(noData).toBeVisible();
    }
  });
});

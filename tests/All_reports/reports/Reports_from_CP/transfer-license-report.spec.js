const { test, expect } = require('@playwright/test');
const { loginAndAccessPartner } = require('../../../../utils/reportAuthHelper');

test.describe('Transfer License Report', () => {

    test.beforeEach({ timeout: 90000 }, async ({ page }) => {
        await loginAndAccessPartner(page, 'Inside Sales (Delhi Office)');
        const bannerMenu = page.getByRole('banner').getByRole('button', { name: 'menu' });
        if (await bannerMenu.isVisible()) await bannerMenu.click();

        const reportLink = page.getByRole('link', { name: 'Transfer License Report' })
            .or(page.getByRole('link', { name: /Transfer License/i }));
        if (!(await reportLink.first().isVisible())) {
            await page.getByText('bar_chartReport').click();
        }
        await reportLink.first().click();
        await page.waitForTimeout(2000);
    });

    test('should validate fields and download successfully', async ({ page, context, request }) => {
        test.setTimeout(180000); // 3 minutes buffer for report generation and cron processing

        const submitBtn = page.getByRole('button', { name: 'Submit' });
        await expect(submitBtn).toBeVisible({ timeout: 15000 });

        // 1. Submit report request and open download page in popup tab
        const page1Promise = page.waitForEvent('popup');
        await submitBtn.click();
        const newPage = await page1Promise;

        await newPage.waitForLoadState('domcontentloaded');
        await newPage.waitForTimeout(2000);

        // 2. Click Refresh button on download page, then trigger cron API (works dynamically for QA1 & QA2)
        const refreshBtn = newPage.getByRole('button', { name: 'Select' })
            .or(newPage.getByTitle('Refresh'))
            .first();
        await expect(refreshBtn).toBeVisible({ timeout: 15000 });
        await refreshBtn.click();
        await newPage.waitForTimeout(2000);

        const cronHost = new URL(newPage.url()).hostname;
        const cronUrl = `http://${cronHost}:9094/report/v1/cron/report/`;
        try {
            console.log(`Triggering cron API at: ${cronUrl}`);
            await request.get(cronUrl, { timeout: 60000 });
        } catch (err) {
            console.warn(`Cron API call notice: ${err.message}`);
        }

        // 1. Check: Target ONLY and ONLY the first row (Row index 1 below header row 0) and verify report name
        const firstRow = newPage.locator('div[role="row"]').nth(1);
        await expect(firstRow).toBeVisible({ timeout: 30000 });
        await expect(firstRow).toContainText(/Transfer License/i);

        // Download button scoped strictly to the first row only
        const downloadBtn = firstRow.locator('button', { hasText: 'Download' });

        // 3. Click Refresh button again and wait until status changes from 'In Process' to 'Processed' and download button is enabled
        await expect(async () => {
            if (await refreshBtn.isVisible()) {
                await refreshBtn.click();
            } else {
                await newPage.reload({ waitUntil: 'domcontentloaded' });
            }
            await newPage.waitForTimeout(2000);

            await expect(firstRow).toContainText(/Processed/i, { timeout: 2000 });
            await expect(downloadBtn).toBeVisible({ timeout: 2000 });
        }).toPass({ intervals: [5000], timeout: 120000 });

        // Download strictly from the first row
        const [download] = await Promise.all([
            newPage.waitForEvent('download', { timeout: 30000 }),
            downloadBtn.click()
        ]);

        const fileName = download.suggestedFilename();
        console.log(`Successfully downloaded first row report: ${fileName}`);
        expect(fileName).toMatch(/transfer/i);

        const errorMsg = newPage.locator('.MuiAlert-message, .error-message');
        await expect(errorMsg).toBeHidden();

        await download.delete();
    });
});

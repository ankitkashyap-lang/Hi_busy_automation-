const { test, expect } = require('@playwright/test');
const { loginAndAccessPartner } = require('../../../../utils/reportAuthHelper');

test.describe('Reseller Report', () => {

    test.beforeEach({ timeout: 90000 }, async ({ page }) => {
        // 1. Go inside Channel Partner
        await loginAndAccessPartner(page, 'Inside Sales (Delhi Office)');

        // 2. Open side navigation menu
        const bannerMenu = page.getByRole('banner').getByRole('button', { name: 'menu' }).first();
        await expect(bannerMenu).toBeVisible({ timeout: 15000 });
        await bannerMenu.click();
        await page.waitForTimeout(1000);

        // 3. Open Report menu section
        const reportAccordion = page.getByText('bar_chartReport').or(page.getByRole('button', { name: /Report/i })).first();
        if (await reportAccordion.isVisible()) {
            await reportAccordion.click();
            await page.waitForTimeout(1000);
        }

        // 4. Click Reseller Report link (exact match to distinguish from reseller management)
        const resellerLink = page.getByRole('link', { name: 'Reseller', exact: true }).first();
        await expect(resellerLink).toBeVisible({ timeout: 10000 });
        await resellerLink.click();
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
        await expect(firstRow).toContainText(/Reseller/i);

        // Download button scoped strictly to the first row only - target the actual button
        const downloadBtn = firstRow.locator('button', { hasText: 'Download' }).first();

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
            await expect(downloadBtn).toBeEnabled({ timeout: 2000 });
        }).toPass({ intervals: [5000], timeout: 120000 });

        // Download strictly from the first row
        const downloadPromise = Promise.race([
            newPage.waitForEvent('download', { timeout: 30000 }),
            context.waitForEvent('download', { timeout: 30000 })
        ]);

        const [download] = await Promise.all([
            downloadPromise,
            downloadBtn.click()
        ]);

        const fileName = download.suggestedFilename();
        console.log(`Successfully downloaded first row report: ${fileName}`);
        expect(fileName).toMatch(/reseller/i);

        const errorMsg = newPage.locator('.MuiAlert-message, .error-message');
        await expect(errorMsg).toBeHidden();

        await download.delete();
    });
});

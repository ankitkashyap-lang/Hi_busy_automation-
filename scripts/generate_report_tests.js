const fs = require('fs');
const path = require('path');

const reports = [
    { filename: 'blocked-licenses', name: 'Blocked Licenses', linkName: 'Blocked Licenses', matchName: 'Blocked Licenses', fileRegex: 'blocked' },
    { filename: 'bls-expiry', name: 'BLS Expiry', linkName: 'BLS Expiry', matchName: 'BLS Expiry', fileRegex: 'bls' },
    { filename: 'customer-list', name: 'Customer List', linkName: 'Customer List', matchName: 'Customer List', fileRegex: 'customer', needsDate: true },
    { filename: 'partner-account-ledger', name: 'Partner Account Ledger', linkName: 'Partner Account Ledger Report', matchName: 'Partner Account Ledger', fileRegex: 'partner' },
    { filename: 'reseller', name: 'Reseller', linkName: 'Reseller Report', matchName: 'Reseller', fileRegex: 'reseller' },
    { filename: 'rdp-license', name: 'RDP License Report', linkName: 'RDP License Report', matchName: 'RDP License', fileRegex: 'rdp' },
    { filename: 'subscription-history', name: 'Subscription History', linkName: 'Subscription History Report', matchName: 'Subscription History', fileRegex: 'subscription' },
    { filename: 'transfer-license', name: 'Transfer License', linkName: 'Transfer License Report', matchName: 'Transfer License', fileRegex: 'transfer' },
    { filename: 'unused-serial-no', name: 'Unused Serial No', linkName: 'Unused Serial No Report', matchName: 'Unused Serial No', fileRegex: 'unused' },
    { filename: 'version-17-18', name: 'Version 17 & 18 Report', linkName: 'Version 17 & 18 Report', matchName: '17.*18', fileRegex: '17.*18' }
];

const template = (report) => `const { test, expect } = require('@playwright/test');
const { loginAndAccessPartner } = require('../../../../utils/reportAuthHelper');

test.describe('${report.name} Report', () => {

    test.beforeEach(async ({ page }) => {
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

        // 4. Click Report link
        const reportLink = page.getByRole('link', { name: '${report.linkName}', exact: true })
            .or(page.getByRole('link', { name: /${report.linkName.replace(/[&]/g, '.*')}/i }))
            .first();
        await expect(reportLink).toBeVisible({ timeout: 10000 });
        await reportLink.click();
        await page.waitForTimeout(2000);
    });

    test('should validate fields and download successfully', async ({ page, context, request }) => {
        test.setTimeout(180000); // 3 minutes buffer for report generation and cron processing
        ${report.needsDate ? `
        // Select Date Range to enable Submit button
        const dateRangeBtn = page.getByRole('button', { name: 'date_range' }).nth(1);
        if (await dateRangeBtn.isVisible()) {
            await dateRangeBtn.click();
            const day15Btn = page.getByRole('button', { name: '15' }).first();
            await day15Btn.click();
            await day15Btn.click();
            await page.waitForTimeout(1000);
        }
` : ''}
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
        const cronUrl = \`http://\${cronHost}:9094/report/v1/cron/report/\`;
        try {
            console.log(\`Triggering cron API at: \${cronUrl}\`);
            await request.get(cronUrl, { timeout: 60000 });
        } catch (err) {
            console.warn(\`Cron API call notice: \${err.message}\`);
        }

        // 1. Check: Target ONLY and ONLY the first row (Row index 1 below header row 0) and verify report name
        const firstRow = newPage.locator('div[role="row"]').nth(1);
        await expect(firstRow).toBeVisible({ timeout: 30000 });
        await expect(firstRow).toContainText(/${report.matchName}/i);

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
        console.log(\`Successfully downloaded first row report: \${fileName}\`);
        expect(fileName).toMatch(/${report.fileRegex}/i);

        const errorMsg = newPage.locator('.MuiAlert-message, .error-message');
        await expect(errorMsg).toBeHidden();

        await download.delete();
    });
});
`;

for (const report of reports) {
    const filePath = path.join(__dirname, '..', 'tests', 'All_reports', 'reports', 'Reports_from_CP', `${report.filename}-report.spec.js`);
    fs.writeFileSync(filePath, template(report));
    console.log(`Created ${filePath}`);
}

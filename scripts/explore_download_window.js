const { chromium } = require('@playwright/test');
const fs = require('fs');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Login
    await page.goto('https://hiqa1.pooraa.net/');
    await page.locator('#usr').fill('ankit.kashyap@tech.busy.in');
    await page.locator('#pwd').fill('123456');
    await page.locator('button[type="submit"]').click();

    // Select Partner
    await page.waitForTimeout(5000);
    await page.getByRole('button', { name: 'menu' }).first().click();
    await page.getByRole('link', { name: 'perm_identity Partner' }).click();

    await page.getByRole('textbox', { name: 'search' }).click();
    await page.getByRole('textbox', { name: 'search' }).fill('Inside Sales (Delhi Office)');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    const lockIconBtn = page.locator('button[aria-label="Access Account"]').first();
    await lockIconBtn.click();
    await page.waitForTimeout(5000);

    // Navigate to Reports -> Blocked Licenses
    const bannerMenu = page.getByRole('banner').getByRole('button', { name: 'menu' });
    if (await bannerMenu.isVisible()) await bannerMenu.click();

    const reportLink = page.getByRole('link', { name: 'Blocked Licenses', exact: true });
    if (!(await reportLink.isVisible())) {
        await page.getByText('bar_chartReport').click();
    }
    await reportLink.click();
    await page.waitForTimeout(5000);

    // Click Submit to generate the report in a new window
    const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        page.getByRole('button', { name: 'Submit' }).click()
    ]);
    
    await newPage.waitForLoadState();
    console.log("New page URL:", newPage.url());

    // Wait some time to let the report generate or show the refresh button
    await newPage.waitForTimeout(10000);

    const html = await newPage.content();
    fs.writeFileSync('scratch/download_window.html', html);
    console.log("Saved scratch/download_window.html");

    await browser.close();
})();

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../scratch');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  console.log("1. Logging in...");
  await page.goto('https://hiqa1.pooraa.net/');
  await page.fill('input[type="email"], input[name="email"], input[name="username"], #usr, [aria-label="Email ID"]', 'ankit.kashyap@tech.busy.in'); 
  await page.fill('input[type="password"], input[name="password"], #pwd, [aria-label="Password"]', '123456');
  await page.click('button[type="submit"], button:has-text("Login")');
  await page.waitForTimeout(3000);

  console.log("2. Navigating to 3M Infocare partner dashboard...");
  await page.getByRole('button', { name: 'menu' }).first().click();
  await page.waitForTimeout(1000);
  await page.getByRole('link', { name: /Partner/i }).first().click();
  await page.waitForTimeout(3000);
  await page.locator('input[placeholder="Search"]').first().fill('3M Infocare');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);
  await page.locator('button[aria-label="Access Account"], button:has(svg[data-testid="LockOpenIcon"])').first().click();
  await page.waitForTimeout(4000);

  console.log("3. Navigating to /partner/report/download...");
  await page.goto('https://hiqa1.pooraa.net/partner/report/download');
  await page.waitForTimeout(4000);
  await page.screenshot({ path: path.join(outDir, 'partner_download_page.png') });

  const dlPageInfo = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('div[role="row"], tbody tr')).map(r => r.innerText?.trim().replace(/\n/g, ' | '));
    const buttons = Array.from(document.querySelectorAll('button')).map(b => ({
      text: b.innerText?.trim(),
      title: b.title,
      aria: b.getAttribute('aria-label'),
      disabled: b.disabled
    }));
    return { rows, buttons };
  });

  console.log("Partner download page rows count:", dlPageInfo.rows.length);
  console.log("First 5 rows on /partner/report/download:");
  dlPageInfo.rows.slice(0, 5).forEach((r, idx) => console.log(`Row #${idx}: ${r}`));

  // Check if first row has a download button
  const firstDownloadBtn = page.locator('button:has-text("Download")').first();
  if (await firstDownloadBtn.isVisible()) {
    console.log("Found Download button in row! Clicking to test download...");
    const dlPromise = page.waitForEvent('download', { timeout: 30000 });
    await firstDownloadBtn.click();
    const download = await dlPromise;
    const filename = download.suggestedFilename();
    const savePath = path.join(outDir, filename);
    await download.saveAs(savePath);
    console.log(`Downloaded file: ${filename} (${fs.statSync(savePath).size} bytes)`);

    // Read file contents using xlsx
    const xlsx = require('xlsx');
    const wb = xlsx.readFile(savePath);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    console.log("Sheet name:", wb.SheetNames[0]);
    console.log("Headers (Row 0):", data[0]);
    console.log("Sample Data Row 1:", data[1]);
    console.log(`Total rows in Excel: ${data.length}`);
  }

  // Also let's inspect the exact product controls on Due Renewals
  console.log("\n4. Navigating back to Due Renewals to inspect product tabs/buttons...");
  await page.goto('https://hiqa1.pooraa.net/partner/analytics/duerenewal?tab=0&product=desktop');
  await page.waitForTimeout(4000);

  const productElements = await page.evaluate(() => {
    // Find all elements containing text Busy 21, Online, Mobile, Recom, mazu
    const elements = [];
    ['Busy 21', 'Online', 'Mobile', 'Recom', 'mazu'].forEach(name => {
      const els = Array.from(document.querySelectorAll('button, a, div, span, li, p')).filter(e => e.innerText?.trim() === name);
      els.forEach(e => {
        elements.push({
          target: name,
          tag: e.tagName,
          className: e.className,
          role: e.getAttribute('role'),
          href: e.getAttribute('href'),
          onClick: !!e.onclick
        });
      });
    });
    return elements;
  });
  console.log("Product elements found:", JSON.stringify(productElements, null, 2));

  await browser.close();
})().catch(err => {
  console.error("FATAL ERROR:", err);
  process.exit(1);
});

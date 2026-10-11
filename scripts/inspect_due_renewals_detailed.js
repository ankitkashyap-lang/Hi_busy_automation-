const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../scratch');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  // Monitor network calls
  const requests = [];
  page.on('request', req => {
    if (req.url().includes('report') || req.url().includes('analytics') || req.url().includes('renew') || req.url().includes('export')) {
      requests.push({ method: req.method(), url: req.url(), postData: req.postData() });
    }
  });
  page.on('response', async res => {
    if (res.url().includes('report') || res.url().includes('analytics') || res.url().includes('renew') || res.url().includes('export')) {
      console.log(`[NET RES] ${res.status()} ${res.url()}`);
    }
  });

  console.log("1. Logging in...");
  await page.goto('https://hiqa1.pooraa.net/');
  await page.fill('input[type="email"], input[name="email"], input[name="username"], #usr, [aria-label="Email ID"]', 'ankit.kashyap@tech.busy.in'); 
  await page.fill('input[type="password"], input[name="password"], #pwd, [aria-label="Password"]', '123456');
  await page.click('button[type="submit"], button:has-text("Login")');
  await page.waitForTimeout(3000);

  console.log("2. Navigating to Partner Listing -> 3M Infocare...");
  await page.getByRole('button', { name: 'menu' }).first().click();
  await page.waitForTimeout(1000);
  await page.getByRole('link', { name: /Partner/i }).first().click();
  await page.waitForTimeout(3000);

  const searchInput = page.locator('input[placeholder="Search"]').first();
  await searchInput.fill('3M Infocare');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);

  await page.locator('button[aria-label="Access Account"], button:has(svg[data-testid="LockOpenIcon"])').first().click();
  await page.waitForTimeout(4000);

  console.log("3. Navigating to Due Renewals page...");
  await page.goto('https://hiqa1.pooraa.net/partner/analytics/duerenewal?tab=0&product=desktop');
  await page.waitForTimeout(5000);

  // Inspect the layout and surrounding labels of all inputs
  console.log("4. Inspecting filter labels and structure...");
  const filtersInfo = await page.evaluate(() => {
    const results = [];
    const allInputs = document.querySelectorAll('input, select');
    allInputs.forEach((inp, idx) => {
      // Find closest container
      const container = inp.closest('.MuiFormControl-root, .form-group, div[class*="Filter"], div[class*="col"], div[class*="field"]');
      const label = container?.querySelector('label')?.innerText?.trim() || '';
      const placeholder = inp.placeholder || '';
      const value = inp.value || '';
      const parentText = container?.innerText?.trim().replace(/\n/g, ' ') || '';
      results.push({
        index: idx,
        tagName: inp.tagName,
        type: inp.type,
        id: inp.id,
        value,
        placeholder,
        label,
        parentText
      });
    });
    return results;
  });
  console.log("Filters detail:", JSON.stringify(filtersInfo, null, 2));

  // Inspect what options are in each Autocomplete popup
  console.log("\n5. Inspecting Autocomplete options for each popup indicator...");
  const popupButtons = page.locator('button[aria-label="Open"], button[title="Open"]');
  const popupCount = await popupButtons.count();
  console.log(`Found ${popupCount} popup indicators`);

  for (let i = 0; i < popupCount; i++) {
    const btn = popupButtons.nth(i);
    try {
      await btn.click();
      await page.waitForTimeout(500);
      const options = await page.locator('.MuiAutocomplete-popper li, [role="listbox"] li, .MuiAutocomplete-option').allInnerTexts();
      console.log(`Autocomplete #${i} options (first 10 of ${options.length}):`, options.slice(0, 10));
      // close it
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    } catch (e) {
      console.log(`Error opening autocomplete #${i}:`, e.message);
    }
  }

  // Inspect what data grid or table is shown (even if empty)
  console.log("\n6. Inspecting Table/Grid/Cards on Due Renewals...");
  const gridInfo = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('div[class*="row"], div[class*="card"], div[class*="item"], table tr')).map(r => r.innerText?.trim()).filter(Boolean);
    const textBlocks = Array.from(document.querySelectorAll('p, span, h6, h5, div')).map(e => e.innerText?.trim()).filter(t => t && t.length > 5 && t.length < 100);
    return {
      rowCount: rows.length,
      sampleRows: rows.slice(0, 10),
      sampleText: Array.from(new Set(textBlocks)).slice(0, 20)
    };
  });
  console.log("Grid/Card info:", JSON.stringify(gridInfo, null, 2));

  // Click Download Excel and capture everything (dialog, new tab, toast, download, network)
  console.log("\n7. Clicking Download Excel and capturing behavior...");
  const dlBtn = page.locator('button:has(img[title="Download Excel"]), button[title="Download Excel"], img[title="Download Excel"]').first();
  if (await dlBtn.isVisible()) {
    console.log("Clicking Download Excel...");
    requests.length = 0; // reset requests log
    
    // Listen for dialog
    page.on('dialog', async dialog => {
      console.log("DIALOG OPENED:", dialog.type(), dialog.message());
      await dialog.accept();
    });

    // Listen for popup
    const popupPromise = page.waitForEvent('popup', { timeout: 8000 }).catch(() => null);

    // Listen for download
    const downloadPromise = page.waitForEvent('download', { timeout: 8000 }).catch(() => null);

    await dlBtn.click();
    console.log("Clicked! Waiting 4 seconds for response...");
    await page.waitForTimeout(4000);

    const popup = await popupPromise;
    if (popup) {
      console.log("Popup opened! URL:", popup.url());
      await popup.screenshot({ path: path.join(outDir, 'dl_popup.png') });
    }

    const download = await downloadPromise;
    if (download) {
      console.log("Browser download fired! Suggested filename:", download.suggestedFilename());
      const savePath = path.join(outDir, download.suggestedFilename());
      await download.saveAs(savePath);
      console.log("Saved download to:", savePath);
    }

    // Check toasts or alerts
    const toast = await page.locator('.MuiAlert-message, [role="alert"], #notistack-snackbar, .Toastify').allInnerTexts().catch(() => []);
    console.log("Toasts / Alerts visible:", toast);

    console.log("Network calls during download click:", JSON.stringify(requests, null, 2));
  }

  // Check other product parameters in URL
  console.log("\n8. Testing product query parameters: desktop, online, mobile, recom...");
  for (const prod of ['desktop', 'online', 'mobile', 'recom', 'busy_magic']) {
    const url = `https://hiqa1.pooraa.net/partner/analytics/duerenewal?tab=0&product=${prod}`;
    console.log(`Navigating to ${url}...`);
    await page.goto(url);
    await page.waitForTimeout(3000);
    const pageTitle = await page.title();
    const bodySnippet = await page.evaluate(() => document.body.innerText.substring(0, 300).replace(/\n/g, ' '));
    console.log(`Product: ${prod} | Snippet: ${bodySnippet.substring(0, 150)}...`);
  }

  await browser.close();
})().catch(err => {
  console.error("FATAL ERROR in detailed inspection:", err);
  process.exit(1);
});

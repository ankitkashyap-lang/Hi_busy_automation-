const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const outDir = path.join(__dirname, '../scratch');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  console.log("1. Logging in...");
  await page.goto('https://hiqa1.pooraa.net/');
  await page.fill('#usr', 'ankit.kashyap@tech.busy.in'); 
  await page.fill('#pwd', '123456');
  await page.click('button:has-text("Login")');
  await page.waitForTimeout(3000);

  console.log("2. Accessing 3M Infocare partner account...");
  await page.getByRole('button', { name: 'menu' }).first().click();
  await page.waitForTimeout(1000);
  await page.getByRole('link', { name: /Partner/i }).first().click();
  await page.waitForTimeout(3000);

  await page.locator('input[placeholder="Search"]').first().fill('3M Infocare');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);
  await page.locator('button[aria-label="Access Account"]').first().click();
  await page.waitForTimeout(4000);

  console.log("3. Navigating to Expired Renewals: /partner/analytics/expiredrenewal?tab=0&product=desktop");
  await page.goto('https://hiqa1.pooraa.net/partner/analytics/expiredrenewal?tab=0&product=desktop');
  await page.waitForTimeout(5000);

  console.log("Current URL:", page.url());
  await page.screenshot({ path: path.join(outDir, 'expired_renewals_full.png') });
  const html = await page.content();
  fs.writeFileSync(path.join(outDir, 'expired_renewals_actual.html'), html);

  // Inspect page details
  const details = await page.evaluate(() => {
    // Title / Header
    const heading = document.querySelector('h1, h2, h3, h4, h5, h6, span[class*="title"], [class*="heading"]')?.innerText?.trim() || '';

    // Product tabs
    const productTabs = Array.from(document.querySelectorAll('.tab1, .tab2, .tab3, .tab4, select:has(option[value="Busy 21"])')).map(e => ({
      tagName: e.tagName,
      className: e.className,
      text: e.innerText?.trim(),
      options: Array.from(e.querySelectorAll('option')).map(o => o.innerText?.trim())
    }));

    // Form inputs and Autocomplete
    const inputs = Array.from(document.querySelectorAll('input, select')).map(i => ({
      tagName: i.tagName,
      type: i.type,
      id: i.id,
      value: i.value,
      placeholder: i.placeholder,
      options: Array.from(i.querySelectorAll('option')).map(o => o.innerText?.trim())
    }));

    // Metrics cards
    const textCards = Array.from(document.querySelectorAll('div[class*="row"], div[class*="card"], div[class*="MuiGrid"]'))
      .map(e => e.innerText?.trim())
      .filter(t => t && (t.includes('Expired') || t.includes('₹') || t.includes('Total') || t.includes('Pending')))
      .slice(0, 5);

    // Data table
    const tableHeaders = Array.from(document.querySelectorAll('th, div[role="columnheader"]')).map(th => th.innerText?.trim());
    const tableRows = Array.from(document.querySelectorAll('tbody tr, div[role="row"]:not(:first-child)')).map(tr => tr.innerText?.trim().replace(/\n/g, ' | '));

    return { heading, productTabs, inputs, textCards, tableHeaders, tableRows: tableRows.slice(0, 5) };
  });

  console.log("=== EXPIRED RENEWALS ACTUAL DETAILS ===");
  console.log("Heading:", details.heading);
  console.log("Product Tabs:", JSON.stringify(details.productTabs, null, 2));
  console.log("Inputs Count:", details.inputs.length);
  console.log("Inputs:", JSON.stringify(details.inputs, null, 2));
  console.log("Text / KPI Cards:", details.textCards);
  console.log("Table Headers:", details.tableHeaders);
  console.log("Sample Table Rows:", details.tableRows);

  // Inspect all Autocomplete options
  console.log("\n4. Inspecting Autocomplete Dropdown options...");
  const popupButtons = page.locator('.MuiAutocomplete-root button[title="Open"]');
  const popupCount = await popupButtons.count();
  console.log(`Found ${popupCount} Autocomplete popup indicators`);

  for (let i = 0; i < popupCount; i++) {
    const btn = popupButtons.nth(i);
    try {
      await btn.click();
      await page.waitForTimeout(400);
      const options = await page.locator('.MuiAutocomplete-popper li, [role="listbox"] li, .MuiAutocomplete-option').allInnerTexts();
      console.log(`Dropdown #${i} (Current value: "${details.inputs[i]?.value || ''}") Options count: ${options.length}. Options:`, options.slice(0, 10));
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    } catch (e) {
      console.log(`Error on dropdown #${i}:`, e.message);
    }
  }

  // Test Download Excel
  console.log("\n5. Testing Download Excel button...");
  const dlBtn = page.locator('button:has(img[title="Download Excel"]), button[title="Download Excel"], img[title="Download Excel"]').first();
  if (await dlBtn.isVisible()) {
    console.log("Download Excel button visible. Listening for addJob network call...");
    let jobPayload = null;
    page.on('request', req => {
      if (req.url().includes('addJob')) {
        jobPayload = req.postData();
        console.log("[addJob Payload]:", jobPayload);
      }
    });

    const popupPromise = page.waitForEvent('popup', { timeout: 8000 }).catch(() => null);
    await dlBtn.click();
    await page.waitForTimeout(3000);

    const popup = await popupPromise;
    const dlPage = popup || page;
    if (!popup) {
      await dlPage.goto('https://hiqa1.pooraa.net/partner/report/download');
    }
    await dlPage.waitForTimeout(3000);
    console.log("On Download queue page:", dlPage.url());

    // Trigger cron API and wait for Processed
    const cronUrl = `http://hiqa1.pooraa.net:9094/report/v1/cron/report/`;
    await dlPage.request.get(cronUrl, { timeout: 15000 }).catch(() => {});
    await dlPage.reload({ waitUntil: 'domcontentloaded' });
    await dlPage.waitForTimeout(3000);

    const firstRowText = await dlPage.locator('tbody tr, div[role="row"]:not(:first-child)').first().innerText().catch(() => '');
    console.log("First row in download queue:", firstRowText.replace(/\n/g, ' | '));

    const downloadBtn = dlPage.locator('button:has-text("Download")').first();
    if (await downloadBtn.isVisible()) {
      const dlPromise = dlPage.waitForEvent('download', { timeout: 30000 });
      await downloadBtn.click();
      const download = await dlPromise;
      const filename = download.suggestedFilename();
      const savePath = path.join(outDir, filename);
      await download.saveAs(savePath);
      console.log(`Downloaded file: ${filename} (${fs.statSync(savePath).size} bytes)`);

      const wb = xlsx.readFile(savePath);
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
      console.log("Excel Sheet:", wb.SheetNames[0]);
      console.log("Excel Row 0 (Metadata):", rawRows[0]);
      console.log("Excel Row 1 (Headers):", rawRows[1]);
      console.log(`Excel Data Rows: ${rawRows.length - 2}`);
      console.log("Sample Data Row 2:", rawRows[2]);
    }
  }

  // Test product switching: Desktop, Online, Mobile, Recom, mazu
  console.log("\n6. Testing product URL parameters on Expired Renewals...");
  for (const p of ['desktop', 'online', 'mobile', 'recom', 'mazu']) {
    const url = `https://hiqa1.pooraa.net/partner/analytics/expiredrenewal?tab=0&product=${p}`;
    await page.goto(url);
    await page.waitForTimeout(2000);
    const bodyText = await page.innerText('body');
    const hasHeader = bodyText.includes('Expired Renewals');
    console.log(`Product "${p}": Page loaded? ${hasHeader}. URL: ${page.url()}`);
  }

  await browser.close();
  console.log("Deep exploration complete!");
})().catch(err => {
  console.error("Deep exploration error:", err);
  process.exit(1);
});

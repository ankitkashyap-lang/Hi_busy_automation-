const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../scratch');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  console.log("1. Logging in to QA1...");
  await page.goto('https://hiqa1.pooraa.net/');
  await page.fill('#usr, input[type="email"]', 'ankit.kashyap@tech.busy.in'); 
  await page.fill('#pwd, input[type="password"]', '123456');
  await page.click('button:has-text("Login")');
  await page.waitForTimeout(3000);

  console.log("2. Navigating to Partner -> 3M Infocare...");
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

  console.log("3. On Partner Dashboard. Current URL:", page.url());
  await page.screenshot({ path: path.join(outDir, 'partner_dashboard_before_expired.png') });

  console.log("4. Looking for Expired Renewals via Card or Menu...");
  // Check if Expired Renewals card exists on dashboard
  const expiredCard = page.locator('div.MuiPaper-root').filter({ hasText: /Expired Renewals/i }).first();
  let clicked = false;
  if (await expiredCard.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log("Found Expired Renewals card on dashboard! Clicking...");
    await expiredCard.click();
    clicked = true;
  } else {
    console.log("Opening Menu on Partner dashboard to find Analytics -> Expired Renewals...");
    await page.getByRole('button', { name: 'menu' }).first().click();
    await page.waitForTimeout(1000);
    const analyticsItem = page.locator('text=/Analytics/i').first();
    if (await analyticsItem.isVisible({ timeout: 2000 })) {
      await analyticsItem.click();
      await page.waitForTimeout(1000);
    }
    const expiredLink = page.locator('a, button, li').filter({ hasText: /Expired Renewals/i }).first();
    if (await expiredLink.isVisible({ timeout: 3000 })) {
      await expiredLink.click();
      clicked = true;
    }
  }

  if (!clicked) {
    console.log("Card/menu not found. Trying direct URL: /partner/analytics/expiredrenewal?tab=0&product=desktop");
    await page.goto('https://hiqa1.pooraa.net/partner/analytics/expiredrenewal?tab=0&product=desktop');
  }

  await page.waitForTimeout(4000);
  console.log("5. Reached Expired Renewals page. URL:", page.url());
  await page.screenshot({ path: path.join(outDir, 'expired_renewals_page.png') });

  // Dump HTML
  const html = await page.content();
  fs.writeFileSync(path.join(outDir, 'expired_renewals.html'), html);

  // Deep inspect page structure
  const pageDetails = await page.evaluate(() => {
    const title = document.title;
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, span, div')).map(e => e.innerText?.trim())
      .filter(t => t && t.includes('Expired') && t.length < 50);

    const tabs = Array.from(document.querySelectorAll('.tab1, .tab2, .tab3, .tab4, [role="tab"], div[class*="tab"]')).map(t => t.innerText?.trim()).filter(Boolean);

    const inputs = Array.from(document.querySelectorAll('input, select')).map(i => ({
      tagName: i.tagName,
      type: i.type,
      id: i.id,
      value: i.value,
      placeholder: i.placeholder,
      options: Array.from(i.querySelectorAll('option')).map(o => o.innerText?.trim())
    }));

    const textCards = Array.from(document.querySelectorAll('div[class*="row"], div[class*="card"], div[class*="MuiGrid"]'))
      .map(e => e.innerText?.trim())
      .filter(t => t && (t.includes('Expired') || t.includes('₹') || t.includes('Pending')))
      .slice(0, 5);

    const buttons = Array.from(document.querySelectorAll('button')).map(b => ({
      text: b.innerText?.trim().replace(/\s+/g, ' '),
      title: b.title,
      aria: b.getAttribute('aria-label')
    })).filter(b => b.text || b.title || b.aria);

    const tables = Array.from(document.querySelectorAll('table')).map(t => ({
      headers: Array.from(t.querySelectorAll('th')).map(th => th.innerText?.trim()),
      rows: Array.from(t.querySelectorAll('tbody tr')).map(tr => tr.innerText?.trim().replace(/\n/g, ' | '))
    }));

    return { title, headings, tabs, inputs, textCards, buttons, tables };
  });

  console.log("=== EXPIRED RENEWALS PAGE DETAILS ===");
  console.log("Headings:", pageDetails.headings);
  console.log("Tabs:", pageDetails.tabs);
  console.log("Inputs / Selects count:", pageDetails.inputs.length);
  console.log("Inputs / Selects:", JSON.stringify(pageDetails.inputs, null, 2));
  console.log("Text / KPI cards sample:", pageDetails.textCards);
  console.log("Buttons:", JSON.stringify(pageDetails.buttons, null, 2));
  console.log("Tables:", JSON.stringify(pageDetails.tables, null, 2));

  // Inspect Autocomplete dropdown options
  console.log("\n6. Inspecting Autocomplete Dropdown options...");
  const popupButtons = page.locator('.MuiAutocomplete-root button[title="Open"]');
  const popupCount = await popupButtons.count();
  console.log(`Found ${popupCount} Autocomplete popup indicators`);

  for (let i = 0; i < popupCount; i++) {
    const btn = popupButtons.nth(i);
    try {
      await btn.click();
      await page.waitForTimeout(400);
      const options = await page.locator('.MuiAutocomplete-popper li, [role="listbox"] li, .MuiAutocomplete-option').allInnerTexts();
      console.log(`Dropdown #${i} Options count: ${options.length}. Sample:`, options.slice(0, 10));
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    } catch (e) {
      console.log(`Error on dropdown #${i}:`, e.message);
    }
  }

  // Test Download Excel button
  console.log("\n7. Testing Download Excel button...");
  const dlBtn = page.locator('button:has(img[title="Download Excel"]), button[title="Download Excel"], img[title="Download Excel"]').first();
  if (await dlBtn.isVisible()) {
    console.log("Download Excel button is visible! Clicking...");
    
    // Intercept network call
    page.on('request', req => {
      if (req.url().includes('report') || req.url().includes('addJob')) {
        console.log(`[NET REQ] ${req.method()} ${req.url()}`, req.postData());
      }
    });

    const popupPromise = page.waitForEvent('popup', { timeout: 8000 }).catch(() => null);
    await dlBtn.click();
    await page.waitForTimeout(3000);

    const popup = await popupPromise;
    if (popup) {
      console.log("Popup opened! URL:", popup.url());
    } else {
      console.log("Current page URL after click:", page.url());
    }
  }

  await browser.close();
  console.log("Done exploration.");
})().catch(err => {
  console.error("Exploration error:", err);
  process.exit(1);
});

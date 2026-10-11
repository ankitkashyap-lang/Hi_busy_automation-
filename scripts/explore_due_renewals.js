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

  console.log("1. Navigating to hiqa1...");
  await page.goto('https://hiqa1.pooraa.net/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  console.log("2. Logging in as admin...");
  await page.fill('input[type="email"], input[name="email"], input[name="username"], #usr, [aria-label="Email ID"]', 'ankit.kashyap@tech.busy.in'); 
  await page.fill('input[type="password"], input[name="password"], #pwd, [aria-label="Password"]', '123456');
  await page.click('button[type="submit"], button:has-text("Login")');

  await page.waitForTimeout(4000);
  console.log("Logged in. Current URL:", page.url());

  console.log("3. Navigating to Partner Listing...");
  // Click menu button
  const menuBtn = page.getByRole('button', { name: 'menu' }).first();
  await menuBtn.waitFor({ state: 'visible', timeout: 15000 });
  await menuBtn.click();
  await page.waitForTimeout(1000);

  // Click Partner link
  const partnerLink = page.getByRole('link', { name: /Partner/i }).first();
  await partnerLink.waitFor({ state: 'visible', timeout: 10000 });
  await partnerLink.click();
  await page.waitForTimeout(4000);
  console.log("On Partner page. URL:", page.url());

  console.log("4. Searching for '3M Infocare'...");
  const searchInput = page.locator('input[placeholder="Search"], input[aria-label="search"]').first();
  await searchInput.fill('3M Infocare');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);

  console.log("Checking search results...");
  const accessBtns = page.locator('button[aria-label="Access Account"], button:has(svg[data-testid="LockOpenIcon"])');
  let count = await accessBtns.count();
  console.log(`Found ${count} Access Account buttons for 3M Infocare`);

  if (count === 0) {
    console.log("3M Infocare not found. Clearing search to pick first available partner...");
    await searchInput.fill('');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
    count = await accessBtns.count();
    console.log(`Found ${count} Access Account buttons overall`);
  }

  // Click access account
  await accessBtns.first().click();
  await page.waitForTimeout(6000);
  console.log("Entered Partner/CP dashboard. URL:", page.url());
  await page.screenshot({ path: path.join(outDir, 'cp_dashboard.png') });

  console.log("5. Opening Menu on Partner dashboard to find Analytics -> Due Renewals...");
  const cpMenuBtn = page.getByRole('button', { name: 'menu' }).first();
  await cpMenuBtn.waitFor({ state: 'visible', timeout: 15000 });
  await cpMenuBtn.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outDir, 'cp_menu_open.png') });

  // List all visible menu links and buttons
  const menuElements = await page.locator('.MuiDrawer-root a, .MuiDrawer-root button, [role="navigation"] a, [role="navigation"] button, .MuiList-root a, .MuiList-root [role="button"]').evaluateAll(els => 
    els.map(e => ({ text: e.innerText?.trim(), href: e.getAttribute('href'), role: e.getAttribute('role') }))
  );
  fs.writeFileSync(path.join(outDir, 'menu_items.json'), JSON.stringify(menuElements, null, 2));
  console.log("Saved menu items to scratch/menu_items.json:", JSON.stringify(menuElements.slice(0, 15), null, 2));

  // Look for Analytics item
  const analyticsItem = page.locator('.MuiDrawer-root, [role="navigation"]')
    .locator('text=/Analytics/i, button:has-text("Analytics"), div:has-text("Analytics"), a:has-text("Analytics")')
    .first();

  if (await analyticsItem.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log("Analytics found in menu! Clicking Analytics...");
    await analyticsItem.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(outDir, 'cp_analytics_expanded.png') });
  } else {
    console.log("Analytics not directly visible in drawer, checking all drawer text...");
  }

  // Look for Due Renewals in drawer
  const dueRenewalsDrawerLink = page.locator('.MuiDrawer-root, [role="navigation"]')
    .locator('a:has-text("Due Renewals"), button:has-text("Due Renewals"), div:has-text("Due Renewals"), [href*="dueRenewals"], [href*="duerenewals"]')
    .first();

  if (await dueRenewalsDrawerLink.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log("Found Due Renewals in drawer! Clicking...");
    await dueRenewalsDrawerLink.click();
  } else {
    console.log("Checking dashboard for Analytics or Due Renewals card...");
    // Close menu to inspect dashboard
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    const dueRenewalsCard = page.locator('div.MuiPaper-root').filter({ hasText: 'Due Renewals' }).first();
    if (await dueRenewalsCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log("Found Due Renewals card on dashboard! Clicking card...");
      await dueRenewalsCard.click();
    }
  }

  await page.waitForTimeout(5000);
  console.log("Current URL after navigating:", page.url());
  await page.screenshot({ path: path.join(outDir, 'due_renewals_page.png') });
  const html = await page.content();
  fs.writeFileSync(path.join(outDir, 'due_renewals.html'), html);
  console.log("Successfully dumped Due Renewals page HTML and screenshot!");

  await browser.close();
})().catch(err => {
  console.error("FATAL ERROR in script:", err);
  process.exit(1);
});

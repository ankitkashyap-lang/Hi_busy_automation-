const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://hiqa1.pooraa.net/');
  await page.fill('#usr', 'ankit.kashyap@tech.busy.in'); 
  await page.fill('#pwd', '123456');
  await page.click('button:has-text("Login")');
  await page.waitForTimeout(3000);

  // Search partner and access
  await page.getByRole('button', { name: 'menu' }).first().click();
  await page.waitForTimeout(1000);
  await page.getByRole('link', { name: /Partner/i }).first().click();
  await page.waitForTimeout(3000);
  await page.locator('input[placeholder="Search"]').first().fill('3M Infocare');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);
  await page.locator('button[aria-label="Access Account"]').first().click();
  await page.waitForTimeout(4000);

  console.log("On Partner Dashboard. Current URL:", page.url());

  // Dump all card texts
  const cards = await page.locator('div.MuiPaper-root').allInnerTexts();
  console.log("All cards count:", cards.length);
  cards.forEach((c, idx) => {
    const title = c.split('\n')[0];
    console.log(`Card #${idx}: "${title}" | full: "${c.replace(/\n/g, ' ')}"`);
  });

  // Open menu on Partner Dashboard
  console.log("\nOpening menu on Partner dashboard...");
  await page.getByRole('button', { name: 'menu' }).first().click();
  await page.waitForTimeout(1500);

  const drawerTexts = await page.locator('.MuiDrawer-root, [role="navigation"]').locator('a, button, li').allInnerTexts();
  console.log("Drawer items:", drawerTexts.map(t => t.trim()).filter(Boolean));

  // If Analytics exists, click it
  const analyticsItem = page.locator('text=/Analytics/i').first();
  if (await analyticsItem.isVisible()) {
    console.log("Found Analytics in menu! Clicking...");
    await analyticsItem.click();
    await page.waitForTimeout(1500);
    const subItems = await page.locator('.MuiDrawer-root, [role="navigation"]').locator('a, button, li').allInnerTexts();
    console.log("Sub items after Analytics click:", subItems.map(t => t.trim()).filter(Boolean));
  }

  // Also check if there is an Expired Renewals link or route
  // In Due Renewals, the route was /partner/analytics/duerenewal
  // What are the other routes under /partner/analytics/?
  const links = await page.locator('a[href*="analytics"]').evaluateAll(els => els.map(e => ({ text: e.innerText?.trim(), href: e.getAttribute('href') })));
  console.log("Analytics links found:", links);

  await browser.close();
})().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});

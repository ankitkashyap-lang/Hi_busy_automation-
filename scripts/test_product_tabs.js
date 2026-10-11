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

  const products = [
    { tab: 0, prod: 'desktop' },
    { tab: 1, prod: 'online' },
    { tab: 2, prod: 'mobile' },
    { tab: 3, prod: 'recom' },
    { tab: 4, prod: 'mazu' }
  ];

  for (const p of products) {
    const url = `https://hiqa1.pooraa.net/partner/analytics/duerenewal?tab=${p.tab}&product=${p.prod}`;
    console.log(`Checking ${url}...`);
    await page.goto(url);
    await page.waitForTimeout(3000);
    const text = await page.locator('div[class*="row"], .card, h6, h5, table, p').allInnerTexts();
    const metrics = text.filter(x => x.includes('Due Renewals') || x.includes('Pending') || x.includes('Total') || x.includes('No Record')).slice(0, 5);
    console.log(`Metrics for ${p.prod} (tab ${p.tab}):`, metrics);
  }

  await browser.close();
})().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});

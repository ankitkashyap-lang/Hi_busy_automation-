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

  await page.goto('https://hiqa1.pooraa.net/partner/analytics/duerenewal?tab=0&product=desktop');
  await page.waitForTimeout(4000);

  // Check each Autocomplete input by placeholder/label or by clicking
  const inputs = await page.locator('.MuiAutocomplete-root input').all();
  console.log(`Found ${inputs.length} Autocomplete inputs.`);

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const val = await input.inputValue();
    // Click input or open popup
    const popupBtn = page.locator('.MuiAutocomplete-root button[title="Open"]').nth(i);
    await popupBtn.click();
    await page.waitForTimeout(400);
    const options = await page.locator('.MuiAutocomplete-popper li, [role="listbox"] li').allInnerTexts();
    console.log(`Dropdown #${i} (Current: "${val}") Options count: ${options.length}. Options:`, options.slice(0, 15));
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }

  // Also test clicking each product tab:
  console.log("\nTesting product tab clicks...");
  const tabs = [
    { name: 'Online', selector: '.tab1' },
    { name: 'Mobile', selector: '.tab2' },
    { name: 'Recom', selector: '.tab3' },
    { name: 'mazu', selector: '.tab4' }
  ];

  for (const t of tabs) {
    const el = page.locator(t.selector).first();
    if (await el.isVisible()) {
      await el.click();
      await page.waitForTimeout(2000);
      console.log(`Clicked tab: ${t.name}. URL: ${page.url()}`);
      const text = await page.locator('div[class*="row"], .card, h6, h5').allInnerTexts();
      const summaryText = text.filter(x => x.length > 5 && x.length < 50).slice(0, 5).join(' | ');
      console.log(`Data summary for ${t.name}:`, summaryText);
    }
  }

  await browser.close();
})().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});

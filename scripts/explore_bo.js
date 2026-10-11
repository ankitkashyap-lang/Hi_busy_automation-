const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const outDir = 'C:\\Users\\BIPL\\.gemini\\antigravity-ide\\brain\\98b30c45-1cb8-40d2-b364-d2166fdc6a14\\scratch';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Navigating to hiqa1...");
  await page.goto('https://hiqa1.pooraa.net/');

  console.log("Logging in as admin/busy team...");
  await page.fill('input[type="email"], input[name="email"], input[name="username"], #usr, [aria-label="Email ID"]', 'ankit.kashyap@tech.busy.in'); 
  await page.fill('input[type="password"], input[name="password"], #pwd, [aria-label="Password"]', '123456');
  await page.click('button[type="submit"], button:has-text("Login")');

  await page.waitForTimeout(5000);
  
  console.log("Clicking menu/partner...");
  try {
      await page.click('button[aria-label="menu"], .menu-icon');
      await page.waitForTimeout(1000);
      await page.click('a:has-text("Partner")');
  } catch(e) {
      console.log("Could not navigate via menu. Continuing...");
  }
  
  await page.waitForTimeout(4000);
  
  console.log("Searching CP...");
  try {
      await page.fill('input[placeholder*="Search"]', 'Inside Sales (Delhi Office)');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
      
      await page.locator('button[aria-label="Access Account"], button:has(svg[data-testid="LockOpenIcon"])').first().click();
      await page.waitForTimeout(5000);
      
      console.log("On CP dashboard. Looking for Busy Online Subscription tab...");
      
      const boTab = page.locator('button, a').filter({ hasText: /Subscription|Busy Online/i }).first();
      if (await boTab.isVisible()) {
          await boTab.click();
      } else {
          await page.click('button[aria-label="menu"], .menu-icon');
          await page.waitForTimeout(1000);
          await page.locator('a').filter({ hasText: /Subscription|Busy Online/i }).first().click();
      }
      
      await page.waitForTimeout(5000);
      
      console.log("In Subscription Module.");
      
      const subHtml = await page.content();
      fs.writeFileSync(path.join(outDir, 'bo_main.html'), subHtml);
      await page.screenshot({ path: path.join(outDir, 'bo_main.png') });
      
      for (const tabName of ['New', 'Renew', 'Upgrade']) {
          console.log(`Looking for ${tabName} tab...`);
          const tab = page.locator('button, [role="tab"]').filter({ hasText: new RegExp(`^${tabName}$`, 'i') }).first();
          if (await tab.isVisible()) {
              await tab.click();
              await page.waitForTimeout(3000);
              const tabHtml = await page.content();
              fs.writeFileSync(path.join(outDir, `bo_${tabName.toLowerCase()}.html`), tabHtml);
              await page.screenshot({ path: path.join(outDir, `bo_${tabName.toLowerCase()}.png`) });
          } else {
              console.log(`Could not find ${tabName} tab.`);
          }
      }

  } catch(e) {
      console.log("Error in CP navigation or BO exploration:", e);
  }

  await browser.close();
  console.log("Done exploring BO module.");
})();

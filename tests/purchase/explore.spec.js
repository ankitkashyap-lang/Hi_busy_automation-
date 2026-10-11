const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/loginPage');

test('Explore View History', async ({ page, context }) => {
  // 1. Login
  const loginPage = new LoginPage(page);
  await loginPage.login(process.env.BUSY_TEAM_EMAIL, process.env.BUSY_TEAM_PASSWORD);
  await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });

  // 2. Navigate to Partner Dashboard
  await page.goto('https://hiqa1.pooraa.net/partner/teams/id', { waitUntil: 'domcontentloaded' });
  const partnerSearchInput = page.locator('input[placeholder="Search"]');
  await partnerSearchInput.fill('110280'); // 3M Infocare
  await partnerSearchInput.press('Enter');

  const accessAccountBtn = page.locator('button[aria-label="Access Account"], button[title="Access Account"], button:has(i:text-is("lock_open"))').first();
  await accessAccountBtn.waitFor({ state: 'visible', timeout: 15000 });
  await accessAccountBtn.click();
  await expect(page).toHaveURL(/.*(reseller|partner)\/dashboard.*/, { timeout: 15000 });

  // Click the "Online" tab
  const onlineTab = page.locator('div, span, button').filter({ hasText: /^Online$/ }).first();
  await onlineTab.waitFor({ state: 'visible', timeout: 5000 });
  await onlineTab.click();

  await page.locator('input[placeholder="Enter Serial Number"]').fill('2190053859');

  context.on('page', p => console.log('NEW PAGE EVENT'));
  page.on('popup', p => console.log('POPUP EVENT'));
  page.on('dialog', d => console.log('DIALOG EVENT: ' + d.message()));

  // Setup request interception to see if it makes an API call that opens a PDF or something
  page.on('request', request => console.log('>>', request.method(), request.url()));
  page.on('response', response => console.log('<<', response.status(), response.url()));

  console.log('Clicking View History...');
  await page.locator('button').filter({ hasText: /View History/i }).click();

  await page.waitForTimeout(5000);
  console.log('Current URL: ', page.url());
  
  // Dump text content of body to see if there's a modal
  console.log('Body text:', await page.locator('body').innerText());
});

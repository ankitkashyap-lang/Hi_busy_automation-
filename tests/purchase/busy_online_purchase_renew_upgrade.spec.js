const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/loginPage');
const dbHelper = require('../../utils/dbHelper');

test.describe.serial('Busy Online Purchase, Renew & Upgrade Scenarios', () => {
  // Test data
  const INVALID_SERIAL = '12345';
  let validSerial = null;


  let page;
  let context;

  test.beforeAll(async ({ browser }) => {
    // 1. Fetch DB data
    try {
      await dbHelper.connect();
      const rows = await dbHelper.executeSelect(`
        SELECT s.subscription_number 
        FROM subscription s 
        WHERE fk_product_id=21 AND s.fk_channel_partner_id = 749 
        ORDER BY created_at DESC 
        LIMIT 1;
      `);
      if (rows && rows.length > 0) {
        validSerial = rows[0].subscription_number;
      }
      await dbHelper.close();
    } catch (err) {
      console.error('Failed to fetch serial from DB:', err.message);
    }

    // 2. Setup Context and Page
    context = await browser.newContext();
    page = await context.newPage();

    // 3. Login ONCE
    const loginPage = new LoginPage(page);
    await loginPage.login(process.env.BUSY_TEAM_EMAIL, process.env.BUSY_TEAM_PASSWORD);
    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });

    // 4. Navigate to Partner Dashboard and impersonate CP (3M Infocare, ID: 749)
    await page.goto((process.env.BASE_URL || 'https://hiqa1.pooraa.net/') + 'partner/teams/id', { waitUntil: 'domcontentloaded' });
    const partnerSearchInput = page.locator('input[placeholder="Search"]');
    await partnerSearchInput.fill('3M Infocare');
    await partnerSearchInput.press('Enter');
    await page.waitForTimeout(2000);

    const accessAccountBtn = page.locator('button[aria-label="Access Account"], button[title="Access Account"], button:has(i:text-is("lock_open"))').first();
    await accessAccountBtn.waitFor({ state: 'visible', timeout: 15000 });
    await accessAccountBtn.click();
    await expect(page).toHaveURL(/.*(reseller|partner)\/dashboard.*/, { timeout: 15000 });
  });

  test.afterAll(async () => {
    await context.close();
  });

  test.beforeEach(async () => {
    // Navigate back to Dashboard to reset state before each test
    await page.goto((process.env.BASE_URL || 'https://hiqa1.pooraa.net/') + 'partner/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*(partner)\/dashboard.*/, { timeout: 15000 });

    // Click the "Online" tab
    const onlineTab = page.locator('div, span, button').filter({ hasText: /^Online$/ }).first();
    await onlineTab.waitFor({ state: 'visible', timeout: 5000 });
    await onlineTab.click();
  });

  test('TC-01: Busy Online - New Purchase Screen Verifications', async () => {
    // Click "New" button
    await page.locator('button').filter({ hasText: /^New$/ }).click();

    // Locate form fields
    const userCountInput = page.locator('input[type="text"]').first();
    const nextBtn = page.locator('button').filter({ hasText: /^Next$/ });

    // Validate default values
    // Using string '1' because text inputs store values as strings
    await expect(userCountInput).toHaveValue('1');

    // Test validations (e.g., Qty = 0)
    await userCountInput.fill('0');
    // Blur to trigger validation if necessary
    await userCountInput.blur();

    // Attempt to submit or check immediate errors
    await nextBtn.click();

    // Validate error message appears
    const errorMsg = page.locator('.Mui-error, .toast, .MuiFormHelperText-root').filter({ hasText: /Should be greater than 0|Cannot be blank/i }).first();
    await expect(errorMsg).toBeVisible();

    // Return back / Close
  });

  test('TC-02: Busy Online - Renew Screen Validation (Invalid Serial)', async () => {
    // Locate Serial Number text box and Renew button on dashboard
    const serialInput = page.locator('input[placeholder="Enter Serial Number"]');
    const renewBtn = page.locator('button').filter({ hasText: /^Renew$/ });

    // Click without serial should silently ignore or block
    await renewBtn.click();
    // Validate no dialog appears yet
    await expect(page.locator('.MuiDialog-root:visible, [role="dialog"]:visible').first()).not.toBeVisible();

    // Enter invalid serial number
    await serialInput.fill(INVALID_SERIAL);
    await renewBtn.click();

    // Validate the resulting Dialog
    const dialog = page.locator('.MuiDialog-root:visible, [role="dialog"]:visible').first();
    await expect(dialog).toBeVisible({ timeout: 10000 });
    await expect(dialog).toContainText('Subscription does not belong to you');
    await expect(dialog).toContainText('Do you want to purchase a New Busy Online subscription?');

    // Close dialog
    await page.locator('button').filter({ hasText: /^Cancel$/ }).click();
    await expect(dialog).toBeHidden({ timeout: 5000 });
  });

  test('TC-03: Busy Online - Upgrade Screen Validation (Invalid Serial)', async () => {
    // Locate Serial Number text box and Upgrade button on dashboard
    const serialInput = page.locator('input[placeholder="Enter Serial Number"]');
    const upgradeBtn = page.locator('button').filter({ hasText: /^Upgrade$/ });

    // Enter invalid serial number
    await serialInput.fill(INVALID_SERIAL);
    await upgradeBtn.click();

    // Validate the resulting Dialog
    const dialog = page.locator('.MuiDialog-root:visible, [role="dialog"]:visible').first();
    await expect(dialog).toBeVisible({ timeout: 10000 });
    await expect(dialog).toContainText('Subscription does not belong to you');

    // Close dialog
    await page.locator('button').filter({ hasText: /^Cancel$/ }).click();
    await expect(dialog).toBeHidden({ timeout: 5000 });
  });

  test('TC-04: Busy Online - Renew Screen Validation (Valid Serial)', async () => {
    // Skip if valid serial is not found in DB
    test.skip(!validSerial, 'No valid serial found in DB for CP 749');

    const serialInput = page.locator('input[placeholder="Enter Serial Number"]');
    const renewBtn = page.locator('button').filter({ hasText: /^Renew$/ });

    // Enter valid serial number
    await serialInput.fill(validSerial);
    await renewBtn.click();

    // Validate NO dialog blocks us
    const dialog = page.locator('.MuiDialog-root:visible, [role="dialog"]:visible').first();
    await expect(dialog).not.toBeVisible({ timeout: 1000 });

    // Continue with the Renew flow based on provided trace
    await page.getByRole('button', { name: 'Next' }).click();

    // Wait for the OTPs to be generated in the DB
    await page.waitForTimeout(1000);

    // Fetch dynamic OTPs from DB
    let mobileOtp = '4784';
    let emailOtp = '2683';
    try {
      await dbHelper.connect();
      const otpRows = await dbHelper.executeSelect(`
        SELECT otp, medium 
        FROM subscription_otp_verification 
        ORDER BY created_at DESC 
        LIMIT 2;
      `);
      await dbHelper.close();
      if (otpRows && otpRows.length >= 2) {
        const phoneRow = otpRows.find(r => r.medium === 'phone');
        const emailRow = otpRows.find(r => r.medium === 'email');
        if (phoneRow) mobileOtp = phoneRow.otp;
        if (emailRow) emailOtp = emailRow.otp;
      }
    } catch (e) {
      console.log('Failed to fetch OTPs from DB, using fallback values');
    }

    // Fill T-Code (OTP) verification fields
    const mobileField = page.getByTestId('renew-text-mobile-1-0-input').or(page.getByRole('textbox', { name: 'Mobile T-Code' })).first();
    if (await mobileField.isVisible({ timeout: 2000 })) {
      await mobileField.click();
      await mobileField.fill(mobileOtp);
    }

    const emailField = page.getByTestId('renew-text-email-1-1-input')
      .or(page.getByTestId('renew-text-email-1-0-input'))
      .or(page.getByRole('textbox', { name: 'Email T-Code' }))
      .first();
    if (await emailField.isVisible({ timeout: 2000 })) {
      await emailField.click();
      await emailField.fill(emailOtp);
    }

    // Submit Renew
    const finalRenewBtn = page.getByRole('button', { name: 'Renew' }).first();
    await finalRenewBtn.click();

    // The user's trace recorded two clicks. If there is a confirmation step or modal, we click again.
    await page.waitForTimeout(500);
    if (await finalRenewBtn.isVisible()) {
      await finalRenewBtn.click();
    }

    // Verify successful activation/renewal message dynamically containing the serial number
    const headerHeading = page.getByTestId('details-header-activationscreen-0-0').getByRole('heading');
    await expect(headerHeading).toContainText(`${validSerial} - Renew Successful`, { timeout: 10000 });
  });

  test('TC-05: Busy Online - Upgrade Screen Validation (Valid Serial)', async () => {
    test.skip(!validSerial, 'No valid serial found in DB for CP 749');

    const serialInput = page.locator('input[placeholder="Enter Serial Number"]');
    const upgradeBtn = page.locator('button').filter({ hasText: /^Upgrade$/ });

    // Enter valid serial number
    await serialInput.fill(validSerial);
    await upgradeBtn.click();

    // Validate NO dialog blocks us
    const dialog = page.locator('.MuiDialog-root:visible, [role="dialog"]:visible').first();
    await expect(dialog).not.toBeVisible({ timeout: 1000 });

    // Upgrade configuration (clicking control_point to add users/companies as per trace)
    await page.locator('button').filter({ hasText: 'control_point' }).first().click();
    await page.locator('button').filter({ hasText: 'control_point' }).first().click();
    await page.getByRole('button', { name: 'Next' }).click();

    // Wait for the OTPs to be generated in the DB
    // await page.waitForTimeout(3000);

    // Fetch dynamic OTPs from DB
    let mobileOtp = '4784';
    let emailOtp = '2683';
    try {
      await dbHelper.connect();
      const otpRows = await dbHelper.executeSelect(`
        SELECT otp, medium 
        FROM subscription_otp_verification 
        ORDER BY created_at DESC 
        LIMIT 2;
      `);
      await dbHelper.close();
      if (otpRows && otpRows.length >= 2) {
        const phoneRow = otpRows.find(r => r.medium === 'phone');
        const emailRow = otpRows.find(r => r.medium === 'email');
        if (phoneRow) mobileOtp = phoneRow.otp;
        if (emailRow) emailOtp = emailRow.otp;
      }
    } catch (e) {
      console.log('Failed to fetch OTPs from DB, using fallback values');
    }

    // Fill OTPs on UI
    const upgradeMobileField = page.getByRole('textbox', { name: 'Mobile T-Code' });
    if (await upgradeMobileField.isVisible({ timeout: 2000 })) {
      await upgradeMobileField.fill(mobileOtp);
    }
    const upgradeEmailField = page.getByRole('textbox', { name: 'Email T-Code' });
    if (await upgradeEmailField.isVisible({ timeout: 2000 })) {
      await upgradeEmailField.fill(emailOtp);
    }

    // Submit Upgrade
    await page.getByRole('button', { name: 'Upgrade' }).first().click();

    // Handle conditional Insufficient Wallet Balance popup
    const walletDialog = page.locator('.MuiDialog-root, [role="dialog"], .toast').filter({ hasText: /Insufficient Wallet Balance/i }).first();
    try {
      await walletDialog.waitFor({ state: 'visible', timeout: 5000 });
      const popupUpgradeBtn = walletDialog.getByRole('button', { name: /Upgrade/i }).first();
      if (await popupUpgradeBtn.isVisible()) {
        await popupUpgradeBtn.click();
      }
    } catch (e) {
      // Dialog did not appear, continue normally
    }

    // Verify success message
    await expect(page.getByText('Upgrade Successful').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-06: Busy Online - View History Screen Validation', async () => {
    test.skip(!validSerial, 'No valid serial found in DB for CP 749');

    const serialInput = page.locator('input[placeholder="Enter Serial Number"]');
    const viewHistoryBtn = page.locator('button').filter({ hasText: /View History/i });

    // Enter valid serial number and trigger events
    await serialInput.fill(validSerial);
    await serialInput.blur();
    // await page.waitForTimeout(1000);
    // Wait a moment for any backend validation to enable the button properly
    // await page.waitForTimeout(3000);

    // Click View History button, which likely opens a new tab
    const pagePromise = context.waitForEvent('page');
    await viewHistoryBtn.click();
    const historyPage = await pagePromise;

    await historyPage.waitForLoadState();

    // Verify it navigates to history page
    await expect(historyPage).toHaveURL(new RegExp(`.*partner/report/onlinehistory\\?product_id=21&subId=${validSerial}.*`, 'i'), { timeout: 10000 });

    // Verify "Subscription History" text is showing
    await expect(historyPage.getByText('Subscription History', { exact: false }).first()).toBeVisible({ timeout: 10000 });

    // Clean up the new tab
    await historyPage.close();
  });
});

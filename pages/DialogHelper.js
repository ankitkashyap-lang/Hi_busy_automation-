const { expect } = require('@playwright/test');

class DialogHelper {
  constructor(page) {
    this.page = page;
    this.dialog = page.getByRole('dialog');
  }

  /**
   * Click OK on any visible confirmation dialog
   */
  async clickOk() {
    if (await this.dialog.isVisible()) {
      await this.dialog.getByRole('button', { name: 'OK' }).click();
    }
  }

  /**
   * Click Cancel on any visible confirmation dialog
   */
  async clickCancel() {
    if (await this.dialog.isVisible()) {
      await this.dialog.getByRole('button', { name: 'Cancel' }).click();
    }
  }

  /**
   * Handle dialog only if it appears.
   *
   * If dialog appears:
   *   - Verify dialog text
   *   - Click requested button (OK / Cancel)
   *
   * If dialog does not appear:
   *   - Continue without failing
   *
   * @param {string} text - Text to identify the dialog
   * @param {'OK' | 'Cancel'} action - Button to click
   */
  async handleDialogIfVisible(text, action) {
    try {
      await this.dialog.waitFor({
        state: 'visible',
        timeout: 3000,
      });

      // Verify that it is the expected dialog
      await expect(this.dialog).toContainText(text);

      // Click requested button
      await this.dialog
        .getByRole('button', { name: action })
        .click();

    } catch (error) {
      // Dialog did not appear → continue
      if (error.name === 'TimeoutError') {
        return;
      }

      // Any other error should fail the test
      throw error;
    }
  }

  /**
   * Verify Insufficient Balance Error Message / Dialog Alert
   */
  async verifyInsufficientBalanceAlert() {
    const insufficientLocator = this.page.locator('text=/Insufficient balance|Insufficient Wallet Balance!/i')
      .or(this.dialog.filter({ hasText: /Insufficient/i }));
    
    await expect(insufficientLocator.first()).toBeVisible({ timeout: 5000 });
    const alertText = await insufficientLocator.first().innerText();
    expect(alertText).toMatch(/Insufficient balance|Insufficient Wallet Balance!/i);
    return alertText;
  }

  /**
   * Verify Credit Limit Fallback Popup details & dynamic breakdown math:
   * Header: Insufficient Wallet Balance!
   * Shortfall: <amount>
   * Credit Limit Available: <amount>
   * Post transaction, Credit Limit Available will become <amount>
   * Do you want to continue?
   */
  async verifyCreditLimitFallbackPopup() {
    const popupLocator = this.dialog.or(this.page.locator('div[role="dialog"], .MuiDialog-root')).filter({
      hasText: /Shortfall|Credit Limit Available/i
    });

    await expect(popupLocator.first()).toBeVisible({ timeout: 5000 });
    const popupText = await popupLocator.first().innerText();

    // Verify presence of mandatory elements
    expect(popupText).toContain('Insufficient Wallet Balance!');
    expect(popupText).toContain('Shortfall');
    expect(popupText).toContain('Credit Limit Available');
    expect(popupText).toContain('Post transaction, Credit Limit Available will become');
    expect(popupText).toContain('Do you want to continue?');

    // Extract dynamic numeric figures
    const shortfallMatch = popupText.match(/Shortfall:\s*([0-9,]+)/i);
    const availableMatch = popupText.match(/Credit Limit Available:\s*([0-9,]+)/i);
    const postMatch = popupText.match(/Post transaction,\s*Credit Limit Available will become\s*([0-9,]+)/i);

    const shortfall = shortfallMatch ? parseFloat(shortfallMatch[1].replace(/,/g, '')) : null;
    const creditLimitAvailable = availableMatch ? parseFloat(availableMatch[1].replace(/,/g, '')) : null;
    const postTransactionCreditLimit = postMatch ? parseFloat(postMatch[1].replace(/,/g, '')) : null;

    if (shortfall !== null && creditLimitAvailable !== null && postTransactionCreditLimit !== null) {
      const expectedPostTransaction = creditLimitAvailable - shortfall;
      expect(postTransactionCreditLimit).toBe(expectedPostTransaction);
    }

    return {
      popupText,
      shortfall,
      creditLimitAvailable,
      postTransactionCreditLimit
    };
  }
}

DialogHelper.DialogHelper = DialogHelper;
DialogHelper.dialogHelper = DialogHelper;

module.exports = DialogHelper;
module.exports.DialogHelper = DialogHelper;
module.exports.dialogHelper = DialogHelper;


const { expect } = require('@playwright/test');
const { isNextButtonExpected } = require('../utils/productConfig');
const DialogHelper = require('./DialogHelper');

/**
 * Handles: select product -> tenure/region/category -> plan -> model
 * -> quantity -> next/purchase.
 */
class PurchasePage {
  constructor(page) {
    this.page = page;
    this.dialogHelper = new DialogHelper(page);
  }

  async selectProduct(productName) {
    if (productName === 'Busy Magic') {
      const busyMagicBtn = this.page.getByTestId('partner-dashboard-tab-busy-magic')
        .or(this.page.getByRole('button', { name: /Busy Magic/i }))
        .or(this.page.getByRole('tab', { name: /Busy Magic/i }))
        .or(this.page.getByText('Busy Magic', { exact: true }));
      await expect(busyMagicBtn.first()).toBeVisible({ timeout: 15000 });
      await busyMagicBtn.first().click({ force: true });
      
      try {
        const newBtn = this.page.locator('button').filter({ hasText: 'New' }).first();
        if (await newBtn.isVisible({ timeout: 1000 })) {
          await newBtn.click({ timeout: 2000 }).catch(() => {});
        }
      } catch (e) {
        // Continue if New button not present or clickable
      }
    } else if (productName === 'Subscription') {
      const targetBtn = this.page.getByRole('button', { name: 'Subscription', exact: true })
        .or(this.page.locator('button').filter({ hasText: 'Subscription' }))
        .or(this.page.getByText('Subscription', { exact: true }));
      if (await targetBtn.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        await targetBtn.first().click();
        await this.page.waitForURL(/.*desktopSubscription.*/, { timeout: 5000 }).catch(() => {});
      }
    } else if (productName === 'Perpetual') {
      const targetBtn = this.page.getByRole('button', { name: 'Perpetual', exact: true })
        .or(this.page.locator('button').filter({ hasText: 'Perpetual' }))
        .or(this.page.getByText('Perpetual', { exact: true }));
      if (await targetBtn.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        await targetBtn.first().click();
        await this.page.waitForURL(/.*desktopPerpetual.*/, { timeout: 5000 }).catch(() => {});
      }
    } else {
      await this.page.keyboard.press('Escape').catch(() => {});
      const targetBtn = this.page.getByRole('button', { name: productName })
        .or(this.page.getByText(productName, { exact: true }))
        .or(this.page.locator(`text="${productName}"`));
      await targetBtn.first().click({ force: true });
    }
  }

  async selectPurchaseDetails(tenure, region, category) {
    const categoryValue = String(category)
      .replace(/\u00A0/g, ' ')
      .trim();
    const regionValue = String(region)
      .replace(/\u00A0/g, ' ')
      .trim();

    console.log(categoryValue === 'FOC');
    console.log(regionValue === 'India');

    const regionSelect = this.page.locator('label:has-text("Region") + div select');
    if (await regionSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await regionSelect.selectOption({ label: regionValue });
      await this.page.waitForTimeout(500);
    }

    const categorySelect = this.page.locator('label:has-text("Category") + div select');
    if (await categorySelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await categorySelect.selectOption({ label: categoryValue });
    }

    const tenureSelect = this.page.locator('label:has-text("Tenure") + div select');
    if (await tenureSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await tenureSelect.selectOption({ label: `${tenure} Days` });
    }
  }

  async choosePlanWithQnty(productName, plan, model, qty) {
    let input;

    if (productName === 'Busy Magic') {
      input = this.page.locator(
        `//div[normalize-space(text())="${plan}"]/ancestor::div[contains(@class,"MuiGrid-container")][1]//input`
      ).or(
        this.page.locator(`//div[contains(text(),"${plan}")]/following::input[1]`)
      ).or(
        this.page.locator(`//div[contains(text(),"${plan}")]/ancestor::div[contains(@class,"MuiGrid-root")][1]//input`)
      ).or(
        this.page.locator(`//input`)
      );
    } else {
      input = this.page.locator(
        `//div[text()="${plan}"]/ancestor::div[contains(@class,"MuiGrid-container")][1]//div[text()="${model}"]/following-sibling::input`
      );
    }

    const targetInput = input.first();
    await targetInput.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    if (await targetInput.isVisible().catch(() => false)) {
      await targetInput.click();
      await this.page.keyboard.press('Control+A');
      await this.page.keyboard.press('Backspace');
      await this.page.keyboard.type(String(qty), { delay: 50 });
      await this.page.keyboard.press('Tab');
      await this.page.waitForTimeout(500);
    }
  }

  async verifyAndClickNextOrPurchase(productName, planName, modelName, userCount) {
    const actionButton = this.page.getByRole('button', { name: /Next|Purchase/i })
      .or(this.page.locator('button').filter({ hasText: /Next|Purchase/i }))
      .or(this.page.getByText(/^Next$|^Purchase$/i));

    if (isNextButtonExpected(productName, planName, modelName)) {
      const nextButton = this.page.getByRole('button', { name: 'Next' }).or(this.page.getByText('Next', { exact: true }));

      if (await nextButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        await nextButton.first().click();

        const input = this.page.locator(
          `//div[normalize-space(text())="${planName}"]/ancestor::div[contains(@class,"MuiGrid-container")][1]//input`
        ).or(
          this.page.locator(`//div[contains(text(),"${planName}")]/following::input[1]`)
        ).or(
          this.page.locator(`//div[contains(text(),"Count")]/following-sibling::input`)
        ).or(
          this.page.locator(`//input`)
        );

        if (userCount && String(userCount).trim() !== '') {
          const targetInput = input.first();
          if (await targetInput.isVisible({ timeout: 2000 }).catch(() => false)) {
            await targetInput.fill(String(userCount));
          }
        }

        const purchaseBtn = this.page.getByRole('button', { name: 'Purchase' })
          .or(this.page.getByText('Purchase', { exact: true }))
          .or(actionButton);
        if (await purchaseBtn.first().isVisible({ timeout: 3000 }).catch(() => false)) {
          await purchaseBtn.first().click();
        }

        await this.dialogHelper.handleDialogIfVisible(
          'Do you want to continue with 1080 Days Tenure?',
          'OK'
        );
      } else {
        if (await actionButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
          await actionButton.first().click();
        }
      }
    } else {
      if (await actionButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        await actionButton.first().click();
      }
    }
  }
}

PurchasePage.PurchasePage = PurchasePage;
PurchasePage.purchasePage = PurchasePage;

module.exports = PurchasePage;
module.exports.PurchasePage = PurchasePage;
module.exports.purchasePage = PurchasePage;
module.exports.default = PurchasePage;

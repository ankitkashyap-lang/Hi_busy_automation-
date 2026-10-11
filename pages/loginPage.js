/**
 * Handles login for all 3 roles: Primary_user, Reseller, Busy_team.
 * TODO: replace the selectors below with the real ones from your app
 * (currently placeholders based on the sample flow you shared).
 */
class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('#usr')
      .or(page.getByRole('textbox', { name: 'Email ID' }))
      .or(page.locator('input[type="email"], input[name="email"], input[name="username"]'))
      .first();
    this.passwordInput = page.locator('#pwd')
      .or(page.getByRole('textbox', { name: 'Password' }))
      .or(page.locator('input[type="password"]'))
      .first();
    this.loginButton = page.getByRole('button', { name: 'Login' })
      .or(page.locator('button[type="submit"]'))
      .first();
  }

  async login(email, password) {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(1000);
    if (this.page.url().includes('/busy/') || this.page.url().includes('/partner/')) {
      const isLoginVisible = await this.emailInput.isVisible({ timeout: 1500 }).catch(() => false);
      if (!isLoginVisible) {
        return;
      }
    }
    await this.emailInput.waitFor({ state: 'visible', timeout: 30000 });
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password.toString());
    await this.loginButton.click();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Each role can land on a different dashboard / take a different path
   * after login. Add role-specific steps here as needed.
   */
  async goToDashboard(role) {
    switch (role) {
      case 'Primary_user':
        // TODO: add Primary_user specific dashboard navigation, if any
        break;

      case 'Reseller':
        // Reseller flow needs to open a partner first (like your sample)
        // TODO: search & select the partner name here if required
        break;

      case 'Busy_team':
        // TODO: add Busy_team specific dashboard navigation, if any
        await this.page.getByRole('button', { name: 'menu' }).click();
        await this.page.getByRole('link', { name: 'perm_identity Partner' }).click();
        break;

      default:
        throw new Error(`Unknown role: ${role}`);
    }
  }
}

module.exports = { LoginPage };
module.exports.LoginPage = LoginPage;
module.exports.default = LoginPage;

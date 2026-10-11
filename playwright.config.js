// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const globalConfig = require('./config/globalConfig.js');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  fullyParallel: false, // Run tests sequentially within a file to avoid rate limiting
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, // Add 1 retry locally for flakiness
  workers: process.env.WORKERS ? parseInt(process.env.WORKERS) : 10,
  timeout: 60 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  reporter: [
    ['html', { outputFolder: 'reports/html' }],
    ['json', { outputFile: 'reports/results.json' }],
    ['list'],
    ['allure-playwright', { resultsDir: process.env.ALLURE_RESULTS_DIR || 'allure-results' }],
  ],
  use: {
    baseURL: globalConfig.BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    navigationTimeout: 30 * 1000,
    actionTimeout: 10 * 1000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // webServer: {
  //   command: 'npm run start',
  //   url: globalConfig.BASE_URL,
  //   reuseExistingServer: !process.env.CI,
  // },

  globalSetup: require.resolve('./global-setup.js'),
});

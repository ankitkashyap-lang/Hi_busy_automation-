const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/loginPage');
const { ReportsPage } = require('../../pages/Reports/ReportsPage');
const { setupReportsSession } = require('../../utils/reportAuthHelper');
const { REPORTS, DOWNLOAD_PAGE } = require('../../test-data/reports/reportsConfig');
const globalConfig = require('../../config/globalConfig');

test.describe('Reports Module - Navigation & UI Validation Suite', () => {
  let context;
  let page;
  let reportsPage;

  test.beforeAll(async ({ browser }) => {
    // 1. Perform Login once and initialize shared session
    const session = await setupReportsSession(browser);
    context = session.context;
    page = session.page;
    reportsPage = session.reportsPage;
  });

  test.afterAll(async () => {
    if (page) await page.close().catch(() => {});
    if (context) await context.close().catch(() => {});
  });

  test.beforeEach(async () => {
    if (context) {
      const pages = context.pages();
      for (const p of pages) {
        if (p !== page && !p.isClosed()) {
          await p.close().catch(() => {});
        }
      }
    }
    if (!page || page.isClosed()) {
      page = await context.newPage();
      const loginPage = new LoginPage(page);
      await loginPage.login(globalConfig.ADMIN_EMAIL, globalConfig.ADMIN_PASSWORD);
      await page.waitForLoadState('domcontentloaded');
      reportsPage = new ReportsPage(page);
    } else {
      await page.bringToFront().catch(() => {});
    }
  });

  test('NAV-01: Reports Menu Accessibility & Hierarchy in Side Navigation', async () => {
    // Open Side Navigation Drawer & expand Reports
    await reportsPage.openReportsMenu();

    // Verify key reports are visible in menu
    const keyReports = [
      'AC Stock',
      'App Penetration',
      'Blocked Licenses',
      'BLS Expiry',
      'Busy Online Report',
      'Customer List',
      'List of Clusters',
      'RDP License Report',
      'Reseller',
      'Subscription Status',
      'Transfer License',
      'Unused Serial No',
      'Version 17 & 18 Report'
    ];

    for (const repName of keyReports) {
      const link = reportsPage.locators.getReportLink(repName);
      await expect(link, `Expected link for "${repName}" to be visible in Reports menu`).toBeVisible({ timeout: 10000 });
    }
  });

  test('NAV-02: Central Downloads Queue Page Structure & UI Elements', async () => {
    // Navigate to /busy/report/download
    await reportsPage.openDownloadsPage();

    // Verify heading
    await expect(page.locator('h1, h2, h3, .page-title, [class*="heading"]').first()).toContainText(/Downloads/i);

    // Verify Refresh button
    await expect(reportsPage.locators.downloadPageRefreshButton).toBeVisible();

    // Verify Data Table and expected column headers
    await expect(reportsPage.locators.dataTable.or(page.locator('div[role="row"]').first())).toBeVisible({ timeout: 15000 });

    const tableText = await page.locator('div[role="row"], tr').first().innerText();
    expect(tableText).toMatch(/Job Id|Report|Status|Download/i);
  });

  // Data-Driven UI Validation across Key Reports
  const sampleReports = [
    { name: 'AC Stock', url: '/busy/report/acStock', heading: /AC Stock/i, hasSubmit: true },
    { name: 'App Penetration', url: '/busy/report/penetrationLevel', heading: /App Penetration/i, hasSubmit: true },
    { name: 'Blocked Licenses', url: '/busy/report/blockedlicence', heading: /Blocked Licenses/i, hasSubmit: true },
    { name: 'BLS Expiry', url: '/busy/report/blsexpiry', heading: /BLS Expiry/i, hasSubmit: true },
    { name: 'Customer List', url: '/busy/report/customerlist', heading: /Customer List/i, hasSubmit: true },
    { name: 'List of Clusters', url: '/busy/report/listofclusters', heading: /List of Clusters/i, hasSubmit: false },
    { name: 'Subscription Status', url: '/busy/report/subscriptionStatus', heading: /Subscription Status/i, hasSubmit: true },
    { name: 'Reseller', url: '/busy/report/reportresellers', heading: /Reseller/i, hasSubmit: true },
    { name: 'Unused Serial No', url: '/busy/report/unusedserialno', heading: /Unused Serial No/i, hasSubmit: true }
  ];

  for (const rep of sampleReports) {
    test(`UI-REP: Validate Route and Form Controls for "${rep.name}"`, async () => {
      await reportsPage.navigateToReport(rep.name, rep.url);

      // Verify Heading
      const heading = page.locator('h1, h2, h3, h4, h5, .page-title, [class*="heading"]').first();
      await expect(heading).toBeVisible({ timeout: 15000 });
      await expect(heading).toContainText(rep.heading);

      // Verify Submit / Action buttons
      if (rep.hasSubmit) {
        await expect(reportsPage.locators.submitButton.or(reportsPage.locators.searchButton)).toBeVisible({ timeout: 10000 });
      }

      // Check URL
      expect(page.url()).toContain(rep.url);
    });
  }

  test('NAV-03: Page Refresh and Back Navigation on Reports', async () => {
    // Navigate to AC Stock
    await reportsPage.navigateToReport('AC Stock', '/busy/report/acStock');
    await expect(page.locator('h1, h2, h3, .page-title').first()).toContainText(/AC Stock/i);

    // Refresh page
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1, h2, h3, .page-title').first()).toContainText(/AC Stock/i);

    // Navigate to BLS Expiry
    await reportsPage.navigateToReport('BLS Expiry', '/busy/report/blsexpiry');
    await expect(page.locator('h1, h2, h3, .page-title').first()).toContainText(/BLS Expiry/i);

    // Go Back
    await page.goBack({ waitUntil: 'domcontentloaded' });
    expect(page.url()).toContain('/busy/report/acStock');
  });
});

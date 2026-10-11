const { test, expect } = require('@playwright/test');
const PartnerPage = require('../../pages/Partner/PartnerPage.js');
const PartnerFlow = require('../../flows/PartnerFlow.js');
const PartnerValidation = require('../../validations/PartnerValidation.js');
const LoginFlow = require('../../flows/LoginFlow.js');
const TestDataProvider = require('../../providers/TestDataProvider.js');
const Logger = require('../../utils/logger.js');
const globalConfig = require('../../config/globalConfig.js');
const urls = require('../../config/urls.js');

const logger = Logger.getInstance();

test.describe.configure({ mode: 'serial' });

/**
 * Partner Module Tests
 * Covers: Listing, Search, Filters, Create Wizard, Card Attributes
 */
test.describe('Partner Module Tests @partner', () => {
  let context;
  let page;
  let loginFlow;
  let partnerFlow;
  let partnerPage;
  let partnerValidation;

  test.beforeAll(async ({ browser }) => {
    logger.info('================================================================================');
    logger.info('PARTNER TEST SUITE - INITIALIZATION');
    logger.info('================================================================================');
    try {
      logger.info('Getting executable partner test data (Execute = Yes)');
      const data = await TestDataProvider.getExecutablePartnerData();
      logger.info(`✓ Loaded ${data.length} executable partner test cases from Excel`);
    } catch (e) {
      logger.error(`Partner data load warning: ${e.message}`);
    }

    context = await browser.newContext();
    page = await context.newPage();
    loginFlow = new LoginFlow(page);
    partnerFlow = new PartnerFlow(page);
    partnerPage = new PartnerPage(page);
    partnerValidation = new PartnerValidation(page);

    logger.info('Performing one-time Admin Login for Partner Test Suite');
    const adminUser = {
      email: globalConfig.BUSY_TEAM_EMAIL,
      password: globalConfig.ADMIN_PASSWORD,
      role: 'admin',
    };
    await loginFlow.login(adminUser);
    await partnerPage.navigateToPartnerListing();
  });

  test.beforeEach(async () => {
    logger.separator();
    logger.info('Partner Test Started');
    logger.info(`Browser: ${globalConfig.BROWSER}`);
    logger.info(`Base URL: ${urls.BASE_URL}`);

    // Navigate to Partner Listing to reset view
    await partnerPage.navigateToPartnerListing();
  });

  test.afterEach(async ({}, testInfo) => {
    logger.info(`Partner Test Status: ${testInfo.status}`);
    if (testInfo.status === 'failed') {
      logger.error(`Test ${testInfo.title} failed - capturing failure state`);
    }
    logger.info('Partner Test Ended');
    logger.separator();
  });

  test.afterAll(async () => {
    if (page) await page.close().catch(() => {});
    if (context) await context.close().catch(() => {});
  });

  // ============================================================
  // SMOKE & SANITY TESTS (P0 Priority)
  // ============================================================

  test('PARTNER-TC-001: Verify Partner Listing Page Loads Successfully @smoke @sanity', async () => {
    // Verify all core UI elements are visible regardless of card data
    await expect(page.locator(partnerPage.pageHeader)).toBeVisible({ timeout: 10000 });
    await expect(page.locator(partnerPage.searchInput)).toBeVisible({ timeout: 5000 });
    await expect(page.locator(partnerPage.createPartnerButton)).toBeVisible({ timeout: 5000 });
    await expect(page.locator(partnerPage.excelDownloadButton).first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator(partnerPage.searchOptionsToggle)).toBeVisible({ timeout: 5000 });
    logger.info('✓ Partner listing page loaded with all core UI elements');
  });

  test('PARTNER-TC-002: Verify Partner Listing Page UI Grid Structure is Present @smoke @sanity', async () => {
    // Check core page structure
    await expect(page.locator(partnerPage.searchInput)).toBeVisible({ timeout: 5000 });
    await expect(page.locator(partnerPage.searchOptionsToggle)).toBeVisible({ timeout: 5000 });
    await expect(page.locator(partnerPage.createPartnerButton)).toBeVisible({ timeout: 5000 });

    const cardsLoaded = await partnerPage.hasCardsLoaded();
    if (cardsLoaded) {
      const count = await page.locator(partnerPage.partnerCards).count();
      expect(count).toBeGreaterThan(0);
      logger.info(`✓ Partner cards grid contains ${count} visible cards`);
    } else {
      logger.info('ℹ No partner card data (may need elevated permissions) — UI shell verified');
    }
  });

  test('PARTNER-TC-003: Quick Search Input Accepts and Clears Input @smoke @sanity', async () => {
    const query = 'Inside Sales (Delhi Office)';

    // Fill search
    await page.locator(partnerPage.searchInput).fill(query);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);

    const inputValue = await page.locator(partnerPage.searchInput).inputValue();
    expect(inputValue).toBe(query);
    logger.info(`✓ Search input holds value: "${inputValue}"`);

    const cardsLoaded = await partnerPage.hasCardsLoaded();
    if (cardsLoaded) {
      const cardLocator = page.locator(partnerPage.cardNameValues).filter({ hasText: query }).first();
      await expect(cardLocator).toBeVisible({ timeout: 5000 });
      logger.info(`✓ Verified partner card found for: "${query}"`);
    } else {
      logger.info('ℹ No partner cards loaded — search action verified only');
    }
  });

  test('PARTNER-TC-004: Open and Close Create Partner Wizard Drawer @smoke @sanity', async () => {
    // Open wizard
    await partnerPage.openCreatePartnerDrawer();
    await expect(page.locator(partnerPage.createCountryInput)).toBeVisible({ timeout: 5000 });
    logger.info('✓ Create Partner wizard drawer opened');

    // Verify Step 1 fields
    await expect(page.locator(partnerPage.createTimeZoneInput)).toBeVisible({ timeout: 3000 });
    await expect(page.locator(partnerPage.createPartnerTierInput)).toBeVisible({ timeout: 3000 });

    // Close wizard
    await partnerPage.closeCreatePartnerDrawer();
    await expect(page.locator(partnerPage.createCountryInput)).toBeHidden({ timeout: 5000 });
    logger.info('✓ Create Partner wizard drawer closed');

    // Verify back on listing
    await expect(page.locator(partnerPage.pageHeader)).toBeVisible({ timeout: 5000 });
    logger.info('✓ Partner listing page is visible after closing wizard');
  });

  // ============================================================
  // REGRESSION TESTS: ADVANCED SEARCH & FILTERS (P1 Priority)
  // ============================================================

  test('PARTNER-TC-005: Filter Panel Opens and Partner ID Field is Functional @regression', async () => {
    const partnerId = 'INDDEL3MO-01';
    await partnerPage.openSearchOptions();
    await expect(page.locator(partnerPage.filterPartnerIdInput)).toBeVisible({ timeout: 5000 });
    await page.locator(partnerPage.filterPartnerIdInput).fill(partnerId);
    const val = await page.locator(partnerPage.filterPartnerIdInput).inputValue();
    expect(val).toBe(partnerId);
    await page.locator(partnerPage.filterSearchButton).click();
    await page.waitForTimeout(1500);
    logger.info(`✓ Filter by Partner ID "${partnerId}" submitted successfully`);

    const cardsLoaded = await partnerPage.hasCardsLoaded();
    if (cardsLoaded) {
      const matchingCard = page.locator(partnerPage.cardDealerIdPinValues).filter({ hasText: partnerId });
      await expect(matchingCard.first()).toBeVisible({ timeout: 5000 });
      logger.info(`✓ Matching card found for Partner ID: ${partnerId}`);
    } else {
      logger.info('ℹ No cards returned — filter interaction verified');
    }
  });

  test('PARTNER-TC-006: Filter Panel Partner PIN Field is Functional @regression', async () => {
    const partnerPin = '110280';
    await partnerPage.openSearchOptions();
    await expect(page.locator(partnerPage.filterPartnerPinInput)).toBeVisible({ timeout: 5000 });
    await page.locator(partnerPage.filterPartnerPinInput).fill(partnerPin);
    const val = await page.locator(partnerPage.filterPartnerPinInput).inputValue();
    expect(val).toBe(partnerPin);
    await page.locator(partnerPage.filterSearchButton).click();
    await page.waitForTimeout(1500);
    logger.info(`✓ Filter by Partner PIN "${partnerPin}" submitted successfully`);
  });

  test('PARTNER-TC-007: Filter Panel Has All Expected Fields @regression', async () => {
    await partnerPage.openSearchOptions();
    await expect(page.locator(partnerPage.filterNameInput)).toBeVisible({ timeout: 5000 });
    await expect(page.locator(partnerPage.filterPartnerIdInput)).toBeVisible({ timeout: 5000 });
    await expect(page.locator(partnerPage.filterPartnerPinInput)).toBeVisible({ timeout: 5000 });
    await expect(page.locator(partnerPage.filterMobileInput)).toBeVisible({ timeout: 5000 });
    await expect(page.locator(partnerPage.filterEmailInput)).toBeVisible({ timeout: 5000 });
    await expect(page.locator(partnerPage.filterSearchButton)).toBeVisible({ timeout: 5000 });
    await expect(page.locator(partnerPage.filterResetButton)).toBeVisible({ timeout: 5000 });
    await partnerPage.closeSearchOptions().catch(() => {});
    logger.info('✓ All filter panel fields are visible');
  });

  test('PARTNER-TC-008: Filter Panel Reset Button Clears Input Fields @regression', async () => {
    await partnerPage.openSearchOptions();
    await page.locator(partnerPage.filterPartnerIdInput).fill('TEST123');
    await page.locator(partnerPage.filterNameInput).fill('TestPartner');
    await page.locator(partnerPage.filterResetButton).click();
    await page.waitForTimeout(500);

    // Reset button closes filter panel. Re-open panel to verify cleared fields.
    await partnerPage.openSearchOptions();
    const partnerId = await page.locator(partnerPage.filterPartnerIdInput).inputValue();
    const partnerName = await page.locator(partnerPage.filterNameInput).inputValue();
    expect(partnerId).toBe('');
    expect(partnerName).toBe('');
    await partnerPage.closeSearchOptions().catch(() => {});
    logger.info('✓ Reset button cleared all filter input fields');
  });

  test('PARTNER-TC-009: Filter Panel Toggles Open and Closed @regression', async () => {
    // Open
    await partnerPage.openSearchOptions();
    await expect(page.locator(partnerPage.filterNameInput)).toBeVisible({ timeout: 5000 });
    logger.info('✓ Filter panel opened');

    // Close
    await partnerPage.closeSearchOptions();
    await expect(page.locator(partnerPage.filterNameInput)).toBeHidden({ timeout: 5000 });
    logger.info('✓ Filter panel closed');
  });

  test('PARTNER-TC-010: Search Bar Fill and Clear Works @regression', async () => {
    await page.locator(partnerPage.searchInput).fill('Test Partner');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);
    expect(await page.locator(partnerPage.searchInput).inputValue()).toBe('Test Partner');

    await page.locator(partnerPage.searchInput).clear();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);
    expect(await page.locator(partnerPage.searchInput).inputValue()).toBe('');
    logger.info('✓ Search bar fill and clear works correctly');
  });

  // ============================================================
  // REGRESSION TESTS: CARD ATTRIBUTES & UI DETAILS (P1 Priority)
  // ============================================================

  test('PARTNER-TC-011: Verify Partner Card Attributes When Data Loads @regression', async () => {
    const cardsLoaded = await partnerPage.hasCardsLoaded();
    if (!cardsLoaded) {
      logger.info('ℹ No partner cards loaded (API permission required) — verifying page shell instead');
      await expect(page.locator(partnerPage.searchInput)).toBeVisible();
      await expect(page.locator(partnerPage.createPartnerButton)).toBeVisible();
      return;
    }

    const firstCard = page.locator(partnerPage.partnerCards).first();
    await expect(firstCard).toBeVisible({ timeout: 5000 });

    await expect(firstCard.locator(partnerPage.cardNameValues)).toBeVisible();
    await expect(firstCard.locator(partnerPage.cardDealerIdPinValues)).toBeVisible();
    await expect(firstCard.locator(partnerPage.cardCountryTiles)).toBeVisible();
    await expect(firstCard.locator(partnerPage.cardMobileEmailValues)).toBeVisible();
    await expect(firstCard.locator(partnerPage.cardTierValues)).toBeVisible();
    await expect(firstCard.locator(partnerPage.accessAccountButtons)).toBeVisible();
    await expect(firstCard.locator(partnerPage.moreInfoButtons)).toBeVisible();
    logger.info('✓ All required attributes verified on partner card');
  });

  // ============================================================
  // REGRESSION TESTS: CREATE PARTNER WIZARD (P1/P2 Priority)
  // ============================================================

  test('PARTNER-TC-012: Create Partner Wizard Step 1 - All Fields Are Visible @regression', async () => {
    await partnerPage.openCreatePartnerDrawer();
    await expect(page.locator(partnerPage.createCountryInput)).toBeVisible({ timeout: 5000 });
    await expect(page.locator(partnerPage.createTimeZoneInput)).toBeVisible({ timeout: 3000 });
    await expect(page.locator(partnerPage.createPartnerTypeBtn)).toBeVisible({ timeout: 3000 });
    await expect(page.locator(partnerPage.createResellerTypeBtn)).toBeVisible({ timeout: 3000 });
    await expect(page.locator(partnerPage.createPartnerTierInput)).toBeVisible({ timeout: 3000 });
    // Always choose Channel Partner type (not reseller)
    await page.locator(partnerPage.createPartnerTypeBtn).click();
    logger.info('✓ Create Partner wizard Step 1 is fully visible and Channel Partner selected');
    await partnerPage.closeCreatePartnerDrawer();
  });

  test('PARTNER-TC-013: Create Partner Wizard Opens and Closes Correctly @regression', async () => {
    await partnerPage.openCreatePartnerDrawer();
    await expect(page.locator(partnerPage.createCountryInput)).toBeVisible({ timeout: 5000 });
    logger.info('✓ Wizard opened');

    await partnerPage.closeCreatePartnerDrawer();
    await expect(page.locator(partnerPage.createCountryInput)).toBeHidden({ timeout: 5000 });
    logger.info('✓ Wizard closed');
  });

  test('PARTNER-TC-014: Create Partner Wizard - Partner and Reseller Type Toggle Works @regression', async () => {
    await partnerPage.openCreatePartnerDrawer();
    await expect(page.locator(partnerPage.createCountryInput)).toBeVisible({ timeout: 5000 });

    // Verify toggle but always choose Channel Partner not reseller
    await page.locator(partnerPage.createResellerTypeBtn).click();
    await page.waitForTimeout(300);
    await page.locator(partnerPage.createPartnerTypeBtn).click();
    await page.waitForTimeout(300);

    // Still on Step 1 — Channel Partner chosen
    await expect(page.locator(partnerPage.createCountryInput)).toBeVisible({ timeout: 3000 });
    logger.info('✓ Channel Partner type selected in wizard Step 1');
    await partnerPage.closeCreatePartnerDrawer();
  });

  // ============================================================
  // REGRESSION TESTS: ACCESS ACCOUNT (P1 Priority)
  // ============================================================

  test('PARTNER-TC-016: Access Account Button Only Clickable When Cards Loaded @regression', async () => {
    const cardsLoaded = await partnerPage.hasCardsLoaded();
    if (!cardsLoaded) {
      logger.info('ℹ Access Account test skipped — no partner cards loaded (API permission required)');
      await expect(page.locator(partnerPage.createPartnerButton)).toBeVisible();
      return;
    }
    // Search and choose Channel Partner not reseller
    await partnerPage.searchPartner('Inside Sales (Delhi Office)');
    await page.waitForTimeout(1500);
    await partnerPage.accessPartnerAccount(0);
    await partnerValidation.verifyAccessAccountNavigation();

    // Reset back to admin session so subsequent tests are not impersonating partner
    await context.clearCookies();
    const adminUser = {
      email: globalConfig.BUSY_TEAM_EMAIL,
      password: globalConfig.ADMIN_PASSWORD,
      role: 'admin',
    };
    await loginFlow.login(adminUser);
    await partnerPage.navigateToPartnerListing();
  });

  // ============================================================
  // DATA-DRIVEN TESTS FROM EXCEL (PartnerData.xlsx)
  // ============================================================

  test.describe('Partner - Data-Driven Tests @partner @data-driven', () => {
    test('Execute all Partner test data rows with Execute=Yes', async () => {
      test.setTimeout(90000);
      const execData = await TestDataProvider.getExecutablePartnerData();
      expect(execData.length).toBeGreaterThan(0);
      logger.info(`Running ${execData.length} data-driven partner test cases`);

      const cardsAvailable = await partnerPage.hasCardsLoaded();

      for (const row of execData) {
        logger.info(`Running Data-Driven TC: ${row.TC_ID} - ${row.Scenario} (Module: ${row.Module})`);

        if (row.Module === 'Listing') {
          await expect(page.locator(partnerPage.searchInput)).toBeVisible({ timeout: 5000 });
          if (row.TC_ID === 'PARTNER-TC-002' && cardsAvailable) {
            const count = await page.locator(partnerPage.partnerCards).count();
            expect(count).toBeGreaterThan(0);
          }
        } else if (row.Module === 'Search' && row.SearchQuery) {
          await page.locator(partnerPage.searchInput).fill(row.SearchQuery);
          await page.keyboard.press('Enter');
          await page.waitForTimeout(1000);
          const inputVal = await page.locator(partnerPage.searchInput).inputValue();
          expect(inputVal).toBe(row.SearchQuery);
          if (cardsAvailable) {
            await partnerValidation.verifyPartnerCardByName(row.SearchQuery);
          }
          await page.locator(partnerPage.searchInput).clear();
          await page.keyboard.press('Enter');
          await page.waitForTimeout(500);
        } else if (row.Module === 'Filter') {
          await partnerPage.openSearchOptions();

          if (row.PartnerId) {
            await page.locator(partnerPage.filterPartnerIdInput).fill(row.PartnerId);
          }
          if (row.PartnerPin) {
            await page.locator(partnerPage.filterPartnerPinInput).fill(row.PartnerPin);
          }
          if (row.Mobile) {
            await page.locator(partnerPage.filterMobileInput).fill(row.Mobile);
          }
          if (row.Email) {
            await page.locator(partnerPage.filterEmailInput).fill(row.Email);
          }
          if (row.City) {
            await page.locator(partnerPage.filterCityInput).fill(row.City);
          }
          if (row.State) {
            await page.locator(partnerPage.filterStateInput).fill(row.State);
          }
          if (row.PartnerType && row.PartnerType !== 'All') {
            try {
              await page.locator(partnerPage.filterPartnerTypeSelect).selectOption(row.PartnerType);
            } catch (e) {
              logger.info(`ℹ Skipping PartnerType select option: ${row.PartnerType}`);
            }
          }
          if (row.Status && row.Status !== 'All') {
            try {
              await page.locator(partnerPage.filterStatusSelect).selectOption(row.Status);
            } catch (e) {
              logger.info(`ℹ Skipping Status select option: ${row.Status}`);
            }
          }

          await page.locator(partnerPage.filterSearchButton).click();
          await page.waitForTimeout(800);

          if (cardsAvailable && row.PartnerName) {
            await partnerValidation.verifyPartnerCardByName(row.PartnerName);
          }

          // Search closes the filter panel automatically. Re-open to click Reset.
          await partnerPage.openSearchOptions();
          await page.locator(partnerPage.filterResetButton).click();
          await page.waitForTimeout(400);
          await partnerPage.closeSearchOptions();
        } else if (row.Module === 'Create') {
          await page.locator('.MuiBackdrop-root').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
          await page.locator(partnerPage.createPartnerButton).click();
          await expect(page.locator(partnerPage.createCountryInput)).toBeVisible({ timeout: 5000 });

          if (row.Tier) {
            await expect(page.locator(partnerPage.createPartnerTierInput)).toBeVisible();
          }

          await page.locator(partnerPage.createDrawerCloseBtn).first().click();
          await expect(page.locator(partnerPage.createCountryInput)).toBeHidden({ timeout: 5000 });
          await page.locator('.MuiBackdrop-root').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
          await page.waitForTimeout(500);
        } else if (row.Module === 'Cards') {
          if (cardsAvailable) {
            const firstCard = page.locator(partnerPage.partnerCards).first();
            await expect(firstCard).toBeVisible({ timeout: 5000 });
          } else {
            await expect(page.locator(partnerPage.searchInput)).toBeVisible();
          }
        } else if (row.Module === 'Access') {
          if (cardsAvailable) {
            // Search and choose Channel Partner not reseller
            const cpSearch = row.SearchQuery || row.PartnerName || 'Inside Sales (Delhi Office)';
            await partnerPage.searchPartner(cpSearch);
            await page.waitForTimeout(1500);
            await partnerPage.accessPartnerAccount(0);
            await partnerValidation.verifyAccessAccountNavigation();
            await context.clearCookies();
            const adminUser = {
              email: globalConfig.BUSY_TEAM_EMAIL,
              password: globalConfig.ADMIN_PASSWORD,
              role: 'admin',
            };
            await loginFlow.login(adminUser);
            await partnerPage.navigateToPartnerListing();
          } else {
            await expect(page.locator(partnerPage.createPartnerButton)).toBeVisible();
          }
        }

        logger.info(`✓ Completed Data-Driven TC: ${row.TC_ID}`);
      }

      await partnerPage.closeSearchOptions().catch(() => {});
    });
  });
});

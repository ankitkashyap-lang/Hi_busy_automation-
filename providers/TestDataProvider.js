const ExcelReader = require('../utils/excelReader.js');
const Logger = require('../utils/logger.js');

/**
 * TestDataProvider - Provides test data from Excel files
 * Manages all test data reading and filtering
 */
class TestDataProvider {
  constructor() {
    this.logger = Logger.getInstance();
    this.excelReader = new ExcelReader();
    this.loginDataCache = null;
  }

  /**
   * Read all login test data from Excel (with caching)
   */
  async getLoginData(filePath = './test-data/LoginData.xlsx') {
    if (this.loginDataCache && this.loginDataCache[filePath]) {
      return this.loginDataCache[filePath];
    }

    this.logger.info(`Reading login test data from Excel: ${filePath}`);

    try {
      const loginData = await this.excelReader.readLoginData(filePath);
      if (!this.loginDataCache) {
        this.loginDataCache = {};
      }
      this.loginDataCache[filePath] = loginData;
      this.logger.info(`✓ Loaded ${loginData.length} login test cases from Excel`);
      return loginData;
    } catch (error) {
      this.logger.error(`Failed to read login data from Excel: ${error.message}`);
      throw error;
    }
  }

  /**
   * Synchronously read login data from Excel using xlsx as fallback/sync reader
   */
  getLoginDataSync(filePath = './test-data/LoginData.xlsx') {
    if (this.loginDataCache && this.loginDataCache[filePath]) {
      return this.loginDataCache[filePath];
    }

    try {
      const XLSX = require('xlsx');
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames.find((name) => name.toLowerCase() === 'login') || workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      if (!this.loginDataCache) {
        this.loginDataCache = {};
      }
      this.loginDataCache[filePath] = data;
      return data;
    } catch (error) {
      this.logger.warn(`Sync Excel read fallback failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Clear cache to force reload from Excel file
   */
  clearCache() {
    this.loginDataCache = null;
    this.logger.info('TestDataProvider cache cleared');
  }

  /**
   * Get login data filtered by role from Excel
   */
  async getLoginDataByRole(role, filePath = './test-data/LoginData.xlsx') {
    this.logger.info(`Filtering login data by role: ${role}`);

    try {
      const allData = await this.getLoginData(filePath);
      const filtered = allData.filter((row) => String(row.Role).toLowerCase() === String(role).toLowerCase());
      this.logger.info(`✓ Found ${filtered.length} test cases for role: ${role}`);
      return filtered;
    } catch (error) {
      this.logger.error(`Failed to filter data by role: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get login data filtered by priority from Excel
   */
  async getLoginDataByPriority(priority, filePath = './test-data/LoginData.xlsx') {
    this.logger.info(`Filtering login data by priority: ${priority}`);

    try {
      const allData = await this.getLoginData(filePath);
      const filtered = allData.filter((row) => String(row.Priority).toUpperCase() === String(priority).toUpperCase());
      this.logger.info(`✓ Found ${filtered.length} test cases with priority: ${priority}`);
      return filtered;
    } catch (error) {
      this.logger.error(`Failed to filter data by priority: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get login data by test case ID from Excel
   */
  async getLoginDataByTestCaseId(tcId, filePath = './test-data/LoginData.xlsx') {
    this.logger.info(`Retrieving test data for TC ID: ${tcId}`);

    try {
      const allData = await this.getLoginData(filePath);
      const testCase = allData.find((row) => String(row.TC_ID).trim().toUpperCase() === String(tcId).trim().toUpperCase());

      if (!testCase) {
        this.logger.warn(`Test case not found in Excel: ${tcId}`);
        return null;
      }

      this.logger.info(`✓ Found test case in Excel: ${tcId} (Execute: ${testCase.Execute})`);
      return testCase;
    } catch (error) {
      this.logger.error(`Failed to get test case by ID: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get login data for smoke tests (P0 priority) from Excel
   */
  async getSmokeTestData(filePath = './test-data/LoginData.xlsx') {
    this.logger.info('Getting smoke test data (P0 priority)');

    try {
      return await this.getLoginDataByPriority('P0', filePath);
    } catch (error) {
      this.logger.error(`Failed to get smoke test data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get login data for regression tests from Excel
   */
  async getRegressionTestData(filePath = './test-data/LoginData.xlsx') {
    this.logger.info('Getting regression test data from Excel');

    try {
      const allData = await this.getLoginData(filePath);
      this.logger.info(`✓ Returning all ${allData.length} test cases from Excel for regression`);
      return allData;
    } catch (error) {
      this.logger.error(`Failed to get regression test data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get only executable test data (Execute = Yes) from Excel
   */
  async getExecutableTestData(filePath = './test-data/LoginData.xlsx') {
    this.logger.info('Getting executable test data (Execute = Yes) from Excel');

    try {
      const allData = await this.getLoginData(filePath);
      const executable = allData.filter((row) => {
        const exec = String(row.Execute || '').trim().toLowerCase();
        return exec === 'yes' || exec === 'true' || row.Execute === true;
      });
      this.logger.info(`✓ Found ${executable.length} executable test cases in Excel`);
      return executable;
    } catch (error) {
      this.logger.error(`Failed to get executable test data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get positive test cases from Excel
   */
  async getPositiveTestData(filePath = './test-data/LoginData.xlsx') {
    this.logger.info('Getting positive test data from Excel');

    try {
      const allData = await this.getLoginData(filePath);
      const positive = allData.filter((row) => String(row.ExpectedResult || '').trim().toLowerCase().includes('dashboard'));
      this.logger.info(`✓ Found ${positive.length} positive test cases in Excel`);
      return positive;
    } catch (error) {
      this.logger.error(`Failed to get positive test data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get negative test cases from Excel
   */
  async getNegativeTestData(filePath = './test-data/LoginData.xlsx') {
    this.logger.info('Getting negative test data from Excel');

    try {
      const allData = await this.getLoginData(filePath);
      const negative = allData.filter((row) => !String(row.ExpectedResult || '').trim().toLowerCase().includes('dashboard'));
      this.logger.info(`✓ Found ${negative.length} negative test cases in Excel`);
      return negative;
    } catch (error) {
      this.logger.error(`Failed to get negative test data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get test data by scenario name from Excel
   */
  async getLoginDataByScenario(scenario, filePath = './test-data/LoginData.xlsx') {
    this.logger.info(`Filtering login data by scenario: ${scenario}`);

    try {
      const allData = await this.getLoginData(filePath);
      const filtered = allData.filter((row) => String(row.Scenario || '').toLowerCase().includes(scenario.toLowerCase()));
      this.logger.info(`✓ Found ${filtered.length} test cases for scenario: ${scenario}`);
      return filtered;
    } catch (error) {
      this.logger.error(`Failed to filter data by scenario: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get Partner test data from Excel
   */
  async getPartnerData(filePath = './test-data/PartnerData.xlsx') {
    this.logger.info(`Reading partner test data from: ${filePath}`);

    try {
      const partnerData = await this.excelReader.readPartnerData(filePath);
      this.logger.info(`✓ Read ${partnerData.length} partner test cases`);
      return partnerData;
    } catch (error) {
      this.logger.error(`Failed to read partner data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get Partner test data by TC ID
   */
  async getPartnerDataByTestCaseId(tcId, filePath = './test-data/PartnerData.xlsx') {
    this.logger.info(`Retrieving partner test data for TC ID: ${tcId}`);

    try {
      const allData = await this.getPartnerData(filePath);
      const testCase = allData.find((row) => String(row.TC_ID).trim().toUpperCase() === String(tcId).trim().toUpperCase());
      return testCase || null;
    } catch (error) {
      this.logger.error(`Failed to get partner test case by ID: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get executable Partner test cases (Execute = Yes)
   */
  async getExecutablePartnerData(filePath = './test-data/PartnerData.xlsx') {
    this.logger.info('Getting executable partner test data (Execute = Yes)');

    try {
      const allData = await this.getPartnerData(filePath);
      return allData.filter((row) => {
        const exec = String(row.Execute || '').trim().toLowerCase();
        return exec === 'yes' || exec === 'true' || row.Execute === true;
      });
    } catch (error) {
      this.logger.error(`Failed to get executable partner data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get subscription test data
   */
  async getSubscriptionData(filePath = './test-data/SubscriptionData.xlsx') {
    this.logger.info(`Reading subscription test data from: ${filePath}`);

    try {
      const subscriptionData = await this.excelReader.readSubscriptionData(filePath);
      this.logger.info(`✓ Read ${subscriptionData.length} subscription test cases`);
      return subscriptionData;
    } catch (error) {
      this.logger.error(`Failed to read subscription data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get customer test data
   */
  async getCustomerData(filePath = './test-data/CustomerData.xlsx') {
    this.logger.info(`Reading customer test data from: ${filePath}`);

    try {
      const customerData = await this.excelReader.readCustomerData(filePath);
      this.logger.info(`✓ Read ${customerData.length} customer test cases`);
      return customerData;
    } catch (error) {
      this.logger.error(`Failed to read customer data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get test users directly from Excel file
   */
  getTestUsers(filePath = './test-data/LoginData.xlsx') {
    this.logger.info(`Reading test users from Excel: ${filePath}`);

    try {
      const allData = (this.loginDataCache && this.loginDataCache[filePath]) || this.getLoginDataSync(filePath);
      const positiveRows = allData.filter((row) => {
        const result = String(row.ExpectedResult || '').trim().toLowerCase();
        return result.includes('dashboard');
      });

      const users = [];
      const seenRoles = new Set();
      for (const row of positiveRows) {
        const role = String(row.Role || '').trim();
        if (role && !seenRoles.has(role)) {
          seenRoles.add(role);
          users.push({
            role: role,
            email: String(row.Email || '').trim(),
            password: String(row.Password || '').trim(),
            expectedDashboard: row.ExpectedDashboard || role,
            scenario: row.Scenario,
          });
        }
      }

      this.logger.info(`✓ Loaded ${users.length} test users from Excel`);
      return users;
    } catch (error) {
      this.logger.error(`Failed to read test users from Excel: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get test user by role directly from Excel file
   */
  getTestUserByRole(role, filePath = './test-data/LoginData.xlsx') {
    this.logger.info(`Getting test user for role: ${role} from Excel`);

    try {
      const allData = (this.loginDataCache && this.loginDataCache[filePath]) || this.getLoginDataSync(filePath);
      const roleStr = String(role).trim().toLowerCase();

      // Find first positive case for this role
      const userRow = allData.find((row) => {
        const matchRole = String(row.Role || '').trim().toLowerCase() === roleStr;
        const isPositive = String(row.ExpectedResult || '').trim().toLowerCase().includes('dashboard');
        return matchRole && isPositive;
      }) || allData.find((row) => String(row.Role || '').trim().toLowerCase() === roleStr);

      if (!userRow) {
        this.logger.warn(`Test user not found in Excel for role: ${role}`);
        return null;
      }

      const user = {
        role: userRow.Role,
        email: String(userRow.Email || '').trim(),
        password: String(userRow.Password || '').trim(),
        expectedDashboard: userRow.ExpectedDashboard || userRow.Role,
        scenario: userRow.Scenario,
      };

      this.logger.info(`✓ Found test user for role: ${role} from Excel (${user.email})`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to get test user by role from Excel: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get random test data (for randomization scenarios only)
   */
  async getRandomTestData(count = 1, filePath = './test-data/LoginData.xlsx') {
    this.logger.info(`Getting ${count} random test case(s)`);

    try {
      const allData = await this.getLoginData(filePath);
      const shuffled = [...allData].sort(() => Math.random() - 0.5);
      const random = shuffled.slice(0, count);

      this.logger.info(`✓ Retrieved ${random.length} random test case(s)`);
      return random;
    } catch (error) {
      this.logger.error(`Failed to get random test data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate test data row (check required fields)
   */
  validateTestDataRow(row) {
    this.logger.info(`Validating test data row: ${row.TC_ID}`);

    const requiredFields = ['TC_ID', 'Priority', 'Role', 'Scenario', 'Email', 'Password'];
    const missingFields = requiredFields.filter((field) => !row[field]);

    if (missingFields.length > 0) {
      this.logger.warn(`Missing fields: ${missingFields.join(', ')}`);
      return false;
    }

    this.logger.info(`✓ Test data row is valid`);
    return true;
  }

  /**
   * Get data summary
   */
  async getDataSummary(filePath = './test-data/LoginData.xlsx') {
    this.logger.info('Getting test data summary');
    this.logger.separator();

    try {
      const allData = await this.getLoginData(filePath);
      const executable = allData.filter((row) => row.Execute === 'Yes');
      const byRole = {};
      const byPriority = {};

      allData.forEach((row) => {
        byRole[row.Role] = (byRole[row.Role] || 0) + 1;
        byPriority[row.Priority] = (byPriority[row.Priority] || 0) + 1;
      });

      const summary = {
        totalTests: allData.length,
        executableTests: executable.length,
        byRole,
        byPriority,
      };

      this.logger.info('Test Data Summary:');
      this.logger.info(`  Total test cases: ${summary.totalTests}`);
      this.logger.info(`  Executable tests: ${summary.executableTests}`);
      this.logger.info(`  By Role: ${JSON.stringify(summary.byRole)}`);
      this.logger.info(`  By Priority: ${JSON.stringify(summary.byPriority)}`);

      return summary;
    } catch (error) {
      this.logger.error(`Failed to get data summary: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new TestDataProvider();

# Allure Automation Execution Guide

This guide explains how to use the custom test runner (`npm run test:report`) to execute Playwright tests. 

Whenever you use this command, the framework will automatically:
1. Delete any old Allure results.
2. Run your requested tests against **QA1**.
3. Run your requested tests against **QA2**.
4. Generate separate Allure HTML reports for both.
5. Deploy both reports to their respective Surge.sh URLs.
6. Email the reports to the configured recipients.



-----------------

You can now easily choose to run your tests on QA1 only, QA2 only, or Both (in parallel) by using different commands.


npx playwright test tests/partner/channel_partner_creation.spec.js --project=chromium --headed 

<!-- How to use it: -->
1. To run on QA1 ONLY:
bash
npm run test:report:qa1 -- tests/reports/reports_download_all.spec.js --project=chromium --headed
npm run test:report:qa1 -- tests --project=chromium

2. To run on QA2 ONLY:

bash
npm run test:report:qa2 -- tests/All_reports/reports/Reports_from_CP/ac-stock-report.spec.js --project=chromium
3. To run on BOTH (in parallel):

bash
npm run test:report -- tests/All_reports/reports/Reports_from_CP/ac-stock-report.spec.js --project=chromium
(Note: Just like before, you can still add -g "Download functionality" or any other Playwright flags to the end of any of these commands, and it will correctly pass them down!)

---

## 1. Run a Single Test File
If you want to run all test cases inside a specific file:
```bash
npm run test:report -- tests/login/login.spec.js
```

## 2. Run a Single Test Case (Inside a specific file)
If you want to execute only one specific test case by its name, use the `-g` (grep) flag:
```bash
npm run test:report -- tests/login/login.spec.js -g "valid login"
```
*(Note: This will match any test case whose name contains "valid login")*

## 3. Run a Complete Folder
If you want to run all test files inside a specific folder (e.g., all sanity tests):
```bash
npm run test:report -- tests/sanity
```

## 4. Run the Complete Test Suite
If you want to run every single test case in the entire framework:
```bash
npm run test:report
```

## 5. Run Tests Based on Tags (Using Grep)
If you have tagged your tests (e.g., `@smoke`, `@regression`) across multiple files, you can run all tests with a specific tag:
```bash
npm run test:report -- -g "@smoke"
```

## 6. Run Tests in a Specific Browser
If you want to override the default browser configuration and force the tests to run only on Firefox, for example:
```bash
npm run test:report -- --project=firefox
```

---

## Managing Allure Reports Manually

If you ever need to manually manage the reports without running tests, you can use these helper scripts:

- **Clean old results manually:**
  ```bash
  npm run allure:clean
  ```
- **Generate reports manually from existing results:**
  ```bash
  npm run allure:generate:qa1
  npm run allure:generate:qa2
  ```
- **Open a generated report locally (without deploying to Surge):**
  ```bash
  npm run allure:open:qa1
  npm run allure:open:qa2
  ```

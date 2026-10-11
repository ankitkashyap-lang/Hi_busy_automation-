# Enterprise Prompt — Reports Module Exploration, Test Case Generation & Download Automation

You are an **Enterprise-level QA Automation Engineer, Senior Manual Tester, Product Analyst, UI/UX Tester, and Playwright Automation Architect**.

Your task is to **first understand my existing Playwright automation project completely**, including its framework architecture, coding conventions, test-data handling, locator strategy, reporting implementation, and existing report/download utilities. Then explore and automate the **Reports Module** without unnecessarily changing or breaking the existing architecture.

---

## 1. Application Details

**Application URL:**

`https://hiqa2.pooraa.net/`

**Admin Login:**

- Username: `ankit.kashyap@tech.busy.in`
- Password: `123456`

Use these credentials **only for testing this QA environment**.

---

## 2. IMPORTANT — FIRST UNDERSTAND THE EXISTING PROJECT

Before creating or modifying any test:

1. Explore the complete existing Playwright project.
2. Understand:
   - Folder structure
   - Page Object Model architecture
   - Existing base classes/pages
   - Test structure
   - Fixtures
   - Config files
   - Environment handling
   - Test-data handling
   - Excel/CSV utilities, if already present
   - Existing locator files/patterns
   - Authentication/login implementation
   - Browser configuration
   - Existing assertions
   - Logging and screenshots
   - Error handling
   - Existing reporting implementation
   - Existing report-generation scripts
   - Existing download/file-handling utilities
   - `package.json` scripts
3. **Do not redesign the framework** if an existing suitable pattern already exists.
4. Reuse existing utilities and architecture wherever possible.
5. Follow the project's existing naming conventions and coding style.
6. Before adding a new utility, first verify whether an equivalent utility already exists.

### Critical requirement

**Understand the existing reports-related scripts before implementing anything new.**

If the project already contains report generation, download, file validation, or Allure/reporting utilities, reuse them instead of creating duplicate implementations.

---

# 3. Explore the Reports Module Using Playwright MCP

After understanding the project, use the **Playwright MCP server** to explore the actual QA application.

Follow this flow:

```text
Login
  ↓
Menu
  ↓
Analytics
  ↓
Explore every available report
```

Do not rely only on assumptions or static source-code inspection. Use the actual application UI through Playwright MCP.

---

# 4. Locator Strategy

For every page and report:

### Locator priority

Use locators in this order:

1. `data-testid` / test ID
2. Stable `id`
3. Stable `name`
4. Accessible role + accessible name
5. Stable placeholder
6. Stable CSS selector
7. XPath only when no better stable locator exists

Avoid:

- Dynamic generated classes
- Auto-generated React/Vue attributes
- Index-based selectors
- Long fragile XPath
- Text selectors when a stable attribute is available

### IMPORTANT

**Keep locators separate from page/test logic.**

Follow the same locator-file structure already used by the existing project.

For example, if the project currently follows a structure such as:

```text
pages/
locators/
tests/
utils/
```

then follow that same convention.

Do not introduce a completely new locator architecture.

---

# 5. Reports Module Exploration

After:

```text
Login → Menu → Reports
```

identify **every report available to the Admin user**.

For each report, document:

- Report name
- Navigation path
- Page URL, if applicable
- Page heading
- Filters
- Dropdowns
- Date selectors
- Search fields
- Radio buttons
- Checkboxes
- Apply/Search buttons
- Reset/Clear buttons
- Download buttons
- Export buttons
- Pagination
- Table columns
- Empty-state behavior
- Validation messages
- Error messages
- Success messages
- Loading states
- Tooltips
- Popups/modals
- Any role-specific behavior

Do not skip reports just because they appear similar.

---

# 6. Generate Complete Test Cases

Create comprehensive test cases for the Reports module.

Cover at minimum:

## A. Navigation

- Reports menu is visible
- Reports menu opens successfully
- Every report is accessible
- Correct page opens for each report
- Back navigation
- Refresh behavior
- Direct URL behavior, where applicable

## B. UI Validation

Verify:

- Page title
- Heading
- Labels
- Buttons
- Dropdowns
- Inputs
- Tables
- Icons
- Download buttons
- Pagination
- Filter controls

## C. Positive Scenarios

For every report:

- Open report with default filters
- Apply valid filters
- Search valid data
- Generate report
- Verify result data
- Download report
- Verify successful download
- Verify downloaded file exists
- Verify filename
- Verify file extension
- Verify file is not empty

## D. Filter Scenarios

Test:

- Valid date range
- Same start/end date
- Start date > end date
- Minimum date
- Maximum supported date
- Blank date
- Invalid date
- Valid dropdown values
- No selection
- Multiple filter combinations
- Search with valid values
- Search with invalid values
- Search with partial values
- Special characters where applicable

## E. Negative Scenarios

Verify behavior for:

- Invalid filters
- Missing required fields
- Invalid date range
- No matching data
- Empty result set
- Invalid search
- Download without required filters
- API/server failure where reproducible
- Session timeout, where applicable

## F. Download Validation

For **every report that provides a download/export option**, test:

1. Click Download/Export.
2. Wait for the download event properly.
3. Verify the download completes.
4. Verify the file exists.
5. Verify the filename.
6. Verify the extension.
7. Verify the file is not zero bytes.
8. Verify the file can be opened/read where practical.
9. Verify the downloaded content corresponds to the selected filters.
10. Verify repeated downloads do not incorrectly overwrite or corrupt files.
11. Verify download behavior when no data is available.
12. Verify download behavior for different filter combinations.

Do not use arbitrary hard-coded waits such as:

```js
await page.waitForTimeout(5000);
```

Prefer Playwright's event-based waiting:

```js
const downloadPromise = page.waitForEvent('download');
await page.getByRole('button', { name: /download/i }).click();
const download = await downloadPromise;
```

Adapt this to the actual application and existing project utilities.

---

# 7. Download ALL Reports

This is a key requirement.

After identifying all reports available under:

```text
Menu → Reports
```

implement automation that can **download every available report**.

Requirements:

- Do not manually hard-code only one report.
- Create a maintainable approach for multiple reports.
- Reuse common page-object methods where possible.
- Use separate report configuration/test data if the project already follows data-driven testing.
- Save downloads in a dedicated report-download directory.
- Avoid overwriting files unexpectedly.
- Use meaningful filenames.
- Clean old generated downloads before a fresh run if that is consistent with the project's conventions.
- Validate each download.
- Fail the test if an expected report cannot be downloaded.
- Capture useful diagnostics on failure.

If different reports require different filters or different download flows, model those differences cleanly instead of forcing all reports into one fragile generic method.

---

# 8. Downloaded File Validation

For every downloaded report:

### File-level validation

Validate:

- File exists
- File size > 0
- Expected extension
- Expected filename pattern

### Content-level validation

Where technically practical, validate:

- Header/column names
- At least expected structure
- Data rows when data is expected
- Selected filter values reflected in the report
- No corrupted/invalid file

Use the project's existing file/Excel/CSV utilities if available.

If the project does not have such utilities, create a small reusable utility rather than duplicating logic across tests.

---

# 9. Test Data

First inspect the existing test-data architecture.

If Excel/data-driven testing is already implemented:

**Reuse it.**

Do not create duplicate test-data mechanisms.

If report test data is required, keep it separate and maintainable.

Example:

```text
test-data/
  reports/
    reports.xlsx
```

Possible fields:

```text
Execute
TC_ID
Report_Name
Scenario
Filter_Type
From_Date
To_Date
Search_Value
Expected_Result
Expected_File_Type
Expected_File_Name
Priority
Run_Environment
Remarks
```

Only introduce fields that are actually required by the implementation.

---

# 10. Page Object Model

Create/update Page Objects following the existing framework.

A possible logical structure is:

```text
pages/
  reports/
    ReportsPage.js
    <SpecificReportPage>.js

locators/
  reports/
    reportsLocators.js
    <SpecificReport>Locators.js

tests/
  reports/
    reports.spec.js
```

**Do not blindly use this exact structure** if the existing project follows another convention.

Follow the project's existing architecture.

---

# 11. Keep Locators Separate

Do NOT write fragile selectors directly throughout test cases.

Prefer:

```js
const reportsLocators = {
  reportsMenu: ...,
  reportItems: ...,
  downloadButton: ...,
};
```

and page methods such as:

```js
async openReports() {
  // implementation
}
```

Tests should remain readable:

```js
await reportsPage.openReports();
await reportsPage.openReport(reportName);
await reportsPage.downloadReport();
```

---

# 12. Test Case Organization

Organize tests logically, for example:

```text
Reports
├── Navigation
├── UI Validation
├── Filters
├── Report Generation
├── Download
├── Download Validation
├── Negative Scenarios
└── Edge Cases
```

Use the existing test suite/tagging conventions if available.

---

# 13. Test Execution

After implementation:

1. Run the relevant Reports tests.
2. Fix locator issues.
3. Fix timing/synchronization issues.
4. Fix flaky behavior.
5. Re-run failed tests.
6. Run the complete Reports suite.
7. Verify downloaded files.
8. Verify reporting output.
9. Verify no existing tests are broken.

Do not stop after the first successful test.

---

# 14. Existing Reporting Implementation

Before modifying reporting:

- Inspect existing `package.json` scripts.
- Inspect existing Playwright reporter configuration.
- Inspect Allure configuration if present.
- Inspect report-generation scripts.
- Inspect report cleanup behavior.
- Inspect existing CI scripts.

**Reuse the existing reporting implementation.**

Do not create a second reporting system unless the existing implementation genuinely cannot support the Reports module.

The final test execution must produce results using the project's existing reporting mechanism.

---

# 15. Enterprise-Level Quality Requirements

The implementation should be:

- Maintainable
- Reusable
- Scalable
- Data-driven where appropriate
- Stable
- Parallel-safe where appropriate
- CI/CD friendly
- Easy for another QA engineer to understand
- Consistent with the existing framework

Avoid over-engineering.

Do not introduce unnecessary abstraction layers.

---

# 16. IMPORTANT — Agent Working Style

Do NOT repeatedly ask me for confirmation before every step.

You are expected to:

1. Explore the existing project.
2. Explore the application.
3. Understand the Reports module.
4. Generate test cases.
5. Implement the automation.
6. Execute the tests.
7. Fix issues found during execution.
8. Validate downloads.
9. Generate the final report.

Only ask me when you encounter a genuine blocker that cannot be resolved safely from the project/application.

Do not stop just because one locator fails. Inspect the page and find a stable alternative.

---

# 17. Deliverables

At the end, provide:

### A. Test Cases

A complete list/file containing all identified Reports test cases with:

- TC ID
- Report
- Scenario
- Preconditions
- Steps
- Test Data
- Expected Result
- Priority
- Type

### B. Automation

Completed Playwright automation for:

- Reports navigation
- All available reports
- Filters
- Report generation
- Download
- Download validation
- Negative scenarios where applicable

### C. Locators

Separate locator files following the existing project architecture.

### D. Download Validation

Reusable download/file validation utilities where required.

### E. Execution Summary

Report:

```text
Total Tests:
Passed:
Failed:
Skipped:
Total Reports Discovered:
Reports Successfully Downloaded:
Reports Failed:
Download Validation Status:
```

For every failure, include:

- Test case
- Report name
- Failure reason
- Relevant error
- Suggested technical fix

---

# 18. Final Instruction

**Do not just create test cases based on assumptions.**

First inspect:

```text
Existing Project
      ↓
Existing Reporting Scripts
      ↓
Existing Locator Architecture
      ↓
Existing Test/Data Utilities
      ↓
Login
      ↓
Menu
      ↓
Reports
      ↓
Explore ALL Reports
      ↓
Generate ALL Relevant Test Cases
      ↓
Implement Playwright Automation
      ↓
Download ALL Reports
      ↓
Validate ALL Downloads
      ↓
Run Tests
      ↓
Fix Failures
      ↓
Final Execution Summary
```

The goal is a **production-quality, enterprise-style Reports automation implementation using the existing Playwright + JavaScript framework**, not a quick one-off script.

# Implement Allure Reporting in Existing Playwright Project

You are an expert in **Playwright JavaScript, Allure Reporting, Node.js, QA automation, email integration, and Surge.sh deployment**.

I already have an existing Playwright JavaScript automation framework. **Do NOT create a new framework from scratch.** First inspect my complete existing project and understand its current architecture, configuration, test execution flow, environment handling, utilities, and `package.json`.

Implement Allure reporting with the **minimum required changes** while preserving all existing test behavior.

## 1. Existing Project Rules

- Project is Playwright + JavaScript.
- Use **CommonJS** (`require` / `module.exports`) because my project uses CommonJS.
- Reuse existing:
  - `playwright.config.js`
  - test structure
  - utilities
  - fixtures
  - environment configuration
  - naming conventions
  - existing login/storageState mechanism
- Do not unnecessarily modify existing test cases.
- Do not break existing Playwright commands.
- Do not create a parallel/new automation framework.

---

## 2. Allure Reporting

Integrate Allure reporting into the current Playwright project.

Use the appropriate Allure Playwright integration/package for the current project.

The report must contain useful information such as:

- Test case name
- Test status
- Duration
- Suite/file
- Steps where available
- Failure details
- Error/stack trace
- Screenshot on failure if the existing framework already supports screenshots
- Browser information
- Environment/server information
- QA1 or QA2 identification

---

## 3. VERY IMPORTANT — Latest Run Only

Allure must **NEVER show historical test executions**.

Every time tests are executed:

1. Delete/clean the previous Allure results.
2. Run only the requested tests.
3. Generate Allure results for that execution.
4. Generate the report from only those results.
5. Deploy/show only that latest report.

### Example

First execution:

```text
10 test cases run
```

Allure report must show:

```text
10 test cases
```

Next execution:

```text
5 test cases run
```

Allure report must now show:

```text
5 test cases
```

It must NOT show:

```text
15 test cases
```

or any tests from the previous execution.

Implement proper cleanup so old `allure-results` and generated report data cannot contaminate the next execution.

---

## 4. QA1 and QA2 Support

My sanity automation runs against **two servers**:

```text
QA1
QA2
```

The framework must support both environments cleanly.

For example, maintain environment configuration such as:

```text
QA1 = existing QA1 URL/configuration
QA2 = existing QA2 URL/configuration
```

Do NOT hardcode URLs inside individual test cases.

Reuse my existing environment/configuration mechanism wherever possible.

---

## 5. Every Test Scope Must Support Allure

Whatever Playwright scope I execute, Allure must automatically be generated for **exactly that execution**.

It must work when I run:

### Complete test suite

```bash
npx playwright test
```

### Complete test folder

```bash
npx playwright test tests/sanity
```

### Specific test file

```bash
npx playwright test tests/sanity/login.spec.js
```

### Specific test case

For example:

```bash
npx playwright test tests/sanity/login.spec.js -g "valid login"
```

The Allure report must contain only the tests actually executed by that command.

Do NOT require me to manually run a separate Allure command after every test execution.

---

## 6. QA1 + QA2 Execution Requirement

For my **sanity tests**, whenever I execute a test scope, it must execute against BOTH:

```text
QA1
QA2
```

For example, if I execute:

```bash
npx playwright test tests/sanity/login.spec.js -g "valid login"
```

the requested test must execute:

```text
QA1
AND
QA2
```

The solution must also work when:

- one test file is executed
- one folder is executed
- the complete sanity suite is executed
- a single test case using `-g` is executed

Do not require me to manually execute QA1 and QA2 separately.

---

## 7. Separate QA1 and QA2 Allure Reports

QA1 and QA2 must have **separate Allure reports**.

For example:

```text
QA1 execution
    ↓
QA1 Allure results
    ↓
QA1 Allure report
    ↓
QA1 Surge deployment
```

and:

```text
QA2 execution
    ↓
QA2 Allure results
    ↓
QA2 Allure report
    ↓
QA2 Surge deployment
```

Do NOT mix QA1 and QA2 results into one report.

Each report must clearly identify its environment.

For example:

```text
Environment: QA1
```

and:

```text
Environment: QA2
```

---

## 8. Email Delivery

After the Allure report is generated and deployed, send the corresponding report/deployed report information to the configured email recipient.

### QA1

Send QA1 report information to:

```text
ankit.kashap@tech.busy.in
```

### QA2

Send QA2 report information to:

```text
27ankitkashyap@gmail.com
```

Do NOT send QA1 results to the QA2 recipient.

Do NOT send QA2 results to the QA1 recipient.

The email should contain at minimum:

```text
Environment: QA1 / QA2
Execution status
Number of tests executed
Passed count
Failed count
Skipped count
Execution duration
Allure report URL
```

Use environment variables for email credentials/configuration.

**Never hardcode SMTP passwords, API keys, tokens, or other secrets into source code.**

---

## 9. Surge.sh Free Hosting

Use **Surge.sh free hosting** to publish the generated Allure HTML report.

The deployment flow should be:

```text
Playwright Test
      ↓
Clean old Allure results
      ↓
Run requested tests
      ↓
Generate Allure results
      ↓
Generate Allure HTML report
      ↓
Deploy latest report to Surge.sh
      ↓
Get report URL
      ↓
Send report URL by email
```

Use separate Surge deployment destinations for QA1 and QA2 so their reports don't overwrite each other.

For example:

```text
QA1 → dedicated Surge URL
QA2 → dedicated Surge URL
```

The actual Surge domain names can be configured through environment variables.

---

## 10. package.json Scripts

Update `package.json` so I can easily execute different scopes and automatically generate Allure reports.

I should have scripts for at least:

```text
test
test:headed
test:qa1
test:qa2
test:sanity
test:sanity:qa1
test:sanity:qa2
allure:generate
allure:open
allure:clean
report:qa1
report:qa2
```

More importantly, provide a convenient mechanism where I can pass a Playwright test file/folder/grep expression while still getting the Allure report automatically.

Examples should work:

```bash
npm run test:report -- tests/login/login.spec.js
```

```bash
npm run test:report -- tests/sanity
```

```bash
npm run test:report -- tests/sanity/login.spec.js -g "valid login"
```

If the architecture requires separate QA execution scripts, provide equivalent commands for QA1 and QA2.

---

## 11. Single Test Case Requirement

If I execute only one test:

```bash
npx playwright test tests/example.spec.js -g "Test Case 1"
```

the automation must:

1. Execute that test on QA1.
2. Execute that test on QA2.
3. Generate QA1 Allure report containing only that execution.
4. Generate QA2 Allure report containing only that execution.
5. Deploy QA1 report to QA1 Surge URL.
6. Deploy QA2 report to QA2 Surge URL.
7. Send QA1 report URL to:
   `ankit.kashap@tech.busy.in`
8. Send QA2 report URL to:
   `27ankitkashyap@gmail.com`

---

## 12. Avoid Historical Results

Do not use a persistent shared `allure-results` directory between executions without cleaning it.

Prefer a structure similar to:

```text
allure/
    qa1/
        results/
        report/
    qa2/
        results/
        report/
```

Before every execution:

```text
QA1 old results → delete
QA2 old results → delete
```

Then generate fresh results.

Make sure parallel/dual-environment execution cannot accidentally merge results.

---

## 13. Environment Variables

If required, update `.env.example` with variables similar to:

```env
QA1_BASE_URL=
QA2_BASE_URL=

QA1_REPORT_EMAIL=ankit.kashap@tech.busy.in
QA2_REPORT_EMAIL=27ankitkashyap@gmail.com

SURGE_QA1_DOMAIN=
SURGE_QA2_DOMAIN=

EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASSWORD=
```

Do not expose actual secrets.

If the existing project already has environment variables for QA URLs, users, passwords, or other configuration, reuse them instead of duplicating them.

---

## 14. Implementation Approach

Before modifying anything:

### Step 1 — Inspect

Inspect:

```text
package.json
playwright.config.js
.env
config/
base/
utils/
providers/
factories/
tests/
```

and any other relevant files.

Understand:

- How environments are currently selected
- How QA1/QA2 URLs are configured
- How tests are launched
- Whether projects are already defined in Playwright
- How authentication/storageState works
- How screenshots/logging are handled
- Existing npm scripts

### Step 2 — Design

Based on the existing architecture, decide the minimum changes required for:

- Allure integration
- QA1/QA2 execution
- latest-only results
- report generation
- Surge deployment
- email notification

### Step 3 — Implement

Modify only the necessary files.

### Step 4 — Validate

Actually execute and validate:

#### Test 1

Run one test case.

Expected:

```text
QA1 → 1 test in report
QA2 → 1 test in report
```

#### Test 2

Run 5 tests.

Expected:

```text
QA1 → 5 tests
QA2 → 5 tests
```

#### Test 3

Run 10 tests.

Expected:

```text
QA1 → 10 tests
QA2 → 10 tests
```

#### Test 4

Run 5 tests again.

Expected:

```text
QA1 → 5 tests ONLY
QA2 → 5 tests ONLY
```

There must be no leftover tests from the previous 10-test execution.

#### Test 5

Run a single test using `-g`.

Expected:

```text
QA1 → exactly that test
QA2 → exactly that test
```

---

## 15. Important Constraints

- Do NOT create a new framework.
- Do NOT rewrite existing test cases.
- Do NOT change existing business logic.
- Do NOT remove existing reporters unless necessary.
- Do NOT break existing Playwright execution.
- Do NOT hardcode secrets.
- Do NOT mix QA1 and QA2 Allure results.
- Do NOT retain historical Allure results.
- Do NOT require manual cleanup before every run.
- Do NOT require me to manually generate Allure after every test command.
- Preserve existing CommonJS architecture.

---

## 16. Final Deliverables

After implementation, provide:

1. List of files created.
2. List of files modified.
3. Exact code changes made.
4. Updated `package.json` scripts.
5. Required `.env` variables.
6. Exact commands for:
   - complete test suite
   - sanity suite
   - folder
   - test file
   - single test case
   - QA1
   - QA2
   - Allure generation
   - opening report
7. Exact Surge deployment commands/process.
8. Email configuration/setup steps.
9. Explain how QA1 and QA2 reports remain separate.
10. Explain how latest-run-only behavior is guaranteed.
11. Execute the relevant tests and verify the implementation rather than only providing theoretical code.

Most importantly, **work with my existing project instead of creating a new framework.**

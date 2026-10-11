# Enterprise Playwright JavaScript Automation Framework — Master Prompt

## Role

Act as a **Senior Test Automation Architect / Enterprise SDET** and build a complete, production-ready **Playwright automation framework using JavaScript (Node.js)**.

The framework must be scalable, maintainable, reusable, role-based, data-driven, CI/CD-ready, and suitable for real enterprise applications.

**Use JavaScript only. Do NOT use Python, Pytest, or TypeScript.**

---

## Application Under Test

Application: **Hi Busy Subscription Management System**

Base URL:

`https://hiqa1.pooraa.net/`

Roles:

- `admin`
- `busy_team`
- `channel_partner`
- `reseller`

Admin and Busy Team have different dashboards. Channel Partner and Reseller have different dashboards.

Credentials must never be hardcoded in test files. Use `.env`, Excel, or approved secret management.

---

# Final Enterprise Folder Structure

Use this exact architecture. Do not redesign it unnecessarily.

```text
hi-busy-automation/
│
├── package.json
├── playwright.config.js
├── .env
├── .gitignore
├── README.md
│
├── config/
│   ├── env.js
│   ├── urls.js
│   ├── constants.js
│   ├── roles.js
│   ├── permissions.js
│   └── globalConfig.js
│
├── test-data/
│   ├── LoginData.xlsx
│   ├── SubscriptionData.xlsx
│   ├── CustomerData.xlsx
│   └── TestUsers.json
│
├── utils/
│   ├── excelReader.js
│   ├── excelWriter.js
│   ├── logger.js
│   ├── screenshot.js
│   ├── waitHelper.js
│   ├── randomData.js
│   ├── apiHelper.js
│   ├── dbHelper.js
│   ├── dateHelper.js
│   ├── permissionHelper.js
│   └── roleHelper.js
│
├── base/
│   ├── BasePage.js
│   ├── BaseTest.js
│   └── BaseAssertions.js
│
├── pages/
│   ├── Login/
│   │      LoginPage.js
│   │
│   ├── Dashboard/
│   │      AdminDashboard.js
│   │      BusyTeamDashboard.js
│   │      ChannelPartnerDashboard.js
│   │      ResellerDashboard.js
│   │
│   ├── Subscription/
│   ├── Customer/
│   ├── Wallet/
│   ├── Reports/
│   └── Common/
│
├── flows/
│   ├── LoginFlow.js
│   ├── DashboardFlow.js
│   ├── SubscriptionFlow.js
│   ├── CustomerFlow.js
│   └── WalletFlow.js
│
├── validations/
│   ├── LoginValidation.js
│   ├── DashboardValidation.js
│   ├── PermissionValidation.js
│   └── MenuValidation.js
│
├── factories/
│   ├── UserFactory.js
│   ├── CustomerFactory.js
│   └── SubscriptionFactory.js
│
├── fixtures/
│   ├── auth.fixture.js
│   ├── role.fixture.js
│   └── base.fixture.js
│
├── storageState/
│   ├── admin.json
│   ├── busyTeam.json
│   ├── channelPartner.json
│   ├── reseller.json
│   └── guest.json
│
├── tests/
│   ├── login/
│   │      login.spec.js
│   │
│   ├── dashboard/
│   ├── subscription/
│   ├── customer/
│   ├── wallet/
│   └── reports/
│
├── reports/
│   ├── html/
│   └── allure/
│
├── screenshots/
├── traces/
├── logs/
│
└── global-setup.js
```

---

# Architecture

Strictly follow:

```text
Tests
   │
   ▼
Business Flows
   │
   ▼
Page Objects
   │
   ▼
Base Page
   │
   ▼
Playwright
```

Role-based flow:

```text
Test
 │
 ▼
Flow
 │
 ├── UserFactory / TestDataProvider
 │
 ▼
Page Object
 │
 ▼
BasePage
 │
 ▼
Playwright
```

Validation:

```text
Test
 │
 ▼
Validation
 │
 ▼
Page Object
 │
 ▼
Playwright Assertions
```

Each layer has one clear responsibility.

---

# Test Layer

Files under `tests/` must only orchestrate execution.

Tests must:

- Read data through providers.
- Call business flows.
- Call validation methods.
- Use assertions.
- Avoid raw locators.
- Avoid business logic.
- Avoid direct Excel parsing.
- Avoid duplicate UI actions.

Example:

```javascript
const { test } = require('@playwright/test');

const LoginFlow = require('../../flows/LoginFlow');
const TestDataProvider = require('../../providers/TestDataProvider');

const loginData = TestDataProvider.getLoginData();

loginData.forEach((testData) => {

    test(`[${testData.TC_ID}] ${testData.Scenario}`, async ({ page }) => {

        const loginFlow = new LoginFlow(page);

        await loginFlow.login({
            email: testData.Email,
            password: testData.Password
        });

    });

});
```

---

# Page Object Model

Every application page/module should have its own Page Object.

Page Objects are responsible for:

- Locators
- UI interactions
- Page-specific reusable methods
- Page-specific navigation
- Basic page state checks

They must not contain large business workflows.

Prefer stable Playwright locators:

1. `data-testid`
2. `getByRole`
3. `getByLabel`
4. `getByPlaceholder`
5. `getByText`
6. Stable CSS
7. XPath only when unavoidable

Do not use generated Material UI classes such as `jss435` or `jss440` as primary locators.

---

# BasePage

`base/BasePage.js` contains reusable browser actions such as:

- click
- fill
- getText
- isVisible
- waitForElement
- waitForURL
- selectOption
- hover
- uploadFile
- screenshot
- navigation helpers
- common error handling
- logging

Use Playwright auto-waiting and web-first assertions.

Do not use `waitForTimeout()` as a synchronization strategy.

---

# Business Flow Layer

Flows contain business-level sequences.

Examples:

```text
LoginFlow.js
DashboardFlow.js
SubscriptionFlow.js
CustomerFlow.js
WalletFlow.js
```

Example:

```javascript
await loginFlow.login(user);
await subscriptionFlow.purchaseDesktopPerpetual(data);
```

Flows call Page Objects and must not contain low-level locator definitions.

---

# Validation Layer

Validation classes contain reusable business assertions.

Examples:

```text
LoginValidation.js
DashboardValidation.js
PermissionValidation.js
MenuValidation.js
```

Use Playwright `expect`.

Examples:

```javascript
await expect(locator).toBeVisible();
await expect(locator).toContainText('Dashboard');
```

---

# Role-Based Design

Centralize role definitions in:

```text
config/roles.js
factories/UserFactory.js
utils/roleHelper.js
utils/permissionHelper.js
```

Do not scatter role strings across tests.

Factory metadata may contain:

- role
- expected dashboard
- permissions
- expected menus

Credentials come from Excel/environment/secret management, not hardcoded test code.

---

# Excel Data-Driven Testing

Excel is a first-class test data source.

Use:

```text
utils/excelReader.js
providers/TestDataProvider.js
```

Managers/QA engineers must be able to write test cases directly into Excel.

The automation consumes those rows.

**Critical rule:** If Excel contains an explicit email/password, use exactly those values.

For example:

```text
Email = ankit.kashyap+30@gmail.com
Password = 123346890
```

The test must use exactly these values.

Do NOT generate another random invalid email or password.

`randomData.js` may generate data only for scenarios explicitly designed for randomization.

---

# Login Excel Format

Sheet: `Login`

Columns:

```text
Execute
TC_ID
Priority
Role
Scenario
Email
Password
ExpectedResult
ExpectedDashboard
```

Example:

```text
Yes | TC001 | P0 | admin | Valid Login | admin@example.com | password | Dashboard | Admin Dashboard
Yes | TC002 | P0 | busy_team | Valid Login | busy@example.com | password | Dashboard | Busy Team Dashboard
Yes | TC003 | P1 | admin | Invalid Password | admin@example.com | wrong123 | Login Failed |
Yes | TC004 | P1 | admin | Invalid Email | invalid@example.com | password | Login Failed |
Yes | TC005 | P1 | admin | Blank Email | | password | Validation Error |
Yes | TC006 | P1 | admin | Blank Password | admin@example.com | | Validation Error |
Yes | TC007 | P1 | admin | Both Blank | | | Validation Error |
```

Only `Execute = Yes` rows execute.

---

# Subscription Purchase Data

Sheet:

```text
Purchase
```

Recommended columns:

```text
Execute
TC_ID
Priority
Role
Scenario
Email
Password
Edition
LicenseType
Qty
UserQty
ExpectedResult
```

Example:

```text
Yes | PUR001 | P0 | busy_team | Purchase Basic Single User | ankit.kashyap@tech.busy.in | 123456 | Basic | Single User | 2 | 2 | Success
Yes | PUR002 | P0 | busy_team | Purchase Basic Multi User | ankit.kashyap@tech.busy.in | 123456 | Basic | Multi User | 1 | 1 | Success
Yes | PUR003 | P1 | busy_team | Purchase Standard Single User | ankit.kashyap@tech.busy.in | 123456 | Standard | Single User | 3 | 3 | Success
Yes | PUR004 | P1 | busy_team | Purchase Standard Client Server | ankit.kashyap@tech.busy.in | 123456 | Standard | Client Server | 2 | 2 | Success
```

---

# Desktop Perpetual Purchase Flow

Follow:

```text
Excel
   │
   ▼
TestDataProvider
   │
   ▼
purchaseDesktopPerpetual.spec.js
   │
   ▼
LoginFlow
   │
   ▼
LoginPage
   │
   ▼
PurchaseDesktopPerpetualFlow
   │
   ▼
DesktopPerpetualPage
   │
   ▼
Playwright
   │
   ▼
PurchaseValidation
```

Business flow:

```text
Login
  ↓
Open hamburger menu
  ↓
Click Partner
  ↓
Select Partner
  ↓
Open Partner Dashboard
  ↓
Click Perpetual
  ↓
Select configured product/model
  ↓
Fill quantity
  ↓
Next
  ↓
Fill user quantity
  ↓
Purchase
  ↓
Verify Desktop - Purchase Successful
  ↓
Verify subscription count
  ↓
Verify product/model
  ↓
Capture subscription number
  ↓
Capture activation key
  ↓
Print purchase summary
```

If Excel specifies a product/model, use that exact value.

Random selection is allowed only in a dedicated randomization scenario and must never override explicit Excel data.

---

# Purchase Summary

Support console output:

```text
PURCHASE SUMMARY
------------------------------------------------
TC ID              : PUR001
Role               : busy_team
Product            : Desktop
Edition            : Basic
License Type       : Single User
Quantity           : 1
Subscription Count : 1
Subscription No    : **********
Activation Key     : **********
Status             : PASS
------------------------------------------------
```

Mask sensitive values in CI logs where appropriate.

---

# Configuration

Support:

```text
dev
qa
stage
prod
```

Use:

```text
config/env.js
config/urls.js
config/globalConfig.js
```

Example:

```text
BASE_URL=https://hiqa1.pooraa.net/
ENVIRONMENT=qa
BROWSER=chromium
HEADLESS=true
```

Never commit real credentials.

---

# Playwright Configuration

`playwright.config.js` must support:

- baseURL
- Chromium
- Firefox
- WebKit
- retries
- workers
- timeout
- actionTimeout
- navigationTimeout
- screenshot on failure
- video
- trace
- HTML report
- Allure integration where configured
- environment configuration

Recommended retries:

```text
Local: 0
CI: 1 or 2
```

Retries must not hide defects.

---

# Fixtures

Use:

```text
fixtures/
├── auth.fixture.js
├── role.fixture.js
└── base.fixture.js
```

Support:

- Browser/page setup
- Role setup
- Authentication
- Storage state
- Test data
- Reusable context
- Environment setup

---

# Storage State

Support:

```text
storageState/
├── admin.json
├── busyTeam.json
├── channelPartner.json
├── reseller.json
└── guest.json
```

Use storage state when appropriate for reusable authenticated sessions.

---

# Utilities

Keep utilities independent and reusable.

- `excelReader.js` — read Excel
- `excelWriter.js` — write execution results where required
- `logger.js` — central logging
- `screenshot.js` — screenshots
- `waitHelper.js` — reusable non-standard waits
- `randomData.js` — explicit randomization only
- `apiHelper.js` — API/hybrid testing
- `dbHelper.js` — backend validation/data setup
- `dateHelper.js` — date calculations
- `permissionHelper.js` — permission logic
- `roleHelper.js` — role utilities

Do not log passwords, tokens, or secrets.

---

# API Utility

Support:

```text
GET
POST
PUT
PATCH
DELETE
```

Include headers, authentication, token handling, response validation, setup, and cleanup.

---

# Database Utility

Optional PostgreSQL/MySQL support:

- connection
- parameterized queries
- select
- approved insert/update
- transactions
- cleanup
- close connection

Never directly modify production data unless explicitly approved.

---

# Reporting

Support:

```text
reports/html/
reports/allure/
```

Reports should contain:

- TC ID
- Scenario
- Status
- Duration
- Environment
- Browser
- Role
- Screenshots
- Trace
- Video where enabled
- Logs
- Failure details

---

# Logging

Store logs under:

```text
logs/
```

Log:

- Test start/end
- Important checkpoints
- Login
- Navigation
- Purchase
- API calls
- DB actions
- Validation
- Errors
- Cleanup

Never log secrets.

---

# Failure Artifacts

Capture where possible:

```text
screenshots/
traces/
logs/
```

Use Playwright's built-in artifact support.

---

# Notifications

Support optional environment-specific email notifications.

Example:

```text
QA → QA team
Stage → Stage team
Production → approved recipients
```

Summary should include:

```text
Environment
Browser
Build
Branch
Total
Passed
Failed
Skipped
Duration
Report location
```

Optional Slack/Microsoft Teams support.

---

# CI/CD

Provide GitHub Actions support for:

- npm install
- Playwright browser installation
- smoke
- sanity
- regression
- artifact upload
- HTML report
- Allure results
- screenshots
- traces
- logs

Support environment variables and workflow inputs.

Optional:

- Jenkins
- Azure DevOps
- GitLab CI

---

# Scheduled Sanity

After deployment/server availability, sanity tests must be runnable automatically at a configurable interval through CI/CD scheduling.

Do not hardcode the schedule into test logic.

Possible schedules:

```text
Every 30 minutes
Every 1 hour
Every 4 hours
Daily
```

The scheduler should call the normal sanity suite.

---

# Test Tags

Support:

```text
@smoke
@sanity
@regression
@login
@dashboard
@subscription
@e2e
```

Example:

```javascript
test(
    '[PUR001] Purchase Basic Single User @subscription @smoke',
    async ({ page }) => {
        // ...
    }
);
```

---

# Best Practices

Strictly follow:

- DRY
- SOLID where practical
- Single Responsibility Principle
- Separation of concerns
- Reusable page methods
- Reusable flows
- Reusable validations
- No raw locators in tests
- No hardcoded waits
- No arbitrary `waitForTimeout`
- Playwright auto-waiting
- Web-first assertions
- Stable locators
- Meaningful naming
- Small focused methods
- No duplicate business logic
- No secrets in Git
- Conservative retries
- Clean test-data separation

---

# Code Quality

Use:

- ESLint
- Prettier
- npm scripts
- optional Husky
- optional lint-staged

Recommended scripts:

```text
npm test
npm run test:smoke
npm run test:sanity
npm run test:regression
npm run test:headed
npm run test:chromium
npm run report
npm run lint
npm run format
```

---

# Security

Never commit:

```text
.env
real passwords
API tokens
DB passwords
SMTP passwords
sensitive authenticated storage states
```

Use GitHub Secrets or approved secret managers in CI/CD.

---

# Login Module Scope

Initially automate only Login.

Positive:

- Valid Admin
- Valid Busy Team
- Valid Channel Partner
- Valid Reseller

Negative:

- Invalid email
- Invalid password
- Both invalid
- Blank email
- Blank password
- Both blank
- Invalid email format
- Leading/trailing spaces where applicable
- Case handling where applicable
- Unauthorized user

Edge cases:

- Explicit malformed email from Excel
- Explicit incorrect password from Excel
- Very long email
- Very long password
- Special characters
- Whitespace
- Session behavior
- Logout
- Already authenticated user
- Role dashboard validation

---

# Purchase Module Scope

Initially automate Desktop Perpetual purchase.

Support:

- Role
- Email
- Password
- Edition
- License Type
- Quantity
- User Quantity
- Expected Result

Purchase inputs must come from Excel.

---

# Development Phases

Work phase-by-phase. Do not dump thousands of lines into one response.

```text
Phase 1
Project setup + folder structure

Phase 2
Configuration + environment + Playwright config

Phase 3
BasePage + BaseTest + BaseAssertions

Phase 4
Excel Reader + TestDataProvider

Phase 5
Login Page + Login Flow + Login Validation

Phase 6
Role Factory + role fixtures + storage state

Phase 7
Login tests

Phase 8
Subscription Purchase Page

Phase 9
Subscription Purchase Flow

Phase 10
Purchase Validation

Phase 11
Purchase Test

Phase 12
Reporting + Logging + Artifacts

Phase 13
CI/CD + GitHub Actions

Phase 14
Docker

Phase 15
Notifications

Phase 16
Final execution documentation
```

Once architecture is finalized, do not redesign it between phases.

New modules must fit into the same architecture.

---

# Current Priority

Initially implement:

```text
Login Module
```

Then:

```text
Desktop Perpetual Purchase
```

Do not implement unrelated modules unless requested.

The framework must remain ready for:

```text
Dashboard
Customer
Wallet
Reports
Subscription
Renewal
Upgrade
Surrender
Reactivation
```

---

# Important Rules

1. JavaScript only.
2. Node.js + Playwright Test.
3. Do not use Python.
4. Do not use TypeScript.
5. Use CommonJS unless explicitly changed.
6. Respect the exact folder structure.
7. Do not introduce unnecessary folders.
8. Do not redesign architecture every phase.
9. Keep Excel as the source of explicit test inputs.
10. Never replace explicit Excel values with random values.
11. Keep credentials secure.
12. Use Page Objects for UI interactions.
13. Use Flow classes for business workflows.
14. Use Validation classes for assertions.
15. Keep tests clean.
16. Use stable Playwright locators.
17. Avoid hard waits.
18. Capture useful failure artifacts.
19. Keep CI/CD ready.
20. Make every new module follow the same architecture.

---

# Expected Output From the AI

When implementing the framework:

1. Start with the folder structure.
2. Explain the purpose of each relevant file.
3. Generate complete code file-by-file.
4. Work phase-by-phase when the implementation is large.
5. Keep all code internally consistent.
6. Do not silently change previously finalized architecture.
7. Provide exact npm installation commands.
8. Provide exact execution commands.
9. Provide troubleshooting guidance.
10. Provide sample Excel data.
11. Provide README instructions.
12. Keep everything JavaScript-based.

The final framework must be:

**Enterprise-ready + scalable + maintainable + role-based + data-driven + JavaScript-only + Playwright-based + CI/CD-ready + suitable for real-world Hi Busy automation.**

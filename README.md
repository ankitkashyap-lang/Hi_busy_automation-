# Hi Busy Automation Framework

Enterprise-grade Playwright JavaScript automation framework for Hi Busy Subscription Management System.

## Overview

- **Framework**: Playwright (JavaScript/Node.js)
- **Application**: Hi Busy Subscription Management System
- **Base URL**: https://hiqa1.pooraa.net/
- **Supported Roles**: Admin, Busy Team, Channel Partner, Reseller

## Features

- ✅ Page Object Model (POM)
- ✅ Business Flow Layer
- ✅ Validation Layer
- ✅ Data-Driven Testing (Excel/JSON)
- ✅ Role-Based Testing
- ✅ Reusable Fixtures
- ✅ Centralized Configuration
- ✅ HTML & Allure Reporting
- ✅ Comprehensive Logging
- ✅ CI/CD Ready
- ✅ Multi-browser Support (Chromium, Firefox, WebKit)

## Folder Structure

```
hi-busy-automation/
├── config/                 # Configuration files
├── test-data/             # Test data (Excel, JSON)
├── utils/                 # Reusable utilities
├── base/                  # Base classes
├── pages/                 # Page Objects
├── flows/                 # Business flows
├── validations/           # Validation classes
├── factories/             # Data factories
├── fixtures/              # Playwright fixtures
├── storageState/          # Authentication states
├── tests/                 # Test files
├── reports/               # Test reports
├── screenshots/           # Failure screenshots
├── traces/                # Playwright traces
├── logs/                  # Test logs
├── playwright.config.js   # Playwright configuration
├── package.json          # Dependencies
└── .env                  # Environment variables
```

## Installation

### Prerequisites

- Node.js 16+ (LTS recommended)
- npm 8+

### Setup

```bash
# Clone or extract the repository
cd hi-busy-automation

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Create/update .env with credentials
cp .env.example .env
# Edit .env with your credentials
```

## Configuration

### Environment

Edit `.env`:

```env
BASE_URL=https://hiqa1.pooraa.net/
ENVIRONMENT=qa
LOGIN_DATA_FILE=test-data/LoginData.xlsx
```

### Playwright Config

Edit `playwright.config.js`:

- baseURL
- retries
- workers
- timeout
- screenshot
- video
- trace

## Test Data

### Login Tests

Excel file: `test-data/LoginData.xlsx`

Columns:
- Execute
- TC_ID
- Priority
- Role
- Scenario
- Email
- Password
- ExpectedResult
- ExpectedDashboard

Only rows with `Execute = Yes` run.

### Subscription Purchase

Excel file: `test-data/SubscriptionData.xlsx`

Columns:
- Execute
- TC_ID
- Priority
- Role
- Scenario
- Email
- Password
- Edition
- LicenseType
- Qty
- UserQty
- ExpectedResult

## Running Tests

```bash
# All tests
npm test

# Smoke tests
npm run test:smoke

# Sanity tests
npm run test:sanity

# Regression tests
npm run test:regression

# Login module tests
npm run test:login

# Headed mode (see browser)
npm run test:headed

# Debug mode
npm run test:debug

# Specific browser
npm run test:chromium
npm run test:firefox
npm run test:webkit
```

## Reports

### HTML Report

```bash
npm run report
```

Report location: `reports/html/index.html`

### Allure Report

```bash
# After test run
allure serve allure-results
```

## Architecture

### Layer Hierarchy

```
Tests
  ↓
Business Flows
  ↓
Page Objects
  ↓
BasePage
  ↓
Playwright
```

### Test Layer

- Orchestrates execution
- Calls flows
- Calls validations
- NO raw locators
- NO direct business logic

### Flow Layer

- Business-level sequences
- Calls page objects
- Chains UI actions

### Page Object Layer

- Locators
- UI interactions
- Page-specific methods
- NO business workflows

### Base Layer

- Reusable browser actions
- click, fill, getText
- waitForElement
- screenshot, navigation
- Common error handling

### Validation Layer

- Business assertions
- Playwright expect()
- Reusable checks

## Locator Strategy

Prefer in order:

1. `data-testid`
2. `getByRole`
3. `getByLabel`
4. `getByPlaceholder`
5. `getByText`
6. Stable CSS
7. XPath (only when unavoidable)

Avoid:
- Generated Material UI classes (jss435, etc.)
- Unstable selectors
- Element indices

## Best Practices

- ✅ DRY principle
- ✅ Single Responsibility
- ✅ Meaningful naming
- ✅ No hardcoded waits
- ✅ Playwright auto-waiting
- ✅ Web-first assertions
- ✅ Reusable methods
- ✅ No duplicate logic
- ✅ No secrets in Git
- ✅ Conservative retries

## Code Quality

```bash
# Lint
npm run lint

# Format
npm run format

# Check format
npm run format:check
```

## Security

### Never Commit

- `.env` with real credentials
- Passwords
- API tokens
- DB passwords
- Real authenticated storage states

### Use

- GitHub Secrets (CI/CD)
- Approved secret managers
- Environment variables

## Logging

Logs stored in `logs/` directory.

Log levels:
- error
- warn
- info
- debug

Logged events:
- Test start/end
- Login
- Navigation
- Actions
- Validations
- Errors

Never log:
- Passwords
- Tokens
- Secrets

## Artifacts

Auto-captured on failure:

- Screenshots: `screenshots/`
- Traces: `traces/`
- Videos: `test-results/`
- Logs: `logs/`

## CI/CD Integration

### GitHub Actions

Workflows provided for:
- npm install
- Playwright install
- smoke tests
- sanity tests
- regression tests
- Artifact upload

### Environment Variables

Set in GitHub Secrets:
- BASE_URL
- Admin credentials
- Busy Team credentials
- etc.

### Scheduled Sanity

Run sanity tests on schedule:
- Every 30 minutes
- Every 1 hour
- Every 4 hours
- Daily

## Roles & Users

### Supported Roles

- admin
- busy_team
- channel_partner
- reseller

### Factory Pattern

User data via `factories/UserFactory.js`:

```javascript
const user = UserFactory.createAdmin();
const user = UserFactory.createBusyTeam();
const user = UserFactory.createChannelPartner();
const user = UserFactory.createReseller();
```

## Test Tags

- @smoke
- @sanity
- @regression
- @login
- @dashboard
- @subscription
- @e2e

Example:

```javascript
test('[TC001] Valid Login @smoke @login', async ({ page }) => {
  // test
});
```

## Troubleshooting

### Tests Timeout

- Increase timeout in `.env` or `playwright.config.js`
- Check network connectivity
- Verify application is accessible

### Locator Not Found

- Update locator strategy
- Use `npx playwright codegen` to generate locators
- Check for dynamic elements

### Authentication Fails

- Verify credentials in Excel
- Check .env configuration
- Validate user exists in application

## Support

For issues or questions, contact QA Automation Team.

## License

ISC

---

**Last Updated**: August 2026

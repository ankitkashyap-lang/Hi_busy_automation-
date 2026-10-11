# Enterprise Prompt — Subscription Purchase Module Exploration & Playwright Automation

You are an **Enterprise-level QA Automation Engineer, Senior Manual Tester, Product Analyst, UI/UX Tester, and Playwright Automation Architect**.

Your task is to **first understand my existing Playwright automation project completely**, then explore and automate the **Subscription Purchase Module** without unnecessarily changing my existing architecture.

## 1. Application Details

Application URL:

`https://hiqa2.pooraa.net/`

Admin Login:

- Username: `ankit.kashyap@tech.busy.in`
- Password: `123456`

Use these credentials only for testing this QA environment.

---

## 2. IMPORTANT — FIRST UNDERSTAND MY EXISTING PROJECT

**Do NOT start writing purchase automation immediately.**

First inspect the complete project/folder structure that I provide.

Understand:

- Existing folder structure
- `playwright.config.js`
- `package.json`
- `.env`
- Config files
- Roles
- Permissions
- Constants
- Base classes
- Page Objects
- Test files
- Utility/helper files
- Excel reader
- Test data provider
- User factory
- Subscription factory
- Login automation
- Storage state/authentication mechanism
- Existing fixtures
- Existing assertions
- Existing reporting
- Existing logging
- Existing screenshots
- Existing API/DB helpers
- Existing naming conventions
- Existing locator strategy
- Existing test-data strategy

### Critical Requirement

**Do not create a completely new framework.**

Reuse my existing framework wherever possible.

If a required component already exists, reuse it.

If a new component is genuinely required, add it in the existing architecture and explain why.

**Do not unnecessarily rename, delete, move, or modify existing files.**

---

## 3. Understand Existing Login/Data-Driven Approach

My login module already uses test data from an Excel file.

Study how the existing login module:

1. Reads Excel data
2. Identifies users/roles
3. Loads credentials
4. Creates test data
5. Performs login
6. Handles authentication
7. Uses storage state/session
8. Executes multiple test cases
9. Generates reports

Then use the **same approach for the Subscription Purchase Module** wherever applicable.

Do not hardcode purchase test data if the existing framework supports Excel-driven data.

---

## 4. Explore the Complete Purchase Journey Manually First

Before creating automation scripts, actually explore the application and understand the complete purchase journey.

You need to identify all pages, tabs, buttons, filters, dropdowns, forms, confirmation screens, validations, success messages, error messages, and post-purchase states.

The modules to investigate are:

### A. Desktop Perpetual

### B. Desktop Subscription

### C. Desktop Mandi

### D. Magic Subscription

For each module, determine the complete end-to-end purchase flow.

---

## 5. Admin → Partner Dashboard Navigation

When logging in as Admin, follow this flow:

### Step 1 — Login

- Open application URL
- Enter Admin email
- Enter password
- Click Submit/Login

Verify that login is successful.

### Step 2 — Open Menu

After successful login:

- Click the Menu button

Identify and verify the correct menu locator.

### Step 3 — Open Partner

- Click **Partner**

Verify the Partner page is opened successfully.

### Step 4 — Select Partner Filter

From the available filters:

- Select **Partner only**

Understand how this filter works.

Document:

- Filter locator
- Available values
- Default value
- Search behavior
- Pagination if applicable
- Empty-result behavior

### Step 5 — Search/Access Partner

Search for the required partner.

Then:

- Locate the searched partner
- Identify the **Lock icon / Access CP** action
- Click the appropriate action

Understand whether:

- Lock icon opens partner dashboard
- Access CP opens partner dashboard
- A new tab/page opens
- The URL changes
- A popup appears
- Any confirmation dialog appears

Handle the actual application behavior accordingly.

---

## 6. Partner Dashboard

After accessing the partner:

Verify that the Partner Dashboard is displayed.

Explore all relevant purchase tabs/buttons.

Expected areas may include:

- Subscription
- Perpetual
- Magic

Do not assume these names or exact UI structures.

**Verify the actual UI from the application.**

---

## 7. Purchase Flow Exploration

For every purchase module, identify the complete flow.

The general expected flow is:

```text
Admin Login
   ↓
Menu
   ↓
Partner
   ↓
Partner Only Filter
   ↓
Search Partner
   ↓
Access CP / Lock
   ↓
Partner Dashboard
   ↓
Purchase Module
   ↓
Select Tenure
   ↓
Select Region
   ↓
Select Category
   ↓
Select Plan
   ↓
Select Model
   ↓
Enter Quantity
   ↓
Purchase
   ↓
Confirmation
   ↓
Purchase Success
   ↓
Verify Purchased Subscription/Product
```

But this is only the initial assumption.

**Explore the real application and update the flow according to actual behavior.**

---

## 8. For Every Purchase Module

Perform detailed exploration separately for:

### 8.1 Desktop Perpetual

Identify:

- Navigation path
- Available plans
- Tenure options, if applicable
- Region options
- Category options
- Model options
- Quantity field
- Pricing
- Taxes/charges
- Purchase button
- Confirmation popup/page
- Success message
- Order/purchase details
- Generated subscription/license details
- Post-purchase verification

### 8.2 Desktop Subscription

Identify:

- Navigation path
- Tenure
- Region
- Category
- Plan
- Model
- Quantity
- Price calculation
- Purchase confirmation
- Success state
- Purchased subscription details
- Renewal/expiry information if displayed

### 8.3 Desktop Mandi

Identify the complete flow and all fields/options.

Document:

- Navigation
- Product/plan selection
- Tenure
- Region
- Category
- Model
- Quantity
- Pricing
- Purchase confirmation
- Success response
- Post-purchase verification

### 8.4 Magic Subscription

Explore the complete Magic Subscription purchase journey.

Identify:

- Available Magic plans
- Tenure
- Region
- Category
- Model
- Quantity
- Pricing
- Purchase button
- Confirmation
- Success message
- Purchased subscription
- Subscription/serial details
- Any additional Magic-specific fields

---

## 9. Do Not Assume Dropdown Values

For every dropdown, dynamically inspect the actual values.

For example:

### Tenure

Determine actual available values such as:

- 360 days
- 720 days
- 1080 days
- etc.

### Region

Determine actual values.

### Category

Determine actual values.

### Plan

Determine actual values.

### Model

Determine actual values.

Do not hardcode these values until you have verified them from the application.

---

## 10. Explore All Pages in the Journey

For every page involved in purchase, document:

| Page | Purpose | URL/Route | Important Elements | Next Action |
|---|---|---|---|---|
| Login | Admin authentication | Actual URL | Email, Password, Submit | Dashboard |
| Partner | Partner management | Actual route | Filter, Search, Access | Partner Dashboard |
| Partner Dashboard | Purchase entry point | Actual route | Tabs/Buttons | Purchase |
| Purchase Page | Product configuration | Actual route | Tenure, Region, Category, Plan, Model, Quantity | Purchase |
| Confirmation | Purchase confirmation | Actual route/popup | Summary, Confirm | Success |
| Success | Purchase completed | Actual route | Success details | Verification |

Use actual application values rather than assumptions.

---

## 11. Identify UI Locators

For every important element identify a reliable locator.

Prefer:

1. `getByRole()`
2. `getByLabel()`
3. `getByPlaceholder()`
4. `getByText()`
5. Stable attributes
6. CSS selectors
7. XPath only when necessary

Avoid fragile selectors such as dynamically generated classes whenever possible.

Document important locators for:

- Menu
- Partner
- Partner filter
- Partner search
- Access CP
- Lock
- Subscription tab
- Perpetual tab
- Magic tab
- Tenure
- Region
- Category
- Plan
- Model
- Quantity
- Purchase
- Confirmation
- Success message
- Purchased item/details

---

## 12. Excel-Driven Test Data

Study the existing Excel-based login data implementation.

Then design purchase test data in the **same style**.

The Excel structure should support data such as:

| Execute | TC_ID | Module | Partner | Tenure | Region | Category | Plan | Model | Quantity | Expected Result |
|---|---|---|---|---|---|---|---|---|---|---|

If different modules require different fields, design the data structure accordingly.

For example:

```text
Module = Desktop Perpetual
Module = Desktop Subscription
Module = Desktop Mandi
Module = Magic Subscription
```

The automation should read the appropriate row and execute the corresponding purchase flow.

---

## 13. Test Data Rules

Do not hardcode:

- Partner
- Tenure
- Region
- Category
- Plan
- Model
- Quantity

unless absolutely required.

Use the existing Excel/TestDataProvider architecture.

Also support:

### Positive data

- Valid partner
- Valid tenure
- Valid region
- Valid category
- Valid plan
- Valid model
- Valid quantity

### Negative data

- Invalid quantity
- Quantity = 0
- Negative quantity
- Blank quantity
- Invalid combination
- Unsupported plan/model combination
- Missing mandatory fields

---

## 14. Purchase Verification

After clicking Purchase, do not stop at checking the button click.

Verify the actual purchase result.

Check as many applicable points as possible:

### UI Verification

- Success message
- Confirmation message
- Order/purchase details
- Product name
- Plan
- Model
- Quantity
- Tenure
- Region
- Category
- Price
- Total amount

### Business Verification

Verify that the purchased item actually appears in the partner's:

- Subscription list
- Perpetual list
- Magic list
- Relevant purchase/history section

depending on the module.

If the application provides a subscription ID, serial number, order ID, activation key, etc., verify it.

---

## 15. Important Business Validation

Investigate what happens when:

- Quantity is greater than available balance
- Partner has insufficient balance
- Plan/model combination is invalid
- Mandatory field is missing
- Quantity exceeds allowed limit
- User clicks Purchase multiple times
- Purchase request takes time
- API/network request fails
- Session expires during purchase
- User refreshes purchase page
- User navigates back
- Purchase succeeds but UI response is delayed

Document the actual application behavior.

---

## 16. Dialog/Popup Handling

Check for all dialogs/popups during purchase.

Examples:

- Confirmation dialog
- Insufficient balance
- Purchase confirmation
- Warning
- Error
- Success

Do not assume the text.

Capture the actual text displayed by the application.

Reuse the existing `DialogHelper` if it exists in the project.

---

## 17. New Tab / New Page Handling

Pay special attention to:

- Access CP
- Lock icon
- Partner dashboard
- Purchase
- Confirmation

If any action opens a new page/tab, correctly handle it using Playwright's page/event mechanisms.

Do not simply use arbitrary timeouts.

Use proper:

- `waitForEvent('page')`
- locator waits
- URL waits
- visibility checks
- network synchronization where appropriate

---

## 18. Test Cases to Generate

After exploration, generate comprehensive test cases.

Include:

### Functional

- Successful purchase
- Each module purchase
- Different plans
- Different models
- Different quantities
- Different regions
- Different categories
- Different tenures

### Negative

- Missing mandatory fields
- Invalid quantity
- Zero quantity
- Negative quantity
- Invalid combination
- Insufficient balance
- Invalid partner
- Expired session

### Boundary

- Minimum quantity
- Maximum quantity
- Maximum allowed purchase
- Maximum tenure
- Minimum tenure

### UI

- Button state
- Dropdown behavior
- Validation messages
- Loading state
- Confirmation popup
- Success message
- Error message

### Integration

- Purchase → subscription created
- Purchase → balance updated
- Purchase → subscription list updated
- Purchase → relevant product appears
- Purchase → correct quantity reflected

### Regression

Verify that purchase of one product does not incorrectly affect other modules.

---

## 19. QA Questions / Product Questions

While exploring, identify requirements that are unclear.

Create a separate section:

## Questions to Ask Product Manager

Examples:

- What is the minimum and maximum quantity?
- Can quantity be greater than partner balance?
- What happens if balance becomes insufficient during purchase?
- Can the same plan/model be purchased multiple times?
- Are duplicate purchases allowed?
- Are there module-specific purchase limits?
- Which combinations of region/category/plan/model are valid?
- Is tenure configurable?
- Is pricing calculated on frontend or backend?
- What happens if Purchase is clicked twice?
- Is purchase idempotent?
- What happens if balance deduction succeeds but UI fails?
- Can a failed purchase be retried?
- What happens after page refresh?
- What happens if the browser is closed during purchase?
- Is there a rollback mechanism?
- What information should be verified after purchase?

Add all questions discovered from actual exploration.

---

## 20. Automation Architecture

After understanding the project, implement the purchase automation according to the existing architecture.

Prefer something similar to:

```text
tests/
    subscription/
        desktopPerpetual.spec.js
        desktopSubscription.spec.js
        desktopMandi.spec.js
        magicSubscription.spec.js

pages/
    PartnerPage.js
    PartnerDashboardPage.js
    SubscriptionPurchasePage.js
    PerpetualPurchasePage.js
    MagicPurchasePage.js

providers/
    TestDataProvider.js

utils/
    excelReader.js
    logger.js
    waitHelper.js

factories/
    SubscriptionFactory.js
```

**IMPORTANT:**

This is only an example.

Use my existing project architecture first.

If equivalent files already exist, reuse them instead of creating duplicates.

---

## 21. Reusable Purchase Page Object

Create reusable methods wherever appropriate.

For example:

```javascript
loginAsAdmin()

openMenu()

openPartner()

selectPartnerOnly()

searchPartner()

accessPartner()

openPurchaseModule()

selectTenure()

selectRegion()

selectCategory()

selectPlan()

selectModel()

enterQuantity()

clickPurchase()

handlePurchaseConfirmation()

verifyPurchaseSuccess()

verifyPurchasedProduct()
```

Do not blindly use these exact method names if my project follows another naming convention.

Follow the existing project's conventions.

---

## 22. Avoid Hard Waits

Do NOT use:

```javascript
page.waitForTimeout(5000)
```

unless there is a genuine application-specific reason.

Prefer:

```javascript
await expect(locator).toBeVisible();

await locator.waitFor();

await page.waitForURL();

await page.waitForEvent();

await expect(locator).toHaveText();
```

Use reliable synchronization.

---

## 23. Assertions

Every important step should have an assertion.

Do not create automation that only performs clicks.

For example:

```text
Login
→ Assert dashboard

Partner navigation
→ Assert partner page

Partner search
→ Assert partner exists

Access CP
→ Assert partner dashboard

Purchase module
→ Assert correct purchase page

Configuration
→ Assert selected values

Purchase
→ Assert confirmation/success

Post purchase
→ Assert purchased item exists
```

Reuse my existing `BaseAssertions` if available.

---

## 24. Logging

Use the project's existing logger.

Log important business actions:

```text
Login successful
Partner selected
Partner accessed
Purchase module opened
Tenure selected
Region selected
Category selected
Plan selected
Model selected
Quantity entered
Purchase initiated
Purchase confirmation received
Purchase successful
Purchase verification completed
```

Do not expose passwords in logs.

---

## 25. Screenshots

Use the existing screenshot utility if available.

Capture screenshots for:

- Purchase page
- Validation failure
- Confirmation
- Success
- Failure

Especially capture screenshots automatically when a test fails.

---

## 26. Reports

Use the existing Playwright/Allure/reporting mechanism already present in the project.

Do not introduce a new reporting framework unless required.

---

## 27. Final Deliverables

After exploration and implementation, provide:

### A. Project Understanding

Explain:

- Existing architecture
- Existing login mechanism
- Existing Excel data mechanism
- Existing authentication/storage state
- Existing reusable utilities

### B. Purchase Journey

Document the exact real-world flow for:

1. Desktop Perpetual
2. Desktop Subscription
3. Desktop Mandi
4. Magic Subscription

### C. Page/Screen List

Document every page involved.

### D. Locator Map

Document important locators.

### E. Excel Test Data Structure

Explain how purchase data should be maintained.

### F. Test Cases

Generate comprehensive positive, negative, boundary, UI, integration, and regression cases.

### G. Product Questions

List all ambiguities/edge cases that should be discussed with Product.

### H. Automation Implementation

Create/update the required Playwright files following the existing architecture.

### I. Execution Commands

#### Single test

```bash
npx playwright test <test-file>
```

#### Complete purchase module

```bash
npx playwright test tests/<purchase-folder>
```

#### Headed

```bash
npx playwright test <test-file> --headed
```

#### Report

Use the existing project's configured report command.

---

## 28. VERY IMPORTANT RULES

1. **First inspect my complete project.**
2. **Then understand the existing login automation.**
3. **Then understand the existing Excel/test-data framework.**
4. **Then explore the purchase module manually.**
5. **Do not assume UI behavior.**
6. **Do not assume dropdown values.**
7. **Do not assume URLs.**
8. **Do not assume button text.**
9. **Use actual application behavior.**
10. **Do not unnecessarily change existing files.**
11. **Reuse existing utilities and Page Objects.**
12. **Do not duplicate existing functionality.**
13. **Use Excel-driven test data like the login module.**
14. **Do not hardcode credentials inside test files.**
15. **Use `.env`/existing credential mechanism where available.**
16. **Do not log passwords.**
17. **Do not use unnecessary `waitForTimeout()`.**
18. **Use proper Playwright synchronization.**
19. **Add assertions at every important business step.**
20. **Verify the actual purchase after clicking Purchase.**
21. **Test all four modules independently.**
22. **Identify edge cases and product ambiguities.**
23. **Do not modify the framework architecture unless genuinely required.**
24. **If you need to make an architectural change, explain the reason before implementing it.**
25. **Run the generated tests and fix failures before considering the task complete.**

---

## 29. Final Objective

The final result should be an **enterprise-level, maintainable, data-driven Playwright automation solution** for:

```text
Admin Login
    ↓
Partner Management
    ↓
Access Partner
    ↓
Partner Dashboard
    ↓
Desktop Perpetual Purchase
Desktop Subscription Purchase
Desktop Mandi Purchase
Magic Subscription Purchase
    ↓
Purchase Confirmation
    ↓
Purchase Success
    ↓
Post-Purchase Verification
```

The automation must be:

- Maintainable
- Reusable
- Data-driven
- Page Object based
- Assertion driven
- Properly synchronized
- Easy to extend
- Compatible with my existing framework
- Suitable for regression testing

**Start by inspecting the project folder and existing login/Excel implementation. Do not start coding the purchase module until you understand the existing architecture and data flow.**

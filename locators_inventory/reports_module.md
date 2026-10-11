# Reports Module - Enterprise Locator Inventory

This document details all stable locators discovered and implemented for the **Reports Module** across the application (`https://hiqa2.pooraa.net/`).

---

## 1. Navigation & Menu Locators

| Element | Type | Preferred Locator | Strategy | Stability | Notes |
|---------|------|-------------------|----------|-----------|-------|
| Side Menu Button | Button | `page.getByRole('button', { name: 'menu' })` | Accessible Role | High | Main hamburger menu toggle |
| Banner Menu Button | Button | `page.getByRole('banner').getByRole('button', { name: 'menu' })` | Scoped Role | High | Top banner menu button |
| Reports Section Accordion | Text / Button | `page.getByText('bar_chartReport').or(page.locator('text=/bar_chart\\s*Report/i'))` | Text + Icon | High | Expands reports sub-menu |
| Side Navigation Drawer | Container | `page.locator('.MuiDrawer-root, .MuiDrawer-paper')` | CSS Class | High | Material UI Drawer container |

---

## 2. All 25 Admin Reports Navigation Links

| Report Name | Route | Preferred Playwright Locator | Strategy |
|-------------|-------|------------------------------|----------|
| AC Stock | `/busy/report/acStock` | `page.locator('a[href*="/report/acStock"]')` | Href Pattern |
| App Penetration | `/busy/report/penetrationLevel` | `page.locator('a[href*="/report/penetrationLevel"]')` | Href Pattern |
| Blocked Licenses | `/busy/report/blockedlicence` | `page.locator('a[href*="/report/blockedlicence"]')` | Href Pattern |
| BLS Expiry | `/busy/report/blsexpiry` | `page.locator('a[href*="/report/blsexpiry"]')` | Href Pattern |
| Busy Online Report | `/busy/report/boreport` | `page.locator('a[href*="/report/boreport"]')` | Href Pattern |
| Cancellation And Reversal | `/busy/report/cancellationandreversal` | `page.locator('a[href*="/report/cancellationandreversal"]')` | Href Pattern |
| Customer List | `/busy/report/customerlist` | `page.locator('a[href*="/report/customerlist"]')` | Href Pattern |
| List of Clusters | `/busy/report/listofclusters` | `page.locator('a[href*="/report/listofclusters"]')` | Href Pattern |
| Mobile LITE Usage | `/busy/report/mobileapplite` | `page.locator('a[href*="/report/mobileapplite"]')` | Href Pattern |
| Partners Renewal Rate Report | `/report/renewalRate` | `page.locator('a[href*="/report/renewalRate"]')` | Href Pattern |
| RDP License Report | `/busy/report/rdpLicense` | `page.locator('a[href*="/report/rdpLicense"]')` | Href Pattern |
| Renewal & Upgrade | `/busy/report/renewalsandupgrade` | `page.locator('a[href*="/report/renewalsandupgrade"]')` | Href Pattern |
| Referral Lead Report | `/busy/report/referrallead` | `page.locator('a[href*="/report/referrallead"]')` | Href Pattern |
| Reseller | `/busy/report/reportresellers` | `page.locator('a[href*="/report/reportresellers"]')` | Href Pattern |
| Sales Promotion | `/report/salespromotion` | `page.locator('a[href*="/report/salespromotion"]')` | Href Pattern |
| Subscription History | `/busy/report/desktopSubscription` | `page.locator('a[href*="/report/desktopSubscription"]')` | Href Pattern |
| Subscription List | `/report/paidsubscriptions` | `page.locator('a[href*="/report/paidsubscriptions"]')` | Href Pattern |
| Subscription Status | `/busy/report/subscriptionStatus` | `page.locator('a[href*="/report/subscriptionStatus"]')` | Href Pattern |
| Mazu Transaction Report | `/report/mazuTransaction` | `page.locator('a[href*="/report/mazuTransaction"]')` | Href Pattern |
| Recurring Payments | `/report/recurringPayments` | `page.locator('a[href*="/report/recurringPayments"]')` | Href Pattern |
| Suspicious License Activation | `/busy/report/suspiciousActivation` | `page.locator('a[href*="/report/suspiciousActivation"]')` | Href Pattern |
| Transfer License | `/busy/report/transferlicence` | `page.locator('a[href*="/report/transferlicence"]')` | Href Pattern |
| Unused Serial No | `/busy/report/unusedserialno` | `page.locator('a[href*="/report/unusedserialno"]')` | Href Pattern |
| Version 17 & 18 Report | `/busy/report/ver1718Sub` | `page.locator('a[href*="/report/ver1718Sub"]')` | Href Pattern |
| Recom Order Consumption | `/busy/report/recomorderconsumption` | `page.locator('a[href*="/report/recomorderconsumption"]')` | Href Pattern |
| Central Downloads Queue | `/busy/report/download` | `page.locator('a[href*="/report/download"]')` | Href Pattern |

---

## 3. Common Form & Filter Controls

| Control | Preferred Locator | Strategy | Fallback |
|---------|-------------------|----------|----------|
| Submit Button | `page.getByRole('button', { name: 'Submit' })` | Accessible Role | `page.locator('button[type="submit"]')` |
| Search Button | `page.getByRole('button', { name: 'Search' })` | Accessible Role | `page.locator('button:has(.material-icons:has-text("search"))')` |
| Date Picker Button | `page.locator('button:has(.material-icons:has-text("date_range"))')` | Icon / Attribute | `page.locator('[aria-label*="date" i]')` |
| Calendar Day Button | `page.getByRole('button', { name: String(day), exact: true })` | Role + Exact Name | Scoped `.MuiPickersCalendar-root button` |
| Search Input Field | `page.locator('input[placeholder*="Search" i], input[placeholder*="Subscription ID" i]')` | Placeholder | `page.locator('input[type="text"]').first()` |
| Dropdowns | `page.locator('select, [role="combobox"]')` | Element / Role | Tag-based selectOption or click option |

---

## 4. Central Downloads Page (`/busy/report/download`)

| Element | Preferred Locator | Notes |
|---------|-------------------|-------|
| Refresh Button | `page.getByRole('button', { name: 'Select' }).or(page.getByTitle('Refresh'))` | Refreshes download job statuses |
| Queue Rows | `page.locator('div[role="row"]')` | Index 0 is Header; Index 1 is Latest Job |
| Row Status Text | `firstRow.innerText()` | Contains "Created", "In Process", "Processed", or "Error / Failed" |
| Row Download Button | `firstRow.locator('button', { hasText: 'Download' })` | Download button strictly scoped to the target row |

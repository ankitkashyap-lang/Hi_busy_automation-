# Comprehensive Enterprise Test Cases — Analytics: New Activations Report

**Application URL:** `https://hiqa1.pooraa.net/`  
**Environment:** QA1  
**Module:** Analytics  
**Report:** New Activations (`/partner/analytics/newactivations`)  
**Role:** Admin (`ankit.kashyap@tech.busy.in`)  
**Channel Partner Tested:** 3M Infocare  

---

## 1. Executive Summary & UI Blueprint

The **New Activations** report is a core business analytics module providing real-time intelligence into newly activated software licenses and subscriptions across partner networks.

### Discovered Navigation & UI Architecture
* **Navigation Path:** `Login` → `Menu` → `Partner` → Search & Access `3M Infocare` → `Menu` → `Analytics` → `New Activations`
* **Direct URL:** `/partner/analytics/newactivations?tab=0&product=desktop`
* **Supported Products (5 Tabs):**
  1. `Desktop` (`.tab0`, `product=desktop`)
     * **Desktop Sub-Variations (Dropdown):** `All`, `Busy 21`, `Mandi`, `Magic`
  2. `Online` (`.tab1`, `product=online`)
  3. `Mobile` (`.tab2`, `product=mobile`)
  4. `Recom` (`.tab3`, `product=recom`)
  5. `mazu` (`.tab4`, `product=mazu`)
* **KPI Metrics Summary Cards:**
  * Total New Activations count & Revenue (e.g. `45 | ₹640K`)
  * `In Cluster`: count & percentage (e.g. `42 (93%)`)
  * `Out Of Cluster`: count & percentage (e.g. `3 (7%)`)
  * `Installed By Self`: count & percentage (e.g. `38 (84%)`)
  * `By Reseller`: count & percentage (e.g. `7 (16%)`)
  * Category badges: `REG`, `CA`, `ACC`, `TP`, `FOC`
* **Filters & Selectors:**
  * `timePeriod` (Autocomplete): `This Month` (default), `Last Month`, `Month Range`
  * `startMonth` & `endMonth`: Dynamic text inputs appearing upon `Month Range` selection
  * `status` (Autocomplete): `All` (default), `Active`, `Expired`, `Disabled`, `Cancelled`
  * `installedBy` (Autocomplete): `All` (default), `3M Infocare`, `EWAY HM`, etc.
  * Desktop Busy 21 dynamic filters: `model`, `version` (edition), `version` (user: SU/DU/MU/CS), `city`, `category`
* **Data Grid Table (8 Columns):**
  1. `Serial No.`
  2. `Install Date`
  3. `Due Date`
  4. `Model & Version`
  5. `Plan`
  6. `Installed by`
  7. `Company & City`
  8. `Subs Status`
* **Download & Central Queue Processing:**
  * Button: `button[title="Download Excel"]`
  * Generates queue job `Activation Subscription` in `/partner/report/download`
  * File format: `.xlsx`, Sheet: `Sheet1`
  * Filename format: `Activation Subs_<Product>_<FromDate>_<ToDate>_<PartnerId>_<Timestamp>.xlsx`
  * Row 0: Metadata `["From", "<date>", "To", "<date>"]`
  * Row 1: All 22 required column headers

---

## 2. Test Cases Inventory

| TC_ID | Module | Report | Test Scenario | Precondition | Test Steps | Test Data | Product | Filters | Expected Result | Priority | Test Type | Automation Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **TC-NA-NAV-01** | Analytics | New Activations | Verify direct navigation & URL of New Activations | Partner accessed | 1. Navigate to `/partner/analytics/newactivations`<br>2. Verify URL and page load | Default partner | Desktop | Default | URL contains `/partner/analytics/newactivations`, page title 'New Activations' visible | P0 | Functional / Nav | Automated |
| **TC-NA-NAV-02** | Analytics | New Activations | Verify page title and header elements | Partner accessed | 1. Inspect header<br>2. Verify title text and partner user info | N/A | Desktop | Default | Page displays 'New Activations' and back navigation button | P1 | UI / Visual | Automated |
| **TC-NA-NAV-03** | Analytics | New Activations | Verify back navigation arrow returns to Partner Dashboard | On New Activations page | 1. Click back arrow button (`button[aria-label="create"]`)<br>2. Check resulting URL | N/A | Desktop | N/A | Browser navigates to `/partner/dashboard` smoothly | P1 | Navigation | Automated |
| **TC-NA-UI-01** | Analytics | New Activations | Verify all 5 product tabs are rendered correctly | On New Activations page | 1. Inspect tab bar<br>2. Verify Desktop, Online, Mobile, Recom, mazu | N/A | All | N/A | All 5 product tabs are visible, styled, and clickable | P1 | UI / UX | Automated |
| **TC-NA-UI-02** | Analytics | New Activations | Verify KPI Summary Cards and metrics rendering | On New Activations page | 1. Inspect top KPI metric cards<br>2. Extract counts and percentages | N/A | Desktop | Default | Cards display New Activations count, revenue, In Cluster, Out Of Cluster, Self, Reseller | P1 | UI / Data | Automated |
| **TC-NA-UI-03** | Analytics | New Activations | Verify Category breakdown badges (REG, CA, ACC, TP, FOC) | On New Activations page | 1. Inspect category badges container<br>2. Verify individual badge labels | N/A | Desktop | Default | Badges REG, CA, ACC, TP, FOC are visible with valid numerical counts | P2 | UI / Visual | Automated |
| **TC-NA-UI-04** | Analytics | New Activations | Verify Data Grid 8 columns structure | On New Activations page | 1. Inspect table headers<br>2. Match against expected 8 UI columns | N/A | Desktop | Default | Table displays Serial No., Install Date, Due Date, Model & Version, Plan, Installed by, Company & City, Subs Status | P1 | UI / Grid | Automated |
| **TC-NA-UI-05** | Analytics | New Activations | Verify Download Excel button presence and tooltip | On New Activations page | 1. Locate download icon button<br>2. Check `title="Download Excel"` attribute | N/A | Desktop | Default | Download button is enabled and displays title 'Download Excel' | P1 | UI / Controls | Automated |
| **TC-NA-PROD-01** | Analytics | New Activations | Default product is Desktop with Variation 'All' | Page loaded | 1. Verify URL has `product=desktop`<br>2. Inspect variation dropdown | N/A | Desktop | All | Default tab is Desktop (`.tab0`), dropdown value is 'All' | P0 | Product / Functional | Automated |
| **TC-NA-PROD-02** | Analytics | New Activations | Select Desktop Variation 'Busy 21' and verify dynamic filters | On Desktop tab | 1. Select 'Busy 21' from dropdown<br>2. Click 'Apply Filters'<br>3. Verify new filter inputs | Variation: Busy 21 | Desktop | Busy 21 | Dynamic filters (Model, Version, User, City, Installed By, Category) appear | P0 | Product / Dynamic UI | Automated |
| **TC-NA-PROD-03** | Analytics | New Activations | Select Desktop Variation 'Mandi' | On Desktop tab | 1. Select 'Mandi'<br>2. Click Apply Filters<br>3. Inspect grid | Variation: Mandi | Desktop | Mandi | Table and KPI metrics update to Mandi activation records | P1 | Product / Functional | Automated |
| **TC-NA-PROD-04** | Analytics | New Activations | Select Desktop Variation 'Magic' | On Desktop tab | 1. Select 'Magic'<br>2. Click Apply Filters<br>3. Inspect grid | Variation: Magic | Desktop | Magic | Table and metrics display Magic plan activation records | P1 | Product / Functional | Automated |
| **TC-NA-PROD-05** | Analytics | New Activations | Switch product to 'Online' (`tab=1&product=online`) | Page loaded | 1. Click Online tab or navigate to `product=online`<br>2. Inspect filters and grid | N/A | Online | Default | Online tab activates, displays Purchase By, No. of Companies, No. of Users filters, 8 rows | P0 | Product / Switching | Automated |
| **TC-NA-PROD-06** | Analytics | New Activations | Switch product to 'Mobile' (`tab=2&product=mobile`) | Page loaded | 1. Switch to Mobile tab<br>2. Inspect grid | N/A | Mobile | Default | Mobile tab loads, shows Activation Count filter, empty state handled | P1 | Product / Switching | Automated |
| **TC-NA-PROD-07** | Analytics | New Activations | Switch product to 'Recom' (`tab=3&product=recom`) | Page loaded | 1. Switch to Recom tab<br>2. Inspect grid | N/A | Recom | Default | Recom tab loads, shows Marketplace & Order filters | P1 | Product / Switching | Automated |
| **TC-NA-PROD-08** | Analytics | New Activations | Switch product to 'mazu' (`tab=4&product=mazu`) | Page loaded | 1. Switch to mazu tab<br>2. Inspect grid | N/A | mazu | Default | mazu tab loads, displays 3 active rows and metrics | P1 | Product / Switching | Automated |
| **TC-NA-PROD-09** | Analytics | New Activations | Sequential multi-product tab switching stability | Page loaded | 1. Switch Desktop → Online → Mobile → Recom → mazu → Desktop<br>2. Verify no crash | All tabs | All | Default | All product transitions succeed without console errors or page breakage | P2 | Stability / UI | Automated |
| **TC-NA-FLT-01** | Analytics | New Activations | Filter by Time Period: 'This Month' | On New Activations | 1. Select 'This Month' in timePeriod<br>2. Click Apply Filters | Time: This Month | Desktop | Busy 21 | Table updates to activations installed within current month | P0 | Filter / Functional | Automated |
| **TC-NA-FLT-02** | Analytics | New Activations | Filter by Time Period: 'Last Month' | On New Activations | 1. Select 'Last Month' in timePeriod<br>2. Click Apply Filters | Time: Last Month | Desktop | Busy 21 | Table updates to activations installed in previous month | P1 | Filter / Functional | Automated |
| **TC-NA-FLT-03** | Analytics | New Activations | Dynamic Month Range filter selection | On New Activations | 1. Select 'Month Range'<br>2. Verify startMonth & endMonth appear<br>3. Apply Filters | Range: Sep-26 to Sep-26 | Desktop | Busy 21 | startMonth and endMonth inputs appear dynamically, filter applies successfully | P1 | Dynamic Filter | Automated |
| **TC-NA-FLT-04** | Analytics | New Activations | Filter by Subs Status: 'Active' | On New Activations | 1. Select status: 'Active'<br>2. Click Apply Filters | Status: Active | Desktop | Busy 21 | Table shows only subscriptions with status 'Active' | P0 | Filter / Data | Automated |
| **TC-NA-FLT-05** | Analytics | New Activations | Filter by Subs Status: 'Cancelled' | On New Activations | 1. Select status: 'Cancelled'<br>2. Click Apply Filters | Status: Cancelled | Desktop | Busy 21 | Table shows only subscriptions with status 'Cancelled' | P1 | Filter / Data | Automated |
| **TC-NA-FLT-06** | Analytics | New Activations | Filter by Installed By: Partner Self ('3M Infocare') | On New Activations | 1. Select installedBy: '3M Infocare'<br>2. Click Apply Filters | InstalledBy: 3M Infocare | Desktop | Busy 21 | Table shows only subscriptions installed by 3M Infocare | P1 | Filter / Data | Automated |
| **TC-NA-FLT-07** | Analytics | New Activations | Filter by Installed By: Reseller ('EWAY HM') | On New Activations | 1. Select installedBy: 'EWAY HM'<br>2. Click Apply Filters | InstalledBy: EWAY HM | Desktop | Busy 21 | Table shows only subscriptions installed by reseller EWAY HM | P1 | Filter / Data | Automated |
| **TC-NA-FLT-08** | Analytics | New Activations | Combined Multi-filter: Busy 21 + Active + 3M Infocare | On New Activations | 1. Set Status='Active'<br>2. Set InstalledBy='3M Infocare'<br>3. Click Apply Filters | Combined criteria | Desktop | Multi | Table displays intersecting records matching all criteria | P1 | Filter Combination | Automated |
| **TC-NA-DL-01** | Analytics | New Activations | Download Default/Busy 21 Report and Validate File Basics | On New Activations | 1. Select Busy 21<br>2. Click 'Download Excel'<br>3. Process queue & download file<br>4. Validate basics | Default filters | Desktop | Busy 21 | File exists, size > 1KB, extension .xlsx, filename matches `Activation Subs_*.xlsx` | P0 | Download / Basics | Automated |
| **TC-NA-DL-02** | Analytics | New Activations | Download Filtered Report (Subs Status: Cancelled) | On New Activations | 1. Set Status='Cancelled'<br>2. Click Apply Filters<br>3. Download and validate | Status: Cancelled | Desktop | Busy 21 | Downloaded file generated successfully, contains Cancelled subscriptions | P1 | Download / Filter | Automated |
| **TC-NA-DL-03** | Analytics | New Activations | Download Filtered Report (Installed By: EWAY HM) | On New Activations | 1. Set InstalledBy='EWAY HM'<br>2. Click Apply Filters<br>3. Download and validate | InstalledBy: EWAY HM | Desktop | Busy 21 | Downloaded file generated successfully, records reflect reseller activations | P1 | Download / Filter | Automated |
| **TC-NA-DL-04** | Analytics | New Activations | Download Online Product New Activations Report | On Online tab | 1. Navigate to Online tab<br>2. Click Download Excel<br>3. Process & download | Online product | Online | Default | Downloaded file generated with Online activation subscriptions | P1 | Download / Product | Automated |
| **TC-NA-CONT-01** | Analytics | New Activations | Validate Excel Date Metadata (Row 0: From, To) | Downloaded file | 1. Parse Excel Sheet1 Row 0<br>2. Check for 'From' and 'To' labels and dates | Downloaded file | Desktop | Busy 21 | Row 0 contains 'From', start date, 'To', end date | P0 | Data Validation | Automated |
| **TC-NA-CONT-02** | Analytics | New Activations | Validate All 22 Column Headers in Row 1 | Downloaded file | 1. Parse Excel Sheet1 Row 1<br>2. Compare with 22 required headers | Downloaded file | Desktop | Busy 21 | All 22 required headers exist in exact expected nomenclature | P0 | Schema Validation | Automated |
| **TC-NA-CONT-03** | Analytics | New Activations | Validate Data Rows Integrity & Non-Empty Serial Numbers | Downloaded file | 1. Inspect data rows (Row 2+)<br>2. Verify Serial No, Subscription No, Status | Downloaded file | Desktop | Busy 21 | Data rows contain non-empty Serial Numbers, valid dates, no workbook corruption | P0 | Content Validation | Automated |
| **TC-NA-CONT-04** | Analytics | New Activations | UI vs Download Data Consistency Comparison | Report open & file | 1. Scrape UI table records<br>2. Compare sample serial numbers with Excel | UI & Excel | Desktop | Busy 21 | Serial numbers and statuses in UI table are present in downloaded Excel | P1 | Data Comparison | Automated |
| **TC-NA-EMP-01** | Analytics | New Activations | Empty state handling for 0-record filter combinations | On New Activations | 1. Select zero-match filter (e.g. City: Birgunj)<br>2. Click Apply Filters<br>3. Verify table & metrics | City: Birgunj | Desktop | Busy 21 | Table displays empty state / 0 rows; metrics do not show NaN, null, or undefined | P1 | Negative / Empty State | Automated |
| **TC-NA-EMP-02** | Analytics | New Activations | Filter recovery from empty state back to populated state | In empty state | 1. Reset City filter back to 'All'<br>2. Click Apply Filters<br>3. Verify table repopulates | City: All | Desktop | Busy 21 | Grid repopulates with active records, total count > 0 | P2 | Recovery | Automated |
| **TC-NA-NEG-01** | Analytics | New Activations | Rapid multiple clicks on Apply Filters button (Debounce test) | On New Activations | 1. Click Apply Filters 4 times in rapid succession<br>2. Verify stability | Rapid clicks | Desktop | Default | UI does not throw uncaught error; remains responsive and stable | P2 | Negative / Debounce | Automated |
| **TC-NA-NEG-02** | Analytics | New Activations | Page Refresh (F5) resilience with session preservation | Report filtered | 1. Set filter to 'Active'<br>2. Reload page (F5)<br>3. Verify page loads cleanly | Reload | Desktop | Busy 21 | Page reloads cleanly without authentication loss or broken state | P2 | Resilience | Automated |
| **TC-NA-NEG-03** | Analytics | New Activations | Special characters in filter input | On New Activations | 1. Enter `<script>alert(1)</script>` in filter input<br>2. Click Apply Filters | XSS payload | Desktop | Busy 21 | UI sanitizes input, no native alert dialog triggered, no crash | P2 | Security / Edge | Automated |
| **TC-NA-BUG-01** | Analytics | New Activations | Backend report queue failure when Desktop Variation is 'All' | On New Activations | 1. Keep default variation 'All'<br>2. Click Download Excel<br>3. Process queue | Variation: All | Desktop | All | **Identified Bug:** Backend marks job as `Error | Failed` instead of processing | P1 | Defect Verification | Automated |

---

## 3. Test Coverage Distribution

* **Total Test Cases:** 38
* **P0 (Critical):** 9
* **P1 (High):** 20
* **P2 (Medium):** 9
* **P3 (Low):** 0
* **By Test Type:**
  * Functional / Navigation: 7
  * UI / UX / Visual: 6
  * Product Coverage: 9
  * Filter & Dynamic UI: 8
  * Download Validation: 4
  * Data & Schema Validation: 4
  * Negative / Edge / Resilience: 4

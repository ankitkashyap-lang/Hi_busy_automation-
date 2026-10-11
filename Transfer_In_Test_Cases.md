# Comprehensive Enterprise Test Cases — Analytics: Transfer In Report

**Application URL:** `https://hiqa1.pooraa.net/`  
**Environment:** QA1  
**Module:** Analytics  
**Report:** Transfer In (`/partner/analytics/transferin`)  
**Role:** Admin (`ankit.kashyap@tech.busy.in`)  
**Channel Partner Tested:** 3M Infocare  

---

## 1. Executive Summary & UI Blueprint

The **Transfer In** report is a specialized partner analytics module tracking software licenses and subscriptions that have been transferred into the partner's account from other channel partners or sales branches.

### Discovered Navigation & UI Architecture
* **Navigation Path:** `Login` → `Menu` → `Partner` → Search & Access `3M Infocare` → `Menu` → `Analytics` → `Transfer In`
* **Direct URL:** `/partner/analytics/transferin`
* **Product Selection:**
  * Fixed / default product: `Busy 21` (disabled dropdown `<select disabled><option value="Busy 21">Busy 21</option></select>`)
  * URL query parameter resilience: `?product=online`, `?product=mobile`, `?product=recom`, `?product=mazu` loads gracefully without crash.
* **Filter Controls (8 Autocomplete Dropdowns):**
  1. `timePeriod` (Label: "Time Period", Default: `< 3 Months`): Options: `< 3 Months`, `4-6 Months`, `7-9 Months`, `9+ Months`
  2. `status` (Label: "Subs Status", Default: `All`): Options: `All`, `Active`, `Expired`, `Disabled`, `Cancelled`
  3. `transferredTo` (Label: "Transferred From", Default: `All`): Options: `All`, `Arihant Softwares And Services`, `Electroware Infotech Private Limited`, `Inside Sales (Delhi Office)`, `Inside Sales (IndiaMART Offer)`, `K. G. Softech Private Limited`, `Vision Softech`, `V K Software & Solutions`
  4. `model` (Label: "Model", Default: `All`): 39 model configurations (`Basic`, `Blue`, `Saffron`, `Standard`, `Enterprise`, `Emerald`, etc. with Single User, Multi User, Dual User)
  5. `version` [Index 0] (Label: "Version", Default: `All`): Options: `All`, `21`, `18`, `17`, `<= 16`
  6. `version` [Index 1] (Label: "User", Default: `All`): Options: `All`, `SU`, `DU`, `MU`, `CS`
  7. `city` (Label: "City", Default: `All`): Options: `All`, `Ahmedabad`, `Delhi`, `Faridabad`, `Ghaziabad`, `Gurgaon`, `New Delhi`
  8. `installedBy` (Label: "Installed By", Default: `All`): Options: `All`, `Arihant Softwares And Services`, `Compucraft Solutions & Services`, `Eazy ERP Technologies Pvt Ltd (Bhiwadi)`, `Effective Software Solutions`, `Inside Sales (Delhi Office)`, `Inside Sales (IndiaMART Offer)`, `K. G. Softech Private Limited`
* **Action Buttons:**
  * `Apply Filters` (Button)
  * `Download Excel` (`button:has(img[title="Download Excel"])`)
  * `Back` (`button[title="Back"]` / `button[aria-label="create"]`)
* **Data Grid Table (7 Columns):**
  1. `Serial No.`
  2. `Install Date` (with sorting toggle button `<button aria-label="menu">`)
  3. `Due Date`
  4. `Model & Version`
  5. `Transferred From`
  6. `Company & City`
  7. `Subs Status`
* **Download & Central Queue Processing:**
  * Button: `button:has(img[title="Download Excel"])`
  * Generates queue job `Transfer In Subscription` in `/partner/report/download`
  * File format: `.xlsx`, Sheet: `Sheet1`
  * Filename format: `Transfer In Subs_Busy 21_<FromDate>_<ToDate>_<PartnerId>_<Timestamp>.xlsx`
  * Row 0: Metadata `["From", "<date>", "To", "<date>"]`
  * Row 1: All 22 required column headers:
    `Serial No.`, `Subscription No.`, `Variation Name`, `Transfer From`, `Install Date`, `Due Date`, `Model`, `Version`, `Release Version`, `User`, `Company`, `City`, `Status`, `Installed By`, `Transfer From City`, `Category`, `Last Active Date`, `App/Recom`, `Total Subscriptions`, `Mobile`, `Cluster Name`, `Owner Partner`

---

## 2. Test Cases Inventory

| TC_ID | Module | Report | Test Scenario | Precondition | Test Steps | Test Data | Product | Filters | Expected Result | Priority | Test Type | Automation Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **TC-TI-NAV-01** | Analytics | Transfer In | Verify direct navigation & URL of Transfer In | Partner accessed | 1. Navigate to `/partner/analytics/transferin`<br>2. Verify URL and page load | Default partner | Busy 21 | Default | URL contains `/partner/analytics/transferin`, page loads successfully | P0 | Functional / Nav | Automated |
| **TC-TI-NAV-02** | Analytics | Transfer In | Verify page title and header elements | Partner accessed | 1. Inspect header<br>2. Verify title text 'Transfer In' | N/A | Busy 21 | Default | Page displays 'Transfer In' title and back navigation button | P1 | UI / Visual | Automated |
| **TC-TI-NAV-03** | Analytics | Transfer In | Verify back navigation arrow returns to Partner Dashboard | On Transfer In page | 1. Click back arrow button (`button[aria-label="create"]`)<br>2. Check resulting URL | N/A | Busy 21 | N/A | Browser navigates back to `/partner/dashboard` smoothly | P1 | Navigation | Automated |
| **TC-TI-UI-01** | Analytics | Transfer In | Verify Product selector dropdown state and value | On Transfer In page | 1. Inspect Product dropdown element<br>2. Verify default option and disabled attribute | N/A | Busy 21 | N/A | Product dropdown contains 'Busy 21' and is disabled | P1 | UI / Controls | Automated |
| **TC-TI-UI-02** | Analytics | Transfer In | Verify all 8 Autocomplete filter inputs are rendered | On Transfer In page | 1. Inspect filter container<br>2. Count autocomplete inputs and labels | N/A | Busy 21 | Default | 8 filter inputs (Time Period, Subs Status, Transferred From, Model, Version, User, City, Installed By) exist | P1 | UI / Controls | Automated |
| **TC-TI-UI-03** | Analytics | Transfer In | Verify Apply Filters button presence and enabled state | On Transfer In page | 1. Locate Apply Filters button<br>2. Check visibility and enabled status | N/A | Busy 21 | Default | 'Apply Filters' button is visible and enabled | P1 | UI / Controls | Automated |
| **TC-TI-UI-04** | Analytics | Transfer In | Verify Data Grid 7 columns structure | On Transfer In page | 1. Inspect table headers<br>2. Compare with expected 7 UI columns | N/A | Busy 21 | Default | Grid displays Serial No., Install Date, Due Date, Model & Version, Transferred From, Company & City, Subs Status | P1 | UI / Grid | Automated |
| **TC-TI-UI-05** | Analytics | Transfer In | Verify Download Excel button presence and tooltip | On Transfer In page | 1. Locate download icon button<br>2. Check `title="Download Excel"` attribute | N/A | Busy 21 | Default | Download button is enabled and displays title 'Download Excel' | P1 | UI / Controls | Automated |
| **TC-TI-UI-06** | Analytics | Transfer In | Verify Install Date column has sorting toggle button | On Transfer In page | 1. Inspect Install Date column header<br>2. Verify sort button with SVG exists | N/A | Busy 21 | Default | Sort button is present in Install Date column header | P2 | UI / Grid | Automated |
| **TC-TI-PROD-01** | Analytics | Transfer In | Product URL parameter handling (?product=online) | Page loaded | 1. Navigate to `/partner/analytics/transferin?product=online`<br>2. Verify page stability | Param: online | Online | Default | Page loads cleanly without crash or 404, handles parameter gracefully | P1 | Product / Query | Automated |
| **TC-TI-PROD-02** | Analytics | Transfer In | Product URL parameter handling (?product=mobile) | Page loaded | 1. Navigate to `/partner/analytics/transferin?product=mobile`<br>2. Verify page stability | Param: mobile | Mobile | Default | Page loads cleanly without crash or 404, handles parameter gracefully | P1 | Product / Query | Automated |
| **TC-TI-PROD-03** | Analytics | Transfer In | Product URL parameter handling (?product=recom) | Page loaded | 1. Navigate to `/partner/analytics/transferin?product=recom`<br>2. Verify page stability | Param: recom | Recom | Default | Page loads cleanly without crash or 404, handles parameter gracefully | P1 | Product / Query | Automated |
| **TC-TI-PROD-04** | Analytics | Transfer In | Product URL parameter handling (?product=mazu) | Page loaded | 1. Navigate to `/partner/analytics/transferin?product=mazu`<br>2. Verify page stability | Param: mazu | mazu | Default | Page loads cleanly without crash or 404, handles parameter gracefully | P1 | Product / Query | Automated |
| **TC-TI-FLT-01** | Analytics | Transfer In | Filter by Time Period: '< 3 Months' (Default) | On Transfer In | 1. Verify default value is '< 3 Months'<br>2. Apply filters and check table | Time: < 3 Months | Busy 21 | Default | Table displays records transferred within last 3 months | P0 | Filter / Functional | Automated |
| **TC-TI-FLT-02** | Analytics | Transfer In | Filter by Time Period: '4-6 Months' | On Transfer In | 1. Select '4-6 Months'<br>2. Click Apply Filters | Time: 4-6 Months | Busy 21 | 4-6 Months | Table updates to records within 4-6 months window | P1 | Filter / Functional | Automated |
| **TC-TI-FLT-03** | Analytics | Transfer In | Filter by Time Period: '7-9 Months' | On Transfer In | 1. Select '7-9 Months'<br>2. Click Apply Filters | Time: 7-9 Months | Busy 21 | 7-9 Months | Table updates to records within 7-9 months window | P1 | Filter / Functional | Automated |
| **TC-TI-FLT-04** | Analytics | Transfer In | Filter by Time Period: '9+ Months' | On Transfer In | 1. Select '9+ Months'<br>2. Click Apply Filters | Time: 9+ Months | Busy 21 | 9+ Months | Table updates to records transferred over 9 months ago | P1 | Filter / Functional | Automated |
| **TC-TI-FLT-05** | Analytics | Transfer In | Filter by Subs Status: 'Active' | On Transfer In | 1. Select Subs Status: 'Active'<br>2. Click Apply Filters | Status: Active | Busy 21 | Active | Table displays only records with Subs Status 'Active' | P0 | Filter / Data | Automated |
| **TC-TI-FLT-06** | Analytics | Transfer In | Filter by Subs Status: 'Expired' | On Transfer In | 1. Select Subs Status: 'Expired'<br>2. Click Apply Filters | Status: Expired | Busy 21 | Expired | Table displays expired subscriptions or empty state | P1 | Filter / Data | Automated |
| **TC-TI-FLT-07** | Analytics | Transfer In | Filter by Transferred From: 'Inside Sales (Delhi Office)' | On Transfer In | 1. Select 'Inside Sales (Delhi Office)'<br>2. Click Apply Filters | Transferred From | Busy 21 | Inside Sales | Table displays records transferred from Inside Sales (Delhi Office) | P1 | Filter / Data | Automated |
| **TC-TI-FLT-08** | Analytics | Transfer In | Filter by Transferred From: 'Vision Softech' | On Transfer In | 1. Select 'Vision Softech'<br>2. Click Apply Filters | Transferred From | Busy 21 | Vision Softech | Table updates to records transferred from Vision Softech | P1 | Filter / Data | Automated |
| **TC-TI-FLT-09** | Analytics | Transfer In | Filter by City: 'Faridabad' | On Transfer In | 1. Select City: 'Faridabad'<br>2. Click Apply Filters | City: Faridabad | Busy 21 | Faridabad | Table displays records located in Faridabad | P1 | Filter / Data | Automated |
| **TC-TI-FLT-10** | Analytics | Transfer In | Filter by City: 'Ahmedabad' | On Transfer In | 1. Select City: 'Ahmedabad'<br>2. Click Apply Filters | City: Ahmedabad | Busy 21 | Ahmedabad | Table displays single matching record for Ahmedabad | P1 | Filter / Data | Automated |
| **TC-TI-FLT-11** | Analytics | Transfer In | Combined Filter: Subs Status 'Active' + City 'Faridabad' | On Transfer In | 1. Set Status='Active'<br>2. Set City='Faridabad'<br>3. Click Apply Filters | Status+City | Busy 21 | Multi | Table displays intersecting records matching both criteria | P1 | Filter Combination | Automated |
| **TC-TI-FLT-12** | Analytics | Transfer In | Combined Filter: Time Period + Transferred From + Status | On Transfer In | 1. Set Time Period='< 3 Months'<br>2. Set Transferred From='Inside Sales (Delhi Office)'<br>3. Set Status='Active'<br>4. Click Apply Filters | Multi criteria | Busy 21 | Multi | Table displays precise subset matching all 3 filter criteria | P1 | Filter Combination | Automated |
| **TC-TI-SORT-01** | Analytics | Transfer In | Table Sorting by Install Date | On Transfer In | 1. Record first row serial & date<br>2. Click Install Date sort toggle button<br>3. Verify new row order | Sort toggle | Busy 21 | Default | Table records reorder in ascending / descending sequence by Install Date | P1 | Sorting / Grid | Automated |
| **TC-TI-DL-01** | Analytics | Transfer In | Download Default Report and Validate File Basics | On Transfer In | 1. Click 'Download Excel'<br>2. Capture queue job<br>3. Wait for Processed & download<br>4. Validate basics | Default filters | Busy 21 | Default | File exists, size > 1KB, extension .xlsx, filename matches `Transfer In Subs_Busy 21_*.xlsx` | P0 | Download / Basics | Automated |
| **TC-TI-DL-02** | Analytics | Transfer In | Download Filtered Report (City: Faridabad) | On Transfer In | 1. Set City='Faridabad'<br>2. Click Apply Filters<br>3. Download and validate | City: Faridabad | Busy 21 | Faridabad | Downloaded file generated successfully with Faridabad data | P1 | Download / Filter | Automated |
| **TC-TI-DL-03** | Analytics | Transfer In | Download Filtered Report (Transferred From: Vision Softech) | On Transfer In | 1. Set Transferred From='Vision Softech'<br>2. Click Apply Filters<br>3. Download and validate | Vision Softech | Busy 21 | Vision Softech | Downloaded file generated successfully matching Vision Softech | P1 | Download / Filter | Automated |
| **TC-TI-CONT-01** | Analytics | Transfer In | Validate Excel Date Metadata (Row 0: From, To) | Downloaded file | 1. Parse Excel Sheet1 Row 0<br>2. Verify 'From' and 'To' labels and dates | Downloaded file | Busy 21 | Default | Row 0 contains 'From', start date, 'To', end date | P0 | Data Validation | Automated |
| **TC-TI-CONT-02** | Analytics | Transfer In | Validate All 22 Column Headers in Row 1 | Downloaded file | 1. Parse Excel Sheet1 Row 1<br>2. Compare against all 22 expected headers | Downloaded file | Busy 21 | Default | All 22 required headers exist in exact expected nomenclature | P0 | Schema Validation | Automated |
| **TC-TI-CONT-03** | Analytics | Transfer In | Validate Excel Data Rows Integrity & Non-Empty Serials | Downloaded file | 1. Inspect data rows (Row 2+)<br>2. Verify Serial No, Subscription No, Status | Downloaded file | Busy 21 | Default | Data rows contain valid Serial Numbers, dates, no workbook corruption | P0 | Content Validation | Automated |
| **TC-TI-CONT-04** | Analytics | Transfer In | UI vs Download Data Consistency Comparison | Report open & file | 1. Scrape UI table records<br>2. Compare sample serial numbers with Excel | UI & Excel | Busy 21 | Default | Serial numbers and statuses in UI table are present in downloaded Excel | P1 | Data Comparison | Automated |
| **TC-TI-EMP-01** | Analytics | Transfer In | Empty state handling for 0-record filter combinations | On Transfer In | 1. Select zero-match filter (Transferred From: Arihant Softwares And Services)<br>2. Click Apply Filters<br>3. Verify table | Transferred From: Arihant | Busy 21 | Arihant | Table displays 0 rows / empty state cleanly without UI crash or error | P1 | Negative / Empty State | Automated |
| **TC-TI-EMP-02** | Analytics | Transfer In | Filter recovery from empty state back to populated state | In empty state | 1. Reset Transferred From back to 'All'<br>2. Click Apply Filters<br>3. Verify table repopulates | Transferred From: All | Busy 21 | All | Grid repopulates with active records, count > 0 | P2 | Recovery | Automated |
| **TC-TI-NEG-01** | Analytics | Transfer In | Rapid multiple clicks on Apply Filters button (Debounce test) | On Transfer In | 1. Click Apply Filters 4 times in rapid succession<br>2. Verify stability | Rapid clicks | Busy 21 | Default | UI does not throw uncaught error; remains responsive and stable | P2 | Negative / Debounce | Automated |
| **TC-TI-NEG-02** | Analytics | Transfer In | Page Refresh (F5) resilience with session preservation | Report filtered | 1. Set filter to 'Active'<br>2. Reload page (F5)<br>3. Verify page loads cleanly | Reload | Busy 21 | Active | Page reloads cleanly without authentication loss or broken state | P2 | Resilience | Automated |
| **TC-TI-NEG-03** | Analytics | Transfer In | Special characters in filter input | On Transfer In | 1. Enter `<script>alert(1)</script>` in filter input<br>2. Click Apply Filters | XSS payload | Busy 21 | Default | UI sanitizes input, no native alert dialog triggered, no crash | P2 | Security / Edge | Automated |

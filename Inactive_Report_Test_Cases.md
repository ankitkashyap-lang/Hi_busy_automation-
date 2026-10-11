# Inactive Report — Comprehensive Test Case Inventory

**Target Report:** Analytics → Inactive  
**Application URL:** `https://hiqa1.pooraa.net/partner/analytics/inactive`  
**Test Environment:** QA1 (`https://hiqa1.pooraa.net/`)  
**Channel Partner Tested:** 3M Infocare (`partner_id: 3269`)  
**Product Focus:** Busy 21 (`product_name: 11`)  
**Report Type Key:** `inactive_subscription`  
**Automated File Type:** Microsoft Excel (`.xlsx`)  

---

## 1. Test Suite Summary Metrics

| Priority | Count | Percentage |
|:---|:---:|:---:|
| **P0 (Critical)** | 14 | 41.2% |
| **P1 (High)** | 12 | 35.3% |
| **P2 (Medium)** | 8 | 23.5% |
| **P3 (Low)** | 0 | 0.0% |
| **Total Test Cases** | **34** | **100%** |

| Test Category | Count | Scope |
|:---|:---:|:---|
| **Navigation & UI** | 7 | Page load, headers, KPI summary cards, table columns, controls |
| **Product & Filters** | 15 | Busy 21, Days (30/90/180), Status, Model, Version, Architecture, City, Partner, Category |
| **Download & Queue** | 4 | Download button trigger, addJob API, queue polling, cron processing |
| **Excel Content Validation** | 4 | File existence, Row 0 metadata, Row 1 20 headers, data row count |
| **UI vs Download Consistency** | 2 | Matching UI serial numbers and records with Excel data rows |
| **Negative & Edge Cases** | 2 | Empty results state, boundary combinations, rapid filter clicks |

---

## 2. Complete Test Case Specifications

### Category A: Navigation & UI Verification (P0 - P2)

| TC_ID | Test Scenario | Precondition | Test Steps | Expected Result | Priority | Type |
|:---|:---|:---|:---|:---|:---:|:---:|
| **TC-INACT-NAV-01** | Direct URL Navigation to Inactive Report with Session Reuse | User authenticated | 1. Navigate to `/partner/analytics/inactive`<br>2. Wait for DOM content loaded | Page loads successfully without login prompt; URL matches `/partner/analytics/inactive` | P0 | Functional |
| **TC-INACT-NAV-02** | Header and Page Title Verification | On Inactive page | 1. Inspect page title<br>2. Check breadcrumb & heading | Title is "Hi Busy", page heading "Inactive" is visible | P1 | UI |
| **TC-INACT-NAV-03** | Product Selection Fixed to Busy 21 | On Inactive page | 1. Locate `<select>` element<br>2. Verify selected option and disabled state | Product select shows "Busy 21" and has `disabled` attribute | P1 | Functional |
| **TC-INACT-NAV-04** | KPI Metric Summary Cards Display | On Inactive page | 1. Inspect top KPI section<br>2. Read Inactive count, Total Subscriptions with Customer (0, >0), Version (21, 18) | All KPI metric cards display numeric counts $> 0$ | P0 | UI / Data |
| **TC-INACT-NAV-05** | Category Badge Breakdown Display | On Inactive page | 1. Locate category summary badges<br>2. Verify badges: REG, CA, ACC, TP, FOC | All 5 category breakdown badges are present with counts | P2 | UI |
| **TC-INACT-NAV-06** | UI Data Table Structure & 8 Column Headers | On Inactive page | 1. Locate table header row<br>2. Extract all 8 column headers | Exactly 8 headers match: `Serial No.`, `Install Date`, `Due Date`, `Last Active`, `Model & Version`, `Installed By`, `Company & City`, `Subs Status` | P0 | UI |
| **TC-INACT-NAV-07** | Data Rows Virtual Scroll Rendering | On Inactive page | 1. Inspect table rows container<br>2. Scrape visible data rows | Table contains rendered rows with serial numbers, dates, models, and status | P1 | Functional |

---

### Category B: Product & Filters Coverage (P0 - P1)

| TC_ID | Test Scenario | Precondition | Test Steps | Expected Result | Priority | Type |
|:---|:---|:---|:---|:---|:---:|:---:|
| **TC-INACT-FLT-01** | Filter by Days: 30 Days (Default) | On Inactive page | 1. Verify default days value is "30 Days"<br>2. Click Apply Filters | Filters applied, KPI card reflects 30 days inactive count | P0 | Filter |
| **TC-INACT-FLT-02** | Filter by Days: 90 Days | On Inactive page | 1. Select "90 Days" from `days` dropdown<br>2. Click Apply Filters | Filters applied successfully, metrics and table update | P1 | Filter |
| **TC-INACT-FLT-03** | Filter by Days: 180 Days | On Inactive page | 1. Select "180 Days" from `days` dropdown<br>2. Click Apply Filters | Filters applied successfully, metrics and table update | P1 | Filter |
| **TC-INACT-FLT-04** | Filter by Status: "Active" | On Inactive page | 1. Select "Active" from `status` dropdown<br>2. Click Apply Filters | UI table only displays Active status records | P1 | Filter |
| **TC-INACT-FLT-05** | Filter by Status: "Disabled" | On Inactive page | 1. Select "Disabled" from `status` dropdown<br>2. Click Apply Filters | UI table displays Disable/Disabled records | P1 | Filter |
| **TC-INACT-FLT-06** | Filter by Status: "Expired" | On Inactive page | 1. Select "Expired" from `status` dropdown<br>2. Click Apply Filters | UI table updates according to Expired criteria | P1 | Filter |
| **TC-INACT-FLT-07** | Filter by Model: "Basic - Single User" | On Inactive page | 1. Select "Basic - Single User"<br>2. Click Apply Filters | Table rows show Basic Single User models (BS) | P1 | Filter |
| **TC-INACT-FLT-08** | Filter by Model: "Standard - Single User" | On Inactive page | 1. Select "Standard - Single User"<br>2. Click Apply Filters | Table rows show Standard Single User models (SS) | P1 | Filter |
| **TC-INACT-FLT-09** | Filter by Release Version: "21" | On Inactive page | 1. Select "21" from first `version` dropdown<br>2. Click Apply Filters | Inactive records filtered for version 21 | P1 | Filter |
| **TC-INACT-FLT-10** | Filter by Release Version: "18" | On Inactive page | 1. Select "18" from first `version` dropdown<br>2. Click Apply Filters | Inactive records filtered for version 18 | P1 | Filter |
| **TC-INACT-FLT-11** | Filter by User Architecture: "SU" (Single User) | On Inactive page | 1. Select "SU" from second `version` dropdown<br>2. Click Apply Filters | Table displays single user records | P1 | Filter |
| **TC-INACT-FLT-12** | Filter by User Architecture: "MU" (Multi User) | On Inactive page | 1. Select "MU" from second `version` dropdown<br>2. Click Apply Filters | Table displays multi user records | P1 | Filter |
| **TC-INACT-FLT-13** | Filter by City: "Faridabad" | On Inactive page | 1. Select "Faridabad" from `city`<br>2. Click Apply Filters | All displayed rows have city "Faridabad" | P1 | Filter |
| **TC-INACT-FLT-14** | Filter by Installed By: Partner Self ("3M Infocare") | On Inactive page | 1. Select "3M Infocare"<br>2. Click Apply Filters | Records installed by 3M Infocare displayed | P1 | Filter |
| **TC-INACT-FLT-15** | Filter by Category: "Regular" | On Inactive page | 1. Select "Regular"<br>2. Click Apply Filters | Table reflects Regular category inactive subscriptions | P1 | Filter |
| **TC-INACT-FLT-16** | Combined Multi-Filter: 30 Days + Disabled + Faridabad | On Inactive page | 1. Set days="30 Days", status="Disabled", city="Faridabad"<br>2. Click Apply Filters | Compound filtering applied; UI data matches all 3 criteria | P0 | Filter |

---

### Category C: Download & Queue Automation (P0 - P1)

| TC_ID | Test Scenario | Precondition | Test Steps | Expected Result | Priority | Type |
|:---|:---|:---|:---|:---|:---:|:---:|
| **TC-INACT-DL-01** | Trigger Download Excel and Intercept addJob API | On Inactive page | 1. Click Download Excel icon<br>2. Capture network request | `POST /account/report/addJob` sent with `report_type_key: "inactive_subscription"`, `product_name: 11` | P0 | Download |
| **TC-INACT-DL-02** | Download Queue Redirection and Verification | Download triggered | 1. Observe popup / navigation<br>2. Inspect queue page | Queue page at `/partner/report/download` opens; top job shows "Inactive Subscription" | P0 | Download |
| **TC-INACT-DL-03** | Backend Cron Processing and Status Transition | In download queue | 1. Invoke cron processor API<br>2. Poll job status | Job status transitions from `In Process` to `Processed \| Download` | P0 | Download |
| **TC-INACT-DL-04** | Complete Excel Download Capture & Local Save | Status is Processed | 1. Click "Download" in row 1<br>2. Save file locally | File downloaded to `downloads/` directory with non-zero byte size | P0 | Download |

---

### Category D: Excel Content & Data Validation (P0 - P1)

| TC_ID | Test Scenario | Precondition | Test Steps | Expected Result | Priority | Type |
|:---|:---|:---|:---|:---|:---:|:---:|
| **TC-INACT-CONT-01** | Validate Excel Filename Pattern and Extension | File downloaded | 1. Check filename string<br>2. Check extension | Matches `/^Inactive\s+Subs_Busy\s*21_.*\.xlsx$/i` and extension is `.xlsx` | P0 | Validation |
| **TC-INACT-CONT-02** | Validate Excel Sheet Existence and Non-Empty | File downloaded | 1. Open with xlsx<br>2. Verify Sheet1 | Workbook opens cleanly, Sheet1 exists, total rows $\ge 2$ | P0 | Validation |
| **TC-INACT-CONT-03** | Validate Row 0 Date Metadata | Sheet1 loaded | 1. Inspect Row 0 cells | Cell 0 is `"As On Date:"` and Cell 1 is formatted date `"DD-MMM-YYYY"` | P0 | Validation |
| **TC-INACT-CONT-04** | Validate Row 1: All 20 Expected Column Headers | Sheet1 loaded | 1. Inspect Row 1 cells<br>2. Compare with expected 20 headers | All 20 exact headers present in expected sequence | P0 | Validation |
| **TC-INACT-CONT-05** | Validate Excel Data Rows Count Matches UI Metric | On Inactive page & Excel downloaded | 1. Read `Inactive <count>` from UI KPI card<br>2. Count Excel data rows | Exact match between UI KPI count and Excel data rows count | P0 | Data Validation |
| **TC-INACT-CONT-06** | UI vs Excel Data Consistency (Serial Numbers & Company) | Scraped UI rows & Excel | 1. Scrape top UI row serial numbers<br>2. Find matching serial numbers in Excel | Serial numbers, company name, city, and status match between UI and Excel | P1 | Data Validation |

---

### Category E: Negative, Boundary & Edge Cases (P1 - P2)

| TC_ID | Test Scenario | Precondition | Test Steps | Expected Result | Priority | Type |
|:---|:---|:---|:---|:---|:---:|:---:|
| **TC-INACT-EDGE-01** | Zero-Record Filter Combination Display & Empty State | On Inactive page | 1. Set days="180 Days", status="Active", category="FOC"<br>2. Click Apply Filters | KPI card shows `Inactive 0`, table displays 0 data rows, empty state handled cleanly | P1 | Negative / Edge |
| **TC-INACT-EDGE-02** | Re-selecting "All" Restores Full Dataset | Filters applied | 1. Change status and category back to "All"<br>2. Click Apply Filters | Full Inactive dataset ($>3000$ records) is restored in table and KPI | P1 | Functional |

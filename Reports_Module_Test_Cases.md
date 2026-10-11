# Comprehensive Enterprise Test Cases — Reports Module

**Application URL:** `https://hiqa2.pooraa.net/`  
**Environment:** QA2  
**Role:** Admin (`ankit.kashyap@tech.busy.in`)

---

## 1. Summary of Identified Reports

Under **Menu → Reports**, **25 distinct reports** plus the **Central Downloads Queue page** were identified:

1. **AC Stock** (`/busy/report/acStock`)
2. **App Penetration** (`/busy/report/penetrationLevel`)
3. **Blocked Licenses** (`/busy/report/blockedlicence`)
4. **BLS Expiry** (`/busy/report/blsexpiry`)
5. **Busy Online Report** (`/busy/report/boreport`)
6. **Cancellation And Reversal** (`/busy/report/cancellationandreversal`)
7. **Customer List** (`/busy/report/customerlist`)
8. **List of Clusters** (`/busy/report/listofclusters`)
9. **Mobile LITE Usage** (`/busy/report/mobileapplite`)
10. **Partners Renewal Rate Report** (`/report/renewalRate`)
11. **RDP License Report** (`/busy/report/rdpLicense`)
12. **Renewal & Upgrade** (`/busy/report/renewalsandupgrade`)
13. **Referral Lead Report** (`/busy/report/referrallead`)
14. **Reseller** (`/busy/report/reportresellers`)
15. **Sales Promotion** (`/report/salespromotion`)
16. **Subscription History** (`/busy/report/desktopSubscription`)
17. **Subscription List** (`/report/paidsubscriptions`)
18. **Subscription Status** (`/busy/report/subscriptionStatus`)
19. **Mazu Transaction Report** (`/report/mazuTransaction`)
20. **Recurring Payments** (`/report/recurringPayments`)
21. **Suspicious License Activation** (`/busy/report/suspiciousActivation`)
22. **Transfer License** (`/busy/report/transferlicence`)
23. **Unused Serial No** (`/busy/report/unusedserialno`)
24. **Version 17 & 18 Report** (`/busy/report/ver1718Sub`)
25. **Recom Order Consumption** (`/busy/report/recomorderconsumption`)
26. **Central Downloads Page** (`/busy/report/download`)

---

## 2. Test Cases Table

| TC ID | Report | Scenario | Preconditions | Steps | Test Data | Expected Result | Priority | Type |
|---|---|---|---|---|---|---|---|---|
| **TC-NAV-01** | All Reports | Verify Reports menu accordion and link accessibility | Admin logged in | 1. Open hamburger menu<br>2. Click on 'Report' accordion<br>3. Inspect all child links | Admin credentials | All 25 report links are visible, correctly labeled, and clickable | P1 | Navigation / UI |
| **TC-NAV-02** | Central Downloads | Verify Central Downloads page UI and headers | Admin logged in | 1. Navigate to `/busy/report/download`<br>2. Verify heading and table headers | N/A | Heading displays 'Downloads'. Table displays columns: Job Id, Report Name, Date & Time, Product, Requested By, Status, Download | P1 | UI / Functional |
| **TC-NAV-03** | AC Stock & BLS Expiry | Verify browser back/forward and refresh behavior | User on report page | 1. Open AC Stock<br>2. Reload page<br>3. Open BLS Expiry<br>4. Click browser Back | N/A | State preserved, URL matches, no blank screen or 404 error | P2 | Usability |
| **TC-DL-01** | AC Stock | In-page report generation and Excel download | Admin logged in | 1. Navigate to AC Stock<br>2. Click Submit<br>3. Click 'Download Excel'<br>4. Capture download | Default filters | File downloaded (`.xlsx`), size > 0, valid Excel sheet and non-empty rows | P1 | Download Validation |
| **TC-DL-02** | App Penetration | In-page report generation and Excel download | Admin logged in | 1. Navigate to App Penetration<br>2. Click Submit<br>3. Click 'Download Excel'<br>4. Save file | Default filters | File downloaded (`.xlsx`), size > 0, sheet contains header columns | P1 | Download Validation |
| **TC-DL-03** | List of Clusters | Direct click-to-queue report generation and download | Admin logged in | 1. Open List of Clusters<br>2. Click 'Download'<br>3. Open Downloads page<br>4. Wait for Processed<br>5. Click row Download | N/A | Generates job in queue, processes via cron, downloads valid `.xlsx` (38,000+ rows) | P1 | Download Validation |
| **TC-DL-04** | Blocked Licenses | Queue-based report generation and download | Admin logged in | 1. Open Blocked Licenses<br>2. Click Submit<br>3. Wait for popup/download queue<br>4. Poll status to Processed<br>5. Download | Default filters | Downloaded file matches `/blocked/i`, size > 0, verified valid Excel workbook | P1 | Download Validation |
| **TC-DL-05** | BLS Expiry | Queue-based report generation and download | Admin logged in | 1. Open BLS Expiry<br>2. Click Submit<br>3. Monitor Downloads queue<br>4. Download once Processed | Default filters | Downloaded file matches `/bls/i`, valid non-zero byte Excel file | P1 | Download Validation |
| **TC-DL-06** | Customer List | Date-range filtered report generation and download | Admin logged in | 1. Open Customer List<br>2. Select Date Range (1st to 15th)<br>3. Click Submit<br>4. Wait for queue processing<br>5. Download file | Date: 1-15 | File matches `/customer/i`, valid `.xlsx` content structure | P1 | Download Validation |
| **TC-DL-07** | Busy Online Report | Report generation with Sub-report & status filters | Admin logged in | 1. Open Busy Online Report<br>2. Select sub-report & status<br>3. Pick date range<br>4. Click Submit<br>5. Download | Status: All | File downloaded with `/online/i`, valid Excel structure | P1 | Download Validation |
| **TC-DL-08** | Unused Serial No | Date filtered unused serial report download | Admin logged in | 1. Open Unused Serial No<br>2. Set date range<br>3. Click Submit<br>4. Process and download | Date: Custom | File downloaded with `/unused/i`, size > 0 | P1 | Download Validation |
| **TC-DL-09** | Transfer License | Transfer license report generation and download | Admin logged in | 1. Open Transfer License<br>2. Click Submit<br>3. Wait for processing<br>4. Download | Default filters | File downloaded with `/transfer/i`, size > 0 | P1 | Download Validation |
| **TC-DL-10** | Reseller Report | Reseller activity report generation and download | Admin logged in | 1. Open Reseller<br>2. Click Submit<br>3. Monitor queue and download | Default filters | File downloaded with `/reseller/i`, valid Excel | P1 | Download Validation |
| **TC-DL-11** | Version 17 & 18 | Version upgrade report generation and download | Admin logged in | 1. Open Version 17 & 18<br>2. Click Submit<br>3. Download processed file | Default filters | File downloaded with `/17.*18/i`, valid Excel | P1 | Download Validation |
| **TC-DL-12** | Central Queue History | Direct download of previously processed report from history | Admin logged in | 1. Navigate to `/busy/report/download`<br>2. Find top processed row<br>3. Click Download button | Top row | Download triggers immediately, verified file exists, size > 0 | P1 | Regression / Download |
| **TC-FLT-01** | AC Stock | Verify filter combination (Partner Type + Time Period) | Report open | 1. Select 'Channel Partner'<br>2. Select 'Current Month'<br>3. Click Submit<br>4. Switch to 'Previous Month'<br>5. Click Submit | CP, Current/Prev Month | Table updates with column headers without page reload or crash | P1 | Functional / Filter |
| **TC-FLT-02** | Customer List | Verify interactive date picker selection | Report open | 1. Click calendar trigger<br>2. Select Day 1 and Day 20<br>3. Verify Submit button state | Start: 1, End: 20 | Date inputs populate correctly, Submit button enabled | P2 | Functional / Filter |
| **TC-NEG-01** | Subscription History | Search with invalid / non-existent Subscription ID | Report open | 1. Enter non-existent ID `NON_EXISTENT_SUB_ID_99999999`<br>2. Click Search | Non-existent string | System handles gracefully; no uncaught exceptions; displays empty state or no-result indication | P2 | Negative |
| **TC-NEG-02** | Suspicious Activation | Search without selecting required date range | Report open | 1. Navigate to Suspicious License Activation<br>2. Click Search without date range | Empty dates | Page remains responsive, does not crash or throw unhandled errors | P2 | Negative |
| **TC-NEG-03** | Central Downloads | Resilience against historical Failed/Error rows in queue | Queue open | 1. Open `/busy/report/download`<br>2. Check for rows with status 'Error' or 'Failed' | Historical jobs | Failed status is clearly badged; user is not misled; other downloads operate normally | P2 | Edge Case / Resilience |

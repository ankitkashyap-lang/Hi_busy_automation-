# Purchase Module — Exploration Findings, Non-Data-Driven Test Plan & Required Inputs

## 1. Application Exploration Summary

We explored the live QA environment (`https://hiqa2.pooraa.net/`) across Admin, Channel Partner, and Primary User roles. Below are the verified paths, UI structures, purchase modules, popups, and candidate database verification points.

---

### A. Verified Navigation Flows

1. **Admin / Busy Team Flow**:
   - Log in at `https://hiqa2.pooraa.net/` with Admin credentials (`ankit.kashyap@tech.busy.in` / `123456`).
   - Click top **Menu button** (`menu`).
   - Click **`perm_identity Partner`** in the drawer navigation.
   - Navigates to `/partner/teams/id`.
   - Select **`Partner only`** filter & search partner name.
   - Click **Lock icon / Access CP** button.
   - Opens the Partner Dashboard at `/reseller/dashboard`.

2. **Primary User / Channel Partner Flow**:
   - Log in at `https://hiqa2.pooraa.net/` with Partner credentials (`hi_hi_3minfocare@gmail.com` / `123456`).
   - Directly lands on `/partner/dashboard` or `/reseller/dashboard`.

---

### B. Purchase Modules & UI Structure Observed

| Module | Navigation / Tab | Configuration Dropdowns | Plans Available | Models Available | Action Button |
|---|---|---|---|---|---|
| **Desktop Perpetual** | `Desktop` → `Perpetual` | Tenure (`360`, `720`, `1080`), Region (`India`), Category (`Regular`, `FOC`, `CA`, `GST Practitioner`, `Accountant`) | `Basic`, `Standard`, `Enterprise` | `Single User`, `Multi User`, `Client Server` | `Purchase` (Single/Multi), `Next` (Client Server) |
| **Desktop Subscription** | `Desktop` → `Subscription` | Tenure (`360`, `720`, `1080`), Region (`India`, `Subcontinent`, `Global`), Category (`Regular`, `FOC`) | `Blue`, `Saffron`, `Emerald` | `Single User`, `Multi User`, `Client Server` | `Purchase` (Single/Multi), `Next` (Client Server) |
| **Busy Magic** | `Busy Magic` Tab | Category (`Regular`, `FOC`), Region (`India`) | `Start`, `Smart`, `Power`, `Power+` | N/A (Direct Plan Cards) | `Purchase` (`Start`), `Next` (`Smart`, `Power`, `Power+`) |
| **Online / Mandi** | `Online` / `Mandi` Tab | Product Type, Region, Category | Custom Product Plans | Single / Multi User | `Purchase` |

---

### C. Dashboard Wallet & Credit Info Components

- **Wallet Balance Card**: Displays current wallet balance (`Wallet Bal.`) with a `View Wallet` action.
- **Consumption Statistics**: Displays consumption for `Last Month`, `This Month`, and `Today`.
- **Credit Info Card**: Displays `Credit Bal.`, `View Credit Info`, and `Credit Limit` (`Total`, `Used`, `Used By Partner`).

---

## 2. Non-Data-Driven Test Categories (UI, Popups, Calculations & DB)

As requested, these test cases will **not use Excel data**. They will be structural UI, popup, calculation, and database verification tests.

### 1. UI & Form Controls Testing
- **Tab & Sub-tab State Assertions**: Verify active tab styling and URL synchronization when switching between `Perpetual`, `Subscription`, `Busy Magic`, and `Online`.
- **Dropdown Option Rendering**: Verify that dropdown options (`Tenure`, `Region`, `Category`) render expected default values and update available plan options dynamically.
- **Basic Plan Category Restriction Rule**: Verify that the `Basic` plan is displayed for `Regular` and `FOC` categories, but is hidden/disabled for `CA`, `GST Practitioner`, and `Accountant` categories.
- **Dynamic Button Text Assertion**: Verify that the action button switches dynamically between **`Purchase`** (for standard single/multi user models) and **`Next`** (for Client-Server models & Busy Magic Smart/Power plans).

### 2. Dialog Popups & Error Messages Testing
- **Confirmation Popup Dialog Assertion**: Verify dialog header, message body (e.g., *"Do you want to continue with 1080 Days Tenure?"*), and action buttons when clicking purchase.
- **Cancel Button Dialog Dismissal**: Verify that clicking `Cancel` on a confirmation popup dismisses the dialog without creating an order or deducting wallet balance.
- **OK Button Execution**: Verify that clicking `OK` completes the transaction and triggers the success notification banner/toast.
- **Zero & Negative Quantity Validation**: Verify error message / field highlight when entering `0`, `-1`, or non-numeric characters into quantity inputs.
- **Empty User Count Validation**: Verify validation message on Step 2 when `User Count` input is left blank for Client-Server or Busy Magic Smart plans.
- **Insufficient Wallet Balance Warning**: Verify popup alert when attempting to purchase a product whose price exceeds the current `Wallet Bal.`.

### 3. Calculations & Business Logic Testing
- **Unit Price x Quantity Calculation**: Verify that the summary step calculates `Total = Unit Price × Quantity` accurately.
- **User Count Multiplier Pricing**: Verify price calculation when user count is updated on Step 2.
- **Wallet Balance Deduction Assertion**: Verify that after a successful purchase, `Wallet Bal.` is updated dynamically by deducting the exact purchase total.
- **FOC Category Zero-Deduction Rule**: Verify that purchases under the `FOC` category do not deduct wallet balance.

### 4. Database (DB) & Backend Verification Testing
- **Subscription / License Order Record Creation**: Query the database table (e.g., `orders` / `subscriptions`) to verify order status = `COMPLETED`, partner ID, product ID, tenure, and purchase timestamp.
- **Wallet Ledger Entry Verification**: Query the database table (e.g., `wallet_transactions`) to verify debit amount, transaction reference ID, and closing balance match UI values.
- **Audit Trail Log Verification**: Query `audit_logs` / `cp_access_logs` to verify that CP access and purchase operations are logged with the correct Admin user ID and timestamp.

---

## 3. List of Questions & Inputs Needed From You

To prepare and execute all these UI, popup, calculation, and DB tests cleanly, please provide the following details:

### ❓ Questions & Inputs Needed:
1. **Database Access / Credentials (For DB Testing)**:
   - What database type is used (e.g., PostgreSQL, MySQL, MongoDB)?
   - Do you have a test DB connection string / host / port / credentials, or an API endpoint to query backend records?

2. **Wallet & Credit Balance Business Rules**:
   - Is wallet balance mandatory for `FOC` category purchases, or does `FOC` allow purchase with `0` wallet balance?
   - What is the expected error message text when wallet balance is insufficient?

3. **Quantity & User Count Boundaries**:
   - What is the maximum allowed `Quantity` per purchase (e.g., 100, 999)?
   - What is the minimum and maximum allowed `User Count` for Client-Server / Busy Magic plans?

4. **Online / Mandi Module Particulars**:
   - Are there specific mandatory fields or dropdowns for the `Online` / `Mandi` tab that need specific assertion rules?

---

*This exploration document is saved in your workspace at [`purchase_exploration_and_requirements.md`](file:///c:/Users/BIPL/Desktop/HI_BUSY_AUTOMATION_PORJECT/purchase_exploration_and_requirements.md).*

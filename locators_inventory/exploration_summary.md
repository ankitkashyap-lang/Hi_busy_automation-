# Exploration Summary & Locator Inventory

## 1. Pages Explored
The following pages/modules were successfully explored using the Playwright MCP server:
- Login Page (`/`)
- Dashboard (`/busy/dashboard`)
- Partner Teams (`/partner/teams/id`)
- Busy Team Users (`/busy/users/id`)
- Download Report (`/busy/report/download`)
- Audit (`/audit`)
- Pooraa Listing (`/poora/list`)

*Note: All accessible modules from the left-hand menu were visited and their primary grid/list elements were inspected.*

## 2. Locator Coverage
Important elements were identified per page with the following approximate coverage:
- **Login:** 5 essential elements (Inputs, Submit, OAuth links)
- **Dashboard:** 7 navigation elements (Menu button + side navigation items)
- **Partner Teams:** 8 key elements (Search, Create button, Row actions, dialog actions)
- **Busy Team Users:** 7 key elements (Search, Create button, Row actions, dialog actions)
- **Download Report:** 3 main interaction areas (Select/Refresh, Download buttons)
- **Audit:** 1 primary element (Audit Toggle)
- **Pooraa Listing:** 3 primary groupings (Headers, Rows, Menu)

## 3. Weak Locators
The following elements lack stable IDs, `data-testid`s, or highly unique accessible names:
1. **Row Action Buttons (Partner & Users pages):**
   - Currently use dynamic IDs like `list-item-3367-more-info-btn`.
   - Recommended strategy: Use regex `[data-testid$="-more-info-btn"]` scoped within a row, but this is still slightly fragile if the naming convention changes.
2. **Audit Toggle Switch:**
   - The `<input type="checkbox">` lacks any ID or name attribute.
   - Currently reliant on a Material-UI class: `.MuiSwitch-input`.
3. **Download Page Action Buttons:**
   - Multiple `Download` buttons without unique row-level identifiers or parent IDs.
4. **DataGrid Rows (Pooraa Listing):**
   - Rely on `role="gridcell"` or `role="row"` without specific test IDs.

## 4. Recommended Test IDs
To ensure long-term stability of the Playwright automation framework, developers should add the following `data-testid` attributes:
- **Login:** `data-testid="login-submit-btn"` on the main login button.
- **Data Grids / Lists:** 
  - `data-testid="row-action-menu"` on the "more info" (`more_vert`) dots in each row.
  - `data-testid="grid-row"` on the `<tr>` or `div[role="row"]` elements.
- **Audit:** `data-testid="audit-toggle-input"` on the checkbox input for the switch.
- **Download:** `data-testid="download-btn"` for the row-level download actions, and `data-testid="refresh-select-btn"` for the refresh icon.

## 5. Automation Notes
Important considerations for future Playwright automation:
- **Material-UI (MUI):** The application relies heavily on MUI components. 
  - Do not use `jss*` or `Mui*-*` classes as locators. They change upon recompilation or version updates.
  - Rely on `getByRole` for interactive MUI components (like Selects, Checkboxes, Dialogs) as MUI usually implements correct ARIA attributes.
- **Dynamic Loading:** Grid items and lists may take time to populate (sometimes up to 2-3 seconds). Ensure you use `waitFor` or rely on Playwright's auto-waiting `locator().click()` rather than raw `page.click()`.
- **Modals/Dialogs:** Confirmation dialogs (like `list-approval-dialog-ok-btn`) are rendered dynamically at the root of the DOM when triggered. Wait for their visibility before interacting.
- **Hidden Inputs:** Components like the Audit switch use hidden inputs. Use `.locator('.MuiSwitch-input').setChecked(true, { force: true })` if Playwright complains about the checkbox not being strictly visible.

---
**Note:** The detailed locator inventories for each module have been generated in the `locators_inventory` directory as individual Markdown files.

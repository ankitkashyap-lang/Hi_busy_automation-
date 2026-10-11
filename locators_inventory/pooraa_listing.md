## Pooraa Listing Page

| Element | Type | Preferred Locator | Strategy | Stability | Notes |
|---------|------|-------------------|----------|-----------|-------|
| Menu Button | Button | `getByRole('button', { name: 'menu' })` | Accessible | Stable | Opens main side navigation |
| Grid Headers | Header | `getByRole('columnheader', { name: '<Column Name>' })` | Accessible | High | e.g. "Industry" |
| Grid Rows | Row | `getByRole('row')` | Accessible | Medium | Use text filtering (`filter({ hasText: '...' })`) to find specific rows |

### Weak Locators / Recommendations
- **Grid Interactions:** The table relies on complex generic DOM (likely MUI DataGrid/Table). The headers and cells have generic classes like `MuiTableCell-root`.
- **Recommendation:** If there are actions in the row (like a more info icon), ensure they have a static `data-testid` such as `data-testid="row-action-btn"` or `data-testid="view-details"`.

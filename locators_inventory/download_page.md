## Download Page

| Element | Type | Preferred Locator | Strategy | Stability | Notes |
|---------|------|-------------------|----------|-----------|-------|
| Menu Button | Button | `getByRole('button', { name: 'menu' })` | Accessible | Stable | Opens main side navigation |
| Refresh / Select | Button | `getByLabel('Select')` | Accessible | Medium | Text contains "refresh" icon |
| Download | Button | `getByRole('button', { name: 'Download' })` | Accessible | Medium | Multiple instances in a list/table. Must be scoped to row. |

### Weak Locators / Recommendations
- **Download Buttons:** These buttons lack unique IDs or `data-testid` attributes. To interact with them robustly, you must scope the locator to the corresponding list item/row or add a `data-testid="download-btn"` to the element.
- **Refresh / Select Button:** Lacks a stable ID. Consider adding `data-testid="refresh-select-btn"`.

## Busy Team Users Page

| Element | Type | Preferred Locator | Strategy | Stability | Notes |
|---------|------|-------------------|----------|-----------|-------|
| Menu Button | Button | `getByRole('button', { name: 'menu' })` | Accessible | Stable | Opens main side navigation |
| Search Input | Input | `#search-input` | ID | High | Placeholder: "Search" |
| Search Options (Filter) | Button | `#search-toggle-filters-btn` | ID / testId | High | Toggles advanced search filters |
| Create User / Add | Button | `#main-create-btn` | ID / testId | High | Text contains "add_circle" icon |
| Row More Info | Button | `[data-testid^="list-item-"][data-testid$="-more-info-btn"]` | testId Regex | Medium | IDs are dynamic (e.g. `list-item-50-more-info-btn`). Consider scoping to specific row. |
| Dialog Cancel | Button | `#list-approval-dialog-cancel-btn` | ID / testId | High | Appears in list approval dialogs |
| Dialog OK | Button | `#list-approval-dialog-ok-btn` | ID / testId | High | Appears in list approval dialogs |

### Weak Locators / Recommendations
- **Row Actions:** Similar to Partner Teams, the `list-item-XYZ-more-info-btn` uses dynamic IDs. It is recommended to add a static `data-testid="row-more-info"` to these buttons and locate them contextually via their parent row.

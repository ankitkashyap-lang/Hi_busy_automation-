## Partner Teams Page

| Element | Type | Preferred Locator | Strategy | Stability | Notes |
|---------|------|-------------------|----------|-----------|-------|
| Menu Button | Button | `getByRole('button', { name: 'menu' })` | Accessible | Stable | Opens main side navigation |
| Search Input | Input | `#search-input` | ID | High | Placeholder: "Search" |
| Search Options (Filter) | Button | `#search-toggle-filters-btn` | ID / testId | High | Toggles advanced search filters |
| Create Team / Add | Button | `#main-create-btn` | ID / testId | High | Text contains "add_circle" icon |
| Access Account | Button | `getByLabel('Access Account')` | Accessible | Medium | Multiple instances per row (list items). Consider scoping to specific row. |
| Row More Info | Button | `[data-testid^="list-item-"][data-testid$="-more-info-btn"]` | testId Regex | Medium | IDs are dynamic (e.g. `list-item-3367-more-info-btn`). Suggest adding a generic data-testid or scoping by row. |
| Dialog Cancel | Button | `#list-approval-dialog-cancel-btn` | ID / testId | High | Appears in list approval dialogs |
| Dialog OK | Button | `#list-approval-dialog-ok-btn` | ID / testId | High | Appears in list approval dialogs |

### Weak Locators / Recommendations
- **Row Actions:** The `list-item-XYZ-more-info-btn` includes a dynamic ID. While regex or CSS attribute selectors (`[id$="-more-info-btn"]`) can work, it is recommended to add a static `data-testid="row-more-info"` and locate it by scoping to the specific table/list row (`tr` or list item container).

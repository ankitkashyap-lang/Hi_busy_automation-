## Audit Page

| Element | Type | Preferred Locator | Strategy | Stability | Notes |
|---------|------|-------------------|----------|-----------|-------|
| Menu Button | Button | `getByRole('button', { name: 'menu' })` | Accessible | Stable | Opens main side navigation |
| Audit Toggle | Checkbox | `.MuiSwitch-input` | CSS Class | Low | Toggle switch for Audit feature. Highly fragile. |

### Weak Locators / Recommendations
- **Audit Toggle:** The switch checkbox is missing an `id`, `name`, or `data-testid`. The current locator `.MuiSwitch-input` relies on a Material-UI generated class, which is fragile. 
- **Recommendation:** Add a stable ID or testID such as `data-testid="audit-toggle-input"` to the `<input type="checkbox">` element.

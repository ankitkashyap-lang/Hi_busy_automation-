## Dashboard Page

| Element | Type | Preferred Locator | Strategy | Stability | Notes |
|---------|------|-------------------|----------|-----------|-------|
| Menu Button | Button | `getByRole('button', { name: 'menu' })` | Accessible | Stable | Opens main side navigation |
| Dashboard Menu Item| Link | `getByRole('link', { name: 'Dashboard' })` | Accessible | Stable | Inside side menu |
| Partner Menu Item | Link | `getByRole('link', { name: 'Partner' })` | Accessible | Stable | Inside side menu |
| Users Menu Item | Link | `getByRole('link', { name: 'Busy Team Users' })` | Accessible | Stable | Inside side menu |
| Download Menu Item | Link | `getByRole('link', { name: 'Download' })` | Accessible | Stable | Inside side menu |
| Audit Menu Item | Link | `getByRole('link', { name: 'Audit' })` | Accessible | Stable | Inside side menu |
| Pooraa Listing Menu Item | Link | `getByRole('link', { name: 'Pooraa Listing' })` | Accessible | Stable | Inside side menu |

### Weak Locators / Recommendations
- The dashboard is fairly empty on initial load except for the hamburger menu.
- A search input with placeholder "Enter Subscription ID, Mobile, Email or GSTIN" was referenced in the requirements but was not immediately visible on the main dashboard view for the logged-in user. If this relies on a specific module or permission, its locator should be: `getByPlaceholder('Enter Subscription ID, Mobile, Email or GSTIN')`.

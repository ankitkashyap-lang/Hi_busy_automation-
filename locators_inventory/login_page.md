## Login Page

| Element | Type | Preferred Locator | Strategy | Stability | Notes |
|---------|------|-------------------|----------|-----------|-------|
| Email | Input | `#usr` | ID | High | Placeholder: "Email ID" |
| Password | Input | `#pwd` | ID | High | Placeholder: "Password" |
| Login Button | Button | `button[type="submit"]` | Attribute | High | Text: "Login" |
| Forgot Password | Link | `getByRole('link', { name: 'Forgot Password?' })` | Accessible | Stable | |
| Google Sign In | Link | `getByRole('link', { name: 'Sign in with Google' })` | Accessible | Stable | |

### Weak Locators / Recommendations
- **Login Button:** `button[type="submit"]` works, but it's generally recommended to add a static `data-testid="login-submit-btn"` for future-proofing against layout changes where multiple submit buttons might be present.

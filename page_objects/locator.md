LOCATOR PRIORITY

For every element, find the most stable locator using this priority:

1. id

#elementId

2. data-testid / data-test / similar dedicated test attributes

3. Stable unique attributes

4. Accessible locators

getByRole()
getByLabel()
getByPlaceholder()

5. Stable text locator only when necessary

Avoid fragile locators such as:

Dynamic CSS classes
Generated class names
Deep CSS selectors
nth-child()
xpath unless there is no better option
Auto-generated/dynamic IDs
Locators dependent on changing text
WHAT TO CAPTURE

For every important element, capture:

Page/Module name
Element name
Element type
Best locator
Locator strategy used
Whether the locator is stable
Any alternative locator if useful
Notes about dynamic behavior

Example:

Page	Element	Type	Preferred Locator	Strategy	Notes
Login	Email	Input	#usr	ID	Stable
Login	Password	Input	#pwd	ID	Stable
Login	Login	Button	.btn-login[type="submit"]	Attribute	Stable
Dashboard	Search	Input	getByPlaceholder("Enter Subscription ID, Mobile, Email or GSTIN")	Placeholder	Stable
SPECIAL REQUIREMENT

For each page, inspect the DOM/accessibility information through Playwright MCP and determine whether an ID or test ID already exists.

If an ID exists, prefer it.

For example:

page.locator('#usr')

is preferred over:

page.getByText('Email')

If no ID/test ID exists, choose the next most stable option.
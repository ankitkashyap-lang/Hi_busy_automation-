const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../scratch');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  console.log("1. Logging in...");
  await page.goto('https://hiqa1.pooraa.net/');
  await page.fill('input[type="email"], input[name="email"], input[name="username"], #usr, [aria-label="Email ID"]', 'ankit.kashyap@tech.busy.in'); 
  await page.fill('input[type="password"], input[name="password"], #pwd, [aria-label="Password"]', '123456');
  await page.click('button[type="submit"], button:has-text("Login")');
  await page.waitForTimeout(3000);

  console.log("2. Navigating directly to 3M Infocare partner dashboard or via listing...");
  // Go to partner listing
  await page.getByRole('button', { name: 'menu' }).first().click();
  await page.waitForTimeout(1000);
  await page.getByRole('link', { name: /Partner/i }).first().click();
  await page.waitForTimeout(3000);

  // Search 3M Infocare
  const searchInput = page.locator('input[placeholder="Search"]').first();
  await searchInput.fill('3M Infocare');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);

  // Access Account
  await page.locator('button[aria-label="Access Account"], button:has(svg[data-testid="LockOpenIcon"])').first().click();
  await page.waitForTimeout(4000);

  console.log("3. Inspecting Partner Menu for Analytics...");
  await page.getByRole('button', { name: 'menu' }).first().click();
  await page.waitForTimeout(1000);

  // Dump all menu items inside drawer
  const drawerLinks = await page.locator('.MuiDrawer-root, [role="navigation"]').locator('a, button, li, p, span').evaluateAll(els => {
    return els.map(e => ({
      tag: e.tagName,
      text: e.innerText?.trim(),
      href: e.getAttribute('href'),
      aria: e.getAttribute('aria-label'),
      role: e.getAttribute('role'),
      class: e.getAttribute('class')
    })).filter(x => x.text && x.text.length > 0 && x.text.length < 60);
  });
  console.log("Drawer items count:", drawerLinks.length);
  fs.writeFileSync(path.join(outDir, 'partner_drawer_items.json'), JSON.stringify(drawerLinks, null, 2));

  // Find Analytics in drawer
  const analyticsBtn = page.locator('text=/Analytics/i').first();
  if (await analyticsBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log("Clicking Analytics in drawer...");
    await analyticsBtn.click();
    await page.waitForTimeout(1000);
    const subItems = await page.locator('.MuiDrawer-root, [role="navigation"]').locator('a, button, li').evaluateAll(els => 
      els.map(e => ({ text: e.innerText?.trim(), href: e.getAttribute('href') })).filter(x => x.text)
    );
    console.log("Sub items after Analytics click:", subItems);
  }

  // Navigate to Due Renewals
  console.log("4. Navigating to Due Renewals page...");
  await page.goto('https://hiqa1.pooraa.net/partner/analytics/duerenewal?tab=0&product=desktop', { waitUntil: 'networkidle' }).catch(() => {});
  await page.waitForTimeout(4000);
  console.log("Due Renewals loaded. Current URL:", page.url());

  // Deep inspect page structure
  const pageDetails = await page.evaluate(() => {
    // Labels and form controls
    const labels = Array.from(document.querySelectorAll('label, .MuiFormLabel-root, .MuiInputLabel-root')).map(l => ({
      text: l.innerText?.trim(),
      for: l.getAttribute('for'),
      html: l.outerHTML
    }));

    // Form controls (Input, Select, Autocomplete, etc.)
    const formControls = Array.from(document.querySelectorAll('.MuiFormControl-root, .form-group')).map(fc => {
      const label = fc.querySelector('label')?.innerText?.trim() || '';
      const input = fc.querySelector('input, select, textarea');
      const select = fc.querySelector('.MuiSelect-root, [role="combobox"]');
      return {
        label,
        inputType: input?.getAttribute('type') || input?.tagName,
        inputPlaceholder: input?.getAttribute('placeholder') || '',
        inputValue: input?.value || '',
        hasSelect: !!select,
        selectText: select?.innerText?.trim() || ''
      };
    });

    // All Buttons
    const buttons = Array.from(document.querySelectorAll('button')).map(b => ({
      text: b.innerText?.trim().replace(/\s+/g, ' '),
      aria: b.getAttribute('aria-label') || '',
      title: b.getAttribute('title') || '',
      disabled: b.disabled || b.getAttribute('aria-disabled') === 'true',
      classes: b.className
    }));

    // Data elements / Grid / Cards / Table
    const tables = Array.from(document.querySelectorAll('table')).map(t => {
      const headers = Array.from(t.querySelectorAll('th')).map(th => th.innerText?.trim());
      const rowCount = t.querySelectorAll('tbody tr').length;
      const firstRow = Array.from(t.querySelectorAll('tbody tr:first-child td')).map(td => td.innerText?.trim());
      return { headers, rowCount, firstRow };
    });

    // MuiDataGrid or custom grid / lists
    const dataGrids = Array.from(document.querySelectorAll('[role="grid"], .MuiDataGrid-root, .react-grid, .custom-table')).map(g => ({
      columns: Array.from(g.querySelectorAll('[role="columnheader"]')).map(c => c.innerText?.trim()),
      rowCount: g.querySelectorAll('[role="row"]').length
    }));

    // Text content or empty messages
    const alerts = Array.from(document.querySelectorAll('.MuiAlert-root, .empty-state, [role="alert"]')).map(a => a.innerText?.trim());

    // Tabs
    const tabs = Array.from(document.querySelectorAll('[role="tab"], .MuiTab-root')).map(t => ({
      text: t.innerText?.trim(),
      selected: t.getAttribute('aria-selected') === 'true'
    }));

    // Breadcrumbs or Title
    const breadcrumbs = Array.from(document.querySelectorAll('.MuiBreadcrumbs-root, .breadcrumb, h1, h2, h3, h4, h5, h6, .page-title')).map(b => b.innerText?.trim());

    return {
      title: document.title,
      breadcrumbs,
      tabs,
      labels,
      formControls,
      buttons,
      tables,
      dataGrids,
      alerts
    };
  });

  fs.writeFileSync(path.join(outDir, 'due_renewals_inspection.json'), JSON.stringify(pageDetails, null, 2));
  console.log("Page Details Summary:");
  console.log("Title/Breadcrumbs:", pageDetails.breadcrumbs);
  console.log("Tabs:", pageDetails.tabs);
  console.log("Form Controls:", pageDetails.formControls);
  console.log("Tables:", pageDetails.tables);
  console.log("Data Grids:", pageDetails.dataGrids);
  console.log("Buttons:", pageDetails.buttons.filter(b => b.text || b.title || b.aria));

  // Check Product dropdown / select
  console.log("\n5. Testing Product selection and dropdown options...");
  const selectElements = await page.locator('select, [role="combobox"]').evaluateAll(els => 
    els.map(e => ({
      tagName: e.tagName,
      role: e.getAttribute('role'),
      id: e.getAttribute('id'),
      text: e.innerText?.trim(),
      options: Array.from(e.querySelectorAll('option')).map(o => ({ value: o.value, text: o.innerText?.trim() }))
    }))
  );
  console.log("Select / Combobox elements:", JSON.stringify(selectElements, null, 2));

  // Test Download Excel button
  console.log("\n6. Testing Download Excel button...");
  const downloadExcelBtn = page.locator('button:has(img[title="Download Excel"]), button[title="Download Excel"], img[title="Download Excel"]').first();
  if (await downloadExcelBtn.isVisible()) {
    console.log("Download Excel button is visible!");
    // Set up download listener
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 }).catch(err => {
      console.log("Download event timed out or redirected:", err.message);
      return null;
    });

    await downloadExcelBtn.click();
    console.log("Clicked Download Excel button.");

    const download = await downloadPromise;
    if (download) {
      const suggestedFilename = download.suggestedFilename();
      const savePath = path.join(outDir, suggestedFilename);
      await download.saveAs(savePath);
      console.log(`Successfully downloaded file: ${suggestedFilename} to ${savePath}`);
      const stats = fs.statSync(savePath);
      console.log(`Downloaded file size: ${stats.size} bytes`);
    } else {
      console.log("No direct browser download event triggered. Checking if popup tab opened or toast appeared...");
      await page.waitForTimeout(2000);
      const toast = await page.locator('.MuiAlert-message, [role="alert"]').innerText().catch(() => null);
      if (toast) console.log("Toast message after download click:", toast);
    }
  }

  await browser.close();
})().catch(err => {
  console.error("FATAL ERROR in deep inspection:", err);
  process.exit(1);
});

const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '../scratch/due_renewals.html'), 'utf8');

// Simple regex parser to extract key elements from the HTML
console.log("=== DUE RENEWALS PAGE DOM ANALYSIS ===");

// Title / headings
const headings = html.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi) || [];
console.log("\n--- Headings ---");
headings.forEach(h => console.log(h.replace(/<[^>]+>/g, '').trim()));

// Tabs
console.log("\n--- Tabs / Navigation ---");
const tabs = html.match(/<button[^>]*role="tab"[^>]*>([\s\S]*?)<\/button>/gi) || [];
tabs.forEach(t => console.log("Tab:", t.replace(/<[^>]+>/g, '').trim()));

// Buttons
console.log("\n--- Buttons ---");
const buttons = html.match(/<button[^>]*>([\s\S]*?)<\/button>/gi) || [];
buttons.forEach(b => {
  const text = b.replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
  const aria = b.match(/aria-label="([^"]*)"/)?.[1] || '';
  const title = b.match(/title="([^"]*)"/)?.[1] || '';
  const testId = b.match(/data-testid="([^"]*)"/)?.[1] || '';
  if (text || aria || title || testId) {
    console.log(`Button: text="${text}" | aria="${aria}" | title="${title}" | testId="${testId}"`);
  }
});

// Inputs and Selects
console.log("\n--- Inputs & Selects ---");
const inputs = html.match(/<input[^>]*>/gi) || [];
inputs.forEach(i => {
  const id = i.match(/id="([^"]*)"/)?.[1] || '';
  const name = i.match(/name="([^"]*)"/)?.[1] || '';
  const placeholder = i.match(/placeholder="([^"]*)"/)?.[1] || '';
  const type = i.match(/type="([^"]*)"/)?.[1] || '';
  const testId = i.match(/data-testid="([^"]*)"/)?.[1] || '';
  console.log(`Input: id="${id}" | name="${name}" | placeholder="${placeholder}" | type="${type}" | testId="${testId}"`);
});

const selects = html.match(/<select[^>]*>([\s\S]*?)<\/select>/gi) || [];
selects.forEach(s => {
  const id = s.match(/id="([^"]*)"/)?.[1] || '';
  const name = s.match(/name="([^"]*)"/)?.[1] || '';
  console.log(`Select: id="${id}" | name="${name}"`);
  const options = s.match(/<option[^>]*>([\s\S]*?)<\/option>/gi) || [];
  options.forEach(o => console.log("  Option:", o.replace(/<[^>]+>/g, '').trim()));
});

// Dropdowns with combobox role or MuiSelect
console.log("\n--- Dropdowns / Comboboxes ---");
const comboboxes = html.match(/<div[^>]*role="combobox"[^>]*>([\s\S]*?)<\/div>/gi) || [];
comboboxes.forEach(c => {
  const id = c.match(/id="([^"]*)"/)?.[1] || '';
  console.log(`Combobox: id="${id}" | text="${c.replace(/<[^>]+>/g, '').trim()}"`);
});

// Table Headers
console.log("\n--- Table Headers ---");
const ths = html.match(/<th[^>]*>([\s\S]*?)<\/th>/gi) || [];
ths.forEach(th => console.log("TH:", th.replace(/<[^>]+>/g, '').trim()));

// Table Rows Count
const trs = html.match(/<tr[^>]*>/gi) || [];
console.log(`\nTotal TR elements: ${trs.length}`);

// Look for download icon or text
console.log("\n--- Download / Export elements ---");
const dlMatches = html.match(/[^<]*download[^>]*/gi) || [];
dlMatches.slice(0, 10).forEach(m => console.log("DL match:", m.trim().substring(0, 100)));


const { execSync } = require('child_process');

try {
  const output = execSync('npx playwright test --list --project=chromium', { encoding: 'utf8' });
  const lines = output.split('\n');
  const testLines = lines.filter(l => l.trim().startsWith('[chromium]'));
  
  const fileMap = {};
  for (const t of testLines) {
    // format: [chromium] › path/file.spec.js:line:col › Suite › Title
    const match = t.match(/\[chromium\]\s*›\s*([^›]+?\.spec\.js)/);
    if (match) {
      const file = match[1].trim();
      fileMap[file] = (fileMap[file] || 0) + 1;
    }
  }

  console.log('=== TEST BREAKDOWN FOR CHROME (CHROMIUM) ===\n');
  let total = 0;
  for (const [file, count] of Object.entries(fileMap)) {
    console.log(`${count.toString().padStart(3, ' ')} tests | ${file}`);
    total += count;
  }
  console.log(`\nTOTAL TESTS IN CHROME (CHROMIUM): ${total}`);
  console.log(`TOTAL SPEC FILES: ${Object.keys(fileMap).length}`);

  // Summary by directory
  const dirMap = {};
  for (const [file, count] of Object.entries(fileMap)) {
    const parts = file.split(/[\\/]/);
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : 'root';
    dirMap[dir] = (dirMap[dir] || 0) + count;
  }

  console.log('\n=== SUMMARY BY MODULE / FOLDER ===\n');
  for (const [dir, count] of Object.entries(dirMap)) {
    console.log(`${count.toString().padStart(3, ' ')} tests | ${dir}`);
  }
} catch (e) {
  console.error('Error running test count:', e.message);
}

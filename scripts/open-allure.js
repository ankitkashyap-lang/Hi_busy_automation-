const { REPORT_DIR } = require('./allure-utils.js');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const targetDir = fs.existsSync(REPORT_DIR) ? REPORT_DIR : path.resolve(process.cwd(), 'reports', 'allure-report');

if (!fs.existsSync(targetDir)) {
  console.error(`❌ No Allure report found to open. Run 'npm run allure:generate' first.`);
  process.exit(1);
}

console.log(`🌐 Opening Allure report from ${targetDir}...`);
const child = spawn(`npx allure open "${targetDir}"`, {
  stdio: 'inherit',
  shell: true
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

const {
  REPORT_DIR,
  deployToSurge,
  getSurgeDomain,
  getReportSummary,
  printBanner
} = require('./allure-utils.js');
const fs = require('fs');
const path = require('path');

async function main() {
  const customDomain = process.argv[2] || getSurgeDomain();
  const targetDir = fs.existsSync(REPORT_DIR) ? REPORT_DIR : path.resolve(process.cwd(), 'reports', 'allure-report');

  if (!fs.existsSync(path.join(targetDir, 'index.html'))) {
    console.error(`❌ Cannot deploy: index.html not found in ${targetDir}. Please run 'npm run allure:generate' first.`);
    process.exit(1);
  }

  console.log(`☁️ Deploying Allure report to Surge domain: ${customDomain}...`);
  try {
    const url = await deployToSurge(targetDir, customDomain);
    const summary = getReportSummary(targetDir);
    const testStatus = summary && summary.failed > 0 ? 'FAILED' : 'PASSED';

    printBanner({
      testStatus,
      envName: process.env.ENVIRONMENT || 'QA',
      url,
      summary
    });
  } catch (err) {
    console.error(`❌ Deployment failed: ${err.message}`);
    process.exit(1);
  }
}

main();

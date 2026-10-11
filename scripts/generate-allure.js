const { generateAllureReport, RESULTS_DIR, REPORT_DIR } = require('./allure-utils.js');

async function main() {
  console.log(`📊 Generating Allure report from ${RESULTS_DIR} into ${REPORT_DIR}...`);
  try {
    const reportPath = await generateAllureReport(RESULTS_DIR, REPORT_DIR);
    console.log(`✅ Allure report generated successfully at: ${reportPath}`);
  } catch (err) {
    console.error(`❌ Failed to generate Allure report: ${err.message}`);
    process.exit(1);
  }
}

main();

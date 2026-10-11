const { cleanAllureDirs, RESULTS_DIR, REPORT_DIR, LEGACY_ALLURE_DIR } = require('./allure-utils.js');

console.log('🧹 Cleaning Allure results and reports...');
cleanAllureDirs([RESULTS_DIR, REPORT_DIR, LEGACY_ALLURE_DIR]);
console.log('✅ Allure directories cleaned. Stale test results removed.');

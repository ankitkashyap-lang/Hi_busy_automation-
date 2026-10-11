const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');
const util = require('util');
const dotenv = require('dotenv');

dotenv.config();

const execAsync = util.promisify(exec);

const RESULTS_DIR = path.resolve(process.cwd(), 'allure-results');
const REPORT_DIR = path.resolve(process.cwd(), 'allure-report');
const LEGACY_ALLURE_DIR = path.resolve(process.cwd(), 'allure');

/**
 * Clean previous Allure result and report directories.
 * Ensures the next report contains ONLY the latest test execution results.
 */
function cleanAllureDirs(dirs = [RESULTS_DIR, REPORT_DIR, LEGACY_ALLURE_DIR]) {
  dirs.forEach((dir) => {
    try {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    } catch (err) {
      console.warn(`⚠️ Warning: Could not clean directory ${dir}: ${err.message}`);
    }
  });

  // Re-create empty results directory
  try {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  } catch (err) {
    console.error(`❌ Failed to create results directory ${RESULTS_DIR}: ${err.message}`);
  }
}

/**
 * Generate Allure HTML report from results directory into report directory.
 */
async function generateAllureReport(resultsDir = RESULTS_DIR, reportDir = REPORT_DIR) {
  if (!fs.existsSync(resultsDir)) {
    throw new Error(`Allure results directory does not exist: ${resultsDir}`);
  }

  // Ensure output directory parent exists
  const parentDir = path.dirname(reportDir);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  const cmd = `npx allure generate "${resultsDir}" -o "${reportDir}" --clean`;
  try {
    await execAsync(cmd, {
      env: {
        ...process.env,
        JAVA_HOME: process.env.JAVA_HOME || 'C:\\Program Files\\Microsoft\\jdk-21.0.12.101-hotspot'
      }
    });
  } catch (err) {
    throw new Error(`Allure generation failed: ${err.message}`);
  }

  const indexPath = path.join(reportDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    throw new Error(`Allure report generation finished but index.html was not found in: ${reportDir}`);
  }

  return reportDir;
}

/**
 * Prepare Surge directory (e.g. create 200.html for client-side routing fallback).
 */
function prepareSurgeDir(reportDir = REPORT_DIR) {
  const indexPath = path.join(reportDir, 'index.html');
  const fallbackPath = path.join(reportDir, '200.html');

  if (fs.existsSync(indexPath) && !fs.existsSync(fallbackPath)) {
    try {
      fs.copyFileSync(indexPath, fallbackPath);
    } catch (e) {
      // Non-critical, continue
    }
  }
}

/**
 * Parse Allure summary JSON to retrieve test statistics.
 */
function getReportSummary(reportDir = REPORT_DIR) {
  const summaryPath = path.join(reportDir, 'widgets', 'summary.json');
  if (fs.existsSync(summaryPath)) {
    try {
      const raw = fs.readFileSync(summaryPath, 'utf8');
      const data = JSON.parse(raw);
      if (data && data.statistic) {
        return {
          total: data.statistic.total || 0,
          passed: data.statistic.passed || 0,
          failed: data.statistic.failed || 0,
          broken: data.statistic.broken || 0,
          skipped: data.statistic.skipped || 0,
          unknown: data.statistic.unknown || 0
        };
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
  }
  return null;
}

/**
 * Resolve Surge domain based on environment configuration.
 */
function getSurgeDomain(envName) {
  const normEnv = (envName || process.env.ENVIRONMENT || 'qa1').toLowerCase();

  if (normEnv === 'qa1' && process.env.SURGE_QA1_DOMAIN) {
    return process.env.SURGE_QA1_DOMAIN;
  }
  if (normEnv === 'qa2' && process.env.SURGE_QA2_DOMAIN) {
    return process.env.SURGE_QA2_DOMAIN;
  }
  if (process.env.SURGE_DOMAIN) {
    return process.env.SURGE_DOMAIN;
  }
  if (process.env.SURGE_QA1_DOMAIN) {
    return process.env.SURGE_QA1_DOMAIN;
  }

  return 'busy-playwright-allure.surge.sh';
}

/**
 * Deploy generated report directory to Surge.sh
 */
async function deployToSurge(reportDir = REPORT_DIR, domain = getSurgeDomain()) {
  const indexPath = path.join(reportDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    throw new Error(`Cannot deploy: Allure report not found at ${reportDir}`);
  }

  prepareSurgeDir(reportDir);

  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  const surgeToken = process.env.SURGE_TOKEN;
  const surgeLogin = process.env.SURGE_LOGIN;

  // Build command arguments
  const args = ['surge', `"${reportDir}"`, cleanDomain];
  if (surgeToken) {
    args.push('--token', `"${surgeToken}"`);
  }

  const cmd = `npx ${args.join(' ')}`;

  try {
    const env = { ...process.env };
    if (surgeToken) env.SURGE_TOKEN = surgeToken;
    if (surgeLogin) env.SURGE_LOGIN = surgeLogin;

    const { stdout, stderr } = await execAsync(cmd, { env });
    const fullUrl = `https://${cleanDomain}`;
    return fullUrl;
  } catch (err) {
    const errorMsg = err.stderr || err.stdout || err.message;
    throw new Error(
      `Surge deployment failed for ${cleanDomain}:\n${errorMsg}\n` +
      `Tip: Make sure you are authenticated with Surge by running 'npx surge login' ` +
      `or setting SURGE_LOGIN and SURGE_TOKEN in your .env file.`
    );
  }
}

/**
 * Print terminal banner with test execution and deployment status.
 */
function printBanner({ testStatus, envName, url, summary }) {
  const divider = '='.repeat(42);
  const statusStr = testStatus ? testStatus.toUpperCase() : 'UNKNOWN';
  const environmentStr = (envName || process.env.ENVIRONMENT || 'QA').toUpperCase();

  let testInfo = '';
  if (summary) {
    testInfo = `Tests: ${summary.total} (Passed: ${summary.passed}, Failed: ${summary.failed}, Broken: ${summary.broken}, Skipped: ${summary.skipped})`;
  } else {
    testInfo = `Test Status: ${statusStr}`;
  }

  console.log('\n' + divider);
  console.log('ALLURE REPORT DEPLOYED');
  console.log(divider + '\n');
  console.log(testInfo);
  console.log(`Status: ${statusStr}`);
  console.log(`Environment: ${environmentStr}\n`);
  console.log('Report:');
  console.log(url);
  console.log('\n' + divider + '\n');
}

module.exports = {
  RESULTS_DIR,
  REPORT_DIR,
  LEGACY_ALLURE_DIR,
  cleanAllureDirs,
  generateAllureReport,
  prepareSurgeDir,
  getReportSummary,
  getSurgeDomain,
  deployToSurge,
  printBanner
};

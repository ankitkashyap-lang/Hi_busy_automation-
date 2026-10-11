const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

const {
  RESULTS_DIR,
  REPORT_DIR,
  cleanAllureDirs,
  generateAllureReport,
  deployToSurge,
  getSurgeDomain,
  getReportSummary,
  printBanner
} = require('./allure-utils.js');

const { buildEmailHTML, buildSubject, parsePlaywrightResults, mergeStats } = require('./emailTemplate.js');

dotenv.config();

// SMTP config (shared)
const SMTP_SERVER   = process.env.SMTP_SERVER   || process.env.EMAIL_HOST     || '';
const SMTP_PORT     = process.env.SMTP_PORT     || process.env.EMAIL_PORT     || 587;
const SMTP_USER     = process.env.SMTP_USER     || process.env.EMAIL_USER     || '';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD || '';

const PW_JSON_REPORT = path.join(process.cwd(), 'reports', 'results.json');

function quoteArg(a) {
  if (/[ \t\n\v"|&<>;^]/.test(a)) {
    return `"${a.replace(/"/g, '\\"')}"`;
  }
  return a;
}

async function runPlaywrightAsync(args, envOverrides) {
  return new Promise((resolve) => {
    const env = {
      ...process.env,
      ALLURE_RESULTS_DIR: RESULTS_DIR,
      CI: '1', // Prevents HTML reporter from hanging the terminal on failure
      ...envOverrides
    };

    const commandArgs = ['playwright', 'test', ...args.map(quoteArg)];
    const commandString = `npx ${commandArgs.join(' ')}`;
    console.log(`\n🚀 Executing: ${commandString}\n`);

    const child = spawn(commandString, {
      stdio: 'inherit',
      env,
      shell: true
    });

    child.on('close', (code) => {
      resolve(code === null ? 1 : code);
    });

    child.on('error', (err) => {
      console.error(`❌ Failed to start Playwright: ${err.message}`);
      resolve(1);
    });
  });
}

/**
 * Send a rich HTML email with full test execution summary.
 */
async function sendEmail(envName, passed, reportUrl, baseUrl, allureSummary, pwHtmlReportUrl) {
  if (!SMTP_SERVER || !SMTP_USER) {
    console.log(`\n⚠️  SMTP not configured – skipping email notification.`);
    return;
  }

  const recipient = process.env[`${envName.toUpperCase()}_REPORT_EMAIL`]
    || process.env.QA1_REPORT_EMAIL
    || process.env.REPORT_EMAIL
    || '';

  if (!recipient) {
    console.log(`\n⚠️  No recipient email configured for ${envName} – skipping email.`);
    return;
  }

  // Parse Playwright JSON for suite breakdown & failed test list
  const pwStats = parsePlaywrightResults(PW_JSON_REPORT);
  const stats   = mergeStats(allureSummary, pwStats);

  // Check Playwright default HTML report
  const pwHtmlPath = path.join(process.cwd(), 'reports', 'html', 'index.html');
  const hasPwHtml  = fs.existsSync(pwHtmlPath);

  // Separate Playwright HTML surge URL (if deployed or env set)
  const pwHtmlUrl = pwHtmlReportUrl
    || (process.env[`SURGE_PW_HTML_${envName.toUpperCase()}_DOMAIN`]
        ? `https://${process.env[`SURGE_PW_HTML_${envName.toUpperCase()}_DOMAIN`]}`
        : (process.env.SURGE_PW_HTML_DOMAIN ? `https://${process.env.SURGE_PW_HTML_DOMAIN}` : null));

  const htmlBody = buildEmailHTML({
    envName,
    baseUrl:             baseUrl || '',
    reportUrl:           reportUrl || '#',
    playwrightReportUrl: pwHtmlUrl,
    hasAttachment:       hasPwHtml,
    passed,
    total:   stats.total,
    pass:    stats.pass,
    fail:    stats.fail,
    broken:  stats.broken   || 0,
    skipped: stats.skipped  || 0,
    duration:    pwStats.duration,
    timestamp:   new Date().toISOString(),
    suites:      pwStats.suites,
    failedTests: pwStats.failedTests,
  });

  const subject = buildSubject(envName, passed, stats.total, stats.pass, stats.fail);

  console.log(`\n📧 Sending email to: ${recipient}`);
  console.log(`   Subject: ${subject}`);

  const attachments = [];
  if (hasPwHtml) {
    attachments.push({
      filename: `Playwright-Report-${envName}.html`,
      path: pwHtmlPath,
    });
    console.log(`   📎 Attaching Playwright HTML report: ${pwHtmlPath}`);
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_SERVER,
    port: SMTP_PORT,
    secure: SMTP_PORT == 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });

  try {
    const info = await transporter.sendMail({
      from:    `"Hi Busy Automation" <${SMTP_USER}>`,
      to:      recipient,
      subject,
      html:    htmlBody,
      attachments,
    });
    console.log(`✅ Email sent: ${info.messageId}`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
}

async function main() {
  const rawArgs = process.argv.slice(2);
  const forwardArgs = [];
  let targetEnv = process.env.ENVIRONMENT || 'qa1';

  // Parse arguments and extract custom --env flag if provided
  for (const arg of rawArgs) {
    if (arg.startsWith('--env=')) {
      targetEnv = arg.split('=')[1].toLowerCase();
    } else if (arg === '--qa1') {
      targetEnv = 'qa1';
    } else if (arg === '--qa2') {
      targetEnv = 'qa2';
    } else {
      forwardArgs.push(arg);
    }
  }

  // Determine base URL based on target environment
  let baseUrl = process.env.BASE_URL;
  if (targetEnv === 'qa1' && process.env.QA1_BASE_URL) {
    baseUrl = process.env.QA1_BASE_URL;
  } else if (targetEnv === 'qa2' && process.env.QA2_BASE_URL) {
    baseUrl = process.env.QA2_BASE_URL;
  }

  const envOverrides = {
    ENVIRONMENT: targetEnv,
    BASE_URL: baseUrl || process.env.BASE_URL || 'https://hiqa1.pooraa.net/'
  };

  const domain = getSurgeDomain(targetEnv);

  console.log('---------------------------------------------------------');
  console.log(`🎯 Test Runner: Target Environment = ${targetEnv.toUpperCase()} (${envOverrides.BASE_URL})`);
  console.log(`🎯 Surge Target Domain = ${domain}`);
  console.log('---------------------------------------------------------');

  // 1. Clean previous Allure results to ensure latest-run-only reporting
  console.log('🧹 Cleaning previous Allure results and reports...');
  cleanAllureDirs([RESULTS_DIR, REPORT_DIR]);

  // 2. Execute Playwright tests
  const testExitCode = await runPlaywrightAsync(forwardArgs, envOverrides);
  const testPassed   = testExitCode === 0;
  const testStatus   = testPassed ? 'PASSED' : 'FAILED';

  if (testPassed) {
    console.log(`\n✅ Playwright test execution completed successfully.`);
  } else {
    console.log(`\n⚠️  Playwright test execution finished with failures (Exit code: ${testExitCode}).`);
  }

  // 3. Generate Allure Report
  let reportGenerated = false;
  try {
    const resultFiles = fs.existsSync(RESULTS_DIR) ? fs.readdirSync(RESULTS_DIR) : [];
    if (resultFiles.length === 0) {
      console.warn(`⚠️  No Allure result files found in ${RESULTS_DIR}. Skipping report generation.`);
    } else {
      console.log(`\n📊 Generating Allure report for latest execution...`);
      await generateAllureReport(RESULTS_DIR, REPORT_DIR);
      reportGenerated = true;
      console.log(`✅ Allure report generated in ${REPORT_DIR}`);
    }
  } catch (err) {
    console.error(`❌ Allure report generation error: ${err.message}`);
  }

  // 4. Deploy to Surge.sh
  let surgeUrl = null;
  if (reportGenerated) {
    try {
      console.log(`\n☁️  Deploying Allure report to Surge.sh (${domain})...`);
      surgeUrl = await deployToSurge(REPORT_DIR, domain);
      console.log(`✅ Successfully deployed to Surge: ${surgeUrl}`);
    } catch (err) {
      console.error(`❌ Surge deployment error: ${err.message}`);
    }
  }

  // 4b. Optional: Deploy Playwright default HTML report to Surge
  const pwHtmlDir = path.join(process.cwd(), 'reports', 'html');
  const pwDomain  = process.env[`SURGE_PW_HTML_${targetEnv.toUpperCase()}_DOMAIN`] || process.env.SURGE_PW_HTML_DOMAIN;
  let pwReportUrl = null;
  if (pwDomain && fs.existsSync(path.join(pwHtmlDir, 'index.html'))) {
    try {
      console.log(`\n☁️  Deploying Playwright HTML report to Surge (${pwDomain})...`);
      pwReportUrl = await deployToSurge(pwHtmlDir, pwDomain);
      console.log(`✅ Successfully deployed Playwright HTML report to Surge: ${pwReportUrl}`);
    } catch (err) {
      console.error(`❌ Playwright HTML Surge deployment error: ${err.message}`);
    }
  }

  // 5. Print Terminal Summary Banner
  const summary = reportGenerated ? getReportSummary(REPORT_DIR) : null;
  if (surgeUrl) {
    printBanner({ testStatus, envName: targetEnv, url: surgeUrl, summary });
  } else {
    console.log('\n========================================');
    console.log('ALLURE REPORT SUMMARY');
    console.log('========================================');
    console.log(`Test Status: ${testStatus}`);
    console.log(`Environment: ${targetEnv.toUpperCase()}`);
    if (summary) {
      console.log(`Tests: ${summary.total} (Passed: ${summary.passed}, Failed: ${summary.failed}, Broken: ${summary.broken}, Skipped: ${summary.skipped})`);
    }
    console.log('Surge: Deployment was not completed.');
    console.log('========================================\n');
  }

  // 6. Send advanced HTML email report
  await sendEmail(targetEnv.toUpperCase(), testPassed, surgeUrl || `https://${domain}`, envOverrides.BASE_URL, summary, pwReportUrl);

  // 7. Exit with Playwright's exit code to preserve CI/CD test failure semantics
  process.exit(testExitCode);
}

main().catch((err) => {
  console.error('Fatal error in test runner:', err);
  process.exit(1);
});



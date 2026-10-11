/**
 * emailTemplate.js
 * Generates a rich, advanced HTML email body for Playwright/Allure test results.
 *
 * @param {object} opts
 * @param {string}  opts.envName              - e.g. "QA1"
 * @param {string}  opts.baseUrl              - App URL under test
 * @param {string}  opts.reportUrl            - Allure / Surge URL
 * @param {string}  opts.playwrightReportUrl  - Playwright HTML report URL (optional)
 * @param {boolean} opts.passed               - Overall pass/fail
 * @param {number}  opts.total
 * @param {number}  opts.pass
 * @param {number}  opts.fail
 * @param {number}  opts.broken
 * @param {number}  opts.skipped
 * @param {string}  opts.duration             - e.g. "2m 34s"
 * @param {string}  opts.timestamp            - ISO timestamp
 * @param {Array}   opts.suites               - [{ name, total, pass, fail, skipped }]
 * @param {Array}   opts.failedTests          - [{ suite, title, error }]
 * @returns {string} Full HTML string
 */
function buildEmailHTML(opts) {
  const {
    envName = 'QA1',
    baseUrl = '',
    reportUrl = '#',
    playwrightReportUrl = null,
    passed = false,
    total = 0,
    pass = 0,
    fail = 0,
    broken = 0,
    skipped = 0,
    duration = 'N/A',
    timestamp = new Date().toISOString(),
    suites = [],
    failedTests = [],
    hasAttachment = false,
  } = opts;

  const statusColor = passed ? '#10b981' : '#ef4444';
  const statusBg    = passed ? '#d1fae5' : '#fee2e2';
  const statusLabel = passed ? 'PASSED' : 'FAILED';
  const statusIcon  = passed ? '&#x2705;' : '&#x274C;';
  const passRate    = total > 0 ? Math.round((pass / total) * 100) : 0;
  const failRate    = total > 0 ? Math.round(((fail + broken) / total) * 100) : 0;
  const skipRate    = total > 0 ? Math.round((skipped / total) * 100) : 0;

  let formattedTime = timestamp;
  try {
    formattedTime = new Date(timestamp).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    }) + ' IST';
  } catch (_) { /* keep raw */ }

  // Suite rows
  const suiteRows = suites.length > 0
    ? suites.map(s => {
        const sPct   = s.total > 0 ? Math.round((s.pass / s.total) * 100) : 0;
        const sColor = s.fail > 0 ? '#ef4444' : '#10b981';
        return `<tr style="border-bottom:1px solid #f1f5f9;">
          <td style="padding:10px 14px;font-size:12px;color:#334155;max-width:220px;word-break:break-word;">${escHtml(s.name)}</td>
          <td style="padding:10px 14px;text-align:center;font-size:13px;font-weight:700;color:#475569;">${s.total}</td>
          <td style="padding:10px 14px;text-align:center;font-size:13px;font-weight:700;color:#10b981;">${s.pass}</td>
          <td style="padding:10px 14px;text-align:center;font-size:13px;font-weight:700;color:#ef4444;">${s.fail}</td>
          <td style="padding:10px 14px;text-align:center;font-size:13px;font-weight:700;color:#f59e0b;">${s.skipped || 0}</td>
          <td style="padding:10px 14px;text-align:center;">
            <span style="display:inline-block;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700;color:#fff;background:${sColor};">${sPct}%</span>
          </td>
        </tr>`;
      }).join('')
    : `<tr><td colspan="6" style="padding:16px;text-align:center;color:#94a3b8;font-size:13px;">No suite data available</td></tr>`;

  // Failed test rows (max 10)
  const failedRows = failedTests.slice(0, 10).map(t => `
    <tr style="border-bottom:1px solid #fef2f2;">
      <td style="padding:10px 14px;font-size:12px;color:#dc2626;font-weight:600;max-width:140px;word-break:break-word;">${escHtml(t.suite)}</td>
      <td style="padding:10px 14px;font-size:12px;color:#475569;max-width:220px;word-break:break-word;">${escHtml(t.title)}</td>
      <td style="padding:10px 14px;font-size:11px;color:#64748b;max-width:200px;word-break:break-word;font-family:monospace;">${escHtml((t.error || '').substring(0, 120))}${(t.error || '').length > 120 ? '&#x2026;' : ''}</td>
    </tr>`).join('');

  const pwBtn = playwrightReportUrl
    ? `<a href="${playwrightReportUrl}" style="display:inline-block;margin-left:12px;padding:14px 28px;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;">&#x1F5A5; Playwright HTML Report</a>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Test Report – ${escHtml(envName)}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 12px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:700px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.10);">

<!-- HEADER -->
<tr>
  <td style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#0369a1 100%);padding:34px 36px 26px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td>
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#7dd3fc;letter-spacing:2.5px;text-transform:uppercase;">Hi Busy Automation Suite</p>
        <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#fff;line-height:1.2;">Playwright Test Execution Report</h1>
        <p style="margin:0;font-size:13px;color:#94a3b8;">&#x1F310; ${escHtml(baseUrl)} &nbsp;&#124;&nbsp; &#x1F550; ${formattedTime}</p>
      </td>
      <td align="right" valign="middle" style="padding-left:16px;">
        <div style="padding:10px 20px;background:${statusBg};border-radius:30px;border:2px solid ${statusColor};text-align:center;">
          <div style="font-size:22px;">${statusIcon}</div>
          <div style="font-size:15px;font-weight:800;color:${statusColor};">${statusLabel}</div>
        </div>
        <p style="margin:8px 0 0;font-size:12px;color:#94a3b8;text-align:center;"><strong style="color:#e2e8f0;">${escHtml(envName)}</strong></p>
      </td>
    </tr></table>
  </td>
</tr>

<!-- STATS CARDS -->
<tr>
  <td style="padding:26px 28px 0;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="20%" style="padding:0 5px 0 0;">
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:16px 8px;text-align:center;">
            <div style="font-size:30px;font-weight:800;color:#0f172a;">${total}</div>
            <div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1.2px;margin-top:4px;">Total</div>
          </div>
        </td>
        <td width="20%" style="padding:0 5px;">
          <div style="background:#f0fdf4;border:2px solid #bbf7d0;border-radius:14px;padding:16px 8px;text-align:center;">
            <div style="font-size:30px;font-weight:800;color:#16a34a;">${pass}</div>
            <div style="font-size:10px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:1.2px;margin-top:4px;">&#x2705; Passed</div>
          </div>
        </td>
        <td width="20%" style="padding:0 5px;">
          <div style="background:#fef2f2;border:2px solid #fecaca;border-radius:14px;padding:16px 8px;text-align:center;">
            <div style="font-size:30px;font-weight:800;color:#dc2626;">${fail}</div>
            <div style="font-size:10px;font-weight:700;color:#b91c1c;text-transform:uppercase;letter-spacing:1.2px;margin-top:4px;">&#x274C; Failed</div>
          </div>
        </td>
        <td width="20%" style="padding:0 5px;">
          <div style="background:#fff7ed;border:2px solid #fed7aa;border-radius:14px;padding:16px 8px;text-align:center;">
            <div style="font-size:30px;font-weight:800;color:#ea580c;">${broken}</div>
            <div style="font-size:10px;font-weight:700;color:#c2410c;text-transform:uppercase;letter-spacing:1.2px;margin-top:4px;">&#x1F525; Broken</div>
          </div>
        </td>
        <td width="20%" style="padding:0 0 0 5px;">
          <div style="background:#fefce8;border:2px solid #fde68a;border-radius:14px;padding:16px 8px;text-align:center;">
            <div style="font-size:30px;font-weight:800;color:#ca8a04;">${skipped}</div>
            <div style="font-size:10px;font-weight:700;color:#a16207;text-transform:uppercase;letter-spacing:1.2px;margin-top:4px;">&#x23ED; Skipped</div>
          </div>
        </td>
      </tr>
    </table>
  </td>
</tr>

<!-- PASS RATE BAR -->
<tr>
  <td style="padding:22px 28px 0;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="font-size:13px;font-weight:700;color:#334155;">Pass Rate</td>
        <td align="right" style="font-size:14px;font-weight:800;color:${statusColor};">${passRate}%</td>
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;height:14px;background:#e2e8f0;border-radius:999px;overflow:hidden;">
      <tr>
        ${passRate > 0 ? `<td width="${passRate}%" style="background:#10b981;height:14px;"></td>` : ''}
        ${failRate > 0 ? `<td width="${failRate}%" style="background:#ef4444;height:14px;"></td>` : ''}
        ${skipRate > 0 ? `<td width="${skipRate}%" style="background:#f59e0b;height:14px;"></td>` : ''}
        <td style="background:#e2e8f0;height:14px;"></td>
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
      <tr>
        <td style="font-size:11px;color:#10b981;font-weight:700;">&#x25CF; Passed ${passRate}%</td>
        <td align="center" style="font-size:11px;color:#ef4444;font-weight:700;">&#x25CF; Failed+Broken ${failRate}%</td>
        <td align="right" style="font-size:11px;color:#f59e0b;font-weight:700;">&#x25CF; Skipped ${skipRate}%</td>
      </tr>
    </table>
  </td>
</tr>

<!-- META ROW -->
<tr>
  <td style="padding:18px 28px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
      <tr>
        <td style="padding:14px 18px;border-right:1px solid #e2e8f0;text-align:center;">
          <div style="font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:1px;">&#x23F1; Duration</div>
          <div style="font-size:16px;font-weight:800;color:#0f172a;margin-top:4px;">${escHtml(duration)}</div>
        </td>
        <td style="padding:14px 18px;border-right:1px solid #e2e8f0;text-align:center;">
          <div style="font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:1px;">&#x1F30D; Environment</div>
          <div style="font-size:16px;font-weight:800;color:#0f172a;margin-top:4px;">${escHtml(envName)}</div>
        </td>
        <td style="padding:14px 18px;text-align:center;">
          <div style="font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:1px;">&#x1F3D7; Suites</div>
          <div style="font-size:16px;font-weight:800;color:#0f172a;margin-top:4px;">${suites.length}</div>
        </td>
      </tr>
    </table>
  </td>
</tr>

<!-- SUITE BREAKDOWN -->
${suites.length > 0 ? `
<tr>
  <td style="padding:22px 28px 0;">
    <h3 style="margin:0 0 12px;font-size:14px;font-weight:700;color:#0f172a;">&#x1F4CB; Test Suite Breakdown</h3>
    <div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="padding:10px 14px;text-align:left;font-size:11px;color:#475569;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;">Suite / File</th>
            <th style="padding:10px 14px;text-align:center;font-size:11px;color:#475569;font-weight:700;text-transform:uppercase;">Total</th>
            <th style="padding:10px 14px;text-align:center;font-size:11px;color:#10b981;font-weight:700;text-transform:uppercase;">Pass</th>
            <th style="padding:10px 14px;text-align:center;font-size:11px;color:#ef4444;font-weight:700;text-transform:uppercase;">Fail</th>
            <th style="padding:10px 14px;text-align:center;font-size:11px;color:#f59e0b;font-weight:700;text-transform:uppercase;">Skip</th>
            <th style="padding:10px 14px;text-align:center;font-size:11px;color:#475569;font-weight:700;text-transform:uppercase;">Rate</th>
          </tr>
        </thead>
        <tbody>${suiteRows}</tbody>
      </table>
    </div>
  </td>
</tr>` : ''}

<!-- FAILED TESTS TABLE -->
${failedTests.length > 0 ? `
<tr>
  <td style="padding:22px 28px 0;">
    <h3 style="margin:0 0 12px;font-size:14px;font-weight:700;color:#b91c1c;">&#x26A0; Failed Tests (showing ${Math.min(failedTests.length, 10)} of ${failedTests.length})</h3>
    <div style="border:1px solid #fecaca;border-radius:12px;overflow:hidden;background:#fff7f7;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <thead>
          <tr style="background:#fee2e2;">
            <th style="padding:10px 14px;text-align:left;font-size:11px;color:#991b1b;font-weight:700;text-transform:uppercase;">Suite</th>
            <th style="padding:10px 14px;text-align:left;font-size:11px;color:#991b1b;font-weight:700;text-transform:uppercase;">Test Case</th>
            <th style="padding:10px 14px;text-align:left;font-size:11px;color:#991b1b;font-weight:700;text-transform:uppercase;">Error</th>
          </tr>
        </thead>
        <tbody>${failedRows}</tbody>
      </table>
    </div>
  </td>
</tr>` : ''}

<!-- ATTACHMENT NOTICE -->
${hasAttachment ? `
<tr>
  <td style="padding:22px 28px 0;">
    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:14px 18px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="32" valign="middle" style="font-size:22px;">&#x1F4CE;</td>
          <td style="padding-left:10px;">
            <div style="font-size:13px;font-weight:700;color:#166534;">Playwright Default HTML Report Attached</div>
            <div style="font-size:12px;color:#15803d;margin-top:2px;">
              Attached as <strong style="color:#14532d;">Playwright-Report-${escHtml(envName)}.html</strong>. Download and open in any browser for interactive traces, steps, and failure screenshots.
            </div>
          </td>
        </tr>
      </table>
    </div>
  </td>
</tr>` : ''}

<!-- CTA BUTTONS -->
<tr>
  <td style="padding:30px 28px 26px;text-align:center;">
    <a href="${reportUrl}" style="display:inline-block;padding:14px 30px;background:linear-gradient(135deg,#0369a1,#0ea5e9);color:#fff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;">&#x1F4CA; View Allure Report</a>
    ${pwBtn}
  </td>
</tr>

<!-- DIVIDER -->
<tr><td style="padding:0 28px;"><hr style="border:none;border-top:1px solid #e2e8f0;margin:0;"/></td></tr>

<!-- FOOTER -->
<tr>
  <td style="padding:18px 28px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td>
        <p style="margin:0;font-size:12px;color:#94a3b8;">&#x1F916; Generated by <strong style="color:#475569;">Hi Busy Playwright Automation</strong></p>
        <p style="margin:4px 0 0;font-size:11px;color:#cbd5e1;">This is an automated report. Please do not reply to this email.</p>
      </td>
      <td align="right">
        <p style="margin:0;font-size:11px;color:#94a3b8;">${formattedTime}</p>
      </td>
    </tr></table>
  </td>
</tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildSubject(envName, passed, total, pass, fail) {
  const status = passed ? 'PASSED' : 'FAILED';
  const icon   = passed ? '✅' : '❌';
  return `[${envName}] Playwright Report ${icon} ${status} | ${pass}/${total} Passed${fail > 0 ? ` | ${fail} Failed` : ''}`;
}

/**
 * Parse Playwright JSON results file into structured summary.
 */
function parsePlaywrightResults(jsonPath) {
  const fs = require('fs');
  const result = { total: 0, pass: 0, fail: 0, broken: 0, skipped: 0, duration: 'N/A', suites: [], failedTests: [] };
  if (!jsonPath || !fs.existsSync(jsonPath)) return result;

  let data;
  try { data = JSON.parse(fs.readFileSync(jsonPath, 'utf8')); }
  catch (_) { return result; }

  if (data.stats) result.duration = formatDuration(data.stats.duration || 0);

  (data.suites || []).forEach(topSuite => {
    const fileSummary = { name: topSuite.file || topSuite.title || 'Unknown', total: 0, pass: 0, fail: 0, skipped: 0 };

    function walk(s) {
      (s.specs || []).forEach(spec => {
        (spec.tests || []).forEach(test => {
          fileSummary.total++;
          result.total++;
          const last   = (test.results || []).slice(-1)[0];
          const status = last ? last.status : 'unknown';
          if (status === 'passed') { fileSummary.pass++; result.pass++; }
          else if (status === 'failed' || status === 'timedOut') {
            fileSummary.fail++; result.fail++;
            const errMsg = (last && last.error) ? (last.error.message || '') : '';
            result.failedTests.push({
              suite: topSuite.file || topSuite.title || '',
              title: spec.title || '',
              error: errMsg.replace(/\u001b\[[0-9;]*m/g, '')
            });
          } else if (status === 'interrupted') { result.broken++; }
          else if (status === 'skipped') { fileSummary.skipped++; result.skipped++; }
        });
      });
      (s.suites || []).forEach(walk);
    }

    walk(topSuite);
    if (fileSummary.total > 0) result.suites.push(fileSummary);
  });

  return result;
}

function mergeStats(allureSummary, pwStats) {
  if (allureSummary) {
    return {
      total:   allureSummary.total   || pwStats.total,
      pass:    allureSummary.passed  || pwStats.pass,
      fail:    allureSummary.failed  || pwStats.fail,
      broken:  allureSummary.broken  || pwStats.broken,
      skipped: allureSummary.skipped || pwStats.skipped,
    };
  }
  return { total: pwStats.total, pass: pwStats.pass, fail: pwStats.fail, broken: pwStats.broken, skipped: pwStats.skipped };
}

function formatDuration(ms) {
  if (!ms || ms <= 0) return 'N/A';
  const totalSec = Math.round(ms / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

module.exports = { buildEmailHTML, buildSubject, parsePlaywrightResults, mergeStats, formatDuration };

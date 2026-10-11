const ExcelJS = require('exceljs');
const path = require('path');

/**
 * Script to generate sample LoginData.xlsx with test data
 * Run with: node scripts/generateLoginData.js
 */
async function generateLoginData() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Login');

  // Define headers
  const headers = ['Execute', 'TC_ID', 'Priority', 'Role', 'Scenario', 'Email', 'Password', 'ExpectedResult', 'ExpectedDashboard'];

  // Add headers
  worksheet.addRow(headers);
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };

  // Define credentials from environment or default dummy test accounts
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'password123';
  const busyTeamEmail = process.env.BUSY_TEAM_EMAIL || 'busy_team@example.com';
  const busyTeamPassword = process.env.BUSY_TEAM_PASSWORD || 'password123';
  const cpEmail = process.env.CHANNEL_PARTNER_EMAIL || 'partner@example.com';
  const cpPassword = process.env.CHANNEL_PARTNER_PASSWORD || 'password123';

  // Test data - Positive Tests (P0 Priority)
  const testData = [
    ['Yes', 'LOGIN-TC-001', 'P0', 'admin', 'Valid Admin Login', adminEmail, adminPassword, 'Dashboard', 'admin'],
    ['Yes', 'LOGIN-TC-002', 'P0', 'busy_team', 'Valid Busy Team Login', busyTeamEmail, busyTeamPassword, 'Dashboard', 'busy_team'],
    ['Yes', 'LOGIN-TC-003', 'P0', 'channel_partner', 'Valid Channel Partner Login', cpEmail, cpPassword, 'Dashboard', 'partner'],

    // Negative Tests (P1 Priority) - Invalid Credentials
    ['Yes', 'LOGIN-TC-004', 'P1', 'admin', 'Invalid Email Format', 'invalidemail', '123456', 'Login Failed', ''],
    ['Yes', 'LOGIN-TC-005', 'P1', 'admin', 'Invalid Password', 'rajan.raman@tech.busy.in', 'wrongpassword123', 'Login Failed', ''],
    ['Yes', 'LOGIN-TC-006', 'P1', 'admin', 'Both Email and Password Invalid', 'invalid@invalid.com', 'wrongpassword123', 'Login Failed', ''],

    // Validation Tests (P1 Priority) - Blank Fields
    ['Yes', 'LOGIN-TC-007', 'P1', 'admin', 'Blank Email Field', '', '123456', 'Validation Error', ''],
    ['Yes', 'LOGIN-TC-008', 'P1', 'admin', 'Blank Password Field', 'rajan.raman@tech.busy.in', '', 'Validation Error', ''],
    ['Yes', 'LOGIN-TC-009', 'P1', 'admin', 'Both Email and Password Blank', '', '', 'Validation Error', ''],

    // Validation Tests (P1 Priority) - Malformed Emails
    ['Yes', 'LOGIN-TC-010', 'P1', 'admin', 'Malformed Email Missing @ Symbol', 'testemaildomain.com', '123456', 'Validation Error', ''],
    ['Yes', 'LOGIN-TC-011', 'P1', 'admin', 'Email with Multiple @ Symbols', 'test@@example.com', '123456', 'Validation Error', ''],
    ['Yes', 'LOGIN-TC-012', 'P1', 'admin', 'Email with Leading Space', ' rajan.raman@tech.busy.in', '123456', 'Login Failed or Success', ''],
    ['Yes', 'LOGIN-TC-013', 'P1', 'admin', 'Email with Trailing Space', 'rajan.raman@tech.busy.in ', '123456', 'Login Failed or Success', ''],

    // Boundary Tests (P2 Priority)
    ['No', 'LOGIN-TC-014', 'P2', 'admin', 'Very Long Email Address', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@example.com', '123456', 'Login Failed', ''],
    ['No', 'LOGIN-TC-015', 'P2', 'admin', 'Very Long Password', 'rajan.raman@tech.busy.in', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'Login Failed', ''],
    ['Yes', 'LOGIN-TC-016', 'P2', 'admin', 'Email Case Sensitivity - Uppercase', 'RAJAN.RAMAN@TECH.BUSY.IN', '123456', 'Dashboard or Login Failed', ''],
    ['No', 'LOGIN-TC-017', 'P2', 'admin', 'Email with Special Characters', 'test+label@example.com', '123456', 'Login Failed', ''],

    // UI/UX Tests (P2 Priority)
    ['Yes', 'LOGIN-TC-018', 'P2', 'admin', 'Password Field is Masked', 'rajan.raman@tech.busy.in', '123456', 'Validation', ''],
    ['Yes', 'LOGIN-TC-019', 'P2', 'admin', 'All Login Page Elements Visible', '', '', 'Validation', ''],
    ['Yes', 'LOGIN-TC-020', 'P2', 'admin', 'Login Button Initially Enabled', '', '', 'Validation', ''],

    // Session Tests (P1 Priority)
    ['No', 'LOGIN-TC-021', 'P1', 'admin', 'Session Persists After Page Refresh', 'rajan.raman@tech.busy.in', '123456', 'Session Persists', 'admin'],
    ['Yes', 'LOGIN-TC-022', 'P1', 'admin', 'Logout Redirects to Login Page', 'rajan.raman@tech.busy.in', '123456', 'Redirect to Login', ''],
    ['No', 'LOGIN-TC-023', 'P1', 'admin', 'Cannot Access Dashboard After Logout', 'rajan.raman@tech.busy.in', '123456', 'Redirect to Login', ''],
    ['Yes', 'LOGIN-TC-024', 'P1', 'admin', 'Login with Enter Key', 'rajan.raman@tech.busy.in', '123456', 'Dashboard', 'admin'],

    // Advanced Tests (P1 Priority)
    ['No', 'LOGIN-TC-025', 'P1', 'admin', 'Multiple Failed Login Attempts', 'rajan.raman@tech.busy.in', 'wrongpassword', 'Login Failed', ''],
    ['Yes', 'LOGIN-TC-026', 'P1', 'admin', 'Retry Login After Failed Attempt', 'rajan.raman@tech.busy.in', '123456', 'Dashboard', 'admin'],
    ['Yes', 'LOGIN-TC-027', 'P1', 'admin', 'Login and Clear Form', '', '', 'Validation', ''],
    ['No', 'LOGIN-TC-028', 'P2', 'admin', 'Tab Navigation Order', '', '', 'Navigation', ''],

    // Role-Based Tests (P2 Priority)
    ['Yes', 'LOGIN-TC-031', 'P2', 'admin', 'Admin Login Displays Admin Dashboard', adminEmail, adminPassword, 'Dashboard', 'admin'],
    ['Yes', 'LOGIN-TC-032', 'P2', 'admin', 'Admin Dashboard URL Contains Admin', adminEmail, adminPassword, 'URL Verification', 'admin'],
    ['Yes', 'LOGIN-TC-033', 'P2', 'busy_team', 'Logout and Login as Different Role', busyTeamEmail, busyTeamPassword, 'Dashboard', 'busy_team'],
    ['No', 'LOGIN-TC-034', 'P2', 'admin', 'Verify Admin Menu Items After Login', adminEmail, adminPassword, 'Menu Verification', 'admin'],
    ['No', 'LOGIN-TC-035', 'P2', 'busy_team', 'Verify Busy Team Menu Items After Login', busyTeamEmail, busyTeamPassword, 'Menu Verification', 'busy_team'],

    // Edge Cases (P2 Priority)
    ['No', 'LOGIN-TC-036', 'P2', 'admin', 'Email with Subdomain', 'test.subdomain@mail.example.co.uk', adminPassword, 'Login Failed', ''],
    ['No', 'LOGIN-TC-037', 'P2', 'admin', 'Password with Special Characters', adminEmail, 'P@$$w0rd!#%', 'Login Failed', ''],
    ['Yes', 'LOGIN-TC-038', 'P2', 'admin', 'Login Page Title Verification', '', '', 'Validation', ''],
    ['No', 'LOGIN-TC-039', 'P2', 'admin', 'Verify Loading Spinner During Login', adminEmail, adminPassword, 'Dashboard', 'admin'],
    ['Yes', 'LOGIN-TC-040', 'P1', 'admin', 'Error Message Does Not Expose User Info', 'nonexistent@example.com', '123456', 'Generic Error', ''],
  ];

  // Add test data rows
  testData.forEach((row, index) => {
    worksheet.addRow(row);
    // Alternate row colors for readability
    if (index % 2 === 0) {
      worksheet.getRow(index + 2).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF0F0F0' },
      };
    }
  });

  // Set column widths
  worksheet.columns = [
    { width: 8 },  // Execute
    { width: 15 }, // TC_ID
    { width: 10 }, // Priority
    { width: 18 }, // Role
    { width: 40 }, // Scenario
    { width: 35 }, // Email
    { width: 25 }, // Password
    { width: 25 }, // ExpectedResult
    { width: 20 }, // ExpectedDashboard
  ];

  // Freeze header row
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];

  // Save the file
  const filePath = path.join(__dirname, '../test-data/LoginData.xlsx');
  await workbook.xlsx.writeFile(filePath);

  console.log(`✓ LoginData.xlsx generated successfully at: ${filePath}`);
  console.log(`✓ Total test cases: ${testData.length}`);
  console.log(`✓ Executable tests (Execute=Yes): ${testData.filter(row => row[0] === 'Yes').length}`);
  console.log(`✓ Columns: ${headers.join(', ')}`);
}

// Run the script
generateLoginData().catch((error) => {
  console.error('✗ Error generating LoginData.xlsx:', error);
  process.exit(1);
});

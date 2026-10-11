const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

/**
 * Script to generate purchaseData.xlsx for the Data-Driven Purchase Module.
 * Run with: node scripts/generatePurchaseData.js
 */
async function generatePurchaseData() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('TestData');

  // Define headers as per test requirements
  const headers = [
    'Execute',
    'Role',
    'Email',
    'password',
    'Product_name',
    'Plan_name',
    'Model_name',
    'Enter_Qnt',
    'Tenure',
    'Region',
    'category',
    'UserCount'
  ];

  // Add headers row
  worksheet.addRow(headers);
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };

  // Data rows
  const data = [
    [
      'yes',
      'Primary_user',
      'hi_hi_3minfocare@gmail.com',
      '123456',
      'Perpetual',
      'Basic',
      'Single User',
      1,
      360,
      'India',
      'FOC',
      ''
    ],
    [
      'yes',
      'Primary_user',
      'hi_hi_3minfocare@gmail.com',
      '123456',
      'Subscription',
      'Blue',
      'Multi User',
      1,
      360,
      'India',
      'Regular',
      ''
    ],
    [
      'yes',
      'Primary_user',
      'hi_hi_3minfocare@gmail.com',
      '123456',
      'Busy Magic',
      'Smart',
      '',
      1,
      360,
      'India',
      'Regular',
      '5'
    ]
  ];

  data.forEach((row) => {
    worksheet.addRow(row);
  });

  // Ensure directories exist
  const dataDir = path.join(__dirname, '..', 'data');
  const testDataDir = path.join(__dirname, '..', 'test-data');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(testDataDir)) {
    fs.mkdirSync(testDataDir, { recursive: true });
  }

  const filePath1 = path.join(dataDir, 'purchaseData.xlsx');
  const filePath2 = path.join(testDataDir, 'purchaseData.xlsx');

  await workbook.xlsx.writeFile(filePath1);
  await workbook.xlsx.writeFile(filePath2);

  console.log(`✓ Successfully generated ${filePath1}`);
  console.log(`✓ Successfully generated ${filePath2}`);
}

generatePurchaseData().catch((err) => {
  console.error('Failed to generate purchase test data:', err);
  process.exit(1);
});

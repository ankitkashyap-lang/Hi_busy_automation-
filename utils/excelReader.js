const ExcelJS = require('exceljs');
const path = require('path');
const Logger = require('./logger.js');

/**
 * ExcelReader - Utility to read Excel files
 * Parses Excel data and returns as array of objects
 */
class ExcelReader {
  constructor() {
    this.logger = Logger.getInstance();
  }

  /**
   * Read Excel file
   */
  async readFile(filePath) {
    try {
      this.logger.info(`Reading Excel file: ${filePath}`);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      return workbook;
    } catch (error) {
      this.logger.error(`Failed to read Excel file: ${error.message}`);
      throw error;
    }
  }

  /**
   * Read worksheet data
   */
  async readWorksheet(filePath, sheetName = null) {
    try {
      const workbook = await this.readFile(filePath);
      const worksheet = sheetName
        ? workbook.getWorksheet(sheetName)
        : workbook.worksheets[0];

      if (!worksheet) {
        throw new Error('Worksheet not found');
      }

      return this.parseWorksheet(worksheet);
    } catch (error) {
      this.logger.error(`Failed to read worksheet: ${error.message}`);
      throw error;
    }
  }

  /**
   * Parse worksheet to array of objects
   */
  parseWorksheet(worksheet) {
    const data = [];
    const headers = [];

    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      if (rowNumber === 1) {
        // First row is header
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          let headerVal = cell.value;
          if (headerVal !== null && typeof headerVal === 'object') {
            headerVal = headerVal.text || headerVal.result || '';
          }
          headers.push(headerVal ? String(headerVal).trim() : `Col${colNumber}`);
        });
      } else {
        // Data rows
        const rowData = {};
        let hasValue = false;
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const header = headers[colNumber - 1];
          if (header) {
            let val = cell.value;
            if (val !== null && typeof val === 'object') {
              if (val.text !== undefined) val = val.text;
              else if (val.result !== undefined) val = val.result;
            }
            const cleanVal = val !== null && val !== undefined ? String(val).trim() : '';
            rowData[header] = cleanVal;
            if (cleanVal !== '') hasValue = true;
          }
        });
        if (hasValue) {
          data.push(rowData);
        }
      }
    });

    this.logger.info(`Parsed ${data.length} rows from worksheet`);
    return data;
  }

  /**
   * Read Login data
   */
  async readLoginData(filePath) {
    try {
      const data = await this.readWorksheet(filePath, 'Login');
      return data;
    } catch (error) {
      this.logger.error(`Failed to read login data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Read Partner test data
   */
  async readPartnerData(filePath) {
    try {
      const data = await this.readWorksheet(filePath, 'Partners');
      return data;
    } catch (error) {
      this.logger.error(`Failed to read partner data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Read Subscription Purchase data
   */
  async readSubscriptionData(filePath) {
    try {
      const data = await this.readWorksheet(filePath, 'Purchase');
      // Filter only rows where Execute = 'Yes'
      return data.filter((row) => row.Execute === 'Yes' || row.Execute === true);
    } catch (error) {
      this.logger.error(`Failed to read subscription data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Read Customer data
   */


  async readCustomerData(filePath) {
    try {
      const data = await this.readWorksheet(filePath, 'Customers');
      return data.filter((row) => String(row.Execute).trim().toLowerCase() === 'yes' || row.Execute === true);
    } catch (error) {
      this.logger.error(`Failed to read customer data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get specific sheet names
   */
  async getSheetNames(filePath) {
    try {
      const workbook = await this.readFile(filePath);
      return workbook.worksheets.map((ws) => ws.name);
    } catch (error) {
      this.logger.error(`Failed to get sheet names: ${error.message}`);
      throw error;
    }
  }

  /**
   * Read specific rows
   */
  async readRows(filePath, sheetName, rowStart, rowEnd) {
    try {
      const workbook = await this.readFile(filePath);
      const worksheet = workbook.getWorksheet(sheetName);

      if (!worksheet) {
        throw new Error('Worksheet not found');
      }

      const data = [];
      const headers = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) {
          row.eachCell((cell) => {
            headers.push(cell.value);
          });
        } else if (rowNumber >= rowStart && rowNumber <= rowEnd) {
          const rowData = {};
          row.eachCell((cell, colNumber) => {
            rowData[headers[colNumber - 1]] = cell.value;
          });
          data.push(rowData);
        }
      });

      return data;
    } catch (error) {
      this.logger.error(`Failed to read rows: ${error.message}`);
      throw error;
    }
  }
}

const xlsx = require('xlsx');
const fs = require('fs');

/**
 * Reads the TestData sheet from the excel file and returns
 * only the rows where Execute = "yes".
 */
function getTestData(filePath = null, sheetName = 'TestData') {
  if (!filePath) {
    const candidatePaths = [
      path.join(__dirname, '..', 'test-data', 'purchaseData.xlsx'),
      path.join(__dirname, '..', 'data', 'purchaseData.xlsx'),
      path.join(__dirname, '..', 'test-data', 'testdata.xlsx'),
      path.join(__dirname, '..', 'data', 'testdata.xlsx'),
    ];

    const existingCandidates = candidatePaths.filter((p) => fs.existsSync(p));

    if (existingCandidates.length > 0) {
      existingCandidates.sort((a, b) => {
        try {
          const wbA = xlsx.readFile(a);
          const wbB = xlsx.readFile(b);
          const rowsA = xlsx.utils.sheet_to_json(wbA.Sheets[wbA.SheetNames[0]] || {});
          const rowsB = xlsx.utils.sheet_to_json(wbB.Sheets[wbB.SheetNames[0]] || {});
          if (rowsB.length !== rowsA.length) {
            return rowsB.length - rowsA.length;
          }
        } catch (e) {}
        return fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs;
      });

      filePath = existingCandidates[0];
    }
  }

  if (!filePath || !fs.existsSync(filePath)) {
    return [];
  }

  const workbook = xlsx.readFile(filePath);
  const targetSheetName = sheetName && workbook.Sheets[sheetName] ? sheetName : workbook.SheetNames[0];
  const sheet = workbook.Sheets[targetSheetName];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

  return rows.filter((row) => String(row.Execute).trim().toLowerCase() === 'yes');
}

ExcelReader.getTestData = getTestData;

module.exports = ExcelReader;
module.exports.ExcelReader = ExcelReader;
module.exports.getTestData = getTestData;


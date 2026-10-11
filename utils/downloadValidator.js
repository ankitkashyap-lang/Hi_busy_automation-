const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const ExcelJS = require('exceljs');
const Logger = require('./logger');

/**
 * Enterprise Download & File Validation Utility
 * Validates file existence, size, extension, filename patterns, and Excel/CSV content.
 */
class DownloadValidator {
  constructor() {
    this.logger = Logger.getInstance();
  }

  /**
   * Cleans old downloaded files in the target directory
   * @param {string} dirPath 
   */
  cleanDownloadsDir(dirPath = path.join(process.cwd(), 'downloads')) {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        this.logger.info(`Created downloads directory: ${dirPath}`);
        return;
      }
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isFile()) {
          fs.unlinkSync(fullPath);
        }
      }
      this.logger.info(`Cleaned ${files.length} old file(s) from downloads directory`);
    } catch (error) {
      this.logger.warn(`Failed to clean downloads directory: ${error.message}`);
    }
  }

  /**
   * Saves a Playwright download object and returns full file path
   * @param {import('@playwright/test').Download} download 
   * @param {string} targetDir 
   * @returns {Promise<{ filePath: string, filename: string }>}
   */
  async saveDownload(download, targetDir = path.join(process.cwd(), 'downloads')) {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const suggestedFilename = download.suggestedFilename();
    const filePath = path.join(targetDir, suggestedFilename);
    await download.saveAs(filePath);
    this.logger.info(`Saved downloaded file to: ${filePath}`);
    return { filePath, filename: suggestedFilename };
  }

  /**
   * Validates file existence, non-zero size, extension, and filename pattern
   * @param {string} filePath 
   * @param {RegExp|string} [expectedPattern]
   * @returns {{ exists: boolean, size: number, extension: string, filename: string, isSizeValid: boolean, isPatternValid: boolean }}
   */
  validateFileBasics(filePath, expectedPattern = null) {
    const exists = fs.existsSync(filePath);
    if (!exists) {
      return {
        exists: false,
        size: 0,
        extension: '',
        filename: path.basename(filePath),
        isSizeValid: false,
        isPatternValid: false
      };
    }

    const stats = fs.statSync(filePath);
    const size = stats.size;
    const filename = path.basename(filePath);
    const extension = path.extname(filePath).toLowerCase();
    const isSizeValid = size > 0;

    let isPatternValid = true;
    if (expectedPattern) {
      const regex = expectedPattern instanceof RegExp ? expectedPattern : new RegExp(expectedPattern, 'i');
      isPatternValid = regex.test(filename);
    }

    return {
      exists: true,
      size,
      extension,
      filename,
      isSizeValid,
      isPatternValid
    };
  }

  /**
   * Parses Excel / CSV file and verifies sheet count, headers, and rows
   * @param {string} filePath 
   * @returns {Promise<{ isValid: boolean, sheetNames: string[], rowCount: number, headers: string[], error?: string }>}
   */
  async validateExcelContent(filePath) {
    try {
      const ext = path.extname(filePath).toLowerCase();
      if (!['.xlsx', '.xls', '.csv'].includes(ext)) {
        return {
          isValid: false,
          sheetNames: [],
          rowCount: 0,
          headers: [],
          error: `Unsupported file extension: ${ext}`
        };
      }

      // Read workbook using xlsx for fast header/row inspection
      const workbook = xlsx.readFile(filePath);
      const sheetNames = workbook.SheetNames || [];
      if (sheetNames.length === 0) {
        return {
          isValid: false,
          sheetNames: [],
          rowCount: 0,
          headers: [],
          error: 'Workbook contains 0 sheets'
        };
      }

      const firstSheet = workbook.Sheets[sheetNames[0]];
      const rows = xlsx.utils.sheet_to_json(firstSheet, { header: 1 });
      const headers = rows.length > 0 ? rows[0].map(h => String(h || '').trim()).filter(Boolean) : [];

      this.logger.info(`Excel validated: ${path.basename(filePath)} | Sheet: ${sheetNames[0]} | Rows: ${rows.length} | Columns: ${headers.length}`);

      return {
        isValid: true,
        sheetNames,
        rowCount: rows.length,
        headers
      };
    } catch (error) {
      this.logger.error(`Excel content validation error: ${error.message}`);
      return {
        isValid: false,
        sheetNames: [],
        rowCount: 0,
        headers: [],
        error: error.message
      };
    }
  }

  /**
   * Complete end-to-end download validation
   * @param {string} filePath 
   * @param {RegExp|string} [expectedPattern] 
   * @returns {Promise<{ isSuccess: boolean, basics: object, content: object, errors: string[] }>}
   */
  async validateDownloadedReport(filePath, expectedPattern = null) {
    const errors = [];
    const basics = this.validateFileBasics(filePath, expectedPattern);

    if (!basics.exists) {
      errors.push(`File does not exist: ${filePath}`);
      return { isSuccess: false, basics, content: null, errors };
    }

    if (!basics.isSizeValid) {
      errors.push(`File is empty (0 bytes): ${basics.filename}`);
    }

    if (!['.xlsx', '.xls', '.csv'].includes(basics.extension)) {
      errors.push(`Invalid file extension "${basics.extension}". Expected .xlsx, .xls, or .csv`);
    }

    if (!basics.isPatternValid) {
      errors.push(`Filename "${basics.filename}" did not match expected pattern: ${expectedPattern}`);
    }

    const content = await this.validateExcelContent(filePath);
    if (!content.isValid) {
      errors.push(`Content validation failed: ${content.error}`);
    }

    const isSuccess = errors.length === 0;
    return { isSuccess, basics, content, errors };
  }
}

module.exports = new DownloadValidator();

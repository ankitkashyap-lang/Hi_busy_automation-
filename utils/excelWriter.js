const ExcelJS = require('exceljs');
const path = require('path');
const Logger = require('./logger');

/**
 * ExcelWriter - Utility to write and update Excel files
 *
 * Responsibilities:
 * 1. Create Excel files
 * 2. Write test results
 * 3. Append test results
 * 4. Update individual cells
 * 5. Update test-case rows using TC_ID
 * 6. Update execution results
 */
class ExcelWriter {

  constructor() {
    this.logger = Logger.getInstance();
  }

  /**
   * ---------------------------------------------------------
   * Write results to Excel
   * ---------------------------------------------------------
   *
   * Creates a NEW workbook and writes the supplied results.
   *
   * Use this when creating a new result Excel file.
   */
  async writeResults(filePath, sheetName, results) {

    try {

      this.logger.info(
        `Writing results to Excel: ${filePath}`
      );

      const workbook = new ExcelJS.Workbook();

      const worksheet = workbook.addWorksheet(sheetName);

      if (results.length === 0) {

        throw new Error(
          'No results to write'
        );

      }

      // Get headers from first result

      const headers = Object.keys(results[0]);

      worksheet.addRow(headers);

      // Add data rows

      results.forEach((result) => {

        const row = headers.map(
          (header) => result[header]
        );

        worksheet.addRow(row);

      });

      // Auto-fit columns

      worksheet.columns.forEach((column) => {

        let maxLength = 0;

        column.eachCell(
          { includeEmpty: true },
          (cell) => {

            const length =
              cell.value
                ? cell.value.toString().length
                : 0;

            if (length > maxLength) {

              maxLength = length;

            }

          }
        );

        column.width = maxLength + 2;

      });

      await workbook.xlsx.writeFile(filePath);

      this.logger.info(
        `Results written successfully: ${filePath}`
      );

    } catch (error) {

      this.logger.error(
        `Failed to write results: ${error.message}`
      );

      throw error;

    }

  }


  /**
   * ---------------------------------------------------------
   * Append results to existing Excel
   * ---------------------------------------------------------
   */
  async appendResults(
    filePath,
    sheetName,
    results
  ) {

    try {

      this.logger.info(
        `Appending results to Excel: ${filePath}`
      );

      const workbook = new ExcelJS.Workbook();

      await workbook.xlsx.readFile(filePath);

      let worksheet =
        workbook.getWorksheet(sheetName);

      if (!worksheet) {

        worksheet =
          workbook.addWorksheet(sheetName);

      }

      results.forEach((result) => {

        worksheet.addRow(result);

      });

      await workbook.xlsx.writeFile(filePath);

      this.logger.info(
        `Results appended successfully: ${filePath}`
      );

    } catch (error) {

      this.logger.error(
        `Failed to append results: ${error.message}`
      );

      throw error;

    }

  }


  /**
   * ---------------------------------------------------------
   * Create new workbook with multiple sheets
   * ---------------------------------------------------------
   */
  async createWorkbook(
    filePath,
    sheetsData
  ) {

    try {

      this.logger.info(
        `Creating new workbook: ${filePath}`
      );

      const workbook =
        new ExcelJS.Workbook();

      for (
        const [sheetName, data]
        of Object.entries(sheetsData)
      ) {

        const worksheet =
          workbook.addWorksheet(sheetName);

        if (data.length > 0) {

          const headers =
            Object.keys(data[0]);

          worksheet.addRow(headers);

          data.forEach((row) => {

            const rowData =
              headers.map(
                (header) => row[header]
              );

            worksheet.addRow(rowData);

          });

        }

      }

      await workbook.xlsx.writeFile(filePath);

      this.logger.info(
        `Workbook created successfully: ${filePath}`
      );

    } catch (error) {

      this.logger.error(
        `Failed to create workbook: ${error.message}`
      );

      throw error;

    }

  }


  /**
   * ---------------------------------------------------------
   * Update a specific Excel cell
   * ---------------------------------------------------------
   *
   * Example:
   *
   * await ExcelWriter.updateCell(
   *   './test-data/LoginData.xlsx',
   *   'Login',
   *   'F4',
   *   'wrong@gmail.com'
   * );
   *
   */
  async updateCell(
    filePath,
    sheetName,
    cellAddress,
    value
  ) {

    try {

      this.logger.info(
        `Updating Excel cell: ${sheetName}!${cellAddress}`
      );

      const workbook =
        new ExcelJS.Workbook();

      await workbook.xlsx.readFile(filePath);

      const worksheet =
        workbook.getWorksheet(sheetName);

      if (!worksheet) {

        throw new Error(
          `Worksheet '${sheetName}' not found`
        );

      }

      worksheet.getCell(
        cellAddress
      ).value = value;

      await workbook.xlsx.writeFile(filePath);

      this.logger.info(
        `Excel cell updated successfully: ${sheetName}!${cellAddress}`
      );

    } catch (error) {

      this.logger.error(
        `Failed to update Excel cell: ${error.message}`
      );

      throw error;

    }

  }


  /**
   * ---------------------------------------------------------
   * Update an existing test case using TC_ID
   * ---------------------------------------------------------
   *
   * Example:
   *
   * await ExcelWriter.updateRowByTCID(
   *
   *   './test-data/LoginData.xlsx',
   *
   *   'Login',
   *
   *   'TC004',
   *
   *   {
   *      Email: 'wrong@gmail.com',
   *      Password: '123456'
   *   }
   *
   * );
   *
   * This will:
   *
   * 1. Find TC004
   * 2. Find Email column
   * 3. Find Password column
   * 4. Update only those values
   * 5. Preserve all other data
   */
  async updateRowByTCID(
    filePath,
    sheetName,
    tcId,
    updates
  ) {

    try {

      this.logger.info(
        `Updating test case TC_ID: ${tcId}`
      );

      const workbook =
        new ExcelJS.Workbook();

      await workbook.xlsx.readFile(filePath);

      const worksheet =
        workbook.getWorksheet(sheetName);

      if (!worksheet) {

        throw new Error(
          `Worksheet '${sheetName}' not found`
        );

      }

      /**
       * Build header map
       *
       * Example:
       *
       * TC_ID      -> 2
       * Role       -> 4
       * Email      -> 5
       * Password   -> 6
       */
      const headerMap = {};

      worksheet
        .getRow(1)
        .eachCell(
          (cell, columnNumber) => {

            if (cell.value !== null) {

              headerMap[
                String(cell.value).trim()
              ] = columnNumber;

            }

          }
        );


      /**
       * TC_ID column is mandatory
       */
      if (!headerMap.TC_ID) {

        throw new Error(
          'TC_ID column not found in Excel'
        );

      }


      /**
       * Find target test-case row
       */
      let targetRow = null;

      worksheet.eachRow(
        (row, rowNumber) => {

          if (rowNumber === 1) {

            return;

          }

          const currentTCID =
            row.getCell(
              headerMap.TC_ID
            ).value;

          if (
            String(currentTCID).trim() ===
            String(tcId).trim()
          ) {

            targetRow = row;

          }

        }
      );


      /**
       * TC_ID not found
       */
      if (!targetRow) {

        throw new Error(
          `TC_ID '${tcId}' not found in worksheet '${sheetName}'`
        );

      }


      /**
       * Update requested columns only
       */
      for (
        const [columnName, value]
        of Object.entries(updates)
      ) {

        if (!headerMap[columnName]) {

          throw new Error(
            `Column '${columnName}' not found in Excel`
          );

        }

        targetRow.getCell(
          headerMap[columnName]
        ).value = value;

      }


      /**
       * Save existing workbook
       */
      await workbook.xlsx.writeFile(filePath);

      this.logger.info(
        `TC_ID '${tcId}' updated successfully`
      );

    } catch (error) {

      this.logger.error(
        `Failed to update TC_ID '${tcId}': ${error.message}`
      );

      throw error;

    }

  }


  /**
   * ---------------------------------------------------------
   * Update test execution result
   * ---------------------------------------------------------
   *
   * Example:
   *
   * await ExcelWriter.updateExecutionResult(
   *   './test-data/LoginData.xlsx',
   *   'Login',
   *   'TC001',
   *   'PASS',
   *   'Admin dashboard displayed',
   *   ''
   * );
   *
   */
  async updateExecutionResult(
    filePath,
    sheetName,
    tcId,
    status,
    actualResult,
    remarks = ''
  ) {

    await this.updateRowByTCID(
      filePath,
      sheetName,
      tcId,
      {
        Status: status,
        'Actual Behavior': actualResult,
        Remarks: remarks
      }
    );

  }


  /**
   * ---------------------------------------------------------
   * Format cells
   * ---------------------------------------------------------
   */
  formatCell(
    worksheet,
    rowIndex,
    colIndex,
    format
  ) {

    const cell =
      worksheet.getCell(
        rowIndex,
        colIndex
      );

    Object.assign(
      cell,
      format
    );

  }

}

module.exports = new ExcelWriter();


// const ExcelJS = require('exceljs');
// const path = require('path');
// const Logger = require('./logger');

// /**
//  * ExcelWriter - Utility to write results to Excel files
//  */
// class ExcelWriter {
//   constructor() {
//     this.logger = Logger.getInstance();
//   }

//   /**
//    * Write results to Excel
//    */
//   async writeResults(filePath, sheetName, results) {
//     try {
//       this.logger.info(`Writing results to Excel: ${filePath}`);

//       const workbook = new ExcelJS.Workbook();
//       const worksheet = workbook.addWorksheet(sheetName);

//       if (results.length === 0) {
//         throw new Error('No results to write');
//       }

//       // Get headers from first result
//       const headers = Object.keys(results[0]);
//       worksheet.addRow(headers);

//       // Add data rows
//       results.forEach((result) => {
//         const row = headers.map((header) => result[header]);
//         worksheet.addRow(row);
//       });

//       // Auto-fit columns
//       worksheet.columns.forEach((column) => {
//         let maxLength = 0;
//         column.eachCell({ includeEmpty: true }, (cell) => {
//           const length = cell.value ? cell.value.toString().length : 0;
//           if (length > maxLength) {
//             maxLength = length;
//           }
//         });
//         column.width = maxLength + 2;
//       });

//       await workbook.xlsx.writeFile(filePath);
//       this.logger.info(`Results written successfully: ${filePath}`);
//     } catch (error) {
//       this.logger.error(`Failed to write results: ${error.message}`);
//       throw error;
//     }
//   }

//   /**
//    * Append results to existing Excel
//    */
//   async appendResults(filePath, sheetName, results) {
//     try {
//       this.logger.info(`Appending results to Excel: ${filePath}`);

//       const workbook = new ExcelJS.Workbook();
//       await workbook.xlsx.readFile(filePath);
//       let worksheet = workbook.getWorksheet(sheetName);

//       if (!worksheet) {
//         worksheet = workbook.addWorksheet(sheetName);
//       }

//       results.forEach((result) => {
//         worksheet.addRow(result);
//       });

//       await workbook.xlsx.writeFile(filePath);
//       this.logger.info(`Results appended successfully: ${filePath}`);
//     } catch (error) {
//       this.logger.error(`Failed to append results: ${error.message}`);
//       throw error;
//     }
//   }

//   /**
//    * Create new workbook with multiple sheets
//    */
//   async createWorkbook(filePath, sheetsData) {
//     try {
//       this.logger.info(`Creating new workbook: ${filePath}`);

//       const workbook = new ExcelJS.Workbook();

//       for (const [sheetName, data] of Object.entries(sheetsData)) {
//         const worksheet = workbook.addWorksheet(sheetName);

//         if (data.length > 0) {
//           const headers = Object.keys(data[0]);
//           worksheet.addRow(headers);

//           data.forEach((row) => {
//             const rowData = headers.map((header) => row[header]);
//             worksheet.addRow(rowData);
//           });
//         }
//       }

//       await workbook.xlsx.writeFile(filePath);
//       this.logger.info(`Workbook created successfully: ${filePath}`);
//     } catch (error) {
//       this.logger.error(`Failed to create workbook: ${error.message}`);
//       throw error;
//     }
//   }

//   /**
//    * Format cells
//    */
//   formatCell(worksheet, rowIndex, colIndex, format) {
//     const cell = worksheet.getCell(rowIndex, colIndex);
//     Object.assign(cell, format);
//   }
// }

// module.exports = new ExcelWriter();

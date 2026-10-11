const Logger = require('./logger');
const globalConfig = require('../config/globalConfig');

/**
 * DBHelper - Utility for database operations
 * Supports PostgreSQL and MySQL
 */
class DBHelper {
  constructor() {
    this.logger = Logger.getInstance();
    this.dbType = globalConfig.DB_TYPE;
    this.connection = null;
  }

  /**
   * Connect to database
   */
  async connect() {
    try {
      this.logger.info(`Connecting to ${this.dbType} database...`);

      if (this.dbType === 'postgresql') {
        const { Pool } = require('pg');
        this.connection = new Pool({
          host: globalConfig.DB_HOST,
          port: globalConfig.DB_PORT,
          database: globalConfig.DB_NAME,
          user: globalConfig.DB_USER,
          password: globalConfig.DB_PASSWORD,
          max: 3,
          idleTimeoutMillis: 10000,
          connectionTimeoutMillis: 5000,
        });
      } else if (this.dbType === 'mysql') {
        const mysql = require('mysql2/promise');
        this.connection = await mysql.createConnection({
          host: globalConfig.DB_HOST,
          port: globalConfig.DB_PORT,
          database: globalConfig.DB_NAME,
          user: globalConfig.DB_USER,
          password: globalConfig.DB_PASSWORD,
        });
      }

      this.logger.info('Database connection established');
    } catch (error) {
      this.logger.error(`Failed to connect to database: ${error.message}`);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  async close() {
    try {
      if (this.connection) {
        if (this.dbType === 'postgresql') {
          await this.connection.end();
        } else if (this.dbType === 'mysql') {
          await this.connection.end();
        }
        this.logger.info('Database connection closed');
      }
    } catch (error) {
      this.logger.error(`Failed to close database connection: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute SELECT query
   */
  async executeSelect(query, params = []) {
    try {
      this.logger.info(`Executing SELECT: ${query}`);

      if (this.dbType === 'postgresql') {
        const result = await this.connection.query(query, params);
        return result.rows;
      } else if (this.dbType === 'mysql') {
        const [rows] = await this.connection.execute(query, params);
        return rows;
      }
    } catch (error) {
      this.logger.error(`SELECT query failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute INSERT query
   */
  async executeInsert(query, params = []) {
    try {
      this.logger.info(`Executing INSERT: ${query}`);

      if (this.dbType === 'postgresql') {
        const result = await this.connection.query(query, params);
        return result.rows;
      } else if (this.dbType === 'mysql') {
        const [result] = await this.connection.execute(query, params);
        return result;
      }
    } catch (error) {
      this.logger.error(`INSERT query failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute UPDATE query
   */
  async executeUpdate(query, params = []) {
    try {
      this.logger.info(`Executing UPDATE: ${query}`);

      if (this.dbType === 'postgresql') {
        const result = await this.connection.query(query, params);
        return result.rowCount;
      } else if (this.dbType === 'mysql') {
        const [result] = await this.connection.execute(query, params);
        return result.affectedRows;
      }
    } catch (error) {
      this.logger.error(`UPDATE query failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute DELETE query
   */
  async executeDelete(query, params = []) {
    try {
      this.logger.info(`Executing DELETE: ${query}`);

      if (this.dbType === 'postgresql') {
        const result = await this.connection.query(query, params);
        return result.rowCount;
      } else if (this.dbType === 'mysql') {
        const [result] = await this.connection.execute(query, params);
        return result.affectedRows;
      }
    } catch (error) {
      this.logger.error(`DELETE query failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute transaction
   */
  async executeTransaction(callback) {
    try {
      this.logger.info('Starting transaction');

      if (this.dbType === 'postgresql') {
        await this.connection.query('BEGIN');
        try {
          await callback();
          await this.connection.query('COMMIT');
        } catch (error) {
          await this.connection.query('ROLLBACK');
          throw error;
        }
      } else if (this.dbType === 'mysql') {
        await this.connection.beginTransaction();
        try {
          await callback();
          await this.connection.commit();
        } catch (error) {
          await this.connection.rollback();
          throw error;
        }
      }

      this.logger.info('Transaction completed');
    } catch (error) {
      this.logger.error(`Transaction failed: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new DBHelper();

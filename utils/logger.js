const fs = require('fs');
const path = require('path');
const globalConfig = require('../config/globalConfig');

/**
 * Logger - Centralized logging utility
 * Supports file and console logging
 */
class Logger {
  static instance = null;

  constructor() {
    this.logDir = globalConfig.LOG_DIR;
    this.logLevel = globalConfig.LOG_LEVEL;
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    };

    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    this.logFile = path.join(this.logDir, `test-${this.getTimestamp()}.log`);
  }

  /**
   * Get singleton instance
   */
  static getInstance() {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Get current timestamp
   */
  getTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-');
  }

  /**
   * Format log message
   */
  formatMessage(level, message) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  /**
   * Write to file
   */
  writeToFile(message) {
    try {
      fs.appendFileSync(this.logFile, message + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  /**
   * Log error
   */
  error(message) {
    if (this.levels[this.logLevel] >= this.levels.error) {
      const formattedMessage = this.formatMessage('error', message);
      console.error(formattedMessage);
      this.writeToFile(formattedMessage);
    }
  }

  /**
   * Log warning
   */
  warn(message) {
    if (this.levels[this.logLevel] >= this.levels.warn) {
      const formattedMessage = this.formatMessage('warn', message);
      console.warn(formattedMessage);
      this.writeToFile(formattedMessage);
    }
  }

  /**
   * Log info
   */
  info(message) {
    if (this.levels[this.logLevel] >= this.levels.info) {
      const formattedMessage = this.formatMessage('info', message);
      console.log(formattedMessage);
      this.writeToFile(formattedMessage);
    }
  }

  /**
   * Log debug
   */
  debug(message) {
    if (this.levels[this.logLevel] >= this.levels.debug) {
      const formattedMessage = this.formatMessage('debug', message);
      console.debug(formattedMessage);
      this.writeToFile(formattedMessage);
    }
  }

  /**
   * Log separator
   */
  separator() {
    const separator = '='.repeat(60);
    this.info(separator);
  }

  /**
   * Get log file path
   */
  getLogFile() {
    return this.logFile;
  }
}

module.exports = Logger;

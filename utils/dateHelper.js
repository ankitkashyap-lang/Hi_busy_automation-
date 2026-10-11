const Logger = require('./logger');

/**
 * DateHelper - Utility for date and time operations
 */
class DateHelper {
  constructor() {
    this.logger = Logger.getInstance();
  }

  /**
   * Get current date
   */
  getCurrentDate() {
    return new Date();
  }

  /**
   * Get current date as string (YYYY-MM-DD)
   */
  getCurrentDateString() {
    const date = new Date();
    return date.toISOString().split('T')[0];
  }

  /**
   * Get current timestamp
   */
  getCurrentTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Add days to date
   */
  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Subtract days from date
   */
  subtractDays(date, days) {
    return this.addDays(date, -days);
  }

  /**
   * Get date difference in days
   */
  getDateDifference(date1, date2) {
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  /**
   * Format date
   */
  formatDate(date, format = 'YYYY-MM-DD') {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    const formats = {
      'YYYY-MM-DD': `${year}-${month}-${day}`,
      'DD-MM-YYYY': `${day}-${month}-${year}`,
      'MM/DD/YYYY': `${month}/${day}/${year}`,
      'YYYY-MM-DD HH:mm:ss': `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`,
    };

    return formats[format] || formats['YYYY-MM-DD'];
  }

  /**
   * Check if date is valid
   */
  isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  /**
   * Get day of week
   */
  getDayOfWeek(date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }

  /**
   * Get month name
   */
  getMonthName(date) {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[date.getMonth()];
  }

  /**
   * Check if date is today
   */
  isToday(date) {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Check if date is in past
   */
  isPast(date) {
    return date < new Date();
  }

  /**
   * Check if date is in future
   */
  isFuture(date) {
    return date > new Date();
  }
}

module.exports = new DateHelper();

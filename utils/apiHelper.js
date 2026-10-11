const axios = require('axios');
const Logger = require('./logger');
const globalConfig = require('../config/globalConfig');

/**
 * APIHelper - Utility for API calls and hybrid testing
 */
class APIHelper {
  constructor() {
    this.logger = Logger.getInstance();
    this.baseURL = globalConfig.API_BASE_URL;
    this.timeout = globalConfig.API_TIMEOUT;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
    });
  }

  /**
   * GET request
   */
  async get(endpoint, config = {}) {
    try {
      this.logger.info(`GET request to: ${endpoint}`);
      const response = await this.client.get(endpoint, config);
      this.logger.debug(`Response status: ${response.status}`);
      return response.data;
    } catch (error) {
      this.logger.error(`GET request failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * POST request
   */
  async post(endpoint, data = {}, config = {}) {
    try {
      this.logger.info(`POST request to: ${endpoint}`);
      const response = await this.client.post(endpoint, data, config);
      this.logger.debug(`Response status: ${response.status}`);
      return response.data;
    } catch (error) {
      this.logger.error(`POST request failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * PUT request
   */
  async put(endpoint, data = {}, config = {}) {
    try {
      this.logger.info(`PUT request to: ${endpoint}`);
      const response = await this.client.put(endpoint, data, config);
      this.logger.debug(`Response status: ${response.status}`);
      return response.data;
    } catch (error) {
      this.logger.error(`PUT request failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * PATCH request
   */
  async patch(endpoint, data = {}, config = {}) {
    try {
      this.logger.info(`PATCH request to: ${endpoint}`);
      const response = await this.client.patch(endpoint, data, config);
      this.logger.debug(`Response status: ${response.status}`);
      return response.data;
    } catch (error) {
      this.logger.error(`PATCH request failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * DELETE request
   */
  async delete(endpoint, config = {}) {
    try {
      this.logger.info(`DELETE request to: ${endpoint}`);
      const response = await this.client.delete(endpoint, config);
      this.logger.debug(`Response status: ${response.status}`);
      return response.data;
    } catch (error) {
      this.logger.error(`DELETE request failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Set authorization header
   */
  setAuthToken(token) {
    this.logger.info('Setting authorization token');
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Clear authorization header
   */
  clearAuthToken() {
    this.logger.info('Clearing authorization token');
    delete this.client.defaults.headers.common['Authorization'];
  }

  /**
   * Set custom header
   */
  setHeader(headerName, headerValue) {
    this.logger.info(`Setting header: ${headerName}`);
    this.client.defaults.headers.common[headerName] = headerValue;
  }

  /**
   * Validate response status
   */
  validateResponseStatus(response, expectedStatus) {
    if (response.status !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, got ${response.status}`);
    }
  }
}

module.exports = new APIHelper();

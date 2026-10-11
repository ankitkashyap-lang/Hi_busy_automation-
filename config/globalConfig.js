const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  BASE_URL: process.env.BASE_URL || 'https://hiqa2.pooraa.net/',
  ENVIRONMENT: process.env.ENVIRONMENT || 'qa',
  APP_NAME: process.env.APP_NAME || 'Hi Busy',

  // Credentials
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'ankit.kashyap@tech.busy.in',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '123456',
  BUSY_TEAM_EMAIL: process.env.BUSY_TEAM_EMAIL || 'ankit.kashyap@tech.busy.in',
  BUSY_TEAM_PASSWORD: process.env.BUSY_TEAM_PASSWORD || '123456',
  CHANNEL_PARTNER_EMAIL: process.env.CHANNEL_PARTNER_EMAIL || 'hi_insidesalesib@gmail.com',
  CHANNEL_PARTNER_PASSWORD: process.env.CHANNEL_PARTNER_PASSWORD || '123456',


  // Browser
  BROWSER: process.env.BROWSER || 'chromium',
  HEADLESS: process.env.HEADLESS === 'true',
  SLOW_MO: parseInt(process.env.SLOW_MO || '0'),
  WORKERS: parseInt(process.env.WORKERS || '10'),

  // Test Data
  LOGIN_DATA_FILE: process.env.LOGIN_DATA_FILE || 'test-data/LoginData.xlsx',
  PARTNER_DATA_FILE: process.env.PARTNER_DATA_FILE || 'test-data/PartnerData.xlsx',
  SUBSCRIPTION_DATA_FILE: process.env.SUBSCRIPTION_DATA_FILE || 'test-data/SubscriptionData.xlsx',
  CUSTOMER_DATA_FILE: process.env.CUSTOMER_DATA_FILE || 'test-data/CustomerData.xlsx',
  TEST_USERS_FILE: process.env.TEST_USERS_FILE || 'test-data/TestUsers.json',

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_DIR: process.env.LOG_DIR || 'logs',

  // Database
  DB_TYPE: process.env.DB_TYPE || 'postgresql',
  DB_HOST: process.env.DATABASE_HOST || process.env.DB_HOST || '172.16.24.128',
  DB_PORT: parseInt(process.env.DATABASE_PORT || process.env.DB_PORT || '542'),
  DB_NAME: process.env.DATABASE_NAME || process.env.DB_NAME || 'asg',
  DB_USER: process.env.DATABASE_USER || process.env.DB_USER || 'asgardadm',
  DB_PASSWORD: process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD || 'Jhd%3s56dBKs',

  // API
  API_BASE_URL: process.env.API_BASE_URL || 'https://api.hiqa2.pooraa.net/',
  API_TIMEOUT: parseInt(process.env.API_TIMEOUT || '10000'),

  // Notifications
  ENABLE_EMAIL_NOTIFICATIONS: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
  EMAIL_FROM: process.env.EMAIL_FROM || 'ankit.kashyap@tech.busy.in',
  EMAIL_TO: process.env.EMAIL_TO || 'ankit.kashyap@tech.busy.in',

  ENABLE_SLACK_NOTIFICATIONS: process.env.ENABLE_SLACK_NOTIFICATIONS === 'true',
  SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL || '',

  ENABLE_TEAMS_NOTIFICATIONS: process.env.ENABLE_TEAMS_NOTIFICATIONS === 'true',
  TEAMS_WEBHOOK_URL: process.env.TEAMS_WEBHOOK_URL || '',

  // Timeouts
  MAX_RETRIES: parseInt(process.env.MAX_RETRIES || '1'),
  WAIT_TIMEOUT: parseInt(process.env.WAIT_TIMEOUT || '30000'),
  ACTION_TIMEOUT: parseInt(process.env.ACTION_TIMEOUT || '10000'),
  NAVIGATION_TIMEOUT: parseInt(process.env.NAVIGATION_TIMEOUT || '30000'),

  // CI/CD
  CI: process.env.CI === 'true',
  BUILD_ID: process.env.BUILD_ID || 'local',
  BUILD_URL: process.env.BUILD_URL || '',
};

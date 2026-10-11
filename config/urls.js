const globalConfig = require('./globalConfig');

const BASE_URL = globalConfig.BASE_URL;

module.exports = {
  // Base
  BASE_URL,
  
  // Authentication
  LOGIN: `${BASE_URL}`,
  LOGOUT: `${BASE_URL}logout`,
  
  // Dashboard
  ADMIN_DASHBOARD: `${BASE_URL}admin/dashboard`,
  BUSY_TEAM_DASHBOARD: `${BASE_URL}dashboard`,
  CHANNEL_PARTNER_DASHBOARD: `${BASE_URL}partner/dashboard`,
  RESELLER_DASHBOARD: `${BASE_URL}reseller/dashboard`,
  
  // Partner
  PARTNER_LIST: `${BASE_URL}partner/teams/id`,
  PARTNER_CREATE: `${BASE_URL}partner/teams/create`,

  // Subscription
  SUBSCRIPTION_LIST: `${BASE_URL}subscriptions`,
  PURCHASE_DESKTOP: `${BASE_URL}purchase/desktop`,
  PURCHASE_CLOUD: `${BASE_URL}purchase/cloud`,
  SUBSCRIPTION_DETAIL: (id) => `${BASE_URL}subscriptions/${id}`,
  
  // Customer
  CUSTOMERS: `${BASE_URL}customers`,
  CUSTOMER_DETAIL: (id) => `${BASE_URL}customers/${id}`,
  
  // Wallet
  WALLET: `${BASE_URL}wallet`,
  TRANSACTION_HISTORY: `${BASE_URL}wallet/transactions`,
  
  // Reports
  REPORTS: `${BASE_URL}reports`,
  SALES_REPORT: `${BASE_URL}reports/sales`,
  USER_REPORT: `${BASE_URL}reports/users`,
  
  // Settings
  SETTINGS: `${BASE_URL}settings`,
  PROFILE: `${BASE_URL}profile`,
};

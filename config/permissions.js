const constants = require('./constants');

/**
 * Centralized permission definitions
 * Use with permissionHelper to validate role-based access
 */
module.exports = {
  // Dashboard Permissions
  DASHBOARD: {
    VIEW: 'view_dashboard',
  },

  // User Permissions
  USERS: {
    VIEW: 'view_users',
    CREATE: 'create_users',
    EDIT: 'edit_users',
    DELETE: 'delete_users',
    MANAGE: 'manage_users',
  },

  // Subscription Permissions
  SUBSCRIPTIONS: {
    VIEW: 'view_subscriptions',
    CREATE: 'create_subscriptions',
    PURCHASE: 'purchase_subscriptions',
    MANAGE: 'manage_subscriptions',
    CANCEL: 'cancel_subscriptions',
    RENEW: 'renew_subscriptions',
  },

  // Customer Permissions
  CUSTOMERS: {
    VIEW: 'view_customers',
    CREATE: 'create_customers',
    EDIT: 'edit_customers',
    DELETE: 'delete_customers',
    MANAGE: 'manage_customers',
  },

  // Reports Permissions
  REPORTS: {
    VIEW: 'view_reports',
    SALES: 'view_sales_reports',
    USERS: 'view_user_reports',
    EXPORT: 'export_reports',
  },

  // Settings Permissions
  SETTINGS: {
    VIEW: 'view_settings',
    MANAGE: 'manage_settings',
  },

  // Wallet Permissions
  WALLET: {
    VIEW: 'view_wallet',
    MANAGE: 'manage_wallet',
    APPROVE_TRANSACTIONS: 'approve_transactions',
  },

  // Analytics Permissions
  ANALYTICS: {
    VIEW: 'view_analytics',
    EXPORT: 'export_data',
  },

  // Role-based permission mapping
  ROLE_PERMISSIONS: {
    [constants.ROLES.ADMIN]: [
      'view_dashboard',
      'manage_users',
      'manage_subscriptions',
      'manage_reports',
      'manage_settings',
      'approve_transactions',
      'view_analytics',
      'export_data',
      'manage_customers',
    ],

    [constants.ROLES.BUSY_TEAM]: [
      'view_dashboard',
      'view_subscriptions',
      'purchase_subscriptions',
      'manage_own_data',
      'view_reports',
      'view_wallet',
    ],

    [constants.ROLES.CHANNEL_PARTNER]: [
      'view_dashboard',
      'manage_customers',
      'purchase_subscriptions',
      'view_commissions',
      'view_sales_reports',
    ],

    [constants.ROLES.RESELLER]: [
      'view_dashboard',
      'view_products',
      'view_pricing',
      'manage_channels',
      'view_reports',
    ],
  },
};

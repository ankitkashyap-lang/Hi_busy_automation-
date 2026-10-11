const constants = require('./constants');
const urls = require('./urls');

/**
 * Role-based configuration
 * Centralizes role definitions and their properties
 */
module.exports = {
  [constants.ROLES.ADMIN]: {
    role: constants.ROLES.ADMIN,
    displayName: 'Administrator',
    dashboard: urls.ADMIN_DASHBOARD,
    permissions: [
      'view_dashboard',
      'manage_users',
      'manage_subscriptions',
      'manage_reports',
      'manage_settings',
      'approve_transactions',
      'view_analytics',
      'export_data',
    ],
    menus: [
      'dashboard',
      'users',
      'subscriptions',
      'customers',
      'reports',
      'settings',
      'logout',
    ],
  },

  [constants.ROLES.BUSY_TEAM]: {
    role: constants.ROLES.BUSY_TEAM,
    displayName: 'Busy Team',
    dashboard: urls.BUSY_TEAM_DASHBOARD,
    permissions: [
      'view_dashboard',
      'view_subscriptions',
      'purchase_subscriptions',
      'manage_own_data',
      'view_reports',
      'view_wallet',
    ],
    menus: [
      'dashboard',
      'purchase',
      'subscriptions',
      'wallet',
      'profile',
      'logout',
    ],
  },

  [constants.ROLES.CHANNEL_PARTNER]: {
    role: constants.ROLES.CHANNEL_PARTNER,
    displayName: 'Channel Partner',
    dashboard: urls.CHANNEL_PARTNER_DASHBOARD,
    permissions: [
      'view_dashboard',
      'manage_customers',
      'purchase_for_customers',
      'view_commissions',
      'view_sales_reports',
    ],
    menus: [
      'dashboard',
      'customers',
      'purchase',
      'sales',
      'profile',
      'logout',
    ],
  },

  [constants.ROLES.RESELLER]: {
    role: constants.ROLES.RESELLER,
    displayName: 'Reseller',
    dashboard: urls.RESELLER_DASHBOARD,
    permissions: [
      'view_dashboard',
      'view_products',
      'view_pricing',
      'manage_channels',
      'view_reports',
    ],
    menus: [
      'dashboard',
      'products',
      'channels',
      'reports',
      'profile',
      'logout',
    ],
  },
};

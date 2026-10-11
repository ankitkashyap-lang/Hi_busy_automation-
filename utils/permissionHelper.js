const permissions = require('../config/permissions');
const Logger = require('./logger');

/**
 * PermissionHelper - Utility for permission validation
 */
class PermissionHelper {
  constructor() {
    this.logger = Logger.getInstance();
  }

  /**
   * Check if role has permission
   */
  hasPermission(roleName, permission) {
    const rolePermissions = permissions.ROLE_PERMISSIONS[roleName];
    if (!rolePermissions) {
      this.logger.warn(`Role not found: ${roleName}`);
      return false;
    }
    return rolePermissions.includes(permission);
  }

  /**
   * Check if role has any of the permissions
   */
  hasAnyPermission(roleName, permissionArray) {
    return permissionArray.some((permission) => this.hasPermission(roleName, permission));
  }

  /**
   * Check if role has all permissions
   */
  hasAllPermissions(roleName, permissionArray) {
    return permissionArray.every((permission) => this.hasPermission(roleName, permission));
  }

  /**
   * Get all permissions for role
   */
  getRolePermissions(roleName) {
    return permissions.ROLE_PERMISSIONS[roleName] || [];
  }

  /**
   * Check dashboard access
   */
  canAccessDashboard(roleName) {
    return this.hasPermission(roleName, permissions.DASHBOARD.VIEW);
  }

  /**
   * Check subscription access
   */
  canAccessSubscriptions(roleName) {
    return this.hasPermission(roleName, permissions.SUBSCRIPTIONS.VIEW);
  }

  /**
   * Check if can purchase
   */
  canPurchaseSubscriptions(roleName) {
    return this.hasPermission(roleName, permissions.SUBSCRIPTIONS.PURCHASE);
  }

  /**
   * Check customer access
   */
  canAccessCustomers(roleName) {
    return this.hasPermission(roleName, permissions.CUSTOMERS.VIEW);
  }

  /**
   * Check reports access
   */
  canAccessReports(roleName) {
    return this.hasPermission(roleName, permissions.REPORTS.VIEW);
  }

  /**
   * Check wallet access
   */
  canAccessWallet(roleName) {
    return this.hasPermission(roleName, permissions.WALLET.VIEW);
  }

  /**
   * Validate permission for action
   */
  validatePermissionForAction(roleName, action) {
    const permission = permissions[action];
    if (!permission) {
      this.logger.warn(`Permission mapping not found for action: ${action}`);
      return false;
    }
    return this.hasPermission(roleName, permission);
  }

  /**
   * List all permissions
   */
  listAllPermissions() {
    return permissions;
  }
}

module.exports = new PermissionHelper();

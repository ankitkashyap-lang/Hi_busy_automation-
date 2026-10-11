const constants = require('../config/constants');
const rolesConfig = require('../config/roles');
const Logger = require('./logger');

/**
 * RoleHelper - Utility for role-related operations
 */
class RoleHelper {
  constructor() {
    this.logger = Logger.getInstance();
  }

  /**
   * Get role by name
   */
  getRole(roleName) {
    const role = rolesConfig[roleName];
    if (!role) {
      this.logger.warn(`Role not found: ${roleName}`);
      return null;
    }
    return role;
  }

  /**
   * Get all roles
   */
  getAllRoles() {
    return Object.keys(rolesConfig);
  }

  /**
   * Get role dashboard
   */
  getRoleDashboard(roleName) {
    const role = this.getRole(roleName);
    return role ? role.dashboard : null;
  }

  /**
   * Get role permissions
   */
  getRolePermissions(roleName) {
    const role = this.getRole(roleName);
    return role ? role.permissions : [];
  }

  /**
   * Get role menus
   */
  getRoleMenus(roleName) {
    const role = this.getRole(roleName);
    return role ? role.menus : [];
  }

  /**
   * Get role display name
   */
  getRoleDisplayName(roleName) {
    const role = this.getRole(roleName);
    return role ? role.displayName : roleName;
  }

  /**
   * Check if role exists
   */
  roleExists(roleName) {
    return rolesConfig.hasOwnProperty(roleName);
  }

  /**
   * Compare roles
   */
  compareRoles(role1, role2) {
    return role1 === role2;
  }

  /**
   * Get admin role
   */
  getAdminRole() {
    return this.getRole(constants.ROLES.ADMIN);
  }

  /**
   * Check if user is admin
   */
  isAdmin(roleName) {
    return this.compareRoles(roleName, constants.ROLES.ADMIN);
  }

  /**
   * Get role metadata
   */
  getRoleMetadata(roleName) {
    return this.getRole(roleName);
  }
}

module.exports = new RoleHelper();

const { test as base } = require('@playwright/test');
const UserFactory = require('../factories/UserFactory.js');
const roleHelper = require('../utils/roleHelper.js');
const Logger = require('../utils/logger.js');

/**
 * role.fixture.js - Role-Based Fixture
 * Provides role-specific setup and user data
 */
const roleFixture = base.extend({
  /**
   * adminUser - Admin user object with permissions and menus
   */
  adminUser: async ({}, use) => {
    const logger = Logger.getInstance();
    logger.info('Setting up admin user fixture');

    const adminUser = UserFactory.createAdminUser();
    logger.info(`✓ Admin user fixture ready: ${adminUser.email}`);

    await use(adminUser);

    logger.info('Cleaning up admin user fixture');
  },

  /**
   * busyTeamUser - Busy team user object with permissions and menus
   */
  busyTeamUser: async ({}, use) => {
    const logger = Logger.getInstance();
    logger.info('Setting up busy_team user fixture');

    const busyTeamUser = UserFactory.createBusyTeamUser();
    logger.info(`✓ Busy team user fixture ready: ${busyTeamUser.email}`);

    await use(busyTeamUser);

    logger.info('Cleaning up busy_team user fixture');
  },

  /**
   * channelPartnerUser - Channel partner user object with permissions and menus
   */
  channelPartnerUser: async ({}, use) => {
    const logger = Logger.getInstance();
    logger.info('Setting up channel_partner user fixture');

    const channelPartnerUser = UserFactory.createChannelPartnerUser();
    logger.info(`✓ Channel partner user fixture ready: ${channelPartnerUser.email}`);

    await use(channelPartnerUser);

    logger.info('Cleaning up channel_partner user fixture');
  },

  /**
   * resellerUser - Reseller user object with permissions and menus
   */
  resellerUser: async ({}, use) => {
    const logger = Logger.getInstance();
    logger.info('Setting up reseller user fixture');

    const resellerUser = UserFactory.createResellerUser();
    logger.info(`✓ Reseller user fixture ready: ${resellerUser.email}`);

    await use(resellerUser);

    logger.info('Cleaning up reseller user fixture');
  },

  /**
   * allUsers - Array of all test users
   */
  allUsers: async ({}, use) => {
    const logger = Logger.getInstance();
    logger.info('Setting up all users fixture');

    const users = UserFactory.createAllUsers();
    logger.info(`✓ All users fixture ready with ${users.length} users`);

    await use(users);

    logger.info('Cleaning up all users fixture');
  },

  /**
   * roleConfig - Configuration for current role
   */
  roleConfig: async ({ adminUser }, use) => {
    const logger = Logger.getInstance();
    logger.info('Setting up role config fixture');

    const config = {
      getRole: (roleName) => roleHelper.getRole(roleName),
      getAllRoles: () => roleHelper.getAllRoles(),
      getRolePermissions: (roleName) => roleHelper.getRolePermissions(roleName),
      getRoleMenus: (roleName) => roleHelper.getRoleMenus(roleName),
      getRoleDashboard: (roleName) => roleHelper.getRoleDashboard(roleName),
      roleExists: (roleName) => roleHelper.roleExists(roleName),
      isAdmin: (roleName) => roleHelper.isAdmin(roleName),
    };

    logger.info('✓ Role config fixture ready');
    await use(config);

    logger.info('Cleaning up role config fixture');
  },

  /**
   * usersByRole - Helper to create users for different roles
   */
  usersByRole: async ({}, use) => {
    const logger = Logger.getInstance();
    logger.info('Setting up usersByRole fixture');

    const usersByRole = {
      admin: UserFactory.createAdminUser(),
      busy_team: UserFactory.createBusyTeamUser(),
      channel_partner: UserFactory.createChannelPartnerUser(),
      reseller: UserFactory.createResellerUser(),
      getUser: (role) => {
        if (!usersByRole[role]) {
          throw new Error(`Unknown role: ${role}`);
        }
        return usersByRole[role];
      },
      getAllUsers: () => [
        usersByRole.admin,
        usersByRole.busy_team,
        usersByRole.channel_partner,
        usersByRole.reseller,
      ],
    };

    logger.info('✓ UsersByRole fixture ready');
    await use(usersByRole);

    logger.info('Cleaning up usersByRole fixture');
  },

  /**
   * permissionMatrix - Role-permission matrix
   */
  permissionMatrix: async ({}, use) => {
    const logger = Logger.getInstance();
    logger.info('Setting up permission matrix fixture');

    const permissionMatrix = {
      admin: UserFactory.createAdminUser().permissions,
      busy_team: UserFactory.createBusyTeamUser().permissions,
      channel_partner: UserFactory.createChannelPartnerUser().permissions,
      reseller: UserFactory.createResellerUser().permissions,
      hasPermission: (role, permission) => {
        const permissions = permissionMatrix[role];
        return permissions && permissions.includes(permission);
      },
    };

    logger.info('✓ Permission matrix fixture ready');
    await use(permissionMatrix);

    logger.info('Cleaning up permission matrix fixture');
  },
});

module.exports = roleFixture;

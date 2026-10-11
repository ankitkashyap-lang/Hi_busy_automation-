const Logger = require('../utils/logger.js');
const roleHelper = require('../utils/roleHelper.js');

/**
 * UserFactory - Factory for creating test user objects
 * Manages user creation with role-specific data
 */
class UserFactory {
  constructor() {
    this.logger = Logger.getInstance();
  }

  /**
   * Create admin user
   */
  createAdminUser(overrides = {}) {
    this.logger.info('Creating admin user');

    const admin = {
      role: 'admin',
      email: overrides.email || 'rajan.raman@tech.busy.in',
      password: overrides.password || '123456',
      expectedDashboard: 'admin',
      permissions: roleHelper.getRolePermissions('admin'),
      menus: roleHelper.getRoleMenus('admin'),
    };

    this.logger.info(`✓ Admin user created: ${admin.email}`);
    return admin;
  }

  /**
   * Create busy_team user
   */
  createBusyTeamUser(overrides = {}) {
    this.logger.info('Creating busy_team user');

    const busyTeam = {
      role: 'busy_team',
      email: overrides.email || 'ankit.kashyap@tech.busy.in',
      password: overrides.password || '123456',
      expectedDashboard: 'busy_team',
      permissions: roleHelper.getRolePermissions('busy_team'),
      menus: roleHelper.getRoleMenus('busy_team'),
    };

    this.logger.info(`✓ Busy team user created: ${busyTeam.email}`);
    return busyTeam;
  }

  /**
   * Create channel_partner user
   */
  createChannelPartnerUser(overrides = {}) {
    this.logger.info('Creating channel_partner user');

    const channelPartner = {
      role: 'channel_partner',
      email: overrides.email || 'hi_3minfocare@gmail.com',
      password: overrides.password || '123456',
      expectedDashboard: 'partner',
      permissions: roleHelper.getRolePermissions('channel_partner'),
      menus: roleHelper.getRoleMenus('channel_partner'),
    };

    this.logger.info(`✓ Channel partner user created: ${channelPartner.email}`);
    return channelPartner;
  }

  /**
   * Create reseller user
   */
  createResellerUser(overrides = {}) {
    this.logger.info('Creating reseller user');

    const reseller = {
      role: 'reseller',
      email: overrides.email || 'reseller@example.com',
      password: overrides.password || '123456',
      expectedDashboard: 'reseller',
      permissions: roleHelper.getRolePermissions('reseller'),
      menus: roleHelper.getRoleMenus('reseller'),
    };

    this.logger.info(`✓ Reseller user created: ${reseller.email}`);
    return reseller;
  }

  /**
   * Create user by role
   */
  createUserByRole(role, overrides = {}) {
    this.logger.info(`Creating user with role: ${role}`);

    switch (role) {
      case 'admin':
        return this.createAdminUser(overrides);
      case 'busy_team':
        return this.createBusyTeamUser(overrides);
      case 'channel_partner':
        return this.createChannelPartnerUser(overrides);
      case 'reseller':
        return this.createResellerUser(overrides);
      default:
        this.logger.error(`Unknown role: ${role}`);
        throw new Error(`Unknown role: ${role}`);
    }
  }

  /**
   * Create all users
   */
  createAllUsers() {
    this.logger.info('Creating all test users');
    this.logger.separator();

    const users = [
      this.createAdminUser(),
      this.createBusyTeamUser(),
      this.createChannelPartnerUser(),
      this.createResellerUser(),
    ];

    this.logger.info(`✓ Created ${users.length} test users`);
    return users;
  }

  /**
   * Create user with custom credentials
   */
  createCustomUser(email, password, role) {
    this.logger.info(`Creating custom user: ${email} with role: ${role}`);

    return this.createUserByRole(role, { email, password });
  }

  /**
   * Create invalid user (for negative testing)
   */
  createInvalidUser() {
    this.logger.info('Creating invalid user for negative testing');

    const invalidUser = {
      role: 'invalid',
      email: 'invalid@invalid.invalid',
      password: 'invalidpassword123',
      expectedDashboard: null,
    };

    this.logger.info('✓ Invalid user created');
    return invalidUser;
  }

  /**
   * Create user with valid email but wrong password
   */
  createUserWithWrongPassword(role, validEmail) {
    this.logger.info(`Creating user with valid email but wrong password: ${validEmail}`);

    return this.createUserByRole(role, {
      email: validEmail,
      password: 'wrongpassword123',
    });
  }

  /**
   * Create user with whitespace variations (for boundary testing)
   */
  createUserWithWhitespace(role) {
    this.logger.info(`Creating user with whitespace variations for role: ${role}`);

    const baseUser = this.createUserByRole(role);

    return {
      leadingSpace: { ...baseUser, email: ' ' + baseUser.email },
      trailingSpace: { ...baseUser, email: baseUser.email + ' ' },
      bothSpaces: { ...baseUser, email: ' ' + baseUser.email + ' ' },
    };
  }

  /**
   * Create user with special characters in password
   */
  createUserWithSpecialCharPassword(role) {
    this.logger.info(`Creating user with special character password for role: ${role}`);

    return this.createUserByRole(role, {
      password: 'P@$$w0rd!#%&*',
    });
  }

  /**
   * Create user with very long email
   */
  createUserWithLongEmail(role) {
    this.logger.info(`Creating user with very long email for role: ${role}`);

    const longEmail = 'a'.repeat(100) + '@example.com';
    return this.createUserByRole(role, {
      email: longEmail,
    });
  }

  /**
   * Create user with very long password
   */
  createUserWithLongPassword(role) {
    this.logger.info(`Creating user with very long password for role: ${role}`);

    const longPassword = 'a'.repeat(500);
    return this.createUserByRole(role, {
      password: longPassword,
    });
  }

  /**
   * Create user with uppercase email
   */
  createUserWithUppercaseEmail(role) {
    this.logger.info(`Creating user with uppercase email for role: ${role}`);

    const baseUser = this.createUserByRole(role);
    return {
      ...baseUser,
      email: baseUser.email.toUpperCase(),
    };
  }

  /**
   * Get user summary
   */
  getUserSummary(user) {
    this.logger.info('Getting user summary');

    return {
      role: user.role,
      email: user.email,
      dashboard: user.expectedDashboard,
      permissionCount: user.permissions?.length || 0,
      menuCount: user.menus?.length || 0,
    };
  }

  /**
   * Log user details
   */
  logUserDetails(user) {
    this.logger.info('User Details:');
    this.logger.info(`  Role: ${user.role}`);
    this.logger.info(`  Email: ${user.email}`);
    this.logger.info(`  Password: ****`);
    this.logger.info(`  Dashboard: ${user.expectedDashboard}`);
    this.logger.info(`  Permissions: ${user.permissions?.length || 0}`);
    this.logger.info(`  Menus: ${user.menus?.length || 0}`);
  }
}

module.exports = new UserFactory();

module.exports = {
  // Roles
  ROLES: {
    ADMIN: 'admin',
    BUSY_TEAM: 'busy_team',
    CHANNEL_PARTNER: 'channel_partner',
    RESELLER: 'reseller',
  },

  // Editions
  EDITIONS: {
    BASIC: 'Basic',
    STANDARD: 'Standard',
    PROFESSIONAL: 'Professional',
    ENTERPRISE: 'Enterprise',
  },

  // License Types
  LICENSE_TYPES: {
    SINGLE_USER: 'Single User',
    MULTI_USER: 'Multi User',
    CLIENT_SERVER: 'Client Server',
    PERPETUAL: 'Perpetual',
  },

  // Product Types
  PRODUCTS: {
    DESKTOP: 'Desktop',
    CLOUD: 'Cloud',
    MOBILE: 'Mobile',
  },

  // Test Status
  TEST_STATUS: {
    PASS: 'PASS',
    FAIL: 'FAIL',
    SKIP: 'SKIP',
    ERROR: 'ERROR',
  },

  // API Methods
  HTTP_METHODS: {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    PATCH: 'PATCH',
    DELETE: 'DELETE',
  },

  // UI Elements
  UI_ELEMENTS: {
    BUTTON: 'button',
    INPUT: 'input',
    SELECT: 'select',
    TEXT: 'text',
    LINK: 'link',
  },

  // Timeouts
  TIMEOUTS: {
    SHORT: 5000,
    MEDIUM: 10000,
    LONG: 30000,
    VERY_LONG: 60000,
  },

  // Retry Attempts
  RETRY: {
    DEFAULT: 2,
    API: 3,
    DATABASE: 2,
  },

  // Wait Strategies
  WAIT: {
    VISIBLE: 'visible',
    HIDDEN: 'hidden',
    STABLE: 'stable',
    ENABLED: 'enabled',
  },

  // Messages
  MESSAGES: {
    LOGIN_SUCCESS: 'Login successful',
    LOGIN_FAILED: 'Login failed',
    VALIDATION_ERROR: 'Validation Error',
    LOGOUT_SUCCESS: 'Logged out successfully',
  },

  // Default Values
  DEFAULT: {
    BROWSER: 'chromium',
    LANGUAGE: 'en',
    TIMEZONE: 'UTC',
  },
};

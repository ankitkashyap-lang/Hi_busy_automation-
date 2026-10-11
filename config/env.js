const globalConfig = require('./globalConfig');

/**
 * Environment-specific configuration
 * Handles different environments: dev, qa, stage, prod
 */
module.exports = {
  [globalConfig.ENVIRONMENT]: {
    environment: globalConfig.ENVIRONMENT,
    baseUrl: globalConfig.BASE_URL,
    isProduction: globalConfig.ENVIRONMENT === 'prod',
    isStaging: globalConfig.ENVIRONMENT === 'stage',
    isQA: globalConfig.ENVIRONMENT === 'qa',
    isDevelopment: globalConfig.ENVIRONMENT === 'dev',
    
    // Timeouts per environment
    timeouts: {
      dev: {
        navigation: 30000,
        action: 10000,
        wait: 30000,
      },
      qa: {
        navigation: 30000,
        action: 10000,
        wait: 30000,
      },
      stage: {
        navigation: 40000,
        action: 15000,
        wait: 40000,
      },
      prod: {
        navigation: 60000,
        action: 20000,
        wait: 60000,
      },
    }[globalConfig.ENVIRONMENT] || {
      navigation: 30000,
      action: 10000,
      wait: 30000,
    },

    // Retry configuration per environment
    retries: {
      dev: 0,
      qa: 1,
      stage: 2,
      prod: 2,
    }[globalConfig.ENVIRONMENT] || 1,

    // Worker configuration per environment
    workers: {
      dev: 4,
      qa: 2,
      stage: 1,
      prod: 1,
    }[globalConfig.ENVIRONMENT] || 1,

    // Features enabled per environment
    features: {
      screenshots: true,
      videos: true,
      traces: true,
      logging: true,
      notifications: globalConfig.ENVIRONMENT !== 'dev',
      reportAllure: true,
      reportHTML: true,
    },

    // Notification settings per environment
    notifications: {
      enabled: globalConfig.ENVIRONMENT !== 'dev',
      email: {
        enabled: globalConfig.ENABLE_EMAIL_NOTIFICATIONS,
        recipients: {
          qa: [globalConfig.EMAIL_TO],
          stage: [globalConfig.EMAIL_TO],
          prod: ['prod-team@example.com'],
        }[globalConfig.ENVIRONMENT] || [],
      },
      slack: {
        enabled: globalConfig.ENABLE_SLACK_NOTIFICATIONS,
        channel: {
          dev: '#qa-dev',
          qa: '#qa-results',
          stage: '#qa-stage',
          prod: '#qa-prod',
        }[globalConfig.ENVIRONMENT] || '#qa-results',
      },
    },
  },
};

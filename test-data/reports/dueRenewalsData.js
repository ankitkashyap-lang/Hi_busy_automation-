/**
 * Test data and configuration for Analytics -> Due Renewals Report
 */
module.exports = {
  DEFAULT_PARTNER: '3M Infocare',
  DUE_RENEWALS_URL: '/partner/analytics/duerenewal?tab=0&product=desktop',
  PARTNER_DOWNLOADS_URL: '/partner/report/download',

  PRODUCTS: {
    DESKTOP: {
      name: 'Desktop',
      tabIndex: 0,
      param: 'desktop',
      variations: ['All', 'Busy 21', 'Mandi', 'Magic']
    },
    ONLINE: {
      name: 'Online',
      tabIndex: 1,
      param: 'online'
    },
    MOBILE: {
      name: 'Mobile',
      tabIndex: 2,
      param: 'mobile'
    },
    RECOM: {
      name: 'Recom',
      tabIndex: 3,
      param: 'recom'
    },
    MAZU: {
      name: 'mazu',
      tabIndex: 4,
      param: 'mazu'
    },
    RDP: {
      name: 'RDP',
      tabIndex: 5,
      param: 'rdp'
    }
  },

  FILTER_INDICES: {
    TIME_PERIOD: 0,
    RENEW_STATUS: 1,
    TIMES_RENEWED: 2,
    MODEL: 3,
    VERSION: 4,
    LICENSE_TYPE: 5,
    CITY: 6,
    INSTALLED_BY: 7,
    CATEGORY: 8
  },

  FILTER_OPTIONS: {
    TIME_PERIOD: ['Today', 'Tomorrow', 'Day After', 'This Month', 'Next Month', 'Month Range'],
    RENEW_STATUS: ['All', 'Expired', 'Pending', 'In Grace', 'By Self', 'By Others', 'Due'],
    TIMES_RENEWED: ['All', '0', '1', '2', '3', '>3'],
    VERSION: ['All', '21', '18', '17', '<= 16'],
    LICENSE_TYPE: ['All', 'SU', 'DU', 'MU', 'CS'],
    CATEGORY: ['All', 'Regular', 'CA', 'GSTP', 'Accountant', 'FOC']
  },

  // 22 Expected Excel column headers in Row 1 of downloaded report
  EXPECTED_EXCEL_HEADERS: [
    'Serial No.',
    'Subscription No.',
    'Variation Name',
    'Last Active Date',
    'Due Date',
    'Times Renewed',
    'Model',
    'Version',
    'Release Version',
    'User',
    'Company',
    'City',
    'Status',
    'Subscription Status',
    'Installed By',
    'Category',
    'Price',
    'App / Ecom',
    'Total Subscriptions',
    'Mobile',
    'Cluster Name',
    'Owner Partner'
  ],

  // UI Table Column Headers
  EXPECTED_UI_HEADERS: [
    'Serial No.',
    'Last Active',
    'Due Date',
    'Model & Version',
    'Times Renewed',
    'Company & City',
    'Renew Status'
  ],

  DOWNLOAD_FILENAME_REGEX: /^Due\s+Renewal\s+Subs_.*\.xlsx$/i
};

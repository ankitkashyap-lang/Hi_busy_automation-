/**
 * Test data and configuration for Analytics -> Inactive Report
 * Discovered and verified from live QA1 application at https://hiqa1.pooraa.net/
 */
module.exports = {
  DEFAULT_PARTNER: '3M Infocare',
  INACTIVE_URL: '/partner/analytics/inactive',
  PARTNER_DOWNLOADS_URL: '/partner/report/download',

  PRODUCT: {
    name: 'Busy 21',
    productId: 11,
    reportTypeKey: 'inactive_subscription'
  },

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

  FILTER_OPTIONS: {
    DAYS: ['30 Days', '90 Days', '180 Days'],
    STATUS: ['All', 'Active', 'Expired', 'Disabled'],
    MODEL: [
      'All',
      'Basic - Single User',
      'Basic - Multi User',
      'Basic - Dual User',
      'Standard - Single User',
      'Standard - Multi User',
      'Standard - Dual User',
      'Enterprise - Single User',
      'Enterprise - Multi User'
    ],
    RELEASE_VERSION: ['All', '21', '18'],
    USER_TYPE: ['All', 'SU', 'DU', 'MU', 'CS'],
    CATEGORY: ['All', 'Regular', 'CA', 'GSTP', 'Accountant', 'FOC'],
    CITY: ['All', 'Faridabad', 'Delhi', 'Agra', 'Gurgaon', 'Noida'],
    INSTALLED_BY: ['All', '3M Infocare', 'Compucraft Solutions & Services', 'EWAY HM']
  },

  // 8 UI Table Column Headers
  EXPECTED_UI_HEADERS: [
    'Serial No.',
    'Install Date',
    'Due Date',
    'Last Active',
    'Model & Version',
    'Installed By',
    'Company & City',
    'Subs Status'
  ],

  // 20 Expected Excel Column Headers in Row 1 of downloaded report
  EXPECTED_EXCEL_HEADERS: [
    'Serial No.',
    'Subscription No.',
    'Variation Name',
    'Installed By',
    'Install Date',
    'Due Date',
    'Model',
    'Version',
    'Release Version',
    'User',
    'Company',
    'City',
    'Status',
    'Category',
    'Last Active Date',
    'App / Recom',
    'Total Subscriptions',
    'Owner Name',
    'Cluster Name',
    'Mobile'
  ],

  DOWNLOAD_FILENAME_REGEX: /^Inactive\s+Subs_.*\.xlsx$/i
};

/**
 * Test data and configuration for Analytics -> New Activations Report
 * Discovered and verified from live application at https://hiqa1.pooraa.net/
 */
module.exports = {
  DEFAULT_PARTNER: '3M Infocare',
  NEW_ACTIVATIONS_URL: '/partner/analytics/newactivations?tab=0&product=desktop',
  PARTNER_DOWNLOADS_URL: '/partner/report/download',

  PRODUCTS: {
    DESKTOP: {
      name: 'Desktop',
      tabIndex: 0,
      param: 'desktop',
      selector: '.tab0',
      variations: ['All', 'Busy 21', 'Mandi', 'Magic']
    },
    ONLINE: {
      name: 'Online',
      tabIndex: 1,
      param: 'online',
      selector: '.tab1'
    },
    MOBILE: {
      name: 'Mobile',
      tabIndex: 2,
      param: 'mobile',
      selector: '.tab2'
    },
    RECOM: {
      name: 'Recom',
      tabIndex: 3,
      param: 'recom',
      selector: '.tab3'
    },
    MAZU: {
      name: 'mazu',
      tabIndex: 4,
      param: 'mazu',
      selector: '.tab4'
    },
    RDP: {
      name: 'RDP',
      tabIndex: 5,
      param: 'rdp',
      selector: '.tab5'
    }
  },

  // Dynamic filter indices when Desktop variation is "All"
  DEFAULT_FILTER_INDICES: {
    TIME_PERIOD: 0,
    STATUS: 1,
    INSTALLED_BY: 2
  },

  // Filter indices when Desktop variation is "Busy 21"
  BUSY21_FILTER_INDICES: {
    TIME_PERIOD: 0,
    STATUS: 1,
    MODEL: 2,
    VERSION: 3,
    USER_TYPE: 4,
    CITY: 5,
    INSTALLED_BY: 6,
    CATEGORY: 7
  },

  FILTER_OPTIONS: {
    TIME_PERIOD: ['This Month', 'Last Month', 'Month Range'],
    STATUS: ['All', 'Active', 'Expired', 'Disabled', 'Cancelled'],
    INSTALLED_BY: ['All', '3M Infocare', 'EWAY HM'],
    VERSION_USER: ['All', 'SU', 'DU', 'MU', 'CS'],
    CATEGORY: ['All', 'Regular', 'CA', 'GSTP', 'Accountant', 'FOC'],
    CITY: ['All', 'Birgunj', 'Delhi', 'Faridabad']
  },

  // 22 Expected Excel column headers in Row 1 of downloaded report
  EXPECTED_EXCEL_HEADERS: [
    'Serial No.',
    'Subscription No.',
    'Variation Name',
    'Installed By',
    'Install Date',
    'Due Date',
    'Model',
    'Version',
    'Plan',
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
    'Mobile',
    'Cluster Name',
    'Out Of Cluster'
  ],

  // UI Table Column Headers (Desktop standard 7 columns)
  EXPECTED_UI_HEADERS: [
    'Serial No.',
    'Install Date',
    'Due Date',
    'Model & Version',
    'Installed by',
    'Company & City',
    'Subs Status'
  ],

  DOWNLOAD_FILENAME_REGEX: /^Activation\s+Subs_.*\.xlsx$/i
};

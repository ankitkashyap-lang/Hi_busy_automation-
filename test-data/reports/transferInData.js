/**
 * Test data and configuration for Analytics -> Transfer In Report
 * Discovered and verified from live QA1 application at https://hiqa1.pooraa.net/
 */
module.exports = {
  DEFAULT_PARTNER: '3M Infocare',
  TRANSFER_IN_URL: '/partner/analytics/transferin',
  PARTNER_DOWNLOADS_URL: '/partner/report/download',

  PRODUCT: {
    name: 'Busy 21',
    productId: 11,
    reportTypeKey: 'transfer_in_subscription',
    queueJobName: 'Transfer In Subscription'
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

  FILTER_INDICES: {
    TIME_PERIOD: 0,
    STATUS: 1,
    TRANSFERRED_FROM: 2,
    MODEL: 3,
    VERSION: 4,
    USER_TYPE: 5,
    CITY: 6,
    INSTALLED_BY: 7
  },

  FILTER_OPTIONS: {
    TIME_PERIOD: ['< 3 Months', '4-6 Months', '7-9 Months', '9+ Months'],
    STATUS: ['All', 'Active', 'Expired', 'Disabled', 'Cancelled'],
    TRANSFERRED_FROM: [
      'All',
      'Arihant Softwares And Services',
      'Electroware Infotech Private Limited',
      'Inside Sales (Delhi Office)',
      'Inside Sales (IndiaMART Offer)',
      'K. G. Softech Private Limited',
      'Vision Softech',
      'V K Software & Solutions'
    ],
    VERSION: ['All', '21', '18', '17', '<= 16'],
    USER_TYPE: ['All', 'SU', 'DU', 'MU', 'CS'],
    CITY: [
      'All',
      'Ahmedabad',
      'Delhi',
      'Faridabad',
      'Ghaziabad',
      'Gurgaon',
      'New Delhi'
    ],
    INSTALLED_BY: [
      'All',
      'Arihant Softwares And Services',
      'Compucraft Solutions & Services',
      'Eazy ERP Technologies Pvt Ltd (Bhiwadi)',
      'Effective Software Solutions',
      'Inside Sales (Delhi Office)',
      'Inside Sales (IndiaMART Offer)',
      'K. G. Softech Private Limited'
    ]
  },

  // 7 UI Table Column Headers
  EXPECTED_UI_HEADERS: [
    'Serial No.',
    'Install Date',
    'Due Date',
    'Model & Version',
    'Transferred From',
    'Company & City',
    'Subs Status'
  ],

  // 22 Expected Excel Column Headers in Row 1 of downloaded report
  EXPECTED_EXCEL_HEADERS: [
    'Serial No.',
    'Subscription No.',
    'Variation Name',
    'Transfer From',
    'Install Date',
    'Due Date',
    'Model',
    'Version',
    'Release Version',
    'User',
    'Company',
    'City',
    'Status',
    'Installed By',
    'Transfer From City',
    'Category',
    'Last Active Date',
    'App/Recom',
    'Total Subscriptions',
    'Mobile',
    'Cluster Name',
    'Owner Partner'
  ],

  DOWNLOAD_FILENAME_REGEX: /^Transfer\s+In\s+Subs_(?:Busy\s*21|Desktop|[A-Za-z0-9\s]+)_.*\.xlsx$/i
};

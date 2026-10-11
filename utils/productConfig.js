/**
 * Product, Plan, Model, Region, and Category configuration rules.
 * Encodes all rules for Quantity boundaries (1-999), User Count (1-999),
 * Category-specific Plan visibility, Region Dialog Texts, and Region Pricing Multipliers.
 */

const PRODUCT_CONFIG = {
  Perpetual: {
    plans: {
      Basic: ['Single User', 'Multi User'],
      Standard: ['Single User', 'Multi User', 'Client Server'],
      Enterprise: ['Single User', 'Multi User', 'Client Server'],
    },
    regions: ['india'],
    categories: ['Regular', 'FOC', 'CA', 'GST Practitioner', 'Accountant'],
  },
  Subscription: {
    plans: {
      Blue: ['Single User', 'Multi User'],
      Saffron: ['Single User', 'Multi User', 'Client Server'],
      Emerald: ['Single User', 'Multi User', 'Client Server'],
    },
    regions: ['india', 'subcontinent', 'global'],
    categories: ['Regular', 'FOC'],
  },
  'Busy Magic': {
    plans: {
      Start: [],
      Smart: [],
      Power: [],
      'Power+': [],
    },
    regions: ['india'],
    categories: ['Regular', 'FOC'],
  },
};

// Quantity Rules
const QTY_MIN = 1;
const QTY_MAX = 999;

// User Count Rules
const USER_COUNT_MIN = 1;
const USER_COUNT_MAX = 999;

// Special Category Visibility mapping for Perpetual
const PERPETUAL_CATEGORY_PLANS = {
  CA: {
    Basic: ['Single User', 'Multi User'],
    Standard: ['Single User'],
  },
  Accountant: {
    Standard: ['Single User', 'Multi User', 'Client Server'],
    Enterprise: ['Single User', 'Multi User', 'Client Server'],
  },
  'GST Practitioner': {
    Standard: ['Single User', 'Multi User', 'Client Server'],
    Enterprise: ['Single User', 'Multi User', 'Client Server'],
  },
};

// Region Change Dialog Text
const REGION_CHANGE_SUBCONTINENT_DIALOG_TEXT = 'Pricing structure for Subcontinent region is different. Do you want to continue?';

// Region Pricing Multipliers
const SUBCONTINENT_PRICE_MULTIPLIER = 1.1;

// Plans that have a "Client Server" model
const CLIENT_SERVER_MODEL = 'Client Server';
// Busy Magic plans that show "Next" button
const BUSY_MAGIC_NEXT_PLANS = ['Smart', 'Power', 'Power+'];
// Categories allowed to see Basic plan on Perpetual
const BASIC_PLAN_ALLOWED_CATEGORIES = ['Regular', 'FOC', 'CA'];

/**
 * Validates Quantity value (1 to 999, integer)
 */
function validateQuantity(qty) {
  const num = Number(qty);
  if (isNaN(num) || String(qty).trim() === '') {
    return { valid: false, reason: 'Quantity must be a valid integer' };
  }
  if (!Number.isInteger(num)) {
    return { valid: false, reason: 'Decimal quantity is not allowed' };
  }
  if (num < QTY_MIN) {
    return { valid: false, reason: `Quantity must be at least ${QTY_MIN}` };
  }
  if (num > QTY_MAX) {
    return { valid: false, reason: `Quantity cannot exceed ${QTY_MAX}` };
  }
  return { valid: true };
}

/**
 * Validates User Count value (1 to 999, integer)
 */
function validateUserCount(count) {
  const num = Number(count);
  if (isNaN(num) || String(count).trim() === '') {
    return { valid: false, reason: 'User count must be a valid integer' };
  }
  if (!Number.isInteger(num)) {
    return { valid: false, reason: 'Decimal user count is not allowed' };
  }
  if (num < USER_COUNT_MIN) {
    return { valid: false, reason: `User count must be at least ${USER_COUNT_MIN}` };
  }
  if (num > USER_COUNT_MAX) {
    return { valid: false, reason: `User count cannot exceed ${USER_COUNT_MAX}` };
  }
  return { valid: true };
}

/**
 * Gets allowed plan & model structure for Perpetual category
 */
function getPerpetualCategoryPlans(category) {
  return PERPETUAL_CATEGORY_PLANS[category] || PRODUCT_CONFIG.Perpetual.plans;
}

/**
 * Button expectation logic: Next vs Purchase
 */
function isNextButtonExpected(productName, planName, modelName) {
  if (productName === 'Busy Magic') {
    return BUSY_MAGIC_NEXT_PLANS.includes(planName);
  }
  return modelName === CLIENT_SERVER_MODEL;
}

/**
 * Basic plan visibility check
 */
function isBasicPlanVisible(productName, categoryName) {
  if (productName !== 'Perpetual') return true;
  return BASIC_PLAN_ALLOWED_CATEGORIES.includes(categoryName);
}

/**
 * Subcontinent pricing calculation
 */
function calculateSubcontinentPrice(indiaPrice) {
  return Number((Number(indiaPrice) * SUBCONTINENT_PRICE_MULTIPLIER).toFixed(2));
}

/**
 * Validate row rules against product config
 */
function validateRow(row) {
  const product = PRODUCT_CONFIG[row.Product_name];
  if (!product) {
    return { valid: false, reason: `Unknown Product_name: ${row.Product_name}` };
  }

  const models = product.plans[row.Plan_name];
  if (!models) {
    return { valid: false, reason: `Unknown Plan_name '${row.Plan_name}' for ${row.Product_name}` };
  }

  if (row.Product_name === 'Busy Magic') {
    if (row.Model_name && row.Model_name.trim() !== '') {
      return { valid: false, reason: `Model_name should be empty for Busy Magic plan '${row.Plan_name}'` };
    }
  } else {
    if (!models.includes(row.Model_name)) {
      return { valid: false, reason: `Model_name '${row.Model_name}' not valid for plan '${row.Plan_name}'` };
    }
  }

  const normalizedRegion = String(row.Region || '').trim().toLowerCase();
  const validRegions = product.regions.map(r => r.toLowerCase());
  if (!validRegions.includes(normalizedRegion)) {
    return { valid: false, reason: `Region '${row.Region}' not valid for ${row.Product_name}` };
  }

  if (!product.categories.includes(row.category)) {
    return { valid: false, reason: `category '${row.category}' not valid for ${row.Product_name}` };
  }

  if (row.Plan_name === 'Basic' && !isBasicPlanVisible(row.Product_name, row.category)) {
    return { valid: false, reason: `Basic plan is not shown for category '${row.category}'` };
  }

  return { valid: true };
}

module.exports = {
  PRODUCT_CONFIG,
  QTY_MIN,
  QTY_MAX,
  USER_COUNT_MIN,
  USER_COUNT_MAX,
  PERPETUAL_CATEGORY_PLANS,
  REGION_CHANGE_SUBCONTINENT_DIALOG_TEXT,
  SUBCONTINENT_PRICE_MULTIPLIER,
  CLIENT_SERVER_MODEL,
  BUSY_MAGIC_NEXT_PLANS,
  BASIC_PLAN_ALLOWED_CATEGORIES,
  validateQuantity,
  validateUserCount,
  getPerpetualCategoryPlans,
  isNextButtonExpected,
  isBasicPlanVisible,
  calculateSubcontinentPrice,
  validateRow,
};

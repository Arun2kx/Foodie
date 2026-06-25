/* ==========================================================================
   Foodie.Config — Constants, Storage Keys, Coupons, Categories, Validation
   ========================================================================== */

(function() {
  'use strict';

  window.Foodie = window.Foodie || {};

  window.Foodie.Config = {
    APP_NAME: 'Foodie',

    // Storage keys
    STORAGE_KEYS: {
      USERS: 'foodie_users',
      SESSION: 'foodie_session',
      CART_PREFIX: 'foodie_cart_',
      ORDERS_PREFIX: 'foodie_orders_'
    },

    // Delivery fee
    DELIVERY_FEE: 40,
    FREE_DELIVERY_THRESHOLD: 500,

    // Coupons
    COUPONS: [
      {
        code: 'WELCOME50',
        type: 'flat',
        value: 50,
        minOrder: 199,
        description: 'Flat \u20B950 off on orders above \u20B9199'
      },
      {
        code: 'FOODIE100',
        type: 'flat',
        value: 100,
        minOrder: 499,
        description: 'Flat \u20B9100 off on orders above \u20B9499'
      },
      {
        code: 'FREEDEL',
        type: 'free_delivery',
        value: 0,
        minOrder: 149,
        description: 'Free delivery on orders above \u20B9149'
      },
      {
        code: 'SAVE20',
        type: 'percentage',
        value: 20,
        maxDiscount: 150,
        minOrder: 299,
        description: '20% off up to \u20B9150 on orders above \u20B9299'
      }
    ],

    // Food categories with emojis
    CATEGORIES: [
      { id: 'biryani', name: 'Biryani', emoji: '\uD83C\uDF5A' },
      { id: 'haleem', name: 'Haleem', emoji: '\uD83C\uDF72' },
      { id: 'dosa', name: 'Dosa', emoji: '\uD83E\uDDC7' },
      { id: 'pizza', name: 'Pizza', emoji: '\uD83C\uDF55' },
      { id: 'burger', name: 'Burger', emoji: '\uD83C\uDF54' },
      { id: 'chinese', name: 'Chinese', emoji: '\uD83E\uDD62' },
      { id: 'kebab', name: 'Kebabs', emoji: '\uD83C\uDF56' },
      { id: 'dessert', name: 'Desserts', emoji: '\uD83C\uDF70' },
      { id: 'thali', name: 'Thali', emoji: '\uD83C\uDF5B' },
      { id: 'rolls', name: 'Rolls', emoji: '\uD83C\uDF2F' },
      { id: 'icecream', name: 'Ice Cream', emoji: '\uD83C\uDF68' },
      { id: 'chai', name: 'Chai', emoji: '\u2615' }
    ],

    // Validation
    VALIDATION: {
      NAME_MIN: 2,
      NAME_MAX: 50,
      PASSWORD_MIN: 6,
      PHONE_REGEX: /^[6-9]\d{9}$/,
      EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      PINCODE_REGEX: /^5\d{5}$/
    },

    // Sort options
    SORT_OPTIONS: [
      { value: 'relevance', label: 'Relevance' },
      { value: 'rating', label: 'Rating: High to Low' },
      { value: 'delivery_time', label: 'Delivery Time' },
      { value: 'cost_low', label: 'Cost: Low to High' },
      { value: 'cost_high', label: 'Cost: High to Low' }
    ],

    // Filter options
    FILTERS: [
      { id: 'rating4', label: 'Rating 4.0+' },
      { id: 'fast_delivery', label: 'Fast Delivery' },
      { id: 'pure_veg', label: 'Pure Veg' },
      { id: 'offers', label: 'Offers' }
    ]
  };
})();

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

    // Food categories with real images
    CATEGORIES: [
      { id: 'biryani', name: 'Biryani', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=150&h=150&fit=crop' },
      { id: 'haleem', name: 'Haleem', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=150&h=150&fit=crop' },
      { id: 'dosa', name: 'Dosa', image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=150&h=150&fit=crop' },
      { id: 'pizza', name: 'Pizza', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=150&h=150&fit=crop' },
      { id: 'burger', name: 'Burger', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&h=150&fit=crop' },
      { id: 'chinese', name: 'Chinese', image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=150&h=150&fit=crop' },
      { id: 'kebab', name: 'Kebabs', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=150&h=150&fit=crop' },
      { id: 'dessert', name: 'Desserts', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=150&h=150&fit=crop' },
      { id: 'thali', name: 'Thali', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=150&h=150&fit=crop' },
      { id: 'rolls', name: 'Rolls', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=150&h=150&fit=crop' },
      { id: 'icecream', name: 'Ice Cream', image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=150&h=150&fit=crop' },
      { id: 'chai', name: 'Chai', image: 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=150&h=150&fit=crop' }
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
      { id: 'favourites', label: 'Favourites' },
      { id: 'rating4', label: 'Rating 4.0+' },
      { id: 'fast_delivery', label: 'Fast Delivery' },
      { id: 'pure_veg', label: 'Pure Veg' },
      { id: 'offers', label: 'Offers' }
    ]
  };
})();

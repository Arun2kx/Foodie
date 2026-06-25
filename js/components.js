/* ==========================================================================
   Foodie.Components — Header, Footer, Restaurant Card, Empty State
   ========================================================================== */

(function() {
  'use strict';

  window.Foodie = window.Foodie || {};

  var Components = {};
  var Utils = Foodie.Utils;
  var Auth = Foodie.Auth;
  var Cart = Foodie.Cart;

  // Render header
  Components.renderHeader = function(options) {
    options = options || {};
    var headerEl = document.getElementById('app-header');
    if (!headerEl) return;

    var html = '<div class="header__inner">';

    // Left: Logo + Search
    html += '<div class="header__left">';
    html += '<a href="index.html" class="header__logo"><span class="header__logo-icon">\uD83C\uDF5C</span> Foodie</a>';

    if (!options.hideSearch) {
      html += '<div class="header__search">';
      html += '<span class="header__search-icon">' + Utils.icons.search + '</span>';
      html += '<input class="header__search-input" type="text" id="header-search" placeholder="Search for restaurants and food">';
      html += '<button class="header__search-btn" id="header-search-btn">Search</button>';
      html += '</div>';
    }

    html += '</div>';

    // Right: Nav + Auth
    html += '<button class="header__menu-toggle" id="menu-toggle" onclick="Foodie.Components.toggleMobileMenu()">' + Utils.icons.menu + '</button>';

    html += '<nav class="header__nav" id="mobile-nav">';

    // Cart link
    var cartCount = Cart.getCount();
    html += '<a href="checkout.html" class="header__cart-link">';
    html += Utils.icons.cart;
    html += '<span>Cart</span>';
    if (cartCount > 0) {
      html += '<span class="header__cart-badge" id="cart-badge">' + cartCount + '</span>';
    } else {
      html += '<span class="header__cart-badge d-none" id="cart-badge">0</span>';
    }
    html += '</a>';

    // Auth section
    html += '<div class="header__auth" id="auth-section">';
    html += Components._renderAuthSection();
    html += '</div>';

    html += '</nav>';
    html += '</div>';

    headerEl.innerHTML = html;

    // Bind header search
    var headerSearch = document.getElementById('header-search');
    if (headerSearch) {
      // On homepage, _onHeaderSearch is defined by home.js; on other pages, redirect to home
      headerSearch.addEventListener('input', Utils.debounce(function(e) {
        if (typeof window._onHeaderSearch === 'function') {
          window._onHeaderSearch(e);
        }
      }, 300));
      headerSearch.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          var query = headerSearch.value.trim();
          if (typeof window._onHeaderSearch === 'function') {
            window._onHeaderSearch({ target: headerSearch });
          } else if (query) {
            window.location.href = 'index.html?search=' + encodeURIComponent(query);
          }
        }
      });
    }

    // Bind search icon click
    var searchIcon = headerEl.querySelector('.header__search-icon');
    if (searchIcon && headerSearch) {
      searchIcon.style.cursor = 'pointer';
      searchIcon.addEventListener('click', function() {
        var query = headerSearch.value.trim();
        if (typeof window._onHeaderSearch === 'function') {
          window._onHeaderSearch({ target: headerSearch });
        } else if (query) {
          window.location.href = 'index.html?search=' + encodeURIComponent(query);
        }
        headerSearch.focus();
      });
    }

    // Bind header search button
    var headerSearchBtn = document.getElementById('header-search-btn');
    if (headerSearchBtn && headerSearch) {
      headerSearchBtn.addEventListener('click', function() {
        var query = headerSearch.value.trim();
        if (!query) { headerSearch.focus(); return; }
        if (typeof window._onHeaderSearch === 'function') {
          window._onHeaderSearch({ target: headerSearch });
          // If single result, navigate directly
          if (typeof window._getSearchResults === 'function') {
            var results = window._getSearchResults();
            if (results && results.length === 1) {
              window.location.href = 'restaurant.html?id=' + results[0].id;
            }
          }
        } else {
          window.location.href = 'index.html?search=' + encodeURIComponent(query);
        }
      });
    }
  };

  Components._renderAuthSection = function() {
    var user = Auth.getCurrentUser();
    if (!user) {
      return '<button class="header__login-btn" onclick="Foodie.Auth.openLoginModal()">' + Utils.icons.user + ' Login</button>';
    }

    var initials = user.name.charAt(0).toUpperCase();
    var html = '<div class="header__profile">';
    html += '<button class="header__profile-btn" onclick="Foodie.Components.toggleProfileDropdown()">';
    html += '<div class="header__avatar">' + Utils.sanitizeHTML(initials) + '</div>';
    html += '<span class="header__profile-name">' + Utils.sanitizeHTML(user.name) + '</span>';
    html += '</button>';
    html += '<div class="header__dropdown" id="profile-dropdown">';
    html += '<a href="my-orders.html" class="header__dropdown-item">' + Utils.icons.orders + ' My Orders</a>';
    html += '<div class="header__dropdown-divider"></div>';
    html += '<button class="header__dropdown-item" onclick="Foodie.Components._handleLogout()">' + Utils.icons.logout + ' Logout</button>';
    html += '</div></div>';
    return html;
  };

  // Update auth section UI
  Components.updateAuthUI = function() {
    var authSection = document.getElementById('auth-section');
    if (authSection) {
      authSection.innerHTML = Components._renderAuthSection();
    }
    Components.updateCartBadge();
  };

  // Update cart badge
  Components.updateCartBadge = function() {
    var badge = document.getElementById('cart-badge');
    if (!badge) return;
    var count = Cart.getCount();
    if (count > 0) {
      badge.textContent = count;
      badge.classList.remove('d-none');
    } else {
      badge.classList.add('d-none');
    }
  };

  // Toggle profile dropdown
  Components.toggleProfileDropdown = function() {
    var dropdown = document.getElementById('profile-dropdown');
    if (dropdown) {
      dropdown.classList.toggle('header__dropdown--active');
    }
  };

  // Toggle mobile menu
  Components.toggleMobileMenu = function() {
    var nav = document.getElementById('mobile-nav');
    if (nav) {
      nav.classList.toggle('header__nav--open');
    }
  };

  // Handle logout
  Components._handleLogout = function() {
    Auth.logout();
    Utils.showToast('Logged out successfully', 'info');
    Components.updateAuthUI();
    // Redirect if on protected page
    var path = window.location.pathname;
    if (path.indexOf('my-orders') >= 0 || path.indexOf('checkout') >= 0) {
      window.location.href = 'index.html';
    }
  };

  // Close dropdown on outside click
  document.addEventListener('click', function(e) {
    var dropdown = document.getElementById('profile-dropdown');
    if (!dropdown) return;
    var profileBtn = e.target.closest('.header__profile');
    if (!profileBtn) {
      dropdown.classList.remove('header__dropdown--active');
    }
  });

  // Render footer
  Components.renderFooter = function() {
    var footerEl = document.getElementById('app-footer');
    if (!footerEl) return;

    var html = '<div class="container">';
    html += '<div class="footer__grid">';

    // Brand
    html += '<div>';
    html += '<div class="footer__brand-name">\uD83C\uDF5C Foodie</div>';
    html += '<p class="footer__brand-desc">Hyderabad\'s favourite food delivery platform. Discover the best restaurants and cuisines from the City of Nizams.</p>';
    html += '</div>';

    // Quick Links
    html += '<div>';
    html += '<h4 class="footer__heading">Quick Links</h4>';
    html += '<a href="index.html" class="footer__link">Home</a>';
    html += '<a href="#" class="footer__link">About Us</a>';
    html += '<a href="#" class="footer__link">Contact</a>';
    html += '</div>';

    // Popular Cuisines
    html += '<div>';
    html += '<h4 class="footer__heading">Popular Cuisines</h4>';
    html += '<span class="footer__link">Biryani</span>';
    html += '<span class="footer__link">Haleem</span>';
    html += '<span class="footer__link">Dosa</span>';
    html += '<span class="footer__link">Kebabs</span>';
    html += '</div>';

    // Cities
    html += '<div>';
    html += '<h4 class="footer__heading">Popular Areas</h4>';
    html += '<span class="footer__link">Banjara Hills</span>';
    html += '<span class="footer__link">Jubilee Hills</span>';
    html += '<span class="footer__link">Hitech City</span>';
    html += '<span class="footer__link">Charminar</span>';
    html += '</div>';

    html += '</div>';

    html += '<div class="footer__bottom">&copy; 2024 Foodie. Made with \u2764\uFE0F in Hyderabad. For demo purposes only.</div>';
    html += '</div>';

    footerEl.innerHTML = html;
  };

  // Render restaurant card
  Components.renderRestaurantCard = function(restaurant, searchQuery) {
    var html = '<a href="restaurant.html?id=' + restaurant.id + '" class="restaurant-card">';

    // Image
    html += '<div class="restaurant-card__image-wrap">';
    html += '<img class="restaurant-card__image" src="' + restaurant.image + '" alt="' + Utils.sanitizeHTML(restaurant.name) + '" loading="lazy" onerror="this.onerror=null;this.src=\'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop\';">';
    if (restaurant.offer) {
      html += '<div class="restaurant-card__offer">' + Utils.sanitizeHTML(restaurant.offer) + '</div>';
    }
    html += '</div>';

    // Body
    html += '<div class="restaurant-card__body">';

    var displayName = searchQuery ? Utils.highlightText(restaurant.name, searchQuery) : Utils.sanitizeHTML(restaurant.name);
    html += '<h3 class="restaurant-card__name">' + displayName + '</h3>';

    // Meta: rating, delivery time, cost
    html += '<div class="restaurant-card__meta">';
    html += '<span class="restaurant-card__rating">' + Utils.icons.star + ' ' + restaurant.rating + '</span>';
    html += '<span class="restaurant-card__dot"></span>';
    html += '<span>' + restaurant.deliveryTime + '</span>';
    html += '<span class="restaurant-card__dot"></span>';
    html += '<span>' + Utils.formatCurrency(restaurant.costForTwo) + ' for two</span>';
    html += '</div>';

    var cuisineStr = restaurant.cuisines.join(', ');
    if (searchQuery) cuisineStr = Utils.highlightText(cuisineStr, searchQuery);
    else cuisineStr = Utils.sanitizeHTML(cuisineStr);
    html += '<div class="restaurant-card__cuisines">' + cuisineStr + '</div>';

    html += '<div class="restaurant-card__location">' + Utils.sanitizeHTML(restaurant.area) + '</div>';

    html += '</div></a>';

    return html;
  };

  // Render empty state
  Components.renderEmptyState = function(title, text, actionText, actionHref) {
    var html = '<div class="empty-state">';
    html += '<div class="empty-state__icon">' + Utils.icons.cart + '</div>';
    html += '<h3 class="empty-state__title">' + Utils.sanitizeHTML(title) + '</h3>';
    html += '<p class="empty-state__text">' + Utils.sanitizeHTML(text) + '</p>';
    if (actionText && actionHref) {
      html += '<a href="' + actionHref + '" class="btn btn--primary">' + Utils.sanitizeHTML(actionText) + '</a>';
    }
    html += '</div>';
    return html;
  };

  window.Foodie.Components = Components;
})();

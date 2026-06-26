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
    html += '<a href="index.html" class="header__logo"><img class="header__logo-img" src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=80&h=80&fit=crop" alt="Foodie"> Foodie</a>';

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

    // Render bottom navigation for mobile
    Components.renderBottomNav();

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
    var user = Auth.getCurrentUser();
    var isFav = user ? Foodie.Storage.isFavourite(user.id, restaurant.id) : false;

    var html = '<div class="restaurant-card-wrap">';
    html += '<a href="restaurant.html?id=' + restaurant.id + '" class="restaurant-card">';

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

    // Heart icon (outside the <a> so click doesn't navigate)
    html += '<button class="restaurant-card__fav' + (isFav ? ' restaurant-card__fav--active' : '') + '" data-restaurant-id="' + restaurant.id + '" onclick="Foodie.Components.toggleFavourite(event, \'' + restaurant.id + '\')" title="' + (isFav ? 'Remove from favourites' : 'Add to favourites') + '">';
    html += isFav ? Utils.icons.heartFilled : Utils.icons.heartOutline;
    html += '</button>';

    html += '</div>';

    return html;
  };

  // Toggle favourite restaurant
  Components.toggleFavourite = function(event, restaurantId) {
    event.preventDefault();
    event.stopPropagation();

    var user = Auth.getCurrentUser();
    if (!user) {
      Auth.openLoginModal();
      return;
    }

    var added = Foodie.Storage.toggleFavourite(user.id, restaurantId);
    Utils.showToast(added ? 'Added to favourites' : 'Removed from favourites', added ? 'success' : 'info');

    // Update the heart icon in place
    var btn = event.currentTarget;
    if (added) {
      btn.classList.add('restaurant-card__fav--active');
      btn.innerHTML = Utils.icons.heartFilled;
      btn.title = 'Remove from favourites';
    } else {
      btn.classList.remove('restaurant-card__fav--active');
      btn.innerHTML = Utils.icons.heartOutline;
      btn.title = 'Add to favourites';
    }
  };

  // Render skeleton restaurant cards for loading state
  Components.renderSkeletonCards = function(count) {
    count = count || 8;
    var html = '<div class="restaurants-grid">';
    for (var i = 0; i < count; i++) {
      html += '<div class="skeleton-card">';
      html += '<div class="skeleton skeleton-card__image"></div>';
      html += '<div class="skeleton-card__body">';
      html += '<div class="skeleton skeleton-card__title"></div>';
      html += '<div class="skeleton skeleton-card__meta"></div>';
      html += '<div class="skeleton skeleton-card__text"></div>';
      html += '</div></div>';
    }
    html += '</div>';
    return html;
  };

  // Render skeleton menu items for loading state
  Components.renderSkeletonMenuItems = function(count) {
    count = count || 6;
    var html = '<div class="container">';
    html += '<div class="skeleton skeleton-menu__section-title"></div>';
    for (var i = 0; i < count; i++) {
      html += '<div class="skeleton-menu-item">';
      html += '<div class="skeleton-menu-item__info">';
      html += '<div class="skeleton skeleton-menu-item__badge"></div>';
      html += '<div class="skeleton skeleton-menu-item__name"></div>';
      html += '<div class="skeleton skeleton-menu-item__price"></div>';
      html += '<div class="skeleton skeleton-menu-item__desc"></div>';
      html += '</div>';
      html += '<div class="skeleton skeleton-menu-item__image"></div>';
      html += '</div>';
    }
    html += '</div>';
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

  // Render bottom navigation bar (mobile)
  Components.renderBottomNav = function() {
    // Don't render if already exists
    if (document.getElementById('bottom-nav')) return;

    var path = window.location.pathname;
    var currentPage = 'home';
    if (path.indexOf('restaurant.html') >= 0) currentPage = 'search';
    else if (path.indexOf('checkout.html') >= 0) currentPage = 'cart';
    else if (path.indexOf('my-orders.html') >= 0) currentPage = 'orders';
    else if (path.indexOf('order-success.html') >= 0) currentPage = 'orders';

    var cartCount = Cart.getCount();

    var tabs = [
      { id: 'home', label: 'Home', icon: Utils.icons.home, href: 'index.html' },
      { id: 'search', label: 'Search', icon: Utils.icons.navSearch, href: 'index.html?search=' },
      { id: 'cart', label: 'Cart', icon: Utils.icons.cart, href: 'checkout.html', badge: cartCount },
      { id: 'orders', label: 'Orders', icon: Utils.icons.orders, href: 'my-orders.html' },
      { id: 'profile', label: 'Profile', icon: Utils.icons.profile, href: '#' }
    ];

    var nav = document.createElement('nav');
    nav.className = 'bottom-nav';
    nav.id = 'bottom-nav';

    var html = '';
    for (var i = 0; i < tabs.length; i++) {
      var tab = tabs[i];
      var activeClass = currentPage === tab.id ? ' bottom-nav__item--active' : '';

      if (tab.id === 'profile') {
        var user = Auth.getCurrentUser();
        if (user) {
          html += '<button class="bottom-nav__item' + activeClass + '" onclick="Foodie.Components.toggleProfileDropdown()">';
        } else {
          html += '<button class="bottom-nav__item' + activeClass + '" onclick="Foodie.Auth.openLoginModal()">';
        }
      } else if (tab.id === 'search') {
        html += '<a href="' + tab.href + '" class="bottom-nav__item' + activeClass + '" onclick="if(window.location.pathname.indexOf(\'index.html\')>=0||window.location.pathname===\'/\'){event.preventDefault();var h=document.getElementById(\'hero-search\');if(h){h.focus();h.scrollIntoView({behavior:\'smooth\'});}}">';
      } else {
        html += '<a href="' + tab.href + '" class="bottom-nav__item' + activeClass + '">';
      }

      html += '<span class="bottom-nav__icon">' + tab.icon;
      if (tab.badge && tab.badge > 0) {
        html += '<span class="bottom-nav__badge" id="bottom-nav-cart-badge">' + tab.badge + '</span>';
      }
      html += '</span>';
      html += '<span class="bottom-nav__label">' + tab.label + '</span>';

      html += tab.id === 'profile' ? '</button>' : '</a>';
    }

    nav.innerHTML = html;
    document.body.appendChild(nav);

    // Scroll hide/show behavior
    var lastScrollY = window.scrollY;
    var ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          var currentScrollY = window.scrollY;
          if (currentScrollY > lastScrollY && currentScrollY > 100) {
            nav.classList.add('bottom-nav--hidden');
          } else {
            nav.classList.remove('bottom-nav--hidden');
          }
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    });
  };

  // Update bottom nav cart badge
  Components.updateBottomNavBadge = function() {
    var badge = document.getElementById('bottom-nav-cart-badge');
    var count = Cart.getCount();
    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = '';
      } else {
        badge.style.display = 'none';
      }
    } else if (count > 0) {
      // Badge doesn't exist yet, re-render the bottom nav
      var oldNav = document.getElementById('bottom-nav');
      if (oldNav) oldNav.remove();
      Components.renderBottomNav();
    }
  };

  // Override updateCartBadge to also update bottom nav
  var _originalUpdateCartBadge = Components.updateCartBadge;
  Components.updateCartBadge = function() {
    _originalUpdateCartBadge.call(Components);
    Components.updateBottomNavBadge();
  };

  window.Foodie.Components = Components;
})();

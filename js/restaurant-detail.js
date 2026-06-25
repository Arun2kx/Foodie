/* ==========================================================================
   Restaurant Detail Page — Menu, Add-to-Cart, Veg Filter
   ========================================================================== */

(function() {
  'use strict';

  var Utils = Foodie.Utils;
  var Components = Foodie.Components;
  var Cart = Foodie.Cart;
  var Data = Foodie.Data;

  var state = {
    restaurant: null,
    menuSearch: '',
    vegOnly: false,
    activeCategory: null
  };

  // Item that user tried to add before logging in
  var pendingCartItem = null;

  function init() {
    var id = Utils.getUrlParam('id');
    if (!id) {
      window.location.href = 'index.html';
      return;
    }

    // Find restaurant
    var restaurants = Data.restaurants;
    for (var i = 0; i < restaurants.length; i++) {
      if (restaurants[i].id === id) {
        state.restaurant = restaurants[i];
        break;
      }
    }

    if (!state.restaurant) {
      window.location.href = 'index.html';
      return;
    }

    document.title = state.restaurant.name + ' - Foodie';

    Components.renderHeader({ hideSearch: false });
    Components.renderFooter();
    renderBanner();
    renderMenuControls();
    renderMenu();

    // Insert auth modals
    var modalsContainer = document.getElementById('modals');
    if (modalsContainer) {
      modalsContainer.innerHTML = Foodie.Auth.renderModals();
    }

    // After login/signup: update header, auto-add pending item, re-render menu
    Foodie.Auth.onAuthChange = function() {
      Components.renderHeader({ hideSearch: false });
      Components.updateCartBadge();
      // Auto-add the item user was trying to add before login
      if (pendingCartItem) {
        var item = pendingCartItem;
        pendingCartItem = null;
        var result = Cart.addItem(state.restaurant.id, state.restaurant.name, item);
        if (result.success) {
          Utils.showToast(item.name + ' added to cart', 'success');
          Components.updateCartBadge();
        }
      }
      renderMenu();
    };
  }

  function renderBanner() {
    var el = document.getElementById('restaurant-banner');
    if (!el) return;

    var r = state.restaurant;
    var html = '<div class="container">';
    html += '<a href="index.html" class="back-btn"><span class="back-btn__icon">' + Utils.icons.arrowLeft + '</span> Back to Home</a>';
    html += '<div class="rest-banner__inner">';

    html += '<div class="rest-banner__image"><img src="' + r.image + '" alt="' + Utils.sanitizeHTML(r.name) + '" onerror="this.onerror=null;this.src=\'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop\';"></div>';

    html += '<div class="rest-banner__info">';
    html += '<h1 class="rest-banner__name">' + Utils.sanitizeHTML(r.name) + '</h1>';
    html += '<p class="rest-banner__cuisines">' + Utils.sanitizeHTML(r.cuisines.join(', ')) + '</p>';

    html += '<div class="rest-banner__meta">';
    html += '<span class="rest-banner__rating">' + Utils.icons.star + ' ' + r.rating + '</span>';
    html += '<span class="rest-banner__meta-item">' + Utils.icons.clock + ' ' + r.deliveryTime + '</span>';
    html += '<span class="rest-banner__meta-item">' + Utils.icons.mapPin + ' ' + Utils.sanitizeHTML(r.area) + '</span>';
    html += '<span class="rest-banner__meta-item">' + Utils.formatCurrency(r.costForTwo) + ' for two</span>';
    html += '</div>';

    if (r.offer) {
      html += '<div class="rest-banner__offer">' + Utils.icons.offer + ' ' + Utils.sanitizeHTML(r.offer) + '</div>';
    }

    html += '</div></div></div>';
    el.innerHTML = html;
  }

  function getCategories() {
    var cats = [];
    var seen = {};
    var menu = state.restaurant.menu;
    for (var i = 0; i < menu.length; i++) {
      if (!seen[menu[i].category]) {
        seen[menu[i].category] = true;
        cats.push(menu[i].category);
      }
    }
    return cats;
  }

  function renderMenuControls() {
    var el = document.getElementById('menu-controls');
    if (!el) return;

    var categories = getCategories();

    var html = '<div class="container">';
    html += '<div class="menu-controls__inner">';

    // Search
    html += '<div class="menu-controls__search">';
    html += '<span class="menu-controls__search-icon">' + Utils.icons.search + '</span>';
    html += '<input class="menu-controls__search-input" type="text" id="menu-search" placeholder="Search within menu" value="' + Utils.sanitizeHTML(state.menuSearch) + '">';
    html += '</div>';

    // Category nav
    html += '<div class="category-nav">';
    for (var i = 0; i < categories.length; i++) {
      var activeClass = state.activeCategory === categories[i] ? ' category-nav__item--active' : '';
      html += '<button class="category-nav__item' + activeClass + '" data-cat="' + Utils.sanitizeHTML(categories[i]) + '">' + Utils.sanitizeHTML(categories[i]) + '</button>';
    }
    html += '</div>';

    // Veg toggle
    html += '<label class="menu-controls__veg-toggle">';
    html += '<span>Veg Only</span>';
    html += '<div class="veg-toggle-switch' + (state.vegOnly ? ' veg-toggle-switch--active' : '') + '" id="veg-toggle"></div>';
    html += '</label>';

    html += '</div></div>';
    el.innerHTML = html;

    // Bind search
    var searchInput = document.getElementById('menu-search');
    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce(function() {
        state.menuSearch = searchInput.value.trim();
        renderMenu();
      }, 300));
    }

    // Bind veg toggle
    var vegToggle = document.getElementById('veg-toggle');
    if (vegToggle) {
      vegToggle.addEventListener('click', function() {
        state.vegOnly = !state.vegOnly;
        vegToggle.classList.toggle('veg-toggle-switch--active');
        renderMenu();
      });
    }

    // Bind category nav
    var catBtns = el.querySelectorAll('.category-nav__item');
    for (var j = 0; j < catBtns.length; j++) {
      catBtns[j].addEventListener('click', function() {
        var cat = this.getAttribute('data-cat');
        if (state.activeCategory === cat) {
          state.activeCategory = null;
        } else {
          state.activeCategory = cat;
        }
        renderMenuControls();
        renderMenu();
      });
    }
  }

  function renderMenu() {
    var el = document.getElementById('menu-items');
    if (!el) return;

    var menu = state.restaurant.menu;
    var query = state.menuSearch.toLowerCase();

    // Filter
    var filtered = menu.filter(function(item) {
      if (state.vegOnly && !item.isVeg) return false;
      if (state.activeCategory && item.category !== state.activeCategory) return false;
      if (query) {
        return item.name.toLowerCase().indexOf(query) >= 0 ||
               item.category.toLowerCase().indexOf(query) >= 0 ||
               (item.description && item.description.toLowerCase().indexOf(query) >= 0);
      }
      return true;
    });

    if (filtered.length === 0) {
      el.innerHTML = '<div class="container">' + Components.renderEmptyState(
        'No items found',
        'Try adjusting your search or filters.',
        null, null
      ) + '</div>';
      return;
    }

    // Group by category
    var groups = {};
    var groupOrder = [];
    for (var i = 0; i < filtered.length; i++) {
      var cat = filtered[i].category;
      if (!groups[cat]) {
        groups[cat] = [];
        groupOrder.push(cat);
      }
      groups[cat].push(filtered[i]);
    }

    var html = '<div class="container">';

    for (var g = 0; g < groupOrder.length; g++) {
      var catName = groupOrder[g];
      var items = groups[catName];

      html += '<div class="menu-section">';
      html += '<h2 class="menu-section__title">' + Utils.sanitizeHTML(catName);
      html += '<span class="menu-section__count">(' + items.length + ')</span></h2>';

      for (var k = 0; k < items.length; k++) {
        html += renderMenuItem(items[k]);
      }

      html += '</div>';
    }

    html += '</div>';
    el.innerHTML = html;
  }

  function renderMenuItem(item) {
    var qty = Cart.getItemQty(item.id);

    var html = '<div class="menu-item">';

    // Info
    html += '<div class="menu-item__info">';
    html += '<div class="menu-item__header">';
    html += '<span class="food-type food-type--' + (item.isVeg ? 'veg' : 'nonveg') + '"></span>';
    if (item.isBestseller) {
      html += '<span class="bestseller-badge">' + Utils.icons.ribbon + ' Bestseller</span>';
    }
    html += '</div>';
    html += '<h3 class="menu-item__name">' + Utils.sanitizeHTML(item.name) + '</h3>';
    html += '<div class="menu-item__price">' + Utils.formatCurrency(item.price) + '</div>';
    if (item.description) {
      html += '<p class="menu-item__desc">' + Utils.sanitizeHTML(item.description) + '</p>';
    }
    html += '</div>';

    // Image + Add button
    html += '<div class="menu-item__image-wrap">';
    if (item.image) {
      html += '<img class="menu-item__image" src="' + item.image + '" alt="' + Utils.sanitizeHTML(item.name) + '" loading="lazy" onerror="this.onerror=null;this.src=\'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=250&fit=crop\';">';
    } else {
      html += '<div class="menu-item__image" style="background:var(--color-gray-100);display:flex;align-items:center;justify-content:center;color:var(--color-gray-400);font-size:2rem;">\uD83C\uDF5C</div>';
    }

    if (qty > 0) {
      html += '<div class="qty-control menu-item__add-btn" style="padding:0;">';
      html += '<button class="qty-control__btn" onclick="window._updateItemQty(\'' + item.id + '\', ' + (qty - 1) + ')">&minus;</button>';
      html += '<span class="qty-control__value">' + qty + '</span>';
      html += '<button class="qty-control__btn" onclick="window._updateItemQty(\'' + item.id + '\', ' + (qty + 1) + ')">+</button>';
      html += '</div>';
    } else {
      html += '<button class="menu-item__add-btn" onclick="window._addToCart(\'' + item.id + '\')">ADD</button>';
    }

    html += '</div></div>';

    return html;
  }

  // Global handlers
  window._addToCart = function(itemId) {
    var r = state.restaurant;
    var item = null;
    for (var i = 0; i < r.menu.length; i++) {
      if (r.menu[i].id === itemId) {
        item = r.menu[i];
        break;
      }
    }
    if (!item) return;

    var result = Cart.addItem(r.id, r.name, item);

    if (result.success) {
      Utils.showToast(item.name + ' added to cart', 'success');
      Components.updateCartBadge();
      renderMenu();
    } else if (result.reason === 'auth') {
      // Save item so it auto-adds after login
      pendingCartItem = item;
    } else if (result.reason === 'conflict') {
      Cart.showConflictModal(r.id, r.name, item, function() {
        renderMenu();
      });
    }
  };

  window._updateItemQty = function(itemId, newQty) {
    Cart.updateQty(itemId, newQty);
    Components.updateCartBadge();
    renderMenu();
  };

  document.addEventListener('DOMContentLoaded', init);
})();

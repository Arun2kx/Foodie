/* ==========================================================================
   Homepage — Search, Categories, Filters, Grid
   ========================================================================== */

(function() {
  'use strict';

  var Utils = Foodie.Utils;
  var Config = Foodie.Config;
  var Components = Foodie.Components;
  var Data = Foodie.Data;

  var state = {
    searchQuery: '',
    activeCategory: null,
    activeFilters: [],
    sortBy: 'relevance',
    restaurants: Data.restaurants.slice()
  };

  function init() {
    Components.renderHeader();
    Components.renderFooter();
    renderHero();
    renderCategories();
    renderFilters();
    renderRestaurants();

    // Insert auth modals
    var modalsContainer = document.getElementById('modals');
    if (modalsContainer) {
      modalsContainer.innerHTML = Foodie.Auth.renderModals();
    }

    // After login/signup: re-render header to show user profile
    Foodie.Auth.onAuthChange = function() {
      Components.renderHeader();
      Components.updateCartBadge();
    };

    // Define header search handler (used by components.js)
    window._onHeaderSearch = function(e) {
      state.searchQuery = e.target.value.trim();
      var heroSearchEl = document.getElementById('hero-search');
      if (heroSearchEl) heroSearchEl.value = state.searchQuery;
      applyFilters();
    };

    // Bind hero search
    var heroSearch = document.getElementById('hero-search');
    if (heroSearch) {
      heroSearch.addEventListener('input', Utils.debounce(function() {
        state.searchQuery = heroSearch.value.trim();
        var headerSearch = document.getElementById('header-search');
        if (headerSearch) headerSearch.value = state.searchQuery;
        applyFilters();
      }, 300));
      heroSearch.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          state.searchQuery = heroSearch.value.trim();
          var headerSearch = document.getElementById('header-search');
          if (headerSearch) headerSearch.value = state.searchQuery;
          applyFilters();
          // Scroll to results
          var grid = document.getElementById('restaurants-grid');
          if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    // Bind hero search icon click
    var heroSearchIcon = document.querySelector('.hero__search-icon');
    if (heroSearchIcon && heroSearch) {
      heroSearchIcon.style.cursor = 'pointer';
      heroSearchIcon.addEventListener('click', function() {
        state.searchQuery = heroSearch.value.trim();
        var headerSearch = document.getElementById('header-search');
        if (headerSearch) headerSearch.value = state.searchQuery;
        applyFilters();
        var grid = document.getElementById('restaurants-grid');
        if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    // Bind hero search button
    var heroSearchBtn = document.getElementById('hero-search-btn');
    if (heroSearchBtn && heroSearch) {
      heroSearchBtn.addEventListener('click', function() {
        state.searchQuery = heroSearch.value.trim();
        var headerSearch = document.getElementById('header-search');
        if (headerSearch) headerSearch.value = state.searchQuery;
        applyFilters();
        // If exactly 1 result, go directly to it
        if (state.restaurants.length === 1) {
          window.location.href = 'restaurant.html?id=' + state.restaurants[0].id;
          return;
        }
        var grid = document.getElementById('restaurants-grid');
        if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    // Check for search query from URL (cross-page search)
    var urlSearch = Utils.getUrlParam('search');
    if (urlSearch) {
      state.searchQuery = urlSearch;
      if (heroSearch) heroSearch.value = urlSearch;
      var headerSearch = document.getElementById('header-search');
      if (headerSearch) headerSearch.value = urlSearch;
      applyFilters();
    }
  }

  function renderHero() {
    var el = document.getElementById('hero-section');
    if (!el) return;

    var html = '<div class="container">';
    html += '<div class="hero__inner">';

    html += '<div class="hero__content">';
    html += '<h1 class="hero__title">Hungry? <span class="hero__title-highlight">Order food</span> from the best restaurants in Hyderabad</h1>';
    html += '<p class="hero__subtitle">From Biryani to Haleem, Dosa to Kebabs — discover the authentic flavours of the City of Nizams, delivered to your doorstep.</p>';

    html += '<div class="hero__search">';
    html += '<span class="hero__search-icon">' + Utils.icons.search + '</span>';
    html += '<input class="hero__search-input" type="text" id="hero-search" placeholder="Search for restaurants, cuisines, or dishes...">';
    html += '<button class="hero__search-btn" id="hero-search-btn">Search</button>';
    html += '</div>';

    html += '<div class="hero__stats">';
    html += '<div><div class="hero__stat-value">50+</div><div class="hero__stat-label">Restaurants</div></div>';
    html += '<div><div class="hero__stat-value">400+</div><div class="hero__stat-label">Dishes</div></div>';
    html += '<div><div class="hero__stat-value">30 min</div><div class="hero__stat-label">Avg Delivery</div></div>';
    html += '</div>';

    html += '</div>';

    html += '<div class="hero__image"><img src="https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=500&h=450&fit=crop" alt="Delicious food"></div>';

    html += '</div></div>';
    el.innerHTML = html;
  }

  function renderCategories() {
    var el = document.getElementById('categories-section');
    if (!el) return;

    var categories = Config.CATEGORIES;
    var html = '<div class="container">';
    html += '<h2 class="section__title">What\u2019s on your mind?</h2>';
    html += '<div class="categories__scroll">';

    for (var i = 0; i < categories.length; i++) {
      var cat = categories[i];
      var activeClass = state.activeCategory === cat.id ? ' category-item--active' : '';
      html += '<div class="category-item' + activeClass + '" data-category="' + cat.id + '" onclick="window._selectCategory(\'' + cat.id + '\')">';
      html += '<div class="category-item__icon">' + cat.emoji + '</div>';
      html += '<span class="category-item__name">' + cat.name + '</span>';
      html += '</div>';
    }

    html += '</div></div>';
    el.innerHTML = html;
  }

  window._selectCategory = function(catId) {
    if (state.activeCategory === catId) {
      state.activeCategory = null;
    } else {
      state.activeCategory = catId;
    }
    renderCategories();
    applyFilters();
  };

  function renderFilters() {
    var el = document.getElementById('filters-section');
    if (!el) return;

    var html = '<div class="container">';
    html += '<div class="filters">';

    // Sort
    html += '<select class="sort-select" id="sort-select" onchange="window._changeSort(this.value)">';
    var sortOpts = Config.SORT_OPTIONS;
    for (var i = 0; i < sortOpts.length; i++) {
      var selected = state.sortBy === sortOpts[i].value ? ' selected' : '';
      html += '<option value="' + sortOpts[i].value + '"' + selected + '>' + sortOpts[i].label + '</option>';
    }
    html += '</select>';

    // Filter chips
    var filters = Config.FILTERS;
    for (var j = 0; j < filters.length; j++) {
      var f = filters[j];
      var activeClass = state.activeFilters.indexOf(f.id) >= 0 ? ' filter-chip--active' : '';
      html += '<button class="filter-chip' + activeClass + '" onclick="window._toggleFilter(\'' + f.id + '\')">' + f.label + '</button>';
    }

    html += '</div>';

    // Search results bar
    html += '<div class="search-results-bar" id="search-results-bar">';
    html += '<span id="search-results-text"></span>';
    html += '<span class="search-results-bar__clear" onclick="window._clearSearch()">Clear</span>';
    html += '</div>';

    html += '</div>';
    el.innerHTML = html;
  }

  window._changeSort = function(value) {
    state.sortBy = value;
    applyFilters();
  };

  window._toggleFilter = function(filterId) {
    var idx = state.activeFilters.indexOf(filterId);
    if (idx >= 0) {
      state.activeFilters.splice(idx, 1);
    } else {
      state.activeFilters.push(filterId);
    }
    renderFilters();
    applyFilters();
  };

  window._clearSearch = function() {
    state.searchQuery = '';
    state.activeCategory = null;
    state.activeFilters = [];
    state.sortBy = 'relevance';

    var heroSearch = document.getElementById('hero-search');
    var headerSearch = document.getElementById('header-search');
    if (heroSearch) heroSearch.value = '';
    if (headerSearch) headerSearch.value = '';

    renderCategories();
    renderFilters();
    applyFilters();
  };

  function applyFilters() {
    var results = Data.restaurants.slice();
    var query = state.searchQuery.toLowerCase();

    // Search filter
    if (query) {
      results = results.filter(function(r) {
        var nameMatch = r.name.toLowerCase().indexOf(query) >= 0;
        var cuisineMatch = r.cuisines.join(' ').toLowerCase().indexOf(query) >= 0;
        // Also search menu items
        var menuMatch = false;
        for (var i = 0; i < r.menu.length; i++) {
          if (r.menu[i].name.toLowerCase().indexOf(query) >= 0 ||
              r.menu[i].category.toLowerCase().indexOf(query) >= 0) {
            menuMatch = true;
            break;
          }
        }
        return nameMatch || cuisineMatch || menuMatch;
      });
    }

    // Category filter
    if (state.activeCategory) {
      var catName = state.activeCategory.toLowerCase();
      results = results.filter(function(r) {
        var cuisineMatch = r.cuisines.join(' ').toLowerCase().indexOf(catName) >= 0;
        var menuMatch = false;
        for (var i = 0; i < r.menu.length; i++) {
          if (r.menu[i].category.toLowerCase().indexOf(catName) >= 0 ||
              r.menu[i].name.toLowerCase().indexOf(catName) >= 0) {
            menuMatch = true;
            break;
          }
        }
        return cuisineMatch || menuMatch;
      });
    }

    // Active filters
    for (var f = 0; f < state.activeFilters.length; f++) {
      var filter = state.activeFilters[f];
      if (filter === 'rating4') {
        results = results.filter(function(r) { return r.rating >= 4.0; });
      } else if (filter === 'fast_delivery') {
        results = results.filter(function(r) {
          var time = parseInt(r.deliveryTime);
          return time <= 30;
        });
      } else if (filter === 'pure_veg') {
        results = results.filter(function(r) { return r.isVeg; });
      } else if (filter === 'offers') {
        results = results.filter(function(r) { return r.offer; });
      }
    }

    // Sort
    if (state.sortBy === 'rating') {
      results.sort(function(a, b) { return b.rating - a.rating; });
    } else if (state.sortBy === 'delivery_time') {
      results.sort(function(a, b) { return parseInt(a.deliveryTime) - parseInt(b.deliveryTime); });
    } else if (state.sortBy === 'cost_low') {
      results.sort(function(a, b) { return a.costForTwo - b.costForTwo; });
    } else if (state.sortBy === 'cost_high') {
      results.sort(function(a, b) { return b.costForTwo - a.costForTwo; });
    }

    state.restaurants = results;

    // Expose for header search button
    window._getSearchResults = function() { return state.restaurants; };

    // Update search results bar
    var bar = document.getElementById('search-results-bar');
    var text = document.getElementById('search-results-text');
    if (bar && text) {
      if (query || state.activeCategory || state.activeFilters.length > 0) {
        bar.classList.add('search-results-bar--visible');
        text.textContent = results.length + ' restaurant' + (results.length !== 1 ? 's' : '') + ' found';
      } else {
        bar.classList.remove('search-results-bar--visible');
      }
    }

    renderRestaurants();
  }

  function renderRestaurants() {
    var el = document.getElementById('restaurants-grid');
    if (!el) return;

    if (state.restaurants.length === 0) {
      el.innerHTML = Components.renderEmptyState(
        'No restaurants found',
        'Try adjusting your search or filters to find what you\'re looking for.',
        'Clear filters',
        'index.html'
      );
      return;
    }

    var html = '<div class="restaurants__count">' + state.restaurants.length + ' restaurants</div>';
    html += '<div class="restaurants-grid">';

    for (var i = 0; i < state.restaurants.length; i++) {
      html += Components.renderRestaurantCard(state.restaurants[i], state.searchQuery);
    }

    html += '</div>';
    el.innerHTML = html;
  }

  // Init on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', init);
})();

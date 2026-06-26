/* ==========================================================================
   Foodie.Storage — Persistent Storage with Cookie Session Management

   Architecture:
   - Session: Stored in cookies (persists across all pages, like Swiggy/Zomato)
   - User data: localStorage primary, cookie backup for current user
   - Cart/Orders: localStorage (user-scoped keys)
   - Memory cache: In-page cache for performance
   ========================================================================== */

(function() {
  'use strict';

  window.Foodie = window.Foodie || {};

  var Storage = {};

  // In-memory cache for current page performance
  var _memoryCache = {};

  // ---- Cookie Helpers (reliable cross-page persistence) ----

  function _setCookie(name, value, days) {
    var expires = '';
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/; SameSite=Lax';
  }

  function _getCookie(name) {
    var nameEQ = name + '=';
    var parts = document.cookie.split(';');
    for (var i = 0; i < parts.length; i++) {
      var c = parts[i].trim();
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length));
      }
    }
    return null;
  }

  function _removeCookie(name) {
    document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
  }

  // ---- Core Storage (localStorage + memory cache) ----

  Storage.get = function(key) {
    // Try localStorage first (persists across pages)
    try {
      var data = localStorage.getItem(key);
      if (data) {
        var parsed = JSON.parse(data);
        _memoryCache[key] = parsed;
        return parsed;
      }
    } catch (e) {
      // localStorage unavailable
    }
    // Fallback to memory cache (current page only)
    return _memoryCache.hasOwnProperty(key) ? _memoryCache[key] : null;
  };

  Storage.set = function(key, value) {
    _memoryCache[key] = value;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // localStorage unavailable — memory cache is the fallback
    }
  };

  Storage.remove = function(key) {
    delete _memoryCache[key];
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // ignore
    }
  };

  // ---- Users CRUD ----

  Storage.getUsers = function() {
    return Storage.get(Foodie.Config.STORAGE_KEYS.USERS) || [];
  };

  Storage.saveUsers = function(users) {
    Storage.set(Foodie.Config.STORAGE_KEYS.USERS, users);
  };

  Storage.findUserByEmail = function(email) {
    var users = Storage.getUsers();
    var lower = email.toLowerCase();
    for (var i = 0; i < users.length; i++) {
      if (users[i].email.toLowerCase() === lower) return users[i];
    }
    return null;
  };

  Storage.findUserByPhone = function(phone) {
    var users = Storage.getUsers();
    for (var i = 0; i < users.length; i++) {
      if (users[i].phone === phone) return users[i];
    }
    return null;
  };

  Storage.findUserById = function(id) {
    var users = Storage.getUsers();
    for (var i = 0; i < users.length; i++) {
      if (users[i].id === id) return users[i];
    }
    // Fallback: recover current user from cookie if localStorage lost the data
    var cookieUser = _getCookie('foodie_current_user');
    if (cookieUser) {
      try {
        var user = JSON.parse(cookieUser);
        if (user && user.id === id) {
          // Re-sync user back into the users array in localStorage
          users.push(user);
          Storage.saveUsers(users);
          return user;
        }
      } catch (e) {}
    }
    return null;
  };

  Storage.addUser = function(user) {
    var users = Storage.getUsers();
    users.push(user);
    Storage.saveUsers(users);
  };

  Storage.updateUser = function(updatedUser) {
    var users = Storage.getUsers();
    for (var i = 0; i < users.length; i++) {
      if (users[i].id === updatedUser.id) {
        users[i] = updatedUser;
        break;
      }
    }
    Storage.saveUsers(users);
    // Update cookie if this is the current user
    var session = Storage.getSession();
    if (session === updatedUser.id) {
      _setCookie('foodie_current_user', JSON.stringify(updatedUser), 30);
    }
  };

  // ---- Session Management (Cookie-primary for cross-page persistence) ----

  Storage.setSession = function(userId) {
    // Store in localStorage + memory
    Storage.set(Foodie.Config.STORAGE_KEYS.SESSION, userId);
    // Store in cookie — this is the PRIMARY cross-page session store
    _setCookie('foodie_session', userId, 30);
    // Cache the current user object in a cookie so it survives page navigation
    // even if localStorage is unreliable
    var user = Storage.findUserById(userId);
    if (user) {
      _setCookie('foodie_current_user', JSON.stringify(user), 30);
    }
  };

  Storage.getSession = function() {
    // Try localStorage + memory first
    var session = Storage.get(Foodie.Config.STORAGE_KEYS.SESSION);
    if (session) return session;
    // Cookie fallback — works across all pages
    var cookieSession = _getCookie('foodie_session');
    if (cookieSession) {
      // Re-sync to localStorage + memory for this page
      Storage.set(Foodie.Config.STORAGE_KEYS.SESSION, cookieSession);
      return cookieSession;
    }
    return null;
  };

  Storage.clearSession = function() {
    Storage.remove(Foodie.Config.STORAGE_KEYS.SESSION);
    _removeCookie('foodie_session');
    _removeCookie('foodie_current_user');
  };

  // ---- User-Scoped Cart ----

  Storage.getCart = function(userId) {
    return Storage.get(Foodie.Config.STORAGE_KEYS.CART_PREFIX + userId) || { restaurantId: null, restaurantName: '', items: [] };
  };

  Storage.saveCart = function(userId, cart) {
    Storage.set(Foodie.Config.STORAGE_KEYS.CART_PREFIX + userId, cart);
  };

  Storage.clearCart = function(userId) {
    Storage.remove(Foodie.Config.STORAGE_KEYS.CART_PREFIX + userId);
  };

  // ---- User-Scoped Orders ----

  Storage.getOrders = function(userId) {
    return Storage.get(Foodie.Config.STORAGE_KEYS.ORDERS_PREFIX + userId) || [];
  };

  Storage.saveOrders = function(userId, orders) {
    Storage.set(Foodie.Config.STORAGE_KEYS.ORDERS_PREFIX + userId, orders);
  };

  Storage.addOrder = function(userId, order) {
    var orders = Storage.getOrders(userId);
    orders.unshift(order);
    Storage.saveOrders(userId, orders);
  };

  // ---- User-Scoped Favourites ----

  Storage.getFavourites = function(userId) {
    return Storage.get('foodie_favs_' + userId) || [];
  };

  Storage.saveFavourites = function(userId, favs) {
    Storage.set('foodie_favs_' + userId, favs);
  };

  Storage.toggleFavourite = function(userId, restaurantId) {
    var favs = Storage.getFavourites(userId);
    var idx = favs.indexOf(restaurantId);
    if (idx >= 0) {
      favs.splice(idx, 1);
    } else {
      favs.push(restaurantId);
    }
    Storage.saveFavourites(userId, favs);
    return idx < 0; // returns true if added, false if removed
  };

  Storage.isFavourite = function(userId, restaurantId) {
    var favs = Storage.getFavourites(userId);
    return favs.indexOf(restaurantId) >= 0;
  };

  window.Foodie.Storage = Storage;
})();

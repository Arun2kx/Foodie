/* ==========================================================================
   Foodie.Storage — localStorage Abstraction, User-Scoped Keys
   ========================================================================== */

(function() {
  'use strict';

  window.Foodie = window.Foodie || {};

  var Storage = {};

  // In-memory fallback when localStorage fails
  var _memoryStore = {};

  // Basic get/set/remove
  Storage.get = function(key) {
    try {
      var data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch (e) {
      // localStorage failed, fall through to memory
    }
    // Fallback to memory store
    return _memoryStore.hasOwnProperty(key) ? _memoryStore[key] : null;
  };

  Storage.set = function(key, value) {
    // Always store in memory as fallback
    _memoryStore[key] = value;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage.set failed for key:', key, '- using memory fallback');
    }
  };

  Storage.remove = function(key) {
    delete _memoryStore[key];
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('Storage.remove failed for key:', key);
    }
  };

  // Users CRUD
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
  };

  // Session
  Storage.getSession = function() {
    return Storage.get(Foodie.Config.STORAGE_KEYS.SESSION);
  };

  Storage.setSession = function(userId) {
    Storage.set(Foodie.Config.STORAGE_KEYS.SESSION, userId);
  };

  Storage.clearSession = function() {
    Storage.remove(Foodie.Config.STORAGE_KEYS.SESSION);
  };

  // User-scoped cart
  Storage.getCart = function(userId) {
    return Storage.get(Foodie.Config.STORAGE_KEYS.CART_PREFIX + userId) || { restaurantId: null, restaurantName: '', items: [] };
  };

  Storage.saveCart = function(userId, cart) {
    Storage.set(Foodie.Config.STORAGE_KEYS.CART_PREFIX + userId, cart);
  };

  Storage.clearCart = function(userId) {
    Storage.remove(Foodie.Config.STORAGE_KEYS.CART_PREFIX + userId);
  };

  // User-scoped orders
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

  window.Foodie.Storage = Storage;
})();

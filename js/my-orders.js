/* ==========================================================================
   My Orders Page — Order History
   ========================================================================== */

(function() {
  'use strict';

  var Utils = Foodie.Utils;
  var Components = Foodie.Components;
  var Auth = Foodie.Auth;
  var Storage = Foodie.Storage;

  function init() {
    Components.renderHeader({ hideSearch: true });
    Components.renderFooter();

    // Insert auth modals
    var modalsContainer = document.getElementById('modals');
    if (modalsContainer) {
      modalsContainer.innerHTML = Foodie.Auth.renderModals();
    }

    // After login/signup: re-render header and orders
    Foodie.Auth.onAuthChange = function() {
      Components.renderHeader({ hideSearch: true });
      Components.updateCartBadge();
      renderOrders();
    };

    renderOrders();
  }

  function renderOrders() {
    var el = document.getElementById('orders-content');
    if (!el) return;

    var user = Auth.getCurrentUser();
    if (!user) {
      el.innerHTML = Components.renderEmptyState(
        'Please login first',
        'You need to login to view your order history.',
        'Go Home',
        'index.html'
      );
      return;
    }

    var orders = Storage.getOrders(user.id);

    if (orders.length === 0) {
      el.innerHTML = Components.renderEmptyState(
        'No orders yet',
        'You haven\'t placed any orders yet. Start exploring restaurants and order your favourite food!',
        'Browse Restaurants',
        'index.html'
      );
      return;
    }

    var html = '<h1 class="orders-page__title">My Orders</h1>';

    for (var i = 0; i < orders.length; i++) {
      html += renderOrderCard(orders[i]);
    }

    el.innerHTML = html;
  }

  function renderOrderCard(order) {
    var html = '<div class="order-card">';

    // Header
    html += '<div class="order-card__header">';
    html += '<div>';
    html += '<div class="order-card__restaurant">' + Utils.sanitizeHTML(order.restaurantName) + '</div>';
    html += '<div class="order-card__id">Order #' + Utils.sanitizeHTML(order.id) + '</div>';
    html += '</div>';

    var statusClass = order.status === 'Delivered' ? 'delivered' : 'preparing';
    html += '<span class="order-card__status order-card__status--' + statusClass + '">' + Utils.sanitizeHTML(order.status) + '</span>';
    html += '</div>';

    // Items
    html += '<div class="order-card__items">';
    for (var i = 0; i < order.items.length; i++) {
      var item = order.items[i];
      html += '<div class="order-card__item">';
      html += '<span class="food-type food-type--' + (item.isVeg ? 'veg' : 'nonveg') + '"></span>';
      html += '<span class="order-card__item-qty">' + item.qty + ' x</span>';
      html += '<span>' + Utils.sanitizeHTML(item.name) + '</span>';
      html += '</div>';
    }
    html += '</div>';

    // Footer
    html += '<div class="order-card__footer">';
    html += '<span class="order-card__date">' + Utils.formatDate(order.createdAt) + '</span>';
    html += '<span class="order-card__total">Total: ' + Utils.formatCurrency(order.total) + '</span>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  document.addEventListener('DOMContentLoaded', init);
})();

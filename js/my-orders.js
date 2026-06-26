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

    var html = '<a href="index.html" class="back-btn back-btn--dark"><span class="back-btn__icon">' + Utils.icons.arrowLeft + '</span> Back to Home</a>';
    html += '<h1 class="orders-page__title">My Orders</h1>';

    for (var i = 0; i < orders.length; i++) {
      html += renderOrderCard(orders[i]);
    }

    el.innerHTML = html;
    bindReorderButtons();
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

    // Special instructions (if any)
    if (order.specialInstructions) {
      html += '<div class="order-card__instructions">';
      html += '<span class="order-card__instructions-label">Instructions:</span> ';
      html += Utils.sanitizeHTML(order.specialInstructions);
      html += '</div>';
    }

    // Footer
    html += '<div class="order-card__footer">';
    html += '<span class="order-card__date">' + Utils.formatDate(order.createdAt) + '</span>';
    html += '<span class="order-card__total">Total: ' + Utils.formatCurrency(order.total) + '</span>';
    html += '</div>';

    // Reorder button
    html += '<div class="order-card__reorder">';
    html += '<button class="btn btn--primary btn--sm reorder-btn" data-order-index="' + order.id + '">Reorder</button>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  function bindReorderButtons() {
    var btns = document.querySelectorAll('.reorder-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function() {
        var orderId = this.getAttribute('data-order-index');
        handleReorder(orderId);
      });
    }
  }

  function handleReorder(orderId) {
    var user = Foodie.Auth.getCurrentUser();
    if (!user) {
      Foodie.Auth.openLoginModal();
      return;
    }

    var orders = Storage.getOrders(user.id);
    var order = null;
    for (var i = 0; i < orders.length; i++) {
      if (orders[i].id === orderId) {
        order = orders[i];
        break;
      }
    }

    if (!order) return;

    var Cart = Foodie.Cart;
    var result = Cart.bulkAddItems(order.restaurantId, order.restaurantName, order.items);

    if (result.success) {
      Utils.showToast('Items added to cart!', 'success');
      Components.updateCartBadge();
    } else if (result.reason === 'conflict') {
      // Show conflict modal for reorder
      var cart = Cart.get();
      var overlay = document.getElementById('conflict-modal');
      if (!overlay) {
        var div = document.createElement('div');
        div.innerHTML = '<div class="modal-overlay" id="conflict-modal"><div class="modal"><div class="modal__header"><h2 class="modal__title">Replace cart?</h2><button class="modal__close" onclick="document.getElementById(\'conflict-modal\').classList.remove(\'modal-overlay--active\');document.body.style.overflow=\'\';">' + Utils.icons.close + '</button></div><div class="modal__body conflict-modal"><p class="conflict-modal__text" id="conflict-text"></p><div class="conflict-modal__actions"><button class="btn btn--ghost" id="conflict-no">No</button><button class="btn btn--primary" id="conflict-yes">Yes, start fresh</button></div></div></div></div>';
        document.body.appendChild(div.firstChild);
        overlay = document.getElementById('conflict-modal');
      }

      document.getElementById('conflict-text').textContent = 'Your cart contains items from ' + cart.restaurantName + '. Would you like to clear the cart and add items from ' + order.restaurantName + '?';
      overlay.classList.add('modal-overlay--active');
      document.body.style.overflow = 'hidden';

      document.getElementById('conflict-no').onclick = function() {
        overlay.classList.remove('modal-overlay--active');
        document.body.style.overflow = '';
      };

      document.getElementById('conflict-yes').onclick = function() {
        Cart.replaceWithItems(order.restaurantId, order.restaurantName, order.items);
        overlay.classList.remove('modal-overlay--active');
        document.body.style.overflow = '';
        Utils.showToast('Items added to cart!', 'success');
        Components.updateCartBadge();
      };
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();

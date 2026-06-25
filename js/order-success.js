/* ==========================================================================
   Order Success Page — Confirmation Display
   ========================================================================== */

(function() {
  'use strict';

  var Utils = Foodie.Utils;
  var Components = Foodie.Components;

  function init() {
    Components.renderHeader({ hideSearch: true });
    Components.renderFooter();

    // Insert auth modals
    var modalsContainer = document.getElementById('modals');
    if (modalsContainer) {
      modalsContainer.innerHTML = Foodie.Auth.renderModals();
    }

    renderSuccess();
  }

  function renderSuccess() {
    var el = document.getElementById('success-content');
    if (!el) return;

    var orderStr = sessionStorage.getItem('foodie_last_order');
    if (!orderStr) {
      el.innerHTML = Components.renderEmptyState(
        'No order found',
        'It looks like you arrived here by mistake.',
        'Go Home',
        'index.html'
      );
      return;
    }

    var order;
    try {
      order = JSON.parse(orderStr);
    } catch (e) {
      el.innerHTML = Components.renderEmptyState('No order found', 'Something went wrong.', 'Go Home', 'index.html');
      return;
    }

    var itemCount = 0;
    for (var i = 0; i < order.items.length; i++) {
      itemCount += order.items[i].qty;
    }

    var html = '<div class="success-card">';

    // Icon
    html += '<div class="success-card__icon">' + Utils.icons.check + '</div>';

    html += '<h1 class="success-card__title">Order Placed!</h1>';
    html += '<p class="success-card__subtitle">Your order has been placed successfully and will be delivered soon.</p>';

    // Details
    html += '<div class="success-card__details">';
    html += '<div class="success-detail"><span class="success-detail__label">Order ID</span><span class="success-detail__value">' + Utils.sanitizeHTML(order.id) + '</span></div>';
    html += '<div class="success-detail"><span class="success-detail__label">Restaurant</span><span class="success-detail__value">' + Utils.sanitizeHTML(order.restaurantName) + '</span></div>';
    html += '<div class="success-detail"><span class="success-detail__label">Items</span><span class="success-detail__value">' + itemCount + ' item' + (itemCount !== 1 ? 's' : '') + '</span></div>';

    if (order.coupon) {
      html += '<div class="success-detail"><span class="success-detail__label">Coupon</span><span class="success-detail__value" style="color:var(--color-success);">' + Utils.sanitizeHTML(order.coupon) + ' (-' + Utils.formatCurrency(order.discount) + ')</span></div>';
    }

    html += '<div class="success-detail"><span class="success-detail__label">Payment</span><span class="success-detail__value">' + Utils.sanitizeHTML(order.paymentMethod) + '</span></div>';
    html += '<div class="success-detail" style="border-top:1px solid var(--color-gray-200);padding-top:8px;margin-top:4px;"><span class="success-detail__label" style="font-weight:600;color:var(--color-gray-900);">Total</span><span class="success-detail__value" style="font-size:1.125rem;">' + Utils.formatCurrency(order.total) + '</span></div>';
    html += '</div>';

    // Delivery Address
    if (order.address) {
      html += '<p style="font-size:var(--font-size-md);color:var(--color-gray-500);margin-bottom:var(--space-6);text-align:left;">';
      html += '<strong>Delivering to:</strong> ' + Utils.sanitizeHTML(order.address.flat) + ', ' + Utils.sanitizeHTML(order.address.street) + ', ' + Utils.sanitizeHTML(order.address.city) + ' - ' + Utils.sanitizeHTML(order.address.pincode);
      html += '</p>';
    }

    // Actions
    html += '<div class="success-card__actions">';
    html += '<a href="my-orders.html" class="btn btn--primary btn--lg">View My Orders</a>';
    html += '<a href="index.html" class="btn btn--secondary btn--lg">Back to Home</a>';
    html += '</div>';

    html += '</div>';
    el.innerHTML = html;
  }

  document.addEventListener('DOMContentLoaded', init);
})();

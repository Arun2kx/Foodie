/* ==========================================================================
   Order Success Page — Confirmation Display + Order Tracking
   ========================================================================== */

(function() {
  'use strict';

  var Utils = Foodie.Utils;
  var Components = Foodie.Components;

  var trackingSteps = [
    { label: 'Order Confirmed', desc: 'Your order has been received' },
    { label: 'Preparing Food', desc: 'Restaurant is preparing your food' },
    { label: 'Out for Delivery', desc: 'Your food is on its way' },
    { label: 'Delivered', desc: 'Enjoy your meal!' }
  ];

  var currentStep = 0;
  var trackingTimer = null;

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

    // Order Tracking Timeline
    html += renderTrackingTimeline();

    // Estimated Delivery Time
    if (order.estimatedDelivery) {
      html += '<div class="success-card__eta">';
      html += Utils.icons.clock;
      html += '<span>Estimated delivery by <strong>' + Utils.sanitizeHTML(order.estimatedDelivery) + '</strong></span>';
      html += '</div>';
    }

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

    // Special Instructions (if any)
    if (order.specialInstructions) {
      html += '<div class="success-card__instructions">';
      html += '<strong>Special Instructions:</strong> ' + Utils.sanitizeHTML(order.specialInstructions);
      html += '</div>';
    }

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

    // Start tracking animation
    startTracking();
  }

  function renderTrackingTimeline() {
    var html = '<div class="tracking-timeline" id="tracking-timeline">';
    for (var i = 0; i < trackingSteps.length; i++) {
      var step = trackingSteps[i];
      var stepClass = 'tracking-step';
      if (i < currentStep) stepClass += ' tracking-step--completed';
      else if (i === currentStep) stepClass += ' tracking-step--active';

      html += '<div class="' + stepClass + '" data-step="' + i + '">';
      html += '<div class="tracking-step__indicator">';
      if (i < currentStep) {
        html += '<span class="tracking-step__check">' + Utils.icons.check + '</span>';
      } else if (i === currentStep) {
        html += '<span class="tracking-step__pulse"></span>';
      } else {
        html += '<span class="tracking-step__dot"></span>';
      }
      html += '</div>';
      if (i < trackingSteps.length - 1) {
        html += '<div class="tracking-step__line' + (i < currentStep ? ' tracking-step__line--filled' : '') + '"></div>';
      }
      html += '<div class="tracking-step__content">';
      html += '<div class="tracking-step__label">' + step.label + '</div>';
      html += '<div class="tracking-step__desc">' + step.desc + '</div>';
      html += '</div>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function startTracking() {
    currentStep = 0;
    updateTrackingUI();

    trackingTimer = setInterval(function() {
      if (currentStep < trackingSteps.length - 1) {
        currentStep++;
        updateTrackingUI();
      } else {
        clearInterval(trackingTimer);
      }
    }, 3000);
  }

  function updateTrackingUI() {
    var steps = document.querySelectorAll('.tracking-step');
    for (var i = 0; i < steps.length; i++) {
      var step = steps[i];
      var idx = parseInt(step.getAttribute('data-step'));
      var indicator = step.querySelector('.tracking-step__indicator');
      var line = step.querySelector('.tracking-step__line');

      step.className = 'tracking-step';
      if (idx < currentStep) {
        step.classList.add('tracking-step--completed');
        indicator.innerHTML = '<span class="tracking-step__check">' + Utils.icons.check + '</span>';
        if (line) line.classList.add('tracking-step__line--filled');
      } else if (idx === currentStep) {
        step.classList.add('tracking-step--active');
        indicator.innerHTML = '<span class="tracking-step__pulse"></span>';
        if (line) line.classList.remove('tracking-step__line--filled');
      } else {
        indicator.innerHTML = '<span class="tracking-step__dot"></span>';
        if (line) line.classList.remove('tracking-step__line--filled');
      }
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();

/* ==========================================================================
   Checkout Page — Cart Display, Address, Coupons, Place Order
   ========================================================================== */

(function() {
  'use strict';

  var Utils = Foodie.Utils;
  var Config = Foodie.Config;
  var Components = Foodie.Components;
  var Cart = Foodie.Cart;
  var Auth = Foodie.Auth;
  var Storage = Foodie.Storage;

  var state = {
    couponCode: '',
    couponApplied: null,
    couponError: ''
  };

  function init() {
    Components.renderHeader({ hideSearch: true });
    Components.renderFooter();

    // Insert auth modals
    var modalsContainer = document.getElementById('modals');
    if (modalsContainer) {
      modalsContainer.innerHTML = Foodie.Auth.renderModals();
    }

    // After login/signup: re-render header and page so cart shows
    Foodie.Auth.onAuthChange = function() {
      Components.renderHeader({ hideSearch: true });
      Components.updateCartBadge();
      renderPage();
    };

    renderPage();
  }

  function renderPage() {
    var el = document.getElementById('checkout-content');
    if (!el) return;

    var user = Auth.getCurrentUser();
    if (!user) {
      el.innerHTML = Components.renderEmptyState(
        'Please login first',
        'You need to login to view your cart and place orders.',
        'Go Home',
        'index.html'
      );
      return;
    }

    var cart = Cart.get();
    if (!cart.items || cart.items.length === 0) {
      el.innerHTML = Components.renderEmptyState(
        'Your cart is empty',
        'Looks like you haven\'t added anything to your cart yet. Browse restaurants and add your favourite dishes!',
        'Browse Restaurants',
        'index.html'
      );
      return;
    }

    var html = '<a href="index.html" class="back-btn back-btn--dark"><span class="back-btn__icon">' + Utils.icons.arrowLeft + '</span> Back to Home</a>';
    html += '<h1 class="checkout-page__title">Checkout</h1>';
    html += '<div class="checkout-layout">';

    // Left column
    html += '<div>';
    html += renderCartItems(cart);
    html += renderCouponSection();
    html += renderAddressForm();
    html += '</div>';

    // Right column: Bill summary
    html += renderBillSummary();

    html += '</div>';
    el.innerHTML = html;

    bindEvents();
  }

  function renderCartItems(cart) {
    var html = '<div class="cart-section">';
    html += '<div class="cart-section__header">';
    html += '<span class="cart-section__restaurant-name">' + Utils.sanitizeHTML(cart.restaurantName) + '</span>';
    html += '</div>';

    for (var i = 0; i < cart.items.length; i++) {
      var item = cart.items[i];
      html += '<div class="cart-item">';
      html += '<div class="cart-item__left">';
      html += '<span class="food-type food-type--' + (item.isVeg ? 'veg' : 'nonveg') + '"></span>';
      html += '<span class="cart-item__name">' + Utils.sanitizeHTML(item.name) + '</span>';
      html += '</div>';
      html += '<div class="cart-item__right">';
      html += '<div class="qty-control">';
      html += '<button class="qty-control__btn" data-item="' + item.id + '" data-action="dec">&minus;</button>';
      html += '<span class="qty-control__value">' + item.qty + '</span>';
      html += '<button class="qty-control__btn" data-item="' + item.id + '" data-action="inc">+</button>';
      html += '</div>';
      html += '<span class="cart-item__price">' + Utils.formatCurrency(item.price * item.qty) + '</span>';
      html += '</div>';
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  function renderCouponSection() {
    var html = '<div class="coupon-section">';
    html += '<h3 class="coupon-section__title">Apply Coupon</h3>';

    if (state.couponApplied) {
      html += '<div class="coupon-applied">';
      html += '<span class="coupon-applied__info">' + Utils.icons.check + ' ' + state.couponApplied.code + ' applied</span>';
      html += '<span class="coupon-applied__remove" id="remove-coupon">Remove</span>';
      html += '</div>';
    } else {
      html += '<div class="coupon-input-wrap">';
      html += '<input class="form-input" type="text" id="coupon-input" placeholder="Enter coupon code" value="' + Utils.sanitizeHTML(state.couponCode) + '">';
      html += '<button class="btn btn--primary" id="apply-coupon">Apply</button>';
      html += '</div>';
      if (state.couponError) {
        html += '<div class="coupon-error">' + Utils.sanitizeHTML(state.couponError) + '</div>';
      }

      // Available coupons
      html += '<div class="available-coupons">';
      html += '<div class="available-coupons__title">Available Coupons</div>';
      var coupons = Config.COUPONS;
      for (var i = 0; i < coupons.length; i++) {
        var c = coupons[i];
        html += '<div class="coupon-card" data-coupon="' + c.code + '">';
        html += '<div><div class="coupon-card__code">' + c.code + '</div>';
        html += '<div class="coupon-card__desc">' + Utils.sanitizeHTML(c.description) + '</div></div>';
        html += '<span class="coupon-card__action">Apply</span>';
        html += '</div>';
      }
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  function renderAddressForm() {
    var html = '<div class="address-section">';
    html += '<h3 class="address-section__title">Delivery Address</h3>';
    html += '<form class="address-form" id="address-form">';

    html += '<div class="form-group"><label class="form-label">Flat / House No / Building</label>';
    html += '<input class="form-input" type="text" id="addr-flat" placeholder="e.g. Flat 201, Tower A" required></div>';

    html += '<div class="form-group"><label class="form-label">Street / Area / Locality</label>';
    html += '<input class="form-input" type="text" id="addr-street" placeholder="e.g. Road No 12, Banjara Hills" required></div>';

    html += '<div class="form-row">';
    html += '<div class="form-group"><label class="form-label">City</label>';
    html += '<input class="form-input" type="text" id="addr-city" value="Hyderabad" required></div>';
    html += '<div class="form-group"><label class="form-label">Pincode</label>';
    html += '<input class="form-input" type="text" id="addr-pincode" placeholder="e.g. 500034" maxlength="6" required></div>';
    html += '</div>';

    html += '</form></div>';

    // Special Instructions
    html += '<div class="instructions-section">';
    html += '<h3 class="instructions-section__title">Special Instructions</h3>';
    html += '<textarea class="form-input instructions-textarea" id="special-instructions" placeholder="e.g., Extra spicy, no onions, ring the doorbell" maxlength="200" rows="3"></textarea>';
    html += '</div>';

    return html;
  }

  function getEstimatedDeliveryTime() {
    var cart = Cart.get();
    if (!cart.restaurantId) return null;

    var Data = Foodie.Data;
    var restaurant = null;
    for (var i = 0; i < Data.restaurants.length; i++) {
      if (Data.restaurants[i].id === cart.restaurantId) {
        restaurant = Data.restaurants[i];
        break;
      }
    }
    if (!restaurant) return null;

    // Parse deliveryTime like "30-35 min" — take the upper bound
    var match = restaurant.deliveryTime.match(/(\d+)/g);
    var minutes = match ? parseInt(match[match.length - 1]) : 30;

    var eta = new Date();
    eta.setMinutes(eta.getMinutes() + minutes);
    var hours = eta.getHours();
    var mins = eta.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return hours + ':' + (mins < 10 ? '0' : '') + mins + ' ' + ampm;
  }

  function renderBillSummary() {
    var bill = Cart.calculateBill(state.couponApplied ? state.couponApplied.code : null);
    var eta = getEstimatedDeliveryTime();

    var html = '<div class="bill-summary">';
    html += '<h3 class="bill-summary__title">Bill Details</h3>';

    html += '<div class="bill-row"><span>Item Total</span><span>' + Utils.formatCurrency(bill.subtotal) + '</span></div>';

    if (bill.discount > 0) {
      html += '<div class="bill-row bill-row--discount"><span>Discount</span><span>-' + Utils.formatCurrency(bill.discount) + '</span></div>';
    }

    html += '<div class="bill-row"><span>Delivery Fee</span><span>';
    if (bill.deliveryFee === 0) {
      html += '<span style="text-decoration:line-through;color:var(--color-gray-400);margin-right:4px;">' + Utils.formatCurrency(Config.DELIVERY_FEE) + '</span> FREE';
    } else {
      html += Utils.formatCurrency(bill.deliveryFee);
    }
    html += '</span></div>';

    html += '<div class="bill-row bill-row--total"><span>To Pay</span><span>' + Utils.formatCurrency(bill.total) + '</span></div>';

    // Estimated delivery time
    if (eta) {
      html += '<div class="bill-summary__eta">';
      html += Utils.icons.clock;
      html += '<span>Estimated delivery by <strong>' + eta + '</strong></span>';
      html += '</div>';
    }

    html += '<div class="bill-summary__payment">';
    html += '<div class="bill-summary__payment-label">Payment Method</div>';
    html += '<div class="payment-method">\uD83D\uDCB5 Cash on Delivery</div>';
    html += '</div>';

    html += '<button class="btn btn--primary btn--block btn--lg bill-summary__place-order" id="place-order-btn">Place Order \u2022 ' + Utils.formatCurrency(bill.total) + '</button>';

    html += '</div>';
    return html;
  }

  function bindEvents() {
    // Qty controls
    var qtyBtns = document.querySelectorAll('.qty-control__btn[data-item]');
    for (var i = 0; i < qtyBtns.length; i++) {
      qtyBtns[i].addEventListener('click', function() {
        var itemId = this.getAttribute('data-item');
        var action = this.getAttribute('data-action');
        var qty = Cart.getItemQty(itemId);
        Cart.updateQty(itemId, action === 'inc' ? qty + 1 : qty - 1);
        Components.updateCartBadge();
        renderPage();
      });
    }

    // Apply coupon
    var applyBtn = document.getElementById('apply-coupon');
    if (applyBtn) {
      applyBtn.addEventListener('click', function() {
        var input = document.getElementById('coupon-input');
        var code = input.value.trim();
        if (!code) {
          state.couponError = 'Please enter a coupon code.';
          renderPage();
          return;
        }
        var result = Cart.applyCoupon(code);
        if (result.success) {
          state.couponApplied = result.coupon;
          state.couponCode = '';
          state.couponError = '';
          Utils.showToast('Coupon applied successfully!', 'success');
        } else {
          state.couponError = result.error;
          state.couponApplied = null;
        }
        renderPage();
      });
    }

    // Remove coupon
    var removeBtn = document.getElementById('remove-coupon');
    if (removeBtn) {
      removeBtn.addEventListener('click', function() {
        state.couponApplied = null;
        state.couponCode = '';
        state.couponError = '';
        Utils.showToast('Coupon removed', 'info');
        renderPage();
      });
    }

    // Coupon cards (click to apply)
    var couponCards = document.querySelectorAll('.coupon-card');
    for (var j = 0; j < couponCards.length; j++) {
      couponCards[j].addEventListener('click', function() {
        var code = this.getAttribute('data-coupon');
        var result = Cart.applyCoupon(code);
        if (result.success) {
          state.couponApplied = result.coupon;
          state.couponCode = '';
          state.couponError = '';
          Utils.showToast('Coupon applied successfully!', 'success');
        } else {
          state.couponError = result.error;
          state.couponApplied = null;
        }
        renderPage();
      });
    }

    // Place order
    var placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
      placeOrderBtn.addEventListener('click', function() {
        placeOrder();
      });
    }
  }

  function placeOrder() {
    var user = Auth.getCurrentUser();
    if (!user) {
      Auth.openLoginModal();
      return;
    }

    // Validate address
    var flat = document.getElementById('addr-flat').value.trim();
    var street = document.getElementById('addr-street').value.trim();
    var city = document.getElementById('addr-city').value.trim();
    var pincode = document.getElementById('addr-pincode').value.trim();

    if (!flat || !street || !city || !pincode) {
      Utils.showToast('Please fill in all address fields.', 'error');
      return;
    }

    if (!Config.VALIDATION.PINCODE_REGEX.test(pincode)) {
      Utils.showToast('Please enter a valid Hyderabad pincode (starts with 5).', 'error');
      return;
    }

    var cart = Cart.get();
    var bill = Cart.calculateBill(state.couponApplied ? state.couponApplied.code : null);
    var eta = getEstimatedDeliveryTime();
    var instructionsEl = document.getElementById('special-instructions');
    var specialInstructions = instructionsEl ? instructionsEl.value.trim() : '';

    var order = {
      id: 'ORD' + Date.now().toString(36).toUpperCase(),
      restaurantId: cart.restaurantId,
      restaurantName: cart.restaurantName,
      items: cart.items.slice(),
      subtotal: bill.subtotal,
      discount: bill.discount,
      deliveryFee: bill.deliveryFee,
      total: bill.total,
      coupon: state.couponApplied ? state.couponApplied.code : null,
      address: {
        flat: flat,
        street: street,
        city: city,
        pincode: pincode
      },
      paymentMethod: 'Cash on Delivery',
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
      estimatedDelivery: eta,
      specialInstructions: specialInstructions || null
    };

    Storage.addOrder(user.id, order);
    Cart.clear();

    // Store latest order ID for success page
    sessionStorage.setItem('foodie_last_order', JSON.stringify(order));

    window.location.href = 'order-success.html';
  }

  document.addEventListener('DOMContentLoaded', init);
})();

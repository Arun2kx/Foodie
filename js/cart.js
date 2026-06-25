/* ==========================================================================
   Foodie.Cart — Cart CRUD, Conflict Handling, Per-User Isolation
   ========================================================================== */

(function() {
  'use strict';

  window.Foodie = window.Foodie || {};

  var Cart = {};
  var Storage = Foodie.Storage;
  var Utils = Foodie.Utils;
  var Auth = Foodie.Auth;

  // Get current user's cart
  Cart.get = function() {
    var user = Auth.getCurrentUser();
    if (!user) return { restaurantId: null, restaurantName: '', items: [] };
    return Storage.getCart(user.id);
  };

  // Get total item count
  Cart.getCount = function() {
    var cart = Cart.get();
    var count = 0;
    for (var i = 0; i < cart.items.length; i++) {
      count += cart.items[i].qty;
    }
    return count;
  };

  // Get subtotal
  Cart.getSubtotal = function() {
    var cart = Cart.get();
    var total = 0;
    for (var i = 0; i < cart.items.length; i++) {
      total += cart.items[i].price * cart.items[i].qty;
    }
    return total;
  };

  // Add item to cart
  Cart.addItem = function(restaurantId, restaurantName, item) {
    var user = Auth.getCurrentUser();
    if (!user) {
      Auth.openLoginModal();
      return { success: false, reason: 'auth' };
    }

    var cart = Storage.getCart(user.id);

    // Check restaurant conflict
    if (cart.restaurantId && cart.restaurantId !== restaurantId && cart.items.length > 0) {
      return { success: false, reason: 'conflict', newRestaurant: restaurantName, newItem: item, newRestaurantId: restaurantId };
    }

    cart.restaurantId = restaurantId;
    cart.restaurantName = restaurantName;

    // Check if item already in cart
    var found = false;
    for (var i = 0; i < cart.items.length; i++) {
      if (cart.items[i].id === item.id) {
        cart.items[i].qty += 1;
        found = true;
        break;
      }
    }

    if (!found) {
      cart.items.push({
        id: item.id,
        name: item.name,
        price: item.price,
        isVeg: item.isVeg,
        qty: 1
      });
    }

    Storage.saveCart(user.id, cart);
    return { success: true };
  };

  // Update item quantity
  Cart.updateQty = function(itemId, newQty) {
    var user = Auth.getCurrentUser();
    if (!user) return;

    var cart = Storage.getCart(user.id);

    if (newQty <= 0) {
      cart.items = cart.items.filter(function(item) { return item.id !== itemId; });
      if (cart.items.length === 0) {
        cart.restaurantId = null;
        cart.restaurantName = '';
      }
    } else {
      for (var i = 0; i < cart.items.length; i++) {
        if (cart.items[i].id === itemId) {
          cart.items[i].qty = newQty;
          break;
        }
      }
    }

    Storage.saveCart(user.id, cart);
  };

  // Remove item
  Cart.removeItem = function(itemId) {
    Cart.updateQty(itemId, 0);
  };

  // Clear cart (for conflict resolution or after order)
  Cart.clear = function() {
    var user = Auth.getCurrentUser();
    if (!user) return;
    Storage.clearCart(user.id);
  };

  // Replace cart with new restaurant (conflict resolution)
  Cart.replaceWithItem = function(restaurantId, restaurantName, item) {
    var user = Auth.getCurrentUser();
    if (!user) return;

    var cart = {
      restaurantId: restaurantId,
      restaurantName: restaurantName,
      items: [{
        id: item.id,
        name: item.name,
        price: item.price,
        isVeg: item.isVeg,
        qty: 1
      }]
    };

    Storage.saveCart(user.id, cart);
  };

  // Get item quantity in cart
  Cart.getItemQty = function(itemId) {
    var cart = Cart.get();
    for (var i = 0; i < cart.items.length; i++) {
      if (cart.items[i].id === itemId) return cart.items[i].qty;
    }
    return 0;
  };

  // Apply coupon
  Cart.applyCoupon = function(code) {
    var coupons = Foodie.Config.COUPONS;
    var subtotal = Cart.getSubtotal();
    var upperCode = code.toUpperCase();

    var coupon = null;
    for (var i = 0; i < coupons.length; i++) {
      if (coupons[i].code === upperCode) {
        coupon = coupons[i];
        break;
      }
    }

    if (!coupon) {
      return { success: false, error: 'Invalid coupon code.' };
    }

    if (subtotal < coupon.minOrder) {
      return { success: false, error: 'Minimum order of ' + Utils.formatCurrency(coupon.minOrder) + ' required.' };
    }

    var discount = 0;
    if (coupon.type === 'flat') {
      discount = coupon.value;
    } else if (coupon.type === 'percentage') {
      discount = Math.min(subtotal * coupon.value / 100, coupon.maxDiscount);
    } else if (coupon.type === 'free_delivery') {
      discount = 0; // Handled separately in bill calc
    }

    return { success: true, coupon: coupon, discount: Math.round(discount) };
  };

  // Calculate bill
  Cart.calculateBill = function(couponCode) {
    var subtotal = Cart.getSubtotal();
    var deliveryFee = Foodie.Config.DELIVERY_FEE;
    var discount = 0;
    var coupon = null;
    var freeDelivery = false;

    if (couponCode) {
      var result = Cart.applyCoupon(couponCode);
      if (result.success) {
        coupon = result.coupon;
        discount = result.discount;
        if (coupon.type === 'free_delivery') {
          freeDelivery = true;
        }
      }
    }

    if (freeDelivery || subtotal >= Foodie.Config.FREE_DELIVERY_THRESHOLD) {
      deliveryFee = 0;
    }

    var total = subtotal - discount + deliveryFee;

    return {
      subtotal: subtotal,
      discount: discount,
      deliveryFee: deliveryFee,
      freeDelivery: freeDelivery,
      total: Math.max(total, 0),
      coupon: coupon
    };
  };

  // Show conflict modal
  Cart.showConflictModal = function(restaurantId, restaurantName, item, onReplace) {
    var cart = Cart.get();
    var overlay = document.getElementById('conflict-modal');
    if (!overlay) {
      var div = document.createElement('div');
      div.innerHTML = '<div class="modal-overlay" id="conflict-modal"><div class="modal"><div class="modal__header"><h2 class="modal__title">Replace cart?</h2><button class="modal__close" onclick="document.getElementById(\'conflict-modal\').classList.remove(\'modal-overlay--active\');document.body.style.overflow=\'\';">' + Utils.icons.close + '</button></div><div class="modal__body conflict-modal"><p class="conflict-modal__text" id="conflict-text"></p><div class="conflict-modal__actions"><button class="btn btn--ghost" id="conflict-no">No</button><button class="btn btn--primary" id="conflict-yes">Yes, start fresh</button></div></div></div></div>';
      document.body.appendChild(div.firstChild);
      overlay = document.getElementById('conflict-modal');
    }

    document.getElementById('conflict-text').textContent = 'Your cart contains items from ' + cart.restaurantName + '. Would you like to clear the cart and add items from ' + restaurantName + '?';

    overlay.classList.add('modal-overlay--active');
    document.body.style.overflow = 'hidden';

    document.getElementById('conflict-no').onclick = function() {
      overlay.classList.remove('modal-overlay--active');
      document.body.style.overflow = '';
    };

    document.getElementById('conflict-yes').onclick = function() {
      Cart.replaceWithItem(restaurantId, restaurantName, item);
      overlay.classList.remove('modal-overlay--active');
      document.body.style.overflow = '';
      Utils.showToast('Added to cart!', 'success');
      if (typeof onReplace === 'function') onReplace();
      Foodie.Components.updateCartBadge();
    };
  };

  window.Foodie.Cart = Cart;
})();

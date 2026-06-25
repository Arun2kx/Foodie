/* ==========================================================================
   Foodie.Auth — Signup, Login, Logout, Forgot Password, Session, Modals
   ========================================================================== */

(function() {
  'use strict';

  window.Foodie = window.Foodie || {};

  var Auth = {};
  var Config = Foodie.Config;
  var Storage = Foodie.Storage;
  var Utils = Foodie.Utils;

  // Get current logged-in user
  Auth.getCurrentUser = function() {
    var userId = Storage.getSession();
    if (!userId) return null;
    return Storage.findUserById(userId);
  };

  // Signup
  Auth.signup = function(data) {
    var v = Config.VALIDATION;
    if (!data.name || data.name.length < v.NAME_MIN || data.name.length > v.NAME_MAX) {
      return { success: false, error: 'Name must be ' + v.NAME_MIN + '-' + v.NAME_MAX + ' characters.' };
    }
    if (!v.EMAIL_REGEX.test(data.email)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!v.PHONE_REGEX.test(data.phone)) {
      return { success: false, error: 'Please enter a valid 10-digit phone number.' };
    }
    if (!data.password || data.password.length < v.PASSWORD_MIN) {
      return { success: false, error: 'Password must be at least ' + v.PASSWORD_MIN + ' characters.' };
    }
    if (data.password !== data.confirmPassword) {
      return { success: false, error: 'Passwords do not match.' };
    }
    if (Storage.findUserByEmail(data.email)) {
      return { success: false, error: 'An account with this email already exists.' };
    }
    if (Storage.findUserByPhone(data.phone)) {
      return { success: false, error: 'An account with this phone number already exists.' };
    }

    var user = {
      id: Utils.generateId(),
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      password: data.password,
      createdAt: new Date().toISOString()
    };

    Storage.addUser(user);
    Storage.setSession(user.id);
    return { success: true, user: user };
  };

  // Login
  Auth.login = function(identifier, password) {
    if (!identifier || !password) {
      return { success: false, error: 'Please fill in all fields.' };
    }

    var user = null;
    if (Config.VALIDATION.EMAIL_REGEX.test(identifier)) {
      user = Storage.findUserByEmail(identifier);
    } else if (Config.VALIDATION.PHONE_REGEX.test(identifier)) {
      user = Storage.findUserByPhone(identifier);
    } else {
      return { success: false, error: 'Please enter a valid email or phone number.' };
    }

    if (!user) {
      return { success: false, error: 'No account found with these credentials.' };
    }
    if (user.password !== password) {
      return { success: false, error: 'Incorrect password.' };
    }

    Storage.setSession(user.id);
    return { success: true, user: user };
  };

  // Logout
  Auth.logout = function() {
    Storage.clearSession();
  };

  // Forgot password - verify email
  Auth.verifyEmail = function(email) {
    if (!Config.VALIDATION.EMAIL_REGEX.test(email)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    var user = Storage.findUserByEmail(email);
    if (!user) {
      return { success: false, error: 'No account found with this email.' };
    }
    return { success: true, userId: user.id };
  };

  // Forgot password - reset
  Auth.resetPassword = function(userId, newPassword, confirmPassword) {
    var v = Config.VALIDATION;
    if (!newPassword || newPassword.length < v.PASSWORD_MIN) {
      return { success: false, error: 'Password must be at least ' + v.PASSWORD_MIN + ' characters.' };
    }
    if (newPassword !== confirmPassword) {
      return { success: false, error: 'Passwords do not match.' };
    }
    var user = Storage.findUserById(userId);
    if (!user) {
      return { success: false, error: 'User not found.' };
    }
    user.password = newPassword;
    Storage.updateUser(user);
    return { success: true };
  };

  // Auth guard - redirect to home if not logged in
  Auth.requireAuth = function() {
    if (!Auth.getCurrentUser()) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  };

  // ----- Modal Management -----

  Auth.openLoginModal = function() {
    Auth._closeAllModals();
    var overlay = document.getElementById('login-modal');
    if (overlay) {
      overlay.classList.add('modal-overlay--active');
      document.body.style.overflow = 'hidden';
    }
  };

  Auth.openSignupModal = function() {
    Auth._closeAllModals();
    var overlay = document.getElementById('signup-modal');
    if (overlay) {
      overlay.classList.add('modal-overlay--active');
      document.body.style.overflow = 'hidden';
    }
  };

  Auth.openForgotModal = function() {
    Auth._closeAllModals();
    var overlay = document.getElementById('forgot-modal');
    if (overlay) {
      overlay.classList.add('modal-overlay--active');
      document.body.style.overflow = 'hidden';
      // Reset to step 1
      var step1 = document.getElementById('forgot-step1');
      var step2 = document.getElementById('forgot-step2');
      if (step1) step1.style.display = 'block';
      if (step2) step2.style.display = 'none';
    }
  };

  Auth._closeAllModals = function() {
    var modals = document.querySelectorAll('.modal-overlay');
    for (var i = 0; i < modals.length; i++) {
      modals[i].classList.remove('modal-overlay--active');
    }
    document.body.style.overflow = '';
  };

  // Render auth modals HTML
  Auth.renderModals = function() {
    var html = '';

    // Login Modal
    html += '<div class="modal-overlay auth-modal" id="login-modal">';
    html += '<div class="modal">';
    html += '<div class="modal__header"><div><h2 class="modal__title">Login</h2><p class="modal__subtitle">Enter your credentials</p></div>';
    html += '<button class="modal__close" onclick="Foodie.Auth._closeAllModals()">' + Utils.icons.close + '</button></div>';
    html += '<div class="modal__body">';
    html += '<form id="login-form" onsubmit="return Foodie.Auth._handleLogin(event)">';
    html += '<div class="form-group"><label class="form-label">Email or Phone</label>';
    html += '<input class="form-input" type="text" id="login-identifier" placeholder="Enter email or phone" required></div>';
    html += '<div class="form-group"><label class="form-label">Password</label>';
    html += '<div class="password-wrap"><input class="form-input" type="password" id="login-password" placeholder="Enter password" required>';
    html += '<span class="password-toggle" onclick="Foodie.Auth._togglePassword(\'login-password\', this)">' + Utils.icons.eye + '</span></div></div>';
    html += '<div class="auth-forgot"><span class="auth-forgot__link" onclick="Foodie.Auth.openForgotModal()">Forgot password?</span></div>';
    html += '<div id="login-error" class="form-error" style="display:none;margin-bottom:8px;"></div>';
    html += '<button type="submit" class="btn btn--primary btn--block btn--lg">Login</button>';
    html += '</form>';
    html += '<div class="auth-switch">New to Foodie? <span class="auth-switch__link" onclick="Foodie.Auth.openSignupModal()">Create account</span></div>';
    html += '</div></div></div>';

    // Signup Modal
    html += '<div class="modal-overlay auth-modal" id="signup-modal">';
    html += '<div class="modal">';
    html += '<div class="modal__header"><div><h2 class="modal__title">Sign Up</h2><p class="modal__subtitle">Create your account</p></div>';
    html += '<button class="modal__close" onclick="Foodie.Auth._closeAllModals()">' + Utils.icons.close + '</button></div>';
    html += '<div class="modal__body">';
    html += '<form id="signup-form" onsubmit="return Foodie.Auth._handleSignup(event)">';
    html += '<div class="form-group"><label class="form-label">Full Name</label>';
    html += '<input class="form-input" type="text" id="signup-name" placeholder="Enter your name" required></div>';
    html += '<div class="form-group"><label class="form-label">Email</label>';
    html += '<input class="form-input" type="email" id="signup-email" placeholder="Enter email" required></div>';
    html += '<div class="form-group"><label class="form-label">Phone</label>';
    html += '<input class="form-input" type="tel" id="signup-phone" placeholder="10-digit phone number" required></div>';
    html += '<div class="form-group"><label class="form-label">Password</label>';
    html += '<div class="password-wrap"><input class="form-input" type="password" id="signup-password" placeholder="Min 6 characters" required>';
    html += '<span class="password-toggle" onclick="Foodie.Auth._togglePassword(\'signup-password\', this)">' + Utils.icons.eye + '</span></div></div>';
    html += '<div class="form-group"><label class="form-label">Confirm Password</label>';
    html += '<div class="password-wrap"><input class="form-input" type="password" id="signup-confirm" placeholder="Re-enter password" required>';
    html += '<span class="password-toggle" onclick="Foodie.Auth._togglePassword(\'signup-confirm\', this)">' + Utils.icons.eye + '</span></div></div>';
    html += '<div id="signup-error" class="form-error" style="display:none;margin-bottom:8px;"></div>';
    html += '<button type="submit" class="btn btn--primary btn--block btn--lg">Create Account</button>';
    html += '</form>';
    html += '<div class="auth-switch">Already have an account? <span class="auth-switch__link" onclick="Foodie.Auth.openLoginModal()">Login</span></div>';
    html += '</div></div></div>';

    // Forgot Password Modal
    html += '<div class="modal-overlay auth-modal" id="forgot-modal">';
    html += '<div class="modal">';
    html += '<div class="modal__header"><div><h2 class="modal__title">Reset Password</h2><p class="modal__subtitle">Recover your account</p></div>';
    html += '<button class="modal__close" onclick="Foodie.Auth._closeAllModals()">' + Utils.icons.close + '</button></div>';
    html += '<div class="modal__body">';
    // Step 1: Email verification
    html += '<div id="forgot-step1">';
    html += '<form id="forgot-email-form" onsubmit="return Foodie.Auth._handleForgotEmail(event)">';
    html += '<div class="form-group"><label class="form-label">Email Address</label>';
    html += '<input class="form-input" type="email" id="forgot-email" placeholder="Enter your registered email" required></div>';
    html += '<div id="forgot-email-error" class="form-error" style="display:none;margin-bottom:8px;"></div>';
    html += '<button type="submit" class="btn btn--primary btn--block btn--lg">Verify Email</button>';
    html += '</form></div>';
    // Step 2: New password
    html += '<div id="forgot-step2" style="display:none;">';
    html += '<form id="forgot-reset-form" onsubmit="return Foodie.Auth._handleResetPassword(event)">';
    html += '<div class="form-group"><label class="form-label">New Password</label>';
    html += '<div class="password-wrap"><input class="form-input" type="password" id="forgot-new-password" placeholder="Min 6 characters" required>';
    html += '<span class="password-toggle" onclick="Foodie.Auth._togglePassword(\'forgot-new-password\', this)">' + Utils.icons.eye + '</span></div></div>';
    html += '<div class="form-group"><label class="form-label">Confirm New Password</label>';
    html += '<div class="password-wrap"><input class="form-input" type="password" id="forgot-confirm-password" placeholder="Re-enter new password" required>';
    html += '<span class="password-toggle" onclick="Foodie.Auth._togglePassword(\'forgot-confirm-password\', this)">' + Utils.icons.eye + '</span></div></div>';
    html += '<div id="forgot-reset-error" class="form-error" style="display:none;margin-bottom:8px;"></div>';
    html += '<button type="submit" class="btn btn--primary btn--block btn--lg">Reset Password</button>';
    html += '</form></div>';
    html += '<div class="auth-switch" style="margin-top:16px;"><span class="auth-switch__link" onclick="Foodie.Auth.openLoginModal()">Back to Login</span></div>';
    html += '</div></div></div>';

    return html;
  };

  // Internal: password toggle
  Auth._togglePassword = function(inputId, toggleEl) {
    var input = document.getElementById(inputId);
    if (input.type === 'password') {
      input.type = 'text';
      toggleEl.innerHTML = Utils.icons.eyeOff;
    } else {
      input.type = 'password';
      toggleEl.innerHTML = Utils.icons.eye;
    }
  };

  // Internal: handle login form
  Auth._handleLogin = function(e) {
    e.preventDefault();
    var identifier = document.getElementById('login-identifier').value.trim();
    var password = document.getElementById('login-password').value;
    var errorEl = document.getElementById('login-error');

    var result = Auth.login(identifier, password);
    if (!result.success) {
      errorEl.textContent = result.error;
      errorEl.style.display = 'block';
      return false;
    }

    errorEl.style.display = 'none';
    Auth._closeAllModals();
    Utils.showToast('Welcome back, ' + result.user.name + '!', 'success');
    Foodie.Components.updateAuthUI();
    Auth._notifyAuthChange();
    return false;
  };

  // Internal: handle signup form
  Auth._handleSignup = function(e) {
    e.preventDefault();
    var data = {
      name: document.getElementById('signup-name').value.trim(),
      email: document.getElementById('signup-email').value.trim(),
      phone: document.getElementById('signup-phone').value.trim(),
      password: document.getElementById('signup-password').value,
      confirmPassword: document.getElementById('signup-confirm').value
    };
    var errorEl = document.getElementById('signup-error');

    var result = Auth.signup(data);
    if (!result.success) {
      errorEl.textContent = result.error;
      errorEl.style.display = 'block';
      return false;
    }

    errorEl.style.display = 'none';
    Auth._closeAllModals();
    Utils.showToast('Welcome to Foodie, ' + result.user.name + '!', 'success');
    Foodie.Components.updateAuthUI();
    Auth._notifyAuthChange();
    return false;
  };

  // Auth change callback — pages register this to refresh after login/signup
  Auth.onAuthChange = null;

  Auth._notifyAuthChange = function() {
    if (typeof Auth.onAuthChange === 'function') {
      Auth.onAuthChange();
    }
  };

  // Internal: handle forgot email verification
  Auth._forgotUserId = null;

  Auth._handleForgotEmail = function(e) {
    e.preventDefault();
    var email = document.getElementById('forgot-email').value.trim();
    var errorEl = document.getElementById('forgot-email-error');

    var result = Auth.verifyEmail(email);
    if (!result.success) {
      errorEl.textContent = result.error;
      errorEl.style.display = 'block';
      return false;
    }

    Auth._forgotUserId = result.userId;
    errorEl.style.display = 'none';
    document.getElementById('forgot-step1').style.display = 'none';
    document.getElementById('forgot-step2').style.display = 'block';
    return false;
  };

  // Internal: handle password reset
  Auth._handleResetPassword = function(e) {
    e.preventDefault();
    var newPassword = document.getElementById('forgot-new-password').value;
    var confirmPassword = document.getElementById('forgot-confirm-password').value;
    var errorEl = document.getElementById('forgot-reset-error');

    var result = Auth.resetPassword(Auth._forgotUserId, newPassword, confirmPassword);
    if (!result.success) {
      errorEl.textContent = result.error;
      errorEl.style.display = 'block';
      return false;
    }

    errorEl.style.display = 'none';
    Auth._closeAllModals();
    Utils.showToast('Password reset successfully! Please login.', 'success');
    setTimeout(function() {
      Auth.openLoginModal();
    }, 500);
    return false;
  };

  window.Foodie.Auth = Auth;
})();

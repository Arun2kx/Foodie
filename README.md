# Foodie - Food Delivery Platform for Hyderabad

A full-featured food delivery web application inspired by Swiggy/Zomato, built entirely with vanilla HTML, CSS, and JavaScript. No frameworks, no build tools — runs directly in the browser.

## Live Demo

Open `index.html` with [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in VS Code or any static file server.

## Features

### Restaurants & Menu
- 40 real Hyderabad restaurants (Paradise, Bawarchi, Shah Ghouse, Pista House, Chutneys, and more)
- 370+ menu items with images, prices, descriptions, and veg/non-veg indicators
- Bestseller badges on popular items
- Veg-only toggle filter
- Menu search within a restaurant
- Category navigation tabs

### Search & Filters
- Search restaurants by name, cuisine, or dish
- Food category carousel (Biryani, Haleem, Dosa, Pizza, Burger, etc.)
- Filter chips: Rating 4.0+, Fast Delivery, Pure Veg, Offers
- Sort by: Relevance, Rating, Delivery Time, Cost
- Search highlighting on results
- Header search button with direct navigation to single results

### Authentication
- Signup with name, email, phone, and password
- Login with email or phone number
- Forgot password flow (email verify → reset)
- Session persistence via localStorage
- Profile avatar with dropdown menu (My Orders, Logout)
- Auth guard on protected pages

### Cart & Checkout
- Add to cart with quantity controls (+/-)
- Restaurant conflict detection (clear cart prompt when switching restaurants)
- Auto-add item to cart after login
- Coupon system with 4 codes:

| Code | Type | Discount | Min Order |
|------|------|----------|-----------|
| WELCOME50 | Flat | ₹50 off | ₹199 |
| FOODIE100 | Flat | ₹100 off | ₹499 |
| FREEDEL | Free Delivery | ₹0 delivery | ₹149 |
| SAVE20 | Percentage | 20% off (max ₹150) | ₹299 |

- Delivery address form with Hyderabad pincode validation
- Bill summary (subtotal, discount, delivery fee, total)
- Cash on Delivery payment
- Order confirmation page

### Orders
- Order history page with all past orders
- Order details: ID, restaurant, items, date, total, status
- User-scoped data — each user sees only their own orders

### Responsive Design
- Breakpoints at 480px, 768px, 1024px, and 1280px
- Mobile hamburger menu
- Touch-friendly interactions
- Adaptive grid layouts (1–4 columns)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 (semantic elements) |
| Styling | CSS3 (custom properties, BEM naming, Flexbox, Grid) |
| Logic | Vanilla JavaScript (ES5+, IIFE module pattern) |
| Storage | localStorage with in-memory fallback |
| Images | Unsplash URLs with onerror fallbacks |
| Build | None — zero dependencies, no bundler |

## Project Structure

```
foodie/
├── index.html              # Homepage
├── restaurant.html         # Restaurant detail + menu
├── checkout.html           # Cart + checkout
├── my-orders.html          # Order history
├── order-success.html      # Order confirmation
├── serve.json              # Static server config
│
├── css/
│   ├── variables.css       # Design tokens (colors, spacing, fonts)
│   ├── reset.css           # CSS reset
│   ├── base.css            # Buttons, inputs, utilities
│   ├── components.css      # Cards, modals, toasts, badges
│   ├── layout.css          # Header, footer, container, grid
│   ├── home.css            # Hero, categories, filters, restaurant grid
│   ├── auth.css            # Auth modals, profile dropdown
│   ├── restaurant.css      # Banner, menu items, category nav
│   ├── checkout.css        # Cart items, coupons, bill summary
│   ├── my-orders.css       # Order cards
│   ├── order-success.css   # Success page
│   └── responsive.css      # Media queries
│
└── js/
    ├── config.js           # Constants, coupons, categories, validation
    ├── utils.js            # Helpers, SVG icons, toast notifications
    ├── storage.js          # localStorage abstraction, user-scoped keys
    ├── auth.js             # Auth logic, modals, session management
    ├── cart.js             # Cart CRUD, conflict handling
    ├── data.js             # 40 restaurants with full menus
    ├── components.js       # Header, footer, restaurant card renderers
    ├── home.js             # Homepage search, filters, grid
    ├── restaurant-detail.js # Menu display, add-to-cart, veg filter
    ├── checkout.js         # Checkout flow, coupons, place order
    ├── my-orders.js        # Order history display
    └── order-success.js    # Order confirmation display
```

## Architecture

```
window.Foodie
  ├── Config      — Constants, storage keys, coupons, validation rules
  ├── Utils       — Helpers: sanitizeHTML, formatCurrency, debounce, icons
  ├── Storage     — localStorage CRUD with in-memory fallback
  ├── Auth        — Signup, login, logout, session, modals
  ├── Cart        — Add/remove/update items, conflict detection
  ├── Data        — 40 restaurants with complete menus
  └── Components  — Shared UI renderers (header, footer, cards)
```

### Data Flow

```
[localStorage] ←→ [Storage] ←→ [Auth / Cart]
                                     ↓
                               [Components]
                                     ↓
                                  [DOM / UI]
```

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/Arun2kx/Foodie.git
   cd Foodie
   ```

2. Open in VS Code and start Live Server, or use any static server:
   ```bash
   npx serve .
   ```

3. Open `http://localhost:3000` (or the Live Server URL) in your browser.

## Test Accounts

No pre-created accounts — sign up with any name, email, phone, and password to get started.

## Screenshots

### Homepage
Browse 40+ Hyderabad restaurants with search, category filters, and sort options.

### Restaurant Menu
View full menu with veg/non-veg indicators, bestseller badges, and add-to-cart controls.

### Checkout
Review cart, apply coupons, enter delivery address, and place order with Cash on Delivery.

## Author

**Arun** — [@Arun2kx](https://github.com/Arun2kx)

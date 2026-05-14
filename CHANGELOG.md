# INDÉRA — Project Changelog & Documentation

> Premium luxury watch e-commerce platform built with **React + Vite** (frontend) and **Node.js + Express + MongoDB** (backend).

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features Implemented](#features-implemented)
  - [1. Authentication System](#1-authentication-system)
  - [2. Product Catalog](#2-product-catalog)
  - [3. Shopping Cart & Wishlist](#3-shopping-cart--wishlist)
  - [4. Checkout & Payments](#4-checkout--payments)
  - [5. Order Confirmation Page](#5-order-confirmation-page)
  - [6. Customer Reviews](#6-customer-reviews)
  - [7. Admin Dashboard](#7-admin-dashboard)
  - [8. Email Notifications](#8-email-notifications)
  - [9. Contact / Forms Backend](#9-contact--forms-backend)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Git & Deployment](#git--deployment)

---

## Project Overview

**INDÉRA** is a full-stack luxury watch e-commerce platform. It features a rich product catalog, authenticated user accounts (including Google OAuth), a complete checkout flow with Stripe payments, order management, a customer review system, and a full-featured admin dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Framer Motion |
| Styling | Tailwind CSS (custom design tokens) |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT, Google OAuth (Passport.js) |
| Email | Nodemailer (custom SMTP / Gmail) |
| Payments | Stripe |

---

## Project Structure

```
chronolux-watches/
├── server/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── reviewController.js        ← NEW
│   │   └── contactController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── Review.js                  ← NEW
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── reviewRoutes.js            ← NEW
│   │   └── contactRoutes.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── adminAuth.js
│   └── index.js
├── src/
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Products.tsx
│   │   ├── ProductDetail.tsx          ← UPDATED (reviews + modal)
│   │   ├── Checkout.tsx
│   │   ├── OrderConfirmation.tsx      ← NEW
│   │   ├── Account.tsx
│   │   └── AdminDashboard.tsx         ← UPDATED (transaction IDs)
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── ProductCard.tsx
│   │   └── Cart.tsx
│   ├── context/
│   │   └── CartContext.tsx
│   ├── hooks/
│   │   └── useProducts.ts
│   └── services/
│       └── api.ts                     ← UPDATED (review API helpers)
└── package.json
```

---

## Features Implemented

### 1. Authentication System

- **Email/Password registration** with email verification link
- **Google OAuth** login via Passport.js
  - Fixed duplicate key error on `phone` field for Google users (sparse index added)
- **JWT-based session** management stored in localStorage
- Protected routes on both frontend and backend via middleware
- Passwords hashed with bcrypt

---

### 2. Product Catalog

- Full product listing with filtering by category, price, and availability
- Individual **Product Detail page** with:
  - High-res image with hover zoom effect
  - Star rating display (live from DB)
  - Specs table (material, origin, stock status)
  - Related products carousel
  - **"Write a Review"** button → opens review modal
  - Review list displayed below product info

---

### 3. Shopping Cart & Wishlist

- Global `CartContext` for cart and wishlist state
- Add/remove items with quantity control (+ / - buttons)
- Wishlist toggle with animated heart icon
- Cart slide-over panel with line items and totals
- Cart persists in local context during session

---

### 4. Checkout & Payments

- Multi-step checkout form: shipping info → payment
- **Stripe** integration for card payments
- Payment Intent created on backend; confirmed on frontend
- Order document saved to MongoDB after successful payment
- `transactionId` (Stripe Payment Intent ID) stored in `Order.payment.transactionId`
- On success: user redirected to **Order Confirmation** page with full order state

---

### 5. Order Confirmation Page

**File:** `src/pages/OrderConfirmation.tsx`

Premium post-purchase experience featuring:

- Animated glowing success checkmark icon
- **Order ID**, **Amount Paid**, and **"Confirmed"** status badge
- Itemized order summary with product images, names, quantities
- CTA buttons: **Back to Home** and **Continue Shopping**
- Link to **My Account** for order tracking
- Dark luxury design with animated gradient orbs and glassmorphism

> Accessed via React Router state passed from Checkout on success.  
> Redirects to `/` if accessed directly without valid state.

---

### 6. Customer Reviews

**Files added / modified:**
- `server/models/Review.js` — Mongoose schema
- `server/controllers/reviewController.js` — CRUD + verified purchase logic
- `server/routes/reviewRoutes.js` — Public + admin routes
- `src/services/api.ts` — `fetchProductReviews()`, `submitProductReview()`
- `src/pages/ProductDetail.tsx` — Review list display + submission modal

#### Customer Flow

1. Visit any product page → reviews load automatically (`GET /api/reviews/:productId`)
2. Click **"Write a Review"** → modal opens with:
   - Star rating selector (1–5)
   - Review title
   - Review body / comments
   - Author name & email
3. Submit → `POST /api/reviews/:productId`
4. If customer has a completed order containing that product → `verifiedPurchase: true`
5. Product's **average rating** and **review count** update automatically via Mongoose `post('save')` hook
6. Toast notification confirms success or shows error

#### Spam / Duplicate Prevention

A composite unique index `{ product, authorEmail }` prevents the same email submitting multiple reviews for one product.

#### Admin Review Management

| Endpoint | Description |
|---|---|
| `GET /api/admin/reviews` | List all reviews |
| `DELETE /api/admin/reviews/:id` | Delete a review |
| `PATCH /api/admin/reviews/:id/approve` | Toggle approval on/off |

Reviews default to `isApproved: true`. Use the admin endpoint to hide problematic reviews without deleting them.

---

### 7. Admin Dashboard

**File:** `src/pages/AdminDashboard.tsx`

Full admin panel at `/admin` (protected by `adminAuth` middleware). Features:

- **Overview stats**: Total orders, revenue, registered users, products
- **Order management** table with:
  - Customer name & email
  - Order items and total
  - Status badge (Pending / Processing / Shipped / Delivered)
  - **Payment Transaction ID** now displayed for every paid order ← NEW
- **Product management**: Add, edit, toggle hide/show products
- **User management**: View all registered users

#### Transaction ID in Admin Panel

```
Order #INV-20240512-001
Customer: Jane Smith  |  jane@example.com
Total: EUR 2,490.00   |  Status: Paid
Transaction ID: pi_3Xyz1234AbCd5678
```

This links front-end orders directly to the corresponding Stripe Payment Intent for easy reconciliation.

---

### 8. Email Notifications

- **Registration** → verification email with tokenized link sent via Nodemailer
- **Order confirmation** → branded HTML email sent after successful payment
- Supports custom SMTP domain or Gmail relay
- Admin notifications for new contact form submissions

---

### 9. Contact / Forms Backend

- Contact form POSTs to `POST /api/contact`
- Backend validates fields and sends email to admin inbox
- Rate limiting applied to prevent spam abuse

---

## API Endpoints

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/google` | — | Google OAuth start |
| GET | `/api/auth/google/callback` | — | Google OAuth callback |
| GET | `/api/auth/verify/:token` | — | Email verification |

### Products

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | — | List all active products |
| GET | `/api/products/:id` | — | Single product detail |
| POST | `/api/admin/products` | Admin | Create product |
| PUT | `/api/admin/products/:id` | Admin | Update product |
| DELETE | `/api/admin/products/:id` | Admin | Delete product |

### Orders

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/orders` | User | Create order + Stripe payment |
| GET | `/api/orders/my` | User | Customer's own orders |
| GET | `/api/admin/orders` | Admin | All orders |
| PATCH | `/api/admin/orders/:id` | Admin | Update order status |

### Reviews *(New)*

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/reviews/:productId` | — | Fetch approved reviews |
| POST | `/api/reviews/:productId` | — | Submit a review |
| GET | `/api/admin/reviews` | Admin | All reviews |
| DELETE | `/api/admin/reviews/:id` | Admin | Delete review |
| PATCH | `/api/admin/reviews/:id/approve` | Admin | Toggle approval |

### Contact

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/contact` | — | Submit contact form |

---

## Environment Variables

Create a `.env` file in `/server`:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/indera

# JWT
JWT_SECRET=your_super_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (SMTP)
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your_smtp_password
FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com

# Frontend URL (for CORS and email links)
CLIENT_URL=http://localhost:5173
```

---

## Running Locally

### Install dependencies

```bash
# Root (frontend)
npm install

# Backend
cd server
npm install
```

### Start the backend

```bash
cd server
node index.js
# or with hot-reload:
npx nodemon index.js
```

### Start the frontend

```bash
# from root
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |

---

## Git & Deployment

### Push all changes to GitHub

```bash
git add .
git commit -m "feat: customer reviews, admin transaction IDs, order confirmation page"
git push origin main
```

---

## Summary of All Work Done

| # | Feature | File(s) Changed | Status |
|---|---|---|---|
| 1 | Full authentication (JWT + Google OAuth) | `authController.js`, `User.js`, auth routes | ✅ Done |
| 2 | Google OAuth duplicate phone fix | `User.js` (sparse index) | ✅ Done |
| 3 | Product catalog & detail pages | `Products.tsx`, `ProductDetail.tsx` | ✅ Done |
| 4 | Shopping cart & wishlist | `CartContext.tsx`, `Cart.tsx` | ✅ Done |
| 5 | Checkout + Stripe payments | `Checkout.tsx`, `orderController.js` | ✅ Done |
| 6 | Order Confirmation page (premium UI) | `OrderConfirmation.tsx` | ✅ Done |
| 7 | Customer Review system (backend) | `Review.js`, `reviewController.js`, `reviewRoutes.js` | ✅ Done |
| 8 | Customer Review modal (frontend) | `ProductDetail.tsx`, `api.ts` | ✅ Done |
| 9 | Auto rating recalculation on review | `Review.js` (post save hook) | ✅ Done |
| 10 | Verified purchase badge on reviews | `reviewController.js` | ✅ Done |
| 11 | Admin: payment transaction ID display | `AdminDashboard.tsx` | ✅ Done |
| 12 | Admin: product / order / user management | `AdminDashboard.tsx` | ✅ Done |
| 13 | Email verification on registration | `authController.js`, Nodemailer | ✅ Done |
| 14 | Contact form backend | `contactController.js`, `contactRoutes.js` | ✅ Done |

---

*Last updated: May 2026 — INDÉRA Luxury Watches*

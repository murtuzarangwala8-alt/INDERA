# INDÉRA - Backend API

Complete backend API with payment processing and order management.

## Features

- ✅ Order creation and management
- ✅ Stripe payment integration
- ✅ Email notifications (order confirmations)
- ✅ MongoDB database
- ✅ Admin dashboard API
- ✅ Order status tracking
- ✅ RESTful API endpoints

## Tech Stack

- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Stripe** - Payment processing
- **Nodemailer** - Email service

## Setup Instructions

### 1. Install MongoDB

**Option A: Local MongoDB**
- Download from [mongodb.com](https://www.mongodb.com/try/download/community)
- Install and start MongoDB service

**Option B: MongoDB Atlas (Cloud)**
- Create free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Create cluster and get connection string

### 2. Get Stripe API Keys

1. Create account at [stripe.com](https://stripe.com)
2. Go to Developers → API Keys
3. Copy your test keys (starts with `sk_test_` and `pk_test_`)

### 3. Configure Environment Variables

Edit `server/.env` file:

```env
PORT=5000
NODE_ENV=development

# MongoDB - Choose one:
# Local:
MONGODB_URI=mongodb://localhost:27017/indera-jewelry
# Or Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/indera-jewelry

# Stripe Keys (from stripe.com dashboard)
STRIPE_SECRET_KEY=sk_test_your_actual_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here

# Email (optional - for order confirmations)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=INDÉRA <noreply@indera.com>

FRONTEND_URL=http://localhost:5173
```

### 4. Install Dependencies

```bash
cd server
npm install
```

### 5. Start Server

```bash
npm start
```

Or with auto-reload:
```bash
npm run dev
```

Server will run on `http://localhost:5000`

## API Endpoints

### Orders

**Create Order**
```
POST /api/orders
Body: {
  customer: { firstName, lastName, email, phone },
  shippingAddress: { address, city, zipCode, country },
  items: [{ productId, name, brand, price, quantity, image }],
  pricing: { subtotal, shipping, tax, total }
}
```

**Get All Orders** (Admin)
```
GET /api/orders?status=pending&page=1&limit=20
```

**Get Order by ID**
```
GET /api/orders/:id
```

**Get Order by Number**
```
GET /api/orders/number/:orderNumber
```

**Update Order Status** (Admin)
```
PUT /api/orders/:id
Body: { status: "processing", trackingNumber: "123456" }
```

**Get Order Statistics** (Admin)
```
GET /api/orders/stats
```

### Payment

**Create Payment Intent**
```
POST /api/payment/create-intent
Body: { amount: 1299.99, orderId: "..." }
```

**Confirm Payment**
```
POST /api/payment/confirm
Body: { orderId: "...", paymentIntentId: "..." }
```

### Config

**Get Stripe Publishable Key**
```
GET /api/config/stripe
```

**Health Check**
```
GET /api/health
```

## Order Status Flow

1. **pending** - Order created, payment pending
2. **processing** - Payment confirmed, preparing order
3. **shipped** - Order shipped with tracking
4. **delivered** - Order delivered to customer
5. **cancelled** - Order cancelled

## Testing Payments

Use Stripe test cards:

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

Any future expiry date and any 3-digit CVC.

## Email Setup (Optional)

For Gmail:
1. Enable 2-factor authentication
2. Generate App Password: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Use app password in `.env`

## Admin Dashboard

Access admin panel at: `http://localhost:5173/admin`

Features:
- View all orders
- Filter by status
- Update order status
- View statistics
- Track revenue

## Database Schema

### Order Model
```javascript
{
  orderNumber: String (auto-generated),
  customer: {
    firstName, lastName, email, phone
  },
  shippingAddress: {
    address, city, zipCode, country
  },
  items: [{
    productId, name, brand, price, quantity, image
  }],
  payment: {
    method, status, stripePaymentIntentId, transactionId
  },
  pricing: {
    subtotal, shipping, tax, total
  },
  status: String (enum),
  trackingNumber: String,
  createdAt, updatedAt
}
```

## Troubleshooting

**MongoDB Connection Error**
- Check MongoDB is running: `mongod --version`
- Verify connection string in `.env`

**Stripe Error**
- Verify API keys are correct
- Check keys start with `sk_test_` and `pk_test_`

**Email Not Sending**
- Email is optional, orders work without it
- Check email credentials in `.env`

**CORS Error**
- Verify `FRONTEND_URL` in `.env` matches your frontend URL

## Production Deployment

### Backend (Heroku/Railway/Render)

1. Set environment variables
2. Deploy code
3. Ensure MongoDB Atlas is used (not local)

### Frontend

Update `.env`:
```
VITE_API_URL=https://your-backend-url.com/api
```

## Security Notes

- Never commit `.env` file
- Use environment variables for all secrets
- In production, add authentication middleware
- Enable HTTPS
- Validate all inputs
- Rate limit API endpoints

## Support

For issues or questions:
- Email: support@indera.com
- Check logs in console
- Review Stripe dashboard for payment issues

---

Built with ❤️ using Node.js, Express, MongoDB, and Stripe

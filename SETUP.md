# Quick Setup Guide

## Step 1: Install MongoDB

### Option A: Local MongoDB (Recommended for development)
1. Download: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will start automatically

### Option B: MongoDB Atlas (Cloud - Free)
1. Sign up: https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `server/.env` with your connection string

## Step 2: Get Stripe Keys

1. Sign up: https://stripe.com
2. Go to: Developers → API Keys
3. Copy your test keys:
   - Secret key (starts with `sk_test_`)
   - Publishable key (starts with `pk_test_`)
4. Update `server/.env` with your keys

## Step 3: Configure Backend

Edit `server/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/chronolux-watches
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

## Step 4: Start Application

### Easy Way (Windows):
Double-click `start.bat`

### Manual Way:

Terminal 1 (Backend):
```bash
cd server
npm start
```

Terminal 2 (Frontend):
```bash
npm run dev
```

## Step 5: Test the Application

1. Open: http://localhost:5173
2. Add products to cart
3. Go to checkout
4. Use test card: 4242 4242 4242 4242
5. Any future expiry date and any 3-digit CVC
6. Complete payment

## Step 6: View Orders (Admin)

1. Open: http://localhost:5173/admin
2. View all orders
3. Update order status
4. Track revenue

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check connection string in `server/.env`

### Stripe Error
- Verify API keys are correct
- Make sure you're using test keys (not live keys)

### Port Already in Use
- Backend: Change PORT in `server/.env`
- Frontend: Vite will automatically use next available port

## Test Cards

Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155

Any future expiry date, any 3-digit CVC

## Need Help?

Check the full README.md for detailed documentation.

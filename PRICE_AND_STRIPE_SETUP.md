# 🔧 HOW TO CHANGE PRICES & CONNECT REAL STRIPE

## PART 1: CHANGE PRODUCT PRICES FOR TESTING

### Step 1: Edit Product Prices

Open: `C:\chronolux-watches\src\data\products.ts`

**Find product entries and update prices as needed:**
```typescript
{
  id: 1,
  name: 'Minimal Jhumka Earrings',
  brand: 'INDÉRA',
  price: 299,  // ← CHANGE THIS
```

**Change prices to your test values:**
```typescript
{
  id: 1,
  name: 'Minimal Jhumka Earrings',
  brand: 'INDÉRA',
  price: 0.50,  // ← CHANGED
```

**Update all jewelry products with your desired test prices**

### Quick Replace Method:
1. Open `src\data\products.ts`
2. Press `Ctrl + H` (Find and Replace)
3. Replace each price with your test values

### Step 2: Adjust Shipping Threshold

Open: `C:\chronolux-watches\src\pages\Cart.tsx`

**Find (around line 50):**
```typescript
<span>{cartTotal > 500 ? 'FREE' : '$50'}</span>
```

**Change to:**
```typescript
<span>{cartTotal > 5 ? 'FREE' : '$0.50'}</span>
```

**Also find (around line 60):**
```typescript
${(cartTotal + (cartTotal > 500 ? 0 : 50) + cartTotal * 0.1).toFixed(2)}
```

**Change to:**
```typescript
${(cartTotal + (cartTotal > 5 ? 0 : 0.50) + cartTotal * 0.1).toFixed(2)}
```

### Step 3: Update Checkout Page

Open: `C:\chronolux-watches\src\pages\Checkout.tsx`

**Find (around line 35):**
```typescript
const shipping = subtotal > 500 ? 0 : 50;
```

**Change to:**
```typescript
const shipping = subtotal > 5 ? 0 : 0.50;
```

**Also find (around line 280):**
```typescript
<span>{cartTotal > 500 ? 'FREE' : '$50.00'}</span>
```

**Change to:**
```typescript
<span>{cartTotal > 5 ? 'FREE' : '$0.50'}</span>
```

**And find (around line 295):**
```typescript
const total = cartTotal + (cartTotal > 500 ? 0 : 50) + cartTotal * 0.1;
```

**Change to:**
```typescript
const total = cartTotal + (cartTotal > 5 ? 0 : 0.50) + cartTotal * 0.1;
```

---

## PART 2: CONNECT REAL STRIPE ACCOUNT

### Step 1: Create Stripe Account

1. Go to: **https://stripe.com**
2. Click "Sign up"
3. Enter your email and create password
4. Verify your email
5. Complete business information (can skip for testing)

### Step 2: Get Your API Keys

1. Log in to Stripe Dashboard
2. Click **"Developers"** in top menu
3. Click **"API keys"** in left sidebar
4. You'll see two keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`) - Click "Reveal test key"

### Step 3: Add Keys to Backend

Open: `C:\chronolux-watches\server\.env`

**Replace these lines:**
```env
STRIPE_SECRET_KEY=sk_test_51234567890
STRIPE_PUBLISHABLE_KEY=pk_test_51234567890
```

**With your real keys:**
```env
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY_HERE
```

### Step 4: Enable Real Stripe Payments

Open: `C:\chronolux-watches\src\pages\Checkout.tsx`

**Find this section (around line 90):**
```typescript
// For demo: simulate successful payment
const paymentIntent = {
  id: paymentResponse.paymentIntentId,
  status: 'succeeded',
};

// In production with real Stripe keys, use this:
/*
const { error, paymentIntent } = await stripe.confirmCardPayment(
```

**Change to:**
```typescript
// Real Stripe payment
const { error, paymentIntent } = await stripe.confirmCardPayment(
  paymentResponse.clientSecret,
  {
    payment_method: {
      card: cardElement,
      billing_details: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        address: {
          line1: formData.address,
          city: formData.city,
          postal_code: formData.zipCode,
          country: 'US',
        },
      },
    },
  }
);

if (error) {
  throw new Error(error.message);
}
```

**Delete the mock code and uncomment the real Stripe code**

### Step 5: Update Backend to Use Real Stripe

Open: `C:\chronolux-watches\server\package.json`

**Find:**
```json
"start": "node simple-server.js",
```

**Change to:**
```json
"start": "node index.js",
```

### Step 6: Install MongoDB (Required for Real Backend)

**Option A: Local MongoDB**
1. Download: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB starts automatically

**Option B: MongoDB Atlas (Cloud - Free)**
1. Go to: https://www.mongodb.com/cloud/atlas
2. Sign up for free
3. Create a free cluster
4. Click "Connect" → "Connect your application"
5. Copy connection string
6. Update `server\.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chronolux-watches
```

---

## PART 3: TEST WITH REAL STRIPE

### Step 1: Restart Servers

**Stop both servers** (Ctrl+C in both terminals)

**Restart Backend:**
```bash
cd C:\chronolux-watches\server
npm start
```

**Restart Frontend:**
```bash
cd C:\chronolux-watches
npm run dev
```

### Step 2: Test Payment

1. Go to: http://localhost:5173
2. Add product to cart (now $0.50)
3. Go to checkout
4. Fill in form
5. Use Stripe test card: **4242 4242 4242 4242**
6. Expiry: Any future date (12/25)
7. CVC: Any 3 digits (123)
8. Click "Pay"

### Step 3: Verify in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/test/payments
2. You should see your test payment!
3. Click on it to see details

---

## SUMMARY OF CHANGES

### For Test Prices:
✅ `src/data/products.ts` - Change all `price:` values to your test amounts
✅ `src/pages/Cart.tsx` - Adjust shipping thresholds if needed
✅ `src/pages/Checkout.tsx` - Adjust shipping thresholds if needed

### For Real Stripe:
✅ Get API keys from stripe.com
✅ Update `server/.env` with real keys
✅ Uncomment real Stripe code in `Checkout.tsx`
✅ Change `server/package.json` to use `index.js`
✅ Install MongoDB (local or Atlas)
✅ Restart both servers

---

## QUICK TEST CHECKLIST

- [ ] All jewelry products show correct test prices
- [ ] Shipping calculation works correctly
- [ ] Checkout page loads
- [ ] Can enter card details
- [ ] Payment processes successfully
- [ ] Order appears in admin dashboard
- [ ] Payment appears in Stripe dashboard

---

## STRIPE TEST CARDS

**Success:**
- 4242 4242 4242 4242

**Decline:**
- 4000 0000 0000 0002

**Requires Authentication:**
- 4000 0025 0000 3155

**Insufficient Funds:**
- 4000 0000 0000 9995

All cards: Any future expiry, any 3-digit CVC

---

## TROUBLESHOOTING

**"Payment failed"**
- Check Stripe keys in `server/.env`
- Make sure keys start with `sk_test_` and `pk_test_`
- Check browser console for errors

**"MongoDB connection error"**
- Install MongoDB or use Atlas
- Check connection string in `server/.env`

**Prices still showing old values**
- Clear browser cache (Ctrl+Shift+R)
- Restart frontend server

**Need Help?**
- Check Stripe logs: https://dashboard.stripe.com/test/logs
- Check browser console (F12)
- Check backend terminal for errors

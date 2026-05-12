# 🚀 QUICK START - INDÉRA

## ✅ READY TO RUN!

Everything is configured with $0.50 test prices!

---

## 🎯 START THE APPLICATION

### Open 2 Command Prompts:

**Command Prompt 1 (Backend):**
```bash
cd C:\chronolux-watches\server
npm start
```
Wait for: "🚀 INDÉRA Backend Server"

**Command Prompt 2 (Frontend):**
```bash
cd C:\chronolux-watches
npm run dev
```
Wait for: "Local: http://localhost:5173/"

---

## 🌐 OPEN IN BROWSER

**Main Website:**
http://localhost:5173

**Admin Dashboard:**
http://localhost:5173/admin

---

## 🛒 TEST THE CHECKOUT

1. Click "Shop Collection"
2. Click cart icon on any jewelry piece
3. Click cart icon in navbar (top right)
4. Click "Proceed to Checkout"
5. Fill in the form:
   - First Name: Test
   - Last Name: User
   - Email: test@test.com
   - Phone: 1234567890
   - Address: 123 Main St
   - City: New York
   - ZIP: 10001
   - Country: USA
6. Enter any card details (it's demo mode):
   - Card: 1234 5678 9012 3456
   - Expiry: 12/25
   - CVC: 123
7. Click "Pay" button
8. See order confirmation!

---

## 📊 VIEW YOUR ORDERS

Go to: http://localhost:5173/admin

You'll see:
- All orders
- Total revenue
- Order statistics
- Update order status

---

## 💰 CURRENT PRICES

- Products: **Test pricing**
- Shipping: **Calculated at checkout** (FREE if order > threshold)
- Tax: **10%** of subtotal

---

## 🔧 CHECKOUT NOT WORKING?

If checkout page shows error:

1. Make sure BOTH servers are running
2. Check backend shows: "Running in SIMPLE MODE"
3. Refresh browser (Ctrl + Shift + R)
4. Clear browser cache

---

## 📝 WHAT'S INCLUDED

✅ Premium Indo-European jewelry collection
✅ Shopping cart
✅ Wishlist
✅ Search & filters
✅ Dark/Light mode
✅ Checkout with payment
✅ Admin dashboard
✅ Order management
✅ Email notifications (optional)

---

## 🎨 FEATURES TO TRY

- Toggle dark mode (moon icon)
- Add to wishlist (heart icon)
- Search jewelry pieces
- Filter by collection
- View product details
- Mobile responsive (resize browser)

---

## 📚 MORE GUIDES

- **PRICE_AND_STRIPE_SETUP.md** - Connect real Stripe account
- **PROJECT_SUMMARY.md** - Complete project overview
- **ORDER_FLOW.md** - How orders work
- **server/README.md** - Backend documentation

---

## ❓ TROUBLESHOOTING

**"Cannot GET /checkout"**
- Restart frontend server
- Clear browser cache

**Backend not starting**
- Check you're in `server` folder
- Run `npm install` in server folder

**Port already in use**
- Close other programs
- Or change port in `.env`

**Prices still showing old values**
- Hard refresh: Ctrl + Shift + R
- Restart frontend

---

## 🎉 YOU'RE READY!

Your e-commerce platform is running with:
- ✅ Test pricing
- ✅ Demo payment (no real Stripe needed)
- ✅ No database needed (simple mode)
- ✅ Full order management

**Start testing now!** 🚀

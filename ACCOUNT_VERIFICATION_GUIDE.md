# Account Verification Guide - INDÉRA

## 🚨 Problem: WhatsApp Verification Not Working

The registration system requires WhatsApp verification via Twilio, which needs:
- Twilio account setup
- Phone number verification
- API credentials

## ✅ BEST SOLUTION: Disable Verification for Testing

### Option 1: Skip WhatsApp Verification (Recommended for Testing)

**Step 1:** Open `server\.env`

**Step 2:** Add this line at the bottom:
```env
REQUIRE_WHATSAPP_OTP=false
```

**Step 3:** Restart the backend server
```bash
cd server
npm start
```

**Step 4:** Now you can register without WhatsApp verification!
- Fill in registration form
- Account will be created immediately
- No verification code needed
- You'll be logged in automatically

---

## 🔧 Option 2: Use Development OTP (Shows Code in Response)

If you want to test the verification flow:

**Step 1:** Keep `REQUIRE_WHATSAPP_OTP=true` (or remove the line)

**Step 2:** Make sure `NODE_ENV=development` in `server\.env`

**Step 3:** Register an account

**Step 4:** Check the browser console (F12) or backend terminal

**Step 5:** You'll see the OTP code in the response:
```json
{
  "success": true,
  "phoneOtp": "123456",
  "message": "Account created..."
}
```

**Step 6:** Enter that code in the verification screen

---

## 📱 Option 3: Setup Real WhatsApp Verification (Production)

### A. Create Twilio Account

1. Go to: https://www.twilio.com/try-twilio
2. Sign up for free account
3. Verify your email and phone
4. Get $15 free credit

### B. Get WhatsApp Sandbox

1. In Twilio Console, go to: **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Follow instructions to join sandbox:
   - Send WhatsApp message to Twilio number
   - Message: "join [your-sandbox-code]"
3. Copy your sandbox number

### C. Get API Credentials

1. Go to: **Account** → **API keys & tokens**
2. Copy:
   - Account SID
   - Auth Token

### D. Update server\.env

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+14155238886
REQUIRE_WHATSAPP_OTP=true
```

### E. Test WhatsApp Verification

1. Register with your verified WhatsApp number
2. You'll receive OTP via WhatsApp
3. Enter code to complete registration

---

## 🎯 Quick Comparison

| Method | Setup Time | Cost | Best For |
|--------|-----------|------|----------|
| **Option 1: Disable** | 30 seconds | Free | Testing/Development |
| **Option 2: Dev OTP** | 0 seconds | Free | Testing verification flow |
| **Option 3: Real Twilio** | 10 minutes | Free trial | Production/Real users |

---

## 🔍 Troubleshooting

### "WhatsApp code could not be sent"
- **Solution:** Use Option 1 (disable verification)
- Or check Twilio credentials in `.env`

### "Invalid OTP"
- **Solution:** Use Option 2 to see the code in console
- Or disable verification with Option 1

### "Phone already verified"
- **Solution:** Account already created, just login

### Backend not starting
- Check MongoDB is running
- Check `.env` file has no syntax errors
- Restart: `cd server && npm start`

---

## 📋 Current Configuration

Your current setup in `server\.env`:
```env
REQUIRE_WHATSAPP_OTP=false  ← Verification DISABLED
```

This means:
✅ No WhatsApp verification needed
✅ Accounts created instantly
✅ Users logged in immediately after registration
✅ Perfect for testing

---

## 🚀 Recommended Setup for Development

```env
# server\.env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/indera-jewelry
REQUIRE_WHATSAPP_OTP=false  ← Add this line
```

Restart backend and try registering again!

---

## 💡 Tips

1. **For Testing:** Use Option 1 (disable verification)
2. **For Demo:** Use Option 2 (see OTP in console)
3. **For Production:** Use Option 3 (real Twilio)

4. **Test Account:**
   - Email: test@indera.com
   - Phone: +39 333 123 4567
   - Password: test1234

5. **After Registration:**
   - You'll be redirected to homepage
   - You'll see "Welcome to INDÉRA, [Name]!" toast
   - You can access account page at `/account`

---

## ✅ Verification Complete!

Once you've chosen an option and restarted the server:

1. Go to: http://localhost:5173/register
2. Fill in the form
3. Click "Create Account"
4. If Option 1: You're logged in immediately ✅
5. If Option 2/3: Enter the OTP code

**Need help?** Check the backend terminal for error messages.

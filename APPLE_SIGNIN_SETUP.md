# 🍎 Apple Sign-In Setup Guide for INDÉRA

## ✅ What's Been Implemented

- ✅ Apple Sign-In button added to Login/Register pages
- ✅ Backend Apple OAuth verification endpoint
- ✅ User model supports Apple ID
- ✅ Apple SDK loaded in HTML
- ✅ Frontend handles Apple authentication

---

## 🚀 Setup Apple Sign-In (30 Minutes)

### Prerequisites

You need:
- Apple Developer Account ($99/year)
- Domain: `indera.it` (you have this ✅)

---

### Step 1: Create Apple Developer Account

1. Go to: https://developer.apple.com
2. Click **Account**
3. Sign in with your Apple ID
4. Enroll in Apple Developer Program ($99/year)
5. Complete enrollment (takes 24-48 hours for approval)

---

### Step 2: Create App ID

1. Go to: https://developer.apple.com/account/resources/identifiers/list
2. Click **+** (plus button)
3. Select **App IDs** → Click **Continue**
4. Select **App** → Click **Continue**
5. Fill in:
   - **Description**: INDÉRA Jewelry
   - **Bundle ID**: `com.indera.jewelry` (Explicit)
6. Scroll down to **Capabilities**
7. Check **Sign in with Apple**
8. Click **Continue** → **Register**

---

### Step 3: Create Services ID

1. Go to: https://developer.apple.com/account/resources/identifiers/list/serviceId
2. Click **+** (plus button)
3. Select **Services IDs** → Click **Continue**
4. Fill in:
   - **Description**: INDÉRA Web
   - **Identifier**: `com.indera.jewelry.web`
5. Check **Sign in with Apple**
6. Click **Configure** next to Sign in with Apple

7. In the configuration popup:
   - **Primary App ID**: Select `com.indera.jewelry`
   - **Domains and Subdomains**: Add:
     ```
     indera.it
     localhost
     ```
   - **Return URLs**: Add:
     ```
     https://indera.it
     http://localhost:5173
     ```
8. Click **Save**
9. Click **Continue** → **Register**

---

### Step 4: Create Key for Sign in with Apple

1. Go to: https://developer.apple.com/account/resources/authkeys/list
2. Click **+** (plus button)
3. **Key Name**: INDÉRA Sign in with Apple Key
4. Check **Sign in with Apple**
5. Click **Configure** next to Sign in with Apple
6. Select **Primary App ID**: `com.indera.jewelry`
7. Click **Save**
8. Click **Continue** → **Register**
9. **IMPORTANT**: Click **Download** to download the `.p8` key file
   - ⚠️ You can only download this ONCE!
   - Save it securely
10. Note your **Key ID** (e.g., `ABC123DEFG`)

---

### Step 5: Get Your Team ID

1. Go to: https://developer.apple.com/account
2. Look at top right corner
3. Your **Team ID** is shown (e.g., `XYZ987TEAM`)
4. Copy it

---

### Step 6: Update HTML with Service ID

Edit `index.html`:
```html
<meta name="appleid-signin-client-id" content="com.indera.jewelry.web">
```

Replace `[YOUR_APPLE_SERVICE_ID]` with `com.indera.jewelry.web`

---

### Step 7: Update Environment Variables

**Local `.env`:**
```env
VITE_APPLE_CLIENT_ID=com.indera.jewelry.web
```

**Local `server/.env`:**
```env
APPLE_CLIENT_ID=com.indera.jewelry.web
APPLE_TEAM_ID=your_team_id_here
APPLE_KEY_ID=your_key_id_here
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
your_private_key_content_here
-----END PRIVATE KEY-----
```

**Vercel Environment Variables:**

Add these on Vercel Dashboard → Settings → Environment Variables:

```
VITE_APPLE_CLIENT_ID = com.indera.jewelry.web
APPLE_CLIENT_ID = com.indera.jewelry.web
APPLE_TEAM_ID = your_team_id
APPLE_KEY_ID = your_key_id
APPLE_PRIVATE_KEY = (paste entire .p8 file content)
```

---

### Step 8: Test Locally

1. Update `index.html` with Service ID
2. Restart servers:
   ```bash
   cd server && npm start
   npm run dev
   ```
3. Go to: http://localhost:5173/login
4. Click **"Continue with Apple"**
5. Sign in with Apple ID
6. Should work! ✅

---

### Step 9: Deploy to Production

```bash
git add .
git commit -m "Add Apple Sign-In support"
git push origin main
```

Wait for Vercel to deploy, then test on https://indera.it/login

---

## 🎨 What Users See

### Login/Register Pages:

```
┌─────────────────────────────────────┐
│           INDÉRA Logo               │
├─────────────────────────────────────┤
│                                     │
│  [G] Continue with Google           │
│  [🍎] Continue with Apple  ← NEW!   │
│                                     │
│  ────────────── OR ────────────     │
│                                     │
│  Email: ______________________      │
│  Password: ___________________      │
│  [Sign In]                          │
│                                     │
└─────────────────────────────────────┘
```

---

## ✅ Benefits of Apple Sign-In

**For Users:**
- ✅ One-click sign-in
- ✅ Privacy focused (can hide email)
- ✅ Secure (Face ID / Touch ID)
- ✅ No password needed
- ✅ Works on all Apple devices

**For You:**
- ✅ Higher conversion on iOS
- ✅ Trusted by Apple users
- ✅ Required for iOS apps
- ✅ Professional appearance

---

## 🔧 Troubleshooting

### "Invalid client" Error

**Check:**
- Service ID is correct: `com.indera.jewelry.web`
- Domain added: `indera.it`
- Return URL added: `https://indera.it`

### "Invalid redirect URI"

**Fix:**
- Go to Services ID configuration
- Add exact URL: `https://indera.it` (no trailing slash)
- Add localhost: `http://localhost:5173`

### Button doesn't work

**Check:**
- Apple SDK loaded in HTML
- Service ID in meta tag
- Browser console for errors (F12)

### "Sign in with Apple is not available"

**Reasons:**
- Apple Developer account not approved yet
- Services ID not configured
- Domain not verified

---

## 💰 Cost

- **Apple Developer Program**: $99/year
- **Sign in with Apple**: Free (included)

---

## 📋 Quick Checklist

- [ ] Apple Developer account ($99/year)
- [ ] Create App ID: `com.indera.jewelry`
- [ ] Create Services ID: `com.indera.jewelry.web`
- [ ] Add domain: `indera.it`
- [ ] Add return URLs
- [ ] Create and download Key (.p8 file)
- [ ] Note Team ID and Key ID
- [ ] Update `index.html` with Service ID
- [ ] Update local `.env` files
- [ ] Update Vercel environment variables
- [ ] Test locally
- [ ] Deploy to production
- [ ] Test on https://indera.it

---

## 🎯 Current Status

**Implemented:**
- ✅ Apple Sign-In button UI
- ✅ Backend verification endpoint
- ✅ Frontend integration
- ✅ User model supports Apple ID

**Needs Configuration:**
- ⏳ Apple Developer account
- ⏳ Services ID creation
- ⏳ Environment variables
- ⏳ Testing

---

## 🚀 Alternative: Skip Apple Sign-In

If you don't want to pay $99/year:

**Remove Apple button:**

Edit `src/components/OAuthButtons.tsx`:
```typescript
// Comment out Apple button section
{/* Apple Button */}
{/* <button ... Apple ... </button> */}
```

Users can still use:
- ✅ Google Sign-In (free)
- ✅ Email/Password (free)

---

## 📞 Need Help?

**Apple Developer Support:**
- https://developer.apple.com/support/

**Documentation:**
- https://developer.apple.com/sign-in-with-apple/

**Common Issues:**
- https://developer.apple.com/forums/tags/sign-in-with-apple

---

**Follow the steps above to enable Apple Sign-In!** 🍎

Or skip it and use Google + Email/Password authentication instead.

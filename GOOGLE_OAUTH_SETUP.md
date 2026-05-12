# ✅ Google OAuth Setup - Quick Guide

## 🎯 What's Been Done

I've implemented Google OAuth ("Sign in with Google") for your INDÉRA website!

### ✅ Installed:
- `@react-oauth/google` - Frontend Google OAuth
- `passport` & `passport-google-oauth20` - Backend OAuth

### ✅ Created:
- `src/components/OAuthButtons.tsx` - Google sign-in button
- `server/routes/oauthRoutes.js` - OAuth API endpoints
- Updated User model with `googleId` field
- Added OAuth buttons to Login & Register pages

---

## 🚀 How to Enable Google Sign-In

### Step 1: Get Google OAuth Credentials (5 minutes)

1. **Go to Google Cloud Console:**
   https://console.cloud.google.com

2. **Create a Project:**
   - Click "Select a project" → "New Project"
   - Name: "INDÉRA Jewelry"
   - Click "Create"

3. **Enable Google+ API:**
   - Go to "APIs & Services" → "Library"
   - Search "Google+ API"
   - Click "Enable"

4. **Create OAuth Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure OAuth consent screen:
     - User Type: External
     - App name: INDÉRA
     - User support email: your email
     - Developer contact: your email
     - Click "Save and Continue" (skip scopes)
     - Add test users if needed
     - Click "Save and Continue"
   
5. **Configure OAuth Client:**
   - Application type: **Web application**
   - Name: "INDÉRA Web"
   - Authorized JavaScript origins:
     ```
     http://localhost:5173
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:5173
     ```
   - Click "Create"

6. **Copy Your Credentials:**
   - You'll see a popup with:
     - Client ID: `123456789-abc.apps.googleusercontent.com`
     - Client Secret: `GOCSPX-xxxxxxxxxxxxx`
   - Keep this window open!

---

### Step 2: Add Credentials to Your Project

**Edit `.env` in root folder:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=paste_your_client_id_here
```

Replace `paste_your_client_id_here` with your actual Client ID from Google.

---

### Step 3: Restart Servers

**Stop both servers** (Ctrl+C in both terminals)

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

---

### Step 4: Test Google Sign-In

1. Go to: http://localhost:5173/register
2. You'll see **"Continue with Google"** button
3. Click it
4. Sign in with your Google account
5. You're logged in! ✅

---

## 🎨 What Users See

### Register Page:
```
┌─────────────────────────────────┐
│         INDÉRA Logo             │
├─────────────────────────────────┤
│                                 │
│  [G] Continue with Google       │
│                                 │
│  ────────── OR ──────────       │
│                                 │
│  First Name: ______________     │
│  Last Name: _______________     │
│  Email: ___________________     │
│  ...                            │
└─────────────────────────────────┘
```

### Login Page:
```
┌─────────────────────────────────┐
│         INDÉRA Logo             │
├─────────────────────────────────┤
│                                 │
│  [G] Continue with Google       │
│                                 │
│  ────────── OR ──────────       │
│                                 │
│  Email: ___________________     │
│  Password: ________________     │
│  [Sign In]                      │
└─────────────────────────────────┘
```

---

## ✅ Benefits

**For Users:**
- ✅ No password to remember
- ✅ One-click sign-in
- ✅ Instant account creation
- ✅ No verification needed
- ✅ Secure (Google handles security)

**For You:**
- ✅ No WhatsApp/SMS verification needed
- ✅ Higher conversion rates
- ✅ Verified emails automatically
- ✅ Less support tickets

---

## 🔧 How It Works

1. User clicks "Continue with Google"
2. Google popup opens
3. User signs in with Google
4. Google returns user info (name, email)
5. Backend creates account or logs in existing user
6. User is redirected to homepage
7. Done! ✅

**No verification needed** - Google already verified the user!

---

## 🐛 Troubleshooting

### "Google sign-in failed"
- Check `VITE_GOOGLE_CLIENT_ID` in `.env`
- Make sure you restarted frontend server
- Check browser console (F12) for errors

### "Redirect URI mismatch"
- Go to Google Cloud Console
- Check Authorized JavaScript origins: `http://localhost:5173`
- Check Authorized redirect URIs: `http://localhost:5173`

### Button not showing
- Check `.env` has `VITE_GOOGLE_CLIENT_ID`
- Restart frontend: `npm run dev`
- Clear browser cache (Ctrl+Shift+R)

### "Access blocked: This app's request is invalid"
- Configure OAuth consent screen in Google Cloud Console
- Add your email as test user
- Make sure app is in "Testing" mode

---

## 📝 Current Status

### ✅ Implemented:
- Google OAuth button on Register page
- Google OAuth button on Login page
- Backend OAuth verification
- User model with googleId field
- Automatic account creation

### ⏳ Needs Configuration:
- Google Client ID in `.env`
- Google Cloud Console setup

### 🔜 Optional (Future):
- Apple Sign-In (requires Apple Developer account)
- Facebook Login
- Microsoft Login

---

## 🎯 Quick Test (After Setup)

1. Add Google Client ID to `.env`
2. Restart servers
3. Go to http://localhost:5173/register
4. Click "Continue with Google"
5. Sign in with Google
6. Check: You're logged in and redirected to homepage!

---

## 💡 Tips

- **For Testing:** Use your personal Google account
- **For Production:** Keep OAuth consent screen in "Testing" mode until ready
- **For Multiple Domains:** Add production URL to authorized origins later

---

## 📞 Need Help?

1. Check Google Cloud Console credentials
2. Verify `.env` file has correct Client ID
3. Check browser console (F12) for errors
4. Check backend terminal for errors

---

**Ready to enable Google Sign-In?** Follow Step 1 above! 🚀

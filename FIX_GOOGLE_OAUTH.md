# ✅ Fix Google OAuth Error - Step by Step

## 🎯 The Problem

Your Google OAuth Client ID is not working because it needs to be reconfigured for your domain.

---

## 🚀 SOLUTION (10 Minutes)

### Step 1: Go to Google Cloud Console

Open: https://console.cloud.google.com/apis/credentials?project=complete-trees-496121-h2

### Step 2: Check Your OAuth Client

Look for your existing OAuth 2.0 Client ID in the list.

**If you see it:**
- Click on the client name to edit it
- Go to Step 3

**If you DON'T see it:**
- Click **+ CREATE CREDENTIALS**
- Select **OAuth client ID**
- Go to Step 3

### Step 3: Configure OAuth Consent Screen (If Needed)

If prompted to configure consent screen:

1. Click **CONFIGURE CONSENT SCREEN**
2. User Type: **External** → Click **CREATE**
3. Fill in:
   - App name: **INDÉRA**
   - User support email: **murtazarangwala0@gmail.com**
   - App logo: (optional)
   - App domain: **https://indera.it**
   - Developer contact: **murtazarangwala0@gmail.com**
4. Click **SAVE AND CONTINUE**
5. Scopes: Click **SAVE AND CONTINUE** (skip)
6. Test users: Add **murtazarangwala0@gmail.com**
7. Click **SAVE AND CONTINUE**
8. Click **BACK TO DASHBOARD**

### Step 4: Create/Edit OAuth Client

1. Application type: **Web application**
2. Name: **INDÉRA Production**

3. **Authorized JavaScript origins** - Add both:
   ```
   http://localhost:5173
   https://indera.it
   ```

4. **Authorized redirect URIs** - Add both:
   ```
   http://localhost:5173
   https://indera.it
   ```

5. Click **CREATE** or **SAVE**

### Step 5: Copy Your Credentials

You'll see a popup with:
- **Client ID**: `123456789-xxxxxxx.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-xxxxxxxxxxxxxxx`

**IMPORTANT:** Copy both and save them!

### Step 6: Update Vercel Environment Variables

1. Go to: https://vercel.com/dashboard
2. Click your **INDERA** project
3. Click **Settings** → **Environment Variables**

4. **Update or Add** these variables:

**VITE_GOOGLE_CLIENT_ID**
- Value: (paste your new Client ID)
- Environment: Production, Preview, Development

**GOOGLE_CLIENT_ID**
- Value: (paste your new Client ID)
- Environment: Production, Preview, Development

**GOOGLE_CLIENT_SECRET**
- Value: (paste your new Client Secret)
- Environment: Production, Preview, Development

5. Click **Save** for each

### Step 7: Redeploy on Vercel

**Option A:** From Vercel Dashboard
1. Go to **Deployments** tab
2. Click **⋯** on latest deployment
3. Click **Redeploy**

**Option B:** Trigger from Git
```bash
git commit --allow-empty -m "Trigger redeploy with new OAuth"
git push origin main
```

### Step 8: Wait for Deployment

- Takes 2-3 minutes
- Watch deployment status on Vercel

### Step 9: Test

1. Go to: https://indera.it/login
2. Click **"Continue with Google"**
3. Sign in with your Google account
4. Should work! ✅

---

## 🔧 Update Local Environment Too

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_new_client_id_here
```

Edit `server/.env`:
```env
GOOGLE_CLIENT_ID=your_new_client_id_here
GOOGLE_CLIENT_SECRET=your_new_client_secret_here
```

Restart local servers:
```bash
# Terminal 1
cd server
npm start

# Terminal 2
npm run dev
```

---

## 📋 Quick Checklist

- [ ] Go to Google Cloud Console
- [ ] Configure OAuth consent screen (if needed)
- [ ] Create/edit OAuth client
- [ ] Add `https://indera.it` to authorized origins
- [ ] Add `https://indera.it` to redirect URIs
- [ ] Copy Client ID and Secret
- [ ] Update Vercel environment variables
- [ ] Redeploy on Vercel
- [ ] Test on https://indera.it/login
- [ ] Update local `.env` files
- [ ] Test locally

---

## 🎯 Important Notes

1. **Use the SAME Google account** that owns the project
2. **Add BOTH localhost AND production URLs** to OAuth settings
3. **Wait for Vercel to finish deploying** before testing
4. **Clear browser cache** if still seeing old error

---

## 🐛 Still Not Working?

**Check these:**

1. **Correct Project?**
   - Make sure you're in project: `complete-trees-496121-h2`

2. **Correct URLs?**
   - JavaScript origins: `https://indera.it` (no trailing slash)
   - Redirect URIs: `https://indera.it` (no trailing slash)

3. **Environment Variables Set?**
   - Check Vercel Settings → Environment Variables
   - Make sure all 3 environments selected (Production, Preview, Development)

4. **Deployment Finished?**
   - Check Vercel Deployments tab
   - Status should be "Ready"

5. **Browser Cache?**
   - Clear cache or try incognito mode
   - Hard refresh: Ctrl+Shift+R

---

## ✅ After This Works

Your users can:
- ✅ Sign in with Google (one click)
- ✅ Sign in with email/password
- ✅ No verification needed (WhatsApp disabled)
- ✅ Works on both localhost and production

---

**Follow the steps above and your Google OAuth will work!** 🚀

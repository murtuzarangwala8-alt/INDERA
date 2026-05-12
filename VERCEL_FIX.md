# 🚨 FIX: Blank Login Page on https://indera.it

## ❌ Problem

Your login page is blank because:
1. Frontend is trying to connect to `http://localhost:5000/api` (doesn't exist on production)
2. Google OAuth not configured for production domain
3. Environment variables not set on Vercel

---

## ✅ SOLUTION: Configure Vercel Environment Variables

### Step 1: Go to Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Click on your **INDERA** project
3. Click **Settings** tab
4. Click **Environment Variables** (left sidebar)

### Step 2: Add Environment Variables

Add these variables:

**VITE_API_URL**
```
Value: https://indera.it/api
Environment: Production, Preview, Development
```

**VITE_GOOGLE_CLIENT_ID**
```
Value: your_google_client_id_here
Environment: Production, Preview, Development
```

**NODE_ENV**
```
Value: production
Environment: Production
```

**MONGODB_URI**
```
Value: your_mongodb_atlas_connection_string
Environment: Production, Preview, Development
```

**JWT_SECRET**
```
Value: indera-jwt-super-secret-change-in-production
Environment: Production, Preview, Development
```

**REQUIRE_WHATSAPP_OTP**
```
Value: false
Environment: Production, Preview, Development
```

**GOOGLE_CLIENT_ID**
```
Value: your_google_client_id_here
Environment: Production, Preview, Development
```

**GOOGLE_CLIENT_SECRET**
```
Value: your_google_client_secret_here
Environment: Production, Preview, Development
```

**FRONTEND_URL**
```
Value: https://indera.it
Environment: Production
```

**STRIPE_SECRET_KEY** (if using real Stripe)
```
Value: your_stripe_secret_key
Environment: Production
```

**STRIPE_PUBLISHABLE_KEY** (if using real Stripe)
```
Value: your_stripe_publishable_key
Environment: Production
```

### Step 3: Update Google OAuth Settings

1. Go to: https://console.cloud.google.com/apis/credentials?project=complete-trees-496121-h2
2. Click on your OAuth 2.0 Client ID
3. Add to **Authorized JavaScript origins:**
   ```
   https://indera.it
   ```
4. Add to **Authorized redirect URIs:**
   ```
   https://indera.it
   https://indera.it/auth/google/callback
   ```
5. Click **SAVE**

### Step 4: Redeploy on Vercel

**Option A: From Dashboard**
1. Go to Vercel Dashboard → Your Project
2. Click **Deployments** tab
3. Click **⋯** (three dots) on latest deployment
4. Click **Redeploy**
5. Check "Use existing Build Cache"
6. Click **Redeploy**

**Option B: Push to Git**
```bash
git commit --allow-empty -m "Trigger Vercel redeploy"
git push origin main
```

### Step 5: Wait for Deployment

- Vercel will rebuild with new environment variables
- Takes 2-3 minutes
- Check deployment status on Vercel dashboard

### Step 6: Test

1. Go to: https://indera.it/login
2. Page should load properly ✅
3. Google OAuth button should work ✅

---

## 🔧 Alternative: Use Environment Variable File

Create `.env.production`:

```env
VITE_API_URL=https://indera.it/api
VITE_GOOGLE_CLIENT_ID=770014727875-1l383uqq1jc5s99ihq1kqdfi367pbeif.apps.googleusercontent.com
```

Then commit and push:
```bash
git add .env.production
git commit -m "Add production environment variables"
git push origin main
```

---

## 🐛 Troubleshooting

### Still Blank After Redeploy?

**Check Browser Console (F12):**
- Look for errors
- Check Network tab for failed requests

**Common Issues:**

1. **CORS Error**
   - Add `https://indera.it` to backend CORS origins
   - Check `server/app.js` has `origin: true`

2. **API Not Found**
   - Verify `VITE_API_URL=https://indera.it/api`
   - Check `/api` routes work: https://indera.it/api/health

3. **Google OAuth Error**
   - Verify domain added to Google Console
   - Check Client ID is correct

### Check API Health

Visit: https://indera.it/api/health

Should return:
```json
{
  "success": true,
  "message": "INDÉRA API is running"
}
```

If 404, backend not deployed properly.

---

## 📋 Vercel Deployment Checklist

- [ ] Environment variables added on Vercel
- [ ] Google OAuth updated with production domain
- [ ] MongoDB Atlas connection string configured
- [ ] Redeployed on Vercel
- [ ] Tested https://indera.it/login
- [ ] Tested https://indera.it/api/health
- [ ] Google sign-in works

---

## 🚀 Quick Fix Commands

```bash
# 1. Create production env file
echo VITE_API_URL=https://indera.it/api > .env.production
echo VITE_GOOGLE_CLIENT_ID=your_google_client_id >> .env.production

# 2. Commit and push
git add .env.production
git commit -m "Add production environment config"
git push origin main

# 3. Wait for Vercel to redeploy (2-3 minutes)
```

---

## 📞 If Still Not Working

1. Check Vercel deployment logs
2. Check browser console errors (F12)
3. Verify all environment variables are set
4. Check Google OAuth settings
5. Try clearing browser cache

---

**After following these steps, https://indera.it/login should work!** ✅

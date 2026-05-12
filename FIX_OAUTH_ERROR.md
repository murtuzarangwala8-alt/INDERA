# 🚨 FIX: Google OAuth Error 401 - invalid_client

## ❌ Error Message

```
Access blocked: Authorization Error
Error 401: invalid_client
The OAuth client was not found.
```

---

## 🎯 SOLUTION: Reconfigure Google OAuth

### Option 1: Quick Fix - Disable Google OAuth Temporarily

**Step 1: Remove OAuth Button from Login/Register**

Edit `src/pages/Login.tsx`:
```typescript
// Comment out this line:
// <OAuthButtons />
```

Edit `src/pages/Register.tsx`:
```typescript
// Comment out this line:
// <OAuthButtons />
```

**Step 2: Push to Git**
```bash
git add .
git commit -m "Temporarily disable Google OAuth"
git push origin main
```

**Step 3: Wait for Vercel to Redeploy**

Your login page will work without Google OAuth.

---

### Option 2: Fix Google OAuth (Recommended)

The issue is your Google OAuth credentials are for `https://indera.it` but the Client ID might be wrong or deleted.

**Step 1: Create New OAuth Credentials**

1. Go to: https://console.cloud.google.com/apis/credentials?project=complete-trees-496121-h2

2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**

3. If prompted, configure consent screen:
   - Click **CONFIGURE CONSENT SCREEN**
   - User Type: **External**
   - App name: **INDÉRA**
   - User support email: **murtazarangwala0@gmail.com**
   - Developer contact: **murtazarangwala0@gmail.com**
   - Click **SAVE AND CONTINUE**
   - Skip Scopes → Click **SAVE AND CONTINUE**
   - Add test users: **murtazarangwala0@gmail.com**
   - Click **SAVE AND CONTINUE**
   - Click **BACK TO DASHBOARD**

4. Now create OAuth Client:
   - Click **+ CREATE CREDENTIALS** → **OAuth client ID**
   - Application type: **Web application**
   - Name: **INDÉRA Web Client**
   
5. Add **Authorized JavaScript origins:**
   ```
   http://localhost:5173
   https://indera.it
   ```

6. Add **Authorized redirect URIs:**
   ```
   http://localhost:5173
   https://indera.it
   ```

7. Click **CREATE**

8. **COPY YOUR NEW CREDENTIALS:**
   - Client ID: `123456789-abc.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-xxxxxxxxxxxxx`

**Step 2: Update Local Environment**

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=paste_your_new_client_id_here
```

Edit `server/.env`:
```env
GOOGLE_CLIENT_ID=paste_your_new_client_id_here
GOOGLE_CLIENT_SECRET=paste_your_new_client_secret_here
```

**Step 3: Update Vercel Environment Variables**

1. Go to: https://vercel.com/dashboard
2. Click your **INDERA** project
3. Go to **Settings** → **Environment Variables**
4. Update or add:

```
VITE_GOOGLE_CLIENT_ID = your_new_client_id
GOOGLE_CLIENT_ID = your_new_client_id
GOOGLE_CLIENT_SECRET = your_new_client_secret
```

**Step 4: Redeploy**

```bash
git commit --allow-empty -m "Update OAuth config"
git push origin main
```

Or click **Redeploy** on Vercel dashboard.

**Step 5: Test**

1. Go to: https://indera.it/login
2. Click "Continue with Google"
3. Should work now! ✅

---

### Option 3: Use Existing OAuth Client (If Available)

**Step 1: Check Existing Clients**

1. Go to: https://console.cloud.google.com/apis/credentials?project=complete-trees-496121-h2
2. Look for existing OAuth 2.0 Client IDs
3. Click on one to edit

**Step 2: Update Authorized Origins**

Make sure these are added:
```
http://localhost:5173
https://indera.it
```

**Step 3: Update Authorized Redirect URIs**

Make sure these are added:
```
http://localhost:5173
https://indera.it
```

**Step 4: Copy Client ID**

Use this Client ID in your `.env` files and Vercel.

---

## 🔧 Alternative: Remove Google OAuth Completely

If you don't want Google OAuth, remove it:

**Step 1: Remove OAuth Button Component**

Delete or comment out in `src/pages/Login.tsx`:
```typescript
// import { OAuthButtons } from '../components/OAuthButtons';
// <OAuthButtons />
```

Delete or comment out in `src/pages/Register.tsx`:
```typescript
// import { OAuthButtons } from '../components/OAuthButtons';
// <OAuthButtons />
```

**Step 2: Push Changes**
```bash
git add .
git commit -m "Remove Google OAuth"
git push origin main
```

Users can still register with email/password (no verification needed since `REQUIRE_WHATSAPP_OTP=false`).

---

## 📋 Checklist

**To Fix Google OAuth:**
- [ ] Create new OAuth credentials in Google Console
- [ ] Add `https://indera.it` to authorized origins
- [ ] Add `https://indera.it` to redirect URIs
- [ ] Copy new Client ID and Secret
- [ ] Update `.env` locally
- [ ] Update `server/.env` locally
- [ ] Update Vercel environment variables
- [ ] Redeploy on Vercel
- [ ] Test on https://indera.it/login

**To Disable Google OAuth:**
- [ ] Comment out `<OAuthButtons />` in Login.tsx
- [ ] Comment out `<OAuthButtons />` in Register.tsx
- [ ] Push to Git
- [ ] Wait for Vercel redeploy

---

## 🎯 Recommended Action

**For Now:** Disable Google OAuth (Option 1)
- Fastest fix
- Login page works immediately
- Users can register with email/password

**For Later:** Fix Google OAuth (Option 2)
- Better user experience
- One-click sign-in
- No password needed

---

## 🐛 Why This Happened

The OAuth Client ID `770014727875-1l383uqq1jc5s99ihq1kqdfi367pbeif.apps.googleusercontent.com` either:
1. Was deleted from Google Console
2. Belongs to different Google account
3. Not configured for `https://indera.it` domain
4. Project was deleted or changed

---

## ✅ Quick Fix Right Now

**Disable Google OAuth temporarily:**

1. Edit `src/pages/Login.tsx` - comment out `<OAuthButtons />`
2. Edit `src/pages/Register.tsx` - comment out `<OAuthButtons />`
3. Push to Git
4. Login page works! ✅

**Then later, create new OAuth credentials when you have time.**

---

**Choose Option 1 for immediate fix, or Option 2 for proper OAuth setup!** 🚀

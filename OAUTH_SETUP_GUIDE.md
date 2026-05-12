# Google & Apple OAuth Authentication Setup

## 🎯 Overview

Add "Sign in with Google" and "Sign in with Apple" buttons to your registration/login pages.

**Benefits:**
- ✅ No password needed
- ✅ Instant verification (Google/Apple verifies the user)
- ✅ One-click registration
- ✅ More secure
- ✅ Better user experience

---

## 🚀 QUICK SETUP (Recommended)

I'll implement both Google and Apple OAuth for you.

### What You'll Get:
1. **"Continue with Google"** button on Register/Login pages
2. **"Continue with Apple"** button on Register/Login pages
3. Automatic account creation
4. No password or verification needed
5. User info (name, email) from Google/Apple

---

## 📋 Setup Requirements

### For Google OAuth:

**Step 1:** Go to [Google Cloud Console](https://console.cloud.google.com)

**Step 2:** Create a new project (or select existing)

**Step 3:** Enable Google+ API:
- Go to **APIs & Services** → **Library**
- Search "Google+ API"
- Click **Enable**

**Step 4:** Create OAuth credentials:
- Go to **APIs & Services** → **Credentials**
- Click **Create Credentials** → **OAuth client ID**
- Application type: **Web application**
- Name: "INDÉRA Jewelry"
- Authorized JavaScript origins:
  ```
  http://localhost:5173
  https://yourdomain.com
  ```
- Authorized redirect URIs:
  ```
  http://localhost:5173/auth/google/callback
  https://yourdomain.com/auth/google/callback
  ```
- Click **Create**

**Step 5:** Copy your credentials:
- Client ID: `123456789-abc.apps.googleusercontent.com`
- Client Secret: `GOCSPX-xxxxxxxxxxxxx`

---

### For Apple OAuth:

**Step 1:** Go to [Apple Developer](https://developer.apple.com)

**Step 2:** Sign in with Apple ID

**Step 3:** Go to **Certificates, Identifiers & Profiles**

**Step 4:** Create App ID:
- Click **Identifiers** → **+**
- Select **App IDs** → **Continue**
- Description: "INDÉRA Jewelry"
- Bundle ID: `com.indera.jewelry`
- Enable **Sign in with Apple**
- Click **Continue** → **Register**

**Step 5:** Create Service ID:
- Click **Identifiers** → **+**
- Select **Services IDs** → **Continue**
- Description: "INDÉRA Web"
- Identifier: `com.indera.jewelry.web`
- Enable **Sign in with Apple**
- Click **Configure**
- Domains and Subdomains:
  ```
  localhost
  yourdomain.com
  ```
- Return URLs:
  ```
  http://localhost:5173/auth/apple/callback
  https://yourdomain.com/auth/apple/callback
  ```
- Click **Save** → **Continue** → **Register**

**Step 6:** Create Key:
- Click **Keys** → **+**
- Key Name: "INDÉRA Sign in with Apple Key"
- Enable **Sign in with Apple**
- Click **Configure** → Select your App ID
- Click **Save** → **Continue** → **Register**
- **Download the key file** (you can only download once!)
- Note the Key ID

**Step 7:** Copy your credentials:
- Team ID: Found in top right of Apple Developer page
- Service ID: `com.indera.jewelry.web`
- Key ID: From step 6
- Private Key: Contents of downloaded `.p8` file

---

## 💻 Implementation

### Backend Setup

**Step 1:** Install OAuth packages:
```bash
cd server
npm install passport passport-google-oauth20 passport-apple
```

**Step 2:** Add to `server\.env`:
```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5173/auth/google/callback

# Apple OAuth
APPLE_CLIENT_ID=com.indera.jewelry.web
APPLE_TEAM_ID=your_team_id_here
APPLE_KEY_ID=your_key_id_here
APPLE_PRIVATE_KEY_PATH=./apple-key.p8
APPLE_CALLBACK_URL=http://localhost:5173/auth/apple/callback
```

**Step 3:** Create `server/config/passport.js`:
```javascript
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as AppleStrategy } from 'passport-apple';
import User from '../models/User.js';
import fs from 'fs';

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      let user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        // User exists, update Google ID if needed
        if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }
        return done(null, user);
      }
      
      // Create new user
      user = new User({
        googleId: profile.id,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        email: profile.emails[0].value,
        emailVerified: true,
        phoneVerified: true, // Skip phone verification for OAuth
        phone: '', // Optional
        password: Math.random().toString(36), // Random password (won't be used)
      });
      
      await user.save();
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
));

// Apple OAuth Strategy
passport.use(new AppleStrategy({
    clientID: process.env.APPLE_CLIENT_ID,
    teamID: process.env.APPLE_TEAM_ID,
    keyID: process.env.APPLE_KEY_ID,
    privateKeyString: fs.readFileSync(process.env.APPLE_PRIVATE_KEY_PATH, 'utf8'),
    callbackURL: process.env.APPLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, idToken, profile, done) => {
    try {
      const email = profile.email;
      let user = await User.findOne({ email });
      
      if (user) {
        if (!user.appleId) {
          user.appleId = profile.sub;
          await user.save();
        }
        return done(null, user);
      }
      
      // Apple provides name only on first sign-in
      const firstName = profile.name?.firstName || 'User';
      const lastName = profile.name?.lastName || '';
      
      user = new User({
        appleId: profile.sub,
        firstName,
        lastName,
        email,
        emailVerified: true,
        phoneVerified: true,
        phone: '',
        password: Math.random().toString(36),
      });
      
      await user.save();
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
));

export default passport;
```

**Step 4:** Update `server/models/User.js` to add OAuth fields:
```javascript
// Add these fields to the User schema
googleId: { type: String, unique: true, sparse: true },
appleId: { type: String, unique: true, sparse: true },
```

**Step 5:** Create `server/routes/oauthRoutes.js`:
```javascript
import express from 'express';
import passport from '../config/passport.js';
import { generateToken } from '../utils/auth.js';

const router = express.Router();

// Google OAuth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
}));

router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const token = generateToken(req.user._id, req.user.role);
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
  }
);

// Apple OAuth
router.get('/apple', passport.authenticate('apple', { session: false }));

router.post('/apple/callback',
  passport.authenticate('apple', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const token = generateToken(req.user._id, req.user.role);
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
  }
);

export default router;
```

**Step 6:** Update `server/app.js` or `server/index.js`:
```javascript
import passport from './config/passport.js';
import oauthRoutes from './routes/oauthRoutes.js';

// Add after other middleware
app.use(passport.initialize());

// Add routes
app.use('/api/auth/oauth', oauthRoutes);
```

---

### Frontend Setup

**Step 1:** Install Google OAuth package:
```bash
npm install @react-oauth/google jwt-decode
```

**Step 2:** Update `src/main.tsx`:
```typescript
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your_client_id';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientID={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <ThemeProvider>
              <App />
            </ThemeProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
```

**Step 3:** Create `.env` in root:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_API_URL=http://localhost:5000/api
```

**Step 4:** Create `src/components/OAuthButtons.tsx`:
```typescript
import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '/api';

export const OAuthButtons: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (tokenResponse: any) => {
    try {
      // Send token to backend
      const res = await fetch(`${API}/auth/oauth/google/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenResponse.access_token }),
      });
      
      const data = await res.json();
      
      if (data.success && data.token) {
        localStorage.setItem('indera_token', data.token);
        toast.success(`Welcome, ${data.user.firstName}!`);
        navigate('/');
      } else {
        toast.error(data.message || 'Google sign-in failed');
      }
    } catch (error) {
      toast.error('Google sign-in failed');
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error('Google sign-in cancelled'),
  });

  const handleAppleLogin = () => {
    // Redirect to Apple OAuth
    window.location.href = `${API}/auth/oauth/apple`;
  };

  return (
    <div className="space-y-3">
      {/* Google Button */}
      <button
        onClick={() => googleLogin()}
        className="w-full bg-white text-obsidian border border-ivory/20 px-4 py-3 flex items-center justify-center gap-3 hover:bg-ivory/5 transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
          <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
        </svg>
        <span className="font-sans text-sm">Continue with Google</span>
      </button>

      {/* Apple Button */}
      <button
        onClick={handleAppleLogin}
        className="w-full bg-obsidian text-ivory border border-ivory/20 px-4 py-3 flex items-center justify-center gap-3 hover:bg-charcoal transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
          <path d="M14.94 5.19A4.38 4.38 0 0 0 13 6.5a4.44 4.44 0 0 1 1.06 3.24 4.5 4.5 0 0 1-2.73 4.09 6.23 6.23 0 0 1-1.17 2.42c-.56.75-1.14 1.5-2.05 1.51s-1.21-.48-2.26-.48-1.38.47-2.25.49-1.42-.7-2-1.47a13.79 13.79 0 0 1-2.66-7.58A6 6 0 0 1 0 5.82a4.07 4.07 0 0 1 3.47-2.07c.91 0 1.67.3 2.22.3s1.39-.31 2.35-.31a3.89 3.89 0 0 1 3.27 1.69 4 4 0 0 0-1.93 3.36 4.1 4.1 0 0 0 2.46 3.74 9.06 9.06 0 0 1-.9 1.86zM12.05 2.5a4.33 4.33 0 0 1-1 2.8 3.61 3.61 0 0 1-2.9 1.37 4.18 4.18 0 0 1 1-2.71 4.46 4.46 0 0 1 2.9-1.46z"/>
        </svg>
        <span className="font-sans text-sm">Continue with Apple</span>
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-ivory/10"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-obsidian px-2 text-ivory/30 font-sans">OR</span>
        </div>
      </div>
    </div>
  );
};
```

**Step 5:** Update `src/pages/Register.tsx` and `src/pages/Login.tsx`:

Add at the top of the form (after the title):
```typescript
import { OAuthButtons } from '../components/OAuthButtons';

// Inside the form, before email input:
<OAuthButtons />
```

---

## 🎨 UI Preview

Your login/register pages will look like:

```
┌─────────────────────────────────┐
│         INDÉRA Logo             │
├─────────────────────────────────┤
│                                 │
│  [G] Continue with Google       │
│  [🍎] Continue with Apple       │
│                                 │
│  ────────── OR ──────────       │
│                                 │
│  Email: ___________________     │
│  Password: ________________     │
│  [Sign In]                      │
│                                 │
└─────────────────────────────────┘
```

---

## ✅ Benefits

**For Users:**
- ✅ No password to remember
- ✅ One-click sign-in
- ✅ Secure (Google/Apple handles security)
- ✅ Faster registration

**For You:**
- ✅ No verification system needed
- ✅ Higher conversion rates
- ✅ Less support tickets
- ✅ Verified email automatically

---

## 🚀 Quick Start (Simplified)

**Want me to implement this for you?**

Just provide:
1. Google Client ID (from Google Cloud Console)
2. Google Client Secret

I'll add the OAuth buttons to your login/register pages!

For Apple, it's more complex (requires developer account), so start with Google first.

---

## 📝 Summary

| Method | Setup Time | User Experience | Verification |
|--------|-----------|-----------------|--------------|
| **Google OAuth** | 10 min | ⭐⭐⭐⭐⭐ | Automatic |
| **Apple OAuth** | 20 min | ⭐⭐⭐⭐⭐ | Automatic |
| **Email/Password** | 0 min | ⭐⭐⭐ | Manual/WhatsApp |

**Recommendation:** Implement Google OAuth first (easiest), then add Apple later.

Would you like me to implement Google OAuth for you now?

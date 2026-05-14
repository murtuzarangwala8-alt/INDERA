import express from 'express';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { generateToken } from '../utils/auth.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function findOrCreateGoogleUser({ googleId, email, firstName, lastName }) {
  let user = await User.findOne({ email: email.toLowerCase() });

  if (user) {
    // Link Google ID if not already linked, and update lastLogin atomically
    await User.updateOne(
      { _id: user._id },
      {
        ...(user.googleId ? {} : { googleId }),
        lastLogin: new Date(),
      }
    );
    // Re-fetch to get the updated doc
    user = await User.findById(user._id);
  } else {
    // New Google user — generate a strong random password (always ≥24 chars)
    const randomPassword = crypto.randomBytes(16).toString('hex');
    user = await User.create({
      googleId,
      firstName: firstName || 'User',
      lastName: lastName || 'User',
      email: email.toLowerCase(),
      emailVerified: true,
      phoneVerified: true,
      phone: '',
      password: randomPassword,
      lastLogin: new Date(),
    });
  }

  return user;
}

// Google OAuth button flow (access_token → userinfo)
router.post('/google/verify', async (req, res) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error('[Google OAuth] GOOGLE_CLIENT_ID is not set in environment');
      return res.status(500).json({ success: false, message: 'Google OAuth is not configured on this server.' });
    }

    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Token is required' });

    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[Google OAuth] Userinfo error:', response.status, errText);
      return res.status(401).json({ success: false, message: 'Invalid Google token. Please try signing in again.' });
    }

    const googleUser = await response.json();
    if (!googleUser.email) {
      return res.status(400).json({ success: false, message: 'Could not get email from Google' });
    }

    const user = await findOrCreateGoogleUser({
      googleId: googleUser.sub,
      email: googleUser.email,
      firstName: googleUser.given_name,
      lastName: googleUser.family_name,
    });

    res.json({
      success: true,
      token: generateToken(user._id, user.role),
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error('[Google OAuth] Unhandled error:', error.message, error.stack);
    res.status(500).json({ success: false, message: `Google authentication failed: ${error.message}` });
  }
});

// Google One Tap flow (credential JWT → verify with google-auth-library)
router.post('/google/verify-token', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ success: false, message: 'Credential is required' });

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      return res.status(400).json({ success: false, message: 'Invalid Google credential' });
    }

    const user = await findOrCreateGoogleUser({
      googleId: payload.sub,
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
    });

    res.json({
      success: true,
      token: generateToken(user._id, user.role),
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error('Google One Tap error:', error);
    res.status(500).json({ success: false, message: `Google authentication failed: ${error.message}` });
  }
});

export default router;

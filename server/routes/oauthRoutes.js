import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { generateToken } from '../utils/auth.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function findOrCreateGoogleUser({ googleId, email, firstName, lastName }) {
  let user = await User.findOne({ email: email.toLowerCase() });

  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }
  } else {
    user = new User({
      googleId,
      firstName: firstName || 'User',
      lastName: lastName || '',
      email: email.toLowerCase(),
      emailVerified: true,
      phoneVerified: true,
      phone: '',
      password: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
    });
    await user.save();
  }

  user.lastLogin = new Date();
  await user.save();
  return user;
}

// Google OAuth button flow (access_token → userinfo)
router.post('/google/verify', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Token is required' });

    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      return res.status(401).json({ success: false, message: 'Invalid Google token' });
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
    console.error('Google OAuth error:', error);
    res.status(500).json({ success: false, message: 'Google authentication failed' });
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
    res.status(500).json({ success: false, message: 'Google authentication failed' });
  }
});

export default router;

import express from 'express';
import User from '../models/User.js';
import { generateToken } from '../utils/auth.js';

const router = express.Router();

// Google OAuth verification endpoint
router.post('/google/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required' });
    }

    // Verify Google token
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
    const googleUser = await response.json();

    if (!googleUser.email) {
      return res.status(400).json({ success: false, message: 'Failed to get user info from Google' });
    }

    // Check if user exists
    let user = await User.findOne({ email: googleUser.email.toLowerCase() });

    if (user) {
      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleUser.sub;
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        googleId: googleUser.sub,
        firstName: googleUser.given_name || 'User',
        lastName: googleUser.family_name || '',
        email: googleUser.email.toLowerCase(),
        emailVerified: true,
        phoneVerified: true, // Skip phone verification for OAuth users
        phone: '', // Optional
        password: Math.random().toString(36).substring(2), // Random password (won't be used)
      });

      await user.save();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const jwtToken = generateToken(user._id, user.role);

    res.json({
      success: true,
      token: jwtToken,
      user: user.toSafeObject(),
      message: `Welcome${user.firstName ? ', ' + user.firstName : ''}!`,
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ success: false, message: 'Google authentication failed' });
  }
});

// Apple OAuth verification endpoint
router.post('/apple/verify', async (req, res) => {
  try {
    const { identityToken, user: appleUser } = req.body;
    
    if (!identityToken) {
      return res.status(400).json({ success: false, message: 'Identity token is required' });
    }

    // Decode Apple identity token (JWT)
    const tokenParts = identityToken.split('.');
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    
    const appleId = payload.sub;
    const email = payload.email;

    if (!appleId) {
      return res.status(400).json({ success: false, message: 'Invalid Apple token' });
    }

    // Check if user exists
    let user = await User.findOne({ $or: [{ appleId }, { email: email?.toLowerCase() }] });

    if (user) {
      // Update Apple ID if not set
      if (!user.appleId) {
        user.appleId = appleId;
        await user.save();
      }
    } else {
      // Create new user
      // Apple provides name only on first sign-in
      const firstName = appleUser?.name?.firstName || 'User';
      const lastName = appleUser?.name?.lastName || '';
      
      user = new User({
        appleId,
        firstName,
        lastName,
        email: email?.toLowerCase() || `apple_${appleId}@indera.local`,
        emailVerified: true,
        phoneVerified: true,
        phone: '',
        password: Math.random().toString(36).substring(2),
      });

      await user.save();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const jwtToken = generateToken(user._id, user.role);

    res.json({
      success: true,
      token: jwtToken,
      user: user.toSafeObject(),
      message: `Welcome${user.firstName ? ', ' + user.firstName : ''}!`,
    });
  } catch (error) {
    console.error('Apple OAuth error:', error);
    res.status(500).json({ success: false, message: 'Apple authentication failed' });
  }
});

export default router;

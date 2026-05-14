import { verifyToken } from '../utils/auth.js';
import User from '../models/User.js';

// ── User JWT auth ──────────────────────────────────────────────
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// ── Admin key auth ─────────────────────────────────────────────
// Key must come from the x-admin-key header ONLY — never from query params
// (query params are logged in server logs, browser history, and CDN logs)
export const adminAuth = (req, res, next) => {
  const apiKey = req.headers['x-admin-key'];
  if (!apiKey) {
    return res.status(401).json({ success: false, message: 'Admin key required' });
  }
  if (!process.env.ADMIN_API_KEY) {
    return res.status(503).json({ success: false, message: 'Admin API key is not configured on this server' });
  }
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({ success: false, message: 'Invalid admin key' });
  }
  next();
};

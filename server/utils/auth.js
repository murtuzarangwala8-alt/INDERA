import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const getSecret = () => process.env.JWT_SECRET || 'fallback-dev-secret-set-in-vercel-dashboard';
const getExpiry = () => process.env.JWT_EXPIRES_IN || '30d';

export const generateToken = (userId, role = 'customer') => {
  return jwt.sign({ id: userId, role }, getSecret(), { expiresIn: getExpiry() });
};

export const verifyToken = (token) => {
  return jwt.verify(token, getSecret());
};

// 6-digit numeric OTP
export const generateOtp = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

// OTP expiry — 10 minutes from now
export const otpExpiry = () => new Date(Date.now() + 10 * 60 * 1000);

// Secure random token for password reset
export const generateResetToken = () => crypto.randomBytes(32).toString('hex');

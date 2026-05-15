import express from 'express';
import {
  register,
  verifyPhone,
  resendOtp,
  login,
  getMe,
  getMyOrders,
  forgotPassword,
  resetPassword,
  updateProfile,
  addAddress,
  deleteAddress,
  getCart,
  saveCart,
  adminGetUsers,
  adminDeleteUser,
} from '../controllers/authController.js';
import { adminAuth, protect } from '../middleware/auth.js';
import { authLimiter, otpLimiter, forgotPasswordLimiter } from '../middleware/rateLimits.js';

const router = express.Router();

// ── Public (rate-limited) ──────────────────────────────────────
router.post('/register',        authLimiter, register);
router.post('/login',           authLimiter, login);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password',  authLimiter, resetPassword);
router.post('/verify-phone',    otpLimiter,  verifyPhone);
router.post('/resend-otp',      otpLimiter,  resendOtp);

// ── Protected (user must be logged in) ────────────────────────
router.get('/me',               protect, getMe);
router.put('/profile',          protect, updateProfile);
router.get('/orders',           protect, getMyOrders);
router.post('/addresses',       protect, addAddress);
router.delete('/addresses/:id', protect, deleteAddress);
router.get('/cart',             protect, getCart);
router.put('/cart',             protect, saveCart);

// ── Admin account management ───────────────────────────────────
router.get('/admin/users',        adminAuth, adminGetUsers);
router.delete('/admin/users/:id', adminAuth, adminDeleteUser);

export default router;

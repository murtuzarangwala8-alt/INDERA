import express from 'express';
import {
  register,
  verifyEmail,
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
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register',        register);
router.post('/verify-email',    verifyEmail);
router.post('/verify-phone',    verifyPhone);
router.post('/resend-otp',      resendOtp);
router.post('/login',           login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password',  resetPassword);

// Protected
router.get('/me',           protect, getMe);
router.put('/profile',      protect, updateProfile);
router.get('/orders',       protect, getMyOrders);
router.post('/addresses',   protect, addAddress);
router.delete('/addresses/:id', protect, deleteAddress);
router.get('/cart',         protect, getCart);
router.put('/cart',         protect, saveCart);

export default router;

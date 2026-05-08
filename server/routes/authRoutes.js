import express from 'express';
import {
  register,
  verifyEmail,
  verifyPhone,
  resendOtp,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateProfile,
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

export default router;

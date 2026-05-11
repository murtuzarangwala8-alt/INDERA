import User from '../models/User.js';
import Order from '../models/Order.js';
import { generateToken, generateOtp, otpExpiry, generateResetToken } from '../utils/auth.js';
import { sendEmailOtp, sendWelcomeEmail, sendPasswordResetEmail } from '../utils/email.js';
import { sendSmsOtp } from '../utils/sms.js';
import crypto from 'crypto';

const allowOtpInResponse = () => process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEV_OTP === 'true';
const shouldExposeOtp = () => allowOtpInResponse();
const phoneVerificationRequired = () => process.env.REQUIRE_PHONE_OTP === 'true';

// ── POST /api/auth/register ────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(409).json({ success: false, message: 'An account with this phone number already exists' });
    }

    const emailOtp = generateOtp();
    const requirePhoneOtp = phoneVerificationRequired();
    const phoneOtp = requirePhoneOtp ? generateOtp() : undefined;
    const expiry = otpExpiry();

    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      password,
      emailOtp,
      emailOtpExpiry: expiry,
      phoneOtp,
      phoneOtpExpiry: requirePhoneOtp ? expiry : undefined,
      phoneVerified: !requirePhoneOtp,
    });

    await user.save();

    // Send verifications in parallel
    const deliveryTasks = [sendEmailOtp(email, firstName, emailOtp)];
    if (requirePhoneOtp) deliveryTasks.push(sendSmsOtp(phone, phoneOtp));
    const delivery = await Promise.allSettled(deliveryTasks);
    const exposeOtp = shouldExposeOtp(delivery);

    res.status(201).json({
      success: true,
      message: 'Account created. Please verify your email and phone number.',
      userId: user._id,
      nextStep: 'verify-email',
      emailOtp: exposeOtp ? emailOtp : undefined,
      phoneOtp: exposeOtp && requirePhoneOtp ? phoneOtp : undefined,
      phoneVerificationRequired: requirePhoneOtp,
      delivery: delivery.map((item) => item.status),
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ success: false, message: `${field} already in use` });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/auth/verify-email ────────────────────────────────
export const verifyEmail = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) return res.status(400).json({ success: false, message: 'userId and otp are required' });

    const user = await User.findById(userId).select('+emailOtp +emailOtpExpiry');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.emailVerified) return res.status(400).json({ success: false, message: 'Email already verified' });
    if (!user.emailOtp || user.emailOtp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });
    if (new Date() > user.emailOtpExpiry) return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });

    user.emailVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpiry = undefined;
    await user.save();

    if (user.phoneVerified || !phoneVerificationRequired()) {
      if (!user.phoneVerified) {
        user.phoneVerified = true;
        await user.save();
      }
      const token = generateToken(user._id, user.role);
      return res.json({
        success: true,
        message: 'Account verified successfully',
        nextStep: 'complete',
        token,
        user: user.toSafeObject(),
      });
    }

    res.json({
      success: true,
      message: 'Email verified successfully',
      nextStep: 'verify-phone',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/auth/verify-phone ────────────────────────────────
export const verifyPhone = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) return res.status(400).json({ success: false, message: 'userId and otp are required' });

    const user = await User.findById(userId).select('+phoneOtp +phoneOtpExpiry');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.phoneVerified) return res.status(400).json({ success: false, message: 'Phone already verified' });
    if (!user.phoneOtp || user.phoneOtp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });
    if (new Date() > user.phoneOtpExpiry) return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });

    user.phoneVerified = true;
    user.phoneOtp = undefined;
    user.phoneOtpExpiry = undefined;
    await user.save();

    // Both verified — send welcome email and issue token
    if (user.emailVerified) {
      try {
        await sendWelcomeEmail(user.email, user.firstName);
      } catch (emailError) {
        console.warn('Welcome email failed:', emailError.message);
      }
      const token = generateToken(user._id, user.role);
      return res.json({
        success: true,
        message: 'Account fully verified. Welcome to INDÉRA!',
        token,
        user: user.toSafeObject(),
      });
    }

    res.json({
      success: true,
      message: 'Phone verified successfully',
      nextStep: 'verify-email',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/auth/resend-otp ──────────────────────────────────
export const resendOtp = async (req, res) => {
  try {
    const { userId, type } = req.body; // type: 'email' | 'phone'
    if (!userId || !type) return res.status(400).json({ success: false, message: 'userId and type are required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const otp = generateOtp();
    const expiry = otpExpiry();

    if (type === 'email') {
      if (user.emailVerified) return res.status(400).json({ success: false, message: 'Email already verified' });
      user.emailOtp = otp;
      user.emailOtpExpiry = expiry;
      await user.save();
      const delivery = await Promise.allSettled([sendEmailOtp(user.email, user.firstName, otp)]);
      return res.json({
        success: true,
        message: `New OTP sent to your ${type}`,
        otp: shouldExposeOtp(delivery) ? otp : undefined,
      });
    } else {
      if (user.phoneVerified) return res.status(400).json({ success: false, message: 'Phone already verified' });
      user.phoneOtp = otp;
      user.phoneOtpExpiry = expiry;
      await user.save();
      const delivery = await Promise.allSettled([sendSmsOtp(user.phone, otp)]);
      return res.json({
        success: true,
        message: `New OTP sent to your ${type}`,
        otp: shouldExposeOtp(delivery) ? otp : undefined,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/auth/login ───────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account suspended. Contact support.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    if (!user.emailVerified) {
      // Resend OTP
      const otp = generateOtp();
      user.emailOtp = otp;
      user.emailOtpExpiry = otpExpiry();
      await user.save();
      const delivery = await Promise.allSettled([sendEmailOtp(user.email, user.firstName, otp)]);
      return res.status(403).json({
        success: false,
        message: 'Please verify your email first. A new OTP has been sent.',
        userId: user._id,
        nextStep: 'verify-email',
        emailOtp: shouldExposeOtp(delivery) ? otp : undefined,
      });
    }

    if (!user.phoneVerified && phoneVerificationRequired()) {
      const otp = generateOtp();
      user.phoneOtp = otp;
      user.phoneOtpExpiry = otpExpiry();
      await user.save();
      const delivery = await Promise.allSettled([sendSmsOtp(user.phone, otp)]);
      return res.status(403).json({
        success: false,
        message: 'Please verify your phone number. A new OTP has been sent.',
        userId: user._id,
        nextStep: 'verify-phone',
        phoneOtp: shouldExposeOtp(delivery) ? otp : undefined,
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);
    res.json({ success: true, token, user: user.toSafeObject() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/auth/me ───────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: user.toSafeObject() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/auth/forgot-password ────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    // Always return success to prevent email enumeration
    if (!user) return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });

    const token = generateResetToken();
    user.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
    user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendPasswordResetEmail(user.email, user.firstName, resetUrl);

    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/auth/reset-password ─────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ success: false, message: 'Token and password are required' });
    if (password.length < 8) return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });

    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpiry: { $gt: new Date() },
    });

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save();

    const jwtToken = generateToken(user._id, user.role);
    res.json({ success: true, message: 'Password reset successfully', token: jwtToken, user: user.toSafeObject() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── PUT /api/auth/profile ──────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, shippingAddresses } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, phone, shippingAddresses },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user: user.toSafeObject() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [
        { user: req.user.id },
        { 'customer.email': req.user.email },
      ],
    }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.shippingAddresses.push(req.body);
    await user.save();
    res.status(201).json({ success: true, user: user.toSafeObject() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.shippingAddresses = user.shippingAddresses.filter((address) => String(address._id) !== req.params.id);
    await user.save();
    res.json({ success: true, user: user.toSafeObject() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCart = async (req, res) => {
  res.json({ success: true, cart: req.user.cart || [] });
};

export const saveCart = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { cart: req.body.cart || [] },
      { new: true }
    );
    res.json({ success: true, cart: user.cart || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

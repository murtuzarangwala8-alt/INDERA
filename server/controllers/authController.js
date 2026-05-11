import User from '../models/User.js';
import Order from '../models/Order.js';
import { generateToken, generateOtp, otpExpiry, generateResetToken } from '../utils/auth.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../utils/email.js';
import { sendSmsOtp, sendWhatsappOtp } from '../utils/sms.js';
import crypto from 'crypto';

const shouldExposeOtp = () => process.env.NODE_ENV !== 'production';
const allowSetupResetLink = () => process.env.NODE_ENV !== 'production' || process.env.SHOW_SETUP_CODES === 'true';
const phoneVerificationRequired = () => process.env.REQUIRE_WHATSAPP_OTP !== 'false';
const firstDeliveryError = (delivery) => delivery.find((item) => item.status === 'rejected')?.reason?.message;

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

    const requirePhoneOtp = phoneVerificationRequired();
    const phoneOtp = generateOtp();
    const expiry = otpExpiry();

    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      password,
      emailVerified: true,
      phoneOtp,
      phoneOtpExpiry: requirePhoneOtp ? expiry : undefined,
      phoneVerified: !requirePhoneOtp,
    });

    await user.save();

    const delivery = requirePhoneOtp ? await Promise.allSettled([sendWhatsappOtp(phone, phoneOtp)]) : [];
    const exposeOtp = shouldExposeOtp(delivery);
    const whatsappError = firstDeliveryError(delivery);

    res.status(201).json({
      success: true,
      message: whatsappError ? `Account created, but WhatsApp code could not be sent: ${whatsappError}` : 'Account created. Please verify your WhatsApp number.',
      userId: user._id,
      nextStep: requirePhoneOtp ? 'verify-phone' : 'complete',
      phoneOtp: exposeOtp && requirePhoneOtp ? phoneOtp : undefined,
      whatsappVerificationRequired: requirePhoneOtp,
      whatsappSent: !whatsappError,
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

    if (!user.emailVerified) {
      user.emailVerified = true;
      await user.save();
    }

    try {
      await sendWelcomeEmail(user.email, user.firstName);
    } catch (emailError) {
      console.warn('Welcome email failed:', emailError.message);
    }
    const token = generateToken(user._id, user.role);
    return res.json({
      success: true,
      message: 'WhatsApp verified. Welcome to INDÉRA!',
      token,
      user: user.toSafeObject(),
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

    if (type !== 'phone') {
      return res.status(400).json({ success: false, message: 'Email verification is disabled. Use WhatsApp verification.' });
    }

    if (user.phoneVerified) return res.status(400).json({ success: false, message: 'WhatsApp already verified' });
    user.phoneOtp = otp;
    user.phoneOtpExpiry = expiry;
    await user.save();
    const delivery = await Promise.allSettled([sendWhatsappOtp(user.phone, otp)]);
    const whatsappError = firstDeliveryError(delivery);
    if (whatsappError) {
      return res.status(502).json({ success: false, message: `WhatsApp code could not be sent: ${whatsappError}` });
    }

    return res.json({
      success: true,
      message: 'New code sent to your WhatsApp',
      otp: shouldExposeOtp(delivery) ? otp : undefined,
    });
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

    if (!user.emailVerified) user.emailVerified = true;

    if (!user.phoneVerified && phoneVerificationRequired()) {
      const otp = generateOtp();
      user.phoneOtp = otp;
      user.phoneOtpExpiry = otpExpiry();
      await user.save();
      const delivery = await Promise.allSettled([sendWhatsappOtp(user.phone, otp)]);
      return res.status(403).json({
        success: false,
        message: 'Please verify your WhatsApp number. A new code has been sent.',
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
    let emailSent = true;
    try {
      await sendPasswordResetEmail(user.email, user.firstName, resetUrl);
    } catch (emailError) {
      emailSent = false;
      console.warn('Password reset link generated, but email failed:', emailError.message);
    }

    res.json({
      success: true,
      message: emailSent ? 'If that email exists, a reset link has been sent.' : 'Reset link created, but email sending failed.',
      emailSent,
      resetUrl: allowSetupResetLink() ? resetUrl : undefined,
    });
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

export const adminGetUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    const query = search
      ? {
          $or: [
            { firstName: new RegExp(search, 'i') },
            { lastName: new RegExp(search, 'i') },
            { email: new RegExp(search, 'i') },
            { phone: new RegExp(search, 'i') },
          ],
        }
      : {};

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const totalUsers = await User.countDocuments(query);

    res.json({
      success: true,
      users: users.map((user) => user.toSafeObject()),
      totalUsers,
      totalPages: Math.ceil(totalUsers / Number(limit)),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminDeleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    await Order.updateMany({ user: req.params.id }, { $unset: { user: '' } });

    res.json({
      success: true,
      message: 'Account deleted from database',
      deletedUserId: req.params.id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

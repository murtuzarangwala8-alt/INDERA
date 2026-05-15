import User from '../models/User.js';
import Order from '../models/Order.js';
import { generateToken, generateOtp, otpExpiry, generateResetToken } from '../utils/auth.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../utils/email.js';
import { sendSmsOtp } from '../utils/sms.js';
import crypto from 'crypto';

const phoneVerificationRequired = () => process.env.REQUIRE_SMS_OTP !== 'false';
const firstDeliveryError = (delivery) => delivery.find((item) => item.status === 'rejected')?.reason?.message;

// ── POST /api/auth/register ────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Basic email format check
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
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
      firstName: String(firstName).trim().slice(0, 50),
      lastName: String(lastName).trim().slice(0, 50),
      email,
      phone,
      password,
      emailVerified: true,
      phoneOtp,
      phoneOtpExpiry: requirePhoneOtp ? expiry : undefined,
      phoneVerified: !requirePhoneOtp,
    });

    await user.save();

    const delivery = requirePhoneOtp
      ? await Promise.allSettled([sendSmsOtp(phone, phoneOtp)])
      : [];
    const smsError = firstDeliveryError(delivery);

    // Log OTP to server console only in non-production (never send in response)
    if (process.env.NODE_ENV !== 'production' && requirePhoneOtp) {
      console.log(`[DEV] OTP for ${phone}: ${phoneOtp}`);
    }

    res.status(201).json({
      success: true,
      message: smsError
        ? `Account created, but SMS code could not be sent: ${smsError}`
        : 'Account created. Please verify your phone number.',
      userId: user._id,
      nextStep: requirePhoneOtp ? 'verify-phone' : 'complete',
      smsVerificationRequired: requirePhoneOtp,
      smsSent: !smsError,
      delivery: delivery.map((item) => item.status),
      // phoneOtp intentionally omitted — never expose OTP in API response
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ success: false, message: `${field} already in use` });
    }
    console.error('[register]', error);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

// ── POST /api/auth/verify-phone ────────────────────────────────
export const verifyPhone = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
      return res.status(400).json({ success: false, message: 'userId and otp are required' });
    }

    const user = await User.findById(userId).select('+phoneOtp +phoneOtpExpiry');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.phoneVerified) return res.status(400).json({ success: false, message: 'Phone already verified' });
    if (!user.phoneOtp || user.phoneOtp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    if (new Date() > user.phoneOtpExpiry) {
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }

    user.phoneVerified = true;
    user.phoneOtp = undefined;
    user.phoneOtpExpiry = undefined;
    if (!user.emailVerified) user.emailVerified = true;
    await user.save();

    try {
      await sendWelcomeEmail(user.email, user.firstName);
    } catch (emailError) {
      console.warn('Welcome email failed:', emailError.message);
    }

    const token = generateToken(user._id, user.role);
    return res.json({
      success: true,
      message: 'Phone verified. Welcome to INDÉRA!',
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error('[verifyPhone]', error);
    res.status(500).json({ success: false, message: 'Verification failed. Please try again.' });
  }
};

// ── POST /api/auth/resend-otp ──────────────────────────────────
export const resendOtp = async (req, res) => {
  try {
    const { userId, type } = req.body;
    if (!userId || !type) {
      return res.status(400).json({ success: false, message: 'userId and type are required' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (type !== 'phone') {
      return res.status(400).json({ success: false, message: 'Email verification is disabled. Use SMS verification.' });
    }

    if (user.phoneVerified) {
      return res.status(400).json({ success: false, message: 'Phone already verified' });
    }

    const otp = generateOtp();
    const expiry = otpExpiry();
    user.phoneOtp = otp;
    user.phoneOtpExpiry = expiry;
    await user.save();

    const delivery = await Promise.allSettled([sendSmsOtp(user.phone, otp)]);
    const smsError = firstDeliveryError(delivery);

    // Log OTP to server console only in non-production
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] Resent OTP for ${user.phone}: ${otp}`);
    }

    if (smsError) {
      return res.status(502).json({ success: false, message: `SMS code could not be sent: ${smsError}` });
    }

    return res.json({
      success: true,
      message: 'New code sent via SMS',
      // otp intentionally omitted — never expose OTP in API response
    });
  } catch (error) {
    console.error('[resendOtp]', error);
    res.status(500).json({ success: false, message: 'Could not resend OTP. Please try again.' });
  }
};

// ── POST /api/auth/login ───────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

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

      const delivery = await Promise.allSettled([sendSmsOtp(user.phone, otp)]);

      // Log OTP to server console only in non-production
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[DEV] Login OTP for ${user.phone}: ${otp}`);
      }

      return res.status(403).json({
        success: false,
        message: 'Please verify your phone number. A new code has been sent.',
        userId: user._id,
        nextStep: 'verify-phone',
        // phoneOtp intentionally omitted
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);
    res.json({ success: true, token, user: user.toSafeObject() });
  } catch (error) {
    console.error('[login]', error);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

// ── GET /api/auth/me ───────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: user.toSafeObject() });
  } catch (error) {
    console.error('[getMe]', error);
    res.status(500).json({ success: false, message: 'Could not fetch profile.' });
  }
};

// ── POST /api/auth/forgot-password ────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ success: true, message: 'If that email exists, an OTP has been sent.' });
    }

    const otp = generateOtp();
    user.passwordResetToken = crypto.createHash('sha256').update(otp).digest('hex');
    user.passwordResetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    let smsSent = true;
    try {
      await sendSmsOtp(user.phone, otp);
    } catch (smsError) {
      smsSent = false;
      console.warn(`[forgotPassword] SMS failed for ${user.email}. OTP: ${otp}`);
    }

    // Log OTP to server console only in non-production
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] Forgot Password OTP for ${user.phone}: ${otp}`);
    }

    res.json({
      success: true,
      message: smsSent
        ? 'If that email exists, an OTP has been sent via SMS.'
        : 'OTP generated but SMS delivery failed. Check server logs.',
      smsSent,
    });
  } catch (error) {
    console.error('[forgotPassword]', error);
    res.status(500).json({ success: false, message: 'Could not process request. Please try again.' });
  }
};

// ── POST /api/auth/reset-password ─────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const hashed = crypto.createHash('sha256').update(otp).digest('hex');
    const user = await User.findOne({
      email: email.toLowerCase(),
      passwordResetToken: hashed,
      passwordResetExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save();

    const jwtToken = generateToken(user._id, user.role);
    res.json({ success: true, message: 'Password reset successfully', token: jwtToken, user: user.toSafeObject() });
  } catch (error) {
    console.error('[resetPassword]', error);
    res.status(500).json({ success: false, message: 'Could not reset password. Please try again.' });
  }
};

// ── PUT /api/auth/profile ──────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    // Whitelist only safe, user-editable fields — prevent mass assignment
    const { firstName, lastName, phone } = req.body;
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = String(firstName).trim().slice(0, 50);
    if (lastName !== undefined) updateData.lastName = String(lastName).trim().slice(0, 50);
    if (phone !== undefined) updateData.phone = String(phone).trim().slice(0, 20);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );
    res.json({ success: true, user: user.toSafeObject() });
  } catch (error) {
    console.error('[updateProfile]', error);
    res.status(500).json({ success: false, message: 'Could not update profile.' });
  }
};

// ── GET /api/auth/orders ───────────────────────────────────────
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
    console.error('[getMyOrders]', error);
    res.status(500).json({ success: false, message: 'Could not fetch orders.' });
  }
};

// ── POST /api/auth/addresses ───────────────────────────────────
export const addAddress = async (req, res) => {
  try {
    // Whitelist and validate address fields — prevent mass assignment
    const { label, address, city, zipCode, country, isDefault } = req.body;
    if (!address || !city || !zipCode || !country) {
      return res.status(400).json({ success: false, message: 'Address, city, zip code, and country are required' });
    }

    const user = await User.findById(req.user.id);
    if (user.shippingAddresses.length >= 10) {
      return res.status(400).json({ success: false, message: 'Maximum 10 addresses allowed' });
    }

    user.shippingAddresses.push({
      label: String(label || 'Home').trim().slice(0, 30),
      address: String(address).trim().slice(0, 200),
      city: String(city).trim().slice(0, 100),
      zipCode: String(zipCode).trim().slice(0, 20),
      country: String(country).trim().slice(0, 100),
      isDefault: Boolean(isDefault),
    });
    await user.save();
    res.status(201).json({ success: true, user: user.toSafeObject() });
  } catch (error) {
    console.error('[addAddress]', error);
    res.status(500).json({ success: false, message: 'Could not add address.' });
  }
};

// ── DELETE /api/auth/addresses/:id ────────────────────────────
export const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.shippingAddresses = user.shippingAddresses.filter(
      (addr) => String(addr._id) !== req.params.id
    );
    await user.save();
    res.json({ success: true, user: user.toSafeObject() });
  } catch (error) {
    console.error('[deleteAddress]', error);
    res.status(500).json({ success: false, message: 'Could not delete address.' });
  }
};

// ── GET /api/auth/cart ─────────────────────────────────────────
export const getCart = async (req, res) => {
  res.json({ success: true, cart: req.user.cart || [] });
};

// ── PUT /api/auth/cart ─────────────────────────────────────────
export const saveCart = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { cart: req.body.cart || [] },
      { new: true }
    );
    res.json({ success: true, cart: user.cart || [] });
  } catch (error) {
    console.error('[saveCart]', error);
    res.status(500).json({ success: false, message: 'Could not save cart.' });
  }
};

// ── GET /api/auth/admin/users ──────────────────────────────────
export const adminGetUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;

    let query = {};
    if (search) {
      const safeSearch = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 100);
      query = {
        $or: [
          { firstName: { $regex: safeSearch, $options: 'i' } },
          { lastName: { $regex: safeSearch, $options: 'i' } },
          { email: { $regex: safeSearch, $options: 'i' } },
          { phone: { $regex: safeSearch, $options: 'i' } },
        ],
      };
    }

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
    console.error('[adminGetUsers]', error);
    res.status(500).json({ success: false, message: 'Could not fetch users.' });
  }
};

// ── DELETE /api/auth/admin/users/:id ──────────────────────────
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
    console.error('[adminDeleteUser]', error);
    res.status(500).json({ success: false, message: 'Could not delete account.' });
  }
};

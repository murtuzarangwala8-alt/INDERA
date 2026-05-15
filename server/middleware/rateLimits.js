import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
});

export const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 2,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many OTP requests. Try again in 1 hour.' },
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour session
  max: 2, // Limit to 2 OTP requests per session
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Maximum 2 reset attempts allowed per session. Please try again later.' },
});

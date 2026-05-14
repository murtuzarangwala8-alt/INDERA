import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load env vars FIRST — before any other imports that read process.env
dotenv.config();

import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import oauthRoutes from './routes/oauthRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import productRoutes from './routes/productRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import returnRoutes from './routes/returnRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import { stripeEnabled } from './config/stripe.js';

const app = express();

// ── Allowed origins ────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://indera.it',
  'https://www.indera.it',
  // Common deployment platforms — add your specific URL here too
  /\.vercel\.app$/,
  /\.netlify\.app$/,
  /\.onrender\.com$/,
  /\.railway\.app$/,
  /\.up\.railway\.app$/,
  // Allow the env-configured frontend URL
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

// ── Security headers (helmet) ──────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://js.stripe.com'],
        frameSrc: ["'self'", 'https://js.stripe.com'],
        connectSrc: ["'self'", 'https://api.stripe.com', 'https://accounts.google.com', 'https://www.googleapis.com', 'https://oauth2.googleapis.com'],
        imgSrc: ["'self'", 'data:', 'https://images.unsplash.com', 'https://*.unsplash.com'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    crossOriginEmbedderPolicy: false, // needed for Stripe
  })
);

// ── CORS — whitelist only ──────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server requests (no origin) and whitelisted origins
      if (!origin) return callback(null, true);
      const allowed = allowedOrigins.some((o) =>
        typeof o === 'string' ? o === origin : o.test(origin)
      );
      if (allowed) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Blocked origin: ${origin}`);
        callback(null, false); // don't throw — return 200 with CORS headers missing instead
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key'],
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ── Global rate limiter (all routes) ──────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use(globalLimiter);

// ── Auth rate limiters (imported by routes) ───────────────────
// Defined in middleware/rateLimits.js to avoid circular imports

// ── Admin login limiter ────────────────────────────────────────
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many admin login attempts. Try again in 15 minutes.' },
});

// ── Health check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'INDÉRA API is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
  });
});

// ── Stripe public key (safe to expose) ────────────────────────
app.get('/api/config/stripe', (req, res) => {
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  const hasStripeKey = Boolean(
    publishableKey &&
    publishableKey.startsWith('pk_') &&
    !publishableKey.toLowerCase().includes('replace')
  );

  res.json({
    success: true,
    publishableKey: hasStripeKey && stripeEnabled ? publishableKey : null,
    demoMode: !hasStripeKey || !stripeEnabled,
    secretConfigured: stripeEnabled,
  });
});

// ── Admin login ────────────────────────────────────────────────
app.post('/api/admin/login', adminLoginLimiter, (req, res) => {
  const { email, password } = req.body;

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  // DEBUG — remove after fix confirmed
  console.log('[ADMIN LOGIN] Received:', { email, passwordLength: password?.length });
  console.log('[ADMIN LOGIN] Env vars loaded:', {
    ADMIN_EMAIL: adminEmail || '(NOT SET)',
    ADMIN_PASSWORD: adminPassword ? '(SET)' : '(NOT SET)',
    ADMIN_API_KEY: process.env.ADMIN_API_KEY ? '(SET)' : '(NOT SET)',
  });

  if (!adminEmail || !adminPassword) {
    console.error('FATAL: ADMIN_EMAIL and ADMIN_PASSWORD env vars are not set');
    return res.status(503).json({ success: false, message: 'Admin login is not configured on this server' });
  }

  if (!process.env.ADMIN_API_KEY) {
    console.error('FATAL: ADMIN_API_KEY env var is not set');
    return res.status(503).json({ success: false, message: 'Admin API key is not configured' });
  }

  if (email === adminEmail && password === adminPassword) {
    console.log('[ADMIN LOGIN] Success for:', email);
    return res.json({
      success: true,
      adminKey: process.env.ADMIN_API_KEY,
    });
  }

  console.warn('[ADMIN LOGIN] Failed — email/password mismatch');
  res.status(401).json({
    success: false,
    message: 'Invalid admin email or password',
  });
});

// ── DB connection middleware ───────────────────────────────────
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// ── Routes ─────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/auth/oauth', oauthRoutes);
app.use('/api', productRoutes);
app.use('/api', orderRoutes);
app.use('/api', reviewRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/returns', returnRoutes);

// ── Centralised error handler ──────────────────────────────────
app.use((err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';
  console.error('[ERROR]', err.stack || err.message || err);

  // CORS errors
  if (err.message && err.message.startsWith('CORS:')) {
    return res.status(403).json({ success: false, message: err.message });
  }

  res.status(err.status || 500).json({
    success: false,
    message: isDev ? err.message : 'Something went wrong. Please try again.',
  });
});

// ── 404 handler ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

export default app;

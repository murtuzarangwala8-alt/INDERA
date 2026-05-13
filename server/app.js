import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import oauthRoutes from './routes/oauthRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import productRoutes from './routes/productRoutes.js';
import { stripeEnabled } from './config/stripe.js';

dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://indera.it',
  'https://www.indera.it',
];

app.use(cors({
  origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)),
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ChronoLux API is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
  });
});

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

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@indera.it';
  const adminPassword = process.env.ADMIN_PASSWORD || 'sakina@110';

  if (email === adminEmail && password === adminPassword) {
    return res.json({
      success: true,
      adminKey: process.env.ADMIN_API_KEY,
    });
  }

  res.status(401).json({
    success: false,
    message: 'Invalid admin email or password',
  });
});

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/auth/oauth', oauthRoutes);
app.use('/api', productRoutes);
app.use('/api', orderRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

export default app;

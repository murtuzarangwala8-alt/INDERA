import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;
const hasStripeKey = Boolean(
  secretKey &&
  secretKey.startsWith('sk_') &&
  !secretKey.toLowerCase().includes('replace')
);

const stripe = hasStripeKey ? new Stripe(secretKey) : null;

export const stripeEnabled = Boolean(stripe);

export default stripe;

import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import stripe, { stripeEnabled } from '../config/stripe.js';
import { sendOrderConfirmation } from '../utils/email.js';
import { verifyToken } from '../utils/auth.js';

const toMoney = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
};

// ── POST /api/orders ───────────────────────────────────────────
export const createOrder = async (req, res) => {
  try {
    const { customer, shippingAddress, items, pricing } = req.body;

    if (!customer || !shippingAddress || !Array.isArray(items) || items.length === 0 || !pricing) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Validate customer fields
    if (!customer.email || !/^\S+@\S+\.\S+$/.test(customer.email)) {
      return res.status(400).json({ success: false, message: 'Valid customer email is required' });
    }

    // Validate shipping address
    if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.zipCode || !shippingAddress.country) {
      return res.status(400).json({ success: false, message: 'Complete shipping address is required' });
    }

    // ── Server-side price recalculation ───────────────────────
    // Never trust client-supplied prices — always recalculate from DB
    const productIds = items.map((item) => String(item.productId || item.id || item._id)).filter(Boolean);
    const dbProducts = await Product.find({ _id: { $in: productIds }, isActive: true });
    const productMap = new Map(dbProducts.map((p) => [String(p._id), p]));

    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const pid = String(item.productId || item.id || item._id || '');
      const dbProduct = productMap.get(pid);

      if (!dbProduct) {
        return res.status(400).json({ success: false, message: `Product not found: ${pid}` });
      }
      if (!dbProduct.inStock) {
        return res.status(400).json({ success: false, message: `"${dbProduct.name}" is out of stock` });
      }

      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
      calculatedSubtotal += dbProduct.price * qty;

      validatedItems.push({
        productId: String(dbProduct._id),
        name: dbProduct.name,
        brand: dbProduct.brand || 'INDÉRA',
        price: dbProduct.price,   // always use DB price
        quantity: qty,
        image: dbProduct.image || '',
      });
    }

    const calculatedShipping = calculatedSubtotal > 100 ? 0 : 9.99;
    const calculatedTax = Math.round(calculatedSubtotal * 0.1 * 100) / 100;
    const calculatedTotal = Math.round((calculatedSubtotal + calculatedShipping + calculatedTax) * 100) / 100;

    // Optional: resolve authenticated user
    let userId;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const decoded = verifyToken(authHeader.split(' ')[1]);
        userId = decoded.id;
      } catch {
        // Token invalid — treat as guest, don't block the order
      }
    }

    const order = new Order({
      user: userId,
      customer: {
        firstName: String(customer.firstName || 'Guest').trim().slice(0, 50),
        lastName: String(customer.lastName || 'Customer').trim().slice(0, 50),
        email: customer.email.trim().toLowerCase(),
        phone: String(customer.phone || '').trim().slice(0, 20),
      },
      shippingAddress: {
        address: String(shippingAddress.address).trim().slice(0, 200),
        city: String(shippingAddress.city).trim().slice(0, 100),
        zipCode: String(shippingAddress.zipCode).trim().slice(0, 20),
        country: String(shippingAddress.country || 'Not provided').trim().slice(0, 100),
      },
      items: validatedItems,
      pricing: {
        subtotal: calculatedSubtotal,
        shipping: calculatedShipping,
        tax: calculatedTax,
        total: calculatedTotal,
      },
      status: 'pending',
      payment: { status: 'pending' },
    });

    await order.save();

    // Update user profile if authenticated
    if (userId) {
      try {
        await User.findByIdAndUpdate(userId, {
          $set: { cart: [] },
          $addToSet: {
            shippingAddresses: {
              label: 'Checkout',
              address: String(shippingAddress.address).trim().slice(0, 200),
              city: String(shippingAddress.city).trim().slice(0, 100),
              zipCode: String(shippingAddress.zipCode).trim().slice(0, 20),
              country: String(shippingAddress.country || 'Not provided').trim().slice(0, 100),
              isDefault: false,
            },
          },
        }, { runValidators: false });
      } catch (profileError) {
        console.warn('[createOrder] Profile update failed:', profileError.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        total: order.pricing.total,
      },
    });
  } catch (error) {
    console.error('[createOrder]', error);
    res.status(500).json({ success: false, message: 'Failed to create order. Please try again.' });
  }
};

// ── POST /api/payment/create-intent ───────────────────────────
export const createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required' });
    }

    // Always fetch the amount from the DB — never trust client-supplied amount
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.payment.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Order is already paid' });
    }

    const amount = order.pricing.total;

    if (!stripeEnabled) {
      const paymentIntentId = `demo_pi_${orderId}_${Date.now()}`;
      await Order.findByIdAndUpdate(orderId, {
        'payment.stripePaymentIntentId': paymentIntentId,
      });
      return res.status(200).json({
        success: true,
        demoMode: true,
        clientSecret: `${paymentIntentId}_secret_demo`,
        paymentIntentId,
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // cents
      currency: process.env.STRIPE_CURRENCY || 'eur',
      metadata: { orderId: String(orderId) },
      payment_method_types: ['card'],
    });

    await Order.findByIdAndUpdate(orderId, {
      'payment.stripePaymentIntentId': paymentIntent.id,
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('[createPaymentIntent]', error);
    res.status(500).json({ success: false, message: 'Failed to create payment intent.' });
  }
};

// ── POST /api/payment/confirm ──────────────────────────────────
export const confirmPayment = async (req, res) => {
  try {
    const { orderId, paymentIntentId } = req.body;

    if (!orderId || !paymentIntentId) {
      return res.status(400).json({ success: false, message: 'orderId and paymentIntentId are required' });
    }

    // SECURITY: Reject demo payment IDs when Stripe is configured
    if (stripeEnabled && paymentIntentId.startsWith('demo_pi_')) {
      return res.status(400).json({ success: false, message: 'Invalid payment intent ID' });
    }

    // Demo mode (Stripe not configured)
    if (!stripeEnabled) {
      const order = await Order.findByIdAndUpdate(
        orderId,
        {
          'payment.status': 'completed',
          'payment.transactionId': paymentIntentId,
          status: 'processing',
        },
        { new: true }
      );

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      try {
        await sendOrderConfirmation(order);
      } catch (emailError) {
        console.warn('[confirmPayment] Confirmation email failed:', emailError.message);
      }

      return res.status(200).json({
        success: true,
        demoMode: true,
        message: 'Order confirmed successfully',
        order: { orderNumber: order.orderNumber, status: order.status },
      });
    }

    // ── Real Stripe verification ───────────────────────────────
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Verify the payment intent belongs to this order
    if (paymentIntent.metadata?.orderId !== String(orderId)) {
      return res.status(400).json({ success: false, message: 'Payment intent does not match this order' });
    }

    // Verify the amount matches what we stored
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const expectedAmount = Math.round(order.pricing.total * 100);
    if (paymentIntent.amount !== expectedAmount) {
      console.error(`[confirmPayment] Amount mismatch: expected ${expectedAmount}, got ${paymentIntent.amount}`);
      return res.status(400).json({ success: false, message: 'Payment amount does not match order total' });
    }

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed',
        status: paymentIntent.status,
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        'payment.status': 'completed',
        'payment.transactionId': paymentIntentId,
        status: 'processing',
      },
      { new: true }
    );

    try {
      await sendOrderConfirmation(updatedOrder);
    } catch (emailError) {
      console.warn('[confirmPayment] Confirmation email failed:', emailError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully',
      order: { orderNumber: updatedOrder.orderNumber, status: updatedOrder.status },
    });
  } catch (error) {
    console.error('[confirmPayment]', error);
    res.status(500).json({ success: false, message: 'Failed to confirm payment.' });
  }
};

// ── GET /api/orders (admin) ────────────────────────────────────
export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const count = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      orders,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
      totalOrders: count,
    });
  } catch (error) {
    console.error('[getAllOrders]', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
};

// ── GET /api/orders/:id (admin) ────────────────────────────────
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('[getOrderById]', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order.' });
  }
};

// ── GET /api/orders/number/:orderNumber (public — limited fields) ──
export const getOrderByNumber = async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Return only safe, non-PII fields to unauthenticated callers
    const safeOrder = {
      orderNumber: order.orderNumber,
      status: order.status,
      createdAt: order.createdAt,
      items: order.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
      pricing: { total: order.pricing.total },
    };

    res.status(200).json({ success: true, order: safeOrder });
  } catch (error) {
    console.error('[getOrderByNumber]', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order.' });
  }
};

// ── PUT /api/orders/:id (admin) ────────────────────────────────
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;

    const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const updateData = { status };
    if (trackingNumber) {
      updateData.trackingNumber = String(trackingNumber).trim().slice(0, 100);
    }

    const order = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.status(200).json({ success: true, message: 'Order updated successfully', order });
  } catch (error) {
    console.error('[updateOrderStatus]', error);
    res.status(500).json({ success: false, message: 'Failed to update order.' });
  }
};

// ── GET /api/orders/stats (admin) ─────────────────────────────
export const getOrderStats = async (req, res) => {
  try {
    const [totalOrders, pendingOrders, processingOrders, shippedOrders, deliveredOrders, totalRevenue, recentOrders] =
      await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ status: 'pending' }),
        Order.countDocuments({ status: 'processing' }),
        Order.countDocuments({ status: 'shipped' }),
        Order.countDocuments({ status: 'delivered' }),
        Order.aggregate([
          { $match: { 'payment.status': 'completed' } },
          { $group: { _id: null, total: { $sum: '$pricing.total' } } },
        ]),
        Order.find()
          .sort({ createdAt: -1 })
          .limit(10)
          .select('orderNumber customer.firstName customer.lastName pricing.total status createdAt'),
      ]);

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      recentOrders,
    });
  } catch (error) {
    console.error('[getOrderStats]', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics.' });
  }
};

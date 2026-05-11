import Order from '../models/Order.js';
import User from '../models/User.js';
import stripe, { stripeEnabled } from '../config/stripe.js';
import { sendOrderConfirmation } from '../utils/email.js';
import { verifyToken } from '../utils/auth.js';

// Create new order
export const createOrder = async (req, res) => {
  try {
    const { customer, shippingAddress, items, pricing } = req.body;
    let userId;

    // Validate required fields
    if (!customer || !shippingAddress || !items || !pricing) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const decoded = verifyToken(authHeader.split(' ')[1]);
        userId = decoded.id;
      } catch {}
    }

    const order = new Order({
      user: userId,
      customer,
      shippingAddress,
      items,
      pricing,
      status: 'pending',
      payment: {
        status: 'pending',
      },
    });

    await order.save();

    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $set: {
          cart: [],
          firstName: customer.firstName,
          lastName: customer.lastName,
        },
        $addToSet: {
          shippingAddresses: {
            label: 'Checkout',
            ...shippingAddress,
            isDefault: false,
          },
        },
      }, { runValidators: true });
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
    console.error('Create order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create order',
      error: error.message 
    });
  }
};

// Create Stripe payment intent
export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount and orderId are required' 
      });
    }

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

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: { orderId },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update order with payment intent ID
    await Order.findByIdAndUpdate(orderId, {
      'payment.stripePaymentIntentId': paymentIntent.id,
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create payment intent',
      error: error.message 
    });
  }
};

// Confirm payment and complete order
export const confirmPayment = async (req, res) => {
  try {
    const { orderId, paymentIntentId } = req.body;

    if (!orderId || !paymentIntentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'OrderId and paymentIntentId are required' 
      });
    }

    if (!stripeEnabled || paymentIntentId.startsWith('demo_pi_')) {
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
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      try {
        await sendOrderConfirmation(order);
      } catch (emailError) {
        console.warn('Order confirmation email failed:', emailError.message);
      }

      return res.status(200).json({
        success: true,
        demoMode: true,
        message: 'Order confirmed successfully',
        order: {
          orderNumber: order.orderNumber,
          status: order.status,
        },
      });
    }

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update order status
      const order = await Order.findByIdAndUpdate(
        orderId,
        {
          'payment.status': 'completed',
          'payment.transactionId': paymentIntentId,
          status: 'processing',
        },
        { new: true }
      );

      // Send confirmation email
      try {
        await sendOrderConfirmation(order);
      } catch (emailError) {
        console.warn('Order confirmation email failed:', emailError.message);
      }

      res.status(200).json({
        success: true,
        message: 'Payment confirmed successfully',
        order: {
          orderNumber: order.orderNumber,
          status: order.status,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment not completed',
        status: paymentIntent.status,
      });
    }
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to confirm payment',
      error: error.message 
    });
  }
};

// Get all orders (admin)
export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = status ? { status } : {};
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalOrders: count,
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch orders',
      error: error.message 
    });
  }
};

// Get single order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch order',
      error: error.message 
    });
  }
};

// Get order by order number
export const getOrderByNumber = async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch order',
      error: error.message 
    });
  }
};

// Update order status (admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;

    const updateData = { status };
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      order,
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update order',
      error: error.message 
    });
  }
};

// Get order statistics (admin dashboard)
export const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const shippedOrders = await Order.countDocuments({ status: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });

    const totalRevenue = await Order.aggregate([
      { $match: { 'payment.status': 'completed' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } },
    ]);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderNumber customer.firstName customer.lastName pricing.total status createdAt');

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
    console.error('Get stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch statistics',
      error: error.message 
    });
  }
};

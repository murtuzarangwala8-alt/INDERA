import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// In-memory storage (for testing without MongoDB)
let orders = [];
let orderCounter = 1;

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'INDÉRA API is running (Simple Mode - No Database)',
    timestamp: new Date().toISOString(),
  });
});

// Get Stripe config
app.get('/api/config/stripe', (req, res) => {
  res.json({
    success: true,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_demo',
  });
});

// Create order
app.post('/api/orders', (req, res) => {
  try {
    const { customer, shippingAddress, items, pricing } = req.body;
    
    const order = {
      _id: Date.now().toString(),
      orderNumber: `CL${Date.now()}-${String(orderCounter++).padStart(5, '0')}`,
      customer,
      shippingAddress,
      items,
      pricing,
      payment: { status: 'pending' },
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    orders.push(order);
    
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
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create order',
      error: error.message 
    });
  }
});

// Create payment intent (mock)
app.post('/api/payment/create-intent', (req, res) => {
  try {
    const { amount, orderId } = req.body;
    
    // Mock payment intent
    const paymentIntent = {
      id: `pi_mock_${Date.now()}`,
      client_secret: `pi_mock_${Date.now()}_secret_demo`,
    };
    
    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create payment intent',
      error: error.message 
    });
  }
});

// Confirm payment (mock)
app.post('/api/payment/confirm', (req, res) => {
  try {
    const { orderId, paymentIntentId } = req.body;
    
    const order = orders.find(o => o._id === orderId);
    if (order) {
      order.payment.status = 'completed';
      order.payment.transactionId = paymentIntentId;
      order.status = 'processing';
    }
    
    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      order: {
        orderNumber: order?.orderNumber || 'DEMO-ORDER',
        status: 'processing',
      },
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to confirm payment',
      error: error.message 
    });
  }
});

// Get all orders
app.get('/api/orders', (req, res) => {
  try {
    res.json({
      success: true,
      orders: orders.slice().reverse(),
      totalPages: 1,
      currentPage: 1,
      totalOrders: orders.length,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch orders',
      error: error.message 
    });
  }
});

// Get order stats
app.get('/api/orders/stats', (req, res) => {
  try {
    const stats = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      processingOrders: orders.filter(o => o.status === 'processing').length,
      shippedOrders: orders.filter(o => o.status === 'shipped').length,
      deliveredOrders: orders.filter(o => o.status === 'delivered').length,
      totalRevenue: orders
        .filter(o => o.payment.status === 'completed')
        .reduce((sum, o) => sum + o.pricing.total, 0),
    };
    
    res.json({
      success: true,
      stats,
      recentOrders: orders.slice(-10).reverse(),
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch statistics',
      error: error.message 
    });
  }
});

// Update order status
app.put('/api/orders/:id', (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    const order = orders.find(o => o._id === req.params.id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    order.status = status;
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    
    res.json({
      success: true,
      message: 'Order updated successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update order',
      error: error.message 
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('========================================');
  console.log('  🚀 INDÉRA Backend Server');
  console.log('========================================');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
  console.log(`📍 Health: http://localhost:${PORT}/api/health`);
  console.log('🌍 Environment: ' + (process.env.NODE_ENV || 'development'));
  console.log('⚠️  Running in SIMPLE MODE (no database)');
  console.log('========================================');
});

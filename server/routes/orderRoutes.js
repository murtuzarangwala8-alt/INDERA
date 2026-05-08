import express from 'express';
import {
  createOrder,
  createPaymentIntent,
  confirmPayment,
  getAllOrders,
  getOrderById,
  getOrderByNumber,
  updateOrderStatus,
  getOrderStats,
} from '../controllers/orderController.js';

const router = express.Router();

// Public routes
router.post('/orders', createOrder);
router.post('/payment/create-intent', createPaymentIntent);
router.post('/payment/confirm', confirmPayment);
router.get('/orders/number/:orderNumber', getOrderByNumber);

// Admin routes (in production, add authentication middleware)
router.get('/orders', getAllOrders);
router.get('/orders/stats', getOrderStats);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id', updateOrderStatus);

export default router;

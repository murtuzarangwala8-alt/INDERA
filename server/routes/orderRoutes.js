import express from 'express';
import {
  createOrder,
  createPaymentIntent,
  confirmPayment,
  getAllOrders,
  getMyOrders,
  getOrderById,
  getOrderByNumber,
  updateOrderStatus,
  getOrderStats,
} from '../controllers/orderController.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/orders', createOrder);
router.post('/payment/create-intent', createPaymentIntent);
router.post('/payment/confirm', confirmPayment);
router.get('/orders/number/:orderNumber', getOrderByNumber);
router.get('/orders/my', getMyOrders);

// Admin routes
router.get('/orders', adminAuth, getAllOrders);
router.get('/orders/stats', adminAuth, getOrderStats);
router.get('/orders/:id', adminAuth, getOrderById);
router.put('/orders/:id', adminAuth, updateOrderStatus);

export default router;

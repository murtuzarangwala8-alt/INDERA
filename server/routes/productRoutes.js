import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  adminGetAllProducts,
  getProductStats,
  seedProducts,
} from '../controllers/productController.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

// ── Public routes ──────────────────────────────────────────────
router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);

// ── Admin routes (protected) ───────────────────────────────────
router.get('/admin/products', adminAuth, adminGetAllProducts);
router.get('/admin/products/stats', adminAuth, getProductStats);
router.post('/admin/products', adminAuth, createProduct);
router.put('/admin/products/:id', adminAuth, updateProduct);
router.delete('/admin/products/:id', adminAuth, deleteProduct);
router.patch('/admin/products/:id/stock', adminAuth, updateStock);

// Seed endpoint (disable in production)
router.post('/admin/seed', adminAuth, seedProducts);

export default router;

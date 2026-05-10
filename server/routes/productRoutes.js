import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  updateVisibility,
  adminGetAllProducts,
  getProductStats,
  seedProducts,
  getCategories,
  createCategory,
  deleteCategory,
} from '../controllers/productController.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

// ── Public routes ──────────────────────────────────────────────
router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
router.get('/categories', getCategories);

// ── Admin routes (protected) ───────────────────────────────────
router.get('/admin/products', adminAuth, adminGetAllProducts);
router.get('/admin/products/stats', adminAuth, getProductStats);
router.post('/admin/products', adminAuth, createProduct);
router.put('/admin/products/:id', adminAuth, updateProduct);
router.delete('/admin/products/:id', adminAuth, deleteProduct);
router.patch('/admin/products/:id/stock', adminAuth, updateStock);
router.patch('/admin/products/:id/visibility', adminAuth, updateVisibility);
router.post('/admin/categories', adminAuth, createCategory);
router.delete('/admin/categories/:id', adminAuth, deleteCategory);

// Seed endpoint (disable in production)
router.post('/admin/seed', adminAuth, seedProducts);

export default router;

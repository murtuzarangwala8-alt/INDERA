import express from 'express';
import {
  getProductReviews,
  submitReview,
  adminGetAllReviews,
  adminDeleteReview,
  adminToggleReviewApproval,
} from '../controllers/reviewController.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Public
router.get('/reviews/:productId', getProductReviews);
router.post('/reviews/:productId', submitReview);

// Admin
router.get('/admin/reviews', adminAuth, adminGetAllReviews);
router.delete('/admin/reviews/:id', adminAuth, adminDeleteReview);
router.patch('/admin/reviews/:id/approve', adminAuth, adminToggleReviewApproval);

export default router;

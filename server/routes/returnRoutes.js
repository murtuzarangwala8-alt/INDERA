import express from 'express';
import { submitReturnRequest, getReturnRequests, updateReturnStatus } from '../controllers/returnController.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Public
router.post('/', submitReturnRequest);

// Admin only
router.get('/', adminAuth, getReturnRequests);
router.patch('/:id', adminAuth, updateReturnStatus);

export default router;

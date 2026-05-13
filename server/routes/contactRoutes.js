import express from 'express';
import { submitContact, getContactMessages, updateContactStatus } from '../controllers/contactController.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Public
router.post('/', submitContact);

// Admin only
router.get('/', adminAuth, getContactMessages);
router.patch('/:id', adminAuth, updateContactStatus);

export default router;

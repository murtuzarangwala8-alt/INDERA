import ReturnRequest from '../models/ReturnRequest.js';
import Order from '../models/Order.js';
import { sendReturnRequestEmail } from '../utils/email.js';

// ── POST /api/returns ──────────────────────────────────────────
export const submitReturnRequest = async (req, res) => {
  try {
    const { orderNumber, email, firstName, lastName, reason, description, resolution } = req.body;

    if (!orderNumber || !email || !firstName || !lastName || !reason || !description || !resolution) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const validReasons = ['damaged', 'wrong_item', 'not_as_described', 'changed_mind', 'other'];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({ success: false, message: 'Invalid return reason.' });
    }

    if (!['refund', 'replacement'].includes(resolution)) {
      return res.status(400).json({ success: false, message: 'Resolution must be refund or replacement.' });
    }

    // Check for duplicate return request for same order
    const existing = await ReturnRequest.findOne({
      orderNumber: orderNumber.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A return request for this order already exists. Please check your email.',
      });
    }

    // Try to link to actual order
    const order = await Order.findOne({
      orderNumber: orderNumber.trim().toUpperCase(),
      'customer.email': email.trim().toLowerCase(),
    });

    const returnRequest = await ReturnRequest.create({
      orderNumber: orderNumber.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      reason,
      description: description.trim(),
      resolution,
      order: order?._id || undefined,
      ipAddress: req.ip,
    });

    // Send emails (non-blocking)
    try {
      await sendReturnRequestEmail({
        firstName: firstName.trim(),
        email: email.trim(),
        orderNumber: orderNumber.trim().toUpperCase(),
        reason,
        resolution,
        returnId: returnRequest._id.toString(),
      });
    } catch (emailError) {
      console.warn('Return request email failed:', emailError.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Your return request has been submitted. We will review it within 2–3 business days.',
      returnId: returnRequest._id,
    });
  } catch (error) {
    console.error('Return request error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

// ── GET /api/returns (admin only) ─────────────────────────────
export const getReturnRequests = async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const query = status ? { status } : {};

    const requests = await ReturnRequest.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('order', 'orderNumber pricing status');

    const total = await ReturnRequest.countDocuments(query);

    res.json({
      success: true,
      requests,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── PATCH /api/returns/:id (admin update status) ──────────────
export const updateReturnStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'under_review', 'approved', 'rejected', 'completed'];
    if (!valid.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const request = await ReturnRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!request) return res.status(404).json({ success: false, message: 'Return request not found.' });

    res.json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import Review from '../models/Review.js';
import Order from '../models/Order.js';
import { verifyToken } from '../utils/auth.js';

// GET /api/reviews/:productId  — public
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId, isApproved: true })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('-authorEmail -user');

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
};

// POST /api/reviews/:productId  — semi-public (anyone can review)
export const submitReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, title, body, authorName, authorEmail, photos } = req.body;

    if (!rating || !body || !authorName) {
      return res.status(400).json({ success: false, message: 'Rating, name and review text are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    // Validate photos — max 5, each must be a string
    const reviewPhotos = Array.isArray(photos) ? photos.slice(0, 5).filter((p) => typeof p === 'string') : [];

    let userId;
    let verifiedPurchase = false;

    // Optional auth — check if logged in
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const decoded = verifyToken(authHeader.split(' ')[1]);
        userId = decoded.id;
      } catch {}
    }

    // Check verified purchase (by email or userId)
    if (authorEmail || userId) {
      const query = userId
        ? { user: userId, 'items.productId': productId, 'payment.status': 'completed' }
        : { 'customer.email': authorEmail, 'items.productId': productId, 'payment.status': 'completed' };
      const order = await Order.findOne(query);
      if (order) verifiedPurchase = true;
    }

    // Duplicate guard
    if (authorEmail) {
      const existing = await Review.findOne({ product: productId, authorEmail: authorEmail.toLowerCase() });
      if (existing) {
        return res.status(409).json({ success: false, message: 'You have already reviewed this product' });
      }
    }

    const review = await Review.create({
      product: productId,
      user: userId,
      authorName: authorName.trim(),
      authorEmail: authorEmail ? authorEmail.trim().toLowerCase() : undefined,
      rating: Number(rating),
      title: title ? title.trim() : undefined,
      body: body.trim(),
      photos: reviewPhotos,
      verifiedPurchase,
    });

    res.status(201).json({ success: true, message: 'Review submitted successfully', review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this product' });
    }
    console.error('Submit review error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit review' });
  }
};

// GET /api/admin/reviews  — admin only
export const adminGetAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const reviews = await Review.find()
      .populate('product', 'name image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Review.countDocuments();
    res.status(200).json({ success: true, reviews, total: count });
  } catch (error) {
    console.error('Admin get reviews error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
};

// DELETE /api/admin/reviews/:id  — admin only
export const adminDeleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (error) {
    console.error('Admin delete review error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete review' });
  }
};

// PATCH /api/admin/reviews/:id/approve  — admin only
export const adminToggleReviewApproval = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    review.isApproved = !review.isApproved;
    await review.save();
    res.status(200).json({ success: true, isApproved: review.isApproved });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update review' });
  }
};

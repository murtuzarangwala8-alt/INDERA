import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // Store name even for guest/logged-in users so it persists if account deleted
  authorName: {
    type: String,
    required: true,
    trim: true,
  },
  authorEmail: {
    type: String,
    trim: true,
    lowercase: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    trim: true,
    maxlength: 120,
  },
  body: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  // Set to true if the user had a confirmed order containing this product
  verifiedPurchase: {
    type: Boolean,
    default: false,
  },
  isApproved: {
    type: Boolean,
    default: true, // auto-approve; set false to require moderation
  },
}, {
  timestamps: true,
});

// Prevent one user from reviewing the same product more than once
reviewSchema.index({ product: 1, authorEmail: 1 }, { unique: true, sparse: true });

// After a review is saved/deleted, recalculate the product's average rating
async function updateProductRating(productId) {
  const Product = mongoose.model('Product');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { product: productId, isApproved: true } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const avgRating = stats[0] ? Math.round(stats[0].avgRating * 10) / 10 : 0;
  const reviewCount = stats[0] ? stats[0].count : 0;
  await Product.findByIdAndUpdate(productId, { rating: avgRating, reviewCount });
}

reviewSchema.post('save', async function () {
  await updateProductRating(this.product);
});

reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) await updateProductRating(doc.product);
});

export default mongoose.model('Review', reviewSchema);

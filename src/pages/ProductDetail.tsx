import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Star, ArrowLeft, Minus, Plus, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import { fetchProductReviews, submitProductReview } from '../services/api';
import toast from 'react-hot-toast';


const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const products = useProducts();
  const product = products.find((p) => String(p.id) === id && p.isActive !== false && !p.hidden);

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, title: '', body: '', authorName: '', authorEmail: '', photos: [] as string[] });

  // Load reviews when product changes
  useEffect(() => {
    if (product?.id) {
      setReviewLoading(true);
      fetchProductReviews(String(product.id))
        .then((res) => {
          if (res.success) setReviews(res.reviews || []);
        })
        .finally(() => setReviewLoading(false));
    }
  }, [product?.id]);
  const { addToCart, toggleWishlist, wishlist } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>('');

  // Build the full images array — fall back to single image if no array
  const allImages = (product?.images?.length ? product.images : product?.image ? [product.image] : []);

  // Reset selected image when product changes
  useEffect(() => {
    if (allImages.length > 0) setSelectedImage(allImages[0]);
  }, [product?.id]);


  if (!product) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <p className="font-serif text-obsidian/40 text-3xl font-light mb-6">Piece not found</p>
          <button onClick={() => navigate('/products')} className="btn-outline">
            Back to Collections
          </button>
        </div>
      </div>
    );
  }

  const isWishlisted = wishlist.some((item) => item.id === product.id);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id && p.isActive !== false && !p.hidden).slice(0, 4);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addToCart(product);
  };

  return (
    <div className="min-h-screen bg-ivory pt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-obsidian/40 hover:text-gold-500 text-xs tracking-widest uppercase font-sans mb-10 transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col gap-4"
          >
            {/* Main image */}
            <div
              className="aspect-[4/5] overflow-hidden rounded-sm"
              style={{ boxShadow: '20px 20px 60px rgba(0,0,0,0.1)' }}
            >
              <motion.img
                key={selectedImage}
                src={selectedImage || product.image}
                alt={`${product.name} — ${product.category} by INDÉRA`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35 }}
              />
            </div>

            {/* Thumbnail strip — only shown when there are multiple images */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`flex-shrink-0 w-20 h-20 rounded-sm overflow-hidden transition-all duration-200 ${
                      (selectedImage || allImages[0]) === img
                        ? 'ring-2 ring-gold-400 ring-offset-2 ring-offset-ivory opacity-100'
                        : 'opacity-50 hover:opacity-80'
                    }`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={img} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex flex-col justify-center"
          >
            <p className="text-gold-500 text-[10px] tracking-[0.4em] uppercase font-sans mb-3">
              {product.category}
            </p>
            <h1 className="font-serif text-obsidian text-4xl lg:text-5xl font-light leading-tight mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={i < Math.floor(product.rating) ? 'fill-gold-400 text-gold-400' : 'text-sand'} />
                ))}
              </div>
              <span className="text-obsidian/40 text-xs font-sans">{product.rating} ({product.reviewCount} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-serif text-obsidian text-4xl font-light">€{product.price}</span>
              {product.originalPrice && (
                <span className="text-obsidian/30 text-xl line-through font-serif">€{product.originalPrice}</span>
              )}
            </div>

            <p className="text-obsidian/60 font-sans font-light text-base leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Specs */}
            <div className="border-t border-b border-obsidian/8 py-6 space-y-3 mb-8">
              {[
                { label: 'Material', value: product.material },
                { label: 'Origin', value: product.origin },
                { label: 'Availability', value: product.inStock ? 'In Stock' : 'Sold Out', highlight: product.inStock },
              ].map((spec) => (
                <div key={spec.label} className="flex justify-between items-center">
                  <span className="text-xs tracking-widest uppercase font-sans text-obsidian/40">{spec.label}</span>
                  <span className={`text-sm font-sans ${spec.highlight === false ? 'text-terracotta' : spec.highlight ? 'text-green-600' : 'text-obsidian/70'}`}>
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Quantity + CTA */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs tracking-widest uppercase font-sans text-obsidian/40">Qty</span>
                <div className="flex items-center border border-obsidian/15">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 hover:bg-sand/50 transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="px-6 font-serif text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 hover:bg-sand/50 transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowReviewForm(true)} className="btn-outline">
                  Write a Review
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1 btn-gold flex items-center justify-center gap-2 py-4 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShoppingBag size={16} />
                  {product.inStock ? 'Add to Bag' : 'Sold Out'}
                </button>
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`px-5 py-4 border transition-all ${
                    isWishlisted ? 'bg-gold-400 border-gold-400 text-obsidian' : 'border-obsidian/15 text-obsidian/50 hover:border-gold-400/50'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart size={18} className={isWishlisted ? 'fill-current' : ''} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Reviews Section ────────────────────────────── */}
        <div className="mt-20 border-t border-obsidian/8 pt-16">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-gold-500 text-[10px] tracking-[0.4em] uppercase font-sans mb-2">Customer Opinions</p>
              <h2 className="font-serif text-obsidian text-3xl font-light">
                Reviews {reviews.length > 0 && <span className="text-obsidian/30 text-2xl">({reviews.length})</span>}
              </h2>
            </div>
            <button
              onClick={() => setShowReviewForm(true)}
              className="btn-gold px-6 py-3 text-sm"
            >
              Write a Review
            </button>
          </div>

          {reviewLoading && (
            <p className="text-obsidian/40 font-sans text-sm text-center py-10">Loading reviews…</p>
          )}

          {!reviewLoading && reviews.length === 0 && (
            <div className="text-center py-16 border border-dashed border-obsidian/10 rounded-sm">
              <p className="font-serif text-obsidian/30 text-2xl font-light mb-3">No reviews yet</p>
              <p className="text-obsidian/40 text-sm font-sans">Be the first to share your experience</p>
            </div>
          )}

          <div className="space-y-8">
            {reviews.map((review: any) => (
              <div key={review._id} className="border-b border-obsidian/8 pb-8">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-sans font-medium text-obsidian text-sm">{review.authorName}</span>
                      {review.verifiedPurchase && (
                        <span className="text-[9px] tracking-widest uppercase font-sans px-2 py-0.5 border border-green-600/30 text-green-700">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={i < review.rating ? 'fill-gold-400 text-gold-400' : 'text-sand'} />
                      ))}
                    </div>
                  </div>
                  <span className="text-obsidian/30 text-xs font-sans flex-shrink-0">
                    {new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                {review.title && (
                  <p className="font-serif text-obsidian text-lg font-light mb-2">{review.title}</p>
                )}
                <p className="text-obsidian/60 font-sans text-sm leading-relaxed mb-4">{review.body}</p>
                {review.photos?.length > 0 && (
                  <div className="flex gap-3 flex-wrap">
                    {review.photos.map((photo: string, i: number) => (
                      <img
                        key={i}
                        src={photo}
                        alt={`Review photo ${i + 1}`}
                        className="w-24 h-24 object-cover rounded-sm cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => window.open(photo, '_blank')}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-24">
            <div className="text-center mb-12">
              <p className="text-gold-500 text-[10px] tracking-[0.4em] uppercase font-sans mb-3">You May Also Love</p>
              <h2 className="font-serif text-obsidian text-4xl font-light">Related Pieces</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>

    {/* ── Review Modal ────────────────────────────────────── */}
    {showReviewForm && (
      <div className="fixed inset-0 bg-obsidian/70 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-ivory w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl"
          style={{ border: '1px solid rgba(0,0,0,0.08)' }}
        >
          <div className="px-8 pt-8 pb-6 border-b border-obsidian/8 flex items-center justify-between">
            <div>
              <p className="text-gold-500 text-[10px] tracking-[0.4em] uppercase font-sans mb-1">Share Your Experience</p>
              <h2 className="font-serif text-obsidian text-2xl font-light">Write a Review</h2>
            </div>
            <button onClick={() => setShowReviewForm(false)} className="text-obsidian/30 hover:text-obsidian transition-colors p-1">
              <span className="sr-only">Close</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setReviewLoading(true);
              try {
                const res = await submitProductReview(String(product.id), {
                  rating: reviewData.rating,
                  title: reviewData.title,
                  body: reviewData.body,
                  authorName: reviewData.authorName,
                  authorEmail: reviewData.authorEmail,
                  photos: reviewData.photos,
                });
                if (res.success) {
                  toast.success('Review submitted — thank you!');
                  setShowReviewForm(false);
                  setReviewData({ rating: 5, title: '', body: '', authorName: '', authorEmail: '', photos: [] });
                  fetchProductReviews(String(product.id)).then(r => {
                    if (r.success) setReviews(r.reviews || []);
                  });
                } else {
                  toast.error(res.message || 'Failed to submit review');
                }
              } catch {
                toast.error('Could not submit review — check your connection');
              } finally {
                setReviewLoading(false);
              }
            }}
            className="p-8 space-y-6"
          >
            {/* Star Rating Selector */}
            <div>
              <label className="block text-[10px] tracking-widest uppercase font-sans text-obsidian/40 mb-3">Your Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      size={28}
                      className={star <= reviewData.rating ? 'fill-gold-400 text-gold-400' : 'text-obsidian/20'}
                    />
                  </button>
                ))}
                <span className="self-center text-obsidian/50 text-sm font-sans ml-2">
                  {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][reviewData.rating]}
                </span>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-[10px] tracking-widest uppercase font-sans text-obsidian/40 mb-2">Review Title</label>
              <input
                type="text"
                value={reviewData.title}
                onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })}
                placeholder="Summarise your experience"
                className="w-full bg-transparent border border-obsidian/15 text-obsidian placeholder-obsidian/25 px-4 py-3 text-sm font-sans outline-none focus:border-gold-500/50 transition-colors"
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-[10px] tracking-widest uppercase font-sans text-obsidian/40 mb-2">Your Review <span className="text-terracotta">*</span></label>
              <textarea
                value={reviewData.body}
                onChange={(e) => setReviewData({ ...reviewData, body: e.target.value })}
                placeholder="Tell others about your experience with this piece…"
                className="w-full bg-transparent border border-obsidian/15 text-obsidian placeholder-obsidian/25 px-4 py-3 text-sm font-sans outline-none focus:border-gold-500/50 transition-colors resize-none"
                rows={4}
                required
              />
            </div>

            {/* Name & Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] tracking-widest uppercase font-sans text-obsidian/40 mb-2">Your Name <span className="text-terracotta">*</span></label>
                <input
                  type="text"
                  value={reviewData.authorName}
                  onChange={(e) => setReviewData({ ...reviewData, authorName: e.target.value })}
                  placeholder="Jane"
                  className="w-full bg-transparent border border-obsidian/15 text-obsidian placeholder-obsidian/25 px-4 py-3 text-sm font-sans outline-none focus:border-gold-500/50 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-widest uppercase font-sans text-obsidian/40 mb-2">Email (optional)</label>
                <input
                  type="email"
                  value={reviewData.authorEmail}
                  onChange={(e) => setReviewData({ ...reviewData, authorEmail: e.target.value })}
                  placeholder="jane@email.com"
                  className="w-full bg-transparent border border-obsidian/15 text-obsidian placeholder-obsidian/25 px-4 py-3 text-sm font-sans outline-none focus:border-gold-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-[10px] tracking-widest uppercase font-sans text-obsidian/40 mb-2">
                Add Photos <span className="normal-case text-obsidian/30">(optional, max 5)</span>
              </label>
              <div
                className="border-2 border-dashed border-obsidian/15 rounded-sm p-5 text-center cursor-pointer hover:border-gold-500/40 transition-colors"
                onClick={() => document.getElementById('review-photo-input')?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')).slice(0, 5 - reviewData.photos.length);
                  files.forEach(file => {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const result = ev.target?.result as string;
                      setReviewData(prev => ({ ...prev, photos: [...prev.photos, result].slice(0, 5) }));
                    };
                    reader.readAsDataURL(file);
                  });
                }}
              >
                <input
                  id="review-photo-input"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []).slice(0, 5 - reviewData.photos.length);
                    files.forEach(file => {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const result = ev.target?.result as string;
                        setReviewData(prev => ({ ...prev, photos: [...prev.photos, result].slice(0, 5) }));
                      };
                      reader.readAsDataURL(file);
                    });
                  }}
                />
                <svg className="mx-auto mb-2 text-obsidian/20" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <p className="text-obsidian/40 text-xs font-sans">Drag & drop or click to upload photos</p>
              </div>

              {/* Photo previews */}
              {reviewData.photos.length > 0 && (
                <div className="flex gap-3 mt-3 flex-wrap">
                  {reviewData.photos.map((photo, i) => (
                    <div key={i} className="relative group">
                      <img src={photo} alt={`Upload ${i + 1}`} className="w-20 h-20 object-cover rounded-sm" />
                      <button
                        type="button"
                        onClick={() => setReviewData(prev => ({ ...prev, photos: prev.photos.filter((_, idx) => idx !== i) }))}
                        className="absolute -top-2 -right-2 bg-terracotta text-ivory rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={reviewLoading} className="btn-gold flex-1 py-4 disabled:opacity-50">
                {reviewLoading ? 'Submitting…' : 'Submit Review'}
              </button>
              <button type="button" onClick={() => setShowReviewForm(false)} className="btn-outline px-8 py-4">
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    )}
  </div>
  );
};

export default ProductDetail;


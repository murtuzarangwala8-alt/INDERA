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
  const [, setReviews] = useState<any[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, title: '', body: '', authorName: '', authorEmail: '' });

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
{showReviewForm && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-ivory p-6 rounded-md w-full max-w-md">
      <h2 className="text-obsidian text-xl mb-4">Write a Review</h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setReviewLoading(true);
          const payload = {
            rating: reviewData.rating,
            title: reviewData.title,
            body: reviewData.body,
            authorName: reviewData.authorName,
            authorEmail: reviewData.authorEmail,
          };
          const res = await submitProductReview(String(product.id), payload);
          if (res.success) {
            toast.success('Review submitted');
            setShowReviewForm(false);
            // Refresh reviews
            fetchProductReviews(String(product.id)).then(r => {
              if (r.success) setReviews(r.reviews || []);
            });
          } else {
            toast.error(res.message || 'Failed to submit review');
          }
          setReviewLoading(false);
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-obsidian mb-1">Rating</label>
          <select
            value={reviewData.rating}
            onChange={(e) => setReviewData({ ...reviewData, rating: Number(e.target.value) })}
            className="w-full border p-2 rounded"
          >
            {[5,4,3,2,1].map((v) => (
              <option key={v} value={v}>{v} Stars</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-obsidian mb-1">Title</label>
          <input
            type="text"
            value={reviewData.title}
            onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-obsidian mb-1">Review</label>
          <textarea
            value={reviewData.body}
            onChange={(e) => setReviewData({ ...reviewData, body: e.target.value })}
            className="w-full border p-2 rounded"
            rows={4}
            required
          />
        </div>
        <div>
          <label className="block text-obsidian mb-1">Your Name</label>
          <input
            type="text"
            value={reviewData.authorName}
            onChange={(e) => setReviewData({ ...reviewData, authorName: e.target.value })}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-obsidian mb-1">Email</label>
          <input
            type="email"
            value={reviewData.authorEmail}
            onChange={(e) => setReviewData({ ...reviewData, authorEmail: e.target.value })}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <button
          type="submit"
          disabled={reviewLoading}
          className="btn-gold w-full"
        >
          {reviewLoading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
      <button
        onClick={() => setShowReviewForm(false)}
        className="mt-4 btn-outline w-full"
      >
        Cancel
      </button>
    </div>
  </div>
)}
            </div>
          </motion.div>
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
  );
};

export default ProductDetail;

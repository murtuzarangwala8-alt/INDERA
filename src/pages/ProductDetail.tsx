import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Star, ArrowLeft, Minus, Plus, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const products = useProducts();
  const product = products.find((p) => String(p.id) === id);
  const { addToCart, toggleWishlist, wishlist } = useCart();
  const [quantity, setQuantity] = useState(1);

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
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

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
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div
              className="aspect-[4/5] overflow-hidden rounded-sm"
              style={{ boxShadow: '20px 20px 60px rgba(0,0,0,0.1)' }}
            >
              <img
                src={product.image}
                alt={`${product.name} — ${product.category} by INDÉRA`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
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

import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { addToCart, toggleWishlist, wishlist } = useCart();
  const isWishlisted = wishlist.some((item) => item.id === product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="product-card-3d group relative bg-ivory rounded-sm overflow-hidden"
      style={{ border: '1px solid rgba(201,168,76,0.15)' }}
    >
      {/* Image */}
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden aspect-[3/4]">
        <img
          src={product.image}
          alt={`${product.name} — ${product.category} by INDÉRA`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
          style={{ transition: 'transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-obsidian/0 group-hover:bg-obsidian/20 transition-all duration-500" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="bg-obsidian text-gold-400 text-[9px] tracking-[0.2em] uppercase font-sans px-2.5 py-1">
              New
            </span>
          )}
          {product.isBestseller && (
            <span className="bg-gold-400 text-obsidian text-[9px] tracking-[0.2em] uppercase font-sans px-2.5 py-1 font-medium">
              Bestseller
            </span>
          )}
          {!product.inStock && (
            <span className="bg-terracotta/90 text-ivory text-[9px] tracking-[0.2em] uppercase font-sans px-2.5 py-1">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
            isWishlisted
              ? 'bg-gold-400 text-obsidian'
              : 'bg-ivory/80 text-obsidian/60 md:opacity-0 md:group-hover:opacity-100 opacity-100'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={14} className={isWishlisted ? 'fill-current' : ''} />
        </button>

        {/* Quick Add */}
        <div className="absolute bottom-0 left-0 right-0 md:translate-y-full md:group-hover:translate-y-0 translate-y-0 transition-transform duration-400 z-10">
          <button
            onClick={(e) => { e.preventDefault(); if (product.inStock) addToCart(product); }}
            disabled={!product.inStock}
            className="w-full py-2.5 md:py-3 flex items-center justify-center gap-2 text-[10px] tracking-[0.25em] uppercase font-sans font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #C9A84C 0%, #E8C97A 50%, #B8960C 100%)',
              color: '#0D0D0D',
            }}
          >
            <ShoppingBag size={13} />
            {product.inStock ? 'Quick Add' : 'Sold Out'}
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <p className="text-gold-500 text-[9px] tracking-[0.3em] uppercase font-sans mb-1.5">
          {product.category}
        </p>

        <Link to={`/product/${product.id}`}>
          <h3 className="font-serif text-obsidian text-lg font-light leading-tight hover:text-gold-500 transition-colors mb-1">
            {product.name}
          </h3>
        </Link>

        <p className="text-obsidian/40 text-xs font-sans mb-3">{product.origin}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={10}
                  className={i < Math.floor(product.rating) ? 'fill-gold-400 text-gold-400' : 'text-sand'}
                />
              ))}
            </div>
            <span className="text-obsidian/40 text-[10px] font-sans">({product.reviewCount})</span>
          </div>

          <div className="text-right">
            {product.originalPrice && (
              <p className="text-obsidian/30 text-xs line-through font-sans">€{product.originalPrice}</p>
            )}
            <p className="font-serif text-obsidian text-xl font-light">€{product.price}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;

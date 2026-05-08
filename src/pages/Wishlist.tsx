import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

const Wishlist: React.FC = () => {
  const { wishlist } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-ivory pt-20 flex items-center justify-center">
        <div className="text-center">
          <Heart size={48} className="mx-auto mb-6 text-obsidian/15" />
          <h2 className="font-serif text-obsidian text-3xl font-light mb-3">Your wishlist is empty</h2>
          <p className="text-obsidian/40 font-sans text-sm mb-8">Save pieces you love and come back to them anytime.</p>
          <Link to="/products" className="btn-gold">Explore Collections</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory pt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-10">
            <p className="text-gold-500 text-[10px] tracking-[0.4em] uppercase font-sans mb-2">Saved</p>
            <h1 className="font-serif text-obsidian text-4xl font-light">
              My Wishlist
              <span className="text-obsidian/30 ml-3 text-2xl">({wishlist.length})</span>
            </h1>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Wishlist;

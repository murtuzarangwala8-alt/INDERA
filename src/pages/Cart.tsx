import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();
  const shipping = 0;
  const total = cartTotal;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-ivory pt-20 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={48} className="mx-auto mb-6 text-obsidian/20" />
          <h2 className="font-serif text-obsidian text-3xl font-light mb-3">Your bag is empty</h2>
          <p className="text-obsidian/40 font-sans text-sm mb-8">Discover our collections and find your perfect piece.</p>
          <Link to="/products" className="btn-gold">Explore Collections</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory pt-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-serif text-obsidian text-4xl font-light mb-10">Shopping Bag</h1>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-5 bg-white p-5 border border-obsidian/6"
                  style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
                >
                  <Link to={`/product/${item.id}`} className="flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-24 h-28 object-cover" />
                  </Link>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-gold-500 text-[9px] tracking-widest uppercase font-sans mb-1">{item.category}</p>
                      <Link to={`/product/${item.id}`}>
                        <h3 className="font-serif text-obsidian text-lg font-light hover:text-gold-500 transition-colors">{item.name}</h3>
                      </Link>
                      <p className="text-obsidian/40 text-xs font-sans mt-0.5">{item.origin}</p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-obsidian/12">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-2 hover:bg-sand/50 transition-colors">
                          <Minus size={12} />
                        </button>
                        <span className="px-4 font-serif text-base">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-2 hover:bg-sand/50 transition-colors">
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-serif text-obsidian text-xl font-light">€{(item.price * item.quantity).toLocaleString()}</span>
                        <button onClick={() => removeFromCart(item.id)} className="text-obsidian/20 hover:text-terracotta transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-obsidian/6 p-6 sticky top-28" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                <h2 className="font-serif text-obsidian text-2xl font-light mb-6">Order Summary</h2>
                <div className="space-y-3 mb-6 text-sm font-sans">
                  <div className="flex justify-between text-obsidian/60">
                    <span>Subtotal</span>
                    <span>€{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-obsidian/60">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t border-obsidian/8 pt-3 flex justify-between">
                    <span className="font-serif text-obsidian text-lg">Total</span>
                    <span className="font-serif text-obsidian text-xl">€{total.toLocaleString()}</span>
                  </div>
                </div>
                <button onClick={() => navigate('/checkout')} className="btn-gold w-full py-4 mb-3">
                  Proceed to Checkout
                </button>
                <Link to="/products" className="block text-center text-xs tracking-widest uppercase font-sans text-obsidian/40 hover:text-gold-500 transition-colors mt-4">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Cart;

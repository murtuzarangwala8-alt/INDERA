import React, { useState, useEffect, useCallback, memo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, Search, Menu, X, User, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cart, wishlist } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close menu on route change
  useEffect(() => { 
    setIsOpen(false); 
  }, [location.pathname]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 30);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  }, [searchQuery, navigate]);

  const navLinks = [
    { label: 'Collections', href: '/products' },
    { label: 'Story', href: '/about' },
    { label: 'Lookbook', href: '/products?category=lookbook' },
    { label: 'Returns & Claims', href: '/returns' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b border-transparent bg-transparent ${
          scrolled 
            ? 'py-3' 
            : 'py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-24 lg:h-28">
            
            {/* Brand Logo (Top Left & Enlarged by 20%) */}
            <Link to="/" className="flex flex-col items-start justify-center leading-none h-24 lg:h-28 min-w-[220px]">
              <img 
                src="/logo.png" 
                alt="INDÉRA Logo" 
                className="max-h-20 lg:max-h-24 w-auto object-contain transition-all hover:opacity-85" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = document.getElementById('indera-logo-fallback');
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div id="indera-logo-fallback" className="hidden flex-col items-start">
                <span className="font-serif text-3xl lg:text-4xl font-light tracking-[0.25em] text-ivory">
                  INDÉRA
                </span>
                <span className="text-[10px] tracking-[0.45em] text-gold-400 uppercase font-sans font-light mt-1.5">
                  Indo-European Atelier
                </span>
              </div>
            </Link>

            {/* Minimal Toggle (Global Hamburger - Top Right & Enlarged with Black Background) */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-black border border-gold-400/25 text-ivory hover:text-gold-400 hover:border-gold-400/50 shadow-2xl transition-all duration-300 hover:scale-105"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

          </div>
        </div>

        {/* Global Navigation Dropdown Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-black/98 backdrop-blur-xl border-t border-gold-400/10 overflow-hidden"
            >
              <div className="max-w-md mx-auto px-6 py-12 space-y-4 text-center">
                {/* Standard Editorial Nav Links */}
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.href.split('?')[0];
                  return (
                    <Link
                      key={link.label}
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`block py-3.5 text-xs tracking-[0.4em] uppercase font-sans transition-colors ${
                        isActive ? 'text-gold-400' : 'text-ivory/75 hover:text-gold-400'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                {/* Fine luxury divider */}
                <div className="w-16 h-[1px] bg-gold-400/25 mx-auto my-6" />

                {/* Integrated Customer Portals */}
                
                {/* 1. Integrated Search Trigger */}
                <button
                  onClick={() => { setIsOpen(false); setSearchOpen(true); }}
                  className="w-full flex items-center justify-center gap-2 py-3 text-xs tracking-[0.3em] uppercase font-sans text-ivory/75 hover:text-gold-400 transition-colors"
                >
                  <Search size={14} /> Search catalog
                </button>

                {/* 2. My Orders & Profile */}
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/account"
                      onClick={() => setIsOpen(false)}
                      className="block py-3 text-xs tracking-[0.3em] uppercase font-sans text-ivory/75 hover:text-gold-400 transition-colors"
                    >
                      <User size={14} className="inline mr-1.5" /> My Account & Orders
                    </Link>
                    <button
                      onClick={() => { logout(); setIsOpen(false); }}
                      className="w-full py-3 text-xs tracking-[0.3em] uppercase font-sans text-terracotta/75 hover:text-terracotta transition-colors"
                    >
                      <LogOut size={14} className="inline mr-1.5" /> Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block py-3 text-xs tracking-[0.3em] uppercase font-sans text-ivory/75 hover:text-gold-400 transition-colors"
                  >
                    <User size={14} className="inline mr-1.5" /> Sign In / Register
                  </Link>
                )}

                {/* 3. Integrated Wishlist */}
                <Link
                  to="/wishlist"
                  onClick={() => setIsOpen(false)}
                  className="block py-3 text-xs tracking-[0.3em] uppercase font-sans text-ivory/75 hover:text-gold-400 transition-colors"
                >
                  <Heart size={14} className="inline mr-1.5" /> Wishlist {wishlist.length > 0 && `(${wishlist.length})`}
                </Link>

                {/* 4. Integrated Shopping Bag */}
                <Link
                  to="/cart"
                  onClick={() => setIsOpen(false)}
                  className="block py-3 text-xs tracking-[0.3em] uppercase font-sans text-ivory/75 hover:text-gold-400 transition-colors"
                >
                  <ShoppingBag size={14} className="inline mr-1.5" /> Shopping Bag {cartCount > 0 && `(${cartCount})`}
                </Link>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Global Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-start justify-center pt-36 px-6 bg-obsidian/95 backdrop-blur-xl"
            onClick={() => setSearchOpen(false)}
          >
            <motion.form
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              exit={{ y: -20 }}
              onSubmit={handleSearch}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-transparent"
            >
              <div className="flex items-center border-b border-gold-400/40 pb-4">
                <Search size={18} className="text-gold-400 mr-4 flex-shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search collections, material, pearls..."
                  className="flex-1 bg-transparent text-ivory text-xl lg:text-2xl font-serif font-light outline-none placeholder-ivory/20"
                />
                <button 
                  type="button" 
                  onClick={() => setSearchOpen(false)} 
                  className="text-ivory/30 hover:text-gold-400 ml-4 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-ivory/30 text-[9px] tracking-[0.3em] uppercase mt-4 font-sans">
                Press enter to perform deep search
              </p>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default memo(Navbar);

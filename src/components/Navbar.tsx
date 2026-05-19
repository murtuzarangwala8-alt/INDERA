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
    { label: 'Home', href: '/' },
    { label: 'Collections', href: '/products' },
    { label: 'Story', href: '/about' },
    { label: 'Lookbook', href: '/products?category=lookbook' },
    { label: 'Returns & Claims', href: '/returns' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-700 pt-[calc(env(safe-area-inset-top)+24px)] pb-4 md:py-5 bg-gradient-to-b from-black/60 via-black/30 to-transparent border-b border-transparent"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-14 md:h-28">
            
            <Link 
              to="/" 
              className={`absolute left-1/2 -translate-x-1/2 md:relative md:left-0 md:translate-x-0 flex flex-col items-center md:items-start justify-center leading-none h-14 md:h-28 min-w-0 md:min-w-[220px] transition-all duration-700 ${
                scrolled ? 'opacity-0 pointer-events-none translate-y-[-10px]' : 'opacity-100'
              }`}
            >
              <img 
                src="/logo.png" 
                alt="INDÉRA Logo" 
                className="max-h-8 md:max-h-24 w-auto object-contain transition-all hover:opacity-95 filter drop-shadow-[0_0_8px_rgba(201,168,76,0.15)] hover:drop-shadow-[0_0_16px_rgba(201,168,76,0.35)] duration-500"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = document.getElementById('indera-logo-fallback');
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div id="indera-logo-fallback" className="hidden flex-col items-center md:items-start select-none">
                <span className="font-serif text-xl md:text-4xl font-light tracking-[0.25em] text-ivory drop-shadow-[0_0_8px_rgba(201,168,76,0.2)]">
                  INDÉRA
                </span>
                <span className="tracking-[0.45em] text-gold-400 uppercase font-sans font-light mt-1 text-[7px] md:text-[10px]">
                  Indo-European Atelier
                </span>
              </div>
            </Link>

            {/* Minimal Toggle (Global Hamburger - Borderless, Floating & Ultra-thin Line) */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="absolute right-0 top-1/2 -translate-y-1/2 md:relative md:right-auto md:top-auto md:translate-y-0 flex items-center justify-center p-3 text-ivory hover:text-gold-400 transition-all duration-300 hover:scale-105 group relative z-50"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X size={26} strokeWidth={1.2} className="transform group-hover:rotate-90 transition-transform duration-500" />
              ) : (
                <Menu size={26} strokeWidth={1.2} className="transform transition-transform duration-500" />
              )}
            </button>

          </div>
        </div>

        {/* Global Navigation Dropdown Fullscreen Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-40 flex flex-col justify-center items-center px-6 overflow-y-auto"
              style={{
                minHeight: '100dvh',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.92), rgba(8,6,4,0.95), rgba(0,0,0,0.97))',
                backdropFilter: 'blur(22px)',
                WebkitBackdropFilter: 'blur(22px)',
              }}
            >
              {/* Luxury Ambient Radial Vignette */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at center, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.82) 100%)',
                }}
              />

              {/* Subtly Visible Organic Film Grain Noise Overlay */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
                style={{
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
                }}
              />

              {/* Centered Editorial Navigation Menu Card */}
              <div 
                className="relative w-full max-w-md mx-auto py-12 px-8 rounded-lg bg-black/35 border border-gold-400/10 space-y-4 text-center z-10 transition-all duration-300"
                style={{
                  boxShadow: '0 0 80px rgba(0,0,0,0.65)',
                }}
              >
                {/* Standard Editorial Nav Links */}
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.href.split('?')[0];
                  return (
                    <div key={link.label} className="relative py-1 overflow-hidden">
                      {/* Gold Glow Behind Active Item */}
                      {isActive && (
                        <motion.div 
                          layoutId="activeGlow"
                          className="absolute inset-0 -z-10 bg-[#c6a45c]/5 blur-lg rounded-full pointer-events-none" 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                      
                      <Link
                        to={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`relative block py-2.5 text-[11px] sm:text-xs tracking-[0.45em] uppercase font-sans font-medium transition-all duration-300 ${
                          isActive ? 'text-[#c6a45c] scale-105' : 'text-white/80 hover:text-[#c6a45c] hover:scale-102'
                        }`}
                      >
                        {link.label}
                      </Link>
                    </div>
                  );
                })}

                {/* Fine luxury divider */}
                <div className="w-12 h-[1px] bg-gold-400/20 mx-auto my-6" />

                {/* Integrated Customer Portals */}
                <div className="space-y-3 pt-2">
                  {/* 1. Integrated Search Trigger */}
                  <button
                    onClick={() => { setIsOpen(false); setSearchOpen(true); }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-[10px] tracking-[0.3em] uppercase font-sans text-white/70 hover:text-[#c6a45c] transition-colors duration-300"
                  >
                    <Search size={13} className="text-gold-400/70" /> Search catalog
                  </button>

                  {/* 2. My Orders & Profile */}
                  {isAuthenticated ? (
                    <>
                      <Link
                        to="/account"
                        onClick={() => setIsOpen(false)}
                        className="block py-2.5 text-[10px] tracking-[0.3em] uppercase font-sans text-white/70 hover:text-[#c6a45c] transition-colors duration-300"
                      >
                        <User size={13} className="inline mr-1.5 text-gold-400/70" /> My Account & Orders
                      </Link>
                      <button
                        onClick={() => { logout(); setIsOpen(false); }}
                        className="w-full py-2.5 text-[10px] tracking-[0.3em] uppercase font-sans text-terracotta/75 hover:text-terracotta transition-colors duration-300"
                      >
                        <LogOut size={13} className="inline mr-1.5" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="block py-2.5 text-[10px] tracking-[0.3em] uppercase font-sans text-white/70 hover:text-[#c6a45c] transition-colors duration-300"
                    >
                      <User size={13} className="inline mr-1.5 text-gold-400/70" /> Sign In / Register
                    </Link>
                  )}

                  {/* 3. Integrated Wishlist */}
                  <Link
                    to="/wishlist"
                    onClick={() => setIsOpen(false)}
                    className="block py-2.5 text-[10px] tracking-[0.3em] uppercase font-sans text-white/70 hover:text-[#c6a45c] transition-colors duration-300"
                  >
                    <Heart size={13} className="inline mr-1.5 text-gold-400/70" /> Wishlist {wishlist.length > 0 && `(${wishlist.length})`}
                  </Link>

                  {/* 4. Integrated Shopping Bag */}
                  <Link
                    to="/cart"
                    onClick={() => setIsOpen(false)}
                    className="block py-2.5 text-[10px] tracking-[0.3em] uppercase font-sans text-white/70 hover:text-[#c6a45c] transition-colors duration-300"
                  >
                    <ShoppingBag size={13} className="inline mr-1.5 text-gold-400/70" /> Shopping Bag {cartCount > 0 && `(${cartCount})`}
                  </Link>
                </div>

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

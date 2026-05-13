import React, { useState, useEffect, useCallback, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Search, Menu, X, User, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountOpen, setAccountOpen] = useState(false);
  const { cart, wishlist } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 40);
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
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-obsidian/95 backdrop-blur-md shadow-lg' : 'bg-obsidian/30 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex flex-col leading-none">
              <span className="font-serif text-2xl font-light tracking-[0.2em] text-ivory">
                INDÉRA
              </span>
              <span className="text-[9px] tracking-[0.35em] text-gold-400 uppercase font-sans font-light">
                Indo-European Jewelry
              </span>
            </Link>



            {/* Icons */}
            <div className="flex items-center space-x-5">
              <button
                onClick={() => setSearchOpen(true)}
                className="text-ivory/80 hover:text-gold-400 transition-colors"
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              <Link to="/wishlist" className="relative text-ivory/80 hover:text-gold-400 transition-colors" aria-label="Wishlist">
                <Heart size={18} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-gold-400 text-obsidian text-[9px] font-bold flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Account */}
              <div className="relative">
                <button
                  onClick={() => isAuthenticated ? setAccountOpen(!accountOpen) : navigate('/login')}
                  className="text-ivory/80 hover:text-gold-400 transition-colors"
                  aria-label="Account"
                >
                  <User size={18} />
                </button>
                {accountOpen && isAuthenticated && (
                  <div
                    className="absolute right-0 top-8 w-52 glass-dark rounded-sm py-2 shadow-xl"
                    style={{ border: '1px solid rgba(201,168,76,0.15)', zIndex: 60 }}
                  >
                    <div className="px-4 py-3 border-b border-ivory/5">
                      <p className="text-ivory text-sm font-serif">{user?.firstName} {user?.lastName}</p>
                      <p className="text-ivory/30 text-[10px] font-sans truncate">{user?.email}</p>
                    </div>
                    <Link to="/account" onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-ivory/60 hover:text-gold-400 text-xs font-sans tracking-widest uppercase transition-colors">
                      <User size={13} /> My Account
                    </Link>
                    <button onClick={() => { logout(); setAccountOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-ivory/60 hover:text-terracotta text-xs font-sans tracking-widest uppercase transition-colors">
                      <LogOut size={13} /> Sign Out
                    </button>
                  </div>
                )}
              </div>

              <Link to="/cart" className="relative text-ivory/80 hover:text-gold-400 transition-colors" aria-label="Cart">
                <ShoppingBag size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-gold-400 text-obsidian text-[9px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-ivory/80 hover:text-gold-400 transition-colors"
                aria-label="Menu"
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Hamburger Menu */}
        {isOpen && (
          <div className="glass-dark border-t border-gold-400/10">
            <div className="px-6 py-6 space-y-5">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block text-xs tracking-[0.25em] uppercase font-sans text-ivory/80 hover:text-gold-400 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Search Overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center pt-32 px-6 bg-obsidian/90 backdrop-blur-md"
          onClick={() => setSearchOpen(false)}
        >
          <form
            onSubmit={handleSearch}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl"
          >
            <div className="flex items-center border-b border-gold-400/50 pb-3">
              <Search size={20} className="text-gold-400 mr-4 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jewelry, collections..."
                className="flex-1 bg-transparent text-ivory text-xl font-serif font-light outline-none placeholder-ivory/30"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="text-ivory/40 hover:text-ivory ml-4">
                <X size={20} />
              </button>
            </div>
            <p className="text-ivory/30 text-xs tracking-widest uppercase mt-4 font-sans">
              Press Enter to search
            </p>
          </form>
        </div>
      )}
    </>
  );
};

export default memo(Navbar);

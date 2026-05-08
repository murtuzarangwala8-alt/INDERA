import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';

// Pinterest icon (not in lucide)
const PinterestIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
  </svg>
);
const TikTokIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
  </svg>
);

const Footer: React.FC = () => {
  return (
    <footer className="bg-obsidian text-ivory">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-10 mb-16">

          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex flex-col leading-none mb-5">
              <span className="font-serif text-2xl font-light tracking-[0.2em]">INDÉRA</span>
              <span className="text-[9px] tracking-[0.35em] text-gold-400 uppercase font-sans font-light mt-0.5">
                Indo-European Jewelry
              </span>
            </Link>
            <p className="text-ivory/40 text-sm font-sans font-light leading-relaxed max-w-xs">
              Premium Indo-European jewelry crafted between cultures.
              Modern Indian heritage reimagined for Europe.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="https://instagram.com/indera" target="_blank" rel="noopener noreferrer"
                className="text-ivory/40 hover:text-gold-400 transition-colors" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="https://pinterest.com/indera" target="_blank" rel="noopener noreferrer"
                className="text-ivory/40 hover:text-gold-400 transition-colors" aria-label="Pinterest">
                <PinterestIcon />
              </a>
              <a href="https://tiktok.com/@indera" target="_blank" rel="noopener noreferrer"
                className="text-ivory/40 hover:text-gold-400 transition-colors" aria-label="TikTok">
                <TikTokIcon />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-[10px] tracking-[0.3em] uppercase font-sans text-ivory/50 mb-5">Shop</h4>
            <ul className="space-y-3">
              {['Minimal Jhumkas', 'Pearl Fusion', 'Indo-European Necklaces', 'Modern Kundan', 'Festival Sets'].map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/products?category=${encodeURIComponent(cat)}`}
                    className="text-ivory/50 hover:text-gold-400 text-sm font-sans font-light transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-[10px] tracking-[0.3em] uppercase font-sans text-ivory/50 mb-5">About</h4>
            <ul className="space-y-3">
              {[
                { label: 'Our Story', href: '/about' },
                { label: 'Artisans', href: '/about#artisans' },
                { label: 'Sustainability', href: '/about#sustainability' },
                { label: 'Contact', href: '/contact' },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-ivory/50 hover:text-gold-400 text-sm font-sans font-light transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-[10px] tracking-[0.3em] uppercase font-sans text-ivory/50 mb-5">Help</h4>
            <ul className="space-y-3">
              {[
                { label: 'Shipping to Europe', href: '/shipping' },
                { label: 'Returns & Exchanges', href: '/returns' },
                { label: 'Size Guide', href: '/size-guide' },
                { label: 'Care Instructions', href: '/care' },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-ivory/50 hover:text-gold-400 text-sm font-sans font-light transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-ivory/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-ivory/20 text-xs font-sans">
            © 2024 INDÉRA. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
              <Link key={item} to="#" className="text-ivory/20 hover:text-ivory/50 text-xs font-sans transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

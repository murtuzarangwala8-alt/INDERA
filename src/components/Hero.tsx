import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section 
      className="relative flex items-center overflow-hidden bg-[#0b0b0b] -mt-36"
      style={{
        minHeight: '100dvh',
        paddingTop: 'calc(env(safe-area-inset-top) + 11rem)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 3rem)',
      }}
    >

      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover brightness-[0.45]"
        style={{ willChange: 'auto' }}
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      {/* Extreme Premium Editorial Contrast Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b] via-transparent to-black/30" />

      {/* Decorative gold orb */}
      <div 
        className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.06), transparent)' }} 
      />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 w-full z-10">
        <div className="max-w-2xl py-12 md:py-24">

          <h1 
            className="font-serif text-ivory leading-[1.08] mb-4 sm:mb-6 animate-fade-in-up"
            style={{ fontSize: 'clamp(2.3rem, 7.5vw, 5.5rem)', fontWeight: 300, animationDelay: '0.2s' }}
          >
            Indian Heritage.
            <br />
            <em className="gold-text not-italic">European</em>
            <br />
            Elegance.
          </h1>

          <p className="text-ivory/70 font-sans font-light leading-relaxed mb-8 sm:mb-10 max-w-md animate-fade-in-up"
            style={{ fontSize: 'clamp(0.9rem, 2vw, 1.125rem)', animationDelay: '0.4s' }}
          >
            Premium Indo-European jewelry crafted between cultures.
            Where Jaipur's artisan hands meet Milan's refined eye.
          </p>

          <div 
            className="flex flex-wrap gap-4 animate-fade-in-up"
            style={{ animationDelay: '0.6s' }}
          >
            <Link to="/products" className="btn-gold group px-6 sm:px-8 py-3 text-[10px] sm:text-xs">
              Shop Collection
              <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/about" className="btn-outline px-6 sm:px-8 py-3 text-[10px] sm:text-xs">
              Explore Story
            </Link>
          </div>

          {/* Stats - Responsive Wrapping to prevent mobile overflow */}
          <div 
            className="flex flex-wrap gap-6 sm:gap-10 mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-ivory/10 animate-fade-in"
            style={{ animationDelay: '0.8s' }}
          >
            {[
              { value: '2,400+', label: 'Pieces Crafted' },
              { value: '18', label: 'Artisan Families' },
              { value: '4', label: 'Cities' },
            ].map((stat) => (
              <div key={stat.label} className="min-w-[100px] flex-1 sm:flex-none">
                <p className="font-serif text-xl sm:text-2xl text-gold-400 font-light">{stat.value}</p>
                <p className="text-ivory/50 text-[9px] sm:text-xs tracking-widest uppercase font-sans mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div 
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in"
        style={{ animationDelay: '1s' }}
      >
        <span className="text-ivory/30 text-[9px] tracking-[0.4em] uppercase font-sans">Scroll</span>
        <div className="w-px h-6 sm:h-8 bg-gradient-to-b from-gold-400/60 to-transparent animate-bounce-slow" />
      </div>
    </section>
  );
};

export default memo(Hero);

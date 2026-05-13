import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-obsidian -mt-20 pt-20">

      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover brightness-50"
        style={{ willChange: 'auto' }}
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-obsidian/80 via-obsidian/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 via-transparent to-transparent" />

      {/* Decorative gold orb */}
      <div 
        className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-8 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #C9A84C, transparent)' }} 
      />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 w-full z-10">
        <div className="max-w-2xl py-40">

          <p className="text-gold-400 text-xs tracking-[0.45em] uppercase font-sans mb-6 animate-fade-in">
            New Collection 2024
          </p>

          <h1 
            className="font-serif text-ivory leading-[1.08] mb-6 animate-fade-in-up"
            style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)', fontWeight: 300, animationDelay: '0.2s' }}
          >
            Indian Heritage.
            <br />
            <em className="gold-text not-italic">European</em>
            <br />
            Elegance.
          </h1>

          <p 
            className="text-ivory/60 font-sans font-light text-lg leading-relaxed mb-10 max-w-md animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
          >
            Premium Indo-European jewelry crafted between cultures.
            Where Jaipur's artisan hands meet Milan's refined eye.
          </p>

          <div 
            className="flex flex-wrap gap-4 animate-fade-in-up"
            style={{ animationDelay: '0.6s' }}
          >
            <Link to="/products" className="btn-gold group">
              Shop Collection
              <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/about" className="btn-outline">
              Explore Story
            </Link>
          </div>

          {/* Stats */}
          <div 
            className="flex gap-10 mt-16 pt-10 border-t border-ivory/10 animate-fade-in"
            style={{ animationDelay: '0.8s' }}
          >
            {[
              { value: '2,400+', label: 'Pieces Crafted' },
              { value: '18', label: 'Artisan Families' },
              { value: '4', label: 'Heritage Cities' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-serif text-2xl text-gold-400 font-light">{stat.value}</p>
                <p className="text-ivory/40 text-xs tracking-widest uppercase font-sans mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in"
        style={{ animationDelay: '1s' }}
      >
        <span className="text-ivory/30 text-[9px] tracking-[0.4em] uppercase font-sans">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-gold-400/60 to-transparent animate-bounce-slow" />
      </div>
    </section>
  );
};

export default memo(Hero);

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: '#0D0D0D', marginTop: '-80px', paddingTop: '80px' }}>

      {/* ── Video Background ── */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center center',
          filter: 'brightness(0.5)',
          zIndex: 0,
        }}
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-obsidian/80 via-obsidian/40 to-transparent" style={{ zIndex: 1 }} />
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 via-transparent to-transparent" style={{ zIndex: 1 }} />

      {/* Decorative gold orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-8 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #C9A84C, transparent)' }} />

      {/* ── Content ── */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 w-full" style={{ zIndex: 2 }}>
        <div className="max-w-2xl py-40">

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-gold-400 text-xs tracking-[0.45em] uppercase font-sans mb-6"
          >
            New Collection 2024
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="font-serif text-ivory leading-[1.08] mb-6"
            style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)', fontWeight: 300 }}
          >
            Indian Heritage.
            <br />
            <em className="gold-text not-italic">European</em>
            <br />
            Elegance.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-ivory/60 font-sans font-light text-lg leading-relaxed mb-10 max-w-md"
          >
            Premium Indo-European jewelry crafted between cultures.
            Where Jaipur's artisan hands meet Milan's refined eye.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-wrap gap-4"
          >
            <Link to="/products" className="btn-gold group">
              Shop Collection
              <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/about" className="btn-outline">
              Explore Story
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex gap-10 mt-16 pt-10 border-t border-ivory/10"
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
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-ivory/30 text-[9px] tracking-[0.4em] uppercase font-sans">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-px h-8 bg-gradient-to-b from-gold-400/60 to-transparent"
        />
      </motion.div>
    </section>
  );
};

export default Hero;

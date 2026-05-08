import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const BrandStory: React.FC = () => {
  return (
    <section className="py-28 px-6 bg-ivory overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">

          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div
              className="w-full aspect-[4/5] rounded-sm overflow-hidden"
              style={{ boxShadow: '20px 20px 60px rgba(0,0,0,0.12)' }}
            >
              <img
                src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80"
                alt="INDÉRA artisan crafting jewelry in Jaipur"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Offset accent image */}
            <div
              className="absolute -bottom-10 -right-10 w-48 h-48 rounded-sm overflow-hidden border-4 border-ivory"
              style={{ boxShadow: '10px 10px 40px rgba(0,0,0,0.15)' }}
            >
              <img
                src="https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=400&q=80"
                alt="INDÉRA Kundan jewelry detail"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Gold accent line */}
            <div className="absolute -left-6 top-1/4 w-1 h-32 bg-gold-gradient rounded-full" />
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="text-gold-500 text-[10px] tracking-[0.4em] uppercase font-sans mb-6">
              Our Story
            </p>
            <h2 className="font-serif text-obsidian text-5xl font-light leading-tight mb-8">
              Modern Indian Heritage
              <br />
              <em className="gold-text not-italic">Reimagined for Europe</em>
            </h2>
            <div className="section-divider mb-8" style={{ margin: '0 0 2rem 0' }} />

            <p className="text-obsidian/60 font-sans font-light text-base leading-relaxed mb-6">
              INDÉRA was born from a simple belief: that India's 5,000-year jewelry tradition
              deserves a place in the world's most discerning wardrobes — not as ethnic novelty,
              but as genuine luxury.
            </p>
            <p className="text-obsidian/60 font-sans font-light text-base leading-relaxed mb-10">
              We work directly with master craftsmen in Jaipur, Delhi, Mumbai, and Surat —
              families who have perfected Kundan, Meenakari, and Polki techniques across generations.
              Their hands. Our vision. Your heirloom.
            </p>

            <Link to="/about" className="btn-outline inline-flex">
              Read Our Story
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BrandStory;

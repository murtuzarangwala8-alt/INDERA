import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { useCategories, useProducts } from '../hooks/useProducts';

const Home: React.FC = () => {
  const products = useProducts();
  const categories = useCategories();

  const visibleProducts = useMemo(
    () => products.filter((product) => product.isActive !== false && !product.hidden),
    [products]
  );

  const newArrivals = useMemo(
    () => visibleProducts.filter((product) => product.isNew).slice(0, 4),
    [visibleProducts]
  );

  const bestsellers = useMemo(
    () => visibleProducts.filter((product) => product.isBestseller).slice(0, 4),
    [visibleProducts]
  );

  const categoryHighlights = categories.filter((category) => category.count !== 0).slice(0, 4);

  return (
    <div className="bg-ivory text-obsidian min-h-screen selection:bg-gold-300 selection:text-obsidian overflow-x-hidden">
      {/* Cinematic Fullscreen Hero */}
      <Hero />

      {/* Section 1: Signature Collections (Editorial-style Asymmetrical Cards) */}
      {categoryHighlights.length > 0 && (
        <section className="px-6 py-32 bg-ivory">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-xl mb-20">
              <span className="text-gold-500 text-[10px] tracking-[0.5em] uppercase font-sans block mb-4">Curations</span>
              <h2 className="font-serif text-obsidian text-4xl lg:text-6xl font-light leading-tight">Signature Collections</h2>
              <p className="text-obsidian/50 font-sans font-light text-sm mt-6 leading-relaxed">
                Explore the intricate intersection of heritage Indian metalwork and sleek European minimal design lines. Handcrafted to order.
              </p>
            </div>

            {/* Asymmetrical High Fashion Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-stretch">
              {categoryHighlights.map((category, idx) => {
                // Alternating column span for elegant editorial layout
                const colSpan = idx === 0 ? 'md:col-span-7' : idx === 1 ? 'md:col-span-5' : idx === 2 ? 'md:col-span-5' : 'md:col-span-7';
                
                return (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: idx * 0.1 }}
                    className={`${colSpan} group relative flex flex-col justify-end overflow-hidden bg-sand/10 border border-gold-400/10 rounded-sm`}
                    style={{ minHeight: '440px' }}
                  >
                    <Link to={`/products?category=${encodeURIComponent(category.name)}`} className="w-full h-full absolute inset-0 block z-10">
                      {/* Image container absolute to fill the card perfectly */}
                      <div className="absolute inset-0 w-full h-full overflow-hidden">
                        <img 
                          src={category.image} 
                          alt={category.name} 
                          className="w-full h-full object-cover transition-transform duration-[1.5s] ease-[0.16, 1, 0.3, 1] group-hover:scale-106 brightness-[0.88] group-hover:brightness-95" 
                        />
                        {/* Smooth luxury double gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-all duration-700 group-hover:via-black/30" />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700" />
                      </div>

                      {/* Inset Luxury Golden Border Frame - Cartier style */}
                      <div className="absolute inset-4 sm:inset-6 border border-gold-400/15 group-hover:border-gold-400/40 rounded-sm pointer-events-none transition-all duration-700 z-20" />

                      {/* Content block inside the inset margin */}
                      <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-10 z-30">
                        <span className="text-gold-400 text-[9px] sm:text-[10px] tracking-[0.4em] uppercase font-sans block mb-2 sm:mb-3">
                          Collection
                        </span>
                        <h3 className="font-serif text-ivory text-3xl sm:text-4xl font-light tracking-wide mb-1 transition-all duration-500 group-hover:text-gold-300 group-hover:translate-x-1">
                          {category.name}
                        </h3>
                        
                        {/* Animated Underline Trigger */}
                        <div className="flex items-center gap-2 text-ivory/70 group-hover:text-white transition-colors mt-5 text-[10px] sm:text-[11px] tracking-widest uppercase font-sans">
                          <span className="relative pb-1">
                            Explore Collection
                            <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-gold-400 group-hover:w-full transition-all duration-500 ease-out" />
                          </span>
                          <ArrowRight size={13} className="group-hover:translate-x-2 transition-transform duration-500 text-gold-400" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Section 2: Live Direct Products Rail */}
      {newArrivals.length > 0 && (
        <section className="px-6 py-32 bg-ivory">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
              <div>
                <span className="text-gold-500 text-[10px] tracking-[0.5em] uppercase font-sans block mb-3">Fresh Masterpieces</span>
                <h2 className="font-serif text-obsidian text-4xl lg:text-5xl font-light">New Arrivals</h2>
              </div>
              <Link to="/products" className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase font-sans text-gold-500 hover:text-gold-400 transition-all">
                View Catalog <ArrowRight size={14} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {newArrivals.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section 3: Curated Bestsellers Rail (Obsidian Luxury Mode) */}
      {bestsellers.length > 0 && (
        <section className="px-6 py-32 bg-obsidian text-ivory">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
              <div>
                <span className="text-gold-400 text-[10px] tracking-[0.5em] uppercase font-sans block mb-3">The Iconics</span>
                <h2 className="font-serif text-ivory text-4xl lg:text-5xl font-light">The Bestsellers</h2>
              </div>
              <Link to="/products" className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase font-sans text-gold-400 hover:text-gold-300 transition-all">
                Shop Icons <ArrowRight size={14} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {bestsellers.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;

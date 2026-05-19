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
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
              {categoryHighlights.map((category, idx) => {
                // Alternating column span for elegant editorial layout
                const colSpan = idx === 0 ? 'md:col-span-7' : idx === 1 ? 'md:col-span-5' : idx === 2 ? 'md:col-span-5' : 'md:col-span-7';
                const heightClass = idx % 2 === 0 ? 'aspect-[1.4/1] md:aspect-[1.5/1.1]' : 'aspect-[1/1.2]';
                
                return (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    className={`${colSpan} group relative flex flex-col justify-end overflow-hidden bg-sand/30 border border-gold-400/10 rounded-sm`}
                  >
                    <Link to={`/products?category=${encodeURIComponent(category.name)}`} className="w-full h-full relative block">
                      <div className={`w-full ${heightClass} overflow-hidden`}>
                        <img 
                          src={category.image} 
                          alt={category.name} 
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-obsidian/25 to-transparent transition-opacity duration-500 group-hover:from-obsidian" />
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                        <span className="text-gold-400 text-[9px] tracking-[0.35em] uppercase font-sans block mb-2">Collection</span>
                        <h3 className="font-serif text-ivory text-3xl font-light tracking-wide mb-1 transition-colors group-hover:text-gold-300">
                          {category.name}
                        </h3>
                        <div className="flex items-center gap-2 text-ivory/60 group-hover:text-ivory transition-colors mt-4 text-[10px] tracking-widest uppercase font-sans">
                          Explore Collection <ArrowRight size={12} className="group-hover:translate-x-1.5 transition-transform" />
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

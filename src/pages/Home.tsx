import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import TrustBadges from '../components/TrustBadges';
import BrandStory from '../components/BrandStory';
import Artisan from '../components/Artisan';
import Lookbook from '../components/Lookbook';
import Testimonials from '../components/Testimonials';
import Newsletter from '../components/Newsletter';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { ArrowRight } from 'lucide-react';

const Home: React.FC = () => {
  const products = useProducts();
  const featured = products.filter((p) => (p.isBestseller || p.isNew) && !p.hidden).slice(0, 4);

  return (
    <div className="bg-ivory">
      <Hero />
      <Categories />

      {/* Featured Products */}
      <section className="py-28 px-6 bg-ivory">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-14"
          >
            <div>
              <p className="text-gold-500 text-[10px] tracking-[0.4em] uppercase font-sans mb-3">
                Handpicked
              </p>
              <h2 className="font-serif text-obsidian text-5xl font-light">
                Featured Pieces
              </h2>
            </div>
            <Link
              to="/products"
              className="hidden sm:flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-sans text-gold-500 hover:text-gold-400 transition-colors"
            >
              View All <ArrowRight size={14} />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>

          <div className="text-center mt-12 sm:hidden">
            <Link to="/products" className="btn-outline">
              View All Collections
            </Link>
          </div>
        </div>
      </section>

      <TrustBadges />
      <BrandStory />
      <Artisan />
      <Lookbook />
      <Testimonials />
      <Newsletter />
    </div>
  );
};

export default Home;

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useCategories } from '../hooks/useProducts';

const Categories: React.FC = () => {
  const categories = useCategories();

  return (
    <section className="py-28 px-6 bg-ivory">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-gold-500 text-[10px] tracking-[0.4em] uppercase font-sans mb-4">
            Curated Collections
          </p>
          <h2 className="font-serif text-obsidian text-5xl font-light mb-4">
            Shop by Collection
          </h2>
          <div className="section-divider mt-6" />
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group block relative overflow-hidden rounded-sm aspect-[3/4]"
                style={{ border: '1px solid rgba(201,168,76,0.15)' }}
              >
                <img
                  src={cat.image}
                  alt={`${cat.name} collection by INDÉRA`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-obsidian/20 to-transparent" />
                <div className="absolute inset-0 bg-gold-400/0 group-hover:bg-gold-400/10 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-ivory font-serif text-base font-light leading-tight mb-1">{cat.name}</p>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-gold-400 text-[9px] tracking-widest uppercase font-sans">Explore</span>
                    <ArrowRight size={10} className="text-gold-400" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;

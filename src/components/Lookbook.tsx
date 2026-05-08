import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const lookbookItems = [
  {
    image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=80',
    title: 'The Bridal Edit',
    subtitle: 'Festival Luxury Sets',
    size: 'large',
  },
  {
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
    title: 'Everyday Minimal',
    subtitle: 'Minimal Jhumkas',
    size: 'small',
  },
  {
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
    title: 'Pearl Season',
    subtitle: 'Pearl Fusion',
    size: 'small',
  },
  {
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
    title: 'Statement Pieces',
    subtitle: 'Indo-European Necklaces',
    size: 'medium',
  },
];

const Lookbook: React.FC = () => {
  return (
    <section className="py-28 px-6 bg-sand/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-gold-500 text-[10px] tracking-[0.4em] uppercase font-sans mb-4">
            Editorial
          </p>
          <h2 className="font-serif text-obsidian text-5xl font-light mb-4">
            The Lookbook
          </h2>
          <div className="section-divider mt-6" />
        </motion.div>

        {/* Editorial Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[280px]">
          {/* Large feature */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="col-span-2 lg:col-span-1 lg:row-span-2 group relative overflow-hidden rounded-sm cursor-pointer"
          >
            <img
              src={lookbookItems[0].image}
              alt={lookbookItems[0].title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <p className="text-gold-400 text-[9px] tracking-widest uppercase font-sans mb-1">{lookbookItems[0].subtitle}</p>
              <h3 className="font-serif text-ivory text-2xl font-light">{lookbookItems[0].title}</h3>
            </div>
          </motion.div>

          {[lookbookItems[1], lookbookItems[2], lookbookItems[3]].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: (i + 1) * 0.1 }}
              className="group relative overflow-hidden rounded-sm cursor-pointer"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <p className="text-gold-400 text-[9px] tracking-widest uppercase font-sans mb-0.5">{item.subtitle}</p>
                <h3 className="font-serif text-ivory text-lg font-light">{item.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link to="/products" className="btn-outline">
            Shop the Lookbook
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Lookbook;

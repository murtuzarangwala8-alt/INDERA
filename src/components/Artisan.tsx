import React from 'react';
import { motion } from 'framer-motion';

const cities = [
  {
    city: 'Jaipur',
    craft: 'Kundan & Polki',
    desc: "The Pink City's gem-setters have perfected Kundan inlay for 400 years. Our Jaipur partners create each stone setting by hand, one gem at a time.",
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
  },
  {
    city: 'Delhi',
    craft: 'Meenakari Enamel',
    desc: "Delhi's Meenakari masters paint molten enamel onto gold with brushes finer than a single hair. Each piece takes up to three days to complete.",
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
  },
  {
    city: 'Mumbai',
    craft: 'Gold Smithing',
    desc: "Mumbai's Zaveri Bazaar artisans bring centuries of gold-smithing expertise. Our partners specialise in the delicate filigree work that defines INDÉRA necklaces.",
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
  },
  {
    city: 'Surat',
    craft: 'Pearl Setting',
    desc: "Surat is India's pearl capital. Our artisans source and hand-set South Sea and freshwater pearls with a precision that rivals the finest European ateliers.",
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
  },
];

const Artisan: React.FC = () => {
  return (
    <section className="py-28 px-6 bg-obsidian">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-gold-400 text-[10px] tracking-[0.4em] uppercase font-sans mb-4">
            Crafted Across India
          </p>
          <h2 className="font-serif text-ivory text-5xl font-light mb-4">
            Four Cities. One Vision.
          </h2>
          <div className="section-divider mt-6" />
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cities.map((c, i) => (
            <motion.div
              key={c.city}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="group relative overflow-hidden rounded-sm"
              style={{ border: '1px solid rgba(201,168,76,0.1)' }}
            >
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={c.image}
                  alt={`${c.craft} artisans in ${c.city}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-gold-400 text-[9px] tracking-[0.3em] uppercase font-sans mb-1">
                  {c.craft}
                </p>
                <h3 className="font-serif text-ivory text-2xl font-light mb-2">{c.city}</h3>
                <p className="text-ivory/50 text-xs font-sans leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-400 max-h-0 group-hover:max-h-24 overflow-hidden">
                  {c.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Artisan;

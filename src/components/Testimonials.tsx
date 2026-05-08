import React from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Priya Sharma',
    location: 'Amsterdam, Netherlands',
    text: 'I wore my Chandni Jhumkas to a gallery opening in Amsterdam and received more compliments than I ever have. They feel like wearable art — Indian soul, European polish.',
    rating: 5,
    product: 'Chandni Minimal Jhumkas',
  },
  {
    name: 'Sophie Laurent',
    location: 'Paris, France',
    text: 'As a French woman with no Indian heritage, I was nervous about wearing Kundan jewelry. INDÉRA made it feel completely natural — sophisticated, not costume-y.',
    rating: 5,
    product: 'Milano Kundan Collar',
  },
  {
    name: 'Ananya Krishnan',
    location: 'London, UK',
    text: 'Finally a brand that understands the Indian diaspora experience. I can wear these to my corporate job in the City and to my cousin\'s wedding in Chennai.',
    rating: 5,
    product: 'Riviera Pearl Drop Earrings',
  },
  {
    name: 'Isabella Rossi',
    location: 'Milan, Italy',
    text: 'The craftsmanship is extraordinary. I work in fashion and I can tell immediately when something is made with real skill. INDÉRA is the real thing.',
    rating: 5,
    product: 'Baroque Pearl Choker',
  },
];

const Testimonials: React.FC = () => {
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
            Client Stories
          </p>
          <h2 className="font-serif text-obsidian text-5xl font-light mb-4">
            Worn Across Europe
          </h2>
          <div className="section-divider mt-6" />
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card rounded-sm p-6 flex flex-col"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <span key={j} className="text-gold-400 text-sm">★</span>
                ))}
              </div>
              <p className="text-obsidian/70 font-sans font-light text-sm leading-relaxed flex-1 mb-6 italic">
                "{t.text}"
              </p>
              <div>
                <p className="font-serif text-obsidian text-base">{t.name}</p>
                <p className="text-obsidian/40 text-[10px] tracking-widest uppercase font-sans mt-0.5">
                  {t.location}
                </p>
                <p className="text-gold-500 text-[9px] tracking-widest uppercase font-sans mt-2">
                  {t.product}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
